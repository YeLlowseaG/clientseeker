"use client";

import { Check, Loader, CreditCard } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import WeChatPayModal from "@/components/wechat-pay-modal";
import { useLocale } from "next-intl";

export default function Pricing({ pricing }: { pricing: PricingType }) {
  if (pricing.disabled) {
    return null;
  }

  const { user, setUser, setShowSignModal, isUserLoading } = useAppContext();
  const locale = useLocale();

  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [wechatOrderData, setWechatOrderData] = useState<any>(null);
  
  // 支付方式状态管理
  const [paymentMethods, setPaymentMethods] = useState<{[key: string]: 'wechat' | 'paypal'}>({});
  
  // 根据语言环境判断是否优先微信支付
  const isChineseLocale = locale === 'zh';

  // 检查localStorage中的用户状态，补充AppContext可能的延迟
  useEffect(() => {
    const checkUserState = () => {
      const savedUser = localStorage.getItem('user_info');
      
      if (savedUser && !user) {
        console.log("Sync issue: Found user in localStorage but not in AppContext");
      }
    };
    
    checkUserState();
  }, [user, isUserLoading]);

  // 从 localStorage 和数据库验证用户状态
  const verifyUserFromStorage = async () => {
    try {
      // 先检查 localStorage
      const savedUser = localStorage.getItem('user_info');
      if (!savedUser) {
        return null;
      }

      const userInfo = JSON.parse(savedUser);

      // 从数据库验证用户是否存在
      const response = await fetch(`/api/get-user-info?email=${encodeURIComponent(userInfo.email)}`, {
        method: "POST",
      });

      if (!response.ok) {
        return null;
      }

      const { code, data } = await response.json();
      if (code !== 0 || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("User verification error:", error);
      return null;
    }
  };

  const handleWeChatCheckout = async (item: PricingItem) => {
    try {
      // 如果用户状态还在加载中，不执行操作
      if (isUserLoading) {
        return;
      }
      
      // 验证用户登录状态
      const currentUser = await verifyUserFromStorage();
      if (!currentUser) {
        setShowSignModal(true);
        return;
      }
      
      // Skip payment for free tier
      if (item.product_id === 'free') {
        toast.success('Free tier activated! You can now start searching.');
        return;
      }

      // 计算人民币金额
      const cnyAmount = Math.round(item.amount * 7.2);
      
      const orderData = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: item.amount, // 保持美元金额，API内部会转换
        currency: item.currency,
        valid_months: item.valid_months,
        user_email: currentUser.email,
      };

      setWechatOrderData(orderData);
      setShowWeChatModal(true);
      
    } catch (error) {
      console.error("WeChat Pay checkout error:", error);
      toast.error("WeChat Pay initialization failed");
    }
  };

  const handleCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      // 如果用户状态还在加载中，不执行操作
      if (isUserLoading) {
        return;
      }
      
      // 直接从数据库验证用户登录状态
      const currentUser = await verifyUserFromStorage();
      
      if (!currentUser) {
        setShowSignModal(true);
        return;
      }

      // Skip payment for free tier
      if (item.product_id === 'free') {
        toast.success('Free tier activated! You can now start searching.');
        return;
      }

      const params = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cn_pay ? item.cn_amount : item.amount,
        currency: cn_pay ? "cny" : item.currency,
        valid_months: item.valid_months,
        user_email: currentUser.email, // 使用验证后的用户邮箱
      };

      setIsLoading(true);
      setProductId(item.product_id);

      // Use PayPal checkout instead of Stripe
      const response = await fetch("/api/paypal/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setShowSignModal(true);
        return;
      }

      const result = await response.json();
      
      if (!result.success) {
        toast.error(result.error || 'Payment initialization failed');
        return;
      }

      // Redirect to PayPal for approval
      if (result.approval_url) {
        window.location.href = result.approval_url;
      } else {
        toast.error('Payment URL not found');
      }

    } catch (e) {
      console.log("PayPal checkout failed: ", e);
      toast.error("Payment initialization failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  // 初始化默认支付方式
  useEffect(() => {
    if (pricing.items) {
      setGroup(pricing.items[0].group);
      setProductId(pricing.items[0].product_id);
      setIsLoading(false);
      
      // 根据语言环境设置默认支付方式
      const initialPaymentMethods: {[key: string]: 'wechat' | 'paypal'} = {};
      pricing.items.forEach(item => {
        if (item.product_id) {
          // 中文环境且支持微信支付时，默认微信支付
          if (isChineseLocale && item.cn_amount && item.cn_amount > 0) {
            initialPaymentMethods[item.product_id] = 'wechat';
          } else {
            initialPaymentMethods[item.product_id] = 'paypal';
          }
        }
      });
      setPaymentMethods(initialPaymentMethods);
    }
  }, [pricing.items, isChineseLocale]);

  // 处理支付方式切换
  const handlePaymentMethodChange = (productId: string, method: 'wechat' | 'paypal') => {
    setPaymentMethods(prev => ({
      ...prev,
      [productId]: method
    }));
  };

  // 统一的支付处理函数
  const handlePayment = async (item: PricingItem) => {
    const selectedMethod = paymentMethods[item.product_id] || 'paypal';
    
    if (selectedMethod === 'wechat') {
      await handleWeChatCheckout(item);
    } else {
      await handleCheckout(item);
    }
  };

  return (
    <section id={pricing.name} className="py-16">
      <div className="container">
        <div className="mx-auto mb-12 text-center">
          <h2 className="mb-4 text-4xl font-semibold lg:text-5xl">
            {pricing.title}
          </h2>
          <p className="text-muted-foreground lg:text-lg">
            {pricing.description}
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          {pricing.groups && pricing.groups.length > 0 && (
            <div className="flex h-12 mb-12 items-center rounded-md bg-muted p-1 text-lg">
              <RadioGroup
                value={group}
                className={`h-full grid-cols-${pricing.groups.length}`}
                onValueChange={(value) => {
                  setGroup(value);
                }}
              >
                {pricing.groups.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className='h-full rounded-md transition-all has-[button[data-state="checked"]]:bg-white'
                    >
                      <RadioGroupItem
                        value={item.name || ""}
                        id={item.name}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={item.name}
                        className="flex h-full cursor-pointer items-center justify-center px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-primary"
                      >
                        {item.title}
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-primary bg-primary px-1.5 ml-1 text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          <div className="w-full mt-0 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {pricing.items?.map((item, index) => {
              if (item.group && item.group !== group) {
                return null;
              }

              return (
                <div
                  key={index}
                  className={`rounded-lg p-6 ${
                    item.is_featured
                      ? "border-primary border-2 bg-card text-card-foreground"
                      : "border-muted border"
                  }`}
                >
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {item.title && (
                          <h3 className="text-xl font-semibold">
                            {item.title}
                          </h3>
                        )}
                        <div className="flex-1"></div>
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-primary bg-primary px-1.5 text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-end gap-2 mb-4">
                        {item.original_price && (
                          <span className="text-xl text-muted-foreground font-semibold line-through">
                            {item.original_price}
                          </span>
                        )}
                        {item.price && (
                          <span className="text-5xl font-semibold">
                            {item.price}
                          </span>
                        )}
                        {item.unit && (
                          <span className="block font-semibold">
                            {item.unit}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.features_title && (
                        <p className="mb-3 mt-6 font-semibold">
                          {item.features_title}
                        </p>
                      )}
                      {item.features && (
                        <ul className="flex flex-col gap-3">
                          {item.features.map((feature, fi) => {
                            return (
                              <li className="flex gap-2" key={`feature-${fi}`}>
                                <Check className="mt-1 size-4 shrink-0" />
                                {feature}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      {/* 支付方式选择器 */}
                      {item.cn_amount && item.cn_amount > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <CreditCard className="h-4 w-4" />
                            <span>{isChineseLocale ? '支付方式' : 'Payment Method'}</span>
                          </div>
                          <RadioGroup
                            value={paymentMethods[item.product_id] || 'paypal'}
                            onValueChange={(value: 'wechat' | 'paypal') => 
                              handlePaymentMethodChange(item.product_id, value)
                            }
                            className="grid grid-cols-1 gap-2"
                          >
                            {/* 微信支付选项 */}
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wechat" id={`wechat-${item.product_id}`} />
                              <Label htmlFor={`wechat-${item.product_id}`} className="flex items-center gap-2 cursor-pointer">
                                <img
                                  src="/imgs/cnpay.png"
                                  alt="WeChat Pay"
                                  className="w-6 h-3 rounded"
                                />
                                <span className="text-sm">
                                  {isChineseLocale ? '微信支付' : 'WeChat Pay'}
                                </span>
                                {isChineseLocale && (
                                  <Badge variant="secondary" className="text-xs">推荐</Badge>
                                )}
                              </Label>
                            </div>
                            
                            {/* PayPal支付选项 */}
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paypal" id={`paypal-${item.product_id}`} />
                              <Label htmlFor={`paypal-${item.product_id}`} className="flex items-center gap-2 cursor-pointer">
                                <svg className="w-6 h-3" viewBox="0 0 24 12" fill="none">
                                  <path d="M7.076 0C3.698 0 0.96 2.393 0.96 5.339c0 1.672.738 3.026 2.132 3.026.59 0 1.144-.27 1.463-.696h.018c.088.41.348.696.774.696.688 0 1.232-.633 1.232-1.41 0-.164-.025-.31-.075-.445l.643-4.02h1.375l-.203 1.27c.184-.803.859-1.444 1.728-1.444.184 0 .363.025.531.074l.301-1.879C9.49.183 8.29 0 7.076 0z" fill="#003087"/>
                                  <path d="M15.999 0c-3.378 0-6.115 2.393-6.115 5.339 0 1.672.738 3.026 2.131 3.026.59 0 1.145-.27 1.464-.696h.018c.088.41.348.696.774.696.688 0 1.232-.633 1.232-1.41 0-.164-.025-.31-.075-.445l.643-4.02h1.375l-.203 1.27c.184-.803.859-1.444 1.728-1.444.184 0 .363.025.531.074l.301-1.879C18.413.183 17.213 0 15.999 0z" fill="#009cde"/>
                                </svg>
                                <span className="text-sm">PayPal</span>
                                {!isChineseLocale && (
                                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                )}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {/* 统一支付按钮 */}
                      {item.button && (
                        <Button
                          className="w-full flex items-center justify-center gap-2 font-semibold"
                          disabled={isLoading}
                          onClick={async () => {
                            if (isLoading) {
                              return;
                            }
                            await handlePayment(item);
                          }}
                        >
                          {(!isLoading || (isLoading && productId !== item.product_id)) && (
                            <>
                              {paymentMethods[item.product_id] === 'wechat' ? (
                                <>
                                  <img src="/imgs/cnpay.png" alt="WeChat Pay" className="w-5 h-2.5 rounded" />
                                  <span>{isChineseLocale ? '微信支付' : 'Pay with WeChat'}</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-2.5" viewBox="0 0 24 12" fill="none">
                                    <path d="M7.076 0C3.698 0 0.96 2.393 0.96 5.339c0 1.672.738 3.026 2.132 3.026.59 0 1.144-.27 1.463-.696h.018c.088.41.348.696.774.696.688 0 1.232-.633 1.232-1.41 0-.164-.025-.31-.075-.445l.643-4.02h1.375l-.203 1.27c.184-.803.859-1.444 1.728-1.444.184 0 .363.025.531.074l.301-1.879C9.49.183 8.29 0 7.076 0z" fill="currentColor"/>
                                    <path d="M15.999 0c-3.378 0-6.115 2.393-6.115 5.339 0 1.672.738 3.026 2.131 3.026.59 0 1.145-.27 1.464-.696h.018c.088.41.348.696.774.696.688 0 1.232-.633 1.232-1.41 0-.164-.025-.31-.075-.445l.643-4.02h1.375l-.203 1.27c.184-.803.859-1.444 1.728-1.444.184 0 .363.025.531.074l.301-1.879C18.413.183 17.213 0 15.999 0z" fill="currentColor"/>
                                  </svg>
                                  <span>{isChineseLocale ? 'PayPal支付' : 'Pay with PayPal'}</span>
                                </>
                              )}
                            </>
                          )}

                          {isLoading && productId === item.product_id && (
                            <>
                              <Loader className="h-4 w-4 animate-spin" />
                              <span>{isChineseLocale ? '处理中...' : 'Processing...'}</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* 安全提示 */}
                      <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p>{isChineseLocale ? '🔒 安全支付，支持退款' : '🔒 Secure payment, refund supported'}</p>
                        {paymentMethods[item.product_id] === 'wechat' && (
                          <p>{isChineseLocale ? '支持微信、支付宝扫码支付' : 'Supports WeChat and Alipay QR code payment'}</p>
                        )}
                      </div>

                      {item.tip && (
                        <p className="text-muted-foreground text-sm mt-2 text-center">
                          {item.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <WeChatPayModal
        isOpen={showWeChatModal}
        onClose={() => {
          setShowWeChatModal(false);
          setWechatOrderData(null);
        }}
        orderData={wechatOrderData}
      />
    </section>
  );
}
