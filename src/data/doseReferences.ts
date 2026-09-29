import type { DoseReference } from '../types';

/**
 * 実際の量・適応（第6章）。注入の医学的な用量はこのファイルにのみ保持する。
 * 画像演出の small/medium/large とは計算式で結ばない。
 */
export const DOSE_REFERENCES: DoseReference[] = [
  {
    id: 'DOSE-JP-BOTOX-GLABELLA',
    jurisdiction: 'JP',
    product: 'ボトックスビスタ（50単位製剤）',
    indication: '眉間の表情皺',
    populationJa: '65歳未満の成人',
    unit: 'U',
    valueMin: 10,
    valueMax: 20,
    quantityScope: 'total_treatment',
    meaning: 'label_dose',
    sourceIds: ['S01'],
    verification: 'verified_document',
    warningJa: '3か月以内の再投与を避けるよう記載。個別の最適量として使わない。',
    usableAsQuizAnswer: true,
  },
  {
    id: 'DOSE-JP-BOTOX-LATERAL-CANTHAL',
    jurisdiction: 'JP',
    product: 'ボトックスビスタ（50単位製剤）',
    indication: '目尻の表情皺',
    populationJa: '65歳未満の成人',
    unit: 'U',
    valueMin: 12,
    valueMax: 24,
    quantityScope: 'bilateral_total',
    meaning: 'label_dose',
    sourceIds: ['S01'],
    verification: 'verified_document',
    warningJa: '左右合計の量。片側量ではない。3か月以内の再投与を避けるよう記載。',
    usableAsQuizAnswer: true,
  },
  {
    id: 'DOSE-JP-BOTOX-MASSETER',
    jurisdiction: 'JP',
    product: 'ボトックスビスタ（50・100単位製剤）',
    indication: '咬筋膨隆',
    populationJa: '65歳未満の成人',
    unit: 'U',
    valueMin: 48,
    valueMax: 72,
    quantityScope: 'bilateral_total',
    meaning: 'label_dose',
    sourceIds: ['S01'],
    verification: 'verified_document',
    warningJa:
      '左右合計の量。咬筋と眉間・目尻の同時投与は臨床試験経験がない旨も記載。個別最適量・他製剤換算に使わない。',
    usableAsQuizAnswer: true,
  },
  {
    id: 'DOSE-KR-NABOTA-MASSETER',
    jurisdiction: 'KR',
    product: 'NABOTA（50単位製剤）',
    indication: '良性咬筋肥大（一定の重症度）',
    populationJa: '18〜65歳',
    unit: 'U',
    valueMin: 48,
    valueMax: 48,
    quantityScope: 'bilateral_total',
    meaning: 'label_dose',
    sourceIds: ['S02'],
    verification: 'reference_found_primary_verification_pending',
    warningJa:
      'MFDS原本を今回直接照合できていない。韓国全製剤に共通の承認用量として掲載しない。日本製品との換算表も作らない。',
    usableAsQuizAnswer: false,
  },
  {
    id: 'DOSE-US-VOLBELLA-TRIAL',
    jurisdiction: 'US',
    product: 'JUVÉDERM VOLBELLA XC',
    indication: '口唇増大・口周囲のしわ（米国試験）',
    populationJa: '米国臨床試験参加者',
    unit: 'mL',
    valueMedian: 2.6,
    quantityScope: 'initial_plus_touchup_all_sites',
    meaning: 'trial_observation',
    sourceIds: ['S04'],
    verification: 'verified_document',
    warningJa:
      '初回＋タッチアップを合わせた全注入部位の合計の中央値。一度に唇へ入れる推奨量や日本・韓国の標準量ではない。ゲームの正解量として使わない。',
    usableAsQuizAnswer: true,
  },
];

export const doseReferenceById = new Map(DOSE_REFERENCES.map((d) => [d.id, d]));
