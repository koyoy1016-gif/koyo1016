import { useId } from 'react';
import type { FaceParams } from '../data/faceStyles';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(clamp(c + amt * (amt < 0 ? c : 255 - c), 0, 255));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// 決定的な肌の点（ニキビ跡・色素）の位置
const SPOTS: [number, number][] = [
  [64, 132], [72, 146], [58, 150], [80, 128], [70, 160], [128, 132], [136, 146], [142, 152], [120, 128], [130, 162],
  [88, 140], [112, 140], [56, 138], [144, 138], [78, 170], [122, 170],
];

/** 仮イラスト：本番の生成画像が置かれるまでの開発用表示。実在人物とは無関係の抽象的な顔。 */
export function FaceIllustration({ p }: { p: FaceParams }) {
  const uid = useId().replace(/:/g, '');
  const skin = p.skin;
  const skinDark = shade(skin, -0.22);
  const skinLight = shade(skin, 0.18);
  const lip = mixRed(skin, 0.4);
  const lipColor = shade(lip, -0.3);

  const jhw = 32 + p.jawW * 15; // 下顎角の半幅
  const sq = p.jawSquare;
  const hollow = p.cheekHollow;
  const sagPx = p.sag * 8;
  const R = (dx: number, y: number) => `${100 + dx} ${y}`;
  const L = (dx: number, y: number) => `${100 - dx} ${y}`;
  const chin = 12 + p.chinProj * 4;

  const faceRight = `C ${R(34, 36)} ${R(51, 62)} ${R(51, 96)} C ${R(51, 120)} ${R(52 - hollow * 3, 140)} ${R(jhw + 6, 158 + sagPx * 0.3)} C ${R(jhw + sq * 3, 172)} ${R(jhw + sq * 2, 188 + sq * 6)} ${R(jhw - 2 - (1 - sq) * 6, 196 + sagPx * 0.3)} C ${R(chin + 8, 210)} ${R(chin, 214)} 100 214`;
  const faceLeft = `C ${L(chin, 214)} ${L(chin + 8, 210)} ${L(jhw - 2 - (1 - sq) * 6, 196 + sagPx * 0.3)} C ${L(jhw + sq * 2, 188 + sq * 6)} ${L(jhw + sq * 3, 172)} ${L(jhw + 6, 158 + sagPx * 0.3)} C ${L(52 - hollow * 3, 140)} ${L(51, 120)} ${L(51, 96)} C ${L(51, 62)} ${L(34, 36)} 100 36`;
  const facePath = `M 100 36 ${faceRight} ${faceLeft} Z`;

  const smile = p.expr === 'smile';
  const frown = p.expr === 'frown';
  const eyeSquint = smile ? 0.55 : 1;
  const browY = frown ? 88 : 84;
  const browInner = frown ? 4 : 0;
  const glab = clamp(p.glabella + (frown ? 0.5 : 0));
  const crow = clamp(p.crowsFeet + (smile ? 0.45 : 0));
  const nasolabial = clamp((p.age - 32) / 50, 0, 0.45) + (smile ? 0.15 : 0);

  const lw = 15 + p.lipThick * 3 + (smile ? 3 : 0); // 唇の半幅
  const my = 176;
  const tu = 2.5 + p.lipThick * 5.5;
  const tl = 3.5 + p.lipThick * 7.5;
  const alarHW = 9 + p.alarW * 8;

  return (
    <svg viewBox="0 0 200 250" role="img" aria-hidden="true" className="face__svg">
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor="#c9ccd2" />
          <stop offset="1" stopColor="#9a9ea6" />
        </radialGradient>
        <linearGradient id={`${uid}fs`} x1="0" x2="1">
          <stop offset="0" stopColor={skinDark} stopOpacity="0.28" />
          <stop offset="0.25" stopColor={skin} stopOpacity="0" />
          <stop offset="0.75" stopColor={skin} stopOpacity="0" />
          <stop offset="1" stopColor={skinDark} stopOpacity="0.28" />
        </linearGradient>
        <filter id={`${uid}bl`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <clipPath id={`${uid}fc`}>
          <path d={facePath} />
        </clipPath>
      </defs>
      <rect width="200" height="250" fill={`url(#${uid}bg)`} />

      <HairBack style={p.hairStyle} color={p.hair} />

      {/* 首・肩 */}
      <path d="M 82 196 L 82 226 Q 100 240 118 226 L 118 196 Z" fill={skinDark} />
      <path d="M 0 250 L 0 236 C 36 226 68 226 84 218 L 100 240 L 116 218 C 132 226 164 226 200 236 L 200 250 Z" fill={p.shirt} />

      {/* 耳 */}
      <ellipse cx="46" cy="112" rx="7" ry="13" fill={skin} />
      <ellipse cx="154" cy="112" rx="7" ry="13" fill={skin} />
      <ellipse cx="46" cy="112" rx="3.5" ry="8" fill={skinDark} opacity="0.35" />
      <ellipse cx="154" cy="112" rx="3.5" ry="8" fill={skinDark} opacity="0.35" />

      {/* 顔 */}
      <path d={facePath} fill={skin} />
      <path d={facePath} fill={`url(#${uid}fs)`} />

      <g clipPath={`url(#${uid}fc)`}>
        {/* 頬のくぼみ */}
        {hollow > 0 && (
          <>
            <ellipse cx="68" cy="150" rx="15" ry="26" fill="#3a1f14" opacity={hollow * 0.5} filter={`url(#${uid}bl)`} transform="rotate(-14 68 150)" />
            <ellipse cx="132" cy="150" rx="15" ry="26" fill="#3a1f14" opacity={hollow * 0.5} filter={`url(#${uid}bl)`} transform="rotate(14 132 150)" />
          </>
        )}
        {/* 下顔面のたるみ（口角から顎への線・あご下の影） */}
        {p.sag > 0 && (
          <>
            <path d={`M 76 ${168} Q 66 ${182 + sagPx} 76 ${196 + sagPx * 0.5}`} stroke={skinDark} strokeWidth="1.6" fill="none" opacity={p.sag * 0.6} />
            <path d={`M 124 ${168} Q 134 ${182 + sagPx} 124 ${196 + sagPx * 0.5}`} stroke={skinDark} strokeWidth="1.6" fill="none" opacity={p.sag * 0.6} />
            <ellipse cx="100" cy="212" rx="40" ry="8" fill="#3a1f14" opacity={p.sag * 0.18} />
          </>
        )}
        {/* エラの影 */}
        <path d={`M ${100 - jhw - 2} 170 Q ${100 - jhw + 6} 200 ${100 - chin} 212`} stroke={skinDark} strokeWidth="2" fill="none" opacity={0.16 + sq * 0.22} />
        <path d={`M ${100 + jhw + 2} 170 Q ${100 + jhw - 6} 200 ${100 + chin} 212`} stroke={skinDark} strokeWidth="2" fill="none" opacity={0.16 + sq * 0.22} />

        {/* 肌のざらつき・ニキビ跡・赤み・色素 */}
        {p.texture > 0 &&
          SPOTS.map(([x, y], i) => (
            <circle key={`t${i}`} cx={x} cy={y} r={1.1 + (i % 3) * 0.5} fill={skinDark} opacity={clamp(p.texture) * 0.7} />
          ))}
        {p.texture > 0 && <rect x="40" y="110" width="120" height="70" fill="#000" opacity={p.texture * 0.04} />}
        {p.redness > 0 && (
          <>
            <ellipse cx="66" cy="150" rx="13" ry="10" fill="#c1443a" opacity={p.redness * 0.5} filter={`url(#${uid}bl)`} />
            <ellipse cx="136" cy="142" rx="10" ry="8" fill="#c1443a" opacity={p.redness * 0.4} filter={`url(#${uid}bl)`} />
          </>
        )}
        {p.pigment > 0 && (
          <>
            <ellipse cx="134" cy="138" rx="11" ry="8" fill="#6b4324" opacity={p.pigment * 0.5} transform="rotate(-15 134 138)" />
            <ellipse cx="140" cy="146" rx="4" ry="3" fill="#6b4324" opacity={p.pigment * 0.45} />
          </>
        )}
      </g>

      {/* 目の下：ふくらみ・溝・暗さ */}
      {[74, 126].map((cx) => (
        <g key={`u${cx}`}>
          {p.darkCircle > 0 && <ellipse cx={cx} cy="112" rx="14" ry="6" fill="#4b3050" opacity={p.darkCircle * 0.32} />}
          {p.eyeBulge > 0 && <ellipse cx={cx} cy="111" rx="12" ry={3 + p.eyeBulge * 4} fill={skinLight} opacity={p.eyeBulge * 0.55} />}
          {p.eyeBulge > 0 && <ellipse cx={cx} cy={107} rx="11" ry="2" fill={skinDark} opacity={p.eyeBulge * 0.25} />}
          {p.eyeGroove > 0 && <path d={`M ${cx - 13} 117 Q ${cx} ${121 + p.eyeGroove * 3} ${cx + 13} 117`} stroke="#3a1f14" strokeWidth={1.4 + p.eyeGroove * 1.6} fill="none" opacity={p.eyeGroove * 0.42} strokeLinecap="round" />}
        </g>
      ))}

      {/* 目 */}
      {[74, 126].map((cx, i) => (
        <g key={`e${cx}`} transform={`translate(${cx} 98) scale(1 ${eyeSquint})`}>
          <path d="M -12 0 Q 0 -8 12 0 Q 0 7 -12 0 Z" fill="#f7f4f0" />
          <circle cx="0" cy="-0.5" r="4.4" fill="#2a1a12" />
          <circle cx="1.4" cy="-1.8" r="1.1" fill="#fff" opacity="0.85" />
          <path d="M -13 0.5 Q 0 -10 13 0.5" stroke="#241610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M -11 -5 Q 0 -13 11 -5" stroke={skinDark} strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      ))}

      {/* 眉 */}
      <path d={`M ${50} ${browY + 2} Q ${66} ${browY - 6} ${88 + browInner} ${browY + (frown ? 3 : 0)}`} stroke={p.hair} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d={`M ${150} ${browY + 2} Q ${134} ${browY - 6} ${112 - browInner} ${browY + (frown ? 3 : 0)}`} stroke={p.hair} strokeWidth="3.4" fill="none" strokeLinecap="round" />

      {/* 眉間のしわ */}
      <g stroke={skinDark} strokeWidth="1.5" strokeLinecap="round" opacity={glab * 0.8}>
        <path d="M 96 72 L 96 90" />
        <path d="M 104 72 L 104 90" />
        {glab > 0.5 && <path d="M 100 70 L 100 84" opacity="0.7" />}
      </g>

      {/* 目尻のしわ */}
      {[[60, -1], [140, 1]].map(([x, dir]) => (
        <g key={`c${x}`} stroke={skinDark} strokeWidth="1.2" strokeLinecap="round" opacity={crow * 0.8}>
          <path d={`M ${x} 96 L ${x + dir * 9} ${92 - (smile ? 1 : 0)}`} />
          <path d={`M ${x} 99 L ${x + dir * 10} 99`} />
          <path d={`M ${x} 102 L ${x + dir * 9} ${106 + (smile ? 1 : 0)}`} />
        </g>
      ))}

      {/* 鼻 */}
      <path d="M 96 102 Q 93 128 92 146" stroke={skinDark} strokeWidth="1.4" fill="none" opacity="0.28" strokeLinecap="round" />
      <path d="M 104 102 Q 107 128 108 146" stroke={skinDark} strokeWidth="1.4" fill="none" opacity="0.18" strokeLinecap="round" />
      <path d={`M ${100 - alarHW - 2} 148 Q ${100 - alarHW - 4} 156 ${100 - alarHW + 3} 157 Q 100 161 ${100 + alarHW - 3} 157 Q ${100 + alarHW + 4} 156 ${100 + alarHW + 2} 148`} stroke={skinDark} strokeWidth="1.6" fill="none" opacity="0.5" strokeLinecap="round" />
      <ellipse cx={100 - alarHW + 5} cy="156" rx="2.6" ry="1.6" fill="#3a1f14" opacity="0.55" />
      <ellipse cx={100 + alarHW - 5} cy="156" rx="2.6" ry="1.6" fill="#3a1f14" opacity="0.55" />

      {/* ほうれい線 */}
      {nasolabial > 0.02 && (
        <>
          <path d={`M ${100 - alarHW - 3} 156 Q ${100 - lw - 6} 168 ${100 - lw - 4} 180`} stroke={skinDark} strokeWidth="1.3" fill="none" opacity={nasolabial} strokeLinecap="round" />
          <path d={`M ${100 + alarHW + 3} 156 Q ${100 + lw + 6} 168 ${100 + lw + 4} 180`} stroke={skinDark} strokeWidth="1.3" fill="none" opacity={nasolabial} strokeLinecap="round" />
        </>
      )}

      {/* 唇 */}
      {p.lipProtrude > 0 && (
        <>
          <ellipse cx="100" cy={my + tl + 6} rx={lw * 0.7} ry="3.5" fill="#3a1f14" opacity={p.lipProtrude * 0.22} />
          <ellipse cx="100" cy={my + tl * 0.5} rx={lw * 0.5} ry={tl * 0.35} fill="#fff" opacity={p.lipProtrude * 0.28} />
        </>
      )}
      <path d={`M ${100 - lw} ${my} C ${100 - lw * 0.5} ${my - tu * 1.5} ${96} ${my - tu * 1.9} 100 ${my - tu * 1.25} C ${104} ${my - tu * 1.9} ${100 + lw * 0.5} ${my - tu * 1.5} ${100 + lw} ${my} C ${100 + lw * 0.5} ${my + 1.2} ${100 - lw * 0.5} ${my + 1.2} ${100 - lw} ${my} Z`} fill={lip} />
      <path d={`M ${100 - lw} ${my} C ${100 - lw * 0.5} ${my + tl * 1.15} ${100 + lw * 0.5} ${my + tl * 1.15} ${100 + lw} ${my} C ${100 + lw * 0.5} ${my - 1} ${100 - lw * 0.5} ${my - 1} ${100 - lw} ${my} Z`} fill={shade(lip, 0.08)} />
      <path d={`M ${100 - lw} ${my} Q 100 ${my + (smile ? 4 : 1.2)} ${100 + lw} ${my}`} stroke={lipColor} strokeWidth="1.4" fill="none" opacity="0.7" strokeLinecap="round" />
      {smile && <path d={`M ${100 - lw - 4} ${my - 4} Q 100 ${my + 8} ${100 + lw + 4} ${my - 4}`} stroke={skinDark} strokeWidth="1.1" fill="none" opacity="0.45" strokeLinecap="round" />}

      <HairFront style={p.hairStyle} color={p.hair} />
    </svg>
  );
}

function mixRed(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c: number, target: number) => Math.round(c + (target - c) * t);
  return `#${((1 << 24) | (mix(r, 176) << 16) | (mix(g, 88) << 8) | mix(b, 92)).toString(16).slice(1)}`;
}

function HairBack({ style, color }: { style: FaceParams['hairStyle']; color: string }) {
  switch (style) {
    case 'bob':
      return <path d="M 38 96 C 30 40 170 40 162 96 L 164 178 Q 130 190 100 186 Q 70 190 36 178 Z" fill={color} />;
    case 'medium':
      return <path d="M 36 96 C 28 36 172 36 164 96 L 168 206 Q 130 214 100 208 Q 70 214 32 206 Z" fill={color} />;
    case 'long':
      return <path d="M 34 96 C 26 34 174 34 166 96 L 172 244 L 28 244 Z" fill={color} />;
    case 'pony':
      return (
        <>
          <path d="M 150 60 Q 190 70 184 128 Q 176 158 166 138 Q 176 104 150 84 Z" fill={color} />
          <path d="M 40 90 C 34 36 166 36 160 90 Z" fill={color} />
        </>
      );
    default:
      return null;
  }
}

function HairFront({ style, color }: { style: FaceParams['hairStyle']; color: string }) {
  switch (style) {
    case 'buzz':
      return <path d="M 47 92 C 40 6 160 6 153 92 C 150 66 130 50 100 50 C 70 50 50 66 47 92 Z" fill={color} opacity="0.92" />;
    case 'short':
      return <path d="M 46 98 C 36 -4 164 -4 154 98 C 152 76 146 62 128 58 C 112 66 82 62 70 54 C 56 62 48 78 46 98 Z" fill={color} />;
    case 'shortF':
      return <path d="M 44 104 C 34 -4 166 -4 156 104 C 152 78 140 60 116 54 C 100 66 70 62 60 60 C 50 70 46 86 44 104 Z" fill={color} />;
    case 'bob':
      return <path d="M 42 112 C 34 -2 166 -2 158 112 C 154 74 132 54 100 52 C 68 54 46 74 42 112 Z" fill={color} />;
    case 'medium':
    case 'long':
      return <path d="M 40 110 C 32 -2 168 -2 160 110 C 156 72 128 50 102 50 C 72 52 44 74 40 110 Z" fill={color} />;
    case 'pony':
      return <path d="M 42 104 C 34 -2 166 -2 158 104 C 154 72 130 52 100 52 C 70 54 46 72 42 104 Z" fill={color} />;
    default:
      return null;
  }
}
