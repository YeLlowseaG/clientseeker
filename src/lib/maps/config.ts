export interface MapConfig {
  gaode: {
    key: string;
    webKey: string;
  };
  baidu: {
    ak: string;
  };
  google: {
    key: string;
  };
}

export const mapConfig: MapConfig = {
  gaode: {
    key: process.env.GAODE_API_KEY || '',
    webKey: process.env.GAODE_WEB_KEY || '',
  },
  baidu: {
    ak: process.env.BAIDU_MAP_AK || '',
  },
  google: {
    key: process.env.GOOGLE_MAPS_API_KEY || '',
  },
};

export interface BusinessInfo {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  category: string;
  latitude: number;
  longitude: number;
  source: 'gaode' | 'baidu' | 'dianping' | 'google';
}