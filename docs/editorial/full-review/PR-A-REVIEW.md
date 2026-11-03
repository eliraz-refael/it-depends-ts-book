# PR A self-review — Tier 1 correctness and maintenance

2026-11-03. Implements the 17 Tier 1 items in [CONSOLIDATED.md](CONSOLIDATED.md), following [FIX-PLAN.md](FIX-PLAN.md) and the rulings in [FACT-CHECK.md](FACT-CHECK.md). Changes are local; Act-level structural and voice work remains assigned to PRs B–E.

## Item-by-item review

| Item | Change and verification |
|---|---|
| 1 — Ch7 TS2769 | Replaced the two-overload diagnostic with TS 7.0.2's “The last overload gave the following error” message. The check extracts the complete quoted message from the fence and compares it with the compiler diagnostic, normalizing whitespace only, as well as asserting TS2769. |
| 2 — Ch2 duplicate name | Renamed the outer declarations to `optionalName` and `assertedName`. The check now compiles the entire fence together and checks both inferred types; it no longer splits the fence to avoid the collision. |
| 3 — Ch4 ellipsis | Replaced `{ ... }` with `{ /* ... */ }` and removed the harness's syntax repair. |
| 4 — Ch1 logger | Kept `event.data.user` as the logging argument. Dima explicitly chooses rejection of missing-user payloads and invalid purchases. Runtime checks compare the before/after logger arguments for purchase, refund and signup; verify the charge; reject malformed purchases without effects; and run a valid purchase again. |
| 5 — Ch18 callbacks | Took the permitted qualification option. Eden limits preservation to direct calls; Dafna asks about `map`, and Eden gives the forwarding arrow and commits to checking callback references before switching. Checks compile the old and new callback calls, reproduce the changed status and missing risk record, and verify the arrow at both at-risk and breached times. |
| 6 — Seven frame leaks | Ch1's “these snapshots” explanation becomes Eli's speech. Ch26 loses “fictional” and “Nothing has shipped,” retaining the in-memory recorder. Ch27 refers to the shop's helper. Bonus 1 recalls the badge plugin; its documentation link moves to the existing declaration-introduction sentence. Ch14 says “With strict checking.” Bonus 2 names its project settings explicitly. Ch7 loses “Keep the actual condition attached to the example.” |
| 7 — Oded's memory | He remembers Daniel's `Unwrap`: “I was hoping it was his problem.” The local joke now acknowledges the earlier scene. |
| 8 — Narrow/wide vocabulary | Oded calls the library declaration incomplete; Daniel says it leaves out properties. The existing subtype explanation stays precise. |
| 9 — Misspelled switch case | Chen distinguishes rejection of the misspelled case from the exhaustiveness failure for the omitted member. Controls assert TS2678 and TS2322 by message, retain TS2678 without exhaustiveness, and restore a valid exhaustive switch. |
| 10 — Filter inference | The aside now names `filter(Boolean)` on missing objects. A check contrasts its still-optional elements with explicit non-null assertion and inferred predicate narrowing. |
| 11 — RequestState tag | Ch5 now uses Ch3's `status` tag throughout the union, switch, parser, retrying example and failure reasons. Runtime cases exercise all four states and reject malformed events, including the old tag. |
| 12 — Version ownership | Eden says template versions belong to templates; the tree starts at its own format 1 with its own reader. Existing separate-reader and migration checks pass. |
| 13 — Node declarations | Added an exact root `@types/node` 22.20.5 devDependency and updated the lockfile and Bonus 1 manifest. Updated Ch26's installed-version assertion and coverage documentation. The printed Node test code runs on Node 22.23.4. |
| 14 — Empty array | `firstElement` returns `T | undefined`; Linoy's explanation and the hover agree. Checks assert the inferred union and execute empty/nonempty controls; `any` still propagates as intended. |
| 15 — Generic setter | Daniel states the union-key limitation beside the adopted setter decision. The inline `setSetting<SettingKey>("fontSize", false)` is extracted, compiled and run in isolation; a literal numeric call restores the value. |
| 16 — Cast pronoun | Daniel's bio now says Noam is rarely satisfied “until someone has called the function.” |
| 17 — Maintenance | Pinned Zod 4.6.6, updated the lockfile, Bonus 2 version references/assertions and coverage documentation. The generated schema and all printed outputs still match. The README now explicitly names Ch27's fixture benchmark and distinguishes timing evidence from pass/fail thresholds. |

## Validation

- Updated dependencies with `npm install --save-dev --save-exact zod@4.6.6 @types/node@22.20.5 --package-lock-only`, then ran a clean **`npm ci`**: success, zero reported vulnerabilities.
- Final **`npm run check`: PASS**, TypeScript **7.0.2**, Node **22.23.4**, Zod **4.6.6**. Coverage: **483 fences, 885 compiler cases, 383 runtime groups**, plus the existing two compiler-default cases, two source searches and eleven file-list queries. README rows sum to these totals.
- Eight fences changed; their inventory is unchanged and every changed fence remains checked. Added eight compiler cases and seven runtime groups overall. Ch27's exact counters pass without a rebaseline; timings remain evidence only.
- The first full run stopped at Bonus 2's stale assertion for the literal phrase “strict ES2022/Node16.” The assertion now checks the explicit settings printed on the page. Bonus 2 passed separately, then the full suite passed. Final run log: `/private/tmp/pr-a-check-final.log`.
- `git diff --check` passes. Compared the refuted passages against the base: eight relevant chapter files are byte-identical; Ch5's Additional Takes and Ch7's Turn-through-ending are unchanged. In particular, Ch13's plugin-import/`skipLibCheck` explanation and Ch25's TS2741 passage were not altered. The fact-check, consolidated review and fix plan are unchanged.

## Choices and limits

The Ch18 API still has the optional timestamp. This revision explicitly scopes the compatibility claim and demonstrates the required callback adapter, rather than claiming the signature itself prevents misuse. That is one of the settled fix options, with no structural rewrite.

The Ch1 logger retains the existing user-object contract; the new validation failures are explicit decisions on the page. The setter warning documents an accepted limitation rather than silently strengthening its signature. These choices keep PR A local while making the remaining obligations visible and executable in the checks.
