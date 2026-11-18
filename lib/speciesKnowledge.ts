export type SpeciesId = 'cat' | 'dog' | 'rabbit' | 'rodent' | 'bird' | 'reptile' | 'fish' | 'ferret';

export type SymptomCategoryId = 'eating' | 'excretion' | 'behavior' | 'appearance' | 'respiratory' | 'neuro';

export interface SymptomCategory {
  id: SymptomCategoryId;
  labelZh: string;
  labelEn: string;
  labelJa: string;
  descZh: string;
  descEn: string;
  descJa: string;
  icon: string;
}

export type CareDifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface SpeciesInfo {
  id: SpeciesId;
  labelZh: string;
  labelEn: string;
  labelJa: string;
  descZh: string;
  descEn: string;
  descJa: string;
  icon: string;
  emoji: string;
  symptoms: SymptomCategoryId[];
  careDifficulty: CareDifficultyLevel;
  careDifficultyLabel: string;
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'eating',
    labelZh: '摄食异常', labelEn: 'Eating Issues', labelJa: '摂食異常',
    descZh: '食欲下降、拒食、暴饮、异食', descEn: 'Loss of appetite, refusing food, excessive drinking, pica', descJa: '食欲低下、拒食、多飲、異食',
    icon: 'Utensils',
  },
  {
    id: 'excretion',
    labelZh: '排泄异常', labelEn: 'Excretion Issues', labelJa: '排泄異常',
    descZh: '腹泻、便秘、尿频、血尿', descEn: 'Diarrhea, constipation, frequent urination, blood in urine', descJa: '下痢、便秘、頻尿、血尿',
    icon: 'Droplet',
  },
  {
    id: 'behavior',
    labelZh: '行为异常', labelEn: 'Behavior Issues', labelJa: '行動異常',
    descZh: '嗜睡、焦躁、跛行、抽搐', descEn: 'Lethargy, restlessness, limping, seizures', descJa: '嗜眠、焦燥、跛行、痙攣',
    icon: 'Activity',
  },
  {
    id: 'appearance',
    labelZh: '外貌异常', labelEn: 'Appearance Issues', labelJa: '外見異常',
    descZh: '脱毛、红肿、皮疹、眼鼻分泌物', descEn: 'Hair loss, swelling, rash, eye/nose discharge', descJa: '脱毛、発赤、発疹、眼鼻分泌物',
    icon: 'Eye',
  },
  {
    id: 'respiratory',
    labelZh: '呼吸异常', labelEn: 'Respiratory Issues', labelJa: '呼吸異常',
    descZh: '喘息、咳嗽、呼吸困难、张口呼吸', descEn: 'Wheezing, coughing, breathing difficulty, open-mouth breathing', descJa: '喘鳴、咳嗽、呼吸困難、口呼吸',
    icon: 'Wind',
  },
  {
    id: 'neuro',
    labelZh: '神经异常', labelEn: 'Neurological Issues', labelJa: '神経異常',
    descZh: '抽搐、歪头、转圈、瘫痪、意识障碍', descEn: 'Seizures, head tilt, circling, paralysis, disorientation', descJa: '痙攣、首傾け、回旋、麻痺、意識障害',
    icon: 'Brain',
  },
];

export const SPECIES_LIST: SpeciesInfo[] = [
  {
    id: 'cat', labelZh: '猫', labelEn: 'Cat', labelJa: '猫',
    descZh: '家猫 / 幼猫', descEn: 'House cat / Kitten', descJa: '家猫 / 子猫',
    icon: 'Cat', emoji: '🐱',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'easy', careDifficultyLabel: '入门'
  },
  {
    id: 'dog', labelZh: '狗', labelEn: 'Dog', labelJa: '犬',
    descZh: '大型 / 小型犬', descEn: 'Large / Small Breed', descJa: '大型 / 小型犬',
    icon: 'Dog', emoji: '🐶',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'easy', careDifficultyLabel: '入门'
  },
  {
    id: 'rabbit', labelZh: '兔', labelEn: 'Rabbit', labelJa: 'ウサギ',
    descZh: '家兔 / 宠物兔', descEn: 'House Rabbit', descJa: '飼育ウサギ',
    icon: 'Rabbit', emoji: '🐰',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'medium', careDifficultyLabel: '中等'
  },
  {
    id: 'rodent', labelZh: '仓鼠/豚鼠', labelEn: 'Rodent', labelJa: '小齧類',
    descZh: '仓鼠 / 豚鼠 / 小鼠', descEn: 'Hamster / Guinea Pig / Mouse', descJa: 'ハムスター / モルモット / マウス',
    icon: 'Rat', emoji: '🐹',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'easy', careDifficultyLabel: '入门'
  },
  {
    id: 'bird', labelZh: '鸟类', labelEn: 'Bird', labelJa: '鳥類',
    descZh: '鹦鹉 / 文鸟', descEn: 'Parrot / Finch', descJa: 'オウム / 文鳥',
    icon: 'Bird', emoji: '🐦',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'hard', careDifficultyLabel: '进阶'
  },
  {
    id: 'reptile', labelZh: '爬宠', labelEn: 'Reptile', labelJa: '爬虫類',
    descZh: '龟 / 蜥蜴 / 守宫', descEn: 'Turtle / Lizard / Gecko', descJa: '亀 / トカゲ / ヤモリ',
    icon: 'Turtle', emoji: '🐢',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'hard', careDifficultyLabel: '进阶'
  },
  {
    id: 'fish', labelZh: '观赏鱼', labelEn: 'Ornamental Fish', labelJa: '観賞魚',
    descZh: '金鱼 / 锦鲤 / 热带鱼', descEn: 'Goldfish / Koi / Tropical', descJa: '金魚 / 錦鯉 / 熱帯魚',
    icon: 'Fish', emoji: '🐟',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'medium', careDifficultyLabel: '中等'
  },
  {
    id: 'ferret', labelZh: '雪貂', labelEn: 'Ferret', labelJa: 'フェレット',
    descZh: '宠物雪貂', descEn: 'Pet Ferret', descJa: 'ペットフェレット',
    icon: 'PawPrint', emoji: '🦫',
    symptoms: ['eating', 'excretion', 'behavior', 'appearance', 'respiratory', 'neuro'],
    careDifficulty: 'expert', careDifficultyLabel: '专业'
  },
];

export function getSpecies(id: string): SpeciesInfo | undefined {
  return SPECIES_LIST.find((s) => s.id === id);
}

export function getSymptomCategory(id: string): SymptomCategory | undefined {
  return SYMPTOM_CATEGORIES.find((c) => c.id === id);
}

export const ALL_SPECIES_IDS = SPECIES_LIST.map((s) => s.id);
