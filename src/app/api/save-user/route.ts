import { NextRequest, NextResponse } from 'next/server';
import { saveUser } from '@/services/user';
import { findUserByEmail, insertUser } from '@/models/user';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [Save User API] Starting user save process");
    const body = await request.json();
    console.log("🔍 [Save User API] Request body:", body);
    
    const { uuid, email, nickname, avatar_url, created_at } = body;

    if (!email || !uuid) {
      console.error("🔍 [Save User API] Missing required fields:", { email: !!email, uuid: !!uuid });
      return NextResponse.json({
        error: 'Email and UUID are required',
        success: false
      }, { status: 400 });
    }

    const user: User = {
      uuid,
      email,
      nickname: nickname || email.split('@')[0],
      avatar_url: avatar_url || '',
      created_at: created_at || new Date().toISOString(),
    };

    console.log("🔍 [Save User API] User object to save:", user);
    
    // 先检查用户是否已存在
    const existingUser = await findUserByEmail(email);
    let savedUser;
    
    if (existingUser) {
      console.log("🔍 [Save User API] User already exists:", existingUser.email);
      savedUser = existingUser;
    } else {
      console.log("🔍 [Save User API] Creating new user...");
      // 直接调用 insertUser，绕过 saveUser 中的 credits 逻辑
      const newUser = await insertUser({
        uuid,
        email,
        nickname: nickname || email.split('@')[0],
        avatar_url: avatar_url || '',
        created_at: new Date(created_at),
        signin_type: 'google',
        signin_provider: 'google',
        invite_code: '',
        invited_by: '',
        is_affiliate: false,
      });
      savedUser = newUser;
      console.log("🔍 [Save User API] New user created:", savedUser?.email);
    }
    
    console.log("🔍 [Save User API] User saved successfully:", { uuid: savedUser?.uuid, email: savedUser?.email });

    return NextResponse.json({
      success: true,
      user: savedUser
    });

  } catch (error) {
    console.error('🔍 [Save User API] Save user error:', error);
    console.error('🔍 [Save User API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Failed to save user',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}