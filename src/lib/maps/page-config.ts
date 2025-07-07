/**
 * 地图API分页配置
 * 从环境变量读取，便于在Vercel后台动态调整
 */

export interface MapsPageConfig {
  google: {
    maxPages: number;
    maxDetailsToFetch: number;
    pageDelay: number; // 页面间隔时间（毫秒）
  };
  gaode: {
    maxPages: number;
    pageSize: number;
    pageDelay: number;
  };
  baidu: {
    maxPages: number;
    pageSize: number;
    pageDelay: number;
  };
}

// 从环境变量读取配置，提供合理的默认值
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const mapsPageConfig: MapsPageConfig = {
  google: {
    // Google Maps API 配置
    maxPages: getEnvNumber('GOOGLE_MAPS_MAX_PAGES', 3), // 默认3页
    maxDetailsToFetch: getEnvNumber('GOOGLE_MAPS_MAX_DETAILS', 10), // 获取详情的商户数
    pageDelay: getEnvNumber('GOOGLE_MAPS_PAGE_DELAY', 2000), // 页面间隔2秒
  },
  gaode: {
    // 高德地图 API 配置
    maxPages: getEnvNumber('GAODE_MAPS_MAX_PAGES', 5), // 默认5页
    pageSize: getEnvNumber('GAODE_MAPS_PAGE_SIZE', 20), // 每页20条
    pageDelay: getEnvNumber('GAODE_MAPS_PAGE_DELAY', 500), // 页面间隔500毫秒
  },
  baidu: {
    // 百度地图 API 配置
    maxPages: getEnvNumber('BAIDU_MAPS_MAX_PAGES', 5), // 默认5页
    pageSize: getEnvNumber('BAIDU_MAPS_PAGE_SIZE', 20), // 每页20条
    pageDelay: getEnvNumber('BAIDU_MAPS_PAGE_DELAY', 300), // 页面间隔300毫秒
  },
};

// 导出便于调试的配置信息
export function logMapsConfig() {
  console.log('🗺️ Maps API Configuration:', {
    google: mapsPageConfig.google,
    gaode: mapsPageConfig.gaode,
    baidu: mapsPageConfig.baidu,
  });
}

// 验证配置是否合理
export function validateMapsConfig() {
  const { google, gaode, baidu } = mapsPageConfig;
  
  const warnings: string[] = [];
  
  // 检查Google配置
  if (google.maxPages > 3) {
    warnings.push('Google Maps API 一般最多支持3页，当前配置可能超限');
  }
  if (google.maxDetailsToFetch > 20) {
    warnings.push('Google Maps Details API 调用过多可能触发限制');
  }
  
  // 检查高德配置
  if (gaode.maxPages > 10) {
    warnings.push('高德地图API 请求页数过多可能触发限制');
  }
  if (gaode.pageDelay < 200) {
    warnings.push('高德地图API 请求间隔过短可能触发频率限制');
  }
  
  // 检查百度配置
  if (baidu.maxPages > 10) {
    warnings.push('百度地图API 请求页数过多可能触发限制');
  }
  if (baidu.pageDelay < 100) {
    warnings.push('百度地图API 请求间隔过短可能触发频率限制');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Maps Configuration Warnings:', warnings);
  }
  
  return warnings;
}