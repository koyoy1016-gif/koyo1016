import type { ChoiceClassification, EvidenceStatus } from '../types';
import { sourceById } from '../data/sources';

export const EVIDENCE_LABEL: Record<EvidenceStatus, { label: string; icon: string; cls: string }> = {
  verified_document: { label: '一次資料で確認', icon: '✔', cls: 'ok' },
  clinical_reference: { label: '一般の参照資料', icon: '◎', cls: 'ref' },
  reference_found_primary_verification_pending: { label: '資料あり・原本照合待ち', icon: '…', cls: 'pending' },
  unverified: { label: '未確認（確認待ち）', icon: '？', cls: 'unverified' },
  fictional_game_rule: { label: 'ゲーム用の架空ルール', icon: '◇', cls: 'fiction' },
};

export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const e = EVIDENCE_LABEL[status];
  return (
    <span className={`badge badge--ev-${e.cls}`}>
      <span aria-hidden="true">{e.icon}</span> {e.label}
    </span>
  );
}

export function SourceChips({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <span className="chip chip--none">出典なし</span>;
  return (
    <span className="chips">
      {ids.map((id) => {
        const s = sourceById.get(id);
        return (
          <span key={id} className="chip" title={s ? `${s.publisher}：${s.title}` : id}>
            {id}
          </span>
        );
      })}
    </span>
  );
}

export const CLASSIFICATION_LABEL: Record<ChoiceClassification, { label: string; icon: string; cls: string }> = {
  fits_goal: { label: '希望に合う選択', icon: '✔', cls: 'good' },
  partial: { label: '一部は合うが、条件が足りない', icon: '△', cls: 'warn' },
  wrong_target: { label: '作用する対象が合わない', icon: '✖', cls: 'bad' },
  exceeds_goal: { label: '希望を超える変化（架空の分岐）', icon: '▲', cls: 'bad' },
  defer: { label: '適切な見送り・評価優先', icon: '✔', cls: 'good' },
  needs_information: { label: '情報を追加する判断', icon: 'ℹ', cls: 'info' },
};

export function ClassificationBadge({ c }: { c: ChoiceClassification }) {
  const x = CLASSIFICATION_LABEL[c];
  return (
    <span className={`badge badge--result-${x.cls}`}>
      <span aria-hidden="true">{x.icon}</span> {x.label}
    </span>
  );
}
