from ages import interp, person_net, F
# OpenMoney（2026/5取得）を反映したHPE新卒SEの額面（万円）
HPE2 = {
 'cons': {22:362, 23:500, 25:530, 27:560, 28:690, 30:710, 35:740, 40:770, 45:790, 50:790, 55:770, 60:620},
 'std':  {22:362, 23:525, 24:541, 25:557, 26:700, 28:720, 30:745, 32:770, 33:850, 35:880, 40:950, 45:980, 50:1000, 55:980, 60:780},
 'good': {22:362, 23:530, 24:690, 25:700, 28:790, 29:830, 30:850, 35:950, 39:1000, 40:1290, 45:1350, 50:1400, 55:1400, 60:1100},
}
def val(case, a):
    tab = HPE2[case]
    if a in tab: return tab[a]
    return interp(tab, a)
if __name__ == '__main__':
    for a in [22,23,25,26,28,30,33,35,40,45,50,55,60]:
        v = [round(val(c,a)) for c in ('cons','std','good')]
        th = round(person_net(val('std',a),'HPE',a)['take']/1e4) if a>22 else 306
        print(a, v, th)
