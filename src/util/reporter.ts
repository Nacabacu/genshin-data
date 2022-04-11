import { bold, green } from 'colorette';

export class Reporter {
  private _taskName: string;
  private _startTime: number;

  constructor(taskName: string) {
    this._taskName = taskName;
  }

  start() {
    this._startTime = performance.now();

    console.log(`Start ${this.colorTaskName()} task`);
  }

  stop() {
    const totalTime = performance.now() - this._startTime;
    const totalText = prettyMs(totalTime);

    console.log(`Finished ${this.colorTaskName()} task in ${totalText}`);
  }

  private colorTaskName() {
    return bold(green(this._taskName));
  }
}

// Port from parse-ms package
// https://github.com/sindresorhus/parse-ms/blob/master/index.js
function parseMs(milliseconds: number) {
  const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(milliseconds / 86400000),
    hours: roundTowardsZero(milliseconds / 3600000) % 24,
    minutes: roundTowardsZero(milliseconds / 60000) % 60,
    seconds: roundTowardsZero(milliseconds / 1000) % 60,
    milliseconds: roundTowardsZero(milliseconds) % 1000,
    microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
    nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000,
  };
}

// Port from pretty-ms package
// https://github.com/sindresorhus/pretty-ms/blob/master/index.js
function prettyMs(milliseconds: number) {
  const result: string[] = [];
  const add = (value: number, short: string) => {
    if (value === 0) return;

    result.push(value + short);
  };

  const parsed = parseMs(milliseconds);

  add(Math.trunc(parsed.days / 365), 'y');
  add(parsed.days % 365, 'd');
  add(parsed.hours, 'h');
  add(parsed.minutes, 'm');
  add(parsed.seconds, 's');
  add(parsed.milliseconds, 'ms');

  if (result.length === 0) {
    return '0' + 'ms';
  }

  return result.join(' ');
}
