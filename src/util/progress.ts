import { MultiBar, Presets, SingleBar } from 'cli-progress';

export interface ProgressConfig {
  name: string;
  startValue: number;
  totalvalue: number;
}

export interface MultiBarResult {
  multiBar: MultiBar;
  barList: SingleBar[];
}

export function createSingleBar(config: ProgressConfig): SingleBar {
  const singleBar = new SingleBar(
    {
      format: `${config.name} | '{bar}'| {percentage}% || {value}/{total}`,
    },
    Presets.shades_classic,
  );

  singleBar.start(config.totalvalue, config.startValue);

  return singleBar;
}

export function createMultiBar(): CustomMultibar {
  const multiBar = new CustomMultibar(
    {
      format: `{name} | '{bar}'| {percentage}% || {value}/{total}`,
    },
    Presets.shades_classic,
  );

  return multiBar;
}

export class CustomMultibar extends MultiBar {
  createBar(config: ProgressConfig) {
    return this.create(config.totalvalue, config.startValue, { name: config.name.padEnd(12) });
  }
}
