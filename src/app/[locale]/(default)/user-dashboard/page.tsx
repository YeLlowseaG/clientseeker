"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { User, Search, CreditCard, Settings } from "lucide-react";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const [quotaInfo, setQuotaInfo] = useState({
    remaining: 0,
    total: 100,
    used: 0,
    plan: "免费版"
  });

  useEffect(() => {
    if (status === "loading") return;
    
    // 简单的数据获取，不做复杂重定向
    if (session) {
      fetchUserData();
    }
  }, [session, status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (response.ok) {
        const data = await response.json();
        setQuotaInfo({
          remaining: data.creditsRemaining || 0,
          total: data.creditsTotal || 100,
          used: data.creditsUsed || 0,
          plan: data.productName || "免费版"
        });
      }
    } catch (error) {
      console.log("Failed to fetch user data:", error);
      // 不做任何重定向，保持在页面上
    }
  };

  // 如果还在加载，显示加载状态
  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 如果未登录，显示提示但不重定向
  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">请先登录</h1>
        <p className="text-gray-600 mb-4">您需要登录才能查看用户中心</p>
        <Button onClick={() => window.location.href = "/"}>
          返回首页
        </Button>
      </div>
    );
  }

  const usagePercentage = quotaInfo.total > 0 ? (quotaInfo.used / quotaInfo.total) * 100 : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">用户中心</h1>
        <p className="text-gray-600 mt-2">欢迎回来，{session.user?.name || session.user?.email}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 当前套餐 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前套餐</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{quotaInfo.plan}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 剩余搜索次数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">剩余搜索</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaInfo.remaining}</div>
            <p className="text-xs text-muted-foreground">
              总共 {quotaInfo.total} 次
            </p>
          </CardContent>
        </Card>

        {/* 已使用次数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已使用</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaInfo.used}</div>
            <p className="text-xs text-muted-foreground">
              使用率 {usagePercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 使用情况详情 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>使用详情</CardTitle>
          <CardDescription>您的搜索配额使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>搜索配额使用情况</span>
              <span>{quotaInfo.used} / {quotaInfo.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {quotaInfo.remaining <= 5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    搜索次数不足
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    您的搜索次数即将用完，建议升级套餐以获得更多搜索配额。
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.href = "/pricing"}
                  >
                    立即升级
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快捷入口</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/search"}
              className="justify-start"
            >
              <Search className="mr-2 h-4 w-4" />
              开始搜索客户
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/pricing"}
              className="justify-start"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              升级套餐
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}