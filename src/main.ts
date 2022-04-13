import _config from './config.json';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { getMaterial } from './material';
import { Config, Context, Dictionary } from './types';
import { getId } from './util';
import { getArtifact } from './artifact';

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
}

function parseConfig(config: Config): Context {
  const materialGroupMapping: Dictionary<string> = {};
  const { materialGroup } = config;

  for (const key in materialGroup) {
    const data = materialGroup[key];

    data.forEach((name) => {
      materialGroupMapping[getId(name)] = getId(key);
    });
  }

  delete config['materialGroup'];

  return {
    ...config,
    materialGroupMapping,
  };
}

main();
