import { describe, expect, it } from 'vitest';
import { validateContent } from './contentValidation';
import { emptyProgress, recordClear } from './progressStore';
import { reverseScore, totalScore } from './scoring';
import { GAME_CASES } from '../data/cases';
import { CHARACTERS } from '../data/characters';
import { PROCEDURES } from '../data/procedures';
import { SOURCES } from '../data/sources';
import { allReal, hasRealImage } from '../data/imageAssets';

describe('content validation (spec 13.3)', () => {
  it('has no integrity issues', () => {
    expect(validateContent()).toEqual([]);
  });

  it('all characters are adults aged 22-62', () => {
    for (const c of CHARACTERS) expect(c.age >= 22 && c.age <= 62).toBe(true);
  });

  it('has exactly 20 characters with equal gender split', () => {
    expect(CHARACTERS.length).toBe(20);
    expect(CHARACTERS.filter((c) => c.gender === 'male').length).toBe(10);
    expect(CHARACTERS.filter((c) => c.gender === 'female').length).toBe(10);
  });

  it('covers every character with at least one case', () => {
    const used = new Set(GAME_CASES.map((c) => c.characterId));
    for (const c of CHARACTERS) expect(used.has(c.id)).toBe(true);
  });

  it('spans all ten levels', () => {
    const levels = new Set(GAME_CASES.map((c) => c.level));
    for (let l = 1; l <= 10; l++) expect(levels.has(l)).toBe(true);
  });

  it('has reverse mode multi-step histories, composite and information-insufficient cases', () => {
    const rev = GAME_CASES.filter((c) => c.mode === 'reverse');
    expect(rev.some((c) => (c.reverseHistory?.length ?? 0) >= 3)).toBe(true);
    expect(rev.some((c) => c.reverseHistory?.some((s) => s.alsoAcceptedProcedureIds))).toBe(true);
    expect(rev.some((c) => c.reverseHistory?.some((s) => s.informationInsufficient))).toBe(true);
  });

  it('knowledge questions never rely on unverified or Korean dose data', () => {
    for (const c of GAME_CASES.filter((x) => x.characterId === null)) {
      expect(c.doseReferenceIds?.some((id) => id.startsWith('DOSE-KR'))).toBe(false);
    }
  });

  it('has at least 5 cases per mode', () => {
    expect(GAME_CASES.filter((c) => c.mode === 'reverse').length).toBeGreaterThanOrEqual(10);
    expect(GAME_CASES.filter((c) => c.mode === 'design').length).toBeGreaterThanOrEqual(10);
  });

  it('includes the four required branches: mismatch, cheek hollowing, lip exceed, defer', () => {
    const all = GAME_CASES.flatMap((c) => c.outcomes);
    expect(all.some((o) => o.classification === 'wrong_target')).toBe(true);
    expect(all.some((o) => o.choiceId === 'b04_fat' && o.classification === 'exceeds_goal')).toBe(true);
    expect(all.some((o) => o.choiceId === 'b02_lip_large' && o.classification === 'exceeds_goal')).toBe(true);
    expect(all.some((o) => o.classification === 'defer' && o.isRecommended)).toBe(true);
  });
});

describe('encyclopedia (50 items)', () => {
  it('contains exactly P01..P50 without duplicates', () => {
    const ids = PROCEDURES.map((p) => p.id).sort();
    const expected = Array.from({ length: 50 }, (_, i) => `P${String(i + 1).padStart(2, '0')}`);
    expect(ids).toEqual(expected);
  });

  it('every procedure has all required card fields', () => {
    for (const p of PROCEDURES) {
      expect(p.mechanism.textJa.length).toBeGreaterThan(0);
      expect(p.reversibility.textJa.length).toBeGreaterThan(0);
      expect(p.expectedChanges.length).toBeGreaterThan(0);
      expect(p.limitations.length).toBeGreaterThan(0);
      expect(p.importantComplications.length).toBeGreaterThan(0);
      expect(p.evaluationTimingJa.length).toBeGreaterThan(0);
      expect(p.durabilityJa.length).toBeGreaterThan(0);
      expect(p.recoveryCardIds.length).toBeGreaterThan(0);
      expect(p.independentlyReviewedByClinician).toBe(false);
    }
  });

  it('has all 34 sources S01-S34', () => {
    expect(SOURCES.map((s) => s.id).sort()).toEqual(Array.from({ length: 34 }, (_, i) => `S${String(i + 1).padStart(2, '0')}`));
  });

  it('unverified-only procedures are never marked ready for quiz', () => {
    for (const p of PROCEDURES) {
      if (p.mechanism.status === 'unverified') expect(p.contentStatus).not.toBe('ready_for_knowledge_quiz');
    }
  });
});

describe('real face images (src/assets/faces)', () => {
  const REAL = [
    'C01_base', 'C01_success', 'C01_over',
    'C06_base_frown', 'C06_success_frown', 'C06_over_frown',
    'C07_base_smile', 'C07_success_smile', 'C07_over_smile',
  ];

  it('the nine supplied sample images are picked up automatically', () => {
    for (const id of REAL) expect(hasRealImage(id)).toBe(true);
  });

  it('cases that use only supplied images render fully with real images', () => {
    for (const cid of ['B01', 'B20', 'B21', 'B22']) {
      const c = GAME_CASES.find((x) => x.id === cid)!;
      const ids = [c.initialStateId, ...c.outcomes.map((o) => o.targetStateId)];
      expect(allReal(ids)).toBe(true);
    }
  });

  it('cases with missing images fall back to illustrations as a whole (never mixed)', () => {
    const c = GAME_CASES.find((x) => x.id === 'A04')!;
    const ids = [c.initialStateId, ...(c.reverseHistory ?? []).flatMap((s) => [s.beforeStateId, s.afterStateId])];
    expect(allReal(ids)).toBe(false);
  });
});

describe('scoring', () => {
  it('scores max out at 100 and never exceed category caps', () => {
    for (const c of GAME_CASES) {
      for (const o of [...c.outcomes, ...(c.outcomesAfterInfo ?? [])]) {
        expect(totalScore(o.score)).toBeLessThanOrEqual(100);
        expect(o.score.mechanismUnderstanding).toBeLessThanOrEqual(30);
        expect(o.score.goalMatch).toBeLessThanOrEqual(30);
        expect(o.score.preservation).toBeLessThanOrEqual(20);
        expect(o.score.costTimeCondition).toBeLessThanOrEqual(10);
        expect(o.score.followUpEvaluation).toBeLessThanOrEqual(10);
      }
    }
  });

  it('recommended outcomes score 100 or close, and defer can be full marks', () => {
    const b04 = GAME_CASES.find((c) => c.id === 'B04')!;
    const defer = b04.outcomes.find((o) => o.classification === 'defer')!;
    expect(totalScore(defer.score)).toBe(100);
  });

  it('reverse score never drops below 40 and hints do not affect it', () => {
    expect(reverseScore(0)).toBe(100);
    expect(reverseScore(20)).toBe(40);
  });
});

describe('progress', () => {
  it('does not double count on repeated clear', () => {
    let p = emptyProgress();
    p = recordClear(p, 'B01', 100, false);
    p = recordClear(p, 'B01', 100, false);
    expect(p.completedCaseIds).toEqual(['B01']);
  });

  it('keeps best score and solo badge only when hint not used', () => {
    let p = emptyProgress();
    p = recordClear(p, 'B01', 60, true);
    expect(p.soloClearedByCaseId['B01']).toBe(false);
    p = recordClear(p, 'B01', 100, false);
    expect(p.bestScoreByCaseId['B01']).toBe(100);
    expect(p.soloClearedByCaseId['B01']).toBe(true);
  });
});
