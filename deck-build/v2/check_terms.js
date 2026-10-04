// 用語データの検査： node check_terms.js terms_x.js [more.js ...]
const fa = require('react-icons/fa');
const idx = require('./terms_index.json');
const IDS = new Set(idx.map(o => o.id));
const LAY = new Set(['hw', 'os', 'virt', 'mw', 'app', 'net', 'cloud', 'act']);
let err = 0, warn = 0;
const E = (id, m) => { err++; console.log('  ERROR [' + id + '] ' + m); };
const W = (id, m) => { warn++; console.log('  warn  [' + id + '] ' + m); };
const len = s => [...String(s)].length;
const LIM = { one: [15, 60], ana: [30, 110], scene: [30, 110], where: [10, 60], warn: [20, 110], learn: [20, 100], quote: [0, 200] };
const files = process.argv.slice(2);
const seen = new Set();
files.forEach(f => {
  const arr = require(require('path').resolve(f));
  console.log(f, arr.length, 'terms');
  arr.forEach(t => {
    const id = t.id || '(noid)';
    if (!IDS.has(id)) E(id, '不明なid'); if (seen.has(id)) E(id, '重複'); seen.add(id);
    const meta = idx.find(o => o.id === id);
    if (meta) { if (t.term !== meta.name) W(id, `term名が索引(${meta.name})と違う: ${t.term}`); if (t.ch !== meta.ch) E(id, 'ch不一致'); }
    ['term', 'read', 'icon', 'one', 'what', 'ana', 'scene', 'where', 'learn', 'rel'].forEach(k => { if (t[k] == null || t[k] === '') E(id, '必須項目なし: ' + k); });
    if (t.icon && !fa[t.icon]) E(id, 'react-icons/faに無いアイコン: ' + t.icon);
    if (!Array.isArray(t.lay) || !t.lay.length || t.lay.some(l => !LAY.has(l))) E(id, 'layが不正');
    if (!Array.isArray(t.what) || t.what.length < 2 || t.what.length > 4) E(id, 'whatは2〜4段落の配列');
    else { t.what.forEach((p, i) => { const n = len(p); if (n > 170) E(id, `what[${i}]が長すぎる(${n})`); else if (n < 40) W(id, `what[${i}]が短い(${n})`); }); const tot = t.what.reduce((a, p) => a + len(p), 0); if (tot > 380) E(id, `whatの合計が長すぎる(${tot}>380)`); else if (tot > 340) W(id, `whatの合計がやや長い(${tot}>340)`); else if (tot < 150) W(id, `whatの合計が短い(${tot}<150)`); }
    Object.entries(LIM).forEach(([k, [lo, hi]]) => { if (t[k] == null) return; const n = len(t[k]); if (n > hi) E(id, `${k}が長すぎる(${n}>${hi})`); else if (n < lo) W(id, `${k}が短い(${n}<${lo})`); });
    if (Array.isArray(t.rel)) {
      if (t.rel.length < 3 || t.rel.length > 5) E(id, 'relは3〜5個');
      t.rel.forEach((r, i) => {
        if (!r.label || len(r.label) > 7) E(id, `rel[${i}].labelが無い/7字超`);
        if (!['out', 'in', 'both'].includes(r.dir)) E(id, `rel[${i}].dirが不正`);
        if (r.to && !IDS.has(r.to)) E(id, `rel[${i}].toが不明なid: ${r.to}`);
        if (!r.to && !(r.t && len(r.t) <= 12)) E(id, `rel[${i}]は to か t(12字以内) が必要`);
        if (r.to === id) E(id, 'relが自分自身');
      });
    }
    if (/[<>]/.test(JSON.stringify(t))) W(id, '< > を含む');
  });
});
console.log(`done: ${seen.size} terms, ${err} errors, ${warn} warnings`);
process.exit(err ? 1 : 0);
