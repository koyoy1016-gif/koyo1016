import sys
from PIL import Image
prefix=sys.argv[1]; tag=sys.argv[2]; cols=int(sys.argv[3]); nums=[int(x) for x in sys.argv[4:]]
import os
def f(i):
    for fmt in (f'img/{prefix}-{i:02d}.png', f'img/{prefix}-{i:03d}.png'):
        if os.path.exists(fmt): return fmt
ims=[Image.open(f(i)) for i in nums]
w,h=ims[0].size
rows=(len(ims)+cols-1)//cols
M=Image.new('RGB',(cols*w+(cols-1)*8, rows*h+(rows-1)*8),(120,120,120))
for k,im in enumerate(ims): M.paste(im,((k%cols)*(w+8),(k//cols)*(h+8)))
M.thumbnail((2000,2400)); M.save(f'img/{tag}.png'); print(M.size)
