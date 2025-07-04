import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SubscriptionService } from '@/services/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    console.log('PayPal webhook received:', event.event_type);

    // 处理不同类型的 PayPal 事件
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event);
        break;
      
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(event);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event);
        break;
      
      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(event: any) {
  console.log('Subscription activated:', event.resource.id);
  
  const subscriptionId = event.resource.id;
  const customId = event.resource.custom_id;
  
  if (!customId) {
    console.error('No custom_id found in subscription event');
    return;
  }

  try {
    // 更新订单状态
    await db()
      .update(orders)
      .set({
        status: 'paid',
        paid_at: new Date(),
        paid_detail: JSON.stringify(event.resource)
      })
      .where(eq(orders.order_no, customId));

    // 查找订单信息
    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.order_no, customId))
      .limit(1);

    if (order[0]) {
      const orderData = order[0];
      
      // 创建用户订阅
      if (orderData.product_id && orderData.product_id !== 'free') {
        await SubscriptionService.createPaidSubscription(
          orderData.user_uuid,
          orderData.product_id,
          orderData.product_name || `ClientSeeker ${orderData.product_id}`,
          orderData.credits,
          subscriptionId
        );
      }

      console.log(`Subscription created for user ${orderData.user_uuid}`);
    }
  } catch (error) {
    console.error('Error processing subscription activation:', error);
  }
}

async function handlePaymentCompleted(event: any) {
  console.log('Payment completed:', event.resource.id);
  
  const saleId = event.resource.id;
  const customId = event.resource.custom;
  
  if (!customId) {
    console.error('No custom field found in payment event');
    return;
  }

  try {
    // 更新订单状态
    await db()
      .update(orders)
      .set({
        status: 'paid',
        paid_at: new Date(),
        paid_detail: JSON.stringify(event.resource)
      })
      .where(eq(orders.order_no, customId));

    // 查找订单信息
    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.order_no, customId))
      .limit(1);

    if (order[0]) {
      const orderData = order[0];
      
      // 创建用户订阅
      if (orderData.product_id && orderData.product_id !== 'free') {
        await SubscriptionService.createPaidSubscription(
          orderData.user_uuid,
          orderData.product_id,
          orderData.product_name || `ClientSeeker ${orderData.product_id}`,
          orderData.credits
        );
      }

      console.log(`One-time payment processed for user ${orderData.user_uuid}`);
    }
  } catch (error) {
    console.error('Error processing payment completion:', error);
  }
}

async function handlePaymentFailed(event: any) {
  console.log('Payment failed:', event.resource.id);
  
  const subscriptionId = event.resource.id;
  
  try {
    // 这里可以添加处理逻辑，比如通知用户、暂停服务等
    console.log(`Payment failed for subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

async function handleSubscriptionCancelled(event: any) {
  console.log('Subscription cancelled:', event.resource.id);
  
  const subscriptionId = event.resource.id;
  
  try {
    // 这里可以添加处理逻辑，比如取消用户订阅
    console.log(`Subscription cancelled: ${subscriptionId}`);
  } catch (error) {
    console.error('Error processing subscription cancellation:', error);
  }
}