# PR B plan — Prologue and Act I

Base: **b85236d**, PR #33 head; line numbers below refer to it. Plan only. After settlement, branch PR B from here or main after #33 merges. Apply [FIX-PLAN.md](FIX-PLAN.md) and preserve the [fact-check rulings](FACT-CHECK.md).

## Prologue and cast

- **Dima:** keep the pragmatist and full-stack background; replace habitual mediation and “strong opinions are rare” with separating conflated questions, then choosing for the caller he owns. He does mediate in Ch6:57–63, qualifies alternatives in Ch13:254–264, and owns decisions in Ch20 and Bonus 1. Keep the “centrist type theory” joke and catchphrase. Update the glance table. Bend Ch1's explanatory Dima back toward his warmth, rather than making all his decisions compromises.
- **Linoy:** replace “every experimental flag,” “every beta feature” and guaranteed knowledge of future releases with enthusiasm for trying language features against real callers, sometimes mistaking a convenient signature for a checked implementation. Ch2's `satisfies`, Ch8's derived request, Ch20's factory and Ch27's failed generic support this. Keep the rejected-PR joke, feature history, RFC catchphrase and willingness to revise her proposal; update the glance table.
- **Noam's “they”: already fixed in PR A.** Cast :33 says “until someone has called the function.” No second edit. Keep he/him; Linoy, Dafna and Idan use she/her. Restore Chen's questioning voice rather than weakening his bio.
- **How to read:** keep the format promise and compiler-profile note, including `noUncheckedIndexedAccess`. Fix chapters to meet the promise.

## Catchphrase reservations

**Count correction:** **12**, not 11, of the 15 canon catchphrases are absent from chapters. Only Dafna's (Ch1:525), Gilad's (Ch13:106) and Guy's (Ch8:67, Ch17:244) occur. Oded's exact phrase is absent; Noam's “In the next sprint?” is not Oded saying it. Count spoken uses outside bios, ignoring typography. Reserve all twelve. Guy's existing duplicate is separate: recommend keeping Ch8 and varying Ch17 in PR D.

| Act | Speaker and exact phrase | Reserved scene; why it belongs |
|---|---|---|
| I, Ch1 | Oded — “We can fix it in the next sprint.” | His interrupted cleanup defence at :102, immediately before Noam's existing eight-sprint rebuttal. Makes the callback literal. |
| I, Ch2 | Noam — “Over my dead type definition.” | Oded's partial `User` fixture, before Noam offers the complete factory. One comic refusal, followed by an answer to the noise complaint. |
| I, Ch3 | Chen — “But have you considered...” | His question about two application models entering the same global scope (:188); finish the question with that concrete collision. |
| I, Ch5 | Idan — “Prove it by producing it.” | Guy says the fields are already on the object; Idan asks him to watch the constructed return value (:228–230). No second slogan in the Principle. |
| I, Ch6 | Dima — “Both have a point here.” | The existing `firstItem` mediation: acknowledge preserved element information and Oded's actual caller, then name the unresolved timing choice. |
| II, Ch7 | Eli — “Let us return to first principles.” | The Turn asks what the tag-index caller needs before choosing a return-type trick. Eli is already present from the opening. |
| II, Ch7 | Linoy — “There's an RFC for that.” | The failed generic conditional-return body, well before the Turn. Daniel makes her distinguish a proposal from available checking. See source guardrail below. |
| II, Ch8 | Daniel — “The compiler disagrees.” | Oded tries mutating the form derived from readonly fields (:246). Let the diagnostic answer the claim. |
| III, Ch17 | Liron — “Complexity is a choice, not a necessity.” | Reserve for the ownership/snapshot discussion, with the river image PR D already owes. His opening establishes his presence; let someone challenge what his simplification preserves. |
| III, Ch23 | Sahar — “Simple made better.” | His plain-union alternative, before Guy asks about the six existing screens (:294–300). The catchphrase gets resistance, not narrator endorsement. |
| IV, Ch24 | Eden — “I've seen this fail at scale.” | The unchecked-caller/migration discussion, grounded in the route on the page; no invented incident statistics. |
| IV, Ch27 | Gil — “What does the data say?” | Before comparing the counterfactual fixtures. Existing measured evidence answers him; no new timing claim. |

Split: **5 / 3 / 2 / 2**; none in the bonus act. Later-act rows are reservations only. Every speaker already appears in the reserved chapter.

For Linoy, [TypeScript issue #33912](https://github.com/microsoft/TypeScript/issues/33912) discusses relating control flow to conditional return types. It is a suggestion, not an RFC or a release promise. PR C must make her terminology correction audible in the exchange and attach any citation to narration, while keeping the pinned compiler's reproduced result authoritative.

## Chapter 1 — onboarding without losing the Turn

Keep `firstElement` as the simple generic example. Move the compact `Unwrap` exchange, including Oded's participation, to Additional Takes; cut the syllabus announcement at :276. Preserve Ch7's repaired memory of it. Keep Eli's correctly placed `Promise<UserProfile>` explanation from PR A. Turn the predicate gloss at :617 into a short question and answer prompted by Dima's purchase check.

Keep the event map, generic `on` and overloads: Noam's implementation `any` must earn the Turn. Cut the third `onEvent`/tagged-union alternative, taught properly in Ch3/5; adjust Dima's three-way recap. Guy retains his adapter scene. Preserve Chen's implementation question, the “homework” joke and the transferable Verdict. No additional syntax tutorial.

## Chapter 2 — questions and a spoken closer

Replace the factory tableau (:237) with Oded negotiating a comment naming exercised fields and Noam accepting a complete fixture. Preserve their dispute about defaults hiding dependencies.

Chen asks what `satisfies` checks, what the intermediate `unknown` established, why `!` escapes review, and where evidence after `filter(Boolean)` or a callback lives. Daniel/Noam explain `NonNullable`; Chen's final recommendation (:406) becomes a question about using the available check to narrow directly.

Keep “fake mustache” and the `Map.has`/`get` exchange. Cut the repeated punctuation speech, repeated laundering explanation and Gilad's abstract restatement after his concrete failure timeline. Keep one bet metaphor. Replace Linoy's apology/deprecation aphorism with a line about her actual configuration choice; `satisfies` cannot replace every assertion. Correct Oded's local `User` to `ApiUser`. Shorten the factory Verdict cell without hiding the dependency concern. Keep the Principle's evidence rule and the Verdict's failure-discovery requirement.

## Chapter 3 — a convention meets a diagnostic

Lead with Eli's existing choose-by-required-capability rule, shortened to avoid previewing every example. **The Turn changes a tentative data/behavior convention by testing a composed data object.** Keep the initial nonconflicting `Base`/`User` definition before `renderProfile`. Defer the conflicting `Employee extends Base`, intersection, failed construction and resulting concession until the Turn.

The Debate establishes merging, non-object types and the state/operation tradeoff. Oded asks for a plain-object default; Liron offers a shorter blueprint/description convention. Guy then tests it with the existing conflicting `id`: the intersection accepts the declaration and fails at construction; `extends` reports the conflict at composition. Retain the independent-parts/`UserContract` comparison here. Dafna keeps her generic-expression case; Liron changes his data rule to admit composed interfaces. The exception now follows the proposal.

Keep a local Verdict: capabilities first, convention second, conflict-checking exception earned. No invented performance data for Gil or new brand lesson.

## Chapter 4 — preserve the real Turn

Keep Sahar confronting maintenance cost and Guy's numeric-logger case. No new catchphrase. Shorten the ambient-enum glossary into a consumer-build question, with configuration beside the diagnostic. Preserve emit versus bundle cost. Keep the scoped exceptions in the table rather than repeating all of them in the Verdict's opening. Move the two citation passages below. Mechanisms and ending category stay.

## Chapter 5 — rule first, failure policy still disputed

Daniel opens with the testable requirement: for external input, return a typed value built from checked fields, so the compiler checks its construction. Failure transport remains a separate choice. Move the `typeof` and null-comparison demonstrations into the Debate; don't spoil the equal-details Turn.

Keep Chen's questions; turn :95's instruction into a question about null/primitive right operands of `in`, answered by Linoy. Shorten the gotcha inventory without dropping fence premises. Have Dafna ask where the event union arrives before Idan introduces the bus. Preserve Guy challenging Noam's throwing parser and adopting the same checks. Keep **The Debate Continues**: result versus an established exception handler remains disputed. Cut repetitive failure-equivalence narration. End Eden's take on migrating behind existing callers, not reviewing changes separately. Noam's fact-checked predicate warning stays unchanged.

## Chapter 6 — deleting the cast does not delete the claim

Lead with Eli's relationship rule, then explain notation through `identity`. Remove the advance timing disclaimer; Dima draws that distinction in the Debate. Preserve Eden's export-return-type warning, recalled in Bonus 3.

Move **The Turn** to “Generics that lie,” before `parseConfig<T>`. Deleting `as T` looks like a repair; `JSON.parse`'s `any` still lets the same false promise compile. Idan cannot find it by searching for assertions. The response changes to tracing what supplies the return type, then constructing `RetryConfig`. Keep Oded's `ParseResult<T>` challenge: this concerns function promises, not every generic declaration.

Remove the standalone lens/photograph Turn. At most, retain a short interrupted analogy in the earlier concrete-versus-generic exchange. Keep **The Verdict** for the relationship/evidence rule, explicitly leaving generalization timing open. End on a caller or spoken objection, not unfinished review work. Preserve enough of Eli's computation teaser for Ch8's “Eli had promised” callback.

## Link moves and standards check

| Current location | Planned treatment |
|---|---|
| Ch3:182, Express core definitions | Fold citation into narration identifying the global extension point the middleware is about to use; remove the standalone source announcement. |
| Ch3:349, performance wiki in Linoy's speech | Keep Gil's scoped account and Linoy's profiling condition; attach the citation to one factual narrator sentence about the recommendation. No forecast about TS 7 speed. |
| Ch4:123, const-enum handbook | Attach to the substantive consumer/declaration setup; cut the link-only sentence. |
| Ch4:501, appended “See Zod…” | Put the enum-validation fact and citation into narration, or attach it to existing substantive setup; end Noam's spoken take on the need to validate input. |
| Ch5:153, 5.5 release notes in Daniel's speech | Narration supplies the predicate-inference fact and citation; Daniel explains why the explicit annotation still needs review. |

No links occur in Ch1, Ch2 or Ch6. The prologue README link already serves a substantive instruction and stays. Remaining prose links are eligible for the later print-footnote build; PR B does not build it.

1. **Principle:** Ch1/2/4 retain their testable rules; Ch3/6 lead with theirs; Ch5 gains an immediate construction rule. Short spoken openings, no reveal inventories.
2. **Verdict:** preserve transferable-first rulings in Ch1–4/6, with local choices following; keep Ch5's honest open ending. Ch6's timing disagreement does not invalidate its signature rule.
3. **Closers:** replace Ch2's tableau and Ch5/6's review closers; preserve spoken objections/results in the relocated Ch1/3/6 scenes.
4. **Fiction:** remove Ch1's preview bookkeeping; retain in-world continuity for `Unwrap`, `RequestState`, Eli's computation teaser and Eden's return-type warning.
5. **Links:** complete inventory above; none in dialogue, at most one per substantive narrator paragraph.
6. **Narrator:** no replacement glossary paragraphs; necessary state changes remain visible in fences or prompted exchanges. Moving examples must not create forward references.
7. **Cast:** revise Dima/Linoy from actual scenes, restore Chen's questions, keep pronouns and the phrase reservations; do not invent data to enliven Gil or make Oded incompetent.

## Checks when drafting begins

Reindex moved/deleted fences in `checks/chapters1-6.cases.cjs`; verify declaration order without relying on harness helpers. Preserve PR A's fixes. Ch3 needs both conflict diagnostics and successful controls. Ch6 needs the same misspelled JSON executed with and without the cast, followed by parser rejection and valid-input controls: existing cases compile both false promises but execute only the honest parser. Audit phrases, speakers, links, closers and the named callbacks. Run clean `npm ci` and the full suite after drafting; this plan changes no code.

## Settlement

Author's rulings, 2026-11-03; these govern the draft where they qualify the plan above:

1. The count of twelve missing catchphrases and the Act I allocation are accepted: Oded Ch1, Noam Ch2, Chen Ch3, Idan Ch5, Dima Ch6. Ch7 remains the voice benchmark and gets at most one: Linoy keeps its RFC slot. Eli's first-principles phrase needs another Act II home, to be settled in PR C. The other later-act rows remain reservations. Vary Guy's Ch17 duplicate in PR D.
2. Restore Chen's questioning voice with questions that reframe, not quiz. In Ch2, choose the two questions that change the conversation rather than four in a row. He can answer when asked.
3. The restructures must not cost jokes: no chapter should have fewer laughs. Keep Ch6's short, interrupted lens/photograph analogy; Liron's images already thin out later.
4. The Ch3 and Ch6 Turns are approved as planned. Keep each chapter about the same length or shorter. Guy must test Liron's convention in Ch3, making the deferred conflict a discovery rather than a lecture.
5. Move Ch1's `Unwrap` exchange to Additional Takes, keeping Oded in it so both Ch7 callbacks still hold.
6. Revise Dima and Linoy as proposed. Keep Linoy warm: describe an enthusiast's habit rather than label a flaw. Dima retains “Both have a point here” alongside separating conflated questions.
7. The later TypeScript #33912 citation belongs only in narration, described as a long-open suggestion, with no release claim.

Draft on `codex/release-act-1` from `b85236d`, update the checks, run clean `npm ci` and the full suite, then commit locally without pushing.
