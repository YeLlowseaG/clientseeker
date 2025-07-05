import { NextRequest, NextResponse } from 'next/server';
import { saveUser } from '@/services/user';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [Save User API] Starting user save process");
    const body = await request.json();
    console.log("🔍 [Save User API] Request body:", body);
    
    const { uuid, email, nickname, avatar_url } = body;

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
      created_at: new Date().toISOString(),
    };

    console.log("🔍 [Save User API] User object to save:", user);
    const savedUser = await saveUser(user);
    console.log("🔍 [Save User API] User saved successfully:", { uuid: savedUser.uuid, email: savedUser.email });

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