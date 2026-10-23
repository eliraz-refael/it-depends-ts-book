# Reader report: Chapter 19, "The Principle" (draft 1, first-time read)

Draft 1 (`43b2fdd1…`), 2026-10-22. A fresh, isolated reader had only the Principle extract and the
earlier chapters stated as prerequisites. It got the four hard cases from the settled plan, and not
Codex's expected answers. The report is copied verbatim.

---

## 1. The rule, quoted

> "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing. Before replacing a loop, though, check what one item changes for the next, where processing stops, and what must happen in order. Keep those rules visible in the rewrite, and check that the types still follow each stage. A callback returning doesn't necessarily stop the operation that called it."

**Is it explicit and testable?** Partly. There is a usable rule here: a condition ("each item can be selected or transformed on its own"), a default ("start with `filter` and `map`"), and a three-item checklist I can actually run against a loop:
- what one item changes for the next (state carried between items)
- where processing stops (early exit)
- what must happen in order (sequencing)

**What's clear:** the checklist. I applied all three questions to each case below without trouble. The condition "on its own" works as an independence test.

**What's vague:**
- **"Keep those rules visible in the rewrite."** It doesn't say what visible means. A comment? A named helper? A `takeWhile`-style step? Keeping the loop? I can't tell whether a `reduce` with a hidden "stopped" flag passes.
- **"check that the types still follow each stage."** "Follow" could mean the types flow through each stage, or that narrowing survives from one stage to the next. The second reading turns out to matter (case c). The rule says to check but gives no remedy if the check fails.
- **The last sentence.** It's a true and important warning, but nothing connects it to the checklist. It doesn't name which operations it means (`forEach`? `map`? `reduce`?). It also doesn't say which ones *do* stop (`some`, `find`, `every`?). "Doesn't necessarily" hedges just where I wanted a rule.
- **No exit condition.** It never says when the answer is "keep the loop." It says "before replacing a loop, check," but not what to do when a check fails.

## 2. In your own words

If every item can be kept or dropped, and converted, without reference to any other item, write it as `filter` then `map`, because the pipeline names the intent. When converting an existing loop, first ask three questions. Does each item depend on state left by earlier items? Does the loop stop early? Does the order of effects matter? Whatever the answers, the rewrite has to keep that behaviour, and keep it where a reader can see it. After each stage, confirm the element type is still what you think it is. And don't assume that returning from a callback ends the loop the way `break` does.

## 3. Apply it

**(a) Payout queue with `break` → `reduce` with a conditional skip. Not safe.**
- Relying on "where processing stops": the original stops at the first payout that would exceed the limit. The `reduce` never stops. It skips that payout and keeps going, so a later, smaller payout can still be added. In an oldest-first queue, that means a newer payout jumps ahead of an older one that was refused. Different behaviour.
- Relying on "A callback returning doesn't necessarily stop the operation that called it": returning `spent` unchanged is a skip, not a stop.
- Relying on "what one item changes for the next": the running total is carried state, so the "on its own" condition fails from the start. This shouldn't have been a `filter`/`map` candidate at all.
- Also, the `reduce` as written returns a number. "Collecting the payouts that were added" needs a second accumulator, which the snippet doesn't show.
- **What I had to decide myself:** what a correct rewrite would be, and whether it would count as "visible." Options are keeping the loop, a `reduce` with an explicit `stopped` flag, or computing a cut-off index first and then slicing. The Principle doesn't say. I also had to decide that the chapter title, "Who Goes Next?", means the oldest-first order matters to the domain. The Principle itself never says "queue."

**(b) Push `toLabel(user)` for active users → pipeline? Yes, and the Principle gives a preference here, not only a warning.**
- Relying on "If each item can be selected or transformed on its own, start with `filter` and `map`. They tell the reader what you're doing." `users.filter(u => u.active).map(toLabel)` passes all three checks. Nothing is carried between items, nothing stops early, and order only matters for output order, which `filter`/`map` keep.
- **What I had to decide myself:**
  - Whether "start with" applies to rewriting an existing loop or only to writing new code. The "Before replacing a loop, though" sentence suggests replacing is expected, but it's never stated as a recommendation.
  - Whether `toLabel` is pure. "Does nothing else" says the loop body has no other effects, but if `toLabel` logs or mutates, the Principle never mentions side effects inside callbacks as a check. I assumed it's pure.

**(c) `continue` on an undefined `refund` → `filter(r => r.refund !== undefined).map(r => r.refund.amount)`. Behaviour is the same, but under strict mode it doesn't type-check as written.**
- The `continue` is a per-item skip, not a stop, so "where processing stops" isn't triggered. Nothing is carried between items. The logic is equivalent.
- Relying on "check that the types still follow each stage": in the loop, the `if … continue` narrows `row.refund` for the rest of that loop iteration. In the pipeline, the `filter` callback returns a plain `boolean`, so the array after `filter` still has the original element type. Inside `map`, `r.refund` is still possibly `undefined`, and `r.refund.amount` is an error. (I believe the newer inferred type predicates don't help here, because the check narrows a property, not the parameter itself. That's my own knowledge, not something the section says.) The narrowing didn't survive into the next stage, which I take to be exactly what "follow each stage" is warning about.
- **What I had to decide myself:** the fix. Options are an explicit type predicate on the `filter` callback, `flatMap`, or mapping first and then filtering out `undefined`. The Principle says to check, not what to do when the check fails. I'm relying on the earlier chapter on type predicates. I also had to decide that "follow" means "narrowing carries forward." The phrase alone didn't tell me.

**(d) Sequential `await charge(order)` → `await Promise.all(orders.map(charge))`. Not safe without more information.**
- Relying on "what must happen in order": the loop charges one order at a time, each finishing before the next starts. `Promise.all` starts every charge immediately, all running at once. If the payment provider rate-limits, if charges share a balance, or if order matters to the business, this changes behaviour.
- Relying on "where processing stops": in the loop, a rejected charge throws and the remaining orders are never charged. With `Promise.all`, every charge has already started. The first rejection rejects the combined promise, but the other charges keep going. The last sentence kind of covers this, but in reverse: here it's the caller's failure that doesn't stop the callbacks. I had to stretch the wording to make it fit.
- **What I had to decide myself:**
  - whether the charges are independent and idempotent
  - whether running them all at once is acceptable
  - whether failing partway through is acceptable

  The Principle flags "order" but says nothing about async, concurrency or side effects explicitly. I also noticed `charge` is an effect, not a "transform." The "on its own" condition doesn't clearly say whether effects are in scope.

## 4. Where the section left me unsure

1. What does "keep those rules visible" look like? Is a comment enough? A named function? Is it a reason to keep the loop?
2. When should I keep the loop? Is there ever a case where the answer is "don't rewrite"?
3. Is `reduce` in scope? The rule names only `filter` and `map`. For carried state like (a), is `reduce` the intended tool or a trap?
4. What does "the types still follow each stage" mean exactly, and what's the prescribed fix when narrowing is lost between stages?
5. Which callback-taking operations stop early when the callback returns, and which don't? (`forEach` vs. `some`/`find`/`every`.) Is the last sentence about `forEach` + `return`, about `reduce`, or about async callbacks?
6. Do side effects inside callbacks count against "on its own," or only order-dependent effects?
7. Does "what must happen in order" cover async, meaning sequential vs. concurrent? Or only the order of output?

## 5. Clarity and voice

**Sentences I had to reread:**
- "check what one item changes for the next." On first read I took it to mean one item modifies the next item. I only got "state carried forward to the next iteration" by working backwards from the other two checks.
- "check that the types still follow each stage." "Follow" can mean "flow through" or "keep up with." I couldn't tell which until I worked through case (c).
- "A callback returning doesn't necessarily stop the operation that called it." I reread it to work out whose callback and which operation. It sits alone at the end with no link to the sentences before it, so it reads like an appended footnote. The hedge "doesn't necessarily" left me unsure whether it ever does stop.

**Terms used without explanation:**
- "stage." It assumes a pipeline vocabulary that the section hasn't set up yet. It's understandable, but "each stage" really means "each step of the `filter`/`map` chain."
- "on its own." It does a lot of work as the main test and is never spelled out. I read it as "without depending on other items or on accumulated state."
- "those rules." This refers back to the three checks, but they're phrased as questions to ask, not as rules. The noun shift made me pause.

**Voice:** The first two sentences sound like a person: "start with `filter` and `map`. They tell the reader what you're doing" is a real opinion with a reason. After "though," it turns into a compressed checklist of imperatives: check, check, keep, check. That reads more like documentation or a code-review rubric than someone talking in a debate. The final sentence sounds like a warning lifted from a style guide. Nothing in it sounds like the speaker reacting to a specific bug or situation. Overall it's efficient and actionable for the three checks, but it reads more like documentation than speech.
