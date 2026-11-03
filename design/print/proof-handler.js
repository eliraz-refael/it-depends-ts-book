class ProofProgress extends Paged.Handler {
  afterPageLayout(pageElement, page) {
    const number = Number(pageElement.dataset.pageNumber);
    if (number % 25 === 0) console.log(`PROOF_PROGRESS ${number} pages`);
  }
}
Paged.registerHandlers(ProofProgress);

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
    targets,
    pages:pages.map(p=>({
      page:Number(p.dataset.pageNumber),rect:rect(p),body:rect(p.querySelector('.pagedjs_page_content')),
      footnotes:rect(p.querySelector('.pagedjs_footnote_area')),
      notes:[...p.querySelectorAll('.pagedjs_footnote_area [data-note-id]')].map(e=>({id:e.dataset.noteId,ref:e.dataset.ref,text:e.textContent,rect:rect(e)})),
      calls:[...p.querySelectorAll('[data-footnote-call]')].map(e=>({ref:e.dataset.footnoteCall,rect:rect(e)})),
      texts:[...p.querySelectorAll('.pagedjs_page_content [data-text-id]')].map(e=>({id:e.dataset.textId,text:cleanText(e),rect:rect(e)})),
      code:[...p.querySelectorAll('[data-code-line]')].map(e=>({id:e.dataset.codeLine,text:e.textContent,rect:rect(e)})),
      tables:[...p.querySelectorAll('[data-book-table]')].map(e=>({id:e.dataset.bookTable,rect:rect(e)})),
      headings:[...p.querySelectorAll('h1,h2,h3,h4')].map(e=>({text:e.textContent,rect:rect(e)})),
      figures:[...p.querySelectorAll('figure.source')].map(e=>({id:e.dataset.fenceId,continued:e.hasAttribute('data-split-from'),rect:rect(e)})),
      contents:[...p.querySelectorAll('[data-toc-target]')].map(e=>({target:e.dataset.tocTarget,page:e.querySelector('.toc-page').textContent,rect:rect(e)})),
      text:p.innerText
    }))
  };
};
