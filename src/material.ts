import genshindb, { Material } from 'genshin-db';
import { Context, MaterialData, MaterialDataGroup } from './types';
import { downloadImage, getId } from './util';
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

  materialNameList.forEach((materialName) => {
    const material = <Material>genshindb.materials(materialName);
    const id = getId(material.name);

    if (id) {
      const materialGroupId = materialGroupMapping[id];
      const imgUrl = material.images.fandom || material.images.redirect;
      const materialData: MaterialData = {
        id,
        rarity: material.rarity,
        url: material.url?.fandom,
      };

      if (materialGroupId) {
        let materialGroup = <MaterialDataGroup>materialDataList.find((m) => m.id === materialGroupId);

        if (!materialGroup) {
          materialGroup = {
            id: materialGroupId,
            dropdomainId: material?.dropdomain && getId(material.dropdomain),
            daysofweek: material.daysofweek,
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
    }
  });
}
