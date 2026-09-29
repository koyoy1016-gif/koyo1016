// 発表原稿（19〜38枚目）の Word ファイルを作る
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  LevelFormat, Footer, PageNumber,
} = require("docx");

const data = JSON.parse(fs.readFileSync("/tmp/w/script.json", "utf8"));
const FONT = { ascii: "Yu Gothic", eastAsia: "Yu Gothic", hAnsi: "Yu Gothic", cs: "Yu Gothic" };
const NAVY = "1B2A44", ORANGE = "C56A2C", MUTED = "6B7480";
const CPM = 300; // 1分あたりの読み上げ文字数の目安

const minutes = n => {
  const m = n / CPM;
  return m < 0.75 ? "約30秒" : `約${Math.round(m * 2) / 2}分`;
};

// 文を2〜3文ずつの段落に分ける（読み上げやすくするため）
function chunks(text) {
  const sents = text.match(/[^。]+。?/g) || [text];
  const out = [];
  let cur = "";
  for (const s of sents) {
    if (cur && (cur + s).length > 130) { out.push(cur); cur = s; } else cur += s;
  }
  if (cur) out.push(cur);
  return out;
}

const run = (text, o = {}) => new TextRun({ text, font: FONT, size: 22, ...o });
const children = [];

children.push(new Paragraph({
  alignment: AlignmentType.LEFT, spacing: { after: 60 },
  children: [run("壁面日射量予測ツールの開発", { size: 20, color: MUTED, bold: true })],
}));
children.push(new Paragraph({
  heading: HeadingLevel.TITLE, spacing: { after: 120 },
  children: [run("発表原稿：補足（19〜38枚目）", { size: 36, bold: true, color: NAVY })],
}));
const total = data.slides.reduce((a, s) => a + s.text.length, 0);
children.push(new Paragraph({
  spacing: { after: 80 },
  children: [run(`全20枚・読み上げの目安 約${Math.round(total / CPM)}分（1分あたり約${CPM}字で計算）`, { color: MUTED, size: 20 })],
}));
children.push(new Paragraph({
  spacing: { after: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D5DAE1", space: 6 } },
  children: [run("※ 32・33枚目の保存値600と、36枚目の低い建物の値は説明用の仮の値です。計算時間は、SEBE 1回を30秒〜1分として見積もっています。", { color: MUTED, size: 20 })],
}));

data.slides.forEach(sl => {
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 280, after: 80 },
    children: [
      run(`${sl.n}枚目　`, { bold: true, color: ORANGE, size: 24 }),
      run(sl.title, { bold: true, color: NAVY, size: 24 }),
    ],
  }));
  children.push(new Paragraph({
    keepNext: true, spacing: { after: 60 },
    children: [run(`読み上げ目安：${minutes(sl.text.length)}（${sl.text.length}字）`, { size: 18, color: MUTED })],
  }));
  chunks(sl.text).forEach(c => children.push(new Paragraph({
    spacing: { after: 100, line: 360 },
    children: [run(c)],
  })));
});

children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 160 },
  children: [run("想定される質問と答え", { bold: true, color: NAVY, size: 30 })],
}));
data.qa.forEach((qa, i) => {
  children.push(new Paragraph({
    keepNext: true, spacing: { before: 200, after: 60 },
    children: [run(`Q${i + 1}．${qa.q}`, { bold: true, color: NAVY })],
  }));
  children.push(new Paragraph({
    spacing: { after: 60, line: 340 },
    children: [run(`A．${qa.a}`)],
  }));
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [run(`関連スライド：${qa.p}枚目`, { size: 18, color: MUTED })],
  }));
});

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 1300, bottom: 1300, left: 1300, right: 1300 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: MUTED })],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/tmp/w/原稿.docx", buf);
  console.log("written");
});
