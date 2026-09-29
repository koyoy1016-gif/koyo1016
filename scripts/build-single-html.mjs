// 使い方: npm run build && node scripts/build-single-html.mjs <出力パス>
// dist の JS/CSS を1つのHTML断片にまとめる（Artifact等、単一ファイル配布用）
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'dist/facelab-single.html';
const assets = readdirSync('dist/assets');
const css = readFileSync(join('dist/assets', assets.find((f) => f.endsWith('.css'))), 'utf8');
const js = readFileSync(join('dist/assets', assets.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script');

const html = `<title>FACE LAB</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
