import ConsoleLayout from "@/components/console/layout";
import ConsoleAuthWrapper from "@/components/console/auth-wrapper";
import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";
import { getTranslations } from "next-intl/server";

export default async function ({ children }: { children: ReactNode }) {
  const t = await getTranslations();

  const sidebar: Sidebar = {
    nav: {
      items: [
        {
          title: t("user.my_orders"),
          url: "/my-orders",
          icon: "RiOrderPlayLine",
          is_active: false,
        },
        {
          title: t("my_credits.title"),
          url: "/my-credits",
          icon: "RiBankCardLine",
          is_active: false,
        },
        {
          title: t("my_invites.title"),
          url: "/my-invites",
          icon: "RiMoneyCnyCircleFill",
          is_active: false,
        },
        {
          title: t("api_keys.title"),
          url: "/api-keys",
          icon: "RiKey2Line",
          is_active: false,
        },
      ],
    },
  };

  return (
    <ConsoleAuthWrapper>
      <ConsoleLayout sidebar={sidebar}>{children}</ConsoleLayout>
    </ConsoleAuthWrapper>
  );
}
