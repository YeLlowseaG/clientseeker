import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export default async function PaySuccess({
  params,
  searchParams,
}: {
  params: Promise<{ session_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const { session_id } = await params;
    const urlParams = await searchParams;
    
    // PayPal 回调参数
    const paypalOrderId = urlParams.token as string;
    const payerId = urlParams.PayerID as string;
    
    if (paypalOrderId && payerId) {
      // 处理 PayPal 支付
      const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/api/paypal/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: paypalOrderId,
          orderNo: session_id // 使用 session_id 作为 orderNo
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('PayPal capture failed:', result.error);
        redirect(process.env.NEXT_PUBLIC_PAY_FAIL_URL || "/");
        return;
      }
    }
    
  } catch (e) {
    console.error('Payment processing error:', e);
    redirect(process.env.NEXT_PUBLIC_PAY_FAIL_URL || "/");
    return;
  }

  redirect(process.env.NEXT_PUBLIC_PAY_SUCCESS_URL || "/dashboard");
}
