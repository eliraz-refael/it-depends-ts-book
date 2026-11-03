# PR B self-review — Prologue and Act I

Base **b85236d**; branch **codex/release-act-1**. The author's seven rulings are recorded in the [plan's Settlement](PR-B-PLAN.md#settlement). No later-act manuscript changes, push or PR creation.

## Changes and reading risks

| Area | Change | What to review |
|---|---|---|
| Cast | Dima separates conflated questions and owns decisions without losing his mediating catchphrase. Linoy tries features enthusiastically and tests the implementation; her bio retains warmth, the editor joke and an answer to Noam. Both glance-table entries follow. Noam's PR A pronoun fix stays. | The bios should promise the characters the chapters now deliver, not read as fault lists. |
| Ch1 | `Unwrap` moves intact to Additional Takes with Oded participating. The main generic example remains `firstElement`. Removed the third event-handler alternative; retained the map, overloads and implementation-`any` Turn. The predicate explanation is prompted dialogue. | Oded remembers the actual `Unwrap` exchange in Ch7; both existing Ch7 callbacks still have their source. The remaining event-handler notation is necessary for the Turn, not another tutorial. |
| Ch2 | Chen asks two questions that redirect the argument: what the double assertion fixed, and why spelling an assertion `!` changes its review. He answers Oded rather than delivering a second lecture. The factory scene ends in negotiation and a joke. Cut repeated aphorisms; put the existing evidence rule first. | The fixture compromise does not prove a new dependency will be noticed. The shortened table keeps that limitation. Purple's final joke refers to the scalar `as Color`, which accepts it, not the palette assertion, which does not. |
| Ch3 | Liron offers the convention before Guy tests the conflicting employee ID. The accepted intersection declaration fails at construction; `extends` reports the composition conflict. Liron amends his data rule. The Verdict states the transferable choice before the team's convention. | This is the main discovery/readability risk: Guy must sound like someone testing the proposed convention, not restarting a lecture. The earlier `Base`/`User` remains before the profile caller. Added `name: string` to the interface Employee so the two compared forms include the same fields. |
| Ch4 | Shortened the ambient-enum explanation around a consumer-build question; moved links into substantive narration. Shortened the Verdict opening while retaining scoped exceptions in the table. | Preserve the distinction between emitted code and final bundle cost. Sahar still has to concede the team's maintenance constraint. |
| Ch5 | Daniel states the construction rule before the demonstrations. Chen challenges the response guard's promise instead of asking for an API inventory. Idan's event-bus setup answers Dafna. Failure transport remains an honest open disagreement. | Keep Guy's challenge to Noam's throwing parser and the same-checks/same-details comparison. The fact-checked Additional Take about predicate tests is byte-identical. |
| Ch6 | The Turn is now the unchecked generic promise surviving deletion of `as`. The short lens/photograph analogy moves earlier, interrupted by Chen and answered by Oded. Eden's return-annotation warning and Eli's computation teaser remain. | Relationship checking does not settle when to generalize. Noam and Oded still disagree about that timing; Bonus 3 and Ch8 retain their callbacks. |

## Length and fun

Whitespace word counts, including fences, measured the same way on both revisions:

| Chapter | Base | Draft |
|---|---:|---:|
| 1 | 4,070 | 3,869 |
| 2 | 3,066 | 2,842 |
| 3 | 2,586 | 2,399 |
| 4 | 2,822 | 2,777 |
| 5 | 3,007 | 3,025 |
| 6 | 2,609 | 2,487 |

Both risky restructures are shorter. The fun audit is an editorial judgment, not a measured laugh count:

- Ch1 keeps the eight-sprint TODO, blocked PRs, homework and angle-brackets concession; adds Dima's “excellent paperwork.”
- Ch2 keeps the fake mustache and the Map argument, adds the wrapper's “office,” Noam's catchphrase and Oded wanting agreement in writing. The purple appeal replaces the apology/deprecation aphorism.
- Ch3 keeps the diagnosis/riddle and “more careful with words”; adds hiring neither ID and the shared building inspector. The shortened parable still belongs to Liron.
- Ch4 retains closing the tab, the numeric dropdown surprise and the 3 AM familiarity exchange; adds the package/call reversal.
- Ch5 retains Guy's “Was that wrong?” and refusal of the generic-error comparison; adds Linoy's “That check is not an invitation.”
- Ch6 keeps deleting something, payroll, the hidden unchecked claim and “Are we deleting that too?” The interrupted analogy now gets its Friday photograph and a later callback.

## Standards and verification

- All five allocated Act I catchphrases occur exactly once in chapter dialogue. No later reservation was spent. The settlement explicitly removes Eli's Ch7 reservation and leaves his Act II home for PR C; Linoy alone keeps Ch7. The original proposal table remains historical, governed by that settlement.
- All five Act I links are in substantive narration, one per paragraph, with none in dialogue. The prologue README link and compiler-profile note remain unchanged. Print-footnote work remains later.
- One Turn heading per chapter. Ch2's silent closer is gone; Ch5/6 no longer close on review logistics. No chapter-number or manuscript-preview narration was added.
- Every surviving TypeScript fence is byte-identical to the base except Ch3's interface Employee, which gained the matching `name` field. Ch1 deletes one fence; Ch1/3 move others. Ch3's profile case now compiles against the earlier printed `User`, not a replacement helper.
- Ch3 asserts TS2430 and TS2322 with their quoted messages, plus restored-green controls for both spellings. Ch6 extracts the printed bad JSON, runs both extracted implementations, asserts the same TypeError, then exercises valid controls. The checked parser rejects that same bad input and accepts the valid one.
- **Clean `npm ci`: PASS**, zero reported vulnerabilities. **Full `npm run check`: PASS**, TypeScript **7.0.2**, Node **22.23.4**. Act I: **109 fences, 120 compiler cases, 14 runtime groups**. Whole book: **482 fences, 888 compiler cases, 385 runtime groups**, plus the unchanged default cases, source searches and file-list queries. Full log: `/private/tmp/pr-b-full-check.log`.
- `git diff --check` passes. All manuscript files in Acts II–IV and the bonus act are byte-identical to the base, including the refuted findings. PR A's logger contract, empty-array result, complete naming fence, status tag and diagnostic assertions remain covered.

No settlement deviation. The main reader questions are whether Ch3 feels discovered and whether the revised bios and replacement jokes retain their warmth; compiler success cannot decide those.
