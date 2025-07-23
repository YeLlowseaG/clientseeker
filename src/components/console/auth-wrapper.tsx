"use client";

import { ReactNode, useEffect } from "react";
import { useAppContext } from "@/contexts/app";
import { useRouter } from "next/navigation";

export default function ConsoleAuthWrapper({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // 等待客户端水合完成后检查认证状态
    if (user === undefined) {
      // 还在加载中，不做任何操作
      return;
    }

    if (!user || !user.email) {
      // 未登录，重定向到登录页
      const currentPath = window.location.pathname;
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [user, router]);

  // 用户未加载完成时显示加载状态
  if (user === undefined) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  // 未登录时不渲染内容（将会被重定向）
  if (!user || !user.email) {
    return null;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}