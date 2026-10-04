'use strict';
const fs = require('fs');
const K3 = require('./k3');
const CH = require('./chapters.json');
const files = (process.env.FILES || 'sample.js').split(',');
(async () => {
  const names = new Set(['FaKey','FaLightbulb','FaExclamationCircle','FaExclamationTriangle','FaInfoCircle','FaClipboardList','FaFlask','FaCheckCircle','FaArrowRight','FaBalanceScale','FaQuestionCircle']);
  for (const f of files.concat(['k3.js'])) for (const m of fs.readFileSync(f, 'utf8').matchAll(/Fa[A-Z][A-Za-z0-9]+/g)) names.add(m[0]);
  await K3.initIcons([...names]);
  for (const f of files) require('./' + f)(K3);
  const r = await K3.build(process.env.OUT || 'sample.pptx', CH);
  fs.writeFileSync((process.env.OUT || 'sample.pptx').replace('.pptx', '_index.json'), JSON.stringify(r.pages.map((p, i) => ({ n: i + 1, id: p.id, ch: p.ch, title: p.title, orig: p.orig || [], src: p.src || [], def: p.def || [], use: p.use || [], kind: p.kind || '', fix: p.fix || '' })), null, 1));
  fs.writeFileSync((process.env.OUT || 'sample.pptx').replace('.pptx', '_terms.json'), JSON.stringify({ terms: r.terms, uses: r.termUse }, null, 1));
  r.warnings.forEach(w => console.log('  ⚠ ' + w));
  console.log('pages:', r.pages.length);
})().catch(e => { console.error(e); process.exit(1); });
