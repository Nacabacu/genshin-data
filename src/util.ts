import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Items, Languages } from 'genshin-db';
import { Dictionary, MaterialDataConfig, MaterialGroupConfig } from './types/data';

interface MaterialGroupMap {
  gem: string;
  book: string;
  weapon: string;
  common: string;
  elite: string;
  boss: string;
  local: string;
  weeklyBoss: string;
}

interface MaterialGroupResult {
  type: keyof MaterialGroupConfig;
  groupId: string;
}

type LanguageMap = {
  [key in Languages]: string;
};

const IMAGES_FOLDER = 'images';
const LOCALIZATION_FOLDER = 'localization';
const languageMap: LanguageMap = {
  ChineseSimplified: 'zh-CN',
  ChineseTraditional: 'zh-TW',
  English: 'en-US',
  French: 'fr-FR',
  German: 'de-DE',
  Indonesian: 'id-ID',
  Japanese: 'ja-JP',
  Korean: 'ko-KR',
  Portuguese: 'pt-PT',
  Russian: 'ru-RU',
  Spanish: 'es-ES',
  Thai: 'th-TH',
  Vietnamese: 'vi-VN',
};

export function getId(name: string) {
  return name
    .replace(/[^a-zA-Z ]/g, '')
    .toLowerCase()
    .replace(/ /g, '_');
}

export function findMaxInArray(data: string[]) {
  return Math.max(...data.map((i) => parseInt(i)));
}

export function findMaterialGroupMap(
  materialGroupMap: Dictionary<Dictionary<string>>,
  materialGroupData: MaterialDataConfig,
  itemList: Items[],
): Partial<MaterialGroupMap> {
  const result: Partial<MaterialGroupMap> = {};

  itemList.forEach((item) => {
    const itemId = getId(item.name);
    const materialGroup = findMaterialGroup(materialGroupMap, itemId);

    if (materialGroup) {
      const { type, groupId } = materialGroup;

      result[type] = groupId;
    } else {
      let key: keyof MaterialDataConfig;
      for (key in materialGroupData) {
        const groupData = materialGroupData[key];

        if (Array.isArray(groupData)) {
          if (groupData.find((data) => data === itemId)) {
            result[key] = itemId;
          }
        }
      }
    }
  });

  return result;
}

export function findMaterialGroup(
  materialGroupMap: Dictionary<Dictionary<string>>,
  id: string,
): MaterialGroupResult | null {
  let result: MaterialGroupResult | null = null;

  for (let groupKey in materialGroupMap) {
    const groupId = materialGroupMap[groupKey][id];

    if (groupId) {
      result = {
        type: <keyof MaterialGroupConfig>groupKey,
        groupId,
      };
    }
  }

  return result;
}

export async function downloadImage(url: string, outputDir: string, folderName: string, fileName: string) {
  const path = `${outputDir}/${IMAGES_FOLDER}/${folderName}`;

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
  const path = `${outputDir}/${LOCALIZATION_FOLDER}/`;

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  const filePath = `${path}/${languageMap[language]}.json`;
  let localizeFile: Dictionary<string> = {};

  if (existsSync(filePath)) {
    localizeFile = <Dictionary<string>>JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  keyList.forEach((key, index) => {
    localizeFile[key] = valueList[index];
  });

  writeFileSync(filePath, JSON.stringify(localizeFile, null, 2));
}
