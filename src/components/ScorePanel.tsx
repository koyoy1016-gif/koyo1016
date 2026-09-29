import type { ScoreBreakdown } from '../types';
import { SCORE_WEIGHTS, totalScore } from '../lib/scoring';

export function ScorePanel({ b }: { b: ScoreBreakdown }) {
  return (
    <div className="score" aria-label="得点内訳">
      <p className="score__total">
        <strong>{totalScore(b)}</strong> / 100 点
      </p>
      <ul className="score__list">
        {SCORE_WEIGHTS.map((w) => (
          <li key={w.key}>
            <span>{w.labelJa}</span>
            <meter min={0} max={w.max} value={Math.min(b[w.key], w.max)} aria-label={w.labelJa} />
            <span className="score__num">
              {Math.min(b[w.key], w.max)}/{w.max}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted">得点はすべてゲーム設計上の数値です。臨床的なリスクや美しさを示すものではなく、人物の容姿を評価するものでもありません。</p>
    </div>
  );
}
