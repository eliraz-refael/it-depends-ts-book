<!-- Fresh Opus reader, front-to-back read of the prologue and Act I at c3d1274, 2026-11-03. -->

## PR B reader report

I read the prologue (all three files), Act I Ch1–6 in order, skimmed Ch7 (`02-advanced-typescript/01-conditional-types.md`) for callbacks, then read FIX-PLAN standards 1–9. Paths below are relative to `.../scratchpad/prb/new/book/01-the-type-system/` unless stated. I wrote no scratch files and made no edits.

**What already passes:**
- **Catchphrases:** each of the five appears exactly once in the whole book: Ch1:102, Ch2:206, Ch3:119, Ch5:231, Ch6:61.
- **Links:** none inside dialogue.
- **Fiction:** no "the book", chapter numbers or "in the review" inside Ch1–6.
- **Closers:** no section ends on a silent stage direction.
- **Pronouns:** all match the bios (Idan, Linoy and Dafna are she; Chen, Gil and Sahar are he).
- **Callbacks into Ch7 hold:** "Daniel pointed out that `extends` has another job" (Ch7:7) matches Ch6:185. `Unwrap` and `Unwrap<any>` "from the `any` argument" (Ch7:77, 387) match Ch1:648–662.

### NEEDS CHANGE (most important first)

1. **Ch6's Turn doesn't turn.** (06-generics-basics.md:5, 123–129, 246–315)
   - The Principle already gives the Turn's ruling: "If only the caller chooses a return type and nothing establishes it, review that choice as an assertion" (:5).
   - The `querySelector` section then delivers it again, before the Turn: Noam: "So I should review that type argument like an assertion." Daniel: "Yes." (:123–125)
   - The Turn opens with Daniel bringing a prepared example: "Here is the return-only case I would reject" (:250). Nobody holds a position for it to overturn. Idan's "Delete the cast, Daniel" (:266) and "Now I can't even find the unchecked claim by searching for `as`" (:276) are the best beats, but Daniel agrees at once, and Noam's "Where would you look?" (:278) is only a feed line.
   - The chapter's real argument is Oded's concrete-first against Noam's generic-first (`sortByName` vs `sortEmployees`, :175–183). The Turn never touches it, and the Verdict (:321–323) has each of them keeping their position.
   - Fix direction:
     - Cut the Principle's last sentence.
     - Keep `querySelector` as the justified case, but drop Noam's "like an assertion" conclusion so the Turn discovers it.
     - Put the lying generic in code one of them defends. For example, Noam's reusable `parseConfig<T>`/`loadState<T>` for billing config ("We don't need to wait for a second caller", :59). He has to concede that a generic is not a check, and that the question is where `T` comes from. Alternatively, Oded, who resisted brackets, finds his own `loadState<PaymentPlan>`.
     - Also drop the stray `---` and the `### "Generics that lie"` subheading (:244, 248). No other Turn has them.

2. **Ch3: Chen's catchphrase beat is a strawman the expert dismisses, and Chen otherwise asserts rather than asks.** (03-interface-vs-type.md:119–151, 299, 322)
   - Chen's example has two model files that both write `declare global` on purpose. Daniel defuses it: "Your example deliberately puts both in the global scope" (:149). The catchphrase lands as a line, but the payoff deflates it ("If Chen can't break it, ship it").
   - :147 "Two developers. Two files. One silently merged type that neither of them intended." is an AI-style triad, and a conclusion rather than a question.
   - :299 "So we don't know how much it would save here…" and :322 "The rule still needs exceptions. You can't 'just use interface'…" are statements and proposals. Chen asks no reframing question in Ch3 after :119.
   - Fix direction:
     - Make the merge realistic: two non-module script files (no import/export, typical of a half-finished JS migration) that merge silently. Daniel confirms instead of dismissing, and Eden could say how many of her migrated files were scripts.
     - Turn :299 and :322 into questions, e.g. "Which of these has an `interface` spelling at all?"

   Ch3's Turn itself works:
   - Guy applies Liron's brand-new convention (:338) to a record with conflicting ids, and the `never` error is on the page.
   - Liron changes position: "Then data alone isn't a reason to choose the alias" (:410). Dafna partly concedes (:408).
   - It comes where it should, right after the convention is proposed.
   - One gap: the Verdict's team line weakens it: "with composed data allowed to use `extends`" (:418). Liron said "Keep the composed interface". Make it "composed data uses `interface extends`".

3. **Ch5's Turn re-shows a point that is already conceded, and nobody moves.** (05-narrowing-strategies.md:402–434)
   - Gilad shows that the result and the throwing wrapper carry the same failure details. But Guy had already conceded that and built `parseUserOrThrow` at :271–294.
   - After the demo, Guy, Idan and Chen restate their positions. Chen's "Can the caller ignore your result, Idan?" (:432) is a good reframe, but the answer changes nobody.
   - The Principle also gives the chapter away:
     - "A return annotation claiming the input is valid doesn't give us the same protection when a field changes" (:5) gives away Idan's reveal at :259.
     - "How it reports a rejected input is a separate choice" (:5) announces the open ending.
   - Fix direction:
     - Make the Turn show something new. Gilad is the natural one to ask where the stack trace or log points. Or a new caller outside Guy's handler hits the thrown error, which is exactly Idan's worry at :296. Someone should give ground: Guy agreeing on the result for non-handler callers, or Idan agreeing that the handler path is fine.
     - Cut the Principle's third and fifth sentences.

4. **Ch2's Turn is a Gilad monologue and nobody changes position.** (02-type-assertions.md:358–372)
   - :364 is a long hypothetical with nothing shown.
   - :366 "Every assertion is a bet that the world outside your program still matches your model of it." is an aphorism nobody says aloud. The Verdict repeats it: "a bet against runtime reality" (:376).
   - Noam and Eden only restate their earlier positions (:368, :370).
   - Missed opportunity: Gilad's own line "Your tests pass — because your tests use mock data that still has the field" points straight at Noam's `createMockUser` defaults. Oded predicted that problem at :237.
   - Fix direction: have Gilad make the field optional and run Noam's factory-based test, which still passes. Noam then concedes the fixture hides the change, and Oded's comment-the-fields compromise earns its place. Cut the aphorism. Start the Verdict with the ruling ("Justify each assertion by…").

5. **Ch5 "typeof family": Chen quizzes and the section reads like a manual.** (05-narrowing-strategies.md:42, 50–99, 390–394)
   - Chen's questions mostly set up Linoy's next explanation: "Would your date check accept a `Date` from another iframe?" (:71), "Are you keeping the handwritten `User` type too?" (:390), "And when someone adds a field?" (:394).
   - Continuity break: at :77 Chen says "Our response guard only checks for `error`. Would you let its caller read a string?" `isResponse` doesn't appear until :86.
   - Linoy is tagged twice in a row (:52 and :69), and "Start here" (:67) is followed by "Start with" (:69).
   - :54 and :97 are lists in speech ("truthiness rejects `0`, the empty string, `false`, `0n`, and `NaN` too").
   - Fix direction:
     - Give Chen one reframing question for the section, e.g. "Which of these checks would pass a value we'd still crash on?"
     - Show `isResponse` before anyone refers to it.
     - Move the falsy list into a code comment.

6. **Ch2: Oded and Linoy swap characters.** (02-type-assertions.md:50–52)
   - Oded, the velocity advocate, volunteers `satisfies` and asks "Can I retire `as Type`?" (:50), before anyone has introduced `satisfies`.
   - Linoy, the cutting-edge advocate, answers "Because `satisfies` was added in TypeScript 4.9. Millions of lines of code predate it." (:52)
   - This also clashes with Oded's Additional Take, "I'm not rewriting two hundred existing assertions" (:402).
   - Fix direction: Linoy raises `satisfies`; Eden or Oded answers with the legacy objection.

7. **Ch1: the catchphrase retort fumbles.** (01-any-vs-unknown.md:102–108)
   - Oded: "We can fix it in the next sprint." Noam: "In the next sprint? *They never do.*" — "they" has no referent.
   - The real punchline is two lines later: "That parameter had been there for eight sprints, Oded. I found the TODO at 2 AM" (:108).
   - Fix: cut :104–106 so the catchphrase goes straight into :108.

8. **Ch4's Turn is talk only.** (04-enums-vs-unions.md:417–433)
   - Sahar changes position ("For that team, on that night, I'd leave it."), which matches his bio's flaw. But he is moved by Guy's argument, "Sometimes it's about the room." (:425, an aphorism), not by anything shown on the page.
   - Oded's "Four hundred enums across twelve services" (:431) is a fact with no setup.
   - Fix direction: ground it on the page. Guy points at the `(typeof Status)[keyof typeof Status]` line that Oded said makes him want to "close the tab and go outside" (:245), or brings a real review thread. Set up the enum count earlier.

9. **The narrator works as a manual, and links carry facts that belong to characters (standards 5 and 6).**
   - Ch5:153 "Since [TypeScript 5.5](…), the compiler can infer predicates…" is a standalone sentence whose only job is the fact plus the link, and Daniel's next line depends on it. Give the fact to Daniel.
   - Ch3:278: the sentence summarizes the performance guidance and carries the link, while Gil (:276) is left with nothing to do. Give the fact to Gil.
   - Ch4:117 "…`isolatedModules` enabled, which checks for constructs incompatible with single-file transpilation" defines a flag in narration. Move it to a code comment or a character.
   - Ch4:501 "Noam uses [Zod's enum validation](…)" is an API description in narration, right before Noam speaks. Give it to Noam.

### Minor

**Voice: lines that sound like an AI rather than a person**
- Ch1:477 Liron: "The problem isn't `any` itself — it's when `any` becomes invisible. When it stops being a conscious choice and becomes the default." This is the "not X, it's Y" pattern, and an aphorism.
- Ch3:388 Noam: "…is a diagnosis. The intersection error message is a riddle. The first one names the conflict. The second points at…" The "first/second" sentences repeat the image; keep only diagnosis/riddle.
- Ch3:189 Linoy: "An interface describes an object shape. A union can describe a choice between shapes." Reads like a textbook.
- Ch3:320 Oded: "The overhead of the decision is more expensive than the occasional suboptimal choice." Essay-speak.
- Ch4:151 Guy: "Given the value, you can get the name. Given the name, you can get the value." Symmetrical, reads like a manual.
- Ch6:61 Dima: "You agree about what the generic does. You disagree about when to introduce it." A symmetrical summary, and he never makes the call his bio promises ("Separates the questions, then makes the call").
- Ch6:280 Idan lectures ("`lastItem` gets its `T` from the input array. `get` gets `T`…"), while her bio says "She doesn't lecture."
- Ch6:364 Eli: "branch on it, walk an object's keys, build another type from it" is a triad trailer for the next act.
- Ch1:253 Linoy's onboarding gloss gets no reaction, and the section ends on her explanation (:274).
- Ch5:333 Idan's event-bus exposition reads like a manual.

**Continuity**
- `firstElement` is the generic in Ch1:256, and Ch1:668 tells the reader to "Remember `firstElement`." Ch6:36 reuses the name for the non-generic `unknown` version. Rename one of them.
- Ch3:258 Guy: "No assertion." answers an objection nobody raised.
- Ch3:390 Dafna: "Timestamps don't make everything one of your entities." Unclear.
- Ch3:437: a branded `UserId` appears in the Verdict code with no introduction.
- Ch1:664 "Your generic function…": it isn't clear which generic of Oded's this refers to.
- Ch4:125 Gil: "Before we talk about bundle cost" — nobody had raised bundle cost.
- Ch4:241: Noam asks a beginner's question ("That's the same indexing as the logger?").
- Gilad leads both the Ch2 and Ch5 Turns with the same "what happens next / at 3 AM" move. Vary one of them.

**Standards**
- The Ch2 and Ch4 Verdicts state no team decision (standard 2: transferable ruling first, then this team's decision).
- First appearances under a short name: Oded at Ch2:50 (his full name comes at :58), Noam at Ch3:151.
- Ch3's Additional Takes has a single entry (:472) and feels perfunctory.
- The cast page narrator refers to the book: "some of the professionals in this book" (02-meet-the-cast.md:43) and "the book's recurring main event" (:207). This matters only if standard 4 covers the cast page.

**Drag**
- Ch3:82–117 (Express augmentation) and :274–301 (performance).
- Ch4:271–315: one monologue, no exchange.
- Ch6:92: the `JSON.stringify(undefined)` aside.
- Ch5:306–358: exposition-heavy.

**What made me laugh or smile**
- Ch1: "we've given it a string with excellent paperwork" (:315), "You already block all my PRs" (:390), "With homework underneath it" (:469), "I'd been looking for angle brackets in our own code" (:672).
- Ch2: "type laundering" and "a fake mustache on a bug" (:136–138), "Moving the assertion into a wrapper just gives it an office" (:150), "I'd like that in writing too" (:241), "Purple can appeal to the design team" (:404).
- Ch3: "I agree with a version of you that's more careful with words" (:328), "Apparently we're hiring neither" (:372), "Two kingdoms. Shared building inspector." (:412).
- Ch4: "close the tab and go outside" (:245).
- Ch5: "That check is not an invitation" (:75).
- Ch6: the lens and photograph exchange ending in "Payroll would like its photograph by Friday" (:65–75), "Finally. A refactor that deletes something" (:109), "One `T`. Are we deleting that too?" (:311), "Payroll still hasn't asked for a lens" (:323).

### Verdict

Act I is close but not ready. The mechanical standards pass:
- each catchphrase is used once;
- links are out of dialogue;
- the fiction holds;
- no scene ends on a silent closer;
- pronouns are correct;
- the callbacks into Ch7 hold.

The comedy is genuinely good in Ch1, Ch2, Ch3's Turn and Ch6's opening.

But Ch6's Turn, explicitly in PR B's scope, is still an expert's prepared example, given away by the Principle and by the `querySelector` exchange, and it doesn't touch the Oded/Noam argument. Ch3's Turn works, but its Chen beat sets up a strawman that Daniel dismisses. Only Ch1's and Ch3's Turns change a position because of code on the page: Ch4's moves Sahar by argument alone, and in Ch2 and Ch5 nobody moves. Chen still quizzes in Ch5, though Ch5's Chen voice is also in this PR's scope.

Fix items 1–5 and Ch1's catchphrase retort (item 7) before merging. The rest can go in the same pass at low cost.
