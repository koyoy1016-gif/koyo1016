# 描画キット k3 の使い方

作業ディレクトリ：`/tmp/claude-0/-home-user-koyo1016/a6b71c9c-9250-5393-acfd-c0ce241855e4/scratchpad/k3/`

## ファイル
- 担当章のファイル `ch/cNN.js`（例 `ch/c05.js`）を作る。中身：
```js
module.exports = function ({ slide, B }) {
  slide({ ... });
  slide({ ... });
};
```
- ビルドと検査（担当章だけ）：
```
FILES=ch/c05.js OUT=out/c05.pptx node build.js          # 警告（⚠）を全部なくす
node check.js out/c05_terms.json terms_plan.json 5      # 青字用語の未定義・先行使用を確認（5＝自分の章番号）
python3 render.py out/c05.pptx c05                      # img/c05-01.png… に画像を書き出す
python3 pick.py c05 C05_A 2 1 2 3 4 5 6                 # 6枚を1枚に並べた確認用画像 img/C05_A.png
```
- 画像を Read ツールで見て、文字切れ・重なり・図の誤接続がないか必ず目で確認する（全ページ）。

## slide の項目
```js
slide({
  id: 'c05-03',             // 必須。c＋章2桁＋連番
  ch: 5,                    // 章番号（chapters.json）
  title: '…',               // 1行目標（約26字以内）、最大2行
  lead: '…',                // 任意。1〜2行（22pt）
  kind: '技術説明',          // 情報の区分（右上の札）
  src: ['S14', 'S78'],       // 出典ID
  orig: [67, 68],            // 元資料のページ（新規の基礎説明は []）
  terms: [{ t:'主キー', alias:['primary key'], read:'しゅきー', abbr:'', full:'', mean:'表の中で1行を特定するための値', exam:true }], // 任意。def カード以外で用語を登録するとき
  fix: '元資料の誤りの修正内容',  // 任意
  vcenter: false,            // true で本文を上下中央に
  blocks: [ ... ],           // 上から順に積む
  notes: '…',               // 任意（補足だけ。必要な説明は本文に）
});
slide({ id:'c05-00', type:'chapter', ch:5, blocks:[ B.box('key', '…', {title:'この章で学ぶこと'}), B.box('next', '…', {title:'前の章とのつながり'}) ] });
slide({ id:'c05-29', ch:5, title:'確認の問い', quiz:[ { q:'…', a:'…' }, ... ] });  // 問いページ＋解説ページの2枚になる（解説ページIDは c05-29-ans）
```

## 文字の書き方
- `**太字**`、`{重点用語}`（濃い青。資料全体の初出だけ太字）、`[[p:c02-05]]`（参照→ p.番号）、改行は `\n`。
- `{}` の中は登録済みの用語名か alias と完全に一致させる。

## ブロック（B.xxx）
| 書き方 | 用途 |
|---|---|
| `B.p('文章')` / `B.p(['段落1','段落2'])` | 本文（22pt）。`{size:20}` で小さく（20未満にしない） |
| `B.ul(['…','…'])`、項目を `{t:'…', sub:['…']}` にすると子項目 | 箇条書き |
| `B.num(['…','…'])` | 番号つきの手順（縦） |
| `B.flow([ '…', {t:'見出し', d:'説明'} ])` | 横に並んだ手順の箱と矢印（20pt）。4〜5個まで |
| `B.box(kind, '文章', {title:'…'})` | 囲み。kind：key（ポイント）/ analogy（たとえ）/ limit（たとえの限界）/ caution（注意）/ info（補足）/ example（具体例）/ assume（説明用の例）/ check（ここまでで説明できること）/ next（次へのつながり）/ diff（似た言葉との違い）/ why（なぜ必要か）。text は配列で複数段落 |
| `B.def({ term, read, abbr, full, ja, cat, what, why, where, io, ex, diff, mean, exam, alias })` | 用語カード。cat は 機械/部品/ソフトウェア/データ/役割/通信の約束/サービス/考え方/指標/場所・施設/活動/製品/会社/記号/仕組み。exam:false なら青にしない。自動で索引に登録（mean が無ければ what を使う） |
| `B.table(head, rows, { widths:[2,3,3], size:20, split:true })` | 表。セルは文字列か `{t:'…', bold, fill:'FFF4E5', color}`。split:true で収まらない行を次ページへ自動分割（表は1ページ1つまで） |
| `B.cards([{ title, text, items:[…], kind:'machine', icon:'FaServer' }, …])` | 横並びのカード（比較・分類）。kind は図の形と同じ色名 |
| `B.code(['SELECT …','FROM …'], ['日本語訳1','日本語訳2'], {title:'SQL'})` | コード（等幅）と右側に行ごとの日本語訳 |
| `B.layers([{ t:'アプリ', d:'説明', kind:'software' }, …], { hl:[0] })` | 層の図（上から）。hl で強調する段の番号 |
| `B.zoom(at, steps)` | 「今見ている範囲」の表示。既定の steps ＝ 本体の外観／マザーボード／CPU／コア／コアの中。at は 0〜4 |
| `B.fig({ w, h, nodes:[…], edges:[…], cap:'図の見方', simple:true, example:true })` | 座標で描く図（単位インチ。w は最大 12.23） |
| `B.seq(actors, msgs, {rowH:0.6})` | 時間順のやり取り図。actors＝`[{t:'スマホ', d:'佐藤さん', kind:'machine'}, …]`、msgs＝`[{from:0,to:1,n:'①',text:'…'}, {from:1,to:0,n:'②',text:'…',ret:true}, {from:2,to:2,text:'自分の中の処理'}, {…, aux:true}]` |
| `B.h('小見出し')` | 区切り線つき小見出し |
| `B.row([ [ブロック…], [ブロック…] ], { ratio:[1,1], valign:'middle' })` | 左右に並べる（中は普通のブロックの配列） |
| `B.space(0.2)` | すき間 |

### 図（fig）の node と edge
```js
nodes: [
  { id:'pc', k:'machine', x:0, y:1, w:2.4, h:1.1, t:'PC', d:'192.168.1.20', icon:'FaDesktop' },
  { id:'home', k:'place', x:-0.1, y:0, w:6, h:3, t:'家の中' },          // 背景の枠（先に描かれる）
  { id:'r', k:'role', big:true, x:..., t:'DBサーバー（役割）' },        // 役割の枠
  { id:'n1', k:'label', x:..., t:'文字だけ', size:16, align:'left' },
  { id:'c', k:'chip', x:..., w:1.6, h:0.34, t:'札' },
  { id:'cpu', k:'part', ..., hl:true },                                    // 黄色の太枠で強調
  { id:'d', k:'db', ... }, { id:'f', k:'data', ... }, { id:'u', k:'person', icon:'FaUser' },
]
edges: [
  { k:'cable', a:'pc', b:'sw' },                       // 自動で近い辺どうしを結ぶ
  { k:'flow', a:'pc', b:'srv', t:'注文履歴を見せて', n:1 },   // ラベルと番号
  { k:'ret', a:'srv', b:'pc', t:'ページを返す', n:2, off:0.2 },  // off：平行線をずらす
  { k:'aux', a:'pc', b:'dns', t:'名前を問い合わせ' },
  { k:'flow', a:'x', b:'y', as:'b', bs:'t' },          // 出る辺・入る辺を指定（r/l/t/b）
  { k:'flow', pts:[[1,1],[1,2],[3,2]], t:'…', lx:2, ly:1.8 },  // 折れ線（座標）。lx,ly＝ラベル位置
]
```
- 図の座標は fig の左上が (0,0)。fig の w（最大12.23）× h（ページの残りの高さ以内。タイトル1行・leadなし・cap 1行なら h は最大約5.0）。
- node の文字は18pt（`size` で変更、16未満にしない）。d（2行目）は16pt。箱に収まらないとビルドが ⚠ を出す。
- 同じ2つの箱の間の行きと帰りは `off: ±0.15` でずらすか、別の辺を使う。
- ラベルは線の中点に白地で置かれる。重なるときは `lx, ly` で動かす。

## 高さの目安（1ページ）
- 本文の領域は、タイトル1行・lead なしで y≈1.35〜6.92（約5.5インチ）。lead 1行で約5.1インチ。
- 22pt の本文1行 ≈ 0.40インチ。全幅（12.2インチ）で1行 約28字。左右2段（各6インチ）なら1行 約13字。
- ビルドの ⚠ OVERFLOW / FIT / FIG が出たら、文字を削るのではなくページを分ける（または図を小さく）。

## 使えるアイコン
react-icons/fa（Font Awesome 5）の名前。例：FaServer FaDesktop FaLaptop FaMobileAlt FaHdd FaMemory FaMicrochip FaWifi FaNetworkWired FaGlobe FaCloud FaDatabase FaCogs FaUser FaUsers FaBuilding FaHome FaLock FaKey FaShieldAlt FaFileAlt FaTable FaSearch FaBolt FaFan FaPlug FaThermometerHalf FaRoute FaExchangeAlt FaClock FaCalculator FaLayerGroup FaBoxes FaCube FaRobot FaBrain FaChartLine FaTools FaClipboardCheck FaBook FaGraduationCap FaYenSign FaIndustry FaUniversity FaGamepad FaBroadcastTower FaSimCard FaSitemap FaProjectDiagram。
存在確認：`node -e "console.log(!!require('react-icons/fa').FaServer)"`

## 統合時の追加（21:30）
- `**{用語}**` が使えるようになりました。表の見出し行の `{用語}` は白字になります。
- box の見出しは長いと2行に折り返します（確認の問いの解説見出しは60字まで）。
- def の左欄ラベルは折り返して行の高さに反映します（「受け取る→する→返す」も使えます）。
- B.flow / steps flow に `start: 番号` を指定できます。
- fig の machine に `big: true` を付けると、線より先に描く入れ物になります（左上に名前）。
- 文字の高さの見積もりで、英数字の単語を途中で折らない計算にしました。
