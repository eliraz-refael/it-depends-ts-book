# PR C revision brief

2026-11-03, for draft b5c68ec. Two fresh Opus readers reviewed it:
- a [front-to-back reader](PR-C-READER.md);
- a [diff and continuity recheck](PR-C-RECHECK.md).

**What already passes:**
- Every Turn moves someone because of what's shown. Ch12's Noam concession is the strongest.
- The Ch11 → Ch12 handoff happens in-world.
- The Principles are 113–124 words and testable.
- The Verdicts give the ruling first, and Ch9 and Ch11 are real open debates.
- Each catchphrase appears once.
- There are no links in dialogue and no frame leaks.
- Every callback holds, and every changed claim compiles on 7.0.2 (TS2540, Ch10's Turn, Ch12's reader call, Ch13's TS2722 and erased import).
- No chapter lost laughs.

What's left is below. Line numbers refer to b5c68ec.

## Must fix

1. **Ch7 — restore what fell outside the five areas.**
   - Restore the `:19` paragraph word for word, including "That is the whole of the syntax." and the concrete `string` reading.
   - Keep Linoy's "I'm going to need the board for that one." next to the new courier pointer (`:607`).
   - **Widened ruling:** cut the two link-only closers. `:522` (the 4.8 release-notes sentence) goes, so the section ends on Daniel's line. `:603` (the handbook sentence) goes, so the Verdict ends on its disagreement line. These count as part of the closer area.
   - Optionally, add one beat that makes the bio's "while she was already typing" literal (e.g. she's pasting the suggestion's example under the rejected body).
   - Leave Chen's `:443–457` alone in this PR: the benchmark wins.
2. **Ch8 — Daniel's catchphrase lands on the wrong beat.**
   - Right now Oded has already shown the TS2540, so "The compiler disagrees." answers someone the compiler agrees with.
   - New order: Linoy claims the selected fields will do, Daniel types the assignment and turns the laptop ("The compiler disagrees."), then the fence. This also takes one QA moment away from Oded.
   - Fix the narrator's "we" at `:19`, e.g. "Eli had promised a way to 'walk an object's keys.'" (or give it to Daniel).
   - Where it's cheap, give Oded cost arguments rather than tests: `:113–134`, `:297–305`.
3. **Ch9 — the trim tightened sentences but left the structure.** Do the structural cut and restore the cut lines that the argument depends on:
   - Move the audit cross-product ("Do we have a paid profile?", `:260–320`) to Additional Takes. It pairs with `Capitalize`, and nothing in the Turn depends on it. Check that "After this one…" still makes sense or goes with it.
   - Collapse `:213–223` ("which one ran" three times) into one exchange. Restore Gilad's comparison, e.g. "The old literal names got the search there faster.", which motivates Oded's Turn.
   - Restore the clause Oded answers at `:256–258` ("It won't list every write for you.").
   - Restore "the list beside the list it came from" (`:138`) and the concrete "`fontSizeChanged` gets the type of `fontSize`" (`:88`, no semicolon in speech). Fix "Linoy opens the controls and restore." (`:183`).
   - In Oded's "I'll take it." (`:381`), make it clear he's paying the cost of the mixed approach ("…I'll pay that.").
   - In The Debate Continues:
     - cut the leftover `:387` bookkeeping;
     - don't repeat the Turn's last exchange;
     - give Gilad one line on what each route costs him when he's tracing a log, since the Principle is his.
4. **Ch11 — the closer.** Eli's "The assignment is only the beginning of their agreement." is writerly, and Eli doesn't appear in Ch12. Use something concrete, e.g. "Then follow what each reference can do with it.", or end on Guy's handoff line.
5. **Ch12 — the narrator, the Verdict and repeats.**
   - Move the manual narration at `:242`, `:253` and `:403` into fence comments or a character's line, or cut it where the fence already shows it.
   - Cut Daniel's `:207` repeat of `:203`.
   - Verdict:
     - Guy names one or two boundaries, not a five-item symmetrical list.
     - Cut Eden's `:384` repeat of `:380` and end on Noam or a short Eden release line.
     - Settle who migrates: Noam's `:261` "I'll change its parameter" or Eden's "I'll migrate".
   - Change `:223` to "not a flag either package forgot".
   - `:17` shouldn't pre-state `:40`.
   - Optional: say whether the archive change has shipped (`:64` vs the opening crash).
6. **Ch13 — Chen, the ending and the narrator.**
   - **Chen still diagnoses and directs.** At `:112` he reads the trace, so give that to Gilad or Dima and let Chen ask, e.g. "Which file loads the plugin in this process?". Make `:174` a reframing question, e.g. "Does `renderBadge` know which constructor its label came from?". Chen shouldn't run both reproductions himself (`:104`, `:189`).
   - **The act ends on Oded's lecture** (`:338`). Keep "Whoever upgrades it." Give the conflict / `skipLibCheck` / overload-merge mechanics to Dima word for word (it's the refuted-and-correct claim, so don't change its content) or put them in a fence. End on Oded, with a joke or a result. Add a one-line note to CONSOLIDATED's refuted list saying where the line now sits.
   - **The Verdict closer** (`:278`) is still Gilad arranging tests. End on Oded's "A nicer error message isn't the feature." or on the stated result ("Both fresh processes print `* Ada *`").
   - **Manual narration** at `:66` (after the link sentence), `:83`, `:120` and `:221`: move it to fence comments or characters, or cut it.
   - Restore that the bypass "still compiles" with the optional member (`:252`).
7. **Ch10:456.** Noam's "both" is ambiguous, since only the courier paths have `isTrackingCode`. Name the paths.

## Optional, if it costs a line

- Ch9 Oded as learner (`:57`, `:122`, `:303`): turn one of those into a cost question.
- Ch12's paired textbook definitions (`:280`/`:325`, Guy's `:329`): let one arrive as a reaction.
- Ch13's headings: quote them like the other chapters, and rename "The other way in" if it doesn't describe its section.
- The "beside" tic in Act II stage directions: vary a few.

## Leave alone

- Chen in Ch7.
- Ch10's Turn heading position.
- The refuted items, whose content stays unchanged.

Run the checks for every moved fence, including the Ch9 audit move and any Ch13 line moves, then a clean `npm ci` and the full suite.
