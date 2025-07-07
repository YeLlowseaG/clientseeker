"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface DebugData {
  user: {
    uuid: string;
    email: string;
    nickname: string;
  };
  subscriptions: any[];
  orders: any[];
  debug_info: {
    subscriptions_count: number;
    orders_count: number;
    completed_orders: number;
    active_subscriptions: number;
  };
}

export default function DebugSubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }

    fetchDebugData();
  }, [session, status, router]);

  const fetchDebugData = async () => {
    try {
      const response = await fetch("/api/debug/subscription");
      if (response.ok) {
        const data = await response.json();
        setDebugData(data);
      }
    } catch (error) {
      console.error("Failed to fetch debug data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async () => {
    setActivating(true);
    setMessage("");
    
    try {
      const response = await fetch("/api/debug/activate-subscription", {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ 订阅激活成功! 产品: ${result.order.product_name}`);
        // 刷新数据
        await fetchDebugData();
      } else {
        setMessage(`❌ 激活失败: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ 请求失败，请重试");
      console.error("Activation error:", error);
    } finally {
      setActivating(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || !debugData) {
    return null;
  }

  const completedOrders = debugData.orders.filter(o => o.status === 'completed');
  const latestCompletedOrder = completedOrders[completedOrders.length - 1];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">订阅调试页面</h1>
        <p className="text-gray-600 mt-2">查看和管理订阅状态</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 用户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>邮箱:</strong> {debugData.user.email}</div>
            <div><strong>昵称:</strong> {debugData.user.nickname}</div>
            <div><strong>UUID:</strong> {debugData.user.uuid}</div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>总订单数:</strong> {debugData.debug_info.orders_count}</div>
            <div><strong>已完成订单:</strong> {debugData.debug_info.completed_orders}</div>
            <div><strong>活跃订阅:</strong> {debugData.debug_info.active_subscriptions}</div>
            <div><strong>订阅总数:</strong> {debugData.debug_info.subscriptions_count}</div>
          </CardContent>
        </Card>
      </div>

      {/* 激活按钮 */}
      {latestCompletedOrder && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>手动激活订阅</CardTitle>
            <CardDescription>
              检测到已完成的订单，但可能订阅激活失败。点击下方按钮手动激活最新订单的订阅。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div><strong>最新已完成订单:</strong></div>
              <div>订单号: {latestCompletedOrder.order_no}</div>
              <div>产品: {latestCompletedOrder.product_name}</div>
              <div>金额: ¥{(latestCompletedOrder.amount / 100).toFixed(2)}</div>
              <div>产品ID: {latestCompletedOrder.product_id}</div>
            </div>
            <Button 
              onClick={activateSubscription}
              disabled={activating}
              className="w-full"
            >
              {activating ? "激活中..." : "手动激活订阅"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 当前订阅 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>当前订阅</CardTitle>
        </CardHeader>
        <CardContent>
          {debugData.subscriptions.length > 0 ? (
            <div className="space-y-4">
              {debugData.subscriptions.map((sub, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{sub.product_name}</div>
                      <div className="text-sm text-gray-600">产品ID: {sub.product_id}</div>
                    </div>
                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                      {sub.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>总配额: {sub.credits_total === -1 ? '无限制' : sub.credits_total}</div>
                    <div>已使用: {sub.credits_used}</div>
                    <div>剩余: {sub.credits_remaining === -1 ? '无限制' : sub.credits_remaining}</div>
                    <div>有效期至: {new Date(sub.period_end).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">没有订阅记录</p>
          )}
        </CardContent>
      </Card>

      {/* 最近订单 */}
      <Card>
        <CardHeader>
          <CardTitle>最近订单 (最多显示5个)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debugData.orders.slice(-5).reverse().map((order, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">订单 #{order.order_no}</div>
                    <div className="text-sm text-gray-600">{order.product_name}</div>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>金额: ¥{(order.amount / 100).toFixed(2)}</div>
                  <div>产品ID: {order.product_id}</div>
                  <div>创建时间: {new Date(order.created_at).toLocaleString()}</div>
                  <div>货币: {order.currency}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}