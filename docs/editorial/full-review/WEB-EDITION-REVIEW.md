# Web edition — build review

Built on `codex/web-edition` from main `8bdd8f1`, in the new web-edition worktree.
No book or print files changed. No deployment workflow, repository setting change,
push or publication. The approved plan and settlement are beside this report.

## Result

36 static pages: 33 source-backed pages covering 34 book files (dedication and
acknowledgments share About), plus Home, the generated symbol key and 404.
The selected cover's approved copy and front PNG are the only imported cover
files. `copy.json` records the author approval and selected-navy provenance.

The design follows B and Main: cream/navy, outlined chapter numerals, a 660px
reading column at 19px/1.75, tan inline-code chips, and local code scrollers.
Oxanium uses the available 600 face. Source-derived act names retain ampersands;
cast names and roles come from their biographies. Tan is not used for text.
Home's five-part description allows The Debate Continues and does not promise
identical section ordering in every chapter.

Contents is a native disclosure without JavaScript, enhanced with an explicit
close control, Escape and focus restoration. Reading links are regular anchors;
progress is decorative. Every reading page, including About and the symbol key,
has previous/next navigation. Source order and all 34 entries match print.
Navigation follows the final narrative line outside the article.

## Validation

- Clean `npm ci`: PASS, zero reported vulnerabilities. Full `npm run check`: PASS
  across the existing 25 scripts (baseline, Ch1–27 and Bonuses 1–3).
- 36 pages, 34 source files, 3,487 exact source blocks, 490 byte-identical fences,
  1,507 inline-code occurrences, 2,527 balanced quote conversions: PASS.
- Every explicit quote decision applied. Independent print/web fence and prose
  inventories match. The hero conditional type and inference controls compile.
- All seven prose links map back to the print inventory: six unchanged external
  URLs; README maps to the actual repository `#checking-the-examples` anchor.
  No paper-only note numbers are inserted in web prose.
- All internal links, anchors, assets and CSS font URLs resolve under the project
  subpath. Sitemap, canonicals, descriptions and Open Graph image pass.
- Two clean public builds and their separate manifests are byte-identical.
- 108 responsive page checks (36 × 1280/390/360): PASS, no horizontal page scroll.
  Phone gutters are at least 16px. All fences retain exact text in the real DOM.
- No-JS contents works by native pointer/keyboard on six representative pages;
  enhanced Escape restores focus. Progress reaches the end of Bonus 3.
- Zero third-party requests, browser errors, cookies or local/session storage.
- Default build has zero buy controls. A separate test build displays the two
  Home controls using an Amazon search URL, not a fictitious product listing.
- Exactly four source-owned placeholder uses; zero generated uses and zero TBD,
  example.invalid or PROOF in visible content. The last narrative line is exact.
- `book/` and `design/print/` are unchanged. The accepted release artifact retains
  SHA-256 `b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3`.

All specified contrast pairs exceed 4.5:1:

| Text / background | Ratio |
| --- | ---: |
| Navy / cream | 12.36 |
| Muted / cream | 6.11 |
| Label brown / cream | 6.67 |
| Keyword / code | 4.93 |
| String / code | 5.84 |
| Comment / code | 4.64 |
| Navy / code | 11.09 |
| Muted / code | 5.48 |
| Brown / code | 5.99 |
| Navy / inline chip | 10.31 |
| Navy / tan button | 6.42 |
| Cream / navy | 12.36 |

## Visual review and artifacts

Artifacts live under ignored `design/web/output/`. `site/` is the publishable
site; screenshots, checks and manifests remain outside it. Screenshots are in
`screenshots/`: Home, Ch1, Cast, Ch27, Bonus 3's ending and the open contents
at 1280px and 390px, plus `home-buy-test-1280.png`.

Reviewed Home's full desktop hierarchy, Ch1 on phone, cast on desktop, Ch27's
phone code overflow, the mobile drawer, both Bonus 3 endings and the buy-enabled
Home. The phone page stays within the viewport while long code remains readable
through its own scrollbar. Last-line punctuation, code chips, curly quotes and
source dialogue retain their print/source meanings. No layout issues requiring
manuscript changes were found.

The first no-JS test used an incomplete simulated Enter event; the control was
replaced with physical pointer activation and native Space-key toggling, with
page scripts disabled. Both pass. Screenshot capture waits for scroll/progress
updates; the end-of-article progress state is asserted rather than inferred.

## Remaining publication step

Set the actual paperback URL once the listing exists, then approve deployment in
a separate PR. Nothing here deploys. All requested inputs and checks are settled;
there are no manuscript edits, cover-generator imports or new dependencies.

## Review revision: wider examples and header

Fences and tables expand to 880px on desktop, centered on the unchanged 660px
prose column. The expansion is bounded by viewport gutters and starts at 760px;
phone styles are untouched. Home's header now says Start reading; every other
page omits that link.

Measured all 490 source fences before rebuilding and after the change:

| Viewport | Fences requiring horizontal scrolling before | After |
| --- | ---: | ---: |
| 1280px | 228 | 25 |
| 390px | 460 | 460 |
| 360px | 474 | 474 |

Every phone fence's client width and scroll width match the baseline exactly.
The remaining desktop overlong lines retain their local scrollbar, including
Ch27's long catalogue literal; no source lines were wrapped or edited.
Evidence: ignored output/width-before.json, browser-check.json and
width-comparison.json.

Full web check PASS: two byte-identical builds, all 108 responsive page checks,
source/print preservation including the accepted PDF hash, native no-JS contents,
keyboard interaction, and all existing static/browser assertions. New checks
assert desktop example width/centering, prose width and header link placement.
Reviewed the refreshed 1280px chapter-27 and chapter-01 screenshots: expanded
code aligns symmetrically around prose and the header contains Contents only.
Screenshots: design/web/output/screenshots/chapter-27-1280.png and
chapter-01-1280.png. No manuscript or print changes; no departures.
