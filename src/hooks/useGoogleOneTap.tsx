"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

interface UseGoogleOneTapProps {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: any) => void;
  autoPrompt?: boolean; // 是否自动弹出
  onLoadingChange?: (loading: boolean) => void; // 加载状态回调
}

export function useGoogleOneTap({ onSuccess, onError, autoPrompt = true, onLoadingChange }: UseGoogleOneTapProps) {
  const initialized = useRef(false);
  const isLoggedIn = useRef(false);
  const googleInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 更新加载状态并通知父组件
  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  };

  const verifyToken = async (credential: string): Promise<GoogleUser | null> => {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      
      if (!response.ok) {
        console.error("Token verification failed");
        return null;
      }

      const payload = await response.json();
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (isLoggedIn.current) {
      console.log("User already logged in, ignoring One Tap");
      return;
    }

    // 清除加载状态，因为用户看到了Google弹框
    updateLoadingState(false);

    const user = await verifyToken(response.credential);
    if (user) {
      isLoggedIn.current = true;
      onSuccess(user);
      // 禁用进一步的 One Tap 提示
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.cancel();
      }
    } else {
      onError?.(new Error("Token verification failed"));
    }
  };

  const initializeGoogleOneTap = () => {
    const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
    if (!clientId) {
      console.error("Google Client ID not found");
      return;
    }

    if (initialized.current || isLoggedIn.current) {
      return;
    }

    const google = (window as any).google;
    if (google?.accounts?.id) {
      console.log("Initializing Google One Tap");
      
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleInstance.current = google;

      // 只有在 autoPrompt 为 true 时才自动弹出
      if (autoPrompt) {
        google.accounts.id.prompt((notification: any) => {
          console.log("Google One Tap notification:", notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One Tap not displayed or skipped");
          }
        });
      }

      initialized.current = true;
    }
  };

  // 手动触发 Google One Tap
  const promptGoogleOneTap = () => {
    if (isLoggedIn.current) {
      console.log("User already logged in");
      return;
    }

    // 立即设置加载状态，让用户看到反馈
    console.log("🔍 [Google One Tap] Starting Google login process...");
    updateLoadingState(true);

    const promptWithInstance = (googleInstance: any) => {
      googleInstance.accounts.id.prompt((notification: any) => {
        console.log("Google One Tap notification:", notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("One Tap not displayed or skipped");
          updateLoadingState(false);
          onError?.(new Error("Google One Tap 未能显示，请稍后重试"));
        }
        // 注意：如果弹框成功显示，loading状态会在用户操作后的handleCredentialResponse中清除
      });
    };

    if (googleInstance.current) {
      console.log("🔍 [Google One Tap] Using existing Google instance");
      // Google已经初始化，直接弹出
      promptWithInstance(googleInstance.current);
    } else {
      console.log("🔍 [Google One Tap] Initializing Google instance...");
      const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
      if (!clientId) {
        console.error("Google Client ID not found");
        updateLoadingState(false);
        onError?.(new Error("Google 配置错误"));
        return;
      }

      if ((window as any).google?.accounts?.id) {
        // Google脚本已加载，直接初始化
        console.log("🔍 [Google One Tap] Google script already loaded, initializing...");
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInstance.current = google;
        initialized.current = true;
        
        promptWithInstance(google);
      } else {
        // 需要加载Google脚本
        console.log("🔍 [Google One Tap] Loading Google script...");
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("🔍 [Google One Tap] Script loaded, initializing...");
          const google = (window as any).google;
          if (google?.accounts?.id) {
            google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            googleInstance.current = google;
            initialized.current = true;
            
            promptWithInstance(google);
          } else {
            console.error("Google accounts not available after script load");
            updateLoadingState(false);
            onError?.(new Error("Google 服务初始化失败"));
          }
        };
        script.onerror = () => {
          console.error("Failed to load Google script");
          updateLoadingState(false);
          onError?.(new Error("Google 服务加载失败，请检查网络连接"));
        };
        document.head.appendChild(script);
      }
    }
  };

  const loadGoogleScript = () => {
    if ((window as any).google) {
      initializeGoogleOneTap();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleOneTap;
    script.onerror = () => onError?.(new Error("Failed to load Google Identity Services"));
    
    document.head.appendChild(script);
  };

  useEffect(() => {
    // 检查用户是否已登录
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      isLoggedIn.current = true;
      return;
    }

    loadGoogleScript();
  }, []);

  const logout = () => {
    isLoggedIn.current = false;
    initialized.current = false;
    localStorage.removeItem('user_info');
    
    // 重新启用 One Tap
    setTimeout(() => {
      loadGoogleScript();
    }, 1000);
  };

  return { logout, promptGoogleOneTap, isLoading };
}