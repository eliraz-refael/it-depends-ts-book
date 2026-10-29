# Chapter 26 — Codex plan challenge

2026-10-28. Plan reviewed at `00d16ad4c017e73fbcaea8278901230e4c7ef472`, on `codex/chapter-26-testing-typed-code`. **Challenge complete; awaiting Claude's settlement. No chapter drafted and no plan edits.**

## 1. Ending first: a local Verdict, after correcting the choice

Keep the review hook. End with a local Verdict. Keep the second hole, but make the team's test-file move cause it. Keep mechanism 5 as the practical reason for that move, not a separate shipping incident. Use five characters, with Sahar stating the Principle under the plan's current expert-owner requirement.

The proposed decision contains a false opposition: **usage tests can catch `any`.** Only the positive assignment in mechanism 2 fails to do so. I reproduced this pair with an inferred result, without annotating that result first:

```typescript
// Counterexample to “usage tests can't catch any”; checked, not executed.
declare function groupBy<T, K extends string>(
  xs: T[], f: (x: T) => K,
): Record<K, T[]>;
const result = groupBy([1, 2], n => n > 1 ? "big" : "small");
// @ts-expect-error: this bucket accepts numbers, not strings
result.big.push("oops");
```

With the declared return above, this compiles. Change only the return to `any`: **TS2578**, exit 1. The forbidden operation has become legal. The same method catches a bucket property changing to `any`, not just the entire result. Evidence: `m2-negative-usage-good`, `m2-negative-usage-any`, `m2-property-any-negative-usage`.

An explicit not-any assertion is another option: `0 extends (1 & T) ? true : false` distinguishes the two returns in my controls. That is evidence against making exact equality mandatory wherever `any` might arrive, not a request to teach another helper on the page. Testing a single not-any property also does not establish the rest of the contract.

Give both positions their strongest version:

- **Usage:** accepted calls, forbidden calls and operations on the inferred result. Not just assigning the result to a broad annotation. This catches the widened shipping input and the demonstrated `any` regression.
- **Exact comparison:** assert the intended inferred result for representative inputs, including relationships that a handful of example operations could miss. It is a compact way to specify that contract, with sensitivity to representation that the owner must choose to maintain. It does not prove the implementation returns that value.

“Is the type the product?” is useful motivation, not an executable decision rule. A published function's accepted inputs are part of its product too. “Can `any` reach it?” does not force equality, and equality at a declared return cannot see an `any` hidden inside the implementation. `readonly` and exact keys can also be tested through selected operations/type properties. These conditions do not mathematically select one universal testing style.

**Recommended local ruling:** the shipping contract gets positive tests for paid orders and pre-orders, and a negative call with a valid Draft. A helper whose inference is actually promised gets a small set of explicit inferred-result assertions, where that makes the promise clearer. Do not snapshot every exported signature. Preserve useful accepted/forbidden operations alongside those assertions. For each new, changed or moved test, demonstrate that the actual check catches the intended regression; restore it and see green. Keep runtime tests for returned values and effects.

This is a practical agreement the cast can earn. The remaining freedom to choose assertion syntax is not enough to stage an unresolved ending. If the proposed helper has no real caller or promised inference, omit its blanket equality policy rather than invent a library audience. If `groupBy` stays, establish its job in the shop before debating its return type. “We chose equality here because it states this input/output relationship clearly” is an honest preference. “Only equality could catch this `any`” is false.

## 2. The hook teaches testing, if the history is accurate

The sharp teaching point is **a test can still pass after the specific rule it claims to protect is removed**. `@ts-expect-error` gives that point a small, funny manifestation. Removing the directive to read the error is diagnosis; widening the guarded API and watching the test change is the actual test of the test. Do both. Otherwise readers learn to inspect comments and never learn to challenge a passing assertion.

The historical control makes Noam competent:

1. Before `currency` existed, the inline Draft fixture was complete. With `ship(Paid)`, the test passed; widening to Order produced TS2578. It really could catch the regression when he wrote it.
2. Adding required `currency` left the inline fixture incomplete. The suppression concealed that maintenance error. With `ship(Paid)`, removing the directive still reports the intended status mismatch first.
3. Oded's widening changes the suppressed diagnostic to missing currency. The suite stays green. The stale fixture has now hidden the shipping regression.

Evidence: `m1-original*`, `m1-stale-guarded*`, `m1-stale-loosened*`.

Therefore cut **“That test hasn't been about `ship` since March.”** The evidence says the fixture has been stale since March, while the check still reported the status mismatch until this PR. The test lost its ability to distinguish the two signatures when the required field arrived. Eden can identify that history without claiming the earlier compiler had already switched reasons.

There is another diagnostic correction: with the plan's full Draft fixture and `ship(order: Paid)`, removing the directive reports:

```text
error TS2741: Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'.
```

It does **not** report a status error in this reproduction. The inline malformed object reports TS2322 on `"draft"`; the separately checked Draft reports TS2741 on `paidAt`. Both reject Draft, and the valid-fixture repair still works. Don't promise one compiler reason merely because that is the human reason for the rule.

Likewise, “give the line exactly one way to be wrong” is too literal. Draft differs from Paid in its discriminant and its missing paidAt. Say: **construct a valid value separately, then put the one forbidden operation under the directive.** The fixture's own errors must be outside that suppression. My added-field control reports TS2741 at the fixture declaration when Draft gains `region`; widening `ship` with the valid fixture reports TS2578. The [TypeScript 3.9 documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#-ts-expect-error-comments) describes the error/unused-error behavior; it does not make the comment's explanation an assertion about a particular diagnostic.

Oded needs a modest admission, not an excuse that erases his competence. `Order` visibly includes Draft, so this is a mistaken shortcut caught in review, not a subtle compiler trap that made widening inherently reasonable. He accepts the correction and supplies the positive pre-order case. Without it, `ship(Paid)` still passes the repaired negative test while failing the feature request. The final `Paid | PreOrder` contract passes both permitted calls and rejects Draft; my positive control goes red when PreOrder is accidentally removed.

## 3. Mechanism 3 mixes one useful cost with two real contract changes

The intersection control is good: this `Equal` reports false for `{ a: 1 } & { b: 2 }` versus `{ a: 1; b: 2 }`; mutual assignability reports true. I checked property reads, assignment both ways, and `keyof` on both representations. Those operations still pass. This earns Sahar's complaint about a test that demands more than these callers need.

But **“changes no caller can see” is too broad**, especially when it includes readonly and optional properties:

- `{ readonly a: 1 }` and `{ a: 1 }` are mutually assignable in the demonstrated comparison, but `x.a = 1` fails with **TS2540** through the readonly type and succeeds through the mutable type. A caller can observe that difference directly.
- The optional-property comparison changes from true to false under `exactOptionalPropertyTypes`, as claimed. A usage test changes too: `{ a: undefined }` assigned to `{ a?: number }` succeeds without the flag and fails with **TS2375** with it. This flag changes accepted programs, not merely the equality helper's temperament. [The option's documentation](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html) explains the distinction between absence and a present undefined value.
- The book's actual `checks/compiler.cjs` already enables `exactOptionalPropertyTypes`. The plan's standalone probe profile does not. Any contrast must name both profiles. “By default” without that qualification will mislead this book's reader.

Use the intersection/flat example for the cost of this equality helper. Describe the operations actually checked, not every possible TypeScript consumer. A consumer performing its own type computation may expose differences ordinary assignments do not. “Every caller still compiles” needs a defined caller set; it cannot establish universal equivalence for arbitrary future library users.

Do not print twelve failures unless twelve distinct tests belong to the scenario and the check computes them. One failing equality assertion beside a still-valid caller is enough. Repeating an assertion twelve times manufactures a complaint instead of strengthening it.

Also correct the premise's **“three ways a type test passes without testing anything (mechanisms 1–3)”**. Mechanism 3 is a test failing on a representation change. Mechanism 1 tests the wrong rejection; mechanism 2's assignment does test assignability, but permits `any`. None requires calling all of them “nothing.” The useful three passing-test failures are wrong reason, too-weak assertion, and file not checked: mechanisms **1, 2 and 4**.

## 4. Keep the Turn; let the repair create its problem

Two holes fit because they answer different questions about the same trust claim: can this assertion catch the regression, and does this command check the assertion at all? The current “new equality file happens not to be included” works mechanically, but risks feeling like a fresh puzzle introduced after the first has finished.

A stronger, reproduced sequence ties mechanisms 4 and 5 to a decision the team just made:

1. The existing negative call lives in `test/ship.test.ts`, reached by `include: ["src", "test/**/*.test.ts"]`. They have just repaired its fixture and the shipping signature.
2. The team notices that running a negative call also executes it. They move compile-only checks to `type-tests/ship.types.ts`, outside the runtime test directory. Their small inference assertions can go there too.
3. They apply their new rule to the moved file: insert an intentionally false assertion and run the existing check. Still green.
4. `--listFilesOnly` confirms the moved file is missing. Add `"type-tests/**/*.ts"` to the printed include. The false assertion now gives TS2344.
5. Remove that assertion and widen `ship` to Order as the relevant regression. The actual negative test now produces TS2578. Restore `Paid | PreOrder`: green. Run the runtime test of a permitted shipment separately.

All seven command checks in `turn-*` pass their expected outcomes in one evolving repository. This is an earned Turn: the separation they reasonably introduced requires the compiler configuration to follow it. It doesn't cancel the first repair, and it doesn't require Eli to arrive carrying a new concern.

The two red demonstrations do different jobs. A false assertion verifies that the command reaches and checks the file; the signature mutation verifies that the test catches the claim it names. A random error alone does not prove the latter. Nor is “seen red once” permanent certification after a file move or configuration change.

Cut **“the only way to find this.”** A file-list query or configuration inspection can expose the omission; the plan itself proposes the former. Deliberately causing failure is an excellent operational check, not the sole possible discovery method. Also, an include glob is not an absolute boundary: my `m4-import-reaches-unmatched-file` imports the unmatched `.types.ts` file from a matched `.test.ts` file and gets TS2344. The chapter's omitted file must have no such import. This agrees with the [tsconfig reference's explanation of file inclusion through imports](https://www.typescriptlang.org/tsconfig/#exclude).

### Mechanism 5 is useful, but the filename is not protection

On **Node 22.23.4**, plain `node --test` discovers and executes **`test/ship.types.ts`**. My run prints `SHIP_MARKER ["o2"]` and passes. Renaming a file to `.types.ts` while leaving it under `test/` does not isolate it. This is the most consequential new control for the proposed repair.

Two verified alternatives avoid that execution: invoke only `node --test test/runtime.test.mjs`, or place the compile-only file at `type-tests/ship.types.ts`, whose name/location my default-discovery control does not select. The latter still compiles when explicitly included. Prefer both a clear directory and an explicit runtime command on the page. A runtime import of that file would defeat the separation, so don't make it a shared fixture module.

Keep this to one discovery and the resulting move. Any “shipment” in the demonstration must be a record in the test's in-memory fake, as in the probes. There is no real dispatch or production incident. The joke can concern what the test just recorded; don't imply their unit tests have been sending customers' orders.

A “type-test file” can contain executable expressions. Its role and the commands determine whether they execute. Node's [type-stripping documentation](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping) explicitly says stripping performs no type checking. The file's false equality disappearing at runtime and its forbidden call running are two consequences of that same separation, not two Node tutorials.

For the 2,300–3,000-word chapter, keep the visible sequence to the bad green test, its fixture repair, the strongest usage/equality argument, the file move and failed red check, and the local ruling. The readonly, optional-flag, not-any-helper and import-reaches-unmatched-file controls belong in validation unless the scene actually raises them. The intersection example alone can carry the equality cost. No diagnostic catalogue or second incident is needed.

## 5. Correct mechanism 6; keep the check independent of Node declarations

**The repository does have `@types/node`.** It is not a direct devDependency, but `npm ci --offline` installs the lockfile's **26.5.1**, transitively through `@types/express` and its dependencies. `package-lock.json` records it. The absence of a direct entry in package.json is not absence of the package.

The diagnostic itself reproduces: with the plan's `types: []`, importing `node:test` reports TS2591. In the same fixture and installed dependency tree, adding **`--types node`** makes it compile, exit 0, with no dependency installation. An unimported `test(...)` separately reports TS2593. The latter is not a substitute for importing the runner. Evidence: `m6-node-import-empty-types`, `m6-node-import-enabled-types`, `m6-no-global-test`, `m6-runtime-import`.

The book's scratch checks normally live under the system temporary directory, whereas my requested probes live under the worktree and can reach its node_modules. Do not assume a temporary fixture can resolve a package merely because the parent check script can require it. If a durable check tests the declarations-enabled variant, give that fixture an explicit resolution route and verify the file list. Do not accidentally make that route part of the no-Node-types control.

**Recommended chapter validation layout, without adding a dependency:**

- All checked `.ts` type-test files use only the domain exports and local type helpers; no runner import or ambient `test` global. Compile these with the book profile, `noEmit`, explicit `.ts` import support where needed, and the printed include.
- Put the runtime assertions in a small `.mjs` harness importing `node:test` and `node:assert/strict`, and run it with Node 22.23.4. It imports the erasable domain `.ts` file and exercises valid calls/values. The harness is JavaScript and needs no TypeScript Node declarations. If printed, extract and execute its JavaScript fence too.
- Demonstrate the erased false type assertion by passing its `.ts` file explicitly to `node --test`; that file needs no `node:test` import for Node to execute it as a file subtest. State that it was explicitly selected. A separate runtime assertion ensures “Node exited zero” isn't the only behavior being tested.

This preserves the plan's no-new-dependency preference for a sound reason. It doesn't claim typed Node tests are impossible in this repository. If the chapter instead chooses TypeScript runtime tests, explicitly enable and provide the Node declarations and treat the runtime/type-check commands as separate obligations. The installed transitive declarations target 26, while the exercised runtime is 22; their presence is evidence for the diagnosis, not a reason to silently promise all their APIs on Node 22.

**Cut mechanism 6 as the Turn's invented history.** A previous narrowing of include to quiet runner diagnostics is plausible fiction, but unnecessary and presently explained by a false package claim. An existing `*.test.ts` convention followed by a new compile-only directory is enough. The chapter need not stage the declaration problem at all; keep its exact diagnostic as a validation control unless a character actually encounters it.

## 6. Principle and cast: make the instruction survive its own examples

### Principle direction, not chapter prose

The opening should teach these operations in two short paragraphs, with one plain definition of each testing style:

1. A usage test checks whether a concrete call or operation is accepted or rejected. An exact-result test compares an inferred type with a stated expected type using the chosen comparison helper. Neither establishes runtime values or effects.
2. Before trusting a new, changed or moved test, run the real check against a deliberate violation of its named contract. Require a failure at the test, then undo the violation and require success. A deliberate false assertion can separately check file coverage.
3. For a forbidden call, first construct a valid input outside the suppression. Put only that operation beneath the directive, and inspect the unsuppressed diagnostic. The directive demands an error, not its prose explanation.
4. A positive assignment alone permits `any`. Add a meaningful rejected operation or a suitable assertion on the unannotated inferred result. Exact comparison is useful when it states a promised inference clearly; decide which distinctions are actually part of the promise before preserving them in tests.
5. Compile the compile-only tests without running their forbidden calls. Execute runtime tests when the claim concerns actual returned values or effects.

This is a specification for the opening, not five bullets to paste into Sahar's speech. Its anchor is “break the claim this test names and run the command we trust.” Do not lead with the mechanics of Equal. Define that helper where the argument needs it, without re-teaching conditional types.

The boundary sentence should cover **typed implementations too**, not only status arriving from storage. I compiled a function explicitly returning `User[]` whose body returns `JSON.parse(raw)`; an exact ReturnType assertion passes. A runtime test with `[{"id":"wrong"}]` fails. Type tests inspect the promised type, so equality cannot validate that implementation's data. This also matches Ch7's already-established point about a lying overload. One callback is enough; no new parsing discussion.

### Keep five people; recommend Sahar for the Principle

All six proposed cast members, including optional Eli, use **he/him** in the bios. No pronoun correction is needed.

- **Sahar:** my recommended Principle owner under the explicit expert-owner rule. He is an Expert in the cast, and “which caller's claim does this test protect?” fits his practice. Give him the intersection/refactor objection, then make him accept a useful inferred-result assertion when shown the promise it protects. He cannot dismiss every type computation because ordinary callers compile.
- **Eden:** keep the historical diagnosis and the file/configuration repair. His experience makes him a credible practitioner for this Principle too, but the cast classifies him as a Professional. More importantly, **“he last set a Principle in Ch10” is inaccurate**: Eden opens Ch10's scene as the puzzled SDK consumer; Daniel explains `infer` in its Principle. If the settlement deliberately uses expertise rather than the cast's Expert category, Eden is a defensible choice. Don't justify it with that precedent. My recommendation keeps the stated format without adding someone.
- **Noam:** keep him as the author who notices his own test should fail. Let him restore the historical mutation and verify the new one. His response to `any` should be precise enough to accept the negative-usage counterexample; his character need not defend an experimentally false claim.
- **Oded:** give him the feature's positive pre-order test and the repaired `Paid | PreOrder` signature. He can propose separating compile-only calls from the runner. This gives him work beyond making the initial mistake and complaining about tests.
- **Guy:** give him ownership of the explicitly promised interface: which input/output relationships should future changes preserve? “Every exported signature gets Equal” is not automatically an OOP position; it ignores structural interfaces and turns him into a second Noam. Let him insist on a written contract and accept that representation equality is a stronger promise. One concrete inference assertion must earn his defense.

**Cut optional Eli and Chen.** Asking whether a test has failed is now the opening instruction; Noam or Sahar can apply it. Importing a sixth person only to recite it weakens the Turn's connection to their own work. Eden still has a distinct job even if Sahar owns the Principle.

## 7. Replace the four isolated-reader cases with discriminating questions

These are proposed prompts and expected answers, not commissioned reader results. No independent readers were run for this challenge.

**(a) Wrong rejection and the brand boundary.** State the contract: transfer requires `from`, `to` and a PositiveAmount brand. The test claims to reject an *unvalidated amount*, but suppresses `transfer({ from: "a", amount: -5 })`. Ask whether a green check establishes that claim and how to repair the test.

Expected: no; missing `to` can keep the line rejected after the amount constraint is weakened. Build a complete request with an ordinary number amount outside the suppression, then test its rejection. Temporarily allow an ordinary number in the transfer signature: the directive should become unused. **Follow-up:** would replacing -5 with an unbranded +5 make the original test valid? No: a raw positive number still lacks the brand, and `to` is still missing. The type test protects the brand requirement, not a runtime positivity check. This avoids rewarding a reader for inventing a cast that supposedly creates a valid negative PositiveAmount.

**(b) Assignment, `any`, and runtime truth.** Show a function without a return annotation, `function parseUsers(raw: string) { return JSON.parse(raw); }` and `const x: User[] = parseUsers(raw)`. Ask what the green test establishes and how a returned `any` could be detected.

Expected: the inferred return is any; the assignment is accepted and supplies no evidence that the result has the User[] structure. Test the original inferred result, before the User[] annotation, with an appropriate exact/not-any assertion or a meaningful forbidden operation. **Follow-up:** annotate the function itself as returning User[]. Does an exact ReturnType test now prove it parses users? No. My static/runtime counterexample passes the exact test and fails the value test. The original prompt did not specify that annotation; add it explicitly so the answer isn't guesswork.

**(c) Representation versus the promised contract.** Specify an internal helper whose maintained caller contract is reading `a` and `b`, assigning both ways to `{ a: 1; b: 2 }`, and preserving those keys. A refactor flattens the intersection, those checks pass, and the chosen Equal assertion fails. Ask whether to revert solely because of that result.

Expected: no; revise the assertion to protect the stated contract rather than freeze the unwanted representation. **Follow-up:** is removing readonly also necessarily invisible because mutual assignment still works? No; assignment to the property can become legal. For a published generic API with unexamined consumer type computations, the initial evidence would be insufficient to declare the representation unobservable. The bounded contract in this version lets the reader decide instead of guessing what “every caller” includes.

**(d) The new file and the actual command.** A new compile-only file is added, CI is green, and `node --test` is green. Ask what to demonstrate before trusting its type assertions.

Expected: use the actual compiler check and show a deliberate false assertion fails in that file; inspect the selected file list if it does not. Then mutate the particular contract and show its test fails for that change; restore it and see green. **Follow-up:** does `test/ship.types.ts` guarantee its forbidden calls won't execute? No. Verify the runtime command's selection and imports; the observed Node version executes this file under default discovery. Merely saying “run the tests” fails this case because two different commands are involved.

## 8. Reproductions, durable validation and handoff

I read Claude's `ch26p` and `ch26q` sketches without editing or running them in place. I read the Ch25 challenge and settlement, the cast, Ch25's approved chapter, Ch7 for voice, and Ch10 to check the claimed Principle precedent.

`npm ci --offline` succeeded in the requested worktree: **14 locked packages installed**, with no manifest or lockfile changes. Compiler: worktree **`node_modules/.bin/tsc`, TypeScript 7.0.2**. Runtime: **Node 22.23.4**. The main fixture profile is strict, ES2022, NodeNext, noEmit, allowImportingTsExtensions, types:[], with `"type":"module"`. Optional-property variants explicitly set their flag; the final shipping repair also passes under the actual book defaults (Node16 and exactOptionalPropertyTypes included).

| Mechanism | Reproduced result and controls |
| --- | --- |
| 1. Wrong error under suppression | Malformed guarded fixture: TS2322 when exposed. Malformed widened fixture: TS2345 for missing currency when exposed. Both pass with suppression. Complete Draft: guarded exposed TS2741 for paidAt; widened suppressed TS2578. Original pre-currency test caught widening; later required field errors outside the repaired directive. |
| 2. Assignability and any | Positive assignment accepts any, rejects unknown (TS2322). Mutual comparison accepts any/string and readonly/mutable. Equal rejects any/string and an any return (TS2344); the typed return passes. Negative usage catches any with TS2578. Annotating the result before comparing it hides the any. |
| 3. Equality costs | Intersection/flat Equal fails while tested operations and mutual comparison pass. Readonly Equal fails, but mutation is observably different (TS2540). Optional Equal and usage both change under exactOptionalPropertyTypes (TS2344/TS2375). |
| 4. File coverage | Narrow include omits a false assertion and exits 0; file list confirms omission. Expanded include reports TS2344; restored assertion passes. An import reaches a file outside the glob. Explicit Node execution passes the false type assertion. |
| 5. Forbidden runtime calls | Explicit Node execution and default discovery under test/ both record o2. An explicit runtime-only command avoids it; moving to type-tests/ also avoids default discovery while the broad compiler include still checks it. Renaming to .test.ts under test/ executes it. |
| 6. Node test declarations | Existing transitive @types/node is 26.5.1. Empty types gives TS2591 for node:test; --types node passes in the same worktree fixture. Unimported test gives TS2593. Node executes the imported test successfully. |

Run the untracked evidence with:

```sh
node .probe/codex/probe.cjs
```

- **66 checked command invocations**, all final assertions pass. This includes the compiler version query, file-list queries and Node executions; it is not a count of distinct compiler cases or a full-book suite run.
- The seven `turn-*` invocations verify the causal file-move sequence as one evolving repository. The two `boundary-*` invocations distinguish an exact public type promise from the runtime value.
- Final run: `.probe/codex/run-jzZpZF/RESULTS.json`, containing command, cwd, exit status, stdout and stderr. `.probe/codex/run.log` records the run and case names.
- Runner SHA-256: `522a7e0388a4ce85e302a8257b33ed2d266b4c6c73148457744bcc30d11027ec`.
- The first exploratory runs caught two assumptions in my own expected results: Draft's exposed diagnostic was TS2741, and Node did discover `.types.ts` under test/. The final runner asserts those observed outcomes and their repairs. Earlier partial run directories are not final evidence.

For the eventual chapter check, preserve the plan's extraction of every printed fence and the evolving repository. Add the valid Draft's **TS2741** to the diagnostic expectations; don't hard-code a status-error explanation the compiler does not give. For each directive, assert the diagnostic location and the unsuppressed reason, then exercise the intended regression separately. Check paid and pre-order positive calls as well as Draft rejection. Compute any counts actually printed. Assert both compiler file membership and runtime file selection, with a restored-green control after each intentional failure. If a JavaScript runtime harness appears on the page, extract and run that fence as well.

No manuscript, check runner, plan, dependency manifests or unrelated editorial files are changed by this challenge. The full book suite was not rerun for this document-only commit. Only this challenge is to be committed; `.probe/`, `.claude/task-state/` and `.talk/` remain unstaged. The settlement should decide the bounded exact-result promise, the causal file move, the Principle owner and the corrected four reader cases before drafting.
