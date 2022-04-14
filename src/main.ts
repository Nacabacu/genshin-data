import _config from './config.json';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { getMaterial } from './script/material';
import { Config, Context, Dictionary, MaterialGroupConfig } from './types';
import { getArtifact } from './script/artifact';
import { getCharacter } from './script/character';
import { getWeapon } from './script/weapon';
import { getDomain } from './script/domain';

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

  if (exportType.includes('weapon')) {
    await getWeapon(context);
  }

  if (exportType.includes('domain')) {
    await getDomain(context);
  }
}

function parseConfig(config: Config): Context {
  const materialGroupMap: Dictionary<Dictionary<string>> = {};
  const { materialGroup } = config;

  if (materialGroup) {
    let groupKey: keyof MaterialGroupConfig;

    for (groupKey in materialGroup) {
      const group = materialGroup[groupKey];
      materialGroupMap[groupKey] = {};

      for (let key in group) {
        group[key].forEach((name) => {
          materialGroupMap[groupKey][name] = key;
        });
      }
    }

    delete config['materialGroup'];
  }

  return {
    ...config,
    materialGroupMap: materialGroupMap,
  };
}

main();
