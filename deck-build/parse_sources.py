import re, json
t = open('/root/.claude/uploads/a6b71c9c-9250-5393-acfd-c0ce241855e4/f13836f7-ai-infrastructure-hpe-study-guide.md', encoding='utf-8').read()
part = t.split('# 出典一覧')[1]
src = {}
order = []
cur = None
for line in part.splitlines():
    m = re.match(r'## \[([BN]\d+)\]\s*(.*)', line)
    if m:
        cur = m.group(1); src[cur] = {'t': m.group(2).strip(), 'u': []}; order.append(cur); continue
    if line.startswith('## '):
        cur = None
    if cur and line.startswith('- http'):
        src[cur]['u'].append(line[2:].strip())
json.dump({'order': order, 'src': src}, open('sources.json', 'w'), ensure_ascii=False, indent=1)
print(len(order), 'sources;', sum(len(v['u']) for v in src.values()), 'urls')
