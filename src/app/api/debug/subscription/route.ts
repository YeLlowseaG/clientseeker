import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { subscriptions, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { findUserByEmail } from '@/models/user';

export async function GET(request: NextRequest) {
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

    // 获取用户所有订阅记录
    const userSubscriptions = await db()
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_uuid, user.uuid))
      .orderBy(subscriptions.created_at);

    // 获取用户所有订单记录
    const userOrders = await db()
      .select()
      .from(orders)
      .where(eq(orders.user_email, user.email))
      .orderBy(orders.created_at);

    return NextResponse.json({
      user: {
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname
      },
      subscriptions: userSubscriptions,
      orders: userOrders,
      debug_info: {
        subscriptions_count: userSubscriptions.length,
        orders_count: userOrders.length,
        completed_orders: userOrders.filter(o => o.status === 'completed').length,
        active_subscriptions: userSubscriptions.filter(s => s.status === 'active').length
      }
    });

  } catch (error: any) {
    console.error('Debug subscription error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}