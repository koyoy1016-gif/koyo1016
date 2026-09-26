const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625
pres.title = 'HPE SE × IBJ総合職 共働きライフプラン';

const F = 'Meiryo';
const C = { pri: '114B5F', pri2: '1C7293', light: 'E6F1F4', acc: 'E8603C', ink: '1F2933', mute: '5B6770', line: 'C9D6DB', white: 'FFFFFF', m: '1C7293', f: 'E8603C', g3: '7FB7C6' };

function pill(s, text, x = 0.5, y = 0.28) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.22 + text.length * 0.13, h: 0.28, fill: { color: C.acc }, line: { color: C.acc }, rectRadius: 0.14 });
  s.addText(text, { x, y, w: 0.22 + text.length * 0.13, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
}
function head(s, chap, title) {
  s.background = { color: C.white };
  pill(s, chap);
  s.addText(title, { x: 0.5, y: 0.6, w: 9, h: 0.55, fontFace: F, fontSize: 20, bold: true, color: C.pri, margin: 0, valign: 'middle', isTextBox: true });
}
function foot(s, text) {
  s.addText(text, { x: 0.5, y: 5.2, w: 9, h: 0.3, fontFace: F, fontSize: 8, color: C.mute, margin: 0, valign: 'top', isTextBox: true });
}
function txt(s, text, o) {
  s.addText(text, Object.assign({ fontFace: F, fontSize: 12, color: C.ink, margin: 0.05, valign: 'top', isTextBox: true }, o));
}
function card(s, x, y, w, h, fill = C.light) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.08 });
}
function table(s, rows, o) {
  const data = rows.map((r, i) => r.map(c => {
    const cell = typeof c === 'object' ? c : { text: String(c) };
    const base = i === 0
      ? { bold: true, color: C.white, fill: { color: C.pri }, align: 'center' }
      : { color: C.ink, fill: { color: i % 2 ? C.white : 'F4F8F9' } };
    cell.options = Object.assign({ fontFace: F, fontSize: o.fontSize || 10, valign: 'middle', margin: [2, 4, 2, 4] }, base, cell.options || {});
    return cell;
  }));
  s.addTable(data, Object.assign({ border: { type: 'solid', pt: 0.5, color: C.line } }, o));
}
const B = t => ({ text: t, options: { bold: true } });
const HL = t => ({ text: t, options: { bold: true, color: C.acc } });
const chartBase = (extra) => Object.assign({
  catAxisLabelFontFace: F, valAxisLabelFontFace: F, dataLabelFontFace: F, legendFontFace: F, titleFontFace: F,
  catAxisLabelColor: C.mute, valAxisLabelColor: C.mute, catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
  valGridLine: { color: 'E3E8EA', size: 0.5 }, catGridLine: { style: 'none' }, legendFontSize: 9,
}, extra);

// 1 表紙
{
  const s = pres.addSlide(); s.background = { color: C.pri };
  txt(s, 'LIFE PLAN 2027–2067', { x: 0.7, y: 1.0, w: 8, h: 0.4, fontSize: 12, color: 'A9D3DE', bold: true });
  txt(s, 'HPE SE × IBJ総合職\n共働きライフプラン', { x: 0.7, y: 1.45, w: 8.6, h: 1.5, fontSize: 32, bold: true, color: C.white, valign: 'middle' });
  txt(s, 'キャリア・家計・住居・結婚を一体で考える｜入社から60歳まで', { x: 0.7, y: 3.05, w: 8.6, h: 0.4, fontSize: 14, color: 'DCEFF4' });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 3.8, w: 5.6, h: 0.9, fill: { color: '0B3645' }, line: { color: '0B3645' }, rectRadius: 0.08 });
  txt(s, '作成日：2026年9月26日\n金額は2027年の物価基準（実質）・運用益なし・単位は万円', { x: 0.85, y: 3.88, w: 5.4, h: 0.75, fontSize: 11, color: 'DCEFF4', valign: 'middle' });
}

// 2 結論
{
  const s = pres.addSlide(); head(s, '1 結論', '同棲・結婚は計画どおり可能。苦しいのは最初の1〜2年だけ');
  const stats = [
    ['2028年4月', '同棲開始（推奨）', '1月も可能だが女性の手元が約58万円まで減る'],
    ['2029年春', '入籍・挙式', '標準型（約180万円）が4月同棲なら可能'],
    ['28〜30歳', '余裕を感じ始める時期', '自由に使えるお金が月12〜13万円に'],
    ['約1.1億円', '60歳時点の資産（標準）', '保守でも約6,600万円。転職なしで十分'],
  ];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 2.28;
    card(s, x, 1.35, 2.1, 2.05);
    txt(s, st[0], { x: x + 0.1, y: 1.45, w: 1.9, h: 0.6, fontSize: 22, bold: true, color: C.acc, valign: 'middle' });
    txt(s, st[1], { x: x + 0.1, y: 2.05, w: 1.9, h: 0.4, fontSize: 12, bold: true, color: C.pri });
    txt(s, st[2], { x: x + 0.1, y: 2.45, w: 1.9, h: 0.9, fontSize: 10, color: C.ink });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 3.6, w: 9, h: 1.45, fill: { color: 'FDEEE9' }, line: { color: C.acc, width: 1 }, rectRadius: 0.08 });
  txt(s, '最大の論点：二人の収入差 ×「すべて折半」', { x: 0.7, y: 3.7, w: 8.6, h: 0.35, fontSize: 13, bold: true, color: C.acc });
  txt(s, [
    { text: '2年目の手取りは男性 約397万円・女性 約270万円（約6:4）。折半だと女性の貯蓄は年50〜60万円にとどまり、同棲・挙式・防衛資金の制約は常に女性側で先に効く。', options: { breakLine: true } },
    { text: '家賃と共同費を手取り比（59:41）で分けると、挙式できる時期が約半年早まる（家計全体の総額は同じ）。' },
  ], { x: 0.7, y: 4.05, w: 8.6, h: 0.95, fontSize: 11 });
  foot(s, '標準ケース：HPE実質昇給年2%、IBJ賞与年1か月、残業月約10時間（男性）。詳細は各章。');
}

// 3 ロードマップ
{
  const s = pres.addSlide(); head(s, '全体像', '最初の2年で土台を固め、30歳前後から選択肢が広がる');
  const ph = [
    ['立ち上げ期', '2027.4〜2028.3', '22歳', '実家で貯蓄\n2人で約360万円'],
    ['同棲期', '2028.4〜2029.3', '23歳', '同棲を開始\n住民税が始まる'],
    ['結婚・基盤期', '2029.4〜2032.3', '24〜26歳', '入籍・挙式\n防衛資金6か月分へ'],
    ['伸長期', '2032〜2034', '27〜29歳', '転職を判断（B）\n資産1,000万円超'],
    ['選択期', '2035〜', '30歳〜', '住み替え13〜14万円\n独立は1人ずつ'],
  ];
  ph.forEach((p, i) => {
    const x = 0.5 + i * 1.82, main = i === 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.4, w: 1.7, h: 2.3, fill: { color: main ? C.pri : C.light }, line: { color: main ? C.pri : C.line }, rectRadius: 0.08 });
    const col = main ? C.white : C.pri;
    txt(s, p[0], { x: x + 0.05, y: 1.5, w: 1.6, h: 0.4, fontSize: 14, bold: true, color: col, align: 'center' });
    txt(s, p[1] + '\n' + p[2], { x: x + 0.05, y: 1.92, w: 1.6, h: 0.5, fontSize: 9.5, color: main ? 'DCEFF4' : C.mute, align: 'center' });
    txt(s, p[3], { x: x + 0.05, y: 2.6, w: 1.6, h: 0.9, fontSize: 11, color: main ? C.white : C.ink, align: 'center', valign: 'middle' });
  });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 4.2, w: 9, h: 0, line: { color: C.line, width: 1.5 } });
  const gates = ['同棲\n2028年4月', '入籍・挙式\n2029年春', '5年目評価で\n転職を判断', '住み替え\n29〜30歳'];
  gates.forEach((g, i) => {
    const cx = 0.5 + (i + 1) * 1.82 - 0.06;
    s.addShape(pres.shapes.DIAMOND, { x: cx - 0.14, y: 4.06, w: 0.28, h: 0.28, fill: { color: C.acc }, line: { color: C.acc } });
    txt(s, g, { x: cx - 0.8, y: 4.4, w: 1.6, h: 0.55, fontSize: 10, bold: true, color: C.ink, align: 'center' });
  });
  foot(s, '◆＝判断点。標準ケースの時期。');
}

// 4 前提
{
  const s = pres.addSlide(); head(s, '2 前提', '確定しているのは初任給・固定賞与・税と社保の料率だけ');
  card(s, 0.5, 1.35, 4.4, 3.1);
  txt(s, '確認できた事実', { x: 0.65, y: 1.42, w: 4.1, h: 0.35, fontSize: 13, bold: true, color: C.pri });
  txt(s, [
    { text: 'HPE（学部卒27卒）：月給256,300円＋固定賞与6か月分＋業績賞与', options: { bullet: true, breakLine: true } },
    { text: 'IBJ（総合職27卒）：月給25万円以上。固定残業45時間分を含む', options: { bullet: true, breakLine: true } },
    { text: '勤務地：HPE本社は江東区大島、IBJ本社は新宿', options: { bullet: true, breakLine: true } },
    { text: '健保（協会けんぽ東京 2026年度）9.85%＋支援金0.23%、厚年18.3%、雇用保険 本人0.5%', options: { bullet: true, breakLine: true } },
    { text: '2026・27年分は基礎控除の特例あり（所得489万円以下は＋42万円）', options: { bullet: true } },
  ], { x: 0.65, y: 1.8, w: 4.1, h: 2.6, fontSize: 10, paraSpaceAfter: 4 });
  card(s, 5.1, 1.35, 4.4, 3.1, 'FDF3EF');
  txt(s, '計算の仮定', { x: 5.25, y: 1.42, w: 4.1, h: 0.35, fontSize: 13, bold: true, color: C.acc });
  txt(s, [
    { text: '金額は2027年の物価基準。昇給は物価を超える分のみ', options: { bullet: true, breakLine: true } },
    { text: 'HPE：残業月約10時間、35歳以降0。業績賞与は含めない', options: { bullet: true, breakLine: true } },
    { text: '初年度の賞与：HPEは12月に1.5か月、IBJは少額', options: { bullet: true, breakLine: true } },
    { text: 'IBJ賞与：保守0.5／標準1／好調2か月（年）', options: { bullet: true, breakLine: true } },
    { text: '社保は両社とも協会けんぽ東京で代用。運用益は含めない', options: { bullet: true, breakLine: true } },
    { text: '家賃・共同費は折半が基本（比較で手取り比59:41も試算）', options: { bullet: true } },
  ], { x: 5.25, y: 1.8, w: 4.1, h: 2.6, fontSize: 10, paraSpaceAfter: 4 });
  txt(s, [{ text: '要確認（結論を左右）：', options: { bold: true, color: C.acc } }, { text: '①IBJ賞与の実績月数 ②両社の初年度賞与 ③在宅勤務の実態 ④配属先と勤務地' }], { x: 0.5, y: 4.6, w: 9, h: 0.5, fontSize: 11 });
  foot(s, 'この環境ではウェブページ本体を開けず、検索結果から数値を取得。出典は最終スライドと元資料を参照。');
}

// 5 5年間の年度別収支
{
  const s = pres.addSlide(); head(s, '3 5年間の収支', '昇給しても住民税が始まり、通常月の手取りは5年間ほぼ横ばい');
  table(s, [
    ['年度（年齢）', '世帯 額面／手取り', '世帯 通常月／月平均', '住民税 男／女', '主な一時出費', '年度末資産 男／女', '世帯資産'],
    ['2027（22）', '668／567', '44.1／47.3', '0／0', '入社準備 10', '199／160', B('359')],
    ['2028（23）', '825／667', '42.7／55.6', '8.7／6.5', '同棲の初期費用 133', '304／143', B('447')],
    ['2029（24）', '843／663', '42.1／55.2', '21.2／12.3', '挙式・指輪 180', '368／118', B('486')],
    ['2030（25）', '861／673', '43.0／56.1', '23.9／13.6', '—', '540／175', B('715')],
    ['2031（26）', '880／691', '43.9／57.6', '24.5／14.1', '—', '722／241', HL('962')],
  ], { x: 0.5, y: 1.35, w: 9, colW: [1.1, 1.45, 1.45, 1.2, 1.5, 1.3, 1.0], fontSize: 10.5, rowH: 0.36 });
  card(s, 0.5, 3.75, 4.4, 1.3);
  txt(s, [{ text: '「月平均」は振込額ではない', options: { bold: true, color: C.pri, breakLine: true } }, { text: 'HPEは年収の約4割が6月・12月の賞与。毎月の生活は月給の範囲で賄い、賞与は大きな支出と貯蓄に回す。' }], { x: 0.65, y: 3.82, w: 4.1, h: 1.2, fontSize: 10.5 });
  card(s, 5.1, 3.75, 4.4, 1.3, 'FDF3EF');
  txt(s, [{ text: '資産の偏りに注意', options: { bold: true, color: C.acc, breakLine: true } }, { text: '折半のままだと5年目末は男性約720万・女性約240万円。手取り比で分けると約590万・約370万円に縮まる。' }], { x: 5.25, y: 3.82, w: 4.1, h: 1.2, fontSize: 10.5 });
  foot(s, '単位：万円。標準ケース、2028年4月同棲、2029年4月挙式（標準型）、家賃・管理費11万円、折半。保守ケースの5年目末は約780万円、好調は約1,200万円。');
}

// 6 月額家計
{
  const s = pres.addSlide(); head(s, '3 月額家計表', '同棲後の通常月：手取り42.7万円のうち黒字は5.7万円');
  const items = ['通常月の黒字', '通信費', '光熱費', '日用品・保険・医療・交通', '旅行などの積立', '特別費・家電の積立', '食費', '個人費（2人分）', '家賃・管理費'];
  const vals = [5.7, 1.1, 1.8, 2.5, 2.5, 3.5, 5.0, 9.5, 11.0];
  s.addChart(pres.charts.BAR, [{ name: '万円', labels: items, values: vals }], chartBase({
    x: 0.4, y: 1.3, w: 5.6, h: 3.8, barDir: 'bar', chartColors: [C.pri2], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 9, dataLabelColor: C.ink, dataLabelFormatCode: '0.0', showLegend: false, valAxisHidden: true, valGridLine: { style: 'none' },
  }));
  const pts = [
    ['家賃11万円', '通常月の手取りの25.8%。目安の25〜30%に収まる'],
    ['黒字 5.7万円', '男性3.35万・女性2.35万円（折半の場合）'],
    ['賞与の手取り', '世帯で年約150万円。これが貯蓄の柱'],
    ['家賃12万円なら', '黒字は4.7万円に。貯蓄はほぼ賞与頼み'],
  ];
  pts.forEach((p, i) => {
    card(s, 6.2, 1.35 + i * 0.95, 3.3, 0.85);
    txt(s, [{ text: p[0], options: { bold: true, color: C.pri, breakLine: true } }, { text: p[1] }], { x: 6.3, y: 1.4 + i * 0.95, w: 3.1, h: 0.78, fontSize: 10 });
  });
  foot(s, '2028年度6月以降の通常月・世帯合計（万円）。支出計37.0万円。');
}

// 7 年度末資産 男女
{
  const s = pres.addSlide(); head(s, '3 資産の積み上がり', '5年目末の世帯資産は約960万円。ただし女性側の伸びが遅い');
  const lab = ['2027年度', '2028年度', '2029年度', '2030年度', '2031年度'];
  s.addChart(pres.charts.BAR, [
    { name: '男性', labels: lab, values: [199, 304, 368, 540, 722] },
    { name: '女性', labels: lab, values: [160, 143, 118, 175, 241] },
  ], chartBase({ x: 0.4, y: 1.3, w: 6.0, h: 3.8, barDir: 'col', barGrouping: 'stacked', chartColors: [C.m, C.f], showValue: true, dataLabelPosition: 'ctr', dataLabelColor: C.white, dataLabelFontSize: 9, showLegend: true, legendPos: 't', valAxisLabelFormatCode: '#,##0' }));
  card(s, 6.6, 1.35, 2.9, 3.7);
  txt(s, [
    { text: '読み方', options: { bold: true, color: C.pri, breakLine: true } },
    { text: '2028年度は同棲の初期費用133万円、2029年度は挙式・指輪180万円を支払った後の残高。', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true } },
    { text: '女性の資産は2029年度に一度118万円まで下がる。', options: { bold: true, color: C.acc, breakLine: true } },
    { text: ' ', options: { breakLine: true } },
    { text: '手取り比（59:41）で分担すれば、家計の総額は同じまま偏りが縮まる。' },
  ], { x: 6.75, y: 1.45, w: 2.6, h: 3.5, fontSize: 10.5 });
  foot(s, '単位：万円。標準ケース・家賃折半・年度末（3月末）残高。');
}

// 8 年齢別表
{
  const s = pres.addSlide(); head(s, '4 年齢別', '世帯の額面は30歳 約1,130万・40歳 約1,420万円');
  table(s, [
    ['年齢', '男性の職務（HPE）', '男性 額面／手取り', '女性 額面／手取り', '世帯 額面／手取り', '通常月／月平均', '自由に使える額／月', '年間貯蓄', '累計資産'],
    ['22', '研修・OJT', '362／306', '306／261', '668／567', '44.1／47.2', '—', '359', '359'],
    ['25', '担当SE', '530／410', '360／284', '890／693', '44.2／57.8', '9.5', '171', '510'],
    ['30', 'シニアSE・案件リード', '680／517', '450／351', '1,130／868', '55.2／72.3', '12.9', '233', '1,534'],
    ['35', 'アーキテクト・課長相当', '800／591', '500／388', '1,300／979', '61.2／81.6', '16.6', '300', '2,899'],
    ['40', 'マネージャー等', '880／635', '540／413', '1,420／1,049', '65.4／87.4', '18.2', '327', '4,518'],
    ['45', '同上', '920／659', '560／428', '1,480／1,087', '67.7／90.6', '19.4', '350', '6,221'],
    ['50', '同上', '950／678', '560／428', '1,510／1,105', '68.6／92.1', '20.0', '361', '8,002'],
    ['55', '役職見直し', '920／659', '550／420', '1,470／1,080', '67.2／90.0', '19.2', '345', '9,760'],
    ['60', '継続雇用等（未確認）', '720／537', '450／348', '1,170／886', '55.4／73.8', '12.7', '229', HL('11,140')],
  ], { x: 0.4, y: 1.3, w: 9.2, colW: [0.5, 1.55, 1.05, 1.05, 1.15, 1.05, 1.0, 0.8, 1.05], fontSize: 9, rowH: 0.34 });
  foot(s, '単位：万円（2027年の物価基準）。家賃は29歳まで11万円・30歳から14万円。自由に使える額＝家賃と基本生活費を引いた残りの40%（残り60%を貯蓄）。業績賞与・株式報酬・運用益なし。');
}

// 9 3ケース資産推移
{
  const s = pres.addSlide(); head(s, '4 保守・標準・好調', '昇進しなくても生活は破綻しない。差は「ゆとり」と住居の幅');
  const ages = ['22', '25', '30', '35', '40', '45', '50', '55', '60'];
  s.addChart(pres.charts.LINE, [
    { name: '好調', labels: ages, values: [359, 607, 2083, 4141, 6687, 9506, 12504, 15515, 17963] },
    { name: '標準', labels: ages, values: [359, 510, 1534, 2899, 4518, 6221, 8002, 9760, 11140] },
    { name: '保守', labels: ages, values: [359, 452, 1168, 2022, 3007, 3994, 4998, 5963, 6628] },
  ], chartBase({ x: 0.4, y: 1.3, w: 5.7, h: 3.8, chartColors: ['2A9D8F', C.pri, C.acc], lineSize: 2, lineDataSymbolSize: 5, showLegend: true, legendPos: 't', valAxisLabelFormatCode: '#,##0', showTitle: true, title: '累計金融資産（万円、シナリオA）', titleFontSize: 11, titleColor: C.ink, catAxisTitle: '年齢（歳）', showCatAxisTitle: true, catAxisTitleFontSize: 9, catAxisTitleColor: C.mute }));
  table(s, [
    ['世帯額面', '保守', '標準', '好調'],
    ['30歳', '940', '1,130', '1,400'],
    ['40歳', '1,080', '1,420', '1,950'],
    ['60歳の資産', '6,628', '11,140', '17,963'],
    ['自由に使える額（30歳・月）', '約8', '約13', '約19'],
  ], { x: 6.3, y: 1.35, w: 3.2, colW: [1.25, 0.65, 0.65, 0.65], fontSize: 9.5, rowH: 0.4 });
  txt(s, '年2%（実質）で運用すると60歳の資産は保守約9,400万・標準約1.56億円。利回りは保証されない。', { x: 6.3, y: 3.55, w: 3.2, h: 1.0, fontSize: 9.5, color: C.mute });
  foot(s, '保守：男性は30代前半で昇進停止（最高約680万円）、女性は一般職層（約420万円）。好調：男性は30代前半で管理職・上級職。');
}

// 10 A vs B
{
  const s = pres.addSlide(); head(s, '4-5 残留と転職', '転職の価値は「+100万円」より、その後の昇給カーブで決まる');
  const ag = ['28', '30', '35', '40', '50', '60'];
  s.addChart(pres.charts.LINE, [
    { name: 'B 好調', labels: ag, values: [850, 920, 1150, 1350, 1500, 1100] },
    { name: 'B 標準（転職）', labels: ag, values: [715, 760, 900, 980, 1050, 760] },
    { name: 'A 標準（HPE残留）', labels: ag, values: [610, 680, 800, 880, 950, 720] },
    { name: 'B 保守', labels: ag, values: [560, 590, 650, 690, 700, 520] },
  ], chartBase({ x: 0.4, y: 1.3, w: 5.7, h: 3.8, chartColors: ['9CCFD8', C.acc, C.pri, 'F2B8A6'], lineSize: 2, lineDataSymbolSize: 5, showLegend: true, legendPos: 't', valAxisLabelFormatCode: '#,##0', showTitle: true, title: '男性の額面年収（万円）', titleFontSize: 11, titleColor: C.ink }));
  const pts = [
    ['額面+100万円', '手取りでは年+60〜70万円'],
    ['60歳の資産差（標準同士）', 'A 約1.11億 → B 約1.23億円（+約1,160万円）'],
    ['B保守（+40万円で頭打ち）', 'Aの保守とほぼ同じ。転職しただけでは差がつかない'],
  ];
  pts.forEach((p, i) => {
    card(s, 6.3, 1.35 + i * 1.22, 3.2, 1.1, i === 1 ? 'FDF3EF' : C.light);
    txt(s, [{ text: p[0], options: { bold: true, color: i === 1 ? C.acc : C.pri, breakLine: true } }, { text: p[1] }], { x: 6.4, y: 1.42 + i * 1.22, w: 3.0, h: 0.98, fontSize: 10.5 });
  });
  foot(s, '転職先の給与は月給×12＋賞与3か月と仮定。株式報酬・インセンティブは含めない。');
}

// 11 転職候補
{
  const s = pres.addSlide(); head(s, '5 転職候補', '設計と顧客対応の実績があれば＋100万円は現実的');
  const T = (t, c) => ({ text: t, options: { bold: true, color: c, align: 'center' } });
  table(s, [
    ['候補（企業例・職種）', 'HPEで積みたい経験', '必要な能力・英語', '年収目安', '報酬と働き方', '区分'],
    ['外資インフラベンダーのプリセールス（Dell、Cisco、NetApp等）', '提案・設計、デモ・検証', '製品知識、TOEIC730〜800+', '750〜1,000', '変動報酬20〜30%・RSU。人員削減リスク', T('つながりやすい', '2A7F62')],
    ['国内大手SIerのインフラアーキテクト（NTTデータ、NRI、CTC等）', '大規模基盤の要件定義・設計', '設計書、品質管理', '650〜900', '月給＋賞与中心。繁忙期の残業', T('条件次第で現実的', C.pri2)],
    ['ITコンサル（アクセンチュア、デロイト等）', '要件定義・比較検討・資料作成', '資料作成、顧客調整', '700〜1,000', '職位で大きく伸びる。負荷は重め', T('条件次第で現実的', C.pri2)],
    ['クラウド大手のSA（AWS、Microsoft等）', 'クラウド移行・ハイブリッド設計', '上級資格、TOEIC850+、発表力', '900〜1,400', '基本給＋RSU。成果主義・英語会議', T('挑戦枠', C.acc)],
    ['SaaS・セキュリティのSE', 'NW・セキュリティ製品の提案', '製品資格、英語', '850〜1,300', 'インセンティブ＋RSU。目標数字あり', T('挑戦枠', C.acc)],
    ['事業会社の社内SE・IT企画', '発注者側での基盤更新・ベンダー管理', '社内調整、幅広い知識', '600〜850', '日系の給与体系。時間は安定', T('つながりやすい', '2A7F62')],
  ], { x: 0.4, y: 1.3, w: 9.2, colW: [2.3, 1.65, 1.6, 0.85, 1.75, 1.05], fontSize: 8.5, rowH: 0.47 });
  txt(s, [{ text: '+100万円の条件：', options: { bold: true, color: C.acc } }, { text: '①数字で書ける実績 ②4年目までに設計・提案を担当 ③変動報酬は達成率70〜80%で再計算 ④6年目前後に活動 ⑤転職前に防衛資金6か月分（約200万円）' }], { x: 0.4, y: 4.65, w: 9.2, h: 0.5, fontSize: 9.5 });
  foot(s, '年収は27〜30歳・経験5〜7年の額面目安（公開求人・口コミ・転職記事からの推定、会社公式値ではない）。比較基準：転職直前のHPE標準 約610万円。内定確率は算出不可。');
}

// 12 家賃比較
{
  const s = pres.addSlide(); head(s, '6 住まい', '予算内の2LDKは下総中山が最も見つけやすい');
  table(s, [
    ['駅', '1LDK相場', '2LDK相場', '予算内で見つけやすい条件', '妥協が必要な条件'],
    ['下総中山（船橋市・市川市）', '約8〜10（推定）', '10〜13', '2LDKで築20〜35年、徒歩10〜15分', '駅近・築浅の2LDK'],
    ['平井（江戸川区）', '8.2〜10.5', '12〜15', '1LDKは築15年前後。2LDKは築40年超のリノベ物件', '築浅の2LDK'],
    ['新小岩（葛飾区）', '9〜12', '約13〜14.7', '1LDKは徒歩10分前後。2LDKは徒歩10分超か築古', '駅近の2LDK（快速停車駅）'],
  ], { x: 0.4, y: 1.3, w: 9.2, colW: [1.9, 1.2, 1.1, 2.9, 2.1], fontSize: 9.5, rowH: 0.45 });
  txt(s, '募集例（検索結果で確認・詳細ページ未確認、2026年9月26日）', { x: 0.4, y: 3.25, w: 9.2, h: 0.3, fontSize: 11, bold: true, color: C.pri });
  table(s, [
    ['駅', '間取り・面積', '家賃／管理費／合計', '築年・徒歩', '敷金／礼金'],
    ['下総中山', '2LDK', '10.5／0.3／10.8', '—', '1か月／1か月'],
    ['平井', '2LDK', '11.0／1.0／12.0', '1975年築・徒歩5分', '—'],
    ['新小岩', '2LDK 58.60㎡', '11.0／1.0／12.0', '—', '1か月／1か月'],
    ['新小岩', '2LDK（築22年）', '12.7／1.1／13.8（予算超）', '築22年', '—'],
  ], { x: 0.4, y: 3.55, w: 9.2, colW: [1.3, 1.9, 2.6, 1.9, 1.5], fontSize: 9, rowH: 0.3 });
  foot(s, '単位：万円/月。相場はSUUMO・CHINTAI・RENTO等の検索結果。1LDKの具体的な募集例は得られず。現在の募集が2028年の入居時期に空いているとは限らない。');
}

// 13 通勤・間取り
{
  const s = pres.addSlide(); head(s, '6 通勤と間取り', 'HPE（大島）とIBJ（新宿）は都営新宿線でつながっている');
  table(s, [
    ['居住駅', '男性 → HPE（大島）', '女性 → IBJ（新宿）', '注意点'],
    ['下総中山', '本八幡で都営新宿線に乗換 約25〜30分・乗換1', '総武線各停で直通 約41〜46分・乗換0', '総武線の朝は混雑。始発に近い'],
    ['平井', '亀戸経由でバス等 約25〜35分・乗換1（自転車 約15〜20分）', '総武線各停で直通 約35分・乗換0', '男性は自転車通勤が有力（規定確認）'],
    ['新小岩', 'バス等 約30〜40分・乗換1', '快速＋各停 約30〜40分', '快速は混雑。バスの定時性'],
    [B('（参考）船堀'), '都営新宿線で直通 約5〜10分', '都営新宿線で直通 約30分', '二人とも乗換なし'],
    [B('（参考）本八幡'), '都営新宿線で直通 約15〜20分', '都営新宿線で直通 約35〜45分', '始発駅で座れる可能性'],
  ], { x: 0.4, y: 1.3, w: 9.2, colW: [1.3, 3.0, 2.6, 2.3], fontSize: 9.5, rowH: 0.42 });
  card(s, 0.4, 4.0, 9.2, 0.9);
  txt(s, [{ text: '在宅勤務と間取り：', options: { bold: true, color: C.pri } }, { text: 'HPEはフルフレックスで在宅も使われている一方、IBJは一部の社員のみとの口コミ。毎日二人の在宅が重なる可能性は低いので、2LDKにこだわらず「2DK・2K・45㎡以上の1LDK」も候補に（2LDKより1〜3万円安い傾向）。' }], { x: 0.55, y: 4.07, w: 8.9, h: 0.8, fontSize: 10.5 });
  foot(s, '所要時間は徒歩を含まない目安。下総中山→新宿のみ乗換案内の検索結果で確認、他は路線からの推定。');
}

// 14 初期費用
{
  const s = pres.addSlide(); head(s, '7 同棲の初期費用', '同棲の必要資金は標準で約207万円');
  const lab = ['節約', '標準', '余裕'];
  s.addChart(pres.charts.BAR, [
    { name: '契約時の費用', labels: lab, values: [22.8, 59, 76.5] },
    { name: '家具家電・生活用品', labels: lab, values: [35, 62, 95] },
    { name: '在宅設備・回線', labels: lab, values: [6, 12, 27] },
    { name: '生活防衛資金', labels: lab, values: [55, 74, 111] },
  ], chartBase({ x: 0.4, y: 1.3, w: 5.2, h: 3.8, barDir: 'bar', barGrouping: 'stacked', chartColors: [C.pri, C.pri2, C.g3, C.acc], showLegend: true, legendPos: 'b', showValue: true, dataLabelPosition: 'ctr', dataLabelColor: C.white, dataLabelFontSize: 8, dataLabelFormatCode: '0', valAxisLabelFormatCode: '#,##0' }));
  table(s, [
    ['契約時の費用（標準）', '万円', '返還'],
    ['敷金', '10', HL('預け金')],
    ['礼金', '10', 'なし'],
    ['仲介手数料', '11', 'なし'],
    ['保証会社（初回）', '5.5', 'なし'],
    ['火災保険（2年）', '1.8', 'なし'],
    ['鍵交換', '2.2', 'なし'],
    ['前家賃＋日割り', '16.5', '家賃'],
    ['オプション（外せる）', '2', 'なし'],
    [B('小計'), B('59'), ''],
  ], { x: 5.8, y: 1.3, w: 3.7, colW: [1.9, 0.8, 1.0], fontSize: 9, rowH: 0.34 });
  foot(s, '家賃10万円＋管理費1万円の2LDKの場合、二人分（万円）。引っ越し費用は0円の前提。実家の家具家電を持ち込めば20〜30万円減らせる。');
}

// 15 貯蓄推移 & 1月 vs 4月
{
  const s = pres.addSlide(); head(s, '7 月次貯蓄計画', '2027年12月末に約279万円、2028年3月末に約359万円');
  const mo = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  s.addChart(pres.charts.LINE, [
    { name: '二人の合計', labels: mo, values: [23.6, 49.6, 75.7, 103.3, 130.8, 158.4, 185.9, 213.5, 278.9, 305.7, 332.4, 359.2] },
    { name: '男性', labels: mo, values: [11.8, 24.8, 37.8, 52.3, 66.8, 81.3, 95.8, 110.3, 157.3, 171.4, 185.4, 199.5] },
    { name: '女性', labels: mo, values: [11.8, 24.8, 37.9, 51.0, 64.0, 77.1, 90.1, 103.2, 121.6, 134.3, 147.0, 159.7] },
  ], chartBase({ x: 0.4, y: 1.3, w: 4.9, h: 3.8, chartColors: ['2A9D8F', C.m, C.f], lineSize: 2, lineDataSymbolSize: 4, showLegend: true, legendPos: 't', valAxisLabelFormatCode: '#,##0', showTitle: true, title: '月末残高（万円、2027年4月〜2028年3月）', titleFontSize: 10, titleColor: C.ink }));
  table(s, [
    ['', '2028年1月入居', HL('2028年4月入居（推奨）')],
    ['物件探し', '11〜12月（交渉しやすい）', '2〜3月（繁忙期）'],
    ['入居前の貯蓄', '約279万円', '約359万円'],
    ['支払後の手元 男／女', '約95万／約58万円', '約136万／約95万円'],
    ['女性の防衛資金', '約3か月分（薄い）', '約5か月分'],
    ['挙式の最短（標準・折半）', '2029年6月ごろ', '2028年12月ごろ'],
  ], { x: 5.45, y: 1.3, w: 4.1, colW: [1.3, 1.4, 1.4], fontSize: 9, rowH: 0.42 });
  txt(s, '毎月の先取り貯蓄：男性 約14万円・女性 約13万円。賞与は全額貯蓄。', { x: 5.45, y: 3.95, w: 4.1, h: 0.6, fontSize: 10, bold: true, color: C.pri });
  foot(s, '標準ケース。実家への入金0円、個人の生活費は男性8.5万・女性8万円/月。初年度の賞与が0円でも二人で約240万円あり、必要資金207万円は賄える。');
}

// 16 結婚費用
{
  const s = pres.addSlide(); head(s, '8 結婚費用', '結婚費用は節約型98万・標準型180万・余裕型268万円');
  const lab = ['節約型', '標準型', '余裕型'];
  s.addChart(pres.charts.BAR, [
    { name: '男性', labels: lab, values: [56.5, 102.5, 154] },
    { name: '女性', labels: lab, values: [41.5, 77.5, 114] },
  ], chartBase({ x: 0.4, y: 1.3, w: 4.4, h: 3.8, barDir: 'col', chartColors: [C.m, C.f], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 9, dataLabelColor: C.ink, dataLabelFormatCode: '0.0', showLegend: true, legendPos: 't', showTitle: true, title: '男女別の負担（万円）', titleFontSize: 10, titleColor: C.ink }));
  table(s, [
    ['内訳（標準型）', '万円'],
    ['挙式料', '20'], ['料理・飲み物（22名分）', '39.6'], ['衣装', '35'], ['写真・動画', '15'],
    ['装花・引出物・ヘアメイク', '24'], ['会場使用料・雑費', '11.4'], ['顔合わせ・遠方ゲスト', '10'],
    [B('結婚指輪（男性全額）'), B('25')], [HL('合計'), HL('180')],
  ], { x: 5.0, y: 1.3, w: 2.3, colW: [1.6, 0.7], fontSize: 8.5, rowH: 0.33 });
  table(s, [
    ['追加の選択肢', '標準', '余裕'],
    ['婚約指輪', '30', '45'],
    ['新婚旅行（2人）', '25（国内）', '70（海外）'],
    ['ご祝儀（受領時）', '約−70', '—'],
  ], { x: 7.45, y: 1.3, w: 2.1, colW: [0.9, 0.6, 0.6], fontSize: 8.5, rowH: 0.36 });
  txt(s, 'ご祝儀は当てにしない。受け取れば標準型の最終負担は約110万円（男67.5・女42.5）。婚約指輪は計算上男性負担。', { x: 7.45, y: 2.9, w: 2.1, h: 1.8, fontSize: 9, color: C.ink });
  foot(s, '計算上の人数：ゲスト20名＋新郎新婦2名＝料理22名分。結婚指輪以外は折半。参考：ゲスト10〜20人未満の式の平均は約180万円（ゼクシィ）。');
}

// 17 挙式時期
{
  const s = pres.addSlide(); head(s, '8 結婚の時期', '4月同棲なら2029年春の挙式に間に合う。制約は常に女性側');
  table(s, [
    ['同棲開始・分担', '節約型', '標準型', '余裕型'],
    ['2028年1月・折半', '2028年11月', HL('2029年6月'), '2030年4月'],
    ['2028年1月・手取り比', '2028年9月', '2028年12月', '2029年4月'],
    [B('2028年4月・折半'), '2028年9月', HL('2028年12月'), '2029年7月'],
    ['2028年4月・手取り比', '2028年9月', '2028年9月', '2028年12月'],
    ['保守ケース・1月・折半', '2029年3月', '2030年6月', '2031年10月'],
  ], { x: 0.4, y: 1.3, w: 5.2, colW: [1.9, 1.1, 1.1, 1.1], fontSize: 9.5, rowH: 0.4 });
  txt(s, '判定条件：二人とも「防衛資金50万円＋自分の負担分」を持っている最初の月。判断は2028年夏なので最短でも9月。', { x: 0.4, y: 3.8, w: 5.2, h: 0.6, fontSize: 9.5, color: C.mute });
  const plans = [['①同時', '入籍・挙式とも2029年4月', '4月同棲で標準型まで'], ['②入籍を先に', '2029年4月入籍・10〜11月挙式', '1月同棲・折半や余裕型'], ['③式は翌春', '2029年4月入籍・2030年4月挙式', '資金に最も余裕']];
  plans.forEach((p, i) => {
    card(s, 5.8, 1.3 + i * 1.05, 3.7, 0.95, i === 0 ? 'FDF3EF' : C.light);
    txt(s, [{ text: p[0] + '　', options: { bold: true, color: i === 0 ? C.acc : C.pri } }, { text: p[1], options: { bold: true, breakLine: true } }, { text: p[2], options: { color: C.mute } }], { x: 5.9, y: 1.37 + i * 1.05, w: 3.5, h: 0.85, fontSize: 10 });
  });
  foot(s, '1月同棲なら半年後の判断は2028年7月、4月同棲なら10月。10月判断でも少人数のレストラン婚なら準備4〜6か月で2029年4月に間に合う。');
}

// 18 福利厚生
{
  const s = pres.addSlide(); head(s, '9 福利厚生', '両社とも住宅手当なし。働き方と休職時の補償が重要');
  table(s, [
    ['制度', 'HPE（日本ヒューレット・パッカード合同会社）', 'IBJ（株式会社IBJ本体）'],
    ['住宅手当・社宅', 'なし（口コミ）', 'なし（口コミ）'],
    ['通勤費', '全額支給（口コミ）', '支給あり（口コミ）'],
    ['フレックス・在宅', 'フルフレックス（公式）。在宅可、出社ルールは未確認', 'IBJ流フレックス（公式）。在宅は一部の社員との口コミ'],
    ['休暇', '休みが取りやすい。出産・育児・介護・社外活動の休暇（口コミ）', '5日間の連続休暇制度（公式）'],
    ['健康・健保', '健康保険組合あり、35歳以上は人間ドック（口コミ）', '法定健診。健保の加入先は要確認'],
    ['年金・退職金', '確定拠出年金、退職金制度あり（口コミ）', 'ITS企業年金基金（公式）'],
    ['株式', '持株制度の記載あり（詳細未確認）', '持株会・RS・ストックオプション（公式）'],
    ['研修・資格', 'トレーニング費用・クラウド利用費の補助（口コミ）', '人材育成の取り組みを公開'],
    ['結婚休暇・祝い金', '未確認', '未確認'],
  ], { x: 0.4, y: 1.3, w: 9.2, colW: [1.5, 3.9, 3.8], fontSize: 9, rowH: 0.34 });
  txt(s, [{ text: '人事に確認：', options: { bold: true, color: C.acc } }, { text: '初年度の賞与／IBJ賞与の実績／健保と料率・付加給付／在宅の対象と頻度／結婚休暇の期限と祝い金／通勤規定（自転車）／退職金・DCの受給権／休職中の給与／IBJの副業・競業規定' }], { x: 0.4, y: 4.75, w: 9.2, h: 0.45, fontSize: 9 });
  foot(s, '福利厚生の金銭効果は給与と二重計上しないよう、家計の計算には入れていない。');
}

// 19 資格
{
  const s = pres.addSlide(); head(s, '10 資格・英語・スキル', '応用情報の4月受験は不可。基本情報は12月27日まで');
  const ev = [['2026/10/6', '応用情報\n申込開始'], ['2026/11ごろ', '応用情報\n前期（CBT）'], ['2026/12/27', '基本情報\n現行の最終日'], ['2027/2ごろ', '応用情報\n後期＝最後'], ['2027/4', '入社\n応用情報なし'], ['2027年度夏〜秋', '新試験\n（仮称）開始']];
  s.addShape(pres.shapes.LINE, { x: 0.6, y: 1.55, w: 8.8, h: 0, line: { color: C.line, width: 1.5 } });
  ev.forEach((e, i) => {
    const cx = 0.95 + i * 1.62, key = i === 2;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.1, y: 1.45, w: 0.2, h: 0.2, fill: { color: key ? C.acc : C.pri2 }, line: { color: key ? C.acc : C.pri2 } });
    txt(s, [{ text: e[0], options: { bold: true, breakLine: true, color: key ? C.acc : C.ink } }, { text: e[1], options: { color: C.mute } }], { x: cx - 0.78, y: 1.72, w: 1.56, h: 0.72, fontSize: 9, align: 'center' });
  });
  table(s, [
    ['時期', '資格', '技術', '英語', '仕事の実績'],
    ['入社前', '基本情報（12月まで）。応用情報は余力があれば2月', 'Linux基本操作、仮想環境、TCP/IP', 'TOEIC 600', '—'],
    ['1年目', '配属に合わせLPIC/LinuC 1かCCNA', '担当製品の設計書を読み込む', 'TOEIC 730', '議事録・手順書を正確に。記録を始める'],
    ['2〜3年目', 'AWS SAA、ベンダー資格、新試験', 'ハイブリッド構成、自動化（Ansible・Python）', '800＋会話', '小さな案件の基本設計を一人で担当'],
    ['4〜7年目', 'クラウド上級、CCNP、セキュリティ', 'アーキテクチャ設計、移行計画', '850＋か英語発表', '案件リード。実績を2〜3件'],
  ], { x: 0.4, y: 2.6, w: 9.2, colW: [0.9, 2.3, 2.3, 1.2, 2.5], fontSize: 9, rowH: 0.45 });
  foot(s, '出典：IPA、経済産業省（2026年3月31日公表の見直し案）ほか。タイムラインの間隔は時間の長さに比例しない。資格の数より「何を設計し、どんな成果が出たか」が年収に直結する。');
}

// 20 独立
{
  const s = pres.addSlide(); head(s, '11 独立シナリオ', '加盟店で会社員並みの手取りを得るには年約19人の新規入会が必要');
  const lab = ['少ない（新規6人）', '中程度（新規15人）', '多い（新規30人）'];
  s.addChart(pres.charts.BAR, [
    { name: '事業利益', labels: lab, values: [70, 342, 811] },
    { name: '本人の手取り', labels: lab, values: [42, 260, 546] },
  ], chartBase({ x: 0.4, y: 1.3, w: 4.9, h: 3.2, barDir: 'col', chartColors: [C.pri, C.acc], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 9, dataLabelColor: C.ink, showLegend: true, legendPos: 't', showTitle: true, title: 'C：IBJ加盟店の年間試算（万円）', titleFontSize: 10, titleColor: C.ink }));
  txt(s, '比較：会社員を続けた場合の手取り 約351万円（30歳・標準）', { x: 0.4, y: 4.5, w: 4.9, h: 0.35, fontSize: 9.5, bold: true, color: C.acc });
  const cards = [
    ['損益分岐点', '新規入会 年4〜6人（集客費で変わる）。赤字にならないだけで、生活費はまだ稼げていない'],
    ['必要資金 約590万円', '加盟金220＋開業50＋初年度の固定費100＋本人の生活費1年分220'],
    ['D：男性のB2B独立', '月単価100万円で手取り約700万円。会社員（40歳・約635万）比+60万円程度。有利なのは月130〜150万円以上'],
    ['原則', '二人同時に独立しない。1人ずつ、もう1人が会社員の間に'],
  ];
  cards.forEach((c, i) => {
    card(s, 5.5, 1.3 + i * 0.95, 4.0, 0.85, i === 3 ? 'FDF3EF' : C.light);
    txt(s, [{ text: c[0], options: { bold: true, color: i === 3 ? C.acc : C.pri, breakLine: true } }, { text: c[1] }], { x: 5.6, y: 1.35 + i * 0.95, w: 3.8, h: 0.78, fontSize: 9 });
  });
  foot(s, '加盟金200万円（税抜）、月会費1.5万円＋仲人3,800円（IBJ公式）。会員料金は入会15万・月1.5万・成婚料20万、成婚率30%と仮定。本部の成婚料等の有無は未確認。');
}

// 21 世間比較
{
  const s = pres.addSlide(); head(s, '12 世間との比較', '25歳時点の世帯所得は全世帯中央値の約2倍');
  s.addChart(pres.charts.BAR, [{ name: '万円', labels: ['世帯主29歳以下の平均', '全世帯の中央値', '全世帯の平均', '二人の世帯（25歳・標準）'], values: [336.4, 451, 575.2, 890] }], chartBase({
    x: 0.4, y: 1.3, w: 5.2, h: 3.4, barDir: 'bar', chartColors: [C.pri2], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 9, dataLabelColor: C.ink, dataLabelFormatCode: '#,##0', showLegend: false, valAxisHidden: true, valGridLine: { style: 'none' }, showTitle: true, title: '額面の年間世帯所得（万円）', titleFontSize: 10, titleColor: C.ink,
  }));
  table(s, [
    ['比較対象', '統計', '二人'],
    ['25〜29歳 個人の平均給与', '407（2024年分）', '男530・女360'],
    ['全世帯（2024年の所得）', '平均575・中央値451', '世帯890'],
    ['勤労者世帯の月の実収入', '65.4（2025年）', '月約74'],
    ['東京・子なし共働き', '分布なし', '順位は作らない'],
  ], { x: 5.8, y: 1.3, w: 3.7, colW: [1.45, 1.25, 1.0], fontSize: 8.5, rowH: 0.45 });
  txt(s, '手取りで順位を出せる統計はなく、額面の順位を手取りの順位として扱わない。', { x: 5.8, y: 3.7, w: 3.7, h: 0.6, fontSize: 9, color: C.mute });
  foot(s, '出典：国税庁 民間給与実態統計調査、厚生労働省 国民生活基礎調査（2025年・2024年）、総務省 家計調査。単位：万円。');
}

// 22 生活水準と住み替え
{
  const s = pres.addSlide(); head(s, '12 生活水準と住み替え', '住み替えは29〜30歳・家賃13〜14万円が目安');
  table(s, [
    ['年齢', '自由に使える額/月', '無理なく払える家賃', '資産', '男性が休職・失業したら'],
    ['23〜24', '約8万＋旅行年30万', '11万円', '挙式前後は薄い', '数か月〜1年程度'],
    ['25', '約9.5万', '11万円', '約510万', '約4年'],
    ['30', '約13万', '13〜14万円', '約1,530万', '10年以上'],
    ['35', '約17万', '約15万円', '約2,900万', '十分に長い'],
    ['40〜55', '約18〜20万', '約16万円', '約4,500〜9,800万', '十分に長い'],
  ], { x: 0.4, y: 1.3, w: 5.6, colW: [0.7, 1.35, 1.2, 1.2, 1.15], fontSize: 9, rowH: 0.4 });
  txt(s, '家賃上限＝世帯の通常月手取りの25%。休職期間は給付を含めない最も厳しい計算。女性が休職しても男性の手取りでほぼ賄える。', { x: 0.4, y: 3.8, w: 5.6, h: 0.6, fontSize: 9, color: C.mute });
  const mv = [['現在の家を維持', '11万円', '60歳の資産が約760万円多い'], ['都内東側の良い物件', '13〜16万円', '29〜30歳ごろ'], ['都心寄りの東側（東日本橋・森下）', '16〜20万円', '1LDK・33〜35歳ごろ'], ['都心3区', '1LDK 18〜25万円', '2LDKは好調ケースのみ']];
  mv.forEach((m, i) => {
    card(s, 6.2, 1.3 + i * 0.75, 3.3, 0.68, i === 0 ? 'FDF3EF' : C.light);
    txt(s, [{ text: m[0], options: { bold: true, color: C.pri, breakLine: true } }, { text: m[1] + '｜' + m[2] }], { x: 6.3, y: 1.33 + i * 0.75, w: 3.1, h: 0.62, fontSize: 9 });
  });
  txt(s, '年収700〜800万円でも家賃10万円台は不相応ではない（35歳で手取りの約18%）。住み替えは収入ではなく生活上の理由で決める。', { x: 6.2, y: 4.35, w: 3.3, h: 0.8, fontSize: 9, bold: true, color: C.acc });
  foot(s, '都心3区の家賃は目安で、実際の募集では未検証。「都内」は23区全体、「都心」は千代田・中央・港。');
}

// 23 率直な回答
{
  const s = pres.addSlide(); head(s, '12 率直な回答', '苦しいのは、生活の立ち上げ費用を最初の2年で払うから');
  const qa = [
    ['入社直後の余裕のなさは一時的？', '一時的。初期費用＋挙式313万円、2年目からの住民税、賞与比率の高い給与が重なるため。26歳で資産約960万円'],
    ['いつ気にせず暮らせる？', '標準で28〜30歳、保守で35歳前後。防衛資金6か月分・自由に使える額が月10万円超・賞与を生活費に使わない'],
    ['都心・旅行・貯蓄の両立は？', '35歳前後から都心寄り1LDK（16〜18万円）なら可能。自由に使える額は月約15万円、年間貯蓄は約280万円'],
    ['両立しやすい／優先順位が必要なもの', '両立しやすい：旅行・趣味・貯蓄・手取りの25%以内の家賃。要優先：都心×広さ×築浅、早い挙式×余裕型'],
    ['転職・独立なしで十分？', '十分。保守でも家賃14万円で月約10万円の自由に使えるお金、60歳で約6,600万円'],
    ['家賃や生活水準の期待は？', '家賃10〜12万円は妥当で堅実。ただし23歳で駅近・きれいな2LDKを11万円は相場的にやや高望み'],
  ];
  qa.forEach((q, i) => {
    const x = 0.4 + (i % 3) * 3.08, y = 1.3 + Math.floor(i / 3) * 1.95;
    card(s, x, y, 2.95, 1.85, i % 2 ? C.light : 'EEF5F7');
    txt(s, [{ text: 'Q. ' + q[0], options: { bold: true, color: C.pri, breakLine: true } }, { text: q[1] }], { x: x + 0.1, y: y + 0.08, w: 2.75, h: 1.7, fontSize: 11, paraSpaceAfter: 6 });
  });
  foot(s, '学歴や会社名ではなく、可処分所得と支出で評価。');
}

// 24 やること
{
  const s = pres.addSlide(); head(s, '13 今からやること', '最初の3つは入社前の今しかできない、または影響が最も大きい');
  const todo = [
    ['基本情報を12月27日までに取得', '応用情報の2月受験は12月に判断'],
    ['賞与・在宅・配属を人事に確認', 'IBJ賞与の月数、初年度の賞与'],
    ['家賃・共同費の分担ルールを決める', '折半か手取り比か、折衷案も'],
    ['入社月から先取り貯蓄', '男性 月約14万・女性 月約13万＋賞与全額'],
    ['同棲は2028年4月、1月から物件探し', '下総中山・本八幡・平井・船堀。2DKも'],
    ['防衛資金と長期運用を分ける', '挙式までは預金、6か月分超からNISA'],
    ['2028年夏に結婚と式の規模を決める', '標準型を基本に。ご祝儀は当てにしない'],
    ['2年目から案件ごとに記録', '範囲・技術・顧客・成果を数字で'],
    ['英語を継続（600→730→800）', '3年目ごろから会話も'],
    ['独立を考えるならアドバイザー経験を', '副業・競業規定を確認。資金約590万円'],
  ];
  todo.forEach((t, i) => {
    const col = i < 5 ? 0 : 1, row = i % 5, x = 0.4 + col * 4.65, y = 1.3 + row * 0.76;
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.08, w: 0.45, h: 0.45, fill: { color: i < 3 ? C.acc : C.pri }, line: { color: i < 3 ? C.acc : C.pri } });
    txt(s, String(i + 1), { x, y: y + 0.08, w: 0.45, h: 0.45, fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle', margin: 0 });
    txt(s, [{ text: t[0], options: { bold: true, breakLine: true } }, { text: t[1], options: { color: C.mute } }], { x: x + 0.55, y, w: 3.95, h: 0.68, fontSize: 10.5 });
  });
  foot(s, 'オレンジは最優先（入社前）。');
}

// 25 出典
{
  const s = pres.addSlide(); head(s, '14 出典と注意', '数字を使う前に、必ず元のページで確認を');
  txt(s, [
    { text: '企業：HPE採用情報・職種紹介、ワンキャリア（27卒初任給）、OpenMoney・転職会議・エンカイシャの評判（口コミ）、IBJ新卒採用・社内制度・会社概要、日経（IBJ平均年収）、IBJ開業資金（加盟店）', options: { bullet: true, breakLine: true } },
    { text: '税・社保：国税庁（令和8年度の基礎控除）、財務省（税制改正大綱）、協会けんぽ（令和8年度保険料率）、厚生労働省（雇用保険料率）', options: { bullet: true, breakLine: true } },
    { text: '試験：IPA（令和8年度の申込期間・CBT方式・試験区分の見直し案）、経済産業省、アイテック、TAC', options: { bullet: true, breakLine: true } },
    { text: '住居：SUUMO・CHINTAI・RENTO・アットホーム・ホームズ・エイブルの検索結果、大和不動産鑑定（東京都区部の家賃）', options: { bullet: true, breakLine: true } },
    { text: '結婚：リクルートブライダル総研 結婚マーケット調査2025、ゼクシィ', options: { bullet: true, breakLine: true } },
    { text: '統計：国税庁 民間給与実態統計調査、厚生労働省 国民生活基礎調査、総務省 家計調査', options: { bullet: true } },
  ], { x: 0.5, y: 1.3, w: 9, h: 2.6, fontSize: 10, paraSpaceAfter: 5 });
  card(s, 0.5, 3.3, 9, 0.9, 'FDF3EF');
  txt(s, [{ text: '注意：', options: { bold: true, color: C.acc } }, { text: '情報は2026年9月26日時点。この環境ではページ本体を開けず、検索結果から取得。将来の年収・昇進・賞与・独立後の利益は断定できないため幅で示した。URLの一覧はドキュメント版の14章を参照。' }], { x: 0.65, y: 3.38, w: 8.7, h: 0.75, fontSize: 10 });
}

pres.writeFile({ fileName: process.argv[2] || 'lifeplan.pptx' }).then(f => console.log('wrote', f));
