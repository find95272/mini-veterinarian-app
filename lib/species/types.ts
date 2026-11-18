export type SymptomCategoryId = 'eating' | 'excretion' | 'behavior' | 'appearance' | 'respiratory' | 'neuro';

export interface SymptomEntry {
  id: string;
  label: string;
  category: SymptomCategoryId;
  description: string;
  commonCauses: string[];
  homeCare: string[];
  redFlags: string[];
  speciesNotes: string;
}

export interface SpeciesKnowledge {
  speciesId: string;
  symptoms: SymptomEntry[];
}

export interface CareDifficulty {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  label: string;
  color: string;
}

export const CARE_DIFFICULTY: Record<string, CareDifficulty> = {
  easy: { level: 'easy', label: '入门', color: 'text-success' },
  medium: { level: 'medium', label: '中等', color: 'text-primary' },
  hard: { level: 'hard', label: '进阶', color: 'text-warning' },
  expert: { level: 'expert', label: '专业', color: 'text-destructive' },
};
