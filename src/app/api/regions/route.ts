import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

let regionDataCache: any = null;
let lastModified: number = 0;

// 加载地区数据从JSON文件
async function loadRegionData() {
  const filePath = join(process.cwd(), 'public', 'data', 'regions.json');
  
  try {
    // 检查文件修改时间
    const stats = await fs.stat(filePath);
    const currentModified = stats.mtime.getTime();
    
    // 如果缓存存在且文件未修改，直接返回缓存
    if (regionDataCache && lastModified === currentModified) {
      return regionDataCache;
    }
    
    // 读取并解析文件
    const fileContents = await fs.readFile(filePath, 'utf8');
    regionDataCache = JSON.parse(fileContents);
    lastModified = currentModified;
    
    console.log(`Regions data loaded: ${Object.keys(regionDataCache.china).length} provinces`);
    return regionDataCache;
  } catch (error) {
    console.error('Failed to load regions.json:', error);
    // 返回空数据作为后备
    return { china: [], international: [] };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'china' or 'international'
  const parentCode = searchParams.get('parent');

  try {
    const regionData = await loadRegionData();
    
    if (type === 'china') {
      if (!parentCode) {
        // 返回所有省份
        return NextResponse.json({
          data: regionData.china,
          success: true
        });
      } else {
        // 根据省份代码返回城市列表，或根据城市代码返回区县列表
        const province = regionData.china.find((p: any) => p.code === parentCode);
        if (province && province.children) {
          return NextResponse.json({
            data: province.children,
            success: true
          });
        }
        
        // 如果不是省份代码，可能是城市代码，查找区县
        for (const prov of regionData.china) {
          if (prov.children) {
            const city = prov.children.find((c: any) => c.code === parentCode);
            if (city && city.children) {
              return NextResponse.json({
                data: city.children,
                success: true
              });
            }
          }
        }
      }
    } else if (type === 'international') {
      if (!parentCode) {
        // 返回所有国家
        return NextResponse.json({
          data: regionData.international,
          success: true
        });
      } else {
        // 根据国家代码返回城市列表
        const country = regionData.international.find((c: any) => c.code === parentCode);
        if (country && country.children) {
          return NextResponse.json({
            data: country.children,
            success: true
          });
        }
      }
    } else {
      // 如果没有指定类型，根据需要返回合适的数据
      return NextResponse.json({
        data: {
          china: regionData.china,
          international: regionData.international
        },
        success: true
      });
    }

    return NextResponse.json({
      data: [],
      success: true
    });
  } catch (error) {
    console.error('Regions API error:', error);
    return NextResponse.json({
      error: 'Failed to get regions',
      success: false
    }, { status: 500 });
  }
}