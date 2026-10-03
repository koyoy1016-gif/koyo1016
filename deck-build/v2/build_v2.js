'use strict';
process.env.LEADS = '_none.json';
const fs = require('fs');
const K = require('./kit');
const L = K.L;
const OUT = process.env.OUT || (K.P ? 'v2_phone.pptx' : 'v2_land.pptx');
(async () => {
  const names = new Set();
  const files = ['content_v2.js', 'content_v2a.js', 'content_v2b.js', 'content_it1.js', 'content_it2.js', 'kit.js', 'lib.js'].concat(['a', 'b', 'c', 'd', 'e'].map(x => 'terms_' + x + '.js'));
  for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/Fa[A-Z][A-Za-z0-9]+/g)) names.add(m[0]);
  const cols = ['FFFFFF', K.C.ink, ...Object.values(K.ROLE).map(r => r.d)];
  await L.initIcons([...names], cols);
  require('./content_v2.js')(K);
  await L.finish(OUT);
  fs.writeFileSync((K.P ? 'v2_phone' : 'v2_land') + '_index.json', JSON.stringify(K.outIndex, null, 1));
  console.log((K.P ? 'phone' : 'land'), 'pages:', K.outIndex.length);
})().catch(e => { console.error(e); process.exit(1); });
