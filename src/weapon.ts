import { writeFileSync } from 'fs';
import genshindb, { Languages, Weapon } from 'genshin-db';
import { Context, WeaponData } from './types';
import { addLocalize, downloadImage, findMaterialGroupMapping, getId } from './util';

const TYPE = 'weapon';

const weaponDataList: WeaponData[] = [];

export function getWeapon(context: Context) {
  const { outputDir, isDownloadImage, materialGroupMapping, materialGroupData } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  const weaponNameList = <string[]>genshindb.weapons('name', { matchCategories: true });
  const weaponNameIdList = weaponNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, weaponNameIdList, weaponNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizeMaterialNameList = <string[]>(
        genshindb.weapons('names', { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, weaponNameIdList, localizeMaterialNameList, outputDir);
    });
  }

  weaponNameList.forEach((weaponName) => {
    const weapon = <Weapon>genshindb.weapons(weaponName);
    const id = getId(weapon.name);
    const imgUrl = weapon.images.icon;
    const cost = weapon.costs.ascend6 || weapon.costs.ascend5 || weapon.costs.ascend4;
    const ascendMaterial = findMaterialGroupMapping(materialGroupMapping, materialGroupData, cost);

    const weaponData: WeaponData = {
      id,
      rarity: weapon.rarity,
      url: weapon.url?.fandom,
      type: weapon.weapontype,
      ascendMaterial: {
        weapon: ascendMaterial.weapon || '',
        elite: ascendMaterial.elite || '',
        common: ascendMaterial.common || '',
      },
    };

    weaponDataList.push(weaponData);

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${weaponName} with error: ${err}`);
      });
    }
  });

  writeFileSync(outputDataPath, JSON.stringify(weaponDataList, null, 2));
}
