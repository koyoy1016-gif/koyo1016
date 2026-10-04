'use strict';
// IT用語ガイド v2 内容(A)：表紙・導入・全体図・基礎（章①）・ストレージ（章②）・データベース（章③）・アプリケーションサーバー（章④）
module.exports = function (K, X) {
  const { L, B, slideDef, cover, termDef, P } = K;
  const { N, emit, T, CH, LAYERS } = X;
  const KD = ['paste', 'supp'];

  // ===== 表紙 =====
  cover({
    kicker: 'IT用語のやさしい解説',
    title: '図でわかる\nIT用語ガイド',
    sub: 'コンピューターの「どこの話か」を図で示し、用語どうしのつながりまで、高校生にも分かるように説明します',
    meta: '質問票の用語（質問12〜26）を、層・関係図・たとえで解説します。貼り付けは途中から途中までのため、範囲外は含みません。学習用の独自教材です。',
    chips: [
      { label: 'ハードウェア', role: 'gray', icon: 'FaMicrochip' }, { label: 'OS', role: 'net', icon: 'FaDesktop' }, { label: '仮想化', role: 'device', icon: 'FaLayerGroup' },
      { label: 'ミドルウェア', role: 'server', icon: 'FaCogs' }, { label: 'アプリ', role: 'sec', icon: 'FaMobileAlt' }, { label: 'ネットワーク', role: 'aux', icon: 'FaNetworkWired' }, { label: '置き場所', role: 'sky', icon: 'FaCloud' },
    ],
    src: ['U01', 'G01'],
    notes: N({
      read: 'この資料は、IT経験を尋ねる質問票に出てくる用語を、高校生でも分かるように、図・関係図・たとえ話で説明するものです。',
      extra: ['すべての用語ページの上には、「どこの話？」の帯があります。ハードウェア・OS・仮想化・ミドルウェア・アプリ・ネットワーク・置き場所の7つのうち、今の用語がどこにあたるかを色で示します。', '用語の意味・用途は、貼り付けていただいた質問票の解説を土台にしています。「たとえ」や図、前後の用語の補足は、一般的な技術知識で足しました（「補足」ラベル）。', 'パソコン版（横長）と、スマホ版（縦長）の2種類があります。'],
    }),
  });

  // ===== 導入 =====
  slideDef({
    id: 'AIM', ch: CH[0], title: 'この資料のねらい', lead: 'IT用語は、コンピューターの「どの部分」の話なのかが分かりにくく、つまずきやすいものです。3つの工夫で整理します。', kinds: ['supp'], src: ['G01'], ref: '資料の読み方',
    notes: N({ read: '3つのカードが、この資料の工夫です。', detail: ['① どこの話か：すべての用語ページの上に「層」の帯を付け、色で位置を示す。', '② つながり：用語どうしを矢印で結んだ関係図を、用語ごとと章ごとに載せる。', '③ 具体像：実際の機械や場面の図、身近なたとえと具体例で示す。'], extra: '対象の読み手は高校生くらいです。専門用語は、初めて出たときに言い換えを付けています。' }),
    blocks: [
      B.cols([
        { title: '① 場所を示す', body: ['全用語のページに「層」の帯', '色で今の位置が分かる'], role: 'net', icon: 'FaMapMarkerAlt' },
        { title: '② つながりを描く', body: ['用語どうしを矢印で結ぶ', '「何が何を動かすか」が分かる'], role: 'device', icon: 'FaProjectDiagram' },
        { title: '③ 具体的に見せる', body: ['実際の機械・場面の図', 'たとえ話と具体例'], role: 'sec', icon: 'FaEye' },
      ]),
      B.callout('info', '読み手は高校生くらいを想定しています。専門用語は、初めて出たときに言い換えを付けています。'),
    ],
  });
  slideDef({
    id: 'READ', ch: CH[0], title: '用語ページの見かた', lead: '1つの用語は2枚で説明します。1枚目で「意味・場所・つながり」、2枚目で「たとえ・場面・注意・学び方」が分かります。', kinds: ['supp'], src: ['G01'], ref: '資料の読み方',
    notes: N({ read: '色付きの7つの札が「層」です。ページ上部の帯では、今の用語がある層だけが色付きで光ります。', detail: ['関係図：左が今の用語、右がつながる用語。矢印の向きは「〜が〜に（ラベル）する」と読む。例：メモリ →データを渡す→ CPU は「メモリがCPUにデータを渡す」。', '右の用語の色は、その用語の層の色。'], extra: '「補足」ラベル：貼り付けた資料の表にはなく、一般的な説明で補った用語や項目に付けています。' }),
    blocks: [
      B.tags([{ label: 'ハードウェア', role: 'gray' }, { label: 'OS', role: 'net' }, { label: '仮想化', role: 'device' }, { label: 'ミドルウェア', role: 'server' }, { label: 'アプリ', role: 'sec' }, { label: 'ネットワーク', role: 'aux' }, { label: '置き場所', role: 'sky' }, { label: '活動・資格', role: 'rose' }]),
      B.cols([
        { title: '1枚目', body: ['「どこの話？」の帯', '場所・くわしい説明', '右に関係図'], role: 'net', icon: 'FaBook' },
        { title: '2枚目', body: ['たとえるなら', 'こんな場面で', '勘違い・最初の学び方'], role: 'aux', icon: 'FaLightbulb' },
      ]),
      B.callout('info', '関係図の矢印は「左 → 右」で読みます。「メモリ →（データを渡す）→ CPU」は「メモリがCPUにデータを渡す」という意味です。'),
    ],
  });

  // ===== 全体の見取り図 =====
  // 1台のコンピューターの切り開き図（5つの層）
  const cut = (() => {
    const rows = [
      { lay: 'app', items: [['Webアプリ', 1.7], ['スマホアプリ', 2.0], ['Excel・Git・HTML', 2.6]] },
      { lay: 'mw', items: [['Webサーバー', 1.8], ['アプリサーバー', 2.0], ['データベース（DBMS）', 2.9]] },
      { lay: 'virt', items: [['ハイパーバイザー（VM）', 3.3], ['Docker（コンテナ）', 2.7]] },
      { lay: 'os', items: [['Linux', 1.4], ['Windows', 1.7], ['ファイルシステム', 2.4]] },
      { lay: 'hw', items: [['CPU', 1.1], ['メモリ', 1.3], ['SSD・HDD', 1.8], ['NIC（通信部品）', 2.3]] },
    ];
    const boxes = [], nodes = [], texts = [], pb = {}, pn = {}, pt = {};
    let py = 0;
    rows.forEach((r, i) => {
      const Ly = LAYERS[r.lay];
      const y = i * 0.82;
      boxes.push({ id: 'b' + i, x: 0, y, w: 9.1, h: 0.74, label: Ly.t, role: Ly.role, fill: K.ROLE[Ly.role].l });
      let x = 2.1;
      r.items.forEach((it, j) => { nodes.push({ id: `n${i}_${j}`, x, y: y + 0.12, w: it[1], h: 0.5, label: it[0], role: Ly.role, fill: 'FFFFFF', size: 17 }); x += it[1] + 0.12; });
      texts.push({ id: 't' + i, x: 9.35, y, w: 2.98, h: 0.74, t: Ly.d, size: 16 });
      // 縦長：2列のグリッド
      const rowsN = Math.ceil(r.items.length / 2);
      const bh = 0.42 + rowsN * 0.52 + 0.03;
      pb['b' + i] = [0, py, 5.3, bh, { label: Ly.t + '　' + Ly.d, size: 15 }];
      r.items.forEach((it, j) => { const col = j % 2, rr = Math.floor(j / 2); const short = { 'ハイパーバイザー（VM）': 'ハイパーバイザー', 'データベース（DBMS）': 'データベース', 'Excel・Git・HTML': 'Excel・Git等' }[it[0]]; pn[`n${i}_${j}`] = [0.12 + col * 2.6, py + 0.42 + rr * 0.52, 2.46, 0.46, { size: 15, label: short }]; });
      py += bh + 0.08;
    });
    return { boxes, nodes, texts, p: { boxes: pb, nodes: pn, skip: rows.map((_, i) => 't' + i) }, h: 4.02, ph: py - 0.1, name: 'cutaway' };
  })();
  slideDef({
    id: 'LAYERS', ch: CH[0], title: 'コンピューターの中は「層」になっている', lead: '1台のコンピューターは、下から順に積み重なった5つの層でできています。上ほど使う人に近く、下ほど機械そのものです。上の層は、すぐ下の層の働きを使って動きます。', kinds: ['supp'], src: ['G01'], ref: '全体の見取り図',
    notes: N({ read: '下から上へ、ハードウェア→OS→仮想化→ミドルウェア→アプリの順に積み重なります。各段に、この資料に出てくる用語の例を並べました。', detail: ['ハードウェア：CPU・メモリ・SSD・HDDなどの機械と部品。', 'OS：機械を動かす基本ソフト。Windows・Linuxなど。', '仮想化：1台の機械を分けて使う（VM）、アプリを箱に詰めて動かす（コンテナ）技術。', 'ミドルウェア：データベース・Webサーバーなど、アプリを支える土台のソフト。', 'アプリ：使う人・作る人が直接さわるソフト。'], extra: '上の層は、すぐ下の層の働きを使って動きます。' }),
    blocks: [B.scene(cut)].concat(P ? [] : [B.callout('info', '上の層は、すぐ下の層の働きを使って動きます。どの用語も、この5つの層のどこかに入ります。')]),
  });

  const byLay = lay => X.G.filter(t => (t.lay || [])[0] === lay).map(t => t.id);
  const pick = (lay, n, prefer) => { const all = byLay(lay); const pre = (prefer || []).filter(i => all.includes(i)); return pre.concat(all.filter(i => !pre.includes(i))).slice(0, n); };
  slideDef({
    id: 'TOWER1', ch: CH[0], title: '層ごとの用語マップ（1台の中）', lead: 'この資料の用語を、5つの層に分けて並べました。用語ページの色は、この層の色と同じです。', kinds: ['supp'], src: ['G01'], ref: '全体の見取り図',
    notes: N({ read: '行の左が層の名前と役目、右がその層に属する主な用語です。全用語の一覧は、巻末の「用語の層別さくいん」にあります。' }),
    blocks: [B.tower([
      { lay: 'app', items: ['excel', 'html', 'git', 'mobileapp', 'servlet', 'ai'] },
      { lay: 'mw', items: ['db', 'dbms', 'sql', 'webserver', 'apserver', 'postgres'] },
      { lay: 'virt', items: ['virtualization', 'vm', 'hypervisor', 'container', 'docker', 'k8s'] },
      { lay: 'os', items: ['os', 'windows', 'linux', 'fs', 'kvm', 'hyperv'] },
      { lay: 'hw', items: ['hardware', 'cpu', 'memory', 'ssd', 'hdd', 'raid'] },
    ])],
  });
  slideDef({
    id: 'TOWER2', ch: CH[0], title: '層ごとの用語マップ（外側と活動）', lead: 'コンピューターの「外側」には、つなぐ道（ネットワーク）と、置き場所があります。技術以外の「活動・資格」も別に並べました。', kinds: ['supp'], src: ['G01'], ref: '全体の見取り図',
    notes: N({ read: 'ネットワークは機械どうしをつなぐ道、置き場所は機械がどこにあるか・どう借りるかの話です。活動・資格は技術の層ではなく、人の活動です。' }),
    blocks: [B.tower([
      { lay: 'net', items: ['network', 'internet', 'lan', 'wifi', 'router', 'fiber'] },
      { lay: 'cloud', items: ['datacenter', 'cloud', 'public', 'private', 'aws', 's3'] },
      { lay: 'act', items: ['remote', 'presentation', 'conference', 'itpassport', 'fe', 'mos'] },
    ])],
  });

  // ITの場所の地図
  const mapScene = {
    name: 'map', h: 4.6, ph: 8.05,
    boxes: [
      { id: 'me', x: 0, y: 0, w: 2.6, h: 4.6, label: '手元（自宅・学校）', role: 'gray' },
      { id: 'line', x: 2.85, y: 0, w: 2.15, h: 4.6, label: '通信（道すじ）', role: 'aux' },
      { id: 'dc', x: 5.3, y: 0, w: 7.03, h: 2.2, label: '会社のサーバー室', role: 'server' },
      { id: 'cloud', x: 5.3, y: 2.4, w: 7.03, h: 2.2, label: 'クラウド（事業者のデータセンター）', role: 'sky' },
    ],
    nodes: [
      { id: 'phone', x: 0.15, y: 0.5, w: 2.3, h: 1.1, label: 'スマホ・PC', sub: 'ブラウザー・アプリ', role: 'gray' },
      { id: 'wifi', x: 0.15, y: 1.9, w: 2.3, h: 1.1, label: 'Wi-Fi／有線LAN', sub: '家の中の通信', role: 'aux' },
      { id: 'router', x: 0.15, y: 3.3, w: 2.3, h: 1.1, label: 'ルーター', sub: '外とつなぐ機械', role: 'aux' },
      { id: 'fixed', x: 3.0, y: 3.3, w: 1.85, h: 1.1, label: '固定回線', sub: '光・ケーブルTV', role: 'aux' },
      { id: 'internet', x: 3.0, y: 1.75, w: 1.85, h: 1.1, label: 'インター\nネット', sub: '世界の通信網', role: 'aux' },
      { id: 'web', x: 5.45, y: 0.55, w: 1.45, h: 1.45, label: 'Web\nサーバー', sub: 'ページを渡す', role: 'server' },
      { id: 'ap', x: 7.2, y: 0.55, w: 1.45, h: 1.45, label: 'アプリ\nサーバー', sub: '処理する', role: 'server' },
      { id: 'db', x: 8.95, y: 0.55, w: 1.45, h: 1.45, label: 'DB\nサーバー', sub: 'データ管理', role: 'server' },
      { id: 'st', x: 10.7, y: 0.55, w: 1.5, h: 1.45, label: 'ストレージ', sub: 'NAS・SAN', role: 'gray' },
      { id: 'aws', x: 5.45, y: 2.95, w: 2.3, h: 1.45, label: 'AWS・Azure・Google Cloud', sub: 'サービスの総称', role: 'sky' },
      { id: 'cvm', x: 7.95, y: 2.95, w: 2.1, h: 1.45, label: 'クラウドの仮想サーバー', sub: 'ネット越しに借りる', role: 'sky' },
      { id: 'cs', x: 10.25, y: 2.95, w: 1.95, h: 1.45, label: 'クラウドストレージ', sub: 'S3など', role: 'sky' },
    ],
    edges: [
      { a: 'phone', b: 'wifi', both: true }, { a: 'wifi', b: 'router', both: true }, { a: 'router', b: 'fixed', both: true }, { a: 'fixed', b: 'internet', both: true },
      { a: 'internet', b: 'web', both: true }, { a: 'internet', b: 'aws', both: true },
      { a: 'web', b: 'ap' }, { a: 'ap', b: 'db' }, { a: 'db', b: 'st' },
    ],
    p: {
      skip: ['line'],
      boxes: { me: [0, 0, 5.3, 1.65], dc: [0, 4.2, 2.6, 3.85, { label: 'サーバー室', size: 16 }], cloud: [2.7, 4.2, 2.6, 3.85, { label: 'クラウド', size: 16 }] },
      nodes: {
        phone: [0.1, 0.5, 1.55, 1.0, { size: 15, subSize: 13 }], wifi: [1.9, 0.5, 1.55, 1.0, { size: 15, subSize: 13 }], router: [3.7, 0.5, 1.55, 1.0, { size: 15, subSize: 13 }],
        fixed: [2.95, 1.85, 2.2, 0.85, {}], internet: [2.6, 3.0, 2.5, 0.85, { label: 'インターネット' }],
        web: [0.15, 4.7, 2.3, 0.62, { size: 16, nosub: true, label: 'Webサーバー' }], ap: [0.15, 5.55, 2.3, 0.62, { size: 16, nosub: true, label: 'アプリサーバー' }], db: [0.15, 6.4, 2.3, 0.62, { size: 16, nosub: true, label: 'DBサーバー' }], st: [0.15, 7.25, 2.3, 0.62, { size: 16, nosub: true }],
        aws: [2.85, 4.7, 2.3, 0.95, { size: 15 }], cvm: [2.85, 5.75, 2.3, 0.95, { size: 15 }], cs: [2.85, 6.8, 2.3, 0.95, { size: 15 }],
      },
      edges: { 'internet>web': { label: '' }, 'internet>aws': { label: '' } },
    },
  };
  slideDef({
    id: 'MAP', ch: CH[0], title: 'ITの「場所」の地図', lead: '手元のスマホから、通信の道すじ、会社のサーバー室やクラウドまで。用語は、この地図のどこかの話です。', kinds: ['supp'], src: ['G01'], ref: '全体の見取り図',
    notes: N({ read: '左から右へ、手元（スマホ・PC）→通信（Wi-Fi・ルーター・固定回線・インターネット）→サーバーの置き場所（会社のサーバー室／クラウド）です。', detail: ['サーバー室：会社や学校の建物の中にある、サーバーを置く部屋。', 'クラウド：事業者が持つデータセンターの機械を、インターネット越しに借りる使い方。', '上の「層」（ハードウェア・OSなど）は1台の機械の中の話、この地図は「どこに何があるか」の話です。'] }),
    blocks: [B.scene(mapScene)],
  });
  slideDef({
    id: 'JOURNEY', ch: CH[0], title: 'ボタンを押してから画面が出るまで', lead: 'スマホで「注文」を押すと、次の順に情報が旅をします。それぞれの場所が、どの層の用語かも示します。', kinds: ['supp'], src: ['G01'], ref: '全体の見取り図',
    notes: N({ read: '1から7の順に、情報が進みます。かっこの中は、その用語がある層です。', extra: 'この流れの一部（Webサーバー・アプリケーションサーバー・データベース）の役割は、④⑤の章で詳しく説明します。' }),
    blocks: [B.steps([
      '**スマホ**（ハードウェア）で、アプリの「注文」ボタンを押す。',
      '**Wi-Fi**（ネットワーク）で、家のルーターへ送る。',
      '**光回線**と**インターネット**（ネットワーク）を通って、会社へ届く。',
      '**サーバー室**（置き場所）の**Webサーバー**（ミドルウェア）が受け取る。',
      '**アプリサーバー**が注文を処理し、**データベース**に保存を頼む。',
      'データベースが、**SSD**などの**ストレージ**（ハードウェア）に書き込む。',
      '結果が同じ道を戻り、スマホに「注文完了」と表示される。',
    ], 'navy')],
  });
  emit('MAP1', { lead: 'この資料は、質問票の用語を10のテーマに分けて説明します。章の順番と、貼り付けの範囲です。' });

  // ===== ① 基礎の用語 =====
  T(['hardware', 'cpu', 'os', 'software', 'serverclient', 'network', 'internet', 'datacenter', 'middleware']);

  // ===== ② ストレージ =====
  emit('ST1', { lead: 'パソコンの中でデータを置く場所は2種類あります。役割が違うので、最初に区別します。' });
  const stScene = {
    name: 'storage', h: 4.5, ph: 8.4,
    boxes: [
      { id: 'pc', x: 0, y: 0, w: 5.3, h: 4.5, label: '自分のPCの中（部品どうしが直接つながる）', role: 'gray' },
      { id: 'room', x: 5.6, y: 0, w: 6.73, h: 4.5, label: '会社のサーバー室', role: 'server' },
    ],
    nodes: [
      { id: 'cpu', x: 0.15, y: 0.65, w: 1.4, h: 1.0, label: 'CPU', sub: '計算する頭脳', role: 'gray' },
      { id: 'mem', x: 2.4, y: 0.65, w: 1.5, h: 1.0, label: 'メモリ', sub: '作業机', role: 'gray' },
      { id: 'ssd', x: 1.5, y: 2.5, w: 1.9, h: 1.3, label: 'SSD', sub: 'M.2・NVMeで高速', role: 'gray' },
      { id: 'hdd', x: 3.55, y: 2.5, w: 1.6, h: 1.3, label: 'HDD', sub: '大容量・安価', role: 'gray' },
      { id: 'nas', x: 9.6, y: 0.65, w: 2.5, h: 1.3, label: 'NAS', sub: '共有フォルダーとして使う', role: 'aux' },
      { id: 'srv', x: 5.8, y: 2.55, w: 2.2, h: 1.3, label: 'サーバー', sub: 'アプリ・DB', role: 'server' },
      { id: 'arr', x: 9.6, y: 2.45, w: 2.5, h: 1.6, label: 'ストレージ装置', sub: 'ディスクとして使う', role: 'gray' },
    ],
    edges: [
      { a: 'cpu', b: 'mem', both: true, label: 'データ' }, { a: 'ssd', b: 'mem', label: '読み込む' }, { a: 'hdd', b: 'mem' },
      { a: 'pc', b: 'nas', both: true, label: 'LAN' }, { a: 'srv', b: 'arr', both: true, label: 'SAN' },
    ],
    p: {
      boxes: { pc: [0, 0, 5.3, 3.5, { label: '自分のPCの中', size: 16 }], room: [0, 4.2, 5.3, 4.2, { label: 'サーバー室', size: 16 }] },
      nodes: {
        cpu: [0.15, 0.55, 1.5, 0.95, { size: 16 }], mem: [2.0, 0.55, 1.5, 0.95, { size: 16 }], ssd: [0.15, 2.1, 2.4, 1.1, {}], hdd: [2.75, 2.1, 2.4, 1.1, {}],
        nas: [2.95, 4.85, 2.2, 1.1, { size: 16 }], srv: [0.15, 6.5, 1.9, 1.1, { size: 16 }], arr: [2.95, 6.3, 2.2, 1.7, { size: 16 }],
      },
      edges: { 'pc>nas': { label: 'LAN' }, 'srv>arr': { label: 'SAN' }, 'ssd>mem': { label: '' } },
    },
  };
  slideDef({
    id: 'STSCENE', ch: CH[1], title: 'データの置き場所の具体像', lead: '同じ「保存」でも、PCの中の部品と、サーバー室の共有装置では、つなぎ方が違います。', kinds: ['supp'], src: ['G01', 'U01'], ref: 'ストレージ（NAS・SANの説明）',
    notes: N({ read: '左がPCの中（CPU・メモリ・SSD・HDDが直接つながる）、右が会社のサーバー室（サーバー・NAS・ストレージ装置）です。', detail: ['PCの中：CPUはメモリのデータで計算し、メモリへはSSDやHDDから読み込む。', 'NAS：PCからLAN越しに「共有フォルダー」として使う（貼り付けの記載：主に共有ファイル）。', 'SAN：サーバーからは「ディスク」のように見える保存領域（貼り付けの記載：主にディスクに相当する保存領域）。'] }),
    blocks: [B.scene(stScene)],
  });
  emit('ST2', { lead: '保存のしかたは、ファイル・ブロック・オブジェクトの3つで整理できます。' });
  emit('ST3', { lead: 'どちらも「ネットワークでつなぐ保存装置」です。使う側から見える姿が違います。' });
  slideDef({
    id: 'G_ST1', ch: CH[1], title: '関係図：ストレージの部品', lead: 'CPU・メモリ・ストレージと、SSD・HDD・NVMe・M.2・RAIDがどうつながるかを、1枚で整理します。', kinds: ['supp'], src: ['G01'], ref: 'ストレージ',
    notes: N({ read: '上から下へ読みます。CPUがメモリのデータで計算し、メモリはストレージから読み込みます。ストレージの種類がSSDとHDD、SSDを速く使う規格がNVMe、SSDの部品の形がM.2、複数のドライブを束ねるのがRAIDです。' }),
    blocks: [B.graph({ h: 4.8, levels: [[['cpu', 0.2]], [['memory', 0.2], ['storage', 0.65]], [['ssd', 0.45], ['hdd', 0.85]], [['nvme', 0.28], ['m2', 0.58], ['raid', 0.85]]], pl: [[['cpu', 0.5]], [['memory', 0.2], ['storage', 0.78]], [['ssd', 0.25], ['hdd', 0.8]], [['nvme', 0.15], ['m2', 0.52], ['raid', 0.85]]], edges: [['cpu', 'memory', 'データを渡す', 'both'], ['storage', 'memory', '読み込む'], ['ssd', 'storage', '種類の一つ'], ['hdd', 'storage', '種類の一つ'], ['nvme', 'ssd', '高速に使う'], ['m2', 'ssd', '部品の形'], ['raid', 'hdd', '束ねる']] })],
  });
  slideDef({
    id: 'G_ST2', ch: CH[1], title: '関係図：保存のしかたと置き場所', lead: 'ファイル・ブロック・オブジェクトの3つの方式と、それぞれを提供する装置・サービスの関係です。', kinds: ['supp'], src: ['G01', 'U01', 'D04'], ref: 'ストレージ',
    notes: N({ read: '上段が3つの方式、中段がその代表的な装置・サービスです。NASはファイル、SANはブロック（ディスクとして見える領域）、S3はオブジェクトを提供します。FCoEはSANの通信をEthernetに載せる技術、RAIDは故障に備える仕組みです。' }),
    blocks: [B.graph({ h: 4.8, levels: [['fs', 'block', 'object'], ['nas', 'san', 's3'], [['raid', 0.17], ['fcoe', 0.5]]], edges: [['nas', 'fs', 'ファイルを提供'], ['san', 'block', 'ディスクを提供'], ['s3', 'object', '代表サービス'], ['raid', 'nas', '故障に備える'], ['fcoe', 'san', '通信を運ぶ']] })],
  });
  T(['memory', 'storage', 'ssd', 'hdd', 'nvme', 'm2', 'fs', 'block', 'object', 's3', 'nas', 'san', 'fcoe', 'raid']);
  emit('ST10', { lead: 'RAIDはドライブが壊れても動き続ける仕組みです。誤って消したデータは戻せないので、バックアップは別に必要です。' });
  emit('ST11'); emit('ST12');

  // ===== ③ データベース =====
  emit('DB1', { lead: '大量の情報を決まった形（表）で整理し、必要なものを素早く取り出せるようにした仕組みです。' });
  emit('DB2'); emit('DB3');
  slideDef({
    id: 'G_DB1', ch: CH[2], title: '関係図：DBまわりの用語', lead: 'SQL・DBMS・DB・DBサーバー・ストレージが、どうつながるかを整理します。', kinds: ['supp'], src: ['G01', 'U01'], ref: 'データベース',
    notes: N({ read: '上から下へ読みます。アプリがSQLでDBMSにお願いし、DBMSがDB（データの表）を管理し、最後はストレージに保存されます。DBサーバーは、DBMSを動かす機械です。RDBは、DBが表でデータを管理する方式です。' }),
    blocks: [B.graph({ h: 4.8, levels: [['sql'], ['dbms'], [['dbserver', 0.2], ['db', 0.5], ['rdb', 0.82]], ['storage']], pl: [[['sql', 0.5]], [['dbserver', 0.2], ['dbms', 0.78]], [['db', 0.78]], [['rdb', 0.2], ['storage', 0.78]]], edges: [['sql', 'dbms', 'お願いする'], ['dbms', 'db', '管理する'], ['dbserver', 'dbms', '動かす', 'out'], ['rdb', 'db', '表の方式'], ['db', 'storage', '保存する']] })],
  });
  T(['db', 'dbms', 'rdb', 'sql', 'dbserver']);
  emit('SQL1'); emit('SQL2'); emit('SQL3'); emit('REL');
  T(['oracle', 'postgres', 'db2', 'sqlserver', 'mysql', 'awsdb', 'mongodb']);
  const db2P = {
    name: 'dbproducts', ph: 7.6,
    boxes: [{ id: 'rdb', label: 'RDB：表で管理する方式', role: 'server' }, { id: 'com', label: '商用', role: 'gray' }, { id: 'oss', label: 'オープンソース', role: 'sec' }, { id: 'other', label: '表以外の方式', role: 'sec' }, { id: 'cloud', label: 'クラウドで提供', role: 'sky' }],
    nodes: [{ id: 'oracle', label: 'Oracle Database', role: 'server' }, { id: 'db2', label: 'Db2', role: 'server' }, { id: 'sqlserver', label: 'SQL Server', role: 'server' }, { id: 'postgres', label: 'PostgreSQL', role: 'sec' }, { id: 'mysql', label: 'MySQL', role: 'sec' }, { id: 'mongodb', label: 'MongoDB', sub: '文書の形で保存', role: 'sec' }, { id: 'awsdb', label: 'AWSのデータベース', sub: 'RDS・DynamoDBなど', role: 'sky' }, { id: 'ttl', label: 'DBMS（管理ソフト）の仲間わけ', role: 'navy', solid: true }],
    edges: [],
    p: {
      boxes: { rdb: [0, 1.0, 5.3, 3.85], com: [0.15, 1.55, 2.4, 3.15], oss: [2.75, 1.55, 2.4, 3.15], other: [0, 5.05, 5.3, 1.35], cloud: [0, 6.6, 5.3, 1.0] },
      nodes: { ttl: [0, 0, 5.3, 0.75, { size: 17 }], oracle: [0.25, 2.1, 2.2, 0.75, { size: 16 }], db2: [0.25, 2.95, 2.2, 0.75, { size: 16 }], sqlserver: [0.25, 3.8, 2.2, 0.75, { size: 16 }], postgres: [2.85, 2.1, 2.2, 0.75, { size: 16 }], mysql: [2.85, 2.95, 2.2, 0.75, { size: 16 }], mongodb: [0.2, 5.5, 4.9, 0.75, { size: 16 }], awsdb: [1.9, 6.95, 3.3, 0.55, { size: 15, nosub: true }] },
    },
  };
  slideDef({
    id: 'G_DB2', ch: CH[2], title: '関係図：データベース製品の仲間わけ', lead: '製品名がたくさんありますが、「表で管理する方式（RDB）」かどうかと、提供のしかたで整理できます。', kinds: ['supp'], src: ['G01', 'U01'], ref: 'データベース',
    notes: N({ read: 'DBMS（管理ソフト）の製品は、大きく表で管理するRDBと、MongoDBのような表以外の方式に分かれます。RDBには商用（Oracle・Db2・SQL Server）とオープンソース（PostgreSQL・MySQL）があります。AWSのデータベースは、クラウドで提供される形です。' }),
    blocks: [P ? B.scene(db2P) : B.graph({ h: 4.4, levels: [['dbms'], [['rdb', 0.3], ['mongodb', 0.62], ['awsdb', 0.9]], [['oracle', 0.1], ['db2', 0.29], ['sqlserver', 0.48], ['postgres', 0.67], ['mysql', 0.86]]], edges: [['rdb', 'dbms', '表の方式'], ['mongodb', 'dbms', '表以外'], ['awsdb', 'dbms', 'クラウド提供'], ['oracle', 'rdb', '商用'], ['db2', 'rdb', ''], ['sqlserver', 'rdb', ''], ['postgres', 'rdb', 'OSS'], ['mysql', 'rdb', '']] })],
  });
  emit('DB10');

  // ===== ④ アプリケーションサーバー =====
  emit('AP1', { lead: 'ブラウザーでページを開くとき、裏ではWebサーバー・アプリケーションサーバー・DBが役割を分けて働いています。' });
  emit('AP2');
  const apP = {
    name: 'ap', ph: 7.2,
    boxes: [{ id: 'prod', label: 'APサーバーの製品・仕組み（Java）', role: 'server' }],
    nodes: [{ id: 'internet', label: 'インターネット', sub: 'ネットワーク', role: 'aux' }, { id: 'web', label: 'Webサーバー', sub: 'ミドルウェア', role: 'server' }, { id: 'ap', label: 'アプリサーバー', sub: 'ミドルウェア', role: 'server', solid: true }, { id: 'dbms', label: 'DBMS', sub: 'ミドルウェア', role: 'server' }, { id: 'deploy', label: 'デプロイ', sub: '置く作業', role: 'server' }, { id: 'tomcat', label: 'Tomcat', role: 'server' }, { id: 'jetty', label: 'Jetty', role: 'server' }, { id: 'weblogic', label: 'WebLogic', role: 'server' }, { id: 'servlet', label: 'サーブレット', sub: '処理の仕組み', role: 'sec' }],
    edges: [{ a: 'internet', b: 'web', label: 'リクエスト' }, { a: 'web', b: 'ap', label: '処理を渡す' }, { a: 'ap', b: 'dbms', label: '保存', lsize: 14 }, { a: 'deploy', b: 'ap' }, { a: 'prod', b: 'ap', label: '中で動く' }],
    p: {
      boxes: { prod: [0, 4.2, 5.3, 2.9] },
      nodes: { internet: [1.3, 0, 2.7, 0.8, { size: 16 }], web: [1.3, 1.25, 2.7, 0.8, { size: 16 }], ap: [1.55, 2.55, 2.4, 0.9, { size: 16 }], dbms: [4.05, 2.55, 1.25, 0.9, { size: 15, nosub: true }], deploy: [0.0, 2.55, 1.3, 0.9, { size: 15, nosub: true }], tomcat: [0.15, 4.75, 2.4, 0.75, { size: 16 }], jetty: [2.75, 4.75, 2.4, 0.75, { size: 16 }], weblogic: [0.15, 5.6, 2.4, 0.75, { size: 16 }], servlet: [2.75, 5.6, 2.4, 0.75, { size: 15, nosub: true }] },
    },
  };
  slideDef({
    id: 'G_AP', ch: CH[3], title: '関係図：Webアプリを支える用語', lead: 'Webサーバー・アプリケーションサーバーと、Tomcat・Jetty・WebLogic・サーブレット・デプロイの関係です。', kinds: ['supp'], src: ['G01', 'U01'], ref: 'アプリケーションサーバー',
    notes: N({ read: '上から下へ、インターネットからのリクエストがWebサーバー、アプリケーションサーバーへと進み、データベースに保存を頼みます。Tomcat・Jetty・WebLogicはJavaのWebアプリを動かす製品、サーブレットはその中で要求を処理する仕組み、デプロイはアプリを置いて使える状態にする作業です。' }),
    blocks: [P ? B.scene(apP) : B.graph({ h: 4.9, levels: [[['internet', 0.3]], [['webserver', 0.3], ['deploy', 0.82]], [['apserver', 0.3], ['dbms', 0.75]], [['servlet', 0.1], ['tomcat', 0.33], ['jetty', 0.56], ['weblogic', 0.79]]], edges: [['internet', 'webserver', 'リクエスト'], ['webserver', 'apserver', '処理を渡す'], ['apserver', 'dbms', '保存を頼む'], ['deploy', 'apserver', '配置する'], ['servlet', 'apserver', '中で動く'], ['tomcat', 'apserver', '製品'], ['jetty', 'apserver', ''], ['weblogic', 'apserver', '']] })],
  });
  T(['webserver', 'apserver', 'tomcat', 'weblogic', 'jetty', 'servlet', 'deploy']);
  emit('AP7');
};
