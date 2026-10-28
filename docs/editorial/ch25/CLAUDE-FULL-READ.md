<!-- Verbatim report of an isolated full reader of Ch25 draft 1 (8f17134), commissioned by Claude on 2026-10-27. It saw only the chapter. -->

# Full reader report (Ch25 draft 1)

Fixtures are under /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch25r1/rebuild/ (s0 = working tree, s1-format-edit-original, s2-refs, s2b-edges-removed-same-copy, s3-clean, s4-turn, s4b, s5-runsrc, s6-release, deploy-src, deploy-rel). I used tsc 7.0.2 and Node v22.23.4. The workspace links are relative symlinks: `node_modules/@shop/{money,cart}` point to `../../packages/*`.

## A. Verification

### Configuration I had to choose
- **Package tsconfigs (money and cart):** `target ES2022`, `module Node16`, `types: []`, `strict`, `composite: true`, `rootDir: src`, `outDir: dist`, `include: ["src"]`. This matches line 211.
- **apps/api/package.json:** `{"type":"module"}`. Line 17 says the API is one of the three ES-module packages.
- **Root package.json:** `{"private":true,"type":"module","workspaces":[...]}`. Without this the first fence fails (mismatch 1).
- **Linoy's run-source branch:** `"default": "./src/index.ts"` in both manifests. I left the `@shop/source` and `types` branches in place.
- **Turn config:** a copy of `apps/api/tsconfig.json` plus `customConditions: ["@shop/source"]`, kept in apps/api.
- **Deployment:** the API's `out/` contents, plus the API's package.json at the deploy root, plus `node_modules/@shop/<pkg>`. For the failing run (line 339) I copied the whole package directories. For the release run (line 349) I copied only package.json and dist.

### Mismatches and state gaps (most important first)

1. **The opening program doesn't run unless the repository root (or `generated/`) is also `"type": "module"`. The chapter never says so.**
   - The API's `rootDir: "../.."` compiles `generated/release.ts`. That file has no ESM package.json above it, so tsc emits it as CommonJS (`exports.buildId = ...`).
   - The emitted copy lands at `apps/api/out/generated/release.js`, under the API's `"type":"module"` manifest. Node therefore loads it as ESM.
   - Result: `SyntaxError: The requested module '../../../generated/release.js' does not provide an export named 'buildId'`. Every later run depends on that file, so they all fail too.
   - tsc gives no warning. Line 17 or 85 needs one clause, something like "the workspace root is an ES module too".

2. **Line 230 is only true in a fresh copy.** Gil says "I removed the edges and kept the imports. It checked the API against the old files again."
   - If he removes the edges in the same copy where `-b` with references just ran, money's dist has already been rebuilt. `tsc -b apps/api` then still reports TS2554 (s2b).
   - The "no error" result needs a new copy of the original tree with its stale dist. The text doesn't say he took one.

3. **Line 327, "He runs the dependency build in that working tree", is ambiguous.** It only works if the original tree already has Dima's references.
   - Gil tested the references "in a copy" (line 211), and nothing says they were moved into the original tree before the Turn.
   - With the original cart config (no reference), `tsc -b packages/cart` rebuilds cart only. Money stays stale, and the program still prints `release-42 $15.00`.
   - With the references in place, it builds money and then cart, and prints `release-42 USD 15.00` as claimed.

4. **Line 351, "No package source directories in that deployment", depends on cleaning `apps/api/out`, which the chapter never does.**
   - The original tree's `out/` still holds `packages/money/src/index.js` and `parse.js` from Idan's relative-import build (line 141). It also holds `apps/api/src/line-check.js`, even though Gil "removes its scratch file". tsc never deletes stale outputs.
   - If the release copies the API output as a whole, those files ship. Nothing loads them, so `USD 15.00` still prints. But a `packages/money/src` directory is in the deployment.
   - `tsc -b` also writes `out/apps/api/tsconfig.tsbuildinfo` into the output.

5. **Reproduction hazard on the "copy" experiments.** On my first try at line 224 I copied the tree with `cp -R`, which doesn't preserve modification times.
   - `tsc -b` then reported money "up to date because newest input ... is older than output tsconfig.tsbuildinfo". It skipped the rebuild, and the API passed with no TS2554.
   - Copying with `cp -Rp`, or removing the tsbuildinfo, reproduces the claim.
   - This isn't a text error, but "in a copy" is a step that can go wrong, and it is exactly the staleness the chapter is about. Consider saying "a clean copy" here, as line 282 does.

6. **Linoy's run-source branch (line 333) breaks both type checks.** With `.ts` relative imports, `tsc -b apps/api` and the dev check both fail with TS5097 (`allowImportingTsExtensions`). The chapter makes no claim about checking on that branch, so this is not a mismatch. A careful reader may wonder, though, and one clause would answer it.

### Claims verified as stated
- Line 63: `release-42 $15.00`. Verified once mismatch 1 is fixed.
- Line 81: `@shop/money/src/parse.js` gives TS2307 at `main.ts(2,28)`.
- Lines 113-115: TS2741 at `shipping()`, with the message as abridged: "Property '#cents' is missing in type 'import(".../money/dist/index").Money' but required in type 'import(".../money/src/index").Money'". Cart's d.ts imports Money from `@shop/money` (line 122).
- Line 141: with the assertion, the API compiles. The run throws exactly `TypeError: Cannot read private member #cents from an object whose class did not declare it`.
- Line 145: the stack points at `Money.plus` in `apps/api/out/packages/money/src/index.js`. The output contains money's `src/index.js` and `src/parse.js`.
- Line 163: the line-check assignment is accepted.
- Line 178: before the rebuild, the API gets TS2305 (no exported `parseMoney`). After rebuilding money and cart it prints `release-42 $15.00`.
- Line 205: after the `format(currency)` edit, `tsc -p apps/api` passes against the stale dist.
- Line 224: `tsc -b apps/api` without the edges passes. With them it builds money, then cart, then the API, and reports `TS2554: Expected 1 arguments, but got 0.` at `main.ts(7,46)`.
- Lines 282-284: the dev check in a clean copy (no dist, no tsbuildinfo, no out) reports TS2554. `--listFiles` shows `packages/money/src/parse.ts`, `packages/money/src/index.ts`, `packages/cart/src/index.ts`, `generated/release.ts` and `main.ts`. TS 7's default-rootDir change doesn't trouble the `noEmit` config.
- Line 301: after `format("USD")`, the dev check passes in the clean copy and in the original tree.
- Line 311 (the Turn): the source-condition emitting config compiles and emits only `main.js` and `release.js`. Package sources come in through `node_modules`, so they aren't emitted. The run prints `release-42 $15.00`, and Node resolves `default` to the stale `dist/index.js` (line 317).
- Line 327: prints `release-42 USD 15.00`, given the caveat in mismatch 3.
- Line 333: without the `.ts` extensions, Node fails with ERR_MODULE_NOT_FOUND for `src/parse.js`, which confirms that sentence. With them, the already-emitted entry prints `release-42 USD 15.00`.
- Line 339: the copied deployment fails with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` on `node_modules/@shop/money/src/index.ts`, so money is the first dependency to fail, as claimed. It fails the same way without a deploy-root package.json.
- Line 349: after restoring the exports, `tsc -b apps/api` with references passes. The copied deployment (package.json and dist only) prints `release-42 USD 15.00`.

## B. Reading

**1. Would I keep reading?** Yes.
- Line 11 ("I have parsed the money. Apparently it isn't money.") is a good hook. The TS2741 with two `Money` paths (113-116) is a real puzzle, and I wanted the answer.
- I enjoyed 130-155 most.
- The 192-305 block bored me. It is four config fences, and the dev check's independence from dist is restated six or seven times: 282, 284, 286-288, 290, 301, 323, 357, 367.
- I lost the thread in two places:
  - 124-128. Dima's "I'm not asking you to parse it twice" answers something nobody said, and Idan's defence of the parser seems to answer a charge nobody made.
  - 311 and 327-339. I couldn't keep track of which tree I was in: original, Gil's copy, clean copy, separate branch, deploy folder.
- Overall it is more "learn" than "fun". After the opening, the jokes stop.

**2. The scene I'd retell.** The forced cast (130-155). Linoy says "if it's only the spelling, forcing it gives fifteen". The program blows up on a private field, and the stack trace lands in a money package that sits inside the API's own output folder. "Why is there a money package in the API's output?" is the best line in the chapter. Second choice: the type-stripping run that works through a workspace link and dies once the package is copied under node_modules (337-343). It's a crisp, real gotcha.

**3. The Principle.**
- The three questions in line 5 are good, and testable. They map onto the chapter's three sections.
- Line 7 is a bundle of five instructions, not one rule, and "Sharing a name doesn't arrange any of that" is vague.
- The story earns each piece.
- But line 7's final sentence gives away the Turn: "Development can check source while a release uses built declarations, but the release still needs to build its dependencies and run the code it will ship." Once I'd read it, I knew a source check would pass while stale JavaScript ran.
- Nothing contradicts the Principle.

**4. Characters.**
- **Idan** is distinct and competent. She owns the change and defends the parser, and she gets the best line in 151 and 319.
- **Dima** is the build owner. He's decisive and accountable ("I'll own the graph", 232), with good lines in 226 and 232, but he lectures in 166.
- **Linoy** has the best ideas (the source condition, the strip-types experiment). She is wrong twice, at 130 and 329, but in reasonable ways. Not a strawman.
- **Gil** is mostly a test harness: he runs things in copies and reports results (224, 230, 284, 288, 317). He has no opinion of his own.
- **Gilad** exists only to ask the next question: 143, 186, 315, 353. That's the weakest casting.
- No strawman, though Linoy's "if it's only the spelling" (130) asks a lot of a dev who knows `#private`.

**5. The Turn.**
- The first half didn't surprise me. A check passes while Node runs stale dist, which is a mirror of 205, a lesson the chapter has already taught. The Principle telegraphs it too.
- The setup is contrived. Nobody would run "a copy of the API's original emitting config with the source condition" (311) except to stage this. Idan's "why is the quote still showing a dollar sign?" (309) has no visible run behind it, so the narration has to invent one.
- The second half, the node_modules type-stripping refusal (329-343), was a genuine surprise, and it is fair. But the "release job copies the dependencies" premise is introduced just in time, at 337.

**6. The Verdict.** It decides:
- export the parser;
- keep the dev check separate;
- the release check builds the reference graph and runs the copied program;
- Dima owns the edges.

But 353-361 already settles all of it, so the Verdict's opening line (365) reads as minutes: a five-item list in one speech. Linoy's 367 adds a real rule, and "Then I can send the quote" is a good last line.

**7. Narration doing a manual's job, and config that's too dense.**
- **Manual narration:**
  - 17 explains ESM, workspace links and the release tag.
  - 85 is a defensive footnote ("Idan hasn't widened it for this change").
  - 132 explains `NonNullable`.
  - 196 ("without converting them") is a defensive aside.
  - 211, 238, 311, 333 and 349 are state bookkeeping.
- **The release-tag device (17, 85)** exists only to give the API `rootDir: ../..`. Readers will feel the scaffolding.
- **Config density:** 192-305 is too dense. References, the exports condition, the dev base and the dev config arrive in about 100 lines, alongside three different trees.

**8. Line-level notes.**
- 66: "It hadn't needed a caller outside its package before" is stiff.
- 83: Dima's "What did the API include?" is answered by narration, not by a person.
- 122: "The API is checking both declarations" is flat.
- 126: "I'm not asking you to parse it twice" is confusing. Dima uses the same "I'm not asking you to..." construction again at 347.
- 166: "Don't count that line as another bug" reads as an author's note.
- 168: Gil "closes the line-item experiment and removes its scratch file" is stagey (and the compiled file survives; see mismatch 4).
- 180: "That is the object I wanted to pass on" is written prose.
- 209: "That was my question before we added a parameter" is unclear and a bit smug.
- 286-288: "You removed the build metadata as well?" / "Both." reads as a fact-check, not dialogue.
- 303-305 is filler.
- 357-359 ("You just did. I want that test kept too.") repeats 301.
- Lines that work: 151, 188, 232 ("a build order I never described") and 319 ("I asked the new signature a question and ran the old answer").
