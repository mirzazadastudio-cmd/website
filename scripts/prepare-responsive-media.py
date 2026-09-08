from pathlib import Path
from PIL import Image,ImageOps,ImageCms
import hashlib,json,csv,io
ROOT=Path.cwd();renders=Path('E:/Mirzazada Studio WEB/Portfolio/Renders');out=ROOT/'public/images';report_dir=ROOT/'docs/media-report';report_dir.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'artifacts/catalog-manifest.json').read_text(encoding='utf-8-sig'))
def read(path):
 with Image.open(path) as im:return ImageOps.exif_transpose(im).convert('RGB')
def dhash(im):
 pixels=list(im.convert('L').resize((17,16)).getdata());n=0
 for row in range(16):
  for col in range(16):n=(n<<1)|(pixels[row*17+col]>pixels[row*17+col+1])
 return n
inventory=[];by_pixels={}
for path in sorted(renders.rglob('*')):
 if path.suffix.lower() not in ('.jpg','.jpeg','.png','.webp'):continue
 try:
  im=read(path);item={'path':str(path),'width':im.width,'height':im.height,'bytes':path.stat().st_size,'checksum':hashlib.sha256(path.read_bytes()).hexdigest(),'pixelHash':hashlib.sha256(im.tobytes()).hexdigest(),'dhash':dhash(im)};inventory.append(item);by_pixels.setdefault(item['pixelHash'],[]).append(item);im.close()
 except Exception as error:print('Skipped',path.name,str(error),flush=True)
print('Inventory:',len(inventory),'files',flush=True)
match_rows=[];confirmed_sources={};used=set()
for item in manifest:
 source=Path(item['source']);im=read(source);pixel=hashlib.sha256(im.tobytes()).hexdigest();candidates=by_pixels.get(pixel,[])
 if candidates:
  match=next((candidate for candidate in candidates if Path(candidate['path'])==source),candidates[0]);status='confirmed_exact';selected=match['path'];used.add(selected);confirmed_sources['/'+str(item['output']).replace('\\','/').removeprefix('public/')]=Path(selected);distance=0
 else:
  ratio=im.width/im.height;fingerprint=dhash(im);possible=[((fingerprint^candidate['dhash']).bit_count(),candidate) for candidate in inventory if abs(candidate['width']/candidate['height']-ratio)<.045]
  possible.sort(key=lambda pair:pair[0]);best=possible[0] if possible else None
  status='probable_review' if best and best[0]<=28 else 'unmatched';selected=best[1]['path'] if status=='probable_review' else '';distance=best[0] if best else ''
 match_rows.append({'project':item['project'],'current_source':str(source),'display':item['output'],'status':status,'candidate_original':selected,'distance':distance});im.close()
with (report_dir/'matches.csv').open('w',encoding='utf-8-sig',newline='') as file:writer=csv.DictWriter(file,fieldnames=match_rows[0].keys());writer.writeheader();writer.writerows(match_rows)
(report_dir/'inventory.json').write_text(json.dumps([{k:v for k,v in item.items() if k!='dhash'} for item in inventory],ensure_ascii=False,indent=2),encoding='utf-8')
duplicates=[group for group in by_pixels.values() if len(group)>1]
(report_dir/'duplicates.json').write_text(json.dumps([[item['path'] for item in group] for group in duplicates],ensure_ascii=False,indent=2),encoding='utf-8')
(report_dir/'unused-originals.json').write_text(json.dumps([item['path'] for item in inventory if item['path'] not in used],ensure_ascii=False,indent=2),encoding='utf-8')
near=[]
for i,a in enumerate(inventory):
 for b in inventory[i+1:]:
  if a['pixelHash']!=b['pixelHash'] and abs(a['width']/a['height']-b['width']/b['height'])<.025 and (a['dhash']^b['dhash']).bit_count()<=5:near.append({'first':a['path'],'second':b['path'],'distance':(a['dhash']^b['dhash']).bit_count()})
(report_dir/'near-duplicates.json').write_text(json.dumps(near,ensure_ascii=False,indent=2),encoding='utf-8')
# Reuse only exact matches. Probable matches never alter the public portfolio.
metadata={};sources=list(out.glob('*.webp'))
for index,path in enumerate(sources):
 if '-responsive-' in path.stem:continue
 url='/images/'+path.name;source=confirmed_sources.get(url,path)
 with Image.open(source) as original:
  im=ImageOps.exif_transpose(original)
  profile=original.info.get('icc_profile')
  if profile:
   try:im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(profile)),ImageCms.createProfile('sRGB'),outputMode='RGB')
   except Exception:im=im.convert('RGB')
  else:im=im.convert('RGB')
  variants=[]
  for longest in sorted(set(min(size,max(im.size)) for size in (640,1280,2400))):
   image=im.copy();image.thumbnail((longest,longest),Image.Resampling.LANCZOS);dest=out/(path.stem+'-responsive-'+str(image.width)+'.webp');image.save(dest,'WEBP',quality=89,method=4);variants.append({'src':'/images/'+dest.name,'width':image.width,'height':image.height})
  metadata[url]={'id':'legacy-'+hashlib.sha256(url.encode()).hexdigest()[:16],'src':url,'name':path.name,'type':'image/webp','size':path.stat().st_size,'checksum':hashlib.sha256(path.read_bytes()).hexdigest(),'width':im.width,'height':im.height,'variants':variants,'createdAt':'2026-09-08T00:00:00.000Z','privateOriginal':False}
 if index%25==0:print('Variants:',index+1,'/',len(sources),flush=True)
(ROOT/'lib/image-variants.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
counts={status:sum(row['status']==status for row in match_rows) for status in ('confirmed_exact','probable_review','unmatched')}
summary=f"# Original render matching report\n\nInventory: {len(inventory)} original image files. Portfolio: {len(match_rows)} renders.\n\n- Confirmed exact pixel matches: {counts['confirmed_exact']}\n- Probable matches requiring visual confirmation: {counts['probable_review']}\n- Unmatched portfolio images: {counts['unmatched']}\n- Exact duplicate groups: {len(duplicates)}\n- Near-duplicate pairs for review: {len(near)}\n- Unused original files: {len(inventory)-len(used)}\n\nOnly confirmed exact sources were used for sharper responsive derivatives. Project order, URLs and crop metadata remain unchanged. Probable matches were not substituted. No original or unused file was deleted.\n\nThe current Renders folder has been inventoried. Additional originals mentioned in the master brief can be matched using this same report. Legacy originals still require import into the hosted private archive at the launch migration; newly uploaded originals use the private archive automatically.\n"
(report_dir/'README.md').write_text(summary,encoding='utf-8');print(counts,flush=True)
