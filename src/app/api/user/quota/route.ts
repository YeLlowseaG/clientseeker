import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SubscriptionService } from '@/services/subscription';

export async function GET(request: NextRequest) {
  try {
    // 检查用户身份验证
    const session = await auth();
    if (!session?.user?.uuid) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const userUuid = session.user.uuid;

    // 获取用户配额信息
    const quotaInfo = await SubscriptionService.checkUserQuota(userUuid);
    const subscription = await SubscriptionService.getUserActiveSubscription(userUuid);

    return NextResponse.json({
      remaining: quotaInfo.remaining,
      total: quotaInfo.total,
      used: quotaInfo.used,
      productId: quotaInfo.productId,
      productName: subscription?.product_name,
      periodEnd: subscription?.period_end,
      success: true
    });
  } catch (error) {
    console.error('User quota API error:', error);
    return NextResponse.json({
      error: 'Failed to get user quota',
      success: false
    }, { status: 500 });
  }
}