# Chapter 23 — Monads, Lightly (working title)

Status: **PROPOSED; AWAITING CODEX'S CHALLENGE**, 2026-10-27.
Branch: `codex/chapter-23-monads-light`, based on `origin/main` `045d30c`.
File: `book/03-patterns-and-design/10-monads-light.md`. It closes Act III.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if the subject on the page really is a matter of
  opinion among competent owners. Otherwise it ends in a Verdict. Codex's challenge proposes which,
  with evidence; we settle it before drafting.
- **The reader should leave able to spot the pattern.** That means wrapping a value and chaining a
  step that returns the same wrapper, in code they already write: arrays, promises and `?.`. They
  should know why `map` nests and `flatMap` doesn't, and why JavaScript's promise is the odd one.
- **The word "monad" is said once or twice, plainly, and never becomes a lecture.** There's no
  category theory, no laws section and no Haskell. One practical law is allowed if a scene needs it,
  for example that splitting a chain into a helper doesn't change what it does.

## What earlier chapters already settle (do not repeat)

- **Ch14** owns exceptions vs returned results, and transaction rollback. Ch23 starts from Ch14's
  `Result<T, E>` (`{ ok: true; value } | { ok: false; error }`) and from its early-return ladder,
  `if (!result.ok) return result;`. Ch14's Verdict deferred the shared adapter "until we have
  result-returning steps worth sharing". This chapter can be that day. Don't re-argue throw vs
  return.
- **Ch16:** parsing at the boundary. Steps may be parsers, but that's not the argument.
- **Ch19:** loop vs pipeline *form*. A chain is a pipeline, but don't re-argue readability of
  `reduce`.
- **Ch20:** currying and `pipe`-style argument shape. No point-free style, and no `pipe` helper
  unless the chain argument truly needs one line of it.
- **Ch21:** wrappers (retry, timeout). No retry here.
- **Ch22:** configuration as data. No rule interpreters.
- **Earlier plans reserved these for Ch23:** `Option`/`Either`, `Task`/`IO`/`Effect`, Reader and
  fp libraries. Use what the chapter needs, not the catalogue. **No claims about fp-ts, Effect,
  neverthrow or any other library** unless Codex verifies a primary source, and then one line at
  most. No TC39 proposal claims (pipeline operator etc.) without a primary source.

**Later chapters to stay clear of:** Part IV (migration, testing, performance). No timing claims;
counts are fine.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

My probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.

1. **`map` with a step that returns a `Result` nests; `andThen` flattens.**
   - Over Ch14's union, `map(parseQty("2"), reserve)` has type
     `Result<Result<string, NoStock>, BadQty>`, and at runtime it is
     `{"ok":true,"value":{"ok":true,"value":"res-2"}}`.
   - `andThen(parseQty("2"), reserve)` is `Result<string, BadQty | NoStock>`, which is
     `{"ok":true,"value":"res-2"}`.
   - The same shape appears in arrays: `[1, 2].map(n => [n, n])` is `number[][]` and `flatMap` gives
     `number[]`. Promises flatten by themselves: `Promise.resolve(1).then(n => Promise.resolve(n + 1))`
     is `Promise<number>`.
2. **The error type grows as a union along the chain.** Assigning the `andThen` result to
   `Result<string, BadQty>` fails: `TS2322: Type 'Result<string, BadQty | NoStock>' is not
   assignable to type 'Result<string, BadQty>'.` (The full elaboration ends at
   `Type '"noStock"' is not assignable to type '"badQty"'.`)
3. **An async step under `map` nests a promise inside the result, silently.**
   `map(parseQty("2"), reserveAsync)` compiles as `Result<Promise<Result<string, NoStock>>, BadQty>`.
   Its `value` is a `Promise`. Nothing awaits it.
4. **A result class whose chaining method is called `then` is a thenable, and `await` adopts it.**
   - `class Res<T, E> { …; then<U, F>(f: (t: T) => Res<U, F>): Res<U, E | F> }`, returned from an
     `async` function, compiles with no diagnostic.
   - On success, `await load("ok")` gives `1`: the promise called `res.then(resolve, reject)`, and the
     class passed the value to `resolve`.
   - On failure, the class never calls either callback, so the `await` **never settles**. There's no
     error and no rejection. Node simply exits when nothing else is pending (exit code 0). Under a
     top-level `await`, Node 22 prints `Warning: Detected unsettled top-level await` and exits 13.
   - In a job runner typed `() => Promise<unknown>`, the declined job's `finally` never runs. In my
     probe, two jobs started and `closed` ended at 1. Guy's "connection they still have to close" is
     in Liron's bio.
5. **TypeScript's `Awaited` unwraps the thenable too, so typed callers get a confusing error.**
   After `const r = await load("bad")`, with `load` annotated `Promise<Res<number, string>>`, `r` is
   `number`: `TS2339: Property 'ok' does not exist on type 'number'.` A caller that types the job as
   `Promise<unknown>` sees nothing.
6. **Generator do-notation works, with one inference trap.**
   - `function* unwrap(r)` yields the failure or returns the value. A `run` drives the generator, so
     the steps read straight down: `const n = yield* unwrap(parseQty(s)); const id = yield*
     unwrap(reserve(n));`. It returns `Result<{ n: number; id: string }, BadQty | NoStock>`, and
     `order("2")`, `order("7")` and `order("x")` give success, `noStock` and `badQty` respectively.
   - Typing `run<T, E>(g: () => Generator<Err<E>, T, unknown>)` fails with a long TS2345 once two
     error types are yielded, citing `exactOptionalPropertyTypes`. The version that works infers the
     yielded union: `run<Y extends Err<unknown>, T>(…): Result<T, Y["error"]>`.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise above.

**The incident (mechanism 4), as the hook.** A team has outgrown Ch14's ladder. It wraps `Result` in a
small fluent class and names the chaining method `then`, "because everyone already knows what
`then` does". It's a competent, reasonable choice, the success path is tested, and it ships. Then
the job runner's count of open connections (or in-flight jobs) creeps up. Gil finds that the stuck
jobs are exactly the declined cards. There's no error, no log and no rejection. The `finally` that
releases the connection never ran.
- The reveal should be a small detective moment like Ch22's: `await` asked the object whether it was
  a promise, the object said yes, and then it never answered.
- Liron uses it to name the pattern: `then` is the promise's `flatMap`, and the promise flattens
  *anything* that looks like one. That's the odd one among arrays, promises and `?.`.
- The rename to `andThen` fixes the incident. The fix is not the argument.

**The argument: now that the steps return results, how should a multi-step operation chain them?**
- **The ladder** (Ch14's style, Sahar or Guy): `if (!r.ok) return r;` after every step. It's plain,
  debuggable and needs no vocabulary. Its cost is repetition, and a forgotten check is easy to miss
  in review.
- **Small helpers over the plain union** (Dafna): `map`, `andThen` and their async twins, owned by one
  module. Their cost is a vocabulary and the nesting traps (mechanisms 1 and 3), so `map` vs
  `andThen` must be chosen correctly.
- **Generators as do-notation** (Linoy): straight-line code with `yield*`. Its cost is an unfamiliar
  control flow and the inference trap (mechanism 6). Linoy's bio has an open disagreement with Liron
  about "that helper". This could be where it surfaces, but only if it's honest.
- **A fluent class, renamed.** Is a class with `andThen` any better than functions over the union?
  Codex decides whether this is a real side or just the incident's leftover.

**What I don't know, and Codex should attack first:**
- **Is this decision honestly opinionated?** "Ladder vs helpers" is a classic taste argument. That's
  good for an open ending but bad if it's only taste. Find the conditions on the page that would
  decide it: the number of steps, how often sync and async steps mix, who reads the code (on-call?),
  and whether the forgotten-check bug has actually happened. If those decide it, it's a Verdict.
- **Does the incident earn its place in a chapter about chaining,** or is it a separate trivia
  chapter? I think it does, because it's the best way to show that `then` is `flatMap`, but test it.
- **Is the generator option fun or a detour?** Cut it if it costs more words than it teaches.

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Liron Closure.** His bio is this chapter: he reaches for null propagation and
async work in an error-handling conversation, Dafna follows quickly, and Guy asks about the
connection they still have to close, "where Liron has to leave the analogy and work through the
code". He has set Ch14, Ch17 and Ch22, though. Codex may argue for Eli Typeworth (Ch15, Ch18) if the
Principle is better as "state the claim precisely". Say why.

**Its direction, not its wording:**
- Arrays, promises and `?.` are familiar cases of one pattern: a wrapper and a way to chain a step
  that returns another wrapper. Recognising it tells you which operation you need. Use `map` when the
  step returns a plain value, and `flatMap`/`andThen` when it returns another wrapper.
- If a step's result nests where you expected it flat, you used `map` where you needed `flatMap`.
  Mixing wrappers (a promise inside a result) needs its own operation.
- Don't call a chaining method `then` unless the object is a promise: `await` will treat it as one.
- **Give a test, not a mood.** Every condition must be checkable from the Principle alone, with no
  undefined terms.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** An `async` repository function returns a `Maybe<User>` class whose chaining method is
  `then`. What happens when the user is missing?
- **(b)** `ids.map(async id => fetchUser(id))`, then the code uses the result as `User[]`. Name the
  nesting, and say what fixes it.
- **(c)** A function with four `if (!r.ok) return r;` steps, and a reviewer asks to replace them with
  a chain helper. What should the author check before agreeing?
- **(d) Transfer:** `user?.address?.city` vs introducing an `Option` type. When does `?.` already
  do the job?

## Cast

- **Liron Closure** (he): the Principle and the analogy; the incident's explanation; where his
  analogy runs out.
- **Guy Singleton** (he): the connection to close. A natural sceptic of helper vocabularies who
  argues competently, maybe for the ladder. Rested in Ch22.
- **Dafna Functor** (she): the helpers over the union. Don't make it "she likes pipelines". Give her
  a reason that comes from what she owns.
- **Linoy Nightly** (she): generators as do-notation, and her open disagreement with Liron about a
  helper. She's been reserved for this chapter since Ch18.
- **Sahar Firstclass** (he): what happens if the helper is removed. He's the ladder's best advocate,
  and per his bio he must also count the cost of removal.
- **Gil Benchmark** (he): finds the stuck jobs, and counts whatever the decision turns on.
- **Optional:** Daniel Compiler (he) for mechanism 5 (`Property 'ok' does not exist on type
  'number'`), or Oded Shipley (he) as the competent author of the `then` class.

**Rested:** Eden, Chen and Dafna partly (Ch22's heavy roles); Eli, Gilad, Oded and Guy were in
Ch21. Five or six people. Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first: the incident should be the scene readers would retell.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines. "That's just a map" is Dafna's bio line. Don't use it as a punchline.
- The `then` author is competent. Naming it `then` is a plausible mistake, not a joke at their
  expense.
- One running scenario, small integers, and every fence checked.
- No timing claims. There are no real payment providers or job queues; the runner is fictional and
  stated on the page.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter23.cjs`: compile every TS fence on the book profile, with competing designs as
separate programs.

Runtime groups:
- the incident: success adopted, failure unsettled, `finally` not run, and the counts the text
  prints;
- `map` vs `andThen`, with runtime shapes;
- any async-nesting case the text uses;
- every design the scenes compare, against the same inputs, with identical outputs where the text
  claims them.

Compiler cases: every diagnostic quoted verbatim (mechanisms 2, 5 and 6 as used), plus the success
cases the text relies on, with selected inferred types asserted.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [ ] Codex challenges this plan: is the decision honestly opinionated, does the incident earn its
  place, and which ending. Disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Checks durable; full suite green.
- [ ] Ready for the author's review.
