# Review: Chapter 10 — The Call You Didn't Make

## Summary

The chapter explains `infer` through an SDK upgrade that first breaks an overload
and then exposes a type/runtime mismatch. Both complete repairs work. The revised
ending adopts an explicit adapter for the mixed courier API and a constrained
wrapper for the uniform generated tracking API.

Codex's original self-review and Claude's original final review were complete. Claude requested
revisions in his first full review and marked the revised manuscript settled on
2026-09-24 after rereading it and independently rerunning the checks.

A reader subsequently could not explain `safe` at the opening failure. That
finding reopened Readability & Flow: the original PASS did not establish that
the chapter supplied the context a first-time reader needed. The repair and
separate first-read checks are recorded below.

## Scores — original review

| Category | Score | Notes |
|----------|-------|-------|
| Character Consistency | PASS | Idan repairs and constrains her design; Eden checks migration costs on his own alternative; Noam challenges both assertions and handwritten overloads. |
| Factual Accuracy | PASS | Every fence is exercised. Last-overload extraction, generic erasure, conditional scope, `Awaited`, and both forms of the promise condition are checked. |
| Fun Factor | PASS | The parcel line, the successful result containing false, and the argument over the name `Safe` arise from the problem. |
| Alignment with Vision | PASS | The generic design gets an explicit rejection constraint, not just an acknowledged possible use. Both choices have concrete limitations. |
| Code Quality | PASS | Both repaired Proxies and the compatible adapter pass the same return-shape and failure tests; errors remain unknown. |
| Readability & Flow | PASS — subsequently reopened and repaired | The review checked the generated-client setup and ending but missed the unexplained wrapper at the opening. See the reader-onboarding revision below. |

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

- **20 TypeScript fences**, all read from the manuscript.
- **32 compiler cases**, including exact diagnostics and type-equality assertions.
- **9 runtime scenario groups**: the original invalid-input failure; both guard
  repairs and the adapter; identical ordinary and expanded responses, synchronous
  throws, async rejection, receiver binding, and data properties across repaired
  implementations; plus synchronous values, thenables, and arbitrary thrown values
  in `attempt`; and the opening page caller's success, synchronous-throw, and
  rejected-promise paths on v4 and the v5 overload repair.
- The fictional SDK is a documented plain-object test double. Its methods depend
  on their receiver so binding is exercised. No external SDK package is implied.

The original review ran on **5.9.3**. **TS7 revalidation, 2026-09-24:** the CLI-based
validator passed on **7.0.2**. Those two runs covered 19 fences, 29 compiler cases,
and 8 runtime groups. The reader-onboarding revision passes on **7.0.2** with the
expanded coverage above. The manuscript now
names 7.0.2 for the checked condition diagnostic. The compiler run records its
actual version; these checks do not claim future diagnostics cannot change.
See [the migration record](checks/README.md).

## Reader-onboarding revision — 2026-09-24

**Finding:** The opening asked readers to diagnose `safe(raw)` before establishing
what the helper was, why the team used it, or what its callers received. The
authors knew these facts from planning; the manuscript had not supplied them.
Compiler coverage did not detect this reading-order problem.

**Repair agreed with Claude:** Keep the opening question, establish the runtime
contract and a working v4 page caller, then show the v5 failure. Explain `infer`
as the response to that failure. The narrator identifies Idan's helper and its
`Result` contract; Idan gives her motive and the claim that signatures should
derive from the SDK. Both v5 additions are marked, the failing call uses the same
`courier` name as the page, and Daniel connects `safe` to its `Safe<C>` return type.
The later declaration is explicitly a replacement. The implementation inspection,
runtime mismatch, competing repairs, and final decisions remain in place.

Claude's prose pass removed duplicate explanations: the opening gives the
contract, while the later implementation exchange explains argument forwarding
and catching. The new checks verify that the same `parcelStatus` compiles on v4,
fails on unrepaired v5, and compiles after the overload repair; runtime assertions
exercise its success and both kinds of SDK failure.

**First-read evidence:** Two fresh reviewers received no planning conversation,
previous verdicts, or explanation of the intended lesson. One read the full draft
and found no premise that depended on a later explanation. Its initial tool read
extended beyond the requested stopping point, so that pass was not a strictly
isolated opening check. A second reviewer received only an excerpt ending at the
first compiler error, and confirmed PASS again after Claude's prose reduction.
From that excerpt alone it identified the project helper, the expected Result
behavior, the signature-derivation claim, and why the preserved raw overload made
the wrapped failure consequential. The cause of the type error remained a useful
question for the next page. These are comprehension reviews, not runtime tests.

The writing guide now requires a helper's purpose and contract before relying on
it; the review guide requires a separate first-read pass without author context.
Codex's self-review and both comprehension passes are complete. Claude's final
review is **settled**, with no consequential findings. He independently reran
Chapter 10 and the full book suite on 7.0.2 and confirmed the reported counts.
**Current Readability & Flow: PASS**, based on the first-read evidence and joint
review of the revised sequence. Claude's optional result-type label, repeated
stage-direction wording, and generalization of the writing-guide instruction
were applied; the code was unchanged by those final wording edits.

## Sources

- [Conditional types: inference](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [TypeScript 2.8: inference and overloads](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types)
- [Utility types: Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype)

## Verdict

**APPROVED — reader-onboarding revision jointly settled.** The original technical
approval is retained as history; the new comprehension reviews address the
reader's finding. No consequential findings remain open.
