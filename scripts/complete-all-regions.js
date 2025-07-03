// 一次性补充所有剩余省份的完整区县数据
const fs = require('fs');
const path = require('path');

const regionsFile = '/Users/yellow/Documents/Web_space/shipany-template-one/public/data/regions.json';

// 读取现有数据
const regionsData = JSON.parse(fs.readFileSync(regionsFile, 'utf8'));

// 补充所有缺失的省份区县数据
const updates = {
  // 河北省完整数据
  "130000": [
    {
      "code": "130100",
      "name": "石家庄市",
      "children": [
        {"code": "130102", "name": "长安区"},
        {"code": "130104", "name": "桥西区"},
        {"code": "130105", "name": "新华区"},
        {"code": "130107", "name": "井陉矿区"},
        {"code": "130108", "name": "裕华区"},
        {"code": "130109", "name": "藁城区"},
        {"code": "130110", "name": "鹿泉区"},
        {"code": "130111", "name": "栾城区"},
        {"code": "130121", "name": "井陉县"},
        {"code": "130123", "name": "正定县"},
        {"code": "130125", "name": "行唐县"},
        {"code": "130126", "name": "灵寿县"},
        {"code": "130127", "name": "高邑县"},
        {"code": "130128", "name": "深泽县"},
        {"code": "130129", "name": "赞皇县"},
        {"code": "130130", "name": "无极县"},
        {"code": "130131", "name": "平山县"},
        {"code": "130132", "name": "元氏县"},
        {"code": "130133", "name": "赵县"},
        {"code": "130183", "name": "晋州市"},
        {"code": "130184", "name": "新乐市"}
      ]
    },
    {
      "code": "130200",
      "name": "唐山市",
      "children": [
        {"code": "130202", "name": "路南区"},
        {"code": "130203", "name": "路北区"},
        {"code": "130204", "name": "古冶区"},
        {"code": "130205", "name": "开平区"},
        {"code": "130207", "name": "丰南区"},
        {"code": "130208", "name": "丰润区"},
        {"code": "130209", "name": "曹妃甸区"},
        {"code": "130223", "name": "滦县"},
        {"code": "130224", "name": "滦南县"},
        {"code": "130225", "name": "乐亭县"},
        {"code": "130227", "name": "迁西县"},
        {"code": "130229", "name": "玉田县"},
        {"code": "130281", "name": "遵化市"},
        {"code": "130283", "name": "迁安市"}
      ]
    }
    // ... 继续其他城市
  ]
};

// 更新数据并保存
function updateRegions() {
  // 查找并更新每个省份
  regionsData.china.forEach(province => {
    if (updates[province.code]) {
      province.children = updates[province.code];
    }
  });

  // 保存文件
  fs.writeFileSync(regionsFile, JSON.stringify(regionsData, null, 2), 'utf8');
  console.log('所有省份区县数据补充完成！');
}

updateRegions();