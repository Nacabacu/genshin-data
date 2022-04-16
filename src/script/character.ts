import { writeFileSync } from 'fs';
import genshindb, { Character, Languages, Talent } from 'genshin-db';
import { CharacterData, Element, Rarity, WeaponType } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, downloadImage, findMaterialGroupMap, getId } from '../util';

const TYPE = 'characters';
const FILTER_COST = ['mora'];
const TRAVELER_TYPE = ['Traveler (Anemo)', 'Traveler (Geo)', 'Traveler (Electro)'];

const characterDataList: CharacterData[] = [];

export function getCharacter(context: Context) {
  const { outputDir, isDownloadImage, materialGroupMap, materialData: materialGroupData } = context;

  const characterNameList = <string[]>genshindb.characters('name', { matchCategories: true });
  const characterIdList = characterNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, characterIdList, characterNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizedNameList = <string[]>(
        genshindb.characters('names', { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, characterIdList, localizedNameList, outputDir);
    });
  }

  characterNameList.forEach((characterName) => {
    const character = <Character>genshindb.characters(characterName);
    const id = getId(character.name);
    const imgUrl = character.images.icon;
    const filteredCost = character.costs.ascend6.filter((item) => !FILTER_COST.includes(getId(item.name)));
    const ascendMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, filteredCost);

    if (id === 'lumine') {
      TRAVELER_TYPE.forEach((tavelerType) => {
        const talent = <Talent>genshindb.talents(tavelerType);
        const talentMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, talent.costs.lvl9);
        const travelerId = getId(tavelerType);
        const elementMatch = /\((.+)\)/.exec(tavelerType);
        const element = elementMatch ? elementMatch[1] : character.element;
        const characterData: CharacterData = {
          id: travelerId,
          rarity: <Rarity>parseInt(character.rarity),
          url: character.url?.fandom,
          element: <Element>getId(element),
          weaponType: <WeaponType>getId(character.weapontype),
          ascendMaterial: {
            gem: ascendMaterial.gem || '',
            boss: ascendMaterial.boss || '',
            common: ascendMaterial.common || '',
            local: ascendMaterial.local || '',
          },
          talentMaterial: {
            common: talentMaterial.common || '',
            book: talentMaterial.book || '',
            weeklyBoss: talentMaterial.weeklyBoss || '',
          },
        };

        characterDataList.push(characterData);
      });
    } else if (id !== 'aether') {
      const talent = <Talent>genshindb.talents(characterName);
      const talentMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, talent.costs.lvl9);
      const characterData: CharacterData = {
        id,
        rarity: <Rarity>parseInt(character.rarity),
        url: character.url?.fandom,
        element: <Element>getId(character.element),
        weaponType: <WeaponType>getId(character.weapontype),
        ascendMaterial: {
          gem: ascendMaterial.gem || '',
          boss: ascendMaterial.boss || '',
          common: ascendMaterial.common || '',
          local: ascendMaterial.local || '',
        },
        talentMaterial: {
          common: talentMaterial.common || '',
          book: talentMaterial.book || '',
          weeklyBoss: talentMaterial.weeklyBoss || '',
        },
      };

      characterDataList.push(characterData);
    }

    if (isDownloadImage) {
      if (id === 'lumine') {
        TRAVELER_TYPE.forEach((travelerType) => {
          downloadImage(imgUrl, outputDir, TYPE, getId(travelerType)).catch((err) => {
            console.log(`Cannot download image for ${TYPE} name: ${characterName} with error: ${err}`);
          });
        });
      } else if (id !== 'aether') {
        downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
          console.log(`Cannot download image for ${TYPE} name: ${characterName} with error: ${err}`);
        });
      }
    }
  });

  writeFileSync(`${outputDir}/data/${TYPE}.json`, JSON.stringify(characterDataList, null, 2));
}
