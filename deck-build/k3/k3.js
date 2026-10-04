'use strict';
// 初学者向け自習教材用の描画キット（16:9・本文22pt）
// 1) 全スライドを「ページ」に展開（表の自動分割・問い→答えの2ページ化）
// 2) ページ番号を確定し、[[p:id]] 参照を解決
// 3) 描画・はみ出し検査・用語の初出検査
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');

const W = 13.333, H = 7.5, X = 0.55, CW = W - 2 * X, BOT = 6.92;
const FONT = 'Yu Gothic', MONO = 'Consolas';
const LS = 1.3;
const SZ = { title: 30, lead: 22, body: 22, small: 20, fig: 18, figSub: 16, table: 20, foot: 12 };
const TERM = '0057A8';
// 図の色：機械／部品／ソフト／データ／役割／場所／人／注意
const K = {
  ink: '1F2937', muted: '4B5563', line: 'CBD5E1', bg: 'FFFFFF', panel: 'F3F5F8',
  machine: { f: 'E9EDF2', b: '475569', t: '1F2937' },
  part: { f: 'F6F7F9', b: '64748B', t: '1F2937' },
  software: { f: 'F1ECFB', b: '6D4AA8', t: '3B2370' },
  data: { f: 'E7F5EC', b: '2E7D4F', t: '1D4D32' },
  role: { f: 'FFFFFF', b: '0F766E', t: '0F4F4A' },
  place: { f: 'FFFBF2', b: 'B7791F', t: '7A4E0E' },
  person: { f: 'FDEEE3', b: 'C2410C', t: '7C2D12' },
  service: { f: 'E6F2FA', b: '2B6CB0', t: '1E3A5F' },
  note: { f: 'FFFFFF', b: '94A3B8', t: '1F2937' },
  hl: 'F59E0B',
  flow: '1F2937', aux: '7C3AED', cable: '6B7280', power: 'B45309', ret: '0F766E',
};
const BOXK = {
  key: { f: 'EEF2F7', b: '334155', icon: 'FaKey', t: 'ポイント' },
  analogy: { f: 'FFF8E1', b: 'B7791F', icon: 'FaLightbulb', t: 'たとえ' },
  limit: { f: 'FDF2E9', b: 'C2410C', icon: 'FaExclamationCircle', t: 'たとえの限界' },
  caution: { f: 'FDECEC', b: 'B91C1C', icon: 'FaExclamationTriangle', t: '注意' },
  info: { f: 'EEF4FB', b: '475569', icon: 'FaInfoCircle', t: '補足' },
  example: { f: 'EDF7F0', b: '2E7D4F', icon: 'FaClipboardList', t: '具体例' },
  assume: { f: 'F5F3FF', b: '6D28D9', icon: 'FaFlask', t: '説明用の例' },
  check: { f: 'ECFDF5', b: '047857', icon: 'FaCheckCircle', t: 'ここまでで説明できること' },
  next: { f: 'EEF2FF', b: '4338CA', icon: 'FaArrowRight', t: '次へのつながり' },
  diff: { f: 'F8FAFC', b: '475569', icon: 'FaBalanceScale', t: '似た言葉との違い' },
  why: { f: 'FFF7ED', b: '9A3412', icon: 'FaQuestionCircle', t: 'なぜ必要か' },
};
const CAT = { // DEF カードの分類チップ
  '機械': 'machine', '部品': 'part', 'ソフトウェア': 'software', 'データ': 'data', '役割': 'role', '通信の約束': 'service',
  'サービス': 'service', '考え方': 'note', '指標': 'note', '場所・施設': 'place', '活動': 'person', '製品': 'machine', '会社': 'place', '記号': 'note', '仕組み': 'note',
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'ITインフラ・AI基盤 自習ガイド（初学者向け再構築版）';
pres.author = '自習用教材';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

const warnings = [];
let curPage = 0;
const warn = m => warnings.push(`[p${curPage}] ${m}`);

// ---------- アイコン ----------
const iconCache = {};
async function initIcons(names) {
  const cols = ['FFFFFF', K.ink, K.machine.b, K.software.b, K.data.b, K.role.b, K.place.b, K.person.b, K.service.b, ...Object.values(K).filter(v => v && v.b).map(v => v.b), '64748B', '94A3B8', ...Object.values(BOXK).map(b => b.b), TERM];
  const jobs = [];
  for (const n of new Set(names)) {
    if (!fa[n]) { warnings.push('icon missing ' + n); continue; }
    for (const c of new Set(cols)) jobs.push((async () => {
      const svg = RDS.renderToStaticMarkup(React.createElement(fa[n], { color: '#' + c, size: 256 }));
      const buf = await sharp(Buffer.from(svg), { density: 300 }).resize(160, 160).png().toBuffer();
      iconCache[n + ':' + c] = 'image/png;base64,' + buf.toString('base64');
    })());
  }
  await Promise.all(jobs);
}
function icon(s, name, col, x, y, d) {
  const k = name + ':' + col;
  if (!iconCache[k]) { warn('icon not loaded ' + k); return; }
  s.addImage({ data: iconCache[k], x, y, w: d, h: d });
}

// ---------- 文字幅 ----------
function charW(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x2e80 || (c >= 0xff00 && c <= 0xffef) || (c >= 0x2460 && c <= 0x24ff) || (c >= 0x2190 && c <= 0x27bf)) return 1.0;
  if (ch === ' ') return 0.3;
  if (/[A-Z0-9]/.test(ch)) return 0.64;
  if (/[iltfjI.,:;'|!]/.test(ch)) return 0.3;
  if (/[mwMW]/.test(ch)) return 0.86;
  return 0.57;
}
const strip = t => String(t).replace(/\*\*/g, '').replace(/\{([^{}]+)\}/g, '$1').replace(/\[\[p:([^\]]+)\]\]/g, 'p.000');
function lineCount(text, size, w, bold, mono) {
  let total = 0;
  for (const p of strip(text).split('\n')) {
    let cur = 0, n = 1;
    const units = (process.env.WORDWRAP === '0' || mono) ? [...p] : (p.match(/[A-Za-z0-9][A-Za-z0-9.,:/_%+\-']*|[\s\S]/gu) || []);
    for (const u of units) {
      let uw = 0; for (const ch of u) uw += (mono ? (charW(ch) >= 1 ? 1 : 0.6) : charW(ch)) * size / 72 * (bold ? 1.05 : 1);
      if (cur + uw > w + 1e-6) {
        if (uw > w) { for (const ch of u) { const cw = charW(ch) * size / 72 * (bold ? 1.05 : 1); if (cur + cw > w + 1e-6) { n++; cur = cw; } else cur += cw; } }
        else { n++; cur = uw; }
      } else cur += uw;
    }
    total += n;
  }
  return total;
}
const need = (t, size, w, bold, mono) => lineCount(t, size, w, bold, mono) * size * LS / 72;
const tw = (t, size, bold) => { let w = 0; for (const ch of strip(t)) w += charW(ch); return w * size / 72 * (bold ? 1.05 : 1); };

// ---------- ページ参照・用語 ----------
let PAGES = {};   // id -> page
const seenTerms = new Set();
const termUse = []; // {term, page}
function resolveRefs(t) {
  return String(t).replace(/\[\[p:([^\]]+)\]\]/g, (m, id) => { if (!PAGES[id]) { warn('参照先なし ' + id); return 'p.?'; } return 'p.' + PAGES[id]; });
}
// **太字**、{重点用語}（濃い青。初出は太字）
function rich(text, base) {
  const out = [];
  const paras = resolveRefs(text).split('\n');
  paras.forEach((p, pi) => {
    const re = /(\*\*[^*]+\*\*|\{[^{}]+\})/g;
    let last = 0, m;
    const push = (t, o) => { if (t) out.push({ text: t, options: { ...base, ...o } }); };
    while ((m = re.exec(p))) {
      push(p.slice(last, m.index), {});
      const tok = m[0];
      if (tok.startsWith('**') && !/\{[^{}]+\}/.test(tok)) push(tok.slice(2, -2), { bold: true });
      else if (tok.startsWith('**')) {
        tok.slice(2, -2).split(/(\{[^{}]+\})/).forEach(part => {
          if (/^\{[^{}]+\}$/.test(part)) { const term = part.slice(1, -1); if (!seenTerms.has(term)) seenTerms.add(term); termUse.push({ term, page: curPage }); push(term, { color: base.color === 'FFFFFF' ? 'FFFFFF' : TERM, bold: true }); }
          else push(part, { bold: true });
        });
      }
      else {
        const term = tok.slice(1, -1);
        const first = !seenTerms.has(term);
        if (first) seenTerms.add(term);
        termUse.push({ term, page: curPage });
        push(term, { color: base.color === 'FFFFFF' ? 'FFFFFF' : TERM, bold: first || base.bold });
      }
      last = m.index + tok.length;
    }
    push(p.slice(last), {});
    if (!out.length || (out.length && pi < paras.length - 1 && out[out.length - 1].options.breakLine)) push(' ', {});
    if (pi < paras.length - 1) out[out.length - 1].options.breakLine = true;
  });
  return out;
}
const bo = (size, o = {}) => ({ fontFace: o.face || FONT, fontSize: size, color: o.color || K.ink, bold: !!o.bold, lang: 'ja-JP', lineSpacing: Math.round(size * (o.ls || LS)), align: o.align || 'left', paraSpaceAfter: o.psa || 0 });
function txt(s, text, o) {
  const size = o.size || SZ.body;
  const h = need(text, size, o.w, o.bold, o.mono);
  if (!o.nofit && h > o.h + 0.04) warn(`FIT text ${h.toFixed(2)}>${o.h.toFixed(2)} 「${strip(text).slice(0, 18)}」`);
  s.addText(rich(text, bo(size, o)), { x: o.x, y: o.y, w: o.w, h: o.h, margin: 0, valign: o.valign || 'top', isTextBox: true, fit: 'none', ...(o.fill ? { fill: { color: o.fill } } : {}) });
}
function rect(s, x, y, w, h, o = {}) {
  const shape = o.shape || pres.ShapeType.roundRect;
  s.addShape(shape, { x, y, w, h, ...(shape === pres.ShapeType.roundRect ? { rectRadius: o.r ?? 0.1 } : {}), fill: o.fill === null ? { type: 'none' } : { color: o.fill || K.panel }, line: o.line ? { color: o.line, width: o.lw || 1.5, dashType: o.dash || 'solid' } : { type: 'none' } });
}
function arrow(s, x1, y1, x2, y2, o = {}) {
  const line = { color: o.color || K.flow, width: o.w || 2.5, dashType: o.dash || 'solid' };
  if (o.head !== false) line.endArrowType = 'triangle';
  if (o.both) line.beginArrowType = 'triangle';
  s.addShape(pres.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipH: x2 < x1, flipV: y2 < y1, line });
}
function badgeNum(s, n, cx, cy, d = 0.4, col = '374151') {
  s.addShape(pres.ShapeType.ellipse, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: col }, line: { color: 'FFFFFF', width: 1 } });
  s.addText(String(n), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, margin: 0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: Math.round(d * 40), bold: true, color: 'FFFFFF', isTextBox: true, fit: 'none' });
}
function chip(s, text, x, y, o = {}) {
  const size = o.size || 14;
  const w = o.w || tw(text, size, true) + 0.36;
  s.addText(text, { x, y, w, h: o.h || 0.34, margin: 0, fontFace: FONT, fontSize: size, bold: true, color: o.color || 'FFFFFF', fill: { color: o.fill || '334155' }, shape: pres.ShapeType.roundRect, rectRadius: 0.16, align: 'center', valign: 'middle', isTextBox: true, fit: 'none', ...(o.line ? { line: { color: o.line, width: 1 } } : {}) });
  return w;
}

// ======================= ブロック（計測と描画） =======================
// 各ブロック → { h, draw(s, x, y, w) }（w は与えられた幅）
const GAP = 0.18;
function measureBlock(b, w) {
  const f = BLK[b.t];
  if (!f) throw new Error('unknown block ' + b.t);
  return f(b, w);
}
const BLK = {
  // 段落
  p: (b, w) => {
    const size = b.size || SZ.body;
    const paras = Array.isArray(b.text) ? b.text : [b.text];
    const hs = paras.map(t => need(t, size, w, b.bold));
    const h = hs.reduce((a, x) => a + x, 0) + (paras.length - 1) * 0.1;
    return { h, draw: (s, x, y) => { let cy = y; paras.forEach((t, i) => { txt(s, t, { x, y: cy, w, h: hs[i] + 0.02, size, bold: b.bold, color: b.color, align: b.align }); cy += hs[i] + 0.1; }); } };
  },
  // 箇条書き（item は文字列、または {t, sub:[...]}）
  ul: (b, w) => {
    const size = b.size || SZ.body;
    const items = b.items.map(it => (typeof it === 'string' ? { t: it } : it));
    const ind = b.num ? 0.52 : 0.34;
    const hs = items.map(it => need(it.t, size, w - ind) + (it.sub ? it.sub.reduce((a, x) => a + need(x, size - 2, w - ind * 2), 0) : 0));
    const gap = b.gap ?? 0.08;
    const h = hs.reduce((a, x) => a + x, 0) + gap * (items.length - 1);
    return { h, draw: (s, x, y) => {
      let cy = y;
      items.forEach((it, i) => {
        const mark = b.num ? null : '●';
        if (b.num) badgeNum(s, b.start ? b.start + i : i + 1, x + 0.2, cy + size * LS / 72 / 2, 0.38, b.numColor || '374151');
        else s.addText(mark, { x, y: cy + 0.02, w: 0.3, h: size * LS / 72, margin: 0, fontFace: FONT, fontSize: size * 0.5, color: b.dot || '64748B', valign: 'middle', isTextBox: true });
        const h1 = need(it.t, size, w - ind);
        txt(s, it.t, { x: x + ind, y: cy, w: w - ind, h: h1 + 0.02, size });
        let sy = cy + h1;
        (it.sub || []).forEach(st => { const h2 = need(st, size - 2, w - ind * 2); txt(s, '・' + st, { x: x + ind * 2, y: sy, w: w - ind * 2, h: h2 + 0.02, size: size - 2, color: K.muted }); sy += h2; });
        cy += hs[i] + gap;
      });
    } };
  },
  // 囲み（kind: key/analogy/limit/caution/info/example/assume/check/next/diff/why）
  box: (b, w) => {
    const k = BOXK[b.kind || 'key'];
    const size = b.size || SZ.body;
    const title = b.title === undefined ? k.t : b.title;
    const iw = w - 0.36;
    const tLines = title ? lineCount(title, 20, w - 0.76, true) : 0;
    const th = title ? 0.42 + (tLines - 1) * 20 * LS / 72 : 0;
    const paras = Array.isArray(b.text) ? b.text : [b.text];
    const bh = paras.reduce((a, t) => a + need(t, size, iw), 0) + (paras.length - 1) * 0.06;
    const h = 0.14 + th + bh + 0.14;
    return { h, draw: (s, x, y) => {
      rect(s, x, y, w, h, { fill: k.f, line: k.b, lw: 1.5, r: 0.08 });
      if (title) { icon(s, k.icon, k.b, x + 0.18, y + 0.14, 0.32); txt(s, title, { x: x + 0.58, y: y + 0.11, w: w - 0.76, h: th - 0.02, size: 20, bold: true, color: k.b, valign: tLines > 1 ? 'top' : 'middle' }); }
      let cy = y + 0.14 + th;
      paras.forEach(t => { const hh = need(t, size, iw); txt(s, t, { x: x + 0.18, y: cy, w: iw, h: hh + 0.02, size }); cy += hh + 0.06; });
    } };
  },
  // 用語カード
  def: (b, w) => {
    const size = b.size || SZ.body;
    const rows = [['何か', b.what], ['なぜ必要か', b.why], ['どこにあるか', b.where], ['受け取る→する→返す', b.io], ['身近な例', b.ex], ['似た言葉との違い', b.diff]].filter(r => r[1]);
    const lw = 2.35, iw = w - 0.3 - lw;
    const headLine = b.term + (b.read ? `（${b.read}）` : '');
    const sub = [b.abbr ? `略語：${b.abbr}${b.full ? '＝' + b.full : ''}` : '', b.ja ? `日本語：${b.ja}` : ''].filter(Boolean).join('　');
    const hh = 0.12 + need(headLine, 26, w - 2.6, true) + (sub ? need(sub, 18, w - 0.4) : 0) + 0.1;
    const rh = rows.map(r => Math.max(need(r[1], size, iw), need(r[0], 18, lw - 0.1, true), 0.5) + 0.12);
    const h = hh + rh.reduce((a, x) => a + x, 0) + 0.06;
    return { h, draw: (s, x, y) => {
      rect(s, x, y, w, h, { fill: 'FFFFFF', line: '94A3B8', lw: 1.25, r: 0.08 });
      rect(s, x, y, w, hh, { fill: 'EEF3F9', r: 0.08 });
      const tt = rich(b.exam === false ? b.term : '{' + b.term + '}', bo(26, { bold: true }));
      if (b.read) tt.push({ text: `（${b.read}）`, options: bo(20, { color: K.muted }) });
      s.addText(tt, { x: x + 0.2, y: y + 0.1, w: w - 2.6, h: need(headLine, 26, w - 2.6, true), margin: 0, valign: 'top', isTextBox: true, fit: 'none' });
      if (b.cat) { const ck = K[CAT[b.cat] || 'note']; chip(s, '分類：' + b.cat, x + w - 2.3, y + 0.14, { fill: ck.f || 'FFFFFF', color: ck.t || K.ink, line: ck.b, size: 15, w: 2.1 }); }
      if (sub) txt(s, sub, { x: x + 0.2, y: y + 0.12 + need(headLine, 26, w - 2.6, true), w: w - 0.4, h: need(sub, 18, w - 0.4) + 0.02, size: 18, color: K.muted });
      let cy = y + hh + 0.03;
      rows.forEach((r, i) => {
        txt(s, r[0], { x: x + 0.2, y: cy + 0.06, w: lw - 0.1, h: rh[i] - 0.1, size: 18, bold: true, color: '334155' });
        txt(s, r[1], { x: x + 0.2 + lw, y: cy + 0.06, w: iw, h: rh[i] - 0.08, size });
        if (i < rows.length - 1) s.addShape(pres.ShapeType.line, { x: x + 0.2, y: cy + rh[i], w: w - 0.4, h: 0, line: { color: 'E2E8F0', width: 0.75 } });
        cy += rh[i];
      });
    } };
  },
  // 表
  table: (b, w) => {
    const size = b.size || SZ.table;
    const cols = b.head ? b.head.length : b.rows[0].length;
    const fr = b.widths || Array(cols).fill(1);
    const sum = fr.reduce((a, x) => a + x, 0);
    const tw0 = b.w || w;
    const colW = fr.map(f => tw0 * f / sum);
    const all = (b.head ? [b.head] : []).concat(b.rows);
    const pad = 0.1;
    const rh = all.map((row, ri) => Math.max(0.46, ...row.map((c, ci) => need(typeof c === 'string' ? c : c.t, (typeof c === 'object' && c.size) || size, colW[ci] - 2 * pad, (b.head && ri === 0) || (ci === 0 && b.firstBold !== false)) + 0.14)));
    const h = rh.reduce((a, x) => a + x, 0);
    return { h, rh, colW, draw: (s, x, y) => {
      const rows = all.map((row, ri) => row.map((c, ci) => {
        const cell = typeof c === 'string' ? { t: c } : c;
        const head = b.head && ri === 0;
        const bold = head || cell.bold || (ci === 0 && b.firstBold !== false);
        const fill = head ? (b.headFill || '334155') : (cell.fill || ((ri - (b.head ? 1 : 0)) % 2 === 1 ? 'F6F8FB' : 'FFFFFF'));
        return { text: rich(cell.t, bo(cell.size || size, { bold, color: head ? 'FFFFFF' : (cell.color || K.ink), align: cell.align || (head ? 'center' : 'left') })), options: { fill: { color: fill }, valign: 'middle', margin: [5, 7, 5, 7], border: Array(4).fill({ type: 'solid', pt: 0.75, color: 'CBD5E1' }) } };
      }));
      s.addTable(rows, { x, y, w: tw0, colW, rowH: rh, autoPage: false });
    } };
  },
  // 番号つき手順（横並び flow:true は矢印つきの箱）
  steps: (b, w) => {
    if (b.flow) {
      const n = b.items.length, gap = 0.42, bw = (w - gap * (n - 1)) / n;
      const size = b.size || SZ.small;
      const hh = Math.max(...b.items.map(it => (typeof it === 'string' ? need(it, size, bw - 0.2) : need(it.t, size, bw - 0.2, true) + (it.d ? need(it.d, size - 2, bw - 0.2) : 0)))) + 0.55;
      return { h: hh, draw: (s, x, y) => b.items.forEach((it, i) => {
        const bx = x + i * (bw + gap);
        rect(s, bx, y, bw, hh, { fill: 'F3F6FA', line: '64748B', lw: 1.25 });
        badgeNum(s, (b.start || 1) + i, bx + 0.26, y + 0.26, 0.36);
        const t = typeof it === 'string' ? it : it.t;
        txt(s, t, { x: bx + 0.1, y: y + 0.48, w: bw - 0.2, h: need(t, size, bw - 0.2, typeof it !== 'string') + 0.02, size, bold: typeof it !== 'string', align: 'center' });
        if (it.d) txt(s, it.d, { x: bx + 0.1, y: y + 0.48 + need(t, size, bw - 0.2, true), w: bw - 0.2, h: need(it.d, size - 2, bw - 0.2) + 0.02, size: size - 2, color: K.muted, align: 'center' });
        if (i < n - 1) arrow(s, bx + bw + 0.04, y + hh / 2, bx + bw + gap - 0.04, y + hh / 2, { w: 2.5 });
      }) };
    }
    return BLK.ul({ ...b, num: true }, w);
  },
  // 比較カード（横並び）
  cards: (b, w) => {
    const n = b.items.length, gap = 0.22, cw = (w - gap * (n - 1)) / n;
    const size = b.size || SZ.small;
    const hs = b.items.map(it => 0.14 + need(it.title, 22, cw - 0.3 - (it.icon ? 0.5 : 0), true) + 0.1 + (it.text ? need(it.text, size, cw - 0.3) : 0) + (it.items ? it.items.reduce((a, t) => a + need(t, size, cw - 0.55) + 0.04, 0) : 0) + 0.14);
    const h = Math.max(...hs);
    return { h, draw: (s, x, y) => b.items.forEach((it, i) => {
      const cx = x + i * (cw + gap);
      const k = K[it.kind || 'note'] || K.note;
      rect(s, cx, y, cw, h, { fill: k.f, line: k.b, lw: 1.5, dash: it.kind === 'role' ? 'dash' : 'solid' });
      let ix = cx + 0.15;
      if (it.icon) { icon(s, it.icon, k.b, cx + 0.15, y + 0.15, 0.38); ix += 0.5; }
      const th = need(it.title, 22, cw - 0.3 - (it.icon ? 0.5 : 0), true);
      txt(s, it.title, { x: ix, y: y + 0.12, w: cx + cw - 0.15 - ix, h: th + 0.04, size: 22, bold: true, color: k.t });
      let cy = y + 0.14 + th + 0.1;
      if (it.text) { const hh = need(it.text, size, cw - 0.3); txt(s, it.text, { x: cx + 0.15, y: cy, w: cw - 0.3, h: hh + 0.02, size }); cy += hh; }
      (it.items || []).forEach(t => { const hh = need(t, size, cw - 0.55); s.addText('・', { x: cx + 0.15, y: cy, w: 0.3, h: 0.35, margin: 0, fontFace: FONT, fontSize: size, isTextBox: true }); txt(s, t, { x: cx + 0.42, y: cy, w: cw - 0.57, h: hh + 0.02, size }); cy += hh + 0.04; });
    }) };
  },
  // コード（右に日本語訳）
  code: (b, w) => {
    const size = b.size || 20;
    const lines = b.lines;
    const cwid = b.trans ? w * (b.split || 0.52) : w;
    const lh = size * 1.35 / 72;
    const tl = b.trans || [];
    const th = lines.map((l, i) => Math.max(lh, tl[i] ? need(tl[i], 18, w - cwid - 0.3) : 0));
    const h = th.reduce((a, x) => a + x, 0) + 0.3 + (b.title ? 0.4 : 0);
    return { h, draw: (s, x, y) => {
      let cy = y;
      if (b.title) { txt(s, b.title, { x, y, w, h: 0.38, size: 18, bold: true, color: K.muted }); cy += 0.4; }
      rect(s, x, cy, cwid, h - (b.title ? 0.4 : 0), { fill: '1E293B', r: 0.06 });
      let ly = cy + 0.15;
      lines.forEach((l, i) => {
        s.addText(l || ' ', { x: x + 0.18, y: ly, w: cwid - 0.3, h: th[i], margin: 0, fontFace: MONO, fontSize: size, color: 'F8FAFC', valign: 'top', isTextBox: true, fit: 'none' });
        if (tl[i]) txt(s, tl[i], { x: x + cwid + 0.2, y: ly, w: w - cwid - 0.25, h: th[i] + 0.02, size: 18, color: '1E3A5F' });
        ly += th[i];
      });
    } };
  },
  // 層の図（上から順に。hl で強調）
  layers: (b, w) => {
    const size = b.size || 20;
    const lw = b.labelW || 3.2;
    const hs = b.items.map(it => Math.max(0.58, need(it.d || '', size - 2, w - lw - 0.4) + 0.2));
    const h = hs.reduce((a, x) => a + x + 0.08, -0.08);
    return { h, draw: (s, x, y) => {
      let cy = y;
      b.items.forEach((it, i) => {
        const k = K[it.kind || 'software'];
        const on = b.hl ? b.hl.includes(i) : true;
        rect(s, x, cy, w, hs[i], { fill: on ? k.f : 'F8FAFC', line: on ? k.b : 'CBD5E1', lw: on && b.hl ? 3 : 1.5 });
        txt(s, it.t, { x: x + 0.18, y: cy, w: lw - 0.2, h: hs[i], size, bold: true, color: on ? k.t : '94A3B8', valign: 'middle' });
        if (it.d) txt(s, it.d, { x: x + lw, y: cy, w: w - lw - 0.2, h: hs[i], size: size - 2, color: on ? K.ink : '94A3B8', valign: 'middle' });
        cy += hs[i] + 0.08;
      });
    } };
  },
  // 拡大の位置表示
  zoom: (b, w) => {
    const steps = b.steps || ['本体の外観', 'マザーボード', 'CPU', 'コア', 'コアの中'];
    const h = 0.5;
    return { h, draw: (s, x, y) => {
      txt(s, '今見ている範囲：', { x, y, w: 2.1, h, size: 17, bold: true, valign: 'middle' });
      let cx = x + 2.1;
      const avail = w - 2.1, gap = 0.22;
      const cw = (avail - gap * (steps.length - 1)) / steps.length;
      steps.forEach((t, i) => {
        const on = i === b.at;
        rect(s, cx, y + 0.04, cw, h - 0.08, { fill: on ? '1F2937' : (i < b.at ? 'E5E7EB' : 'FFFFFF'), line: on ? '1F2937' : '9CA3AF', lw: 1 });
        txt(s, t, { x: cx + 0.03, y: y + 0.04, w: cw - 0.06, h: h - 0.08, size: 15, bold: on, color: on ? 'FFFFFF' : (i < b.at ? '4B5563' : '9CA3AF'), align: 'center', valign: 'middle' });
        if (i < steps.length - 1) arrow(s, cx + cw + 0.03, y + h / 2, cx + cw + gap - 0.03, y + h / 2, { w: 1.75, color: '6B7280' });
        cx += cw + gap;
      });
    } };
  },
  // 図（座標指定）
  fig: (b, w) => {
    const sc = Math.min(1, w / b.w);
    const capH = b.cap ? need(b.cap, SZ.small, w) + 0.1 : 0;
    const h = b.h * sc + capH;
    return { h, draw: (s, x, y) => {
      if (b.cap && b.capTop !== false) { txt(s, b.cap, { x, y, w, h: capH, size: SZ.small, color: '334155' }); }
      const oy = y + (b.cap && b.capTop !== false ? capH : 0);
      const ox = x + (w - b.w * sc) / 2;
      drawFig(s, b, ox, oy, sc);
      if (b.cap && b.capTop === false) txt(s, b.cap, { x, y: oy + b.h * sc + 0.06, w, h: capH, size: SZ.small, color: '334155' });
    } };
  },
  // 時間順のやり取り（シーケンス図）
  seq: (b, w) => {
    const n = b.actors.length;
    const headH = b.headH || 0.78;
    const rowH = b.rowH || 0.62;
    const h = headH + 0.2 + b.msgs.length * rowH + 0.1;
    return { h, draw: (s, x, y) => {
      const colW = w / n;
      const cxs = b.actors.map((a, i) => x + colW * (i + 0.5));
      b.actors.forEach((a, i) => {
        const k = K[a.kind || 'machine'];
        const bw = Math.min(colW - 0.2, a.w || 2.6);
        rect(s, cxs[i] - bw / 2, y, bw, headH, { fill: k.f, line: k.b, lw: 2, dash: a.kind === 'role' ? 'dash' : 'solid' });
        txt(s, a.t + (a.d ? '\n' + a.d : ''), { x: cxs[i] - bw / 2 + 0.06, y, w: bw - 0.12, h: headH, size: 17, bold: false, color: k.t, align: 'center', valign: 'middle', nofit: true });
        s.addShape(pres.ShapeType.line, { x: cxs[i], y: y + headH, w: 0, h: h - headH, line: { color: '9CA3AF', width: 1.25, dashType: 'dash' } });
      });
      b.msgs.forEach((m, i) => {
        const yy = y + headH + 0.2 + i * rowH + rowH * 0.62;
        const a = cxs[m.from], c = cxs[m.to];
        const col = m.aux ? K.aux : (m.ret ? K.ret : K.flow);
        if (m.from === m.to) { // 自分の中の処理
          rect(s, a - 0.08, yy - rowH * 0.45, 0.16, rowH * 0.55, { fill: col, r: 0.02 });
          txt(s, (m.n ? m.n + ' ' : '') + m.text, { x: a + 0.18, y: yy - rowH * 0.55, w: Math.min(colW * 1.7, w - (a - x) - 0.3), h: rowH * 0.6, size: 16, color: col, valign: 'middle', nofit: true });
          return;
        }
        arrow(s, a, yy, c, yy, { color: col, w: 2.25, dash: m.aux || m.ret ? 'dash' : 'solid' });
        const lx = Math.min(a, c) + 0.08, lw = Math.abs(c - a) - 0.16;
        const lab = (m.n ? m.n + ' ' : '') + m.text;
        txt(s, lab, { x: lx, y: yy - rowH * 0.62, w: lw, h: rowH * 0.58, size: m.size || 16, color: col, bold: true, align: 'center', valign: 'bottom', nofit: true });
        if (need(lab, m.size || 16, lw, true) > rowH * 0.6) warn('SEQ label wraps: ' + lab);
      });
    } };
  },
  // 区切り線つき小見出し
  h: (b, w) => ({ h: 0.48, draw: (s, x, y) => { txt(s, b.text, { x, y, w, h: 0.44, size: 22, bold: true, color: b.color || '1E3A5F', valign: 'middle' }); s.addShape(pres.ShapeType.line, { x, y: y + 0.46, w, h: 0, line: { color: 'CBD5E1', width: 1 } }); } }),
  space: (b) => ({ h: b.h || 0.2, draw: () => {} }),
  // 左右に並べる
  row: (b, w) => {
    const gap = b.gap ?? 0.35;
    const ratios = b.ratio || b.cols.map(() => 1);
    const sum = ratios.reduce((a, x) => a + x, 0);
    const ws = ratios.map(r => (w - gap * (b.cols.length - 1)) * r / sum);
    const ms = b.cols.map((col, i) => stackMeasure(col, ws[i]));
    const h = Math.max(...ms.map(m => m.h));
    return { h, draw: (s, x, y) => { let cx = x; ms.forEach((m, i) => { const off = b.valign === 'middle' ? (h - m.h) / 2 : 0; m.draw(s, cx, y + off); cx += ws[i] + gap; }); } };
  },
};
function stackMeasure(blocks, w) {
  const ms = blocks.map(b => measureBlock(b, w));
  const h = ms.reduce((a, m) => a + m.h, 0) + GAP * Math.max(0, ms.length - 1);
  return { h, draw: (s, x, y) => { let cy = y; ms.forEach(m => { m.draw(s, x, cy, w); cy += m.h + GAP; }); } };
}

// ======================= 図の描画 =======================
// node: {id, k:'machine|part|software|data|db|role|place|person|service|note|label|chip', x,y,w,h, t, d, icon, size, hl, fill, align}
// edge: {k:'flow|aux|ret|cable|radio|power|plain', a:id, b:id, as:'r|l|t|b', bs:..., t:'label', n:number, pts:[[x1,y1],[x2,y2]], lx, ly, lw}
function drawFig(s, f, ox, oy, sc) {
  const P = (v) => v * sc;
  const G = {};
  const order = ['place', 'role', 'machine', 'part', 'service', 'software', 'data', 'db', 'person', 'note', 'chip', 'label'];
  const isBg = n => n.k === 'place' || (n.k === 'role' && n.big) || (n.k === 'machine' && n.big);
  const nodes = (f.nodes || []).slice().sort((a, b) => (a.k === 'place' ? 0 : isBg(a) ? 1 : 2) - (b.k === 'place' ? 0 : isBg(b) ? 1 : 2));
  nodes.forEach(n => { G[n.id] = n; });
  const drawNode = (n) => {
    const x = ox + P(n.x), y = oy + P(n.y), w = P(n.w), h = P(n.h);
    const k = K[n.k] || K.note;
    const size = (n.size || SZ.fig) * Math.max(sc, 0.85);
    const lab = n.t || '';
    if (n.k === 'label') { txt(s, lab, { x, y, w, h, size, bold: n.bold, color: n.color || K.ink, align: n.align || 'center', valign: n.valign || 'middle' }); return; }
    if (n.k === 'chip') { chip(s, lab, x, y, { w, h, size: n.size || 15, fill: n.fill || '334155', color: n.color }); return; }
    if (n.k === 'place') {
      rect(s, x, y, w, h, { fill: n.fill || k.f, line: k.b, lw: 1.75, dash: 'dash', r: 0.12 });
      txt(s, lab, { x: x + 0.12, y: y + 0.06, w: w - 0.24, h: 0.38, size: n.size || 17, bold: true, color: k.t, align: n.align || 'left' });
      return;
    }
    if (n.k === 'machine' && n.big) {
      rect(s, x, y, w, h, { fill: n.fill || k.f, line: n.hl ? K.hl : k.b, lw: n.hl ? 4 : 2.25, r: 0.1 });
      txt(s, lab, { x: x + 0.12, y: y + 0.06, w: w - 0.24, h: 0.38, size: n.size || 17, bold: true, color: k.t, align: n.align || 'left' });
      return;
    }
    if (n.k === 'role' && n.big) {
      rect(s, x, y, w, h, { fill: null, line: k.b, lw: 2, dash: 'sysDot', r: 0.12 });
      txt(s, lab, { x: x + 0.1, y: y + 0.04, w: w - 0.2, h: 0.36, size: n.size || 16, bold: true, color: k.t, align: n.align || 'left' });
      return;
    }
    let shape = pres.ShapeType.roundRect, extra = {};
    if (n.k === 'data') shape = pres.ShapeType.flowChartDocument;
    if (n.k === 'db') shape = pres.ShapeType.can;
    if (n.k === 'person') shape = pres.ShapeType.roundRect;
    const fill = n.fill || k.f;
    const line = n.hl ? K.hl : k.b;
    const lw = n.hl ? 4 : (n.k === 'machine' ? 2.25 : 1.75);
    const dash = n.k === 'role' ? 'dash' : 'solid';
    s.addShape(shape, { x, y, w, h, ...(shape === pres.ShapeType.roundRect ? { rectRadius: 0.08 } : {}), fill: { color: fill }, line: { color: line, width: lw, dashType: dash } });
    let tx = x + 0.06, tW = w - 0.12;
    if (n.icon) {
      const d = Math.min(0.42, h - 0.12) * Math.max(sc, 0.8);
      if (n.iconTop) { icon(s, n.icon, k.b, x + w / 2 - d / 2, y + 0.08, d); }
      else { icon(s, n.icon, k.b, x + 0.1, y + (h - d) / 2, d); tx = x + 0.16 + d; tW = w - (tx - x) - 0.06; }
    }
    const ty = n.k === 'db' ? y + h * 0.18 : (n.icon && n.iconTop ? y + 0.5 : y);
    const th = n.k === 'db' ? h * 0.8 : (n.k === 'data' ? h * 0.82 : (n.icon && n.iconTop ? h - 0.5 : h));
    const runs = rich(lab, bo(size, { bold: true, color: n.color || k.t, align: n.align || 'center' }));
    let nh = need(lab, size, tW, true);
    if (n.d) {
      runs[runs.length - 1].options.breakLine = true;
      rich(n.d, bo(n.dsize || SZ.figSub, { color: K.muted, align: n.align || 'center' })).forEach(r => runs.push(r));
      nh += need(n.d, n.dsize || SZ.figSub, tW);
    }
    if (nh > th + 0.03) warn(`FIG node「${strip(lab).slice(0, 12)}」 ${nh.toFixed(2)}>${th.toFixed(2)}`);
    s.addText(runs, { x: tx, y: ty, w: tW, h: th, margin: 0, valign: n.valign || 'middle', isTextBox: true, fit: 'none' });
  };
  // 1) 背景の枠（place / big role）
  nodes.filter(isBg).forEach(drawNode);
  // 2) 線
  const side = (n, sd, t) => {
    const x = n.x, y = n.y, w = n.w, h = n.h;
    const f2 = t ?? 0.5;
    return sd === 'r' ? [x + w, y + h * f2] : sd === 'l' ? [x, y + h * f2] : sd === 'b' ? [x + w * f2, y + h] : [x + w * f2, y];
  };
  (f.edges || []).forEach(e => {
    let p1, p2;
    if (e.pts) { p1 = e.pts[0]; p2 = e.pts[e.pts.length - 1]; }
    else {
      const A = G[e.a], B = G[e.b];
      if (!A || !B) { warn('edge node missing ' + e.a + '→' + e.b); return; }
      let as = e.as, bs = e.bs;
      if (!as) {
        const dx = (B.x + B.w / 2) - (A.x + A.w / 2), dy = (B.y + B.h / 2) - (A.y + A.h / 2);
        const yov = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
        const xov = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
        if (yov > 0.15 && xov <= 0.05) as = dx > 0 ? 'r' : 'l';
        else if (xov > 0.15 && yov <= 0.05) as = dy > 0 ? 'b' : 't';
        else as = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't');
      }
      if (!bs) bs = { r: 'l', l: 'r', t: 'b', b: 't' }[as];
      p1 = side(A, as, e.at); p2 = side(B, bs, e.bt ?? e.at);
      // 重なり範囲の中央で水平・垂直にそろえる
      if (e.at === undefined && (as === 'r' || as === 'l') && (bs === 'r' || bs === 'l')) {
        const y0 = Math.max(A.y, B.y), y1 = Math.min(A.y + A.h, B.y + B.h);
        if (y1 - y0 > 0.15) { const yy = (y0 + y1) / 2 + (e.off || 0); p1 = [p1[0], yy]; p2 = [p2[0], yy]; }
      }
      if (e.at === undefined && (as === 't' || as === 'b') && (bs === 't' || bs === 'b')) {
        const x0 = Math.max(A.x, B.x), x1 = Math.min(A.x + A.w, B.x + B.w);
        if (x1 - x0 > 0.15) { const xx = (x0 + x1) / 2 + (e.off || 0); p1 = [xx, p1[1]]; p2 = [xx, p2[1]]; }
      }
    }
    const st = {
      flow: { color: K.flow, w: 2.5 }, ret: { color: K.ret, w: 2.5, dash: 'dash' }, aux: { color: K.aux, w: 2.25, dash: 'dash' },
      cable: { color: K.cable, w: 4, head: false }, radio: { color: K.cable, w: 2.5, dash: 'sysDash', head: false },
      power: { color: K.power, w: 5, head: false }, plain: { color: '6B7280', w: 1.5, head: false },
    }[e.k || 'flow'];
    const pts = e.pts && e.pts.length > 2 ? e.pts : [p1, p2];
    for (let i = 0; i < pts.length - 1; i++) {
      const last = i === pts.length - 2;
      arrow(s, ox + P(pts[i][0]), oy + P(pts[i][1]), ox + P(pts[i + 1][0]), oy + P(pts[i + 1][1]), { color: e.color || st.color, w: st.w, dash: st.dash, head: last ? (e.head ?? st.head) : false, both: e.both && i === 0 });
    }
    if (e.t || e.n) {
      const size = (e.size || 16);
      const mx = e.lx !== undefined ? e.lx : (p1[0] + p2[0]) / 2;
      const my = e.ly !== undefined ? e.ly : (p1[1] + p2[1]) / 2;
      const lab = e.t || '';
      const lw = e.lw || Math.min(Math.max(tw(lab, size, true) + 0.2, 0.4), 3.6);
      const lh = lab ? need(lab, size, lw - 0.06, true) + 0.06 : 0.36;
      const nx = ox + P(mx), ny = oy + P(my);
      if (lab) s.addText(rich(lab, bo(size, { bold: true, color: e.color || st.color, align: 'center' })), { x: nx - lw / 2, y: ny - lh / 2, w: lw, h: lh, margin: 0, align: 'center', valign: 'middle', fill: { color: e.lfill || 'FFFFFF' }, isTextBox: true, fit: 'none' });
      if (e.n) badgeNum(s, e.n, lab ? nx - lw / 2 - 0.2 : nx, ny, 0.36, e.color || st.color);
    }
  });
  // 3) 箱
  nodes.filter(n => !isBg(n)).forEach(drawNode);
  if (f.simple) chip(s, '学習用に簡略化した図', ox + P(f.w) - 2.5, oy + P(f.h) - 0.36, { w: 2.5, size: 13, fill: 'FFFFFF', color: '6B7280', line: '9CA3AF' });
  if (f.example) chip(s, '説明用の例', ox + P(f.w) - (f.simple ? 3.9 : 1.4), oy + P(f.h) - 0.36, { w: 1.3, size: 13, fill: 'F5F3FF', color: '6D28D9', line: '6D28D9' });
}

// ======================= スライド定義 → ページ =======================
const defs = [];
function slide(d) { defs.push(d); }
// 表の自動分割：blocks の中で split:true の table を、収まる行数で分ける
function expand(d) {
  if (d.quiz) {
    const qs = d.quiz;
    const qPage = { ...d, id: d.id, title: d.title || '確認の問い', lead: d.lead || '自分の言葉で答えてから、次のページの解説を読みましょう。', blocks: [{ t: 'ul', num: true, items: qs.map(q => q.q) }], kind: d.kind || '学習の確認' };
    const aPage = { ...d, id: d.id + '-ans', title: (d.title || '確認の問い') + '：解説', lead: '前のページの問いへの答えと、考え方です。', blocks: qs.map((q, i) => ({ t: 'box', kind: 'check', title: `問${i + 1}　${strip(q.q).slice(0, 60)}${strip(q.q).length > 60 ? '…' : ''}`, text: q.a, size: 20 })), kind: d.kind || '学習の確認' };
    return [qPage, aPage];
  }
  const ti = (d.blocks || []).findIndex(b => b.t === 'table' && b.split);
  if (ti < 0) return [d];
  const tb = d.blocks[ti];
  const top = bodyTop(d);
  const others = d.blocks.filter((b, i) => i !== ti);
  const hOf = arr => arr.reduce((a, b) => a + measureBlock(b, CW).h + GAP, 0);
  const availMid = BOT - top - hOf(others.filter(b => !b.lastOnly));
  const availLast = BOT - top - hOf(others);
  const m = measureBlock(tb, CW);
  const headH = tb.head ? m.rh[0] : 0;
  const RH = tb.rows.map((r, i) => m.rh[i + (tb.head ? 1 : 0)]);
  if (process.env.DBG === d.id) console.error('SPLIT', availMid, availLast, headH, RH.slice(0, 12).map(x => x.toFixed(2)).join(' '));
  const greedy = cap => {
    const pg = []; let cur = [], used = headH;
    tb.rows.forEach((r, i) => {
      if (cur.length && used + RH[i] > cap - 0.02) { pg.push(cur); cur = []; used = headH; }
      cur.push(r); used += RH[i];
    });
    if (cur.length) pg.push(cur);
    // 最後のページに後置ブロックが収まらなければ、最後の行を次のページへ送る
    const lastH = rows => headH + rows.reduce((a, r) => a + RH[tb.rows.indexOf(r)], 0);
    while (pg.length && lastH(pg[pg.length - 1]) > availLast - 0.02 && pg[pg.length - 1].length > 1) {
      const last = pg[pg.length - 1]; const mv = []; while (last.length > 1 && lastH(last) > availLast - 0.02) mv.unshift(last.pop()); pg.push(mv);
    }
    return pg;
  };
  let pages = greedy(availMid);
  if (pages.length > 1) {
    const P = pages.length; let lo = headH, hi = availMid;
    for (let it = 0; it < 30; it++) { const mid = (lo + hi) / 2; if (greedy(mid).length <= P) hi = mid; else lo = mid; }
    pages = greedy(hi);
  }
  return pages.map((rows, pi) => ({
    ...d, id: pi === 0 ? d.id : d.id + '-' + (pi + 1),
    title: d.title + (pages.length > 1 ? `（${pi + 1}/${pages.length}）` : ''),
    blocks: d.blocks.map((b, i) => (i === ti ? { ...tb, rows, split: false } : b)).filter((b, i) => pi === pages.length - 1 || i <= ti || !b.lastOnly),
  }));
}
function titleLines(d) { return lineCount(d.title, SZ.title, CW, true); }
function bodyTop(d) {
  const tl = Math.min(2, titleLines(d));
  let y = 0.62 + tl * SZ.title * 1.18 / 72 + 0.08;
  if (d.lead) y += need(d.lead, SZ.lead, CW) + 0.1;
  return y + 0.1;
}

let pages = [];
function layoutAll() {
  pages = [];
  defs.forEach(d => expand(d).forEach(p => pages.push(p)));
  PAGES = {};
  pages.forEach((p, i) => { if (p.id) { if (PAGES[p.id]) warnings.push('ID重複 ' + p.id); PAGES[p.id] = i + 1; } });
  return pages;
}

// 章の色（見出しチップ）
const CHC = ['334155', '0F766E', '475569', '6D4AA8', '0E7490', '2E7D4F', 'B45309', '1D4ED8', '7C2D12', '4B5563', '6D28D9', 'B91C1C', '9D174D', '1E40AF', '065F46', '7C3AED', '92400E', '334155'];
function drawPage(p, n, total, chapters) {
  curPage = n;
  const s = pres.addSlide();
  s.background = { color: K.bg };
  if (p.type === 'cover') return drawCover(s, p);
  if (p.type === 'chapter') return drawChapter(s, p, n, total, chapters);
  // 上部：章チップ・区分ラベル
  const ch = chapters[p.ch] || { n: '', t: '' };
  const cl = CHC[(p.ch || 0) % CHC.length];
  const chTxt = p.ch === undefined ? '' : (ch.n ? ch.n + '　' : '') + ch.t;
  if (chTxt) chip(s, chTxt, X, 0.2, { fill: cl, size: 14 });
  if (p.kind) { const kw = tw(p.kind, 14, true) + 0.4; chip(s, p.kind, W - X - kw, 0.2, { w: kw, fill: 'FFFFFF', color: '374151', line: '9CA3AF', size: 14 }); }
  // タイトル
  const tl = titleLines(p);
  if (tl > 2) warn('TITLE 3行以上: ' + p.title);
  txt(s, p.title, { x: X, y: 0.62, w: CW, h: Math.min(2, tl) * SZ.title * 1.18 / 72 + 0.04, size: SZ.title, bold: true, ls: 1.18 });
  let y = 0.62 + Math.min(2, tl) * SZ.title * 1.18 / 72 + 0.08;
  if (p.lead) { const lh = need(p.lead, SZ.lead, CW); txt(s, p.lead, { x: X, y, w: CW, h: lh + 0.02, size: SZ.lead, color: '1E3A5F' }); y += lh + 0.1; }
  y += 0.1;
  // 本文
  const m = stackMeasure(p.blocks || [], CW);
  if (y + m.h > BOT + 0.03) warn(`OVERFLOW 本文下端 ${(y + m.h).toFixed(2)} > ${BOT}`);
  const off = p.vcenter ? Math.max(0, (BOT - y - m.h) / 2) : 0;
  m.draw(s, X, y + off);
  // 下部
  const src = p.src && p.src.length ? '出典：' + p.src.join('・') : '';
  const orig = p.orig && p.orig.length ? '元資料：p.' + p.orig.join('・') : (p.orig === null ? '' : '');
  const foot = [src, orig].filter(Boolean).join('　｜　');
  if (foot) s.addText(foot, { x: X, y: 7.08, w: CW - 1.2, h: 0.28, margin: 0, fontFace: FONT, fontSize: SZ.foot, color: '6B7280', valign: 'middle', isTextBox: true, fit: 'none' });
  s.addText(`${n} / ${total}`, { x: W - X - 1.2, y: 7.08, w: 1.2, h: 0.28, margin: 0, fontFace: FONT, fontSize: SZ.foot, color: '6B7280', align: 'right', valign: 'middle', isTextBox: true, fit: 'none' });
  if (p.notes) s.addNotes(resolveRefs(p.notes));
}
function drawCover(s, p) {
  s.background = { color: 'F4F7FB' };
  rect(s, 0, 0, W, 0.18, { fill: '1E3A5F', r: 0 , shape: pres.ShapeType.rect});
  txt(s, p.kicker || '', { x: 0.8, y: 0.9, w: 11.5, h: 0.5, size: 22, bold: true, color: '475569' });
  txt(s, p.title, { x: 0.8, y: 1.5, w: 11.7, h: 2.2, size: 44, bold: true, color: '1F2937', ls: 1.15 });
  txt(s, p.sub || '', { x: 0.8, y: 3.8, w: 11.7, h: 1.3, size: 24, color: '1E3A5F' });
  txt(s, p.meta || '', { x: 0.8, y: 5.3, w: 11.7, h: 1.6, size: 18, color: '4B5563' });
  if (p.notes) s.addNotes(p.notes);
}
function drawChapter(s, p, n, total, chapters) {
  const ch = chapters[p.ch];
  const cl = CHC[p.ch % CHC.length];
  rect(s, 0, 0, 0.35, H, { fill: cl, r: 0, shape: pres.ShapeType.rect });
  txt(s, ch.n, { x: 0.9, y: 0.7, w: 11, h: 0.6, size: 26, bold: true, color: cl });
  txt(s, ch.t, { x: 0.9, y: 1.3, w: 11.6, h: 1.0, size: 40, bold: true });
  let y = 2.5;
  (p.blocks ? stackMeasure(p.blocks, 11.6) : null)?.draw(s, 0.9, y);
  s.addText(`${n} / ${total}`, { x: W - X - 1.2, y: 7.08, w: 1.2, h: 0.28, margin: 0, fontFace: FONT, fontSize: SZ.foot, color: '6B7280', align: 'right', valign: 'middle', isTextBox: true, fit: 'none' });
  const m = p.blocks ? stackMeasure(p.blocks, 11.6) : { h: 0 };
  if (2.5 + m.h > BOT + 0.03) warn(`OVERFLOW chapter ${(2.5 + m.h).toFixed(2)}`);
  if (p.notes) s.addNotes(resolveRefs(p.notes));
}

function collectTerms() {
  const out = [];
  const walk = (blocks, p, n) => (blocks || []).forEach(b => {
    if (b.t === 'def') out.push({ t: b.term, alias: b.alias || (b.abbr && b.abbr !== b.term ? [b.abbr] : []), read: b.read || '', abbr: b.abbr || '', full: b.full || '', mean: strip(b.mean || b.what || ''), exam: b.exam !== false, page: n, id: p.id, cat: b.cat || '' });
    if (b.t === 'row') b.cols.forEach(c => walk(c, p, n));
  });
  pages.forEach((p, i) => {
    (p.terms || []).forEach(t => out.push({ alias: [], read: '', abbr: '', full: '', exam: true, ...t, mean: strip(t.mean || ''), page: i + 1, id: p.id }));
    walk(p.blocks, p, i + 1);
  });
  return out;
}
async function build(file, chapters) {
  layoutAll();
  const total = pages.length;
  pages.forEach((p, i) => drawPage(p, i + 1, total, chapters));
  await pres.writeFile({ fileName: file });
  return { pages, warnings, PAGES, termUse, terms: collectTerms() };
}

// DSL ショートカット
const B = {
  p: (text, o = {}) => ({ t: 'p', text, ...o }),
  ul: (items, o = {}) => ({ t: 'ul', items, ...o }),
  num: (items, o = {}) => ({ t: 'ul', items, num: true, ...o }),
  box: (kind, text, o = {}) => ({ t: 'box', kind, text, ...o }),
  def: (o) => ({ t: 'def', ...o }),
  table: (head, rows, o = {}) => ({ t: 'table', head, rows, ...o }),
  flow: (items, o = {}) => ({ t: 'steps', flow: true, items, ...o }),
  cards: (items, o = {}) => ({ t: 'cards', items, ...o }),
  code: (lines, trans, o = {}) => ({ t: 'code', lines, trans, ...o }),
  layers: (items, o = {}) => ({ t: 'layers', items, ...o }),
  zoom: (at, steps) => ({ t: 'zoom', at, steps }),
  fig: (o) => ({ t: 'fig', ...o }),
  seq: (actors, msgs, o = {}) => ({ t: 'seq', actors, msgs, ...o }),
  h: (text) => ({ t: 'h', text }),
  space: (h) => ({ t: 'space', h }),
  row: (cols, o = {}) => ({ t: 'row', cols, ...o }),
};

module.exports = { pres, slide, build, B, K, SZ, W, H, X, CW, BOT, initIcons, warnings, defs, need, tw, strip, layoutAll, get pages() { return pages; }, get PAGES() { return PAGES; } };
