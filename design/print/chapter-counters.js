// Paged.js 0.4.3 resets footnotes by setting counter-increment:none on that
// page (counters.js:afterPageLayout). Keep the folio advancing when the source
// resets only footnotes. Run as a Handler so the polisher cannot consume this
// declaration before generated page elements exist.
class ChapterFootnoteCounters extends Paged.Handler {
  afterPageLayout(pageElement) {
    const footnotesReset = pageElement.querySelector('[data-counter-footnote-reset]:not([data-split-from])');
    const pagesReset = pageElement.querySelector('[data-counter-page-reset]:not([data-split-from])');
    if (footnotesReset && !pagesReset) {
      pageElement.style.counterIncrement = 'page var(--pagedjs-page-counter-increment)';
    }
  }
}
Paged.registerHandlers(ChapterFootnoteCounters);
