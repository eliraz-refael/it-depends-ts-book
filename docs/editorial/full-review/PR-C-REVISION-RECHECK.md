<!-- Fresh Opus reader, recheck of the PR C revision (cedcee4 vs b5c68ec), 2026-11-03. -->

## PR C revision recheck report

I read every hunk in context, with at least 40 lines around each, and Ch9, Ch12 and Ch13 in full. I compiled the changed claims with tsc 7.0.2 under the book's profile. The probes are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/prc2/probes/`. Line numbers below refer to the new files in `new/book/02-advanced-typescript/`.

### NEEDS CHANGE

**1. Ch9 `03-template-literal-types.md:319–323`: The Debate Continues is now a speech, and it ends as a ruling.**
- The new line: "With literal names, that log gets me straight to restore. For a control change, I still have to follow `publish` through the setter. One wrapper throughout would give me one route to learn; these literals save me that detour for restore. I can trace either. I'd keep the literals."
- It runs to five sentences and has a semicolon in speech. The "one route to learn; these literals save me that detour" pair is symmetrical, so it reads as a lecture.
- "I can trace either. I'd keep the literals." means the Principle's owner votes for Oded, and nobody answers him.
- Linoy's side was audible only at `:315`, in the Turn. The section ends on a decision, so it is no longer an open debate on the page.
- Fix: cut Gilad to two sentences with no semicolon. For example: "With literal names, that log takes me straight to restore. For a control change I still follow `publish` through the setter." Then give Linoy one reply that keeps her position alive, such as "Or one route everywhere, if restore uses the helper too. I'd still make that trade." Alternatively, drop "I'd keep the literals."

**2. Ch9 `:213–221`: the collapse left Oded's "either" with nothing to answer.**
- The text now runs Oded "So you still wrote the three restore calls." → Linoy "Restore has a different job…" → Oded "Writing out the event name wouldn't tell you which path ran **either**."
- Gilad's setup line ("I still don't know which one produced my line") was cut. Oded is now rebutting a complaint nobody made, and he addresses Gilad, who hasn't spoken since `:181`.
- Fix: keep one short Gilad setup before Oded, e.g. "**Gilad**: 'Two places now. My log line doesn't say which.'" Or reword Oded's line so it doesn't need "either".

**3. Ch9 `:339–352` against `:414–416`: the audit move puts a pattern in use before it is explained.**
- `SettingsChange` (`:342–344`) uses the mapped-then-indexed pattern `{ [K in SettingKey]: … }[SettingKey]` without explaining it.
- The explanation ("Indexing with all its keys gives you the flat union too.") now comes 70 lines later, in the moved audit take.
- Before the move, the audit section came first in the main sequence. No earlier chapter uses the pattern; a grep for `}[` finds only Ch9 and Ch27.
- Fix: either add half a line to Linoy at `:339` ("Map each key to its pair, then index with every key to get one union."), or put the audit take before Daniel's union-`K` take.

**4. Ch12 `06-variance.md:247–249`: Eden asks for a run, then reports the result himself.**
- The text: Eden: "Now run the old dashboard. Before the archive button." Then an unattributed paragraph, which by the book's convention is still Eden: "The old parameter is still `ResultCache<ExportResult>`. Same error at `dashboard(csvCache)`, even though this body only reads a path…"
- Nobody runs the old dashboard and no fence shows it, so Eden ends up answering his own instruction. This is the setup for Noam's concession, the act's strongest Turn.
- The claim itself is correct. My probe `probes/ch12/old-dashboard.ts` gives TS2345 with "Types of property 'write' are incompatible…".
- Fix: make it one Eden line spoken as a result, e.g. "I ran the old dashboard, the one before the archive button. Same parameter, same error at `dashboard(csvCache)`, and that body only reads a path. That one never broke a receipt…" Or add a three-line fence that shows the label-only dashboard and the error.

**5. Ch12 `:64`: a pronoun now misreads.**
- The text: "Eden opens the archive change **they** are testing before release."
- Eden is *he* in the bio. Right after "Eden opens", "they" reads as Eden's pronoun rather than the team.
- Fix: "the archive change the team is testing before release", or "Eden opens the archive change, still in testing." This also answers the optional question of whether it has shipped, which is consistent with `:60` "the dashboard we shipped".

**6. Ch8 `02-mapped-types.md:132`: Eden's first line uses the short name.**
- Eden now first speaks at `:132` as "**Eden**: 'What about `{}`?'", while the full name "**Eden Legacy**" still appears at `:151`.
- Every other character's first line in the chapter uses the full name.
- Fix: move "Legacy" to `:132` and drop it from `:151`.

### Minor

- **Ch8 `:113` / `:128`:** Oded now opens with "Keep the parser that selects what goes into the write." Daniel's closer "Keep the parser with either definition." now repeats him, and Guy's "And keep its rules" follows, giving three "keep"s in a row. Change Daniel's last sentence to something like "The parser does the removing, whichever definition we use."
- **Ch8 `:297`:** Oded still edits and clicks Save, so he is still doing the QA test. The brief only asked for this where it was cheap; the joke at `:305` is a cost argument and carries it.
- **Ch8 `:239–253`:** this now works. Linoy claims "Then the selected fields should do." Daniel turns his laptop, says "The compiler disagrees.", and the fence and his explanation follow. It contradicts her claim and matches the bio. One small inconsistency: until now Daniel had been typing into the shared scratch file on the display.
- **Ch9 `:371` and `:433–444`:** the audit take is the only Additional Take with a heading. The `Capitalize` take after the `---` therefore sits under the heading "Do we have a paid profile?". Either drop that heading or end Additional Takes with the audit take.
- **Ch9 `:431`:** "Keep that out of the settings change. **Those** all have `Changed`." Here "Those" could mean the audit events. Use "The settings all have `Changed`."
- **Ch9 `:373`:** "That was going to be next." still reads fine in Additional Takes, as something she meant to show in the review. Nothing earlier in the book refers to the audit; I grepped for audit, entity and `ActionsByEntity`. "After this one" is gone, and the main sequence from `:252` to the Turn now flows.
- **Ch13 `:123`:** "Oded **opens** the integration module" suggests the file already exists, but the fence says it "Replaces label-frame.d.ts", and `:146` says the entries only now use it. Use "writes".
- **Ch13 `:221–231`:** the section begins with a bare fence after its heading, and nobody makes the change. Idan's question sits above the heading. One short Idan line, e.g. "Then make it say *may*.", would give the change an owner.
- **Ch13 headings:**
  - `:163` "Check each entry separately" is immediately repeated as Dima's first words. Quote a later line or trim his opener.
  - `:62` "Both pass the build" names a beat 40 lines into its section. That is acceptable.
- **Ch13 `:225`:** the comment "do not merge both spellings" is cryptic as an instruction to the reader. "keep only the optional member" would be clearer.
- **Ch13 `:66`:** "The module augmentation rules resolve the name like an import." is now a standalone sentence that mostly carries the link and repeats Oded's `:64`. It is borderline under FIX-PLAN §5.
- **Ch7 `:605`:** "need the board for that one … when we open that one" uses "that one" twice with different referents. Use "when we open the wrapper".
- **Ch10 `:456`:** the paths are now named. But the repaired courier wrapper is the thing being replaced (`:410`, `:454`). If that's intended for the migration, it's fine. Otherwise, "through the courier adapter" alone is cleaner.
- **Ch11 `:464`:** Eli's "Then follow what each reference can do with it." nearly restates Guy's previous sentence ("what the other reference is allowed to do"). Ending on Guy, the brief's other option, would avoid the echo.
- **Ch12 `:372`:** Guy's boundary line echoes Noam's `:325` ("mustn't get the archive action"), and Eden's `:374` echoes the "download cache" phrasing. It's light repetition and acceptable.

### Technical checks

- **Ch13 `:255` "The bypass still compiles."** Confirmed. The raw `new Label("Ada")` passed to `renderBadge(label: Label)` with the optional `frame?` exits 0. Deleting the guard gives `TS2722: Cannot invoke an object which is possibly 'undefined'.` (`probes/ch13/`).
- **Ch12, the old label-only dashboard against the function-property contract:** TS2345, as the text claims.
- **Ch13 `:339`:** Dima's mechanics line matches the old Oded line word for word. CONSOLIDATED.md:110 records where it now sits.
- **Ch7 `:19`:** matches the original text at HEAD (bcca391) exactly.
- **Ch9's moved fences, the Ch12 fence comment and the Ch13 `// Project files:` comment:** the worktree's checks already parse the new comment strings (`chapter12.cjs:56`, `chapter13.cjs:104`, `chapter9.cjs:60`). I did not run them.

### Must-fix status

1. **Ch7: resolved.**
   - `:19` is restored word for word.
   - The board line is kept beside the pointer.
   - Both link closers are cut. The section ends on Daniel, and the Verdict ends on the disagreement.
   - The optional "copying its example" beat is in.
2. **Ch8: resolved, with one new issue.**
   - The catchphrase now contradicts Linoy's claim.
   - The narrator's "we" is fixed.
   - Oded's `:113` is a cost argument.
   - New issue: Eden's first line uses the short name (item 6).
3. **Ch9: partly resolved.**
   - Done: the audit move, Gilad's comparison, the "It won't list every write" clause, the `:138` and `:88` lines, the `:183` fix, "I'll pay that." and the `:387` cut.
   - Still open: the collapse left a dangling "either" (item 2), and the move put the indexing pattern in use before its explanation (item 3).
   - Still open: Gilad's Debate Continues line is a speech that closes the debate, and Linoy is no longer heard at the end (item 1).
4. **Ch11: resolved.** There is a minor echo with Guy's line.
5. **Ch12: mostly resolved.**
   - Done: the narration is moved or cut, `:207` is cut, Guy names one boundary, the Verdict ends on Noam, ownership is settled (Noam has the label-only caller, Eden the rest), "either package" is in, and `:17` is trimmed.
   - Still open: the `:249` continuation (item 4) and the "they" pronoun (item 5).
6. **Ch13: resolved.**
   - Chen only asks questions now, and Dima and Gilad run the reproductions and the diagnosis.
   - The act ends on Oded's joke, with the mechanics given to Dima unchanged and CONSOLIDATED updated.
   - The Verdict ends on "A nicer error message isn't the feature."
   - The narration is moved into fence comments, and "still compiles" is restored and verified.
   - Only minor heading and staging nits remain.
7. **Ch10: resolved.** One minor wording option is listed above.
