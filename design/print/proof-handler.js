// Move an overflow boundary backwards, never forwards or into source text.
// This supplements 0.4.3's CSS keeps, which can strand a heading or a code tail.
class ProofKeeps extends Paged.Handler {
  afterParsed(content) {
    for (const e of content.querySelectorAll('main h2,main h3,main h4,main p')) {
      const text = e.textContent.trim();
      const heading = /^H[234]$/.test(e.tagName);
      const intro = e.tagName === 'P' && text.length <= 260 && /:["”’']?$/.test(text);
      const label = e.tagName === 'P' && text.length <= 90 && e.querySelector('code,strong') && !/[.!?]["”’']?$/.test(text);
      if (!heading && !intro && !label) continue;
      let next = e.nextElementSibling;
      while (next && /^(H[234]|HR)$/.test(next.tagName)) next = next.nextElementSibling;
      if (!next) continue;
      e.dataset.keepNext = next.dataset.ref;
    }
    // Only the three measured <=3-line closing pages. Leave other light endings.
    for (const article of content.querySelectorAll('[data-tail-balance="true"]')) {
      const last = article.querySelector('main').lastElementChild;
      const previous = last.previousElementSibling;
      const code = previous.matches('figure.source') ? [...previous.querySelectorAll('[data-code-line]')] : [];
      const keep = code.length >= 4 ? code.at(-4) : code.length ? previous.previousElementSibling : previous;
      if (!keep || !last.matches('p')) throw new Error('Tail-balance source structure changed');
      keep.dataset.keepNext = last.dataset.ref;
    }
  }
  onOverflow(range, rendered) {
    if (!range) return;
    const before = e => range.comparePoint(e, e.childNodes.length) === -1;
    const move = e => {
      if (e && range.comparePoint(e,0) === -1) {
        range.setStartBefore(e);
        return true;
      }
      return false;
    };
    // Revisit the keeps after a code correction, since its introduction may now
    // be the last complete block on this page.
    for (let pass=0; pass<4; pass++) {
      let changed = false;
      for (const figure of rendered.querySelectorAll('figure.source')) {
        if (!range.intersectsNode(figure)) continue;
        const lines = [...figure.querySelectorAll('[data-code-line]')];
        const complete = lines.filter(before);
        if (!lines.length) { changed = move(figure) || changed; continue; }
        const total = Number(figure.dataset.lineCount);
        const index = e => Number(e.dataset.codeLine.split('-').at(-1));
        const first = index(lines[0]);
        const next = complete.length ? index(complete.at(-1))+1 : first;
        if (next >= total) continue;
        if (total <= 12 || complete.length < 4) {
          changed = move(figure) || changed;
        } else if (total-next < 4) {
          const lastFour = lines.find(e => index(e) === total-4);
          changed = move(lastFour) || changed;
        }
      }
      for (const keep of [...rendered.querySelectorAll('[data-keep-next]')].reverse()) {
        if (!before(keep)) continue;
        const target = rendered.querySelector(`[data-ref="${keep.dataset.keepNext}"]`);
        let enough = target && before(target);
        if (target?.matches('figure.source')) {
          enough = [...target.querySelectorAll('[data-code-line]')].filter(before).length >= Math.min(4,Number(target.dataset.lineCount));
        }
        if (!enough) changed = move(keep) || changed;
      }
      if (!changed) break;
    }
    return range;
  }
}
Paged.registerHandlers(ProofKeeps);

class ProofProgress extends Paged.Handler {
  afterPageLayout(pageElement, page) {
    const number = Number(pageElement.dataset.pageNumber);
    if (number % 25 === 0) console.log(`PROOF_PROGRESS ${number} pages`);
  }
}
Paged.registerHandlers(ProofProgress);

window.measureSymbolKey = () => {
  const copy = document.querySelector('.symbol-key').cloneNode(true);
  copy.style.cssText = 'position:absolute;left:-10000px;top:0;width:5.5in;display:flow-root;';
  document.body.appendChild(copy);
  window.symbolKeyMeasure = {total_pt:copy.getBoundingClientRect().height*.75,
    first_bundle_pt:copy.querySelector('.symbol-first').getBoundingClientRect().height*.75,
    group_heights_pt:[...copy.querySelectorAll('.symbol-group')].map(e=>e.getBoundingClientRect().height*.75)};
  copy.remove();
};

window.collectProof = () => {
  const rect = e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; };
  const pages = [...document.querySelectorAll('.pagedjs_page')];
  const targets = {};
  for (const p of pages) {
    for (const e of p.querySelectorAll('[data-destination]')) {
      if (!targets[e.dataset.destination]) targets[e.dataset.destination] = Number(p.dataset.pageNumber);
    }
  }
  for (const e of document.querySelectorAll('.pagedjs_pages [data-toc-target]')) {
    if (!targets[e.dataset.tocTarget]) throw new Error(`Missing contents destination ${e.dataset.tocTarget}`);
    e.querySelector('.toc-page').textContent = targets[e.dataset.tocTarget];
  }
  const cleanText = element => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('[data-note-id],[data-footnote-call]').forEach(e=>e.remove());
    return clone.textContent;
  };
  return {
    targets,symbol_key_measure:window.symbolKeyMeasure,
    pages:pages.map(p=>({
      page:Number(p.dataset.pageNumber),rect:rect(p),body:rect(p.querySelector('.pagedjs_page_content')),
      footnotes:rect(p.querySelector('.pagedjs_footnote_area')),
      notes:[...p.querySelectorAll('.pagedjs_footnote_area [data-note-id]')].map(e=>({id:e.dataset.noteId,ref:e.dataset.ref,text:e.textContent,rect:rect(e)})),
      calls:[...p.querySelectorAll('[data-footnote-call]')].map(e=>({ref:e.dataset.footnoteCall,rect:rect(e)})),
      texts:[...p.querySelectorAll('.pagedjs_page_content [data-text-id]')].map(e=>({id:e.dataset.textId,text:cleanText(e),rect:rect(e)})),
      inline_code:[...p.querySelectorAll('[data-inline-code-id]')].map(e=>({id:e.dataset.inlineCodeId,text:e.textContent,rect:rect(e)})),
      code:[...p.querySelectorAll('[data-code-line]')].map(e=>({id:e.dataset.codeLine,text:e.textContent,rect:rect(e)})),
      tables:[...p.querySelectorAll('[data-book-table]')].map(e=>({id:e.dataset.bookTable,rect:rect(e)})),
      keeps:[...p.querySelectorAll('[data-keep-next]')].map(e=>({ref:e.dataset.ref,target:e.dataset.keepNext,text:e.textContent,rect:rect(e)})),
      blocks:[...p.querySelectorAll('.pagedjs_page_content [data-ref]')].map(e=>({ref:e.dataset.ref,tag:e.tagName,rect:rect(e)})),
      headings:[...p.querySelectorAll('h1,h2,h3,h4')].map(e=>({text:e.textContent,rect:rect(e)})),
      figures:[...p.querySelectorAll('figure.source')].map(e=>({id:e.dataset.fenceId,continued:e.hasAttribute('data-split-from'),rect:rect(e)})),
      openers:[...p.querySelectorAll('.act-opener,.prologue-opener,.chapter-opener')].map(e=>{
        const mark=e.querySelector('.part-mark,.opener-number'), style=mark ? getComputedStyle(mark) : null;
        return {kind:e.matches('.act-opener')?'act':e.matches('.prologue-opener')?'prologue':'chapter',act:e.dataset.act,
          title:e.querySelector('h1').textContent.trim(),label:e.querySelector('.part-label,.eyebrow')?.textContent || '',mark:mark?.textContent || '',
          center:rect(e.querySelector('.opener-center') || e),text_align:getComputedStyle(e.querySelector('.opener-center') || e).textAlign,
          chapter_furniture:!!e.querySelector('.opener-art,.eyebrow,.opener-bottom'),
          mark_style:style ? [style.fontFamily,style.fontSize,style.lineHeight,style.letterSpacing] : [],
          mark_relative_y:mark ? mark.getBoundingClientRect().y-p.getBoundingClientRect().y : null};
      }),
      front_parts:[...p.querySelectorAll('[data-front-part]')].map(e=>e.dataset.frontPart).filter(Boolean),
      key_code:[...p.querySelectorAll('.symbol-key code')].map(e=>({text:e.textContent,rects:[...e.getClientRects()].map(r=>({x:r.x,y:r.y,right:r.right,bottom:r.bottom}))})),
      quiet_frontmatter:[...p.querySelectorAll('[data-quiet-frontmatter="true"]')].map(e=>({id:e.id,paragraphs:e.querySelectorAll('main > p').length,headings:e.querySelectorAll('h1').length,opener:!!e.querySelector('.chapter-opener,.opener-art')})),
      symbol_groups:[...p.querySelectorAll('[data-symbol-group]')].map(e=>({id:e.dataset.symbolGroup,title:e.querySelector('h2')?.textContent,rows:[...e.querySelectorAll('[data-symbol-sequence]')].map(r=>r.dataset.symbolSequence)})),
      symbol_intro:[...p.querySelectorAll('[data-key-intro-glyph]')].map(e=>({sequence:e.dataset.keyIntroGlyph,rect:rect(e)})),
      symbols:[...p.querySelectorAll('[data-symbol-sequence]')].map(e=>({sequence:e.dataset.symbolSequence,glyph:rect(e.querySelector('[data-key-glyph]')),literal:rect(e.querySelector('[data-key-literal]'))})),
      contents:[...p.querySelectorAll('[data-toc-target]')].map(e=>({target:e.dataset.tocTarget,page:e.querySelector('.toc-page').textContent,rect:rect(e)})),
      text:p.innerText
    }))
  };
};
