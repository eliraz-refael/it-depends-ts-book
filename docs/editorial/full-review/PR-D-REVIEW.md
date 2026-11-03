# PR D self-review — Act III

Base: **1562054**. Implements [PR-D-PLAN.md](PR-D-PLAN.md) and its Settlement on `codex/release-act-3`. No changes outside Act III, its check coverage and these review documents. No push.

## Changes and settlement audit

| Chapter | Change and retained argument |
|---|---|
| 14 | Ruling precedes the outer-catch decision. The request-handler callback is spoken by Guy; Dafna's one Result line contrasts booking's named refusals with the courier's caught unknown. Library, catch and serial-model premises move into comments or prompted dialogue. The held-seat Turn, result-aware adapter, unexpected-error tests and reversed-seat closer remain. |
| 15 | Noam connects the named `__brand` marker to the declaration-specific symbol key without promising runtime validation. The Debate Continues opens with scalar-role versus retained-object requirements. Noam still wants the class; Eden still favors rebuilding these requests. Oded states the test outcomes instead of silently storing tests. |
| 16 | Inbox durability and HTTP behavior move beside the endpoint. Eden states the retry/pause contract. The Verdict distinguishes input acceptance, retention and authority to act before Noam chooses Projection. Both failed interpretations and both concessions remain. Two source-only sentences are cut. |
| 17 | Liron's river gets two interrupted lines, with Eden bringing it back to the receipt. Liron alone says his reserved phrase after Dafna separates a saved quote from a live reader. Guy asks for a named interface operation without repeating his Ch8 catchphrase. The getter failure, function/interface disagreement and all code stay unchanged. |
| 18 | Eli states the saved-answer substitution rule without announcing the hidden calendar input or its repair. Requirements and helper semantics move into comments or dialogue; no state transition disappears. All cache versions, timestamps, host results, policy ownership and callback controls stay. The four-link manual paragraph is cut. |
| 19 | Removed the entire accumulated-funding/reservation/starvation model and its opening/ending promises. Kept one explicit scope boundary. The daily-reset table and finite 78,125-case comparison still change Dafna's policy proposal; they no longer support a claim about all queues. Sahar's premature naming concession and Dafna's loop-versus-fold choice survive. Ruling distinguishes refactoring from a policy change. |
| 20 | Daniel's shorter Principle concerns what each staged call establishes. The index, empty-run behavior and inference result are discovered in their scenes. No other changes; Gil's counts and Linoy's fact-checked repair line remain. |
| 21 | Gilad asks for an operation trace instead of listing all the coming traps. The Verdict begins with the repeat-safety requirement; Oded states the local keyed-send decision. Eli recalls the courier wrapper at the overload take. The early-acceptance Turn and all receiver, cancellation and outcome distinctions remain. |
| 22 | Liron opens with the saved-policy replay test, without prescribing the later authoring alternatives. A transferable ruling precedes the conditional template/editor agreement. The trigger remains a choice, not a statistical conclusion, and the chapter still answers its opening audit question. |
| 23 | Eli explains payload versus container without naming thenable assimilation. One short backward reference identifies booking's union shape. Sahar's phrase introduces the migration-cost challenge rather than ending it. The final protocol link sentence is cut; Dafna's existing observation closes the act. All alternatives, worker outputs and jokes remain. |

The six late Principles contain **120, 125, 125, 128, 126 and 124 words**, counting speaker labels. Their subjects remain distinct: Eli's substitutability argument, Sahar's readable caller behavior, Daniel's staged call contracts, Gilad's incident trace, Liron's retained meaning and Eli's container composition. They do not enumerate their chapters' named failures. This is an editorial judgment for the readers, not something compiler checks establish.

## Callback search before the Ch19 cut

Ran whole-book searches before editing for payout, starvation, accumulation, reservation, treasury, queue order, the chapter title and planner names. A second search covered Act IV and the bonuses for the payout IDs, daily allowance, finance, sellers and queue/array-operation vocabulary.

- **Ch19 itself:** removed the finance teaser, proof dialogue, funding model, reservation implementation, starvation claims, table and corresponding Verdict decision. The remaining accumulation mention is the approved one-sentence exclusion.
- **Ch14:** two reservation hits describe booking seats, not treasury funding. Retained their meaning; one moves into the `hold` contract comment.
- **Ch17:** “offers do not accumulate” describes checkout discounts. It is independent of Ch19 and stays unchanged.
- **Acts I/II:** the broad `reserv` stem also found “preserve” in unrelated type discussions. No callback to payouts or the cut funding model.
- **Act IV/bonuses:** no hits for the specific funding-model terms or planner names. The wider vocabulary search found only ordinary uses of “reduce” in Ch26 and Ch27, with no payout reference. No later callback needs repair or remains flagged.

Search logs: `/private/tmp/pr-d-callbacks-before.txt`, `/private/tmp/pr-d-callbacks-filtered.txt`, `/private/tmp/pr-d-later-callbacks.txt`. These are review evidence, not staged artifacts. No later chapter was edited.

## Benchmark and technical scope

Whitespace word counts include fences, measured against 1562054:

| Chapter | Base | Draft | Change |
|---|---:|---:|---:|
| 14 | 2,472 | 2,364 | −4.4% |
| 15 | 2,199 | 2,258 | +2.7% |
| 17 | 2,345 | 2,383 | +1.6% |
| 23 | 2,392 | 2,332 | −2.5% |

Compared each benchmark diff with the named repair areas. Ch15/17/23 fences are byte-identical; Ch14 only adds contract comments. The interrupted river is two spoken lines. Liron's phrase, Sahar's phrase and Guy's retained phrase each occur exactly once outside bios, with the intended speakers. No new cast member or data claim was added.

Ch19 is **2,119 words versus 2,890**, a **26.7%** reduction. That is slightly beyond the plan's approximate 20–25% target because the approved cut also removes the proof, funding teaser and reservation decision while shortening the Principle. The repaired-loop choice and policy Turn are both retained; no replacement subplot was added.

All surviving Act III executable statements and fence order are unchanged. Ch19 loses one complete fence, `WaitingPayout`/`fillThenReserve`. The check loses its compiler case and five model-specific runtime groups; the deleted implementation is not copied into the harness. The remaining scheduler only resets the daily allowance. It still compares every ID in the finite enumeration and the daily queue subset, without presenting those tests as a general proof. Its targeted run passed: **13 fences, 16 compiler cases, 13 runtime groups**.

The comments moved in Ch14/16/18 preserve their existing extraction prefixes. Their checks still cover the same semantics; no new prose-mirroring assertions were added. In particular, Ch18 retains all four cache candidates, near-deadline control, factory freshness, zone outputs, copied policy, risk records and the callback-arrow correction.

The exact protected lines are unchanged: Noam's Ch15 optional-marker warning; Linoy's Ch20 renderer repair; Eden's two Ch16 inbox-history lines. The old parsed inbox and replacement raw inbox remain visible in that order. Only one substantive citation remains in Act III, Ch15's readonly/mutable compatibility paragraph; no dialogue links remain. Ch15 is explicitly open; Ch22's conditional agreement stays a Verdict. No Turn was moved or replaced.

## Validation

Clean `npm ci` passed with **zero vulnerabilities**. Full `npm run check` passed on **TypeScript 7.0.2, Node 22.23.4 and Zod 4.6.6**: **483 fences, 891 compiler cases and 382 runtime groups**. Act III contributes **146 fences, 212 compiler cases and 180 runtime groups**. Coverage documentation records the deliberate Ch19 reduction. Compiler validation establishes the examples, not the success of the voice edits or whether the new Principles help first-time readers.

Logs: `/private/tmp/pr-d-install.log`, `/private/tmp/pr-d-full.log` and `/private/tmp/pr-d-ch19.log`. The fence/length/phrase audit is recorded in `/private/tmp/pr-d-audit.json`; none of these temporary artifacts is staged. `git diff --check` passes.
