# Chapter 20 — Currying and Partial Application (working title)

Status: **PROPOSED**, 2026-10-23. Awaiting Codex's challenge.
Branch: `codex/chapter-20-currying`, based on `origin/main` `388d9d8`.
File: `book/03-patterns-and-design/07-currying-partial-application.md`.

## This chapter's first job: an honest "The Debate Continues"

Act III still owes one. Ch18 and Ch19 each planned for it, and each room honestly converged. Ch19's
[ending settlement](ch19/CLAUDE-ENDING-SETTLEMENT.md) moved it here with a condition: this plan must
choose the open decision and its conditions **before** drafting, rather than hope one emerges.

**What counts as honest:**
- The decision belongs to people in the room, and both answers are correct code after any bug is
  fixed.
- It depends on conditions the scenes show happening, with a cost each way that lands on someone
  specific. The ending introduces no new conditions.
- It stays open because competent owners weigh those costs differently, not because data is missing
  or someone is shy.
- No mechanism the room knows of removes the trade-off for everyone. If one does, the room must use
  it, and then there is no open ending.

**The challenge must attack the ending first,** before the scenario details. If Codex finds a
convergence the plan misses, say so with evidence; we redesign the decision before drafting. Don't
draft toward a Verdict and move the debt a third time.

## What earlier chapters already settle (do not repeat)

- **Ch15:** branded scalars, and where they're constructed. Ch20 may use a brand in one exchange (see
  mechanism 2) but must not re-argue branding.
- **Ch17–18:** closures that capture a value, purity and hidden inputs. A curried function closes
  over its first argument; that needs no purity argument.
- **Ch19:** `filter`/`map` vs loops, inferred predicates, stop vs skip. Don't re-argue the form of
  iteration.

**Later chapters to stay clear of:**
- **Ch21, higher-order function patterns:** no `compose`/`pipe` teaching, no wrappers (retry,
  memoize, logging decorators). A two-line `pipe` may appear only if a mechanism needs a call
  context, and then without discussion of composition.
- **Ch22, config to function:** no replacing configuration objects or flags with injected functions,
  and no dependency injection through closures. This chapter is about argument shape, not strategy.
- **Ch23, monads light:** no fp libraries. No claims about Ramda, Remeda, fp-ts or any other
  library's API unless Codex verifies a primary source, and then one line at most.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

Claude's probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`,
untracked.

1. **`map` passes the index, and a numeric second parameter takes it.**
   - `const applyDiscount = (price: number, percent = 0) => …; [100, 100, 100].map(applyDiscount)`
     compiles and returns `[100, 99, 98]`.
   - **Making the parameter required doesn't help:** `(price: number, percent: number) => …` also
     compiles with `map`.
   - `["10", "10", "10"].map(parseInt)` returns `[10, NaN, 2]`. That's the famous case; the
     chapter should use its own, not this.
   - A curried `discountBy(10)` is unary, so `prices.map(discountBy(10))` can't receive the index.
2. **A brand on that parameter catches it.** With `discount?: Percent` (a branded number),
   `lines.map(lineTotal)` fails with `TS2345: … Types of parameters 'discount' and 'index' are
   incompatible. Type 'number' is not assignable to type 'Percent'.`
   **This is the main convergence threat** to an ending built on mechanism 1. See the ending
   section.
3. **A data-last generic helper loses inference when applied without its data.**
   - `const mapEach = <T, U>(f: (t: T) => U) => (xs: readonly T[]) => xs.map(f);`
     `mapEach(r => r.amount)` fails with `TS18046: 'r' is of type 'unknown'.`
   - In a call that supplies the data type first (`pipe2(rows, mapEach(r => r.amount))`) it
     infers.
   - Annotating works: `mapEach((r: Row) => r.amount)`.
   - Data-first `mapFirst(rows, r => r.amount)` infers.
4. **TypeScript has no partial explicit type arguments; currying is the usual workaround.**
   - `const pick2 = <Row, K extends keyof Row>(key: K) => …; pick2<Order>("total")` fails with
     `TS2558: Expected 2 type arguments, but got 1.`
   - `const field = <Row>() => <K extends keyof Row>(key: K) => (row: Row): Row[K] => row[key];`
     `field<Order>()("total")` infers `K`, returns `(row: Order) => number`, and rejects a typo with
     `TS2345: Argument of type '"totl"' is not assignable to parameter of type 'keyof Order'.`
5. **Generic and overloaded functions through `bind` and a `curry` helper.**
   - A `curry2 = <A, B, R>(f: (a: A, b: B) => R) => (a: A) => (b: B): R => f(a, b)` keeps a generic
     function generic: `curry2(pair)` is `<T>(a: T) => (b: T) => [T, T]`, and `cPair("x")(3)` fails
     with TS2345.
   - `pair.bind(null, "x")` doesn't: its type is `(b: unknown) => [unknown, unknown]`, so
     `bPair(3)` compiles.
   - Both keep only the **last** overload of an overloaded function. For
     `convert(number, number): number` followed by `convert(readonly number[], number): number[]`,
     `curry2(convert)` is `(a: readonly number[]) => (b: number) => number[]`, and
     `convert.bind(null, 5)` fails with TS2345.
6. **Inferred predicates survive a factory, but not a generic one.**
   - `const hasStatus = (s: "ready") => (p: Payout) => p.status === s` returns
     `(p: Payout) => p is Ready`, so `q.filter(hasStatus("ready")).map(p => p.account)` compiles.
   - With `<S extends Payout["status"]>(s: S)`, the `map` fails with `TS2339: Property 'account'
     does not exist on type 'Payout'.`
   - Optional. Ch19 owns inferred predicates; this is at most a Take.
7. **The returned arrow has no name.**
   - `const rateFor = (rate) => (amount) => { throw … }`: `rateFor(2).name` is `""`, and the stack
     frame reads `at file:///…:3:63` with no function name.
   - A named inner function (`return function convertAtRate(amount) {…}`, or a `const` assigned
     before it's returned) shows `at convertAtRate (…)`.
   - Gilad's kind of evidence. Don't overclaim: line and column are still there.

## Candidate decision and scenario

Codex may replace this. Whatever replaces it must keep the ending's honesty requirements above.

**A shared pricing module has two consuming teams.**
- **Reporting** builds daily statements. The discount or rate is fixed for the whole run, and the
  module's functions are passed to `map` over thousands of lines.
- **Checkout** prices one cart per request. It has the line and the discount at the same moment and
  calls each function once.

**The incident (mechanism 1).** Someone on reporting tidies `lines.map(line => lineTotal(line))` to
`lines.map(lineTotal)`, where `lineTotal(line, discount = 0)`. It compiles. Line 1 is undiscounted,
line 2 gets 1% off, line 3 gets 2%. Single-line statements are correct, and the fixtures were
single-line. Gil finds it with a count, not a dashboard: statement totals differ from a
recomputation by a pattern that matches line position. The tidy-up is competent: it's the change
the book's declarative lean recommends.

**The repairs, each in its strongest form:**
- **Curry the configuration first:** `discountedBy(percent)(line)`. Unary by construction, and it
  reads well in reporting's `map`. The cost is checkout's `lineTotal(0)(line)` or a second export.
- **Keep the plain function and write the arrow at the call site.** The cost is that nothing stops
  the next tidy-up.
- **Brand the parameter (mechanism 2).** It catches this caller without changing the shape. The
  cost is branding every numeric parameter that could receive an index (quantities, digits, rates),
  and constructing those values at every boundary. That is Ch15's cost, stated in one exchange, not
  re-argued.
- **A lint rule against passing function references to array methods.** Only if Codex verifies one
  exists and its behaviour on the book's toolchain, from a primary source. Otherwise leave it out.

**The open decision:** the module's convention for functions with one argument that callers fix
ahead of time. Configuration-first and curried, data-first and plain, or both exports.

**Conditions the scenes must show before the ending (chosen now):**
1. **The call-site census.** Gil counts, per team, the calls that fix the configuration and pass
   the function to an array method, and the calls that have both values at once. The two teams'
   numbers point in opposite directions.
2. **What each shape leaves exposed:**
   - plain: the index hazard, unless every exposed parameter is branded;
   - curried: anonymous frames unless the inner function is named (mechanism 7); the reversed
     argument order against the module's existing data-first functions; and, for the module's one
     generic helper, if there is one, the inference loss of mechanism 3.
3. **Who pays:** reporting pays the plain shape's hazard; checkout pays the curried shape's ceremony;
   both exports cost two names per rule, and every future caller must pick one. Sahar removes;
   Liron names the pattern. Their bios already disagree here.

**Why I think it stays open, and where it might not:**
- **Branding** could make the plain shape safe for everyone. It doesn't stay open if the room
  would honestly brand those parameters anyway after Ch15. Codex should test that against the
  module's actual parameters: a brand earns its place for a scalar with a meaning, and it is
  overkill for one that only an index would ever collide with.
- **Both exports** could be the obvious convergence. It's only open if the cost of two names is
  demonstrated, for example a later caller choosing the wrong one, and not merely asserted.
- **If either holds,** the alternative open decision is mechanism 4: whether a generic helper takes
  `field<Order>()("total")` (curried for its type arguments) or a value to infer from. Its
  conditions: whether callers have a value to infer from, and who reads the `()` in a review. Codex
  should say which of the two decisions is more honestly open, with evidence.

## Principle (must be stated, in an expert's words, before the scenario)

**Daniel Compiler**, who has not set an Act III Principle. Act III's have been Liron (twice), Eli
(twice), Gilad and Sahar. Daniel is right for a chapter whose costs show up in what the compiler
infers and accepts.

**Its direction, not its wording:** an argument order is an API decision about who fixes what, and
when. Curry when callers really fix the first argument ahead of time, and the function they get
back is used as a value. Check what the compiler infers at the partial application, not only at the
full call. And a function passed to an array method receives every argument that method passes.

**It must not pre-decide the open decision.** The Principle gives the reader a way to ask the
question; the chapter shows where competent people still answer it differently. If the Principle
settles the ending, one of them is wrong.

**Principle-only reader cases:**
- a plain two-argument function passed to `map`, where the second parameter is a number (mechanism
  1);
- a data-last generic helper partially applied with no data in sight (mechanism 3);
- a helper that needs one explicit type argument and infers the rest (mechanism 4);
- **transfer:** an event-handler registry where some callers fix the event name ahead of time and
  others don't. The chapter needn't show it.

## Cast

- **Daniel Compiler** (he): the Principle, and the compiler's evidence on mechanisms 3–5.
- **Gil Benchmark** (he): the incident's count and the call-site census.
- **Two professionals who own the two consuming teams.** Codex chooses, with a reason. Candidates:
  - **Dima Bridge** (he): no Act III appearance yet. He mustn't be the synthesizer who dissolves the
    debate; give him a side he takes because of what he owns.
  - **Noam Kiperman** (he): the brand, if mechanism 2 is in the scenes.
  - **Linoy Nightly** (she), **Guy Singleton** (he) or **Idan Greenfield** (she), if their bios
    fit what they own.
- **Sahar Firstclass** (he) and **Liron Closure** (he): optional, sparing, only if the both-exports
  argument is theirs.
- **Gilad Stacktrace** (he): optional, for mechanism 7.

**Rested:**
- **Dafna:** central in four of the last six chapters. A line is fine; she must not own a side.
- **Eden:** five of the last six.
- **Oded:** three of the last six.
- **Chen:** two of the last three.

Five or six people. Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- The person who tidies the `map` is competent.
- One running scenario, small integers, and every fence checked.
- No timing claims; counts are fine.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter20.cjs`: compile every TS fence on the book profile, with competing shapes as separate
programs.

Runtime groups:
- the incident: index-as-discount totals, plus the single-line fixture that hid it;
- each repair against the same statement;
- the census numbers, if the text derives them from printed data;
- stack frame naming (mechanism 7), if used, asserting only what the text claims.

Compiler cases:
- every intentional diagnostic the text quotes, verbatim;
- the success cases the text relies on (unary curried form in `map`, the inference in a data
  context, the curried type-argument workaround), with selected inferred types asserted.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers:**
- an isolated Principle-only reader with the four cases above;
- a fresh full reader;
- **an ending-only check:** a fresh reader with the full chapter who is asked to argue that the
  ending should have been a Verdict. If they can, it isn't open.

## Completion

- [ ] Codex challenges this plan, ending first; disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only, fresh full and ending-only readers.
- [ ] Checks durable; full suite green.
- [ ] Ready for the author's review.
