import { writeFileSync } from 'fs';
import genshindb, { Character, Languages, Talent } from 'genshin-db';
import { CharacterData, Context } from './types';
import { addLocalize, downloadImage, findMaterialGroupMapping, getId } from './util';

const TYPE = 'character';
const TRAVELER_TALENT = ['Traveler (Anemo)', 'Traveler (Geo)', 'Traveler (Electro)'];

const characterDataList: CharacterData[] = [];

export function getCharacter(context: Context) {
  const { outputDir, isDownloadImage, materialGroupMapping, materialGroupData } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

  const characterNameList = <string[]>genshindb.characters('name', { matchCategories: true });
  const characterIdList = characterNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, characterIdList, characterNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizeMaterialNameList = <string[]>(
        genshindb.characters('names', { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, characterIdList, localizeMaterialNameList, outputDir);
    });
  }

  characterNameList.forEach((characterName) => {
    const character = <Character>genshindb.characters(characterName);
    const id = getId(character.name);
    const imgUrl = character.images.icon;
    const ascendMaterial = findMaterialGroupMapping(materialGroupMapping, materialGroupData, character.costs.ascend6);

    if (id === 'aether') {
    } else if (id === 'lumine') {
      TRAVELER_TALENT.forEach((talentName) => {
        const talent = <Talent>genshindb.talents(talentName);
        const talentMaterial = findMaterialGroupMapping(materialGroupMapping, materialGroupData, talent.costs.lvl9);
        const characterData: CharacterData = {
          id: getId(talentName),
          rarity: character.rarity,
          url: character.url?.fandom,
          element: character.element,
          weapon: character.weapontype,
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
    } else {
      const talent = <Talent>genshindb.talents(characterName);
      const talentMaterial = findMaterialGroupMapping(materialGroupMapping, materialGroupData, talent.costs.lvl9);
      const characterData: CharacterData = {
        id,
        rarity: character.rarity,
        url: character.url?.fandom,
        element: character.element,
        weapon: character.weapontype,
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
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${characterName} with error: ${err}`);
      });
    }
  });

  writeFileSync(outputDataPath, JSON.stringify(characterDataList, null, 2));
}
