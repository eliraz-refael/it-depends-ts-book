# Whole-book PROOF review

The current **438-page layout proof** and its before/after tables are in
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

**PASS on the frozen 33-file 517e0fc manuscript; 438 pages.** The author dropped
ligature removal during this pass. Code keeps its existing shaping; a generated,
print-only symbol key follows the contents. No `book/` files, dependencies,
renderer, body/code sizes, publication metadata, folio conventions or next-page
starts were changed. Recto starts remain deferred.

Current PDF: `design/print/output/whole-book-proof-layout/a/It-Depends-PROOF.pdf`.

SHA-256: `6d705b7fc901f9fe8c14769bcbe68cc28bd9e6ec05ed636ebcc4a50d097f42fe`.

The independent `b/` render has identical page text, character geometry, links,
bookmarks and all 438 page rasters. Raw PDF bytes are not claimed identical.
`comparison.json` records the comparison, including trim-bound checks. The two
renders were clean browser runs; the final symbol-key text check also re-reads
both saved PDFs. No source text follows the exact final narrative line on 438;
its quotation marks are typographic and invert to the exact frozen sentence.
The final footnote is on 437, before the final Verdict.

Images: `a/pages/page-001.png` through `page-438.png`; all-spread contacts:
`a/contact-sheets/spreads-01.png` through `spreads-28.png`. I visually reviewed
all **39 focused target pages** in `a/target-review/targets-01.png` through
`targets-10.png`, with enlarged checks of the symbol key, Ch7 debate and code
fragments. The original proof's full-spread review remains above. The new
all-page automated checks complement, rather than replace, visual inspection.

### Validation and implementation

- Clean `npm ci` (0 vulnerabilities) and full `npm run check`: PASS. All nine
  accepted footnote/table trial specimens: PASS. Copies of the logs are in the
  ignored layout-proof directory.
- Both final renders: **490 exact fence hashes**, **4,759 code lines**, **1,507
  exact inline-code values**, **3,483 source text blocks**, **17 unsplit book
  tables**, **190 bookmarks**, **39 contents entries**, seven transcript boxes,
  all fonts embedded, no source overflow/body-note overlap, and PROOF/folio on
  every page. All seven notes reset correctly and retain clickable targets:
  pages **13, 67, 131, 248, 398, 405 and 437**.
- `ProofKeeps` moves an overflow boundary backwards when the renderer's CSS keeps
  are insufficient. Narrative headings retain following content. Short colon
  introductions and label lines retain a meaningful start of their target;
  code starts include at least four lines, or the whole shorter example.
  All saved keep-target relationships are checked.
- Fences of **12 source lines or fewer stay whole**. Every fragment of a longer
  split has **at least four source lines**. These are failing assertions, not
  observations. Font sizes are unchanged: body 11/16 pt; fences 8.5/12.6 pt.
- **2,522 inline prose blocks** received typographic punctuation. Their actual
  printed quote delimiters balance; converting curly punctuation back to straight
  reconstructs each source block **exactly, including whitespace**. Fences,
  inline code, URLs and whole link labels containing code are protected. The
  five ambiguous paragraphs listed below stay unchanged, without a guess.
- The symbol inventory comes from the rendered manuscript code's character text
  and drawing glyph IDs, compared against the bundled font cmap. **26 fused
  sequences** are present; the key must match exactly. Its first column must
  paint glyphs found in the source; its typing column must paint the individual
  character glyphs. The key's introduction/explanations are checked in the PDF
  separately from manuscript text. A contextual single colon and blank-line
  placeholders are excluded because they are not multi-character ligatures.
- The key intro/table text was sent through `aoe` before layout refinement.
  It is stored in `design/print/symbol-key.json`, not `book/`, and uses the existing
  table styling across pages **5–6**. It includes comments, paths, commands and
  diffs as well as TypeScript operators; meanings are scoped to the observed
  contexts. The original code font's shaping is preserved. Body text uses its
  normal ligatures.

### Headings and introductions: original folios to current folios

| First proof | Current | Target and result |
| --- | --- | --- |
| 121 | 126 | “The Debate” starts the scene with its subheading, dialogue and examples. |
| 89 | 92 | `In practice — the four shapes, side by side:` stays with its table or first code fragment. |
| 116 | 121 | `The Accepted Standard:` stays with its table or first code fragment. |
| 363 | 373 | `The exports field in both package manifests` stays with its table or first code fragment. |
| 369 | 379 | `tsconfig.json` stays with its table or first code fragment. |
| 377 | 387 | `tsconfig.json — replace include` stays with its table or first code fragment. |
| 71 | 73 | The Turn keeps its complete setup. The example follows on the next page; the heading is not stranded. |
| 103 | 107 | The Turn keeps its setup and following material on the page. |
| 216 | 221 | The Turn keeps its setup and following material on the page. |
| 254 | 260 | The Turn keeps its setup and following material on the page. |
| 266 | 271 | The Turn keeps its complete setup. The example follows on the next page; the heading is not stranded. |
| 336 | 346 | The Turn keeps its setup and following material on the page. |

### Code tails: every named target

Counts below are source lines, with wrapped display lines still attributed to
their original source line. A single folio means the complete fence stays whole.

| First proof tail folio | Old tail lines | Current fence placement |
| --- | --- | --- |
| 37 | 1 | p39: 11 lines |
| 97 | 1 | p100: 10 lines |
| 158 | 2 | p162: 12 lines |
| 192 | 2 | p196: 11 lines |
| 290 | 1 | p296: 10 lines |
| 305 | 1 | p312: 9 lines |
| 338 | 1 | p346: 9 lines; p347: 7 lines |
| 341 | 2 | p350: 11 lines |
| 347 | 2 | p356: 12 lines |
| 348 | 2 | p357: 10 lines |
| 383 | 1 | p391: 11 lines; p392: 4 lines |
| 409 | 1 | p418: 14 lines; p419: 12 lines |
| 413 | 3 | p422: 23 lines; p423: 11 lines |
| 420 | 1 | p429: 25 lines; p430: 4 lines |

### Sparse endings

After the heading/fence rules, three endings had three source lines or fewer.
Generated captions are excluded from that count. Only their earlier break choices
were changed; the source, type sizes and spacing settings were preserved.

| Chapter / current folio | Before balancing | After | Break choice |
| --- | --- | --- | --- |
| Ch13 / 226 | 2 lines | 6 lines | Keep Dima's preceding explanation with Oded's reply. |
| Ch20 / 315 | 3 lines | 4 lines | Keep Linoy's setup with the two-line example and Daniel's answer. |
| Ch21 / 328 | 3 lines | 7 lines | Bring the preceding fence's last four lines forward with Guy's conclusion. |

Every chapter now ends with more than three source lines. The one-line dedication
is intentional front matter. Ch13/20/21 still have generous end-space; this pass
fixes the orphan-sized ending without trying to fill every page. The other light
endings were left alone. For the original review's named ending targets:

| First proof ending folio | Current ending folio | Current source lines | Disposition |
| --- | --- | --- | --- |
| 46 | 48 | 28 | No separate balancing; exceeds the settled three-line threshold. |
| 61 | 63 | 16 | No separate balancing; exceeds the settled three-line threshold. |
| 138 | 142 | 5 | No separate balancing; exceeds the settled three-line threshold. |
| 196 | 200 | 6 | No separate balancing; exceeds the settled three-line threshold. |
| 210 | 214 | 20 | No separate balancing; exceeds the settled three-line threshold. |
| 247 | 252 | 4 | No separate balancing; exceeds the settled three-line threshold. |
| 106 | 109 | 10 | No separate balancing; exceeds the settled three-line threshold. |
| 153 | 157 | 11 | No separate balancing; exceeds the settled three-line threshold. |
| 235 | 240 | 12 | No separate balancing; exceeds the settled three-line threshold. |
| 272 | 277 | 12 | No separate balancing; exceeds the settled three-line threshold. |
| 285 | 291 | 11 | No separate balancing; exceeds the settled three-line threshold. |
| 379 | 388 | 17 | No separate balancing; exceeds the settled three-line threshold. |

### Openers

| First proof | Current | Result |
| --- | --- | --- |
| 5 | 7 | Label, rule and title remain; numeral ornament/box removed. |
| 7 | 9 | Label, rule and title remain; numeral ornament/box removed. |
| 12 | 14 | Label, rule and title remain; numeral ornament/box removed. |
| 391 | 400 | BONUS and title remain; the 5 and its box are gone. |

Bonus chapter openers retain **1, 2 and 3**, on **401, 414 and 426**. No forced
recto blanks were introduced.

### Ambiguous quotes held for the author

These five paragraphs are printed as supplied, including their straight quotes.
The table gives exact source lines and current proof folios. The converter does
not decide the ambiguous apostrophe/opening-quote role. Ordinary contractions and
possessives such as inline-code-plus-`'s` are handled outside the protected code.

| Source | Folio | Candidate |
| --- | --- | --- |
| `book/02-advanced-typescript/01-conditional-types.md:71` | 127 | `— "that's a ternary..."`: opening quotation after an em dash. |
| `book/03-patterns-and-design/02-branded-types.md:191` | 247 | `consumers' order check`: word-final apostrophe. |
| `book/03-patterns-and-design/03-runtime-validation.md:330` | 262 | `consumers' needs`: word-final apostrophe. |
| `book/04-the-real-world/02-monorepo-type-sharing.md:276` | 373 | `packages' source`: word-final apostrophe. |
| `book/04-the-real-world/02-monorepo-type-sharing.md:324` | 375 | `packages' dist` and `dependencies' manifests`: word-final apostrophes. |

The machine-readable evidence (including complete affected paragraphs) is
`design/print/output/whole-book-proof-layout/layout-review.json`; each run also
records its quote audit. No leading-apostrophe or parenthesis-opening candidate
remains outside these reported cases.

### Still open

1. Editorial decisions for those five quote paragraphs; the build preserves them
   until settled.
2. Editorial review of the symbol-key draft already sent through `aoe`. The two
   pages are a working proof using the existing table style, not a new fine-design
   direction.
3. Acknowledgments PR #40 was still **OPEN** at the final status check. The source
   remains **517e0fc / 33 files**; no acknowledgment placeholder was added. After
   merge, the authorized main merge and 34-file baseline will require new clean
   proofs with the one-page acknowledgment layout, contents entry and bookmark.

No specified heading/fence defect or three-or-fewer-line chapter ending remains.
The deliberately retained light endings, printer/recto decisions and placeholder
release metadata are not silently resolved by this proof.
