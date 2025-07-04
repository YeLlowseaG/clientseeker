import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PayPalClient } from '@/lib/paypal';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSnowId } from '@/lib/hash';
import { getPricingPage } from '@/services/page';
import { PricingItem } from '@/types/blocks/pricing';

export async function POST(request: NextRequest) {
  try {
    // 检查用户身份验证
    const session = await auth();
    if (!session?.user?.uuid) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const userUuid = session.user.uuid;
    const userEmail = session.user.email!;

    const body = await request.json();
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
    const paypalClient = new PayPalClient();
    
    if (interval === 'monthly' || interval === 'yearly') {
      // 订阅支付
      const subscriptionData = {
        plan_id: await getOrCreatePlan(paypalClient, product_id, product_name, amount, currency, interval),
        subscriber: {
          name: {
            given_name: session.user.name?.split(' ')[0] || 'User',
            surname: session.user.name?.split(' ').slice(1).join(' ') || 'Name'
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

      const subscription = await paypalClient.createSubscription(subscriptionData);
      
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

      const paypalOrder = await paypalClient.createOrder(orderData);
      
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
    console.error('PayPal checkout error:', error);
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