import { useMemo, useRef, useState } from 'react';
import type { GameCase, ReverseHistoryStep } from '../types';
import { REGIONS, regionById } from '../data/regions';
import { procedureById } from '../data/procedures';
import { imageAssetByStateId } from '../data/imageAssets';
import { CaseInfo } from '../components/CaseInfo';
import { FaceImage } from '../components/FaceImage';
import { SourceChips } from '../components/Badges';
import { ProcedureDetail } from '../components/ProcedureDetail';
import { reverseScore } from '../lib/scoring';

type Props = {
  gameCase: GameCase;
  nextCaseId: string | null;
  onCleared: (score: number, hintUsed: boolean) => void;
  onExit: () => void;
  onNext: (caseId: string) => void;
};

type Msg = { kind: 'ok' | 'ng' | 'info'; text: string } | null;

const TISSUE_JA = { muscle: '筋肉', fat: '脂肪', bone: '骨格', skin: '皮膚', soft_tissue: '軟部組織' } as const;

/**
 * モードA：intro → inspect → selectRegion → selectProcedure → check → revealPrevious → inspect/complete
 * 最後の変更から逆順に解く。誤答は画像を変えず、ヒントと残り試行回数を更新する。
 */
export function PlayReverse({ gameCase: c, nextCaseId, onCleared, onExit, onNext }: Props) {
  const initialSteps = useMemo(() => [...(c.reverseHistory ?? [])].sort((a, b) => b.order - a.order), [c]);
  const [remaining, setRemaining] = useState<ReverseHistoryStep[]>(initialSteps);
  const [solved, setSolved] = useState<ReverseHistoryStep[]>([]);
  const [currentStateId, setCurrentStateId] = useState(c.initialStateId);
  const [region, setRegion] = useState<string | null>(null);
  const [procedure, setProcedure] = useState<string | null>(null);
  const [wrong, setWrong] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [expr, setExpr] = useState<'neutral' | 'variant'>('neutral');
  const clearedRef = useRef(false);

  const top = remaining[0];
  const done = remaining.length === 0;
  const attemptsLeft = Math.max(0, c.maxAttempts - wrong);
  const alwaysHints = c.level === 1;
  const showNarrowing = !!top && (hintOpen || attemptsLeft === 0);

  const displayStateId = (() => {
    if (expr === 'variant' && c.expressionVariant) {
      const v = `${currentStateId}_${c.expressionVariant}`;
      if (imageAssetByStateId.has(v)) return v;
    }
    return currentStateId;
  })();

  const check = () => {
    if (!top || !region || !procedure || done) return;

    if (region === top.regionId && procedure === top.procedureId) {
      const next = remaining.slice(1);
      setSolved((s) => [...s, top]);
      setRemaining(next);
      setCurrentStateId(top.beforeStateId);
      setRegion(null);
      setProcedure(null);
      setHintOpen(false);
      const p = procedureById.get(top.procedureId)!;
      setMsg({
        kind: 'ok',
        text: `一致しました：${regionById.get(top.regionId)?.labelJa}／${p.nameJa}。この施術を適用する前の画像へ切り替えます。`,
      });
      if (next.length === 0 && !clearedRef.current) {
        clearedRef.current = true;
        onCleared(reverseScore(wrong), (hintOpen && !alwaysHints) || attemptsLeft === 0);
      }
      return;
    }

    setWrong((n) => n + 1);
    const chosen = procedureById.get(procedure)!;
    const laterMatch = remaining.slice(1).some((s) => s.procedureId === procedure);
    let text: string;
    if (laterMatch) {
      text = `「${chosen.nameJa}」は履歴に含まれています。ただし、最後に行われた変更から逆順に解きます。ログの新しい記録を確認しましょう。`;
    } else if (procedure === top.procedureId) {
      text = '施術の見当は合っています。ただし、その施術が作用する部位が違います。部位を選び直しましょう。';
    } else {
      text = `「${chosen.nameJa}」の作用：${chosen.mechanism.textJa} 記録の内容とは合いません。${
        region !== top.regionId ? '部位も見直してみましょう。' : ''
      }`;
    }
    setMsg({ kind: 'ng', text: `${text}（画像は変わりません）` });
  };

  const askInsufficient = () => {
    setMsg({
      kind: 'info',
      text: '「情報不足」を選ぶ場面は、記録も写真も足りない問題です。この問題には記録の手がかりがあります。記録カードをもう一度読んでみましょう。',
    });
  };

  const totalScore = reverseScore(wrong);

  return (
    <div className="play">
      <div className="play__face">
        <FaceImage
          stateId={displayStateId}
          selectableRegions={!done}
          selectedRegionId={region}
          onSelectRegion={(id) => {
            setRegion(id);
            setMsg(null);
          }}
        />
        {c.expressionVariant && (
          <div className="segmented" role="group" aria-label="表情の比較">
            <button type="button" className={`segmented__item ${expr === 'neutral' ? 'is-selected' : ''}`} onClick={() => setExpr('neutral')}>
              無表情
            </button>
            <button type="button" className={`segmented__item ${expr === 'variant' ? 'is-selected' : ''}`} onClick={() => setExpr('variant')}>
              {c.expressionVariant === 'frown' ? '眉間を寄せた時' : '笑った時'}
            </button>
          </div>
        )}
        <p className="muted">
          履歴の残り：{remaining.length}件。正解した施術を1件ずつ取り除き、元の顔へ戻すとクリアです。
        </p>
      </div>

      <div className="play__side">
        <button type="button" className="btn btn--text" onClick={onExit}>
          ← ケース一覧へ
        </button>
        <CaseInfo c={c} />

        {!done && (
          <section className="panel" aria-label="選択">
            <fieldset className="choices">
              <legend>① 部位を選ぶ（顔をタップ、またはボタン）</legend>
              <div className="grid-buttons">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`btn btn--chip ${region === r.id ? 'is-selected' : ''}`}
                    aria-pressed={region === r.id}
                    onClick={() => {
                      setRegion(r.id);
                      setMsg(null);
                    }}
                  >
                    {r.labelJa}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="choices">
              <legend>② 施術を選ぶ</legend>
              <div className="grid-buttons">
                {c.allowedProcedureIds.map((pid) => {
                  const p = procedureById.get(pid)!;
                  return (
                    <button
                      key={pid}
                      type="button"
                      className={`btn btn--chip btn--wide ${procedure === pid ? 'is-selected' : ''}`}
                      aria-pressed={procedure === pid}
                      onClick={() => {
                        setProcedure(pid);
                        setMsg(null);
                      }}
                    >
                      {p.nameJa}
                      <small>作用する組織：{p.targetTissues.map((t) => TISSUE_JA[t]).join('・')}</small>
                    </button>
                  );
                })}
                <button type="button" className="btn btn--chip btn--wide btn--muted" onClick={askInsufficient}>
                  情報不足（外観だけでは決められない）
                </button>
              </div>
            </fieldset>

            <div className="hints">
              {(alwaysHints ? c.hintsJa : hintOpen ? c.hintsJa : []).map((h) => (
                <p key={h} className="hint">💡 {h}</p>
              ))}
              {showNarrowing && top && (
                <div className="card">
                  <strong>候補を絞る情報カード</strong>
                  <p>{top.hintCardJa}</p>
                  <p>{top.narrowingNoteJa}</p>
                </div>
              )}
              {!hintOpen && (
                <button type="button" className="btn btn--ghost" onClick={() => setHintOpen(true)}>
                  ヒントを見る（独力クリアのバッジのみ対象外になります）
                </button>
              )}
            </div>
            <p className="attempts">残り試行回数：{attemptsLeft}／{c.maxAttempts}（0になっても続けられ、ヒントが開きます）</p>
          </section>
        )}

        {msg && (
          <p className={`msg msg--${msg.kind}`} role="status" aria-live="polite">
            <span aria-hidden="true">{msg.kind === 'ok' ? '✔' : msg.kind === 'ng' ? '✖' : 'ℹ'}</span> {msg.text}
          </p>
        )}

        {done && (
          <section className="panel result" aria-label="結果">
            <h3>🎉 元の顔へ戻りました</h3>
            <p className="score__total">
              <strong>{totalScore}</strong> / 100 点（誤答による減点のみ。ヒント利用では減点しません）
            </p>
            <p className="note">
              この巻き戻しはゲームの仕掛けです。骨切りや脂肪除去などが現実でも簡単に元に戻ることを意味しません。また、現実の他人の施術を見抜ける能力を示すものでもありません。
            </p>
            {solved.map((s) => {
              const p = procedureById.get(s.procedureId)!;
              return (
                <div key={s.order} className="card">
                  <strong>
                    {s.order}件目：{p.nameJa}（{regionById.get(s.regionId)?.labelJa}）
                  </strong>
                  <p>作用：{p.mechanism.textJa}</p>
                  <p>推理に使えたヒント：{s.hintCardJa}</p>
                  <p>実際には見た目だけで特定できない点：{s.narrowingNoteJa}</p>
                  <SourceChips ids={p.mechanism.sourceIds} />
                  <details className="more">
                    <summary>詳しい情報</summary>
                    <ProcedureDetail p={p} />
                  </details>
                </div>
              );
            })}
          </section>
        )}
      </div>

      <div className="actionbar">
        {!done && (
          <button type="button" className="btn btn--primary" disabled={!region || !procedure} onClick={check}>
            確認する
          </button>
        )}
        {done && (
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
