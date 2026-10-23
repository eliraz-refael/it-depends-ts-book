# Reader report: Chapter 20, targeted recheck (draft 2)

Draft 2 (`80c6362e…`), 2026-10-23. A fresh, isolated reader had the full chapter, with Chapters
1–19 and the five speakers' pronouns stated as prerequisites. It was asked to read the whole chapter,
then the passages revised after the first review, and to re-run every output. It used the book's
TS 7.0.2 binary and Node 22. The report is copied verbatim.

---

## Chapter 20 first-read report

I read only `chapter.md`. My scratch files are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read2/f/run/` (s1–s4.ts). I compiled them with the given tsc, which is version 7.0.2, using `--strict --exactOptionalPropertyTypes`. I added counters to `prepare` and `evaluate` to check the counts table.

**Overall: close, not another full round.** Every output checks out. What's left is two wording errors in technical claims and a few spots that need a reread.

### 1. Revised passages

**The Principle.** The first paragraph gives a rule you can test, and it is clear.
- It mixes two readers. "Start with a local arrow" speaks to the consumer. "Return a function if that's what its consumers need" speaks to the package author. It still works.
- The second paragraph reads like a run of orders. "Check each call separately" is vague: check it for what? Spelling it out would help, e.g. "check what each call does, can throw, and infers."
- "The first call is still a call. It can do work and throw" sets up the Turn well.

**"We could replace the two-argument version with a factory."** Clear.

**Dima's reply.** "You already have that function" made me stop: is it `price` or `lineTotal`? I settled on `price` after rereading. Naming it would fix this: "You already have `price`." The rest ("Why should its callers make a function just to call it immediately?") is a good, concrete reason.

**Daniel's "We've removed one arrow and put it back. I'd like to keep this one long enough to use it."** I had to reread this.
- The "put it back" is never shown. After the `Discount` object change, nobody writes `lines.map(line => lineTotal(line))` again.
- It also repeats the pushback Dima just gave, as a quip.
- It works as a callback once decoded. Either make the reference concrete or cut it.

**Linoy's tier explanation.** Clear. "A different discount" is a bit flat, but it is accurate since tiers can be anything.

**Dima's checked-lines line.** It does its job: it heads off "what about bad lines?". But "Lines arrive with positive quantities… I only check the tiers here. Below every minimum, the line stays full price. `prepare` and `evaluate` stay private." is four short statements in a row. That reads like a code comment, not speech.

**Noam/Dima/Linoy on an opaque `PreparedPromotion`.** Clear on first read. See section 3.

**The optional parameter slipping past `PriceLine`.** Clear and strong. "I removed the arrow at the package call and left the same shortcut inside both renderers" is the best line in the section: it ties back to Gil's three lines without saying so. One technical slip, covered in section 2.

**The Turn's opening.** Clear.
- "Before it got a function to call" lands well.
- "Before the renderer ran?" is a mild feed line, but acceptable.

**The Take's explanation of the inferred union.** It is imprecise, covered in section 2.

### 2. Code verification

All of these match the chapter:

| Claim | Result |
|---|---|
| Opening scene | 90, `100,100,100`, `100,99,98`, `100` |
| Required discount parameter | still compiles with `map` |
| `Discount` object version | `lines.map(lineTotal)` gives TS2345 ("Type 'number' has no properties in common with type 'Discount'") |
| Flat discount run | 270, `90,90,90`; `discountedBy` gives 90, `90,90,90` |
| Tiered run | 520 and `100,180,240`, both paths |
| Checkout call | 100 |
| Adapter counts | 6 preparations, 18 validations, 6 evaluations |
| Stored `priceWith` counts | 1 / 3 / 6 before the checkout call |
| Checkout call cost | one more preparation (2 / 6 / 7 after it), matching Gil's "prepares once now" |
| Optional parameter | `priceWithExtra` compiles against `PriceLine`; prints `100,99,98`, then `100,100,100` after the renderer repair |
| Empty run | adapter returns 0; `priceWith(invalid)` throws RangeError "Invalid promotion tier"; a valid empty run prepares once |
| Take | `pair({a:1},{b:2})` accepted; `pairWith({a:1})({b:2})` gives TS2353 because `pairWith` has fixed T to `{ a: number }`; `pairWith<Either>` accepted |

Two wording errors:
- **The Take's "marking the missing property optional in each member" undersells the type.** Under the book's flags the inferred T is `{ a: number; b?: never } | { a?: never; b: number }`. Without `exactOptionalPropertyTypes` it is `b?: undefined`. A reader will picture `b?: number`. Say "adds the other property as optional and absent (`b?: never`)", or show the type.
- **Noam, "pointing to `layout`": "An extra required argument would break this assignment."** It wouldn't fail there. `priceWith` is declared to return `PriceLine`, so the error lands at the `return` inside the factory. I checked: TS2322, "Target signature provides too few arguments". Say "would fail against `PriceLine`" instead.

### 3. Does the opaque `PreparedPromotion` exchange give a real reason?

Yes, a modest one.
- **The reason given:** the renderers take a function. Returning one spares a public prepared type and a second pricing entry point. That fits the Principle ("return a function if that's what its consumers need").
- **What's missing:** Dima's "For these consumers, yes" points at a cost nobody names. A closure can only price one line. An opaque value could later support other operations, such as showing which tier applied, pricing a batch, or reuse across runs. Either name that cost or drop the qualifier.
- **A missing line from Daniel:** nobody says that the closure *is* an opaque prepared promotion in another shape. Saying so would sharpen the choice.

Obvious alternatives still unasked:
- **A cache inside `lineTotal`** (e.g. a WeakMap keyed on the promotion). This is the most obvious one, since Dima has just said checkout still prepares on every call. It would fix both callers with no new API. It costs hidden state and depends on the promotion never being mutated, which is exactly what Chapters 18–19 cover. One dismissive line from Dima would close it.
- **Validating at the boundary.** The setup-time validation the Turn values could also come from a validated or branded `Promotion` parsed at setup, without currying. Not fatal, but a reader of the boundary-validation chapter may notice.
- **The cost question.** Gil says "I haven't measured how much time that costs" and nobody responds. The Turn later supplies a reason that doesn't depend on speed, so the argument holds, but a one-line acknowledgement would help.

### 4. The Turn and the Verdict

The Turn does change the room. Before it, `priceWith` is an optimisation. After it, creating the function is a validation step that belongs at promotion setup, with error handling there. Linoy's "I was treating it as a shorter way to write the arrow" names that shift well.

The Verdict follows from the scenes. `priceWith` is published, checkout keeps `lineTotal`, renderers pass only the line, the empty invalid run stays in the tests, and there are no blanket double exports.

Two continuity snags:
- "She replaces `discountedBy`" treats `discountedBy` as adopted, but Dima never agreed to export it.
- The Verdict's "the ordinary discount adapter can live in reporting" comes after Dima "replaces `Discount` with `Promotion`". If `Discount` is gone, there is nothing left to adapt.

### 5. Characters and voice

- **Pronouns:** no errors. "She" is always Linoy.
- **Feed lines:** some, all mild. Linoy's "Even with `PriceLine`?" and "Before the renderer ran?", and Noam's "Does it stop `map` passing the index?" are acceptable.
- **Repetition:** Dima's closing "that type doesn't restrict what `map` passes" largely repeats Noam's "It doesn't stop the implementation accepting more."
- **Reads like documentation:**
  - Dima's checked-lines line.
  - The narrator's setup paragraph opening "Who owns the arrow?".
  - "returns the unary pricing function" in the Verdict.
  - The string of orders in the Principle's second paragraph.
- **Daniel** is otherwise used well as the one who explains `map`, argument order and inference. The "removed one arrow" line is the one where he slips into commentary.

### 6. What I'd still change, ranked

1. Fix the Take's union description: show `b?: never`, or say "optional and absent".
2. Fix Noam's "this assignment": the break would land at `priceWith`'s return, not at `layout`.
3. Name what "for these consumers" excludes, or have Daniel note that the closure is the opaque value. Add one line dismissing a cache inside `lineTotal`.
4. Make Daniel's "removed one arrow and put it back" concrete, or cut it.
5. Replace "You already have that function" with "You already have `price`."
6. Tidy the `discountedBy` and `Discount` references against the Verdict.
7. Sharpen "Check each call separately" in the Principle and soften the run of orders. Make Dima's checked-lines line sound like speech.
8. Optionally, have someone answer Gil's "I haven't measured".
