import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from hpe_v2 import val
from ages import F, interp, person_net

for f in fm.findSystemFonts():
    if 'NotoSansCJK-Regular' in f or 'NotoSansCJK-Bold' in f:
        fm.fontManager.addfont(f)
plt.rcParams['font.family'] = 'Noto Sans CJK JP'

SURF, INK, INK2, GRID, REF = '#fcfcfb', '#0b0b0b', '#52514e', '#e6e5e0', '#52514e'
HPE, IBJ = '#2a78d6', '#eb6834'

ages = list(range(22, 61))
hpe = {c: [val(c, a) for a in ages] for c in ('cons', 'std', 'good')}
ibj = {c: [interp(F[c], a) for a in ages] for c in ('cons', 'std', 'good')}
take_hpe = [306] + [person_net(val('std', a), 'HPE', a)['take'] / 1e4 for a in ages[1:]]
take_ibj = [261] + [person_net(interp(F['std'], a), 'IBJ', a)['take'] / 1e4 for a in ages[1:]]

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 9.6), dpi=200, sharex=True,
                               gridspec_kw={'height_ratios': [1.45, 1], 'hspace': 0.28})
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

def line(ax, y, col, label):
    ax.plot(ages, y, color=col, linewidth=2.2, label=label, solid_joinstyle='round')

# 上段：額面
style(ax1)
for d, col, name in ((hpe, HPE, 'HPE（SE）'), (ibj, IBJ, 'IBJ（総合職）')):
    ax1.fill_between(ages, d['cons'], d['good'], color=col, alpha=0.13, linewidth=0)
    line(ax1, d['std'], col, f'{name} 標準')

# OpenMoneyの実績値（参考点）
grades = [(25.7, 594, 'Entry 594'), (30.6, 733, 'Intermediate 733'), (34.1, 858, 'Specialist 858'), (41.2, 1287, 'Expert 1,287')]
ax1.scatter([g[0] for g in grades], [g[1] for g in grades], marker='D', s=34, facecolor=SURF,
            edgecolor=REF, linewidth=1.4, zorder=5, label='OpenMoney グレード別平均（HPE全職種）')
offs = {'Entry 594': (7, -12), 'Intermediate 733': (7, -13), 'Specialist 858': (8, -12), 'Expert 1,287': (8, 4)}
for x, y, t in grades:
    ax1.annotate(t, (x, y), xytext=offs[t], textcoords='offset points', fontsize=7.8, color=REF,
                 ha='left')
for x, y, lo, hi in ((25, 570, 469, 691), (30, 723, 594, 880)):
    ax1.errorbar(x + 0.35, y, yerr=[[y - lo], [hi - y]], fmt='s', ms=4.5, color=REF, mfc=REF,
                 elinewidth=1, capsize=3, zorder=5)
ax1.errorbar([], [], yerr=[], fmt='s', ms=4.5, color=REF, capsize=3, label='OpenMoney 年齢別推定と幅（25・30歳）')

# 昇格の目安（標準）
for a, t, dx, dy in ((26, 'Intermediate昇格\n（5年目・26歳）', -20, 72), (33, 'Specialist昇格', 8, -24)):
    ax1.annotate(t, (a, val('std', a)), xytext=(dx, dy), textcoords='offset points', fontsize=7.8, color=HPE,
                 arrowprops=dict(arrowstyle='-', color=HPE, linewidth=0.8))
for a in (40, 50):
    ax1.annotate(f'{round(val("std", a)):,}', (a, val('std', a)), xytext=(0, 7), textcoords='offset points',
                 ha='center', fontsize=8.5, color=INK)
for a in (30, 40, 50):
    ax1.annotate(f'{round(interp(F["std"], a))}', (a, interp(F['std'], a)), xytext=(0, -14),
                 textcoords='offset points', ha='center', fontsize=8.5, color=INK)
ax1.annotate('HPE好調（Expert）1,400', (52, 1400), xytext=(0, 6), textcoords='offset points', ha='center', fontsize=7.8, color=INK2)
ax1.annotate('HPE保守（Intermediate止まり）790', (50, 790), xytext=(0, -13), textcoords='offset points', ha='center', fontsize=7.8, color=INK2)

ax1.set_ylim(0, 1500)
ax1.set_yticks(range(0, 1501, 250))
ax1.set_yticklabels([f'{v:,}' for v in range(0, 1501, 250)])
ax1.legend(loc='upper left', frameon=False, fontsize=8.2, labelcolor=INK)

fig.text(0.07, 0.968, 'HPEとIBJの給料カーブ（27卒・学部卒）改訂版', fontsize=15, fontweight='bold', color=INK)
fig.text(0.07, 0.945, '額面年収（万円）。線＝標準、帯＝保守〜好調。HPEはOpenMoneyの実績を反映', fontsize=9.3, color=INK2)

# 下段：手取り（標準）
style(ax2)
line(ax2, take_hpe, HPE, 'HPE 手取り（標準）')
line(ax2, take_ibj, IBJ, 'IBJ 手取り（標準）')
for a in (30, 50):
    ax2.annotate(f'{round(take_hpe[a - 22])}', (a, take_hpe[a - 22]), xytext=(0, 7), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
    ax2.annotate(f'{round(take_ibj[a - 22])}', (a, take_ibj[a - 22]), xytext=(0, -14), textcoords='offset points', ha='center', fontsize=8.5, color=INK)
ax2.set_ylim(0, 800)
ax2.set_yticks(range(0, 801, 200))
ax2.legend(loc='upper left', frameon=False, fontsize=8.5, labelcolor=INK)
ax2.set_title('標準ケースの手取り年収（万円、税・社会保険料を引いた後）', loc='left', fontsize=10.5, color=INK, pad=10)
ax2.set_xlabel('年齢（歳）', fontsize=9.5, color=INK2)

fig.text(0.07, 0.018,
         'HPE：初任給と年俸18分割は確認済み。昇格時期・グレード別年収はOpenMoney（2026年5月、\n回答178人、営業・中途入社を含む）を参考に推定。'
         'Intermediateまで残業代あり（標準は月20時間）、Specialist以降はなし。\n業績インセンティブ・株式報酬は含まない。'
         'IBJ：前回と同じ推定（賞与年1か月）。2027年の物価基準。60歳は継続雇用で約2割減と仮定。',
         fontsize=7.2, color=INK2, linespacing=1.55)

fig.subplots_adjust(left=0.1, right=0.97, top=0.915, bottom=0.135)
out = '/home/user/koyo1016/lifeplan/給料カーブ_HPE×IBJ.png'
fig.savefig(out, facecolor=SURF)
print(out)
