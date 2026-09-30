# 教材PPTXの再生成手順

- `pptxgenjs`, `react`, `react-dom`, `react-icons`, `sharp` をインストール（`npm i pptxgenjs react react-dom react-icons sharp`）
- `node build.js` を2回実行すると `deck.pptx` が生成される（1回目はスライド番号の相互参照を `ids.json` に保存）
- 内容は `ch_*.js`（章ごと）、共通の図形・表・シーケンス図は `lib.js`、出典は `sources.json`（`parse_sources.py` で統合学習資料の末尾から生成）
- Q&Aを追記するときは、該当章の `ch_*.js` にスライドを足し、`src` に出典IDを指定する

## ブログ解説デッキ
`PREFIX=blog_ FILES=ch_blog1.js,ch_blog2.js,ch_blog3.js OUT=blog.pptx node build.js`（2回実行）
題名の下のリード文は `leads.json`（`make_leads.py` で生成）から読み込まれる。
