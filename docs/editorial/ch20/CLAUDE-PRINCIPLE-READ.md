# Reader report: Chapter 20, "The Principle" (draft 1, first-time read)

Draft 1 (`b75fc8a6…`), 2026-10-23. A fresh, isolated reader had only the Principle extract, with the
earlier chapters stated as prerequisites. It was given four cases:
- the `map` index;
- a data-last helper partially applied with no data in sight;
- one explicit type argument;
- the event-registry transfer.

The report is copied verbatim. The reader checked its cases with its own scratch compiler; the
"TypeScript 5" it mentions is the reader's own, not the book's TS 7.0.2.

---

## Chapter 20 Principle: first-time reader report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read/p/principle-extract.md`. It's two short paragraphs, both spoken by Daniel Compiler. I checked cases (a) to (c) with `tsc --strict` (TypeScript 5) in a scratch file in that same folder, `check.ts`. Results are below.

### 1. The rule, quoted

> "Put a call boundary where a caller has enough information to make something it can use: a result now, or a function for later. If an argument is already known, you can fix it in an arrow and leave the remaining arguments for its caller. That doesn't require changing the original function's API."

> "But the first call is still a call. It can do work, throw, and fix type arguments before the next call happens. Check what each call commits to, and what the next caller will actually pass. Splitting the parentheses doesn't make those decisions for you."

**Is it explicit and testable?** Partly.
- **The testable part is the second paragraph.** It works as a checklist. For each call, ask three things:
  - Does it do work?
  - Can it throw?
  - Does it fix type arguments?

  Then ask what the next caller will actually pass. You can check all of these against real code.
- **The first sentence is a judgment, not a test.** "Enough information to make something it can use" doesn't say how much is enough. It doesn't say who "it" is: the caller or the call. It also never says when *not* to add a boundary.
- **Clear:**
  - Partial application can live in a caller-side arrow without changing the original API.
  - Splitting the parentheses doesn't settle anything for free.
- **Vague:**
  - "Call boundary" is never defined. I took it to mean the point where one set of parentheses ends and the next begins.
  - "Commits to" is not defined either.
  - The section never says who should own the split: the library or the caller. It only implies the caller *can* own it.

### 2. In your own words

You can split a function into stages: take some arguments now and return a function that takes the rest. Each stage should return something its caller can actually use, either a final value or a useful function. Usually you don't need to redesign the original function for this. A caller who already knows an argument can wrap the call in an arrow.

Each stage is a real call, though. It can run code and it can throw. In TypeScript it also locks in type parameters before the later arguments arrive. So check what each stage decides on its own, and check what the code calling the next stage will really hand it. Currying is a design choice you have to make on purpose. The syntax doesn't make it for you.

### 3. Apply it

**(a) `lines.map(lineTotal)`: not safe.**
- `Array.prototype.map` is "the next caller," and it passes `(value, index, array)`. The index lands in `discount`. TypeScript accepts it because the index is a `number`.
- In my check, three identical lines gave `[10, 10, 10]` with the arrow and `[10, 0, -10]` with the point-free form.
- **The rule says:** keep the arrow, or wrap `lineTotal` in a one-argument arrow.
- **Words I relied on:** "what the next caller will actually pass" and "fix it in an arrow."
- **What I decided myself:** the section never mentions `map`'s extra arguments, or the risk of passing a function point-free when it has optional parameters. I recognized that from the earlier filter/map chapter ("a rewrite must keep what callers receive"). A reader without that chapter might not link "what the next caller will pass" to the index.

**(b) `mapEach(r => r.amount)` on its own line: a type error.**
- `T` has to be fixed at the first call, and nothing there tells TypeScript what `T` is. So `T` becomes `unknown`, and `tsc` reports `'r' is of type 'unknown'` (TS18046).
- **Fixes:**
  - annotate the parameter: `mapEach((r: Receipt) => r.amount)`;
  - pass the type explicitly: `mapEach<Receipt, number>(...)`;
  - or apply it where the array is known, e.g. `mapEach(r => r.amount)(receipts)`. I assumed the full chain would infer here, but I didn't run that form.
- **Words I relied on:** "fix type arguments before the next call happens" and "check what each call commits to."
- **What I decided myself:** the section doesn't say what happens when the first call has *too little* information to infer a type. I had to know about `unknown` defaulting. "Enough information" in the first sentence hints at it, but not concretely.

**(c) `pick<Order>("total")`: needs a split, and the rule points toward one.**
- As written, `pick<Order>("total")` fails with TS2558: "Expected 2 type arguments, but got 1." TypeScript has no partial type-argument inference.
- **The rule suggests** splitting at the type parameters: `pick<Row>()` returns `<K extends keyof Row>(key: K) => (row: Row) => Row[K]`. The caller writes `pick<Order>()("total")`. This compiled and `K` was inferred.
- **Words I relied on:** "a first call... can fix type arguments" and "a function for later."
- **What I decided myself:**
  - That an empty first call `()` counts as a reasonable "call boundary." The section talks about fixing *arguments*, and this boundary carries no value arguments at all.
  - That the extra `()` is worth its awkwardness.
  - Whether this justifies changing `pick`'s public API. The first paragraph's "doesn't require changing the original function's API" seems to push the other way, so I'm unsure whether the section endorses this.

**(d) `on(eventName)` returning a handler-taker: probably not in the registry.**
- I read the rule as preferring that callers who know the event name early fix it themselves: `const onSave = (h: Handler) => on("save", h)`. That needs no API change, and one-shot callers keep the simple `on(name, handler)`.
- If the registry does offer the curried form, the second paragraph says to decide what the first call commits to:
  - Does `on("sav")` validate the name and throw at startup? That might be a real benefit.
  - Does it allocate or register anything before any handler exists?
  - For a typed event map, does it fix the handler's payload type?
- **Words I relied on:** "fix it in an arrow and leave the remaining arguments for its caller," "doesn't require changing the original function's API," and "can do work, throw."
- **What I decided myself:** who owns the split. The section shows the caller *can* own it. It never says when the library *should*, for example when the first call can do useful validation or narrow types.

### 4. Where the section left me unsure

1. What exactly a "call boundary" is: a nested arrow in the signature, a caller-side arrow, or both.
2. Who "it" is in "make something it can use": the caller, or the call.
3. When the library should ship a curried API versus leaving callers to write arrows. The first paragraph leans toward callers; the second gives reasons a library-side first call might matter.
4. Whether "fix" in "fix it in an arrow" (bind a value) and "fix type arguments" (lock in a generic) are meant to be the same idea. The same verb does two jobs.
5. Whether a first call that "does work" is good (precompute once, validate early) or a hazard (side effects, hidden inputs). The text lists it as a fact, not a verdict.
6. Whether passing a function point-free, `map(f)`, counts under this rule at all. I applied "what the next caller will actually pass" to it, but I'm not sure that's intended.
7. The title "Before the First Line" doesn't obviously connect to the Principle.
8. There's no failure case or "don't curry when..." line to test the rule against.

### 5. Clarity and voice

**Sentences I reread:**
- "Put a call boundary where a caller has enough information to make something it can use: a result now, or a function for later." "Call boundary" is undefined, and "it" is ambiguous.
- "If an argument is already known, you can fix it in an arrow and leave the remaining arguments for its caller." Whose caller: the arrow's or the original function's?
- "It can do work, throw, and fix type arguments before the next call happens." It's a dense list of three different kinds of consequence, and the third needs generics knowledge to parse.
- "Check what each call commits to." "Commits to" is abstract until you've worked case (b) or (c).

**Terms used without explanation:** "call boundary," "fix" (in both senses), "commits to," and "splitting the parentheses." Neither "currying" nor "partial application" appears in the section, even though they're the chapter's subject.

**Voice:** It reads as one person, Daniel, making a compact point and then qualifying it ("But the first call is still a call"). That turn and the closing line "Splitting the parentheses doesn't make those decisions for you" sound like a person talking. Otherwise it's close to documentation: no example, no stakes, no other character. The second paragraph has no speaker tag; I assumed it's still Daniel. For a Principle section, the rule does state checkable questions, but the main rule ("enough information") is the least testable part, and it comes first.
