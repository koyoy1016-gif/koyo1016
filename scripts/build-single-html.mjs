// 使い方: node scripts/build-single-html.mjs <出力パス>
// 画像を含むすべてのアセットをJS/CSSへ埋め込み、1つのHTML断片にまとめる（Artifact等の単一ファイル配布用）
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'dist/facelab-single.html';
const tmp = 'dist-single';

rmSync(tmp, { recursive: true, force: true });
execSync('npx vite build', {
  stdio: 'inherit',
  env: { ...process.env, FACELAB_INLINE: '1', FACELAB_OUTDIR: tmp },
});

const assets = readdirSync(join(tmp, 'assets'));
const cssFile = assets.find((f) => f.endsWith('.css'));
const jsFile = assets.find((f) => f.endsWith('.js'));
const others = assets.filter((f) => f !== cssFile && f !== jsFile);
if (others.length > 0) console.warn('埋め込まれなかったアセット:', others.join(', '));

const css = readFileSync(join(tmp, 'assets', cssFile), 'utf8');
const js = readFileSync(join(tmp, 'assets', jsFile), 'utf8').replace(/<\/script/gi, '<\\/script');

const html = `<title>FACE LAB</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(out, html);
rmSync(tmp, { recursive: true, force: true });
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
