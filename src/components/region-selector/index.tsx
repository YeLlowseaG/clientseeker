'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, MapPin, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Region, SelectedRegion } from '@/lib/regions/types';
import { getChinaRegions, getInternationalRegions } from '@/lib/regions/data';

interface RegionSelectorProps {
  isChina: boolean; // IP检测的默认国家类型
  defaultRegion?: SelectedRegion;
  onRegionChange: (region: SelectedRegion) => void;
  className?: string;
}

export default function RegionSelector({
  isChina,
  defaultRegion,
  onRegionChange,
  className = ''
}: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion>(defaultRegion || {});
  const [loading, setLoading] = useState(false);
  const [currentRegionType, setCurrentRegionType] = useState<'china' | 'international'>(isChina ? 'china' : 'international');

  // 辅助函数定义
  const findCities = useCallback((provinceCode: string): Region[] => {
    const province = provinces.find(p => p.code === provinceCode);
    return province?.children || [];
  }, [provinces]);

  const findDistricts = useCallback((provinceCode: string, cityCode: string): Region[] => {
    if (currentRegionType !== 'china') return []; // 国际地区通常不需要第三级
    
    const province = provinces.find(p => p.code === provinceCode);
    if (!province?.children) return [];
    
    const city = province.children.find(c => c.code === cityCode);
    return city?.children || [];
  }, [currentRegionType, provinces]);

  // 获取省份/国家列表
  useEffect(() => {
    const loadRegions = async () => {
      setLoading(true);
      try {
        const regions = currentRegionType === 'china' 
          ? await getChinaRegions() 
          : await getInternationalRegions();
        setProvinces(regions);
      } catch (error) {
        console.error('Failed to load regions:', error);
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, [currentRegionType]);

  // 当IP检测结果变化时，更新默认地区类型（仅在用户未手动选择时）
  useEffect(() => {
    setCurrentRegionType(isChina ? 'china' : 'international');
  }, [isChina]);

  // 当默认地区改变时更新选择
  useEffect(() => {
    if (defaultRegion) {
      setSelectedRegion(defaultRegion);
      if (defaultRegion.province) {
        const cityList = findCities(defaultRegion.province.code);
        setCities(cityList);
      }
      if (defaultRegion.city && defaultRegion.province) {
        const districtList = findDistricts(defaultRegion.province.code, defaultRegion.city.code);
        setDistricts(districtList);
      }
    }
  }, [defaultRegion, findCities, findDistricts]);

  const handleRegionTypeChange = (type: 'china' | 'international') => {
    setCurrentRegionType(type);
    // 清除当前选择，但保留地区类型
    const newRegion = { regionType: type };
    setSelectedRegion(newRegion);
    setCities([]);
    setDistricts([]);
    onRegionChange(newRegion);
  };

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code === value);
    if (province) {
      const newRegion = {
        province,
        city: undefined,
        district: undefined,
        regionType: currentRegionType
      };
      setSelectedRegion(newRegion);
      setCities([]);
      setDistricts([]);
      onRegionChange(newRegion);
      
      // 获取城市列表
      const cityList = findCities(province.code);
      setCities(cityList);
    }
  };

  const handleCityChange = (value: string) => {
    const city = cities.find(c => c.code === value);
    if (city) {
      const newRegion = {
        ...selectedRegion,
        city,
        district: undefined,
        regionType: currentRegionType
      };
      setSelectedRegion(newRegion);
      setDistricts([]);
      onRegionChange(newRegion);
      
      // 如果是中国地区，获取区县列表
      if (currentRegionType === 'china' && selectedRegion.province) {
        const districtList = findDistricts(selectedRegion.province.code, city.code);
        setDistricts(districtList);
      }
    }
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.code === value);
    if (district) {
      const newRegion = {
        ...selectedRegion,
        district,
        regionType: currentRegionType
      };
      setSelectedRegion(newRegion);
      onRegionChange(newRegion);
    }
  };

  const clearSelection = () => {
    const newRegion = { regionType: currentRegionType };
    setSelectedRegion(newRegion);
    setCities([]);
    setDistricts([]);
    onRegionChange(newRegion);
  };

  const getDisplayText = () => {
    if (selectedRegion.district) {
      return `${selectedRegion.province?.name} ${selectedRegion.city?.name} ${selectedRegion.district.name}`;
    }
    if (selectedRegion.city) {
      return `${selectedRegion.province?.name} ${selectedRegion.city.name}`;
    }
    if (selectedRegion.province) {
      return selectedRegion.province.name;
    }
    return currentRegionType === 'china' ? '请选择省市区' : '请选择国家地区';
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">加载地区数据...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">地区选择</span>
        <Badge variant="outline">
          IP检测: {isChina ? '中国' : '国际'}
        </Badge>
        {(selectedRegion.province || selectedRegion.city || selectedRegion.district) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* 地区类型切换 */}
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">选择地区类型:</span>
        <div className="flex gap-1">
          <Button
            variant={currentRegionType === 'china' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRegionTypeChange('china')}
            className="h-7 px-3 text-xs"
          >
            中国
          </Button>
          <Button
            variant={currentRegionType === 'international' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRegionTypeChange('international')}
            className="h-7 px-3 text-xs"
          >
            国际
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* 省份/国家选择 */}
        <Select
          value={selectedRegion.province?.code || ""}
          onValueChange={handleProvinceChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={currentRegionType === 'china' ? "选择省份" : "选择国家"} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 城市选择 */}
        <Select
          value={selectedRegion.city?.code || ""}
          onValueChange={handleCityChange}
          disabled={!selectedRegion.province || cities.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择城市" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.code} value={city.code}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 区县选择（仅中国地区） */}
        {currentRegionType === 'china' && (
          <Select
            value={selectedRegion.district?.code || ""}
            onValueChange={handleDistrictChange}
            disabled={!selectedRegion.city || districts.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择区县" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 选择结果显示 */}
      {(selectedRegion.province || selectedRegion.city || selectedRegion.district) && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm">{getDisplayText()}</span>
        </div>
      )}
    </div>
  );
}