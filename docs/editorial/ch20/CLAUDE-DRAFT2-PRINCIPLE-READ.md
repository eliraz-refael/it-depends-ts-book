# Reader report: Chapter 20, "The Principle" (draft 2, first-time read)

Draft 2 (`80c6362e…`), 2026-10-23. A fresh, isolated reader had only the Principle extract, with the
earlier chapters stated as prerequisites. The prompt and the four cases were the same as the draft-1
read.

The reader's own `npx tsc` hung while installing and never ran, so its type-level claims come from
its own knowledge. The book's checks verify those cases on TS 7.0.2. I stopped the hung background
work after the report arrived. The report is copied verbatim.

---

First-time reader report: Chapter 20 Principle (currying and partial application)

I read only principle-extract.md. It has two paragraphs, both spoken by Daniel Compiler. For case (a) I ran a JavaScript check: `[{10,1},{10,1},{10,1}].map(lineTotal)` gave `[10, 9, 8]`, while the arrow version gave `[10, 10, 10]`. The index becomes the discount. My TypeScript compile check (npx tsc) hung on install and never ran. So the type-level claims in (a), (b) and (c) come from my own TypeScript knowledge, not from compiler output. My scratch files are /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read2/p/check.ts and /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read2/p/run.mjs.

## 1. The rule, quoted

Definitions (not rules):
- "Partial application supplies some arguments now and leaves a function for the rest."
- "Currying turns a function taking several arguments into successive calls taking one argument each."

Rules:
- R1: "Start with a local arrow when you only need to hold an argument for later."
- R2: "Ask the package to prepare something once when that work belongs inside it; return a function if that's what its consumers need."
- R3: "Check each call separately." The reasons: "the first call is still a call. It can do work and throw. TypeScript can choose type arguments there, before the later arguments arrive."
- R4: "check the code that calls your function: `map` passes the element, index and array. Write an arrow if you mean to forward only the element."
- Summary line: "Splitting the parentheses doesn't make those decisions for you."

Is it explicit and testable?
- R1 is the most testable. The trigger is "only need to hold an argument for later", and the action is a local arrow. The default is clear: don't curry the shared function, write a local arrow.
- R4 is concrete and testable. You can check whether a function goes point-free into `map` with optional or extra parameters.
- R3 is a clear instruction, but it only says *that* you should check. It doesn't say what you are checking for. "TypeScript can choose type arguments there" hints at the inference problem but never says "and it may choose `unknown`".
- R2 is the vaguest:
  - "when that work belongs inside it" is the whole test, and the section never says how to decide that.
  - "return a function if that's what its consumers need" moves the question onto consumers without saying how to tell what they need.
  - "prepare something once" seems to mean precomputation, such as compiling a validator or building a lookup table, but no example is given.
  - The rule mixes two ideas: an optimisation (do the work once) and API shape (return a function). I couldn't tell whether both must hold or either one is enough.

## 2. In your own words

If you just want to hold an argument for later, write a small arrow where you need it. Don't reshape a shared function into curried form for that. Have a package return a prepared function only when the package itself has setup work to do once, or its callers really want a function. Splitting a call into stages doesn't make anything free or safe. The first stage runs: it can do work, throw, and fix generic type arguments before it has seen the later arguments. So reason about each stage on its own. When passing a function point-free, check what the caller actually passes. `map` passes three arguments, so use an arrow unless you really mean to accept all of them.

## 3. Apply it

**(a) `lines.map(lineTotal)` with `lineTotal(line, discount = 0)`**

- Verdict: not safe. `map` calls `lineTotal(line, index, array)`, so the index becomes the discount. Line 0 gets discount 0, line 1 gets 1, and so on. My JavaScript run confirmed `[10, 9, 8]` against `[10, 10, 10]`. I believe TypeScript accepts this silently, because the index is a `number` and so is `discount`, but I couldn't compile it.
- Words relied on: R4 almost word for word: "`map` passes the element, index and array. Write an arrow if you mean to forward only the element." The action is to keep `line => lineTotal(line)`.
- Decided myself:
  - That TypeScript wouldn't catch it. The section doesn't say the compiler stays quiet here.
  - That this is "the code that calls your function". The section frames that from the author's side ("check the code that calls your function"), but here the hazard is created by the caller's refactor. I read R4 as applying to both the author and the refactoring teammate.
  - From an earlier chapter: a rewrite must keep what callers receive, and this one doesn't.

**(b) `const amounts = mapEach(r => r.amount);` before any array is in sight**

- What happens: at the first call TypeScript has nothing to infer `T` from, so `T` becomes `unknown`. Then `r.amount` fails with "'r' is of type 'unknown'". (I'm confident this is the error, but I couldn't run the compiler.)
- Words relied on: R3: "TypeScript can choose type arguments there, before the later arguments arrive. Check each call separately."
- What I'd change, with the options:
  - Annotate the parameter: `mapEach((r: Row) => r.amount)`.
  - Pass the type argument: `mapEach<Row, number>(...)`.
  - Apply it only where the array is present (`mapEach(r => r.amount)(rows)`, or simply `rows.map(r => r.amount)`).
  - Per R1, if this is only a local need, use a plain local arrow, `const amounts = (rs: readonly Row[]) => rs.map(r => r.amount)`, and maybe don't use `mapEach` at all.
- Decided myself:
  - The concrete failure. The section doesn't say `unknown`, and it doesn't say whether the result is an error or a silent widening.
  - Which fix to pick. The section gives no guidance.

**(c) `pick<Order>("total")` with `pick<Row, K extends keyof Row>(key: K)`**

- What happens: TypeScript doesn't support partial type-argument lists, so this fails ("Expected 2 type arguments").
- What the Principle suggests: the line "TypeScript can choose type arguments there, before the later arguments arrive" points at splitting the generic call. `pick<Row>()` fixes `Row` in the first call, and the returned `<K extends keyof Row>(key: K) => ...` infers `K` in the second. That gives `pick<Order>()("total")`.
- Words relied on: R3's sentence about choosing type arguments at the first call. I'm reading it as an opportunity here, while (b) shows the same mechanism as a hazard.
- Decided myself: almost everything.
  - The section never states the partial-inference limitation, or that currying is the standard workaround.
  - It also doesn't say whether this is a legitimate reason to curry under R2 ("if that's what its consumers need"). I decided it is.
  - I'd still apply R3: the empty first call `pick<Order>()` is a real call, and it shouldn't do work or throw.

**(d) `on(eventName)` returning a function that takes the handler**

- What the Principle suggests: by R1, callers who know the event name early and register later can write `const onSave = (h) => on("save", h)` themselves. Nothing has to change in the registry.
- Who owns it: by R2, the registry should own `on(eventName)` only in two cases:
  - Some work belongs inside the registry and should happen once per event name. Examples: validating the name against a known list, creating or looking up the listener bucket, or resolving a typed payload for that event, as in (c).
  - Enough consumers really need a prepared function.
- If the registry does add it, then by R3:
  - `on("sav")` can throw at startup for an unknown name, possibly far from where the handler is registered.
  - It might eagerly create state, so it isn't free.
  - Its generic event-to-payload type gets fixed in the first call.
- My call: keep `on(eventName, handler)`, and let callers who need it write a local arrow. Add a registry-owned `forEvent(name)` only if per-name validation or typing is worth doing once.
- Decided myself:
  - What counts as work that "belongs inside" the registry.
  - How many consumers make "what consumers need" true.
  - Whether to keep both forms. The section gives no rule about offering both, about overloads, or about naming.

## 4. Where the section left me unsure

1. What does "work belongs inside it" mean? There is no test or example for deciding when preparation belongs to the package rather than the caller.
2. In R2, are "prepare something once" and "return a function if that's what its consumers need" two separate conditions, or one? Is either enough?
3. "Check each call separately": check for what? Throwing, side effects, type-argument choice? Do I document each stage's failures?
4. When TypeScript "can choose type arguments there", is that a warning, as in (b), or a technique, as in (c)? The sentence is neutral, so I couldn't tell whether the chapter endorses currying for type arguments.
5. Does R4 apply only to `map`, or to every higher-order caller? I assumed `forEach`, `filter`, `reduce` (which has a different argument order), Promise `.then`, and event callbacks. Is the warning about optional parameters, defaults and rest parameters specifically?
6. Who does R4 bind: the author of `lineTotal` (avoid trailing optional parameters?), or the caller who passes it point-free? "check the code that calls your function" reads as author-facing.
7. Should a shared function offer both a curried and an uncurried form? Nothing says so.
8. Where are the boundaries of the definitions? Is a function that takes two arguments first and then one more "currying"? Is `bind` partial application? The definitions are crisp, but the rules don't say whether the distinction matters for any decision.
9. "Splitting the parentheses doesn't make those decisions for you": which decisions? I took it to mean the decisions in R1–R4, but the antecedent is loose.

## 5. Clarity and voice

**Sentences I had to reread:**
- "Ask the package to prepare something once when that work belongs inside it; return a function if that's what its consumers need." It is two rules joined by a semicolon. "It" and "its" refer to different things (the work belongs inside the package; the package's consumers). "Ask the package" is odd phrasing for "design the package to".
- "TypeScript can choose type arguments there, before the later arguments arrive." Is this good or bad? It doesn't say.
- "And check the code that calls your function: `map` passes the element, index and array." There is a jump from "your function" to `map`. It took a moment to see that `map` is the code calling your function.
- "Splitting the parentheses doesn't make those decisions for you." This is a nice line, but "those decisions" is vague.

**Terms used without explanation:**
- "the package": which package? It reads as if it comes from an earlier scene or the chapter's scenario.
- "prepare something once": no example of what gets prepared.
- "type arguments" is fine given the generics prerequisite. But the inference-to-`unknown` behaviour behind the warning isn't spelled out.
- "point-free" is never used. That's fine, but the hazard in (a) is the point-free pattern, and naming it might help.

**Voice:**
- It mostly sounds like a specific, terse person: short declaratives, "But the first call is still a call," "Splitting the parentheses doesn't make those decisions for you." Daniel comes across as a pragmatic senior who distrusts cleverness.
- The first two sentences are textbook definitions and read like documentation, not like Daniel talking.
- The second paragraph has no attribution. I assumed it is still Daniel, since there is no new speaker tag, but a reader could wonder.
- It is very compressed. Every sentence carries a rule, with no example, so I needed my own snippets to make R3 and R4 concrete.
- The chapter title, "Before the First Line", ties nicely to the first-call idea, but its meaning isn't obvious from this section alone.
