export interface Dictionary<T> {
  [key: string]: T;
}

export type Localizable = 'en' | 'th';
export type Exportable = 'material' | 'artifact' | 'character' | 'weapon' | 'domain';

export interface ContextBase {
  isDownloadImage: boolean;
  isClearOutputDir: boolean;
  localize: Localizable[];
  export: Exportable[];
  outputDir: string;
}

export interface Context extends ContextBase {
  itemGroupMapping: Dictionary<string>;
}

export interface Config extends ContextBase {
  itemGroup?: ItemGroupConfig;
}

export interface ItemGroupConfig {
  [key: string]: string[];
}

export interface ItemDataGroup {
  id: string;
  dropdomainId?: string;
  daysofweek?: string[];
  item: ItemData[];
}

export interface ItemData {
  id: string;
  rarity?: string;
  url: string;
}
