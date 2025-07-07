"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

interface SubscriptionWarningProps {
  userEmail: string;
  newProductId: string;
  newProductName: string;
  onClose: () => void;
}

export default function SubscriptionWarning({ 
  userEmail, 
  newProductId, 
  newProductName, 
  onClose 
}: SubscriptionWarningProps) {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const locale = useLocale();

  const checkCurrentSubscription = async () => {
    if (checked) return;
    
    setLoading(true);
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
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  // 检查是否需要显示警告
  React.useEffect(() => {
    checkCurrentSubscription();
  }, []);

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

  if (loading) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          {locale === 'zh' ? '正在检查您的订阅状态...' : 'Checking your subscription status...'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentSubscription) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          {locale === 'zh' ? '您当前没有活跃的订阅。' : 'You currently have no active subscription.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="space-y-3">
        <div className="font-medium text-orange-800">
          {locale === 'zh' ? '重复购买提醒' : 'Duplicate Purchase Reminder'}
        </div>
        
        <div className="text-sm text-orange-700 space-y-2">
          <div>
            {locale === 'zh' ? '您已购买了以下套餐：' : 'You have already purchased the following plan:'}
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">{locale === 'zh' ? '套餐：' : 'Plan:'}</span>
                <span>{getProductDisplayName(currentSubscription.product_id)}</span>
              </div>
              <div>
                <span className="font-medium">{locale === 'zh' ? '到期日：' : 'Expires:'}</span>
                <span>{formatDate(currentSubscription.period_end)}</span>
              </div>
              <div>
                <span className="font-medium">{locale === 'zh' ? '剩余次数：' : 'Remaining:'}</span>
                <span>
                  {currentSubscription.credits_remaining === -1 
                    ? (locale === 'zh' ? '无限制' : 'Unlimited')
                    : currentSubscription.credits_remaining
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">{locale === 'zh' ? '状态：' : 'Status:'}</span>
                <span className="text-green-600">{locale === 'zh' ? '活跃' : 'Active'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 font-medium text-sm mb-2">
              {locale === 'zh' ? '⏰ 到期时间提醒' : '⏰ Expiry Reminder'}
            </div>
            <div className="text-blue-700 text-sm">
              {locale === 'zh' 
                ? `您的套餐将于 ${formatDate(currentSubscription?.period_end)} 到期，此期间请勿重复购买。`
                : `Your plan will expire on ${formatDate(currentSubscription?.period_end)}. Please do not purchase again during this period.`
              }
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onClose}
            size="sm"
            className="w-full"
          >
            {locale === 'zh' ? '确定' : 'OK'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}