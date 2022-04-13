import genshindb from 'genshin-db';

const result = genshindb.materials('Local Specialty (Liyue)', { matchCategories: true });

console.log(result);
