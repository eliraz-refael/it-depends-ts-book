<!-- Verbatim report of an isolated targeted recheck of Ch26 draft 2 (961d306), commissioned by Claude on 2026-10-29. It read only the chapter, rebuilt the repository as one evolving tree, and scored draft 1's problems. -->

# Targeted recheck report (Ch26 draft 2)

**What I read:** only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r2/full/CHAPTER.md` (402 lines). I also looked at the cast bios for Eden, Sahar and Guy, to check pronouns. "He" is correct for all three.

**Fixtures:** I built one evolving tree at `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r2/full/work/repo`, with a `cp -Rp` snapshot per state named `s00-pre-pr` through `s20-final` in the same `work/` folder. There is one side fixture, `work/side-jsonparse`, for the claim on line 262. `$TSC` below means `/Users/elirazk/private/ts-book-worktrees/ch26/node_modules/.bin/tsc` (7.0.2); Node is 22.23.4, and `@types/node` is symlinked in. The type check is always `$TSC -p tsconfig.json`.

## Technical claims

| Line | Claim | Result | Command / note |
|---|---|---|---|
| 23–56 | Pre-PR tree is green | reproduced | tsc exit 0; `node --test` 2/2 pass (s00) |
| 60–71 | PR stays green | reproduced | tsc 0, node 2/2 (s01) |
| 96 | Deleting the directive gives TS2345 plus "Property 'currency' is missing…" | reproduced, exact text | s01 minus directive |
| 104 | `ship(order: Paid)` without the directive gives TS2322 `'"draft"'…'"paid"'` | reproduced, at column 20 (`status`) | s02 |
| 110 | Pre-March tree, widened to `Draft \| Paid`, gives TS2578 | reproduced | s03. **Guess:** the pre-March source isn't shown. I removed `currency` from Draft, Paid and the fixture, and dropped PreOrder. The prose is enough to do this. |
| 131 | Draft fixture with `ship(Order)` gives TS2578 | reproduced | s04 |
| 137 | Another required Draft field makes the fixture fail outside the directive | reproduced (TS2741 at the fixture) | added `note: string` |
| 139 | Paid probe passes; without the directive it gives TS2741 "paidAt missing" | reproduced | s05. TS 7 reports TS2741 directly, so this is not inconsistent with line 96. |
| 145–160 | `Paid \| PreOrder` is green; removing PreOrder makes the pre-order call fail; restoring it is green | reproduced | s06; the failure is TS2741 "paidAt missing in PreOrder" |
| 197 | With `: any`, both the assignment and the admin caller compile | reproduced | s08 |
| 212 | Row with `any` gives TS2344; the inferred return passes | reproduced | s09 |
| 226 | The `wrong` directive passes normally and gives TS2578 under `any` | reproduced | s10 |
| 245 | Flat return: Row gives TS2344; admin still compiles and prints `Paid order o1` | reproduced | s11; printed with `node -e 'import("./src/admin.ts").then(m=>console.log(m.paidCard("o1")))'`. **Guess:** the page doesn't say how he "prints" it. |
| 260 | Status accepts both return forms and rejects `any` and a widened status | reproduced | s12. **Guess:** "widened status" isn't specified. I used a non-generic `status: Order["status"]`. That widening is also caught by `expected` and by `admin.ts`, so Status's unique catch is `any` alone. |
| 262 | A function annotated `User[]` that returns `JSON.parse` passes an exact return test and returns anything | reproduced | side fixture; tsc 0, runtime `{ oops: 1 }` |
| 276 | The spec reporter prints `shipped: [ 'o2' ]` and the test passes | reproduced | s13, `node --test --test-reporter=spec`. **Guess:** I assumed the log was `console.log("shipped:", shipped)`. The default TAP reporter shows it as `# shipped: [ 'o2' ]`. |
| 286 | Plain `node --test` executes `test/ship.types.ts` and records the draft | reproduced | s14; the spec output shows `shipped: [ 'o2' ]` and `✔ test/ship.types.ts`. **Guess:** the intermediate file isn't shown. It needs `shipped` imported to do the reset and the log. |
| 288 | `type-tests/` isn't discovered | reproduced | s15; plain `node --test` runs only the 3 runtime tests |
| 293–332 | Final files are green | reproduced | s15; tsc 0, `node --test test/ship.test.ts` 3/3 |
| 345 | `DeliberatelyWrong` passes tsc | reproduced | s16 |
| 351 | `--listFilesOnly` lists the runtime test but not `type-tests/ship.types.ts` | reproduced | s16 |
| 357 | `test/ship.types.ts` wasn't checked either | reproduced | I planted `Expect<Equal<1,2>>` in s14's `test/ship.types.ts`; tsc exit 0 |
| 365–369 | New include lists both test files; TS2344; deleting it passes | reproduced | s17. The list also gains `test-support/types.ts`. |
| 377 | Widening to Order gives TS2578 in the new file; restoring is green | reproduced | s18 |
| 379 | `node --test type-tests/ship.types.ts` passes with the false assertion present | reproduced | `ok 1 - type-tests/ship.types.ts` |
| 387 | Failing `test/admin.test.ts`: single-file command green, glob red; after the fix both pass | reproduced | s19/s20; `node --test "test/**/*.test.ts"` exits 1, then 4/4 pass |
| 393 | Final tsc and glob pass | reproduced | s20 |

Every claim reproduced and nothing contradicts the tools. The guesses are minor: the pre-March source, the log statement, the intermediate `test/ship.types.ts`, how the admin output is printed, and what "widened status" means.

**A logic gap against the chapter's own rule.** The Principle (line 5) says to break the promise again after you *move* a test. It also says a planted error only shows that the compiler checks the file, which is a different question. After the move, the Turn re-breaks only the draft promise (line 377). `expected` and Status are never shown failing in `type-tests/`. `DeliberatelyWrong` proves only that the compiler reaches the file, which is exactly what line 5 says isn't enough. Noam's rule on line 389 repeats the requirement too. One more mutation (`: any` again) after line 377 would close the gap.

## The earlier reader's problems

1. **Unattributed lines on page one: fixed.** Lines 11–19 are all tagged.
2. **"That earlier version" undefined: fixed.** Line 110 names March, `currency` and what changed. It is still one very dense paragraph (see C).
3. **orderRow sequence hard to track: fixed, but still dense.** Line 232 spells out the end of the experiment ("removes `: any` and the entire `wrong` assignment… then restores Row"). Line 260 says the flattened helper stays. `any` still goes on and off twice across lines 197, 212, 226 and 232.
4. **The move was only summarised, and the final runtime file was never shown: mostly fixed.** Both final files are shown (lines 293–332). The intermediate `test/ship.types.ts`, with its reset and log, is still prose only (line 286).
5. **The Verdict pinned a single runtime file: fixed.** The glob appears on line 385 and is demonstrated on line 387.
6. **`test/ship.types.ts` was outside tsc's list and nobody said so: fixed.** Lines 355–357 say it, and the tools confirm it.
7. **Manual narration and a Verdict that re-reads its scenes: partly fixed.** The Verdict no longer recaps its scenes. Manual-style paragraphs remain at lines 110, 139, 260, 286, 290, 318 and 387.
8. **The Principle's second paragraph pre-announces the scenes: not fixed.** Line 7 is still a checklist, one sentence per scene: the draft call, the `any` scene, "Check which files each compiler and runtime command selects" (the Turn) and JSON.parse. The file-selection sentence gives away the Turn.

## A. Would I keep reading after page one?
Yes, because of lines 11–19: "It can't be green" / "I can refresh it" / "And it passed." / "That's the problem." A test that passes when it shouldn't is a hook that works. The Principle above it is the obstacle: two paragraphs of rules before anything has happened, and line 7 is a slog.

## B. Where I enjoyed it
- Line 73, Eden: "I've inherited comments that outlasted the warnings they silenced."
- Line 108: "nobody asked the compiler to check the description."
- Line 135, Oded: "I have rarely been congratulated for breaking a build this enthusiastically."
- Line 234, Sahar: "Why are we assembling two objects to get two fields?" and then "Then finish removing it." This is Sahar on brand.
- Line 247: "I let drafts ship and got green. An ampersand left his hover and he got red."
- Line 280: "our test of the forbidden call is making the forbidden call." This is the best reveal in the chapter.
- Lines 347–349 call back to the refresh joke, and the ending at lines 395–401 ("I was finished.") lands.

## C. Bored, lost, or lost track of state
- **Line 110:** history, March, restoring two files, widening and TS2578 all in one paragraph. I had to rebuild it to follow it.
- **Lines 139–143:** the probe and the directive's removal and return are tracked only by the word "temporarily". At line 143, "leave the parameter at `Paid | PreOrder`" is wrong, because it is currently `Paid`. It should be "set".
- **Lines 197–232:** `any` is switched on and off four times.
- **Line 218:** "he replaces" comes straight after Sahar's line, so "he" reads as Sahar, but the actor is Noam.
- **Line 247:** "his hover… he got red". It isn't clear who is who (Guy's helper, Noam's test).
- **Lines 282 and 286–290:** Eden drops a link without a line of his own, then two paragraphs of logistics.

## D. Scene to retell
"It shipped" (lines 266–280): the type test passes while logging `shipped: [ 'o2' ]`. Close behind is the opening reveal that one directive was hiding two different failures (lines 96–116).

## E. Turn and Verdict
**The Turn is earned and fair.** The include is shown on line 92, and the reader could have spotted the problem at line 286. Eden admitting it wasn't checked before either (line 357) is honest.

**The Verdict follows from it.** The runtime glob is the runtime counterpart of the include fix, so that part is new, not a repeat. Line 389 does decide things twice, though. "Check what both commands select" restates line 7 and the Turn, and Eden has just shown it. The gap described above (Status and `expected` never re-broken in their new location) undercuts the Verdict's "breaking its promise makes it fail."

## F. Do the characters sound distinct?
- **Oded:** distinct. Wry and self-deprecating.
- **Eden:** distinct. A veteran's lines ("The suffix isn't an instruction to leave it alone.").
- **Sahar:** distinct when he's removing things. At line 195 he only prompts; line 216 is a real point, but it's still a cue for the next experiment.
- **Guy:** mostly there to set up the experiments (lines 164, 185, 264). Line 236, the leftover fragment, is his only line with history.
- **Noam:** terse, and the humility of line 112 is good. Otherwise he operates the keyboard.

## G. Where the narrator acts like a manual
- Line 110 (the history narration).
- Line 139.
- Line 212: "This `Equal` distinguishes `any`…".
- Line 260 (the whole verification in two sentences).
- Lines 286 and 290 (moving logistics).
- Line 318: "The compile-only file contains…".
- Line 387 (the whole Verdict demonstration as narration).

## H. Is the Principle a clear, testable rule?
**Yes, the first paragraph is.** "Change the code so that promise is false and run the type check CI actually runs. See the test fail, undo… Do that when you add… change… or move it." The chapter bears it out, and the closing contrast (a planted error versus a broken promise) is earned by the Turn.

**Weakest sentence:** "Write the promise down before choosing which differences to test." It isn't clear what "differences" means. A close runner-up is line 7's "Start with a call that compiles outside `@ts-expect-error`," which is hard to parse. The second paragraph as a whole is the weak part.

## I. Top five changes, ranked
1. **Rewrite Principle paragraph 2 (line 7).** Cut the scene-by-scene checklist, above all "Check which files each compiler and runtime command selects", which gives away the Turn. Fix or cut "differences" on line 5.
2. **Make the chapter obey its own move rule.** After line 377, re-break the row promise in `type-tests/` (`: any` gives TS2344), or have Noam ask "And the row?". Then trim line 389 so the rule isn't stated a second time.
3. **Break up line 110.** Turn it into a short exchange, or show a three-line pre-March snippet.
4. **Fix state and pronoun slips.** "he" on line 218, "his/he" on line 247, "leave" on line 143. Say what "widened status" means on line 260 and how the admin output is printed on line 245.
5. **Show the intermediate `test/ship.types.ts`.** A three- or four-line excerpt with the reset and the log would do. Give Eden a spoken line at 282 instead of the link drop, and trim the manual paragraphs at 286, 290, 318 and 387.
