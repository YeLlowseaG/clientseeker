"use client";

import { useWeChatLogin } from '@/hooks/useWeChatLogin';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useLocale } from 'next-intl';

interface WeChatLoginButtonProps {
  onSuccess?: (userInfo: any) => void;
  onError?: (error: any) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export default function WeChatLoginButton({ 
  onSuccess, 
  onError, 
  className = "",
  variant = "outline",
  size = "default",
  disabled = false
}: WeChatLoginButtonProps) {
  const locale = useLocale();
  const isChineseLocale = locale === 'zh';

  const { startWeChatLogin, isLoading } = useWeChatLogin({
    onSuccess: (userInfo) => {
      console.log('WeChat login success:', userInfo);
      onSuccess?.(userInfo);
    },
    onError: (error) => {
      console.error('WeChat login error:', error);
      onError?.(error);
    }
  });

  // 检查微信登录是否启用
  const isWeChatEnabled = process.env.NEXT_PUBLIC_WECHAT_LOGIN_ENABLED === 'true';
  
  // 调试信息
  console.log('WeChat Login Debug:', {
    NEXT_PUBLIC_WECHAT_LOGIN_ENABLED: process.env.NEXT_PUBLIC_WECHAT_LOGIN_ENABLED,
    NEXT_PUBLIC_WECHAT_APP_ID: process.env.NEXT_PUBLIC_WECHAT_APP_ID,
    isWeChatEnabled,
    isChineseLocale
  });

  if (!isWeChatEnabled) {
    console.log('WeChat login disabled, returning null');
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={startWeChatLogin}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          <span>{isChineseLocale ? '登录中...' : 'Signing in...'}</span>
        </>
      ) : (
        <>
          {/* 微信图标 */}
          <svg 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M8.5 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c1.6 0 3.11-.376 4.44-1.041.367-.183.82-.064 1.127.248l1.776 1.776c.441.441 1.182.128 1.182-.498V19.93c2.424-2.424 3.93-5.77 3.93-9.45C22.46 6.477 18.477 2 12 2zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 7 6.5 7s1.5.67 1.5 1.5S7.33 10 6.5 10zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 7 17.5 7s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>
            {isChineseLocale ? '微信登录' : 'WeChat Login'}
          </span>
        </>
      )}
    </Button>
  );
}