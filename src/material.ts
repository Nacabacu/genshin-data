import genshindb, { Languages, Material } from 'genshin-db';
import { Context, MaterialData, MaterialDataGroup } from './types';
import { addLocalize, downloadImage, getId } from './util';
import { writeFileSync } from 'fs';

const TYPE = 'material';
const MATERIAL_CATEGORY_LIST = [
  'Weapon Ascension Material',
  'Character Level-Up Material',
  'Talent Level-Up Material',
  'Local Specialty (Mondstadt)',
  'Local Specialty (Liyue)',
  'Local Specialty (Inazuma)',
];

const materialDataList: (MaterialData | MaterialDataGroup)[] = [];

export async function getMaterial(context: Context) {
  const { outputDir } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  MATERIAL_CATEGORY_LIST.forEach((category) => {
    getMaterialFromCategory(category, context);
  });

  writeFileSync(outputDataPath, JSON.stringify(materialDataList, null, 2));
}

function getMaterialFromCategory(category: string, context: Context) {
  const { outputDir, isDownloadImage, materialGroupMapping } = context;
  const materialNameList = <string[]>genshindb.materials(category, { matchCategories: true });
  const materialIdList = materialNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, materialIdList, materialNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizeMaterialNameList = <string[]>(
        genshindb.materials(category, { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, materialIdList, localizeMaterialNameList, outputDir);
    });
  }

  materialNameList.forEach((materialName) => {
    const material = <Material>genshindb.materials(materialName);
    const id = getId(material.name);
    const materialGroupId = materialGroupMapping[id];
    const imgUrl = material.images.fandom || material.images.redirect;
    const materialData: MaterialData = {
      id,
      rarity: material.rarity,
      url: material.url?.fandom,
    };

    if (materialGroupId) {
      let materialGroup = <MaterialDataGroup>materialDataList.find((mat) => mat.id === materialGroupId);

      if (!materialGroup) {
        materialGroup = {
          id: materialGroupId,
          material: [],
        };
      }

      materialGroup.material.push(materialData);
      materialDataList.push(materialGroup);
    } else {
      materialDataList.push(materialData);
    }

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for material name: ${materialName} with error: ${err}`);
      });
    }
  });
}
