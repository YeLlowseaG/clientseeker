import Pricing from "@/components/blocks/pricing";
import { getPricingPage } from "@/services/page";
import { ProductStructuredData } from "@/components/structured-data";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPricingPage(locale);

  console.log("🌟🌟🌟 PRICING PAGE RENDERED 🌟🌟🌟", { locale, hasPricing: !!page.pricing });

  return (
    <>
      {page.pricing && <Pricing pricing={page.pricing} />}
      <ProductStructuredData />
    </>
  );
}
