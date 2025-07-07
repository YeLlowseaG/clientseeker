import { BusinessInfo } from './config';
import { mapsPageConfig } from './page-config';

export interface GaodeSearchParams {
  keywords: string;
  city?: string;
  types?: string;
  offset?: number;
  page?: number;
  extensions?: string;
  maxPages?: number; // 最大请求页数
}

export interface GaodePOI {
  id: string;
  name: string;
  type: string;
  address: string;
  location: string;
  tel?: string;
  business_area?: string;
  citycode?: string;
  adcode?: string;
}

export interface GaodeResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  pois: GaodePOI[];
}

export class GaodeMapService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchSinglePagePOI(params: GaodeSearchParams): Promise<BusinessInfo[]> {
    // 只搜索单页数据，不循环多页
    console.log(`高德地图单页搜索: 第${params.page || 1}页，每页${params.offset || mapsPageConfig.gaode.pageSize}条`);
    
    try {
      const pageResults = await this.searchSinglePage(params);
      console.log(`高德地图第${params.page || 1}页获取到${pageResults.length}条结果`);
      return pageResults;
    } catch (error) {
      console.error(`高德地图第${params.page || 1}页请求失败:`, error);
      throw error;
    }
  }

  async searchPOI(params: GaodeSearchParams): Promise<BusinessInfo[]> {
    const allResults: BusinessInfo[] = [];
    const maxPages = params.maxPages || mapsPageConfig.gaode.maxPages;
    const offset = params.offset || mapsPageConfig.gaode.pageSize;
    
    console.log(`开始多页搜索，最多请求${maxPages}页，每页${offset}条`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageResults = await this.searchSinglePage({
          ...params,
          page,
          offset
        });

        if (pageResults.length === 0) {
          console.log(`第${page}页无结果，停止请求`);
          break;
        }

        allResults.push(...pageResults);
        console.log(`第${page}页获取到${pageResults.length}条结果，累计${allResults.length}条`);

        // 如果当前页结果少于每页限制，说明已经是最后一页
        if (pageResults.length < offset) {
          console.log(`第${page}页结果数(${pageResults.length})少于每页限制(${offset})，已是最后一页`);
          break;
        }

        // 添加延迟避免请求过于频繁
        if (page < maxPages) {
          await new Promise(resolve => setTimeout(resolve, mapsPageConfig.gaode.pageDelay));
        }

      } catch (error) {
        console.error(`第${page}页请求失败:`, error);
        // 如果不是第一页失败，继续尝试下一页
        if (page === 1) {
          throw error;
        }
        break;
      }
    }

    console.log(`多页搜索完成，总共获取${allResults.length}条结果`);
    return allResults;
  }

  private async searchSinglePage(params: GaodeSearchParams): Promise<BusinessInfo[]> {
    const url = new URL('https://restapi.amap.com/v3/place/text');
    url.searchParams.set('key', this.apiKey);
    
    // 处理城市和区县参数
    let keywords = params.keywords;
    let cityParam = params.city || '全国';
    let districtName = '';
    let hasDistrictSelection = false;
    
    if (cityParam.includes(' ')) {
      // 如果是"广州市 天河区"格式，说明用户明确选择了区县
      const cityParts = cityParam.split(' ');
      cityParam = cityParts[0]; // 取第一部分作为城市名
      districtName = cityParts[1]; // 区县名
      hasDistrictSelection = true; // 标记用户选择了区县
      
      // 将区县信息加入关键词，提高搜索准确性
      keywords = `${districtName} ${keywords}`;
    }
    
    url.searchParams.set('keywords', keywords);
    url.searchParams.set('city', cityParam);
    url.searchParams.set('offset', (params.offset || mapsPageConfig.gaode.pageSize).toString());
    url.searchParams.set('page', (params.page || 1).toString());
    url.searchParams.set('extensions', 'all'); // 总是返回详细信息，包括电话
    url.searchParams.set('output', 'json');
    
    // 如果指定了类型，添加types参数
    if (params.types) {
      url.searchParams.set('types', params.types);
    }

    console.log(`高德地图API请求URL: ${url.toString()}`);
    console.log(`搜索关键词: ${keywords}, 城市: ${cityParam}, 区县: ${districtName}, 用户选择了区县: ${hasDistrictSelection}`);

    const response = await fetch(url.toString());
    const data: GaodeResponse = await response.json();

    if (data.status !== '1') {
      throw new Error(`高德地图API错误: ${data.info}`);
    }

    if (!data.pois || data.pois.length === 0) {
      return [];
    }

    let results = data.pois.map(poi => this.transformPOI(poi));
    
    // 只有用户明确选择了区县时，才进行区县过滤
    if (hasDistrictSelection && districtName) {
      const beforeFilter = results.length;
      results = results.filter(poi => {
        // 检查地址是否包含指定的区县
        return poi.address.includes(districtName);
      });
      console.log(`用户选择了区县 "${districtName}"，过滤前: ${beforeFilter}条，过滤后: ${results.length}条`);
    } else {
      console.log(`用户未选择具体区县，不进行区县过滤，返回 ${results.length}条结果`);
    }
    
    return results;
  }

  private transformPOI(poi: GaodePOI): BusinessInfo {
    const [lng, lat] = poi.location.split(',').map(Number);
    
    return {
      id: `gaode_${poi.id}`,
      name: poi.name,
      address: poi.address,
      phone: poi.tel || undefined,
      category: poi.type,
      latitude: lat,
      longitude: lng,
      source: 'gaode'
    };
  }
}