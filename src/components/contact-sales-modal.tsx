"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSalesModal({
  isOpen,
  onClose,
}: ContactSalesModalProps) {
  const t = useTranslations();

  const handleEmailContact = () => {
    const subject = encodeURIComponent("ClientSeeker企业套餐咨询");
    const body = encodeURIComponent(`您好，

我对ClientSeeker企业套餐感兴趣，希望了解更多详情：

- 公司名称：
- 联系人：
- 预期使用人数：
- 具体需求：

期待您的回复！`);
    
    window.location.href = `mailto:contact@clientseeker.pro?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            企业套餐咨询
          </DialogTitle>
          <DialogDescription className="text-center">
            选择您偏好的联系方式，我们将为您提供专属服务
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* 微信联系 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>微信咨询</span>
            </div>
            
            <div className="relative">
              <img
                src="/imgs/wechat-qr.png"
                alt="微信二维码"
                className="w-48 h-48 border border-gray-200 rounded-lg"
                onError={(e) => {
                  // 如果图片加载失败，显示占位符
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' fill='%23f3f4f6'/%3E%3Ctext x='96' y='96' font-family='Arial' font-size='14' text-anchor='middle' dy='0.3em' fill='%236b7280'%3E微信二维码%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              扫码添加微信<br />获取专属企业服务
            </p>
          </div>

          {/* 邮件联系 */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>邮件咨询</span>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                发送邮件给我们的销售团队<br />
                我们将在24小时内回复
              </p>
              
              <Button
                onClick={handleEmailContact}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <Mail className="h-4 w-4" />
                发送邮件咨询
              </Button>
              
              <p className="text-xs text-gray-500">
                contact@clientseeker.pro
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 text-center text-sm text-gray-500">
          我们的销售团队将为您提供专业的企业级解决方案
        </div>
      </DialogContent>
    </Dialog>
  );
}