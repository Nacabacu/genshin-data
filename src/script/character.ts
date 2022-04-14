import { writeFileSync } from 'fs';
import genshindb, { Character, Languages, Talent } from 'genshin-db';
import { CharacterData, Context, Dictionary } from '../types';
import { addLocalize, downloadImage, findMaterialGroupMap, getId } from '../util';

const TYPE = 'character';
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
    const ascendMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, character.costs.ascend6);

    if (id === 'lumine') {
      TRAVELER_TALENT.forEach((talentName) => {
        const talent = <Talent>genshindb.talents(talentName);
        const talentMaterial = findMaterialGroupMap(materialGroupMap, materialGroupData, talent.costs.lvl9);
        const travelerId = getId(talentName);
        const characterData: CharacterData = {
          rarity: character.rarity,
          url: character.url?.fandom,
          element: character.element,
          weaponType: character.weapontype,
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
        rarity: character.rarity,
        url: character.url?.fandom,
        element: character.element,
        weaponType: character.weapontype,
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
