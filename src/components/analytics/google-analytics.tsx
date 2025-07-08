"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

export default function GoogleAnalytics() {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!analyticsId) {
    return null;
  }

  // 开发环境也启用GA，便于测试
  return <NextGoogleAnalytics gaId={analyticsId} />;
}
