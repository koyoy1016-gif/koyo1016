#!/usr/bin/env python3
"""
3枚組シート（見出し付き・左から「はじめの顔／希望に沿う変化／望まない変化」）から、
顔画像を自動で切り出し、4:5 の webp として src/assets/faces/{stateId}.webp に保存する。

使い方:
  pip install pillow numpy
  python3 scripts/slice-triptych.py <シート画像> <状態ID(左)> <状態ID(中)> <状態ID(右)> [--out src/assets/faces] [--debug]
例:
  python3 scripts/slice-triptych.py sheets/P01.webp C01_base C01_success C01_over

パネルの検出: 白い縦の区切りで3分割し、上下は「見出し帯」と「下部の注記」を除いた写真領域を使う。
自動検出がずれた場合は --debug で検出結果を確認し、--box x0,y0,x1,y1 を3組指定して上書きできる。
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ASPECT = 0.8  # 幅/高さ = 4:5
OUT_W, OUT_H = 640, 800


def runs(mask):
    """True が連続する区間 [(start, end_exclusive), ...]"""
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(mask)))
    return out


def detect_panels(img):
    a = np.asarray(img.convert('RGB')).astype(float)
    h, w, _ = a.shape
    bright = a.mean(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)

    # 1) 縦の白い区切りで3分割（画像の中央付近の行帯で判定）
    mid = bright[int(h * 0.35): int(h * 0.65)]
    col_white = (mid > 246).mean(axis=0) > 0.9
    cols = [r for r in runs(~col_white) if r[1] - r[0] > w * 0.12]
    if len(cols) != 3:
        raise SystemExit(f'パネルが3つ検出できませんでした（検出数: {len(cols)}）。--box で指定してください')

    # 2) 各パネルの左端の帯（写真の無彩色の背景）から、写真の上下を決める
    boxes = []
    for c0, c1 in cols:
        strip_b = bright[:, c0 + 2: c0 + 10].mean(axis=1)
        strip_s = sat[:, c0 + 2: c0 + 10].mean(axis=1)
        photo_rows = (strip_b > 90) & (strip_b < 232) & (strip_s < 30)
        rr = runs(photo_rows)
        if not rr:
            raise SystemExit('写真領域を検出できませんでした。--box で指定してください')
        y0, y1 = max(rr, key=lambda r: r[1] - r[0])
        boxes.append((c0, y0, c1, y1))
    return boxes


def crop_4x5(img, box):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    if w / h < ASPECT:  # 縦長：上を基準に 4:5 の高さへ
        nh = int(round(w / ASPECT))
        box = (x0, y0, x1, y0 + nh)
    else:  # 横長：中央を基準に 4:5 の幅へ
        nw = int(round(h * ASPECT))
        cx = (x0 + x1) // 2
        box = (cx - nw // 2, y0, cx - nw // 2 + nw, y1)
    return img.crop(box).resize((OUT_W, OUT_H), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheet')
    ap.add_argument('states', nargs=3)
    ap.add_argument('--out', default='src/assets/faces')
    ap.add_argument('--debug', action='store_true')
    ap.add_argument('--box', action='append', help='x0,y0,x1,y1（3回指定）')
    args = ap.parse_args()

    img = Image.open(args.sheet).convert('RGB')
    if args.box:
        if len(args.box) != 3:
            raise SystemExit('--box は3回指定してください')
        boxes = [tuple(int(v) for v in b.split(',')) for b in args.box]
    else:
        boxes = detect_panels(img)
    print('sheet', img.size, 'panels', boxes)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for state, box in zip(args.states, boxes):
        crop = crop_4x5(img, box)
        path = out / f'{state}.webp'
        crop.save(path, 'WEBP', quality=84, method=6)
        print('wrote', path, f'{path.stat().st_size // 1024}KB')
        if args.debug:
            crop.save(Path('/tmp') / f'{state}_debug.png')


if __name__ == '__main__':
    sys.exit(main())
