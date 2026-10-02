# 教材PPTXの再生成手順

- `pptxgenjs`, `react`, `react-dom`, `react-icons`, `sharp` をインストール（`npm i pptxgenjs react react-dom react-icons sharp`）
- `node build.js` を2回実行すると `deck.pptx` が生成される（1回目はスライド番号の相互参照を `ids.json` に保存）
- 内容は `ch_*.js`（章ごと）、共通の図形・表・シーケンス図は `lib.js`、出典は `sources.json`（`parse_sources.py` で統合学習資料の末尾から生成）
- Q&Aを追記するときは、該当章の `ch_*.js` にスライドを足し、`src` に出典IDを指定する

## ブログ解説デッキ
`PREFIX=blog_ FILES=ch_blog1.js,ch_blog2.js,ch_blog3.js OUT=blog.pptx node build.js`（2回実行）
題名の下のリード文は `leads.json`（`make_leads.py` で生成）から読み込まれる。

## IT用語ガイド（PC版・スマホ版）
質問票の用語集を、図・表・たとえ付きで解説するデッキ。同じ内容（`content_it1.js`, `content_it2.js`）を、描画キット `kit.js` が横長（PC）／縦長（スマホ）に描き分ける。
- PC版（横長16:9、89枚）：`node build_it.js` → `it_land.pptx`
- スマホ版（縦長6×12インチ、152ページ。内容が収まらない場合は自動で複数ページに分割）：`ORIENT=port node build_it.js` → `it_phone.pptx`
- `kit.js` が `lib.js` を読み込む（同じ `node_modules`：`pptxgenjs`, `react`, `react-dom`, `react-icons`, `sharp`）
- 用語を足すときは、該当章の `termSlide(...)` に行（`term, read, icon, what, ex, use, learn`、補足は `sup: true`）を追加する
