'use client';

import { Search, MapPin, Phone, Star, Building2, Download, Globe, Shield, Clock, Target, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function FeaturesPage() {
  const t = useTranslations();
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('features.page_title')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.page_description')}
          </p>
        </div>

        {/* 核心功能概览 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.core_features_overview')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.smart_search.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.smart_search.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.smart_search.badges.keyword_search')}</Badge>
                    <Badge variant="outline">{t('features.core_features.smart_search.badges.industry_classification')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.smart_search.badges.fuzzy_matching')}</Badge>
                    <Badge variant="outline">{t('features.core_features.smart_search.badges.smart_suggestions')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.contact_info.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.contact_info.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.contact_info.badges.phone_number')}</Badge>
                    <Badge variant="outline">{t('features.core_features.contact_info.badges.detailed_address')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.contact_info.badges.rating_info')}</Badge>
                    <Badge variant="outline">{t('features.core_features.contact_info.badges.industry_category')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.precise_location.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.precise_location.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.precise_location.badges.province_city_district')}</Badge>
                    <Badge variant="outline">{t('features.core_features.precise_location.badges.auto_location')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.precise_location.badges.radius_search')}</Badge>
                    <Badge variant="outline">{t('features.core_features.precise_location.badges.map_display')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.data_export.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.data_export.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.data_export.badges.csv_export')}</Badge>
                    <Badge variant="outline">{t('features.core_features.data_export.badges.excel_compatible')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.data_export.badges.domestic_data')}</Badge>
                    <Badge variant="outline">{t('features.core_features.data_export.badges.chinese_encoding')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.multi_source.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.multi_source.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.multi_source.badges.gaode_maps')}</Badge>
                    <Badge variant="outline">{t('features.core_features.multi_source.badges.baidu_maps')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.multi_source.badges.google_maps')}</Badge>
                    <Badge variant="outline">{t('features.core_features.multi_source.badges.global_coverage')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-center">{t('features.core_features.data_security.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t('features.core_features.data_security.description')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.data_security.badges.ssl_encryption')}</Badge>
                    <Badge variant="outline">{t('features.core_features.data_security.badges.privacy_protection')}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{t('features.core_features.data_security.badges.compliant_data')}</Badge>
                    <Badge variant="outline">{t('features.core_features.data_security.badges.secure_storage')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 详细功能介绍 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.feature_details')}</h2>
          <div className="space-y-12">
            {/* 智能搜索功能 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Search className="h-8 w-8 text-blue-600" />
                    {t('features.detailed_features.smart_search.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('features.detailed_features.smart_search.description')}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.smart_search.features.keyword_matching.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.smart_search.features.keyword_matching.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.smart_search.features.industry_search.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.smart_search.features.industry_search.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.smart_search.features.search_suggestions.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.smart_search.features.search_suggestions.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">{t('features.detailed_features.smart_search.examples.search_example.title')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.smart_search.examples.search_example.description')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">{t('features.detailed_features.smart_search.examples.industry_categories.title')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.smart_search.examples.industry_categories.description')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">{t('features.detailed_features.smart_search.examples.smart_tips.title')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.smart_search.examples.smart_tips.description')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据获取功能 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">{t('features.detailed_features.comprehensive_info.examples.contact_info.title')}</div>
                        <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.comprehensive_info.examples.contact_info.description')}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">{t('features.detailed_features.comprehensive_info.examples.rating_info.title')}</div>
                        <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.comprehensive_info.examples.rating_info.description')}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">{t('features.detailed_features.comprehensive_info.examples.industry_category.title')}</div>
                        <div className="text-xs text-muted-foreground mt-1">{t('features.detailed_features.comprehensive_info.examples.industry_category.description')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Phone className="h-8 w-8 text-green-600" />
                    {t('features.detailed_features.comprehensive_info.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('features.detailed_features.comprehensive_info.description')}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.comprehensive_info.features.core_info.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.comprehensive_info.features.core_info.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.comprehensive_info.features.smart_deduplication.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.comprehensive_info.features.smart_deduplication.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{t('features.detailed_features.comprehensive_info.features.priority_sorting.title')}</h4>
                        <p className="text-sm text-muted-foreground">{t('features.detailed_features.comprehensive_info.features.priority_sorting.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用统计 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.usage_statistics')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-muted-foreground">{t('features.statistics.active_users')}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">500万+</div>
              <div className="text-muted-foreground">{t('features.statistics.enterprise_database')}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">85%+</div>
              <div className="text-muted-foreground">{t('features.statistics.accuracy_rate')}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-muted-foreground">{t('features.statistics.service_availability')}</div>
            </div>
          </div>
        </div>

        {/* FAQ区域 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.faq_title')}</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                  {t('features.faq.regions_supported.question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('features.faq.regions_supported.answer')}
                </p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>{t('features.faq.regions_supported.details.china.title')}</strong>{t('features.faq.regions_supported.details.china.description')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>{t('features.faq.regions_supported.details.global.title')}</strong>{t('features.faq.regions_supported.details.global.description')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <Download className="h-6 w-6 text-orange-600" />
                  {t('features.faq.export_limitations.question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {t('features.faq.export_limitations.answer')}
                </p>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {t('features.faq.export_limitations.china_data.status')}
                      </Badge>
                      <span className="font-medium text-green-800">{t('features.faq.export_limitations.china_data.title')}</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {t('features.faq.export_limitations.china_data.description')}
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                        {t('features.faq.export_limitations.google_data.status')}
                      </Badge>
                      <span className="font-medium text-amber-800">{t('features.faq.export_limitations.google_data.title')}</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {t('features.faq.export_limitations.google_data.description')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  {t('features.faq.data_accuracy.question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('features.faq.data_accuracy.answer')}
                </p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{t('features.faq.data_accuracy.measures.0')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{t('features.faq.data_accuracy.measures.1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{t('features.faq.data_accuracy.measures.2')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t('features.cta_title')}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t('features.cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/search">
                <Search className="h-5 w-5 mr-2" />
                {t('features.start_search')}
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="bg-white/20 text-white border border-white/50 hover:bg-white hover:text-blue-600">
              <Link href="/pricing">
                {t('features.view_pricing')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}