import type { ChoiceOutcome, ScoreBreakdown } from '../types';

/**
 * 採点はすべてゲーム設計上の数値（100点満点）。臨床的なリスクや美しさを示さない。
 * 手書きの回答ルールで採点し、生成AIに正解判定を委ねない。
 */
export const SCORE_WEIGHTS: { key: keyof ScoreBreakdown; labelJa: string; max: number }[] = [
  { key: 'mechanismUnderstanding', labelJa: '作用の理解', max: 30 },
  { key: 'goalMatch', labelJa: '本人の希望との一致', max: 30 },
  { key: 'preservation', labelJa: '変更しない部分の維持', max: 20 },
  { key: 'costTimeCondition', labelJa: '費用・期間条件', max: 10 },
  { key: 'followUpEvaluation', labelJa: '経過評価', max: 10 },
];

export const totalScore = (b: ScoreBreakdown): number =>
  SCORE_WEIGHTS.reduce((sum, w) => sum + Math.min(b[w.key], w.max), 0);

/** ケースを「クリア」とみなす条件：推奨（正解として扱う）選択肢、または情報追加の途中経過 */
export const isClearingOutcome = (o: ChoiceOutcome): boolean => o.isRecommended && o.classification !== 'needs_information';

/** モードA：誤答は減点するが、ヒント利用では減点しない（ヒント未使用のみ別バッジ）。 */
export const reverseScore = (wrongAttempts: number): number => Math.max(40, 100 - wrongAttempts * 10);
