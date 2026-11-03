<!-- Fresh Opus reader, front-to-back read of Act II at b5c68ec, 2026-11-03. -->

## PR C reader report

I read the cast page, the end of Ch6, Ch7–13 in order, and the FIX-PLAN standards. I also diffed `old/` against `new/` to see what PR C actually changed. I wrote no files and edited nothing.

### NEEDS CHANGE (most important first)

1. **Ch8 02-mapped-types.md:241–253: Daniel's catchphrase doesn't land.**
   - Linoy claims "Then the selected fields should do." (239). Oded then reports "I tried using your `EditableFields`. I can't edit them." and shows the TS2540 error himself. Only after that does Daniel say "The compiler disagrees."
   - By then the compiler has already agreed with the person who just spoke, so the line reads as a quotation of a catchphrase, not a result that contradicts a claim. The bio has him turning his laptop around on a claim.
   - Fix: cut Oded's discovery. After Linoy's line 239, Daniel types the assignment, turns the laptop and says "The compiler disagrees." Then show the fence. This also removes one of Oded's QA moments (see minor items).

2. **Ch9 03-template-literal-types.md: the trim was sentence-level, not structural, so the middle is still a slog.**
   - The chapter went from 2,243 to 2,072 words, and that count includes the new ~115-word Principle. It still has the same five Debate subsections.
   - 213–223 is three rounds of the same point: "Now I have two places to inspect. I still don't know which one produced my line." / "Writing out the event name wouldn't tell you which one ran either." / "I still need logs or a reproduction."
   - The audit subsection (260–320, "Do we have a paid profile?") is a dead end. It opens a new example, solves it, and shelves it with "After this one." Nothing in it feeds the Turn.
   - Fix: move the audit cross-product to Additional Takes (it pairs naturally with `Capitalize`). Cut 217–223 to a single exchange.
   - The opening and the Additional Takes are fun now; the middle 140–320 still drags.

3. **Ch9:379–391: the Turn's last exchange and "The Debate Continues" are muddled.**
   - Linoy: "Once you know where settings writes live, this is one extra naming choice to explain." Oded: "One naming choice for three calls. I'll take it."
   - "I'll take it" reads like a concession to Linoy. He actually means he will pay that cost to keep the literal names. The disagreement then restated at 389–391 looks like it was already settled.
   - Gilad owns the Principle ("take a name from a log and try to find those producers"), yet his last word is 375 ("the control path still won't appear"). He never says whether the result passes his test.
   - 387, "For these literal calls, the preview still receives a number for `fontSizeChanged`.", is leftover bookkeeping from the old Verdict.
   - The disagreement itself is real but thin (three `publish` calls).
   - Fix:
     - make Oded's line unambiguous, e.g. "…I'll pay that.";
     - give Gilad one line in the Debate Continues on what each route costs him at 3 AM;
     - cut 387.

4. **Ch13 07-declaration-merging.md:338: Act II ends on Oded giving a compiler lecture.**
   - The line: "Whoever upgrades it. If their declaration requires `frame`, our optional one conflicts. That error is in `labels.ts`, so `skipLibCheck` won't hide it. But two required method signatures can merge as overloads without an error. A clean build isn't a reminder to remove the patch."
   - The first sentence is perfect Oded; the rest is Daniel's register in Oded's mouth, ending on an aphorism.
   - Fix: keep "Whoever upgrades it." Give the overload-merge mechanics to Dima, or put them in a fenced example. End on an Oded joke or a result, e.g. a calendar or ticket line.

5. **Ch13: Chen still diagnoses and directs (Chen in Ch13 was a PR C item).**
   - 112: "**Chen**: 'First line in `renderBadge`. The batch never loads the plugin.'" This answers Gilad's "Show me the stack trace." with the diagnosis.
   - 174: "Try the entry that calls our formatter." This is a directive.
   - Chen also runs both reproductions himself (104, 189), which makes him the tester.
   - His good lines are 157 ("You're past twelve. And can the next entry still import the original constructor?") and 336 ("Who removes our patch when the plugin ships its own declarations?").
   - Fix: Gilad or Dima reads the trace. Chen asks "Which file loads the plugin in this process?" instead. Make 174 a question that reframes, e.g. "Does `renderBadge` know which constructor its label came from?"

6. **Ch7 01-conditional-types.md:522 and 603: sentences that exist only to carry a link, used as closers (standards 3 and 5).**
   - 522 ends the "Who reads the error?" section: "The change and its effect on generic assignability are described in the [TypeScript 4.8 release notes](…)."
   - 603 ends the Verdict: "The [handbook's conditional-type example](…) starts with the same three-overload alternative."
   - PR C removed this exact pattern from Ch11 but left Ch7 alone.
   - Fix: cut 522 so the section ends on Daniel's line 520. Cut or fold the 603 sentence so the Verdict ends on "A union caller alone does not settle their disagreement."

7. **Ch12 and Ch13 still have manual-style narration ("narrator and links in Ch12–13" was in scope).**
   - Ch12 06-variance.md:
     - 242: "The direct call and the inferred forwarding adapter are now both rejected. Copying a named cache also fails." The fence right below shows exactly this.
     - 253: "He brings back the version that only returns a label. Its parameter is still `ResultCache<ExportResult>`. The CSV call gets the same error."
     - 403: "Linoy changes the type parameter to `in out S extends Partial<ExportSpec> = {}`. The methods and runtime guards stay as written." This is configuration in narration; it belongs in a fence comment.
   - Ch13:
     - 83: "Its configuration includes both of them, the shared function, and `label-frame.d.ts`." This is project config in narration.
     - 120: "The old `label-frame.d.ts` is removed." Bookkeeping.
     - 221: "This replaces the required member; they aren't merging both spellings." Bookkeeping.
     - 66: "Once the augmentation is in the compiler's program, other files using that `Label` see the added member too." The link sentence there is fine; this follow-up sentence reads like a manual.
   - Fix: move each into a fence comment or a character's line, or cut it.

8. **Ch8:19: the narrator says "we", which breaks the fiction.**
   - "Eli had promised we could 'walk an object's keys.'" The callback itself (to Ch6:357) is nice.
   - Fix: give it to Daniel. "**Daniel**: 'Eli promised we'd walk an object's keys. Here's the first one.'"

9. **Ch12:378–384: the Verdict dialogue is a symmetrical list and repeats itself.**
   - Guy, 378: "Receipts get a CSV reader. Labels get a general reader. The CSV publisher gets a CSV writer, and the archive action gets a writer that accepts general results." Nobody lists five symmetrical items like that out loud.
   - Eden then speaks twice (380 and 384). 384 restates 380: "The archive action gets the download cache. The receipt keeps its rows." This line replaced an old silent closer, but it's a repeat.
   - Fix: let Guy name one or two boundaries. Cut 384, and end on Noam's 382 or on a short Eden line about the release.

10. **Ch7:443–457: Chen lectures and quizzes.**
    - "Two more things this machine does quietly. First: …" He then explains the `switch` and exhaustiveness behaviour and ends "Has anyone worked out what warns you?" That is a teacher's quiz, and Chen is the one supplying the content.
    - His questions at 399, 420, 472, 540–554 are exactly right.
    - Fix: let Chen ask one bare question, e.g. "What does `Exclude<Channel, "smss">` give you?", and let Daniel or Linoy run it and explain.

11. **Ch11 05-advanced-generics.md:464: the handoff works, but the last line is an aphorism nobody says out loud.**
    - Guy's 462 hands off to Ch12's cache inside the story, and Ch12:17 picks it up ("Guy has brought the export runner's cache, as promised"). Good.
    - Eli's closer, "The assignment is only the beginning of their agreement.", is writerly.
    - Fix: end on Guy's 462, or give Eli a concrete line, e.g. "Bring both callers. And whoever got paged."

### Minor

- **Oded as QA assistant, Ch8:**
  - He checks the parser (113–119), asks "What about `{}`?" (134), finds the readonly error (241), and loads the fixture and clicks Save (297–305).
  - His cost voice is good at 219 ("I can read all three while you're explaining the override"), 423 and 471.
- **Oded as learner, Ch9:** 57 ("And `& string`?"), 122 ("Where did it get `number`?"), 303 ("The brackets at the end?"). These are setup questions for the explanation rather than cost arguments.
- **Ch12 textbook definitions:** 280 and 325 are paired definitions ("That's covariance… The direction stays the same." / "Now the direction reverses… That's contravariance."), and Guy's 329 is a symmetrical aphorism ("The label receives a value. The runner supplies one."). Consider letting one definition arrive as a reaction.
- **Ch12 timeline:** the opening crash (11, 87 "the person who gets paged") versus "Eden opens the archive change" (64) leaves unclear whether the archive change has shipped.
- **Ch12 near-catchphrase:** 89 "There's even an annotation for that" and the heading at 124 echo Linoy's catchphrase. It works as a wink, but it softens the once-only rule.
- **Ch10 04-infer-keyword.md:404:** "Eden expands the integration module's existing export." The verb is unclear. Lines 168 and 341 are also mild manual narration.
- **Ch13 headings:** they are unquoted ("The other way in", "A smaller program"), unlike every other chapter's quoted headings, and "The other way in" doesn't describe its section.
- **Mild Principle spoilers:**
  - Ch13:7, "represent the uncertainty and decide what the caller should do when the operation is missing", previews the optional-member Verdict.
  - Ch11:7, "the operation we must forbid, the one we must still allow", previews the Turn.
  - Neither gives away the actual trap.
- **Repeated formula in Ch13:** the Principle (7, "Neither a stronger declaration nor a friendlier error…") and the Verdict (272, "neither spelling loads a plugin") use the same "neither…nor" shape.
- **"beside" tic:** it appears 7 times in Act II stage directions (Ch8:75, 161, 353; Ch9:155; Ch10:168, 293; Ch13:17).
- **Cast spread:** Liron never appears in Act II, Gil speaks only in Ch7, Sahar has 2 lines (Ch10), and Daniel gives 3 of the 7 Principles. Ch8's Principle ("Ask the owner of the second type…") is closer to Guy or Eden than to Daniel.
- **Ch8:429:** the Verdict narration is a four-item manual-style summary.

### Checks that pass

- **Turns.** Every Turn moves someone because of something shown. None leaves everyone where they were.
  - Ch7: Linoy, "All right. That works here." (581).
  - Ch8: Guy, after deleting `bio`, "I'll take that check." (399). This one is modest.
  - Ch9: Oded drops the constants object and keeps the setter (342, 365). This is small.
  - Ch10: Idan, "It told us about the overload and believed us about this." (272); Eden follows at 394.
  - Ch11: Guy, "Then the guard is for typed callers too." (430); Dafna partly, "something to weigh" (407).
  - Ch12: Noam, "You're right. My repair rejects a caller we still support." (261). This is the strongest one.
  - Ch13: Dima, "My smaller build caught the direct call. It can't catch this one." (209); Oded at 268.
  - The weakest are Ch8 and Ch9.
- **Debate Continues.** Ch11's is real on the page: Guy and Dafna each have evidence and Oded supplies the cost. Ch9's is real but small and muddled (item 3).
- **Ch12 jokes.** Ch12 now clears the bar of two lines that make you smile:
  - 197: "I added a counter, Linoy. I wasn't trying to write a compiler test."
  - 263: "Thank you. Your one-line fix was getting expensive for everyone else."
  - 221: "It doesn't repeal the method exception."
  - None of them is a real laugh.
- **Best lines in the act:**
  - Ch7:79 "I was hoping it was his problem."
  - Ch7:258 "So it lies, but it only lies in one place… That's most of my architecture."
  - Ch7:371 "none of them were mine"
  - Ch8:305 "needs an email address to tell us they write software?"
  - Ch8:423 "innocent text box to blame"
  - Ch9:252 "I have survived that before."
  - Ch9:433 "It has been very loyal to fourteen."
  - Ch10:95 "Your parcel is still in transit."
  - Ch10:475 "we're still calling it `Safe`"
  - Ch11:260 "the same spread with different packaging"
  - Ch13:155–157 "Can we merge twelve lines now?" / "You're past twelve."
- **Where it drags:**
  - Ch7:434–441 (the `any`/`unknown` edge cases);
  - Ch8:140–153 and 311–345 (`exactOptionalPropertyTypes`, then `changedFields`);
  - Ch10:303–337 (the second Proxy);
  - Ch11:87–137;
  - Ch12:288–372;
  - Ch13:159–174.
- **Catchphrases.** Each appears exactly once in the whole book, all three in Act II:
  - Linoy's, Ch7:227, lands well, and Daniel's "A suggestion." matches her bio;
  - Eli's, Ch11:387, lands as a question that reframes;
  - Daniel's, Ch8:253, is the problem in item 1.
- **Principles.** Ch8–13 run 113–124 words. Each states a testable rule up front in an expert's voice.
- **Verdicts.** Ch7, 8, 10, 12 and 13 each give the ruling first.
- **Fiction and links.** No "the book" or chapter numbers inside the fiction, no "in the review" endings, and no links inside dialogue.
- **Pronouns.** They match the bios (Idan is "she" throughout Ch10).
- **Continuity.** Every callback checks out:
  - Act I: Ch1:647 `Unwrap`; Ch6:181 Daniel on `extends`; Ch6:86 `logPayload`; Ch1:406 `user:login`; Ch3:119 the widget `User`; Ch4:190 `as const`; Ch6:357 "walk an object's keys".
  - Within Act II:
    - Ch7:607 hands `Unwrap` on to Ch10:82;
    - Ch8:471 "another PR" leads to Ch9:11;
    - Ch11:462 hands the cache to Ch12:17;
    - Ch11:191, Dafna's source-only parameter, returns at Ch12:417;
    - Ch11's `sourcePreset`/`lessSpecific` returns in Ch12's Additional Takes.
  - Nothing is used before it's introduced, and I found no contradictions beyond the Ch12 timeline ambiguity.

### Verdict

Act II is close but not ready. The structure works: every Turn turns, the Ch11→Ch12 handoff happens inside the story, the Principles are stated and testable, the Verdicts give their rulings first, and the catchphrase allocation is right in count. Ch12 now has some life, and Ch7, Ch10 and Ch13 are fun. Most of what's left is a few hours of local edits:

- Daniel's catchphrase landing on the wrong beat;
- Chen diagnosing in Ch13 and lecturing in Ch7;
- the act ending on Oded's lecture;
- Ch7's link-only closers;
- the remaining manual narration in Ch12–13;
- the narrator's "we" in Ch8;
- the duplicated Ch12 Verdict lines.

The one structural job is Ch9: its trim tightened sentences but left the dead-end audit section and the repeated "which one ran" middle, so it is still the act's slowest chapter. Fix items 1–7 and Act II is ready for joint approval.
