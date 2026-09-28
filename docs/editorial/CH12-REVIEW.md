# Review: Chapter 12 — The Same Object, Twice

Status: **SETTLED**. The manuscript has been revised through Claude's discovery,
outline, draft, and formal reviews. Self-review, the independent first-reader
rechecks, and the full book suite pass. No consequential findings remain.

## Summary

The chapter tests which substitutions a shared result cache can support. The
runtime failure comes from two existing consumers' promises diverging after an
archive operation. The stronger cache contract reveals a legitimate caller that
needs a smaller interface, and the final ownership decision preserves both the
archive feature and the receipt's retained CSV metadata.

## Self-review

| Category | Score | Evidence |
| --- | --- | --- |
| Character consistency | PASS | Noam traces the downstream failure and proposes preserving the caller's type; Eden owns existing callers and migration; Linoy tests annotations and their strongest repair; Guy owns the retention and interface contracts; Daniel explains compiler comparisons. |
| Factual accuracy | PASS | All fences and printed diagnostics are checked on TS7.0.2. Runtime cases reproduce direct, forwarding, spread-copy, and annotated-method failures, then exercise the complete repaired feature. |
| Fun factor | PASS | The receipt fails in a different package from the accepted write, naming an adapter temporarily fixes it, copying the fixture reopens it, and the stricter contract rejects an innocent old caller. These results drive the dialogue. |
| Alignment with vision | PASS | Real alternatives are tested. The generic dashboard is competent but cannot invent its replacement type; explicit annotation works at a named boundary; the stronger interface still requires consumer migration and a retention decision. |
| Code quality | PASS | No assertions, working implementations, explicit replacement stages, no stubbed builder, and complete runtime behavior for the two owners' promises. |
| Readability and flow | PASS | The cache and both consumers work before the failure. The adapter's purpose precedes its example; fresh state is explicit between experiments. The reader/writer labels describe examples already needed by the argument. |

## Independent first-read review

Reviewer: `chapter12_first_read`, in a separate context. The reviewer received
only the manuscript and prerequisites, including the preceding builder's
closing question. Plans, validators, author discussions, and earlier verdicts
were excluded.

The principle understood: a shared mutable object must satisfy the promises made
through all its references. Reader and writer substitutions move in opposite
directions; combining them constrains substitution. Method syntax and variance
annotations have specific compiler limits.

The reviewer found no consequential missing helper purpose or forward dependency.
The two retention promises precede the archive, making the two-cache ending an
earned response. The final archive and subsequent CSV publication preserve the
actual feature. The builder callback answers the preceding chapter and gives
the annotation an honest cost.

One continuity finding was addressed: later examples needed a fresh CSV cache
rather than the object already modified by the earlier reproduction. The scratch
paragraph now explicitly resets the cache before every experiment. Eden's
abstract direction recap was also made concrete.

The targeted recheck covered that reset and the subsequently added named-adapter
repair plus spread-copy counterexample. It found no remaining consequential
obstacle, and judged Linoy's concession earned by the stronger example.

## Claude discovery and draft reviews

Claude independently probed the variance cases and challenged the scenario and
outline before drafting. Key changes were:

1. Use an actual archive replacement, not a path update that could simply retain
   fields through spread. Establish why the latest download must change.
2. Establish the receipt's retained CSV count and the panel's current download
   before they diverge. Do not invent the retention requirement at the verdict.
3. Give the generic dashboard its checked implementation and its precise error.
4. Let the labels for covariance, contravariance, and invariance arise from the
   existing caller repairs rather than three more teaching examples.

The draft review then required Linoy's strongest adapter repair, explicit
onboarding for the copying harness, a neutral expert proposition, and a shorter
verdict. All are addressed. Both an explicitly annotated adapter's rejection and
the subsequent spread copy's acceptance are compiler and runtime cases.

Claude's formal review independently reran the chapter and full book suites and
confirmed the pre-final counts (18/27/9 and 238/294/50). It requested one
consequential correction: the verdict must explicitly require function-property
syntax in the writer views too, because the target contract decides the check.
The clause is restored. Two new compiler cases and one runtime failure case pin
both directions of that distinction. Early printed results now execute too.
The fixture copy now wraps `read` to count calls, matching its stated purpose;
the duplicate concession and unclear annotation antecedent were removed.

A final author-side challenge exposed an omitted repair to the generic helper:
spreading its current value before changing the path compiles and preserves the
row count. Claude agreed this belonged in the argument, not a footnote. The
generic exchange now gives that repair its success, then names the changed
meaning of `CsvResult.path`. The initial contract explicitly says that path
identifies the CSV described by its row count. The owner exchange acknowledges
a combined record with two projected views as a valid alternative to two
caches. Compiler and runtime cases check both alternatives without assertions.

Claude's final targeted review confirmed the corrected antecedents, the spread
repair and its semantic cost, and the combined-record alternative. The final
chapter suite and full book suite both passed independently at the counts below.
The first reader also rechecked these additions and found their requirements
established in advance and their treatment fair.

The early builder probes also found that changing its `source` method to a
function property with an explicit receiver does not reject the widening. The
chapter does not extrapolate the cache's ordinary-parameter repair to that
recursive receiver case. It shows the invariant annotation's tested direct
effect and cost, while retaining the runtime guard.

## Technical verification

Fresh `npm ci` in the isolated branch; Node **22.23.2**, TypeScript **7.0.2**.

- Chapter 12: **18 TypeScript fences, 31 compiler cases, 14 runtime groups**.
- Whole book after the final additions: **238 fences, 298 compiler cases, 55
  runtime groups**, plus two compiler-default cases and two source searches.
  The final full-suite rerun exits 0; Claude independently confirmed the same
  counts on the locked install without running a concurrent `npm ci`.
- Compiler cases assert exact diagnostic lines and codes; indented and
  unindented diagnostic excerpts are matched against compiler output.
- Two compiler-profile cases turn off only `strictFunctionTypes`, verifying
  that the property-contract rejections disappear.
- The builder fixture extracts the actual Chapter 11 class and set-once method,
  then applies the exact annotation described in Chapter 12. The preserving
  generic helper and both construction orders remain valid; the minimum-state
  helper's previously valid completed-builder call is rejected.
- Runtime checks execute the accepted faulty assignments, verify their actual
  failures, and compare all early and repaired receipt/panel results with the
  printed values. A separate live-reader case verifies that a view observes
  later writes rather than becoming a frozen snapshot.
- The cache and archive scenario is fictional. No files are archived and no UI
  framework or external service is exercised. The checks make no performance or
  productivity claim.

Official sources read: the handbook's variance-annotation section, TypeScript
2.6's strict-function-types section, the `strictFunctionTypes` option reference,
and the TypeScript 4.7 variance-annotation release notes. The two manuscript
links point to the relevant handbook sections and resolve.

## Verdict

Self-review and independent first-reader recheck: **APPROVED**.
Claude's final review: **SETTLED**, with no consequential findings.
The chapter is ready for inclusion.
