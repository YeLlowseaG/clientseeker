import { NextRequest, NextResponse } from 'next/server';
import { WeChatPayClient } from '@/lib/wechatpay';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNo = searchParams.get('order_no');
    
    if (!orderNo) {
      return NextResponse.json({
        error: 'order_no is required',
        success: false
      }, { status: 400 });
    }

    console.log("🔍 [WeChat Status] Checking status for order:", orderNo);

    // 查找订单
    const existingOrders = await db()
      .select()
      .from(orders)
      .where(eq(orders.order_no, orderNo))
      .limit(1);

    if (existingOrders.length === 0) {
      return NextResponse.json({
        error: 'Order not found',
        success: false
      }, { status: 404 });
    }

    const order = existingOrders[0];
    console.log("🔍 [WeChat Status] Found order status:", order.status);

    // 如果订单已经完成，直接返回
    if (order.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        order: {
          order_no: order.order_no,
          status: order.status,
          amount: order.amount,
          currency: order.currency,
        }
      });
    }

    // 如果订单还在处理中，查询微信支付状态
    if (order.status === 'created') {
      try {
        const wechatPayClient = new WeChatPayClient();
        const paymentResult = await wechatPayClient.queryOrder(orderNo);
        
        console.log("🔍 [WeChat Status] WeChat query result:", paymentResult.trade_state);
        
        if (paymentResult.trade_state === 'SUCCESS') {
          // 更新订单状态为已完成
          await db()
            .update(orders)
            .set({
              status: 'completed',
              stripe_session_id: paymentResult.transaction_id,
              order_detail: JSON.stringify({
                ...JSON.parse(order.order_detail || '{}'),
                payment_data: paymentResult,
                completed_at: new Date().toISOString(),
              }),
            })
            .where(eq(orders.order_no, orderNo));

          console.log("🔍 [WeChat Status] Order marked as completed:", orderNo);

          return NextResponse.json({
            success: true,
            status: 'completed',
            order: {
              order_no: order.order_no,
              status: 'completed',
              amount: order.amount,
              currency: order.currency,
            }
          });
        } else if (paymentResult.trade_state === 'CLOSED' || paymentResult.trade_state === 'REVOKED') {
          // 支付已关闭或撤销
          await db()
            .update(orders)
            .set({ status: 'failed' })
            .where(eq(orders.order_no, orderNo));

          return NextResponse.json({
            success: true,
            status: 'failed',
            order: {
              order_no: order.order_no,
              status: 'failed',
              amount: order.amount,
              currency: order.currency,
            }
          });
        } else {
          // 支付还在进行中
          return NextResponse.json({
            success: true,
            status: 'pending',
            order: {
              order_no: order.order_no,
              status: 'pending',
              amount: order.amount,
              currency: order.currency,
            }
          });
        }
      } catch (error) {
        console.error("🔍 [WeChat Status] Error querying WeChat Pay:", error);
        // 查询失败，返回当前数据库状态
        return NextResponse.json({
          success: true,
          status: order.status,
          order: {
            order_no: order.order_no,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
          }
        });
      }
    }

    // 返回当前订单状态
    return NextResponse.json({
      success: true,
      status: order.status,
      order: {
        order_no: order.order_no,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
      }
    });

  } catch (error: any) {
    console.error('🔍 [WeChat Status] Status check error:', error);
    return NextResponse.json({
      error: 'Status check failed',
      message: error.message,
      success: false
    }, { status: 500 });
  }
}