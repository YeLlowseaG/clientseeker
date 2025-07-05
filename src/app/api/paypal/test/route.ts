import { NextRequest, NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [PayPal Test] Testing PayPal configuration...");
    
    // 检查环境变量
    const hasClientId = !!process.env.PAYPAL_CLIENT_ID;
    const hasClientSecret = !!process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
    
    console.log("🔍 [PayPal Test] Environment variables:", {
      hasClientId,
      hasClientSecret,
      environment,
      clientIdPreview: process.env.PAYPAL_CLIENT_ID?.substring(0, 10) + '...',
    });
    
    if (!hasClientId || !hasClientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing PayPal credentials',
        details: {
          hasClientId,
          hasClientSecret,
          environment
        }
      });
    }
    
    // 尝试创建 PayPal 客户端并获取 access token
    const paypalClient = new PayPalClient();
    
    // 这会尝试获取 access token
    console.log("🔍 [PayPal Test] Testing PayPal API connection...");
    
    // 由于 getAccessToken 是私有方法，我们创建一个简单的测试订单
    const testOrderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '1.00'
        },
        description: 'Test order'
      }]
    };
    
    const order = await paypalClient.createOrder(testOrderData);
    
    return NextResponse.json({
      success: true,
      message: 'PayPal configuration is working',
      environment,
      orderCreated: !!order.id
    });
    
  } catch (error: any) {
    console.error("🔍 [PayPal Test] PayPal test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: 'PayPal test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}