# Whole-book review: haiku-voice (voice editor)

## 1. Ledger

**Cast pronouns (from bios, canon):** Eli he; Daniel he; Gilad he; Liron he; Sahar he; Noam he; Oded he; Gil he; Eden he; Linoy she; Chen he; Dafna she; Guy he; Dima he; Idan she.

**Stances (bio):** Eli wants the claim stated so it can be tested ("first principles"); Daniel opens the playground and says "The compiler disagrees"; Gilad asks "Show me the stack trace" (3 AM test); Liron speaks in parables, "In Clojure, we solved this..."; Sahar wants removal, asks whether the caller needs it; Noam "Over my dead type definition", zero `any`; Oded "We can fix it in the next sprint", ships Fridays; Gil "What does the data say?"; Eden "What's the migration path?", "I've seen this fail at scale"; Linoy "There's an RFC for that"; Chen asks "But have you considered..."; Dafna "That's just a map"; Guy "Where's the interface?"; Dima "Both have a point here"; Idan "Prove it by producing it", parse at the boundary.

**Running settings so far:** Noam's team is "eight people, internal tool" (ch1:545-547); Oded's "forty developers and three acquired codebases" (ch1:547); Eden's three-million-line migration (ch1:194); JIRA-4521 (ch1:229), JIRA-7823 (ch1:683); `formatResponse` with 47 call sites (ch1:93); Oded's analytics SDK (ch1:63).

**Ch1 Principle (as stated):** Keep values `unknown` until checked; an `any` owes the next caller an account of what is unchecked.

---

## 2. Findings by chapter

### Chapter 0 (prologue: dedication, how to read, cast)

- **00-prologue/01-how-to-read.md:11-15** — Oded/Noam exchange ("I'm using `req.body` directly and you can't stop me." / "I can block your PR." / "You already block all my PRs."). Strong. This is the book's best opening beat; keep it. It is matched by ch1:414-418, which is a good callback.
- **01-how-to-read.md:17** — "That's an exchange from Chapter 1. The code that sparked it, the argument that followed, and the verdict the room eventually reached — that's every chapter of this book." Minor AI-feel: a tidy triplet and a summary closer that promises a structure the book then does not uniformly deliver (see ch 2 onwards). Minor.
- **01-how-to-read.md:41** — "Their advice can be challenged too; knowing what the compiler does does not settle what a team should choose." Documentation sentence; a reader would not say it aloud. Minor.
- **01-how-to-read.md:43** — "the type safety absolutist, the 'just ship it' advocate, the data person who won't accept a claim without benchmarks, the FP purist, the OOP defender, and the one person who just asks hard questions until everyone wants to throw something at them." Good, funny list. Keep. Note the list is a tidy sextet and the counts line up with the cast.
- **01-how-to-read.md:45** — "By the third debate, you'll start predicting who's going to object and why. That's by design." Fine, slightly self-congratulating. Minor.
- **01-how-to-read.md:79** — "The moments where you find yourself siding with one character over another? That's you figuring out what kind of TypeScript developer you are." Aphorism closer. Minor, but this is the kind of line the brief names. Consider cutting "That's you figuring out..." and leaving the question.
- **01-how-to-read.md:63** — "The examples target TypeScript 7 ... checked with 7.0.2." Fine, consistent with the brief.
- **02-meet-the-cast.md** (cast bios, canon). The bios are the most voiced part of the book and mostly good: Daniel's Titanic line (line 31), Noam's "Your Slack status...", Oded's sticky note, Gil's "847 entries" spreadsheet, Chen's "If Chen can't break it, ship it", Idan's "Parse, Don't Validate" marginalia. Keep these.
  - **02-meet-the-cast.md:251-265** (Idan) — strongest bio in the cast. Keep.
  - **02-meet-the-cast.md:239** — "Dima has said validating things about both sides, and both sides only remember the validation." Garbled. Reads as an AI-generated sentence: "has said validating things" is not English a person uses. Fix: "Dima says something fair to both sides, and each side only remembers the part that agrees with it." Severity: minor (but it is the first sentence of Dima's bio: minor-major for print).
  - **02-meet-the-cast.md:243** — "Oded calls him 'the human "it depends."'" Good.
  - **02-meet-the-cast.md:153** — Eden: "'I've seen this fail at scale' — and then describes exactly how" then "'I've seen this fail at scale too'" — the second quote uses straight double quotes and no italics, inconsistent with the first (italic) — typographic only. Minor.
  - **02-meet-the-cast.md:95** — "Forty-three of them are about type safety. The other four are about naming conventions, which he considers a form of type safety." Good joke. Keep.
  - **02-meet-the-cast.md:113** — "Oded has deployed to production on a Friday. Twice. This month." Good, but the table repeats the same line verbatim (line 286). Fine as a deliberate echo.
  - Cast tables at lines 273-294: "Chen Override | Socratic Skeptic | If Chen can't break it, ship it" repeats bio. Fine.
  - **02-meet-the-cast.md:131-139** (Gil) — "Gil doesn't have opinions. Gil has datasets." Keep. Table at 287 repeats it.
  - **02-meet-the-cast.md:237** (Dima) — as above.
  - Bio tone overall: bios are warm and specific. Two bios (Eli, Liron) rely on the "Complexity is a choice, not a necessity" and "first principles" quote, which is a bit generic; fine.

### Chapter 1: The `any` Problem (01-the-type-system/01-any-vs-unknown.md)

**Voice and fun.** This chapter is the book's best demonstration of the premise: Noam's "Forty-seven call sites", Oded's "Shipped in ten minutes. Works perfectly... I made a business decision." Eden's "any budget", Chen "Finally, something everyone can agree on." / Noam "Don't get used to it." Dafna's "That's just a map." / Oded "With homework underneath it." Oded's "I'd been looking for angle brackets in our own code." These are real human lines. Keep.

**Where the fun dies.** The conditional-type and generic-inference sections (ch1:253-302, 276-292) read as a compiler lecture with a joke tacked on. The "function parameter problem" (ch1:422-527) is four code blocks in a row with a single speaker each; a reader will skim. Consider cutting one of the four alternatives (Guy's discriminated union or Noam's overloads) or moving the overloads into a Turn.

- **01-any-vs-unknown.md:196** — "In these snapshots, `Promise<UserProfile>` describes the value the promise will resolve to. The type argument in `api.get<UserProfile>` tells the API client what type to report to its caller; it does not check the response body." — **blocker**. Category: AI-feel / clarity / other. This is an editorial note leaking into a character's speech (Eden has just said "We had to let some of those calls through:"). "In these snapshots" is process language; no human in the room would say it, and it reads as a note to a reviewer. It also sits between Eden's sentence and his code, so the reader hears the note as Eden. Fix: delete the paragraph. If the point must survive, put it as one clause in Eden's voice, e.g. "`api.get<UserProfile>` only tells the client what type to expect; it doesn't check the body."
- **01-any-vs-unknown.md:15** — Daniel: "A value of type `any` can go straight in. Almost any other target type accepts it too. `never`, the type with no possible value, is the exception. In the other direction, every type is assignable to `any`." — **minor**. AI-feel: characters speaking in documentation sentences. Daniel's bio gives him dry lines; here he is a manual. Fix: "Anything goes into `any`. `any` goes almost anywhere, except `never`. Watch:"
- **01-any-vs-unknown.md:9-11** — the narrator describes Eli's drawing in detail ("Eli draws arrows from every type to `any`... He leaves out the arrow from `any` to `never`."). Fine as stage direction; the paragraph is slightly long. Minor.
- **01-any-vs-unknown.md:276** — "The next example previews a conditional type. Its result for `any` is the point here; the rules behind that result will get their own debate." — **minor**. Meta-signposting in the narrator voice; a human would say "We'll get to why in chapter 2." Keep only if the chapter reference is concrete. Fix: "Chapter 2 explains why."
- **01-any-vs-unknown.md:292** — "Here one branch contributes `any`, so the resulting union is `any`. The compiler is following its rules. Those rules can preserve the uncertainty all the way to the caller." — **minor**. "The compiler is following its rules" is a Daniel-like line, but the second sentence is an abstract summary. Cut the last sentence.
- **01-any-vs-unknown.md:343** — Dima: "The asserted `port` is checked as a number at later calls. If it is really a string at runtime, that static check still passes. The assertion contains the declared type; it does not establish the truth of it." — **minor**. Good content, bad mouth. The last sentence is a documentation definition. Fix: "The assertion only says what the type is. It doesn't make it true." 
- **01-any-vs-unknown.md:347** — Dima: "For these calls, `any` lets an unchecked value through. The assertion lets a value through under a possibly false type. I'd use `unknown` and check the fields before passing either one to `startServer`." — **minor**. Same register issue; it is a fine position statement. Keep the "I'd use unknown" line; shorten the first two sentences.
- **01-any-vs-unknown.md:406** — Guy: "You don't type the framework. You type the boundary between the framework and your code." — **minor**. Symmetrical "not X, but Y" construction, and a tidy closer. Good as a line; it lands better with one fewer sentence. Fine to keep.
- **01-any-vs-unknown.md:533-535** — Liron: "The problem isn't `any` itself — it's when `any` becomes invisible. When it stops being a conscious choice and becomes the default." — **minor**. "The problem isn't X, it's Y" pattern. Liron's parable carries it, so keep the parable and cut the second sentence. Note it's also a near-repeat of the Verdict's point.
- **01-any-vs-unknown.md:585** — Verdict blockquote: "Default to `unknown` for uncertain values. Justify an `any` by describing the unchecked assumption and how it is maintained. Track temporary gaps for replacement; review deliberate implementation compromises when their code changes." — **minor**. Good, testable. The three-part tidy sentence is fine here because it is the Verdict's rule statement.
- **01-any-vs-unknown.md:587-594** — "For this codebase:" six-item list. **minor** AI-feel: a rules list is the register of documentation, not of the debate that came before it. The debate had people; the verdict has a checklist. Consider three items with the debate's names in them (Noam's ticket, Eden's any budget, Oded's "auth and payments first") rather than generic rules. Item 4 ("Keep noImplicitAny enabled...") is a tooling note that the debate never discussed. Severity minor.
- **01-any-vs-unknown.md:617** — "The next version checks the purchase fields in `isPurchaseData`. Its return annotation, `data is PurchaseData`, tells the compiler... The checks in its body supply the evidence for that claim. Look at the call inside `handleWebhook`: that is where `event.data` becomes usable by `processOrder`." — **minor**. Narrator-explains-the-code paragraph; manual register. A reader would want one clause. Fine to trim.
- **01-any-vs-unknown.md:688** — "The application logic no longer uses `any`. The payment boundary still does, with a ticket naming the wrapper that needs to be written. The input check stays visible in `isPurchaseData`; declaring the SDK parameter as `any` doesn't perform that check for us." — **minor**. Summary closer; the last clause repeats 617. Cut.
- **01-any-vs-unknown.md:692-696** — Additional Takes. Three short lines; Gil's "don't call that list a count of all your any's" is a good final beat. Keep.

**Story and logic.** The Turn (ch1:557-581) is a real turn: the event-handler overload that looked like the answer still has an `any` underneath. Good. Oded's "'tracked for removal' can mean you don't know how to remove it" lands.

**Technical notes (not verified, voice reviewer).** `Unwrap<any>` yields `any` at ch1:286-289 is consistent with the TypeScript rule that a union with `any` absorbs; a technical reviewer should confirm with tsc 7.0.2. Also `logEvent` and `ValidationError` are undefined in snippets; acceptable for a book, but the ch1:672 `logEvent(event.type, event.data)` changes what is logged from `user` (before) to `event.data` (after) without comment. Minor.

**Grade ch1: B+.** Funniest opening debate in the book; sags in the generics/overloads stretch and in the verdict checklist. Enjoyed: Oded/Noam Tuesday, Eden's any budget, Chen/Noam "Don't get used to it", Turn. Bored: the event-system section (ch1:422-527).


### Chapter 2: The Lies We Tell the Compiler (01-the-type-system/02-type-assertions.md)

**Voice and fun.** Strong. Noam's "This is putting a fake mustache on a bug and walking it past the type checker" (ch2:136), Chen's "type laundering" (ch2:134), Noam's "This time you're lying" (ch2:48), Oded's "That's a branch that can't run." (ch2:350), Gilad's "You will when one of them pages you at 3 AM." (ch2:402), Linoy's "satisfies is TypeScript's apology for as" (ch2:404). Gilad's 3 AM timeline (ch2:362) is the best dramatic beat in the chapter and the Turn is a real turn: it moves the question from "is this correct" to "how will you find out".

**Principle.** The principle opens as a lecture about what `as` does (ch2:5-21). The testable rule ("write an assertion only where you can say what you know that the compiler can't check, and how you know it") is buried at ch2:21, the last line of the Principle, after the demo. Against the book's own rule (Principle must be stated), this is an explanation with the rule trailing it. Major. Fix: move the rule to the first paragraph and cut the rest to one example.

- **02-type-assertions.md:237** — "Noam leaves the factory on the screen. Oded leaves a comment beside the test naming the fields it is supposed to exercise." — **major**. Category: AI-feel (silent closer, the exact "leaves X beside Y" pattern from the brief). It is a tidy symmetrical stage close after a debate that has nothing settled. Fix: cut the sentence, or give one of them a line. Check other chapters for the same closer (see cross-book list).
- **02-type-assertions.md:9** — "The question is simple: *do you?*" — fine. Keep.
- **02-type-assertions.md:21** — rule-as-afterthought (see Principle note above).
- **02-type-assertions.md:42** — comment "Compiler trusts you. Config requires host — no error." The type also requires `port`, so the comment is incomplete. Minor technical/clarity; say "Config requires port and host".
- **02-type-assertions.md:72** — Oded: "I'm not making this up. I'm asserting a contract. The API documentation says this is a `User`. I'm telling the compiler what the docs tell me." — fine, sounds like Oded. Keep.
- **02-type-assertions.md:87-88** — code comment "response.json() returns any in the DOM lib types — annotating as unknown is itself a discipline choice." Technically correct, but a note that Noam would say aloud rather than in code comment; minor.
- **02-type-assertions.md:94** — "Runtime validation doesn't trust anyone. Not the API, not the documentation, not the developer who wrote the assertion six months ago and has since left the company." Good, specific. Keep.
- **02-type-assertions.md:142** — Daniel: "Each step then passes, but neither adds evidence that the value is a `Dog`. This one still has `meow`, not `bark`." Good, dry. Keep.
- **02-type-assertions.md:148** — Daniel: "Module augmentation can add declarations; it cannot repair every incompatible property type." Technically accurate (I believe augmentation cannot change an existing property's type). Fine.
- **02-type-assertions.md:202** — "Nobody reads those extra six fields. They're noise. ... That's honest." Good, Oded's voice.
- **02-type-assertions.md:272** — Daniel's claim that the palette would be rejected with `as` too, and `"purple" as Color` compiles. **Verified with TypeScript 7.0.2 (strict, exactOptionalPropertyTypes):** the palette `as Record<string, Color>` gives TS2352 ("'purple' is not comparable to type 'Color'"), and `"purple" as Color` compiles. Claim is correct. Good.
- **02-type-assertions.md:306** — Chen: "after a `.filter()` that guarantees it" — a plain `.filter()` does not narrow the type, so the point is the compiler can't see it; fine, but say "a `.filter()` the compiler can't see through" for precision. Minor.
- **02-type-assertions.md:328** — Oded: "The compiler doesn't narrow through `.has()` — it's a known limitation" — accurate.
- **02-type-assertions.md:354** — Daniel: "The `!` is an assertion. Treat it like one. ... the `!` should answer the same questions as any other assertion: why is it here, and what happens when it's wrong?" — the checklist talk in-character, a little manual, but Daniel's rhythm holds. Minor.
- **02-type-assertions.md:366** — "Every assertion is a bet that the world outside your program still matches your model of it. You knew it was true when you wrote it. How will you find out when it stops being true?" — strong Gilad line, but the Verdict then repeats "a bet" (ch2:376) and "How will I find out" (ch2:376, 394, 406). Repetition is deliberate but the chapter says the phrase four times. Minor: trim the Verdict's version or Chen's closer.
- **02-type-assertions.md:376** — Verdict blockquote is a clear rule. Good.
- **02-type-assertions.md:378-389** — table. Row "Checking shape without widening | satisfies | Not needed — use satisfies" is a contradictory cell. Minor clarity. Row "Test mocks" cell is a sentence, not a table cell. Minor.
- **02-type-assertions.md:398-406** — Additional Takes are the best closers in the book so far. Keep.

**Story.** The mock-factory debate (ch2:152-237) is solid and fair: Oded's visibility argument is answered, not ignored. Eden's "one client, one assertion per endpoint" (ch2:96) is a practical middle, and Noam accepts it (ch2:110).

**Grade ch2: B+.** Sharpest technical debate so far with good comedy. Sags in the `!`/`.has()` section (ch2:289-354), which runs long for a single character trick. Enjoyed: Noam's fake mustache, Gilad's timeline, Oded/Noam on `.has()`. Bored: satisfies/palette (ch2:241-285) reads like a tutorial.


### Chapter 3: The Two Kingdoms (01-the-type-system/03-interface-vs-type.md)

**Voice and fun.** Good, quieter chapter. Noam's "The extends error message is a diagnosis. The intersection error message is a riddle." (ch3:115) is the chapter's best line. Daniel's "Interface names appear in error messages..." closer (ch3:483) is good. Guy conceding that "adding a class without editing existing callers is sometimes the point" (ch3:339) is a good bio-true move (Guy "honestly admits when a class isn't the right tool"). Dafna's "I don't want a new interface declaration for every intermediate result" (ch3:141) sounds like her.

**Where the fun dies.** The "things only type can do" block (ch3:226-258) is a list of type-level syntaxes with a comment on each; a reader skims. The performance section (ch3:343-370) is a wiki summary. "Just pick one" (ch3:374-397) is the most human part of the back half.

**Principle.** Not a rule. Eli's Principle (ch3:33) is five questions and then "choose a convention for your readers." A developer cannot state the rule after reading that. The Verdict's rule (ch3:429) is different in kind: it is a house convention, not something the Principle has tested. Major: the Principle needs an explicit, testable statement, e.g. "Use interface when you need declaration merging or conflict checks at declaration; otherwise use type, and say so in the style guide."

- **03-interface-vs-type.md:33** — Eli: "Choose by what the declaration needs to do beyond describing the shape. Does other code need to reopen it? Where should a conflict between its parts be reported? ..." — **major** (clarity / principle). Five questions, no rule. Fix: state the rule in one sentence first, then the questions as the test.
- **03-interface-vs-type.md:389** — Oded: "I've seen teams spend more time debating this in style guides than they save in a year of 'choosing the right one.' The overhead of the decision is more expensive than the occasional suboptimal choice." — **minor**, AI-feel. Blog-essay sentence in Oded's mouth; "more expensive than ... more expensive" is a polished repetition. Oded would say: "Teams spend a year on this and save nothing."
- **03-interface-vs-type.md:407-411** — Liron's blueprint/description parable. Three parallel sentences, a triplet of features ("load-bearing walls, doors that open, windows that let in light") and a triplet of description ("this wall is here, this door is there, this window faces east"), then "I often use an interface as that blueprint and a type as that description." — **minor to major** (AI-feel: symmetrical, tidy triplets). The parable is the right kind for Liron, but the text is essayist-polished. Fix: cut to one example object, keep the one-line metaphor.
- **03-interface-vs-type.md:135** — Guy: "So can mine. Extending interfaces doesn't require a chain four levels deep." — **minor** clarity: "So can mine" is ambiguous (his interfaces can also be independent?). Reword.
- **03-interface-vs-type.md:226-250** — the "only type can do" list. **minor** clarity: four or five unrelated syntaxes with a "— interface can't do this" comment repeated five times. Consider two examples and a sentence.
- **03-interface-vs-type.md:249** — `type Config = typeof defaultConfig;` redeclares `Config`, which was declared as `interface Config` at ch3:39 and as a type alias at ch3:48 (`Settings`). These are separate snippets, so each compiles on its own, but read in sequence the name clashes. **minor** (inconsistency). Rename to `AppDefaults` or `DefaultConfig`.
- **03-interface-vs-type.md:298-315** — Guy's `interface RequestState<T> { render(): string; }`; `class IdleState implements RequestState<never>` — the type parameter `T` is unused by the contract, which an interface-sceptic (Dafna, Idan) would call out. **minor** technical/clarity: drop `<never>` or make `T` used.
- **03-interface-vs-type.md:349** — Linoy: "It predates the TypeScript 7 native compiler." — unverifiable claim about the wiki; fine as voice. Minor: consider "It was written before the native compiler."
- **03-interface-vs-type.md:429** — Verdict: "Our default is `type` for data and `interface` for behavioral contracts or deliberate extension points." Clear. Good.
- **03-interface-vs-type.md:464-478** — **inconsistency, major.** The example's final block is labelled `// interface: library extension points` and declares `interface AppConfig { port; host }`. That is the app's own config, not a library extension point, and it is plain data. It contradicts the Verdict (`type` for data) and the table row "Library public API (consumers may extend)". Fix: either move it to `type AppConfig`, or relabel as "app config that teammates may extend" and say why.
- **03-interface-vs-type.md:457-460** — the verdict `User` has `role: "admin" | "editor" | "viewer"`. Ch2's test mock `User` (ch2:172) has `"admin" | "user" | "viewer"`. Ch1's `UserProfile` (ch1:214) has `"admin" | "user" | "viewer"`. Minor cross-chapter inconsistency (see cross-book list).
- **03-interface-vs-type.md:441** — the table lists "Extending object hierarchies | interface | Explicit lineage" while the Debate's own point (Guy/Dafna) was that intersections are fine when combining independent parts. Minor: nuance lost in the table; fine.
- **03-interface-vs-type.md:421-425** — Liron: "I'd keep that exception. The convention isn't worth giving up that error." Good, but the exception is an interface composed only for `extends` checking; the Verdict does say so at ch3:429. Consistent.

**Technical.** Verified with TypeScript 7.0.2 (strict): `interface Employee extends Base { id: number }` gives TS2430 with the message quoted at ch3:83-85; `type Employee = Base & { id: number }` gives `id: never` and `"1"` fails with "not assignable to type 'never'" at the object literal (ch3:108). Both claims are accurate. Duplicate `type` alias gives TS2300 as implied at ch3:57.

**Story.** The dispute has no villain and the Turn (Liron's question) is a restatement rather than an event: nothing changes on the page; Liron just says the convention needs exceptions. Weak turn. Moderate. The debate is fair to both sides.

**Grade ch3: C+.** Honest, friendly, and useful; but a convention topic makes the Principle a shrug. Enjoyed: Noam's diagnosis/riddle; Guy conceding the class; "Pick one... ESLint... Ship the feature". Bored: "only type can do" list and the wiki paragraph.


### Chapter 4: The Feature That Wasn't Just a Type (01-the-type-system/04-enums-vs-unions.md)

**Voice and fun.** Among the best chapters for voice. Oded's "That's the line that makes me want to close the tab and go outside." (ch4:245), Guy's "Why would I take on the extra pieces?" (ch4:206) and Daniel's "It doesn't make the enum's built-in map useless." (ch4:208), Gil's "which build are we measuring?" (ch4:125), Oded's "Four hundred enums across twelve services. I'm not putting a rewrite on the roadmap." (ch4:431), Sahar's "Then don't. Start where the choice is still open." (ch4:433) and Guy's "Sometimes it's about the room." (ch4:425) all sound like the people. The Turn (Sahar vs Guy, ch4:417-433) is a real argument that ends on a human decision rather than a rule.

**Principle.** Good. Eli states a rule and a check (ch4:7): "For a fixed set of values, start with a type. Add a runtime representation when a caller needs to look up, list or name those values." That is testable. Keep. The Verdict honours it.

**Where the fun dies.** The `const enum` / isolatedModules speech (ch4:102-121) is four paragraphs of Linoy explanation before anyone reacts; the reader is in a build-config lecture. The reverse-mapping section (ch4:133-208) runs long, with two complete implementations; Daniel's `nameByCode` block (ch4:187-204) is the kind of code a reader will skip.

- **04-enums-vs-unions.md:23** — Eli: "The union describes which strings we accept. Its declaration is erased. The ordinary enum also defines a value called `Status`." — **minor** (AI-feel, documentation sentences). Acceptable for Eli, who is the explainer. Fine.
- **04-enums-vs-unions.md:35** — "It's an immediately invoked function expression, or IIFE." — minor; the acronym expansion is a glossary sentence, but Eli is a teacher. Keep or cut "or IIFE".
- **04-enums-vs-unions.md:62** — Guy: "The symbol and the stored value have different jobs." — **minor** (documentation sentence, a slightly stiff turn for Guy). Consider "I can rename the member and keep the string we store."
- **04-enums-vs-unions.md:113-115** — Linoy's ambient-const-enum speech. **minor** (clarity/pace). Three paragraphs before the consequence. Lead with the consequence: "Consumers with isolatedModules can't read it."
- **04-enums-vs-unions.md:123** — the handbook link line is a footnote in the debate; fine, but it's the only link in the chapter that sits in a narrative sentence. Minor.
- **04-enums-vs-unions.md:176-178** — `Color["red"]` error: verified with TS 7.0.2 — `TS2551: Property 'red' does not exist on type 'typeof Color'. Did you mean 'Red'?` Matches. Runtime `undefined` claim is correct (string enums have no reverse map).
- **04-enums-vs-unions.md:181** — Daniel: "we can build the reverse object ourselves... That's StatusCode." Then the code at 187-204 uses a new `const HttpStatus = {...} as const` object, not the enum from 138. Prose and code switch the referent of `HttpStatus` without a sentence saying so. **minor** clarity. Fix: "Here it is as a plain object."
- **04-enums-vs-unions.md:185** — Daniel: "The assertion promises that shape; it doesn't check it. Here we can inspect the entries we're swapping:" — **good**; echoes ch2 with a clean callback. Keep.
- **04-enums-vs-unions.md:245** — Oded's line is good. Keep.
- **04-enums-vs-unions.md:315** — "After all the cases return, no possible status should be left. That's what the assignment to `never` checks. Add a fourth status without a case and that assignment fails in either version." — **minor** narrator-explains-code. Accurate; fine.
- **04-enums-vs-unions.md:344** — "Adding a status can't leave it out of the dropdown." Strong claim; true only if the dropdown uses `Object.values`. The next sentence is fine. Minor: qualify with "if the dropdown reads the list from the enum".
- **04-enums-vs-unions.md:400-401, 407-408** — verified: `const localStatus: Status = fromSdk` compiles and `sendToSdk("active")` fails with TS2345. Claims at ch4:401 and ch4:407 are accurate.
- **04-enums-vs-unions.md:371-373** — `Object.values(Direction)` returns eight entries in the order shown. Verified logic (integer keys first). Accurate.
- **04-enums-vs-unions.md:437** — Verdict: "For new code, default to a string literal union; ... A team that can maintain an enum but cannot yet maintain the alternative may choose the enum, even for a new service." Clear, honest, earned by the Turn. Good.
- **04-enums-vs-unions.md:441-448** — table: consistent with the debate. Row 446 "Include migration, reviewer availability and on-call familiarity in the cost" — good, this is Sahar/Guy's point. Keep.
- **04-enums-vs-unions.md:490-491** — Shape 4 comment "When the team can maintain it more readily than shape 2" — consistent with the Verdict.
- **04-enums-vs-unions.md:501** — Noam: "Either gives us a runtime check; choosing a type declaration doesn't." Good. The Zod claim (`z.enum(SdkStatus)` accepting a TS enum in Zod 4) — I believe this is correct; not verified (no Zod installed in verify). Mark as unverified.
- **04-enums-vs-unions.md:503** — Guy's additional take: "When Oded says the Java team finds enums familiar, that gets them started." — Oded said it at ch4:64. Good callback.

**Cross-book:** this chapter's "Oded: Four hundred enums across twelve services." Eden's "400 API calls" in ch2:96 is a separate number; not a conflict.

**Story.** The Turn is earned: Sahar's "why not teach it?" is answered by Guy's "someone has to maintain it while they're learning", and the verdict lands on the team's situation. Plausible: Oded does not get a rewrite.

**Grade ch4: A-.** Best-balanced chapter so far. Enjoyed: Oded/Guy on the dropdown, Sahar/Guy Turn, Gil's build question. Bored: the `const enum` speech and the reverse-map build.


### Chapter 5: The Guard at the Gate (01-the-type-system/05-narrowing-strategies.md)

**Voice and fun.** The narrowing material is dry, but the people save it. Noam "tries removing the check, then restores it." (ch5:259) is the best physical beat in the chapter. Noam's "The check was doing its job. I should have shown the handler too." (ch5:207) is a rare, honest concession, and it is in character. Idan's "Drop the email check from parseUser. The input.email read in the return object no longer compiles... That's why I build the value." (ch5:257) is the chapter's clearest argument. Gilad's "Same failure. Same details. What happens next?" (ch5:420) is a good Turn move. Guy's "I'll use your parser." (ch5:273) is a real concession. Idan's closer "Show me the handler before you pick .parse." (ch5:453) is the right kind of closer.

**Where the fun dies.** The first half (ch5:46-100) is a checklist of `typeof`, `in`, `instanceof` and truthiness, each with a caveat, and the characters take turns reciting them. It reads like a reference page with dialogue tags. The discriminated-union section (ch5:304-354) is also an inventory. The Zod section (ch5:358-396) is a library tour with a single debate point. Cut the first half to three checks.

**Principle.** Not a stated rule. The Principle (ch5:5-42) demonstrates control-flow narrowing, and the chapter's actual claim (narrow with a check the compiler can see, and do not let a predicate or assertion promise more than its body checks) is only implied across the chapter and never written as a rule. Against the book's standard ("the Principle section needs an explicit testable rule up front"), this is a major problem. Fix: put one sentence at the top of the Principle, e.g. "A narrowing check is only as strong as what the compiler can see it check; a predicate or assertion is a promise that the body keeps." Then show the `!= null` and predicate examples as evidence for it.

- **05-narrowing-strategies.md:40** — Daniel: "For external input, prefer building a typed value from the fields you've checked. The compiler needs those checks before it will let you read the fields and use them in the new object. How a failed check reaches the caller is a separate choice." — **minor**, AI-feel. Three documentation sentences in Daniel's mouth. The first sentence is the chapter's actual claim and is stated in a register no one in the room would use. Consider cutting the middle sentence.
- **05-narrowing-strategies.md:50** — Linoy: "There are a few runtime details you have to remember." — minor; a narrator-ish sentence. Fine.
- **05-narrowing-strategies.md:84-89** — `isResponse` comments: "True for any object that has error anywhere on its prototype chain — including a class instance whose class defines a method called error. Also doesn't check that x.error is a string — double-unsafe by design, exactly the kind of unchecked promise we're warning about." — **minor**: the "double-unsafe by design" phrase is an in-book self-reference to the chapter's point; a code comment that announces the lesson is AI-feel. Cut the last clause.
- **05-narrowing-strategies.md:107** — Noam: "I want a named check I can test. This one lets a handler treat its input as a User when it returns true." — good, clear, in voice.
- **05-narrowing-strategies.md:134-136** — Dafna: "Noam. Show me the signature again." Noam: "`function isUser(value: unknown): value is User`." Good shorthand; keep.
- **05-narrowing-strategies.md:153** — Daniel: "Since TypeScript 5.5, it can infer a predicate from some function bodies without return annotations. An explicit predicate annotation takes the place of that inference." — accurate (TS 5.5 inferred type predicates). The second sentence is documentation tone; minor.
- **05-narrowing-strategies.md:157** — Idan: "I'd rather have the function return the fields it checked." — good.
- **05-narrowing-strategies.md:199** — Noam: "External input is allowed to be wrong. We should handle that as a result." — good Noam line. Keep.
- **05-narrowing-strategies.md:201-207** — the Guy/Noam exchange about `ApiUser.parse(raw)` is a sound callback to ch2:89-90 (Noam's Zod example says "Throws with a clear error... Where you can handle it."). Keeps the book connected. Good. Note the ch2 code said "At the boundary. Where you can handle it." and ch5 Guy quotes that phrase correctly.
- **05-narrowing-strategies.md:278-283** — Dafna's discriminated-union paragraph: "If I add { kind: 'retrying'; ... } without handling it, this function's : string return annotation catches the missing return." — accurate. Good.
- **05-narrowing-strategies.md:329** — Idan: "Our request module publishes state changes through an in-process event bus. The receiver gets unknown, so check the tag and payload together. Here an error event carries an actual Error object." — the exposition is a good Idan line but the second sentence is a note-to-reader; fine.
- **05-narrowing-strategies.md:362** — Linoy: "Valibot and ArkType are other options if we're evaluating libraries, but that's another PR." — good Linoy line; the "PR" aside is the team's voice. Keep.
- **05-narrowing-strategies.md:366** — Linoy: "Here's the same user shape. I've also required an email address rather than just a string." — fine. But "the same user shape" is not the same: the Zod schema drops `displayName`? No; it keeps `id`, `email`, `displayName`. Fine.
- **05-narrowing-strategies.md:388** — Linoy: "No. This version replaces it with z.infer<typeof UserSchema>." — good. But the Zod snippet redefines `type User` after the handwritten `type User` at ch5:110 in the same chapter. Acceptable as a replacement; the narration explains it at 386-388.
- **05-narrowing-strategies.md:434-436** — "The Debate Continues" — honest open ending, appropriate. But 436 is a narrator summary paragraph ("Idan and Dafna prefer... Guy prefers... Both versions above produce...") that restates the chapter. The brief's honest open ending is fine; the register is the Verdict's register rather than a character's. Minor. Keep, but trim to two sentences.
- **05-narrowing-strategies.md:438-447** — The table is useful as a decision aid, but it is a Verdict in disguise inside a chapter that promised none. Row 441 "Show where errors are caught and which errors the handler recognizes" reads as a checklist. Minor.
- **05-narrowing-strategies.md:449-453** — Oded/Guy/Idan closers. Idan's "Show me the handler before you pick .parse." is the right final beat.
- **05-narrowing-strategies.md:459** — Eden: "I would migrate the checks first... Those are separate changes; I'd like to review them separately." — good Eden voice; it fits his bio (migration path). Keep.

**Pronouns and bios.** Idan (she) is consistent: no misgendering in this chapter. Idan's bio-stance (parse at the door; not the function name `isUser`) is shown (ch5:157, ch5:213, ch5:225) — good. Guy's "Has existing handlers to maintain. Idan keeps finding callers outside them." is dramatized at ch5:294-300 — good.

**Story.** The Turn (Gilad's identical-input test, ch5:402-430) is a real turn: the two parsers produce the same details, so the argument moves from correctness to who decides. Plausible and fair. Guy's "I have a request we can't fulfill" (ch5:426) is his best line here.

**Cross-chapter:** `RequestState<T>` uses `status` in ch3 (ch3:267-271, Dafna's `renderProfile`) and `kind` in ch5 (ch5:309-313, Dafna's `describeRequest`). The same named type, same speaker, two chapters apart, different discriminant. Minor inconsistency; pick one tag.

**Grade ch5: B-.** Careful and fair, and Idan's material is the strongest in it. Sags badly in the first half (inventory of checks), and the Principle never states its rule. Enjoyed: Noam/restoring the check, Idan's "build the value", Gilad's identical-input Turn, Idan's closer. Bored: the typeof/in/instanceof list and the Zod tour.


### Chapter 6: The Hole in the Function (01-the-type-system/06-generics-basics.md)

**Voice and fun.** Good. Oded's "Finally. A refactor that deletes something." (ch6:99), Daniel's "Don't turn it into a search-and-delete rule yet." (ch6:101), Eden's "T inferred as null. Forever." (ch6:214, code comment), Oded's "I know where to look when payroll calls." (ch6:165), Dima's "So you agree about what the generic does. You disagree about when to introduce it." (ch6:63), Idan's "Now I can't even find the unchecked claim by searching for `as`." (ch6:264). These are human, specific, and in bio.

**Principle.** Strong, and the only rule in the book so far that is stated at a usable level: "Use a type parameter when a caller needs a relationship between types in the signature... If only the caller's chosen type supplies a return-only T, with no check to establish it, treat that as an assertion." Line 22 ("This rule tells us what the signature promises, not when to generalize") is good and honest. Keep this as the model for the other chapters' Principles.

**Where the fun dies.** The Liron lens/photograph Turn (ch6:309-323) explains its own metaphor in its own sentences, and the Verdict's table (ch6:333-341) repeats the chapter in seven rows. The `loadState` "Danger" example (ch6:355-359) repeats the `parseConfig` lesson from ch6:241-262 almost word for word.

- **06-generics-basics.md:53** — **minor, clarity.** `"I passed strings. Why am I checking the element's type again? I only need to handle the empty list."` follows Noam's code block with no speaker tag, so the reader takes it as Noam. Its content is Oded's objection, and Oded's line at ch6:55 continues it. Add the speaker.
- **06-generics-basics.md:228-232** — **major, clarity / story.** The exchange is incoherent. Eden says he writes explicit return types on exported functions (about `createStore`). Linoy replies "That's the return type you publish, though. You still wouldn't make callers write both type arguments to `get`." — `get` has not come up in this part of the chapter. Eden answers "No. The object and key tell it enough. The store's first value didn't." Eden answers a question nobody asked. This reads like two generated turns that were not connected. Fix: cut Linoy's line and Eden's "No." and keep Eden's "The store's first value didn't" as the reply to the `createStore` point, or move the return-type tangent to the Verdict table where row 341 already says it.
- **06-generics-basics.md:309-313** — Liron's lens/photograph parable. The image is good, and the third paragraph ("The generic is useful when the relationship survives a change of subject...") is the right point. Two paragraphs earlier would do. Minor.
- **06-generics-basics.md:319** — Liron: "You are right to ask — the image only gets us so far." — formal; Liron is warm and direct elsewhere. Minor. "Fair question. The image only goes so far."
- **06-generics-basics.md:323** — Liron: "Then you and Noam still have a review to finish." — good; Liron's closing line in the Turn is a real piece of deferral.
- **06-generics-basics.md:329** — Verdict prose: "Noam would keep sortByName ... Oded would keep sortEmployees ... The relationship test does not decide that timing question." — **good**, honest, earns the open point. Keep.
- **06-generics-basics.md:336-341** — table is accurate and consistent with the debate. Seven rows is one row too many: the "Explicit type arguments vs inference" row (341) is the Eden tangent again. Minor.
- **06-generics-basics.md:358** — code comment `// any → T: no relationship, no evidence — and no cast required.` — accurate, but it repeats ch6:262. Minor redundancy.
- **06-generics-basics.md:364** — Linoy: `const T` introduced "in 5.0" — accurate (TypeScript 5.0 const type parameters). Good.
- **06-generics-basics.md:366** — Linoy on `NoInfer` "from 5.4" — accurate. Example verified by reasoning: `setDefault(["red","green"], "blue")` is rejected with `NoInfer`, and accepted without it. Keep.
- **06-generics-basics.md:370** — Eli's closer: "We can also compute with that type variable: branch on it, walk an object's keys, build another type from it." — a tidy triplet and a teaser that the next act will deliver (conditional, mapped, template types). Fine for Eli. Minor.
- **06-generics-basics.md:245-249** — the `parseConfig<{ retries: number }>('{"retires": 3}')` runtime claim: `config.retries` is `undefined` and `.toFixed` throws a TypeError. Accurate. The comment says "reading `.toFixed` off undefined throws a TypeError" — correct.
- **06-generics-basics.md:82** — Daniel: "`JSON.stringify(undefined)` returns `undefined`, although the library declares `string`." — accurate with the TS lib's `string` return type. Good technical detail, in his voice.
- **06-generics-basics.md:111** — Daniel: "`querySelector`. The DOM lib calls the parameter `E`." — accurate. Good.

**Cross-chapter.** `ParseResult<T>` is defined in ch5 with `{ ok; value } | { ok; reason; input }` (ch5:232-234) and again in ch6 (ch6:277-279) with the identical shape. Fine. Ch6 cites ch5-style parsers without saying so; a reader who skipped ch5 is lost at ch6:270-295, but the chapter is written to be read in order.

**Idan's voice (ch6:254-268, 301, 368).** Consistent with bio: "Delete the cast, Daniel." and "It describes a slot we fill with RetryConfig." Good.

**Grade ch6: B+.** The best Principle so far and a clear debate about `T`. Enjoyed: the `logPayload` removal argument, the DOM `querySelector` answer, Eden's `createStore`, Idan's `parseConfig` cast removal. Bored: the Liron Turn and the Verdict table.


### Chapter 7: The Fork in the Type (02-advanced-typescript/01-conditional-types.md)

**Voice and fun.** The first and last debates are the best in the chapter. "Types can do ternaries?" / "Since 2.8." / "Nobody told me." (ch7:73-77) is the book at its funniest. Eden's "Overloads... No T. No question mark. The hover tells a human being what to pass." (ch7:112), Oded's "So it lies, but it only lies in one place... That's most of my architecture." (ch7:251), Noam's "I blocked that deploy for six hours. Six hours." (ch7:291, callback to his bio), Oded's "There's a loop. In the type. That nobody mentioned." (ch7:358), Oded's "I'm keeping those. I don't have to maintain Exclude." (ch7:368) and Chen's "Ask it directly." (ch7:396) are real voices. The `Exclude` reveal (ch7:307-368) is a true turn of delight and is the best single section in the book.

**Where the fun dies.** "What happens at the edges?" (ch7:372-473) is nine code blocks of `never`, `any`, distribution and tuple wrapping, with Linoy and Daniel trading mechanics. A reader who came for Oded's ternary joke is lost by ch7:400. "Who reads the error?" (ch7:477-495) is the right pivot (a real cost) and then drops into NonNullable (ch7:497-515), which is a different chapter's material. Consider cutting the `any` and tuple material to one example and moving NonNullable to the Verdict's table.

**Principle.** Clear and testable: "If a value of type T would be accepted where a string is required, the result is the first branch. Otherwise it is the second." (ch7:17). Good. It also picks up Daniel's ch6 "extends has another job" callback (ch7:7). Keep.

**The book's own promise, not kept.** Ch1 said the `any` result "will get their own debate" (01-any-vs-unknown.md:276). Ch7 does not deliver it. It defers it to the Additional Takes: "We still owe `Unwrap` an explanation... I'm going to need the board for that one." (ch7:600). That is a process admission in a character's mouth, and the infer chapter (ch9) is the place for it. Major. Fix: cut Linoy's line, or change it to "That's chapter 9" and let it go.

- **01-conditional-types.md:600** — "We still owe `Unwrap` an explanation." — **major**, AI-feel / clarity (editorial leak). See above.
- **01-conditional-types.md:390** — Linoy: "So unions distribute, `never` vanishes—" — cut off with an em dash, then Chen interrupts (ch7:392). Good rhythm. Keep.
- **01-conditional-types.md:350** — "That is the entire mechanism of type-level filtering: the members you want gone come out as `never`, and reassembly drops them." — **minor**. The summary closer after a good explanation; the reader has it already. Cut "That is the entire mechanism of type-level filtering:".
- **01-conditional-types.md:348** — "The rule has a bureaucratic name — distributive conditional types." — nice. Keep.
- **01-conditional-types.md:17** — Eli: "That is the whole of the syntax." Fine in Eli's voice.
- **01-conditional-types.md:98** — Eden "has had his arms folded for the whole exchange." — **minor**. Arms-folded is Chen's signature in the bio (`Arms crossed`). Give Eden another gesture.
- **01-conditional-types.md:112** — Eden: "The hover tells a human being what to pass." — strong, keep.
- **01-conditional-types.md:172-188** — Oded "deletes the three overload signatures", then Linoy "You passed a string. Now you have to check whether you got one back." Eden: "That's why the first two stay." Oded "undoes the deletion." — **minor**, clarity. Eden says "the first two stay", which means the union overload should go. Oded then restores all. The exchange does not follow. Fix: Oded deletes only the union overload, or Eden says "That's why the union stays."
- **01-conditional-types.md:291** — Noam: "You said that about the helper with `as any`. I blocked that deploy for six hours. Six hours." — good callback, matches bio (Noam "blocked a deployment for six hours because he found a single `as any` buried in a utility function"). Keep. Note the bio says "Oded argued it was 'fine, it's just a helper'". ✓ consistent.
- **01-conditional-types.md:301** — Oded: "You put my name on this PR, didn't you?" — fun. Keep.
- **01-conditional-types.md:364** — Oded: "Two hundred and six Excludes and Extracts. I ran an audit last month, after we looked at logPayload — deleted eleven generics that weren't doing anything, felt terrific about it." — callback to ch6 logPayload (ch6:99 "Finally. A refactor that deletes something.") ✓. Good.
- **01-conditional-types.md:396** — Chen: "Ask it directly." Good.
- **01-conditional-types.md:415** — Daniel: "Wrap both sides in a one-element tuple" — only the checked side needs wrapping to stop distribution (`[T] extends [U]`); wrapping both is a common pattern but the sentence should say what the mechanism is. Minor technical clarity.
- **01-conditional-types.md:427** — unattributed explainer about `[any]`. Speaker missing; reads as narrator. Minor.
- **01-conditional-types.md:434** — "Against `unknown`, as here, or `any` itself, it takes the true branch. Keep the actual condition attached to the example." **Verified with TS 7.0.2**: `any extends unknown ? "ran" : "no"` is `"ran"`; `[any] extends [string]` is `"ran"`. Accurate.
- **01-conditional-types.md:450** — Chen: "Misspell a case in a `switch` and the exhaustiveness check from the enum argument screams at you." — callback to ch4 exhaustiveness. Good.
- **01-conditional-types.md:459-460** — `StrictExclude<Channel, "smss">` error: verified, TS2344 "Type '"smss"' does not satisfy the constraint 'Channel'." Accurate.
- **01-conditional-types.md:469** — Linoy: `Exclude<Mixed, string>` / `StrictExclude` rejects it. **Verified**: `StrictExclude<Mixed, string>` errors (TS2344). Accurate.
- **01-conditional-types.md:479** — Eden's anecdote: "A junior on my team lost an afternoon to a conditional type in a component library... I approved that PR, and I couldn't explain the message either." — strong, human. Keep.
- **01-conditional-types.md:483, 489** — two unattributed speech lines (483 "Yes. They passed. This was an invalid call...", 489 "We did. Someone still has to keep those examples up to date.") — speaker missing; it is Eden's. Minor clarity.
- **01-conditional-types.md:495** — Gil: "Then we have an unreadable error. We haven't measured a slowdown." — good Gil. Keep.
- **01-conditional-types.md:499** — Daniel: "There is a simpler representation to consider before you add tests and documentation around a conditional. Sometimes you can remove it." — good, practical.
- **01-conditional-types.md:509** — Daniel's explanation of `T & {}`: "The intersection also simplifies where an unresolved conditional cannot, which makes it easier for the checker to relate generic types." — manual register; correct in substance. Minor.
- **01-conditional-types.md:513** — "For unknown, the old definition returned unknown. The new one returns {}." **Verified** (`NN<unknown>` vs `Old<unknown>` — `Old<unknown>` accepts 5, so unknown, consistent). Accurate.
- **01-conditional-types.md:515** — "The change and its effect on generic assignability are described in the TypeScript 4.8 release notes." — fine; this is a footnote-style sentence in the middle of a chapter. Minor.
- **01-conditional-types.md:523-527** — Turn opener: Dafna "That's a filter." Oded "I use filter." Dafna "Then use Exclude. Someone already wrote it." Linoy "Someone has to write the utilities." — fun, but the Turn is not the real turn; it's the Chen question at ch7:533 ("What does the next function do with the tags?"). Dafna's line is an aside. Minor structure issue: the Turn opens on a joke and the real turn follows Chen. Fine.
- **01-conditional-types.md:529** — Eden "Fine. I still want the overloads on this function." — keep.
- **01-conditional-types.md:543-557** — Chen/Linoy about brackets and tags — clean and real. Good Turn content.
- **01-conditional-types.md:578-580** — Linoy: "I have library callers that don't get to normalize their input first." Eden: "Bring those. I'll bring the overloads." Good ending. Keep.
- **01-conditional-types.md:584** — Verdict's first sentence is a ruling for this pipeline; second is a general rule; third is a shrug: "Choose based on how clearly you can describe and maintain the relationship." Earned. Good.
- **01-conditional-types.md:588-594** — table consistent. Row 589 "Does reuse make the API easier to maintain and understand?" — question-style; fine.
- **01-conditional-types.md:596** — "A union caller alone does not settle their disagreement." — **minor** clarity: what is a "union caller"? Reword: "Callers who only need a union don't settle the disagreement either."
- **01-conditional-types.md:602** — Noam: "A check that the resulting union is exactly what you intended catches that typo." — wording ok. Noam's test-the-type-utilities point is good and in voice.
- **01-conditional-types.md:604** — Gilad: "Paste a bad call and its error into the PR. Let the next reviewer tell you how to fix the call." — Gilad's additional take is the weakest of his lines; it does not say what happens at 3 AM. Minor. Consider: "Paste the error into the PR so the on-call engineer has it too."

**Length.** 604 lines, the longest debate so far. The chapter has four strong debates and one long tail. Cut the `any`/tuple tail (ch7:372-434) to a paragraph and it is the best chapter so far.

**Cross-book.** Ch7's `Exclude` section (ch7:307-368) is the chapter where "conditional types" become a delight; it pays off ch6's `logPayload` and ch4's exhaustiveness check. Good cross-chapter payoff.

**Story.** The Turn (Chen's question about tags, ch7:531-557) is a real turn and the normalization that follows is plausible and fair to both sides. Good.

**Grade ch7: B+.** Best "aha" in the book so far. Enjoyed: "Types can do ternaries?", the overload-vs-union arc, Exclude reveal, Eden's error anecdote, Chen's tags question. Bored: the `never`/`any`/tuple tail (ch7:372-434) and NonNullable (ch7:497-515).


### Chapter 8: Who Owns the Fields? (02-advanced-typescript/02-mapped-types.md)

**Voice and fun.** Strong, specific, and grounded in a real-feeling PR review. Oded's "I was looking for a word like Mutable. You put a minus sign on readonly." (ch8:259), "I'm going to keep looking for Editable." (ch8:263), Linoy's "We don't have a password box hiding in there." (ch8:230), Eden's mobile-team anecdote about the Save button (ch8:176), Guy's "I can make that promise. I couldn't make it about the record and the request." (ch8:398), Oded's "without choosing an innocent text box to blame" (ch8:416), and Oded's closer "Put that in another PR." (ch8:460) are all in character. The scene-first opening is good.

**Where the fun dies.** The middle of the chapter (ch8:152-226) is a long run of type aliases with a comment after each. "The same field changes" plus "Let me save the biography" plus "The Turn" is roughly 300 lines of mapping modifiers, error types and labels. The reader is in the type file for a long stretch and the argument (Guy: contract as the source; Linoy: derive from the model) is stated once and then re-stated in every section. Trim the `FieldErrors`/`Labels`/`FormErrors` run (ch8:346-414) to one example.

**Principle.** Missing. The opening (ch8:5-41) is a scene that ends in a mechanical explanation of `Partial` by Daniel ("That's a mapped type."). No rule is stated. A developer cannot say after one read what the chapter claims about mapped types. Major (book rule: Principle must state a testable rule up front). Fix: one sentence at ch8:21 or before, e.g. "A published request type should be written out once; a derived type should be built from the model only where the model's changes must follow it." Then let the debate test that.

**Verdict.** A recap, not a ruling (ch8:420-422). It lists what the chapter did ("The published request keeps its three explicit properties... Submission failures appear above the inputs.") and then splits the team without saying what decides it. Major. It also reads like an editor's summary, which is the brief's "summarises instead of saying something" pattern. Fix: state the rule the team agreed on (e.g. "Write the published contract out; derive only the form, and test every derived key set against the contract"), then the open point (whether shared definitions for co-changing fields are worth a new file).

- **02-mapped-types.md:420** — "The published request keeps its three explicit properties. The form derives writable, required values from that contract, then submits only changed fields. Labels and field errors follow the form's keys. Submission failures appear above the inputs." — **major**, AI-feel / Verdict. Recap, four sentences, no judgement. See above.
- **02-mapped-types.md:422** — "Her alternative remains in the review thread." — **minor**, AI-feel / process leak. The "review thread" is the chapter's own in-world object (ch8:226), but in the Verdict it reads like a summary of a file. Cut the sentence or say what the alternative is.
- **02-mapped-types.md:226** — "Linoy leaves her repaired version in the review thread. Guy restores the published request definition and runs the same null-rejection check against it." — **minor**. Good in-world detail, but the stage-direction register repeats the Verdict. Keep one.
- **02-mapped-types.md:21** — Daniel: "`keyof T` gives us the keys. `P` takes each one in turn. `T[P]` is the type of the property at that key, and the question mark makes it optional. That's a mapped type." — **minor**, AI-feel. The sentence list is a textbook gloss in Daniel's voice. Daniel's bio likes dry quips; give him one. Fine to keep the mechanics; cut "That's a mapped type."
- **02-mapped-types.md:39** — Daniel: "Most people don't. It gets more work done that way." — **minor**. Ambiguous joke; the reader does not know what "it" is. Fix: "Most people don't. It's the standard library. It works."
- **02-mapped-types.md:93** — code comment "Both request types currently accept the same shapes." — fine.
- **02-mapped-types.md:105** — Linoy: "This time we walk the keys in K. They have to belong to T. Write `Pick<User, "emali">` and the declaration fails. Rename `email` in the model and it tells me to fix the selection. Your handwritten `email: string` could sit there forever." — strong and accurate; it's Linoy's voice. Keep.
- **02-mapped-types.md:126** — Daniel: "Same object. A fresh literal with roles would get an excess-property error. This variable passes. `Pick` hasn't removed anything at runtime. Keep the parser with either definition." — accurate (excess-property check on fresh literals), good. Keep.
- **02-mapped-types.md:142-146** — `strict` alone vs `exactOptionalPropertyTypes` — accurate. Good Daniel technical beat. Keep.
- **02-mapped-types.md:169** — comment "Error: null is not assignable to string." — minor technical: under `exactOptionalPropertyTypes` TS says `string | undefined`. Change to "not assignable to string | undefined" or say "to string".
- **02-mapped-types.md:176** — Eden's mobile anecdote. Good. Keep.
- **02-mapped-types.md:188** — comment "The repaired derivation and the existing contract agree again." — good.
- **02-mapped-types.md:203** — `@ts-expect-error` "available since TypeScript 3.9" ✓ accurate.
- **02-mapped-types.md:210** — Linoy: "If someone lets null back in, that line stops producing an error and the directive fails the build." ✓ accurate.
- **02-mapped-types.md:218** — Linoy: "You can also read three stale fields." — "stale" is an odd word here (the fields aren't stale; she means they can go out of date). Minor: "You can also read three fields that might drift."
- **02-mapped-types.md:234-243** — Oded: "I tried using your EditableFields. I can't edit them." — the error "displayName is readonly" ✓ accurate. Good.
- **02-mapped-types.md:246** — Daniel: "`Pick` preserves the modifiers, and `Partial` keeps `readonly`..." ✓ accurate.
- **02-mapped-types.md:259-263** — Oded/Linoy modifiers — ✓ good banter.
- **02-mapped-types.md:296** — Linoy: "It's empty. The validator checks every input before we build the request." — Good.
- **02-mapped-types.md:300** — Eden: "They need to be able to edit their profile before they have an address. That's part of the import." — strong, Eden. Keep.
- **02-mapped-types.md:306** — Linoy: "Validation runs too early. I'll validate the patch we're actually sending." — the real turn of the middle section. Good. Keep.
- **02-mapped-types.md:330** — Linoy's answer about patch semantics — good.
- **02-mapped-types.md:356** — Linoy: "The last deletion. Same field names, messages for values." — "The last deletion" is wrong: she is adding a new type, not deleting. Likely means "the last one in the diff". Fix: "The last type. Same field names, messages for values."
- **02-mapped-types.md:358-360** — Guy/Linoy on `T[K]`: "Every field gets string[]... Only the keys come across." ✓ clear. Good.
- **02-mapped-types.md:364** — Guy: "So the email change we just tried wouldn't spread into this one." — "the email change we just tried" is unclear (the override? the form patch?). Clarify: "So a change to the email type wouldn't reach the errors."
- **02-mapped-types.md:370** — Linoy: "Just keep the keys. Record<string, string[]> lets emali through." ✓ accurate and sharp. Keep.
- **02-mapped-types.md:390** — Guy: "I'll take that check. Add a field and someone has to add its label." — good.
- **02-mapped-types.md:394** — Linoy: "This won't catch it. An empty error object still compiles. We'll need a test for the new input." — honest. Keep. This is a good sign of the book's better writing.
- **02-mapped-types.md:398** — Guy: "The labels belong to these inputs. I can make that promise. I couldn't make it about the record and the request." — this is Guy's best line in the chapter. It is also the chapter's rule in embryo. Good, and it should be in the Principle (see above).
- **02-mapped-types.md:437-448** — Noam: "And don't put Readonly around the form container and tell me you've locked the draft." — in voice. Accurate (the inner object is mutable). Keep.
- **02-mapped-types.md:458** — Linoy: "For id, it produces never in the key position, so that property disappears. Put never after the colon and you'd still have the property." — accurate. Good.

**Cross-book.** "Eli had promised 'types that walk an object's keys'" (ch8:13) is a callback to ch6:370 ✓. "There's our Exclude again" (ch8:458) callback to ch7 ✓. Good cross-links.

**Story.** The Turn is a small mechanical beat (the `FieldErrors` type) rather than an argument turn. The real turn is ch8:306 ("Validation runs too early"). Consider moving the turn label to ch8:306 or restructuring so that the Turn is the "validation runs too early" discovery. Minor.

**Grade ch8: B.** Sharp characters; the form/PR premise is credible. Principle and Verdict are both weak, and the middle is long. Enjoyed: Pick/Omit debate (ch8:105-126), Eden's anecdote, the `readonly` banter, "Validation runs too early". Bored: the labels/errors run (ch8:346-414).


### Chapter 9: Where Did This Event Come From? (02-advanced-typescript/03-template-literal-types.md)

**Voice and fun.** One of the funniest chapters in the second act. Daniel's "You made fourteen part of the type. It has been very loyal to fourteen." (ch9:435) is the best line in the chapter and in character. Oded's "I have survived that before." (ch9:254), "I'm asking the repository. You're not always going to be sitting here." (ch9:151), "I had to ask you where here was." (ch9:175), and "Then you're spelling them yourself." (ch9:332) are real. Gilad's "Now I have two places to inspect. I still don't know which one produced my line." (ch9:215) is right for his bio. The `rg` search as a running device works well: the search result at ch9:144 and again at ch9:376-379 is a satisfying callback.

**Where the fun dies.** The same question (wrapper vs literal names; "where do writes come from?") is asked three times: "That found the person listening" (ch9:138-224), "Put the names somewhere" (ch9:225-262), and "The Turn" (ch9:328-387). Each one ends with Oded keeping the setter and Linoy saying the same thing. Merge two of them. The audit-viewer section (ch9:264-326) is a separate, good mapped-type example that arrives after the verdict-level argument has been settled, and the reader has to re-enter a new problem. Move it to the Additional Takes or cut it to the flat list.

**Principle.** Missing. Like ch8, the chapter opens on a scene (Oded and Linoy about a second PR, Gilad's pasted log line), and Daniel gives a definition ("That's a template literal type") rather than a rule. No testable claim is stated up front. Major. Fix: one sentence before ch9:51, e.g. "A set of event names that can be derived from a set of keys should be derived once, and the derivation should be the only place the name is spelled."

**Verdict.** A recap, not a ruling (ch9:391-393). Same problem as ch8. Line 391 lists what the PR keeps; line 393 lists who prefers what. The useful sentence is the last one of 393 ("Neither the search result nor the signature tells Gilad which path ran in a particular session."), which is the honest open point, but it lands at the end of a paragraph of inventory. Major (Verdict is a summary). Fix: lead the Verdict with the rule and close with Gilad's point.

- **03-template-literal-types.md:391** — "The PR keeps the template-typed signatures and the generic setter. Ordinary controls update a property through setSetting, which constructs the event name. Restore continues to update the complete state before publishing, with literal names at its three emission sites. The preview still receives a number for fontSizeChanged." — **major**, AI-feel (recap). Four sentences of what happened on the page.
- **03-template-literal-types.md:393** — "The registry stays in the review as an alternative." — **minor**, clarity. Which registry: the `eventNames` object? Say so.
- **03-template-literal-types.md:9** — "Linoy's new branch applies her idea to the display preferences" — minor; "her idea" is the naming pattern from ch8. Fine.
- **03-template-literal-types.md:31** — Daniel: "Start here. The backticks in this line describe our event names." — OK; a bit cute. Keep.
- **03-template-literal-types.md:51** — Daniel: "SettingKey has three members. Substitute each one and you get themeChanged, fontSizeChanged, and autoSaveChanged. That's a template literal type." — accurate. Textbook but fine for Daniel.
- **03-template-literal-types.md:55** — Daniel: "They are. Other objects can have number or symbol keys. Linoy's pattern selects the string ones. Here it doesn't remove anything." — accurate and useful. Keep.
- **03-template-literal-types.md:73** — Oded: "Like we did with user:login. Pick an event, get its payload. This already checks that." — callback to ch1 event system ✓ consistent.
- **03-template-literal-types.md:86** — Linoy: "The as makes the new key. After the colon, T[K] still looks up the old key." — accurate; crisp. Keep.
- **03-template-literal-types.md:90** — Linoy: "If that changes, we select the keys, like we did for the form." — callback to ch8 ✓.
- **03-template-literal-types.md:115-116, 122** — inference of `K` from a template-literal name: `on("fontSizeChanged", ...)` yields `value: number`. Plausible with TS template-literal inference; not run. Unverified.
- **03-template-literal-types.md:129-131** — the typo and `toUpperCase` errors. Consistent with the signatures. Fine.
- **03-template-literal-types.md:143-145** — `rg --sort path -n -F` output format ✓ plausible.
- **03-template-literal-types.md:173** — Linoy: "The template in publish's parameter is a type. This one, inside the function, is JavaScript. This is where the string gets made." — nice. Keep.
- **03-template-literal-types.md:181** — "`saved` has already been parsed into Settings before it reaches the restore function." — consistent with ch5's parse-at-boundary. Good.
- **03-template-literal-types.md:209** — Linoy: "A listener reading the other settings sees the restored values too. That ordering is why restore doesn't call the setter three times." — clear, good reasoning.
- **03-template-literal-types.md:248** — Linoy: "Leave out autoSave and it's an error. Put autoSaveChanged under fontSize and that's an error too." — accurate for `satisfies { [K in SettingKey]: ... }`. Good.
- **03-template-literal-types.md:256-258** — Gilad/Linoy on references — fine.
- **03-template-literal-types.md:278** — Linoy: "Not in that viewer. That combination shouldn't be there." — ok.
- **03-template-literal-types.md:280** — Daniel: "Both substitutions range over both members. You asked for four combinations." — accurate.
- **03-template-literal-types.md:292** — Linoy: "With the allowed actions attached to their entities." — fine.
- **03-template-literal-types.md:309** — Linoy's explanation of the indexed mapped type: accurate. Keep.
- **03-template-literal-types.md:322** — Linoy: "I want to check its props before throwing the grouped type away." — "its props" is odd; "its properties" or "its shape". Minor.
- **03-template-literal-types.md:324** — Oded: "Your settings all have Changed. The audit events already needed a different rule." — good Oded.
- **03-template-literal-types.md:346** — Linoy: "You can. And my wrapper still uses it to check a constructed name." — OK but reads like Linoy restating; minor.
- **03-template-literal-types.md:397-405** — Daniel's `publish<SettingKey>("fontSizeChanged", false)` compiles — accurate (union K widens value). Linoy's answer accurate. Good Additional-take technical beat.
- **03-template-literal-types.md:405** — Daniel: "You can also arrive there with independently widened variables." — good.
- **03-template-literal-types.md:409-419** — `SettingsChange` discriminated union, `badChange` error ✓ accurate. Keep.
- **03-template-literal-types.md:422** — Daniel: "Don't split it back into two independent unions at the next function." — good advice, Daniel voice.
- **03-template-literal-types.md:426-433** — Oded's defaults; `DefaultEvents["fontSizeChanged"] = 16` errors "expected 14" ✓ accurate.
- **03-template-literal-types.md:437** — Linoy: "`as const` was useful for our fixed status codes." — callback to ch4 ✓.
- **03-template-literal-types.md:441-445** — `Capitalize` ✓ accurate.
- **03-template-literal-types.md:450** — Linoy: "Scratch file. You can approve the other tab." — "approve the other tab" is an odd phrase; "You can look at the other tab" reads better. Minor.
- **03-template-literal-types.md:424, 439** — two `---` separators inside Additional Takes that break the section into unlabelled pieces. Minor structure.

**Pronouns.** Gilad, Oded, Daniel, Linoy used correctly. Gilad has no pronouns in this chapter.

**Cross-book.** Ch9 "publish" and "on" in `src/events.d.ts` and ch1 "on(event, handler)" share the `user:login` example (ch9:73) — good. Ch9's `fontSizeChanged` and ch8's `emailChanged` are the same pattern; intentional.

**Grade ch9: B.** Funny and clear, with the best runnable-feeling demonstration of template literal types. Sags because it argues the same point three times and ends on a recap. Enjoyed: the rg search callbacks, Daniel's fourteen joke, the `publish<SettingKey>` widening beat. Bored: the audit viewer and the second "names somewhere" round.


### Chapter 10: The Call You Didn't Make (02-advanced-typescript/04-infer-keyword.md)

**Voice and fun.** The chapter has the most vivid bug-hunt in the book. Eden's "Tell that to the tracking page." (ch10:9), "They followed it this morning. The page stopped compiling." (ch10:33), "Oh. It's already wrapped." (ch10:224), Noam's "So the boolean in the editor is a promise at runtime. It's truthy even when it eventually contains false." (ch10:228), Eden's "The SDK ran perfectly." (ch10:230), Idan's "It told us about the overload and believed us about this." (ch10:268), Noam's "`as unknown as`. You'd send that back in a parser review." (ch10:327), Eden's "I'm objecting to having that decision arrive through the wrapper's default." (ch10:394) and Noam's closer "All that, and we're still calling it `Safe`." (ch10:469) all land. Daniel's "Nothing here opens a promise at runtime. Your parcel is still in transit." (ch10:89) is a good line. The chapter pays off ch1, ch7 and ch2's `as unknown as` and the forty-callers number.

**Where the fun dies.** The chapter is the most code-dense in the book. Roughly 180 of 470 lines are code. The `Safe` / `Safe2` / `AsyncMembers` ladder (ch10:99-104, 234-241, 423-438) is three mapped types that differ by one clause; a reader stops tracking which is which. The "We're awaiting a format check" section (ch10:287-334) is a second bug on the same wrapper and reads as a re-run of the first. The Verdict (ch10:398-406) is a scene that goes on into the generated client.

**Principle.** Missing (same pattern as ch8 and ch9). The opening is a debugging scene; Daniel's explanation of `infer` (ch10:85-91) is mechanical and states no rule. A reader cannot say what the chapter claims. Major. Fix: state before ch10:76 something like: "Extracting a function's type takes the last overload and the first branch that matches; a wrapper that rebuilds signatures from that extraction inherits both." Then the debate tests it.

**Missing section: The Turn.** There is no `## The Turn` heading in this chapter. Every other chapter in acts 1 and 2 has one (ch5 uses "The Debate Continues"). The natural Turn is at ch10:196-229 (the bug: `acceptTrackingCode` always accepts) or ch10:335-337 (Eden: "Before we build the configurable version, here's the adapter I meant."). Major (structure). Fix: add a Turn heading at ch10:196 and let it carry the bug reveal.

**Missing ruling.** The Verdict (ch10:396-406) has no blockquote rule and no table. It is a scene: Eden counts call sites, Idan says "A dozen", Eden says "I'd still do it for this client." Noam's line at ch10:406 is the closest thing to a rule ("keep the raw client private, keep the overload tests, and keep the invalid-code case"). Major: it is the only chapter so far whose Verdict is not a stated ruling. Fix: put the rule in the Verdict's first line (e.g., "Derive wrappers from the SDK only where every method has one signature and returns a promise; otherwise write the adapter by hand and test both overloads.") and let the scene follow.

- **04-infer-keyword.md:85** — Daniel: "`infer U` introduces a name inside the pattern we're matching. For Promise<Shipment>, the match gives U the type Shipment. We can use that name in the true branch. For string, the pattern doesn't match, so we take the other branch and return T." — accurate and clear. Good Daniel explanation, but it is a textbook paragraph. Acceptable here since the chapter is about `infer`.
- **04-infer-keyword.md:74** — Eden: "There are two `infer`s in the next line." — the `Safe` alias has them three lines down (ch10:101). Minor: "in that alias".
- **04-infer-keyword.md:91** — "The infer keyword declares that variable in a conditional type's extends pattern..." — a documentation paragraph in the narrator's voice. Minor AI-feel. Cut to the second sentence, or put it in Daniel's mouth.
- **04-infer-keyword.md:107** — Idan's explanation: "For every property, check whether it's a function returning a promise. A is its parameter tuple. R is the value inside that promise. Rebuild the function with the same parameters, returning a promise of our result. Leave the other properties alone." — accurate; Idan's voice is precise. Fine.
- **04-infer-keyword.md:125** — Daniel: "These utilities extract from the last call signature. Your pattern does too." — accurate and a key technical turn; keep.
- **04-infer-keyword.md:135** — Daniel: "The last-signature rule doesn't promise that the last signature covers everything." — accurate. Keep.
- **04-infer-keyword.md:166** — "She puts the implementation beside the type. This SDK has a flat set of required ordinary methods and data properties." — the second sentence is the chapter's scope statement; fine but reads as a note. Minor.
- **04-infer-keyword.md:188** — Noam: "The compiler isn't checking that every transformed signature agrees with that function. You're asserting the relationship." — good.
- **04-infer-keyword.md:206** — "Version five also adds isTrackingCode. It is a local format check: TRK-42 is valid, bad is not." — narrator; fine. Note: "TRK-42 is valid" but earlier `courier.retrieve("TRK-42")` — consistent.
- **04-infer-keyword.md:249** — Daniel: "On 7.0.2 I get a diagnostic for `if (promise)`. Put the `!` back and it compiles." **Verified with TS 7.0.2**: `if (p)` with `p: Promise<boolean>` gives TS2801; `if (!p)` compiles. Accurate. Good.
- **04-infer-keyword.md:251** — Noam: "Then we're still fixing the condition ourselves. It always gets a promise, whether the editor complains or not." — good.
- **04-infer-keyword.md:268** — Idan: "I said the build would tell us. It told us about the overload and believed us about this." — strong line. Keep.
- **04-infer-keyword.md:270-281** — `Unwrap<Promise<Promise<Shipment>>>` → `Promise<Shipment>`; `Awaited` → `Shipment`; `Awaited<boolean>` → `boolean`. Accurate.
- **04-infer-keyword.md:283** — Idan: "Our `Unwrap` removes one `Promise` layer. `await` keeps resolving. The built-in `Awaited` models that, including promise-like values." — accurate. Keep.
- **04-infer-keyword.md:285** — Noam: "The old fallback wasn't wrong for Unwrap. Keeping a string as a string was the point. It was wrong here because the wrapper changed a function that the type said it would leave alone." — good; it's a real turn of logic.
- **04-infer-keyword.md:299** — "She tries a courier-specific version." — "she" is Idan (the preceding speaker). Clear enough. Minor: name Idan to avoid a second-speaker ambiguity, since Sahar just spoke.
- **04-infer-keyword.md:329** — Idan: "The constructor still calls this a Courier, though we've replaced its methods." — "the constructor" means the factory/function; say "The function still declares its result as a Courier."
- **04-infer-keyword.md:333-335** — Idan: "We can make the exclusions one list and derive the type from it—" / Eden: "Before we build the configurable version, here's the adapter I meant." — Idan's thread is dropped without resolution. Minor: a loose end; the "configurable version" is never shown. Either show it or cut the idea.
- **04-infer-keyword.md:337** — "His first piece runs an operation and captures its outcome." — "His first piece" is ambiguous: Eden's; the reader has just read Idan. Minor, but since the Eden/Idan pronouns swap here, say "Eden's first piece".
- **04-infer-keyword.md:351** — Eden: "Pass it a function so the SDK call happens inside the try. This body is checked. No assertion about a Proxy." — strong, Eden. Keep.
- **04-infer-keyword.md:376** — Eden: "raw.retrieve(code, options) wouldn't match either overload when options might be undefined. These two calls do." — accurate and clear.
- **04-infer-keyword.md:400** — Eden: "I started counting forty call sites. That's the wrong number." — OK; it's the book's running "forty" (line 11). Good.
- **04-infer-keyword.md:404** — Eden: "A dozen. More code than your repair. I'd still do it for this client." — good.
- **04-infer-keyword.md:406** — Noam: "Don't replace the wrapper test with 'no assertions found.'" — the quote is unclear; a test that asserts nothing. Reword: "Don't replace the wrapper test with one that asserts nothing."
- **04-infer-keyword.md:419** — Idan: "This generator emits one request object and one promise return per operation. No overloads, no generic methods, no optional methods." — good, specific.
- **04-infer-keyword.md:437** — error `safeRequests(raw)` — **verified**: the inner message quoted ("Type '(text: string) => boolean' is not assignable to type 'never'") matches TS 7.0.2. The outer message the reader sees is 'Argument of type Courier is not assignable to parameter of type AsyncMembers<Courier>'. Fine; the excerpt is the inner line. Accurate enough; perhaps note "Types of property 'isTrackingCode' are incompatible."
- **04-infer-keyword.md:440** — Idan: "The brackets check the whole return union." — terse; "the brackets" refers to `[R] extends [...]`; say so.
- **04-infer-keyword.md:454-467** — Daniel: `ReturnType<typeof keep>` → `unknown` ✓ accurate; `attempt(() => keep({code}))` → `Promise<Result<{code: string}>>` ✓ accurate.
- **04-infer-keyword.md:467** — quoted Daniel paragraph: "Without a particular call, there's no particular T to recover here." — OK. Fine.
- **04-infer-keyword.md:469** — Noam's closer. Keep.

**Cross-book.** Good payoffs: Daniel's `Unwrap` explanation (ch10:76-91) pays the promise made in ch1:276 and ch7:600 — the book kept the promise, so ch7's "We still owe Unwrap an explanation" can now name this chapter (see ch7 note). Eden's "forty callers" (ch10:11) matches ch10:400. The `as unknown as` callback (ch10:327) matches ch2:130. `Awaited` vs `Unwrap` is a clear, honest fix.

**Pronouns.** Idan she (ch10:139, 166, 299, 419) — correct. Eden he (ch10:35, 337) — correct. Daniel his (ch10:76) — correct. Sahar used no pronoun in this chapter, which is fine.

**Story.** The bug reveal (ch10:196-230) is the strongest plot in the chapter: the boolean is wrapped at runtime, the type lies, the guard always accepts. Plausible and checked by tsc in the book's own terms (verified: the type-level branch is the false branch for `isTrackingCode`; the runtime Proxy wraps every function). The decision logic at the end is coherent but takes a long time to get there.

**Grade ch10: B.** The most ambitious technical chapter and one of the most satisfying mysteries. Costs: no Turn heading, no stated rule, a Verdict that is a scene, and a heavy code load. Enjoyed: the isTrackingCode bug, "believed us about this", the `as unknown as` callback, Eden's adapter. Bored: the Safe/Safe2/AsyncMembers ladder and the format-check section.


### Chapter 11: Some Assembly Required (02-advanced-typescript/05-advanced-generics.md)

**Voice and fun.** Good, with several sharp lines. Oded's "Great. Build it, then." (ch11:159), "I want to see whether the method actually adds anything or just changes what the editor calls it." (ch11:43), "Now my builder is `never`?" (ch11:361), "You're both selling me the same spread with different packaging." (ch11:258), and "The same annotation broke my build earlier. Now it lets this through." (ch11:422) are all Oded in good form. Dafna's "I'm questioning the object with methods around it." (ch11:244) and "Then show what one of those methods does that spreading a field doesn't." (ch11:301) are sharp and in bio. Chen's "Both of these compile." (ch11:311) is a good Turn trigger. Eli's "It lost the same information both times." (ch11:424) is a nice Eli finish.

**Where the fun dies.** Section 3 ("Here's the function we already had", ch11:199-260) and the end of section 4 are a long argument that the builder and the spread are equivalent in two packagings. The point is made by Oded at ch11:258 and repeated by Guy at ch11:260 and Dafna at ch11:297-301. The chapter also has a long Eli explanation of generic defaults (ch11:85-89) that is accurate but reads like a handbook.

**Principle.** Weak. Eli's line at ch11:41 is a gesture ("A generic can carry what we know about a configuration through several calls. The next operation can require some of that knowledge.") rather than a claim the team can test. Major (principle not stated as a rule). Fix: "A builder's methods may return a type that records what was supplied; a method that needs the record should require it in its `this` type, so a missing stage fails at compile time and at runtime."

**Verdict missing; the chapter ends on a dangling question.** There is no `## The Verdict` heading. The chapter goes from the Turn (ch11:303) to `## The Debate Continues` (ch11:434), which is allowed by the book's rules, but the section has no summary of what is open and what was decided. The last beat is Chen's question at ch11:458 ("Should we allow that assignment, given what `source` does with the result?") with no answer and no closing line. Major. Fix: close with Chen's question and then one line stating what the team has agreed (the `repoint` guard holds for typed callers, the assignment to `ExportBuilder` is accepted by TypeScript and is the open question), or cut the question.

- **05-advanced-generics.md:436** — "Oded keeps the error from `repoint` beside the builder and function examples." — **minor**, AI-feel. This is the silent-closer pattern the brief names ("leaves X beside Y" / "keeps X beside Y"). Ch2 uses the same construction. Cut it, or give Oded a line.
- **05-advanced-generics.md:426** — "The handbook's discussion of generic type compatibility follows the members in the same way. Distinct type arguments alone don't make instances incompatible." — **minor**, AI-feel (narrator paraphrase of the handbook, two sentences of explanation nobody in the room says). Cut to Eli's preceding sentence.
- **05-advanced-generics.md:127** — "An explicit `this` parameter ... is checked by TypeScript and erased from the emitted JavaScript. It adds no runtime argument or check." — accurate, but narrator register. Minor.
- **05-advanced-generics.md:89** — "The generic parameter default makes the type argument optional to write. It doesn't mean 'whichever state the caller happens to have.'" — accurate, good, but a documentation sentence in the middle of Guy/Eli's exchange. Minor.
- **05-advanced-generics.md:87** — Eli: "The constraint doesn't make every property of S optional. A particular S can still require source. Nor does the default create an empty object. The constructor call does that." — precise and correct; this is the best Eli line in the chapter.
- **05-advanced-generics.md:161** — Eli's long answer about the helper's default state. Accurate; reads like a lecture; cut the middle sentence. Minor.
- **05-advanced-generics.md:218** — "She removes the destination from its caller." — ambiguous; Dafna removes it from the call she writes. "She leaves the destination out of the call." Minor.
- **05-advanced-generics.md:448** — Guy: "With your version, each package author has to export a function like `ordersTo` instead of the data we repointed." — unclear. Which data? Fix: "instead of the configuration object we'd otherwise repoint."
- **05-advanced-generics.md:455** — code `const lessSpecific: ExportBuilder = sourcePreset; // Accepted.` — **verified with TS 7.0.2**: accepted. Accurate.
- **05-advanced-generics.md:352-358** — `sourcePreset.source("customers")` error — **verified**: TS2684 with "was reduced to 'never'" text matches TS 7.0.2 (ch11 check). Good.
- **05-advanced-generics.md:413** — `repoint(sourcePreset); // Compiles. Throws: Source has already been selected.` — **verified** it compiles. The runtime throw follows from the guard. Accurate.
- **05-advanced-generics.md:150** — error for the non-generic `forNightlyExport(builder: ExportBuilder)` helper: consistent with Eli's explanation. Not separately verified; reasoning holds (`{}` state accepts `{source}` but the return type loses `source`).
- **05-advanced-generics.md:322-324** — "Both jobs now name 'customers'." — accurate.
- **05-advanced-generics.md:349** — Guy: "A JavaScript caller also gets the argument check before anything is stored." — accurate.
- **05-advanced-generics.md:378-380** — `selectOrders(forNightlyExport(ExportBuilder.start())).build();` — **verified** compiles.

**Pronouns.** Dafna she (ch11:218, 297, 387), Guy he (ch11:95, 331). Eli, Chen, Oded are not misgendered. Good.

**Story.** The Turn (Chen's repointing example, ch11:305-332) is a real turn: the builder's protection (state) does not protect the object spread. Guy's fix (guard the method at the `this` type and the runtime) is consistent with the earlier logic. The "typed caller" hole (ch11:416-424) is a fair, specific counter-point that Guy accepts ("Then the guard is for typed callers too. Keep it.") — good.

**Cross-book.** The `TS2684` / `TS2741` error codes are used accurately across ch11 and match TS 7.0.2. The "as unknown as" callback is absent here; ch10 handles that.

**Grade ch11: B-.** Interesting mechanism and a good Turn. The middle is an equivalence argument that the book keeps re-running, and the chapter ends on a question with no close. Enjoyed: Oded's "never" moment, Chen's repointing, Eli's "lost the same information both times". Bored: the createExport/spread debate (ch11:199-301) and the handbook paraphrases.


### Chapter 12: The Same Object, Twice (02-advanced-typescript/06-variance.md)

**Voice and fun.** Good, specific, and funny in places. Eden's "That one didn't break a receipt. You've broken its callers too." (ch12:245), Eden's "Two actual caches. A reader view on the old object wouldn't have saved that row count." (ch12:355), Noam's "The person who gets paged owns the receipt. The write that broke it is in another package, and both packages compile." (ch12:81), Noam's "Good. Reading works. It can't invent the value it's about to put back." (ch12:112), Daniel's "It doesn't repeal the method exception." (ch12:211), Guy's "The cache hasn't become immutable. Its owner can still write. We've described the operation this consumer gets to use." (ch12:272) and Linoy's "A writer accepting every ExportResult can stand in for one accepting CsvResult. That's contravariance." (ch12:311) are all good. The reader/writer split (Turn and archive section) is a real design result, not a rhetorical one, and the Verdict (Guy, ch12:361: "That's the boundary I'd publish.") is a clear ruling.

**Where the fun dies.** The `in out` / method-bivariance / function-property sequence (ch12:120-215, 217-239) makes three passes at one mechanism, and each pass costs a paragraph of narrator explanation. The "archive button" section (ch12:274-357) is a second design, and by the time it arrives the reader has lost track of who asked for it. Cut one of the three variance rounds to a single example.

**Principle.** Stated as a situation, not a rule. The opening has three short lines of argument and then a description of the cache (ch12:11). No expert states what a cache-holder's variance promises. Eli is absent from this chapter altogether, which is unusual for a Principle. Major (Principle must state a testable rule). Fix: "A type that both reads and writes a value can only be substituted for one with the same value type; a read-only or write-only view can be substituted in one direction." Then the debate tests it.

- **06-variance.md:128** — "Linoy starts a scratch file with the original CSV result. They recreate the cache before each experiment. She changes only the interface..." — **minor**, clarity. "They" then "She" in consecutive sentences about the same person. Fix: "She recreates the cache before each experiment."
- **06-variance.md:197** — "The handbook limits variance annotations to comparisons between instantiations of the same generic type. They do not change structural comparisons. This factory's methods close over `current`, so forwarding them also preserves the runtime behavior; no lost receiver explains the failure." — **minor**, AI-feel (narrator paraphrase of the handbook, then a defensive clause). "no lost receiver explains the failure" is unclear: the failure here is that the receipt throws, which the shared `current` explains. Fix: "The forwarded functions still close over the same `current`, so the receipt throws for the same reason."
- **06-variance.md:213** — "The exception is part of strict checking, not evidence that this repository forgot to enable it." — **minor**, AI-feel. A defensive caveat nobody in the room raised; Eden has just said strict mode is on. Cut the sentence.
- **06-variance.md:232** — "The direct call and the inferred forwarding adapter are now both rejected. Copying a named cache also fails." — accurate. Good.
- **06-variance.md:238** — `dashboard({ ...csvCache }); // Error: TS2345.` — plausible: a spread of a method-syntax interface instance becomes an object with function properties (`read`, `write` own properties)— spread copies own enumerable properties; `write` and `read` are object methods in the factory's returned literal (own properties) ✓ — so the spread copy has function-property types → strict → error ✓ plausible. Not separately verified.
- **06-variance.md:243** — "He brings back the version that only returns a label." — Eden ✓.
- **06-variance.md:266** — Linoy: "That's covariance. CsvResult fits ExportResult, and a ResultReader<CsvResult> fits ResultReader<ExportResult>." — accurate.
- **06-variance.md:268** — Eden: "The label keeps the reader so it can get the current path on each render. Passing it today's result would give it a snapshot." — good, real reason.
- **06-variance.md:284** — Guy: "Keep that record in its own cache. The download cache can accept either kind of output. The runner owns publishing new CSV results to both." — "accept either kind of output" fine.
- **06-variance.md:297-307** — `publishCsv(result, latestDownload)`: accepted — plausible: target writer is function-property with CsvResult param; source ResultCache<ExportResult>.write is method (bivariant source doesn't matter; target strict; param check CsvResult→ExportResult ✓). Accepted ✓. The inline comment "Accepted: this writer accepts every ExportResult." ✓.
- **06-variance.md:324** — `archiveAction(lastCsv); // Error: TS2345; its write requires CsvResult.` — accurate by the strict-function-property analysis. Good.
- **06-variance.md:328** — Daniel: "For these types it's invariant: neither cache can substitute for the other." — Loose: the caches are used for both reading and writing; "invariant" is fine.
- **06-variance.md:332** — Linoy: "TypeScript infers it from the members. out would describe the reader, in the writer. We don't have to write them." — accurate enough; good.
- **06-variance.md:355** — Eden: "A reader view on the old object wouldn't have saved that row count." — the logic is clear: the reader view shares `current`; the row count is lost once overwritten. Good.
- **06-variance.md:361** — Guy's Verdict. Good ruling. Keep.
- **06-variance.md:365** — Noam: "Every writer contract needs write as a function property, including the views." — dense, but a real rule. "Keep the failed calls in the checks." — fine.
- **06-variance.md:367** — "Eden leaves the adapter reproduction in the check suite and removes the CSV cache from the panel's setup." — **minor**, AI-feel: a silent closer ("leaves X in Y"), the same pattern the brief names. Cut or give Eden a reply.
- **06-variance.md:380** — Linoy: "The method exception still permits that direction. out agreeing with it doesn't make the writes safe." — accurate and sharp.
- **06-variance.md:382** — Daniel: "Keep it enabled. Turning it off restores the permissive parameter check." — accurate.
- **06-variance.md:390** — `const lessSpecific: ExportBuilder = selected; // Error: TS2322.` — plausible with `in out S` (invariant); a callback to ch11's Chen assignment (ch11:455, "Accepted") — the two chapters now disagree on the same assignment, deliberately (the ch12 version is the repaired one). Good cross-book payoff; state the change in ch12 (it does: "In a copy of the earlier builder, Linoy changes the type parameter") ✓ good.
- **06-variance.md:400** — Eden: "That's the source-only parameter Dafna offered. Choosing a new destination on a completed builder was a valid call." — "completed builder" is wrong: `selected` has no destination yet. Fix: "on a builder that already had a source."
- **06-variance.md:402** — Linoy: "We just saw what happens when the next boundary compares members instead." — good.
- **06-variance.md:404** — Guy: "Keep the guard. And put both assignments in the builder review, not just the one we wanted to reject." — good.

**Unused code.** `let reads = 0;` (ch12:180-183) is incremented but never read; the read counter is never checked. Minor: either assert `reads` or drop the counter, since Eden says "a test ... wraps read to count calls" and nothing counts.

**Pronouns.** Noam he (ch12:97), Eden he (ch12:150, 243), Linoy she (ch12:128, 402 — no pronoun, ch12:128 "She changes"). Guy and Daniel: no misgendering.

**Eli.** Absent from this chapter. The book's convention gives Eli the Principle; here none of the experts state one. The chapter reads as a team chapter, which is fine, but it loses the frame.

**Story.** The Turn (Noam's function-property change, ch12:217-239) is a real turn: the contract changes, and the fallout (the label-only dashboard breaks) is a plausible, painful consequence. Eden's "You've broken its callers too" (ch12:245) is the moment the argument changes from "is the type right" to "who pays". Good.

**Grade ch12: B.** The clearest variance chapter so far, with a credible design outcome and a concrete ruling. Costs: no stated Principle, three repeated mechanism passes, and a few narrator caveats. Enjoyed: the receipt breaking, Eden's "callers too", the archive split, Linoy's covariance/contravariance pair. Bored: the `in out` detour and the handbook paraphrases.


### Chapter 13: Who Loaded It? (02-advanced-typescript/07-declaration-merging.md)

**Voice and fun.** This chapter is clean and specific, and the people are sharp. Gilad's "Show me one printing." (ch13:7) and "Show me the stack trace." (ch13:106) are the bio, used right. Idan's "Why does it say every label has frame when we've just passed it one that doesn't?" (ch13:211) is the chapter's best line and is pure Idan. Gilad's "Don't turn the check into optional chaining and quietly print a different badge." (ch13:248) and "Keep that decision with the caller." (ch13:322) are in character. Gilad's "The first entry loading the plugin would repair the second entry's test for it." (ch13:149) is a good line. Chen's "A clean build isn't a reminder to remove the patch." (ch13:330) is a strong close. The bug (the batch entry never loads the plugin, and the type-only import makes the compiler happy, ch13:185-201) is the best Turn in the act: the Turn changes what the compiler is being asked to prove.

**Where the fun dies.** The three Additional Takes after the Verdict are side-trips: a wrong-patch file (ch13:272-296), a host global on `window` (ch13:298-322) and an upstream-conflict coda (ch13:324-330). The `window` section has no tie to the declaration-process point the chapter is about, and it arrives after the Verdict has closed the argument. Cut it or move it to ch13 Debate as a second example of "the declaration tells the compiler what to expect."

**Principle.** Almost there. Gilad's line at ch13:54 is the rule the chapter tests: "A declaration tells the compiler what to expect. For this one, the expectation depends on which JavaScript has run." Put that line as the Principle's statement, then tell the scene. Right now the rule is a side remark after Oded's patch. Major (principle not stated as a testable rule up front). Fix: move Gilad's sentence to ch13:9 or ch13:48 and make it the chapter's claim.

- **07-declaration-merging.md:54** — Gilad's rule (see above). **Keep and promote.**
- **07-declaration-merging.md:60** — Oded: "The import makes this file a module." — later (ch13:294-296) Oded says `export {}` fixes it too, and Chen says `export {}` "also makes the file a module." Two statements about what makes a file a module, in one chapter, without reconciling them. Minor technical/clarity: say "An import or `export {}` makes this file a module."
- **07-declaration-merging.md:151** — Oded: "Fine. Two runs. Can we merge twelve lines now?" — followed by Chen: "You're past twelve." The joke has no referent (what are the twelve lines?). Minor clarity. Fix: "Can we merge the two test files now?"
- **07-declaration-merging.md:165** — `new Label("Ada").frame("*"); // Error TS2339: Property 'frame' does not exist on type 'Label'.` — accurate message shape for TS 7. Fine.
- **07-declaration-merging.md:201** — narrator: "There is no import of `labels` in it. The type-only import brought `labels.ts`, including its augmentation, into the compiler's program. It didn't make the process execute that file." — accurate and important. Narrator register but useful. Keep.
- **07-declaration-merging.md:215** — Idan: "This replaces the required member; they aren't merging both spellings." — "they" has no referent (Idan? the team?). Minor. Fix: "We're replacing the required member, not merging two spellings."
- **07-declaration-merging.md:246** — Dima's status paragraph: "The web and batch runs still print `* Ada *`. With the optional declaration, removing the check from renderBadge produces TS2722..." — the TS2722 claim is plausible for the optional-method call without check; not separately verified. Accurate by reasoning. Narrator-status register: minor.
- **07-declaration-merging.md:254** — Dima: "If all construction really goes through the integration module, the required declaration can describe that application. Restricting raw imports and testing each entry is a way to maintain it. It isn't something the augmentation proves." — strong Dima. Keep. Good synthesis, "Both have a point" in practice.
- **07-declaration-merging.md:260** — "Oded leaves the optional member in the diff." — **minor**, AI-feel: silent closer ("leaves X in the diff"). Same construction as ch2:237, ch12:367, and ch13:268. Cut or give Oded a line.
- **07-declaration-merging.md:264** — Dima's Verdict: "Keep the augmentation. Keep it optional, and keep the check in renderBadge. Both entries import the constructor through labels, so they actually get the plugin. The type also accounts for a label that arrives without it." — clear ruling. Good. Keep.
- **07-declaration-merging.md:268** — Gilad: "Gilad adds the standalone batch run beside the web run. Neither test imports the other's setup." — **minor**, AI-feel. The third-person "Gilad adds" is a narrator closer in the Verdict and reads as a stage note. Cut the first sentence; keep Oded's line above.
- **07-declaration-merging.md:292** — narrator paragraph: "The distinction depends on the containing file, as the module reference explains. An ambient declaration is useful when describing a module that has no types. Giving it the name of a typed package is not a shortcut for extending that package." — accurate, but narrator register, and the last sentence is the rule the Additional Take already gave. Cut the middle sentence.
- **07-declaration-merging.md:322** — Gilad: "Here the empty prefix is allowed. The missing frame wasn't. Keep that decision with the caller." — good, but "Keep that decision with the caller" conflicts a little with the chapter's own "Keep it optional, and keep the check in renderBadge" (ch13:264). Minor: the check is in the shared function, not the caller. Clarify.
- **07-declaration-merging.md:330** — Chen: "...two required method signatures can merge as overloads without an error. A clean build isn't a reminder to remove the patch." — accurate about method overload merging. The "optional vs required conflicts" claim is not verified (I did not test an optional/required method merge across declarations). Mark unverified.
- **07-declaration-merging.md:58, 155, 213** — debate headings are unquoted ("The other way in", "A smaller program", "A declaration they can keep"), while the rest of the book uses quoted headings. Minor style inconsistency.

**Pronouns.** Idan she (ch13:211, 252, 258, 313, 320) — correct. Oded he (ch13:116) — correct. Dima and Chen carry no pronouns.

**Story.** The bypass (ch13:185-201) and the optional-declaration turn (ch13:213-260) are plausible and fair. Oded's "Then restrict imports of the raw package. We do that for database connections." (ch13:209) is a credible team habit. The argument ends in a real disagreement that Idan answers with reasons ("We have one call.") — good.

**Grade ch13: B+.** A tight, technical chapter with a satisfying bug and sharp characters. Costs: no stated rule up front, three post-verdict tangents, and a few narrator closers. Enjoyed: the batch TypeError, Idan's "passed it one that doesn't", Dima's "It isn't something the augmentation proves", Chen's last line. Bored: the `window`/`BADGE_HOST` section and the wrong-patch detour.


### Chapter 14: Two Seats or None (03-patterns-and-design/01-error-handling.md)

**Voice and fun.** Strong. Dafna's "Wait. I've caught it before the transaction sees it. Run that case." (ch14:158), Gil's "Same message, different store." (ch14:178), Dafna's "I haven't made JavaScript stop throwing." (ch14:345), Guy's "I don't want them picking by autocomplete." (ch14:371), Dafna's "We don't change a broken connection into 'seat taken'." (ch14:307), Sahar's "If you remove it, which part of the booking needs the adapter?" (ch14:357) and Liron's queue parable (ch14:391) are all in voice. The Turn is a real turn: the test shows the refusal fulfilling the transaction and committing A1, so the argument moves from design taste to what the store does.

**Principle.** The best in the book so far. Liron's rule (ch14:5) is stated, testable and applied: "Before returning, check whether they still need that rejection to stop or undo the work." Keep it exactly. The chapter's Verdict should come back to it (see below).

**Where the fun dies.** The "transaction that understands results" section (ch14:257-363) is a long alternative: `tryHold`, `transactionResult`, a second `bookParty`, and a debate about whether to adopt it. The chapter then decides not to adopt it. It is good engineering, but the reader spends 100 lines on a path the book drops. Cut the `tryHold` and `transactionResult` code to one block, or keep the code and cut Gil's "In another test..." paragraph.

**Verdict.** Narrated, not ruled. Ch14:367 is "Dafna removes the catch... She keeps... and leaves the page's explicit branch in place." That states what they did, not the rule. Liron's principle is never restated, so the reader must infer it. Major (Verdict should state the rule the Principle set up). Fix: open the Verdict with "Check the rejection before you return a value: a refusal the store must roll back on stays a rejection until the transaction has finished; then convert it." Then the decisions.

- **03-patterns-and-design/01-error-handling.md:84** — "The examples run one transaction at a time; this copy-and-replace model does not provide concurrent transaction isolation." — **minor**, AI-feel. A caveat nobody in the room raised. Gil could say it, but he is talking about the test double; keep if the reader needs it for print, otherwise cut.
- **01-error-handling.md:275** — narrator: "It delegates to the existing store, so it must translate a refusal into rejection while the store is still deciding what to do." — **minor**, narrator explanation of Dafna's own design. Fine as narration; cut the last clause.
- **01-error-handling.md:301-311** — Guy/Dafna on identity checks and thrown errors. Good. Keep.
- **01-error-handling.md:341** — Gil's "In another test, I changed the Tx passed to the callback..." — accurate, but dense. Minor.
- **01-error-handling.md:343-347** — Guy: "So Result<Booking, Failure> lists the refusals we return. It doesn't list every way this function can fail." Dafna: "Of course it can still reject. I haven't made JavaScript stop throwing." — **good**; the Result type's honest limit, stated by characters. Keep.
- **01-error-handling.md:351** — Guy: "...Put this callback under the old store.transaction and we're back to keeping A1. With a clean build." — good.
- **01-error-handling.md:361** — Liron: "If we owned the transaction implementation, we could have it commit only when result.ok is true." — good Liron.
- **01-error-handling.md:367** — Verdict narration (see above).
- **01-error-handling.md:373** — "Gil keeps both assertions in the booking test. He runs the case with the seats reversed as well." — fine.
- **01-error-handling.md:384** — `catch (error: SeatRefused)` with TS1196 comment — accurate TS error code. Good.
- **01-error-handling.md:389** — "Under the book's strict settings, an unannotated catch binding is unknown." — accurate (`useUnknownInCatchVariables` is in strict). Good.
- **01-error-handling.md:391** — Liron's queue parable: good, ends the chapter with a real question. Keep.

**Technical check.** The `transactionResult` adapter compiles under `strict` with the `refused` variable assigned in a callback (verified, TS 7.0.2; no narrowing trap). Dafna's line 243 ("If we returned the transaction's promise instead, a later rejection would escape this catch") is accurate.

**Pronouns.** Dafna she (ch14:367), Gil he (ch14:180). Correct.

**Grade ch14: A-.** The best-argued chapter in act 3: a real principle, a real bug, and a decision that comes out of the evidence. Costs: the adapter detour and a Verdict that does not restate the rule. Enjoyed: Gil's test run, Dafna's "I haven't made JavaScript stop throwing", Guy's autocomplete line, Liron's queue. Bored: the long `transactionResult` section.


### Chapter 15: What the Number Means (03-patterns-and-design/02-branded-types.md)

**Voice and fun.** Good, and the funniest act-3 chapter so far. Oded's "I'd like the other two removed." (ch15:13), Eden's "The name says count. The value is the last page." (ch15:49), Oded's "I was about to ask for named arguments. We have named arguments." (ch15:47), Noam's "I asserted that there was. Now the checker carries that property into the copy. And my conversion just stamped zero as PageCount. It trusted the range." (ch15:180), Oded's "Two callers, one comparison." (ch15:308) and Noam's "Including the one that passed the last page." (ch15:333) are all good. Eli's closer about shared links (ch15:337) is the right kind of final line.

**Principle.** Strong and testable: Eli's second paragraph (ch15:7) says a brand's operations must preserve what the check established, "or the brand can outlive the fact it claims." That is the rule the chapter then tests with the spread. Keep.

**The Turn.** Real. Oded's migration of the From handler (ch15:160-180) shows the spread keeps the brand and skips the check. The chapter earns its argument.

**Where the fun dies.** The `CheckedRange` class (ch15:197-246) is about 50 lines of a design the team then does not adopt (the Verdict at ch15:320: "we'll revisit the class"). This is the second act-3 chapter (after ch14's `transactionResult`) to spend a long run of code on a rejected alternative. The book should say "we looked at this and rejected it" in one paragraph, or cut it. The `Keeping a count instead` section is the real answer and it arrives after the class; the reader has already been through the detour.

**Verdict.** Practical and specific (Eden, ch15:312-320). It does not restate Eli's rule, so the principle is applied by implication. Minor: add one sentence that gives the rule: "Brand a scalar when its meaning survives a copy; when a meaning spans fields, carry the span in one value and rebuild it, don't copy it."

- **03-patterns-and-design/02-branded-types.md:86** — narrator: "This is the intersection technique in TypeScript's nominal-typing example. The symbol documentation describes the declaration-specific identity of a `unique symbol` key." — **minor**, AI-feel. Reference-paragraph register inside a debate. Keep one link; cut the second sentence.
- **02-branded-types.md:84** — Noam: "There isn't even a symbol created by that declaration. `declare` emits nothing. The key belongs to this declaration, and the two types require different values at that key. Both are ordinary numbers when this runs." — accurate and useful; in voice. Keep.
- **02-branded-types.md:101** — narrator error description. Accurate. Fine.
- **02-branded-types.md:120** — narrator: "The preview and the dialog's Export button each turn the dialog's endpoints into a request. Both currently reject a selection whose first page is after its last." — fine.
- **02-branded-types.md:161** — "It used to replace the selection with a spread. He gives the new first page its brand and checks whether the same update still works." — clear. Keep.
- **02-branded-types.md:201** — narrator: "He replaces the object brand with a class and changes requestOf's parameter to CheckedRange; its body stays the same. The declared private marker emits no field." — accurate; narrator-level. Minor.
- **02-branded-types.md:204-219** — `CheckedRange` class with `declare private readonly checked: void;` and `Object.freeze(this)`. Accurate as described. The diagnostic `Property 'checked' is missing` is the TS2741 start. Fine.
- **02-branded-types.md:232** — `moveStart(selected, pageNumber(5)); // Compiles; throws TypeError in this strict-mode module.` — accurate by reasoning (frozen object, strict module).
- **02-branded-types.md:245** — narrator: "TypeScript's object-type documentation notes that readonly does not affect compatibility with a mutable property..." — accurate, narrator register. Keep or cut the first sentence.
- **02-branded-types.md:261** — Noam: "That also moved To from four to six. Our dialog leaves To alone when you change From." — the real semantic argument for abandoning spans of count. Good.
- **02-branded-types.md:288** — Oded: "While I'm typing five-to-nine, let Preview show no pages once I've typed the five..." — fine.
- **02-branded-types.md:314** — Noam: "The method version handles the copying problem." — unclear: "method version" is the first()/last() idea at ch15:239, which is not restated. Clarify or cut.
- **02-branded-types.md:318** — "He leaves `requestFrom` in the patch." — **minor**, AI-feel: silent closer.
- **02-branded-types.md:322** — "He leaves the test of `count: selection.last` in the compiler checks." — **minor**, AI-feel: the same silent-closer pattern, and it is a sentence about a test nobody argued about. Cut or make it Oded's line.
- **02-branded-types.md:326-333** — Chen's optional-marker idea and Noam's answer. Accurate: optional marker accepts plain numbers. Good. Noam's "Including the one that passed the last page." is good.
- **02-branded-types.md:337** — Eli: "If the dialog restores From and To from a shared link, those parameters are input again. The link hasn't stored the brands. You still have to establish what its values mean." — strong final line. Keep.

**Pronouns.** Eden he (ch15:19, 251, 290 "Eden writes"), Oded he (ch15:160, 322), Noam (no pronoun). Correct.

**Cross-book.** Eli's principle and the chapter's test line up with ch14's Liron principle: both say the operation must preserve what the check established. Good consistency.

**Grade ch15: A-.** Clear problem, good concepts, real turn, and a concrete decision that keeps the scalar brand. Costs: the class detour and a Verdict that does not restate the rule. Enjoyed: the named-arguments exchange, the spread turn, "Two callers, one comparison", Eli's last line. Bored: the class section (ch15:197-246).


### Chapter 16: What the Schema Does With the Rest (03-patterns-and-design/03-runtime-validation.md)

**Voice and fun.** Strong. Oded's "I'd settle for getting the tracking page to move again." (ch16:7), "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived." (ch16:79), "I meant don't refund it automatically. I gave it the answer for don't refund it at all." (ch16:227), Eden's "Good, keep it raw... We'd stored every successful update. Or so I thought." (ch16:108), Noam's "That's just `string`." (ch16:146), Oded's "I'll take the occasional customs receipt in the queue over another page that stops moving." (ch16:357) and Gilad's "A new inbox ID doesn't make it a new refund." (ch16:384) are in voice and specific. Idan's "Same fields checked, three different answers about the rest." (ch16:126) is a good summary in her voice.

**Principle.** Good. Gilad's rule (ch16:5) is testable: "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result." Keep.

**Where the fun dies.** The "Who owns the conversion?" section (ch16:256-329) is a second projection and a second refund rule after the Turn has already fixed the refund rule. The reader has now seen `refundForOpen` in three forms (ch16:202, 236, and Projection's `refund`). Cut the first `refundForOpen` to one line in the Turn.

**The Turn.** Real. Eden's change notice (ch16:214-223) shows the open type routing a new status to `skip`, which is the precise failure the team feared. Oded's "I gave it the answer for don't refund it at all." is the line of the chapter.

**Verdict.** Dense recap, but it does state rules (ch16:363): "Refunds get `issue`, `skip` or `review`, with unresolved meanings routed to an owner rather than silently treated as ineligible." That is the rule. Minor: lead with it, and cut the first three sentences that list who receives what.

- **03-runtime-validation.md:52** — a six-sentence architecture spec in the narrator's voice: "The HTTP handler rejects malformed JSON before calling the endpoint with the decoded value. The endpoint parses that value, stores the parsed update, then acknowledges receipt. The inbox's `append` stores a durable snapshot before resolving and rejects if storage fails. Its resolved value is the stored update's ID for processing and replay. The HTTP handler turns an uncaught storage failure into a 500 response." — **major**, AI-feel (narrator explaining like a manual; no one in the room talks like a spec). Fix: cut to two sentences in Gilad's or Eden's voice, and let the code at ch16:54-65 carry the rest.
- **03-runtime-validation.md:67** — "Those are the terms of this integration; the pause also stops updates for other shipments." — **minor**, narrator summary closer. Keep the stakes; cut "Those are the terms of this integration".
- **03-runtime-validation.md:150** — "An unfamiliar string can satisfy that contract; a number or an empty string cannot." — minor narrator, fine.
- **03-runtime-validation.md:198-199** — Oded: "For refunds, don't issue money for a status we don't understand." — good.
- **03-runtime-validation.md:221-222** — output comments match the code; verified by reasoning (`WireStatus` accepts the string; `CarrierStatus` fails; `refundForKnown` not reached).
- **03-runtime-validation.md:191-194** — `unfinishedLabel` with `: string` → TS2366 "Function lacks ending return statement and return type does not include 'undefined'." — accurate.
- **03-runtime-validation.md:229** — Noam: "My closed parser would have put both receipts in review." — accurate.
- **03-runtime-validation.md:329** — Noam: "There's no status field in this handoff, so that branch won't compile." — accurate for `Projection`.
- **03-runtime-validation.md:341-352** — the printed `project` outputs: r1 `review`, r2 `review`, r3 `issue` — match the code. Accurate.
- **03-runtime-validation.md:353-354** — empty shipment ID goes to review: accurate (`WireUpdate` min(1)).
- **03-runtime-validation.md:378** — the quoted paragraph after Noam's `.catch` example has no speaker tag; it continues Noam. Minor clarity.
- **03-runtime-validation.md:380** — narrator link sentence. Fine.
- **03-runtime-validation.md:382** — Eden: "Keeping eta in the receipt means we can try a new schema against it later. It doesn't mean the old schema checked it. Give the backfill its own checks." — strong. Keep.
- **03-runtime-validation.md:384** — Gilad: "Lose the 204 after the write and the carrier sends the update again. A new inbox ID doesn't make it a new refund." — strong, and it is the chapter's idempotency point, which is not otherwise in the Verdict. Consider moving it into the Verdict as the rule for refunds.

**Story and logic.** One consistency point holds: the old endpoint stored `parsed.data` (ch16:62), which strips `eta`, and Eden's backfill complaint (ch16:128) is about that. The new endpoint stores raw (ch16:98-101). The chapter does not explain the transition from the strict path to the raw path beyond Eden's "keep it raw" (ch16:108); acceptable.

**Pronouns.** Noam he (ch16:93, 260, 296 — each follows a Noam line). Eden, Idan, Gilad: no misgendering.

**Grade ch16: B+.** A realistic, tightly argued boundary chapter with a real bug, a clean refund rule and two good closers. Costs: the narrator spec paragraph (ch16:52), a second projection that repeats the first, and a Verdict that leads with a list. Enjoyed: the "stuck at customs" opener, "keep it raw", the Turn's refund bug, Gilad's idempotency line. Bored: the `Projection` run-through (ch16:256-290).


### Chapter 17: The Price You Were Given (03-patterns-and-design/04-immutability.md)

**Voice and fun.** One of the best-written chapters. The hook "Was 80. Now 80." (ch17:15) and Eden's "The receipt forgot." (ch17:17) are a strong start. Dafna's "So the receipt has the same object under a more reassuring name." (ch17:68), "Even frozen." (ch17:216), "You've put one function inside an object." (ch17:268) and Guy's "I won't expose a setter for the total." (ch17:152) are sharp and in bio. Eden's "Adding readonly was a smaller diff. It just didn't do this job." (ch17:350) is a good Verdict closer. Daniel's "don't mistake a recursive readonly type for a frozen clock." (ch17:376) is the book's funniest technical line in act 3.

**Principle.** Strong: Liron's rule (ch17:5 and 7) is that holders who need history must get a value that won't change; holders who need current state must read through an owner. The three paragraphs are long for a Principle and the last paragraph (ch17:9) is an aphorism. Trim to the first and second paragraph's rule. Minor.

**The Turn.** Real and well placed: Eden's receipt says "Was 80. Now 80." again, even with a frozen type, because the summary is a live view. The fix (snapshot vs read function vs `PriceView`) is a real argument.

**Where the fun dies.** "Trying a promotion before applying it" (ch17:289-340) builds two alternatives in full (a `CartPricing` class already in use, and Dafna's `valueCheckout` closure) and then the Verdict does not choose between them. The panel-type question (`PriceView` vs `ReadPrice`) is also left open in the Verdict (ch17:346-348). That is an honest split but the reader has not been told it is a split. Either add a "Debate Continues" heading or pick one.

**Verdict.** Stated rule in a blockquote (ch17:344), testable and specific. Good.

- **03-patterns-and-design/04-immutability.md:19** — narrator spec paragraph: "Its pricing rule is `total = subtotal - discount`, with a discount between zero and the subtotal. An offer replaces the discount amount; offers do not accumulate. The receipt keeps the price from before the promotion so it can show both amounts. The summary panel, by contrast, should show the current price whenever it renders." — **minor**, narrator register. Accurate and needed; trim "by contrast".
- **04-immutability.md:66** — Daniel: "It does. `readonly` on an object property doesn't prevent that assignment. It prevents a write through the readonly type." — accurate; keep.
- **04-immutability.md:77, 82-83** — `cart.total = 0; // Error TS2540` and `appendGift(cart.items); // Error TS4104` — accurate messages.
- **04-immutability.md:88** — Daniel: "...A parameter with a writable items property could assign a different readonly array to it." — accurate.
- **04-immutability.md:121-127** — `applyPromotion(original, 20)` on the frozen quote: TypeError in strict mode; the `original.total` stays 100 — accurate.
- **04-immutability.md:142-143** — `{ ...discounted, total: 0 }` accepted; `20 0` — accurate.
- **04-immutability.md:239** — `receipt(readPrice, functionPricing.snapshot()); // Error TS2345.` — accurate.
- **04-immutability.md:263** — `receipt(view, ...); // Error TS2739.` — accurate code (missing properties).
- **04-immutability.md:286** — `console.log(savedPrice.total, liveSummary.current().total); // 100 70` — accurate.
- **04-immutability.md:299, 300, 325** — the offers and closure outputs `[90, 80]`, `100`, `80` — accurate.
- **04-immutability.md:340** — Eden: "...leaving it as Quote would keep the bad call compiling." — good.
- **04-immutability.md:346** — Guy's "I'd put PriceView in the panel's constructor." Fine.
- **04-immutability.md:354-365** — Gil's index copy: 499500 is the correct sum (0 + 1 + … + 999). Accurate. Good, honest arithmetic.
- **04-immutability.md:372** — the Gil paragraph has no speaker tag. Minor clarity.
- **04-immutability.md:379-387** — `DeepReadonly<Date>` keeps methods callable; `setUTCFullYear(2000)` changes the year. Accurate. Daniel's caveat paragraph at ch17:390 has no speaker tag. Minor.
- **04-immutability.md:390** — "For a historical timestamp, a number would make the snapshot's promise easier to keep." — good closer.

**Pronouns.** Dafna she (ch17:96, 307), Guy he (ch17:252), Eden (ch17:276 "He uses Guy's interface" follows Eden's line 274 — correct). Daniel none.

**Grade ch17: A-.** The best-written chapter in act 3 and a sharp turn. Costs: a long Principle, and an alternative section that ends without a choice. Enjoyed: "Was 80. Now 80.", the readonly/frozen/strict-mode sequence, "Adding readonly was a smaller diff", Daniel's Date joke. Bored: the closure-vs-class section (ch17:289-340).


### Chapter 18: The Ticket Hadn't Changed (03-patterns-and-design/05-pure-functions.md)

**Voice and fun.** Very good. Oded's "Twenty thousand tickets..." (ch18:13), Gilad's "Nobody changed anything. That's the interesting part." (ch18:19), Gilad's "Does the lead agree to the extra minute?" (ch18:137), Chen's "When getHours() says nine, whose nine?" (ch18:263), Dafna's "I checked it for clock reads. I didn't check what those methods read." (ch18:265), Oded's "Friday tickets walk the whole weekend." (ch18:311) and "That's not the migration I was objecting to." (ch18:212) are all sharp. The table of walk counts (ch18:216-221) is the right kind of numeric joke.

**The Turn.** Excellent and planted. Dafna's "deadlineFor doesn't read the clock. It's a pure calculation we already had." (ch18:225) is stated as fact, and the Turn reveals it reads the host's local time (ch18:233-277). The three-process TZ table is accurate: UTC gives 13:00Z, Jerusalem 11:00Z, New York 18:00Z (verified by reasoning against DST dates). This is the best plot-to-principle link in the book so far: the pure function was not pure.

**Principle.** Clear. Eli's rule (ch18:5, 7) gives two questions and then "Make anything that can change the answer an explicit input." That is testable and the Turn tests it. Keep. It is long; the second paragraph has five sentences of advice. Consider cutting "Or decide to accept some staleness" and keeping the last sentence.

**Where the fun dies.** The TTL and boundary-expiry section (ch18:115-160) and the four-version comparison (ch18:214-225) are two long cost arguments that end in a tie ("We tie there."). The reader gets the point after the TTL example; the table repeats it. Cut the table to two rows or cut "Boundary expiry" to one sentence.

**Verdict.** Decisive and specific (ch18:363-371). It does not restate Eli's rule in a blockquote; the explicit-input rule is applied by implication ("the module will use its own policy", `(ticket, now?)`). Minor: state the rule.

- **03-patterns-and-design/05-pure-functions.md:43** — "It should be ok at 12:20, at-risk at 12:40 and breached at 13:00." — checked: 240 business minutes from 09:00 Jerusalem is 13:00; at-risk window starts at 12:30. Consistent with the code.
- **05-pure-functions.md:38** — `Date.UTC(2026, 10, 9, 7)` is Monday 09:00 Jerusalem (Nov 9 2026 is a Monday; Israel is UTC+2 after its October DST change). Accurate.
- **05-pure-functions.md:76-78** — the replay output `ok ok / at-risk ok / breached ok` matches the cached dashboard's first answer being kept. Accurate and well shown.
- **05-pure-functions.md:124** — `dashboardStatus` is declared at ch18:57 and redeclared as a function at ch18:124. Reads as a replacement in the debate; say "the dashboard's new version" in the prose or rename. Minor.
- **05-pure-functions.md:150** — "console.log(slaStatus(ticket)); // breached" — accurate: at due+30s the uncached path returns breached.
- **05-pure-functions.md:180** — Eden: "It can use her calculation." — "her" = Dafna. Correct, but the sentence is ambiguous after Eden's own "They don't." Minor.
- **05-pure-functions.md:216-221** — table: 60,000 / 40,000 / 20,000 / 20,000 — consistent with the TTL and boundary explanation.
- **05-pure-functions.md:223** — Oded: "...At sixty, the TTL walks them all again. ... We tie there." — accurate (the TTL recomputes at expiry).
- **05-pure-functions.md:225** — Dafna's claim "deadlineFor doesn't read the clock" — deliberately false; the Turn corrects it. Good structure.
- **05-pure-functions.md:273-277** — TZ table: verified by reasoning (UTC 13:00Z; Jerusalem 11:00Z; New York 18:00Z on 2026-11-09).
- **05-pure-functions.md:281** — narrator: getHours/getDay use local time, selected by TZ; Intl can take an explicit zone. Accurate. Links are fine.
- **05-pure-functions.md:287** — Eden: "But I don't want every replacement image to inherit this rule from the machine it's built on." — "replacement image" is unclear jargon. Fix: "every deployed image" or "every new host".
- **05-pure-functions.md:296-308** — `deadlineFor` with `Intl.DateTimeFormat` and `en-GB`, `weekday: "short"`, `hourCycle: "h23"`: plausible; the `Sat`/`Sun` strings match `en-GB` short weekday output. Not separately run.
- **05-pure-functions.md:315** — Eden: "...keep the board on the old uncached path in Jerusalem time." — the old path reads the host's local time, not Jerusalem time; the phrase contradicts the Turn. Fix: "keep the board on the old path, with the dashboard host set to Jerusalem."
- **05-pure-functions.md:317** — Eden's continuation paragraph has no speaker tag. Minor.
- **05-pure-functions.md:363** — narrator decision line: "Gilad has checked with the lead: status as of the last thirty-second refresh is acceptable; an extra cache delay is not." — good and concrete. Keep.
- **05-pure-functions.md:371** — Eden: "Nothing in `(ticket, now?) => SlaStatus` prevents the next person memoizing it again." — good Verdict line; keep.
- **05-pure-functions.md:377** — Dafna: "Pass the same live Clock twice and it can give you two different instants..." — good.
- **05-pure-functions.md:383** — Dafna's last answer on the Map memoizer. Good.

**Name reuse.** `slaStatus` is declared three times across the chapter (ch18:34, 104, 196) and `dashboardStatus` twice (ch18:57, 124). It reads as iteration in a debate, but in print a reader will want to know which `slaStatus` is live. One sentence after ch18:196 naming the final export would help.

**Pronouns.** Gilad he (ch18:60). Dafna she (implicitly, ch18:225, 265). Oded: no pronouns. Chen, Eden: none misgendered.

**Grade ch18: A.** A strong principle, a planted and fair reveal, and two sharp characters doing real work. Costs: two cost arguments that repeat, a few stale names, and a Verdict that does not restate the rule. Enjoyed: "whose nine?", the UTC/Jerusalem/New York table, Gilad's "does the lead agree to the extra minute?", Oded's "Friday tickets walk the whole weekend." Bored: the four-version table and the TTL/boundary debate (ch18:115-160).


### Chapter 19: Who Goes Next? (03-patterns-and-design/06-imperative-vs-declarative.md)

**Voice and fun.** Strong, numerate, and very much the Gil/Dafna/Chen mix. Dafna's "I wanted to test the eligibility rules without arranging a treasury balance." (ch19:11), Dafna's "I translated the total, but lost the stop." (ch19:119), Gil's "No exception, and both totals are below a thousand." (ch19:121), Chen's "Can skip ever leave a payout unpaid that stop has already paid?" (ch19:258), Gil's "Two is a test value, not something to leave in the code because it made this table look good." (ch19:335), Dafna's "I just shipped a bug by following the total and missing what the callback would do next." (ch19:208), and Sahar's "Nothing a refund does changes whether the next row goes into the report." (ch19:391) all land.

**The bug and the Turn.** The bug (`return spent` ends one callback, not the reduce; P3 and P4 jump P2) is clear and checked. The Turn is the best "real" turn of the act: the fix (stop vs fill) is a policy question, not a style question, and the replay surfaces that the queue-order promise was already broken. The 78,125-case search and the day-by-day tables are checked: I simulated the Stop, Fill and Fill-then-reserve columns by hand and they match the chapter. The thirteen payout-days (ch19:280) also reconcile (S1–S7 differences: 2,2,2,2,2,2,1).

**Principle.** Good. Sahar's rule (ch19:5) names the three things the loop's callers depend on (carry, stopping point, order) and says to keep the loop when the stop is hidden. That is testable against the body. Keep.

**Where the fun dies.** Finance's proposal and the reserve table (ch19:274-335) is a long numbers run after the Verdict's policy line has been agreed. The reader needs one table, not two. Also the Verdict (ch19:339-356) is three people trading names. Consider putting the naming sequence into a single line.

**Verdict.** Specific and honest: it names the two behaviours and keeps the policy change with support (ch19:350, 356). Good. Does not restate Sahar's rule, which is applied by implication ("I want the loop's return beside the failed allowance check"). Minor.

- **03-patterns-and-design/06-imperative-vs-declarative.md:15** — the seller's reply quoted with the promise. Good hook. Keep.
- **06-imperative-vs-declarative.md:46** — narrator: "Amounts are integer minor units. The treasury releases USD, with a minimum of 100. Every eligible payout fits a fresh day's allowance; requests larger than that take a separate path." — accurate and needed; minor register.
- **06-imperative-vs-declarative.md:82** — Dafna: "TypeScript infers a predicate for isReady from the status check." — **verified with TS 7.0.2**: `eligible` without the `: Ready[]` annotation still returns `Ready[]` and `.map(p => p.account.iban)` compiles. Accurate.
- **06-imperative-vs-declarative.md:102** — Gil: "A and B still pass. The old limit test only had two payouts: 400 followed by 900. That passes too." — accurate, but "That passes too" is ambiguous (the test passes under skipping, which is the point). Minor.
- **06-imperative-vs-declarative.md:113-115** — output `P1 400` and `P1,P3,P4 900` — **checked by hand**: correct.
- **06-imperative-vs-declarative.md:158** — Gil: "Four reducer calls, two allowance checks." — **checked**: four eligible payouts reach the reducer; the allowance check runs on P1 and P2 only. Accurate.
- **06-imperative-vs-declarative.md:221** — `{ kind: 'limit', id: 'R2' }` — correct.
- **06-imperative-vs-declarative.md:228** — Gil: "all three repairs agree on the IDs, total and stop reason." — "three repairs" = `looped`, `folded`, `split` ✓.
- **06-imperative-vs-declarative.md:242-246** — table — **checked by hand** for Stop and Skip.
- **06-imperative-vs-declarative.md:254** — "78,125 combinations" — correct: 5^4 × 5^3 = 625 × 125.
- **06-imperative-vs-declarative.md:264** — Liron's proof sketch: plausible but loose ("it can afford everything before it too. Skip has at most those same earlier payouts left to pay."). The Gil claim "skipping pays no payout later" generalises from the tested set; the text says so at ch19:254 ("in that set"), then ch19:266 generalises ("the same argument works again"). Minor: the generalisation is stated as proof.
- **06-imperative-vs-declarative.md:274-282** — finance proposal numbers check out (see above). Accurate.
- **06-imperative-vs-declarative.md:284** — "The balance never gets above 600." — **checked**: with a 500 deposit and a 100 carry, the morning balance is 600.
- **06-imperative-vs-declarative.md:293-313** — `fillThenReserve` — the table at 317-327 reproduces by hand (P2 4, S1 1, S3 5 …).
- **06-imperative-vs-declarative.md:329** — Gil: "...this still pays P2 on day 4." — the 450-arrival case is what the table shows; the 500-arrival claim is not in the table. Minor: say which case.
- **06-imperative-vs-declarative.md:335** — "Two is a test value..." — good.
- **06-imperative-vs-declarative.md:356** — Dafna: "We just wrote stopping three ways." — accurate (looped, folded, split).
- **06-imperative-vs-declarative.md:367** — `row.refund.amount` after `filter` → **verified**: TS18048 "'row.refund' is possibly 'undefined'." — accurate.
- **06-imperative-vs-declarative.md:377** — `.filter(refund => refund !== undefined)` after `.map(row => row.refund)` **compiles** with TS 7.0.2 (TS 5.5 inferred predicate). Accurate.
- **06-imperative-vs-declarative.md:384-388** — `flatMap` version compiles. Accurate.

**Pronouns.** Gil he (ch19:254, 280 "Gil" – fine), Dafna she (implicit). Correct.

**Grade ch19: A-.** Numerate, funny, in character, and the strongest argument-to-policy turn in act 3. Costs: the finance-numbers run and the naming sequence at the end. Enjoyed: the stop/skip bug, "Two is a test value", the 78,125 search, Sahar's last line. Bored: the reserve table and the Verdict's name-trading (ch19:339-356).


### Chapter 20: Before the First Line (03-patterns-and-design/07-currying-partial-application.md)

**Voice and fun.** Lively, with good comic timing. Dima's "There wasn't a promotion on that statement." (ch20:15), Linoy's "The zero wasn't my default." (ch20:49), Noam's "The index is still a number. It can't fill that parameter." (ch20:70), Dima's "Why should its callers make a function just to call it immediately?" (ch20:104), Gil's "Six calls into prepare. Eighteen tier validations. Six line prices." (ch20:190), Linoy's "I was treating it as a shorter way to write the arrow." (ch20:333) and Dima's "This one earns its entry point because the package owns the preparation." (ch20:343) are the book at its best in act 3. The `map`-passes-the-index bug is the best running gag: it returns in `priceWithExtra` (ch20:273) and the answer comes out `100,99,98`, which is correct.

**Principle.** Good and specific (Daniel, ch20:5-7). It names the rule ("Check what each call does, whether it can throw, and which type arguments it fixes") and it is testable. The paragraph is long; the first paragraph's currying definitions are a textbook gloss. Keep the second paragraph; trim the first.

**Where the fun dies.** The `discountedBy` detour (ch20:104-122) is a complete alternative that the chapter drops at ch20:212 ("Linoy sets aside her discountedBy proposal"). It costs roughly 20 lines and a reader wonders why it was built. Cut it, or cut the two sentences that set it up. The batch-versus-per-line question (ch20:254-258) is also a small digression.

**The Turn.** Real and well placed: Gil's regression test (empty list, invalid promotion) shows that the eager `priceWith` and the lazy adapter fail at different times. It forces the team to decide that setup has work. Linoy's last line ("I was treating it as a shorter way to write the arrow.") is the admission the Turn needs.

**Verdict.** Specific and honest (ch20:337-343). It names the one function that earns an entry point and says why. Good. It doesn't restate Daniel's rule; minor.

- **03-patterns-and-design/07-currying-partial-application.md:47** — Daniel: "The index. It calls the function with the element, the index and the array. At index zero you got the answer you expected." — accurate; in voice.
- **07-currying-partial-application.md:53** — Daniel: "`map` does supply it. Making the parameter required still compiles." — accurate (checked: `lines.map(lineTotal)` with required `percent: number` compiles).
- **07-currying-partial-application.md:67** — `lines.map(lineTotal); // Error TS2345` for the defaulted-object version. **Verified**: TS2345, "Type 'number' has no properties in common with type 'Discount'." Accurate (weak-type check).
- **07-currying-partial-application.md:39** — `lines.map(lineTotal)` → `100,99,98`. Accurate.
- **07-currying-partial-application.md:186-187** — statement 520, preview `100,180,240`. **Checked by hand**: 100×1×1.0 + 200×0.9 + 300×0.8 = 520; per-line 100,180,240. Accurate.
- **07-currying-partial-application.md:243-246** — the table: 6/18/6 and 1/3/6 — consistent with the code path (six prepares via `lineTotal`; one `priceWith`).
- **07-currying-partial-application.md:260** — Noam: "An extra required argument would fail against PriceLine at this return. An optional one wouldn't." — accurate.
- **07-currying-partial-application.md:273** — `priceWithExtra` with map index: `100,99,98` — **checked by hand**: index passed as `extraPercent`. Accurate and a good callback.
- **07-currying-partial-application.md:289** — after the renderers pass only the line: `100,100,100`. Accurate.
- **07-currying-partial-application.md:307, 313** — the empty-list adapter returns 0 without validating; `priceWith(invalid)` throws `RangeError` with "Invalid promotion tier". Accurate.
- **07-currying-partial-application.md:356** — `pairWith({ a: 1 })({ b: 2 }); // Error TS2353` — **verified**: TS2353 "Object literal may only specify known properties, and 'b' does not exist in type '{ a: number; }'." Accurate.
- **07-currying-partial-application.md:359** — Daniel: "...`b?: never` or `a?: never`." — **verified** under the book's `exactOptionalPropertyTypes` setting, TS shows `b?: never` and `a?: never` in the union. Accurate for the book's config (without that flag TS displays `?: undefined`). Minor: say "under exactOptionalPropertyTypes".
- **07-currying-partial-application.md:365** — `pairWith<Either>({ a: 1 })({ b: 2 })` accepted. **Verified**: no error.

**Minor.** Lines 250 (Dima's caching paragraph) and 292 (Dima's last line) have no speaker tag in the first case. Line 250 is unattributed; it is Dima's, following Dima at 248. Minor.

**Pronouns.** Dima, Linoy (she, ch20:278 "She replaces their implementations" ✓), Gil (he implicitly), Noam (no pronouns). Correct.

**Grade ch20: A-.** The most fun, most technical-and-funny chapter in the current act, with a running gag that pays off. Costs: the discountedBy detour and the batch digression. Enjoyed: the map-index gag from start to finish, the empty-list Turn, Dima's "earns its entry point". Bored: the discountedBy section (ch20:104-122).


### Chapter 21: The Message Kept Going (03-patterns-and-design/08-hof-patterns.md)

**Voice and fun.** Excellent, with a clear argumentative spine. Oded's "I don't. I stopped waiting for it." (ch21:96) and "That's two fewer texts. Leave that test in." (ch21:136), Idan's "Where does the next timer come from?" (ch21:105), Guy's "The two seconds covers the whole retry operation." (ch21:138), Idan's "That doesn't make the operation use the signal." (ch21:193), Guy's "An earlier attempt may have got through." (ch21:319), and Guy's closer "A forwarding arrow isn't a promise that the whole API survived." (ch21:373) are all good. The "accepted before the abort" Turn (ch21:254-282) is the best plot turn in the act: the cancellation worked and the message still went out three times.

**Principle.** Gilad's rule (ch21:5) is strong and specific: a retry needs the owner's guarantee that repeating is safe; without it, report unknown. It is testable (the Turn tests it). The paragraph is long and the second half ("Retry it anyway and you can have a failed job and a customer with three messages.") is a good closing sentence. Keep. The second paragraph (ch21:7) is a list of four rules; trim to the two that the chapter uses (outside-in, `this`).

**Where the fun dies.** The composition-order round (ch21:92-142) runs about 50 lines to establish the same point twice: the wrapper order changes the wait, and the wait is not the guarantee. After the timeline table (ch21:113-121) the reader has it. Cut the `withTimeout(withRetry(...))` example and go straight to the signal.

**Verdict.** Clear and rule-like (ch21:341-343): three attempts, a fresh timeout each, around `sendOnce`, called through its instance; "A received receipt means accepted; exhausted temporary failures mean unconfirmed." Guy's line (ch21:343) is the rule for teams that copy the code. Good.

- **03-patterns-and-design/08-hof-patterns.md:125** — Guy: "We have `sendOnce` to prevent duplicate messages." — **minor**, clarity. `sendOnce` is named before it is introduced (it first appears in code at ch21:293 as `keyedClient.sendOnce`). Say "a keyed send, which we'll get to".
- **08-hof-patterns.md:47** — unattributed continuation paragraph ("The job allows three attempts and two seconds for each reply...") after Oded's line. Speaker missing. Minor.
- **08-hof-patterns.md:107** — Oded's explanation of why the timer and send start at call time is accurate and useful. Keep.
- **08-hof-patterns.md:113-121** — timeline table: checked by hand (attempt 1 delivers at 3 s, timeout at 2 s; attempt 2 starts at 2 s and delivers at 5 s; attempt 3 starts at 4 s; job records failed at 6 s; attempt 3 delivers at 7 s). Accurate.
- **08-hof-patterns.md:130-134** — `withTimeout(withRetry(send, 3), 2000)`: one start, failed at 2 s, one delivery at 3 s — accurate by reasoning.
- **08-hof-patterns.md:188** — `withTimeout(send, 2000); // Error TS2345` — plausible (signal vs notice). Not separately run; accept.
- **08-hof-patterns.md:213-215** — `withTimeout(client.send, 2000); // Compiles.` and the `Cannot read properties of undefined (reading 'connection')` message — plausible for a method with a `this` parameter passed without its receiver. Not run; accept with a note that the TS 7 behaviour for a `this`-typed method passed to a `this`-less parameter is "compiles" as claimed.
- **08-hof-patterns.md:242-244** — Gilad: "Starts at zero, two and four seconds... Zero deliveries. The job still records failed at six seconds." — accurate: aborts at 2, 4, 6 precede the 3, 5, 7 deliveries.
- **08-hof-patterns.md:264-268** — the early-acceptance table: consistent.
- **08-hof-patterns.md:309** — "gets the existing receipt at 2.1 seconds" — consistent with the keyed flow.
- **08-hof-patterns.md:341** — the Verdict paragraph: narrator, but accurate to the code. Keep.
- **08-hof-patterns.md:365** — `lookup("shipped-42"); // Error TS2345` — **verified**: TS2345 "Argument of type 'string' is not assignable to parameter of type 'readonly string[]'." Accurate.
- **08-hof-patterns.md:369-370** — `forward(identity)` keeps the generic: `forwarded(3)` is `number`, `forwarded("accepted")` is `string` — **verified** with TS 7.0.2 (`forwarded` has type `<T>(value: T) => T`). Accurate: the book's claim is correct and the lines compile without error comments. A reader might still expect an error; the text says "It doesn't keep every overload", which is the correct point.

**Pronouns.** Idan she (ch21:160, 185 Idan speaking), Oded he (ch21:49 "He put that behavior..."), Guy he, Gilad he (implied). Correct.

**Grade ch21: A.** The most sustained technical argument in the book and a turn that the reader can feel. Costs: the composition-order detour and a Principle that is long. Enjoyed: the "accepted before the abort" Turn, Idan's signal fix, Guy's "earlier attempt may have got through", Oded's "two fewer texts". Bored: the wrapper-order round (ch21:92-142).


### Chapter 22: The Policy's Alibi (03-patterns-and-design/09-config-to-function.md)

**Voice and fun.** Sharp, specific, and funny in the right places: Dafna's "It gave the policy an alibi." (ch22:66), Eden's "I sent the logger an object it couldn't preserve." (ch22:68), Sahar's "Do you need to store the function at all? You already keep the releases." (ch22:88), Dafna's "I'm not proposing a programming language with a debugger." (ch22:211), Gil's "I counted requests. I didn't calculate when you should build an editor." (ch22:352), and Sahar's last question (ch22:356) all sound like the people. The order-forty-two opening is a strong hook and the audit-record gap (`JSON.stringify` drops `extraHold`) is a real and vivid failure.

**The Turn.** Real and checkable. Gil's eight-order replay shows the tree's `any` inside `any` holds two extra orders (ch22:287-291). I checked the arithmetic by hand: the 5 holds, the expected array, and the 2 mismatches (the low-total FR order without velocity, and the low-total US order with it) are all correct. Eden's "three of Gil's eight samples" (ch22:317) also reconciles: the new template holds orders 4, 6 and 7 that the old one does not.

**Principle.** Strong and testable at the end of the first paragraph: "save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?" (ch22:5). The paragraph is too long; that testable sentence is the one to put first. The second paragraph (ch22:7) is an unattributed continuation and reads as a second Principle. Merge or cut.

**Where the fun dies.** The tree-versus-templates section (ch22:143-249) builds two evaluators that produce the same answer (`evaluate` and `evaluateTemplate`) and then the Verdict picks templates "for now". Cut the `evaluate`/`Condition` code to a paragraph, or keep it and cut the template function.

**Verdict.** Concrete and in-world (ch22:337-339, 352-354): the editor starts at the third regrouping request, and the reader is given the decision rule. The code at ch22:344-349 is a clear boundary example. Good.

- **03-patterns-and-design/09-config-to-function.md:5** — Liron's Principle is one paragraph of about 130 words. The rule is the last sentence. Shorten it; move the round-trip test up. Minor.
- **09-config-to-function.md:7** — unattributed continuation; Liron's second paragraph has no speaker tag. Minor.
- **09-config-to-function.md:21** — narrator: "The audit log promises a complete account of the active policy alongside the order facts and the decision. On the third, the console had selected the total template; the logger received its live policy object, shown below." — "On the third" here means the day of the decision, and Eden later says "On the third, I added refunds..." (ch22:133) for a different thing (the template). Two uses of "the third" in one chapter with different referents. Minor clarity. Fix: "the day of the decision" in ch22:21 and "in the third release" in ch22:133.
- **09-config-to-function.md:59-63** — `JSON.stringify(active)` → `{"reviewAbove":500}` and `holds(restored, order)` → `false`. Accurate.
- **09-config-to-function.md:83** — `const savedPolicy: Json = active; // Error TS2322` — plausible; not separately run.
- **09-config-to-function.md:108-112** — the `as const satisfies Json` audit record replays to `true`. Accurate.
- **09-config-to-function.md:133** — Eden: "On the third, I added refunds to the total one." — see the "third" note above.
- **09-config-to-function.md:135** — Dafna: "...Now they want high totals back for every country, alongside FR and refund velocity." — "for every country" contradicts the grouping on the next line (large total OR (FR AND refund velocity)): high totals for every country, but velocity only for FR. Reads as a mistake. Fix: "high totals back from any country, and FR refund velocity".
- **09-config-to-function.md:155-171** — the `Condition` union and `matches` with `never` check. Accurate and well-typed (the switch exhausts the union; `missing: never` compiles).
- **09-config-to-function.md:207** — Dafna: "`never` makes us handle the new kind. It doesn't write the check for us." — good, in voice. Keep.
- **09-config-to-function.md:262-272** — 8 samples; `samples.map(ruleHold).filter(d => d.hold).length` → 5. **Checked by hand**: holds are orders 1, 4, 5, 6, 7 (0-indexed). `templateHold` equal → true.
- **09-config-to-function.md:284-288** — `tooBroad` replay: 2 mismatches (orders 0 and 3). **Checked by hand**: correct, and Gil's description matches.
- **09-config-to-function.md:307-311** — the request table sums to nine changes (6+2+1). Consistent with "the past three months". Good.
- **09-config-to-function.md:317** — Eden: "Three of Gil's eight samples. The new template holds them." — **checked**: orders 4, 6, 7 are held by the new template and not by the old country-and-velocity rule. Accurate.
- **09-config-to-function.md:358** — Dafna: "Three refunds within seven days. The old log didn't say that." — consistent with ch22:50 and the order's refund ages.

**Pronouns.** Eden he (ch22:92, 215), Dafna she (ch22:193), Gil he (ch22:259). Correct.

**Grade ch22: B+.** A vivid failure, a sharp Principle, and a Turn whose numbers reconcile. Costs: a long Principle, two evaluators that do the same job, and two uses of "the third". Enjoyed: the alibi, the `Json` guard, Gil's eight-order replay, Sahar's "store the function at all?". Bored: the `Condition` tree walk-through (ch22:143-203).


### Chapter 23: Still Waiting for No (03-patterns-and-design/10-monads-light.md)

**Voice and fun.** This is the act's best Turn and the cleanest comedy of a bug. Guy's "Two previews started. One closed." (ch23:11), Linoy's "And I taught it to say nothing on no." (ch23:214), Guy's "The worker is waiting for an answer about whether it answered." (ch23:212), Dafna's "Promises only mostly fit it." (ch23:254), Sahar's "They can't accidentally become promise methods." (ch23:276), Linoy's "The promise would still find it. Deprecating the name doesn't stop JavaScript calling it." (ch23:332) and Sahar's "Show what the map callback returns and what the andThen callback returns. That's most of the explanation." (ch23:356) are all in voice. The reveal that a `then` method is a promise hook is the book's best "I didn't know that" moment.

**The Turn.** Real. The team's naive fix (unwrap in the entry point) is tested, shown to change the class's contract, and rejected in favour of renaming. I verified with TypeScript 7.0.2 that the async `loadPreview` returning a `then`-carrying `Res` compiles, and that `await loadPreview("7")` gives `Preview` so `result.result` is TS2339 exactly as the chapter says. The `counts` JSON in checkRepair (`{"started":2,"closed":2,"failed":0}`) is correct.

**Principle.** Eli's rule (ch23:5) is testable: "If it returns a plain value, use `map`... If it returns another Result, you need the operation arrays call `flatMap`." The second paragraph (ch23:7) states the thenable rule that the Turn tests. Both are clear. The paragraph is long; the first two sentences are the rule.

**Where the fun dies.** Line 141-143 (Guy's "That has four values" and Dafna's monad definition) is a textbook passage. The reader would rather have the bug; the definition can move to the Verdict or be cut to one sentence. The "resolve with the whole Result" branch (ch23:264-272) and the `andThen`/`then` naming exchange are long; but they are where the design gets decided.

**Verdict.** Good. Guy's rule (ch23:352) and Linoy's line (ch23:354) say what was decided and why. Sahar's closing check (ch23:356) is a clean ending. Honest and specific.

- **03-patterns-and-design/10-monads-light.md:5** — Eli's Principle: "Arrays show the difference plainly: `map` keeps an extra array level and `flatMap` joins it." — accurate and clear. Keep.
- **10-monads-light.md:7** — Eli: "No registration required. You can join a language protocol just by choosing a method name." — good; the Turn proves it. Keep.
- **10-monads-light.md:31** — Linoy: "There are six screen callers, all synchronous." — consistent with the Verdict's "six screens" and the rename.
- **10-monads-light.md:45-60** — `ok`, `parseQty`, `availability` as declared. Accurate.
- **10-monads-light.md:95-98** — `preview("2")` and `preview("7")` JSON. Accurate.
- **10-monads-light.md:108-111** — nested `Res<Result<...>, BadQty>` JSON. Accurate.
- **10-monads-light.md:127-129** — two promise `then` calls both `Promise<number>`, fulfilling with 3. Accurate.
- **10-monads-light.md:135-138** — `[[2,2],[7,7]]` and `[2,2,7,7]`. Accurate.
- **10-monads-light.md:164** — `result.result; // Error TS2339` — **verified** with TS 7.0.2: "Property 'result' does not exist on type 'Preview'." Accurate.
- **10-monads-light.md:188-189** — `runJob(() => loadPreview(...))` compiles (verified by reasoning and the chapter's claim).
- **10-monads-light.md:204** — `goodJob` gets `{ quantity: 2, offer: 'offer-2' }` — accurate: resolve called with the Preview.
- **10-monads-light.md:216** — `refusedJob` remains pending; `finally` never runs. Accurate.
- **10-monads-light.md:230, 233** — `checkUnwrapped` outputs. Accurate.
- **10-monads-light.md:248-249** — `Promise.resolve(preview("7"))` is `Promise<Preview>` and remains pending. Accurate (adopts the thenable).
- **10-monads-light.md:278** — "He writes the plain-union version" — Sahar he. Correct.
- **10-monads-light.md:288-291** — `andThen(parseQty("7"), availability)` → noStock. Accurate.
- **10-monads-light.md:313-319** — plainPreview. Accurate, including the narrowing returns.
- **10-monads-light.md:324** — "If I remove the first check, `qty.value` stops compiling." — accurate.
- **10-monads-light.md:326** — Dafna: "The helper saves a branch, but this caller doesn't have to squeeze the rest of its work into a callback." — the phrase "keep the same quantity available" is unclear. Minor.
- **10-monads-light.md:342-346** — checkRepair outputs (`{"result":{...}}` for the class, `{"started":2,"closed":2,"failed":0}`) — accurate; the first line shows a Res class instance's JSON, which is the reason for the `.result` in the output. Accurate.
- **10-monads-light.md:367-371** — `new Res(parseQty("2")).map(availabilityAsync)` typed `Res<Promise<...>, BadQty>`. Accurate. Dafna's advice is right.
- **10-monads-light.md:373** — the ECMAScript link fragments are appropriate.

**Speaker tags.** Line 262 Guy's "No stock is a completed preview, not a broken job." — correct. Line 326 Dafna — correct. Line 334 narrator — fine.

**Pronouns.** Linoy she (ch23:204 "She follows the success branch" — ✓), Sahar he (ch23:278), Guy (no pronouns), Dafna (no pronouns used). Correct.

**Grade ch23: A.** The best-argued, funniest bug in the book so far, and the decision is principled and tested. Costs: the monad definition paragraph in the middle, and two long alternatives (resolve-with-Result and the plain-union helper). Enjoyed: "Two previews started. One closed.", the thenable reveal, "taught it to say nothing on no", Sahar's "accidentally become promise methods". Bored: the Dafna monad definition (ch23:143) and the plainPreview helper (ch23:310-328).


## Part Four: The Real World

### Chapter 24: Both Tests Were Green (04-the-real-world/01-migration-strategies.md)

**Voice and fun.** Strong. Oded's "I converted the test out of catching the conversion." (ch24:108), "One function. One test. No dependencies. I picked the boring one." (ch24:11), "That's the entire reason I started at the bottom." (ch24:88), "Don't turn this into a rule about every object someone could export." (Noam, ch24:316), "And the old test stays old on purpose." (ch24:324) and Eden's "You were adding types to the slugger, not changing its callers." (ch24:114) are all in voice. The Turn works as a demonstration: the route, the sitemap and the backfill are each a different kind of hidden caller, and the reader learns to look for them.

**The best technical argument of Part Four.** The default-export break is found by the old `require` test and the sitemap, not by the compiler (the compiler happily emits a file without checking its callers). The sitemap's `@ts-nocheck` is a real trap and the chapter's answer (restore `export =`, don't add an opt-out to a checked caller, Noam ch24:276) is honest.

**Principle.** The first sentence of Daniel's Principle is the rule and it is clear: "Keep their contract ... or change and verify the callers too." The second paragraph (ch24:7) is a manual: six sentences of compiler flags and advice in Daniel's mouth. "`allowJs` lets JavaScript into the program. Only `checkJs` or `@ts-check` makes the compiler report that file's errors." That is accurate and useful, but it reads like a documentation page. Major (AI-feel / Principle register). Fix: keep the rule and the sentence about unchecked callers; move the flags to the code.

**Where the fun dies.** The lookup/sum/money exception round (ch24:146-203) is a list of files with `@ts-nocheck` decisions. The reader is in a configuration review. It pays off in Noam's exception argument, but the three helper files could be one paragraph.

- **04-the-real-world/01-migration-strategies.md:7** — Daniel's second paragraph (manual register, see above). **major**.
- **01-migration-strategies.md:185** — Eden: "`@ts-check` at the top of the route would check that file under the current strict settings. It would leave the other files alone." — **major**, story/technical inconsistency. Line 140 has just had Noam change the global `checkJs` to true, so `@ts-check` is redundant and would not "leave the other files alone" in any meaningful way. Eden is proposing the per-file option that the team had already passed. Fix: change Eden's line to address the untyped-any question directly ("We can check the route per file...") or move it before ch24:140.
- **01-migration-strategies.md:140** — "Noam changes `checkJs` to true" — consistent with the Verdict and ch24:203 ("Global `checkJs` stays on"). The inconsistency is only with ch24:185 above.
- **01-migration-strategies.md:126** — "The emit ends with `module.exports = slug`." — accurate for `export =` under CJS.
- **01-migration-strategies.md:92-100** — `inspect.js` outputs `object` and `function`; the route's TypeError `slug is not a function`. Accurate for `exports.default` under CJS emit.
- **01-migration-strategies.md:126, 274** — both tests pass and the route/sitemap outputs are correct in logic.
- **01-migration-strategies.md:140** — TS2349 (not callable) and TS7006 (implicit any) — accurate codes.
- **01-migration-strategies.md:175** — "Five implicit-any parameters: title, id, a, b and cents." — counted: 5 ✓.
- **01-migration-strategies.md:226** — `handle(42)` reports TS2345 with the quoted message: accurate.
- **01-migration-strategies.md:254** — the sitemap throws before the footer callback: accurate for `slug` being the object.
- **01-migration-strategies.md:291** — backfill: TS2349 with the default export, compiles with `export =`. Accurate by reasoning.
- **01-migration-strategies.md:314** — `price-label.js` passes and prints `12.5`: accurate.
- **01-migration-strategies.md:320** — Eden's Verdict is the rule ("A caller left on the exception list keeps its interface in a conversion PR") — clear. Keep.

**Pronouns.** Oded he (ch24:67, 110), Chen he (ch24:280), Eden and Noam (no pronouns). Correct.

**Grade ch24: A-.** A realistic, sharp migration story where the compiler is not the hero and the team has to look at callers. Costs: the manual-register Principle paragraph, the `@ts-check`/`checkJs` contradiction, and a configuration-heavy middle. Enjoyed: the `inspect.js` probe, the sitemap trap, the backfill script, Noam's "Don't turn this into a rule about every object someone could export." Bored: the lookup/sum/money exception round (ch24:146-203).


### Chapter 25: The Other Money (04-the-real-world/02-monorepo-type-sharing.md)

**Voice and fun.** Good, with two of the act's best closers. Idan's "I have parsed the money. Apparently it isn't money." (ch25:11), Gil's "Both declarations have that text. Look at the paths." (ch25:122), Gil's "I wanted to know how much we'd broken. I have three imports to change, but only one failing call." (ch25:170), Linoy's "Why is there a money package in the API's output?" (ch25:141), Dima's "Otherwise I'm promising you a build order I never described." (ch25:233), Idan's "That is one build command I would happily forget." (ch25:296), Gilad's "Which file will the image load?" (ch25:300), and Idan's last line "I have spent quite a while agreeing on fifteen dollars" (ch25:334) are the people at their best. The `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` turn is a real surprise.

**The Turn.** Real and concrete: the source-first dev check passes, the runtime source check passes, and the image refuses to strip types under `node_modules`. The team has to choose between a loader and dist. The Verdict is "package JavaScript," which is what the image actually ships. Good.

**Principle.** Gilad's three questions (ch25:5) are testable and the chapter answers each. Clear. The second paragraph (ch25:7) is a prescription list ("Use the package's public exports...", "If a type... ask for an export...", "When two types...", "Development can check source...", "For the build you package...") — six instructions in one paragraph. Only the last sentence ("I want the failure on this laptop, not in the image someone wakes me up to fix") is Gilad. Trim.

**Where the fun dies.** The `format` edit and reference-graph subsection (ch25:188-231) is a second build-order story after the import story. The reader already knows the answer (the check reads stale declarations). Cut the `tsc -b` transcript to the one line that introduces the reference graph.

**Verdict.** Three short lines of decisions (ch25:338-342). Concrete and correct. It doesn't restate Gilad's rule; the rule (failure on this laptop) is shown by the image test and should be the Verdict's first line. Minor.

- **04-the-real-world/02-monorepo-type-sharing.md:7** — Gilad's second paragraph (see above). Minor-major, Principle register.
- **02-monorepo-type-sharing.md:115-117** — `TS2741` "Property '#cents' is missing in type 'import("…/money/dist/index").Money' but required in type 'import("…/money/src/index").Money'." — accurate for two different declarations of a class with `#private`. Good, real technical insight.
- **02-monorepo-type-sharing.md:137** — `TypeError: Cannot read private member #cents from an object whose class did not declare it` — accurate V8 message.
- **02-monorepo-type-sharing.md:143** — Gil: "...those imports disappear from the JavaScript. Your parser is the first thing that loads that copy." — accurate and consistent with the three-import finding at ch25:155.
- **02-monorepo-type-sharing.md:161** — `export const line: Line = firstLine(); // Accepted.` — accurate: Line is a plain interface.
- **02-monorepo-type-sharing.md:201** — `tsc -p apps/api` passes on a stale declaration — accurate (dist declarations are read).
- **02-monorepo-type-sharing.md:220** — TS2554 "Expected 1 arguments, but got 0." — accurate message.
- **02-monorepo-type-sharing.md:222** — Idan: "I was starting to feel redundant. I could delete my arguments and nobody would notice." — obscure; the joke does not map to the code (the argument is required, not redundant). Minor; cut or clarify.
- **02-monorepo-type-sharing.md:286** — `allowImportingTsExtensions` requires `noEmit` (the dev base has it) — accurate.
- **02-monorepo-type-sharing.md:290** — Node needs actual `.ts` filenames; the noEmit check allows them — accurate.
- **02-monorepo-type-sharing.md:308** — `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` — accurate Node error code for type stripping under node_modules.
- **02-monorepo-type-sharing.md:314** — Gil's restriction explanation — accurate per Node's type-stripping docs.
- **02-monorepo-type-sharing.md:332** — Gil: "Two emitted from the start. One loaded until the parser arrived, then two. This image ships one." — the sentence is clumsy: "Two emitted from the start" contradicts "one loaded until the parser arrived" only if read quickly. Clarify: "Two were emitted from the start; one was loaded until the parser arrived."

**Pronouns.** Idan she (ch25:128, 224), Gil he (ch25:124, 306), Dima he (ch25:220), Linoy (no pronouns). Correct.

**Grade ch25: A-.** Concrete, correct, and funny in places. Costs: the Principle's prescriptions, and a second build-order subsection that repeats the first. Enjoyed: the `#cents` reveal, "Look at the paths", "one failing call", the image refusing type stripping, Idan's closer. Bored: the `format`/references subsection (ch25:188-231).


### Chapter 26: It Can't Be Green (04-the-real-world/03-testing-typed-code.md)

**Voice and fun.** The best comic chapter in the book. Noam's "It can't be green." / "That's the problem." (ch26:11-19), Oded's "I have accidentally passed two different tests with one comment." (ch26:124), "I have rarely been congratulated for breaking a build this enthusiastically." (ch26:143), Sahar's "Try it before we count it as a test." (ch26:203), "Did you promise it would arrive attached to an intersection?" (ch26:259), Oded's "But our test of the forbidden call is making the forbidden call." (ch26:288), Eden's "The comment objects to the call's type. It doesn't cancel the call." (ch26:290), Eden's "We taught the runner to leave it alone. We haven't told the compiler where we put it." (ch26:375), Oded's "Can I write 'type tests green' now?" / Noam's "I was finished." (ch26:423-429) are the funniest lines in the back half of the book. The opening's "I can refresh it, but I don't think that'll help." is paid off at ch26:369-371.

**The Turn.** The forbidden call runs at runtime (`shipped: [ 'o2' ]`), and the type-only file isn't in the compiler's include list. Both discoveries are real and checkable. Verified by reasoning: a `@ts-expect-error` directive suppresses the type error but not the call; Node's default test discovery runs anything under `test/`; `tsc --listFilesOnly` would not list a file outside `include`. The chapter's own point (a planted error shows the file is checked; breaking the promise shows the test protects it) is enacted.

**Principle.** Sahar's rule is specific and testable: "Change the code so the promise is false, then run CI's type check. See the test fail, undo the change, and see it pass." Keep. The second paragraph (ch26:7) is a dense checklist (the `@ts-expect-error` rule, `any`, include list, runtime). Fine for this chapter, but it is the longest Principle in the book after ch5 and ch9. Trim the last sentence's list or cut "Keep runtime assertions for values and effects" to the Verdict.

**Where the fun dies.** "What are we promising?" (ch26:170-273) is long: `orderRow`, `Equal`, the `Status` probe, the flat versus intersection return, and the `Object.assign` cleanup. The point (exact comparisons catch `any`, intersections, and widened literals) is made by ch26:217-234; the rest is confirmation.

**Verdict.** A scene that ends in a joke (ch26:421-429). The rule is in Eden's line at ch26:415 and Noam's at ch26:417 ("show me the reds before you send me the green"). There is no blockquote ruling; the Principle's rule is what the reader takes away. Fine for this chapter, given its tone. Minor.

- **04-the-real-world/03-testing-typed-code.md:7** — Sahar's second paragraph (see above). Minor.
- **03-testing-typed-code.md:96** — `TS2345` with "Property 'currency' is missing in type '{ id: string; status: "draft"; }' but required in type 'Draft'." — plausible for a union parameter. Not separately run.
- **03-testing-typed-code.md:104** — `TS2322 ... "draft" is not assignable to "paid"` — plausible.
- **03-testing-typed-code.md:118, 234, 399, 403** — TS2578 (unused directive) and TS2344 messages — accurate codes and phrasing.
- **03-testing-typed-code.md:147** — `TS2741: Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'.` — accurate.
- **03-testing-typed-code.md:179-181** — `orderRow` with `Object.assign({ id }, { status })` returns an intersection type — accurate.
- **03-testing-typed-code.md:211-217** — `Equal`/`Expect` pattern: the standard identity check. Accurate.
- **03-testing-typed-code.md:220** — `TS2344: Type 'false' does not satisfy the constraint 'true'.` — accurate.
- **03-testing-typed-code.md:226-234** — `: any` helper plus `@ts-expect-error const wrong: "draft" = row.status;` gives TS2578 — accurate, since `any` is assignable to "draft".
- **03-testing-typed-code.md:253** — `paidCard("o1")` → `Paid order o1` — accurate.
- **03-testing-typed-code.md:284** — `shipped: [ 'o2' ]` — accurate; the draft call runs.
- **03-testing-typed-code.md:308** — `node --test` picks up `test/ship.types.ts` — accurate for Node's default `test/**` discovery.
- **03-testing-typed-code.md:373** — `--listFilesOnly` does not list the moved file — accurate with the original include.
- **03-testing-typed-code.md:405** — `node --test type-tests/ship.types.ts` passes with the false assertion present — accurate: type-only assertions are erased.
- **03-testing-typed-code.md:130-137** — "Noam replaces the draft test" with `const draft: Draft = { ..., currency: "USD" }` — consistent with the currency change.
- **03-testing-typed-code.md:116** — "Done: neither Draft nor Paid has `currency`..." — consistent with restoring the older source.

**Speaker and pronouns.** Oded and Noam alternate cleanly. "He" references: Guy opens the card (ch26:174, Guy he ✓); Eden "He opens Node's explanation" (ch26:290 ✓); Oded "he clears shipped" (ch26:284 ✓). Sahar: no pronouns.

**Grade ch26: A.** The most entertaining and most instructive chapter in the back half; every reveal is a physical check. Costs: a long middle on the return shape, and a Verdict that is only a joke, which is fine here. Enjoyed: "It can't be green.", "It's also calling ship.", "We taught the runner to leave it alone.", "I was finished." Bored: the Object.assign and intersection sub-argument (ch26:240-262).


### Chapter 27: More Work, Less Time (04-the-real-world/04-performance-vs-safety.md)

**Voice and fun.** Strong, with the act's best closing exchange. Noam's "Your faster checkout says `Hello A, {count} items`." (ch27:11), "The customer doesn't get the title." (ch27:15), Oded's "I did say type check." (ch27:105), Noam's "I'm keeping that number for when somebody changes the PR title." (ch27:107), Gil's "Stop moving the furniture." (ch27:177), Noam's "I'm not buying that bug twice." (ch27:229), Oded's "Please tell me we're not rejecting the faster one for doing more work." (ch27:261), Daniel's "Don't build on the name." (ch27:279), Oded's "Count made it all the way to the customer this time." (ch27:297), Noam's "Don't put 'equivalent' in the title." (ch27:311) and Oded's last line "I'd hate to spend the saved time naming this PR." (ch27:317) are all in voice and funny. The title is the running joke and it lands.

**The Turn.** Real and honest: the new signature is faster by a measure that the team then has to interpret (more instantiations, less time), and the profile shows the first guess (Args) was too narrow. Gil's "Finding Args isn't finding the cost." (ch27:273) is the right instinct. The team does not overclaim.

**Principle.** Daniel's rule is specific and testable (ch27:5, 7): "measure the saving and say what newly compiles" and "List which calls must stay legal and which must stay forbidden, and check both lists." The chapter checks both lists (ch27:246). Keep. The first paragraph is long; the list is the rule.

**Where the fun dies.** The counterfactual table and the four alternatives (ch27:153-181) and the trace/profile walk (ch27:267-289) are the densest technical material in the back half. They are necessary for the argument, but the reader needs only the table and Gil's "whole-version comparisons" sentence. Keep both; cut the code block at ch27:155-166 to the two signatures that matter.

**Verdict.** Concrete and in character: the replacement signature, the fixture, the measurement caveat (Gil, ch27:309), the rule for future removals (Noam, ch27:311), and the title change. Good; the title change is the chapter's best ending. Minor: the verdict has no stated rule for the reader; the Principle's list-both rule is applied.

- **04-the-real-world/04-performance-vs-safety.md:5** — Daniel's first paragraph: "Counters aren't seconds. When they don't explain the time, profile the checker." — good, specific, and accurate to the Turn. Keep.
- **04-performance-vs-safety.md:17** — narrator: "Noam is reading the output of two deliberately broken calls he wrote against Oded's branch..." — fine.
- **04-performance-vs-safety.md:42** — `node dist/probe.js` prints `shop.crat`, then `Hello A, {count} items` — **checked by reasoning**: `t("shop.crat")` returns the key; the cart call substitutes `name` and leaves `{count}`. Accurate.
- **04-performance-vs-safety.md:72** — Linoy's explanation of Paths/At/Params/Args: consistent with the types as written. Ready has no placeholders → `[key]`. Accurate.
- **04-performance-vs-safety.md:78** — "The typo message ends by comparing shop.crat with shop.hello." — unclear what the message says; it is not a standard TS message. Minor: quote the actual message or cut.
- **04-performance-vs-safety.md:103** — "Same 387 bytes." — refers to `dist/i18n.js` (the translator), consistent with the next line. Accurate.
- **04-performance-vs-safety.md:128** — "two thousand keys, two thousand calls." — **checked**: 40 sections × 50 keys = 2000 keys; 2000 calls.
- **04-performance-vs-safety.md:175** — Noam: "But only two hundred distinct keys called." — **checked**: pairs (i mod 40, i mod 50) over i in 0..1999 yield 200 distinct keys (lcm 200). Accurate and a good catch.
- **04-performance-vs-safety.md:181** — Gil's explanation of the table as whole-version comparisons. Good.
- **04-performance-vs-safety.md:206** — `87,431 instantiations, a 0.095s median`. Not separately run; internal to the chapter. Accept.
- **04-performance-vs-safety.md:221** — `TS2556` at the banner's tuple spread under the loose signature — plausible; not run.
- **04-performance-vs-safety.md:257, 263** — 118,628 at 0.255s vs 118,255 at 1.481s; "less than a fifth of the old time" — **checked**: 0.255/1.481 ≈ 0.17 < 0.2. Accurate.
- **04-performance-vs-safety.md:269** — Args resolves to two thousand tuples — consistent with 2000 keys defined.
- **04-performance-vs-safety.md:273** — "About 0.2 seconds in the recorded check events, against about 1.6 for checking the file." — internally consistent with the 1.481s median (trace overhead aside). Accept.
- **04-performance-vs-safety.md:277** — the typescript-go `mapTypeEx` link — plausible; not verified against the commit.
- **04-performance-vs-safety.md:279** — Daniel: "That's 7.0.2's checker. Don't build on the name." — honest and in voice.

**Speaker and pronouns.** Linoy she (ch27:269 "She follows"), Noam he (ch27:311 etc. — no misgendering), Gil and Oded: no pronoun problems. Correct.

**Grade ch27: A.** The book's cleanest demonstration of "measure the saving and say what newly compiles", written with humour and a real correction (the first guess was wrong). Costs: the counterfactual table block and the profile walk are dense; the "typo message" sentence is unclear. Enjoyed: "The customer doesn't get the title", "I did say type check.", "Count made it all the way to the customer this time.", "Don't put 'equivalent' in the title." Bored: the four-alternative code block (ch27:155-166).


## Part Five: Bonus, AI and TypeScript

### Bonus 1: Which File Says That? (05-bonus-ai-and-typescript/01-prompting-for-typescript.md)

**Voice and fun.** The best use of the bonus premise: the assistant is unnamed and its output is quoted as saved text, as the book's rule requires. Dima's "It validated the vibe." (Idan, ch28:49), Dima's "And gave us an excellent interest rate." (ch28:51), "I'd like the request to be shorter than the function." (ch28:59), "That's a parser written in English." (ch28:186), "Two was before we successfully refunded nothing." (ch28:302), "Longer than my first request. Shorter than this meeting." (ch28:348), "I'm not rewriting them to prove I take prompting seriously." (ch28:352), and Eli's "We discovered who has to decide one when it does." (ch28:384) are all sharp and in voice. Idan's "Keep numeric zero too." is the right instinct and the right care.

**Principle.** Eli's rule (ch28:5, 7): "put the decisions it must respect in its signature and in examples of success and rejection" and "Run that command against the returned implementation." Testable and clear. Keep.

**The Turn.** Real and checkable. The "empty string is zero" bug arrives after the team thinks the work is done, the probe finds it, and the team decides the rule ("we refund whole cents, we don't coerce"). The reset.d.ts trick makes `JSON.parse` return `unknown` in this program; the claim that the later interface overload wins is correct TypeScript declaration-merging behaviour (later declarations' overloads come first). The coercing and non-coercing versions both compile and both pass the first two tests; the 5-test run distinguishes them, as the chapter says.

**Where the fun dies.** The config-and-declaration middle (ch28:61-127) is long for a bonus: `package.json`, `tsconfig.json`, and `reset.d.ts` are each shown in full. Keep the `reset.d.ts` and cut the manifest to its `check` script.

**Verdict.** The saved request (ch28:344-346) is the practical product of the chapter, and the in-scene discussion of who owns "someone here" (ch28:368-374) is the best ownership exchange in the bonus. Good.

- **05-bonus-ai-and-typescript/01-prompting-for-typescript.md:5** — Eli's Principle: "The configuration also checks the source files they import into the project, so a stricter setting can make the job bigger than you meant." — good, practical. Keep.
- **01-prompting-for-typescript.md:17** — the request text (quoted) — good, realistic.
- **01-prompting-for-typescript.md:19** — "The answer ends with: 'This validates the payload and returns a typed refund. Invalid JSON throws an error.'" — the assistant is unnamed and its output is quoted. Compliant with the bonus rule.
- **01-prompting-for-typescript.md:47** — `node src/probe.ts` prints `string 1001` — accurate: `"100" + 1` is `"1001"`.
- **01-prompting-for-typescript.md:55** — "`JSON.parse` handed it `any`." — accurate.
- **01-prompting-for-typescript.md:73** — `typescript: 7.0.2` — consistent with the book.
- **01-prompting-for-typescript.md:110-111** — the `reset.d.ts` `reviver` signature with `this: any` — accurate mirror of the lib signature.
- **01-prompting-for-typescript.md:115** — "TS2322: Type 'unknown' is not assignable to type 'Refund'." — accurate.
- **01-prompting-for-typescript.md:121** — "Our later overload wins this call." — accurate: later interface declarations' overloads are placed first in merged overload resolution.
- **01-prompting-for-typescript.md:203-224** — the second implementation: `Number(value.cents)` coerces `""` and `"100"`; the `typeof cents !== "number"` check after `Number` is dead code. Accurate and well observed (Idan, ch28:230).
- **01-prompting-for-typescript.md:236** — `const cents = value.cents;` keeps `typeof cents !== "number"` in the `||` chain, so `cents < 0` compiles. Accurate by reasoning.
- **01-prompting-for-typescript.md:266** — `{"ok":true,"value":{"id":"r1","cents":0}}` — accurate for the coercing version.
- **01-prompting-for-typescript.md:330** — "It compiles, but `rejects text amounts` fails on `""`... The other four pass... makes all five tests pass." — accurate.
- **01-prompting-for-typescript.md:346** — the saved request text — consistent with the final tests.
- **01-prompting-for-typescript.md:302** — "Two was before we successfully refunded nothing." — good.
- **01-prompting-for-typescript.md:330, 332** — "That line didn't get more intelligent. We finally asked it a different question." — strong.

**Speaker and pronouns.** Idan she (ch28:101, 232 "She replaces one line"), Dima he (ch28:192 "He selects the contract"; ch28:247 "He puts the assistant's..."), Chen (no pronoun), Eli (no pronoun). Correct.

**Compliance with the bonus rule.** No real AI model or product is named in this chapter. The assistant is "the shop's coding assistant" (ch28:13) and its outputs are quoted as saved text. The request and the answer are presented as artifacts. Good.

**Grade bonus 1: A.** The most original chapter in the book and the one that best earns "fun while you learn": the team makes the same mistake a careful reviewer would make and then fixes it with the tools the book has taught. Costs: the config-heavy middle. Enjoyed: "It validated the vibe.", "a parser written in English", "Two was before we successfully refunded nothing.", Eli's last line. Bored: the three full config files (ch28:61-127).


### Bonus 2: Whose Refund Is It? (05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md)

**Voice and fun.** Tight and sharp. Gilad's "Five euros. The customer asked for five euros." / "Our refund ledger says five dollars." (ch29:13-17), "No. We did something worse. We didn't convert it." (ch29:21), "There's your conversion department. One default." (ch29:112), "Congratulations to the descriptions." (ch29:184), Dafna's "Then require currency. No default." (ch29:188), "Whose answer would that be?" (Guy, ch29:255), "The caller's." (Dafna, ch29:259), Liron's "it shouldn't get to become Bob to refund it." (ch29:261), Gilad's "Otherwise refusing every refund would look beautifully secure." (ch29:358) and "The customer has expressed no preference about our schema." (ch29:376) are all in voice. The bonus rule is observed throughout: "the shop's assistant" is never named, and its outputs are quoted as saved transcripts and structured replies.

**The Turn.** The best reversal in the bonus. Liron's "Why does that field decide anything? The order already has the answer." (ch29:207) turns a schema-correctness fix into an authority question, and Guy's "Whose answer would that be?" (ch29:255) forces the ownership check to the executor. Liron's "the closure isn't the ownership check. That comparison is." (ch29:306) is the chapter's thesis, and the final replay demonstrates it.

**Principle.** Liron's rule (ch29:5) is clear: "A valid tool call is still a proposal. Build its executor for the authenticated customer, and ... check that customer against the order the call names." The second paragraph (ch29:7) adds "Successfully parsing a boolean called refundIssued hasn't issued anything." — the best line in the Principle of any bonus chapter. Keep both.

**Where the fun dies.** The Zod `io: "input"` and `io: "output"` detour (ch29:147-159) is accurate but it is the one place the reader leaves the ownership story. The fix it leads to (`description` generated from the input schema) is necessary; the explanation can be shorter.

**Verdict.** Short, specific, and the right rule: the executor reads the currency from the order and checks the owner. Gilad's "Run Bob's success as well as Alice's refusal before we ship." (ch29:358) is the test rule. Good.

- **05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md:5** — Liron's principle: clear and testable. Keep.
- **02-type-safe-agent-patterns.md:23-27** — the transcript quoted as text; the assistant is unnamed. Compliant with the bonus rule.
- **02-type-safe-agent-patterns.md:70** — "Zod is pinned to 4.6.2." — a real library version; the rule covers AI models and products, not libraries. Fine.
- **02-type-safe-agent-patterns.md:110** — `[{"orderId":"o-12","cents":500,"currency":"USD"}]` — accurate for the initial shop (currency defaulted).
- **02-type-safe-agent-patterns.md:155** — Zod 4 `io: "input"` vs default output: `required` lists differ (currency missing from input). **Accurate for Zod 4** as I understand its `toJSONSchema` io modes (`ZodDefault` is optional on input). Not separately executed; marked as the chapter's own claim.
- **02-type-safe-agent-patterns.md:178** — `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"USD"}}` — consistent with the default.
- **02-type-safe-agent-patterns.md:195** — `{"ok":false,"error":"invalid arguments"}` and `[]` — consistent with required currency.
- **02-type-safe-agent-patterns.md:229** — TS2339 "Property 'currency' does not exist on type '{ orderId: string; cents: number; }'." — accurate shape for the strict output type.
- **02-type-safe-agent-patterns.md:231, 241** — the strict schema rejects `currency` (strictObject) and the Bob-session result is success (no ownership check) — consistent with the story.
- **02-type-safe-agent-patterns.md:319-327** — final replay: `true`, `order unavailable`, `0`, Bob's success (USD), Alice's own (EUR). **Checked by reasoning**: the printed values match the code order and the `forSession` ownership check.
- **02-type-safe-agent-patterns.md:341-346** — `{"refundIssued":true}` and `{"refundIssued":false}` — accurate.
- **02-type-safe-agent-patterns.md:294** — `order.customerId !== customerId` check inside the closure — correct location of the ownership rule (the Liron point).

**Speaker and pronouns.** Gilad he (ch29:23, 199, 239), Dafna she (ch29:213, 257, 337), Liron he (ch29:205, 261), Guy (no pronouns). Correct.

**Grade bonus 2: A.** The strongest story-to-principle fit in the bonus section, and the best one-line ruling ("Whose answer would that be?") in the book. Costs: the Zod io detour. Enjoyed: the five-euro hook, the conversion department, "Whose answer would that be?", "Congratulations to the descriptions.", "The customer has expressed no preference about our schema." Bored: the Zod JSON-schema explanation (ch29:147-159), which is correct but out of the story's line.


### Bonus 3: What Did the Fix Fix? (05-bonus-ai-and-typescript/03-reviewing-ai-code.md)

**Voice and fun.** Sharp, procedural, and well-characterised, with the best argument-about-wording in the bonus. Noam's "You don't get to insert a word after I've reviewed the sentence." (ch30:225), Oded's "No *written* public API changes." (ch30:223), Eden's "We can keep the refactor. We can't keep calling that fallback an internal change." (ch30:301), Daniel's "It arrived as a type-error repair." (ch30:295), Oded's "So now it's explicitly the wrong contract." (ch30:396), Daniel's "And the declaration report would be identical." (ch30:408), and Oded's closer "I have a green pull request and a meeting four minutes ago." (ch30:414) are in voice and funny. The bonus rule is observed: the assistant is "the assistant" and its patch and replies are quoted as artifacts.

**The Turn.** Strong. The team's question "What did the fix fix?" (ch30:130) is answered by the declaration diff (`string` where there was a literal union), and the deliberate typo (`"refund"`) shows the submitted fallback printing whatever string arrives. The `as const` repair and the `satisfies` table are the chapter's technical payoff, and the verified `TS2820` "Did you mean" output is the right mechanism.

**Principle.** Daniel's rule (ch30:5, 7) is specific and testable: emit declarations before and after with the same settings, compare the public types including referenced aliases, and check the runtime values. The paragraph is long; the first two sentences are the procedure and that is enough.

**Where the fun dies.** The diff walkthrough (ch30:94-124, 233-246) is the chapter's longest stretch of code. Each diff is necessary to the argument, but the reader has to hold four files in mind. The mobile-caller section (ch30:227-255) is strong and could be shorter.

**Verdict.** Concrete and right: keep the table, the explicit return and the checked labels; keep the runtime tests; the declaration report is the evidence. Noam's rule for shared APIs (ch30:404) and Oded's replacement summary (ch30:410) are the best practical lines in the bonus section.

- **05-bonus-ai-and-typescript/03-reviewing-ai-code.md:5** — Daniel's Principle: clear and testable. Keep the first two sentences. Minor length.
- **03-reviewing-ai-code.md:23-52** — the starting files: accurate. `orderStatus` returns the inferred literal union (paid | partial | refunded) before the patch.
- **03-reviewing-ai-code.md:86-88** — `node check.ts` prints `3 statuses, 3 badges: passed` on the old commit — consistent with the cases.
- **03-reviewing-ai-code.md:94-124** — the diff: `labels` is an unannotated object; `orderStatus` returns `labels[refundLevel(order)]`. Accurate: the property values widen to `string`, so the inferred return becomes `string`.
- **03-reviewing-ai-code.md:196** — TS2345 "Argument of type 'string' is not assignable to parameter of type 'never'." — accurate.
- **03-reviewing-ai-code.md:206-213** — the `status.d.ts` diff: `string` replaces the literal union. Accurate and consistent with the widening explanation at ch30:219.
- **03-reviewing-ai-code.md:219** — Daniel: "The table properties are mutable. Their values widened." — accurate.
- **03-reviewing-ai-code.md:229** — Eden: "Back in the generics argument, I asked for explicit return types on APIs we intend to keep..." — accurate callback to ch6:228 (Eden's explicit return types).
- **03-reviewing-ai-code.md:243** — TS2322 for the mobile caller: accurate.
- **03-reviewing-ai-code.md:255** — "We lost the compiler asking me to fix a function that works. That was the attraction." — **unattributed**; speaker should be Oded. Minor clarity.
- **03-reviewing-ai-code.md:277** — `badge({ paidCents: 1000, refundedCents: 1000 })` returns `refund` with the typo — accurate (the fallback prints the string).
- **03-reviewing-ai-code.md:287** — `Expected refunded, got refund` — **verified by reasoning** against check.ts's `equal(actual, expected)` message order: accurate.
- **03-reviewing-ai-code.md:293** — TS2678 and TS2345 for the typo in the original — accurate codes and text pattern.
- **03-reviewing-ai-code.md:333** — `as const` restores the literal union; `status.d.ts` byte-identical to the original — accurate by reasoning.
- **03-reviewing-ai-code.md:374** — TS2820 "Did you mean '"refunded"'?" with `satisfies Record<RefundLevel, OrderStatus>` — accurate TS2820 shape (the satisfies/annotation check). The companion TS2322 is plausible.
- **03-reviewing-ai-code.md:380** — "all six assertions pass" — check.ts has six `equal` calls (3 status + 3 badge). Accurate.
- **03-reviewing-ai-code.md:390-392** — TS9007 on `orderStatus` under `isolatedDeclarations` — accurate message. **But** Daniel's next sentence, "It doesn't require a return annotation on every export," is misleading next to the TS9007 that has just fired on a function without a return annotation. The flag requires explicit return types on exported *functions*; it does not require annotations on every export (simple consts can be inferred). Fix: "It requires a return annotation on exported functions, but not on every export."
- **03-reviewing-ai-code.md:394** — annotating `: string` satisfies the flag and the project compiles with the fallback — accurate, and it is Daniel's point about "explicitly wrong".
- **03-reviewing-ai-code.md:414** — "a meeting four minutes ago" — the callback to "a meeting in six minutes" (ch30:13). Good.

**Speaker and pronouns.** Oded he (ch30:13, 414 no pronoun issues), Noam he (ch30:261 "He labels the experiment" — Noam ✓), Daniel he (ch30:204, 394 ✓), Eden he (ch30:231 ✓). The assistant is "it" throughout (ch30:138 "The assistant replies"). Correct.

**Grade bonus 3: A.** The most rigorous bonus chapter and the best practical template for reviewing generated code. Costs: the diff density and one misleading sentence about isolatedDeclarations. Enjoyed: "You don't get to insert a word after I've reviewed the sentence.", "It arrived as a type-error repair.", "It has a suggestion now.", "So now it's explicitly the wrong contract.", the meeting-minutes callback. Bored: the four-file diff walk (ch30:94-124).


---

## 3. Cross-book inconsistencies

1. **Process leaks in dialogue.** ch01:196 "In these snapshots, `Promise<UserProfile>`..." (editorial note inside Eden's speech); ch07:600 "We still owe `Unwrap` an explanation" (promise deferred; ch10:76-91 pays it, so the line should point to chapter 10 by number).
2. **Principle not stated as a rule.** ch01 (ok), ch02 (rule at line 21, buried), ch03 (five questions, no rule), ch05 (demonstration only), ch08, ch09, ch10, ch11, ch12, ch13 (Gilad's line 54 is the rule; not promoted), ch22 (long; testable sentence buried). Ch06, ch14, ch15, ch16, ch17, ch18, ch19, ch21, ch23 state rules clearly.
3. **Verdict as recap, not ruling.** ch08:420, ch09:391, ch14:367, ch15 (no restated rule), ch16:363 (rule present but leads with a list), ch20 (ok), ch10 (no ruling at all), ch11 (no Verdict; ends on a question).
4. **Missing Turn heading.** ch10 has no `## The Turn`; ch11 has no Verdict.
5. **Silent closers ("X leaves Y beside/in Z").** ch02:237, ch11:436, ch12:367, ch13:260 and 268, ch15:318 and 322, ch17 (none), ch24 (none), ch04 (none). Cut or give the closer a line.
6. **Same named type, different shape.** `RequestState<T>` uses `status` in ch03:267-271 and `kind` in ch05:309-313, both Dafna.
7. **Same name, different role union.** `User` with `role: "admin" | "user" | "viewer"` (ch01:214, ch02:172) vs `"admin" | "editor" | "viewer"` (ch03:460).
8. **Mislabelled example.** ch03:464-478 `AppConfig` labelled "library extension points"; contradicts the Verdict's `type`-for-data default.
9. **Checking flag contradiction.** ch24:140 turns `checkJs` on globally; ch24:185 proposes `@ts-check` per file as though it were still off.
10. **Date ambiguity.** ch22:21 and ch22:133 both say "the third" with different referents; ch22:135 "high totals ... for every country" contradicts the grouping on the next line.
11. **Assertion disagreement, deliberate.** ch11:455 accepts `lessSpecific: ExportBuilder = sourcePreset`; ch12:390 rejects it after `in out`. Correct as written (ch12 says so), keep.
12. **Eden's line on return types.** ch06:228 and ch23/ch03 callback ch33 (ch30:229) agree; fine.
13. **Chen's "arms crossed" bio.** ch07:98 gives Eden folded arms, duplicating Chen's signature gesture.
14. **Oded's Friday/forty numbers.** Forty callers (ch10:11, ch10:400) consistent; "forty components" (ch02:110) is a different number, fine.

## 4. Top 15 for release (ranked)

1. **ch01:196** delete "In these snapshots..." (blocker; editorial leak in a character's speech).
2. **ch06:228-232** the createStore/get exchange answers questions nobody asked; rewrite as one coherent exchange.
3. **ch24:185** `@ts-check` proposal contradicts the global `checkJs` turned on at ch24:140.
4. **ch07:600** "We still owe Unwrap" points at ch10 by number, or is cut.
5. **ch03:464-478** `AppConfig` mislabelled and contrary to the Verdict.
6. **ch10** add a `## The Turn` heading and a stated ruling in the Verdict; the chapter is otherwise the best mystery in the book.
7. **ch11** add a Verdict or a closing line after Chen's dangling question.
8. **Principles stated as rules** in ch08, ch09, ch10, ch11, ch12 (one sentence each at the top of the Principle; models: ch06 and ch14).
9. **ch08:420-422 and ch09:391-393** convert Verdict recaps into rulings.
10. **ch05 Principle** state the rule before the control-flow demonstration; cut the first half's `typeof`/`in` inventory.
11. **ch16:52 and ch24:7** cut manual-register architecture paragraphs to the rule and one example.
12. **Silent closers** (ch02:237, ch12:367, ch13:260 and 268, ch15:318 and 322, ch11:436) cut or give the closer a line.
13. **ch22:21, 133, 135** fix the two "third" referents and "for every country".
14. **ch03:267-271 vs ch05:309-313** unify `RequestState`'s discriminant; and unify `User.role` across ch01/ch02/ch03.
15. **ch30:390-392** correct Daniel's sentence on `isolatedDeclarations` (it requires return annotations on exported functions, not on every export).

Also worth doing if time allows: ch17 and ch13 decide or label the open choices; ch19 and ch25 trim the second build-order and finance-numbers subsections; ch18 rename repeated `slaStatus` and `dashboardStatus`.

## 5. Per-chapter grades

- Prologue (dedication, how to read, cast): **B+.** The cast bios are the book's warmest writing; Dima's bio opening sentence is garbled (`02-meet-the-cast.md:239`).
- ch01 any vs unknown: **B+.** Best opening debate; sags in generics/overloads; blocker at line 196.
- ch02 type assertions: **B+.** Gilad's 3 AM timeline; Principle rule buried at line 21.
- ch03 interface vs type: **C+.** Honest, but a convention with a weak Principle and a mislabelled example.
- ch04 enums vs unions: **A-.** Balanced, funny, and a Turn that ends on a human decision.
- ch05 narrowing: **B-.** Idan's "build the value" is strong; first half is an inventory and the Principle has no rule.
- ch06 generics: **B+.** Clearest Principle so far; the createStore exchange is incoherent.
- ch07 conditional types: **B+.** The `Exclude` reveal is the book's best "aha"; tail on `never`/`any` drags.
- ch08 mapped types: **B.** Sharp PR scene; Principle and Verdict are weak.
- ch09 template literals: **B.** Funny; the same question argued three times.
- ch10 infer: **B.** Best bug-hunt; no Turn heading, no ruling, very code-heavy.
- ch11 generic builder: **B-.** The `this`-typed builder works; ends on a question.
- ch12 variance: **B.** Clear design result; three passes at one mechanism.
- ch13 declaration merging: **B+.** Tight bug and good Idan line; three tangents after the Verdict.
- ch14 error handling: **A-.** Liron's principle applied; long adapter detour.
- ch15 branded types: **A-.** Real turn (spread keeps brand); class detour.
- ch16 runtime validation: **B+.** Real refund bug; narrator spec paragraph.
- ch17 immutability: **A-.** "Was 80. Now 80." is a strong hook; two alternatives left unchosen.
- ch18 pure functions: **A.** Planted, fair reveal (`deadlineFor` reads the host clock).
- ch19 imperative vs declarative: **A-.** Numerate and funny; finance-numbers run is long.
- ch20 currying: **A-.** The map-index gag pays off every time.
- ch21 higher-order functions: **A.** The accepted-before-abort Turn.
- ch22 config to function: **B+.** Vivid audit failure; two evaluators doing one job.
- ch23 monads light: **A.** Thenable reveal; best-argued bug in the act.
- ch24 migration: **A-.** The sitemap trap; checkJs contradiction.
- ch25 monorepo: **A-.** `#cents` reveal and the image refusing type stripping.
- ch26 testing typed code: **A.** Funniest back-half chapter; every reveal is physical.
- ch27 performance: **A.** Cleanest "measure first" lesson; title joke lands.
- Bonus 1 prompting: **A.** Unnamed assistant, real bug found by probe; best use of the bonus premise.
- Bonus 2 agent patterns: **A.** "Whose answer would that be?" is the book's best one-line ruling.
- Bonus 3 reviewing AI code: **A.** Most rigorous review template; one misleading sentence (`isolatedDeclarations`).

## 6. Overall readiness verdict

**Ready after fixes.** The book's premise works: from roughly chapter 17 on, the debates are funny, the characters have distinct voices, and the technical claims I checked with TypeScript 7.0.2 held (the assertion, enum, interface, conditional, infer, variance, Awaited, and `forward` claims all compiled or failed as stated). The late book keeps the early book's register; it does not drift into corporate summary, apart from the Verdict recaps in ch08, ch09, ch16 and ch23. Before print: fix the blocker at ch01:196, the two process leaks (ch01, ch07), the incoherent ch06 exchange, the ch24 checkJs contradiction, the mislabelled ch03 example, and add the missing Principles and Turn/Verdict headings in ch08-ch12. Those are a day of editing, not a rewrite. I did not spot any character acting against their bio in a way that needs redrafting; the main voice risk is that Chen and Eli recede in some late chapters, which is acceptable.

Counts (approximate, from my per-chapter notes): blockers 1; major about 20; minor well over 100.
