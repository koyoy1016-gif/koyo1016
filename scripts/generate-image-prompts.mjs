// 使い方: npm run prompts  → docs/IMAGE_PROMPTS.md を再生成
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const mod = await server.ssrLoadModule('/src/data/imageAssets.ts');
const chars = (await server.ssrLoadModule('/src/data/characters.ts')).characterById;
const { STATE_DEFS, IMAGE_ASSETS, buildPrompt } = mod;

const lines = [];
lines.push('# FACE LAB 画像制作リスト・プロンプト集');
lines.push('');
lines.push('`npm run prompts` で `src/data/imageAssets.ts` から自動生成されます（手で編集しないでください）。');
lines.push('');
lines.push('## 使い方');
lines.push('');
lines.push('1. 人物ごとに **`{ID}_base`** を最初に1枚生成し、目視で確認する（独立したテキスト生成を繰り返して「同一人物」とみなさない）。');
lines.push('2. 他の状態は、その基準画像を**編集対象**として、下の「編集用プロンプト」で生成する。マスク等が使える場合は、変更してよい範囲以外を固定する。');
lines.push('3. 生成した画像を `src/assets/faces/{stateId}.webp`（png/jpg 可）として置くと、アプリが自動で差し替える。置かれていない間は「画像準備中」の開発表示になる。');
lines.push('4. 仕様12.9の確認項目（同一人物か／変更部位以外が保たれているか／表情・角度・照明が一致するか／希望超過が人格の否定になっていないか／皮膚色を評価していないか／画像の変化と解説が一致するか／生成物の表示があるか）を目視で確認する。髪型・鼻・目・年齢などに意図しない変化があれば不採用。');
lines.push('5. 量の数字（mL・U）をプロンプトに入れても正確な術後像にはならない。画像は「AI生成・架空の変化例」であり、実患者の症例写真・効果の証明として扱わない。');
lines.push('');
lines.push(`## 必要画像一覧（正面・${STATE_DEFS.length}枚）`);
lines.push('');
lines.push('| 状態ID（ファイル名） | 人物 | 表情 | 種別 | 現在の状態 |');
lines.push('|---|---|---|---|---|');
for (const d of STATE_DEFS) {
  const a = IMAGE_ASSETS.find((x) => x.stateId === d.stateId);
  const c = chars.get(d.characterId);
  lines.push(`| \`${d.stateId}.webp\` | ${c.id} ${c.nameJa}（${c.age}歳） | ${d.expression} | ${d.kind === 'base' ? '基準（新規生成）' : '編集'} | ${a.status === 'planned' ? '未生成（画像準備中）' : '配置済み'} |`);
}
lines.push('');
lines.push('※ 仕様12.8は「初期10人×4状態＝40枚」を想定しています。現在のケース設計で実際に使う状態は上記のとおりで、ケース追加・経過画像（直後／回復途中／落ち着いた後）・左右45度・横顔は今後の追加分です。変更を見送るケースは同じ基準画像を再利用します。');
lines.push('');
lines.push('## プロンプト');
for (const d of STATE_DEFS) {
  const c = chars.get(d.characterId);
  lines.push('');
  lines.push(`### ${d.stateId}　（${c.nameJa}／${d.timeLabelJa}）`);
  lines.push('');
  lines.push(`- 用途表示: 「AI生成・架空の変化例」／代替テキスト: ${d.altJa}`);
  lines.push(`- 種別: ${d.kind === 'base' ? '基準人物の生成（12.2）' : `編集（12.3）。編集対象: \`${d.characterId}_base\``}`);
  lines.push('');
  lines.push('```text');
  lines.push(buildPrompt(d));
  lines.push('```');
}
writeFileSync('docs/IMAGE_PROMPTS.md', lines.join('\n') + '\n');
await server.close();
console.log(`wrote docs/IMAGE_PROMPTS.md (${STATE_DEFS.length} states)`);
