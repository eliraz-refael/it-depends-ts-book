# Reader report: Chapter 20, full chapter (draft 1, first-time read)

Draft 1 (`b75fc8a6…`), 2026-10-23. A fresh, isolated reader had the full chapter, with Chapters 1–19
and the cast list (with pronouns) stated as prerequisites. It ran its own checks under TS 7.0.2 and
Node 22. The report is copied verbatim.

---

## Chapter 20 first-read report

I ran every snippet under tsc 7.0.2 with your flags (`--strict --exactOptionalPropertyTypes`, ES2022, Node16), then ran them with node 22 using type stripping. I added counters to `prepare` (once per call and once per tier) and to `evaluate`. My scratch files are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read/f/chk/.

**Bottom line:** Every printed output, count and quoted compiler error checks out. The chapter's argument holds. One real gap: the renderers still use the point-free `lines.map(price)` pattern that broke in the opening scene, and the typed `PriceLine` "promise" does not protect against it. Close to ready.

### 1. Summary
The chapter claims that a call boundary is only worth having if it commits to something. It starts with Linoy shortening `lines.map(line => lineTotal(line))` to `lines.map(lineTotal)`. `map` then passes the index as the discount, so the output becomes 100,99,98. Dima fixes it by turning the discount into an object parameter, so the shortened form stops compiling. Daniel then separates partial application (an arrow that fixes one argument) from currying. Dima declines to export a curried `discountedBy`, because reporting can write that arrow itself.

Tiered promotions change the picture. Validating and sorting the tiers is package-owned work. The adapter around `lineTotal` repeats it per line (6 preparations, 18 tier validations), while a `priceWith(promotion)` factory does it once. In the Turn, the factory turns out to validate eagerly, so an invalid promotion now throws even on an empty statement. The room decides that is what they want.

The Verdict: publish `priceWith` and keep `lineTotal` for checkout, with `lineTotal` delegating to `priceWith`. Create the pricing function at promotion setup and handle the error there. Keep the empty-invalid-run test. The plain discount adapter stays in reporting. The Additional Take shows that the first call of a curried generic fixes `T`.

### 2. Where I got lost or had to reread
- **Three identical lines:** "That second call is the whole old fixture. One item." There is no earlier "old fixture" on the page. I had to work out that Gil means the earlier test had only one line, which is why index 0 hid the bug. One clause of setup would fix it.
- Daniel's "This caller does supply it. Making the parameter required still compiles." I first read "this caller" as checkout. It means `map`, which does supply a second argument: the index. Saying "`map` does supply it" would be clearer.
- **Who owns the arrow?:** Dima's "You already have that function. Checkout has both arguments. Why should its callers make a function just to call it immediately?" Linoy hasn't proposed replacing `lineTotal` yet; she only said "That's what I want the package to return." Dima is answering a proposal nobody has made, and I had to infer he assumed she meant replacing the two-argument API.
- **The Turn:** "From zero to what?" / "It doesn't get that far." The second line has no speaker name. It is presumably Gil, but after a named Linoy line it reads as unattributed.
- "The old adapter was never invoked on an empty list." On first read this sounds like nobody ever tested an empty list. It actually means that on an empty list the adapter is never called, so validation never ran. Something like "With an empty list the old adapter never ran, so nothing validated" would help.
- **The Principle:** "Put a call boundary where a caller has enough information to make something it can use: a result now, or a function for later." I had to reread this abstract sentence; it only made sense after the chapter. The concrete test ("Check what each call commits to, and what the next caller will actually pass") is in the second paragraph. I'd lead with that and make it sharper, for example: "Before splitting a call, say what the first call does (work, throwing, fixing types) and what the next caller passes."

### 3. Code, counts and claims
Everything below matches when run:
- **Opening fixture:**
  - `lineTotal(lines[0], 10)` prints 90.
  - The arrow form prints 100,100,100.
  - `lines.map(lineTotal)` prints 100,99,98.
  - `lines.slice(0,1).map(lineTotal)` prints 100.
- "Making the parameter required still compiles": confirmed. `(line, percent: number)` passed to `map` gives no error.
- **Object parameter:**
  - `lineTotal(lines[0], {percent:10})` prints 90.
  - `lineTotal(line)` with no second argument still compiles and prints 100.
  - `lines.map(lineTotal)` gives TS2345.
  - **Error text caveat:** the chapter quotes only the innermost line, "Type 'number' has no properties in common with type 'Discount'." The real TS2345 message starts with "Argument of type '(line: Line, { percent }?: Discount) => number' is not assignable to parameter of type '(value: Line, index: number, array: Line[]) => number'", followed by "Types of parameters '__1' and 'index' are incompatible." A reader who runs it sees a different first line. Either quote the headline or mark the quote as the last line of the elaboration.
- **Reporting consumers:** statement prints 270 and preview prints 90,90,90. `discountedBy({percent:10})(lines[0])` prints 90, and its preview prints 90,90,90.
- **Tiered run:**
  - Totals: 520, preview 100,180,240.
  - Adapter path: 6 preparations, 18 tier validations, 6 evaluations.
  - Stored `priceWith` path: 1 preparation, 3 validations, 6 evaluations. The table is correct.
  - The checkout call `lineTotal(orderLines[0], promotion)` prints 100 and adds exactly 1 preparation. Gil's "prepared once before and prepares once now" holds.
  - `prepare` sorts a fresh mapped array; the input tiers stay in their original order (consistent with the immutability chapter).
  - A line below every tier's minimum gets no discount (I checked with min 5, qty 2: prints 200).
- **Batch claim:** one batch of six gives 1 preparation; two batches of three give 2. Correct by construction.
- **Noam's "If you later need another required argument, this assignment stops compiling":** confirmed. A two-required-parameter function assigned to `PriceLine` gives TS2322, "Target signature provides too few arguments."
- **The Turn:**
  - `statement([], line => lineTotal(line, invalid))` prints 0.
  - `priceWith(invalid)` throws a RangeError with "Invalid promotion tier" (percent 101 > 100).
  - "Validation happens when the factory is called, before any line" is accurate.
- **Additional Take:**
  - `pair({a:1},{b:2})` is accepted. The inferred `T` is the normalized union `{a:number; b?:undefined} | {a?:undefined; b:number}`, not `{a}|{b}`. "Both arguments participate in inference" is true, but a curious reader who hovers will see this odd type. A half-sentence would help.
  - `pairWith({a:1})({b:2})` gives TS2353. The quoted message drops the start, "Object literal may only specify known properties, and"; that is acceptable but inconsistent with how TS2345 was quoted.
  - `pairWith<Either>(...)` is accepted.

**The substantive problem: the opening bug comes back and Noam's promise doesn't catch it.** `statement` and `preview` both call `lines.map(price)` point-free, which is exactly the pattern that broke in scene one. Noam says the `PriceLine` annotation on `layout` is "a promise somebody can keep." But it only rejects an extra *required* parameter. Suppose Dima's returned function later gains an optional numeric parameter, such as `function priceLine(line: Line, extraPercent = 0)`. It still type-checks as `PriceLine`, and `preview` prints 100,99,98 again. I ran this and it compiled clean.

Given the chapter opens on this hazard, either someone should notice it (Noam is the natural person), or the renderers should write `lines.map(line => price(line))`. As written, the chapter teaches the lesson and then repeats the hazard in its own consumer code without comment.

Minor:
- `const price` is declared at lines 96, 186 and 277, and `lineTotal` three times. That's fine as evolving snippets.
- `lineTotal(lines[0], ...)` would fail under `noUncheckedIndexedAccess`, if the book uses it elsewhere.

### 4. The Turn
It is partly genuine. It changes what Linoy thinks the factory is: "I was treating it as a shorter way to write the arrow." It also adds two real obligations: handle the error at setup, and say the factory can reject the promotion. Those make it into the Verdict and the tests.

It does not change the decision, though. The room confirms the eager design it already had and rejects lazy validation on the first call. That's acceptable, but the discovery is convenient. Gil, who has been counting, suddenly reports "The empty statement changed" with no reason given for checking empty runs. A line on why he looked would help, for example an empty statement in the regression fixture or an operator report.

The lazy "prepare on its first call and keep the result" alternative is handled well. Dima's objection, that creating the function would no longer tell you the promotion passed validation, is the strongest line in the section.

### 5. The ending
The Verdict follows from the scenes. Every clause traces back to a scene: publish `priceWith`, keep `lineTotal`, create the function at setup, test the empty invalid run, and keep the plain adapter in reporting. Dima's closing "this isn't a request for two exports for every calculation" cleanly ties back to his earlier refusal of `discountedBy`.

Neglected alternatives, in order of how much they'd matter to a reader who has read Chapters 1–19:
- **A validated, branded `PreparedPromotion` / `ValidPromotion`.** Dima rejects publishing the prepared representation because he doesn't want reporting to depend on how the tiers are stored. A branded or opaque type exposes no shape, and the earlier chapters on branded types and runtime validation set the reader up to expect "parse, don't validate" here. Someone, likely Eden Legacy or Prof. Typeworth, should raise it and have it rejected or absorbed for a reason. A plausible reason: reporting still needs a function to hand to the renderers, so the factory is the smaller surface.
- **Return a Result instead of throwing.** Noam says "say the factory can reject the promotion. Its return type only describes the function you get if it succeeds." That points straight at encoding the failure in the return type, and then nobody does it. Either make it part of the decision or have someone say why throwing is fine here.
- **A memo cache inside `lineTotal`** (a WeakMap keyed by promotion). It would fix checkout's repeated preparation too. It is probably rejected because of hidden state and deferred validation, which is Chapter 19 territory. It's a cheap line to include, and Dima's "We haven't changed that cost" sets it up.

### 6. Characters
- **Dima** is the best-drawn character. He owns the package, resists convenience exports, and protects the internal representation. His pragmatism is consistent.
- **Linoy** fits the cutting-edge, shortening instinct at the start, and she grows by the end. The "I should have started with that" reveal works.
- **Gil** is the counter and has a clear function. His "I haven't measured how much time that costs" is good and in character.
- **Noam** wants compile-time guarantees, which gives him a distinct voice. He is also the one who should catch the point-free issue in section 3. His last scene exchange, "It doesn't leave the package…", reads like it exists to close Dima's worry about the array shape. Dima had already raised and settled that himself at line 202, so the exchange at lines 258–260 is redundant.
- **Daniel** is mostly a definer. His currying definition ("Currying changes a multi-argument function into successive calls that each take an argument") is textbook voice, though he does get the good ordering point ("Currying doesn't require that order"). He comes closest to existing only to deliver lines.
- **Pronouns:** "She replaces `discountedBy`" refers to Linoy, which is correct. I found no pronoun errors; most characters are never pronouned.

### 7. Voice: lines that read like documentation
- "Dima maintains the pricing package used by checkout and reporting. Checkout passes a line and its discount together. Reporting calls the same function to price the lines on a statement; omitting the discount means full price. The prices in their small fixture are integer amounts, chosen so no rounding is involved." The last sentence in particular is the author talking.
- "Reporting has two consumers: a statement renderer that totals the priced lines, and a preview that displays each price. Their pricing callback takes one line and returns a number. These small versions show the calls they make:"
- "The next promotion gives different discounts for different quantities of a product. Its tiers arrive in no particular order. The package must validate them, order them for lookup, and choose the highest qualifying minimum for each line. This is why a single `percent` is no longer enough." This reads like a spec; "This is why…" is explanatory filler.
- "`prepare` and `evaluate` are private to the package. The renderers still receive a `PriceLine`. The lines supplied to pricing already have valid positive quantities and finite nonnegative unit prices; this code checks the promotion's rules. A line below every tier's minimum gets no discount." This is the most manual-like paragraph in the chapter. Some of it could be Dima saying it aloud ("Lines come in already validated; I only check the tiers").
- "Gil repeats his count for the two reporting calls, excluding that separate checkout call:" This is stage direction that exists to scope the table.
- Noam's "And say the factory can reject the promotion. Its return type only describes the function you get if it succeeds." This is close to a doc comment spoken aloud, though it's acceptable.

### 8. Cuts and additions
- **Cut or merge:** the Dima/Noam "lookup function instead of sorted array" exchange (lines 258–260). It repeats line 202.
- **Cut or trim:** the batch digression (246–250). It's short and does honest work, but Gil's "We don't need a timing argument to distinguish them" is slightly opaque. Keep it only if it earns its place.
- **Add:**
  - The point-free `lines.map(price)` issue in the renderers, ideally caught by Noam (section 3).
  - One beat on the branded or validated-promotion alternative.
  - A setup line for "old fixture".
  - The speaker name on "It doesn't get that far."
  - Optionally, the full TS2345 headline.

### 9. Overall
Close. The code, numbers and errors are all correct, and the arc from shortcut to package-owned preparation to eager-validation consequence holds together. Before it's ready it needs four things:
- Address the renderers' point-free `map(price)`, which reproduces the opening bug and slips past the `PriceLine` promise.
- Give the branded or Result alternative one exchange, since the reader's prior chapters make it the obvious question.
- Tighten the four reread spots listed in section 2.
- Move the narrated spec paragraphs into speech.
