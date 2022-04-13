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
}

export interface Context extends ContextBase {
  materialGroupMapping: Dictionary<string>;
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
  [key: string]: string[];
}

export interface MaterialDataGroup {
  id: string;
  material: MaterialData[];
}

export interface MaterialData extends ItemDataBase {}

export interface ArtifactData extends ItemDataBase {}
