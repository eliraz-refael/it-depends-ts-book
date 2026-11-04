# Web edition — proposed plan

Plan only. After approval, create `codex/web-edition` from origin/main `8bdd8f1`
in `/Users/elirazk/private/ts-book-worktrees/web-edition`. Build under `design/web/`;
ignore `output/`. No manuscript edits, deployment workflow, settings changes or push.

## Tooling and print reuse

Use a small Python static generator, plain HTML/CSS and progressive-enhancement
JavaScript. Reuse the pinned print Python dependencies, with no new framework or
package dependency: markdown-it-py/CommonMark + tables, Pygments and the existing
lexer choices. Import the print parser, ACTS/order data, quote conversion and
source-located quote decisions read-only. Share fence inventories/hashes, link
inventory and symbol-key data. Do not import print pagination or rewrite print
modules. Web fences retain the exact source content including trailing newlines;
print-only continuation captions and zero-width line fillers are not web content.

Copy the bundled fonts and their OFL licences into site assets. Use their actual
available weights (regular/medium/semibold), not the mockups' unavailable 700
Oxanium. Reuse the local Chrome/CDP approach for screenshots and browser checks,
with Python's local HTTP server for a subpath-aware preview command. No external
resource requests, cookies, analytics or CDN dependencies.

## URLs and pages

One explicit route manifest maps source files to stable slugs; later title edits
must not silently change URLs. All routes/assets resolve beneath configurable
`base_url`, default `https://eliraz-refael.github.io/it-depends-ts-book/`.

- `/`: Home, following Main: cover-code hero, approved cover copy, chapter shape,
  complete contents by act, cast grid derived from biographies, required footer.
- `/how-to-read/`, `/meet-the-cast/`.
- `/chapters/01-the-any-problem/` through the 27th chapter, with two-digit chapter
  numbers and title slugs fixed in the route manifest.
- `/bonus/01-which-file-says-that/`, `/bonus/02-whose-refund-is-it/`,
  `/bonus/03-what-did-the-fix-fix/`.
- `/reading-the-code-symbols/`: generated from the existing 26-row key; link from
  How to Read as clearly separate web navigation. Printed glyphs use ligatures;
  the Characters to type column disables them.
- `/about/`: dedication and acknowledgments, with separate anchored sections.
- `/404.html`, plus sitemap.xml and robots.txt (404 excluded from sitemap).

That is **36 HTML pages**: 33 source-backed pages from 34 files, plus Home, symbol
key and 404. Dedication and acknowledgments keep separate contents entries
pointing to About anchors. Main reading order follows the print manifest,
collapsing those two files into About. The symbol key is supplementary, with
links back to How to Read and forward to Meet the Cast. Reading endpoints offer
Home/Contents instead of a fabricated adjacent chapter. No extra act pages.

All pages get distinct titles/descriptions and base-aware canonicals; Open Graph
uses the selected front PNG. The header Contents control works without JS as a
native disclosure; JS enhances it into a keyboard-accessible drawer with Escape
and focus restoration. Progress is decorative and JS-only. Previous/next links
and the B-style next-chapter card are ordinary links. Bonus 3 retains its exact
last narrative line; site navigation/footer remain outside the article.

## Visual and content rules

Follow B's composition and the Home artboard, with the tan inline-code chip,
19px/1.75 body, at-most-660px reading column, outlined decorative numbers and
locally scrolling code/tables. At 360px use 16px gutters and wrapping navigation.
Build correct heading hierarchy, skip links and visible keyboard focus. Keep
source text/quotes/code exact; use source act names (including ampersands), cast
names/roles and actual endings rather than mockup hard-coding. Describe the
five-part shape without claiming every chapter ends in a Verdict or has the
same ordering: allow “Verdict / Debate Continues.”

Tan stays decoration only. Use cream text for the next-card label and cast
initials where the mockups use tan. Validate all text/token combinations at
4.5:1 or better, including hover, chips and the dark hero. Preliminary specified
ratios: navy/cream 12.36; muted/cream 6.11; label-brown/cream 6.67;
keyword/code 4.93; string/code 5.84; comment/code 4.64; navy/chip 10.31.
Recompute and report from the final CSS rather than relying on these estimates.

The six external prose links remain inline anchors on their original labels;
the seventh, README, maps to the release's real repository URL plus
`#checking-the-examples`. No print footnote numbering in the web prose. Inventory
and validate all seven mappings. Generated/footer links are tracked separately.

## Inputs and checks

One input seam: merged main has no `design/cover/copy.json` or selected PNG.
Propose bringing the selected cover's canonical copy JSON and front PNG in as
explicit, provenance-recorded inputs with the web PR, without its experimental
cover generators. The latest selected-back paragraph exists in the cover worktree
but was marked proposed; confirm that paragraph or use the original copy.json
paragraph shown in Main. Do not silently substitute one. `paperback_url` stays
empty; omit every buy control and its surrounding invitation. Use an isolated
non-published config with a real-format Amazon URL for the requested screenshot.

A `design/web/check` command verifies source/page completeness, print-order
contents/drawer/navigation, exact fences and prose/quotes, all base-path links,
assets/fragments and seven prose URLs, contrast, empty-buy state, zero external
browser requests, no-JS access and two byte-identical clean builds. Publication
terms use the release's source-based rule: four legitimate placeholder uses on
their reading pages, no invented occurrences; TBD/example.invalid/PROOF absent.
Home excerpts cannot duplicate those four terms accidentally.

Run clean npm ci and the full existing book suite. Keep print sources unchanged
and hash the accepted release artifact against
`b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3`.
Do not regenerate it merely for a byte-hash check: independent print renders have
volatile PDF IDs. Record that distinction explicitly.

Deliver 1280px and 390px screenshots for Home, Ch1, Cast, code-heavy Ch27, Bonus
3's ending and the open drawer; also assert layout at 360px and screenshot the
buy-enabled test state. Document build/check/preview and later deployment steps.
Commit locally and report via aoe after approval and implementation.

## Settlement

Approved by Claude on 2026-11-04. Use the selected cover's back paragraph that
begins “A team of developers. Thirty arguments.” Mark the imported copy approved,
with provenance “selected-navy back cover,” approved by the author on 2026-11-04.
Import only copy JSON and the front PNG; generators remain for a later PR.
Everything else stands, including Oxanium 600 and Ch27 for the code-heavy images.
