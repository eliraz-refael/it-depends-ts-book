# Reader report: Chapter 19, "The Principle" (draft 3, first-time read)

Draft 3 (`9b72d88b…`), 2026-10-23. A fresh, isolated reader had only the Principle extract and the
earlier chapters stated as prerequisites. It used the same prompt and the same four cases as the
earlier reads. The report is copied verbatim.

---

## 1. The rule, quoted

The section gives one default, three questions, one test and two warnings. It isn't a single rule.

- Default: "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing."
- Questions: "Before replacing a loop, ask what carries from one item to the next, where processing stops, and what must happen in order."
- Test: "If the rewrite hides its stopping point behind a flag you have to chase, keep the loop."
- Escape hatch: "An early return, or splitting at the first item that fails, can show the stopping point without that flag."
- Warning 1: "A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost."
- Warning 2: "returning from a `reduce` callback ends that call, not the `reduce`. If you turn a stop into a skip, the code calling your function gets a different answer."

**Is it explicit and testable?** Mostly yes. The three questions are the strongest part. They are concrete and I could run them against real code. "Stop into a skip" is crisp and checkable: the old code stops, does the new one keep going? The narrowing warning is testable too, because I can hover over the value or run the compiler.

**What is vague:**
- "on its own" doesn't say whether side effects are allowed. Case (d) depends on that.
- "start with" could mean "write new code this way" or "convert existing loops". The next sentence says "Before replacing a loop", which suggests converting, but it is never stated as a recommendation.
- "a flag you have to chase" is a judgment call with no example. I don't know if it means a `let done = true` closed over by the callback, a `{ stopped: boolean }` field in a `reduce` accumulator, or both. "Have to chase" is subjective.
- "splitting at the first item that fails" doesn't say fails what (a predicate?) or with what tool (`findIndex` + `slice`?).
- "may not narrow" doesn't say when it does narrow and when it doesn't.

## 2. In your own words

When each element can be kept or converted without looking at the others, write it as `filter`/`map`, because the method names say what the code does. Before you convert an existing loop, find three things: state carried between iterations, where it stops, and ordering requirements. Callers rely on all three, so the rewrite must keep them. If the only way to keep the stop is a hidden flag, leave it as a loop. A loop with an early return, or a cut at the first failing item, makes the stop visible. In a chain, a check in one callback may not carry its narrowed type into the next callback, so keep the check next to the code that uses it. Don't fake a stop with `reduce`. Returning from the callback only skips that item, and that changes the result.

## 3. Apply it

**(a) Payout queue with `break` rewritten as a `reduce` that skips: not safe.**
- I'm relying on: "If you turn a stop into a skip, the code calling your function gets a different answer." Also "returning from a `reduce` callback ends that call, not the `reduce`".
- The ternary `? spent :` is exactly a skip. If a large payout doesn't fit, the `reduce` moves on and may add a later, smaller one. The original stops at the first payout that doesn't fit. Take limit 100 and amounts [60, 50, 30]. The loop pays [60]. The rewrite pays [60, 30].
- It also breaks "what must happen in order". The queue is oldest-first, so the rewrite lets a newer payout jump ahead of an older one that is still waiting.
- It also carries state: the running total.
- What I had to decide myself:
  - Whether to keep the loop. The escape hatch, "splitting at the first item that fails", doesn't obviously work here. Whether an item "fails" depends on the running total, so I'd have to compute a scan first. The section doesn't say whether that counts as hiding the stop. I'd keep the loop.
  - Whether "collecting the payouts that were added" makes it worse. The expression shown only returns a number, so collecting needs extra accumulator state. The section doesn't address that.

**(b) Push `toLabel(user)` for active users: yes, the Principle prefers a pipeline.**
- I'm relying on: "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing."
- That is a preference, not just a warning. `users.filter(u => u.active).map(toLabel)` fits it: nothing carries between items, nothing stops early, and order is only the output order, which `filter`/`map` keep.
- What I had to decide myself:
  - Whether `toLabel` is pure. If it logs, counts or mutates, does "on its own" still hold? The section doesn't say. Earlier chapters on pure functions make me assume it should be pure.
  - Whether "start with" means I should actually convert a working loop, or only that new code should begin this way. I read it as "yes, convert", but that is an inference.

**(c) `filter(r => r.refund !== undefined).map(r => r.refund.amount)`: correct at runtime, but probably a type error.**
- I'm relying on: "A check inside one callback may not narrow the value in the next. Keep the check and its use together if that narrowing gets lost."
- The check runs in the `filter` callback, but the `map` callback still sees `refund` as possibly undefined. As far as I know, TypeScript won't infer a type predicate from a check on a property of a non-union object. So `r.refund.amount` errors under strict null checks.
- The danger is that someone "fixes" it with `r.refund!.amount`.
- The Principle points me to `rows.flatMap(r => r.refund === undefined ? [] : [r.refund.amount])`, or to keeping the loop.
- What I had to decide myself:
  - Whether the narrowing is actually lost here. "May not" leaves that to my knowledge of when TypeScript infers predicates. The section gives no way to tell, except "Check the type after each stage", which I take to mean hover over it or annotate it.
  - Whether an explicit type predicate (`(r): r is Row & { refund: Refund } => ...`) counts as "keeping the check and its use together". The section doesn't say. The earlier chapter on type predicates makes me think it would be acceptable.

**(d) Sequential `await charge(order)` rewritten as `Promise.all(orders.map(charge))`: not safe by default.**
- I'm relying on: "what must happen in order" and "where processing stops".
- The loop charges one order at a time, in sequence. `Promise.all` starts every charge at once.
- If a charge throws, the loop stops and later orders aren't charged. With `Promise.all`, every charge has already started, so all of them still run. The caller gets a rejection, but money may have moved for orders the caller thinks weren't processed.
- That is a changed stopping point, close to "a stop into a skip" but worse.
- What I had to decide myself:
  - The Principle never mentions async, side effects or concurrency. I had to work out for myself that `map` over an async function starts everything at once.
  - Whether `charge` "transforms an item on its own". In one sense it does. That shows how "on its own" ignores effects.
  - Whether sequential order matters for the business (rate limits, ledger order, partial failure). The section can't answer that. It only tells me to ask.

## 4. Where the section left me unsure

1. Does "on its own" exclude side effects, or only dependence on other items?
2. Is "start with `filter` and `map`" a recommendation to convert existing loops, or only advice for new code?
3. What does "a flag you have to chase" look like? A closure variable, an accumulator field, or both? An example would settle it.
4. What does "splitting at the first item that fails" mean in code? Is it `findIndex` + `slice`? And how does it work when "fails" depends on carried state, as in (a)?
5. Is "an early return" a way to keep the loop readable, or something a pipeline can do? A pipeline can't return early.
6. When does narrowing survive between callbacks and when doesn't it? Does an inferred or explicit type predicate count as "keeping the check and its use together"?
7. How exactly do I "check the type after each stage"? Hover, annotations, or something else?
8. Are tools other than "keep the loop" allowed when there is a stop, such as `find`, `some`, `every` or `findIndex`?
9. Does any of this cover async callbacks?

## 5. Clarity and voice

**Sentences I had to reread:**
- "The code calling this function still depends on its carried state, stopping point and order." No function has been introduced, so "this function" has no antecedent. "Its" could mean the function or the loop. I also stumbled on the idea that a caller "depends on carried state". Callers depend on the result, which carried state produces. I eventually read it as "callers rely on the behaviour these three things produce". It took two passes.
- "An early return, or splitting at the first item that fails, can show the stopping point without that flag." I couldn't tell whether this describes a better loop or a better rewrite. An early return is a loop construct, and splitting sounds like a pipeline construct. The sentence mixes the two.
- "If the rewrite hides its stopping point behind a flag you have to chase, keep the loop." On first read I wasn't sure whether "its" meant the rewrite's or the loop's.

**Terms used without explanation:**
- "carried state" (guessable)
- "stopping point"
- "a flag you have to chase"
- "splitting at the first item that fails"
- "stage of the chain"
- "a stop into a skip" (clear once I reached it, but it is introduced as if already known)
- `reduce` itself: the first paragraph never mentions it, so the warning in the second paragraph seems to come from nowhere until you realise it is the usual way people fake a `break`.

**Voice:** Partly a person talking. "a flag you have to chase", "Check the type after each stage of the chain, too." and "Shorter code doesn't excuse that." all sound like a specific engineer with an opinion. But the overall shape is a compressed checklist: a default, three questions, a test, two warnings, each in a short declarative sentence. The second paragraph reads like review notes more than speech. "Keep the check and its use together if that narrowing gets lost" is especially document-like. Nothing in it reacts to anyone or uses an example, so it lands closer to documentation than to dialogue. The speaker's pronoun isn't given in the text, so I haven't used one.
