# Whole-book review: haiku-story (story and debate editor)

## 1. Ledger

### Cast pronouns (canon from 00-prologue/02-meet-the-cast.md)
- he: Eli Typeworth, Daniel Compiler, Gilad Stacktrace, Liron Closure, Sahar Firstclass, Noam Kiperman, Oded Shipley, Gil Benchmark, Eden Legacy, Chen Override, Guy Singleton, Dima Bridge
- she: Linoy Nightly, Dafna Functor, Idan Greenfield

### Catchphrases / signature lines (bio)
- Eli: "Let us return to first principles." Asks for the claim stated precisely.
- Daniel: "The compiler disagrees." Opens playground; asks for the compiler version and diagnostic.
- Gilad: "Show me the stack trace." / "This works. What happens when it doesn't?"
- Liron: "Complexity is a choice, not a necessity." Parables (river).
- Sahar: "Simple made better." Asks whether the caller needs the abstraction.
- Noam: "Over my dead type definition." Slack status: "Your `any` is my on-call page."
- Oded: "We can fix it in the next sprint." Deployed to prod on a Friday.
- Gil: "What does the data say?"
- Eden: "I've seen this fail at scale." Asks "What's the migration path?"
- Linoy: "There's an RFC for that."
- Chen: "But have you considered..."
- Dafna: "That's just a map." Pipelines, purity.
- Guy: "Where's the interface?" Class diagram on whiteboard.
- Dima: "Both have a point here." The human "it depends".
- Idan: "Prove it by producing it." Parse-don't-validate; wants return type to fail compilation when a field is missing.

### Bio-level relationships to check
- Dafna vs Guy are the book's "recurring main event".
- Idan vs Guy: where failure goes (handler catches once vs return type says may be rejected).
- Gilad: the import tool that could be rerun; Oded asked who maintains the queue (bio).
- Eli: review of an event system; "what had to remain true when an event arrived twice" (bio); Guy at the board, Oded found retry code.
- Chen: "If Chen can't break it, ship it."
- Liron vs Sahar: reuse pattern vs whether caller needs it.

### Running settings (to be filled while reading)
(filled per chapter below)

### Principle claims per chapter
(filled per chapter below)

## 2. Findings, by chapter

### Chapter 1 (01-the-type-system/01-any-vs-unknown.md)

Principle (Eli): keep values `unknown` until checked; an `any` owes the next caller an account of what is unchecked. Clear and testable. Good.

- `01-any-vs-unknown.md:196` | "In these snapshots, `Promise<UserProfile>` describes the value the promise will resolve to." | clarity / AI-feel | major. "In these snapshots" is a meta phrase a reader cannot parse (the book has no snapshots). Inside Eden's speech the paragraph is also a manual-style explainer. Fix: delete the paragraph or fold the point into Eden's line ("the type argument only tells the client what to expect; it doesn't check the body").
- `01-any-vs-unknown.md:276` | "The next example previews a conditional type. Its result for `any` is the point here; the rules behind that result will get their own debate." | AI-feel / clarity | minor. Narrator signposting that no room member would say. Cut to a one-line Daniel aside or nothing.
- `01-any-vs-unknown.md:289-290` | comment "The conditional produces both branches; the any branch absorbs the other result." | clarity | minor. Correct but over-explained for a comment; keep to one clause.
- `01-any-vs-unknown.md:100` | Noam: "We updated the response type when the API changed, but this function didn't use it." | story/clarity | minor. The snippet shows no response type at all, and no TODO, yet line 108 says "I found the TODO at 2 AM". Fix: add the TODO to the snippet or drop the TODO reference.
- `01-any-vs-unknown.md:343` | "The asserted `port` is checked as a number at later calls." | technical/clarity | minor. Holds only if `startServer` is declared with `(port: number, host: string)`, which is never shown. Add the signature.
- `01-any-vs-unknown.md:478-492` | Guy's `onEvent` stub has an empty body and never calls `handler`, then the prose says "fully typed". | clarity | minor. Either call the handler or say it is a sketch.
- `01-any-vs-unknown.md:606,613,672` | `logEvent(...)` is called in `handleWebhook` and `chargeUser` is declared but `logEvent` is never declared. | technical | minor. Book says "runnable code (no pseudo-code)". Declare `logEvent` (even `declare function logEvent(...)`, as done for `chargeUser`).
- `01-any-vs-unknown.md:533-535` | Liron: "The problem isn't `any` itself — it's when `any` becomes invisible." | AI-feel | minor. Symmetric "not X, it's Y" construction; Liron's bio voice is parable-led, so a concrete image would sit better than the aphorism.
- `01-any-vs-unknown.md:617` | "Its return annotation, `data is PurchaseData`, tells the compiler to treat the original value as `PurchaseData` when the function returns `true`. The checks in its body supply the evidence for that claim. Look at the call inside `handleWebhook`: that is where `event.data` becomes usable by `processOrder`." | AI-feel | minor. Narrator explains like a manual; no one in the room talks like this. Cut to one sentence.
- `01-any-vs-unknown.md:688` | "The input check stays visible in `isPurchaseData`; declaring the SDK parameter as `any` doesn't perform that check for us." | AI-feel | minor. Summarising closer, restates the verdict. Cut.
- `01-any-vs-unknown.md:520-527` / `:536-541` | Dafna "That's just a map." then Oded "With homework underneath it." Good callback to bio catchphrase. Keep.

Story and debate notes (ch1):
- Oded's "Tuesday" and Noam's "Tuesday" and 2 AM detail line up with Noam's bio (11:47 PM Tuesday). Good.
- Eden's three-million-line migration and "any budget" match his bio. Good.
- The Turn (line 557-581) is a real but narrow turn: Noam concedes that "tracked for removal" can mean "I don't know how to remove it". It is earned by the event-overload example. However it is a turn inside one sub-example rather than a change of the chapter's argument. Acceptable; a reader could feel the chapter ends on a sub-case.
- The Verdict (585-594) is earned: each of its six points has a debate beat (Eden budget, Gil counting, Oded ticket, Noam receipts). Good.
- Chen gets the lines that land ("Finally, something everyone can agree on." / "Don't get used to it.") Good.
- Gilad, Sahar, Liron (only the parable) absent. Fine for ch1.
- Chen "Chen doesn't propose solutions" (bio). He demonstrates `processInput` code at 116-140 and 186; a small conflict with the bio, minor. He mostly asks questions, so acceptable.

Chapter 1 grade: B+. Enjoyed: Oded/Noam "Tuesday" framing, the Express "I'm using req.body directly and you can't stop me" exchange, Dafna/Oded "homework underneath it" close. Got bored: the Express adapter and event-system sections are long and both runs of code blocks run into each other; the verdict example is long and manual-like.

Running settings from ch1: formatResponse (47 call sites); analytics SDK; Express `/users` with `createUser`; JIRA-4521 (migration API response), JIRA-7823 (payment wrapper); `processOrder`/`chargeUser`/`isPurchaseData` payment webhook; `ServerConfig`/`startServer` (not shown).

### Chapter 2 (01-the-type-system/02-type-assertions.md)

Principle (Eli): an assertion changes the compiler's type, does not convert or check the value; write one only where you can say what you know and how. Callback to ch1 (Noam's "localized lie", Dima's "what it lets through") is accurate. Good.

Verified with TS 7.0.2 (verify/haiku-story/ch2): `"purple" as Color` compiles (book is right); `{...accent:"purple"} as Record<string, Color>` is rejected with TS2352 (book is right); `satisfies` error text matches; `const name` declared twice at module top level is TS2451 (see below).

- `02-type-assertions.md:237` | "Noam leaves the factory on the screen. Oded leaves a comment beside the test naming the fields it is supposed to exercise." | AI-feel | major. This is the silent-closer pattern the brief names ("leaves X beside Y"). It also repeats in the verdict table at `:386` ("named beside the test"). Fix: end the scene on a line of dialogue or a beat that moves the argument, e.g. Oded: "Put the fields in the test name, then." Keep the table wording plain ("name the exercised fields in a comment").
- `02-type-assertions.md:310-321` | snippet declares `const name` at top level twice (`:310` and `:321`). | technical | major. Verified: TS2451 "Cannot redeclare block-scoped variable 'name'". The chapter's whole point is runnable precision; a reader pasting this gets an error. Fix: rename the second to `name2`, or wrap each case in its own block/function. Also `user` is never declared in that snippet (`:309-321`); declare `user: User | undefined` once.
- `02-type-assertions.md:364` | "An unchecked assumption can fail far from where it entered the program. The stack trace may tell you which field was used without telling you why the compiler believed it existed." | AI-feel | minor. Explainer paragraph that restates Gilad's speech. Cut the second sentence or make it Gilad's own words.
- `02-type-assertions.md:366` | "Every assertion is a bet that the world outside your program still matches your model of it. You knew it was true when you wrote it. How will you find out when it stops being true?" | AI-feel | minor. Aphoristic closer; the second and third sentences are good on their own, but the first sentence is the sort of tidy line that gets quoted in a manual. Consider cutting the first sentence.
- `02-type-assertions.md:402` | Inline stage direction in Oded's paragraph: "— **Gilad Stacktrace**, without looking up: 'You will when one of them pages you at 3 AM.'" | clarity / formatting | minor. Gilad's line is wedged into Oded's; give it its own paragraph. The "without looking up" is a useful beat; keep it.
- `02-type-assertions.md:272` | Daniel: "That palette would be rejected with `as` too." | technical | (verified correct). Keep.
- `02-type-assertions.md:404` | Linoy: "`satisfies` is TypeScript's apology for `as`." | voice | keep. This is one of the book's few real Linoy-style quips.
- `02-type-assertions.md:306` | Chen: "after a `.filter()` that guarantees it" | technical | minor. True only if the predicate is inferred or explicit (TS 5.5+ infers predicates for simple arrows). Add "with a type predicate" to avoid a reader thinking plain `.filter` narrows.

Debate notes (ch2):
- Oded's "Take an endpoint we haven't put a parser around yet" and Noam's "The parser you agreed to on the critical paths" pick up ch1's "For critical paths — auth, payments — I'll wrap." Good callback.
- Eden's "400 API calls" and "one client" follow his migration persona; Noam's "what I will not accept is `as ApiUser` scattered across forty components" is in character.
- The double-assertion debate (Chen, Noam, Oded, Daniel) is the book's best-argued section: Oded's pushback has real content (library types are wrong, upstream PR is slow), and Daniel answers with a concrete rule (assert to the subtype plus the known properties). Engages the claim.
- The mock-fixture debate is fair to both sides: Oded's "I can see which fields matter" is conceded in part by Noam's "the library may start reading another field." Good.
- Turn: Gilad's 3 AM timeline is a real turn; it shifts the question from "is this assertion correct" to "how will you find out when it isn't", which is then the Verdict's question. Earned. Strongest moment in the chapter.
- Verdict: earned. The table and the four-point checklist follow the debate.
- Gaps: Idan, Guy, Dafna, Sahar, Gilad (beyond Turn), Dima (one line) are absent or minimal here; acceptable for this chapter.

Chapter 2 grade: B+. Enjoyed: the double-assertion fight, Gilad's timeline, Noam's "The exclamation mark is the most dangerous character in TypeScript." Got bored: the non-null section runs long (Chen, Oded, Noam, Daniel each take a turn on Map.has); the `user!` section and the mock section both end on silent closers.

Running settings from ch2: Cat/Dog example; ApiUser/User interface (id, name, email, role, createdAt, updatedAt, preferences, team); JIRA-8901 (Zod in ApiClient.getUser); "400 API calls" (Eden); "forty components" (Noam).
### Chapter 3 (01-the-type-system/03-interface-vs-type.md)

Principle (Eli, `:33`): "Choose by what the declaration needs to do... Does other code need to reopen it? Where should a conflict be reported? Does it need to name something other than an object?" These are questions, not a rule; the chapter's actual default ("type for data, interface for contracts") only appears in the Verdict at `:429`. The memory rule ("Principle section needs an explicit testable rule up front") is not met. Major clarity. Fix: state the default in Eli's line, e.g. "Use `type` unless the declaration must be reopened, must report conflicts at declaration, or behaves as a contract."

Verified with TS 7.0.2 (verify/haiku-story/ch3): the `extends` error text (`:83-85`), the `never` message (`:108`), the duplicate-identifier error (`:51-52`), and exhaustiveness behaviour (`:289`) all match the book.

- `03-interface-vs-type.md:5` | "Guy and Dafna have brought different defaults. Eli puts the same user on the board twice." | fine. Keep.
- `03-interface-vs-type.md:254-258` | Guy: "Most application code doesn't need conditional types or mapped types." Linoy: "It uses unions..." | debate | minor. Linoy answers a different point (unions) from the one Guy made (conditional and mapped types), so it reads as a dodge rather than a rebuttal. Fix: have Linoy say "Most code doesn't need them; all code needs unions", or have Dafna answer the mapped/conditional point.
- `03-interface-vs-type.md:407-409` | Liron's blueprint/description parable. | voice | keep, but note: it is the chapter's only real image and it is never used again except in one line at `:415` ("convention for the reader"). The Turn is therefore a restatement, see Turn note below.
- `03-interface-vs-type.md:429` | Verdict: "Our default is `type` for data and `interface` for behavioral contracts or deliberate extension points." Then "Use `interface extends` for composed objects..." | inconsistency | minor. The Verdict says data is `type`, then tells you to use `interface` for composed data. Reads as two rules; the table at `:435` hedges. Consider merging into one sentence.
- `03-interface-vs-type.md:461-478` | Verdict example labels `AppConfig` as "interface: library extension points". | inconsistency | major. `AppConfig` is an application's own config (port, host), which by the chapter's own table is "Object shape (plain data) -> type". The comment contradicts the table at `:442` (library public API) and the Verdict's default. Fix: make it `type AppConfig` or describe a real extension point.
- `03-interface-vs-type.md:448` | `type UserId = string & { readonly __brand: "UserId" };` appears in the Verdict's "both in the same codebase" example, a forward reference to branded types (03-patterns 02). | other | minor. Fine as a forward reference; a reader meeting branding for the first time here gets no explanation. Add a one-line gloss.
- `03-interface-vs-type.md:267,294` | `RequestState<T>` is a `type` (Dafna) and then an `interface` (Guy) in the same chapter, and `RequestState` is declared again in the Verdict (`:450`) as a `type`. | clarity | minor. This is an intended contrast, but three declarations with one name in one chapter is confusing. Rename Guy's contract (e.g. `RenderableState`).
- Name reuse across snippets in this chapter: `Config` (`:39`, `:42`, `:249`), `Base` (`:66` interface, `:92` type), `User` (`:71` interface, `:124` type, `:132` UserContract). They are separate snippets, but the reader is told in `:45` "Config is now { port: number; host: string }", and then `:249` redeclares `Config` as `typeof defaultConfig`. | clarity | minor. Rename the `:249` one (`DefaultConfig`) so the merge example is not undercut.
- `03-interface-vs-type.md:289` | Dafna: "The explicit return type makes the compiler check that every branch returns a `string`." | technical | minor. Accurate in effect (TS2366 on a non-exhaustive switch) but the phrasing credits the return type with an exhaustiveness check it does not perform. "The explicit return type makes the missing case a compile error" is more precise.
- `03-interface-vs-type.md:297-325` | Guy's `class` version: `implements RequestState<never>` on `IdleState`, `LoadingState`, `ErrorState`. | technical | minor. Compiles, but `RequestState<T>` never uses `T`, so the generic is decoration. A reader will ask why. Acceptable as a teaching point; could say so.
- `03-interface-vs-type.md:333` | Dafna: "I can put another exhaustive `switch` beside the first one." | AI-feel | minor. Lightly "beside" again; replace with "I can write another exhaustive switch".
- `03-interface-vs-type.md:387` | Oded: "Identical. Pick one. Put it in your ESLint config. Ship the feature." | voice | keep. Good Oded line. Chen's reply at `:391` ("The rule still needs exceptions") is a good correction.
- `03-interface-vs-type.md:389` | Oded: "I've seen teams spend more time debating this in style guides than they save in a year..." | AI-feel | minor. This is a paragraph of narration-style generalisation in Oded's voice; reads like a blog post. Cut the second sentence or make it a single spoken line.

Turn (`:401-425`): Liron's blueprint/description metaphor. Liron asks "What would you want the choice to tell the next reader?" That is a real question. But the turn lands on a restatement: Daniel says the distinction is a convention; Liron agrees ("A convention for the reader"); Guy's `UserContract` gets its exception ("I'd keep that exception"). The argument does not change direction; it ends where Eli's Principle ended. The Turn is weak. Fix: move the `UserContract`/`extends` conflict point up into the debate, and let the Turn turn on something new, e.g. Dafna's state example (a state with a behaviour is where the blueprint metaphor actually fails).

Verdict (`:427-442`): earned in the sense that every rule has a debate beat (extends conflict, declaration merging, union-only, performance, Oded's consistency). The composition rule is solid. The class-contract row (`:440`) says "Marks a behavioral contract in our convention", which is circular.

Debate notes (ch3):
- Guy vs Dafna: good, both get a real point. Dafna's "I still use intersections when I'm combining types in a generic expression." Guy's "For this named object, I want the conflict reported here." Fair.
- Declaration-merging section: Chen's "two developers, two files" example is well-built; Daniel's correction (merging is per scope, modules don't merge) is accurate. Good engagement.
- Performance section: Gil honestly admits "I haven't measured", Linoy notes the guidance predates TS 7, Chen says there's no `interface` spelling for unions. Good, but the section's point is thin: nothing measured. Gil's bio says he's the data person; a short measurement here would have been in character and the absence is a small missed beat.

Chapter 3 grade: B. Enjoyed: the `never` riddle vs the `extends` diagnosis; Chen's two-developers merge; Oded's ESLint line. Got bored: the RequestState section runs long, with three versions of the same union; the Turn restates.

Running settings from ch3: `Employee` / `Base`; `User` with `Identifiable & Timestamped & Named`; `RequestState<User>` profile screen; Express `req.user`/`requestId` augmentation; `models/user.ts` and `api/responses.ts`.
### Chapter 4 (01-the-type-system/04-enums-vs-unions.md)

Principle (Eli, `:7`): "For a fixed set of values, start with a type. Add a runtime representation when a caller needs to look up, list or name those values. Then check what the declaration emits." Testable and clear. Good.

Verified with TS 7.0.2 (verify/haiku-story/ch4): the union error text at `:73` (note the alphabetical order `"active" | "banned" | "inactive"`) matches; `TS2748` text at `:118` matches; the `Color["red"]` message at `:177` matches; `SdkStatus.Active` assigns to the literal union and `sendToSdk("active")` fails as the book says; the exhaustive `never` switch compiles. All technical claims in this chapter check out.

- `04-enums-vs-unions.md:62` | "The symbol and the stored value have different jobs." | AI-feel | minor. Tidy, quotable line that restates the point. Cut or let Guy say it in his own words.
- `04-enums-vs-unions.md:123` | "The ambient `const enum` restriction is documented in the [handbook's const-enum pitfalls](...)." | voice | minor. Narrator aside after a dialogue beat; fine as a footnote, but it reads as a manual line in the middle of the scene. Move it to a note.
- `04-enums-vs-unions.md:125` | Gil: "Before we talk about bundle cost, which build are we measuring?" | story | minor. Nobody has raised bundle cost in this chapter. Either Eli/Linoy mention it first or Gil asks "what does this cost us in the bundle?"
- `04-enums-vs-unions.md:181` | Daniel: "`typeof HttpStatus` gets the object's type, and `keyof` gives its property names. Indexing that type by all its names gives the union of the values..." | clarity | major. This paragraph describes the enum, but the code that follows (`:188`) redeclares `HttpStatus` as a `const` object, which is the replacement. The reader has `enum HttpStatus` at `:138` and `const HttpStatus` at `:188` in the same chapter, and the sentence "we can build the reverse object ourselves" does not say which HttpStatus. Fix: say "Replace the enum with an object" before the paragraph, and rename the object (e.g. `HttpStatusObj`) or make the enum example a comment.
- `04-enums-vs-unions.md:185` | Daniel: "Here we can inspect the entries we're swapping:" | technical / clarity | minor. The code does not inspect anything; it maps with `Object.entries` and casts with `as Record<...>`, which is the assertion Daniel just warned about. Either drop "inspect" or add a runtime check (the chapter 2 lesson).
- `04-enums-vs-unions.md:245` | Oded: "That's the line that makes me want to close the tab and go outside." | voice | keep. Good.
- `04-enums-vs-unions.md:378` | Oded: "Then I'd filter the numeric one. Our statuses are strings. Their iteration works, and my team can read the declaration without opening `ValueOf`." | voice | keep. Good callback to ValueOf.
- `04-enums-vs-unions.md:425` | Guy: "If the team can read the enum at 3 AM and can't parse that derivation under stress, familiarity is doing work." | voice | keep. The 3 AM callback is a Gilad phrase; Guy using it is fine because the team is shared.
- `04-enums-vs-unions.md:437` | Verdict: "A team that can maintain an enum but cannot yet maintain the alternative may choose the enum, even for a new service." | voice / verdict | keep. Earned by the Turn; the Verdict tells the reader it depends on the team, which is the book's premise.
- `04-enums-vs-unions.md:501` | Noam: "In Zod 4, `z.enum(["active", "inactive", "banned"])` checks the literal values, and `z.enum(SdkStatus)` accepts the TypeScript enum directly." | technical | minor. Plausible for Zod 4 (not verified here, no network). Editors should confirm against the pinned Zod version before print, since the chapter cites a link.

Debate notes (ch4):
- Guy vs Noam on the call-site name is well made: Noam's "What is the second name telling us?" is a real question and Guy's "And you still have to open that signature" is a concession that reads true.
- The const-enum and isolatedModules section is strong: Linoy's published-library argument is a real reason, and Gil's "which build are we measuring?" is in character.
- Chen's `Object.values` numeric-enum trap is correct and well sized (eight entries for four directions).
- Turn (`:417-433`): Sahar argues for the object; Guy and Oded counter with team cost; Sahar concedes "For that team, on that night, I'd leave it." The turn is real and it changes the verdict from "best representation" to "who maintains it". Earned.
- Oded's "Four hundred enums across twelve services" is a concrete stake and is never used against the verdict; fine.

Chapter 4 grade: B+. Enjoyed: the Turn; Oded's `ValueOf` complaint; Chen's `Object.values` counting. Got bored: the reverse-mapping section runs long (Guy, Daniel, Guy again on maintenance cost) and the HttpStatus/object switch is hard to follow (see `:181`).

Running settings from ch4: `Status` (active/inactive/banned) for `updateUser` with `u_42`; `HttpStatus` logger (Guy maintains it); `Color` string enum; SDK `SdkStatus`; "Four hundred enums across twelve services" (Oded).
### Chapter 5 (01-the-type-system/05-narrowing-strategies.md)

Principle (Daniel): the section is a tour of two things: control-flow narrowing (`!= null` vs `!== null`), and then type predicates and "For external input, prefer building a typed value from the fields you've checked" (`:40`). The chapter's real debate is parse-vs-validate and result-vs-throw, but the Principle does not name either; the explicit rule is buried in `:40`. Memory rule: "Principle section needs an explicit testable rule up front". Major clarity. Fix: lead with the parse rule ("Build the value from the fields you checked; don't return the input with a yes/no") and move the narrowing mechanics to a second beat.

Verified with TS 7.0.2 (verify/haiku-story/ch5): `parseUser` with `email` check removed fails on `input.email` (`:257` claim correct); `isUser` with `email` check removed still compiles (correct); `inputs.filter(isUser)` gives `User[]`; the `kind` switch with explicit `: string` catches a missing case (`:325`). All correct.

- `05-narrowing-strategies.md:457` | Noam: "Keep the predicate tests when the type changes. If `isUser` has its own field checks and a predicate annotation, adding a required field to `User` won't force those checks to change." | inconsistency / logic | major. This presents as a virtue what Idan has just named as the bug (`:257`, `:298`: "Drop the email check from isUser, and isUser still compiles. That's why I build the value."). Noam is making the opposite argument in the Additional Takes. Fix: "A predicate won't fail to compile when `User` gains a field, so the tests are the only thing that catches it." Keep it as the warning it is.
- `05-narrowing-strategies.md:309-313` | `RequestState<T>` here is tagged with `kind`; ch3 (`03-interface-vs-type.md:267-271`) declares `RequestState<T>` tagged with `status`, and ch3 Verdict (`:450-454`) again uses `status`. | inconsistency | major. Same name, same four states, different tag key, two chapters apart. Fix: pick one tag (the book's `status` is the one used three times in ch3) and use it here, or rename one (e.g. `FetchState`).
- `05-narrowing-strategies.md:153` | Daniel: "Since TypeScript 5.5, it can infer a predicate from some function bodies without return annotations." | technical | keep. Accurate.
- `05-narrowing-strategies.md:50-99` | Linoy's runtime-details list (`in`, `instanceof` across realms, `typeof null`, `if (x)` with `0`/`NaN`, `typeof NaN`). | technical | keep. All accurate. Good detail that a working developer can use.
- `05-narrowing-strategies.md:138-151` | Dafna's "Looks safe. Is a lie." `isUser` returns `true`; `x.email.toLowerCase()` throws. | technical | keep. Accurate (x is 42 at runtime; `x.email` is undefined, method access throws).
- `05-narrowing-strategies.md:329` | Idan: "Our request module publishes state changes through an in-process event bus." | story | minor. Introduces a setting not seen before; fine, but the reader does not know whether this bus is the same one in ch3/ch4. Name it once (e.g. "the profile module's event bus") or drop "request module" since the chapter has no request module yet.
- `05-narrowing-strategies.md:201-207` | Guy quotes Noam's `ApiUser.parse(raw)` from ch2 (`02-type-assertions.md:89`). | callback | keep. Accurate: ch2 Noam said "Throws with a clear error if the shape is wrong. At the boundary. Where you can handle it." Good cross-chapter callback.
- `05-narrowing-strategies.md:362` | Linoy: "Valibot and ArkType are other options if we're evaluating libraries, but that's another PR." | voice | keep. Linoy's pragmatic tone fits.
- `05-narrowing-strategies.md:366-383` | Zod snippet: `z.email()` and `z.infer<typeof UserSchema>` redefine `User` and `parseUser` after the handwritten versions. | clarity | minor. Chen asks "Are you keeping the handwritten User type too?" which covers this. Good. But the snippet keeps `ParseResult<User>` from above without restating it, so it is not standalone. Acceptable.
- `05-narrowing-strategies.md:404-417` | Turn: Gilad's `badUser` with `id: 42` gives "id missing or not a string" from both `parseUser` and `parseUserOrThrow`. | technical | keep. Verified by reading the parser; output matches.
- `05-narrowing-strategies.md:432-436` | "The Debate Continues" (open ending in place of a Verdict heading). | structure | keep, with a note. Honest open ending is fine here: Idan/Dafna (result) vs Guy (throw) is a real disagreement about who owns recovery. But the chapter now has no `## The Verdict`; the table at `:438-447` is labelled as a decision table under an open ending. The skeleton expects a Verdict; a reader may see this as a missing section. Consider a one-line Verdict stating the agreed part (parse and keep checks in one place) before "Debate Continues".
- `05-narrowing-strategies.md:424` | Idan: "The caller chooses. Reject, retry, collect the failure with the other rejected rows." | voice | keep.
- `05-narrowing-strategies.md:426` | Guy: "Which is useful for Dafna's batch. I don't have a batch. I have a request we can't fulfill." | voice | keep. Good; Guy's concession sounds like Guy.
- `05-narrowing-strategies.md:459` | Eden: "I would migrate the checks first... Those are separate changes; I'd like to review them separately." | voice | keep. Strong Eden line.
- `05-narrowing-strategies.md:436` | "Both versions above produce a checked `User`; both carry the same failure details." | clarity | minor. The versions above are a result and a throw, but the reader has just been told the Turn's details match. Say "both carry the same reason string" to make it concrete.

Debate notes (ch5):
- The throw-vs-result argument (`:191-215`) is the best debate in the chapter: Dafna's batch point, Guy's "one invalid user rejects the request", Noam's "invariants vs external input" distinction, and the callback to ch2. Each side moves once. Good.
- Noam/Idan on whether to keep `isUser` as a predicate for `filter`: Idan's concession (`isUser = ... parseUser(v).ok`) is a real move. Good.
- The Zod section is a fair concession and leaves Gil's point standing ("importing a validator doesn't tell us whether we wrote the right schema"). Good.
- Chen (`:36`, `:386-390`) keeps asking the right question each time. Good.
- Gilad's Turn is a good idea (same input, same message) and a real beat, but the Turn's answer ("the caller chooses") is an argument the Debate Continues section then restates. Acceptable.

Story (ch5): the parse/validate argument runs for about 90 lines and is largely between Idan and Guy, with Noam and Dafna at the edges. Idan's "Watch what the compiler checks when I construct the return value" is the best dramatic beat in the book so far (the `input.email` error when the check is removed). Verified.

Chapter 5 grade: A-. Enjoyed: Idan's delete-the-check demo; Guy's "I'll use your parser"; Gilad's identical-input test; Eden's close. Got bored: the discriminated-union section (`:304-354`) repeats the switch material from ch3 and adds an event-bus parser that the chapter doesn't need.

Running settings from ch5: `User = { id, email, displayName }`; `isUser`, `parseUser`, `parseUserOrThrow`, `UserParseError`; in-process event bus (request module); `ApiUser.parse` (ch2 callback); Zod `UserSchema`; `Dafna's batch`.
### Chapter 6 (01-the-type-system/06-generics-basics.md)

Principle (Eli, `:20`): "Use a type parameter when a caller needs a relationship between types in the signature... If nothing else depends on it, try removing it... The type argument is a claim, not evidence." Clear, testable, and it is the chapter's spine. Good. `:22` correctly separates "when to generalize" from "what the signature promises."

Verified with TS 7.0.2 (verify/haiku-story/ch6): `get(settings, "fontsize")` error text matches `:196-197`; `createStore(null)` then `set({id})` error matches `:217-218`; the `routes` readonly tuple is as described (`:364`); `NoInfer` rejects `"blue"` (`:366`); `parseConfig` cast-free version compiles (`:258`). All accurate.

- `06-generics-basics.md:230` | Linoy: "That's the return type you publish, though. You still wouldn't make callers write both type arguments to `get`." | clarity | minor. "That's the return type you publish" does not answer Eden's point about explicit return types on `createStore`. Reword: "Publishing return types is fine. You still wouldn't make callers write both type arguments to `get`."
- `06-generics-basics.md:228` | Eden: "I also write explicit return types on exported functions when they express an API we intend to keep." | voice | keep. Good migration-veteran line. But it is a non-sequitur inside the store story; it lands better after `:226` as a separate beat.
- `06-generics-basics.md:309-313` | Liron's lens/photograph parable. | voice | keep the parable; see Turn note.
- `06-generics-basics.md:319` | Liron: "It preserved the type. You are right to ask — the image only gets us so far." | AI-feel | minor. "the image only gets us so far" is a self-aware caveat no one in the room would volunteer; Liron's voice does not need the hedge.
- `06-generics-basics.md:323` | Liron: "Then you and Noam still have a review to finish. The signature alone does not tell us whether you needed the generic." | AI-feel | minor. Ends on a summarising line. Cut the second sentence.
- `06-generics-basics.md:329` | "Noam would keep `sortByName` because its body already states the small shared requirement. Oded would keep `sortEmployees` until another caller needs the same ordering. The relationship test does not decide that timing question." | AI-feel | minor. Verdict restates a debate outcome in the third person and in the register of a summary. Acceptable; trim the last sentence.
- `06-generics-basics.md:331` | "**The Accepted Standard:**" as the table heading | consistency | minor. Every other chapter uses "Choosing an approach" or a similar label. Harmless, but a reader will notice the change of label.
- `06-generics-basics.md:364-366` | Linoy's `const T` and `NoInfer` additional take. | technical | keep. Verified. Good, concrete.
- `06-generics-basics.md:370` | Eli: "We can also compute with that type variable: branch on it, walk an object's keys, build another type from it." | story | minor. A teaser for ch7 (conditional types) at the end of the book's first act. Fine; it reads as the authors' signpost, but Eli's catchphrase is "Let us return to first principles", so the teaser sounds generic. Consider cutting or keeping as Eli's own line.

Debate notes (ch6):
- Oded/Noam on the `firstItem` generic and Dima's "You disagree about when to introduce it" is a real, fair beat. Good.
- The `logPayload` single-use removal with Oded's "Finally. A refactor that deletes something." is one of the book's better light moments.
- `querySelector<HTMLInputElement>` (Daniel, `:105-119`) and `parseConfig` (`:238-262`) are two different "claim" cases and the chapter teaches the difference clearly. Good.
- Idan's "Delete the cast, Daniel." and "Now I can't even find the unchecked claim by searching for `as`." are good; Idan's rebuttal ("At what supplies the return type") gives a real rule.
- The `sortByName` vs `sortEmployees` debate is the strongest test of the Principle. Noam's "It doesn't promise to sort every future list" and Oded's "let this one say Employee" are real disagreements and the Verdict handles them honestly.

The Turn (`:305-323`) is weak. Liron's lens/photograph parable says "the generic is useful when the relationship survives a change of subject", which is a restatement of the Principle. Chen's question ("And identity? ... What did the lens do?") is good, and Liron's answer ("the work need not be a transformation; it can carry information an unknown return would lose") is a real point. But the Turn does not move the argument: the Verdict is the same as the Principle plus a timing caveat. Fix: let the Turn be Idan's `parseWith` point (the generic parser taking a check as argument), or Chen's `identity` question presented as the change of direction, and cut the parable to two lines.

Chapter 6 grade: B. Enjoyed: the `logPayload` deletion; the Employee/`sortByName` fight; Idan's cast-free `parseConfig`. Got bored: the `createStore` section has a tangent (Eden's explicit return types), and the Turn is decorative.

Running settings from ch6: `Invoice`/`PaymentPlan` (Oded's billing); `Employee { name, department }` with Rivka, Amit (team); `settings` (theme/fontSize/telemetry); Eden's `createStore` (migration store); `RetryConfig { retries }`, `parseRetryConfig`; `ParseResult<T>` callback to ch5.

Continuity note: `ParseResult<T>` is defined in ch5 (`05-narrowing-strategies.md:232-234`) and again here (`:277-279`); both have the same `ok`/`reason`/`input` shape. Good. But ch6 Eli writes `ParseResult<T>` on the board and Oded asks "Are we deleting that too?" — consistent with Idan's ch5 voice.
### Chapter 7 (02-advanced-typescript/01-conditional-types.md)

This is the chapter the memory note calls the voice calibration point. It is the strongest chapter so far for voice: Oded's "Types can do ternaries." / "Nobody told me.", Oded's "So it lies, but it only lies in one place... That's most of my architecture", Chen's "Two more things this machine does quietly", and Oded's "You put my name on this PR, didn't you?" all sound like the people in the cast.

Principle (Eli, `:17`): the mechanics of `extends` as a gate versus a question. It is accurate and testable ("If a value of type T would be accepted where a string is required, the result is the first branch."). But the chapter's claim is about choosing between overloads, a named conditional, and normalising at the boundary; that choice is in the Verdict (`:584`) and is not in the Principle. The Principle answers "what does it do?", the Debate asks "should I use it?". Major clarity. Fix: add one sentence to Eli's Principle that states the choice rule ("Use a conditional return type when the relationship must survive into the caller's type and you can say how it is maintained; otherwise list overloads or normalise the input").

Verified with TS 7.0.2 (verify/haiku-story/ch7): the `slugify` overload-free conditional (`:231-238`) compiles; the wrong-branch version (`:264-271`) compiles and `many.map` fails at runtime (`:273-276`); Linoy's generic-body attempt errors with TS2322 (`:215-218`) as quoted; `StrictExclude<Channel, "smss">` gives TS2344 (`:460`); `Exclude<boolean, false>` is `true`; `[any] extends [string]` and `never extends string` evaluate as stated. Only one quoted diagnostic fails (below).

- `07-conditional-types.md:126-132` | The quoted `error TS2769: No overload matches this call. Overload 1 of 2, '(title: string): string', gave the following error. ...` | technical | major. TS 7.0.2 (verified with `--noErrorTruncation` and `--pretty false`) prints "No overload matches this call. The last overload gave the following error." followed by only the last overload's detail. The book states it checks against 7.0.2 (00-prologue/01-how-to-read.md:64). Fix: replace the quoted block with the 7.0.2 output (or drop the per-overload lines), and run the checks against that output.
- `07-conditional-types.md:538-569` (Turn) vs `:43`, `:584`, `:555`, `:568-569` | The Turn uses `slugify(post.tags)` in the tag branch (`:540`), then Linoy says "The tags still need a check before they can call `slugifyAll`" (`:555`), then `normalizeFrontMatter` calls `slugifyOne` and `slugifyAll` (`:568-569`). | inconsistency | major. The reader was just told the debate ends with `slugify` (union, `:175`) having been rejected for this caller, and the Verdict says "keep the two functions", which (from `:43`) means `slugifyOne`/`slugifyAll`. But the Turn's first snippet is still the union `slugify`, and Linoy's sentence mentions `slugifyAll` while the code calls `slugify`. Fix: in `:538-540` say `slugifyAll(...)` / `slugifyOne(...)` in the tag branch, or make the sentence at `:555` refer to `slugify`. Name the two functions once in the Verdict.
- `07-conditional-types.md:483` | "Yes. They passed. This was an invalid call. The type caught it..." | clarity | minor. Unlabelled speaker (Eden's line continues after `:479-481`, but the break makes it read as a new speaker).
- `07-conditional-types.md:487` | "You could add that call to the examples. Show the misuse as well as the good calls." | clarity | minor. Unlabelled. Linoy by context; add the name.
- `07-conditional-types.md:489` | "We did. Someone still has to keep those examples up to date. The editor was slow in that file too." | clarity | minor. Unlabelled; Eden by context. Name the speaker.
- `07-conditional-types.md:450` | "Misspell a case in a `switch` and the exhaustiveness check from the enum argument screams at you." | clarity | minor. "the enum argument" is not an argument in this book; this refers to ch4's exhaustiveness example. Say "the exhaustiveness check from the enum chapter" or "from `switch` over a union".
- `07-conditional-types.md:600` | Linoy: "We still owe `Unwrap` an explanation." | cross-reference | minor. Ch1 (`01-any-vs-unknown.md:276`) promised the conditional rules "will get their own debate", and ch7 defers Unwrap again. Acceptable if the `infer` chapter (ch11) pays it; check that it does (see cross-book list).
- `07-conditional-types.md:17-19` | Eli: "That is the whole of the syntax. If a value of type T would be accepted where a string is required, the result is the first branch. Otherwise it is the second." and "The branches describe types. They are evaluated during type checking and erased before the program runs." | AI-feel | minor. Manual-style explainer in Eli's mouth. Keep the first sentence and the example; cut "That is the whole of the syntax." (Eli's bio: he asks for claims stated precisely, not for a syntax summary).
- `07-conditional-types.md:86` | Linoy: "The signature asks a question about `T` — *is it an array?* — and whichever way the answer comes out is the return type." | AI-feel | minor. Restates the code. Cut or let Oded's "Okay. What is that." carry it.
- `07-conditional-types.md:251` | Oded: "So it lies, but it only lies in one place." He shrugs. "That's most of my architecture." | voice | keep. Best line in the section.
- `07-conditional-types.md:463` | "Both meanings of `extends`, one line. The gate rejects the typo before the question runs." | voice | keep. Ties back to the Principle; good.
- `07-conditional-types.md:364` | Oded: "Two hundred and six `Exclude`s and `Extract`s... deleted eleven generics that weren't doing anything, felt terrific about it." | callback | keep. Ties to ch6 `logPayload` ("Finally. A refactor that deletes something.") and is in character.
- `07-conditional-types.md:291` | Noam: "You said that about the helper with `as any`. I blocked that deploy for six hours." | callback | keep. Matches Noam's bio (blocked a deploy for six hours over a utility `as any`). Note: bio says "a single `as any` buried in a utility function" and ch7 says "the helper with as any" — consistent.
- `07-conditional-types.md:509-513` | Daniel on `NonNullable` (4.7 vs 4.8) and `unknown` → `{}`. | technical | keep. Accurate. Good "you may be able to delete this" beat.
- `07-conditional-types.md:596` | "The handbook's conditional-type example starts with the same three-overload alternative." | technical | minor. Not checked; plausible (the handbook's `createLabel` example uses overloads). Keep.
- `07-conditional-types.md:602` | Noam: "`Exclude<Channel, "smss">` compiles." | technical | keep. Verified: it compiles (no constraint), which is why StrictExclude exists.

Debate notes (ch7):
- The overload-vs-conditional fight is a real disagreement: Oded (read-at-4pm-on-a-Friday), Linoy (name the relationship), Eden (list the cases). Each side wins a point. Good.
- The tests section (`:293-303`, Noam: "Call the function. Check the value it actually returns.") is a good escalation: the type-test argument fails on the wrong-branch body, and the Verdict (`:594`) carries it.
- The distributive-conditional explanation (`:333-350`) is well paced: Oded's wrong reasoning is corrected by Daniel's "It asked a smaller one, three times". Good.
- The `never`/`any` edge section (`:372-434`) is dense but has a clear arc: Linoy asserts, Chen asks "Ask it directly", Daniel demonstrates. This is the best teaching of the chapter.

Turn (`:517-580`): the Turn is real and it changes the decision. Chen asks what the next function does with the tags, and the answer is that the caller never needed the union: normalise at the boundary. It dissolves the Debate's question, which is a legitimate turn, and it is earned by Chen's pressure. The only weakness is the naming (above).

Verdict (`:582-596`): earned. Each row of the table maps to a beat in the chapter. Two small points: the Verdict's "For this content pipeline..." is the first Verdict in the book that depends on a specific product, which is fine, but "keep the two functions" needs the names (see inconsistency above).

Chapter 7 grade: A-. Enjoyed: Oded's "Types can do ternaries", the overload/union fight, the Exclude-is-a-loop reveal, Oded's laptop, Chen's `never` questions, the normalise turn. Got bored: the edge-case section (`never`, `any`, boolean) runs to ~60 lines and mostly proves the same mechanism; one example could go to a footnote.

Running settings from ch7: `FrontMatter { title, tags: string | string[] }`; `slugify` / `slugifyOne` / `slugifyAll`; `post` (declared); `Channel = email|sms|push`; the "two hundred and six" utilities audit (Oded's repo); Eden's junior and the four-layer conditional error; `normalizeFrontMatter`.
### Chapter 8 (02-advanced-typescript/02-mapped-types.md)

Principle: there is no stated rule. The section opens on Linoy's PR, Guy's "None. You've changed where they come from." and Daniel's `Partial` reveal. Eli is not in this chapter, though the section promises his callback. The Principle is a scene, not a claim. Memory rule ("Principle section needs an explicit testable rule up front") not met. Major. Fix: have Daniel or Eli state the rule ("A published type should be written out; derive internal and form types from keys, and let a shared definition change only where the fields are meant to change together") before the diff.

Verdict (`:420-422`): a summary of what happened, not a ruling. "The published request keeps its three explicit properties. The form derives..." and "Her alternative remains in the review thread." It does not say what to do next time, and it does not use the honest-open-ending label either. Major. Fix: state the ruling as a rule, and if the disagreement (Guy's explicit interface vs Linoy's derived request) is still open, use "The Debate Continues" and say what it depends on.

Verified: the `Pick` / `Partial` / `Editable` / `FieldErrors` / `Labels` / `satisfies` / `@ts-expect-error` / key-remapping snippets all behave as described. The exactOptionalPropertyTypes claim (`:139-146`) is right: `email: undefined` errors only with the flag on. `JSON.stringify` drop claim (`:426-435`) is right.

- `02-mapped-types.md:13` | "Eli had promised 'types that walk an object's keys.'" | callback | minor. The quoted phrase is not verbatim; ch6 (`06-generics-basics.md:370`) says "branch on it, walk an object's keys, build another type from it." Quote it exactly or drop the quotation marks.
- `02-mapped-types.md:226` | "Linoy leaves her repaired version in the review thread." | AI-feel | minor. Silent-closer pattern (the brief names "leaves X beside Y"). Same pattern at `:402` ("Linoy leaves the existing `form` list ... above the inputs") and `:422` ("Her alternative remains in the review thread"). Three instances in one chapter. End on a line of dialogue or the decision.
- `02-mapped-types.md:400` | "Guy marks the mapping as reviewed." | AI-feel | minor. Fine as a stage direction, but it is the fourth closing beat in a row. Cut or merge with the line before.
- `02-mapped-types.md:437-448` | Noam's "don't put `Readonly` around the form container and tell me you've locked the draft." | voice | keep. Good Noam line and the code is right.
- `02-mapped-types.md:458` | Linoy: "There's our `Exclude` again. For `id`, it produces `never` in the key position, so that property disappears." | callback | keep. Ties to ch7 and is correct.
- `02-mapped-types.md:348` | `FieldErrors<T>` uses `-readonly` then `?`. Comparison with `:251` (`Editable`) and `:377` (`Labels`), which use `-?`. | clarity | minor. Fine, but the Turn's `FieldErrors` declares `?` at `:348` and then Linoy says "The entries are optional because most fields won't have an error" at `:356`. Consistent. No change needed.
- `02-mapped-types.md:122-133` vs `:296` (validation runs too early) | story | minor. The debate about `Validation runs too early` at `:306` says the validator "checks every input before we build the request", then `:330` moves validation to the patch. The story is consistent. No change needed.
- `02-mapped-types.md:199` | Guy: "What tells the next reviewer to look for another exception? Eden happened to have the import open." | voice | keep. Good.
- `02-mapped-types.md:218-224` | Linoy's shared-definition argument and Guy's "For these three fields, I'm keeping the interface." | debate | keep. A real disagreement, well argued, and it is not resolved.

Debate notes (ch8):
- The story is the book's most grounded: the imported account with no email, the red input, "We shouldn't turn this screen into an email migration." (`:302`), Eden's renamed-field anecdote (`:176`). These stakes are real and specific.
- The `Pick`/`Partial` exchange and the `strict`/`exactOptionalPropertyTypes` comparison (`:126-146`) are technical and they earn their place.
- Oded's "Put that in another PR." and the "Turn" (`:340-416`) are a feature addition more than a turn: the error-keys type is a new idea, not a reversal of the argument. The Turn does not change the debate. Major-ish structural point: this chapter has no turn in the book's sense. Fix: make the Turn the moment the email-required validator is found to be the wrong layer (it is, `:306`), and move `FieldErrors`/`Labels` into a closing "while we're here" note.
- The chapter is long (460 lines) with four separate type-level micro-debates (Partial/Pick, the import override, the form modifiers, error keys). A reader will feel the length by the Turn.

Chapter 8 grade: B. Enjoyed: the email-input red story; Eden's renamed-field anecdote; Noam's Readonly line; Oded's "I'm going to keep looking for Editable." Got bored: the form-modifier section and the error-keys section each restate the same "use keys, not values" point.

Running settings from ch8: `User` (readonly id, displayName, email, bio?, roles); `UpdateUserRequest` (published, explicit); `ImportedUser` with `email: string | null`; `Partial/Pick` derived update; `FormValues`, `FieldErrors`, `Labels`, `FormErrors`; Eden's account-import branch; Oded's `not-an-address` email.

Cast check: Linoy "She", Guy "He", Oded "He", Eden "He", Daniel "Daniel" (no pronoun). All consistent with bios.
### Chapter 9 (02-advanced-typescript/03-template-literal-types.md)

Principle: no stated rule. The section is a scene: Oded's "You actually opened another PR.", Gilad's "Where can this come from?", and a pasted JSON line. Eli is absent. The memory rule is not met. Major. The claim the chapter makes (event names can be derived from the key set; literal names at emission sites keep them searchable) is only stated in the Verdict, and there it is a recap. Fix: state the rule in Daniel's opening ("Derive event names from the setting keys, and keep a literal name wherever someone will search for it.") before the diff.

Verdict (`:389-393`): recap, not a ruling. It says what the PR "keeps" and what Gilad still cannot see ("Neither the search result nor the signature tells Gilad which path ran in a particular session"). That last sentence is a good honest point, but there is no ruling a developer can apply next time. Major. Same fix pattern as ch8.

Verified with TS 7.0.2 (verify/haiku-story/ch9): every error and non-error in the chapter behaves as described: `on("fontSzieChanged")` errors; `on("fontSizeChanged", v => v.toUpperCase())` errors; `publish<SettingKey>("fontSizeChanged", false)` compiles (`:400`); `badChange` errors (`:419`); `nextSize: 16` against `14` errors (`:432`); `writes.ts` compiles. The `rg` line numbers are consistent (`preview.ts:3`, and the replacement `restore.ts:7`).

- `09-template-literal-types.md:322` | Linoy: "I want to check its props before throwing the grouped type away." | clarity | minor. "its props" is unclear (props of what? the grouped type?). Say "check the grouped type against the filter menu before throwing it away".
- `09-template-literal-types.md:424` | A horizontal rule with no heading, then Oded's "I tried deriving the events from the defaults instead." and Linoy's `Capitalize` tail (`:441-450`). | structure | minor. Reads as a new section. Either put it under `## Additional Takes` sub-points with bold names (as it is) without the rule, or move it earlier.
- `09-template-literal-types.md:450` | Linoy: "Scratch file. You can approve the other tab." | clarity | minor. The line about approving "the other tab" is UI-specific and does not land. Cut it, or say "It's in the scratch file, not the diff."
- `09-template-literal-types.md:441` | "And if you want names like `onFontSizeChanged`, there's `Capitalize`. It uppercases the first character." | technical | keep. Accurate. The `HandlerName` output is correct.
- `09-template-literal-types.md:409` | Linoy: "Keep the name and payload together as a discriminated union." | technical | keep. Verified (`badChange`).
- `09-template-literal-types.md:435` | Daniel: "You made fourteen part of the type. It has been very loyal to fourteen." | voice | keep. Good.
- `09-template-literal-types.md:280` | Daniel: "Both substitutions range over both members. You asked for four combinations." | technical | keep. Accurate: expansion gives four members.
- `09-template-literal-types.md:325-326` | "Linoy closes the audit example. The restore calls are still visible behind it." | AI-feel | minor. Silent closer, same family as "leaves X beside Y". Cut.
- `09-template-literal-types.md:391` | Verdict: "Restore continues to update the complete state before publishing, with literal names at its three emission sites." | consistency | keep. Matches the Turn's final `restore.ts` replacement.
- `09-template-literal-types.md:9` | "The account form is still open behind the diff." | callback | keep. Ties to ch8 (Linoy's account PR). Good running-setting callback.
- `09-template-literal-types.md:73` | Oded: "Like we did with `user:login`. Pick an event, get its payload." | callback | keep. Ties to ch1's `EventMap` example.

Debate notes (ch9):
- The `rg` search as a running device (Gilad, `:140-145`, `:373-381`) is one of the book's best structural ideas: the chapter turns on what a search can and cannot find, and the Verdict's last sentence names it. Keep.
- Oded's `ChangeEvents` objection ("Provided we want an event for it.") and Linoy's "If that changes, we select the keys" is a fair two-step exchange.
- The Turn (`:328-387`) is a small concession (Oded keeps literal names at the restore site). It turns the chapter's technique from "derive everything" to "derive the setter, spell out restore". It is earned, but small. Acceptable.
- Gilad's "Now I have two places to inspect" (`:215`) and "I'm asking how I get to the code I need to inspect" (`:219`) are in character; keep.

Chapter 9 grade: B+. Enjoyed: the rg searches, Oded's "I have survived that before.", Daniel's fourteen line, the `Capitalize` tail. Got bored: the audit-events section (`:264-326`) is a second topic (grouped event names) that the chapter then drops; it reads as a detour.

Running settings from ch9: `Settings { theme, fontSize, autoSave }`; `SettingKey`; `src/events.d.ts` (`on`, `publish`); `src/writes.ts` (`setSetting`, `publishChange`); `src/restore.ts`; `src/preview.ts` (preview font size); `src/controls.ts`; audit events `profile:created` / `invoice:paid`.
### Chapter 10 (02-advanced-typescript/04-infer-keyword.md)

Principle: the section is a scene (Eden's "Why does tracking a parcel need a second argument now?", Idan's "It doesn't."). The chapter's rule ("a wrapper that extracts from the last signature loses overloads; prefer an explicit adapter for overloaded clients, and constrain generated clients to promise-returning members") is not stated anywhere up front. Major, same as ch8/ch9. The only explanation is narrator prose at `:91` ("The variable is available in its true branch, not its false branch or outside the conditional."), which reads as a manual, not a character. Minor-to-major AI-feel.

Structure: this chapter has **no `## The Turn` heading**. Debate runs straight into `## The Verdict`. The skeleton lists the Turn as standard. The turn itself (the boolean that is a promise at runtime, `:206-230`) is real, but a reader cannot find it by section. Major. Fix: add `## The Turn` before `:232` ("Idan replaces the mapped type") and move the boolean-is-a-promise exchange under it.

Verified with TS 7.0.2 (verify/haiku-story/ch10): the `Safe` mapping with `infer` and last-signature extraction behaves as described; `safeRequests(raw)` fails on `isTrackingCode` (`:437`, message fragment matches); `if (promise)` gives TS2801 (`:249` claim correct); `as SafeCourier`, the `attempt` adapter, the overload implementation, and `keep`/`ReturnType` (`unknown`) all compile or behave as stated.

- `10-infer-keyword.md:299` | "She tries a courier-specific version." (right after Sahar's question at `:295`, and Idan's answer at `:297`) | cast / clarity | major. The speaker is ambiguous, and the nearest named speaker is Sahar, whose bio says he (`00-prologue/02-meet-the-cast.md:75-77`). If "She" means Idan, the pronoun is right but the antecedent is not clear. Fix: name the speaker ("Idan tries...") or move the line.
- `10-infer-keyword.md:329` | Idan: "The constructor still calls this a `Courier`, though we've replaced its methods." | technical / clarity | minor. There is no constructor in this snippet; she means the declared type. Say "The declaration still calls this a `Courier`".
- `10-infer-keyword.md:333-336` | Idan: "We can make the exclusions one list and derive the type from it—" / Eden: "Before we build the configurable version, here's the adapter I meant." | clarity | minor. "configurable version" is never shown, and the "exclusions" list is dropped. Either build it or cut the promise.
- `10-infer-keyword.md:367-371` | The adapter is named `courierAdapter`, but the Verdict says "The callers import its `courier` object" (`:398`), and `:448` says "You can replace the courier export." | consistency | minor. Pick one name for the exported object.
- `10-infer-keyword.md:400` | Eden: "I started counting forty call sites. That's the wrong number." | clarity | minor. Unclear whether "forty" is wrong or the counting is wrong. Say "Counting call sites is the wrong question."
- `10-infer-keyword.md:249` | Daniel: "On 7.0.2 I get a diagnostic for `if (promise)`. Put the `!` back and it compiles." | technical | minor. Correct (TS2801 verified). But the `if (promise)` example is not shown, so the reader has to trust it. Add the one-line example.
- `10-infer-keyword.md:161-166`, `:188` | the `as` and `as unknown as` ensures Noam's critique is in character (Noam: "`as unknown as`. You'd send that back in a parser review." at `:327`). | voice | keep. Good.
- `10-infer-keyword.md:270-283` | Eden's "Why `Awaited` instead of the `Unwrap` we already had?" with Idan's answer. | technical | keep. Verified; a clear explanation.
- `10-infer-keyword.md:467` | Daniel: "Without a particular call, there's no particular `T` to recover here. At the call, the argument supplies one. A wrapper that extracts and rebuilds this signature has work to do if it wants to preserve that relationship." | AI-feel | minor. The last sentence is a summary no one at the table would say. Cut it.
- `10-infer-keyword.md:206` | "Version five also adds `isTrackingCode`. It is a local format check: `TRK-42` is valid, `bad` is not." | story | keep. The stake (`acceptTrackingCode("bad")` returns "accepted") is clear and the chapter earns the Turn from it.
- `10-infer-keyword.md:404` | Eden: "A dozen. More code than your repair. I'd still do it for this client." | voice | keep. Good Eden; his "I'm objecting to having that decision arrive through the wrapper's default." (`:394`) is the sharpest line in the chapter.

Debate notes (ch10):
- The debate is technically dense and mostly honest. It has seven small reversals in ~200 lines (Safe → Noam's "you're asserting the relationship" → `SafeCourier` → boolean-is-a-promise → `Awaited` → sync guard → `as unknown as` → `attempt` adapter → `safeRequests`). Each reversal is earned, but a reader will lose the thread around `:300-335`. Consider a one-line recap before `:337` ("So far: the courier needs overloads; the generated client doesn't.").
- Noam, Idan, and Eden each win a point. The split verdict (adapter for courier; constraint for generated client) is earned.
- Sahar's two questions (`:295`, `:386`) are in character ("Where would that exception go?", "What do you still get from mapping the whole client?").
- Story stakes: the page stopped compiling, forty call sites, a dozen forwarding methods. Concrete and believable.

Chapter 10 grade: B. Enjoyed: the `isTrackingCode` reveal ("Oh. It's already wrapped."), Noam's "All that, and we're still calling it Safe.", Eden's objection to defaults. Got bored: `:300-335` reads as the same argument about the sync guard three times; and the Principle is a scene.

Running settings from ch10: `Courier` SDK v4 → v5 (`retrieve` overload with `events: true`, `isTrackingCode`, `region`); integration module with `courier`; the tracking page (`parcelStatus`, `acceptTrackingCode`); `TrackingApi` generated client (`lookup`, `history`); Eden's old payments adapter; `Result<T>`, `Safe<C>`, `Unwrap<T>`, `Awaited`.
### Chapter 11 (02-advanced-typescript/05-advanced-generics.md)

Principle: Eli states the mechanism at `:41` ("A generic can carry what we know about a configuration through several calls... `build` requires evidence of both fields.") That is the closest any chapter so far comes to a rule in Eli's voice, and it is testable. It is still a teaser: the testable rule the reader needs (state in the type, check at the call, and make the helper's parameter say which states it accepts) appears only in Guy's `:385` and the Turn. Minor-to-major. Fix: end Eli's line with the rule, e.g. "Put what you have supplied in the type, and have each later step require it."

Structure: this chapter has `## The Turn` (`:303`) and `## The Debate Continues` (`:434`), but no `## The Verdict` and no `## Additional Takes`. The open ending is honest and fits the chapter. However, the last line is Chen's unanswered question (`:458`, "Should we allow that assignment, given what `source` does with the result?"), and "The Debate Continues" never answers it. Minor. Either answer it in one line or move the question into the continuing debate's last paragraph.

Verified with TS 7.0.2 (verify/haiku-story/ch11). Everything technical checks:
- `incomplete.build()` error TS2684 (`:33-39`) and the elaboration (`:150-152`) match the shape of the messages.
- `ready.build()` and `reversed` compile (`:101-118`).
- The replacement `source` method (`:333-346`) compiles, and `sourcePreset.source("customers")` gives TS2684 with the message "was reduced to 'never' because property 'source' has conflicting types" (`:352-358`). The book quotes it correctly, which is impressive.
- `selectOrders`, `forNightlyExport`, `repoint(sourcePreset)` compile, and `const lessSpecific: ExportBuilder = sourcePreset;` is accepted (`:455`).
- `createExport({ source: "orders" })` gives TS2741 (`:221-223`), as quoted.
No technical findings in this chapter.

- `05-advanced-generics.md:87` | Eli: "Nor does the default create an empty object. The constructor call does that." | clarity | keep. Good; it corrects Guy's wording and is in Eli's voice.
- `05-advanced-generics.md:426` | "The handbook's discussion of generic type compatibility follows the members in the same way. Distinct type arguments alone don't make instances incompatible." | AI-feel | minor. Manual-style sentence, and the second sentence is a claim without an example. Cut the first sentence or give the example at `:424` a one-line code demonstration.
- `05-advanced-generics.md:284` | "Guy leaves the two variables visible. Dafna puts her version below them." | AI-feel | minor. Silent-closer pattern ("leaves X ... below").
- `05-advanced-generics.md:436` | "Oded keeps the error from `repoint` beside the builder and function examples." | AI-feel | minor. "beside" again; the brief names "leaves X beside Y" as a pattern. Cut.
- `05-advanced-generics.md:280` | Oded: "Several of our existing builders return `this`. I would have called `sourcePreset.destination(path)` on its own line." | voice | keep. Good, practical.
- `05-advanced-generics.md:297` | Dafna: "At least the spread tells the reader where it was made." | voice | keep. Good Dafna line.
- `05-advanced-generics.md:365` | Oded: "The object version's error just said which property was missing. This is going in the documentation too." | voice | keep. Ties the chapter's two approaches.
- `05-advanced-generics.md:303-331` | The Turn: Chen's "Both of these compile." | story | keep. Real turn: the builder that Guy argued could not be repointed can be, and the fix is a change to `source` itself, not to the helper. Earned.
- `05-advanced-generics.md:444-448` | Guy vs Dafna on the SDK contract, and Dafna's "I'd accept the package-author responsibility for these fixed presets." | debate | keep. Real disagreement and honest concessions both ways.

Debate notes (ch11):
- The argument runs on real design trade-offs: Guy's builder (static checks, both orders, runtime guards) against Dafna's `createExport` and `ordersTo` (plain data, no protocol). Neither side is strawmanned. Oded's "You're both selling me the same spread with different packaging." (`:258`) is a fair summary.
- Eli is used properly here: three interventions, each sharpening a point (`:87`, `:161`, `:420-424`). This is Eli's best chapter in the book so far.
- The helper-generic debate (`:137-198`) is a real argument over whether a helper should preserve state or demand a particular state. Dafna's "I'm asking which callers you're preserving it for" is a good challenge.

Chapter 11 grade: A-. Enjoyed: Chen's "Both of these compile.", Eli's `{}` correction, the `source?: never` error with its intersection-reduced message, Oded's documentation remark. Got bored: `:262-301` (the "I didn't keep the return value" section) repeats the createExport-vs-builder point the chapter has already made.

Running settings from ch11: `ExportSpec { source, destination }`; `ExportBuilder` (Guy); `createExport`, `withNightlyDestination`, `ordersTo` (Dafna); `forNightlyExport`, `selectOrders`, `repoint` (helpers); `sourcePreset` (reporting package); the manual-export command (workspace settings).
### Chapter 12 (02-advanced-typescript/06-variance.md)

Principle: a scene (Noam's "The receipt says `rows` is a number. It just called `toFixed` on `undefined`.", Eden's "It was a number when the export finished.", Guy's "Who wrote to the cache afterward?"). The rule the chapter lives on ("a cache that is read and written is invariant; a writer that accepts wider values can stand in for a narrower one, but a holder that reads cannot") is only in narrator prose at `:11`, and Daniel's `:87` statement. Eli is absent. Major, same pattern as ch8-10.

Verdict (`:359-367`): decision summary ("The runner keeps the full caches. Receipts get a CSV reader...") with an honest caveat from Noam ("If one has already widened a CSV cache, putting our new type on the result won't recover the information it lost"). The boundary is clear, but the reader is not told a rule to apply elsewhere. Major, same fix pattern.

Verified with TS 7.0.2 (verify/haiku-story/ch12). All messages match in substance: the generic-`T` write error (`:104-106`) matches exactly; the `in out` rejection (`:139-143`) matches; the function-property rejections (`:235-238`) and the `archiveAction(lastCsv)` rejection (`:324`) behave as described; `dashboardLabel(csvCache)` (`:262`) is accepted; `MethodCache<out T>` is accepted (`:371-378`); `in out S` on `ExportBuilder` rejects `lessSpecific` and the repointed `withDestination` call (`:390`, `:397`). No technical findings.

- `06-variance.md:213` | "The exception is part of strict checking, not evidence that this repository forgot to enable it." | AI-feel | minor-to-major. The caveat is one nobody in the room raised. Eden has already said "Strict mode is enabled in both packages." (`:209`) and Daniel answered it (`:211`). Cut the last sentence; the paragraph is a manual.
- `06-variance.md:197` | "This factory's methods close over `current`, so forwarding them also preserves the runtime behavior; no lost receiver explains the failure." | AI-feel | minor. Manual-style explanation in the Debate. The reader has already seen the forwarding work; cut to the first sentence.
- `06-variance.md:367` | "Eden leaves the adapter reproduction in the check suite and removes the CSV cache from the panel's setup." | AI-feel | minor. Silent closer, same family as the "leaves X" pattern. End on Noam's or Eden's line before it.
- `06-variance.md:355` | Eden: "Two actual caches. A reader view on the old object wouldn't have saved that row count." | clarity | minor. This reverses Guy's "That works too" at `:288` without saying so. It is consistent (a view over one shared object still loses the row count when the ZIP overwrites it), but the reader has to work it out. Add "A view on one object still shares the overwrite."
- `06-variance.md:11` and `:36` | "Until now, both have been talking about the same result." | voice | keep. Clear setup for the whole chapter.
- `06-variance.md:57` | "Its new action records the archive path in the cache it already receives." | story | keep. Good; the stake (the receipt breaks from a dashboard change) is set up in one line.
- `06-variance.md:116` | Guy: "The CSV record now points at a ZIP. We'd be changing `CsvResult` to mean the latest download plus some CSV history." | debate | keep. Real argument against Eden's fix.
- `06-variance.md:245` | Eden: "That one didn't break a receipt. You've broken its callers too." | story | keep. Good; the Turn's cost is felt.
- `06-variance.md:384-388` | Guy: "What about Chen's assignment? The configured builder that became a bare `ExportBuilder`?" | callback | keep. Ties to ch11 `:455`.
- `06-variance.md:400` | Eden: "That's the source-only parameter Dafna offered." | callback | keep. Ties to ch11 `:189`.

Debate notes (ch12):
- The chapter is the cleanest demonstration in the book of a real turn: the first fix (`in out`) rejects the bad call but is defeated by a structural adapter (`forwarded`, `named`, `copied`). Each defeat is a concrete lesson (`:158`, `:174`, `:185`). Then Noam's function-property change is the turn, and it breaks the label-only dashboard too, which forces the ResultReader split. Earned.
- Linoy's covariance and contravariance explanations (`:266`, `:311`) are accurate and sit well with the characters (Linoy is the one who knows the terms).
- Eden's "I'll migrate the consumers with it" (`:363`) and Guy's "That's the boundary I'd publish" (`:361`) are in character.
- The `strictFunctionTypes` section (`:199-215`) is the weakest debate: Noam asks, Daniel explains, Guy repeats, and the section ends on a rule instead of a turn.

Chapter 12 grade: A-. Enjoyed: the `forwarded` / `named` / `copied` escapes; the Turn where Noam changes the interface and breaks the label dashboard; Eden's "You've broken its callers too."; the two-cache ending. Got bored: the `strictFunctionTypes` section and the Additional Takes on `MethodCache`.

Running settings from ch12: `ExportResult { path }`, `CsvResult { rows }`; `createCache` (`csvCache`, `lastCsv`, `latestDownload`); `receipt` (reporting team), `dashboard` / `dashboardLabel` / `archiveAction` / `recordCsv`; `orders.csv` / `orders.zip` / `next.csv`; the `ExportBuilder` from ch11 (Chen's assignment).
### Chapter 13 (02-advanced-typescript/07-declaration-merging.md)

Principle: a scene (Oded's "This is the PR that gets rid of the red underline.", Gilad's "Show me one printing."). The rule ("a declaration tells the compiler what to expect; it does not make the runtime have it") is stated only in Gilad's `:54` ("A declaration tells the compiler what to expect. For this one, the expectation depends on which JavaScript has run."). That is close to a rule and testable, but it is a line in a scene, not the Principle. Major, same pattern. Fix: move Gilad's line into Dima's opening description of the `.d.ts` file, and say the rule there.

**Blocker, technical (verified):**
- `07-declaration-merging.md:330` | Chen: "If their declaration requires `frame`, our optional one conflicts. That error is in `labels.ts`, so `skipLibCheck` won't hide it." | technical | **blocker**. Verified with TS 7.0.2 (verify/haiku-story/ch13): with an optional `frame?` in `labels.ts` and a required `frame` in the upstream declaration, the error is `TS2386: Overload signatures must all be optional or required.` and it is reported in the upstream `.d.ts` (line 4 of that file), not in `labels.ts`. With `skipLibCheck: true` (the usual setting) the error disappears completely, and the build is green. So the sentence is wrong on both counts: the error is not in `labels.ts`, and `skipLibCheck` does hide it. This is the chapter's last line and the one the book wants readers to remember ("A clean build isn't a reminder to remove the patch"); a reader who tests it will find the opposite. Fix: say what the verified behaviour is: "the conflict is reported in the upstream declaration, and `skipLibCheck` will hide it. A clean build doesn't tell you the patch has become redundant or contradictory." Then check the claim again with the real package.

Other findings:
- `07-declaration-merging.md:246` | Dima: "Dima leaves both entry points importing the constructor from `./labels`." | clarity | minor. The Turn (`:185-192`) left `batch.ts` bypassing the integration module on purpose, and `:244-246` says the bypass "still compiles". The reader cannot tell whether the batch entry was fixed. Say which entry changed.
- `07-declaration-merging.md:260` | "Oded leaves the optional member in the diff." | AI-feel | minor. Silent closer, same pattern as elsewhere. Cut or end on Idan's line at `:258`.
- `07-declaration-merging.md:246` (TS2722 quote) | "TS2722: Cannot invoke an object which is possibly 'undefined'." | technical | keep. Not re-verified, but consistent with TS behaviour for an optional method called without a guard.
- `07-declaration-merging.md:286` | `TS2305: Module '"label-kit"' has no exported member 'version'.` | technical | keep. Verified: the wrong-patch file (no top-level import/export) produces this error exactly. Chen's explanation at `:290` is correct.
- `07-declaration-merging.md:201` | "The type-only import brought `labels.ts`, including its augmentation, into the compiler's program. It didn't make the process execute that file." | technical | keep. Correct, and the best explanation of type-only imports in the book so far. Consider moving it into the Principle as the rule.
- `07-declaration-merging.md:298-322` ("The host puts it on window") | an Additional Take with no link to the badge story except the `frame` / `prefix` contrast at `:322`. | structure | minor. Idan's `declare global` explanation at `:320` is accurate and useful, but the section reads as a separate chapter. Keep it as the tail, or cut.
- `07-declaration-merging.md:58` | `### The other way in` | formatting | minor. Other debate sub-heads are quoted titles (`### "..."`); this one is not.
- `07-declaration-merging.md:151` | Oded: "Fine. Two runs. Can we merge twelve lines now?" | voice | keep. A joke that works because the chapter is about merging.
- `07-declaration-merging.md:264` | Verdict, Dima: "Keep the augmentation. Keep it optional, and keep the check in `renderBadge`. Both entries import the constructor through `labels`, so they actually get the plugin." | verdict | keep. A clear, applicable ruling. The best Verdict in the book so far in terms of "a reader can act tomorrow".
- `07-declaration-merging.md:254` | Dima: "It isn't something the augmentation proves." | voice | keep. Good; exactly what a balanced pragmatist would say.

Debate notes (ch13):
- The chain of entry points is clear and the story is the best in the book for stakes: a batch reprint that fails only in a fresh process, Gilad's "Show me the stack trace", Chen's "First line in renderBadge."
- The Turn (`:172-195`) is the strongest moment: the type-only import passes the compiler and the runtime still fails, and Idan's "Its type. Look at the emitted formatter." is the right move. Earned.
- Idan's "Why does it say every label has `frame` when we've just passed it one that doesn't?" (`:211`) is a sharp line that forces the declaration change.
- Oded's wrong-patch experiment (`:274-294`) is correct and funny (`export {}` fixed it too). Good.

Chapter 13 grade: A-. Enjoyed: the batch/web failure; the type-only import Turn; Idan's optional-member argument; Dima's Verdict. Got bored: the `window` section at `:298-322` is a different topic.

Running settings from ch13: `label-kit` (`Label`, `version`), `label-kit/frame` plugin (`frame`, `render`); `labels.ts` integration module; `badge.ts` (`renderBadge`); `web.ts`, `batch.ts`, `isolated.ts`; `host.d.ts` (`BADGE_HOST.prefix`); the registration desk.
## Part 03: Patterns and design

### Chapter 14 (03-patterns-and-design/01-error-handling.md)

Principle (Liron, `:5`): "When you catch a failure and return an error value, you make two decisions: what to report, and that the function can finish normally... Before returning, check whether they still need that rejection to stop or undo the work." This is the best-stated Principle in the book so far: plain, testable, and the Turn is built on exactly that check. Keep it as the model for the other chapters.

Verified with TS 7.0.2 (verify/haiku-story/ch14): Dafna's `bookParty` (`:111-126`), Guy's move-the-catch version (`:222-238`), `tryHold` and `transactionResult` (`:264-298`), and the alternative `bookParty` (`:317-328`) all compile. The `never` check after the switch (`:58-59`) compiles. The only error is the intended TS1196 at `:384`, and its wording matches the compiler. The statement that a `return` without `await` inside `try` escapes the catch (`:243`) is correct.

- `01-error-handling.md:275` | "It delegates to the existing store, so it must translate a refusal into rejection while the store is still deciding what to do." | AI-feel | minor. Narrator explanation in the middle of Dafna's naming beat. Cut the second clause or give it to Guy as a question.
- `01-error-handling.md:152` | "The `never` check tests the cases in `Failure`. How the value reached that switch doesn't change the check." | AI-feel | minor. The second sentence is a caveat no one at the table raised. Cut.
- `01-error-handling.md:389` | "Other thrown values keep going to a handler that can deal with them." | AI-feel | minor. Summary closer after a fact. Keep the first two sentences; cut the third.
- `01-error-handling.md:162` | "Both pages show `"A2 is taken."`. Neither returns a booking message. Both compile." | clarity | keep. Good setup for the Turn.
- `01-error-handling.md:158` | Dafna: "Wait. I've caught it before the transaction sees it. Run that case." | story | keep. This is the chapter's best stake: her belief is wrong and the next beat shows it.
- `01-error-handling.md:208-214` | Guy's three-line trace of `ok: false` reaching `committed = draft`, and Dafna's "I need the transaction to roll back before the page ever gets it." | story | keep. Clean, accurate, and the Turn is earned.
- `01-error-handling.md:243` | Dafna: "That `await` keeps the rejection inside the `try`, too. If we returned the transaction's promise instead, a later rejection would escape this `catch`." | technical | keep. Correct, and a practical gotcha.
- `01-error-handling.md:343` | Guy: "So `Result<Booking, Failure>` lists the refusals we return. It doesn't list every way this function can fail." | voice | keep. Strong line; it is the chapter's lasting advice.
- `01-error-handling.md:357` | Sahar: "You added `tryHold` to test this. If you remove it, which part of the booking needs the adapter?" | voice | keep. Sahar's bio, cleanly enacted.
- `01-error-handling.md:361` | Liron: "Discarding a draft doesn't intrinsically require an exception. The exception is how this library asks to be told." | voice | keep. Good Liron.
- `01-error-handling.md:373-375` | Gil: "Even the broken version leaves A1 free." | clarity | minor. "The broken version" has not been named in the Verdict; the reader has to remember which version Gil means. Say "the callback-catch version".
- `01-error-handling.md:367` | Verdict: "Dafna removes the catch from the transaction callback. She keeps the Result-returning `bookParty` with Guy's outer catch, and leaves the page's explicit branch in place." | verdict | minor. It is a decision, but the reader is not given a rule for the next booking. Liron's Principle has the rule; a single sentence tying the Verdict back to it would close the loop: "Check whether the rejection still stops or undoes work before you return a value."

Debate notes (ch14):
- The disagreement is real and well-argued: Dafna wants the refusal in the type; Guy wants the rollback to stay with the store; the Turn shows the first fix is wrong; the second fix (move the catch) answers both. Earned.
- `tryHold` and `transactionResult` (`:257-313`) are a real alternative, and Sahar's question at `:357` and Dafna's "This booking doesn't" at `:359` close the detour honestly.
- Gil does what Gilad would do: he runs both orders and reads the committed state. Keep.

Chapter 14 grade: A. Enjoyed: the Principle; Dafna's "Run that case."; Guy's "It doesn't list every way this function can fail."; Gil's reversed-seat test. Got bored: `:257-313` (the transaction adapter) is the longest detour in the chapter, but it earns its place.

Running settings from ch14: store library with `hold` and `SeatRefused`; `Failure` (`occupied` / `unknown-seat`); `Booking { seats }`; `bookParty`, `submit`, `failureMessage`; `testStore` (Gil's stand-in); seats A1, A2; `transactionResult` (Dafna's adapter).
### Chapter 15 (03-patterns-and-design/02-branded-types.md)

Principle (Eli, `:5-7`): two parts, both testable. "A brand adds a type-level marker so the compiler can distinguish them." and "Some brands make a further promise... Those operations must preserve what the check established, or the brand can outlive the fact it claims." The second part is what the Turn tests. Strong Principle. Keep.

Verified with TS 7.0.2 (verify/haiku-story/ch15): the `PageNumber`/`PageCount` error at `:98` matches exactly; `pageNumber` misuse at `:109` errors as stated; `CheckedRange` spread gives TS2741 (`:218`) as described; `moveStart(selected, ...)` compiles, as the book says (`:232`). One claim fails (below).

- `02-branded-types.md:333` | Noam: "Then existing callers keep compiling. Including the one that passed the last page." | technical / clarity | major. Verified: with Chen's optional marker (`:329`), `previewSoft({ first: selection.first, count: selection.last })` still errors (TS2322, "Type 'PageNumber' is not assignable to type 'SoftPageCount'"), because the branded `last` carries `"PageNumber"`. Only an unbranded plain number now passes (`count: 4`). So the sentence is wrong for the caller that actually passed the last page in this chapter (`:98`). Fix: "Including any caller that still passes a plain number, the way the old code did before it was branded."
- `02-branded-types.md:322` | "He leaves the test of `count: selection.last` in the compiler checks." | AI-feel | minor. "leaves X in Y" silent-closer pattern. The test is the point; say "He keeps the `count: selection.last` case as a compile-error test."
- `02-branded-types.md:318` | "He leaves `requestFrom` in the patch." | AI-feel | minor. Same pattern; "leaves X in Y" appears three times in the Verdict area. Cut or name the decision.
- `02-branded-types.md:337` | Eli's coda after `---` (`:335-337`): "If the dialog restores From and To from a shared link..." | structure / voice | minor. A horizontal rule with no heading, then Eli's closing line. It is good (the link has no brands; you still have to establish meaning), but it reads as an orphan. Move it into the Verdict or into the Principle's second paragraph.
- `02-branded-types.md:245` | "TypeScript's object-type documentation notes that `readonly` does not affect compatibility with a mutable property." | technical | keep. Accurate, and the paragraph after it ("Freezing the original object brand alone would not reject a spread") is correct.
- `02-branded-types.md:86` | "This is the intersection technique in TypeScript's nominal-typing example." | technical | minor. The link to the playground example is the authors' own; it reads as a manual line in the middle of Noam's speech. Acceptable as a footnote.
- `02-branded-types.md:101` | "Its detail ends at the incompatible marker values, `"PageNumber"` and `"PageCount"`." | technical | keep. Accurate.
- `02-branded-types.md:157-161` | Eden's "With a count, it has to calculate the last page again" and the dialog's label. | story | keep. Good; the label is a concrete reason to keep endpoints.
- `02-branded-types.md:191` | Noam: "I can't use this type as my reason to remove the consumers' order check." | voice | keep. Strong line; it is the chapter's point in Noam's words.
- `02-branded-types.md:316` | Eden: "That request has a positive count from the scalar constructor, with no pair of endpoints to reverse." | voice | keep. Good.
- `02-branded-types.md:320` | Eden: "If another consumer needs to retain an accepted selection, we'll revisit the class." | verdict | keep. Honest, and tells the reader when the decision reopens.

Debate notes (ch15):
- The Turn (`:158-195`) is a real turn: Oded's migration of the From handler, a spread that compiles and yields `count: 0`, and Noam's "the checker carries that property into the copy... It trusted the range." Earned. Then the class (`:197-245`) is a second, separate turn and a real disagreement with Eden about cost.
- The disagreement at the Verdict (Eden: scalar brands and `requestFrom`; Noam: `CheckedRange` for the export API) is real and not strawmanned. Eden's "we'd have to adapt the old helpers and every reader" is a concrete cost.
- Chen's optional marker (`:326-333`) is a good probe, but Noam's answer is the wrong one (see above).
- Oded's "Put that comparison in one function. Both places can call it." (`:122`) and Noam's "And the next consumer can skip it" set up the chapter's argument well.

Chapter 15 grade: A-. Enjoyed: the Turn with the spread that yields `count: 0`; Noam's "It trusted the range."; Eden's "The name says count. The value is the last page."; the scalar-count resolution. Got bored: the class section (`:197-245`) is long, and the `moveStart` / `first()` digression takes a page to say what the reader already knows.

Running settings from ch15: `previewNumbers` (renderer, batch exporter, fifty pages); export dialog From / To (inclusive); `selection = { first: 3, last: 4 }`; `PageNumber` / `PageCount` / `PageRange` / `CheckedRange` / `PageDraft`; `requestFrom`, `previewDraft`, `exportDraft`; the shared-link coda.
### Chapter 16 (03-patterns-and-design/03-runtime-validation.md)

Principle (Gilad, `:5`): "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result." Clear and testable; the Turn (`:214-254`) is exactly the case it names. Strong. Keep.

Verified with Zod 4.6.2 and TS 7.0.2 (verify/haiku-story/ch16, ran the emitted code with Node 22): every printed output in the chapter matches (`:115-124`, `:76` issue text, `:163-164`, `:183-184`, `:221-222`, `:288-289`, `:353-354`); `z.looseObject` / `z.strictObject` / `.catch("in_transit")` behave as stated (`:374-375`); `unfinishedLabel` gives TS2366 (`:192`). No technical findings.

- `03-runtime-validation.md:378` | Noam's `.catch` continuation (`"A .catch callback could log the rejected input..."`) starts a new quoted paragraph with no speaker tag. | formatting / clarity | minor. Readers may take it for a new speaker. Either fold it into Noam's first paragraph or add "Noam continues:" once.
- `03-runtime-validation.md:96` | `type Receipt = { id: string; raw: unknown };` declared at `:96` before its first use in `project`. | clarity | minor. Fine, but a reader sees `Receipt` appear without context in the `receive` change. Move the type to the Projection block (`:263`).
- `03-runtime-validation.md:52` | "The HTTP handler turns an uncaught storage failure into a 500 response." | clarity | minor. No 500 path appears in the code at `:59-64` or `:98-101`. Either show it in `receive` or say "the server's default handler returns a 500".
- `03-runtime-validation.md:363` | Verdict: one long paragraph of outcomes ("The consumers... will receive `Projection`... Refunds get `issue`, `skip` or `review`... Known application objects can still omit extra keys; the inbox retains what they leave out."). | verdict | minor. A correct ruling, but it reads as a list of facts. Split into two rules a developer can apply: (1) consumers receive the projection, not the open update; (2) unfamiliar values get `review` for money decisions, not `skip`.
- `03-runtime-validation.md:150` | "An unfamiliar string can satisfy that contract; a number or an empty string cannot." | clarity | keep.
- `03-runtime-validation.md:197` | Idan: "The tag doesn't write the other branch for us." | voice | keep. Good Idan.
- `03-runtime-validation.md:250` | Idan: "A closed enum doesn't make that a correct business decision." | voice | keep. Good; it is the chapter's thesis in one line.
- `03-runtime-validation.md:359` | Gilad: "The queue already has an owner. Keep the receipt open until that owner resolves it. A 204 isn't the end of our work." | voice | keep.
- `03-runtime-validation.md:384` | Gilad: "Lose the 204 after the write and the carrier sends the update again. A new inbox ID doesn't make it a new refund." | voice | keep. Good stake for the Additional Takes.

Debate notes (ch16):
- Real stakes (a paused account for all shipments; "So naturally we stopped hearing about all the parcels that arrived.") make this the best-motivated chapter in Part 03.
- The Turn (`:214-254`) is a genuine turn: the closed-enum fix is shown to be the wrong fix for the carrier's split status, and the new policy is "unfamiliar means review". Earned.
- Noam and Idan argue at the right level: Noam wants the decision in the integration module; Idan wants the open type reachable by the next consumer. Their disagreement is resolved by a concrete type (`Projection` with no `status`), which is clever.
- Eden's `eta` thread (`:112-138`) is a good, grounded example of "preserve or translate", and it sets up the Additional Takes.
- Sub-issue: the chapter runs 385 lines with two Zod schemas (`KnownUpdate`, `OpenUpdate`) and then `WireUpdate`. The reader can lose track of which schema reaches which consumer by `:300`. A one-line table at `:262` would help.

Chapter 16 grade: A-. Enjoyed: the stuck-customs joke; Oded's "I gave it the answer for don't refund it at all."; Noam's "Your next consumer can write Oded's branch without changing the schema."; the `Projection` type. Got bored: `:331-357` (the run-through of receipts) repeats the Turn's point in print form.

Running settings from ch16: carrier (`label_created`, `in_transit`, `delivered`, `returned`; later `held_at_customs`, `returned_damaged`, `returned_refused`); `KnownUpdate`, `OpenUpdate`, `WireUpdate`, `Projection`; inbox `append`; `receive`; the refund worker (`issue` / `skip` / `review`); the tracking page; `shipmentId: "s1"`; `eta` (`2026-10-20`).
### Chapter 17 (03-patterns-and-design/04-immutability.md)

Principle (Liron, `:5-9`): "Before you change an object, ask what each holder expects to keep... Those are different promises, even if both holders only read." Good. It is a question-led rule, testable enough: a reader can apply "what does each holder expect to keep?" to a real object. Keep. The second paragraph (`:7`) is dense and the middle sentences ("For current state, keep changes behind an owner...") are a little manual; acceptable.

Verified with TS 7.0.2 (verify/haiku-story/ch17): TS2540 (`:77`), TS4104 (`:82-83`), TS2345 for `receipt(readPrice, ...)` (`:239`), TS2739 for `receipt(view, ...)` (`:263`) all match. The runtime claims (`Was 80. Now 80.`, `Object.isFrozen`, `20 0`, `100 70`, the Gil index sum 499500 and JSON equality, the `DeepReadonly<Date>` `setUTCFullYear` behaviour) are right on paper; I did not run the full file.

- `04-immutability.md:372` | Gil's continuation paragraph ("Those are a thousand distinct keys...") is an unattributed quote after his code. | formatting / clarity | minor. Same issue as ch16 `:378`. Attribute it: "Gil adds:" or fold it into his line.
- `04-immutability.md:129` | Eden: "A missing exception won't tell me there are no writers left." | voice | keep. Strong; it is the chapter's operational point.
- `04-immutability.md:350` | Eden: "Adding `readonly` was a smaller diff. It just didn't do this job." | voice | keep. Good closer; ties to the Principle.
- `04-immutability.md:344` | Verdict: "Keep the price calculation as a value-returning function. Let the checkout owner publish the current price. Expose live access through a call; give the receipt stable values." | verdict | keep. A practical, applicable rule.
- `04-immutability.md:289-340` | "Trying a promotion before applying it" is a fourth design (valueCheckout closure, chooseDiscount, `choosing.snapshot()`), added after the Verdict's three options. | structure | minor. The section is good, but after `:252` (PriceView) and `:235` (ReadPrice) the reader already has three competing shapes. The Verdict names only "a call" and "stable values". Name the final choice in the Verdict ("PriceView for the panel, snapshot() for the receipt, one owner for applying") so the choice is visible.
- `04-immutability.md:52-53` / `:57` | `applyPromotion`'s guards and `RangeError` are fine; `amount > price.subtotal` is checked before the writes. | technical | keep.
- `04-immutability.md:121-127` | Dafna's try/catch: "Still accepted by the compiler." then `error instanceof TypeError` is `true`. | technical | keep. Correct in strict mode, and Eden's `:129` gives the reason. Good.
- `04-immutability.md:265-266` | Daniel: "`view()` no longer returns a `Quote`. It returns a `PriceView`... Neither live reader can be passed to this receipt." | clarity | keep.
- `04-immutability.md:270-273` | Guy's "`prices.current()`" vs Dafna's "`readPrice()` tells me enough." | voice | keep. Good small disagreement with a real trade-off (interface name vs function).
- `04-immutability.md:191-197` | Dafna's "I'd be wary of passing that around as a Quote" and Guy's "For a current-price panel, that is the contract." | debate | keep.

Debate notes (ch17):
- The receipt bug (`Was 80. Now 80.`) is a strong, specific opener and the Turn (`:199-214`: `view()` gives a Quote that reads the live price, and the saved receipt changes with it) is a real turn: the chapter moves from "freeze the price" to "a live view is not a value". Earned.
- Dafna and Guy have the best disagreement in the book's Part 03 so far: Dafna wants functions that return values; Guy wants a named live dependency. Neither wins outright; the Verdict gives each its place.
- Eden's `readonly` remark (`:72`: "Putting `readonly` on this type was the change we thought we had already made.") is the right amount of irony.

Chapter 17 grade: A-. Enjoyed: the opener ("It was a hundred. The discount worked. The receipt forgot."); the `view()`-is-live Turn; Gil's index; Daniel's DeepReadonly-Date caution. Got bored: `:289-340` (promotion chooser) is a fourth design the Verdict does not need.

Running settings from ch17: `Quote` (`subtotal`, `discount`, `total`); `Cart` (`items`, `book` qty 1); `applyPromotion` (promotion package), `withDiscount`, `quote`; `CartPricing`, `PriceView`, `ReadPrice`, `valueCheckout`, `chooseDiscount`; receipt "Was 100. Now 80."; summary panel; Gil's 1,000-row price index.
### Chapter 18 (03-patterns-and-design/05-pure-functions.md)

Principle (Eli, `:5`): "Before reusing an earlier answer, ask two questions: what could change the answer without changing those inputs, and what required work would disappear if the call didn't run?" Testable and sharp. The second paragraph (`:7`) is long and reads as a manual ("Make anything that can change the answer an explicit input..."), but the rule is there. Strong Principle.

Checked by hand: the dates (2026-11-09 is a Monday; 07:00Z is 09:00 Jerusalem; the deadline at 11:00Z / 13:00 Jerusalem), the replay instants (`:66-68`) and its output (`:76-78`), the `Date.UTC` values in the Turn, the TZ table (`:275-277`: UTC 13:00Z, Jerusalem 11:00Z, New York 18:00Z, all consistent with the walk), the 20,000 × 3 walk counts and the TTL arithmetic (`:216-223`). All consistent. Oded's "We tie there" (`:223`) is right.

- `18-pure-functions.md:287` | Eden: "But I don't want every replacement image to inherit this rule from the machine it's built on." | clarity | minor. "replacement image" is not a term anyone uses; presumably "every host image" or "every deployed image". Say which.
- `18-pure-functions.md:317` | Eden's continuation paragraph ("And I'll copy the policy...") is in quotes with no speaker tag, after a paragraph of narration. | formatting / clarity | minor. Attribute it; it reads as an unnamed speaker.
- `18-pure-functions.md:379` | `---` horizontal rule, then Oded's "Your memoizer writes to a Map. Are we allowing that?" in the Additional Takes. | structure | minor. Same as ch9 and ch15: a rule with no heading reads as a new section. Use a sub-heading or move it.
- `18-pure-functions.md:225` | Dafna: "`deadlineFor` doesn't read the clock. It's a pure calculation we already had." | story | keep. This is the planted false premise, and the Turn (`:229-265`) catches it. Good setup.
- `18-pure-functions.md:263-265` | Chen: "When `getHours()` says nine, whose nine?" / Dafna: "The host's. I checked it for clock reads. I didn't check what those methods read." | voice | keep. Strong, and Dafna's honesty is in character.
- `18-pure-functions.md:279` | Eden: "The digest was already wrong. We just never tested that host's setting. Our cache change didn't cause it." | voice | keep. Good; it stops the chapter from blaming the cache.
- `18-pure-functions.md:281` | Links and claim: "`getHours` and `getDay` use local time, which Node selects through `TZ`; `Intl.DateTimeFormat` can take an explicit zone instead." | technical | keep. Accurate.
- `18-pure-functions.md:297-308` | `deadlineFor(ticket, policy)` with `Intl.DateTimeFormat` `en-GB` `weekday: "short"` and `hourCycle: "h23"`. | technical | keep. The "Sat"/"Sun" checks match en-GB short names, and `hour` parses to 9-16. Not re-run; I believe it.
- `18-pure-functions.md:342` | "The next day, ticket P1-43 opens at 09:00 Jerusalem time..." | story | keep. The 10 Nov dates in `:351-354` are consistent (deadline 11:00Z, at-risk at 10:40Z).
- `18-pure-functions.md:344-359` | Gilad: "This just reads the old one." | voice | keep. Closes his question from `:45` ("Where are this one's records?"). Good callback.
- `18-pure-functions.md:363` | "Gilad has checked with the lead: status as of the last thirty-second refresh is acceptable; an extra cache delay is not." | story | keep. Resolves `:137` ("Did the lead agree to the extra minute?"). Good.
- `18-pure-functions.md:371` | Eden: "Nothing in `(ticket, now?) => SlaStatus` prevents the next person memoizing it again." | voice | keep. Honest, and it is the Verdict's real limit.
- `18-pure-functions.md:383` | Dafna: "Caching the function that called `recordRisk` did." | voice | keep. Precise; the right answer to Oded's question.

Debate notes (ch18):
- Stakes are concrete (a lead with an overdue ticket showing green; the at-risk record that never existed). Gilad's question "Where are this one's records?" (`:45`) is the right question for the chapter.
- The debate covers four real options (no cache, TTL, boundary expiry, deadline cache) with numbers; Oded's and Dafna's trade-offs are honest.
- The Turn is a real turn: a false premise ("deadlineFor is pure") collapses the decision and reopens the design. Chen's question is the best single line in the chapter. Earned.
- The chapter has two overlapping threads (Eden's `makeSla` factory with the deadline cache, and Chen's TZ fix). They are sequenced well.
- Verdict (`:361-371`): gives a rule (cold-refresh check before rollout; keep `evaluate` free of recording). Good.

Chapter 18 grade: A. Enjoyed: "Show me where it asks the clock."; Chen's "whose nine?"; the TZ table; Gilad's record-reading close. Got bored: `:214-225` (the four-version table and walk counts) is a long technical digression, though it sets up the Turn.

Running settings from ch18: `Ticket { id, revision, openedAt, businessMinutes }`, `P1-42` (Mon 9 Nov 2026, 4 business hours) and `P1-43` (Tue 10 Nov); support calendar (Mon–Fri 09:00–17:00 Jerusalem); `slaStatus`, `assess`, `evaluate`, `deadlineFor`, `memoizeBy`, `withTtl`, `makeSla`, `supportPolicy`; `recordRisk`; digest host on UTC.
### Chapter 19 (03-patterns-and-design/06-imperative-vs-declarative.md)

Principle (Sahar, `:5-7`): "Before replacing a loop, ask what carries from one item to the next, where processing stops, and what must happen in order... If the rewrite hides the stopping point behind a flag you have to chase, keep the loop." Testable, specific, and the rest of the chapter is built on it. Strong. Its second paragraph is a list of three hazards; fine.

Verified with TS 7.0.2 (verify/haiku-story/ch19): the inferred predicate on `isReady` lets `eligible` drop its return annotation (`:82`); the `row.refund` TS18048 at `:367` matches; the `map`-then-`filter` and `flatMap` alternatives compile (`:373-388`).

Replay arithmetic checked by hand: 5^4 × 5^3 = 78,125 (`:254`) is right; the Stop/Fill/Reserve table (`:317-327`) is consistent with the day-by-day balance model (Fill: P2 paid day 8; Stop: P2 day 2; Fill-then-reserve after 2 days: P2 day 4), and Gil's "P2 waits two more days... S1 and S2 each get paid two days sooner. Nobody else changes day" (`:329`) matches the table exactly. "Thirteen payout-days across seven payouts" (`:280`) is correct if S1–S7 are counted (2×6 + 1). Very careful work.

- `06-imperative-vs-declarative.md:15` | Gil opens the reply sent to the seller: *“Eligible payouts are released in queue order...”* | formatting | minor. The curly quotes are the only ones in the book; elsewhere the book uses straight quotes. Match the house style.
- `06-imperative-vs-declarative.md:230` | "Dafna replaces the deployed `skipping` body with the loop after the filters, under `planPayouts`. The patch will ship before today's batch." | story | minor. Then the Verdict (`:339`) renames it `stopAtFirstBlocker`, and `:356` restores `skipping` as `fillAvailable`. The reader needs one sentence to see that `planPayouts` was an intermediate name. Sahar's `:339` "I called it `planPayouts` too soon" does that; fine, but the code block at `:341-344` never shows `planPayouts`. Keep or cut the name.
- `06-imperative-vs-declarative.md:250` | Gil: "In this queue." / Dafna: "Try arrivals too. They join at the back." | voice | keep. Good.
- `06-imperative-vs-declarative.md:260-266` | Liron's argument that skip never pays later with fixed amounts and daily reset. | technical / voice | keep. It is a real argument, in Liron's measured voice, and Gil's `:266` restatement is right.
- `06-imperative-vs-declarative.md:273-274` | "Under that proposal, payouts can need more than one day's deposit." | clarity | minor. Good, but "a payout for 450 joins each day from day 2 through day 8: S2 through S8" is one dense sentence. Put the arrivals in a small table or list.
- `06-imperative-vs-declarative.md:282` | Dafna: "Then I don't want to call stopping the safe answer and hide those thirteen days." | voice | keep. Good.
- `06-imperative-vs-declarative.md:335` | Gil: "Two is a test value, not something to leave in the code because it made this table look good." | voice | keep. Strong.
- `06-imperative-vs-declarative.md:348` | Gil: "P2's date wasn't delayed yesterday. We still broke the queue-order promise we gave its seller." | story | keep. The best sentence in the Verdict: it names the real harm.
- `06-imperative-vs-declarative.md:356` | Dafna: "That body was wrong as a replacement for stopping. It does implement filling." | voice | keep. Good.
- `06-imperative-vs-declarative.md:208` | Dafna: "I just shipped a bug by following the total and missing what the callback would do next." | story | keep. Honest, good.
- `06-imperative-vs-declarative.md:360-391` (Additional Takes) | Chen's `filter` narrowing question; Dafna's `.map(row => row.refund)` alternative; Sahar's last line ("Nothing a refund does changes whether the next row goes into the report."). | technical / voice | keep. Accurate and the closer is good.
- `06-imperative-vs-declarative.md:391` | Sahar's closer is good; no change.

Debate notes (ch19):
- The chapter is the best-argued "refactor went wrong" story in the book. Dafna's "I wanted to test the eligibility rules" is a real motive; the bug (a stop turned into a skip) is specific; Chen's `P2 doesn't fit in either. Why do the next two go out in yours?` (`:117`) is the question that finds it.
- The Turn (`:232-335`) is a genuine turn: the chapter first proves skip never pays later (a real defence of the refactor), then the finance proposal shows skip can starve a large payout under accumulation, and then the reserve rule answers it with numbers. Earned. It also demonstrates the Principle: "where processing stops" matters, but the chapter moves stopping from a "bug" to a "policy".
- Verdict (`:339-356`): naming two different rules (`stopAtFirstBlocker`, `fillAvailable`) is the right outcome and gives a reader something to apply.

Chapter 19 grade: A. Enjoyed: the 78,125 replay; Gil's "We still broke the queue-order promise"; Chen's "Why do the next two go out in yours?"; Liron's skip argument. Got bored: the finance-proposal arithmetic (`:274-284`) runs long; a table there would have been faster than prose.

Running settings from ch19: `Payout`, `Ready`, `Held`, `Plan`; allowance 1,000 per batch; minimum 100; USD only; queue P1 400, P2 900, P3 200, P4 300; `skipping` / `original` / `folded` / `looped` / `split` / `planPayouts` (renamed) / `stopAtFirstBlocker` / `fillAvailable` / `fillThenReserve`; the reply to the seller; finance proposal (500 deposit per day; S1, S2–S8, P2).
### Chapter 20 (03-patterns-and-design/07-currying-partial-application.md)

Principle (Daniel, `:5-7`): rule-like and testable ("Check what each call does, whether it can throw, and which type arguments it fixes.") but written as documentation: "Partial application supplies some arguments now and leaves a function for the rest. Currying turns a function taking several arguments into successive calls taking one argument each." Daniel does not speak this way in any other chapter. The closer "Splitting the parentheses doesn't make those decisions for you." is an aphorism. AI-feel, major for the Principle. Fix: have Daniel say the first two sentences as he would at a whiteboard ("Partial application is just leaving some arguments for later."), and keep the checklist.

Verified with TS 7.0.2 (verify/haiku-story/ch20): `lines.map(lineTotal)` gives TS2345 with the weak-type message (`:67`); `pairWith({ a: 1 })({ b: 2 })` gives TS2353 (`:356`); `pairWith<Either>` (`:365`) is accepted. The runtime outputs (`100,99,98` at `:39`, `270`, `90,90,90`, `520`, `100,180,240`, `100,99,98` at `:273`) are right by hand.

- `07-currying-partial-application.md:276` | Linoy: "I removed the arrow at the package call and left the same shortcut inside both renderers. I'll make them pass only the line." | clarity / technical | major. The code at `:281-287` adds the arrow inside both renderers; nothing was removed from the package call. The sentence says the reverse of what the code shows. Fix: "I'll put the arrow inside both renderers, so they pass only the line."
- `07-currying-partial-application.md:250` | Unattributed quoted paragraph after Dima's line ("Caching by promotion inside `lineTotal` would hide state there...") | formatting / clarity | minor. Same pattern as ch16 and ch17. Attribute it.
- `07-currying-partial-application.md:260` | Noam, pointing to `priceWith`: "An extra required argument would fail against `PriceLine` at this return. An optional one wouldn't." | technical | keep. Correct (verified in spirit: a function with an extra required parameter is not assignable to a one-parameter function type).
- `07-currying-partial-application.md:264-274` | Noam's `priceWithExtra` counter-example: `map` passes the index into the optional `extraPercent`, so `100,99,98`. | technical / story | keep. Good; it is the chapter's best demonstration, and it ties back to `:39`.
- `07-currying-partial-application.md:296-300` | Gil: "I added an empty list to the regression test, with an invalid promotion. The adapter returned zero. The factory threw." | story | keep. Good stake; it makes the Turn concrete.
- `07-currying-partial-application.md:317-333` | Linoy's proposal to prepare on first call, Dima's "creating the function would no longer tell you the promotion passed validation", and Linoy's "I was treating it as a shorter way to write the arrow." | voice | keep. Linoy's closing line admits the mistake in her own voice; good.
- `07-currying-partial-application.md:343` | Dima: "And this isn't a request for two exports for every calculation in the package." | verdict | keep. Good; it limits the rule.
- `07-currying-partial-application.md:345` | Heading "Additional Take" (singular) while every other chapter uses "Additional Takes". | consistency | minor. Fix the heading.
- `07-currying-partial-application.md:369` | Daniel: "Yes. Decide it there. The later call won't go back and widen it for you." | voice | keep.
- `07-currying-partial-application.md:17-18` | "Checkout passes a line and its discount together. Reporting calls the same function to price the lines on a statement; omitting the discount means full price." | story | keep. Clear setup for the index bug.

Debate notes (ch20):
- The index bug (`lines.map(lineTotal)` passing index as the percent) is a real, plausible bug and the chapter earns the stakes.
- Dima and Linoy disagree about the shape of the API in a way that changes code (`discountedBy` vs `priceWith`). Dima's "Why should its callers make a function just to call it immediately?" is a good objection.
- The preparation/caching debate (`:128-292`) is the strongest part: Gil's "Six calls into prepare" counts make a cost visible, and Noam's opaque `PreparedPromotion` is a real design option. Earned.
- The Turn (`:294-333`) is a real turn: the factory is shown to move validation from setup to first use, which Gil's empty-list test exposes. It shifts the Verdict to "validate at setup". Earned.
- The Additional Take (`:345-369`) is accurate, but it sits after a Verdict that already closed the chapter, and it is a different lesson (type inference with currying). It reads like an appendix. Keep it, but it is the weakest part of the chapter.

Chapter 20 grade: A-. Enjoyed: Gil's "Three identical lines" opener and "The zero wasn't my default."; Noam's index counter-example; Gil's "Two separate batches of three prepare twice."; Linoy's closing admission. Got bored: `:243-257` (the cost table and batch argument) is long for what it says.

Running settings from ch20: `Line { unitPrice, quantity }`; `lineTotal`; `Discount { percent? }`; `Promotion { tiers }`, `Tier { minimum, percent }`, `prepare`, `evaluate`, `priceWith`, `priceWithExtra`; `orderLines` (quantities 1, 2, 3, price 100); the reporting layout (`statement`, `preview`); checkout (Dima's package).
### Chapter 21 (03-patterns-and-design/08-hof-patterns.md)

Principle (Gilad, `:5-7`): the strongest Principle in Part 03 after ch14 and ch18. It states a rule, an exception, and a consequence: "Without that guarantee, don't retry a failure where the work may already have happened, like a timeout or a lost reply. Report the outcome as unknown." Gilad's "Retry it anyway and you can have a failed job and a customer with three messages" is the chapter's hook. The second paragraph (`:7`) is a long list of hazards; the Turn later proves each one. Keep.

Verified with TS 7.0.2 (verify/haiku-story/ch21): `withTimeout(send, 2000)` is TS2345 (`:188`); `client.send` passed detached compiles (`:213`); `forward(lookupReceipt)` accepts the array form and rejects the single string with TS2345 (`:364-365`); `forward(identity)` gives `forwarded(3): number` and `forwarded("accepted"): string` (`:369-370`), via higher-order inference. All correct. The runtime claims (the 0/2/4/6/7 s trace, the "Zero deliveries" with aborts, the "Cannot read properties of undefined (reading 'connection')") are consistent with the code; I did not run them.

- `08-hof-patterns.md:47` | Oded's continuation, "The job allows three attempts and two seconds for each reply...", is an unattributed quote after his line. | formatting | minor. Attribute it.
- `08-hof-patterns.md:125` | Guy: "We have `sendOnce` to prevent duplicate messages." | clarity | minor. `sendOnce` is named here and not introduced until `:284`, then Oded asks at `:252` "do we still need `sendOnce`?" Introduce it with a one-line description at `:125` ("the client's keyed send") so the reader knows what it is.
- `08-hof-patterns.md:139-142` | Eli: "`Send` describes the argument and the receipt. It doesn't say how many times you contact the gateway." | voice | keep. Strong; Eli's Principle-level point, delivered in the Debate.
- `08-hof-patterns.md:244` | Gilad: "Starts at zero, two and four seconds. Three different signals. All three abort. Zero deliveries. The job still records failed at six seconds." | story | keep. The numbers are consistent with the composition and the trace.
- `08-hof-patterns.md:260` | Guy: "That's the case I need before we call this repaired. Stop waiting at two. Leave the accepted message alone." | voice | keep. Good.
- `08-hof-patterns.md:272` | Idan: "Then the wrapper did what we asked. We asked it to cancel the request, and treated that as permission to repeat the message." | voice | keep. Accurate and sharp.
- `08-hof-patterns.md:278` | Oded: "If we can't safely repeat it, I'd rather have one uncertain send than three definite ones." | voice | keep. Oded's best line in the chapter.
- `08-hof-patterns.md:319` | Guy: "Even if the last error is a failure to connect, that only clears the last attempt. The wrapper rethrows that error. An earlier attempt may have got through." | technical / voice | keep. Important, correct; it is the reason "unconfirmed" must mean the whole job.
- `08-hof-patterns.md:337` | Oded: "I'll put that in a comment next to `sendShipped`, so the next person knows where these jobs go." | voice | keep. Good; it matches the Verdict's concern about the next person.
- `08-hof-patterns.md:343` | Guy: "Don't copy this composition and assume the new client has the same contract." | verdict | keep. The right caution, and the Verdict's rule.
- `08-hof-patterns.md:341` | Verdict: "The shipment job keeps `sendShipped`: three attempts, a fresh two-second timeout for each, around `sendOnce`, called through its instance..." | verdict | keep. A concrete, applicable ruling.
- `08-hof-patterns.md:351` | Eli's additional take: "This small forwarding wrapper keeps a generic function generic. It doesn't keep every overload." | voice | keep. Clean, and verified.

Debate notes (ch21):
- The composition-order argument (`withRetry(withTimeout(...))` vs `withTimeout(withRetry(...))`) is the best technical debate in Part 03: each order gets a concrete timeline (`:103-134`), and the wrong one is shown to be wrong by Guy's "the two seconds covers the whole retry operation".
- The detached-method trap (`:210-216`) is a real footgun, shown with its runtime error. Earned.
- The Turn (`:254-282`) is a genuine turn: the cancellation fix makes the duplicate-message problem worse, because cancellation does not un-send. The fix moves from "stop the request" to "make the operation repeat-safe". Earned and clearly built.
- Oded's and Guy's disagreement about `shouldRetry` (`:290-301`) lands well.

Chapter 21 grade: A. Enjoyed: the three-receipts opener; the timeline table; "I'd rather have one uncertain send than three definite ones."; the early-acceptance test; Idan's "treated that as permission to repeat the message." Got bored: `:144-252` (the signal and sender variants) is long; the `Sender` class and the RetryingSender detour (`:218-238`) could be cut without losing the argument.

Running settings from ch21: `Notice { id: "shipped-42", to, text }`; `Receipt { messageId }`; `Send`, `SendAttempt`, `Sender`; `withRetry`, `withTimeout`, `Timeout`; `GatewayClient` (`connection`, `send`); `keyedClient` (`sendOnce`, `shouldRetry`); `runJob` (accepted / failed / unconfirmed); `lookupReceipt`; `forward`.
### Chapter 22 (03-patterns-and-design/09-config-to-function.md)

Principle (Liron, `:5-7`): long, with a real procedure (find the callers; store the decision's inputs and the name of the code that made it; round-trip test) and a three-way question about the next change. A working developer can state it after one read: "store the evaluator's name and inputs and test that the replay decides the same way." Strong. Two sentences are aphoristic and should go: "Editing a type won't do that job." (`:7`) and "Lisp let me treat code as data." (in character, keep).

Verified with TS 7.0.2 (verify/haiku-story/ch22): `const savedPolicy: Json = active` gives TS2322 with the message about `extraHold` (`:83`) as described; `auditRecord ... as const satisfies Json` and the replay call compile (`:107-112`). The Turn's eight-sample arithmetic is right: 5 holds (`:270`), and the tooBroad flattening gives exactly 2 mismatches (`:288`), at samples 0 and 3, which match Gil's description (`:291`). Eden's "Three of Gil's eight samples" (`:317`) is also right: the country-and-velocity rule misses samples 4, 6 and 7.

- `22-config-to-function.md:133` | Eden: "We started with total and country templates. On the third, I added refunds to the total one." | clarity | minor. "On the third" is also the day of the held order (`:13`, `:21`). Readers will take it as a date. Fix: "The third change added refunds to the total one."
- `22-config-to-function.md:159` vs `:249` | `type Rule = { version: 1; ... }` (`:159`, the unshipped tree) and Eden's "Those are format 1, when the window was fixed at seven days" (`:249`, the old templates). | inconsistency | minor. Two different things both called "version 1" / "format 1". The old templates (format 1) are never shown, and the tree's `version: 1` looks like the same format. Fix: name the old templates' format explicitly ("the pre-window template format") or rename the tree's version.
- `22-config-to-function.md:92` | "He records the parameters and input under `"release-a81f"`, using `as const` to keep that name as a literal key for the lookup:" | technical / clarity | minor. The `as const` is on `auditRecord`, not on the evaluator table; the table keys are literal already. The sentence should say the `as const` keeps `evaluator` a literal so `evaluators[auditRecord.evaluator]` type-checks.
- `22-config-to-function.md:7` | "Editing a type won't do that job." | AI-feel | minor. Aphoristic closer after a sound procedure. Cut.
- `22-config-to-function.md:319` | Dafna: "And you counted tickets, not everything they wanted. If asking means waiting for us to write code, they may stop asking." | voice | keep. Good; Gil's reply at `:321` ("I can't count requests they didn't file.") is the honest answer.
- `22-config-to-function.md:321` | Gil: "I can't count requests they didn't file. Two doesn't tell us there were only two they wanted." | voice | keep. Gil's bio: data has limits. Good.
- `22-config-to-function.md:352` | Gil: "I counted requests. I didn't calculate when you should build an editor." | voice | keep. Good closer for the data thread.
- `22-config-to-function.md:358` | Dafna: "Three refunds within seven days. The old log didn't say that. The retained release does, and the repaired record will say which release to ask." | story | keep. Closes the opening question; the stakes are resolved in one line.

Debate notes (ch22):
- The opener is the best hook in Part 03: an audit claim ("the logger saved the policy") that a JSON round-trip disproves ("It gave the policy an alibi."). Chen's "Which policy was running on the third?" is the right question and it is answered.
- The Turn (`:251-333`) is a real turn, and the data settles it: Gil's table (6 parameter changes, 2 regroupings, 1 new condition) makes the template decision rather than the taste argument. Earned.
- Dafna's tree argument ("With the tree, an analyst can write another grouping") and Eden's templates argument are both real, and the Verdict's compromise (templates now, editor at the third regrouping request) follows from the table. Good.
- Liron's `:299` ("You've checked the decision. You still have to choose who can write the next one.") is the right point at the right time.

Chapter 22 grade: A-. Enjoyed: "It gave the policy an alibi."; Chen's "Which policy was running on the third?"; Gil's eight samples and the two-mismatch replay; Gil's "I counted requests..."; Eden's "Three of Gil's eight samples." Got bored: `:127-141` (the regrouping request) restates the same point twice before the tree.

Running settings from ch22: `Order { id: "o42", total: 120, country: "FR", refundDaysAgo: [1, 2, 7] }`; `LivePolicy` / `active` (reviewAbove 500; three refunds in seven days); `release-a81f`; `reviewRefunds`, `matches`, `evaluate`, `evaluateTemplate`; `Template` version 2 with `large-or-country-velocity`; "review-hold"; the eight Gil samples; the three-month request table (6 / 2 / 1).
### Chapter 23 (03-patterns-and-design/10-monads-light.md)

Principle (Eli, `:5-7`): clear and testable. "If it returns a plain value, use `map`... If it returns another Result, you need the operation arrays call `flatMap`." and the promise rule: "Don't give an object a `then` method unless it keeps the promise contract. Give a different chaining operation a different name." The second rule is what the Turn proves, and it is the best practical sentence in Part 03 for a working developer. Keep. The first paragraph is long; split it.

Verified with TS 7.0.2 (verify/haiku-story/ch23): the Turn's claim that `await loadPreview("7")` gives `Preview` and that `result.result` fails with TS2339 at `:164` is exactly right, and Eli's `Awaited` explanation (`:169`) is correct. `Promise.resolve(preview("7"))` is typed `Promise<Preview>` (`:248-249`), `andThen` (`:288`), `plainPreview`, and `pendingInside` (`:367-368`) all compile. Runtime outputs (`:95-98`, `:108-111`, `:135-138`, `:227-233`, `:337-346`) match by reasoning: `counts` ends at `started:2, closed:2, failed:0` because the third call is made without `runJob`.

- `23-monads-light.md:5` | Eli's first paragraph (`:5`) carries four claims (map vs flatMap, nested Results, arrays, early-return) in one block. | clarity | minor. Split it into two paragraphs; the second (the early-return comparison) is the part a reader will miss.
- `23-monads-light.md:278` | "He writes the plain-union version of the operation they have been tracing." | AI-feel | minor. "the operation they have been tracing" is a summarising phrase. Say "He writes the plain-union version of `then`."
- `23-monads-light.md:143` | Dafna: "That's a monad." followed by the three-container recap. | voice / clarity | minor. The recap is correct and useful, but "a way to wrap a value and a way to chain a step returning the same kind of container" is a definition inside a debate. Keep; consider a shorter line before the list.
- `23-monads-light.md:216` | "There is no rejected job to count. `goodJob` has closed; `refusedJob` remains pending. Its `finally` is still waiting too." | clarity | keep. The one-line consequence (the job never fails and never closes) is the reader's takeaway.
- `23-monads-light.md:300` | Linoy: "Six expressions to rewrite, including the ones that carry the quantity into the final `map`." | clarity | keep. Concrete.
- `23-monads-light.md:308` | Sahar: "Then leave the other code out of it. Two early returns don't need a new API." | voice | keep. Good Sahar.
- `23-monads-light.md:354` | Linoy: "I picked `then` so people could start chaining without learning another word. It bought six callers that knew how to read the expression. It also bought JavaScript a way to call it." | voice | keep. Strong and honest; the best Linoy line in Part 03.
- `23-monads-light.md:356` | Sahar: "Show what the `map` callback returns and what the `andThen` callback returns. That's most of the explanation." | voice | keep. Good closer.
- `23-monads-light.md:373` | The ECMAScript spec links ("resolving functions", "thenable job") | technical | keep. Plausibly correct anchors; not checked.

Debate notes (ch23):
- The opening ("Two previews started. One closed.") and the counter-based completion test set the stakes in three lines.
- The Turn (`:147-216`) is a genuine turn: the worker never fails and never closes a job for `7` because `Res` is a thenable with an incompatible `then`. Earned, and Eli's and Dafna's explanations are precise.
- The debate on the fix (unwrap at entry, real thenable, union, rename) is honest about each option's cost. Guy's counter ("Resolve the preview... That's a worker failure") is a real objection with numbers.
- The Verdict (rename to `andThen`) is the right answer and is argued from the six callers, not from taste.

Chapter 23 grade: A-. Enjoyed: the opener; "I'd like you to tell the worker."; "And I taught it to say nothing on no."; Eli's `Awaited` explanation; Linoy's closer. Got bored: `:296-332` (the six-callers and alias debate) runs longer than its decision needs, and `:309-326` (plainPreview) repeats Eli's early-return point.

Running settings from ch23: `Result`, `ok`, `parseQty` (`BadQty`), `availability` (stock 5, `NoStock`), `Res` class (`map`, `then` → `andThen`), `preview`, `loadPreview`, `loadUnwrapped`, `runJob` with `counts`, `goodJob` (qty 2) and `refusedJob` (qty 7); the catalogue team's worker; six screen callers.
## Part 04: The real world

### Chapter 24 (04-the-real-world/01-migration-strategies.md)

Principle (Daniel, `:5-7`): correct and useful ("Keep their contract... or change and verify the callers too."; "a caller counts as checked only when this compile includes it and checks it."). But it reads as documentation: "The compiler will happily emit a file without checking the calls inside it. `allowJs` lets JavaScript into the program. Only `checkJs` or `@ts-check` makes the compiler report that file's errors." Daniel does not speak this way anywhere else in the book. The rule is buried in the middle. Major AI-feel for a Principle. Fix: give Daniel the one-line rule ("A caller is only checked if this compile includes it and checks it."), and move the flag explanations to the debate, where Noam asks for them.

Story: strong. A 500 on product pages, a converted leaf that the route cannot call, Oded's "I picked the boring one." The Turn (`:236-276`) is the best of this chapter: Chen's "Would this setup have caught Oded's original PR?" and the `.default` repair that breaks the sitemap and the `require` test. It is a real turn, and "I updated the test's call and left the real caller behind." is the right lesson. Earned.

Verified only by reading against the emit described (`exports.default`, `export =`). Not run.

- `24-migration-strategies.md:185` | Eden: "`@ts-check` at the top of the route would check that file under the current strict settings. It would leave the other files alone." | inconsistency / technical | **major**. At `:140` `checkJs` was turned on for the whole project, so `route.js` is already checked and `@ts-check` adds nothing. And "leave the other files alone" is false under a global `checkJs`. The argument then runs straight into Noam's fix at `:187` (global `checkJs`, `@ts-nocheck` for exceptions), which is the one that works. Fix: make Eden's line the per-file alternative to the global switch ("Without the global switch, `@ts-check` at the top of the route would...") or drop it.
- `24-migration-strategies.md:132` | Noam: "We repaired the loading call. Why didn't the compiler tell us about the broken one?" | clarity | minor. Nothing about the loading call changed; the export was restored (`:116-124`). Say "We repaired the export."
- `24-migration-strategies.md:7` | "TypeScript 7 is strict by default, so the first JavaScript check can report untyped parameters. If that's too much at once, check fewer files. Switching `noImplicitAny` off for the whole program weakens the TypeScript too." | AI-feel | minor. The last sentence is a caveat that Noam says aloud at `:183`. Cut it from the Principle.
- `24-migration-strategies.md:126` | "The emit ends with `module.exports = slug`." | technical | keep. Correct for `export =` under CommonJS.
- `24-migration-strategies.md:175` | Noam: "Five implicit-any parameters: title, id, a, b and cents." | technical | keep. Count is right (route, lookup, sum x2, money).
- `24-migration-strategies.md:199` | "Each gets `// @ts-nocheck`." and "Oded adds `/** @param {number} cents */`..." | technical | keep. Consistent with `:187`.
- `24-migration-strategies.md:226` | `TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.` | technical | keep. Matches the TS message format.
- `24-migration-strategies.md:258-264` | Chen: "Now suppose you fixed the route by reading `.default`, as Eden suggested." / Oded: "I updated the test's call and left the real caller behind." | voice / story | keep. The best sentence in the chapter.
- `24-migration-strategies.md:276` | Noam: "And no adding an opt-out to a checked caller because the conversion broke it. That would turn the exception list into a way to merge failures." | voice | keep. Strong.
- `24-migration-strategies.md:316` | Noam: "Don't turn this into a rule about every object someone could export." | voice | keep. Good; it keeps the verdict local.
- `24-migration-strategies.md:324` | Oded: "And the old test stays old on purpose." | voice | keep. Good closer.

Debate notes (ch24):
- The "two tests were green" premise is a useful lesson: the tests were both right and both wrong (the test checks a call the route never makes). Noam's "The new test correctly checks a call nobody in that route makes." (`:106`) states it.
- The exception list (`:197-203`) and the `checkJs` discussion (`:187-195`) give the book's clearest policy on partial migration. Earned.
- Cast check: Chen (he) opens the backfill script (`:280`), Noam (he) and Eden (he) run the checks; no pronoun errors.

Chapter 24 grade: B+. Enjoyed: the 500s opener; Oded's "I converted the test out of catching the conversion."; the `.default` Turn; Noam's exception-list line. Got bored: the flag discussion (`:140-203`) is long, and its JSON/tsconfig blocks interrupt the scene; a table of "what each flag does" would be shorter.

Running settings from ch24: storefront build (`dist`, `src/`, `tests/`); `slug`, `route` (`handle`), `sitemap`, `lookup`, `sum`, `money` (`price`), `price-label`, `backfill`; catalogue team (footer callback); tsconfig (`allowJs`, `checkJs: false` then true, `module: Node16`).
### Chapter 25 (04-the-real-world/02-monorepo-type-sharing.md)

Principle (Gilad, `:5-7`): three questions ("Which declarations is this caller being checked against? Which implementation will its import load when you run it? What rebuilds that implementation when the source changes?") are testable and the best Gilad line in the book. The second paragraph is long and mixes three rules. Tighten to the three questions plus "build what you ship, laid out as it installs".

Story: strong. Idan's 1000 + 500 = "fifteen dollars" stake, then Gil's "two emitted implementations, only one loaded" is a real debugging path, not an invented one. The Turn (`:298-334`, the node_modules type-stripping refusal) is a genuine turn that overturns Linoy's "source at runtime" plan and forces the copied-program test. Earned.

Not verified with tsc (the `#cents` diagnostic at `:115-117` is quoted from a multi-package layout I did not rebuild; treat as unverified). Note: TS normally reports a private-field clash as a different diagnostic from TS2741; check before print.

- `02-monorepo-type-sharing.md:115-117` | TS2741 quoted for the `#cents` clash. | technical | minor, unverified. Verify the exact code and wording in the real layout.
- `02-monorepo-type-sharing.md:137` | `TypeError: Cannot read private member #cents from an object whose class did not declare it` | technical | keep. Matches the V8 message for a private field read on a foreign instance.
- `02-monorepo-type-sharing.md:143` vs `:332` | Gil: "two emitted implementations, only one loaded" (`:143`) and "One loaded until the parser arrived, then two. This image ships one." (`:332`). | consistency | minor. Both say one loaded before the parser; say which one (cart loads the package name; the parser loads the out copy).
- `02-monorepo-type-sharing.md:220` | TS2554 "Expected 1 arguments, but got 0." | technical | keep. Correct TS wording.
- `02-monorepo-type-sharing.md:286-290` | `allowImportingTsExtensions` placed in a noEmit dev base, with `.ts` imports in the runtime experiment. | technical | keep. Consistent with the stated restriction.
- `02-monorepo-type-sharing.md:314` | Gil: "Node documents that restriction: it won't strip types in dependencies under node_modules." | technical | keep. Consistent with the quoted error code `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` at `:308`.
- `02-monorepo-type-sharing.md:124`, `:145`, `:209`, `:306` | Pronouns: Gil (he), Dima (he), Idan (she, `:128`), Linoy (she). | cast | keep. All consistent with the bios.
- `02-monorepo-type-sharing.md:342` | Verdict: Idan's "The parser export goes in with the import fixes. Then I can send the quote." | verdict | minor. The Verdict is a task list, not a rule. The reusable rule ("the copied-program test is the check that matters; source checks use a custom condition and never ship") is only in the debate. State it in one sentence.
- `02-monorepo-type-sharing.md:233` | Dima: "Otherwise I'm promising you a build order I never described." | voice | keep.
- `02-monorepo-type-sharing.md:296` | Idan: "That is one build command I would happily forget." | voice | keep.

Debate notes (ch25): the "Which build did you check?" section (`:188-233`) is the strongest debugging sequence in Part 04: an edit that the check does not see, a stale declaration, a missing graph. Gil's "I wanted to know how much we'd broken" (`:170`) is a good principle in a person's mouth.

Chapter 25 grade: A-. Enjoyed: the fifteen-dollar opener; Gil's three-imports count; Linoy's laptop turned to Dima; the Node refusal Turn. Got bored: `:229-296` (exports conditions and tsconfig variants) is dense; the three JSON blocks could be one table.

Running settings from ch25: `@shop/money` (`Money`, `Line`, `parseMoney`), `@shop/cart` (`shipping`, `firstLine`), `apps/api`, `generated/release.ts` (`release-42`), the copied image layout, condition `@shop/source`, `tsconfig.dev-base.json`.

### Chapter 26 (04-the-real-world/03-testing-typed-code.md)

Principle (Sahar, `:5-7`): the strongest testing principle in the book. Testable and practical: "Change the code so the promise is false, then run CI's type check. See the test fail, undo the change, and see it pass." The `@ts-expect-error` rule ("must be valid apart from the violation you're testing") is exact. Paragraph 1 is long; fine.

Story: the best-paced debugging story in Part 04. The opening "It can't be green." / "And it passed." / "That's the problem." is the book's cleanest hook. The Turn (`:356-405`), where Noam's deliberately false assertion passes because the file is not in `include`, is a real turn and the lesson is exact: the runner and the compiler each have their own file list. Earned.

Verified with TS 7.0.2 (verify/haiku-story/ch26): the inline `ship({ id, status: "draft" })` gives TS2322 `Type '"draft"' is not assignable to type '"paid"'.` (`:104`), as quoted. Not run: the TS2344, TS2578 and TS2741 messages, which follow the same compiler's standard wording.

- `26-testing-typed-code.md:116` | Noam: "Done: neither Draft nor Paid has `currency`, the paid fixture has no currency field, and the inline draft is back as I wrote it." | clarity | minor. This describes the pre-March version (restored at `:114`). Put "Back at the March version:" before "Done:" so a reader does not think the current `Paid` lacks currency.
- `26-testing-typed-code.md:255` | Oded: "An ampersand left Guy's hover and Noam got red." | clarity | minor. Unclear: presumably the `&` form in `Equal` (`:217`) produced the red. Say "The intersection in Row made Noam's comparison red."
- `26-testing-typed-code.md:270` | Noam: "A function annotated `User[]` can return `JSON.parse(raw)` and pass an exact return-type test." | technical | keep. Correct, and it is the reason for Guy's runtime assertion at `:272`.
- `26-testing-typed-code.md:290` | Eden: "The comment objects to the call's type. It doesn't cancel the call." | voice | keep. The chapter's key sentence about `@ts-expect-error`.
- `26-testing-typed-code.md:308-310` | `node --test` picks up `test/ship.types.ts` and Eden says "The suffix isn't an instruction to leave it alone." | technical | keep. Matches the runner behaviour the chapter describes.
- `26-testing-typed-code.md:373-379` | `tsc --listFilesOnly` as the diagnostic that proves the file is not checked. | technical | keep. Good, practical.
- `26-testing-typed-code.md:409-415` | Eden's single-file-versus-glob check with a temporary failing card test. | technical | keep. Good use of "show me the reds first".
- `26-testing-typed-code.md:429` | Noam: "I was finished." | voice | minor. A joke that lands as an ending. If the story ends here, the Verdict has no rule. Consider making Oded's "Noted" the final line and Noam's reply the last word.
- `26-testing-typed-code.md:407-421` (Verdict) | the Verdict is a sequence of actions, not a rule. The rule ("the compiler's file list and the runner's glob are separate; test both") is only in Eden's line at `:375`. State it in the Verdict.

Debate notes (ch26): the `Equal` / `Expect` comparison debate (`:203-270`) is accurate and fair: Sahar's question ("Did you promise it would arrive attached to an intersection?", `:259`) is the right one, and Guy's answer is a real position.

Chapter 26 grade: A. Enjoyed: "It can't be green." / "That's the problem."; Eden's "We taught the runner to leave it alone. We haven't told the compiler where we put it."; the probe sequence; Oded's "I have rarely been congratulated for breaking a build this enthusiastically." Got bored: `:203-255` (the card and Equal section) runs long; the `Row`/`Status` changes repeat the same probe three times.

Running settings from ch26: `Draft`, `Paid`, `PreOrder`, `Order`; `ship`, `shipped` (in-memory recorder); `orderRow`, `paidCard`, `renderPaid`; `Equal`, `Expect` (`test-support/types.ts`); `type-tests/ship.types.ts`; `test/ship.test.ts`; `tsconfig.json` include.

### Chapter 27 (04-the-real-world/04-performance-vs-safety.md)

Principle (Daniel, `:5-7`): clear and testable: "measure the saving and say what newly compiles", "Counters aren't seconds", and "Someone has to own the mistake that now compiles." Paragraph 1 is a little long and documentary in places ("First say what you're speeding up: checking the program or running it."). The last line of the Principle is the chapter's thesis and it is stated early. Good.

Story: the best-argued performance chapter. The turn is a real correction of the team's own first reading: Linoy blames Args (`:271`), Gil shows the trace is not the cost (`:273`), the profile points at union building (`:277-281`), and the fix (distributed tuple) is measured, not guessed. Earned. Oded's title change at `:313` is the payoff of Noam's line "Don't put 'equivalent' in the title" (`:311`).

Not run with tsc (the 387-byte emit, instantiation counts, and timings are the authors' measurements in their own bench; I checked the arithmetic only: 200 distinct called keys from `i%40`, `i%50` (`:175`), and 0.255 / 1.481 < 1/5 (`:263`) are right).

- `27-performance-vs-safety.md:21` | `let value: any = messages;` in Oded's implementation | technical / voice | minor. The chapter argues about checking precision and nobody notices the `any` in the lookup or the `any` in `:25`. Either type it (`unknown` with narrowing) or have Noam say it. A reader of this book will notice.
- `27-performance-vs-safety.md:78` | "Both probe calls get TS2345. So does the banner's `t(pending[0], pending[1])`, which Oded expanded because `t(...pending)` gets TS2556 under his loose signature." | technical | minor, unverified. Plausible. Verify the exact codes in the fixture before print.
- `27-performance-vs-safety.md:102-103` | Gil: "Same 387 bytes." | technical | keep. Plausible for an emitted two-function module; the number is a measurement.
- `27-performance-vs-safety.md:221` | "Checking and emitting with `-p probe.json` succeeds. Running `node dist/probe.js` prints `Hello A, {count} items`." | technical | keep. Consistent with the lookup code's `?? token` fallback at `:28`.
- `27-performance-vs-safety.md:257` | "Distributed whole tuple | 118,628 | 0.255s" | consistency | keep. The distributed signature is the one at `:233-241`, and it is the one the Verdict adopts.
- `27-performance-vs-safety.md:263` | Gil: "the new check took less than a fifth of the old time." | technical | keep. 0.255 / 1.481 = 0.17.
- `27-performance-vs-safety.md:275` | `tsc ... --pprofDir profile` and `go tool pprof` | technical | keep, unverified. This is TS 7 native-compiler tooling; confirm the flag name against 7.0.2 before print.
- `27-performance-vs-safety.md:279` | Daniel: "That's 7.0.2's checker. Don't build on the name." | voice | keep. Good caution against overclaiming a function name.
- `27-performance-vs-safety.md:297` | Oded: "Count made it all the way to the customer this time." | voice | keep. Callback to Noam's opening.
- `27-performance-vs-safety.md:313` | Oded's new title: "Check translation calls faster without loosening their arguments." | voice | keep. Strong payoff.
- `27-performance-vs-safety.md:309` | Gil: "Keep the counters pinned to this compiler and configuration... These are measurements, not a service guarantee from the machine." | voice | keep. Honest.

Debate notes (ch27): the "It bought something" section (`:50-110`) is a fair argument about whether the public signature should carry the placeholder check at all; Oded's "I also remember when there were three messages" (`:74`) gives the case for Linoy's work. The turn and verdict answer both.

Chapter 27 grade: A. Enjoyed: the title argument; "Counters aren't seconds." (`:5`); Gil's "Stop moving the furniture." (`:177`); Linoy's "My guess was too narrow." (`:281`). Got bored: `:189-247` (the generic candidates and the probe-file dance) is long, and the four-row table at `:168-173` is repeated in prose.

Running settings from ch27: `messages` (shop.cart, shop.hello, shop.ready); `t` (Oded's loose signature, Linoy's `Args`, the distributed tuple); banner (`pending`); bench (`case.ts`, `workload.mjs`, 2,000 keys, 2,000 calls, 40 sections × 50 keys); `probe.ts`/`probe.json`.

## Part 05: Bonus: AI and TypeScript

Per the brief, the bonus chapters make no claims about real AI models or products; assistants are unnamed and their output is shown as saved artifacts.

### Bonus 1 (05-bonus-ai-and-typescript/01-prompting-for-typescript.md) — heading "Bonus 1: Which File Says That?"

Principle (Eli, `:5-7`): correct and useful ("Compiling through `any`, an `as` assertion or a non-null `!` doesn't establish that the value was checked."; "The checks enforce what you've expressed in them. Someone still has to own what you meant."). The rule is clear. It is also the only Principle in the book that gives the reader a checkable method (run the command against the returned code). Keep.

Compliance with the bonus rule: the assistant is unnamed ("the shop's coding assistant", `:13`), and its output is shown as a quoted request and saved files. No model or product claims. Good.

Verified by reading against TS 7.0.2 semantics: the `reset.d.ts` interface merge (`:105-113`) makes `JSON.parse` return `unknown` and the TS2322 at the `return` (`:115`) is the expected result; the coercing version's `Number("")` returns 0 (`:266`); the replacement `const cents = value.cents;` still passes the `typeof cents !== "number"` narrowing, so the five-test claim (`:330`) holds on paper. Not run.

Cross-book: the heading says "Bonus 1" while chapter headings elsewhere say "Chapter N". The numbering of the bonus is a chapter 28 by position. Make it consistent.

- `01-prompting-for-typescript.md:1` | Heading "Bonus 1: Which File Says That?" | consistency | minor. Every other file is "Chapter N". Decide and apply one scheme.
- `01-prompting-for-typescript.md:121` | Idan: "Our later overload wins this call." | technical | keep, with a note. Declaration merging places later interface members first; the test shows TS2322 at the return, so the claim holds. A reader may want the one-line reason.
- `01-prompting-for-typescript.md:74` | `"@types/node": "26.5.1"` | technical | minor, unverified. Confirm the version exists at print time.
- `01-prompting-for-typescript.md:230` | Idan: "That typeof check can't fail after Number." | technical | keep. Correct: after `Number(...)` the value is always a number, so the typeof check is dead.
- `01-prompting-for-typescript.md:330` | "rejects text amounts fails on `""`: instead of the expected failure, it returns a success with zero cents." | technical | keep. Matches `:266`.
- `01-prompting-for-typescript.md:352` | Dima: "I'm not rewriting them to prove I take prompting seriously." | voice | keep.
- `01-prompting-for-typescript.md:346` | the saved request (Verdict) | verdict | keep. It is the chapter's most reusable artifact and matches the rules in the Principle.
- `01-prompting-for-typescript.md:366-374` | Chen and Dima on who owns the requirement ("Neither were you. A serious omission.", `:374`) | voice | keep. Strong.
- `01-prompting-for-typescript.md:384` | Eli: "We didn't discover that every request needs a refund policy. We discovered who has to decide one when it does." | voice | keep. Good closer, slightly aphoristic.

Debate notes: the "It says validates" opener is a fair and funny stake. The `reset.d.ts` move (`:105-121`) is a clever, concrete control. The `Number` vs `value.cents` distinction is caught by Chen's and Idan's questions, not by the assistant or the test list, which is the chapter's point.

Chapter grade (Bonus 1): A. Enjoyed: "It validated the vibe." / "And gave us an excellent interest rate."; the `reset.d.ts` trick; Dima's "Two was before we successfully refunded nothing."; the saved request. Got bored: `:131-190` (the owned-tests discussion) repeats the same argument about who decides; the Principle is long for a bonus.

Running settings (Bonus 1): `Refund { id, cents }`, `Result`, `ParseRefund`, `parseRefund`, `test/refund.test.ts` (five tests), `reset.d.ts` (`JSON.parse` returns `unknown`), `npm run check`, provider's whole-cent contract.

### Bonus 2 (05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md) — heading "Bonus 2: Whose Refund Is It?"

Principle (Liron, `:5-7`): clear and testable. "A customer ID in the arguments isn't authentication; removing it doesn't check who owns the order." and "Successfully parsing a boolean called `refundIssued` hasn't issued anything." Both are sharp. The second paragraph is a list of three rules and is fine. Keep.

Story: the best bonus. The stake is concrete (a customer's friend gets a refund on a different customer's order; a dollar receipt for euros), and each fix is caught by the replay rather than by a proof. The Turn (`:201-261`) is a real turn: removing the caller's currency field exposes that the ownership check is missing too. Earned. The reply-as-outcome final beat (`:333-350`) lands the Principle.

Checked against Zod 4 behaviour as described (`:155`: the default output lists `currency` as required, the input does not): plausible, not run. Not run with tsc: `shop.ts` final version and `forSession`'s `run` inference. Outputs at `:110`, `:178`, `:195`, `:327`, `:341-346` are consistent with the code by reasoning.

- `02-type-safe-agent-patterns.md:1` | Heading "Bonus 2: Whose Refund Is It?" | consistency | minor. Same scheme question as Bonus 1.
- `02-type-safe-agent-patterns.md:145` | `Envelope.parse(input)` in `dispatch` throws, while every other failure in the file is returned as `Result`. | technical / consistency | minor. A malformed envelope from the client would throw into the handler, not return a failure. Use `safeParse` and return `{ ok: false, error: "invalid call" }`, or say why the envelope is trusted.
- `02-type-safe-agent-patterns.md:229` | `TS2339: Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.` | technical | keep. Matches the expected message form.
- `02-type-safe-agent-patterns.md:249` | Gilad: "Her friend, according to the conversation. That isn't one of our permissions." | voice | keep. Strong.
- `02-type-safe-agent-patterns.md:261` | Liron: "Keep Alice with the operation. The assistant can name Bob's order; it shouldn't get to become Bob to refund it." | voice | keep. Best line in the bonus.
- `02-type-safe-agent-patterns.md:319` | `JSON.stringify(alice.parameters) === JSON.stringify(bob.parameters)` prints `true`. | technical | keep. Correct: the description is the same for both sessions, which is the chapter's point.
- `02-type-safe-agent-patterns.md:333` | Gilad: "The saved answer still says it recorded Alice's refund on o-17." | story | keep. Hmm: the saved reply is the friend's, not Alice's own refund; say "the saved reply still says it recorded the refund on o-17."
- `02-type-safe-agent-patterns.md:372` | Gilad: "I'll correct the dollar entry and reverse the old refund on o-17. Bob didn't ask either." | story | keep. Good closer: a stakeholder outcome, not just code.
- `02-type-safe-agent-patterns.md:376` | Gilad: "The customer has expressed no preference about our schema." | voice | keep. Funny.
- `02-type-safe-agent-patterns.md:364` | Dafna: "...generating JSON Schema from that contextual refinement doesn't export the comparison. We still have to execute it." | technical | keep. Correct and important.

Debate notes (bonus 2): the currency argument (`:203-215`) is the real design turn: the caller's second opinion about currency is removed, and the ownership problem appears immediately after. Guy's "Whose answer would that be?" (`:255`) is the sharpest question in the bonus.

Chapter grade (Bonus 2): A. Enjoyed: "Congratulations to the descriptions."; Liron's "shouldn't get to become Bob"; the "order unavailable" for the friend's call; the replay-as-test. Got bored: `:120-200` (generated description and the default-currency detour) runs long for a point that is made once at `:155-159`.

Running settings (Bonus 2): `Order` (o-12 Alice, EUR; o-17 Bob, USD); `Receipt`; `Refund` schema (strictObject); `defineTool`, `dispatch`, `forSession`; `ownCall` (500 cents to o-12), `friendCall` (500 cents to o-17), `friendReply` (`refundIssued: true`); the generated input description.

### Bonus 3 (05-bonus-ai-and-typescript/03-reviewing-ai-code.md) — heading "Bonus 3: What Did the Fix Fix?"

Principle (Daniel, `:5-7`): the right procedure, stated as practice: emit declarations before and after with the same settings, compare referenced types, put the old caller back, and run the runtime tests. "An explicit type gives the implementation a promise to meet; the compiler checks that promise, but it can't choose the right one for us." Strong, and the chapter proves each step. Paragraph 1 is long; it is the one Principle in Part 05 that reads like a checklist in a person's voice, which works here.

Compliance with the bonus rule: the assistant is unnamed ("an assistant", `:17`) and its output is quoted or saved as a patch. No claims about real models. Good.

Story: excellent. "No public API changes" versus a declaration diff that is one line (`:204-213`), then a caller (Eden's mobile adapter) that the patch breaks (`:229-245`), then the typo experiment that shows the fallback turns a type-error repair into a behaviour change (`:261-301`). The Turn is a real turn: the reviewers stop arguing about the badge and start arguing about the contract. Earned. Oded's "six minutes" to "four minutes ago" (`:13`, `:414`) is a good running joke.

Verified with TS semantics as described (TS2345 at `assertNever` `:196`; TS2322 at the mobile caller `:243`; TS2678 and TS2345 for the typo `:293`; TS2820 with the `satisfies` table `:374`; TS9007 `:390`). I did not run the scratch projects; the codes are standard for those errors.

- `03-reviewing-ai-code.md:392` | Daniel: "The flag even allows some simple inferred exports. It doesn't require a return annotation on every export." | technical / contradiction | **major**. The same section says the flag reports TS9007 on `orderStatus`, which is an exported function with no return annotation (`:390`). So the flag does require an explicit return on exported functions. Fix: "It allows some simple inferred exports, such as literals and identifiers. Function return types are not among them."
- `03-reviewing-ai-code.md:58`, `:130`, `:132`, `:144`, `:152`, `:225`, `:255` | Several debate lines have no speaker tag ("Still says the same things. I checked.", "We could ask.", "We're not in the meeting yet.", "You don't get to insert a word...", "We lost the compiler asking me to fix a function that works."). | clarity | minor. The reader has to track speakers across a long review. Tag each line (the assistant's reply at `:58` should be labelled as the assistant's).
- `03-reviewing-ai-code.md:204` | "He puts the submitted badge back." | clarity | minor. Daniel is the speaker; but the previous paragraph has Noam restoring the original `badge.ts` at `:156`. Say explicitly which badge is put back (the submitted one, which returns `status`).
- `03-reviewing-ai-code.md:374` | TS2820 "Did you mean '"refunded"'?" and TS2322 at the return. | technical | keep, unverified. Consistent with `satisfies Record<RefundLevel, OrderStatus>`.
- `03-reviewing-ai-code.md:406` | Oded: "Swapping `paid` and `refunded` would satisfy that union perfectly." | voice | keep. Good: it names the limit of type checks, which the Principle also says.
- `03-reviewing-ai-code.md:414` | Oded: "Now I have a green pull request and a meeting four minutes ago." | voice | keep. Pays off `:13`.
- `03-reviewing-ai-code.md:420` | Daniel: "...The declaration report is there to show you what the compiler made of the whole change." | voice | keep. The best closer in Part 05.

Debate notes (bonus 3): the "No public API changes" argument is precise and fair. Oded's "No written public API changes" (`:223`) and Noam's "You don't get to insert a word after I've reviewed the sentence" (`:225`) are a good pair. Eden's mobile caller (`:229`) is the stake that makes the declaration report matter.

Chapter grade (bonus 3): A-. Enjoyed: the 2-word repair (`:303-345`); the typo experiment; the TS9007 "explicitly the wrong contract" beat (`:396-398`); Oded's meeting joke. Got bored: the badge-and-status section (`:154-257`) re-argues the same declaration diff from three sides before the typo experiment.

Running settings (bonus 3): `Order { paidCents, refundedCents }`; `orderStatus`, `badge`, `assertNever`; `cases.ts`, `check.ts` (six assertions); the submitted labels table; `mobileStatus` (the mobile adapter's caller); `types/status.d.ts`.

---

## 3. Cross-book inconsistencies (one list)

1. **`RequestState` tag key.** ch3 (`03-interface-vs-type.md:267-271`, Verdict `:450-454`) tags the union with `status`; ch5 (`05-narrowing-strategies.md:309-313`) uses `kind` for the same four states. Two chapters apart. Pick one.
2. **Cast pronoun for Sahar.** Sahar is "he" in the bio (`00-prologue/02-meet-the-cast.md:75-77`). ch10 `:299` "She tries a courier-specific version" follows Sahar's question; the referent is ambiguous, and the reader will read it as Sahar. Name the speaker.
3. **Eli's Principle role.** Eli opens the chapter Principle in ch1-7, ch11, ch14-16, ch20 and ch23-ch27 (partly), but ch8, ch9, ch10, ch12, ch13 have no Eli Principle at all. Not a contradiction, but the "Principle must be stated" rule is failed in those five chapters.
4. **"Unwrap" promise.** ch1 (`01-any-vs-unknown.md:276`) says the conditional rules will get their own debate; ch7 (`:600`) says "we still owe `Unwrap` an explanation". ch10 (`04-infer-keyword.md`) does explain `Unwrap`, so the promise is now kept. Remove the ch7 phrasing or point to ch10.
5. **`version 1` vs `format 1`.** ch22 `Rule` uses `version: 1` for the unshipped tree (`:159`); Eden's "format 1" (`:249`) means the old pre-window templates, never shown. Name them differently.
6. **Interface vs type for `AppConfig`.** ch3's Verdict labels an application config as "interface: library extension points" (`:475`), contradicting the chapter's own table (`:435-442`).
7. **Overload diagnostic.** ch7 quotes a TS-5-style "Overload 1 of 2" block (`:126-132`); TS 7.0.2 prints "The last overload gave the following error" (verified). The book claims it checks against 7.0.2 (`00-prologue/01-how-to-read.md:64`).
8. **Naming the two `slugify` functions.** ch7 `:43` (slugifyOne/slugifyAll), `:175` (union `slugify`), `:538-540` (Turn uses `slugify`), `:555` (mentions `slugifyAll`), `:584` (Verdict "keep the two functions"). Name them once.
9. **`Config` / `Base` / `User` / `RequestState` reuse inside ch3.** The same names are declared as an interface in one snippet and a type in another (`03-interface-vs-type.md:39/42/249`, `:66/92`, `:71/124`).
10. **`HttpStatus` enum and object in ch4** (`04-enums-vs-unions.md:138` vs `:188`): the same name for two constructs in one chapter.
11. **Unattributed quoted continuations.** Ch16 `:378`, ch17 `:372`, ch18 `:317`, ch20 `:250`, ch21 `:47`, ch24 (none), ch25 (none), ch03 bonus (several). Cross-book formatting.
12. **Silent-closer "leaves X beside Y" pattern.** ch2 `:237`, ch8 `:226,:402,:422`, ch9 `:325`, ch11 `:284,:436`, ch12 `:367`, ch13 `:260`, ch15 `:318,:322`, ch20 (none), ch22 (none). Cross-book AI-feel.
13. **Horizontal rules with no heading.** ch9 `:424`, ch15 `:335`, ch18 `:379`, ch26 (none). Cross-book structure.
14. **Verdicts as recaps.** ch8 `:420-422`, ch9 `:389-393`, ch10 (decision only), ch12 `:359-367`, ch16 `:363`, ch25 `:342`, ch26 `:407-421`. Cross-book: the Verdict should state the rule.
15. **Bonus numbering.** Bonus headings say "Bonus 1/2/3" (`05-bonus.../01`, `02`, `03`), while every other file says "Chapter N". Decide one scheme.
16. **Test fixture dates.** ch18 uses Monday 9 Nov 2026 (verified as a Monday) and ch25/26 use no dates; no conflict found.
17. **Cast "Dafna" as "she" everywhere** (ch3, ch6, ch8, ch10, ch11, ch17), consistent with the bio.
18. **Dima.** Consistently "he" (ch1, ch13, ch25, ch27, bonus 1). Consistent.
19. **Gilad's "3 AM".** Used in ch2 (Gilad) and ch4 (Guy, `:425`); consistent with his bio, and the phrase is shared by two characters without conflict.
20. **Running Settings.** The forty-callers (ch10) and the "four hundred enums across twelve services" (ch4) do not conflict. The Oded "six hours" deploy block (ch7, bio) matches. The `ParseResult<T>` shape is the same in ch5 and ch6.
21. **`export =` vs default export across ch24 and ch25** (different shops: ch24 `"type": "commonjs"`, ch25 `"type": "module"`). Not a conflict; keep the two shops visibly distinct.

## 4. Top 15 for release (ranked)

1. **[blocker] ch13 `07-declaration-merging.md:330`**: the claim that the conflict error is "in `labels.ts`, so `skipLibCheck` won't hide it" is false (verified: the error is in the upstream `.d.ts` and `skipLibCheck: true` hides it). The chapter's last line is wrong.
2. **[major] ch2 `02-type-assertions.md:310-321`**: the non-null snippet declares `const name` twice at top level (TS2451, verified). Rename.
3. **[major] ch7 `07-conditional-types.md:126-132`**: the quoted TS2769 block is not the TS 7.0.2 output (verified). Replace with the 7.0.2 text.
4. **[major] ch7 `:538-569`**: the Turn uses `slugify` and `slugifyAll` interchangeably; the Verdict's "keep the two functions" is ambiguous.
5. **[major] ch1 `01-any-vs-unknown.md:196`**: "In these snapshots" is a meta-phrase no reader can parse. Delete the paragraph or fold it into Eden's line.
6. **[major] ch5 `05-narrowing-strategies.md:457`**: Noam presents "adding a required field won't force those checks to change" as a virtue; it is the bug Idan named at `:257`. Reverse the framing.
7. **[major] ch5 vs ch3**: `RequestState` uses `kind` in ch5 and `status` in ch3 (cross-book item 1).
8. **[major] ch10 `04-infer-keyword.md:299`**: "She tries a courier-specific version" after Sahar's question; Sahar is "he" in the bio. Name the speaker. Also ch10 has no `## The Turn` heading (skeleton).
9. **[major] ch15 `02-branded-types.md:333`**: Noam says the optional marker keeps "the one that passed the last page" compiling; verified false (the branded `selection.last` still errors). Fix the sentence.
10. **[major] ch20 `07-currying-partial-application.md:276`**: Linoy says she "removed the arrow at the package call"; the code adds the arrow inside the renderers. Reverse the sentence.
11. **[major] ch24 `01-migration-strategies.md:185`**: Eden proposes `@ts-check` when global `checkJs` is already on (`:140`), and says it "would leave the other files alone". Contradicts the setup.
12. **[major] bonus 3 `03-reviewing-ai-code.md:392`**: Daniel says `isolatedDeclarations` "doesn't require a return annotation on every export", the same section reports TS9007 on an unannotated exported function. Contradicts itself.
13. **[major] ch8, ch9, ch10, ch12, ch13 Principle sections** have no explicit testable rule (scene openings; Verdicts as recaps). Systemic. The memory rule ("Principle must be stated") is not met; ch8 `:420-422`, ch9 `:389-393`, ch12 `:359-367` are the clearest recaps.
14. **[major] ch4 `04-enums-vs-unions.md:181`**: Daniel's paragraph describes `typeof HttpStatus` as the enum while the next snippet redeclares `HttpStatus` as an object. Readers will be lost at the switch from enum to object.
15. **[major] ch22 `22-config-to-function.md:159` vs `:249`**: `version: 1` (tree) and "format 1" (old templates) are two different things with the same label; and `:133` "On the third" reads as a date.

Also high on the list but ranked below the top 15: ch13 Turn/Verdict praise is deserved, ch18 `:225` planted false premise is fine; ch25 unverified `#cents` diagnostic (TS2741 vs private-field diagnostic); ch27 `let value: any` in the implementation; ch3 `AppConfig` mislabel; ch11 unresolved last question; ch23 `:5` long Principle.

## 5. Per-chapter grades

| File | Grade | One-line reason |
|---|---|---|
| 00 prologue (cast and how-to-read) | A- | Clear canon; bios well drawn; Dima's bio has an awkward "has said validating things". |
| ch1 any vs unknown | B+ | Strong Turn-less debate, verdict earned, but the meta "snapshots" paragraph and undefined `logEvent`. |
| ch2 type assertions | B+ | The double-assertion and Gilad's 3 AM Turn are excellent; non-null snippet redeclares `name`. |
| ch3 interface vs type | B | Good `extends` vs `&` demo; the Principle is a question list; the Turn restates; AppConfig mislabel. |
| ch4 enums vs unions | B+ | Verified technically; Turn about team cost is earned; HttpStatus enum/object confusion. |
| ch5 narrowing | A- | Idan's "delete the check" demo is the best scene in Part 01; Noam's reversal and `kind`/`status` clash. |
| ch6 generics | B | Principle is strong; the Turn is decorative; `createStore` tangent. |
| ch7 conditional types | A- | Best voice in Part 01; the overload quote and `slugify` naming need fixing. |
| ch8 mapped types | B | Story stakes are the book's most grounded; no Principle rule, recap Verdict, "leaves" pattern, Turn is a feature addition. |
| ch9 template literals | B+ | `rg` device is excellent; no Principle rule; recap Verdict. |
| ch10 infer | B | Dense and honest; no Turn heading; the "She" for Sahar; too many small reversals. |
| ch11 advanced generics | A- | Eli used well; builder argument is fair; Turn "Both of these compile" is strong. Open ending stops on an unanswered question. |
| ch12 variance | A- | The cleanest real Turn in Part 01/02; strictFunctionTypes section runs long; recap Verdict. |
| ch13 declaration merging | A- | Best story stakes; type-only-import Turn is excellent; the last line is wrong (blocker). |
| ch14 error handling | A | Liron's Principle is the model; Dafna's "Run that case" and Gil's trace are strong. |
| ch15 branded types | A- | Two real turns; Chen probe answered wrongly; coda after a rule. |
| ch16 runtime validation | A- | Gilad's Principle and the `review` Turn; long schema sequence; verified outputs. |
| ch17 immutability | A- | The `Was 80. Now 80.` opener and `view()`-is-live Turn; extra design in the promotion chooser. |
| ch18 pure functions | A | Planted false premise and Chen's "whose nine?" Turn; strong TZ table. |
| ch19 imperative vs declarative | A | Best refactor-went-wrong story; verified replay arithmetic; the Turn earned. |
| ch20 currying | A- | Index bug is a real stake; Linoy's reversed sentence; the Additional Take is an appendix. |
| ch21 HOF | A | Gilad's Principle, the composition-order fight, the early-acceptance Turn. |
| ch22 config to function | A- | "It gave the policy an alibi."; version/format clash; the regrouping data settles the debate. |
| ch23 monads light | A- | `then`-as-thenable Turn is excellent and verified; six-callers debate runs long. |
| ch24 migration | B+ | Strong 500s stake and `.default` Turn; the `@ts-check` contradiction and a documentary Principle. |
| ch25 monorepo | A- | Fifteen-dollar stake and the node_modules Turn; the Verdict is a task list. |
| ch26 testing typed code | A | "It can't be green." / "That's the problem."; runner vs compiler file lists, a real Turn. |
| ch27 performance vs safety | A | Counters aren't seconds; the profile correction; Oded's title payoff. |
| bonus 1 prompting | A | "It validated the vibe."; reset.d.ts control; the saved request. |
| bonus 2 agent patterns | A | Currency and ownership turns; "Congratulations to the descriptions."; replay-as-test. |
| bonus 3 reviewing AI code | A- | Declaration-diff method; the isolatedDeclarations contradiction; the typo experiment. |

Where I got bored, most often: the long mid-chapter reversal runs (ch10 `:300-335`, ch21 `:144-252`, ch27 `:189-247`, ch23 `:296-332`) and the Verdict-as-recap sections in Part 02 and Part 04.

## 6. Overall readiness verdict

**Ready after fixes.** The book is funny, the cast is distinct, and the best chapters (ch7, ch13, ch14, ch18, ch19, ch21, ch22, ch26, ch27, bonus 2) do what the premise asks: real disagreement, concrete stakes, and a Turn that changes the argument. Verification against TypeScript 7.0.2 and Zod 4.6.2 confirmed most code claims, and the authors' technical care is high (ch19's replay arithmetic and ch27's measurement discipline are exemplary). It is not ready as is because of one blocker (ch13's false `skipLibCheck` claim, the book's last word on its own warning) and about twenty major defects: three wrong or unreproducible technical claims (ch7 diagnostic text, ch15 optional-marker sentence, ch13), two self-contradictions (ch24 `@ts-check`, bonus 3 `isolatedDeclarations`), a cast slip (ch10), a snippet that will not run (ch2), and a systemic gap where Principles are scenes and Verdicts are recaps (ch8, ch9, ch10, ch12, ch13, plus partial cases in Parts 03-04). Fix the blocker and the major items; the minor polish (silent-closer "leaves" lines, unlabelled speakers, headingless rules, Bonus numbering) can go in one editing pass.

Counts (approximate, from the tagged findings above): 1 blocker, about 20 major, about 100 minor, plus many "keep" notes.
