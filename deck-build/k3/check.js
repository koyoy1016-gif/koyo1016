// 用語の初出検査： node check.js out_terms.json [plan.json 章番号]
const fs = require('fs');
const { terms, uses } = JSON.parse(fs.readFileSync(process.argv[2]));
const idx = JSON.parse(fs.readFileSync(process.argv[2].replace('_terms.json', '_index.json')));
const assumed = new Set();
if (process.argv[3]) {
  const plan = JSON.parse(fs.readFileSync(process.argv[3]));
  const upto = Number(process.argv[4] || 99);
  Object.entries(plan).forEach(([ch, list]) => { if (Number(ch) < upto) list.forEach(t => t.split('|').forEach(a => assumed.add(a))); });
}
const def = {};
let dup = 0;
terms.forEach(t => [t.t, ...(t.alias || [])].forEach(k => { if (def[k] && def[k].t !== t.t) { console.log(`同じ名前が別の用語に: ${k}`); } if (def[k] && def[k].t === t.t && k === t.t) { dup++; console.log(`重複定義: ${t.t} p${def[k].page} と p${t.page}`); } if (!def[k]) def[k] = t; }));
let miss = 0, late = 0;
const seen = new Set();
uses.forEach(u => {
  const key = u.term + '@' + u.page;
  if (seen.has(key)) return; seen.add(key);
  const d = def[u.term];
  if (!d) { if (!assumed.has(u.term)) { miss++; console.log(`未定義の青字：「${u.term}」 p${u.page}（${(idx[u.page - 1] || {}).id}）`); } return; }
  if (d.page > u.page) { late++; console.log(`定義より前に使用：「${u.term}」 使用p${u.page}（${(idx[u.page - 1] || {}).id}） 定義p${d.page}（${d.id}）${d.page - u.page <= 3 ? ' ※3ページ以内' : ''}`); }
});
const exNoMean = terms.filter(t => !t.mean);
exNoMean.forEach(t => console.log('意味が空：' + t.t));
console.log(`terms=${terms.length} uses=${uses.length} 未定義=${miss} 先行使用=${late} 重複=${dup}`);
