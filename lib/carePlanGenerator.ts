import { getSpeciesKnowledge } from '@/lib/species';
import type { SymptomEntry } from '@/lib/species/types';

export interface PetProfile {
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  weight: number | null;
  gender: string | null;
  neuterStatus: string | null;
  allergies: string | null;
  chronicConditions: string | null;
}

export interface PlanInput {
  petType: string;
  symptoms: string[];
  extra: string;
  petProfile?: PetProfile | null;
  detailed: boolean;
}

export interface GeneratedPlan {
  summary: string;
  detailedPlan: string;
  redFlags: string[];
  dosageByWeight: string | null;
}

const SPECIES_NAMES: Record<string, string> = {
  cat: '猫', dog: '狗', rabbit: '兔', rodent: '仓鼠/豚鼠',
  bird: '鸟类', reptile: '爬宠', fish: '观赏鱼', ferret: '雪貂',
};

function getAgeYears(age: string | null): number | null {
  if (!age) return null;
  const yearMatch = age.match(/(\d+)\s*岁/);
  const monthMatch = age.match(/(\d+)\s*月/);
  let years = 0;
  if (yearMatch) years += parseInt(yearMatch[1]);
  if (monthMatch) years += parseInt(monthMatch[1]) / 12;
  return years || null;
}

function getWeightKg(weight: number | null): number | null {
  if (!weight || weight <= 0) return null;
  return weight;
}

function formatDosageByWeight(weightKg: number, species: string): string | null {
  const dosages: { drug: string; perKg: number; unit: string; note: string }[] = [];

  if (species === 'cat' || species === 'dog') {
    dosages.push(
      { drug: '阿莫西林克拉维酸', perKg: 12.5, unit: 'mg/kg', note: '每日2次，连用5-7天' },
      { drug: '甲硝唑', perKg: 7.5, unit: 'mg/kg', note: '每日2次，连用5-7天' },
      { drug: '美洛昔康（消炎镇痛）', perKg: 0.1, unit: 'mg/kg', note: '每日1次，最多3-5天，猫慎用' },
    );
  } else if (species === 'rabbit') {
    dosages.push(
      { drug: '甲氧苄啶磺胺', perKg: 30, unit: 'mg/kg', note: '每日2次，连用7天' },
      { drug: '美洛昔康', perKg: 0.3, unit: 'mg/kg', note: '每日1次，最多3天' },
    );
  } else if (species === 'ferret') {
    dosages.push(
      { drug: '阿莫西林', perKg: 10, unit: 'mg/kg', note: '每日2次' },
      { drug: '美洛昔康', perKg: 0.1, unit: 'mg/kg', note: '每日1次' },
    );
  } else if (species === 'rodent') {
    dosages.push(
      { drug: '甲氧苄啶磺胺', perKg: 30, unit: 'mg/kg', note: '每日2次（豚鼠禁用青霉素类）' },
    );
  } else if (species === 'bird') {
    dosages.push(
      { drug: '多西环素', perKg: 25, unit: 'mg/kg', note: '每日1-2次' },
    );
  } else if (species === 'reptile') {
    dosages.push(
      { drug: '恩诺沙星', perKg: 5, unit: 'mg/kg', note: '每日1次（需保持适宜体温）' },
    );
  } else if (species === 'fish') {
    return '鱼用药量按水体积计算，请参考药品说明书的每升水用量，不可按体重给药。';
  }

  if (dosages.length === 0) return null;

  const lines = dosages.map((d) => {
    const dose = (d.perKg * weightKg).toFixed(2);
    return `- **${d.drug}**：参考剂量 ${dose} ${d.unit.replace('/kg', '')}（${d.perKg} ${d.unit}），${d.note}`;
  });
  return `### 参考用药（按体重 ${weightKg}kg 计算）\n\n${lines.join('\n')}\n\n⚠️ 以上为参考剂量，必须遵兽医医嘱使用，严禁自行用药。`;
}

export function generatePlan(input: PlanInput): GeneratedPlan {
  const knowledge = getSpeciesKnowledge(input.petType);
  const speciesName = SPECIES_NAMES[input.petType] || input.petType;
  const weightKg = input.petProfile ? getWeightKg(input.petProfile.weight) : null;
  const ageYears = input.petProfile ? getAgeYears(input.petProfile.age) : null;

  if (!knowledge) {
    return {
      summary: `已选择${speciesName}，请选择具体症状以获取护理建议。`,
      detailedPlan: '暂无该物种的详细知识库。',
      redFlags: ['如宠物情况严重，请立即就医。'],
      dosageByWeight: null,
    };
  }

  const selectedSymptomEntries: SymptomEntry[] = [];
  for (const catId of input.symptoms) {
    const matches = knowledge.symptoms.filter((s) => s.category === catId);
    selectedSymptomEntries.push(...matches);
  }

  const profileStr = input.petProfile
    ? [
        input.petProfile.name,
        input.petProfile.breed && `品种：${input.petProfile.breed}`,
        input.petProfile.age && `年龄：${input.petProfile.age}`,
        weightKg && `体重：${weightKg}kg`,
        input.petProfile.gender && `性别：${input.petProfile.gender}`,
        input.petProfile.neuterStatus && `绝育：${input.petProfile.neuterStatus}`,
        input.petProfile.allergies && `过敏史：${input.petProfile.allergies}`,
        input.petProfile.chronicConditions && `慢性病：${input.petProfile.chronicConditions}`,
      ].filter(Boolean).join(' · ')
    : speciesName;

  if (!input.detailed) {
    const topSymptoms = selectedSymptomEntries.slice(0, 3);
    const summary = topSymptoms.length > 0
      ? `${profileStr} — ${topSymptoms.map((s) => s.label).join('、')}。${topSymptoms[0]?.description || ''}`
      : `${profileStr} — 请选择具体症状以获取简要建议。`;
    return {
      summary,
      detailedPlan: '',
      redFlags: ['如宠物出现严重症状请立即就医。登录后查看详细方案。'],
      dosageByWeight: null,
    };
  }

  const allRedFlags = new Set<string>();
  const sections: string[] = [];

  sections.push(`## ${profileStr} 的护理方案\n`);

  sections.push('### 初步判断\n');
  if (ageYears != null) {
    if (ageYears < 1) sections.push(`⚠️ 幼年动物（${input.petProfile?.age}），免疫力较弱，需格外谨慎。\n`);
    if (ageYears > 8 && (input.petType === 'cat' || input.petType === 'dog')) sections.push(`⚠️ 老年动物（${input.petProfile?.age}），需关注慢性病风险。\n`);
  }
  if (input.petProfile?.allergies) sections.push(`⚠️ 已知过敏：${input.petProfile.allergies}，用药时需避开相关成分。\n`);
  if (input.petProfile?.chronicConditions) sections.push(`⚠️ 慢性病：${input.petProfile.chronicConditions}，需综合考虑用药。\n`);

  const symptomGroups = new Map<string, SymptomEntry[]>();
  for (const s of selectedSymptomEntries) {
    if (!symptomGroups.has(s.category)) symptomGroups.set(s.category, []);
    symptomGroups.get(s.category)!.push(s);
  }

  for (const [category, entries] of symptomGroups) {
    const catLabel = entries[0]?.category;
    sections.push(`#### ${category} — ${catLabel}\n`);
    for (const entry of entries) {
      sections.push(`**${entry.label}**\n`);
      sections.push(`${entry.description}\n`);
      sections.push(`- 常见原因：${entry.commonCauses.join('、')}\n`);
      sections.push(`- 居家护理：${entry.homeCare.join('；')}\n`);
      sections.push(`- 物种注意：${entry.speciesNotes}\n`);
      entry.redFlags.forEach((f) => allRedFlags.add(f));
      sections.push('\n');
    }
  }

  if (input.extra) {
    sections.push(`### 补充说明\n\n${input.extra}\n`);
  }

  const dosage = weightKg ? formatDosageByWeight(weightKg, input.petType) : null;
  if (dosage) sections.push(dosage + '\n');

  sections.push('### 就医判断\n');
  sections.push('- 可在家观察：症状轻微、食欲精神尚可、无红色警报信号\n');
  sections.push('- 24小时内就医：症状持续超过24小时、反复发作、逐渐加重\n');
  sections.push('- 立即急诊：出现下方任何红色警报信号\n');

  sections.push('\n### ⚠️ 红色警报信号（出现以下情况请立即就医）\n');
  const flags = Array.from(allRedFlags).slice(0, 8);
  flags.forEach((f) => sections.push(`- ${f}\n`));

  sections.push('\n---\n*本方案由本地知识库生成（非AI），仅供参考，不能替代专业兽医诊断。如有疑问请及时就医。*');

  return {
    summary: `${profileStr} — 已根据${selectedSymptomEntries.length}项症状生成详细方案`,
    detailedPlan: sections.join('\n'),
    redFlags: flags,
    dosageByWeight: dosage,
  };
}
