import genshindb, { Languages } from 'genshin-db';

const result = genshindb.materials('Local Specialty (Liyue)', {
  resultLanguage: Languages.English,
  matchCategories: true,
});

const result2 = genshindb.materials('Local Specialty (Liyue)', {
  resultLanguage: Languages.Thai,
  matchCategories: true,
});

const result3 = genshindb.materials('Local Specialty (Liyue)', {
  resultLanguage: Languages.Japanese,
  matchCategories: true,
});

console.log(result);
console.log(result2);
console.log(result3);
