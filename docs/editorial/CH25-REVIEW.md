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
