<!-- Verbatim report of an isolated targeted recheck of Ch25 draft 2 (3eaea32), commissioned by Claude on 2026-10-28. It saw only the chapter and a list of draft 1's problems. -->

# Targeted recheck report (Ch25 draft 2)

I read only the chapter file. Fixtures are under `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r2/rebuild/`. The evolving tree is `repo/`, there is one `cp -Rp` snapshot per state (`state1-opening` … `state10-restored`), and the other fixtures are `fresh-clone/`, `image-turn/`, `image-release/` and `aside-keep-buildinfo/`. I used tsc 7.0.2 and Node v22.23.4.

**Choices I made where the page is silent:**
- Package tsconfigs: `composite: true`, `rootDir: "src"`, `outDir: "dist"`, `include: ["src"]`, with target, module, types and strict copied from the API config. Line 211 confirms this after the fact.
- `apps/api/package.json` is `{"type":"module"}`, following line 17's "all three packages" and line 304's "its package manifest".
- `order-line.ts` and `packing.ts` exist from the opening, as line 153 says ("here before your change").
- "Rebuilding money, cart and the API" (line 180) means `tsc -p` on each, in that order.
- `allowImportingTsExtensions` goes in `tsconfig.dev-base.json` and is removed again at line 324.
- Each image layout is a fresh directory.

## Part 1: The eight earlier problems

1. **Repository root as an ES module: fixed.** Line 17 now says it outright. `generated/release.ts` takes its format from the root manifest, and the opening program prints `release-42 $15.00` as line 65 says.

2. **Claims that held only in an unstated copy of the repo: fixed.**
   - The "removing reference edges still passes" claim is gone.
   - Line 222 now says "in the same tree".
   - The stale `out/` money copy is now named and cleaned up (lines 326–330) instead of being denied.
   - One new soft spot, covered under verification: line 332's "ships one" depends on the image directory being fresh.

3. **Density and repetition in the second half: partly fixed.**
   - Fences: there are now three config fences (213, 249, 265) plus an inline JSON config (280) in about 90 lines, down from four. Lines 280 and 284 are still dense paragraphs of manual prose.
   - Repetition: the literal "works without dist" is gone. The idea that the source check survives now comes back at 243, 280, 282, 320, 322, 324, 338 and 340, so about five times after the Turn. Lines 320–324 and 340 say the same thing three ways.

4. **Turn staged with a config nobody would write, and given away by the Principle: config part fixed, give-away partly fixed.**
   - The config: pointing `default` at `src/index.ts` so Node 22 strips the types is a real thing people try, and it is planted fairly at 19 ("The workspace links stay here") and 290 ("linked source directories").
   - The give-away: the Principle still ends with "run what you're shipping. I want the failure on this laptop, not in the image" (line 7). That tells you the image will behave differently before Gilad asks. It doesn't reveal the mechanism (node_modules type stripping), which helps.

5. **Hard to track which tree each experiment ran in: mostly fixed.**
   - Now explicit: "same tree" (222), "fresh clone" (280), "one experimental branch in their working tree" (284), the image layout (304), "leave the experimental branch" (324), and the clean rebuild (330).
   - Still unstated:
     - how the rebuild at 180 is run;
     - whether the image layout at 330 is the Turn's directory or a new one;
     - whether `allowImportingTsExtensions` is reverted at 324.

6. **Gil only a test harness, Gilad only asking the next question: partly fixed.**
   - Gil now has a view:
     - 168: "I wanted to know how much we'd broken… The others weren't evidence that the routes agreed."
     - 312 explains the loading rule.
     - 328 is a real insight, and I verified it.
   - But Gil still runs commands at 203, 207, 280 and 304.
   - Gilad now reads the stack (139), lands the point at 149, and has a real opinion at 314 ("Someone will try this from their checkout and close the ticket"). That is a clear improvement.

7. **Jokes stopped after the opening: partly fixed.**
   - New lines that land:
     - 224 ("I could delete my arguments and nobody would notice") is the best.
     - 308 ("We didn't change the file. We moved it.")
     - 334 ("quite a while agreeing on fifteen dollars")
   - Between 237 and 296 there is nothing light. The last third is still more learn than fun.

8. **Verdict reads as minutes of a settled meeting: partly fixed.**
   - New decisions in the Verdict:
     - adding the copied-program test to the check command (338);
     - "A green dev check won't skip that work";
     - keeping the source check as a separate command.
   - Already said earlier:
     - Dima's half of 338 repeats 235 almost word for word ("put that build behind the existing check command… I'll own the graph").
     - "We'll package JavaScript" was settled at 326.
     - Idan's line 342 is housekeeping.

## Part 2: Verification

Every diagnostic, printed output and runtime error on the page reproduced. In order of importance, the issues are:

1. **Line 332 ("This package-and-copy run ships one"): true only if the image layout is a fresh directory.**
   - The Turn's copy at 304 copied `apps/api/out` while it still held the stale `out/packages/money/src/index.js` and `parse.js`. So the Turn's image also shipped a second Money, which the page never mentions.
   - If the release job at 330 copies "into the image layout" on top of that directory, the stale copy is still there.
   - Suggest saying "into a fresh image layout" at 330.

2. **Lines 143, 145, 326 and 332: the second emitted Money existed before Idan's change.**
   - In the opening state, the type-only imports in `order-line.ts` and `packing.ts` already put `packages/money/src/index.ts` into the API program, and it was emitted to `apps/api/out/packages/money/src/index.js`. The first build already does this.
   - So Dima's "You imported its source. The API compiled that source too" (143) and "Two Money implementations were emitted when we followed the relative import" (332) are incomplete: `import type` from a relative path also emits a copy.
   - This is a teaching point the chapter could claim. As written, a careful reader rebuilding it finds the copy before line 109.

3. **Line 280 (fresh clone): passes only if `generated/release.ts` is committed and the workspace install has created the links.**
   - A file under `generated/` is often not committed. Without it, the dev check fails with TS2307 on `../../../generated/release.js`.
   - When I added both (my fresh-clone fixture), it passed with zero outputs, as claimed.

4. **Line 312 ("Not on our Node 22.23.4"): the hedge implies another Node version would strip types under node_modules.**
   - I only tested 22.23.4. To my knowledge Node rejects stripping under node_modules by design, not because of a version gap. Worth rewording, or checking against a current Node.

5. **Unstated states (each is harmless once you choose a reading):**
   - How the rebuild at 180 runs. Separate `tsc -p` runs work.
   - Where `allowImportingTsExtensions` lives (284). Without it the source check fails with TS5097 at both money imports.
   - Whether it is removed at 324.

6. **Minor shipping details:**
   - `tsc -b` on the API writes `apps/api/out/apps/api/tsconfig.tsbuildinfo`, so "copies the fresh API output" (330) also ships build metadata.
   - The shipped manifests still carry `"@shop/source": "./src/index.ts"` pointing at a `src` the image doesn't have. That is harmless unless someone runs with `--conditions`.

**Everything else, confirmed (most of these reproduced verbatim):**
- **Line 65:** `release-42 $15.00`.
- **Line 83:** TS2307 for `@shop/money/src/parse.js`.
- **Lines 115–117:** TS2741 at `main.ts(7,34)`, the `shipping()` call. The full message names `…/money/dist/index").Money` and `…/money/src/index").Money` as abridged on the page.
- **Line 124:** cart's `dist/index.d.ts` imports Money from `@shop/money`.
- **Line 137:** the asserted version compiles, and the TypeError text is exact.
- **Line 139:** the stack frame is `Money.plus` in `apps/api/out/packages/money/src/index.js`.
- **Line 159:** the `Line` assignment is accepted.
- **Line 180:** `release-42 $15.00`, with the stale out copy still present (which supports 326).
- **Line 203:** `tsc -p apps/api` passes against the old declaration.
- **Line 207:** `tsc -b apps/api` is green. It builds only the API.
- **Line 222:** with references, `--verbose` shows money, then cart, then the API, and TS2554 "Expected 1 arguments, but got 0." at the `.format()` call.
- **Line 233:** `release-42 USD 15.00`.
- **Line 280:** `--explainFiles` shows money's and cart's source files.
- **Line 288:** with `.js` imports, Node fails with `ERR_MODULE_NOT_FOUND` for `src/parse.js`, so the claim is true.
- **Line 290:** the source runtime prints `release-42 USD 15.00`, with no warnings.
- **Line 306:** `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` for `node_modules/@shop/money/src/index.ts`, as named, and no quote is printed.
- **Line 312:** in the workspace, the link resolves to the real path outside node_modules.
- **Line 328:** Gil's claim holds. I deleted the `dist` and `out` directories but kept the package `.tsbuildinfo` files, then ran `tsc -b`. Money did not re-emit `dist`, and the API failed with TS2307 and TS7016.
- **Line 330:** the clean build plus a fresh image of manifests and `dist` prints `release-42 USD 15.00`.

## Part 3: As a reader

1. **Would I keep reading? Yes.**
   - Line 11 is a strong opener.
   - Lines 106–151 are the best stretch: the error that names two paths, the plausible forced cast (126), and the stack trace pointing into the API's own `out` (139). Then Gilad's line at 149.
   - I lost the thread at 280–290, two manual paragraphs in a row with config embedded in prose.
   - I got bored at 320–332, where three characters agree in turn.

2. **What I'd retell:** the `#cents` scene. "The cast compiled, and the stack trace pointed at a copy of money inside the API's own build output." The Turn is the runner-up ("we didn't change the file, we moved it").

3. **The Principle:**
   - It is testable, but it is a checklist of about six rules across two paragraphs, not one rule.
   - The story earns each of them:
     - the three questions map to the TS2741 scene, the TypeError and the references section;
     - "ask for an export" is earned by line 170.
   - Its own wording gives some scenes away:
     - "including its deliberate public subpaths" pre-answers Linoy's line 184;
     - "run what you're shipping… not in the image" telegraphs the Turn.

4. **The Turn:**
   - I saw it coming at 298, and in a vague way from line 7.
   - The mechanism surprised me and is fair: planted at 19 and 290, explained in 312.
   - It isn't contrived; copying package directories into the image is what line 19 said the release job does.

5. **The characters:** all competent, no strawman.
   - Idan makes the mistakes, but for defensible reasons (126 is a fair experiment).
   - Linoy's source-only idea is modern and reasonable, and she concedes well (320).
   - Dima is pragmatic and owns the build graph.
   - Gil and Dima sound alike (short declaratives that report facts). Every character shares the same clipped register, so voices separate by role more than by speech.

6. **Does the Verdict decide something?** Yes: the copied-program test joins the check command, and the source check stays a separate command. But half of it repeats 235 and 326.

7. **Where narration does a manual's job:**
   - 211 (config described in prose)
   - 247 ("comes before the existing declaration and JavaScript targets")
   - 280 (the whole paragraph)
   - 284 (the whole paragraph)
   - 290
   - 330 (the procedure list)
   - In dialogue: Dima's 166 and Linoy's 288 explain rather than argue.

8. **Line-level:**
   - **19:** Dima's exposition answers nothing Idan said, which is stagey. Better as narration, or as a reply to a question.
   - **85–87:** "What did the API include?" is answered with a `rootDir` explanation. It never says why that matters: the wide `rootDir` is why the relative import didn't trip a rootDir error. Readers without that background will miss it.
   - **126:** "If it's only the spelling" is unclear. It means the import path, and reads as typography.
   - **128:** "She asserts shipping's result to the parser's successful return type" is awkward.
   - **168:** "the routes agreed": "routes" is a new and opaque word for import paths.
   - **188:** a moral-of-the-story line.
   - **294:** Idan's line reads like a joke attempt that doesn't land.
   - **332:** a recap. "The order-line imports" also leaves out packing.
   - **334** lands, but it is the third "fifteen dollars" beat.
   - **338:** "A green dev check won't skip that work" is slightly unclear about whose work.
