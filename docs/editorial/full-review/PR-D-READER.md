<!-- Fresh Opus reader, front-to-back read of Act III at 2a9429d, 2026-11-03. -->

## PR D reader report

I read the cast page, the end of Ch13, Ch14–23 in order, and FIX-PLAN. I also looked at PR-D-PLAN and book.diff, so I could tell which choices were deliberate. File paths below are relative to `.../scratchpad/prd/new/book/03-patterns-and-design/`. My probe scripts are in `.../scratchpad/prd/probes/reader/`: `closers.py` and `ch19sim.py`.

### NEEDS CHANGE (most important first)

**1. The six late Principles share one template (standard 1; the plan's "not six similarly shaped manifestos").**
- **Same structure.** Each is two paragraphs of 117–126 words. Each opens with a rule, then says the type or spelling can't tell you, then "go to a real caller and run both versions", then ends on an aphorism:
  - 05:5 "Its signature alone cannot establish that." / 05:7 "I would try the substitution at a real caller."
  - 06:5 "Neither spelling tells me which decisions…" / 06:7 "Start with a caller whose answer matters. Give both versions the same input…"
  - 07:7 "Show me the caller… Compare the calls through both versions… Similar-looking function types aren't enough…"
  - 08:5 "A function type can tell me which arguments fit. It won't show me…" / 08:7 "Start with a caller we have… Run that case through the original operation and through the wrapped one."
  - 10:7 "Write the caller before choosing the chain… The container's name isn't the explanation; follow the value."
- **Closers that nobody says aloud:**
  - 06:7 "Saving a few lines is useful only if the next person can still see what those lines do." This nearly repeats Ch8's Principle (02-advanced-typescript/02-mapped-types.md:7: "Saving three lines is pleasant, but…").
  - 08:7 "made the call easier to write and the incident harder to explain"
  - 09:7 "A record that only makes sense to the person who remembers the deployment hasn't kept the policy."
- **Ch22 (Liron) is the only one with its own shape.** It has a stated test and the Lisp aside.
- **Fix direction:** keep each first sentence, since the rules are good and testable, then break the shape.
  - **Sahar (Ch19):** two or three sentences. His bio says he "often says little."
  - **Gilad (Ch21):** open on his 3 AM question, e.g. "When this job says failed, can you tell me how many texts went out?"
  - **Daniel (Ch20):** drop the "show me the caller" paragraph, which is Sahar's move. Keep the definitions and the rule.
  - **Eli (Ch18 and Ch23):** let one of them stay longer and conversational. Note that Ch18 uses "establish" twice in three sentences.
  - Cut at least three of the closing aphorisms.

**2. Three Verdicts don't lead with a ruling (standard 2).** Every other Act III Verdict, Ch14–17, 19, 21 and 22, opens with a `>` ruling, so these three stand out.
- **Ch18, 05:371**, opens on narration: "Gilad has checked with the lead: …"
- **Ch20, 07:337**, opens on Dima's team minutes. The transferable ruling is at the end, 07:343: "An adapter that only holds an argument can stay in reporting. This one earns its entry point because the package owns the preparation." Generalize it and move it to the top.
- **Ch23, 10:354**, opens on Guy's "Ship the rename…"
- **Why they were missed:** PR-D-PLAN only asked for rulings in Ch14, 16, 19, 21 and 22, and says "No … Verdict rewrite" for Ch23.
- **Fix direction:** add one ruling line to each and change nothing else. For example:
  - Ch18: "Reuse only the part of a calculation whose inputs you have named; read changing inputs fresh and keep required effects outside the cache."
  - Ch23: "A method named `then` joins the promise protocol; give any other chaining operation its own name."

**3. Ch19's Turn ends on leftover material from the cut (06:264).**
- **The line:** Gil: "We compared fresh daily allowances and payouts that fit them, so this says nothing about balances that accumulate."
- **The problem:** nobody in the scene has proposed accumulating balances any more. The Turn now ends on a hedge about a scenario the reader never saw, which reads as a pointer to cut material.
- **Two smaller leftovers:**
  - 06:281 "agree on filling *for the reset*": "the reset" only means something in contrast to accumulation.
  - 06:11 "without arranging a treasury balance".
- **Fix direction:** the plan wants this boundary kept, so keep it without its own line. Fold it into Gil's result at 06:256, e.g. "Fresh allowance every day, every payout fits one: no payout paid later under skip. Some paid earlier." Then end the Turn on Dafna's "Today's patch still restores the old rule." Make 281 "agree on filling with support as a policy change." Make 11 "…without setting up an allowance."
- **Otherwise Ch19 reads as one complete story.** It has no other stubs, and Chen's carry-over question (06:59) still does real work for the multi-day replay.

**4. Ch15's "The Debate Continues" is real but lopsided (02:312–322).**
- **The imbalance:** Eden argues the case: migration of `moveStart` and the readers, the revisit condition. Noam gets one hypothetical sentence: "I don't want every future consumer converting back from the renderer's request shape." He then waves off the cost: "The method version handles the copying problem."
- **A loose end:** Oded's "whichever way we go" suggests the question is open, but Eden has already decided ("I'll put…").
- **Fix direction:** give Noam the concrete consumer that is already on the page. Eli's take (02:337) about restoring From and To from a shared link is a feature that retains a selection. Let Eden answer with Eli's point: link parameters are input and get parsed again anyway. Both sides then rest on something shown.

**5. Liron's catchphrase is followed by a gloss (04:246).**
- **The line:** "Complexity is a choice, not a necessity. The receipt keeps a quote. The panel asks for one."
- **The problem:** the two sentences after the phrase restate Dafna's previous line, so the phrase reads as a quotation with an explanation attached. Nobody answers it.
- **Fix direction:** cut the gloss and let Guy answer the phrase directly: "Then I'm choosing an interface. The panel depends on a current-price capability…"
- **Sahar's "Simple made better." (10:296) does land.** Guy's deflating "And the six screens?" turns it into an exchange, which matches the bio.

**6. Ch15 ends a section on narrator documentation (02:245).**
- **The paragraph:** "TypeScript's [object-type documentation](…) notes that `readonly` does not affect compatibility…" It closes "Keeping the checked object intact", against standards 3 and 6.
- **Fix direction:** the plan keeps the citation, so keep it but move it up. Put it after Noam's spread explanation at 02:223, so the section ends on Noam's "I'd pay that to keep an accepted selection intact."
- **Related, same chapter:** at 02:101 and 02:221 the narrator recites diagnostics ("`Property 'checked' is missing` is the start of this diagnostic."). Standard 6 says diagnostics go in code comments.

**7. Bookkeeping narration is left in chapters the plan named (standard 6).**
- **Ch18, 05:63:** "He replaces `Date.now` for this isolated test and restores it afterward". The try/finally already shows this, and these are the exact words the standard names.
- **Ch18, 05:223:** "As in the replays, he replaces the clock: …"
- **Ch22, 09:19–21:** an org-chart paragraph ("Dafna maintains the risk team's console… Eden owns the orders service… They jointly own the interface…") plus a paragraph about the logger's contract.
- **Ch16, 03:28 and 03:152:** these still read like a spec sheet ("The carrier's wire contract requires a nonempty status string…").
- **Fix direction:** cut 05:63 and 05:223 to one clause each. Give 09:19 to Dafna and Eden in a two-line exchange.

### Minor
- **Ch14, 01:169, section closer:** "Gil adds the committed-state check below the response check." This is a placement stage direction right before the Turn. End the section on a line, e.g. Gil: "Now let's see what the store kept."
- **Ch14, 01:7 and 01:70:** Guy opens the current implementation twice.
- **Ch14 and Ch17 Principles hint at their Turns.** 01:5 ("check whether they still need that rejection to stop or undo the work") and 04:7 ("Having just one writer doesn't make a live view into a snapshot"). These are benchmarks and the plan kept them, so this is a note only.
- **Ch15 Principle, 02:7:** has a redundant second "**Eli**:" label. Everywhere else, a continuation paragraph has no label.
- **Ch15, 02:84 and 02:86:** Noam says the key "belongs to this declaration" twice in a row.
- **Ch18:** Eli gives the Principle and never appears in the story.
- **Ch18, Chen:** he mostly reports runs ("That gives the right deadline. I tried it." 05:292; "Now it's 11:00Z…" 05:348). He isn't lecturing, but he's doing Gil's job. "Whose nine?" (05:272) is perfect Chen.
- **Ch19, 06:254:** "not just the time it takes to empty the queue" rebuts an argument nobody made.
- **Ch17 Verdict, 04:348:** it's a ruling, but specific to this team rather than transferable.
- **Spec-sheet lines in speech:**
  - 09:249, Eden on format 1 and 2 ("The reader supplies seven for them. Format 2 allows…")
  - 08:284 and 08:345, Guy
  - 03:323, Noam
  - 10:143, Dafna's three-way list (Res / arrays / promises)
- **Ch23 Principle, 10:5:** "Plain is relative here: an array is an ordinary payload inside a Result." This is clunky. The old Principle's "lovely complication" had more life, though it spoiled the Turn.
- **Two catchphrases appear nowhere in the book:** Gil's "What does the data say?" and Eden's "I've seen this fail at scale." If they were allocated to Act III, natural places are Ch22's request table (09:305) and Eden on the host image (05:294). If PR E owns them, ignore this.
- **Places that drag:**
  - Ch17's post-Turn "Trying a promotion" coda (04:293–344)
  - Ch18's TTL-plus-table stretch (05:118–232)
  - Ch21's `RetryingSender` detour (08:218–240)
  - Ch23's repair negotiation (10:245–334)
  - Ch22's format-version passage (09:247–249)

### Checks that passed
- **Turns:** all ten turn, and each in its own place.
  - Ch14: Dafna moves the catch.
  - Ch15: Noam gives up the order check as grounds for removal.
  - Ch16: Oded on skip versus never.
  - Ch17: Guy's frozen view.
  - Ch18: Dafna's "pure" `deadlineFor`.
  - Ch19: Dafna moves to filling.
  - Ch20: Linoy on setup doing work.
  - Ch21: Idan and Oded on cancellation not permitting a repeat.
  - Ch22: Dafna on the replay versus the tree.
  - Ch23: Linoy's `then`.
- **"Where's the interface?"** appears once, in Ch8 (02-advanced-typescript/02-mapped-types.md:71), plus the bio.
- **Catchphrases:** "Complexity…" appears once (04:246) and "Simple made better." once (10:296).
- **The river (04:68–70)** is short and interrupted, and Eden's hijack of it is a real laugh.
- **Pronouns match the bios:** Idan, Dafna and Linoy are she; Noam, Eden and Sahar are he.
- **Callbacks are all in-world and accurate:**
  - Ch14:25 recalls Ch5's request-handler argument. Dafna really was in it (Ch5:211).
  - Ch14:104 recalls the courier `Result`, whose error is `unknown` (Ch10:21–23).
  - Ch15:86 recalls `UserId`'s `__brand` (Ch3 03-interface-vs-type:434).
  - Ch21:353 recalls the courier's lost overload (Ch10 `Parameters`).
  - Ch23:33 ("same union shape as booking").
- **Ch19's removed material:** a whole-book grep for payout, reservation, starvation, accumulation, finance, deposit and `fillThenReserve` finds nothing outside Ch19.
- **Fiction:** no "the book", no chapter numbers, no "in the review".
- **Links:** none in dialogue. The only link left in Act III is Ch15:245.
- **Numbers I recomputed:** Ch19's 78,125-case claim (0 combinations where skip pays anyone later; 44,656 where it pays someone earlier), Ch18's time-zone table, and Ch22's 5 holds, 2 extra holds and 3 large orders.

### Fun
- **Laughed:**
  - Ch23: "So the stock check has answered. The worker is waiting for an answer about whether it answered." / "And I taught it to say nothing on no."
  - Ch21: "Please tell me the customer didn't get the message." / "Which copy?"
  - Ch15: "I was about to ask for named arguments. We have named arguments."
  - Ch16: "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived."
  - Ch22: "It gave the policy an alibi."
- **Smiled:**
  - Ch16: "I meant don't refund it automatically. I gave it the answer for don't refund it at all."
  - Ch18: "We have one support team, not three calendars." and "whose nine?"
  - Ch19: "I translated the total, but lost the stop."
  - Ch20: "The zero wasn't my default."
  - Ch21: "That's two fewer texts."
  - Ch14: "I don't want them picking by autocomplete."
- **The benchmarks still hold.**
  - Ch14 is livelier than before: the narration that became dialogue feels natural, and "Same message, different store" is still the best Turn line in the act.
  - Ch15 is intact apart from the soft ending and the stalled link paragraph.
  - Ch17 is better with the river, and weaker only at 04:246.
  - Ch23 is still the best chapter in the act.

### Verdict on readiness
Act III is close, but not quite ready. The stories are sound: every Turn turns, the benchmarks kept their jokes and their discoveries, and the continuity is clean. The Ch19 cut also worked, apart from one leftover line. What remains is a small, mechanical pass:
- break the shared template across the six late Principles (the largest item, and the one a front-to-back reader will feel);
- add ruling lines to Ch18, 20 and 23;
- fold Gil's line about accumulating balances into his result line and end Ch19's Turn on Dafna;
- give Noam's dissent in Ch15 something concrete;
- trim the remaining bookkeeping narration in Ch18 and Ch22.

None of this touches code or scene structure, so Act III should be ready after one more draft and a targeted recheck.
