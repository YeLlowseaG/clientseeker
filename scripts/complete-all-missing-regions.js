const fs = require('fs');
const path = require('path');

const regionsFile = '/Users/yellow/Documents/Web_space/shipany-template-one/public/data/regions.json';

// 读取现有数据
const regionsData = JSON.parse(fs.readFileSync(regionsFile, 'utf8'));

// 补充所有缺失省份的完整区县数据
function addCompleteDistrictData() {
  // 找到需要补充的省份并添加区县数据
  regionsData.china.forEach(province => {
    switch(province.code) {
      case "310000": // 上海市
        if (province.children.length === 1) {
          province.children[0].children = [
            {"code": "310101", "name": "黄浦区"},
            {"code": "310104", "name": "徐汇区"},
            {"code": "310105", "name": "长宁区"},
            {"code": "310106", "name": "静安区"},
            {"code": "310107", "name": "普陀区"},
            {"code": "310109", "name": "虹口区"},
            {"code": "310110", "name": "杨浦区"},
            {"code": "310112", "name": "闵行区"},
            {"code": "310113", "name": "宝山区"},
            {"code": "310114", "name": "嘉定区"},
            {"code": "310115", "name": "浦东新区"},
            {"code": "310116", "name": "金山区"},
            {"code": "310117", "name": "松江区"},
            {"code": "310118", "name": "青浦区"},
            {"code": "310120", "name": "奉贤区"},
            {"code": "310151", "name": "崇明区"}
          ];
        }
        break;

      case "320000": // 江苏省 - 补充缺失的区县
        province.children.forEach(city => {
          if (city.code === "320100" && (!city.children || city.children.length < 10)) { // 南京市
            city.children = [
              {"code": "320102", "name": "玄武区"},
              {"code": "320104", "name": "秦淮区"},
              {"code": "320105", "name": "建邺区"},
              {"code": "320106", "name": "鼓楼区"},
              {"code": "320111", "name": "浦口区"},
              {"code": "320113", "name": "栖霞区"},
              {"code": "320114", "name": "雨花台区"},
              {"code": "320115", "name": "江宁区"},
              {"code": "320116", "name": "六合区"},
              {"code": "320117", "name": "溧水区"},
              {"code": "320118", "name": "高淳区"}
            ];
          }
          if (city.code === "320200" && (!city.children || city.children.length < 5)) { // 无锡市
            city.children = [
              {"code": "320205", "name": "锡山区"},
              {"code": "320206", "name": "惠山区"},
              {"code": "320211", "name": "滨湖区"},
              {"code": "320213", "name": "梁溪区"},
              {"code": "320214", "name": "新吴区"},
              {"code": "320281", "name": "江阴市"},
              {"code": "320282", "name": "宜兴市"}
            ];
          }
          if (city.code === "320300" && (!city.children || city.children.length < 5)) { // 徐州市
            city.children = [
              {"code": "320302", "name": "鼓楼区"},
              {"code": "320303", "name": "云龙区"},
              {"code": "320305", "name": "贾汪区"},
              {"code": "320311", "name": "泉山区"},
              {"code": "320312", "name": "铜山区"},
              {"code": "320321", "name": "丰县"},
              {"code": "320322", "name": "沛县"},
              {"code": "320324", "name": "睢宁县"},
              {"code": "320381", "name": "新沂市"},
              {"code": "320382", "name": "邳州市"}
            ];
          }
          if (city.code === "320400" && (!city.children || city.children.length < 3)) { // 常州市
            city.children = [
              {"code": "320402", "name": "天宁区"},
              {"code": "320404", "name": "钟楼区"},
              {"code": "320411", "name": "新北区"},
              {"code": "320412", "name": "武进区"},
              {"code": "320413", "name": "金坛区"},
              {"code": "320481", "name": "溧阳市"}
            ];
          }
          if (city.code === "320500" && (!city.children || city.children.length < 3)) { // 苏州市
            city.children = [
              {"code": "320505", "name": "虎丘区"},
              {"code": "320506", "name": "吴中区"},
              {"code": "320507", "name": "相城区"},
              {"code": "320508", "name": "姑苏区"},
              {"code": "320509", "name": "吴江区"},
              {"code": "320581", "name": "常熟市"},
              {"code": "320582", "name": "张家港市"},
              {"code": "320583", "name": "昆山市"},
              {"code": "320585", "name": "太仓市"}
            ];
          }
          if (city.code === "320600" && (!city.children || city.children.length < 3)) { // 南通市
            city.children = [
              {"code": "320602", "name": "崇川区"},
              {"code": "320611", "name": "港闸区"},
              {"code": "320612", "name": "通州区"},
              {"code": "320621", "name": "海安县"},
              {"code": "320623", "name": "如东县"},
              {"code": "320681", "name": "启东市"},
              {"code": "320682", "name": "如皋市"},
              {"code": "320684", "name": "海门市"}
            ];
          }
          if (city.code === "320700" && (!city.children || city.children.length < 3)) { // 连云港市
            city.children = [
              {"code": "320703", "name": "连云区"},
              {"code": "320706", "name": "海州区"},
              {"code": "320707", "name": "赣榆区"},
              {"code": "320722", "name": "东海县"},
              {"code": "320723", "name": "灌云县"},
              {"code": "320724", "name": "灌南县"}
            ];
          }
          if (city.code === "320800" && (!city.children || city.children.length < 3)) { // 淮安市
            city.children = [
              {"code": "320803", "name": "淮安区"},
              {"code": "320804", "name": "淮阴区"},
              {"code": "320812", "name": "清江浦区"},
              {"code": "320813", "name": "洪泽区"},
              {"code": "320826", "name": "涟水县"},
              {"code": "320830", "name": "盱眙县"},
              {"code": "320831", "name": "金湖县"}
            ];
          }
          if (city.code === "320900" && (!city.children || city.children.length < 3)) { // 盐城市
            city.children = [
              {"code": "320902", "name": "亭湖区"},
              {"code": "320903", "name": "盐都区"},
              {"code": "320904", "name": "大丰区"},
              {"code": "320921", "name": "响水县"},
              {"code": "320922", "name": "滨海县"},
              {"code": "320923", "name": "阜宁县"},
              {"code": "320924", "name": "射阳县"},
              {"code": "320925", "name": "建湖县"},
              {"code": "320981", "name": "东台市"}
            ];
          }
          if (city.code === "321000" && (!city.children || city.children.length < 3)) { // 扬州市
            city.children = [
              {"code": "321002", "name": "广陵区"},
              {"code": "321003", "name": "邗江区"},
              {"code": "321012", "name": "江都区"},
              {"code": "321023", "name": "宝应县"},
              {"code": "321081", "name": "仪征市"},
              {"code": "321084", "name": "高邮市"}
            ];
          }
          if (city.code === "321100" && (!city.children || city.children.length < 3)) { // 镇江市
            city.children = [
              {"code": "321102", "name": "京口区"},
              {"code": "321111", "name": "润州区"},
              {"code": "321112", "name": "丹徒区"},
              {"code": "321181", "name": "丹阳市"},
              {"code": "321182", "name": "扬中市"},
              {"code": "321183", "name": "句容市"}
            ];
          }
          if (city.code === "321200" && (!city.children || city.children.length < 3)) { // 泰州市
            city.children = [
              {"code": "321202", "name": "海陵区"},
              {"code": "321203", "name": "高港区"},
              {"code": "321204", "name": "姜堰区"},
              {"code": "321281", "name": "兴化市"},
              {"code": "321282", "name": "靖江市"},
              {"code": "321283", "name": "泰兴市"}
            ];
          }
          if (city.code === "321300" && (!city.children || city.children.length < 3)) { // 宿迁市
            city.children = [
              {"code": "321302", "name": "宿城区"},
              {"code": "321311", "name": "宿豫区"},
              {"code": "321322", "name": "沭阳县"},
              {"code": "321323", "name": "泗阳县"},
              {"code": "321324", "name": "泗洪县"}
            ];
          }
        });
        break;

      case "330000": // 浙江省 - 补充区县数据
        province.children.forEach(city => {
          if (city.code === "330100" && (!city.children || city.children.length < 10)) { // 杭州市
            city.children = [
              {"code": "330102", "name": "上城区"},
              {"code": "330105", "name": "拱墅区"},
              {"code": "330106", "name": "西湖区"},
              {"code": "330108", "name": "滨江区"},
              {"code": "330109", "name": "萧山区"},
              {"code": "330110", "name": "余杭区"},
              {"code": "330111", "name": "富阳区"},
              {"code": "330112", "name": "临安区"},
              {"code": "330113", "name": "临平区"},
              {"code": "330114", "name": "钱塘区"},
              {"code": "330122", "name": "桐庐县"},
              {"code": "330127", "name": "淳安县"},
              {"code": "330182", "name": "建德市"}
            ];
          }
          if (city.code === "330200" && (!city.children || city.children.length < 5)) { // 宁波市
            city.children = [
              {"code": "330203", "name": "海曙区"},
              {"code": "330204", "name": "江北区"},
              {"code": "330205", "name": "北仑区"},
              {"code": "330206", "name": "镇海区"},
              {"code": "330211", "name": "鄞州区"},
              {"code": "330212", "name": "奉化区"},
              {"code": "330225", "name": "象山县"},
              {"code": "330226", "name": "宁海县"},
              {"code": "330281", "name": "余姚市"},
              {"code": "330282", "name": "慈溪市"}
            ];
          }
          if (city.code === "330300" && (!city.children || city.children.length < 5)) { // 温州市
            city.children = [
              {"code": "330302", "name": "鹿城区"},
              {"code": "330303", "name": "龙湾区"},
              {"code": "330304", "name": "瓯海区"},
              {"code": "330305", "name": "洞头区"},
              {"code": "330324", "name": "永嘉县"},
              {"code": "330326", "name": "平阳县"},
              {"code": "330327", "name": "苍南县"},
              {"code": "330328", "name": "文成县"},
              {"code": "330329", "name": "泰顺县"},
              {"code": "330381", "name": "瑞安市"},
              {"code": "330382", "name": "乐清市"}
            ];
          }
          if (city.code === "330400" && (!city.children || city.children.length < 3)) { // 嘉兴市
            city.children = [
              {"code": "330402", "name": "南湖区"},
              {"code": "330411", "name": "秀洲区"},
              {"code": "330421", "name": "嘉善县"},
              {"code": "330424", "name": "海盐县"},
              {"code": "330481", "name": "海宁市"},
              {"code": "330482", "name": "平湖市"},
              {"code": "330483", "name": "桐乡市"}
            ];
          }
          if (city.code === "330500" && (!city.children || city.children.length < 3)) { // 湖州市
            city.children = [
              {"code": "330502", "name": "吴兴区"},
              {"code": "330503", "name": "南浔区"},
              {"code": "330521", "name": "德清县"},
              {"code": "330522", "name": "长兴县"},
              {"code": "330523", "name": "安吉县"}
            ];
          }
          if (city.code === "330600" && (!city.children || city.children.length < 3)) { // 绍兴市
            city.children = [
              {"code": "330602", "name": "越城区"},
              {"code": "330603", "name": "柯桥区"},
              {"code": "330604", "name": "上虞区"},
              {"code": "330624", "name": "新昌县"},
              {"code": "330681", "name": "诸暨市"},
              {"code": "330683", "name": "嵊州市"}
            ];
          }
          if (city.code === "330700" && (!city.children || city.children.length < 3)) { // 金华市
            city.children = [
              {"code": "330702", "name": "婺城区"},
              {"code": "330703", "name": "金东区"},
              {"code": "330723", "name": "武义县"},
              {"code": "330726", "name": "浦江县"},
              {"code": "330727", "name": "磐安县"},
              {"code": "330781", "name": "兰溪市"},
              {"code": "330782", "name": "义乌市"},
              {"code": "330783", "name": "东阳市"},
              {"code": "330784", "name": "永康市"}
            ];
          }
          if (city.code === "330800" && (!city.children || city.children.length < 3)) { // 衢州市
            city.children = [
              {"code": "330802", "name": "柯城区"},
              {"code": "330803", "name": "衢江区"},
              {"code": "330822", "name": "常山县"},
              {"code": "330824", "name": "开化县"},
              {"code": "330825", "name": "龙游县"},
              {"code": "330881", "name": "江山市"}
            ];
          }
          if (city.code === "330900" && (!city.children || city.children.length < 3)) { // 舟山市
            city.children = [
              {"code": "330902", "name": "定海区"},
              {"code": "330903", "name": "普陀区"},
              {"code": "330921", "name": "岱山县"},
              {"code": "330922", "name": "嵊泗县"}
            ];
          }
          if (city.code === "331000" && (!city.children || city.children.length < 3)) { // 台州市
            city.children = [
              {"code": "331002", "name": "椒江区"},
              {"code": "331003", "name": "黄岩区"},
              {"code": "331004", "name": "路桥区"},
              {"code": "331022", "name": "三门县"},
              {"code": "331023", "name": "天台县"},
              {"code": "331024", "name": "仙居县"},
              {"code": "331081", "name": "温岭市"},
              {"code": "331082", "name": "临海市"},
              {"code": "331083", "name": "玉环市"}
            ];
          }
          if (city.code === "331100" && (!city.children || city.children.length < 3)) { // 丽水市
            city.children = [
              {"code": "331102", "name": "莲都区"},
              {"code": "331121", "name": "青田县"},
              {"code": "331122", "name": "缙云县"},
              {"code": "331123", "name": "遂昌县"},
              {"code": "331124", "name": "松阳县"},
              {"code": "331125", "name": "云和县"},
              {"code": "331126", "name": "庆元县"},
              {"code": "331127", "name": "景宁畲族自治县"},
              {"code": "331181", "name": "龙泉市"}
            ];
          }
        });
        break;

      case "360000": // 江西省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "360100": // 南昌市
                city.children = [
                  {"code": "360102", "name": "东湖区"},
                  {"code": "360103", "name": "西湖区"},
                  {"code": "360104", "name": "青云谱区"},
                  {"code": "360111", "name": "青山湖区"},
                  {"code": "360112", "name": "新建区"},
                  {"code": "360113", "name": "红谷滩区"},
                  {"code": "360121", "name": "南昌县"},
                  {"code": "360123", "name": "安义县"},
                  {"code": "360124", "name": "进贤县"}
                ];
                break;
              case "360200": // 景德镇市
                city.children = [
                  {"code": "360202", "name": "昌江区"},
                  {"code": "360203", "name": "珠山区"},
                  {"code": "360222", "name": "浮梁县"},
                  {"code": "360281", "name": "乐平市"}
                ];
                break;
              case "360300": // 萍乡市
                city.children = [
                  {"code": "360302", "name": "安源区"},
                  {"code": "360313", "name": "湘东区"},
                  {"code": "360321", "name": "莲花县"},
                  {"code": "360322", "name": "上栗县"},
                  {"code": "360323", "name": "芦溪县"}
                ];
                break;
              case "360400": // 九江市
                city.children = [
                  {"code": "360402", "name": "濂溪区"},
                  {"code": "360403", "name": "浔阳区"},
                  {"code": "360404", "name": "柴桑区"},
                  {"code": "360423", "name": "武宁县"},
                  {"code": "360424", "name": "修水县"},
                  {"code": "360425", "name": "永修县"},
                  {"code": "360426", "name": "德安县"},
                  {"code": "360428", "name": "都昌县"},
                  {"code": "360429", "name": "湖口县"},
                  {"code": "360430", "name": "彭泽县"},
                  {"code": "360481", "name": "瑞昌市"},
                  {"code": "360482", "name": "共青城市"},
                  {"code": "360483", "name": "庐山市"}
                ];
                break;
              case "360500": // 新余市
                city.children = [
                  {"code": "360502", "name": "渝水区"},
                  {"code": "360521", "name": "分宜县"}
                ];
                break;
              case "360600": // 鹰潭市
                city.children = [
                  {"code": "360602", "name": "月湖区"},
                  {"code": "360603", "name": "余江区"},
                  {"code": "360681", "name": "贵溪市"}
                ];
                break;
              case "360700": // 赣州市
                city.children = [
                  {"code": "360702", "name": "章贡区"},
                  {"code": "360703", "name": "南康区"},
                  {"code": "360704", "name": "赣县区"},
                  {"code": "360722", "name": "信丰县"},
                  {"code": "360723", "name": "大余县"},
                  {"code": "360724", "name": "上犹县"},
                  {"code": "360725", "name": "崇义县"},
                  {"code": "360726", "name": "安远县"},
                  {"code": "360727", "name": "龙南县"},
                  {"code": "360728", "name": "定南县"},
                  {"code": "360729", "name": "全南县"},
                  {"code": "360730", "name": "宁都县"},
                  {"code": "360731", "name": "于都县"},
                  {"code": "360732", "name": "兴国县"},
                  {"code": "360733", "name": "会昌县"},
                  {"code": "360734", "name": "寻乌县"},
                  {"code": "360735", "name": "石城县"},
                  {"code": "360781", "name": "瑞金市"}
                ];
                break;
              case "360800": // 吉安市
                city.children = [
                  {"code": "360802", "name": "吉州区"},
                  {"code": "360803", "name": "青原区"},
                  {"code": "360821", "name": "吉安县"},
                  {"code": "360822", "name": "吉水县"},
                  {"code": "360823", "name": "峡江县"},
                  {"code": "360824", "name": "新干县"},
                  {"code": "360825", "name": "永丰县"},
                  {"code": "360826", "name": "泰和县"},
                  {"code": "360827", "name": "遂川县"},
                  {"code": "360828", "name": "万安县"},
                  {"code": "360829", "name": "安福县"},
                  {"code": "360830", "name": "永新县"},
                  {"code": "360881", "name": "井冈山市"}
                ];
                break;
              case "360900": // 宜春市
                city.children = [
                  {"code": "360902", "name": "袁州区"},
                  {"code": "360921", "name": "奉新县"},
                  {"code": "360922", "name": "万载县"},
                  {"code": "360923", "name": "上高县"},
                  {"code": "360924", "name": "宜丰县"},
                  {"code": "360925", "name": "靖安县"},
                  {"code": "360926", "name": "铜鼓县"},
                  {"code": "360981", "name": "丰城市"},
                  {"code": "360982", "name": "樟树市"},
                  {"code": "360983", "name": "高安市"}
                ];
                break;
              case "361000": // 抚州市
                city.children = [
                  {"code": "361002", "name": "临川区"},
                  {"code": "361003", "name": "东乡区"},
                  {"code": "361021", "name": "南城县"},
                  {"code": "361022", "name": "黎川县"},
                  {"code": "361023", "name": "南丰县"},
                  {"code": "361024", "name": "崇仁县"},
                  {"code": "361025", "name": "乐安县"},
                  {"code": "361026", "name": "宜黄县"},
                  {"code": "361027", "name": "金溪县"},
                  {"code": "361028", "name": "资溪县"},
                  {"code": "361030", "name": "广昌县"}
                ];
                break;
              case "361100": // 上饶市
                city.children = [
                  {"code": "361102", "name": "信州区"},
                  {"code": "361103", "name": "广丰区"},
                  {"code": "361104", "name": "广信区"},
                  {"code": "361123", "name": "玉山县"},
                  {"code": "361124", "name": "铅山县"},
                  {"code": "361125", "name": "横峰县"},
                  {"code": "361126", "name": "弋阳县"},
                  {"code": "361127", "name": "余干县"},
                  {"code": "361128", "name": "鄱阳县"},
                  {"code": "361129", "name": "万年县"},
                  {"code": "361130", "name": "婺源县"},
                  {"code": "361181", "name": "德兴市"}
                ];
                break;
            }
          }
        });
        break;

      case "450000": // 广西壮族自治区 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "450100": // 南宁市
                city.children = [
                  {"code": "450102", "name": "兴宁区"},
                  {"code": "450103", "name": "青秀区"},
                  {"code": "450105", "name": "江南区"},
                  {"code": "450107", "name": "西乡塘区"},
                  {"code": "450108", "name": "良庆区"},
                  {"code": "450109", "name": "邕宁区"},
                  {"code": "450110", "name": "武鸣区"},
                  {"code": "450123", "name": "隆安县"},
                  {"code": "450124", "name": "马山县"},
                  {"code": "450125", "name": "上林县"},
                  {"code": "450126", "name": "宾阳县"},
                  {"code": "450127", "name": "横县"}
                ];
                break;
              case "450200": // 柳州市
                city.children = [
                  {"code": "450202", "name": "城中区"},
                  {"code": "450203", "name": "鱼峰区"},
                  {"code": "450204", "name": "柳南区"},
                  {"code": "450205", "name": "柳北区"},
                  {"code": "450206", "name": "柳江区"},
                  {"code": "450222", "name": "柳城县"},
                  {"code": "450223", "name": "鹿寨县"},
                  {"code": "450224", "name": "融安县"},
                  {"code": "450225", "name": "融水苗族自治县"},
                  {"code": "450226", "name": "三江侗族自治县"}
                ];
                break;
              case "450300": // 桂林市
                city.children = [
                  {"code": "450302", "name": "秀峰区"},
                  {"code": "450303", "name": "叠彩区"},
                  {"code": "450304", "name": "象山区"},
                  {"code": "450305", "name": "七星区"},
                  {"code": "450311", "name": "雁山区"},
                  {"code": "450312", "name": "临桂区"},
                  {"code": "450321", "name": "阳朔县"},
                  {"code": "450323", "name": "灵川县"},
                  {"code": "450324", "name": "全州县"},
                  {"code": "450325", "name": "兴安县"},
                  {"code": "450326", "name": "永福县"},
                  {"code": "450327", "name": "灌阳县"},
                  {"code": "450328", "name": "龙胜各族自治县"},
                  {"code": "450329", "name": "资源县"},
                  {"code": "450330", "name": "平乐县"},
                  {"code": "450332", "name": "恭城瑶族自治县"},
                  {"code": "450381", "name": "荔浦市"}
                ];
                break;
              case "450400": // 梧州市
                city.children = [
                  {"code": "450403", "name": "万秀区"},
                  {"code": "450405", "name": "长洲区"},
                  {"code": "450406", "name": "龙圩区"},
                  {"code": "450421", "name": "苍梧县"},
                  {"code": "450422", "name": "藤县"},
                  {"code": "450423", "name": "蒙山县"},
                  {"code": "450481", "name": "岑溪市"}
                ];
                break;
              case "450500": // 北海市
                city.children = [
                  {"code": "450502", "name": "海城区"},
                  {"code": "450503", "name": "银海区"},
                  {"code": "450512", "name": "铁山港区"},
                  {"code": "450521", "name": "合浦县"}
                ];
                break;
              case "450600": // 防城港市
                city.children = [
                  {"code": "450602", "name": "港口区"},
                  {"code": "450603", "name": "防城区"},
                  {"code": "450621", "name": "上思县"},
                  {"code": "450681", "name": "东兴市"}
                ];
                break;
              case "450700": // 钦州市
                city.children = [
                  {"code": "450702", "name": "钦南区"},
                  {"code": "450703", "name": "钦北区"},
                  {"code": "450721", "name": "灵山县"},
                  {"code": "450722", "name": "浦北县"}
                ];
                break;
              case "450800": // 贵港市
                city.children = [
                  {"code": "450802", "name": "港北区"},
                  {"code": "450803", "name": "港南区"},
                  {"code": "450804", "name": "覃塘区"},
                  {"code": "450821", "name": "平南县"},
                  {"code": "450881", "name": "桂平市"}
                ];
                break;
              case "450900": // 玉林市
                city.children = [
                  {"code": "450902", "name": "玉州区"},
                  {"code": "450903", "name": "福绵区"},
                  {"code": "450921", "name": "容县"},
                  {"code": "450922", "name": "陆川县"},
                  {"code": "450923", "name": "博白县"},
                  {"code": "450924", "name": "兴业县"},
                  {"code": "450981", "name": "北流市"}
                ];
                break;
              case "451000": // 百色市
                city.children = [
                  {"code": "451002", "name": "右江区"},
                  {"code": "451003", "name": "田阳区"},
                  {"code": "451022", "name": "田东县"},
                  {"code": "451024", "name": "德保县"},
                  {"code": "451026", "name": "那坡县"},
                  {"code": "451027", "name": "凌云县"},
                  {"code": "451028", "name": "乐业县"},
                  {"code": "451029", "name": "田林县"},
                  {"code": "451030", "name": "西林县"},
                  {"code": "451031", "name": "隆林各族自治县"},
                  {"code": "451081", "name": "靖西市"},
                  {"code": "451082", "name": "平果市"}
                ];
                break;
              case "451100": // 贺州市
                city.children = [
                  {"code": "451102", "name": "八步区"},
                  {"code": "451103", "name": "平桂区"},
                  {"code": "451121", "name": "昭平县"},
                  {"code": "451122", "name": "钟山县"},
                  {"code": "451123", "name": "富川瑶族自治县"}
                ];
                break;
              case "451200": // 河池市
                city.children = [
                  {"code": "451202", "name": "金城江区"},
                  {"code": "451203", "name": "宜州区"},
                  {"code": "451221", "name": "南丹县"},
                  {"code": "451222", "name": "天峨县"},
                  {"code": "451223", "name": "凤山县"},
                  {"code": "451224", "name": "东兰县"},
                  {"code": "451225", "name": "罗城仫佬族自治县"},
                  {"code": "451226", "name": "环江毛南族自治县"},
                  {"code": "451227", "name": "巴马瑶族自治县"},
                  {"code": "451228", "name": "都安瑶族自治县"},
                  {"code": "451229", "name": "大化瑶族自治县"}
                ];
                break;
              case "451300": // 来宾市
                city.children = [
                  {"code": "451302", "name": "兴宾区"},
                  {"code": "451321", "name": "忻城县"},
                  {"code": "451322", "name": "象州县"},
                  {"code": "451323", "name": "武宣县"},
                  {"code": "451324", "name": "金秀瑶族自治县"},
                  {"code": "451381", "name": "合山市"}
                ];
                break;
              case "451400": // 崇左市
                city.children = [
                  {"code": "451402", "name": "江州区"},
                  {"code": "451421", "name": "扶绥县"},
                  {"code": "451422", "name": "宁明县"},
                  {"code": "451423", "name": "龙州县"},
                  {"code": "451424", "name": "大新县"},
                  {"code": "451425", "name": "天等县"},
                  {"code": "451481", "name": "凭祥市"}
                ];
                break;
            }
          }
        });
        break;

      case "460000": // 海南省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "460100": // 海口市
                city.children = [
                  {"code": "460105", "name": "秀英区"},
                  {"code": "460106", "name": "龙华区"},
                  {"code": "460107", "name": "琼山区"},
                  {"code": "460108", "name": "美兰区"}
                ];
                break;
              case "460200": // 三亚市
                city.children = [
                  {"code": "460202", "name": "海棠区"},
                  {"code": "460203", "name": "吉阳区"},
                  {"code": "460204", "name": "天涯区"},
                  {"code": "460205", "name": "崖州区"}
                ];
                break;
              case "460300": // 三沙市
                city.children = [
                  {"code": "460321", "name": "西沙群岛"},
                  {"code": "460322", "name": "南沙群岛"},
                  {"code": "460323", "name": "中沙群岛"}
                ];
                break;
              case "460400": // 儋州市
                city.children = [
                  {"code": "460400001", "name": "那大镇"},
                  {"code": "460400002", "name": "和庆镇"},
                  {"code": "460400003", "name": "南丰镇"},
                  {"code": "460400004", "name": "大成镇"},
                  {"code": "460400005", "name": "雅星镇"},
                  {"code": "460400006", "name": "兰洋镇"},
                  {"code": "460400007", "name": "光村镇"},
                  {"code": "460400008", "name": "木棠镇"},
                  {"code": "460400009", "name": "海头镇"},
                  {"code": "460400010", "name": "峨蔓镇"},
                  {"code": "460400011", "name": "三都镇"},
                  {"code": "460400012", "name": "王五镇"},
                  {"code": "460400013", "name": "白马井镇"},
                  {"code": "460400014", "name": "中和镇"},
                  {"code": "460400015", "name": "排浦镇"},
                  {"code": "460400016", "name": "东成镇"},
                  {"code": "460400017", "name": "新州镇"}
                ];
                break;
              default:
                // 其他市县添加基本行政区
                if (city.code.startsWith("4690")) {
                  city.children = [
                    {"code": city.code + "01", "name": city.name.replace("市", "") + "市区"}
                  ];
                }
                break;
            }
          }
        });
        break;

      case "520000": // 贵州省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "520100": // 贵阳市
                city.children = [
                  {"code": "520102", "name": "南明区"},
                  {"code": "520103", "name": "云岩区"},
                  {"code": "520111", "name": "花溪区"},
                  {"code": "520112", "name": "乌当区"},
                  {"code": "520113", "name": "白云区"},
                  {"code": "520115", "name": "观山湖区"},
                  {"code": "520121", "name": "开阳县"},
                  {"code": "520122", "name": "息烽县"},
                  {"code": "520123", "name": "修文县"},
                  {"code": "520181", "name": "清镇市"}
                ];
                break;
              case "520200": // 六盘水市
                city.children = [
                  {"code": "520201", "name": "钟山区"},
                  {"code": "520203", "name": "六枝特区"},
                  {"code": "520221", "name": "水城县"},
                  {"code": "520281", "name": "盘州市"}
                ];
                break;
              case "520300": // 遵义市
                city.children = [
                  {"code": "520302", "name": "红花岗区"},
                  {"code": "520303", "name": "汇川区"},
                  {"code": "520304", "name": "播州区"},
                  {"code": "520322", "name": "桐梓县"},
                  {"code": "520323", "name": "绥阳县"},
                  {"code": "520324", "name": "正安县"},
                  {"code": "520325", "name": "道真仡佬族苗族自治县"},
                  {"code": "520326", "name": "务川仡佬族苗族自治县"},
                  {"code": "520327", "name": "凤冈县"},
                  {"code": "520328", "name": "湄潭县"},
                  {"code": "520329", "name": "余庆县"},
                  {"code": "520330", "name": "习水县"},
                  {"code": "520381", "name": "赤水市"},
                  {"code": "520382", "name": "仁怀市"}
                ];
                break;
              case "520400": // 安顺市
                city.children = [
                  {"code": "520402", "name": "西秀区"},
                  {"code": "520421", "name": "平坝区"},
                  {"code": "520422", "name": "普定县"},
                  {"code": "520423", "name": "镇宁布依族苗族自治县"},
                  {"code": "520424", "name": "关岭布依族苗族自治县"},
                  {"code": "520425", "name": "紫云苗族布依族自治县"}
                ];
                break;
              case "520500": // 毕节市
                city.children = [
                  {"code": "520502", "name": "七星关区"},
                  {"code": "520521", "name": "大方县"},
                  {"code": "520522", "name": "黔西县"},
                  {"code": "520523", "name": "金沙县"},
                  {"code": "520524", "name": "织金县"},
                  {"code": "520525", "name": "纳雍县"},
                  {"code": "520526", "name": "威宁彝族回族苗族自治县"},
                  {"code": "520527", "name": "赫章县"}
                ];
                break;
              case "520600": // 铜仁市
                city.children = [
                  {"code": "520602", "name": "碧江区"},
                  {"code": "520603", "name": "万山区"},
                  {"code": "520621", "name": "江口县"},
                  {"code": "520622", "name": "玉屏侗族自治县"},
                  {"code": "520623", "name": "石阡县"},
                  {"code": "520624", "name": "思南县"},
                  {"code": "520625", "name": "印江土家族苗族自治县"},
                  {"code": "520626", "name": "德江县"},
                  {"code": "520627", "name": "沿河土家族自治县"},
                  {"code": "520628", "name": "松桃苗族自治县"}
                ];
                break;
              case "522300": // 黔西南布依族苗族自治州
                city.children = [
                  {"code": "522301", "name": "兴义市"},
                  {"code": "522322", "name": "兴仁县"},
                  {"code": "522323", "name": "普安县"},
                  {"code": "522324", "name": "晴隆县"},
                  {"code": "522325", "name": "贞丰县"},
                  {"code": "522326", "name": "望谟县"},
                  {"code": "522327", "name": "册亨县"},
                  {"code": "522328", "name": "安龙县"}
                ];
                break;
              case "522600": // 黔东南苗族侗族自治州
                city.children = [
                  {"code": "522601", "name": "凯里市"},
                  {"code": "522622", "name": "黄平县"},
                  {"code": "522623", "name": "施秉县"},
                  {"code": "522624", "name": "三穗县"},
                  {"code": "522625", "name": "镇远县"},
                  {"code": "522626", "name": "岑巩县"},
                  {"code": "522627", "name": "天柱县"},
                  {"code": "522628", "name": "锦屏县"},
                  {"code": "522629", "name": "剑河县"},
                  {"code": "522630", "name": "台江县"},
                  {"code": "522631", "name": "黎平县"},
                  {"code": "522632", "name": "榕江县"},
                  {"code": "522633", "name": "从江县"},
                  {"code": "522634", "name": "雷山县"},
                  {"code": "522635", "name": "麻江县"},
                  {"code": "522636", "name": "丹寨县"}
                ];
                break;
              case "522700": // 黔南布依族苗族自治州
                city.children = [
                  {"code": "522701", "name": "都匀市"},
                  {"code": "522702", "name": "福泉市"},
                  {"code": "522722", "name": "荔波县"},
                  {"code": "522723", "name": "贵定县"},
                  {"code": "522725", "name": "瓮安县"},
                  {"code": "522726", "name": "独山县"},
                  {"code": "522727", "name": "平塘县"},
                  {"code": "522728", "name": "罗甸县"},
                  {"code": "522729", "name": "长顺县"},
                  {"code": "522730", "name": "龙里县"},
                  {"code": "522731", "name": "惠水县"},
                  {"code": "522732", "name": "三都水族自治县"}
                ];
                break;
            }
          }
        });
        break;

      case "530000": // 云南省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "530100": // 昆明市
                city.children = [
                  {"code": "530102", "name": "五华区"},
                  {"code": "530103", "name": "盘龙区"},
                  {"code": "530111", "name": "官渡区"},
                  {"code": "530112", "name": "西山区"},
                  {"code": "530113", "name": "东川区"},
                  {"code": "530114", "name": "呈贡区"},
                  {"code": "530115", "name": "晋宁区"},
                  {"code": "530124", "name": "富民县"},
                  {"code": "530125", "name": "宜良县"},
                  {"code": "530126", "name": "石林彝族自治县"},
                  {"code": "530127", "name": "嵩明县"},
                  {"code": "530128", "name": "禄劝彝族苗族自治县"},
                  {"code": "530129", "name": "寻甸回族彝族自治县"},
                  {"code": "530181", "name": "安宁市"}
                ];
                break;
              case "530300": // 曲靖市
                city.children = [
                  {"code": "530302", "name": "麒麟区"},
                  {"code": "530303", "name": "沾益区"},
                  {"code": "530321", "name": "马龙县"},
                  {"code": "530322", "name": "陆良县"},
                  {"code": "530323", "name": "师宗县"},
                  {"code": "530324", "name": "罗平县"},
                  {"code": "530325", "name": "富源县"},
                  {"code": "530326", "name": "会泽县"},
                  {"code": "530381", "name": "宣威市"}
                ];
                break;
              case "530400": // 玉溪市
                city.children = [
                  {"code": "530402", "name": "红塔区"},
                  {"code": "530403", "name": "江川区"},
                  {"code": "530422", "name": "澄江县"},
                  {"code": "530423", "name": "通海县"},
                  {"code": "530424", "name": "华宁县"},
                  {"code": "530425", "name": "易门县"},
                  {"code": "530426", "name": "峨山彝族自治县"},
                  {"code": "530427", "name": "新平彝族傣族自治县"},
                  {"code": "530428", "name": "元江哈尼族彝族傣族自治县"}
                ];
                break;
              case "530500": // 保山市
                city.children = [
                  {"code": "530502", "name": "隆阳区"},
                  {"code": "530521", "name": "施甸县"},
                  {"code": "530523", "name": "龙陵县"},
                  {"code": "530524", "name": "昌宁县"},
                  {"code": "530581", "name": "腾冲市"}
                ];
                break;
              case "530600": // 昭通市
                city.children = [
                  {"code": "530602", "name": "昭阳区"},
                  {"code": "530621", "name": "鲁甸县"},
                  {"code": "530622", "name": "巧家县"},
                  {"code": "530623", "name": "盐津县"},
                  {"code": "530624", "name": "大关县"},
                  {"code": "530625", "name": "永善县"},
                  {"code": "530626", "name": "绥江县"},
                  {"code": "530627", "name": "镇雄县"},
                  {"code": "530628", "name": "彝良县"},
                  {"code": "530629", "name": "威信县"},
                  {"code": "530630", "name": "水富县"}
                ];
                break;
              case "530700": // 丽江市
                city.children = [
                  {"code": "530702", "name": "古城区"},
                  {"code": "530721", "name": "玉龙纳西族自治县"},
                  {"code": "530722", "name": "永胜县"},
                  {"code": "530723", "name": "华坪县"},
                  {"code": "530724", "name": "宁蒗彝族自治县"}
                ];
                break;
              case "530800": // 普洱市
                city.children = [
                  {"code": "530802", "name": "思茅区"},
                  {"code": "530821", "name": "宁洱哈尼族彝族自治县"},
                  {"code": "530822", "name": "墨江哈尼族自治县"},
                  {"code": "530823", "name": "景东彝族自治县"},
                  {"code": "530824", "name": "景谷傣族彝族自治县"},
                  {"code": "530825", "name": "镇沅彝族哈尼族拉祜族自治县"},
                  {"code": "530826", "name": "江城哈尼族彝族自治县"},
                  {"code": "530827", "name": "孟连傣族拉祜族佤族自治县"},
                  {"code": "530828", "name": "澜沧拉祜族自治县"},
                  {"code": "530829", "name": "西盟佤族自治县"}
                ];
                break;
              case "530900": // 临沧市
                city.children = [
                  {"code": "530902", "name": "临翔区"},
                  {"code": "530921", "name": "凤庆县"},
                  {"code": "530922", "name": "云县"},
                  {"code": "530923", "name": "永德县"},
                  {"code": "530924", "name": "镇康县"},
                  {"code": "530925", "name": "双江拉祜族佤族布朗族傣族自治县"},
                  {"code": "530926", "name": "耿马傣族佤族自治县"},
                  {"code": "530927", "name": "沧源佤族自治县"}
                ];
                break;
              case "532300": // 楚雄彝族自治州
                city.children = [
                  {"code": "532301", "name": "楚雄市"},
                  {"code": "532322", "name": "双柏县"},
                  {"code": "532323", "name": "牟定县"},
                  {"code": "532324", "name": "南华县"},
                  {"code": "532325", "name": "姚安县"},
                  {"code": "532326", "name": "大姚县"},
                  {"code": "532327", "name": "永仁县"},
                  {"code": "532328", "name": "元谋县"},
                  {"code": "532329", "name": "武定县"},
                  {"code": "532331", "name": "禄丰县"}
                ];
                break;
              case "532500": // 红河哈尼族彝族自治州
                city.children = [
                  {"code": "532501", "name": "个旧市"},
                  {"code": "532502", "name": "开远市"},
                  {"code": "532503", "name": "蒙自市"},
                  {"code": "532504", "name": "弥勒市"},
                  {"code": "532523", "name": "屏边苗族自治县"},
                  {"code": "532524", "name": "建水县"},
                  {"code": "532525", "name": "石屏县"},
                  {"code": "532527", "name": "泸西县"},
                  {"code": "532528", "name": "元阳县"},
                  {"code": "532529", "name": "红河县"},
                  {"code": "532530", "name": "金平苗族瑶族傣族自治县"},
                  {"code": "532531", "name": "绿春县"},
                  {"code": "532532", "name": "河口瑶族自治县"}
                ];
                break;
              case "532600": // 文山壮族苗族自治州
                city.children = [
                  {"code": "532601", "name": "文山市"},
                  {"code": "532622", "name": "砚山县"},
                  {"code": "532623", "name": "西畴县"},
                  {"code": "532624", "name": "麻栗坡县"},
                  {"code": "532625", "name": "马关县"},
                  {"code": "532626", "name": "丘北县"},
                  {"code": "532627", "name": "广南县"},
                  {"code": "532628", "name": "富宁县"}
                ];
                break;
              case "532800": // 西双版纳傣族自治州
                city.children = [
                  {"code": "532801", "name": "景洪市"},
                  {"code": "532822", "name": "勐海县"},
                  {"code": "532823", "name": "勐腊县"}
                ];
                break;
              case "532900": // 大理白族自治州
                city.children = [
                  {"code": "532901", "name": "大理市"},
                  {"code": "532922", "name": "漾濞彝族自治县"},
                  {"code": "532923", "name": "祥云县"},
                  {"code": "532924", "name": "宾川县"},
                  {"code": "532925", "name": "弥渡县"},
                  {"code": "532926", "name": "南涧彝族自治县"},
                  {"code": "532927", "name": "巍山彝族回族自治县"},
                  {"code": "532928", "name": "永平县"},
                  {"code": "532929", "name": "云龙县"},
                  {"code": "532930", "name": "洱源县"},
                  {"code": "532931", "name": "剑川县"},
                  {"code": "532932", "name": "鹤庆县"}
                ];
                break;
              case "533100": // 德宏傣族景颇族自治州
                city.children = [
                  {"code": "533102", "name": "瑞丽市"},
                  {"code": "533103", "name": "芒市"},
                  {"code": "533122", "name": "梁河县"},
                  {"code": "533123", "name": "盈江县"},
                  {"code": "533124", "name": "陇川县"}
                ];
                break;
              case "533300": // 怒江傈僳族自治州
                city.children = [
                  {"code": "533321", "name": "泸水县"},
                  {"code": "533323", "name": "福贡县"},
                  {"code": "533324", "name": "贡山独龙族怒族自治县"},
                  {"code": "533325", "name": "兰坪白族普米族自治县"}
                ];
                break;
              case "533400": // 迪庆藏族自治州
                city.children = [
                  {"code": "533401", "name": "香格里拉市"},
                  {"code": "533422", "name": "德钦县"},
                  {"code": "533423", "name": "维西傈僳族自治县"}
                ];
                break;
            }
          }
        });
        break;

      case "540000": // 西藏自治区 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "540100": // 拉萨市
                city.children = [
                  {"code": "540102", "name": "城关区"},
                  {"code": "540103", "name": "堆龙德庆区"},
                  {"code": "540104", "name": "达孜区"},
                  {"code": "540121", "name": "林周县"},
                  {"code": "540122", "name": "当雄县"},
                  {"code": "540123", "name": "尼木县"},
                  {"code": "540124", "name": "曲水县"},
                  {"code": "540127", "name": "墨竹工卡县"}
                ];
                break;
              case "540200": // 日喀则市
                city.children = [
                  {"code": "540202", "name": "桑珠孜区"},
                  {"code": "540221", "name": "南木林县"},
                  {"code": "540222", "name": "江孜县"},
                  {"code": "540223", "name": "定日县"},
                  {"code": "540224", "name": "萨迦县"},
                  {"code": "540225", "name": "拉孜县"},
                  {"code": "540226", "name": "昂仁县"},
                  {"code": "540227", "name": "谢通门县"},
                  {"code": "540228", "name": "白朗县"},
                  {"code": "540229", "name": "仁布县"},
                  {"code": "540230", "name": "康马县"},
                  {"code": "540231", "name": "定结县"},
                  {"code": "540232", "name": "仲巴县"},
                  {"code": "540233", "name": "亚东县"},
                  {"code": "540234", "name": "吉隆县"},
                  {"code": "540235", "name": "聂拉木县"},
                  {"code": "540236", "name": "萨嘎县"},
                  {"code": "540237", "name": "岗巴县"}
                ];
                break;
              case "540300": // 昌都市
                city.children = [
                  {"code": "540302", "name": "卡若区"},
                  {"code": "540321", "name": "江达县"},
                  {"code": "540322", "name": "贡觉县"},
                  {"code": "540323", "name": "类乌齐县"},
                  {"code": "540324", "name": "丁青县"},
                  {"code": "540325", "name": "察雅县"},
                  {"code": "540326", "name": "八宿县"},
                  {"code": "540327", "name": "左贡县"},
                  {"code": "540328", "name": "芒康县"},
                  {"code": "540329", "name": "洛隆县"},
                  {"code": "540330", "name": "边坝县"}
                ];
                break;
              case "540400": // 林芝市
                city.children = [
                  {"code": "540402", "name": "巴宜区"},
                  {"code": "540421", "name": "工布江达县"},
                  {"code": "540422", "name": "米林县"},
                  {"code": "540423", "name": "墨脱县"},
                  {"code": "540424", "name": "波密县"},
                  {"code": "540425", "name": "察隅县"},
                  {"code": "540426", "name": "朗县"}
                ];
                break;
              case "540500": // 山南市
                city.children = [
                  {"code": "540502", "name": "乃东区"},
                  {"code": "540521", "name": "扎囊县"},
                  {"code": "540522", "name": "贡嘎县"},
                  {"code": "540523", "name": "桑日县"},
                  {"code": "540524", "name": "琼结县"},
                  {"code": "540525", "name": "曲松县"},
                  {"code": "540526", "name": "措美县"},
                  {"code": "540527", "name": "洛扎县"},
                  {"code": "540528", "name": "加查县"},
                  {"code": "540529", "name": "隆子县"},
                  {"code": "540530", "name": "错那县"},
                  {"code": "540531", "name": "浪卡子县"}
                ];
                break;
              case "540600": // 那曲市
                city.children = [
                  {"code": "540602", "name": "色尼区"},
                  {"code": "540621", "name": "嘉黎县"},
                  {"code": "540622", "name": "比如县"},
                  {"code": "540623", "name": "聂荣县"},
                  {"code": "540624", "name": "安多县"},
                  {"code": "540625", "name": "申扎县"},
                  {"code": "540626", "name": "索县"},
                  {"code": "540627", "name": "班戈县"},
                  {"code": "540628", "name": "巴青县"},
                  {"code": "540629", "name": "尼玛县"},
                  {"code": "540630", "name": "双湖县"}
                ];
                break;
              case "542500": // 阿里地区
                city.children = [
                  {"code": "542521", "name": "普兰县"},
                  {"code": "542522", "name": "札达县"},
                  {"code": "542523", "name": "噶尔县"},
                  {"code": "542524", "name": "日土县"},
                  {"code": "542525", "name": "革吉县"},
                  {"code": "542526", "name": "改则县"},
                  {"code": "542527", "name": "措勤县"}
                ];
                break;
            }
          }
        });
        break;

      case "610000": // 陕西省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "610100": // 西安市
                city.children = [
                  {"code": "610102", "name": "新城区"},
                  {"code": "610103", "name": "碑林区"},
                  {"code": "610104", "name": "莲湖区"},
                  {"code": "610111", "name": "灞桥区"},
                  {"code": "610112", "name": "未央区"},
                  {"code": "610113", "name": "雁塔区"},
                  {"code": "610114", "name": "阎良区"},
                  {"code": "610115", "name": "临潼区"},
                  {"code": "610116", "name": "长安区"},
                  {"code": "610117", "name": "高陵区"},
                  {"code": "610118", "name": "鄠邑区"},
                  {"code": "610122", "name": "蓝田县"},
                  {"code": "610124", "name": "周至县"}
                ];
                break;
              case "610200": // 铜川市
                city.children = [
                  {"code": "610202", "name": "王益区"},
                  {"code": "610203", "name": "印台区"},
                  {"code": "610204", "name": "耀州区"},
                  {"code": "610222", "name": "宜君县"}
                ];
                break;
              case "610300": // 宝鸡市
                city.children = [
                  {"code": "610302", "name": "渭滨区"},
                  {"code": "610303", "name": "金台区"},
                  {"code": "610304", "name": "陈仓区"},
                  {"code": "610322", "name": "凤翔县"},
                  {"code": "610323", "name": "岐山县"},
                  {"code": "610324", "name": "扶风县"},
                  {"code": "610326", "name": "眉县"},
                  {"code": "610327", "name": "陇县"},
                  {"code": "610328", "name": "千阳县"},
                  {"code": "610329", "name": "麟游县"},
                  {"code": "610330", "name": "凤县"},
                  {"code": "610331", "name": "太白县"}
                ];
                break;
              case "610400": // 咸阳市
                city.children = [
                  {"code": "610402", "name": "秦都区"},
                  {"code": "610403", "name": "杨陵区"},
                  {"code": "610404", "name": "渭城区"},
                  {"code": "610422", "name": "三原县"},
                  {"code": "610423", "name": "泾阳县"},
                  {"code": "610424", "name": "乾县"},
                  {"code": "610425", "name": "礼泉县"},
                  {"code": "610426", "name": "永寿县"},
                  {"code": "610428", "name": "长武县"},
                  {"code": "610429", "name": "旬邑县"},
                  {"code": "610430", "name": "淳化县"},
                  {"code": "610431", "name": "武功县"},
                  {"code": "610481", "name": "兴平市"}
                ];
                break;
              case "610500": // 渭南市
                city.children = [
                  {"code": "610502", "name": "临渭区"},
                  {"code": "610503", "name": "华州区"},
                  {"code": "610522", "name": "潼关县"},
                  {"code": "610523", "name": "大荔县"},
                  {"code": "610524", "name": "合阳县"},
                  {"code": "610525", "name": "澄城县"},
                  {"code": "610526", "name": "蒲城县"},
                  {"code": "610527", "name": "白水县"},
                  {"code": "610528", "name": "富平县"},
                  {"code": "610581", "name": "韩城市"},
                  {"code": "610582", "name": "华阴市"}
                ];
                break;
              case "610600": // 延安市
                city.children = [
                  {"code": "610602", "name": "宝塔区"},
                  {"code": "610603", "name": "安塞区"},
                  {"code": "610621", "name": "延长县"},
                  {"code": "610622", "name": "延川县"},
                  {"code": "610623", "name": "子长县"},
                  {"code": "610624", "name": "志丹县"},
                  {"code": "610625", "name": "吴起县"},
                  {"code": "610626", "name": "甘泉县"},
                  {"code": "610627", "name": "富县"},
                  {"code": "610628", "name": "洛川县"},
                  {"code": "610629", "name": "宜川县"},
                  {"code": "610630", "name": "黄龙县"},
                  {"code": "610631", "name": "黄陵县"}
                ];
                break;
              case "610700": // 汉中市
                city.children = [
                  {"code": "610702", "name": "汉台区"},
                  {"code": "610703", "name": "南郑区"},
                  {"code": "610722", "name": "城固县"},
                  {"code": "610723", "name": "洋县"},
                  {"code": "610724", "name": "西乡县"},
                  {"code": "610725", "name": "勉县"},
                  {"code": "610726", "name": "宁强县"},
                  {"code": "610727", "name": "略阳县"},
                  {"code": "610728", "name": "镇巴县"},
                  {"code": "610729", "name": "留坝县"},
                  {"code": "610730", "name": "佛坪县"}
                ];
                break;
              case "610800": // 榆林市
                city.children = [
                  {"code": "610802", "name": "榆阳区"},
                  {"code": "610803", "name": "横山区"},
                  {"code": "610822", "name": "府谷县"},
                  {"code": "610824", "name": "靖边县"},
                  {"code": "610825", "name": "定边县"},
                  {"code": "610826", "name": "绥德县"},
                  {"code": "610827", "name": "米脂县"},
                  {"code": "610828", "name": "佳县"},
                  {"code": "610829", "name": "吴堡县"},
                  {"code": "610830", "name": "清涧县"},
                  {"code": "610831", "name": "子洲县"},
                  {"code": "610881", "name": "神木市"}
                ];
                break;
              case "610900": // 安康市
                city.children = [
                  {"code": "610902", "name": "汉滨区"},
                  {"code": "610921", "name": "汉阴县"},
                  {"code": "610922", "name": "石泉县"},
                  {"code": "610923", "name": "宁陕县"},
                  {"code": "610924", "name": "紫阳县"},
                  {"code": "610925", "name": "岚皋县"},
                  {"code": "610926", "name": "平利县"},
                  {"code": "610927", "name": "镇坪县"},
                  {"code": "610928", "name": "旬阳县"},
                  {"code": "610929", "name": "白河县"}
                ];
                break;
              case "611000": // 商洛市
                city.children = [
                  {"code": "611002", "name": "商州区"},
                  {"code": "611021", "name": "洛南县"},
                  {"code": "611022", "name": "丹凤县"},
                  {"code": "611023", "name": "商南县"},
                  {"code": "611024", "name": "山阳县"},
                  {"code": "611025", "name": "镇安县"},
                  {"code": "611026", "name": "柞水县"}
                ];
                break;
            }
          }
        });
        break;

      case "620000": // 甘肃省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "620100": // 兰州市
                city.children = [
                  {"code": "620102", "name": "城关区"},
                  {"code": "620103", "name": "七里河区"},
                  {"code": "620104", "name": "西固区"},
                  {"code": "620105", "name": "安宁区"},
                  {"code": "620111", "name": "红古区"},
                  {"code": "620121", "name": "永登县"},
                  {"code": "620122", "name": "皋兰县"},
                  {"code": "620123", "name": "榆中县"}
                ];
                break;
              case "620200": // 嘉峪关市
                city.children = [
                  {"code": "620201001", "name": "嘉峪关市区"}
                ];
                break;
              case "620300": // 金昌市
                city.children = [
                  {"code": "620302", "name": "金川区"},
                  {"code": "620321", "name": "永昌县"}
                ];
                break;
              case "620400": // 白银市
                city.children = [
                  {"code": "620402", "name": "白银区"},
                  {"code": "620403", "name": "平川区"},
                  {"code": "620421", "name": "靖远县"},
                  {"code": "620422", "name": "会宁县"},
                  {"code": "620423", "name": "景泰县"}
                ];
                break;
              case "620500": // 天水市
                city.children = [
                  {"code": "620502", "name": "秦州区"},
                  {"code": "620503", "name": "麦积区"},
                  {"code": "620521", "name": "清水县"},
                  {"code": "620522", "name": "秦安县"},
                  {"code": "620523", "name": "甘谷县"},
                  {"code": "620524", "name": "武山县"},
                  {"code": "620525", "name": "张家川回族自治县"}
                ];
                break;
              case "620600": // 武威市
                city.children = [
                  {"code": "620602", "name": "凉州区"},
                  {"code": "620621", "name": "民勤县"},
                  {"code": "620622", "name": "古浪县"},
                  {"code": "620623", "name": "天祝藏族自治县"}
                ];
                break;
              case "620700": // 张掖市
                city.children = [
                  {"code": "620702", "name": "甘州区"},
                  {"code": "620721", "name": "肃南裕固族自治县"},
                  {"code": "620722", "name": "民乐县"},
                  {"code": "620723", "name": "临泽县"},
                  {"code": "620724", "name": "高台县"},
                  {"code": "620725", "name": "山丹县"}
                ];
                break;
              case "620800": // 平凉市
                city.children = [
                  {"code": "620802", "name": "崆峒区"},
                  {"code": "620821", "name": "泾川县"},
                  {"code": "620822", "name": "灵台县"},
                  {"code": "620823", "name": "崇信县"},
                  {"code": "620824", "name": "华亭县"},
                  {"code": "620825", "name": "庄浪县"},
                  {"code": "620826", "name": "静宁县"}
                ];
                break;
              case "620900": // 酒泉市
                city.children = [
                  {"code": "620902", "name": "肃州区"},
                  {"code": "620921", "name": "金塔县"},
                  {"code": "620922", "name": "瓜州县"},
                  {"code": "620923", "name": "肃北蒙古族自治县"},
                  {"code": "620924", "name": "阿克塞哈萨克族自治县"},
                  {"code": "620981", "name": "玉门市"},
                  {"code": "620982", "name": "敦煌市"}
                ];
                break;
              case "621000": // 庆阳市
                city.children = [
                  {"code": "621002", "name": "西峰区"},
                  {"code": "621021", "name": "庆城县"},
                  {"code": "621022", "name": "环县"},
                  {"code": "621023", "name": "华池县"},
                  {"code": "621024", "name": "合水县"},
                  {"code": "621025", "name": "正宁县"},
                  {"code": "621026", "name": "宁县"},
                  {"code": "621027", "name": "镇原县"}
                ];
                break;
              case "621100": // 定西市
                city.children = [
                  {"code": "621102", "name": "安定区"},
                  {"code": "621121", "name": "通渭县"},
                  {"code": "621122", "name": "陇西县"},
                  {"code": "621123", "name": "渭源县"},
                  {"code": "621124", "name": "临洮县"},
                  {"code": "621125", "name": "漳县"},
                  {"code": "621126", "name": "岷县"}
                ];
                break;
              case "621200": // 陇南市
                city.children = [
                  {"code": "621202", "name": "武都区"},
                  {"code": "621221", "name": "成县"},
                  {"code": "621222", "name": "文县"},
                  {"code": "621223", "name": "宕昌县"},
                  {"code": "621224", "name": "康县"},
                  {"code": "621225", "name": "西和县"},
                  {"code": "621226", "name": "礼县"},
                  {"code": "621227", "name": "徽县"},
                  {"code": "621228", "name": "两当县"}
                ];
                break;
              case "622900": // 临夏回族自治州
                city.children = [
                  {"code": "622901", "name": "临夏市"},
                  {"code": "622921", "name": "临夏县"},
                  {"code": "622922", "name": "康乐县"},
                  {"code": "622923", "name": "永靖县"},
                  {"code": "622924", "name": "广河县"},
                  {"code": "622925", "name": "和政县"},
                  {"code": "622926", "name": "东乡族自治县"},
                  {"code": "622927", "name": "积石山保安族东乡族撒拉族自治县"}
                ];
                break;
              case "623000": // 甘南藏族自治州
                city.children = [
                  {"code": "623001", "name": "合作市"},
                  {"code": "623021", "name": "临潭县"},
                  {"code": "623022", "name": "卓尼县"},
                  {"code": "623023", "name": "舟曲县"},
                  {"code": "623024", "name": "迭部县"},
                  {"code": "623025", "name": "玛曲县"},
                  {"code": "623026", "name": "碌曲县"},
                  {"code": "623027", "name": "夏河县"}
                ];
                break;
            }
          }
        });
        break;

      case "630000": // 青海省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "630100": // 西宁市
                city.children = [
                  {"code": "630102", "name": "城东区"},
                  {"code": "630103", "name": "城中区"},
                  {"code": "630104", "name": "城西区"},
                  {"code": "630105", "name": "城北区"},
                  {"code": "630106", "name": "湟中区"},
                  {"code": "630121", "name": "大通回族土族自治县"},
                  {"code": "630123", "name": "湟源县"}
                ];
                break;
              case "630200": // 海东市
                city.children = [
                  {"code": "630202", "name": "乐都区"},
                  {"code": "630203", "name": "平安区"},
                  {"code": "630222", "name": "民和回族土族自治县"},
                  {"code": "630223", "name": "互助土族自治县"},
                  {"code": "630224", "name": "化隆回族自治县"},
                  {"code": "630225", "name": "循化撒拉族自治县"}
                ];
                break;
              case "632200": // 海北藏族自治州
                city.children = [
                  {"code": "632221", "name": "门源回族自治县"},
                  {"code": "632222", "name": "祁连县"},
                  {"code": "632223", "name": "海晏县"},
                  {"code": "632224", "name": "刚察县"}
                ];
                break;
              case "632300": // 黄南藏族自治州
                city.children = [
                  {"code": "632321", "name": "同仁县"},
                  {"code": "632322", "name": "尖扎县"},
                  {"code": "632323", "name": "泽库县"},
                  {"code": "632324", "name": "河南蒙古族自治县"}
                ];
                break;
              case "632500": // 海南藏族自治州
                city.children = [
                  {"code": "632521", "name": "共和县"},
                  {"code": "632522", "name": "同德县"},
                  {"code": "632523", "name": "贵德县"},
                  {"code": "632524", "name": "兴海县"},
                  {"code": "632525", "name": "贵南县"}
                ];
                break;
              case "632600": // 果洛藏族自治州
                city.children = [
                  {"code": "632621", "name": "玛沁县"},
                  {"code": "632622", "name": "班玛县"},
                  {"code": "632623", "name": "甘德县"},
                  {"code": "632624", "name": "达日县"},
                  {"code": "632625", "name": "久治县"},
                  {"code": "632626", "name": "玛多县"}
                ];
                break;
              case "632700": // 玉树藏族自治州
                city.children = [
                  {"code": "632701", "name": "玉树市"},
                  {"code": "632722", "name": "杂多县"},
                  {"code": "632723", "name": "称多县"},
                  {"code": "632724", "name": "治多县"},
                  {"code": "632725", "name": "囊谦县"},
                  {"code": "632726", "name": "曲麻莱县"}
                ];
                break;
              case "632800": // 海西蒙古族藏族自治州
                city.children = [
                  {"code": "632801", "name": "格尔木市"},
                  {"code": "632802", "name": "德令哈市"},
                  {"code": "632803", "name": "茫崖市"},
                  {"code": "632821", "name": "乌兰县"},
                  {"code": "632822", "name": "都兰县"},
                  {"code": "632823", "name": "天峻县"}
                ];
                break;
            }
          }
        });
        break;

      case "640000": // 宁夏回族自治区 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "640100": // 银川市
                city.children = [
                  {"code": "640104", "name": "兴庆区"},
                  {"code": "640105", "name": "西夏区"},
                  {"code": "640106", "name": "金凤区"},
                  {"code": "640121", "name": "永宁县"},
                  {"code": "640122", "name": "贺兰县"},
                  {"code": "640181", "name": "灵武市"}
                ];
                break;
              case "640200": // 石嘴山市
                city.children = [
                  {"code": "640202", "name": "大武口区"},
                  {"code": "640205", "name": "惠农区"},
                  {"code": "640221", "name": "平罗县"}
                ];
                break;
              case "640300": // 吴忠市
                city.children = [
                  {"code": "640302", "name": "利通区"},
                  {"code": "640303", "name": "红寺堡区"},
                  {"code": "640323", "name": "盐池县"},
                  {"code": "640324", "name": "同心县"},
                  {"code": "640381", "name": "青铜峡市"}
                ];
                break;
              case "640400": // 固原市
                city.children = [
                  {"code": "640402", "name": "原州区"},
                  {"code": "640422", "name": "西吉县"},
                  {"code": "640423", "name": "隆德县"},
                  {"code": "640424", "name": "泾源县"},
                  {"code": "640425", "name": "彭阳县"}
                ];
                break;
              case "640500": // 中卫市
                city.children = [
                  {"code": "640502", "name": "沙坡头区"},
                  {"code": "640521", "name": "中宁县"},
                  {"code": "640522", "name": "海原县"}
                ];
                break;
            }
          }
        });
        break;

      case "650000": // 新疆维吾尔自治区 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "650100": // 乌鲁木齐市
                city.children = [
                  {"code": "650102", "name": "天山区"},
                  {"code": "650103", "name": "沙依巴克区"},
                  {"code": "650104", "name": "新市区"},
                  {"code": "650105", "name": "水磨沟区"},
                  {"code": "650106", "name": "头屯河区"},
                  {"code": "650107", "name": "达坂城区"},
                  {"code": "650109", "name": "米东区"},
                  {"code": "650121", "name": "乌鲁木齐县"}
                ];
                break;
              case "650200": // 克拉玛依市
                city.children = [
                  {"code": "650202", "name": "独山子区"},
                  {"code": "650203", "name": "克拉玛依区"},
                  {"code": "650204", "name": "白碱滩区"},
                  {"code": "650205", "name": "乌尔禾区"}
                ];
                break;
              case "650400": // 吐鲁番市
                city.children = [
                  {"code": "650402", "name": "高昌区"},
                  {"code": "650421", "name": "鄯善县"},
                  {"code": "650422", "name": "托克逊县"}
                ];
                break;
              case "650500": // 哈密市
                city.children = [
                  {"code": "650502", "name": "伊州区"},
                  {"code": "650521", "name": "巴里坤哈萨克自治县"},
                  {"code": "650522", "name": "伊吾县"}
                ];
                break;
              case "652300": // 昌吉回族自治州
                city.children = [
                  {"code": "652301", "name": "昌吉市"},
                  {"code": "652302", "name": "阜康市"},
                  {"code": "652323", "name": "呼图壁县"},
                  {"code": "652324", "name": "玛纳斯县"},
                  {"code": "652325", "name": "奇台县"},
                  {"code": "652327", "name": "吉木萨尔县"},
                  {"code": "652328", "name": "木垒哈萨克自治县"}
                ];
                break;
              case "652700": // 博尔塔拉蒙古自治州
                city.children = [
                  {"code": "652701", "name": "博乐市"},
                  {"code": "652702", "name": "阿拉山口市"},
                  {"code": "652722", "name": "精河县"},
                  {"code": "652723", "name": "温泉县"}
                ];
                break;
              case "652800": // 巴音郭楞蒙古自治州
                city.children = [
                  {"code": "652801", "name": "库尔勒市"},
                  {"code": "652822", "name": "轮台县"},
                  {"code": "652823", "name": "尉犁县"},
                  {"code": "652824", "name": "若羌县"},
                  {"code": "652825", "name": "且末县"},
                  {"code": "652826", "name": "焉耆回族自治县"},
                  {"code": "652827", "name": "和静县"},
                  {"code": "652828", "name": "和硕县"},
                  {"code": "652829", "name": "博湖县"}
                ];
                break;
              case "652900": // 阿克苏地区
                city.children = [
                  {"code": "652901", "name": "阿克苏市"},
                  {"code": "652902", "name": "库车市"},
                  {"code": "652922", "name": "温宿县"},
                  {"code": "652924", "name": "沙雅县"},
                  {"code": "652925", "name": "新和县"},
                  {"code": "652926", "name": "拜城县"},
                  {"code": "652927", "name": "乌什县"},
                  {"code": "652928", "name": "阿瓦提县"},
                  {"code": "652929", "name": "柯坪县"}
                ];
                break;
              case "653000": // 克孜勒苏柯尔克孜自治州
                city.children = [
                  {"code": "653001", "name": "阿图什市"},
                  {"code": "653022", "name": "阿克陶县"},
                  {"code": "653023", "name": "阿合奇县"},
                  {"code": "653024", "name": "乌恰县"}
                ];
                break;
              case "653100": // 喀什地区
                city.children = [
                  {"code": "653101", "name": "喀什市"},
                  {"code": "653121", "name": "疏附县"},
                  {"code": "653122", "name": "疏勒县"},
                  {"code": "653123", "name": "英吉沙县"},
                  {"code": "653124", "name": "泽普县"},
                  {"code": "653125", "name": "莎车县"},
                  {"code": "653126", "name": "叶城县"},
                  {"code": "653127", "name": "麦盖提县"},
                  {"code": "653128", "name": "岳普湖县"},
                  {"code": "653129", "name": "伽师县"},
                  {"code": "653130", "name": "巴楚县"},
                  {"code": "653131", "name": "塔什库尔干塔吉克自治县"}
                ];
                break;
              case "653200": // 和田地区
                city.children = [
                  {"code": "653201", "name": "和田市"},
                  {"code": "653221", "name": "和田县"},
                  {"code": "653222", "name": "墨玉县"},
                  {"code": "653223", "name": "皮山县"},
                  {"code": "653224", "name": "洛浦县"},
                  {"code": "653225", "name": "策勒县"},
                  {"code": "653226", "name": "于田县"},
                  {"code": "653227", "name": "民丰县"}
                ];
                break;
              case "654000": // 伊犁哈萨克自治州
                city.children = [
                  {"code": "654002", "name": "伊宁市"},
                  {"code": "654003", "name": "奎屯市"},
                  {"code": "654004", "name": "霍尔果斯市"},
                  {"code": "654021", "name": "伊宁县"},
                  {"code": "654022", "name": "察布查尔锡伯自治县"},
                  {"code": "654023", "name": "霍城县"},
                  {"code": "654024", "name": "巩留县"},
                  {"code": "654025", "name": "新源县"},
                  {"code": "654026", "name": "昭苏县"},
                  {"code": "654027", "name": "特克斯县"},
                  {"code": "654028", "name": "尼勒克县"}
                ];
                break;
              case "654200": // 塔城地区
                city.children = [
                  {"code": "654201", "name": "塔城市"},
                  {"code": "654202", "name": "乌苏市"},
                  {"code": "654221", "name": "额敏县"},
                  {"code": "654223", "name": "沙湾县"},
                  {"code": "654224", "name": "托里县"},
                  {"code": "654225", "name": "裕民县"},
                  {"code": "654226", "name": "和布克赛尔蒙古自治县"}
                ];
                break;
              case "654300": // 阿勒泰地区
                city.children = [
                  {"code": "654301", "name": "阿勒泰市"},
                  {"code": "654321", "name": "布尔津县"},
                  {"code": "654322", "name": "富蕴县"},
                  {"code": "654323", "name": "福海县"},
                  {"code": "654324", "name": "哈巴河县"},
                  {"code": "654325", "name": "青河县"},
                  {"code": "654326", "name": "吉木乃县"}
                ];
                break;
            }
          }
        });
        break;

      case "710000": // 台湾省 - 添加区县数据
        province.children.forEach(city => {
          if (!city.children || city.children.length === 0) {
            switch(city.code) {
              case "710100": // 台北市
                city.children = [
                  {"code": "710101", "name": "中正区"},
                  {"code": "710102", "name": "大同区"},
                  {"code": "710103", "name": "中山区"},
                  {"code": "710104", "name": "松山区"},
                  {"code": "710105", "name": "大安区"},
                  {"code": "710106", "name": "万华区"},
                  {"code": "710107", "name": "信义区"},
                  {"code": "710108", "name": "士林区"},
                  {"code": "710109", "name": "北投区"},
                  {"code": "710110", "name": "内湖区"},
                  {"code": "710111", "name": "南港区"},
                  {"code": "710112", "name": "文山区"}
                ];
                break;
              case "710200": // 高雄市
                city.children = [
                  {"code": "710201", "name": "新兴区"},
                  {"code": "710202", "name": "前金区"},
                  {"code": "710203", "name": "苓雅区"},
                  {"code": "710204", "name": "盐埕区"},
                  {"code": "710205", "name": "鼓山区"},
                  {"code": "710206", "name": "旗津区"},
                  {"code": "710207", "name": "前镇区"},
                  {"code": "710208", "name": "三民区"},
                  {"code": "710209", "name": "左营区"},
                  {"code": "710210", "name": "楠梓区"},
                  {"code": "710211", "name": "小港区"}
                ];
                break;
              case "710300": // 台南市
                city.children = [
                  {"code": "710301", "name": "中西区"},
                  {"code": "710302", "name": "东区"},
                  {"code": "710303", "name": "南区"},
                  {"code": "710304", "name": "北区"},
                  {"code": "710305", "name": "安平区"},
                  {"code": "710306", "name": "安南区"}
                ];
                break;
              case "710400": // 台中市
                city.children = [
                  {"code": "710401", "name": "中区"},
                  {"code": "710402", "name": "东区"},
                  {"code": "710403", "name": "南区"},
                  {"code": "710404", "name": "西区"},
                  {"code": "710405", "name": "北区"},
                  {"code": "710406", "name": "北屯区"},
                  {"code": "710407", "name": "西屯区"},
                  {"code": "710408", "name": "南屯区"}
                ];
                break;
              case "710500": // 新北市
                city.children = [
                  {"code": "710501", "name": "万里区"},
                  {"code": "710502", "name": "金山区"},
                  {"code": "710503", "name": "板桥区"},
                  {"code": "710504", "name": "汐止区"},
                  {"code": "710505", "name": "深坑区"},
                  {"code": "710506", "name": "石碇区"},
                  {"code": "710507", "name": "瑞芳区"},
                  {"code": "710508", "name": "平溪区"},
                  {"code": "710509", "name": "双溪区"},
                  {"code": "710510", "name": "贡寮区"}
                ];
                break;
              case "710600": // 桃园市
                city.children = [
                  {"code": "710601", "name": "中坜区"},
                  {"code": "710602", "name": "平镇区"},
                  {"code": "710603", "name": "龙潭区"},
                  {"code": "710604", "name": "杨梅区"},
                  {"code": "710605", "name": "新屋区"},
                  {"code": "710606", "name": "观音区"},
                  {"code": "710607", "name": "桃园区"},
                  {"code": "710608", "name": "龟山区"},
                  {"code": "710609", "name": "八德区"},
                  {"code": "710610", "name": "大溪区"},
                  {"code": "710611", "name": "复兴区"},
                  {"code": "710612", "name": "大园区"}
                ];
                break;
            }
          }
        });
        break;
    }
  });

  // 保存更新后的数据
  fs.writeFileSync(regionsFile, JSON.stringify(regionsData, null, 2), 'utf8');
  console.log('所有省份区县数据补充完成！');
}

addCompleteDistrictData();