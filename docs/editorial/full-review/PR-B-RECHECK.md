<!-- Fresh Opus reader, diff and continuity recheck of PR B (c3d1274 vs b85236d), 2026-11-03. -->

## PR B diff recheck report

I read all 880 lines of book.diff, then read every changed Act I file in full in new/: the cast page, Ch1, Ch2, Ch3, Ch5 and Ch6 whole, and Ch4 from line 1 to 505. I compiled the changed fences with tsc 7.0.2 using the checks' profile from checks/compiler.cjs: strict, exactOptionalPropertyTypes, ES2022, Node16, `types: []`, moduleDetection force. Where behaviour was claimed, I also ran the emitted JS in node. The probes are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/prb/probes/diff/` (ch1.ts, ch2.ts, ch3.ts, ch5.ts, ch5b.ts, ch6.ts, c4/). Nothing in the worktree was edited.

### NEEDS CHANGE (most important first)

1. **Ch5 `05-narrowing-strategies.md:97`: the technical reason is wrong.**
   - Quote: "And the right operand must be an object. `in` throws on `null` or any primitive. Don't replace the object check with `if (x)` either; truthiness rejects `0`, the empty string, `false`, `0n`, and `NaN` too."
   - Problem: the old text made two separate points. The merge gives the wrong reason for not using `if (x)`. The hazard isn't over-rejection. A truthy primitive gets through `if (x)` and then `in` throws on it.
   - Evidence, compile: `if (x) { "error" in x }` on an `unknown` gives TS2638: "Type '{}' may represent a primitive value, which is not permitted as the right operand of the 'in' operator."
   - Evidence, runtime: `"error" in "abc"` throws "Cannot use 'in' operator to search for 'error' in abc".
   - Fix: say that `if (x)` still lets `"abc"` or `42` through to `in`. If the over-rejection point is worth keeping, give it its own sentence.

2. **Cast `02-meet-the-cast.md:169`: the Linoy bio describes a scene that doesn't exist.**
   - Quote: "She'll run his broken example. She'll also try to repair hers before letting him replace it with four overloads."
   - Problem: "him" is Noam. No chapter has Noam replacing Linoy's signature with overloads, four or otherwise.
   - Evidence:
     - In Ch7, the overloads are Eden's: Eden brings them at :96–112, "Eden's overloads" at :246, and "Oded deletes the three overload signatures" at :169.
     - In Ch27 (:74–95), Noam's broken replacement makes Linoy repair hers ("Fine. Keep the whole call together."). Nobody proposes overloads.
   - Fix: keep the Ch27-true half ("She'll run his broken example. She'll also try to repair hers before giving it up."). Alternatively, attribute the overloads to Eden without a count.

3. **Ch2 `02-type-assertions.md:206`: the line contradicts the code below it.**
   - Quote: "Over my dead type definition. I'll give you the two-field call. The factory can supply the rest:"
   - Problem: the fence's call is `createMockUser({ name: "Test User" })`, which passes one field.
   - Fix: say "the one-field call", or make the call `createMockUser({ id: "1", name: "Test User" })` to mirror Oded's two-field assertion. The catchphrase itself lands well.

4. **Ch5 `05-narrowing-strategies.md:69`: an answer is left without its question.**
   - Quote: "**Linoy**: "Start with `typeof null === 'object'`…""
   - Problem: Chen's prompt ("What do those checks leave unproven?") was cut. That leaves Linoy re-labelled right after her own speech, and saying "Start with…" for the third time in 15 lines (:54, :67, :69).
   - Fix: restore a reframing Chen question, or drop the label and rephrase as a continuation ("The first trap: `typeof null === 'object'`…").

5. **Ch2 `02-type-assertions.md:50–52`: the answer doesn't fit the question.**
   - Quote: "**Oded**: "Then why not `satisfies`? … Can I retire `as Type`?" / **Linoy**: "Because `satisfies` was added in TypeScript 4.9…""
   - Problem: "Because" answered the old "why does anyone still reach for `as`?". It doesn't fit a yes/no "Can I retire it?".
   - Fix: "No. `satisfies` was added in 4.9…", or drop Oded's last sentence.

6. **Ch1 `01-any-vs-unknown.md:102`: the catchphrase replaced Oded's argument instead of joining it.**
   - Quote: "**Oded**: "We can fix it in the next sprint.""
   - Old line: "That's a discipline problem, not a language problem. If someone had cleaned up the types—"
   - Problem: the plan put the phrase at his "interrupted cleanup defence". The draft deletes the defence, so Oded has only the punchline. FIX-PLAN cast rule: don't make Oded incompetent.
   - Fix: "That's a discipline problem, not a language problem. We can fix it in the next sprint." Noam's "They never do" also reads better with a "someone" in play.

7. **Name convention breaks from moved lines.** Old/ had none of these; new/ has two.
   - Ch2 `:50`: Oded speaks as "**Oded**" before his full-name introduction at `:58` "**Oded Shipley**". Fix: move "Shipley" to :50.
   - Ch3: Noam never gets "Noam Kiperman". His old first appearance moved into the Turn as "**Noam**" (:388), so his first appearance is now `:151` "**Noam**:". Fix: give him his full name at :151.

### Minor

- **Ch4 Verdict `04-enums-vs-unions.md:416`.**
  - Quote: "Keep an enum when its reverse map or the team's ability to maintain it earns the extra construct."
  - "Keep" reads as existing code only. The Turn's result for a new service (Sahar: "What would you choose for the next service?" Guy: "Depends who's maintaining it") dropped out of the Verdict, and no table row carries it. Old text: "may choose the enum, even for a new service. Plan for that learning cost".
  - Fix: "Use or keep an enum…".
- **Ch4 `:122` puts configuration in narration.** "She tries a consumer with `isolatedModules` enabled, which checks for…" FIX-PLAN §6 wants flags in fences. A `// consumer tsconfig: "isolatedModules": true` line in the TS2748 fence would let the narration shrink.
- **Ch5 `:77`, a slight forward reference.** "Our response guard only checks for `error`…" names `isResponse` before the fence shows it at :86. It is shown right after, so this is tolerable. Linoy's answer only gets to the string question at :95.
- **Ch5 `:331`.** "Where does the receiver get this union?" uses "the receiver" before Idan introduces the bus and its receiver. Fix: "Where does this union come from at runtime?"
- **Ch3 `:400`.** "**Guy**: "They don't have to."" has no clear antecedent (timestamps? parts?). Old: "Extending interfaces doesn't require a chain four levels deep." Restoring that clause would also set up Dafna's "The family tree was optional."
- **Ch3 `:381`, pre-existing, now in the Turn.** The `//^^` caret sits under `id`, but TS2430 is reported at the interface name. My probe: (29,13) on `Employee`. The message text matches exactly.
- **Ch2 `:310` then `:330`.** Two consecutive "**Oded**:" labels with only a fence between them. Drop the second label, or put Noam's reply between them.
- **Ch2, two bet metaphors still remain.** The plan said keep one bet metaphor, and both are still there: Gilad `:366` "Every assertion is a bet…" and the Verdict `:376` "is a bet against runtime reality".
- **Ch2, Chen's closing argument was cut rather than turned into a question as the plan said (:406).** It said: if the answer to "how will I find out?" is a check, narrow with that check and delete the assertion. Checklist item 3 only partly covers it. Settlement 2's "two questions" may justify the cut; confirm that was intended.
- **Ch6 `:75`.** "Payroll would like its photograph by Friday." Oded's function here is billing; payroll is `sortEmployees`, introduced at :175. Consider "Billing would like…", or accept it as the setup for the Verdict's "Payroll still hasn't asked for a lens" (:323).
- **Ch6 Verdict (:319–323).** The timing question is left open only implicitly, through Noam's and Oded's lines. The plan asked for it "explicitly". One clause in the narration or blockquote would do it.
- **Ch6 `:244–248` formatting.** This is the only `---` before a `##` heading in any chapter, and the only `## The Turn` with a `###` subheading. Drop the rule, and consider folding the subheading in.
- **Ch1 `:670`.** "**Oded** looks back at the array declaration." `firstElement` is about 400 lines back, in another section. "scrolls back to `firstElement`" would read better.
- **Ch1 `:104`.** "In the next sprint? *They never do.*" "They" has no clear referent. It's tolerable as a joke.
- **Cast, Dima `:243`.** "though Oded likes the answer less when Dima is maintaining the package"
  - No scene shows this. Oded doesn't appear in Ch20 (Dima's pricing package), Ch25 or Bonus 1.
  - Ch13's Verdict, where Dima overrules Oded's required-member wish, would support "when Dima is the one making the call".
- **Cast, Dima `:245`.** "Then he gets specific." now follows the nicknames paragraph rather than the "Both have a point" paragraph. Swap the two paragraphs.
- **Cast, Linoy `:167`.** "a distinction Daniel has had to make while she was already typing" depends on PR C writing the Ch7 RFC/#33912 exchange. No chapter contains it yet. Track it as a PR C dependency.
- **Cast glance table.** The Linoy and Dima rows are 111 characters against 112 for the others (one pad space short; source only). Idan's row was already short.
- **Pre-existing, untouched by PR B.** Ch8:13 quotes Eli as promising "types that walk an object's keys". His Ch6:364 words are "walk an object's keys". That is close, but it's in quotation marks.

### Lost value (old → new)

Every chapter gains at least as many laughs as it loses, so the no-fewer-laughs ruling holds.

| Where | Lost from old/ | Gained in new/ | Does it hurt? |
|---|---|---|---|
| Cast, Linoy | "Linoy's `tsconfig.json` looks like a dare"; "the early adopter every team needs and every team fears"; "occasionally incomprehensible to anyone who hasn't read the same three blog posts"; "Even when there isn't, there's usually a GitHub issue that Linoy has already commented on"; "either helpful or maddening, depending on your deadline" | The "by lunch / by three" joke | "tsconfig looks like a dare" is the best image. It could survive without "every flag": "Linoy's `tsconfig.json` looks like a dare she has already run." |
| Cast, Dima | "either the most valuable person in the room or the most annoying, depending on how invested you are in your position" | — | Mild. |
| Ch1 | Oded's "discipline problem, not a language problem" | "a string with excellent paperwork" | Yes, the argument loss hurts (item 6). Guy's `onEvent` was a planned cut. |
| Ch2 | Linoy's "apology for `as` … breaking the internet" (planned cut); Chen's irony "route through `unknown`, the type that means 'I don't know', then immediately assert 'I know exactly'"; Eli's in-world callback to Ch1's "localized lie"; Daniel's "module augmentation cannot repair every incompatible property type"; Chen's narrow-and-delete closer | "Well, the error's gone" / "The cat still has no bark"; "gives it an office"; "I'd like that in writing too"; "Purple can appeal to the design team" | The Chen irony line and the Eli callback are worth restoring if space allows. |
| Ch3 | Liron's blueprint detail (load-bearing walls, doors, windows; "Most of the code you write is not building things"); Guy's "chain four levels deep" | "Apparently we're hiring neither"; "Two kingdoms. Shared building inspector." | Acceptable under Settlement 3. |
| Ch4 | Nothing material | — | — |
| Ch5 | "async functions and generators" in the `typeof` function list | "That check is not an invitation"; "on the same morning" | Mild. |
| Ch6 | Liron's "It does not have to admit a scene it will never see", "an array of invoices gives you an invoice", "the image only gets us so far" | Two payroll/lens jokes | Settlement 3 is met. |

### OK

- **Ch3 conflicting property (`ch3.ts`):**
  - The intersection declaration passes.
  - Construction gives TS2322 "Type 'string' is not assignable to type 'never'." at `id`.
  - `interface Employee extends Base` gives TS2430 with the exact three-line message. The same happens when `Base` is an alias.
  - `UserContract` compiles and is assignable to the intersection `User`.
  - A conflicting part gives TS2320, which confirms "If two disagree about `id`, this declaration fails."
  - The nonconflicting controls compile.
  - Order: `interface Base`/`User` comes before `renderProfile`, and nothing before the Turn mentions the conflict or `never`.
- **Ch6 JSON.parse (`ch6.ts`):**
  - Both `parseConfig` versions compile, with and without `as T`.
  - Both throw `TypeError: Cannot read properties of undefined (reading 'toFixed')` on `'{"retires": 3}'`.
  - `parseRetryConfig` returns exactly the commented failure.
  - Controls: valid input gives `ok: true`, and `3` gives "not an object".
  - `loadState` compiles without a cast.
  - The Turn refers only to `lastItem`/`get`, which are already introduced.
- **Ch5 rule (`ch5b.ts`, `ch5.ts`):**
  - Dropping the `email` check from `parseUser` gives TS2339 at the return object.
  - The predicate without the email check still compiles.
  - The 5.5-inferred predicate works with `filter`.
  - Calling a class without `new` throws "Class constructor Widget cannot be invoked without 'new'".
  - `in` on `null` throws.
- **Ch1 (`ch1.ts`):** `Unwrap<any>` is `any`, `Unwrap<Promise<string>>` is `string`, and `firstElement(any[])` gives `any`.
- **Ch2 (`ch2.ts`):** `"red" satisfies Color` keeps `"red"`; `"purple" satisfies Color` gives TS1360; `!` and `NonNullable` are equivalent.
- **Ch4 (`c4/`):** TS2748 matches the quoted text.
- **Callbacks hold:**
  - Ch7:77 "Daniel showed us this in `Unwrap`": Daniel shows it in Ch1's Additional Takes with Oded present and speaking.
  - Ch7:387 "Remember `Unwrap<any>`" fits Ch1's explanation.
  - Ch7:5–7 (the `sortByName` `extends` callback) is preserved at Ch6:185.
  - Ch7:447 (the enum exhaustiveness check) holds.
  - Ch8:13 "Eli had promised": Eli's teaser is intact at Ch6:364.
  - Ch10:76 ("Daniel brings back his `Unwrap`") holds.
  - Bonus 3:229, Eden's recall of export return types "in the generics argument", matches Ch6:238.
  - `RequestState` uses the `status` tag in Ch3 (:198, :439) and Ch5 (:311), and Ch5 :356–358 keeps the tag-translation line.
- **Catchphrases:** a grep of all new/book finds each of the five Act I phrases exactly once outside the bios, in the planned scene, and each lands as a spoken line:
  - Ch1:102 Oded "We can fix it in the next sprint."
  - Ch2:206 Noam "Over my dead type definition."
  - Ch3:119 Chen "But have you considered..."
  - Ch5:231 Idan "Prove it by producing it."
  - Ch6:61 Dima "Both have a point here."
  - The other ten have no new uses. "RFC" and "first principles" appear only in the bios.
- **Attribution and dialogue:**
  - The Ch1 Turn's "**Daniel**: "Yes. What lets you remove…"" is now correctly labelled; it previously read as Noam.
  - Dima's two-way recap fits once Guy's handler is cut, and Guy keeps the adapter scene.
  - Chen's Ch2 voice is two reframing questions (:116, :295) and he no longer proposes.
  - Idan is "she", and other pronouns match the bios.
- **Structure, plan and refuted items:**
  - The Principles lead with rules in Ch2, 3, 5 and 6.
  - Ch5 keeps "The Debate Continues" with a spoken ending.
  - The Ch2 tableau and the Ch5/Ch6 review closers are gone.
  - Links are out of dialogue, with one per narrator paragraph.
  - Ch3 and Ch6 are about the same length or shorter.
  - The refuted item Ch5:461 (Noam's predicate take) is unchanged.
  - PR A's fixes are intact: `firstElement` returns `T | undefined`, the logger's user payload is kept, the `{ /* ... */ }` body is fixed, and `filter(Boolean)` is used.
