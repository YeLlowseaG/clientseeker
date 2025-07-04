import { NextRequest, NextResponse } from 'next/server';
import { PayPalClient } from '@/lib/paypal';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SubscriptionService } from '@/services/subscription';

export async function POST(request: NextRequest) {
  try {
    const { orderID, orderNo } = await request.json();

    if (!orderID || !orderNo) {
      return NextResponse.json({
        error: 'Missing orderID or orderNo',
        success: false
      }, { status: 400 });
    }

    const paypalClient = new PayPalClient();
    
    // 捕获 PayPal 支付
    const captureResult = await paypalClient.captureOrder(orderID);
    
    if (captureResult.status === 'COMPLETED') {
      // 更新订单状态
      await db()
        .update(orders)
        .set({
          status: 'paid',
          paid_at: new Date(),
          paid_detail: JSON.stringify(captureResult)
        })
        .where(eq(orders.order_no, orderNo));

      // 查找订单信息
      const order = await db()
        .select()
        .from(orders)
        .where(eq(orders.order_no, orderNo))
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

        return NextResponse.json({
          success: true,
          message: 'Payment completed successfully',
          order: orderData
        });
      }
    }

    return NextResponse.json({
      error: 'Payment capture failed',
      success: false
    }, { status: 400 });

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({
      error: 'Payment capture failed',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}