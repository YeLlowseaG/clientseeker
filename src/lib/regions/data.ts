import { Region } from './types';

// 地区数据缓存
let regionDataCache: { china: Region[], international: Region[] } | null = null;

// 从JSON文件加载地区数据
async function loadRegionData(): Promise<{ china: Region[], international: Region[] }> {
  if (regionDataCache) {
    return regionDataCache;
  }

  try {
    // 在客户端环境下，从public目录读取
    const response = await fetch('/data/regions.json');
    const data = await response.json();
    regionDataCache = data;
    return data;
  } catch (error) {
    console.error('Failed to load regions.json:', error);
    // 返回空数据作为后备
    return { china: [], international: [] };
  }
}

// 导出异步加载函数，用于获取地区数据
export async function getChinaRegions(): Promise<Region[]> {
  const data = await loadRegionData();
  return data.china || [];
}

export async function getInternationalRegions(): Promise<Region[]> {
  const data = await loadRegionData();
  return data.international || [];
}

// 为了向后兼容，导出默认的空数组，但建议使用异步函数
export const chinaRegions: Region[] = [];
export const internationalRegions: Region[] = [];