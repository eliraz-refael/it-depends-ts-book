# Chapters 1–2 voice pass

Status: jointly approved and ready for author reading, 2026-10-05.
Authorized 2026-10-05, after the author approved the [Chapter 3 calibration](CH3-PILOT.md).
Baseline: `49f9551`, including Chapter 15 and the approved Chapter 3 pilot.

## Scope

Apply the approved voice direction to Chapters 1 and 2: remove narrator judgments,
forced slogans and repeated conclusions; preserve distinctive motives, humor,
strong alternatives and consequential concessions. State a rule before testing
it. Keep all code fences byte-identical and in order. Prose may narrow an
unsupported technical claim to what the existing example demonstrates.

Chapter 1's larger sequencing problem remains separate: the conditional-type
preview and three callback alternatives are retained. Their implementation
compromises must stay visible because the Turn tests the claim that every `any`
can be removed under a migration ticket. No other chapters or fixtures are edited.

## Work ownership

Codex drafts Chapter 1 and records; Claude drafts Chapter 2. Each reads and
reviews the other's chapter. Fresh readers receive only the manuscript and
prerequisites, without audit, plans or intended conclusions.

## Chapter 1 draft

- Eli states the initial rule: preserve uncertainty with `unknown`; account for
  what an escape hatch leaves unchecked.
- Professional exchanges replace narration announcing winners and surprise.
- Noam's incident now explains that the response type was updated, but the
  unchecked function did not use it; static types do not detect a changed
  external response by themselves.
- Linoy introduces `T` before the first generic, and explains propagation rather
  than claiming inference is broken or an absent constraint has disappeared.
- Dima follows actual property types rather than treating all assertion failures
  as confined to one line. Guy's union example makes only the shown narrowing
  claim, and his adapter answer no longer promises one-line upstream fixes.
- The callback alternatives retain their implementation compromises. The Turn
  distinguishes temporary migration work from deliberately maintained code.
- Oded's critical-path wrapper concession survives the ending.

## Chapter 2 draft

- Eli recalls Noam and Dima accurately and states the assertion rule. The Turn
  adds the question of how the team discovers that yesterday's evidence expired.
- Oded knows the parser alternative exists; his dispute concerns endpoints not
  yet migrated. Eden argues for centralized assertions and an identifiable work list.
- Daniel explains the double assertion without treating loss of static information
  as a logical contradiction. Oded's extra-properties case receives its direct
  intersection-assertion answer, with the limits of that assertion retained.
- The `Map.has` example gets the available `get`-and-check answer. A separate
  library-callback case tests the concession when evidence lies outside the compiler.
- The fixture-default objection remains consequential, including in the verdict.
- Repeated adjudication and theatrical gestures are removed; the fake-mustache
  and 3 AM jokes remain.

## Validation and review

`npm ci --offline` and the full `npm run check` passed on TypeScript 7.0.2:
282 TypeScript fences, 371 compiler cases and 105 runtime groups, plus 2 default
cases and 2 searches. The full suite ran while the final prose was being polished;
all examples remained unchanged. Final comparison confirms all 24 Chapter 1
fences and all 17 Chapter 2 fences are byte-identical to baseline, in the same
order. `git diff --check` passes. No fixtures or compiler settings were changed.
Two additional scratch probes checked Chapter 2's inline annotation rejection
and direct intersection assertion; results are in the Codex review below.

| Chapter | Baseline words | Final words | Final SHA-256 |
| --- | ---: | ---: | --- |
| 1 | 4,530 | 4,026 | `8846b67429a2817e6822e4383ebbdd299af0bd8bde85358c57baf6f7336b1684` |
| 2 | 3,195 | 3,068 | `72f54bd21d65b8162484f67fc9f06855b7f2daa9713fff16bda6ee9f83ff8473` |

Word counts include code. Cutting words was not a quota: reader-requested
explanations were restored where necessary.

- Chapter 1: [fresh reader](ch1-2-voice-pass/CH1-FIRST-READ.md),
  [targeted recheck](ch1-2-voice-pass/CH1-READER-RECHECK.md),
  [Claude cross-review and settlement](ch1-2-voice-pass/CH1-CLAUDE-REVIEW.md).
  The opening rule passed. Five comprehension gaps were resolved with brief
  explanations of type arguments, the conditional preview, event-map notation,
  the return-type transition and the final predicate. The fresh reader's mistaken
  pronoun for Eden is corrected in the recheck; it was not a manuscript error.
- Chapter 2: [Codex cross-review and settlement](ch1-2-voice-pass/CH2-CODEX-REVIEW.md)
  and [Claude change and reader record](ch1-2-voice-pass/CH2-CLAUDE-NOTES.md).
  Claude's separate Principle-only readers passed; its full reader and recheck
  accepted the repairs. Its full reader had Chapter 1 and the cast as prerequisites.
  The initial Chapter 2 scope note misstated the fence count as 20; the verified
  count is 17.

## Retained limits

Chapter 1 still has a large cast and substantial generic/callback material.
Its conditional example is now an explicit preview, not a lesson the reader
must derive yet. The larger sequencing pass remains open. Chapter 2's alternative
`const name` declarations share a fence; existing checks compile the alternatives
separately. A future code-formatting pass can split or rename them. These were
not silently changed during a prose-only pass.

The author requested a PR for this pass on 2026-10-05. Chapter 3's PR #12 was
merged into the Chapter 15 branch after PR #11 reached `main`, so its approved
changes have not yet reached `main`. The new PR includes that approved calibration
alongside these Chapters 1–2 revisions for the author's reading.
