import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, orders, subscriptions, credits } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 安全检查 - 只在开发环境或特定条件下允许访问
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    
    // 你可以设置一个临时密码来保护这个API
    if (secret !== 'your-admin-secret-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = url.searchParams.get('type') || 'summary';

    switch (type) {
      case 'users':
        const allUsers = await db().select().from(users).orderBy(desc(users.created_at)).limit(50);
        return NextResponse.json({ data: allUsers, count: allUsers.length });

      case 'orders':
        const allOrders = await db().select().from(orders).orderBy(desc(orders.created_at)).limit(50);
        return NextResponse.json({ data: allOrders, count: allOrders.length });

      case 'subscriptions':
        const allSubscriptions = await db().select().from(subscriptions).orderBy(desc(subscriptions.created_at)).limit(50);
        return NextResponse.json({ data: allSubscriptions, count: allSubscriptions.length });

      case 'credits':
        const allCredits = await db().select().from(credits).orderBy(desc(credits.created_at)).limit(50);
        return NextResponse.json({ data: allCredits, count: allCredits.length });

      default:
        // 返回数据概要
        const [userCount] = await db().select().from(users);
        const [orderCount] = await db().select().from(orders);
        const [subscriptionCount] = await db().select().from(subscriptions);
        const [creditCount] = await db().select().from(credits);

        const recentOrders = await db().select().from(orders).orderBy(desc(orders.created_at)).limit(10);
        const activeSubscriptions = await db().select().from(subscriptions).orderBy(desc(subscriptions.created_at)).limit(10);

        return NextResponse.json({
          summary: {
            users: userCount ? 1 : 0,
            orders: orderCount ? 1 : 0,
            subscriptions: subscriptionCount ? 1 : 0,
            credits: creditCount ? 1 : 0,
          },
          recentOrders,
          activeSubscriptions
        });
    }

  } catch (error: any) {
    console.error('Admin data API error:', error);
    return NextResponse.json({
      error: 'Database query failed',
      message: error.message
    }, { status: 500 });
  }
}