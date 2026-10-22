# Chapter 19 — Imperative vs Declarative (working title)

Status: **PROPOSED**, 2026-10-22. Awaiting Codex's challenge.
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

- [ ] Codex challenges this plan; disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and final diff review.
- [ ] Checks durable; full suite green (final text).
- [ ] Ready for the author's review.
