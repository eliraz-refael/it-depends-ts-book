# Release interior export

Frozen source: `c37c3eae94bd4787ba97f9c58e4aa92e2ea3b333`. The 34-file
`book/` tree is unchanged; it is byte-identical to the accepted d03727a manuscript.
No manuscript, dependencies, renderer, type sizes or body layout were changed.

## Deliverable

`design/print/output/whole-book-release-c37c3ea/a/It-Depends-KDP-interior.pdf`

- 438 pages, PDF 1.4, **2,171,535 bytes** (about 2.17 MB).
- SHA-256: `b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3`.
- Every page is 7 × 10 inches; no bleed, crop marks or printer marks.
- Black/greyscale only; all fonts embedded, including outlined numeral glyphs.
- The final release count agrees with the selected cover's 438-page basis.
  White-paper spine calculation remains 438 × 0.002252 = 0.986376 inches.
- Generated PDF/images/logs remain ignored and are not committed. Nothing is
  uploaded, pushed or tagged. The build prints the agreed future tag `v1.0.0`.

Review images, relative to that output's `a/` directory:

| Page | Image | Review |
| --- | --- | --- |
| 1 | `pages/page-001.png` | Author in house style; title/subtitle preserved; no proof furniture. |
| 2 | `pages/page-002.png` | Quiet copyright block, approved text and blank lines in order. |
| 13 | `pages/page-013.png` | Real README URL and matching note/callout 1, without a clickable annotation. |
| 438 | `pages/page-438.png` | Exact final narrative line, only the folio below it. |

Page 10 is also included in the complete image set. The README note is on page
13, as confirmed in the settlement. `contact-sheets/spreads-01.png` through
`spreads-28.png` cover the book. Page 40 was checked visually for code/comment
contrast and unchanged ligatures.

## Publication changes

Release mode adds the real author to p1, replaces proof information with the
approved copyright p2, removes every PROOF footer, and changes the README note
to `https://github.com/eliraz-refael/it-depends-ts-book#checking-the-examples`.
The README heading is parsed and its anchor asserted. All seven printed note
URLs remain selectable text. Contents folios remain printed text.

Release sanitation removes outlines, annotations, widgets, document actions,
JavaScript and discarded navigation's structural references. It garbage-collects
unreachable objects. Document Info and XMP both carry **It Depends**, **Eliraz
Kedmi**, the subtitle as Subject/description and real descriptive Keywords.
The copyright block is checked against approved metadata and against the PDF
line by line. The frozen commit is never printed in the release.

PDF hygiene is based on [KDP's Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).
Real Info/XMP is retained under the author's explicit settlement. The publication
placeholder ban is likewise the settled source-based rule below, not a ban on
ordinary technical vocabulary.

## Settled publication-term rule

Every PDF occurrence of `placeholder`, `TBD` or `example.invalid` must correspond
to the same exact source occurrence, file and line. Counts must match. Each PDF
word must fall inside the corresponding source block; a generated title,
copyright line, contents entry, symbol-key line, running head or footnote URL
cannot use an allowed manuscript occurrence as an exemption. Metadata is checked
separately and must contain none of these terms.

| Term | Source file and line | PDF page |
| --- | --- | --- |
| placeholder | `book/01-the-type-system/01-any-vs-unknown.md:515` | 44 |
| placeholder (in placeholders) | `book/04-the-real-world/04-performance-vs-safety.md:71` | 392 |
| placeholder (in placeholder-free) | `book/04-the-real-world/04-performance-vs-safety.md:297` | 398 |
| placeholder (in placeholders) | `book/04-the-real-world/04-performance-vs-safety.md:305` | 399 |

Totals: `placeholder` 4/4 source/PDF; `TBD` 0/0; `example.invalid` 0/0.
Zero generated occurrences. `publication-terms.json` records the mapping.
Uppercase PROOF occurs zero times. Lowercase manuscript uses of “proof” remain.

## Validation

Both clean release renders pass all content and layout checks:

- 34 frozen file hashes, 3,487 source text blocks, 490 fences, 4,759 code lines,
  1,507 inline-code occurrences, seven assistant transcripts.
- All 17 tables unsplit; all note callouts/body numbers and printed URLs match.
- All 26 actual fused combinations represented in the symbol key; typing-column
  characters remain unfused.
- 2,527 converted quote paragraphs, explicit source-located quote decisions,
  balanced/reversible conversions and zero unresolved ambiguities.
- Heading/introduction keeps, short-fence no-split and four-line fragment rules,
  opener geometry, folios, embedded fonts, source bounds and overflow checks.
- Notes on pp13, 67, 131, 248, 398, 405 and 437; no material or note after the exact
  last narrative line on p438.
- No outlines, annotations, forms or JavaScript, checked after saving, including
  an object-level scan for discarded annotation/action objects.
- No original non-grey paint. 15,360 RGB paint operators normalized to DeviceGray.
  Code contrast: normal 17.01:1, comments 7.14:1, strings 12.10:1 against the code
  background. The final saved text/vector colours are verified grey.

The independent release runs have identical text, character geometry and every
page raster. `comparison.json` passes across 438 pages. File hashes differ only
as permitted for volatile PDF IDs; rendered output does not differ.

A separate comparison against the accepted proof checks all **9,757 manuscript
text/code/inline-code fragments**: identical page membership, text and rectangles.
Evidence is `manuscript-layout-comparison.json`. Existing layout observations
are unchanged; this export introduces no layout repairs or new layout issues.

`check_release.py` verifies dirty-PDF controls for red paint, outlines, links,
comments, widgets, JavaScript and incorrect Info/XMP. Cleanup retains visible
text. Source-term controls allow source-owned placeholder/TBD, reject generated
occurrences and reject changed source counts.

Final regression results:

- Clean `npm ci`: PASS; zero reported vulnerabilities.
- Full `npm run check`: PASS, all 25 scripts (baseline plus Ch1–27 and Bonuses 1–3).
- Nine print specimens: PASS, including note reset and all actual book tables.
- Proof-mode rebuild: PASS, 438 pages and 191 bookmarks, with PROOF marks,
  clickable notes/contents and the existing proof validations retained.
- Two release renders and their 438-page comparison: PASS.
- Release cleanup/publication-term controls: PASS.
- `git diff --check`: PASS. `book/` unchanged against frozen main.

Logs are retained under the ignored release output's `logs/` directory.
The only brief adjustment is the explicitly approved source-vocabulary exception
and real Info/XMP metadata policy. The README image is p13 rather than the
brief's original p10; both are available. No other departures or new layout
problems. Publishing still requires the normal KDP preview/physical-proof step;
this work creates no tag and performs no upload.


## Accepted release cosmetic polish

The accepted 8be209a PDF is archived in
`output/whole-book-release-c37c3ea/accepted-8be209a/`. Its commit was amended to
b42e4f0 solely to correct author/committer attribution to the author's personal
email; the accepted PDF was unchanged by that amend.

Changes are release-only:

1. Title page: no running head or folio. Eliraz Kedmi is now 22pt Plex under a
   rule near the foot of the page. The title and subtitle retain their exact
   original typography and positions. The top rule stays.
2. Copyright and dedication: no running heads or folios; the body content and
   positions are unchanged. Acknowledgments, contents and the symbol key retain
   **both running heads and folios**, consistently. Page numbering still counts
   the first three pages and remains continuous.
3. Former link text and footnote URLs lose their underlines. Footnote callouts,
   note text, destinations printed as URLs and all source content remain.

Both clean renders pass every release validation and the pair comparison:
438 pages, 2,171,535 bytes, PDF 1.4. The source-term map, real Info/XMP values,
embedded fonts, greyscale, copyright, exact last line, notes, tables, keeps,
fences and source checks remain green. Cleanup controls pass. No manuscript or
proof CSS changes; the full suite and proof-mode result above remain the results
of the immediately preceding release build, not a claim of rerunning them for
this CSS-only polish.

`check_release_polish.py` compares the final output against the archived accepted
release. It asserts the exact title/subtitle spans, author placement, blank
furniture regions, identical copyright/dedication bodies, identical pp4–8 rasters,
and identical text and character positions on every page after p8. It derives
allowed removal rectangles from the accepted PDF's actual underline vectors and
raw link rectangles. Pixels outside those paths must match at 1.5× raster scale
(with one pixel of antialias allowance). The removed vectors must be absent.

PASS: all body raster differences are confined to removed underlines on
**pp13, 67, 131, 248, 398, 405 and 437**. Every other page after p8 is pixel-identical.
The first development comparison caught a 0.75pt title shift; its corrected
render passes without weakening the comparison. Evidence:
`a/cosmetic-comparison.json` and the independent pair's `comparison.json`.

Visual review: p1 author hierarchy and spacing; p2 quiet copyright; p3 dedication
without furniture; p13 README and note without underlines, callout retained.
Requested images: `a/pages/page-001.png`, `page-002.png`, `page-003.png` and
`page-013.png`. All are included in the complete page-image output. No remaining
cosmetic departures. No push or upload.
