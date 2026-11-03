"""Compare the polished release to the accepted release, allowing only specified paint changes."""
import argparse, hashlib, json, math
from pathlib import Path
import pymupdf

SCALE=1.5

def rectangles(page):
    return [d['rect'] for d in page.get_drawings() if d['type']=='f' and d['rect'].height<=1 and d['rect'].width>2]

def mask(pix,rects):
    data=bytearray(pix.samples)
    for r in rects:
        # One raster pixel for antialiasing, confined to the old underline path.
        x0=max(0,math.floor(r.x0*SCALE)-1);x1=min(pix.width,math.ceil(r.x1*SCALE)+1)
        y0=max(0,math.floor(r.y0*SCALE)-1);y1=min(pix.height,math.ceil(r.y1*SCALE)+1)
        for y in range(y0,y1):
            start=y*pix.stride+x0*pix.n;end=y*pix.stride+x1*pix.n
            data[start:end]=b'\xff'*(end-start)
    return hashlib.sha256(data).hexdigest()

def compare(before,after):
    old=pymupdf.open(before/'It-Depends-KDP-interior.pdf');new=pymupdf.open(after/'It-Depends-KDP-interior.pdf')
    raw=pymupdf.open(before/'raw.pdf');failures=[];changes=[]
    def check(ok,why):
        if not ok:failures.append(why)
    check(len(old)==len(new)==438,'Page count must stay 438')
    # Title and subtitle retain the exact positions and typography, despite author movement.
    for text in ['It Depends','TypeScript Principles, Debated']:
        def spans(page):
            return [s for b in page.get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans'] if s['text']==text]
        check(spans(old[0])==spans(new[0]),'Title/subtitle changed: '+text)
    authors=[s for b in new[0].get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans'] if s['text']=='Eliraz Kedmi']
    check(len(authors)==1 and abs(authors[0]['size']-22)<.1 and authors[0]['bbox'][1]>500,'Author is not the lower-page 22pt signature')
    for i in range(3):
        check(not new[i].get_text(clip=pymupdf.Rect(0,0,504,42)).strip(),f'p{i+1}: running head')
        check(not new[i].get_text(clip=pymupdf.Rect(0,680,504,720)).strip(),f'p{i+1}: folio')
        if i:
            check(old[i].get_text('rawdict',clip=pymupdf.Rect(0,42,504,678))==new[i].get_text('rawdict',clip=pymupdf.Rect(0,42,504,678)),f'p{i+1}: body changed')
    for i in range(3,min(len(old),len(new))):
        check(old[i].get_text('rawdict')==new[i].get_text('rawdict'),f'p{i+1}: text/geometry changed')
        links=[l['from'] for l in raw[i].get_links() if l.get('uri')]
        removed=[r for r in rectangles(old[i]) if any((link+(-1,-1,1,1)).contains(r) for link in links)] if i>=8 else []
        check(not any(r in rectangles(new[i]) for r in removed),f'p{i+1}: underline remains')
        a=old[i].get_pixmap(matrix=pymupdf.Matrix(SCALE,SCALE),alpha=False)
        b=new[i].get_pixmap(matrix=pymupdf.Matrix(SCALE,SCALE),alpha=False)
        check(mask(a,removed)==mask(b,removed),f'p{i+1}: pixels changed outside old underline paths')
        if a.samples!=b.samples:changes.append({'page':i+1,'removed_underline_paths':[list(r) for r in removed]})
    check(bool(changes) and any(c['page']==13 for c in changes),'README underline control missing')
    report={'status':'PASS' if not failures else 'FAIL','failures':failures,'pages':len(new),'accepted':str(before),'polished':str(after),'raster_scale':SCALE,'body_changes':changes,'comparison':'pp4–8 identical; pp9–438 identical text/geometry and pixels except exact former underline paths (1 raster-pixel antialias allowance); title/subtitle exact; p2/p3 body exact'}
    (after/'cosmetic-comparison.json').write_text(json.dumps(report,indent=2)+'\n')
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('before',type=Path);parser.add_argument('after',type=Path);args=parser.parse_args()
    result=compare(args.before,args.after);print(json.dumps(result,indent=2));raise SystemExit(bool(result['failures']))
