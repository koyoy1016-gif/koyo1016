import { imageAssetByStateId } from '../data/imageAssets';
import { paramsForState } from '../data/faceStyles';
import { FaceIllustration } from './FaceIllustration';

/** 一覧用の小さな顔サムネイル（実画像があればそれを、無ければ仮イラストを表示） */
export function FaceThumb({ stateId }: { stateId: string }) {
  const asset = imageAssetByStateId.get(stateId);
  const ill = asset?.src ? null : paramsForState(stateId);
  return (
    <span className="thumb" aria-hidden="true">
      {asset?.src ? <img src={asset.src} alt="" draggable={false} /> : ill ? <FaceIllustration p={ill} /> : null}
    </span>
  );
}
