'use strict';
// 用語解説デッキ用の描画キット：同じ内容から「横長（PC）」と「縦長（スマホ）」を作る。
// ORIENT=land（既定）／port（スマホ縦長）
const L = require('./lib');
const { C, ROLE, KINDS, tw, lineCount, rect, txt } = L;
const FONT = L.FONT;
const LS = L.LS;
const P = process.env.ORIENT === 'port';
// 縦長では折り返しが多く見積りがぶれやすいので、幅を6%狭く見て高さを多めに取る
const need = (t, size, w, bold) => L.need(t, size, P ? w * 0.94 : w, bold);

// ---- 役割色の追加（章ごとの色分け用）----
Object.assign(ROLE, {
  rose: { d: 'A21C5B', l: 'FCE4EE' },
  lime: { d: '4D7C0F', l: 'ECF5D5' },
  brown: { d: '7C4A1E', l: 'F3E7DC' },
  sky: { d: '0369A1', l: 'DFF1FB' },
});
KINDS.paste = { t: '貼り付けた資料の内容', f: 'DDF1E4', c: '14532D' };
KINDS.supp = { t: '補足（一般的な説明）', f: 'E2E8F0', c: '334155' };
KINDS.pasteSupp = KINDS.paste;

// ---- 幾何 ----
const GEO = P ? { W: 6.0, H: 12.0, X: 0.35, CW: 5.3, BOT: 11.4 } : { W: 13.333, H: 7.5, X: 0.5, CW: 12.333, BOT: 6.95 };
const BODY = P ? 20 : 18;
const GAP = P ? 0.2 : 0.17;
if (P) { L.pres.defineLayout({ name: 'PHONE', width: GEO.W, height: GEO.H }); L.pres.layout = 'PHONE'; }

const dk = role => (ROLE[role].d === '475569' ? C.ink : ROLE[role].d);

// ---------- 部品の計測と描画 ----------
function paraRuns(parts, role, size) {
  // parts: [{label, text}] → 段落ごとにラベル（色付き太字）＋本文
  const runs = [];
  parts.forEach((p, i) => {
    const base = { fontFace: FONT, fontSize: size, lang: 'ja-JP', lineSpacing: Math.round(size * LS), paraSpaceAfter: 8 };
    runs.push({ text: p.label + '：', options: { ...base, bold: true, color: dk(role) } });
    runs.push({ text: p.text, options: { ...base, bold: false, color: C.ink, breakLine: i < parts.length - 1 } });
  });
  return runs;
}
function partsH(parts, w, size) {
  let h = 0;
  parts.forEach(p => { h += need(p.label + '：' + p.text, size, w) + 8 / 72; });
  return h;
}
const FIELDS = [['意味', 'what'], ['たとえ・例', 'ex'], ['主な用途', 'use'], ['最初の学び方', 'learn'], ['確認方法', 'check'], ['注意', 'warn']];

function termParts(r) { return FIELDS.filter(f => r[f[1]]).map(f => ({ label: f[0], text: r[f[1]] })); }

function termMeasure(r, w) {
  if (r.tip) return Math.max(1.0, need(r.tip, BODY, w - 1.1) + 0.5);
  const iw = w - 0.4;
  const tW = iw - 0.75 - (r.sup ? 0.95 : 0);
  const hh = Math.max(0.64, need(r.term, 24, tW, true) + (r.read ? need(r.read, 18, tW) : 0) + 0.04);
  return 0.18 + hh + 0.14 + partsH(termParts(r), iw, BODY) + 0.1;
}
function termDraw(s, x, y, w, h, r, role) {
  const R = ROLE[role];
  if (r.tip) {
    rect(s, x, y, w, h, { fill: 'FFFFFF', line: R.d, lw: 2, dash: 'dash', r: 0.14 });
    L.iconDot(s, 'FaLightbulb', x + 0.2, y + h / 2 - 0.3, 0.6, { role });
    txt(s, r.tip, { x: x + 0.95, y: y + 0.12, w: w - 1.15, h: h - 0.24, size: BODY, valign: 'middle', label: 'tip' });
    return;
  }
  rect(s, x, y, w, h, { fill: R.l, r: 0.14 });
  const iw = w - 0.4;
  L.iconDot(s, r.icon || 'FaCube', x + 0.2, y + 0.2, 0.62, { role });
  const tW = iw - 0.75 - (r.sup ? 0.95 : 0);
  const hh = Math.max(0.64, need(r.term, 24, tW, true) + (r.read ? need(r.read, 18, tW) : 0) + 0.04);
  const runs = [{ text: r.term, options: { fontFace: FONT, fontSize: 24, bold: true, color: dk(role), lang: 'ja-JP', lineSpacing: Math.round(24 * LS), breakLine: !!r.read } }];
  if (r.read) runs.push({ text: r.read, options: { fontFace: FONT, fontSize: 18, bold: false, color: C.muted, lang: 'ja-JP', lineSpacing: Math.round(18 * LS) } });
  s.addText(runs, { x: x + 0.2 + 0.75, y: y + 0.18, w: tW, h: hh, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
  if (r.sup) L.chip(s, { t: '補足', f: 'E2E8F0', c: '334155' }, x + w - 0.2 - 0.8, y + 0.22, 0.8);
  const parts = termParts(r);
  const by = y + 0.18 + hh + 0.14;
  const bh = partsH(parts, iw, BODY);
  s.addText(paraRuns(parts, role, BODY), { x: x + 0.2, y: by, w: iw, h: bh, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
}

// カード（見出し＋箇条書き）
function cardMeasure(it, w) {
  const iw = w - 0.4;
  const iconW = it.icon ? 0.75 : 0;
  const th = Math.max(it.icon ? 0.62 : 0, need(it.title, 22, iw - iconW, true));
  let bh = 0;
  const body = it.body || [];
  body.forEach(b => { bh += need(b, BODY, iw - 0.3) + 0.07; });
  if (it.text) bh += need(it.text, BODY, iw);
  return 0.16 + th + 0.1 + bh + 0.12;
}
function cardDraw(s, x, y, w, h, it) {
  const role = it.role || 'gray';
  const R = ROLE[role];
  rect(s, x, y, w, h, { fill: it.fill || R.l, r: 0.14 });
  const iw = w - 0.4;
  const iconW = it.icon ? 0.75 : 0;
  const th = Math.max(it.icon ? 0.62 : 0, need(it.title, 22, iw - iconW, true));
  if (it.icon) L.iconDot(s, it.icon, x + 0.2, y + 0.16, 0.62, { role });
  txt(s, it.title, { x: x + 0.2 + iconW, y: y + 0.16, w: iw - iconW, h: th, size: 22, bold: true, color: dk(role), valign: 'middle', label: 'cardTitle' });
  const by = y + 0.16 + th + 0.1;
  if (it.body && it.body.length) L.bullets(s, it.body, { x: x + 0.2, y: by, w: iw, h: h - (by - y) - 0.08, size: BODY, gap: 4 });
  if (it.text) txt(s, it.text, { x: x + 0.2, y: by, w: iw, h: h - (by - y) - 0.08, size: BODY, label: 'cardText' });
}

// 表の高さ（lib.table と同じ見積り）
function tableRows(head, rows, colW, size, padY) {
  const all = (head ? [head] : []).concat(rows);
  const hs = all.map((row, ri) => {
    let mh = 0;
    row.forEach((cell, ci) => {
      const c = typeof cell === 'string' ? { t: cell } : cell;
      const isHead = head && ri === 0;
      const fs = c.size || size;
      const bold = isHead || c.bold || ci === 0;
      mh = Math.max(mh, need(c.t, fs, colW[ci] - 2 * 9 / 72, bold) + 2 * padY / 72);
    });
    return Math.max(mh, 0.5);
  });
  return hs;
}

// ---------- ブロック定義 ----------
const B = {
  terms: (role, rows) => ({ type: 'terms', role, rows }),
  chain: (nodes, links) => ({ type: 'chain', nodes, links: links || [] }),
  cols: (items) => ({ type: 'cols', items }),
  table: (head, rows, o = {}) => ({ type: 'table', head, rows, ...o }),
  grid: (head, rows, o = {}) => ({ type: 'grid', head, rows, ...o }),
  callout: (kind, text) => ({ type: 'callout', kind, text }),
  code: (lines) => ({ type: 'code', lines }),
  steps: (items, role) => ({ type: 'steps', items, role: role || 'navy' }),
  stacks: (items) => ({ type: 'stacks', items }),
  nest: (levels) => ({ type: 'nest', levels }),
  h: (text, role, icon) => ({ type: 'h', text, role: role || 'navy', icon }),
  text: (items, o = {}) => ({ type: 'text', items, ...o }),
  tags: (items) => ({ type: 'tags', items }),
  pair: (l, r) => ({ type: 'pair', l, r }),
  scene: (def) => ({ type: 'scene', def }),
  tower: (rows) => ({ type: 'tower', rows }),
  raw: (items) => ({ type: 'raw', items }),
  graph: (def) => ({ type: 'graph', ...def }),
};

// ブロック→アイテム（{h, draw(s,x,y,w), gap}）
function expand(b, w) {
  switch (b.type) {
    case 'h': return [{ h: 0.6, gap: 0.12, draw: (s, x, y) => L.head(s, x, y, w, 0.55, b.text, { role: b.role, size: 20, icon: b.icon }) }];
    case 'text': {
      const size = b.size || BODY;
      const hh = b.items.reduce((a, t) => a + need(t, size, w - 0.31) + 6 / 72, 0) + 0.05;
      return [{ h: hh, draw: (s, x, y) => L.bullets(s, b.items, { x, y, w, h: hh, size, gap: 6 }) }];
    }
    case 'callout': {
      const size = BODY;
      const hh = Math.max(0.7, need(b.text, size, w - 0.15 - 0.5 - 0.15 - 0.15) + 0.3);
      return [{ h: hh, draw: (s, x, y) => L.callout(s, x, y, w, hh, b.text, { kind: b.kind, size }) }];
    }
    case 'code': {
      const size = P ? 16 : 18;
      const hh = b.lines.length * size * 1.35 / 72 + 0.3;
      return [{ h: hh, draw: (s, x, y) => L.code(s, x, y, w, b.lines, { size }) }];
    }
    case 'steps': {
      return b.items.map(t => {
        const hh = Math.max(0.6, need(t, BODY, w - 0.7) + 0.14);
        return { h: hh, gap: 0.04, draw: (s, x, y) => { L.badge(s, 0, x + 0.25, y + hh / 2, {}); } };
      }).map((it, i) => {
        const t = b.items[i];
        const hh = it.h;
        if (i === b.items.length - 1) it.gap = GAP + 0.1;
        it.draw = (s, x, y) => { L.badge(s, i + 1, x + 0.25, y + hh / 2, { role: b.role, d: 0.46 }); txt(s, t, { x: x + 0.7, y, w: w - 0.7, h: hh, size: BODY, valign: 'middle', label: 'step' }); };
        return it;
      });
    }
    case 'tags': {
      // 用語のチップ列（折り返し）
      const size = 18;
      let cx = 0, cy = 0, rowH = 0.5;
      const pos = [];
      b.items.forEach(t => {
        const cw = tw(t.label, size) + 0.5;
        if (cx + cw > w) { cx = 0; cy += rowH + 0.12; }
        pos.push([cx, cy, cw, t]);
        cx += cw + 0.12;
      });
      const hh = cy + rowH;
      return [{ h: hh, draw: (s, x, y) => pos.forEach(p => L.node(s, x + p[0], y + p[1], p[2], rowH, p[3].label, { role: p[3].role || 'navy', solid: true, size: 18, line: false })) }];
    }
    case 'terms': {
      if (P) {
        return b.rows.map(r => { const hh = termMeasure(r, w); return { h: hh, draw: (s, x, y) => termDraw(s, x, y, w, hh, r, b.role) }; });
      }
      const out = [];
      for (let i = 0; i < b.rows.length; i += 2) {
        const pair = b.rows.slice(i, i + 2);
        const cw = (w - 0.25) / 2;
        const hh = Math.max(...pair.map(r => termMeasure(r, cw)));
        out.push({ h: hh, draw: (s, x, y) => pair.forEach((r, k) => termDraw(s, x + k * (cw + 0.25), y, cw, hh, r, b.role)) });
      }
      return out;
    }
    case 'cols': {
      if (P) return b.items.map(it => { const hh = cardMeasure(it, w); return { h: hh, draw: (s, x, y) => cardDraw(s, x, y, w, hh, it) }; });
      const n = b.items.length, cw = (w - (n - 1) * 0.2) / n;
      const hh = Math.max(...b.items.map(it => cardMeasure(it, cw)));
      return [{ h: hh, draw: (s, x, y) => b.items.forEach((it, k) => cardDraw(s, x + k * (cw + 0.2), y, cw, hh, it)) }];
    }
    case 'chain': {
      const n = b.nodes.length;
      const nodeText = (nd, nw, icon) => {
        const tW = nw - 0.2 - (icon ? 0.75 : 0);
        return need(nd.label, 20, tW, true) + (nd.sub ? need(nd.sub, 18, tW) : 0) + 0.3;
      };
      if (P) {
        return b.nodes.map((nd, i) => {
          const hh = Math.max(0.95, nodeText(nd, w, !!nd.icon));
          const lab = i > 0 ? b.links[i - 1] : '';
          const ah = i > 0 ? 0.5 : 0;
          return { h: hh + ah, draw: (s, x, y) => {
            if (i > 0) {
              L.arrow(s, x + w / 2, y, x + w / 2, y + ah - 0.02, { color: C.ink, w: 3 });
              if (lab) txt(s, lab, { x: x + w / 2 + 0.2, y: y + 0.02, w: w / 2 - 0.2, h: ah - 0.04, size: 18, bold: true, color: C.muted, valign: 'middle', label: 'link' });
            }
            L.node(s, x, y + ah, w, hh, nd.label, { role: nd.role || 'navy', solid: nd.solid !== false, size: 20, sub: nd.sub, subSize: 18, icon: nd.icon, line: false, align: nd.icon ? 'left' : 'center' });
          } };
        });
      }
      const gapW = 0.55;
      const nw = (w - (n - 1) * gapW) / n;
      const icon = nw >= 3.4;
      const hh = Math.max(1.1, ...b.nodes.map(nd => nodeText(nd, nw, icon && !!nd.icon)));
      const labH = b.links.some(x => x) ? 0.45 : 0;
      return [{ h: hh + labH, draw: (s, x, y) => {
        b.nodes.forEach((nd, i) => {
          const nx = x + i * (nw + gapW);
          L.node(s, nx, y + labH, nw, hh, nd.label, { role: nd.role || 'navy', solid: nd.solid !== false, size: 20, sub: nd.sub, subSize: 18, icon: icon ? nd.icon : undefined, line: false, align: icon && nd.icon ? 'left' : 'center' });
          if (i < n - 1) {
            L.arrow(s, nx + nw + 0.04, y + labH + hh / 2, nx + nw + gapW - 0.04, y + labH + hh / 2, { color: C.ink, w: 3 });
            const lab = b.links[i];
            if (lab) txt(s, lab, { x: nx + nw + gapW / 2 - (gapW + 2.6) / 2, y, w: gapW + 2.6, h: 0.42, size: 18, bold: true, color: C.muted, align: 'center', valign: 'middle', label: 'link' });
          }
        });
      } }];
    }
    case 'table': {
      const heads = b.head, rows = b.rows;
      if (P) {
        return rows.map(row => {
          const pairs = row.slice(1).map((c, j) => ({ label: heads[j + 1], text: typeof c === 'string' ? c : c.t }));
          const it = { title: typeof row[0] === 'string' ? row[0] : row[0].t, role: b.role || 'navy', pairs };
          const iw = w - 0.4;
          const hh = 0.16 + need(it.title, 22, iw, true) + 0.1 + partsH(pairs, iw, BODY) + 0.1;
          return { h: hh, draw: (s, x, y) => {
            rect(s, x, y, w, hh, { fill: ROLE[it.role].l, r: 0.14 });
            const th = need(it.title, 22, iw, true);
            txt(s, it.title, { x: x + 0.2, y: y + 0.16, w: iw, h: th, size: 22, bold: true, color: dk(it.role), label: 'rowTitle' });
            s.addText(paraRuns(pairs, it.role, BODY), { x: x + 0.2, y: y + 0.16 + th + 0.1, w: iw, h: hh - th - 0.36, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
          } };
        });
      }
      return expand({ ...b, type: 'grid' }, w);
    }
    case 'grid': {
      if (P && b.stack) return expand({ ...b, type: 'table' }, w);
      const fr = (P && b.pwidths) || b.widths || b.head.map(() => 1);
      const sum = fr.reduce((a, x) => a + x, 0);
      const colW = fr.map(f => w * f / sum);
      const size = b.size || 18;
      const padY = b.padY || 4;
      const hs = tableRows(b.head, b.rows, colW, size, padY);
      const total = hs.reduce((a, x) => a + x, 0);
      return [{ h: total, draw: (s, x, y) => L.table(s, [b.head].concat(b.rows), { x, y, colW, size, padY, minRow: 0.5, maxH: 99, rowRole: b.rowRole, headFill: b.headFill }) }];
    }
    case 'stacks': {
      const one = (it, sw) => {
        const lh = it.layers.map(l => Math.max(0.62, need(l.label, 18, sw - 0.3, true) + (l.sub ? need(l.sub, 18, sw - 0.3) : 0) + 0.2));
        return { title: it.title, role: it.role || 'navy', layers: it.layers, lh, h: 0.55 + 0.1 + lh.reduce((a, x) => a + x + 0.1, 0) };
      };
      const draw1 = (s, st, x, y, sw) => {
        L.head(s, x, y, sw, 0.5, st.title, { role: st.role, size: 20 });
        let cy = y + 0.6;
        st.layers.forEach((l, i) => { L.node(s, x, cy, sw, st.lh[i], l.label, { role: l.role || st.role, size: 18, sub: l.sub, subSize: 18, solid: !!l.solid, line: l.line === false ? false : undefined, fill: l.fill }); cy += st.lh[i] + 0.1; });
      };
      if (P) return b.items.map(it => { const st = one(it, w); return { h: st.h, draw: (s, x, y) => draw1(s, st, x, y, w) }; });
      const n = b.items.length, sw = (w - (n - 1) * 0.25) / n;
      const sts = b.items.map(it => one(it, sw));
      const hh = Math.max(...sts.map(t => t.h));
      return [{ h: hh, draw: (s, x, y) => sts.forEach((st, k) => draw1(s, st, x + k * (sw + 0.25), y, sw)) }];
    }
    case 'pair': {
      if (P) return [].concat(...b.l.map(x => expand(x, w)), ...b.r.map(x => expand(x, w)));
      const cw = (w - 0.3) / 2;
      const mk = arr => { const its = [].concat(...arr.map(x => expand(x, cw))); let h = 0; its.forEach((it, i) => { h += it.h + (i < its.length - 1 ? (it.gap == null ? GAP : it.gap) : 0); }); return { its, h }; };
      const A = mk(b.l), Bk = mk(b.r);
      const hh = Math.max(A.h, Bk.h);
      const drawStack = (s, st, x, y) => { let cy = y; st.its.forEach(it => { it.draw(s, x, cy, cw); cy += it.h + (it.gap == null ? GAP : it.gap); }); };
      return [{ h: hh, draw: (s, x, y) => { drawStack(s, A, x, y); drawStack(s, Bk, x + cw + 0.3, y); } }];
    }
    case 'nest': {
      const n = b.levels.length;
      const hh = 0.8 + 0.95 * (n - 1);
      return [{ h: hh, draw: (s, x, y) => {
        b.levels.forEach((lv, i) => {
          const R = ROLE[lv.role || 'gray'];
          const ix = x + i * 0.3, iy = y + i * 0.75, iw = w - i * 0.6, ih = hh - i * 0.95;
          rect(s, ix, iy, iw, ih, { fill: R.l, line: R.d, lw: 2, r: 0.14 });
          txt(s, lv.label, { x: ix + 0.18, y: iy + 0.1, w: iw - 0.36, h: 0.55, size: P ? 18 : 20, bold: true, color: dk(lv.role || 'gray'), valign: 'top', label: 'nest' });
        });
      } }];
    }
    case 'scene': return [{ h: P ? b.def.ph : b.def.h, draw: (s, x, y) => drawScene(s, x, y, b.def) }];
    case 'tower': return expandTower(b, w);
    case 'graph': { const lay = graphLayout(b, w); return [{ h: lay.H, draw: (s, x, y) => renderScene(s, x, y, [], lay.nodes, graphEdges(b), null) }]; }
    case 'raw': return b.items;
    default: throw new Error('unknown block ' + b.type);
  }
}

// ======================= v2：層・関係図・場面図・用語ページ =======================
const LAYERS = {
  app:   { t: 'アプリ',       d: '使う人・作る人が直接さわるソフト', role: 'sec' },
  mw:    { t: 'ミドルウェア', d: 'アプリを支える土台のソフト',       role: 'server' },
  virt:  { t: '仮想化',       d: '1台を分けて使う・箱に詰める',       role: 'device' },
  os:    { t: 'OS',           d: '機械を動かす基本ソフト',           role: 'net' },
  hw:    { t: 'ハードウェア', d: '機械・部品そのもの',               role: 'gray' },
  net:   { t: 'ネットワーク', d: '機械どうしをつなぐ道',             role: 'aux' },
  cloud: { t: '置き場所',     d: 'サーバー室・クラウド',             role: 'sky' },
  act:   { t: '活動・資格',   d: '技術の層ではなく人の活動',         role: 'rose' },
};
const STRIP = ['hw', 'os', 'virt', 'mw', 'app', 'net', 'cloud'];
const TOWER = ['app', 'mw', 'virt', 'os', 'hw', 'net', 'cloud'];
const G = { byId: {}, list: [], chNames: [] };
const SHORT = {
  software: 'ソフトウェア', datacenter: 'データセンター', rdb: 'RDB', sqlserver: 'SQL Server', awsdb: 'AWSのDB',
  winapp: 'Windows アプリ開発', linuxapp: 'Linux アプリ開発', mobileapp: 'スマホアプリ開発', pcbuild: 'PC自作',
  cloudvm: 'クラウド仮想サーバー', fe: '基本情報', apexam: '応用情報', excel: 'Excel集計', serverclient: 'サーバーとクライアント',
  ai: 'AI', db: 'DB', os: 'OS', vm: '仮想マシン', private: 'プライベートクラウド', apserver: 'アプリサーバー', dbserver: 'DBサーバー',
};
const EXTRA_SRC = { postgres: ['D01'], docker: ['D02'], k8s: ['D03'], s3: ['D04'], itpassport: ['D05'], fe: ['D05'], apexam: ['D05'], mos: ['D05'] };
function setGlossary(list, chNames) {
  G.list = list; G.chNames = chNames; G.byId = {};
  list.forEach(t => { G.byId[t.id] = t; });
}
const shortName = t => SHORT[t.id] || t.term.replace(/（.*?）/g, '');
const layerOf = t => (t.lay && t.lay[0]) || 'act';
const lRole = t => LAYERS[layerOf(t)].role;
const isAct = lay => lay.length === 1 && lay[0] === 'act';
const INACT = 'EEF1F5', INACT_T = '8A97A6';

// ---- 位置表示（横長：1行の帯／縦長：塔） ----
function drawStrip(s, x, y, w, lay) {
  const H = 0.5;
  txt(s, 'どこの話？', { x, y, w: 1.4, h: H, size: 17, bold: true, color: C.ink, valign: 'middle', label: 'strip' });
  const sx = x + 1.45, sw = w - 1.45;
  if (isAct(lay)) {
    L.node(s, sx, y, sw, H, '技術の層ではなく、人の「活動・経験・資格」の話です', { role: 'rose', solid: true, size: 17, line: false });
    return;
  }
  const gap = 0.06, grp = 0.22;
  const slotW = (sw - 6 * gap - (grp - gap)) / 7;
  STRIP.forEach((k, i) => {
    const px = sx + i * (slotW + gap) + (i >= 5 ? grp - gap : 0);
    const Ly = LAYERS[k];
    const on = lay.includes(k);
    rect(s, px, y, slotW, H, { fill: on ? dk(Ly.role) : INACT, r: 0.1 });
    s.addText(Ly.t, { x: px, y, w: slotW, h: H, margin: 0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, bold: true, color: on ? 'FFFFFF' : INACT_T, lang: 'ja-JP', isTextBox: true, fit: 'none' });
  });
}
const TOWER_H = 0.36 + 7 * 0.4 + 0.14;
function drawTowerPort(s, x, y, w, lay) {
  txt(s, 'どこの話？', { x, y, w, h: 0.32, size: 18, bold: true, color: C.ink, valign: 'middle', label: 'tower' });
  let cy = y + 0.38;
  if (isAct(lay)) {
    L.node(s, x, cy, w, 0.9, '技術の層ではなく、人の「活動・経験・資格」の話です', { role: 'rose', solid: true, size: 17, line: false });
    return;
  }
  TOWER.forEach((k, i) => {
    if (i === 5) cy += 0.14;
    const on = lay.includes(k), Ly = LAYERS[k];
    rect(s, x, cy, w, 0.36, { fill: on ? dk(Ly.role) : INACT, r: 0.08 });
    const runs = [{ text: Ly.t, options: { fontFace: FONT, fontSize: 15, bold: true, color: on ? 'FFFFFF' : INACT_T, lang: 'ja-JP' } }];
    if (on) runs.push({ text: '　' + Ly.d, options: { fontFace: FONT, fontSize: 14, bold: false, color: 'FFFFFF', lang: 'ja-JP' } });
    s.addText(runs, { x: x + 0.14, y: cy, w: w - 0.2, h: 0.36, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
    cy += 0.4;
  });
}
const indicatorH = lay => (isAct(lay) ? 0.38 + 0.9 : TOWER_H);


// 縦長用のコンパクトな位置表示（2段のチップ＋有効な層の説明）
function indicatorLines(lay) { return isAct(lay) ? [] : STRIP.filter(k => lay.includes(k)); }
function indicatorH2(lay) {
  if (isAct(lay)) return 0.38 + 0.8;
  return 0.36 + 0.42 + 0.06 + 0.42 + 0.08 + indicatorLines(lay).length * 0.3 + 0.04;
}
function drawIndicator2(s, x, y, w, lay) {
  txt(s, 'どこの話？', { x, y, w, h: 0.32, size: 18, bold: true, color: C.ink, valign: 'middle', label: 'ind' });
  let cy = y + 0.38;
  if (isAct(lay)) { L.node(s, x, cy, w, 0.8, '技術の層ではなく、人の「活動・経験・資格」の話です', { role: 'rose', solid: true, size: 16, line: false }); return; }
  const rows = [STRIP.slice(0, 4), STRIP.slice(4)];
  rows.forEach((row, ri) => {
    const gap = 0.08, sw = (w - (row.length - 1) * gap) / row.length;
    row.forEach((k, i) => {
      const Ly = LAYERS[k], on = lay.includes(k);
      const px = x + i * (sw + gap);
      rect(s, px, cy, sw, 0.42, { fill: on ? dk(Ly.role) : INACT, r: 0.1 });
      s.addText(Ly.t, { x: px, y: cy, w: sw, h: 0.42, margin: 0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 14, bold: true, color: on ? 'FFFFFF' : INACT_T, lang: 'ja-JP', isTextBox: true, fit: 'none' });
    });
    cy += 0.48;
  });
  cy += 0.02;
  indicatorLines(lay).forEach(k => {
    const Ly = LAYERS[k];
    s.addText([{ text: Ly.t, options: { fontFace: FONT, fontSize: 14, bold: true, color: dk(Ly.role), lang: 'ja-JP' } }, { text: '　' + Ly.d, options: { fontFace: FONT, fontSize: 14, bold: false, color: C.ink, lang: 'ja-JP' } }], { x: x + 0.05, y: cy, w: w - 0.1, h: 0.3, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
    cy += 0.3;
  });
}

// ---- 関係図（用語を左、つながる用語を右。矢印にラベル） ----
function relTarget(r) {
  if (r.to) { const o = G.byId[r.to]; if (!o) throw new Error('rel to unknown: ' + r.to); return { name: shortName(o), role: lRole(o), sub: LAYERS[layerOf(o)].t }; }
  return { name: r.t, role: 'gray', sub: '' };
}
const FAN_W = 5.0;
function fanRowH(n, avail) { return Math.max(0.5, Math.min(0.74, (avail - (n - 1) * 0.12) / n)); }
function fanH(n, rh) { return n * rh + (n - 1) * 0.12; }
function drawFan(s, x, y, w, t, rh) {
  const rels = t.rel, n = rels.length, H = fanH(n, rh);
  const termW = 1.5, cw = 1.75, gap = w - termW - cw;
  const role = lRole(t);
  const nm = shortName(t);
  const longest = Math.max(...(nm.match(/[A-Za-z0-9.+\-]+/g) || ['']).map(x => tw(x, 18) * 1.05));
  const tsz = longest > termW - 0.2 ? (tw(nm.match(/[A-Za-z0-9.+\-]+/g).sort((a, b) => b.length - a.length)[0], 15) * 1.05 > termW - 0.2 ? 13 : 15) : 18;
  L.node(s, x, y, termW, H, nm, { role, solid: true, size: tsz, sub: LAYERS[layerOf(t)].t, subSize: 14, line: false });
  rels.forEach((r, i) => {
    const ty = y + i * (rh + 0.12);
    const T = relTarget(r);
    const fs = rh < 0.58 ? 14 : 15;
    const oneLine = lineCount(T.name, fs, cw - 0.2, true) <= 1;
    const subOk = oneLine && T.sub && rh >= 0.62;
    L.node(s, x + w - cw, ty, cw, rh, T.name, { role: T.role, size: fs, sub: subOk ? T.sub : undefined, subSize: 13, lw: 2 });
    const cy = ty + rh / 2;
    const x1 = x + termW + 0.03, x2 = x + w - cw - 0.03;
    if (r.dir === 'in') L.arrow(s, x2, cy, x1, cy, { color: C.ink, w: 2.5 });
    else L.arrow(s, x1, cy, x2, cy, { color: C.ink, w: 2.5, both: r.dir === 'both' });
    txt(s, r.label, { x: x1 - 0.02, y: cy - 0.33, w: gap + 0.04, h: 0.3, size: 15, bold: true, color: C.muted, align: 'center', valign: 'bottom', label: 'fanlabel' });
  });
}

// ---- 場面図（コンテナ枠・ノード・ラベル付き矢印を座標で配置） ----
function edgePts(A, B, e) {
  const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2;
  const dx = bx - ax, dy = by - ay;
  const noOv = (Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) <= 0.15) && (Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) <= 0.15);
  const horiz = noOv && Math.abs(dy) > 0.9 * (A.h + B.h) / 2 ? false : Math.abs(dx) / ((A.w + B.w) / 2) > Math.abs(dy) / ((A.h + B.h) / 2);
  const as = e.as || (horiz ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't'));
  const bs = e.bs || { r: 'l', l: 'r', b: 't', t: 'b' }[as];
  const side = (R, sd, ox, oy) => (sd === 'r' ? [R.x + R.w, oy] : sd === 'l' ? [R.x, oy] : sd === 'b' ? [ox, R.y + R.h] : [ox, R.y]);
  const yo0 = Math.max(A.y, B.y), yo1 = Math.min(A.y + A.h, B.y + B.h);
  const xo0 = Math.max(A.x, B.x), xo1 = Math.min(A.x + A.w, B.x + B.w);
  let a, b;
  if (as === 'r' || as === 'l') {
    const same = yo1 - yo0 > 0.15; const ya = same ? (yo0 + yo1) / 2 : ay, yb = same ? (yo0 + yo1) / 2 : by;
    a = side(A, as, 0, ya); b = side(B, bs, 0, yb);
  } else {
    const same = xo1 - xo0 > 0.15; const xa = same ? (xo0 + xo1) / 2 : ax, xb = same ? (xo0 + xo1) / 2 : bx;
    a = side(A, as, xa, 0); b = side(B, bs, xb, 0);
  }
  return [a, b];
}
function renderScene(s, ox, oy, boxesG, nodesG, edges, pov, textsG) {
  const G2 = {};
  boxesG.forEach(({ b, g }) => {
    G2[b.id] = g;
    const R = ROLE[b.role || 'gray'];
    rect(s, ox + g.x, oy + g.y, g.w, g.h, { fill: b.fill || 'F7F9FB', line: R.d, lw: 1.5, dash: 'dash', r: 0.14 });
    txt(s, g.opt.label || b.label, { x: ox + g.x + 0.15, y: oy + g.y + 0.07, w: g.w - 0.3, h: g.opt.lh || 0.36, size: g.opt.size || 16, bold: true, color: dk(b.role || 'gray'), label: 'sceneBox' });
  });
  nodesG.forEach(({ n, g }) => { G2[n.id] = g; });
  (edges || []).forEach(e => {
    const A = G2[e.a], B2 = G2[e.b];
    if (!A || !B2) { if (pov && pov.skipped && (pov.skipped.has(e.a) || pov.skipped.has(e.b))) return; throw new Error(`scene edge: ${e.a}→${e.b} not found`); }
    const pe = (pov && pov.edges && pov.edges[e.a + '>' + e.b]) || {};
    const [pa, pb] = edgePts(A, B2, { ...e, ...pe });
    const lab = pe.label !== undefined ? pe.label : e.label;
    L.arrow(s, ox + pa[0], oy + pa[1], ox + pb[0], oy + pb[1], { color: e.color || C.ink, w: e.w || 2.5, dash: e.dash, both: e.both, head: e.head, label: lab, lsize: e.lsize || 16, lcolor: C.ink, dx: pe.dx !== undefined ? pe.dx : e.dx, dy: pe.dy !== undefined ? pe.dy : e.dy });
  });
  (textsG || []).forEach(({ t, g }) => {
    txt(s, g.opt.t !== undefined ? g.opt.t : t.t, { x: ox + g.x, y: oy + g.y, w: g.w, h: g.h, size: g.opt.size || t.size || 16, bold: !!t.bold, color: t.color || C.ink, align: t.align || 'left', valign: t.valign || 'middle', label: 'sceneText' });
  });
  nodesG.forEach(({ n, g }) => {
    const o = g.opt || {};
    L.node(s, ox + g.x, oy + g.y, g.w, g.h, o.label || n.label, { role: n.role || 'gray', solid: !!n.solid, size: o.size || n.size || 18, sub: o.nosub ? undefined : n.sub, subSize: o.subSize || n.subSize || 14, icon: o.noicon ? undefined : n.icon, dash: n.dash, fill: n.fill, color: n.color, line: n.line, align: n.align });
  });
}
function drawScene(s, ox, oy, d) {
  const skipped = new Set((P && d.p && d.p.skip) || []);
  const geo = (kind, o) => {
    if (!P) return { x: o.x, y: o.y, w: o.w, h: o.h, opt: {} };
    const q = d.p && d.p[kind] && d.p[kind][o.id];
    if (!q) throw new Error(`scene(${d.name || ''}) 縦長の座標がありません: ${kind} ${o.id}`);
    return { x: q[0], y: q[1], w: q[2], h: q[3], opt: q[4] || {} };
  };
  const boxesG = (d.boxes || []).filter(b => !skipped.has(b.id)).map(b => ({ b, g: geo('boxes', b) }));
  const nodesG = (d.nodes || []).filter(n => !skipped.has(n.id)).map(n => ({ n, g: geo('nodes', n) }));
  const textsG = (d.texts || []).filter(t => !skipped.has(t.id)).map(t => ({ t, g: geo('texts', t) }));
  renderScene(s, ox, oy, boxesG, nodesG, d.edges, { edges: P && d.p ? d.p.edges : null, skipped }, textsG);
}

// ---- 自動配置の関係図（上から下へ段を並べる）----
function graphLayout(b, W) {
  const rows = [];
  const useP = P && b.pl;
  (useP ? b.pl : b.levels).forEach(lv => {
    const items = lv.map(it => (typeof it === 'string' ? { id: it } : { id: it[0], x: it[1] }));
    if (!P || useP) rows.push(items);
    else { for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3)); }
  });
  const R = rows.length;
  const nh = P ? 0.82 : (b.nh || (R >= 5 ? 0.64 : 0.78));
  const pstep = (useP && b.pstep) || 1.35;
  const H = P ? (R - 1) * pstep + nh : b.h;
  const step = R > 1 ? (H - nh) / (R - 1) : 0;
  const nodes = [];
  rows.forEach((items, ri) => {
    const k = items.length;
    const nw = P ? (useP ? (b.pnw || 1.6) : Math.min(1.7, (W - (k - 1) * 0.2) / k)) : Math.min(2.5, (W - (k - 1) * 0.4) / k);
    items.forEach((it, j) => {
      const cxf = it.x != null && (!P || useP) ? it.x : (j + 0.5) / k;
      const x = cxf * W - nw / 2;
      const t = b.nodes && b.nodes[it.id];
      const gl = G.byId[it.id];
      const n = t ? { id: it.id, label: t.label, sub: t.sub, role: t.role || 'gray', solid: t.solid } : { id: it.id, label: shortName(gl), sub: LAYERS[layerOf(gl)].t, role: lRole(gl), solid: b.focus === it.id };
      if (lineCount(n.label, 16, nw - 0.2, true) > 1) n.sub = undefined;
      nodes.push({ n, g: { x, y: ri * step, w: nw, h: nh, opt: { size: 16, subSize: 13 } } });
    });
  });
  return { H, nodes };
}
function graphEdges(b) { return ((P && b.pedges) || b.edges || []).map(e => ({ a: e[0], b: e[1], label: e[2], both: e[3] === 'both', dash: e[3] === 'dash', lsize: 15, ...(e[4] || {}) })); }

// ---- 層の塔（各層にどんな用語が属するか） ----
function expandTower(b, w) {
  const rows = b.rows;
  const out = [];
  const chipSize = 16;
  rows.forEach((row, ri) => {
    const Ly = LAYERS[row.lay];
    const labels = row.items.map(it => (typeof it === 'string' ? (G.byId[it] ? shortName(G.byId[it]) : it) : it.t));
    const gapAfter = row.gapAfter != null ? row.gapAfter : (ri === rows.length - 1 ? 0 : 0.1);
    if (!P) {
      const lw = 3.4, cx0 = lw + 0.2, cwid = w - cx0 - 0.15;
      const pos = []; let cx = 0, line = 0;
      labels.forEach(lb => { const cw = tw(lb, chipSize) + 0.34; if (cx + cw > cwid) { cx = 0; line += 1; } pos.push([cx, line, cw, lb]); cx += cw + 0.1; });
      const lines = line + 1;
      const hh = Math.max(0.78, lines * 0.5 + 0.16);
      out.push({ h: hh, gap: gapAfter, draw: (s, x, y) => {
        rect(s, x, y, w, hh, { fill: ROLE[Ly.role].l, r: 0.1 });
        L.node(s, x, y, lw, hh, Ly.t, { role: Ly.role, solid: true, size: 20, sub: Ly.d, subSize: 13, line: false });
        pos.forEach(p => L.node(s, x + cx0 + p[0], y + 0.08 + p[1] * 0.5, p[2], 0.42, p[3], { role: Ly.role, fill: 'FFFFFF', size: chipSize, lw: 1.25 }));
      } });
    } else {
      const cwid = w - 0.3;
      const pos = []; let cx = 0, line = 0;
      labels.forEach(lb => { const cw = tw(lb, chipSize) + 0.34; if (cx + cw > cwid) { cx = 0; line += 1; } pos.push([cx, line, cw, lb]); cx += cw + 0.1; });
      const lines = line + 1;
      const hh = 0.5 + lines * 0.5 + 0.12;
      out.push({ h: hh, gap: gapAfter, draw: (s, x, y) => {
        rect(s, x, y, w, hh, { fill: ROLE[Ly.role].l, r: 0.1 });
        L.node(s, x, y, w, 0.44, Ly.t + '　' + Ly.d, { role: Ly.role, solid: true, size: 16, line: false, r: 0.1 });
        pos.forEach(p => L.node(s, x + 0.15 + p[0], y + 0.54 + p[1] * 0.5, p[2], 0.42, p[3], { role: Ly.role, fill: 'FFFFFF', size: chipSize, lw: 1.25 }));
      } });
    }
  });
  return out;
}

// ---- 用語ページ ----
const termKinds = t => (t.sup === false ? ['paste', 'supp'] : ['supp']);
const termSrc = t => (t.sup === false ? ['U01', 'G01'] : ['G01']).concat(EXTRA_SRC[t.id] || []);
function termNotes(t) {
  const Ly = LAYERS[layerOf(t)];
  const rel = t.rel.map(r => { const T = relTarget(r); return r.dir === 'in' ? `${T.name} →（${r.label}）→ ${shortName(t)}` : r.dir === 'both' ? `${shortName(t)} ⇄（${r.label}）⇄ ${T.name}` : `${shortName(t)} →（${r.label}）→ ${T.name}`; });
  let n = `【一言】\n${t.one}\n\n【どこの話？】\n層：${t.lay.map(k => LAYERS[k].t).join('・')}（${Ly.d}）\n場所：${t.where}\n\n【くわしく】\n${t.what.join('\n')}\n\n【たとえるなら】\n${t.ana}\n\n【こんな場面で】\n${t.scene}\n`;
  if (t.warn) n += `\n【勘違い・つまずき】\n${t.warn}\n`;
  n += `\n【最初の学び方】\n${t.learn}\n\n【つながり】\n${rel.map(x => '・' + x).join('\n')}`;
  if (t.quote) n += `\n\n【貼り付け資料の記載（要旨）】\n${t.quote}`;
  return n;
}
function runsLabelBody(label, body, role, size, labelColor) {
  const base = { fontFace: FONT, fontSize: size, lang: 'ja-JP', lineSpacing: Math.round(size * LS) };
  return [{ text: label, options: { ...base, bold: true, color: labelColor || dk(role), breakLine: true } }, { text: body, options: { ...base, bold: false, color: C.ink } }];
}
function termLand(t) {
  const role = lRole(t), R = ROLE[role];
  const notes = termNotes(t);
  const ref = t.sup === false ? `ご提供の用語解説（${t.term}）` : `編集者による補足（${t.term}）`;
  const titleSuffix = t.read;
  const s = L.slide({ id: 't-' + t.id, ch: G.chNames[t.ch], title: t.term, titleSuffix, lead: t.one, kinds: termKinds(t), src: termSrc(t), ref, notes });
  pageCount += 1;
  outIndex.push({ n: L.index.length, id: 't-' + t.id, ch: G.chNames[t.ch], title: t.term, src: termSrc(t), kinds: termKinds(t), ref, lay: t.lay });
  const X = GEO.X, W = GEO.CW;
  const readInTitle = tw(t.term, 30) * 1.04 + tw('　' + t.read, 18) < W - 0.15;
  let y = 1.93;
  drawStrip(s, X, y, W, t.lay); y += 0.5 + 0.1;
  // 場所の帯
  const wRuns = [{ text: '場所　', options: { fontFace: FONT, fontSize: 18, bold: true, color: dk(role), lang: 'ja-JP', lineSpacing: Math.round(18 * LS) } }, { text: t.where, options: { fontFace: FONT, fontSize: 18, bold: false, color: C.ink, lang: 'ja-JP', lineSpacing: Math.round(18 * LS) } }];
  const wl = lineCount('場所　' + t.where, 18, W - 0.4, false);
  const wh = wl * 18 * LS / 72 + 0.14;
  rect(s, X, y, W, wh, { fill: R.l, r: 0.1 });
  s.addText(wRuns, { x: X + 0.2, y, w: W - 0.4, h: wh, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
  y += wh + 0.1;
  const top = y, bodyH = GEO.BOT - top;
  const LW = W - FAN_W - 0.25;
  // 左：くわしく
  rect(s, X, top, LW, bodyH, { fill: 'FFFFFF', line: 'CBD5E1', lw: 1, r: 0.12 });
  const iw = LW - 0.4, avail = bodyH - 0.24;
  const readLine = '読み　' + t.read;
  let used = readInTitle ? 0 : need(readLine, 18, iw) + 6 / 72;
  const placed = [], spill = [];
  t.what.forEach(p => {
    const h = need(p, 18, iw) + 8 / 72;
    if (!spill.length && (used + h <= avail + 0.02 || !placed.length)) { placed.push(p); used += h; } else spill.push(p);
  });
  if (used > avail + 0.05) L.warn(`OVERFLOW 「${t.term}」 くわしく ${used.toFixed(2)} > ${avail.toFixed(2)}`);
  const runs = [];
  if (!readInTitle) runs.push({ text: readLine, options: { fontFace: FONT, fontSize: 18, color: C.muted, bold: false, lang: 'ja-JP', lineSpacing: Math.round(18 * LS), paraSpaceAfter: 6, breakLine: true } });
  placed.forEach((p, i) => runs.push({ text: p, options: { fontFace: FONT, fontSize: 18, color: C.ink, bold: false, lang: 'ja-JP', lineSpacing: Math.round(18 * LS), paraSpaceAfter: 8, breakLine: i < placed.length - 1 } }));
  s.addText(runs, { x: X + 0.2, y: top + 0.12, w: iw, h: bodyH - 0.24, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
  // 右：関係図
  const fx = X + W - FAN_W;
  rect(s, fx, top, FAN_W, bodyH, { fill: 'F6F8FA', r: 0.12 });
  const n = t.rel.length;
  const rh = fanRowH(n, bodyH - 0.3);
  const fh = fanH(n, rh);
  drawFan(s, fx + 0.1, top + (bodyH - fh) / 2, FAN_W - 0.2, t, rh);
  // ---- つづき：たとえ・場面・注意・学び方（入りきらない場合は次のスライドへ）----
  const cards = [];
  if (spill.length) cards.push({ label: 'くわしく（つづき）', text: spill.join('\n'), role, icon: 'FaBook', wide: true });
  cards.push({ label: 'たとえるなら', text: t.ana, role: 'aux', icon: 'FaLightbulb' });
  cards.push({ label: 'こんな場面で', text: t.scene, role: 'net', icon: 'FaMapMarkerAlt' });
  if (t.warn) cards.push({ label: '勘違い・つまずき', text: t.warn, role: 'warn', icon: 'FaExclamationTriangle' });
  cards.push({ label: '最初の学び方', text: t.learn, role: 'sec', icon: 'FaRocket' });
  const colW = (W - 0.25) / 2;
  const rowsOf = [];
  let buf = [];
  cards.forEach(c => { if (c.wide) { if (buf.length) { rowsOf.push(buf); buf = []; } rowsOf.push([c]); } else { buf.push(c); if (buf.length === 2) { rowsOf.push(buf); buf = []; } } });
  if (buf.length) rowsOf.push(buf);
  const cardH = (c, cw) => Math.max(0.85, 0.14 + need(c.label + '　' + c.text, 18, cw - 0.7 - 0.18) + 0.14);
  const rowHs = rowsOf.map(r => Math.max(...r.map(c => cardH(c, r.length === 1 ? W : colW))));
  const TOP2 = 1.32;
  const cap = GEO.BOT - TOP2;
  const slides = [[]];
  let acc = 0;
  rowsOf.forEach((r, i) => {
    const add = rowHs[i] + (slides[slides.length - 1].length ? 0.14 : 0);
    if (slides[slides.length - 1].length && acc + add > cap + 0.02) { slides.push([]); acc = 0; }
    acc += rowHs[i] + (slides[slides.length - 1].length ? 0.14 : 0);
    slides[slides.length - 1].push(i);
  });
  slides.forEach((idxs, si) => {
    const ttl = t.term + (si === 0 ? '（つづき）' : `（つづき${si + 1}）`);
    const lead = si === 0 ? 'たとえ話と、実際の場面、つまずきやすい点、最初の一歩です。' : 'つづきです。' + (rowsOf[idxs[0]].some(c => c.label === '勘違い・つまずき') ? 'つまずきやすい点と、最初の一歩です。' : '最初の一歩です。');
    const s2 = L.slide({ id: 't-' + t.id + 'b' + si, ch: G.chNames[t.ch], title: ttl, noLead: true, kinds: termKinds(t), src: termSrc(t), ref, notes: `【${t.term}：つづき】\nたとえ・場面・勘違い・最初の学び方をまとめたページです。内容は1枚目のノートと同じです。\n\n【たとえるなら】\n${t.ana}\n\n【こんな場面で】\n${t.scene}\n${t.warn ? '\n【勘違い・つまずき】\n' + t.warn + '\n' : ''}\n【最初の学び方】\n${t.learn}` });
    pageCount += 1;
    outIndex.push({ n: L.index.length, id: 't-' + t.id + 'b' + si, ch: G.chNames[t.ch], title: ttl, src: termSrc(t), kinds: termKinds(t), ref });
    let cy = TOP2;
    idxs.forEach(ri => {
      const r = rowsOf[ri], rowH = rowHs[ri];
      r.forEach((c, kx) => {
        const cw = r.length === 1 ? W : colW;
        const cx = X + (r.length === 1 ? 0 : kx * (colW + 0.25));
        const CR = ROLE[c.role];
        rect(s2, cx, cy, cw, rowH, { fill: CR.l, r: 0.14 });
        L.iconDot(s2, c.icon, cx + 0.16, cy + 0.14, 0.42, { role: c.role });
        const base = { fontFace: FONT, fontSize: 18, lang: 'ja-JP', lineSpacing: Math.round(18 * LS) };
        const paras = c.text.split('\n');
        const rr = [{ text: c.label + '　', options: { ...base, bold: true, color: dk(c.role) } }];
        paras.forEach((p, pi) => rr.push({ text: p, options: { ...base, bold: false, color: C.ink, breakLine: pi < paras.length - 1, paraSpaceAfter: 6 } }));
        s2.addText(rr, { x: cx + 0.7, y: cy + 0.12, w: cw - 0.7 - 0.18, h: rowH - 0.24, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
      });
      cy += rowH + 0.14;
    });
  });
}
function termPortItems(t) {
  const role = lRole(t), R = ROLE[role];
  const items = [];
  items.push({ h: indicatorH2(t.lay), draw: (s, x, y, w) => drawIndicator2(s, x, y, w, t.lay) });
  const iwid = GEO.CW - 0.4;
  // 見出し付き（1つ目）／続き（見出しなし）／インラインラベルのカード
  const card = (label, paras, r, o = {}) => {
    const sz = BODY;
    const inline = o.inline;
    const head = !inline && label ? 0.42 : 0;
    const bodyH = inline
      ? paras.reduce((a, p, i) => a + need((i === 0 ? label + '　' : '') + p, sz, iwid) + 6 / 72, 0)
      : paras.reduce((a, p) => a + need(p, sz, iwid) + 8 / 72, 0);
    const hh = 0.12 + head + bodyH + 0.08;
    return { h: hh, gap: o.gap, draw: (s, x, y, w) => {
      rect(s, x, y, w, hh, { fill: ROLE[r].l, r: 0.14 });
      if (head) txt(s, label, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.4, size: 20, bold: true, color: dk(r), valign: 'middle', label: 'sechead' });
      const runs = [];
      paras.forEach((p, i) => {
        const base = { fontFace: FONT, fontSize: sz, lang: 'ja-JP', lineSpacing: Math.round(sz * LS), paraSpaceAfter: inline ? 6 : 8 };
        if (inline && i === 0) runs.push({ text: label + '　', options: { ...base, bold: true, color: dk(r) } });
        runs.push({ text: p, options: { ...base, bold: false, color: C.ink, breakLine: i < paras.length - 1 } });
      });
      s.addText(runs, { x: x + 0.2, y: y + 0.1 + head, w: w - 0.4, h: hh - 0.16 - head, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
    } };
  };
  items.push(card('場所', [t.where], role, { inline: true }));
  const n = t.rel.length, rh = 0.74;
  const fh = fanH(n, rh);
  items.push({ h: 0.5 + fh + 0.06, draw: (s, x, y, w) => { L.head(s, x, y, w, 0.44, 'つながり（関係図）', { role, size: 18 }); drawFan(s, x, y + 0.5, w, t, rh); } });
  // くわしく：段落ごとに独立したカード（ページをまたげるように）
  items.push(card('読み　' + t.read, [], role, { inline: true }));
  items.pop();
  t.what.forEach((p, i) => items.push(card(i === 0 ? 'くわしく' : null, (i === 0 ? ['読み：' + t.read, p] : [p]), role, { gap: 0.08 })));
  items.push(card('たとえるなら', [t.ana], 'aux', { inline: true }));
  items.push(card('こんな場面で', [t.scene], 'net', { inline: true }));
  if (t.warn) items.push(card('勘違い・つまずき', [t.warn], 'warn', { inline: true }));
  items.push(card('最初の学び方', [t.learn], 'sec', { inline: true }));
  return items;
}
function termPort(t) {
  slideDef({
    id: 't-' + t.id, ch: G.chNames[t.ch], title: t.term, lead: t.one, kinds: termKinds(t), src: termSrc(t),
    ref: t.sup === false ? `ご提供の用語解説（${t.term}）` : `編集者による補足（${t.term}）`, notes: termNotes(t),
    blocks: [{ type: 'raw', items: termPortItems(t) }],
  });
}
function termDef(t) {
  const wBefore = L.warnings.length;
  if (P) termPort(t); else termLand(t);
  L.warnings.slice(wBefore).forEach(m => { process.stdout.write(`  ⚠ ${t.id}: ${m.replace(/^\[slide \d+\] /, '')}\n`); });
}

// ---------- スライド ----------
const outIndex = [];
let pageCount = 0;
function slideDef(def) {
  const w = GEO.CW;
  const items = [];
  (def.blocks || []).forEach(b => expand(b, w).forEach(it => items.push(it)));
  const wBefore = L.warnings.length;
  const notes = def.notes !== undefined ? def.notes : undefined;
  if (!P) {
    const s = L.slide({ id: def.id, ch: def.ch, title: def.title, lead: def.lead, kinds: def.kinds || [], src: def.src || [], ref: def.ref || '', notes });
    let y = 1.95;
    items.forEach(it => { it.draw(s, GEO.X, y, w); y += it.h + (it.gap == null ? GAP : it.gap); });
    y -= GAP;
    if (y > GEO.BOT + 0.02) L.warn(`OVERFLOW 「${def.title}」 内容の下端 ${y.toFixed(2)} > ${GEO.BOT}`);
    pageCount += 1;
    outIndex.push({ n: L.index.length, id: def.id || '', ch: def.ch, title: def.title, src: def.src || [], kinds: def.kinds || [], ref: def.ref || '' });
  } else {
    portrait(def, items, notes);
  }
  const ws = L.warnings.slice(wBefore);
  ws.forEach(m => { process.stdout.write(`  ⚠ ${def.id || def.title.slice(0, 12)}: ${m.replace(/^\[slide \d+\] /, '')}\n`); });
}

function portrait(def, items, notes) {
  const pres = L.pres;
  const X = GEO.X, W = GEO.CW;
  const title = def.ptitle || def.title;
  const tLines = lineCount(title, 26, W, true);
  if (tLines > 3) L.warn('TITLE 4行以上: ' + title);
  const tH = tLines * 26 * 1.25 / 72 + 0.06;
  const lead = def.lead || '';
  const lLines = lead ? lineCount(lead, 18, W, false) : 0;
  if (lLines > 6) L.warn('LEAD 7行以上: ' + lead.slice(0, 20));
  const lH = lLines * 18 * LS / 72 + 0.05;
  // 区分チップの配置（折り返し計算）
  const chipPos = [];
  let rx = X, rRow = 0;
  (def.kinds || []).forEach(k => {
    const K = KINDS[k]; const kw = tw(K.t, 14) + 0.45;
    if (rx + kw > X + W) { rx = X; rRow += 1; }
    chipPos.push([K, rx, rRow, kw]); rx += kw + 0.1;
  });
  const kRows = (def.kinds || []).length ? rRow + 1 : 0;
  const ty = 0.68 + kRows * 0.4 + 0.1;
  const ly = ty + tH + 0.1;
  const top1 = (lead ? ly + lH : ly) + 0.25;
  // 継続ページの見出し
  const t2Lines = lineCount(def.title, 22, W, true);
  const t2H = t2Lines * 22 * 1.25 / 72 + 0.06;
  const top2 = 0.75 + t2H + 0.25;
  // ページ分割
  const pages = [];
  let cur = [], used = 0;
  items.forEach(it => {
    const top = pages.length === 0 ? top1 : top2;
    const avail = GEO.BOT - top;
    const g = cur.length ? (cur[cur.length - 1].gap == null ? GAP : cur[cur.length - 1].gap) : 0;
    if (cur.length && used + g + it.h > avail) { pages.push(cur); cur = []; used = 0; }
    const g2 = cur.length ? (cur[cur.length - 1].gap == null ? GAP : cur[cur.length - 1].gap) : 0;
    used += g2 + it.h;
    cur.push(it);
  });
  if (cur.length) pages.push(cur);
  if (!pages.length) pages.push([]);
  pages.forEach((pg, pi) => {
    const s = pres.addSlide();
    pageCount += 1;
    s.background = { color: 'FFFFFF' };
    const chTxt = def.ch + (pages.length > 1 ? `　${pi + 1}/${pages.length}` : '');
    const cw = Math.min(tw(chTxt, 14) + 0.5, W);
    s.addText(chTxt, { x: X, y: 0.26, w: cw, h: 0.34, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: 'FFFFFF', fill: { color: C.navy2 }, shape: pres.ShapeType.roundRect, rectRadius: 0.17, align: 'center', valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none' });
    let top;
    if (pi === 0) {
      chipPos.forEach(c => {
        const K = c[0];
        s.addText(K.t, { x: c[1], y: 0.68 + c[2] * 0.4, w: c[3], h: 0.34, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: K.c, fill: { color: K.f }, shape: pres.ShapeType.roundRect, rectRadius: 0.17, align: 'center', valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none', line: { color: K.c, width: 0.75 } });
      });
      s.addText(title, { x: X, y: ty, w: W, h: tH, margin: 0, fontFace: FONT, fontSize: 26, bold: true, color: C.ink, valign: 'top', lang: 'ja-JP', lineSpacing: Math.round(26 * 1.25), isTextBox: true, fit: 'none' });
      if (lead) s.addText(L.rich(lead, L.baseOpts({ color: '2B3F55' }, 18)), { x: X, y: ly, w: W, h: lH, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
      top = top1;
    } else {
      s.addText(def.title, { x: X, y: 0.75, w: W, h: t2H, margin: 0, fontFace: FONT, fontSize: 22, bold: true, color: C.ink, valign: 'top', lang: 'ja-JP', lineSpacing: Math.round(22 * 1.25), isTextBox: true, fit: 'none' });
      top = top2;
    }
    let cy = top;
    pg.forEach(it => { it.draw(s, X, cy, W); cy += it.h + (it.gap == null ? GAP : it.gap); });
    if (cy - GAP > GEO.BOT + 0.05) L.warn(`OVERFLOW(portrait) 「${def.title}」 p${pi + 1} 下端 ${(cy - GAP).toFixed(2)}`);
    const ft = def.src && def.src.length ? '出典：' + def.src.map(i => '[' + i + ']').join(' ') : '';
    if (ft) s.addText(ft, { x: X, y: 11.62, w: 4.4, h: 0.28, margin: 0, fontFace: FONT, fontSize: 12, color: C.muted, valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none' });
    s.slideNumber = { x: GEO.W - X - 0.9, y: 11.62, w: 0.9, h: 0.28, fontFace: FONT, fontSize: 12, color: C.muted, align: 'right' };
    if (notes !== undefined) s.addNotes(L.buildNotes({ notes, kinds: def.kinds || [], src: def.src || [], ref: def.ref || '' }, { n: pageCount }));
    outIndex.push({ n: pageCount, id: def.id || '', ch: def.ch, title: def.title + (pages.length > 1 ? `（${pi + 1}/${pages.length}）` : ''), src: def.src || [], kinds: def.kinds || [], ref: def.ref || '' });
  });
}

// 表紙（縦横共通の簡易版）
function cover(def) {
  const pres = L.pres;
  let s;
  if (!P) {
    s = L.slide({ dark: true, title: '表紙', ch: '', ref: '表紙', src: def.src || [], notes: def.notes });
    pageCount += 1;
    txt(s, def.kicker, { x: 0.8, y: 0.7, w: 8, h: 0.4, size: 20, bold: true, color: '9FB6D1' });
    txt(s, def.title, { x: 0.8, y: 1.35, w: 8.3, h: 2.75, size: 44, bold: true, color: 'FFFFFF', label: 'cover title' });
    txt(s, def.sub, { x: 0.8, y: 4.35, w: 8.0, h: 1.0, size: 22, color: 'CADCFC', label: 'cover sub' });
    txt(s, def.meta, { x: 0.8, y: 5.5, w: 8.4, h: 1.5, size: 18, color: '9FB6D1', label: 'cover meta' });
    const nch = (def.chips || []).length;
    (def.chips || []).forEach((t, i) => {
      const y = nch > 6 ? 0.4 + i * 0.98 : 0.55 + i * 1.1;
      L.node(s, 9.55, y, 3.3, nch > 6 ? 0.84 : 0.9, t.label, { role: t.role, solid: true, icon: t.icon, size: 20, line: false });
    });
  } else {
    s = pres.addSlide();
    pageCount += 1;
    s.background = { color: C.navy };
    txt(s, def.kicker, { x: 0.45, y: 0.7, w: 5.1, h: 0.4, size: 20, bold: true, color: '9FB6D1' });
    txt(s, def.title, { x: 0.45, y: 1.3, w: 5.1, h: 3.3, size: 36, bold: true, color: 'FFFFFF', label: 'cover title' });
    txt(s, def.sub, { x: 0.45, y: 4.8, w: 5.1, h: 1.9, size: 20, color: 'CADCFC', label: 'cover sub' });
    (def.chips || []).slice(0, 8).forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      L.node(s, 0.45 + col * 2.6, 6.75 + row * 0.92, 2.5, 0.82, t.label, { role: t.role, solid: true, icon: t.icon, size: 18, line: false });
    });
    txt(s, def.meta, { x: 0.45, y: 10.5, w: 5.1, h: 1.35, size: 16, color: '9FB6D1', label: 'cover meta' });
    if (def.notes) s.addNotes(L.buildNotes({ notes: def.notes, kinds: [], src: def.src || [], ref: '表紙' }, { n: pageCount }));
  }
  outIndex.push({ n: pageCount, id: 'cover', ch: '', title: '表紙', src: def.src || [], kinds: [], ref: '表紙' });
}

module.exports = { L, B, P, GEO, slideDef, cover, outIndex, ROLE, C, setGlossary, termDef, LAYERS, shortName, G, dk };
