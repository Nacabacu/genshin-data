import { writeFileSync } from 'fs';
import genshindb, { Artifact, Languages } from 'genshin-db';
import { ArtifactData, Context } from '../types';
import { addLocalize, downloadImage, findMaxInArray, getId } from '../util';

const TYPE = 'artifact';

const artifactDataList: ArtifactData[] = [];

export function getArtifact(context: Context) {
  const { outputDir, isDownloadImage } = context;
  const outputDataPath = `${outputDir}/${TYPE}.json`;

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
      rarity: findMaxInArray(artifact.rarity).toString(),
      url: artifact.url?.fandom,
    };

    artifactDataList.push(artifactData);

    if (isDownloadImage) {
      downloadImage(imgUrl, outputDir, TYPE, id).catch((err) => {
        console.log(`Cannot download image for ${TYPE} name: ${artifactName} with error: ${err}`);
      });
    }
  });

  writeFileSync(outputDataPath, JSON.stringify(artifactDataList, null, 2));
}
