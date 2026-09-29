# Checking the manuscript

The book targets **TypeScript 7**, pinned to **7.0.2**. Zod **4.6.2** and `@types/express` **5.0.6** are also pinned; transitive dependencies are locked in `package-lock.json`.

Use Node.js 22 or later, npm, and [ripgrep](https://github.com/BurntSushi/ripgrep):

```sh
npm ci
npm run check
```

`run.cjs` checks the installed compiler version against the pin and runs every suite. Each suite prints the actual compiler version and its coverage. Individual suites can also be run with `node checks/chapter9.cjs`, for example. The chapter suites leave generated fixtures in the temporary directory printed in their output for inspection.

## Coverage

Successful run on **2026-09-29**, TypeScript **7.0.2**, Node **22.23.3**:

| Suite | TypeScript fences | Compiler cases | Runtime scenario groups |
| --- | ---: | ---: | ---: |
| Chapters 1–6 | 110 | 116 | 8 |
| Chapters 7–8 | 50 | 52 | 8 |
| Chapter 9 | 20 | 33 | 5 |
| Chapter 10 | 20 | 32 | 9 |
| Chapter 11 | 20 | 34 | 11 |
| Chapter 12 | 18 | 31 | 14 |
| Chapter 13 | 16 | 24 | 16 |
| Chapter 14 | 15 | 19 | 18 |
| Total | **269** | **341** | **89** |

Two additional cases check compiler defaults. Chapter 9 also reproduces both printed source searches, including filenames and line numbers.

The original TS7 migration review is settled. Claude independently reran that suite in the workspace and a fresh install; both runs passed with 199 fences, 230 compiler cases, and 29 runtime groups. The subsequent Chapter 10 reader-onboarding repair added a caller checked before the SDK upgrade, after the breaking upgrade, and after the overload repair. Its runtime checks cover success, a synchronous throw, and a rejected promise. Claude also independently reran that expanded suite: 200 fences, 233 compiler cases, and 30 runtime groups. See [the Chapter 10 review](../docs/editorial/CH10-REVIEW.md) for its separate comprehension review. Chapter 11 adds the builder and function checks described below; its review is recorded separately in [CH11-REVIEW.md](../docs/editorial/CH11-REVIEW.md).

Chapter 12's variance checks and separate first-read review are recorded in [CH12-REVIEW.md](../docs/editorial/CH12-REVIEW.md).

Chapter 13 closes Act II with module augmentation and ambient declarations; its review is recorded in [CH13-REVIEW.md](../docs/editorial/CH13-REVIEW.md).

Chapter 14 opens Act III with error handling across a transaction boundary; its review is recorded in [CH14-REVIEW.md](../docs/editorial/CH14-REVIEW.md).

The suites extract all TypeScript fences in Chapters 1–14. They supply declarations or earlier examples where context is needed, and compile alternatives separately. Assertions cover successful compilation, intentional diagnostics, and selected inferred types. Runtime checks execute emitted JavaScript for selected claims; coverage of a fence does not mean every possible input or prose claim has a test.

Specific adaptations and limits:

- Chapters 1, 2, 4, and 7 contain competing definitions or migration stages under the same names. These are checked separately, sometimes by line range.
- Chapter 4's explicitly abbreviated `{ ... }` function body becomes `{}` in its fixture. The ambient-enum example gets a generated `.d.ts` and import to reproduce the diagnostic quoted outside a TypeScript fence. These edits are printed in the suite's report.
- Express checks use the real type packages, including the difference between augmenting global `Express.Request` and the interface exported by `express`. Express's server runtime is not exercised. Zod examples use the real package and check their inferred types.
- Chapter 9 uses a recording event-bus adapter for runtime assertions. Chapter 10 uses the documented fictional SDK test double. Neither stands in for verification of an external production service.
- Chapter 10's v4 fixture removes the two members explicitly marked as v5 additions, leaving the original single-signature method. Original and replacement `courier` declarations are checked separately.
- Chapter 11 checks the original builder and its replacement `source` method separately. The method excerpt is substituted into the manuscript's class body. Fixtures verify state preservation and loss through helpers, receiver constraints, both construction orders, the stronger source-setting helper constraint, and the accepted widening that bypasses the static set-once rule. Intentional errors are checked by diagnostic line and code; printed diagnostic codes and excerpts are matched against the compiler's output. Three additional cases verify the source-transition rule with `exactOptionalPropertyTypes` disabled; the printed excerpts use the main profile because diagnostic display differs. Runtime checks compare the builder, complete-options function, and fixed-source function; they also exercise fresh copies, repeated setters, invalid JavaScript arguments, and the guard that still rejects a widened builder's repeated source selection.
- Chapter 12 checks the original method-shaped cache, the annotated version, and the function-property version separately. Fixtures exercise direct calls, inferred forwarding, explicit adapter annotations, spread copies, both directions of reader/writer and full-cache assignment, and an already-widened legacy reference. Two cases also show that a method-shaped writer view admits the bug even with a property-shaped cache, while a property-shaped view rejects the original method cache. Runtime checks execute the accepted faulty paths and all printed results, then verify that archiving updates the download while retaining CSV metadata and a later CSV updates both. The builder callback uses Chapter 11's actual class and replacement source method with the printed variance annotation. Two profile cases disable `strictFunctionTypes` to pin the repair's dependency on that flag. These checks do not run a real archiver, generate files, or test a deployed UI.
- Chapter 13 uses separate multi-file compiler programs and fresh Node processes. The fictional `label-kit` package has the manuscript's declarations and a small JavaScript implementation of its constructor, text rendering, and prototype plugin. Checks reproduce the shared-program failure, the working runtime integration module, the erased type-only dependency, optional-member guards, and test contamination when both entry points run in one process. They also exercise ambient-module shadowing and its two repairs, a local versus global `Window`, a checked local subtype for repeated chaining, and conflicting declarations from a simulated dependency upgrade. Unlike the shared default, these cases use `skipLibCheck: false`; two comparison cases enable it. The upgrade fixture loads the dependency's declarations through the plugin import, before the application's `.ts` augmentation. Printed diagnostic text and all annotated output values are checked. The host-global runtime check supplies two small `window` objects in a VM; it does not run a browser, printer, or real third-party package. The DOM library is supplied by the compiler's default libraries for the configured target.
- Chapter 14 runs the manuscript's complete serial in-memory store model; it does not exercise a real database or provide concurrent transaction isolation. Original, inside-conversion, outside-conversion and result-adapter versions compile separately. Printed top-level-await examples are placed in an async function for Node16 CommonJS execution. All seven printed values are checked. Tests compare both the response and committed state for success, occupied and unknown seats, both seat orders, and unexpected thrown values. The adapter is checked for payload typing inside its restoration branch, an `undefined` error payload, signal identity, a host that wraps rejection, and an injected replacement host failure. The last case tests propagation, not a real rollback failure. Two additional variants reproduce the missing-await catch bypass and the raw transaction accepting result-returning steps. Prose alternatives get explicit fixtures: preflight adds a readable draft API and checks duplicate requests before writing; an owned result-aware host changes the commit condition to inspect `ok`. Neither alternative assumes concurrency guarantees. Exhaustiveness is checked with an added refusal kind in both the exception and Result versions. The catch diagnostic is matched verbatim. The queue Take stipulates a hypothetical host policy; no queue implementation, retries or external effects are simulated.
- The suites do not benchmark compiler performance or establish the fictional characters' empirical claims. Chapter 3 attributes its performance recommendation to the TypeScript wiki and makes no measured TS7 speed claim.

## Compiler settings

`compiler.cjs` invokes the installed `tsc` CLI with generated project files. TypeScript 7's native compiler does not expose the old JavaScript compiler API used by the original Chapter 9 and 10 validators.

The shared fixture settings are explicit:

```json
{
  "strict": true,
  "exactOptionalPropertyTypes": true,
  "target": "ES2022",
  "module": "Node16",
  "moduleResolution": "Node16",
  "types": [],
  "skipLibCheck": true,
  "noEmitOnError": true
}
```

Each project also gets a scratch `rootDir` and a specific file list. Diagnostic cases use `noEmit`; runtime cases use a separate output directory. Chapters 1–6 use an ESM scratch package and `moduleDetection: "force"`, allowing the shown top-level `await`. Explicit imports still resolve Zod and Express with `types: []`. `skipLibCheck` skips checking dependency declarations internally; uses of their exported types are still checked.

These are the **book's fixture options**, not a list of TS7 defaults. ES2022/Node16 keep runtime checks reproducible. TS7 defaults to strict checking, but `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are both off unless enabled. `baseline.cjs` checks these distinctions without the fixture's overrides. Chapter 8 separately checks optional properties with its flag both off and on.

The configuration generated by `tsc --init` adds options beyond the compiler defaults, including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `isolatedModules`, and `verbatimModuleSyntax`, with `module: "nodenext"`. The book leaves unchecked-index checking off: turning it on adds `undefined` to the array/index-signature reads in Chapter 1's `firstElement`, Chapter 4's `HttpStatus[200]`, and Chapter 6's `firstItem`. The isolated ambient-enum diagnostic is checked with `isolatedModules`; if `verbatimModuleSyntax` is also enabled, the diagnostic names that flag instead.

## TypeScript 7 migration

The September 24 audit found no need to change the chapters' central arguments. It did require these corrections:

- Chapter 1 and the prologue now describe strict checking as the default to keep. Authoring and review guidance use the locked TS7 baseline.
- Chapter 3 explicitly allows `undefined` in the middleware's optional `user` field, matching what the assignment can produce with `exactOptionalPropertyTypes` enabled. Its performance discussion now attributes the older guidance and calls for a measurement on the current compiler.
- Chapters 4 and 6 quote TS7's actual union ordering in diagnostics. Semantic union expansions retain their readable order; equality checks verify their members.
- Chapter 5 uses Zod 4's `z.email()` in place of the deprecated `z.string().email()` spelling.
- Chapter 9's missing-property `satisfies` regression now expects TS2741 instead of TS1360. The invalid example is still rejected.
- Chapter 10's `if (promise)` diagnostic remains TS2801, while its negated condition still compiles. The chapter now names the version actually rerun, 7.0.2.

Historical feature dates and earlier reviews' TS5 results remain historical evidence. The results above come from new TS7 runs; they are not relabelled old checks.

Sources: [TypeScript 7 release and CLI/API transition](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [native compiler changes](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md), [TypeScript performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections). The compiler and installed dependency declarations are the executable evidence for the version-specific checks.

## Updating the baseline

Before publication, and whenever the compiler or a checked dependency changes:

1. Review the official release notes and pin the chosen stable versions in both npm files.
2. Run `npm ci` and `npm run check` from the updated lockfile.
3. Investigate every changed diagnostic, inferred type, or runtime result. Update prose and expected results only after checking the behavior; preserve intentional failures.
4. Record the actual versions, coverage, and consequential differences here. Add new chapters to the runner as they are completed.

Passing this suite establishes the recorded examples on the pinned version. It cannot promise that a later compiler will keep every diagnostic or inference unchanged.
