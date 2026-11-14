import type {
  AllowedDistrict,
  DistrictValue,
  ParsedStop,
  RawOrderItem,
  RouteGroup,
  RouteParseResult,
  SortMode,
} from './types.ts';

export const ALLOWED_DISTRICTS: AllowedDistrict[] = ['羅東鎮', '冬山鄉', '五結鄉'];
export const MAX_STOPS_PER_GROUP = 8;

export interface YilanRoadEntry {
  name: string;
  districts: AllowedDistrict[];
  corridor: string;
  lat: number;
  lng: number;
}

// Comprehensive Yilan 3-District (羅東鎮 / 冬山鄉 / 五結鄉) road directory with geographic corridor coordinates
export const YILAN_ROAD_DB: YilanRoadEntry[] = [
  // ================= 羅東鎮 =================
  { name: '公正路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6775, lng: 121.7685 },
  { name: '公正街', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6768, lng: 121.7712 },
  { name: '興東路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6765, lng: 121.7698 },
  { name: '中正路', districts: ['羅東鎮', '五結鄉'], corridor: '羅東・中正夜市軸線', lat: 24.6762, lng: 121.7715 },
  { name: '中正北路', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6825, lng: 121.7702 },
  { name: '中正南路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6688, lng: 121.7718 },
  { name: '民權路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6761, lng: 121.7678 },
  { name: '民生路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6752, lng: 121.7705 },
  { name: '中華路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6755, lng: 121.7655 },
  { name: '公園路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6756, lng: 121.7690 },
  { name: '中山路', districts: ['羅東鎮', '冬山鄉'], corridor: '羅東・中山東西軸線', lat: 24.6740, lng: 121.7710 },
  { name: '中山路一段', districts: ['羅東鎮'], corridor: '羅東・中山東段', lat: 24.6732, lng: 121.7845 },
  { name: '中山路二段', districts: ['羅東鎮'], corridor: '羅東・中山東段', lat: 24.6736, lng: 121.7765 },
  { name: '中山路三段', districts: ['羅東鎮'], corridor: '羅東・中山東西軸線', lat: 24.6741, lng: 121.7690 },
  { name: '中山路四段', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6746, lng: 121.7610 },
  { name: '純精路', districts: ['羅東鎮'], corridor: '羅東・純精環線', lat: 24.6748, lng: 121.7625 },
  { name: '純精路一段', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6685, lng: 121.7652 },
  { name: '純精路二段', districts: ['羅東鎮'], corridor: '羅東・純精環線', lat: 24.6752, lng: 121.7625 },
  { name: '純精路三段', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6835, lng: 121.7648 },
  { name: '倉前路', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6805, lng: 121.7722 },
  { name: '林森路', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6812, lng: 121.7685 },
  { name: '復興路', districts: ['羅東鎮', '五結鄉'], corridor: '羅東・竹林北側', lat: 24.6838, lng: 121.7675 },
  { name: '復興路一段', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6820, lng: 121.7678 },
  { name: '復興路二段', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6845, lng: 121.7595 },
  { name: '復興路三段', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6865, lng: 121.7510 },
  { name: '北成路', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6788, lng: 121.7545 },
  { name: '北成路一段', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6788, lng: 121.7580 },
  { name: '北成路二段', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6795, lng: 121.7510 },
  { name: '北投街', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6792, lng: 121.7558 },
  { name: '敬業路', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6778, lng: 121.7575 },
  { name: '國華街', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6805, lng: 121.7582 },
  { name: '國華路', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6805, lng: 121.7582 },
  { name: '四育路', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6770, lng: 121.7560 },
  { name: '尚禮街', districts: ['羅東鎮'], corridor: '羅東・北成西側', lat: 24.6762, lng: 121.7585 },
  { name: '培英路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6710, lng: 121.7630 },
  { name: '維揚路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6712, lng: 121.7662 },
  { name: '南門路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6725, lng: 121.7692 },
  { name: '南昌街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6718, lng: 121.7715 },
  { name: '博愛路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6710, lng: 121.7712 },
  { name: '樹人路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6695, lng: 121.7702 },
  { name: '愛國路', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6682, lng: 121.7688 },
  { name: '成功街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6675, lng: 121.7675 },
  { name: '和平路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6748, lng: 121.7732 },
  { name: '站前路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6775, lng: 121.7745 },
  { name: '站前北路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6795, lng: 121.7748 },
  { name: '站前南路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6748, lng: 121.7752 },
  { name: '站東路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6765, lng: 121.7770 },
  { name: '傳藝路三段', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6792, lng: 121.7785 },
  { name: '光榮路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6758, lng: 121.7805 },
  { name: '光榮北路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6815, lng: 121.7795 },
  { name: '陽明路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6752, lng: 121.7775 },
  { name: '陽明北路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6798, lng: 121.7768 },
  { name: '陽明南路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6712, lng: 121.7780 },
  { name: '東安街', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6742, lng: 121.7820 },
  { name: '月眉路', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6705, lng: 121.7885 },
  { name: '富農路', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6662, lng: 121.7845 },
  { name: '富農路一段', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6635, lng: 121.7865 },
  { name: '富農路二段', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6665, lng: 121.7840 },
  { name: '富農路三段', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6695, lng: 121.7810 },
  { name: '河濱路', districts: ['羅東鎮'], corridor: '羅東・東郊月眉線', lat: 24.6755, lng: 121.7920 },
  { name: '竹林街', districts: ['羅東鎮'], corridor: '羅東・竹林北側', lat: 24.6852, lng: 121.7715 },
  { name: '天祥路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6780, lng: 121.7662 },
  { name: '天津路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6785, lng: 121.7705 },
  { name: '長春路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6772, lng: 121.7670 },
  { name: '大新街', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6772, lng: 121.7735 },
  { name: '大同路', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6788, lng: 121.7728 },
  { name: '建國街', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6738, lng: 121.7675 },
  { name: '漢民街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6702, lng: 121.7658 },
  { name: '光華街', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6735, lng: 121.7760 },
  { name: '信義路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6768, lng: 121.7720 },
  { name: '忠孝路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6745, lng: 121.7685 },
  { name: '仁愛路', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6738, lng: 121.7705 },
  { name: '學府街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6690, lng: 121.7640 },
  { name: '新興街', districts: ['羅東鎮'], corridor: '羅東・公正商圈', lat: 24.6758, lng: 121.7645 },
  { name: '精純路', districts: ['羅東鎮'], corridor: '羅東・純精環線', lat: 24.6748, lng: 121.7625 },
  { name: '保建街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6705, lng: 121.7672 },
  { name: '建中街', districts: ['羅東鎮'], corridor: '羅東・南門軸線', lat: 24.6680, lng: 121.7700 },
  { name: '仁德街', districts: ['羅東鎮'], corridor: '羅東・車站東區', lat: 24.6730, lng: 121.7785 },

  // ================= 冬山鄉 =================
  { name: '清溝路', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6625, lng: 121.7665 },
  { name: '清溝一路', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6618, lng: 121.7658 },
  { name: '清溝二路', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6612, lng: 121.7652 },
  { name: '群英路', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6645, lng: 121.7720 },
  { name: '群英一街', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6640, lng: 121.7715 },
  { name: '義成路', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6550, lng: 121.7660 },
  { name: '義成路一段', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6435, lng: 121.7645 },
  { name: '義成路二段', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6510, lng: 121.7655 },
  { name: '義成路三段', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6620, lng: 121.7648 },
  { name: '冬山路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6365, lng: 121.7920 },
  { name: '冬山路一段', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6335, lng: 121.7955 },
  { name: '冬山路二段', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6425, lng: 121.7875 },
  { name: '冬山路三段', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6565, lng: 121.7785 },
  { name: '冬山路五段', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6645, lng: 121.7735 },
  { name: '廣興路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6685, lng: 121.7515 },
  { name: '梅花路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6585, lng: 121.7445 },
  { name: '鹿得路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6545, lng: 121.7525 },
  { name: '鹿得一路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6552, lng: 121.7535 },
  { name: '鹿得二路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6548, lng: 121.7545 },
  { name: '鹿得三路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6540, lng: 121.7555 },
  { name: '柯林路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6745, lng: 121.7395 },
  { name: '柯林一路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6752, lng: 121.7410 },
  { name: '柯林二路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6748, lng: 121.7425 },
  { name: '大進路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6425, lng: 121.7245 },
  { name: '順安路', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6542, lng: 121.7685 },
  { name: '永興路', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6518, lng: 121.7698 },
  { name: '永興路一段', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6495, lng: 121.7710 },
  { name: '永興路二段', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6610, lng: 121.7688 },
  { name: '永美路', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6558, lng: 121.7735 },
  { name: '富農路一段', districts: ['冬山鄉', '羅東鎮'], corridor: '冬山・武淵珍珠東線', lat: 24.6565, lng: 121.7875 },
  { name: '珍珠一路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6485, lng: 121.7895 },
  { name: '珍珠二路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6495, lng: 121.7905 },
  { name: '富堵一路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6525, lng: 121.7955 },
  { name: '富堵二路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6530, lng: 121.7965 },
  { name: '武淵路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6575, lng: 121.8015 },
  { name: '武淵一路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6580, lng: 121.8025 },
  { name: '武淵二路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6570, lng: 121.8035 },
  { name: '補城路', districts: ['冬山鄉'], corridor: '冬山・武淵珍珠東線', lat: 24.6445, lng: 121.8055 },
  { name: '成興路', districts: ['冬山鄉', '五結鄉'], corridor: '冬山・冬山老街主線', lat: 24.6405, lng: 121.8095 },
  { name: '南盟路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6345, lng: 121.7895 },
  { name: '南興路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6358, lng: 121.7925 },
  { name: '中正路', districts: ['冬山鄉', '羅東鎮', '五結鄉'], corridor: '冬山・冬山老街主線', lat: 24.6360, lng: 121.7915 },
  { name: '中華路', districts: ['冬山鄉', '羅東鎮'], corridor: '冬山・冬山老街主線', lat: 24.6368, lng: 121.7905 },
  { name: '照安路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6320, lng: 121.7865 },
  { name: '太和路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6295, lng: 121.7845 },
  { name: '香和路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6275, lng: 121.7985 },
  { name: '香中路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6285, lng: 121.7965 },
  { name: '香南路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6255, lng: 121.7975 },
  { name: '龍祥一路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6235, lng: 121.8155 },
  { name: '八仙路', districts: ['冬山鄉'], corridor: '冬山・義成順安軸線', lat: 24.6445, lng: 121.7755 },
  { name: '安農北路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6710, lng: 121.7455 },
  { name: '安農一路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6695, lng: 121.7465 },
  { name: '安農七路', districts: ['冬山鄉'], corridor: '冬山・廣興梅花西線', lat: 24.6675, lng: 121.7505 },
  { name: '永清路', districts: ['冬山鄉'], corridor: '冬山・清溝群英北線', lat: 24.6615, lng: 121.7675 },
  { name: '建國路', districts: ['冬山鄉'], corridor: '冬山・冬山老街主線', lat: 24.6352, lng: 121.7940 },

  // ================= 五結鄉 =================
  { name: '五結路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6845, lng: 121.7985 },
  { name: '五結路一段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6835, lng: 121.8155 },
  { name: '五結路二段', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6845, lng: 121.7985 },
  { name: '五結路三段', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6840, lng: 121.7845 },
  { name: '五結中路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6852, lng: 121.7965 },
  { name: '五結中路一段', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6848, lng: 121.8015 },
  { name: '五結中路二段', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6852, lng: 121.7965 },
  { name: '五結中路三段', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6858, lng: 121.7875 },
  { name: '國民路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6865, lng: 121.7975 },
  { name: '國民中路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6875, lng: 121.7985 },
  { name: '國民南路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6815, lng: 121.7975 },
  { name: '國民北路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6905, lng: 121.7980 },
  { name: '中正路一段', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6915, lng: 121.7735 },
  { name: '中正路二段', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6995, lng: 121.7745 },
  { name: '中正路三段', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.7065, lng: 121.7755 },
  { name: '學進路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6985, lng: 121.7765 },
  { name: '二結路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.7015, lng: 121.7785 },
  { name: '舊街路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.7025, lng: 121.7745 },
  { name: '四結路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6935, lng: 121.7765 },
  { name: '復興中路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6955, lng: 121.7785 },
  { name: '復興一路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6945, lng: 121.7815 },
  { name: '復興二路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6940, lng: 121.7835 },
  { name: '鎮安路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.7035, lng: 121.7825 },
  { name: '西河路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6965, lng: 121.7885 },
  { name: '西河一路', districts: ['五結鄉'], corridor: '五結・二結學進西線', lat: 24.6970, lng: 121.7895 },
  { name: '協和路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6910, lng: 121.7925 },
  { name: '協和中路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6915, lng: 121.7935 },
  { name: '傳藝路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6820, lng: 121.8125 },
  { name: '傳藝路一段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6845, lng: 121.8215 },
  { name: '傳藝路二段', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6815, lng: 121.7995 },
  { name: '親河路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6745, lng: 121.8145 },
  { name: '親河路一段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6715, lng: 121.8225 },
  { name: '親河路二段', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6755, lng: 121.8055 },
  { name: '五濱路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6825, lng: 121.8295 },
  { name: '五濱路一段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6725, lng: 121.8325 },
  { name: '五濱路二段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6895, lng: 121.8275 },
  { name: '利澤路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6665, lng: 121.8235 },
  { name: '利澤東路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6655, lng: 121.8265 },
  { name: '利澤西路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6675, lng: 121.8195 },
  { name: '利成路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6635, lng: 121.8165 },
  { name: '利成路一段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6620, lng: 121.8150 },
  { name: '利成路二段', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6655, lng: 121.8175 },
  { name: '利工一路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6595, lng: 121.8315 },
  { name: '利工二路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6575, lng: 121.8325 },
  { name: '孝威路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6895, lng: 121.8115 },
  { name: '孝威一路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6915, lng: 121.8125 },
  { name: '孝威南路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6875, lng: 121.8120 },
  { name: '大吉路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6925, lng: 121.7975 },
  { name: '大吉一路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6935, lng: 121.7985 },
  { name: '大吉二路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6945, lng: 121.7995 },
  { name: '大吉五路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6955, lng: 121.8005 },
  { name: '三吉路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6955, lng: 121.7955 },
  { name: '三吉一路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6960, lng: 121.7965 },
  { name: '三吉二路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6965, lng: 121.7975 },
  { name: '錦眾路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.7025, lng: 121.8125 },
  { name: '季水路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6785, lng: 121.8255 },
  { name: '福興路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6815, lng: 121.7895 },
  { name: '新店路', districts: ['五結鄉'], corridor: '五結・五結市區主線', lat: 24.6885, lng: 121.8055 },
  { name: '公園一路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6765, lng: 121.8155 },
  { name: '公園二路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6775, lng: 121.8165 },
  { name: '公園三路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6785, lng: 121.8175 },
  { name: '大眾路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6965, lng: 121.8225 },
  { name: '清水路', districts: ['五結鄉'], corridor: '五結・利澤傳藝東線', lat: 24.6720, lng: 121.8280 },
];

// Deterministic high-confidence OCR garble / homophone auto-corrections
export const OCR_ROAD_CORRECTIONS: Record<string, string> = {
  '清溝綠濲': '清溝路',
  '清溝綠': '清溝路',
  '清溝露': '清溝路',
  '清勾路': '清溝路',
  '青溝路': '清溝路',
  '清購路': '清溝路',
  '清沟路': '清溝路',
  '清沟绿濲': '清溝路',
  '公政路': '公正路',
  '公証路': '公正路',
  '公正露': '公正路',
  '純青路': '純精路',
  '純清路': '純精路',
  '醇精路': '純精路',
  '纯精路': '純精路',
  '冬三路': '冬山路',
  '東山路': '冬山路',
  '冬山露': '冬山路',
  '五潔路': '五結路',
  '五節路': '五結路',
  '午結路': '五結路',
  '五结路': '五結路',
  '五结中路': '五結中路',
  '興東露': '興東路',
  '興冬路': '興東路',
  '兴东路': '興東路',
  '義城路': '義成路',
  '易成路': '義成路',
  '議成路': '義成路',
  '义成路': '義成路',
  '維楊路': '維揚路',
  '為揚路': '維揚路',
  '维扬路': '維揚路',
  '林生路': '林森路',
  '林深路': '林森路',
  '親合路': '親河路',
  '清河路': '親河路',
  '亲河路': '親河路',
  '傳義路': '傳藝路',
  '船藝路': '傳藝路',
  '传艺路': '傳藝路',
  '鹿德路': '鹿得路',
  '路得路': '鹿得路',
  '永星路': '永興路',
  '永兴路': '永興路',
  '廣星路': '廣興路',
  '广兴路': '廣興路',
  '補成路': '補城路',
  '振安路': '鎮安路',
  '珍安路': '鎮安路',
  '光融路': '光榮路',
  '光荣路': '光榮路',
  '北城路': '北成路',
  '國花路': '國華路',
  '国华路': '國華路',
  '尚理街': '尚禮街',
  '四育露': '四育路',
  '倉前露': '倉前路',
  '仓前路': '倉前路',
  '月梅路': '月眉路',
  '富濃路': '富農路',
  '富农路': '富農路',
  '武元路': '武淵路',
  '太合路': '太和路',
  '香合路': '香和路',
  '羅東鎮中正路': '中正路',
  '学进路': '學進路',
  '利泽路': '利澤路',
  '利泽东路': '利澤東路',
  '利泽西路': '利澤西路',
  '中正北露': '中正北路',
  '中正南露': '中正南路',
  '中华路': '中華路',
  '复兴路': '復興路',
  '长青路': '長春路',
  '长春路': '長春路',
  '阳明路': '陽明路',
  '开元路': '羅東',
  '群英露': '群英路',
};

// Homophone/visual-blur suspects that MUST trigger ⚠️ [請確認路名] with candidate suggestion
export const UNCERTAIN_ROAD_SUGGESTIONS: Record<string, { suggested: string; districtHint?: AllowedDistrict }> = {
  '南望路': { suggested: '南盟路', districtHint: '冬山鄉' },
  '南宜路': { suggested: '南盟路', districtHint: '冬山鄉' },
  '南亭路': { suggested: '南盟路', districtHint: '冬山鄉' },
  '南明路': { suggested: '南盟路', districtHint: '冬山鄉' },
  '南門露': { suggested: '南門路', districtHint: '羅東鎮' },
  '清溝': { suggested: '清溝路', districtHint: '冬山鄉' },
};

const OTHER_YILAN_TOWNS = [
  '宜蘭市', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '三星鄉', '大同鄉', '南澳鄉', '蘇澳鎮',
];

const SIMPLIFIED_CHAR_REGEX = /[东罗结广兴义维传艺学镇国华阳长仓补泽顺圣爱丰万]/;

function toHalfWidthDigits(str: string): string {
  return str.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

function chineseNumToArabic(str: string): string {
  const map: Record<string, number> = {
    零: 0, 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
  };
  if (/^\d+$/.test(str)) return str;
  if (str === '十') return '10';
  if (str.length === 2 && str.startsWith('十') && map[str[1]] !== undefined) {
    return String(10 + map[str[1]]);
  }
  if (str.length === 2 && str.endsWith('十') && map[str[0]] !== undefined) {
    return String(map[str[0]] * 10);
  }
  if (str.length === 3 && str[1] === '十' && map[str[0]] !== undefined && map[str[2]] !== undefined) {
    return String(map[str[0]] * 10 + map[str[2]]);
  }
  if (str.length === 1 && map[str] !== undefined) {
    return String(map[str]);
  }
  return str;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function extractFloorInfo(input: string, rawFloor?: string): { cleanAddr: string; floorDisplay: string; floorNum: number | null } {
  let text = toHalfWidthDigits(input).trim();
  let floorNum: number | null = null;
  let extraFloorSuffix = '';

  // Check explicit rawFloor first
  const combinedFloorCheck = rawFloor ? toHalfWidthDigits(rawFloor).trim() : '';
  const floorPatterns = [
    /[(\[（【]?\s*(?:B|b)(\d+)\s*[)\]）】]?/i,
    /[(\[（【]?\s*([一二三四五六七八九十兩\d]+)\s*(?:樓|F|f)(?:之(\d+))?\s*[)\]）】]?/,
  ];

  if (combinedFloorCheck) {
    const bMatch = combinedFloorCheck.match(/^(?:B|b)?(\d+)$/);
    if (combinedFloorCheck.toUpperCase().startsWith('B') && bMatch) {
      floorNum = -parseInt(bMatch[1], 10);
    } else {
      const m = combinedFloorCheck.match(/([一二三四五六七八九十兩\d]+)\s*(?:樓|F|f)?(?:之(\d+))?/);
      if (m) {
        floorNum = parseInt(chineseNumToArabic(m[1]), 10);
        if (m[2]) extraFloorSuffix = `之${m[2]}`;
      }
    }
  }

  // Extract and strip floor tokens from address string
  text = text.replace(/[(\[（【]?\s*([一二三四五六七八九十兩\d]+)\s*(?:樓|F|f)(?:之(\d+))?\s*[)\]）】]?/gi, (_, numStr, sub) => {
    const parsed = parseInt(chineseNumToArabic(numStr), 10);
    if (!Number.isNaN(parsed) && floorNum === null) {
      floorNum = parsed;
      if (sub) extraFloorSuffix = `之${sub}`;
    }
    return '';
  });

  text = text.replace(/[(\[（【]?\s*(?:地下)?(?:B|b)(\d+)\s*(?:樓)?\s*[)\]）】]?/gi, (_, numStr) => {
    if (floorNum === null) {
      floorNum = -parseInt(numStr, 10);
    }
    return '';
  });

  // Rule 7: Floor formatted as (X樓); 1樓 is omitted!
  let floorDisplay = '';
  if (floorNum !== null) {
    if (floorNum === 1 && !extraFloorSuffix) {
      floorDisplay = '';
    } else if (floorNum < 0) {
      floorDisplay = `(B${Math.abs(floorNum)}樓)`;
    } else {
      floorDisplay = `(${floorNum}樓${extraFloorSuffix})`;
    }
  }

  return { cleanAddr: text.trim(), floorDisplay, floorNum };
}

function stripNoiseAndAdminPrefix(rawAddr: string, rawDistrict?: string): {
  detectedDistrict: DistrictValue | null;
  isExplicitOutsideDistrict: boolean;
  strippedCore: string;
} {
  let addr = toHalfWidthDigits(rawAddr)
    .replace(/\s+/g, '')
    .replace(/^台灣(?:省)?/, '')
    .replace(/^\d{3,6}/, '')
    .replace(/^宜蘭縣/, '');

  let detectedDistrict: DistrictValue | null = null;
  let isExplicitOutsideDistrict = false;

  // Detect explicit township in address or rawDistrict
  const allDistricts = [...ALLOWED_DISTRICTS, ...OTHER_YILAN_TOWNS];
  for (const dist of allDistricts) {
    if (addr.includes(dist)) {
      detectedDistrict = dist;
      addr = addr.replace(dist, '');
      if (!ALLOWED_DISTRICTS.includes(dist as AllowedDistrict)) {
        isExplicitOutsideDistrict = true;
      }
      break;
    }
  }

  if (!detectedDistrict && rawDistrict) {
    const cleanRawDist = rawDistrict.replace(/^宜蘭縣/, '').trim();
    for (const dist of allDistricts) {
      if (cleanRawDist.includes(dist)) {
        detectedDistrict = dist;
        if (!ALLOWED_DISTRICTS.includes(dist as AllowedDistrict)) {
          isExplicitOutsideDistrict = true;
        }
        break;
      }
    }
  }

  // Strip village/neighborhood prefixes (XX村 or XX里, e.g. 清溝村, 北成里, 二結村)
  // Carefully avoid stripping road names ending in 村/里 if followed by 路/街, so only match before road/lane/number
  addr = addr.replace(/^[\u4e00-\u9fa5]{2,3}[村里](?=[\u4e00-\u9fa5]{1,6}(?:路|街|大道|巷|\d))/, '');
  // Strip neighbor/lin markers like 12鄰
  addr = addr.replace(/^\d+鄰/, '');

  // Strip trailing parenthetical notes / delivery remarks (e.g., (放門口), (警衛室), [備註...], #123)
  addr = addr
    .replace(/[（(][^）)]*(?:門口|警衛|管理室|電聯|勿擾|放|收|備註|聯絡|敲門|按鈴|電話|櫃台|大廳|門口)[^）)]*[）)]/g, '')
    .replace(/[【\[][^】\]]*[】\]]/g, '')
    .replace(/[,，;；].*$/, '')
    .replace(/(?:備註|請電聯|放門口|警衛室代收).*$/, '');

  // Normalize "之" / "-" in street numbers e.g. 11-2號 -> 11之2號, or keep standard
  addr = addr.replace(/(\d+)-(\d+)號/g, '$1之$2號');

  return {
    detectedDistrict,
    isExplicitOutsideDistrict,
    strippedCore: addr.trim(),
  };
}

function matchAndVerifyRoad(
  coreAddr: string,
  detectedDistrict: DistrictValue | null,
  isExplicitOutsideDistrict: boolean
): {
  correctedCore: string;
  roadName: string;
  matchedEntry: YilanRoadEntry | null;
  confirmedDistrict: DistrictValue;
  isDistrictConfirmed: boolean;
  isOutOfRange: boolean;
  isRoadUncertain: boolean;
  roadSuggestion?: string;
  ocrCorrectionApplied?: string;
} {
  let workingAddr = coreAddr;
  let ocrCorrectionApplied: string | undefined;

  // Step 1: Apply deterministic OCR homophone / garble corrections (longest key first)
  const correctionKeys = Object.keys(OCR_ROAD_CORRECTIONS).sort((a, b) => b.length - a.length);
  for (const wrongKey of correctionKeys) {
    if (workingAddr.includes(wrongKey)) {
      const fixedRoad = OCR_ROAD_CORRECTIONS[wrongKey];
      workingAddr = workingAddr.replace(wrongKey, fixedRoad);
      ocrCorrectionApplied = `${wrongKey} → ${fixedRoad}`;
      break;
    }
  }

  // Extract road + optional section from workingAddr (e.g., 清溝路, 純精路二段, 公園一路, 尚禮街)
  const roadMatch = workingAddr.match(/^([\u4e00-\u9fa5]{2,7}(?:大道|路|街)(?:[一二三四五六七八九十\d]+段)?)/);
  let extractedRoad = roadMatch ? roadMatch[1] : '';

  // Special check for cases like "清溝綠濲297巷" if missed or "清溝297巷" without 路
  if (!extractedRoad) {
    const partialMatch = workingAddr.match(/^([\u4e00-\u9fa5]{2,5})(?=\d+(?:巷|弄|號))/);
    if (partialMatch) {
      extractedRoad = partialMatch[1];
    }
  }

  // Step 2: Check uncertain homophone suspects (e.g., 南望路 / 南宜路 / 南亭路)
  let isRoadUncertain = false;
  let roadSuggestion: string | undefined;
  let districtHintFromSuspect: AllowedDistrict | undefined;

  if (extractedRoad && UNCERTAIN_ROAD_SUGGESTIONS[extractedRoad]) {
    isRoadUncertain = true;
    roadSuggestion = UNCERTAIN_ROAD_SUGGESTIONS[extractedRoad].suggested;
    districtHintFromSuspect = UNCERTAIN_ROAD_SUGGESTIONS[extractedRoad].districtHint;
  } else {
    // Also check base road without section in UNCERTAIN_ROAD_SUGGESTIONS
    const baseRoad = extractedRoad.replace(/[一二三四五六七八九十\d]+段$/, '');
    if (baseRoad && UNCERTAIN_ROAD_SUGGESTIONS[baseRoad]) {
      isRoadUncertain = true;
      roadSuggestion = UNCERTAIN_ROAD_SUGGESTIONS[baseRoad].suggested;
      districtHintFromSuspect = UNCERTAIN_ROAD_SUGGESTIONS[baseRoad].districtHint;
    }
  }

  // Step 3: Match against YILAN_ROAD_DB (prefer exact match with section, then base road match)
  let matchedEntry: YilanRoadEntry | null = null;
  if (extractedRoad && !isExplicitOutsideDistrict) {
    const exactMatches = YILAN_ROAD_DB.filter((r) => r.name === extractedRoad);
    if (exactMatches.length > 0) {
      if (detectedDistrict && ALLOWED_DISTRICTS.includes(detectedDistrict as AllowedDistrict)) {
        matchedEntry = exactMatches.find((r) => r.districts.includes(detectedDistrict as AllowedDistrict)) || exactMatches[0];
      } else {
        matchedEntry = exactMatches[0];
      }
    } else {
      // Try base road without 段
      const baseRoad = extractedRoad.replace(/[一二三四五六七八九十\d]+段$/, '');
      const baseMatches = YILAN_ROAD_DB.filter((r) => r.name === baseRoad || r.name.replace(/[一二三四五六七八九十\d]+段$/, '') === baseRoad);
      if (baseMatches.length > 0) {
        if (detectedDistrict && ALLOWED_DISTRICTS.includes(detectedDistrict as AllowedDistrict)) {
          matchedEntry = baseMatches.find((r) => r.districts.includes(detectedDistrict as AllowedDistrict)) || baseMatches[0];
        } else {
          matchedEntry = baseMatches[0];
        }
      }
    }
  }

  // Step 4: If road not found in YILAN_ROAD_DB and not explicitly outside district, check fuzzy similarity & simplified chars
  if (!matchedEntry && extractedRoad && !isExplicitOutsideDistrict) {
    isRoadUncertain = true;
    if (!roadSuggestion) {
      // Find closest Levenshtein match in YILAN_ROAD_DB
      let bestDist = Infinity;
      let bestCandidate: YilanRoadEntry | null = null;
      for (const entry of YILAN_ROAD_DB) {
        const d = levenshtein(extractedRoad, entry.name);
        if (d < bestDist) {
          bestDist = d;
          bestCandidate = entry;
        }
      }
      if (bestCandidate && bestDist <= 2) {
        roadSuggestion = bestCandidate.name;
        if (!detectedDistrict) {
          districtHintFromSuspect = bestCandidate.districts[0];
        }
      }
    }
  }

  if (SIMPLIFIED_CHAR_REGEX.test(extractedRoad)) {
    isRoadUncertain = true;
  }

  // Step 5: Determine confirmed district and 3-district validation
  let confirmedDistrict: DistrictValue = '無法判定';
  let isDistrictConfirmed = false;
  let isOutOfRange = false;

  if (isExplicitOutsideDistrict && detectedDistrict) {
    confirmedDistrict = detectedDistrict;
    isDistrictConfirmed = true;
    isOutOfRange = true;
  } else if (detectedDistrict && ALLOWED_DISTRICTS.includes(detectedDistrict as AllowedDistrict)) {
    confirmedDistrict = detectedDistrict;
    isDistrictConfirmed = true;
    isOutOfRange = false;
  } else if (matchedEntry) {
    if (matchedEntry.districts.length === 1) {
      confirmedDistrict = matchedEntry.districts[0];
      isDistrictConfirmed = true;
      isOutOfRange = false;
    } else {
      // Ambiguous road across multiple allowed districts (e.g. 中正路 without township)
      confirmedDistrict = matchedEntry.districts[0];
      isDistrictConfirmed = false;
      isOutOfRange = false;
    }
  } else if (districtHintFromSuspect) {
    confirmedDistrict = districtHintFromSuspect;
    isDistrictConfirmed = false;
    isOutOfRange = false;
  } else {
    confirmedDistrict = '無法判定';
    isDistrictConfirmed = false;
    isOutOfRange = true; // Rule 5: 若確定不屬於此三區或無法判定，標註 ⚠️ [超出範圍/需確認]
  }

  return {
    correctedCore: workingAddr,
    roadName: extractedRoad || workingAddr,
    matchedEntry,
    confirmedDistrict,
    isDistrictConfirmed,
    isOutOfRange,
    isRoadUncertain,
    roadSuggestion,
    ocrCorrectionApplied,
  };
}

function buildSingleNavUrl(navQueryAddress: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navQueryAddress)}`;
}

function buildMultiStopNavUrl(navAddresses: string[]): string {
  if (navAddresses.length === 0) return '';
  if (navAddresses.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(navAddresses[0])}`;
  }
  const destination = navAddresses[navAddresses.length - 1];
  const waypoints = navAddresses.slice(0, -1).map((addr) => encodeURIComponent(addr)).join('%7C');
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&waypoints=${waypoints}&destination=${encodeURIComponent(destination)}`;
}

function extractAddressSortNumbers(addr: string): [number, number, number, number] {
  const secMatch = addr.match(/([一二三四五六七八九十\d]+)段/);
  const laneMatch = addr.match(/(\d+)巷/);
  const alleyMatch = addr.match(/(\d+)弄/);
  const numMatch = addr.match(/(\d+)(?:之\d+)?號/);

  const sec = secMatch ? parseInt(chineseNumToArabic(secMatch[1]), 10) || 0 : 0;
  const lane = laneMatch ? parseInt(laneMatch[1], 10) || 0 : 0;
  const alley = alleyMatch ? parseInt(alleyMatch[1], 10) || 0 : 0;
  const num = numMatch ? parseInt(numMatch[1], 10) || 0 : 0;

  return [sec, lane, alley, num];
}

interface IntermediateStop {
  id: string;
  firstSourceIndex: number;
  recipientName: string;
  orderCount: number;
  district: DistrictValue;
  isDistrictConfirmed: boolean;
  isOutOfRange: boolean;
  roadName: string;
  matchedEntry: YilanRoadEntry | null;
  isRoadUncertain: boolean;
  roadSuggestion?: string;
  ocrCorrectionApplied?: string;
  floorDisplay: string;
  displayAddress: string;
  navQueryAddress: string;
  singleNavUrl: string;
  warnings: string[];
  sourceOrders: RawOrderItem[];
  corridorName: string;
  lat: number;
  lng: number;
  mergeKey: string;
}

function geoClusterOrder(stops: IntermediateStop[]): IntermediateStop[] {
  if (stops.length <= 1) return stops;

  // Group by corridor first so main-road & alley stops stay cohesive
  const corridorBuckets = new Map<string, IntermediateStop[]>();
  for (const stop of stops) {
    const bucket = corridorBuckets.get(stop.corridorName) || [];
    bucket.push(stop);
    corridorBuckets.set(stop.corridorName, bucket);
  }

  // Sort stops within each corridor by roadName -> section -> lane -> alley -> houseNumber
  for (const [, bucket] of corridorBuckets.entries()) {
    bucket.sort((a, b) => {
      const roadCmp = a.roadName.localeCompare(b.roadName, 'zh-Hant');
      if (roadCmp !== 0) return roadCmp;
      const [sa, la, aa, na] = extractAddressSortNumbers(a.displayAddress);
      const [sb, lb, ab, nb] = extractAddressSortNumbers(b.displayAddress);
      if (sa !== sb) return sa - sb;
      if (na !== nb) return na - nb;
      if (la !== lb) return la - lb;
      if (aa !== ab) return aa - ab;
      return a.firstSourceIndex - b.firstSourceIndex;
    });
  }

  // Order corridors via Nearest-Neighbor TSP starting from the earliest appearance or Luodong center
  const corridors = Array.from(corridorBuckets.entries()).map(([name, items]) => {
    const avgLat = items.reduce((s, x) => s + x.lat, 0) / items.length;
    const avgLng = items.reduce((s, x) => s + x.lng, 0) / items.length;
    return { name, items, lat: avgLat, lng: avgLng };
  });

  // Start from the corridor of the first stop (or out-of-range last)
  const normalCorridors = corridors.filter((c) => !c.items[0].isOutOfRange);
  const outCorridors = corridors.filter((c) => c.items[0].isOutOfRange);

  const ordered: IntermediateStop[] = [];
  if (normalCorridors.length > 0) {
    const remaining = [...normalCorridors];
    let current = remaining.shift()!;
    ordered.push(...current.items);

    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const dLat = remaining[i].lat - current.lat;
        const dLng = remaining[i].lng - current.lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      current = remaining.splice(bestIdx, 1)[0];
      ordered.push(...current.items);
    }
  }

  for (const oc of outCorridors) {
    ordered.push(...oc.items);
  }

  return ordered;
}

export function processDeliveryOrders(rawOrders: RawOrderItem[], sortMode: SortMode = 'geo_cluster'): RouteParseResult {
  let totalOrders = 0;
  const mergedMap = new Map<string, IntermediateStop>();

  rawOrders.forEach((raw, idx) => {
    const count = raw.orderCount && raw.orderCount > 0 ? raw.orderCount : 1;
    totalOrders += count;

    const cleanName = raw.recipientName.replace(/\+\d+$/, '').trim() || '未具名收件人';

    // 1. Clean floor & admin prefixes
    const { cleanAddr, floorDisplay } = extractFloorInfo(raw.rawAddress, raw.rawFloor);
    const { detectedDistrict, isExplicitOutsideDistrict, strippedCore } = stripNoiseAndAdminPrefix(
      cleanAddr,
      raw.rawDistrict
    );

    // 2. Verify Yilan road & 3-district validation
    const verification = matchAndVerifyRoad(strippedCore, detectedDistrict, isExplicitOutsideDistrict);

    if (raw.ocrConfidence === 'low' && !verification.isRoadUncertain) {
      verification.isRoadUncertain = true;
    }

    // 3. Build clean display address (NO 宜蘭縣, NO 鄉鎮村里) + floor (1樓 omitted)
    const displayAddress = `${verification.correctedCore}${floorDisplay}`;

    // 4. Build sanitized Nav query address (WITH confirmed district, NO floor/notes)
    let navQueryAddress = verification.correctedCore;
    if (verification.isOutOfRange && verification.confirmedDistrict !== '無法判定') {
      navQueryAddress = `宜蘭縣${verification.confirmedDistrict}${verification.correctedCore}`;
    } else if (verification.confirmedDistrict !== '無法判定') {
      navQueryAddress = `${verification.confirmedDistrict}${verification.correctedCore}`;
    } else {
      navQueryAddress = `宜蘭縣${verification.correctedCore}`;
    }

    const warnings: string[] = [];
    if (verification.isRoadUncertain) {
      warnings.push('⚠️ [請確認路名]');
    }
    if (verification.isOutOfRange) {
      warnings.push('⚠️ [超出範圍/需確認]');
    }

    // 5. Global Duplicate Merging key: normalized district + road/number + floorDisplay
    // Same address (including same floor) merges globally regardless of order!
    const normCoreKey = toHalfWidthDigits(verification.correctedCore)
      .replace(/\s+/g, '')
      .replace(/之(\d+)號/g, '-$1號');
    const mergeKey = `${verification.confirmedDistrict}::${normCoreKey}::${floorDisplay}`;

    const existing = mergedMap.get(mergeKey);
    if (existing) {
      existing.orderCount += count;
      existing.sourceOrders.push({ ...raw, sourceIndex: raw.sourceIndex ?? idx });
      // Prefer higher-confidence or longer name if existing was generic
      if (existing.recipientName === '未具名收件人' && cleanName !== '未具名收件人') {
        existing.recipientName = cleanName;
      }
      // Merge warnings uniquely
      for (const w of warnings) {
        if (!existing.warnings.includes(w)) existing.warnings.push(w);
      }
    } else {
      const corridorName = verification.matchedEntry
        ? verification.matchedEntry.corridor
        : verification.isOutOfRange
          ? '範圍外／待確認區'
          : `${verification.confirmedDistrict}・一般路段`;

      const lat = verification.matchedEntry
        ? verification.matchedEntry.lat
        : verification.confirmedDistrict === '羅東鎮'
          ? 24.676
          : verification.confirmedDistrict === '冬山鄉'
            ? 24.648
            : verification.confirmedDistrict === '五結鄉'
              ? 24.685
              : 24.75;
      const lng = verification.matchedEntry
        ? verification.matchedEntry.lng
        : verification.confirmedDistrict === '羅東鎮'
          ? 121.770
          : verification.confirmedDistrict === '冬山鄉'
            ? 121.778
            : verification.confirmedDistrict === '五結鄉'
              ? 121.800
              : 121.75;

      mergedMap.set(mergeKey, {
        id: `stop-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        firstSourceIndex: raw.sourceIndex ?? idx,
        recipientName: cleanName,
        orderCount: count,
        district: verification.confirmedDistrict,
        isDistrictConfirmed: verification.isDistrictConfirmed,
        isOutOfRange: verification.isOutOfRange,
        roadName: verification.roadName,
        matchedEntry: verification.matchedEntry,
        isRoadUncertain: verification.isRoadUncertain,
        roadSuggestion: verification.roadSuggestion,
        ocrCorrectionApplied: verification.ocrCorrectionApplied,
        floorDisplay,
        displayAddress,
        navQueryAddress,
        singleNavUrl: buildSingleNavUrl(navQueryAddress),
        warnings,
        sourceOrders: [{ ...raw, sourceIndex: raw.sourceIndex ?? idx }],
        corridorName,
        lat,
        lng,
        mergeKey,
      });
    }
  });

  // 6. Ordering: Geographic micro-clustering vs strict original order
  let orderedStops = Array.from(mergedMap.values());
  if (sortMode === 'geo_cluster') {
    orderedStops = geoClusterOrder(orderedStops);
  } else {
    orderedStops.sort((a, b) => a.firstSourceIndex - b.firstSourceIndex);
  }

  // 7. Continuous numbering across groups (max 8 stops per group)
  const groups: RouteGroup[] = [];
  const totalGroups = orderedStops.length === 0 ? 0 : Math.ceil(orderedStops.length / MAX_STOPS_PER_GROUP);

  for (let g = 0; g < totalGroups; g++) {
    const slice = orderedStops.slice(g * MAX_STOPS_PER_GROUP, (g + 1) * MAX_STOPS_PER_GROUP);
    const groupNumber = g + 1;

    const parsedStops: ParsedStop[] = slice.map((item, idxInGroup) => {
      const sequenceNumber = g * MAX_STOPS_PER_GROUP + idxInGroup + 1;
      const displayNameWithCount =
        item.orderCount > 1 ? `${item.recipientName}+${item.orderCount}` : item.recipientName;

      return {
        id: item.id,
        sequenceNumber,
        groupIndex: groupNumber,
        recipientName: item.recipientName,
        orderCount: item.orderCount,
        displayNameWithCount,
        district: item.district,
        isDistrictConfirmed: item.isDistrictConfirmed,
        isOutOfRange: item.isOutOfRange,
        roadName: item.roadName,
        isRoadUncertain: item.isRoadUncertain,
        roadSuggestion: item.roadSuggestion,
        ocrCorrectionApplied: item.ocrCorrectionApplied,
        floorDisplay: item.floorDisplay,
        displayAddress: item.displayAddress,
        navQueryAddress: item.navQueryAddress,
        singleNavUrl: item.singleNavUrl,
        warnings: item.warnings,
        sourceOrders: item.sourceOrders,
        corridorName: item.corridorName,
      };
    });

    const uniqueDistricts = Array.from(new Set(parsedStops.map((s) => s.district)));
    const multiStopNavUrl = buildMultiStopNavUrl(parsedStops.map((s) => s.navQueryAddress));

    groups.push({
      groupNumber,
      stops: parsedStops,
      multiStopNavUrl,
      districtSummary: uniqueDistricts.join(' · '),
    });
  }

  const uniqueStops = orderedStops.length;
  const warningCount = orderedStops.filter((s) => s.warnings.length > 0).length;
  const mergedDuplicateCount = totalOrders - uniqueStops;

  // 8. Build formatted Markdown and Plain Text outputs adhering strictly to Rules 1, 6, 8, 9
  const mdLines: string[] = [];
  const txtLines: string[] = [];

  const headerLine = `總共 ${totalOrders} 筆｜不重複 ${uniqueStops} 筆｜共 ${totalGroups} 組`;
  mdLines.push(`**${headerLine}**`, '');
  txtLines.push(headerLine, '');

  for (const group of groups) {
    const startSeq = group.stops[0]?.sequenceNumber ?? 1;
    const endSeq = group.stops[group.stops.length - 1]?.sequenceNumber ?? 1;
    mdLines.push(`### 第 ${group.groupNumber} 組（#${startSeq}–#${endSeq} · ${group.districtSummary}）`);
    txtLines.push(`【第 ${group.groupNumber} 組（#${startSeq}–#${endSeq} · ${group.districtSummary}）】`);

    for (const stop of group.stops) {
      const warnSuffix = stop.warnings.length > 0 ? ` ${stop.warnings.join(' ')}` : '';
      mdLines.push(`${stop.sequenceNumber}. ${stop.displayNameWithCount}：[${stop.displayAddress}](${stop.singleNavUrl})${warnSuffix}`);
      txtLines.push(`${stop.sequenceNumber}. ${stop.displayNameWithCount}：${stop.displayAddress}${warnSuffix}`);
      txtLines.push(`   導航：${stop.singleNavUrl}`);
    }

    mdLines.push('', `> [開啟第 ${group.groupNumber} 組多點連貫導航（共 ${group.stops.length} 站）](${group.multiStopNavUrl})`, '');
    txtLines.push(`第 ${group.groupNumber} 組多點導航：${group.multiStopNavUrl}`, '');
  }

  return {
    stats: {
      totalOrders,
      uniqueStops,
      totalGroups,
      warningCount,
      mergedDuplicateCount,
    },
    sortMode,
    groups,
    formattedMarkdown: mdLines.join('\n').trim(),
    formattedPlainText: txtLines.join('\n').trim(),
  };
}

// Parse pasted text lines into RawOrderItem[] (supports formats like "姓名：地址", "1. 姓名+3 地址", "姓名, 地址", etc.)
export function parseRawTextToOrders(text: string): { orders: RawOrderItem[]; detectedDisableGeoCluster: boolean } {
  const detectedDisableGeoCluster = /取消地理微聚類|照影片|原始順序|不要聚類|照順序/.test(text);

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^(取消地理微聚類|請照|總共|第\s*\d+\s*組)/.test(l));

  const orders: RawOrderItem[] = [];
  lines.forEach((line, idx) => {
    // Strip leading index like "1. " or "1、" or "(1) "
    const cleaned = line.replace(/^(?:\d+[.、)）]\s*|\(\d+\)\s*)/, '').trim();
    if (!cleaned) return;

    // Try split on colon, tab, pipe, comma, or whitespace before Yilan address
    let recipientName = '未具名收件人';
    let rawAddress = cleaned;

    const sepMatch = cleaned.match(/^([^:：\t|]+?)[:：\t|]\s*(.+)$/);
    if (sepMatch) {
      recipientName = sepMatch[1].trim();
      rawAddress = sepMatch[2].trim();
    } else {
      const spaceMatch = cleaned.match(/^([\u4e00-\u9fa5A-Za-z0-9_+]+)\s+((?:宜蘭|羅東|冬山|五結|清溝|公正|純精|南|中正|中山|興東|義成|廣興|復興|親河|傳藝|利澤|二結|國民|維揚|竹林|富農).+)$/);
      if (spaceMatch) {
        recipientName = spaceMatch[1].trim();
        rawAddress = spaceMatch[2].trim();
      }
    }

    // Check if recipientName carries explicit +N (e.g. 張璇珠+3) or xN
    let orderCount = 1;
    const countMatch = recipientName.match(/^(.+?)\s*[+×xX*](\d+)$/);
    if (countMatch) {
      recipientName = countMatch[1].trim();
      orderCount = Math.max(1, parseInt(countMatch[2], 10));
    } else {
      // Also check trailing +N / xN / (N筆) at the end of rawAddress
      const addrCountMatch = rawAddress.match(/^(.*?)\s*(?:[+×xX*](\d+)|[（(](\d+)\s*筆[）)])$/);
      if (addrCountMatch) {
        rawAddress = addrCountMatch[1].trim();
        const n = parseInt(addrCountMatch[2] || addrCountMatch[3], 10);
        if (!Number.isNaN(n) && n > 0) {
          orderCount = n;
        }
      }
    }

    orders.push({
      id: `txt-${idx}-${Date.now()}`,
      sourceIndex: idx,
      sourceLabel: `文字清單 #${idx + 1}`,
      recipientName,
      rawAddress,
      orderCount,
    });
  });

  return { orders, detectedDisableGeoCluster };
}
