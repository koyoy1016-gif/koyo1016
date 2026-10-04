import json, re, collections
idx = json.load(open('out/ALL_index.json'))
orig = open('src/orig3.txt').read()
titles = {}
for m in re.finditer(r'^===== (\d+) =====\n(?:.*\n)?(?:.*\n)?(.*)\n', orig, re.M):
    pass
# 元資料のタイトル：各ページの4行目付近（章名・区分の次）
parts = re.split(r'^===== (\d+) =====$', orig, flags=re.M)
for i in range(1, len(parts), 2):
    n = int(parts[i]); lines = [l for l in parts[i+1].split('\n') if l.strip()]
    t = lines[2] if len(lines) > 2 else (lines[0] if lines else '')
    if n == 1: t = '目次・地図・色と形の約束'
    titles[n] = t
m = collections.defaultdict(list)
for p in idx:
    for o in p.get('orig') or []:
        m[int(o)].append(p['n'])
def rng(a):
    a = sorted(set(a)); out = []; s = a[0]; pr = a[0]
    for x in a[1:]:
        if x == pr + 1: pr = x; continue
        out.append(f'{s}' if s == pr else f'{s}–{pr}'); s = pr = x
    out.append(f'{s}' if s == pr else f'{s}–{pr}'); return '、'.join(out)
rows = []
for n in range(1, 160):
    rows.append((n, titles.get(n, ''), rng(m[n]) if m[n] else '（未対応）'))
json.dump(rows, open('out/mapping.json', 'w'), ensure_ascii=False)
missing = [r[0] for r in rows if r[2] == '（未対応）']
print('未対応の元ページ:', missing)
