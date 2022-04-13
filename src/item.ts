import genshindb, { Material } from 'genshin-db';
import { ItemGroupConfig, Dictionary, ItemData, ItemDataGroup, Config, Context } from './types';
import { downloadImage, getId } from './util';
import { writeFileSync } from 'fs';

const TYPE = 'material';
const ITEM_CATEGORY_LIST = [
  'Weapon Ascension Material',
  'Character Level-Up Material',
  'Talent Level-Up Material',
  'Local Specialty (Mondstadt)',
  'Local Specialty (Liyue)',
  'Local Specialty (Inazuma)',
];

const itemDataList: (ItemData | ItemDataGroup)[] = [];

export async function getItem(context: Context) {
  const { outputDir } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  ITEM_CATEGORY_LIST.forEach((category) => {
    getItemFromCategory(category, context);
  });

  writeFileSync(outputDataPath, JSON.stringify(itemDataList, null, 2));
}

function getItemFromCategory(category: string, context: Context) {
  const { outputDir, isDownloadImage, itemGroupMapping } = context;
  const itemNameList = <string[]>genshindb.materials(category, { matchCategories: true });

  itemNameList.forEach((itemName) => {
    const item = <Material>genshindb.materials(itemName);
    const id = getId(item.name);

    if (id) {
      const itemGroupId = itemGroupMapping[id];
      const imgUrl = item.images.fandom || item.images.redirect;
      const itemData: ItemData = {
        id,
        rarity: item.rarity,
        url: item.url?.fandom,
      };

      if (itemGroupId) {
        let itemGroup = <ItemDataGroup>itemDataList.find((item) => item.id === itemGroupId);

        if (!itemGroup) {
          itemGroup = {
            id: itemGroupId,
            dropdomainId: item?.dropdomain && getId(item.dropdomain),
            daysofweek: item.daysofweek,
            item: [],
          };
        }

        itemGroup.item.push(itemData);
        itemDataList.push(itemGroup);
      } else {
        itemDataList.push(itemData);
      }

      if (isDownloadImage) {
        downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
          console.log(`Cannot download image for item name: ${itemName} with error: ${err}`);
        });
      }
    }
  });
}
