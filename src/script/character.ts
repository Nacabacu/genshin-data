import { writeFileSync } from 'fs';
import genshindb, { Character, Languages, Talent } from 'genshin-db';
import { CharacterData, Dictionary, Element, Rarity, WeaponType } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, downloadImage, findMaterialGroupMap, getId } from '../util';

const TYPE = 'character';
const FILTER_COST = ['mora'];
const TRAVELER_TALENT = ['Traveler (Anemo)', 'Traveler (Geo)', 'Traveler (Electro)'];

const characterDataMap: Dictionary<CharacterData> = {};

export function getCharacter(context: Context) {
  const { outputDir, isDownloadImage, materialGroupMap, materialGroupData } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

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
      TRAVELER_TALENT.forEach((talentName) => {
        const talent = <Talent>genshindb.talents(talentName);
        const talentMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, talent.costs.lvl9);
        const travelerId = getId(talentName);
        const characterData: CharacterData = {
          rarity: <Rarity>parseInt(character.rarity),
          url: character.url?.fandom,
          element: <Element>character.element,
          weaponType: <WeaponType>character.weapontype,
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

        characterDataMap[travelerId] = characterData;
      });
    } else if (id !== 'aether') {
      const talent = <Talent>genshindb.talents(characterName);
      const talentMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, talent.costs.lvl9);
      const characterData: CharacterData = {
        rarity: <Rarity>parseInt(character.rarity),
        url: character.url?.fandom,
        element: <Element>character.element,
        weaponType: <WeaponType>character.weapontype,
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

      characterDataMap[id] = characterData;
    }

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${characterName} with error: ${err}`);
      });
    }
  });

  writeFileSync(outputDataPath, JSON.stringify(characterDataMap, null, 2));
}
