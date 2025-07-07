import { BusinessInfo } from './config';
import { mapsPageConfig } from './page-config';

export interface GoogleSearchParams {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  pagetoken?: string;
  maxPages?: number; // 最大请求页数
}

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GoogleResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

export class GoogleMapService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchSinglePage(params: GoogleSearchParams): Promise<BusinessInfo[]> {
    // 只搜索单页数据，获取前10个商户的电话号码
    console.log(`Google地图单页搜索: 第${params.pagetoken ? '续页' : '1'}页`);
    
    try {
      const pageResults = await this.searchSinglePageInternal(params);
      
      if (pageResults.results.length === 0) {
        console.log(`Google地图单页无结果`);
        return [];
      }

      // 对前N个结果获取详细信息（包括电话号码）
      const detailedResults = [];
      const maxDetailsToFetch = mapsPageConfig.google.maxDetailsToFetch;
      
      for (let i = 0; i < pageResults.results.length; i++) {
        const place = pageResults.results[i];
        
        if (i < maxDetailsToFetch) {
          try {
            console.log(`获取第${i + 1}个商户的电话号码: ${place.name}`);
            const details = await this.getPlaceDetails(place.place_id);
            if (details) {
              const mergedPlace = {
                ...place,
                formatted_phone_number: details.formatted_phone_number,
                rating: details.rating || place.rating
              };
              detailedResults.push(this.transformPlace(mergedPlace));
            } else {
              detailedResults.push(this.transformPlace(place));
            }
            // 避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 150));
          } catch (error) {
            console.warn(`获取place details失败 ${place.place_id}:`, error);
            detailedResults.push(this.transformPlace(place));
          }
        } else {
          // 超过10个的商户直接使用基本信息
          detailedResults.push(this.transformPlace(place));
        }
      }
      
      console.log(`Google地图单页获取到${detailedResults.length}条结果（前${Math.min(maxDetailsToFetch, detailedResults.length)}条含电话号码）`);
      
      return detailedResults;
    } catch (error) {
      console.error(`Google地图单页搜索失败:`, error);
      throw error;
    }
  }

  async searchPlaces(params: GoogleSearchParams): Promise<BusinessInfo[]> {
    const allResults: BusinessInfo[] = [];
    const maxPages = params.maxPages || mapsPageConfig.google.maxPages;
    let nextPageToken: string | undefined = params.pagetoken;
    
    console.log(`开始Google地图多页搜索，最多请求${maxPages}页`);

    for (let page = 1; page <= maxPages; page++) {
      try {
        const pageResults = await this.searchSinglePageInternal({
          ...params,
          pagetoken: nextPageToken
        });

        if (pageResults.results.length === 0) {
          console.log(`Google地图第${page}页无结果，停止请求`);
          break;
        }

        // 获取每个商户的详细信息（包括电话号码）
        const detailedResults = [];
        for (let i = 0; i < pageResults.results.length; i++) {
          const place = pageResults.results[i];
          try {
            console.log(`正在获取第${allResults.length + i + 1}个商户的电话号码: ${place.name}`);
            const details = await this.getPlaceDetails(place.place_id);
            if (details) {
              const mergedPlace = {
                ...place,
                formatted_phone_number: details.formatted_phone_number,
                rating: details.rating || place.rating
              };
              detailedResults.push(this.transformPlace(mergedPlace));
            } else {
              detailedResults.push(this.transformPlace(place));
            }
            // 适当间隔避免API限制
            await new Promise(resolve => setTimeout(resolve, 150));
          } catch (error) {
            console.warn(`获取place details失败 ${place.place_id}:`, error);
            detailedResults.push(this.transformPlace(place));
          }
        }
        
        allResults.push(...detailedResults);
        console.log(`Google地图第${page}页获取到${pageResults.results.length}条结果（含电话号码），累计${allResults.length}条`);

        // 检查是否有下一页
        if (!pageResults.next_page_token) {
          console.log(`Google地图第${page}页没有next_page_token，已是最后一页`);
          break;
        }

        nextPageToken = pageResults.next_page_token;

        // Google API需要等待几秒才能使用next_page_token
        if (page < maxPages) {
          console.log(`等待${mapsPageConfig.google.pageDelay}ms后请求下一页...`);
          await new Promise(resolve => setTimeout(resolve, mapsPageConfig.google.pageDelay));
        }

      } catch (error) {
        console.error(`Google地图第${page}页请求失败:`, error);
        if (page === 1) {
          throw error;
        }
        break;
      }
    }

    console.log(`Google地图多页搜索完成，总共获取${allResults.length}条结果`);
    return allResults;
  }

  private async searchSinglePageInternal(params: GoogleSearchParams): Promise<GoogleResponse> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('query', params.query);
    
    if (params.location) {
      url.searchParams.set('location', params.location);
    }
    if (params.radius) {
      url.searchParams.set('radius', params.radius.toString());
    }
    if (params.type) {
      url.searchParams.set('type', params.type);
    }
    if (params.pagetoken) {
      url.searchParams.set('pagetoken', params.pagetoken);
    }

    // 检测环境：本地开发使用代理，生产环境直接访问
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
    
    try {
      let data: GoogleResponse;
      
      if (isProduction) {
        // 生产环境：直接使用fetch访问
        console.log('生产环境：直接访问Google Maps API');
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
      } else {
        // 本地开发环境：使用代理
        const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:1087';
        console.log(`本地环境：使用代理 ${proxyUrl}`);
        
        const https = await import('https');
        const http = await import('http');
        const { URL } = await import('url');
        
        const proxy = new URL(proxyUrl);
        const target = new URL(url.toString());
        
        data = await new Promise<GoogleResponse>((resolve, reject) => {
          const options = {
            host: proxy.hostname,
            port: proxy.port,
            method: 'CONNECT',
            path: `${target.hostname}:${target.port || 443}`,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)'
            }
          };
          
          const req = http.request(options);
          req.on('connect', (res, socket) => {
            if (res.statusCode === 200) {
              const requestOptions = {
                host: target.hostname,
                port: (target.port || 443).toString(),
                path: target.pathname + target.search,
                method: 'GET',
                socket: socket,
                agent: false,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)',
                  'Accept': 'application/json'
                }
              } as any;
              
              const httpsReq = https.request(requestOptions, (httpsRes) => {
                let data = '';
                httpsRes.on('data', chunk => data += chunk);
                httpsRes.on('end', () => {
                  try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                  } catch (e) {
                    reject(new Error('Failed to parse JSON response'));
                  }
                });
              });
              
              httpsReq.on('error', reject);
              httpsReq.end();
            } else {
              reject(new Error(`Proxy connection failed: ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.end();
          
          setTimeout(() => {
            req.destroy();
            reject(new Error('代理连接超时'));
          }, 10000);
        });
      }
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.error_message || data.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          throw new Error('Google Maps API 请求超时，可能是网络连接问题');
        }
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error('无法连接到Google Maps API，可能是网络环境限制');
        }
      }
      
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,rating,types,geometry');

    // 检测环境：本地开发使用代理，生产环境直接访问
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

    try {
      let data: any;
      
      if (isProduction) {
        // 生产环境：直接使用fetch访问
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
      } else {
        // 本地开发环境：使用代理
        const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:1087';
        const https = await import('https');
        const http = await import('http');
        const { URL } = await import('url');
        
        const proxy = new URL(proxyUrl);
        const target = new URL(url.toString());
        
        data = await new Promise<any>((resolve, reject) => {
          const options = {
            host: proxy.hostname,
            port: proxy.port,
            method: 'CONNECT',
            path: `${target.hostname}:${target.port || 443}`,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)'
            }
          };
          
          const req = http.request(options);
          req.on('connect', (res, socket) => {
            if (res.statusCode === 200) {
              const requestOptions = {
                host: target.hostname,
                port: (target.port || 443).toString(),
                path: target.pathname + target.search,
                method: 'GET',
                socket: socket,
                agent: false,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; Business-Search-App/1.0)',
                  'Accept': 'application/json'
                }
              } as any;
              
              const httpsReq = https.request(requestOptions, (httpsRes) => {
                let data = '';
                httpsRes.on('data', chunk => data += chunk);
                httpsRes.on('end', () => {
                  try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                  } catch (e) {
                    reject(new Error('Failed to parse JSON response'));
                  }
                });
              });
              
              httpsReq.on('error', reject);
              httpsReq.end();
            } else {
              reject(new Error(`Proxy connection failed: ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.end();
          
          setTimeout(() => {
            req.destroy();
            reject(new Error('代理连接超时'));
          }, 8000);
        });
      }

      if (data.status !== 'OK') {
        throw new Error(`Google Place Details API error: ${data.error_message || data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Google Place Details API error:', error);
      return null;
    }
  }

  private transformPlace(place: GooglePlace): BusinessInfo {
    return {
      id: `google_${place.place_id}`,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      rating: place.rating,
      category: place.types.join(', '),
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      source: 'google'
    };
  }
}