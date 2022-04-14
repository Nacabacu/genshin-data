import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import _config from './config.json';
import { getArtifact } from './script/artifact';
import { getCharacter } from './script/character';
import { getDomain } from './script/domain';
import { getMaterial } from './script/material';
import { getWeapon } from './script/weapon';
import { Dictionary } from './types/data';
import { Config, Context, MaterialGroupConfig } from './types/types';

async function main() {
  const config = <Config>_config;

  const { isClearOutputDir, outputDir, exportType } = config;

  if (isClearOutputDir) {
    rmSync(outputDir, { recursive: true, force: true });
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  createMappingFile(config);

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

function createMappingFile(config: Config) {
  const result = Object.assign(config.materialGroupData, config.materialGroup);

  writeFileSync(`${config.outputDir}/config.json`, JSON.stringify(result, null, 2));
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
