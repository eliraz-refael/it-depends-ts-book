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

## Revision after the two Opus readers

Follows every Must fix in [PR-B-REVISION.md](PR-B-REVISION.md). Both reader reports and the settled brief are included unchanged in this revision commit.

| Finding | Revision and evidence |
|---|---|
| 1 — Ch6 Turn | Noam defends his cast-free billing parser; Oded supplies the misspelled input, and Noam concedes that the checked caller did not establish the returned config. Idan's search-for-`as` line now challenges Noam's “No assertions.” Cut the opening spoiler, the earlier Noam/querySelector conclusion, the rule before the Turn and its subheading. Renamed the unknown-returning helper `firstUnknown`; the Verdict explicitly leaves generalization timing open. Checks compile the caller against the cast-free function, execute its TypeError and valid-input control, then verify the constructed parser's rejection and success. |
| 2 — Ch3 collision | Two independently published widget declarations augment global `User`. Their explicit Node16 entry imports load both into one program; the profile-shaped user now fails TS2739. Daniel confirms the collision. A control keeps both packages installed but imports only the profile package and compiles; another supplies all merged fields. The harness gives package fixtures private directories and compiles only their entry, so installed declarations are not smuggled in as root files. Chen's other statements become questions; Noam gets his full name, Guy restores the inheritance-chain antecedent, the local Verdict commits composed data to `interface extends`, and the TS2430 caret points to `Employee`. |
| 3 — Ch2 Turn | Gilad changes the provider contract to optional email while the client retains its asserted `ApiUser`. Noam's factory test still prints `true`; the missing-email response prints `response failed`. Noam acknowledges the hidden dependency, accepts explicit tested fields and adds a missing-field case. Checks run the actual fence with the earlier factory and interface, assert both outputs, confirm the old required-email contract rejects the new response, and verify the earlier Zod parser rejects missing email and accepts valid data. Linoy introduces `satisfies`, Oded answers as the legacy caller, the factory line says one field, and duplicate Oded labels are removed. Chen's laundering irony returns. One bet metaphor remains; the Verdict starts with a rule and then the team's decision. |
| 4 — Ch5 | Cut both Principle spoilers. Show the response guard before Chen's single reframing question in that section. The new `hasError` example demonstrates TS2638; emitted faulty code throws on `"abc"` and `42`, while the corrected object/null guard compiles and runs. Prototype and numeric-property counterexamples also run. Truthiness's over-rejection is stated separately. Fixed the runtime-union question. Guy now accepts the result for callers outside his handler while keeping his request adapter; the broader preference stays open. |
| 5 — Ch1 | Restored Oded's discipline argument and routed his catchphrase directly into the eight-sprint TODO. Oded explicitly scrolls back to `firstElement` in Additional Takes. |
| 6 — Cast | Restored Linoy's tsconfig dare without claiming every flag, removed the nonexistent Noam/four-overload scene, and changed Dima's package claim to making the call. Put his concrete decision paragraph immediately after his synthesis paragraph. The Daniel/proposal distinction remains an explicit PR C dependency, per the brief. |
| 7 — Narrator and links | Gil, Daniel and Noam state their own performance, predicate-inference and Zod facts. Removed their link-carrier sentences and the corresponding citations. Ch4's consumer setting is a comment in the TS2748 fence. The substantive Express narration/link remains; no links returned to dialogue. |
| 8 — Ch4 Verdict | Restored “Use or keep” and the new-service/learning-cost qualification. |

Took the inexpensive optional voice trims: Liron's dragon warning, Noam's repeated diagnosis explanation, Linoy's union explanation, Oded's style-guide cost sentence, Guy's symmetric lookup explanation, Dima's noncommittal summary and Idan's generic inventory. Also made the photograph deadline belong to billing, where that exchange takes place. Did not add a new enum-count scene or alter Ch4's Turn. Kept “Two kingdoms. Shared building inspector,” the cast narrator's references to the book and Ch8's Eli quotation.

The five allocated catchphrases still occur once each outside the bios. Ch7's two `Unwrap` callbacks, Ch8's teaser and Bonus 3's export-annotation callback remain supported; later acts and bonus chapters are unchanged. The approved interrupted analogy and the reader's listed jokes survive. Chen's final Ch2 narrow-and-delete take remains cut deliberately to preserve the settled two-question shape; its alternatives remain in Daniel's narrowing advice and the assertion checklist.

Word counts use the same whitespace method, including fences:

| Chapter | c3d1274 | Revision |
|---|---:|---:|
| 1 | 3,869 | 3,847 |
| 2 | 2,842 | 2,938 |
| 3 | 2,399 | 2,339 |
| 4 | 2,777 | 2,769 |
| 5 | 3,025 | 2,949 |
| 6 | 2,487 | 2,435 |

No disagreement with the settled brief. The new Ch2 Turn is 96 words of net growth; every other chapter is shorter.

Validation: clean `npm ci` passed with zero reported vulnerabilities; the full `npm run check` passed on TypeScript **7.0.2**, Node **22.23.4** and Zod **4.6.6**. Act I: **111 fences, 124 compiler cases, 16 runtime groups**. Whole book: **484 fences, 892 compiler cases, 387 runtime groups**, plus the unchanged two default cases, two source searches and eleven file-list queries. Log: `/private/tmp/pr-b-revision-full.log`. The final Ch2 attribution adjustment changes prose only. `git diff --check` passes.

## Final polish after the revision recheck

Applied all six requested changes and all six listed minors. The fresh [revision recheck](PR-B-REVISION-RECHECK.md) is included unchanged.

- Ch2: Oded now identifies the fetch-result limit of `satisfies` in “our API client,” leaving the legacy-refusal beat to Additional Takes. Gilad writes the provider's type and reruns the test; Noam explicitly proposes a parser that this path does not yet have.
- Ch3: Chen introduces the two global-augmenting widget packages before asking about their collision. Renamed the first to `badge-widget`, used bare package imports, aimed his performance question at the project's slow types, and removed Guy's repeated label and “Same parts.”
- Ch5: the narration introduces the property demonstration before the response guard; Linoy's continuation names `hasError("abc")` and `hasError(42)` without relabelling her. The closing summary records Guy accepting the result for outside-handler callers and retains the disagreement inside the handler.
- Ch4, Ch6 and cast: joined the learning-cost clause to its enum condition, cut the repeated no-cast comment from `loadState`, and changed Linoy's dare to one she has “taken.”
- Checks: renamed the widget control and updated its import-removal edit. Installed-package fixtures now supply ordinary `package.json` files with `main`/`types` entries and empty JavaScript entry points alongside the extracted declarations. Bare imports produce the same quoted TS2739; keeping both packages installed but importing only the badge package remains green, as does providing the merged shape. Ch5's two named calls were already exercised by the existing runtime check.

No disagreement or deviation. The first targeted run exposed the fixture's missing package manifests; completing the package layout resolved that failure without changing the printed declarations or diagnostic. The second targeted run passed all 124 compiler cases and 16 runtime groups. No new fences or cases were added; the Ch6 fence change removes only a comment. Ch1 and all later acts remain untouched in this polish round.

Final validation: clean `npm ci` passed with zero reported vulnerabilities; full `npm run check` passed on TypeScript **7.0.2**, Node **22.23.4** and Zod **4.6.6**. Counts remain **484 fences, 892 compiler cases, 387 runtime groups** (Act I: **111 / 124 / 16**). Logs: `/private/tmp/pr-b-polish-install.log` and `/private/tmp/pr-b-polish-full.log`. `git diff --check` passes.
