import _config from './config.json';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { getMaterial } from './material';
import { Config, Context, Dictionary, MaterialGroupConfig } from './types';
import { getId } from './util';
import { getArtifact } from './artifact';
import { getCharacter } from './character';

async function main() {
  const config = <Config>_config;

  const { isClearOutputDir, outputDir, exportType } = config;

  if (isClearOutputDir) {
    rmSync(outputDir, { recursive: true, force: true });
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  const context: Context = parseConfig(config);

  if (exportType.includes('material')) {
    await getMaterial(context);
  }

  if (exportType.includes('artifact')) {
    await getArtifact(context);
  }

  if (exportType.includes('character')) {
    await getCharacter(context);
  }
}

function parseConfig(config: Config): Context {
  const materialGroupMapping: Dictionary<Dictionary<string>> = {};
  const { materialGroup } = config;

  if (materialGroup) {
    let groupKey: keyof MaterialGroupConfig;

    for (groupKey in materialGroup) {
      const group = materialGroup[groupKey];
      materialGroupMapping[groupKey] = {};

      for (const key in group) {
        group[key].forEach((name) => {
          materialGroupMapping[groupKey][name] = key;
        });
      }
    }

    delete config['materialGroup'];
  }

  return {
    ...config,
    materialGroupMapping,
  };
}

main();
