# Review: Chapter 10 — The Call You Didn't Make

## Summary

The chapter explains `infer` through an SDK upgrade that first breaks an overload
and then exposes a type/runtime mismatch. Both complete repairs work. The revised
ending adopts an explicit adapter for the mixed courier API and a constrained
wrapper for the uniform generated tracking API.

Codex's self-review and Claude's final review are complete. Claude requested
revisions in his first full review and marked the revised manuscript settled on
2026-09-24 after rereading it and independently rerunning the checks.

## Scores — final review

| Category | Score | Notes |
|----------|-------|-------|
| Character Consistency | PASS | Idan repairs and constrains her design; Eden checks migration costs on his own alternative; Noam challenges both assertions and handwritten overloads. |
| Factual Accuracy | PASS | Every fence is exercised. Last-overload extraction, generic erasure, conditional scope, `Awaited`, and both forms of the promise condition are checked. |
| Fun Factor | PASS | The parcel line, the successful result containing false, and the argument over the name `Safe` arise from the problem. |
| Alignment with Vision | PASS | The generic design gets an explicit rejection constraint, not just an acknowledged possible use. Both choices have concrete limitations. |
| Code Quality | PASS | Both repaired Proxies and the compatible adapter pass the same return-shape and failure tests; errors remain unknown. |
| Readability & Flow | PASS | The generated client is introduced as the wrapper's origin. The ending returns to it instead of parking another alternative in a review thread. |

## Detailed feedback and resolution

### Discovery

- Claude proposed an extraction-based Result wrapper whose SDK upgrade breaks an
  overload. Codex narrowed the silent-failure case to a newly introduced format
  helper found during review, preserving the correctness of the original v4
  assumption without inventing a production incident.
- A facade-preserving adapter removes the assumed cost of migrating forty callers.
  Both authors rejected the initial proposal to retain the Proxy on that basis.
- Compiler validation disproved the planned claim that correcting the mapped type
  would make the original negated condition fail compilation. The chapter retains
  that accepted condition and fixes its actual runtime behavior.

### Claude's first manuscript review

1. **F1 — missing strongest generic repair:** Added `AsyncMembers` and `safeRequests`.
   The entry constraint rejects the shown v5 client while accepting v4 and the
   generated client. `[R]` checks the whole return type, including a mixed
   synchronous/asynchronous return. Optional methods and overload preservation
   remain explicit limits, verified in the checks.
2. **F2 — repeated ending:** Removed the “alternative stays in the review” ending.
   The two integrations now adopt different checked designs. Method count alone
   does not decide between them.
3. **F3 — Noam overlooks a double assertion:** Kept the assertion visible and added
   his objection, with Idan explaining the remaining runtime verification burden.
4. **F4 — condition diagnostic boundary:** The original review established the 5.9.3
   behavior. Checks assert TS2801 for the positive call and acceptance under `!`.
   The TS7 revalidation below confirms the same boundary on the current baseline.
5. **F5 — late arrival of generated client:** Established it as the wrapper's origin
   near the first `Safe` definition.

Self-review also narrowed the mapped-type claims to the required-method surface,
removed escaped quotes from inline code, and clarified how the synchronous repair
replaces the existing export. The second Proxy remains complete so its successful
repair can be inspected and exercised, without introducing a configurable library.

Claude's final review confirmed F1–F5 resolved. His optional diagnostic-comment
and final-test-reference edits were applied. A proposed claim that removing the
brackets would admit a mixed return was tested and rejected: the unbracketed
version also rejects that client, with a narrower function intersection. Claude
independently confirmed the correction. The manuscript only says that the
brackets check the whole union; the extra compiler case preserves the verified
counterexample to the proposed wording.

## Validation

Run with Node and the repository's pinned TypeScript package:

```sh
npm ci
node checks/chapter10.cjs
```

- **19 TypeScript fences**, all read from the manuscript.
- **29 compiler cases**, including exact diagnostics and type-equality assertions.
- **8 runtime scenario groups**: the original invalid-input failure; both guard
  repairs and the adapter; identical ordinary and expanded responses, synchronous
  throws, async rejection, receiver binding, and data properties across repaired
  implementations; plus synchronous values, thenables, and arbitrary thrown values
  in `attempt`.
- The fictional SDK is a documented plain-object test double. Its methods depend
  on their receiver so binding is exercised. No external SDK package is implied.

The original review ran on **5.9.3**. **TS7 revalidation, 2026-09-24:** the CLI-based
validator passes on **7.0.2** with the same coverage above. The manuscript now
names 7.0.2 for the checked condition diagnostic. The compiler run records its
actual version; these checks do not claim future diagnostics cannot change.
See [the migration record](checks/README.md).

## Sources

- [Conditional types: inference](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [TypeScript 2.8: inference and overloads](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types)
- [Utility types: Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype)

## Verdict

**APPROVED — joint review settled. No consequential findings remain open.**
