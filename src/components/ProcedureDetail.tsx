import type { Claim, DoseReference, PriceExample, Procedure } from '../types';
import { DOSE_REFERENCES } from '../data/doseReferences';
import { PRICE_EXAMPLES } from '../data/priceExamples';
import { recoveryCardById } from '../data/recoveryCards';
import { EvidenceBadge, SourceChips } from './Badges';

const doseById = new Map(DOSE_REFERENCES.map((d) => [d.id, d]));
const priceById = new Map(PRICE_EXAMPLES.map((p) => [p.id, p]));

const SCOPE_LABEL: Record<DoseReference['quantityScope'], string> = {
  bilateral_total: '左右合計',
  total_treatment: '1回の治療の総量',
  initial_plus_touchup_all_sites: '初回＋タッチアップ・全注入部位の合計',
  sales_package: '販売単位',
};
const MEANING_LABEL: Record<DoseReference['meaning'], string> = {
  label_dose: '添付文書の記載量',
  trial_observation: '臨床試験での観察値',
  sales_volume: 'クリニックの販売単位',
};

function ClaimList({ title, claims }: { title: string; claims: Claim[] }) {
  if (claims.length === 0) return null;
  return (
    <section className="detail__block">
      <h4>{title}</h4>
      <ul className="claims">
        {claims.map((c) => (
          <li key={c.id}>
            <p>{c.textJa}</p>
            {c.limitationsJa && <p className="muted">限界：{c.limitationsJa}</p>}
            <div className="claims__meta">
              <EvidenceBadge status={c.status} /> <SourceChips ids={c.sourceIds} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DoseCard({ d }: { d: DoseReference }) {
  const range =
    d.valueMedian != null
      ? `中央値 ${d.valueMedian} ${d.unit}`
      : d.valueMin === d.valueMax
        ? `${d.valueMin} ${d.unit}`
        : `${d.valueMin}〜${d.valueMax} ${d.unit}`;
  return (
    <div className={`card card--dose ${d.usableAsQuizAnswer ? '' : 'card--pending'}`}>
      <div className="card__head">
        <strong>{d.product}</strong>
        <span className="badge">{MEANING_LABEL[d.meaning]}</span>
      </div>
      <p>
        {d.jurisdiction}／{d.indication}／{d.populationJa}
      </p>
      <p className="dose__value">
        {range}（{SCOPE_LABEL[d.quantityScope]}）
      </p>
      <p className="muted">{d.warningJa}</p>
      <div className="claims__meta">
        <EvidenceBadge status={d.verification} /> <SourceChips ids={d.sourceIds} />
        {!d.usableAsQuizAnswer && <span className="badge badge--dev">公開クイズの正解根拠には使用しない</span>}
      </div>
    </div>
  );
}

function PriceCard({ p }: { p: PriceExample }) {
  const cur = p.currency === 'JPY' ? '円' : 'ウォン';
  const tax = { included: '税込', excluded: '税別', unknown: '税の扱い不明' }[p.taxStatus];
  return (
    <div className="card card--price">
      <div className="card__head">
        <strong>{p.productOrMenu}</strong>
        <span className="badge">{p.country === 'JP' ? '日本' : '韓国'}・{p.clinicName}</span>
      </div>
      <p className="price__value">
        {p.amount != null ? `${p.amount.toLocaleString('ja-JP')} ${cur}` : '金額：確認済み掲載例なし'}
        <span className="muted">（{p.currency}・{tax}）</span>
      </p>
      <p>{p.billingUnitJa}</p>
      {p.excludedOrUnknownJa.length > 0 && <p className="muted">含まれない／不明：{p.excludedOrUnknownJa.join('、')}</p>}
      <p className="muted">確認日 {p.checkedAt}。医療機関の掲載例であり、市場平均・推奨ではありません。為替換算は行っていません。</p>
      <SourceChips ids={p.sourceIds} />
    </div>
  );
}

export function ProcedureDetail({ p }: { p: Procedure }) {
  const recovery = p.recoveryCardIds.map((id) => recoveryCardById.get(id)).filter(Boolean);
  const doses = p.doseReferenceIds.map((id) => doseById.get(id)).filter((x): x is DoseReference => !!x);
  const prices = p.priceExampleIds.map((id) => priceById.get(id)).filter((x): x is PriceExample => !!x);

  return (
    <div className="detail">
      <p className="muted">
        一般名：{p.genericNameJa}／製品名の例：{p.brandExampleJa}
      </p>
      <section className="detail__block">
        <h4>対象となる組織・作用</h4>
        <p>{p.mechanism.textJa}</p>
        <div className="claims__meta">
          <EvidenceBadge status={p.mechanism.status} /> <SourceChips ids={p.mechanism.sourceIds} />
        </div>
        {p.mechanism.limitationsJa && <p className="muted">限界：{p.mechanism.limitationsJa}</p>}
      </section>
      <ClaimList title="期待される方向の変化" claims={p.expectedChanges} />
      <ClaimList title="できないこと・限界" claims={p.limitations} />
      <ClaimList title="よく見られる一時的反応" claims={p.temporaryReactions} />
      <ClaimList title="重要な合併症" claims={p.importantComplications} />
      <ClaimList title="戻しやすさの限界" claims={[p.reversibility]} />

      <section className="detail__block">
        <h4>評価時期・持続性</h4>
        <p>効果の評価時期：{p.evaluationTimingJa}</p>
        <p>持続性：{p.durabilityJa}</p>
      </section>

      {recovery.length > 0 && (
        <section className="detail__block">
          <h4>回復・経過（参照カード）</h4>
          {recovery.map((r) => (
            <div key={r!.id} className="card">
              <strong>
                {r!.id}：{r!.targetJa}
              </strong>
              <p>日常生活へ戻れる時期：{r!.backToDailyLifeJa}</p>
              <p>赤み・腫れ等が目立つ時期：{r!.visibleSwellingRednessJa}</p>
              <p>落ち着いた形を評価する時期：{r!.settledEvaluationJa}</p>
              <p className="muted">{r!.limitationsJa}</p>
              <SourceChips ids={r!.sourceIds} />
            </div>
          ))}
          <p className="muted">術式・部位・個人により変わる一般的な目安です。</p>
        </section>
      )}

      {doses.length > 0 && (
        <section className="detail__block">
          <h4>実際の量・適応の資料カード</h4>
          <p className="muted">
            添付文書の量、試験で使われた量、販売単位は別欄で示します。個人の適量の推奨ではなく、他製剤への換算にも使えません。
          </p>
          {doses.map((d) => (
            <DoseCard key={d.id} d={d} />
          ))}
        </section>
      )}

      <section className="detail__block">
        <h4>費用の掲載例</h4>
        {prices.length === 0 ? (
          <p className="muted">確認済み掲載例なし（未取得の価格は相場の想像で補いません）。</p>
        ) : (
          prices.map((x) => <PriceCard key={x.id} p={x} />)
        )}
        <p className="muted">検診・麻酔・薬・再診・渡航等の費用が含まれない場合、合計は不明です。</p>
      </section>

      <p className="muted">
        臨床専門家による監修：{p.independentlyReviewedByClinician === false ? '未実施' : `${p.independentlyReviewedByClinician.name}（${p.independentlyReviewedByClinician.reviewedAt}）`}
        ／内容の状態：{{ ready_for_knowledge_quiz: '知識問題に使用可', reference_only: '参考表示のみ', draft: '下書き' }[p.contentStatus]}
      </p>
    </div>
  );
}
