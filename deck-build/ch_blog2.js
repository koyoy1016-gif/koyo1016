'use strict';
// ブログ解説デッキ 中盤：⑤OS・Linux ⑥データベース
module.exports = function (L, ctx) {
  const { C, ROLE, N, node, head, card, callout, stat, badge, arrow, table, sequence, txt, bullets, rect, legend, numList, code } = L;
  const R = ROLE;
  const C5 = '⑤ OS・Linux', C6 = '⑥ データベース';
  const M = 'Courier New';
  const mono = t => ({ t, face: M, size: 18 });

  // ===== OS1 OSの役割 =====
  {
    const s = L.slide({ ch: C5, title: 'OSの役割：ハードとアプリの間で資源を管理する', lead: 'OSは、CPU・メモリ・記憶装置・通信機器などの資源を管理し、アプリが使いやすい形で提供するソフトです。ブログは、構成要素と役割を学ぶことを勧めています。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識：構成要素や役割」', notes: N({
      read: '左の4つが「積み重なり」です。利用者が使うアプリやシェルは、OSの中心部（カーネル）を通して、ハードウェアを使います。右の表は、カーネルの主な5つの仕事です。',
      terms: ['カーネル：OSの中心部。ハードウェアを直接管理する。', 'シェル：利用者が打ち込むコマンドを解釈してカーネルに伝えるソフト（bashなど）。', 'システムコール：アプリがカーネルに仕事を頼む窓口。', 'ドライバ：機器を動かすための制御プログラム。'],
      detail: ['プロセス管理：実行中のプログラム（プロセス）にCPUの時間を割り当てる（スケジューリング）。', 'メモリ管理：各プロセスにメモリを割り当て、仮想メモリで足りない分をディスクで補う。', 'ファイルシステム：データをファイルとディレクトリの形で保存・管理する。', 'デバイス管理：ディスク・ネットワークカードなどを、ドライバを通して使えるようにする。', 'ユーザー・権限管理：誰が何をしてよいかを管理する。'],
      ex: '第1部の「OSが宛先IPと経路表で渡し先を決める」は、カーネルのネットワーク機能の仕事です。',
    }) });
    [['利用者', 'device', 'FaUser'], ['アプリ・シェル', 'server', 'FaTerminal'], ['カーネル（OSの中心）', 'server', 'FaCogs'], ['ハードウェア', 'gray', 'FaMicrochip']].forEach((t, i) => {
      const y = 1.95 + i * 1.22;
      node(s, 0.5, y, 4.9, 0.95, t[0], { role: t[1], solid: i === 2, size: 20, icon: t[2], line: i === 2 ? false : undefined });
      if (i < 3) arrow(s, 2.95, y + 0.95, 2.95, y + 1.22, { color: C.ink, w: 2.5, both: true });
    });
    table(s, [['カーネルの仕事', 'やっていること'], ['プロセス管理', '実行中のプログラムにCPU時間を割り当てる'], ['メモリ管理', 'メモリを割り当て、足りない分はディスクで補う'], ['ファイル管理', 'データをファイル・ディレクトリで保存'], ['デバイス管理', 'ディスクや通信機器をドライバで使う'], ['権限管理', '誰が何をしてよいかを決める']], { x: 5.7, y: 1.95, colW: [2.5, 4.63], size: 18, padY: 4, minRow: 0.75, rowRole: { 1: 'server', 2: 'server', 3: 'server', 4: 'server', 5: 'sec' } });
  }

  // ===== OS2 ディレクトリ =====
  {
    const s = L.slide({ ch: C5, title: 'Linuxのディレクトリ構成：どこに何があるか', lead: 'Linuxは「/（ルート）」を頂点に、1本の木のようにファイルを置きます。設定は/etc、ログは/var/log、利用者のファイルは/home、と場所の意味が決まっています。', kinds: ['general', 'book'], src: ['K03'], ref: 'ブログ「OSの基礎知識」＋書籍④のLinux基礎', notes: N({
      read: '左の列がディレクトリ名、右がそこに置かれるものです。障害調査では、設定（/etc）とログ（/var/log）を見ることが非常に多くなります。',
      terms: ['ディレクトリ：フォルダのこと。ルートディレクトリ「/」：すべての出発点。', '絶対パス：/から書く場所の指定（例：/etc/hosts）。相対パス：今いる場所から書く指定（例：../docs）。'],
      detail: ['/bin・/sbin：基本コマンド（sbinは管理者向け）。/etc：設定ファイル。/home：一般ユーザーのホーム。/root：管理者（root）のホーム。/var：変化するデータ（ログ・キャッシュ）。/tmp：一時ファイル。/usr：アプリやライブラリ。/dev：機器を表す特殊ファイル。/proc：カーネルやプロセスの情報（実体は仮想）。', 'Linux標準教科書には、Linuxの基本操作とコマンドの章があります[K03]。'],
      myth: 'Windowsのドライブ（C:など）とは構成が違います。Linuxではすべてが/の下に一つの木としてつながり、ディスクは「マウント」して木に接続します。',
    }) });
    table(s, [['ディレクトリ', '置かれるもの'], [mono('/bin  /sbin'), '基本コマンド（sbinは管理者向け）'], [mono('/etc'), '設定ファイル'], [mono('/home'), '一般ユーザーのホーム'], [mono('/root'), '管理者（root）のホーム'], [mono('/var'), 'ログ・キャッシュなど変わるデータ'], [mono('/tmp'), '一時ファイル'], [mono('/usr'), 'アプリ・ライブラリ'], [mono('/dev'), '機器を表す特殊ファイル'], [mono('/proc'), 'カーネル・プロセスの情報']], { x: 0.5, y: 1.95, colW: [3.6, 8.73], size: 18, padY: 3, minRow: 0.48, firstBold: false });
  }

  // ===== OS3 基本コマンド① =====
  {
    const s = L.slide({ id: 'CMD1', ch: C5, title: '基本コマンド①：移動・作る・コピー・消す', lead: 'コマンドはシェルに打ち込む命令です。まず「今どこにいるか」「何があるか」「移動する」「作る・写す・消す」の8つを使えるようにします。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識：基本的なコマンド」', notes: N({
      read: '左がコマンド、中央が意味、右が使用例です。書式は「コマンド　オプション　対象」です。',
      terms: ['オプション：コマンドの動きを変える付け足し（例：-l＝詳しく、-r＝中身ごと）。', 'カレントディレクトリ：今いる場所。'],
      detail: ['pwd：今いる場所を表示。ls -l：ファイル一覧を詳しく（権限・サイズ・日時）。cd：移動（cd ..＝1つ上、cd ~＝ホーム）。mkdir：ディレクトリを作る。touch：空のファイルを作る（日時の更新にも使う）。cp：コピー（ディレクトリは-r）。mv：移動または名前の変更。rm：削除。', 'rmは元に戻せません（ごみ箱はありません）。rm -r は中身ごと消すので、特に注意します。'],
      do: '仮想マシンやWSLのLinuxで、自分のホームにテスト用ディレクトリを作り、ファイルの作成・コピー・移動・削除を試します（自分の環境だけで）。',
    }) });
    table(s, [['コマンド', '意味', '例'], [mono('pwd'), '今いる場所を表示', mono('pwd')], [mono('ls -l'), '一覧を詳しく表示', mono('ls -l /etc')], [mono('cd'), '場所を移動', mono('cd ~')], [mono('mkdir'), 'ディレクトリを作る', mono('mkdir work')], [mono('touch'), '空のファイルを作る', mono('touch a.txt')], [mono('cp'), 'コピー', mono('cp a.txt b.txt')], [mono('mv'), '移動・名前変更', mono('mv b.txt c.txt')], [mono('rm'), '削除（戻せない）', mono('rm c.txt')]], { x: 0.5, y: 1.95, colW: [2.6, 5.0, 4.73], size: 18, padY: 4, minRow: 0.52, firstBold: false, rowRole: { 8: 'warn' } });
  }

  // ===== OS4 コマンド② =====
  {
    const s = L.slide({ ch: C5, title: 'コマンド②：見る・探す・つなぐ（パイプとリダイレクト）', lead: 'コマンドの結果を「次のコマンドへ渡す（パイプ |）」「ファイルへ保存する（リダイレクト >）」ができると、小さな道具を組み合わせて作業できます。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識」＋書籍④「標準入出力とフィルタコマンド」', notes: N({
      read: '左の表が「見る・探す・並べる」コマンド、右の図が標準入出力の考え方です。下のコマンドは、それらをつなげた例です。',
      terms: ['標準入力（0）：キーボードなどからの入力。標準出力（1）：画面への通常の出力。標準エラー出力（2）：画面へのエラーの出力。', '>：出力をファイルへ（上書き）。>>：ファイルへ追記。|：出力を次のコマンドの入力へ渡す。'],
      detail: ['cat：中身を表示。less：ページ送りで表示（qで終了）。head／tail：先頭／末尾の数行（tail -fは追いかけて表示。ログ監視に便利）。grep：文字列を含む行を探す。find：ファイルを探す。sort：並べ替え。wc -l：行数を数える。', '例：ls -l | grep ".txt" | wc -l は、ファイル一覧から.txtを含む行だけを抜き出し、行数を数えます。'],
      ex: '第1部の通信の観察（ログを時刻順に読む、接続の一覧を絞る）でも、grepとパイプを頻繁に使います。',
    }) });
    table(s, [['コマンド', '意味'], [mono('cat / less'), '中身を表示'], [mono('head / tail -f'), '先頭／末尾（追跡）'], [mono('grep word f'), '語を含む行を探す'], [mono('find . -name a*'), 'ファイルを探す'], [mono('sort / wc -l'), '並べ替え／行数']], { x: 0.5, y: 1.95, colW: [3.4, 3.7], size: 18, padY: 4, minRow: 0.55, firstBold: false });
    [['0 標準入力', 'キーボード', 'device'], ['1 標準出力', '画面', 'net'], ['2 標準エラー', '画面（エラー）', 'warn']].forEach((t, i) => node(s, 7.9, 1.95 + i * 1.02, 4.93, 0.9, t[0], { role: t[2], size: 18, sub: t[1], subSize: 18, align: 'left' }));
    code(s, 0.5, 5.35, 12.33, ['# list | pick lines | count them > save', 'ls -l | grep ".txt" | wc -l > result.txt']);
  }

  // ===== OS5 権限 =====
  {
    const s = L.slide({ ch: C5, title: 'ユーザーと権限：rwxと数字の読み方', lead: 'Linuxは、ファイルごとに「所有者・グループ・その他」の3者へ、読む(r)・書く(w)・実行する(x)の許可を決めます。数字では、r=4・w=2・x=1の合計で表します。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識」＋書籍④「ユーザーとグループ」「アクセス制御」', notes: N({
      read: '上の4つが、ls -lで出る「-rwxr-xr--」の読み方です。左から、ファイルの種類、所有者、グループ、その他の順です。下の表は、数字との対応です。',
      terms: ['所有者（user）：ファイルの持ち主。グループ（group）：同じ仲間の利用者の集まり。その他（others）：それ以外の全員。', 'r（read）：読む、w（write）：書く、x（execute）：実行する（ディレクトリでは「中に入る」）。'],
      detail: ['例：-rwxr-xr-- は、所有者＝rwx（7）、グループ＝r-x（5）、その他＝r--（4）。数字で書くと754。', 'chmod 755 file：所有者は読み書き実行、他は読み・実行のみ。chmod 644：所有者は読み書き、他は読みのみ（普通のファイル）。chmod 600：所有者だけ読み書き（秘密鍵など）。chmod +x file：実行を許可。', 'chown user:group file：持ち主とグループを変更（管理者権限が必要）。sudo：一時的に管理者として実行。', 'Linux標準教科書の第8章「ユーザーとグループの管理」、第9章「ファイルやディレクトリのアクセス制御」が対応します[K03]。'],
      myth: '権限を安易に777（誰でも読み書き実行）にしない。障害の原因が「権限」のときは、該当ファイルのls -lと、実行ユーザーを確認します。',
    }) });
    [['-', 'ファイルの種類', 'gray'], ['rwx', '所有者：読・書・実行', 'device'], ['r-x', 'グループ：読・実行', 'net'], ['r--', 'その他：読むだけ', 'server']].forEach((t, i) => node(s, 0.5 + i * 3.14, 1.95, 2.95, 1.45, t[0], { role: t[2], solid: true, size: 28, line: false, sub: t[1], subSize: 18 }));
    table(s, [['数字', '記号', '意味'], ['7', 'rwx', '読む・書く・実行する（4＋2＋1）'], ['6', 'rw-', '読む・書く（4＋2）'], ['5', 'r-x', '読む・実行する（4＋1）'], ['4', 'r--', '読むだけ']], { x: 0.5, y: 3.6, colW: [1.6, 2.4, 8.33], size: 18, padY: 4, minRow: 0.5 });
    code(s, 0.5, 6.25, 12.33, ['chmod 754 script.sh    # rwx r-x r--'], { size: 18 });
  }

  // ===== OS6 プロセス・サービス =====
  {
    const s = L.slide({ ch: C5, title: 'プロセス・サービス・ディスク・メモリを確認する', lead: '障害調査の基本は「動いているか」「容量は足りているか」「負荷は高くないか」の確認です。そのためのコマンドを、用途別に並べました。', kinds: ['blog', 'general'], src: ['K03', 'H01'], ref: 'ブログ「OSの基礎知識：基本的なコマンド」＋書籍④「プロセス管理」', notes: N({
      read: '左がコマンド、右が用途です。読み方の順序は、①動いているか（ps・systemctl）→②負荷（top）→③容量（df・du・free）です。',
      terms: ['プロセス：実行中のプログラム。PID：プロセスを区別する番号。', 'サービス（デーモン）：裏で動き続けるプログラム（Webサーバーなど）。systemctlで起動・停止・状態確認をする。'],
      detail: ['ps aux：プロセスの一覧。top：CPU・メモリの使用状況を常時表示（qで終了）。kill PID：プロセスを終了（kill -9は強制）。', 'systemctl status sshd：サービスの状態。systemctl start／stop／restart：起動・停止・再起動。', 'df -h：ディスクの空き容量。du -sh dir：ディレクトリの使用量。free -h：メモリの空き。', 'Linux標準教科書の第11章「プロセス管理」が対応します[K03]。'],
      ex: '第1部の障害切り分け（端末→LAN→…→サービス）の「サービス」の層では、systemctlでの状態確認とログ（/var/log）の確認を行います。',
    }) });
    table(s, [['コマンド', '用途'], [mono('ps aux'), '動いているプロセスの一覧'], [mono('top'), 'CPU・メモリの使用状況'], [mono('kill PID'), 'プロセスを終了'], [mono('systemctl status sshd'), 'サービスの状態を確認'], [mono('systemctl restart sshd'), 'サービスを再起動'], [mono('df -h'), 'ディスクの空き容量'], [mono('du -sh dir'), '使用量を調べる'], [mono('free -h'), 'メモリの空き']], { x: 0.5, y: 1.95, colW: [5.4, 6.93], size: 18, padY: 4, minRow: 0.52, firstBold: false });
  }

  // ===== OS7 vi =====
  {
    const s = L.slide({ id: 'VI', ch: C5, title: 'viエディタ：3つのモードと最小の操作', lead: 'viは、サーバーにほぼ必ず入っているエディタです。「ノーマルモード（移動・削除）」「挿入モード（入力）」「コマンドラインモード（保存・終了）」を切り替えて使います。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識：viエディタ」＋書籍④「viエディタ」', notes: N({
      read: '左の図が3つのモードの切り替えです。起動直後はノーマルモードです。右の表が最小限の操作です。迷ったら、Escキーを押してノーマルモードに戻ります。',
      detail: ['ノーマルモード→挿入モード：i（今の位置に挿入）、a（1文字後ろに挿入）、o（下に新しい行）。挿入モード→ノーマルモード：Esc。', 'ノーマルモード→コマンドラインモード：「:」を入力。:w＝保存、:q＝終了、:wq＝保存して終了、:q!＝保存せずに強制終了。', '移動：h（左）・j（下）・k（上）・l（右）、0（行頭）・$（行末）・gg（先頭）・G（末尾）。', '編集：x（1文字削除）・dd（1行削除）・yy（1行コピー）・p（貼り付け）・u（元に戻す）。検索：/語 で検索、nで次の候補。', 'Linux標準教科書には、viエディタの専用の章（第7章）があります[K03]。'],
      myth: '最初に困るのは「入力しようとして文字が入らない（ノーマルモードのため）」と「終了できない」です。i で入力、Esc→:wq で保存終了、:q! で破棄終了、と覚えれば大丈夫です。',
      do: 'vi test.txt を開き、i → 文字入力 → Esc → :wq の一連の流れを10回繰り返して指に覚えさせます。',
    }) });
    node(s, 0.5, 1.95, 4.6, 1.15, 'ノーマル', { role: 'server', solid: true, size: 22, line: false, sub: '移動・削除・コピー（起動直後）', subSize: 18 });
    node(s, 0.5, 3.75, 4.6, 1.15, '挿入', { role: 'device', solid: true, size: 22, line: false, sub: '文字を入力する', subSize: 18 });
    node(s, 0.5, 5.55, 4.6, 1.15, 'コマンドライン', { role: 'aux', solid: true, size: 22, line: false, sub: ':w　:q　:wq　:q!', subSize: 18 });
    arrow(s, 2.0, 3.1, 2.0, 3.75, { color: C.ink, w: 2.5, label: 'i a o', lsize: 18, lw: 1.0, dx: -0.75 });
    arrow(s, 3.6, 3.75, 3.6, 3.1, { color: C.ink, w: 2.5, label: 'Esc', lsize: 18, lw: 0.8, dx: 0.7 });
    arrow(s, 2.8, 4.9, 2.8, 5.55, { color: C.ink, w: 2.5, label: '：', lsize: 18, lw: 0.5, dx: 0.45 });
    table(s, [['操作', 'キー'], ['挿入に入る／戻る', mono('i  /  Esc')], ['移動', mono('h j k l  0  $  gg  G')], ['削除・コピー・貼付', mono('x  dd  yy  p')], ['元に戻す', mono('u')], ['検索', mono('/word   n')], ['保存して終了', mono(':wq')], ['保存せず終了', mono(':q!')]], { x: 5.4, y: 1.95, colW: [3.5, 3.93], size: 18, padY: 4, minRow: 0.6, firstBold: false });
  }

  // ===== OS8 シェルスクリプト基礎 =====
  {
    const s = L.slide({ id: 'SH', ch: C5, title: 'シェルスクリプト：コマンドをファイルに書いて自動化する', lead: 'シェルスクリプトは、打ち込むコマンドをファイルにまとめたものです。変数・条件分岐・終了コードが分かれば、簡単な確認作業を自動化できます。', kinds: ['blog', 'general'], src: ['H01', 'K03'], ref: 'ブログ「OSの基礎知識：簡単なシェルスクリプトを作れる」', notes: N({
      read: '左がスクリプトの例（指定した機器にpingを送り、通じたかを表示）、右がその解説です。番号は左のコード行との対応です。',
      terms: ['シェバン（#!）：1行目。このファイルをどのシェルで実行するかを指定する。', '変数：値に名前を付けて保存する入れ物。引数：スクリプト起動時に渡す値（$1が1つ目）。', '終了コード：コマンドが終わったときに返す数字（0＝成功、0以外＝失敗）。直前の終了コードは$?で見られる。'],
      detail: ['実行手順：vi check-host.sh で作成 → chmod +x check-host.sh で実行権限を付ける → ./check-host.sh 192.168.1.1 で実行。', 'ping -c 1 は1回だけ送る指定。> /dev/null 2>&1 は、画面に何も出さない（出力を捨てる）指定。', 'if〜then〜else〜fi：条件分岐。ifの条件がコマンドのときは、その終了コードが0なら成功として進む。', '本ブログの目標は「最終的に簡単なシェルスクリプトを作れるようになること」です[H01]。'],
      myth: '最初から長いスクリプトを書く必要はありません。手作業で打っているコマンドを、そのままファイルにまとめるところから始めます。',
    }) });
    code(s, 0.5, 1.95, 7.3, ['#!/bin/bash', '# check-host.sh', 'HOST="$1"', '', 'if ping -c 1 "$HOST" > /dev/null 2>&1; then', '  echo "OK: $HOST"', 'else', '  echo "NG: $HOST"', '  exit 1', 'fi']);
    numList(s, { x: 8.1, y: 1.95, w: 4.73, items: ['#! で使うシェルを指定', '$1＝1つ目の引数を変数へ', 'if…then…else…fi＝条件分岐', 'exit 1＝失敗を終了コードで返す', 'chmod +x で実行権限を付ける'], size: 18, rowH: 0.95, role: 'server' });
    callout(s, 0.5, 5.95, 7.3, 0.95, '実行：chmod +x check-host.sh → ./check-host.sh 192.168.1.1', { kind: 'info', size: 18 });
  }

  // ===== OS9 演習 =====
  {
    const s = L.slide({ ch: C5, title: 'シェルスクリプトの練習：3段階で育てる', lead: '繰り返し（for）を加えて複数の機器を確認し、結果をファイルに残し、失敗を終了コードで伝える、と3段階に広げていく練習の提案です。', kinds: ['proposal', 'general'], src: ['K03'], ref: 'ブログ「簡単なシェルスクリプトを作れるようになる」＋資料制作者の提案', notes: N({
      read: '左のコードは、3つのホストを順に確認する例です（127.0.0.1は自分自身、example.comは文書用に予約された例示用の名前）。右は3つの練習課題です。',
      detail: ['for h in A B C; do … done：A・B・Cを順に変数hへ入れて繰り返す。', '結果をファイルに残すには、>> result.txt のように追記リダイレクトを使う。', '演習：①引数で受け取った1台を確認（前のスライド）②複数台をforで確認し、結果を result.txt に追記 ③1台でも失敗したら、最後に終了コード1で終わる。', '次の段階：日付の付いたログを残す（date コマンド）、cron（定期実行）で毎朝実行する、など。'],
      why: '監視・確認・バックアップの自動化は、SEの仕事（構築・運用）に直結します。第1部の「スクリプト・Git・構成の自動化」の出発点です。',
    }) });
    code(s, 0.5, 1.95, 7.3, ['#!/bin/bash', 'for h in 127.0.0.1 192.168.1.1 example.com; do', '  if ping -c 1 "$h" > /dev/null 2>&1; then', '    echo "$h up"', '  else', '    echo "$h down"', '  fi', 'done']);
    numList(s, { x: 8.1, y: 1.95, w: 4.73, items: ['1台を確認（前の例）', '複数台をforで確認し、結果をファイルへ追記', '失敗したら終了コード1で終える'], size: 18, rowH: 1.25, role: 'aux', labels: ['①', '②', '③'] });
    callout(s, 0.5, 5.75, 12.33, 1.1, '手作業で繰り返しているコマンドを見つけたら、スクリプトにする。小さく作って、動かして、直す', { kind: 'ok', size: 20 });
  }

  // ===== DB1 データベースの基本 =====
  {
    const s = L.slide({ id: 'DB1', ch: C6, title: 'データベースとRDBMS：表でデータを管理する', lead: 'RDBMS（リレーショナルデータベース）は、データを「表（テーブル）」で管理します。行が1件のデータ、列が項目です。表どうしは「キー」でつなぎます。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：RDBMSの種類」', notes: N({
      read: '左が顧客の表（customers）、右が注文の表（orders）です。注文表のcustomer_idが、顧客表のidを指しています。これが「外部キー」です。',
      terms: ['テーブル（表）：行と列でデータを並べたもの。行（レコード）：1件のデータ。列（カラム）：項目。', '主キー（PK）：行を1つに特定する値（例：顧客id）。重複しない。', '外部キー（FK）：他の表の主キーを参照する列。表どうしの関係を表す。', 'DBMS：データベースを管理するソフト。RDBMSはその中で表形式を使うもの。'],
      detail: ['表を分ける理由：顧客の情報（名前・住所）を注文のたびに書くと、住所変更のときに何か所も直す必要がある。顧客表に1か所だけ持ち、注文表は顧客idだけを持つ。', '書籍⑤「おうちで学べるデータベースのきほん」は、第1章でデータベースの用途と役割、第2章でリレーショナルデータベースを解説しています[K04]。'],
    }) });
    txt(s, 'customers（顧客）', { x: 0.5, y: 1.95, w: 5.6, h: 0.4, size: 20, bold: true, color: R.device.d });
    table(s, [['id（主キー）', 'name', 'city'], ['1', 'Sato', 'Tokyo'], ['2', 'Suzuki', 'Osaka'], ['3', 'Tanaka', 'Tokyo']], { x: 0.5, y: 2.4, colW: [2.2, 1.8, 1.6], size: 18, padY: 4, minRow: 0.55, firstBold: false, headFill: R.device.d });
    txt(s, 'orders（注文）', { x: 7.2, y: 1.95, w: 5.6, h: 0.4, size: 20, bold: true, color: R.server.d });
    table(s, [['id', 'customer_id（外部キー）', 'amount'], ['101', '1', '3000'], ['102', '1', '1200'], ['103', '2', '5000']], { x: 6.5, y: 2.4, colW: [0.9, 3.4, 1.5], size: 18, padY: 4, minRow: 0.55, firstBold: false, headFill: R.server.d });
    txt(s, 'orders.customer_id が customers.id を指す（＝外部キー）', { x: 0.5, y: 4.72, w: 12.33, h: 0.4, size: 18, bold: true, color: R.aux.d, align: 'center' });
    card(s, 0.5, 5.2, 4.0, 1.7, '表（テーブル）', '行＝1件のデータ、列＝項目', { role: 'net', size: 18, tsize: 20 });
    card(s, 4.67, 5.2, 4.0, 1.7, '主キー', '行を1つに特定する値。重複しない', { role: 'device', size: 18, tsize: 20 });
    card(s, 8.83, 5.2, 4.0, 1.7, '外部キー', '他の表の主キーを参照して、表をつなぐ', { role: 'server', size: 18, tsize: 20 });
  }

  // ===== DB2 RDBMSの種類 =====
  {
    const s = L.slide({ ch: C6, title: 'RDBMSの種類：商用・オープンソース・組み込み', lead: 'RDBMSには、企業が販売する商用製品と、無償で使えるオープンソース、アプリに組み込む軽量なものがあります。SQLの基本は共通ですが、細かい機能や書き方は製品で違います。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：RDBMSの種類」', notes: N({
      read: '左が製品名、真ん中が分類、右が特徴です。ブログは「RDBMSの種類」を押さえることを勧めています。',
      detail: ['Oracle Database：商用。大規模な基幹システムで広く使われる。', 'Microsoft SQL Server：商用。Windows・Microsoft製品との連携がよい。', 'MySQL：オープンソース。Webシステムで広く使われる。', 'MariaDB：MySQLから派生したオープンソース。', 'PostgreSQL：オープンソース。高機能で、標準SQLへの準拠を重視。', 'SQLite：組み込み型。1つのファイルで動き、アプリやスマホの内部でよく使われる。', 'クラウドでは、これらをサービスとして借りる「マネージドDB」（例：Amazon RDS）も使われる。書籍⑤の第2版は、クラウドでのデータベース操作にも対応していると紹介されています[K04]。'],
      cond: '各製品の提供形態・ライセンス・機能は変わります。導入時は各社の公式ページで確認してください。',
    }) });
    table(s, [['製品', '分類', '特徴'], ['Oracle Database', '商用', '大規模な基幹系で広く利用'], ['Microsoft SQL Server', '商用', 'Windows系との連携'], ['MySQL', 'オープンソース', 'Webシステムで広く利用'], ['MariaDB', 'オープンソース', 'MySQLから派生'], ['PostgreSQL', 'オープンソース', '高機能・標準SQL重視'], ['SQLite', '組み込み型', '1ファイルで動く軽量DB']], { x: 0.5, y: 1.95, colW: [3.8, 3.2, 5.33], size: 18, padY: 4, minRow: 0.6, rowRole: { 1: 'aux', 2: 'aux', 3: 'sec', 4: 'sec', 5: 'sec', 6: 'gray' } });
    callout(s, 0.5, 6.3, 12.33, 0.6, 'クラウドでは、DBを「サービス」として借りる（マネージドDB）こともある', { kind: 'info', size: 18 });
  }

  // ===== DB3 SELECT =====
  {
    const s = L.slide({ id: 'SQL1', ch: C6, title: 'SQLの基本①：SELECTで必要な行と列を取り出す', lead: 'SELECTは「どの列を」「どの表から」「どの条件の行を」「どの順で」取り出すかを書きます。書く順番は、SELECT→FROM→WHERE→ORDER BYです。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：基本的なSQL文」', notes: N({
      read: '上がSQL、左下が元の表、右下が結果です。条件（city＝Tokyo）に合う行だけが残り、nameの順に並びます。',
      terms: ['SELECT：取り出す列。FROM：対象の表。WHERE：行の条件。ORDER BY：並べ替え（ASC昇順・DESC降順）。', '文字列は\'Tokyo\'のように引用符で囲む。'],
      detail: ['全列を取り出すときは SELECT * FROM customers; と書く。', '条件は =、<>（等しくない）、<、>、LIKE（部分一致）、AND、OR、IN などを使える。', '書籍⑤の第6章は「SQL文の基本を学ぼう～SELECT文を理解する～」です[K04]。'],
      do: 'SQLite（インストール不要に近いDB）でcustomers表を作り、WHEREの条件を変えて結果の違いを確かめます。',
    }) });
    code(s, 0.5, 1.95, 12.33, ['SELECT name, city', 'FROM customers', "WHERE city = 'Tokyo' ORDER BY name;"]);
    txt(s, '元の表（customers）', { x: 0.5, y: 3.4, w: 6, h: 0.4, size: 18, bold: true, color: R.device.d });
    table(s, [['id', 'name', 'city'], ['1', 'Sato', 'Tokyo'], ['2', 'Suzuki', 'Osaka'], ['3', 'Tanaka', 'Tokyo']], { x: 0.5, y: 3.85, colW: [1.2, 2.3, 2.3], size: 18, padY: 3, minRow: 0.5, firstBold: false, headFill: R.device.d });
    txt(s, '結果', { x: 7.2, y: 3.4, w: 6, h: 0.4, size: 18, bold: true, color: R.sec.d });
    table(s, [['name', 'city'], ['Sato', 'Tokyo'], ['Tanaka', 'Tokyo']], { x: 7.2, y: 3.85, colW: [2.8, 2.8], size: 18, padY: 3, minRow: 0.5, firstBold: false, headFill: R.sec.d });
    callout(s, 0.5, 6.15, 12.33, 0.75, 'SELECT（列）→FROM（表）→WHERE（条件）→ORDER BY（並べ替え）の順に書く', { kind: 'info', size: 18 });
  }

  // ===== DB4 INSERT/UPDATE/DELETE =====
  {
    const s = L.slide({ ch: C6, title: 'SQLの基本②：追加・変更・削除はWHEREに注意', lead: 'データを足す（INSERT）、変える（UPDATE）、消す（DELETE）の3つが更新の基本です。UPDATEとDELETEは、WHEREを忘れると全行が対象になります。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：基本的なSQL文」', notes: N({
      read: '表の左列が操作、真ん中が意味、右が例です。SELECTを加えた4つを、まとめて「基本の4操作（CRUDとも呼ぶ）」と考えます。',
      terms: ['CRUD：Create（作る）、Read（読む）、Update（変える）、Delete（消す）。'],
      detail: ['INSERT INTO 表 VALUES (…)：行を追加。UPDATE 表 SET 列＝値 WHERE 条件：条件に合う行を変更。DELETE FROM 表 WHERE 条件：条件に合う行を削除。', '更新の前には、必ず同じ条件のSELECTで「対象の行が意図どおりか」を確認する習慣が安全です。', '本番のデータに対しては、トランザクション（次々のスライド）とバックアップを前提にします。'],
      myth: 'UPDATEやDELETEは、WHEREを書かないと「すべての行」を変更・削除します。取り消せるのは、トランザクション内でまだCOMMITしていない間か、バックアップから戻す場合だけです。',
    }) });
    table(s, [['操作', '意味', '例'], ['SELECT', '取り出す', mono("SELECT * FROM customers;")], ['INSERT', '追加する', mono("INSERT INTO customers VALUES (4, 'Ito', 'Nagoya');")], ['UPDATE', '変更する', mono("UPDATE customers SET city = 'Kyoto' WHERE id = 2;")], ['DELETE', '削除する', mono("DELETE FROM customers WHERE id = 4;")]], { x: 0.5, y: 1.95, colW: [2.0, 2.3, 8.03], size: 18, padY: 5, minRow: 0.85, rowRole: { 1: 'net', 2: 'sec', 3: 'aux', 4: 'warn' } });
    callout(s, 0.5, 5.75, 12.33, 1.15, 'UPDATE／DELETEはWHEREを付け忘れると全行が対象。実行前に同じ条件のSELECTで対象を確認する', { kind: 'warn', size: 20 });
  }

  // ===== DB5 JOINと集計 =====
  {
    const s = L.slide({ ch: C6, title: 'SQLの基本③：JOINで表をつなぎ、GROUP BYで集計する', lead: 'JOINは、主キーと外部キーを使って2つの表をつなぎます。GROUP BYは、同じ値の行をまとめて合計・件数などを出します。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：基本的なSQL文」', notes: N({
      read: '左がJOIN（顧客と注文をつなぐ）、右がGROUP BY（顧客ごとの合計）です。どちらも、前の図の2つの表を使っています。',
      terms: ['INNER JOIN（JOIN）：両方の表に対応する行があるものだけ残す。', 'LEFT JOIN：左の表の行はすべて残し、右に対応がなければNULL（値なし）になる。', 'GROUP BY：同じ値の行をまとめる。SUM（合計）、COUNT（件数）、AVG（平均）などと一緒に使う。', '別名（c、o）：表の名前を短くする書き方。'],
      detail: ['JOINの結果：Sato（3000）、Sato（1200）、Suzuki（5000）。Tanakaは注文がないので出てこない。', 'LEFT JOINにすると、Tanakaも出て、amountがNULLになる。', 'GROUP BYの結果：Sato＝4200（3000＋1200）、Suzuki＝5000。'],
    }) });
    code(s, 0.5, 1.95, 6.05, ['SELECT c.name, o.amount', 'FROM customers c', 'JOIN orders o', '  ON o.customer_id = c.id;'], { size: 18 });
    table(s, [['name', 'amount'], ['Sato', '3000'], ['Sato', '1200'], ['Suzuki', '5000']], { x: 0.5, y: 3.85, colW: [3.0, 3.05], size: 18, padY: 3, minRow: 0.5, firstBold: false, headFill: R.sec.d });
    code(s, 6.78, 1.95, 6.05, ['SELECT c.name, SUM(o.amount)', 'FROM customers c', 'JOIN orders o ON o.customer_id = c.id', 'GROUP BY c.name;'], { size: 18 });
    table(s, [['name', 'SUM(amount)'], ['Sato', '4200'], ['Suzuki', '5000']], { x: 6.78, y: 3.85, colW: [3.0, 3.05], size: 18, padY: 3, minRow: 0.5, firstBold: false, headFill: R.sec.d });
    callout(s, 0.5, 6.0, 12.33, 0.9, 'Tanakaは注文がないのでJOINの結果に出ない。LEFT JOINなら出て、amountはNULL（値なし）になる', { kind: 'info', size: 18 });
  }

  // ===== DB6 ACID =====
  {
    const s = L.slide({ id: 'ACID', ch: C6, title: 'トランザクションとACID：全部成功か、全部取り消し', lead: 'トランザクションは「分けられない一連の処理」です。銀行の送金のように、途中で失敗したら全部なかったことにする仕組みで、その性質がACID（4つの特性）です。', kinds: ['blog', 'general'], src: ['H01', 'K04'], ref: 'ブログ「データベース：ACID特性」＋書籍⑤「トランザクションと同時実行制御」', notes: N({
      read: '上のSQLは、AさんからBさんへ1000円を送る処理です。2つのUPDATEは、どちらも成功するか、どちらもなかったことにするかのどちらかです。下の4つのカードが、ACIDの意味です。',
      terms: ['トランザクション：分割できない一連のデータベース操作の単位。BEGINで開始、COMMITで確定、ROLLBACKで取り消し。', 'A（Atomicity）原子性：全部成功か、全部なしか。途中の状態にならない。', 'C（Consistency）一貫性：処理の前後で、データのルール（残高が負にならない等）が守られる。', 'I（Isolation）独立性：同時に動く別のトランザクションが、互いに影響しない。', 'D（Durability）永続性：COMMITした結果は、障害が起きても失われない。'],
      detail: ['もし1つ目のUPDATE（Aから1000円引く）のあとで障害が起きて、2つ目（Bへ足す）が実行されないと、1000円が消えてしまいます。原子性があれば、この場合は全体がROLLBACKされ、元に戻ります。', '書籍⑤の第7章は「トランザクションと同時実行制御～複数のクエリをまとめる～」、第9章は「バックアップとリカバリ」です[K04]。'],
      myth: 'COMMITの前に別の人が結果を見られる、とは限りません。見え方は「分離レベル」という設定で変わります。',
    }) });
    code(s, 0.5, 1.95, 12.33, ['BEGIN;', "UPDATE account SET balance = balance - 1000 WHERE id = 'A';", "UPDATE account SET balance = balance + 1000 WHERE id = 'B';", 'COMMIT;   -- on error: ROLLBACK;']);
    [['A 原子性', '全部成功か、全部なしか', 'server'], ['C 一貫性', 'データのルールが守られる', 'net'], ['I 独立性', '同時の処理が干渉しない', 'device'], ['D 永続性', 'COMMITしたら消えない', 'sec']].forEach((t, i) => card(s, 0.5 + i * 3.1, 4.25, 2.95, 2.6, t[0], t[1], { role: t[2], size: 18, tsize: 22 }));
  }

  // ===== DB7 運用の視点 =====
  {
    const s = L.slide({ ch: C6, title: 'データベースの運用：バックアップ・可用性・性能・コスト', lead: 'SQLが書けるだけでなく、「壊れても戻せるか」「止まらないか」「速いか」「いくらかかるか」まで考えるのが、業務のデータベースです。書籍⑤が体系的に扱う内容です。', kinds: ['book', 'general'], src: ['K04', 'H01'], ref: '書籍⑤（データベース）の章：お金・アーキテクチャ・正規形・バックアップ・性能', notes: N({
      read: '5つのカードが、データベースを業務で使うときの観点です。書籍⑤の第3章（お金の話）、第4章（アーキテクチャ構成）、第8章（テーブル設計の基礎と正規形）、第9章（バックアップとリカバリ）、第10章（パフォーマンス）に対応します[K04]。',
      terms: ['正規化：表を分けて、データの重複をなくす設計の考え方。第1〜第3正規形などの段階がある。', 'インデックス（索引）：本の索引のように、検索を速くするための仕組み。', 'フルバックアップ：全体を保存。差分バックアップ：前回のフルとの差だけ。増分バックアップ：前回のバックアップからの差だけ。', 'レプリケーション：データを複製して別のサーバーに持つ（可用性・負荷分散）。'],
      detail: ['バックアップは取っただけでは不十分で、戻せること（リストア）を確認する。第1部のRPO（失ってよいデータの時間幅）・RTO（復旧に許せる時間）とつながる。', '冗長化（複製）だけではバックアップの代わりにならない（誤削除も複製される）。', 'イニシャルコスト（導入時の費用）とランニングコスト（運用の費用）の両方を見る（書籍⑤の第3章）。'],
    }) });
    [['正規化', '重複をなくし、更新ミスを防ぐ', 'server', 'FaSitemap'], ['バックアップ', '戻せることまで確認する', 'sec', 'FaUndo'], ['可用性', '複製・冗長化で止まりにくくする', 'net', 'FaShieldAlt'], ['性能', '索引（インデックス）で検索を速くする', 'device', 'FaTachometerAlt'], ['コスト', '導入費と運用費の両方を見る', 'aux', 'FaMoneyBillWave'], ['設計の型', '業務の表を分ける練習をする', 'gray', 'FaTable']].forEach((t, i) => {
      const x = 0.5 + (i % 3) * 4.165, y = 1.95 + Math.floor(i / 3) * 2.15;
      card(s, x, y, 4.0, 2.0, t[0], t[1], { role: t[2], size: 18, tsize: 22, icon: t[3] });
    });
    callout(s, 0.5, 6.35, 12.33, 0.55, '複製（冗長化）だけではバックアップの代わりにならない', { kind: 'warn', size: 18 });
  }
};
