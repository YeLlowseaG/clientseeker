"use client";

import googleOneTap from "google-one-tap";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function () {
  const { data: session, status } = useSession();

  const oneTapLogin = async function () {
    const options = {
      client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: "signin",
    };

    console.log("Google One Tap - trying to initialize with options:", options);

    try {
      googleOneTap(options, (response: any) => {
        console.log("Google One Tap - login success:", response);
        handleLogin(response.credential);
      });
    } catch (error) {
      console.error("Google One Tap - initialization error:", error);
    }
  };

  const handleLogin = async function (credentials: string) {
    const res = await signIn("google-one-tap", {
      credential: credentials,
      redirect: false,
    });
    console.log("signIn ok", res);
  };

  useEffect(() => {
    console.log("Google One Tap - useEffect triggered, status:", status, "session:", session);

    if (status === "unauthenticated") {
      console.log("Google One Tap - User not authenticated, starting One Tap...");
      oneTapLogin();

      const intervalId = setInterval(() => {
        console.log("Google One Tap - Retry attempt...");
        oneTapLogin();
      }, 5000); // 增加到5秒重试一次

      return () => {
        console.log("Google One Tap - Clearing interval");
        clearInterval(intervalId);
      };
    } else {
      console.log("Google One Tap - User already authenticated, skipping");
    }
  }, [status]);

  return <></>;
}
