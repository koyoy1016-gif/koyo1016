import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm

# 日本語フォント（Noto Sans CJK JP）
for f in fm.findSystemFonts():
    if 'NotoSansCJK-Regular' in f or 'NotoSansCJK-Bold' in f:
        fm.fontManager.addfont(f)
plt.rcParams['font.family'] = 'Noto Sans CJK JP'

SURF, INK, INK2, GRID = '#fcfcfb', '#0b0b0b', '#52514e', '#e6e5e0'
HPE, IBJ = '#2a78d6', '#eb6834'

ages = [22, 23, 25, 28, 30, 35, 40, 45, 50, 55, 60]
hpe = {'cons': [362, 480, 495, 520, 560, 620, 660, 680, 680, 660, 520],
       'std':  [362, 490, 530, 610, 680, 800, 880, 920, 950, 920, 720],
       'good': [362, 500, 590, 720, 820, 1000, 1150, 1250, 1300, 1300, 1000]}
ibj = {'cons': [306, 318, 330, 360, 380, 400, 420, 420, 420, 410, 340],
       'std':  [306, 330, 360, 410, 450, 500, 540, 560, 560, 550, 450],
       'good': [306, 345, 420, 520, 580, 700, 800, 850, 850, 830, 650]}
take_hpe = [306, 381, 410, 467, 517, 591, 635, 659, 678, 659, 537]
take_ibj = [261, 260, 284, 321, 351, 388, 413, 428, 428, 420, 348]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 9.2), dpi=200, sharex=True,
                               gridspec_kw={'height_ratios': [1.35, 1], 'hspace': 0.3})
fig.patch.set_facecolor(SURF)

def style(ax):
    ax.set_facecolor(SURF)
    for s in ('top', 'right', 'left'):
        ax.spines[s].set_visible(False)
    ax.spines['bottom'].set_color('#9c9a92')
    ax.tick_params(colors=INK2, labelsize=9, length=0)
    ax.yaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.set_xticks([22, 25, 30, 35, 40, 45, 50, 55, 60])
    ax.set_xlim(21.5, 60.5)

# 上段：額面（線＝標準、帯＝保守〜好調）
style(ax1)
for d, col, name in ((hpe, HPE, 'HPE（SE）'), (ibj, IBJ, 'IBJ（総合職）')):
    ax1.fill_between(ages, d['cons'], d['good'], color=col, alpha=0.14, linewidth=0)
    ax1.plot(ages, d['std'], color=col, linewidth=2.2, marker='o', markersize=4.5,
             markeredgecolor=SURF, markeredgewidth=1.2, label=f'{name} 標準')
ax1.set_ylim(0, 1400)
ax1.set_yticks(range(0, 1401, 200))
ax1.set_yticklabels([f'{v:,}' for v in range(0, 1401, 200)])
ax1.legend(loc='upper left', frameon=False, fontsize=9, labelcolor=INK)

# 直接ラベル（選択した点のみ）
for a, v in ((30, 680), (40, 880), (50, 950)):
    ax1.annotate(f'{v}', (a, v), xytext=(0, 8), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
for a, v in ((30, 450), (40, 540), (50, 560)):
    ax1.annotate(f'{v}', (a, v), xytext=(0, -15), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
ax1.annotate('HPE好調 1,300', (55, 1300), xytext=(0, 6), textcoords='offset points', ha='center', fontsize=8, color=INK2)
ax1.annotate('HPE保守 680', (50, 680), xytext=(0, -14), textcoords='offset points', ha='center', fontsize=8, color=INK2)
ax1.annotate('IBJ好調 850', (47.5, 850), xytext=(0, 6), textcoords='offset points', ha='center', fontsize=8, color=INK2)
ax1.annotate('初任給は確認済み\n（22歳は入社年度9か月分）', (22, 306), xytext=(23.2, 130), textcoords='data',
             fontsize=8, color=INK2, arrowprops=dict(arrowstyle='-', color='#9c9a92', linewidth=0.8))

fig.text(0.07, 0.965, 'HPEとIBJの給料カーブ（27卒・学部卒）', fontsize=15, fontweight='bold', color=INK)
fig.text(0.07, 0.94, '額面年収（万円）。線＝標準ケース、帯＝保守〜好調の幅', fontsize=9.5, color=INK2)

# 下段：手取り（標準）
style(ax2)
ax2.plot(ages, take_hpe, color=HPE, linewidth=2.2, marker='o', markersize=4.5,
         markeredgecolor=SURF, markeredgewidth=1.2, label='HPE 手取り')
ax2.plot(ages, take_ibj, color=IBJ, linewidth=2.2, marker='o', markersize=4.5,
         markeredgecolor=SURF, markeredgewidth=1.2, label='IBJ 手取り')
ax2.set_ylim(0, 800)
ax2.set_yticks(range(0, 801, 200))
ax2.legend(loc='upper left', frameon=False, fontsize=9, labelcolor=INK)
for a, v in ((30, 517), (50, 678)):
    ax2.annotate(f'{v}', (a, v), xytext=(0, 8), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
for a, v in ((30, 351), (50, 428)):
    ax2.annotate(f'{v}', (a, v), xytext=(0, -15), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
ax2.set_title('標準ケースの手取り年収（万円、税・社会保険料を引いた後）', loc='left', fontsize=10.5, color=INK, pad=10)
ax2.set_xlabel('年齢（歳）', fontsize=9.5, color=INK2)

fig.text(0.07, 0.022,
         '23歳以降は推定（口コミの年代別平均・有価証券報告書の平均年収をもとに控えめに設定）。2027年の物価基準。\n'
         'HPEは業績賞与・株式報酬を含まない。IBJの賞与は年1か月（保守0.5・好調2）と仮定。60歳は継続雇用で約2割減と仮定。',
         fontsize=7.5, color=INK2, linespacing=1.5)

fig.subplots_adjust(left=0.1, right=0.97, top=0.9, bottom=0.12)
out = '/home/user/koyo1016/lifeplan/給料カーブ_HPE×IBJ.png'
fig.savefig(out, facecolor=SURF)
print(out)
