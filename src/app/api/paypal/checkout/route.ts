import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PayPalClient } from '@/lib/paypal';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSnowId } from '@/lib/hash';
import { getPricingPage } from '@/services/page';
import { PricingItem } from '@/types/blocks/pricing';
import { findUserByEmail } from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [PayPal] PayPal checkout API called");
    
    const body = await request.json();
    const { user_email } = body;
    
    console.log("🔍 [PayPal] Request body user_email:", user_email);
    
    let userUuid: string;
    let userEmail: string;
    let userName: string = 'User';
    
    // 首先尝试 NextAuth 会话验证
    const session = await auth();
    console.log("🔍 [PayPal] NextAuth session:", !!session, session?.user?.email);
    
    if (session?.user?.uuid) {
      // NextAuth 会话存在，使用会话信息
      userUuid = session.user.uuid;
      userEmail = session.user.email!;
      userName = session.user.name || 'User';
      console.log("🔍 [PayPal] Using NextAuth session for user:", userEmail);
    } else if (user_email) {
      // 没有 NextAuth 会话但有用户邮箱，验证用户是否存在于数据库
      console.log("🔍 [PayPal] No NextAuth session, validating user from database:", user_email);
      
      const existingUser = await findUserByEmail(user_email);
      if (!existingUser) {
        console.log("🔍 [PayPal] User not found in database:", user_email);
        return NextResponse.json({
          error: 'User not found',
          success: false
        }, { status: 401 });
      }
      
      userUuid = existingUser.uuid;
      userEmail = existingUser.email;
      userName = existingUser.nickname || 'User';
      console.log("🔍 [PayPal] User validated from database:", userEmail, "UUID:", userUuid);
    } else {
      // 没有任何认证信息
      console.log("🔍 [PayPal] No authentication found");
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const {
      credits,
      currency,
      amount,
      interval,
      product_id,
      product_name,
      valid_months,
      cancel_url = process.env.NEXT_PUBLIC_PAY_CANCEL_URL || process.env.NEXT_PUBLIC_WEB_URL
    } = body;

    // 验证参数
    if (!amount || !interval || !currency || !product_id) {
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
      currency: currency.toUpperCase(),
      product_id: product_id,
      product_name: product_name,
      valid_months: valid_months,
    };

    await db().insert(orders).values(order);

    // 创建 PayPal 支付
    console.log("🔍 [PayPal] Creating PayPal client...");
    const paypalClient = new PayPalClient();
    console.log("🔍 [PayPal] PayPal client created successfully");
    
    if (interval === 'monthly' || interval === 'yearly') {
      // 订阅支付
      console.log("🔍 [PayPal] Creating subscription for:", { product_id, interval, amount, currency });
      const planId = await getOrCreatePlan(paypalClient, product_id, product_name, amount, currency, interval);
      console.log("🔍 [PayPal] Plan created/retrieved:", planId);
      
      const subscriptionData = {
        plan_id: planId,
        subscriber: {
          name: {
            given_name: userName.split(' ')[0] || 'User',
            surname: userName.split(' ').slice(1).join(' ') || 'Name'
          },
          email_address: userEmail
        },
        application_context: {
          brand_name: 'ClientSeeker',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pay-success/${orderNo}`,
          cancel_url: cancel_url
        },
        custom_id: orderNo.toString()
      };

      console.log("🔍 [PayPal] Creating subscription with data:", JSON.stringify(subscriptionData, null, 2));
      const subscription = await paypalClient.createSubscription(subscriptionData);
      console.log("🔍 [PayPal] Subscription created:", subscription.id);
      
      // 更新订单状态
      await db()
        .update(orders)
        .set({
          stripe_session_id: subscription.id, // 复用字段存储 PayPal subscription ID
          order_detail: JSON.stringify(subscription)
        })
        .where(eq(orders.order_no, orderNo));

      const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve')?.href;

      return NextResponse.json({
        success: true,
        subscription_id: subscription.id,
        approval_url: approvalUrl,
        order_no: orderNo
      });

    } else {
      // 一次性支付
      console.log("🔍 [PayPal] Creating one-time payment for:", { product_id, amount, currency });
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderNo.toString(),
          amount: {
            currency_code: currency.toUpperCase(),
            value: (amount / 100).toFixed(2) // PayPal uses dollars, not cents
          },
          description: product_name,
          custom_id: orderNo.toString()
        }],
        application_context: {
          brand_name: 'ClientSeeker',
          locale: 'en-US',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pay-success/${orderNo}`,
          cancel_url: cancel_url
        }
      };

      console.log("🔍 [PayPal] Creating order with data:", JSON.stringify(orderData, null, 2));
      const paypalOrder = await paypalClient.createOrder(orderData);
      console.log("🔍 [PayPal] Order created:", paypalOrder.id);
      
      // 更新订单状态
      await db()
        .update(orders)
        .set({
          stripe_session_id: paypalOrder.id, // 复用字段存储 PayPal order ID
          order_detail: JSON.stringify(paypalOrder)
        })
        .where(eq(orders.order_no, orderNo));

      const approvalUrl = paypalOrder.links.find((link: any) => link.rel === 'approve')?.href;

      return NextResponse.json({
        success: true,
        order_id: paypalOrder.id,
        approval_url: approvalUrl,
        order_no: orderNo
      });
    }

  } catch (error: any) {
    console.error('🔍 [PayPal] PayPal checkout error:', error);
    console.error('🔍 [PayPal] Error message:', error.message);
    console.error('🔍 [PayPal] Error stack:', error.stack);
    
    // 检查 PayPal 环境变量
    console.log('🔍 [PayPal] Environment check:', {
      hasClientId: !!process.env.PAYPAL_CLIENT_ID,
      hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
    });
    
    return NextResponse.json({
      error: 'Payment processing failed',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}

// 获取或创建 PayPal 计划
async function getOrCreatePlan(
  paypalClient: PayPalClient, 
  productId: string, 
  productName: string, 
  amount: number, 
  currency: string, 
  interval: string
): Promise<string> {
  try {
    // 首先创建产品
    const productData = {
      id: `clientseeker-${productId}`,
      name: productName,
      description: `ClientSeeker ${productName} subscription`,
      type: 'SERVICE',
      category: 'SOFTWARE'
    };

    let product;
    try {
      product = await paypalClient.createProduct(productData);
    } catch (error: any) {
      // 如果产品已存在，使用现有产品
      if (error.message.includes('already exists')) {
        product = { id: productData.id };
      } else {
        throw error;
      }
    }

    // 创建计划
    const planData = {
      product_id: product.id,
      name: `${productName} Plan`,
      description: `${productName} subscription plan`,
      billing_cycles: [{
        frequency: {
          interval_unit: interval === 'monthly' ? 'MONTH' : 'YEAR',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 无限循环
        pricing_scheme: {
          fixed_price: {
            value: (amount / 100).toFixed(2),
            currency_code: currency.toUpperCase()
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    };

    const plan = await paypalClient.createPlan(planData);
    return plan.id;

  } catch (error) {
    console.error('Error creating PayPal plan:', error);
    throw error;
  }
}