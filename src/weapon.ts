/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { MultiBar } from 'cli-progress';
import { Browser, Page } from 'playwright';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { Ascension, AscensionMaterial, Rarity, Weapon } from './types/item';
import { Dictionary } from './types/util';
import { Reporter } from './util/reporter';
import { createMultiBar, CustomMultibar } from './util/Progress';

let multiBar: CustomMultibar;
const WEAPON_TYPE_URL = [
  'https://genshin-impact.fandom.com/wiki/Bows',
  'https://genshin-impact.fandom.com/wiki/Catalysts',
  'https://genshin-impact.fandom.com/wiki/Claymores',
  'https://genshin-impact.fandom.com/wiki/Polearms',
  'https://genshin-impact.fandom.com/wiki/Swords',
];

async function getWeapon(page: Page): Promise<Weapon | null> {
  return page.$eval('body', (element) => {
    const itemName = element.querySelector('.pi-title')?.innerHTML;
    const rarity = element.querySelector<HTMLImageElement>('[data-source="rarity"] > div > img')?.title.toLowerCase();
    const table = element.querySelector<HTMLTableElement>('.wikitable >tbody')?.children;
    const ascensions: Ascension[] = [];

    if (!itemName || !rarity || !table) return null;

    const rarityMapping: Dictionary<Rarity> = {
      '1 star': Rarity.OneStar,
      '2 stars': Rarity.TwoStar,
      '3 stars': Rarity.ThreeStar,
      '4 stars': Rarity.FourStar,
      '5 stars': Rarity.FiveStar,
    };

    function parseId(name: string) {
      return name.replace(`'`, '').toLowerCase().split(' ').join('_');
    }

    for (let index = 0; index < table.length; index += 1) {
      const item = table[index].querySelectorAll('.mw-collapsible-content > .card_container');
      const materials: AscensionMaterial[] = [];

      if (!item?.length) continue;

      for (let itemIndex = 0; itemIndex < item.length; itemIndex += 1) {
        const card = item[itemIndex];
        const name = card.querySelector<HTMLAnchorElement>('.card_image > a')?.title.toLowerCase();
        const quantityString = card.querySelector<HTMLSpanElement>('.card_font')?.innerText;

        if (name === 'mora' || !name || !quantityString) continue;

        materials.push({
          id: parseId(name),
          quantity: parseInt(quantityString, 10),
        });
      }

      ascensions.push({
        materials,
      });
    }

    return {
      id: parseId(itemName),
      rarity: rarityMapping[rarity],
      ascensions,
    };
  });
}

async function getWeaponUrlList(page: Page): Promise<string[]> {
  return page.$eval('body', (element) => {
    const list: string[] = [];
    const row = element.querySelectorAll<HTMLTableElement>('.article-table')[1].tBodies[0].children;

    for (let index = 0; index < row.length; index += 1) {
      const cell = row[index];
      const dataUrl = cell.querySelector<HTMLAnchorElement>('td > a')?.href;

      if (!dataUrl) continue;

      list.push(dataUrl);
    }

    return list;
  });
}

async function getWeaponList(browser: Browser, url: string): Promise<Weapon[]> {
  const page = await browser.newPage();
  const weaponList: Weapon[] = [];

  await page.goto(url, { timeout: 0 });

  const weaponUrlList = await getWeaponUrlList(page);
  const weaponMatch = /\/wiki\/(.+)/.exec(url);
  const weaponType = weaponMatch ? weaponMatch[1] : '';
  const singleBar = multiBar.createBar({
    name: weaponType,
    totalvalue: weaponUrlList.length,
    startValue: 1,
  });

  for (const weaponUrl of weaponUrlList) {
    await page.goto(weaponUrl, { timeout: 0, waitUntil: 'networkidle' });

    const weapon = await getWeapon(page);

    if (weapon) {
      weaponList.push(weapon);
    }

    singleBar.increment();
  }

  singleBar.stop();
  await page.close();

  return weaponList;
}

async function exportWeapon(browser: Browser) {
  const reporter = new Reporter('Export Weapon');
  reporter.start();
  multiBar = createMultiBar();

  const weaponResultList: Weapon[][] = await Promise.all(WEAPON_TYPE_URL.map((url) => getWeaponList(browser, url)));
  const result: Weapon[] = weaponResultList.reduce((prev, current) => [...prev, ...current], <Weapon[]>[]);

  await writeFile(path.join(__dirname, './data/weapon.json'), JSON.stringify(result, null, 4));
  reporter.stop();
}

export default exportWeapon;
