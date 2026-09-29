/**
 * FACE LAB データ型定義
 * 医学情報・価格・症例・採点ルール・画像情報はUIから独立したデータとして持つ。
 * 出典なしの実数・承認情報は公開用の正解判定に使用しない。
 */

export type EvidenceStatus =
  | 'verified_document' // 一次資料（添付文書・規制当局資料等）で確認済み
  | 'clinical_reference' // 学会・臨床機関等の一般的な参照資料
  | 'reference_found_primary_verification_pending' // 資料は見つかったが一次原本の照合待ち
  | 'unverified' // 未確認
  | 'fictional_game_rule'; // ゲーム設計上の架空ルール（医学的事実ではない）

export type Jurisdiction = 'JP' | 'KR' | 'US' | 'international';

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  jurisdiction: Jurisdiction;
  kind:
    | 'label'
    | 'regulator'
    | 'guideline'
    | 'study'
    | 'hospital_education'
    | 'clinic_price'
    | 'press_release'
    | 'reproduced_label';
  publishedOrRevisedAt: string | null;
  accessedAt: string;
  noteJa: string;
};

export type Claim = {
  id: string;
  textJa: string;
  sourceIds: string[];
  status: EvidenceStatus;
  limitationsJa: string;
};

export type DoseUnit = 'U' | 'mL';

export type DoseReference = {
  id: string;
  jurisdiction: 'JP' | 'KR' | 'US';
  product: string;
  indication: string;
  populationJa: string;
  unit: DoseUnit;
  valueMin?: number;
  valueMax?: number;
  valueMedian?: number;
  quantityScope:
    | 'bilateral_total'
    | 'total_treatment'
    | 'initial_plus_touchup_all_sites'
    | 'sales_package';
  meaning: 'label_dose' | 'trial_observation' | 'sales_volume';
  sourceIds: string[];
  verification: EvidenceStatus;
  warningJa: string;
  /** 韓国NABOTA等、一次原本照合待ちのため公開クイズの正解根拠として使用禁止 */
  usableAsQuizAnswer: boolean;
};

export type TaxStatus = 'included' | 'excluded' | 'unknown';
export type PriceType = 'listed' | 'initial' | 'campaign' | 'monitor' | 'unknown';

export type PriceExample = {
  id: string;
  procedureIds: string[];
  country: 'JP' | 'KR';
  clinicName: string;
  productOrMenu: string;
  amount: number | null;
  currency: 'JPY' | 'KRW';
  billingUnitJa: string;
  taxStatus: TaxStatus;
  priceType: PriceType;
  includedJa: string[];
  excludedOrUnknownJa: string[];
  sourceIds: string[];
  checkedAt: string;
};

export type RecoveryCard = {
  id: string; // D0-D13
  targetJa: string;
  backToDailyLifeJa: string;
  visibleSwellingRednessJa: string;
  settledEvaluationJa: string;
  limitationsJa: string;
  sourceIds: string[];
};

export type TargetTissue = 'muscle' | 'fat' | 'bone' | 'skin' | 'soft_tissue';

export type ProcedureContentStatus = 'ready_for_knowledge_quiz' | 'reference_only' | 'draft';

export type Procedure = {
  id: string;
  nameJa: string;
  genericNameJa: string;
  brandExampleJa: string;
  aliases: string[];
  category: string;
  regions: string[];
  targetTissues: TargetTissue[];
  mechanism: Claim;
  expectedChanges: Claim[];
  limitations: Claim[];
  temporaryReactions: Claim[];
  importantComplications: Claim[];
  reversibility: Claim;
  evaluationTimingJa: string;
  durabilityJa: string;
  recoveryCardIds: string[];
  doseReferenceIds: string[];
  priceExampleIds: string[];
  contentStatus: ProcedureContentStatus;
  independentlyReviewedByClinician:
    | false
    | { name: string; reviewedAt: string; scope: string };
};

export type Gender = 'male' | 'female';

export type Character = {
  id: string;
  nameJa: string;
  gender: Gender;
  age: number;
  skinToneJa: string;
  hairJa: string;
  visibleFeaturesJa: string[]; // 画像上の特徴
  clinicalNoteJa: string[]; // 診察で得たことにする設定（架空）
  goalJa: string;
  preserveJa: string[]; // 残したい個性・変えたくない部分
  themeJa: string; // 学習テーマ・使用候補
};

export type ImageState = 'base' | 'success' | 'under' | 'over' | 'before' | 'after' | string;
export type ImageView = 'front' | 'left45' | 'right45' | 'profile';
export type ImageExpression = 'neutral' | 'frown' | 'smile';
export type ImageAssetStatus = 'planned' | 'generated' | 'visually_reviewed';

export type ImageAsset = {
  id: string;
  characterId: string;
  stateId: ImageState;
  view: ImageView;
  expression: ImageExpression;
  src: string | null;
  altJa: string;
  synthetic: true;
  identityChecked: boolean;
  nonTargetRegionsChecked: boolean;
  status: ImageAssetStatus;
  timeLabelJa: string; // 「AI生成・架空の変化例」と併記する時点ラベル
  promptRefId: string; // docs/IMAGE_PROMPTS.md 内の対応プロンプトID
};

export type ChoiceClassification =
  | 'fits_goal'
  | 'partial'
  | 'wrong_target'
  | 'exceeds_goal'
  | 'defer'
  | 'needs_information';

export type ScoreBreakdown = {
  mechanismUnderstanding: number; // /30 作用の理解
  goalMatch: number; // /30 本人の希望との一致
  preservation: number; // /20 変更しない部分の維持
  costTimeCondition: number; // /10 費用・期間条件への対応
  followUpEvaluation: number; // /10 経過評価
};

export type ChoiceOutcome = {
  choiceId: string;
  labelJa: string;
  procedureId?: string;
  magnitude?: 'small' | 'medium' | 'large';
  classification: ChoiceClassification;
  isRecommended: boolean; // このケースの「正解」として扱うか（複数可）
  targetStateId: string; // 遷移先の画像状態
  feedbackJa: string;
  misconceptionAddressedJa?: string; // 「違います」で終わらせないための誤解説明
  rationaleSourceIds: string[];
  score: ScoreBreakdown;
  fictionalVisualRule: true;
};

export type ReverseHistoryStep = {
  procedureId: string;
  regionId: string;
  beforeStateId: string;
  afterStateId: string;
  order: number;
  hintCardJa: string; // 外観以外の識別ヒント（候補を絞る情報カード）
  narrowingNoteJa: string; // 見た目が似る施術の絞り込み説明
  /** 複合履歴：どちらを選んでも一括で戻る、同時に登録された施術ID */
  alsoAcceptedProcedureIds?: string[];
  /** 記録が足りない段階：正解は「情報不足」を選ぶこと */
  informationInsufficient?: boolean;
};

export type GameMode = 'reverse' | 'design';

export type GameCase = {
  id: string;
  /** 顔を出さない資料読解問題（添付文書カード等）は null */
  characterId: string | null;
  /** 資料読解問題で表示する用量資料（数値は問題文に複製せずデータ参照する） */
  doseReferenceIds?: string[];
  level: number;
  mode: GameMode;
  titleJa: string;
  visibleFeaturesJa: string[];
  fictionalAssessmentJa: string[]; // 架空の診察メモ
  goalJa: string;
  preserveJa: string[];
  budgetConditionJa?: string;
  recoveryConditionJa?: string;
  initialStateId: string;
  allowedRegionIds: string[];
  /** モードAで選択肢として並べる施術ID（正解＋紛らわしい候補） */
  allowedProcedureIds: string[];
  outcomes: ChoiceOutcome[]; // モードB用
  /** 「情報を追加」を選んだ後に表示する架空の診察メモ（モードB） */
  infoCardJa?: string[];
  /** 情報追加後に差し替える選択肢（未指定なら同じ選択肢を使う） */
  outcomesAfterInfo?: ChoiceOutcome[];
  hintsJa: string[];
  reverseHistory?: ReverseHistoryStep[]; // モードA用（逆順に解く）
  /** モードAの誤答許容回数。モードBは無制限のため 0 */
  maxAttempts: number;
  requiresMagnitudeChoice?: boolean;
  /** 表情の比較表示（同じ人物・同じ表情の前後をそろえる） */
  expressionVariant?: 'frown' | 'smile';
  complete: boolean;
};

export type ProgressV1 = {
  version: 1;
  completedCaseIds: string[];
  bestScoreByCaseId: Record<string, number>;
  hintUsedByCaseId: Record<string, boolean>;
  soloClearedByCaseId: Record<string, boolean>; // ヒント未使用クリアのバッジ
  seenIntroDisclaimer: boolean;
  updatedAt: string;
};
