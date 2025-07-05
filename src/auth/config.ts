import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { getIsoTimestr } from "@/lib/time";
import { getUuid } from "@/lib/hash";
import { saveUser } from "@/services/user";
import { handleSignInUser } from "./handler";
import { DrizzleAdapter } from "./adapter";

let providers: Provider[] = [];

// Google One Tap Auth - 移除NextAuth集成，改用纯客户端实现

// Google Auth - standard OAuth provider needed for session management
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Github Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  // adapter: DrizzleAdapter(),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // 强制开启调试
  trustHost: true, // 修复 NextAuth v5 beta 的主机信任问题
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/zh/search`;
    },
    async session({ session, token, user }) {
      console.log("🔍 [NextAuth] Session callback - token:", !!token, "token.user:", !!token?.user);
      console.log("🔍 [NextAuth] Session callback - full token:", token);
      
      if (token && token.user) {
        session.user = token.user;
        console.log("🔍 [NextAuth] Session callback - user set:", session.user);
      } else {
        console.log("🔍 [NextAuth] Session callback - no user data available");
        // 如果 token 存在但没有 user 数据，创建基本用户信息
        if (token && token.email) {
          session.user = {
            email: token.email,
            name: token.name,
            image: token.picture
          };
          console.log("🔍 [NextAuth] Session callback - created basic user from token");
        }
      }
      
      console.log("🔍 [NextAuth] Session callback - final session:", session);
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        if (user && account) {
          // First time login
          const userInfo = await handleSignInUser(user, account);
          if (userInfo) {
            token.user = {
              uuid: userInfo.uuid,
              email: userInfo.email,
              nickname: userInfo.nickname,
              avatar_url: userInfo.avatar_url,
              created_at: userInfo.created_at,
            };
          }
        }
        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
};
