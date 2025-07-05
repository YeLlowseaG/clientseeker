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
          setError(data.message || '搜索配额已用完，请升级套餐或等待配额重置');
        } else if (response.status === 401) {
          // 未认证
          setError('请先登录后再进行搜索');
        } else {
          setError(data.message || data.error || '搜索失败，请重试');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('搜索失败，请检查网络连接');
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
        console.error('导出失败：无法获取搜索结果');
        return;
      }

      // 准备CSV数据 - 使用所有搜索结果
      const headers = ['客户名称', '地址', '联系电话', '评分', '行业类别', '数据来源'];
      const csvData = [
        headers,
        ...data.results.map((business: any) => [
          business.name,
          business.address,
          business.phone || '暂无',
          business.rating?.toString() || '暂无',
          business.category || '暂无',
          business.source === 'gaode' ? '高德地图' : '百度地图'
        ])
      ];

      // 转换为CSV格式
      const csvContent = csvData.map(row => 
        row.map((field: string) => `"${field}"`).join(',')
      ).join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 生成文件名：客户联系信息_关键词_时间戳.csv
      const timestamp = new Date().getTime();
      const safeQuery = query.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_'); // 清理特殊字符
      const filename = `客户联系信息_${safeQuery}_${timestamp}.csv`;
      
      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`导出完成：${data.results.length}条记录`);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };


  // 移除未登录用户的阻拦，允许所有用户访问搜索页面

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题区域 - 固定高度 */}
        <div className="text-center mb-8 h-[200px] flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">ClientSeeker - 全球找客户助手</h1>
          <p className="text-lg text-muted-foreground mb-6">
            快速查找全球潜在客户联系方式，支持中国大陆及海外市场
          </p>
          
          {location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>当前位置：{location.country} {location.city}</span>
              <Badge variant={location.isChina ? "default" : "secondary"}>
                {location.isChina ? '国内数据源' : '国际数据源'}
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
                  <p className="text-sm font-medium">搜索配额</p>
                  <p className="text-xs text-muted-foreground">
                    剩余 {quotaInfo.remaining} 次 / 总计 {quotaInfo.total} 次
                  </p>
                </div>
              </div>
              {quotaInfo.remaining <= 3 && quotaInfo.productId === 'free' && (
                <Button
                  size="sm"
                  onClick={() => router.push('/#pricing')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  升级套餐
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
              placeholder="输入目标客户行业或关键词，如：餐厅、美容院、汽修店..."
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
            {loading ? '搜索中...' : 
             !user ? '登录后搜索' :
             quotaInfo && quotaInfo.remaining <= 0 ? '配额不足' : '搜索'}
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
                    查看套餐
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
            建议：切换到"中国"模式使用高德地图获取更多结果
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
                    导出全部 ({totalCount}条)
                  </Button>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <span className="font-medium">💡 导出提示：</span>
                    <span className="ml-1">Google Maps数据暂不支持导出，仅支持在线查看</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {location && (
                    <span>
                      数据来源: {location.isChina ? '高德地图、百度地图（智能合并去重，优先显示有电话的商户）' : 'Google Maps（全球商家数据，暂不支持导出）'}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">开始寻找客户</h3>
                  <p className="text-gray-500">
                    输入目标客户行业或关键词，选择地区，开始获取客户联系方式
                  </p>
                </div>
              ) : loading ? (
                /* 加载状态 */
                <div className="max-w-md mx-auto space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <h3 className="text-lg font-medium">正在搜索客户信息...</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center justify-between">
                      <span>🔍 获取潜在客户列表</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>📞 获取详细联系方式</span>
                      <div className="animate-pulse text-blue-600">⏳</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🔄 整理和排序结果</span>
                      <span className="text-gray-400">⏳</span>
                    </div>
                    <p className="text-xs mt-4">
                      正在获取每个客户的联系电话，预计需要 30-60 秒
                    </p>
                  </div>
                </div>
              ) : (
                /* 无结果状态 */
                <div>
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关客户</h3>
                  <p className="text-gray-500">
                    请尝试使用其他行业关键词或调整搜索地区
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
                  ↑ 回到顶部
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
                <h2 className="text-3xl font-bold mb-4">什么是ClientSeeker？</h2>
                <p className="text-lg text-muted-foreground">
                  ClientSeeker是一款专业的全球客户开发工具，支持中国大陆及海外市场商家联系信息查询
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                <p className="text-lg leading-relaxed">
                  ClientSeeker基于多源数据整合技术，为销售团队、市场人员和企业主提供精准的全球客户联系信息获取服务。
                  通过整合高德地图、百度地图、Google Maps等权威数据源，我们能够帮助您快速定位全球目标行业的潜在客户，
                  获取准确的企业联系方式，显著提升国内外业务拓展成功率。
                </p>
              </div>
            </div>
          </div>

          {/* 为什么选择ClientSeeker */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">为什么选择ClientSeeker？</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">数据全面准确</h3>
                      <p className="text-muted-foreground">整合多个权威数据源，确保联系信息的准确性和时效性</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">智能去重优化</h3>
                      <p className="text-muted-foreground">自动识别重复信息，优先展示有电话号码的有效商户</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">覆盖范围广泛</h3>
                      <p className="text-muted-foreground">支持全球商家搜索，中国大陆精确到区县级别，海外覆盖主要城市和地区</p>
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
                      <h3 className="font-semibold text-lg mb-2">操作简单高效</h3>
                      <p className="text-muted-foreground">输入关键词即可搜索，国内数据支持一键导出CSV格式</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">数据安全合规</h3>
                      <p className="text-muted-foreground">严格遵守数据保护法规，所有数据来源合法合规</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">成本效益显著</h3>
                      <p className="text-muted-foreground">大幅减少人工搜索时间，提升销售团队工作效率</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 如何使用ClientSeeker */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">如何使用ClientSeeker寻找客户？</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-3">输入搜索关键词</h3>
                  <p className="text-muted-foreground">
                    在搜索框中输入目标行业或业务类型，如"餐厅"、"美容院"、"汽修店"等
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-3">选择目标地区</h3>
                  <p className="text-muted-foreground">
                    使用地区选择器精确定位省份、城市和区县，系统会自动识别您的当前位置
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-3">获取客户信息</h3>
                  <p className="text-muted-foreground">
                    点击搜索按钮，系统将自动获取目标客户的联系方式，支持导出CSV文件
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 核心功能 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">ClientSeeker核心功能</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">精准搜索</h3>
                  <p className="text-muted-foreground">
                    支持行业关键词搜索，覆盖全球主要城市和地区，精确定位目标客户群体
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">联系信息获取</h3>
                  <p className="text-muted-foreground">
                    获取企业电话、地址等关键联系方式，智能去重优化，优先展示有效联系信息
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">多源数据整合</h3>
                  <p className="text-muted-foreground">
                    整合高德地图、百度地图、Google Maps等多个数据源，支持全球商家信息查询
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">数据导出</h3>
                  <p className="text-muted-foreground">
                    国内数据支持一键导出CSV格式，Google Maps数据可在线查看使用
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">地理定位</h3>
                  <p className="text-muted-foreground">
                    智能识别用户位置，支持精确到区县级别的地理范围搜索
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">质量评估</h3>
                  <p className="text-muted-foreground">
                    显示商户评分和分类信息，帮助筛选高质量潜在客户
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 热门潜在客户行业 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">热门潜在客户行业</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800">🍽️ 餐饮行业</h3>
                  <p className="text-sm text-blue-600 mb-2">餐厅、咖啡店、快餐店、火锅店</p>
                  <p className="text-xs text-muted-foreground">适合：食材供应商、餐具厂商、设备供应商</p>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-pink-800">💄 美容美发</h3>
                  <p className="text-sm text-pink-600 mb-2">美容院、理发店、美甲店、SPA</p>
                  <p className="text-xs text-muted-foreground">适合：化妆品供应商、美容设备商、护肤品牌</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-green-800">🚗 汽车服务</h3>
                  <p className="text-sm text-green-600 mb-2">汽修店、洗车店、4S店、轮胎店</p>
                  <p className="text-xs text-muted-foreground">适合：汽车配件商、润滑油供应商、工具厂商</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-purple-800">🏥 医疗健康</h3>
                  <p className="text-sm text-purple-600 mb-2">诊所、药店、体检中心、牙科</p>
                  <p className="text-xs text-muted-foreground">适合：医疗器械商、药品供应商、健康产品</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-orange-800">🏠 家居装修</h3>
                  <p className="text-sm text-orange-600 mb-2">装修公司、家具店、建材店、设计工作室</p>
                  <p className="text-xs text-muted-foreground">适合：建材供应商、家具厂商、装修材料商</p>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2 text-indigo-800">🎓 教育培训</h3>
                  <p className="text-sm text-indigo-600 mb-2">培训机构、幼儿园、辅导班、艺术培训</p>
                  <p className="text-xs text-muted-foreground">适合：教育用品商、设备供应商、图书出版社</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">
                  💡 提示：在搜索框中输入这些行业关键词，即可快速找到对应的潜在客户
                </p>
              </div>
            </div>
          </div>

          {/* 常见问题 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ ClientSeeker的数据来源是否合法合规？</h3>
                  <p className="text-muted-foreground">
                    是的，所有数据均来源于公开可访问的商业目录、地图服务和企业注册信息。我们严格遵守《数据安全法》、《个人信息保护法》等相关法规，不涉及任何隐私数据获取。
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ 搜索结果的准确率如何？</h3>
                  <p className="text-muted-foreground">
                    我们整合多个权威数据源，通过智能算法进行去重和验证，联系信息准确率超过85%。系统会优先展示有电话号码的商户，确保获取的联系方式真实有效。
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ 是否支持批量导出客户数据？</h3>
                  <p className="text-muted-foreground">
                    支持。您可以一键导出搜索结果为CSV格式文件，包含客户名称、地址、联系电话、评分等信息，方便在Excel中进一步分析和管理。
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ 使用ClientSeeker需要注意什么？</h3>
                  <p className="text-muted-foreground">
                    请务必遵守反垃圾邮件法律法规，尊重客户的隐私权。获取的联系信息仅用于合法的商业目的，不得用于骚扰、欺诈等违法活动。建议在联系客户时明确说明身份和目的。
                  </p>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ 如何提高搜索效果？</h3>
                  <p className="text-muted-foreground">
                    建议使用具体的行业关键词，如"川菜餐厅"而非"餐厅"；选择具体的地理区域而非整个省份；可以尝试多个相关关键词组合搜索，获得更全面的结果。
                  </p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-6">
                  <h3 className="font-semibold text-lg mb-2">❓ 数据多久更新一次？</h3>
                  <p className="text-muted-foreground">
                    我们的数据每周更新，确保信息的时效性。新开业的商户会在1-2周内出现在搜索结果中，已关闭的商户信息会被及时清理。
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