import { Languages } from 'genshin-db';
import { Dictionary } from './data.d';

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
  materialGroupMap: Dictionary<Dictionary<string>>;
}

export interface Config extends ContextBase {
  materialGroup?: MaterialGroupConfig;
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
