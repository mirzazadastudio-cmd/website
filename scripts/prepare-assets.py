from PIL import Image, ImageOps
from pathlib import Path
import json
root=Path(r'E:\Mirzazada Studio WEB\Portfolio\Renders')
out=Path('public/images');out.mkdir(parents=True,exist_ok=True)
sets=[
 ('white-city','Baku White City',['1.jpg','11.jpg','4.jpg','9.jpg']),
 ('marina-village','Marina Village Sea Breeze',['3.jpg','2.jpg','4.jpg','6.jpg']),
 ('central-ave','491 Central Ave/Exterior',['1.jpg','10.jpg','11.jpg','3.jpg']),
 ('central-interiors','491 Central Ave/Logosuz',['0_zemin 1.jpg','0_zemin 2.jpg','0_zemin 3.jpg','1_1.jpg']),
 ('beverly-hills','Projects/Baverly Hills',['Beverly Hills Hotel 2.jpg','Beverly Hills Hote 3.jpg','Beverly Hills Hotel 4.jpg']),
 ('portobello','Projects/Portobello/Pergola',['10.jpg','1.jpg','13.jpg','3.jpg']),
 ('silver-diner','Projects/SIlver Diner',['1.jpg','14.jpg','2.jpg']),
 ('urban-facade','Baku Abadliq/Mothercare/Bina 3',['1.jpg','2.jpg','3.jpg']),
 ('residential','Projects/Building',['1.jpg','10.jpg','11.jpg']),
 ('pool-pavilion','Projects/Pool Model',['2.jpg','1.jpg','3.jpg']),
 ('rooftop','Projects/Nights',['2.jpg','3.jpg','4.jpg'])
]
manifest=[]
for slug,folder,names in sets:
 for i,name in enumerate(names,1):
  src=root/folder/name
  image=ImageOps.exif_transpose(Image.open(src)).convert('RGB')
  image.thumbnail((1920,1440))
  target=out/f'{slug}-{i}.webp'
  image.save(target,'WEBP',quality=83,method=4)
  if i==1:
   image.thumbnail((900,720));image.save(out/f'{slug}-thumb.webp','WEBP',quality=80,method=4)
  manifest.append({'source':str(src.relative_to(root)),'output':str(target),'bytes':target.stat().st_size})
  print(target,flush=True)
Path('artifacts/assets-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
