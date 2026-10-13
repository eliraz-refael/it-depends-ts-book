# Chapter 4 targeted reader recheck — draft 2

Read only the revised chapter supplied for this pass. Original checkpoint and report preserved. No manuscript changes, other-review reading, or example execution.

## Consequential findings

**Ambient/declaration-file bridge: resolved.** The new paragraph explicitly connects source export → published `.d.ts` API description → ambient const enum. The following paragraph then locates `isolatedModules` on the consumer side. At the stated prerequisite level, I can now identify which publication choice triggers the warning and why the source declaration and the eventual consumer error belong to the same example.

**Reverse-map types and assertion: resolved for this example.** The first appearance now explains `typeof`, `keyof`, indexed access, and the resulting literal-number union before the code. The `Record` sentence gives its concrete contract, and “The assertion promises that shape; it doesn't check it” clearly bounds the guarantee. “Here we can inspect the entries we're swapping” appropriately ties confidence to this small, visible construction. It does not imply an exact per-code return type or external-input validation. Guy's added question also gives the explanation a conversational reason to continue. This remains the chapter's densest example, but it is now teachable rather than unexplained.

**Verdict and string-enum caption: resolved.** The explicit allowance “even for a new service” answers the exact uncertainty from the previous pass. Shape 4 now carries that maintenance rationale instead of calling the choice rarely best. The final question about what the enum buys is compatible with the debate because the chapter supplies a legitimate answer: maintainability by the actual team.

**Library-public-API rationale: resolved.** The table now bases its preference on matching raw strings being accepted, a difference the dependency example demonstrates. It no longer treats any exposed enum runtime shape as an unexplained defect. Read as a recommendation, rather than a universal prohibition, this follows the evidence.

## New problems and small residuals

No new consequential comprehension, argument, or helper-contract problem introduced by these revisions.

The added first-use derivation explanation makes the later `typeof`/`keyof` explanation a little repetitive, but the repetition is short and attached to the main string-status example. That is an acceptable teaching cost.

Two existing comments remain sharper than the surrounding discussion: “write it once per codebase, forget about it” still sells away the learning cost that Oded immediately restores, and “Only when reverse mapping is load-bearing” in Shape 3 is more absolute than the verdict's team-maintenance exception. I regard these as minor voice/precision residuals, not reasons to reopen the resolved core findings.

The new “close the tab and go outside” line is understandable character color and does not bury the objection. “Sometimes it's about the room” is less concrete than the adjoining on-call example, but the surrounding exchange supplies the meaning, so it causes no material loss.

## Recheck outcome

All three requested consequential areas are now resolved. The revised chapter preserves its genuine maintenance-focused Turn, retains the opposing side's strongest practical cases, and brings its final recommendation into line with those concessions.
