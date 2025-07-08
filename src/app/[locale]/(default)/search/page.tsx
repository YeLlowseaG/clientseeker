'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Building2, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import RegionSelector from '@/components/region-selector';
import Pagination from '@/components/pagination';
import { BusinessInfo } from '@/lib/maps';
import { SelectedRegion } from '@/lib/regions/types';
import { useAppContext } from '@/contexts/app';
import { useTranslations } from 'next-intl';

interface LocationInfo {
  ip: string;
  country: string;
  city: string;
  isChina: boolean;
}

interface QuotaInfo {
  remaining: number;
  total: number;
  used: number;
  productId: string;
}

interface SearchResult {
  results: BusinessInfo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  location: LocationInfo;
  sources: string[];
  success: boolean;
  networkWarning?: string;
  quota?: QuotaInfo;
  error?: string;
  message?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { user, setShowSignModal } = useAppContext();
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BusinessInfo[]>([]);
  const [allResults, setAllResults] = useState<BusinessInfo[]>([]); // 缓存所有结果
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion>({});
  const [error, setError] = useState('');
  const [networkWarning, setNetworkWarning] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchLocation();
    
    if (user) {
      fetchQuotaInfo();
    }
  }, [user]);

  const fetchQuotaInfo = async () => {
    try {
      const response = await fetch('/api/user/quota');
      if (response.ok) {
        const data = await response.json();
        setQuotaInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch quota info:', error);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch('/api/geo');
      const data = await response.json();
      if (data.success) {
        setLocation(data.location);
        // 根据位置信息设置默认地区（这里可以进一步优化，根据实际城市名称匹配）
        if (data.location?.city) {
          // 可以在这里添加根据城市名称自动选择对应地区的逻辑
        }
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const performSearch = async (page: number = 1, forceRefresh: boolean = false) => {
    if (!query.trim()) return;

    // 如果不是强制刷新且有缓存数据，直接使用前端分页
    if (!forceRefresh && allResults.length > 0 && page !== 1) {
      setCurrentPage(page);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setResults(allResults.slice(startIndex, endIndex));
      return;
    }

    setLoading(true);
    setError('');
    setNetworkWarning('');

    try {
      // 构建城市参数，优先使用地区选择器的结果
      let cityParam = '';
      if (selectedRegion.district) {
        cityParam = `${selectedRegion.city?.name} ${selectedRegion.district.name}`;
      } else if (selectedRegion.city) {
        cityParam = selectedRegion.city.name;
      } else if (selectedRegion.province) {
        cityParam = selectedRegion.province.name;
      }

      console.log("🔍 [Search] Starting search with params:", {
        query: query.trim(),
        city: cityParam,
        userEmail: user?.email,
        hasUser: !!user
      });

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          city: cityParam,
          page: 1, // 总是请求第一页以获取所有数据
          pageSize: 1000, // 请求更多数据以便前端分页
          userRegionType: selectedRegion.regionType, // 用户手动选择的地区类型
          userEmail: user?.email // 添加用户email用于后端验证
        }),
      });

      console.log("🔍 [Search] Response status:", response.status, response.ok);
      const data: SearchResult = await response.json();
      console.log("🔍 [Search] Response data:", data);

      if (data.success) {
        // 缓存所有结果
        setAllResults(data.results);
        setTotalCount(data.results.length);
        setTotalPages(Math.ceil(data.results.length / pageSize));
        
        // 设置当前页的结果
        setCurrentPage(page);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setResults(data.results.slice(startIndex, endIndex));
        
        setLocation(data.location);
        setNetworkWarning(data.networkWarning || '');
        
        // 更新配额信息
        if (data.quota) {
          setQuotaInfo(data.quota);
        }
      } else {
        console.error("🔍 [Search] Search failed:", {
          status: response.status,
          data: data
        });
        
        if (response.status === 403) {
          // 配额不足
          setError(data.message || t('search.quota_exhausted_message'));
        } else if (response.status === 401) {
          // 未认证
          setError(t('search.login_required'));
        } else {
          setError(data.message || data.error || t('search.search_failed'));
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(t('search.network_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查用户登录状态，未登录显示登录弹窗
    if (!user) {
      setShowSignModal(true);
      return;
    }
    
    setCurrentPage(1); // 重置到第一页
    setAllResults([]); // 清空缓存，强制重新搜索
    await performSearch(1, true);
  };

  const handlePageChange = async (page: number) => {
    // 滚动到页面顶部，提升用户体验
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 使用前端分页（除非是新搜索）
    await performSearch(page, false);
  };

  const formatPhone = (phone: string | undefined) => {
    if (!phone || typeof phone !== 'string') return null;
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  const handleExport = async () => {
    if (!query.trim() || totalCount === 0) return;

    try {
      // 获取当次搜索的所有结果（从缓存）
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          city: selectedRegion.district ? 
            `${selectedRegion.city?.name} ${selectedRegion.district.name}` :
            selectedRegion.city?.name || selectedRegion.province?.name || '',
          page: 1,
          pageSize: Math.max(totalCount, 1000), // 导出所有结果
          userRegionType: selectedRegion.regionType,
          userEmail: user?.email // 添加用户email用于后端验证
        }),
      });

      const data = await response.json();
      
      if (!data.success || !data.results || data.results.length === 0) {
        console.error('Export failed: unable to get search results');
        return;
      }

      // 格式化手机号码，确保Excel中显示为文本
      const formatPhoneForExcel = (phone: any): string => {
        if (!phone) return '暂无';
        
        // 转换为字符串，确保保留前导零
        let phoneStr = String(phone).trim();
        
        // 如果是空字符串或无意义的值，返回暂无
        if (!phoneStr || phoneStr === '0' || phoneStr === '000') {
          return t('search.no_phone');
        }
        
        // 处理可能丢失前导零的区号（如：10位数字且不以1开头）
        if (/^\d{10}$/.test(phoneStr) && /^[2-9]/.test(phoneStr)) {
          console.log(`导出时修复缺失前导0的号码: "${phone}" -> "0${phoneStr}"`);
          phoneStr = '0' + phoneStr;
        }
        
        // 在号码前添加制表符，强制Excel将其识别为文本
        return '\t' + phoneStr;
      };

      // 准备CSV数据 - 使用所有搜索结果
      const headers = [t('search.export.customer_name'), t('search.export.address'), t('search.export.contact_phone'), t('search.export.rating'), t('search.export.category'), t('search.export.data_source')];
      const csvData = [
        headers,
        ...data.results.map((business: any) => [
          business.name,
          business.address,
          formatPhoneForExcel(business.phone),
          business.rating?.toString() || t('search.no_data'),
          business.category || t('search.no_data'),
          business.source === 'gaode' ? t('search.gaode_maps') : t('search.baidu_maps')
        ])
      ];

      // 转换为CSV格式
      const csvContent = csvData.map(row => 
        row.map((field: string) => `"${field}"`).join(',')
      ).join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 生成文件名：客户联系信息_城市_关键词_时间戳.csv
      const timestamp = new Date().getTime();
      const safeQuery = query.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_'); // 清理特殊字符
      
      // 构建城市信息
      let cityName = '';
      if (selectedRegion.district) {
        cityName = `${selectedRegion.city?.name || ''}_${selectedRegion.district.name}`;
      } else if (selectedRegion.city) {
        cityName = selectedRegion.city.name;
      } else if (selectedRegion.province) {
        cityName = selectedRegion.province.name;
      } else if (location?.city) {
        cityName = location.city;
      }
      
      // 清理城市名称中的特殊字符
      const safeCityName = cityName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      
      const filename = safeCityName 
        ? `${t('search.export.filename_prefix')}_${safeCityName}_${safeQuery}_${timestamp}.csv`
        : `${t('search.export.filename_prefix')}_${safeQuery}_${timestamp}.csv`;
      
      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Export completed: ${data.results.length} records`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };


  // 移除未登录用户的阻拦，允许所有用户访问搜索页面

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题区域 - 固定高度 */}
        <div className="text-center mb-8 h-[200px] flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">{t('search.page_title')}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t('search.page_description')}
          </p>
          
          {location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{t('search.current_location')}: {location.country} {location.city}</span>
              <Badge variant={location.isChina ? "default" : "secondary"}>
                {location.isChina ? t('search.domestic_data') : t('search.international_data')}
              </Badge>
            </div>
          )}
        </div>

      {/* 配额信息显示 */}
      {quotaInfo && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('search.search_quota')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('search.remaining_quota', { remaining: quotaInfo.remaining, total: quotaInfo.total })}
                  </p>
                </div>
              </div>
              {quotaInfo.remaining <= 3 && quotaInfo.productId === 'free' && (
                <Button
                  size="sm"
                  onClick={() => router.push('/#pricing')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {t('search.upgrade_plan')}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-8 space-y-6">
        {/* 搜索输入和按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('search.search_placeholder')}
              value={query}
              onChange={(e) => {
                const newQuery = e.target.value;
                setQuery(newQuery);
                
                // 如果搜索框被清空，清除搜索结果
                if (newQuery.trim() === '') {
                  setResults([]);
                  setAllResults([]);
                  setCurrentPage(1);
                  setTotalCount(0);
                  setTotalPages(0);
                  setError('');
                  setNetworkWarning('');
                }
              }}
              className="h-12"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || Boolean(quotaInfo && quotaInfo.remaining <= 0)} 
            className="h-12 px-8"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? t('search.searching') : 
             !user ? t('search.login_to_search') :
             quotaInfo && quotaInfo.remaining <= 0 ? t('search.quota_insufficient') : t('search.search')}
          </Button>
        </div>

        {/* 地区选择器 */}
        <div className="max-w-4xl mx-auto">
          <RegionSelector
            isChina={location?.isChina || false}
            defaultRegion={selectedRegion}
            onRegionChange={(newRegion) => {
              setSelectedRegion(newRegion);
              // 切换地区时清空搜索结果
              setResults([]);
              setAllResults([]);
              setCurrentPage(1);
              setTotalCount(0);
              setTotalPages(0);
              setError('');
              setNetworkWarning('');
            }}
            className="w-full"
          />
        </div>
      </form>

      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes('配额') && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={() => router.push('/#pricing')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {t('search.view_plans')}
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {networkWarning && (
        <div className="text-center text-orange-600 bg-orange-50 p-4 rounded-lg mb-6">
          <p className="text-sm">{networkWarning}</p>
          <p className="text-xs mt-2 text-orange-500">
            {t('search.network_warning_suggestion')}
          </p>
        </div>
      )}

        {/* 搜索结果区域 - 固定最小高度 */}
        <div className="min-h-[600px] bg-white rounded-lg shadow-sm p-6">
          {/* 分页器和导出按钮 - 顶部 */}
          {totalCount > 0 && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
                
                {/* 导出按钮 - 仅国内数据支持导出 */}
                {location?.isChina ? (
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={loading || totalCount === 0}
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('search.export_all', { count: totalCount })}
                  </Button>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <span className="font-medium">{t('search.export_tip')}</span>
                    <span className="ml-1">{t('search.google_maps_export_note')}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {location && (
                    <span>
                      {t('search.data_source')}: {location.isChina ? t('search.domestic_data_description') : t('search.international_data_description')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 搜索结果列表或空状态 */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{business.name}</CardTitle>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {business.source}
                </Badge>
              </div>
              {business.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{business.rating}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground line-clamp-2">
                  {business.address}
                </span>
              </div>
              
              {business.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="font-medium text-green-600">
                    {formatPhone(business.phone)}
                  </span>
                </div>
              )}
              
              {business.category && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {business.category}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
              ))}
            </div>
          ) : (
            /* 空状态显示 */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {!query ? (
                /* 初始状态 */
                <div>
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('search.start_finding_customers')}</h3>
                  <p className="text-gray-500">
                    {t('search.start_search_instruction')}
                  </p>
                </div>
              ) : loading ? (
                /* 加载状态 */
                <div className="max-w-md mx-auto space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <h3 className="text-lg font-medium">{t('search.searching_status')}</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{t('search.searching_step1')}</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('search.searching_step2')}</span>
                      <div className="animate-pulse text-blue-600">⏳</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('search.searching_step3')}</span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                    <p className="text-xs mt-4">
                      {t('search.search_time_estimate')}
                    </p>
                  </div>
                </div>
              ) : (
                /* 无结果状态 */
                <div>
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('search.no_relevant_customers')}</h3>
                  <p className="text-gray-500">
                    {t('search.try_different_keywords')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 分页器 - 底部 */}
          {totalCount > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
              />
              
              {/* 回到顶部 */}
              <div className="text-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {t('search.back_to_top')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 产品介绍和SEO内容区域 */}
        <div className="mt-16 space-y-16">
          {/* 什么是ClientSeeker */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t('search.what_is_clientseeker')}</h2>
                <p className="text-lg text-muted-foreground">
                  {t('search.what_is_description')}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                <p className="text-lg leading-relaxed">
                  {t('search.comprehensive_service_description')}
                </p>
              </div>
            </div>
          </div>

          {/* 为什么选择ClientSeeker */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t('search.why_choose_clientseeker')}</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.accurate_comprehensive.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.accurate_comprehensive.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.smart_deduplication.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.smart_deduplication.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.wide_coverage.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.wide_coverage.description')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.simple_efficient.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.simple_efficient.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.secure_compliant.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.secure_compliant.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t('search.features.cost_effective.title')}</h3>
                      <p className="text-muted-foreground">{t('search.features.cost_effective.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 如何使用ClientSeeker */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t('search.how_to_use_clientseeker')}</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-3">{t('search.how_to_use.step1.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.how_to_use.step1.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-3">{t('search.how_to_use.step2.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.how_to_use.step2.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-3">{t('search.how_to_use.step3.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.how_to_use.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 核心功能 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t('search.clientseeker_features')}</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.precise_search.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.precise_search.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.contact_retrieval.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.contact_retrieval.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.multi_source.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.multi_source.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.data_export.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.data_export.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.geo_location.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.geo_location.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.core_features.quality_rating.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.core_features.quality_rating.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 热门潜在客户行业 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t('search.popular_industries')}</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800">{t('search.industries.food_beverage.title')}</h3>
                  <p className="text-sm text-blue-600 mb-2">{t('search.industries.food_beverage.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.food_beverage.suitable')}</p>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-pink-800">{t('search.industries.beauty.title')}</h3>
                  <p className="text-sm text-pink-600 mb-2">{t('search.industries.beauty.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.beauty.suitable')}</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-green-800">{t('search.industries.automotive.title')}</h3>
                  <p className="text-sm text-green-600 mb-2">{t('search.industries.automotive.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.automotive.suitable')}</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-purple-800">{t('search.industries.healthcare.title')}</h3>
                  <p className="text-sm text-purple-600 mb-2">{t('search.industries.healthcare.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.healthcare.suitable')}</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-orange-800">{t('search.industries.home_decoration.title')}</h3>
                  <p className="text-sm text-orange-600 mb-2">{t('search.industries.home_decoration.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.home_decoration.suitable')}</p>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-indigo-800">{t('search.industries.education.title')}</h3>
                  <p className="text-sm text-indigo-600 mb-2">{t('search.industries.education.examples')}</p>
                  <p className="text-xs text-muted-foreground">{t('search.industries.education.suitable')}</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {t('search.industry_tip')}
                </p>
              </div>
            </div>
          </div>

          {/* 常见问题 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t('search.faq')}</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.legal_compliance.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.legal_compliance.answer')}
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.accuracy_rate.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.accuracy_rate.answer')}
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.batch_export.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.batch_export.answer')}
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.usage_precautions.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.usage_precautions.answer')}
                  </p>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.improve_search.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.improve_search.answer')}
                  </p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">{t('search.faq_items.data_update.question')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.faq_items.data_update.answer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}