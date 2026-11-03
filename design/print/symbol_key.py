"""Measure glyph substitutions inside rendered manuscript code, not font features."""
from collections import defaultdict
import pymupdf


def rect(box, origin):
    return pymupdf.Rect((box['x']-origin['x'])*.75, (box['y']-origin['y'])*.75,
                       (box['right']-origin['x'])*.75, (box['bottom']-origin['y'])*.75)


def inventory(pdf, pages, font_directory):
    doc = pymupdf.open(pdf)
    fonts = {name:pymupdf.Font(fontfile=str(font_directory/f'{name}.ttf'))
             for name in ('JetBrainsMono-Regular','JetBrainsMono-Bold')}
    found = defaultdict(list)
    for page, metrics in zip(doc, pages):
        bounds = [rect(t['rect'], metrics['rect']) + (-1,-1,1,1)
                  for t in metrics['code'] + metrics['inline_code']]
        # PDF ActualText supplies the typed character. The drawing trace supplies
        # the glyph actually painted at that origin, including ligature fillers.
        glyphs = {(s['font'],round(c[2][0],2),round(c[2][1],2)):c[1]
                  for s in page.get_texttrace() for c in s['chars']}
        for block in page.get_text('rawdict')['blocks']:
            for line in block.get('lines', []):
                chars = []
                for span in line['spans']:
                    for char in span['chars']:
                        name, pos, ch = span['font'], char['origin'], char['c']
                        gid = glyphs.get((name,round(pos[0],2),round(pos[1],2)))
                        changed = (name in fonts and any(r.contains(pymupdf.Point(pos)) for r in bounds)
                                   and gid is not None and gid != fonts[name].has_glyph(ord(ch)))
                        chars.append((ch,changed,gid))
                start = 0
                while start < len(chars):
                    if not chars[start][1]:
                        start += 1
                        continue
                    end = start+1
                    while end < len(chars) and chars[end][1]:
                        end += 1
                    sequence = ''.join(c[0] for c in chars[start:end])
                    if len(sequence)>1:
                        found[sequence].append({'page':page.number+1,
                            'context':''.join(c[0] for c in chars),
                            'glyphs':[c[2] for c in chars[start:end]]})
                    start = end
    return dict(sorted(found.items()))


def printed_glyphs(page, box):
    return [c[1] for span in page.get_texttrace() if 'JetBrainsMono' in span['font']
            for c in span['chars'] if box.contains(pymupdf.Point(c[2]))]


def text_errors(pdf, pages, key, normalize, plain):
    meanings = {seq:row['meaning'] for group in key['groups'] for row in group['rows'] for seq in row['combinations']}
    errors = []
    first = True
    for metric in pages:
        if not metric['symbols']:
            continue
        text = normalize(pdf[metric['page']-1].get_text())
        if first and normalize(plain(key['intro'])) not in text:
            errors.append('Symbol-key introduction missing from PDF')
        first = False
        for row in metric['symbols']:
            if normalize(plain(meanings[row['sequence']])) not in text:
                errors.append(f'Symbol-key explanation missing: {row["sequence"]}')
    if first:
        errors.append('Symbol key missing from PDF')
    return errors
