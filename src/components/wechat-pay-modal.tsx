"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, QrCode, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface WeChatPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    product_id: string;
    product_name: string;
    credits: number;
    interval: string;
    amount: number;
    currency: string;
    valid_months: number;
    user_email: string;
  } | null;
}

export default function WeChatPayModal({ isOpen, onClose, orderData }: WeChatPayModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [orderNo, setOrderNo] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5分钟倒计时
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // 创建WeChat支付订单
  const createWeChatOrder = async () => {
    if (!orderData) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/wechat/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!result.success) {
        toast.error(result.error || 'WeChat Pay initialization failed');
        return;
      }

      setQrCodeUrl(result.code_url);
      setOrderNo(result.order_no);
      setTimeLeft(result.expires_in || 300);
      
      // 生成二维码图片
      const qrDataUrl = await QRCode.toDataURL(result.code_url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);

      // 开始轮询支付状态
      startStatusPolling(result.order_no);

    } catch (error) {
      console.error('WeChat Pay error:', error);
      toast.error('WeChat Pay initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 轮询支付状态
  const startStatusPolling = (orderNo: string) => {
    setPaymentStatus('checking');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/wechat/status?order_no=${orderNo}`);
        const result = await response.json();
        
        if (result.success && result.status === 'completed') {
          setPaymentStatus('success');
          clearInterval(pollInterval);
          toast.success('Payment successful!');
          setTimeout(() => {
            onClose();
            // 可以添加页面刷新或用户状态更新逻辑
            window.location.reload();
          }, 2000);
        } else if (result.status === 'failed') {
          setPaymentStatus('failed');
          clearInterval(pollInterval);
          toast.error('Payment failed');
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 3000); // 每3秒检查一次

    // 5分钟后停止轮询
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'checking') {
        setPaymentStatus('expired');
        toast.error('Payment QR code expired');
      }
    }, 300000);
  };

  // 倒计时
  useEffect(() => {
    if (paymentStatus === 'checking' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setPaymentStatus('expired');
    }
  }, [timeLeft, paymentStatus]);

  // 重置状态
  const resetModal = () => {
    setQrCodeUrl("");
    setOrderNo("");
    setPaymentStatus('pending');
    setTimeLeft(300);
    setQrCodeDataUrl("");
    setIsLoading(false);
  };

  // 当模态框打开时创建订单
  useEffect(() => {
    if (isOpen && orderData && !qrCodeUrl) {
      createWeChatOrder();
    } else if (!isOpen) {
      resetModal();
    }
  }, [isOpen, orderData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            WeChat Pay
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {isLoading && (
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          )}

          {qrCodeDataUrl && paymentStatus === 'checking' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <img src={qrCodeDataUrl} alt="WeChat Pay QR Code" className="w-48 h-48" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Scan QR code with WeChat to pay</p>
                <p className="text-xs text-muted-foreground">
                  Amount: ¥{orderData ? Math.round(orderData.amount * 7.2) : 0}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Expires in: {formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Waiting for payment...</span>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="font-medium text-green-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Your order has been processed</p>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <p className="font-medium text-red-600">Payment Failed</p>
                <p className="text-sm text-muted-foreground">Please try again</p>
              </div>
              <Button onClick={createWeChatOrder} variant="outline">
                Retry Payment
              </Button>
            </div>
          )}

          {paymentStatus === 'expired' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-orange-500" />
              <div className="text-center">
                <p className="font-medium text-orange-600">QR Code Expired</p>
                <p className="text-sm text-muted-foreground">Please generate a new QR code</p>
              </div>
              <Button onClick={createWeChatOrder} variant="outline">
                Generate New QR Code
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}