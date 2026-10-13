# Chapter 4 voice pass

Status: jointly approved, 2026-10-06; recovered and submitted for the author's PR, 2026-10-13.
Baseline: `5bb10d4`, after the author merged Chapters 1–3 in PR #13.
Branch: `codex/chapter-4-voice-pass`.

## Scope

Apply the approved Chapter 3 calibration to Chapter 4. Remove narrator scoring,
forced slogans, repeated conclusions and fourth-wall dialogue. Keep the working
enum/object/union alternatives, Guy's reverse-mapping case, Oded's familiarity
argument, the SDK's chosen type and the cost of changing existing services.
Codex drafts; Claude challenges and cross-reviews. A separate fresh reader sees
only the manuscript and prerequisites.

Code containment: preserve every executable example and fence order. Twenty-two
of the 24 fences are byte-identical. Three comment lines change in two fences:

- Fence 11: label `StatusCode` as the allowed code union, not the reverse map.
- Fence 24: intentionally revise the “Rarely the best choice” caption to reflect
  the demonstrated team-maintenance condition, with shape 2 as its comparator.
  This is an editorial caption change, not a technical error correction.
- Fence 24: replace “Does nothing a union + const object doesn't” with the
  demonstrated difference: the string-enum type rejects raw strings.

These two technical corrections and one editorial caption change are explicit
comment-only exceptions to the initial frozen-fence plan.
No executable lines, language tags or fence order change. The chapter has
21 TypeScript fences, 2 JavaScript emit fences and 1 diagnostic.

## Draft choices

- Eli states an actionable initial rule: start with a type, add a runtime
  representation for an actual caller need, and examine emit as well as acceptance.
- Guy's named-member argument distinguishes the symbol from its stored string.
- The HTTP logger gives reverse mapping a purpose. Daniel distinguishes the
  string case without pretending Guy had confused it with the numeric case.
  His alternative constructs its reverse map at runtime, not with type-level code.
- The `const enum` restriction concerns access to ambient members under
  `isolatedModules`; the original claim about merely importing was too broad.
- Daniel explains the derived value union at first use; Linoy applies the same
  operation to statuses and offers the existing `ValueOf` alias.
  Oded objects to review cost, not a fabricated widening caused by adding a literal
  property. The prose no longer calls indexed access a mapped type.
- The object and string enum both provide label/value entries. `as const` is
  explicitly not a runtime freeze.
- Sahar's Turn tests whether teaching the alternative settles the maintenance
  question. Guy's on-call and reviewer-availability objections survive; existing
  services receive no blanket rewrite demand.
- The verdict keeps numeric enums where the built-in map is useful, removes
  unsupported rarity claims and preserves the team-cost qualification.
- The coda retains boundary validation and a limit on Java familiarity; it drops
  the repeated migration joke already retained in Chapter 2.

Draft 1: 4,114 → 2,708 words including code. SHA-256:
`66af4073f4432fe30797d9e91ab068a59d9756b87b667bc8015b6acc4af882ad`.

Draft 2: 2,832 words including code. SHA-256:
`c62e0444a90f3ac1e8a049414ca8f00099f557009fd9124033e10a5fba4b47cf`.
It adds the reader-requested declaration-file bridge, explains the reverse-map
contract at first use, and aligns the recommendations with the argument.
Guy explicitly answers the named-type proposal: it still requires opening the
signature. Sahar asks whether the enum is simpler or familiar before Guy defends
familiarity. Oded's tab joke and Guy's room line return without narrator scoring.

Final draft: 2,820 words including code. SHA-256:
`4bfa084de543d01835a79078dbe2ac1440886761a93f1b99a2a9f1e4e82d8d57`.
Relative to the reader-approved draft 2, Noam and Linoy now identify the status
expression as the same indexing used in the logger, instead of defining it again.
The string-enum caption explicitly compares maintenance with shape 2. These are
prose and caption refinements, with no executable change.

## Validation and evidence

`npm ci --offline` and the full `npm run check` passed on TypeScript 7.0.2
on draft 1: 282 TypeScript fences, 371 compiler cases and 105 runtime groups,
plus 2 default cases and 2 searches. Subsequent changes are prose and the three
comment lines listed above. The targeted Chapters 1–6 rerun also passed on draft 2:
110 TypeScript fences,
116 compiler cases and 8 runtime groups, including Chapter 4’s 21 fences and
25 compiler cases. That run preceded the final two dialogue lines and caption
comparator refinement; no executable content changed. Final executable-line
comparison and `git diff --check` passed.
No fixtures or compiler settings changed.
Scratch probes on locked TypeScript 7.0.2 confirmed:

- renaming an enum member retains its explicitly assigned string;
- the shown string enum and plain object yield matching name/value entries;
- `as const` does not freeze the runtime object.

Existing source links were checked on 2026-10-06:
[TypeScript enum handbook](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls)
and [Zod enum documentation](https://zod.dev/api#enums).
The former supports the distinction between ambient const-enum consumption and
an owned build; the latter supports both literal-list and TypeScript-enum inputs.

## Review decisions and retained limits

Claude's baseline readers found no stated rule; its draft-1 Principle-only reader
and Codex's independent reader both restated the revised rule successfully.
The full fresh reader saw only the chapter and prerequisite knowledge, without
plans, reviews or intended conclusions. Its consequential findings concerned
ambient enums, the first reverse-map type explanation, and overbroad closing
recommendations. Draft 2 addresses those alongside Claude's formal findings.
The [targeted recheck](ch4-voice-pass/READER-RECHECK.md) resolves all of the fresh
reader’s consequential findings without new ones.
[Claude’s cross-review and final settlement](ch4-voice-pass/CLAUDE-REVIEW.md)
approve the final `4bfa084d…` snapshot with no open findings. Claude independently
compared the fences and reviewed the final three-line change; it did not rerun
the suite. The fresh-reader recheck covers draft 2, before those three lines.
The [original reader report](ch4-voice-pass/FIRST-READ.md) and
[Claude’s baseline discovery](ch4-voice-pass/CLAUDE-DISCOVERY.md) are preserved.
The reader’s two remaining comment nits are retained: Oded immediately disputes
“write it once … forget about it”; the numeric-enum caption summarizes its
demonstrated reverse-map use. Neither removes the explicit maintenance exception
in the final ruling.

The claim that an added property necessarily widens the value union was removed.
An added property whose type is already `string` can cause that widening, as
Claude verified, but that is a different example. This pass keeps the review-cost
objection rather than introducing a new failure. Noam's exhaustiveness requirement
also stays his actual requirement; no expert is made to assert that enums cannot
check exhaustiveness merely to be corrected.

The cast remains larger than the guide's preferred range. The duplicate complete
switches and four-shape recap remain as reference material, despite their reading
cost. The `erasableSyntaxOnly` restriction is a possible future technical addition,
not part of this voice pass. Chapter 1's larger sequencing pass remains separate.

## Recovery and commit, 2026-10-13

The approved pass had not been committed when the temporary worktrees were
cleared. Claude rebuilt the final manuscript from its session transcript by
replaying the logged draft and its exact diffs. Each intermediate hash matched,
and the result is the approved `4bfa084d…` file. Codex rebuilt this record and
the reader reports from its own logs. Both recovered copies of Claude's discovery
and review are byte-identical. No text was changed during recovery, beyond this
section and the status note.

The author asked for a PR on 2026-10-13. Before committing, `npm ci --offline`
and the full `npm run check` were rerun on the recovered final `4bfa084d…`
snapshot. Both passed on TypeScript 7.0.2: 282 TypeScript fences, 371 compiler
cases and 105 runtime groups, unchanged from the book's recorded totals. This
is the first full-suite run on the final text. The earlier runs above remain the
historical record for drafts 1 and 2.

