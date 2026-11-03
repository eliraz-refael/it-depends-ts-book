# Whole-book PROOF review

The current **439-page layout proof** and its before/after tables are in
[Settled layout pass](#settled-layout-pass). The first-proof record below is retained
as the accepted comparison baseline.

## First proof (1f2a36a)

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


## Settled layout pass

**PASS: 439 pages from frozen main `d03727a0947a8434ac36e3978533152dc93a2e0f`.**
Layout checkpoint `406b86a` passed before the authorized main merge. The final
proof incorporates PR #40's approved acknowledgments and the author's approved,
grouped symbol-key text. The source manifest, hashes, counts and target folios
below were regenerated from this tree; they are not edited old totals.

Current PDF: `design/print/output/whole-book-proof-d03727a/a/It-Depends-PROOF.pdf`.

SHA-256: `5267622e4f1de910b6d117224589527138e569d443643725f33f2f5f7d909396`.

Two independent clean renders pass the comparison: all 439 pages have identical
text, character geometry, link destinations, bookmarks and raster hashes. Only
volatile PDF metadata/object IDs are excluded; raw byte identity is not claimed.
The code makes no manuscript edits. `book/` equals frozen main, and all 33 prior
source files still have their original hashes. Acknowledgments is the only new
file. The build retains proof metadata, PROOF on every page, continuous folios
and next-page starts. No dependencies, renderer or body/fence sizes changed.

### Fresh source and validation

- **34 files**, **3,487 source text blocks**, **490 fences**,
  **4,759 code lines**, **1,507 exact inline-code values**. All source hashes,
  reconstructed fence hashes and text completeness checks pass. Prose maps curly
  punctuation back to straight and matches each source block exactly, including
  whitespace. The fenced/inline code and URLs remain unchanged.
- **17 unsplit book tables**, **191 bookmarks**, **40 contents entries**,
  **7 assistant transcript/request boxes**, all five fence languages, embedded
  fonts, correct trim/folios, no source overflow or body-note collision, and no
  unintended blank pages. Every short fence stays whole; every fragment of a
  split fence has at least four source lines. All heading/introduction keeps pass.
- All **7** links/notes match the inventory and PDF destinations. Callout and body
  numbers agree and reset per chapter: folios **14, 68, 132, 249, 399, 406, 438**.
  The last note precedes the final Verdict. Page **439** ends with the exact
  frozen narrative sentence (using typographic quotes), with only the required
  footer and folio below it. No source appendix or added narrative follows it.
- **2,522 prose blocks** have verified, balanced typographic delimiters. Five
  ambiguous paragraphs remain unchanged for the author; see their exact locations
  below. The approved key prose is generated separately from manuscript counts.
- Clean `npm ci` on the new main source: **0 vulnerabilities**. Full
  `npm run check`: **PASS**. All nine trial specimens, rerun against the new source
  and shared renderer: **PASS**. Placeholder metadata still rejects release mode.
  Logs, `validation.json` for both runs and `comparison.json` are in ignored output.

### Acknowledgments

The title and three approved paragraphs occupy **page 9**, immediately after the
dedication on 8, with no opener page or numeral box. The title appears in contents
and as a bookmark. The build checks one-page membership, paragraph count, absence
of opener artwork, and position after the dedication. I inspected the page image.

Source SHA-256: `27e3a4c4c2639dd44201be155b0a5a92dec03eb7b7ae89f4376f8542331d657f`.

### Approved symbol key

The complete approved text is in `design/print/symbol-key.json`, including the
four headings in the supplied order. Approved input SHA-256:
`6259103681b421d5a7556e47e0a0530bc2c1d68ebdd070899875201bde966d7c`. No wording substitution was needed:
**`--noEmit` is in the printed command on p392**, sourced from
`book/04-the-real-world/04-performance-vs-safety.md:35` (`--noEmit false`).

The key occupies **pages 5–6**, after the contents. At body size **11/16 pt**,
its measured unpaginated height is **1005.04 pt**, against **620.64 pt**
of page body. It cannot fit on one page without shrinking. Page 5 contains the
intro and **Comparison and logic**. Page 6 contains **Functions and types**,
**Comments**, then **Punctuation that only looks joined**. The break falls between
groups. All group memberships, row orders and unsplit groups are asserted.

All **26** combinations have separate printed-glyph and typing cells; shared
meanings span their paired rows. The inventory is re-derived from actual glyph
substitutions in rendered manuscript fences and inline code, not from the font's
feature list. Any new fused combination without a row fails; unused/duplicate
rows fail too. A single contextual colon and the blank-line placeholder are not
multi-character combinations. The first column's glyph IDs must match actual
source occurrences. The typing column uses individually isolated characters with
ligatures disabled, verified against each character's font glyph ID. The intro's
`=>` and `===` examples are explicitly fused and checked against the same actual
source glyphs. I inspected both key page images. The font's original manuscript
code shaping is retained; the author replaced the earlier removal requirement.

### Target pages: first proof to final proof

Each mapping below follows the original source file/line or fence identity into
the fresh render, rather than assuming a fixed folio offset.

| First proof | Final proof | Heading/introduction result |
| --- | --- | --- |
| 121 | 127 | The Debate starts with its subheading, dialogue and examples. |
| 89 | 93 | `In practice — the four shapes, side by side:` stays with its table or code. |
| 116 | 122 | `The Accepted Standard:` stays with its table or code. |
| 363 | 374 | `The exports field in both package manifests` stays with its table or code. |
| 369 | 380 | `tsconfig.json` stays with its table or code. |
| 377 | 388 | `tsconfig.json — replace include` stays with its table or code. |
| 71 | 74 | The Turn keeps its complete setup; the example follows on the next page. |
| 103 | 108 | The Turn retains its setup and following material. |
| 216 | 222 | The Turn retains its setup and following material. |
| 254 | 261 | The Turn retains its setup and following material. |
| 266 | 272 | The Turn keeps its complete setup; the example follows on the next page. |
| 336 | 347 | The Turn retains its setup and following material. |

| First proof code-tail folio | Old tail lines | Final whole fence / fragments |
| --- | --- | --- |
| 37 | 1 | p40: 11 lines |
| 97 | 1 | p101: 10 lines |
| 158 | 2 | p163: 12 lines |
| 192 | 2 | p197: 11 lines |
| 290 | 1 | p297: 10 lines |
| 305 | 1 | p313: 9 lines |
| 338 | 1 | p347: 9 lines; p348: 7 lines |
| 341 | 2 | p351: 11 lines |
| 347 | 2 | p357: 12 lines |
| 348 | 2 | p358: 10 lines |
| 383 | 1 | p392: 11 lines; p393: 4 lines |
| 409 | 1 | p419: 14 lines; p420: 12 lines |
| 413 | 3 | p423: 23 lines; p424: 11 lines |
| 420 | 1 | p430: 25 lines; p431: 4 lines |

Fences of 12 source lines or fewer do not split; longer split fences have at
least four source lines on each page. Display wraps do not alter source counts.

### Sparse endings

Only the three measured endings of three source lines or fewer received extra
balancing. Generated captions are excluded. No wording, font or spacing was
changed to fill a page; earlier break choices bring useful context forward.

| Chapter | Final folio | Before balancing | Final source lines | Earlier break choice |
| --- | --- | --- | --- | --- |
| 13 | 227 | 2 | 6 | Dima's explanation stays with Oded's reply. |
| 20 | 316 | 3 | 4 | Linoy's setup stays with the example and Daniel's answer. |
| 21 | 329 | 3 | 7 | The preceding fence's last four lines stay with Guy's conclusion. |

All chapters end with more than three source lines. The one-line dedication is
intentional. Generous end-space remains on these three pages; the other light
endings were deliberately left alone. Original review targets:

| First proof ending | Final ending | Final source lines |
| --- | --- | --- |
| 46 | 49 | 28 |
| 61 | 64 | 16 |
| 138 | 143 | 5 |
| 196 | 201 | 6 |
| 210 | 215 | 20 |
| 247 | 253 | 4 |
| 106 | 110 | 10 |
| 153 | 158 | 11 |
| 235 | 241 | 12 |
| 272 | 278 | 12 |
| 285 | 292 | 11 |
| 379 | 389 | 17 |

### Openers and visual evidence

| First proof | Final proof | Result |
| --- | --- | --- |
| 5 | 7 | Label, rule and title retained; numeral and box removed. |
| 7 | 10 | Label, rule and title retained; numeral and box removed. |
| 12 | 15 | Label, rule and title retained; numeral and box removed. |
| 391 | 401 | Label, rule and title retained; numeral and box removed. |

The Bonus chapter openers keep 1, 2 and 3, on **402, 415, 427**.
No forced recto blanks were introduced.

The current images are `a/pages/page-001.png` through `page-439.png`;
`a/contact-sheets/spreads-01.png` through `spreads-28.png` cover every spread.
At the 33-file checkpoint I inspected all 39 focused target pages; the new key,
acknowledgments, Ch7 debate and final pages were checked again. The new baseline
correspondence check confirms all 3,483 existing text blocks retain their
pagination, shifted only by the inserted acknowledgment page. Fresh fragment and
keep checks cover the code and labels. `layout-review.json` records current target
folios, endings and complete ambiguous paragraphs; `baseline-correspondence.json`
records the unchanged source hashes and text pagination.

### Still open: five ambiguous quote paragraphs

These are printed as supplied, including straight quotes, pending the author's
decision. The converter does not guess at the marked apostrophe/quote role.

| Source | Final folio | Candidate |
| --- | --- | --- |
| `book/02-advanced-typescript/01-conditional-types.md:71` | 128 | Opening quote after the em dash in `— "that's a ternary..."`. |
| `book/03-patterns-and-design/02-branded-types.md:191` | 248 | `consumers' order check` |
| `book/03-patterns-and-design/03-runtime-validation.md:330` | 263 | `consumers' needs` |
| `book/04-the-real-world/02-monorepo-type-sharing.md:276` | 374 | `packages' source` |
| `book/04-the-real-world/02-monorepo-type-sharing.md:324` | 376 | `packages' dist` and `dependencies' manifests` |

No leading-apostrophe or parenthesis-opening candidate remains outside the audit.
All specified heading/fence defects and three-or-fewer-line chapter endings are
resolved. The symbol-key wording and acknowledgment baseline are now settled.
The remaining quote decisions, placeholder release metadata and printer/recto
choices are explicit, not silently resolved by this proof.
