import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';
import exportWeapon from './weapon';

const DATA_DIR = path.join(__dirname, '../data');
const ASSET_DIR = path.join(__dirname, '../asset');

async function main() {
  const browser = await chromium.launch({ headless: false });

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR);
  }

  await exportWeapon(browser);
}

main();
