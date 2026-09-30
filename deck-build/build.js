'use strict';
const fs = require('fs');
const L = require('./lib');
const { C, ROLE } = L;
const PFX = process.env.PREFIX || '';
const FILES = (process.env.FILES ? process.env.FILES.split(',') : ['ch_ab.js', 'ch_cd.js', 'ch_e.js', 'ch_fgh.js', 'ch_ij.js', 'ch_kl.js']).filter(f => fs.existsSync(f));
const OUT = process.env.OUT || 'deck.pptx';
(async () => {
  // アイコンを事前描画（使用しているFa名をソースから収集）
  const names = new Set();
  for (const f of [...FILES, 'lib.js']) for (const m of fs.readFileSync(f, 'utf8').matchAll(/Fa[A-Z][A-Za-z0-9]+/g)) names.add(m[0]);
  const cols = ['FFFFFF', C.ink, ...Object.values(ROLE).map(r => r.d)];
  await L.initIcons([...names], cols);
  let ranges = {};
  try { ranges = JSON.parse(fs.readFileSync(PFX + 'ranges.json', 'utf8')); } catch (e) {}
  let ids = {};
  try { ids = JSON.parse(fs.readFileSync(PFX + 'ids.json', 'utf8')); } catch (e) {}
  const ctx = { ranges, ids, id: k => (ids[k] ? ids[k] : '?') };
  for (const f of FILES) require('./' + f)(L, ctx);
  const res = await L.finish(OUT);
  // 章ごとのスライド範囲を保存
  const circ = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫';
  const r2 = {};
  L.index.forEach(e => {
    const k = 'ABCDEFGHIJKL'[circ.indexOf(e.ch[0])];
    if (!k) return;
    r2[k] = r2[k] ? [r2[k][0], e.n] : [e.n, e.n];
  });
  fs.writeFileSync(PFX + 'ranges.json', JSON.stringify(r2));
  const ids2 = {};
  L.index.forEach(e => { if (e.id) ids2[e.id] = e.n; });
  fs.writeFileSync(PFX + 'ids.json', JSON.stringify(ids2));
  fs.writeFileSync(PFX + 'index.json', JSON.stringify(L.index, null, 1));
  console.log('slides:', L.index.length);
  console.log(res.warnings.length ? res.warnings.join('\n') : 'no fit warnings');
})().catch(e => { console.error(e); process.exit(1); });
