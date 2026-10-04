// 用語データ（terms_a〜e.js）を索引の順に結合し、校閲の上書き（terms_fixes.js）を当てる
const idx = require('./terms_index.json');
const fixes = require('./terms_fixes.js');
const all = [].concat(...['a', 'b', 'c', 'd', 'e'].map(x => require('./terms_' + x + '.js')));
const by = Object.fromEntries(all.map(t => [t.id, t]));
Object.keys(fixes).forEach(id => { if (!by[id]) throw new Error('fix for unknown id ' + id); by[id] = { ...by[id], ...fixes[id](by[id]) }; });
module.exports = idx.map(o => { if (!by[o.id]) throw new Error('missing term ' + o.id); return by[o.id]; });
