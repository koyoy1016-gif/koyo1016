from model import *
import json
ages=[22,23,25,28,30,35,40,45,50,55,60]
# 額面(万円, 2027年価値, 業績賞与・RSU除く)
A={'cons':{22:362,23:480,25:495,28:520,30:560,35:620,40:660,45:680,50:680,55:660,60:520},
   'std': {22:362,23:490,25:530,28:610,30:680,35:800,40:880,45:920,50:950,55:920,60:720},
   'good':{22:362,23:500,25:590,28:720,30:820,35:1000,40:1150,45:1250,50:1300,55:1300,60:1000}}
B={'cons':{**{a:A['cons'][a] for a in (22,23,25)},28:560,30:590,35:650,40:690,45:700,50:700,55:680,60:520},
   'std': {**{a:A['std'][a] for a in (22,23,25)},28:715,30:760,35:900,40:980,45:1020,50:1050,55:1000,60:760},
   'good':{**{a:A['good'][a] for a in (22,23,25)},28:850,30:920,35:1150,40:1350,45:1450,50:1500,55:1450,60:1100}}
F={'cons':{22:306,23:318,25:330,28:360,30:380,35:400,40:420,45:420,50:420,55:410,60:340},
   'std': {22:306,23:330,25:360,28:410,30:450,35:500,40:540,45:560,50:560,55:550,60:450},
   'good':{22:306,23:345,25:420,28:520,30:580,35:700,40:800,45:850,50:850,55:830,60:650}}
def interp(tab,a):
    ks=sorted(tab)
    for i in range(len(ks)-1):
        if ks[i]<=a<=ks[i+1]:
            t=(a-ks[i])/(ks[i+1]-ks[i]); return tab[ks[i]]+(tab[ks[i+1]]-tab[ks[i]])*t
    return tab[ks[-1]]
def person_net(gross_man, kind, age):
    g=gross_man*1e4
    if kind=='HPE': m=g/18.84; ot=0.07*m if age<35 else 0; m=(g-ot*12)/18; b=6*m
    elif kind=='NEW': m=g/15; ot=0; b=3*m    # 転職先: 月給×12 + 賞与3か月相当 (仮定)
    else: m=g/13; ot=0; b=m                 # IBJ: 月給×12 + 賞与1か月 (仮定)
    return net(m,b,2,age,2028,extra_ot=ot)
def rent_for(age, plan):
    if plan=='keep': return 11
    return 11 if age<30 else 14
def household(age, mgross, fgross, mkind, plan='up'):
    rm=person_net(mgross,mkind,age); rf=person_net(fgross,'IBJ',age)
    take=(rm['take']+rf['take'])/1e4
    norm=(rm['m_take']+rf['m_take'])/1e4
    rent=rent_for(age,plan)
    base = 13.5+9.5 if age<30 else (15+11 if age<40 else 16+12)
    surplus = take - (rent+base)*12
    yutori = max(3*12, 0.4*surplus); save = surplus-yutori
    return dict(mg=mgross,fg=fgross,mt=rm['take']/1e4,ft=rf['take']/1e4,mm=rm['m_take']/1e4,fm=rf['m_take']/1e4,
                take=take,norm=norm,avg=take/12,rent=rent,base=base,yutori=yutori/12,save=save)
def path(scn, case, plan='up'):
    M = A if scn=='A' else B
    assets=0; out={}
    for age in range(22,61):
        mg=interp(M[case],age); fg=interp(F[case],age)
        kind='HPE' if (scn=='A' or age<28) else 'NEW'
        if age==22:
            take=(306+261) if case!='x' else 0
            save=take-(8.5+8)*12-10; h=dict(mg=mg,fg=fg,take=take,save=save,norm=44.1,avg=take/12,rent=0,base=16.5,yutori=0,mt=306,ft=261,mm=23.0,fm=21.1)
        else:
            h=household(age,mg,fg,kind,plan)
        one = 0
        if age==23: one=135     # 同棲初期費用(標準)
        if age==24: one=180     # 結婚式 標準型155+結婚指輪25
        if plan=='up' and age==30: one+=90  # 住み替え初期費用
        assets+=h['save']-one
        h['assets']=assets; h['one']=one
        out[age]=h
    return out
if __name__=='__main__':
    res={}
    for scn in 'AB':
        for case in ['cons','std','good']:
            p=path(scn,case)
            res[f'{scn}_{case}']=p
            print(scn,case)
            for a in ages:
                h=p[a]
                print(f" {a}: M{h['mg']:.0f}/{h['mt']:.0f} F{h['fg']:.0f}/{h['ft']:.0f} HH{h['mg']+h['fg']:.0f}/{h['take']:.0f} norm{h['norm']:.1f} avg{h['avg']:.1f} rent{h['rent']} base{h['base']} yutori{h['yutori']:.1f} save{h['save']:.0f} assets{h['assets']:.0f}")
    p=path('A','std','keep'); print('keep11', {a:round(p[a]['assets']) for a in ages})
    json.dump({k:{a:v for a,v in p.items()} for k,p in res.items()}, open('ages.json','w'))
