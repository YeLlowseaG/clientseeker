"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SiGithub, SiGmail, SiGoogle } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations, useLocale } from "next-intl";
import WeChatLoginButton from "@/components/wechat-login-button";

export default function SignModal() {
  const t = useTranslations();
  const { showSignModal, setShowSignModal } = useAppContext();

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("sign_modal.sign_in_title")}</DialogTitle>
            <DialogDescription>
              {t("sign_modal.sign_in_description")}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSignModal} onOpenChange={setShowSignModal}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("sign_modal.sign_in_title")}</DrawerTitle>
          <DrawerDescription>
            {t("sign_modal.sign_in_description")}
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">{t("sign_modal.cancel_title")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const t = useTranslations();
  const locale = useLocale();
  const { promptGoogleOneTap, setShowSignModal, isGoogleLoading } = useAppContext();
  
  const isChineseLocale = locale === 'zh';

  const handleGoogleLogin = () => {
    promptGoogleOneTap();
    // 不要立即关闭模态框，让用户看到加载状态
  };

  const handleWeChatSuccess = (userInfo: any) => {
    console.log('WeChat login success in modal:', userInfo);
    // 微信登录成功后关闭模态框
    setShowSignModal(false);
    
    // 刷新页面以更新用户状态
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleWeChatError = (error: any) => {
    console.error('WeChat login error in modal:', error);
    // 这里可以显示错误提示
  };

  // 根据语言环境创建登录按钮数组
  const loginButtons = [];

  // 微信登录按钮
  console.log('Modal Debug - WeChat Login:', {
    NEXT_PUBLIC_WECHAT_LOGIN_ENABLED: process.env.NEXT_PUBLIC_WECHAT_LOGIN_ENABLED,
    NEXT_PUBLIC_WECHAT_APP_ID: process.env.NEXT_PUBLIC_WECHAT_APP_ID,
    isChineseLocale
  });
  
  const wechatButton = process.env.NEXT_PUBLIC_WECHAT_LOGIN_ENABLED === "true" && (
    <WeChatLoginButton
      key="wechat"
      onSuccess={handleWeChatSuccess}
      onError={handleWeChatError}
      className="w-full"
      variant="outline"
    />
  );

  // Google登录按钮
  const googleButton = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" ? (
    <Button
      key="google"
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleGoogleLogin}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>{isChineseLocale ? '正在加载 Google 登录...' : 'Loading Google Login...'}</span>
        </>
      ) : (
        <>
          <SiGoogle className="w-4 h-4" />
          {t("sign_modal.google_sign_in") || (isChineseLocale ? "Google 登录" : "Google Sign In")}
        </>
      )}
    </Button>
  ) : process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
    <Button
      key="google-standard"
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={() => {
        signIn("google");
      }}
    >
      <SiGoogle className="w-4 h-4" />
      {t("sign_modal.google_sign_in")}
    </Button>
  );

  // GitHub登录按钮
  const githubButton = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
    <Button
      key="github"
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={() => {
        signIn("github");
      }}
    >
      <SiGithub className="w-4 h-4" />
      {t("sign_modal.github_sign_in")}
    </Button>
  );

  // 根据语言环境决定按钮顺序
  if (isChineseLocale) {
    // 中文环境：微信优先
    if (wechatButton) loginButtons.push(wechatButton);
    if (googleButton) loginButtons.push(googleButton);
    if (githubButton) loginButtons.push(githubButton);
  } else {
    // 英文环境：Google优先
    if (googleButton) loginButtons.push(googleButton);
    if (wechatButton) loginButtons.push(wechatButton);
    if (githubButton) loginButtons.push(githubButton);
  }

  return (
    <div className={cn("grid items-start gap-4", className)}>
      {loginButtons}
      
      {/* 提示信息 */}
      <div className="text-center text-sm text-muted-foreground mt-2">
        {isChineseLocale ? (
          <p>选择您偏好的登录方式</p>
        ) : (
          <p>Choose your preferred sign-in method</p>
        )}
      </div>
    </div>
  );
}
