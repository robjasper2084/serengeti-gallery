"""Import the 21 user-supplied originals without changing their bytes or spending credits."""
from pathlib import Path
import hashlib, json, shutil
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path('C:/Users/digit/Downloads')
target = root / 'public/assets/exhibitions/life-and-light'
target.mkdir(parents=True, exist_ok=True)
rows = [
('518375664_10165507251054167_5651159544274799260_n.jpg','first-embrace','First Embrace','people','A quiet exchange between an adult and a sleeping infant, photographed in black and white.'),
('518730703_10165496751734167_3091735875024923579_n.jpg','held-in-the-light','Held in the Light','people','An infant reaches toward the person holding them in bright, warm light.'),
('517403130_10165511826544167_330077518599757706_n.jpg','amber-river','Amber River','light','Amber light crosses the water beneath a silhouetted skyline.'),
('518734850_10165513574029167_8086440540624854807_n (1).jpg','moon-and-branches','Moon and Branches','light','A bright moon is framed by the silhouette of bare branches.'),
('644208617_10166782685039167_8408227272083951327_n.jpg','winter-river-light','Winter River Light','light','Ice, dark water, and a distant skyline reflect a winter sunset.'),
('471817716_10164523314009167_4218071120665404653_n (1).jpg','city-beyond-the-trees','City Beyond the Trees','light','Trees frame the glowing sky and distant buildings across the river.'),
('518226618_10165492249384167_6289925483493991871_n.jpg','through-the-thicket','Through the Thicket','companions','A person and a companion pause among branches and weathered timber.'),
('468398734_10164200698199167_6239302085419412265_n.jpg','red-sun-over-detroit','Red Sun over Detroit','light','A red sunburst and its reflection cut through the dark skyline and water.'),
('518297825_10165485477154167_5849212025415305425_n.jpg','winter-companions','Winter Companions','companions','A person holds a dog close against a pale, icy backdrop.'),
('468354609_10164195022194167_2279850597944803839_n.jpg','beneath-the-clouds','Beneath the Clouds','people','A bearded figure in a patterned garment looks outward beneath an expansive cloud-filled sky.'),
('518485934_10165494048259167_1432854961935225825_n.jpg','shoreline-watch','Shoreline Watch','companions','A dog stands on shoreline timber, watching the open water.'),
('648900272_10166815619939167_1565099204184370703_n.jpg','blossoms-and-a-companion','Blossoms and a Companion','companions','Pink blossoms arch over a resting dog, green lawn, and a distant glass dome.'),
('52141152_10158188552059167_6957191693409976320_n.jpg','night-rider','Night Rider','light','A wheel rider travels along an illuminated city street. The supplied photograph has a visibly stylized finish.'),
('468401009_10164195037319167_4596278891794552370_n.jpg','among-the-green','Among the Green','people','A figure in a colorful garment stands among grasses and plants beneath a gray sky.'),
('519490409_10165531369684167_8308764503394767287_n.jpg','at-the-waters-edge','At the Water’s Edge','people','A child explores the shoreline with the city visible across the water.'),
('515322189_10165380236154167_6999763467784389192_n.jpg','over-the-creek','Over the Creek','companions','A dog is caught mid-leap over a narrow creek running through woodland.'),
('518288805_10165532584654167_3013873112947574041_n.jpg','lightning-over-detroit','Lightning over Detroit','light','A bolt of lightning meets the skyline above the river at dusk.'),
('518327198_10165518065574167_6014722230956052254_n.jpg','looking-across-the-water','Looking Across the Water','companions','A dog looks out from a rocky shoreline beneath branches.'),
('517600231_10165515716864167_152024978762099001_n.jpg','on-the-fallen-tree','On the Fallen Tree','companions','A person stands on fallen timber while a dog looks upward from below.'),
('650383280_10166836507209167_4914201967983387915_n.jpg','companion-among-petals','Companion Among Petals','companions','A seated dog rests among fallen petals, flowering trees, and cemetery markers.'),
('67343095_10158638845089167_562486036823801856_n.jpg','yellow-current','Yellow Current','abstract','Yellow, orange, and dark blue marks form a dense, energetic abstract composition. The original medium and dimensions have not been supplied.'),
]
featured = {5,8,10,12,17,21}
items = []
for number,(filename,slug,title,group,description) in enumerate(rows,1):
    original = source / filename
    destination = target / (slug + '.jpg')
    shutil.copy2(original,destination)
    digest = hashlib.sha256(original.read_bytes()).hexdigest()
    assert hashlib.sha256(destination.read_bytes()).hexdigest() == digest
    with Image.open(original) as image:
        width,height = image.size
    credit = 'eyefilmlife' if number not in (13,21) else 'Gallery submission · artist credit pending'
    medium = 'Abstract artwork' if number == 21 else 'Edited photograph' if number == 13 else 'Photography'
    items.append(dict(id='life-light-'+slug,title=title,subtitle=medium+' · '+credit,
        image='/serengeti-gallery/assets/exhibitions/life-and-light/'+slug+'.jpg',
        width=width,height=height,description=description,
        note='Original supplied file and embedded credits preserved. No AI generation or alterations were used for this exhibition.',
        credit=credit,medium=medium,group=group,sourceNumber=number,sourceFilename=filename,sha256=digest,
        date='Date not supplied',featured=number in featured,displayOnly=True))
(root/'src/life-and-light.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(target/'credits.json').write_text(json.dumps({'exhibition':'eyefilmlife: Detroit, Life & Light','generationCreditsSpent':0,'images':items},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Use the same preserved source bytes in Unity; texture import settings handle GPU sizing.
unity = Path('C:/Users/digit/Documents/phone/serengeti-gallery/unity/Assets/Art/LifeAndLight')
unity.mkdir(parents=True,exist_ok=True)
for item in items: shutil.copy2(target/(item['id'].removeprefix('life-light-')+'.jpg'),unity/(item['id']+'.jpg'))
(unity/'Catalog.json').write_text(json.dumps({'items':[dict(item,index=33+i,texture='Assets/Art/LifeAndLight/'+item['id']+'.jpg') for i,item in enumerate(items)]},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Imported {len(items)} unchanged originals; verified all SHA-256 hashes; generation credits spent: 0.')
