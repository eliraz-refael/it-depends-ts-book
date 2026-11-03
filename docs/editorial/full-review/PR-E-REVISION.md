# PR E revision brief

2026-11-03, for draft eb2fc97. Two fresh Opus readers reviewed it:
- a [front-to-back reader](PR-E-READER.md);
- a [diff and technical recheck](PR-E-RECHECK.md).

Both found that:
- Every catchphrase appears once and is earned. Eden's answers the sitemap failure, and Gil's answers Oded's guess, which the data then refutes.
- Bonus 3 ends byte-exact on Oded's line. The Additional Takes heading is gone, and the chapter is 3.7% shorter.
- No dialogue contains a link, the fiction holds and the pronouns match the bios.
- The fences, refuted passages, CONSOLIDATED and the protected jokes are unchanged. All seven suites pass, and every moved checked fact is still checked.

What's left is below. Line numbers refer to eb2fc97.

## Must fix

1. **Cuts became fragments (Ch26, Ch27).** Several cuts replaced sentences with notebook shorthand, and by the Turn it reads as a drill:
   - **Ch26:** "Remove it: green.", "Annotation off: green.", "Back to `Paid | PreOrder`: green.", "Both files now appear.", "Oded tries Order:" (`:144–146`, `:165`, `:265`, `:398`, `:402`, `:416`).
   - **Ch27:** "`bench/case.ts`: the catalogue as…" / "`bench/tsconfig.json`: …" (`:149`), Gil's "Three serial runs, rotating order. No traces or profiles while timing. Medians below." (`:151`) and "Four alternatives, each with only its required helpers;" (`:153`).

   Write full sentences again, or turn some of the runs into summary narration ("He widens the parameter to `Order`, and the moved directive reports TS2578. With `Paid | PreOrder` restored, the check is green again."). Vary the shape so no two consecutive results read alike. Move Ch27's `case.ts`/`bench/tsconfig.json` description into comments in the fence it describes. Keep the word savings where you can, but sentences come first; report the final counts.
2. **Voice lost in compression.**
   - **Ch27 `:271`:** restore Linoy's old line, "My guess is we're spending the time relating arguments to that union."
   - **Ch25 `:284`:** restore "This noEmit check allows them. I'm not asking the release build to emit them." The new "won't emit them" is a different claim.
3. **Principles still spoil, or overlap (standard 1).**
   - **Ch25, Gilad:** "If the development run succeeds and the release run fails…" scripts the Turn, and "Rebuilding might remove the evidence" clashes with Dima's `:320`. Write it as a rule about the program you ship, from where it ships; his 3 AM framing fits. Possible version: "A release check runs the program we ship, from the place it will ship. Anything else is a rehearsal. When the two disagree, keep the failing setup intact until someone can say why. At 3 AM nobody is running your checkout." Still no question mark in the first sentence.
   - **Bonus 3, Daniel:** this one lists the chapter (the restored caller, the owner's decision, the runtime tests) and repeats Ch24's caller rule. Make it about believing the declarations rather than the summary: emit them before and after and read the difference. Don't name the inferred `string` or the widened fallback, because Oded's "No *written* public API changes" has to land as a discovery. About 40–70 words, with Daniel's dryness.
   - **Bonus 2, Liron:** remove the authenticated context, own records and generated-description preview, which spoil the Debate and the Turn. Fix "then check the effect against the permission it found", which reads as checking after acting. Keep the first sentence. End on something like "A description teaches the caller how to ask. It can't teach the executor whether to say yes." Avoid his Additional Take's wording (`:370`).
   - **Bonus 1, Eli:** cut "If two implementations pass but disagree on behavior you need, decide which one you mean and put the difference in the examples before the next attempt." That is the Turn. Change nothing else in this benchmark Principle unless the cut needs a joining word.
   - **Ch24 and Ch27, Daniel:** after the Bonus 3 rewrite, check that no two of Daniel's four Principles still share "same compiler and settings/options" or a first-person procedure. Ch27 and Bonus 2 both end on "…is useful, but…", so change one of them.
4. **Verdict rulings.**
   - **Bonus 3:** the ruling repeats Ch24's and misses its own Turn (a fix that removed a check). Use something like: "> When a patch makes a type error disappear, find what the error was protecting before you accept the repair. A fix that changes the contract is a contract decision, not a type-error repair."
   - **Bonus 1:** match its Turn (two passing implementations disagree) and don't anticipate Dima's `:368`. For example: "> When two implementations pass and disagree, the checks haven't decided the behavior. The owner decides, and adds the example that tells them apart."
   - **Ch27:** keep the ruling, and shorten Noam's `:313` to something like "And if we ever do drop a check, don't call it equivalent." That keeps the setup for the title change.
5. **Ch27's last line borrows the book's last line.** Oded's "Good. I'd hate to spend the saved time naming this PR." has the same shape as Bonus 3's final "Good. Now I have…". Replace it with an Oded line that doesn't start with "Good." and isn't a PR quip, such as "Approve it before someone asks me to benchmark the title."
6. **Bonus 3's folded takes.**
   - **Eden (`:243`):** move the parameter point after Oded's "Fine. That is a caller I hadn't checked." so Oded concedes the mobile caller on the page. For example: Eden: "Parameters break the other way. Narrow one, and a caller elsewhere that still passes a `string` fails. A search here won't find it."
   - **Daniel (`:213`):** cut "An unchanged alias line can acquire a different meaning.", which doubles the previous sentence.
   - Record in the review that you dropped the take's "declaration report" sentence.
7. **Bonus 2: the narrator steps on two lines.**
   - At `:180`, the narrator's "The ledger still prints dollars." takes Guy's "Still dollars." Change it to "The ledger prints the same dollar entry."
   - At `:84`, name the file: "…the handwritten description in `description.ts`:".
8. **Dangling and wrong references.**
   - **Bonus 1 `:121`:** "like the badge plugin's augmentation". No badge plugin exists anywhere in the book, so cut that clause.
   - **Ch25 `:118`:** Gil's "Both declarations have that text." is ambiguous, because the emitted `.d.ts` shows `#private`, not `#cents`. Use something like "Same name, same constructor. Look at the paths." The TS2741 fence stays byte for byte.
   - **Bonus 3 `:150` and `:341`:** these unattributed lines read as Oded continuing. Add labels for the actual speakers.

## Should fix

- **Silent closers.**
  - Ch26's Turn ends on "Noam removes it again." (`:404`), and Bonus 1's Debate ends on "He wants to finish checking…" (`:247`). Give both a spoken line.
  - Ch24 `:232` is optional; a result line is acceptable there.
- **Ch24.**
  - At `:140`, Daniel blames Noam for the repo's config. Use "The config doesn't set `strict`; TypeScript 7 defaults it to true…".
  - At `:199`, say they're added to the exception list.
  - At `:322`, change "Include the backfill" to "Add the backfill to the compiler's inputs".
  - Make Noam's reversal explicit at `:266`, as the reader proposed: "…I said the global check would catch this before deployment. It catches the files we haven't excused." Keep the catchphrase right after it.
- **Ch25.**
  - At `:15`, trim Dima's config speech to what plants the Turn (Node runs the built API; the release job copies it and its packages into an image). Put the module type and the links in one narrator line, and keep that fact checked.
  - At `:139`, "The type imports…" is used before it's shown. Say "Two imports that only need types…" or reorder minimally.
- **Ch26.**
  - At `:113`, "widen Paid" should be "widen `ship`'s parameter".
  - Record the `:23` project-comment placement as a departure, or move the facts into Noam's `:74` line.
  - Optional: give Oded a "type tests green" claim before `:357`, which the Verdict's question then pays off.
- **Ch27.**
  - At `:40`, put the emit command in a comment and have Gil report the result.
  - At `:76`, the banner is referred to before it's shown; reorder minimally or say "the banner we'll look at".
  - Merge Gil's `:99–101` and say "byte-identical".
  - At `:221`, mention `noEmit` off for the probe emit.
  - At `:269`, change "the relation event" to "a relation event".
  - At `:277`, add "of the CPU samples".
  - Record the Oded-guess speaker departure.
- **Bonus 1.**
  - Check `:95`: the config includes `reset.d.ts` before Idan creates it. Fix the order if it's real.
  - Cut `:63`'s version sentence if the pins are already shown and no check extracts it; otherwise move it into a comment.
- **Bonus 2.**
  - At `:134`, label the required lists unambiguously: "Zod's default (output) mode" and "io: input". Update the regex.
  - At `:157`, keep the Zod link in one narrator sentence, but drop "above" and "on 4.6.6". For example: "[Zod's guide](…) lists `ZodDefault` among the types whose input and output differ."
  - At `:201`, end the section on a spoken line.
- **Bonus 3.** Give the `:291` diagnostics to Noam, spoken. Keep `:372`/`:388` as they are.
- **Cadences.** Rephrase B1 `:239` and B3 `:86` ("Same X, same Y…") and keep B2 `:331`'s. Change B3 `:406` to "would satisfy that union." Cut one more ironic intensifier of your choice from B1/B2.
- **Bonus 1 check.** Assert that the only non-request blockquote is the one directly under `## The Verdict`, so an extra blockquote fails as it did before.

## Leave alone

- Ch26's `wrong` probe and the "What are we promising?" span. The plan protected the negative-usage control.
- Ch24's money coda; its Verdict depends on it.
- Ch26 `:289`, the Node link sentence. It's the substantive narrator carrier for the footnote.
- Ch25 Idan's "delete my arguments" pun, Ch26 Oded's "passed two different tests with one comment", Noam's "Yes." beats, and Ch27's and the narrator's "below".
- The catchphrase placements, the Bonus 3 ending and every item the readers listed under "Leave alone".

Run the checks for every changed fence, comment or extracted sentence. Then run a clean `npm ci` and the full suite, remeasure lengths, and record departures in PR-E-REVIEW.md.
