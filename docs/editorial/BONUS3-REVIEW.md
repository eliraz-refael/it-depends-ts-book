# Bonus 3 — draft 3 self-review

Status: **JOINTLY APPROVED**, 2026-11-02, after [Claude's final diff review](bonus3/CLAUDE-REVIEW-2.md#final-diff-review-2026-11-02), which made a prose-only edit (two Principle sentences and the flag scene's order), and both full reads of the final text (Codex: "Approved as is"). Final text: SHA-256 `cd6f1e2f20ff29cc6e27187fa7f34d7415fae1c2b95a7a186520e4266ab223ba`, 2,378 words, 10 fences, with the fence extract byte-identical to draft 3. The self-review below is Codex's record of draft 3.

Manuscript: [What Did the Fix Fix?](../../book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md).
Review addressed: [Claude's second review](bonus3/CLAUDE-REVIEW-2.md), with the draft 2 Principle reader and targeted recheck, at `14c48af`.
Snapshot: [DRAFT3-SNAPSHOT.json](bonus3/DRAFT3-SNAPSHOT.json). Previous snapshots and delivery records are retained below.

## Response to the ranked findings

1. **The printed project installs its compiler.** package.json now declares typescript 7.0.2 under devDependencies, and the page names npm install. The prior checker had used the repository's compiler directly, so it had not caught this setup omission. The checker now asserts the dependency against the installed version, creates the printed package, gives the temporary project an explicit route to the locked node_modules, and invokes that project's node_modules/.bin/tsc, including a version check. A separate fresh project from the printed original files actually installed the dependency and passed the local compiler and runtime commands. The normal suite does not depend on network access.
2. **Both placements are corrected.** The configuration fences are now at Noam's first tsc run in “Put the old caller back.” The earlier runtime example needs only the short Node version and package module-mode clause. Daniel's order.d.ts observation follows the declaration diff immediately. His “Only status.d.ts changed” statement is verified by the emitted declaration set, and his referenced-type comparison remains checked. The parser follows the new fence order; all eight TypeScript/diff fences and tsconfig.json remain byte-identical.
3. **The flag scene distinguishes two checks and ends on speech.** The annotation satisfies isolatedDeclarations; the assistant's fallback lets the whole project compile. The existing control proves the distinction by restoring the original badge under the same explicit annotation and flag, observing TS2345, and restoring the assistant's fallback. Daniel's explanation and documentation link now precede Oded's “explicitly the wrong contract.” Daniel discards the scratch experiment and answers “Exactly.” The next section starts on the chosen implementation.
4. **The four line fixes are applied.** The table is checked against the same type as the return. Oded names OrderStatus and RefundLevel as the private names, without reopening the export decision. The Principle explicitly asks whether the old caller and the caller in another repository still compile. Its representation sentence states that the type contract is unchanged when the new spelling accepts the same inputs and promises the same results; “needn't” is gone.

No disagreements or deviations from the review. The orphaned-helper clue, private aliases, Additional Takes, runtime test payoff and local Verdict remain. No extra flag exceptions or public-API tutorial was added.

## Full self-read

I read the revised chapter start to finish before the full suite. The same current-case tests still give Oded his first win, the scratch refund scene still identifies the check the patch removed, and as const still gives him his second win. The dependency correction changes setup, not any implementation, call, diagnostic or printed runtime result. The saved assistant artifacts are unchanged. The configuration no longer interrupts the first test exchange, and the referenced declaration is checked where both emitted sets are already on screen.

The chapter is **2,374 words** and **10 fences**. Nine fences retain their draft 2 bodies: all TypeScript, all diffs and the tsconfig. Only package.json changes; the two setup fences move. The Principle's two changes answer the reader's explicit questions without adding another subject. This remains a local revision.

## Validation

Targeted suite: **PASS — 10 fences, 45 compiler cases, 22 runtime groups and one file-list query**, TypeScript 7.0.2 / Node 22.23.4. The setup version query is additional setup evidence, not a compiler case. The existing counts remain unchanged. The printed dependency, project-local CLI route, reordered extraction and sole changed declaration are now asserted. All previous negative and restored-green controls remain.

Fresh setup proof: the package.json, tsconfig.json, original implementation and retained test fences were extracted into `.probe/codex/draft3/bootstrap`, with no node_modules initially. `npm install --no-audit --no-fund` succeeded. `node_modules/.bin/tsc --version` printed `Version 7.0.2`; declaration compilation succeeded; `node check.ts` printed `3 statuses, 3 badges: passed`. Installation and command logs are retained in `.probe/codex/draft3/`. This is a clean chapter-project setup check, not a clean export of the whole book.

Full-suite result: **npm run check: exit 0; 483 fences, 877 compiler cases and 376 runtime groups**, plus two compiler-default cases, two source searches and eleven file-list queries. One full run was required for draft 3. All recorded manuscript, validator, runner, compiler-profile, coverage and status hashes match before and after the run. The snapshot records that evidence and the separate fresh-install proof. No fresh independent-reader pass is claimed.

---

## Draft 2 record (retained)

Status: **DRAFT 2; awaiting the Principle-only follow-up and targeted recheck**, 2026-11-02. This is Codex's self-review, not independent approval.

Manuscript: [What Did the Fix Fix?](../../book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md).
Review addressed: [Claude's draft 1 review](bonus3/CLAUDE-REVIEW.md), including both verbatim reader reports, at `f8da36e`.
Snapshot: [DRAFT2-SNAPSHOT.json](bonus3/DRAFT2-SNAPSHOT.json). The draft 1 snapshot and delivery record are retained.

### Response to the ranked findings

1. **The referenced-type habit is performed.** Daniel says he checked order.d.ts, reports it unchanged, and explains why an identical import line did not settle that question. The checker extracts the named declaration from his line and compares it across the freshly emitted states, alongside both import lines. The existing referenced-alias control still demonstrates a changed dependency behind an identical entry declaration. The hypothetical is gone.
2. **The flag's caller is explicit.** The page says the assistant's fallback. The checker now restores the original assertNever caller under the same isolatedDeclarations configuration and explicit string annotation, asserts TS2345, then restores the assistant's fallback and asserts green. Daniel speaks the simple-inference limitation himself, with the documentation link attached. The flag remains out of the Principle.
3. **The narrator is shorter.** The artifacts are labelled once as saved with this review. Noam posts the question as a comment and the assistant replies; neither artifact is called fixed. Two labelled JSON fences carry package.json and the exact tsconfig.json. The suite parses and uses both, and verifies their options against the book profile. Emit logistics, the adapter's whereabouts and the scratch reset are shortened while retaining the state transitions. Eden now owns the one-line observation about the local alias and unchanged permitted statuses.
4. **The muddled lines are repaired.** The table diagnostic is contrasted with the assistant's fallback printing the typo. Oded asks Noam to put his agreement near the Approve button, without demanding an apology for Oded's own repair. Eden fronts the generics callback and explains what it warned about. His Additional Take says plainly that narrowing can reject a string caller elsewhere while callers here compile.
5. **The Principle gives a procedure and a decision rule.** Emitting declarations appears in the opening action. “Changes a caller to make it compile” includes the default-branch edit. The owner is named as the person who chooses the contract. Paragraph 2 asks which old calls a changed signature rejects and which results it stops guaranteeing, distinguishes representation changes, and explicitly says runtime tests. It retains the compiler's ability to check a promise without choosing the right one. There is no flag-exceptions list or type-test detour.
6. **The optional clue stays small.** Noam observes that assertNever has nothing to assert. Its only remaining occurrence is verified as the declaration; a validation-only noUnusedLocals override produces TS6133, then the book profile is restored and passes. The chapter's project does not enable that flag. No new diagnostic or flag discussion was added to the page.
7. **The Verdict is trimmed.** Oded keeps the swapped-label example. Daniel confirms only that its declaration report would be identical. The general aphorism is cut. The local decision and closing meeting line stay.

No disagreements with the review and no material deviations. The Not adopted items remain out: no noUnusedLocals policy, private-alias accessibility tutorial, extra explanation of satisfies, type-level equality test, or direct-call probe instructions.

### State, voice and Principle self-read

The chapter remains in the same order, with the same source patch, consumer, typo experiments, as-const win and chosen repair. All eight original TypeScript and diff fences are byte-identical to draft 1. Only package.json and tsconfig.json fences are new. The saved assistant summary, question, reply and final rewritten summary are unchanged in content. The draft is **2,349 words**, with **10 fences**: four TypeScript, four unified diffs and two JSON.

I read the revised chapter start to finish. The “refund” scene, the test catching the typo and “I've found a check the patch removed” are unchanged. Oded retains both wins. The configuration now has explicit boundaries and can be skipped as configuration without parsing a long narrative sentence. The flag names which fallback passes; discarding its scratch experiment returns to the chosen source. The copied adapter is set aside before the typo experiments and put back after the repair.

Against the four Principle cases: following referenced types still exposes the derived alias; restoring a caller explicitly covers an edited default; choosing the promised contract remains distinct from satisfying a flag; and checking old calls and promised results covers narrowed parameters and widened returns. Runtime tests are named without the assertNever ambiguity. These are my self-checks, not fresh reader reports. The follow-up reader should judge whether the compatibility questions make paragraph 2 sound more like Daniel and less like qualifications.

### Validation

Targeted suite: **PASS — 10 fences, 45 compiler cases, 22 runtime groups and one file-list query**, TypeScript 7.0.2 / Node 22.23.4. Four compiler cases were added: the unused-helper control and profile restoration, and the flag's original-caller failure and assistant-fallback restoration. All prior declaration, runtime, mutation and restored-green controls remain. The two JSON fences are used directly; no unprinted strictness flags enter the normal story configuration.

Full-suite result: **npm run check: exit 0; 483 fences, 877 compiler cases and 376 runtime groups**, plus two compiler-default cases, two source searches and eleven file-list queries. One full run was required for draft 2. The manuscript, validator, runner, compiler profile and coverage hashes match before and after the run; the snapshot records the log and detailed results. A subsequent PLAN.md wording correction distinguishes the full reader's reproduction from the Principle reader's four-case exercise. No new clean-install export or independent-reader pass is claimed.

---

### Draft 1 record (retained)

Status: **DRAFT 1; awaiting Claude's independent readers and formal review**, 2026-11-02. This is Codex's self-review, not independent approval.

Manuscript: [What Did the Fix Fix?](../../book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md).
Governing settlement: [Bonus 3 plan](BONUS3-PLAN.md#settlement-after-codexs-challenge-2026-11-02), committed at `6167870`.
Challenge: [Codex plan challenge](bonus3/CODEX-PLAN-CHALLENGE.md).
Frozen record: [DRAFT1-SNAPSHOT.json](bonus3/DRAFT1-SNAPSHOT.json).

### What this draft decides

The team accepts the lookup table with an explicit private status contract and a table checked against it. They restore the original exhaustive badge and require a declaration comparison for changes to this shared API, alongside the retained runtime assertions. This is a local Verdict on a refactor that promised the existing API. It is not a policy requiring annotations or isolated declarations throughout the shop.

The new learning is reviewing the provider change and its accompanying caller repair together. The old caller is restored against the new provider before declarations explain the error. Eden brings an unchanged consumer outside the submitted patch. The chapter explicitly acknowledges his Ch6 warning rather than presenting export annotations as a discovery.

### Settlement audit

1. **The title, cast and skeleton are retained.** Daniel states the Principle before the scenario. Noam, Oded and Eden are the other speakers; all use he/him. The chapter has Principle, Debate, Turn, Verdict and Additional Takes sections. Linoy does not appear. The register was calibrated against the full Ch7 text.
2. **The hook has no missing-test excuse.** The initial and submitted versions pass the same three statuses and three badge assertions. The cases and harness are shown and held unchanged. Noam notices the badge hunk immediately. Oded is right about current runtime behavior, and the compiler's new complaint really is about the type.
3. **The assistant is present through fixed artifacts.** The request's purpose, submitted summary, two-file patch, reviewer question and fixed reply are visible. The reply's string inference, unchanged exported annotations and retained current behavior are checked against this artifact. No real assistant is called; there are no frequency, quality, intent or product claims.
4. **The investigation establishes the cause.** Restoring only the old badge gets TS2345. Both declaration sets are then freshly emitted under the same settings, and the printed one-line diff is applied and checked against the complete sets. Order's declaration is unchanged. Eden's same mobile consumer goes green / TS2322 / green across original, submitted and chosen providers.
5. **The Turn is explicitly scratch work.** The submitted table has no typo. Noam introduces refund, the candidate compiles and returns the raw string, and Oded's existing test catches it. The original's equivalent typo produces TS2678 and TS2345. The dialogue distinguishes a removed compiler check from a runtime defect that slipped through the tests. All scratch changes are undone before the next repair.
6. **Oded wins the smaller-repair point.** His as-const hunk restores the original badge and byte-identical declarations, with the same runtime results. The team chooses the longer repair because an external consumer relies on an independently stated status promise and because satisfies reports the typo at its source. Neither choice is portrayed as the only compilable fix. Satisfies alone is retained as an off-page control.
7. **The named aliases stay private.** The final declaration includes the private OrderStatus definition because the exported function refers to it. Its text differs from the original. The chapter says so and claims only the same three permitted statuses, not byte identity. A direct type import is rejected with TS2724. The unchanged mobile consumer does not need a new named type export.
8. **The flag earns one short exchange.** Daniel enables it on the original and gets TS9007, then shows that the submitted patch with an explicit string return passes. Oded supplies “explicitly the wrong contract.” The experiment is discarded. The documentation qualification is narrow; no claim of mandatory annotations on every export or of API stability remains. Trivial inferred exports are tested off-page.
9. **The Verdict decides and closes the review.** It accepts the specified source state, rejects the fallback, requires the before/after type evidence and keeps runtime tests. Oded rewrites the summary and Noam approves the fictional revised patch. The closing meeting joke returns to the opening instead of ending with a process lecture.

No material settlement deviation. Keeping the aliases private and retaining the short flag beat were both explicitly permitted choices. The manuscript is 2,448 words (whitespace count including fences) and uses eight fences, below the ten-fence maximum.

### Self-applied Principle-only cases

These are my answers against the drafted Principle, not reports from fresh readers.

- **An exported derived type loses as const.** Compare the generated declarations and follow the referenced value. An unchanged alias line does not establish an unchanged type. The off-page control records the tuple becoming string[] and its derived Reason widening.
- **The provider and caller are repaired together.** Put back the old caller, find the cause of the error, and decide whether to preserve or intentionally change that contract. Current examples passing do not decide compatibility for the old caller. This is the chapter's main sequence.
- **A compiler flag stays green.** A flag accepting an explicit string return does not establish that string is the intended promise. The body-only trivial-export control also changes the public type while isolated declarations remains green. The Principle says the compiler checks a promise without choosing it; the scene supplies the concrete flag limitation.
- **A parameter narrows while local calls pass.** Account for callers outside the patch. The external string caller is rejected in the control even while the local paid literal compiles. Separately, declaration identity does not establish behavior: swapping two valid labels leaves declarations unchanged and fails the original assertions.

Potential reader pressure point: the Principle deliberately avoids a catalogue of flag exceptions. The fresh reader should be able to reject “the flag passed, therefore compatible” from the distinction between checking a stated promise and choosing one. If not, fix that sentence rather than expand the Principle into a configuration guide.

### Voice and state review

I read the whole draft after its first targeted pass. The intended retelling is: a refactor with all its current tests passing also repaired the caller that would have exposed its changed return; the reviewer puts that caller back. The typo demonstrates the cost of the repair, and Oded correctly points out that his test still catches it. His “two words” also wins without qualification before Eden makes the local case for a separately stated contract.

The read caught “stays in a helper,” although the original has no helper; it now says the comparisons can live in one. I also made the declaration generation account match the check: clear the output directory before each emit and retain both results. The checker explicitly re-emits those two states at the report step. The original caller, submitted caller, copied adapter, scratch states and final state all have visible transitions. The flag experiment returns to the original project rather than accidentally keeping the copied adapter, which would independently reject the candidate's string return.

The technical setup is one paragraph followed by small file bundles. The source patch is shown as a real unified diff, not a rewritten file with a claim about what changed. No narrator explains the Turn before the characters run it. The middle still has substantial code and diagnostics; the fresh full reader should judge whether the helper/table diff plus retained test harness earns that space. The flag exchange is the first optional cut if it interrupts the finish.

### Validation

The chapter check extracts all eight fences: four TypeScript bundles/fragments and four unified diffs. It applies source and declaration hunks with range, context and removal verification. It uses one evolving ESM repository on the book profile plus the printed declaration settings, hashes the three owned files throughout, and clears emit output before every compiler case. Every quoted diagnostic is asserted at its extracted source location and against its full quoted primary message. The fixed artifacts and rewritten summary are extracted and recorded too.

Targeted result: **8 fences, 41 compiler cases, 22 runtime groups, one file-list query; PASS**, TypeScript 7.0.2, Node 22.23.4. The controls include the unchanged consumer, failed and restored typo tests, as-const and satisfies-only declaration identity, private-alias import rejection, isolated-declaration counterexamples, referenced and derived type changes, narrowed parameters, and unchanged declarations with wrong behavior. Final source equality and file membership establish that temporary controls were removed and the chosen state restored.

The first targeted attempt failed because I expected TS2459 for importing the private alias; the installed compiler reports TS2724 and suggests orderStatus. That validation-only expectation was corrected from the actual output. No manuscript diagnostic changed to accommodate it.

Full-suite result: **npm run check: exit 0; 481 fences, 873 compiler cases and 376 runtime groups**, plus two compiler-default cases, two source searches and eleven file-list queries. The final run is recorded in `.probe/codex/draft1/full-check.log`; manuscript, validator, runner, compiler profile and updated coverage/status source hashes match before and after the run. Two earlier full runs also passed: one before the full-read wording corrections and the two added declaration-report compilations, and one before shortening unchanged context in a printed diff hunk to avoid a trailing-space-only line. That formatting edit applies the identical source patch. Their logs are retained separately; the final snapshot records all three runs and the final source hashes. No fresh npm-ci export or independent-reader pass is claimed at this stage.
