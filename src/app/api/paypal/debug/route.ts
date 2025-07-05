import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [PayPal Debug] Starting debug test...");
    
    const body = await request.json();
    console.log("🔍 [PayPal Debug] Request body:", JSON.stringify(body, null, 2));
    
    const { user_email } = body;
    
    if (!user_email) {
      return NextResponse.json({
        success: false,
        error: 'user_email required',
        step: 'validation'
      });
    }
    
    // 测试用户查找
    console.log("🔍 [PayPal Debug] Looking up user:", user_email);
    const user = await findUserByEmail(user_email);
    console.log("🔍 [PayPal Debug] User found:", !!user);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        step: 'user_lookup'
      });
    }
    
    // 测试环境变量
    const hasClientId = !!process.env.PAYPAL_CLIENT_ID;
    const hasClientSecret = !!process.env.PAYPAL_CLIENT_SECRET;
    
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      data: {
        user_found: true,
        user_email: user.email,
        user_uuid: user.uuid,
        paypal_config: {
          hasClientId,
          hasClientSecret,
          environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
        }
      }
    });
    
  } catch (error: any) {
    console.error("🔍 [PayPal Debug] Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      step: 'unknown'
    }, { status: 500 });
  }
}