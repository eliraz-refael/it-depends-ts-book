# Whole-book PROOF review

## Result

**Content/build validation PASS; layout needs polish before release.** Two clean
renders of the frozen **517e0fc** `book/` produce **428 pages** with identical
text, character geometry, link destinations, bookmarks and page rasters. No
manuscript files, dependencies, publication metadata or saved design samples
were changed. This is a proof, not a release or a printer-ready approval.

Review PDF, relative to the worktree:
`design/print/output/whole-book-proof/a/It-Depends-PROOF.pdf`.

SHA-256: `2fcf524aa6d3d5243079a4248f904e9c6761c965bba6b94515cf1e6ac8aacc63`.

All output is ignored. Individual images are
`design/print/output/whole-book-proof/a/pages/page-001.png` through
`page-428.png`; contact sheets are
`design/print/output/whole-book-proof/a/contact-sheets/spreads-01.png` through
`spreads-27.png`. The independent second PDF and evidence are in the sibling
`b/` directory. `comparison.json` records both raster hashes for every page.

## Build and validation

- The approved manifest supplies all **33 frozen files**, each once. Source hashes
  are checked before and after rendering. `git diff 517e0fc -- book/` is empty.
- **490 fences**: 458 TypeScript, 10 JavaScript, 13 JSON, 5 text, 4 diff. Exact
  rendered fence hashes and all **4,759 source code lines** pass. This census
  includes the prologue, not just chapter checks.
- **3,483 inline source text blocks** survive in the paginated DOM and PDF.
  PDF text comparison normalizes whitespace and Unicode compatibility forms;
  code reconstruction in the DOM is exact, including each fence's final newline.
- **17 actual tables** remain complete on one page each. No repeated-header
  repair or synthetic padding rows were added. The approved no-split policy
  remains a failing assertion if future source/layout changes violate it.
- **Seven links/notes** match the derived, committed inventory: six external
  links and the README destination resolved through placeholder proof metadata.
  Dialogue links fail the input gate. PDF callout/body numbers match on pages
  **10, 65, 127, 243, 389, 395 and 427**; each chapter/prologue sequence begins
  at 1. URLs remain selectable/clickable; callouts target their actual note.
- **39 contents entries**, **190 hierarchical bookmarks**, act/chapter openers,
  running heads, all **34 blockquotes** and **seven assistant request/transcript
  boxes** are rendered. The contents numbers and saved PDF destinations pass.
- All pages are **504 × 720 pt (7 × 10 inches)**, with embedded fonts, continuous
  folios and **PROOF** footers. No unintended blank pages, missing source text,
  source outside the body, body/footnote overlap or PDF text outside trim was
  found. This does not imply good page breaking: the layout issues below remain.
- The final source note is on **427**; the final Verdict and exact last narrative
  line are on **428**: `Oded: "Good. Now I have a green pull request and a meeting four minutes ago."`
  Nothing follows the narrative except the required proof footer and folio.
- Two independent Chrome/Paged.js renders pass the comparison. The PDF files
  have different raw hashes; no binary identity is claimed. The comparison
  excludes volatile PDF metadata and object IDs, and checks the actual text,
  character positions, navigation and every rasterized page.
- Clean root `npm ci` (**0 vulnerabilities**) and full `npm run check`: **PASS**.
  The accepted nine-specimen footnote/table trial was rerun after the shared
  handler change: **PASS**. Logs are retained with the ignored proof evidence.
- Pins remain Node **22.23.4**, Python **3.14.8**, Chrome **156.0.8078.80**,
  Paged.js **0.4.3** and the existing pinned Python requirements. Each run records
  font and style/handler hashes. No HTTP(S) rendering requests occurred.

Proof settings are continuous Arabic numbering and next-page act/chapter starts,
without recto blanks. Publication metadata is still placeholder data; the
release gate rejects it. Printer, paper, binding, cover and physical proof
ordering remain outside this implementation.

## Whole-book findings fixed in build code

The small reset specimen put notes close to its chapter opener. The complete
book exposed a different case: the first note several pages later inherited the
previous chapter's counter. The local handler now carries the note count across
page scopes, resetting both callout and body counters at the chapter boundary,
while preserving the folio. All nine specimens and both complete renders pass.

Chrome's native named note destinations could land near the page top. The final
PDF now uses explicit measured note destinations, checked after saving. Contents
links and bookmarks likewise use measured pages rather than inferred offsets.

## Spread review: page-specific layout work

I reviewed **all 27 contact sheets**, covering every page and facing spread, and
enlarged representative problem pages and the final two pages. Page numbers
below are the printed proof folios. These are build/layout changes for a later
pass, not reasons to edit `book/`.

1. **Orphan heading, p121.** “The Debate” is alone at the foot; the scene starts
   on 122. This is the clearest keep-with-next failure. Related weak breaks have
   a heading and only a short setup before the example on **71–72, 103–104,
   216–217, 254–255, 266–267 and 336–337**. Prioritize the fully stranded heading;
   do not treat every low heading as an error.
2. **Introductions separated from their material.** On **369**, `tsconfig.json`
   sits alone at the foot, with its JSON on 370. Similar splits are **377–378**
   (`tsconfig.json — replace include`), **363–364** (exports-field introduction),
   **116–117** (“The Accepted Standard:” / table), and **89–90** (“In practice” /
   code). Keep the short introduction with a meaningful first fragment.
3. **Tiny code tails at page tops.** Pages **37, 97, 158, 192, 290, 305, 338,
   341, 347, 348, 383, 409, 413 and 420** start a continuation of only one to
   three source lines. On 37 it is just `});` under a continuation label.
   Enforce a minimum useful fragment on both sides of a break, especially for
   closing delimiters; do not rewrite the examples or shrink the code font.
4. **Sparse chapter-ending pages.** The worst tiny spills are **46, 61, 138,
   196, 210 and 247**. Other visibly light endings are **106, 153, 235, 272,
   285 and 379**. Balance the preceding layout where possible. Some end-space
   is intentional; a few closing lines on a new page are the priority.
5. **Code operator ligatures.** In the enlarged **37** example, `!==` and `===`
   appear as fused glyphs despite the general ligature setting. Source hashes
   and copied text remain exact. Disable the relevant font features explicitly
   in the print stylesheet so a learner sees the literal characters. This
   applies to code throughout, not only page 37.
6. **Generated opener ornaments.** Unnumbered prologue openers on **5, 7 and 12**
   put a tiny outlined dot/square in the large numeral area; it looks unfinished.
   The Bonus opener on **391** says BONUS but carries a large **5**, suggesting
   an Act V number. Give these an intentional unnumbered ornament while keeping
   the source Bonus 1–3 headings intact. Cosmetic, lower priority.

Automated low-fill/low-heading observations in `validation.json` are review
candidates, not a second list of confirmed defects. In particular, a zero-line
DOM figure fragment need not paint a stranded caption; it was not counted as a
visible defect without corroboration.

The full-size samples are readable, tables fit, long URLs wrap, and transcript
boxes are distinct from ruling quotations. The final note and final scene land
in the intended order. These positives and the passing checks do not waive the
page-break and code-typography work above. No manuscript changes were made to
conceal a layout problem.
