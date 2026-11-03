#!/usr/bin/env python3
"""Step 1 only: local page-bottom footnote trial; never assembles the book."""
import argparse
import hashlib
import html
import importlib.metadata
import json
from pathlib import Path
import platform
import re
import subprocess
import sys
from urllib.parse import quote, urlsplit

from markdown_it import MarkdownIt
import pymupdf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = HERE / 'output' / 'footnote-trial'
MD = MarkdownIt('commonmark').enable('table')


def read_json(path):
    return json.loads(path.read_text())


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def metadata(mode, data):
    required = ('title', 'subtitle', 'manuscript_commit', 'public_repository_url', 'release_tag', 'license', 'imprint')
    require(all(isinstance(data.get(key), str) and data[key].strip() for key in required), 'Missing metadata')
    require(re.fullmatch(r'[a-f0-9]{40}', data['manuscript_commit']), 'Full manuscript commit required')
    parsed = urlsplit(data['public_repository_url'])
    require(parsed.scheme == 'https' and parsed.netloc and not parsed.query and not parsed.fragment, 'Repository must be an HTTPS base URL')
    placeholders = [key for key in required if re.search(r'\bTBD\b|example\.invalid|PLACEHOLDER', data[key], re.I)]
    require(mode != 'release' or not placeholders, 'Release metadata placeholders: ' + ', '.join(placeholders))
    return placeholders


def inventory(source, text):
    """Parse links, reject this book's speaker paragraphs and quoted continuations.

    Deliberately conservative: a link in any quoted paragraph or blockquote
    needs editorial relocation. Code literals are not links. This is a syntax
    gate for the book's dialogue conventions, not a natural-language classifier.
    """
    results = []
    quote_depth = 0
    for token in MD.parse(text):
        if token.type == 'blockquote_open':
            quote_depth += 1
        elif token.type == 'blockquote_close':
            quote_depth -= 1
        if token.type != 'inline':
            continue
        children = token.children or []
        for i, child in enumerate(children):
            if child.type != 'link_open':
                continue
            dialogue = quote_depth or re.match(r'^\s*(?:\*\*[^*]+\*\*\s*:|["“]|\*["“])', token.content)
            # Also reject narration that embeds speech containing a link.
            prefix = ''.join(c.content for c in children[:i] if c.type in ('text', 'code_inline'))
            dialogue = dialogue or prefix.count('"') % 2 or prefix.count('“') > prefix.count('”')
            require(not dialogue, f'Dialogue link: {source}:{token.map[0] + 1}')
            end = next(j for j in range(i + 1, len(children)) if children[j].type == 'link_close')
            label = MD.renderer.renderInline(children[i + 1:end], MD.options, {})
            results.append({'source': source, 'line': token.map[0] + 1, 'href': child.attrGet('href'), 'label_html': label})
    return results


def baseline(actual, expected):
    require([{'source': x['source'], 'href': x['href']} for x in actual] == expected, 'Link inventory differs from the approved six external links + README')


def inputs(data):
    order = (ROOT / 'docs/editorial/full-review/reading-order.txt').read_text().splitlines()
    files = sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'book').rglob('*.md'))
    require(len(order) == 33 and sorted(order) == files, 'Reading order must cover every manuscript file exactly once')
    links, hashes = [], {}
    for name in order:
        raw = (ROOT / name).read_bytes()
        frozen = subprocess.check_output(['git', 'show', f'{data["manuscript_commit"]}:{name}'], cwd=ROOT)
        require(raw == frozen, f'Frozen manuscript changed: {name}')
        hashes[name] = digest(raw)
        links += inventory(name, raw.decode())
    baseline(links, read_json(HERE / 'link-inventory.json'))
    require(sum(x['href'].startswith('https://') for x in links) == 6 and len(links) == 7, 'Expected 6 external and 1 README links')
    return links, hashes


def control_tests(data):
    tests = 0
    def rejects(fn, message):
        nonlocal tests
        try:
            fn()
        except ValueError as error:
            require(message in str(error), f'Wrong control failure: {error}')
        else:
            raise ValueError(f'Control did not fail: {message}')
        tests += 1
    metadata('proof', data); tests += 1
    # A synthetic placeholder stays a useful negative control after metadata is filled.
    rejects(lambda: metadata('release', {**data, 'license': 'TBD'}), 'Release metadata placeholders')
    good = {**data, 'public_repository_url': 'https://example.org/book', 'release_tag': 'v1', 'license': 'MIT', 'imprint': 'Test imprint'}
    metadata('release', good); tests += 1
    for sample in ['**Noam Runtime**: "Read [this](https://example.org)."',
                   '"Read [this](https://example.org)."',
                   '> Read [this](https://example.org).',
                   'Noam says, "Read [this](https://example.org)."',
                   '“Read [this](https://example.org).”']:
        rejects(lambda: inventory('control.md', sample), 'Dialogue link')
    require(inventory('control.md', '`[literal](https://example.org)`\n\n```text\n[a](https://example.org)\n```') == [], 'Code is not a link'); tests += 1
    ordinary = inventory('control.md', 'He opens [**the** `source`](https://example.org/path?a=1&b=2#frag).')
    require(ordinary[0]['label_html'] == '<strong>the</strong> <code>source</code>' and ordinary[0]['href'] == 'https://example.org/path?a=1&b=2#frag', 'Formatted label / full target lost'); tests += 1
    rejects(lambda: baseline(ordinary, []), 'Link inventory differs')
    require(baseline([], []) is None, 'Restored inventory control'); tests += 1
    require(printed_note_numbers('2. first\n2. second\n') != [1, 2], 'Duplicate marker control'); tests += 1
    require(printed_note_numbers('1. first\n2. second\n') == [1, 2], 'Restored marker control'); tests += 1
    return tests


def book_tables():
    tables = []
    for name in (ROOT / 'docs/editorial/full-review/reading-order.txt').read_text().splitlines():
        source = (ROOT / name).read_text()
        tokens = MD.parse(source)
        for i, token in enumerate(tokens):
            if token.type != 'table_open':
                continue
            end = next(j for j in range(i + 1, len(tokens)) if tokens[j].type == 'table_close')
            subset = tokens[i:end + 1]
            table_id = f'book-table-{len(tables) + 1:02d}'
            token.attrSet('data-book-table', table_id)
            cells = [''.join(c.content for c in t.children or [] if c.type in ('text', 'code_inline')) for t in subset if t.type == 'inline']
            raw = '\n'.join(source.splitlines()[token.map[0]:token.map[1]]) + '\n'
            tables.append({'id': table_id, 'source': name, 'line': token.map[0] + 1,
                           'markdown_sha256': digest(raw.encode()), 'cells': cells,
                           'html': MD.renderer.render(subset, MD.options, {})})
    require(len(tables) == 17, 'Frozen book table count changed')
    return tables


def fixtures(links, data):
    specs = []
    def specimen(name, title, build):
        notes = []
        def link(index, label=None, chapter=1):
            source = links[index]
            href = source['href']
            if href.startswith('../../README.md'):
                href = (data['public_repository_url'].rstrip('/') + '/blob/' + quote(data['release_tag'], safe='') + '/README.md#checking-the-examples')
            label = label or source['label_html']
            note_id = f'{name}-note-{len(notes) + 1}'
            notes.append({'id': note_id, 'href': href, 'label_html': label, 'chapter': chapter,
                          'number': 1 + sum(n['chapter'] == chapter for n in notes)})
            target = html.escape(href, quote=True)
            return f'<a href="{target}">{label}</a><span class="footnote" data-note-id="{note_id}">{label} — <a href="{target}">{html.escape(href)}</a></span>'
        content, markers = build(link)
        text = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<link rel="stylesheet" href="{(HERE / 'trial.css').as_uri()}">
<script>window.PagedConfig = {{auto:false}};</script><script src="{(HERE / 'node_modules/pagedjs/dist/paged.polyfill.js').as_uri()}"></script>
<script src="{(HERE / 'chapter-counters.js').as_uri()}"></script>
</head><body><h1>{html.escape(title)}</h1>{content}</body></html>'''
        stem = OUT / name
        paths = {ext: str(stem.with_suffix(suffix)) for ext, suffix in [('html', '.html'), ('pdf', '.pdf'), ('dom', '.rendered.html'), ('layout', '.layout.json')]}
        Path(paths['html']).write_text(text)
        specs.append({'name': name, **paths, 'notes': notes, 'markers': markers})
    def short(link):
        return (f'<p>Two occurrences on one page: {link(2)}. The repeated target gets its own note: {link(2, "<em>the same</em> <code>suggestion</code>")}.</p>'
                '<p data-body-marker="SHORT-END">SHORT-END. This is a synthetic layout fixture, not manuscript prose.</p>', ['SHORT-END'])
    specimen('01-short-repeat', 'Short links / two occurrences', short)
    def long_url(link):
        return (f'<p>The pinned commit and line range survive in {link(4)}.</p>'
                f'<p>The other long source is {link(1)}.</p><p data-body-marker="LONG-END">LONG-END.</p>', ['LONG-END'])
    specimen('02-long-urls', 'Long URLs / unchanged targets', long_url)
    def near(link):
        return ('<p>Deliberate spacer below: the following callout must travel with its footnote.</p><div class="near-break-space"></div>'
                f'<p data-body-marker="BREAK-CALL">BREAK-CALL. Read {link(4)} before continuing. The marker and full URL must remain on this page together.</p>'
                '<p data-body-marker="BREAK-END">BREAK-END. The note must not cover this paragraph.</p>', ['BREAK-CALL', 'BREAK-END'])
    specimen('03-near-break', 'A callout at the page boundary', near)
    def code(link):
        lines = ''.join(f'<span class="code-line">const line{i:03d}: number = {i};</span>' for i in range(1, 91))
        return (f'<p>A note before a long code block: {link(3)}.</p><pre><code>{lines}</code></pre>'
                f'<p data-body-marker="CODE-END">CODE-END. A note after the block: {link(5)}.</p>', ['CODE-END'])
    specimen('04-long-code', 'Notes beside a long code block', code)
    def table(link):
        rows = []
        for i in range(1, 56):
            value = link(6) if i == 1 else link(0) if i == 38 else 'The row remains intact.'
            rows.append(f'<tr><td>ROW-{i:03d}</td><td>{value}</td></tr>')
        return ('<p>Synthetic table; notes in two rows. The README target is visibly a proof placeholder.</p>'
                '<table><thead><tr><th>ROW KEY</th><th>DETAIL</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table>'
                '<p data-body-marker="TABLE-END">TABLE-END.</p>', ['TABLE-END'])
    specimen('05-long-table', 'Footnotes inside a long table', table)
    def three(link):
        return (f'<p>Three distinct sources on one page: {link(2)}, {link(3)}, and {link(5)}.</p>'
                '<p data-body-marker="THREE-END">THREE-END.</p>', ['THREE-END'])
    specimen('06-three-notes', 'Three notes on one page', three)
    def reset(link):
        return (f'<p>Chapter one uses {link(2)} and {link(3)}.</p>'
                '<p data-body-marker="CHAPTER-ONE-END">CHAPTER-ONE-END.</p>'
                '<section class="chapter"><h1>Chapter two / reset to one</h1>'
                f'<p>Chapter two uses {link(5, chapter=2)} and {link(6, chapter=2)}.</p>'
                '<p data-body-marker="CHAPTER-TWO-END">CHAPTER-TWO-END.</p></section>',
                ['CHAPTER-ONE-END', 'CHAPTER-TWO-END'])
    specimen('07-chapter-reset', 'Chapter one / notes one and two', reset)
    tables = book_tables()
    def actual_tables(link):
        content = []
        for table in tables:
            # Render the exact parsed table; only a build-owned identifying attribute is added.
            content.append('<section class="table-sample">' +
                           f'<p>{html.escape(table["id"])} / {html.escape(table["source"])}:{table["line"]}</p>' +
                           table['html'] + '</section>')
        return ''.join(content), []
    specimen('08-book-tables', 'Actual tables / natural height', actual_tables)
    specs[-1]['book_tables'] = [{k: v for k, v in t.items() if k != 'html'} for t in tables]
    def boundary_tables(link):
        content = []
        for table in tables:
            content.append('<section class="table-sample"><div class="table-boundary-space">' +
                           f'<p>Near-break placement / {table["id"]}</p></div>' +
                           table['html'] + '</section>')
        return ''.join(content), []
    specimen('09-book-tables-boundary', 'Actual tables / near page end', boundary_tables)
    specs[-1]['book_tables'] = [{k: v for k, v in t.items() if k != 'html'} for t in tables]
    return specs


def printed_note_numbers(text):
    return [int(n) for n in re.findall(r'(?m)^(\d+)\. ', text)]


def verify(spec, defer_synthetic_header=False):
    failures = []
    limitations = []
    def check(condition, message):
        if not condition:
            failures.append(message)
    layout = read_json(Path(spec['layout']))
    pages = layout['layout']
    check(not layout['errors'] and not layout['external'], 'Browser exceptions or network attempts')
    check(all(any(f['family'] == family and f['status'] == 'loaded' for f in layout['pagination']['fonts']) for family in ('Plex', 'Oxanium', 'JetBrains')), 'Font loading')
    notes = [(p['page'], n) for p in pages for n in p['notes']]
    calls = [(p['page'], c) for p in pages for c in p['calls']]
    check(len(notes) == len(spec['notes']) == len(calls), f'Occurrence counts: {len(calls)} calls / {len(notes)} notes / {len(spec["notes"])} expected')
    for expected in spec['notes']:
        matches = [(p, n) for p, n in notes if n['id'] == expected['id']]
        check(len(matches) == 1, f'Note missing/duplicated: {expected["id"]}')
        for number, note in matches:
            check([(p, c['ref']) for p, c in calls if c['ref'] == note['ref']] == [(number, note['ref'])], f'Callout separated from note: {expected["id"]}')
            check(expected['href'] in note['text'], f'URL lost in DOM: {expected["id"]}')
    all_markers = [m['id'] for p in pages for m in p['markers']]
    check(sorted(all_markers) == sorted(spec['markers']), 'Body marker loss/duplication')
    for p in pages:
        for note in p['notes']:
            r, area = note['rect'], p['footnotes']
            check(r['y'] >= area['y'] - 1 and r['bottom'] <= area['bottom'] + 1, f'Footnote clipping on page {p["page"]}')
            check(r['x'] >= area['x'] - 1 and r['right'] <= area['right'] + 1, f'Footnote horizontal overflow on page {p["page"]}')
        # Check actual body elements, not the reserved container height.
        for item in p['markers'] + p['lines'] + p['rows'] + p['calls']:
            r = item['rect']
            if p['notes']:
                check(r['bottom'] <= p['footnotes']['y'] + 1, f'Body/footnote overlap on page {p["page"]}')
            check(r['x'] >= p['body']['x'] - 1 and r['right'] <= p['body']['right'] + 1, f'Body horizontal overflow on page {p["page"]}')
    if spec['name'] == '01-short-repeat':
        check(len(pages) == 1 and len(pages[0]['notes']) == 2, 'Two notes must share one page')
    if spec['name'] == '06-three-notes':
        check(len(pages) == 1 and len(pages[0]['notes']) == 3, 'Three notes must share one page')
    if spec['name'] == '07-chapter-reset':
        check(len(pages) == 2 and all(len(p['notes']) == 2 for p in pages), 'Each chapter must have its own page and two notes')
    if spec['name'] == '03-near-break':
        check(len(pages) >= 2 and any(c['rect']['y'] > p['body']['y'] + .85 * p['body']['height'] for p in pages for c in p['calls']), 'Boundary fixture must place a callout in the last 15% of the page body')
        check(next(p['page'] for p in pages if any(m['id'] == 'BREAK-END' for m in p['markers'])) > next(p['page'] for p in pages if p['calls']), 'Following paragraph must break to the next page')
    if spec['name'] == '04-long-code':
        check(sum(bool(p['lines']) for p in pages) >= 2, 'Code must span pages')
        check([l['text'] for p in pages for l in p['lines']] == [f'const line{i:03d}: number = {i};' for i in range(1, 91)], 'Code lines lost/duplicated')
    if spec['name'] == '05-long-table':
        check(sum(bool(p['rows']) for p in pages) >= 2, 'Table must span pages')
    measurements = []
    for table in spec.get('book_tables', []):
        occurrences = [(p, t) for p in pages for t in p['tables'] if t['id'] == table['id']]
        check(len(occurrences) == 1, f'Book table splits across pages: {table["id"]}')
        for p, t in occurrences:
            check(t['cells'] == table['cells'], f'Book table cells changed: {table["id"]}')
            check(t['rect']['bottom'] <= p['body']['bottom'] + 1, f'Book table exceeds body: {table["id"]}')
            check(t['rect']['height'] <= p['body']['height'] + 1, f'Book table exceeds full page height: {table["id"]}')
            measurements.append({**table, 'page': p['page'], 'height_pt': t['rect']['height'] * .75, 'available_pt': p['body']['height'] * .75})
    document = pymupdf.open(spec['pdf'])
    check(len(document) == len(pages), 'PDF and DOM page counts differ')
    fulltext = ''.join(p.get_text() for p in document)
    compact = re.sub(r'\s+', '', fulltext)
    images = []
    printed_markers = []
    for n, page in enumerate(document):
        dom_page = pages[n]
        expected_numbers = [note.get('number', i + 1) for i, note in enumerate(spec['notes']) if any(note['id'] == item['id'] for item in dom_page['notes'])]
        area, origin = dom_page['footnotes'], dom_page['rect']
        clip = pymupdf.Rect((area['x']-origin['x'])*.75, (area['y']-origin['y'])*.75, (area['right']-origin['x'])*.75, (area['bottom']-origin['y'])*.75)
        actual_numbers = printed_note_numbers(page.get_text(clip=clip)) if dom_page['notes'] else []
        printed_markers.append({'page': n+1, 'expected': expected_numbers, 'actual': actual_numbers})
        check(actual_numbers == expected_numbers, f'Printed footnote markers on page {n+1}: expected {expected_numbers}, got {actual_numbers}')
        printed_calls = []
        for call in dom_page['calls']:
            note_id = next((note['id'] for _, note in notes if note['ref'] == call['ref']), None)
            expected_number = next((str(note.get('number', i+1)) for i, note in enumerate(spec['notes']) if note['id'] == note_id), None)
            r = call['rect']
            clip = pymupdf.Rect((r['x']-origin['x'])*.75, (r['y']-origin['y']-12)*.75, (r['right']-origin['x'])*.75, (r['bottom']-origin['y']+3)*.75)
            spans = [span for block in page.get_text('dict')['blocks'] for line in block.get('lines', []) for span in line['spans']]
            digits = [span['text'] for span in spans if span['flags'] & 1 and re.fullmatch(r'\d+', span['text']) and clip.contains(pymupdf.Rect(span['bbox']).tl + (pymupdf.Rect(span['bbox']).br - pymupdf.Rect(span['bbox']).tl) / 2)]
            printed_calls.extend(int(n) for n in digits)
            check(digits == [expected_number], f'Printed callout mismatch on page {n+1}: {digits}')
        printed_markers[-1]['callouts'] = printed_calls
        check(printed_calls == actual_numbers, f'PDF callout/note numbers differ on page {n+1}: {printed_calls} vs {actual_numbers}')
        footer = page.get_text(clip=pymupdf.Rect(0, 680, 504, 720))
        folios = re.findall(r'(?m)^\d+$', footer)
        check(folios == [str(n+1)], f'Page folio must continue across chapter reset: page {n+1}, got {folios}')
        check(abs(page.rect.width - 504) < .1 and abs(page.rect.height - 720) < .1, 'Wrong 7x10 trim')
        for font in page.get_fonts(full=True):
            _, ext, kind, *_ = font
            check(kind == 'Type3' or (ext != 'n/a' and bool(document.extract_font(font[0])[3])), f'Unembedded font {font}')
        image = OUT / f'{spec["name"]}-page-{n+1:02d}.png'
        page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(image)
        images.append(str(image))
        for word in page.get_text('words'):
            check(word[0] >= 0 and word[1] >= 0 and word[2] <= 504.5 and word[3] <= 720.5, f'PDF text outside page {n+1}')
    for table in measurements:
        page_text = re.sub(r'\s+', '', document[table['page'] - 1].get_text())
        for cell in table['cells']:
            check(re.sub(r'\s+', '', cell) in page_text, f'Book table PDF cell lost: {table["id"]} / {cell}')
    for marker in spec['markers']:
        check(fulltext.count(marker) == 1, f'PDF missing/duplicated {marker}')
    for expected in spec['notes']:
        check(expected['href'] in compact, f'URL missing in selectable PDF: {expected["href"]}')
        check(any(l.get('uri') == expected['href'] for p in document for l in p.get_links()), f'Clickable PDF link missing: {expected["href"]}')
    if spec['name'] == '04-long-code':
        for i in range(1, 91):
            check(compact.count(f'constline{i:03d}:number={i};') == 1, f'PDF code line {i}')
    if spec['name'] == '05-long-table':
        for i in range(1, 56):
            check(fulltext.count(f'ROW-{i:03d}') == 1, f'PDF table row {i}')
        repeated = fulltext.count('ROW KEY') == sum(bool(p['rows']) for p in pages)
        if defer_synthetic_header and not repeated:
            limitations.append('Synthetic oversized table headers do not repeat; all actual book tables must remain unsplit.')
        else:
            check(repeated, 'Table header not repeated')
    Path(spec['pdf']).with_suffix('.txt').write_text(fulltext)
    return {'name': spec['name'], 'pages': len(document), 'notes': len(notes), 'failures': failures, 'images': images, 'printed_markers': printed_markers, 'table_measurements': measurements, 'limitations': limitations, 'pdf_sha256': digest(Path(spec['pdf']).read_bytes())}


def contact_sheet(results, name='all-pages'):
    sources = [(r['name'], pymupdf.open(OUT / (r['name'] + '.pdf'))) for r in results]
    count = sum(len(doc) for _, doc in sources)
    sheet = pymupdf.open()
    columns, width, height, gap = 3, 252, 360, 15
    page = sheet.new_page(width=columns*(width+gap)+gap, height=((count+columns-1)//columns)*(height+30)+gap)
    page.draw_rect(page.rect, fill=(.9, .9, .9), color=None)
    i = 0
    for specimen_name, doc in sources:
        for n in range(len(doc)):
            x, y = gap + (i % columns)*(width+gap), gap + (i//columns)*(height+30)
            rect = pymupdf.Rect(x, y, x+width, y+height)
            page.draw_rect(rect, fill=(1, 1, 1), color=None)
            page.show_pdf_page(rect, doc, n)
            page.insert_text((x, y+height+13), f'{specimen_name} / {n+1}', fontsize=8)
            i += 1
    path = OUT / (name + '.png')
    page.get_pixmap(alpha=False).save(path)
    return str(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=['proof', 'release'], default='proof')
    parser.add_argument('--validate-only', action='store_true')
    parser.add_argument('--only', help='Render/inspect one named specimen, for the initial real-table measurement')
    parser.add_argument('--inspect-existing', action='store_true', help='Validate saved trial artifacts without running pagination again')
    args = parser.parse_args()
    data = read_json(HERE / 'release-metadata.json')
    placeholders = metadata(args.mode, data)
    pins = read_json(HERE / 'trial-toolchain.json')
    require(platform.python_version() == pins['python'], 'Python pin mismatch')
    for line in (HERE / 'requirements.txt').read_text().splitlines():
        name, version = line.split('==')
        require(importlib.metadata.version(name) == version, f'Python dependency pin: {line}')
    require(read_json(HERE / 'node_modules/pagedjs/package.json')['version'] == pins['pagedjs'], 'Paged.js pin mismatch')
    links, hashes = inputs(data)
    controls = control_tests(data)
    print(f'{len(hashes)} frozen files; 6 external links + README; {controls} validation controls; {args.mode} metadata accepted', flush=True)
    if args.validate_only:
        return
    OUT.mkdir(parents=True, exist_ok=True)
    if args.inspect_existing:
        specs = read_json(OUT / 'fixtures.json')
    else:
        specs = fixtures(links, data)
        if args.only:
            specs = [s for s in specs if s['name'] == args.only]
            require(len(specs) == 1, 'Unknown specimen')
        (OUT / 'fixtures.json').write_text(json.dumps(specs, indent=2) + '\n')
        subprocess.run(['node', str(HERE / 'render-trial.cjs'), str(OUT / 'fixtures.json')], check=True, timeout=240)
    table_specs = [s for s in specs if s['name'] in ('08-book-tables', '09-book-tables-boundary')]
    table_results = [verify(s) for s in table_specs]
    defer_headers = len(table_results) == 2 and not any(r['failures'] for r in table_results)
    results = [verify(spec, defer_synthetic_header=defer_headers) for spec in specs]
    require(inputs(data)[1] == hashes, 'Manuscript changed during render')
    report = {'status': 'FAIL' if any(r['failures'] for r in results) else 'PASS', 'mode': args.mode, 'metadata_placeholders': placeholders,
              'toolchain': pins, 'validation_controls': controls, 'source_sha256': hashes, 'inventory': links,
              'font_sha256': {p.name: digest(p.read_bytes()) for p in sorted((HERE / 'fonts').glob('*.ttf'))},
              'table_header_repetition_deferred': defer_headers, 'results': results, 'contact_sheet': contact_sheet(results),
              'footnote_contact_sheet': contact_sheet([r for r in results if r['notes']], 'footnote-pages') if any(r['notes'] for r in results) else None,
              'table_contact_sheet': contact_sheet([r for r in results if r['name'] == '08-book-tables'], 'book-tables') if any(r['name'] == '08-book-tables' for r in results) else None}
    (OUT / 'results.json').write_text(json.dumps(report, indent=2) + '\n')
    for r in results:
        print(f'{r["name"]}: {r["pages"]} pages; {r["notes"]} notes; ' + ('PASS' if not r['failures'] else 'FAIL: ' + '; '.join(r['failures'])))
        for limitation in r['limitations']:
            print('  Recorded limitation: ' + limitation)
    print(f'{report["status"]}: {OUT / "results.json"}')
    if report['status'] == 'FAIL':
        print('STOP: footnote trial failed. No whole-book assembly or fallback.', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
