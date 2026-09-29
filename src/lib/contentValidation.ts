import { CHARACTERS } from '../data/characters';
import { GAME_CASES } from '../data/cases';
import { DOSE_REFERENCES } from '../data/doseReferences';
import { imageAssetByStateId } from '../data/imageAssets';
import { PRICE_EXAMPLES } from '../data/priceExamples';
import { PROCEDURES, procedureById } from '../data/procedures';
import { RECOVERY_CARDS } from '../data/recoveryCards';
import { SOURCES } from '../data/sources';
import { REGIONS } from '../data/regions';
import type { Claim, ChoiceOutcome } from '../types';

/** 仕様13.3のコンテンツ検証。問題があれば日本語メッセージの配列を返す（空なら合格）。 */
export const validateContent = (): string[] => {
  const issues: string[] = [];
  const sourceIds = new Set(SOURCES.map((s) => s.id));
  const recoveryIds = new Set(RECOVERY_CARDS.map((r) => r.id));
  const doseIds = new Set(DOSE_REFERENCES.map((d) => d.id));
  const priceIds = new Set(PRICE_EXAMPLES.map((p) => p.id));
  const regionIds = new Set(REGIONS.map((r) => r.id));

  // 8. 全キャラクター成人（22〜62歳）
  for (const c of CHARACTERS) {
    if (c.age < 22 || c.age > 62) issues.push(`キャラクター ${c.id}: 年齢が22〜62歳の範囲外`);
  }

  // 1,3. 用量：単位・範囲・確認状況
  for (const d of DOSE_REFERENCES) {
    if (d.valueMin != null && d.valueMax != null && d.valueMin > d.valueMax) issues.push(`${d.id}: min>max`);
    if (d.meaning === 'trial_observation' && d.unit !== 'mL') issues.push(`${d.id}: 試験観察値の単位が想定外`);
    if (d.verification !== 'verified_document' && d.usableAsQuizAnswer)
      issues.push(`${d.id}: 未確認・原本照合待ちの用量が公開クイズの正解根拠になっている`);
    if (d.meaning === 'sales_volume' && d.usableAsQuizAnswer) issues.push(`${d.id}: 販売容量が正解根拠になっている`);
    for (const s of d.sourceIds) if (!sourceIds.has(s)) issues.push(`${d.id}: 出典 ${s} が未登録`);
    if (d.sourceIds.length === 0) issues.push(`${d.id}: 出典なしの用量`);
  }

  // 4. 価格：通貨・単位・税の欠落
  for (const p of PRICE_EXAMPLES) {
    if (!p.currency || !p.billingUnitJa || !p.taxStatus) issues.push(`${p.id}: 通貨・販売単位・税の情報が欠落`);
    if (p.country === 'KR' && p.currency !== 'KRW') issues.push(`${p.id}: 韓国価格の通貨が不一致`);
    if (p.country === 'JP' && p.currency !== 'JPY') issues.push(`${p.id}: 日本価格の通貨が不一致`);
    for (const pid of p.procedureIds) if (!procedureById.has(pid)) issues.push(`${p.id}: 施術 ${pid} が未登録`);
    for (const s of p.sourceIds) if (!sourceIds.has(s)) issues.push(`${p.id}: 出典 ${s} が未登録`);
  }

  // 2. 出典なしの承認情報・確認済み扱いの禁止
  const checkClaim = (pid: string, c: Claim) => {
    if ((c.status === 'verified_document' || c.status === 'clinical_reference') && c.sourceIds.length === 0)
      issues.push(`${pid}/${c.id}: 出典なしなのに確認済み扱い`);
    for (const s of c.sourceIds) if (!sourceIds.has(s)) issues.push(`${pid}/${c.id}: 出典 ${s} が未登録`);
  };
  for (const p of PROCEDURES) {
    [p.mechanism, p.reversibility, ...p.expectedChanges, ...p.limitations, ...p.temporaryReactions, ...p.importantComplications].forEach((c) => checkClaim(p.id, c));
    for (const r of p.recoveryCardIds) if (!recoveryIds.has(r)) issues.push(`${p.id}: 回復カード ${r} が未登録`);
    for (const d of p.doseReferenceIds) if (!doseIds.has(d)) issues.push(`${p.id}: 用量 ${d} が未登録`);
    for (const x of p.priceExampleIds) if (!priceIds.has(x)) issues.push(`${p.id}: 価格 ${x} が未登録`);
    if (p.independentlyReviewedByClinician !== false && !p.independentlyReviewedByClinician.name)
      issues.push(`${p.id}: 監修済み表示の根拠が不足`);
  }
  for (const r of RECOVERY_CARDS) for (const s of r.sourceIds) if (!sourceIds.has(s)) issues.push(`${r.id}: 出典 ${s} が未登録（一般資料の追加待ち）`);

  // ケース
  const checkOutcome = (caseId: string, o: ChoiceOutcome) => {
    if (!imageAssetByStateId.has(o.targetStateId)) issues.push(`${caseId}/${o.choiceId}: 画像状態 ${o.targetStateId} が未登録`);
    if (!o.feedbackJa) issues.push(`${caseId}/${o.choiceId}: 解説がない`);
    if (o.procedureId && !procedureById.has(o.procedureId)) issues.push(`${caseId}/${o.choiceId}: 施術 ${o.procedureId} が未登録`);
    // 未確認施術を唯一の治療正解にしない
    if (o.isRecommended && o.procedureId) {
      const status = procedureById.get(o.procedureId)?.contentStatus;
      if (status !== 'ready_for_knowledge_quiz') issues.push(`${caseId}/${o.choiceId}: 確認待ちの施術が正解になっている`);
    }
    for (const s of o.rationaleSourceIds) if (!sourceIds.has(s)) issues.push(`${caseId}/${o.choiceId}: 出典 ${s} が未登録`);
  };
  for (const c of GAME_CASES) {
    if (!imageAssetByStateId.has(c.initialStateId)) issues.push(`${c.id}: 初期画像 ${c.initialStateId} が未登録`);
    if (c.mode === 'design') {
      const all = [...c.outcomes, ...(c.outcomesAfterInfo ?? [])];
      if (c.outcomes.length < 3) issues.push(`${c.id}: 選択肢が少ない`);
      all.forEach((o) => checkOutcome(c.id, o));
      const terminalRecommended = (c.outcomesAfterInfo ?? c.outcomes).some((o) => o.isRecommended && o.classification !== 'needs_information');
      if (!terminalRecommended) issues.push(`${c.id}: クリアできる選択肢がない`);
    } else {
      const steps = [...(c.reverseHistory ?? [])].sort((a, b) => a.order - b.order);
      if (steps.length === 0) issues.push(`${c.id}: 履歴がない`);
      // 5. 正解が保存済みの正しい直前状態へ戻る
      steps.forEach((s, i) => {
        if (i > 0 && s.beforeStateId !== steps[i - 1].afterStateId) issues.push(`${c.id}: 履歴の画像状態が連鎖していない（order ${s.order}）`);
        if (!procedureById.has(s.procedureId)) issues.push(`${c.id}: 施術 ${s.procedureId} が未登録`);
        if (!regionIds.has(s.regionId)) issues.push(`${c.id}: 部位 ${s.regionId} が未登録`);
        if (!c.allowedProcedureIds.includes(s.procedureId)) issues.push(`${c.id}: 正解の施術が選択肢に含まれない`);
        for (const st of [s.beforeStateId, s.afterStateId]) if (!imageAssetByStateId.has(st)) issues.push(`${c.id}: 画像状態 ${st} が未登録`);
      });
      const last = steps[steps.length - 1];
      if (last && last.afterStateId !== c.initialStateId) issues.push(`${c.id}: 初期画像が最後の変更後の状態と一致しない`);
      c.allowedProcedureIds.forEach((pid) => { if (!procedureById.has(pid)) issues.push(`${c.id}: 選択肢の施術 ${pid} が未登録`); });
    }
  }

  return issues;
};
