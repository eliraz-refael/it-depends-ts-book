# Chapter 3 editorial pilot

Status: author approved as the reference for the broader voice pass, 2026-10-05.

Authorized: 2026-10-04. Baseline: `872b211`, including Chapter 15.
Branch: `codex/chapter-3-voice-pilot`.

Scope: Chapter 3 prose, attribution, voice and pacing. Keep every code fence
byte-identical and in order. Keep the technical argument, viable alternatives
and qualified local convention. Do not modify other chapters or their examples.

Preserve Guy's composition demonstration, Dafna's specific concession, the
closed-set/open-extension tradeoff, Liron's blueprint/description image, Daniel's
qualification that it is a convention, and the exception for composed data objects.

Targets: narrator scorekeeping; ritual slogans; chapter/subsection dialogue;
Gil's distinction between guidance and measurement; repeated rhetorical questions
and conclusions in the Turn; local attribution/punctuation.

Draft 1: 3,061 → 2,591 words including code. All 20 fences remain byte-identical
and in the same order. SHA-256:
`2310ccc57a50148d64f977864d59567a063cff90f2b6c9d3c9f2ae3bbda2a809`.

Self-review: the opening now names the choice and avoids the visible-keyword
riddle; professional objections retain their working alternatives; Guy voices
the composed-data exception in the Turn. Liron's image and Daniel's convention
qualification remain. Repeated closers and forced slogans are removed. Rhetorical
absolutes about class hierarchies/diagnostics are narrowed to the demonstrated
point; the code and local recommendation remain intact.

Review risks to assess: whether the shorter chapter retains enough warmth and
humor; whether any cut erases a claim or concession; whether the single remaining
Additional Take is useful. The preserved code comment “For 90%” is framed by
Oded's personal estimate (“Most of mine”), not a measured book-wide statistic.

Fresh manuscript-only reader: comprehension passed. Report:
[first-read report](ch3-pilot/FIRST-READ.md). It flagged the delayed same-scope
qualification, an unexplained `never`, the advanced-syntax catalog, and two
overstatements in the verdict table. Draft 2 adds those short qualifications.
It also found Liron's image slower than his concrete proposal; the image stays
for this calibration, with Daniel's qualification and Guy's exception intact.

Draft 2: 2,630 words including code; all 20 fences still byte-identical to the
baseline. SHA-256:
`d15c5286e114b264c4928eb45e534b6f2190537c8dd4d5ad4074516ee697e16a`.
The [targeted reader recheck](ch3-pilot/READER-RECHECK.md) accepts all five fixes
without consequential new awkwardness.

Claude Opus 5.5 reviewed draft 2 in a fresh context. The voice calibration passed,
including the retained Liron image. Its two blind Principle-only readers found
no stated rule in either the baseline or draft 2. Draft 3 addresses that existing
gap within the pilot: Eli states the criteria the ensuing debate tests, leaving
the local convention open. It also replaces the catalog's fourth-wall aside,
cuts an unsupported historical claim about rejected interface-union proposals,
and makes Noam's diagnostic complaint about tracing the conflict rather than
the time needed to explain `never`.

Accepted minor cleanup: the repeated verdict paragraph, literal same-scope
wording, speaker tags and one unnecessary gesture. Kept Gil's measurement-first
framing and Linoy's transition; did not add another lunch joke.

Draft 3: 2,584 words including code, with 20 unchanged fences. SHA-256:
`a74bfb9929f7b7cdf4c495bd3fa967f00696bd00913bf61b03e9a1a22ce9d901`.
Claude's [targeted recheck](ch3-pilot/CLAUDE-REVIEW.md#settlement-draft-3-recheck)
approved draft 3 with no consequential findings remaining. A fresh Principle-only
reader quoted Eli's rule and restated it correctly, without predicting the
chapter's particular data/behavior convention.

Retained limitations for future work: the ten-person cast can feel staged;
Liron's image is intentionally retained for calibration; this chapter does not
cover implicit index-signature differences, so its opening criteria are not
a complete inventory of interface/alias differences. No further chapters were
edited as part of this pilot.
Validation: `npm ci --offline` and `npm run check` succeeded on TypeScript 7.0.2.
The full suite was rerun on frozen draft 2 and exited 0.
The chapter contributes 20 fences / 18 compiler cases to the Chapters 1–6 suite.
Whole-book totals: 282 fences / 371 compiler cases / 105 runtime groups, plus
2 default cases and 2 searches. Fence comparison and `git diff --check` pass.

The author authorized committing the pilot and opening a PR on 2026-10-05.
The Chapters 1–2 pass follows separately, using this approved calibration.
