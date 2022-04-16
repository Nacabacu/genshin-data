import { writeFileSync } from 'fs';
import genshindb, { Domain, Languages, Rewards } from 'genshin-db';
import { Dictionary, DomainData, Region } from '../types/data';
import { Context } from '../types/types';
import { addLocalize, getId } from '../util';
import { Day, DomainType } from './../types/data.d';

const TYPE = 'domains';
const FILTER_REWARD = ['adventure_exp', 'mora', 'companionship_exp'];

const domainDataMap: Dictionary<DomainData> = {};
const domainDataList: DomainData[] = [];

export function getDomain(context: Context) {
  const { outputDir } = context;

  const domainNameList = <string[]>genshindb.domains('name', { matchCategories: true });
  const normalizedDomainNameList = normalizeNamelist(domainNameList);
  const domainIdList = normalizedDomainNameList.map((mat) => getId(mat));

  addLocalize(Languages.English, domainIdList, normalizedDomainNameList, outputDir);

  if (context.languages) {
    context.languages.forEach((language) => {
      const localizedNameList = <string[]>(
        genshindb.domains('names', { matchCategories: true, resultLanguage: language })
      );
      const normalizedNameList = normalizeNamelist(localizedNameList);

      addLocalize(language, domainIdList, normalizedNameList, outputDir);
    });
  }

  domainNameList.forEach((domainName) => {
    const domain = <Domain>genshindb.domains(domainName);
    const id = getId(removeDomainNameSuffix(domain.name));

    if (domainDataMap[id]) {
      const existDomainData = domainDataMap[id];
      const currentReward = formatReward(domain.rewardpreview);

      existDomainData.reward = [...existDomainData.reward, ...currentReward].filter(filterDuplicate);
    } else {
      const domainData: DomainData = {
        id,
        region: <Region>getId(domain.region),
        type: <DomainType>getId(domain.domaintype),
        daysofweek: <Day[]>domain.daysofweek?.map((day) => getId(day)),
        reward: formatReward(domain.rewardpreview),
      };
      domainDataMap[id] = domainData;
    }
  });

  domainDataList.push(...Object.keys(domainDataMap).map((key) => domainDataMap[key]));

  writeFileSync(`${outputDir}/data/${TYPE}.json`, JSON.stringify(domainDataList, null, 2));
}

function formatReward(rewardList: Rewards[]): string[] {
  return rewardList
    .map((reward) => getId(reward.name))
    .filter(filterDuplicate)
    .filter(filterReward);
}

function normalizeNamelist(nameList: string[]) {
  return nameList.map(removeDomainNameSuffix).filter(filterDuplicate);
}

function filterDuplicate<T>(elem: T, index: number, self: T[]): boolean {
  return index === self.indexOf(elem);
}

function filterReward<T>(item: string) {
  return !FILTER_REWARD.includes(item);
}

function removeDomainNameSuffix(name: string) {
  const regex = /(.+) [IXV]+/g.exec(name);

  if (!regex) return name;

  return regex[1];
}
