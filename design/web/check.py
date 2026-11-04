#!/usr/bin/env python3
"""Source fidelity, routing, contrast and reproducibility checks for the web edition."""
import argparse,hashlib,json,re,shutil,subprocess,sys,tempfile,os
from xml.etree import ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
from urllib.parse import urlsplit,unquote
import build
HERE,ROOT=build.HERE,build.ROOT

class Document(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.nodes=[];self.stack=[];self.feed(s);assert not self.stack,'Unclosed markup'
 def handle_starttag(self,tag,attrs):
  node={'tag':tag,'attrs':dict(attrs),'text':'','ancestors':[n['attrs'].get('class','') for n in self.stack]};self.nodes.append(node)
  if tag not in ('meta','link','br','hr','img','input','source','wbr'):self.stack.append(node)
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in ('meta','link','br','hr','img','input','source','wbr'):self.handle_endtag(tag)
 def handle_endtag(self,tag):
  assert self.stack and self.stack[-1]['tag']==tag,('Invalid nesting',tag,self.stack[-1]['tag'] if self.stack else None)
  self.stack.pop()
 def handle_data(self,data):
  for n in self.stack:n['text']+=data
 def selected(self,attr):return [n for n in self.nodes if attr in n['attrs']]

def check(site,config):
 m=json.loads(site.with_suffix('.manifest.json').read_text());prefix=urlsplit(config['base_url']).path;docs={p:Document((site/p).read_text()) for p in m['pages']};fail=[]
 def assert_(ok,why):
  if not ok:fail.append(why)
 texts={};fences={};inline={};links=[];terms=Counter();terms_re=re.compile('placeholder|TBD|example\\.invalid|PROOF')
 for file,d in docs.items():
  assert_(len([n for n in d.nodes if n['tag']=='h1'])==1,file+': H1')
  assert_(not d.selected('data-buy') if not config['paperback_url'] else True,file+': buy button')
  ids=[n['attrs']['id'] for n in d.selected('id')];assert_(len(ids)==len(set(ids)),file+': duplicate anchors')
  for attr,dest in [('data-source-text',texts),('data-fence',fences),('data-inline',inline)]:
   for n in d.selected(attr):
    k=n['attrs'][attr];assert_(k not in dest,'Duplicate source '+k);dest[k]=n['text']
  links.extend(n['attrs']['href'] for n in d.selected('data-source-link'))
  for node in d.nodes:
   a=node['attrs']
   if node['tag'] in ('a','link','script','img'):
    href=a.get('href',a.get('src',''));u=urlsplit(href)
    if u.scheme:continue
    path=u.path
    if path:
     assert_(path.startswith(prefix),'Wrong base path: '+href)
     rel=unquote(path[len(prefix):]);target=site/rel
     if path.endswith('/'):target=target/'index.html'
    else:target=site/file
    assert_(target.is_file(),'Missing link/asset: '+href)
    if u.fragment and target.is_file():
     targetdoc=docs.get(str(target.relative_to(site)))
     assert_(targetdoc is not None and any(n['attrs'].get('id')==unquote(u.fragment) for n in targetdoc.nodes),'Missing fragment: '+href)
  body=next(n['text'] for n in d.nodes if n['tag']=='body');terms.update(terms_re.findall(body))
  owned=''.join(n['text'] for n in d.selected('data-source-text'))+''.join(n['text'] for n in d.selected('data-fence'))
  assert_(Counter(terms_re.findall(body))==Counter(terms_re.findall(owned)),file+': generated publication term')
  assert_(sum(n['tag']=='title' for n in d.nodes)==1,file+': title')
  assert_(any(n['attrs'].get('rel')=='canonical' and n['attrs']['href']==m['pages'][file]['canonical'] for n in d.nodes),file+': canonical')
 assert_(set(texts)==set(m['texts']),'Lost prose blocks')
 for key,value in texts.items():assert_(value==m['texts'][key]['printed'],'Changed prose '+key)
 assert_(inline==m['inline'],'Changed inline code')
 assert_(set(fences)==set(m['fences']),'Lost fences')
 for key,value in fences.items():assert_(value==m['fences'][key]['text'],'Changed fence '+key)
 assert_(Counter(links)==Counter(x['href'] for x in m['links']),'Lost/duplicated prose links')
 assert_(len(docs)==36 and len(m['source_hashes'])==34,'Page coverage')
 source_terms=Counter(terms_re.findall(''.join((ROOT/p).read_text() for p in m['source_hashes'])))
 assert_(terms==source_terms,'Global source/publication term count')
 for q in m['quotes']:
  assert_(build.prose_quotes.verify_printed(texts[q['id']],q),'Quote balance '+q['id'])
 # Independently derive the print fence inventory using its existing assembly.
 inventory=HERE/'output/print-inventory'
 if inventory.exists():shutil.rmtree(inventory)
 pm=build.printbook.assemble(json.loads((ROOT/'design/print/release-metadata.json').read_text()),inventory,'release')
 assert_([(f['source'],f['line'],f['content_sha256']) for f in pm['fences']]==[(f['source'],f['line'],f['sha256']) for f in m['fences'].values()],'Print/web fence inventory differs')
 assert_([x['text'] for x in pm['texts'].values()]==[x['text'] for x in m['texts'].values()],'Print/web prose inventory differs')
 # Every drawer has the same source order; Home repeats it once in full contents.
 expected=[prefix+r['route'] for r in m['routes']]
 for file,d in docs.items():
  toc=[n['attrs'].get('href') for n in d.nodes if n['tag']=='a' and n['attrs'].get('href') in expected and 'contents-panel' in n['ancestors']]
  first=toc[:34];assert_(first==expected,file+': drawer order')
  if m['pages'][file]['route']=='':
   home_toc=[n['attrs'].get('href') for n in d.nodes if n['tag']=='a' and any('home-contents' in x for x in n['ancestors'])]
   assert_(home_toc==expected,'Home contents order')
 # Every reading page has exactly the prescribed previous/next destinations.
 order=m['reading_order']
 for file,d in docs.items():
  route=m['pages'][file]['route']
  if m['pages'][file]['kind']!='reading':continue
  if route=='reading-the-code-symbols/':wanted=['how-to-read/','meet-the-cast/']
  else:
   i=next(i for i,x in enumerate(order) if x['route']==route)
   wanted=[order[i-1]['route'] if i else '',order[i+1]['route'] if i+1<len(order) else '#contents']
  actual=[n['attrs']['href'] for n in d.nodes if n['tag']=='a' and 'reading-nav' in n['ancestors']]
  assert_(actual==[prefix+x for x in wanted],file+': previous/next order')
  levels=[int(n['tag'][1]) for n in d.nodes if n['tag'] in ('h1','h2','h3','h4') and 'contents-panel' not in n['ancestors']]
  assert_(all(b<=a+1 for a,b in zip(levels,levels[1:])),file+': heading hierarchy')
 final_doc=docs[order[-1]['route']+'index.html']
 final_text=final_doc.selected('data-source-text')[-1]['text']
 assert_(build.prose_quotes.straight(final_text)==build.printbook.FINAL_LINE,'Last narrative line changed')
 # Compile exactly the HTML hero, with inference controls.
 hero=next(n['text'] for n in docs['index.html'].nodes if n['tag']=='pre')
 with tempfile.TemporaryDirectory() as directory:
  fixture=Path(directory)/'hero.ts'
  fixture.write_text(hero+'\nconst inferred: Answer<() => number> = 42;\nconst fallback: Answer<string> = "It depends";\n// @ts-expect-error inferred number must reject a string\nconst rejected: Answer<() => number> = "wrong";\n')
  run=subprocess.run([str(ROOT/'node_modules/.bin/tsc'),'--ignoreConfig','--strict','--exactOptionalPropertyTypes','--target','ES2022','--module','Node16','--noEmit',str(fixture)],capture_output=True,text=True)
  assert_(run.returncode==0,'Hero compile: '+run.stdout+run.stderr)
 # Colour pairs are read from the committed CSS, not copied test constants.
 css=(HERE/'site.css').read_text();palette=dict(re.findall(r'--([\w-]+):(#[0-9a-f]{6})',css))
 def lum(c):
  v=[int(c[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v];return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))
 contrast={}
 for fg,bg in [('ink','cream'),('muted','cream'),('brown','cream'),('keyword','code'),('string','code'),('comment','code'),('ink','code'),('muted','code'),('brown','code'),('ink','chip'),('ink','tan'),('cream','ink')]:
  a,b=sorted([lum(palette[fg]),lum(palette[bg])]);ratio=(b+.05)/(a+.05);contrast[fg+'/'+bg]=round(ratio,2);assert_(ratio>=4.5,'Contrast '+fg+'/'+bg)
 # Generated search metadata and local font assets are also part of the site contract.
 sitemap=ET.fromstring((site/'sitemap.xml').read_text())
 listed=[x.text for x in sitemap.findall('{*}url/{*}loc')]
 assert_(listed==[p['canonical'] for p in m['pages'].values() if p['route']!='404.html'],'Sitemap page inventory')
 assert_('Sitemap: '+config['base_url']+'sitemap.xml' in (site/'robots.txt').read_text(),'Robots sitemap')
 for target in re.findall(r'url\(([^)]+)\)',css):assert_((site/'assets'/target.strip('"\'')).is_file(),'CSS asset: '+target)
 for name in ['IBMPlexSans-OFL.txt','JetBrainsMono-OFL.txt','Oxanium-OFL.txt']:assert_((site/'assets/fonts'/name).is_file(),'Font licence '+name)
 for file,d in docs.items():
  assert_(any(n['attrs'].get('name')=='description' and n['attrs'].get('content') for n in d.nodes),file+': description')
  assert_(any(n['attrs'].get('property')=='og:image' and n['attrs'].get('content')==config['base_url']+'assets/cover.png' for n in d.nodes),file+': OG image')
 artifact=os.environ.get('WEB_PRINT_PDF');print_pdf={'status':'not supplied; print source still checked'}
 if artifact:
  actual=build.digest(Path(artifact));expected='b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3'
  assert_(actual==expected,'Accepted print PDF changed');print_pdf={'status':'PASS' if actual==expected else 'FAIL','sha256':actual}
 assert_(subprocess.check_output(['git','diff','8bdd8f1','--','book/','design/print/'],cwd=ROOT)==b'','Print/manuscript modified')
 result={'status':'FAIL' if fail else 'PASS','failures':fail,'pages':len(docs),'source_files':len(m['source_hashes']),'texts':len(texts),'fences':len(fences),'inline_code':len(inline),'quote_blocks':len(m['quotes']),'links':m['links'],'publication_terms':dict(terms),'contrast':contrast,'print_pdf':print_pdf}
 (HERE/'output/check.json').write_text(json.dumps(result,indent=2)+'\n');return result

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--site',type=Path,default=HERE/'output/site');a=p.parse_args();config=json.loads((HERE/'config.json').read_text())
 result=check(a.site,config)
 print(json.dumps(result,indent=2));raise SystemExit(bool(result['failures']))
