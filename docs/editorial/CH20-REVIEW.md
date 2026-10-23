# Chapter 20 self-review — Before the First Line

Status: **DRAFT 2 FROZEN; TARGETED RECHECK PENDING**, 2026-10-23.

Manuscript SHA-256:
`80c6362ecf6930fdb69eb465ee5569e74eae9355be8545e62cab4c457742098a`.
**2,376 words**, including code; **15 TypeScript fences**.
[Draft-2 snapshot](ch20/DRAFT2-SNAPSHOT.json). The draft-1 snapshot is unchanged.

`npm ci --offline` and final `npm run check` both **exit 0**, TypeScript **7.0.2**,
Node **v22.23.3**. Ch20: **15 fences / 21 compiler cases / 18 runtime groups**.
Whole book: **361 / 478 / 195**, plus two compiler-default cases and two searches.
The full run followed all manuscript and validator changes; neither changed
subsequently. `git diff --check` is clean. The local log is
`.probe/ch20-draft2-full-check.log` and is not committed.

## Response to Claude's draft-1 review

Reviewed [CLAUDE-REVIEW](ch20/CLAUDE-REVIEW.md) and both verbatim reader reports
from `2076fa2`. The main findings are accepted. One precise type-display suggestion
is corrected on the book profile, as noted below.

1. **Optional callback parameter.** Noam explicitly limits the assignment check
   to required parameters, then catches the renderers passing `price` directly to
   `map`. A printed factory returning an optional-extra-discount function still
   fits `PriceLine` and produces `100,99,98`. Linoy replaces both renderer bodies
   with arrows forwarding just the line; the same factory then gives
   `100,100,100`. These are two new manuscript fences with compiler and runtime
   cases. The Turn and final count/alternative fixtures use the repaired renderers;
   the original programs remain to reproduce the pre-repair behavior. The Verdict
   also names the single-line forwarding obligation.
2. **Opaque prepared value.** Noam proposes a validated opaque `PreparedPromotion`
   and `pricePrepared(line, prepared)`. Dima accepts it as a working way to hide
   representation and validate once. Linoy prefers receiving the function her
   consumers already need, without the prepared type and a separate evaluation
   entry point. This is a local preference, not a claim that the opaque alternative
   is unsafe or repeats preparation. Its fixture has a private constructor and
   private state, checked creation and consumption, the same 1/3/6 counts and early
   invalid-input rejection. Constructor access and a forged empty handle are
   rejected. No memoization or promotion-keyed store was introduced.
3. **Failure handling.** Cut the return-type sentence that suggested a Result
   redesign. Dima still makes setup responsible for the thrown validation failure;
   Noam's existing Verdict line keeps the empty-invalid regression. No extra
   Result-versus-exception exchange or duplicate test request remains.
4. **Principle.** It now names and distinguishes currying and partial application,
   recommends a local arrow for holding an argument, and puts preparation with
   the package that owns the work. It replaces “call boundary” and “commits to”
   with the actual calls/work/types involved and explicitly names `map`'s three
   arguments. Both requested Daniel lines survive. Moving the definitions here
   frees his debate line for a brief reaction to removing and restoring the arrow.
5. **Reread snags.** The opening establishes the old one-item fixture. Daniel
   names `map` as the caller supplying the second argument. Linoy explicitly
   proposes replacing the two-argument API before Dima objects. Gil supplies a
   regression-test motive, names the invalid promotion and attributes his reply
   in the Turn. The narration says the adapter never runs on an empty list.
6. **Diagnostics and inference.** Error comments now print TS2345/TS2353 only;
   dialogue explains their meaning. The validator retains exact line/code checks
   and relevant diagnostic elaborations. The Take describes the inferred union
   and optional missing properties without copying a flag-dependent display.
   **Correction to the reader:** with `exactOptionalPropertyTypes: true`, TS7 emits
   `{ a: number; b?: never } | { a?: never; b: number }`. The suggested optional
   `undefined` spelling is emitted with that flag false. Both declarations were
   independently checked in `.probe/draft2-union/`; the durable suite asserts the
   exact inferred tuple under the book profile. This changes no conclusion about
   early type inference.
7. **Narration and economy.** Linoy's ticket now introduces tiers; Dima owns the
   validated-line premise and private helpers; Gil scopes his own count table.
   The authorial rounding sentence and the redundant lookup-function exchange
   are cut. The latter's existing fixture remains a private-representation
   regression, clearly labelled in the coverage notes. Batch and lazy alternatives
   remain; Gil's opaque timing remark is removed. No cast member, inference topic,
   Take or memo-cache discussion was added.

## Recheck scope

The local Verdict, package-versus-consumer ownership, 6-to-1 preparation result
and setup-time validation choice remain as settled. The self-check finds the
optional-parameter counterexample and opaque-value comparison answered in the
scene, rather than hidden in fixtures. This is not an independent reader verdict.
Claude's new Principle-only reader and targeted full-reader recheck are pending.

The three Claude review/reader files from `2076fa2` remain untouched. The early
Principle-only reader's stated TypeScript 5 run is not relabelled as TS7 evidence;
the chapter's compiler/runtime claims use the locked toolchain above.

---

## Historical draft-1 self-review


Status: **DRAFT 1 FROZEN; INDEPENDENT REVIEW PENDING**, 2026-10-23.

Manuscript SHA-256:
`b75fc8a61ea816007359b7780814c324c613dddff9cbcee8fb9ee264be2d05aa`.
**2,309 words**, including code; **13 TypeScript fences**.
[Exact snapshot](ch20/DRAFT1-SNAPSHOT.json).

## Scope and validation

The governing ending decision is `15b0325`, following the accepted
[plan challenge](ch20/CODEX-PLAN-CHALLENGE.md) and
[bounded ending probe](ch20/CODEX-ENDING-PROBE.md). The local Verdict is deliberate;
Act III's open-ending requirement remains with Ch22. This draft does not attempt
to reopen the rejected trade-off.

- `npm ci --offline`: **exit 0**.
- Final `npm run check`: **exit 0**, TypeScript **7.0.2**, Node **v22.23.3**.
- Ch20: **13 fences / 17 compiler cases / 15 runtime groups**.
- Whole book: **359 fences / 474 compiler cases / 192 runtime groups**, plus two
  compiler-default cases and two source searches.
- `git diff --check`: clean.

The final full run followed the last prose clarification and the added
no-discount compatibility assertions. No manuscript or validator edit followed
it. The log is local scratch evidence, `.probe/ch20-draft1-full-check.log`, and is
not committed. All fence hashes and the validator hash are in the snapshot.

## Self-review against the writing guide

### Principle and onboarding

Daniel states a call-boundary rule before the incident: choose a useful result
or function at each call, account for work/failure/type arguments fixed there,
and check the arguments supplied by its next caller. This gives a reason to
partially apply an ordinary function without imposing a curried public API.

The author's Principle-only self-check yields:

- `map` case: inspect the callback caller's arguments before dropping an arrow;
- a callback generic without data: check inference at the first call rather than
  assuming later data will repair it;
- explicit type arguments followed by inferred ones: consider a separate call
  to fix the first type argument;
- registry transfer: use the caller that already knows the event to fix it, while
  preserving direct calls where both inputs are available.

This is **not an independent reader result**. Claude's fresh Principle-only and
full readers are pending. The wording does not itself teach every inference
mechanism in those transfer cases.

The package owner, checkout/reporting purposes, default discount and successful
calls precede the index failure. `PriceLine`, both consumers and their expected
outputs precede the adapter discussion. Quantity tiers explain replacing the
flat discount; they are not claimed to be necessary to fix `map`. Private
preparation and its complete implementation precede `priceWith`. The returned
callback is visibly stored and used before its compatibility obligation is raised.

### Repair choice and fairness

**Chose the options-shaped repair.** Naming the discount rejects the numeric
index and retains the default no-discount call. It avoids another branded-number
construction discussion after Ch15. Noam's role changes accordingly: he asks for
a rejected bad call, then checks the stored callable promise and failure timing.
He does not need to oppose the options parameter to remain useful.

Dima offers the strongest plain alternative: a reusable reporting-owned arrow,
then acknowledges that both exports can delegate to one calculation. Linoy has
to supply a package-owned preparation need before he accepts the public factory.
The calculation and three-line inputs are held constant across the direct and
staged tier variants.

Batch pricing receives a fair hearing and ties the preparation count if reporting
collects all six evaluations. It changes the existing function-valued handoff;
two separate three-line batches prepare twice. Lazy preparation is also working
code in the fixture: it prepares once on first use and leaves an invalid empty
run unvalidated. Neither alternative is dismissed as broken.

The package's extra contract is demonstrated by a stored `PriceLine`. A fixture
mutation adds a required argument to the returned callback and rejects that
assignment while a direct wrapper can still adapt internally. No future tracing
requirement is invented in the chapter. A private lookup implementation preserves
the existing consumer types and prices.

### Turn and ruling

Validation timing changes the decision, rather than introducing another index
example. The old adapter produces an empty statement without validation; creating
the factory rejects an invalid promotion before any evaluation. The operator's
promotion-setup step is established earlier. Linoy chooses to report the error
there even on an empty run; Dima makes that setup caller responsible for it.

The final prose clarification removed an unestablished claim about a previous
renderer error handler. The text now states the required handling location
without inventing existing infrastructure.

The Verdict publishes this staged helper, preserves checkout's direct function,
and keeps ordinary adapters local unless they earn a shared entry point. Noam
asks for the empty-invalid case to survive in tests. The chapter does not pretend
the owners still disagree after their requirements are met.

### Voice and economy

Cast: Daniel, Linoy, Dima, Noam and Gil, with the settled ownership. Pronouns match
the biographies. Dima defends checkout and the package's boundary rather than
serving as a mediator. Linoy pushes the reusable API and then has to distinguish
her first arrow from the actual preparation. Noam follows accepted types through
to the caller that will discover a failure. Gil counts operations, explicitly
leaving elapsed time unmeasured. Daniel explains mechanisms and does not decide
the package convention.

The Ch7 calibration informed concrete questions and local misunderstandings:
Linoy's zero was the index, not her default; making the numeric parameter required
still accepts this caller. The prose does not restore catchphrase quotas or
narrate who wins. Whether the exchange is sufficiently lively is for the fresh
full read, not established by these checks.

There is **one inference issue in one Take**: the generic pair can infer from both
arguments together, while the manually curried form fixes its type at the first
call. The explicit-union answer works. No generic `curry2`, `field<Order>()`,
predicate factory, overload survey, library claim or separate naming Take was
added. The main factory names its returned function without teaching stack traces.

## Validator adaptations and limits

Every fence is uniquely extracted. Repeated definitions are compiled at their
respective points in the timeline. Intentional-error lines remain in diagnostic
programs and are omitted only from positive runtime variants. Printed compiler
excerpts are checked against actual messages.

Preparation/validation/evaluation counters are inserted into the manuscript's
bodies. The table measures the two reporting consumers, excluding the separately
printed checkout call. The retained no-discount calls, all annotated console
outputs, empty cases, tier bounds, duplicate minimums, highest-qualifying tier,
private import and factory-as-callback rejection are checked. Batch, lazy and
lookup alternatives are explicit fixture implementations of the prose proposals.

The report functions are executable models of the consumers' pricing calls,
not a UI or a complete document generator. Inputs are prevalidated lines, with
small prices avoiding rounding. The suite does not test production throughput,
operator error display, mutation during a promotion run, caching or currencies.
No snapshot-versus-live dispute is needed for the result.

## Handoff

Ready for Claude's fresh Principle-only and full readers and formal review.
Supply the readers only the manuscript and prerequisites, not this self-review
or the ending-probe records. Areas worth independent judgment: the transition
from the repaired flat discount to tiers, whether the currying/partial-application
distinction is clear before staging, and whether the Turn's setup-time choice is
understandable without a real UI. These are review questions, not asserted defects.

The plan, master status, editorial index and checks documentation now describe a
checked draft awaiting review. No joint approval, push or PR is claimed.
