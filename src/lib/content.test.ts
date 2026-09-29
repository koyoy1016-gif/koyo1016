import { describe, expect, it } from 'vitest';
import { validateContent } from './contentValidation';
import { emptyProgress, recordClear } from './progressStore';
import { reverseScore, totalScore } from './scoring';
import { GAME_CASES } from '../data/cases';
import { CHARACTERS } from '../data/characters';

describe('content validation (spec 13.3)', () => {
  it('has no integrity issues', () => {
    expect(validateContent()).toEqual([]);
  });

  it('all characters are adults aged 22-62', () => {
    for (const c of CHARACTERS) expect(c.age >= 22 && c.age <= 62).toBe(true);
  });

  it('covers every minimal-version character with at least one case', () => {
    const used = new Set(GAME_CASES.map((c) => c.characterId));
    for (const c of CHARACTERS) expect(used.has(c.id)).toBe(true);
  });

  it('has at least 5 cases per mode', () => {
    expect(GAME_CASES.filter((c) => c.mode === 'reverse').length).toBeGreaterThanOrEqual(5);
    expect(GAME_CASES.filter((c) => c.mode === 'design').length).toBeGreaterThanOrEqual(5);
  });

  it('includes the four required branches: mismatch, cheek hollowing, lip exceed, defer', () => {
    const all = GAME_CASES.flatMap((c) => c.outcomes);
    expect(all.some((o) => o.classification === 'wrong_target')).toBe(true);
    expect(all.some((o) => o.choiceId === 'b04_fat' && o.classification === 'exceeds_goal')).toBe(true);
    expect(all.some((o) => o.choiceId === 'b02_lip_large' && o.classification === 'exceeds_goal')).toBe(true);
    expect(all.some((o) => o.classification === 'defer' && o.isRecommended)).toBe(true);
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
