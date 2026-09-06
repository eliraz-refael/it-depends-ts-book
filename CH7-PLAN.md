# Ch7 Plan — Conditional Types

**Status:** revised 2026-09-06 following the author's voice review. This replaces the earlier plan that required the conditional signature to win on mixed call sites. A public union overload handles those callers too; the chapter now examines the maintenance tradeoff and the actual pipeline requirement.

## Teaching goals

- Distinguish `extends` as a generic constraint from `extends` in a conditional type.
- Show a conditional return type, its callers, and the implementation-checking limitation.
- Compare two functions, a complete overload list, a plain union signature, and a conditional signature fairly.
- Explain distribution through `Exclude`, then `never`, `any`, tuple wrapping, and a misspelled filter member.
- Decide the local content-pipeline change without claiming a universal winner for API design.

## The disputed decision

Linoy wants one `slugify` signature that preserves the input shape and can name the relationship for reuse. Eden prefers explicit overloads for a small, stable set of cases. Oded wants the existing two functions unless another requirement justifies changing them. Noam wants runtime tests for the promises hidden under either overload implementation.

The final caller needs an array of tag slugs regardless of how the front matter spelled its tags. Normalizing that input lets the local PR keep the two functions. Linoy's library argument and Eden's overload preference remain open for other callers.

## Chapter shape

1. **Principle:** one conditional type and two concrete evaluations.
2. **Types can do ternaries?:** Linoy presents the proposed helper; Oded asks what it buys.
3. **Show me the caller:** the initial two overloads reject the union. Eden adds the missing public union overload. Oded tries deleting the specific overloads and loses the precise return type. Linoy names `Slug<T>` for potential reuse. Both approaches work for the demonstrated calls.
4. **Implementation gap:** the direct generic body cannot prove its conditional return type. A single overload separates the public relation from the implementation. Daniel breaks the body; Noam asks for runtime tests. Eden's explicit overload list has the same checking gap.
5. **You already ship these:** Oded traces `Exclude` incorrectly by treating the union as a whole. Distribution explains the result. He distinguishes consuming a utility from maintaining one.
6. **Special cases:** `never` through a bare parameter versus a direct check; `any` depends on the right-hand type; tuples suppress distribution. `StrictExclude` catches literal typos at the cost of some broader category filters.
7. **Who reads the error?:** Eden describes an accurate but hard-to-understand diagnostic. Gil declines to infer latency without a measurement. Daniel shows the concrete `NonNullable` simplification from TypeScript 4.8.
8. **Turn:** Dafna identifies filtering, then Chen asks what the next function actually needs. The content pipeline normalizes tags.
9. **Verdict:** a local decision, a short table for other cases, and the remaining overload/conditional disagreement.
10. **Additional Takes:** `infer` teaser, tests of derived types, and whether another reviewer can act on a diagnostic.

## Continuity

- Eli's Chapter 6 closing promise about type-level programming is retained.
- Chapter 6 introduces the two meanings of `extends`.
- `Unwrap<any>` from Chapter 1 is explained by a branch contributing `any`, which absorbs the other result.
- Noam's demand for runtime tests follows the broken implementation rather than a required antagonist beat.
- No clock is introduced without affecting the scene.

## Technical checks to preserve

- Three public overloads can preserve the two concrete returns and accept the union argument. The implementation signature alone is not public.
- Both overloaded implementations can return the wrong branch while compiling; type tests alone do not verify runtime behavior.
- Distributivity requires a bare type parameter on the checked side.
- A distributive conditional applied to `never` evaluates over no members. A direct `never extends string` selects the true branch.
- `any extends string` can produce both branches. `any extends unknown` and `any extends any` select the true branch.
- `[T] extends [U]` compares the tuple-wrapped types without distributing over `T`.
- `Exclude<Channel, "smss">` silently preserves the union. `StrictExclude` rejects the typo but also rejects a category wider than the first argument.
- Keep the old and new `NonNullable` definitions labeled as different versions. Do not claim identical behavior for `unknown` or universally shorter error messages.
- The normalized `tags` field is `string[]`; title processing still returns `string`.

## Sources

The [conditional-types handbook](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) shows the complete overload alternative and distribution. The [TypeScript 4.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html) explain the intersection rewrite of `NonNullable` and generic assignability benefits.

## Validation

Run the revised snippets under TypeScript 5.9.3 with `--strict`, using earlier definitions as context and separating alternative implementations. Check expected diagnostics as well as successful examples. Exercise string, array, empty-array, and normalization cases at runtime, plus the deliberately broken branch. The editorial pass also checks that the verdict no longer excludes Eden's working alternative.

**Result (2026-09-06):** the revised chapter examples were included in the 65 successful strict snippet/type checks and 10 runtime scenario groups recorded in `VOICE-REVIEW.md`. Final chapter length: 3,672 words, including code.
