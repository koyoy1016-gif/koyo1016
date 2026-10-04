'use strict';
// IT用語ガイド v2 内容(B)：仮想化（章⑤）・クラウド（章⑥）・研究/発表/資格/その他/リモート（章⑦〜⑪）・まとめ（章⑫）
module.exports = function (K, X) {
  const { L, B, slideDef } = K;
  const { N, emit, T, CH, LAYERS } = X;

  // ===== ⑤ 仮想化・コンテナ =====
  emit('VZ1', { lead: '似て見える3つの言葉は、「何を分けるか・何をまとめるか」が違います。まず表で違いを見ます。' });
  emit('VZ2');
  slideDef({
    id: 'G_VZ', ch: CH[4], title: '関係図：仮想化・コンテナの仕組み', lead: 'VM（ハイパーバイザー経由）と、コンテナ（OS経由）の2つの道すじと、それを管理する製品の関係です。', kinds: ['supp'], src: ['G01', 'U01', 'D02', 'D03'], ref: '仮想化・コンテナ',
    notes: N({ read: '左の道すじが仮想マシン、右がコンテナです。左：ハードウェアをハイパーバイザーが分け、その上に仮想マシンができます。右：OSの上でDockerが動き、コンテナを作ります。OpenStackは仮想マシンを管理してプライベートクラウドを作り、Kubernetesは多数のコンテナを管理します。' }),
    blocks: [B.graph({ h: 5.0, levels: [['hardware'], [['hypervisor', 0.2], ['os', 0.8]], [['vm', 0.2], ['docker', 0.8]], [['openstack', 0.2], ['container', 0.8]], [['private', 0.2], ['k8s', 0.8]]], edges: [['hardware', 'hypervisor', '分けて使う'], ['hardware', 'os', '動かす'], ['hypervisor', 'vm', '作る'], ['os', 'docker', '上で動く'], ['docker', 'container', '作る'], ['openstack', 'vm', '管理する'], ['k8s', 'container', '管理する'], ['openstack', 'private', 'を作る']] })],
  });
  T(['virtualization', 'vm', 'hypervisor', 'container', 'docker', 'k8s', 'vmware', 'openstack', 'kvm', 'hyperv', 'private']);
  emit('VZ7'); emit('VZ8');

  // ===== ⑥ クラウド =====
  emit('CL1', { lead: 'AWS・Azure・Google Cloudは、サーバー・保存・DB・AIなど多くの機能を、ネット越しに貸すサービスの総称です。' });
  emit('CL2'); emit('CL3');
  slideDef({
    id: 'G_CL', ch: CH[5], title: '関係図：クラウドの種類とサービス', lead: 'クラウドの実体はデータセンター。「誰が使うか」で2種類に分かれ、パブリックの代表がAWS・Azure・Google Cloudです。', kinds: ['supp'], src: ['G01', 'U01'], ref: 'クラウド',
    notes: N({ read: '上から下へ読みます。クラウドの実体はデータセンターの機械。クラウドはパブリック（多数向け）とプライベート（特定の組織専用）に分かれ、パブリックの例がAWS・Azure・Google Cloudです。AWSを例にすると、仮想サーバー（EC2など）、クラウドストレージ（S3など）、マネージドサービス（RDSなど）を提供しています。他の2社にも同様のサービスがあります。' }),
    blocks: [B.graph({ h: 5.0, pl: [[['datacenter', 0.22], ['cloud', 0.78]], [['public', 0.22], ['private', 0.78]], [['aws', 0.17], ['azure', 0.5], ['gcp', 0.83]], [['cloudvm', 0.17], ['cloudstorage', 0.5], ['managed', 0.83]]], pstep: 1.45, levels: [[['datacenter', 0.3], ['cloud', 0.7]], [['public', 0.55], ['private', 0.9]], [['aws', 0.3], ['azure', 0.6], ['gcp', 0.85]], [['cloudvm', 0.08], ['cloudstorage', 0.3], ['managed', 0.52]]], edges: [['datacenter', 'cloud', '実体になる'], ['public', 'cloud', 'の一種'], ['private', 'cloud', 'の一種'], ['aws', 'public', '例の一つ'], ['azure', 'public', ''], ['gcp', 'public', ''], ['aws', 'cloudvm', 'EC2など'], ['aws', 'cloudstorage', 'S3など'], ['aws', 'managed', 'RDSなど']] })],
  });
  T(['cloud', 'public', 'aws', 'azure', 'gcp', 'cloudvm', 'cloudstorage', 'managed']);
  emit('CL8'); emit('CL9');

  // ===== ⑦ 研究・独学 =====
  emit('RS1', { lead: 'AIの中に機械学習があり、機械学習は「データからパターンを学ぶ」方法です。包含関係を図で確認します。' });
  slideDef({
    id: 'G_RS1', ch: CH[6], title: '関係図：AI・データ・IoT', lead: 'AI・機械学習・データ分析・IoTは、「データ」を軸につながっています。', kinds: ['supp'], src: ['G01', 'U01'], ref: '研究・独学',
    notes: N({ read: 'AIの一部が機械学習で、機械学習はデータを分析してパターンを学びます。IoTは、センサーなどでデータを集める仕組みで、集めたデータを分析に使います。' }),
    blocks: [B.graph({ h: 4.3, pl: [[['ai', 0.5]], [['ml', 0.5]], [['analysis', 0.5]], [['iot', 0.5]]], levels: [['ai'], ['ml'], [['analysis', 0.3], ['iot', 0.75]]], edges: [['ml', 'ai', 'の一部'], ['ml', 'analysis', 'データで学ぶ'], ['iot', 'analysis', 'データを集める']] })],
  });
  emit('RS6');
  // PCの中身（自作PCの部品）
  const pcScene = {
    name: 'pc', h: 4.5, ph: 5.7,
    boxes: [
      { id: 'case', x: 0, y: 0, w: 8.6, h: 4.5, label: 'PCケースの中（自作PCの部品）', role: 'gray' },
      { id: 'mb', x: 0.25, y: 0.65, w: 6.1, h: 3.65, label: 'マザーボード（部品を載せる基板）', role: 'net', fill: 'FFFFFF' },
    ],
    nodes: [
      { id: 'cpu', x: 0.5, y: 1.35, w: 1.5, h: 1.1, label: 'CPU', sub: '計算する', role: 'gray' },
      { id: 'mem', x: 2.9, y: 1.35, w: 1.5, h: 1.1, label: 'メモリ', sub: '作業机', role: 'gray' },
      { id: 'nic', x: 4.7, y: 1.35, w: 1.5, h: 1.1, label: '通信部品', sub: 'LAN・Wi-Fi', role: 'gray' },
      { id: 'ssd', x: 0.5, y: 3.0, w: 2.7, h: 1.1, label: 'SSD', sub: 'M.2スロットなど', role: 'gray' },
      { id: 'hdd', x: 3.4, y: 3.0, w: 2.8, h: 1.1, label: 'HDD', sub: '大容量の倉庫', role: 'gray' },
      { id: 'psu', x: 6.95, y: 0.65, w: 1.55, h: 3.65, label: '電源\nユニット', sub: '電気を送る', role: 'aux' },
    ],
    texts: [{ id: 'memo', x: 8.95, y: 0.2, w: 3.38, h: 4.2, size: 17, t: 'CPU … 計算する頭脳\nメモリ … 作業机\nSSD・HDD … 倉庫\nマザーボード … 道路と土台\n電源ユニット … 心臓\n\n部品の形や規格が合わないと、つながりません（互換性）。' }],
    edges: [{ a: 'cpu', b: 'mem', both: true, label: 'データ' }, { a: 'ssd', b: 'mem', label: '読み込む' }, { a: 'psu', b: 'mb', label: '電気' }],
    p: {
      skip: ['memo'],
      boxes: { case: [0, 0, 5.3, 5.7], mb: [0.15, 0.5, 5.0, 3.6] },
      nodes: { cpu: [0.3, 1.1, 1.45, 1.0, { size: 16 }], mem: [1.95, 1.1, 1.45, 1.0, { size: 16 }], nic: [3.6, 1.1, 1.45, 1.0, { size: 15 }], ssd: [0.3, 2.7, 2.2, 1.0, {}], hdd: [2.7, 2.7, 2.35, 1.0, {}], psu: [0.15, 4.55, 5.0, 0.95, { label: '電源ユニット' }] },
    },
  };
  slideDef({
    id: 'PCSCENE', ch: CH[6], title: 'PCの中身を開けてみる', lead: '自作PCは、主な部品を選んで、マザーボードに載せて組み立てます。どの部品がどの層（ハードウェア）かを見ます。', kinds: ['supp'], src: ['G01', 'U01'], ref: '研究・独学（PCを自作して使用）',
    notes: N({ read: 'PCケースの中に、マザーボード（基板）があり、CPU・メモリ・SSD・HDD・通信部品が載ります。電源ユニットは、各部品に電気を送ります。', detail: ['CPU：計算する頭脳。', 'メモリ：作業中のデータを置く作業机。', 'SSD・HDD：データを保存する倉庫。', 'マザーボード：部品をつなぐ道路と土台。', '電源ユニット：電気を送る心臓。'], extra: '部品には形や規格があり、合わないと組み合わせられません（互換性）。' }),
    blocks: [B.scene(pcScene)],
  });
  emit('RS7');
  slideDef({
    id: 'G_RS2', ch: CH[6], title: '関係図：開発の「対象」を決める', lead: 'アプリ開発は、「どのOSで動かすか」で、使う道具や作り方が変わります。', kinds: ['supp'], src: ['G01', 'U01'], ref: '研究・独学（アプリ開発）',
    notes: N({ read: 'Windows用・Linux用・スマートフォン用のアプリは、それぞれ動く先のOSが違います。' }),
    blocks: [B.graph({ h: 3.4, levels: [[['mobileapp', 0.17], ['winapp', 0.5], ['linuxapp', 0.83]], [['os', 0.17], ['windows', 0.5], ['linux', 0.83]]], edges: [['mobileapp', 'os', '動く先'], ['winapp', 'windows', '動く先'], ['linuxapp', 'linux', '動く先']] }), B.callout('info', 'スマホ（Android・iPhone）にもそれぞれOSがあります。「どのOSの上で動かすか」を最初に決めます。')],
  });
  T(['ai', 'ml', 'automation', 'mobileapp', 'windows', 'linux', 'winapp', 'linuxapp', 'iot', 'pcbuild']);
  emit('RS8');

  // ===== ⑧ 発表・学会 =====
  emit('PR1', { lead: '発表は、どこで行うか（場）と、どんな形で行うか（形）の組み合わせで呼ばれます。' });
  T(['presentation', 'campus', 'domestic', 'overseas', 'conference', 'oral', 'poster']);
  emit('PR6'); emit('PR7');

  // ===== ⑨ IT資格 =====
  emit('CE1', { lead: 'IPAの国家試験には、ITパスポート→基本情報→応用情報という段階があります。MOSはOfficeの操作を測る別系統の資格です。' });
  T(['itpassport', 'fe', 'apexam', 'mos']);
  emit('CE4');

  // ===== ⑩ その他のIT経験 =====
  T(['excel', 'html', 'css', 'git', 'github', 'analysis', 'log', 'backup']);
  emit('OT5'); emit('OT6');

  // ===== ⑪ リモート就業環境 =====
  emit('RM1');
  T(['remote', 'fixedline', 'fiber', 'catv', 'lan', 'wifi', 'router']);
  emit('RM5');

  // ===== ⑫ まとめ =====
  emit('FN1'); emit('FN2');
  const lays = [['app', 'アプリ'], ['mw', 'ミドルウェア'], ['virt', '仮想化'], ['os', 'OS'], ['hw', 'ハードウェア'], ['net', 'ネットワーク'], ['cloud', '置き場所'], ['act', '活動・資格']];
  const idxRows = lay => ({ lay, items: X.G.filter(t => (t.lay || [])[0] === lay).map(t => t.id) });
  [['SIDX1', '用語の層別さくいん（1）', ['app', 'mw'], 'アプリとミドルウェアの用語です。'], ['SIDX2', '用語の層別さくいん（2）', ['virt', 'os', 'hw'], '仮想化・OS・ハードウェアの用語です。'], ['SIDX3', '用語の層別さくいん（3）', ['net', 'cloud', 'act'], 'ネットワーク・置き場所・活動資格の用語です。']].forEach(([id, title, ls, lead]) => {
    slideDef({
      id, ch: CH[11], title, lead: `この資料の全用語を、「いちばん関係の深い層」で並べました。${lead}`, kinds: ['supp'], src: ['G01'], ref: '用語さくいん',
      notes: N({ read: '用語を、主な層ごとに並べた一覧です。複数の層にまたがる用語は、いちばん中心になる層に入れています。' }),
      blocks: [B.tower(ls.map(idxRows))],
    });
  });
  slideDef({
    id: 'FN3', ch: CH[11], title: '確認できたこと・できていないこと', lead: 'この資料の情報の確かさを整理します。たとえ話や図は編集者の解説で、公式の説明ではありません。', kinds: ['supp'], src: ['U01', 'G01'], ref: '情報の確かさ',
    notes: N({ read: '左が確認できたこと、右が確認できていないことです。' , extra: ['確認：貼り付けられた用語表の記載。PostgreSQL・Docker・Kubernetes・Amazon S3の公式説明の概要。IPA試験のレベル区分。', '未確認：貼り付け範囲外。質問票の正式な文面。製品の最新の版・機能・料金。試験制度の今後の見直し。', '層の分け方、関係図、たとえ、場面、学び方は、一般的な技術知識で整理した編集者の解説です。'] }),
    blocks: [B.pair(
      [B.cols([{ title: '確認できたこと', body: ['貼り付けた用語の意味・用途・学び方', '公式資料での概要（PostgreSQL・Docker・Kubernetes・S3）', 'IPA試験のレベルの区分'], role: 'sec', icon: 'FaCheckCircle' }])],
      [B.cols([{ title: '確認できていないこと', body: ['貼り付けの範囲外（ストレージの前半、Wi-Fiの続き）', '質問票の正式な文面', '製品の最新の版・機能・料金、試験制度の今後の見直し'], role: 'warn', icon: 'FaExclamationTriangle' }])],
    ), B.callout('info', '層・関係図・たとえ・場面は、一般的な技術知識で整理した編集者の解説です。公式の定義とは言い回しが違うことがあります。')],
  });
  emit('FN4');
};
