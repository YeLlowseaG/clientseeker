"use client";

import { useEffect, useRef } from "react";

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
}

export function useGoogleOneTap({ onSuccess, onError, autoPrompt = true }: UseGoogleOneTapProps) {
  const initialized = useRef(false);
  const isLoggedIn = useRef(false);
  const googleInstance = useRef<any>(null);

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

    if (googleInstance.current) {
      console.log("Manually triggering Google One Tap");
      googleInstance.current.accounts.id.prompt((notification: any) => {
        console.log("Manual Google One Tap notification:", notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("One Tap not displayed or skipped");
          onError?.(new Error("Google One Tap not available"));
        }
      });
    } else {
      console.log("Google instance not initialized, initializing first");
      // 直接初始化并立即尝试弹出
      const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
      if (!clientId) {
        console.error("Google Client ID not found");
        return;
      }

      if ((window as any).google?.accounts?.id) {
        // 脚本已加载，直接初始化
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleInstance.current = google;
        initialized.current = true;
        
        // 立即弹出
        google.accounts.id.prompt((notification: any) => {
          console.log("Immediate Google One Tap notification:", notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One Tap not displayed or skipped");
            onError?.(new Error("Google One Tap not available"));
          }
        });
      } else {
        // 脚本未加载，加载后立即弹出
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
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
            
            // 立即弹出
            google.accounts.id.prompt((notification: any) => {
              console.log("After load Google One Tap notification:", notification);
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log("One Tap not displayed or skipped");
                onError?.(new Error("Google One Tap not available"));
              }
            });
          }
        };
        script.onerror = () => onError?.(new Error("Failed to load Google Identity Services"));
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

  return { logout, promptGoogleOneTap };
}