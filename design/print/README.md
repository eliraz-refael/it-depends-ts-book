# Print design study

For the current print-ready interior, see [Release export](#release-export).
[Whole-book proof](#whole-book-proof) remains available for review.
The Chapter 10 study below is historical.

A minimal sci-fi direction for **It Depends — TypeScript Principles, Debated**.
The study renders the complete Chapter 10 in 6 × 9 and 7 × 10 inches. It reads
the manuscript directly; it does not maintain a second copy of the chapter.

**Working format: 7 × 10 inches.** The author approved the visual direction and
preferred this size after reviewing both samples. Keep 6 × 9 as a comparison.
The chapter opener is approved as a direction; final pagination still needs a
full-book pass.

Pagination should flow automatically with editorial constraints: headings stay
with a meaningful opening passage, short code examples stay together with their
introductions, and short dialogue turns stay together. Avoid isolated lines at
page boundaries. Review longer examples for sensible breaks and inspect every
spread once the manuscript is stable. The current template implements initial
keep-together rules; these do not replace that final review.

## Review the samples

These saved snapshots capture the September 24, 2026 design study:

- [7 × 10 PDF — working format](samples/chapter-10-7x10.pdf)
- [6 × 9 PDF — comparison](samples/chapter-10-6x9.pdf)

![Chapter opener, dialogue, and debate pages](samples/design-preview.png)

The build writes to `output/`; it does not replace these review snapshots.
Refresh the snapshots deliberately when a new design is approved.

## Direction

- **Oxanium** gives chapter openers and headings their angular character.
- **IBM Plex Sans** carries the dialogue and narration.
- **JetBrains Mono** carries the code and small navigation labels.
- Outlined chapter numbers, a restrained branching-line motif, and fine rules
  provide the visual identity. The reading pages stay mostly white.
- The interior is monochrome. Syntax remains legible without relying on color.
- Code is selectable text. Long lines wrap with a hanging indent; the source
  is unchanged. Example numbers are local to this design study.
- The chapter's linked sources are also listed with their URLs at the end so
  they remain accessible in a printed copy.

## Build

Python 3 and Google Chrome are needed. From the repository root:

```sh
python3 -m venv design/print/.venv
design/print/.venv/bin/pip install -r design/print/requirements.txt
design/print/.venv/bin/python design/print/build.py
```

On other platforms, pass `--chrome /path/to/chrome`. `--html-only` creates the
HTML without launching a browser. Rendering uses an isolated temporary Chrome
profile, bundled fonts, and local HTML. No manuscript is uploaded.

Generated PDFs, HTML, page images, and verification notes go in `output/`
(ignored by Git). Open `preview.html` after building. The HTML chapter files
are continuous screen previews; the PDFs are the authoritative paginated samples.
Browser versions can change pagination, so compare the rendered pages when
updating Chrome.

The build checks page dimensions, font embedding, all 20 code-block labels, and
the final dialogue. The page PNGs support visual inspection. These checks do not
replace checking pagination and readability by eye, or ordering a physical proof.

## Print assumptions

These are **design samples**, not the final publication files. They use supported
KDP trim sizes, single pages, embedded fonts, and no bleed. Page numbers start at
1 within the sample; front matter, final running heads, and book pagination still
need to be integrated. The inside margins are provisional: confirm the gutter
against the full book's page count and binding before submission. Cover dimensions
and spine design also wait for the final page count and paper choice.

KDP references:

- [Manuscript and cover file requirements](https://kdp.amazon.com/en_US/help/topic/G201857950)
- [Trim size, bleed, and margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6)
- [Printing cost and trim-size categories](https://kdp.amazon.com/en_US/help/topic/G201834340)

## Fonts

Bundled under the SIL Open Font License, with each license in `fonts/`:

- [Oxanium](https://github.com/sevmeyer/oxanium/tree/master/fonts/ttf)
- [IBM Plex Sans](https://github.com/IBM/plex/tree/master/packages/plex-sans/fonts/complete/ttf)
- [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono)

The files were downloaded from those official repositories on September 24,
2026. Keeping the exact font files here makes subsequent renders independent of
changes to the upstream fonts.

## Settled page-bottom footnote trial

The Chapter 10 studies above remain unchanged. The separate step-1 trial reads
and hashes the frozen `book/` tree, derives its seven-link inventory, then renders
nine specimens: seven synthetic cases and two placements of all 17 actual book
tables, not a whole-book proof. Its current result is **PASS with table-header
repetition deferred**; see
[the trial review](../../docs/editorial/full-review/PRINT-TRIAL-REVIEW.md).
Do not use the study's source appendix as a fallback.

From the repository root, install only the pinned tools:

```sh
python3 -m venv design/print/.venv
design/print/.venv/bin/pip install -r design/print/requirements.txt
npm ci --prefix design/print --ignore-scripts
```

`trial-toolchain.json` pins the tested Node, Python, Chrome and Paged.js versions.
Chrome is the existing local application; the trial does not download a browser.
`package-lock.json` pins Paged.js's transitive dependencies. The Python tools
retain their existing exact requirements. No new Python packages are needed.

```sh
# Source/inventory, dialogue, metadata and marker controls only:
design/print/.venv/bin/python design/print/footnote_trial.py --validate-only

# Fresh trial (all nine specimens; table-header limitation reported explicitly):
design/print/.venv/bin/python design/print/footnote_trial.py

# Inspect saved artifacts again without running Chrome/pagination:
design/print/.venv/bin/python design/print/footnote_trial.py --inspect-existing

# Validate the committed real publication metadata:
design/print/.venv/bin/python design/print/footnote_trial.py --mode release --validate-only
```

`release-metadata.json` is the only source of publication metadata. Proof mode
permits placeholders for development; release mode rejects publication
placeholders. The committed metadata now contains the approved real values. The fixtures always carry a proof footer. A passing
release metadata gate would not turn these synthetic pages into a release.

The inventory is parsed from Markdown inline tokens in the approved reading
order and compared with `link-inventory.json`. Speaker-labelled paragraphs,
quoted continuations, embedded quoted speech and blockquotes containing links
fail before rendering. Code literals do not count as links. This deliberately
conservative gate covers the book's dialogue syntax; it is not a classifier for
arbitrary prose. Keep any future exceptions editorial, not a silent bypass.

The local Chrome process uses a fresh temporary profile and file access for
Paged.js's local stylesheet loading. HTTP(S) document requests are blocked and
asserted absent. Font loading and the pagination promise must finish before PDF
capture; there is no fixed sleep standing in for completion. Timeouts fail the
run. Only the trial's browser/profile is cleaned up.

All generated HTML, rendered DOM, layout metrics, PDFs, extracted text, PNGs,
font/source hashes and `results.json` are under ignored
`output/footnote-trial/`. Every page has a PNG; `all-pages.png` is the contact
sheet. The verifier checks printed callout and note numbers as well as DOM
references: matching IDs alone missed the initial numbering failure. It also checks
full selectable URL text, clickable destinations, note placement, retained code
lines/table rows, embedded fonts and 7 × 10 trim. Every PDF page also asserts that
its callout numbers equal its note-body numbers; chapter reset restarts the
notes without restarting page numbers.

The authorized repair changes the note-marker counter to `footnote-marker`.
`chapter-counters.js` is a small local Paged.js Handler that preserves the folio
increment on a footnote-reset page; the pinned renderer otherwise disables that
increment. The whole-book build also carries the chapter note count across later
pages, so a first note several pages after its opener still starts at 1. There
are no new dependencies.

Every actual Markdown table is parsed from the frozen source, identified, hashed
and rendered twice: at a fresh-page placement and near a page boundary. Book
tables use `break-inside: avoid`; verification fails if a table has more than one
rendered fragment, exceeds the page body, or loses a cell in the DOM or PDF.
The largest is 436.77 pt in a 620.64 pt body. Repeating headers is therefore
deferred for this manuscript. The unchanged oversized synthetic table still
loses continuation headers; that becomes a recorded limitation only when both
complete sets of actual-table checks pass. No repeating-header handler is added.

`footnote-pages.png` collects the 14 pages of footnote cases, `book-tables.png`
collects the 17 natural-height table pages, and `all-pages.png` includes all 60
pages, including near-boundary placements. The initial failing artifacts are
preserved in `output/footnote-trial-before-b757e2e/`.

The trial itself does not assemble the book. Its success is not release approval.
The authorized whole-book proof follows below; it uses the same renderer and
page-bottom notes, with no manuscript rewrite or printer setup.


## Whole-book proof

The current build assembles the frozen **c37c3ea** manuscript (byte-identical
`book/` content to the accepted **d03727a** proof) through the approved 34-file
manifest. The current proof has **438 pages**, all marked **PROOF**, and passes
content, navigation, layout and reproducibility checks;
see the page-specific [spread review](../../docs/editorial/full-review/WHOLE-BOOK-PROOF-REVIEW.md).
This is not release approval.

Use the pinned environment installed for the trial, from the repository root.
A complete verification run is:

```sh
npm ci
npm run check
design/print/.venv/bin/python design/print/footnote_trial.py

# Each render requires its own absent output directory; archive prior runs first.
design/print/.venv/bin/python design/print/build_proof.py --run a
design/print/.venv/bin/python design/print/build_proof.py --run b
design/print/.venv/bin/python design/print/build_proof.py --compare

# Revalidate saved DOM/PDF artifacts and regenerate the final PDF/images:
design/print/.venv/bin/python design/print/build_proof.py --run a --inspect-existing
```

Current outputs live in ignored `output/whole-book-proof-c37c3ea/`. The review PDF is
`a/It-Depends-PROOF.pdf`; `a/pages/page-001.png` through `page-438.png` are the
individual pages. `a/contact-sheets/spreads-01.png` through `spreads-28.png`
show consecutive facing pages. The independent `b/` render supplies comparison
evidence without duplicating the image gallery. Each run saves input hashes,
HTML, paginated DOM, layout metrics, extracted text, toolchain/font hashes and
`validation.json`; the pair produces `comparison.json`.

The proof uses continuous Arabic folios and starts each act/chapter on the next
page, without forced recto blanks. These are explicit proof settings, not final
pagination decisions. Generated contents and 191 hierarchical bookmarks use
measured destinations. All five fence languages are selectable, highlighted
text; continuation captions are generated, not inserted into the manuscript.
Assistant requests/transcripts have a distinct box style. All 17 book tables
must remain unsplit. Repeated table headers remain deferred as in the trial.

Validation covers the frozen source hashes, every rendered fence hash and source
text block, PDF text completeness, chapter note numbering, selectable URLs,
clickable callout and contents destinations, embedded fonts, trim, source bounds
and body/note separation. The pair comparison checks every page's text and
character geometry, link targets, bookmarks and raster hash; it also checks PDF
text bounds against trim. It excludes volatile PDF metadata/object IDs rather
than asserting raw file-byte identity. Layout observations such as sparse pages
and short code continuations are reported separately from lost/clipped content.

The source's final note stays before the final Verdict. The exact final narrative
line is asserted, and no generated appendix or notes follow it. The only page
furniture below it is the required proof footer and folio. Rendering remains
local with HTTP(S) requests blocked. Publication metadata lives in one file;
the release gate rejects placeholder values.


### Settled layout pass

The 428-page first proof remains in `output/whole-book-proof/` as comparison
evidence. The current commands write the revised proof to
`output/whole-book-proof-d03727a/`. Intermediate development renders stay there
under explicitly named `development-*` directories; `a/` and `b/` are the clean
comparison runs. Type sizes remain 11/16 pt for body text and 8.5/12.6 pt for
fences. No manuscript changes, added dependencies or renderer changes are used.

`ProofKeeps` adjusts Paged.js overflow boundaries backwards when CSS keeps would
strand a narrative heading, a short introduction or a fence fragment. Fences of
12 source lines or fewer stay whole; every fragment of a longer split has at
least four source lines. Saved-DOM checks assert the keeps and fragment counts.
Three measured tiny endings (Ch13, Ch20 and Ch21) receive earlier break choices;
the verifier counts their source lines separately from generated captions. Other
light ending pages are left alone. Acts I–IV now have centred part title pages
with a small ACT label and solid Roman numeral; the Bonus part uses BONUS
and AI & TypeScript. The part title comes from the same `ACTS` data as its
contents entry; the build asserts that they agree. Chapter openers keep their Arabic numerals and existing
layout. How to Read and Meet the Cast have centred title-only openers, followed
by body text on the next page. These seven title pages have no running head or
chapter rules. The build asserts their contents and physical-page centring, and
that part numeral typography/positions differ from chapter numerals.

`prose_quotes.py` converts prose text tokens only. Code, literal URLs and link
labels containing code are protected. The actual printed delimiters are checked
for balance, and mapping curly punctuation back to straight must reconstruct each
source text block exactly, including whitespace. All 1,507 inline-code values
are checked unchanged in addition to the fence hashes. `quote-decisions.json`
records the author's nine explicit mark decisions in five paragraphs, keyed by
source path, line, original Markdown SHA-256 and character offset. A changed
paragraph or missing decision fails the build. These decisions do not loosen the
general rules. All converted paragraphs balance and reverse exactly; any
unsettled ambiguity fails validation. None remains in this source.

The author replaced the proposed ligature removal with a print-only symbol key.
The code keeps its existing shaping. `symbol_key.py` joins the PDF character text
and glyph-drawing trace at their measured origins, restricted to source fences
and inline code. It compares glyph IDs with the bundled font cmap to inventory
actual fused combinations. Single-character contextual alternates and the blank
line placeholder are not multi-character ligatures. The key must cover exactly
that inventory: **26 sequences**, not the font's complete substitution list.
`symbol-key.json` holds the approved introduction and four ordered groups,
with a SHA-256 of the supplied text. The key uses body-size text on pages 7–8;
its 1,021-point natural height exceeds the 621-point page body. Breaks are allowed
only between whole groups. The intro's two inline examples must paint the fused
source glyphs. Paired meanings may share a cell; all 26 combinations retain
their own printed-glyph and typing cells. The key is generated after the contents, separately
from the manuscript manifest and text count. Its printed column must use glyphs
observed in the book; its typing column must use the individual character glyphs.
Both checks run against the saved PDF. Only that typing column isolates glyphs.
Every inline-code span in the key stays unbroken; validation checks its single
line rectangle and horizontal bounds, including `!= null`.

PR #40 is merged. The frozen source is main `d03727a0947a8434ac36e3978533152dc93a2e0f`,
with 34 files. The physical order is title (1), proof information (2), dedication
(3), acknowledgments (4), contents (5–6), symbol key (7–8), How to Read (9) and
Meet the Cast (14). There is no separate Prologue part page: its contents group
and bookmark both point at How to Read. Dedication and acknowledgments are
front matter before the Prologue, with their own top-level bookmarks and contents
entries. Order, running heads and measured navigation are asserted.
Acknowledgments immediately follows the dedication as a single
quiet page, with its heading and three paragraphs, no opener or numeral box,
and an entry in contents and bookmarks. Manifest coverage is checked against
the frozen Git tree, not a hard-coded file count. Output directories derive
their suffix from the frozen commit; the 33-file layout checkpoint is preserved
in `output/whole-book-proof-layout/`. All new hashes and counts come from fresh
source parsing and rendering.


## Release export

The release mode uses the same frozen manuscript, renderer, typography and
pagination as proof mode. It changes only the title-page furniture, copyright
page, README note destination and PDF publication properties. No `book/` edits
are made. Metadata is approved for KDP paperback, black ink on white paper,
7 × 10 inches, no bleed. Continuous folios and next-page starts are retained.

Use the pinned tools installed above, from the repository root:

```sh
npm ci
npm run check
design/print/.venv/bin/python design/print/check_release.py
design/print/.venv/bin/python design/print/footnote_trial.py

# Archive existing a/ and b/ directories before starting clean renders.
design/print/.venv/bin/python design/print/build_proof.py --mode release --run a
design/print/.venv/bin/python design/print/build_proof.py --mode release --run b
design/print/.venv/bin/python design/print/build_proof.py --mode release --compare

# Proof mode remains separate, with PROOF marks and navigation.
design/print/.venv/bin/python design/print/build_proof.py --mode proof --run a
```

Release output is ignored under `output/whole-book-release-c37c3ea/`:
`a/It-Depends-KDP-interior.pdf`, `a/pages/`, `a/contact-sheets/`, per-run
`validation.json`, `publication-terms.json`, and the pair's `comparison.json`.
Images `page-001.png`, `page-002.png`, `page-013.png` and `page-438.png` show
the title, copyright, README note and last page. The complete image set also
includes page 10. The release is 438 pages; the independently built proof is
also 438 pages. The build only prints `v1.0.0`; it does not create or publish a tag.

All manuscript/source, fence, inline-code, quote, note, table, keep, symbol-key,
opener, font, overflow and last-line checks apply in both modes. Release replaces
clickable-navigation checks with absence checks for outlines, annotations, form
fields and JavaScript. Cleanup removes structural references to discarded links
and garbage-collects unreachable objects. Contents folios and note URLs stay
printed and selectable. No PROOF mark or frozen commit is printed. Copyright
text is asserted line by line against `copyright.txt` and publication metadata.

Release furniture: pages 1–3 (title, copyright, dedication) have no running head
or folio, but still count toward continuous numbering. Acknowledgments, contents
and symbol-key pages keep both. The author is set at 22pt in Plex beneath a rule
near the foot of the title page; title/subtitle positions are unchanged. Former
link text and note URLs have no underlines; callouts remain.

To compare cosmetic changes against an archived accepted release:

```sh
design/print/.venv/bin/python design/print/check_release_polish.py \
  design/print/output/whole-book-release-c37c3ea/accepted-8be209a \
  design/print/output/whole-book-release-c37c3ea/a
```

This asserts 438 pages, exact title/subtitle placement, unchanged copyright and
dedication bodies, identical pp4–8 rasters, and unchanged text/geometry and rasters
on pp9–438 except the exact former underline paths (one raster-pixel allowance
for antialiasing). It verifies that those paths are absent in the new PDF.

The settled publication-term rule is source-based: every occurrence of
`placeholder`, `TBD` or `example.invalid` must match the frozen source's exact
spelling, file and line, with equal PDF/source counts. Word rectangles must lie
inside the corresponding source block. Build-generated furniture, notes and
metadata cannot introduce occurrences. The current source has four instances of
`placeholder` (including compounds/plurals), and zero of the other two terms.
The report lists all four PDF pages and source lines. `check_release.py` exercises
allowed source terms, added terms and changed-source controls.

Document Info and XMP carry the real title **It Depends**, author **Eliraz
Kedmi**, subtitle as Subject/description and descriptive Keywords. Both formats
are asserted against the approved values; they contain no publication
placeholders. This is the author's settled metadata policy. The title/copyright
copy and approved metadata values live in `copyright.txt` and
`release-metadata.json`; the build verifies their agreement.

All pages are 504 × 720 points, with effective crop/trim/bleed boxes equal to
that rectangle and no crop or printer marks. Font programs (or Type 3 glyph
programs for the outlined chapter numerals) are embedded. Release normalizes
paint to DeviceGray, audits any original non-grey paint and verifies the saved
PDF's text/vector colours. Synthetic red paint is a negative control. Original
book paint is already grey; code contrast is unchanged. The weakest token
contrast is 7.14:1 (comments on the code background).

Two clean release renders must have identical extracted text, character
positions and every page raster; only volatile PDF IDs/metadata are excluded
from the reproducibility comparison. See [release evidence](../../docs/editorial/full-review/RELEASE-EXPORT.md).
The PDF hygiene checks follow [KDP's Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).
This build does not upload to KDP or create a release tag. Final platform preview
and a physical proof remain publishing steps, not manuscript/build changes.
