import { BusinessInfo } from './config';

export interface BaiduSearchParams {
  query: string;
  region: string;
  city_limit?: boolean;
  page_size?: number;
  page_num?: number;
  scope?: number;
}

export interface BaiduPOI {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  province: string;
  city: string;
  area: string;
  telephone?: string;
  detail?: number;
  uid: string;
  tag: string;
}

export interface BaiduResponse {
  status: number;
  message: string;
  results: BaiduPOI[];
  total: number;
}

export class BaiduMapService {
  private ak: string;

  constructor(ak: string) {
    this.ak = ak;
  }

  async searchPOI(params: BaiduSearchParams): Promise<BusinessInfo[]> {
    const url = new URL('https://api.map.baidu.com/place/v2/search');
    url.searchParams.set('ak', this.ak);
    url.searchParams.set('query', params.query);
    url.searchParams.set('region', params.region);
    url.searchParams.set('output', 'json');
    url.searchParams.set('city_limit', (params.city_limit || true).toString());
    url.searchParams.set('page_size', (params.page_size || 20).toString());
    url.searchParams.set('page_num', (params.page_num || 0).toString());
    url.searchParams.set('scope', (params.scope || 2).toString());

    try {
      const response = await fetch(url.toString());
      const data: BaiduResponse = await response.json();

      if (data.status !== 0) {
        throw new Error(`Baidu API error: ${data.message}`);
      }

      return data.results.map(poi => this.transformPOI(poi));
    } catch (error) {
      console.error('Baidu API error:', error);
      throw error;
    }
  }

  private transformPOI(poi: BaiduPOI): BusinessInfo {
    return {
      id: `baidu_${poi.uid}`,
      name: poi.name,
      address: poi.address,
      phone: poi.telephone,
      category: poi.tag,
      latitude: poi.location.lat,
      longitude: poi.location.lng,
      source: 'baidu'
    };
  }
}