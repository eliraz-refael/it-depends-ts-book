# Bonus 1 — draft 3 self-review

Status: **DRAFT 3; final Principle-only read and diff review pending.**

Manuscript: [Which File Says That?](../../book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md).
Review addressed: [Claude's second review](bonus1/CLAUDE-REVIEW-2.md), with both verbatim reader reports at `1be8447`.
Snapshot: [DRAFT3-SNAPSHOT.json](bonus1/DRAFT3-SNAPSHOT.json). The draft 2 self-review is retained below; earlier snapshots and reader reports remain unchanged.

## Response to the ranked findings

1. **The Principle names the page's failure.** The predicate clause is cut. The rule now names unchecked any, an as type assertion and the non-null assertion !, then says plainly that code without them can still do the wrong thing. It does not conflate type assertions, non-null assertions, assertion functions or test assertions. The opening failure supplies any; Chen raises the hypothetical assertion; the two cast-free candidates supply the remaining limit.
2. **The opening is a rule, not a metaphor.** It starts with the requirement to put decisions into the signature and success/rejection examples before asking for code. Paragraph 1 has three sentences and two imperatives. Existing signatures and tests explicitly count. The compiler-and-test command supplies a clear antecedent for “Run that command.” Disagreements go into the examples “before the next attempt,” with no ambiguous return direction. The semicolon hedge is gone. The Principle is 133 words, down from 146.
3. **The imports point is scoped and prompted.** One Principle sentence ties permitted file changes to source imports checked under the same configuration. It does not claim to re-check implementations hidden behind declaration outputs. In the debate, Chen asks whether the reset changes every JSON.parse in the shop; Idan limits it to this program and its imported source, with the short Chapter 13 callback and overload link. No new helper subplot or extra compiler fixture was needed.
4. **The Verdict loses the repeated run and agreement.** It is 291 words, down from 383. Dima retains his win on reusing existing signatures/tests, and Eli answers briefly. The explanation recap becomes “It did tell us 'normalizes'” / “And you read 'validates'. Read that bit next time.” The extra npm run check and Eli's limp line are cut. The deliberate-change discussion and closing ownership exchange remain, including the antecedent for “someone here.”
5. **The debate beats have their setups.** The early “No casts isn't a certificate” spoiler is cut. Chen's “Very harmonious” now explicitly concerns a hypothetical answer that proposes both contract and code and passes. Eli's repeated ownership question is removed. Dima's first reaction to the zero-cent refund is an objection; his later combined turn recognizes “normalizes” and states the owned provider rule. The redundant defense of the hundred-cent test is cut; Idan's zero case still motivates protection against a falsy-value repair. Eli asks for a test that fails when coercion occurs, without the test-runner lecture.
6. **Line fixes are literal.** The failing run now says “The other four pass,” including malformed input. The two code-explanation narration passages are trimmed to what they do and what passes. Dima's look back at the request is ordinary narration, not a bold speaker tag. JSON.parse and any in his speech use code formatting.

I disagree with none of the review findings. The “Not adopted” items stay unchanged: Node declarations remain at 26.5.1, no negative-zero detour is added, the contract changes before the implementation, the final request stays saved rather than sent, and the owner chooses any remedy for imported-source failures. Every fence and all three request texts are byte-identical to draft 2.

**Length exception:** the requested local cuts reduce the manuscript from 2,305 to **2,122 words**, below the original 2,300-word drafting minimum. I prioritized the later, specific cuts and did not add replacement material merely to restore that count. This is disclosed in the handoff rather than silently treating the earlier target as met.

## Principle-only self-test

- **Two passing implementations:** the first sentence puts the decisions in examples before commissioning, and a newly exposed disagreement must be recorded before the next attempt.
- **A shortcut to green:** the rule names the any/assertion failure on the page and separately says their absence does not establish correct behavior. The predicate case can still be rejected through the required rejection example without teaching predicates in this Principle.
- **Existing signature and tests:** reuse is explicit, with the same project configuration and compiler/test command. It is no longer an inference from “reuse what's already there.”
- **Only the generated directory:** the source imported by the implementation shares its configuration. The permitted change scope must account for that; the rule does not prescribe a project-reference design or silently authorize changes to old files.

These remain self-tests. The next isolated reader should assess whether the more direct rule resolves the remaining ambiguity without becoming a checklist. The chapter was reread from start to finish after the changes; its concrete Turn, confident fictional explanations and final ownership exchange remain intact.

## Validation and freeze

The targeted run passed on TypeScript 7.0.2 and Node 22.23.4. Coverage is now **11 fences / 31 compiler cases / 15 runtime groups / 1 file-list query / 23 ownership verifications**. Removing the duplicate narrative run removes one compiler invocation and one runtime group, plus its before/after ownership checks. The chosen implementation is still restored after independent value comparisons and tested green after each separate regression control.

The checker explicitly compares the four passing test names in the coercing run with the expected names other than “rejects text amounts.” It retains the assertion's empty-string message and actual zero-cent result, TS2322's return-column check, fixed-contract comparisons, protected-file hashes, always-reject and predicate controls, reset removal/restoration, and dependency/import-scope controls. The saved request still makes no claim of another assistant response. Full-suite verification below includes the final passing-name assertion and final prose.

`npm run check` completed with exit 0: **464 fences / 805 compiler cases / 323 runtime groups**, plus two compiler-default cases, two searches and nine file-list queries. The full run repeated all Bonus 1 controls and the explicit four-passing-tests assertion. Manuscript, validator, runner and shared compiler profile hashes were recorded before execution and verified unchanged afterwards.

The frozen manuscript has **2,122 words** and 11 fences, all byte-identical to draft 2. SHA-256: `21b6a40fa3d09f4fe94674dcdef3cefd61d8f3ffceb3c9ec77fdc6ec892ba33f`. The snapshot records the word-count exception, unchanged fence hashes, removed duplicate run, passing test names, protected-file hashes and full-run evidence.

---

# Bonus 1 — draft 2 self-review

Status: **DRAFT 2; revised Principle-only read and targeted recheck pending.**

Manuscript: [Which File Says That?](../../book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md).
Review addressed: [Claude's draft 1 review](bonus1/CLAUDE-REVIEW.md), with both verbatim reader reports at `66df5de`.
Governing settlement: [Bonus 1 plan](BONUS1-PLAN.md#settlement-after-codexs-challenge-2026-11-01), commit `bcc90ab`.
Snapshot: [DRAFT2-SNAPSHOT.json](bonus1/DRAFT2-SNAPSHOT.json). Draft 1's snapshot and received reports remain unchanged.

## Response to the review

1. **Dima makes the wire-format decision.** The narrator's policy paragraph is replaced by his statement of the provider's contract and his choice to reject violations so the shop can report them. He ends with “That's our rule.” His later ownership of the integration now follows a decision he actually made in the room.
2. **The Principle identifies the unchecked claims.** It names type assertions (`as`, `!`) and predicates whose bodies never check their claims. It no longer says that an ambiguous “assertion” cannot establish a fact, which could incorrectly include an assertion function with a real runtime check. The absence of those shortcuts remains insufficient evidence of correctness.
3. **The Principle puts decisions into the examples.** Its opening now says to put the behavior in the signature and success/rejection examples before asking for code. If passing candidates reveal an omitted decision, it explicitly goes into the examples before handing the work back. The reader's favored closing pair remains unchanged.
4. **Scope belongs to the handoff.** I used the review's shorter option: the imports clause directly qualifies the agreement about which files may change. A setting that breaks imported old code may enlarge the job. No new imported-helper scene or extra fence is introduced. The first paragraph opens with “Don't leave a blank where the decision belongs” and is 74 words, down from 75. The full Principle is 146 words, up from 137 because the type-assertion and predicate distinction is now explicit.
5. **Every appended case has a reason.** Idan keeps numeric zero to catch a repair that rejects all falsy amounts. Dima requires failure results for malformed JSON, null and a missing id, and rejects fractional cents because refunds use whole cents. Chen notices their two-case bargain has grown; Dima answers with the zero-cent incident. The same five test groups remain.
6. **The motivating input fails first.** The text loop is now `["", "100"]`, and each assertion names its input. The returned coercing implementation's failing run reports `cents: ""` with an actual successful zero-cent refund. The check asserts that message and actual value, not merely a red test name. Independent runtime calls still exercise both string values because the failing loop stops at its first assertion.
7. **Narration and lectures are shorter.** The first compiler command moves to its first run. Dima explains the combined check command; the narrator's configuration explanation is cut. The overload link moves into Idan's line, with no rollout disclaimer. The Verdict's repeated moral becomes only Dima's final run and its result. Eli's proposal and conflict lines are shorter and spoken; Idan asks for inputs whose expected answers the owner can explain.
8. **State and small fixes are explicit.** TS2322 points to `return`, and the checker asserts column 3. Idan notices that the typeof check cannot fail after Number, which motivates her alternate line. Chen credits Dima with running the check. The final request is saved for the next regeneration; it does not claim a new response. The replacement spoiler, ambiguous “She,” scrolling sentence, punctuation reference and “annexes the afternoon” are fixed.

No review item was declined. The selected parser, contract, configuration, initial two tests and three request texts are unchanged. Only the final tests fence changes: the input order and assertion message. The revision keeps the original Turn and local Verdict.

## Principle-only self-test

- **Both answers pass:** the rule now explicitly requires putting the owner's decision into examples before asking, and recording a newly exposed distinction before handing work back.
- **A shortcut to green:** `as` and `!` do not inspect data; a predicate without a real check does not establish its claim either. This does not reject an `asserts` function whose body actually checks. Code without those shortcuts still needs behavior checks.
- **An existing contract and tests:** reuse is explicit. No new schema or ceremonial rewrite is required.
- **Only the generated directory:** the scope sentence now links imported source to the permitted file changes. A stricter setting affecting old files changes the size of the requested job, rather than silently authorizing those edits. The existing import-scope control still reproduces the technical limit.

These are self-tests. The upcoming isolated reader should judge whether the shortened first paragraph now sounds spoken and whether the explicit terminology resolves the two inferences in draft 1.

## Voice and remaining editorial risks

The four-person cast, assistant artifacts, actual callers and retellable Turn remain intact. The owner's reason takes one spoken turn; there is no new debate over whether coercion is universally good. The five test groups now follow named decisions rather than arriving as an unmotivated block. The final request is deliberately a saved handoff, not a third observed assistant implementation or a prompt-effectiveness experiment.

The Principle still carries several requirements, and the complete configuration still occupies space. Both are needed for the method, but a fresh reader should judge their pacing. I chose not to add an imports subplot, extra coercions, a loose-throws lesson or a separate-project design. Those would enlarge a local revision and trespass on material the review kept out.

## Validation and freeze

The targeted checker passed on TypeScript 7.0.2 and Node 22.23.4: **11 fences / 32 compiler cases / 16 runtime groups / 1 file-list query / 25 ownership verifications**. Counts are unchanged because the stronger assertions inspect the existing failing run and compiler diagnostics.

The text-test failure is asserted three ways: the extracted input order starts with the empty string; the emitted assertion message names that input and not the second one; the TAP error's actual value is `{ ok: true, value: { id: "r1", cents: 0 } }`. The selected strict implementation restores five passing tests. The always-reject and lying-predicate controls remain separate, each followed by a restored-green run. Both candidates still run against the same owned files, and only the owner-authored test file changes at the Turn.

The initial reset diagnostics now include a column expectation, locating the error at the return statement. The final request's saved-regeneration purpose is checked without inventing a response or outcome. All prior dependency, declaration-scope, imported-source, runtime-selection and ownership controls remain. The existing locked npm installation is used; no new clean-export claim is made.

`npm run check` completed with exit 0: **464 fences / 806 compiler cases / 324 runtime groups**, plus two compiler-default cases, two searches and nine file-list queries. The full run repeated all Bonus 1 results, including the empty-string assertion details. Manuscript, validator, runner and shared compiler profile hashes were recorded before execution and verified unchanged afterwards.

The frozen manuscript has **2,305 words** and 11 fences. SHA-256: `6bd647dd799983254d25bcc3e63fb698cd9ef3ad45af4a30e6d3c09a507a4dae`. The snapshot records the changed fence (ordinal 11 only), per-fence hashes, final owned-file hashes, input order, actual and expected failing values, and full-run evidence. No new model response, imported-helper beat or clean-export result is claimed.
