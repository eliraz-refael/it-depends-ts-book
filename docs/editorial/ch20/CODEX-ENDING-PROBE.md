# Chapter 20: bounded ending probe

2026-10-23. Against settlement `9cd9541` on `codex/chapter-20-currying`.

**Recommendation: invoke the kill rule. Neither form passes criterion 3.**
The staged factory earns a concrete benefit and a public contract, but publishing
that one helper while preserving direct calls accommodates both owners. Ch20 can
reach a local Verdict. Per the settlement, the open-ending requirement moves to
Ch22; its decision still needs to be designed, not presumed unresolved. Awaiting
Claude's decision before drafting or changing the plans.

Evidence: **10 compiler cases / 5 runtime groups pass** on **TypeScript 7.0.2,
Node v22.23.3**, using the book compiler profile and installed toolchain.
`.probe/codex-ending/run.cjs` and `RESULTS.json` contain the independent probes
(untracked). Counts below are operations in these fixtures, not timings or
predictions about production performance. No whole-book suite run or manuscript
change was needed for this design round.

## 1. Ordinary partial application: the compromise survives

Two reporting consumers accept a `(line: Line) => number`: the statement renderer
and its preview. Each can create the same adapter over the package's direct
`lineTotal(line, discount)`. A package export `discountedBy(discount)` replaces
those arrows. For three lines priced at 100 with 10% off, every implementation
returns `[90, 90, 90]`; checkout's direct call returns 90.

The second parameter is an options object in this probe, so accidentally passing
`lineTotal` straight to `map` is TS2345. The disagreement begins after the index
bug is fixed.

| Criterion | Evidence | Result |
|---|---|---|
| Repeated reporting adaptation removed | A package helper replaces the two adapters with calls returning the same unary type. A reporting-owned factory removes the same duplication without access to internals. | Pass, but the benefit is not exclusive to the package. |
| Package maintenance obligation | The helper adds a supported factory signature and a returned callback shape. Its implementation delegates to the same pricing calculation. | Pass as a public contract; no independent business logic or inference problem demonstrated. |
| Limited publication fails an owner's stated requirement | Export this helper only; checkout keeps the direct function, reporting gets its unary function, and other adapters can remain local. All tested callers compile and agree. Reporting ownership also works. | **Fail.** |

An extra public name has a cost. On this evidence, that is a reason to discuss
scope, not a demonstrated requirement preventing the compromise. “No second
export” cannot be introduced as a veto merely to keep the ending open.

## 2. Staged factory: a real benefit, still a convergence

### Setup and counts

The package privately validates promotion tiers and prepares them for lookup.
The fixture has three tiers: minimum quantities 1, 2 and 3 give discounts 0%, 10%
and 20%. Three lines at unit price 100, with quantities 1, 2 and 3, price to
`[100, 180, 240]`. Both the statement renderer and preview consume a unary pricing
function and evaluate those three lines.

The package offers:

```typescript
type PriceLine = (line: Line) => number;

function priceWith(promotion: Promotion): PriceLine {
  const tiers = prepare(promotion); // private validation and preparation
  return function priceLine(line: Line): number {
    return evaluate(line, tiers);
  };
}

function lineTotal(line: Line, promotion: Promotion): number {
  return priceWith(promotion)(line);
}
```

This is the shape under test; the scratch modules contain the complete tier
validation, lookup and counters. The consumer stores the returned function in a
`{ quote: PriceLine }` and passes it to both renderers. No promotion changes during
any test. Nothing turns on snapshot versus live state.

| Caller arrangement | Preparations | Tier validations | Line evaluations |
|---|---:|---:|---:|
| Local unary adapter around `lineTotal`, both renderers | 6 | 18 | 6 |
| One `priceWith` result shared by both renderers | 1 | 3 | 6 |
| Direct checkout call for one line | 1 | 3 | 1 |
| Batch API called separately for each renderer's three lines | 2 | 6 | 6 |
| One batch of all six lines, then partition its results | 1 | 3 | 6 |

All reporting arrangements return the same two arrays. The batch alternatives are
included to give the direct API its strongest hearing: if callers can collect the
work, a batch operation can amortize preparation too. It changes the reporting
handoff from a callable to already computed results. The present callback callers
can instead use the staged helper with no such change.

A consumer **can** write an adapter without internals; it cannot obtain the same
once-per-factory preparation count by merely closing over `lineTotal`. That is the
precise restriction. Importing the private `prepare` from the public module is
TS2459. No deep-import convention is being used as an invisible repair.

“Once” means once per `priceWith` invocation, not a cache for every occurrence of
the same promotion. The probe neither introduces memoization nor claims it is
impossible. Even mapping no lines after creating the function performs one
preparation; a local adapter used on an empty array performs none.

### The additional contract is real, but does not freeze the internals

I tested the published shape in three ways:

- A consumer stores the factory result as `PriceLine` and calls it later. Its
  return is checked as `number`.
- A deliberate compatibility mutation makes the factory return a function with a
  second required `trace: string` argument. The stored `PriceLine` assignment is
  TS2322. A direct checkout call can still work if the package supplies that new
  argument internally. This pins an **additional public obligation**, not an
  assertion that a tracing requirement is actually coming.
- A private preparation refactor changes a descending tier array into a lookup
  function built from a map and sorted thresholds. The same callback consumer,
  direct consumer, outputs and counts all pass without changing public types.

The package owes the unary numeric contract if it publishes it. It does not owe
consumers the representation of prepared tiers. There is no evidence here that
preserving the public contract obstructs a required package change. Inventing a
mandatory trace parameter as Dima's upcoming project would manufacture that
conflict; the mutation is only a compatibility test.

### Evidence against the three criteria

| Criterion | Evidence | Result |
|---|---|---|
| Repeated reporting adaptation removed | The factory gives both existing callback consumers the required function and reduces six preparations to one. A thin local adapter cannot obtain that count through the direct entry point. | **Pass, substantially stronger than the ordinary helper.** |
| Package maintenance obligation | The returned unary numeric function is stored and passed on. The required-argument mutation breaks that consumer even while direct checkout still works. | **Pass.** |
| Limited publication fails an owner's stated requirement | Publish only `priceWith` alongside `lineTotal`. Reporting gets once-prepared callbacks; checkout keeps its call; preparation stays private; the demonstrated private refactor remains possible. | **Fail.** |

The staged factory supplies a reason to publish the one helper rather than a
reason the owners cannot agree. Dima can reasonably insist on an explicit return
type, compatibility checks and no blanket rule requiring curried forms for every
export. Those are conditions this implementation meets.

## 3. A contract detail to keep if the staged example is adopted

Validation moves to factory creation. The invalid-tier probe throws `RangeError`
there before any line is evaluated. The direct call throws when it prepares for
its line. On an empty report, the staged call still validates and throws; the
unused local adapter does neither.

State this timing as part of what `priceWith` promises. Do not present staging as
only a spelling change with identical behavior everywhere. It prepares a usable
function now. This is enough for the Principle's call-boundary lesson without
reopening exception handling or mutable captures.

## 4. Disposition

**Kill the unresolved-ending proposal after this bounded round.** This is a
failure to earn an open dispute, not a failure of the staged design. If this
variant becomes the chapter's case, the supported local ruling is:

- Repair the callback argument mismatch.
- Publish the staged entry point for the demonstrated reporting need, with its
  unary numeric contract and validation timing stated.
- Preserve direct calls for checkout; other adapters stay local unless they earn
  a shared entry point too.

The ordinary version can also conclude locally, with reporting owning a small
adapter. Choosing the staged variant would add an actual reason for the package
to own the call boundary, but it should replace some mechanism material rather
than become a second chapter inside this one. These are recommendations for
settlement, not a drafted ending.

No further search for a blocking requirement in this round. No manuscript,
master plan, durable validator or existing review record was changed. Only this
record is to be committed; `.probe/` stays untracked. Awaiting the decision.
