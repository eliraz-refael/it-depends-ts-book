# Draft self-review: Chapter 17 — The Price You Were Given

Status: **DRAFT 1 FROZEN; READY FOR INDEPENDENT READERS AND FORMAL REVIEW**,
2026-10-21. This is Codex's self-review, not independent approval.

## Snapshot and scope

- Manuscript: `book/03-patterns-and-design/04-immutability.md`.
- SHA-256: `aaa4e5b7e3cbf8bc3df0ed8824af90b6112cdcba287fa7c2fd448887563e232c`.
- 2,158 whitespace-delimited words, including code; 15 TypeScript fences.
- [Settled plan](CH17-PLAN.md#settlement-after-codexs-challenge-2026-10-21),
  committed with the challenge as `922fd11`.
- [Machine-readable snapshot](ch17/DRAFT1-SNAPSHOT.json), including individual
  fence hashes and the validator hash.

No earlier manuscript is edited. The chapter is shorter than the provisional
2,500–3,300-word planning range; it is within the writing guide's range and does
not pad out the earlier chapters' readonly or non-forgeable-value lessons.

## Decision and strongest alternatives

The receipt needs the previous price. The summary needs the current price.
The promotion preview must not change checkout. These consumers appear before
their examples rely on them, and the pricing invariant appears before the
forged-price objection: total equals subtotal minus a replacement discount
between zero and subtotal.

Both proposed APIs use `quote`, which checks the amounts, computes total and
freezes a record containing only numbers. `withDiscount` returns a new value;
`CartPricing.applyDiscount` publishes such a value through its private binding.
The owner copies and checks the constructor's scalar inputs. Its snapshot can
share the frozen stored quote safely; later legitimate updates replace it.

Dafna's closure gets the same live `total` property and stable `snapshot` access.
It is not penalized with a different summary interface. Both owner forms keep
their mutable binding private. Both use the same calculation for accepted and
rejected discounts. The function also computes preview offers without applying
and undoing a live promotion.

The result is a **local Verdict on the boundary**, not a win for class syntax:
calculate values independently, control which one becomes current, and select
live views versus snapshots according to the consumer's promise. Act III's
open-ending requirement remains outstanding. No split is claimed just because
the two implementations have different syntax.

## Self-review against the guide

| Area | Self-check and question for independent review |
| --- | --- |
| Principle | Liron distinguishes received values from current state before the incident. A sole writer does not preserve old values held through a live view. Local construction by mutation is allowed before publication. Does an isolated reader restate that rule without the checkout story? |
| Onboarding | `Quote`, the invariant, the old receipt and the live summary precede the promotion failure. `applyPromotion` has an explicitly writable contract. The checked constructor is shown before either repair uses it. `view` getters are explained before the failed historical read. The preview's purpose precedes its two offers. |
| Argument | The first alias demonstrates the missing runtime boundary. The frozen live view then distinguishes control over writes from a promise of history. Both sides repair the same problem; the final closure meets the same summary interface as the class. Does the convergence feel earned rather than a staged compromise? |
| Technical accuracy | Direct array passing yields TS4104 here, rather than the discovery probe's containing-object TS2345. Both printed diagnostic messages are pinned. Frozen getter properties can read changing private state. Snapshots contain scalars, so the repair does not claim a shallow object freeze protects a whole item graph. |
| Cast and voice | Six speakers: Liron, Daniel, Dafna, Guy, Eden and Gil. Dafna is she; the others are he. Guy controls operations, Dafna keeps calculation usable without a live cart, Eden follows existing callers, Gil limits what his count proves. The two experts do not take over the repairs. |
| Ch7 calibration | The operation's actual caller exposes the distinction, as the tag-index consumer does in Ch7. Ordinary answers and corrected code carry concessions. No catchphrase quota, narrator scoring, silent closing prop, or review-room policy speech. Whether it is lively enough remains a reader question. |
| Economy | Gil's count is a short qualification in Additional Takes, not a second Turn. One Date limit stands in for a broad survey of recursive types and mutable methods. No `toSorted`, cloning, compiler-flag or universal deep-freeze detour. |

### Principle-only self-test

This is an author self-test, **not a fresh-reader result**. Reading the opening
alone gives these answers:

- An old receipt cannot use a live view just because only one owner can write.
- A summary that requests current state may use that live view.
- A locally built index need not copy each intermediate result before any caller
  has received it; publication still creates a promise to subsequent holders.

The frozen-view counterexample tests the first distinction without redefining
what the receipt needs. It changes the proposed API by adding `snapshot()`.
Claude's isolated Principle-only reader must independently check comprehension.

## Corrections made during self-review

- Correct the direct-array diagnostic to TS4104 and print its real message.
- Give the closure a live getter and snapshot method, removing the artificial
  property-versus-function migration advantage for the class.
- Run the preview against a fresh checkout, so readers do not have to carry the
  preceding example's second discount into the offer comparison.
- Remove the final round of Guy/Dafna closing statements that repeated the
  preceding agreement.
- Remove narration about an unseen edit to Guy's method arguments and an
  unsolicited authorization caveat. Neither helped the present dispute.
- Keep the optional item-history problem as an explicitly excluded graph, with
  both shallow-copy limitations stated and reproduced. Do not pretend the
  scalar-price repair also solves historical item lists.

## Validation and limits

`npm ci --offline` installed the locked dependencies. The registered full
`npm run check` exits 0 on TypeScript **7.0.2**, Node **v22.23.3**:
**314 fences / 417 compiler cases / 138 runtime groups**, plus 2 default cases
and 2 source searches. Chapter 17 contributes **15 / 19 / 19**.

The final targeted Chapter 17 run also exits 0. The last manuscript change
removed a narration paragraph after the full run; every fence and executable
claim was unchanged. The final SHA above identifies the text for the readers;
it does not relabel the full run as a prose-hash validation. `git diff --check`
passes.

The suite extracts every fence. It adds the printed snapshot member to the
printed class and checks both stages. Every annotated console result is executed
and compared with its manuscript comment. Additional checks cover both owners'
accepted and rejected updates, preserved history after later updates, preview
isolation, scalar input ownership, snapshot immutability, and the structural
forgery both designs must handle by recomputation.

The emitted strict directive is asserted; the printed promotion function is
also executed in a separate sloppy `.cjs` file. Nested aliases through shallow
copies are explicit fixture examples of the prose's limitation, not extra
manuscript implementations. The property-copy example measures copied existing
properties for distinct keys, not time or memory. These are checkout-state
models and receipt strings, not browser, payment, concurrency or authorization
tests. See [checks documentation](../../checks/README.md).

## Handoff

Claude owns the fresh Principle-only and full readers, then formal review.
The full reader should receive the chapter and prerequisites, not this record,
the plan, the challenge, or the intended conclusion. Useful prerequisites are
readonly object/array types, object spread, classes/private fields, getters,
and the earlier readonly/branding discussions. In particular, ask whether the
live view versus snapshot distinction is understandable at first encounter and
whether the final API ruling follows from the displayed call sites.

Local commit is authorized. No push or PR by Codex at this handoff.
