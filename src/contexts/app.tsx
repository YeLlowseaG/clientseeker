"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { cacheGet, cacheRemove } from "@/lib/cache";

import { CacheKey } from "@/services/constant";
import { ContextValue } from "@/types/context";
import { User } from "@/types/user";
import moment from "moment";
import { useGoogleOneTap } from "@/hooks/useGoogleOneTap";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Google One Tap 登录处理
  const handleGoogleSuccess = async (googleUser: any) => {
    try {
      console.log("Google One Tap successful:", googleUser);
      
      // 立即关闭登录模态框
      setShowSignModal(false);
      
      // 立即显示"登录状态更新中"的提示
      const updateMessage = document.createElement('div');
      updateMessage.id = 'login-status-update';
      updateMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      updateMessage.innerHTML = `
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <span>登录状态更新中...</span>
      `;
      
      // 添加旋转动画的CSS
      if (!document.getElementById('spin-animation-style')) {
        const style = document.createElement('style');
        style.id = 'spin-animation-style';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      document.body.appendChild(updateMessage);
      
      // 保存用户信息到 localStorage
      const userInfo = {
        uuid: googleUser.sub,
        email: googleUser.email,
        nickname: googleUser.name,
        avatar_url: googleUser.picture,
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      setUser(userInfo);
      
      // 保存用户到数据库
      try {
        console.log("🔍 [Google Login] Saving user to database:", userInfo);
        const saveResponse = await fetch('/api/save-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });
        
        console.log("🔍 [Google Login] Save response status:", saveResponse.status, saveResponse.ok);
        
        if (saveResponse.ok) {
          const { user: savedUser } = await saveResponse.json();
          console.log("🔍 [Google Login] User saved successfully:", savedUser);
          // 更新本地用户信息为数据库返回的完整信息
          localStorage.setItem('user_info', JSON.stringify(savedUser));
          setUser(savedUser);
        } else {
          const errorData = await saveResponse.json();
          console.error("🔍 [Google Login] Failed to save user - response:", errorData);
        }
      } catch (saveError) {
        console.error("🔍 [Google Login] Failed to save user to database:", saveError);
        // 即使保存失败也继续登录流程
      }
      
      // 获取完整的用户信息（包括credits等）
      await fetchUserInfo(googleUser.email);
      
      // 移除"登录状态更新中"提示
      const existingUpdateMessage = document.getElementById('login-status-update');
      if (existingUpdateMessage && existingUpdateMessage.parentNode) {
        existingUpdateMessage.parentNode.removeChild(existingUpdateMessage);
      }
      
      // 显示成功提示
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
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      successMessage.innerHTML = '✅ 登录成功！';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Google login processing failed:", error);
      
      // 移除"登录状态更新中"提示
      const existingUpdateMessage = document.getElementById('login-status-update');
      if (existingUpdateMessage && existingUpdateMessage.parentNode) {
        existingUpdateMessage.parentNode.removeChild(existingUpdateMessage);
      }
      
      // 显示错误提示
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      `;
      errorMessage.innerHTML = '❌ 登录处理失败，请重试';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 3000);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google One Tap error:", error);
  };

  // 初始化 Google One Tap (禁用自动弹出)
  const { logout: googleLogout, promptGoogleOneTap, isLoading: googleLoading } = useGoogleOneTap({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    autoPrompt: false, // 禁用自动弹出
    onLoadingChange: setIsGoogleLoading, // 传入加载状态回调
  });

  const fetchUserInfo = async function (userEmail?: string) {
    if (!userEmail && !user?.email) {
      return;
    }
    
    const email = userEmail || user?.email;
    if (!email) return;
    
    try {
      const resp = await fetch(`/api/get-user-info?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });

      if (!resp.ok) {
        throw new Error("fetch user info failed with status: " + resp.status);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);

      updateInvite(data);
    } catch (e) {
      console.error("fetch user info failed:", e);
    }
  };

  const updateInvite = async (user: User) => {
    try {
      if (user.invited_by) {
        // user already been invited
        console.log("user already been invited", user.invited_by);
        return;
      }

      const inviteCode = cacheGet(CacheKey.InviteCode);
      if (!inviteCode) {
        // no invite code
        return;
      }

      const userCreatedAt = moment(user.created_at).unix();
      const currentTime = moment().unix();
      const timeDiff = Number(currentTime - userCreatedAt);

      if (timeDiff <= 0 || timeDiff > 7200) {
        // user created more than 2 hours
        console.log("user created more than 2 hours");
        return;
      }

      // update invite relation
      console.log("update invite", inviteCode, user.uuid);
      const req = {
        invite_code: inviteCode,
        user_uuid: user.uuid,
      };
      const resp = await fetch("/api/update-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!resp.ok) {
        throw new Error("update invite failed with status: " + resp.status);
      }
      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);
      cacheRemove(CacheKey.InviteCode);
    } catch (e) {
      console.log("update invite failed: ", e);
    }
  };

  useEffect(() => {
    // 从 localStorage 恢复用户状态
    const savedUser = localStorage.getItem('user_info');
    console.log("🔍🔍🔍 [AppContext] useEffect triggered - Loading user from localStorage:", !!savedUser);
    
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        console.log("🔍🔍🔍 [AppContext] Parsing saved user:", userInfo);
        console.log("🔍🔍🔍 [AppContext] Setting user in AppContext:", userInfo.email);
        setUser(userInfo);
        
        // 恢复后立即获取最新的用户信息
        console.log("🔍🔍🔍 [AppContext] Calling fetchUserInfo...");
        fetchUserInfo(userInfo.email);
        setIsUserLoading(false);
        console.log("🔍🔍🔍 [AppContext] User restoration completed");
      } catch (error) {
        console.error("🔍🔍🔍 [AppContext] Failed to parse saved user info:", error);
        localStorage.removeItem('user_info');
        setIsUserLoading(false);
      }
    } else {
      console.log("🔍🔍🔍 [AppContext] No saved user found in localStorage");
      setIsUserLoading(false);
    }
  }, []);

  // 登出功能
  const logout = () => {
    localStorage.removeItem('user_info');
    // 清理微信登录相关数据
    localStorage.removeItem('wechat_user_info');
    localStorage.removeItem('wechat_login_success');
    localStorage.removeItem('wechat_oauth_state');
    setUser(null);
    googleLogout();
    console.log("User logged out");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        logout,
        promptGoogleOneTap,
        showFeedback,
        setShowFeedback,
        isUserLoading,
        isGoogleLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
