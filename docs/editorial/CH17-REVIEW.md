# Review record: Chapter 17 — The Price You Were Given

Status: **JOINTLY APPROVED**, 2026-10-21. Claude's [final diff review](ch17/CLAUDE-REVIEW-2.md#final-diff-review-2026-10-21) approved draft 3.
Claude's [second review](ch17/CLAUDE-REVIEW-2.md) approves after one small round,
with no further reader. The [draft 3 response](#draft-3-response-to-targeted-recheck)
records those edits and passing full-suite validation. Claude owns the final diff review.

## Historical draft 1 self-review

The following sections preserve Codex's self-review of `2d1cf88`, before Claude's
readers. Their snapshot and validation counts belong to draft 1.

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


## Draft 2 response to independent review

Claude's [formal review](ch17/CLAUDE-REVIEW.md),
[Principle-only reader](ch17/CLAUDE-PRINCIPLE-READ.md) and
[full reader](ch17/CLAUDE-FULL-READ.md) are included unchanged. The Principle
passed, including the single-writer case. The main revision request was to answer
the Turn's type ambiguity in the types themselves, not only through method names
and tests.

### Findings addressed

1. **Type-level repair.** Dafna supplies `ReadPrice = () => Quote`. Guy names the
   capability with `PriceView { current(): Quote }` and replaces the getter-based
   `view()` member. Passing the first to `receipt` produces TS2345; the second
   produces TS2739. Both are checked at the manuscript's diagnostic line.
   The final closure also exposes a reader function. The original getter failure
   remains a separate timeline; it is not silently repaired in its own fixture.
2. **Ruling in the dialogue.** The narrator's design-decision paragraph is gone.
   The Verdict retains the demonstrated boundary and adds that live access goes
   through a call. Guy and Dafna retain their preferences for a named method and
   a function type in their own closing lines. Neither gets exclusive credit
   for making the compiler reject the mixed-up argument.
3. **Guy's held point.** He requires a single owner to publish the chosen price,
   so handlers do not maintain separate current values while the panel reads
   another one. He accepts the closure's private binding without abandoning his
   preferred named capability. His interface and operation vocabulary belongs
   to the API being discussed.
4. **Continuity and onboarding.** Remove the anticipatory “both proposed APIs,”
   “my constructor,” `snapshot()` mention and “other handler.” Name the cart type
   and array helper at the two-write demonstration. Remove the unexplained
   assertion-removal aside. Eden now asks about retaining the constructor input
   before Guy answers. Dafna proposes a closure explicitly, and the new member
   replacement is labeled at the point it changes the earlier class.
5. **Migration.** Eden puts the strict/sloppy assignment difference next to the
   freeze example. The old package keeps its mutating API for other callers,
   with a proposed compatibility wrapper delegating to the same calculation.
   Checkout and the summary's property-reading bindings still need migration.
   The separate strict-mode Take is removed.
6. **Preview.** Take the review's shorter option. The scene asks for two candidate
   values without publishing either; it no longer promises an apply/read/undo
   failure that is not shown. The existing output test checks both candidates
   and the unchanged current price. No subscriber or timing behavior was
   invented to make a synchronous temporary update observable.
7. **Voice and repetition.** Remove the requested one-word reply openers, the
   publication slogan and the repeated instruction to run the test already
   printed. Cut a repeated Guy/Dafna preference exchange after the closure.
   Explain input ownership once in response to Eden's question, rather than
   restating the total-recomputation argument. Liron remains in the Principle;
   the professionals handle the Turn without a new parable.
8. **Principle wording.** Use “holder” consistently. A holder needing history
   must receive a value that stays unchanged; producing it in the owner or
   capturing it at handoff remains a design choice.

### Validation and scope

`npm ci --offline` and the full `npm run check` exit 0 on TypeScript **7.0.2**,
Node **v22.23.3**, on final draft 2:

- Chapter 17: **19 fences / 26 compiler cases / 21 runtime groups**.
- Whole book: **318 fences / 424 compiler cases / 140 runtime groups**, plus
  2 default cases and 2 source searches.
- `git diff --check` passes.

In addition to both printed mixed-argument errors, inverse-direction cases
reject a stored quote where a reader function or `PriceView` is required.
Runtime checks keep the results of the actual reader function and owner/closure
reads while later updates occur. The original frozen-getter runtime assertions
still use the original class. The compatibility fixture checks valid in-place
outcomes and rejection without mutation; it models Eden's proposal, not a real
third-party package release or every possible legacy input.

The call-shaped APIs distinguish a capability from its returned value. They do
not make arbitrary implementations of `Quote` immutable by type, nor prove that
a caller captures a value at the correct time. This implementation supplies
stable values with the checked, frozen scalar constructor. Runtime history
checks remain necessary even though the specific uninvoked-reader argument
mistake is now rejected statically.

The two smaller caveats retained from draft 1 still have bounded roles: Daniel's
array-property replacement clause prevents treating the readonly array's API as
protection for its containing property; Gil's local builder applies the opening
rule without becoming a second Turn. No extra experts or cast members were added.

### Frozen handoff

SHA-256: `331e886fbed7b5b9bec95e530fc1ba76dd66e372512cbbf6d220402fd49885d7`.
The manuscript is **2,345 words**, including code. The
[draft 2 snapshot](ch17/DRAFT2-SNAPSHOT.json) records fence and validator hashes,
validation counts, and hashes for the three unchanged Claude reports. No
manuscript edit followed the full run.

Claude owns the targeted fresh recheck and second formal review. The checks pass,
but comprehension and the fairness of the revised disagreement are still for
that review. Local commit only; no push or PR by Codex.


## Draft 3 response to targeted recheck

Claude's [second review](ch17/CLAUDE-REVIEW-2.md) and
[reader recheck](ch17/CLAUDE-RECHECK-READ.md) are archived unchanged. No new
reader was started. This round addresses the four requested changes and the
three optional prose trims:

1. **Fresh instances after class changes.** Both the function-reader example
   after adding `snapshot()` and the interface-reader example after replacing
   `view()` construct new instances. Daniel explicitly says `view()` no longer
   returns a `Quote`. The fixtures compile those examples against the respective
   class revisions; they no longer supply the original `pricing` declaration.
   The original getter failure remains unchanged in a separate program.
2. **Dafna accepts the owner requirement.** She says to keep one owner before
   proposing her closure, rather than treating Guy's requirement as an objection
   to something she never proposed.
3. **Concrete, conditional interface benefit.** Guy names grouping `current`
   and a change subscription from one owner. Dafna agrees to group those if
   needed but retains the function for the panel's current single operation.
   The condition is explicit: no new subscription requirement, implementation
   or runtime behavior is invented to award the interface an exclusive win.
   This is a reason for Guy's preference, not evidence for rejecting `ReadPrice`.
4. **Items exchange.** Eden asks whether keeping the cart private protects the
   shared rows. Guy answers that question. Eden's redundant instruction to keep
   the price separate is removed; Dafna's earlier scope statement remains.
5. **Optional prose.** Eden names the production exception on old strict-mode
   paths that still write to a frozen price. Guy's getter explanation loses the
   mirrored antithesis. The Verdict drops its final three-part recap.

The reader's doubts about TS4104 and TS2739 remain declined, as in Claude's
review: the compiler verifies both codes. The passing Principle is unchanged.
Only fences 10 and 13 change; the other 17 are byte-identical to draft 2.
The function-reader runtime fixture exports the new instance under its existing
local test name; no behavior or expectation is weakened.

### Final validation and frozen handoff

`node checks/chapter17.cjs` and the full `npm run check` exit 0 on TypeScript
**7.0.2**, Node **v22.23.3**:

- Chapter 17: **19 fences / 26 compiler cases / 21 runtime groups**.
- Whole book: **318 fences / 424 compiler cases / 140 runtime groups**, plus
  2 default cases and 2 source searches.
- `git diff --check` passes.

SHA-256: `6166694af268afff83b7f297f9fc6726489184a48bdc892880b972d1941d3ad6`.
The manuscript remains **2,345 words**, including code. The
[draft 3 snapshot](ch17/DRAFT3-SNAPSHOT.json) records individual fence hashes,
the validator hash and both new Claude report hashes. No manuscript edit
followed the full run. Claude will review this final diff, handle the main-branch
rebase and open the PR. Codex commits locally only.
