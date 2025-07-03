import { NextRequest, NextResponse } from 'next/server';
import { getLocationFromIP, getClientIP } from '@/lib/geo';

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    let location = await getLocationFromIP(clientIP);
    
    // 如果获取不到位置信息（比如本地开发），返回默认的中国位置
    if (!location) {
      location = {
        country: 'CN',
        region: 'Beijing',
        city: 'Beijing',
        isChina: true
      };
    }
    
    return NextResponse.json({
      ip: clientIP,
      location,
      success: true
    });
  } catch (error) {
    console.error('Geo API error:', error);
    return NextResponse.json({
      error: 'Failed to get location',
      success: false
    }, { status: 500 });
  }
}