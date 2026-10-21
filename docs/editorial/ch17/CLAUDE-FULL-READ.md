# Ch17 "The Price You Were Given": first-time full read

Only `ch17-full.md` was read. Line numbers refer to that file.

## 1. The rule

**What it tells me to do.** I can pull three instructions out of the Principle:
- (a) "Preserve the old value for anyone who needs it."
- (b) "For current state, keep changes behind an owner and keep writable references inside that boundary."
- (c) Mutating something while you build it is fine as long as nobody can observe it. The real question is what you promise "when you hand it over".

**Is it stated before the debate?** Yes, and (a) and (b) can be tested. For every holder, I can ask whether it needs the value as of a moment or the current value, and whether anything outside the owner holds a writable reference. The opening line, "Before you change an object, ask what the people holding it expect to keep", is a question rather than a rule. It works as framing because (a) follows it straight away.

**Gaps between the rule and the rest:**
- The Principle never says how a holder can *tell* which kind of thing it received. That is the problem the chapter actually turns on (line 197: "The type doesn't distinguish them"), and the Principle doesn't address it. In the end the answer is "you can't from `Quote`; test it" (line 303). The Principle should either admit that or rule on it. Something like "don't give a live view and a snapshot the same type" would be testable, and the Turn earns it.
- "Having just one writer doesn't make a live view into a snapshot" is the best sentence in the Principle, and the Turn pays it off exactly.

**Does the Verdict match?** Mostly. "Summary receives a live view; receipt receives a stable snapshot" is (a) plus (b). "A single writer, a readonly type, and a frozen object each leave the question of history unanswered" repeats the Principle's warning, and the chapter demonstrated all three. Two mismatches:
- Principle (c), local mutation, never appears in the debate or the Verdict. Only Gil's take pays it off. Either drop it from the Principle or let one debate beat use it.
- The Verdict adds "Keep the price calculation as a value-returning function". The Principle never states that rule. It falls out of the preview section, which is fine, but it means the Verdict rules on something the Principle didn't ask.

## 2. Story clarity

**Who holds what.** I could follow it:
- The **receipt** needs `before` and `after` as values.
- The **summary panel** needs a live read.
- The **promotion package** mutates a writable `Priced`.
- The **preview chooser** computes offers without committing.

Line 19 does a lot of the work up front ("The receipt keeps the price from before the promotion... The summary panel, by contrast, should show the current price whenever it renders"). It is dense narrator exposition, but useful.

**Where I lost track: forward references.** Several lines refer to things that don't exist yet:
- Line 98: "She puts the pricing rule in one constructor. **Both proposed APIs** will use it." At that point there is one proposed API. Guy has only said "tell the cart what discount to apply" (line 70), and there is no code for it yet.
- Line 152, Guy: "A shallow copy from **my constructor** would share them too." Guy has no constructor yet. `CartPricing` arrives at line 163.
- Line 154, Eden: "I don't want **`snapshot()`** returning an old price with tomorrow's quantities." `snapshot()` isn't defined until line 219, in the Turn. This is a continuity error, and it also spoils the Turn's fix before the Turn happens.
- Line 261: "She writes **the other handler**". There is no first handler yet. Guy's `chooseDiscount(checkout: CartPricing, ...)` comes afterwards, at line 294. So "the other" refers forward, and the reader shuffles backwards to find a handler that isn't there.

**Other stumbles:**
- Line 90: "Eden follows the call into the promotion package; there is no assertion to remove." I had to stop and work out why there would be an assertion. I think it means "no `as` cast is hiding the problem", but nothing set up that suspicion. Either set it up ("Guy: Somebody cast it?") or cut it.
- Line 74: "Daniel tries two writes **beside it**". Beside what?
- Line 88: Daniel's extra point ("A parameter with a writable `items` property could assign a different readonly array to it") is correct, but nothing uses it afterwards. It reads as a footnote spoken aloud.
- Line 259, Dafna: "But **callers** could keep the current value themselves too. The summary can read a binding." She then writes a factory that *owns* the value, which is the opposite of callers keeping it. I read the line twice. "A closure can own it too" is what she means.
- Line 189, Eden: "The constructor copies the numbers too. Keeping the object I passed in won't let me change your state." It replies to Guy's "the view has no setters" with a different point. I went back to check whether I had missed a question.

**Is each code block's purpose clear before it appears?**
- Clear: the first cart block, `applyPromotion`, the try/catch, `invented` ("And this?"), `CartPricing`, the Turn block, the `snapshot` fragment, the preview block, and both takes.
- Unclear: the `quote()` block, because "both proposed APIs" refers forward, and the `valueCheckout` block, because of "the other handler".
- The `snapshot()` fragment (lines 218 to 222) is a method on its own, with no class around it. The intro line tells me it belongs inside `CartPricing`, so I can follow it. A reader typing the examples in will need to merge it by hand.

**The preview demo proves nothing visible.** Lines 250 to 254 build a `CartPricing`, never call `applyDiscount`, and then show that `snapshot().total` is still 100. Of course it is. The failure Dafna describes ("apply a discount, read the price, and undo it") is never shown. The section's stake, "selecting neither must leave checkout unchanged", only lands if I see the apply/undo version go wrong: for example, the summary panel renders 80 mid-preview, or the undo throws on a bad offer and leaves the price discounted.

## 3. TypeScript/JavaScript claims

I checked every printed output by hand. All of them are right.

| Claim | Confidence |
|---|---|
| `Cart` (readonly props) is assignable to `Priced` (writable), lines 59 and 60 | **Know.** Readonly doesn't affect assignability. |
| `cart.total = 0` gives TS2540 | **Know.** |
| `appendGift(cart.items)` gives TS4104 with that message text | **Know.** |
| `applyPromotion(original, 20)` throws `TypeError` | **Know**, in strict code. ES modules are strict, and here `applyPromotion` sits in the same module. The book's framing is that it is a separate *package*. If that package were old sloppy-mode JS, the write would fail silently. Eden's take admits this, but the debate at line 118 ("I want that mistake to fail where it happens") states it without that qualifier. |
| `{ ...discounted, total: 0 }` is accepted as `Quote`; prints `20 0` | **Know.** |
| Getters in an object literal infer as readonly properties; `Object.freeze` of that literal is assignable to `Quote` | **Know**/**believe**. I'm confident it compiles. |
| `Object.freeze` on accessor properties leaves the getters working; `isFrozen` is `true` | **Know.** |
| The `read = () => this.#current` arrow is needed because `this` in the literal's getters would be the literal | **Know.** The text doesn't explain why `read` exists, though. A reader new to the pattern may wonder. |
| Outputs `Was 100. Now 80.` and `100 70` (offers replace, not accumulate) | **Know.** I traced them. |
| `const valueSummary: Readonly<{ total: number }> = values;` passes, with no excess-property check because it isn't a fresh literal | **Know.** |
| `copiedProperties` is 499500 | **Know.** 0 + 1 + ... + 999 = 999 * 1000 / 2. |
| `JSON.stringify(copied) === JSON.stringify(built)` is `true` | **Know.** The integer-like keys enumerate in numeric order in both. |
| `DeepReadonly<{at: Date}>` still lets you call `setUTCFullYear`, because the conditional passes function members through | **Know.** |
| A frozen `Date` still mutates through `setUTCFullYear`, because the internal slot isn't a property | **Know.** |
| Sloppy-mode assignment to a frozen property fails silently | **Know.** |

There are no wrong claims. The one I would tighten is line 118 versus Eden's take. The take is correct, but Dafna's main debate argument relies on the strict-mode behaviour without saying so. That caveat belongs in the debate, at Eden's line 129, rather than as an afterthought.

## 4. Fairness

**Dafna's strongest argument** is that values make history free and previews free (lines 247 to 254), and that ownership doesn't require a class (lines 259 to 287). She gets both. She gets her freeze argument as well, and her "So you keep old values too" jab at line 237 lands. What she doesn't get: the purist's objection to the live view itself. A frozen object whose properties change under you is exactly the thing an immutability person would call a lie. "A value that changes isn't a value. Make it a function." `() => Quote` would put "live" into the type. She says only "Even frozen." (line 210) and then lets Guy fix it.

**Guy's strongest argument** is tell, don't ask (line 70: "It can tell the cart what discount to apply"), one entry point that revalidates (line 167), and a live view that doesn't need rebinding (line 187). He gets those. His signature move never comes, though, and the chapter sets it up perfectly. At line 197 Eden says "The type doesn't distinguish them." This is Guy's "Where's the interface?" moment: `interface PriceView { readonly total: number }` versus `Quote`, two named types, so the compiler *does* find the mistake. Instead Guy answers with a second method that returns the same type (line 219), and at line 303 Eden concludes "The compiler can't find that mistake from `Quote` alone." Guy, the interface advocate, leaves a type-level problem to tests. That weakens him, and readers who know Guy will notice. (Line 278 even has Dafna annotating the summary as `Readonly<{ total: number }>`. She is the one who narrows the type, which should have been Guy's line.)

**Does one side win because the other is weak?** Slightly, in Dafna's favour, through structure rather than arguments. Guy's design produces the bug in the Turn. He fixes it by adopting Dafna's value. Then Dafna shows his class is optional, and Eden says "So the class isn't what the panel needs" (line 291). Guy keeps "an owner", but by the end it is a word both sides use, with nothing specific to Guy. He never pushes back. "I can work with that" (line 287) and "Nor do I" (line 257) are concessions with no counter-claim.

**Is the converged Verdict earned?** The value-for-history part is earned. The Turn shows the failure and Guy's `snapshot()` fixes it. The class-or-closure question is not earned. It is dismissed in a narrator sentence ("Choosing a class over the closure is not part of this ruling", line 311) after the debate spent a section on it. Two disagreements should stay open, or at least be stated:
1. **Live view as data versus live view as a call.** Getter-backed `Quote` (Guy) versus `() => Quote` or a separately typed view (Dafna, or Guy-with-interface). This is the chapter's real hazard, and the Verdict doesn't rule on it.
2. **Class versus closure.** Each should get one line on why they would still choose their own. Guy might cite a named type to depend on and a place to add operations. Dafna might cite no `this`, no `#`, the arrow trick in `view()` being unneeded, and a smaller surface.

## 5. Voice

**Machine-written reply openers:**
- line 131 "**Yes.** `withDiscount` returns the replacement."
- line 146 "**Agreed.** The owner should accept..."
- line 154 "**Good.** I don't want..."
- line 187 "**Exactly.** It doesn't need rebinding..."

That is four in the first half. Cut all of them.

**Narrator scoring or teaching:**
- Line 90: the handbook citation in narration is fine. "there is no assertion to remove" is narrator verdict-giving.
- Line 311: the whole paragraph after the blockquote is narrator legislation ("The accepted boundary uses...", "is not part of this ruling"). It reads like an ADR. Either give it to a character or cut it to one sentence.
- Line 291: Eden summarises for the reader ("So the class isn't what the panel needs. It needs a live read. Here's the handler with Guy's owner:"). He is acting as a teaching proxy.

**Forced slogans:**
- line 337 Dafna "Once you publish it, keep that promise."
- line 313 Eden "It just didn't do this job." This one is mild and ends the chapter fine.
- The Principle's "Those are different promises, even if both callers only read" is good, not forced.

**Lines answering something not said:**
- Line 189 (Eden on the constructor copying), described above.
- Line 154 (Eden on `snapshot()` before it exists).
- Line 152 (Guy's "my constructor").

**Cover-the-names test** (could I tell who says it?):
1. "It refuses the array, but accepts the price?" (Guy). Anyone could say it.
2. "So the receipt has the same object under a more reassuring name." (Dafna). It's witty, but it could be Guy or Daniel.
3. "That catches this writer. It doesn't migrate the caller." (Eden). **Identifiable.** It's his migration voice.
4. "The getters read whichever quote is current when they're called. So the panel keeps the view, not a quote?" (Dafna). Anyone could say it. Dafna is serving as Guy's interviewer here.
5. "The promotion module gets neither a writable quote nor the view. It supplies an amount." (Guy). Anyone could say it.
6. "Nobody outside that function." (Dafna). Anyone could say it.

Only one in six is identifiable. Eden is the only character with a consistent lens (diffs, call sites, enabling on a path). Guy never uses OOP vocabulary beyond the "tell" at line 70. Dafna's only FP-flavoured lines are "return a value" and "It doesn't require a class." Liron appears only in the Principle, with no parable. Daniel is properly precise, but only gets two lines in the debate.

**Is it fun?** The opening is the most fun part: "*Was 80. Now 80.*" / "It was a hundred. The discount worked. The receipt forgot." Other good moments are "more reassuring name", "Even frozen.", "So you keep old values too.", and Daniel's "frozen clock". The middle (lines 156 to 305) is procedural: short questions, short answers, code, agreement. There is no moment where two people actually push against each other for more than one exchange. It is not documentation, but it is close to a design review transcript.

## 6. Density and length

**Too terse:**
- Lines 129 to 131. The real migration cost ("The promotion now throws, so I have to replace its call") gets two lines and a "Yes." This is where Eden's strict-mode concern and the package's *other* callers (line 46: "Its existing callers expect it to update that price in place") should come up. Can Eden change a shared package? The chapter never says.
- Lines 241 to 289. The class-versus-closure exchange resolves in about six lines.
- Line 88. Daniel's replacement point is packed in and never used.

**Said twice:**
- Line 305, Dafna: "Test both. Keep one snapshot, apply two discounts, and check that only the live view follows them." That is the block at lines 227 to 234, which already ran.
- "Re-derive the total on entry" appears three times: line 144 (Dafna), line 146 (Guy), and lines 189 to 191 (Eden and Guy).

**Missing that I expected:**
- **A type-level answer to "the type doesn't distinguish them"**, or an explicit decision not to have one. Distinct interfaces, a brand (the book covered branding earlier), or `() => Quote`. This is the biggest gap.
- **A real cost of the value approach in the main debate.** Gil's take covers copying, but inside the debate nobody says what values cost here. Allocation per discount is trivial for three numbers, so the honest cost is migration: every caller of `applyPromotion` changes. Eden gestures at it. It should be a beat, not a clause.
- **A real dissent** at the end, from either side (see section 4).
- **The apply/read/undo failure** in the preview section (see section 2).
- **Liron.** He is listed as the parable-teller, and he is absent after the Principle. One parable about a price tag on a shelf versus a printed receipt would fit and would add fun.

**Length.** The chapter is short. The debate could take another 300 to 500 words if those words go to the missing disagreement, not more agreement.

## 7. Additional Takes

- **Gil (import index).** This is an *application* of Principle (c), building by mutation while nobody can observe it, plus a cost of the immutable style counted in property copies. It is new to the chapter because the debate never touches (c). His counting is honest ("That counts property copies, not milliseconds"). It adds something, but it is also the only place (c) is demonstrated, which suggests (c) either belongs in the debate or isn't part of the Principle. Dafna's reply, "Once you publish it, keep that promise.", is a slogan. "Fine by me. No caller has an earlier index it's trying to keep." is enough.
- **Daniel (DeepReadonly and Date).** This is a **new limit**. Neither a recursive readonly type nor freezing protects internal-slot state, and methods stay callable. It is good and well scoped, and it ends with practical advice ("a number would make the snapshot's promise easier to keep"). It is the strongest take.
- **Eden (sloppy mode).** This is a **new limit**, and it directly qualifies Dafna's line 118 argument. Because it undercuts a main-debate claim, I would move it into the debate at line 129. If it stays a take, have Eden name Dafna's line ("Dafna's freeze only throws because...") so the link is explicit.

All three add something new. None of them repeats the debate.

## 8. Top 5 changes, ranked

1. **Give the Turn a type-level fight.** Eden's "The type doesn't distinguish them" (line 197) should set off the chapter's real disagreement:
   - Guy: "Where's the interface?" `view(): PriceView` versus `snapshot(): Quote`.
   - Dafna: a live view that pretends to be data is the bug. Make it `() => Quote`.
   - Let them argue for real, then have the Verdict rule, or record which of them still disagrees. This fixes Guy's fairness problem, replaces "the compiler can't find that mistake" (line 303) with a decision, and gives the Principle a testable clause ("don't give a live view and a snapshot the same type"), if the chapter lands there.
2. **Fix the forward references.** Line 98 ("Both proposed APIs"), line 152 ("my constructor"), line 154 (`snapshot()`, which also spoils the Turn), and line 261 ("the other handler"). Also cut or set up "there is no assertion to remove" (line 90) and "beside it" (line 74).
3. **Keep a real dissent on class versus closure.** Replace the narrator ruling at line 311 ("not part of this ruling") with one exchange where Guy and Dafna each say why they'd still choose their own. Let it stand unresolved.
4. **Cut the voice tics and give the characters distinct voices.**
   - Remove "Yes." / "Agreed." / "Good." / "Exactly." (lines 131, 146, 154, 187), Dafna's repeated test line (305), and the repeated revalidation exchange (lines 189 to 191).
   - Give Guy OOP vocabulary and at least one point where he refuses to concede.
   - Give Dafna the purist's objection to getters.
   - Give Liron one short parable in the debate.
   - Reassign Eden's line 291 summary so he isn't teaching.
5. **Make the preview and migration beats cost something.**
   - Show the apply/read/undo preview going wrong (for example, the panel renders 80 mid-preview), so lines 250 to 254 prove more than "an untouched object is untouched".
   - Move Eden's strict-mode caveat into line 129, where Dafna's freeze argument depends on it, and have him raise the package's other in-place callers from line 46.
