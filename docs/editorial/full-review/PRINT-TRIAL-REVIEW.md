# Print trial review — step 1

## Verdict

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

`/Users/elirazk/private/ts-book-worktrees/full-review/design/print/output/footnote-trial/`

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
