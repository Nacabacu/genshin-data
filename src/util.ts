import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import axios from 'axios';
import { Languages } from 'genshin-db';
import { Dictionary } from './types';

const ASSET_FOLDER = 'asset';
const LOCALIZE_FOLDER = 'localize';

export function getId(name: string) {
  return name
    .replace(/[^a-zA-Z ]/g, '')
    .toLowerCase()
    .replace(/ /g, '_');
}

export function findMaxInArray(data: string[]) {
  return Math.max(...data.map((i) => parseInt(i)));
}

export async function downloadImage(url: string, outputDir: string, folderName: string, fileName: string) {
  const path = `${outputDir}/${ASSET_FOLDER}/${folderName}`;

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  const filePath = `${path}/${fileName}.png`;
  const response = await axios.get(url, {
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(createWriteStream(filePath))
      .on('error', reject)
      .once('close', () => resolve(filePath));
  });
}

export function addLocalize(language: Languages, keyList: string[], valueList: string[], outputDir: string) {
  const path = `${outputDir}/${LOCALIZE_FOLDER}/`;

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  const filePath = `${path}/${language}.json`;
  let localizeFile: Dictionary<string> = {};

  if (existsSync(filePath)) {
    localizeFile = <Dictionary<string>>JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  keyList.forEach((key, index) => {
    localizeFile[key] = valueList[index];
  });

  writeFileSync(filePath, JSON.stringify(localizeFile, null, 2));
}
