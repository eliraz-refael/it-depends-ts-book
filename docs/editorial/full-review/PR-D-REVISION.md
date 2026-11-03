# PR D revision brief

2026-11-03, for draft 2a9429d. Two fresh Opus readers reviewed it:
- a [front-to-back reader](PR-D-READER.md);
- a [diff and benchmark recheck](PR-D-RECHECK.md).

Both found that:
- All ten Turns turn, and the benchmarks keep their jokes and discoveries.
- The Ch19 cut reads as one story. A whole-book grep finds nothing that refers to the removed material, and the 78,125-case claim reproduces independently.
- Every callback is accurate, and the brand, catch and `Result` claims compile.
- The catchphrases are once each, the refuted passages are untouched, and no links remain in dialogue.

What's left is below. Line numbers refer to 2a9429d.

## Must fix

1. **The six late Principles share one template (Ch18–23).** Both readers raised this independently. Each has a rule, then "the signature/type can't tell you", then "start with a caller and compare both versions", then a closing aphorism. Ch20 nearly repeats Daniel's own Ch10 Principle.
   - Keep each first sentence; the rules are good and don't spoil their Turns.
   - Break the shape so each expert sounds like himself:
     - **Sahar (Ch19):** two or three sentences; he "often says little". A removal angle fits him ("what if we deleted the rewrite?").
     - **Daniel (Ch20):** the definitions and the rule, ending on his old line "Splitting the parentheses doesn't make those decisions for you." That line gives nothing away. Drop the "show me the caller" paragraph.
     - **Gilad (Ch21):** open on his on-call question, e.g. "When this job says failed, can you tell me how many texts went out?"
     - **Liron (Ch22):** lean on his image and code-as-data aside, which is already his own shape.
     - **Eli, Ch18 and Ch23:** let one of them run longer and conversational, and keep them different from each other. Ch18 uses "establish" twice in three sentences.
   - The caller-first move stays in at most two chapters, the "type can't tell" closer in at most one, and at least three of the closing aphorisms go. "Saving a few lines…" also echoes Ch8's Principle.
2. **Three Verdicts don't lead with a ruling: Ch18 (`05:371`), Ch20 (`07:337`) and Ch23 (`10:354`).** Add one `>` ruling line to each and change nothing else.
   - Ch20's transferable ruling already exists at its end (`07:343`): generalize it and move it to the top.
   - Possible lines:
     - Ch18: "Reuse only the part of a calculation whose inputs you have named; read changing inputs fresh and keep required effects outside the cache."
     - Ch23: "A method named `then` joins the promise protocol; give any other chaining operation its own name."
   - I'm authorizing these benchmark-adjacent additions.
3. **Ch19 leftovers from the cut.**
   - Gil's boundary line (`:264`) now ends the Turn on a hedge about a scenario the reader never saw. Fold it into his result at `:256` (e.g. "Fresh allowance every day, every payout fits one: no payout paid later under skip. Some paid earlier."), and end the Turn on Dafna's "Today's patch still restores the old rule."
   - Change `:281` "filling for the reset" to "filling with support as a policy change".
   - Change `:11` "without arranging a treasury balance" to something that doesn't imply a treasury.
   - Fix the harness comment at `checks/chapter19.cjs:242`: the induction is gone.
4. **Ch14: the request-handler recall is misplaced (`:23–25`).** Ch14 has no request handler with an outside caller, so Dafna's line borrows Ch5's role. It also restates her goal a third time, and "Show me where you catch it" is followed by a fence with no catch.
   - Cut `:23`. Let Guy's question at `:21` lead into the library fence.
   - Move Guy's recall to sit next to Dafna's catch (just after `:104`/`:112`), e.g. "We argued about who catches the parser's failure. There the handler owned the response. Here the store has to see it too."
   - Smaller Ch14 fixes:
     - `:269` should say it returns the known refusal and lets anything else escape.
     - `:70` duplicates `:19`'s "Guy starts with `bookParty`".
     - `:169` ends the section on a stage direction. One spoken line is fine, e.g. Gil: "Now let's see what the store kept."
5. **Ch15.**
   - **The Debate Continues is lopsided.** Give Noam the concrete consumer already on the page: Eli's take (`:337`) about restoring From and To from a shared link is a feature that retains a selection. Let Eden answer with Eli's point, that link parameters are input and get parsed again. Then both sides rest on something shown. Oded's "whichever way we go" must match: Eden has already decided for these consumers.
   - **Move the link paragraph** at `:245`, which closes a section on documentation, up after Noam's spread explanation (`:223`), so the section ends on Noam's "I'd pay that…".
   - **Diagnostic recitals** at `:101`/`:221` go into code comments.
   - Tighten `:86`, which repeats `:84`'s "belongs to this declaration".
   - Remove the redundant second `**Eli**:` label in the Principle (`:7`).
6. **Ch17: Liron's catchphrase has a gloss attached (`:246`).** Cut "The receipt keeps a quote. The panel asks for one." and let Guy answer the phrase directly ("Then I'm choosing an interface. The panel depends on…").
7. **Bookkeeping narration (standard 6).**
   - Ch18 `:63` ("replaces `Date.now`… and restores it afterward"; the `finally` shows it) and `:223`: one clause each, or cut.
   - Ch22 `:19–21`: turn the org-chart paragraph into a two-line Dafna/Eden exchange.
   - Ch16 `:28`/`:152` read as a spec sheet. Make them a line or a comment, and make Eden's `:71` an exchange rather than a monologue.
   - Ch18 `:330`: "// Replaces the earlier makeSla; the export below is rebuilt with it."

## Also take

- **Ch21 Verdict (`:343`).** Restore the cooperative signal and "called through its instance" in a clause of Oded's line, and avoid restating Guy's reconciliation sentence.
- **Ch21 `:353`.** Eli wasn't in the courier scene, so say "when Idan derived its signature".
- **Ch23.** Restore "No registration required. You can join a language protocol just by choosing a method name." as an Eli line after the reveal, where the scene has earned it (after Dafna's `:198`/`:210`). That keeps the benchmark's laugh without spoiling the Turn. I'm authorizing it.

## Leave alone

- The Act IV catchphrases (Gil's and Eden's); they're PR E's.
- The Ch14/Ch17 Principle hints the readers noted. They're benchmarks and were already judged fine.
- The Ch19 length (−26.7%).

Run the checks for every changed fence or comment, then a clean `npm ci` and the full suite.
