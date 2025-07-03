export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  isChina: boolean;
}

export async function getLocationFromIP(ip: string): Promise<LocationInfo | null> {
  try {
    // 使用免费的IP地理位置API服务
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,countryCode`);
    const data = await response.json();
    
    if (data.status !== 'success') {
      return null;
    }
    
    return {
      country: data.countryCode,
      region: data.regionName,
      city: data.city,
      isChina: data.countryCode === 'CN'
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return null;
  }
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddress = request.headers.get('remote-addr');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (remoteAddress) {
    return remoteAddress;
  }
  
  // 本地开发时，返回一个中国IP用于测试
  return '114.114.114.114'; // 中国公共DNS，用于测试
}