from pathlib import Path
from PIL import Image, ImageOps
import json,hashlib
ROOT=Path(r'E:\Mirzazada Studio WEB\Portfolio\Renders')
PDF=Path('artifacts/pdf-review')
OUT=Path('public/images'); OUT.mkdir(exist_ok=True)
entries=[]
def files(folder,names):return [ROOT/folder/name for name in names]
def pdf(page,numbers):return [PDF/f'p{page:02}-{n:02}.jpg' for n in numbers]
def add(slug,title,categories,kind,description,sources,hero=0):
 entries.append(dict(slug=slug,title=title,category=categories[0],categories=categories,type=kind,description=description,sources=sources,hero=hero))
add('skyline-residences','Skyline Residences',['Residential','Exterior','Building'],'Residential complex · Exterior visualization','A multi-building residential ensemble with tall glazed bays, dark vertical frames and landscaped entrances. The views move from the overall massing to the sheltered street edge and arrival spaces.',pdf(1,[1,2,3,4,5]))
add('garden-residences','Garden Residences',['Residential','Exterior','Building'],'Residential complex · Landscape & architecture','Layered balconies and a light structural grid give these residences a calm, open character. Garden paths, planted courtyards and illuminated ground-floor spaces connect the buildings to everyday life.',pdf(3,[2,4,1,3]))
add('courtyard-quarter','Courtyard Quarter',['Residential','Exterior','Street'],'Residential masterplan · Urban visualization','A connected residential quarter organized around shared courtyards and pedestrian space. Aerial and street-level views show the relationship between the blocks, their stone façades and the surrounding landscape.',pdf(4,[3,2,1,4]))
add('arcade-residences','Arcade Residences',['Residential','Exterior','Building'],'Residential building · Exterior visualization','Warm stone, arched openings and softly lit balconies define this residential study. The render series explores the street façade, landscaped forecourt and the detail of the main entrance.',pdf(2,[1,2,3,4]))
add('white-city','Baku White City',['Residential','Exterior','Street'],'Residential quarter · Baku','Classical façades frame a generous landscaped courtyard in Baku White City. Street views, aerial perspectives and evening scenes connect the scale of the residential block with the gardens and shared spaces within.',files('Baku White City',['16.jpg','1.jpg','2.jpg','4.jpg','17.jpg','19.jpg','8.jpg','11.jpg','12.jpg']))
add('perth-waterfront','Perth Waterfront',['Residential','Building','Exterior'],'Waterfront masterplan · Urban visualization','A waterfront study bringing towers, lower-rise buildings and public space into one urban composition. Golden-hour views describe the skyline, waterside promenade and the changing scale of the development.',files('Projects/Perth City/Renders',['1.png','2.png','3.png','4.png']))
add('marina-village','Marina Village, Sea Breeze',['Residential','Exterior','Street'],'Waterfront quarter · Architectural visualization','Arcaded façades, a clock tower and planted public spaces shape Marina Village at Sea Breeze. The series follows the waterfront, pedestrian streets and courtyards through a coherent architectural language.',files('Marina Village Sea Breeze',['3.jpg','2.jpg','4.jpg','5.jpg','7.jpg','8.jpg','6.jpg']))
add('komfor-residences','Komfor MTK',['Residential','Building','Exterior'],'Residential buildings · Baku façade study','A study of a large residential frontage at the 3rd Microdistrict roundabout. Light façades, restrained yellow accents and a continuous ground-floor edge establish the rhythm of the street.',files('Baku Abadliq/3mkr Dairesi/Komfor MTK - 1K',['1.jpg','2.jpg','3.jpg','4.jpg']))
add('tebib-residences','Tebib MTK',['Residential','Building','Exterior'],'Residential building · Baku façade study','A curved residential block considered from its surrounding roads and approaches. The visualization studies façade proportion, the base of the building and its relationship to the changing street level.',files('Baku Abadliq/3mkr Dairesi/Tebib MTK - 1D',['1.jpg','2.jpg','3.jpg','4.jpg']))
qish=ROOT/'Baku Abadliq/Qish Parki Bina'
q1=next(p for p in qish.glob('Bina 1*') if p.is_dir());q2=next(p for p in qish.glob('Bina 2*') if p.is_dir())
add('winter-park-tower','Winter Park — Narimanov',['Residential','Building','Exterior'],'Residential tower · N. Narimanov 277','A slender residential tower framed by open sky and mature trees. Exterior and aerial views study its vertical proportions, material contrast and position within the surrounding city.',[q1/n for n in ['1.jpg','3.jpg','5.jpg','10.jpg']])
add('winter-park-corner','Winter Park — M. Aliyev',['Residential','Building','Exterior'],'Residential tower · M. Aliyev 45','Rounded balconies and a pale façade soften the profile of this residential tower. Views from the park, street and above explore the entrance, roofline and the building’s urban setting.',[q2/n for n in ['1.jpg','3.jpg','5.jpg','10.jpg']])
add('terrace-hotel','Terrace Hotel Study',['Building','Exterior','Interior'],'Hospitality building · Architectural visualization','A hotel study organized around planted terraces and shared outdoor space. Building-scale views are paired with dining terraces, glass canopies and an aerial view of the pool and surrounding streets.',pdf(22,[1,4,2,3]))
add('silver-diner','Silver Diner',['Building','Exterior','Interior','Street'],'Commercial frontage · Architectural visualization','A glazed commercial frontage set beneath a residential building. Day and evening perspectives explore the street corner, projecting canopy and an interior dining space overlooking the city.',pdf(20,[1,2,3,4]))
add('urban-corner','Urban Corner Building',['Building','Exterior','Interior','Street'],'Mixed-use building · Architectural visualization','A compact corner building with a sheltered ground floor and terraces above. Street and aerial perspectives are complemented by the outdoor dining space and the connection between interior and terrace.',pdf(21,[5,4,2,3,1]))
add('brick-corner','Brick Corner Terrace',['Building','Street','Exterior','Interior'],'Urban building · Hospitality terrace','A brick corner building with a contemporary glazed terrace at street level. Exterior, aerial and interior views explore the junction of existing masonry, lightweight structure and outdoor dining.',pdf(23,[1,2,3,4]))
add('jonathan','Jonathan — Urban Infill',['Building','Street','Exterior'],'Urban infill · Façade visualization','A narrow glazed insertion sits between brick buildings along an established city street. A red entrance, reflected façades and evening light give this compact intervention its identity.',files('Projects/Jonathan',['4.jpg','5.jpg','6.jpg','7.jpg']))
add('residential','Residential Perspectives',['Residential','Building','Exterior'],'Residential building · Exterior visualization','A compact residential building explored from the street, entrance and above. Pale façades, darker vertical elements and landscaped edges establish a quiet setting, with evening views adding another reading of the same design.',files('Projects/Building',['1.jpg','10.jpg','11.jpg','7.jpg','16.jpg','19.jpg']))
add('urban-facade','Baku — Street Façades',['Street','Building','Exterior'],'Urban renewal · Mothercare streetscape','Two neighboring façades from the Baku Abadliq collection, presented as one streetscape study. The views examine balcony rhythm, ground-floor openings, planting and the relationship between the buildings and the pavement.',files('Baku Abadliq/Mothercare/Bina 3',['1.jpg','3.jpg','4.jpg'])+files('Baku Abadliq/Mothercare/Bina 4',['1.jpg','3.jpg','4.jpg']))
add('central-ave','491 Central Avenue',['Residential','Exterior','Interior'],'Residential · Exterior & interior visualization','A complete residential visualization series, from gabled rooflines and landscaped approaches to the living room, kitchen and dining space. Exterior and interior views are collected together to show one project at different scales.',files('491 Central Ave',['Exterior - Final 2.jpg'])+files('491 Central Ave/Exterior',['1.jpg','10.jpg','3.jpg'])+files('491 Central Ave/Logosuz',['1_3.jpg','0_zemin 1.jpg','0_zemin 2.jpg','0_zemin 3.jpg','2_6.jpg','6_52.jpg']))
add('garden-cafe','Garden Café',['Building','Exterior'],'Café pavilion · Architectural visualization','A freestanding café pavilion surrounded by terraces and planting. Deep openings, pale stone and a planted roof are explored in daytime and evening views, with attention to the spaces for gathering around the building.',pdf(5,[3,4,1,2]))
add('beverly-hills','Beverly Hills Hotel',['Exterior','Interior'],'Hospitality · Terrace visualization','Layered timber, filtered daylight and greenery give shape to an open-air dining space. The same terrace is shown through daytime and evening lighting, bringing the material detail and atmosphere into focus.',files('Projects/Baverly Hills',['Beverly Hills Hotel 2.jpg','Beverly Hills Hote 3.jpg','Beverly Hills Hotel 4.jpg'])+files('Projects/Nights',['4.jpg']))
add('portobello','Portobello',['Exterior','Street'],'Hospitality · Pergola visualization','An outdoor extension of the restaurant experience. Pergola structures frame the streetscape and create sheltered spaces for gathering, seen from the pavement and from within the dining terrace.',files('Projects/Portobello/Pergola',['10.jpg','1.jpg','13.jpg','3.jpg'])+files('Projects/Nights',['3.jpg']))
add('poolside-villa','Poolside Villa',['Exterior','Residential','Interior'],'Private residence · Outdoor living','A contemporary villa and pool terrace studied with different shading and glazing arrangements. Wide exterior views lead into the covered living space, connecting the house, water and garden.',files('Projects/Option 1',['3.jpg','1.jpg','2.jpg','6.jpg','9.jpg'])+files('Projects/White Realistic',['1.jpg','2.jpg']))
add('gable-patio','Gabled House Patio',['Exterior','Residential'],'Private residence · Patio visualization','A covered patio extends the living spaces of a gabled house into its garden. The views describe the roof structure, outdoor kitchen and seating area from the garden and above.',files('Projects/Patio Model',['1.jpg','2.jpg','3.jpg','4.jpg']))
add('garden-deck','Garden Deck Residence',['Exterior','Residential'],'Private residence · Deck visualization','A light pergola and deck sit alongside a traditional house. The project explores the scale of the extension, its connection to the lawn and the experience of sitting beneath the adjustable roof.',files('Projects/Deck Model',['2.jpg','1.jpg','3.jpg','4.jpg']))
add('mountain-house','Mountain House',['Exterior','Residential','Interior'],'Private residence · Seasonal visualization','A glazed balcony projects from a stone and plaster house in a mountain setting. Snow, autumn light and evening scenes explore the same architecture across seasons, with an interior view of the sheltered lounge.',files('Projects/Option 3',['4.jpg','3.jpg','5.jpg','7.jpg','6.jpg','2.jpg']))
add('winter-garden','Winter Garden Pavilion',['Exterior'],'Outdoor living · Seasonal visualization','A freestanding glazed pavilion set into a timber deck. Winter and summer views explore the enclosure, roof and stepped landscape around a sheltered place to unwind.',files('Projects/Option 2',['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg']))
add('pool-pavilion','Poolside Pavilion',['Exterior'],'Outdoor living · Pavilion visualization','A light, open pavilion beside the water. Daylight and sunset views explore the structure and sliding enclosure, connecting poolside comfort with the surrounding landscape.',files('Projects/Pool Model',['2.jpg','1.jpg','3.jpg'])+files('Projects/Nights',['7.jpg']))
add('rooftop','Above the City',['Exterior'],'Rooftop pavilion · Outdoor living','A compact rooftop pavilion framed by open sky and the city beyond. Daylight views establish the poolside setting, while a sunset perspective brings out the slender structure and warm interior light.',files('Projects/Roof Model',['1.jpg','2.jpg','3.jpg'])+files('Projects/Nights',['2.jpg']))
add('louver-mechanism','Louver Mechanism',['Product Modeling'],'Product modeling · Mechanical detail','Detailed cutaway views of a louvered roof mechanism. The images focus on the relationship between the structural frame, moving components and concealed connections.',files('Pergola - Louvers/Yan Kesim/New Louver (kesim)/Jpeg/Logosuz',['2.jpg','1.jpg','3.jpg']))
add('sliding-glass','Sliding Glass System',['Product Modeling'],'Product modeling · Sliding enclosure','A sliding glass system presented through full assembly and configuration views. The render series studies frame proportion, opening arrangements and the slim profile of the enclosure.',files('Pergola - Louvers/ISicamli Sliding',['1.jpg','2.jpg','3.jpg','4.jpg']))
# Fail before writing if any selected source is missing.
missing=[str(p) for e in entries for p in e['sources'] if not p.exists()]
if missing:raise Exception('Missing sources: '+str(missing))
manifest=[];catalog=[];crops=json.loads(Path('lib/image-crops.json').read_text(encoding='utf-8-sig'))
for entry in entries:
 paths=[];seen=set()
 for source in entry.pop('sources'):
  im=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
  # Exact pixel duplicates in the same project are kept only once.
  digest=hashlib.sha256(im.tobytes()).hexdigest()
  if digest in seen:continue
  seen.add(digest)
  im.thumbnail((2200,1800))
  filename=f"{entry['slug']}-catalog-{len(paths)+1}.webp";dest=OUT/filename
  im.save(dest,'WEBP',quality=85,method=4)
  url='/images/'+filename;paths.append(url)
  bottom=.10 if entry['slug']=='portobello' else 0
  if bottom:crops[url]={'width':im.width,'height':im.height,'bottom':bottom}
  manifest.append({'project':entry['slug'],'source':str(source),'output':str(dest),'pixelHash':digest,'width':im.width,'height':im.height})
 hero=entry.pop('hero');entry['images']=paths;entry['heroImage']=paths[hero]
 cover=Image.open(OUT/paths[hero].split('/')[-1]);cover.thumbnail((1100,850));filename=f"{entry['slug']}-catalog-thumb.webp";cover.save(OUT/filename,'WEBP',quality=83,method=4)
 entry['coverImage']='/images/'+filename
 if entry['slug']=='portobello':crops[entry['coverImage']]={'width':cover.width,'height':cover.height,'bottom':.10}
 catalog.append(entry);print(entry['slug'],len(paths),flush=True)
# Retain the curated taxonomy when regenerating image assets.
existing_catalog=json.loads(Path('lib/project-catalog.json').read_text(encoding='utf-8-sig'))
curated={item['slug']:item for item in existing_catalog}
for item in catalog:
 if item['slug'] in curated:
  for key in ('category','categories','topics'):
   if key in curated[item['slug']]: item[key]=curated[item['slug']][key]
Path('lib/project-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
Path('lib/image-crops.json').write_text(json.dumps(crops,indent=2),encoding='utf-8')
Path('artifacts/catalog-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL',len(catalog),'PROJECTS',len(manifest),'RENDERS')
