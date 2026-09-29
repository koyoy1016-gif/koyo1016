import { useMemo, useState } from 'react';
import { PROCEDURES } from '../data/procedures';
import { REGIONS } from '../data/regions';
import { RECOVERY_CARDS } from '../data/recoveryCards';
import { ProcedureDetail } from '../components/ProcedureDetail';
import { SourceChips } from '../components/Badges';
import { PRICE_EXAMPLES } from '../data/priceExamples';
import { DOSE_REFERENCES } from '../data/doseReferences';

const TISSUE_JA = { muscle: '筋肉', fat: '脂肪', bone: '骨格', skin: '皮膚', soft_tissue: '軟部組織' } as const;
const STATUS_JA = { ready_for_knowledge_quiz: '知識問題に使用可', reference_only: '参考表示のみ（確認待ちあり）', draft: '下書き' } as const;

export function Encyclopedia({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'procedures' | 'recovery'>('procedures');
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [tissue, setTissue] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');

  const categories = useMemo(() => [...new Set(PROCEDURES.map((p) => p.category))], []);

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
        現在 {PROCEDURES.length} 件の施術・分類を収録（主要50項目のうち一部。追加できるデータ構造です）。確認待ちの項目は、その旨を表示し、完成した医学データには見せません。
        本資料は診断・施術計画の教材ではありません。
      </p>
      <div className="segmented" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'procedures'} className={`segmented__item ${tab === 'procedures' ? 'is-selected' : ''}`} onClick={() => setTab('procedures')}>
          施術カード
        </button>
        <button type="button" role="tab" aria-selected={tab === 'recovery'} className={`segmented__item ${tab === 'recovery' ? 'is-selected' : ''}`} onClick={() => setTab('recovery')}>
          回復・経過カード
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
          <ul className="dex-list">
            {list.map((p) => (
              <li key={p.id}>
                <details className="dex-item">
                  <summary>
                    <span className="badge">{p.id}</span> <strong>{p.nameJa}</strong>
                    <span className="muted"> ／ {p.category} ／ {p.targetTissues.map((t) => TISSUE_JA[t]).join('・')}</span>
                    {p.contentStatus !== 'ready_for_knowledge_quiz' && <span className="badge badge--ev-pending">確認待ちあり</span>}
                  </summary>
                  <ProcedureDetail p={p} />
                </details>
              </li>
            ))}
          </ul>
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
    </div>
  );
}
