import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, wechatData, existingUserId } = await request.json();

    if (!email || !wechatData || !existingUserId) {
      return NextResponse.json({
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    console.log('Linking WeChat account to existing user:', {
      email,
      existingUserId,
      wechatNickname: wechatData.nickname
    });

    // 获取现有用户信息
    const existingUsers = await db()
      .select()
      .from(users)
      .where(eq(users.uuid, existingUserId))
      .limit(1);

    if (existingUsers.length === 0) {
      return NextResponse.json({
        error: 'Existing user not found'
      }, { status: 404 });
    }

    const existingUser = existingUsers[0];

    // 更新现有用户信息，合并微信数据
    const updatedUser = await db()
      .update(users)
      .set({
        // 保留原有邮箱和核心信息
        // 可以选择性更新头像（如果原来没有的话）
        avatar_url: existingUser.avatar_url || wechatData.headimgurl,
        // 保存微信openid到signin_openid字段，用于后续识别
        signin_openid: wechatData.openid,
        signin_provider: 'wechat',
        updated_at: new Date(),
      })
      .where(eq(users.uuid, existingUserId))
      .returning();

    if (updatedUser.length === 0) {
      throw new Error('Failed to update user');
    }

    // 创建一个关联记录（可选，用于追踪不同登录方式）
    // 这里可以创建一个单独的表来记录用户的多种登录方式
    // 暂时先在控制台记录
    console.log('Account linking completed:', {
      userId: existingUserId,
      originalEmail: existingUser.email,
      wechatOpenid: wechatData.openid,
      wechatNickname: wechatData.nickname
    });

    // 返回合并后的用户信息
    const finalUser = {
      uuid: updatedUser[0].uuid,
      email: updatedUser[0].email,
      nickname: updatedUser[0].nickname || wechatData.nickname,
      avatar_url: updatedUser[0].avatar_url,
      created_at: updatedUser[0].created_at,
      updated_at: updatedUser[0].updated_at,
      // 添加标记表示这是一个已关联的账户
      linked_accounts: ['google', 'wechat']
    };

    return NextResponse.json({
      success: true,
      user: finalUser,
      message: 'Accounts linked successfully'
    });

  } catch (error: any) {
    console.error('Link accounts error:', error);
    
    return NextResponse.json({
      error: 'Failed to link accounts',
      message: error.message
    }, { status: 500 });
  }
}