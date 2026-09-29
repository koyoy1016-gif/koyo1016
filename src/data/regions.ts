export type Region = {
  id: string;
  labelJa: string;
  /** 顔画像上のタップ領域（%）。スマホでは部位一覧ボタンも併用する */
  hit: { left: number; top: number; width: number; height: number };
};

export const REGIONS: Region[] = [
  { id: 'glabella', labelJa: '眉間', hit: { left: 38, top: 24, width: 24, height: 9 } },
  { id: 'eyelid', labelJa: '上まぶた（二重）', hit: { left: 28, top: 34, width: 44, height: 8 } },
  { id: 'eye_outer', labelJa: '目尻', hit: { left: 66, top: 33, width: 18, height: 10 } },
  { id: 'eye_lower', labelJa: '目の下', hit: { left: 30, top: 43, width: 40, height: 9 } },
  { id: 'nose', labelJa: '鼻', hit: { left: 41, top: 44, width: 18, height: 18 } },
  { id: 'cheek', labelJa: '頬', hit: { left: 15, top: 48, width: 20, height: 16 } },
  { id: 'lips', labelJa: '唇', hit: { left: 36, top: 66, width: 28, height: 9 } },
  { id: 'chin', labelJa: '顎先', hit: { left: 38, top: 78, width: 24, height: 9 } },
  { id: 'jaw_contour', labelJa: 'エラ・下顔面', hit: { left: 12, top: 68, width: 22, height: 16 } },
  { id: 'face_lift', labelJa: '顔全体のたるみ', hit: { left: 66, top: 62, width: 24, height: 20 } },
  { id: 'skin', labelJa: '肌の表面', hit: { left: 66, top: 46, width: 22, height: 14 } },
];

export const regionById = new Map(REGIONS.map((r) => [r.id, r]));
