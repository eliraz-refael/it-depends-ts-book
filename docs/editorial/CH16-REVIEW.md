# Draft self-review: Chapter 16 — What the Schema Does With the Rest

Status: **READY FOR CLAUDE'S REVIEW**, 2026-10-13. Codex's draft, self-review and
compiler/runtime validation are complete. Claude's formal review and fresh
readers are pending; this is not a joint settlement.

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
consumer's policy can require changing the projection. Idan rejects exporting
it as a universal carrier model. There is a local Verdict, not a manufactured
split; Act III's open-ending debt remains for a later chapter.

## Self-review against the guide

| Area | Evidence and remaining review question |
| --- | --- |
| Principle | Gilad states reject/preserve/translate before the scenario and distinguishes parsing from permission to act. A fresh opening-only reader restated the rule; provenance below. |
| Onboarding | Tracking and refunds precede their failures. A working delivery label and known refund are printed. `skip` and `review` have different operational meanings before Oded conflates them. The inbox's snapshot/durability contract precedes the changed endpoint. |
| Fairness | Each side gets a demonstrated cost and repairs its own code. The refund mistake uses `skip`, the three-valued equivalent of the proposed boolean false, rather than changing the consumer contract midway through the argument. |
| Mechanisms | The extra-key example uses a known status. Parsing removes `eta` from output, not the original. Literal tags narrow; explicit and inferred returns differ; a catch-all survives enum expansion. `.catch` can log while still returning the wrong business status. |
| Cast and voice | Five speakers: Gilad, Idan, Noam, Oded, Eden. Idan is she; Eden is he. Gilad asks about failure and recovery ownership. Noam wants an accountable decision. Eden brings the missing ETA history and the handoff's maintenance cost. Oded wants the page moving and owns the mistaken skip. |
| Chapter 7 calibration | The code supplies the disagreement and the correction. Questions get ordinary answers; the wrong prediction has a consequence. No catchphrase quota, staged applause, expert ruling, or sequence of polished closing slogans was added. The full reader should still judge whether the projection section becomes too procedural. |
| Economy | About 2,200 whitespace-delimited words including code, below the discovery budget but within the writing guide's range. Seventeen fences; no padding to reach a target. Additional Takes cover fallback semantics and replay checks. |

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
- `node checks/chapter16.cjs`: **17 fences / 25 compiler cases / 15 runtime groups**, PASS.
- `npm run check`: **299 fences / 396 compiler cases / 120 runtime groups**, exit 0,
  plus two compiler-default cases and two printed source searches.
- Every TypeScript fence is extracted, with replacement definitions compiled
  separately. Intentional diagnostics are checked by line and code; the exact
  Zod message and all printed runtime outputs are pinned.
- Counterexamples cover inferred versus explicit missing returns, enum expansion
  with a catch-all, narrowing, unknown strings versus malformed wire data, and
  logging in a `.catch` callback without repairing its substituted status.
- Runtime checks execute the original and repaired endpoints, both refund
  policies, both projections, and dispatch to labels/refunds/review. A fixture
  adapter supplies the common handoff for comparing Idan's repaired consumers.
- The inbox double implements the promised snapshot contract. A deferred write
  verifies that 204 waits; a rejected write propagates the failure. These tests
  do not establish real database durability or simulate the fictional carrier.

Sources: [Zod object policies](https://zod.dev/api#objects) and
[catch fallbacks](https://zod.dev/api#catch). The locked-package executions are
primary evidence for the examples' exact behavior.

## Handoff

Frozen draft SHA-256: `34cf2116ffcf593293beba753eb418627b64663488a40e5033ebee0e71c3547a`.

Claude should run its fresh Principle-only and full readers, then review the
manuscript and validator. Please challenge the local ruling if the stronger
open alternative has a concrete advantage this scene has not answered. Also
check the density of the endpoint and projection setup: every helper now has a
contract before use, but comprehension still needs an independent full read.

No push or PR is included in this handoff.
