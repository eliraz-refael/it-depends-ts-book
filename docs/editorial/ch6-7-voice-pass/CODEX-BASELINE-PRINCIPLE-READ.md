# Chapter 6 baseline Principle-only read

2026-10-21. A fresh Codex subagent, `ch6_baseline_principle`, read only the text
before `## The Debate` at baseline `4af45f5`. It received basic JS/TS, narrowing
and parser prerequisites, with prior exposure to `ParseResult<T>`/`Promise<T>`
but no generic-signature lesson. It saw no other manuscript, guides, plans or
reviews. The baseline opening was read before the provisional edit.

Response, preserved verbatim:

1. **Explicit testable prescriptive principle: NONE.** “The signature states a relationship between what enters and what leaves” describes what this signature does; it does not tell me when to use a generic.

2. **Rule in my words:** `T` is a type placeholder inferred at each call. In `identity`, using it for both the parameter and return type preserves their type relationship. That is a definition and example, not guidance for choosing generics.

3. **Confusing or overbroad wording:** “Whatever type goes in is the type that comes out” followed by “the entire feature” makes all generics sound like identity functions. “Everything … lives inside that one sentence” reinforces that impression. The opening provides no criterion for when declaring the relationship is worthwhile.

4. **Expected dispute:** When preserving a type relationship justifies a generic instead of using `unknown` or a simpler signature, with constraints, inference, and misleading signatures as complications.
