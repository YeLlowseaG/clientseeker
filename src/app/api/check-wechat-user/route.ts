import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const openid = searchParams.get('openid');

    if (!openid) {
      return NextResponse.json({
        error: 'Openid parameter is required'
      }, { status: 400 });
    }

    console.log('Checking WeChat openid existence:', openid);

    // 检查openid是否已经关联到某个用户
    // 我们需要检查两种情况：
    // 1. uuid字段直接是openid (新的微信用户)
    // 2. 或者email字段包含这个openid (旧的假邮箱用户)
    
    const existingUsers = await db()
      .select()
      .from(users)
      .where(
        eq(users.uuid, openid)
      )
      .limit(1);

    // 如果没找到，再检查是否有假邮箱格式的用户
    let alternativeUsers: any[] = [];
    if (existingUsers.length === 0) {
      const fakeEmail = `${openid}@wechat.user`;
      alternativeUsers = await db()
        .select()
        .from(users)
        .where(
          eq(users.email, fakeEmail)
        )
        .limit(1);
    }

    const foundUser = existingUsers[0] || alternativeUsers[0];

    return NextResponse.json({
      exists: !!foundUser,
      email: foundUser?.email || null,
      userId: foundUser?.uuid || null,
      openid: openid
    });

  } catch (error: any) {
    console.error('Check WeChat user error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}