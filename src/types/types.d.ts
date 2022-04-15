import { Languages } from 'genshin-db';
import { Dictionary, MaterialDataConfig, MaterialGroupConfig } from './data.d';

export type Exportable = 'material' | 'artifact' | 'character' | 'weapon' | 'domain';

export interface ContextBase {
  isDownloadImage: boolean;
  isClearOutputDir: boolean;
  languages: Languages[];
  exportType: Exportable[];
  outputDir: string;
  materialData: MaterialDataConfig;
}

export interface Context extends ContextBase {
  materialGroupMap: Dictionary<Dictionary<string>>;
}

export interface Config extends ContextBase {
  materialGroup?: MaterialGroupConfig;
}
