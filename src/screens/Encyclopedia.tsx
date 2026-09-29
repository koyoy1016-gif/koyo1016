import { useMemo, useState } from 'react';
import { PROCEDURES } from '../data/procedures';
import { REGIONS } from '../data/regions';
import { RECOVERY_CARDS } from '../data/recoveryCards';
import { ProcedureDetail } from '../components/ProcedureDetail';
import { SourceChips } from '../components/Badges';
import { PRICE_EXAMPLES } from '../data/priceExamples';
import { DOSE_REFERENCES } from '../data/doseReferences';
import { COMPARISONS, TERM_NOTES } from '../data/comparisons';
import { procedureById } from '../data/procedures';

const TISSUE_JA = { muscle: '筋肉', fat: '脂肪', bone: '骨格', skin: '皮膚', soft_tissue: '軟部組織' } as const;
const STATUS_JA = { ready_for_knowledge_quiz: '知識問題に使用可', reference_only: '参考表示のみ（確認待ちあり）', draft: '下書き' } as const;

export function Encyclopedia({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'procedures' | 'compare' | 'recovery' | 'terms'>('procedures');
  const [jump, setJump] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [tissue, setTissue] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');

  const categories = useMemo(() => [...new Set(PROCEDURES.map((p) => p.category))], []);
  const counts = useMemo(() => {
    const ready = PROCEDURES.filter((p) => p.contentStatus === 'ready_for_knowledge_quiz').length;
    const ref = PROCEDURES.filter((p) => p.contentStatus === 'reference_only').length;
    const draft = PROCEDURES.filter((p) => p.contentStatus === 'draft').length;
    return { ready, ref, draft };
  }, []);
  const unverifiedCount = (id: string) => {
    const p = procedureById.get(id);
    if (!p) return 0;
    const all = [p.mechanism, p.reversibility, ...p.expectedChanges, ...p.limitations, ...p.temporaryReactions, ...p.importantComplications];
    return all.filter((c) => c.status === 'unverified').length;
  };

  const list = PROCEDURES.filter((p) => {
    if (q && !`${p.nameJa}${p.genericNameJa}${p.aliases.join('')}${p.brandExampleJa}`.includes(q)) return false;
    if (region && !p.regions.includes(region)) return false;
    if (tissue && !p.targetTissues.includes(tissue as never)) return false;
    if (category && p.category !== category) return false;
    if (status && p.contentStatus !== status) return false;
    if (country) {
      const hasPrice = PRICE_EXAMPLES.some((x) => p.priceExampleIds.includes(x.id) && x.country === country);
      const hasDose = DOSE_REFERENCES.some((x) => p.doseReferenceIds.includes(x.id) && x.jurisdiction === country);
      if (!hasPrice && !hasDose) return false;
    }
    return true;
  });

  return (
    <div className="page">
      <button type="button" className="btn btn--text" onClick={onBack}>
        ← ホームへ
      </button>
      <h1>図鑑</h1>
      <p className="muted">
        顔に関する主要{PROCEDURES.length}項目・分類を収録（美容医療全体の完全な網羅ではありません。施術ごとの細かな術式・製品・機器は追加できるデータ構造です）。
        確認待ちの項目は、その旨を表示し、完成した医学データには見せません。本資料は診断・施術計画の教材ではありません。
      </p>
      <div className="segmented" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'procedures'} className={`segmented__item ${tab === 'procedures' ? 'is-selected' : ''}`} onClick={() => setTab('procedures')}>
          施術カード
        </button>
        <button type="button" role="tab" aria-selected={tab === 'compare'} className={`segmented__item ${tab === 'compare' ? 'is-selected' : ''}`} onClick={() => setTab('compare')}>
          見分け方
        </button>
        <button type="button" role="tab" aria-selected={tab === 'recovery'} className={`segmented__item ${tab === 'recovery' ? 'is-selected' : ''}`} onClick={() => setTab('recovery')}>
          回復・経過
        </button>
        <button type="button" role="tab" aria-selected={tab === 'terms'} className={`segmented__item ${tab === 'terms' ? 'is-selected' : ''}`} onClick={() => setTab('terms')}>
          用語メモ
        </button>
      </div>

      {tab === 'procedures' && (
        <>
          <div className="filters">
            <label>
              検索
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="施術名・別名" />
            </label>
            <label>
              部位
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">すべて</option>
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.labelJa}</option>
                ))}
              </select>
            </label>
            <label>
              対象組織
              <select value={tissue} onChange={(e) => setTissue(e.target.value)}>
                <option value="">すべて</option>
                {Object.entries(TISSUE_JA).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              施術分類
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">すべて</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              国（費用・用量資料あり）
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">すべて</option>
                <option value="JP">日本</option>
                <option value="KR">韓国</option>
                <option value="US">米国</option>
              </select>
            </label>
            <label>
              確認状況
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">すべて</option>
                {Object.entries(STATUS_JA).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <p>{list.length} 件</p>
          <p className="muted">
            全{PROCEDURES.length}件のうち、知識問題に使用可 {counts.ready}件／参考表示のみ {counts.ref}件／下書き {counts.draft}件。臨床専門家による監修は未実施です。
          </p>
          {(category ? [category] : categories).map((cat) => {
            const items = list.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} aria-label={cat}>
                <h2 className="dex-group">{cat}<span className="muted">（{items.length}件）</span></h2>
                <ul className="dex-list">
                  {items.map((p) => {
                    const pend = unverifiedCount(p.id);
                    return (
                      <li key={`${p.id}-${jump === p.id ? 'j' : ''}`} id={`dex-${p.id}`}>
                        <details className="dex-item" open={jump === p.id}>
                          <summary>
                            <span className="badge">{p.id}</span> <strong>{p.nameJa}</strong>
                            <span className="muted"> ／ {p.targetTissues.map((t) => TISSUE_JA[t]).join('・')}</span>
                            {p.contentStatus === 'ready_for_knowledge_quiz' ? (
                              <span className="badge badge--ev-ref">知識問題に使用可</span>
                            ) : (
                              <span className="badge badge--ev-pending">{p.contentStatus === 'draft' ? '下書き・確認待ち' : '参考表示のみ・確認待ちあり'}</span>
                            )}
                            {pend > 0 && <span className="badge badge--ev-unverified">未確認 {pend}項目</span>}
                          </summary>
                          <ProcedureDetail p={p} />
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      )}

      {tab === 'recovery' && (
        <ul className="dex-list">
          {RECOVERY_CARDS.map((r) => (
            <li key={r.id} className="card">
              <strong>
                {r.id}：{r.targetJa}
              </strong>
              <p>日常生活へ戻れる時期：{r.backToDailyLifeJa}</p>
              <p>赤み・腫れ等が目立つ時期：{r.visibleSwellingRednessJa}</p>
              <p>落ち着いた形を評価する時期：{r.settledEvaluationJa}</p>
              <p className="muted">{r.limitationsJa}</p>
              <SourceChips ids={r.sourceIds} />
            </li>
          ))}
        </ul>
      )}

      {tab === 'compare' && (
        <div>
          <p className="muted">似た施術・混同しやすい施術を、変える構造や資料の違いで整理したカードです。詳細は各施術カードを開いてください。</p>
          <ul className="dex-list">
            {COMPARISONS.map((c) => (
              <li key={c.id} className="card">
                <h2>{c.titleJa}</h2>
                <p>{c.leadJa}</p>
                <p className="chips">
                  {c.procedureIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="chip chip--btn"
                      onClick={() => {
                        setQ('');
                        setRegion('');
                        setTissue('');
                        setCategory('');
                        setCountry('');
                        setStatus('');
                        setJump(id);
                        setTab('procedures');
                        setTimeout(() => document.getElementById(`dex-${id}`)?.scrollIntoView({ block: 'center' }), 50);
                      }}
                    >
                      {id} {procedureById.get(id)?.nameJa}
                    </button>
                  ))}
                </p>
                <ul>
                  {c.pointsJa.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {c.pendingNoteJa && <p className="note">⚠ {c.pendingNoteJa}</p>}
                <SourceChips ids={c.sourceIds} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'terms' && (
        <div>
          <p className="muted">表記のゆれや、混同しやすい言葉のメモです。確定できない語は、自動で同義語として登録しません。</p>
          <ul className="dex-list">
            {TERM_NOTES.map((t) => (
              <li key={t.id} className="card">
                <strong>{t.termJa}</strong>
                <p>{t.noteJa}</p>
                <p className="muted">関連：{t.procedureIds.map((id) => `${id} ${procedureById.get(id)?.nameJa ?? ''}`).join('、')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
