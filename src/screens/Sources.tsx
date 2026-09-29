import { SOURCES } from '../data/sources';

const KIND_JA = {
  label: '添付文書',
  regulator: '規制当局資料',
  guideline: '診療指針',
  study: '研究',
  hospital_education: '医療機関・学会の患者向け資料',
  clinic_price: '医療機関の価格掲載',
  press_release: '企業発表',
  reproduced_label: '製品説明の掲載資料',
} as const;

export function Sources({ onBack }: { onBack: () => void }) {
  return (
    <div className="page">
      <button type="button" className="btn btn--text" onClick={onBack}>
        ← ホームへ
      </button>
      <h1>出典</h1>
      <p className="muted">
        参照日はすべて2026-09-30（JST）。資料の日付と参照日は異なります。リンクは参照先への案内であり、顔写真の利用許可を意味しません。資料の本文・図表・実患者画像はゲームに転載していません。
        価格は選定した医療機関の掲載例で、市場平均や推奨ではありません。
      </p>
      <ul className="source-list">
        {SOURCES.map((s) => (
          <li key={s.id} className="card">
            <div className="card__head">
              <strong>
                {s.id}　{s.title}
              </strong>
              <span className="badge">{KIND_JA[s.kind]}</span>
            </div>
            <p>発行元：{s.publisher}（{s.jurisdiction}）</p>
            <p>
              資料の日付：{s.publishedOrRevisedAt ?? '記載なし／未確認'}　参照日：{s.accessedAt}
            </p>
            <p className="muted">{s.noteJa}</p>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
