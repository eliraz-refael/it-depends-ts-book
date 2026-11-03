# PR B revision brief

2026-11-03, for draft c3d1274. Two fresh Opus readers reviewed it:
- [front-to-back reader](PR-B-READER.md);
- [diff and continuity recheck](PR-B-RECHECK.md).

Their mechanical results are clean:
- each of the five catchphrases appears once and lands;
- the links are out of dialogue;
- the fiction holds;
- there are no silent closers;
- the pronouns are right;
- every callback holds (Ch7 `Unwrap`, Ch8 "Eli had promised", Bonus 3, `RequestState`);
- the Ch3/Ch6 code behaves as the prose says on 7.0.2;
- no chapter lost laughs.

Ch3's Turn works. What's left is below. Line numbers refer to c3d1274.

## Must fix

1. **Ch6's Turn still doesn't turn.**
   - **The problem:**
     - The Principle's last sentence already states the ruling.
     - Noam concludes "review that type argument like an assertion" in the `querySelector` section (:123–125).
     - The Turn opens on Daniel's prepared example, so nobody's position is overturned.
   - **The fix:** put the lying generic in code that **Noam** defends.
     - He's generic-first ("We don't need to wait for a second caller") and bans `as`. So his reusable `parseConfig<T>` (or `loadState<T>`) has no cast at all: `return JSON.parse(input)`.
     - Idan's "Now I can't even find the unchecked claim by searching for `as`" then lands on him.
     - Noam concedes that a generic isn't a check, and that the question is what supplies `T`. The apparent loser of the timing argument, Oded, is right about this function. Keep Oded's `ParseResult<T>` challenge.
     - Cut the Principle's last sentence.
     - Keep `querySelector` as the justified case, but drop Noam's "like an assertion" conclusion there so the Turn discovers it.
     - Drop the `---` and the `### "Generics that lie"` subheading under `## The Turn` (:244, :248).
     - Rename Ch6's non-generic `firstElement` (:36), which collides with Ch1's generic one that Ch1's Additional Takes recalls.
     - Make the Verdict say the timing question stays open in one explicit clause.
2. **Ch3: Chen's catchphrase beat is a strawman that Daniel dismisses** ("Your example deliberately puts both in the global scope", :149).
   - **The fix:** make the collision one a team really hits, and have Daniel confirm it rather than dismiss it.
     - Mind the book's profile: the checks use `moduleDetection: "force"`, so a script-file merge only happens in a setup the scene states (a legacy JS-migration project, or two packages both augmenting a global).
     - Cut the triad at :147 ("Two developers. Two files. One silently merged type…").
     - Turn Chen's statements at :299 and :322 into reframing questions.
   - **Also in Ch3:**
     - Give Noam his full name at his first appearance (:151).
     - Guy's "They don't have to." (:400) needs its antecedent back (the old "doesn't require a chain four levels deep" sets up Dafna's "family tree").
     - The Verdict's team line becomes "composed data uses `interface extends`", which is what Liron conceded.
     - Move the TS2430 caret to `Employee`, where 7.0.2 reports it.
3. **Ch2's Turn is a Gilad monologue and nobody moves (:358–372).**
   - **The fix:** use the setup the chapter already has. Gilad makes the field optional and runs Noam's `createMockUser`-based test, which still passes. Noam concedes that the fixture's defaults hid the change, and Oded's name-the-fields comment earns its place.
   - Keep one bet metaphor, not two, and start the Verdict with the ruling.
   - **Also in Ch2:**
     - **Linoy** raises `satisfies` (:50) and Oded or Eden answers with the legacy objection. The current swap puts each in the other's character. Oded gets his full name at his first appearance.
     - Noam's "I'll give you the two-field call" doesn't match the one-field `createMockUser({ name })`: fix the line or the call.
     - Avoid two consecutive `**Oded**:` labels around the `!` fence (:310/:330).
     - Restore Chen's laundering irony ("the type that means 'I don't know'… then 'I know exactly'") if it fits in his voice.
4. **Ch5, the Principle and the `typeof` section.**
   - Cut the Principle's third sentence (it gives away Idan's field-change reveal) and its fifth (it announces the open ending).
   - **:97 is technically wrong.** The hazard of `if (x)` before `in` is that a truthy primitive like `"abc"` or `42` gets through and `in` throws (TS2638 at compile time). Over-rejection is a separate point: keep it in its own sentence, or as a code comment.
   - Show `isResponse` before Chen refers to "our response guard" (:77).
   - Fix Linoy's re-label and the triple "Start with" (:52/:67/:69).
   - Give Chen one reframing question for the section rather than a series of prompts.
   - Make "Where does the receiver get this union?" (:331) "Where does this union come from at runtime?" or similar.
   - **The Turn:** keep it, but someone gives ground on the page. For example, Guy accepts a result for callers outside his handler, or Idan accepts the handler path. It stays "The Debate Continues".
5. **Ch1, the catchphrase.** Restore Oded's argument with the phrase: "That's a discipline problem, not a language problem. We can fix it in the next sprint." Noam's reply should go straight to the eight-sprints TODO punchline. Cut the referent-less "They never do" exchange if it no longer earns its place.
   - In the Additional Takes, "Oded scrolls back to `firstElement`" instead of "looks back at the array declaration".
6. **Cast page.**
   - **Linoy:** no scene has Noam replacing her signature with four overloads (Ch7's are Eden's, and Ch27 has no overloads). Use the true half: "She'll run his broken example. She'll also try to repair hers before giving it up." Restore "Linoy's `tsconfig.json` looks like a dare", in a form that doesn't claim every flag. The "distinction Daniel has had to make" line becomes true once PR C writes the Ch7 RFC exchange, so keep it and we'll track it.
   - **Dima:** "when Dima is maintaining the package" isn't on any page. Ch13's Verdict, where he overrules Oded, supports "when Dima is the one making the call". Put "Then he gets specific" right after the "Both have a point here" paragraph.
7. **Narrator and links (standards 5–6).**
   - Ch5:153: Daniel states the 5.5 predicate-inference fact himself.
   - Ch3:278: Gil states the performance guidance himself, which also gives him something to do.
   - Ch4:117: `isolatedModules` goes into the TS2748 fence as a consumer-tsconfig comment.
   - Ch4:501: Noam states the Zod enum fact himself.
   - Keep a link in narration only where a short narrator sentence stands without it. Otherwise drop the link; the print build footnotes what remains.
8. **Ch4 Verdict.** "Use or keep an enum when…", restoring the new-service case: a team that can maintain an enum may choose one even for a new service, and should plan for the learning cost.

## Optional

- **The reader's voice minors** (Ch1:477 Liron, Ch3:388 Noam's repeated image, Ch3:189, Ch3:320, Ch4:151, Ch6:61 Dima, Ch6:280 Idan). Take the ones that cost a line, and keep each voice.
- **Ch4's Turn:** setting up Oded's "four hundred enums" earlier is welcome. Otherwise leave the Turn as it is.

## Leave alone

- Oded's "Two kingdoms. Shared building inspector." The reader laughed.
- The cast page's narrator mentioning "this book". The prologue speaks to the reader, so standard 4 doesn't apply there.
- Ch8:13's quotation of Eli, which belongs to PR C.

Keep the chapters about as long as they are now. Update the checks for every moved fence, including the Ch2 optional-field test and the Ch6 cast-free parser. Run a clean `npm ci` and the full suite.
