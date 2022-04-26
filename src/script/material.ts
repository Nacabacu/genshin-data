import { writeFileSync } from 'fs';
import genshindb, { Languages, Material } from 'genshin-db';
import { Dictionary, MaterialData, MaterialDataGroup, Rarity } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, downloadImage, getId } from '../util';

const TYPE = 'materials';
const MATERIAL_CATEGORY_LIST = [
  'Weapon Ascension Material',
  'Character Level-Up Material',
  'Talent Level-Up Material',
  'Local Specialty (Mondstadt)',
  'Local Specialty (Liyue)',
  'Local Specialty (Inazuma)',
];

const materialDataMap: Dictionary<MaterialData | MaterialDataGroup> = {};
const materialDataList: (MaterialData | MaterialDataGroup)[] = [];

export async function getMaterial(context: Context) {
  const { outputDir } = context;

  MATERIAL_CATEGORY_LIST.forEach((category) => {
    getMaterialFromCategory(category, context);
  });

  materialDataList.push(...Object.keys(materialDataMap).map((key) => materialDataMap[key]));

  writeFileSync(`${outputDir}/data/${TYPE}.json`, JSON.stringify(materialDataList, null, 2));
}

function getMaterialFromCategory(category: string, context: Context) {
  const { outputDir, isDownloadImage } = context;
  const materialNameList = <string[]>genshindb.materials(category, { matchCategories: true });
  const materialIdList = materialNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, materialIdList, materialNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizedNameList = <string[]>(
        genshindb.materials(category, { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, materialIdList, localizedNameList, outputDir);
    });
  }

  materialNameList.forEach((materialName) => {
    const material = <Material>genshindb.materials(materialName);
    const id = getId(material.name);
    const imgUrl = material.images.fandom || material.images.redirect;
    const materialData: MaterialData = {
      id,
      rarity: material.rarity ? <Rarity>parseInt(material.rarity) : undefined,
      url: material.url?.fandom,
    };

    materialDataMap[id] = materialData;

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${materialName} with error: ${err}`);
      });
    }
  });
}
