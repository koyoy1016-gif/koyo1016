import type { GameCase } from '../types';
import { characterById } from '../data/characters';

export function CaseInfo({ c, extraNotes }: { c: GameCase; extraNotes?: string[] }) {
  const ch = c.characterId ? characterById.get(c.characterId) ?? null : null;
  const isDesign = c.mode === 'design';
  return (
    <section className="panel" aria-label="人物と希望">
      <h2 className="panel__title">
        <span className="badge badge--lv">Lv.{c.level}</span> {c.titleJa}
      </h2>
      {ch ? (
        <p className="who">
          {ch.nameJa}（{ch.gender === 'male' ? '男性' : '女性'}{ch.age}歳・架空）／{ch.skinToneJa}／{ch.hairJa}
        </p>
      ) : (
        <p className="who">資料読解問題（顔画像はありません）</p>
      )}
      <dl className="facts">
        {c.visibleFeaturesJa.length > 0 && (
          <>
            <dt>{isDesign ? '本人が気にしている特徴' : '画像上の特徴'}</dt>
            <dd>
              <ul>
                {c.visibleFeaturesJa.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {c.fictionalAssessmentJa.length > 0 && (
          <>
            <dt>{!ch ? '問題' : isDesign ? '架空の診察メモ' : '手がかり（架空の記録）'}</dt>
            <dd>
              <ul>
                {c.fictionalAssessmentJa.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {ch && <p className="muted">診察メモ・記録はゲーム用の架空設定です。画像から推測した事実ではありません。</p>}
            </dd>
          </>
        )}
        {extraNotes && extraNotes.length > 0 && (
          <>
            <dt>追加された診察メモ（架空）</dt>
            <dd>
              <ul>
                {extraNotes.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>{!ch ? 'ミッション' : isDesign ? '希望する変化' : 'ミッション'}</dt>
        <dd>{c.goalJa}</dd>
        {c.preserveJa.length > 0 && (
          <>
            <dt>残したい個性</dt>
            <dd>{c.preserveJa.join('、')}</dd>
          </>
        )}
        {c.budgetConditionJa && (
          <>
            <dt>費用の条件</dt>
            <dd>{c.budgetConditionJa}</dd>
          </>
        )}
        {c.recoveryConditionJa && (
          <>
            <dt>回復期間の条件</dt>
            <dd>{c.recoveryConditionJa}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
