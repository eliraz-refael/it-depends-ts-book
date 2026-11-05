# Free web edition

Plain static HTML/CSS built from the frozen `book/` tree. B, “Paperback on
screen,” is the visual reference; the home page follows Main. The selected navy
cover supplies the hero's visual language and the approved copy. The Pages workflow publishes only the checked public site; repository settings
remain a manual author step.

## Build and preview

From the repository root, use the pinned Python and Node versions in
`design/print/trial-toolchain.json`. Install the same Python packages as print:

```sh
python3 -m venv design/web/.venv
design/web/.venv/bin/python -m pip install -r design/web/requirements.txt
npm ci

design/web/.venv/bin/python design/web/build.py
design/web/.venv/bin/python design/web/preview.py
```

Open `http://127.0.0.1:8000/it-depends-ts-book/`. The preview mounts the generated
site under the configured base path, including the custom 404 page. Use
`--port 8001` if 8000 is occupied. Do not open HTML files directly: the site uses
base-path-aware URLs, as it will on GitHub Pages.

The generator requires an absent output directory. For a fresh build after an
edit, archive/remove only `design/web/output/site/`, or pass
`--output design/web/output/another-build`. All outputs and the local environment
are ignored. The public site is **only** `output/site/`; manifests, screenshots,
reports and the buy-button test edition are siblings, not public assets.

`config.json` controls the canonical base URL, repository URL, frozen source
commit and `paperback_url`. Leave `paperback_url` empty until the real Amazon
listing is ready: every buy control is omitted, including its surrounding
invitation. Do not edit the manuscript to change web settings.

## Checks

```sh
npm run check

# Supply the accepted PDF to include its exact-byte preservation check.
WEB_PRINT_PDF=/absolute/path/to/It-Depends-KDP-interior.pdf \
  design/web/.venv/bin/python design/web/check
```

The web check creates fresh `site/`, `repeat/` and `buy-test/` outputs. It validates
two byte-identical public builds and inventories, then uses the print project's
pinned local Chrome with built-in Node CDP APIs. No browser package or download is
needed. Chrome's current path is the existing macOS print-toolchain path; a
matching pinned browser is required. Ports 8765 and 8766 must be free for the
short-lived test servers (or set `WEB_PORT` and `WEB_BUY_PORT` to two free ports
for both the servers and browser checks). The preview command is separate and stays running
until stopped.

Prose stays at 660px. On viewports at least 760px wide, fences and tables
expand symmetrically to at most 880px, with viewport gutters. Phone styles stay
unchanged. The header offers Start reading on Home only; other pages retain
the wordmark and Contents (plus the optional configured buy control).

Checks cover:

- All 34 source files represented on 33 source-backed pages; Home, symbol key and
  404 bring the total to 36. The About page combines dedication and acknowledgments
  with separate anchors and contents entries.
- Same reading order as print, matching Home contents and every drawer; explicit
  previous/next routes, including endpoints and the supplementary symbol key.
- Exact prose inventories and converted text, 2,527 balanced quote conversions
  with every source-located decision, 1,507 untouched inline-code occurrences,
  and all 490 source fences including trailing newlines. The print assembler's
  independent fence/prose inventory is compared in an isolated web output folder.
- The cover hero type compiles with TypeScript 7.0.2 and inference controls.
- All internal pages, anchors, CSS/font assets, sitemap and Open Graph image;
  each page has a title, description and canonical URL.
- All seven former print footnotes remain ordinary inline links. The README link
  becomes `https://github.com/eliraz-refael/it-depends-ts-book#checking-the-examples`;
  the six external URLs remain unchanged. See `output/check.json` for the mapping.
- Four source-owned occurrences of “placeholder,” no generated occurrences,
  and no TBD, example.invalid or PROOF in visible text.
- No buy links in the default build; an isolated test edition uses an Amazon
  search URL to show the controls without inventing a book listing.
- Header reading link on Home only; at 1280px, prose is 660px and examples
  are 880px, centered on it. Per-fence client/scroll widths are recorded.
- Every page at 1280, 390 and 360 pixels: no horizontal page overflow, phone
  gutters, source fence text in the real DOM, no cookies/storage or third-party
  requests. Six representative pages also exercise native contents with scripts
  disabled, including pointer and keyboard activation. Escape restores focus in
  the enhanced drawer. The reading-progress bar reaches the last narrative line.
- The final Bonus 3 narrative line is exact; navigation/footer are outside its
  article. One H1 per page, ordered source headings, skip link and focus styles.
- Print/manuscript sources unchanged against `8bdd8f1`. With `WEB_PRINT_PDF`, the
  PDF must retain SHA-256
  `b34445da5a069e6a455df97328ab1a8fc9537ab2b15107c31d58a1ad2371e7b3`.
  Without that artifact, the report explicitly says the PDF check was not supplied;
  source preservation is still checked. Print is not rerendered for a byte hash.

Results: `output/check.json`, `browser-check.json`, `determinism.json` and
`site.manifest.json`. Requested images live in `output/screenshots/`, named
`home`, `chapter-01`, `cast`, `chapter-27`, `bonus-03-ending` and `contents`, each
with `-1280.png` and `-390.png`. Home images capture the full page; the other
images capture the relevant reading viewport. `home-buy-test-1280.png` shows the
isolated buy-enabled state.

## Reuse, routes and provenance

Read-only imports reuse the print Markdown parser, lexer mapping, ACTS, source
and link inventories, `prose_quotes.py`, quote decisions and symbol-key rendering.
Fonts and their three OFL licence files are copied locally. Oxanium uses 600,
not synthesized 700. The web does not load the print stylesheet, Paged.js or its
pagination handlers. Its blockquotes and assistant transcripts remain semantic
HTML with dedicated styles.

`routes.json` fixes stable source-to-URL mappings. Numbered chapters live under
`chapters/`, bonuses under `bonus/`; prose pages have short root routes. Changing
a title does not automatically change its URL. The symbol key is supplementary,
linked from How to Read, with separate glyph and unligated typing columns.

Only `design/cover/copy.json` and `design/cover/front.png` were imported. The JSON
records selected-navy back-cover provenance and author approval on 2026-11-04.
The team paragraph begins “A team of developers. Thirty arguments.” The cover
experiment generators are not included. Cast names/roles and act titles come
from the book, not the mockups' static arrays. Tan is decoration only; cream is
used for text on navy. The five-part explanation allows open endings.

## GitHub Pages deployment

One manual setup step for the author: **Settings → Pages → Build and deployment
→ Source: GitHub Actions**. Once this workflow is merged, a matching push to
`main` deploys the checked site. You can also choose **Actions → Deploy web edition
to Pages → Run workflow** on `main`; dispatches on other branches do not deploy.
The site URL is https://eliraz-refael.github.io/it-depends-ts-book/.

`.github/workflows/pages.yml` builds on Ubuntu 24.04, reads Python and Node pins
from `design/print/trial-toolchain.json`, installs `design/web/requirements.txt`
(which includes the pinned print requirements) and runs `npm ci`. All actions
are pinned to full commit SHAs, with version comments. Full checkout history is
needed for the frozen-source comparison. Only `design/web/output/site` is
uploaded: reports, screenshots, manifests and the buy-test edition stay out.
A single Pages concurrency group serializes deployments.

CI runs `python design/web/check --static-only`: all static checks and two
byte-identical builds must pass before the official configure/upload/deploy
Pages actions run. The existing browser check requires the exact pinned macOS
Chrome binary; the changing Ubuntu runner browser has not been validated as a
replacement. CI explicitly logs these skipped checks and writes a SKIPPED
`output/browser-check.json`:

- 108 responsive page checks, gutters, overflow, desktop widths/centering and
  header-link placement in the browser.
- Real-DOM fence text, typing-column ligatures, browser storage, network requests
  and JavaScript errors.
- No-JS contents, pointer/keyboard activation, Escape/focus, reading progress,
  buy-enabled browser controls and screenshots.

The accepted print PDF hash check also remains local: its artifact is not in
Git. Source/print preservation, exact source text and fences, links and assets,
contrast, heading order, source navigation order, compiler controls and empty
buy-control checks still run in CI. The default local command retains every
browser check; `--static-only` is an explicit opt-out, never an automatic fallback.

`paperback_url` remains empty, so the deployed site has no buy controls. When the
Amazon listing exists, put its actual HTTPS URL in `design/web/config.json`'s
`paperback_url`, rerun the local full web check and review the buy state, then
merge that change to `main`. The workflow deploys it automatically. No manuscript
edit is needed. Canonicals, sitemap and assets support the project subpath;
crawler rules ultimately depend on the origin-root robots file. No analytics,
CDNs, external fonts, cookies or framework are included.
