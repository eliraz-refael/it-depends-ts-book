# PR E self-review — Act IV and the bonus act

Manuscript base: **5da9cbb** (tree identical to a0ba9d8). Plan: **080e3bc**, with the author's Settlement appended in this revision. Branch: `codex/release-act-4`. All seven chapters follow [PR-E-PLAN.md](PR-E-PLAN.md); no earlier chapter, dependency or compiler profile changes. No push.

## Changes and settlement audit

| Chapter | Change and retained argument |
|---|---|
| 24 | Daniel's opening states the unchanged-caller requirement without revealing exports or compiler membership. Noam reads the diagnostics; Daniel explains omitted strictness when it matters. Exception bookkeeping is shorter. Eden's phrase directly answers Noam's discovery that the sitemap's old opt-out would evade review; his next sentence names the catalogue caller, with no gloss. The ruling precedes the local migration decision. Both checking strategies, the old require test, sitemap, backfill and named-export counterexample remain. |
| 25 | Gilad opens with what he checks on a release, not a question. Dima supplies the shorter module/build setup; source versus dist, composite references and the copied-image failure remain one story. Money/Cart's src roots remain distinct from the API's repository-wide root. Rebuild/reset narration is shorter without dropping metadata or copied manifests. The public-entry/release-layout ruling precedes the two-command decision. |
| 26 | Sahar gives a plain regression-test rule without previewing the five traps or asking what could be removed. The historical states, comparison controls and file-move sequence are shorter. Oded's replacement joke is “If a red build counts as progress, I'm ahead of schedule.” The ruling addresses selection and targeted failure before the runtime-glob experiment. Both final test files, the intermediate file, negative usage, Status's any regression, all resets and the final silence remain. |
| 27 | Daniel frames a controlled cost comparison without announcing the counters/profile or candidate failure. Oded guesses that key enumeration is most of the cost; Gil's exact phrase answers him, and the existing counterfactual table supplies the evidence. All four counterfactual signatures, both generic candidates, caller controls, tables and trace-to-profile correction stay. The ruling precedes Oded's explicit adoption. Noam's title response and Gil's machine-guarantee joke replace repeated approval/keep phrasing. |
| Bonus 1 | Eli's Principle and every fixed request/code artifact stay. Dima returns to his two-tests bargain while asking what remains undecided, rather than anticipating an abstract distinction. The ruling gives ownership of the acceptance contract before the saved next request. All other benchmark scenes stay. |
| Bonus 2 | Liron distinguishes a proposal's description from the executor's permission, without a parable or previewing the closure/currency/outcome repairs. Configuration moves into comments. The generated required lists move beside generation and are explicitly labelled for the initial Refund schema, so later replacements do not make the comments false. The ruling leads the local agreement. The currency, ownership and outcome discoveries, refinement take, positive control and refund reversal remain. |
| Bonus 3 | Daniel's shorter opening separates public-contract comparison from runtime evidence. Daniel's typeof warning joins his referenced-type explanation; Eden's parameter warning joins the external-caller exchange, both as their own dialogue. The flag citation is outside speech and its fact-checked explanation is unchanged. The Verdict is last and leads with the contract decision. Oded's exact meeting line ends the book. |

Read Daniel's **Ch20, Ch24, Ch27 and Bonus 3 Principles consecutively**. Ch20 remains unchanged: an imperative about staged calls, definitions, then the parentheses distinction. Ch24 starts with an invariant for an unchanged caller and ends with the outstanding migration obligation. Ch27 starts with a conditional measurement instruction and ends by distinguishing a cost decision from a contract decision. Bonus 3 starts with Daniel's review practice and ends with the independent need for runtime evidence. These are different opening/closing moves, rather than a repeated question or rule/type-limit/caller/aphorism sequence.

The revised Principle lengths, counting speaker labels, are **84, 83, 59, 86, 147, 72 and 102 words**, respectively. Bonus 1's 147 is unchanged. Gilad has no question mark in his first sentence; Sahar does not reuse the Ch19 removal question. Liron stays conceptual and uses no analogy. This is an editorial assessment, not a property established by compilation.

## Lengths and departures

Whitespace-separated words, including code, headings and labels, measured against 5da9cbb:

| Chapter | Base | Draft | Change | Planned whole-chapter range |
|---|---:|---:|---:|---|
| 24 | 2,134 | 2,018 | −5.4% | No fixed target |
| 25 | 2,248 | 2,035 | −9.5% | 2,050–2,100: 15 below the lower target |
| 26 | 2,544 | 2,305 | −9.4% | 2,310–2,370: 5 below the lower target |
| 27 | 2,381 | 2,215 | −7.0% | 2,210–2,260: within |
| Bonus 1 | 2,143 | 2,176 | +1.5% | Within 5% |
| Bonus 2 | 2,115 | 2,037 | −3.7% | Within 5% |
| Bonus 3 | 2,378 | 2,289 | −3.7% | Within 5% |

Named cut windows below use the plan's **old line numbers**. Counts include retained fences within those spans; the Ch27 decision count excludes its newly added ruling. Moving prose into comments counts toward the new chapter length, not as a deletion.

| Window | Base | Draft | Budget | Assessment |
|---|---:|---:|---:|---|
| Ch25 Principle, 5–7 | 178 | 83 | 85–95 | 2 shorter |
| Ch25 setup, 17–21 | 76 | 47 | 45–50 | Within |
| Ch25 stale build, 201–233 | 214 | 177 | 180–190 | 3 shorter |
| Ch25 runtime experiment, 284–292 | 110 | 81 | 85–90 | 4 shorter |
| Ch25 restoration, 324–330 | 109 | 85 | 75–80 | **5 longer**: retain the branch reset, output cleanup, build metadata and copied manifests |
| Ch26 Principle, 5–7 | 210 | 59 | 60–70 | 1 shorter |
| Ch26 history, 96–124 | 222 | 191 | 190–200 | Within |
| Ch26 comparison control, 220–240 | 146 | 132 | 125–135 | Within |
| Ch26 flattening, 253–270 | 200 | 172 | 175–185 | 3 shorter |
| Ch26 moved checks, 373–405 | 189 | 155 | 165–175 | 10 shorter |
| Ch27 Principle, 5–7 | 148 | 86 | 85–95 | Within |
| Ch27 fixture logistics, 149–153 | 80 | 56 | 60–65 | 4 shorter |
| Ch27 table interpretation, 175–187 | 117 | 97 | 100–105 | 3 shorter |
| Ch27 profiling, 267–289 | 273 | 212 | 225–235 | 13 shorter |
| Ch27 decision, 301–311 | 174 | 127 | 135–145 | 8 shorter |

The shorter spans remove repetition while retaining the named state, control or joke. Ch25/26 therefore finish slightly below their overall target ranges. Liron's Bonus 2 Principle is also shorter than the planned 85–100 words: the permission rule and description distinction fit in 72 after removing the prescribed repairs. None was padded to a lower bound. The one over-budget span preserves the cleanup steps needed to reproduce Ch25's restored release. No planned mechanism, fence or check case was cut.

## Evidence, extraction and continuity

All **executable fence text and fence order are unchanged** from 5da9cbb. Only Ch26's project comment and Bonus 2's project/schema-result comments change inside fences. All seven endings start with a ruling. The two new catchphrases each occur exactly once outside the bios, with their approved speakers. Both are prompted by a specific preceding line: Noam's sitemap finding, and Oded's unmeasured key-cost guess. No phrase gets a gloss.

Protected findings remain intact: Ch24's competing `@ts-check`/global-check proposals; Ch25's exact TS2741 source-versus-emitted-declaration message; Bonus 3's original TS9007, permitted trivial inference, and explicit-string/fallback experiment. No earlier-act file changed. The three bonus chapters retain their fixed assistant artifacts and do not claim anything about real models or products.

Five external links remain, all outside dialogue. The Node and isolated-declarations links move onto substantive narration; the pinned checker source, interface-merging and Zod links keep their factual roles. Their URLs match the plan's print-footnote inventory. Bonus 3's final heading is `## The Verdict`; its final line is exactly:

> **Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."

Updated extraction follows the manuscript:

- Ch25 reads the module mode from Dima's setup and still verifies the output/metadata cleanup before the copied release.
- Ch26 reads project mode and versions from its source comment; the pre-currency state and temporary recorder instrumentation match their shortened descriptions.
- Ch27 reads the benchmark configuration at its shorter label. All counters, table rows, output bytes, caller sets, tracing and profiling controls are unchanged.
- Bonus 1 extracts the three assistant requests by their request openings, separately from the new Verdict blockquote. The initial full run reached Bonus 1 after Ch27 passed and exposed the old “every blockquote is a request” assumption (4 versus 3). This was an extraction failure, not a changed compiler/runtime result; the selector was corrected and the three bonus suites passed before the repeated clean full run.
- Bonus 2 extracts the two initial-schema required lists from comments and checks Zod's actual generated lists against them. Project flags remain checked beside the first file bundle. Runtime output expectations and owned artifacts stay unchanged.

The source/fence, length, phrase, link and final-line audits are recorded in `/private/tmp/pr-e-audit.json` and `/private/tmp/pr-e-audit-output.txt`. Temporary scripts, fixtures and logs are not staged. Coverage documentation describes the extraction changes.

## Validation

Targeted Ch24, Ch25, Ch26 and Bonus 2 checks passed; after the request-selector correction, Bonuses 1–3 passed. Clean installation reports zero vulnerabilities. The repeated full `npm run check` passes on **TypeScript 7.0.2, Node 22.23.4 and Zod 4.6.6**: **483 fences, 891 compiler cases and 382 runtime groups**, unchanged. These seven chapters contribute **82 fences, 344 compiler cases and 122 runtime groups**. Ch27 retains exact counter assertions, observational timings, separate trace/CPU evidence and the visible no-Go control. `git diff --check` passes. Final logs: `/private/tmp/pr-e-install-final.log` and `/private/tmp/pr-e-full-final.log`; the earlier extraction failure is retained in `/private/tmp/pr-e-full.log`.

Reader judgment remains necessary for the shorter Principles and replacement jokes. Compiler and runtime checks establish the claims and state sequence, not whether the voice edits land.
