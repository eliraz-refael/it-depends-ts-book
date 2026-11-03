<!-- Fresh Opus reader, diff and continuity recheck of PR C (b5c68ec vs 77fc1c4), 2026-11-03. -->

## PR C diff recheck report

Paths below are relative to `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/prc/`. Line numbers are in `new/book/02-advanced-typescript/`. The probes are in `probes/diff/ch8`, `ch10`, `ch12` and `ch13`, all compiled with tsc 7.0.2 under the stated profile. The worktree `book/` is identical to `new/book/` (checked with `diff -rq`).

### NEEDS CHANGE (most important first)

**1. Ch7 `01-conditional-types.md:19`: a trim outside the five allowed areas.**
- New text: "…*is the type on the left assignable to the type on the right?* The answer selects a branch: the first if assignable, the second otherwise."
- Old text: "…The compiler answers, and the answer selects a branch. **That is the whole of the syntax.** If a value of type `T` would be accepted where a `string` is required, the result is the first branch. Otherwise it is the second."
- Problem: Settlement 1 allows edits only to the Principle *rule*. Nothing else may be trimmed or re-voiced. This paragraph is the explanation after the rule.
- It is also weaker. It loses Eli's crisp "That is the whole of the syntax." and the concrete `string` reading. What replaces them reads like a manual.
- Fix: restore the old paragraph word for word. Ch7 stays well inside 5% (+1.9% words, +1.7% lines even without this trim).

**2. Ch8 `02-mapped-types.md:239–253`: "The compiler disagrees." reads as a reply to Oded.**
- Order on the page:
  - Linoy: "Then the selected fields should do."
  - Oded: "I tried using your `EditableFields`. I can't edit them."
  - the TS2540 fence
  - Daniel: "The compiler disagrees. `Pick` preserves…"
- Problem: the nearest claim is Oded's, and the compiler *agrees* with him. The plan says the catchphrase "must not contradict Oded saying he cannot edit them". The bio says Daniel uses it when a result contradicts a claim.
- Fix: aim it at Linoy, for example "**Daniel**, to Linoy: "The compiler disagrees."". Or move Linoy's claim so it sits directly before the fence and Daniel.

**3. Ch9 `03-template-literal-types.md:256–258`: a trim broke a reply.**
- Linoy: "And `eventNames[key]` still takes you to a generic caller."
- Oded: "I wasn't asking it to. I want somewhere to start."
- Problem: "asking it to" pointed at the cut clause "It won't list every possible write for you." Now it has nothing to point at.
- Fix: put the clause back, e.g. "…a generic caller. It won't list every write for you."

**4. Ch9 `:221`: Gilad's comparison with the literal names was cut.**
- New: "I still need logs or a reproduction. First I need to find the code."
- Cut: "Your search got us there faster in the old version."
- Problem: that was the argument behind Linoy's reply at `:223` ("What would you search for inside it?"). It also motivated Oded's Turn ("why can't I keep the strings?"). Without it, Gilad's Principle has no concrete instance in the scene.
- Fix: restore one short sentence, e.g. "The old literal names got the search there faster."

**5. Ch13 `07-declaration-merging.md:278`: the Verdict still ends on Gilad arranging tests.**
- Text: "Two fresh processes, then. No web setup doing the batch's work for it."
- Problem: the plan says to end "on Oded's printing requirement or the two fresh-process results, not Gilad arranging tests". This is the cut stage direction turned into speech. It also repeats Gilad's earlier "Keep those tests separate…" (`:146`).
- Fix: end on Oded's "A nicer error message isn't the feature." Or end on a stated result ("Both fresh processes print `* Ada *`").

### Minor items

**Ch7**
- `:607` (Unwrap pointer): the pointer works. Ch10 has Idan deriving the wrapper and Daniel bringing back "his" `Unwrap` from Ch1. But Linoy's laugh line "I'm going to need the board for that one." was dropped. Keeping both would cost about 8 words.
- `:229` (bio check): the bio says "a distinction Daniel has had to make while she was already typing". The page now has the distinction: Daniel says "A suggestion. It doesn't make this body pass." But Linoy is opening and switching tabs, not typing. It is close enough unless the author wants it literal; one beat inside the RFC exchange would do it, e.g. "already pasting its example under the rejected body".
- `:310` closer: "Including the empty array, Oded." hands Noam's request to Oded. It reads as ribbing and is acceptable.

**Ch8**
- `:19`: "Eli had promised **we** could…" makes the narrator part of the team. That's the only first-person narrator line in the chapter (Ch1:634 has an older one). Use "Eli had promised a way to "walk an object's keys."" The quoted words do match Ch6:357 exactly.

**Ch9**
- `:379–381` and `:389–391`: the Debate Continues repeats the Turn's last exchange. Linoy's "I'd still use the wrapper in both" becomes "I'd use the wrapper for restore too", and Oded restates his position. Make the closing pair add something, or cut one of the two.
- `:381`: "One naming choice for three calls. I'll take it." could be misread as Oded accepting Linoy's wrapper. It means he accepts the cost of the mixed approach.
- `:138`: "Yes. I'm removing the duplicate list." is weaker than the old line "I want to stop maintaining the list beside the list it came from." Restore the old line.
- `:88`: the concrete teaching example "So `fontSizeChanged` gets the type of `fontSize`" was lost. The new line is manual-like, with a semicolon in speech.
- `:183`: "Linoy opens the controls and restore." is awkward.
- Prose excluding fences went from 1688 to 1517 words (−10%). Leaving out the new ~114-word Principle, the body cut is about 17%, a little over the 10–15% target. No lesson or reset was lost: the scratch file, the parsed `saved`, the replacement restore, both searches and the union-key hole for both `publish` and `setSetting` are all still there.

**Ch10**
- `:456`: the decision now ends on Noam, not Idan's acceptance as planned. The line works as a joke, but "both" is ambiguous, since only the courier paths have `isTrackingCode`.
- `:216–218`: the Turn heading splits Eden's "It returns a boolean." from Noam's "The declaration does." It follows the plan ("immediately before 'Run it with `bad`'") and is readable.

**Ch11**
- `:464`: Eli's "Bring both callers. The assignment is only the beginning of their agreement." is vague. It also promises a scene Eli isn't in: he doesn't speak in Ch12. Suggest "Then follow what each reference can do with it." Guy's half of the handoff lands at Ch12:17 ("as promised").

**Ch12**
- `:207`: Daniel says the same thing twice in three lines (`:203` and `:207`). Cut `:207` and let the section end on Eden's closure line (`:205`).
- `:384`: Eden's Verdict closer repeats his own line at `:380` ("the archive action needs the download cache").
- `:17`: the new sentence "the receipt and download panel share the latest result" pre-states the paragraph at `:40`.
- `:223`: "not a flag your other package forgot" answers a suspicion nobody raised, since Eden said both packages are strict. Try "not a flag either package forgot."
- `:261` and `:380`: Noam says "I'll change its parameter" and Eden later says "I'll migrate the consumers". Who owns the work is slightly muddled.
- Settlement 3 ("at least two smiles"): met, but thinly. The lines are "I added a counter, Linoy. I wasn't trying to write a compiler test.", "…And the next copy. No, I don't want to approve every test fixture…" and "Your one-line fix was getting expensive for everyone else."

**Ch13**
- `:338`: refuted item. Chen's `skipLibCheck` line is kept word for word but now belongs to Oded, as the approved plan says. The technical claim is untouched. CONSOLIDATED still calls it "Chen's skipLibCheck line", so update the record.
- `:252–254`: the new text no longer says the bypass *still compiles* with the optional member. My probe shows it does. Consider "It still compiles."

**Ch7 links (deferred, not a defect)**
- `:522` (the 4.8 release-notes carrier sentence) and `:603` (the handbook sentence) remain, because Settlement 1 limits Ch7's changes. They break FIX-PLAN §5, so note them for the print-footnote pass.

### Lost value

| Ch | Lost from old | Now | Hurts? |
|---|---|---|---|
| 7 | Eli: "That is the whole of the syntax." plus the concrete `string` reading | compressed (item 1) | **Yes.** Benchmark voice, and outside the allowed areas |
| 7 | Linoy: "I'm going to need the board for that one." | replaced by the pointer | A little; both can coexist |
| 7 | "Linoy writes *test per branch* on the board" | spoken concession, "Your name can stay." | No. It was a banned silent closer, and the new line is a small laugh |
| 9 | "the list beside the list it came from" | "removing the duplicate list" | Mildly; it was the chapter's best phrasing of the motive |
| 9 | Gilad: "Your search got us there faster in the old version." | cut | Yes: the argument behind the Turn (item 4) |
| 9 | "It won't list every possible write for you." | cut | Yes: breaks Oded's reply (item 3) |
| 9 | the `fontSizeChanged` gets `fontSize` example; "The account form is still open behind the diff" | cut | Low |
| 9 | Gilad: "Show me how I find those from this." | cut | Low; the Principle covers it |
| 12 | Eden: "A one-line interface diff doesn't do that work for us." | became "Your one-line fix was getting expensive for everyone else." | No; improved |
| 13 | "Bypassing the integration module still compiles" | cut | Low (state detail) |
| 8 | Oded: "This one should complain." | "Don't save that. We only just got rid of the complaint." | Gain |
| 8 | "He adds the imported account to the regression cases." | Eden: "It has other things to say before it gets an email address." | Gain |

Laugh count: no chapter has fewer laughs. Ch8, Ch10 ("not celebrating a green tracking page…"), Ch12 and Ch13 ("I still want a badge.") gain. Ch7 is even. Ch9 keeps every joke the plan names: "I have survived that before", "loyal to fourteen", the on-call joke and the scratch-tab exchange. It loses only wit, not laughs.

### OK

**Ch7 changes, one by one**
- Principle rule: in scope, Eli's voice, no normalization preview.
- `:19` trim: **out of scope** (item 1).
- RFC exchange: in scope. The #33912 citation is in narration only, calls it a "long-open suggestion", and makes no release or RFC-status claim. Daniel corrects "RFC" to "A suggestion." The existing TS2322 failure is still the evidence.
- Closer: in scope.
- Verdict: in scope. The ruling comes first and overloads stay viable.
- `Unwrap` pointer: in scope.
- `slugify`/`slugifyAll` code is unchanged (refuted item kept). Length is +1.9% words and +2.5% prose.

**Technical claims (all compiled)**
- Ch8: TS2540 text is exact: "Cannot assign to 'displayName' because it is a read-only property." The checks assert the message.
- Ch10 Turn:
  - On the old `Safe`, the runtime returns `raw.isTrackingCode("bad")` → false and `acceptTrackingCode("bad")` → "accepted".
  - With the new `Safe`, the hover is `Promise<Result<boolean>>`. The negated condition compiles and the positive condition gives TS2801.
  - The async guard rejects `bad`.
  - Using `U` in the false branch gives TS2304, which confirms Daniel's new scope line.
- Ch12:
  - With `in out`, the direct and named calls fail TS2345, while the forwarded object and the copied fixture are accepted and the receipt throws.
  - With function properties, the old label dashboard fails TS2345 ("Types of property 'write' are incompatible").
  - `dashboardLabel(csvCache)` passes and returns "orders.csv". This is the reader call the narrowed contract allows.
- Ch13:
  - The emitted `badge.js` has no `labels` require ("Erased").
  - With the optional member, the bypass compiles and throws the missing-plugin error.
  - Deleting the guard gives exactly "TS2722: Cannot invoke an object which is possibly 'undefined'.". The checks assert it.
- Ch11: the claim that the `this` parameter is erased is correct.

**Callbacks**
- Ch8 quotes Ch6:357 "walk an object's keys" exactly.
- Ch7 → Ch10 `Unwrap`/courier holds. Ch10 has Idan's derivation and Daniel's Ch1 `Unwrap`.
- Ch11 → Ch12 cache handoff holds ("as promised"). Ch12's Additional Takes return to Chen's assignment and Dafna's source-only parameter, and both hold.
- Ch13 → Ch3: Chen recalls his own two global-`User` widgets. Dima explicitly contrasts the global name with the `label-kit` instance type and does not equate them.
- Ch9 → Ch8 ("another PR", `emailChanged`) holds.
- Bonus 1:121, "the badge plugin's augmentation", still holds. No Act III chapter quotes a changed Act II line.

**Dialogue, colons and state**
- Colons lead into the right fences: Ch8:203 and :269, Ch9:99, :145 and :226, Ch12:152 and :347.
- The reset and experiment comments in Ch8, Ch12 and Ch13 preserve the state needed to rebuild each experiment (fresh `csvCache`, the replacements, both entries through `./labels` and the scratch bypass).
- No Principle refers to anything before it's introduced.

**Cast**
- Speakers match the bios: Idan, Linoy and Dafna are she; Eden, Dima, Chen and Sahar are he. Ch10:303 "She" = Idan is unchanged.
- "There's an RFC for that." (Ch7:227), "The compiler disagrees." (Ch8:253) and "Let us return to first principles." (Ch11:387) each appear exactly once outside the bios. Eli's comes mid-chapter, after the helper mechanics, as Settlement 2 asks.
- Act I catchphrases are at one each: Oded Ch1, Noam Ch2, Chen Ch3, Idan Ch5, Dafna Ch1, Dima Ch6.
- Gil is not added (Settlement 4).

**Structure**
- Ch8, 10, 11, 12 and 13 Principles run 113–124 words, with no list of what fails later.
- Verdicts state the ruling first. Ch9 and Ch11 are "The Debate Continues".
- No "in the review" endings and no frame leaks. Every "beside" is mid-scene.
- No links in dialogue in Act II.
- The Turns held: Ch10 has Idan's concession, and Ch12 has Noam's "You're right. My repair rejects a caller we still support."
