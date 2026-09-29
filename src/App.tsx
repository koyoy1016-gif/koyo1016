import { useCallback, useEffect, useState } from 'react';
import type { GameMode, ProgressV1 } from './types';
import { GAME_CASES, caseById } from './data/cases';
import { loadProgress, recordClear, saveProgress } from './lib/progressStore';
import { validateContent } from './lib/contentValidation';
import { Home } from './screens/Home';
import { CaseSelect } from './screens/CaseSelect';
import { PlayReverse } from './screens/PlayReverse';
import { PlayDesign } from './screens/PlayDesign';
import { Encyclopedia } from './screens/Encyclopedia';
import { Sources } from './screens/Sources';

type Screen =
  | { name: 'home' }
  | { name: 'select'; mode: GameMode | 'all' }
  | { name: 'play'; caseId: string; from: GameMode | 'all' }
  | { name: 'dex' }
  | { name: 'sources' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [progress, setProgress] = useState<ProgressV1>(() => loadProgress());
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const issues = validateContent();
      if (issues.length > 0) console.warn('[FACE LAB] コンテンツ検証の指摘:', issues);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const goHome = useCallback(() => setScreen({ name: 'home' }), []);

  const nextCaseIdFor = (caseId: string): string | null => {
    const cur = caseById.get(caseId);
    if (!cur) return null;
    const same = GAME_CASES.filter((c) => c.mode === cur.mode).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
    const idx = same.findIndex((c) => c.id === caseId);
    return same[idx + 1]?.id ?? null;
  };

  const renderScreen = () => {
    switch (screen.name) {
      case 'home':
        return (
          <Home
            progress={progress}
            onStart={(mode) => setScreen({ name: 'select', mode })}
            onContinue={(caseId) => setScreen({ name: 'play', caseId, from: 'all' })}
            onDex={() => setScreen({ name: 'dex' })}
            onSources={() => setScreen({ name: 'sources' })}
            onDismissIntro={() => setProgress((p) => ({ ...p, seenIntroDisclaimer: true }))}
          />
        );
      case 'select':
        return (
          <CaseSelect
            initialMode={screen.mode}
            progress={progress}
            onPlay={(caseId) => setScreen({ name: 'play', caseId, from: screen.mode })}
            onBack={goHome}
          />
        );
      case 'play': {
        const c = caseById.get(screen.caseId);
        if (!c) return null;
        const common = {
          gameCase: c,
          nextCaseId: nextCaseIdFor(c.id),
          onCleared: (score: number, hintUsed: boolean) => setProgress((p) => recordClear(p, c.id, score, hintUsed)),
          onExit: () => setScreen({ name: 'select', mode: screen.from }),
          onNext: (caseId: string) => setScreen({ name: 'play', caseId, from: screen.from }),
        };
        // key=ケースID：ケースごとに状態をリセットし、前の履歴・選択が残らないようにする
        return c.mode === 'reverse' ? <PlayReverse key={c.id} {...common} /> : <PlayDesign key={c.id} {...common} />;
      }
      case 'dex':
        return <Encyclopedia onBack={goHome} />;
      case 'sources':
        return <Sources onBack={goHome} />;
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="topbar__logo" onClick={goHome} aria-label="ホームへ">
          FACE LAB
        </button>
        <nav className="topbar__nav" aria-label="メニュー">
          <button type="button" className="btn btn--text" onClick={() => setScreen({ name: 'dex' })}>
            図鑑
          </button>
          <button type="button" className="btn btn--text" onClick={() => setScreen({ name: 'sources' })}>
            出典
          </button>
          <button type="button" className="btn btn--text" onClick={() => setInfoOpen((v) => !v)} aria-expanded={infoOpen}>
            ⓘ 情報
          </button>
        </nav>
      </header>

      {infoOpen && (
        <aside className="info" role="note">
          <h2>ご利用にあたって</h2>
          <ul className="plain">
            <li>登場人物・診察メモ・希望・変化はすべて架空です。実在人物・実患者の写真は使っていません。</li>
            <li>画像は「AI生成・架空の変化例」で、実際の施術結果の証明ではありません。変化の大小は教育用の分岐ルールで、実際の量・発生率・予後とは結びつきません。</li>
            <li>本ゲームは診断・施術計画・実技の教材ではありません。現実の治療判断には医師による診察が必要です。</li>
            <li>写真のアップロードや、顔写真から個人の適量・施術履歴を判定する機能はありません。</li>
            <li>医学情報には出典と確認状況を付けています。臨床専門家による監修は未実施です。</li>
          </ul>
          <button type="button" className="btn btn--ghost" onClick={() => setInfoOpen(false)}>
            閉じる
          </button>
        </aside>
      )}

      <main className="main">{renderScreen()}</main>
      <footer className="footer">
        架空の成人を使った学習ゲーム。現実の顔や施術結果を判定するものではありません。
      </footer>
    </div>
  );
}
