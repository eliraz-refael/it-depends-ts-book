# Codex challenge: Chapter 19 plan

2026-10-22. Reviewed `a92d7a3` on `codex/chapter-19-imperative-declarative`,
based on main `ffc75c7`. **Keep the scenario and core mechanisms, but settle the
incident claim, Principle and ending before drafting.** No manuscript drafted.

Read PLAN, the writing/review guides, character voices and biographies, the Ch7
calibration, and the relevant Ch17–18 continuity. Ran `npm ci --offline`.
Independent scratch probes on **TypeScript 7.0.2 / Node v22.23.3**, using the book
compiler profile: **13 compiler cases and 12 runtime groups pass**. These are
discovery probes, not a new durable suite or a whole-book validation run.

## 1. The scenario works, but the days-of-starvation incident does not follow

Keep the four amounts and stop-versus-skip failure. With limit 1,000:

- stop selects P1 (400);
- skip selects P1, P3 and P4 (400 + 200 + 300).

Those outputs are verified. The rewrite changes priority even though every batch
respects the cap. That is a good competent mistake: Dafna preserved the property
her existing tests asserted, while the unwritten priority rule lived in `break`.
Show an ordinary successful batch and the caller's expected output before the
failing one. The selection function should return a batch plan; actual payment
submission stays outside these examples.

**But a daily limit that resets does not support “the large payout waits for days
while newer small ones go out.”** After the first batch, P2 is the oldest remaining
eligible payout. At the next full daily reset, 900 fits under 1,000 in either
implementation. I simulated successive days, removing selected payouts and
appending newer ones:

| Planner | Day 1 | Day 2 | Day 3, original payouts only |
|---|---|---|---|
| Stop | P1 | P2 | P3, P4 |
| Skip | P1, P3, P4 | P2 | None left |

The incident proves **overtaking**, not prolonged starvation. Newer arrivals behind
P2 do not make it fail the next day's first comparison. A payout larger than the
entire daily allowance is a different problem: the stop version blocks the queue
forever too. It is not evidence for stop preventing starvation.

**Recommendation:** retain a daily allowance and describe an oldest-eligible-first
promise being broken. Gil brings the batch IDs and their queue positions, not an
unsupported multi-day age story. Eligible amounts must fit a fresh day's allowance,
or the domain needs a separate exception path. One scope clause is enough; no new
validation tutorial.

If prolonged starvation is essential, change the model explicitly to a replenished
balance whose unused funds carry forward. Skipping can then consume the top-ups
that would fund the older payout. That requires a multi-run balance fixture and
changes the meaning of the limit. I prefer the smaller overtaking story.

Also establish **which queue has priority**: ready payouts in this currency above
the minimum, not every raw row. Held and ineligible rows already get skipped by
the old code. The phrase “oldest first” without that qualification sets up a false
promise the Turn will appear to invent an exception to.

## 2. Sahar is a good Principle speaker; the proposed rule is too categorical

The two useful questions are what crosses element boundaries and what the caller
must still receive or observe after a rewrite. Sahar can state those briefly and
ask to see the caller. That is his attention, and it rests Eli after Ch18.

I would cut these claims:

- A pipeline “has no place for a sequence rule unless you build one.” `reduce`
  already carries state; `findIndex`, `some` and `every` already stop. A named
  stage can contain a loop. Pipeline syntax is not synonymous with independent
  element operations.
- A loop necessarily “mixes them together.” The proposed hybrid and ordinary
  named predicates are counterexamples. Do not require Sahar's preferred form to
  be either intrinsically clear or intrinsically muddled.

Direction for the rule, not a frozen opening:

> If each decision only uses the current item, start with the operations that name
> those decisions: filter what stays, map what it becomes. Before replacing a loop,
> check what one item changes for the next, where processing stops, and which work
> must happen in order. Keep those rules visible in whichever form you choose. A
> callback returning is not necessarily the operation stopping.

Qualify the first sentence with independent calculations: eager `filter().map()`
also changes evaluation order compared with a fused loop. My trace gives
`test 1, map 1, test 2, map 2` versus `test 1, test 2, map 1, map 2`. Equal final
arrays do not prove equivalent required effects. One clause, not a Ch18 replay.

This lets the Principle prefer a simple per-element pipeline, yet makes the
state/stop case a question about the chosen operation. The async transfer works:
`for ... of` with `await` completes A before starting B; `Promise.all(map(...))`
starts both first. I reproduced that order without sleeps. Keep it a reader test
or one Take, not a second main scenario.

## 3. All repairs need their strongest form

### Dafna's rewrite should gain something before it fails

Separate named eligibility stages are a real improvement. The discriminant filter
retains useful narrowing, and tests of the element rules remain useful after the
budget rule is repaired. Do not frame the rewrite as “she disliked a loop.”

The proposed skip fold can be a pure **function** without copying an ever-growing
array. A fresh local `released` array plus `push` does not mutate the caller's
array or leak state between calls. My repeated-call/alias test confirms that.
Ch17 and Ch18 already grant this. A callback that updates that local array is not
itself pure; distinguish it from the externally pure batch planner. Avoid either
quadratic spreads or presenting local mutation as a safety defect.

### Typed stop information is not an exclusive advantage of a fold

I compiled both forms returning this same shape:

```typescript
type Batch = {
  released: Ready[];
  total: number;
  stop: { kind: "end" } | { kind: "limit"; id: string };
};
```

The loop returns the limit case at the failed comparison and the end case after
iteration. The closed-state fold returns the same object. Their outputs agree on
the failing queue, empty input, exact fit and first-item failure.

Dafna can prefer an explicit transition function/state, and it can earn its place
if a caller actually consumes or tests intermediate transitions. Merely needing a
log or test to know why the batch ended does **not** require `reduce`. Don't let
Sahar miss the ordinary early-return repair.

### The hybrid still evaluates the eligibility pipeline for the entire queue

For four ready, eligible payouts and a stop at P2, the reproduced counts are:

| Form | Eligibility evaluations | Budget comparisons | Array-search/fold callback calls |
|---|---:|---:|---:|
| Original fused loop | 2 | 2 | — |
| Eager filter, then short loop | 4 | 2 | — |
| Eager filter, then closed-state fold | 4 | 2 | 4 |
| Eager filter, then `findIndex` | 4 | 2 | 2 |

These probes count one combined eligibility predicate. Three named filters have
their own stage counts; don't quietly equate the two measurements. More
importantly, the closed fold does **not** keep doing budget comparisons after
closing: it returns the closed state immediately. Count callback invocations,
comparisons and source reads separately. None is a latency measurement.

### Give the short-circuiting array repair a fair hearing

`findIndex` plus `slice` is a working compact alternative. It needs the `-1` case
handled explicitly; `slice(0, -1)` would lose the last item when everything fits.
Its counter is local, so the overall planner can remain pure, just like the loop.
`some` can also stop after two calls under the current book lib, with no exception
or custom helper. I verified it.

Don't add a gallery of all spellings. One sentence or compact exchange acknowledges
this stronger repair; then discuss whether the hidden counter is clearer than the
loop or explicit fold state. “No `takeWhile`” must not imply that JavaScript lacks
any short-circuiting array operation. The specifications distinguish normal
[`reduce` traversal](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reduce)
from [`findIndex` stopping](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.findindex).

### Liron's helper should first be a domain operation

A `planPayouts(queue, remainingAllowance)` containing the loop has a declarative
caller and an imperative implementation. It can return the same typed reason.
A generic `prefixWithin<T>(items, limit, amountOf)` is a separate abstraction
proposal, not a necessary condition for naming the policy. Test Sahar's response
against the simple domain helper before invoking hypothetical reuse.

“One caller” is a cost, not a disproof: naming a policy can help without reuse.
Conversely, preview plus submission calling the *same* payout planner is not two
different running-limit algorithms requiring a generic library.

## 4. The held-row case is useful, but currently not a Turn

Verified input: held H = 1,200, then ready R1 = 600 and R2 = 500, limit 1,000.

- Eligibility first: R1 is selected, then R2 stops the batch.
- Limit first: H stops the batch and nobody is selected.

That demonstrates a real order dependency. With the proposed Principle already
requiring an order audit, it applies the rule rather than overturning the rule's
champion. All competent repairs can answer it by preserving the old order.

**Recommendation:** use it as Chen's regression question in the Debate. Give the
reader the eligible-queue promise first. Omit a separately labelled Turn unless
another case changes the disputed decision. Don't make Dafna forget that filters
run where she put them, or Sahar forget which check precedes his `break`.

## 5. The open ending is not earned by the present repair contest

As proposed, a short pure planner can preserve priority, return a typed stop
reason and sit behind a meaningful name. These are compatible improvements. A
fold need not be chosen to get the type; a generic helper need not be chosen to
get the name. The room could honestly converge. Calling the equivalent versions
“still in the review” would repeat the very ending template the plan rejects.

I see two honest locations for an open decision, with different scope costs.

### Recommended if this chapter must carry the ending: make the policy dispute explicit

The daily-reset finding supplies a stronger question than the held row:
**what is the priority promise buying here?** In the reproduced case, P2 is paid
on day 2 in both versions. Stop leaves 600 unused on day 1 and pays P3/P4 on day 3;
skip leaves 100 unused and pays them on day 1. That does not prove skip preferable,
but it removes an invented starvation argument for stop.

The room can agree that a refactor must preserve the existing behavior, and still
disagree about a **separate, explicit policy change**: strict priority among
eligible payouts, or allowing later smaller payouts to use remaining allowance.
Show who owns that proposal before the ending. Dafna's initially broken rewrite
must not be retrospectively declared an authorized product change.

- If strict queue priority is a promised service behavior, keep the stopping
  planner even when capacity remains unused.
- If the promise is the daily cap with permission to admit later fitting payouts,
  the skipping fold implements that different policy. In this fixed-reset model,
  the oldest eligible payout that fits a fresh day's allowance gets served next
  day. Don't extend that claim to changing allowances or other treasury users.
- The skip algorithm is **not an optimal packing algorithm**. Say it fills more
  of this batch, not that it maximizes utilization generally.

Chen can ask the next-day question; Gil produces the same multi-day trace for
both; Dafna argues for the explicit policy change; Sahar insists the caller must
name the choice. Liron's naming proposal now has content to name. The new question
is what behavior to request, not which syntax secretly decides it.

This would earn “The Debate Continues” around a demonstrated tradeoff. **It is a
change to the plan's disputed decision**, however, and the chapter must admit that
the correctness of the refactor is settled. It should not pretend the TypeScript
mechanism or preservation obligation remains uncertain. Please settle this scope
choice explicitly rather than discovering it in the final paragraph.

### If the ending must remain about code form

Then establish a real consumer or maintenance pressure that the current plan
lacks. A plausible one is a support report that must classify every unselected
row, while the payment planner only needs the selected prefix and first blocker.
Stopping selection is then different from stopping traversal. A closed-state fold
has something useful to do after selection closes; an early-stopping planner has
something useful to avoid. Both consumers must be introduced before their repair.

The open API decision could be whether both use one full classification pass or
whether the release path keeps a smaller prefix-only contract. A loop can produce
the full report too, so this still isn't a claim that folds uniquely handle state.
It also adds a consumer and report fields, and risks drifting into an API chapter.
I prefer the explicit priority-policy route for this scenario's economy.

If neither expansion fits, I recommend a local Verdict and an explicit settlement
conversation about the Act III requirement. I have **not** moved the debt, changed
the master plan or decided the ending on my own.

## 6. Cast and allocation

**Keep Sahar, Liron, Dafna, Gil and Chen.** Their pronouns in the plan are correct.
Sahar setting the Principle is a useful rotation. Liron can press the value of a
named policy while Sahar asks what the actual caller needs; neither needs to win
by biography.

The risk is not the headcount but expert ownership: Sahar states the rule and
supplies the hybrid, Liron supplies the abstraction, Dafna makes the mistake, and
Gil/Chen merely report results. Give the professionals the repair work. Dafna
should implement her corrected fold and answer the short-circuiting alternative;
Gil should test the strongest loop *including its reason*, and his data should
change a claim. Sahar can make one short proposal without teaching the full
implementation. Liron needs a caller, not a parable as a substitute for one.

Linoy is optional. If included, give her the discriminant/optional-property
contrast as useful work, not a surprise iterator API that is immediately rejected.
The iterator observation can be one Take. Six speakers plus all six technical
mechanisms would turn this into a catalogue; five speakers and a smaller mechanism
budget are preferable.

## 7. Technical confirmations and scope cuts

| Planned mechanism | Probe result / recommendation |
|---|---|
| Discriminant inference | Confirmed. `filter(p => p.status === "ready")` produces `Ready[]`; account access compiles. |
| Combined predicate | Additional finding: adding `&& p.currency === "USD"` to that same filter loses the inferred narrowing in these types; following account access is TS2339. Separate status and currency filters compile. Keep the stages if showing that win. |
| Optional property | Confirmed TS18048 on filtered row property access. Loop, `flatMap` and map-field/filter/map repairs compile. `flatMap` can preserve the row ID too; don't offer a fix that drops data the caller needs. |
| Empty accumulator | `{}` gives TS7053; `[]` gives TS2345/`never`. Narrow the wording: reduce does not always need an explicit accumulator type. A numeric seed or a separately typed array seed infers correctly. One Take at most. |
| `forEach` break | Confirmed TS1107. It establishes a callback boundary, not the absence of other stopping operations. Optional one-line Take. |
| Iterator helpers | `take` is TS2339 under the book profile and compiles with `lib: ["ES2025"]`. Installed Node has map/filter/take/drop/reduce/toArray but no takeWhile. One-result lazy test invokes map and filter once. A lib choice supplies declarations, not runtime support. |
| Stop/skip and repairs | Confirmed including empty queue, exact equality, first-item excess, the insufficient two-item fixture, held-row order, typed reasons and separate visit counts. |

The official [TypeScript 5.5 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates)
explain inferred predicates and their conditions; the results above were actually
compiled on **7.0.2**, not inferred from the historical notes. Current
[Iterator prototype specification](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-iterator-prototype)
and the installed-runtime probe are separate evidence; don't promise the runtime
implements everything in the latest specification.

Keep the discriminant filter in the main example. If the optional-property case
appears, use a payout field or a short Take, not a second refund story. Drop the
empty-seed or iterator detour before crowding out the disputed policy. The latter
is much more important than collecting five diagnostic codes.

## 8. Probe provenance and proposed validation

Untracked files in this worktree:

- `.probe/codex/mechanisms.cjs`: 13 compiler cases via `checks/compiler.cjs`.
- `.probe/codex/compiler-results.json`: actual diagnostic codes, lines and text.
- `.probe/codex/runtime.cjs`: 12 runtime groups, including the next-day
  counterexample, held ordering, four traversal profiles and async transfer.
- `.probe/codex/runtime-results.json`: exact outputs and counts.

Reproduce with `node .probe/codex/mechanisms.cjs` and
`node .probe/codex/runtime.cjs` after the locked install. Generated TS files and
configs stay below `.probe/codex/cases/`. No production files, payment systems or
external services are exercised.

For the future durable suite: extract the actual manuscript, preserve each
competing stage separately, assert exact diagnostics only where printed, and pin
selected IDs **and** total **and** stop reason. Check ineligible rows before and
after the blocker; equal budget, empty input and exhausted input; repeated calls
without leaked accumulator state; the real next-day policy comparison if adopted;
and distinguish eligibility work, reducer callbacks and budget comparisons. Keep
assumptions about positive amounts, stable ordering and daily reset explicit.

## Settlement requested before drafting

1. Keep daily-reset payouts and narrow the incident to overtaking, or deliberately
   change the funding model if multi-day starvation is essential.
2. Accept the operation-specific Principle and strongest loop/helper repairs;
   decide whether held-row ordering belongs in the Debate rather than a Turn.
3. Choose the actual open decision: the explicit priority-policy change (my
   recommendation), a demonstrated consumer/API split, or a local Verdict with
   a separate discussion of the Act III requirement. Do not manufacture a draw
   from equivalent implementations.
4. Confirm the five-person cast and a reduced technical mechanism budget.

Local challenge commit only. No chapter draft, durable chapter suite, push or
changes to the proposed plan in this round.
