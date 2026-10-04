'use strict';
const fs = require('fs');
const K = require('./kit');
const L = K.L;
const FILES = ['content_it1.js', 'content_it2.js'];
const OUT = process.env.OUT || (K.P ? 'it_phone.pptx' : 'it_land.pptx');
(async () => {
  const names = new Set();
  for (const f of [...FILES, 'kit.js', 'lib.js']) for (const m of fs.readFileSync(f, 'utf8').matchAll(/Fa[A-Z][A-Za-z0-9]+/g)) names.add(m[0]);
  const cols = ['FFFFFF', K.C.ink, ...Object.values(K.ROLE).map(r => r.d)];
  await L.initIcons([...names], cols);
  for (const f of FILES) require('./' + f)(K);
  const res = await L.finish(OUT);
  fs.writeFileSync((K.P ? 'it_phone' : 'it_land') + '_index.json', JSON.stringify(K.outIndex, null, 1));
  console.log((K.P ? 'phone' : 'land'), 'pages:', K.outIndex.length);
})().catch(e => { console.error(e); process.exit(1); });
