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
    default: throw new Error('unknown block ' + b.type);
  }
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
    (def.chips || []).forEach((t, i) => {
      const y = 0.55 + i * 1.1;
      L.node(s, 9.55, y, 3.3, 0.9, t.label, { role: t.role, solid: true, icon: t.icon, size: 20, line: false });
    });
  } else {
    s = pres.addSlide();
    pageCount += 1;
    s.background = { color: C.navy };
    txt(s, def.kicker, { x: 0.45, y: 0.7, w: 5.1, h: 0.4, size: 20, bold: true, color: '9FB6D1' });
    txt(s, def.title, { x: 0.45, y: 1.3, w: 5.1, h: 3.3, size: 36, bold: true, color: 'FFFFFF', label: 'cover title' });
    txt(s, def.sub, { x: 0.45, y: 4.8, w: 5.1, h: 1.9, size: 20, color: 'CADCFC', label: 'cover sub' });
    (def.chips || []).slice(0, 6).forEach((t, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      L.node(s, 0.45 + col * 2.6, 7.0 + row * 1.1, 2.5, 0.95, t.label, { role: t.role, solid: true, icon: t.icon, size: 18, line: false });
    });
    txt(s, def.meta, { x: 0.45, y: 10.3, w: 5.1, h: 1.4, size: 18, color: '9FB6D1', label: 'cover meta' });
    if (def.notes) s.addNotes(L.buildNotes({ notes: def.notes, kinds: [], src: def.src || [], ref: '表紙' }, { n: pageCount }));
  }
  outIndex.push({ n: pageCount, id: 'cover', ch: '', title: '表紙', src: def.src || [], kinds: [], ref: '表紙' });
}

module.exports = { L, B, P, GEO, slideDef, cover, outIndex, ROLE, C };
