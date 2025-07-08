"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "@/i18n/navigation";
import { User } from "@/types/user";
import { useTranslations } from "next-intl";
import { NavItem } from "@/types/blocks/base";
import { useAppContext } from "@/contexts/app";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();
  const { logout } = useAppContext();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // 优化的退出登录函数
  const handleLogout = async () => {
    if (isLoggingOut) return; // 防止重复点击
    
    setIsLoggingOut(true);
    try {
      // 1. 先调用AppContext的logout清理本地状态
      logout();
      
      // 2. 调用NextAuth的signOut并重定向到首页
      await signOut({ 
        redirect: false, // 阻止NextAuth自动重定向
        callbackUrl: "/" 
      });
      
      // 3. 手动跳转到首页
      router.push("/");
      
      // 4. 强制刷新页面确保状态完全清除
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      
    } catch (error) {
      console.error("Logout error:", error);
      // 如果出错，强制跳转到首页
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const dropdownItems: NavItem[] = [
    {
      title: user.nickname,
    },
    {
      title: t("user.dashboard") || "用户中心",
      url: "/dashboard",
    },
    {
      title: isLoggingOut ? "正在退出..." : t("user.sign_out"),
      onClick: handleLogout,
      disabled: isLoggingOut,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar_url} alt={user.nickname} />
          <AvatarFallback>{user.nickname}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4 bg-background">
        {dropdownItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.url ? (
              <DropdownMenuItem key={index} asChild>
                <Link href={item.url as any} className="flex justify-center cursor-pointer">
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={index}
                className={`flex justify-center ${
                  (item as any).disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                disabled={(item as any).disabled}
                onClick={item.onClick}
              >
                {item.title}
              </DropdownMenuItem>
            )}
            {index !== dropdownItems.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
