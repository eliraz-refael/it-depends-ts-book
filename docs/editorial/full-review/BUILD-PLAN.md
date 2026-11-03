# Print build plan

Base: **dad555e**, branch **codex/print-build**. Plan only; the manuscript stays untouched while the whole-book recheck runs. Implementation follows its settled findings, as required by [FIX-PLAN item 6](FIX-PLAN.md). Build the eventual approved release commit, not this review snapshot.

## Keep the approved design; replace the sample assumptions

Use [design/print](../../../design/print/README.md): **7 × 10 inches**, monochrome, bundled Oxanium / IBM Plex Sans / JetBrains Mono, selectable code. Keep the saved 6 × 9 and 7 × 10 samples unchanged as design references.

The existing Python/Markdown-it/Pygments/Chrome/PyMuPDF pipeline is a Chapter 10 study: one hard-coded source, title, running head, TypeScript lexer, 20-fence assertion and end-of-chapter source list. It needs whole-book assembly and actual page-bottom footnotes. Its CommonMark parser also needs table support for the cast and comparison tables. Retain the useful font, trim-size and raster inspections; replace chapter-specific assertions with source-derived ones.

## Links become footnotes at render time

At dad555e there are **nine external links** (Ch3, 7, 13, 15, 26, 27 and Bonuses 1–3), plus the prologue's relative README link. Generate an inventory from parsed inline tokens, with source file/line, label and full target; don't rewrite Markdown with regular expressions.

- Keep each label, emphasis and inline code in the sentence. Add a superscript callout immediately after the label; place a matching note at the bottom of that page: **label — full URL**. Preserve fragments, query strings and pinned commits. Keep PDF hyperlinks clickable.
- Number by occurrence within each chapter, with a separate prologue sequence. Repeat a complete note for a repeated link rather than making a reader hunt for an earlier page. Give destinations globally unique IDs. These are build conventions, not new manuscript text.
- Wrap long URLs at visual break opportunities without inserting characters into their targets or copied text. Test the long Ch27 commit-and-line-range URL explicitly. No URL shortener or runtime network dependency.
- Resolve the prologue README link through explicit release metadata: the author's chosen public repository URL and release tag/commit. Never print `../../README.md` or infer a public address from the private SSH remote. Missing metadata fails the release build. Future internal book links become checked PDF destinations/page references, not filesystem-URL footnotes.
- Remove the study's appended “Sources in this chapter” lists. The Bonus 3 flag note must stay with its callout, before the final Verdict; no generated source appendix follows the meeting line. Flag links inside dialogue for editorial review, not automatic relocation.

## Prove pagination before building the whole book

First extend the HTML path with a **locally pinned Paged.js trial**, preserving the design. Its [official footnote example](https://pagedjs.org/plugins/endnotes-to-footnotes/) describes `float: footnote` and a page-bottom footnote area; that is a candidate mechanism, not proof that our layout works. Test short and long URLs, two notes on one page, a callout near a page break, and notes beside long code/table blocks. Require space reservation, matching markers and bodies, and no overlap or lost text. If the trial fails, resolve the renderer choice before full-book layout; don't quietly substitute endnotes or margin-box text.

Wait explicitly for bundled fonts and pagination completion before PDF capture. Replace the study's fixed three-second rendering budget with readiness checks and bounded failure. Lock the validated browser, renderer and Python environment; record their versions and font hashes. Rendering uses local assets with no network fetches.

## Whole-book pipeline

1. **Inputs:** establish a build manifest from the 33-file [reading order](reading-order.txt), validate every book file appears exactly once, and add approved front-matter metadata separately. Derive titles from source. Preserve Chapters 1–27 and Bonus 1–3; don't renumber the bonuses.
2. **Render:** retain Markdown tables, lists, blockquotes and all five fence languages (TypeScript, JavaScript, JSON, diff, text). Distinguish assistant transcripts/requests from Verdict quotations visually without changing their content. Generate contents, bookmarks, chapter/act openers and running heads; agree front-matter numbering and recto starts before final pagination.
3. **Flow:** keep headings with their opening passage and short dialogue/code together. Let over-page code and tables break sensibly, with continuation styling; don't apply the sample's unconditional keep-together rule to every fence. Inspect wraps, diff signs, inline code and Unicode glyphs. No font shrinking to hide overflow.
4. **Validate:** clean `npm ci` and full `npm run check` on the release source; then build-specific checks for source/fence hashes, rendered text completeness, link/note correspondence, destinations, trim, embedded fonts and overflow. Allow only intentional blank pages. Verify the exact final narrative line and absence of appended material. Compare two clean renders after excluding volatile PDF metadata; record content/layout differences rather than promising byte identity.
5. **Artifacts:** ignored output directory containing PDF, HTML, source/URL manifest, toolchain report, page images and contact sheets. Review every spread, then order a physical proof. A passing compiler suite is not print approval.

Before submission, the author must supply copyright/license/imprint and public source metadata, and choose the printer, paper and binding. Confirm gutter and printer requirements against final pagination; then design the cover/spine. The README license is still TBD. Cover production, EPUB and publication/upload are separate work, not part of this plan-only change.
