<!-- Fresh Opus reader, recheck of the PR B revision (30a614a vs c3d1274), 2026-11-03. -->

## PR B revision recheck report

I read every hunk of `rev.diff` in context in `new/book/`. I compiled the changed fences with TypeScript 7.0.2 under the profile (strict, exactOptionalPropertyTypes, ES2022, Node16, `types: []`, moduleDetection force), together with the earlier declarations each one depends on, and ran the runtime claims in node 22. Probes are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/prb2/probes/` (subfolders ch2, ch3, ch3b, ch4, ch5, ch6). I edited nothing in the worktree and did not run the suite there, because it writes tsconfig files into the worktree.

**Technical results: all correct.**
- **Ch2 Turn** (with `ApiUser`, `User` and `createMockUser`): compiles clean. Node prints `true`, then `response failed`.
- **Ch3 widgets:** I built a real node_modules layout (`profile-widget` and `admin-widget`, each with `index.d.ts`, `index.js` and `package.json`). `page.ts` gives `TS2739: Type '{ id: string; name: string; }' is missing the following properties from type 'User': email, role`, exactly as quoted. It does the same with skipLibCheck off and with `"type": "module"`. Importing only profile-widget compiles clean, so the scene's "when we import both" is accurate.
- **Ch3 TS2430:** reported at (5,11), which is `Employee`. The new caret columns line up.
- **Ch5 `in` checks:**
  - `hasError` gives `TS2638: Type '{}' may represent a primitive value, which is not permitted as the right operand of the 'in' operator.` (matches).
  - Forced through, `"abc"` and `42` throw `TypeError: Cannot use 'in' operator…`, while `0` and `""` return false. So the :86 hazard claim is now right, and the over-rejection point sits in its own sentence.
  - `isResponse` passes both a class instance with an `error()` method and `{error: 42}`; calling `.toUpperCase()` on either crashes. The `"toString" in {}` / `hasOwn` output matches the comments.
- **Ch6 Turn:** `parseConfig<T>` with no cast compiles, and the runtime gives `TypeError: Cannot read properties of undefined (reading 'toFixed')`. `parseRetryConfig` returns the commented failure object. `firstUnknown`/`firstItem` type as stated.
- **Ch4 TS2748:** the message is unchanged on 7.0.2, using an ambient `const enum` from node_modules with `isolatedModules`.
- **Checks:** `checks/chapters1-6.cases.cjs` has cases for the new Ch2 test, the Ch3 widget merge (message asserted), Ch5 `hasError` and Ch6 `parseConfig`.

**Scene verdicts:**
- **Ch2 Turn:** works. Noam moves because the code on the page shows the factory masking the email dependency. Oded's comment earns its place, and Noam's "The comment won't run that test for us" keeps Noam in character. One bet metaphor, and it lands.
- **Ch3 collision:** Daniel now confirms the collision, and Noam's "acquire two required fields by installing a widget" is a good line. The setup has one presupposition problem (item 2).
- **Ch5:** the section is tight and correct. Guy now gives ground. The closing summary doesn't record that (item 6).
- **Ch6 Turn:** turns properly. Noam defends his own cast-free generic and Oded's typo file breaks it. Idan's line lands on him, Noam names his own mistake ("I treated that as a check on the result itself"), and Oded is right about this function. It's the best of the four.

### NEEDS CHANGE (most important first)

1. **Ch2:52 duplicates Oded's Additional Take (:437).** The fix created this.
   - **Quote:** :52 "My client already had assertions all over it. I'm not rewriting those just because there's a nicer keyword." :437 "I'll use `satisfies` for new code. I'm not rewriting two hundred existing assertions for a theoretical improvement."
   - **Problem:** the same refusal appears twice, so the Additional Take (and the Gilad "3 AM" button on it) reads as a repeat. "My client" also reads as a customer before `ApiClient` appears at :101.
   - **Fix:** give :52 a different legacy angle, such as what satisfies can't replace (the old "doesn't cover every case": you can't `satisfies` a `fetch` result) or the cost of the 4.9 upgrade. Or rework :437. Say "our API client".

2. **Ch3:119: the widgets are used before they're introduced.**
   - **Quote:** "But have you considered... installing both widgets?"
   - **Problem:** no widget appears anywhere before this line, so "both" presupposes something the reader hasn't seen. "Profile widget" (:148) then sits 40 lines from "the profile screen" (:188, :194), which invites the reader to merge them.
   - **Fix:** "…installing two widget packages that each declare a global `User`?" Or give a widget pair one line of setup. Consider "admin widget"/"badge widget" names that don't echo the profile screen.

3. **Ch3:296: Chen's new question misfires on what's on screen.**
   - **Quote:** "Which of these types has an `interface` spelling we could actually compare?"
   - **Problem:** "these types" points at the two `Props` fences just above it, and both obviously have an interface spelling. The point about unions, mapped and conditional types gets lost, and the second question has to carry it.
   - **Fix:** aim the question at the project, for example "Which of our slow types even have an `interface` spelling? What would we replace a union with?"

4. **Ch5:99: "both of those calls throw", but there are no calls on the page.**
   - **Quote:** "Force that through and both of those calls throw."
   - **Problem:** :86 names the values `"abc"` and `42`, not calls. Also, **Linoy** is labelled at :84 and again at :99 around the fence. It's the same double label the brief removed in Ch2.
   - **Fix:** "Force that through and `hasError("abc")` and `hasError(42)` both throw." Then drop the second label or give :99 to someone else.

5. **Ch3:397/:403: the Guy line now repeats itself across the fence.** The fix created this.
   - **Quote:** :397 "**Guy**: …Use the same parts:" [fence] :403 "**Guy**: Same parts. If two disagree about `id`, this declaration fails."
   - **Problem:** Guy is labelled twice in a row and says "same parts" twice.
   - **Fix:** cut "Same parts." and the second label at :403, keeping "If two disagree about `id`, this declaration fails." as continuation text.

6. **Ch5:442: The Debate Continues ignores the ground Guy gave at :436.**
   - **Quote:** "Idan and Dafna want a result that exposes rejection to each caller. Guy wants the established handler to reject his whole request."
   - **Problem:** Guy has just conceded "give callers outside our handler the result". The summary still describes the positions before he moved, which undercuts the concession the brief asked for.
   - **Fix:** one clause, for example "Callers outside Guy's handler get the result; inside it, Guy still wants the throwing adapter, and Idan and Dafna want the result there too."

### Minor

- **Ch2:368** "He changes the response type and runs the receipt test". Gilad adds the provider's new type, and nothing reaches the test because of the `unknown` → `as ApiUser`. That is the point, but "changes" implies wiring. Suggest "He writes the provider's new type, reruns the receipt test, then feeds it the response without email."
- **Ch2:403** "Our parser." The receipt path has only an assertion, and the Verdict (:411) says it "will reject". Suggest "A parser, once this path has one."
- **Ch2, optional idea:** Oded's partial mock `{id, name} as User` would make `receiptTest` throw on `email.toLowerCase()` (verified). The partial mock exposes the dependency that the factory hides. That could be a one-line payoff for Oded if wanted. It isn't needed.
- **Ch6:342–347:** after the Verdict, Daniel's `loadState` comment "and no cast required" now repeats the Turn's discovery word for word. Trim the comment or the example.
- **Ch4:439** "Plan for the learning cost of the alternative." As a standalone sentence it loses its condition: whose cost, and which alternative? Suggest joining it: "…even for a new service, while planning for the time the team needs to learn the alternative."
- **Cast:165** "a dare she has already run". You take a dare, you don't run one. Suggest "a dare she has already taken" (or "already compiled", if the pun is wanted).
- **Ch3:141–142:** `import "profile-widget/index.js"` is an odd spelling for a package import. `import "profile-widget"` gives the same TS2739 (verified). If you change it, update the check's edit strings at `chapters1-6.cases.cjs:205`.
- **Ch5:69** "Linoy opens a response guard:". The fence opens with the `toString`/`hasOwn` demo before `isResponse`.
- **Ch3:150** "If another package needs an extension point, let it name one." This is slightly cryptic. A namespaced example (like `Express.Request` above) would make it concrete.
- **Ch3:319:** Chen quotes "just use interface", which Oded never said. It's inferable from the `interface User` fence labelled "For 90%", so this is fine but loose.

### Must-fix status

1. **Ch6 Turn:** resolved.
   - Noam defends the cast-free `parseConfig<T>`, Idan's line lands on him, and he concedes that a generic isn't a check and that the question is what supplies `T`. Oded is right about the function, and his `ParseResult<T>` challenge is kept.
   - The Principle's last sentence is cut, Noam's "like an assertion" conclusion at `querySelector` is gone, and the `---` and subheading are gone.
   - `firstUnknown` is renamed, and the Verdict says the timing question stays open.
   - New issue: minor redundancy in `loadState`.
2. **Ch3:** resolved, with new issues 2, 3 and 5.
   - The collision is real and Daniel confirms it. The triad is cut, and Chen's two lines are questions, though :296 misfires.
   - Noam has his full name; Guy's antecedent is restored, but now doubled. The Verdict line and caret are fixed, and TS2430 is confirmed at `Employee`.
3. **Ch2:** resolved, with new issue 1.
   - The Turn now uses `createMockUser` and Noam concedes, with one bet metaphor and the Verdict ruling first.
   - Linoy raises `satisfies` and Oded gives the legacy answer, with his full name at first appearance. "One-field call" is fixed and the double Oded label is gone.
   - Chen's laundering irony is restored. It's statements rather than a question, but in his voice.
4. **Ch5:** resolved, with new issues 4 and 6.
   - Principle sentences 3 and 5 are cut, :86 is now correct and verified, and `isResponse` appears before Chen's question.
   - The re-label and triple "Start with" are gone, Chen asks one question, and the Dafna line is reworded.
   - Guy gives ground, and the section stays "The Debate Continues".
5. **Ch1:** resolved. The catchphrase is restored with "discipline problem", Noam goes straight to "eight sprints", "They never do" is cut, and Oded "scrolls back to `firstElement`".
6. **Cast page:** resolved.
   - Linoy: the four-overloads claim is gone, the "dare" line is back (minor wording issue), and "before giving it up" is supported by Ch7 :391–403.
   - Dima: "the one making the call" is supported by Ch13's Verdict, where Dima keeps the method optional over Oded's preference. "Then he gets specific" now follows the "Both have a point here" paragraph.
7. **Narrator and links:** resolved. Daniel states the 5.5 fact (Ch5:155), Gil states the guidance (Ch3:275), `isolatedModules` is a comment in the fence (Ch4:120), and Noam states the Zod fact (Ch4:503).
8. **Ch4 Verdict:** resolved. "Use or keep… even for a new service" and the learning cost are there; the last clause's wording is a minor issue.
