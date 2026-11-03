// Paged.js 0.4.3 resets counters within the opener page's CSS scope. That scope
// does not carry into later sibling pages. Keep an explicit per-page note count
// so a chapter's first note may occur several pages after its opener.
class ChapterFootnoteCounters extends Paged.Handler {
  constructor(...args) {
    super(...args);
    this.notesAfterPage = new Map();
  }
  afterPageLayout(pageElement) {
    const number = Number(pageElement.dataset.pageNumber);
    const footnotesReset = pageElement.querySelector('[data-counter-footnote-reset]:not([data-split-from])');
    const pagesReset = pageElement.querySelector('[data-counter-page-reset]:not([data-split-from])');
    const before = footnotesReset ? Number(footnotesReset.dataset.counterFootnoteReset) : (this.notesAfterPage.get(number - 1) || 0);
    const otherResets = getComputedStyle(pageElement).counterReset
      .replace(/\bfootnote(?:-marker)?\s+-?\d+/g, '').replace(/\bnone\b/g, '').trim();
    pageElement.style.counterReset = `${otherResets} footnote ${before} footnote-marker ${before}`.trim();
    this.notesAfterPage.set(number, before + pageElement.querySelectorAll('[data-footnote-call]').length);
    // The built-in reset handler disables this increment even for note-only resets.
    if (footnotesReset && !pagesReset) {
      pageElement.style.counterIncrement = 'page var(--pagedjs-page-counter-increment)';
    }
  }
}
Paged.registerHandlers(ChapterFootnoteCounters);
