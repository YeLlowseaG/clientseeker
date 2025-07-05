import { NextRequest, NextResponse } from 'next/server';
import { saveUser } from '@/services/user';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, email, nickname, avatar_url } = body;

    if (!email || !uuid) {
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

    const savedUser = await saveUser(user);

    return NextResponse.json({
      success: true,
      user: savedUser
    });

  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json({
      error: 'Failed to save user',
      success: false
    }, { status: 500 });
  }
}