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
