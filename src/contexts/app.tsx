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
import useOneTapLogin from "@/hooks/useOneTapLogin";
import { useSession } from "next-auth/react";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  console.log("🔍 [AppContext] Provider initialized - START");
  
  const { data: session } = useSession();
  console.log("🔍 [AppContext] useSession result:", !!session, session);
  
  console.log("Google One Tap config:", {
    enabled: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED,
    clientId: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  });
  
  if (
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  ) {
    console.log("Initializing Google One Tap...");
    useOneTapLogin();
  }

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [showFeedback, setShowFeedback] = useState<boolean>(false);

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
    console.log("🔍 [AppContext] useEffect triggered - session:", !!session, "session.user:", !!session?.user, "current user:", !!user);
    
    if (session) {
      if (session.user) {
        console.log("🔍 [AppContext] Session has user data, fetching user info");
        fetchUserInfo();
      } else {
        console.log("🔍 [AppContext] Session exists but no user data, trying to fetch anyway");
        fetchUserInfo();
      }
    } else {
      console.log("🔍 [AppContext] No session, clearing user state");
      setUser(null);
    }
  }, [session]);

  // 强制检查：即使没有 session，如果已认证就尝试获取用户信息
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();
        console.log("🔍 [AppContext] Manual session check:", sessionData);
        
        if (sessionData && sessionData.user && !user) {
          console.log("🔍 [AppContext] Found session data manually, fetching user info");
          fetchUserInfo();
        }
      } catch (error) {
        console.log("🔍 [AppContext] Manual session check failed:", error);
      }
    };

    // 如果 status 是 authenticated 但没有 session 或 user，尝试手动获取
    if (!session && !user) {
      console.log("🔍 [AppContext] No session/user, manually checking auth status");
      checkAuth();
    }
  }, [session, user]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        showFeedback,
        setShowFeedback,
      }}
    >
      <div style={{position: 'fixed', top: 0, left: 0, background: 'blue', color: 'white', padding: '4px', zIndex: 9999}}>
        🔍 AppContext: Session={!!session}, User={!!user}
      </div>
      {children}
    </AppContext.Provider>
  );
};
