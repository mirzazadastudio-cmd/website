from pathlib import Path
from PIL import Image,ImageOps,ImageCms
import json,hashlib,io
ROOT=Path(r'E:\Mirzazada Studio WEB\Mirzazadastudio.com')
entries=[
('hotel-project','Hotel Project','Hotel Project',['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg'],['Large Buildings','Exterior'],'Hospitality · Architectural visualization','Curved balconies, warm materials and a sheltered entrance define this hotel. Five perspectives explore the building, arrival canopy, landscaped edges and poolside spaces.'),
('seaside-hotel-building','Seaside Hotel Building','Seaside hotel building',['1.jpg','2.jpg','15.jpg','4.jpg','17.jpg'],['Large Buildings','Exterior','Interior','Outdoor Systems'],'Seaside hospitality · Architecture & terraces','A glazed hotel building meets the waterfront with sheltered dining terraces. Daylight and evening views connect the exterior, sea-facing promenade and planted spaces beneath the adjustable roof.'),
('restoration-building-3','Restoration — Building 3','Restoration/Bina 3',['1.jpg','2.jpg','4.jpg','5.jpg','6.jpg'],['Restoration','Residential','Exterior','Street'],'Building restoration · Façade study','A residential façade study with pale stone, warm panels and recessed balconies. Street-level views and a front elevation explore the renewed frontage, entrances and relationship to the surrounding pavement.'),
('san-francisco-rooftop','San Francisco Rooftop','Sanfrancisco rooftop',['4.jpg','1.jpg'],['Outdoor Systems','Exterior','Residential'],'Rooftop extension · Outdoor living','A glazed rooftop enclosure adds a sheltered living space above a traditional street façade. Aerial and street views show its lightweight structure and relationship to the existing building.')
]
media={};projects=[];manifest=[]
out=Path('public/images');stamp='2026-09-24T00:00:00.000Z'
# Visually checked full frames and lower strips: these 17 sources have no footer logos.
# For future imports, specify the smallest bottom crop removing a visible footer logo.
bottom_crops={}
for slug,title,folder,names,cats,kind,desc in entries:
 urls=[]
 for index,name in enumerate(names,1):
  source=ROOT/folder/name
  with Image.open(source) as original:
   im=ImageOps.exif_transpose(original)
   profile=original.info.get('icc_profile')
   if profile:
    try:im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(profile)),ImageCms.createProfile('sRGB'),outputMode='RGB')
    except Exception:im=im.convert('RGB')
   else:im=im.convert('RGB')
   crop=bottom_crops.get(folder+'/'+name,0)
   if crop:im=im.crop((0,0,im.width,im.height-crop))
   base=im.copy();base.thumbnail((2400,2400),Image.Resampling.LANCZOS)
   filename=slug+'-'+str(index)+'.webp';dest=out/filename;base.save(dest,'WEBP',quality=89,method=4)
   url='/images/'+filename;urls.append(url);variants=[]
   for size in (640,1280):
    variant=im.copy();variant.thumbnail((size,size),Image.Resampling.LANCZOS)
    vname=slug+'-'+str(index)+'-responsive-'+str(variant.width)+'.webp';variant.save(out/vname,'WEBP',quality=86,method=4)
    variants.append(dict(src='/images/'+vname,width=variant.width,height=variant.height))
   variants.append(dict(src=url,width=base.width,height=base.height))
   media[url]=dict(id='import-'+hashlib.sha256(url.encode()).hexdigest()[:16],src=url,name=filename,type='image/webp',size=dest.stat().st_size,checksum=hashlib.sha256(dest.read_bytes()).hexdigest(),width=base.width,height=base.height,variants=variants,createdAt=stamp,privateOriginal=False)
   manifest.append(dict(project=slug,source=str(source),output=str(dest),sourceChecksum=hashlib.sha256(source.read_bytes()).hexdigest(),bottomCropPixels=crop))
 projects.append(dict(id='project-'+slug,slug=slug,title=title,status='published',displayPermission='confirmed',category=cats[0],categories=cats,topics=['Exterior views']+(['Interior views','Bioclimatic roofs'] if slug=='seaside-hotel-building' else ['Glass systems'] if slug=='san-francisco-rooftop' else []),type=kind,description=desc,images=urls,coverImage=urls[0],heroImage=urls[0],coverFrame=dict(x=50,y=50,zoom=1),createdAt=stamp,updatedAt=stamp,publishedAt=stamp,location='San Francisco' if slug=='san-francisco-rooftop' else '',year='',client='',credit='',services=[],seoTitle='',seoDescription=''))
video=dict(id='xankendi',title='Xankəndi',description='An architectural film following the building and its street setting.',kind='Architecture',src='/animations/xankendi.mp4',poster='/animations/xankendi.webp',duration=15)
Path('lib/portfolio-september-2026.json').write_text(json.dumps(dict(projects=projects,video=video,media=media),ensure_ascii=False,indent=2),encoding='utf-8')
Path('artifacts/portfolio-september-2026.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared',len(projects),'projects,',len(media),'images with responsive variants.')
