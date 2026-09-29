import type { ProgressV1 } from '../types';
import { GAME_CASES } from '../data/cases';
import { PROCEDURES } from '../data/procedures';
import { IMAGE_ASSETS } from '../data/imageAssets';

type Props = {
  progress: ProgressV1;
  onStart: (mode: 'reverse' | 'design') => void;
  onContinue: (caseId: string) => void;
  onDex: () => void;
  onSources: () => void;
  onDismissIntro: () => void;
};

export function Home({ progress, onStart, onContinue, onDex, onSources, onDismissIntro }: Props) {
  const total = GAME_CASES.length;
  const done = progress.completedCaseIds.length;
  const next = GAME_CASES.find((c) => !progress.completedCaseIds.includes(c.id));
  const solo = Object.values(progress.soloClearedByCaseId).filter(Boolean).length;
  const pendingImages = IMAGE_ASSETS.filter((a) => a.status === 'planned').length;

  return (
    <div className="home">
      {!progress.seenIntroDisclaimer && (
        <div className="notice" role="note">
          <p>
            <strong>架空の成人を使った学習ゲームです。</strong>現実の顔や施術結果を判定するものではありません。
          </p>
          <button type="button" className="btn btn--primary" onClick={onDismissIntro}>
            わかりました
          </button>
        </div>
      )}

      <section className="hero">
        <h1>FACE LAB</h1>
        <p>架空の顔で学ぶ、美容医療の「作用・限界・費用・回復」</p>
      </section>

      <div className="mode-cards">
        <button type="button" className="mode-card" onClick={() => onStart('reverse')}>
          <span className="mode-card__tag">モードA</span>
          <strong>リバース・フェイス</strong>
          <span>架空の施術履歴を推理して、元の顔へ戻そう。部位と施術を選んで、履歴を1件ずつ解く。</span>
        </button>
        <button type="button" className="mode-card" onClick={() => onStart('design')}>
          <span className="mode-card__tag">モードB</span>
          <strong>デザイン・チャレンジ</strong>
          <span>本人の希望に合う選択を考えよう。「変更しない」「情報を追加する」も立派な答えになることがあります。</span>
        </button>
      </div>

      {next && (
        <button type="button" className="btn btn--primary btn--block" onClick={() => onContinue(next.id)}>
          続きから：{next.id}「{next.titleJa}」
        </button>
      )}

      <div className="row">
        <button type="button" className="btn btn--ghost" onClick={onDex}>
          図鑑（施術カード {PROCEDURES.length}件）
        </button>
        <button type="button" className="btn btn--ghost" onClick={onSources}>
          出典
        </button>
      </div>

      <section className="panel" aria-label="進捗">
        <h2 className="panel__title">進捗</h2>
        <p>
          クリア <strong>{done}</strong> / {total} ケース　／　独力クリア（ヒントなし）<strong>{solo}</strong> 件
        </p>
        <meter min={0} max={total} value={done} aria-label="クリア済みケース数" />
        <p className="muted">
          得点は学習の目安です。人物の容姿にランキングや点数は付けません。
        </p>
      </section>

      <section className="panel" aria-label="この版について">
        <h2 className="panel__title">この版について</h2>
        <ul className="plain">
          <li>登場人物は10人、モードA・Bそれぞれ5ケース以上。ケース・施術・費用の追加はデータ追加で拡張できます。</li>
          <li>医学情報は出典と確認状況を表示します。臨床専門家による監修は未実施です。</li>
          <li>
            顔画像は事前生成アセットの差し替え式です。{pendingImages > 0 ? `現在 ${pendingImages} 点が「画像準備中」の開発表示です。` : ''}
          </li>
          <li>写真のアップロード、自分の顔の適量判定、実在人物を使った機能はありません。</li>
        </ul>
      </section>
    </div>
  );
}
