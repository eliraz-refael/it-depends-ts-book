# Print trial review — step 1

**Current verdict after the authorized repair: PASS, with oversized-table header
repetition deferred.** All nine specimens pass the applicable checks. The
initial failure and the before images remain recorded below; the repair results
and after images follow them. This is still a pagination trial, not a whole-book
proof or release approval.

## Initial trial verdict (b757e2e)

**FAIL; stopped before whole-book assembly.** The current Paged.js trial prints
callouts **1, 2** but note-body markers **2, 2** when two notes share a page.
The long table also loses its column headings after page 1. No renderer switch,
endnote fallback or manuscript edit was made.

This is a failure of the **tested configuration**, not a finding that Paged.js
cannot render footnotes. The trial's `::footnote-marker` rule uses
`counter(footnote)`, the callout counter. Inspection of the pinned package shows
a separate `footnote-marker` counter for relocated note bodies
(`src/polisher/base.js`, lines 455–460). I retained the failing CSS and stopped
rendering once the visual inspection exposed the mismatch, as the settlement
requires. Changing that rule is an untested possible correction, not a claimed
fix. Likewise, `thead { display: table-header-group }` alone did not repeat the
header in this rendered table. Neither issue was patched around.

## Base and scope

Merged `origin/codex/release-recheck` at `517e0fc` into `codex/print-build` with
merge commit `91138ba`. The build checks all 33 manuscript files byte-for-byte
against `517e0fc794b817452ee9c3efcb4690d7772cbde8` before and after rendering.
`book/` is unchanged from that commit. The saved Chapter 10 studies, their
renderer and stylesheet are unchanged too.

The five fixtures are synthetic pagination cases using all seven actual link
targets. They are not edited chapters and do not assemble the book. The 7 × 10
trim, bundled fonts, monochrome palette, body/code sizes and margins follow the
approved design. Running heads identify these pages as trials.

## Results and page images

11 pages, 9 note occurrences, 7 distinct destinations. Each note body and its
callout have matching DOM references on the same page; that alone is insufficient
because printed markers can disagree.

| Specimen | Pages | Result |
| --- | ---: | --- |
| `01-short-repeat` | 1 | **FAIL:** callouts 1/2; note markers 2/2. Repeated target has two complete notes; formatted label survives. |
| `02-long-urls` | 1 | **FAIL:** callouts 1/2; note markers 2/2. Both full URLs, including the pinned commit and line fragment, remain selectable and clickable. |
| `03-near-break` | 2 | PASS for this placement: callout in the last 15% of page 1's body; its complete note stays there, following paragraph goes to page 2. |
| `04-long-code` | 3 | PASS for preservation/notes: all 90 code lines occur once, selectable, in order; notes before and after the block stay with their callouts. |
| `05-long-table` | 4 | **FAIL:** header only appears on page 1. All 55 rows survive once; notes in rows 1 and 38 remain on their callout pages with correct markers. |

The near-break case does **not** prove forced relocation of the callout to the
next page: it fits on page 1. The initial harness over-required that movement;
inspection now asserts the actual requested near-boundary case, including the
following paragraph's break. No new pagination run was made to change the
outcome. The code's final page contains just its last line before the following
paragraph, and the table leaves substantial blank space on early pages. These
are layout-quality limitations, not a production layout approval.

Output directory (ignored, local to this worktree):

`/Users/elirazk/private/ts-book-worktrees/full-review/design/print/output/footnote-trial-before-b757e2e/`

- Contact sheet: `all-pages.png` (all 11 pages).
- Numbering failure: `01-short-repeat-page-01.png`, `02-long-urls-page-01.png`.
- Near-break case: `03-near-break-page-01.png` and `-02.png`.
- Code: `04-long-code-page-01.png` through `-03.png`.
- Table: `05-long-table-page-01.png` through `-04.png`.
- Exact checks, PDF hashes, source/font hashes and link inventory: `results.json`.
- Each specimen also has `.pdf`, `.html`, `.rendered.html`, `.layout.json` and
  extracted `.txt` evidence.

I inspected the full contact sheet and enlarged the short-link, long-URL,
near-break, code-continuation and table-continuation pages. The printed numbers
in the images are the decisive failure, independently asserted from PDF text.

## Validation

- `npm ci --prefix design/print --ignore-scripts`: clean locked install, 0
  vulnerabilities. Paged.js brings deprecated transitive polyfills; no extra
  packages were introduced to replace them.
- Existing Python requirements installed in the ignored local virtualenv; all
  four exact versions verified by the trial.
- `footnote_trial.py --validate-only`: **pass**, 33 frozen files; six external
  links plus the README; **14 controls**. Includes five dialogue forms, code
  literals, formatted labels/query/fragment preservation, changed/restored link
  inventory, proof/release metadata, and bad/restored note numbering.
- `footnote_trial.py --mode release --validate-only`: **expected failure** for
  the repository URL, release tag, license and imprint placeholders, before
  any renderer runs. Proof mode accepts those values. Synthetic complete
  metadata passes the release-gate control without changing the metadata file.
- Paged.js trial: completed five local specimens, then failed verification.
  `--inspect-existing` rechecks those artifacts and exits **1** with the two
  marker mismatches and missing table headers. The rendered artifacts have not
  been regenerated since the footnote failure was identified.
- Every PDF is 504 × 720 pt, fonts are embedded, all nine callouts are correctly
  numbered, all complete destination strings are selectable, and all expected
  destination URLs have clickable PDF links. Checked body markers, code lines,
  table rows and footnote boxes show no loss, overlap or page-edge clipping in
  these specimens. No HTTP(S) render requests or browser exceptions occurred.
- The first launch failed local stylesheet loading; adding file access to the
  isolated browser resolved that harness setup issue before the pagination
  trial. The browser still blocks HTTP(S) document requests.
- No compiler/example changes were made. The manuscript compiler/benchmark suite
  was not rerun for this print-only trial.

Toolchain: Node **22.23.4**, Python **3.14.8**, Google Chrome
**156.0.8078.80**, Paged.js **0.4.3**. Python packages: markdown-it-py **4.2.0**,
mdurl **0.1.2**, Pygments **2.21.0**, PyMuPDF **1.28.2**. Node transitive versions
and integrity hashes are pinned in the local package lock. Browser, runtime and
renderer pins are checked; no browser download is used.

## Settlement dispositions

1. Frozen base merged; build only reads `book/`.
2. Inventory derived from parsed tokens and asserted against the seven-link
   baseline. Dialogue links fail, with negative controls; no Markdown rewrites.
3. All five trial cases rendered and images retained. Footnote failure stops the
   work here. No whole-book assembly, renderer switch or endnotes.
4. One `release-metadata.json` owns the placeholders and release gate. No public
   URL is inferred from the private Git remote. Printer/paper/binding untouched.
5. Only the planned Paged.js and existing pinned Python dependencies; outputs,
   virtualenv and node_modules ignored. Commit contains trial sources and reports,
   not PDFs/images. No push.

The implementation follows Paged.js's inline `float: footnote` mechanism
([official footnote example](https://pagedjs.org/plugins/endnotes-to-footnotes/)).
The actual local PDFs, not that documentation, determine this trial's verdict.


## Authorized repair round — before and after

The user authorized one repair round on the same pinned renderer. The marker
rule now reads `content: counter(footnote-marker) '. '`. Both original two-note
pages change from **callouts 1/2, bodies 2/2** to **callouts 1/2, bodies 1/2**.
All five original specimens were rerun, without changing their contents.

Two new footnote cases verify **three notes on one page** (1/2/3 in both places)
and **a chapter boundary in one HTML/PDF** (1/2 on page 1, then 1/2 on page 2).
The verifier extracts both sequences from PDF text on every page and asserts
that they agree with each other and with the expected occurrence numbers. DOM
references, labels, clickable destinations and complete selectable URLs remain
checked as before. Chapter numbering does not reuse destination IDs.

The chapter case exposed a separate counter interaction: Paged.js 0.4.3's
`Counters.afterPageLayout` sets `counter-increment: none` when it resets
footnotes, so the second page initially printed folio 1 as well. The new PDF
folio assertion reproduced that failure. A CSS-only correction was consumed by
the polisher before generated pages existed. The final repair uses the local
14-line `chapter-counters.js` Handler: when a page resets footnotes but not page
numbers, it restores the renderer's normal page increment. The repaired second
page prints **folio 2**, while its notes restart at **1**. This is not a table
header handler and introduces no dependency. The intermediate failing chapter
PDF and PNGs are retained in `output/footnote-reset-control/`.

### Actual table measurements and ruling

Before changing table pagination policy, I extracted and rendered **all 17
actual tables** from the frozen Markdown, including both cast tables. The
parser renders the table tokens themselves, with only a build-owned identifying
attribute added. Source path, start line, table Markdown SHA-256, exact cell
text and rendered height are recorded. No synthetic rows stand in for these
measurements; fonts, column widths, cell padding and trim are unchanged.

None requires more than a page. Available body height is **620.64 pt**; the
largest table is Ch6's comparison, **436.77 pt**. Under the user's ruling,
repeating headers is deferred. Book tables now use `break-inside: avoid`, and
the build fails if any actual table appears in more than one page fragment,
exceeds the body, changes its cells, or loses cell text in the PDF. A second
specimen places every actual table after a 520 pt preamble: all 17 still remain
whole, with larger tables moving to the following page. Both complete sets
must pass before the synthetic table's missing headers can be a limitation
rather than a failure.

| Table | Source (under `book/`) | Height, pt |
| --- | --- | ---: |
| book-table-01 | `00-prologue/02-meet-the-cast.md:273` | 181.37 |
| book-table-02 | `00-prologue/02-meet-the-cast.md:283` | 313.02 |
| book-table-03 | `01-the-type-system/02-type-assertions.md:415` | 343.54 |
| book-table-04 | `01-the-type-system/03-interface-vs-type.md:419` | 317.54 |
| book-table-05 | `01-the-type-system/04-enums-vs-unions.md:443` | 309.07 |
| book-table-06 | `01-the-type-system/05-narrowing-strategies.md:444` | 369.53 |
| book-table-07 | `01-the-type-system/06-generics-basics.md:321` | 436.77 |
| book-table-08 | `02-advanced-typescript/01-conditional-types.md:591` | 358.79 |
| book-table-09 | `03-patterns-and-design/05-pure-functions.md:227` | 118.65 |
| book-table-10 | `03-patterns-and-design/05-pure-functions.md:284` | 94.92 |
| book-table-11 | `03-patterns-and-design/06-imperative-vs-declarative.md:240` | 94.92 |
| book-table-12 | `03-patterns-and-design/07-currying-partial-application.md:243` | 71.19 |
| book-table-13 | `03-patterns-and-design/08-hof-patterns.md:113` | 189.84 |
| book-table-14 | `03-patterns-and-design/08-hof-patterns.md:264` | 94.92 |
| book-table-15 | `03-patterns-and-design/09-config-to-function.md:309` | 107.92 |
| book-table-16 | `04-the-real-world/04-performance-vs-safety.md:169` | 118.65 |
| book-table-17 | `04-the-real-world/04-performance-vs-safety.md:256` | 71.19 |

The four-page synthetic table is deliberately unchanged. Its notes and 55 rows
pass; continuation headers still do not repeat. The build prints that limitation
and records it in `results.json`. No repeating-header handler is needed for the
current frozen tables. A future table too tall to keep whole fails this policy;
it is not silently permitted to split. Full-book assembly must carry forward
both the keep-together rule and the no-split assertion.

### Final verification

| Specimen | Pages | Notes | Result |
| --- | ---: | ---: | --- |
| `01-short-repeat` | 1 | 2 | PASS |
| `02-long-urls` | 1 | 2 | PASS |
| `03-near-break` | 2 | 1 | PASS |
| `04-long-code` | 3 | 2 | PASS |
| `05-long-table` | 4 | 2 | PASS; oversized-table headers deferred |
| `06-three-notes` | 1 | 3 | PASS |
| `07-chapter-reset` | 2 | 4 | PASS |
| `08-book-tables` | 17 | 0 | PASS |
| `09-book-tables-boundary` | 29 | 0 | PASS |

**60 pages, 16 notes; all applicable checks pass.** The five original specimens
retain their page counts (1, 1, 2, 3, 4). The original code-block last-line and
synthetic-table whitespace limitations remain; this round does not redesign
pagination. Metadata and inventory controls still pass (14 controls), and
release mode still rejects the four committed placeholders before rendering.
All 33 manuscript files match the frozen commit before and after. Pinned tools
and dependency files are unchanged; no new npm/pip packages were added. No
compiler/example suite was rerun for these print-only changes.

Commands run: initial `--only 08-book-tables` measurement; full
`footnote_trial.py` after repair; final `--inspect-existing`; `--validate-only`;
release `--mode release --validate-only` (expected failure). The PDF folio guard
failed on the intermediate chapter reset and passed with the Handler. The final
PDFs have continuous folios, embedded fonts, the correct trim and matching note
numbers. No HTTP(S) document requests occurred.

### Page-image paths

All paths below are under:

`/Users/elirazk/private/ts-book-worktrees/full-review/design/print/output/`

| Evidence | Before | After |
| --- | --- | --- |
| Two long URLs and their numbers | `footnote-trial-before-b757e2e/02-long-urls-page-01.png` | `footnote-trial/02-long-urls-page-01.png` |
| Synthetic table, unchanged header limitation | `footnote-trial-before-b757e2e/05-long-table-page-03.png` | `footnote-trial/05-long-table-page-03.png` |
| Chapter reset and continuing folio | `footnote-reset-control/07-chapter-reset-page-02.png` | `footnote-trial/07-chapter-reset-page-02.png` |

Additional after images:

- `footnote-trial/06-three-notes-page-01.png`: three matching numbers.
- `footnote-trial/footnote-pages.png`: all 14 pages from the seven footnote cases.
- `footnote-trial/book-tables.png`: all 17 actual tables at natural height.
- `footnote-trial/08-book-tables-page-07.png`: largest table, Ch6.
- `footnote-trial/09-book-tables-boundary-page-14.png`: that same table moved
  intact after the near-boundary preamble.
- `footnote-trial/all-pages.png`: all 60 pages, with individual PNGs beside it.
- `footnote-trial/results.json`: per-page PDF callout/body number sequences,
  table measurements, limitations, hashes and the overall PASS.

I inspected the footnote and actual-table contact sheets and enlarged the
long-URL, three-note, chapter-reset and largest-table pages. Images and generated
PDFs remain ignored and uncommitted. No `book/` edit, renderer switch, endnotes,
whole-book assembly or push was made.
