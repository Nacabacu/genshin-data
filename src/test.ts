import { writeFileSync } from 'fs';
import genshindb, { Languages } from 'genshin-db';

const data: any[] = [];
// const result = <string[]>genshindb.artifacts('name', {
//   matchCategories: true,
// });
// result.forEach((name) => {
//   const item = <genshindb.Artifact>genshindb.artifacts(name);

//   data.push(item);
// });

const result = <string[]>genshindb.domains('name', {
  matchCategories: true,
});
result.forEach((name) => {
  const item = <genshindb.Domain>genshindb.domains(name);

  data.push(item);
});

console.log(data);
writeFileSync('./test.json', JSON.stringify(data, null, 2));
