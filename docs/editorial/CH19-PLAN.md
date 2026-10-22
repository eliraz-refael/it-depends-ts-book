# Chapter 19 — Imperative vs Declarative (working title)

Status: **DRAFT 2 FROZEN; TARGETED RECHECKS PENDING**, 2026-10-22. The plan settlement and subsequent ending settlement below govern the original proposal.
Branch: `codex/chapter-19-imperative-declarative`, based on `origin/main` `ffc75c7`.
File: `book/03-patterns-and-design/06-imperative-vs-declarative.md`.

## What earlier chapters already settle (do not repeat)

- **Ch5:** type predicates, including one that lies and still compiles, and `inputs.filter(isUser)`.
  Ch19 may use TypeScript's *inferred* predicates (below), but must not re-argue explicit ones.
- **Ch17:** a `reduce` that spreads its accumulator copies quadratically (Gil's Take), and "mutation
  inside the `reduce` callback would avoid the repeated copies too". Don't recount copies. If a fence
  spreads an accumulator, either push to a local array or give it a clause.
- **Ch18:** a callback that reads or writes state its caller didn't pass is impure. A clause of
  callback is fine; don't re-argue purity.

**Later chapters to stay clear of:**
- **Ch20, currying:** no curried helper such as `releaseWithin(limit)(amountOf)`.
- **Ch21, higher-order function patterns:** one small helper can appear and be argued over. Don't
  teach how to design HOFs.
- **Ch23, monads light:** no `Option`/`Either`/pipe libraries.
- **Part IV's performance chapter:** no timing claims. Counts of elements evaluated are fine.

The prologue says the book leans "declarative over imperative". This chapter tests that lean, and
mustn't just confirm or betray it.

## Principle (must be stated, in an expert's words, before the scenario)

**Sahar Firstclass**, who has never set a Principle. Act III's have been Liron (twice), Eli (twice)
and Gilad. Roughly, in his voice, not verbatim:

> Before you rewrite a loop as a pipeline, or a pipeline as a loop, list the rules the code keeps that
> aren't about one element: when it stops, what it carries from one element to the next, and in what
> order its effects happen. A chain of per-element steps puts each element rule where a reader can
> see it. It has no place for a sequence rule unless you build one. A loop has a place for every
> rule, and mixes them together. Choose the form that keeps each rule where the next reader will look
> for it, and check that the rewrite still keeps every rule on the list.

**Testable form:** given a loop and a proposed rewrite, a reader can list the sequence rules and say
whether the rewrite keeps them. The Principle-only reader must be able to do that. Hard cases:
- a loop that `break`s when a running total would pass a limit, rewritten as a `reduce` that skips
  any item that doesn't fit;
- a loop that only filters and transforms each element. The Principle must let the reader prefer the
  pipeline here, not stay neutral;
- a loop that `continue`s past rows with no optional field and then reads that field, rewritten as
  `filter(...).map(...)` (mechanism 2);
- **transfer:** a sequential `for … of` with `await`, rewritten as `Promise.all(items.map(...))`. Order
  of effects is on the list. The chapter needn't show this one.

**It must not pre-decide the form.** The book's declarative lean should survive where the rules are
per-element.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

Claude's probes are in the session scratchpad (not tracked). Codex reproduces them in `.probe/`,
untracked.

1. **Inferred type predicates work on a discriminant.** With
   `Payout = { status: "ready"; account: … } | { status: "held"; reason: string }`,
   `queue.filter(p => p.status === "ready").map(p => p.account.iban)` compiles. The pipeline gets the
   loop's narrowing for this case.
2. **They don't narrow an optional property.**
   - `rows.filter(r => r.refund !== undefined).map(r => r.refund.amount)` fails with
     `TS18048: 'r.refund' is possibly 'undefined'.`
   - A loop with `if (r.refund === undefined) continue;` followed by `r.refund.amount` compiles.
   - So do `flatMap(r => r.refund === undefined ? [] : [r.refund.amount])` and
     `map(r => r.refund).filter(f => f !== undefined).map(f => f.amount)`.
3. **`reduce` needs its accumulator type stated.**
   - An initial `{}` written by index gives `TS7053: Element implicitly has an 'any' type because
     expression of type 'string' can't be used to index type '{}'.`
   - An initial `[]` gives `TS2345: Argument of type 'string' is not assignable to parameter of type
     'never'.`

   One Take at most. Ch17 already printed `reduce<Record<string, number>>`.
4. **`break` can't leave `forEach`:** `TS1107: Jump target cannot cross function boundary.` One line
   at most.
5. **Iterator helpers: the runtime has them, the book's lib doesn't.**
   - `queue.values().take(2).toArray()` fails under the ES2022 lib with `TS2339: Property 'take' does
     not exist on type 'ArrayIterator<Payout>'.`, and compiles with `--lib es2025`.
   - Node 22.23.3 has `map`, `filter`, `take`, `drop`, `reduce` and `toArray` on `Iterator.prototype`,
     but no `takeWhile`.
   - The helpers are lazy: `values().map(f).filter(g).take(1)` called `f` once on a three-element
     array.

   Changing the lib is a project decision, which is Eden's kind of question. Make no claim about
   future proposals unless Codex verifies a primary source.
6. **Stop vs skip.** Queue `[P1 400, P2 900, P3 200, P4 300]`, limit 1,000:
   - a loop that `break`s at the first payout that doesn't fit releases `P1`;
   - a `filter` or `reduce` that skips payouts that don't fit releases `P1,P3,P4`.

   Two pipeline forms keep "stop", and both release `P1`:
   - a pure `reduce` over `{ kind: "open", total, released } | { kind: "closed", … }`, which visits
     every element after closing;
   - `findIndex` on a running total plus `slice`, which stops early but mutates a counter in its
     callback.

## Disputed decision and scenario

Codex may replace this with a better one in the challenge. Whatever replaces it must have a real
sequence rule, a pipeline rewrite with real wins, and a competent mistake.

**A marketplace pays sellers from one treasury account, with a daily release limit.**
- Payouts are queued oldest first.
- The batch **stops** at the first payout that doesn't fit, so an old large payout isn't starved by
  newer small ones. That rule exists; nobody wrote it down. It lives in a `break`.

**Why the rewrite is reasonable.**
- The loop has grown: held accounts, a minimum amount, a currency check, and the limit, all in one
  body.
- Dafna turns the element rules into named filters. With inferred predicates (mechanism 1), the
  types follow the stages, and per-element tests become trivial. That is a real improvement, and
  the chapter should say so.
- The limit becomes a pure `reduce`: "if it fits, add it; otherwise keep the batch as it is." That's
  readable and pure, and it **skips**. Mechanism 6. Dafna isn't careless, and she doesn't write an
  impure filter.

**The failure.**
- A seller's large payout waits for days while smaller, newer payouts go out under it.
- Nothing errors, and every batch is under the limit.
- The tests passed because no fixture had an oversized payout followed by smaller ones.
- Who finds it is for the scene. Gil's evidence could do it, for example the age of the oldest
  unreleased payout, as a count, not a dashboard.

**Repairs.** Each needs its strongest competent version, run against the same queue.
- **Sahar:** a pipeline for the element rules and a short loop for the limit. The `break` is the
  rule, and a comment names it.
- **Dafna:** the closed-state `reduce`. The rule becomes a value in a type, so a test can see why the
  batch ended. Cost: it visits the rest of the queue, as a count.
- **Liron:** a small helper whose name says "stop", reusable for other running-limit rules. Cost: a
  helper with one caller. That is the tension in his and Sahar's bios.
- **Linoy (optional, one exchange or a Take):** lazy iterator helpers. They have no `takeWhile`, and
  the book profile's lib rejects them (mechanism 5). Eden-style project cost, without adding Eden.

**Turn (candidate, optional): Chen asks whether a held payout at the front stops the batch.**
- In the loop, the answer depends on whether the held check comes before or after the limit check.
- In the pipeline, it depends on whether `filter(ready)` comes before the limit stage.
- Both forms encode it by order. Neither states it unless someone does.
- This tests the Principle against its own champion: a sequence rule can hide inside a pipeline
  too.
- If Codex finds a better Turn, or none, argue it in the challenge.

## Ending: this chapter is the planned home of Act III's open-ending debt

Act III still owes an honest "The Debate Continues". Ch18 moved it here. **The debt doesn't license
a false open ending.** It needs a decision the scenes leave open, under conditions the text
exercised.

**The live candidate:** Sahar's local loop vs Liron's named helper (or Dafna's typed state), after
the bug is fixed either way. Conditions the scenes could exercise:
- how many running-limit rules the codebase has;
- whether a test or log needs to know why the batch ended;
- whether new readers will find a `break` or a stage name first.

Show each condition; don't list them only at the end.

**If the room honestly converges,** say so in the challenge, and propose where else in this chapter
an open decision lives. Don't write a Verdict and move the debt again without that conversation.

## Cast

- **Sahar Firstclass** (he): expert, the Principle, and the hybrid. Sparing.
- **Liron Closure** (he): expert, the helper. Sparing.
- **Dafna Functor** (she): the rewrite and the closed-state `reduce`.
- **Gil Benchmark** (he): the evidence. Counts only.
- **Chen Override** (he): the Turn.
- **Linoy Nightly** (she): optional, iterator helpers.

Six is the top of the guide's range. Five without Linoy is fine.

**Not included, for Act III variety:**
- **Guy:** Dafna and Guy were the main pair in Ch14 and Ch17.
- **Oded and Eden:** three or four of the last five chapters each.
- **Eli:** set the last Principle.
- **Idan:** her bio says she has no opinions about your `reduce`.
- **Noam, Daniel, Dima, Gilad:** not needed. If Codex wants Noam for the typed-state argument
  instead of Dafna, argue it in the challenge.

Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines. Dafna's "That's just a map" works only if something literally is.
- Dafna is not a punching bag. Her rewrite is mostly right, and her mistake is a competent one.
- Sahar is not the winner by default.
- One running scenario. Small integers. Every fence is checked.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter19.cjs`: compile every TS fence on the book profile, with competing repairs as separate
programs.

Runtime groups:
- the original loop, the skipping `reduce`, and each repair, against the same queue (mechanism 6),
  plus the fixture that hid the bug;
- the Turn's ordering variants, if used;
- element-visit counts, if the text compares them;
- iterator-helper laziness, if Linoy appears. Run it under a lib override in the harness, not the
  book profile.

Compiler cases:
- every intentional error the text quotes, verbatim (TS18048, TS7053, TS2345, TS1107 or TS2339,
  whichever are used);
- the inferred-predicate success.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

Readers: an isolated Principle-only reader with the four hard cases above, and a fresh full reader.
Both get prerequisites only.

## Completion

- [x] Codex challenges this plan; disagreements are settled on evidence.
- [x] Codex drafts and self-reviews; draft 2 follows the first formal review.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and final diff review.
- [x] Checks durable; full suite green on draft 2 (rerun after further review changes).
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-22)

Codex's [challenge](ch19/CODEX-PLAN-CHALLENGE.md) is accepted, with the decisions below. Where this
section conflicts with the proposal above, this section governs.

**Claude's own check of the central finding.** Session scratchpad, untracked.
- **The simulation:** a fixed daily allowance that resets each day, every amount at most the allowance,
  arrivals appended to the queue, payouts removed when paid. It compares the day each payout is paid
  under stop and under skip.
- **Under a fixed reset, skipping paid no payout later than stopping:**
  - 200,000 random cases;
  - all 78,125 cases of a four-payout opening queue plus one arrival on each of three later days,
    amounts 1–5, allowance 5.

  In many cases it paid some payouts earlier. That is evidence over those cases, not a proof. The
  chapter claims no more than the cases it shows or names.
- **Under a carry-forward balance** (unused allowance accrues), skipping can hold a large payout back.
  With 500 a day accruing, P2 = 900 at the front, a 400 behind it and a 450 arriving each day, stopping
  pays P2 on day 1 and skipping on day 7.

So the plan's starvation story was wrong, as Codex says. The next-day result is stronger than an
incident: it is the Turn.

1. **The incident is overtaking, not starvation.**
   - **The promise is stated before any code:** ready payouts in the account's currency above the
     minimum are released in queue order, and each day's allowance resets.
   - **Scope:** every eligible amount fits a fresh day's allowance. One clause; larger payouts take
     a separate path that the chapter doesn't show.
   - **The promise's owners:** the payouts team owns release order. Support quotes it to sellers, and
     a support reply saying so is on the page.
   - **Show an ordinary successful batch first.** The planner returns a batch plan, and submission
     stays outside the examples.
   - **The failure:** a seller sees newer payouts released while theirs waits, against what support
     told them. Gil brings the batch IDs and queue positions. No multi-day age story.
2. **The Principle:** Sahar, in the operation-specific direction of Codex's §2, not the proposal's
   categorical text.
   - Per-element decisions start with the operations that name them.
   - Before replacing a loop, check:
     - what one item changes for the next;
     - where processing stops;
     - what must happen in order.
   - Keep those rules visible in whichever form you choose.
   - "A callback returning is not the operation stopping" can stay if it reads naturally.
   - **Drop the evaluation-order clause** about eager `filter().map()`. No callback here has effects,
     and it would replay Ch18. The async case stays a Principle-only reader case.
   - **The reader cases stand:** stop vs skip, per-element only, the optional property and async
     order.
3. **Repairs, all in their strongest form, without a gallery.**
   - **Dafna's rewrite earns its stages before it fails.** These stay correct after the repair:
     - separate status and currency filters, with inferred narrowing;
     - per-rule tests.
   - **Her skipping fold** pushes to a fresh local array, not a spread.
   - **The loop returns the same typed stop reason as the fold.** The reason in a type is not the
     fold's exclusive advantage, and Sahar doesn't miss the early return.
   - **`findIndex` plus `slice`** (with the `-1` case), or `some`, gets one exchange: a stopping array
     operation exists. Whether a counter inside a callback reads more clearly than the loop is the
     question it raises.
   - **Liron's first proposal is the domain operation** `planPayouts(queue, allowance)`, behind
     which a loop or a fold is an implementation detail. No generic `prefixWithin<T>` unless a second
     algorithm appears, and none does.
   - **The Debate settles the refactor:** the change must restore stopping, and the room may converge
     on the planner's form. Say so plainly. Don't stage a contest between equivalent implementations.
4. **Held-row order is Chen's regression question inside the Debate,** not a Turn. Use H 1,200 then
   R1 600 and R2 500: eligibility first selects R1, and the limit first selects nobody. Every competent
   repair answers it by keeping the old order.
5. **The Turn is the next day.** Chen asks when the overtaken payout is actually paid. Gil runs the
   next days under both planners:
   - stop: P1, then P2, then P3 and P4;
   - skip: P1, P3 and P4, then P2.

   P2 is paid on day 2 either way. Gil then runs the cases he can name and finds no payout paid later
   under skip. The `break` kept a promise that protected nobody's payment date under this funding
   model. The question changes from how to restore the rule to whether to keep it.
   - **The refactor still restores stopping.** A refactor doesn't change the policy, and Dafna's
     broken rewrite isn't retroactively declared a product change. Keep the two decisions in separate
     scenes.
   - **Skipping is not optimal packing.** It fills more of this batch; claim nothing more general.
6. **The ending is The Debate Continues, on the explicit release-order policy.** The payouts team
   owns that policy, so the decision belongs to people in the room. It stays open because a
   condition it depends on is open, not because the room is shy.
   - **Fixed daily allowance (today):** skipping paid no one later in Gil's cases, and paid some
     earlier. Dafna argues to adopt it, on purpose this time.
   - **Carry-forward balance:** finance is considering it. Establish this in one line well before
     the ending. Under it, skipping can hold a large payout back for days, so show one short trace
     (Claude's day 1 vs day 7, or Codex's own). Stopping is what keeps overtaking from becoming
     starvation.
   - **The seller-facing promise:** support's reply quotes queue order. Changing the policy changes
     that text, whichever way it goes.
   - **Optional secondary beat:** Sahar and Liron on whether the second policy gets written now. Liron
     wants it as a named option; Sahar writes the one being shipped. Only if it lands.

   Each condition is shown before the ending, and the ending introduces no new conditions. Any
   change to the release order goes in a separate change with a stated owner, after the restoring
   refactor. If drafting shows the room honestly deciding, stop and tell me; don't force it.
7. **Cast:** Sahar, Liron, Dafna, Gil and Chen. **No Linoy.** Give the professionals the repair work,
   following Codex's §6:
   - Dafna implements her corrected fold and answers the short-circuit alternative.
   - Gil's runs change claims twice: the overtaking evidence, then the next-day traces.
   - Sahar and Liron are sparing.
8. **Mechanism budget.**
   - **Main text:**
     - the discriminant filter;
     - the combined-predicate loss, if shown (TS2339);
     - stop vs skip;
     - the typed stop reason;
     - one stopping array operation;
     - the traces.
   - **At most one Take** from: the optional-property TS18048, `forEach`/TS1107, or iterator helpers
     under the ES2025 lib. Drop the `{}`/`[]` seed errors.
9. **Validation:** Codex's §8 list, plus:
   - the fixed-reset next-day traces;
   - the named case set behind "no one paid later", asserted exactly as the text states it;
   - the carry-forward trace;
   - selected IDs, total and stop reason pinned in every planner.

   Assumptions (positive amounts, stable order, the reset model) stay explicit in `checks/README.md`.

Next: Codex drafts on this branch and self-reviews. Claude then reviews with an isolated Principle-only
reader and a fresh full reader.


## Draft 1 handoff (2026-10-22)

[Manuscript](../../book/03-patterns-and-design/06-imperative-vs-declarative.md):
**Who Goes Next?**, 2,201 words, 11 TypeScript fences.
[Self-review](CH19-REVIEW.md) and [snapshot](ch19/DRAFT1-SNAPSHOT.json) record
the exact text and validation. The manuscript settles the refactor before the
next-day Turn and leaves the funding-dependent release policy open.

`npm ci --offline` and full `npm run check` exit 0 on TypeScript 7.0.2:
Chapter 19 **11/16/14**; whole book **343/456/173**, plus two defaults and two
searches. The named 78,125-case set runs deterministically against the emitted
planners. Carry-forward days are labeled from the first deposit as day 1, so the
scratch trace's zero-based 1/7 is printed as days **2/8**.

Claude's independent Principle-only and full readers and formal review are next.
Local commit only; no push. The Act III open-ending requirement remains pending
review rather than being marked fulfilled by the draft alone.


## Ending settlement and draft 2 (2026-10-22)

The [first formal review](ch19/CLAUDE-REVIEW.md) and
[ending settlement](ch19/CLAUDE-ENDING-SETTLEMENT.md) supersede the planned open
ending. The [revision note](ch19/CODEX-REVISION2-NOTE.md) records the evidence
reported before that decision.

The refactor restores stopping first. The room then proves the reset subset
argument and adopts a deliberately named fill policy, with the support promise
updated. Under proposed accumulation, it compares all payouts and considers both
stop's aggregate waiting cost and unbounded fill's starvation. Dafna's strongest
repair fills initially, then reserves for the oldest unfunded payout after a
stated wait. The room converges; choosing the illustrative N=2 is a parameter
choice, not an honest unresolved debate. Policy determines behavior and naming,
not a unique loop or fold syntax.

**Local Verdict. Act III's open-ending requirement moves to Ch20.** Its plan
must establish an actual caller-dependent choice; the requirement does not
license a manufactured disagreement.

Draft 2 has 13 fences, 18 compiler cases and 18 runtime groups. The full suite
passes 345/458/177, plus two compiler-default cases and two searches, on TS 7.0.2.
The Principle-only reader and revised-passage recheck are pending.
