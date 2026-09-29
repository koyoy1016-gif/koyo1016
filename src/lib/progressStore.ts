import type { ProgressV1 } from '../types';

const KEY = 'facelab.progress';

export const emptyProgress = (): ProgressV1 => ({
  version: 1,
  completedCaseIds: [],
  bestScoreByCaseId: {},
  hintUsedByCaseId: {},
  soloClearedByCaseId: {},
  seenIntroDisclaimer: false,
  updatedAt: new Date().toISOString(),
});

export const loadProgress = (): ProgressV1 => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as { version?: number };
    if (parsed.version === 1) return { ...emptyProgress(), ...(parsed as ProgressV1) };
    return emptyProgress();
  } catch {
    return emptyProgress();
  }
};

export const saveProgress = (p: ProgressV1): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
  } catch {
    /* 保存できない環境でもゲームは継続する */
  }
};

/**
 * クリアを記録する。同じケースの二重クリック・再表示で二重計上されないよう、
 * 得点は最高点のみ保持し、完了リストは重複させない。
 */
export const recordClear = (
  p: ProgressV1,
  caseId: string,
  score: number,
  hintUsed: boolean,
): ProgressV1 => {
  const completed = p.completedCaseIds.includes(caseId) ? p.completedCaseIds : [...p.completedCaseIds, caseId];
  const prevBest = p.bestScoreByCaseId[caseId] ?? 0;
  return {
    ...p,
    completedCaseIds: completed,
    bestScoreByCaseId: { ...p.bestScoreByCaseId, [caseId]: Math.max(prevBest, score) },
    hintUsedByCaseId: { ...p.hintUsedByCaseId, [caseId]: (p.hintUsedByCaseId[caseId] ?? false) || hintUsed },
    soloClearedByCaseId: {
      ...p.soloClearedByCaseId,
      [caseId]: (p.soloClearedByCaseId[caseId] ?? false) || !hintUsed,
    },
  };
};
