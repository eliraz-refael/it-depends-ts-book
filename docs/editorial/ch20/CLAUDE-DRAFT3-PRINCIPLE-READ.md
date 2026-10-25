# Reader report: Chapter 20, "The Principle" (draft 3, first-time read)

Draft 3 (`d9c9d9aa…`), 2026-10-23. A fresh, isolated reader had only the Principle extract, with the
earlier chapters stated as prerequisites. The prompt and the four cases were the same as the earlier
reads. It checked its cases with the book's TS 7.0.2 binary and Node 22. The report is copied
verbatim.

---

First-time reader report: Chapter 20 "Principle" (file read: /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read3/p/principle-extract.md)

Scratch checks are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch20read3/p/ (a.ts, b.ts, c.ts). I type-checked them with the specified tsc and flags, and ran a.ts with node.

## 1. The rule, quoted

The section gives two definitions, then several rules:

- "Start with a local arrow when you only need to hold an argument for later."
- "A shared module should own the first call when that call does work only the module can do."
- "Return a function if the consumers need a function, or a prepared value if they need that."
- "Check what each call does, whether it can throw, and which type arguments it fixes."
- "And check the code that calls your function: `map` passes the element, index and array. Write an arrow if you mean to forward only the element."
- Closing line: "Splitting the parentheses doesn't make those decisions for you."

Is it explicit and testable? Mostly yes.
- **Clear and testable:**
  - The default is a local arrow.
  - Check three things about each call: what work it does, whether it can throw, and which type arguments it fixes.
  - Write an arrow when passing a function to `map` and you mean "element only".
  - I could apply all of these mechanically.
- **Vague:**
  - "work only the module can do." I'm not told what counts. Is it validation? Precomputing a lookup table? Reading a config the module privately holds? Closing over private state? The test for whether the module should own the first call depends on this phrase, and it is never illustrated.
  - "Return a function if the consumers need a function, or a prepared value if they need that." This is close to circular. How do I tell which one consumers need? I also don't know what a "prepared value" is: an object, a compiled regex, a validated config?
  - "Check ... which type arguments it fixes" says to check, not what to do when the answer is "the wrong one, too early". The second paragraph names the hazard ("inference can fix it before the later arguments supply enough information") but gives no remedy beyond "choose a type argument there deliberately".
  - It never says which is the default, currying or partial application. The definitions separate the two, but the rules mostly treat "split the parentheses" as a single move.

## 2. In your own words

Splitting a function into "some arguments now, the rest later" is a design decision, not free syntax. If you just want to remember an argument, write an arrow at the use site. Only bake a split into a shared module's signature when the first call does real work that belongs to the module. Then pick what that first call returns based on what callers actually use. Treat the first call as a real call: it can do work, it can throw, and it can lock in type parameters (for good or bad). When you hand a function to something like `map`, remember that `map` passes extra arguments, and wrap the function in an arrow if you only want the element to go through.

## 3. Apply it

**(a) `lines.map(lineTotal)` with `lineTotal(line, discount = 0)`: not safe.**
- **What the Principle says:** "`map` passes the element, index and array. Write an arrow if you mean to forward only the element." So keep `lines.map(line => lineTotal(line))`.
- **I verified it:**
  - tsc reports no error, because `index: number` fits `discount?: number`.
  - At runtime the results change from `[10, 10, 10]` to `[10, 0, -10]`, because the index becomes the discount.
  - From the earlier chapter: what callers receive changed silently.
- **Words I relied on:** the `map` sentence, almost verbatim.
- **What I decided myself:** that the type checker won't catch this. The section doesn't say so outright. Its "Check the code that calls your function" implies it, and stating it would help.

**(b) `const amounts = mapEach(r => r.amount);` on its own line.**
- **What happens:** tsc error TS18046, "'r' is of type 'unknown'". With no array in sight, inference fixes `T` at the first call, and with nothing to go on it picks `unknown`.
- **What the Principle says:** this is "inference can fix it before the later arguments supply enough information". Its remedy is "You can choose a type argument there deliberately".
- **What I'd change:**
  - Annotate the parameter: `mapEach((r: Row) => r.amount)`. This compiles.
  - Or pass type arguments: `mapEach<Row, number>(r => r.amount)`. This compiles.
  - Or, per the first rule, skip the helper and write `rows => rows.map(r => r.amount)` where the rows are known. That is "start with a local arrow". Since `mapEach` does no work "only the module can do", the Principle seems to argue against having it at all.
- **What I decided myself:**
  - Which fix to prefer. Annotating `r` seemed least noisy.
  - Whether "the first call fixes type arguments" covers this case at all. Here the first call takes the function, and `T` is fixed from that function's parameter. I had to work out that this is the hazard being described.

**(c) `pick<Order>("total")`.**
- **What happens:** TS2558, "Expected 2 type arguments, but got 1". TypeScript won't let you supply one type argument and infer the other.
- **What the Principle suggests (my reading):** "You can choose a type argument there deliberately". Split the type parameters across calls, so the first call fixes `Row` explicitly and a later call infers `K`: `pick<Row>() => <K extends keyof Row>(key: K) => (row: Row) => row[K]`.
  - I verified it: `pick2<Order>()("total")` infers `number`.
  - `"nope"` is rejected.
- **Words I relied on:** "choose a type argument there deliberately" and "which type arguments it fixes".
- **What I decided myself:** nearly everything. The section never mentions the "can't partially specify type arguments" limit or the empty-first-call trick. I'm also unsure whether an empty `()` call that does no runtime work passes the "work only the module can do" test. Fixing a type argument is arguably compile-time work only the signature can do, but the rule talks about work, not types.

**(d) Event registry `on(eventName)(handler)`.**
- **What the Principle says:**
  - Default to the local arrow. Callers who know the name early can write `const onSave = (h) => on("save", h)` themselves.
  - The registry should own `on(eventName)` only if that first call does work only the registry can do. Examples: validate the name against its event list and throw early, build or look up the listener bucket once, or narrow the handler's payload type from the event name (fixing a type argument deliberately, which is good here).
  - "Return a function if the consumers need a function, or a prepared value if they need that": the many-handler callers might be better served by a prepared value, such as a channel object with `.add(handler)` and `.remove(handler)`, than by a bare function.
  - Check whether `on(eventName)` throws for an unknown name, and when.
- **What I decided myself:**
  - That validation and type narrowing count as "work only the module can do".
  - Whether to keep both forms. The section doesn't say whether a module should offer both curried and uncurried versions.
  - That one-shot callers should keep `on(name, handler)`.

## 4. Where the section left me unsure

1. What counts as "work only the module can do"? There's no example. Is type narrowing or validation enough, or does it have to be runtime computation like a precomputed index?
2. How do I tell whether consumers "need a function" or "need a prepared value", and what is a prepared value concretely?
3. If the first call "can throw", is that a reason to split (fail early) or a reason not to (a surprising throw at setup time)? The section flags it without saying which way it cuts.
4. When inference fixes a type argument too early, is the remedy to annotate the caller, reorder the parameters (data-first versus data-last), or redesign the signature? The section only says "choose ... deliberately".
5. Does the rule against point-free `map(f)` apply only to functions with optional or extra parameters, or always? "Write an arrow if you mean to forward only the element" reads as always. Then why would anyone write data-last helpers meant to be passed point-free?
6. Should a shared module offer both a curried and an uncurried form? Who decides?
7. Currying is defined, but no rule speaks about currying specifically, as opposed to partial application. Is full currying ever recommended?
8. The title "Before the First Line" didn't connect for me. Does it mean before the first call, or before writing the first line of code?

## 5. Clarity and voice

**Sentences I had to reread:**
- "You can choose a type argument there deliberately, or inference can fix it before the later arguments supply enough information." On first read it sounds like two equally fine options. Only on rereading is the second one clearly the hazard. Something like "...or, if you don't, inference may fix it..." would make the contrast clear.
- "A shared module should own the first call when that call does work only the module can do." "Own the first call" is an unusual phrase. I had to work out that it means the module's exported signature is split, rather than the caller wrapping it.
- "Return a function if the consumers need a function, or a prepared value if they need that." It is circular as written.
- "But the first call is still a call." I understood it after a beat. It's a nice line, but it leans on the reader having just pictured a split function as "configuration, not a call".

**Terms used without explanation:**
- "prepared value"
- "own the first call"
- "fixes" a type argument (fine for me after the generics chapters, but worth a word)
- "consumers" versus "the code that calls your function" (are these the same people?)
- "Splitting the parentheses" (clear in context)

**Voice:**
- It is attributed to Daniel Compiler and has some personality: "But the first call is still a call." and "Splitting the parentheses doesn't make those decisions for you." are good, plain-spoken lines.
- The first paragraph reads more like documentation: two textbook definitions, then three rules in parallel structure.
- Overall it sounds more like a careful style guide than a specific person arguing. The second paragraph is closer to a voice, mainly because it pushes back ("But...").
- Daniel never gives a concrete example of their own, such as the `lineTotal` bug. One concrete example would make it sound like someone who has been burned by this, and would also settle the vagueness of "work only the module can do".
