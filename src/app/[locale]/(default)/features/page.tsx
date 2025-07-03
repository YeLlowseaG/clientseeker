'use client';

import { Search, MapPin, Phone, Star, Building2, Download, Globe, Shield, Clock, Target, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';

export default function FeaturesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ClientSeeker 功能介绍</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            全面了解ClientSeeker的强大功能，助力您的客户开发工作更加高效精准
          </p>
        </div>

        {/* 核心功能概览 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能一览</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-center">智能搜索引擎</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  支持自然语言搜索，智能识别行业关键词，精准匹配目标客户群体
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">关键词搜索</Badge>
                    <Badge variant="outline">行业分类</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">模糊匹配</Badge>
                    <Badge variant="outline">智能推荐</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-center">联系信息获取</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  自动获取企业电话、地址、评分等关键信息，提供完整的客户档案
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">电话号码</Badge>
                    <Badge variant="outline">详细地址</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">评分信息</Badge>
                    <Badge variant="outline">行业分类</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-center">精准地理定位</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  支持全国34个省市自治区，精确到区县级别的地理范围搜索
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">省市区选择</Badge>
                    <Badge variant="outline">自动定位</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">范围搜索</Badge>
                    <Badge variant="outline">地图展示</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-center">一键数据导出</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  支持CSV格式导出，兼容Excel打开，便于CRM系统导入和后续客户管理
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">CSV导出</Badge>
                    <Badge variant="outline">Excel兼容</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">批量下载</Badge>
                    <Badge variant="outline">中文编码</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-center">多源数据整合</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  整合高德地图、百度地图、Google Maps等权威数据源
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">高德地图</Badge>
                    <Badge variant="outline">百度地图</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">Google Maps</Badge>
                    <Badge variant="outline">智能去重</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-center">数据安全保障</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  严格遵守数据保护法规，确保用户隐私和数据安全
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">SSL加密</Badge>
                    <Badge variant="outline">隐私保护</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">合规数据</Badge>
                    <Badge variant="outline">安全存储</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 详细功能介绍 */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">功能详细说明</h2>
          <div className="space-y-12">
            {/* 智能搜索功能 */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Search className="h-8 w-8 text-blue-600" />
                    智能搜索引擎
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    采用先进的自然语言处理技术，支持多种搜索方式，让您轻松找到目标客户。
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">关键词智能匹配</h4>
                        <p className="text-sm text-muted-foreground">支持模糊搜索，自动识别相关行业词汇</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">行业分类搜索</h4>
                        <p className="text-sm text-muted-foreground">按餐饮、美容、汽修等行业精准分类</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">搜索建议</h4>
                        <p className="text-sm text-muted-foreground">智能推荐相关搜索词，提升搜索效率</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">搜索示例</div>
                      <div className="text-xs text-muted-foreground mt-1">输入"川菜餐厅" → 自动匹配相关餐饮企业</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">行业分类</div>
                      <div className="text-xs text-muted-foreground mt-1">餐饮、美容、汽修、医疗、教育等</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm font-medium">智能提示</div>
                      <div className="text-xs text-muted-foreground mt-1">根据输入自动推荐相关关键词</div>
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
                        <div className="text-sm font-medium">联系信息</div>
                        <div className="text-xs text-muted-foreground mt-1">企业名称、电话、详细地址等</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">评分信息</div>
                        <div className="text-xs text-muted-foreground mt-1">来自地图服务的用户评分数据</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">行业分类</div>
                        <div className="text-xs text-muted-foreground mt-1">餐饮、美容、汽修等业务类型标签</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Phone className="h-8 w-8 text-green-600" />
                    全面信息获取
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    获取企业核心联系信息和基础资料，为您的客户开发提供准确的数据支持。
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">核心信息获取</h4>
                        <p className="text-sm text-muted-foreground">企业名称、电话、地址、评分等关键联系信息</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">智能去重</h4>
                        <p className="text-sm text-muted-foreground">自动识别重复商户，确保信息的唯一性</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">优先级排序</h4>
                        <p className="text-sm text-muted-foreground">优先展示有电话号码的高质量客户</p>
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
          <h2 className="text-3xl font-bold text-center mb-12">使用数据统计</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-muted-foreground">活跃用户</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">500万+</div>
              <div className="text-muted-foreground">企业数据库</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">85%+</div>
              <div className="text-muted-foreground">信息准确率</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-muted-foreground">全天候服务</div>
            </div>
          </div>
        </div>

        {/* CTA区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">立即体验ClientSeeker</h2>
          <p className="text-xl mb-8 opacity-90">
            开始您的高效客户开发之旅，让潜在客户主动找到您
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/search">
                <Search className="h-5 w-5 mr-2" />
                开始搜索客户
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="bg-white/20 text-white border border-white/50 hover:bg-white hover:text-blue-600">
              <Link href="/pricing">
                查看定价方案
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}