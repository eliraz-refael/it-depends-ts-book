#!/usr/bin/env python3
"""Build a Chapter 10 print study from the unmodified Markdown manuscript."""

import argparse
import html
from pathlib import Path
import subprocess
import tempfile

from markdown_it import MarkdownIt
from pygments import lex
from pygments.lexers import TypeScriptLexer
from pygments.token import STANDARD_TYPES
import pymupdf


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCE = ROOT / 'book/02-advanced-typescript/04-infer-keyword.md'
OUTPUT = HERE / 'output'


def code_html(source):
    lines = ['']
    for token, value in lex(source, TypeScriptLexer(stripnl=False, ensurenl=False)):
        kind = STANDARD_TYPES.get(token, '')
        for index, part in enumerate(value.split('\n')):
            if index:
                lines.append('')
            if part:
                lines[-1] += f'<span class="tok-{kind}">{html.escape(part)}</span>'
    if lines and not lines[-1]:
        lines.pop()
    return ''.join(f'<span class="code-line">{line or "&#8203;"}</span>' for line in lines)


def manuscript():
    md = MarkdownIt('commonmark')
    text = SOURCE.read_text()
    tokens = md.parse(text)
    title = tokens[1].content
    assert title == "Chapter 10: The Call You Didn't Make"
    tokens = tokens[3:]
    section = 0
    fence = 0
    links = []
    pieces = []
    for i, token in enumerate(tokens):
        if token.type == 'heading_open' and token.tag == 'h2':
            section += 1
            pieces.append(f'<h2><span class="section-number">{section:02d}</span>')
        elif token.type == 'fence':
            fence += 1
            assert token.info.strip() == 'typescript', token.info
            pieces.append(f'<figure class="source"><figcaption><span>TYPESCRIPT</span><span>{fence:02d}</span></figcaption><pre><code>{code_html(token.content)}</code></pre></figure>')
        elif token.type == 'paragraph_open':
            cls = 'speech' if tokens[i + 1].content.startswith('**') else 'narration'
            pieces.append(f'<p class="{cls}">')
        elif token.type == 'inline':
            pieces.append(md.renderer.renderInline(token.children, md.options, {}))
            for j, child in enumerate(token.children or []):
                if child.type == 'link_open':
                    url = child.attrGet('href')
                    label = token.children[j + 1].content
                    if url not in [item[1] for item in links]:
                        links.append((label, url))
        else:
            pieces.append(md.renderer.render([token], md.options, {}))
    assert fence == 20, f'Expected all 20 manuscript code fences; found {fence}.'
    refs = ''.join(f'<li>{html.escape(label)}<a href="{html.escape(url)}">{html.escape(url)}</a></li>' for label, url in links)
    pieces.append(f'<aside class="references"><h2>Sources in this chapter</h2><ol>{refs}</ol></aside>')
    return ''.join(pieces)


def page_html(size, body):
    theme = (HERE / 'theme.css').read_text()
    return f'''<!doctype html>
<html lang="en" class="{'large' if size == '7x10' else 'compact'}">
<head><meta charset="utf-8"><title>It Depends — Chapter 10 — {size} print study</title>
<style>{theme}</style></head>
<body>
<header class="opener">
  <div class="eyebrow"><span class="square"></span>ACT II / ADVANCED TYPESCRIPT</div>
  <div class="chapter-art" aria-hidden="true">
    <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 204H398 M305 2V202 M335 2V202 M365 2V202" stroke="#dedede" stroke-width=".6"/>
      <path d="M280 40H307V102H366V168H398 M280 145H305V102" stroke="#242424" stroke-width="1"/>
      <path d="M278 30V50 M271 40H285 M388 158V178 M381 168H395" stroke="#242424" stroke-width="1"/>
      <rect x="301" y="98" width="8" height="8" fill="white" stroke="#242424"/>
      <circle cx="366" cy="102" r="3" fill="#242424"/>
      <path d="M2 196V212 M398 196V212" stroke="#242424" stroke-width="1"/>
    </svg>
    <span class="chapter-number">10</span>
    <span class="chapter-index">CHAPTER / 10</span>
  </div>
  <h1>The Call<br>You Didn’t<br>Make</h1>
  <div class="opener-bottom"><div><div class="book-name">IT DEPENDS</div><div class="book-subtitle">TypeScript Principles, Debated</div></div><span class="keyword">infer</span></div>
</header>
<main>{body}</main>
<script>document.fonts.ready.then(() => document.documentElement.dataset.fonts = 'ready');</script>
</body></html>'''


def inspect_pdf(path, size):
    doc = pymupdf.open(path)
    expected = (432, 648) if size == '6x9' else (504, 720)
    fonts = {}
    for n, page in enumerate(doc):
        assert (round(page.rect.width), round(page.rect.height)) == expected
        assert page.get_text().strip(), f'Blank page {n + 1}'
        for font in page.get_fonts(full=True):
            fonts[font[0]] = (font[3], font[2])
    for xref, (name, kind) in fonts.items():
        if kind == 'Type3':
            # Chrome renders the outlined display numeral as embedded glyph paths.
            assert doc.xref_get_key(xref, 'CharProcs')[0] != 'null'
        else:
            assert doc.extract_font(xref)[3], f'Unembedded font: {name}'
    text = '\n'.join(page.get_text() for page in doc)
    captions = sum(line.replace(' ', '') == 'TYPESCRIPT' for line in text.splitlines())
    assert captions == 20, f'Expected 20 code captions; found {captions}.'
    assert 'All that, and we' in text, 'Final dialogue missing.'
    report = [f'{size}: {len(doc)} pages; all fonts embedded; correct trim size.']
    for n, page in enumerate(doc):
        # A complete raster set makes inspection and comparison repeatable.
        page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(OUTPUT / f'{size}-page-{n + 1:02d}.png')
    report += [f'  {name or "Outlined numeral (embedded Type 3 glyphs)"}' for name, kind in sorted(set(fonts.values()))]
    return '\n'.join(report)


def contact_sheets():
    for size in ('6x9', '7x10'):
        source = pymupdf.open(OUTPUT / f'chapter-10-{size}.pdf')
        sheet = pymupdf.open()
        columns = 4
        width, height, gap = 216, 324 if size == '6x9' else 309, 16
        rows = (len(source) + columns - 1) // columns
        page = sheet.new_page(width=(width + gap) * columns + gap, height=(height + 28) * rows + gap)
        page.draw_rect(page.rect, fill=(.88, .89, .89), color=None)
        for i in range(len(source)):
            x = gap + (i % columns) * (width + gap)
            y = gap + (i // columns) * (height + 28)
            rect = pymupdf.Rect(x, y, x + width, y + height)
            page.draw_rect(rect, fill=(1, 1, 1), color=None)
            page.show_pdf_page(rect, source, i)
            page.insert_text((x, y + height + 13), f'{size} / {i + 1:02d}', fontsize=8, color=(.2, .2, .2))
        page.get_pixmap(alpha=False).save(OUTPUT / f'{size}-all-pages.png')
    source = pymupdf.open(OUTPUT / 'chapter-10-7x10.pdf')
    sheet = pymupdf.open()
    page = sheet.new_page(width=1104, height=567)
    page.draw_rect(page.rect, fill=(.88, .89, .89), color=None)
    page.insert_text((24, 25), 'IT DEPENDS / CHAPTER 10 / PRINT DESIGN STUDY', fontsize=10, color=(.15, .15, .15))
    for i, source_page in enumerate((0, 1, 3)):
        x = 24 + i * 360
        rect = pymupdf.Rect(x, 45, x + 336, 525)
        page.draw_rect(rect, fill=(1, 1, 1), color=None)
        page.show_pdf_page(rect, source, source_page)
        page.insert_text((x, 548), ('CHAPTER OPENER', 'DIALOGUE + CODE', 'THE DEBATE')[i], fontsize=8, color=(.2, .2, .2))
    page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(OUTPUT / 'design-preview.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chrome', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    parser.add_argument('--html-only', action='store_true')
    args = parser.parse_args()
    OUTPUT.mkdir(exist_ok=True)
    body = manuscript()
    reports = []
    for size in ('6x9', '7x10'):
        path = OUTPUT / f'chapter-10-{size}.html'
        path.write_text(page_html(size, body))
        if args.html_only:
            continue
        pdf = path.with_suffix('.pdf')
        pdf.unlink(missing_ok=True)
        with tempfile.TemporaryDirectory(prefix='ts-book-print-chrome-') as profile:
            with subprocess.Popen([args.chrome, '--headless', '--disable-gpu', '--no-pdf-header-footer',
                            '--no-first-run', '--no-default-browser-check',
                            '--disable-background-networking', '--disable-component-update',
                            f'--user-data-dir={profile}', '--virtual-time-budget=3000',
                            f'--print-to-pdf={pdf}', path.as_uri()],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) as browser:
                try:
                    browser.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    # Some Chrome builds retain a background process after printing.
                    # Only accept this case if a complete, readable PDF was written.
                    try:
                        with pymupdf.open(pdf) as document:
                            assert len(document) > 0
                    finally:
                        browser.terminate()
                        try:
                            browser.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            browser.kill()
                            browser.wait()
                if not pdf.exists():
                    raise RuntimeError(f'Chrome did not create {pdf}')
        reports.append(inspect_pdf(pdf, size))
    if reports:
        contact_sheets()
        report = '\n\n'.join(reports) + '\n'
        (OUTPUT / 'verification.txt').write_text(report)
        print(report)


if __name__ == '__main__':
    main()
