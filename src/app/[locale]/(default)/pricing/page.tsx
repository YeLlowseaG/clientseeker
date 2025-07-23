import Pricing from "@/components/blocks/pricing";
import { getPricingPage } from "@/services/page";
import { ProductStructuredData } from "@/components/structured-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiGiftLine, RiUserAddLine, RiSearchLine } from "react-icons/ri";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPricingPage(locale);
  const t = await getTranslations();

  console.log("🌟🌟🌟 PRICING PAGE RENDERED 🌟🌟🌟", { locale, hasPricing: !!page.pricing });

  return (
    <>
      {page.pricing && <Pricing pricing={page.pricing} />}
      
      {/* 推广入口卡片 */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-2">
                <RiGiftLine className="text-3xl text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {locale === 'zh' ? '邀请朋友，免费获得搜索次数' : 'Invite Friends, Get Free Searches'}
                </h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <RiUserAddLine className="text-2xl text-green-600 mx-auto" />
                  <p className="font-semibold text-gray-700">
                    {locale === 'zh' ? '邀请朋友注册' : 'Invite Friends'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'zh' ? '双方各得10次搜索' : 'Both get 10 searches'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <RiSearchLine className="text-2xl text-purple-600 mx-auto" />
                  <p className="font-semibold text-gray-700">
                    {locale === 'zh' ? '朋友购买套餐' : 'Friend Purchases'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'zh' ? '你再获得50次搜索' : 'You get 50 more searches'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <RiGiftLine className="text-2xl text-orange-600 mx-auto" />
                  <p className="font-semibold text-gray-700">
                    {locale === 'zh' ? '无限邀请' : 'Unlimited Invites'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'zh' ? '邀请越多，免费搜索越多' : 'More invites, more searches'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {locale === 'zh' 
                    ? '通过邀请朋友使用 ClientSeeker，你可以获得免费的搜索次数。这比购买套餐更划算！' 
                    : 'Get free search credits by inviting friends to use ClientSeeker. Better than buying plans!'
                  }
                </p>
                
                <Link href="/my-invites">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <RiUserAddLine className="mr-2" />
                    {locale === 'zh' ? '开始邀请朋友' : 'Start Inviting Friends'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ProductStructuredData />
    </>
  );
}
