# Chapter 26 — draft 1 self-review

Status: **DRAFT 1 FROZEN; INDEPENDENT REVIEW PENDING**, 2026-10-28. Independent readers and Claude's formal review are pending. This is Codex's own assessment, not an isolated read or approval.

Manuscript: [It Can't Be Green](../../book/04-the-real-world/03-testing-typed-code.md).
Settled plan: [Ch26 settlement](CH26-PLAN.md#settlement-after-codexs-challenge-2026-10-28), commit `f1e03c6`.
Snapshot: [DRAFT1-SNAPSHOT.json](ch26/DRAFT1-SNAPSHOT.json).

## What the draft decides

The local Verdict preserves accepted paid and pre-order calls and rejects a separately constructed, valid Draft. For the helper, the team keeps an exact assertion on the inferred paid status and the existing admin caller/positive assignment. The whole-result equality assertion goes because it freezes an intersection the supported uses do not require. The negative status assignment is demonstrated as a working alternative to equality, then removed from the final file as redundant. Exact comparison does not get exclusive credit for catching any.

The runtime command explicitly selects test/ship.test.ts; the compiler includes that file and type-tests/**/*.ts. Runtime assertions check both permitted shipment records and the admin card's text. The compile-only file is not imported by a runtime file. The final record distinguishes checking that the file participates from checking that its test catches the intended signature regression.

## Settlement and scene review

1. **The hook preserves the three-state history.** Before currency, widening makes Noam's original directive unused. Adding currency leaves the fixture stale while the guarded call still reports the status mismatch. The PR then changes the suppressed reason to missing currency. Eden does not say the test stopped being about ship in March. Noam really had seen his original test fail; the chapter makes the changed fixture contract matter.
2. **The repair checks the required feature as well as the prohibition.** The valid Draft fails outside the directive when a required field is added. With a Paid-only parameter, exposing its call reports TS2741 for paidAt. Oded admits that Order includes Draft and supplies the positive pre-order case along with Paid | PreOrder. The final union's exposed rejection is TS2345 with the draft/preorder status mismatch; the validator records that separately rather than recycling the Paid-only explanation.
3. **The promised inference has a consumer and a plausible refactor.** The admin paid-order card accepts only a paid row. orderRow preserves that literal from its argument. Its existing Object.assign assembles fresh fragments; Guy explains the removed customer-name fragment. Replacing it with an object literal naturally flattens the inferred intersection without changing the shown id/status operations or rendered card. No unshown caller census or universal structural-equivalence claim is made. The helper is present in the checker from the initial repository state, though the manuscript introduces it when Guy opens the caller.
4. **Both testing styles get their strongest demonstrated version.** The assignment alone accepts any. Whole-result equality rejects it. With that equality assertion temporarily removed, the forbidden status assignment also rejects any through TS2578. The chosen exact status assertion survives flattening; widening fails that assertion, the positive assignment and the admin caller. Guy chooses a direct statement of the promised literal, not a claim that usage could never test it. Sahar accepts the narrower assertion and removes the duplicate alternative from the final state.
5. **The Turn is caused by the team's repair.** The fake records o2 when the negative call executes. Merely naming its new file test/ship.types.ts does not stop Node discovering it. Moving it outside test/ and selecting the runtime file explicitly fixes execution; their existing compiler include then misses the new location. The false assertion, file list, include repair, restored-green run, signature mutation and second restoration follow in that order. Explicitly running the false type assertion through Node later shows why a runtime green cannot replace either compiler demonstration.
6. **Cast ownership follows the settlement.** Sahar states the Principle and examines the promised inference. Eden owns the historical diagnostic and configuration repair. Noam notices and investigates his own failed test, and accepts the usage counterexample. Oded makes the initial mistake, supplies the missing feature test and proposes the file separation. Guy supplies the admin contract and accepts that whole-type representation was a stronger promise. All five use he/him. Eli and Chen are absent.
7. **Scope stays local.** The shipping implementation records ids in memory; there is no dispatch, incident or deployed defect. The boundary beat recalls Ch7's lying signature and mentions the annotated JSON.parse return without reopening runtime parsing. Readonly, optional flags, mutual comparison, the not-any helper and the declaration-resolution problem stay in validation. There are no timing claims, third-party runner claims or large invented counts.

## Principle-only self-test

These are my answers against the settled four cases, not fresh-reader results.

- **Transfer brand:** the Principle requires a valid value of the type meant to be rejected outside the directive. A missing destination can preserve an unrelated rejection; use a complete request with an ordinary number, then weaken the amount constraint and verify that the directive becomes unused. A positive but unbranded number still lacks the brand. The test protects the brand requirement, not runtime positivity.
- **parseUsers/any:** positive assignment alone accepts any. Inspect the original inferred result, before the User[] annotation, with a meaningful forbidden operation or an appropriate comparison. If the function itself promises User[], the exact type test observes that promise; the opening explicitly says it cannot prove the body keeps it. A runtime value assertion is needed for the annotated JSON.parse example.
- **Flattening:** choose the promise before choosing the assertion. For the bounded id/status uses demonstrated here, the whole intersection representation is unnecessary. Readonly would be a different promise because a formerly forbidden property assignment could become legal. The Principle's accepted/rejected-operation definition supports that distinction without teaching another readonly example.
- **New file/two commands:** the opening separately asks whether the compiler checks the file and whether the test catches its named regression. Restore green after each experiment. Keep compile-only expressions out of runtime execution; a filename alone does not establish that. The particular Node discovery pattern is taught later rather than assumed in the Principle.

The opening is two paragraphs. It contains several concrete instructions, so the isolated readers should test whether they can apply them without merely repeating “make it red.” In particular, the distinction between a deliberately false assertion and changing the guarded signature must survive without the Turn as context.

## Voice, pacing and self-review changes

The hook and ending share Oded's offer to refresh the green check and Noam's difficulty accepting it. The scene I would ask readers to retell is the test called “can't ship a draft” recording the draft and passing. Its reveal is bounded to the fake, and the callback is visible from the opening rather than invented at the reveal. The smaller exchange about removing an ampersand gives the equality argument a concrete irritant. These are intended effects, not reader findings.

The most demanding stretch is the helper debate: assignment, any, equality, negative usage, flattening, then the narrower assertion. Each change has a named claim and a restoration, but an independent reader should say whether it starts feeling like a succession of compiler demonstrations. The helper has one shown admin consumer; the draft does not claim that all conceivable generic consumers would ignore the representation change. The final runtime file is described through retained tests and a labelled addition rather than reprinted in full. Ask whether the move remains easy to reconstruct.

Self-review removed an unsupported reference to another order-screen caller, made the historical restoration stay in the same working repository, clarified “valid value of the type you mean to reject” in the Principle, and removed Noam's reference to maintaining a book-example check from the fictional conversation. It also corrected Oded's joke to describe permitting drafts and cut the redundant final negative status assignment after its alternative had been demonstrated. None of these changes adds another mechanism.

## Validation and limits

The chapter is **2,342 whitespace-delimited words**, counting the complete Markdown including code, within the 2,300–3,000 target. It contains **16 fences: 14 TypeScript and 2 JSON**. The validator rejects an unextracted or unlabelled-language fence, uses each extracted block in the appropriate state, and checks all four printed directives without suppression. Diagnostic code, line and reason are asserted, with separate contract regressions and restored-green controls.

The Node declaration route is an explicit node_modules symlink from each relevant temporary fixture to the repository's locked installation. File-list queries verify selection of @types/node/index.d.ts. The installed declarations are **26.5.1** and the executed runtime is **Node 22.23.4**. The page uses only node:test's test and node:assert/strict. A no-route control with types:[] reports TS2591 as requested. With the page's types:[node] setting, the no-route compiler instead stops at TS2688 for the missing requested library. The route restores that exact configuration. Both cases are retained in validation; neither appears in the chapter.

Exploratory harness runs corrected a mutation anchor that also matched the Order union, included the positive assignment's additional widening diagnostic, pinned the final Draft rejection to its actual preorder-status reason, and distinguished the two missing-declaration configurations. Those were failed expectations during checker construction, not silently ignored diagnostics. The final checker asserts the observed results.

The targeted suite passed with **16 fences / 68 compiler cases / 13 runtime groups / 3 file-list queries / 4 directive occurrences**. Final self-review added an explicit runtime comparison of the row value and exact card output before and after flattening, bringing the final runtime count to 14, and a guard against untagged fences escaping extraction. The full run below covers both additions. The completed full run and freeze are recorded below. The installation is the same locked npm ci --offline installation used for the challenge; no new clean-install claim is made. No dependencies or CH26-PLAN.md are changed.

## Final validation and freeze

- `npm run check`: **exit 0**, TypeScript **7.0.2**, Node **22.23.4**, on the exact frozen manuscript and validator. Input hashes were recorded before execution and verified unchanged afterwards.
- Chapter 26: **16 fences / 68 compiler cases / 14 runtime groups**, plus **3 file-list queries** and **4 printed directive occurrences** whose unsuppressed reasons are checked.
- Whole book: **442 fences / 661 compiler cases / 299 runtime groups**, plus **2 default cases**, **2 source searches**, and **5 file-list queries** across Chapters 25 and 26.
- Manuscript SHA-256: `342cedeb68d5de539afcf96230dcebb8eb6fb06e416949339ef8b4e0b8165a65`.
- Validator SHA-256: `6beff1f32b1575244714a18cd23576561681fa6e1ce389b90beb35991861ad6f`.
- Final log: untracked `.probe/codex/draft/full-check.log`. The snapshot records its hash, each fence hash, and the final fixture's results path and hash.

**Ready for Claude's independent readers and formal review. Local commit only; no push.**
