import type { ImageAsset, ImageExpression } from '../types';
import { characterById } from './characters';

/**
 * 画像登録簿。画像は事前生成アセットを使う（リアルタイム生成は行わない）。
 * `src/assets/faces/{stateId}.webp|png|jpg` を置くと自動で差し替わる。
 * ファイルが無い間は「画像準備中」の開発表示になる（ビジュアル完成とは扱わない）。
 */

const found = import.meta.glob('../assets/faces/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const foundByStateId = new Map<string, string>();
for (const [path, url] of Object.entries(found)) {
  const file = path.split('/').pop() ?? '';
  foundByStateId.set(file.replace(/\.(webp|png|jpg|jpeg)$/i, ''), url);
}

type StateDef = {
  stateId: string;
  characterId: string;
  expression: ImageExpression;
  kind: 'base' | 'edit';
  altJa: string;
  timeLabelJa: string;
  /** 12.3 の {allowedRegion} */
  allowedRegion?: string;
  /** 12.3 の {visualDelta} */
  visualDelta?: string;
  /** 12.3 の {lockedRegions} */
  lockedRegions?: string;
  /** 12.3 の {timeState} */
  timeState?: string;
  /** 12.2 の {baselineFeature} */
  baselineFeature?: string;
};

const TL = {
  base: 'はじめの顔',
  success: '希望に沿う変化（落ち着いた後の想定）',
  under: '変化が小さい例（架空）',
  over: '希望を超える変化（架空の分岐）',
  medium: '中くらいの変化（架空）',
};

const LOCK_COMMON = '目・鼻・口・髪・服・肌の地の色・年齢・表情・頭の向き・照明・背景';

export const STATE_DEFS: StateDef[] = [
  // C01
  { stateId: 'C01_base', characterId: 'C01', expression: 'neutral', kind: 'base', altJa: '悠斗（架空・28歳男性）のはじめの顔。下顔面の軟部の張りがやや強い。', timeLabelJa: TL.base,
    baselineFeature: '下顔面の軟部の張りがやや強い。頬骨下には十分な自然な量がある。角張った顎先は維持' },
  { stateId: 'C01_success', characterId: 'C01', expression: 'neutral', kind: 'edit', altJa: '悠斗の希望に沿う変化。下顔面の張りが控えめに軽減。', timeLabelJa: TL.success,
    allowedRegion: '下顔面の左右の軟部', visualDelta: '左右下顔面の張りを控えめに減らす', lockedRegions: `骨の輪郭、頬の健康的な量、鼻、口、目、${LOCK_COMMON}`, timeState: '処置後、落ち着いた後の想定' },
  { stateId: 'C01_a04_lipmass', characterId: 'C01', expression: 'neutral', kind: 'edit', altJa: '悠斗：下顔面の張りが控えめで、唇にも控えめなボリュームがある。', timeLabelJa: '2段階の変更後（架空）',
    allowedRegion: '下顔面の軟部と唇', visualDelta: 'C01_successの状態に、さらに唇へ控えめな厚みを加える', lockedRegions: `骨の輪郭、頬の量、鼻、目、${LOCK_COMMON}`, timeState: '2段階の変更後、落ち着いた後の想定' },
  { stateId: 'C01_over', characterId: 'C01', expression: 'neutral', kind: 'edit', altJa: '悠斗：下顔面が細くなり、頬骨下のくぼみと影が目立つ架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '下顔面の左右と頬骨下', visualDelta: '下顔面が細くなり、頬骨下のくぼみと影が目立つ架空の形。やせた全身・病気・老化は加えない。血や傷は描かない', lockedRegions: `鼻、口、目、髪、${LOCK_COMMON}`, timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C06_over_frown', characterId: 'C06', expression: 'frown', kind: 'edit', altJa: '遥：表情筋の働きを弱め過ぎ、眉間を寄せようとしても表情が動きにくい架空の分岐。', timeLabelJa: '働きを弱め過ぎた例（架空の分岐）',
    allowedRegion: '眉間〜眉・上まぶたの表情', visualDelta: '眉間を寄せようとしても動きが乏しく、眉・目元の表情が平板になる。皮膚の色・骨格・年齢は変えない', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C07_over_smile', characterId: 'C07', expression: 'smile', kind: 'edit', altJa: '翔：表情筋の働きを弱め過ぎ、笑顔が動きにくくなる架空の分岐。', timeLabelJa: '表情が動きにくい例（架空の分岐）',
    allowedRegion: '目尻〜目元の表情', visualDelta: '笑っても目元の動きが乏しく、笑顔が硬く見える。皮膚の色・骨格・年齢は変えない', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '希望を超える設定の架空の分岐' },
  // C02
  { stateId: 'C02_base', characterId: 'C02', expression: 'neutral', kind: 'base', altJa: '美緒（架空・26歳女性）のはじめの顔。唇は薄め。', timeLabelJa: TL.base,
    baselineFeature: '薄めの上下唇、小さな自然な左右差。輪郭・鼻・目は本人が気に入っている' },
  { stateId: 'C02_success', characterId: 'C02', expression: 'neutral', kind: 'edit', altJa: '美緒の希望に沿う変化。唇に控えめな厚み。', timeLabelJa: TL.success,
    allowedRegion: '唇', visualDelta: '上下唇に控えめな厚みを足す', lockedRegions: `口幅、鼻、顎、目、肌質、${LOCK_COMMON}`, timeState: '腫れが落ち着いた後の想定' },
  { stateId: 'C02_medium', characterId: 'C02', expression: 'neutral', kind: 'edit', altJa: '美緒：唇の厚みが希望よりやや大きい設定。', timeLabelJa: TL.medium,
    allowedRegion: '唇', visualDelta: '上下唇の厚みが希望画像よりやや大きい。突出は控えめ', lockedRegions: `口幅、鼻、顎、目、肌質、${LOCK_COMMON}`, timeState: '腫れが落ち着いた後の想定' },
  { stateId: 'C02_over', characterId: 'C02', expression: 'neutral', kind: 'edit', altJa: '美緒：唇の厚みと前方への突出が希望を超える架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '唇', visualDelta: '唇の厚みと前方への突出が本人の希望画像を超える。怪物化や極端なカリカチュアはしない', lockedRegions: `口幅、鼻、顎、目、肌質、${LOCK_COMMON}`, timeState: '希望を超える設定の架空の分岐' },
  // C03
  { stateId: 'C03_base', characterId: 'C03', expression: 'neutral', kind: 'base', altJa: '健司（架空・35歳男性）のはじめの顔。角張った顎。', timeLabelJa: TL.base,
    baselineFeature: '角張った顎、下顔面の幅が目立つ。骨格が主因の設定' },
  { stateId: 'C03_under', characterId: 'C03', expression: 'neutral', kind: 'edit', altJa: '健司：咬筋のみ変更した場合の、変化が小さい例。', timeLabelJa: TL.under,
    allowedRegion: '下顔面の軟部', visualDelta: '元画像に非常に近い。下顔面にわずかな変化だけ。骨の輪郭は変えない', lockedRegions: `骨の輪郭、${LOCK_COMMON}`, timeState: '処置後、落ち着いた後の想定' },
  // C04
  { stateId: 'C04_base', characterId: 'C04', expression: 'neutral', kind: 'base', altJa: '紗奈（架空・34歳女性）のはじめの顔。頬骨下の量が少なめ。', timeLabelJa: TL.base,
    baselineFeature: '細身の顔、頬骨下の量が少ないが自然な日常の人物' },
  { stateId: 'C04_over', characterId: 'C04', expression: 'neutral', kind: 'edit', altJa: '紗奈：頬骨下のくぼみが強まる架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '頬骨下の限られた範囲', visualDelta: '頬骨下の限られた範囲だけをさらにくぼませる', lockedRegions: `顔全体の幅、${LOCK_COMMON}。病気の印象、強い影の照明変更、痩せた体を追加しない`, timeState: '希望を超える設定の架空の分岐' },
  // C06
  { stateId: 'C06_base', characterId: 'C06', expression: 'neutral', kind: 'base', altJa: '遥（架空・38歳女性）のはじめの顔（無表情）。', timeLabelJa: TL.base,
    baselineFeature: '眉間を寄せるとしわが出る（この画像は無表情）' },
  { stateId: 'C06_base_frown', characterId: 'C06', expression: 'frown', kind: 'edit', altJa: '遥のはじめの顔（眉間を寄せた表情）。', timeLabelJa: `${TL.base}・眉間を寄せた時`,
    allowedRegion: '表情のみ（眉間を寄せる）', visualDelta: 'C06_baseと同じ人物・同条件で、眉間を寄せた表情。しわが出る', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '処置前' },
  { stateId: 'C06_success', characterId: 'C06', expression: 'neutral', kind: 'edit', altJa: '遥の希望に沿う変化（無表情）。', timeLabelJa: TL.success,
    allowedRegion: '眉間', visualDelta: '無表情での眉間の見え方はほぼ同じ。表情時のしわが軽減する方向', lockedRegions: LOCK_COMMON, timeState: '処置後、評価時点の想定' },
  { stateId: 'C06_success_frown', characterId: 'C06', expression: 'frown', kind: 'edit', altJa: '遥の希望に沿う変化（眉間を寄せた表情）。しわが浅い。', timeLabelJa: `${TL.success}・眉間を寄せた時`,
    allowedRegion: '眉間', visualDelta: '眉間を寄せた表情で、しわが浅くなっている。表情が消えてはいない', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '処置後、評価時点の想定' },
  // C07
  { stateId: 'C07_base', characterId: 'C07', expression: 'neutral', kind: 'base', altJa: '翔（架空・42歳男性）のはじめの顔（無表情）。', timeLabelJa: TL.base,
    baselineFeature: '笑うと目尻にしわが出る。自然な笑顔の人物（この画像は無表情）' },
  { stateId: 'C07_base_smile', characterId: 'C07', expression: 'smile', kind: 'edit', altJa: '翔のはじめの顔（笑顔）。目尻にしわ。', timeLabelJa: `${TL.base}・笑った時`,
    allowedRegion: '表情のみ（自然な笑顔）', visualDelta: 'C07_baseと同じ人物・同条件で、自然な笑顔。目尻にしわが出る', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '処置前' },
  { stateId: 'C07_success', characterId: 'C07', expression: 'neutral', kind: 'edit', altJa: '翔の希望に沿う変化（無表情）。', timeLabelJa: TL.success,
    allowedRegion: '目尻', visualDelta: '無表情での見え方はほぼ同じ', lockedRegions: LOCK_COMMON, timeState: '処置後、評価時点の想定' },
  { stateId: 'C07_success_smile', characterId: 'C07', expression: 'smile', kind: 'edit', altJa: '翔の希望に沿う変化（笑顔）。目尻のしわが少し浅い。', timeLabelJa: `${TL.success}・笑った時`,
    allowedRegion: '目尻', visualDelta: '笑顔で、目尻のしわが少しだけ浅い。自然な笑顔は残す', lockedRegions: LOCK_COMMON.replace('表情・', ''), timeState: '処置後、評価時点の想定' },
  // C09
  { stateId: 'C09_base', characterId: 'C09', expression: 'neutral', kind: 'base', altJa: '大輔（架空・46歳男性）のはじめの顔。目の下にふくらみと溝。', timeLabelJa: TL.base,
    baselineFeature: '目の下にふくらみと、その下の影（溝）がある' },
  { stateId: 'C09_success', characterId: 'C09', expression: 'neutral', kind: 'edit', altJa: '大輔：ふくらみと溝がなだらかにつながった変化。', timeLabelJa: TL.success,
    allowedRegion: '両目の下', visualDelta: 'ふくらみと溝の段差がなだらかになる。手術の傷・腫れは描かない', lockedRegions: `目の形、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  // C10
  { stateId: 'C10_base', characterId: 'C10', expression: 'neutral', kind: 'base', altJa: '結衣（架空・40歳女性）のはじめの顔。目の下が暗く見える。', timeLabelJa: TL.base,
    baselineFeature: '目の下が暗く見える。ふくらみは小さい。原因は画像から断定できない描写にする' },
  // C14
  { stateId: 'C14_base', characterId: 'C14', expression: 'neutral', kind: 'base', altJa: '真紀（架空・52歳女性）のはじめの顔。下顔面の皮膚のたるみ。', timeLabelJa: TL.base,
    baselineFeature: '下顔面の軽度〜中等度のたるみ。頬の量は自然' },
  { stateId: 'C14_success', characterId: 'C14', expression: 'neutral', kind: 'edit', altJa: '真紀：頬の量を保ったまま、下垂が軽減した変化。', timeLabelJa: TL.success,
    allowedRegion: '下顔面のたるみ', visualDelta: '下顔面の位置が少し引き上がる。頬の量は維持。年齢感は保つ', lockedRegions: `頬の量、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C14_over', characterId: 'C14', expression: 'neutral', kind: 'edit', altJa: '真紀：頬の量が減り影が強まる架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '頬', visualDelta: '頬の量が減り、影が強まる。病気・痩せた印象は加えない', lockedRegions: LOCK_COMMON, timeState: '希望を超える設定の架空の分岐' },
  // C16
  { stateId: 'C16_base', characterId: 'C16', expression: 'neutral', kind: 'base', altJa: '楓（架空・27歳女性）のはじめの顔。質感が少しざらつき、ニキビ跡。', timeLabelJa: TL.base,
    baselineFeature: '少しざらついた肌の質感とニキビ跡。肌の地の色は濃いめ' },
  { stateId: 'C16_success', characterId: 'C16', expression: 'neutral', kind: 'edit', altJa: '楓の希望に沿う変化。質感が少しなめらか。', timeLabelJa: TL.success,
    allowedRegion: '肌表面の質感（ニキビ跡）', visualDelta: '肌表面の質感のみを少し変える。毛穴を完全に消さず、肌の地の色を明るくしない', lockedRegions: `鼻や輪郭、骨格、${LOCK_COMMON}`, timeState: '複数回の経過後の想定' },
  { stateId: 'C16_over', characterId: 'C16', expression: 'neutral', kind: 'edit', altJa: '楓：局所的な赤みや色むらが目立つ架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '肌表面の一部', visualDelta: '指定された局所的な赤みまたは色むらのみを表現。重度の熱傷、傷口、血液は描かない', lockedRegions: `鼻や輪郭、骨格、${LOCK_COMMON}`, timeState: '負担の大きい設定の架空の分岐' },
  // ---- C05〜C20（拡張分） ----
  { stateId: 'C05_base', characterId: 'C05', expression: 'neutral', kind: 'base', altJa: '蓮（架空・31歳男性）のはじめの顔。顎下の軟部が厚め。', timeLabelJa: TL.base,
    baselineFeature: '顎下の軟部の厚みがある。頬は普通の量。輪郭の骨格は変えない設定' },
  { stateId: 'C05_success', characterId: 'C05', expression: 'neutral', kind: 'edit', altJa: '蓮の希望に沿う変化。顎下の厚みのみ軽減。', timeLabelJa: TL.success,
    allowedRegion: '顎下の軟部', visualDelta: '顎下の軟部の厚みだけを控えめに減らす', lockedRegions: `頬の量、骨の輪郭、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C05_over', characterId: 'C05', expression: 'neutral', kind: 'edit', altJa: '蓮：顎下に加えて頬まで減り、くぼみが目立つ架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '顎下と頬', visualDelta: '顎下だけでなく頬の量も減り、頬骨下のくぼみが目立つ', lockedRegions: LOCK_COMMON, timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C08_base', characterId: 'C08', expression: 'neutral', kind: 'base', altJa: '凛（架空・23歳女性）のはじめの顔。奥二重。', timeLabelJa: TL.base,
    baselineFeature: '黒髪ポニーテール、奥二重（二重のラインが目立たない）、左右差は小さい' },
  { stateId: 'C08_success', characterId: 'C08', expression: 'neutral', kind: 'edit', altJa: '凛：控えめな二重のラインができた状態。', timeLabelJa: '変更後（落ち着いた後の想定）',
    allowedRegion: '上まぶたのライン', visualDelta: '控えめな二重のラインを加える。手術の傷や糸は描かない', lockedRegions: `目の大きさ、鼻、口、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C11_base', characterId: 'C11', expression: 'neutral', kind: 'base', altJa: '直人（架空・29歳男性）のはじめの顔。顎先の突出が控えめ。', timeLabelJa: TL.base,
    baselineFeature: '顎先の突出が控えめ（正面・横顔）。他は特徴を維持' },
  { stateId: 'C11_success', characterId: 'C11', expression: 'neutral', kind: 'edit', altJa: '直人：横顔をわずかに変えた変化。', timeLabelJa: TL.success,
    allowedRegion: '顎先の軟部', visualDelta: '顎先の突出感をわずかに補う', lockedRegions: `骨格、鼻、口、${LOCK_COMMON}`, timeState: '腫れが落ち着いた後の想定' },
  { stateId: 'C11_over', characterId: 'C11', expression: 'neutral', kind: 'edit', altJa: '直人：顎先が希望より大きく突出する架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '顎先の軟部', visualDelta: '顎先の突出が本人の希望を超える。極端なカリカチュアにしない', lockedRegions: LOCK_COMMON, timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C12_base', characterId: 'C12', expression: 'neutral', kind: 'base', altJa: '彩（架空・32歳女性）のはじめの顔。鼻翼の幅が広め。', timeLabelJa: TL.base,
    baselineFeature: '鼻翼の幅が広め。鼻背は本人が気に入っている' },
  { stateId: 'C12_success', characterId: 'C12', expression: 'neutral', kind: 'edit', altJa: '彩：小鼻の幅のみ控えめに変化。', timeLabelJa: TL.success,
    allowedRegion: '小鼻（鼻翼）', visualDelta: '小鼻の幅のみを控えめに狭める。鼻背・鼻先は変えない', lockedRegions: `鼻背、鼻先、目、口、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C12_over', characterId: 'C12', expression: 'neutral', kind: 'edit', altJa: '彩：小鼻が希望より狭くなり過ぎた架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '小鼻（鼻翼）', visualDelta: '小鼻が本人の希望より狭い。傷や出血は描かない', lockedRegions: LOCK_COMMON, timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C13_base', characterId: 'C13', expression: 'neutral', kind: 'base', altJa: '颯太（架空・30歳男性）のはじめの顔。鼻先が丸め。', timeLabelJa: TL.base,
    baselineFeature: '鼻先は丸め、鼻翼幅は普通' },
  { stateId: 'C13_success', characterId: 'C13', expression: 'neutral', kind: 'edit', altJa: '颯太：鼻先の形を調整した架空の変化。', timeLabelJa: '変更後（落ち着いた後の想定）',
    allowedRegion: '鼻先', visualDelta: '鼻先の丸みを少し引き締める。鼻翼の幅は変えない', lockedRegions: `鼻翼幅、鼻背、目、口、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C15_base', characterId: 'C15', expression: 'neutral', kind: 'base', altJa: '誠（架空・58歳男性）のはじめの顔。下顔面と首のたるみ。', timeLabelJa: TL.base,
    baselineFeature: '下顔面と首のたるみ。明るめの肌' },
  { stateId: 'C15_over', characterId: 'C15', expression: 'neutral', kind: 'edit', altJa: '誠：処置直後の赤みが強く出た架空の分岐。', timeLabelJa: '処置直後・赤みが目立つ状態（架空）',
    allowedRegion: '下顔面の皮膚', visualDelta: '局所的な赤みのみ。傷口・血液は描かない', lockedRegions: LOCK_COMMON, timeState: '処置直後の架空の分岐' },
  { stateId: 'C17_base', characterId: 'C17', expression: 'neutral', kind: 'base', altJa: '海斗（架空・33歳男性）のはじめの顔。頬に限局した茶色の色素斑。', timeLabelJa: TL.base,
    baselineFeature: '頬に限局した茶色の色素斑。他の肌はなめらか' },
  { stateId: 'C17_success', characterId: 'C17', expression: 'neutral', kind: 'edit', altJa: '海斗：色素斑が目立ちにくくなった変化。', timeLabelJa: TL.success,
    allowedRegion: '頬の色素斑', visualDelta: '色素斑のみを目立ちにくくする。肌の地の色は変えない', lockedRegions: `骨格、${LOCK_COMMON}`, timeState: '複数回の経過後の想定' },
  { stateId: 'C17_over', characterId: 'C17', expression: 'neutral', kind: 'edit', altJa: '海斗：局所的な赤みと色むらが出た架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '頬の一部', visualDelta: '局所的な赤みと色むらのみ。重度の熱傷、傷口は描かない', lockedRegions: `骨格、${LOCK_COMMON}`, timeState: '負担の大きい設定の架空の分岐' },
  { stateId: 'C18_base', characterId: 'C18', expression: 'neutral', kind: 'base', altJa: '由佳（架空・45歳女性）のはじめの顔。頬とこめかみの量が少なめ。', timeLabelJa: TL.base,
    baselineFeature: '頬とこめかみの量が少ない。深いしわは少なめ' },
  { stateId: 'C18_success', characterId: 'C18', expression: 'neutral', kind: 'edit', altJa: '由佳：へこみが少し補われた変化。', timeLabelJa: TL.success,
    allowedRegion: '頬・こめかみ', visualDelta: 'へこみを少し補う。顔の輪郭は変えない', lockedRegions: LOCK_COMMON, timeState: '落ち着いた後の想定' },
  { stateId: 'C18_a10_eye', characterId: 'C18', expression: 'neutral', kind: 'edit', altJa: '由佳：頬の補充に加え、目尻のしわが軽減した状態。', timeLabelJa: '2段階の変更後（架空）',
    allowedRegion: '目尻', visualDelta: 'C18_successの状態に、目尻のしわを軽減', lockedRegions: LOCK_COMMON, timeState: '2段階の変更後の想定' },
  { stateId: 'C18_a10_lip', characterId: 'C18', expression: 'neutral', kind: 'edit', altJa: '由佳：頬の補充・目尻・唇の3段階の変更後。', timeLabelJa: '3段階の変更後（架空）',
    allowedRegion: '唇', visualDelta: 'C18_a10_eyeの状態に、唇へ控えめな厚みを加える', lockedRegions: LOCK_COMMON, timeState: '3段階の変更後の想定' },
  { stateId: 'C18_over', characterId: 'C18', expression: 'neutral', kind: 'edit', altJa: '由佳：頬が丸く張り出す過充填の架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '頬', visualDelta: '頬のボリュームが希望を超え、丸く張り出す。病気・老化は加えない', lockedRegions: LOCK_COMMON, timeState: '希望を超える設定の架空の分岐' },
  { stateId: 'C19_base', characterId: 'C19', expression: 'neutral', kind: 'base', altJa: '智也（架空・25歳男性）のはじめの顔。鼻下から上唇の距離が長め。', timeLabelJa: TL.base,
    baselineFeature: '鼻下から上唇の距離が長め。唇の厚みは普通' },
  { stateId: 'C19_success', characterId: 'C19', expression: 'neutral', kind: 'edit', altJa: '智也：鼻下から上唇の距離が短く見える変化。', timeLabelJa: TL.success,
    allowedRegion: '鼻下〜上唇', visualDelta: '鼻下から上唇までの距離を短く見せる。傷は描かない', lockedRegions: `唇の厚み、鼻、目、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C20_base', characterId: 'C20', expression: 'neutral', kind: 'base', altJa: '恵（架空・62歳女性）のはじめの顔。年齢相応のしわと軽い乾燥感。', timeLabelJa: TL.base,
    baselineFeature: '自然な年齢相応のしわ、軽い肌の乾燥感。白髪' },
  { stateId: 'C20_success', characterId: 'C20', expression: 'neutral', kind: 'edit', altJa: '恵：肌のうるおい感のみが少し変化。', timeLabelJa: TL.success,
    allowedRegion: '肌表面のうるおい感', visualDelta: '肌のうるおい感のみを少し変える。しわ・顔型・年齢感は保つ', lockedRegions: `顔型、年齢感、${LOCK_COMMON}`, timeState: '落ち着いた後の想定' },
  { stateId: 'C20_over', characterId: 'C20', expression: 'neutral', kind: 'edit', altJa: '恵：年齢感が大きく変わってしまう架空の分岐。', timeLabelJa: TL.over,
    allowedRegion: '顔全体の印象', visualDelta: '顔型と年齢感が大きく変わって見える（本人が保ちたいものから離れる）', lockedRegions: '髪、服、背景', timeState: '希望を超える設定の架空の分岐' },
  // ---- 経過・履歴の中間状態 ----
  { stateId: 'C02_swollen', characterId: 'C02', expression: 'neutral', kind: 'edit', altJa: '美緒：処置直後、腫れを伴って唇が大きく見える状態（最終形ではない）。', timeLabelJa: '処置直後・腫れを伴う（最終形ではない）',
    allowedRegion: '唇', visualDelta: '腫れにより唇が一時的に大きく、やや赤く見える。血液・傷は描かない', lockedRegions: `口幅、鼻、顎、目、${LOCK_COMMON}`, timeState: '処置直後（腫れのピーク付近）' },
  { stateId: 'C16_a09_lip', characterId: 'C16', expression: 'neutral', kind: 'edit', altJa: '楓：肌の質感の改善に加え、唇にボリュームがある状態。', timeLabelJa: '2段階の変更後（架空）',
    allowedRegion: '肌の質感と唇', visualDelta: 'C16_successの状態に、唇へ控えめな厚みを加える', lockedRegions: LOCK_COMMON, timeState: '2段階の変更後の想定' },
];

export const IMAGE_ASSETS: ImageAsset[] = STATE_DEFS.map((d) => {
  const src = foundByStateId.get(d.stateId) ?? null;
  return {
    id: `IMG-${d.stateId}`,
    characterId: d.characterId,
    stateId: d.stateId,
    view: 'front',
    expression: d.expression,
    src,
    altJa: d.altJa,
    synthetic: true,
    identityChecked: false,
    nonTargetRegionsChecked: false,
    status: src ? 'generated' : 'planned',
    timeLabelJa: d.timeLabelJa,
    promptRefId: d.stateId,
  };
});

export const imageAssetByStateId = new Map(IMAGE_ASSETS.map((a) => [a.stateId, a]));

/** 生成画像（src/assets/faces）が置かれているか */
export const hasRealImage = (stateId: string): boolean => !!imageAssetByStateId.get(stateId)?.src;

/** 全ての状態が実画像なら true。一部でも欠けるケースは、仮イラストで統一して表示する */
export const allReal = (stateIds: string[]): boolean => stateIds.length > 0 && stateIds.every(hasRealImage);

export const stateDefByStateId = new Map(STATE_DEFS.map((d) => [d.stateId, d]));

/** 12.2 / 12.3 のテンプレートを埋めた画像生成プロンプト */
export const buildPrompt = (d: StateDef): string => {
  const c = characterById.get(d.characterId)!;
  if (d.kind === 'base') {
    return [
      `用途：日本語ブラウザゲームの完全に架空の成人キャラクターの基準画像。`,
      `人物ID：${c.id}。年齢：${c.age}歳。外見の設定：${c.gender === 'male' ? '男性' : '女性'}、${c.skinToneJa}、${c.hairJa}。`,
      `実在の人物、著名人、既存の症例写真を参照しない新規の人物。`,
      `正面、頭から肩まで、自然な無表情、頭は直立、目線はカメラ。`,
      `均一な灰色背景、左右対称の柔らかいスタジオ照明、同じ露出、ポートレート用の自然な遠近感。顔全体と耳が確認できる構図。`,
      `肌の自然な質感と小さな左右差を残す。地の肌色を変えない。`,
      `初期の特徴：${d.baselineFeature ?? ''}。`,
      `髪型：${c.hairJa}。衣服：無地の襟元が見えるシャツ。`,
      `メイクはなし、または全状態で変わらないごく薄いもの。`,
      `誇張した醜さ、病気の演出、嘲笑、文字、ロゴ、医療器具、傷口は不要。`,
      `これは実在患者の症例写真ではなく、ゲーム用の架空人物画像。`,
    ].join('\n');
  }
  return [
    `入力画像は編集対象の基準画像（${c.id}_base）。人物ID：${c.id}。`,
    `この人物の顔の同一性、年齢、肌色、髪、服、表情、頭の向き、画角、照明、背景、解像度を維持する。`,
    `変更してよい範囲：${d.allowedRegion ?? ''}。`,
    `表現する架空の変化：${d.visualDelta ?? ''}。`,
    `変更しない範囲：${d.lockedRegions ?? ''}。`,
    `評価時点の設定：${d.timeState ?? ''}。`,
    `新しい美肌加工、メイク、全顔の細身化、目の拡大、鼻の変形を追加しない。`,
    `この変化は医学的予測や施術効果の保証を目的としない。`,
    `処置の位置、深さ、薬剤量、器具は描かない。`,
  ].join('\n');
};
