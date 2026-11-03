# Whole-book recheck: settled fixes (PR F)

2026-11-03, at dad555e. This is FIX-PLAN item 6. Two fresh Opus readers reviewed the whole book:
- a [first-time reader](WHOLE-BOOK-READER.md), all 79,000 words in order;
- a [standards audit](WHOLE-BOOK-AUDIT.md) against FIX-PLAN's standards, run chapter by chapter.

Both readers found:
- all 15 catchphrases used once, each by its owner, and the pronouns correct;
- no fiction leaks in dialogue and no links in dialogue;
- every chapter with a labelled Turn, and every Verdict leading with a `>` ruling;
- accurate cross-chapter callbacks and balanced fences.

The reader calls the book ready after a short fix list and rates it about 7.5/10 as a fun way to learn.

This is a finishing pass, not another revision round. Change only what's listed here, with the smallest edit that fixes each item. Where an item is a cut, cut and don't rewrite around it. Line numbers refer to dad555e.

**Refuted from the reports.** Bonus 2's Zod 4.6.6 matches the repo pin. The reader's "4.6.2" is wrong, so don't touch it.

## Must fix

1. **Eden's catchphrase needs its "how" (Ch24 `01-migration-strategies.md:268`).** His bio says that after the phrase he "describes exactly how". Add one sentence before the line about the catalogue team, describing how opt-out lists fail without inventing a statistic. For example: "I've seen this fail at scale. Every exception list I've inherited grew one temporary entry at a time, and nobody reviewed the old ones again." The phrase still appears once and stays where it is.
2. **The `map`-passes-the-index bug is rediscovered (Ch20 `07-currying-partial-application.md:45`).** Ch18 (`05-pure-functions.md:210`) already caught it. Add one callback line after `:45`. Noam is in both scenes, so it could be his, e.g. "Eden caught this with `tickets.map(slaStatus)`. That time the index became `now`." Check that this doesn't weaken Ch20's surprise; if it does, have Eden say it instead.
3. **Code comments that address the page.**
   - Ch8 `02-mapped-types.md:146`: change it to "// This project keeps both settings enabled."
   - Ch11 `05-advanced-generics.md:273` and `:296`: drop "above", naming the earlier value instead.
   - Grep every fence comment for "above" and "below". Narrator "below" stays.
4. **Principles that still state their Turn.** Cut only the named sentences:
   - **Ch14 `01-error-handling.md:5`:** "In an async function, returning an ordinary value fulfills its promise. Whoever awaits it no longer gets a rejection to act on."
   - **Ch17 `04-immutability.md:7`:** "Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees."
   - **Ch11 `:7`:** "Requiring a complete object and restricting the steps used to construct it are different jobs."
   - **Ch13 `:7`:** the "represent the uncertainty and decide what the caller should do" sentence.
   - **Bonus 1 `:7`:** "Code without them can still do the wrong thing."

   Fix any joining word the cuts need. This overrides my earlier "leave alone" for the Ch14 and Ch17 hints: two independent passes have now flagged them.
5. **Two Principles don't open on a rule.**
   - **Ch21 `08-hof-patterns.md:5`:** swap the first two sentences so the rule leads. "A wrapper is acceptable only if the operation still does what its caller agreed to. When this job says failed, I have to know what to tell the customer."
   - **Ch15 `02-branded-types.md:5`:** open on a rule, e.g. "When two values share a representation but not a job, give each job its own type, and convert where someone decides which job a number has." Keep the brand-promise sentences that follow, and drop "…or the brand can outlive the fact it claims."
6. **The Ch17 Verdict ruling isn't transferable (`04-immutability.md:348`).** Replace the blockquote with a general ruling, e.g. "> Give a holder that needs history a value that can't change, and a holder that needs the current state a call to its owner. Freezing a live view doesn't make it a record." Then move this team's decision into a plain line or the existing dialogue.
7. **Scenes sit under `## The Principle` (Ch14 `:7–13`, Ch16 `03-runtime-validation.md:7–88`).** Move the `## The Debate` heading up so the Principle section holds only the expert's statement. This moves the heading only; no text changes.
8. **Link sentences that only restate (Ch13 `07-declaration-merging.md:66`, Ch26 `03-testing-typed-code.md:289`, Bonus 2 `02-type-safe-agent-patterns.md:157`).** Each link must sit on a narrator sentence that adds a fact not just spoken. Either make the sentence add that fact in a few words, or move the link to an existing narrator sentence nearby. If neither works, cut the sentence and the link, and record the change for the print footnote inventory. No link goes into dialogue.

## Should fix

- **Ch15's Debate Continues resolves on the page (`:309–321`).** Keep it live with one Noam reply after Eden's "we'll revisit the class", e.g. "Then every restore path repeats the conversion. I'd still rather keep the accepted object than rebuild it at each caller."
- **Ch20's ruling (`:335`).** Add the Turn's finding: creating the function should prove its arguments valid.
- **Filing closers.**
  - **Ch11 `:199`:** cut Guy's last line so the section ends on Oded's "People will write my annotation."
  - **Ch21 `:337`:** end on a spoken beat instead of the comment note, e.g. Oded: "So 'unconfirmed' has an owner. That's more than 'failed' ever had."
  - **Ch26 `:269`:** end the section on Noam's "These tests believe the annotation." and move Guy's request to the start of the next section.
- **Callbacks.**
  - **Ch17 `:64–66`:** Daniel's answer calls back to Eden's `moveStart` from Ch15.
  - **Ch15 `:86`:** change "Our `UserId`" to "The `UserId` in our style guide…".
  - **Act IV:** add two short in-world callbacks. One is Oded's "The any budget again. An owner and a next step." after Ch24 `:199`; the "any budget" is Eden's term in Ch1 `:222`. The other is Noam's Ch26 line about the Ch2 factory hiding the dependency (`:119`). Check that each is accurate.
- **Unpaid cast setups, once each.**
  - Gil's spreadsheet: after Ch27 `:182`, add "I'm adding your bet to the spreadsheet." Use the bio's count + 1 only if the bio gives an exact number.
  - Liron's Clojure habit: one aside in a scene where he speaks, not in a Principle.
- **Ch25: Gil and Gilad alternate (`:120–153`).** Use "Gilad Stacktrace" in full once, at his first line in that scene.
- **Narrator as manual.** Take only these from the audit's table:
  - **Ch27 `:222`:** a `probe.json` fence or a spoken result, not inline settings.
  - **Ch27 `:247`:** one summary sentence.
  - **Ch26 `:372–376`:** Eden speaks the file-list result.
  - **Ch25 `:320`/`:326`:** one cleanup sentence.
  - **Bonus 3 `:58`:** move it into a comment or cut it.

  Keep every extracted fact checked.
- **Prologue (`01-how-to-read.md`).**
  - At `:27`, soften "tear it apart" to match the book, as the reader proposes.
  - Add one line each explaining "The Debate Continues" and "Additional Takes".
- **Consistency.**
  - Use `## Additional Take` for one take and `## Additional Takes` for several.
  - Use straight quotes in narration (Ch19 `:13`, Ch26 `:281`, Ch27 `:316`).
  - Drop the empty first column of the cast tables (`02-meet-the-cast.md:273`, `:283`) if it isn't used.
  - Reorder the union comments at Ch3 `:172` and Ch8 `:441` to TS 7.0.2's display order, only if no check asserts the old order.

## Leave alone

- **Sahar's catchphrase** stays in Ch23. The audit found it lands, and moving it is a cross-act change.
- **The Ch4 Turn, the Ch1 Principle length, Eli's "Use a … when" Principles and Daniel's repeated caller rule.** These were settled in their Act PRs.
- **The Verdict-ruling near-duplicates across Ch19/24/27/B3.**
- **Cross-book patterns.** The "run the old caller" Turn count, the cold-open run and Oded authoring regressions are book-level patterns, not defects to fix now. Record them as notes for a future edition.
- **Narrator "below", reference-code Verdict closers (Ch3/4/6), the subsection quote style and the unquoted Debate Continues openings.**
- **Everything both readers list under "Best moments".**

## Process

Codex drafts on a new branch `codex/release-recheck` from dad555e. Commit this brief and both reports to `docs/editorial/full-review/`. Run the checks for every changed fence, comment or extracted sentence, then a clean `npm ci` and the full suite. Record every disposition in WHOLE-BOOK-REVIEW.md. One fresh recheck of the diff follows, then the PR.
