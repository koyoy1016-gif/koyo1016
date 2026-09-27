# 単位: 円。基準年=2027年の購買力（実質）。
KENPO=0.0504   # 協会けんぽ東京R8: (9.85%+子育て支援金0.23%)/2
KAIGO=0.0081   # 1.62%/2 (40-64歳)
KOUNEN=0.0915
KOYOU=0.005
def si_annual(monthly, bonus_total, nbonus, age, commute=13000, cap_m=650000):
    std = min(monthly+commute, cap_m)
    k = KENPO + (KAIGO if age>=40 else 0)
    per_b = bonus_total/nbonus if nbonus else 0
    si = std*12*(KOUNEN+k) + (monthly+commute)*12*KOYOU
    si += nbonus*(min(per_b,1500000)*KOUNEN + per_b*k) + bonus_total*KOYOU
    return si
def kyuyo_kojo(g):
    if g<=1900000: return 690000
    if g<=3600000: return g*0.3+80000
    if g<=6600000: return g*0.2+440000
    if g<=8500000: return g*0.1+1100000
    return 1950000
def itax(taxable):
    br=[(1950000,.05,0),(3300000,.10,97500),(6950000,.20,427500),(9000000,.23,636000),(18000000,.33,1536000),(40000000,.40,2796000),(9e18,.45,4796000)]
    t=max(0,taxable)//1000*1000
    for lim,r,d in br:
        if t<=lim: return max(0,(t*r-d))*1.021
def taxes(gross, si, year=2028):
    shotoku = gross-kyuyo_kojo(gross)
    kiso = 620000
    if year<=2027:
        kiso += 420000 if shotoku<=4890000 else (50000 if shotoku<=6550000 else 0)
    it = itax(shotoku-si-kiso)
    rt = max(0,(shotoku-si-430000))//1000*1000*0.10 - 2500 + 5000
    return it, max(rt,5000)
def net(monthly, bonus_total, nbonus, age, year=2028, extra_ot=0):
    gross = monthly*12 + bonus_total + extra_ot*12
    si = si_annual(monthly+extra_ot, bonus_total, nbonus, age)
    it, rt = taxes(gross, si, year)
    take = gross-si-it-rt
    # 通常月: 月給 - 月SI - 源泉(按分) - 住民税/12
    k = KENPO + (KAIGO if age>=40 else 0)
    m_si = min(monthly+extra_ot+13000,650000)*(KOUNEN+k)+(monthly+extra_ot+13000)*KOYOU
    share = (monthly+extra_ot)*12/gross
    m_take = monthly+extra_ot - m_si - it*share/12 - rt/12
    b_take = take - m_take*12
    return dict(gross=gross, si=si, it=it, rt=rt, take=take, m_take=m_take, b_take=b_take)
