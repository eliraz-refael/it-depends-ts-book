# Chapters 6–7 voice pass

Status: **DRAFT 3 FROZEN; CH6 FINAL DIFF REVIEW PENDING, CH7 APPROVED**, 2026-10-21.
Baseline: `4af45f5`, after Chapter 5 merged in PR #17.
Branch: `codex/chapters-6-7-voice-pass`.

## Scope

The author-authorized brief assigns a full Chapter 6 pass and light Chapter 7
edits for local repetition (B10) and the act-label seam (C11). Codex owns the
manuscript and records; Claude supplies independent discovery and cross-review.
Claude's discovery arrived and was read before freezing this draft. Claude will now run
a Principle-only reader and fresh full reader for Chapter 6.

Calibration: the [Chapter 3 pilot](CH3-PILOT.md), [Chapters 1–2 pass](CH1-2-VOICE-PASS.md),
[Chapter 4 pass](CH4-VOICE-PASS.md) and [Chapter 5 pass](CH5-VOICE-PASS.md).
All code fences and their order remain frozen. No registered fixtures change.
The PLAN status corrections will be committed separately from the manuscript.

## Draft 1 choices

- The fresh [baseline Principle-only read](ch6-7-voice-pass/CODEX-BASELINE-PRINCIPLE-READ.md)
  found a definition, but no testable prescription. Eli now states the use rule:
  identify the relationship a caller needs, what supplies the type argument,
  and what depends on it. The rest of the chapter tests its scope.
- Keep a short `ParseResult<User>` callback. Remove the inaccurate “explained
  exactly never” claim, opening recap and ritual slogan. This acknowledges prior
  use without revisiting the deferred Chapter 1 sequencing issue (B9).
- Preserve Noam and Oded's disagreement about when to generalize. Noam does not
  demand a generic billing function. Oded supplies the concrete array and employee
  alternatives. Dima's animal metaphor is already absent; his current mediation
  identifies this real disagreement and stays.
- Attribute the anonymous single-use exchange. Eden raises the explicit-call-site
  migration cost; Daniel retains the `querySelector` exception and the distinction
  between an unnecessary parameter and a caller's unchecked claim.
- Keep constraints, whole-type preservation, `get` inference and the null-initialized
  store repair. Eden's story supplies the store's purpose without an invented count
  of affected calls. Type arguments and exported return annotations remain distinct.
- Preserve Idan's removal of `as`, the remaining `any` hole and the checked parser.
  Oded still challenges `ParseResult<T>` and gets the function/type-definition distinction.
- Retain Liron's lens/photo analogy and Chen's objection: a generic can preserve
  information without transforming the value. The analogy doesn't decide when
  Oded should generalize. Keep the table and both concluding code examples.
- Remove the end-of-act recap and Daniel's repeated conclusion. Sahar's Take
  repeats Oded's invoice objection and is cut. Linoy's inference controls add
  new applications and are shortened; Idan adds the parser-argument repair as an
  inline signature, and Eli's type-computation handoff stays brief.
- Chapter 7 opens with Eli and the direct `extends` callback. Its Principle's
  examples/explanation stay in place. No act label is inserted into chapter prose;
  the contents and eventual print part-title pages own that orientation.
  Cut two stock silences, with no changes to the calibrated disagreement or Turn.
  All three Takes add something: the `infer` handoff, exact-result tests for type
  utilities, and a reviewer exercise using an actual diagnostic. Keep them.

## Continuity and limits

Chapter 11 still builds on constraints preserving concrete state across helpers;
Chapter 12 still distinguishes the generic promise from runtime behavior and
structural assignability. This pass changes none of those rulings. No variance
lesson or generic factory is added early.

The large inherited cast, survey structure, explanatory code comments and
reference tables remain. The Turn is a tested analogy, not a new runtime
counterexample. These are deliberate limits of the calibrated voice pass,
not claims of fresh-reader approval.

## Validation and sources

Initial fence comparison: Chapter 6 has **15**, Chapter 7 **29**, all byte-identical
and ordered against `4af45f5`. No code exception is proposed.
The locked install succeeds with `npm ci --offline`. The unchanged targeted
suites passed on the provisional prose with TypeScript 7.0.2:

- `node checks/chapters1-6.cjs`: 110 fences / 116 compiler cases / 8 runtime groups.
- `node checks/chapters7-8.cjs`: 50 fences / 52 compiler cases / 8 runtime groups.

These runs preceded the final discovery-driven prose edits; no fence changed.
A full suite will run after review revisions as the brief requests. At draft 1, the separate
[inline probes](ch6-7-voice-pass/INLINE-PROBES.cjs) passed 4 compiler cases and 1
runtime group: literal versus ordinary inference, the fallback's contribution
with and without `NoInfer`, and a parser argument supplying the result type.
The example implementation preserves JSON syntax errors as exceptions; the
signature does not claim to turn every failure into a result. These probes are
not added to the registered book-suite totals.

The shortened inference-control Take retains the baseline claims. The official
[TypeScript 5.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters)
and [TypeScript 5.4 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type),
checked on 2026-10-21, support the introduction dates and inference behavior.

## Discovery dispositions

Claude's [discovery](ch6-7-voice-pass/CLAUDE-DISCOVERY.md) and independent
[Principle-only](ch6-7-voice-pass/CLAUDE-BASELINE-PRINCIPLE-READ.md) and
[full baseline reader](ch6-7-voice-pass/CLAUDE-BASELINE-FULL-READ.md) are preserved.

- Apply findings 1 and 3: explicit use rule, narrower identity explanation,
  corrected Linoy entrance and attribution, caller-versus-return-annotation
  distinction, and “needed the generic.” The `JSON.stringify` declaration/runtime
  mismatch gets a short clause; the installed lib declares `string`, while a
  runtime check returns `undefined`. No function fence changes.
- Apply finding 2: Oded objects to choosing a shared contract before the next
  caller establishes its requirements. Noam answers that the constraint describes
  the current body. Oded still wants the concrete employee API. The Verdict states
  why the relationship test does not decide their timing disagreement.
- Apply B10: cut catchphrase taglines, anonymous silence, invented call counts,
  recap list, duplicate conclusion and Sahar's repeated invoice question. Keep
  Oded's deletion joke, Linoy's enthusiasm and Liron's challenged analogy.
- Linoy's inference Take no longer assigns the same cost to two different
  controls or postpones its own explanation. Idan's parser-argument Take supplies
  the constructive generic alternative without adding a schema lesson.
- Do not add the optional receiving-annotation inference example (finding 4).
  Idan's existing cast-removal test already proves the search limitation. Another
  inference mechanism here would broaden the prose pass; it remains a valid
  candidate for later technical expansion, not a rejected technical claim.
- Keep the frozen literal inference comments, global `name` spelling, diagnostic
  order and `loadState` fence. The checks supply module context; the TS7 baseline
  validates the diagnostic order. No Playground or older-compiler aside is added.
- C11: accept Claude's objection to the provisional act label. Cut the recap,
  leaving part orientation to the contents and print part-title pages. No new
  narrator bridge, part-title file or print build is created in this pass.
- Chapter 7's only changes beyond its opening are removal of two stock silences
  (before Oded's overload objection and Linoy's typo repair). They add no evidence
  or attribution. Its actual wrong guesses, mistakes, corrected alternatives,
  timing, humor and three useful Takes remain intact.

## Draft 1 snapshot and self-review

- **Chapter 6:** 2,810 → 2,432 words including code; 15 unchanged fences. SHA-256: `7577b6575ced34ba626a88f56f1e26cfb2d01efa4a62fe5f0d50cb0b66624b8f`.
- **Chapter 7:** 3,675 → 3,622 words including code; 29 unchanged fences. SHA-256: `f9495d4ff2c3401f14e30e971b6a81dca428d0906bb02975eee0708f8d11e085`.

The [snapshot manifest](ch6-7-voice-pass/DRAFT1-SNAPSHOT.json) records both baselines
and every fence hash. `git diff --check` passes. No registered validator changes.

Self-review: the rule is stated before the examples; the return-only exception
and the unsafe `any` producer remain distinct; Oded has a concrete contract-cost
objection and Noam answers it; the unresolved timing question is explicit. The
existing Chapter 11 and 12 dependencies on constraints, inference and structural
relationships are preserved. This is a draft assessment, not reader approval.

Questions for the fresh readers: can they apply the opening rule to a redundant
parameter and an unsupported generic return; does Oded's stronger argument get
an adequate answer; does the survey retain warmth; do the brief Additional Takes
add useful limits without opening another full lesson? Chapter 7 is checked for
scope and continuity, not offered for a new stylistic overhaul.

## Draft 2 and review response

Claude's [formal review](ch6-7-voice-pass/CLAUDE-REVIEW.md) approves Chapter 7 as
frozen and requests a prose revision of Chapter 6. Its fresh
[Principle-only](ch6-7-voice-pass/CLAUDE-DRAFT1-PRINCIPLE-READ.md) and
[full reader](ch6-7-voice-pass/CLAUDE-DRAFT1-FULL-READ.md) are included unchanged.

All six findings are addressed:

1. Eli's opening now distinguishes a redundant parameter from an unverified,
   caller-chosen return type, and says the second-caller timing decision stays
   open. The Verdict removes the assertion hedge while retaining the condition
   “without evidence from the body”; it does not condemn every generic that
   mentions a type parameter only in its output.
2. Daniel answers Oded and distinguishes the DOM's actual `Element | null`
   contract from arbitrary JSON. Knowing the markup can justify a narrower
   element claim, but the type argument does not verify it. The table says so.
   Idan also makes clear that adding a constraint to the JSON helper would not
   validate its data. Boundedness alone is not presented as a safety proof.
3. Noam can test the minimal contract with a name-only fixture. Oded can keep the
   existing function name and employee call while generalizing its signature
   later. Both claims are pinned in the editorial probes. Noam's “correctly”
   becomes “once,” so he does not call the concrete version incorrect.
4. Eli's value-variable/type-variable image returns, followed by the read-aloud
   `identity` signature. The opening now names type parameter versus type argument.
5. The `NoInfer` Take uses `T extends string` and a visible literal-array call.
   The old probe used a pre-annotated literal-union array, where the effect was
   real, but that did not cover the obvious literal call a reader would try.
   The revised probe rejects the printed blue fallback with `NoInfer` and accepts
   it without. No fenced example changed.
6. Fix the two type-argument antecedents, Daniel's response to the removed cast,
   and Liron's attribution. Keep the `unknown` comparison in the Turn rather than
   repeat it in the opening. Idan now names the source of the return type.

Retain the short `JSON.stringify` explanation and Eden's public-return-type
qualification. They answer actual questions raised by the examples; the latter
still distinguishes API return annotations from caller-written type arguments.
No comment-only exception is taken. The literal/object widening comments and
`loadState` slogan remain documented frozen-code limits.

- **Chapter 6:** 2,599 words, 15 unchanged fences. SHA-256: `4e0c3efce6fc4ea7e5db039abca565780fc66564df5acba0abf177dd919267dd`.
- **Chapter 7:** 3,622 words, 29 unchanged fences. SHA-256: `f9495d4ff2c3401f14e30e971b6a81dca428d0906bb02975eee0708f8d11e085`.

The [draft 2 snapshot](ch6-7-voice-pass/DRAFT2-SNAPSHOT.json) verifies all **44 fences**
against `4af45f5`; Chapter 7 is byte-identical to its approved draft 1.

`npm ci --offline` and the full `npm run check` exit 0 on TypeScript 7.0.2:
**299 fences / 398 compiler cases / 119 runtime groups**, plus 2 default cases
and 2 searches. The run preceded only the final prose qualification “without
evidence from the body” in the Verdict. The fence corpus was unchanged throughout.
The separate editorial checks pass **6 compiler probes / 1 runtime group** on
final draft 2. Registered checks and compiler options are untouched.
`git diff --check` passes.

## Review state

Chapter 7 is approved and unchanged since that review. Chapter 6 draft 3 is
frozen for Claude's final diff review; no further reader was requested. Local
handoff commits are authorized, with PLAN.md separate. No push or publication by
Codex; Claude owns rebase and PR after settlement.


## Draft 3: final prose round

Claude's [second review](ch6-7-voice-pass/CLAUDE-REVIEW-2.md) and its
[fresh recheck reader](ch6-7-voice-pass/CLAUDE-DRAFT2-RECHECK-READ.md) are archived
unchanged. The Principle and both sides of the timing dispute passed. Claude
requested four small fixes, followed by a final diff review without another reader.

1. Daniel stops repeating that the element type argument does not check the DOM.
   He names `instanceof HTMLInputElement` as the check when the markup cannot be
   relied on.
2. Noam says “generically” rather than “once.”
3. Idan credits `get`'s object and key arguments for supplying `T` and `K`.
4. The table describes the actual `T[] → T[]` example.

Both optional suggestions are applied: Linoy explains why the fallback must be
among the listed values, and one `loadState` comment becomes “T appears only in
the return type.” This takes the explicitly offered comment-only exception;
no executable code changes. Against the baseline, **43 of 44 fences remain
byte-identical**. The sole difference is that comment in Chapter 6's fifteenth
fence. Normalizing that exact replacement makes all 44 fences identical in order.
The earlier snapshots and their unchanged-fence claims describe their own drafts.

- **Chapter 6:** 2,609 words; SHA-256 `0ae9e934663b1f6b9118e4eb8a38b18f021d4ef355cf0d3cb8e9958651977a73`.
- **Chapter 7:** 3,622 words; SHA-256 `f9495d4ff2c3401f14e30e971b6a81dca428d0906bb02975eee0708f8d11e085`.

The [draft 3 snapshot](ch6-7-voice-pass/DRAFT3-SNAPSHOT.json) records the exception
and both versions' fence hashes. Chapter 7 remains byte-identical to its approved
snapshot.

Validation on final draft 3: `node checks/chapters1-6.cjs` exits 0 on TypeScript
7.0.2 (**110 fences / 116 compiler cases / 8 runtime groups**). The separate
editorial inline probes pass **6 compiler probes / 1 runtime group**.
`git diff --check` passes. The full-suite run above belongs to draft 2; it was not
repeated for this bounded prose and comment round.
