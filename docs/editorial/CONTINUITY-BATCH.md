# Continuity batch — A1–A7, C11, C12

Date: 2026-10-13. Baseline: `891f1c6` (merged Chapter 4 pass).
Branch: `codex/continuity-batch`.
Status: implemented and validated; ready for Claude's targeted cross-review.

## Scope and sources

Small prose and attribution fixes agreed after Claude's manuscript-only Haiku
5.5/4.5 reads, Claude's source-verified triage, and Codex's itemized response.
The 5.5 label reflects the CLI alias resolution; 4.5 was explicitly selected.
Those reports and the coordination brief remain local working records; this
file records the accepted changes without importing their raw findings.
The author delegated coordination to Claude, who assigned this batch to Codex.

All code fences stay byte-identical. No broader voice pass, Chapter 5 changes,
Chapter 1 sequencing changes or new examples are included.

## Before and after

| Item | Location | Before | After |
| --- | --- | --- | --- |
| A1 | Chapter 1, Noam's incident | His next-sprint slogan is attributed to Oded's sticky note, whose cast biography names a different slogan. | Remove the sticky-note claim; retain the eight-sprint delay and the TODO found at 2 AM. |
| A1 callback | Chapter 1, ticket ownership | “We've already tried the sticky note.” | “We've already tried the TODO.” This now refers to the evidence still on the page. |
| A2 | Chapter 7, distribution/never exchange | Four speeches require inferred speakers. | Join Linoy's “So unions distribute…” to her continuing explanation; tag Chen's “You showed me…”, Daniel's “Asked directly…” and Linoy's correction. |
| A3 | Chapter 12, opening assignment | “I can even put `out` on the cache.” | “There's even an annotation for that kind of assignment.” Preserve the preview without requiring unexplained syntax. |
| A4 | Chapter 11, defaulted helper | “There is no known source to carry out.” | “The return type has no known source to preserve.” |
| A4 | Chapter 14, awaited transaction | “a later rejection would pass this catch” | “a later rejection would escape this `catch`” |
| A4 | Chapter 15, numerical checks | “Four passes either numeric check.” | “`4` passes either numeric check.” |
| A5 | Chapter 6, generic lookup | “the best four lines” | “the best three lines”, matching the displayed function. |
| A6 | Chapter 3, performance guidance | “the native compiler” | “the TypeScript 7 native compiler”; the lack of project measurement stays explicit. |
| A7 | Chapter 7, overload removal | “He deletes the first three lines…” | “Oded deletes the three overload signatures…”; the implementation remains an ordinary function. |
| C11 | How to Read | “Each chapter is self-contained.” | “Each chapter opens a new argument. Some build on earlier examples and type-system concepts.” |
| C12 | Chapter 7, Noam's incident | “I spent six hours on that deploy.” | “I blocked that deploy for six hours.” This matches the cast and distinguishes Chapter 1's four-hour debugging incident. |

## Validation

- `npm ci --offline`: passed against the lockfile.
- Full `npm run check`: exit 0 on the final manuscript, TypeScript 7.0.2;
  **282 TypeScript fences, 371 compiler cases, 105 runtime groups**, plus
  2 compiler-default cases and 2 reproduced searches.
- Extracted every fence, including its delimiters/language tag, in all nine
  touched manuscript files and compared each with `cmp` against `891f1c6`:
  **154/154 byte-identical**, in the same order.
- `git diff --check`: passed. No fixtures, dependencies or compiler settings changed.

The local diff was read with each surrounding exchange. Claude reviews the
committed batch next. These targeted repairs do not claim a new whole-chapter
reader pass. B9 stays with Chapter 1's separate sequencing work; B8 and the
Chapter 5 voice items remain for the next assignment.
