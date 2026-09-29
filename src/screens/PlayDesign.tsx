import { useMemo, useRef, useState } from 'react';
import type { ChoiceOutcome, GameCase } from '../types';
import { procedureById } from '../data/procedures';
import { CaseInfo } from '../components/CaseInfo';
import { FaceImage } from '../components/FaceImage';
import { ClassificationBadge, SourceChips } from '../components/Badges';
import { DoseCard, ProcedureDetail } from '../components/ProcedureDetail';
import { doseReferenceById } from '../data/doseReferences';
import { ScorePanel } from '../components/ScorePanel';
import { totalScore } from '../lib/scoring';

type Props = {
  gameCase: GameCase;
  nextCaseId: string | null;
  onCleared: (score: number, hintUsed: boolean) => void;
  onExit: () => void;
  onNext: (caseId: string) => void;
};

const MAG_LABEL = { small: '小さく', medium: '中くらい', large: '大きく' } as const;

const planKeyOf = (o: ChoiceOutcome) => (o.magnitude ? `mag:${o.procedureId}` : o.choiceId);
const planLabelOf = (o: ChoiceOutcome) => o.labelJa.replace(/（変化：.*）/, '');

/**
 * モードB：intro → readGoal → inspect → choosePlan → chooseVisualMagnitude → confirm → reveal → explain → retry/next
 */
export function PlayDesign({ gameCase: c, nextCaseId, onCleared, onExit, onNext }: Props) {
  const [infoAdded, setInfoAdded] = useState(false);
  const [planKey, setPlanKey] = useState<string | null>(null);
  const [magnitude, setMagnitude] = useState<'small' | 'medium' | 'large' | null>(null);
  const [result, setResult] = useState<ChoiceOutcome | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const clearedRef = useRef(false); // 二重クリック・再表示による二重計上を防ぐ

  const outcomes = infoAdded && c.outcomesAfterInfo ? c.outcomesAfterInfo : c.outcomes;
  const alwaysHints = c.level === 1;
  const knowledgeOnly = c.characterId === null;
  const doseCards = (c.doseReferenceIds ?? []).map((id) => doseReferenceById.get(id)).filter((d) => !!d);

  const plans = useMemo(() => {
    const seen = new Map<string, ChoiceOutcome[]>();
    for (const o of outcomes) {
      const k = planKeyOf(o);
      seen.set(k, [...(seen.get(k) ?? []), o]);
    }
    return [...seen.entries()].map(([key, list]) => ({ key, list, label: planLabelOf(list[0]), needsMagnitude: !!list[0].magnitude }));
  }, [outcomes]);

  const selectedPlan = plans.find((p) => p.key === planKey) ?? null;
  const selectedOutcome: ChoiceOutcome | null = selectedPlan
    ? selectedPlan.needsMagnitude
      ? (selectedPlan.list.find((o) => o.magnitude === magnitude) ?? null)
      : selectedPlan.list[0]
    : null;

  const canConfirm = !!selectedOutcome && !result;

  const confirm = () => {
    if (!selectedOutcome || result) return;
    setResult(selectedOutcome);
    if (selectedOutcome.classification === 'needs_information') {
      setInfoAdded(true);
      return;
    }
    if (selectedOutcome.isRecommended && !clearedRef.current) {
      clearedRef.current = true;
      onCleared(totalScore(selectedOutcome.score), hintCount > 0);
    }
  };

  const retry = () => {
    setResult(null);
    setPlanKey(null);
    setMagnitude(null);
  };

  const shownState = result ? result.targetStateId : c.initialStateId;
  const isCleared = !!result && result.isRecommended && result.classification !== 'needs_information';
  const wentForInfo = !!result && result.classification === 'needs_information';
  const step = result ? 4 : selectedPlan?.needsMagnitude ? (magnitude ? 3 : 2) : selectedPlan ? 3 : 1;

  return (
    <div className="play">
      <div className="play__face">
        {knowledgeOnly ? (
          <section className="panel" aria-label="資料カード">
            <h2 className="panel__title">資料カード</h2>
            <p className="muted">数値は資料カードからデータ参照しています。個人の適量の推奨ではありません。</p>
            {doseCards.map((d) => (
              <DoseCard key={d!.id} d={d!} />
            ))}
          </section>
        ) : (
          <FaceImage stateId={shownState} />
        )}
        {result && !knowledgeOnly && (
          <details className="compare">
            <summary>はじめの顔と並べて比べる</summary>
            <div className="compare__row">
              <FaceImage stateId={c.initialStateId} compact />
              <FaceImage stateId={result.targetStateId} compact />
            </div>
            <p className="muted">同じ人物・同じ画角の架空画像を並べています。変化は教育用の架空の表現で、実際の施術結果ではありません。</p>
          </details>
        )}
      </div>

      <div className="play__side">
        <button type="button" className="btn btn--text" onClick={onExit}>
          ← ケース一覧へ
        </button>
        <CaseInfo c={c} extraNotes={infoAdded ? c.infoCardJa : undefined} />

        {!result && (
          <section className="panel" aria-label="選択">
            <ol className="steps" aria-label="進行">
              <li className={step >= 1 ? 'is-on' : ''}>プランを選ぶ</li>
              {c.requiresMagnitudeChoice && <li className={step >= 2 ? 'is-on' : ''}>変化の程度</li>}
              <li className={step >= 3 ? 'is-on' : ''}>確認する</li>
            </ol>

            <fieldset className="choices">
              <legend>どうしますか？</legend>
              {plans.map((p) => (
                <label key={p.key} className={`choice ${planKey === p.key ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="plan"
                    checked={planKey === p.key}
                    onChange={() => {
                      setPlanKey(p.key);
                      setMagnitude(null);
                    }}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </fieldset>

            {selectedPlan?.needsMagnitude && (
              <fieldset className="choices">
                <legend>変化の程度（ゲーム用の架空設定。実際のmL・Uには換算しません）</legend>
                <div className="segmented">
                  {selectedPlan.list.map((o) => (
                    <label key={o.choiceId} className={`segmented__item ${magnitude === o.magnitude ? 'is-selected' : ''}`}>
                      <input type="radio" name="mag" checked={magnitude === o.magnitude} onChange={() => setMagnitude(o.magnitude ?? null)} />
                      <span>{MAG_LABEL[o.magnitude!]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="hints">
              {(alwaysHints ? c.hintsJa : c.hintsJa.slice(0, hintCount)).map((h) => (
                <p key={h} className="hint">💡 {h}</p>
              ))}
              {!alwaysHints && hintCount < c.hintsJa.length && (
                <button type="button" className="btn btn--ghost" onClick={() => setHintCount((n) => n + 1)}>
                  ヒントを見る（独力クリアのバッジのみ対象外になります）
                </button>
              )}
            </div>
          </section>
        )}

        {result && (
          <section className="panel result" aria-live="polite" aria-label="結果">
            <h3>結果</h3>
            <ClassificationBadge c={result.classification} />
            <p className="result__choice">選択：{result.labelJa}</p>
            <p>{result.feedbackJa}</p>
            {result.misconceptionAddressedJa && <p className="note">📝 {result.misconceptionAddressedJa}</p>}
            <p className="muted">
              ※ この画像は「AI生成・架空の変化例」の分岐ルールで、実際の施術結果・量・発生率とは結びつきません。
              {result.classification === 'exceeds_goal' && '「希望を超えた変化」は医学的合併症とは別の項目です。合併症は適切な選択でも起こり得ます。'}
            </p>
            {!wentForInfo && <ScorePanel b={result.score} />}
            {result.rationaleSourceIds.length > 0 && (
              <p>
                根拠の出典：<SourceChips ids={result.rationaleSourceIds} />
              </p>
            )}
            {result.procedureId && procedureById.get(result.procedureId) && (
              <details className="more">
                <summary>詳しい情報：{procedureById.get(result.procedureId)!.nameJa}</summary>
                <ProcedureDetail p={procedureById.get(result.procedureId)!} />
              </details>
            )}
            {result.classification === 'defer' && (
              <p className="note">「変更しない」は失敗ではありません。希望と条件に合う場合、適切な見送りは満点になります。</p>
            )}
            {isCleared && <p className="cleared">🎉 このケースをクリアしました。</p>}
          </section>
        )}
      </div>

      <div className="actionbar">
        {!result && (
          <button type="button" className="btn btn--primary" disabled={!canConfirm} onClick={confirm}>
            結果を見る
          </button>
        )}
        {result && wentForInfo && (
          <button type="button" className="btn btn--primary" onClick={retry}>
            診察メモを読んで、選び直す
          </button>
        )}
        {result && !wentForInfo && !isCleared && (
          <button type="button" className="btn btn--primary" onClick={retry}>
            もう一度選ぶ
          </button>
        )}
        {isCleared && (
          <>
            <button type="button" className="btn btn--ghost" onClick={onExit}>
              ケース一覧へ
            </button>
            {nextCaseId && (
              <button type="button" className="btn btn--primary" onClick={() => onNext(nextCaseId)}>
                次のケースへ
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
