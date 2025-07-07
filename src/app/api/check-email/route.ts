import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    console.log('Checking email existence:', email);

    // 检查邮箱是否已存在
    const existingUser = await findUserByEmail(email);

    return NextResponse.json({
      exists: !!existingUser,
      userId: existingUser?.uuid || null,
      email: email
    });

  } catch (error: any) {
    console.error('Check email error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}