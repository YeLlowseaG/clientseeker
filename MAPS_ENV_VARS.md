# 地图API分页配置环境变量

在Vercel控制台的Environment Variables中添加以下配置，便于运营调整地图API请求参数。

## Google Maps API 配置

| 环境变量名 | 默认值 | 说明 | 建议范围 |
|-----------|--------|------|----------|
| `GOOGLE_MAPS_MAX_PAGES` | 3 | 最大请求页数 | 1-3 (API限制) |
| `GOOGLE_MAPS_MAX_DETAILS` | 10 | 获取详情的商户数 | 5-20 |
| `GOOGLE_MAPS_PAGE_DELAY` | 2000 | 页面间隔时间(毫秒) | 1000-5000 |

## 高德地图 API 配置

| 环境变量名 | 默认值 | 说明 | 建议范围 |
|-----------|--------|------|----------|
| `GAODE_MAPS_MAX_PAGES` | 5 | 最大请求页数 | 3-10 |
| `GAODE_MAPS_PAGE_SIZE` | 20 | 每页条数 | 10-25 |
| `GAODE_MAPS_PAGE_DELAY` | 500 | 页面间隔时间(毫秒) | 200-1000 |

## 百度地图 API 配置

| 环境变量名 | 默认值 | 说明 | 建议范围 |
|-----------|--------|------|----------|
| `BAIDU_MAPS_MAX_PAGES` | 5 | 最大请求页数 | 3-10 |
| `BAIDU_MAPS_PAGE_SIZE` | 20 | 每页条数 | 10-25 |
| `BAIDU_MAPS_PAGE_DELAY` | 300 | 页面间隔时间(毫秒) | 100-1000 |

## 配置说明

### 1. 开发环境建议
```
GOOGLE_MAPS_MAX_PAGES=1
GAODE_MAPS_MAX_PAGES=2
BAIDU_MAPS_MAX_PAGES=2
```

### 2. 生产环境建议  
```
GOOGLE_MAPS_MAX_PAGES=3
GAODE_MAPS_MAX_PAGES=5
BAIDU_MAPS_MAX_PAGES=5
```

### 3. 高负载环境
```
GOOGLE_MAPS_MAX_PAGES=2
GAODE_MAPS_MAX_PAGES=3
BAIDU_MAPS_MAX_PAGES=3
GAODE_MAPS_PAGE_DELAY=800
BAIDU_MAPS_PAGE_DELAY=500
```

## 调整策略

### 成本优化
- 减少 `MAX_PAGES` 降低API调用成本
- 增加 `PAGE_DELAY` 避免频率限制

### 性能优化  
- 适当减少 `MAX_PAGES` 提升响应速度
- 调整 `PAGE_SIZE` 平衡数据量和性能

### API配额管理
- 根据月度配额调整 `MAX_PAGES`
- 监控API使用量及时调整参数

## 实时监控

系统启动时会在控制台输出当前配置：
```
🗺️ Maps API Configuration: {
  google: { maxPages: 3, maxDetailsToFetch: 10, pageDelay: 2000 },
  gaode: { maxPages: 5, pageSize: 20, pageDelay: 500 },
  baidu: { maxPages: 5, pageSize: 20, pageDelay: 300 }
}
```

配置警告会在控制台显示：
```
⚠️ Maps Configuration Warnings: [
  "Google Maps API 一般最多支持3页，当前配置可能超限"
]
```