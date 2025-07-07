"use client";

import { useState, useCallback } from 'react';

export interface WeChatLoginConfig {
  onSuccess?: (userInfo: any) => void;
  onError?: (error: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  autoPrompt?: boolean;
}

export interface WeChatLoginResult {
  startWeChatLogin: () => void;
  isLoading: boolean;
  logout: () => void;
}

export function useWeChatLogin(config: WeChatLoginConfig = {}): WeChatLoginResult {
  const {
    onSuccess,
    onError,
    onLoadingChange,
    autoPrompt = false
  } = config;

  const [isLoading, setIsLoading] = useState(false);

  const updateLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // 开始微信登录流程
  const startWeChatLogin = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_WECHAT_APP_ID) {
      console.error('WeChat App ID not configured');
      onError?.({ message: 'WeChat App ID not configured' });
      return;
    }

    if (!process.env.NEXT_PUBLIC_WECHAT_LOGIN_ENABLED) {
      console.error('WeChat login is disabled');
      onError?.({ message: 'WeChat login is disabled' });
      return;
    }

    updateLoading(true);

    try {
      // 构建微信OAuth授权URL
      const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/wechat/auth/callback`);
      const state = Math.random().toString(36).substring(2, 15);
      
      // 保存state到localStorage用于验证
      localStorage.setItem('wechat_oauth_state', state);
      
      // 微信扫码登录URL
      const wechatLoginUrl = `https://open.weixin.qq.com/connect/qrconnect?` +
        `appid=${appId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=snsapi_login&` +
        `state=${state}#wechat_redirect`;

      console.log('Starting WeChat login:', wechatLoginUrl);

      // 打开微信登录窗口
      const popup = window.open(
        wechatLoginUrl,
        'wechatLogin',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open WeChat login popup. Please allow popups for this site.');
      }

      // 监听弹窗关闭或成功回调
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          updateLoading(false);
          
          // 检查是否登录成功（通过localStorage或其他方式）
          const wechatLoginSuccess = localStorage.getItem('wechat_login_success');
          const wechatUserInfo = localStorage.getItem('wechat_user_info');
          
          if (wechatLoginSuccess && wechatUserInfo) {
            // 清理临时数据
            localStorage.removeItem('wechat_login_success');
            localStorage.removeItem('wechat_oauth_state');
            
            try {
              const userInfo = JSON.parse(wechatUserInfo);
              onSuccess?.(userInfo);
            } catch (error) {
              console.error('Failed to parse WeChat user info:', error);
              onError?.(error);
            }
          }
        }
      }, 1000);

      // 设置超时
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          updateLoading(false);
          onError?.({ message: 'WeChat login timeout' });
        }
      }, 300000); // 5分钟超时

    } catch (error) {
      console.error('WeChat login error:', error);
      updateLoading(false);
      onError?.(error);
    }
  }, [onSuccess, onError, updateLoading]);

  // 登出功能
  const logout = useCallback(() => {
    // 清理相关的localStorage数据
    localStorage.removeItem('wechat_user_info');
    localStorage.removeItem('wechat_login_success');
    localStorage.removeItem('wechat_oauth_state');
    
    console.log('WeChat logout completed');
  }, []);

  return {
    startWeChatLogin,
    isLoading,
    logout
  };
}