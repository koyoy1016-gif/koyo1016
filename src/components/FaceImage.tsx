import { imageAssetByStateId } from '../data/imageAssets';
import { REGIONS } from '../data/regions';
import { characterById } from '../data/characters';
import { paramsForState } from '../data/faceStyles';
import { FaceIllustration } from './FaceIllustration';

type Props = {
  stateId: string;
  /** 部位タップを有効にする（モードA） */
  selectableRegions?: boolean;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  compact?: boolean;
  /** 同じケースの中で実画像と仮イラストが混ざらないよう、仮イラストで統一する */
  illustrationOnly?: boolean;
};

/**
 * 顔画像。事前生成アセットが無い間は「画像準備中」の開発表示（実在人物のストック写真では代替しない）。
 * 常時「AI生成・架空の変化例」と時点ラベルを表示する。
 */
export function FaceImage({ stateId, selectableRegions, selectedRegionId, onSelectRegion, compact, illustrationOnly }: Props) {
  const asset = imageAssetByStateId.get(stateId);
  const character = asset ? characterById.get(asset.characterId) : undefined;
  const useSrc = !!asset?.src && !illustrationOnly;
  const illustration = useSrc ? null : paramsForState(stateId);

  return (
    <figure className={`face ${compact ? 'face--compact' : ''}`}>
      <div className="face__frame">
        {/* key を変えることでフェード（400〜700ms）が再生される。動きを減らす設定では無効化 */}
        <div className="face__fade" key={stateId}>
          {useSrc && asset?.src ? (
            <img className="face__img" src={asset.src} alt={asset.altJa} draggable={false} />
          ) : illustration ? (
            <div className="face__illust" role="img" aria-label={`仮イラスト：${asset?.altJa ?? stateId}`}>
              <FaceIllustration p={illustration} />
            </div>
          ) : (
            <Placeholder
              name={character ? `${character.nameJa}（架空・${character.age}歳）` : '架空の人物'}
              stateId={stateId}
              alt={asset?.altJa ?? ''}
            />
          )}
        </div>

        {selectableRegions && (
          <div className="face__regions" aria-hidden={false}>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`face__hit ${selectedRegionId === r.id ? 'is-selected' : ''}`}
                style={{ left: `${r.hit.left}%`, top: `${r.hit.top}%`, width: `${r.hit.width}%`, height: `${r.hit.height}%` }}
                aria-label={`部位：${r.labelJa}`}
                aria-pressed={selectedRegionId === r.id}
                onClick={() => onSelectRegion?.(r.id)}
              />
            ))}
          </div>
        )}
      </div>
      <figcaption className="face__caption">
        {useSrc ? (
          <span className="badge badge--ai">AI生成・架空の変化例</span>
        ) : (
          <span className="badge badge--ai">架空の仮イラスト</span>
        )}
        <span className="face__time">{asset?.timeLabelJa ?? ''}</span>
        {!useSrc && <span className="badge badge--dev">画像準備中（開発用の仮イラスト）</span>}
      </figcaption>
    </figure>
  );
}

function Placeholder({ name, stateId, alt }: { name: string; stateId: string; alt: string }) {
  return (
    <div className="face__placeholder" role="img" aria-label={`画像準備中：${alt || stateId}`}>
      <svg viewBox="0 0 200 250" aria-hidden="true">
        <rect width="200" height="250" fill="var(--placeholder-bg)" />
        <ellipse cx="100" cy="112" rx="52" ry="68" fill="none" stroke="var(--placeholder-line)" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M30 250 Q100 170 170 250" fill="none" stroke="var(--placeholder-line)" strokeWidth="3" strokeDasharray="6 6" />
      </svg>
      <div className="face__placeholder-text">
        <strong>画像準備中</strong>
        <span>{name}</span>
        <code>{stateId}</code>
      </div>
    </div>
  );
}
