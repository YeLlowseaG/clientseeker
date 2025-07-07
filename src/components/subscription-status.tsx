"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  productId: string;
  productName: string;
  creditsRemaining: number;
  creditsTotal: number;
  creditsUsed: number;
  periodEnd: string | null;
  status: string;
}

export default function SubscriptionStatus() {
  const { data: session } = useSession();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionInfo = async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
  }, [session]);

  // 监听订阅更新事件
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      fetchSubscriptionInfo();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please sign in to view your subscription</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo?.hasActiveSubscription) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">No active subscription</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Choose a plan to get started</p>
        </CardContent>
      </Card>
    );
  }

  const getPlanBadgeVariant = (productId: string) => {
    switch (productId) {
      case 'free': return 'secondary';
      case 'monthly': return 'default';
      case 'annual': return 'default';
      case 'enterprise': return 'default';
      default: return 'secondary';
    }
  };

  const getPlanDisplayName = (productId: string) => {
    switch (productId) {
      case 'free': return 'Trial';
      case 'monthly': return 'Monthly Plan';
      case 'annual': return 'Annual Plan';
      case 'enterprise': return 'Enterprise Plan';
      default: return productId;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Subscription Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Plan:</span>
          <Badge variant={getPlanBadgeVariant(subscriptionInfo.productId)}>
            {getPlanDisplayName(subscriptionInfo.productId)}
          </Badge>
        </div>

        {subscriptionInfo.creditsTotal !== -1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Searches Remaining:</span>
              <span className="font-medium">
                {subscriptionInfo.creditsRemaining} / {subscriptionInfo.creditsTotal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(subscriptionInfo.creditsRemaining / subscriptionInfo.creditsTotal) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {subscriptionInfo.creditsTotal === -1 && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Unlimited Searches</span>
          </div>
        )}

        {subscriptionInfo.periodEnd && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Expires:</span>
            </div>
            <span>{formatDate(subscriptionInfo.periodEnd)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}