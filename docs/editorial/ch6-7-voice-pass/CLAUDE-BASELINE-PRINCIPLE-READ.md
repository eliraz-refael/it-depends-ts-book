# Ch6 Principle: first-time reader report

## 1. The rule

There is no explicit, testable rule. The closest sentences:

> "The signature states a relationship between what enters and what leaves. The relationship is declared once; at each call site, the compiler fills in `T` from the evidence the call provides."

> "Not 'this function accepts anything' — `unknown` already says that, without ceremony."

The section then hands the actual decision to the debate: "The debate, as ever, is about when the sentence is worth saying." So the section says what a generic *is*. It never says when to write one.

My guess at the intended rule: **a type parameter only earns its place if it connects two positions in the signature (input to output, or one input to another). If `T` shows up once, use `unknown` or the concrete type instead.** The section points at this but never says it.

## 2. In my own words, and does it decide the two cases?

My restatement: a generic says "the type here is the same as the type there." If you can't name the "there," you don't need the generic.

- `function logPayload<T>(payload: T): string`: **I can decide this, but only by inference.** `T` is only on the input, and the output is always `string`, so there's no relationship. The "`unknown` already says that" line suggests `payload: unknown` is the honest version. I had to work that out myself, though. The text never says "a `T` used once is a smell."
- `function parseConfig<T>(input: string): T`: **I can't decide this from the section.** `T` is only on the output. Going by "the compiler fills in `T` from the evidence the call provides," there's no evidence here, so the caller must supply `T` (or it comes from context). From Ch2, this smells like a type assertion wearing a generic costume. The word "lies" in the last paragraph hints the chapter will say so. But nothing in the Principle tells me it's wrong, and the identity example doesn't cover a return-only `T`. I'd guess "not fine," but I'd be guessing.

## 3. Sentences that made me stumble

- `const word = identity("hello"); // T becomes "hello" — the literal` next to `const user = identity({ id: "u1" }); // T becomes { id: string }`. Why does the string keep its literal type while the object's `id` widens to `string`? The comments look inconsistent side by side, and "— the literal" calls attention to it without explaining. I stopped here to wonder whether I was missing a rule. Either explain it in a line or use an example that doesn't raise the question.
- "The angle brackets have been *used* since Chapter 1 and explained exactly never." I remember `ParseResult<T>` from Ch5 and maybe `RequestState<T>` somewhere, but Ch1 was `any` vs `unknown`. Were there generics in Ch1? This made me doubt my memory instead of nodding along. If it's true, name the Ch1 instance (`Array<T>`? `Promise<T>`?).
- "Five chapters of escape hatches, identities, choices, and proofs". I had to map these to chapters. Escape hatches = Ch1/2, choices = Ch4, proofs = Ch5. "Identities" for interface vs type is opaque, and it clashes with the `identity` function a few lines later.
- The italic quote (*"Let us return to first principles..."*) followed by a roman quote paragraph. Is the italic line an epigraph, an aside, or the same speech? Same speaker, two styles, no clear reason.
- "Eli caps the marker." Nobody mentioned a marker or a whiteboard, so this was a small "wait, what marker?"
- "Everything we will argue about today — constraints, inference, lies". "Lies" is a good hook. "Constraints" is a term I know but the section never shows one (`extends`), so it's a forward reference with nothing to hang on.

## 4. Narrator talking at me / filler

- "and one construct has been standing quietly in the corner of nearly every code block." Cute, but it's throat-clearing.
- "Time to pay that debt." Narrator voice addressed to me.
- "Older than most languages." Filler right after "older than the language."
- "for once he doesn't start with TypeScript". Is that true of Eli in earlier chapters? It reads as a narrator flourish.
- "That sentence is the entire feature." A bit grand, but it earns its place because it tells me what to hold onto. I'd keep it.
- "The debate, as ever, is about when the sentence is worth saying." Sounds good, but it's exactly where the rule should be stated, and it defers it instead.

The `let x = 42` analogy and the "read the signature out loud" line are the strongest parts. They're clear and they teach.

## 5. What I expect the debate to be about

- When a generic is worth writing: `T` used once vs `T` linking positions, generic vs `unknown` vs a concrete type.
- Return-only generics (`parseConfig<T>`, `fetchJson<T>`) as disguised assertions. That's my guess for "lies," tied back to Ch2 and to Ch5's parsers.
- Constraints (`T extends ...`): when to add them and how they change what you can do inside the function.
- Inference: letting the compiler fill in `T` vs passing it explicitly, plus literal-vs-widened surprises like the `"hello"` example.
- Someone (probably a pragmatist character) defending "generic everything, it's more flexible," and someone else arguing every type parameter has to justify itself.
