import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/user';
import { SubscriptionService } from '@/services/subscription';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({
        error: 'User email is required',
        success: false
      }, { status: 400 });
    }

    // 查找用户
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        success: false
      }, { status: 404 });
    }

    // 获取用户当前活跃订阅
    const activeSubscription = await SubscriptionService.getUserActiveSubscription(user.uuid);

    return NextResponse.json({
      subscription: activeSubscription,
      success: true
    });

  } catch (error) {
    console.error('Subscription status API error:', error);
    return NextResponse.json({
      error: 'Failed to check subscription status',
      success: false
    }, { status: 500 });
  }
}