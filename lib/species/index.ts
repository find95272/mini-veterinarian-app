import type { SpeciesKnowledge } from './types';
import { catKnowledge } from './cat';
import { dogKnowledge } from './dog';
import { rabbitKnowledge } from './rabbit';
import { rodentKnowledge } from './rodent';
import { birdKnowledge } from './bird';
import { reptileKnowledge } from './reptile';
import { fishKnowledge } from './fish';
import { ferretKnowledge } from './ferret';

export const ALL_SPECIES_KNOWLEDGE: Record<string, SpeciesKnowledge> = {
  cat: catKnowledge,
  dog: dogKnowledge,
  rabbit: rabbitKnowledge,
  rodent: rodentKnowledge,
  bird: birdKnowledge,
  reptile: reptileKnowledge,
  fish: fishKnowledge,
  ferret: ferretKnowledge,
};

export function getSpeciesKnowledge(speciesId: string): SpeciesKnowledge | undefined {
  return ALL_SPECIES_KNOWLEDGE[speciesId];
}

export function getSymptomsByCategory(speciesId: string, category: string) {
  const knowledge = getSpeciesKnowledge(speciesId);
  if (!knowledge) return [];
  return knowledge.symptoms.filter((s) => s.category === category);
}

export * from './types';
