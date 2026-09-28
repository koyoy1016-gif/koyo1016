// 続きスライド（19〜37枚目）を生成する
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

const TOTAL = 41;
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
  7: "PART 7  4方向での線形補間（来週の検証）",
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
  slide.addText(text, { fontFace: FONT, color: C.text, fontSize: 11, valign: "top", margin: 0.04, isTextBox: true, ...o });
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
  const fs = o.fs || 10;
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
    ["PART 5", "データと計算過程の整理", "学習16・検証8・テスト12などの役割と、Σを使った計算式", "p.20–27", "Q1"],
    ["PART 6", "最終目標ツールの変数", "平面図・立体図で17個の変数の位置と、0/1変数を使う理由", "p.28–31", "Q2"],
    ["PART 7", "4方向での線形補間", "なぜ難しいか。来週どの配置・入力で試し、何を数値で示すか", "p.32–37", "Q3"],
    ["PART 8", "代案：空の遮られ方", "線形補間でうまくいかない場合の方法の概要（詳細は来週）", "p.38–40", "Q3"],
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
// 21: データの数え方
// =====================================================================
{
  const s = std(next(), 5, "データの数え方：2,500区画を500区画ずつ平均して5つの値にする", "SEBEの壁出力から中央建物の南面（50m×50m）を取り出し、1m四方の区画を高さ10mごとに平均する。");
  // 壁図
  R(s, 0.5, 1.6, 6.3, 5.3, C.panel, { round: true, rr: 0.06 });
  T(s, "1配置の南面（幅50区画 × 高さ50区画）", { x: 0.65, y: 1.66, w: 6, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const wx = 1.25, wy = 2.1, ww = 2.3, wh = 2.6;
  const bandCols = ["F6D2B4", "F2BE92", "EEA870", "E8934D", "D77B35"];
  for (let k = 0; k < 5; k++) {
    const y = wy + wh - (k + 1) * wh / 5;
    R(s, wx, y, ww, wh / 5, bandCols[k], { line: C.white, lw: 1 });
    T(s, M(`帯${k + 1}：y_{${k + 1}}`), { x: wx, y, w: ww, h: wh / 5, fontSize: 10, bold: true, color: k >= 3 ? C.white : C.navy, align: "center", valign: "middle" });
    T(s, `${k * 10}〜${k * 10 + 10}m`, { x: wx + ww + 0.08, y: y + 0.12, w: 0.9, h: 0.25, fontSize: 9, color: C.muted });
  }
  T(s, "p＝1 … 50（幅方向）", { x: wx, y: wy + wh + 0.03, w: ww, h: 0.25, fontSize: 9, color: C.muted, align: "center" });
  T(s, "q＝1 … 50\n（高さ方向）", { x: 0.55, y: wy + wh / 2 - 0.3, w: 0.7, h: 0.6, fontSize: 8.5, color: C.muted, align: "center" });
  T(s, "各帯＝50×10＝500区画", { x: 4.55, y: 2.1, w: 2.75, h: 0.3, fontSize: 10, bold: true, color: C.dorange });
  T(s, M("G_{p,q}：区画(p, q)の年間日射量（kWh/m²）。SEBEが区画ごとに計算した値"), { x: 4.55, y: 2.45, w: 2.15, h: 1.1, fontSize: 9.5, color: C.text });
  T(s, "5帯とも面積が同じ（500m²）なので、全体平均は5帯の単純平均と一致する", { x: 4.55, y: 3.6, w: 2.15, h: 1.0, fontSize: 9.5, color: C.text });

  R(s, 0.7, 5.05, 5.9, 1.7, C.navy, { round: true, rr: 0.06 });
  T(s, ML([
    ["帯kの平均：　y_{k} ＝ (1/500) Σ_{(p,q)∈帯k} G_{p,q}　　（k＝1,…,5）", { bold: true }],
    ["　　帯k は q＝10(k−1)+1 〜 10k の10段 × p＝1〜50", { fontSize: 9.5, color: "CADCFC" }],
    ["南面全体：　ȳ ＝ (1/2500) Σ_{p=1}^{50} Σ_{q=1}^{50} G_{p,q} ＝ (1/5) Σ_{k=1}^{5} y_{k}", { bold: true }],
    ["　　全体平均は5帯から計算できる → 新しい情報は増えない", { fontSize: 9.5, color: "CADCFC" }],
  ]), { x: 0.85, y: 5.12, w: 5.65, h: 1.58, fontSize: 11.5, color: C.white, valign: "middle", lineSpacingMultiple: 1.2 });

  // 右：個数表
  T(s, "16配置のとき、何を何個数えているか", { x: 7.1, y: 1.62, w: 5.7, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  table(s, [
    ["数えているもの", "個数", "意味"],
    ["建物配置", { t: "16件", o: { bold: true, color: C.dorange } }, "異なるA・Dの組み合わせ"],
    ["入力の数値", "16×2＝32個", "各配置のAとD"],
    ["南面の元の区画値", "16×2,500＝40,000個", "集計前の日射量"],
    ["5帯の平均（予測に使う値）", "16×5＝80個", "高さ帯別の値"],
    ["全体平均", "16個", "5帯から計算できる"],
    ["5帯＋全体平均の数値", "16×6＝96個", "表示・保存する数値の数"],
  ], { x: 7.1, y: 2.0, w: 5.73, colW: [2.2, 1.6, 1.93], rowH: 0.36, fs: 10, boldCol0: true });

  R(s, 7.1, 4.75, 5.73, 2.15, C.peach, { round: true, rr: 0.06 });
  T(s, "96件の学習データではない", { x: 7.3, y: 4.85, w: 5.4, h: 0.32, fontSize: 13, bold: true, color: C.dorange });
  T(s, bullets([
    "96は「数値の個数」。異なる配置（学習例）は16件のまま",
    "同じ配置から取った5帯の値は、互いに独立した別の条件ではない",
    "全体平均は5帯の平均なので、加えても情報は増えない",
    "補間プログラムは「16配置×5帯」の表を持ち、新しい入力に対して5帯を補間し、全体平均はその5帯から計算する",
  ]), { x: 7.3, y: 5.22, w: 5.4, h: 1.62, fontSize: 10.5 });
  s.addNotes("1配置につきSEBEが出す南面の区画値は2,500個です。これを高さ10mごとに500個ずつ平均して5つの値にします。16配置なら80個の帯平均になりますが、学習に使った配置は16件です。全体平均は5帯の平均なので、足しても独立した情報は増えません。");
}

// =====================================================================
// 例A：帯平均・全体平均の代入例
// =====================================================================
{
  const s = std(next(), 5, "計算例①：(A, D)＝(50m, 10m) の1配置で、5帯の値と全体平均を出す", "前ページの式に、保存データの実際の値を入れた例。500区画の合計は「保存した帯平均 × 500」で逆算した値。");
  const v = [337.34062, 351.22192, 382.56720, 485.54594, 867.14398];
  // 左：帯1の代入
  R(s, 0.5, 1.62, 6.5, 2.35, C.navy, { round: true, rr: 0.06 });
  T(s, "代表値：帯1（地上0〜10m）", { x: 0.7, y: 1.7, w: 6, h: 0.3, fontSize: 11.5, bold: true, color: C.orange });
  T(s, ML([
    "y_{1} ＝ (1/500) Σ_{(p,q)∈帯1} G_{p,q}",
    "　 ＝ (G_{1,1} ＋ G_{2,1} ＋ … ＋ G_{50,10}) / 500　← 50×10＝500個を足す",
    "　 ＝ 168,670.31 / 500",
    ["　 ＝ 337.34 kWh/m²", { color: C.orange }],
  ]), { x: 0.7, y: 2.05, w: 6.2, h: 1.85, fontSize: 12, bold: true, color: C.white, lineSpacingMultiple: 1.3 });

  // 左下：5帯の表
  table(s, [
    ["帯 k", "高さ", "500区画の合計（逆算）", "÷500 ＝ 帯平均"],
    ...v.map((x, i) => [`帯${i + 1}`, `${i * 10}〜${i * 10 + 10}m`, (x * 500).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), { t: x.toFixed(2), o: { bold: true, color: C.dorange } }]),
    [{ t: "合計", o: { bold: true } }, "2,500区画", "1,211,909.83", { t: "2,423.82", o: { bold: true } }],
  ], { x: 0.5, y: 4.15, w: 6.5, colW: [0.9, 1.2, 2.3, 2.1], rowH: 0.36, fs: 10.5, boldCol0: true });

  // 右：全体平均の2通り
  R(s, 7.3, 1.62, 5.55, 2.9, C.panel, { round: true, rr: 0.06 });
  T(s, "南面全体の平均：2通りの計算が一致する", { x: 7.45, y: 1.7, w: 5.3, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  T(s, "(a) 2,500区画をまとめて平均", { x: 7.45, y: 2.08, w: 5.3, h: 0.26, fontSize: 10, bold: true, color: C.teal });
  T(s, M("ȳ ＝ (1/2500) Σ G_{p,q} ＝ 1,211,909.83 / 2,500 ＝ 484.76"), { x: 7.45, y: 2.36, w: 5.3, h: 0.32, fontSize: 11.5, bold: true, color: C.navy });
  T(s, "(b) 5帯の平均をさらに平均", { x: 7.45, y: 2.8, w: 5.3, h: 0.26, fontSize: 10, bold: true, color: C.teal });
  T(s, ML([
    "ȳ ＝ (337.34＋351.22＋382.57＋485.55＋867.14) / 5",
    "　＝ 2,423.82 / 5 ＝ 484.76 kWh/m²",
  ]), { x: 7.45, y: 3.08, w: 5.3, h: 0.7, fontSize: 11, bold: true, color: C.navy });
  T(s, "5帯の面積が同じ（500m²）なので (a)＝(b)。全体平均は5帯から計算できる値。", { x: 7.45, y: 3.85, w: 5.3, h: 0.6, fontSize: 9.5, color: C.muted });

  // 右下：16×5の表のうちの1行
  T(s, "この5個が「16配置 × 5帯」の表の1行になる", { x: 7.3, y: 4.68, w: 5.55, h: 0.3, fontSize: 11, bold: true, color: C.navy });
  const f = x => x.toFixed(1);
  table(s, [
    ["(A, D)", "帯1", "帯2", "帯3", "帯4", "帯5"],
    [{ t: "(50, 10)", o: { bold: true, color: C.dorange } }, ...v.map(x => ({ t: f(x), o: { bold: true, color: C.dorange, fill: { color: C.peach } } }))],
    ["(75, 10)", ...[319.88960, 320.19640, 323.60488, 348.50406, 357.94972].map(f)],
    ["(50, 25)", ...[589.57246, 631.32628, 697.91874, 873.24342, 1006.92830].map(f)],
    ["…（計16行）", "…", "…", "…", "…", "…"],
  ], { x: 7.3, y: 5.03, w: 5.55, colW: [1.3, 0.85, 0.85, 0.85, 0.85, 0.85], rowH: 0.34, fs: 10, boldCol0: true });
  s.addNotes("(A, D)=(50, 10)の配置で、帯1の500区画の年間日射量を合計すると約168,670、500で割ると337.34になります。5帯を同じように計算し、その平均484.76は2,500区画をまとめて平均した値と一致します。この5個が、補間に使う16行×5列の表の1行です。");
}
// =====================================================================
// 22: 計算過程① 式
// =====================================================================
{
  const s = std(next(), 5, "計算過程①：入力を囲む4配置と、その重みを式で求める", "例として A＝55.9m・D＝14m を入力したときの流れ。重みは学習で調整した係数ではなく、入力の位置からその都度計算する割合。");
  const steps = [
    ["入力を囲む区間を探す", "A_{0} ≤ A < A_{1}，D_{0} ≤ D < D_{1}", "50 ≤ 55.9 < 75，10 ≤ 14 < 25 → 4隅は (50,10)(75,10)(50,25)(75,25)"],
    ["区間の中の位置（割合）を求める", "u ＝ (A − A_{0}) / (A_{1} − A_{0})，v ＝ (D − D_{0}) / (D_{1} − D_{0})", "u ＝ 5.9 / 25 ＝ 0.236，v ＝ 4 / 15 ≒ 0.2667"],
    ["4隅の重みを掛け算で求める", "w_{1}＝(1−u)(1−v)，w_{2}＝u(1−v)，w_{3}＝(1−u)v，w_{4}＝uv", "Σ_{c=1}^{4} w_{c} ＝ 1（4つの重みの合計は必ず1）"],
    ["高さ帯ごとに重み付きで足す", "ŷ_{k}(A, D) ＝ Σ_{c=1}^{4} w_{c} · y_{k}(A_{c}, D_{c})　（k＝1,…,5）", "y_{k}(A_{c}, D_{c})：隅cに保存した帯kの値。5帯とも同じ重みを使う"],
    ["南面全体の平均を出す", "ŷ_{平均} ＝ (1/5) Σ_{k=1}^{5} ŷ_{k}", "面積が等しい5帯の単純平均"],
  ];
  steps.forEach((st, i) => {
    const y = 1.62 + i * 1.06;
    R(s, 0.5, y, 7.3, 0.96, i % 2 ? C.white : C.panel, { round: true, rr: 0.05, line: "E1E5EA" });
    circleNum(s, 0.65, y + 0.12, i + 1, C.teal);
    T(s, st[0], { x: 1.1, y: y + 0.08, w: 6.5, h: 0.28, fontSize: 11.5, bold: true, color: C.navy });
    T(s, M(st[1]), { x: 1.1, y: y + 0.36, w: 6.6, h: 0.3, fontSize: 12, bold: true, color: C.dorange });
    T(s, M(st[2]), { x: 1.1, y: y + 0.64, w: 6.6, h: 0.28, fontSize: 9.5, color: C.muted });
  });
  // 右：面積図
  R(s, 8.1, 1.62, 4.75, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "重み＝反対側の長方形の面積", { x: 8.25, y: 1.68, w: 4.5, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  const sx = 9.0, sy = 2.35, sw = 3.0, sh = 3.0; // 正方形（左下が(50,10)）
  const u = 0.236, v = 4 / 15;
  const px = sx + v * sw, py = sy + sh - u * sh;
  // 各小長方形（反対の隅の色）
  const cols = { c1: "F2BE92", c2: "BFD9DC", c3: "F6D9C0", c4: "D7E7EA" };
  R(s, px, sy, sx + sw - px, py - sy, cols.c1, { line: C.white }); // 右上 → (50,10)の重み
  R(s, sx, sy, px - sx, py - sy, cols.c3, { line: C.white });      // 左上 → (50,25)
  R(s, px, py, sx + sw - px, sy + sh - py, cols.c2, { line: C.white }); // 右下 → (75,10)
  R(s, sx, py, px - sx, sy + sh - py, cols.c4, { line: C.white }); // 左下 → (75,25)
  T(s, "0.560", { x: px, y: sy + 0.8, w: sx + sw - px, h: 0.4, fontSize: 16, bold: true, color: C.navy, align: "center" });
  T(s, "(50,10)の重み", { x: px, y: sy + 1.18, w: sx + sw - px, h: 0.25, fontSize: 9, color: C.navy, align: "center" });
  T(s, "0.204", { x: sx, y: sy + 0.8, w: px - sx, h: 0.4, fontSize: 11, bold: true, color: C.navy, align: "center" });
  T(s, "0.173", { x: px, y: py + 0.12, w: sx + sw - px, h: 0.3, fontSize: 11, bold: true, color: C.navy, align: "center" });
  T(s, "0.063", { x: sx - 0.02, y: py + 0.12, w: px - sx + 0.04, h: 0.3, fontSize: 9, bold: true, color: C.navy, align: "center" });
  dot(s, px, py, 0.16, C.dorange, "STAR_5_POINT");
  // 隅ラベル
  const corner = (x, y, t, al) => T(s, t, { x, y, w: 0.95, h: 0.24, fontSize: 9, bold: true, color: C.navy, align: al });
  dot(s, sx, sy + sh, 0.13, C.dorange, "RECTANGLE"); corner(sx - 0.98, sy + sh - 0.05, "(50,10)", "right");
  dot(s, sx + sw, sy + sh, 0.13, C.dorange, "RECTANGLE"); corner(sx + sw + 0.05, sy + sh - 0.05, "(50,25)", "left");
  dot(s, sx, sy, 0.13, C.dorange, "RECTANGLE"); corner(sx - 0.98, sy - 0.12, "(75,10)", "right");
  dot(s, sx + sw, sy, 0.13, C.dorange, "RECTANGLE"); corner(sx + sw + 0.05, sy - 0.12, "(75,25)", "left");
  T(s, "v＝0.267", { x: sx, y: sy + sh + 0.1, w: px - sx + 0.4, h: 0.24, fontSize: 9, color: C.dorange, bold: true });
  T(s, "D方向 →", { x: sx + 1.2, y: sy + sh + 0.1, w: 1.8, h: 0.24, fontSize: 9, color: C.muted, align: "right" });
  T(s, "u＝0.236", { x: sx - 0.82, y: py + 0.18, w: 0.8, h: 0.24, fontSize: 9, color: C.dorange, bold: true, align: "right" });
  T(s, "↑A方向", { x: sx - 0.82, y: sy + 1.2, w: 0.8, h: 0.24, fontSize: 9, color: C.muted, align: "right" });
  T(s, "★ 入力 (A 55.9, D 14)。入力が近い隅ほど、その反対側の長方形が大きくなり、重みが大きい。", { x: 8.25, y: 5.85, w: 4.45, h: 0.95, fontSize: 9.5, color: C.text });
  s.addNotes("計算は5段階です。入力を囲む4つの格子点を探し、区間の中での位置uとvを求め、4隅の重みを掛け算で求めます。重みの合計は1です。高さ帯ごとに、保存値と重みを掛けて足すと予測値になります。右の図のように、ある隅の重みはその反対側の長方形の面積になるため、近い隅ほど重みが大きくなります。");
}

// =====================================================================
// 23: 計算過程② 数値例
// =====================================================================
{
  const s = std(next(), 5, "計算過程②：A＝55.9m・D＝14m の計算を5帯すべてで示す", "保存済み4配置の値（kWh/m²・年間）に重みを掛けて足す。中央建物は高さ50mのままで、壁を55.9mまで計算するわけではない。");
  const vals = [
    ["0〜10m", 337.34062, 319.88960, 589.57246, 535.48560, 398.17839],
    ["10〜20m", 351.22192, 320.19640, 631.32628, 561.20370, 416.13388],
    ["20〜30m", 382.56720, 323.60488, 697.91874, 585.74878, 449.39730],
    ["30〜40m", 485.54594, 348.50406, 873.24342, 603.63388, 548.24713],
    ["40〜50m", 867.14398, 357.94972, 1006.92830, 660.25038, 794.47765],
  ];
  const f2 = x => x.toFixed(2);
  const hl = { bold: true, color: C.dorange, fill: { color: C.peach } };
  table(s, [
    ["高さ帯 k", "(50,10)", "(75,10)", "(50,25)", "(75,25)", "予測値 ŷk"],
    [{ t: "重み w", o: { bold: true, color: C.teal } }, { t: "0.56027", o: { bold: true, color: C.teal } }, { t: "0.17307", o: { bold: true, color: C.teal } }, { t: "0.20373", o: { bold: true, color: C.teal } }, { t: "0.06293", o: { bold: true, color: C.teal } }, { t: "合計 1", o: { color: C.teal } }],
    ...vals.map(r => [r[0], f2(r[1]), f2(r[2]), f2(r[3]), f2(r[4]), { t: f2(r[5]), o: hl }]),
    [{ t: "南面全体の平均", o: { bold: true } }, "", "", "", "", { t: "521.29", o: { ...hl, fontSize: 12 } }],
  ], { x: 0.5, y: 1.62, w: 7.4, colW: [1.35, 1.2, 1.2, 1.2, 1.2, 1.25], rowH: 0.37, fs: 10.5, boldCol0: true });

  R(s, 0.5, 4.75, 7.4, 2.15, C.navy, { round: true, rr: 0.06 });
  T(s, "例：0〜10m帯（k＝1）", { x: 0.7, y: 4.83, w: 5, h: 0.28, fontSize: 11, bold: true, color: C.orange });
  T(s, ML([
    "ŷ_{1} ＝ 0.56027×337.34 ＋ 0.17307×319.89",
    "　 　＋ 0.20373×589.57 ＋ 0.06293×535.49",
    "　 ＝ 189.00 ＋ 55.36 ＋ 120.12 ＋ 33.70 ＝ 398.18 kWh/m²",
    ["残りの4帯も同じ4つの重みで、掛ける保存値だけを変える", { fontSize: 9.5, color: "CADCFC", bold: false }],
    "ŷ_{平均} ＝ (398.18＋416.13＋449.40＋548.25＋794.48) / 5 ＝ 521.29 kWh/m²",
  ]), { x: 0.7, y: 5.12, w: 7.05, h: 1.75, fontSize: 11, bold: true, color: C.white, lineSpacingMultiple: 1.1 });

  // 右：壁の図
  R(s, 8.2, 1.62, 4.65, 3.6, C.panel, { round: true, rr: 0.06 });
  T(s, "出力：南面5帯の予測値（kWh/m²）", { x: 8.35, y: 1.68, w: 4.4, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const bx = 9.2, by = 2.1, bh = 2.85;
  vals.slice().reverse().forEach((r, i) => {
    const y = by + i * bh / 5;
    const w = r[5] / 800 * 2.4;
    T(s, r[0], { x: 8.3, y: y + 0.12, w: 0.85, h: 0.3, fontSize: 9.5, color: C.muted, align: "right" });
    R(s, bx, y + 0.08, w, bh / 5 - 0.16, bandCols5(r[5]));
    T(s, r[5].toFixed(2), { x: bx + w + 0.06, y: y + 0.12, w: 0.9, h: 0.3, fontSize: 10.5, bold: true, color: C.navy });
  });
  function bandCols5(v) { return v > 700 ? "D77B35" : v > 500 ? "E8934D" : v > 430 ? "EEA870" : v > 405 ? "F2BE92" : "F6D2B4"; }

  box(s, 8.2, 5.4, 4.65, 1.5, "この値について注意", null, { fill: C.peach, tcolor: C.dorange, tfs: 11 });
  T(s, bullets([
    "保存データと式からの計算値。この条件でSEBEを実行していないので、この入力での誤差は不明",
    "局所改良版はA 25〜50mのため使えず、広範囲版を使う",
    "521.29は壁1m²当たりの平均。壁全体では×2,500m²",
  ], { gap: 2 }), { x: 8.35, y: 5.78, w: 4.4, h: 1.1, fontSize: 9.5 });
  s.addNotes("前のページの式に実際の保存値を入れた例です。0〜10m帯では、4つの保存値に重みを掛けて足すと398.18になります。残りの帯も同じ重みを使います。5帯の平均521.29が南面全体の平均です。この値はSEBEを新たに実行した結果ではないので、この条件での誤差は分かりません。");
}

// =====================================================================
// 24: 精度の確かめ方
// =====================================================================
{
  const s = std(next(), 5, "精度の確かめ方：どのデータを、どの式で評価したか", "予測値とSEBE計算値の差を、未使用の配置で数える。評価に使ったデータは、予測方法を作るデータには入れていない。");
  // 流れ
  const flow = [["学習16", "表を作る", C.navy], ["検証8", "3手法を比較\n→線形補間", C.teal], ["方法を固定", "ここで決定", C.navy3], ["テスト12", "最終確認", C.orange], ["追加5", "弱点を補強", C.dorange], ["局所テスト6", "改良前後を比較", C.green]];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 2.07;
    s.addShape(pres.shapes.CHEVRON, { x, y: 1.62, w: 2.0, h: 0.95, fill: { color: f[2] }, line: { type: "none" } });
    T(s, [{ text: f[0], options: { bold: true, fontSize: 12, breakLine: true } }, { text: f[1], options: { fontSize: 9 } }], { x: x + 0.3, y: 1.64, w: 1.45, h: 0.9, color: C.white, align: "center", valign: "middle" });
  });
  // 式
  R(s, 0.5, 2.85, 5.6, 4.05, C.panel, { round: true, rr: 0.06 });
  T(s, "評価に使った式（N＝比べた値の数）", { x: 0.65, y: 2.92, w: 5.3, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  const fm = [
    ["誤差", "e_{j} ＝ ŷ_{j} − y_{j}", "ŷ：予測値，y：SEBE計算値"],
    ["平均絶対誤差", "MAE ＝ (1/N) Σ_{j=1}^{N} |ŷ_{j} − y_{j}|", "単位 kWh/m²。ずれの大きさの平均"],
    ["平均誤差率", "MAPE ＝ (100/N) Σ_{j=1}^{N} |ŷ_{j} − y_{j}| / y_{j}", "単位 %。値の大きさに対するずれ"],
    ["最大誤差率", "max_{j} ( 100 × |ŷ_{j} − y_{j}| / y_{j} )", "最も外れた1件"],
  ];
  fm.forEach((f, i) => {
    const y = 3.32 + i * 0.88;
    T(s, f[0], { x: 0.65, y, w: 5.3, h: 0.25, fontSize: 10, bold: true, color: C.teal });
    T(s, M(f[1]), { x: 0.65, y: y + 0.25, w: 5.3, h: 0.3, fontSize: 12.5, bold: true, color: C.navy });
    T(s, f[2], { x: 0.65, y: y + 0.55, w: 5.3, h: 0.25, fontSize: 9, color: C.muted });
  });
  table(s, [
    ["評価の目的", "使ったデータ", "N", "結果"],
    ["手法の比較（検証）", "検証8配置・全体平均", "8", "線形補間 MAE 19.99・2.67%"],
    ["最終確認（テスト）", "テスト12配置・全体平均", "12", "MAE 18.40・2.42%"],
    ["高さ帯別の弱点", "検証8配置 × 5帯", "40", "30〜40m帯 MAE 38.56"],
    ["局所改良の確認", "局所テスト6配置 × 5帯", "30", "MAE 43.50 → 17.81"],
  ], { x: 6.35, y: 2.85, w: 6.5, colW: [1.65, 2.05, 0.5, 2.3], rowH: 0.42, fs: 10, boldCol0: true });
  box(s, 6.35, 5.1, 6.5, 1.8, "読み方の注意", null, { fill: C.peach, tcolor: C.dorange, tfs: 11 });
  T(s, bullets([
    "「× 5帯」のNは値の数で、配置の数ではない（検証40個＝8配置）",
    "高さ帯別の分析は、新しい40配置をテストしたのではなく、検証8配置を帯ごとに集計し直したもの",
    "数値はSEBEとの比較。実測日射量や発電量の精度ではない",
  ], { gap: 2 }), { x: 6.5, y: 5.48, w: 6.2, h: 1.38, fontSize: 10 });
  s.addNotes("精度はMAE、平均誤差率、最大誤差率で評価しました。どれも予測値とSEBE計算値の差から計算します。上の流れのように、検証データで方法を決めてからテストデータを使い、テスト結果を見て方法を変えていません。");
}

// =====================================================================
// 例B：誤差の代入例
// =====================================================================
{
  const s = std(next(), 5, "計算例②：誤差・誤差率・MAE に実際の値を入れる", "代表値として、検証8配置で最も誤差が大きかった A＝35m・D＝15m の 30〜40m 帯を使う。");
  // 棒の比較
  R(s, 0.5, 1.62, 4.3, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "A＝35m・D＝15m，30〜40m帯", { x: 0.65, y: 1.68, w: 4, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  const base = 6.2, sc = 3.6 / 1100;
  [["SEBE（正解値）y", 1014.20, C.teal], ["予測値 ŷ", 861.26, C.orange]].forEach((b, i) => {
    const x = 1.1 + i * 1.7, h = b[1] * sc;
    R(s, x, base - h, 1.1, h, b[2]);
    T(s, b[1].toFixed(2), { x: x - 0.2, y: base - h - 0.32, w: 1.5, h: 0.3, fontSize: 13, bold: true, color: C.navy, align: "center" });
    T(s, b[0], { x: x - 0.3, y: base + 0.05, w: 1.7, h: 0.3, fontSize: 10, bold: true, color: C.navy, align: "center" });
  });
  line(s, 0.8, base, 4.5, base, { color: C.muted });
  const yT = base - 1014.20 * sc, yP = base - 861.26 * sc;
  line(s, 2.8, yT, 4.3, yT, { color: C.red, dash: "dash", width: 0.75 });
  line(s, 4.2, yT, 4.2, yP, { color: C.red, width: 1.5, begin: "triangle", end: "triangle" });
  T(s, "差 152.94", { x: 3.7, y: yP + 0.05, w: 1.0, h: 0.26, fontSize: 9.5, bold: true, color: C.red, align: "center" });
  T(s, "単位：kWh/m²（年間）", { x: 0.65, y: 6.55, w: 4, h: 0.26, fontSize: 9, color: C.muted });

  // 右：式への代入
  const steps = [
    ["① 誤差", "e ＝ ŷ − y ＝ 861.26 − 1,014.20 ＝ −152.94", "マイナス＝SEBEより低く予測した"],
    ["② 絶対誤差", "|e| ＝ |−152.94| ＝ 152.94 kWh/m²", "向きを無視した、ずれの大きさ"],
    ["③ 誤差率", "152.94 ÷ 1,014.20 × 100 ＝ 15.08 %", "正解値の大きさに対する割合"],
  ];
  steps.forEach((st, i) => {
    const y = 1.62 + i * 0.95;
    R(s, 5.05, y, 7.8, 0.85, i % 2 ? C.white : C.panel, { round: true, rr: 0.05, line: "E1E5EA" });
    T(s, st[0], { x: 5.2, y: y + 0.08, w: 1.4, h: 0.3, fontSize: 11, bold: true, color: C.teal });
    T(s, M(st[1]), { x: 6.6, y: y + 0.08, w: 6.2, h: 0.36, fontSize: 13, bold: true, color: C.navy });
    T(s, st[2], { x: 6.6, y: y + 0.48, w: 6.2, h: 0.3, fontSize: 9.5, color: C.muted });
  });
  R(s, 5.05, 4.55, 7.8, 2.35, C.navy, { round: true, rr: 0.06 });
  T(s, "④ MAE：N件の絶対誤差を平均する（検証8配置・全体平均の例）", { x: 5.25, y: 4.63, w: 7.4, h: 0.3, fontSize: 11, bold: true, color: C.orange });
  T(s, ML([
    "MAE ＝ (1/N) Σ_{j=1}^{N} |ŷ_{j} − y_{j}|",
    "　　＝ ( |e_{1}| ＋ |e_{2}| ＋ … ＋ |e_{8}| ) / 8 ＝ 159.92 / 8 ＝ 19.99 kWh/m²",
    ["8件の絶対誤差の合計 159.92 は、MAE 19.99 × 8 で逆算した値", { fontSize: 9.5, color: "CADCFC", bold: false }],
    "改善率 ＝ (43.50 − 17.81) / 43.50 × 100 ＝ 59.1 %（局所改良の例）",
  ]), { x: 5.25, y: 5.0, w: 7.45, h: 1.85, fontSize: 11.5, bold: true, color: C.white, lineSpacingMultiple: 1.25 });
  s.addNotes("誤差の式に代表値を入れた例です。A=35m・D=15mの30〜40m帯では、SEBEが1,014.20、予測が861.26なので、誤差は−152.94、誤差率は15.08%です。MAEはこの絶対誤差をN件分平均したもので、検証8配置では合計159.92を8で割って19.99です。");
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
  poly(s, [Pj(-110, -110, 0), Pj(120, -110, 0), Pj(120, 110, 0), Pj(-110, 110, 0)], { fill: "E6EAEF" });
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
  T(s, M("西の建物\nA_{西}・D_{西}"), { x: 0.6, y: 2.75, w: 1.3, h: 0.45, fontSize: 9, bold: true, color: C.teal });
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
// 28: s_i の理由
// =====================================================================
{
  const s = std(next(), 6, "建物の有無を 0/1 の変数 sᵢ で表す理由", "「建物がない」ことを、高さや距離の数値ではなく、別の変数で明示する。");
  // 例：4つの配置パターン
  const pats = [[1, 1, 1, 1], [0, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]];
  const pl = ["4棟", "南だけ1棟", "東・南の2棟", "0棟（周囲なし）"];
  pats.forEach((p, j) => {
    const x = 0.5 + j * 3.1, y = 1.62;
    R(s, x, y, 2.95, 1.95, C.panel, { round: true, rr: 0.06 });
    const cx = x + 0.95, cy = y + 0.95, u = 0.3;
    R(s, cx - u / 2, cy - u / 2, u, u, C.navy);
    const pos = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 北 東 南 西
    pos.forEach((q, i) => {
      const bx = cx + q[0] * 0.5 - u / 2, by = cy + q[1] * 0.5 - u / 2;
      if (p[i]) R(s, bx, by, u, u, C.teal); else R(s, bx, by, u, u, C.white, { line: C.faint, dash: "dash" });
    });
    T(s, pl[j], { x: x + 1.75, y: y + 0.2, w: 1.15, h: 0.5, fontSize: 10.5, bold: true, color: C.navy });
    T(s, M(`s ＝ (${p.join(", ")})`), { x: x + 1.75, y: y + 0.75, w: 1.2, h: 0.28, fontSize: 9.5, bold: true, color: C.dorange });
    T(s, M(`n ＝ Σ s_{i} ＝ ${p.reduce((a, b) => a + b, 0)}`), { x: x + 1.75, y: y + 1.05, w: 1.2, h: 0.28, fontSize: 9.5, color: C.text });
    T(s, "(北, 東, 南, 西)", { x: x + 1.75, y: y + 1.35, w: 1.2, h: 0.25, fontSize: 8, color: C.muted });
  });
  const rs = [
    ["建物がないとき、A と D に入れる値がない", "A＝0（高さ0の建物）やD＝∞（無限に遠い建物）で代用すると、学習範囲（A 25〜100m, D 10〜100m）の外の値を扱うことになり、補間やモデルがその値を「近い条件」と誤って扱うおそれがある。"],
    ["0〜4棟のどれでも、同じ17個の変数で表せる", "入力の長さが棟数で変わらないので、ツールの画面・保存形式・予測モデルに同じ形で渡せる。s＝0の棟の A・D・θ は計算で使わない。"],
    ["「ある建物の分だけ足す」を式で書ける", "例：Σ_{i} s_{i} · ΔY^{(i)} と書けば、s_{i}＝0 の建物の項は自動的に0になる。棟数 n ＝ Σ s_{i} も計算できる。"],
    ["0/1 は中間の値に意味がない → 補間の難しさにつながる", "s＝0.5 の建物は存在しないので、s の方向には補間できない。有無の組み合わせ 2^{4}＝16通りごとに分けて扱う必要がある（次のパート）。"],
  ];
  rs.forEach((r, i) => {
    const x = 0.5 + (i % 2) * 6.2, y = 3.8 + Math.floor(i / 2) * 1.58;
    R(s, x, y, 6.0, 1.45, i === 3 ? C.peach : C.white, { round: true, rr: 0.06, line: "DCE1E7" });
    circleNum(s, x + 0.15, y + 0.15, i + 1, i === 3 ? C.dorange : C.teal);
    T(s, r[0], { x: x + 0.6, y: y + 0.12, w: 5.3, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
    T(s, M(r[1]), { x: x + 0.6, y: y + 0.47, w: 5.3, h: 0.95, fontSize: 9.5, color: C.text });
  });
  s.addNotes("建物がない場合、AやDには入れるべき値がありません。A=0やDを大きな値にすると範囲外の値を扱うことになるので、有無を0と1の変数sで分けます。これで0〜4棟のどれでも同じ17個の変数で表せ、式でもsを掛ければない建物の項が消えます。ただし0と1の間は補間できないため、有無の組み合わせごとに分ける必要があり、これが線形補間の難しさの一つになります。");
}

// =====================================================================
// 29: 4方向版
// =====================================================================
{
  const s = std(next(), 6, "来週の対象：方位を北・東・南・西に固定した「4方向版」", "最終目標（17変数）へ一度に進まず、方位 θ と中央の高さを固定して、線形補間が使えるかを確かめる。");
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
    ["項目", "第一段階（完成）", "4方向版（来週）", "最終目標"],
    ["周囲の棟数", "1棟", "0〜4棟", "0〜4棟"],
    ["置く方位", "南のみ", "北・東・南・西に固定", "任意（0〜360°）"],
    ["中央建物", "50m角・高さ50m", "50m角・高さ50m", "高さ 25〜100m"],
    ["変える変数", { t: "A, D（2個）", o: { bold: true } }, { t: "s, A, D × 4方向（12個）", o: { bold: true, color: C.dorange } }, { t: "中央高さ＋(s, A, D, θ)×4（17個）", o: { bold: true } }],
    ["出力", "南面 × 5帯 ＝ 5個", "4面 × 5帯 ＝ 20個", "4面 × 5帯 ＝ 20個"],
    ["予測方法", "線形補間（完成）", "線形補間を試す", "未定（補間 or 代案）"],
  ], { x: 5.65, y: 1.62, w: 7.2, colW: [1.3, 1.75, 2.15, 2.0], rowH: 0.45, fs: 10, boldCol0: true });

  box(s, 5.65, 4.95, 7.2, 1.95, "段階を分ける理由", null, { fill: C.peach, tcolor: C.dorange });
  T(s, bullets([
    "4方向版の12変数で線形補間が成り立つか分かれば、17変数に広げたときの見通しが立つ",
    "方位を固定すると、各方向の1棟だけの計算は南と同じ「A・Dの2変数の格子」になり、南で作った方法をそのまま使える",
    "うまくいかない場合は、どこで（棟数・面・高さ帯）ずれるかを数値で示し、代案（空の遮られ方）へ進む根拠にする",
  ], { gap: 3 }), { x: 5.8, y: 5.33, w: 6.9, h: 1.55, fontSize: 10 });
  s.addNotes("最終目標の17変数へ一度に進むのではなく、方位を北・東・南・西に固定し、中央の高さも50mに固定した4方向版で試します。変数は各方向のs、A、Dの12個です。4方向は4棟を必ず置くという意味ではなく、各方向に0か1棟です。");
}

// =====================================================================
// 30: 難しい理由①
// =====================================================================
{
  const s = std(next(), 7, "線形補間が難しい理由①：「9点でできたなら4方向でも？」への回答", "線形補間を多変数に広げること自体は可能。問題は、完全な格子に必要な配置数が「掛け算」で増えること。");
  box(s, 0.5, 1.62, 4.2, 2.45, "南で「9点」でできた範囲", null, { fill: C.panel });
  T(s, bullets([
    "9点は局所改良版で、A 25〜50m・D 10〜25m の狭い範囲だけ",
    "A 25〜100m・D 10〜100m の全体は 4×4＝16点で作っている",
    "9点のうち4点は既存の16点。追加は5点",
    "変数は A・D の2個だけ（建物は南に1棟で固定）",
  ], { gap: 4 }), { x: 0.65, y: 2.02, w: 3.95, h: 2.0, fontSize: 10 });
  R(s, 0.5, 4.25, 4.2, 2.65, C.navy, { round: true, rr: 0.06 });
  T(s, "各方向9点ずつ（計36点）ではだめな理由", { x: 0.7, y: 4.33, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: C.orange });
  T(s, "南・東・北・西を各9配置ずつ計算しても、埋まるのは「その方向に1棟だけ」の条件。\n\n南と東に同時に置いた配置など、組み合わせの条件は1つも計算されていない。完全な格子で補間するには、組み合わせごとに格子点が必要になる。", { x: 0.7, y: 4.68, w: 3.85, h: 2.15, fontSize: 10, color: C.white });

  // 右：表と棒
  T(s, "完全な格子に必要な配置数（各変数を3段階にした場合）", { x: 5.0, y: 1.62, w: 7.8, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  const rows = [
    ["南に1棟（A, D）", 2, "9", "4"],
    ["2棟を同時に変える", 4, "81", "16"],
    ["3棟を同時に変える", 6, "729", "64"],
    ["4棟を同時に変える", 8, "6,561", "256"],
  ];
  const hx = [5.0, 7.2, 8.05, 9.0], hw = [2.15, 0.8, 0.9, 1.0];
  ["変える条件", "変数 m", "格子 3^{m}", "隅 2^{m}"].forEach((h, i) => {
    R(s, hx[i], 2.0, hw[i] - 0.03, 0.36, C.navy);
    T(s, M(h), { x: hx[i], y: 2.0, w: hw[i] - 0.03, h: 0.36, fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  });
  T(s, "配置数（対数目盛）", { x: 10.1, y: 2.03, w: 2.7, h: 0.3, fontSize: 9, color: C.muted });
  rows.forEach((r, i) => {
    const y = 2.45 + i * 0.62;
    R(s, 5.0, y, 7.85, 0.54, i % 2 ? C.white : C.panel);
    T(s, r[0], { x: 5.05, y, w: 2.1, h: 0.54, fontSize: 10, bold: true, color: C.navy, valign: "middle" });
    T(s, String(r[1]), { x: hx[1], y, w: hw[1], h: 0.54, fontSize: 11, align: "center", valign: "middle" });
    T(s, r[2], { x: hx[2], y, w: hw[2], h: 0.54, fontSize: 11, bold: true, color: C.dorange, align: "center", valign: "middle" });
    T(s, r[3], { x: hx[3], y, w: hw[3], h: 0.54, fontSize: 11, align: "center", valign: "middle" });
    const v = Math.pow(3, r[1]);
    const bw = Math.log10(v) / Math.log10(6561) * 2.6;
    R(s, 10.1, y + 0.13, bw, 0.28, i === 3 ? C.dorange : C.orange);
  });
  T(s, M("完全格子の配置数 ＝ 3^{m}（各変数3段階）。南と同じ4段階なら 4^{8}＝65,536。"), { x: 5.0, y: 4.97, w: 7.85, h: 0.28, fontSize: 10, color: C.text });

  box(s, 5.0, 5.35, 7.85, 1.55, "「近い点を探せない」のではなく「必要な点がそろわない」", null, { fill: C.peach, tcolor: C.dorange });
  T(s, M("格子がそろっていれば、入力がどの区間に入るかはすぐ探せる。問題は、8変数の1区間には隅が 2^{8}＝256 点あり、計算数を抑えて配置を減らすと、入力を囲む256点がそろわないこと。「近い点がある」ことと「補間に必要な形で点がそろっている」ことは違う。"), { x: 5.15, y: 5.73, w: 7.55, h: 1.15, fontSize: 10 });
  s.addNotes("先生からの「2変数で9点ならば4方向でもできるのでは」という質問への回答です。9点は狭い局所範囲だけで、全体は16点です。また、各方向9点ずつ計算しても、組み合わせの条件は埋まりません。4棟それぞれの高さと距離を変えると8変数になり、3段階ずつでも完全格子は6,561配置、1区間の隅は256点になります。ここでは棟の有無は固定しています。");
}

// =====================================================================
// 31: 難しい理由②
// =====================================================================
{
  const s = std(next(), 7, "線形補間が難しい理由②：有無の切り替え・影の重なり・急な変化", "配置数の多さに加えて、単純な「直線でつなぐ」「足し合わせる」が成り立たない可能性がある。");
  const cw = 4.0;
  // (1) 有無
  const x1 = 0.5;
  R(s, x1, 1.62, cw, 5.28, C.panel, { round: true, rr: 0.06 });
  circleNum(s, x1 + 0.15, 1.75, 1, C.teal);
  T(s, "有無 s は補間できない", { x: x1 + 0.6, y: 1.75, w: 3.3, h: 0.34, fontSize: 12.5, bold: true, color: C.navy });
  T(s, M("s は0か1だけ。有無の組み合わせ 2^{4}＝16通りごとに、別々の格子が必要になる。"), { x: x1 + 0.15, y: 2.2, w: cw - 0.3, h: 0.65, fontSize: 10 });
  table(s, [
    ["棟数 n", "有無の組数", "各3段階の格子"],
    ["0", "1", "1"],
    ["1", "4", "4 × 9 ＝ 36"],
    ["2", "6", "6 × 81 ＝ 486"],
    ["3", "4", "4 × 729 ＝ 2,916"],
    ["4", "1", "6,561"],
    [{ t: "合計", o: { bold: true } }, "16", { t: "10,000", o: { bold: true, color: C.dorange } }],
  ], { x: x1 + 0.15, y: 2.95, w: cw - 0.3, colW: [0.9, 1.1, 1.7], rowH: 0.3, fs: 9.5 });
  T(s, M("合計 ＝ Σ_{n=0}^{4} C(4,n)·9^{n} ＝ (1＋9)^{4} ＝ 10,000 配置（方位・中央高さ固定の4方向版でも）"), { x: x1 + 0.15, y: 5.2, w: cw - 0.3, h: 0.7, fontSize: 9.5, bold: true, color: C.dorange });
  T(s, "※ 格子の完全版を作る場合の数。すべての方法がこの数を必要とするわけではない。", { x: x1 + 0.15, y: 6.1, w: cw - 0.3, h: 0.6, fontSize: 8.5, color: C.muted });

  // (2) 影の重なり
  const x2 = 4.67;
  R(s, x2, 1.62, cw, 5.28, C.panel, { round: true, rr: 0.06 });
  circleNum(s, x2 + 0.15, 1.75, 2, C.teal);
  T(s, "影は単純に足せない", { x: x2 + 0.6, y: 1.75, w: 3.3, h: 0.34, fontSize: 12.5, bold: true, color: C.navy });
  T(s, "複数の建物が同じ光を重ねて遮るため、1棟ずつの効果の合計にはならない。", { x: x2 + 0.15, y: 2.2, w: cw - 0.3, h: 0.65, fontSize: 10 });
  s.addShape(pres.shapes.OVAL, { x: x2 + 0.45, y: 3.0, w: 2.0, h: 1.75, fill: { color: C.orange, transparency: 45 }, line: { color: C.dorange, width: 1 } });
  s.addShape(pres.shapes.OVAL, { x: x2 + 1.55, y: 3.0, w: 2.0, h: 1.75, fill: { color: C.teal, transparency: 50 }, line: { color: C.teal, width: 1 } });
  T(s, "建物1の影\n40%", { x: x2 + 0.5, y: 3.55, w: 1.05, h: 0.6, fontSize: 10, bold: true, color: C.navy, align: "center" });
  T(s, "建物2の影\n30%", { x: x2 + 2.45, y: 3.55, w: 1.05, h: 0.6, fontSize: 10, bold: true, color: C.navy, align: "center" });
  T(s, "重なり\n20%", { x: x2 + 1.55, y: 3.55, w: 0.9, h: 0.6, fontSize: 9.5, bold: true, color: C.white, align: "center" });
  R(s, x2 + 0.15, 4.95, cw - 0.3, 0.6, C.white, { round: true, rr: 0.05 });
  T(s, "2棟同時の影 ＝ 40 ＋ 30 − 20 ＝ 50%（70%ではない）", { x: x2 + 0.2, y: 4.95, w: cw - 0.4, h: 0.6, fontSize: 10.5, bold: true, color: C.dorange, align: "center", valign: "middle" });
  T(s, "数値は説明用の仮定。方位や高さが変わると重なり方も変わるので、1棟モデルを合成するには重なりの扱いと検証が必要。", { x: x2 + 0.15, y: 5.7, w: cw - 0.3, h: 1.1, fontSize: 9, color: C.muted });

  // (3) 急な変化
  const x3 = 8.84;
  R(s, x3, 1.62, cw, 5.28, C.panel, { round: true, rr: 0.06 });
  circleNum(s, x3 + 0.15, 1.75, 3, C.teal);
  T(s, "区間の中で直線的に変わらない", { x: x3 + 0.6, y: 1.75, w: 3.35, h: 0.34, fontSize: 12.5, bold: true, color: C.navy });
  T(s, "ある高さを境に光が届く・届かないが切り替わる。格子点の間を直線でつなぐと、その変化を表せない。", { x: x3 + 0.15, y: 2.2, w: cw - 0.3, h: 0.65, fontSize: 10 });
  const gx = x3 + 0.55, gy = 4.75, gw = 3.1, gh = 1.7;
  R(s, gx, gy - gh, gw, gh, C.white);
  line(s, gx, gy, gx + gw, gy, { color: C.muted }); line(s, gx, gy, gx, gy - gh, { color: C.muted });
  // 実際（仮想）の曲線：S字
  const curve = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; const yv = 0.15 + 0.7 / (1 + Math.exp((t - 0.5) * 14)); curve.push([gx + t * gw, gy - yv * gh]); }
  for (let i = 0; i < curve.length - 1; i++) line(s, curve[i][0], curve[i][1], curve[i + 1][0], curve[i + 1][1], { color: C.teal, width: 2 });
  line(s, curve[0][0], curve[0][1], curve[24][0], curve[24][1], { color: C.dorange, width: 1.5, dash: "dash" });
  dot(s, curve[0][0], curve[0][1], 0.13, C.navy, "RECTANGLE"); dot(s, curve[24][0], curve[24][1], 0.13, C.navy, "RECTANGLE");
  T(s, "南側建物の高さ A →", { x: gx, y: gy + 0.03, w: gw, h: 0.24, fontSize: 8.5, color: C.muted, align: "right" });
  T(s, "壁のある帯の日射量", { x: gx, y: gy - gh - 0.27, w: 2.2, h: 0.24, fontSize: 8.5, color: C.muted });
  T(s, "━ 実際の変化（イメージ）", { x: x3 + 0.15, y: 4.98, w: 3.6, h: 0.24, fontSize: 9, bold: true, color: C.teal });
  T(s, "┅ 格子点2つを直線でつないだ補間", { x: x3 + 0.15, y: 5.22, w: 3.6, h: 0.24, fontSize: 9, bold: true, color: C.dorange });
  T(s, "実例：南面では、南側建物の屋根付近の30〜40m帯で誤差が最大（15.08%）。細かい格子の追加で改善したが、変数が増えると追加する配置数も増えやすい。", { x: x3 + 0.15, y: 5.55, w: cw - 0.3, h: 1.25, fontSize: 9, color: C.muted });
  s.addNotes("さらに3つの理由があります。1つ目は、有無のsは0か1なので補間できず、有無の組み合わせ16通りごとに格子が必要になることです。3段階ずつなら合計10,000配置です。2つ目は、影が重なるので1棟ずつの効果を単純に足せないことです。3つ目は、屋根付近のように急に変わる場所では直線の補間が合わないことです。ただし、これらが実際にどれくらい誤差になるかはまだ計算していないので、来週数値で確かめます。");
}

// =====================================================================
// 32: 来週の検証計画① 方法とデータ
// =====================================================================
{
  const s = std(next(), 7, "来週の検証計画①：1棟ずつの効果を補間し、足し合わせる方法を試す", "4方向ではまだ線形補間を行っていない。完全格子（10,000配置）の代わりに、次の方法とデータで使えるかを確かめる。");
  // 考え方の図（式のイメージ）
  R(s, 0.5, 1.62, 12.35, 1.95, C.panel, { round: true, rr: 0.06 });
  T(s, "考え方：建物がないときの値から、置いた建物それぞれの「減る量」を引く（重ね合わせの仮定）", { x: 0.65, y: 1.68, w: 12, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  const mini = (x, y, arr, label, sub) => {
    const u = 0.26, cx = x + 0.55, cy = y + 0.55;
    R(s, cx - u / 2, cy - u / 2, u, u, C.navy);
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach((q, i) => {
      const bx = cx + q[0] * 0.42 - u / 2, by = cy + q[1] * 0.42 - u / 2;
      if (arr[i]) R(s, bx, by, u, u, C.teal); else R(s, bx, by, u, u, C.white, { line: "C9D0D8", dash: "dash" });
    });
    T(s, M(label), { x: x + 1.25, y: y + 0.2, w: 1.35, h: 0.35, fontSize: 12, bold: true, color: C.dorange });
    T(s, sub, { x: x + 1.25, y: y + 0.55, w: 1.45, h: 0.5, fontSize: 8.5, color: C.muted });
  };
  mini(0.7, 2.1, [0, 1, 1, 0], "Ŷ", "東・南に2棟\n（知りたい値）");
  T(s, "≒", { x: 3.25, y: 2.3, w: 0.4, h: 0.5, fontSize: 22, bold: true, color: C.navy, align: "center" });
  mini(3.75, 2.1, [0, 0, 0, 0], "Y^{0}", "建物なし\n（SEBE 1配置）");
  T(s, "−", { x: 6.35, y: 2.3, w: 0.4, h: 0.5, fontSize: 22, bold: true, color: C.navy, align: "center" });
  mini(6.85, 2.1, [0, 0, 1, 0], "ΔŶ^{(南)}", "南だけの効果\n（南の格子で補間）");
  T(s, "−", { x: 9.45, y: 2.3, w: 0.4, h: 0.5, fontSize: 22, bold: true, color: C.navy, align: "center" });
  mini(9.95, 2.1, [0, 1, 0, 0], "ΔŶ^{(東)}", "東だけの効果\n（東の格子で補間）");
  T(s, "各方向の「1棟だけ」は南と同じ A・D の2変数なので、南で確かめた双線形補間が使える。", { x: 0.7, y: 3.2, w: 12, h: 0.3, fontSize: 10, color: C.teal, bold: true });

  // 学習データ
  T(s, "学習用（補間用）データ：SEBEで計算する配置", { x: 0.5, y: 3.75, w: 6.3, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  table(s, [
    ["種類", "配置", "数", "状況"],
    ["建物なし", "周囲0棟", "1", "新規"],
    ["南だけ1棟", "A 25・50・75・100 × D 10・25・50・100", "16", { t: "既存を再利用", o: { color: C.green, bold: true } }],
    ["東だけ1棟", "同じ4×4格子", "16", "新規"],
    ["北だけ1棟", "同じ4×4格子", "16", "新規"],
    ["西だけ1棟", "同じ4×4格子", "16", "新規"],
    [{ t: "合計", o: { bold: true } }, "", { t: "65", o: { bold: true, color: C.dorange } }, { t: "新規 49", o: { bold: true, color: C.dorange } }],
  ], { x: 0.5, y: 4.1, w: 6.3, colW: [1.25, 3.0, 0.55, 1.5], rowH: 0.3, fs: 9.5, boldCol0: true });
  T(s, "時間が足りない場合は、各方向 3×3＝9配置（A 25・50・100 × D 10・25・100、南の16点に含まれる）に減らす。", { x: 0.5, y: 6.3, w: 6.3, h: 0.55, fontSize: 9, color: C.muted });

  // テストデータ
  T(s, "テストデータ：学習に使わない配置（事前に決めて固定）", { x: 7.1, y: 3.75, w: 5.8, h: 0.3, fontSize: 12, bold: true, color: C.navy });
  R(s, 7.1, 4.1, 5.75, 1.25, C.tealL, { round: true, rr: 0.06 });
  T(s, [{ text: "テストA：1棟だけ（東・北・西 各2）＝ 6配置", options: { bold: true, color: C.teal, breakLine: true } }, { text: "→ 各方向の補間そのものの誤差を見る（南は確認済み）", options: {} }], { x: 7.25, y: 4.18, w: 5.5, h: 1.1, fontSize: 10 });
  R(s, 7.1, 5.45, 5.75, 1.45, C.peach, { round: true, rr: 0.06 });
  T(s, [{ text: "テストB：2〜4棟を同時に置く ＝ 12配置", options: { bold: true, color: C.dorange, breakLine: true } }, { text: "2棟6・3棟3・4棟3。A・D は格子点と重ならない値を乱数で選ぶ（シードを先に固定）", options: { breakLine: true } }, { text: "→ 足し合わせ（重ね合わせ）の誤差を見る", options: {} }], { x: 7.25, y: 5.53, w: 5.5, h: 1.3, fontSize: 10 });
  s.addNotes("来週試す方法です。4方向ではまだ線形補間を行っていません。建物なしの値から、置いた建物それぞれの減る量を引くという重ね合わせを仮定します。各方向の1棟だけの効果は、南と同じAとDの格子で補間できます。学習用に建物なし1配置と各方向16配置、合計65配置を使い、南の16配置は再利用するので新規は49配置です。テストは1棟だけの6配置と、2〜4棟を同時に置く12配置で、補間の誤差と足し合わせの誤差を分けて見ます。");
}

// =====================================================================
// 33: 来週の検証計画② 式
// =====================================================================
{
  const s = std(next(), 7, "来週の検証計画②：4方向の場合に想定している計算式", "南1棟の式（4隅の重み付き和）を、方向ごと・面ごとに使い、有る建物の分だけ引く。まだ計算していないので、値は入れていない。");
  R(s, 0.5, 1.62, 7.35, 3.85, C.navy, { round: true, rr: 0.06 });
  T(s, "記号：面 f ∈ {北, 東, 南, 西}，帯 k ＝ 1,…,5，方向 i ∈ {北, 東, 南, 西}", { x: 0.7, y: 1.7, w: 7.0, h: 0.28, fontSize: 10, color: "CADCFC" });
  const eq = [
    ["① 1棟だけの効果（SEBEで計算）", "ΔY^{(i)}_{f,k}(A_{c}, D_{c}) ＝ Y^{0}_{f,k} − Y^{(i)}_{f,k}(A_{c}, D_{c})"],
    ["② 格子の間は南と同じ双線形補間", "ΔŶ^{(i)}_{f,k}(A_{i}, D_{i}) ＝ Σ_{c=1}^{4} w_{c}(u_{i}, v_{i}) · ΔY^{(i)}_{f,k}(A_{c}, D_{c})"],
    ["③ 有る建物の分だけ引く（重ね合わせ）", "Ŷ_{f,k} ＝ Y^{0}_{f,k} − Σ_{i} s_{i} · ΔŶ^{(i)}_{f,k}(A_{i}, D_{i})"],
    ["④ 面の平均", "Ŷ_{f,平均} ＝ (1/5) Σ_{k=1}^{5} Ŷ_{f,k}　→ 1回の入力で 4面×5帯＝20個"],
  ];
  eq.forEach((e, i) => {
    const y = 2.05 + i * 0.83;
    T(s, e[0], { x: 0.7, y, w: 7, h: 0.26, fontSize: 10, bold: true, color: C.orange });
    T(s, M(e[1]), { x: 0.7, y: y + 0.28, w: 7.05, h: 0.38, fontSize: 12.5, bold: true, color: C.white });
  });

  // 計算例
  R(s, 8.1, 1.62, 4.75, 3.85, C.panel, { round: true, rr: 0.06 });
  T(s, "計算の例（想定）", { x: 8.25, y: 1.68, w: 4.5, h: 0.3, fontSize: 11.5, bold: true, color: C.navy });
  T(s, M("入力：s ＝ (s_{北}, s_{東}, s_{南}, s_{西}) ＝ (0, 1, 1, 0)"), { x: 8.25, y: 2.0, w: 4.5, h: 0.28, fontSize: 10, bold: true, color: C.dorange });
  T(s, "南 A＝55.9m・D＝14m，東 A＝40m・D＝30m", { x: 8.25, y: 2.28, w: 4.5, h: 0.28, fontSize: 10, bold: true, color: C.dorange });
  table(s, [
    ["", "南（50〜75, 10〜25）", "東（25〜50, 25〜50）"],
    ["u, v", "0.236, 0.267", "0.6, 0.2"],
    ["w₁ ＝ (1−u)(1−v)", "0.560", "0.32"],
    ["w₂ ＝ u(1−v)", "0.173", "0.48"],
    ["w₃ ＝ (1−u)v", "0.204", "0.08"],
    ["w₄ ＝ uv", "0.063", "0.12"],
  ], { x: 8.25, y: 2.65, w: 4.45, colW: [1.45, 1.5, 1.5], rowH: 0.28, fs: 9, boldCol0: true });
  T(s, M("Ŷ_{南面,k} ＝ Y^{0}_{南面,k} − ΔŶ^{(南)}_{南面,k} − ΔŶ^{(東)}_{南面,k}"), { x: 8.25, y: 4.45, w: 4.5, h: 0.3, fontSize: 10.5, bold: true, color: C.navy });
  T(s, "北・西は s＝0 なので項が0。Y・ΔY の値は SEBE 計算後に入れる。", { x: 8.25, y: 4.8, w: 4.5, h: 0.55, fontSize: 9, color: C.muted });

  // 参考：多次元の線形補間
  R(s, 0.5, 5.62, 12.35, 1.28, C.peach, { round: true, rr: 0.06 });
  T(s, "参考：重ね合わせを使わず、そのまま多次元に広げた線形補間（完全格子が必要）", { x: 0.7, y: 5.68, w: 12, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, M("Ŷ(x) ＝ Σ_{隅c} [ Π_{j=1}^{m} (u_{j} または 1−u_{j}) ] · Y(隅c)"), { x: 0.7, y: 6.0, w: 7.2, h: 0.38, fontSize: 12.5, bold: true, color: C.navy });
  T(s, M("m＝2（南1棟）→ 隅4点 ＝ 前ページまでの式。m＝8（4棟）→ 隅 2^{8}＝256点。有無の16通りごとに格子が必要。"), { x: 0.7, y: 6.4, w: 12, h: 0.45, fontSize: 9.5, color: C.text });
  T(s, M("u_{j}：j番目の変数の区間内の位置。隅cがその変数の上側なら u_{j}、下側なら 1−u_{j} を掛ける"), { x: 8.0, y: 5.98, w: 4.75, h: 0.45, fontSize: 9.5, color: C.muted });
  s.addNotes("想定している計算式です。まず1棟だけの効果を、建物なしの値との差としてSEBEで求めます。格子の間は南と同じ双線形補間で求め、有る建物の分だけ引きます。例として南と東に建物がある場合、南の重みは前と同じ、東は40mと30mなので0.32、0.48、0.08、0.12になります。北と西はs=0なので項が消えます。実際の値はSEBE計算後に入れます。");
}

// =====================================================================
// 例C：4方向の式への代入（想定）
// =====================================================================
{
  const s = std(next(), 7, "計算例③：南と東に建物がある場合の「南面・帯1」を式で追う（想定）", "入力 s＝(北0, 東1, 南1, 西0)，南 A＝55.9m・D＝14m，東 A＝40m・D＝30m。東の値は来週のSEBE計算で入るので □ で示す。");
  // Step 1 南
  R(s, 0.5, 1.62, 6.1, 2.95, C.panel, { round: true, rr: 0.06 });
  circleNum(s, 0.65, 1.72, 1, C.teal);
  T(s, "南の建物の効果（南の値は保存済み）", { x: 1.1, y: 1.72, w: 5.4, h: 0.32, fontSize: 11.5, bold: true, color: C.navy });
  T(s, ML([
    "ΔŶ^{(南)}_{南面,1} ＝ Σ_{c=1}^{4} w_{c} · ( Y^{0}_{南面,1} − Y^{(南)}_{南面,1}(c) )",
    "　＝ Y^{0} × (0.560＋0.173＋0.204＋0.063)",
    "　　− (0.560×337.34 ＋ 0.173×319.89",
    "　　　 ＋ 0.204×589.57 ＋ 0.063×535.49)",
    ["　＝ Y^{0}_{南面,1} × 1 − 398.18", { color: C.dorange }],
  ]), { x: 0.7, y: 2.1, w: 5.8, h: 1.65, fontSize: 10.5, bold: true, color: C.navy, lineSpacingMultiple: 1.15 });
  T(s, "398.18 は南1棟だけの現在の予測値（計算過程②と同じ）。重みの合計が1なので Y⁰ がそのまま残る。", { x: 0.7, y: 3.75, w: 5.8, h: 0.75, fontSize: 9.5, color: C.muted });

  // Step 2 東
  R(s, 6.85, 1.62, 6.0, 2.95, C.panel, { round: true, rr: 0.06 });
  circleNum(s, 7.0, 1.72, 2, C.teal);
  T(s, "東の建物の効果（来週SEBEで計算）", { x: 7.45, y: 1.72, w: 5.3, h: 0.32, fontSize: 11.5, bold: true, color: C.navy });
  T(s, ML([
    "A＝40 → 25〜50m の間：u ＝ (40−25)/25 ＝ 0.6",
    "D＝30 → 25〜50m の間：v ＝ (30−25)/25 ＝ 0.2",
    "ΔŶ^{(東)}_{南面,1} ＝ 0.32×ΔY(25,25) ＋ 0.48×ΔY(50,25)",
    "　　　　　　　 ＋ 0.08×ΔY(25,50) ＋ 0.12×ΔY(50,50)",
  ]), { x: 7.05, y: 2.15, w: 5.7, h: 1.55, fontSize: 10.5, bold: true, color: C.navy, lineSpacingMultiple: 1.25 });
  T(s, "重み：(1−0.6)(1−0.2)＝0.32，0.6×0.8＝0.48，0.4×0.2＝0.08，0.6×0.2＝0.12（合計1）。ΔY(A, D) は「東だけ1棟」の配置で南面・帯1が減る量 → □", { x: 7.05, y: 3.75, w: 5.7, h: 0.75, fontSize: 9.5, color: C.muted });

  // Step 3 合成
  R(s, 0.5, 4.75, 12.35, 2.15, C.navy, { round: true, rr: 0.06 });
  circleNum(s, 0.65, 4.85, 3, C.orange);
  T(s, "足し合わせて南面・帯1の予測値にする", { x: 1.1, y: 4.85, w: 8, h: 0.32, fontSize: 11.5, bold: true, color: C.orange });
  T(s, ML([
    "Ŷ_{南面,1} ＝ Y^{0}_{南面,1} − s_{南}·ΔŶ^{(南)} − s_{東}·ΔŶ^{(東)} − s_{北}·ΔŶ^{(北)} − s_{西}·ΔŶ^{(西)}",
    "　　　＝ Y^{0} − 1×(Y^{0} − 398.18) − 1×ΔŶ^{(東)}_{南面,1} − 0 − 0",
    ["　　　＝ 398.18 − ΔŶ^{(東)}_{南面,1} ＝ 398.18 − □", { color: C.orange }],
  ]), { x: 1.1, y: 5.25, w: 8.3, h: 1.55, fontSize: 12, bold: true, color: C.white, lineSpacingMultiple: 1.3 });
  R(s, 9.6, 5.0, 3.05, 1.7, C.navy2, { round: true, rr: 0.06 });
  T(s, bullets([
    "南だけなら、今のツールの予測398.18と一致する",
    "東の建物で減る量 □ を引く",
    "同じ計算を4面×5帯＝20回",
  ], { gap: 4 }), { x: 9.72, y: 5.08, w: 2.85, h: 1.55, fontSize: 9.5, color: C.white });
  s.addNotes("式に代表値を入れた想定の例です。南の効果は、重みの合計が1なので、建物なしの値Y0から、今の南1棟の予測398.18を引いた形になります。東の効果は重み0.32、0.48、0.08、0.12で東だけの配置の値を補間します。まとめると、南面・帯1の予測は398.18から東の建物で減る量を引いた値になります。東の値は来週SEBEで計算するので、ここでは□にしています。");
}
// =====================================================================
// 34: 来週示す数値と判断
// =====================================================================
{
  const s = std(next(), 7, "来週の検証計画③：数値で示すことと、その後の判断", "結果はまだ出ていない。次の研究室で、以下の数値を表にして示す。判断の基準は結果を見る前に決めておく。");
  table(s, [
    ["確かめること", "使うデータ", "示す数値"],
    ["各方向の1棟補間は、南と同程度に当たるか", "テストA 6配置 × 4面 × 5帯", "MAE・平均誤差率・最大誤差率（参考：南のテスト12配置は MAE 18.40・2.42%）"],
    ["足し合わせ（重ね合わせ）は成り立つか", "テストB 12配置", "棟数 n＝2, 3, 4 ごとの MAE・最大誤差率"],
    ["どこでずれるか", "テストB 12配置", "面 × 帯ごとの誤差、隣り合う2棟（例：東と南）の場合の誤差"],
    ["必要な計算量", "—", "新規SEBE 49配置（完全格子なら 10,000配置）"],
  ], { x: 0.5, y: 1.62, w: 12.35, colW: [3.3, 2.75, 6.3], rowH: 0.5, fs: 10, boldCol0: true, align: ["left", "center", "left"] });

  // 判断フロー
  R(s, 0.5, 4.35, 3.6, 2.55, C.navy, { round: true, rr: 0.06 });
  T(s, "来週の結果", { x: 0.7, y: 4.45, w: 3.2, h: 0.3, fontSize: 12, bold: true, color: C.orange });
  T(s, "テストA・Bの誤差を、棟数・面・帯ごとに整理する", { x: 0.7, y: 4.85, w: 3.2, h: 0.8, fontSize: 10.5, color: C.white });
  T(s, "判断の基準（例：平均誤差率○%以内）は、結果を見る前に先生と相談して決めたい", { x: 0.7, y: 5.7, w: 3.2, h: 1.1, fontSize: 9.5, color: "CADCFC" });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 4.2, y: 4.65, w: 0.55, h: 0.45, fill: { color: C.green }, line: { type: "none" } });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 4.2, y: 6.0, w: 0.55, h: 0.45, fill: { color: C.red }, line: { type: "none" } });
  R(s, 4.85, 4.35, 8.0, 1.2, C.greenL, { round: true, rr: 0.06 });
  T(s, "棟数が増えても誤差が大きくならず、南と同程度の場合", { x: 5.05, y: 4.42, w: 7.6, h: 0.3, fontSize: 11, bold: true, color: C.green });
  T(s, "→ 4方向版は「線形補間＋重ね合わせ」で作る。次に中央の高さ・任意方位へ広げる方法を検討する。", { x: 5.05, y: 4.78, w: 7.6, h: 0.7, fontSize: 10 });
  R(s, 4.85, 5.7, 8.0, 1.2, C.redL, { round: true, rr: 0.06 });
  T(s, "棟数とともに誤差が大きくなる／特定の面・帯で大きくずれる場合", { x: 5.05, y: 5.77, w: 7.6, h: 0.3, fontSize: 11, bold: true, color: C.red });
  T(s, "→ 影の重なりが原因かを調べ、重なりを補正する方法か、代案「空の遮られ方」（次ページ）へ進む。", { x: 5.05, y: 6.13, w: 7.6, h: 0.7, fontSize: 10 });
  s.addNotes("来週示す数値の一覧です。1棟だけのテストで補間そのものの誤差を、2〜4棟のテストで足し合わせの誤差を見ます。棟数ごとに誤差を並べることで、重なりが問題になっているかが分かります。判断の基準は結果を見る前に決めたいので、ご意見をいただきたいです。");
}

// =====================================================================
// 35: 代案 概念
// =====================================================================
{
  const s = std(next(), 8, "代案：空の遮られ方を使う方法（概要）", "配置の変数を直接使わず、「壁の点から見て、どの方向の空が建物でふさがれているか」に変換してから予測する。");
  // 断面図
  R(s, 0.5, 1.62, 6.1, 5.28, C.panel, { round: true, rr: 0.06 });
  T(s, "横から見た図：壁の1点から空を見上げる", { x: 0.65, y: 1.68, w: 5.8, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const k = 0.052, gx = 1.0, gy = 5.95; // 地面 y, 南側建物左端 x
  const X = m => gx + (m + 75) * k; // m: 南側建物の左端を -75
  const Z = m => gy - m * k;
  line(s, 0.7, gy, 6.4, gy, { color: C.muted, width: 1 });
  R(s, X(-75), Z(35), 50 * k, 35 * k, C.teal); // 南側建物 -75〜-25
  T(s, "南側建物\n高さ35m", { x: X(-75), y: Z(35) + 0.5, w: 50 * k, h: 0.5, fontSize: 9, bold: true, color: C.white, align: "center" });
  R(s, X(0), Z(50), 0.9, 50 * k, C.navy); // 中央建物
  T(s, "中央\n建物", { x: X(0), y: Z(30), w: 0.9, h: 0.5, fontSize: 9, bold: true, color: C.white, align: "center" });
  const pz = 20, P0 = [X(0), Z(pz)];
  dot(s, P0[0], P0[1], 0.16, C.orange);
  T(s, "点P（南面・\n帯2の代表点）", { x: X(0) + 0.95, y: Z(pz) - 0.2, w: 1.2, h: 0.45, h: 0.24, fontSize: 8.5, bold: true, color: C.dorange });
  const hAng = Math.atan((35 - pz) / 25) * 180 / Math.PI;
  [8, 20, 45, 62, 78].forEach(e => {
    const r = e * Math.PI / 180;
    if (e < hAng) {
      const hz = pz + 25 * Math.tan(r);
      line(s, P0[0], P0[1], X(-25), Z(hz), { color: C.red, width: 1.25, end: "oval" });
    } else {
      const L = 2.3;
      line(s, P0[0], P0[1], P0[0] - L * Math.cos(r), P0[1] - L * Math.sin(r), { color: C.green, width: 1.25, end: "triangle" });
    }
  });
  const hr = hAng * Math.PI / 180;
  line(s, P0[0], P0[1], P0[0] - 2.1 * Math.cos(hr), P0[1] - 2.1 * Math.sin(hr), { color: C.navy, width: 1, dash: "dash" });
  T(s, `遮蔽高度角 h ≒ ${hAng.toFixed(0)}°`, { x: 2.85, y: 3.55, w: 1.8, h: 0.24, fontSize: 9, bold: true, color: C.navy });
  T(s, "━ 空が見える方向", { x: 0.7, y: 2.05, w: 2.0, h: 0.24, fontSize: 9, bold: true, color: C.green });
  T(s, "━ 建物でふさがれた方向", { x: 0.7, y: 2.3, w: 2.3, h: 0.24, fontSize: 9, bold: true, color: C.red });
  T(s, "tan h ＝ (35 − 20) / 25 → h ≒ 31°（真南の方向の場合）", { x: 0.7, y: 6.3, w: 5.8, h: 0.5, fontSize: 9, color: C.muted });

  // 空の地図
  R(s, 6.8, 1.62, 6.05, 3.55, C.panel, { round: true, rr: 0.06 });
  T(s, "点Pから見た「空の地図」（方向ごとのマス）", { x: 6.95, y: 1.68, w: 5.8, h: 0.28, fontSize: 11, bold: true, color: C.navy });
  const mx = 7.55, my = 2.1, cw = 0.38, ch = 0.36, nA = 12, nE = 6;
  for (let a = 0; a < nA; a++) for (let e = 0; e < nE; e++) {
    const phi = -90 + (a + 0.5) * 15, el = (e + 0.5) * 15;
    const h1 = Math.abs(phi) <= 45 ? Math.atan(0.6 * Math.cos(phi * Math.PI / 180)) * 180 / Math.PI : -1;
    const b1 = el < h1;
    const b2 = phi >= 30 && phi <= 75 && e === 0;
    const col = b1 && b2 ? C.red : b1 ? C.orange : b2 ? C.teal : C.white;
    R(s, mx + a * cw, my + (nE - 1 - e) * ch, cw - 0.02, ch - 0.02, col, { line: "D5DAE1", lw: 0.5 });
  }
  T(s, "−90°（左）", { x: mx - 0.2, y: my + nE * ch + 0.02, w: 1.2, h: 0.24, fontSize: 8.5, color: C.muted });
  T(s, "0°（壁の正面）", { x: mx + nA * cw / 2 - 0.7, y: my + nE * ch + 0.02, w: 1.4, h: 0.24, fontSize: 8.5, color: C.muted, align: "center" });
  T(s, "＋90°（右）", { x: mx + nA * cw - 1.0, y: my + nE * ch + 0.02, w: 1.2, h: 0.24, fontSize: 8.5, color: C.muted, align: "right" });
  T(s, "高度90°", { x: 6.85, y: my, w: 0.68, h: 0.24, fontSize: 8, color: C.muted, align: "right" });
  T(s, "高度0°", { x: 6.85, y: my + nE * ch - 0.26, w: 0.68, h: 0.24, fontSize: 8, color: C.muted, align: "right" });
  const lg = [[C.orange, "建物1がふさぐ"], [C.teal, "建物2がふさぐ"], [C.red, "両方がふさぐ（1回だけ数える）"]];
  lg.forEach((l, i) => { R(s, 7.0 + [0, 1.6, 3.2][i], 4.7, 0.18, 0.18, l[0]); T(s, l[1], { x: 7.22 + [0, 1.6, 3.2][i], y: 4.64, w: [1.4, 1.4, 2.6][i], h: 0.3, fontSize: 8.5 }); });

  R(s, 6.8, 5.32, 6.05, 1.58, C.navy, { round: true, rr: 0.06 });
  T(s, "この方法の利点（期待）", { x: 7.0, y: 5.38, w: 5.7, h: 0.28, fontSize: 11, bold: true, color: C.orange });
  T(s, bullets([
    "棟数・方位がいくつでも、同じ大きさの「空の地図」になる",
    "2棟が同じ方向をふさいでも1回だけ数えるので、重なりを自然に扱える",
    "有無 s は「ふさがれたマスがあるか」に反映される",
  ], { gap: 2 }), { x: 7.0, y: 5.68, w: 5.7, h: 1.2, fontSize: 9.5, color: C.white });
  s.addNotes("線形補間でうまくいかない場合の代案です。壁の点から空を見上げ、どの方向が建物でふさがれているかを調べます。右の空の地図のように、方向をマスに分けて、ふさがれたマスを数えます。2棟が同じ方向をふさいでも1回しか数えないので、影の重なりを自然に扱えると考えています。ただし、まだ詳細は決まっていません。");
}

// =====================================================================
// 36: 代案 計算の流れ
// =====================================================================
{
  const s = std(next(), 8, "空の遮られ方：計算の流れ（入力・学習・テストのデータは同じ）", "SEBEで計算する配置とテスト配置は線形補間と共通。違うのは「配置をどう数値に変えて予測するか」。");
  const fl = [
    ["入力データ", "配置の変数\n中央高さ, s, A, D, θ", C.navy],
    ["① 遮られ方を計算", "各面・各帯の代表点から、方向ごとに建物でふさがれるか判定", C.teal],
    ["② 特徴量にまとめる", "方位ごとの遮蔽高度角 h_{j}、ふさがれた割合 O など", C.teal],
    ["③ 機械学習モデル", "特徴量 → 年間日射量（モデルの種類は未定）", C.dorange],
    ["出力", "4面 × 5帯\n＝ 20個", C.navy],
  ];
  fl.forEach((f, i) => {
    const x = 0.5 + i * 2.5, w = 2.25;
    R(s, x, 1.62, w, 1.4, f[2], { round: true, rr: 0.06 });
    T(s, f[0], { x: x + 0.1, y: 1.68, w: w - 0.2, h: 0.3, fontSize: 11, bold: true, color: C.white });
    T(s, M(f[1]), { x: x + 0.1, y: 2.0, w: w - 0.2, h: 0.95, fontSize: 9.5, color: C.white });
    if (i < fl.length - 1) s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: x + w + 0.0, y: 2.24, w: 0.26, h: 0.16, fill: { color: C.faint }, line: { type: "none" }, rotate: 90 });
  });
  // 式
  R(s, 0.5, 3.2, 6.2, 3.7, C.panel, { round: true, rr: 0.06 });
  T(s, "想定している計算（詳細は未決定）", { x: 0.65, y: 3.27, w: 5.9, h: 0.28, fontSize: 11.5, bold: true, color: C.navy });
  const eqs = [
    ["方向 j の遮蔽高度角（建物がなければ0°）", "h_{j} ＝ max_{i} arctan( (A_{i} − z) / d_{ij} )　（s_{i}＝1 の建物のみ）"],
    ["方向 j がふさがれているか", "b_{j} ＝ 1（ふさがれている）／ 0（空が見える）"],
    ["ふさがれた割合", "O ＝ (1/J) Σ_{j=1}^{J} b_{j}"],
    ["予測（モデル F を学習）", "Ŷ_{f,k} ＝ F( h_{1}, …, h_{J}, O, z, 面の向き )"],
  ];
  eqs.forEach((e, i) => {
    const y = 3.62 + i * 0.7;
    T(s, e[0], { x: 0.65, y, w: 5.9, h: 0.24, fontSize: 9.5, bold: true, color: C.teal });
    T(s, M(e[1]), { x: 0.65, y: y + 0.26, w: 5.9, h: 0.34, fontSize: 12, bold: true, color: C.navy });
  });
  T(s, M("z：点の高さ，d_{ij}：方向jで建物iまでの水平距離，J：方向のマス数。max を取るので重なりは1回だけ数える。"), { x: 0.65, y: 6.4, w: 5.9, h: 0.45, fontSize: 8.5, color: C.muted });

  table(s, [
    ["", "線形補間（重ね合わせ）", "空の遮られ方"],
    ["入力データ", "配置の変数", "同じ（内部で特徴量に変換）"],
    ["学習データ", "1棟ずつの格子 65配置", "同じSEBE結果を使える"],
    ["テストデータ", "2〜4棟の12配置など", "同じ配置で比較する"],
    ["重なりの扱い", "足し算で二重に数える可能性", "同じ方向は1回だけ"],
    ["計算の重さ", "補間だけ（軽い）", "特徴量計算＋モデル学習"],
  ], { x: 6.95, y: 3.2, w: 5.9, colW: [1.3, 2.3, 2.3], rowH: 0.36, fs: 9.5, boldCol0: true });
  R(s, 6.95, 5.5, 5.9, 1.4, C.peach, { round: true, rr: 0.06 });
  T(s, "注意", { x: 7.1, y: 5.55, w: 5.6, h: 0.28, fontSize: 11, bold: true, color: C.dorange });
  T(s, "学習の行数は「配置 × 面 × 帯」（65×20＝1,300行）に増えるが、独立した配置は65件のまま。この方法が線形補間より必ず高精度とは言えないので、同じテスト配置で比べて判断する。", { x: 7.1, y: 5.85, w: 5.6, h: 1.0, fontSize: 9.5 });
  s.addNotes("空の遮られ方の計算の流れです。入力、学習、テストのデータは線形補間と同じものを使えます。違うのは、配置を方向ごとの遮蔽高度角やふさがれた割合という特徴量に変換し、機械学習モデルで日射量を予測する点です。方向の分け方、距離の正確な扱い、モデルの種類はまだ決まっていないので、来週詰めます。");
}

// =====================================================================
// 例D：空の遮られ方の代入例
// =====================================================================
{
  const s = std(next(), 8, "計算例④：点P（南面・帯2、高さ20m）の遮られ方を数値にする", "代案の式に代表値を入れた例。建物1は南側建物（A＝35m, D＝25m）。建物2は重なりの説明用に置いた低い建物（遮蔽高度角10°と仮定）。");
  // ① h の計算
  R(s, 0.5, 1.62, 6.3, 2.75, C.panel, { round: true, rr: 0.06 });
  circleNum(s, 0.65, 1.72, 1, C.teal);
  T(s, "方向ごとの遮蔽高度角 h（建物1）", { x: 1.1, y: 1.72, w: 5.5, h: 0.32, fontSize: 11.5, bold: true, color: C.navy });
  T(s, ML([
    "正面（φ＝0°）：tan h ＝ (35 − 20) / 25 ＝ 0.600 → h ＝ 31.0°",
    "φ＝30°：d ＝ 25 / cos30° ＝ 28.87 m",
    "　　　tan h ＝ 15 / 28.87 ＝ 0.520 → h ＝ 27.5°",
    "φ＝60°：建物の横を通る（25×tan60° ＝ 43m ＞ 25m）→ h ＝ 0°",
  ]), { x: 0.7, y: 2.12, w: 6.0, h: 1.6, fontSize: 11, bold: true, color: C.navy, lineSpacingMultiple: 1.25 });
  T(s, "z＝20m（点Pの高さ），d：方向φで建物の壁までの水平距離。斜めに見るほど遠くなり、h が小さくなる。", { x: 0.7, y: 3.75, w: 6.0, h: 0.55, fontSize: 9.5, color: C.muted });

  // ② 特徴量ベクトル表
  T(s, M("② 12方位の h_{j}（max で2棟をまとめる）"), { x: 0.5, y: 4.5, w: 6.3, h: 0.3, fontSize: 11, bold: true, color: C.navy });
  const cen = [-82.5, -67.5, -52.5, -37.5, -22.5, -7.5, 7.5, 22.5, 37.5, 52.5, 67.5, 82.5];
  const h1 = [0, 0, 0, 25.5, 29.0, 30.7, 30.7, 29.0, 25.5, 0, 0, 0];
  const h2 = [0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0];
  const cw = 0.43, x0 = 1.45;
  ["方位φ", "建物1", "建物2", "h_{j}"].forEach((lb, r) => {
    T(s, M(lb), { x: 0.5, y: 4.88 + r * 0.46, w: 0.9, h: 0.42, fontSize: 9, bold: true, color: C.navy, valign: "middle" });
  });
  cen.forEach((c, j) => {
    const x = x0 + j * cw;
    const hv = Math.max(h1[j], h2[j]);
    const vals = [String(c), h1[j] ? h1[j].toFixed(1) : "0", h2[j] ? "10" : "0", hv ? hv.toFixed(1) : "0"];
    vals.forEach((t, r) => {
      const fill = r === 0 ? C.navy : r === 3 ? (hv ? C.peach : C.white) : (r === 1 && h1[j]) ? "F6D9C0" : (r === 2 && h2[j]) ? C.tealL : C.white;
      R(s, x, 4.88 + r * 0.46, cw - 0.03, 0.42, fill, { line: "DCE1E7", lw: 0.5 });
      T(s, t, { x, y: 4.88 + r * 0.46, w: cw - 0.03, h: 0.42, fontSize: r === 0 ? 7.5 : 8.5, bold: r === 3, color: r === 0 ? C.white : C.navy, align: "center", valign: "middle", margin: 0 });
    });
  });

  // ③ O の計算
  R(s, 7.05, 1.62, 5.8, 3.2, C.navy, { round: true, rr: 0.06 });
  circleNum(s, 7.2, 1.72, 3, C.orange);
  T(s, "ふさがれた割合 O（空の地図：12方位×6高度＝72マス）", { x: 7.65, y: 1.72, w: 5.1, h: 0.32, fontSize: 11, bold: true, color: C.orange });
  T(s, ML([
    "マスの中心の高度 ＜ h_{j} なら b_{j}＝1（ふさがれている）",
    "建物1：高度0〜15°の6マス ＋ 15〜30°の6マス ＝ 12マス",
    "建物2：高度0〜15°の3マス（φ＝37.5°, 52.5°, 67.5°）",
    "重なり：φ＝37.5°・高度0〜15°の1マス",
    ["O ＝ (12 ＋ 3 − 1) / 72 ＝ 14 / 72 ＝ 0.194（19.4%）", { color: C.orange }],
    ["単純に足すと 15 / 72 ＝ 20.8%（1マスを二重に数える）", { color: "CADCFC", bold: false, fontSize: 10 }],
  ]), { x: 7.25, y: 2.12, w: 5.5, h: 2.65, fontSize: 10.5, bold: true, color: C.white, lineSpacingMultiple: 1.25 });

  // ④ モデルへの入力
  R(s, 7.05, 5.0, 5.8, 1.9, C.peach, { round: true, rr: 0.06 });
  circleNum(s, 7.2, 5.1, 4, C.dorange);
  T(s, "モデルに渡す1行（南面・帯2）", { x: 7.65, y: 5.1, w: 5.1, h: 0.32, fontSize: 11, bold: true, color: C.dorange });
  T(s, ML([
    "( h_{1},…,h_{12}, O, z, 面 ) ＝ (0, 0, 0, 25.5, 29.0, 30.7,",
    "　30.7, 29.0, 25.5, 10, 10, 0, 0.194, 20m, 南)",
    "→ Ŷ_{南面,2} ＝ F(この1行)　※ F は来週決める",
  ]), { x: 7.25, y: 5.47, w: 5.5, h: 1.35, fontSize: 10.5, bold: true, color: C.navy, lineSpacingMultiple: 1.2 });
  s.addNotes("空の遮られ方の式に代表値を入れた例です。点Pの高さは20m、南側建物は高さ35m、距離25mなので、正面ではtan h = 15/25 = 0.6、h = 31°です。斜め30°では距離が28.87mになるのでh = 27.5°、60°では建物の横を通るので0°です。2棟目がある方向ではmaxを取るので、重なった方向は大きい方の角度だけが残ります。ふさがれたマスは14個で、Oは14/72=0.194です。単純に足すと15個になり、重なりを二重に数えてしまいます。建物2の10°は説明用の仮の値です。");
}
// =====================================================================
// 37: まとめ（濃色）
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  T(s, "SUMMARY", { x: 0.7, y: 0.5, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.orange, charSpacing: 2 });
  T(s, "まとめ：今回整理したことと、来週やること", { x: 0.7, y: 0.8, w: 12, h: 0.6, fontSize: 26, bold: true, color: C.white });
  const cols = [
    ["今回整理したこと", C.teal, [
      "データの役割：学習16・検証8・テスト12・追加5・局所テスト6（計47配置）",
      "計算過程：2,500区画 → 5帯の平均 → 4隅の重み付き和（Σ w × y）",
      "最終ツールの変数17個（中央高さ ＋ s, A, D, θ × 4棟）と、有無を0/1で表す理由",
      "完全格子は 3のm乗 で増え、有無16通り・影の重なりも加わる",
    ]],
    ["来週やること", C.orange, [
      "4方向版（方位・中央高さ固定、12変数）で線形補間を試す",
      "建物なし1＋各方向16＝65配置（新規49）をSEBEで計算",
      "1棟ずつ補間して足し合わせる式で20個を予測",
      "テストA 6配置・テストB 12配置でSEBEと比べ、棟数ごとの誤差を数値で示す",
    ]],
    ["まだ決めていないこと", "8FA0BC", [
      "判断の基準（誤差率何%以内なら採用するか）",
      "空の遮られ方の方向の分け方・距離の扱い・モデルの種類",
      "中央の高さ・任意方位への広げ方",
      "SEBEの計算時間に応じた配置数の調整（9点案）",
    ]],
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 4.0, w = 3.8;
    R(s, x, 1.7, w, 4.85, C.navy2, { round: true, rr: 0.06 });
    R(s, x, 1.7, w, 0.55, c[1], { round: true, rr: 0.06 });
    T(s, c[0], { x: x + 0.2, y: 1.7, w: w - 0.4, h: 0.55, fontSize: 14, bold: true, color: C.white, valign: "middle" });
    const runs = bullets(c[2], { gap: 14 });
    T(s, runs, { x: x + 0.2, y: 2.5, w: w - 0.4, h: 3.95, fontSize: 12.5, color: C.white });
  });
  T(s, "4方向の線形補間の結果は、まだ出ていない。次の研究室で数値を示し、補間を続けるか代案へ進むかを判断する。", { x: 0.7, y: 6.62, w: 11.9, h: 0.35, fontSize: 11.5, bold: true, color: C.orange });
  T(s, "壁面日射量予測ツールの開発", { x: 0.5, y: 7.13, w: 3.5, h: 0.28, fontSize: 9, color: "8FA0BC" });
  const nEnd = next();
  T(s, `${nEnd} / ${TOTAL}`, { x: 11.33, y: 7.1, w: 1.5, h: 0.32, fontSize: 11, bold: true, color: C.white, align: "right" });
  s.addNotes("まとめです。今回はデータの役割と計算過程、最終ツールの変数、線形補間が難しい理由を整理しました。来週は4方向版で線形補間を試し、棟数ごとの誤差を数値で示します。判断の基準についてご意見をいただきたいです。");
}

pres.writeFile({ fileName: "/tmp/w/new.pptx" }).then(() => console.log("written"));
