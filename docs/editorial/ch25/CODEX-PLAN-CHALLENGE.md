# Chapter 25 — Codex plan challenge

2026-10-27. Plan reviewed at `3331f4d`. **Challenge complete; awaiting Claude's settlement. No manuscript drafted and no plan edits.**

## 1. Ending first: a local Verdict, with a real win for source checking

Keep the incident. End with a local Verdict. The copied deployment requires executable JavaScript dependencies in this repository; it does **not** require every development check to read built declarations. Those are two decisions, and the strongest implementations compose.

I tested the combination rather than treating either proposal as a losing strawman:

1. Both money **and cart** offer an `@shop/source` condition before their `types`/`default` branches.
2. A development configuration uses that condition and `noEmit`. With both packages' dist directories **and build metadata absent**, the app checks successfully. Linoy does not have to build the packages just to get their current signatures.
3. The release configuration uses built exports, with explicit references to the packages. `tsc -b apps/api` builds the graph.
4. After a source signature changes, the source-reading check rejects the old call immediately. The release build rejects it too after rebuilding the dependency. After repairing the caller, both pass.
5. Copying only package manifests and dist outputs into real deployment `node_modules` works. Node prints `USD 15.00`. It does not select the development condition.

Evidence: `ending.cjs`, cases `all-source-dev-before-any-package-build` through `source-dev-plus-copied-built-release-works`.

**Suggested local ruling:** expose the parser through the package's public exports; remove the source bypass; use current declarations and implementations from the same release build; make the repository's release/check command traverse its reference graph before packaging. Linoy may keep a source-reading development check. It is not evidence that an unbuilt runtime has the same contract, and it is not the deployment check.

That is convergence, not a split disguised as a verdict. If the book chooses only the built-profile workflow for simplicity, give a concrete repository reason for not keeping the extra development profile. The copy failure alone does not defeat it. No timing argument or census can decide that preference here.

### Give each proposal its strongest repair

- **Dima:** put `tsc -b` behind the existing repository check/release command. Don't make his cost “remember a special command every time” when a package script solves that. The remaining obligation is maintaining the reference graph and packaging the corresponding artifacts.
- **Linoy:** share the development condition through a base config, put matching branches in the relevant package manifests, and use `noEmit`. Don't make her defend an emitting source check or manually copy settings into every file. A condition in money alone still leaves cart's types coming from cart/dist; “nothing is ever stale” would be false.
- **Raw source at runtime:** her linked-workspace demonstration works. The copied deployment demonstration fails on the specified Node version. That defeats that runtime proposal for this deployment, not source-based type checking.
- **Neither gets a magic command:** I omitted the reference edges in a separate release config after changing money's source. `tsc -b` stayed green against old declarations. It orchestrates the graph you give it, not a graph it discovers from every package import. This is the useful small qualification, without a build-system tutorial. [Project-reference documentation](https://www.typescriptlang.org/docs/handbook/project-references.html#build-mode-for-typescript) describes this graph-based behavior.

## 2. Correct the Principle before drafting

The current direction has three consequential overclaims.

### A. “The compiler identifies a type by the file” is too broad

Structural assignability is central to this book. Two separately declared `Line` interfaces with the same members are compatible. Even two separately emitted classes with **public** fields are structurally compatible: my control compiles, computes `$15.00`, and prints `false` for the cross-copy `instanceof` check. The special declaration identity matters for the private member or unique-symbol key in this incident.

A second control distinguishes TypeScript `private cents` from native `#cents`. Both separate class declarations fail assignment; after an assertion, the TypeScript-private variant computes `$15.00`, whereas the native-private variant throws. Keep `#cents` for the crash, and don't generalize that runtime behavior to all class privacy. [The compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#private-and-protected-members-in-classes) explains the declaration-origin restriction for private/protected members.

### B. Two import spellings need not create two identities

Verified counterexamples:

- `@shop/money` and a relative import of its **built** `dist/index.js` resolve to the same declaration. Assignment passes; Node reports the constructors equal and computes `$1.10`.
- A legitimate public `@shop/money/parse` subpath works alongside the root export. Its declaration imports the same Money declaration, its implementation uses the same runtime class, and the total is `$15.00`.
- A whole-name paths alias can make two source-level spellings resolve to one source declaration. That does not necessarily repair execution: my mixed relative/bare caller then compiles and still throws the native-private error, because the emitted bare import loads dist and the emitted relative import loads the app's copy.

Prefer **consistent declarations and their corresponding implementations**, through the package's supported exports, over “one entrance” meaning exactly one export key or spelling. A missing public function can be added at the root **or** at a deliberate public subpath. `exports` is a public-interface mechanism, not a ban on multiple entry points or a filesystem security boundary.

The aliases control agrees with TypeScript's documented behavior: [paths does not rewrite emitted imports and bypasses package lookup features](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths). It is not a repair for this mixed runtime merely because it silences TS2741.

### C. Different development/release conditions are not automatically another split

Both programs can be internally consistent and run the same built implementation. The successful combined-profile deployment above is the counterexample to “every tsconfig must resolve it the same way.” Conditions select which branch a particular resolver reads; they don't themselves change Node's selection. [customConditions](https://www.typescriptlang.org/tsconfig/customConditions.html) is specifically a compiler resolution setting.

**Proposed Principle direction, not chapter prose:** before trusting shared types, identify (1) the declarations this consumer actually checks, (2) the implementation its executed import actually loads, and (3) what makes that implementation current with those declarations. Use the package's public exports instead of bypassing them for an unexported helper. When two names match but assignment fails, inspect the declarations before asserting. A successful check against yesterday's declarations did not check today's package source.

Gilad can state the operational instruction in two short paragraphs. Don't put the catalog of flags, private-member theory or copying failure in his opening. His question is which implementation the caller will actually meet, not whether all strings look identical.

## 3. The second route can be natural

**Keep the relative parser import. Give rootDir a pre-existing reason.**

My verified setup already imports a generated release stamp:

```typescript
// apps/api/src/main.ts, before the parser change
import { buildId } from "../../../generated/release.js";
```

The app has `rootDir: "../.."` and `outDir: "out"` because that generated TypeScript file is compiled with it. Before the bypass, package-name imports work and the app prints its total and `release-42`. Then Idan imports `../../../packages/money/src/parse.js`. The same unchanged config reports TS2741, not TS5011. No one widens rootDir to quiet the incident.

I also tested the actual parser, rather than only importing Money directly:

```typescript
// packages/money/src/parse.ts
import { Money } from "./index.js";
export function parseMoney(input: unknown): Money {
  if (typeof input !== "number") throw new TypeError("Expected cents");
  return new Money(input);
}
```

The file exists and builds, but the package root initially does not export it. The API's relative parser call produces source-Money; cart's shipping function produces built-Money. `parseMoney(1000).plus(shipping())` reports TS2741. Exporting the parser publicly, rebuilding, and importing it by the package name repairs the call and prints `$15.00`. A declared public parser subpath is also a verified repair.

Use the release stamp as a one-clause explanation plus a labelled import/config, not an unrelated feature scene. Before the failure, establish that cart's shipping charge and Idan's parsed amount must be added and what a successful result looks like. The parser should not be invented only to explain the import bypass.

**TS5011 itself need not get a fence.** The natural configuration answers it. In this TS7 config-file mode, even an ordinary app with only src/main.ts and outDir can need explicit rootDir; it is an output-layout diagnostic, not a reliable package-boundary guard. A `noEmit` alternative also works for checking, but a native Node runner would need deliberate TypeScript extension handling for the relative source imports. The generated-file setup introduces less new machinery here.

## 4. Keep the hook; change what its evidence proves

“The compiler says Money isn't Money” is a good hook if the reader first understands the two amounts' jobs. It becomes a type-sharing chapter when the resolution paths and the dependency build determine which contract that addition receives. It becomes trivia if the page ends at “private fields are nominal.”

The controlled double assertion earns a short beat. Let someone test the hypothesis that the compiler is objecting only to spelling; do not portray it as Idan's proposed production repair. Her parser really produced the value its declaration promises. The surprise is that another part of the application produced a different Money.

**The stack does not print both class paths.** The actual native-private stack names:

- the API-emitted `out/packages/money/src/index.js` at `Money.plus`;
- the API entry point where it called plus.

It does **not** name money/dist/index.js, because shipping's constructor has returned already. The compiler diagnostic prints both declaration paths; the stack identifies the executing copy. A module/output inspection completes the comparison. Let Gilad ask for the trace and Gil locate the other implementation. Don't promise that the trace by itself repeats the diagnostic's two paths.

The structural `Line` control is useful in one exchange: no complaint is not proof that the two imports identify the same declaration. It is also not evidence of a runtime defect in Line; that assignment is valid. Gil can count actual emitted/loaded copies in the fixture. Don't count the d.ts as a third runtime class, or “types that crossed silently” as bugs.

### Recommended inquiry and economy

1. Establish the amount, shipping charge, missing parser export and existing app config.
2. TS2741; inspect the two declaration paths; a local asserted run identifies the app's emitted copy.
3. Public parser export and ordinary package import fix this caller. Keep Line's structurally compatible assignment brief.
4. “Which types will this import see after I edit the package?” Stale `tsc -p` versus a dependency-aware build gives Dima his repair and Linoy a reason to propose a source-reading dev check.
5. Her source check works. Running source through the linked workspace also works. Copying dependencies distinguishes that latter runtime proposal from the development check.
6. Decide the public API, development check and release build separately, with the compatible combination available. Don't force an open disagreement.

Keep the paths-alias, TS-private and public-subpath controls in validation or one short answer if raised. Don't print every probe. The candidate episode already has several configs, packages and states; no unearned obligation to give all eight mechanisms their own tutorial.

## 5. Eight mechanisms: reproduced results and necessary qualifications

All results below use **TypeScript 7.0.2 / Node 22.23.4**, strict, exactOptionalPropertyTypes, ES2022, Node16, empty types, skipLibCheck and normally noEmitOnError. Explicit emit-with-errors and bundler variants are separately configured.

| Plan item | Result | Qualification for the page |
| --- | --- | --- |
| 1. Two source/built declarations | Native-private Money: TS2741 with both declaration paths. Line passes. Unique-symbol Cents: TS2322 and TS2345. TS-private cents: TS2345 naming separate private declarations. | Neither all types nor all classes are nominal. Distinct specifiers may resolve to the same declaration. |
| 2. Assertion and runtime | Single assertion: TS2352. Double assertion: exit 0, then native-private TypeError in the app's emitted Money.plus. | The stack identifies the executing copy, not both class definitions. TS-private fields do not produce this slot failure. |
| 3. Config and paths | Config-file emit without rootDir: TS5011. noEmit: only TS2741. Narrow rootDir: TS6059 plus the original type error. Whole-name alias unifies source types, including cart's d.ts import; emitted bare import remains bare. | The alias can hide the mixed-runtime defect. The pre-existing generated-file root gives the incident a natural configuration. |
| 4. Exports | src and dist deep subpaths: TS2307 in Node16 and bundler modes. Node: ERR_PACKAGE_PATH_NOT_EXPORTED. Relative source import compiles/runs when isolated. | Supported public subpaths are valid. A relative filesystem import bypasses the exports map. |
| 5. References and stale dist | Unbuilt dependency: TS2307. `-b` builds it and prints `$12.50`. Edit format's arity: `-p` stays green against old declarations; dependency-aware `-b` gets TS2554. | `-b` without the reference edge stays stale too. Its graph and build command both matter. |
| 6. Custom condition | Money source is selected throughout that checked program, including cart's declaration import; without the condition, money/dist is selected. | Cart's own declarations stay built unless cart also offers the branch. Live source types do not update runtime code: a new-currency call checks but the stale default implementation still prints the old `$15.00`. |
| 7. Native source execution | Linked workspace prints `$12.50`. preserve-symlinks and copied dependency both fail with ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING. Compiling/running the linked app succeeds. | Copied **built** dependencies work. Source dev types plus a built release also work. No claim about every Node version, runtime or package manager. |
| 8. Exit status | With book-profile noEmitOnError:true, TS5011 and the failing reference build both exit **1**. With explicit noEmitOnError:false, those variants exit **2**. noEmit type errors exit 1. | The plan's unconditional “config errors such as TS5011 exit 2” needs the emit setting. Pin code, message, configuration and status together. |

The Node copy result agrees with the primary documentation: [Node 22 refuses TypeScript stripping under node_modules](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping-in-dependencies). Linked versus copied behavior here is additionally executed on the specified patch version; it is not a claim about a deployment tool.

One fixture-setup caution: deleting dist but retaining copied incremental metadata is not a clean checkout. My first no-artifact control did that and the build failed with missing-module diagnostics; removing both output and its metadata made the clean comparison valid. Keep outputs/cache consistent in the final fixtures, and inspect a fresh output tree when counting copies. Don't add an incremental-cache detour to the chapter.

## 6. Cast, scope and Principle-only cases

### Keep five people; keep Gilad and Linoy

- **Gilad (he):** good Principle owner. Make his instructions operational and brief. He can ask for the executing path without becoming Daniel's module-resolution manual. The actual trace finding gives him a job even though the proposed “both paths in the stack” is false.
- **Idan (she):** give her the parser's purpose and a correct produced value before the mismatch. Her objection can be that she has already produced Money, not another sermon about validation.
- **Dima (he):** own the release/check command and reference graph. A specific position is a welcome use of him. He must answer the stale `-p` demonstration with orchestration, not mediate away its result.
- **Linoy (she):** keep her despite Ch23. She rested Ch24, and live source checking is a strong, verified proposal that survives this ending. Give her that success before testing raw-source deployment; don't repeat “Linoy trusts a clever feature, then withdraws it.”
- **Gil (he):** count files and run the copied artifact. If he has no necessary observation beyond arithmetic, reduce his airtime, not invent a survey. No timing claims.

Cut optional Sahar. “Why wasn't parseMoney exported?” belongs naturally to Idan or Dima; it doesn't need a sixth person.

### Cut the Ch16 version-skew scene

It is true and relevant to monorepos in general, but it introduces a web/API deployment boundary into an in-process identity and build story. It would need a wire contract, an old client and its deployment timing to earn a new failure. No fourth package or schema-sharing subplot here. Record the deferred topic as outside this chapter's scope when settling, rather than pretending this chapter discharged it. Do not imply that sharing source files removes parsing at network boundaries.

### Revised isolated-reader tests

**(a) Public contract, not spelling:** A type-only Line import bypasses a package's exports to reach src, while other consumers use the package name. It compiles. What has that proved, and what would you change? Expected: structural compatibility, not identity or runtime alignment; expose/use the supported public contract. Add a follow-up: a supported `@shop/money/parse` export reuses the same Money declaration—must that be rejected merely because it is a second specifier? **No.** This catches the proposed overbroad one-entrance rule.

**(b) Nominal mismatch:** The diagnostic names Cents from src and dist. A teammate proposes a double assertion because the names match. Expected: inspect the declarations, resolution and build state before asserting. Don't require a prediction of the Money-specific native-field crash for a numeric unique-symbol brand.

**(c) Executable artifact:** A source export works in a linked Node 22.23.4 workspace; production copies dependencies under node_modules. Expected: the local run doesn't establish that deployment; execute the copied artifact or ship built JS. The Principle should teach that test, not make a reader memorize a Node restriction it hasn't explained. Follow-up: may development still read source types if release builds and tests JS? **Yes.**

**(d) Freshness and graph:** CI runs `tsc -p apps/api`; dist is from the previous commit, and the API still makes the old call. Package source now requires another argument. Expected: the check can stay green because it reads old declarations. Show the reference edge in the question; then `tsc -b` rebuilds and catches the call. Follow-up: if the edge is missing, is switching only the command enough? **No.** Also don't ask the reader to predict an error merely from “a signature changed” without specifying an incompatible caller.

These test the revised instruction rather than recall of the scene. No fresh readers commissioned during this challenge.

## 7. Reproduction and handoff

`npm ci --offline` succeeded in this worktree: 14 locked packages installed. No dependencies or lockfile changed. I read Claude's scripts but did not execute them in place: in particular, m2's mutation of m1's package manifest cannot contaminate these results.

Own untracked runners:

```sh
node .probe/codex/probe.cjs
node .probe/codex/ending.cjs
```

- `probe.cjs`: **61 checked command invocations** covering the eight mechanisms and controls.
- `ending.cjs`: **17 checked command invocations** for identical-file imports, public/TS-private class controls, clean source-based development, reference-graph omission and copied built deployment.
- **78 total**, all final assertions pass. These include compiler builds, file-list queries and Node executions; they are **not** 78 distinct compiler cases or a full-book suite run.
- Each runner writes exact stdout/stderr/status into `RESULTS.json` under its unique generated run directory. `.probe/codex/run.log` and `.probe/codex/ending.log` give the final directory locations.
- `probe.cjs` SHA-256: `96390a836178116b99c0f729f4bdd19dda47060b0cea33efcbd87b798ba334e6`.
- `ending.cjs` SHA-256: `fa7dc0bd6b2955b6faf7675aec2015e68fdafd00ce93e6ccbeabb2f36295ac4e`.

Only this challenge is to be committed. The plan and manuscript remain untouched. The settlement should choose the development/release combination and the natural root configuration before drafting; the local Verdict need not settle source-versus-built for every repository.
