import json, collections, csv
idx = json.load(open('out/ALL_index.json'))
rows = json.load(open('out/mapping.json'))
CH = json.load(open('chapters.json'))
chname = {int(k): v['n'] for k, v in CH.items()}
pm = {p['n']: p for p in idx}
byorig = collections.defaultdict(list)
for p in idx:
    for o in p.get('orig') or []: byorig[int(o)].append(p)
out = ['# 元資料と再構築版のページ対応表', '',
       '元資料：会社_ITインフラ_AI基盤_統合ガイド(2).pptx（159ページ）／再構築版：it-infra-ai-self-study-guide.pptx（表紙名「ITインフラ・AI基盤 自習ガイド」）（%dページ）' % len(idx), '',
       '「新しいページ」は、元資料のそのページの内容を使っているページです。1つの元ページの内容を、説明の順番に合わせて複数の章へ分けている場合があります。', '',
       '| 元のページ | 元のページの見出し | 新しいページ | 主に扱う章 |', '|---|---|---|---|']
csvrows = [['元のページ', '元のページの見出し', '新しいページ', '主に扱う章']]
for n, t, r in rows:
    chs = collections.Counter(p['ch'] for p in byorig[n])
    cs = '、'.join(chname.get(c, str(c)) for c, _ in sorted(chs.items(), key=lambda x: -x[1])[:3])
    t2 = t.replace('|', '／')[:40]
    out.append(f'| p.{n} | {t2} | {r} | {cs} |'); csvrows.append([n, t, r, cs])
open('out/MAPPING.md', 'w').write('\n'.join(out) + '\n')
with open('out/MAPPING.csv', 'w', newline='', encoding='utf-8-sig') as f: csv.writer(f).writerows(csvrows)
ch = ['# 再構築版の主な変更点', '', open('CHANGES_base.md').read(), '', '## 元資料の記述を直した箇所（fix）', '', '| 新しいページ | 見出し | 直した内容 |', '|---|---|---|']
for p in idx:
    if p.get('fix') and not p['id'].endswith('-ans'):
        ch.append(f"| p.{p['n']} | {p['title']} | {p['fix'].replace('|', '／')} |")
open('out/CHANGES.md', 'w').write('\n'.join(ch) + '\n')
print('ok', len(rows))
