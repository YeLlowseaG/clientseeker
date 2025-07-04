"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function () {
  const { data: session, status } = useSession();

  const oneTapLogin = async function () {
    const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
    
    console.log("Google One Tap - trying to initialize with clientId:", clientId);

    // 动态加载 Google Identity Services
    if (typeof window !== "undefined" && clientId) {
      try {
        // 检查是否已经加载了 Google Identity Services
        if (!(window as any).google) {
          console.log("Loading Google Identity Services script...");
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.onload = () => {
            console.log("Google Identity Services loaded, initializing One Tap...");
            initializeOneTap(clientId);
          };
          script.onerror = (error) => {
            console.error("Failed to load Google Identity Services:", error);
          };
          document.head.appendChild(script);
        } else {
          console.log("Google Identity Services already loaded, initializing...");
          initializeOneTap(clientId);
        }
      } catch (error) {
        console.error("Google One Tap - initialization error:", error);
      }
    }
  };

  const initializeOneTap = (clientId: string) => {
    try {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        console.log("Initializing Google One Tap with clientId:", clientId);
        
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            console.log("Google One Tap - login success:", response);
            handleLogin(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        google.accounts.id.prompt((notification: any) => {
          console.log("Google One Tap prompt result:", notification);
        });
      } else {
        console.error("Google Identity Services not properly loaded");
      }
    } catch (error) {
      console.error("Error initializing Google One Tap:", error);
    }
  };

  const handleLogin = async function (credentials: string) {
    const res = await signIn("google-one-tap", {
      credential: credentials,
      redirect: false,
    });
    console.log("signIn ok", res);
    
    if (res?.ok) {
      // 登录成功，显示成功消息
      console.log("Google One Tap - Login successful!");
      
      // 创建成功提示
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      `;
      successMessage.innerHTML = '✅ 登录成功！';
      
      // 添加动画样式
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(successMessage);
      
      // 3秒后自动移除提示
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 3000);
    }
  };

  useEffect(() => {
    console.log("Google One Tap - useEffect triggered, status:", status, "session:", session);

    // 修复：只要没有 session 就显示 One Tap，不管 status 是什么
    if (!session) {
      console.log("Google One Tap - No session found, starting One Tap...");
      oneTapLogin();

      const intervalId = setInterval(() => {
        console.log("Google One Tap - Retry attempt...");
        oneTapLogin();
      }, 5000);

      return () => {
        console.log("Google One Tap - Clearing interval");
        clearInterval(intervalId);
      };
    } else {
      console.log("Google One Tap - Session exists, skipping. Session:", session);
    }
  }, [status, session]); // 同时监听 session 变化

  return <></>;
}
