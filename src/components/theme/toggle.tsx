"use client";

import { BsMoonStars, BsSun } from "react-icons/bs";

import { CacheKey } from "@/services/constant";
import { cacheSet } from "@/lib/cache";
import { useAppContext } from "@/contexts/app";

export default function () {
  const { theme, setTheme } = useAppContext();

  const handleThemeChange = function (_theme: string) {
    if (_theme === theme) {
      return;
    }

    cacheSet(CacheKey.Theme, _theme, -1);
    setTheme(_theme);
  };

  return null;
}
