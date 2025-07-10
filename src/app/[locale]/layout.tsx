import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { AppContextProvider } from "@/contexts/app";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://clientseeker.pro";
  
  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
    authors: [{ name: "ClientSeeker Team" }],
    creator: "ClientSeeker",
    publisher: "ClientSeeker",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale,
      url: `${webUrl}${locale === "en" ? "" : `/${locale}`}`,
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      siteName: "ClientSeeker",
      images: [
        {
          url: `${webUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("metadata.title") || "",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      images: [`${webUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${webUrl}${locale === "en" ? "" : `/${locale}`}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <NextAuthSessionProvider>
        <AppContextProvider>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AppContextProvider>
      </NextAuthSessionProvider>
    </NextIntlClientProvider>
  );
}
