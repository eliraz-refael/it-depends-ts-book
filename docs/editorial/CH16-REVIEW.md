# Draft self-review: Chapter 16 — What the Schema Does With the Rest

Status: **JOINTLY APPROVED**, 2026-10-14; ready for the author's review.
Claude's initial readers, formal review, recheck reader, second review and
final diff review are complete. Codex applied the revisions below and updated
validation. See [the final settlement](ch16/CLAUDE-REVIEW-2.md#final-diff-review-2026-10-14).

## Scope and decision

The chapter follows the [settled plan](CH16-PLAN.md#settlement-after-codexs-challenge-2026-10-13).
The dispute concerns which type crosses the integration module's handoff and
who decides what an unfamiliar carrier status means for each consumer.

Both repairs work on the same inputs. Idan's open variant preserves a tracking
label and returns `review` for an unknown refund status. Noam's closed projection
checks the wire fields separately, retains that same label and produces the
same refund decision. The suite compares their outputs, including malformed
input. Neither design gains monitoring that is withheld from the other.

The service chooses the projection locally because this integration module
already owns the two-consumer handoff. Eden names its cost: changes to either
consumer's policy can require changing the projection. Noam's handoff removes
the unknown-status branch from workers; it does not prove the projection's
business rule correct. Idan prefers the open type for separately owned
consumers and accepts checking their use of the shared helper in review. There is a local Verdict, not a manufactured
split; Act III's open-ending debt remains for a later chapter.

## Self-review against the guide

| Area | Evidence and remaining review question |
| --- | --- |
| Principle | Gilad states reject/preserve/translate before the scenario and distinguishes parsing from permission to act. A fresh opening-only reader restated the rule; provenance below. |
| Onboarding | Tracking and refunds precede their failures. A working `in_transit` label and known refund are printed. `skip` and `review` have different operational meanings before Oded conflates them. The inbox's snapshot/durability contract precedes the changed endpoint. |
| Fairness | Each side gets a demonstrated cost and repairs its own code. The refund mistake uses `skip`, the three-valued equivalent of the proposed boolean false, rather than changing the consumer contract midway through the argument. |
| Mechanisms | The extra-key example uses a known status. Parsing removes `eta` from output, not the original. Literal tags narrow; explicit and inferred returns differ; a catch-all survives enum expansion. `.catch` can log while still returning the wrong business status. |
| Cast and voice | Five speakers: Gilad, Idan, Noam, Oded, Eden. Idan is she; Eden is he. Gilad asks about failure and recovery ownership. Noam wants an accountable decision. Eden brings the missing ETA history and the handoff's maintenance cost. Oded wants the page moving and owns the mistaken skip. |
| Chapter 7 calibration | The code supplies the disagreement and the correction. Questions get ordinary answers; the wrong prediction has a consequence. No catchphrase quota, staged applause, expert ruling, or sequence of polished closing slogans was added. The initial full reader found the projection section too procedural; its dispatch fence and narrator explanations are now removed. |
| Economy | About 2,300 whitespace-delimited words including code, below the discovery budget but within the writing guide's range. Seventeen fences; no padding to reach a target. Additional Takes cover fallback semantics, replay checks and duplicate refunds. |

The self-review corrected “the receipt that started the failures” to “the
rejected request body”: the original endpoint rejects before storing that
body. It also kept the ownership discussion inside the Turn rather than
introducing a second top-level conclusion.

## Fresh opening-only comprehension check

Codex spawned a fresh subagent with no conversation history. It received only
the title and opening through the paragraph introducing tracking and refunds,
not the code, plan, intended verdict, validator or the rest of the chapter.
It was asked to quote the rule, restate it without the story, and suggest a
counterexample. This is an opening test, not a full-reader approval.

It quoted Gilad's rule verbatim and restated it:

> An input boundary needs explicit rules for rejecting, retaining, and converting
> data. Parsing establishes only what its checks guarantee; each consumer must
> still establish whether those guarantees justify its intended action.

Its proposed test was whether a parser could enforce all conditions needed by
all its consumers. That is compatible with the chapter's qualified “by itself”
claim, and does not assume that every consumer must repeat a runtime check.
No change to the tested opening followed this read.

## Validation

- TypeScript **7.0.2**, Zod **4.6.2**, Node **22.23.3**; real locked dependency.
- `node checks/chapter16.cjs`: **17 fences / 27 compiler cases / 14 runtime groups**, PASS.
- `npm run check`: **299 fences / 398 compiler cases / 119 runtime groups**, exit 0,
  plus two compiler-default cases and two printed source searches.
- Every TypeScript fence is extracted, with replacement definitions compiled
  separately. Intentional diagnostics are checked by line and code; the exact
  Zod message and all printed runtime outputs are pinned.
- Counterexamples cover inferred versus explicit missing returns, enum expansion
  with a catch-all, narrowing, unknown strings versus malformed wire data, and
  logging in a `.catch` callback without repairing its substituted status.
- Runtime checks execute the original and repaired endpoints, both refund
  policies and both projections, including all printed labels/refund decisions. A fixture
  adapter supplies the common handoff for comparing Idan's repaired consumers.
- The inbox double implements the promised snapshot contract. A deferred write
  verifies that 204 waits; a rejected write propagates the failure. These tests
  do not establish real database durability or simulate the fictional carrier.
  A repeated delivery produces two receipt IDs for the same refund instruction;
  no deduplication or payment implementation is claimed.

Sources: [Zod object policies](https://zod.dev/api#objects) and
[catch fallbacks](https://zod.dev/api#catch). The locked-package executions are
primary evidence for the examples' exact behavior.

## Claude's initial review and revision

Claude's [Principle-only reader](ch16/CLAUDE-PRINCIPLE-READ.md) recovered the rule.
The [full reader](ch16/CLAUDE-FULL-READ.md) found the ruling and dissent underdeveloped,
setup friction, and unnecessary projection machinery. The
[formal review](ch16/CLAUDE-REVIEW.md) requested revision, including the unchecked
`void` dispatcher, which could silently accept a fourth refund decision.

All six groups of requested changes have been applied. Detailed dispositions
and validation changes are in [CODEX-REVISION-1](ch16/CODEX-REVISION-1.md).
The original `b5660e9` suite passed 17/25/15 (book 299/396/120); those historical
counts describe the version with dispatch, not the current revised draft.

## Second review and final small revision

Claude's [second formal review](ch16/CLAUDE-REVIEW-2.md) accepted the first-round
repairs and requested a clearer ruling, an existing-worker framing for the first
projection, and line/output fixes. The [recheck reader](ch16/CLAUDE-RECHECK-READ.md)
is recorded separately. Those edits are now applied; see
[the second revision dispositions](ch16/CODEX-REVISION-2.md). Counts are unchanged.
Claude requested only its own final diff review, not another full reader.

## Handoff

Revised manuscript SHA-256: `fdfecc581ce9c7a4bc7252e81d8302e0adf7940fc9653d58eed941e56b08836d`.

Ready for Claude's final diff review. The initial and recheck reader reports are
preserved unchanged and do not constitute approval of this final prose revision.
No push or PR is included in this handoff.
