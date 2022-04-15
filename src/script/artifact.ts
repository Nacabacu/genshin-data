import { writeFileSync } from 'fs';
import genshindb, { Artifact, Languages } from 'genshin-db';
import { ArtifactData, Rarity } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, downloadImage, findMaxInArray, getId } from '../util';

const TYPE = 'artifacts';

const artifactDataList: ArtifactData[] = [];

export function getArtifact(context: Context) {
  const { outputDir, isDownloadImage } = context;

  const artifactNameList = <string[]>genshindb.artifacts('name', { matchCategories: true });
  const artifactIdList = artifactNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, artifactIdList, artifactNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizedNameList = <string[]>(
        genshindb.artifacts('names', { matchCategories: true, resultLanguage: language })
      );

      addLocalize(language, artifactIdList, localizedNameList, outputDir);
    });
  }

  artifactNameList.forEach((artifactName) => {
    const artifact = <Artifact>genshindb.artifacts(artifactName);
    const id = getId(artifact.name);
    const imgUrl = artifact.images.flower || artifact.images.circlet;
    const artifactData: ArtifactData = {
      id,
      rarity: <Rarity>findMaxInArray(artifact.rarity),
      url: artifact.url?.fandom,
    };

    artifactDataList.push(artifactData);

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${artifactName} with error: ${err}`);
      });
    }
  });

  writeFileSync(`${outputDir}/data/${TYPE}.json`, JSON.stringify(artifactDataList, null, 2));
}
