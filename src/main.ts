import _config from './config.json';
import { existsSync, mkdirSync, rmSync } from 'fs';
import * as item from './item';
import { Config, Context, Dictionary } from './types';
import { getId } from './util';

async function main() {
  const config = <Config>_config;

  const { isClearOutputDir, outputDir } = config;

  if (isClearOutputDir) {
    rmSync(outputDir, { recursive: true, force: true });
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  const context: Context = parseConfig(config);

  await item.getItem(context);
}

function parseConfig(config: Config): Context {
  const itemGroupMapping: Dictionary<string> = {};
  const { itemGroup } = config;

  for (const key in itemGroup) {
    const data = itemGroup[key];

    data.forEach((name) => {
      itemGroupMapping[getId(name)] = getId(key);
    });
  }

  delete config['itemGroup'];

  return {
    ...config,
    itemGroupMapping,
  };
}

main();
