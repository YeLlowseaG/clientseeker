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
  console.log("🔍 [AppContext] Provider initialized - START");

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Google One Tap 登录处理
  const handleGoogleSuccess = async (googleUser: any) => {
    try {
      console.log("Google One Tap successful:", googleUser);
      
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
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google One Tap error:", error);
  };

  // 初始化 Google One Tap (禁用自动弹出)
  const { logout: googleLogout, promptGoogleOneTap } = useGoogleOneTap({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    autoPrompt: false, // 禁用自动弹出
  });

  const fetchUserInfo = async function () {
    console.log("🔍 [AppContext] fetchUserInfo called");
    try {
      console.log("🔍 [AppContext] Making request to /api/get-user-info");
      const resp = await fetch("/api/get-user-info", {
        method: "POST",
      });

      console.log("🔍 [AppContext] Response status:", resp.status, "ok:", resp.ok);
      if (!resp.ok) {
        throw new Error("fetch user info failed with status: " + resp.status);
      }

      const { code, message, data } = await resp.json();
      console.log("🔍 [AppContext] Response data:", { code, message, userData: !!data });
      if (code !== 0) {
        throw new Error(message);
      }

      console.log("🔍 [AppContext] Setting user data:", data?.email, data?.nickname);
      setUser(data);

      updateInvite(data);
    } catch (e) {
      console.error("🔍 [AppContext] fetch user info failed:", e);
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
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        console.log("Restoring user from localStorage:", userInfo.email);
        setUser(userInfo);
      } catch (error) {
        console.error("Failed to parse saved user info:", error);
        localStorage.removeItem('user_info');
      }
    }
  }, []);

  // 登出功能
  const logout = () => {
    localStorage.removeItem('user_info');
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
