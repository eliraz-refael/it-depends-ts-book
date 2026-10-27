# Chapter 24 — draft 2 self-review

Status: **DRAFT 2 FROZEN; TARGETED RECHECK PENDING**. 2026-10-27.

Manuscript: [Both Tests Were Green](../../book/04-the-real-world/01-migration-strategies.md).
Review: [Claude's draft-1 findings](ch24/CLAUDE-REVIEW.md), committed at `30fa282`.
Snapshot: [DRAFT2-SNAPSHOT.json](ch24/DRAFT2-SNAPSHOT.json).

## Response to the review

1. **The Turn's fairness — accepted.** The old draft applied an opt-out that Noam's own rule prohibited. The route now stays checked. The catalogue team's sitemap was already opted out for unrelated footer work when the conversion began, and Eden names that ownership before the experiment. Chen explicitly asks for the broken export in scratch. TS2349 catches the route; no diagnostic comes from the sitemap. Both calls fail. The additional `.default` repair gives the strongest counterargument its result: fix the checked route, get a green compiler, still break the legacy caller. Restoring export-equals fixes both. Noam keeps his default, without accepting the misuse of it.
2. **The census — accepted; validation gap fixed.** Draft 1 omitted money from the early fixture states even though the story placed it in src already. All established files now exist in every migration state, including money, its label, the already-opted-out sitemap and the independent backfill. The global census really is five TS7006 diagnostics plus TS2349 for the broken export. After the compatible export, five remain. Oded adds the cents JSDoc before later green runs. The backfill is physically present but outside the printed roots until the inclusion repair.
3. **The numeric probe — accepted.** It now asks one question: does a TS caller receive a string requirement? The call is accepted while the unannotated JS definition still errors. JSDoc gives TS2345 without converting the route. Removed the implied second production defect, runtime digression, previous-build narration and muddy exchange about a green typed caller. The numeric runtime failure remains only as a validator regression.
4. **Principle — accepted, with the factual narrowing already agreed in discovery.** It names implementation and callers, gives a concrete require/import example, connects missing caller checks to missing compiler evidence, and names program-wide noImplicitAny relaxation. Daniel says the compiler can emit without checking the call; he does not say it never reads the file, since it still infers from JavaScript. Two paragraphs; no opt-out or backfill prediction.
5. **Oded's repair — accepted.** Oded proposes export-equals himself after Eden's working `.default` alternative. He chooses to preserve the callers instead of asking an expert to supply the syntax.
6. **Repetition and Verdict — accepted.** Cut the repeated leaf-first aphorisms, scope assurances and opt-out maxims. The Verdict merges the compatible export, both tests, annotated route and cents parameter; puts the backfill in the check/build; assigns Eden the exception list; leaves the sitemap with its existing owner and money's conversion to its own PR.
7. **Line fixes — applied.** 500s, Eden's build setup, a lighter backfill plant, one emitted-module explanation, plain PR wording, test-relative import-equals path, opening the parameter errors, no unsolicited strict:false rebuttal, resolved dangling references and no dialogue semicolons. The failed scratch check emits with exit **2**, which the validator pins; no green-build claim covers that run.

## Self-review of the revised scenes

- **Principle:** my own application gives the expected answers for named-member migration, a callable module becoming a default export, JS checking under TS7's strict default and an independent caller outside the run. This is a self-test, not an isolated reader. Claude owns the fresh Principle-only read.
- **Argument:** Noam gets a detected break and his preferred default. Eden's limit survives a competent `.default` repair, not a deliberate violation of Noam's policy. The legacy caller can keep working without its unrelated footer migration being pulled into this PR. Global checking and caller review solve different parts of the same incident.
- **Voice:** Oded still wants his small PR back, proposes its compatible implementation and retains the old test. Noam makes exceptions visible. Eden assigns actual ownership. Chen tests a claim with an existing caller. Daniel explains the compiler without deciding the rollout. All five retain their established pronouns.
- **Fun:** the opening and the discovery that Oded converted his test out of catching the conversion remain. The new scratch experiment is short enough to follow without a second printed route definition. The numeric diversion no longer interrupts it with another runtime failure.
- **Remaining reading risks:** the first build/test arrangement still asks for careful reading; the exception-list discussion is the longest policy exchange; backfill and computed require still qualify the late part of the story. The targeted recheck should judge whether the shorter numeric beat and concrete sitemap make the Turn easier to follow. I have not commissioned another reader.
- **Length:** 2154 whitespace-delimited words, down from 2306. This is below the original 2300-word drafting target after the requested cuts, within the writing guide's 2000–4000 range. I left the shorter story intact rather than restore repetition to reach the planning target.

## Validation and freeze

Manuscript SHA-256: `1405bfd28b28e1abdb0b0abef0d0e4695137f0a5f0d3b216de9088001859aef0`.
Validator SHA-256: `aa597c4c8dc29b3059d25242ee1b7f7bf2cb7fe9194b2e6f231034dda9424d56`.

- `node checks/chapter24.cjs`: exit 0, **12 fences / 27 compiler cases / 14 runtime groups**; final repository-state addition covered by the full run.
- `npm run check`: **exit 0** on the exact frozen manuscript and validator, TS **7.0.2** / Node **v22.23.4**. Whole book: **413 fences / 560 compiler cases / 268 runtime groups**, plus two default cases and two searches.
- All 12 fences are extracted. The old opted-out route fence is replaced by sitemap; the unchanged money fence moves before the census. No other existing fence content changes. The suite checks full repository states, the failed-check emit, both broken callers, the footer never being reached, `.default` fixing only the route, and the compatible export repairing both. It verifies the old/new loading tests separately from compiler success.
- Used the supplied installed dependencies. No fresh-install claim; final clean-install review remains pending.
- Full run log: untracked `.probe/ch24-draft2-full-check.log`; its hash is in the snapshot. Review records from `30fa282` are unchanged. No push.

**Ready for Claude's targeted recheck.** The original self-review is retained below as history, including the now-corrected claims.

---

# Historical draft 1 self-review

Historical status: draft 1 was reviewed at `30fa282`. The assessment and counts below describe that earlier snapshot; the draft 2 record above supersedes them.

Manuscript: [Both Tests Were Green](../../book/04-the-real-world/01-migration-strategies.md).
Settlement: `5c53b4e`, [plan](CH24-PLAN.md#settlement-after-codexs-challenge-2026-10-27).
Snapshot: [DRAFT1-SNAPSHOT.json](ch24/DRAFT1-SNAPSHOT.json).

## What the draft argues

The local Verdict combines the repairs rather than treating them as rival philosophies: preserve the callable export, retain the old loading test, annotate the JavaScript caller, and keep global checkJs with strictness and explicit, owned exceptions. Converting a leaf still makes sense. It does not remove the obligations to unchanged callers.

The opt-out is the Turn. Chen restores the failed conversion and opts out its original caller; the compiler goes green, but the old runtime test still fails. Noam keeps his default. Eden's caller-review requirement survives inside it. Neither has to pretend the other's repair failed at its actual job.

The backfill is introduced with the repository, then gets a small executable example and inclusion repair. Computed require receives one qualification. The final named-export example tests whether the team has overgeneralized export-equals into a syntax rule. There is no new framework, declaration-file lie, interop-option detour, type-test tutorial or suppression Take.

## A necessary setup detail

The old JavaScript test runs directly against the built output and is not a compiler root. The converted TypeScript test is compiled with the source. This is visible in the printed include patterns before either example. Restoring the old test therefore adds runtime evidence without making the Turn's compiler exit-zero claim false. Its failing runtime check remains visible in the Turn: the story does not claim the whole test pipeline became green.

Had both tests been type-checked under global checkJs, the restored old require call would itself report TS2349, even with route opted out. That would be a different, valid check configuration. The draft deliberately identifies the actual one rather than silently omitting a diagnostic from the counted program. The validator follows it exactly.

## Self-review against the guide (author assessment)

- **Principle:** two short paragraphs state the contract rule and included-versus-checked distinction. Daniel names loads/passes/receives rather than relying on “shape.” Strict-default and scope clauses support the rollout reader case. No opt-out or backfill appears in the Principle. The final reader must judge whether the last sentence is too managerial for Daniel.
- **Fairness:** Oded's unchanged loading test works; it is not dismissed as mere convention. Noam gets global checking with explicit exceptions, without a fabricated effort estimate. Eden types a caller without converting it. Sum's string and numeric uses give deferral a reason without requiring a fabricated large backlog. Chen's cases have repairs.
- **Voices:** Oded wants his small PR back and restores the old test himself. Noam wants newly introduced source checked by default and visible exceptions. Eden assigns rollout work and preserves contracts when a caller cannot migrate. Daniel supplies mechanisms without choosing who owns the backlog. Chen tests the checking claim with the actual opt-out and backfill. All five use he.
- **Technical accuracy:** all displayed programs, outputs and quoted diagnostics are checked. The global run still reports the untyped route when the TS caller accepts 42; the text explicitly runs against the last built route. It does not claim that a successful new emit occurred despite the diagnostic. The inference and annotation stages are separate compiler cases.
- **Fun and flow:** the intended scene to retell is Oded discovering he converted the test out of catching his conversion. The story then gives him a usable fix and a bounded next PR. No narrator scores a concession. No catchphrase, mediator or invented deadline was added.
- **Scope:** output-module contract, body checking, caller constraints and entry-point coverage stay within migration. The named price member is a second leaf in the same repository, not a second domain story. No real-world migration prevalence, timing or defect-rate claims.

These are self-assessments, not independent approval.

## Where a reader may get bored or need clarification

1. **The early build setup.** The first configuration, JS-versus-TS test paths and copied script are needed to make the compiler/runtime claims exact, but may slow the hook. Ask whether the reader can say what gets compiled and what gets executed without rereading. If not, simplify the presentation, not the distinction.
2. **The exception-list discussion.** It gives both rollout policies their strongest form. Ask whether the two helpers feel like real deferred contracts or filler used to introduce nocheck. The four errors are parameters, not a count of four proven bugs or an estimate of weeks.
3. **The numeric caller's timeline.** It is accepted at the call site while the global run still complains about the JS definition. A previous build supplies the runtime demonstration. Ask whether that distinction is clear enough on the first read.
4. **The late qualifications.** Backfill, imported-but-excluded, computed require and the next named member may crowd the finish. The opt-out carries the Turn; the rest should feel like short limits and an application, not a checklist. This is the first area to trim if the reader starts skimming.
5. **The title.** It refers to the original test before conversion and the converted test afterwards. Once restored against the changed artifact, the old test fails. Ask whether the title wrongly suggests both loading styles passed against the same broken artifact.

## Principle-only self-test (not an isolated reader)

- **(a) Named money members:** keep the member accesses, arguments and outputs the callers use; a TS filename is not itself a reason to change the export. The scene supplies the concrete named-export contrast.
- **(b) Callable Mailer becoming a default export:** the test using the new import does not establish the old constructor-loading call. Preserve that call or coordinate and verify its users.
- **(c) Global checkJs on TS7:** body checking can expose implicit-any parameters. Identify the scope rather than weakening already-checked TS without acknowledgment. The Principle does not predict a census or prescribe the later opt-out arrangement.
- **(d) Independent backfill outside the roots and dependency graph:** the old caller still has a contract even though this compiler run supplies no evidence about it. Check or execute it, or preserve its interface. The specific include-versus-import mechanics arrive in the scene, not in a Principle checklist.

Claude owns fresh Principle-only readers and the full read. Do not give those readers this response or the intended ending.

## Validation and provenance

Frozen manuscript: **2306 whitespace-delimited words; 12 fences (4 TypeScript, 7 JavaScript, 1 JSON)**.
SHA-256: `20a5238652216cb2bb041fb28b4ef9dd598a4182ad5389483523b90b43c9654e`.

- Final `node checks/chapter24.cjs`: exit 0 on the frozen manuscript and validator, **12 fences / 28 compiler cases / 13 runtime groups**.
- `npm run check`: **exit 0** on TS **7.0.2** / Node **22.23.4**, before a final prose correction naming TypeScript tests alongside src in the compiler roots: Ch24 **12 / 28 / 13**; whole book **413 fences / 561 compiler cases / 267 runtime groups**, plus two default cases and two searches. All twelve fences and the validator are byte-identical to that run; the final targeted run covers the corrected prose. Full-suite manuscript hash: `f4e6709ac7bf4548df3bdcb05b0c7589c90d257c845ac34c51c1f001ebab57e8`.
- The worktree already had dependencies installed, as stated in the brief. This run uses them; no fresh-install claim. The plan's clean-install check remains pending for final review.
- Logs are untracked in `.probe/ch24-draft1-targeted.log`, `.probe/ch24-draft1-final-targeted.log` and `.probe/ch24-draft1-full-check.log`. Discovery probes remain under `.probe/codex/`.

The validator extracts every fence uniquely. Multi-file fences are split by their printed filename labels. The JSON options and include patterns are asserted; compiler runs omit strict to exercise TS7's default, keeping the book's additional validation options. Runtime loading tests execute separately against emitted files exactly as the story describes. Negative cases compare source file, line and code; displayed messages and every printed output are pinned. The opt-out, computed-require, excluded-but-imported and added-backfill cases have their own checks. Named exports are asserted only for the demonstrated member call.

Primary references supporting the mechanism, already consulted during discovery: [checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html), [exclude and imported files](https://www.typescriptlang.org/tsconfig/#exclude), and [Node 22 CommonJS](https://nodejs.org/docs/latest-v22.x/api/modules.html). Version-specific behavior and counts come from the pinned executable fixtures, not a relabelled older handbook example.

**Ready for independent review. No push; no publication approval implied.**
