from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
root=Path(r'E:\Mirzazada Studio WEB\Portfolio\Renders')
folders=['Baku White City','Marina Village Sea Breeze','491 Central Ave/Exterior','491 Central Ave/Logosuz','Projects/Baverly Hills','Projects/Perth City','Projects/Portobello/Pergola','Projects/SIlver Diner','Projects/Nights','Baku Abadliq/Mothercare/Bina 3','Projects/Building','Projects/Pool Model']
items=[]
for folder in folders:
 files=sorted([p for p in (root/folder).iterdir() if p.suffix.lower() in ['.jpg','.png']],key=lambda p:p.name)
 for p in files[:3]: items.append((folder,p))
sheet=Image.new('RGB',(1200, len(items)//4*225),'#e5e5e3')
d=ImageDraw.Draw(sheet)
for i,(folder,p) in enumerate(items):
 im=Image.open(p).convert('RGB'); im=ImageOps.fit(im,(290,185))
 x=(i%4)*300;y=(i//4)*225
 sheet.paste(im,(x,y));d.text((x+5,y+188),folder[-37:],fill='black');d.text((x+5,y+203),p.name,fill='black')
Path('artifacts').mkdir(exist_ok=True)
sheet.save('artifacts/contact-sheet.jpg')
