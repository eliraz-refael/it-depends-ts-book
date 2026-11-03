"""Conservative, reversible prose typography. No changes to code or link targets."""
import re

STRAIGHT = str.maketrans({'“':'"', '”':'"', '‘':"'", '’':"'"})

def straight(text):
    return text.translate(STRAIGHT)

def convert(children):
    # Track positions across emphasis tokens, while protecting code and whole links
    # whose labels contain code. Preserve literal URLs even outside Markdown links.
    protected = set()
    for i, token in enumerate(children):
        if token.type == 'link_open':
            end = next(j for j in range(i+1, len(children)) if children[j].type == 'link_close')
            if any(c.type == 'code_inline' for c in children[i:end]):
                protected.update(range(i, end+1))
    chars, places = [], []
    for i, token in enumerate(children):
        if token.type in ('softbreak','hardbreak'):
            chars.append('\n'); places.append(None)
        if token.type in ('text', 'code_inline'):
            literal = i in protected or token.type == 'code_inline'
            urls = {j for m in re.finditer(r'https?://\S+', token.content) for j in range(m.start(),m.end())}
            for j,c in enumerate(token.content):
                chars.append(c if not literal and j not in urls else '\ufffc')
                places.append((i,j) if not literal and j not in urls else None)
    text = ''.join(chars)
    stack = []
    replacements = {}
    roles = {}
    ambiguous = []
    pairs = {'"': ('“','”'), "'": ('‘','’')}
    for pos,c in enumerate(text):
        if c not in pairs:
            continue
        prev = text[pos-1] if pos else ''
        nxt = text[pos+1] if pos+1<len(text) else ''
        if c == "'" and (prev.isalnum() or prev == '\ufffc') and nxt.isalnum():
            replacements[pos] = '’'; roles[pos] = 'apostrophe'  # contractions and internal possessives
        elif stack and stack[-1] == c:
            stack.pop(); replacements[pos] = pairs[c][1]; roles[pos] = 'close'
        elif c == "'" and prev.isalnum():
            # Unpaired word-final apostrophes can be possessives or mispaired speech.
            ambiguous.append({'offset':pos,'reason':'word-final apostrophe without an open single quote'})
        elif c == "'" and (nxt.isdigit() or text[pos+1:pos+5].lower() in ('twas','tis ')):
            ambiguous.append({'offset':pos,'reason':'leading apostrophe'})
        else:
            prior = text[:pos].rstrip()
            if prior.endswith(('—','–','-','(')):
                ambiguous.append({'offset':pos,'reason':'opening quote after dash or parenthesis'})
            stack.append(c); replacements[pos] = pairs[c][0]; roles[pos] = 'open'
    if stack:
        ambiguous.append({'reason':'unbalanced source quote delimiters','open':stack})
    if ambiguous:
        return {'converted':False,'ambiguous':ambiguous,'text':text}
    # Balanced delimiters are verified before applying; apostrophes are distinct
    # from delimiter roles even though their printed glyph is the same.
    assert not stack
    values = {i:list(t.content) for i,t in enumerate(children) if t.type == 'text'}
    for pos,c in replacements.items():
        i,j = places[pos]; values[i][j] = c
    for i,chars in values.items():
        original = children[i].content
        children[i].content = ''.join(chars)
        assert straight(children[i].content) == straight(original)
    return {'converted':bool(replacements),'balanced':True,'replacements':len(replacements), 'marks':[{'offset':i,'character':c,'role':roles[i]} for i,c in replacements.items()]}


def verify_printed(text, audit):
    stack = []
    for mark in audit.get('marks', []):
        if text[mark['offset']] != mark['character']:
            return False
        c, role = mark['character'], mark['role']
        if role == 'open':
            stack.append({'“':'”', '‘':'’'}[c])
        elif role == 'close':
            if not stack or stack.pop() != c:
                return False
        elif role != 'apostrophe' or c != '’':
            return False
    return not stack
