"use client";

import { Check, Loader } from "lucide-react";
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

export default function Pricing({ pricing }: { pricing: PricingType }) {
  if (pricing.disabled) {
    return null;
  }

  const { user, setUser, setShowSignModal, isUserLoading } = useAppContext();

  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [wechatOrderData, setWechatOrderData] = useState<any>(null);

  console.log("🔍🔍🔍 [Pricing] PRICING COMPONENT RENDERED 🔍🔍🔍");
  console.log("🔍 [Pricing] User state:", !!user, user?.email, "Loading:", isUserLoading);
  console.log("🔍 [Pricing] Complete user object:", user);

  // 检查localStorage中的用户状态，补充AppContext可能的延迟
  useEffect(() => {
    const checkUserState = () => {
      const savedUser = localStorage.getItem('user_info');
      console.log("🔍 [Pricing] localStorage check:", {
        hasLocalStorageUser: !!savedUser,
        hasAppContextUser: !!user,
        userEmail: user?.email || 'none',
        isUserLoading,
        localStorageContent: savedUser ? JSON.parse(savedUser) : null
      });
      
      if (savedUser && !user) {
        console.log("🔍 [Pricing] SYNC ISSUE: Found user in localStorage but not in AppContext");
        console.log("🔍 [Pricing] localStorage user:", JSON.parse(savedUser));
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
        console.log("🔍 [Pricing] No user in localStorage");
        return null;
      }

      const userInfo = JSON.parse(savedUser);
      console.log("🔍 [Pricing] Found user in localStorage:", userInfo.email);

      // 从数据库验证用户是否存在
      const response = await fetch(`/api/get-user-info?email=${encodeURIComponent(userInfo.email)}`, {
        method: "POST",
      });

      if (!response.ok) {
        console.log("🔍 [Pricing] User verification failed:", response.status);
        return null;
      }

      const { code, data } = await response.json();
      if (code !== 0 || !data) {
        console.log("🔍 [Pricing] User not found in database");
        return null;
      }

      console.log("🔍 [Pricing] User verified in database:", data.email);
      return data;
    } catch (error) {
      console.error("🔍 [Pricing] User verification error:", error);
      return null;
    }
  };

  const handleWeChatCheckout = async (item: PricingItem) => {
    try {
      console.log("🔍 [Pricing] WeChat Pay checkout started for:", item.product_name);
      
      // 如果用户状态还在加载中，不执行操作
      if (isUserLoading) {
        console.log("🔍 [Pricing] User still loading, aborting WeChat checkout");
        return;
      }
      
      // 验证用户登录状态
      const currentUser = await verifyUserFromStorage();
      if (!currentUser) {
        console.log("🔍 [Pricing] ❌ NO AUTHENTICATED USER FOUND - SHOWING LOGIN MODAL");
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
      console.log("🔍 [Pricing] ========== CHECKOUT STARTED ==========");
      console.log("🔍 [Pricing] handleCheckout called with:", {
        productId: item.product_id,
        productName: item.product_name,
        cnPay: cn_pay
      });
      console.log("🔍 [Pricing] Current state:", {
        hasAppContextUser: !!user,
        userEmail: user?.email || 'none',
        isUserLoading,
        userObject: user
      });
      
      // 立即检查 localStorage
      const savedUser = localStorage.getItem('user_info');
      console.log("🔍 [Pricing] localStorage immediate check:", {
        hasLocalStorageUser: !!savedUser,
        localStorageContent: savedUser ? JSON.parse(savedUser) : null
      });
      
      // 如果用户状态还在加载中，不执行操作
      if (isUserLoading) {
        console.log("🔍 [Pricing] User still loading, aborting checkout");
        return;
      }
      
      // 直接从数据库验证用户登录状态
      console.log("🔍 [Pricing] Starting user verification from storage/database...");
      const currentUser = await verifyUserFromStorage();
      console.log("🔍 [Pricing] User verification result:", {
        success: !!currentUser,
        userEmail: currentUser?.email || 'none',
        userObject: currentUser
      });
      
      if (!currentUser) {
        console.log("🔍 [Pricing] ❌ NO AUTHENTICATED USER FOUND - SHOWING LOGIN MODAL");
        setShowSignModal(true);
        return;
      }
      
      console.log("🔍 [Pricing] ✅ User verified from database:", currentUser.email);

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

  useEffect(() => {
    if (pricing.items) {
      setGroup(pricing.items[0].group);
      setProductId(pricing.items[0].product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

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
                    <div className="flex flex-col gap-2">
                      {item.cn_amount && item.cn_amount > 0 ? (
                        <div className="flex items-center gap-x-2 mt-2">
                          <span className="text-sm">微信支付 👉</span>
                          <div
                            className="inline-block p-2 hover:cursor-pointer hover:bg-base-200 rounded-md"
                            onClick={() => {
                              if (isLoading) {
                                return;
                              }
                              handleWeChatCheckout(item);
                            }}
                          >
                            <img
                              src="/imgs/cnpay.png"
                              alt="WeChat Pay"
                              className="w-20 h-10 rounded-lg"
                            />
                          </div>
                        </div>
                      ) : null}
                      {item.button && (
                        <Button
                          className="w-full flex items-center justify-center gap-2 font-semibold"
                          disabled={isLoading}
                          onClick={async () => {
                            console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
                            console.log("🚨 BUTTON CLICKED:", item.product_name);
                            console.log("🚨 AppContext user state:", { hasUser: !!user, email: user?.email, isLoading: isUserLoading });
                            console.log("🚨 Complete user object:", user);
                            
                            // 检查 localStorage
                            const savedUser = localStorage.getItem('user_info');
                            console.log("🚨 localStorage user:", savedUser ? JSON.parse(savedUser) : null);
                            
                            // 如果 localStorage 有用户但 AppContext 没有，手动设置
                            if (savedUser && !user) {
                              console.log("🚨 FIXING SYNC ISSUE: Setting user in AppContext from localStorage");
                              const userInfo = JSON.parse(savedUser);
                              setUser(userInfo);
                              // 直接继续执行，不需要重新点击
                            }
                            
                            // 测试数据库验证
                            if (savedUser) {
                              const userInfo = JSON.parse(savedUser);
                              console.log("🚨 Testing database verification for:", userInfo.email);
                              try {
                                const response = await fetch(`/api/get-user-info?email=${encodeURIComponent(userInfo.email)}`, {
                                  method: "POST",
                                });
                                console.log("🚨 Database response status:", response.status, response.ok);
                                if (response.ok) {
                                  const { code, data } = await response.json();
                                  console.log("🚨 Database response:", { code, hasData: !!data, email: data?.email });
                                } else {
                                  console.log("🚨 Database response failed");
                                }
                              } catch (error) {
                                console.log("🚨 Database verification error:", error);
                              }
                            }
                            console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨");
                            
                            if (isLoading) {
                              console.log("🚨 Button click ignored - already loading");
                              return;
                            }
                            handleCheckout(item);
                          }}
                        >
                          {(!isLoading ||
                            (isLoading && productId !== item.product_id)) && (
                            <p>{item.button.title}</p>
                          )}

                          {isLoading && productId === item.product_id && (
                            <p>{item.button.title}</p>
                          )}
                          {isLoading && productId === item.product_id && (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {item.button.icon && (
                            <Icon name={item.button.icon} className="size-4" />
                          )}
                        </Button>
                      )}
                      {item.tip && (
                        <p className="text-muted-foreground text-sm mt-2">
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
