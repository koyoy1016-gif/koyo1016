# 用語データ作成仕様（高校生向け・IT用語ガイド v2）

## 目的
IT用語集（質問票の用語解説）を、**高校生が初めて読んでも理解できる**詳しさで解説する。1用語＝1つのJSオブジェクト。
このデータから、PC用（横長スライド）とスマホ用（縦長ページ）が自動生成される。画面には次の順で表示される：
「一言（リード）→ どの層の話か（位置表示）→ くわしく → たとえ → 関係図（relから自動作図）→ 実際の場面 → 注意 → 学び方」。

## 文体
- 「です・ます」調。1文は短く（60字以内が目安）。専門用語を初めて使うときは、直後に（ ）で言い換える。
- 高校生が知っていそうなもの（スマホ、学校の部活、図書館、コンビニ、LINE、ゲーム、YouTube、教室のロッカー、など）で具体的にたとえる。
- 「〜と言われる」「〜とされる」のような曖昧表現を避け、分かっている範囲を断定する。分からないことは書かない（創作しない）。
- 数字は桁感が伝わる程度に（例：PCのメモリは8〜32GB程度）。バージョン番号・価格・シェア・年号など古くなりやすい情報は書かない。
- 製品名・サービス名は正式名称で。誇張や宣伝調は禁止。会社の評価（どれが優れている等）も書かない。
- **正確性が最優先**。確信のない事実はWebSearchで確かめる（公式ドキュメント優先）。確かめられない内容は削る。
- 各項目は「別の項目と同じ内容の言い換え」にしない。what＝仕組み・正体、ana＝比喩、scene＝具体的な場面、warn＝つまずき、learn＝最初の行動。

## オブジェクトの形（全項目の説明）
```js
{
  id: 'memory',                // 索引にあるid（下記一覧）。必ず一致させる
  ch: 1,                       // 章番号（索引と同じ）
  term: 'メモリ',               // 表示名（索引の名前と同じにする）
  read: 'RAM（ラム）・主記憶',    // 読み方・別名・正式名称（短く。英語略語は正式名称と読みを書く）
  icon: 'FaMemory',            // react-icons/fa のアイコン名（実在するもの。下の注意参照）
  lay: ['hw'],                 // 位置表示でハイライトする層（索引の層を基本に、必要なら調整。許可値: hw os virt mw app net cloud act）
  sup: true,                   // 索引で「貼り付け資料に記載あり」でない用語は true（補足用語）。記載ありは false
  one: '計算中のデータを一時的に置いておく、速くて小さな作業スペース。', // 一言説明。15〜60字。1文。
  what: ['段落1…', '段落2…'],   // くわしく。2〜3段落。各40〜170字、**合計150〜340字**（1画面に収めるため合計380字が上限）。仕組み・正体・なぜ必要か・似た用語との境目
  ana: 'たとえ話…',             // たとえるなら。30〜110字。たとえのどの部分が実物のどれに対応するかが分かるように
  scene: '実際の場面…',         // こんな場面で出てくる。30〜110字。具体的な場面（学校・バイト・会社・ゲーム・スマホ・ニュース等）
  where: '場所の説明…',         // 「どこの話か」を一文で。10〜60字。例：PCの中の部品／会社のサーバー室で動くソフト／インターネットの向こう側のサービス
  rel: [ { to:'cpu', label:'データを渡す', dir:'out' }, ... ], // 関係図。3〜5個（下記）
  warn: '勘違い・つまずき…',    // 20〜110字。よくある間違い・混同しやすい用語との違い（無ければ省略可だが原則書く）
  learn: '最初の学び方…',       // 20〜100字。今日からできる具体的な行動（操作・調べ方・小さな実習）
  quote: '…'                   // 任意。貼り付け資料の記載の要旨（seedのdetailなど）。資料に無ければ省略
}
```
文字数の上限・下限は `node check_terms.js あなたのファイル.js` で検査される（エラー0にすること。警告もできるだけ解消）。

### 関係図 rel の書き方（重要：ネットワーク図として描かれる）
- `{ to:'他の用語のid', label:'関係を表す短い言葉', dir:'out'|'in'|'both' }`。
- 矢印は「from → to」。`dir:'out'` ＝ このカードの用語 → to、`dir:'in'` ＝ to → このカードの用語、`both` ＝ 双方向・対比。
- label は矢印の上に表示される。**7字以内**。「AがBに○○する」の○○にあたる言葉にする。例：動かす／保存する／土台になる／制御する／管理する／使う／提供する／通信する／ちがい（対比）／同じ仲間／置く場所。
  - 例：メモリ → CPU は「データを渡す」(out)。ストレージ → メモリ は「読み込まれる」。
- 3〜5個。**他の章の用語にもつなぐ**（このガイドは「用語どうしのつながり」を見せるのが目的）。直接関係が薄い用語は選ばない。
- 外部の言葉を出したい場合のみ `{ t:'スマホ', label:'…', dir:'…' }`（toを書かずtに12字以内の文字列）。基本は索引のidを使う。

## 層（lay）の意味 ＝「コンピューターのどこの話か」
下から上に積み重なるのが1台の中身。右の2つは「コンピューターの外」。
- `hw` ハードウェア：物理的な機械・部品（CPU、メモリ、SSD、サーバー本体、ケーブル、ルーター本体）
- `os` OS：機械を動かす基本ソフト（Windows、Linux）と、その機能（ファイルシステム等）
- `virt` 仮想化：1台の機械を分けて使う・箱に詰めて動かす技術（VM、コンテナ）
- `mw` ミドルウェア：アプリを支える土台のソフト（データベース、Webサーバー、アプリケーションサーバー）
- `app` アプリ：利用者や開発者が直接使うソフト・作るもの（Webアプリ、Excel、スマホアプリ、Git、HTML）
- `net` ネットワーク：機械どうしをつなぐ道（LAN、Wi-Fi、光回線、インターネット）
- `cloud` 置き場所：機械がどこにあるか・どう借りるか（自社のサーバー室、データセンター、クラウド）
- `act` 活動・資格：技術の層ではなく、人の活動・経験・資格（発表、学会、ITパスポート、リモート就業）。この場合 lay:['act'] とし、where には「技術ではなく活動の話」と明記しつつ、どんな活動かを書く。

## アイコン
`icon` は react-icons/fa（Font Awesome 5）の名前。例：FaMemory FaHdd FaDatabase FaServer FaCloud FaNetworkWired FaWifi FaCode FaGitAlt FaGithub FaDocker FaLinux FaWindows FaAws FaMicrochip FaCogs FaBook FaUsers FaCertificate FaPlug FaLock FaFolderOpen FaTable FaCube FaLayerGroup FaBoxes FaExchangeAlt FaBolt FaRobot FaBrain FaChartLine FaMobileAlt FaDesktop FaLaptop FaFileAlt FaHistory FaUndo FaHome FaGlobe FaProjectDiagram FaSitemap FaTools FaChalkboardTeacher FaMicrophone FaImage FaUniversity FaFileExcel FaHtml5 FaCss3Alt FaJava FaSearch FaCheckCircle … 
`node -e "console.log(Object.keys(require('react-icons/fa')).filter(k=>/キーワード/i.test(k)))"` で実在を確かめる（check_terms.js も検査する）。

## 用語の一覧（idと層）。rel の to にはここのidだけを使う
### ch=0 ① はじめに・基礎
- `hardware` ハードウェア　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `cpu` CPU　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `os` OS（基本ソフト）　層=os　(貼り付け資料に表なし＝補足用語。sup:true)
- `software` ソフトウェアとアプリ　層=os/mw/app　(貼り付け資料に表なし＝補足用語。sup:true)
- `serverclient` サーバーとクライアント　層=hw/mw/net　(貼り付け資料に表なし＝補足用語。sup:true)
- `network` ネットワーク　層=net　(貼り付け資料に表なし＝補足用語。sup:true)
- `internet` インターネット　層=net　(貼り付け資料に表なし＝補足用語。sup:true)
- `datacenter` サーバー室とデータセンター　層=cloud　(貼り付け資料に表なし＝補足用語。sup:true)
- `middleware` ミドルウェア　層=mw　(貼り付け資料に表なし＝補足用語。sup:true)
### ch=1 ② ストレージ
- `memory` メモリ　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `storage` ストレージ　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `ssd` SSD　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `hdd` HDD　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `nvme` NVMe　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `m2` M.2　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
- `fs` ファイルシステム　層=os　(貼り付け資料に表なし＝補足用語。sup:true)
- `block` ブロックストレージ　層=hw/os　(貼り付け資料に表なし＝補足用語。sup:true)
- `object` オブジェクトストレージ　層=cloud/app　(貼り付け資料に記載あり)
- `s3` Amazon S3　層=cloud　(貼り付け資料に表なし＝補足用語。sup:true)
- `nas` NAS　層=hw/net　(貼り付け資料に表なし＝補足用語。sup:true)
- `san` SAN　層=hw/net　(貼り付け資料に表なし＝補足用語。sup:true)
- `fcoe` FCoE　層=net　(貼り付け資料に表なし＝補足用語。sup:true)
- `raid` RAID　層=hw　(貼り付け資料に表なし＝補足用語。sup:true)
### ch=2 ③ データベース
- `db` DB（データベース）　層=mw　(貼り付け資料に記載あり)
- `dbms` DBMS　層=mw　(貼り付け資料に記載あり)
- `rdb` リレーショナルデータベース（RDB）　層=mw　(貼り付け資料に記載あり)
- `sql` SQL　層=mw/app　(貼り付け資料に記載あり)
- `dbserver` データベースサーバー　層=hw/mw　(貼り付け資料に記載あり)
- `oracle` Oracle Database　層=mw　(貼り付け資料に記載あり)
- `postgres` PostgreSQL　層=mw　(貼り付け資料に記載あり)
- `db2` Db2　層=mw　(貼り付け資料に記載あり)
- `sqlserver` Microsoft SQL Server　層=mw　(貼り付け資料に記載あり)
- `mysql` MySQL　層=mw　(貼り付け資料に記載あり)
- `awsdb` AWSのデータベース　層=cloud/mw　(貼り付け資料に記載あり)
- `mongodb` MongoDB　層=mw　(貼り付け資料に記載あり)
### ch=3 ④ アプリケーションサーバー
- `webserver` Webサーバー　層=mw　(貼り付け資料に記載あり)
- `apserver` アプリケーションサーバー　層=mw　(貼り付け資料に記載あり)
- `tomcat` Tomcat　層=mw　(貼り付け資料に記載あり)
- `weblogic` WebLogic　層=mw　(貼り付け資料に記載あり)
- `jetty` Jetty　層=mw　(貼り付け資料に記載あり)
- `servlet` サーブレット　層=app　(貼り付け資料に記載あり)
- `deploy` デプロイ　層=mw/app　(貼り付け資料に記載あり)
### ch=4 ⑤ 仮想化・コンテナ
- `virtualization` 仮想化　層=virt　(貼り付け資料に表なし＝補足用語。sup:true)
- `vm` 仮想マシン（VM）　層=virt　(貼り付け資料に記載あり)
- `hypervisor` ハイパーバイザー　層=virt　(貼り付け資料に記載あり)
- `container` コンテナ　層=virt　(貼り付け資料に表なし＝補足用語。sup:true)
- `docker` Docker　層=virt　(貼り付け資料に記載あり)
- `k8s` Kubernetes　層=virt　(貼り付け資料に記載あり)
- `vmware` VMware　層=virt　(貼り付け資料に記載あり)
- `openstack` OpenStack　層=virt/cloud　(貼り付け資料に記載あり)
- `kvm` KVM　層=virt/os　(貼り付け資料に記載あり)
- `hyperv` Hyper-V　層=virt/os　(貼り付け資料に記載あり)
- `private` プライベートクラウド　層=cloud/virt　(貼り付け資料に表なし＝補足用語。sup:true)
### ch=5 ⑥ クラウド
- `cloud` クラウド　層=cloud　(貼り付け資料に表なし＝補足用語。sup:true)
- `public` パブリッククラウド　層=cloud　(貼り付け資料に記載あり)
- `aws` AWS　層=cloud　(貼り付け資料に記載あり)
- `azure` Azure　層=cloud　(貼り付け資料に記載あり)
- `gcp` Google Cloud　層=cloud　(貼り付け資料に記載あり)
- `cloudvm` クラウドの仮想サーバー　層=cloud/virt　(貼り付け資料に記載あり)
- `cloudstorage` クラウドストレージ　層=cloud/hw　(貼り付け資料に記載あり)
- `managed` マネージドサービス　層=cloud/mw　(貼り付け資料に記載あり)
### ch=6 ⑦ 研究・独学
- `ai` AI（人工知能）　層=app　(貼り付け資料に記載あり)
- `ml` 機械学習　層=app　(貼り付け資料に記載あり)
- `automation` 自動化　層=app　(貼り付け資料に記載あり)
- `mobileapp` スマートフォン用アプリ開発　層=app　(貼り付け資料に記載あり)
- `windows` Windows　層=os　(貼り付け資料に表なし＝補足用語。sup:true)
- `linux` Linux　層=os　(貼り付け資料に表なし＝補足用語。sup:true)
- `winapp` Windows用アプリ開発　層=app　(貼り付け資料に記載あり)
- `linuxapp` Linux用アプリ開発　層=app　(貼り付け資料に記載あり)
- `iot` IoT　層=hw/net/app　(貼り付け資料に記載あり)
- `pcbuild` PCを自作して使用　層=hw　(貼り付け資料に記載あり)
### ch=7 ⑧ 発表・学会
- `presentation` プレゼンテーション　層=act　(貼り付け資料に記載あり)
- `campus` 学内で発表　層=act　(貼り付け資料に記載あり)
- `domestic` 国内学会発表　層=act　(貼り付け資料に記載あり)
- `overseas` 海外学会発表　層=act　(貼り付け資料に記載あり)
- `conference` 学会　層=act　(貼り付け資料に記載あり)
- `oral` 口頭発表　層=act　(貼り付け資料に記載あり)
- `poster` ポスター発表　層=act　(貼り付け資料に記載あり)
### ch=8 ⑨ IT資格
- `itpassport` ITパスポート　層=act　(貼り付け資料に記載あり)
- `fe` 基本情報技術者　層=act　(貼り付け資料に記載あり)
- `apexam` 応用情報技術者　層=act　(貼り付け資料に記載あり)
- `mos` MOS　層=act　(貼り付け資料に記載あり)
### ch=9 ⑩ その他のIT経験
- `excel` Excelでの集計　層=app　(貼り付け資料に記載あり)
- `html` HTML　層=app　(貼り付け資料に記載あり)
- `css` CSS　層=app　(貼り付け資料に記載あり)
- `git` Git　層=app　(貼り付け資料に記載あり)
- `github` GitHub　層=app/cloud　(貼り付け資料に記載あり)
- `analysis` データ分析　層=app　(貼り付け資料に記載あり)
- `log` ログ　層=os/mw/app　(貼り付け資料に記載あり)
- `backup` バックアップ　層=hw/os　(貼り付け資料に記載あり)
### ch=10 ⑪ リモート就業環境
- `remote` リモート就業　層=act　(貼り付け資料に記載あり)
- `fixedline` 固定回線　層=net　(貼り付け資料に記載あり)
- `fiber` 光回線　層=net　(貼り付け資料に記載あり)
- `catv` ケーブルテレビ回線　層=net　(貼り付け資料に記載あり)
- `lan` 有線LAN　層=net　(貼り付け資料に記載あり)
- `wifi` Wi-Fi　層=net　(貼り付け資料に表なし＝補足用語。sup:true)
- `router` ルーター　層=hw/net　(貼り付け資料に表なし＝補足用語。sup:true)

## 参考資料（seed）
`terms_index.json` の各項目の `seed` に、旧版（簡潔版）の説明が入っている（term/read/what/ex/use/learn/warn/detail）。
- これは「貼り付けられた質問票の解説」に基づく事実の土台。**内容と矛盾しないこと**（例：NASは主に共有ファイル、SANは主にディスクに相当する保存領域）。
- ただし文章はそのまま使わず、高校生向けに大きく書き直して詳しくする。seedが null の用語は一般的な知識で新規に書く。
- 「detail」に「貼り付けの説明：〜」とある部分は、貼り付け資料の記載。quote に要旨を入れてよい。

## 納品
- 指定された出力ファイルに `module.exports = [ ...オブジェクト... ];` の形で書く（JS。コメント不要）。割り当てられた用語だけを、割り当て順に。
- 作業ディレクトリは `/tmp/claude-0/-home-user-koyo1016/a6b71c9c-9250-5393-acfd-c0ce241855e4/scratchpad/build/`（node_modules あり）。
- 書いたら `node check_terms.js <ファイル>` を実行し、エラー0・警告ほぼ0にしてから終了する。
- 他のファイル（kit.js など）は編集しない。
- 最後の報告は、書いた用語数と、事実確認が不十分で心配な箇所があればその一覧だけを簡潔に。

## 文章の見本（この水準で書くこと）
```js
{ id:'memory', ch:1, term:'メモリ', read:'RAM（ラム）・主記憶', icon:'FaMemory', lay:['hw'], sup:true,
  one:'計算中のデータを一時的に置いておく、速くて小さな作業スペース。',
  what:[
    'メモリは、パソコンの中で「いま使っているデータ」をいったん置いておく部品です。CPU（計算をする頭脳）は、保存場所（ストレージ）から直接ではなく、まずメモリに読み込んだデータを使って計算します。',
    'とても速く読み書きできる代わりに、容量は小さめで（PCなら8〜32GB程度）、電源を切ると中身が消えます。アプリをたくさん開くとPCが重くなるのは、このメモリがいっぱいになるためです。' ],
  ana:'勉強机の上のスペース。広いほど教科書やノートを一度にたくさん広げて作業できますが、片づける（電源を切る）と机の上は空になります。',
  scene:'ブラウザのタブを20個開いたらPCが遅くなった、ゲームの必要スペックに「メモリ16GB」と書いてある、といった場面で出てきます。',
  where:'パソコンやサーバーの中にある部品（ハードウェア）。マザーボードに差し込まれている。',
  rel:[ {to:'cpu',label:'データを渡す',dir:'out'}, {to:'storage',label:'読み込まれる',dir:'in'}, {to:'os',label:'割り当てる',dir:'in'} ],
  warn:'「メモリ」と「ストレージ（保存容量）」は別物です。スマホの「容量128GB」はストレージのことで、メモリ（RAM）ではありません。',
  learn:'Windowsのタスクマネージャー（Ctrl+Shift+Esc）を開き、メモリの使用量を見ましょう。アプリを開閉すると数字が変わります。' }
```
