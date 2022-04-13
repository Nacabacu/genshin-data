export interface Dictionary<T> {
  [key: string]: T;
}

export type Localizable = 'en' | 'th';
export type Exportable = 'material' | 'artifact' | 'character' | 'weapon' | 'domain';

export interface ContextBase {
  isDownloadImage: boolean;
  isClearOutputDir: boolean;
  localize: Localizable[];
  exportType: Exportable[];
  outputDir: string;
}

export interface Context extends ContextBase {
  materialGroupMapping: Dictionary<string>;
}

export interface Config extends ContextBase {
  materialGroup?: MaterialGroupConfig;
}

export interface MaterialGroupConfig {
  [key: string]: string[];
}

export interface MaterialDataGroup {
  id: string;
  dropdomainId?: string;
  daysofweek?: string[];
  material: MaterialData[];
}

export interface MaterialData {
  id: string;
  rarity?: string;
  url: string;
}
