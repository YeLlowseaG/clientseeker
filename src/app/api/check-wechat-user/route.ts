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
    // 优先检查signin_openid字段，这是关联微信账户的正确方式
    
    const linkedUsers = await db()
      .select()
      .from(users)
      .where(
        eq(users.signin_openid, openid)
      )
      .limit(1);

    // 如果没找到，再检查是否有旧的uuid或假邮箱格式的用户
    let alternativeUsers: any[] = [];
    if (linkedUsers.length === 0) {
      // 检查uuid字段 (可能是旧的实现)
      const uuidUsers = await db()
        .select()
        .from(users)
        .where(
          eq(users.uuid, openid)
        )
        .limit(1);
      
      if (uuidUsers.length === 0) {
        // 检查假邮箱格式
        const fakeEmail = `${openid}@wechat.user`;
        alternativeUsers = await db()
          .select()
          .from(users)
          .where(
            eq(users.email, fakeEmail)
          )
          .limit(1);
      } else {
        alternativeUsers = uuidUsers;
      }
    }

    const foundUser = linkedUsers[0] || alternativeUsers[0];

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