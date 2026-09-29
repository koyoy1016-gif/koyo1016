// 続きスライド（19〜37枚目）を生成する
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

const TOTAL = 38;
let PN = 18;
function next() { return ++PN; }
const FONT = "Yu Gothic";
const C = {
  navy: "1B2A44", navy2: "24365A", navy3: "35507D",
  orange: "E8934D", dorange: "C56A2C", peach: "FBEBDA",
  teal: "1F6F78", tealL: "DCEAEC",
  panel: "F3F5F8", panel2: "EAEEF2", white: "FFFFFF",
  text: "333F4E", muted: "6B7480", faint: "AEB4BC",
  green: "4C8C6B", greenL: "E1EEE7", red: "B04A3F", redL: "F5E2DF", yellow: "E8D26E",
};
const NAV = ["5 データの整理", "6 最終目標の変数", "7 4方向の線形補間", "8 代案"];
const PARTS = {
  5: "PART 5  データと計算過程の整理",
  6: "PART 6  最終目標ツールの変数",
  7: "PART 7  4方向での線形補間（計算量の見積もり）",
  8: "PART 8  代案：空の遮られ方",
};

// ---------- 数式テキスト：_{..} を下付き、^{..} を上付きに ----------
function M(str, extra = {}) {
  const runs = [];
  const re = /(_\{[^}]*\}|\^\{[^}]*\})/g;
  let last = 0, m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) runs.push({ text: str.slice(last, m.index), options: { ...extra } });
    const t = m[0];
    const inner = t.slice(2, -1);
    runs.push({ text: inner, options: { ...extra, [t[0] === "_" ? "subscript" : "superscript"]: true } });
    last = m.index + t.length;
  }
  if (last < str.length) runs.push({ text: str.slice(last), options: { ...extra } });
  return runs;
}
// 複数行（各行は文字列 or [文字列, 追加オプション]）
function ML(lines) {
  const out = [];
  lines.forEach((ln, i) => {
    const [s, ex] = Array.isArray(ln) ? ln : [ln, {}];
    const r = M(s, ex);
    if (i < lines.length - 1) r[r.length - 1].options.breakLine = true;
    out.push(...r);
  });
  return out;
}

function T(slide, text, o) {
  const fs = o.fontSize || 11;
  const fsz = fs <= 10.5 ? fs + 0.5 : fs;
  slide.addText(text, { fontFace: FONT, color: C.text, valign: "top", margin: 0.04, isTextBox: true, ...o, fontSize: fsz });
}
function R(slide, x, y, w, h, fill, o = {}) {
  slide.addShape(o.round ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: fill, ...(o.tr != null ? { transparency: o.tr } : {}) },
    line: o.line ? { color: o.line, width: o.lw || 0.75, ...(o.dash ? { dashType: o.dash } : {}) } : { type: "none" },
    ...(o.round ? { rectRadius: o.rr || 0.08 } : {}),
  });
}
function line(slide, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 0.0001), h = Math.max(Math.abs(y2 - y1), 0.0001);
  const ln = { color: o.color || C.navy, width: o.width || 1 };
  if (o.dash) ln.dashType = o.dash;
  if (o.end) ln.endArrowType = o.end;
  if (o.begin) ln.beginArrowType = o.begin;
  slide.addShape(pres.shapes.LINE, { x, y, w, h, line: ln, flipH: x2 < x1, flipV: y2 < y1 });
}
function poly(slide, pts, o = {}) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x, 0.01), h = Math.max(Math.max(...ys) - y, 0.01);
  const points = pts.map(p => ({ x: p[0] - x, y: p[1] - y }));
  points.push({ close: true });
  slide.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x, y, w, h, points,
    fill: o.fill ? { color: o.fill, ...(o.tr != null ? { transparency: o.tr } : {}) } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lw || 0.75, ...(o.dash ? { dashType: o.dash } : {}) } : { type: "none" },
  });
}
function circleNum(slide, x, y, n, fill = C.teal, d = 0.34, fs = 12) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  T(slide, String(n), { x, y, w: d, h: d, fontSize: fs, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
}
function dot(slide, cx, cy, d, fill, shape = "OVAL") {
  slide.addShape(pres.shapes[shape], { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: fill }, line: { color: C.white, width: 0.5 } });
}

function header(slide, num, part, title, sub) {
  slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.36, w: 0.6, h: 0.6, fill: { color: C.orange }, line: { type: "none" } });
  T(slide, String(num), { x: 0.5, y: 0.36, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(slide, PARTS[part], { x: 1.28, y: 0.32, w: 11.3, h: 0.28, fontSize: 11, bold: true, color: C.dorange, charSpacing: 1 });
  T(slide, title, { x: 1.28, y: 0.56, w: 11.55, h: 0.55, fontSize: 23, bold: true, color: C.navy, valign: "middle" });
  if (sub) T(slide, sub, { x: 0.5, y: 1.18, w: 12.3, h: 0.32, fontSize: 11.5, color: C.text });
}
function footer(slide, num, part) {
  T(slide, "壁面日射量予測ツールの開発", { x: 0.5, y: 7.13, w: 3.5, h: 0.28, fontSize: 9, color: C.muted });
  const runs = [];
  NAV.forEach((n, i) => {
    const active = i + 5 === part;
    runs.push({ text: n, options: { bold: true, color: active ? C.dorange : C.faint } });
    if (i < NAV.length - 1) runs.push({ text: "　›　", options: { color: C.faint } });
  });
  T(slide, runs, { x: 3.9, y: 7.13, w: 7.2, h: 0.28, fontSize: 9, align: "center" });
  T(slide, `${num} / ${TOTAL}`, { x: 11.33, y: 7.1, w: 1.5, h: 0.32, fontSize: 11, bold: true, color: C.navy, align: "right" });
}
function std(num, part, title, sub) {
  const s = pres.addSlide();
  s.background = { color: C.white };
  header(s, num, part, title, sub);
  footer(s, num, part);
  return s;
}
// 表（先頭行を見出しに）
function table(slide, rows, o) {
  const fs = (o.fs || 10) + 0.5;
  const data = rows.map((r, ri) => r.map((cell, ci) => {
    const isHead = ri === 0 && !o.noHead;
    const txt = typeof cell === "string" ? (o.math ? M(cell) : cell) : cell.t;
    const opt = typeof cell === "object" && cell.o ? cell.o : {};
    return {
      text: txt,
      options: {
        fontFace: FONT, fontSize: isHead ? fs - 0.5 : fs, bold: isHead || (o.boldCol0 && ci === 0),
        color: isHead ? C.white : (o.boldCol0 && ci === 0 ? C.navy : C.text),
        fill: { color: isHead ? C.navy : (ri % 2 === 0 ? C.panel : C.white) },
        align: o.align ? o.align[ci] : (ci === 0 ? "left" : "center"), valign: "middle",
        margin: [0.03, 0.06, 0.03, 0.06], ...opt,
      },
    };
  }));
  slide.addTable(data, { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH || 0.3, border: { type: "solid", pt: 0.5, color: "D5DAE1" } });
}
function box(slide, x, y, w, h, title, body, o = {}) {
  R(slide, x, y, w, h, o.fill || C.panel, { round: true, rr: 0.06, line: o.line });
  if (title) T(slide, title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.3, fontSize: o.tfs || 12, bold: true, color: o.tcolor || C.navy });
  if (body) T(slide, body, { x: x + 0.15, y: y + (title ? 0.42 : 0.12), w: w - 0.3, h: h - (title ? 0.5 : 0.2), fontSize: o.fs || 10.5, color: C.text, lineSpacingMultiple: o.ls || 1.15 });
}
function bullets(items, o = {}) {
  return items.map((it, i) => {
    const r = typeof it === "string" ? { text: it } : it;
    return { text: r.text, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: o.gap || 4, ...(r.o || {}) } };
  });
}

// 小さな平面アイコン（arr = [北, 東, 南, 西] の有無）
function miniPlan(s, cx, cy, u, arr, o = {}) {
  R(s, cx - u / 2, cy - u / 2, u, u, C.navy);
  const g = o.gap != null ? o.gap : u * 0.45;
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach((q, i) => {
    const bx = cx + q[0] * (u + g) - u / 2, by = cy + q[1] * (u + g) - u / 2;
    if (arr[i] === 1) R(s, bx, by, u, u, o.cols ? o.cols[i] : C.teal);
    else if (arr[i] === 0) R(s, bx, by, u, u, C.white, { line: "B8C0CA", dash: "dash", lw: 0.75 });
  });
}

// PART 7 の話の流れ（今どこにいるか）
const STORY = ["① なぜ6,561通り", "② 考え方・1万通り", "③ 例：隅を探す", "④ 例：16マス", "⑤ 4棟なら256", "⑥ 計算時間", "⑦ 17変数は別の方法"];
function story(s, idx) {
  const w = 2.52, gap = 0.44 / 4;
  STORY.forEach((t, i) => {
    const x = 0.5 + i * (w - 0.05 + gap * 0);
    const on = i === idx, done = i < idx;
    const step = 12.35 / STORY.length;
    s.addShape(i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, { x: 0.5 + i * step, y: 1.16, w: step + 0.08, h: 0.36, fill: { color: on ? C.orange : done ? "F6D9C0" : C.panel2 }, line: { type: "none" } });
    T(s, t, { x: 0.5 + i * step + (i === 0 ? 0.08 : 0.2), y: 1.16, w: step - 0.25, h: 0.36, fontSize: 8.5, bold: true, color: on ? C.white : done ? C.dorange : C.muted, align: "center", valign: "middle", margin: 0 });
  });
}

// =====================================================================
// 19: セクション扉（濃色）
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  T(s, "ADDITIONAL EXPLANATION", { x: 0.7, y: 0.55, w: 8, h: 0.3, fontSize: 11, bold: true, color: C.orange, charSpacing: 2 });
  T(s, "補足：指摘への回答と、次の段階の計画", { x: 0.7, y: 0.85, w: 12, h: 0.6, fontSize: 28, bold: true, color: C.white });
  T(s, "前回の発表で受けた3つの指摘に答え、4方向へ広げるための検証計画を示す", { x: 0.7, y: 1.5, w: 12, h: 0.35, fontSize: 13, color: "CADCFC" });

  // 指摘
  R(s, 0.7, 2.1, 11.93, 1.35, C.navy2, { round: true, rr: 0.06 });
  T(s, "受けた指摘", { x: 0.9, y: 2.2, w: 3, h: 0.3, fontSize: 11, bold: true, color: C.orange });
  const qs = [
    ["Q1", "入力・学習・テストデータの違いと、\nモデルを作る計算過程が分かりにくい"],
    ["Q2", "最終的に作るツールでは、\nどの変数を、どこで変えるのか"],
    ["Q3", "2変数を9点で予測できたのなら、\n4方向でも線形補間でできるのでは？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.9 + i * 3.95;
    T(s, q[0], { x, y: 2.55, w: 0.55, h: 0.7, fontSize: 18, bold: true, color: C.orange, valign: "middle" });
    T(s, q[1], { x: x + 0.55, y: 2.55, w: 3.3, h: 0.75, fontSize: 11, color: C.white, valign: "middle" });
  });

  const parts = [
    ["PART 5", "データと計算過程の整理", "学習16・検証8・テスト12などの役割と、Σを使った計算式", "p.20–24", "Q1"],
    ["PART 6", "最終目標ツールの変数", "平面図・立体図で17個の変数の位置と、0/1変数を使う理由", "p.25–28", "Q2"],
    ["PART 7", "4方向での線形補間", "なぜ6,561通り？ → 補間の考え方と具体例 → 計算時間 → 17変数では別の方法へ", "p.29–35", "Q3"],
    ["PART 8", "代案：空の遮られ方", "線形補間でうまくいかない場合の方法の概要（詳細は来週）", "p.36–37", "Q3"],
  ];
  parts.forEach((p, i) => {
    const x = 0.7 + i * 3.03, y = 3.75, w = 2.83, h = 2.65;
    R(s, x, y, w, h, C.white, { round: true, rr: 0.06 });
    T(s, p[0], { x: x + 0.2, y: y + 0.18, w: 1.4, h: 0.3, fontSize: 11, bold: true, color: C.dorange });
    T(s, p[4] + "への回答", { x: x + w - 1.35, y: y + 0.18, w: 1.15, h: 0.3, fontSize: 9.5, bold: true, color: C.teal, align: "right" });
    T(s, p[1], { x: x + 0.2, y: y + 0.55, w: w - 0.4, h: 0.65, fontSize: 15, bold: true, color: C.navy });
    T(s, p[2], { x: x + 0.2, y: y + 1.25, w: w - 0.4, h: 0.95, fontSize: 10.5, color: C.text });
    T(s, p[3], { x: x + 0.2, y: y + h - 0.42, w: w - 0.4, h: 0.28, fontSize: 10, bold: true, color: C.muted });
  });
  T(s, "壁面日射量予測ツールの開発", { x: 0.5, y: 7.13, w: 3.5, h: 0.28, fontSize: 9, color: "8FA0BC" });
  const n19 = next();
  T(s, `${n19} / ${TOTAL}`, { x: 11.33, y: 7.1, w: 1.5, h: 0.32, fontSize: 11, bold: true, color: C.white, align: "right" });
  s.addNotes("ここからは前回の指摘への回答です。Q1のデータの区別と計算過程、Q2の最終ツールの変数、Q3の4方向で線形補間が使えるかを順に説明し、最後に代案と来週の予定を示します。");
}

// =====================================================================
// 20: データの役割
// =====================================================================
{
  const s = std(next(), 5, "データの役割：1件のデータは「入力」と「正解値」の組", "南側1棟の段階で使ったデータは47配置。それぞれ「何に使ったか」で名前が変わる。");
  // 1件の構造
  R(s, 0.5, 1.6, 6.55, 1.2, C.panel, { round: true, rr: 0.06 });
  T(s, "1配置ぶんのデータ（どの種類でも形は同じ）", { x: 0.65, y: 1.66, w: 6.2, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  R(s, 0.7, 2.02, 2.35, 0.62, C.peach, { round: true, rr: 0.06 });
  T(s, [{ text: "入力", options: { bold: true, color: C.dorange } }, { text: "　A, D", options: { bold: true, color: C.navy, breakLine: true } }, { text: "例：A＝55.9m, D＝14m", options: { fontSize: 9.5 } }], { x: 0.8, y: 2.05, w: 2.2, h: 0.58, fontSize: 12, valign: "middle" });
  T(s, "＋", { x: 3.08, y: 2.08, w: 0.4, h: 0.5, fontSize: 20, bold: true, color: C.navy, align: "center", valign: "middle" });
  R(s, 3.5, 2.02, 3.35, 0.62, C.tealL, { round: true, rr: 0.06 });
  T(s, [{ text: "正解値（SEBEの計算値）", options: { bold: true, color: C.teal, breakLine: true } }, ...M("南面5帯の年間日射量 y_{1}〜y_{5}", { fontSize: 9.5 })], { x: 3.6, y: 2.05, w: 3.2, h: 0.58, fontSize: 11.5, valign: "middle" });

  table(s, [
    ["呼び方", "何に使うか", "配置数"],
    ["学習用（補間用）データ", "予測方法を作るために保存する計算データ", "16"],
    ["検証データ", "3手法の比較・弱点（高さ帯別）の確認", "8"],
    ["テストデータ（全体平均）", "方法を固定した後、未使用の配置で性能確認", "12"],
    ["局所改良の追加データ", "既存4点と合わせて3×3の局所格子を作る", "5"],
    ["局所改良のテストデータ", "改良前後を同じ配置で比較", "6"],
    [{ t: "合計（重複なし）", o: { bold: true } }, "", { t: "47", o: { bold: true, color: C.dorange } }],
  ], { x: 0.5, y: 2.98, w: 6.55, colW: [2.2, 3.6, 0.75], rowH: 0.32, fs: 10, boldCol0: true });

  box(s, 0.5, 5.4, 6.55, 1.5, "「学習」の注意：線形補間は係数を学習しない", null, { fill: C.peach, tcolor: C.dorange });
  T(s, bullets([
    "16配置の値を表として保存し、入力のたびに近い4点から計算する →「補間の基準として保存した計算データ」",
    "テストデータは方法を決めた後にだけ使う（結果を見て方法を変えない）",
    "局所格子の9点のうち4点は元の16点なので、47に重ねて数えない",
  ]), { x: 0.65, y: 5.8, w: 6.3, h: 1.05, fontSize: 10 });

  // 散布図
  const px = 7.55, py = 1.62, pw = 5.25, ph = 4.65;
  R(s, 7.3, 1.55, 5.55, 5.35, C.panel, { round: true, rr: 0.06 });
  T(s, "47配置の位置（A：高さ・D：隙間）", { x: 7.45, y: 1.6, w: 5.2, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const gx0 = 8.15, gy0 = 5.75, gw = 4.4, gh = 3.6; // 描画範囲
  R(s, gx0, gy0 - gh, gw, gh, C.white);
  const X = d => gx0 + (d - 5) / 100 * gw;
  const Y = a => gy0 - (a - 20) / 85 * gh;
  [10, 25, 50, 100].forEach(d => { line(s, X(d), gy0 - gh, X(d), gy0, { color: "DDE2E8", width: 0.5 }); T(s, String(d), { x: X(d) - 0.25, y: gy0 + 0.03, w: 0.5, h: 0.22, fontSize: 9, color: C.muted, align: "center" }); });
  [25, 50, 75, 100].forEach(a => { line(s, gx0, Y(a), gx0 + gw, Y(a), { color: "DDE2E8", width: 0.5 }); T(s, String(a), { x: gx0 - 0.45, y: Y(a) - 0.11, w: 0.4, h: 0.22, fontSize: 9, color: C.muted, align: "right" }); });
  T(s, "隙間 D（m）", { x: gx0, y: gy0 + 0.23, w: gw, h: 0.24, fontSize: 9.5, color: C.navy, align: "center" });
  T(s, "高さ A（m）", { x: 7.4, y: gy0 - gh - 0.3, w: 1.3, h: 0.24, fontSize: 9.5, color: C.navy });
  const grid = []; [25, 50, 75, 100].forEach(a => [10, 25, 50, 100].forEach(d => grid.push([a, d])));
  const val = [[35, 15], [35, 70], [45, 35], [60, 15], [60, 70], [85, 35], [90, 15], [90, 85]];
  const test = [[44, 17], [33, 67], [32, 88], [57, 39], [61, 41], [55, 70], [69, 11], [73, 58], [64, 84], [99, 37], [98, 63], [98, 93]];
  const add5 = [[25, 17], [35, 10], [35, 17], [35, 25], [50, 17]];
  const lt6 = [[28, 13], [31, 21], [38, 14], [41, 23], [46, 12], [48, 19]];
  grid.forEach(p => dot(s, X(p[1]), Y(p[0]), 0.13, C.navy, "RECTANGLE"));
  val.forEach(p => dot(s, X(p[1]), Y(p[0]), 0.15, C.teal, "DIAMOND"));
  test.forEach(p => dot(s, X(p[1]), Y(p[0]), 0.13, C.orange));
  add5.forEach(p => dot(s, X(p[1]), Y(p[0]), 0.14, C.dorange, "ISOSCELES_TRIANGLE"));
  lt6.forEach(p => dot(s, X(p[1]), Y(p[0]), 0.1, C.green));
  const leg = [["RECTANGLE", C.navy, "学習16"], ["DIAMOND", C.teal, "検証8"], ["OVAL", C.orange, "テスト12"], ["ISOSCELES_TRIANGLE", C.dorange, "追加5"], ["OVAL", C.green, "局所テスト6"]];
  leg.forEach((l, i) => {
    const lx = 7.5 + (i % 3) * 1.75, ly = 6.3 + Math.floor(i / 3) * 0.27;
    dot(s, lx + 0.08, ly + 0.12, 0.13, l[1], l[0]);
    T(s, l[2], { x: lx + 0.2, y: ly, w: 1.5, h: 0.24, fontSize: 9.5, color: C.text });
  });
  s.addNotes("1件のデータは、入力（AとD）と正解値（SEBEの計算値）の組です。同じ形のデータでも、何に使ったかで学習用・検証・テストと呼び分けています。線形補間は係数を学習しないので、学習用データは「補間の基準として保存した計算データ」と言う方が正確です。合計は重複なしで47配置です。");
}

// =====================================================================
// P5-2: データの数え方（計算例つき）
// =====================================================================
{
  const s = std(next(), 5, "データの数え方：2,500区画を高さ10mごとに平均して5つの値にする", "例：(A, D)＝(50m, 10m) の配置。SEBEの壁出力から中央建物の南面（50m×50m）だけを取り出して計算する。");
  const v = [337.34062, 351.22192, 382.56720, 485.54594, 867.14398];
  R(s, 0.5, 1.62, 6.2, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "1配置（A 50m・D 10m）の南面", { x: 0.65, y: 1.68, w: 5.9, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const wx = 1.45, wy = 2.05, ww = 2.3, wh = 2.45;
  const bandCols = ["F6D2B4", "F2BE92", "EEA870", "E8934D", "D77B35"];
  for (let k = 0; k < 5; k++) {
    const y = wy + wh - (k + 1) * wh / 5;
    R(s, wx, y, ww, wh / 5, bandCols[k], { line: C.white, lw: 1 });
    T(s, M(`帯${k + 1}：y_{${k + 1}}＝${v[k].toFixed(2)}`), { x: wx, y, w: ww, h: wh / 5, fontSize: 10, bold: true, color: k >= 3 ? C.white : C.navy, align: "center", valign: "middle", margin: 0 });
    T(s, `${k * 10}〜${k * 10 + 10}m`, { x: 0.6, y: y + 0.12, w: 0.8, h: 0.25, fontSize: 8.5, color: C.muted, align: "right" });
  }
  T(s, "幅50m（50区画）", { x: wx, y: wy + wh + 0.02, w: ww, h: 0.24, fontSize: 8.5, color: C.muted, align: "center" });
  T(s, bullets([
    "1マス＝1m四方の区画 (p, q)。p は横、q は縦の番号。SEBEが年間日射量 G を出す",
    "1つの帯＝幅50×高さ10＝500区画",
    "南面全体＝50×50＝2,500区画",
    "5帯とも面積が同じ → 全体平均は5帯の平均と同じ",
  ], { gap: 5 }), { x: 4.0, y: 2.05, w: 2.6, h: 2.5, fontSize: 9.5 });

  R(s, 0.65, 4.72, 5.9, 2.1, C.navy, { round: true, rr: 0.06 });
  T(s, ML([
    ["帯の平均：y_{k} ＝ (1/500) Σ_{(p,q)∈帯k} G_{p,q}", { color: C.white }],
    ["Σ_{(p,q)∈帯k}：帯kに入る500区画の G を全部足す", { color: "CADCFC", fontSize: 9.5, bold: false }],
    ["帯1に代入：y_{1} ＝ 168,670.31 ÷ 500 ＝ 337.34 kWh/m²", { color: C.orange }],
    ["全体平均：ȳ ＝ (1/5) Σ_{k=1}^{5} y_{k}（帯1〜5を足して5で割る）", { color: C.white }],
    ["＝ (337.34＋351.22＋382.57＋485.55＋867.14) / 5 ＝ 484.76", { color: C.orange }],
  ]), { x: 0.8, y: 4.78, w: 5.65, h: 1.72, fontSize: 10.5, bold: true, lineSpacingMultiple: 1.15 });
  T(s, "※ 500区画の合計（168,670.31）は、保存した帯平均×500 で逆算した値", { x: 0.8, y: 6.52, w: 5.65, h: 0.26, fontSize: 8.5, color: "CADCFC" });

  T(s, "16配置ぶんでは、何を何個数えているか", { x: 6.95, y: 1.62, w: 5.9, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  table(s, [
    ["数えているもの", "個数", "意味"],
    ["建物配置", { t: "16件", o: { bold: true, color: C.dorange } }, "A・Dの組み合わせ（学習例の数）"],
    ["入力の数値", "16×2＝32個", "各配置のAとD"],
    ["南面の元の区画値", "16×2,500＝40,000個", "集計前の日射量 G"],
    ["5帯の平均", "16×5＝80個", "予測に使う値（16行×5列の表）"],
    ["全体平均", "16個", "5帯から計算できる"],
    ["5帯＋全体平均", "16×6＝96個", "表示・保存する数値の数"],
  ], { x: 6.95, y: 2.0, w: 5.9, colW: [1.75, 1.75, 2.4], rowH: 0.36, fs: 10, boldCol0: true });
  R(s, 6.95, 4.75, 5.9, 2.15, C.peach, { round: true, rr: 0.06 });
  T(s, "96件の学習データではない", { x: 7.15, y: 4.83, w: 5.5, h: 0.32, fontSize: 13, bold: true, color: C.dorange });
  T(s, bullets([
    "96は「数値の個数」。異なる配置（学習例）は16件のまま",
    "同じ配置から取った5帯の値は、別々の条件ではない",
    "全体平均は5帯の平均なので、加えても情報は増えない",
  ], { gap: 4 }), { x: 7.15, y: 5.22, w: 5.5, h: 1.6, fontSize: 10.5 });
  s.addNotes("1配置につきSEBEは南面の1m四方の区画ごとに年間日射量を出し、その数は2,500個です。これを高さ10mごとに500個ずつ平均して5つの値にします。例えば(50,10)の帯1は、500区画の合計168,670.31を500で割って337.34です。全体平均は5帯の平均で484.76です。16配置なら80個の帯平均になりますが、学習例は16件です。");
}

// =====================================================================
// P5-3: 補間の計算（式と代入を1枚に）
// =====================================================================
{
  const s = std(next(), 5, "補間の計算：入力を囲む4配置の値を、近さの割合（重み）で混ぜる", "例：A＝55.9m・D＝14m を入力した場合。重みは学習した係数ではなく、入力の位置から毎回計算する割合。中央建物は高さ50mのまま。");
  const hl = { bold: true, color: C.dorange, fill: { color: C.peach } };
  // 左：重みを決める
  R(s, 0.5, 1.62, 6.0, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "ステップ1〜3：重みを決める", { x: 0.65, y: 1.68, w: 5.7, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  circleNum(s, 0.65, 2.08, 1, C.teal, 0.3, 11);
  T(s, "入力を囲む計算済みの4配置（4隅）を探す", { x: 1.05, y: 2.06, w: 5.35, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  T(s, "50 ≤ 55.9 < 75，10 ≤ 14 < 25 → (50,10)(75,10)(50,25)(75,25)", { x: 1.05, y: 2.36, w: 5.35, h: 0.26, fontSize: 10, bold: true, color: C.dorange });
  circleNum(s, 0.65, 2.78, 2, C.teal, 0.3, 11);
  T(s, "区間の中のどこにいるかを割合で表す", { x: 1.05, y: 2.76, w: 5.35, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  T(s, ML([
    "u ＝ (A − A_{0}) / (A_{1} − A_{0}) ＝ (55.9 − 50) / 25 ＝ 0.236",
    "v ＝ (D − D_{0}) / (D_{1} − D_{0}) ＝ (14 − 10) / 15 ＝ 0.267",
  ]), { x: 1.05, y: 3.05, w: 5.35, h: 0.5, fontSize: 10, bold: true, color: C.navy });
  T(s, "u：50m→75m へ23.6%進んだ位置　v：10m→25m へ26.7%進んだ位置", { x: 1.05, y: 3.55, w: 5.35, h: 0.24, fontSize: 9, color: C.muted });
  circleNum(s, 0.65, 3.92, 3, C.teal, 0.3, 11);
  T(s, "重み ＝ 高さ方向の割合 × 距離方向の割合", { x: 1.05, y: 3.9, w: 5.35, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  table(s, [
    ["重み：隅 (A, D)", "高さ方向", "距離方向", "重み"],
    ["w_{1}：(50, 10)", "1−u ＝ 0.764", "1−v ＝ 0.733", { t: "0.560", o: hl }],
    ["w_{2}：(75, 10)", "u ＝ 0.236", "1−v ＝ 0.733", { t: "0.173", o: { bold: true } }],
    ["w_{3}：(50, 25)", "1−u ＝ 0.764", "v ＝ 0.267", { t: "0.204", o: { bold: true } }],
    ["w_{4}：(75, 25)", "u ＝ 0.236", "v ＝ 0.267", { t: "0.063", o: { bold: true } }],
    [{ t: "合計", o: { bold: true } }, "", "", { t: "1", o: { bold: true } }],
  ], { x: 1.05, y: 4.22, w: 5.3, colW: [1.5, 1.3, 1.3, 1.2], rowH: 0.3, fs: 9.5, math: true, boldCol0: true });
  T(s, "入力に一番近い (50,10) の重みが最大。入力が隅にぴったり重なると、その隅の重みが1になり、保存値そのものになる。", { x: 0.65, y: 6.1, w: 5.75, h: 0.72, fontSize: 9.5, color: C.text });

  // 右：重みで混ぜる
  R(s, 6.75, 1.62, 6.1, 5.28, C.white, { round: true, rr: 0.06, line: "DCE1E7" });
  T(s, "ステップ4〜5：重みで混ぜる", { x: 6.9, y: 1.68, w: 5.8, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  R(s, 6.9, 2.05, 5.8, 0.95, C.navy, { round: true, rr: 0.05 });
  T(s, M("ŷ_{k} ＝ Σ_{c=1}^{4} w_{c} × y_{k}(A_{c}, D_{c})"), { x: 7.0, y: 2.08, w: 5.6, h: 0.44, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle" });
  T(s, M("Σ_{c=1}^{4}：c に 1, 2, 3, 4 を順に入れて足す（4隅の「重み×保存値」の合計）"), { x: 7.0, y: 2.52, w: 5.6, h: 0.42, fontSize: 9.5, color: "CADCFC", align: "center", valign: "middle" });
  T(s, ML([
    "帯1：ŷ_{1} ＝ 0.560×337.34 ＋ 0.173×319.89",
    ["　　　　 ＋ 0.204×589.57 ＋ 0.063×535.49 ＝ 398.18", { color: C.dorange }],
  ]), { x: 6.9, y: 3.08, w: 5.8, h: 0.55, fontSize: 10.5, bold: true, color: C.navy });
  const vals = [
    ["0〜10m", 337.34, 319.89, 589.57, 535.49, 398.18],
    ["10〜20m", 351.22, 320.20, 631.33, 561.20, 416.13],
    ["20〜30m", 382.57, 323.60, 697.92, 585.75, 449.40],
    ["30〜40m", 485.55, 348.50, 873.24, 603.63, 548.25],
    ["40〜50m", 867.14, 357.95, 1006.93, 660.25, 794.48],
  ];
  table(s, [
    ["帯 k", "(50,10)", "(75,10)", "(50,25)", "(75,25)", "予測"],
    [{ t: "重み", o: { bold: true, color: C.teal } }, ...["0.560", "0.173", "0.204", "0.063"].map(t => ({ t, o: { bold: true, color: C.teal } })), { t: "合計1", o: { color: C.teal } }],
    ...vals.map(r => [r[0], ...r.slice(1, 5).map(x => x.toFixed(2)), { t: r[5].toFixed(2), o: hl }]),
    [{ t: "平均", o: { bold: true } }, "", "", "", "", { t: "521.29", o: hl }],
  ], { x: 6.9, y: 3.72, w: 5.8, colW: [0.9, 0.95, 0.95, 0.95, 0.95, 1.1], rowH: 0.3, fs: 9.5, boldCol0: true });
  T(s, "⑤ 南面全体の平均 ＝ 5帯の平均 ＝ 521.29 kWh/m²", { x: 6.9, y: 6.2, w: 5.8, h: 0.28, fontSize: 10.5, bold: true, color: C.navy });
  T(s, "この条件ではSEBEを実行していないので、この値の誤差は分からない。局所改良版は A 25〜50m 用なので使えない。", { x: 6.9, y: 6.48, w: 5.8, h: 0.4, fontSize: 8.5, color: C.muted });
  s.addNotes("");
}

// =====================================================================
// P5-4: 精度の確かめ方（式と代入を1枚に）
// =====================================================================
{
  const s = std(next(), 5, "精度の確かめ方：予測とSEBEの差を、使っていない配置で数える", "代表値：検証で最も外れた A 35m・D 15m・30〜40m帯（SEBE 1,014.20，予測 861.26 kWh/m²）で式に代入する。");
  const flow = [["学習16", "表を作る", C.navy], ["検証8", "3手法を比較", C.teal], ["方法を固定", "ここで決定", C.navy3], ["テスト12", "最終確認", C.orange], ["追加5", "弱点を補強", C.dorange], ["局所テスト6", "改良前後を比較", C.green]];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 2.07;
    s.addShape(pres.shapes.CHEVRON, { x, y: 1.62, w: 2.0, h: 0.8, fill: { color: f[2] }, line: { type: "none" } });
    T(s, [{ text: f[0], options: { bold: true, fontSize: 11.5, breakLine: true } }, { text: f[1], options: { fontSize: 9 } }], { x: x + 0.3, y: 1.63, w: 1.45, h: 0.78, color: C.white, align: "center", valign: "middle" });
  });
  const fm = [
    ["誤差", "e ＝ ŷ − y", "861.26 − 1,014.20 ＝ −152.94（マイナス＝低く予測）"],
    ["絶対誤差", "|e| ＝ |ŷ − y|", "|−152.94| ＝ 152.94 kWh/m²"],
    ["誤差率", "|ŷ − y| ÷ y × 100", "152.94 ÷ 1,014.20 × 100 ＝ 15.08 %"],
    ["MAE（平均絶対誤差）", "(1/N) Σ_{j=1}^{N} |ŷ_{j} − y_{j}|", "検証8配置：(|e_{1}|＋…＋|e_{8}|) ÷ 8 ＝ 159.92 ÷ 8 ＝ 19.99"],
    ["平均誤差率", "(100/N) Σ_{j=1}^{N} |ŷ_{j} − y_{j}| / y_{j}", "検証8配置：2.67 %"],
  ];
  fm.forEach((f, i) => {
    const y = 2.6 + i * 0.78;
    R(s, 0.5, y, 7.0, 0.72, i % 2 ? C.white : C.panel, { round: true, rr: 0.05, line: "E1E5EA" });
    T(s, f[0], { x: 0.62, y: y + 0.05, w: 1.9, h: 0.62, fontSize: 10.5, bold: true, color: C.teal, valign: "middle" });
    T(s, M(f[1]), { x: 2.55, y: y + 0.04, w: 4.9, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
    T(s, M(f[2]), { x: 2.55, y: y + 0.37, w: 4.9, h: 0.3, fontSize: 10, bold: true, color: C.dorange });
  });
  T(s, M("Σ_{j=1}^{N}：1件目から N 件目までを順に足す記号（N＝比べた値の数）"), { x: 0.5, y: 6.47, w: 7, h: 0.26, fontSize: 9.5, bold: true, color: C.teal });
  T(s, "※ 8件の絶対誤差の合計 159.92 は MAE 19.99 × 8 で逆算した値", { x: 0.5, y: 6.73, w: 7, h: 0.2, fontSize: 8, color: C.muted });
  table(s, [
    ["評価の目的", "使ったデータ", "N", "結果"],
    ["手法の比較（検証）", "検証8配置・全体平均", "8", "MAE 19.99・2.67%"],
    ["最終確認（テスト）", "テスト12配置・全体平均", "12", "MAE 18.40・2.42%"],
    ["高さ帯別の弱点", "検証8配置 × 5帯", "40", "30〜40m帯 MAE 38.56"],
    ["局所改良の確認", "局所テスト6配置 × 5帯", "30", "MAE 43.50→17.81"],
  ], { x: 7.75, y: 2.6, w: 5.1, colW: [1.5, 1.75, 0.4, 1.45], rowH: 0.42, fs: 9, boldCol0: true });
  box(s, 7.75, 4.85, 5.1, 2.05, "読み方の注意", null, { fill: C.peach, tcolor: C.dorange, tfs: 11 });
  T(s, bullets([
    "テストデータは方法を決めた後にだけ使った（結果を見て方法を変えていない）",
    "「× 5帯」の N は値の数で、配置の数ではない",
    "数値はSEBEとの比較。実測日射量や発電量の精度ではない",
  ], { gap: 3 }), { x: 7.9, y: 5.23, w: 4.85, h: 1.6, fontSize: 9.5 });
  s.addNotes("精度は予測とSEBEの差で評価します。最も外れたA=35m・D=15mの30〜40m帯では、誤差は−152.94、誤差率は15.08%です。MAEはこの絶対誤差をN件分平均したもので、検証8配置では19.99です。上の流れのように、検証で方法を決めてからテストデータを使っています。");
}

// =====================================================================
// 25: 追加5配置の決め方
// =====================================================================
{
  const s = std(next(), 5, "追加した5配置の決め方：誤差の大きい格子を3×3に細かくした", "追加は計算前に計画していた（sebe_refinement/README.txt に追加5配置・局所格子・確認用6配置を記載）。");
  const st = [
    ["誤差が大きい場所を見つける", "検証8配置のうち A＝35m・D＝15m の30〜40m帯で最大誤差（SEBE 1,014.20 → 予測 861.26、差152.94・15.08%）"],
    ["その点を囲む既存の格子を選ぶ", "25 ≤ A ≤ 50，10 ≤ D ≤ 25 → 既存の4隅 (25,10)(25,25)(50,10)(50,25) を再利用"],
    ["区切りを1本ずつ追加する", "高さ A に 35m、隙間 D に 17m を追加 → A 25・35・50 × D 10・17・25"],
    ["足りない点を計算する", "3×3＝9点 − 既存4点 ＝ 追加5点（無作為に5と決めたのではない）"],
  ];
  st.forEach((t, i) => {
    const y = 1.62 + i * 1.02;
    R(s, 0.5, y, 5.9, 0.92, C.panel, { round: true, rr: 0.05 });
    circleNum(s, 0.65, y + 0.12, i + 1, C.teal);
    T(s, t[0], { x: 1.1, y: y + 0.08, w: 5.2, h: 0.28, fontSize: 11.5, bold: true, color: C.navy });
    T(s, t[1], { x: 1.1, y: y + 0.38, w: 5.2, h: 0.52, fontSize: 9.5, color: C.text });
  });
  T(s, "→ 1つの補間領域が4つに分かれ、短い区間ごとに補間できる", { x: 0.5, y: 5.75, w: 5.9, h: 0.3, fontSize: 10.5, bold: true, color: C.teal });
  T(s, "A＝35・D＝15は答えを直接入れていないが、改良方針を決めるのに使ったので、改良後の独立テストには使えない → 新しい6配置で確認", { x: 0.5, y: 6.1, w: 5.9, h: 0.75, fontSize: 9.5, color: C.muted });

  // 格子図
  const gx = 7.25, gy = 1.9, gw = 2.6, gh = 2.6;
  R(s, 6.65, 1.62, 3.65, 3.85, C.panel, { round: true, rr: 0.06 });
  const Dx = d => gx + (d - 10) / 15 * gw, Ay = a => gy + gh - (a - 25) / 25 * gh;
  R(s, Dx(10), Ay(50), gw, gh, C.white, { line: "C9D0D8" });
  [17].forEach(d => line(s, Dx(d), Ay(50), Dx(d), Ay(25), { color: C.orange, dash: "dash", width: 1 }));
  [35].forEach(a => line(s, Dx(10), Ay(a), Dx(25), Ay(a), { color: C.orange, dash: "dash", width: 1 }));
  [[25, 10], [25, 25], [50, 10], [50, 25]].forEach(p => dot(s, Dx(p[1]), Ay(p[0]), 0.17, C.navy, "RECTANGLE"));
  [[25, 17], [35, 10], [35, 17], [35, 25], [50, 17]].forEach(p => dot(s, Dx(p[1]), Ay(p[0]), 0.18, C.orange));
  dot(s, Dx(15), Ay(35), 0.2, C.red, "STAR_5_POINT");
  T(s, "最大誤差点 (35,15)", { x: Dx(15) - 0.75, y: Ay(35) - 0.42, w: 1.5, h: 0.24, fontSize: 8.5, color: C.red, bold: true, align: "center" });
  [10, 17, 25].forEach(d => T(s, String(d), { x: Dx(d) - 0.25, y: gy + gh + 0.08, w: 0.5, h: 0.22, fontSize: 9, color: C.muted, align: "center" }));
  [25, 35, 50].forEach(a => T(s, String(a), { x: gx - 0.5, y: Ay(a) - 0.11, w: 0.38, h: 0.22, fontSize: 9, color: C.muted, align: "right" }));
  T(s, "隙間 D (m)", { x: gx, y: gy + gh + 0.3, w: gw, h: 0.22, fontSize: 9, color: C.navy, align: "center" });
  T(s, "A (m)", { x: 6.7, y: 1.66, w: 0.6, h: 0.22, fontSize: 9, color: C.navy });
  dot(s, 6.95, 5.08, 0.13, C.navy, "RECTANGLE"); T(s, "既存の4隅", { x: 7.08, y: 4.97, w: 1.1, h: 0.22, fontSize: 9 });
  dot(s, 8.3, 5.08, 0.13, C.orange); T(s, "追加した5点", { x: 8.43, y: 4.97, w: 1.4, h: 0.22, fontSize: 9 });

  box(s, 10.55, 1.62, 2.3, 3.85, "言えること", null, { fill: C.greenL, tcolor: C.green });
  T(s, bullets(["改善する場所の選び方には理由がある", "5は3×3格子に不足する点の数", "確認用6配置も事前に記載", "局所範囲のMAE 43.50→17.81"], { gap: 5 }), { x: 10.65, y: 2.0, w: 2.15, h: 3.4, fontSize: 10 });
  R(s, 6.65, 5.65, 6.2, 1.25, C.redL, { round: true, rr: 0.06 });
  T(s, "まだ言えないこと（検証していない）", { x: 6.8, y: 5.72, w: 5.9, h: 0.28, fontSize: 11, bold: true, color: C.red });
  T(s, "17mが誤差を最小にする区切りか ／ 5配置が必要十分な最小数か ／ 他の候補と比べてこの5配置が最良か。17mは設計上の選択であり、最適な区切りや点数を求めた実験ではない。", { x: 6.8, y: 6.02, w: 5.9, h: 0.85, fontSize: 9.5, color: C.text });
  s.addNotes("「適当に増やしたのか」という質問への回答です。誤差が最大だった配置を含む格子に着目し、既存の4隅を再利用して、高さと距離に区切りを1本ずつ追加して3×3にしました。足りない5点を計算し、未使用の6配置で改善を確認しました。ただし17mや5点が最適かどうかは検証していません。");
}

// =====================================================================
// 26: 最終目標 平面図
// =====================================================================
{
  const s = std(next(), 6, "最終目標ツール：周囲の建物ごとに4つの変数を変える（平面図）", "中央建物 C の周囲に0〜4棟を置き、C の北・東・南・西の壁面日射量を高さ帯ごとに予測する。");
  R(s, 0.5, 1.6, 6.0, 5.3, C.panel, { round: true, rr: 0.06 });
  T(s, "上から見た図（例：3棟あり・1棟なし）", { x: 0.65, y: 1.66, w: 5.5, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const cx = 3.35, cy = 4.3, k = 0.0142;
  const P = (x, y) => [cx + x * k, cy - y * k];
  // 方位ガイド
  line(s, ...P(0, 0), ...P(0, 125), { color: C.faint, width: 0.75, dash: "dash", end: "triangle" });
  T(s, "北 0°", { x: P(0, 125)[0] + 0.05, y: P(0, 125)[1] - 0.05, w: 1.0, h: 0.24, fontSize: 9, bold: true, color: C.muted, align: "center" });
  T(s, "東 90°", { x: P(135, 0)[0] - 0.3, y: P(150, 0)[1] - 0.12, w: 0.7, h: 0.24, fontSize: 9, bold: true, color: C.muted });
  T(s, "南 180°", { x: P(0, -140)[0] + 0.1, y: P(0, -140)[1] - 0.05, w: 1.0, h: 0.24, fontSize: 9, bold: true, color: C.muted, align: "center" });
  T(s, "西 270°", { x: P(-150, 0)[0] - 0.4, y: P(-160, 0)[1] - 0.12, w: 0.75, h: 0.24, fontSize: 9, bold: true, color: C.muted });
  const bld = [
    { i: 1, th: 20, r: 100, A: "A₁", s: 1 },
    { i: 2, th: 110, r: 95, A: "A₂", s: 1 },
    { i: 3, th: 200, r: 100, A: "A₃", s: 1 },
    { i: 4, th: 290, r: 95, A: "A₄", s: 0 },
  ];
  // 中央建物
  const c0 = P(-25, 25);
  R(s, c0[0], c0[1], 50 * k, 50 * k, C.navy);
  T(s, [{ text: "中央 C", options: { bold: true, breakLine: true } }, { text: "高さ H", options: { fontSize: 8.5 } }, { text: "C", options: { fontSize: 8.5, subscript: true } }], { x: c0[0], y: c0[1], w: 50 * k, h: 50 * k, fontSize: 9.5, color: C.white, align: "center", valign: "middle", margin: 0 });
  bld.forEach(b => {
    const t = b.th * Math.PI / 180;
    const bx = b.r * Math.sin(t), by = b.r * Math.cos(t);
    const tl = P(bx - 25, by + 25);
    line(s, ...P(0, 0), ...P(bx, by), { color: b.s ? C.dorange : C.faint, width: 0.75, dash: "sysDot" });
    if (b.s) R(s, tl[0], tl[1], 50 * k, 50 * k, C.teal);
    else R(s, tl[0], tl[1], 50 * k, 50 * k, C.white, { line: C.faint, dash: "dash", lw: 1 });
    T(s, [{ text: `建物${b.i}`, options: { bold: true, breakLine: true } }, { text: b.s ? `高さ ${b.A}` : "なし", options: { fontSize: 8.5 } }], { x: tl[0], y: tl[1] + 0.1, w: 50 * k, h: 0.5, fontSize: 8.5, color: b.s ? C.white : C.muted, align: "center", valign: "middle", margin: 0 });
    T(s, M(`s_{${b.i}}＝${b.s}`), { x: tl[0], y: tl[1] + 50 * k + 0.02, w: 50 * k, h: 0.22, fontSize: 9, bold: true, color: b.s ? C.teal : C.muted, align: "center" });
    // θラベル
    const lpos = { 1: [62, 60], 2: [118, -22], 3: [-128, -85], 4: [-128, 70] }[b.i];
    const lp = P(lpos[0], lpos[1]);
    T(s, M(`θ_{${b.i}}＝${b.th}°`), { x: lp[0], y: lp[1], w: 0.95, h: 0.22, fontSize: 9, bold: true, color: b.s ? C.dorange : C.faint });
    // D: 最短距離の線
    if (b.s) {
      const cxr = [-25, 25], bxr = [bx - 25, bx + 25], cyr = [-25, 25], byr = [by - 25, by + 25];
      let x1, x2, y1, y2;
      if (bxr[0] > 25) { x1 = 25; x2 = bxr[0]; } else if (bxr[1] < -25) { x1 = -25; x2 = bxr[1]; } else { const m = (Math.max(-25, bxr[0]) + Math.min(25, bxr[1])) / 2; x1 = x2 = m; }
      if (byr[0] > 25) { y1 = 25; y2 = byr[0]; } else if (byr[1] < -25) { y1 = -25; y2 = byr[1]; } else { const m = (Math.max(-25, byr[0]) + Math.min(25, byr[1])) / 2; y1 = y2 = m; }
      line(s, ...P(x1, y1), ...P(x2, y2), { color: C.red, width: 1.5, begin: "triangle", end: "triangle" });
      const mp = P((x1 + x2) / 2, (y1 + y2) / 2);
      const horiz = y1 === y2;
      T(s, M(`D_{${b.i}}`), { x: mp[0] + (horiz ? -0.2 : 0.05), y: mp[1] + (horiz ? 0.02 : -0.12), w: 0.4, h: 0.24, fontSize: 10, bold: true, color: C.red });
    }
  });
  T(s, "θ：北から時計回り。建物の向き（回転）ではなく「置く方向」。建物の辺は東西・南北に固定。", { x: 0.65, y: 6.45, w: 5.7, h: 0.42, fontSize: 8.5, color: C.muted });

  // 右：変数表
  T(s, "変える変数：1 ＋ 4棟 × 4個 ＝ 17個", { x: 6.8, y: 1.62, w: 6, h: 0.32, fontSize: 13, bold: true, color: C.navy });
  table(s, [
    ["記号", "意味", "どこの値か", "範囲（設計）"],
    ["H_{C}", "中央建物の高さ", "Cの地面〜屋根", "25・50・75・100m"],
    ["s_{i}", "建物iの有無", "置く＝1，置かない＝0", "0 または 1"],
    ["A_{i}", "周囲建物iの高さ", "建物iの地面〜屋根", "25〜100m"],
    ["D_{i}", "Cとの隙間", "外形どうしの最短距離（赤線）", "10〜100m"],
    ["θ_{i}", "置く方位", "Cの中心→建物iの中心の向き", "0〜360°"],
  ], { x: 6.8, y: 2.02, w: 6.05, colW: [0.75, 1.6, 2.3, 1.4], rowH: 0.42, fs: 10, math: true, boldCol0: true });
  T(s, M("i＝1, 2, 3, 4（周囲建物の番号）。棟数 n ＝ Σ_{i=1}^{4} s_{i} は s から計算できるので、別の入力にはしない。"), { x: 6.8, y: 4.65, w: 6.05, h: 0.5, fontSize: 10, color: C.text });
  // 17個の内訳
  R(s, 6.8, 5.25, 6.05, 1.65, C.navy, { round: true, rr: 0.06 });
  T(s, "17個の内訳", { x: 7.0, y: 5.32, w: 3, h: 0.28, fontSize: 11, bold: true, color: C.orange });
  const cells = [["H_{C}", 1]].concat([1, 2, 3, 4].map(i => [`s_{${i}}, A_{${i}}, D_{${i}}, θ_{${i}}`, 4]));
  cells.forEach((c, j) => {
    const x = 7.0 + (j === 0 ? 0 : 0.82 + (j - 1) * 1.24), w = j === 0 ? 0.72 : 1.17;
    R(s, x, 5.68, w, 0.55, j === 0 ? C.orange : C.navy3, { round: true, rr: 0.05 });
    T(s, M(c[0]), { x, y: 5.68, w, h: 0.55, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  });
  T(s, "中央の高さ 1個 ＋ 建物1〜4 それぞれ4個 ＝ 17個。建物がない棟（s＝0）の A・D・θ は使わない。", { x: 7.0, y: 6.3, w: 5.7, h: 0.5, fontSize: 9.5, color: "CADCFC" });
  s.addNotes("最終目標のツールでは、中央建物の高さH_Cと、周囲建物ごとの有無s、高さA、隙間D、方位θを変えます。1＋4×4で17個です。θは建物を回転させる角度ではなく、中央から見て建物を置く方向です。Dは外形どうしの最短距離で、図の赤線です。");
}

// =====================================================================
// 27: 最終目標 3D
// =====================================================================
{
  const s = std(next(), 6, "最終目標ツール：立体で見た変数と、出力する20個の値", "高さの変数（中央の高さ・周囲建物の高さ）は立体図で見ると分かりやすい。出力は中央建物の4面 × 5つの高さ帯。");
  R(s, 0.5, 1.6, 7.0, 5.3, C.panel, { round: true, rr: 0.06 });
  T(s, "斜め上（南東）から見た図", { x: 0.65, y: 1.66, w: 5, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const k = 0.031, X0 = 4.05, Y0 = 4.55;
  const Pj = (x, y, z) => [X0 + k * (x + y) * 0.7071, Y0 + k * (-z * 0.95 + (x - y) * 0.3536)];
  const boxD = (x0, x1, y0, y1, h, cTop, cS, cE) => {
    poly(s, [Pj(x0, y0, h), Pj(x1, y0, h), Pj(x1, y1, h), Pj(x0, y1, h)], { fill: cTop, line: C.white, lw: 0.5 });
    poly(s, [Pj(x0, y0, 0), Pj(x1, y0, 0), Pj(x1, y0, h), Pj(x0, y0, h)], { fill: cS, line: C.white, lw: 0.5 });
    poly(s, [Pj(x1, y0, 0), Pj(x1, y1, 0), Pj(x1, y1, h), Pj(x1, y0, h)], { fill: cE, line: C.white, lw: 0.5 });
  };
  // 地面の目安
  poly(s, [Pj(-105, -35, 0), Pj(-35, -110, 0), Pj(35, -110, 0), Pj(115, -35, 0), Pj(115, 35, 0), Pj(35, 105, 0), Pj(-35, 105, 0), Pj(-105, 35, 0)], { fill: "E6EAEF" });
  // 北：なし（点線）
  poly(s, [Pj(-25, 45, 0), Pj(25, 45, 0), Pj(25, 95, 0), Pj(-25, 95, 0)], { line: C.muted, dash: "dash", lw: 1 });
  // 西の建物
  boxD(-95, -45, -25, 25, 45, "9CC3C7", "2C8791", "1F6F78");
  // 中央建物（南面・東面を帯で塗る）
  const H = 50;
  poly(s, [Pj(-25, -25, H), Pj(25, -25, H), Pj(25, 25, H), Pj(-25, 25, H)], { fill: "4A5F85", line: C.white, lw: 0.5 });
  const sCols = ["F6D2B4", "F2BE92", "EEA870", "E8934D", "D77B35"];
  const eCols = ["C9DCE0", "B5CFD4", "A0C2C8", "8BB5BC", "76A8B0"];
  for (let b = 0; b < 5; b++) {
    const z0 = b * 10, z1 = z0 + 10;
    poly(s, [Pj(-25, -25, z0), Pj(25, -25, z0), Pj(25, -25, z1), Pj(-25, -25, z1)], { fill: sCols[b], line: C.white, lw: 0.75 });
    poly(s, [Pj(25, -25, z0), Pj(25, 25, z0), Pj(25, 25, z1), Pj(25, -25, z1)], { fill: eCols[b], line: C.white, lw: 0.75 });
  }
  // 南の建物・東の建物
  boxD(-25, 25, -100, -50, 35, "9CC3C7", "2C8791", "1F6F78");
  boxD(55, 105, -25, 25, 60, "9CC3C7", "2C8791", "1F6F78");
  // 寸法：H_C
  const a1 = Pj(-25, -25, 0), a2 = Pj(-25, -25, 50);
  line(s, a1[0] - 0.2, a1[1], a2[0] - 0.2, a2[1], { color: C.dorange, width: 1.25, begin: "triangle", end: "triangle" });
  T(s, M("H_{C}"), { x: a1[0] - 0.62, y: (a1[1] + a2[1]) / 2 - 0.14, w: 0.42, h: 0.28, fontSize: 12, bold: true, color: C.dorange });
  // A_S
  const b1 = Pj(-25, -100, 0), b2 = Pj(-25, -100, 35);
  line(s, b1[0] - 0.15, b1[1], b2[0] - 0.15, b2[1], { color: C.dorange, width: 1.25, begin: "triangle", end: "triangle" });
  T(s, M("A_{南}"), { x: b1[0] - 0.62, y: (b1[1] + b2[1]) / 2 - 0.14, w: 0.45, h: 0.28, fontSize: 12, bold: true, color: C.dorange });
  // D_S（地面）
  const d1 = Pj(25, -50, 0), d2 = Pj(25, -25, 0);
  line(s, d1[0] + 0.06, d1[1] + 0.06, d2[0] + 0.06, d2[1] + 0.06, { color: C.red, width: 1.5, begin: "triangle", end: "triangle" });
  T(s, M("D_{南}"), { x: (d1[0] + d2[0]) / 2 + 0.1, y: (d1[1] + d2[1]) / 2 + 0.02, w: 0.5, h: 0.26, fontSize: 11, bold: true, color: C.red });
  // D_E
  const e1 = Pj(25, -25, 0), e2 = Pj(55, -25, 0);
  line(s, e1[0] + 0.02, e1[1] + 0.08, e2[0] + 0.02, e2[1] + 0.08, { color: C.red, width: 1.5, begin: "triangle", end: "triangle" });
  T(s, M("D_{東}"), { x: (e1[0] + e2[0]) / 2 - 0.1, y: (e1[1] + e2[1]) / 2 + 0.12, w: 0.5, h: 0.26, fontSize: 11, bold: true, color: C.red });
  // A_E
  const f1 = Pj(105, 25, 0), f2 = Pj(105, 25, 60);
  line(s, f1[0] + 0.12, f1[1], f2[0] + 0.12, f2[1], { color: C.dorange, width: 1.25, begin: "triangle", end: "triangle" });
  T(s, M("A_{東}"), { x: f1[0] + 0.16, y: (f1[1] + f2[1]) / 2 - 0.14, w: 0.5, h: 0.28, fontSize: 12, bold: true, color: C.dorange });
  // ラベル
  const sl = Pj(0, -25, 30);
  T(s, "南面", { x: sl[0] - 0.4, y: sl[1] - 0.12, w: 0.8, h: 0.24, fontSize: 10, bold: true, color: C.navy, align: "center", margin: 0 });
  const el = Pj(25, 0, 30);
  T(s, "東面", { x: el[0] - 0.4, y: el[1] - 0.12, w: 0.8, h: 0.24, fontSize: 10, bold: true, color: C.navy, align: "center", margin: 0 });
  T(s, "西の建物", { x: 0.6, y: 2.72, w: 1.3, h: 0.24, fontSize: 9, bold: true, color: C.teal });
  T(s, M("A_{西}・D_{西}"), { x: 0.6, y: 2.95, w: 1.3, h: 0.26, fontSize: 9, bold: true, color: C.teal });
  T(s, M("北は建物なし：s_{北}＝0\n（点線は置く場合の位置）"), { x: 4.95, y: 2.0, w: 2.4, h: 0.45, fontSize: 9, bold: true, color: C.muted });
  // 北矢印
  const n0 = [6.5, 6.4], n1 = [6.5 + 0.7071 * 0.5, 6.4 - 0.3536 * 0.5];
  line(s, n0[0], n0[1], n1[0], n1[1], { color: C.navy, width: 1.5, end: "triangle" });
  T(s, "北", { x: n1[0] + 0.02, y: n1[1] - 0.2, w: 0.3, h: 0.22, fontSize: 9, bold: true, color: C.navy });
  T(s, "色の段＝高さ帯（下から帯1〜帯5）。北面・西面は裏側で見えないが、同じく5帯ずつ出力する", { x: 0.65, y: 6.5, w: 5.6, h: 0.36, fontSize: 9, color: C.muted });

  // 右：出力
  T(s, "出力：4面 × 5帯 ＝ 20個の年間日射量", { x: 7.8, y: 1.62, w: 5, h: 0.32, fontSize: 13, bold: true, color: C.navy });
  const faces = ["北面", "東面", "南面", "西面"];
  const ox = 8.75, oy = 2.05, cw = 0.97, rh = 0.36;
  faces.forEach((f, j) => { R(s, ox + j * cw, oy, cw - 0.05, rh, C.navy); T(s, f, { x: ox + j * cw, y: oy, w: cw - 0.05, h: rh, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 }); });
  const fk = ["北", "東", "南", "西"];
  for (let b = 5; b >= 1; b--) {
    const y = oy + (6 - b) * (rh + 0.04);
    T(s, `帯${b}`, { x: 7.85, y, w: 0.8, h: rh, fontSize: 10, bold: true, color: C.navy, align: "right", valign: "middle" });
    fk.forEach((f, j) => {
      R(s, ox + j * cw, y, cw - 0.05, rh, j === 2 ? C.peach : C.panel);
      T(s, M(`Ŷ_{${f},${b}}`), { x: ox + j * cw, y, w: cw - 0.05, h: rh, fontSize: 10, color: C.navy, align: "center", valign: "middle", margin: 0 });
    });
  }
  T(s, M("面の平均：Ŷ_{f,平均} ＝ (1/5) Σ_{k=1}^{5} Ŷ_{f,k}　（f＝北・東・南・西）"), { x: 7.8, y: 4.5, w: 5.05, h: 0.3, fontSize: 10.5, bold: true, color: C.dorange });
  T(s, "中央の高さを変えると、帯の高さも変わる（高さを5等分）", { x: 7.8, y: 4.95, w: 5.05, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  table(s, [
    ["H_{C}", "25m", "50m", "75m", "100m"],
    ["1帯の高さ（H_{C}/5）", "5m", "10m", "15m", "20m"],
    ["出力数", "20", "20", "20", "20"],
  ], { x: 7.8, y: 5.3, w: 5.05, colW: [1.85, 0.8, 0.8, 0.8, 0.8], rowH: 0.3, fs: 10, math: true, boldCol0: true });
  T(s, "南1棟の段階では「南面×5帯＝5個」だった出力が、4面に増える。", { x: 7.8, y: 6.3, w: 5.05, h: 0.5, fontSize: 9.5, color: C.muted });
  s.addNotes("立体で見ると、中央建物の高さH_Cと、周囲建物の高さAの位置が分かります。隙間Dは地面上の壁と壁の距離です。出力は中央建物の北・東・南・西の4面をそれぞれ5帯に分けた20個です。中央の高さを変えた場合は、10m刻みではなく高さを5等分します。");
}

// =====================================================================
// P6: s が必要な理由（1枚）
// =====================================================================
{
  const s = std(next(), 6, "有無の変数 s が必要な理由：「建物がない」は A・D の数字では表せない", "s は「その方向に建物があるか」だけを表す 0/1 のスイッチ。s＝0 の建物は計算から自動的に外れる。");
  const cards = [
    { t: "a. 建物がある", col: C.green, bg: C.greenL, mark: "○ 計算できる", l1: "A ＝ 50 m", l2: "D ＝ 25 m", txt: "表（A 25〜100m・D 10〜100m）の中", lc: C.navy },
    { t: "b. 建物がない", col: C.red, bg: C.redL, mark: "× 入れる数字がない", l1: "A ＝ ？", l2: "D ＝ ？", txt: "高さも距離も存在しない → 空欄", lc: C.red },
    { t: "c. A＝0 で代用する", col: C.red, bg: C.redL, mark: "× 表の外（外挿）", l1: "A ＝ 0 m", l2: "D ＝ 25 m", txt: "表は A 25m から → 囲む4点がない", lc: C.red },
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 4.18, w = 3.98, y = 1.62, h = 2.4;
    R(s, x, y, w, h, C.panel, { round: true, rr: 0.06 });
    R(s, x, y, w, 0.42, c.col, { round: true, rr: 0.06 });
    T(s, c.t, { x: x + 0.15, y, w: w - 0.3, h: 0.42, fontSize: 12, bold: true, color: C.white, valign: "middle" });
    // 簡単な平面図
    const cx = x + 0.75, u = 0.42;
    R(s, cx - u / 2, y + 0.58, u, u, C.navy);
    if (i === 1) R(s, cx - u / 2, y + 1.22, u, u, C.white, { line: "B8C0CA", dash: "dash" });
    else R(s, cx - u / 2, y + 1.22, u, u, i === 2 ? "9CC3C7" : C.teal);
    T(s, "中央", { x: cx - u / 2, y: y + 0.58, w: u, h: u, fontSize: 7.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    T(s, i === 1 ? "なし" : "南", { x: cx - u / 2, y: y + 1.22, w: u, h: u, fontSize: 7.5, bold: true, color: i === 1 ? C.muted : C.white, align: "center", valign: "middle", margin: 0 });
    T(s, [{ text: "入力 ", options: { color: C.muted, fontSize: 9, breakLine: true } }, { text: c.l1, options: { breakLine: true } }, { text: c.l2, options: {} }], { x: x + 1.4, y: y + 0.55, w: 2.4, h: 1.05, fontSize: 14, bold: true, color: c.lc });
    T(s, c.txt, { x: x + 0.2, y: y + 1.7, w: w - 0.4, h: 0.25, fontSize: 9.5, color: C.text });
    T(s, c.mark, { x: x + 0.2, y: y + 1.98, w: w - 0.4, h: 0.3, fontSize: 11, bold: true, color: c.col });
  });
  // 下左：スイッチ
  R(s, 0.5, 4.2, 6.0, 2.7, C.panel, { round: true, rr: 0.06 });
  T(s, "そこで s を使う（入力の例）", { x: 0.65, y: 4.26, w: 5.7, h: 0.28, fontSize: 11.5, bold: true, color: C.navy });
  const rowsS = [["北", 0, "—", "—"], ["東", 1, "40 m", "20 m"], ["南", 1, "55.9 m", "14 m"], ["西", 0, "—", "—"]];
  ["方向", "s", "高さ A", "隙間 D", "計算に"].forEach((h, i) => T(s, h, { x: [0.7, 1.55, 2.85, 3.75, 4.75][i], y: 4.55, w: [0.6, 1.2, 0.85, 0.85, 1.5][i], h: 0.24, fontSize: 9, bold: true, color: C.muted, align: i ? "center" : "left" }));
  rowsS.forEach((r, j) => {
    const y = 4.82 + j * 0.5, on = r[1] === 1;
    R(s, 0.6, y, 5.8, 0.44, on ? C.white : "EEF0F3", { round: true, rr: 0.05 });
    T(s, r[0], { x: 0.7, y, w: 0.6, h: 0.44, fontSize: 12, bold: true, color: C.navy, valign: "middle" });
    const tx = 1.7, ty = y + 0.09;
    R(s, tx, ty, 0.6, 0.26, on ? C.green : C.faint, { round: true, rr: 0.13 });
    s.addShape(pres.shapes.OVAL, { x: on ? tx + 0.36 : tx + 0.02, y: ty + 0.02, w: 0.22, h: 0.22, fill: { color: C.white }, line: { type: "none" } });
    T(s, String(r[1]), { x: tx + 0.65, y, w: 0.3, h: 0.44, fontSize: 12, bold: true, color: on ? C.green : C.muted, valign: "middle" });
    T(s, r[2], { x: 2.85, y, w: 0.85, h: 0.44, fontSize: 10.5, bold: on, color: on ? C.navy : C.faint, align: "center", valign: "middle" });
    T(s, r[3], { x: 3.75, y, w: 0.85, h: 0.44, fontSize: 10.5, bold: on, color: on ? C.navy : C.faint, align: "center", valign: "middle" });
    T(s, on ? "入れる" : "入れない", { x: 4.75, y, w: 1.5, h: 0.44, fontSize: 10.5, bold: true, color: on ? C.green : C.muted, align: "center", valign: "middle" });
  });
  // 下右：式
  R(s, 6.75, 4.2, 6.1, 2.7, C.navy, { round: true, rr: 0.06 });
  T(s, "式の中では「s を掛ける」だけ", { x: 6.95, y: 4.27, w: 5.7, h: 0.28, fontSize: 11.5, bold: true, color: C.orange });
  T(s, M("予測 ＝ 建物なしの値 − Σ（s × その建物で減る量）"), { x: 6.95, y: 4.6, w: 5.8, h: 0.3, fontSize: 11, bold: true, color: C.white });
  T(s, [
    { text: "＝ 建物なし ", options: { color: C.white } },
    { text: "− 0×北 ", options: { color: "6F7F9C" } },
    { text: "− 1×東 − 1×南 ", options: { color: C.orange } },
    { text: "− 0×西", options: { color: "6F7F9C" } },
  ], { x: 6.95, y: 4.95, w: 5.8, h: 0.32, fontSize: 11.5, bold: true });
  T(s, "＝ 建物なし − 東で減る量 − 南で減る量。0 を掛けた項（灰色）は消えるので、無い建物は結果に影響しない。棟数も n ＝ s の合計 ＝ 0＋1＋1＋0 ＝ 2 と数えられる。", { x: 6.95, y: 5.35, w: 5.75, h: 0.65, fontSize: 9.5, color: "CADCFC" });
  R(s, 6.95, 6.05, 5.7, 0.72, C.navy2, { round: true, rr: 0.05 });
  T(s, "注意：s は 0 か 1 だけ（0.5 の建物はない）ので、s の方向には補間できない。有無の組み合わせ 2⁴＝16通りを別々に扱う。", { x: 7.05, y: 6.07, w: 5.5, h: 0.68, fontSize: 9.5, color: C.white, valign: "middle" });
  s.addNotes("ツールはAとDの数字から表を使って補間します。建物がないと入れる数字がありません。A=0で代用すると計算済みの表の範囲外になり、補間できません。そこで、有るか無いかだけを表す変数sを用意します。式の中では、各建物で減る量にsを掛けるだけで、s=0の建物は自動的に計算から外れます。ただしsは0か1だけなので、sの方向には補間できません。");
}

// =====================================================================
// 29: 4方向版
// =====================================================================
{
  const s = std(next(), 6, "まず考える対象：方位を北・東・南・西に固定した「4方向版」", "最終目標（17変数）へ一度に進まず、方位 θ と中央の高さを固定した場合で、線形補間に必要な計算量を見積もる。");
  // 平面図
  R(s, 0.5, 1.6, 4.9, 5.3, C.panel, { round: true, rr: 0.06 });
  T(s, "4方向版の平面図", { x: 0.65, y: 1.66, w: 4.5, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const cx = 2.95, cy = 4.25, u = 1.05;
  R(s, cx - u / 2, cy - u / 2, u, u, C.navy);
  T(s, [{ text: "中央 C", options: { bold: true, breakLine: true } }, { text: "50m・高さ50m", options: { fontSize: 7.5 } }], { x: cx - u / 2, y: cy - u / 2, w: u, h: u, fontSize: 9.5, color: C.white, align: "center", valign: "middle", margin: 0 });
  const dirs = [["北", 0, -1, "θ＝0°"], ["東", 1, 0, "θ＝90°"], ["南", 0, 1, "θ＝180°"], ["西", -1, 0, "θ＝270°"]];
  dirs.forEach(d => {
    const gap = 0.45;
    const bx = cx + d[1] * (u + gap) - u / 2, by = cy + d[2] * (u + gap) - u / 2;
    R(s, bx, by, u, u, C.teal);
    T(s, `${d[0]}の建物\n有無 s・高さ A`, { x: bx, y: by, w: u, h: u, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    // D矢印
    const x1 = cx + d[1] * u / 2, y1 = cy + d[2] * u / 2, x2 = cx + d[1] * (u / 2 + gap), y2 = cy + d[2] * (u / 2 + gap);
    const off = 0.25;
    line(s, x1 + (d[2] ? off : 0), y1 + (d[1] ? off : 0), x2 + (d[2] ? off : 0), y2 + (d[1] ? off : 0), { color: C.red, width: 1.25, begin: "triangle", end: "triangle" });
    T(s, M(`D_{${d[0]}}`), { x: (x1 + x2) / 2 + (d[2] ? off + 0.03 : -0.2), y: (y1 + y2) / 2 + (d[1] ? off + 0.02 : -0.13), w: 0.45, h: 0.25, fontSize: 9.5, bold: true, color: C.red });
  });
  T(s, "各方向に「0棟か1棟」。4方向＝必ず4棟ではない。方位は固定なので θ は変数にしない。", { x: 0.65, y: 6.35, w: 4.6, h: 0.5, fontSize: 9, color: C.muted });

  table(s, [
    ["項目", "第一段階（完成）", "4方向版（検討）", "最終目標"],
    ["周囲の棟数", "1棟", "0〜4棟", "0〜4棟"],
    ["置く方位", "南のみ", "北・東・南・西に固定", "任意（0〜360°）"],
    ["中央建物", "50m角・高さ50m", "50m角・高さ50m", "高さ 25〜100m"],
    ["変える変数", { t: "A, D（2個）", o: { bold: true } }, { t: "s, A, D × 4方向（12個）\n連続8＋有無4", o: { bold: true, color: C.dorange } }, { t: "中央高さ＋(s, A, D, θ)×4（17個）", o: { bold: true } }],
    ["出力", "南面 × 5帯 ＝ 5個", "4面 × 5帯 ＝ 20個", "4面 × 5帯 ＝ 20個"],
    ["予測方法", "線形補間（完成）", "線形補間の計算量を見積もる", "空の遮られ方（代案）"],
  ], { x: 5.65, y: 1.62, w: 7.2, colW: [1.3, 1.75, 2.15, 2.0], rowH: 0.45, fs: 10, boldCol0: true });

  box(s, 5.65, 4.95, 7.2, 1.95, "段階を分ける理由", null, { fill: C.peach, tcolor: C.dorange });
  T(s, bullets([
    "4方向版で線形補間に必要な配置数・計算時間を見積もれば、17変数に広げたときの見通しが立つ",
    "方位を固定すると、1方向ずつ見れば南と同じ「A・Dの2変数の格子」になり、南の方法の延長で考えられる",
    "4方向版でも負担が大きいと分かれば、17変数では別の方法（空の遮られ方）が必要だと言える",
  ], { gap: 3 }), { x: 5.8, y: 5.33, w: 6.9, h: 1.55, fontSize: 10 });
  s.addNotes("最終目標の17変数へ一度に進むのではなく、方位を北・東・南・西に固定し、中央の高さも50mに固定した4方向版で試します。変数は各方向のs、A、Dの12個です。4方向は4棟を必ず置くという意味ではなく、各方向に0か1棟です。");
}

// =====================================================================
// P7-1: なぜ6,561通りか
// =====================================================================
{
  const s = std(next(), 7, "なぜ4方向だと6,561通り？：各方向の選び方を掛け算するから");
  story(s, 0);
  R(s, 0.5, 1.7, 6.1, 5.2, C.panel, { round: true, rr: 0.06 });
  T(s, "組み合わせの数え方", { x: 0.65, y: 1.76, w: 5.8, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  const gx = 0.85, gy = 2.15, gs = 0.8;
  R(s, gx, gy, gs, gs, C.white, { line: "C9D0D8" });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) dot(s, gx + 0.15 + i * 0.25, gy + gs - 0.15 - j * 0.25, 0.11, C.navy, "RECTANGLE");
  T(s, [{ text: "1方向の選び方 ＝ ", options: { color: C.navy } }, { text: "9通り", options: { color: C.dorange } }], { x: 1.8, y: 2.1, w: 4.7, h: 0.32, fontSize: 13, bold: true });
  T(s, "高さ3通り（25・50・100m）× 距離3通り（10・25・100m）", { x: 1.8, y: 2.44, w: 4.75, h: 0.26, fontSize: 9, color: C.text });
  T(s, "南1棟で表を作ったときと同じ考え方", { x: 1.8, y: 2.7, w: 4.7, h: 0.26, fontSize: 9.5, color: C.muted });
  const chain = [[[1, 0, 0, 0], "北だけ", "9"], [[1, 1, 0, 0], "北＋東", "81"], [[1, 1, 1, 0], "北＋東＋南", "729"], [[1, 1, 1, 1], "4方向すべて", "6,561"]];
  chain.forEach((c, i) => {
    const x = 0.7 + i * 1.47, y = 3.15;
    R(s, x, y, 1.2, 1.35, C.white, { round: true, rr: 0.06, line: "DCE1E7" });
    miniPlan(s, x + 0.6, y + 0.36, 0.13, c[0], { gap: 0.035 });
    T(s, c[1], { x, y: y + 0.68, w: 1.2, h: 0.22, fontSize: 9, bold: true, color: C.navy, align: "center" });
    T(s, c[2], { x, y: y + 0.9, w: 1.2, h: 0.38, fontSize: 16, bold: true, color: i === 3 ? C.red : C.dorange, align: "center" });
    if (i < 3) T(s, "×9", { x: x + 1.19, y: y + 0.5, w: 0.3, h: 0.3, fontSize: 11, bold: true, color: C.navy, align: "center", margin: 0 });
  });
  T(s, "1方向増えるごとに9倍：9 → 81 → 729 → 6,561（＝9×9×9×9＝3⁸）", { x: 0.7, y: 4.57, w: 5.8, h: 0.26, fontSize: 10, bold: true, color: C.navy });
  T(s, "例：北（高さ50m・距離25m）＋東（25m・10m）＋南（100m・100m）＋西（50m・10m）で、やっと「1通り」", { x: 0.7, y: 4.86, w: 5.8, h: 0.48, fontSize: 9.5, color: C.text });
  R(s, 0.65, 5.42, 5.8, 1.35, C.peach, { round: true, rr: 0.06 });
  T(s, "たとえると：4桁の暗証番号", { x: 0.8, y: 5.47, w: 5.5, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, "各桁が0〜9の10通り → 10×10×10×10＝10,000通り。4方向＝4桁。各方向は「建物なし＋9通り＝10通り」なので、建物なしも含めると 10⁴＝10,000配置になる。", { x: 0.8, y: 5.77, w: 5.55, h: 0.95, fontSize: 9.5, color: C.text });

  T(s, "では、全部をSEBEで計算したら？", { x: 6.85, y: 1.72, w: 6, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  R(s, 6.85, 2.1, 6.0, 1.1, C.greenL, { round: true, rr: 0.06 });
  T(s, "○ できること", { x: 7.0, y: 2.15, w: 5.7, h: 0.28, fontSize: 11, bold: true, color: C.green });
  T(s, "南1棟と同じく、どこに入力しても周りに計算済みの点がそろうので、線形補間でツールが作れる（数学的には可能）", { x: 7.0, y: 2.45, w: 5.7, h: 0.7, fontSize: 10, color: C.text });
  R(s, 6.85, 3.35, 6.0, 2.05, C.redL, { round: true, rr: 0.06 });
  T(s, "× かかる手間（SEBE 1回 30秒〜1分）", { x: 7.0, y: 3.4, w: 5.7, h: 0.28, fontSize: 11, bold: true, color: C.red });
  T(s, [{ text: "6,561回 → ", options: { fontSize: 13, color: C.navy } }, { text: "約55〜109時間", options: { fontSize: 20, color: C.red } }], { x: 7.0, y: 3.68, w: 5.7, h: 0.5, bold: true, valign: "middle" });
  T(s, bullets([
    "休まず計算しても 約2.3〜4.6日",
    "建物なしも含めた10,000回なら 約83〜167時間（3.5〜6.9日）",
    "入力作成・保存・失敗時の再計算・検証配置は含まない",
  ], { gap: 2 }), { x: 7.0, y: 4.2, w: 5.7, h: 1.15, fontSize: 10 });
  R(s, 6.85, 5.55, 6.0, 1.35, C.navy, { round: true, rr: 0.06 });
  T(s, [
    { text: "4方向だけで、全部の組み合わせに数日かかる。", options: { color: C.white, bold: true, breakLine: true } },
    { text: "→ 次のページから、線形補間でツールを作る場合の計算を具体的に見る", options: { color: C.orange, bold: true } },
  ], { x: 7.0, y: 5.6, w: 5.7, h: 1.25, fontSize: 10.5, valign: "middle" });
  s.addNotes("");
}

// =====================================================================
// P7-2: 線形補間で4方向ツールを作る場合の計算イメージ（図で段階的に）
// =====================================================================
{
  const s = std(next(), 7, "補間の考え方と、建物なしも数えると1万通りになる理由");
  story(s, 1);
  // 上段：1変数→2変数→3変数→8変数
  const panels = [
    { t: "1変数（高さAだけ）", n: "2点", rule: "下側×0.6 ＋ 上側×0.4", sub: "t＝0.4 なら (1−t) と t" },
    { t: "2変数（南1棟：A・D）", n: "4隅", rule: "隅の重み＝2つの割合の掛け算", sub: "今回のツール（p.22）" },
    { t: "3変数", n: "8隅", rule: "隅の重み＝3つの割合の掛け算", sub: "立方体の角" },
    { t: "8変数（4棟：A・D×4）", n: "2⁸＝256点", rule: "点の重み＝8つの割合の掛け算", sub: "2×2×…×2（8回）：図に描けない" },
  ];
  panels.forEach((p, i) => {
    const x = 0.5 + i * 3.1, w = 2.95, y = 1.68;
    R(s, x, y, w, 2.72, i === 3 ? C.peach : C.panel, { round: true, rr: 0.06 });
    T(s, p.t, { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: 0.28, fontSize: 10.5, bold: true, color: C.navy, align: "center" });
    T(s, p.n, { x: x + 0.1, y: y + 1.62, w: w - 0.2, h: 0.36, fontSize: 16, bold: true, color: i === 3 ? C.red : C.dorange, align: "center" });
    T(s, p.rule, { x: x + 0.1, y: y + 1.98, w: w - 0.2, h: 0.26, fontSize: 9.5, bold: true, color: C.navy, align: "center" });
    T(s, p.sub, { x: x + 0.1, y: y + 2.24, w: w - 0.2, h: 0.24, fontSize: 9, color: C.muted, align: "center" });
    if (i < 3) T(s, "×2", { x: x + w - 0.05, y: y + 0.85, w: 0.25, h: 0.3, fontSize: 10, bold: true, color: C.orange, align: "center", margin: 0 });
  });
  // 1変数：線分
  {
    const x0 = 0.95, x1 = 3.0, y = 2.65;
    line(s, x0, y, x1, y, { color: C.faint, width: 2 });
    dot(s, x0, y, 0.2, C.navy, "RECTANGLE"); dot(s, x1, y, 0.2, C.navy, "RECTANGLE");
    const xs = x0 + 0.4 * (x1 - x0);
    dot(s, xs, y, 0.24, C.red, "STAR_5_POINT");
    T(s, "下側 L", { x: x0 - 0.4, y: y + 0.14, w: 0.8, h: 0.22, fontSize: 8.5, color: C.muted, align: "center" });
    T(s, "上側 U", { x: x1 - 0.4, y: y + 0.14, w: 0.8, h: 0.22, fontSize: 8.5, color: C.muted, align: "center" });
    T(s, "0.6", { x: x0 - 0.3, y: y - 0.42, w: 0.6, h: 0.24, fontSize: 11, bold: true, color: C.dorange, align: "center" });
    T(s, "0.4", { x: x1 - 0.3, y: y - 0.42, w: 0.6, h: 0.24, fontSize: 11, bold: true, color: C.dorange, align: "center" });
    T(s, "入力（t＝0.4）", { x: xs - 0.6, y: y + 0.14, w: 1.2, h: 0.22, fontSize: 8.5, bold: true, color: C.red, align: "center" });
    T(s, "近い方を多く使う", { x: 0.6, y: 3.0, w: 2.75, h: 0.22, fontSize: 8.5, color: C.muted, align: "center" });
  }
  // 2変数：正方形
  {
    const cx = 5.07, cy = 2.62, a = 0.9;
    R(s, cx - a / 2, cy - a / 2, a, a, C.white, { line: C.faint, lw: 1 });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => dot(s, cx + q[0] * a / 2, cy + q[1] * a / 2, 0.18, C.orange, "RECTANGLE"));
    dot(s, cx - 0.12, cy + 0.12, 0.22, C.red, "STAR_5_POINT");
    T(s, "A", { x: cx - a / 2 - 0.35, y: cy - 0.12, w: 0.25, h: 0.24, fontSize: 9, color: C.muted });
    T(s, "D →", { x: cx - 0.25, y: cy - a / 2 - 0.27, w: 0.5, h: 0.22, fontSize: 9, color: C.muted, align: "center" });
  }
  // 3変数：立方体
  {
    const ox = 7.8, oy = 3.15, a = 0.8, dx = 0.35, dy = 0.3;
    const P = (i, j, k) => [ox + i * a + k * dx, oy - j * a - k * dy];
    [[0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 1, 0], [1, 0, 0, 1, 0, 1], [0, 1, 0, 1, 1, 0], [0, 1, 0, 0, 1, 1], [0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1], [1, 0, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1]].forEach(e => { const p = P(e[0], e[1], e[2]), q = P(e[3], e[4], e[5]); line(s, p[0], p[1], q[0], q[1], { color: C.faint, width: 1 }); });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) { const p = P(i, j, k); dot(s, p[0], p[1], 0.16, C.orange, "RECTANGLE"); }
    const st = P(0.45, 0.4, 0.5); dot(s, st[0], st[1], 0.22, C.red, "STAR_5_POINT");
  }
  // 8変数：256マス
  {
    const gx = 10.55, gy = 2.05, cs = 0.075;
    for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) R(s, gx + c * cs, gy + r * cs, cs - 0.012, cs - 0.012, (r + c) % 5 === 0 ? "EEA870" : "F2BE92");
  }

  // 下段：建物なしも数えると10,000通りになる理由
  R(s, 0.5, 4.55, 6.3, 2.35, C.white, { round: true, rr: 0.06, line: "DCE1E7" });
  T(s, "建物なしも数えると、1方向の選び方は10通り", { x: 0.65, y: 4.6, w: 6.0, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  // なし
  R(s, 0.75, 5.05, 0.75, 0.75, C.white, { line: C.faint, dash: "dash", lw: 1 });
  T(s, "なし\ns＝0", { x: 0.75, y: 5.05, w: 0.75, h: 0.75, fontSize: 9, bold: true, color: C.muted, align: "center", valign: "middle", margin: 0 });
  T(s, "1通り", { x: 0.7, y: 5.85, w: 0.85, h: 0.24, fontSize: 9.5, bold: true, color: C.navy, align: "center" });
  T(s, "＋", { x: 1.55, y: 5.25, w: 0.35, h: 0.35, fontSize: 16, bold: true, color: C.navy, align: "center", margin: 0 });
  // あり 3×3
  const hs = ["25", "50", "100"], ds = ["10", "25", "100"];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const x = 2.35 + j * 0.34, y = 4.98 + (2 - i) * 0.3;
    R(s, x, y, 0.3, 0.26, C.teal);
  }
  hs.forEach((h, i) => T(s, h, { x: 1.9, y: 4.98 + (2 - i) * 0.3, w: 0.42, h: 0.26, fontSize: 8, color: C.muted, align: "right", valign: "middle", margin: 0 }));
  ds.forEach((d, j) => T(s, d, { x: 2.35 + j * 0.34, y: 5.88, w: 0.3, h: 0.2, fontSize: 8, color: C.muted, align: "center", margin: 0 }));
  T(s, "高さA↑ 隙間D→", { x: 1.9, y: 6.08, w: 1.6, h: 0.2, fontSize: 7.5, color: C.muted });
  T(s, "あり 9通り", { x: 3.35, y: 5.2, w: 0.9, h: 0.4, fontSize: 9.5, bold: true, color: C.teal, align: "center", valign: "middle", margin: 0 });
  T(s, "＝ 10通り", { x: 4.2, y: 5.2, w: 1.2, h: 0.4, fontSize: 14, bold: true, color: C.dorange, valign: "middle" });
  R(s, 0.7, 6.32, 5.9, 0.48, C.peach, { round: true, rr: 0.05 });
  T(s, "北10 × 東10 × 南10 × 西10 ＝ 10,000配置（4桁の暗証番号と同じ）", { x: 0.8, y: 6.32, w: 5.7, h: 0.48, fontSize: 10.5, bold: true, color: C.dorange, valign: "middle" });

  T(s, "10,000配置の内訳（棟数ごと）", { x: 7.0, y: 4.55, w: 5.8, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  table(s, [
    ["置く棟数", "方向の選び方", "高さ・距離の選び方", "配置数"],
    ["0棟", "1通り", "—", "1"],
    ["1棟", "4通り", "9", "4×9＝36"],
    ["2棟", "6通り", "9×9", "6×81＝486"],
    ["3棟", "4通り", "9×9×9", "4×729＝2,916"],
    [{ t: "4棟", o: { bold: true, color: C.red } }, "1通り", "9⁴", { t: "6,561", o: { bold: true, color: C.red } }],
    [{ t: "合計", o: { bold: true } }, "16通り（有無の組）", "", { t: "10,000", o: { bold: true, color: C.dorange } }],
  ], { x: 7.0, y: 4.88, w: 5.85, colW: [1.1, 1.65, 1.6, 1.5], rowH: 0.28, fs: 9.5, boldCol0: true });
  s.addNotes("");
}

// =====================================================================
// P7-2b: 具体例①：建物ごとに「隅」を探す
// =====================================================================
{
  const s = std(next(), 7, "具体例①：南と東の建物それぞれで、入力を囲む「4つの隅」を探す");
  story(s, 2);
  // 左：入力の配置
  R(s, 0.5, 1.7, 3.9, 5.2, C.panel, { round: true, rr: 0.06 });
  T(s, "入力（知りたい配置）", { x: 0.65, y: 1.75, w: 3.6, h: 0.26, fontSize: 10.5, bold: true, color: C.navy });
  const pk = 0.0105, pcx = 2.3, pcy = 3.0;
  const PP = (x, y) => [pcx + x * pk, pcy - y * pk];
  const bx = (x0, x1, y0, y1, fill, dash) => { const a = PP(x0, y1); if (dash) R(s, a[0], a[1], (x1 - x0) * pk, (y1 - y0) * pk, C.white, { line: C.faint, dash: "dash" }); else R(s, a[0], a[1], (x1 - x0) * pk, (y1 - y0) * pk, fill); };
  bx(-25, 25, -25, 25, C.navy);
  bx(-25, 25, -90, -40, C.teal);
  bx(45, 95, -25, 25, C.orange);
  bx(-25, 25, 40, 90, null, true);
  bx(-90, -40, -25, 25, null, true);
  const swp = PP(-25, -25); R(s, swp[0], swp[1] - 0.035, 50 * pk, 0.07, C.red);
  T(s, "中央", { x: PP(-25, 25)[0], y: PP(-25, 25)[1], w: 50 * pk, h: 50 * pk, fontSize: 8, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, "南\n35m\n15m", { x: PP(-25, -40)[0], y: PP(-25, -40)[1], w: 50 * pk, h: 50 * pk, fontSize: 7, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, "東\n40m\n20m", { x: PP(45, 25)[0], y: PP(45, 25)[1], w: 50 * pk, h: 50 * pk, fontSize: 7, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, "北：なし", { x: PP(25, 90)[0] + 0.05, y: PP(25, 90)[1] + 0.12, w: 0.9, h: 0.22, fontSize: 8, color: C.muted });
  T(s, "西：なし", { x: PP(-90, 25)[0], y: PP(-90, 25)[1] - 0.25, w: 0.9, h: 0.22, fontSize: 8, color: C.muted });
  T(s, "━ 計算する壁：南面・帯1", { x: 0.65, y: 4.05, w: 3.6, h: 0.24, fontSize: 9, bold: true, color: C.red });
  // 立体
  const k = 0.017, X0 = 2.45, Y0 = 5.85;
  const Pj = (x, y, z) => [X0 + k * (x + y) * 0.7071, Y0 + k * (-z * 0.95 + (x - y) * 0.3536)];
  poly(s, [Pj(-25, -25, 50), Pj(25, -25, 50), Pj(25, 25, 50), Pj(-25, 25, 50)], { fill: "4A5F85", line: C.white, lw: 0.5 });
  for (let b = 0; b < 5; b++) {
    poly(s, [Pj(-25, -25, b * 10), Pj(25, -25, b * 10), Pj(25, -25, b * 10 + 10), Pj(-25, -25, b * 10 + 10)], { fill: b === 0 ? C.red : "B8C3D6", line: C.white, lw: 0.75 });
    poly(s, [Pj(25, -25, b * 10), Pj(25, 25, b * 10), Pj(25, 25, b * 10 + 10), Pj(25, -25, b * 10 + 10)], { fill: "8FA0BC", line: C.white, lw: 0.75 });
  }
  [[[-25, -90, 35], [25, -90, 35], [25, -40, 35], [-25, -40, 35]], [[-25, -90, 0], [25, -90, 0], [25, -90, 35], [-25, -90, 35]], [[25, -90, 0], [25, -40, 0], [25, -40, 35], [25, -90, 35]]].forEach(f => poly(s, f.map(p => Pj(...p)), { fill: C.teal, tr: 70, line: C.teal, lw: 1 }));
  [[[45, -25, 40], [95, -25, 40], [95, 25, 40], [45, 25, 40]], [[45, -25, 0], [95, -25, 0], [95, -25, 40], [45, -25, 40]], [[95, -25, 0], [95, 25, 0], [95, 25, 40], [95, -25, 40]]].forEach((f, i) => poly(s, f.map(p => Pj(...p)), { fill: ["F2C49B", "E8934D", "C56A2C"][i], line: C.white, lw: 0.5 }));
  const lb = Pj(-25, -25, 5);
  T(s, "南面・帯1", { x: 0.6, y: lb[1] - 0.85, w: 1.0, h: 0.22, fontSize: 8.5, bold: true, color: C.red });
  line(s, 1.2, lb[1] - 0.63, lb[0] + 0.1, lb[1] - 0.05, { color: C.red, width: 0.75 });
  T(s, "南の建物は透かして表示", { x: 0.65, y: 6.62, w: 3.6, h: 0.22, fontSize: 8, color: C.muted });

  // 右：建物ごとの隅
  const panel = (x, name, col, colL, inA, inD, tA, tD, ws, side) => {
    const w = 4.05;
    R(s, x, 1.7, w, 4.55, colL, { round: true, rr: 0.06 });
    R(s, x, 1.7, w, 0.4, col, { round: true, rr: 0.06 });
    T(s, `${name}の建物　入力：高さ${inA}m・隙間${inD}m`, { x: x + 0.12, y: 1.7, w: w - 0.24, h: 0.4, fontSize: 11, bold: true, color: C.white, valign: "middle" });
    // 格子（横：隙間D，縦：高さA）
    const gx = x + 1.1, gy = 2.4, gs = 1.55;
    R(s, gx, gy, gs, gs, C.white, { line: "C9D0D8" });
    const cor = [[0, 0, "(25,10)", ws[0]], [1, 0, "(25,25)", ws[1]], [0, 1, "(50,10)", ws[2]], [1, 1, "(50,25)", ws[3]]]; // [dIdx, aIdx]
    cor.forEach(c => {
      const cx = gx + c[0] * gs, cy = gy + gs - c[1] * gs;
      dot(s, cx, cy, 0.2, col, "RECTANGLE");
      const lx = c[0] ? cx + 0.12 : cx - 1.02, ly = c[1] ? cy - 0.3 : cy - 0.02;
      T(s, [{ text: c[2], options: { bold: true, color: C.navy, breakLine: true } }, { text: "重み " + c[3], options: { bold: true, color: C.dorange } }], { x: lx, y: ly, w: 0.9, h: 0.4, fontSize: 8.5, align: c[0] ? "left" : "right", margin: 0 });
    });
    const sx = gx + tD * gs, sy = gy + gs - tA * gs;
    line(s, sx, sy, sx, gy + gs, { color: C.red, width: 0.75, dash: "dash" });
    line(s, gx, sy, sx, sy, { color: C.red, width: 0.75, dash: "dash" });
    dot(s, sx, sy, 0.26, C.red, "STAR_5_POINT");
    T(s, "入力", { x: sx - 0.3, y: sy - 0.36, w: 0.6, h: 0.2, fontSize: 8.5, bold: true, color: C.red, align: "center" });
    T(s, "隙間 D →", { x: gx, y: gy + gs + 0.25, w: gs, h: 0.2, fontSize: 8, color: C.muted, align: "center" });
    T(s, "高さ A ↑", { x: gx - 0.95, y: gy + gs / 2 - 0.1, w: 0.8, h: 0.2, fontSize: 8, color: C.muted, align: "right" });
    T(s, `高さの位置 ${tA === 0.4 ? "0.4" : "0.6"}，隙間の位置 ${tD < 0.5 ? "1/3" : "2/3"}`, { x: x + 0.12, y: 4.45, w: w - 0.24, h: 0.22, fontSize: 8.5, color: C.text, align: "center" });
    // 4つの隅を横から見た図
    T(s, "4つの隅は、それぞれこんな配置（横から見た図）", { x: x + 0.12, y: 4.7, w: w - 0.24, h: 0.22, fontSize: 8.5, bold: true, color: C.navy });
    cor.forEach((c, i) => {
      const ix = x + 0.12 + i * 0.97, iy = 4.95;
      R(s, ix, iy, 0.9, 1.22, C.white, { round: true, rr: 0.04 });
      const A = c[1] ? 50 : 25, D = c[0] ? 25 : 10, v = 0.011, g = 0.012, bw = 0.24, base = iy + 0.72;
      line(s, ix + 0.03, base, ix + 0.87, base, { color: C.muted, width: 0.5 });
      const nx = side === "L" ? ix + 0.06 : ix + 0.06 + bw + D * g;
      const cxb = side === "L" ? ix + 0.06 + bw + D * g : ix + 0.06;
      R(s, cxb, base - 50 * v, bw, 50 * v, C.navy);
      R(s, nx, base - A * v, bw, A * v, col);
      T(s, [{ text: c[2], options: { bold: true, color: C.navy, breakLine: true } }, { text: "重み " + c[3], options: { bold: true, color: C.dorange } }], { x: ix, y: base + 0.02, w: 0.9, h: 0.46, fontSize: 8, align: "center", margin: 0 });
    });
  };
  panel(4.6, "南", C.teal, "E6F0F1", 35, 15, 0.4, 1 / 3, ["0.400", "0.200", "0.267", "0.133"], "L");
  panel(8.8, "東", C.orange, "FBEFE3", 40, 20, 0.6, 2 / 3, ["0.133", "0.267", "0.200", "0.400"], "R");
  R(s, 4.6, 6.38, 8.25, 0.52, C.navy, { round: true, rr: 0.05 });
  T(s, [
    { text: "隅＝入力を囲む「計算済みの条件（高さ, 隙間）」。", options: { color: C.white, bold: true } },
    { text: "重み＝高さの割合×隙間の割合（近い隅ほど大きい）。南4つ×東4つ → 16マス（次のページ）", options: { color: C.orange, bold: true } },
  ], { x: 4.72, y: 6.38, w: 8.05, h: 0.52, fontSize: 9.5, valign: "middle" });
  s.addNotes("");
}

// =====================================================================
// P7-2c: 具体例②：1マス＝南の隅と東の隅を同時に置いた配置
// =====================================================================
{
  const s = std(next(), 7, "具体例②：16マスの1つ1つが「南と東を同時に置いた配置」");
  story(s, 3);
  const sw4 = [["(25,10)", 0.4], ["(25,25)", 0.2], ["(50,10)", 0.2667], ["(50,25)", 0.1333]];
  const ew4 = [["(25,10)", 0.1333], ["(25,25)", 0.2667], ["(50,10)", 0.2], ["(50,25)", 0.4]];
  const mx = 0.5, my = 2.5, c0 = 1.55, cw = 1.3, rh = 0.46;
  T(s, "東の建物の隅（前のページ右の4つ）→", { x: mx + c0, y: 1.68, w: cw * 4, h: 0.26, fontSize: 10, bold: true, color: C.orange, align: "center" });
  T(s, "南の建物の隅\n（前のページ左）↓", { x: mx, y: 1.9, w: c0, h: 0.56, fontSize: 9, bold: true, color: C.teal, align: "center", valign: "middle" });
  ew4.forEach((e, j) => {
    const x = mx + c0 + j * cw;
    R(s, x, 1.96, cw - 0.04, 0.5, C.orange);
    T(s, [{ text: e[0], options: { breakLine: true } }, { text: "重み " + e[1].toFixed(3), options: { fontSize: 8.5 } }], { x, y: 1.96, w: cw - 0.04, h: 0.5, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  });
  sw4.forEach((r, i) => {
    const y = my + i * (rh + 0.04);
    R(s, mx, y, c0 - 0.04, rh, C.teal);
    T(s, [{ text: r[0], options: { breakLine: true } }, { text: "重み " + r[1].toFixed(3), options: { fontSize: 8.5 } }], { x: mx, y, w: c0 - 0.04, h: rh, fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    ew4.forEach((e, j) => {
      const wv = r[1] * e[1], hi = i === 0 && j === 3, x = mx + c0 + j * cw;
      R(s, x, y, cw - 0.04, rh, hi ? C.peach : (wv > 0.07 ? "F6E3D2" : C.panel), { line: hi ? C.red : undefined, lw: 2 });
      T(s, wv.toFixed(3), { x, y, w: cw - 0.04, h: rh, fontSize: 12, bold: hi, color: hi ? C.red : C.navy, align: "center", valign: "middle", margin: 0 });
    });
  });
  T(s, "各マス＝南の重み × 東の重み（16マスの合計＝1）", { x: mx, y: 4.5, w: c0 + cw * 4, h: 0.26, fontSize: 9.5, color: C.muted, align: "center" });
  // 赤いマスから右の図へ矢印
  const cellR = mx + c0 + 4 * cw - 0.04, cellY = my + rh / 2;
  line(s, cellR, cellY, 7.95, cellY, { color: C.red, width: 2, end: "triangle" });

  // 右：赤いマスの配置
  R(s, 8.0, 1.7, 4.85, 3.0, C.redL, { round: true, rr: 0.06 });
  T(s, "赤いマス ＝ この配置", { x: 8.15, y: 1.75, w: 4.6, h: 0.28, fontSize: 11.5, bold: true, color: C.red });
  const pk = 0.013, pcx = 9.1, pcy = 2.75;
  const PP = (x, y) => [pcx + x * pk, pcy - y * pk];
  const bx = (x0, x1, y0, y1, fill, dash) => { const a = PP(x0, y1); if (dash) R(s, a[0], a[1], (x1 - x0) * pk, (y1 - y0) * pk, C.white, { line: C.faint, dash: "dash" }); else R(s, a[0], a[1], (x1 - x0) * pk, (y1 - y0) * pk, fill); };
  bx(-25, 25, -25, 25, C.navy);
  bx(-25, 25, -85, -35, C.teal);   // 南：高さ25・隙間10
  bx(50, 100, -25, 25, C.orange);  // 東：高さ50・隙間25
  const swp = PP(-25, -25); R(s, swp[0], swp[1] - 0.035, 50 * pk, 0.07, C.red);
  T(s, "中央", { x: PP(-25, 25)[0], y: PP(-25, 25)[1], w: 50 * pk, h: 50 * pk, fontSize: 8, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, "南\n25m\n10m", { x: PP(-25, -35)[0], y: PP(-25, -35)[1], w: 50 * pk, h: 50 * pk, fontSize: 7, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, "東\n50m\n25m", { x: PP(50, 25)[0], y: PP(50, 25)[1], w: 50 * pk, h: 50 * pk, fontSize: 7, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  T(s, [
    { text: "南：高さ25m・隙間10m", options: { color: C.teal, bold: true, breakLine: true } },
    { text: "東：高さ50m・隙間25m", options: { color: C.dorange, bold: true, breakLine: true } },
    { text: "を同時に置いた配置", options: { color: C.navy, breakLine: true } },
    { text: "→ SEBEで計算済み", options: { color: C.navy, bold: true } },
  ], { x: 10.55, y: 2.25, w: 2.25, h: 1.2, fontSize: 9.5 });
  T(s, "━ 南面・帯1 の値 y を使う", { x: 10.55, y: 3.5, w: 2.25, h: 0.24, fontSize: 9, bold: true, color: C.red });
  R(s, 8.15, 3.95, 4.55, 0.62, C.white, { round: true, rr: 0.05 });
  T(s, [
    { text: "重み：0.400 × 0.400 ＝ 0.160", options: { color: C.navy, bold: true, breakLine: true } },
    { text: "寄与：0.160 × 600（y は仮）＝ 96", options: { color: C.red, bold: true } },
  ], { x: 8.25, y: 3.95, w: 4.4, h: 0.62, fontSize: 10, valign: "middle" });

  // 下：式
  R(s, 0.5, 4.85, 12.35, 2.05, C.navy, { round: true, rr: 0.06 });
  T(s, "南面・帯1の予測 ＝ 16マスの「重み × そのマスの配置の保存値 y」を全部足す", { x: 0.7, y: 4.9, w: 12, h: 0.3, fontSize: 11.5, bold: true, color: C.orange });
  T(s, [
    ...M("ŷ_{南面,1} ＝ ", { color: C.white }),
    ...M("Σ_{b∈｛0,1｝⁴}", { color: "F2A65A" }),
    ...M(" [ Π_{i=1}^{4} q_{i}(b_{i}) ] ", { color: "7FD1C7" }),
    ...M("× y_{b}", { color: "F2D16B" }),
    ...M("　＝ 0.053×y_{1} ＋ 0.107×y_{2} ＋ 0.080×y_{3} ＋ … ＋ 0.053×y_{16}", { color: C.white }),
  ], { x: 0.7, y: 5.25, w: 12, h: 0.45, fontSize: 13, bold: true, valign: "middle" });
  const chips = [["F2A65A", "Σ", "16マスを全部足す"], ["7FD1C7", "Π q", "そのマスの重み（南と東の割合の掛け算）"], ["F2D16B", "y", "そのマスの配置のSEBE値"]];
  chips.forEach((c, i) => {
    const x = 0.7 + i * 4.1;
    R(s, x, 5.82, 0.6, 0.3, c[0], { round: true, rr: 0.05 });
    T(s, c[1], { x, y: 5.82, w: 0.6, h: 0.3, fontSize: 10, bold: true, color: C.navy, align: "center", valign: "middle", margin: 0 });
    T(s, c[2], { x: x + 0.68, y: 5.82, w: 3.35, h: 0.3, fontSize: 9.5, color: C.white, valign: "middle" });
  });
  T(s, "重みは20個の出力（4面×5帯）で共通。面・帯が変わると y だけが変わる。4棟あると 4×4×4×4＝256マス（次のページ）", { x: 0.7, y: 6.3, w: 12, h: 0.5, fontSize: 10, color: "CADCFC", valign: "middle" });
  s.addNotes("");
}

// =====================================================================
// P7-3: 具体例（256配置）
// =====================================================================
{
  const s = std(next(), 7, "4棟なら：4方向すべて高さ35m・隙間15mで、256配置を平均する");
  story(s, 4);
  // 左：t と 1方向の重み
  R(s, 0.5, 1.7, 5.9, 5.2, C.panel, { round: true, rr: 0.06 });
  T(s, "1方向あたりの計算（説明用の格子）", { x: 0.65, y: 1.76, w: 5.6, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  table(s, [
    ["条件", "下側 L", "入力 x", "上側 U", "位置 t"],
    ["高さ A", "25 m", "35 m", "50 m", { t: "0.4", o: { bold: true, color: C.dorange } }],
    ["隙間 D", "10 m", "15 m", "25 m", { t: "1/3", o: { bold: true, color: C.dorange } }],
  ], { x: 0.65, y: 2.1, w: 5.6, colW: [1.2, 1.1, 1.1, 1.1, 1.1], rowH: 0.32, fs: 10, boldCol0: true });
  T(s, ML([
    "t_{A} ＝ (35 − 25) ÷ (50 − 25) ＝ 0.4",
    "t_{D} ＝ (15 − 10) ÷ (25 − 10) ＝ 1/3",
  ]), { x: 0.65, y: 3.12, w: 5.6, h: 0.5, fontSize: 10.5, bold: true, color: C.navy });
  table(s, [
    ["隅（高さ, 隙間）", "計算", "重み"],
    ["(25, 10)", "(1−0.4) × (1−1/3) ＝ 0.6 × 2/3", { t: "0.400", o: { bold: true, color: C.dorange, fill: { color: C.peach } } }],
    ["(25, 25)", "0.6 × 1/3", { t: "0.200", o: { bold: true } }],
    ["(50, 10)", "0.4 × 2/3", { t: "0.267", o: { bold: true } }],
    ["(50, 25)", "0.4 × 1/3", { t: "0.133", o: { bold: true } }],
    [{ t: "合計", o: { bold: true } }, "", { t: "1", o: { bold: true } }],
  ], { x: 0.65, y: 3.72, w: 5.6, colW: [1.5, 3.1, 1.0], rowH: 0.3, fs: 10, boldCol0: true });
  T(s, "1方向で4通りの隅があり、4方向それぞれが4通りを選ぶ → 4 × 4 × 4 × 4 ＝ 256配置", { x: 0.65, y: 5.65, w: 5.6, h: 0.5, fontSize: 10, bold: true, color: C.teal });
  T(s, "格子の値（25・50m，10・25m）は説明用。実際は計算済みの格子の値を使う", { x: 0.65, y: 6.3, w: 5.6, h: 0.45, fontSize: 9, color: C.muted });

  // 右：256マスの図
  T(s, "256配置の重み（行：北×東の16通り，列：南×西の16通り）", { x: 6.65, y: 1.72, w: 6.2, h: 0.3, fontSize: 11, bold: true, color: C.navy });
  const w1 = [0.4, 0.2, 0.2667, 0.1333];
  const gx = 7.15, gy = 2.1, cs = 0.165;
  for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) {
    const wt = w1[r >> 2] * w1[r & 3] * w1[c >> 2] * w1[c & 3];
    const lv = Math.min(1, wt / 0.0256);
    const col = lv > 0.66 ? "D77B35" : lv > 0.33 ? "EEA870" : lv > 0.12 ? "F6D2B4" : "FBEBDA";
    R(s, gx + c * cs, gy + r * cs, cs - 0.02, cs - 0.02, r === 0 && c === 0 ? C.red : col);
  }
  T(s, "北東の組 →", { x: 6.65, y: gy + 7 * cs, w: 0.5, h: 0.6, fontSize: 8, color: C.muted });
  T(s, "濃い色ほど重みが大きい（入力に近い配置）", { x: gx, y: gy + 16 * cs + 0.03, w: 16 * cs, h: 0.22, fontSize: 8.5, color: C.muted, align: "center" });
  // 例の計算
  R(s, 10.0, 2.1, 2.85, 2.63, C.navy, { round: true, rr: 0.06 });
  T(s, "赤いマス：4方向すべて (25,10)", { x: 10.1, y: 2.15, w: 2.65, h: 0.45, fontSize: 9.5, bold: true, color: C.orange });
  T(s, ML([
    ["重み ＝ 0.4×0.4×0.4×0.4", { color: C.white }],
    ["　　 ＝ 0.4⁴ ＝ 0.0256", { color: C.orange }],
    ["保存値（南面0〜10m）", { color: "CADCFC", fontSize: 9, bold: false }],
    ["＝ 600 kWh/m²（仮）", { color: C.white }],
    ["寄与 ＝ 0.0256 × 600", { color: C.white }],
    ["　　 ＝ 15.36 kWh/m²", { color: C.orange }],
  ]), { x: 10.1, y: 2.6, w: 2.7, h: 2.05, fontSize: 10, bold: true, lineSpacingMultiple: 1.15 });

  R(s, 6.65, 5.0, 6.2, 1.9, C.peach, { round: true, rr: 0.06 });
  T(s, "予測値の出し方", { x: 6.8, y: 5.05, w: 5.9, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, bullets([
    "残り255配置も「重み × 保存値」を求め、256個を全部足すと南面0〜10m帯の予測になる（重みの合計は (0.4＋0.2＋0.267＋0.133)⁴ ＝ 1）",
    "保存値は4棟を同時に置いた配置のSEBE結果なので、影の重なりも含まれる",
    "ただし 256個すべてが計算済みでないと使えない → 表全体をそろえる必要がある",
  ], { gap: 3 }), { x: 6.8, y: 5.35, w: 5.95, h: 1.5, fontSize: 9.5 });
  s.addNotes("");
}

// =====================================================================
// P7-4: 計算時間の見積もり
// =====================================================================
{
  const s = std(next(), 7, "計算時間：1回30秒〜1分でも、全組み合わせは現実的でない");
  story(s, 5);
  T(s, "全組み合わせをSEBEで事前計算する場合（1配置ずつ連続で実行）", { x: 0.5, y: 1.7, w: 12, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  const em = { bold: true, color: C.red };
  table(s, [
    ["計算対象", "各方向の条件", "配置数", "30秒／配置", "1分／配置"],
    ["南1棟（各3段階）", "9", "9", "4.5分", "9分"],
    ["4棟あり（各3段階）", "9", "9⁴＝6,561", "約55時間（2.3日）", "約109時間（4.6日）"],
    ["0〜4棟（各3段階）", "なし1＋9＝10", "10⁴＝10,000", "約83時間（3.5日）", "約167時間（6.9日）"],
    ["0〜4棟（各4段階）", "なし1＋16＝17", "17⁴＝83,521", "約29日", "約58日"],
    [{ t: "最終目標17変数（各3段階）", o: { bold: true, color: C.red } }, "なし1＋27＝28，中央高さ4", { t: "28⁴×4 ≒ 246万", o: em }, { t: "約2.3年", o: em }, { t: "約4.7年", o: em }],
  ], { x: 0.5, y: 2.05, w: 12.35, colW: [2.75, 2.5, 2.3, 2.4, 2.4], rowH: 0.38, fs: 10, boldCol0: true });

  // 棒グラフ（1分／配置，対数目盛）
  R(s, 0.5, 4.68, 7.2, 2.22, C.panel, { round: true, rr: 0.06 });
  T(s, "1分／配置のときの計算時間（棒は対数目盛）", { x: 0.65, y: 4.72, w: 6.9, h: 0.26, fontSize: 10, bold: true, color: C.navy });
  const bars = [["南1棟", 9, "9分"], ["4棟あり", 6561, "4.6日"], ["0〜4棟 3段階", 10000, "6.9日"], ["0〜4棟 4段階", 83521, "58日"], ["17変数", 2458624, "4.7年"]];
  const lmax = Math.log10(2458624);
  bars.forEach((b, i) => {
    const y = 5.02 + i * 0.36;
    T(s, b[0], { x: 0.65, y, w: 1.5, h: 0.32, fontSize: 9, bold: true, color: C.navy, valign: "middle" });
    const bw = Math.log10(b[1]) / lmax * 4.4;
    R(s, 2.2, y + 0.07, bw, 0.2, i === 4 ? C.red : i === 0 ? C.teal : C.orange);
    T(s, b[2], { x: 2.25 + bw, y, w: 0.9, h: 0.32, fontSize: 9, bold: true, color: i === 4 ? C.red : C.navy, valign: "middle" });
  });

  R(s, 7.95, 4.68, 4.9, 2.22, C.navy, { round: true, rr: 0.06 });
  T(s, "読み取れること", { x: 8.15, y: 4.72, w: 4.5, h: 0.28, fontSize: 11, bold: true, color: C.orange });
  T(s, bullets([
    "4方向版だけでも、全組み合わせに数日〜約2か月かかる",
    "17変数では数年 → この方式ではツールが作れない",
    "これに入力作成・保存・再計算・検証用の配置が加わる",
    "格子がそろえば点を探すのは簡単。問題は、そろえるための計算時間とデータ量",
  ], { gap: 3 }), { x: 8.15, y: 5.02, w: 4.55, h: 1.82, fontSize: 9.5, color: C.white });
  T(s, "17変数の行：各建物「なし＋高さ3×距離3×方位3＝28通り」の4棟分 × 中央高さ4通り。方位3段階は粗すぎるので、実際はさらに多い", { x: 0.5, y: 4.38, w: 12.35, h: 0.24, fontSize: 8.5, color: C.muted });
  s.addNotes("");
}

// =====================================================================
// P7-5: 17変数では別の学習方法が必要
// =====================================================================
{
  const s = std(next(), 7, "4方向で6,561通り → 17変数では別の学習方法が必要");
  story(s, 6);
  table(s, [
    ["", "南1棟（完成）", "4方向版", "最終目標（17変数）"],
    ["補間する連続変数", "2（A, D）", "8（A, D × 4）", "13（中央高さ＋A, D, θ × 4）"],
    ["有無の組み合わせ", "1", "2⁴＝16", "2⁴＝16"],
    ["必要な配置（各3段階）", "9", "10,000", "約246万"],
    ["1回の予測で使う頂点", "2²＝4", "2⁸＝256", "2¹³＝8,192"],
    ["SEBEの計算時間", "数分", "約3.5〜7日", "約2.3〜4.7年"],
    [{ t: "判定", o: { bold: true } }, { t: "○ 作れた", o: { bold: true, color: C.green } }, { t: "△ 負担が大きい", o: { bold: true, color: C.dorange } }, { t: "× 成立しない", o: { bold: true, color: C.red } }],
  ], { x: 0.5, y: 1.7, w: 7.3, colW: [2.0, 1.4, 1.6, 2.3], rowH: 0.4, fs: 10, boldCol0: true });
  R(s, 0.5, 4.7, 7.3, 2.2, C.peach, { round: true, rr: 0.06 });
  T(s, "線形補間（全組み合わせを表にする方式）の限界", { x: 0.65, y: 4.76, w: 7.0, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, bullets([
    "変数が1つ増えるごとに、必要な配置が3倍以上に増える",
    "表の点が1つでも欠けると、その周りでは補間できない",
    "方位 θ や中央の高さは「格子の間」が広いと精度が落ちるので、段階を増やすとさらに急増する",
    "数学的には使えるが、研究期間と計算資源の中では、17変数のツールは作れない",
  ], { gap: 5 }), { x: 0.65, y: 5.1, w: 7.0, h: 1.75, fontSize: 10.5 });

  // 右：別の方法へ
  R(s, 8.05, 1.7, 4.8, 5.2, C.navy, { round: true, rr: 0.06 });
  T(s, "そこで：空の遮られ方を使う学習方法へ", { x: 8.25, y: 1.78, w: 4.4, h: 0.5, fontSize: 12, bold: true, color: C.orange });
  const fl = [
    ["建物の配置", "棟数・方位・高さがばらばら（変数17個）"],
    ["空の地図に変換", "壁の点から見て、どの方向の空がふさがれているか"],
    ["同じ大きさの入力", "どんな配置でも、例えば72マスの地図になる"],
    ["機械学習で予測", "4面×5帯＝20個の日射量"],
  ];
  fl.forEach((f, i) => {
    const y = 2.4 + i * 0.86;
    R(s, 8.25, y, 4.4, 0.68, i === 1 ? C.teal : C.navy3, { round: true, rr: 0.05 });
    T(s, f[0], { x: 8.35, y: y + 0.03, w: 4.2, h: 0.28, fontSize: 10.5, bold: true, color: C.white });
    T(s, f[1], { x: 8.35, y: y + 0.32, w: 4.2, h: 0.32, fontSize: 9, color: "E1E8F2" });
    if (i < 3) T(s, "▼", { x: 10.25, y: y + 0.66, w: 0.4, h: 0.2, fontSize: 8, color: C.orange, align: "center", margin: 0 });
  });
  T(s, bullets([
    "表の格子をそろえなくてよい（ばらばらな配置で学習できる）",
    "変数が増えても、入力の大きさは変わらない",
    "必要な配置の数・精度はまだ分からない → 来週詳しく",
  ], { gap: 2 }), { x: 8.25, y: 5.85, w: 4.45, h: 1.0, fontSize: 9, color: C.white });
  s.addNotes("");
}

// =====================================================================
// P8-1: 代案 空の遮られ方（考え方と数値例）
// =====================================================================
{
  const s = std(next(), 8, "代案：空の遮られ方 ― どの方向の空がふさがれているかを数える", "配置を「空の地図」に変えてから予測する。棟数や方位が変わっても同じ大きさの地図になるので、組み合わせを全部計算しなくてよい。");
  R(s, 0.5, 1.62, 6.1, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "横から見た図：壁の点Pから空を見上げる", { x: 0.65, y: 1.68, w: 5.8, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const k = 0.05, gx = 0.95, gy = 5.7;
  const X = m => gx + (m + 75) * k, Z = m => gy - m * k;
  line(s, 0.7, gy, 6.4, gy, { color: C.muted, width: 1 });
  R(s, X(-75), Z(35), 50 * k, 35 * k, C.teal);
  T(s, "南側建物\n高さ35m", { x: X(-75), y: Z(35) + 0.45, w: 50 * k, h: 0.5, fontSize: 9, bold: true, color: C.white, align: "center" });
  R(s, X(0), Z(50), 0.85, 50 * k, C.navy);
  T(s, "中央\n建物", { x: X(0), y: Z(32), w: 0.85, h: 0.5, fontSize: 9, bold: true, color: C.white, align: "center" });
  const pz = 20, P0 = [X(0), Z(pz)];
  dot(s, P0[0], P0[1], 0.16, C.orange);
  T(s, "点P\n高さ20m", { x: X(0) + 0.9, y: Z(pz) - 0.2, w: 0.9, h: 0.45, fontSize: 8.5, bold: true, color: C.dorange });
  const hAng = Math.atan((35 - pz) / 25) * 180 / Math.PI;
  [8, 20, 45, 62, 78].forEach(e => {
    const r = e * Math.PI / 180;
    if (e < hAng) line(s, P0[0], P0[1], X(-25), Z(pz + 25 * Math.tan(r)), { color: C.red, width: 1.25, end: "oval" });
    else line(s, P0[0], P0[1], P0[0] - 2.1 * Math.cos(r), P0[1] - 2.1 * Math.sin(r), { color: C.green, width: 1.25, end: "triangle" });
  });
  const hr = hAng * Math.PI / 180;
  line(s, P0[0], P0[1], P0[0] - 2.0 * Math.cos(hr), P0[1] - 2.0 * Math.sin(hr), { color: C.navy, width: 1, dash: "dash" });
  line(s, X(-25), gy + 0.12, X(0), gy + 0.12, { color: C.red, width: 1, begin: "triangle", end: "triangle" });
  T(s, "隙間 25m", { x: X(-25), y: gy + 0.14, w: 25 * k, h: 0.22, fontSize: 8.5, bold: true, color: C.red, align: "center" });
  T(s, [{ text: "━ 空が見える　", options: { color: C.green } }, { text: "━ 建物でふさがれる", options: { color: C.red } }], { x: 0.7, y: 2.0, w: 4, h: 0.24, fontSize: 8.5, bold: true });
  R(s, 0.7, 6.15, 5.7, 0.62, C.white, { round: true, rr: 0.05 });
  T(s, "遮蔽高度角 h：tan h ＝ (35 − 20) / 25 ＝ 0.6 → h ≒ 31°（これより低い方向はふさがれる）", { x: 0.8, y: 6.15, w: 5.5, h: 0.62, fontSize: 9.5, bold: true, color: C.navy, valign: "middle" });

  R(s, 6.85, 1.62, 6.0, 3.3, C.panel, { round: true, rr: 0.06 });
  T(s, "点Pから見た「空の地図」（12方位 × 6高度 ＝ 72マス）", { x: 7.0, y: 1.68, w: 5.8, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const mx = 7.6, my = 2.05, cw = 0.38, ch = 0.33, nA = 12, nE = 6;
  for (let a = 0; a < nA; a++) for (let e = 0; e < nE; e++) {
    const phi = -90 + (a + 0.5) * 15, el = (e + 0.5) * 15;
    const h1 = Math.abs(phi) <= 45 ? Math.atan(0.6 * Math.cos(phi * Math.PI / 180)) * 180 / Math.PI : -1;
    const b1 = el < h1, b2 = phi >= 30 && phi <= 75 && e === 0;
    R(s, mx + a * cw, my + (nE - 1 - e) * ch, cw - 0.02, ch - 0.02, b1 && b2 ? C.red : b1 ? C.orange : b2 ? C.teal : C.white, { line: "D5DAE1", lw: 0.5 });
  }
  T(s, "高度90°", { x: 6.9, y: my, w: 0.68, h: 0.22, fontSize: 8, color: C.muted, align: "right" });
  T(s, "高度0°", { x: 6.9, y: my + nE * ch - 0.24, w: 0.68, h: 0.22, fontSize: 8, color: C.muted, align: "right" });
  T(s, "−90°（左）　　　　　0°（壁の正面）　　　　　＋90°（右）", { x: mx, y: my + nE * ch + 0.02, w: nA * cw, h: 0.22, fontSize: 8, color: C.muted, align: "center" });
  [[C.orange, "南側建物"], [C.teal, "別の低い建物（説明用）"], [C.red, "両方がふさぐ"]].forEach((l, i) => { R(s, 7.05 + [0, 1.35, 3.6][i], 4.5, 0.17, 0.17, l[0]); T(s, l[1], { x: 7.26 + [0, 1.35, 3.6][i], y: 4.45, w: [1.1, 2.2, 1.5][i], h: 0.26, fontSize: 8.5 }); });

  R(s, 6.85, 5.05, 6.0, 1.85, C.navy, { round: true, rr: 0.06 });
  T(s, "ふさがれた割合 O を数える", { x: 7.05, y: 5.1, w: 5.6, h: 0.28, fontSize: 11, bold: true, color: C.orange });
  T(s, ML([
    ["南側建物 12マス ＋ 低い建物 3マス − 重なり 1マス ＝ 14マス", { color: C.white }],
    ["O ＝ 14 / 72 ＝ 0.194（19.4%）", { color: C.orange }],
    ["単純に足すと 15マス（20.8%）＝ 重なりを二重に数えてしまう", { color: "CADCFC", bold: false, fontSize: 9.5 }],
  ]), { x: 7.05, y: 5.42, w: 5.65, h: 1.4, fontSize: 10.5, bold: true, lineSpacingMultiple: 1.25 });
  s.addNotes("代案の空の遮られ方です。壁の点Pから空を見上げると、南側建物より低い方向はふさがれます。高さ20mの点Pで、高さ35mの建物が25m先にあると、tan h=15/25で約31°より下がふさがれます。空を72マスに分けてふさがれたマスを数えると14マスで、割合は19.4%です。2棟が同じマスをふさいでも1回しか数えないので、足し算のような二重引きが起きません。低い建物の値は説明用です。");
}

// =====================================================================
// P8-2: 空の遮られ方 計算の流れ
// =====================================================================
{
  const s = std(next(), 8, "空の遮られ方：計算の流れと、線形補間との違い", "SEBEで計算する配置とテスト配置は共通。違うのは「配置をどんな数値に変えて予測するか」。");
  const fl = [
    ["入力", "配置の変数\n中央高さ, s, A, D, θ", C.navy],
    ["① 遮られ方を調べる", "各面・各帯の点から、方向ごとに建物でふさがれるか判定", C.teal],
    ["② 数値にまとめる", "方向ごとの遮蔽高度角 h、ふさがれた割合 O など", C.teal],
    ["③ 機械学習モデル", "②の数値 → 年間日射量（モデルは未定）", C.dorange],
    ["出力", "4面 × 5帯\n＝ 20個", C.navy],
  ];
  fl.forEach((f, i) => {
    const x = 0.5 + i * 2.5, w = 2.25;
    R(s, x, 1.62, w, 1.3, f[2], { round: true, rr: 0.06 });
    T(s, f[0], { x: x + 0.1, y: 1.67, w: w - 0.2, h: 0.28, fontSize: 11, bold: true, color: C.white });
    T(s, f[1], { x: x + 0.1, y: 1.97, w: w - 0.2, h: 0.9, fontSize: 9.5, color: C.white });
    if (i < fl.length - 1) s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: x + w, y: 2.2, w: 0.26, h: 0.16, fill: { color: C.faint }, line: { type: "none" }, rotate: 90 });
  });
  R(s, 0.5, 3.1, 6.2, 3.8, C.panel, { round: true, rr: 0.06 });
  T(s, "想定している計算（前ページの点Pの値）", { x: 0.65, y: 3.16, w: 5.9, h: 0.28, fontSize: 11.5, bold: true, color: C.navy });
  const eqs = [
    ["遮蔽高度角", "h_{j} ＝ max_{i} arctan( (A_{i} − z) / d_{ij} )", "max_{i}：有る建物 i の中で一番高く見える角度を選ぶ（重なっても1回）", "例：正面 arctan(15/25) ＝ 31°"],
    ["ふさがれているか", "b_{j} ＝ 1（マスの高度 ＜ h_{j}）／ 0（それ以外）", "そのマスが建物より低い方向なら「ふさがれている」", "例：正面の高度0〜15°のマスは 1"],
    ["ふさがれた割合", "O ＝ (1/J) Σ_{j=1}^{J} b_{j}", "Σ_{j=1}^{J}：J 個のマスの b を全部足す＝ふさがれたマスの数", "例：14 / 72 ＝ 0.194"],
    ["予測", "Ŷ_{f,k} ＝ F( h_{1}, …, h_{J}, O, z, 面の向き )", "F：SEBEの結果から学習して作る関数（機械学習モデル）", "例：F の種類は来週決める"],
  ];
  eqs.forEach((e, i) => {
    const y = 3.48 + i * 0.85;
    T(s, e[0], { x: 0.65, y: y + 0.02, w: 1.25, h: 0.3, fontSize: 9.5, bold: true, color: C.teal });
    T(s, M(e[1]), { x: 1.9, y, w: 4.7, h: 0.3, fontSize: 11, bold: true, color: C.navy });
    T(s, M(e[2]), { x: 1.9, y: y + 0.3, w: 4.7, h: 0.24, fontSize: 9, color: C.text });
    T(s, M(e[3]), { x: 1.9, y: y + 0.54, w: 4.7, h: 0.24, fontSize: 9, bold: true, color: C.dorange });
  });
  table(s, [
    ["", "線形補間（全組み合わせ）", "空の遮られ方（代案）"],
    ["入力データ", "配置の変数", "同じ（内部で②の数値に変換）"],
    ["学習データ", "格子の全配置（4方向で1万）", "格子をそろえなくてよい"],
    ["変数が増えると", "配置が3倍ずつ増える", "入力の大きさは同じ"],
    ["影の重なり", "全配置のSEBE値に含む", "max・マス数で1回だけ"],
    ["計算の重さ", "予測は軽い・準備が重い", "②の計算＋モデル学習"],
  ], { x: 6.95, y: 3.1, w: 5.9, colW: [1.3, 2.2, 2.4], rowH: 0.36, fs: 9.5, boldCol0: true });
  R(s, 6.95, 5.4, 5.9, 1.5, C.peach, { round: true, rr: 0.06 });
  T(s, "まだ決めていないこと（来週詰める）", { x: 7.1, y: 5.45, w: 5.6, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, bullets(["方向の分け方（何マスにするか）と距離 d の正確な求め方", "機械学習モデルの種類", "線形補間より必ず良いとは言えない → 同じテスト配置で比べる"], { gap: 2 }), { x: 7.1, y: 5.75, w: 5.6, h: 1.1, fontSize: 9.5 });
  s.addNotes("空の遮られ方の計算の流れです。入力、学習、テストのデータは足し算の方法と同じものを使えます。違うのは、配置を方向ごとの遮蔽高度角やふさがれた割合という数値に変換し、機械学習モデルで日射量を予測する点です。maxを取るので、同じ方向を2棟がふさいでも1回だけ数えます。方向の分け方や距離の扱い、モデルの種類はまだ決まっていないので、来週詰めます。");
}

// =====================================================================
// まとめ
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  T(s, "SUMMARY", { x: 0.7, y: 0.5, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.orange, charSpacing: 2 });
  T(s, "まとめ：今回整理したことと、来週やること", { x: 0.7, y: 0.8, w: 12, h: 0.6, fontSize: 26, bold: true, color: C.white });
  const cols = [
    ["今回整理したこと", C.teal, [
      "データの役割（47配置）と、2,500区画→5帯→4隅の重み付き平均（Σ）の計算",
      "最終ツールの変数17個と、有無を0/1の s で表す理由",
      "線形補間は4方向で 6,561〜10,000配置・256頂点が必要。SEBE 1回30秒〜1分でも約3.5〜7日",
      "17変数では約246万配置・数年 → 別の学習方法が必要",
    ]],
    ["来週やること", C.orange, [
      "空の遮られ方の計算方法（方向の分け方・距離の扱い）を決める",
      "学習に使う配置の数と選び方、機械学習モデルを決める",
      "まず南1棟の既存データで特徴量を計算し、線形補間と精度を比べる（案）",
    ]],
    ["まだ決めていないこと", "8FA0BC", [
      "判断の基準（誤差率何%以内なら採用するか）",
      "空の遮られ方で必要な配置の数",
      "中央の高さ・任意方位への広げ方",
    ]],
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 4.0, w = 3.8;
    R(s, x, 1.7, w, 4.85, C.navy2, { round: true, rr: 0.06 });
    R(s, x, 1.7, w, 0.55, c[1], { round: true, rr: 0.06 });
    T(s, c[0], { x: x + 0.2, y: 1.7, w: w - 0.4, h: 0.55, fontSize: 14, bold: true, color: C.white, valign: "middle" });
    T(s, bullets(c[2], { gap: 14 }), { x: x + 0.2, y: 2.45, w: w - 0.4, h: 4.0, fontSize: 13, color: C.white });
  });
  T(s, "線形補間で全組み合わせを事前計算する方式は、17変数では成立しない。次は「空の遮られ方」の詳細を詰める。", { x: 0.7, y: 6.62, w: 11.9, h: 0.35, fontSize: 11.5, bold: true, color: C.orange });
  T(s, "壁面日射量予測ツールの開発", { x: 0.5, y: 7.13, w: 3.5, h: 0.28, fontSize: 9, color: "8FA0BC" });
  const nEnd = next();
  T(s, `${nEnd} / ${TOTAL}`, { x: 11.33, y: 7.1, w: 1.5, h: 0.32, fontSize: 11, bold: true, color: C.white, align: "right" });
  s.addNotes("");
}

pres.writeFile({ fileName: "/tmp/w/new.pptx" }).then(() => console.log("written"));
