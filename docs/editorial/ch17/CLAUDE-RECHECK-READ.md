# Ch17 d2: first-time reader recheck

I read only `ch17-full.md`. Line numbers refer to that file.

## 1. Principle alone: may the receipt save the live view if only the owner writes?

No. One sentence decides it:

> "Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees." (l.7)

The sentence just before it sets the rule: "A holder that needs history must receive a value that won't change." The Principle has the explicit, testable rule it needs, and it directly rules out the "only the owner writes" excuse. Nothing is missing here.

## 2. How the code stops the live reader being passed to `receipt`

The final `view()` returns `PriceView` (l.253-256). That type has only `current()`, with no `subtotal`, `discount` or `total`, so `receipt(view, ...)` fails (l.259-261). Daniel states it at l.264: "`PriceView` has `current`. It doesn't have `subtotal`, `discount` or `total`. Neither live reader can be passed to this receipt." Dafna's `ReadPrice` does the same thing for the function form (l.235-238). The stable value comes from `snapshot()` (l.223-225).

It is clear. Two small gaps:
- The mechanism is only obvious once the getter version of `view()` is **removed**. Dafna's `ReadPrice` (l.235) sits next to a `view(): Quote` that still exists, so at that moment the mistake is still possible. Guy's replacement (l.251) is what actually closes it. A reader works this out, but nobody says "and `view()` no longer returns a `Quote`." Daniel's l.264 line is the natural place for that half-sentence.
- The protection works in both directions: a stale `Quote` can't be passed where the panel expects a `PriceView` either. That is never said. It's optional, but it would make the guarantee feel complete.

## 3. Story tracking

Mostly easy to follow. The one real snag is **`pricing` across the class edits**:
- `pricing` is built at l.206 while `view()` is the getter version and `snapshot()` doesn't exist yet.
- l.236 calls `pricing.snapshot()`, a method added afterwards (l.223).
- l.260 calls `pricing.view()` after "He replaces the getter-based `view()` method" (l.251). Under the new class, the earlier `summary = pricing.view()` (l.207) would be a `PriceView`, and `summary.total` at l.211 would no longer compile.

So the reader has to assume the edits to the class apply backwards to an object that already exists. l.277 avoids this with a fresh `checkout` ("for the next run"). l.260 should do the same: build a new instance, or fold the TS2739 line into the l.277 block.

Smaller points:
- Forward references: Dafna's "Your owner can do the same on entry" (l.150) and Guy's "`applyDiscount(amount)`" (l.152) refer to a class that appears only at l.166. They hold up because Guy floated an owner at l.70, and the constructor at l.173 pays off "on entry". That works.
- Eden's adapter (l.137, "have the old one call `withDiscount` and copy its numbers back") is described but never shown. That's fine as prose.
- The items list disappears after l.160 and nobody mentions it again. That's acceptable, because Eden explicitly separated it out.
- `checkout` is both a top-level const (l.277) and the parameter of `chooseDiscount` (l.329), and `chooseDiscount` is both a closure method (l.312) and a free function (l.329). Each one is legal, but in two neighbouring blocks it takes a moment to see that they are different things. Renaming the parameter (e.g. `pricing`) or the function (`applyChosenDiscount`) would help.

## 4. Fairness

**Guy's strongest line:**
> "Keep that calculation. But applying the choice still goes through one owner. I won't have each handler replacing its own idea of the current price while the panel reads another." (l.301)

The runner-up is l.193: "For a current-price panel, that is the contract. It doesn't need rebinding after every discount."

**Dafna's strongest line:**
> "Stop making the live read look like a value. Give the summary a function. It has to ask for a price." (l.232)

The runner-up is l.68: "So the receipt has the same object under a more reassuring name."

**Does Guy hold points against Dafna?** Yes, more than in earlier drafts:
- The forgery (l.142-150). Guy shows a `Quote` with an invented total, and Dafna has to concede: "If we need an unforgeable value type, that's more work than freezing this one." That is a real hit.
- The owner (l.70, l.301). The verdict adopts it ("Let the checkout owner publish the current price"), and Dafna's own closure (l.308) is an owner.
- `snapshot()` (l.223) is Guy's fix, and Eden runs the next block on Guy's interface (l.274).

The weak spot is l.301-303. Guy's best line is met with "I wasn't proposing that," which makes it read like a strawman he set up himself. Then Dafna builds an owner anyway, so in substance he wins and the text frames it as a misunderstanding. Have Dafna agree outright instead ("Agreed. A closure can be that owner."). Guy keeps the point and Dafna loses nothing.

Guy also designed the bug that drives the Turn (getter `view()` typed `Quote`), and Dafna warned about it at l.191. That is the standard shape for an FP-leaning book, and he recovers quickly. It's acceptable, but it means the central insight goes to Dafna.

**The closing disagreement (named interface vs function type)** is in character: the catchphrase at l.243, and Dafna's "You've put one function inside an object" (l.266). It is thin, though. The only concrete evidence in the code favours Dafna: `values.read` drops straight into `ReadPrice` (l.321). Guy's side is "it tells the next reader what that dependency does" (l.268, l.344), which is a preference, not a result. To make it real, give Guy one concrete advantage, for example:
- the panel will need a second operation soon (a change subscription for re-rendering), and an interface grows without changing the panel's constructor signature, or
- a class can `implements PriceView` and be checked against it.

Either one turns it from a matter of taste into a real disagreement about where the code is heading.

## 5. Voice

- **Narrator scoring/teaching:** None found. l.19 is needed setup, and its "offers do not accumulate" pays off nicely at l.284 (`70`, not `50`). l.90's handbook sentence is a plain citation. That is clean.
- **Slogans:** The Verdict's last sentence, "A single writer, a readonly type, and a frozen object each leave the question of history unanswered on their own," is a listicle triple that sounds machine-written. l.9, "The question comes when you hand it over: what have you promised its next holder?", is a mild slogan but works as a Principle line. Eden's l.348, "Adding `readonly` was a smaller diff. It just didn't do this job.", is earned. Keep it.
- **Machine rhythm:** Mirrored antitheses come back several times:
  - "The properties didn't change. What the getters read did." (l.218)
  - "Saving that result takes a snapshot. Saving the function keeps a way to read the next price." (l.241)
  - "The promotion supplies an amount. This handler owns the decision to apply it. The preview doesn't get to replace checkout's state." (l.336)

  Each is fine on its own; together they give the dialogue a drilled cadence. Loosen one or two, for example by making l.241 a single sentence.
- **Lines answering nothing said:**
  - l.160 Eden: "Keep its price separate from the item list" repeats Dafna's l.156 ("Keep that out of this snapshot"). Cut the second sentence, or give Eden a migration-specific worry.
  - l.158 Guy: "Putting the cart in a private field wouldn't fix that." Nobody had proposed a private field. It reads as Guy rebutting himself in advance. It's a fair point, but it needs a hook, e.g. Eden asking "Would your class fix that?"
  - l.152 Guy: "I won't expose a setter for the total" is loosely attached to Dafna's l.150. It's acceptable.
- **Cover-the-names (6 lines):**
  1. "Where's the interface? The panel depends on a current-price capability…" (l.243): Guy. Unmistakable.
  2. "`ReadPrice` has a name too. You've put one function inside an object." (l.266): Dafna. Clear.
  3. "It does. `readonly` on an object property doesn't prevent that assignment…" (l.66): Daniel. Clear.
  4. "Both mean changing the call. Putting `readonly` on this type was the change we thought we had already made." (l.72): Eden. Clear.
  5. "The promotion supplies an amount. This handler owns the decision to apply it…" (l.336): could be Guy or Dafna. **Fails.**
  6. "Putting the cart in a private field wouldn't fix that. I'd have to copy the rows on entry…" (l.158): could be anyone. **Weak.**

  Four of six pass.
- **Fun or flat:** Dry, with a few good beats: "The receipt forgot." (l.17), "Even frozen." (l.216), "under a more reassuring name" (l.68), "don't mistake a recursive readonly type for a frozen clock" (l.374), and "That counts property copies, not milliseconds" (l.370). Nobody needles anybody, though. One exchange with some friction, for example Dafna reacting dryly to Guy's catchphrase, would lift the middle. Overall it is competent, not flat, but only lightly fun.

## 6. Migration cost

This is mostly clear and fairly assigned:
- Old promotion callers: Eden makes the point at l.133. Dafna's answer is to keep `applyPromotion` and add the value API (l.135). Eden adds the two-API cost and the adapter that avoids duplicating the rule (l.137). l.338 restates it.
- The panel change is charged to **both** live-reader designs ("Either one makes the panel change its `.total` read to a call," l.272), so neither side pays alone. That is fair.
- l.338 adds that the panel and receipt must change together, or the bad call keeps compiling. That is good, specific cost reasoning.

Gaps:
- **The runtime cost of freezing is never named.** Any old path that passes a frozen quote to `applyPromotion` now **throws in production** in strict code, where before it silently aliased. l.129 covers only the sloppy-mode side, where the write fails silently. Dafna's "I want that mistake to fail where it happens" (l.118) is the upside. Eden should own the downside in one line, such as "that's an exception at checkout, not a test failure."
- Introducing `CartPricing` is itself a migration: every place that held `cart` now has to hold an owner. Eden's l.348 implies this but doesn't say it.

## 7. TS/JS claims I doubt

**Believe wrong, please verify** (I had no compiler available):
- **l.82 `// Error TS4104.`** For a call argument, `tsc` reports the top-level diagnostic as **TS2345** ("Argument of type 'readonly LineItem[]' is not assignable to parameter of type 'LineItem[]'"). TS4104 is the elaboration underneath it. The quoted message is the TS4104 text. If the harness matches the head code, this should be TS2345.
- **l.261 `// Error TS2739.`** Same issue. Passing a `PriceView` identifier to a `Quote` parameter should report **TS2345**, with TS2739 ("missing the following properties") as the elaboration. TS2739 is the head code for assignments like `const q: Quote = view`, not for call arguments. l.238 uses TS2345 for the same kind of call, so these three lines are inconsistent with each other whichever is right.

**Know correct:**
- A readonly property doesn't block assignment to a writable parameter (l.66).
- Writing to a frozen object throws `TypeError` in a module (strict) and fails silently in sloppy mode (l.124, l.129).
- A getter-only frozen literal is assignable to `Quote`, and `Object.isFrozen` is true (l.213).
- The spread forgery compiles (l.142).
- `499500` = sum of 0..999 (l.363).
- The JSON key order matches: integer-like keys come out ascending in both objects (l.367).
- A frozen `Date` stays mutable through `setUTCFullYear`, because the internal slot isn't a property (l.384-385).
- `DeepReadonly` keeps methods callable through the function branch (l.377).

**Believe correct:**
- `Object.freeze(new Date(...))` resolves to the generic `Readonly<Date>` overload, and that is assignable to `DeepReadonly<Date>` (l.381-383).
- l.88: a parameter typed `{ items: readonly LineItem[] }` with writable `items` accepts `cart` and can reassign it.

## 8. Remaining changes, ranked

1. **Fix the error codes at l.82 and l.261** (very likely TS2345, as l.238 has). Correctness errors cost the most trust.
2. **Use a fresh instance at l.260** (or merge that line into the l.277 block), so `pricing` and `summary` aren't silently reinterpreted under the replaced `view()`. Optionally have Daniel add at l.264 that `view()` no longer returns a `Quote`.
3. **Give Guy a concrete edge in the closing disagreement** (a second operation coming, or `implements PriceView`), and change Dafna's l.303 "I wasn't proposing that" to agreement, so Guy's owner point isn't framed as a strawman.
4. **Name the runtime cost of freezing** in one Eden line: old paths that pass frozen quotes now throw at checkout.
5. **Voice trim:** rewrite the Verdict's closing triple, cut Eden's repeated l.160 sentence, and give Guy's l.158 a question to answer.
