import { BusinessInfo, mapConfig } from './config';
import { GaodeMapService } from './gaode';
import { BaiduMapService } from './baidu';
import { GoogleMapService } from './google';
import { mapsPageConfig, logMapsConfig, validateMapsConfig } from './page-config';

export interface SearchParams {
  query: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
}

export class MapServiceManager {
  private gaodeService: GaodeMapService;
  private baiduService: BaiduMapService;
  private googleService: GoogleMapService;

  constructor() {
    this.gaodeService = new GaodeMapService(mapConfig.gaode.key);
    this.baiduService = new BaiduMapService(mapConfig.baidu.ak);
    this.googleService = new GoogleMapService(mapConfig.google.key);
    
    // 启动时记录配置信息
    logMapsConfig();
    validateMapsConfig();
  }

  // 缓存搜索结果，避免重复API调用
  private searchCache = new Map<string, BusinessInfo[]>();

  async searchBusinesses(params: SearchParams, isChina: boolean): Promise<{
    results: BusinessInfo[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    console.log(`请求第${page}页数据，每页${pageSize}条`);

    // 生成缓存键
    const cacheKey = `${params.query}_${params.city}_${isChina}`;
    
    let allResults: BusinessInfo[] = [];
    
    // 检查缓存
    if (this.searchCache.has(cacheKey)) {
      console.log('使用缓存的搜索结果');
      allResults = this.searchCache.get(cacheKey)!;
    } else {
      // 第一次搜索，获取所有数据并缓存
      console.log('首次搜索，获取完整数据...');
      
      if (isChina) {
        allResults = await this.searchGaode(params);
      } else {
        allResults = await this.searchGoogle(params);
      }
      
      allResults = this.deduplicateResults(allResults);
      this.searchCache.set(cacheKey, allResults);
      console.log(`搜索完成，缓存${allResults.length}条结果`);
    }

    // 前端分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    const totalCount = allResults.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    console.log(`返回第${page}页: ${paginatedResults.length}条，总计${totalCount}条`);

    return {
      results: paginatedResults,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages
    };
  }

  private async searchGaodePaginated(params: SearchParams, page: number, pageSize: number) {
    try {
      console.log('使用高德地图分页搜索...');
      
      // 高德地图：根据配置确定每页条数
      const gaodePageSize = mapsPageConfig.gaode.pageSize;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      // 计算需要请求高德地图的哪些页
      const startGaodePage = Math.floor(startIndex / gaodePageSize) + 1;
      const endGaodePage = Math.floor((endIndex - 1) / gaodePageSize) + 1;
      
      console.log(`需要高德地图第${startGaodePage}到第${endGaodePage}页数据`);
      
      const allResults: BusinessInfo[] = [];
      
      // 只请求需要的页数 - 使用单页搜索方法
      for (let gaodePage = startGaodePage; gaodePage <= endGaodePage; gaodePage++) {
        const gaodeResults = await this.gaodeService.searchSinglePagePOI({
          keywords: params.query,
          city: params.city,
          types: params.category,
          offset: gaodePageSize,
          page: gaodePage
        });
        
        if (gaodeResults.length === 0) break;
        allResults.push(...gaodeResults);
        console.log(`分页逻辑：高德地图第${gaodePage}页获取${gaodeResults.length}条`);
      }
      
      const deduplicatedResults = this.deduplicateResults(allResults);
      
      // 从组合结果中切片出当前页需要的数据
      const localStartIndex = startIndex - (startGaodePage - 1) * gaodePageSize;
      const localEndIndex = localStartIndex + pageSize;
      const paginatedResults = deduplicatedResults.slice(localStartIndex, localEndIndex);
      
      // 估算总数（基于已获取的数据）
      const hasMoreData = allResults.length === (endGaodePage - startGaodePage + 1) * gaodePageSize;
      const estimatedTotal = hasMoreData ? Math.max(100, allResults.length) : allResults.length;
      const totalPages = Math.ceil(estimatedTotal / pageSize);
      
      console.log(`返回第${page}页: ${paginatedResults.length}条，估算总计${estimatedTotal}条`);
      
      return {
        results: paginatedResults,
        totalCount: estimatedTotal,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages
      };
      
    } catch (error) {
      console.error('Gaode paginated search failed:', error);
      return {
        results: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false
      };
    }
  }

  private async searchGooglePaginated(params: SearchParams, page: number, pageSize: number) {
    try {
      console.log('使用Google地图分页搜索...');
      
      // 简化逻辑：每页都独立请求，获取电话号码
      console.log(`请求Google地图第${page}页数据`);
      
      // 每次请求都获取一页完整数据（含电话号码）
      const googleResults = await this.googleService.searchSinglePage({
        query: params.query || '',
        location: params.city ? undefined : `${params.latitude},${params.longitude}`,
        radius: params.radius
      });
      
      const deduplicatedResults = this.deduplicateResults(googleResults);
      
      // 每页返回最多10条结果
      const paginatedResults = deduplicatedResults.slice(0, pageSize);
      
      // 估算总页数：假设每页都能获取到数据，最多6页（Google限制3页×每页20条÷每页10条）
      const maxPages = 6;
      const estimatedTotal = maxPages * pageSize;
      
      console.log(`返回第${page}页: ${paginatedResults.length}条（含电话号码）`);
      
      return {
        results: paginatedResults,
        totalCount: estimatedTotal,
        currentPage: page,
        totalPages: maxPages,
        hasNextPage: page < maxPages
      };
      
    } catch (error) {
      console.error('Google paginated search failed:', error);
      return {
        results: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false
      };
    }
  }

  private async searchGaode(params: SearchParams & { maxPages?: number }): Promise<BusinessInfo[]> {
    const gaodeResults = await this.gaodeService.searchPOI({
      keywords: params.query,
      city: params.city,
      types: params.category,
      offset: mapsPageConfig.gaode.pageSize,
      maxPages: mapsPageConfig.gaode.maxPages
    });

    const baiduResults = await this.searchBaiduMultiPage({
      query: params.query,
      region: params.city || '全国',
      page_size: mapsPageConfig.baidu.pageSize,
      maxPages: mapsPageConfig.baidu.maxPages
    });

    console.log(`高德地图获取${gaodeResults.length}条，百度地图获取${baiduResults.length}条`);
    
    // 合并高德和百度的结果
    return [...gaodeResults, ...baiduResults];
  }

  private async searchBaiduMultiPage(params: { query: string; region: string; page_size: number; maxPages: number }): Promise<BusinessInfo[]> {
    const allResults: BusinessInfo[] = [];
    
    for (let page = 0; page < params.maxPages; page++) {
      try {
        const pageResults = await this.baiduService.searchPOI({
          query: params.query,
          region: params.region,
          page_size: params.page_size,
          page_num: page
        });

        if (pageResults.length === 0) {
          console.log(`百度地图第${page + 1}页无结果，停止请求`);
          break;
        }

        allResults.push(...pageResults);
        console.log(`百度地图第${page + 1}页获取${pageResults.length}条，累计${allResults.length}条`);

        // 如果当前页结果少于每页限制，说明已经是最后一页
        if (pageResults.length < params.page_size) {
          console.log(`百度地图第${page + 1}页结果数(${pageResults.length})少于每页限制(${params.page_size})，已是最后一页`);
          break;
        }

        // 添加延迟避免请求过于频繁
        if (page < params.maxPages - 1) {
          await new Promise(resolve => setTimeout(resolve, mapsPageConfig.baidu.pageDelay));
        }

      } catch (error) {
        console.error(`百度地图第${page + 1}页请求失败:`, error);
        if (page === 0) {
          throw error; // 第一页失败就抛出错误
        }
        break; // 后续页失败就停止
      }
    }

    console.log(`百度地图多页搜索完成，总共获取${allResults.length}条结果`);
    return allResults;
  }

  private async searchGoogle(params: SearchParams): Promise<BusinessInfo[]> {
    const searchParams: any = {
      query: params.query,
      maxPages: mapsPageConfig.google.maxPages
    };

    if (params.latitude && params.longitude) {
      searchParams.location = `${params.latitude},${params.longitude}`;
      searchParams.radius = params.radius || 5000;
    }

    // 使用完整的多页搜索，包含电话号码
    return this.googleService.searchPlaces(searchParams);
  }

  private deduplicateResults(results: BusinessInfo[]): BusinessInfo[] {
    const seen = new Map<string, BusinessInfo>();

    for (const result of results) {
      // 使用商户名称+地址作为去重键
      const key = `${result.name}_${result.address}`.toLowerCase().replace(/\s+/g, '');
      const existing = seen.get(key);

      if (!existing) {
        seen.set(key, result);
      } else {
        // 电话号码是最重要的！优先级规则：
        // 1. 有电话号码的优先于没电话号码的
        // 2. 如果都有或都没电话，选择评分更高的
        // 3. 如果评分相同，选择高德地图的结果（通常更准确）
        
        const resultHasPhone = !!result.phone && typeof result.phone === 'string' && result.phone.trim() !== '';
        const existingHasPhone = !!existing.phone && typeof existing.phone === 'string' && existing.phone.trim() !== '';
        
        if (resultHasPhone && !existingHasPhone) {
          // 新结果有电话，旧结果没电话 -> 替换
          seen.set(key, result);
          console.log(`去重优化: ${result.name} - 选择有电话的结果 (${result.source})`);
        } else if (!resultHasPhone && existingHasPhone) {
          // 新结果没电话，旧结果有电话 -> 保持旧结果
          continue;
        } else {
          // 都有电话或都没电话，比较其他因素
          if (result.rating && existing.rating) {
            if (result.rating > existing.rating) {
              seen.set(key, result);
            }
          } else if (result.source === 'gaode' && existing.source === 'baidu') {
            // 在其他条件相同时，优先选择高德的结果
            seen.set(key, result);
          }
        }
      }
    }

    const deduplicated = Array.from(seen.values());
    console.log(`去重前: ${results.length}条，去重后: ${deduplicated.length}条`);

    // 排序：电话号码是最重要的！
    return deduplicated.sort((a, b) => {
      const aHasPhone = !!a.phone && typeof a.phone === 'string' && a.phone.trim() !== '';
      const bHasPhone = !!b.phone && typeof b.phone === 'string' && b.phone.trim() !== '';
      
      // 有电话的绝对优先
      if (aHasPhone && !bHasPhone) return -1;
      if (!aHasPhone && bHasPhone) return 1;
      
      // 都有电话或都没电话，按评分排序
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      
      // 按数据源排序：高德 > 百度
      if (a.source === 'gaode' && b.source === 'baidu') return -1;
      if (a.source === 'baidu' && b.source === 'gaode') return 1;
      
      // 按名称排序
      return a.name.localeCompare(b.name);
    });
  }
}

export * from './config';
export type { BusinessInfo } from './config';