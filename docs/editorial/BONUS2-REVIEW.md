# Bonus 2 — draft 1 self-review

Status: **DRAFT 1; independent Principle-only readers, full read and targeted recheck pending.**

Manuscript: [Whose Refund Is It?](../../book/05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md).
Governing settlement: [BONUS2-PLAN.md](BONUS2-PLAN.md#settlement-after-codexs-challenge-2026-11-02), committed at `b32cb3f`.
Snapshot: [DRAFT1-SNAPSHOT.json](bonus2/DRAFT1-SNAPSHOT.json).

## The decision and its evidence

The local Verdict distinguishes a published parameter description from authority to execute the proposed action. Generating the input description leaves the saved call, parser default and dollar ledger entry unchanged. Requiring currency rejects that saved call but accepts an explicit USD for the EUR order. Taking currency from the record repairs that mistake while leaving the foreign-order call valid and executable. The final session-bound tool performs the missing ownership comparison and checks the current remaining balance before its private effect.

Alice's o-17 call is denied with no ledger entry; Bob's identical call succeeds under the same advertised schema. Alice's o-12 call succeeds in EUR. The controls remove just the ownership comparison and recover the bad effect, then restore the source and the positive and negative results. An always-deny control loses both legitimate refunds. Two 600-cent requests run against a fresh 1,000-cent balance: one is recorded and the next is refused.

The chapter uses eight fences and one evolving repository. Replacement properties, functions and files are labelled; temporary explicit-USD and foreign-order call substitutions are stated in prose and reproduced by the check. The final shop file and replay are complete replacements. The raw incoming argument string passes through envelope validation, JSON decoding to unknown and the selected schema. No brand or correlated-union tutorial remains.

## Voice, cast and the retellable scene

I reread the draft start to finish against Ch7's conversational register. The intended retelling is "They generated the description, replayed the call, and it was still dollars; then the same tool description gave Alice and Bob different answers." Guy's "Congratulations to the descriptions" lets the first repair fail in the conversation. Liron's restaurant analogy is interrupted before becoming a lesson of its own. Gilad keeps bringing the ledger back. Dafna's constructor remains useful even though its first replay doesn't repair the incident.

All four people have consequential work. Liron states the Principle before the scenario; Guy insists on a private operation and the permission check without demanding a class; Dafna retains generated structure and changes which source selects currency; Gilad supplies the fixed artifacts and runs the comparisons. Pronouns match the bios: Liron, Guy and Gilad are he; Dafna is she. No rested cast members join for a cameo.

The main editorial risk is code density. Eight fences stay below the guardrail, but the constructor/dispatcher and final shop file are substantial. Their state and the resulting ledger entries are visible, and the manuscript avoids tracing individual helper lines. Readers should still flag either block if it feels like SDK instruction. Another useful reader test is whether "description versus authority" survives the currency example rather than collapsing into the older rule to validate input.

Self-review tightened the ownership exchange to name the missing permission comparison and moved "fresh shop" before the repeated-refund answer. An unused replay import was removed. These changes precede the frozen validation run.

## Principle-only cases: my expected answers

These are self-review answers, not results from independent readers.

| Case | Expected application |
| --- | --- |
| Accurate generated description, wrong currency default | Generation describes the omission; it doesn't choose the correct currency. Use the order record to determine this action's currency. |
| Valid cancellation with a supplied actor ID | The actor string isn't authentication. Bind the trusted customer and check authority over the referenced subscription. |
| A validated `emailSent: true` without a send | Derive the outcome from the actual operation result; distinguish sending from delivery. |
| Shape refinement versus contextual ownership refinement | The contextual runtime comparison can authorize; positive-number validation cannot. The generated schema does not execute or export that comparison. |

The Principle explicitly separates the proposed action from authority, stored facts and observed outcomes. It does not claim that every duplicated field is forbidden, that schema generation exports all policy, or that parsing establishes user approval. The final Additional Take states the shop owner's automatic-refund policy and leaves a confirmation requirement to a different policy.

## Technical boundaries and settlement adherence

The effect is synchronous and in memory. It records a refund and decrements a balance without a suspension point; no payment, settlement, delivery, idempotency or database-transaction guarantee is claimed. Orders are stipulated already eligible. Session authentication belongs to the host; the demonstrated tool captures its customer ID and looks up current ownership on invocation. It is not a general solution to a host passing the wrong session.

The assistant appears through the advertised tool, saved customer conversation, fixed wire artifacts and confident reply. There is no real model call, product claim or frequency claim. The optional structured-reply beat is one short exchange in the Verdict, with its boolean/runtime contrast in validation. The async-wrapper trap, private-access diagnostics and contextual-refinement/schema comparison stay in the check, except for the short spoken refinement distinction. The synchronous helper's signature also rejects an async handler.

There are **no material deviations from the settlement**. The mandatory brand diagnostics disappear with the brand. The only printed compiler diagnostic is the missing currency field, TS2339; its complete message, source line and column are asserted. The second registry entry, refund_help, has a different parameter and return shape and runs in both supported languages in validation. Eight fences leave room for the conversation within the required length.

## Validation and freeze

`npm run check` completed with exit 0 on TypeScript 7.0.2, Zod 4.6.2 and Node 22.23.4. Bonus 2 passes **8 fences / 23 compiler cases / 28 runtime groups / 1 file-list query**. The full suite covers **472 fences / 828 compiler cases / 351 runtime groups**, plus two compiler-default cases, two searches and ten file-list queries.

The frozen manuscript is **2,368 words**, including fences, with a 137-word Principle. SHA-256: `27cf51b7396e623f49b93fd4657884665f249ed074838d292c80debf05a08824`. Manuscript, validator, runner and shared compiler-profile hashes were recorded before the final full run and verified unchanged afterwards. The snapshot records individual fence hashes, command evidence and the full-run log hash. This uses the worktree's existing locked installation; no new clean-export run is claimed.

The check extracts every fence, maintains the stated compiler profile, resolves the locked dependencies explicitly in its temporary repository and records its commands and results. It compares generated parameter data by value, asserts printed results and the ledger, protects the fixed wire artifacts by SHA-256, and verifies final file membership. Regression controls restore the final sources and replay. No extra test runner or model SDK was added.

The plan file and prior challenge are unchanged. The master plan and editorial index now link to the draft self-review. The untracked probes and full-run log are excluded from the commit.
