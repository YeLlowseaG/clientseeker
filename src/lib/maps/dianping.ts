import { BusinessInfo } from './config';
import crypto from 'crypto';

export interface DianpingSearchParams {
  keyword: string;
  city: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}

export interface DianpingBusiness {
  business_id: string;
  name: string;
  address: string;
  telephone: string;
  latitude: number;
  longitude: number;
  avg_rating: number;
  categories: string[];
}

export interface DianpingResponse {
  status: string;
  data: {
    businesses: DianpingBusiness[];
    total: number;
  };
  msg?: string;
}

export class DianpingService {
  private appKey: string;
  private secret: string;

  constructor(appKey: string, secret: string) {
    this.appKey = appKey;
    this.secret = secret;
  }

  async searchBusinesses(params: DianpingSearchParams): Promise<BusinessInfo[]> {
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2);
    
    const requestParams = {
      appkey: this.appKey,
      timestamp,
      nonce,
      keyword: params.keyword,
      city: params.city,
      category: params.category || '',
      latitude: params.latitude?.toString() || '',
      longitude: params.longitude?.toString() || '',
      radius: params.radius?.toString() || '1000',
      limit: params.limit?.toString() || '20',
      offset: params.offset?.toString() || '0'
    };

    const signature = this.generateSignature(requestParams);
    
    const url = new URL('https://api.dianping.com/v1/business/find_businesses');
    Object.entries(requestParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set('sign', signature);

    try {
      const response = await fetch(url.toString());
      const data: DianpingResponse = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Dianping API error: ${data.msg || 'Unknown error'}`);
      }

      return data.data.businesses.map(business => this.transformBusiness(business));
    } catch (error) {
      console.error('Dianping API error:', error);
      
      return [];
    }
  }

  private generateSignature(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys
      .map(key => `${key}${params[key]}`)
      .join('') + this.secret;
    
    return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
  }

  private transformBusiness(business: DianpingBusiness): BusinessInfo {
    return {
      id: `dianping_${business.business_id}`,
      name: business.name,
      address: business.address,
      phone: business.telephone,
      rating: business.avg_rating,
      category: business.categories.join(', '),
      latitude: business.latitude,
      longitude: business.longitude,
      source: 'dianping'
    };
  }
}