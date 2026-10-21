# Chapter 17: Codex plan challenge

2026-10-21. Reviewed `CH17-PLAN.md` at `2e91a06`, the writing/review guides,
voice notes, biographies, and the relevant earlier examples. No manuscript drafted.

**Disposition: keep the checkout case and the reference-ownership inquiry; revise
three parts before drafting: the Principle's remedies, the strongest competing
implementations, and the concrete decision left open.** The mechanisms mostly
reproduce. The present evidence does not yet earn “The Debate Continues.” That
is a challenge to this plan, not a request to force a Verdict.

## 1. The Principle offers two remedies that are not alternatives

“A change is only a problem for someone who can see it” is broader than the case
supports: even a sole owner can break its own invariant. More consequentially,
“make one owner the only code that can change it” does not meet a holder's
expectation that an earlier value stays unchanged. One legitimate writer is
enough to change a receipt that retains its live view.

Reproduced: `LiveOwner.view()` returns `Readonly<{ total: number }>`, only its
`discount()` writes, and the retained view nevertheless changes from 100 to 80.
This is the receipt bug with impeccable writer ownership.

Suggested proposition, to put into Liron's voice rather than necessarily copy:

> Before changing shared data, ask which callers need its current state and
> which need the value they already received. Preserve earlier values for the
> latter. Keep mutable state behind an owner that controls writes and does not
> expose writable aliases. Work that nobody else can observe yet can be built
> by mutation; decide what callers receive when you publish it.

This distinguishes a snapshot from a live capability without claiming that
classes and immutable values are opposites. It leaves open how the owner stores
state, and whether pricing returns a value or commands a cart owner. Keep the
wording about mutation scope, not a general claim that unobserved changes are
always correct.

The Principle-only test should include a single writer with an old receipt, not
just “which of two remedies applies?” A reader should reject a live view as that
receipt's history even though only the owner can write.

## 2. Keep “was / now”; establish exactly what it retains

Use the before/after receipt, not double discounting. The former follows directly
from the alias. The latter also needs a second application and pricing policy;
it would introduce another cause to explain.

Before the failure, show who captures `before`, who runs the promotion, and who
renders both totals. Establish that `before` means the pre-promotion value, not
“the current cart whenever this page reads it.” The promotion module's mutation
is legitimate under its own writable contract; its author need not be careless.
Use small integer amounts; currency arithmetic is not this chapter's subject.

Define the invariant before Guy uses it. A discount makes `total = sum(items)`
false by design. If the intended invariant is `total = subtotal - discount`, with
an allowed discount range, say so when pricing is introduced. Otherwise the
objection to `{ ...cart, total: 0 }` is a newly invented requirement: a free cart
may be valid.

## 3. Strongest positions: neither side gets a unique invariant win

Guy should offer private state, checked operations, and genuine snapshots for
the receipt. A live reader can serve a consumer that explicitly wants current
state, but cannot substitute for that snapshot. His constructor must also take
ownership of its inputs: a private field does not eliminate the caller's alias.

Dafna should offer checked value construction/transformation, not arbitrary
spreads as the entire design. A function can derive total and validate a discount
just as a method can. A class can use that same function internally. This is
central to fairness, not a consolation line after Guy has won.

I implemented both against the same scalar invariant. Both retain 100 for the
old receipt and produce 80 for the new one; both reject a discount above the
subtotal. The owner remains unchanged after the rejected operation. Both use the
same frozen `Quote` constructor; one returns `withDiscount(quote, amount)`, the
other changes its private reference inside `applyDiscount(amount)`.

What this **does not** prove: that an exported structural `Quote` is unforgeable.
`{ ...quote, total: 0 }` still type-checks. It does so for a class's plain snapshot
too. Decide which operations accept such values before assigning that hole to
one side. A method-based, non-forgeable value is available if needed, but Ch15
already did that work. Do not rebuild it here just to award Guy a win.

Two demonstrated alias costs belong in the comparison:

- Dafna's `{ ...cart, total }` preserves old scalar totals but shares `items` and
  their objects. Mutating one of those objects changes both versions. Copy the
  modified path, share only data kept immutable, or constrain the example to the
  scalar transformation; don't call the whole graph immutable from that spread.
- Guy's `{ ...input }` constructor plus `{ ...state }` snapshot shares those same
  objects. In my probe, a caller changes the owner's data through both the
  original input and the returned snapshot. Copy or freeze at the relevant
  boundaries, or return projections containing only the required scalar values.

Give both competent repairs directly. These probes establish requirements for
those repairs; they need not become two more scheduled gotchas in the manuscript.

## 4. What exactly remains undecided?

The current pair of “wins” is insufficient: history does not defeat an owner
that takes snapshots, and cross-field invariants do not defeat checked functions.
Also, “both remedies need one owner for the invariant” conflates ownership of the
validation implementation with ownership of a mutable object.

Name the proposed API change. A useful candidate is the promotion boundary:

- a pricing operation receives a value and returns a new checked value; its caller
  chooses when to publish it;
- the caller asks a cart owner to apply an operation; that owner publishes current
  state and supplies a historical snapshot when requested.

Then show the actual caller cost. For example, comparing two provisional prices
fits the first API directly; an established live-summary consumer makes the
second convenient. But Guy can also preview a value, and Dafna can keep one
current-value binding. Let those repairs happen. Neither consumer automatically
settles the service's public API.

An honest open ending is possible if, after those repairs, the team still has
an explicit choice about who publishes a new current cart and which callers
must change. Demonstrate those call sites before naming the conditions. Do not
use “more writers,” undo, audit, or copy cost as a closing list if the chapter
never exercised them. Migration friction can be a real reason to disagree;
“invariants favour OOP” cannot stand in for one.

If the implementations converge on a private owner using value transformations
and publishing snapshots, say that. That is a useful local ruling. Act III's
open-ending target must not make a settled design look unsettled.

## 5. Gil's count: useful restriction, not automatically a Turn

The unique-key spread count is right: 1,000 insertions copy 499,500 existing
properties. This measures property-copy work, not elapsed time, total allocations,
or peak memory. Duplicate keys change the formula. No timing claim follows.

Compare the same representation first. In my probe, assigning into a fresh local
object produces the identical index. A local `Map` also works but changes the
returned API; it is unnecessary to prove the point. Mutation inside a `reduce`
callback is another option. This is not evidence for a loop-style preference.

A separate nightly report of 50,000 orders weakens the one-case promise and
risks spending the Turn on the familiar quadratic-reduce lesson. Prefer the
checkout import's product/pricing index, if that work actually belongs to this
service; establish it before the count. Otherwise make this a short Additional
Take and spend the main argument on the shared-data decision.

Most importantly, the opening rule already permits unobserved local mutation.
Dafna need not be surprised by its application. Gil's case restricts an “every
intermediate object must be copied” policy; it does not refute preserving values
that have escaped to callers. Use it as the Turn only if it changes a proposal
someone actually made. The guide does not require a wrong guess or a Turn.

## 6. Mechanism audit and precise limits

I ran `.probe/codex/challenge.cjs` after `npm ci --offline` with the repository's
`checks/compiler.cjs` profile: **TypeScript 7.0.2, Node v22.23.3**. Results are in
`.probe/codex/results.json`, untracked alongside the runner. Eleven compiler
cases, ten compiled runtime groups, a separate sloppy `.cjs` process, and the
named compiler-option rejection all pass. This is discovery, not registered
chapter validation or a full-book run.

| Claim | Result / amendment |
|---|---|
| Readonly scalar property passed to writable contract | Accepted; mutation changes the aliased receipt. |
| Readonly array passed to mutable-array contract | TS2345, with the expected readonly-array elaboration. |
| “The same Cart protects items and not total” | Narrow this: it prevents giving that array a mutable-array API. A writable `items: readonly LineItem[]` property contract still accepts the Cart and can replace the array. |
| Readonly array's `sort`, nested element write | `sort` is TS2339; the mutable element write compiles. |
| Recursive `DeepReadonly` | The exact function-preserving definition in Claude's probe accepts `Date` and `Map` mutations. It also permits an ordinary readonly nested object to be passed to a writable property contract. |
| Stronger map view | `ReadonlyMap` has no `set` (TS2339). Answer that obvious repair if the Map case appears; it restricts the view, not writes through the original map. |
| Shallow `Object.freeze` | Nested array writes succeed. A frozen Date still changes its internal date value. |
| Strict frozen-property write | Exact proposed TypeError reproduced; emitted `"use strict"` asserted. Sloppy `.cjs` retains 100 silently. Scope this to that property assignment; not every mutating operation fails silently in sloppy code. |
| `structuredClone` | Keeps the static readonly property (TS2540 on direct write), but a cloned frozen object's runtime property is writable through the writable contract. Cloning is isolation, not freezing. |
| `toSorted` / named flag | TS2339 under the book profile; `--enforceReadonly` is TS5023. This tests that option name, not every conceivable future compiler feature. |

The compatibility statement is also documented in the
[TypeScript object-type handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties).
For freeze's property-integrity operation, the primary reference is
[ECMAScript Object.freeze](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.freeze).
The concrete runtime observations above come from the probes, not inferred
whole-program guarantees from those sources.

Economy: do not turn all verified mechanisms into teaching obligations. Omit
`toSorted`, `structuredClone`, and the option-name detour from the main argument.
One Date/Map limitation is enough if the cart actually contains such a value;
otherwise keep it in a short Take. A universal deep-freeze implementation would
be another topic. A shape-specific plain-data repair is sufficient here.

## 7. Cast, voice, and validation before settlement

The six-person cast works. Dafna and Guy should carry the repairs and consequences;
Eden should identify actual callers that change; Gil should identify the cost his
count cannot establish. Liron can state the rule and Daniel the asymmetric
compatibility behavior. Daniel need not deliver mechanisms 1–6 as a tutorial.

Don't require Dafna to forget a readonly limitation already established in the
book. She can question why the promotion contract accepted this Cart, inspect
the signature, and fix the boundary without a choreographed wrong prediction.
No extra Linoy appearance is needed for a lib-version aside.

Before drafting, settle three questions:

1. Does the revised rule explicitly preserve historical values even with one
   legitimate writer?
2. What is the exact promotion API under dispute, and what real caller cost
   survives each side's strongest repair?
3. Does Gil's case alter that dispute, or should it be a shorter qualification?

Add to the eventual durable suite: retained before/after receipts for both repairs;
constructor-input and returned-snapshot alias tests wherever nested data is exposed;
the same invariant failure for both alternatives; and static/runtime checks of the
particular readonly/freeze guarantees the manuscript actually promises. Preserve
old values through a later legitimate update, not only through a malicious write.

**Ready to settle the plan on those points. No chapter drafting yet.**
