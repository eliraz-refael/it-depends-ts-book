# fable-editor — whole-book review (editor-in-chief perspective)

Snapshot root: `fullreview/snapshot/book/`. All `file:line` references are relative to that root.

## 1. Ledger (built while reading)

### Cast (canon from `00-prologue/02-meet-the-cast.md`)

| Name | Pronoun | Stance / tell | Catchphrase |
|---|---|---|---|
| Prof. Eli Typeworth | he | Wants the claim stated precisely; shrinks examples, sometimes drops a requirement | "Let us return to first principles." |
| Daniel Compiler | he | Opens a playground; wants version + diagnostic; dry humour | "The compiler disagrees." |
| Gilad Stacktrace | he | 3 AM / on-call; brings old precautions along | "Show me the stack trace." |
| Liron Closure | he | Lisp/Clojure; parables; warm; "In Clojure, we solved this in 2009" | "Complexity is a choice, not a necessity." |
| Sahar Firstclass | he | Scheme; looks at the caller; removal | "Simple made better." |
| Noam Kiperman | he | Type-safety absolutist; glasses; blocks PRs | "Over my dead type definition." |
| Oded Shipley | he | Velocity; Friday deploys; "fix it next sprint" | "We can fix it in the next sprint." |
| Gil Benchmark | he | Datasets, spreadsheet of 847 wrong assertions | "What does the data say?" |
| Eden Legacy | he | 3M lines migrated; "migration path?" | "I've seen this fail at scale." |
| Linoy Nightly | **she** | Experimental flags; release notes | "There's an RFC for that." |
| Chen Override | he | Asks questions, never proposes solutions; arms crossed 20 min | "But have you considered..." |
| Dafna Functor | **she** | FP purist; pipelines; mourns `reduce` | "That's just a map." |
| Guy Singleton | he | OOP; Java/C#; whiteboard class diagram | "Where's the interface?" |
| Dima Bridge | he | Synthesis; rare strong opinions | "Both have a point here." |
| Idan Greenfield | **she** | Parse-don't-validate; lives at the door; not a moralist | "Prove it by producing it." |

Bio facts to watch: Noam's team has the lowest error rates; Oded "graduated top of his class"; Gil's spreadsheet has 847 entries; Eden migrated 3M lines over 18 months; Chen "never" proposes solutions; Idan defers to Dafna once data is parsed; Guy and Dafna are "the book's recurring main event"; Liron/Dafna/Guy connection-closing anecdote; Daniel's Titanic line.

### Settings / shops (filled as read)

(filled below)

### Recurring code names

(filled below)

### Principles claimed per chapter

(filled below)

---

## 2. Findings by chapter

### 00-prologue

- `00-prologue/01-how-to-read.md:45` — "You'll get to know them in the next chapter. By the third debate..." — **clarity / minor**. The cast file is a prologue section, not a chapter; a tiny wobble, but it is the first page of the book. Say "in the next section" or "on the next pages".
- `00-prologue/01-how-to-read.md:11-15` — the sample exchange is quoted as "from Chapter 1". Need to confirm it appears verbatim in Ch1 (checked below).
- `00-prologue/02-meet-the-cast.md:15,17,33,47,63,65,79,81,209,261` — the bios have been rewritten into a late-book "calibrated" register (short declaratives, "They still disagree about that helper", "the cost of removing it belongs in the answer"). It sits oddly against the older, funnier bio paragraphs around it (Titanic, 847 entries, Friday deploys). **voice / minor**: the two registers in one file are visible; the newer paragraphs read like editorial notes about the character rather than a character sketch. Not wrong, but the cast page is where the fun is sold.
- `00-prologue/02-meet-the-cast.md:65` — "Linoy has asked him whether the abstraction was hard to explain or whether he had interrupted the explanation. They still disagree about that helper." — **AI-feel / minor**: silent-closer pattern ("They still disagree about that helper"), and the kind of self-aware editorial aside the brief flags.

### 01-the-type-system/01-any-vs-unknown.md

Ledger: Principle = "keep it `unknown` until you have checked enough to use it; an `any` owes the next caller an account of what's unchecked." Setting: no named shop; generic team. Facts: Noam's team = 8 people, internal tool, zero `any` for two years; Eden's last migration ended with 11 `any`s; tickets JIRA-4521, JIRA-7823; `formatResponse` had 47 call sites; Oded's analytics SDK "Tuesday". The how-to-read sample exchange (lines 414-418) matches verbatim. Good.

- `01-any-vs-unknown.md:196` — "In these snapshots, `Promise<UserProfile>` describes the value the promise will resolve to..." — **AI-feel / major**. A narrator paragraph wedged between Eden's opening line and his own code, explaining a generic type argument like a manual. Nobody in the room says it; it stops the scene dead. Same pattern at `:276` ("The next example previews a conditional type...") and `:617` ("Its return annotation, `data is PurchaseData`, tells the compiler..."). These onboarding asides are the single most visible "AI" tic in Ch1; move them into a character's mouth (Daniel is right there) or a footnote-style sidebar, not the narration.
- `01-any-vs-unknown.md:253` — Linoy: "This `T` stands for the array's element type. The return type keeps that same `T`." — **AI-feel / minor**. Documentation sentence in a character's mouth. Linoy's bio is "brilliant, occasionally incomprehensible"; here she sounds like a tutorial.
- `01-any-vs-unknown.md:565` — "Yes. What lets you remove the `any` underneath them?" — **clarity / minor**. Unattributed line after Noam's; it's Daniel, but there's no speaker tag and the previous paragraph was Noam. Add **Daniel**.
- `01-any-vs-unknown.md:408` — Dafna: "For a new service I'd look for a framework that uses a schema to validate the request and infer its type." — **voice / minor**. This is Idan's line by bio (she "lives at the door"; Dafna "has no opinions" about the boundary). Idan isn't in the chapter, so it's not a contradiction, but Dafna is speaking Idan's part.
- `01-any-vs-unknown.md:93,108` — "Six months later" vs "eight sprints" — **inconsistency / minor**. Consistent only with three-week sprints; a reader who assumes two-week sprints will wince. Pick one unit.
- `01-any-vs-unknown.md:349-351` — Chen: "Finally, something everyone can agree on." / Noam: "Don't get used to it." — **voice / minor**. Chen as the one celebrating consensus is against type; the joke lands but could be Dima's.
- Keep: Noam's "Let me tell you about *my* Tuesday" (:81), "You already block all my PRs" (:418), Liron's dragons (:533), and the Turn (:557-581), which really does turn on Noam's own overloads. The verdict (:585) is a rule a developer can repeat.

### 01-the-type-system/02-type-assertions.md

Ledger: Principle = "an assertion changes the type the compiler uses, converts nothing, checks nothing at runtime; write one only where you can say what you know that the compiler can't check, and how." Callback to Ch1 (Noam "localized lie", Dima) is accurate. Facts: 400 API calls / 40 components; JIRA-8901; Noam bans `!` except in test `beforeEach`. Verified with tsc 7.0.2: Daniel's claim at `:272` (palette typo rejected under `as` too) is correct (TS2352, "Property 'accent' is incompatible with index signature").

- `02-type-assertions.md:237` — "Noam leaves the factory on the screen. Oded leaves a comment beside the test naming the fields it is supposed to exercise." — **AI-feel / major**. This is the brief's named "leaves X beside Y" silent closer, word for word. The argument (factory vs partial assertion) is genuinely unresolved, which is fine, but end it on a spoken line, not a stage direction that pretends to be a resolution.
- `02-type-assertions.md:116-134, 291-302, 406` — Chen presents two whole sections (double assertion, `!`) as the explainer, coins "type laundering", and in Additional Takes offers a fix ("you can usually narrow with that check and delete the assertion"). — **voice / minor**. Bio: "Chen doesn't propose solutions... he never does." Here he is the chapter's lecturer. Keep the examples, hand the exposition to Daniel/Linoy and leave Chen the questions. (Tracked across the book; see cross-book list.)
- `02-type-assertions.md:304` vs `:352` — Noam: "I ban it ... with exactly one exception" then "I'll take `!` with a comment that says so." — **inconsistency / minor**. It's a concession in the heat of argument, which is fine, but "exactly one exception" is a bio-grade absolute; let Oded needle him about it ("That's two exceptions").
- `02-type-assertions.md:148` — Daniel: "A wrapper that merely hides the same assertion has not established anything new. Module augmentation can add declarations; it cannot repair every incompatible property type." — **AI-feel / minor**. Two documentation sentences stacked; the second is a caveat nobody asked for.
- `02-type-assertions.md:362-366` — Gilad's three paragraphs say the same thing three times (the failure is far from the assertion). — **AI-feel / minor**. Cut `:364`; `:362` and `:366` carry it.
- `02-type-assertions.md:402` — Oded and Gilad's exchange squeezed into one paragraph with an em dash. — **other / minor**. Format wobble in Additional Takes; split it.
- Keep: "fake mustache on a bug" (:136), "`satisfies` is TypeScript's apology for `as`" (:404), the `.has()`/`.get()` exchange (:328-352) which is a real argument with a real concession on both sides, and Gilad's "How will you find out when it stops being true?" which becomes the verdict's question. Good chapter.

### 01-the-type-system/03-interface-vs-type.md

Ledger: Principle = (not a rule) three questions: does other code need to reopen it; where should a conflict be reported; does it name something other than an object; else choose a convention. Verdict = `type` for data, `interface` for behavioral contracts and extension points. Setting: "the team", profile screen, `RequestState<T>`. Guy adapts (per bio) at `:339`.

- `03-interface-vs-type.md:33` — Eli's Principle is a decision procedure phrased as questions, not a testable rule. — **debate / major**. The brief's skeleton wants a claim someone can attack. Because no one states "use `type` for data" up front, the Debate has nothing to push against: Guy and Dafna each demo their default, and the "Turn" (:401-425) is simply Liron announcing the convention the Verdict adopts. It reads as a well-organised tour, not a debate. Fix: let Eli (or Guy) state the verdict's convention as the Principle and let Dafna/Linoy attack it; keep Liron's parable as the reframing that reconciles.
- `03-interface-vs-type.md:401-425` — The Turn doesn't turn anything; it's a parable plus a recommendation, and Daniel immediately notes it's unenforced convention. — **debate / minor** (same root as above).
- `03-interface-vs-type.md:137` — "Dafna checks the resulting properties." — **AI-feel / minor**. A stage direction with no content; she then says nothing about what she found. Cut or give her a line.
- `03-interface-vs-type.md:448` — `type UserId = string & { readonly __brand: "UserId" };` appears in the Verdict example with no explanation; branded types are Chapter 17. — **clarity / minor**. A Ch3 reader will not know what `__brand` is. Drop it or add a one-line comment pointing forward.
- `03-interface-vs-type.md:474-478` — "// interface: library extension points" over `AppConfig { port; host }`, a plain data object. — **clarity / minor**. Contradicts the convention stated three lines above unless the reader is told plugins are meant to augment it. Add that comment.
- `03-interface-vs-type.md:7,23,33` — three consecutive **Eli** speaker tags for one continuous speech. — **other / minor**.
- `03-interface-vs-type.md:182` — narrator drops a GitHub URL mid-scene. — **other / minor**. In print this is a bare URL in the middle of a conversation; footnote it.
- Keep: "The `extends` error message is a diagnosis. The intersection error message is a riddle." (:115); "I agree with a version of you that's more careful with words." (:397); Daniel's Additional Take about reading error messages (:483); the expression-problem exchange (:329-339) is short and honest.

### 01-the-type-system/04-enums-vs-unions.md

Ledger: Principle = "fixed set of values: start with a type; add a runtime representation when a caller needs to look up, list or name the values; check what the declaration emits." Facts: Oded onboarded Java engineers; "four hundred enums across twelve services"; `HttpStatus` numeric enum for the HTTP logger; Zod 4 (`z.enum(SdkStatus)`). Verified with tsc 7.0.2: string enum flows into the matching literal union (`:401`), raw string rejected by enum param (`:407`), and the alphabetical union order in the error at `:73` is what TS 7 actually prints.

- `04-enums-vs-unions.md:181-185` — Daniel explains `typeof HttpStatus` / `keyof` while `HttpStatus` on screen is still the enum from `:138`; the `as const` object he's describing only appears at `:188`. — **clarity / minor**. Reorder: show the object, then explain the derivation.
- `04-enums-vs-unions.md:263` — Linoy: "`ValueOf` is our alias for the union of an object's property types. We can reuse it for the next set of values too." — **AI-feel / minor**. Documentation sentence.
- `04-enums-vs-unions.md:501` — Noam's Additional Take ends with a narrator "See [Zod's enum documentation]" tacked onto his paragraph. — **other / minor**. In print it's a bare URL fused to dialogue.
- `04-enums-vs-unions.md:123` — narrator URL mid-scene (handbook). — **other / minor** (recurring pattern; see cross-book).
- Keep: Oded's "That's the line that makes me want to close the tab and go outside" (:245); Guy's "I'm the one maintaining that logger" (:206); the Turn (:419-433) is a genuine shift from mechanism to team capacity and Sahar is exactly his bio ("underestimates how much work a familiar convention saves"); Guy's Additional Take (:503). Verdict is long but a developer could repeat it.

### 01-the-type-system/05-narrowing-strategies.md

Ledger: Principle (Daniel, not Eli) = control-flow narrowing follows the check you wrote; a predicate annotation is trusted, not proved; "for external input, prefer building a typed value from the fields you've checked". Ends in **The Debate Continues** (result vs throw). Facts: `parseUser` / `ParseResult<T>` / `UserParseError` introduced here and reused later; `RequestState` discriminant is now `kind` (was `status` in Ch3); Guy calls back Noam's `ApiUser.parse(raw)` from Ch2 accurately (:201).

- `05-narrowing-strategies.md:309` vs `03-interface-vs-type.md:267` — `RequestState<T>` uses `kind` here and `status` in Ch3, with the same four states. — **inconsistency / minor**. Same named type, different discriminant two chapters apart; a reader who copied Ch3's version will trip. Pick one.
- `05-narrowing-strategies.md:40` — the actual rule ("prefer building a typed value from the fields you've checked") is the third paragraph of Daniel's opener, after two paragraphs of mechanism. — **clarity / minor**. Lead with it; it's the thing the chapter debates.
- `05-narrowing-strategies.md:95` — Chen: "And `"x" in null` throws. So does using any primitive on the right of `in`. Check that you have an object first." — **voice / minor**. Chen giving instructions, not asking. (Bio tracking.)
- `05-narrowing-strategies.md:153` — Daniel's sentence contains a Markdown link to the 5.5 release notes. — **other / minor**. Dialogue with a hyperlink inside it; footnote it for print.
- `05-narrowing-strategies.md:457` — Noam's Additional Take restates Idan's `:257` point almost verbatim. — **AI-feel / minor**. Cut it or give him something new (he's the one who wanted tests).
- `05-narrowing-strategies.md:434-436` — "The room has agreed to parse external input and keep the runtime checks in one place. It has not agreed on how every parser should report failure." — **AI-feel / minor**. Summary narration; acceptable in a verdict section but it reads like minutes.
- Cross-book tension (not a contradiction): Ch1's verdict code (`isPurchaseData(data): data is PurchaseData`, `01-any-vs-unknown.md:644`) and Guy's Ch1 adapter (`return body as CreateUserRequest`, `:395`) are exactly the shapes Idan argues against here. The book never acknowledges that its own Chapter 1 model answer wouldn't pass Idan's review. One line from Idan ("the webhook guard from the `any` meeting is the same shape") would turn this from a wobble into a thread.
- Keep: "Noam. Show me the signature again." (:134); Idan "Drop the `email` check from `parseUser`..." (:257) is the clearest demonstration of the chapter's claim; Noam's concession about `.parse` (:207); Guy/Idan residual disagreement matches their bios exactly. The Debate Continues is honest and the subject earns it.

### 01-the-type-system/06-generics-basics.md

Ledger: Principle = "use a type parameter when a caller needs a relationship between types in the signature; ask what supplies the type argument and what depends on it; a return-only `T` supplied solely by the caller is an assertion." Facts: Oded's billing function `Invoice -> PaymentPlan`; `logPayload`, `sortByName`, `get`, `createStore(null)`, `parseConfig<T>`; Eli opens with `ParseResult<T>` from Ch5 (good continuity).

- `06-generics-basics.md:28-34` — "**Oded Shipley**:" on its own line, then a blank line, then the quote (same at `05:48`). — **other / minor**. Format inconsistency with the rest of the book's inline speaker tags.
- `06-generics-basics.md:307-323` — Liron's lens/photograph Turn. — **debate / minor**. It's a reframing, not a turn; nothing changes hands. Chen's "What did the lens do?" rescues it by making Liron admit the image only goes so far. Acceptable, but the weakest Turn in Part 1 after Ch3.
- `06-generics-basics.md:329` — "Noam would keep `sortByName`... Oded would keep `sortEmployees`... The relationship test does not decide that timing question." — **AI-feel / minor**. Narrator summarising the two positions after the verdict; the table below already does it.
- Keep: Idan "Delete the cast, Daniel." (:254) and "Now I can't even find the unchecked claim by searching for `as`" (:264); Oded "Finally. A refactor that deletes something." (:99) and "I know where to look when payroll calls." (:165); `createStore(null)` (:213) is a real-world trap every reader has hit. The Principle is a rule a developer can apply.

### 02-advanced-typescript/01-conditional-types.md

Ledger: Principle = a definition ("in a constraint `extends` requires; in a conditional it asks whether the left is assignable to the right") rather than a rule. Setting: content pipeline, front matter, slugs; Linoy's PR with Oded's comment. Facts: Oded's audit "last month" deleted 11 unused generics after `logPayload` (Ch6); 206 `Exclude`/`Extract` uses; Noam's six-hour deploy block (matches bio). Verified with tsc 7.0.2: `Reply<any>` = both branches, `any extends unknown` = true branch only, `[any] extends [string]` = true branch — all as stated.

This is the book's best chapter and should be the calibration target for the rest.

- `01-conditional-types.md:17-26` — The Principle explains the mechanism but states no claim to test. — **debate / minor**. The chapter gets away with it because the PR gives it a concrete question (one conditional vs two functions vs overloads), but a reader asked "what's the rule?" will reach for the table, not the opening. One sentence from Eli ("Prefer the representation whose cases you can list") would fix it.
- `01-conditional-types.md:5-7` vs `:364` — Eli opens as if continuing from Ch6 ("Daniel pointed out that `extends` has another job"; "writes the `sortByName` signature again"), but Oded says his audit was "last month, after we looked at `logPayload`". — **inconsistency / minor**. Either weeks have passed or they haven't; "again" and "last month" fight.
- `01-conditional-types.md:98` — "**Eden Legacy** has had his arms folded for the whole exchange." — **voice / minor**. Arms-folded-then-unfold is Chen's signature in the bios (:183). Small bleed.
- `01-conditional-types.md:515, 596` — narrator URLs (4.8 release notes, handbook). — **other / minor**. Recurring.
- Keep, and use as the standard: "Okay. What is that." / "Types can do ternaries." / "Since 2.8." / "Nobody told me." (:63-77); "So it lies, but it only lies in one place. That's most of my architecture." (:251); the `Exclude` scene (:327-368), "So it's a loop." / "It is a loop."; Chen's "Does `never` vanish?" (:392) is the best Chen question in the book; the Turn (:531-580) is a true turn — the actual caller doesn't want the shape preserved, so the clever type was solving the wrong problem; Eden "Bring those. I'll bring the overloads." (:580).

### 02-advanced-typescript/02-mapped-types.md

Ledger: No Principle claim (the section defines `Partial`). Setting: account settings feature; Linoy's PR deleting three types; Guy, Oded, Eden, Daniel; later Noam. Facts: `User` (readonly), `EditableKey`, `UpdateUserRequest` (three fields), `ImportedUser` (nullable email), `Editable<T>`, `FormValues`, `FieldErrors<T>`, `Labels<T>`, `FormErrors<T>`. Verdict is narrated, PR-specific, no blockquote rule. Continuity into Ch9 ("Put that in another PR" -> "You actually opened another PR") is tidy.

- `02-mapped-types.md:5-41` and `:418-422` — No stated principle and no general verdict. The opening is "Guy asked her to restore one"; the close is a paragraph of who kept what. — **clarity / major**. A working developer cannot state this chapter's rule after one read, although it is there in Guy's mouth at `:398` ("The labels belong to these inputs. I can make that promise. I couldn't make it about the record and the request."). Promote that to a Principle/Verdict: *derive a type from another only where the two are meant to change together; a published contract is not*. The skeleton exists for a reason, and this chapter (with Ch9) is where the book stops following it.
- `02-mapped-types.md:226` — "Linoy leaves her repaired version in the review thread. Guy restores the published request definition and runs the same null-rejection check against it." — **AI-feel / major**. The "leaves X in the review" closer, named in the brief. Repeated in this chapter and the next (`:402`; `03:223`, `03:262`, `03:326`). Five in two chapters is a tic a reader will clock.
- `02-mapped-types.md:150, 203, 265` — narrator paragraphs with handbook/tsconfig URLs ("The remaining examples enable both..."; "She adds one to the type-test file, using [`@ts-expect-error`]..., available since TypeScript 3.9"; "The two [mapping modifiers] change the type."). — **AI-feel / minor**. Manual-voice intrusions; three in one chapter.
- Register: Ch8 is noticeably drier than Ch1-7 — stage directions ("Guy reads it." / "That works." / "Can I keep it?"), fewer jokes, more procedure. The settings-form story is good and the Turn (`:340-398`) is a real one (it isolates what Guy actually objected to: value-type coupling across a boundary, not derivation itself). But "fun to read while you learn" is thinner here. — **voice / major** (for the Ch8-9 pair; calibrate against Ch7).
- Keep: Daniel "Most people don't. It gets more work done that way." (:39); Oded "So this person needs an email address to tell us they write software?" (:298); "I was looking for a word like `Mutable`. You put a minus sign on `readonly`." (:259); Noam's shallow-`Readonly` take (:437-448) is useful and short.

### 02-advanced-typescript/03-template-literal-types.md

Ledger: No Principle claim (Gilad's question "Where can this come from?" is the real one). Setting: same feature, display preferences; `Settings`, `SettingKey`, `ChangeEvent`, `ChangeEvents<T>`, `on`/`publish` in `events.d.ts`, `publishChange`/`setSetting` in `writes.ts`, `restore.ts`, `eventNames`, `AuditEvent`. Verdict narrated, PR-specific. Daniel's `publish<SettingKey>("fontSizeChanged", false)` compiles (correlated-union honesty) — good.

- `03-template-literal-types.md:3-57` and `:389-393` — As Ch8: no stated rule up front and a narrated, PR-local verdict. The actual lesson (a constructed name type-checks but isn't greppable; keep literal names where you're enumerating anyway; derive where you're generic) is distributed across Oded/Gilad lines and never stated. — **clarity / major**.
- `03-template-literal-types.md:138-262` — two long sections ("That found the person listening", "Put the names somewhere") trace a demo's file layout: six files, two `rg` runs, a constants object that's then dropped. — **story / major**. The greppability argument is real and worth making once; here it's made three times with diminishing energy, and this is where I got bored for the first time in the book. Cut the constants-object section to a single exchange, or cut it.
- `03-template-literal-types.md:223, 262, 326` — "Oded leaves both files open." / "He keeps the candidate beside the diff." / "Linoy closes the audit example. The restore calls are still visible behind it." — **AI-feel / major** (pattern with Ch8). Three silent closers in one chapter.
- `03-template-literal-types.md:51` — Daniel's dialogue contains a handbook hyperlink. — **other / minor**.
- Linoy across Ch8-9 is patient, practical and never once sounds like "her `tsconfig.json` looks like a dare"; she never says "There's an RFC for that" in the book so far. — **voice / minor** (tracked).
- Keep: Gilad's opening ("Where can this come from?" / "Show me how I find those from this.") is him exactly; "I haven't put you on call for the font size." (:23); "Do we have a paid profile?" (:276) is a great section title and a great catch; Daniel "It has been very loyal to fourteen." (:435); the closing "Scratch file. You can approve the other tab." (:450).

### 02-advanced-typescript/04-infer-keyword.md

Ledger: No Principle rule (opens on Eden/Idan and a broken tracking page). Setting: courier SDK v4->v5, `safe()` Proxy wrapper, `Safe<C>`, `Result<T>`, `SafeCourier`, `CourierWithSyncCheck`, `attempt<T>`, `safeRequests`/`AsyncMembers`, generated `TrackingApi`; "forty callers", "a dozen" wrapped methods. Verified with tsc 7.0.2: `if (!promise)` compiles while `if (promise)` raises TS2801, exactly as Daniel says (`:249`).

- `04-infer-keyword.md:3-91` — The Principle section is a scene plus Daniel's definition of `infer`, closed by a narrator paragraph with a handbook URL (`:91`). The chapter's real claim — the title, "The Call You Didn't Make": *extraction reads a declaration (last signature, erased `T`); only a call carries the information you wanted* — is finally spoken by Daniel in Additional Takes (`:454-467`). — **clarity / major**. Put it at the top. As printed, a reader finishes the chapter knowing a lot about one Proxy and no rule.
- `04-infer-keyword.md:396-450` — Verdict is a dialogue about this SDK's upgrade, ending "Eden adds the remaining forwarding methods... Noam runs the invalid-code case again." — **AI-feel / minor** (silent closer) and **clarity / minor** (no general ruling).
- `04-infer-keyword.md:91, 135, 283` — URLs inside narration and twice inside Daniel's/Idan's dialogue. — **other / minor**.
- `04-infer-keyword.md:166-185, 301-322` — the Proxy implementation appears twice nearly verbatim, then the hand-written adapter, then the constrained wrapper. — **story / minor**. Dense; the chapter is the longest-feeling in Part 2. Second Proxy could be a three-line diff.
- Keep: the opening three lines (:5-9); "Nothing here opens a promise at runtime. Your parcel is still in transit." (:89); the `acceptTrackingCode("bad") // "accepted"` bug (:219-230) is the best real-world trap in Part 2 — a truthy promise; Noam "`as unknown as`. You'd send that back in a parser review." (:327) is the right callback to Ch2; Noam's closer "All that, and we're still calling it `Safe`." (:469).

### 02-advanced-typescript/05-advanced-generics.md

Ledger: No Principle rule (Eli at `:41` explains what the generic carries). Setting: export SDK, `ExportSpec`, `ExportBuilder<S>`, `forNightlyExport`, `createExport`, `withNightlyDestination`, `selectOrders`, `ordersTo`, `repoint`; reporting package vs application; manual-export command vs nightly job. Ends in **The Debate Continues** (builder vs data). Verified with tsc 7.0.2: `sourcePreset.source("customers")` error text including the "reduced to 'never'" elaboration is verbatim; `repoint(sourcePreset)` and `lessSpecific` compile as claimed.

- `05-advanced-generics.md:41` — Eli's "principle" is a description. The sharp, testable rule is in his own mouth at `:424`: "Nothing about `{}` establishes that the runtime object has no source. Type parameters affect compatibility through the members that use them." — **clarity / major**. Lead with it; it's what Oded trips on twice and what Chen's closing question is about.
- `05-advanced-generics.md:89, 127, 426` — three narrator paragraphs, each with a handbook URL, explaining generic defaults, `this` parameters and generic compatibility. — **AI-feel / major** (pattern across Part 2). They read as inserted documentation; each time the room goes quiet while the manual speaks. Give the sentence to Eli or Daniel, drop the link to a footnote.
- `05-advanced-generics.md:284, 436` — "Guy leaves the two variables visible. Dafna puts her version below them." / "Oded keeps the error from `repoint` beside the builder and function examples." — **AI-feel / minor**. Silent closers.
- Keep: the opening (:5-9), "So the friendly default made a perfectly ordinary annotation too vague." (:163), "Put this example in the quickstart. People will write my annotation." (:195), "You're both selling me the same spread with different packaging." (:258), and Chen — who asks only questions all chapter and ends it on one (:458). This is the Guy/Dafna main event the bios promise, and it works; the open ending is earned.

### 02-advanced-typescript/06-variance.md

Ledger: No Principle rule (opens on a paged receipt). Setting: export runner, `createCache`, `ResultCache<T>`, `CsvResult`/`ExportResult`, receipt vs dashboard/panel, archive -> ZIP, `ResultReader`/`ResultWriter`, `lastCsv`/`latestDownload`, `publishCsv`, `archiveAction`. Links to Ch11's `ExportBuilder` (`:11`) and Chen's assignment (`:384`) accurately. All variance claims check out on reading (method bivariance survives `in out`; function properties fix it; `MethodCache<out T>` accepted).

- `06-variance.md:3-89` and `:359-367` — No rule up front; the Verdict is a specific boundary ("Receipts get a CSV reader. Labels get a general reader...") and the chapter's portable lesson (*declare contract members as function properties, not methods, or `strictFunctionTypes` won't protect the parameter; give each consumer the narrowest view; variance annotations only compare instantiations of the same generic*) is never stated in one place. — **clarity / major**. This is the chapter a reader most needs a takeaway from, because the mechanism is counter-intuitive.
- `06-variance.md:197, 213` — narrator URL paragraphs ("The handbook limits variance annotations to..."; "The strictFunctionTypes rule checks... The exception is part of strict checking, not evidence that this repository forgot to enable it."). — **AI-feel / major**. The second one is the narrator answering an objection Eden just raised, in a footnote voice. Give it to Daniel, who is standing right there.
- `06-variance.md:266, 311, 332` — Linoy: "That's covariance." / "That's contravariance." / "TypeScript infers it from the members. `out` would describe the reader, `in` the writer." — **voice / minor**. Glossary sentences. Linoy's job in this book has drifted from early adopter to explainer.
- Register: no joke in the chapter. Not one. — **voice / major** for the Part 2 arc: Ch12 is the point where a reader who bought "fun to read" notices the fun left. The bug is good; the people are grey.
- `06-variance.md:367` — "Eden leaves the adapter reproduction in the check suite and removes the CSV cache from the panel's setup." — **AI-feel / minor**. Silent closer.
- Keep: the opening three lines; Daniel "It doesn't repeal the method exception." (:211); Eden's "That one didn't break a receipt. You've broken its callers too." (:245) is a real cost that most variance tutorials skip; the two-caches resolution (:336-357) is honest about the extra write.

### 02-advanced-typescript/07-declaration-merging.md

Ledger: No Principle rule (Gilad's "the expectation depends on which JavaScript has run" at `:54` is the thesis). Setting: registration desk, `label-kit` + `label-kit/frame` plugin, `labels.ts` integration module, `badge.ts`, `web.ts`/`batch.ts`; Dima, Gilad, Oded, Idan, Chen. Claims about type-only imports not emitting, TS2722, TS2305 ambient-module shadowing, optional/required merge conflict all correct on reading.

- `07-declaration-merging.md:3-54` — again no stated rule; Gilad's observation is the closest. The portable rule (*an augmentation describes what the program will look like after some JavaScript runs; put the declaration and the side-effect import in the same module and import that; a type-only import proves nothing about loading*) is spread across `:132`, `:201`, `:254`. — **clarity / major**.
- `07-declaration-merging.md:60` — Oded: "`Label` is a class, but the interface merges with its instance type. We still have one constructor." — **voice / minor**. Oded speaking handbook; he's the one who should be asking.
- `07-declaration-merging.md:62, 201, 246, 292` — narrator explanation paragraphs, two with URLs. — **AI-feel / minor** (pattern). `:201` is necessary content, but it belongs to Idan, who starts the thought ("Its type. Look at the emitted formatter.") and then the narrator finishes her sentence for her.
- `07-declaration-merging.md:260, 268` — "Oded leaves the optional member in the diff." / "Gilad adds the standalone batch run beside the web run." — **AI-feel / minor**. Silent closers.
- `07-declaration-merging.md:290` — Chen: "Put the import back. Without it, that file supplies an ambient module declaration..." — **voice / minor**. Chen instructing. (Tracked.)
- Keep: "Show me one printing." (:7) and "Show me the stack trace." (:106) — Gilad used right; "Can we merge twelve lines now?" / "You're past twelve." (:151-153); the type-only-import Turn (:172-211) is a genuinely good trap and a true turn; Gilad "Don't turn the check into optional chaining and quietly print a different badge." (:248); Chen's "Who removes our patch when the plugin ships its own declarations?" (:326).

### 03-patterns-and-design/01-error-handling.md

Ledger: Principle (Liron) = "when you catch and return an error value you also decide the function can finish normally; in an async function that fulfils the promise; before returning, check whether the awaiter still needs the rejection to stop or undo work." A real rule. Setting: booking page, party of seats, `bookParty`, `SeatRefused`/`Failure`, `Store.transaction`, `testStore`, `Result<T, E>` (two params; Ch10's `Result<T>` had `error: unknown`, Ch5's `ParseResult<T>` had `reason`/`input`), `tryHold`, `transactionResult`. Dafna vs Guy; Gil runs the tests; Sahar and Liron cameo. Consistent with Ch5's open ending (Dafna wants the refusal in the type; Guy accepts the Result with an outer catch — Guy adapting, per bio).

- `01-error-handling.md:84` — "The examples run one transaction at a time; this copy-and-replace model does not provide concurrent transaction isolation." — **AI-feel / minor**. A caveat nobody in the room would raise, in the narrator's voice.
- `01-error-handling.md:152, 389` — narrator URL paragraphs (never check; `useUnknownInCatchVariables`). — **other / minor**.
- `01-error-handling.md:365-375` — Verdict opens with narration ("Dafna removes the catch... She keeps... and leaves...") before the characters speak. — **AI-feel / minor**. Let Dafna say it.
- Cross-book: three differently-shaped result types by Ch14 (`ParseResult<T>` Ch5/6, `Result<T>` Ch10, `Result<T, E>` here). — **inconsistency / minor**. Different teams can have different types, but the book never says so and Ch24 (monads) will presumably pick one; worth a sentence somewhere.
- Keep: the Principle; the Turn (:166-214) — a caught refusal fulfils the callback and the store commits A1 — is the best "the type was right and the program was wrong" moment in the book; Dafna's "That `await` keeps the rejection inside the `try`, too." (:243) is the return-vs-return-await point most books skip; Sahar "You added `tryHold` to test this. If you remove it, which part of the booking needs the adapter?" (:357) is exactly his bio; Dafna "I haven't made JavaScript stop throwing." (:345).

### 03-patterns-and-design/02-branded-types.md

Ledger: Principle (Eli) = "a brand distinguishes same-representation values; if the brand also promises a check, examine how values are created and changed without assertions — or the brand outlives the fact." A real rule. Setting: export dialog From/To, renderer `first`+`count`, `previewNumbers`, `PageNumber`/`PageCount` (unique-symbol brands), `PageRange` object brand defeated by spread, `CheckedRange` class with `declare private readonly checked: void`, Eden's `PageDraft`/`requestFrom`. Noam vs Eden; Oded, Chen, Eli. Claims about spread carrying the marker, private member blocking spread, `moveStart` compiling and throwing, and the optional-marker brand accepting `4` are all right on reading.

- `02-branded-types.md:86, 245` — narrator URL paragraphs (nominal-typing playground + symbol docs; readonly compatibility). — **other / minor**.
- `02-branded-types.md:318, 322` — "He leaves `requestFrom` in the patch." / "Oded adds the five-to-four edit to both action tests. He leaves the test of `count: selection.last` in the compiler checks." — **AI-feel / minor**. Two silent closers in the Verdict.
- Cross-book: Ch3's verdict showed `type UserId = string & { readonly __brand: "UserId" }` (string-keyed brand) with no comment; this chapter uses only unique-symbol brands and never mentions the `__brand` spelling. — **inconsistency / minor**. A reader who copied Ch3's shape gets no bridge. Either align Ch3 or have Noam say "the string-key version works the same; this one can't collide."
- `02-branded-types.md:201` — "He replaces the object brand with a class and changes `requestOf`'s parameter to `CheckedRange`; its body stays the same." — **clarity / minor**. The replaced `requestOf` is never shown, and its body still does `(range.last - range.first + 1) as PageCount` — i.e. the "stamped zero" problem Noam admitted at `:180` is still there for any `CheckedRange` created... no, `create` checks order, so fine; but say so, since `:180` just made the reader suspicious of that line.
- Keep: "Your safety patch has two assertions in it." (:78); "I was about to ask for named arguments. We have named arguments." (:47); Noam's honest "I asserted that there was. Now the checker carries that property into the copy." (:180); Chen's optional-marker take (:326-333) is short and lethal; Eli's shared-link coda (:337).

### 03-patterns-and-design/03-runtime-validation.md

Ledger: Principle (Gilad) = "at a boundary choose which input to reject, preserve, translate; a successful parse doesn't tell every caller it's safe to act." Setting: carrier webhook, tracking page (same world as Ch10), refund worker, `KnownUpdate`/`CarrierStatus`, `held_at_customs`, three-strikes delivery pause, `Receipt`/inbox, `OpenStatus` tagged union, `Projection`. Zod 4 API (`looseObject`, `strictObject`, `.catch`) used correctly. Noam = closed enum + review; Idan = open tag; Oded = "skip" (wrong); Eden = keep raw.

- `03-runtime-validation.md:52, 67` — two narrator paragraphs of integration terms (inbox semantics, retry/pause policy). — **AI-feel / minor**. Necessary facts, but delivered as a spec. Gilad could read the carrier's terms aloud.
- `03-runtime-validation.md:363` — Verdict is a narrated summary paragraph. — **clarity / minor**. The rule is sayable ("acknowledge and store raw; translate at one owner; unfamiliar means review, not skip") but isn't said as a rule.
- `03-runtime-validation.md:138, 380` — narrator URLs (Zod docs). — **other / minor**.
- Keep: "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived." (:79); "I was hoping not to meet the next one today." (:89); the Turn (:212-254) — Oded's `skip` turning a split status into a silent non-refund is the right kind of wrong; Idan vs Noam at `:250-252` is a real argument about where discipline lives; Gilad's idempotency take (:384).

### 03-patterns-and-design/04-immutability.md

Ledger: Principle (Liron) = "ask what each holder expects to keep: current state or the value handed earlier; a history holder must get a value that won't change; one writer doesn't make a live view a snapshot." Setting: checkout, "Was 80. Now 80.", `Quote`, `applyPromotion` (mutating package API), `quote()` frozen, `CartPricing` (`#current`, `view()`, `snapshot()`), `ReadPrice` vs `PriceView`, `valueCheckout`. Verdict has a blockquote rule (:344). TS2540/TS4104/TS2345/TS2739 codes correct; Gil's 499,500 is right; `Object.freeze(new Date())` not freezing the clock is right.

- `04-immutability.md:5-9` — three paragraphs of Principle. — **clarity / minor**. The rule is there but a reader has to assemble it; the first sentence of `:7` ("A holder that needs history must receive a value that won't change") is the rule; lead with it.
- `04-immutability.md:90` — narrator URL. — **other / minor**.
- Keep: *Was 80. Now 80.* (:15) is the best hook in Part 3; the Turn (:199-218) — frozen getters still reading live state, `Object.isFrozen` true — is a true turn; Guy's "Where's the interface?" (:244) is the catchphrase used in earnest; Dafna/Guy on `ReadPrice` vs `PriceView` is the bios' main event done in six lines; Eden "Adding `readonly` was a smaller diff. It just didn't do this job." (:350); Gil counting copies not milliseconds (:372).

### 03-patterns-and-design/05-pure-functions.md

Ledger: Principle (Eli) = "make anything that can change the answer an explicit input; reuse an answer only while those inputs can't change; put required work where a saved answer can't skip it." Setting: support desk SLA dashboard, 20,000 tickets, P1 = 4 business hours Mon-Fri 09:00-17:00 Jerusalem, `memoizeBy`, `withTtl`, `assess`/`evaluate`, `deadlineFor`, `recordRisk`, `makeSla`, `SlaPolicy`, digest host on UTC. Dates check out (2026-11-09 is a Monday; 07:00Z = 09:00 Jerusalem; TZ table at `:273-277` is right; walk counts at `:216-221` are right).

- `05-pure-functions.md:5-7` — two dense paragraphs of Principle with four sub-rules and a hedge ("Or decide to accept some staleness. But an acceptable old answer is still an old answer."). — **clarity / minor**. Correct, but it reads like an abstract; a developer will remember Dafna's "Show me where it asks the clock." (:85) and not this.
- `05-pure-functions.md:281` — narrator sentence with four hyperlinks (ECMA-262 x2, Node TZ, ECMA-402). — **other / minor**. The heaviest URL cluster in the book; in print it's a sentence of brackets.
- `05-pure-functions.md:214-221` — Oded builds and presents the benchmark table; Gil is absent from the chapter. — **voice / minor**. Not a contradiction, but the measuring scene is Gil's by bio and the book doesn't use him.
- Keep: "Nobody changed anything. That's the interesting part." (:19); "I cached the answer to a question that changes while the ticket sits there." (:83); "Did the lead agree to the extra minute?" (:137); Chen's Turn (:229-265) — "When `getHours()` says nine, whose nine?" — is the purest expression of the chapter's principle and the second-best Chen moment after "Does `never` vanish?"; Oded "Friday tickets walk the whole weekend." (:311).

### 03-patterns-and-design/06-imperative-vs-declarative.md

Ledger: Principle (Sahar) = "filter/map for per-item work; before replacing a loop ask what carries, where it stops, what must be ordered; a return from a `reduce` callback ends the call, not the reduce." Setting: payouts planner, Dafna's `skipping` refactor, seller complaint about queue order, `original`/`skipping`/`folded`/`looped`/`split`, Gil's 78,125-case replay, finance's accumulation proposal, `fillThenReserve`. Verdict renames: `stopAtFirstBlocker = looped`, `fillAvailable = skipping`. I checked every payment-day table by hand (reset, accumulation, N=2 reservation) and the "thirteen payout-days"; all correct. Inferred predicate for `isReady` (TS 5.5) and the TS18048 filter example are right.

- `06-imperative-vs-declarative.md:5-7` — The Principle tells the reader the bug ("returning from a `reduce` callback ends that call, not the `reduce`. If you turn a stop into a skip...") 100 lines before Dafna discovers it. — **debate / major** (pattern from here to Ch24: the Principle has become an abstract of the chapter). It kills the discovery at `:117-119`, which is otherwise well staged. State the claim ("start with filter/map; keep the loop when the stopping point matters") and let the `reduce` fact arrive with Chen's question.
- `06-imperative-vs-declarative.md:232-336` — The Turn leaves TypeScript entirely for ~100 lines of payout-scheduling policy (reset vs accumulation, starvation, reservation thresholds). — **story / major**. It's good thinking and Gil/Liron are in character, but a reader who opened "imperative vs declarative" gets a queue-fairness seminar; the code lesson ended at `:230`. The reversal that the "bug" is a legitimate policy is worth keeping; cut the accumulation/starvation half to a paragraph and a one-row table, or move it to an Additional Take.
- `06-imperative-vs-declarative.md:15` — narrator quotes the support reply. — **AI-feel / minor**. Gil could read it aloud.
- Keep: Dafna's opening motivation (:11); "I translated the total, but lost the stop." (:119); Dafna refusing the clever `findIndex` because "I just shipped a bug by following the total and missing what the callback would do next" (:208) is a character learning on the page; `const fillAvailable = skipping;` (:343) is a quietly funny verdict; the Additional Take on `filter` not narrowing an optional property (:360-391) is the single most useful eight lines in Part 3.

### 03-patterns-and-design/07-currying-partial-application.md

Ledger: Principle (Daniel) = "partial application vs currying defined; a shared module owns the first call when it does work only the module can do; the first call is still a call; `map` passes element, index, array." Setting: Dima's pricing package, checkout vs reporting, `lineTotal`, `lines.map(lineTotal)` -> 100,99,98, `Discount` object, `discountedBy`, tiers/`prepare`/`evaluate`/`priceWith`, empty-list-hides-invalid-promotion Turn. Verified with tsc 7.0.2: `pair({a:1},{b:2})` infers `{a: number; b?: never} | {a?: never; b: number}` exactly as Daniel says (`:359`).

- `07-currying-partial-application.md:5-7` — Principle spoils the opening bug ("`map` passes the element, index and array. Write an arrow if you mean to forward only the element."). — **debate / major** (pattern).
- `07-currying-partial-application.md:11-56` — the index-as-discount bug is the parseInt trap every JS developer knows; fine as a hook, but it takes 45 lines and the whole room to find it. — **story / minor**. Daniel can say "the index" at `:47` and move on.
- Keep: Gil's opener "The second item is cheaper than the first." (:13); "The zero wasn't my default." (:49); the `priceWithExtra` callback to the opening bug (:260-276) is well built; the Turn (:296-333) — an empty run hides an invalid promotion — earns the Principle's "the first call is still a call"; Dima, for once, owning something and saying "This one earns its entry point because the package owns the preparation." (:343) — the best Dima line in the book.

### 03-patterns-and-design/08-hof-patterns.md

Ledger: Principle (Gilad) = two paragraphs covering idempotency keys, don't-retry-timeouts, AbortSignal, detached `this`, lost overloads. Setting: notification job, `withRetry`/`withTimeout`, `Send`/`SendAttempt`, `GatewayClient`, `RetryingSender`, `keyedClient.sendOnce`, "unconfirmed". The `this`-parameter claim (`:210-215`) is correct (targets without a `this` type don't check it); overload loss through `forward` (`:363-365`) is correct; higher-order generic preservation (`:367-370`) is correct.

- `08-hof-patterns.md:5-7` — The Principle is 230 words and contains every finding of the chapter including the two Additional-Take facts. — **debate / major** (the worst instance of the pattern). A reader who reads it has no reason to read the chapter; a reader who skips it loses nothing. Gilad's actual claim is one sentence: "A rejection doesn't prove the work didn't happen."
- `08-hof-patterns.md:339-347` — Verdict opens with a narrated summary paragraph. — **AI-feel / minor**.
- Idan carries the AbortSignal redesign (`:146-193`). — **voice / minor**. It's fine work, but it's not "the door"; her bio says she has no opinions past the parser. Guy or Gilad could own it.
- Keep: "Please tell me the customer didn't get the message." / "Which copy?" (:13-15); the trace tables (:113-121, :264-268) are the clearest way to show the bug and the book should use this device more; "I'd rather have one uncertain send than three definite ones." (:278); Guy "It can't clear a timeout or a lost reply." (:276); Eli's forwarding-wrapper take (:351-373).

### 03-patterns-and-design/09-config-to-function.md

Ledger: Principle (Liron) = "if anyone needs to save, edit or explain a decision, store data plus the evaluator's name and version; test the round trip." Setting: risk console + orders service, order o42, `LivePolicy.extraHold` lost by `JSON.stringify`, `Json` type, `evaluators["release-a81f"]`, `Condition` tree vs `Template`, Gil's 8 samples (5 holds; 2 extra under `tooBroad`), 6/2/1 request table. All sample counts verified by hand.

- `09-config-to-function.md:5-7` — Principle is long and the second paragraph pre-classifies the "next change" argument the Debate then has. — **debate / minor** (pattern, milder here; "Lisp let me treat code as data" is good Liron).
- Keep: "We asked the record for a reason. It gave the policy an alibi." (:66) — title-grade line; Chen "What did the test save?" (:52) and "And if someone puts `any` inside the outer `any`?" (:277); "So the tree isn't the reason that mistake gets caught. The replay is." (:297); Gil "I can't count requests they didn't file." (:321); Sahar's third-regrouping trigger (:323); the last exchange answering the question the chapter opened with (:356-358). This is the best-constructed debate in Part 3: three real positions, data, and a decision with a trigger.

### 03-patterns-and-design/10-monads-light.md

Ledger: Principle (Eli) = "if the next step returns a plain value use `map`; if it returns the container use `flatMap`; promises' `then` does both; don't name a method `then` unless it keeps the promise contract." Setting: catalogue availability previews, `Res` class with `map`/`then`, `loadPreview`, Guy's worker counters, `andThen`, `plainPreview`. The `Awaited`-through-`then` claim at `:169` is right, as is `Promise.resolve(preview("7"))` pending.

- `10-monads-light.md:7` — "Don't give an object a `then` method unless it keeps the promise contract." in the Principle hands the reader the Turn before the story starts. — **debate / major** (pattern). This chapter's reveal (`:196-214`) is the best in Part 3 and the Principle spoils it in one sentence.
- `10-monads-light.md:373` — narrator URL sentence to the ECMA-262 spec at the very end. — **other / minor**.
- Keep: "Still Waiting for No" (title) and "The one that said no stock." / "Then it's finished." / "I'd like you to tell the worker." (:15-19); "Wait. The promise is calling *my* `then`?" (:196); "The worker is waiting for an answer about whether it answered." / "And I taught it to say nothing on no." (:212-214); Dafna's three-sentence monad (:143) is the right weight for "light"; Sahar "Or no method." (:276); Linoy's closing admission (:354).

### 04-the-real-world/01-migration-strategies.md

Ledger: Principle (Daniel) = "a migration changes an implementation while callers still use it; keep their contract or verify them; `allowJs` emits, only `checkJs`/`@ts-check` reports; a file outside `include` that nothing imports isn't checked." Setting: storefront, eight months into migration, `"type": "commonjs"`, `module: Node16`, `slug.js -> slug.ts` with `export default` breaking `require("./slug")`, `export =`, `checkJs`, `@ts-nocheck` exception list with owners, `sitemap.js`, `scripts/backfill.js`. TS2349/TS7006/TS2345 and the five implicit-any parameters all check out.

- `01-migration-strategies.md:5-7` — Principle is the chapter's conclusions (including the `include`/`@ts-check` detail from the Turn). — **debate / major** (pattern).
- `01-migration-strategies.md:23` — "There is no `strict` setting. On their TypeScript 7 compiler, it defaults to true." — **AI-feel / minor**. Narrator footnote; Eden can say it.
- `01-migration-strategies.md:130` — Daniel: "In this build, yes." about the default import still working with `export =`. — **clarity / minor**. True (Node16 implies `esModuleInterop`), but the hedge invites the question and nobody answers it; one clause would do.
- Keep: "I picked the boring one." (:11); "I converted the test out of catching the conversion." (:108) — the chapter in one line; "And the old test stays old on purpose." (:324); Noam's argument for global `checkJs` + visible opt-outs (:187-195) is a real position with a real cost; Chen's scratch-branch experiment (:236-266) is a proper Turn.

### 04-the-real-world/02-monorepo-type-sharing.md

Ledger: Principle (Gilad) = "which declarations is the caller checked against; which implementation will the import load; what rebuilds it; use public exports; if two same-named types won't assign and the error shows source vs built paths, fix the import, don't assert." Setting: `@shop/money` (`#cents`), `@shop/cart`, `apps/api`, `generated/release.ts`, relative import into money's `src`, TS2741 on `#cents`, runtime "Cannot read private member", project `references`, `customConditions: ["@shop/source"]`, Node type-stripping refused under `node_modules`. Dima owns the build graph; Linoy runs the source-runtime experiment (finally in character: "Node 22 can strip these types").

- `02-monorepo-type-sharing.md:5-7` — Principle second paragraph is the chapter's conclusions (including "fix the import instead of asserting them equal", which is the Debate's first beat). — **debate / major** (pattern).
- `02-monorepo-type-sharing.md:17-37, 89-104, 211-218, 247-278` — four config blocks and a lot of path narration before the first laugh after `:11`. — **story / minor**. Necessary, but the chapter reads as a runbook with dialogue; the trace-table device from Ch21 would help ("what the compiler read / what Node loaded / what the image has").
- `02-monorepo-type-sharing.md:124` — "He leaves both files open." — **AI-feel / minor**. Silent closer.
- Keep: "I have parsed the money. Apparently it isn't money." (:11); "I was starting to feel redundant. I could delete my arguments and nobody would notice." (:222); "We have spent quite a while agreeing on fifteen dollars." (:334); Gilad "Then run the copy. We aren't shipping the link." (:304) and "The path is part of the incident." (:316); Gil's "two emitted, one loaded, then two, this image ships one" summary (:332).

### 04-the-real-world/03-testing-typed-code.md

Ledger: Principle (Sahar) = "write down the promise; usage tests vs exact-result tests; break the promise and watch the test fail; `@ts-expect-error` is satisfied by any error; assignment accepts `any`; include type-test files; the runtime runner may execute them." Setting: pre-order PR, `Draft | Paid | PreOrder`, `ship`, stale `@ts-expect-error` satisfied by a missing `currency`, `orderRow`/`Equal`/`Expect`, `node --test` discovering `test/ship.types.ts`, `type-tests/` not in `include`, `--listFilesOnly`, runtime glob. Tool versions "TypeScript 7.0.2 and Node 22.23.4" (consistent with Ch27).

- `03-testing-typed-code.md:5-7` — The Principle lists all five traps the chapter then springs one by one. — **debate / major** (the pattern's second-worst instance after Ch21). Sahar's claim is one sentence: "See the test fail before you believe it passes."
- `03-testing-typed-code.md:96-124` — the history-archaeology beat ("Currency arrived in March... restore the source and tests from then") is told, not shown, in a dense paragraph of Noam narrating his own git operations. — **clarity / minor**. One short code block of the March-era fixture would be clearer than the prose.
- Keep: "It can't be green." / "I can refresh it, but I don't think that'll help." (:11-13); "I have accidentally passed two different tests with one comment." (:124); "I have rarely been congratulated for breaking a build this enthusiastically." (:143); Sahar "Why are we assembling two objects to get two fields?" (:243); "our test of the forbidden call is making the forbidden call." (:288); the closing "Can I write 'type tests green' now?" / "Yes." / Oded waits. / "I was finished." (:423-429) is the funniest ending in the book.

### 04-the-real-world/04-performance-vs-safety.md

Ledger: Principle (Daniel) = "before trading a constraint for speed, measure the saving and say what newly compiles; say whether you're speeding up checking or running; counters aren't seconds; name who catches the mistake that now compiles." Setting: i18n `t()` with `Paths`/`At`/`Params`/`Args`, Oded's loose signature, "Same 387 bytes", 2,000-key synthetic catalogue, four-signature table (6 / 13,189 / 39,641 / 118,255 instantiations), Linoy's separated generic (callback to Ch9's `publish<SettingKey>` — accurate), distributed whole tuple (118,628 instantiations, 0.255s), `--generateTrace`, `--pprofDir`, `mapTypeEx` pinned to a typescript-go commit. Gil's best chapter.

- `04-performance-vs-safety.md:277` — a GitHub permalink with a 40-character SHA and line range, in narration. — **other / minor**. Daniel's "Don't build on the name." covers the fragility, but in print this is a line of hex. Footnote with "checker.go at the 7.0.2 tag" instead.
- `04-performance-vs-safety.md:168-173, 254-257` — the numbers are presented as measured medians on 7.0.2. — **technical / note, not a defect**. If these were not actually produced by the described runs, this is the one place in the book that would be caught by a reader with a laptop. I'm flagging it as the highest-stakes factual claim in the book, not as an error.
- Keep: "The *type check* is faster. That's what the title says." / "The customer doesn't get the title." (:13-15); "Same 387 bytes." / "I did say type check." / "I'm keeping that number for when somebody changes the PR title." (:103-107); Gil "Stop moving the furniture." (:177) and "Those are whole-version comparisons, not charges we can add up into a bill." (:181); "Please tell me we're not rejecting the faster one for doing more work." (:261); the title change at `:313` as the verdict; "I'd hate to spend the saved time naming this PR." (:317).

### 05-bonus-ai-and-typescript/01-prompting-for-typescript.md

Ledger: Principle (Eli) = "put the decisions in the signature and in examples of success and rejection; send config and the check command; run it; compiling through `any`/`as`/`!` establishes nothing; someone still owns what you meant." Setting: Dima's refund-webhook parser, `reset.d.ts` making `JSON.parse` return `unknown`, `Result` with `error: string`, two implementations that both pass two tests, `Number("") === 0`. Rule compliance: assistant unnamed; its requests, replies and files are shown as saved artifacts. Good. Tool versions consistent (7.0.2 / 22.23.4).

- `01-prompting-for-typescript.md:74` — `"@types/node": "26.5.1"` beside Node 22.23.4. — **inconsistency / minor**. Not wrong, but a reader will ask why the types are two majors ahead of the runtime; pin a 22.x types package or say why.
- `01-prompting-for-typescript.md:121` — Idan: "like Chapter 13's augmentation". — **inconsistency / minor**. The only in-dialogue reference to a chapter *number* in the book; everywhere else characters refer to "the `any` argument" / "the generics argument". Correct number, wrong convention.
- `01-prompting-for-typescript.md:63-96` — manifest and tsconfig in full, mid-scene. — **story / minor**. Bonus 2 handles the same need in one sentence ("the book's strict ES2022/Node16 profile"); do that here.
- Keep: "It validated the vibe." / "And gave us an excellent interest rate." (:49-51); Chen "You could send this conversation." (:57) and "Very harmonious." (:184); Idan catching the dead `typeof` after `Number` (:231) — exactly the kind of thing generated code does; "A successful refund of absolutely nothing." / "We should send a receipt." (:268-270); "Which file says that?" (:276); "Two was before we successfully refunded nothing." (:302); "Neither were you. A serious omission." (:374). Dima is dry and specific here, better than his bio.

### 05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md

Ledger: Principle (Liron) = "a valid tool call is a proposal; bind the executor to the authenticated customer and check ownership against the order; generate the schema from what the parser accepts (`io: "input"`); facts come from records, outcomes from results; a parsed `refundIssued` boolean issued nothing." Setting: Alice's session, o-12 (EUR) / o-17 (Bob, USD), `.default("USD")`, `defineTool`/`dispatch`, `z.toJSONSchema(..., { io: "input" })`, `forSession`. Zod 4.6.2 pinned. Rule compliance: assistant unnamed; transcript and tool calls shown as saved `calls.ts`. Good.

- `02-type-safe-agent-patterns.md:7` — the Principle names both reveals (`io: "input"` and the `refundIssued` boolean) before the story. — **debate / major** (the Part 3 pattern reaching the bonus act).
- `02-type-safe-agent-patterns.md:70, 155` — narrator version paragraph and a Zod-docs paragraph with URL. — **AI-feel / minor**.
- Keep: "Did the assistant convert it?" / "No. We did something worse. We didn't convert it." (:19-21); "There's your conversion department. One default." (:112); "Congratulations to the descriptions." (:184); "Why does that field decide anything? The order already has the answer. We're asking the caller for a second opinion." (:207); "We could add a customer ID—" / "Whose answer would that be?" / She stops typing. / "The caller's." (:253-259) — a stage direction that earns its place; "it shouldn't get to become Bob to refund it" (:261); "refusing every refund would look beautifully secure" (:358); "The customer has expressed no preference about our schema." (:376).

### 05-bonus-ai-and-typescript/03-reviewing-ai-code.md

Ledger: Principle (Daniel) = "emit declarations before and after with the same compiler and settings; if the patch changed a caller to compile, put the old caller back and find what required it; a green compile speaks only for the revised program." Setting: `orderStatus` lookup-table refactor, mutable table widening to `string`, `assertNever` fallback replaced, `status.d.ts` diff, Eden's mobile adapter, the `"refund"` typo experiment, `as const` two-word fix, `satisfies Record<RefundLevel, OrderStatus>`, `isolatedDeclarations` (TS9007). Eden's callback to Ch6:228 ("explicit return types on APIs we intend to keep") is accurate. Rule compliance: assistant unnamed; patch and replies shown as saved diffs/quotes. Good.

- `03-reviewing-ai-code.md:158-192` — `package.json` and `tsconfig.json` in full between two lines of dialogue. — **story / minor**. Same fix as Bonus 1.
- `03-reviewing-ai-code.md:5-7` — two-paragraph Principle, but here it is a review procedure rather than the chapter's conclusions, and it reads as Daniel. — acceptable; noted only for the pattern count.
- Keep, and treat as the second calibration chapter with Ch7: "**Oded Shipley** has a green pull request and a meeting in six minutes. He considers these two facts compatible. **Noam Kiperman** has opened the last hunk. They are becoming less compatible." (:13-15) — the best narration in the book; "if that will count as approval" (:21); "What did the fix fix?" (:130); "You don't get to insert a word after I've reviewed the sentence." (:225); "Could you say it where the Approve button is?" (:337); "So now it's explicitly the wrong contract." / "Exactly." (:396-398); "Now I have a green pull request and a meeting four minutes ago." (:414).

---

## 1b. Ledger, completed (supersedes the "(filled below)" placeholders above)

**Settings / shops, in order.** Ch1-6: an unnamed team (Express handlers, a profile screen, a migration). Ch7: content pipeline / front matter. Ch8-9: account-settings feature (Linoy's two PRs). Ch10: courier SDK v4->v5, tracking page. Ch11-12: export SDK (`ExportBuilder`) and its runner (`createCache`). Ch13: registration-desk badge printer (`label-kit`). Ch14: booking page (seats). Ch15: export dialog (From/To pages). Ch16: carrier webhook, refund worker. Ch17: checkout receipt. Ch18: support-desk SLA board (Jerusalem). Ch19: payouts planner. Ch20: pricing package (checkout vs reporting). Ch21: notification job / gateway. Ch22: risk console + orders service. Ch23: catalogue preview worker. Ch24: storefront migration. Ch25: `@shop/money`/`cart`/`api` monorepo. Ch26: pre-order shipping tests. Ch27: i18n `t()`. B1: refund-webhook parser. B2: support assistant refunds. B3: order-status badge. The "shop" becomes the connective tissue from Ch20 on; before that each chapter is its own team. No setting changes without explanation inside a chapter.

**Recurring code names.** `ParseResult<T>` (Ch5, Ch6), `Result<T>` with `error: unknown` (Ch10), `Result<T, E>` (Ch14, Ch23), `Result` with `error: string` (B1, B2); `RequestState<T>` (`status` tag Ch3, `kind` tag Ch5); `Unwrap<T>` (Ch1, Ch7, Ch10); `isUser`/`parseUser` (Ch5); `sortByName`/`logPayload` (Ch6, called back in Ch7); `EventMap` (Ch1, called back in Ch9); `ExportBuilder` (Ch11, Ch12); `UserId` `__brand` (Ch3) vs `PageNumber` unique-symbol brand (Ch15).

**Versions.** TypeScript 7.0.2 throughout; Node 22.23.4 (Ch26, Ch27, B1-B3); Zod 4 (Ch4, Ch5, Ch16), 4.6.2 (B2). Consistent, except B1's `@types/node` 26.5.1.

**Principle per chapter (is it a testable rule?).** Ch1 yes. Ch2 yes. Ch3 no (questions). Ch4 yes. Ch5 yes (buried third paragraph). Ch6 yes. Ch7 no (definition). Ch8 none. Ch9 none. Ch10 none. Ch11 none (description). Ch12 none. Ch13 none (observation). Ch14 yes. Ch15 yes. Ch16 yes. Ch17 yes (long). Ch18 yes (long). Ch19 abstract. Ch20 abstract. Ch21 abstract (worst). Ch22 long. Ch23 abstract. Ch24 abstract. Ch25 abstract. Ch26 abstract. Ch27 yes-ish. B1 yes. B2 abstract. B3 procedure.

**Verdict form.** Blockquote rule + table: Ch1, 2, 3, 4, 6, 7. Blockquote rule: Ch17. Narrated, PR-specific: Ch8, 9, 10, 12, 16. Spoken: Ch11 (open), 13, 14, 15, 18-27, B1-B3. The Debate Continues: Ch5, Ch11.

**Compiler claims I verified on 7.0.2** (all held): Ch2 palette-`as` rejection; Ch4 string enum -> literal union and the reverse; alphabetical union order in error text (Ch4, Ch6); Ch7 `Reply<any>`, `any extends unknown`, `[any] extends [string]`; Ch10 `if (!promise)` vs `if (promise)` TS2801; Ch11 `source?: never` reduction message, `repoint(sourcePreset)` and `lessSpecific` compiling; Ch20 `pair` inferring `b?: never`. Hand-checked: Ch18 dates/TZ table and walk counts; Ch19 all payment-day tables; Ch22 sample counts; Ch17 499,500; Ch27 arithmetic in the instantiation tables not checkable by reading.

---

## 3. Cross-book inconsistencies

1. **The chapter skeleton changes shape three times.** Part 1 (Ch1-6): a short Principle you could disagree with, a blockquote Verdict, a table. Part 2 (Ch8-13): no Principle claim at all and narrated, PR-local verdicts (only Ch11's open ending and Ch13's spoken ruling escape). Part 3 onward (Ch19-27, B2): the Principle is a 150-250-word abstract that lists the chapter's findings, so there is nothing left to tear apart and the reveals are spoiled (Ch19 `reduce` return, Ch20 `map` index, Ch21 everything, Ch23 `then`, Ch24 `include`, Ch26 all five traps, B2 `io: "input"` and the boolean). The how-to-read page (`01-how-to-read.md:25-27`) describes Part 1 and misdescribes the rest. — **major**, and the single most important fix for the book as a whole.
2. **Eleven of fifteen catchphrases never occur.** Grep of the body: "Show me the stack trace" x1 (Ch13), "That's just a map" x1 (Ch1), "Where's the interface?" x2 (Ch8, Ch17); Oded's "next sprint" is alluded to (Ch1:104). Never: "Let us return to first principles", "The compiler disagrees", "Complexity is a choice", "Simple made better", "Over my dead type definition", "What does the data say?", "I've seen this fail at scale", "There's an RFC for that", "But have you considered", "Both have a point here", "Prove it by producing it". The cast page sets these in italics as the character's signature; the how-to-read page promises "By the third debate, you'll start predicting who's going to object and why". Use each once, in earnest, or cut the italic lines. — **major**.
3. **Narrator-voice URL paragraphs: 26 lines in 16 chapters** (Ch3:1, Ch4:1, Ch7:2, Ch8:3, Ch10:1, Ch11:3, Ch12:2, Ch13:2, Ch14:2, Ch15:2, Ch16:2, Ch17:1, Ch18:1 (four links in one sentence), Ch23:1, Ch27:1 (a 40-char SHA permalink), B2:1), plus hyperlinks inside dialogue (Ch5:153, Ch9:51, Ch10:135,283). Part 1 has almost none; Part 2 averages two per chapter. In print these are bracketed URLs in the middle of a conversation, and in the Markdown they are the narrator stepping in as a manual. — **major** (print).
4. **Silent closers, 16 by grep**, seven of them in Ch8-9: Ch2:237, Ch8:158,226, Ch9:153,223,262,326, Ch10:166,289, Ch11:284,436, Ch12:367, Ch13:260,268, Ch15:318, Ch26:306. The brief names this pattern; Ch2:237 is it word for word ("leaves X beside Y"). None in Ch1, Ch7, Ch14, Ch17-24, B1-B3, which shows the book can end a beat on a line. — **major** (AI-feel).
5. **Register drifts by act.** Ch1-7 are funny and quotable; Ch8-13 go dry (Ch12 has no joke at all; Ch9 is where I first got bored); Ch14-27 recover; the bonus act is the funniest since Ch7. The memory note "calibrate against Ch7" is right; add B3 as the second calibration point. — **major** (voice).
6. `RequestState<T>` is tagged `status` in Ch3 (`03:267`) and `kind` in Ch5 (`05:309`) with the same four states. — **minor**.
7. **Five result-type shapes** across the book (`ParseResult<T>` with `reason`/`input`; `Result<T>` with `error: unknown`; `Result<T, E>`; `Result` with `error: string`; `Result<T>` with `error: string`). Different teams may differ, but the book never says so, and Ch23 is the chapter about this container. One sentence in Ch14 or Ch23 acknowledging it, or standardise on `Result<T, E>`. — **minor**.
8. Branded type spelled `string & { readonly __brand: "UserId" }` in Ch3's verdict (`03:448`), unexplained, then taught only as unique-symbol brands in Ch15. — **minor**.
9. Ch1's model answer (annotated predicate `isPurchaseData`, `01:644`; Guy's `return body as CreateUserRequest`, `01:395`) is the shape Idan argues against in Ch5. Not a contradiction (the book is learning), but it's a thread nobody picks up. — **minor**.
10. Ch7 opens as a continuation of Ch6 ("writes the `sortByName` signature again") while Oded says his audit was "last month, after we looked at `logPayload`" (`07:5-7`, `:364`). — **minor**.
11. Cross-reference convention: characters say "the `any` argument" (Ch7), "the generics argument" (B3), but "Chapter 13's augmentation" (B1:121). — **minor**.
12. **Chen** instructs and proposes in Ch2 (:116-134, :291-302, :406), Ch5 (:95), Ch13 (:290) against "Chen doesn't propose solutions... he never does" (`02-meet-the-cast.md:181,187`). He is exactly right in Ch7, Ch11, Ch18, Ch22, B1. — **minor**.
13. **Linoy** is the patient explainer in Ch8, Ch9, Ch12 ("That's covariance." / "That's contravariance.") and never the "tsconfig looks like a dare" early adopter until Ch25 (Node type stripping) and Ch27 (`--pprofDir`). — **minor-major** (voice).
14. **Dima** never mediates. He owns the pricing package (Ch20), the build graph (Ch25) and the prompt (B1), and is dry and decisive. The text is better than the bio; rewrite the bio toward the text. — **minor**.
15. **Idan** carries the Proxy wrapper (Ch10) and the AbortSignal redesign (Ch21), well outside "once data is parsed and shaped, she defers to Dafna entirely". — **minor**.
16. **Gil** is absent from Ch18's measuring scene (Oded builds the table), although Ch27 shows the book knows how to use him. — **minor**.
17. Noam: "exactly one exception" (`02:304`) then a second exception two paragraphs later (`02:352`). — **minor**.
18. The cast page is written in two voices (older comic paragraphs beside newer "calibrated" ones, e.g. `02-meet-the-cast.md:65,81,209,261`); `01-how-to-read.md:45` calls the cast section "the next chapter". — **minor** (but it is the first thing a buyer reads).
19. B1 pins `@types/node` 26.5.1 to Node 22.23.4. — **minor**.
20. Versions, settings and the bonus act's no-named-models rule are otherwise consistent across all 33 files; no pronoun errors found (Linoy, Dafna and Idan are "she" everywhere they appear; everyone else "he").

---

## 4. Top 15 for release (ranked)

1. **Rewrite the Principle openers of Ch19, 20, 21, 23, 24, 25, 26 and B2 to one testable sentence each** and move the spoiled findings back into the scenes where the characters discover them. (debate / major; 8 chapters)
2. **Give Ch8, 9, 10, 12, 13 a stated Principle and a one-line blockquote Verdict** (the sentences already exist in-character: Ch8:398, Ch9 Oded/Gilad, Ch10:454-467, Ch12 Daniel, Ch13:54). Ch11 can keep its open ending but needs a claim. (clarity / major)
3. **Remove the narrator-voice URL/manual paragraphs** (26 lines) and hyperlinks inside dialogue; footnote the links; give the sentences to Daniel/Eli/Idan. (AI-feel + print / major)
4. **Rewrite the 16 silent closers** as a spoken line or cut them; Ch2:237 and Ch8-9 first. (AI-feel / major)
5. **Decide what to do with the catchphrases**: use each once where it lands, or cut the italic lines from the bios and the "you'll start predicting" promise. (inconsistency / major)
6. **Ch9: cut "Put the names somewhere" to one exchange** and compress "That found the person listening"; the greppability point is made once well at `:143-151`. (story / major)
7. **Ch19: compress the Turn's accumulation/starvation half** to a paragraph and one row; keep the reversal that `skipping` was a valid policy. (story / major)
8. **Ch12: give it two lines of life and hand `:197` and `:213` to Daniel**; drop Linoy's glossary sentences. (voice / major)
9. **Ch3: state the verdict's convention as the Principle** and let Dafna/Linoy attack it; keep Liron's parable as the reconciliation, not the Turn. (debate / major)
10. **Ch1: move the three onboarding asides (`:196`, `:276`, `:617`) into Daniel's mouth** and tag `:565`. (AI-feel / major)
11. **Unify the cast page's voice**, fix "the next chapter", and rewrite Dima's and Linoy's bios toward the characters the book actually wrote. (voice / minor, first page)
12. **Align the small recurring definitions**: `RequestState` tag, one `Result<T, E>` (or one sentence saying teams differ), explain or remove Ch3's `__brand`. (inconsistency / minor x3)
13. **Chen in Ch2**: hand the double-assertion and `!` exposition to Daniel/Linoy and leave Chen the questions; same at Ch5:95 and Ch13:290. (voice / minor)
14. **Timeline and arithmetic nits**: Ch7 "again" vs "last month"; Ch1 "six months" vs "eight sprints"; Noam's "exactly one exception". (inconsistency / minor)
15. **Print hygiene**: Ch27's SHA permalink, Ch18's four-link sentence, B1/B3 full config blocks mid-scene (use B2's one-sentence profile reference), Ch4:501 and Ch2:402 formatting. (other / minor)

---

## 5. Per-chapter grades

| # | Chapter | Grade | One line |
|---|---|---|---|
| 0 | Prologue (how-to-read, cast) | B | The pitch is right; the bios speak in two voices and over-promise catchphrases. |
| 1 | The `any` Problem | B+ | Strong scenes and a real Turn on Noam; narrator asides and a missing speaker tag. |
| 2 | The Lies We Tell the Compiler | A- | Best debate in Part 1; the `.has()` exchange; one textbook silent closer. |
| 3 | The Two Kingdoms | B- | A well-organised tour, not a debate; no claim, no turn. |
| 4 | The Feature That Wasn't Just a Type | B+ | Honest about enums; the Sahar/Guy Turn is the right kind of turn. |
| 5 | The Guard at the Gate | B+ | Clearest single demonstration (drop the `email` check); open ending earned. |
| 6 | The Hole in the Function | B+ | Good rule, good lines ("Delete the cast, Daniel"), soft Turn. |
| 7 | The Fork in the Type | **A** | The standard. "Types can do ternaries." / "So it's a loop." Real Turn. |
| 8 | Who Owns the Fields? | B | Good form story and a true Turn; no stated rule; closers. |
| 9 | Where Did This Event Come From? | C+ | First place I got bored: one point made three times; three silent closers. |
| 10 | The Call You Didn't Make | B | Best real-world trap in Part 2 (truthy promise); dense; thesis arrives in Additional Takes. |
| 11 | Some Assembly Required | B+ | The Guy/Dafna main event, Chen perfect, honest open ending; principle is a description. |
| 12 | The Same Object, Twice | B- | Technically the best variance explanation I've read; not one joke. |
| 13 | Who Loaded It? | B+ | Type-only-import trap is a proper Turn; Gilad used right. |
| 14 | Two Seats or None | A- | Principle is a rule; the committed-refusal Turn is the book's best "types were right, program was wrong". |
| 15 | What the Number Means | B+ | Spread-defeats-the-brand is a real turn; two closers in the Verdict. |
| 16 | What the Schema Does With the Rest | B+ | "One parcel stuck at customs"; the `skip` Turn; narrated verdict. |
| 17 | The Price You Were Given | A- | *Was 80. Now 80.* Frozen getters still lie. Blockquote verdict. |
| 18 | The Ticket Hadn't Changed | A- | "Whose nine?" Chen's second-best moment; dense principle; four-URL sentence. |
| 19 | Who Goes Next? | B | Great first half; principle spoils the bug; Turn drifts into finance. |
| 20 | Before the First Line | B | Slow start on a familiar trap; Dima's best line; principle spoils it. |
| 21 | The Message Kept Going | B+ | Excellent trace tables and ending; the worst Principle in the book. |
| 22 | The Policy's Alibi | A- | Best-constructed debate in Part 3: three positions, data, a trigger. |
| 23 | Still Waiting for No | A- | Best reveal in Part 3 ("The promise is calling *my* `then`?"), spoiled by one sentence up top. |
| 24 | Both Tests Were Green | A- | "I converted the test out of catching the conversion." |
| 25 | The Other Money | B | Idan's lines carry a runbook; Linoy finally in character. |
| 26 | It Can't Be Green | A- | Five traps, one meeting; funniest ending in the book. |
| 27 | More Work, Less Time | A- | Gil's chapter; "Same 387 bytes."; one SHA permalink in print. |
| B1 | Which File Says That? | A- | "It validated the vibe." Dima dry, Chen right, rule-compliant. |
| B2 | Whose Refund Is It? | A- | "Congratulations to the descriptions." Principle spoils two beats. |
| B3 | What Did the Fix Fix? | **A** | Best narration in the book; use with Ch7 as the calibration pair. |

**Where I enjoyed it:** Ch7 throughout; Ch2's `.has()` argument; Ch17's hook; Ch23's reveal; Ch26's last four lines; B3 start to finish; B1's refund of nothing. **Where I got bored:** Ch9's middle two sections; Ch12 entire; Ch19 after `:240`; Ch25's config blocks; Ch10's second Proxy.

---

## 6. Overall readiness verdict

**Ready after fixes.** Nothing I found is wrong in the way that embarrasses a technical book: every compiler claim I put to 7.0.2 held, including the subtle ones (`any` against `unknown` in a conditional, `if (!promise)`, the `never`-reduction message, `b?: never`), the dates and the payout tables are right, the pronouns are right, and the bonus act keeps its no-named-models rule. What is not ready is the book *as one book*. The prologue promises a skeleton and a cast; Part 1 keeps both; Part 2 drops the Principle and the Verdict and goes grey; Part 3 inverts the skeleton by putting the conclusions in the opener, so the debates argue with a principle that has already won. Layered on that are two recognisable narrator tics (26 URL paragraphs, 16 silent closers) that a print reader will clock as a pattern by Chapter 9, and a cast page that promises eleven lines nobody says. Those are an editing pass, not a rewrite: one sentence per chapter for the Principle, one for the Verdict, a sweep for closers and links, and a decision about the catchphrases. Do that, calibrating against Ch7 and B3, and it is a good book that is also fun.
