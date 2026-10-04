# 自習ガイド（it-infra-ai-self-study-guide）の生成ソース

- `ch/*.js`：章ごとのスライド定義（c00 はじめに〜c17 付録、c99 出典一覧・索引）
- `k3.js`：描画キット（pptxgenjs）。`build.js` が章ファイルを読み込んで PPTX を出力
- `build_all.sh`：全章をビルド（索引のページ番号を確定させるため2回実行）し、`check.js` で用語の初出順を検査
- `mk_map.py` / `mk_report.py`：元資料のページ対応表と変更点一覧を作成
- `STYLE.md`・`KIT.md`・`OUTLINE.md`：表記・図・章構成の約束
