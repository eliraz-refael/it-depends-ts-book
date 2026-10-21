# Chapter 5 voice pass

Status: **JOINTLY APPROVED**, 2026-10-21; submitted for the author's PR.
Baseline: `891f1c6`, after the approved Chapter 4 pass.
Branch: `codex/chapter-5-voice-pass`.

## Scope and calibration

Apply the author-approved [Chapter 3 pilot](CH3-PILOT.md),
[Chapters 1–2 pass](CH1-2-VOICE-PASS.md), and [Chapter 4 pass](CH4-VOICE-PASS.md).
The author authorized this pass through Claude's brief. Codex owns the manuscript
and records; Claude supplies independent discovery, readers and cross-review.

This pass preserves parse-at-boundary, the schema-derived type, Guy's throwing
adapter, and the unresolved result-versus-throw choice. Chapter 16 relies on
those conclusions. No other manuscript chapter or registered technical fixture is edited.
The worktree starts before the still-open continuity and Chapter 16 PRs; Claude
will rebase before opening the final PR as needed.

## Baseline reading and discovery

Codex's fresh [opening-only reader](ch5-voice-pass/CODEX-BASELINE-PRINCIPLE-READ.md)
received only the opening before the Debate. It identified descriptive rules
about control flow and trusted predicates, but no prescription for designing
reliable checks. Claude's separate [baseline reader](ch5-voice-pass/BASELINE-PRINCIPLE-READ.md)
also found no stated prescriptive principle.

Claude's [independent discovery](ch5-voice-pass/CLAUDE-DISCOVERY.md) arrived and
was read before this draft was frozen. Its mandatory fixes are all applied:
a stated principle, the handwritten-parser reset, and missing speaker tags.

## Draft choices

- Daniel states a preference for producing typed values from checked fields,
  distinguishing compiler-checked output from trusted narrowing annotations.
  It leaves result versus throw open: Guy's adapter also returns a produced User.
- The opening recap, repeated control-flow conclusion and loose-equality
  anthropomorphism are removed. The predicate syntax is explained at first use.
- Linoy's catalogue is broken by Chen's concrete cross-realm question. NaN's
  finite-number limit stays with Daniel; the repeated explanation is removed.
- Noam retains a reusable, testable guard. Dafna still makes him confront the
  annotation, and Guy still challenges his earlier use of a throwing parser.
- Dafna, Noam, Guy and Idan receive explicit attribution at the broken exchanges.
  The parser/wrapper comparison keeps the same checks and error details.
- The Turn explicitly returns to Idan's handwritten `parseUser` and Guy's
  `parseUserOrThrow`. The existing case `result-and-exception-reasons` compiles
  fences 8 + 9 + 13, exactly that context. The Zod section retains its stronger
  email-format check and replacement `User` definition.
- Narrator judgments, stock silence, standalone catchphrases and the wrapper-left-
  on-screen close are cut. No replacement gestures or jokes were added to fill quotas.
- Dafna's exhaustiveness claim is limited to the shown annotated function;
  Daniel retains strict-null-checking and inferred-return qualifications.
- The Debate Continues and reference table stay. One repeated closing paragraph
  is cut. The schema choice does not settle failure handling for every service.

## Decisions on optional discovery suggestions

Keep Noam's Take: adding a required field without forcing an explicit predicate
body to change is a specific maintenance consequence, beyond his earlier request
for tests. Daniel's repeated trust Take is cut; the TS5.5 history and source link
move to his existing explanation of inference versus explicit annotations.

Keep the comments in fence 4 unchanged. They contain an editorial aside, but
repairing the prose and parser context needs no exception to the frozen-fence
scope. Record the comment as a retained limitation rather than silently polishing it.

The eleven-person cast and reference table remain, as in the approved Chapter 4
calibration. The chapter still surveys several mechanisms; readers should assess
whether the shorter prose preserves enough warmth and makes their connection clear.

## Draft 1 snapshot and validation

Draft 1: 2891 words including code (baseline 3,258).
SHA-256: `70ae6073d037d597cf224c85283da31799efaaee932f3700a98b2c030d0cca16`.
All **13 TypeScript fences** remain byte-identical and in the same order.
No code, comment, fence-language, fixture or compiler-option exception was needed.
The [snapshot manifest](ch5-voice-pass/DRAFT1-SNAPSHOT.json) records both manuscript
hashes and each fence hash. `git diff --check` passes.

`npm ci --offline` and `node checks/chapters1-6.cjs` succeeded on the frozen
draft with TypeScript 7.0.2: 110 fences, 116 compiler cases and 8 runtime groups.
Chapter 5 contributes 13 fences and 13 compiler cases, with no fixture edits.
The full suite was deferred until review revisions, as the brief requested;
fence preservation was not treated as final editorial approval.

The existing [TypeScript 5.5 source](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
was checked on 2026-10-21 and supports the moved inferred-predicate explanation.

## Draft 2 and independent review

Claude's [formal review](ch5-voice-pass/CLAUDE-REVIEW.md) and its
[Principle-only](ch5-voice-pass/CLAUDE-DRAFT1-PRINCIPLE-READ.md) and
[full reader](ch5-voice-pass/CLAUDE-DRAFT1-FULL-READ.md) asked for prose revisions.
The Principle reader could restate the rule, but both readers found its placement
abrupt. The full reader also identified repeated trust explanations and two
unanswered competent alternatives.

Draft 2 addresses those findings. The [response](ch5-voice-pass/CODEX-DRAFT2-RESPONSE.md)
records each disposition. Daniel's rule now follows Chen's question, names the
assertion-function syntax, limits the compiler's promise to fields and types,
and separates construction from failure handling. Noam keeps a predicate for
filtering, backed by this handwritten parser. Idan answers the propagation cost
by parsing at the handler. The event parser now receives another module's
in-memory state changes. Repeated trust explanations and the requested line
friction are removed.

Draft 2: **2961 words** including code.
SHA-256: `a94d99f3313b21f3ae10dd93b0dfc97fc824bba78b90008cba3d77b49e9cb0f1`.
All **13 TypeScript fences** remain byte-identical and in order against `891f1c6`.
The [draft 2 manifest](ch5-voice-pass/DRAFT2-SNAPSHOT.json) preserves the snapshot;
the draft 1 manifest and Claude's reports remain unchanged.

`npm ci --offline` succeeded. The full `npm run check` exited 0 on TypeScript
7.0.2: **282 fences / 371 compiler cases / 105 runtime groups**, plus two default
cases and two searches. That run preceded only the final antecedent clarification
from “And that fails” to “That always-true body fails”; the examples were unchanged.

At draft 2, two additional [editorial probes](ch5-voice-pass/INLINE-PROBES.cjs) compile and run
independently on the final draft: the handwritten parser's predicate infers
`User[]` through `filter` and preserves the original accepted object; the Zod
failure reason parses as an issue array with the rejected field's path. These are
**two compiler probes and two runtime groups**, separate from the book totals.
Run them with `node docs/editorial/ch5-voice-pass/INLINE-PROBES.cjs`.

This predicate adapter is scoped to the shown handwritten field-checking parser.
It does not prove an arbitrary transforming parser's input has its output type;
the explicit predicate annotation remains trusted. Zod's failure reason is an
issue list rendered as text, unlike the handwritten reason. The Turn explicitly
selects the handwritten parser, so its printed messages remain accurate.

## Draft 3: final prose round

Claude's [second review](ch5-voice-pass/CLAUDE-REVIEW-2.md), informed by the
[fresh recheck reader](ch5-voice-pass/CLAUDE-DRAFT2-RECHECK-READ.md), accepts the
first-round repairs and requests one final prose round, with no further reader.
Both reports are preserved unchanged.

All requested items are applied:

1. Noam's maintenance Take now concerns an explicitly annotated predicate with
   its **own** field checks. It no longer contradicts his delegating predicate.
2. Idan says filtering retains the original objects. To get only the checked
   fields, map through the parser and keep successful values. The inline probes
   verify original identity and extra keys versus the newly constructed values.
3. The deletion experiment removes the **email check** from both bodies. The
   parser now fails at its `input.email` read with TS2339; the predicate compiles.
   Noam removes and restores the check, rather than a return field. The probes
   pin the parser diagnostic's code and line and the predicate's clean compile.
4. Daniel's principle names the mechanism: checks permit the field reads and
   their use in the constructed object. The failure-handling clause stays neutral.
5. Daniel connects the TS5.5 remark to explicit annotations taking the place of
   inference. Noam names `assertNever(value: never)` as a helper. Linoy describes
   array identity without the internal-slot shorthand. The scrolling stage
   direction is removed; Daniel's strict-null-checking sentence is complete.

Draft 3: **3007 words** including code.
SHA-256: `0a0691e1420e26a764462015fe5b5c784d0ff9ff810d0fd17ec40ba0bc11ab6d`.
The [draft 3 manifest](ch5-voice-pass/DRAFT3-SNAPSHOT.json) confirms all **13 fences**
are byte-identical and ordered against both `891f1c6` and draft 2 (`53710bf`).

`node checks/chapters1-6.cjs` exits 0 on TypeScript 7.0.2:
**110 fences / 116 compiler cases / 8 runtime groups**. The full-suite run remains
the draft 2 run recorded above, as agreed in Claude's review; no full rerun is
claimed for draft 3. The expanded editorial probes separately pass **4 compiler
probes / 2 runtime groups**, including both deletion cases and the parsed-value
comparison. No registered suite or example fence changed. `git diff --check` passes.

## Review state

Draft 3 is frozen for Claude's final diff review. No further reader is requested.
The local handoff commit includes Claude's second review and recheck reader.
Final settlement, rebase and publication remain with Claude; nothing is pushed
by Codex at this step.

## Final settlement and rebase, 2026-10-21

Claude's final diff review approved draft 3 (`0a0691e1…`); see
[review 2](ch5-voice-pass/CLAUDE-REVIEW-2.md#final-diff-review-2026-10-21). The branch was then rebased
onto `main` `3755b94` (continuity batch #15 and Chapter 16 #16), with no conflicts. On the rebased tree,
`npm ci --offline` and the full `npm run check` exited 0 on TypeScript 7.0.2: **299 fences / 398 compiler
cases / 119 runtime groups**, the current book totals including Chapter 16. Chapter 5's 13 fences remain
byte-identical to `891f1c6`.
