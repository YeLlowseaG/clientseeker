import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { findUserByEmail } from '@/models/user';
import { SubscriptionService } from '@/services/subscription';

export async function POST(request: NextRequest) {
  try {
    // 验证用户会话
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // 获取用户信息
    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    // 查找最近的已完成订单
    const completedOrders = await db()
      .select()
      .from(orders)
      .where(and(
        eq(orders.user_email, user.email),
        eq(orders.status, 'completed')
      ))
      .orderBy(orders.created_at)
      .limit(5);

    if (completedOrders.length === 0) {
      return NextResponse.json({
        error: 'No completed orders found'
      }, { status: 404 });
    }

    // 获取最新的订单
    const latestOrder = completedOrders[completedOrders.length - 1];

    // 手动激活订阅
    const activationSuccess = await SubscriptionService.activateSubscriptionFromOrder({
      user_uuid: user.uuid,
      user_email: user.email,
      order_no: latestOrder.order_no,
      product_id: latestOrder.product_id || 'monthly',
      product_name: latestOrder.product_name || 'ClientSeeker Monthly Plan',
      credits: latestOrder.credits || 100,
      valid_months: latestOrder.valid_months || 1,
      amount: latestOrder.amount,
    });

    if (activationSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Subscription activated successfully',
        order: {
          order_no: latestOrder.order_no,
          product_id: latestOrder.product_id,
          product_name: latestOrder.product_name,
          credits: latestOrder.credits,
          valid_months: latestOrder.valid_months
        }
      });
    } else {
      return NextResponse.json({
        error: 'Failed to activate subscription'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Manual activation error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}