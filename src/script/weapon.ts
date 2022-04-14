import { writeFileSync } from 'fs';
import genshindb, { Languages, Weapon } from 'genshin-db';
import { Dictionary, Rarity, WeaponData, WeaponType } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, downloadImage, findMaterialGroupMap, getId } from '../util';

const TYPE = 'weapon';

const weaponDataMap: Dictionary<WeaponData> = {};

export function getWeapon(context: Context) {
  const { outputDir, isDownloadImage, materialGroupMap, materialGroupData } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  const weaponNameList = <string[]>genshindb.weapons('name', { matchCategories: true });
  const weaponNameIdList = weaponNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, weaponNameIdList, weaponNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizedNameList = <string[]>(
        genshindb.weapons('names', { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, weaponNameIdList, localizedNameList, outputDir);
    });
  }

  weaponNameList.forEach((weaponName) => {
    const weapon = <Weapon>genshindb.weapons(weaponName);
    const id = getId(weapon.name);
    const imgUrl = weapon.images.icon;
    const cost = weapon.costs.ascend6 || weapon.costs.ascend5 || weapon.costs.ascend4;
    const ascendMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, cost);

    const weaponData: WeaponData = {
      rarity: <Rarity>parseInt(weapon.rarity),
      url: weapon.url?.fandom,
      type: <WeaponType>weapon.weapontype,
      ascendMaterial: {
        weapon: ascendMaterial.weapon || '',
        elite: ascendMaterial.elite || '',
        common: ascendMaterial.common || '',
      },
    };

    weaponDataMap[id] = weaponData;

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${weaponName} with error: ${err}`);
      });
    }
  });

  writeFileSync(outputDataPath, JSON.stringify(weaponDataMap, null, 2));
}
