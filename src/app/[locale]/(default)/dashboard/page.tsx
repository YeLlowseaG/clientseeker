"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/contexts/app";
import { Search, CreditCard, Calendar, TrendingUp } from "lucide-react";

interface QuotaInfo {
  remaining: number;
  total: number;
  used: number;
  productId: string;
  productName?: string;
  periodEnd?: string;
}

export default function DashboardPage() {
  const { user, isUserLoading } = useAppContext();
  const t = useTranslations();
  const router = useRouter();
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    fetchQuotaInfo();
  }, [user, isUserLoading, router]);

  const fetchQuotaInfo = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveSubscription) {
          setQuotaInfo({
            remaining: data.creditsRemaining,
            total: data.creditsTotal,
            used: data.creditsUsed,
            productId: data.productId,
            productName: data.productName,
            periodEnd: data.periodEnd
          });
        } else {
          // 没有活跃订阅，显示免费版信息
          setQuotaInfo({
            remaining: 0,
            total: 10,
            used: 10,
            productId: "free",
            productName: "Free Trial"
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch quota info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className="container mx-auto py-8">
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

  if (!user) {
    return null;
  }

  const usagePercentage = quotaInfo ? (quotaInfo.used / quotaInfo.total) * 100 : 0;

  const getProductDisplayName = (productId: string) => {
    const productNames = {
      free: t('products.free'),
      monthly: t('products.monthly'), 
      annual: t('products.annual'),
      enterprise: t('products.enterprise')
    };
    return productNames[productId as keyof typeof productNames] || productId;
  };

  const getProductBadgeVariant = (productId: string) => {
    const variants = {
      free: "secondary" as const,
      monthly: "default" as const,
      annual: "destructive" as const, 
      enterprise: "outline" as const
    };
    return variants[productId as keyof typeof variants] || "default";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.page_title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.page_description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 当前套餐 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.current_plan')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getProductBadgeVariant(quotaInfo?.productId || "free")}>
                {getProductDisplayName(quotaInfo?.productId || "free")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 剩余搜索次数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.remaining_searches')}</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotaInfo?.productId === 'enterprise' ? '无限制' : (quotaInfo?.remaining || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {quotaInfo?.productId === 'enterprise' ? t('dashboard.enterprise_plan_name') : t('dashboard.total_count', { total: quotaInfo?.total || 0 })}
            </p>
          </CardContent>
        </Card>

        {/* 使用统计 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.usage_statistics')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaInfo?.used || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.used', { percentage: usagePercentage.toFixed(1) })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 配额详情 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>配额详情</CardTitle>
          <CardDescription>查看您的搜索配额使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>搜索配额使用情况</span>
              <span>{quotaInfo?.used || 0} / {quotaInfo?.total || 0}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          
          {quotaInfo?.productId === "free" && quotaInfo.remaining <= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    免费试用即将用完
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    您的免费搜索次数即将用完，升级到付费套餐以获得更多搜索配额。
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => router.push("/pricing")}
                  >
                    立即升级
                  </Button>
                </div>
              </div>
            </div>
          )}

          {quotaInfo?.productId !== "free" && quotaInfo?.remaining === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    搜索配额已用完
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    本月搜索配额已用完，请等待下月自动续费或联系客服。
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>账户信息</CardTitle>
          <CardDescription>您的 ClientSeeker 账户详情</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">邮箱</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">用户名</label>
              <p className="text-sm text-gray-900">{user.nickname || "未设置"}</p>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4 border-t">
            <Button 
              variant="outline"
              onClick={() => router.push("/pricing")}
            >
              升级套餐
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/search")}
            >
              开始搜索
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}