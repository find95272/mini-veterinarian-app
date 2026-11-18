import { Cat, Dog, Rabbit, Bird, Fish, Bug, PawPrint } from 'lucide-react';

export interface SpeciesCategory {
  value: string;
  icon: typeof Cat;
  breeds: string[];
}

export const SPECIES_CATEGORIES: SpeciesCategory[] = [
  {
    value: '猫',
    icon: Cat,
    breeds: [
      '中华田园猫', '暹罗猫', '英国短毛猫', '美国短毛猫', '布偶猫',
      '波斯猫', '缅因猫', '挪威森林猫', '苏格兰折耳猫', '加菲猫',
      '斯芬克斯猫', '孟加拉猫', '俄罗斯蓝猫', '阿比西尼亚猫', '伯曼猫',
      '土耳其梵猫', '索马里猫', '埃及猫', '新加坡猫', '东方短毛猫',
      '沙特尔猫', '德文卷毛猫', '柯尼斯卷毛猫', '缅甸猫', '东京猫',
    ],
  },
  {
    value: '狗',
    icon: Dog,
    breeds: [
      '中华田园犬', '拉布拉多', '金毛寻回犬', '德国牧羊犬', '哈士奇',
      '阿拉斯加雪橇犬', '萨摩耶', '柯基', '柴犬', '边境牧羊犬',
      '贵宾犬', '比熊犬', '雪纳瑞', '博美犬', '吉娃娃',
      '法国斗牛犬', '英国斗牛犬', '巴哥犬', '松狮犬', '藏獒',
      '杜宾犬', '罗威纳犬', '大丹犬', '阿富汗猎犬', '灵缇',
      '约克夏梗', '西高地白梗', '苏格兰梗', '万能梗', '北京犬',
      '马尔济斯犬', '蝴蝶犬', '查理王小猎犬', '腊肠犬', '比格犬',
    ],
  },
  {
    value: '兔子',
    icon: Rabbit,
    breeds: [
      '荷兰垂耳兔', '荷兰侏儒兔', '安哥拉兔', '狮子兔', '迷你雷克斯兔',
      '新西兰白兔', '加州兔', '道奇兔', '巨型花兔', '英国安哥拉兔',
      '法国安哥拉兔', '缎毛兔', '银狐兔', '香槟兔', '比利时野兔',
    ],
  },
  {
    value: '鸟',
    icon: Bird,
    breeds: [
      '虎皮鹦鹉', '玄凤鹦鹉', '牡丹鹦鹉', '金太阳鹦鹉', '灰鹦鹉',
      '金刚鹦鹉', '葵花凤头鹦鹉', '亚马逊鹦鹉', '文鸟', '十姐妹',
      '金丝雀', '玉鸟', '珍珠鸟', '七彩文鸟', '斑胸草雀',
      '画眉', '黄雀', '百灵', '八哥', '鹩哥',
    ],
  },
  {
    value: '鱼',
    icon: Fish,
    breeds: [
      '金鱼', '锦鲤', '斗鱼', '孔雀鱼', '玛丽鱼',
      '神仙鱼', '龙鱼', '罗汉鱼', '地图鱼', '鹦鹉鱼',
      '虎鱼', '七彩神仙鱼', '灯科鱼', '斑马鱼', '接吻鱼',
    ],
  },
  {
    value: '仓鼠',
    icon: Bug,
    breeds: [
      '叙利亚仓鼠', '加卡利亚仓鼠', '坎贝尔仓鼠', '罗伯罗夫斯基仓鼠', '中国仓鼠',
    ],
  },
  {
    value: '乌龟',
    icon: PawPrint,
    breeds: [
      '巴西龟', '草龟', '花龟', '陆龟', '鳄龟',
      '金钱龟', '黄缘闭壳龟', '剃刀龟', '麝香龟', '地图龟',
    ],
  },
  {
    value: '蜥蜴',
    icon: PawPrint,
    breeds: [
      '鬃狮蜥', '豹纹守宫', '蓝舌石龙子', '绿鬣蜥', '王者蜥',
      '鬣蜥', '变色龙', '睫角守宫', '肥尾守宫', '日行守宫',
    ],
  },
  {
    value: '其他',
    icon: PawPrint,
    breeds: ['其他'],
  },
];

export function speciesIcon(species: string): typeof Cat {
  const found = SPECIES_CATEGORIES.find((s) => s.value === species);
  return found ? found.icon : PawPrint;
}

export function breedsForSpecies(species: string): string[] {
  const found = SPECIES_CATEGORIES.find((s) => s.value === species);
  return found ? found.breeds : [];
}
