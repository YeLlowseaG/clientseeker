import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SubscriptionService } from '@/services/subscription';
import { findUserByEmail } from '@/models/user';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [User Subscription] Get user subscription API called");
    
    // 验证用户会话
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'Unauthorized',
        hasActiveSubscription: false
      }, { status: 401 });
    }

    console.log("🔍 [User Subscription] Checking subscription for user:", session.user.email);

    // 获取用户信息
    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        hasActiveSubscription: false
      }, { status: 404 });
    }

    // 获取用户活跃订阅
    const subscription = await SubscriptionService.getUserActiveSubscription(user.uuid);
    
    if (!subscription) {
      console.log("🔍 [User Subscription] No active subscription found");
      return NextResponse.json({
        hasActiveSubscription: false,
        productId: 'none',
        productName: 'No Active Subscription',
        creditsRemaining: 0,
        creditsTotal: 0,
        creditsUsed: 0,
        periodEnd: null,
        status: 'inactive'
      });
    }

    console.log("🔍 [User Subscription] Active subscription found:", {
      productId: subscription.product_id,
      creditsRemaining: subscription.credits_remaining,
      creditsTotal: subscription.credits_total
    });

    return NextResponse.json({
      hasActiveSubscription: true,
      productId: subscription.product_id,
      productName: subscription.product_name,
      creditsRemaining: subscription.credits_remaining,
      creditsTotal: subscription.credits_total,
      creditsUsed: subscription.credits_used,
      periodEnd: subscription.period_end,
      status: subscription.status
    });

  } catch (error: any) {
    console.error('🔍 [User Subscription] Error getting user subscription:', error);
    console.error('🔍 [User Subscription] Error message:', error.message);
    
    return NextResponse.json({
      error: 'Internal server error',
      hasActiveSubscription: false,
      message: error.message
    }, { status: 500 });
  }
}