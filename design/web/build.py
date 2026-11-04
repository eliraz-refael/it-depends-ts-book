#!/usr/bin/env python3
"""Build the free web edition from the frozen book, without changing print or source."""
import argparse, hashlib, html, json, re, shutil, sys
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from pygments import lex
from pygments.token import STANDARD_TYPES

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT/'design/print'))
import build_proof as printbook
import prose_quotes
MD=printbook.MD
E=html.escape

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower().replace("'",'').replace('’','')).strip('-')
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def plain(t):return printbook.plain(t.children)

def build(out,config):
    assert not out.exists(),f'Clean output required: {out}'
    base=config['base_url'].rstrip('/')+'/'
    assert urlsplit(base).scheme in ('https','http') and not urlsplit(base).query and not urlsplit(base).fragment
    prefix=urlsplit(base).path
    def url(route=''):return prefix+route
    def link(route,text,cls=''):return f'<a class="{cls}" href="{E(url(route))}">{text}</a>'
    buy=config['paperback_url']
    assert not buy or (urlsplit(buy).scheme=='https' and urlsplit(buy).hostname and 'example.invalid' not in buy)
    buy_html=f'<a class="buy" data-buy href="{E(buy)}">Buy the paperback</a>' if buy else ''
    copy=json.loads((ROOT/'design/cover/copy.json').read_text())
    assert copy['team_status']=='Approved'
    routes=json.loads((HERE/'routes.json').read_text())
    sources=[r['source'] for r in routes]
    assert sources==(ROOT/'docs/editorial/full-review/reading-order.txt').read_text().splitlines()
    _,hashes=printbook.trial.inputs({'manuscript_commit':config['source_commit']})
    assert list(hashes)==sources
    manifest={'source_hashes':hashes,'base_url':base,'sources':{},'fences':{},'texts':{},'inline':{},'links':[],'quotes':[],'pages':{},'routes':routes,'buy':bool(buy)}
    documents=[];cast=[]
    for n,row in enumerate(routes):
        source=(ROOT/row['source']).read_text();tokens=MD.parse(source)
        first=next((i for i,t in enumerate(tokens) if t.type=='heading_open' and t.tag=='h1'),None)
        title=plain(tokens[first+1]) if first is not None else 'Dedication'
        act=int(row['source'].split('/')[1][:2]);parts=[];fence_count=0;section='';sub='';headings=set()
        for i,t in enumerate(tokens):
            sid=f's-{n}-{i}'
            if t.type=='heading_open':
                label=plain(tokens[i+1]);anchor=slug(label)
                if anchor in headings:anchor+=f'-{i}'
                headings.add(anchor);t.attrSet('id',anchor)
                if t.tag=='h2':section=label;sub=''
                if t.tag=='h3':sub=label
                if row['source'].endswith('02-meet-the-cast.md') and t.tag=='h3' and tokens[i+3].type=='paragraph_open' and tokens[i+4].children[0].type=='em_open':
                    role=plain(tokens[i+4])
                    cast.append({'name':label,'role':role,'anchor':anchor})
                if i==first:
                    # The entire source title stays in the H1's accessible text.
                    number=re.match(r'(Chapter|Bonus) (\d+): ',label)
                    mark=('B' if number and number[1]=='Bonus' else '')+number[2] if number else ''
                    act_label=' · '.join(x for x in printbook.ACTS[act] if x)
                    parts.append(f'<header class="chapter-opener"><p class="eyebrow">{E(act_label)}</p>'+ (f'<div class="numeral" aria-hidden="true">{mark}</div>' if mark else ''))
            if t.type=='inline':
                original=plain(t);decision=prose_quotes.decision_for(row['source'],t.map[0]+1,t.content)
                audit=prose_quotes.convert(t.children,decision)
                assert not audit.get('ambiguous'),(row['source'],t.map,audit)
                manifest['texts'][sid]={'source':row['source'],'line':t.map[0]+1,'text':original,'printed':plain(t)}
                if audit.get('converted'):manifest['quotes'].append({'id':sid,**audit})
                for j,c in enumerate(t.children or []):
                    if c.type=='code_inline':
                        cid=f'{sid}-inline-{j}';c.attrSet('data-inline',cid);manifest['inline'][cid]=c.content
                    if c.type=='link_open':
                        target=c.attrGet('href')
                        if target.startswith('../../README.md'):target=config['repository_url']+'#checking-the-examples'
                        c.attrSet('href',target);c.attrSet('data-source-link','true')
                        manifest['links'].append({'source':row['source'],'href':target})
                markup=MD.renderer.renderInline(t.children,MD.options,{})
                if first is not None and i==first+1:
                    m=re.match(r'(Chapter|Bonus) \d+: ',original)
                    if m:markup='<span class="sr-only">'+E(m[0])+'</span>'+markup[len(m[0]):]
                parts.append(f'<span data-source-text="{sid}">{markup}</span>')
            elif t.type=='fence':
                fence_count+=1;fid=f'fence-{n}-{fence_count}'
                assert t.info in printbook.LEXERS,t.info
                highlighted=''.join(f'<span class="tok-{STANDARD_TYPES.get(tok, "")}">{E(value)}</span>' for tok,value in lex(t.content,printbook.LEXERS[t.info](stripnl=False,ensurenl=False)))
                manifest['fences'][fid]={'source':row['source'],'line':t.map[0]+1,'language':t.info,'text':t.content,'sha256':hashlib.sha256(t.content.encode()).hexdigest()}
                parts.append(f'<figure class="code-block"><figcaption>{E(t.info)}</figcaption><pre tabindex="0" aria-label="{E(t.info)} code"><code data-fence="{fid}">{highlighted}</code></pre></figure>')
            elif t.type=='table_open':parts.append('<div class="table-scroll" tabindex="0" role="region" aria-label="Table">'+MD.renderer.render([t],MD.options,{}))
            elif t.type=='table_close':parts.append(MD.renderer.render([t],MD.options,{})+'</div>')
            else:
                assert t.type not in ('html_block','html_inline','image'),(row['source'],t.type)
                if t.type=='blockquote_open':
                    transcript=act==5 and (section not in ('The Verdict','The Debate Continues') or sub=='The next request')
                    t.attrSet('class','assistant-transcript' if transcript else 'ruling')
                parts.append(MD.renderer.render([t],MD.options,{}))
                if first is not None and i==first+2:parts.append('<div class="title-rule" aria-hidden="true"></div></header>')
        body=''.join(parts)
        documents.append({**row,'title':title,'act':act,'html':body})
        manifest['sources'][row['source']]={'route':row['route'],'title':title}
    assert len(manifest['fences'])==490 and len(manifest['links'])==7 and len(cast)==15
    assert { (q['explicit_decision']['source'],q['explicit_decision']['line']) for q in manifest['quotes'] if q.get('explicit_decision')}=={(d['source'],d['line']) for d in prose_quotes.DECISIONS}
    manifest['cast']=cast
    def contents():
        groups=[]
        for act,(name,title) in enumerate(printbook.ACTS):
            entries=''.join('<li>'+link(d['route'],E(d['title']))+'</li>' for d in documents if d['act']==act)
            groups.append(f'<section><h3>{E(name)}{(" · "+E(title)) if title else ""}</h3><ol>{entries}</ol></section>')
        return '<div class="contents-grid">'+''.join(groups)+'</div>'
    toc=contents()
    header=f'<header class="site-header"><div class="header-inner">{link("","IT DEPENDS","brand")}<nav aria-label="Main">'+f'<details class="contents-menu"><summary>Contents</summary><div class="contents-panel" id="contents-panel"><button class="drawer-close" type="button" hidden>Close contents</button><h2>Contents</h2>{toc}'+link('reading-the-code-symbols/','Reading the code symbols')+f'</div></details>{buy_html}</nav></div><div class="reading-progress" aria-hidden="true"><div></div></div></header>'
    footer=f'<footer class="site-footer"><p class="signoff">Strict mode on. Opinions included.</p><p>Text CC BY-NC-SA 4.0 · Code MIT · © 2026 Eliraz Kedmi</p><p>Every example is checked against TypeScript 7.0.2.</p><nav aria-label="Footer"><a href="{E(config["repository_url"])}">GitHub</a>'+link('about/','About this book')+'</nav></footer>'
    reading=[{'route':'about/','title':'About this book'}]+[{k:d[k] for k in ('route','title')} for d in documents[2:]]
    manifest['reading_order']=reading
    def navigation(route):
        if route=='reading-the-code-symbols/':prev,next_={'route':'how-to-read/','title':'How to Read This Book'},{'route':'meet-the-cast/','title':'Meet the Cast'}
        else:
            i=next(i for i,d in enumerate(reading) if d['route']==route)
            prev=reading[i-1] if i else {'route':'','title':'Home'}
            next_=reading[i+1] if i+1<len(reading) else {'route':'#contents','title':'Back to contents'}
        label=re.match(r'((?:Chapter|Bonus) \d+): (.+)',next_['title'])
        return '<nav class="reading-nav" aria-label="Reading navigation">'+link(prev['route'],'← Previous · '+E(prev['title']),'previous')+link(next_['route'],f'<span class="next-label">Next{(" · "+E(label[1])) if label else ""}</span><span>{E(label[2] if label else next_["title"])} →</span>','next-card')+'</nav>'
    def emit(route,title,description,body,kind='reading'):
        canonical=urljoin(base,route);file=out/('404.html' if route=='404.html' else route+'index.html')
        assert len(description)>20
        page_header=header.replace('<nav aria-label="Main">','<nav aria-label="Main">'+link('how-to-read/','Start reading')) if kind=='home' else header
        page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)}{'' if kind=='home' else ' — It Depends'}</title><meta name="description" content="{E(description)}"><link rel="canonical" href="{E(canonical)}"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(description)}"><meta property="og:type" content="book"><meta property="og:url" content="{E(canonical)}"><meta property="og:image" content="{E(urljoin(base,'assets/cover.png'))}">{'<meta name="robots" content="noindex">' if route=='404.html' else ''}<link rel="stylesheet" href="{url('assets/site.css')}"><script defer src="{url('assets/site.js')}"></script></head><body class="{kind}"><a class="skip" href="#main">Skip to content</a>{page_header}<main id="main">{body}</main>{footer}</body></html>'''
        write(file,page);manifest['pages'][str(file.relative_to(out))]={'route':route,'title':title,'canonical':canonical,'kind':kind}
    for d in documents[2:]:
        supplemental=('<aside class="symbol-pointer">'+link('reading-the-code-symbols/','Reading the code symbols →')+'</aside>') if d['route']=='how-to-read/' else ''
        emit(d['route'],d['title'],f'Read {d["title"]} in It Depends: TypeScript Principles, Debated, by Eliraz Kedmi. Free online edition.',f'<article class="book-body" data-book-source="{d["source"]}">{d["html"]}</article>{supplemental}{navigation(d["route"])}')
    # Two exact source documents share one About page; no duplicate chapter text.
    about='<header class="chapter-opener"><h1>About this book</h1><div class="title-rule" aria-hidden="true"></div></header>'
    for d,anchor in zip(documents[:2],['dedication','acknowledgments']):
        body=d['html'].replace('id="acknowledgments"','id="acknowledgments-title"')
        body=re.sub(r'<header class="chapter-opener">.*?</header>',lambda m:re.sub(r'<p class="eyebrow">.*?</p>|<div class="title-rule".*?</div>','',m[0]).replace('<header class="chapter-opener">','').replace('</header>','').replace('<h1','<h2').replace('</h1>','</h2>'),body,flags=re.S)
        about+=f'<section id="{anchor}" data-book-source="{d["source"]}">'+ ('<h2>Dedication</h2>' if anchor=='dedication' else '')+body+'</section>'
    emit('about/','About this book','The dedication and acknowledgments for It Depends: TypeScript Principles, Debated.',f'<article class="book-body about-body">{about}</article>{navigation("about/")}')
    key=printbook.symbol_key_html()
    emit('reading-the-code-symbols/','Reading the code symbols','A guide to the printed code ligatures, the characters to type and what they mean in TypeScript.',f'<article class="book-body symbol-key">{key}</article>{navigation("reading-the-code-symbols/")}')
    hero_code='type Answer&lt;Q&gt; =\n  Q extends () =&gt; infer R\n    ? R\n    : "It depends";'
    steps=[('The Principle','A rule you can test, stated up front.'),('The Debate','The team argues it over working code.'),('The Turn','An example changes the conversation.'),('The Verdict / Debate Continues','A ruling—or a disagreement that remains.'),('Additional Takes','Other voices, costs and conditions.')]
    cards=''.join(f'<div><span class="step-number">{i:02}</span><h3>{E(title)}</h3><p>{E(body)}</p></div>' for i,(title,body) in enumerate(steps,1))
    cast_cards=''.join(link('meet-the-cast/#'+c['anchor'],f'<span class="avatar" aria-hidden="true">{E("".join(w[0] for w in c["name"].replace("Prof. ","").split())[:2])}</span><span><strong>{E(c["name"])}</strong><small>{E(c["role"])}</small></span>','cast-card') for c in cast)
    home=f'''<section class="hero"><div class="wide hero-inner"><div><p class="hero-label">THE ANSWER IS IN THE TYPE.</p><pre aria-label="The cover’s conditional type"><code>{hero_code}</code></pre></div><div class="hero-mark" aria-hidden="true"><svg viewBox="0 0 96 120"><path d="M10 8L86 60L10 112"/></svg></div></div></section><section class="wide home-intro"><h1>IT<br>DEPENDS</h1><p class="subtitle">{E(copy['subtitle'])}</p><p class="author">ELIRAZ KEDMI</p><div class="title-rule" aria-hidden="true"></div><p class="hook">{E(copy['hook'])}</p><p class="team">{E(copy['team'])}</p><div class="actions">{link(documents[4]['route'],'Start reading: Chapter 1','primary')}{buy_html}</div><p class="small">Free to read online. Every example is checked against TypeScript 7.0.2.</p></section><section class="shape"><div class="wide"><h2>How the arguments unfold</h2><div class="steps">{cards}</div></div></section><section class="wide home-contents" id="contents"><h2>Contents</h2>{toc}</section><section class="cast-section" id="cast"><div class="wide"><h2>The cast</h2><p>Fifteen people, one codebase, and very few agreements.</p><div class="cast-grid">{cast_cards}</div></div></section>'''
    emit('','It Depends — TypeScript Principles, Debated',copy['hook'],home,'home')
    emit('404.html','Page not found','This page could not be found. Return to the free web edition of It Depends.', '<article class="book-body"><h1>Page not found</h1><p>The debate is elsewhere.</p>'+link('','Return to the book')+'</article>','not-found')
    assets=out/'assets';assets.mkdir(exist_ok=True)
    for f in ['site.css','site.js']:shutil.copyfile(HERE/f,assets/f)
    shutil.copytree(ROOT/'design/print/fonts',assets/'fonts')
    shutil.copyfile(ROOT/'design/cover/front.png',assets/'cover.png')
    write(out/'sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{E(p["canonical"])}</loc></url>' for p in manifest['pages'].values() if p['route']!='404.html')+'</urlset>')
    write(out/'robots.txt','User-agent: *\nAllow: /\nSitemap: '+urljoin(base,'sitemap.xml')+'\n')
    manifest['assets']={str(p.relative_to(out)):digest(p) for p in assets.rglob('*') if p.is_file()}
    write(out.with_suffix('.manifest.json'),json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    print(f'Built {len(manifest["pages"])} pages, {len(manifest["fences"])} fences, {len(manifest["texts"])} source blocks: {out}')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=HERE/'output/site');parser.add_argument('--config',type=Path,default=HERE/'config.json');args=parser.parse_args()
    build(args.output,json.loads(args.config.read_text()))
