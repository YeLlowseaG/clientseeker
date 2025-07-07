"use client";

import React, { useState, useEffect } from "react";
import { Calendar, CreditCard, Target, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "next-intl";

interface UserSubscription {
  id: number;
  user_uuid: string;
  product_id: string;
  product_name: string;
  status: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  period_start: Date | null;
  period_end: Date | null;
  stripe_subscription_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface SubscriptionStatusProps {
  userEmail: string;
}

export default function SubscriptionStatus({ userEmail }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [userEmail]);

  const fetchSubscriptionStatus = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US');
  };

  const getProductDisplayName = (productId: string) => {
    const productNames = {
      'free': locale === 'zh' ? '免费试用' : 'Free Trial',
      'monthly': locale === 'zh' ? '单月套餐' : 'Monthly Plan',
      'annual': locale === 'zh' ? '年度套餐' : 'Annual Plan',
      'enterprise': locale === 'zh' ? '企业套餐' : 'Enterprise Plan'
    };
    return productNames[productId as keyof typeof productNames] || productId;
  };

  const getDaysRemaining = (endDate: Date | string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.credits_total === -1) return 0;
    if (subscription.credits_total === 0) return 0;
    return Math.round((subscription.credits_used / subscription.credits_total) * 100);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            {locale === 'zh' ? '正在加载订阅状态...' : 'Loading subscription status...'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!subscription || subscription.product_id === 'free') {
    return null; // 免费用户不显示状态条
  }

  const daysRemaining = getDaysRemaining(subscription.period_end);
  const usagePercentage = getUsagePercentage();

  return (
    <div className="mb-8">
      <Alert className="border-blue-200 bg-blue-50">
        <CreditCard className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-medium text-blue-800">
                  {locale === 'zh' ? '当前订阅：' : 'Current Subscription: '}
                </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getProductDisplayName(subscription.product_id)}
                </Badge>
                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {locale === 'zh' ? `${daysRemaining}天后到期` : `${daysRemaining} days left`}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {locale === 'zh' ? '到期：' : 'Expires: '}
                    {formatDate(subscription.period_end)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>
                    {locale === 'zh' ? '剩余：' : 'Remaining: '}
                    {subscription.credits_remaining === -1 
                      ? (locale === 'zh' ? '无限制' : 'Unlimited')
                      : subscription.credits_remaining
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}