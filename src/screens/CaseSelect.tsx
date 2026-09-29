import { useState } from 'react';
import type { GameMode, ProgressV1 } from '../types';
import { GAME_CASES } from '../data/cases';
import { characterById } from '../data/characters';

type Props = {
  initialMode: GameMode | 'all';
  progress: ProgressV1;
  onPlay: (caseId: string) => void;
  onBack: () => void;
};

const MODE_LABEL: Record<GameMode, string> = { reverse: 'モードA リバース・フェイス', design: 'モードB デザイン・チャレンジ' };

export function CaseSelect({ initialMode, progress, onPlay, onBack }: Props) {
  const [mode, setMode] = useState<GameMode | 'all'>(initialMode);
  const list = GAME_CASES.filter((c) => mode === 'all' || c.mode === mode).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));

  return (
    <div className="page">
      <button type="button" className="btn btn--text" onClick={onBack}>
        ← ホームへ
      </button>
      <h1>ケース選択</h1>
      <div className="segmented" role="tablist" aria-label="モード">
        {(['all', 'reverse', 'design'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`segmented__item ${mode === m ? 'is-selected' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'all' ? 'すべて' : m === 'reverse' ? 'モードA' : 'モードB'}
          </button>
        ))}
      </div>

      <ul className="case-list">
        {list.map((c) => {
          const ch = c.characterId ? characterById.get(c.characterId) ?? null : null;
          const cleared = progress.completedCaseIds.includes(c.id);
          return (
            <li key={c.id}>
              <button type="button" className="case-card" onClick={() => onPlay(c.id)}>
                <span className="case-card__top">
                  <span className="badge badge--lv">Lv.{c.level}</span>
                  <span className="badge">{MODE_LABEL[c.mode]}</span>
                  {cleared && <span className="badge badge--result-good">✔ クリア済み（{progress.bestScoreByCaseId[c.id]}点）</span>}
                  {progress.soloClearedByCaseId[c.id] && <span className="badge badge--solo">★ 独力クリア</span>}
                </span>
                <strong>
                  {c.id}　{c.titleJa}
                </strong>
                <span>
                  {ch ? `${ch.nameJa}（${ch.gender === 'male' ? '男性' : '女性'}${ch.age}歳・架空）` : '資料読解（顔画像なし）'}
                </span>
                <span className="muted">{ch ? `学ぶテーマ：${ch.themeJa}` : '学ぶテーマ：添付文書・試験資料の読み取り'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="muted">レベルは「より強い処置」ではなく、判断する要素の多さを表します。</p>
    </div>
  );
}
