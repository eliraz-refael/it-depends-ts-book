# Chapter 25 — draft 2 self-review

Status: **DRAFT 2 FROZEN; TARGETED RECHECK PENDING**, 2026-10-28.

Manuscript: [The Other Money](../../book/04-the-real-world/02-monorepo-type-sharing.md).
Review addressed: [Claude's draft 1 review](ch25/CLAUDE-REVIEW.md), with the two verbatim reader reports committed at `ca3c2df`.
Snapshot: [DRAFT2-SNAPSHOT.json](ch25/DRAFT2-SNAPSHOT.json).

## Response to the review

1. **Four state gaps — accepted and fixed.** The page now states that the repository root, as well as all three packages, has type:module. The validator extracts that setting from the page instead of silently choosing it. A regression removes it, verifies compiler acceptance and reproduces the opening SyntaxError. The stale -p and reference-free -b checks both run before adding references. Dima adds the graph to the actual repository, rebuilds, sees the missing argument, and rebuilds the corrected call. The image repair explicitly removes package and API outputs plus incremental metadata before building and copying. The validator preserves the earlier source-copy output until this cleanup, then asserts its absence from the image.
2. **The second half and Turn — accepted.** The release copy step is planted before the working example. Linoy proposes source for both type checking and runtime to address the chapter's two demonstrated problems. Her source dev check works, and her raw-source runtime wins through the workspace links before the copied image refuses it. Gilad asks which file the image loads. The narrative uses one evolving working tree, one fresh-checkout demonstration and one reversible experimental branch. The branch changes files in place in the validator; returning restores those files while retaining the current formatter and real reference graph.
3. **Stale-default Turn — cut.** I did not retain the emitting-config experiment. The earlier stale-declaration check earns the build graph without making someone run a configuration solely to stage a second stale result. The linked-versus-copied deployment supplies the actual surprise. The old “new signature / old answer” line goes with the removed scene, despite its good wording.
4. **Fairness and ownership — accepted.** Idan now owns the “only the spelling” assertion experiment. Linoy keeps her successful source check and loses only the runtime target for this image. Adding a loader gets a short hearing; Dima declines changing the image's loading setup when its existing JavaScript build already works. No particular loader or library is claimed to have been tested. Dima owns the references and check command, rather than mediating away the stale result.
5. **Gil's count / Gilad's role — accepted.** Two existing structural imports, for order lines and packing slips, are present in the initial program. Alongside the parser import, they give Gil three paths to repair but only one failing call. Line's assignment remains valid. The suite pins that census, the two emitted Money implementations, the surviving stale output after ordinary rebuilds, and the one implementation actually copied after cleanup. Gilad reads the executing frame and insists that the report retain the image path; he no longer only supplies questions.
6. **Principle — accepted.** It explicitly includes supported public subpaths, names type or function instead of helper, makes dependency knowledge part of the build rule, and defines the relevant build as what is packaged and deployed. The ambiguous closer is gone. The three questions, “before you assert them equal” and the green-check line remain. Gilad's final sentence concerns getting the failure on the laptop rather than a future wake-up, without teaching the Node restriction early.
7. **Pacing and line fixes — applied.** The dev config extender is inline JSON, leaving one fewer fence. The fresh-checkout result is shown once and claimed once. The undefined/NonNullable explanation is tied to Idan's assertion, the stamp gets its reason in her answer, and currency wording is hers rather than a narrator disclaimer. Removed the unprompted parse-twice defense, scratch-file deletion, old graph-copy bookkeeping, ambiguous pre-parameter reply and repeated pre-Verdict agreement. The raw-source branch enables allowImportingTsExtensions for its noEmit check and uses the already-emitted API, so it makes no false release-build claim. The public parser repair now explicitly rebuilds the API as well as its dependencies. The Verdict assigns the release gate, dev command and import change to three speakers.

## Self-review and remaining reading risks

The local Verdict remains the agreed combination. Source-reading development and built release are compatible; the image's loader behavior limits only the attempted runtime shortcut. A public subpath is still a supported repair. Structural compatibility is not counted as a bug or as evidence of one declaration. The assertions remain a laptop hypothesis test, never the accepted repair.

**Provisional self-assessment:** character consistency, technical accuracy in the stated fixtures, fairness, code quality and overall flow pass my own review. Fun is improved by the continued argument over avoiding dist, Idan's complaint about the missing argument and the unchanged fifteen dollars, and Gilad's expectation that someone will fail to reproduce the incident from a checkout. These are not fresh-reader results. Claude owns the next Principle-only read and targeted recheck.

The dense section is still references → source condition → shared config. It is shorter and follows competing wants, but the recheck should say whether it still feels like a setup manual. The return from the raw-source branch and clean image build has necessary state narration; ask whether the reader can follow it without mentally retaining extra repositories. The short loader alternative is an owned local decision, not proof that built JavaScript is the universal choice.

The revised draft is **2259 whitespace-delimited words**, below draft 1's 2,440 and the original 2,400-word lower target after the requested cuts. I left the tighter story intact rather than replace the repeated dev-check assurances with filler. There are **13 fences: 8 TypeScript and 5 JSON**, plus the extracted inline dev extender and root module setting.

No version-skew scene, timing claim, new Take or network-boundary guarantee was added. Ch16's deferred schema-sharing/version-skew topic remains outside this chapter's scope. The plan settlement is unchanged.

## Principle-only self-test (not an isolated read)

- **Public export / subpath:** use a supported export; a deliberate parse subpath is explicitly allowed, rather than condemned as another spelling. A structural assignment by itself does not answer which declaration or implementation was selected.
- **Same-named nominal types:** inspect the declarations before asserting equality. The rule does not predict a native private-slot crash for every unique-symbol brand.
- **Executable artifact:** run the packaged build. A linked run does not establish the copied image; the general instruction is on the page before the Node-specific reason is shown. Development may still read source directly.
- **Freshness:** a green check of the old declaration is not evidence about a new incompatible caller. The build must know its dependencies; merely changing a command without giving it that knowledge does not satisfy the rule. The concrete -p/-b distinction is taught in the debate.

## Validation and freeze

Manuscript SHA-256: `ac37182be7a111e3a6b9ee3a791ed7a3a612fe4a235363fb33330f99839ba770`.
Validator SHA-256: `1c3e9a3eedb439830fef7c7623a402308ef67c5f26c7cf6f885035c561f05b84`.

- Targeted `node checks/chapter25.cjs`: **exit 0**, 13 fences / 29 compiler cases / 15 runtime groups plus two file-list queries, before the final self-review edits and added copied-image count assertion. The final full run below covers those changes.
- `npm run check`: **exit 0 on the exact frozen manuscript and validator**, TypeScript **7.0.2**, Node **22.23.4**. Chapter 25: **13 / 29 / 15**, plus two file-list queries. Book: **426 fences / 593 compiler cases / 284 runtime groups**, plus two default cases and two existing source searches.
- Used the same locked installation installed with npm ci --offline during the challenge. No new clean-export install claim. The fresh-checkout example is a compiler-fixture state, not an npm install test.
- Final full-suite log: untracked `.probe/ch25-draft2-final-full-check.log`; hash recorded in the snapshot. The earlier targeted and full logs remain untracked. Review and reader files from `ca3c2df` are unchanged.

The validator's narrative sequence is one repository. Counterfactual controls have separately named repositories and do not establish the narrative's freshness claims. The only fresh-checkout demonstration copies inputs alone; no output or incremental metadata can acquire misleading timestamps. The public subpath, alias, public-field, TS-private, same-declaration and implicit-root controls remain. All printed outputs and errors are pinned. Package manifests accompany the API and dependencies in both image layouts. There is no actual container runtime or third-party loader in the fixture: it executes Node against the image's filesystem layout.

**Ready for the requested Principle-only read and targeted recheck. Local commit only; no push.**

---

## Historical draft 1 record

The following assessment describes draft 1 and is superseded by the revision above. Its pending-review status was resolved by the findings in `ca3c2df`; its original fixtures did not expose the root-manifest omission or the narrative state gaps.

# Chapter 25 — draft 1 self-review

Status: **DRAFT 1 FROZEN; INDEPENDENT REVIEW PENDING**, 2026-10-27.

Manuscript: [The Other Money](../../book/04-the-real-world/02-monorepo-type-sharing.md).
Settlement: `c6867ba`, with the master-plan update at `da6c0e2`; [settled plan](CH25-PLAN.md#settlement-after-codexs-challenge-2026-10-27).
Snapshot: [DRAFT1-SNAPSHOT.json](ch25/DRAFT1-SNAPSHOT.json).

## The argument and its limits

The local Verdict combines three working repairs: expose the existing parser publicly; keep Linoy's noEmit development check, with both packages offering a source condition through a shared base; make the existing release check build the explicit project-reference graph and execute the copied program. It does not choose one resolution mode for every program or equate import spelling with identity.

Idan's parser produces the Money it promises. The error names its source declaration and cart's built declaration. The double assertion is Linoy's laptop test of a specific hypothesis, not a proposed production repair. The native private-field failure refutes that hypothesis. Gilad asks where it failed; the stack names only the executing copy, and Gil locates the other implementation separately. The structural Line assignment is valid. The public subpath alternative also works and is kept on the page.

The Turn uses the stale-default control. The source check catches the old call without needing any build output. After Idan fixes the call, it correctly passes. A separate emitting experiment still runs the old default implementation, which ignores the new argument. Dima's dependency build supplies the new implementation. Linoy retains her successful check and explicitly resists removing it. Her linked-source runtime proposal also gets its success before the copied-dependency failure restricts it to this deployment.

Ch16's deferred schema-sharing/version-skew topic is **not discharged**. This chapter covers in-process declarations, implementations and build freshness. It does not imply that sharing source types removes parsing at a network boundary. No extra Take, version-skew story, timing claim, package-manager prescription or universal source-versus-built ruling was added.

## Self-review against the guide

These scores are the author's assessment, not independent approval. Claude owns the fresh Principle-only and full-reader reviews.

| Category | Assessment | Evidence / remaining risk |
| --- | --- | --- |
| Character consistency | PASS provisionally | Idan protects the parser's produced value; Dima owns the release command and reference graph; Linoy's live check survives; Gil reproduces file and output evidence; Gilad asks operational questions rather than deciding the configuration. Idan and Linoy use she. |
| Technical accuracy | PASS on the stated fixtures | All fourteen fences are extracted; printed diagnostics, both amounts, source/default distinction, clean builds and copied deployment are exercised on TS 7.0.2 / Node 22.23.4. The control cases restrict overbroad identity claims. |
| Fun factor | PASS provisionally | The retellable scene is a valid parsed Money failing to add another Money, followed by the assertion making the compiler quiet while the runtime complains. The old formatter answering the new call is the second surprise. Configuration density remains the main reader risk. |
| Alignment / fairness | PASS provisionally | Both the source check and build graph keep their wins. The release command absorbs orchestration; graph maintenance is Dima's actual cost. A public subpath is explicitly accepted. The ending is local, without a manufactured dissent. |
| Code quality | PASS within scope | Labelled files, real manifests, actual symlinks and compiler outputs. The existing generated stamp explains rootDir before the bypass. The money code is a small quotation example, not a complete currency library. |
| Readability and flow | PASS provisionally | Purpose and expected total precede the mismatch. Changes to methods/imports are labelled. The graph experiment runs in a copy; the stale Turn returns to the original output. Independent comprehension remains untested. |

Calibration: reread Chapter 7's opening and its competing-signature exchanges, plus the bios, character-voice notes, writing guide and review guide. I removed the slogan-shaped last line, corrected a speaker claiming someone else's formatter edit, and kept ordinary replies alongside the memorable hook. No dialogue semicolon cadence, invented catchphrase quota, narrator scoring or conclusion table.

## Where a reader might get bored or lost

1. **The initial repository setup.** The first manifest, multi-file example and API config precede the actual diagnostic. Each is necessary to reproduce the two routes, but the first reader should say whether the amount/parser question survives that setup. The release tag already appears in the working example and has a support purpose.
2. **References followed by conditions.** This is the densest part. Dima's graph fixes release freshness; Linoy wants to check an edit without building. Her public source branch is compared with Idan's filesystem bypass, rather than introduced as another flag to learn. Ask whether the reader can name what each command promises without rereading the configs.
3. **The deliberately stale Turn.** A failed experiment in one copy must not look like a failure of the corrected release command. The text names the graph test copy, original old outputs and separate emitting experiment. The validator reproduces those states independently. If a first reader misses that distinction, fix the scene rather than add a caution after the result.
4. **The late raw-source experiment.** It earns the deployment constraint, but may feel like a second Turn. It has no extra fence or loader tutorial. Ask whether it changes the proposed runtime fairly or merely delays the already-earned combination.
5. **Repeated ownership lines near the end.** Gilad asks which check permits shipping before Dima gives the Verdict. That makes the release gate concrete, but may repeat too much of the ruling. It is the first prose to trim if the reader finds the ending over-explained.

## Principle-only self-test (not an isolated reader)

- **(a) Public contract / structural Line:** a compatible assignment alone does not establish which declarations were checked or which implementation will run. Use a public export. A supported parse subpath that reuses the declaration is not forbidden merely because its spelling differs.
- **(b) Same-named nominal types:** inspect the declarations and resolution before asserting. The Principle does not predict a native private-field failure for every unique-symbol numeric brand; the mechanism matters.
- **(c) Linked source versus copied deployment:** the local run does not answer what the shipped artifact will load. Execute that artifact. Source-reading development remains valid when the release builds and runs JavaScript.
- **(d) Stale declarations and an absent graph edge:** checking an old declaration cannot validate an incompatible new call. The release must actually build its dependencies; changing a command name without arranging those dependencies does not satisfy the rule. The exact -b/reference mechanism is taught in the scene, not catalogued in the Principle.

These are my expected applications. Do not give this record or the intended ending to the fresh readers.

## Validation and provenance

Frozen manuscript: **2440 whitespace-delimited words; 14 fences (8 TypeScript, 6 JSON)**.
Manuscript SHA-256: `55addc78b24b8b442ad51d519c6ce589bf404b916683feb3a2c06157cba9f505`.
Validator SHA-256: `2db7568b1053b1e224254ef6ef3933a651f377cc719357878e3f925d6114135f`.

- `node checks/chapter25.cjs`: exit 0 before the final prose-only self-review edits; all fourteen fences and the validator are byte-identical to the full run below.
- `npm run check`: **exit 0 on the exact frozen manuscript and validator**, TypeScript **7.0.2**, Node **22.23.4**. Chapter 25: **14 fences / 31 compiler cases / 16 runtime groups**, plus **two file-list queries**. Book: **427 fences / 595 compiler cases / 285 runtime groups**, plus the existing two default cases and two source searches.
- `npm ci --offline` succeeded during the challenge in this worktree (14 locked packages), as recorded in the challenge. This draft uses that installation. No new clean-export installation claim; that remains part of final review.
- Full log: untracked `.probe/ch25-draft1-full-check.log`. Its hash is in the snapshot. Each validator run leaves a unique temporary fixture directory with command/status/stdout/stderr records for inspection.

The validator splits the printed multi-file fences, applies the labelled method/statement/import replacements and generates the narrated package configs. It keeps the book profile and the printed noEmitOnError:true setting; no prose exit code is left without a configuration. The two quoted compiler diagnostics are checked at their call/import locations, and printed message fragments are matched. Error cases expect the exact diagnostic-code set. Builds used to prepare packages count as compiler cases; file-list queries are reported separately.

Clean source checks remove outputs **and** incremental metadata. Stale and refreshed runtime cases have separate state transitions. The linked-source alternative changes relative .js imports to .ts, runs the emitted API against the actual linked source packages, then copies the source dependencies into node_modules. The final deploy fixture contains built dependencies and no package source directories. The unprinted same-declaration/different-spellings control runs its source entry at the original relative location using Node's stripping; it does not pretend a relocated relative import stays correct after emit. Other controls exercise public fields, TS-private versus native #private, a paths alias that unifies types but not runtime copies, and the independent TS5011 without the existing rootDir.

Scope limits: no package-manager install/link algorithm, real HTTP handler, bundler, distributed deployment, production money arithmetic policy, timing measurement or wire-version simulation. The fixtures verify the miniature repository stated on the page.

Primary references checked for this pass: [project references and build orchestration](https://www.typescriptlang.org/docs/handbook/project-references.html), [custom resolution conditions](https://www.typescriptlang.org/tsconfig/customConditions.html), and [Node 22 TypeScript loading](https://nodejs.org/docs/latest-v22.x/api/typescript.html). The version-specific errors and outputs come from the pinned executable cases.

**Ready for Claude's independent readers and formal review. No push.**
