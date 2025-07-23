"use client";

import { CacheKey } from "@/services/constant";
import { cacheSet } from "@/lib/cache";
import { getTimestamp } from "@/lib/time";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/icon";

export default function InviteCodePage() {
  const params = useParams();
  const code = params.code as string;
  const locale = params.locale as string || 'zh';
  const t = useTranslations();
  
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // expires 30 days
    const expires = 2592000;
    const expiresAt = getTimestamp() + expires;

    cacheSet(CacheKey.InviteCode, code, expiresAt);
    console.log("cache invite code", code, expiresAt);

    // 倒计时重定向
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 保持语言环境重定向到首页
          window.location.href = `/${locale}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, locale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon 
              name="RiGiftLine" 
              className="w-8 h-8 text-green-600"
            />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            {t("invite_page.title")}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="text-gray-600">
            <p className="text-sm">
              {t("invite_page.code_saved")}
            </p>
            <div className="mt-2 px-3 py-2 bg-gray-100 rounded-lg font-mono text-sm">
              {code}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Icon name="RiInformationLine" className="w-4 h-4" />
              <span className="font-medium">
                {t("invite_page.what_next")}
              </span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1 text-left">
              <li>• {t("invite_page.benefit_1")}</li>
              <li>• {t("invite_page.benefit_2")}</li>
              <li>• {t("invite_page.benefit_3")}</li>
            </ul>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
              <Icon 
                name="RiLoader4Line" 
                className="w-4 h-4 animate-spin"
              />
              <span>
                {t("invite_page.redirecting", { countdown })}
              </span>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              onClick={() => window.location.href = `/${locale}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {t("invite_page.go_now")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
