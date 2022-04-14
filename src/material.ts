import genshindb, { Languages, Material } from 'genshin-db';
import { Context, Dictionary, MaterialData, MaterialDataGroup } from './types';
import { addLocalize, downloadImage, findMaterialGroup, getId } from './util';
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

const materialDataMap: Dictionary<MaterialData | MaterialDataGroup> = {};
const materialDataList: (MaterialData | MaterialDataGroup)[] = [];

export async function getMaterial(context: Context) {
  const { outputDir } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  MATERIAL_CATEGORY_LIST.forEach((category) => {
    getMaterialFromCategory(category, context);
  });

  for (let key in materialDataMap) {
    const data = materialDataMap[key];

    materialDataList.push(data);
  }

  materialDataList.sort((a, b) => {
    if (!('materials' in a)) return 1;
    if (!('materials' in b)) return -1;

    return b.materials.length - a.materials.length;
  });

  writeFileSync(outputDataPath, JSON.stringify(materialDataList, null, 2));
}

function getMaterialFromCategory(category: string, context: Context) {
  const { outputDir, isDownloadImage, materialGroupMap } = context;
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
    const materialGroup = findMaterialGroup(materialGroupMap, id);
    const imgUrl = material.images.fandom || material.images.redirect;
    const materialData: MaterialData = {
      id,
      rarity: material.rarity,
      url: material.url?.fandom,
    };

    if (materialGroup) {
      const materialGroupId = materialGroup.groupId;
      const matchMaterialDataGroup = <MaterialDataGroup>materialDataMap[materialGroupId];

      if (matchMaterialDataGroup) {
        matchMaterialDataGroup.materials.push(materialData);
      } else {
        let materialDataGroup = <MaterialDataGroup>materialDataList.find((mat) => mat.id === materialGroupId);

        if (!materialDataGroup) {
          materialDataGroup = {
            id: materialGroupId,
            materials: [],
          };
        }

        materialDataGroup.materials.push(materialData);
        materialDataMap[materialGroupId] = materialDataGroup;
      }
    } else {
      materialDataMap[id] = materialData;
    }

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${materialName} with error: ${err}`);
      });
    }
  });
}
