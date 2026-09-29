/**
 * 仮イラスト用の顔パラメータ。本番の生成画像（src/assets/faces）が置かれるまでの開発用表示。
 * すべて 0〜1 の値。教育用の架空表現であり、実際の施術結果の予測ではない。
 */
export type HairStyle = 'short' | 'buzz' | 'bob' | 'medium' | 'long' | 'pony' | 'shortF';

export type FaceParams = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  age: number;
  jawW: number; // 下顔面の幅
  jawSquare: number; // エラの角張り
  cheekHollow: number; // 頬骨下のくぼみ
  lipThick: number;
  lipProtrude: number; // 唇の前方への突出（影・ハイライト）
  eyeBulge: number; // 目の下のふくらみ
  eyeGroove: number; // 目の下の溝
  darkCircle: number; // 目の下の暗さ
  glabella: number; // 眉間のしわ
  crowsFeet: number; // 目尻のしわ
  alarW: number; // 小鼻の幅
  sag: number; // 下顔面のたるみ
  texture: number; // 肌のざらつき・ニキビ跡
  redness: number; // 局所的な赤み
  pigment: number; // 局所的な色素斑
  chinProj: number; // 顎先の突出感（正面の見え方のみ。横顔は未実装）
  cheekFull: number; // 頬の丸み・ボリューム
  lid: number; // 二重のライン
  tipRound: number; // 鼻先の丸み
  philtrum: number; // 鼻下〜上唇の距離
  expr: 'neutral' | 'frown' | 'smile';
};

export const DEFAULT_FACE: FaceParams = {
  skin: '#d9a77f',
  hair: '#1f1a17',
  hairStyle: 'short',
  shirt: '#2b3a55',
  age: 30,
  jawW: 0.5,
  jawSquare: 0.4,
  cheekHollow: 0,
  lipThick: 0.3,
  lipProtrude: 0,
  eyeBulge: 0,
  eyeGroove: 0,
  darkCircle: 0,
  glabella: 0.08,
  crowsFeet: 0.05,
  alarW: 0.4,
  sag: 0,
  texture: 0,
  redness: 0,
  pigment: 0,
  chinProj: 0.5,
  cheekFull: 0,
  lid: 0.45,
  tipRound: 0.4,
  philtrum: 0.5,
  expr: 'neutral',
};

const SKIN = { light: '#f0d2b8', medium: '#d9a77f', olive: '#c99a6b', dark: '#8d5a3b' };

type Look = { base: Partial<FaceParams> };

export const CHARACTER_LOOKS: Record<string, Look> = {
  C01: { base: { skin: SKIN.medium, hairStyle: 'short', shirt: '#22304a', age: 28, jawW: 0.88, jawSquare: 0.6, lipThick: 0.3 } },
  C02: { base: { skin: SKIN.light, hairStyle: 'bob', shirt: '#4b5c78', age: 26, jawW: 0.25, jawSquare: 0.1, lipThick: 0.05 } },
  C03: { base: { skin: SKIN.olive, hairStyle: 'buzz', shirt: '#3a3f47', age: 35, jawW: 1, jawSquare: 1, lipThick: 0.3, chinProj: 0.6 } },
  C04: { base: { skin: SKIN.dark, hairStyle: 'medium', shirt: '#6b3f52', age: 34, jawW: 0.2, jawSquare: 0.1, cheekHollow: 0.35, lipThick: 0.45 } },
  C05: { base: { skin: SKIN.medium, hairStyle: 'short', shirt: '#2f4b45', age: 31, jawW: 0.55, jawSquare: 0.4, sag: 0.45, chinProj: 0.4 } },
  C06: { base: { skin: SKIN.light, hair: '#2a2320', hairStyle: 'medium', shirt: '#7a5a3a', age: 38, jawW: 0.35, glabella: 0.75, lipThick: 0.35 } },
  C07: { base: { skin: SKIN.medium, hair: '#6d6a68', hairStyle: 'short', shirt: '#33415c', age: 42, jawW: 0.6, jawSquare: 0.5, crowsFeet: 0.6, lipThick: 0.35 } },
  C08: { base: { skin: SKIN.light, hairStyle: 'pony', shirt: '#8a6a7a', age: 23, jawW: 0.2, jawSquare: 0.05, lipThick: 0.4, lid: 0 } },
  C09: { base: { skin: SKIN.medium, hair: '#6d6a68', hairStyle: 'short', shirt: '#3b4a5a', age: 46, jawW: 0.6, jawSquare: 0.5, eyeBulge: 0.7, eyeGroove: 0.6, darkCircle: 0.2 } },
  C10: { base: { skin: SKIN.light, hair: '#2a2320', hairStyle: 'long', shirt: '#5a6f7a', age: 40, jawW: 0.3, darkCircle: 0.55, eyeBulge: 0.12 } },
  C11: { base: { skin: SKIN.light, hairStyle: 'short', shirt: '#404a3a', age: 29, jawW: 0.5, jawSquare: 0.3, chinProj: 0.2 } },
  C12: { base: { skin: SKIN.medium, hairStyle: 'bob', shirt: '#5a4a6a', age: 32, jawW: 0.35, alarW: 0.95, lipThick: 0.4 } },
  C13: { base: { skin: SKIN.olive, hairStyle: 'short', shirt: '#2e3b4f', age: 30, jawW: 0.5, alarW: 0.4, tipRound: 0.85 } },
  C14: { base: { skin: SKIN.medium, hair: '#8d8985', hairStyle: 'shortF', shirt: '#5a3b3b', age: 52, jawW: 0.45, sag: 0.7, lipThick: 0.25 } },
  C15: { base: { skin: SKIN.light, hair: '#8b8886', hairStyle: 'short', shirt: '#3a3a3a', age: 58, jawW: 0.65, jawSquare: 0.4, sag: 0.75, lipThick: 0.2 } },
  C16: { base: { skin: SKIN.dark, hairStyle: 'long', shirt: '#3f5f4f', age: 27, jawW: 0.3, texture: 0.7, lipThick: 0.45 } },
  C17: { base: { skin: SKIN.medium, hairStyle: 'short', shirt: '#4a3f5a', age: 33, jawW: 0.55, jawSquare: 0.4, pigment: 0.75 } },
  C18: { base: { skin: SKIN.light, hair: '#3a2c25', hairStyle: 'medium', shirt: '#6a5a3f', age: 45, jawW: 0.35, cheekHollow: 0.4, lipThick: 0.3, crowsFeet: 0.45 } },
  C19: { base: { skin: SKIN.medium, hairStyle: 'short', shirt: '#33506a', age: 25, jawW: 0.5, lipThick: 0.35, chinProj: 0.5, philtrum: 0.9 } },
  C20: { base: { skin: SKIN.light, hair: '#c9c6c3', hairStyle: 'shortF', shirt: '#5a5f7a', age: 62, jawW: 0.4, texture: 0.15, sag: 0.35, lipThick: 0.2 } },
};

/** 状態ID（表情サフィックスを除く）ごとの、基準からの差分 */
export const STATE_DELTAS: Record<string, Partial<FaceParams>> = {
  C01_success: { jawW: 0.6, jawSquare: 0.38 },
  C01_over: { jawW: 0.5, jawSquare: 0.3, cheekHollow: 0.75 },
  C06_over: { glabella: 0.02 },
  C07_over: { crowsFeet: 0.02 },
  C01_a04_lipmass: { jawW: 0.6, jawSquare: 0.38, lipThick: 0.62 },
  C02_success: { lipThick: 0.4 },
  C02_medium: { lipThick: 0.62, lipProtrude: 0.15 },
  C02_over: { lipThick: 0.95, lipProtrude: 0.85 },
  C03_under: { jawW: 0.96, jawSquare: 0.96 },
  C04_over: { cheekHollow: 0.85 },
  C05_success: { sag: 0.1 },
  C05_over: { sag: 0, cheekHollow: 0.5 },
  C06_success: { glabella: 0.12 },
  C07_success: { crowsFeet: 0.12 },
  C08_success: { lid: 0.9 },
  C09_success: { eyeBulge: 0.15, eyeGroove: 0.12 },
  C11_success: { chinProj: 0.55 },
  C11_over: { chinProj: 1 },
  C12_success: { alarW: 0.55 },
  C12_over: { alarW: 0.05 },
  C13_success: { tipRound: 0.3 },
  C14_success: { sag: 0.25 },
  C14_over: { cheekHollow: 0.6, sag: 0.5 },
  C15_over: { sag: 0.2, redness: 0.5 },
  C16_success: { texture: 0.3 },
  C16_over: { texture: 0.5, redness: 0.65 },
  C16_a09_lip: { texture: 0.3, lipThick: 0.72 },
  C02_swollen: { lipThick: 0.9, lipProtrude: 0.5, redness: 0.25 },
  C17_success: { pigment: 0.3 },
  C17_over: { pigment: 0.35, redness: 0.55 },
  C18_success: { cheekHollow: 0.12 },
  C18_a10_eye: { cheekHollow: 0.12, crowsFeet: 0.1 },
  C18_a10_lip: { cheekHollow: 0.12, crowsFeet: 0.1, lipThick: 0.55 },
  C18_over: { cheekHollow: 0, cheekFull: 0.95 },
  C19_success: { philtrum: 0.5 },
  C20_success: { texture: 0.05 },
  C20_over: { age: 46, sag: 0.05, texture: 0 },
};

/** 他人の状態の連鎖（履歴の途中状態など）は STATE_DELTAS に個別に持つ */
export const paramsForState = (stateId: string): FaceParams | null => {
  const charId = stateId.split('_')[0];
  const look = CHARACTER_LOOKS[charId];
  if (!look) return null;
  let expr: FaceParams['expr'] = 'neutral';
  let baseId = stateId;
  if (stateId.endsWith('_frown')) {
    expr = 'frown';
    baseId = stateId.slice(0, -6);
  } else if (stateId.endsWith('_smile')) {
    expr = 'smile';
    baseId = stateId.slice(0, -6);
  }
  return { ...DEFAULT_FACE, ...look.base, ...(STATE_DELTAS[baseId] ?? {}), expr };
};
