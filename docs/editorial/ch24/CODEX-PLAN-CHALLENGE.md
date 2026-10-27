# Chapter 24 — Codex's plan challenge

2026-10-27. Plan reviewed: `a8c0b5a`, based on `14a6c88`. **Challenge only; no manuscript drafted.** Read the plan, master plan, writing guide, voice notes, relevant biographies and Ch7 calibration. The author's no-quota instruction governs over the older guide's per-act open-ending requirement.

**Recommendation: keep the incident and end in a local Verdict.** The strongest repair combines compatible exports, checked callers and an unchanged loading test. These are not three mutually exclusive migration strategies. The unresolved rollout cost is real, but the plan has not supplied evidence that makes it a principled stalemate. Do not manufacture one.

All seven mechanisms reproduce on the installed **TypeScript 7.0.2 / Node 22.23.4**, with the book profile. I also tested the competing repairs and coverage limits: **37 compiler cases**, with assertions on diagnostics and the listed runtime outcomes. Scratch scripts/results are in `.probe/codex/`, untracked. No dependency changes or clean-install claim; dependencies were already installed as briefed.

## 1. Ending first: the proposed opposition collapses

The three positions answer different questions:

| Proposal | What it actually controls | What it leaves unanswered |
| --- | --- | --- |
| Convert leaves first | Which implementation to tackle next | Whether an unchanged caller can still load/call it |
| Keep the existing export contract | What existing consumers receive at runtime | Whether their arguments and uses are checked |
| Check all JS, or check selected callers | Where JS diagnostics are reported | Dynamic calls, excluded entry points, and runtime behavior beyond those types |

Leaf-first does not conflict with either checking policy. Nor does checking make compatible exports unnecessary for consumers outside the checked graph. The sensible question is **what evidence must accompany the next conversion**, followed by **how much existing JS checking this PR takes on**.

### The strongest repairs must be allowed

- **Oded:** keep the callable export with `export = slug`, and retain the old `require`-based test. The plan says nothing enforces his convention; the retained test now enforces this callable contract. The old test passes before conversion, fails after `export default`, and passes after `export =`. Do not make him rely on remembering a rule when this small test already exists.
- **Noam:** `checkJs: true` need not mean annotating everything immediately or weakening the whole project. Known legacy files can explicitly opt out with `@ts-nocheck` while the default checks new JS. I reproduced that combination with strictness retained. It has a real cost: the opt-outs remain unchecked, and someone must own their removal. He can also propose a separate checking configuration with a deliberate looser policy; that would be an additional check, not permission to relax the main TS program. No configuration tutorial is needed.
- **Eden:** `@ts-check` on the actual caller plus a useful JSDoc parameter closes this call without converting the route. It leaves unrelated JS untouched. The cost is that future files remain unchecked by default, and the conversion review has to identify callers. This is a competent incremental policy, not a universal detector of callers.

The global/per-file choice can remain conditional advice without requiring an open ending. For the current PR, choose an actual checking scope and state its cost.

### The measured count does not support “stop for weeks”

I built a small census around the same module: `route.js` has one untyped parameter, `lookup.js` one, and `sum.js` two. The count is computed from compiler diagnostics, not invented effort:

| Run against the default-export incident | TS7006 | TS2349 |
| --- | ---: | ---: |
| `checkJs`, strict omitted (TS7 default) | 4 | 1 |
| Only route has `@ts-check` | 1 | 1 |
| Route has `@ts-check` and `@param {string} title` | 0 | 1 |

With the compatible export and four appropriate parameter annotations, **the global check is green**. With that export and just the annotated checked route, **the incremental check is green**. Global checking plus explicit opt-outs on the two unrelated files also works.

These are illustrative fixture counts, not a measurement of the fictional service's whole repository. Four annotations cannot honestly carry a speech about halting migration for weeks. If this is the page's census, give Noam his win: checking the bounded tree is manageable. If the intended ruling is per-PR checking, supply an actual difficult unrelated contract to explain deferring it, or scope the ruling to the current conversion without pretending to settle the entire backlog. Do not enlarge a number until it selects the desired winner. A diagnostic count is not an effort estimate.

**My preferred local ruling:** preserve the old callable export and test, check the known route with an honest parameter type, and run the old entry point as well as the converted test. Keep TS strictness. For the small census above, accept global JS checking after those four annotations rather than force a narrower setting. If the eventual repository evidence differs, per-file checking remains a valid rollout choice. No character needs a closing dissent merely to preserve the title of the book.

## 2. Keep the incident, but make the lesson about the conversion's scope

The converted test is the good part. The function still makes exactly the same slug, but the PR changed how clients obtain it and changed its test to use the new convention. That is a migration mistake, not just an obscure loader fact.

I reproduced this exact sequence with `"type": "commonjs"`, Node16 module emit and ES2022 target:

1. Original `slug.js`, old route and old `require` test: `hello-world`.
2. Converted `slug.ts` with `export default`, converted TS test with default import: compiler succeeds, test succeeds, old route throws **`TypeError: slug is not a function`**.
3. Keep the old test too: it throws the same error.
4. Replace the export with `export = slug`: both import styles and the unchanged route work.

The emitted module sets `exports.default = slug`. The converted test uses `__importDefault(require("./slug"))` and reads its `.default`; the old route tries to call the whole object. Show those two values briefly. Do not teach native ESM loading, bundler interop, Node type stripping or the history of the helper.

Oded's mistake is plausible: he converted source and test together, as ordinary maintenance. Let him notice that keeping the old caller-shaped test would have helped. Do not say that a leaf conversion is inherently wrong, or that a default import test is a bad test. It tests the new import contract accurately; it no longer tests the old one.

**One necessary correction to the planned reveal:** “Nobody showed [the compiler] the caller” is false in this reproduction. With `allowJs`, the route is in the program and is emitted. Its body is not checked. The distinction between **included**, **checked**, and **actually constrained at this call** is the chapter's transferable lesson.

An additional short observation earns the strategy subject: a TS caller can invoke the unconverted route with `42`, assign its result to `string`, and compile. JS inference gives the route's parameter `any`; the emitted function then fails at `title.trim`. Annotating the checked JS route makes the TS call fail with TS2345. The useful work was giving the boundary a truthful type, not changing that route's filename. This is still the same call chain, not another story about `any`.

### Turn recommendation

Use Chen's existing backfill entry point, with its purpose established before the team claims coverage. Prefer an ordinary script they own to a previously unmentioned external repository. A module's imports do not enumerate its importers: compiling the converted slug and test does not discover a script that loads the slug.

The backfill can be included and checked; I verified that adding it reports TS2349. Or its old loading call can be executed against the emitted artifact while the export stays compatible. Let Eden repair that omission. Do not insist that “no compiler setting checks it”: a configuration change checks this local script perfectly well.

An external consumer that truly cannot be included strengthens the compatible-contract rule, but one line is enough. It is not evidence that checks are useless. If the incident plus caller-type observation already changes the inquiry sufficiently, the chapter does not need an additional dramatic Turn.

## 3. Technical findings to carry into settlement

### All seven proposed mechanisms reproduced

| Plan mechanism | Independent result | Scope for the chapter |
| --- | --- | --- |
| 1. Default-export incident | No diagnostics; converted test passes; old route throws the stated TypeError | Core |
| 2. Checking JS and TS7 defaults | `checkJs` and route `@ts-check` each give TS7006 + TS2349; omitting strict gives the same; `noImplicitAny:false` leaves TS2349; `esModuleInterop:false` gives TS5108 | Core checks; cut interop-toggle detour |
| 3. Compatible conversions | `export =` works with default import and import-equals; named `price` keeps the destructured require working; `.default` at the caller also works | Core callable repair; named export can be one contrast |
| 4. TS importing unchecked JS | `handle(42)` with a `string` result compiles; parameter's inferred `any` is type-asserted in the fixture; without allowJs, TS7016 | One consequence in the existing chain |
| 5. JSDoc | Checked JS importing `Post` through JSDoc rejects string `id` with TS2322; simpler route JSDoc rejects the TS caller's numeric title with TS2345 | Use the simpler route annotation; no extra Post domain |
| 6. Lying declaration | Compiles, then throws `Cannot read properties of undefined (reading 'name')` | Cut: already Ch13; no need to pile up escape hatches |
| 7. Suppression ratchet | Used expect-error passes; obsolete expect-error gives TS2578; obsolete ignore passes | At most one Take, only if a suppression is actually proposed |

For `strict:false` I also disabled `exactOptionalPropertyTypes`, as required by that option's dependency on strict null checking. Other cases retain the book profile except the named experimental override. No diagnostic from an incompatible config is being passed off as a JS-migration result.

### Corrections that matter to the argument

**A. `noImplicitAny` is not a per-language switch.** In the shared program, setting it to false also accepts an unannotated TS function parameter. The control with strict defaults reports TS7006 in both the TS and JS files. Replace “comes off for JavaScript” with its actual scope. The alternatives above avoid this forced choice.

**B. `checkJs` does not guarantee every require call has a useful type.** This checked JS compiles, then fails with the incident's TypeError:

```javascript
// @ts-check
const name = "./slug";
const slug = require(name);
/** @param {string} title */
module.exports = function handle(title) { return slug(title); };
```

The literal `require("./slug")` was diagnosed; the computed request was not. This is a limit on Noam's coverage claim as well as Eden's caller search, not merely a weakness of grep. Keep it as one qualification unless the scenario already has a genuine dynamic loader. No new plugin framework.

**C. Not in `include` is not the same as outside the program.** I put `route.js` in `exclude`, with only `main.ts` included; main imports route. The compiler's file listing still contains route. `checkJs` reports its call error. Conversely, the independent backfill that no root imports stays out until added. The official [exclude reference](https://www.typescriptlang.org/tsconfig/#exclude) documents this distinction. Reader case (d) needs to specify the latter, not just mention the include glob.

**D. Preserving the module's loading shape is narrower than preserving behavior.** `export =` keeps the function callable; it does not make `slug(42)` valid. It also does not prove a rewritten body produces the same output. Keep arguments, results and existing runtime uses in the rule. A non-breaking type migration should not silently become an API redesign.

**E. Named exports preserve the demonstrated member access, not every possible object contract.** `module.exports = { price }` to named `price` preserves `require(...).price` and destructuring in this fixture. It is not permission to replace a callable module with named exports without changing callers. Avoid the universal “named exports keep the shape” claim for objects whose consumers inspect or mutate them in other ways. The page need not teach all of those cases; scope the claim to its call.

**F. A ratchet is not error-code-specific.** An expect-error originally suppressing a wrong assignment also passes if a different error now occupies that line. I verified an unresolved name replacing the original mismatch. If the Take survives, claim only that a now-error-free line reports an unused directive. Do not sell it as a tracked-error system.

**G. Strict is a default, not an override of explicit legacy settings.** The default probe actually omits strict in its generated config. The chapter should show the fictional project's relevant options. Existing `strict:false` or `noImplicitAny:false` does not become true because somebody installs TS7.

## 4. CommonJS is a fair setting; do not make a prevalence claim

Keep it. A still-migrating Node service can explicitly target CommonJS without claiming that all new 2026 services should. Node's **22.23.4** documentation calls CommonJS stable and documents both `"type": "commonjs"` and callable `module.exports`. That establishes support, not a market share. [Node 22 CommonJS documentation](https://nodejs.org/docs/latest-v22.x/api/modules.html#modules-commonjs-modules).

The TypeScript migration guide explicitly shows `export =` for replacing `module.exports = foo`, and named exports for exported members. Its unrelated option recommendations include historical material, so use the pinned executable probes for TS7 flags rather than repeating the guide wholesale. [Migrating from JavaScript: exporting modules](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#exporting-from-modules).

Put the repository's explicit runtime/output arrangement on the page early: it builds to JS and Node executes that output. This incident is **TS syntax compiled to CommonJS**, not native `require(esm)`. The leaf may become `.ts` while remaining a CommonJS module at runtime. That distinction is part of separating a type migration from an export-contract change.

## 5. Principle: Daniel states the limit; Eden owns the migration

Keep **Daniel** as speaker. His short, literal distinction between being included and being checked earns the expert slot. Eden should own the next PR, the old entry point and the rollout choice. Giving Eden the whole Principle would invite a policy speech before readers have seen the repository.

Suggested proposition, not manuscript prose to accept verbatim:

> Before converting a file, identify what its existing callers load, pass and receive. Keep that contract, or change and verify those callers with it. A TypeScript test using a new import style does not check the old loading call it replaced.
>
> In a mixed project, `allowJs` includes JavaScript; `checkJs` or `@ts-check` reports errors in it. Check the caller as well as the converted implementation, and inspect which files the run actually contains. Calls through `any` and entry points outside that run still need evidence. Run the checks before promising a mechanical conversion: TS7's default strictness can expose untyped JS parameters, so choose and record the checking scope instead of silently relaxing the converted TS.

This is more general than “all callers meet at require”; the scene can instantiate it with require. “Contract” must immediately mean the exported callable/members, accepted arguments and returned values, not an unexplained abstraction. The final wording should be shorter and more recognizably Daniel than this review proposition. Do not turn it into a seven-item compliance checklist.

### Reader cases to use

- **(a) Named members:** the money conversion preserves the two demonstrated require/member calls. Check those callers' arguments and results and retain the existing loading behavior. Do not demand a different export merely because the source became TS. Ask the reader what this evidence does *not* prove about other consumers.
- **(b) Callable class:** default export puts Mailer behind `.default` under the specified CommonJS emit. The converted test does not prove the old `new (require(...))` call. Keep the constructor export with export-equals, or deliberately update and verify the old callers.
- **(c) `checkJs` rollout:** specify TS7 with strict omitted and JS containing untyped, uninferred parameters. Expect TS7006, plus other errors actually found. Inspect/classify the run; choose an explicit scope or fix the debt. A shared noImplicitAny relaxation also affects TS. Do not ask the reader to predict a count or conclude that checkJs always floods every repository.
- **(d) Independent backfill:** state it is not a root and not reachable from one. Check or execute that old caller, or preserve its existing interface until it can be coordinated. If imported by a root, it is not an outside-program case merely because include omitted it.

An optional follow-up asks whether a checked computed require proves the target callable. The correct answer is no, but this need not become a fifth mandatory reader exercise.

## 6. Cast, economy and the scene to retell

Keep **Daniel, Eden, Oded, Noam and Chen**, all he. Five is enough. No Dima merely to announce that policies can combine; no Gil merely to read a diagnostic count. Noam can run his own proposed check and pay attention to what it costs. Eden can remember the backfill because he owns its rollout, without importing an unseen mobile app into this service.

The scene to retell is **the test was converted out of catching the conversion**. Preserve Oded's competence: he did not delete a failure to make CI green; the new default import looked like part of the same migration. Let him keep the old test himself. Noam's evidence should genuinely improve the next PR rather than be buried under a fabricated error mountain. Chen's omitted script gets a satisfactory repair.

Suggested budget is 12–14 small fences, with file labels and only one repository. Not all seven reproduced mechanisms belong on the page. Cut the declaration lie and the removed interop flag. Use JSDoc on `title`, not a new Post interface. Keep the migration ratchet out unless someone actually needs a suppression. One old caller-shaped test establishes the lesson without a Ch26 tutorial. No module-system conversion project, build-performance claim or monorepo project-reference digression.

## 7. Reproduction and handoff

Untracked evidence in this worktree:

- `.probe/codex/run.cjs` / `results.json`: 29 compiler cases for all seven mechanisms plus the initial strategy regressions.
- `.probe/codex/extra.cjs` / `extra-results.json`: 8 further cases, including the unchanged test across all three module versions, JSDoc propagating to the TS caller, excluded-but-imported route, added backfill root and both successful checking scopes.
- `.probe/codex/verify.cjs`: asserts all 37 expected diagnostic-code sets/statuses and the recorded runtime regressions. Result: **PASS**.
- `cases/` and `extra-cases/` retain source, explicit CommonJS package files, generated configs and emitted JS. `run.log` / `extra.log` retain the runs. No timing claim.

The [checkJs reference](https://www.typescriptlang.org/tsconfig/checkJs.html) supports the included-JS checking distinction; all version-specific findings above come from these installed-compiler runs. No third-party migration tools, library behavior or proposed language features are claimed.

**Settlement requested:** accept a local Verdict, the compatible-export plus old-test repair, and the included/checked/constrained distinction; decide whether the on-page census makes global checking practical or warrants a scoped rollout. My tested small census supports the former. Keep the five-person cast and the independent-script qualification. Do not force an open ending. No drafting until settlement.
