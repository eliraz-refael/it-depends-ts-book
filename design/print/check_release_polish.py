"""Compare the proof fixes with the accepted interior, permitting only the two repairs."""
import argparse, hashlib, json, math
from pathlib import Path
import pymupdf

SCALE = 2  # 144 dpi, with one pixel of allowance around the permitted glyph boxes.
ACCEPTED_SHA256 = 'b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3'
DEDICATION = 'For Dafna, Refael, Noa, and Shiri.'


def spans(page):
    return [s for b in page.get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans']]


def folios(page):
    return [s for s in spans(page) if s['bbox'][1] >= 680 and s['text'].strip().isdigit()]


def geometry(document):
    """Assert every folio's count, side, edge and original typography; center p3."""
    failures, rows = [], []
    if len(document) != 438:
        failures.append('Page count must stay 438')
    for number, page in enumerate(document, 1):
        fs = folios(page)
        if [s['text'] for s in fs] != ([] if number <= 3 else [str(number)]):
            failures.append(f'p{number}: missing, extra or wrong folio')
        if number <= 3 and page.get_text(clip=pymupdf.Rect(0,680,504,720)).strip():
            failures.append(f'p{number}: front-matter footer must be empty')
        for s in fs:
            box = pymupdf.Rect(s['bbox'])
            edge = box.x0 if number % 2 == 0 else box.x1
            expected = 48.96 if number % 2 == 0 else 455.04
            side = box.x1 < 252 if number % 2 == 0 else box.x0 > 252
            if not side or abs(edge-expected) > .1:
                failures.append(f'p{number}: folio is not at the outer text edge')
            if s['font'] != 'Oxanium-Regular' or abs(s['size']-9.9975) > .01 or abs(s['origin'][1]-697.5) > .01:
                failures.append(f'p{number}: folio typography or baseline changed')
        rows.append({'page':number,'folios':[{'text':s['text'],'bbox':s['bbox'],'origin':s['origin'],'font':s['font'],'size':s['size']} for s in fs]})
    dedication = spans(document[2]) if len(document) > 2 else []
    center = None
    if len(dedication) != 1 or dedication[0]['text'] != DEDICATION:
        failures.append('Dedication must remain exactly one unchanged text line')
    else:
        s = dedication[0]; r = pymupdf.Rect(s['bbox']); center = [(r.x0+r.x1)/2,(r.y0+r.y1)/2]
        if abs(center[0]-252)>1 or abs(center[1]-360)>1:
            failures.append('Dedication text box is not centered on the paper within 1pt')
        if s['font'] != 'IBMPlexSans-Italic' or abs(s['size']-10.995)>.01:
            failures.append('Dedication italic font or size changed')
    return {'status':'FAIL' if failures else 'PASS','failures':failures,'pages':len(document),'dedication_center':center,'folios':rows}


def mask(pix, rects):
    data = bytearray(pix.samples)
    for r in rects:
        r = pymupdf.Rect(r)
        x0=max(0,math.floor(r.x0*SCALE)-1);x1=min(pix.width,math.ceil(r.x1*SCALE)+1)
        y0=max(0,math.floor(r.y0*SCALE)-1);y1=min(pix.height,math.ceil(r.y1*SCALE)+1)
        for y in range(y0,y1):
            start=y*pix.stride+x0*pix.n;end=y*pix.stride+x1*pix.n
            data[start:end]=b'\xff'*(end-start)
    return hashlib.sha256(data).hexdigest()


def characters(page, omit_folio=False, omit_dedication=False):
    records=[]
    for b in page.get_text('rawdict')['blocks']:
        for line in b.get('lines',[]):
            for s in line['spans']:
                text=''.join(c['c'] for c in s['chars'])
                if omit_folio and s['bbox'][1]>=680 and text.strip().isdigit():continue
                if omit_dedication and text==DEDICATION:continue
                style={k:v for k,v in s.items() if k not in ('chars','bbox','origin')}
                records.extend((style,c) for c in s['chars'])
    return sorted(records,key=repr)


def pdf_path(path):
    return path/'It-Depends-KDP-interior.pdf' if path.is_dir() else path


def compare(before, after):
    before, after = pdf_path(before), pdf_path(after)
    old=pymupdf.open(before);new=pymupdf.open(after)
    audit=geometry(new);failures=list(audit['failures']);pages=[]
    if hashlib.sha256(before.read_bytes()).hexdigest()!=ACCEPTED_SHA256:
        failures.append('Baseline is not the accepted b34445da interior')
    if len(old)!=len(new):failures.append('Page counts differ')
    for i in range(min(len(old),len(new))):
        number=i+1;verso=number>3 and number%2==0;dedication=number==3
        if old[i].rect!=new[i].rect:failures.append(f'p{number}: paper geometry changed')
        old_f,new_f=folios(old[i]),folios(new[i])
        if verso and len(old_f)==len(new_f)==1:
            for key in ('text','size','font','flags','color','alpha','ascender','descender'):
                if old_f[0][key]!=new_f[0][key]:failures.append(f'p{number}: folio {key} changed')
            if old_f[0]['origin'][1]!=new_f[0]['origin'][1]:failures.append(f'p{number}: folio baseline changed')
        if dedication:
            a,b=spans(old[i]),spans(new[i])
            if [{k:v for k,v in s.items() if k not in ('bbox','origin')} for s in a]!=[{k:v for k,v in s.items() if k not in ('bbox','origin')} for s in b]:
                failures.append('p3: dedication content or typography changed')
        equal_text=characters(old[i],verso,dedication)==characters(new[i],verso,dedication)
        if not equal_text:failures.append(f'p{number}: other text or geometry changed')
        rects=([s['bbox'] for s in old_f+new_f] if verso else [])+([s['bbox'] for s in spans(old[i])+spans(new[i])] if dedication else [])
        a=old[i].get_pixmap(matrix=pymupdf.Matrix(SCALE,SCALE),alpha=False)
        b=new[i].get_pixmap(matrix=pymupdf.Matrix(SCALE,SCALE),alpha=False)
        allowed=mask(a,rects)==mask(b,rects)
        if not allowed:failures.append(f'p{number}: raster changed outside permitted glyph boxes')
        pages.append({'page':number,'raster_changed':a.samples!=b.samples,'other_text_geometry_identical':equal_text,'raster_identical_outside_allowed_boxes':allowed,'allowed_boxes':rects})
    report={'status':'FAIL' if failures else 'PASS','failures':failures,'pages':len(new),'accepted':str(before),'accepted_sha256':ACCEPTED_SHA256,'repaired':str(after),'repaired_sha256':hashlib.sha256(after.read_bytes()).hexdigest(),'raster_scale':SCALE,'dedication_center':audit['dedication_center'],'page_comparison':pages,'folio_audit':audit['folios'],'comparison':'Every character/style/position and 144dpi page raster identical, except verso folio glyph boxes and p3 dedication glyph boxes; exact original typography; one raster pixel allowance at those boxes only'}
    (after.parent/'cosmetic-comparison.json').write_text(json.dumps(report,indent=2)+'\n')
    return report


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('before',type=Path);parser.add_argument('after',type=Path);args=parser.parse_args()
    result=compare(args.before,args.after)
    print(json.dumps({k:v for k,v in result.items() if k not in ('page_comparison','folio_audit')},indent=2))
    raise SystemExit(bool(result['failures']))
