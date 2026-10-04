import sys, subprocess, os, pymupdf as fitz, glob
pptx = sys.argv[1]; prefix = sys.argv[2] if len(sys.argv)>2 else 'r'
SK='/root/.claude/skills/synced/ee65c8fa-e767-444a-a499-4a00b487db95_20f6356d-9e06-4aef-a328-75fa4101720d/pptx'
subprocess.run(['python3', SK+'/scripts/office/soffice.py','--headless','--convert-to','pdf','--outdir',os.path.dirname(os.path.abspath(pptx)),os.path.abspath(pptx)], check=True, capture_output=True)
pdf = os.path.splitext(pptx)[0]+'.pdf'
doc = fitz.open(pdf)
os.makedirs('img', exist_ok=True)
for f in glob.glob(f'img/{prefix}-*.png'): os.remove(f)
for i,p in enumerate(doc):
    p.get_pixmap(dpi=int(os.environ.get('DPI','110'))).save(f'img/{prefix}-{i+1:02d}.png')
print(len(doc),'pages')
