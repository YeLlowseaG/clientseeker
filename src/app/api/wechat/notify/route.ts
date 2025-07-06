import { NextRequest, NextResponse } from 'next/server';
import { WeChatPayClient } from '@/lib/wechatpay';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [WeChat Notify] WeChat Pay notification received");
    
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log("🔍 [WeChat Notify] Request headers:", {
      signature: headers['wechatpay-signature'],
      timestamp: headers['wechatpay-timestamp'],
      nonce: headers['wechatpay-nonce'],
      serial: headers['wechatpay-serial'],
    });
    
    // 初始化微信支付客户端
    const wechatPayClient = new WeChatPayClient();
    
    // 验证签名
    const isValid = await wechatPayClient.verifyNotification(headers, body);
    if (!isValid) {
      console.error("🔍 [WeChat Notify] Invalid signature");
      return NextResponse.json({ code: 'FAIL', message: 'Invalid signature' }, { status: 400 });
    }
    
    console.log("🔍 [WeChat Notify] Signature verified successfully");
    
    // 解析通知数据
    const notification = JSON.parse(body);
    console.log("🔍 [WeChat Notify] Notification data:", {
      event_type: notification.event_type,
      resource_type: notification.resource.original_type,
    });
    
    // 只处理支付成功通知
    if (notification.event_type !== 'TRANSACTION.SUCCESS') {
      console.log("🔍 [WeChat Notify] Ignoring non-success event:", notification.event_type);
      return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
    }
    
    // 解密资源数据
    const encryptedData = notification.resource;
    const decryptedData = wechatPayClient.decryptNotification(encryptedData);
    const paymentData = JSON.parse(decryptedData);
    
    console.log("🔍 [WeChat Notify] Decrypted payment data:", {
      out_trade_no: paymentData.out_trade_no,
      trade_state: paymentData.trade_state,
      transaction_id: paymentData.transaction_id,
      amount: paymentData.amount,
    });
    
    const orderNo = paymentData.out_trade_no;
    
    // 查找订单
    const existingOrders = await db()
      .select()
      .from(orders)
      .where(eq(orders.order_no, orderNo))
      .limit(1);
    
    if (existingOrders.length === 0) {
      console.error("🔍 [WeChat Notify] Order not found:", orderNo);
      return NextResponse.json({ code: 'FAIL', message: 'Order not found' }, { status: 404 });
    }
    
    const order = existingOrders[0];
    console.log("🔍 [WeChat Notify] Found order:", {
      order_no: order.order_no,
      current_status: order.status,
      user_email: order.user_email,
    });
    
    // 检查是否已经处理过
    if (order.status === 'completed') {
      console.log("🔍 [WeChat Notify] Order already completed, skipping");
      return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
    }
    
    // 验证金额（可选，增加安全性）
    const expectedAmount = order.amount * 7.2; // 转换为人民币
    const paidAmount = paymentData.amount.total / 100; // 微信金额单位是分
    
    if (Math.abs(expectedAmount - paidAmount) > 0.01) {
      console.error("🔍 [WeChat Notify] Amount mismatch:", {
        expected: expectedAmount,
        paid: paidAmount,
      });
      return NextResponse.json({ code: 'FAIL', message: 'Amount mismatch' }, { status: 400 });
    }
    
    // 更新订单状态
    if (paymentData.trade_state === 'SUCCESS') {
      await db()
        .update(orders)
        .set({
          status: 'completed',
          stripe_session_id: paymentData.transaction_id, // 存储微信交易号
          order_detail: JSON.stringify({
            ...JSON.parse(order.order_detail || '{}'),
            payment_data: paymentData,
            completed_at: new Date().toISOString(),
          }),
        })
        .where(eq(orders.order_no, orderNo));
      
      console.log("🔍 [WeChat Notify] Order marked as completed:", orderNo);
      
      // TODO: 这里可以添加用户权限激活逻辑
      // 例如：增加用户credits、激活订阅等
      
    } else {
      console.log("🔍 [WeChat Notify] Payment not successful:", paymentData.trade_state);
    }
    
    // 返回成功响应
    return NextResponse.json({ code: 'SUCCESS', message: 'OK' });
    
  } catch (error: any) {
    console.error('🔍 [WeChat Notify] Notification processing error:', error);
    console.error('🔍 [WeChat Notify] Error message:', error.message);
    console.error('🔍 [WeChat Notify] Error stack:', error.stack);
    
    // 返回失败响应，微信会重试
    return NextResponse.json({ 
      code: 'FAIL', 
      message: error.message 
    }, { status: 500 });
  }
}