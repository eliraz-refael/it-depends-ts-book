"""Release-only front matter, PDF cleanup and greyscale audit."""
import html,json,re
from collections import Counter
from xml.etree import ElementTree as ET
from pathlib import Path
import pymupdf

HERE=Path(__file__).resolve().parent
COPYRIGHT=(HERE/'copyright.txt').read_text().splitlines()
NUMBER=rb'[-+]?(?:\d*\.\d+|\d+\.?\d*)'
RGB=re.compile(rb'(?<!\S)('+NUMBER+rb')\s+('+NUMBER+rb')\s+('+NUMBER+rb')\s+(rg|RG)(?=\s|$)')

def front(data):
    required={'author':'Eliraz Kedmi','edition':'First edition, 2026','isbn':'9798167618534',
      'text_license':'Text licensed under CC BY-NC-SA 4.0.','code_license':'Code examples licensed under the MIT License.',
      'release_tag':'v1.0.0','public_repository_url':'https://github.com/eliraz-refael/it-depends-ts-book','imprint':'Independently published'}
    assert all(data.get(k)==v for k,v in required.items()),'Approved release metadata changed'
    assert f'{data["title"]}: {data["subtitle"]}'==COPYRIGHT[0]
    for key in ['edition','text_license','code_license','imprint']:assert data[key] in COPYRIGHT
    assert 'ISBN '+data['isbn'] in COPYRIGHT
    assert data['public_repository_url'].removeprefix('https://') in COPYRIGHT
    assert 'Source and examples (release '+data['release_tag']+'):' in COPYRIGHT
    lines=''.join(f'<div class="copyright-line" data-copyright-line="{i}">{html.escape(line) if line else "&nbsp;"}</div>' for i,line in enumerate(COPYRIGHT))
    return f'''<section class="front-page cover running-title" data-front-part="title" data-running="IT DEPENDS"><div class="eyebrow">{html.escape(data['author'])}</div><h1>{html.escape(data['title'])}</h1><h2>{html.escape(data['subtitle'])}</h2></section>
<section class="front-page copyright running-title" data-front-part="copyright" data-running="Copyright">{lines}</section>'''

def greyscale(document):
    luminance=lambda v: ((v/255)/12.92 if v/255<=.04045 else ((v/255+.055)/1.055)**2.4)
    contrast=lambda foreground:round((luminance(250)+.05)/(luminance(foreground)+.05),2)
    audit={'non_grey_paint':[],'converted_rgb_operators':0,'contrast':{'normal_on_code_background':contrast(24),'comments_on_code_background':contrast(85),'strings_on_code_background':contrast(51)}}
    seen=set()
    for page in document:
        streams=set(page.get_contents())
        for x in page.get_xobjects():streams.add(x[0])
        for f in page.get_fonts(full=True):
            if f[2]=='Type3':streams.update(map(int,re.findall(r'(\d+) 0 R',document.xref_get_key(f[0],'CharProcs')[1])))
        for x in streams-seen:
            seen.add(x)
            def convert(m):
                rgb=list(map(float,m.group(1,2,3)))
                if max(rgb)-min(rgb)>1e-6:audit['non_grey_paint'].append({'page':page.number+1,'rgb':rgb})
                grey=sum(v*w for v,w in zip(rgb,[.2126,.7152,.0722]))
                audit['converted_rgb_operators']+=1
                return f'{grey:.8f} '.encode()+(b'g' if m.group(4)==b'rg' else b'G')
            document.update_stream(x,RGB.sub(convert,document.xref_stream(x)))
    return audit

def clean(document):
    document.set_toc([])
    for page in document:
        for link in page.get_links():page.delete_link(link)
        for annot in list(page.annots() or []):page.delete_annot(annot)
        for widget in list(page.widgets() or []):page.delete_widget(widget)
        for key in ['Annots','AA','StructParents']:document.xref_set_key(page.xref,key,'null')
    document.set_metadata({});document.del_xml_metadata()
    for key in ['Outlines','Names','AcroForm','OpenAction','AA','Metadata','StructTreeRoot','MarkInfo']:
        document.xref_set_key(document.pdf_catalog(),key,'null')
    document.set_metadata(INFO)
    document.set_xml_metadata(XMP)

INFO={'title':'It Depends','author':'Eliraz Kedmi','subject':'TypeScript Principles, Debated','keywords':'TypeScript, programming, software engineering'}
XMP='''<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:pdf="http://ns.adobe.com/pdf/1.3/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">It Depends</rdf:li></rdf:Alt></dc:title><dc:creator><rdf:Seq><rdf:li>Eliraz Kedmi</rdf:li></rdf:Seq></dc:creator><dc:description><rdf:Alt><rdf:li xml:lang="x-default">TypeScript Principles, Debated</rdf:li></rdf:Alt></dc:description><pdf:Keywords>TypeScript, programming, software engineering</pdf:Keywords></rdf:Description></rdf:RDF></x:xmpmeta>'''
TERMS=re.compile(r'placeholder|TBD|example\.invalid',re.I)

def publication_terms(document,manifest,pages,root):
    """Every printed occurrence must fall inside its exact source block, never furniture."""
    expected=[]
    for source in manifest['source_sha256']:
        for line,text in enumerate((root/source).read_text().splitlines(),1):
            expected.extend({'source':source,'line':line,'term':m.group()} for m in TERMS.finditer(text))
    found=[];failures=[]
    for page,layout in zip(document,pages):
        for word in page.get_text('words'):
            for match in TERMS.finditer(word[4]):
                box=pymupdf.Rect(word[:4]); candidates=[]
                for kind in ['texts','code']:
                    for item in layout[kind]:
                        r=item['rect'];origin=layout['rect']
                        region=pymupdf.Rect((r['x']-origin['x'])*.75,(r['y']-origin['y'])*.75,(r['right']-origin['x'])*.75,(r['bottom']-origin['y'])*.75)+(-2,-2,2,2)
                        if not region.contains(box):continue
                        if kind=='texts':
                            entry=manifest['texts'][item['id']]
                            candidates.extend(x for x in expected if x['source']==entry['source'] and x['line']==entry['line'] and x['term']==match.group())
                        else:
                            for fence in manifest['fences']:
                                if item['id'].startswith(fence['id']+'-'):
                                    candidates.extend(x for x in expected if x['source']==fence['source'] and fence['line']<x['line']<=fence['line']+len(fence['content'].splitlines()) and x['term']==match.group())
                if len(candidates)!=1:
                    failures.append(f'p{page.number+1}: unowned/ambiguous publication term {word[4]!r}')
                else:found.append({**candidates[0],'page':page.number+1})
    signature=lambda x:(x['source'],x['line'],x['term'])
    if Counter(map(signature,expected))!=Counter(map(signature,found)):failures.append('Publication term source/PDF locations or counts differ')
    raw=Counter(m.group() for p in document for m in TERMS.finditer(p.get_text()))
    if raw!=Counter(x['term'] for x in expected):failures.append('Publication term PDF/source total differs')
    return {'source_occurrences':expected,'pdf_occurrences':found,'counts':{term:sum(count for value,count in raw.items() if value.lower()==term.lower()) for term in ['placeholder','TBD','example.invalid']},'failures':failures}

def errors(document):
    failures=[]
    if document.get_toc():failures.append('Release contains outline')
    for page in document:
        if page.get_links() or list(page.annots() or []) or list(page.widgets() or []):failures.append(f'p{page.number+1}: annotations/fields remain')
        for key in ['Annots','AA','StructParents']:
            if document.xref_get_key(page.xref,key)[0]!='null':failures.append(f'p{page.number+1}: {key} remains')
        for span in page.get_texttrace():
            color=span['color']
            if isinstance(color,tuple) and max(color)-min(color)>1/255+1e-6:failures.append(f'p{page.number+1}: coloured text')
        for drawing in page.get_drawings():
            for key in ['color','fill']:
                c=drawing.get(key)
                if c and len(c)==3 and max(c)-min(c)>1/255+1e-6:failures.append(f'p{page.number+1}: coloured vector')
        if page.get_images():failures.append(f'p{page.number+1}: unreviewed raster image')
        if any(tuple(getattr(page,k))!=(0.,0.,504.,720.) for k in ['mediabox','cropbox','trimbox','bleedbox']):failures.append(f'p{page.number+1}: bleed/trim box')
    for x in range(1,document.xref_length()):
        obj=document.xref_object(x)
        if re.search(r'/JavaScript\b|/(?:JS|OpenAction|AA)\s+(?!null\b)\S',obj):failures.append(f'Active PDF object {x}')
        if re.search(r'/Type\s*/Annot\b|/Subtype\s*/(?:Link|Text|Widget)\b',obj):failures.append(f'Annotation object {x}')
    for key in ['Outlines','Names','AcroForm','OpenAction','AA','StructTreeRoot','MarkInfo']:
        if document.xref_get_key(document.pdf_catalog(),key)[0]!='null':failures.append('Release catalog '+key)
    if any(document.metadata.get(k)!=v for k,v in INFO.items()):failures.append('Document Info differs from real publication values')
    try:
        if ET.tostring(ET.fromstring(document.get_xml_metadata()))!=ET.tostring(ET.fromstring(XMP)):failures.append('XMP differs from real publication values')
    except ET.ParseError:failures.append('Missing/invalid XMP')
    if TERMS.search(document.get_xml_metadata()):failures.append('XMP publication placeholders remain')
    if re.search(r'TBD|example\.invalid|placeholder',' '.join(str(v) for v in document.metadata.values()),re.I):failures.append('Metadata placeholders remain')
    text='\n'.join(p.get_text() for p in document)
    if re.search(r'\bPROOF\b',text):failures.append('Release PROOF mark remains')
    return failures
