import pymupdf as fitz, json, sys
doc=fitz.open('out/ALL.pdf'); idx=json.load(open('out/ALL_index.json'))
H=doc[0].rect.height; W=doc[0].rect.width
res=[]
for pn,p in enumerate(doc):
    lines=[]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            t=''.join(s['text'] for s in l['spans']).strip()
            if t: lines.append((fitz.Rect(l['bbox']),t,b['number']))
    iss=[]
    for r,t,bn in lines:
        if r.y1>H-2 or r.x1>W+1: iss.append(('OUT',t[:30]))
    for i in range(len(lines)):
        for j in range(i+1,len(lines)):
            a,b=lines[i][0],lines[j][0]
            if lines[i][2]==lines[j][2]: continue
            x=a&b
            if x.is_empty: continue
            if x.width*x.height>0.25*min(a.width*a.height,b.width*b.height) and x.height>3:
                iss.append(('OVL',lines[i][1][:25]+' / '+lines[j][1][:25]))
    if iss: res.append((pn+1,idx[pn]['id'],iss[:3]))
for r in res: print(r)
print(len(res),'pages with issues')
