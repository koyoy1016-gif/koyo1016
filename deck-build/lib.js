'use strict';
// 共通ライブラリ：配色・図形・表・シーケンス図・アイコン・はみ出し検査
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');
const SRC = require('./sources.json');
const LEADS = (() => { try { return require('./' + (process.env.LEADS || 'leads.json')); } catch (e) { return {}; } })();

const W = 13.333, H = 7.5, X0 = 0.5, CW = 12.333, Y0 = 1.8, YB = 6.95;
const FONT = 'Yu Gothic';
const LS = 1.32; // 行送り（フォントサイズ倍率）。固定値にして端末差を減らす

// 色は「役割」で固定：端末/ネットワーク/サーバー/補助・管理通信/暗号・安全/注意・誤解
const ROLE = {
  device: { d: '0B7A7A', l: 'D9F2F1' },
  net:    { d: '2F6BC2', l: 'DCE8F8' },
  server: { d: '5B46B8', l: 'E6E1F7' },
  aux:    { d: 'B45309', l: 'FDEBD0' },
  sec:    { d: '237A48', l: 'DDF1E4' },
  warn:   { d: 'C0392B', l: 'FBE3E0' },
  gray:   { d: '475569', l: 'E2E8F0' },
  navy:   { d: '16324F', l: 'DCE6F2' },
};
const C = { ink: '1B2A3A', muted: '5B6B7B', line: 'CBD5E1', panel: 'F1F5F9', white: 'FFFFFF', navy: '0F2438', navy2: '16324F', bg: 'FFFFFF' };

const KINDS = {
  general:  { t: '一般的な技術説明', f: 'E2E8F0', c: '334155' },
  official: { t: '公式資料で確認', f: 'DDF1E4', c: '14532D' },
  example:  { t: '一般例（個別サービスの仕様ではない）', f: 'DCE8F8', c: '1E3A8A' },
  review:   { t: '公開口コミの集計', f: 'FDEBD0', c: '7C2D12' },
  visit:    { t: 'OB訪問で聞いた個別例', f: 'E6E1F7', c: '3B2A8C' },
  proposal: { t: '教材の提案', f: 'D9F2F1', c: '0F4C4C' },
  assume:   { t: '仮定の算数例', f: 'FBE3E0', c: '7F1D1D' },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'ITインフラ・AI・HPEのSEに向けた統合学習資料';
pres.author = '学習教材（未経験者向け）';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

const index = [];
let curN = 0;
let warnings = [];
function warn(msg) { warnings.push(`[slide ${curN}] ${msg}`); }

// ---------- アイコン ----------
const ICON_NAMES = Object.keys(fa).filter(n => /^Fa[A-Z]/.test(n));
const iconCache = {};
async function initIcons(names, colors) {
  const jobs = [];
  for (const n of names) {
    if (!fa[n]) throw new Error('icon missing ' + n);
    for (const col of colors) {
      jobs.push((async () => {
        const svg = RDS.renderToStaticMarkup(React.createElement(fa[n], { color: '#' + col, size: 256 }));
        const buf = await sharp(Buffer.from(svg), { density: 300 }).resize(192, 192).png().toBuffer();
        iconCache[n + ':' + col] = 'image/png;base64,' + buf.toString('base64');
      })());
    }
  }
  await Promise.all(jobs);
}
function iconData(name, col) {
  const k = name + ':' + col;
  if (!iconCache[k]) throw new Error('icon not preloaded: ' + k);
  return iconCache[k];
}

// ---------- 文字幅の見積り ----------
function charW(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x2e80 || (c >= 0xff00 && c <= 0xffef) || (c >= 0x2460 && c <= 0x24ff) || (c >= 0x25a0 && c <= 0x27bf)) return 1.0;
  if (ch === ' ') return 0.32;
  if (/[A-Z0-9]/.test(ch)) return 0.62;
  if (/[iltfjI.,:;'|!]/.test(ch)) return 0.3;
  if (/[mwMW]/.test(ch)) return 0.85;
  return 0.56;
}
function plain(t) { return String(t).replace(/\*\*/g, ''); }
function lineCount(text, size, w, bold) {
  let total = 0;
  for (const p of plain(text).split('\n')) {
    let cur = 0, n = 1, prev = '';
    for (const ch of p) {
      const isC = c => { const k = c.codePointAt(0); return k >= 0x2e80 || (k >= 0xff00 && k <= 0xffef); };
      const isL = c => /[A-Za-z0-9]/.test(c);
      const extra = prev && ((isL(prev) && isC(ch)) || (isC(prev) && isL(ch))) ? 0.15 : 0;
      prev = ch;
      const cw = (charW(ch) + extra) * size / 72 * (bold ? 1.04 : 1);
      if (cur + cw > w + 1e-6) { n++; cur = cw; } else cur += cw;
    }
    total += n;
  }
  return total;
}
function need(text, size, w, bold) { return lineCount(text, size, w, bold) * size * LS / 72; }
function fit(label, text, size, w, h, bold) {
  const nh = need(text, size, w, bold);
  if (nh > h + 0.03) warn(`FIT ${label}: 必要${nh.toFixed(2)}in > 枠${h.toFixed(2)}in (${size}pt, w=${w.toFixed(2)}) 「${plain(text).slice(0, 24)}」`);
}

// ---------- リッチテキスト（**太字**） ----------
function rich(text, base) {
  const paras = Array.isArray(text) ? text : String(text).split('\n');
  const out = [];
  paras.forEach((p, pi) => {
    const parts = String(p).split('**');
    const rs = [];
    parts.forEach((seg, i) => {
      if (seg === '') return;
      rs.push({ text: seg, options: { ...base, bold: i % 2 === 1 ? true : base.bold } });
    });
    if (!rs.length) rs.push({ text: ' ', options: { ...base } });
    if (pi < paras.length - 1) rs[rs.length - 1].options.breakLine = true;
    out.push(...rs);
  });
  return out;
}
function baseOpts(o, size) {
  return { fontFace: o.face || FONT, fontSize: size, color: o.color || C.ink, bold: !!o.bold, italic: !!o.italic, lang: 'ja-JP', lineSpacing: Math.round(size * LS), align: o.align || 'left' };
}

function txt(s, text, o) {
  const size = o.size || 20;
  const m = o.margin == null ? 0 : o.margin;
  const opts = {
    x: o.x, y: o.y, w: o.w, h: o.h, margin: m, valign: o.valign || 'top', isTextBox: true, fit: 'none',
    ...(o.fill ? { fill: { color: o.fill } } : {}),
    ...(o.shape ? { shape: o.shape, rectRadius: o.r ?? 0.1 } : {}),
    ...(o.line ? { line: { color: o.line, width: o.lw || 1 } } : {}),
    ...(o.rotate ? { rotate: o.rotate } : {}),
  };
  fit(o.label || 'txt', text, size, o.w - 2 * m / 72, o.h - 2 * m / 72, o.bold);
  s.addText(rich(text, baseOpts(o, size)), opts);
}

function bullets(s, items, o) {
  const size = o.size || 22, gap = o.gap == null ? 8 : o.gap;
  const runs = [];
  let tot = 0;
  items.forEach((it, i) => {
    const t = typeof it === 'string' ? it : it.t;
    const b = { ...baseOpts(o, size), ...(typeof it === 'object' && it.color ? { color: it.color } : {}) };
    const rs = rich(t, b);
    rs[0].options.bullet = { indent: 22 };
    rs[0].options.paraSpaceAfter = gap;
    rs.forEach(r => { r.options.paraSpaceAfter = gap; r.options.bullet = { indent: 22 }; });
    if (i < items.length - 1) rs[rs.length - 1].options.breakLine = true;
    runs.push(...rs);
    tot += need(t, size, o.w - 22 / 72, false) + gap / 72;
  });
  if (tot > o.h + 0.03) warn(`FIT bullets: 必要${tot.toFixed(2)} > ${o.h.toFixed(2)} 「${plain(typeof items[0] === 'string' ? items[0] : items[0].t).slice(0, 20)}」`);
  s.addText(runs, { x: o.x, y: o.y, w: o.w, h: o.h, margin: 0, valign: o.valign || 'top', isTextBox: true, fit: 'none' });
}

// ---------- 基本図形 ----------
function rect(s, x, y, w, h, o = {}) {
  s.addShape(o.shape || pres.ShapeType.roundRect, {
    x, y, w, h, ...((o.shape || pres.ShapeType.roundRect) === pres.ShapeType.roundRect ? { rectRadius: o.r ?? 0.12 } : {}),
    fill: { color: o.fill || C.panel },
    line: o.line ? { color: o.line, width: o.lw || 1.5, dashType: o.dash || 'solid' } : { type: 'none' },
  });
}
function iconDot(s, name, x, y, d, o = {}) {
  const R = ROLE[o.role || 'navy'];
  const bg = o.bg || (o.onSolid ? 'FFFFFF' : R.d);
  const fg = o.fg || (o.onSolid ? R.d : 'FFFFFF');
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: bg }, line: { type: 'none' } });
  const p = d * 0.22;
  s.addImage({ data: iconData(name, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
function iconOnly(s, name, col, x, y, d) { s.addImage({ data: iconData(name, col), x, y, w: d, h: d }); }

// ノード（役割色の角丸ボックス）。label/sub、任意でアイコン
function node(s, x, y, w, h, label, o = {}) {
  const R = ROLE[o.role || 'gray'];
  const solid = !!o.solid;
  const fill = o.fill || (solid ? R.d : R.l);
  const tc = o.color || (solid ? 'FFFFFF' : C.ink);
  const size = o.size || 20, subSize = o.subSize || Math.max(18, size - 2);
  rect(s, x, y, w, h, { fill, line: o.line === false ? null : (o.line || R.d), lw: o.lw || 2, dash: o.dash, r: o.r });
  let tx = x + 0.1, tw = w - 0.2;
  if (o.icon) {
    const d = Math.min(0.6, h - 0.2);
    iconDot(s, o.icon, x + 0.14, y + (h - d) / 2, d, { role: o.role || 'gray', onSolid: solid });
    tx = x + 0.14 + d + 0.1; tw = x + w - tx - 0.1;
  }
  const runs = [];
  const b1 = { fontFace: FONT, fontSize: size, color: tc, bold: true, lang: 'ja-JP', lineSpacing: Math.round(size * LS), align: o.align || (o.icon ? 'left' : 'center') };
  rich(label, b1).forEach(r => runs.push(r));
  let need_h = need(label, size, tw, true);
  if (o.sub) {
    runs[runs.length - 1].options.breakLine = true;
    const b2 = { ...b1, fontSize: subSize, bold: false, color: solid ? 'F1F5F9' : C.muted, lineSpacing: Math.round(subSize * LS) };
    rich(o.sub, b2).forEach(r => runs.push(r));
    need_h += need(o.sub, subSize, tw, false);
  }
  if (need_h > h - 0.08 + 0.03) warn(`FIT node「${plain(label).slice(0, 14)}」: 必要${need_h.toFixed(2)} > ${(h - 0.08).toFixed(2)} (w=${tw.toFixed(2)})`);
  s.addText(runs, { x: tx, y, w: tw, h, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
}

// 見出しチップ（塗りつぶし）
function head(s, x, y, w, h, label, o = {}) {
  node(s, x, y, w, h, label, { role: o.role || 'navy', solid: true, size: o.size || 20, icon: o.icon, r: o.r ?? 0.1, line: false, align: o.align });
}

// カード：タイトル＋本文（左上）
function card(s, x, y, w, h, title, body, o = {}) {
  const R = ROLE[o.role || 'gray'];
  rect(s, x, y, w, h, { fill: o.fill || R.l, line: o.line === undefined ? null : o.line, r: 0.14 });
  let ty = y + 0.14, tx = x + 0.2, tw = w - 0.4;
  if (o.icon) {
    const d = 0.56;
    iconDot(s, o.icon, x + 0.18, y + 0.14, d, { role: o.role || 'gray' });
    tx = x + 0.18 + d + 0.12; tw = x + w - tx - 0.15;
    ty = y + 0.14;
  }
  const tsize = o.tsize || 22;
  const th = o.icon ? Math.max(0.56, need(title, tsize, tw, true)) : need(title, tsize, tw, true);
  txt(s, title, { x: tx, y: ty, w: tw, h: th, size: tsize, bold: true, color: R.d === '475569' ? C.ink : R.d, valign: o.icon ? 'middle' : 'top', label: 'cardTitle' });
  if (body) {
    const by = ty + th + 0.1;
    const bsize = o.size || 20;
    if (Array.isArray(body)) bullets(s, body, { x: x + 0.2, y: by, w: w - 0.4, h: y + h - by - 0.1, size: bsize, gap: o.gap == null ? 4 : o.gap });
    else txt(s, body, { x: x + 0.2, y: by, w: w - 0.4, h: y + h - by - 0.1, size: bsize, label: 'cardBody' });
  }
}

// 注意・補足ボックス
function callout(s, x, y, w, h, text, o = {}) {
  const k = o.kind || 'info';
  const map = { info: ['net', 'FaInfoCircle'], warn: ['warn', 'FaExclamationTriangle'], ok: ['sec', 'FaCheckCircle'], aux: ['aux', 'FaLightbulb'], gray: ['gray', 'FaInfoCircle'], server: ['server', 'FaInfoCircle'], device: ['device', 'FaInfoCircle'] };
  const [role, ic] = map[k];
  const R = ROLE[role];
  rect(s, x, y, w, h, { fill: R.l, line: R.d, lw: 1.5, r: 0.12 });
  const d = Math.min(0.5, h - 0.2);
  iconDot(s, o.icon || ic, x + 0.15, y + (h - d) / 2, d, { role });
  const size = o.size || 20;
  txt(s, text, { x: x + 0.15 + d + 0.15, y: y + 0.05, w: w - (0.15 + d + 0.15) - 0.15, h: h - 0.1, size, valign: 'middle', label: 'callout' });
}

// 大きな数値
function stat(s, x, y, w, h, big, label, o = {}) {
  const R = ROLE[o.role || 'navy'];
  rect(s, x, y, w, h, { fill: R.l, r: 0.14 });
  const bs = o.bigSize || 40;
  txt(s, big, { x: x + 0.1, y: y + 0.12, w: w - 0.2, h: bs * LS / 72 + 0.05, size: bs, bold: true, color: R.d, align: 'center', label: 'statBig' });
  txt(s, label, { x: x + 0.15, y: y + 0.2 + bs * LS / 72, w: w - 0.3, h: h - 0.3 - bs * LS / 72, size: o.size || 18, align: 'center', color: C.ink, label: 'statLabel' });
}

// 番号バッジ
function badge(s, n, cx, cy, o = {}) {
  const d = o.d || 0.44;
  const R = ROLE[o.role || 'navy'];
  s.addShape(pres.ShapeType.ellipse, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: o.fill || R.d }, line: { color: 'FFFFFF', width: 1.5 } });
  s.addText(String(n), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, margin: 0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: o.size || 18, bold: true, color: 'FFFFFF', isTextBox: true, fit: 'none' });
}

// 矢印（始点→終点）。label があれば中点付近に白地で表示
function arrow(s, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  const line = { color: o.color || C.ink, width: o.w || 2.5, dashType: o.dash ? 'dash' : 'solid' };
  if (o.head !== false) line.endArrowType = 'triangle';
  if (o.both) line.beginArrowType = 'triangle';
  s.addShape(pres.ShapeType.line, { x, y, w, h, flipH: x2 < x1, flipV: y2 < y1, line });
  if (o.label) {
    const size = o.lsize || 18;
    const lw = o.lw || Math.min(Math.max(tw(o.label, size) + 0.2, 0.5), 4.2);
    const lh = need(o.label, size, lw - 0.1, false) + 0.06;
    const mx = (x1 + x2) / 2 + (o.dx || 0), my = (y1 + y2) / 2 + (o.dy || 0);
    s.addText(rich(o.label, baseOpts({ color: o.lcolor || o.color || C.ink, align: 'center', bold: true }, size)), { x: mx - lw / 2, y: my - lh / 2, w: lw, h: lh, margin: 0, valign: 'middle', align: 'center', fill: { color: o.lfill || 'FFFFFF' }, isTextBox: true, fit: 'none' });
  }
}
function tw(text, size) { let w = 0; for (const ch of plain(text)) w += charW(ch); return w * size / 72; }

// 表（行高を自前で見積もって設定）
function table(s, rows, o) {
  const size = o.size || 18;
  const colW = o.colW;
  const mTB = o.padY || 5, mLR = o.padX || 9;
  const heads = o.head === false ? 0 : 1;
  const out = [];
  const rh = [];
  rows.forEach((row, ri) => {
    let mh = 0;
    const cells = row.map((cell, ci) => {
      const c = typeof cell === 'string' ? { t: cell } : cell;
      const isHead = ri < heads;
      const colorRole = c.role || (o.rowRole && o.rowRole[ri]) || null;
      const fs = c.size || size;
      const bold = isHead || c.bold || (ci === 0 && o.firstBold !== false);
      const txtc = isHead ? 'FFFFFF' : (c.color || (colorRole && ci === 0 ? ROLE[colorRole].d : C.ink));
      const fill = isHead ? (o.headFill || C.navy2) : (c.fill || (colorRole && ci === 0 ? ROLE[colorRole].l : (o.zebra !== false && (ri - heads) % 2 === 1 ? 'F5F8FB' : 'FFFFFF')));
      const cw = colW[ci] - 2 * mLR / 72;
      const n = need(c.t, fs, cw, bold) + 2 * mTB / 72;
      mh = Math.max(mh, n);
      const base = { fontFace: c.face || FONT, fontSize: fs, color: txtc, bold, lang: 'ja-JP', lineSpacing: Math.round(fs * LS), align: c.align || (isHead ? 'center' : 'left') };
      return {
        text: rich(c.t, base),
        options: { fill: { color: fill }, valign: 'middle', align: c.align || (isHead ? 'center' : 'left'), margin: [mTB, mLR, mTB, mLR], border: [{ type: 'solid', pt: 0.75, color: 'CBD5E1' }, { type: 'solid', pt: 0.75, color: 'CBD5E1' }, { type: 'solid', pt: 0.75, color: 'CBD5E1' }, { type: 'solid', pt: 0.75, color: 'CBD5E1' }] },
      };
    });
    rh.push(Math.max(mh, ri < heads ? 0.5 : (o.minRow || 0.5)));
    out.push(cells);
  });
  const total = rh.reduce((a, b) => a + b, 0);
  const maxH = o.maxH || (YB - o.y);
  if (total > maxH + 0.03) warn(`FIT table: 高さ${total.toFixed(2)} > ${maxH.toFixed(2)} (行数${rows.length})`);
  s.addTable(out, { x: o.x, y: o.y, w: colW.reduce((a, b) => a + b, 0), colW, rowH: rh, autoPage: false });
  return total;
}

// シーケンス図
function sequence(s, o) {
  const { x, y, w, h, actors, msgs } = o;
  const size = o.size || 18;
  const N = actors.length;
  const cx = i => x + w * (i + 0.5) / N;
  const aw = Math.min(2.7, w / N - 0.2), ah = o.ah || 0.72;
  actors.forEach((a, i) => {
    node(s, cx(i) - aw / 2, y, aw, ah, a.label, { role: a.role || 'gray', solid: true, size: 18, icon: a.icon, sub: a.sub, subSize: 18, r: 0.1 });
  });
  const top = y + ah, bottom = y + h;
  actors.forEach((a, i) => {
    s.addShape(pres.ShapeType.line, { x: cx(i), y: top, w: 0, h: bottom - top, line: { color: '94A3B8', width: 1.5, dashType: 'dash' } });
  });
  // 各メッセージの高さ
  const hs = msgs.map(m => {
    if (m.note) {
      const i = m.from, j = m.to == null ? m.from : m.to;
      const span = Math.abs(cx(j) - cx(i)) + Math.min(aw, 2.4);
      return need(m.note, size, (m.noteW || span) - 0.3, false) + 0.3;
    }
    const span = Math.abs(cx(m.t) - cx(m.f)) - 0.3;
    return need(m.text, size, span, true) + 0.26;
  });
  const sumH = hs.reduce((a, b) => a + b, 0);
  const avail = bottom - top - 0.1;
  if (sumH > avail + 0.03) warn(`FIT sequence: 必要${sumH.toFixed(2)} > ${avail.toFixed(2)}`);
  const extra = Math.max(0, (avail - sumH) / msgs.length);
  let cy = top + 0.1;
  msgs.forEach((m, k) => {
    const hh = hs[k] + extra;
    if (m.note) {
      const i = m.from, j = m.to == null ? m.from : m.to;
      const span = (m.noteW || (Math.abs(cx(j) - cx(i)) + Math.min(aw, 2.4)));
      const mid = (cx(i) + cx(j)) / 2;
      const R = ROLE[m.role || 'aux'];
      rect(s, mid - span / 2, cy + 0.04, span, hh - 0.08, { fill: R.l, line: R.d, lw: 1.25, r: 0.1 });
      txt(s, m.note, { x: mid - span / 2 + 0.15, y: cy + 0.04, w: span - 0.3, h: hh - 0.08, size, align: 'center', valign: 'middle', label: 'seqNote' });
    } else {
      const ay = cy + hh - 0.17;
      const dir = cx(m.t) > cx(m.f) ? 1 : -1;
      const col = m.color || (m.role ? ROLE[m.role].d : C.ink);
      const lbl = m.text;
      const lx = Math.min(cx(m.f), cx(m.t)) + 0.15, lw = Math.abs(cx(m.t) - cx(m.f)) - 0.3;
      const lh = need(lbl, size, lw, true);
      txt(s, lbl, { x: lx, y: ay - lh - 0.04, w: lw, h: lh, size, bold: true, color: col === C.ink ? C.ink : col, align: 'center', valign: 'bottom', label: 'seqMsg' });
      arrow(s, cx(m.f) + dir * 0.04, ay, cx(m.t) - dir * 0.04, ay, { color: col, dash: m.dash, w: m.w || 2.5 });
    }
    cy += hh;
  });
}

// ---------- スライド ----------
function slide(o) {
  const s = pres.addSlide();
  curN = index.length + 1;
  s.background = { color: o.dark ? C.navy : C.bg };
  const LD = LEADS[o.title];
  const title = (LD && LD.t) || o.title;
  const lead = o.lead || (LD && LD.l);
  const info = { n: curN, id: o.id || '', ch: o.ch || '', title: title, src: o.src || [], kinds: o.kinds || [], ref: o.ref || '' };
  index.push(info);
  if (!o.dark) {
    // 章チップ
    if (o.ch) {
      const cw = Math.min(tw(o.ch, 14) + 0.5, 5.2);
      s.addText(o.ch, { x: X0, y: 0.26, w: cw, h: 0.34, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: 'FFFFFF', fill: { color: C.navy2 }, shape: pres.ShapeType.roundRect, rectRadius: 0.17, align: 'center', valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none' });
    }
    // 情報区分タグ（右上）
    let rx = W - X0;
    (o.kinds || []).slice().reverse().forEach(k => {
      const K = KINDS[k];
      if (!K) throw new Error('kind ' + k);
      const w = tw(K.t, 14) + 0.45;
      rx -= w;
      s.addText(K.t, { x: rx, y: 0.26, w, h: 0.34, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: K.c, fill: { color: K.f }, shape: pres.ShapeType.roundRect, rectRadius: 0.17, align: 'center', valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none', line: { color: K.c, width: 0.75 } });
      rx -= 0.12;
    });
    // タイトル（1行）＋説明文（最大2行）
    const ts = 30;
    if (lineCount(title, ts, CW, true) > 1) warn('TITLE 2行以上: ' + title);
    if (o.titleSuffix && tw(title, ts) * 1.04 + tw('　' + o.titleSuffix, 18) < CW - 0.15) {
      const bo = { fontFace: FONT, lang: 'ja-JP', lineSpacing: Math.round(ts * 1.25) };
      s.addText([{ text: title, options: { ...bo, fontSize: ts, bold: true, color: C.ink } }, { text: '　' + o.titleSuffix, options: { ...bo, fontSize: 18, bold: false, color: C.muted } }], { x: X0, y: 0.62, w: CW, h: 0.5, margin: 0, valign: 'middle', isTextBox: true, fit: 'none' });
    } else {
    s.addText(title, { x: X0, y: 0.62, w: CW, h: 0.5, margin: 0, fontFace: FONT, fontSize: ts, bold: true, color: C.ink, valign: 'middle', lang: 'ja-JP', lineSpacing: Math.round(ts * 1.25), isTextBox: true, fit: 'none' });
    }
    if (lead) {
      if (lineCount(lead, 18, CW, false) > 2) warn('LEAD 3行以上: ' + plain(lead).slice(0, 30));
      s.addText(rich(lead, baseOpts({ color: '2B3F55' }, 18)), { x: X0, y: 1.12, w: CW, h: 0.68, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
    } else if (!o.noLead) warn('NO LEAD: ' + title);
    // フッター
    const ft = (o.src && o.src.length ? '出典：' + o.src.map(i => '[' + i + ']').join(' ') : '');
    if (ft) s.addText(ft, { x: X0, y: 7.08, w: 11.0, h: 0.28, margin: 0, fontFace: FONT, fontSize: 12, color: C.muted, valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none' });
    s.slideNumber = { x: W - X0 - 0.9, y: 7.08, w: 0.9, h: 0.28, fontFace: FONT, fontSize: 12, color: C.muted, align: 'right' };
  }
  if (o.notes !== undefined) s.addNotes(buildNotes(o, info));
  return s;
}

// ノート：見出し付きで整形し、出典と情報区分を自動付記
function N(parts) {
  const order = [['read', '図の読み方'], ['terms', '用語'], ['ex', '身近な例'], ['detail', '処理の詳細'], ['cond', '成立条件・例外'], ['myth', 'よくある誤解'], ['why', 'なぜ重要か'], ['do', '自分でやってみる'], ['extra', '補足']];
  const out = [];
  for (const [k, label] of order) {
    if (!parts[k]) continue;
    const v = Array.isArray(parts[k]) ? parts[k].map(x => '・' + x).join('\n') : parts[k];
    out.push(`【${label}】\n${v}`);
  }
  return out.join('\n\n');
}
function buildNotes(o, info) {
  let t = typeof o.notes === 'string' ? o.notes : N(o.notes);
  t += '\n\n【情報の区分】\n' + ((o.kinds && o.kinds.length) ? o.kinds.map(k => KINDS[k].t).join(' / ') : '一般的な技術説明・教材上の整理');
  if (o.src && o.src.length) {
    t += '\n\n【出典（資料名・URL）】';
    for (const id of o.src) {
      const S = SRC.src[id];
      if (!S) throw new Error('unknown source ' + id);
      t += `\n[${id}] ${S.t}`;
      S.u.forEach(u => { t += `\n    ${u}`; });
    }
    t += '\n確認時点：原資料の記載は2026年9月30日〜10月1日（日本時間）。変わりやすい情報（価格・製品・採用条件）は最新の公式ページで再確認してください。';
  }
  t += `\n\n（スライド${info.n}／${o.ref ? '資料の該当箇所：' + o.ref : ''}）`;
  return t;
}

// ---------- 棒グラフ（ネイティブ） ----------
function bar(s, o) {
  const data = [{ name: o.name || '値', labels: o.labels, values: o.values }];
  s.addChart(pres.charts.BAR, data, {
    x: o.x, y: o.y, w: o.w, h: o.h, barDir: o.horizontal ? 'bar' : 'col',
    chartColors: o.colors, showLegend: false, showTitle: !!o.title, title: o.title, titleFontSize: 18, titleColor: C.ink, titleFontFace: FONT,
    showValue: true, dataLabelFontSize: 18, dataLabelFontFace: FONT, dataLabelColor: C.ink, dataLabelFormatCode: o.fmt || '#,##0', dataLabelPosition: o.dlpos || 'outEnd',
    catAxisLabelFontSize: o.catSize || 18, catAxisLabelFontFace: FONT, catAxisLabelColor: C.ink, valAxisLabelFontSize: 16, valAxisLabelColor: C.muted, valAxisLabelFontFace: FONT,
    valGridLine: o.grid ? { color: 'E2E8F0', size: 0.75 } : { style: 'none' }, catGridLine: { style: 'none' }, valAxisHidden: o.hideVal !== false, valAxisMaxVal: o.max, valAxisMinVal: 0,
    valAxisTitle: o.valTitle, showValAxisTitle: !!o.valTitle, valAxisTitleFontSize: 16, valAxisTitleColor: C.muted, barGapWidthPct: o.gap || 60,
    catAxisOrientation: o.horizontal ? 'maxMin' : 'minMax',
  });
}


// 凡例（役割色）
function legend(s, x, y, items, o = {}) {
  let cx = x;
  const size = o.size || 18;
  items.forEach(it => {
    const R = ROLE[it.role];
    s.addShape(pres.ShapeType.roundRect, { x: cx, y: y + 0.06, w: 0.4, h: 0.26, rectRadius: 0.05, fill: { color: R.l }, line: { color: R.d, width: 2, dashType: it.dash ? 'dash' : 'solid' } });
    const w = tw(it.label, size) + 0.15;
    s.addText(it.label, { x: cx + 0.5, y, w, h: 0.38, margin: 0, fontFace: FONT, fontSize: size, color: C.ink, valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none' });
    cx += 0.5 + w + 0.3;
  });
  if (cx - 0.3 > W - X0 + 0.05) warn('legend幅超過 ' + cx.toFixed(2));
}
// 番号付き縦リスト（バッジ＋文）
function numList(s, o) {
  const { x, y, w, items } = o;
  const size = o.size || 20, rowH = o.rowH || 0.8;
  items.forEach((it, i) => {
    const cy = y + i * rowH + rowH / 2;
    badge(s, o.labels ? o.labels[i] : i + 1, x + 0.25, cy, { role: o.role || 'navy', d: 0.46 });
    txt(s, it, { x: x + 0.65, y: y + i * rowH, w: w - 0.65, h: rowH - 0.04, size, valign: 'middle', label: 'numList' });
  });
}

// 情報区分チップ（凡例用）
function chip(s, K, x, y, w) {
  s.addText(K.t, { x, y, w, h: 0.34, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: K.c, fill: { color: K.f }, shape: pres.ShapeType.roundRect, rectRadius: 0.17, align: 'center', valign: 'middle', lang: 'ja-JP', isTextBox: true, fit: 'none', line: { color: K.c, width: 0.75 } });
}

function addSources(obj) { for (const k of Object.keys(obj)) { SRC.src[k] = obj[k]; if (!SRC.order.includes(k)) SRC.order.push(k); } }

// 等幅コードブロック（ASCIIのコード向け）。lines=[文字列]。badges=行ごとの番号（任意）
function code(s, x, y, w, lines, o = {}) {
  const size = o.size || 18;
  const lh = size * 1.35 / 72;
  const h = lines.length * lh + 0.3;
  rect(s, x, y, w, h, { fill: '0F2438', r: 0.12 });
  const runs = lines.map((ln, i) => ({ text: ln === '' ? ' ' : ln, options: { fontFace: 'Courier New', fontSize: size, color: /^\s*#/.test(ln) ? '9FB6D1' : 'E2E8F0', lang: 'en-US', lineSpacing: Math.round(size * 1.35), breakLine: i < lines.length - 1 } }));
  s.addText(runs, { x: x + 0.2, y: y + 0.12, w: w - 0.4, h: h - 0.24, margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
  lines.forEach(ln => { if (tw(ln, size) * 0.9 > w - 0.4) warn('code行が長い: ' + ln.slice(0, 30)); });
  return h;
}

// プロトコルヘッダーの32ビット幅グリッド。rows=[[{t, bits, role?}]]（各行の合計＝32）
function hdrGrid(s, x, y, w, rows, o = {}) {
  const rh = o.rowH || 0.78;
  rows.forEach((row, ri) => {
    let cx = x;
    const sum = row.reduce((a, c) => a + c.bits, 0);
    row.forEach(c => {
      const cw = w * c.bits / 32;
      const Rr = ROLE[c.role || 'net'];
      rect(s, cx, y + ri * rh, cw, rh, { fill: c.fill || Rr.l, line: Rr.d, lw: 1.25, r: 0.04 });
      const label = c.t + (c.b ? '\n' + c.b : '');
      const need_h = need(label, 18, cw - 0.1, true);
      if (need_h > rh - 0.04) warn(`FIT hdr「${c.t}」必要${need_h.toFixed(2)} > ${(rh - 0.04).toFixed(2)} (w=${cw.toFixed(2)})`);
      s.addText(rich(label, { fontFace: FONT, fontSize: 18, color: C.ink, bold: true, lang: 'ja-JP', lineSpacing: Math.round(18 * LS), align: 'center' }), { x: cx + 0.03, y: y + ri * rh, w: cw - 0.06, h: rh, margin: 0, valign: 'middle', align: 'center', isTextBox: true, fit: 'none' });
      cx += cw;
    });
    if (sum !== 32) warn('hdrGrid行のビット合計が32でない: ' + sum);
  });
  return rows.length * rh;
}

async function finish(file) {
  await pres.writeFile({ fileName: file });
  return { index, warnings };
}

module.exports = {
  pres, W, H, X0, CW, Y0, YB, FONT, C, ROLE, KINDS, LS,
  initIcons, iconData, ICON_NAMES, slide, N, txt, bullets, rect, node, head, card, callout, stat, badge, arrow, table, sequence, bar,
  iconDot, iconOnly, tw, need, fit, lineCount, finish, index, warn, legend, numList, chip, addSources, code, hdrGrid, SRC, buildNotes, rich, baseOpts, charW, plain,
  get warnings() { return warnings; },
};
