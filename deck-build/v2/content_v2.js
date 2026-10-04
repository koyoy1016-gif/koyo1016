'use strict';
// IT用語ガイド v2：用語データ（glossary）＋旧版の図・表スライドを章ごとに並べる
module.exports = function (K) {
  const L = K.L;
  const N = L.N;
  const G = require('./glossary.js');
  const CH = ['① はじめに', '② ストレージ', '③ データベース', '④ アプリケーションサーバー', '⑤ 仮想化・コンテナ', '⑥ クラウド', '⑦ 研究・独学', '⑧ 発表・学会', '⑨ IT資格', '⑩ その他のIT経験', '⑪ リモート就業環境', '⑫ まとめ'];
  K.setGlossary(G, CH);
  const old = {};
  const KK = { ...K, slideDef: d => { old[d.id] = d; }, cover() {} };
  require('./content_it1.js')(KK);
  require('./content_it2.js')(KK);
  const used = new Set();
  const emit = (id, patch) => { if (!old[id]) throw new Error('旧スライドがありません: ' + id); K.slideDef({ ...old[id], ...(patch || {}) }); };
  const byId = Object.fromEntries(G.map(t => [t.id, t]));
  const T = ids => ids.forEach(id => { if (!byId[id]) throw new Error('用語がありません: ' + id); if (used.has(id)) throw new Error('用語の重複: ' + id); used.add(id); K.termDef(byId[id]); });
  const X = { N, emit, T, CH, LAYERS: K.LAYERS, G };
  require('./content_v2a.js')(K, X);
  require('./content_v2b.js')(K, X);
  const missing = G.filter(t => !used.has(t.id)).map(t => t.id);
  if (missing.length) throw new Error('未掲載の用語: ' + missing.join(','));
};
