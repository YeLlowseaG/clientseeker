"use client";

import { useEffect } from "react";

export default function UserCenterPage() {
  useEffect(() => {
    // 强制跳转到dashboard，绕过任何路由问题
    window.location.replace("/dashboard");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">正在跳转到用户中心...</p>
      </div>
    </div>
  );
}