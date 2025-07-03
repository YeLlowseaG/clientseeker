export interface Region {
  code: string;
  name: string;
  name_en?: string;
  children?: Region[];
}

export interface SelectedRegion {
  province?: Region;
  city?: Region;
  district?: Region;
  regionType?: 'china' | 'international'; // 用户手动选择的地区类型
}

export interface RegionData {
  china: Region[];
  international: Region[];
}