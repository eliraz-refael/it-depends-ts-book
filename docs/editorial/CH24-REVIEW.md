# Chapter 24 — draft 1 self-review

Status: **DRAFT 1 FROZEN; INDEPENDENT READERS AND FORMAL REVIEW PENDING**. 2026-10-27.

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
