import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { WeChatPayClient } from '@/lib/wechatpay';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSnowId } from '@/lib/hash';
import { getPricingPage } from '@/services/page';
import { PricingItem } from '@/types/blocks/pricing';
import { findUserByEmail } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [WeChat Pay] WeChat Pay checkout API called");
    
    const body = await request.json();
    console.log("🔍 [WeChat Pay] Full request body:", JSON.stringify(body, null, 2));
    
    const { user_email } = body;
    
    if (!user_email) {
      console.log("🔍 [WeChat Pay] No user_email in request body");
      return NextResponse.json({
        error: 'user_email is required',
        success: false
      }, { status: 400 });
    }
    
    console.log("🔍 [WeChat Pay] Request body user_email:", user_email);
    
    let userUuid: string;
    let userEmail: string;
    let userName: string = 'User';
    
    // 首先尝试 NextAuth 会话验证
    const session = await auth();
    console.log("🔍 [WeChat Pay] NextAuth session:", !!session, session?.user?.email);
    
    if (session?.user?.uuid) {
      // NextAuth 会话存在，使用会话信息
      userUuid = session.user.uuid;
      userEmail = session.user.email!;
      userName = session.user.name || 'User';
      console.log("🔍 [WeChat Pay] Using NextAuth session for user:", userEmail);
    } else {
      // 没有 NextAuth 会话，验证用户是否存在于数据库
      console.log("🔍 [WeChat Pay] No NextAuth session, validating user from database:", user_email);
      
      const existingUser = await findUserByEmail(user_email);
      if (!existingUser) {
        console.log("🔍 [WeChat Pay] User not found in database:", user_email);
        return NextResponse.json({
          error: 'User not found',
          success: false
        }, { status: 401 });
      }
      
      userUuid = existingUser.uuid;
      userEmail = existingUser.email;
      userName = existingUser.nickname || 'User';
      console.log("🔍 [WeChat Pay] User validated from database:", userEmail, "UUID:", userUuid);
    }

    const {
      credits,
      currency,
      amount,
      interval,
      product_id,
      product_name,
      valid_months,
    } = body;

    // 验证参数
    if (!amount || !interval || !product_id) {
      return NextResponse.json({
        error: 'Missing required parameters',
        success: false
      }, { status: 400 });
    }

    // 验证价格
    const page = await getPricingPage("en");
    if (!page?.pricing?.items) {
      return NextResponse.json({
        error: 'Invalid pricing configuration',
        success: false
      }, { status: 500 });
    }

    const item = page.pricing.items.find(
      (item: PricingItem) => item.product_id === product_id
    );

    if (!item) {
      return NextResponse.json({
        error: 'Invalid product',
        success: false
      }, { status: 400 });
    }

    // Skip payment for free tier
    if (item.product_id === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Free tier activated',
        payment_method: 'free'
      });
    }

    // 创建订单记录
    const orderNo = getSnowId();
    const currentDate = new Date();
    
    let expiredAt = new Date(currentDate);
    expiredAt.setMonth(expiredAt.getMonth() + (valid_months || 1));

    const order = {
      order_no: orderNo,
      created_at: currentDate,
      user_uuid: userUuid,
      user_email: userEmail,
      amount: amount,
      interval: interval,
      expired_at: expiredAt,
      status: "created",
      credits: credits,
      currency: currency || 'USD',
      product_id: product_id,
      product_name: product_name,
      valid_months: valid_months,
    };

    await db().insert(orders).values(order);
    console.log("🔍 [WeChat Pay] Order record created:", orderNo);

    // 创建微信支付
    console.log("🔍 [WeChat Pay] Creating WeChat Pay client...");
    const wechatPayClient = new WeChatPayClient();
    console.log("🔍 [WeChat Pay] WeChat Pay client created successfully");

    // 使用配置中的cn_amount作为人民币金额（单位：分）
    const cnyAmount = item.cn_amount || item.amount || 0;
    
    // 创建微信Native支付订单
    console.log("🔍 [WeChat Pay] Creating Native payment for:", { product_id, amount: cnyAmount, currency: 'CNY' });
    
    const wechatOrderData = {
      out_trade_no: orderNo.toString(),
      description: `ClientSeeker ${product_name}`,
      amount: {
        total: cnyAmount, // 微信支付金额单位是分
        currency: 'CNY',
      },
      notify_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/wechat/notify`,
    };

    console.log("🔍 [WeChat Pay] Creating order with data:", JSON.stringify(wechatOrderData, null, 2));
    
    const wechatOrder = await wechatPayClient.createNativeOrder(wechatOrderData);
    console.log("🔍 [WeChat Pay] Native order created:", wechatOrder.code_url);
    
    // 更新订单状态
    await db()
      .update(orders)
      .set({
        stripe_session_id: wechatOrder.prepay_id, // 复用字段存储微信支付prepay_id
        order_detail: JSON.stringify(wechatOrder)
      })
      .where(eq(orders.order_no, orderNo));

    return NextResponse.json({
      success: true,
      payment_method: 'wechat_native',
      code_url: wechatOrder.code_url,
      order_no: orderNo,
      amount_cny: Math.round(cnyAmount / 100), // 转换回元给前端显示
      expires_in: 300, // 二维码5分钟有效期
    });

  } catch (error: any) {
    console.error('🔍 [WeChat Pay] WeChat Pay checkout error:', error);
    console.error('🔍 [WeChat Pay] Error message:', error.message);
    console.error('🔍 [WeChat Pay] Error stack:', error.stack);
    
    return NextResponse.json({
      error: 'WeChat Pay processing failed',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}