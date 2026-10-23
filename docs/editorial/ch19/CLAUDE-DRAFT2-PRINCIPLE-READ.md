# Reader report: Chapter 19, "The Principle" (draft 2, first-time read)

Draft 2 (`8dc7823a…`), 2026-10-22. A fresh, isolated reader had only the Principle extract and the
earlier chapters stated as prerequisites. It used the same prompt and the same four cases as the
draft-1 read. The report is copied verbatim.

---

## 1. The rule, quoted

> "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing. Before replacing a loop, ask what carries from one item to the next, where processing stops, and what must happen in order. The caller still needs those rules. If the rewrite hides its stopping point behind a flag you have to chase, keep the loop. A visible early return or a named split can be easier to read."
>
> "Check the type after each step, too. A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost. And returning from a `reduce` callback ends that call, not the `reduce`. Changing that behavior is a change to what the caller gets, even if the new code is shorter."

**Is it explicit and testable?** Mostly yes. It works as a short decision procedure:
- **The default.** "If each item can be selected or transformed on its own, start with `filter` and `map`." This has a condition and an action, so I can test it.
- **The three questions.** "what carries from one item to the next, where processing stops, and what must happen in order." This is the most usable part. I can ask each question about a real loop and get an answer.
- **The exit condition.** "If the rewrite hides its stopping point behind a flag you have to chase, keep the loop." It's testable, but "a flag you have to chase" is a judgment call.
- **Two type and control-flow warnings.** One says narrowing doesn't carry across callbacks. The other says `return` inside `reduce` doesn't stop the `reduce`.

**What is clear:** the default, the three questions, and the two warnings. The `reduce` sentence is the sharpest line in the section.

**What is vague:**
- The section never says what to do when one of the three questions has a real answer. Suppose state does carry, or processing does stop early, but the rewrite doesn't use a flag. The only explicit "keep the loop" is tied to the flag case. Everything else rests on "The caller still needs those rules." That sentence tells me the rules must survive the rewrite. It doesn't tell me whether to rewrite.
- "start with" could mean "write new code this way" or "convert existing loops". I can't tell which.
- "a named split" is never explained.
- "Check the type after each step" doesn't say how to check: compiler errors, hovering in the editor, or reading the inferred type.

## 2. In your own words

If every element can be kept or dropped, or turned into something, without looking at any other element, write it as `filter`/`map`. That form says what the code does. Before you turn an existing loop into a pipeline, look for three things: state that carries between iterations, an early stop, and steps whose order matters. The rewrite has to keep all three. If keeping the early stop means threading a "done" flag through the pipeline, leave the loop alone. A visible `break`/`return`, or splitting the work into named pieces, reads better. Also watch the types. A narrowing check in a `filter` callback usually doesn't carry into the next `map`, so keep the check next to the code that uses the value. And `return` inside a `reduce` callback only ends that one iteration, so a `reduce` can't reproduce a loop's `break`.

## 3. Apply it

**(a) Payout queue with `break` → `reduce` with a ternary. Not safe.**
- **The early stop is lost.** The loop stops at the first payout that would cross the limit. The `reduce` skips that payout and keeps going, so a later, smaller payout can still be added. The result is different. I relied on "ask ... where processing stops" and "returning from a `reduce` callback ends that call, not the `reduce`. Changing that behavior is a change to what the caller gets, even if the new code is shorter." Returning `spent` unchanged is the "ends that call" case in action.
- **The running total is carried state.** The rewrite does carry it, in the accumulator. Order matters too, since the queue is oldest-first. Both answer "what carries" and "what must happen in order". The rewrite keeps the order, but it changes what happens once the limit is reached.
- **Fixing it would need a flag.** A correct `reduce` would need a `stopped` flag in the accumulator. That is exactly "hides its stopping point behind a flag you have to chase, keep the loop." So the Principle points to keeping the loop.
- **What I decided myself:**
  - Whether skip-and-continue is ever what the business wants. The Principle only tells me it's a change, not whether the change is acceptable.
  - The case says the rewrite collects the added payouts, but the snippet returns a number. Collecting them would need a side-effecting push inside the callback or a tuple accumulator. The Principle doesn't discuss side effects inside callbacks.

**(b) Push `toLabel(user)` for every active user. A pipeline is fine, and the Principle gives a preference, not just a warning.**
- Each user is selected (`active`) and transformed (`toLabel`) on its own. Nothing carries over, nothing stops early, and order is just array order, which `filter`/`map` keep. I relied on "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing."
- **What I decided myself:**
  - Whether "start with" means I should change an existing working loop, or only that new code should be written this way. I read it as a mild preference.
  - That `toLabel` is pure. The Principle doesn't say "and the callbacks have no side effects". I assumed "on its own" covers that, using the earlier pure-functions chapter.
  - The narrowing warning doesn't come into play, because `active` is a boolean flag, not a type narrowing.

**(c) `continue` on undefined `refund` → `filter(...).map(r => r.refund.amount)`. Not safe as written; it won't type-check under strict mode.**
- `r => r.refund !== undefined` narrows only inside that callback. As I understand it, TypeScript doesn't infer a predicate that narrows a property of the element. So in `map`, `r.refund` is still `Refund | undefined`, and `r.refund.amount` is an error. I relied on "A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost."
- The real danger is that someone silences the error with `r.refund!.amount`. That keeps the code safe only by coincidence.
- **What I decided myself:**
  - What "keep the check and its use together" means in practice. It could mean keep the loop, use `flatMap(r => r.refund === undefined ? [] : [r.refund.amount])`, or write an explicit type predicate. All three keep the check and its use together, and the Principle doesn't pick one.
  - When narrowing does survive. "may not" leaves that open. I used the earlier type-predicates chapter: an explicit `(r): r is Row & { refund: Refund }` predicate would carry the narrowing.

**(d) Sequential `await charge(order)` → `await Promise.all(orders.map(charge))`. Not safe.**
- **Ordering.** The loop charges one order at a time, in order. `Promise.all` starts every charge at once, so ordering and the one-at-a-time behavior are both gone. That can matter for rate limits, idempotency, or account balances. I relied on "ask ... what must happen in order".
- **Stopping.** If one charge rejects, the loop stops, and later orders are never charged. With `Promise.all`, every charge has already started. The call rejects on the first failure while the other charges keep going. I relied on "where processing stops" and "Changing that behavior is a change to what the caller gets."
- **A smaller hazard.** `map(charge)` also passes the index as the second argument. If `charge` takes an optional second parameter, that's a bug. The Principle doesn't cover it.
- **What I decided myself:** almost everything specific to async. The Principle never mentions `await`, concurrency, or partial failure. I had to treat "what must happen in order" as covering one-at-a-time execution, not just the order of the output.

## 4. Where the section left me unsure

1. If a loop carries state or stops early, but a pipeline could express that without a flag (for example `find`, `some`, `every`, `takeWhile`, or `flatMap`), is the rewrite encouraged? Only the flag case says "keep the loop".
2. What is a "named split"? Splitting the array at the stop index (`findIndex` + `slice`)? Extracting a named helper function? Something else?
3. What counts as "a flag you have to chase"? Is any boolean in an accumulator too much, or only one that's checked in several places?
4. Who is "the caller"? Is it the code that calls this function, or the next reader?
5. Does "start with `filter` and `map`" mean I should rewrite existing loops, or only write new code that way?
6. How do I "check the type after each step"? Do I rely on compiler errors, hover in the editor, or something else? And when *does* narrowing survive across callbacks (explicit predicates, or inferred ones on the element itself)?
7. Are side effects inside `map`/`filter`/`reduce` callbacks ruled out, or just not discussed?
8. Does the rule apply to async loops? Is concurrency part of "what must happen in order"?
9. Is `reduce` itself discouraged, or only `reduce` used to imitate `break`?

## 5. Clarity and voice

**Sentences I had to reread:**
- "The caller still needs those rules." It isn't clear who "the caller" is, and "those rules" points back to the three questions loosely. I had to infer that it means "the rewrite must keep the carried state, the stop, and the order".
- "A visible early return or a named split can be easier to read." Easier than what? Presumably the flagged rewrite, but it reads as if it could also mean easier than `filter`/`map` in general. "can be" also makes it unclear whether this is advice or just an observation.
- "Changing that behavior is a change to what the caller gets, even if the new code is shorter." "That behavior" could mean the `reduce`'s one-call-only return, or the original loop's `break`. I understood it on the second pass: replacing a loop's stop with a `reduce` changes the result.
- "Check the type after each step, too." "step" isn't defined. I took it to mean each pipeline stage. "too" links it weakly to the previous paragraph.

**Terms used without explanation:** "named split", "a flag you have to chase", "step", "the caller". Also "selected or transformed on its own": I understood it as "independently of other items", but the section never says "independently".

**Voice:** The first paragraph sounds fairly like a person: short imperatives, "you're", "a flag you have to chase", "keep the loop". The second paragraph reads more like a checklist from a style guide. Four flat declaratives, starting with "Check the type after each step, too," and then "And returning from..." tacked on. Neither paragraph has a stake, an example, or any sign of the speaker's own experience. Given that the book is written as debates among engineers, it reads more like documentation spoken aloud than like someone arguing a position. It's compact and mostly clear, though. The weak points are the three loose referents ("the caller", "those rules", "that behavior") and "named split".
