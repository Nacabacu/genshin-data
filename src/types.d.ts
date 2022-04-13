import { Languages } from 'genshin-db';

export interface Dictionary<T> {
  [key: string]: T;
}

export type Exportable = 'material' | 'artifact' | 'character' | 'weapon' | 'domain';

export interface ContextBase {
  isDownloadImage: boolean;
  isClearOutputDir: boolean;
  languages: Languages[];
  exportType: Exportable[];
  outputDir: string;
  materialGroupData: MaterialGroupDataConfig;
}

export interface Context extends ContextBase {
  materialGroupMapping: Dictionary<Dictionary<string>>;
}

export interface Config extends ContextBase {
  materialGroup?: MaterialGroupConfig;
}

export interface ItemDataBase {
  id: string;
  rarity?: string;
  url?: string;
}

export interface MaterialGroupConfig {
  gem: Dictionary<string[]>;
  book: Dictionary<string[]>;
  weapon: Dictionary<string[]>;
  common: Dictionary<string[]>;
  elite: Dictionary<string[]>;
}

export interface MaterialGroupDataConfig {
  boss: string[];
  local: string[];
  weeklyBoss: string[];
}

export interface MaterialDataGroup {
  id: string;
  materials: MaterialData[];
}

export interface MaterialData extends ItemDataBase {}

export interface ArtifactData extends ItemDataBase {}

export interface CharacterData extends ItemDataBase {
  element: string;
  weapon: string;
  ascendMaterial: CharacterAscendMaterial;
  talentMaterial: TalentMaterial;
}

export interface CharacterAscendMaterial {
  gem: string;
  boss: string;
  common: string;
  local: string;
}

export interface TalentMaterial {
  common: string;
  book: string;
  weeklyBoss: string;
}
