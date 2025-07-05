import { NextRequest, NextResponse } from 'next/server';
import { MapServiceManager, SearchParams, BusinessInfo } from '@/lib/maps';
import { getLocationFromIP, getClientIP } from '@/lib/geo';
import { auth } from '@/auth';
import { SubscriptionService } from '@/services/subscription';
import { findUserByEmail } from '@/models/user';

// 全局缓存，避免重复API调用
const searchCache = new Map<string, BusinessInfo[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let userUuid = '';

    console.log("🔍 [Search API] Request body:", {
      query: body.query,
      city: body.city,
      userEmail: body.userEmail,
      hasUserEmail: !!body.userEmail
    });

    // 检查用户身份验证 - 支持两种方式
    const session = await auth();
    console.log("🔍 [Search API] NextAuth session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userUuid: session?.user?.uuid
    });

    if (session?.user?.uuid) {
      // NextAuth session 方式
      userUuid = session.user.uuid;
      console.log("🔍 [Search API] Using NextAuth session, userUuid:", userUuid);
    } else if (body.userEmail) {
      // 新的email验证方式
      console.log("🔍 [Search API] Looking up user by email:", body.userEmail);
      const user = await findUserByEmail(body.userEmail);
      console.log("🔍 [Search API] User lookup result:", {
        found: !!user,
        uuid: user?.uuid,
        email: user?.email
      });
      
      if (!user?.uuid) {
        console.error("🔍 [Search API] User not found for email:", body.userEmail);
        return NextResponse.json({
          error: 'User not found',
          success: false
        }, { status: 401 });
      }
      userUuid = user.uuid;
      console.log("🔍 [Search API] Using email auth, userUuid:", userUuid);
    } else {
      console.error("🔍 [Search API] No authentication method available");
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    // 检查用户搜索配额
    console.log("🔍 [Search API] Checking quota for user:", userUuid);
    const quotaCheck = await SubscriptionService.checkUserQuota(userUuid);
    console.log("🔍 [Search API] Quota check result:", quotaCheck);
    
    if (!quotaCheck.hasQuota) {
      console.error("🔍 [Search API] Quota exceeded:", quotaCheck);
      return NextResponse.json({
        error: 'Search quota exceeded',
        message: quotaCheck.message,
        quota: {
          remaining: quotaCheck.remaining,
          total: quotaCheck.total,
          used: quotaCheck.used,
          productId: quotaCheck.productId
        },
        success: false
      }, { status: 403 });
    }

    const { query, city, latitude, longitude, radius, category, limit, page, pageSize, userRegionType }: SearchParams & { userRegionType?: 'china' | 'international' } = body;

    if (!query) {
      return NextResponse.json({
        error: 'Query parameter is required',
        success: false
      }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const location = await getLocationFromIP(clientIP);
    
    // 优先级：用户手动选择 > 城市名判断 > IP检测
    let isChina = location?.isChina || false;
    
    // 1. 最高优先级：用户手动选择的地区类型
    if (userRegionType) {
      isChina = userRegionType === 'china';
      console.log(`使用用户手动选择的地区类型: ${userRegionType}`);
    } else if (city) {
      // 2. 次优先级：根据城市名判断
      const chineseCities = [
        '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '重庆', '武汉',
        '西安', '天津', '青岛', '大连', '厦门', '宁波', '无锡', '佛山', '东莞', '沈阳',
        '长沙', '哈尔滨', '济南', '郑州', '长春', '福州', '石家庄', '合肥', '昆明', '太原'
      ];
      
      // 常见国际城市的中文名（这些应该使用Google地图）
      const internationalCitiesInChinese = [
        '纽约', '洛杉矶', '芝加哥', '旧金山', '西雅图', '波士顿', '华盛顿',
        '伦敦', '巴黎', '柏林', '罗马', '马德里', '阿姆斯特丹', '苏黎世',
        '东京', '首尔', '新加坡', '悉尼', '墨尔本', '多伦多', '蒙特利尔',
        '曼彻斯特', '利物浦', '爱丁堡', '都柏林', '维也纳', '布拉格', '华沙'
      ];
      
      const isChineseCity = chineseCities.some(chineseCity => city.includes(chineseCity));
      const isInternationalCityInChinese = internationalCitiesInChinese.some(intlCity => 
        city.includes(intlCity)
      );
      const hasChineseChars = /[\u4e00-\u9fa5]/.test(city);
      
      if (isInternationalCityInChinese) {
        isChina = false;
        console.log(`根据城市名判断: ${city} 是国际城市`);
      } else if (isChineseCity) {
        isChina = true;
        console.log(`根据城市名判断: ${city} 是中国城市`);
      } else if (hasChineseChars) {
        isChina = true;
        console.log(`根据中文字符判断: ${city} 是中国地区`);
      }
    }
    // 3. 最低优先级：IP检测（已在开头设置）

    const currentPage = page || 1;
    const currentPageSize = pageSize || 10;

    console.log('搜索参数:', {
      query,
      city: city || location?.city,
      isChina,
      latitude,
      longitude,
      radius,
      category,
      limit,
      page: currentPage,
      pageSize: currentPageSize
    });

    // 生成缓存键
    const cacheKey = `${query}_${city || location?.city}_${isChina}`;
    
    let allResults: BusinessInfo[] = [];
    
    // 检查缓存
    if (searchCache.has(cacheKey)) {
      console.log('使用缓存的搜索结果');
      allResults = searchCache.get(cacheKey)!;
    } else {
      // 第一次搜索，获取所有数据并缓存
      console.log('首次搜索，获取完整数据...');
      
      const mapManager = new MapServiceManager();
      
      const searchResult = await mapManager.searchBusinesses({
        query,
        city: city || location?.city,
        latitude,
        longitude,
        radius,
        category,
        limit,
        page: 1,
        pageSize: 1000 // 获取大量数据用于缓存
      }, isChina);
      
      allResults = searchResult.results;
      
      searchCache.set(cacheKey, allResults);
      console.log(`搜索完成，缓存${allResults.length}条结果`);
    }

    // 前端分页
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    const totalCount = allResults.length;
    const totalPages = Math.ceil(totalCount / currentPageSize);

    console.log('搜索结果:', `第${currentPage}页/${totalPages}页, 当前${paginatedResults.length}条, 总计${totalCount}条`);

    // 只有首次搜索（page=1）时才扣减配额
    if (currentPage === 1) {
      const deductSuccess = await SubscriptionService.deductUserQuota(userUuid, 1);
      if (!deductSuccess) {
        return NextResponse.json({
          error: 'Failed to deduct quota',
          success: false
        }, { status: 500 });
      }
    }

    // 获取更新后的配额信息
    const updatedQuota = await SubscriptionService.checkUserQuota(userUuid);

    // 检查是否有网络连接问题的警告
    let networkWarning = null;
    if (!isChina && paginatedResults.length === 0) {
      networkWarning = 'Google Maps API可能因网络环境限制无法访问，已尝试使用替代数据源';
    }

    return NextResponse.json({
      results: paginatedResults,
      totalCount: totalCount,
      currentPage: currentPage,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      location: {
        ip: clientIP,
        country: location?.country,
        city: location?.city,
        isChina
      },
      sources: isChina ? ['gaode', 'baidu', 'dianping'] : ['google'],
      networkWarning,
      quota: {
        remaining: updatedQuota.remaining,
        total: updatedQuota.total,
        used: updatedQuota.used,
        productId: updatedQuota.productId
      },
      success: true
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      error: 'Failed to search businesses',
      success: false
    }, { status: 500 });
  }
}