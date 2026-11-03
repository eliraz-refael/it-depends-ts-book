<!-- Fresh Opus recheck of finishing pass caf4493, 2026-11-03. -->

# Whole-book finishing-pass recheck

Verdict: the pass is nearly ready to merge, but it isn't yet. Every Must and Should item was applied and the suite passes on TS 7.0.2. One added callback is factually wrong, one cut left a dangling reference, and two edits step on lines nearby. Items 1–4 below should be fixed before the PR.

## Remaining items

1. **The Ch20 callback is inaccurate.** `book/03-patterns-and-design/07-currying-partial-application.md:47`: **Noam**: "Eden caught this with `tickets.map(slaStatus)`. That time the index became `now`."
   - Noam has no lines in Ch18. Ch18's speakers are Chen, Dafna, Eden, Gilad, Oded and Eli, and none of them speak in Ch20. The brief's premise that "Noam is in both scenes" was false, so its fallback ("have Eden say it") isn't possible either.
   - In Ch18 the bug never ran. Dafna asked "And `tickets.map(slaStatus)`?" and Eden said "That would pass the index as `now` … I'll check callback references before switching" (`05-pure-functions.md:208–210`). The line's "the index became `now`" says it happened.
   - WHOLE-BOOK-REVIEW.md says "Ch18 really passes that index as `now`", which is wrong.
   - Proposed: **Noam**: "Eden's SLA migration had the same trap: `tickets.map(slaStatus)` would have passed the index as `now`. He checked every callback reference before switching."

2. **Dangling "that rejection" after the Ch14 cut.** `book/03-patterns-and-design/01-error-handling.md:5` now reads: "…and that the function can finish normally. Before returning, check whether the caller still needs that rejection to stop or undo the work." The sentence that introduced the rejection was cut, so "that rejection" has nothing to point back to.
   - Proposed: "Before returning, check whether the caller still needs to see the failure to stop or undo the work."

3. **The new Ch26 line steps on a protected best moment.** `book/04-the-real-world/03-testing-typed-code.md:121`: **Noam**: "Last time a factory hid the dependency. This time it was a comment."
   - It sits right before Oded's line at :123, "I have accidentally passed two different tests with one comment.", which the reader report lists as a best moment. Oded's punchline now lands on the third "comment" or "hid" in four lines. Eden's line at :119 already says "The comment hid the stale fixture."
   - "Last time" is also loose, since Ch2 is 24 chapters back.
   - The callback itself is accurate: Ch2 `02-type-assertions.md:395` has Noam saying "The factory hid the dependency."
   - Proposed: **Noam**: "Like my user factory. It hid the dependency too."

4. **"too" dangles in Ch25.** `book/04-the-real-world/02-monorepo-type-sharing.md:320–322`:
   - Dima now says "Package JavaScript. Restore the `.js` imports and `default` targets, and remove `allowImportingTsExtensions` from the dev base. A rebuild won't delete the stray money copy."
   - Gil answers "Clean the incremental build files too, so the outputs get rebuilt."
   - Dima no longer tells anyone to clean anything, so Gil's "too" has nothing to attach to.
   - Proposed: end Dima's line "…A rebuild won't delete the stray money copy, so clean the outputs first." The `chapter25.cjs` assertions on Dima's and Gil's lines still match.

5. **Two Eden lines in a row in Ch26 after the move.** `03-testing-typed-code.md:372` and `:374` are both `**Eden**:`. This came from folding the narration into his speech, and the book does this only about four other times. Also, `src` is in plain text while `test/**/*.test.ts` is in code font.
   - Proposed: merge them into one line: **Eden**: "The `tsc -p tsconfig.json --listFilesOnly` result has the runtime test, but not `type-tests/ship.types.ts`. Our include only names `src` and `test/**/*.test.ts`, and no included file imports the type test. We taught the runner to leave it alone. We haven't told the compiler where we put it. It wasn't checked in `test/ship.types.ts` either. We moved it before anyone asked."

6. **The Bonus 3 cut leaves a reply with no speaker.** `book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md:56–60` now runs:
   - **Noam**: "And the badge?"
   - "Still says the same things. I checked."
   - **Oded**: "These cases were here before the refactor…"

   The narration that used to sit between them was the only buffer. Without it, the untagged reply reads as Noam answering his own question, followed straight away by a tagged Oded. Earlier reports flagged this unattributed line, but nothing has fixed it.
   - Proposed: **Oded**: "Still says the same things. I checked. These cases were here before the refactor. I kept them."

7. **Ch15 Principle drops the example without saying so.** `02-branded-types.md:5`: the sentence "A page number and a count of pages are both numbers, but putting one where the other belongs changes the result." was removed. The brief didn't ask for this cut and WHOLE-BOOK-REVIEW.md doesn't mention it. Without it, "which job a number has" and "distinguish them" are abstract.
   - Proposed: restore the sentence right after the new rule. Otherwise, record the cut in WHOLE-BOOK-REVIEW.md.

8. **Ch24 "any budget" can be misread.** `01-migration-strategies.md:201`: "The any budget again. An owner and a next step." Without quotes this can read as "any budget at all". Ch1 introduced the term with quotes ("I call it the 'any budget.'"). The callback itself is accurate: Ch1:222 is Eden's term, and Ch1:515 has Eden's "gets an owner and a next step".
   - Proposed: "The 'any budget' again. An owner and a next step."

9. **Low priority: the Gil payoff sits far from its setup.** `04-performance-vs-safety.md:182`: "…Try a smaller change. I'm adding your bet to the spreadsheet. Entry 848." It's accurate: Oded's bet is at :110, the bio count is 847, and the bet is disproved here. But two unrelated sentences separate the refutation from the joke.
   - Proposed: "It does. But key enumeration alone cost little here. I'm adding your bet to the spreadsheet. Entry 848. These are whole-version comparisons, not charges we can add into a bill. Try a smaller change."

10. **Low priority: the prologue line has a number mismatch.** `00-prologue/01-how-to-read.md:35`: "**Additional Takes** explore a related case after the main argument; a single case is an **Additional Take**." Plural "Takes" sits with "a related case".
    - Proposed: "**Additional Takes** explore related cases after the main argument; a chapter with only one has an **Additional Take**."

11. **Notes only, no edit needed:**
    - Ch27:215 puts the `probe.json` config in a comment inside the `src/probe.ts` fence. That is still inline settings, now in the wrong file's fence. The departure is recorded and is acceptable.
    - Ch24:270 Eden's "Every exception list I've inherited…" echoes his Ch26:72 "I've inherited comments that outlasted…".

## Verified

- **Must 1.** Applied. The phrase still appears once, the "how" is added and no statistic is invented.
- **Must 3.** Applied, and two more fence comments were fixed in Ch12 and Ch18.
  - `incomplete` (Ch11:39) and `createExport({ source: "orders" })` (Ch11:221) both exist.
  - Ch12's `panel` binding follows at :348, and Ch18's `slaStatus` export follows the fence.
  - No fence comment still says "above" or "below". Narrator "below" at Ch27:51 is kept.
- **Must 4.** All five sentences were cut correctly, apart from the Ch14 leftover in item 2. The Ch11 joining-word fixes read cleanly.
- **Must 5.** Applied. Ch21 now leads with the rule, and Ch15 opens on the brief's rule (see item 7).
- **Must 6.** Applied. "Freezing a live view" is supported by Ch17:215–220.
- **Must 7.** Only the headings moved, in Ch14 and Ch16.
- **Must 8.** All three link sentences were cut instead of rewritten. This departure is recorded. The neighbouring dialogue still flows.
- **Should items.** All applied: Ch15 Noam reply, Ch20 ruling, the three closers, Gilad's full name at Ch25:137 (his first line in that scene), straight quotes, the prologue lines and the cast-table column. The Ch26 Guy line moved; "too" there still reads as a follow-on request.
  - Liron's Clojure aside matches his bio, he speaks in Ch22, and it isn't in a Principle.
  - Take headings: singular for one subject (Ch3, 10, 15, 19, 20, 21, 23) and plural where there are several subjects.
  - Departures recorded in the review: Ch8 → Ch9 renumbering, Ch25 reassignment to Dima, Ch27 comment instead of a new fence, and cuts instead of added facts for Must 8.
- **Leave-alone list.** Nothing on it changed:
  - Ch1, Ch4 and Ch23 are untouched.
  - Daniel's Principles, Eli's openings and the Ch19/24/27/B3 Verdict rulings are unchanged.
  - Narrator "below", subsection quote style and Debate Continues openings are unchanged.
  - Every best moment is textually intact, but item 3 crowds Ch26:123.
- **Callbacks.**
  - Ch17 `moveStart`: accurate. It is Eden's helper in Ch15:227–233, and the hole is the same (a readonly property accepted by a writable parameter).
  - Ch15 "UserId in our style guide": accurate. It is Ch3's convention sample at :434, which uses `__brand`.
  - Ch24 "any budget": accurate. Ch26 "factory hid the dependency": accurate. Gil's "Entry 848": accurate.
  - Ch20: inaccurate (item 1).
- **Catchphrases.** All 15 appear exactly once outside the cast page, each spoken by its owner.
- **Ending.** The file ends on `**Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."` and a single newline, with nothing after it.
- **Links.** None are inside dialogue. Six external links remain, plus the README link at prologue:73:
  - Ch3:84 Express declarations
  - Ch7:229 TS issue 33912
  - Ch15:224 readonly docs
  - Ch27:279 the pinned `mapTypeEx`
  - B1:103 interface merging
  - B3:391 isolatedDeclarations
- **Pronouns.** They match the bios. No new pronoun lines are wrong ("He replaces the include" refers to Eden, who is he).
- **Union display order.** Checked on TS 7.0.2, with probes in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/final/probes/`. TS2322 shows `"onClick" | "onFocus" | "onHover"` and `"onAutoSaveChanged" | "onFontSizeChanged" | "onThemeChanged"`. The order is the same when those literals are created earlier in the file, so it doesn't depend on context. Both comments match.
- **Check extractions.**
  - `chapter25.cjs` still asserts the restore, the `allowImportingTsExtensions` removal, the full cleanup list and the `tsc -b` step, and still runs the real clean/build/image assertions.
  - `chapter27.cjs` now parses the whole `probe.json` from the fence comment and deep-equals extends, files and include, which is stronger than before.
  - The Bonus 3 check still finds "Node 22.23.4" in the moved comment.
- **Suite.** `node checks/run.cjs` passes on TS 7.0.2 and Node 22.23.4, every chapter and both bonus checks, exit 0. I ran it with TMPDIR set to the probes directory, and the worktree's git status was the same before and after.
