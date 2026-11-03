#!/usr/bin/env python3
"""Frozen whole-book PROOF. Source files are read, never rewritten."""
import argparse
from collections import Counter, defaultdict
import html
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from urllib.parse import quote

import pymupdf
from pygments import lex
from pygments.lexers import TypeScriptLexer, JavascriptLexer, JsonLexer, DiffLexer, TextLexer
from pygments.token import STANDARD_TYPES

import footnote_trial as trial
import prose_quotes
import symbol_key

HERE, ROOT = trial.HERE, trial.ROOT
OUT = HERE / 'output' / ('whole-book-proof-' + trial.read_json(HERE/'release-metadata.json')['manuscript_commit'][:7])
MD = trial.MD
FINAL_LINE = 'Oded: "Good. Now I have a green pull request and a meeting four minutes ago."'
ACTS = [
    ('Prologue', 'Before the debates'),
    ('Act I', 'The Type System'),
    ('Act II', 'Advanced TypeScript'),
    ('Act III', 'Patterns & Design'),
    ('Act IV', 'The Real World'),
    ('Bonus', 'AI & TypeScript'),
]
# Measured post-keep end pages: Ch13 two lines; Ch20 and Ch21 three source lines.
TAIL_BALANCE = {'book/02-advanced-typescript/07-declaration-merging.md', 'book/03-patterns-and-design/08-hof-patterns.md', 'book/03-patterns-and-design/07-currying-partial-application.md'}
LEXERS = {'typescript': TypeScriptLexer, 'javascript': JavascriptLexer, 'json': JsonLexer, 'diff': DiffLexer, 'text': TextLexer}


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def norm(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', prose_quotes.straight(text)).replace('\u200b', ''))


def plain(children):
    return ''.join(t.content if t.type in ('text', 'code_inline') else '\n' if t.type in ('softbreak', 'hardbreak') else '' for t in children or [])


def code_lines(source, language, fence_id):
    rendered = ['']
    for token, value in lex(source, LEXERS[language](stripnl=False, ensurenl=False)):
        for i, part in enumerate(value.split('\n')):
            if i:
                rendered.append('')
            if part:
                rendered[-1] += f'<span class="tok-{STANDARD_TYPES.get(token, "")}">{html.escape(part)}</span>'
    if source.endswith('\n'):
        rendered.pop()
    expected = source.split('\n')
    if source.endswith('\n'):
        expected.pop()
    trial.require(len(rendered) == len(expected), 'Highlighter changed line count')
    return ''.join(f'<span class="code-line" data-code-line="{fence_id}-{i}">{line or "&#8203;"}</span>' for i, line in enumerate(rendered)), {f'{fence_id}-{i}': line for i, line in enumerate(expected)}


def opener_art(number):
    if number is None:
        return ''
    return f'<div class="opener-art"><span class="opener-number">{number}</span></div>'


def key_meanings(key):
    return {seq:row['meaning'] for group in key['groups'] for row in group['rows'] for seq in row['combinations']}


def key_plain(text):
    return plain(MD.parseInline(text)[0].children)


def key_markup(text, intro=False):
    children = MD.parseInline(text)[0].children
    audit = prose_quotes.convert(children)
    trial.require(not audit.get('ambiguous'), 'Ambiguous generated key typography')
    for child in children:
        if intro and child.type=='code_inline':
            child.attrSet('data-key-intro-glyph',child.content)
    return MD.renderer.renderInline(children,MD.options,{})


def symbol_key_html():
    key = trial.read_json(HERE/'symbol-key.json')
    groups = []
    for i,group in enumerate(key['groups']):
        rows = []
        for row in group['rows']:
            for j,sequence in enumerate(row['combinations']):
                literal = ''.join(f'<span class="key-character">{html.escape(c)}</span>' for c in sequence)
                meaning = f'<td rowspan="{len(row["combinations"])}">{key_markup(row["meaning"])}</td>' if j==0 else ''
                rows.append(f'<tr data-symbol-sequence="{html.escape(sequence,quote=True)}"><td><code data-key-glyph>{html.escape(sequence)}</code></td><td><code data-key-literal>{literal}</code></td>{meaning}</tr>')
        groups.append(f'<section class="symbol-group" data-symbol-group="{i}"><h2>{html.escape(group["title"])}</h2><table><thead><tr><th>Printed glyph</th><th>Characters to type</th><th>Meaning</th></tr></thead><tbody>{"".join(rows)}</tbody></table></section>')
    intro = f'<h1>{html.escape(key["title"])}</h1><p>{key_markup(key["intro"],intro=True)}</p>'
    return f'<section class="front-page symbol-key running-title" data-running="Reading the code symbols"><div class="symbol-first">{intro}{groups[0]}</div>{"".join(groups[1:])}</section>'


def assemble(data, directory):
    links, hashes = trial.inputs(data)
    order = list(hashes)
    source_tables = trial.book_tables()
    tables_by_location = {(t['source'], t['line']): t for t in source_tables}
    manifest = {'manuscript_commit':data['manuscript_commit'], 'source_sha256': hashes, 'links': links, 'texts': {}, 'code': {}, 'fences': [], 'tables': [], 'notes': [], 'navigation': [], 'transcripts': [], 'documents': [], 'quote_audit': [], 'inline_code': {},
                'proof_settings': {'folios': 'continuous Arabic', 'starts': 'next page; no forced recto blanks'}}
    articles, toc = [], []
    last_act = None
    prologue_notes = 0
    for doc_index, name in enumerate(order):
        source = (ROOT / name).read_text()
        tokens = MD.parse(source)
        act = int(name.split('/')[1].split('-')[0])
        if act != last_act:
            aid = f'act-{act}'
            act_name, act_title = ACTS[act]
            heading = f'{act_name} / {act_title}'
            manifest['navigation'].append({'level': 1, 'id': aid, 'title': heading})
            toc.append((aid, heading, 'toc-act'))
            articles.append(f'<section class="act-opener running-title" data-running="{html.escape(heading, quote=True)}" data-destination="{aid}" id="{aid}"><div class="eyebrow">{act_name.upper()}</div>{opener_art(act if act in (1,2,3,4) else None)}<h1>{html.escape(act_title)}</h1><div class="opener-bottom">IT DEPENDS / {html.escape(data["subtitle"])}</div></section>')
            last_act = act
        first_h1 = next((i for i, t in enumerate(tokens) if t.type == 'heading_open' and t.tag == 'h1'), None)
        title = plain(tokens[first_h1 + 1].children) if first_h1 is not None else 'Dedication'
        quiet = name == 'book/00-prologue/00a-acknowledgments.md'
        doc_id = f'document-{doc_index}'
        manifest['navigation'].append({'level': 2, 'id': doc_id, 'title': title})
        toc.append((doc_id, title, 'toc-doc'))
        manifest['documents'].append({'source': name, 'id': doc_id, 'title': title, 'act': act, 'quiet':quiet, 'paragraphs':sum(t.type=='paragraph_open' for t in tokens)})
        reset = act > 0 or doc_index == 0
        articles.append(f'<article id="{doc_id}" data-document="{doc_index}" data-quiet-frontmatter="{str(quiet).lower()}" data-final-chapter="{str(name == order[-1]).lower()}" data-tail-balance="{str(name in TAIL_BALANCE).lower()}" data-destination="{doc_id}" class="source-chapter {"chapter" if reset else "prologue"}">')
        if first_h1 is None:
            articles.append('<div class="dedication running-title" data-running="Dedication">')
        if quiet:
            articles.append('<main class="acknowledgments running-title" data-running="Acknowledgments">')
        note_number = prologue_notes if act == 0 else 0
        section = subheading = ''
        fence_number = 0
        open_heading = False
        for i, token in enumerate(tokens):
            if token.type == 'heading_open':
                heading_text = plain(tokens[i + 1].children)
                if token.tag == 'h2':
                    section, subheading = heading_text, ''
                elif token.tag == 'h3':
                    subheading = heading_text
                hid = f'heading-{doc_index}-{i}'
                token.attrSet('id', hid)
                token.attrSet('data-destination', hid)
                token.attrSet('data-section', heading_text)
                if token.tag == 'h2':
                    manifest['navigation'].append({'level': 3, 'id': hid, 'title': heading_text})
                if i == first_h1 and not quiet:
                    label = re.match(r'(Chapter|Bonus) (\d+):', title)
                    number = label.group(2) if label else '·'
                    articles.append(f'<header class="chapter-opener running-title" data-running="{html.escape(title, quote=True)}"><div class="eyebrow">{ACTS[act][0].upper()} / {html.escape(ACTS[act][1].upper())}</div>{opener_art(number if label else None)}')
                    open_heading = True
                articles.append(MD.renderer.render([token], MD.options, {}))
            elif token.type == 'heading_close':
                articles.append(MD.renderer.render([token], MD.options, {}))
                if open_heading:
                    articles.append(f'<div class="opener-bottom">IT DEPENDS / {html.escape(data["subtitle"])}</div></header><main>')
                    open_heading = False
            elif token.type == 'inline':
                text_id = f'text-{doc_index}-{i}'
                manifest['texts'][text_id] = {'text': plain(token.children), 'source': name, 'line': token.map[0] + 1}
                children = token.children or []
                audit = prose_quotes.convert(children)
                if audit.get('converted') or audit.get('ambiguous'):
                    manifest['quote_audit'].append({'id':text_id, 'source':name, 'line':token.map[0]+1, **audit})
                bits, pending = [], None
                for j, child in enumerate(children):
                    if child.type == 'code_inline':
                        cid = f'inline-{doc_index}-{i}-{j}'
                        child.attrSet('data-inline-code-id', cid)
                        manifest['inline_code'][cid] = child.content
                    if child.type == 'link_open':
                        end = next(k for k in range(j + 1, len(children)) if children[k].type == 'link_close')
                        label = MD.renderer.renderInline(children[j + 1:end], MD.options, {})
                        href = child.attrGet('href')
                        if href.startswith('../../README.md'):
                            href = data['public_repository_url'].rstrip('/') + '/blob/' + quote(data['release_tag'], safe='') + '/README.md#checking-the-examples'
                            child.attrSet('href', href)
                        note_number += 1
                        nid = f'note-{doc_index}-{note_number}'
                        pending = {'id': nid, 'document': doc_id, 'number': note_number, 'href': href, 'label_html': label}
                        manifest['notes'].append(pending)
                    bits.append(MD.renderer.renderInline([child], MD.options, {}))
                    if child.type == 'link_close':
                        href = html.escape(pending['href'], quote=True)
                        bits.append(f'<span class="footnote" data-note-id="{pending["id"]}">{pending["label_html"]} — <a href="{href}">{href}</a></span>')
                        pending = None
                articles.append(f'<span data-text-id="{text_id}">' + ''.join(bits) + '</span>')
            elif token.type == 'fence':
                fence_number += 1
                language = token.info.strip()
                trial.require(language in LEXERS, f'Unsupported fence language {language}')
                fid = f'fence-{doc_index}-{fence_number}'
                markup, lines = code_lines(token.content, language, fid)
                manifest['code'].update(lines)
                raw = '\n'.join(source.splitlines()[token.map[0]:token.map[1]]) + '\n'
                manifest['fences'].append({'id': fid, 'source': name, 'line': token.map[0] + 1, 'language': language, 'content_sha256': trial.digest(token.content.encode()), 'raw_sha256': trial.digest(raw.encode()), 'content': token.content})
                caption = f'{language.upper()} / {fence_number:02d}'
                short = 'short' if len(lines) <= 12 else ''
                articles.append(f'<figure class="source {short}" data-fence-id="{fid}" data-line-count="{len(lines)}" data-caption="{caption}"><figcaption>{caption}</figcaption><pre><code>{markup}</code></pre></figure>')
            elif token.type == 'paragraph_open':
                upcoming = tokens[i + 1].content if i + 1 < len(tokens) else ''
                token.attrSet('class', 'speech' if upcoming.startswith(('**', '"', '“')) else 'narration')
                articles.append(MD.renderer.render([token], MD.options, {}))
            elif token.type == 'blockquote_open':
                transcript = act == 5 and (section not in ('The Verdict', 'The Debate Continues') or subheading == 'The next request')
                token.attrSet('class', 'transcript' if transcript else 'ruling')
                if transcript:
                    label = 'ASSISTANT REQUEST' if Path(name).name.startswith('01-') else 'SAVED TRANSCRIPT' if Path(name).name.startswith('02-') else 'ASSISTANT MESSAGE'
                    token.attrSet('data-label', label)
                    manifest['transcripts'].append({'source': name, 'line': token.map[0] + 1, 'label': label})
                articles.append(MD.renderer.render([token], MD.options, {}))
            elif token.type == 'table_open':
                table = tables_by_location[(name, token.map[0] + 1)]
                token.attrSet('data-book-table', table['id'])
                manifest['tables'].append({k: v for k, v in table.items() if k != 'html'})
                articles.append(MD.renderer.render([token], MD.options, {}))
            else:
                trial.require(token.type not in ('html_block', 'html_inline', 'image'), f'Unreviewed raw markup: {name}')
                articles.append(MD.renderer.render([token], MD.options, {}))
        articles.append('</main></article>' if first_h1 is not None else '</div></article>')
        if act == 0:
            prologue_notes = note_number
    trial.require(list(manifest['texts'].values())[-1]['text'] == FINAL_LINE, 'Final narrative line changed')
    trial.require(len(manifest['notes']) == 7 and len(manifest['tables']) == 17 and len(manifest['transcripts']) == 7, 'Lost links/tables/transcripts')
    contents = ''.join(f'<li class="{kind}"><a href="#{target}" data-toc-target="{target}"><span>{html.escape(title)}</span><span class="toc-page">000</span></a></li>' for target, title, kind in toc)
    metadata = ''.join(f'<dt>{label}</dt><dd>{html.escape(data[key])}</dd>' for key, label in [('public_repository_url', 'Public repository (placeholder)'), ('release_tag','Release tag (placeholder)'), ('license','License (placeholder)'), ('imprint','Imprint (placeholder)'), ('manuscript_commit','Frozen manuscript commit')])
    front = f'''<section class="front-page cover running-title" data-running="IT DEPENDS / PROOF"><div class="eyebrow">WHOLE-BOOK PROOF</div><h1>{html.escape(data['title'])}</h1><h2>{html.escape(data['subtitle'])}</h2><div class="opener-bottom">PROOF / NOT FOR RELEASE</div></section>
<section class="front-page metadata"><h1>Proof information</h1><p>This proof uses placeholder publication metadata. It is not for release.</p><dl>{metadata}</dl><p>Continuous Arabic folios. Acts and chapters start on the next page; no recto blanks have been inserted.</p></section>
<nav class="contents"><h1>Contents</h1><ol class="toc">{contents}</ol></nav>{symbol_key_html()}'''
    document = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>It Depends — whole-book PROOF</title><link rel="stylesheet" href="{(HERE/'proof.css').as_uri()}"><script>window.PagedConfig={{auto:false}};</script><script src="{(HERE/'node_modules/pagedjs/dist/paged.polyfill.js').as_uri()}"></script><script src="{(HERE/'chapter-counters.js').as_uri()}"></script><script src="{(HERE/'proof-handler.js').as_uri()}"></script></head><body>{front}{''.join(articles)}</body></html>'''
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'book.html').write_text(document)
    write_json(directory / 'source-manifest.json', manifest)
    return manifest


def pdf_rect(rect, page_origin, padding=0):
    return pymupdf.Rect((rect['x']-page_origin['x'])*.75-padding, (rect['y']-page_origin['y'])*.75-padding, (rect['right']-page_origin['x'])*.75+padding, (rect['bottom']-page_origin['y'])*.75+padding)


def link_signature(link):
    return {k: list(v) if isinstance(v, (pymupdf.Point, pymupdf.Rect)) else v for k, v in link.items() if k not in ('xref','id')}


def validate(directory, manifest):
    result = trial.read_json(directory / 'layout.json')
    layout = result['layout']
    pages, targets = layout['pages'], layout['targets']
    document = pymupdf.open(directory / 'raw.pdf')
    failures, observations = [], []
    def check(ok, message):
        if not ok:
            failures.append(message)
    check(len(document) == len(pages) == result['pagination']['pages'], 'Page count mismatch')
    check(not result['external'] and not result['errors'], 'Browser errors/network attempts')
    text_pieces, code_pieces, table_pages = defaultdict(list), defaultdict(list), defaultdict(list)
    inline_pieces, fence_pages = defaultdict(list), defaultdict(list)
    source_pages = defaultdict(list)
    note_pages, printed_notes = {}, []
    for p in pages:
        number, origin = p['page'], p['rect']
        pdf = document[number-1]
        check(abs(pdf.rect.width-504)<.1 and abs(pdf.rect.height-720)<.1, f'p{number}: trim')
        all_text = pdf.get_text()
        check('PROOF' in pdf.get_text(clip=pymupdf.Rect(0,680,504,720)), f'p{number}: missing proof footer')
        check(re.findall(r'(?m)^\d+$', pdf.get_text(clip=pymupdf.Rect(0,680,504,720))) == [str(number)], f'p{number}: wrong folio')
        check(bool(pdf.get_text(clip=pymupdf.Rect(0,42,504,678)).strip()), f'p{number}: unintended blank page')
        for font in pdf.get_fonts(full=True):
            check(font[2]=='Type3' or bool(document.extract_font(font[0])[3]), f'p{number}: font not embedded: {font[3]}')
        raw = pdf.get_text('dict')
        spans = [s for b in raw['blocks'] for l in b.get('lines',[]) for s in l['spans']]
        expected_notes = [n for n in manifest['notes'] if any(n['id']==x['id'] for x in p['notes'])]
        note_numbers = trial.printed_note_numbers(pdf.get_text(clip=pdf_rect(p['footnotes'],origin))) if p['notes'] else []
        call_numbers = []
        for call in p['calls']:
            r = pdf_rect(call['rect'], origin)
            r.y0 -= 9; r.y1 += 2.25
            digits = [s['text'] for s in spans if s['flags']&1 and re.fullmatch(r'\d+',s['text']) and r.contains((pymupdf.Rect(s['bbox']).tl+pymupdf.Rect(s['bbox']).br)/2)]
            check(len(digits)==1, f'p{number}: callout extraction {digits}')
            call_numbers.extend(map(int,digits))
            matches = [n for n in p['notes'] if n['ref']==call['ref']]
            check(len(matches)==1, f'p{number}: note not on callout page')
        check(call_numbers==note_numbers==[n['number'] for n in expected_notes], f'p{number}: PDF call/note numbers {call_numbers}/{note_numbers}')
        if note_numbers:
            printed_notes.append({'page':number,'callouts':call_numbers,'notes':note_numbers})
        for n in p['notes']:
            note_pages[n['id']] = number
            expected = next(x for x in manifest['notes'] if x['id']==n['id'])
            check(expected['href'] in norm(pdf.get_text(clip=pdf_rect(p['footnotes'],origin,1))), f'p{number}: note URL not selectable')
            check(any(l.get('uri')==expected['href'] for l in pdf.get_links()), f'p{number}: external URL not clickable')
            check(n['rect']['bottom']<=p['footnotes']['bottom']+1, f'p{number}: footnote overflow')
        for kind, expected, accumulator in [('texts',manifest['texts'],text_pieces),('code',manifest['code'],code_pieces)]:
            for item in p[kind]:
                check(item['id'] in expected, f'p{number}: unexpected source id {item["id"]}')
                text = item['text'].replace('\u200b','')
                accumulator[item['id']].append(text)
                source_pages[item['id']].append(number)
                box = pdf_rect(item['rect'],origin,1.5)
                # Superscript callout spans are build-owned; source text is compared without them.
                selected = pdf.get_text('dict',clip=box)
                extracted = ''.join(s['text'] for b in selected['blocks'] for l in b.get('lines',[]) for s in l['spans'] if not (s['size']<8 and re.fullmatch(r'\d+',s['text']) and any(pdf_rect(c['rect'],origin,2).intersects(pymupdf.Rect(s['bbox'])) for c in p['calls'])))
                check(norm(text) in norm(extracted), f'p{number}: PDF text missing/changed {item["id"]}: {text[:65]!r}')
                r, body = item['rect'], p['body']
                check(r['x']>=body['x']-1 and r['right']<=body['right']+1, f'p{number}: horizontal overflow {item["id"]}')
                check(r['y']>=body['y']-1 and r['bottom']<=body['bottom']+1, f'p{number}: vertical overflow {item["id"]}')
                if p['notes']:
                    check(r['bottom']<=p['footnotes']['y']+1, f'p{number}: body/note overlap {item["id"]}')
        for item in p['inline_code']:
            inline_pieces[item['id']].append(item['text'])
        for figure in p['figures']:
            lines = [c for c in p['code'] if c['id'].startswith(figure['id']+'-')]
            if lines:
                fence_pages[figure['id']].append({'page':number,'lines':len(lines)})
        for keep in p['keeps']:
            target = next((b for b in p['blocks'] if b['ref']==keep['target']), None)
            check(target is not None, f'p{number}: stranded heading/introduction: {keep["text"][:80]}')
            if target and target['tag']=='FIGURE':
                fig = next(f for f in p['figures'] if abs(f['rect']['y']-target['rect']['y'])<.1)
                count = len([c for c in p['code'] if c['id'].startswith(fig['id']+'-')])
                total = len([k for k in manifest['code'] if k.startswith(fig['id']+'-')])
                check(count>=min(4,total), f'p{number}: introduction without meaningful code')
        for table in p['tables']:
            table_pages[table['id']].append(number)
            check(table['rect']['bottom']<=p['body']['bottom']+1, f'p{number}: table outside body')
        for row in p['contents']:
            check(row['page']==str(targets[row['target']]), f'p{number}: contents page mismatch')
            text = norm(pdf.get_text(clip=pdf_rect(row['rect'],origin,1)))
            check(text.endswith(row['page']), f'p{number}: printed contents folio missing')
        # Review aids, not failures: short continuation pages, low fill, late headings.
        chunks = p['texts'] + p['code']
        if chunks:
            bottom = max(c['rect']['bottom'] for c in chunks)
            fill = (bottom-p['body']['y'])/p['body']['height']
            if fill < .45 and number not in targets.values():
                observations.append({'page':number,'kind':'low body fill','fill':round(fill,3)})
        for h in p['headings']:
            if h['rect']['y'] > p['body']['y'] + .75*p['body']['height']:
                observations.append({'page':number,'kind':'heading low on page','text':h['text']})
        for figure in p['figures']:
            if figure['continued']:
                lines = [c for c in p['code'] if c['id'].startswith(figure['id']+'-')]
                if len(lines)<4:
                    observations.append({'page':number,'kind':'short code continuation','fence':figure['id'],'lines':len(lines)})
    for key, expected in manifest['texts'].items():
        check(prose_quotes.straight(''.join(text_pieces[key]))==prose_quotes.straight(expected['text']), f'DOM source text loss/duplication: {key}')
    for key, expected in manifest['inline_code'].items():
        check(''.join(inline_pieces[key])==expected, f'Inline code changed: {key}')
    for fid, fragments in fence_pages.items():
        total = sum(f['lines'] for f in fragments)
        check(len(fragments)==1 or total>12, f'Short fence split: {fid}')
        check(len(fragments)==1 or all(f['lines']>=4 for f in fragments), f'Fence fragment under four lines: {fid}: {fragments}')
    for audit in manifest['quote_audit']:
        check(not audit.get('converted') or prose_quotes.verify_printed(''.join(text_pieces[audit['id']]),audit), f'Unbalanced converted paragraph: {audit["id"]}')
    for key, expected in manifest['code'].items():
        check(''.join(code_pieces[key])==expected, f'DOM code line changed: {key}')
    for fence in manifest['fences']:
        keys = [k for k in manifest['code'] if k.startswith(fence['id']+'-')]
        reconstructed = '\n'.join(''.join(code_pieces[k]) for k in keys)
        if fence['content'].endswith('\n'):
            reconstructed += '\n'
        check(trial.digest(reconstructed.encode())==fence['content_sha256'], f'Rendered fence hash changed: {fence["id"]}')
    for t in manifest['tables']:
        check(len(table_pages[t['id']])==1, f'Book table split/missing: {t["id"]}: {table_pages[t["id"]]}')
    check(len(note_pages)==len(manifest['notes'])==7, 'Missing/duplicated footnotes')
    final_id = list(manifest['texts'])[-1]
    check(source_pages[final_id]==[len(pages)], 'Last narrative not on final page')
    check(pages[-1]['texts'][-1]['id']==final_id, 'Source text follows last line')
    final_body = document[-1].get_text(clip=pdf_rect(pages[-1]['body'],pages[-1]['rect']))
    check(norm(final_body).endswith(norm(FINAL_LINE)), 'PDF final narrative line not exact / material follows it')
    check(not pages[-1]['notes'], 'A footnote follows final narrative')
    last_doc = len(manifest['documents'])-1
    check(note_pages.get(f'note-{last_doc}-1',0)<targets[next(n['id'] for n in manifest['navigation'] if n['level']==3 and n['title']=='The Verdict' and n['id'].startswith(f'heading-{last_doc}-'))], 'Final source note must precede final Verdict')
    for i, doc in enumerate(manifest['documents']):
        if not doc.get('quiet'):
            continue
        appearances = [(p['page'],item) for p in pages for item in p['quiet_frontmatter'] if item['id']==doc['id']]
        check(len(appearances)==1, 'Quiet front matter must occupy exactly one page')
        if appearances:
            number,item = appearances[0]
            check(not item['opener'] and item['paragraphs']==doc['paragraphs'] and item['headings']==1, 'Acknowledgments need their heading and source paragraphs, without an opener')
            check(i>0 and manifest['documents'][i-1]['source'].endswith('/00-dedication.md') and targets[doc['id']]==targets[manifest['documents'][i-1]['id']]+1, 'Acknowledgments must immediately follow the dedication')
    write_json(directory/'content-validation.json', {'failures': failures, 'observations': observations})
    # Build-owned navigation uses measured destinations, not inferred page offsets.
    bookmarks = [[n['level'],n['title'],targets[n['id']]] for n in manifest['navigation']]
    document.set_toc(bookmarks)
    for p in pages:
        pdf = document[p['page']-1]
        for call in p['calls']:
            box = pdf_rect(call['rect'],p['rect'])
            note = next(n for n in p['notes'] if n['ref']==call['ref'])
            for link in pdf.get_links():
                if link['kind'] != pymupdf.LINK_URI and box.intersects(link['from']):
                    pdf.delete_link(link)
            pdf.insert_link({'kind':pymupdf.LINK_GOTO,'from':box,'page':p['page']-1,'to':pdf_rect(note['rect'],p['rect']).tl})
        for row in p['contents']:
            box = pdf_rect(row['rect'],p['rect'])
            for link in pdf.get_links():
                if box.intersects(link['from']):
                    pdf.delete_link(link)
            pdf.insert_link({'kind':pymupdf.LINK_GOTO,'from':box,'page':targets[row['target']]-1,'to':pymupdf.Point(0,0)})
    document.set_metadata({'title':'It Depends — whole-book PROOF','subject':f'Frozen manuscript {manifest["manuscript_commit"]}; placeholder metadata; not for release','creator':'Pinned local Paged.js proof build','producer':'Chrome / PyMuPDF'})
    final_path = directory / 'It-Depends-PROOF.pdf'
    document.save(final_path, garbage=3, deflate=True)
    document.close()
    final = pymupdf.open(final_path)
    check(final.get_toc()==bookmarks, 'Bookmarks changed on save')
    for p in pages:
        saved_links = final[p['page']-1].get_links()
        for call in p['calls']:
            box = pdf_rect(call['rect'],p['rect'])
            note = next(n for n in p['notes'] if n['ref']==call['ref'])
            destination = pdf_rect(note['rect'],p['rect']).tl
            check(any(l.get('page')==p['page']-1 and box.intersects(l['from']) and abs(l.get('to',pymupdf.Point(-1,-1))-destination)<.1 for l in saved_links), f'p{p["page"]}: callout destination is not its note')
        for row in p['contents']:
            check(any(l.get('page')==targets[row['target']]-1 and pdf_rect(row['rect'],p['rect']).intersects(l['from']) for l in saved_links), f'p{p["page"]}: contents link target')
    ligatures = symbol_key.inventory(final_path, pages, HERE/'fonts')
    write_json(directory/'symbol-inventory.json', ligatures)
    check(set(ligatures)==set(key_meanings(trial.read_json(HERE/'symbol-key.json'))), 'Symbol key differs from actual rendered code ligatures')
    key_font = pymupdf.Font(fontfile=str(HERE/'fonts/JetBrainsMono-Regular.ttf'))
    key_rows = []
    for page in pages:
        pdf = final[page['page']-1]
        for symbol in page['symbols']:
            sequence = symbol['sequence']
            drawn = symbol_key.printed_glyphs(pdf,symbol_key.rect(symbol['glyph'],page['rect']))
            typed = symbol_key.printed_glyphs(pdf,symbol_key.rect(symbol['literal'],page['rect']))
            check(any(drawn==x['glyphs'] for x in ligatures.get(sequence,[])), f'Symbol key does not show the source glyph: {sequence}')
            check(typed==[key_font.has_glyph(ord(c)) for c in sequence], f'Symbol key typing column fused: {sequence}')
            key_rows.append(sequence)
    check(len(key_rows)==len(ligatures) and set(key_rows)==set(ligatures), 'Symbol key rows incomplete/duplicated')
    key = trial.read_json(HERE/'symbol-key.json')
    group_pages = defaultdict(list)
    for page in pages:
        for group in page['symbol_groups']:
            if group['rows']:
                group_pages[int(group['id'])].append(page['page'])
                expected = key['groups'][int(group['id'])]
                check(group['title']==expected['title'], 'Symbol group heading changed')
                check(group['rows']==[seq for row in expected['rows'] for seq in row['combinations']], 'Symbol group row order changed')
        for sample in page['symbol_intro']:
            drawn = symbol_key.printed_glyphs(final[page['page']-1],symbol_key.rect(sample['rect'],page['rect']))
            check(any(drawn==x['glyphs'] for x in ligatures.get(sample['sequence'],[])), 'Intro example is not fused: '+sample['sequence'])
    check(sorted(group_pages)==list(range(len(key['groups']))) and all(len(v)==1 for v in group_pages.values()), 'Symbol-key page break split a group')
    check([p for i in sorted(group_pages) for p in group_pages[i]]==sorted(p for v in group_pages.values() for p in v), 'Symbol key group order changed')
    check([s['sequence'] for p in pages for s in p['symbol_intro']]==['=>','==='], 'Missing intro glyph examples')
    measure = layout['symbol_key_measure']
    body_height = pages[0]['body']['height']*.75
    check(measure['first_bundle_pt']<=body_height+1, 'Symbol intro and first group cannot fit one page at body size')
    if measure['total_pt']<=body_height:
        check(len({p for v in group_pages.values() for p in v})==1, 'Symbol key fits one page but was split')

    failures.extend(symbol_key.text_errors(final,pages,trial.read_json(HERE/'symbol-key.json'),norm,key_plain))
    endings = []
    for document_index, doc in enumerate(manifest['documents']):
        ids = [k for k in manifest['texts'] if k.startswith(f'text-{document_index}-')]
        end_page = source_pages[ids[-1]][-1]
        metric = pages[end_page-1]
        boxes = [pdf_rect(x['rect'],metric['rect'],.5) for x in metric['texts']+metric['code']]
        lines = [line for block in final[end_page-1].get_text('dict')['blocks'] for line in block.get('lines',[])
                 if any(box.contains((pymupdf.Rect(line['bbox']).tl+pymupdf.Rect(line['bbox']).br)/2) for box in boxes)
                 and ''.join(s['text'] for s in line['spans']).strip()]
        endings.append({'source':doc['source'],'page':end_page,'source_lines':len(lines)})
        if doc['act']>0:
            check(len(lines)>3, f'Chapter ending carries <=3 source lines: {doc["source"]} p{end_page}')
    report = {'status':'PASS' if not failures else 'FAIL','pages':len(final),'failures':failures,'observations':observations,'notes':printed_notes,
              'symbol_key_measure':measure,'symbol_group_pages':dict(group_pages),'endings':endings, 'ligature_sequences':list(ligatures), 'fences':len(manifest['fences']),'fence_languages':dict(Counter(f['language'] for f in manifest['fences'])),
              'source_text_blocks':len(manifest['texts']),'code_lines':len(manifest['code']),'tables':dict(table_pages),'bookmarks':len(bookmarks),
              'fence_fragments':dict(fence_pages), 'quote_audit':manifest['quote_audit'], 'source_pages':dict(source_pages),'targets':targets,'pdf':str(final_path),'pdf_sha256':trial.digest(final_path.read_bytes())}
    write_json(directory/'validation.json',report)
    (directory/'extracted-text.txt').write_text('\n\f\n'.join(p.get_text() for p in final))
    return report


def artifacts(directory):
    doc = pymupdf.open(directory/'It-Depends-PROOF.pdf')
    image_dir = directory/'pages'; image_dir.mkdir(exist_ok=True)
    for i,p in enumerate(doc):
        p.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),alpha=False).save(image_dir/f'page-{i+1:03d}.png')
    sheets = directory/'contact-sheets'; sheets.mkdir(exist_ok=True)
    # Consecutive pairs 2/3, 4/5, etc. are actual facing pages; cover is shown alone.
    groups = [[0]] + [list(range(i,min(i+2,len(doc)))) for i in range(1,len(doc),2)]
    for start in range(0,len(groups),8):
        sheet = pymupdf.open(); page = sheet.new_page(width=1068,height=1555)
        page.draw_rect(page.rect,fill=(.9,.9,.9),color=None)
        for pos,group in enumerate(groups[start:start+8]):
            col, row = pos%2, pos//2
            for side,i in enumerate(group):
                x,y = 12 + col*528 + side*252, 15 + row*385
                box=pymupdf.Rect(x,y,x+246,y+351.43)
                page.draw_rect(box,fill=(1,1,1),color=None)
                page.show_pdf_page(box,doc,i)
                page.insert_text((x,y+365),f'PROOF / {i+1}',fontsize=8)
        page.get_pixmap(alpha=False).save(sheets/f'spreads-{start//8+1:02d}.png')
    return len(doc), len(list(sheets.glob('*.png')))


def compare(a,b):
    da,db = pymupdf.open(a/'It-Depends-PROOF.pdf'),pymupdf.open(b/'It-Depends-PROOF.pdf')
    failures=[]
    for directory, pdf in [(a,da),(b,db)]:
        failures.extend(symbol_key.text_errors(pdf,trial.read_json(directory/'layout.json')['layout']['pages'],trial.read_json(HERE/'symbol-key.json'),norm,key_plain))
    if len(da)!=len(db):
        failures.append('Page count differs')
    page_hashes=[]
    for i in range(min(len(da),len(db))):
        pa,pb=da[i],db[i]
        text_a,text_b=pa.get_text('rawdict'),pb.get_text('rawdict')
        for label, raw in [('a',text_a),('b',text_b)]:
            for block in raw['blocks']:
                for line in block.get('lines',[]):
                    for span in line['spans']:
                        box=pymupdf.Rect(span['bbox'])
                        if box.x0 < -.5 or box.y0 < -.5 or box.x1 > 504.5 or box.y1 > 720.5:
                            failures.append(f'{label} p{i+1}: PDF text outside trim')
        if text_a!=text_b:
            failures.append(f'p{i+1}: text/geometry differs')
        la,lb=[link_signature(l) for l in pa.get_links()],[link_signature(l) for l in pb.get_links()]
        if la!=lb:
            failures.append(f'p{i+1}: links differ')
        ha=trial.digest(pa.get_pixmap(alpha=False).samples); hb=trial.digest(pb.get_pixmap(alpha=False).samples)
        page_hashes.append({'page':i+1,'a':ha,'b':hb})
        if ha!=hb:
            failures.append(f'p{i+1}: raster differs')
    if da.get_toc()!=db.get_toc():
        failures.append('Bookmarks differ')
    return {'status':'PASS' if not failures else 'FAIL','pages':len(da),'failures':failures,'raster_sha256':page_hashes,'comparison':'PDF text, character geometry, links, bookmarks and every page raster; volatile PDF metadata/xref IDs excluded; all text bounds checked against trim'}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run',choices=['a','b'],default='a')
    parser.add_argument('--inspect-existing',action='store_true')
    parser.add_argument('--compare',action='store_true')
    args=parser.parse_args()
    data=trial.read_json(HERE/'release-metadata.json')
    placeholders=trial.metadata('proof',data)
    subprocess.run([str(HERE/'.venv/bin/python'),str(HERE/'footnote_trial.py'),'--validate-only'],check=True)
    directory=OUT/args.run
    if args.compare:
        report=compare(OUT/'a',OUT/'b'); write_json(OUT/'comparison.json',report)
        print(json.dumps({k:v for k,v in report.items() if k!='raster_sha256'},indent=2)); sys.exit(bool(report['failures']))
    if args.inspect_existing:
        manifest=trial.read_json(directory/'source-manifest.json')
    else:
        trial.require(not directory.exists(),f'Clean render requires a new run directory: {directory}')
        manifest=assemble(data,directory)
        spec={'name':f'whole-book-{args.run}','kind':'book','html':str(directory/'book.html'),'pdf':str(directory/'raw.pdf'),
              'dom':str(directory/'rendered.html'),'layout':str(directory/'layout.json'),'timeoutMs':600000}
        write_json(directory/'render-spec.json',[spec])
        print(f'Rendering {len(manifest["source_sha256"])} files; {len(manifest["fences"])} fences; {len(manifest["texts"])} text blocks',flush=True)
        subprocess.run(['node',str(HERE/'render-trial.cjs'),str(directory/'render-spec.json')],check=True,timeout=1200)
    report=validate(directory,manifest)
    trial.require(trial.inputs(data)[1]==manifest['source_sha256'],'Manuscript changed during build')
    write_json(directory/'toolchain.json',{'versions':trial.read_json(HERE/'trial-toolchain.json'),'metadata':data,'placeholders':placeholders,'fonts':{p.name:trial.digest(p.read_bytes()) for p in sorted((HERE/'fonts').glob('*.ttf'))},'styles':{p.name:trial.digest(p.read_bytes()) for p in [HERE/'proof.css',HERE/'proof-handler.js',HERE/'chapter-counters.js']}})
    if args.run=='a':
        count,sheets=artifacts(directory); print(f'{count} page images; {sheets} spread contact sheets',flush=True)
    print(json.dumps({k:v for k,v in report.items() if k not in ('source_pages','targets','observations','fence_fragments','quote_audit')},indent=2),flush=True)
    sys.exit(bool(report['failures']))


if __name__=='__main__':
    main()
