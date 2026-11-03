# Whole-book review: haiku-technical (technical reader perspective)

## 1. Ledger

Cast pronouns (from bios in 00-prologue/02-meet-the-cast.md; bios mostly avoid explicit pronouns, so inferred from the bio's own pronoun use):
- Idan Greenfield: she/her (explicit: "Her formative years", "Her copy").
- Linoy Nightly: she (bio: "She's the early adopter").
- Dafna Functor: she ("Dafna writes", "Her pipelines").
- Chen Override: he ("unfold his arms").
- Eli, Daniel, Gilad, Liron, Sahar, Noam, Oded, Eden, Guy, Dima: he (bio uses "he").
- Gil Benchmark: no pronoun in bio (refers by name only).

Stances (bio):
- Eli: wants the claim stated precisely enough to test; removes requirements.
- Daniel: compiler is the arbiter; asks for playground + compiler version + diagnostic.
- Gilad: "Show me the stack trace"; operational failure lens.
- Liron: FP/design; parables; "Complexity is a choice".
- Sahar: removal; checks whether the caller needs the abstraction.
- Noam: type safety absolutist; any = on-call page.
- Oded: velocity; "We can fix it in the next sprint."
- Gil: data-driven; "What does the data say?"
- Eden: migration path; "I've seen this fail at scale."
- Linoy: cutting edge; "There's an RFC for that."
- Chen: Socratic; "But have you considered..."
- Dafna: FP purist; "That's just a map."
- Guy: OOP; "Where's the interface?"
- Dima: balanced; "Both have a point here."
- Idan: parse-don't-validate; "Prove it by producing it."; wants return type to fail compile when a required field is missing.

Running settings and conventions (from prologue):
- Target: TypeScript 7, checked with 7.0.2; strict on; exactOptionalPropertyTypes on except when comparing; noUncheckedIndexedAccess OFF.
- Chapter 1 cast: Oded/Noam exchange on req.body in the admin dashboard logging middleware (cited in 00-prologue/01-how-to-read.md).
- Cast bio stories to track: Oded/Noam optional chaining debate (45 min); Gilad import tool retry queue; Eden 3M lines; Eli event system with duplicate arrival.

## 2. Findings, by chapter

### 00-prologue/00-dedication.md
- No issues.

### 00-prologue/01-how-to-read.md
- Lines 61-69 (code section): states strict on by default in TS 7 and exactOptionalPropertyTypes on. Technical claim to verify (see verify notes below).
- Line 17: "That's an exchange from Chapter 1." Chapter 1 must contain it (checked when reading ch1).

### 00-prologue/02-meet-the-cast.md
- Line 15, Eli bio: "Guy stayed at the board with him; Oded went to find the retry code." Retry code story: Gilad bio (line 47) also has Oded and a retry queue. Possible overlap, worth checking against chapters.
- Line 237: "Dima has said validating things about both sides" — garbled phrasing (minor).
- Line 258-263: Idan's bio says "An explicitly annotated predicate can omit the new check" - a technical claim that must match the chapter on runtime validation/branded types.

### 01-the-type-system/01-any-vs-unknown.md (ch1)
Verified with tsc 7.0.2 (strict default true confirmed): never/number/unknown errors match the prose; `firstElement(any[])` gives `any` and no error on a missing method; `Unwrap<any>` is `any`; `isPurchaseData` compiles as written; `handleWebhook` compiles.
- :194-196 `"In these snapshots, \`Promise<UserProfile>\` describes the value the promise will resolve to..."` — category: AI-feel/clarity; severity major. Editorial meta-note ("snapshots") dropped into Eden's dialogue. Reads like a note to the reviewer, not a character. Fix: cut it or move the point into Eden's line as speech.
- :276 `"The next example previews a conditional type. Its result for any is the point here; the rules behind that result will get their own debate."` — AI-feel (narrator explaining like a manual, book-meta). Severity minor. Fix: cut; let Daniel's line introduce it.
- :81 vs :108: Noam says Oded added the `any` "six months ago"; then "That parameter had been there for eight sprints." Six months is ~12 two-week sprints. Category: inconsistency; minor. Fix: say "a year" or "eight sprints ago" consistently.
- :169-171 vs :184: fine.
- :606 vs :613 (before/after code): before `logEvent(action, user)`; after `logEvent(event.type, event.data)`. The "after" passes the whole unchecked `data` where the "before" passed `user`; the behaviour changed for every event type, and the prose says nothing about it. Category: technical/clarity; minor-major. Fix: pass `event.data` on purpose and say so, or keep `user` after the check.
- :684-686 / :679-685 `processOrder` calls `chargeUser(...)` (returns `Promise<void>`) without `await` or `return`, so the rejection is unhandled. In a chapter whose point is "make the boundary safe", a TS developer would flag this. Category: technical; minor. Fix: make `processOrder` async and `await chargeUser(...)`, or note the fire-and-forget.
- :617 "The checks in its body supply the evidence for that claim." Accurate. Good.
- :592 Verdict item 4 claims noImplicitAny is part of TS 7 default strict; confirmed (strict default true, and noImplicitAny is a strict family member). OK.
- :632-640: `PaymentMethod`, `User`, `Order` types appear after use in prose, but are declared in the snippet, OK.
- :364-371 Express `req.body` as `any`: accurate for @types/express in current versions; no issue.
- Principle (:7) is stated up front and is a rule (keep unknown until checked; account for any escape hatch). Easy to apply. Good.
- Debate turn (:559-581) is a real turn: Daniel makes the ticket-without-removal point concrete. Good.

### 01-the-type-system/02-type-assertions.md (ch2)
Verified with tsc 7.0.2 (verify/haiku-technical/ch2/a.ts): `"purple" as Color` compiles (prose correct); `{primary,secondary,accent:"purple"} as Record<string, Color>` errors with TS2352 and `satisfies` errors on the same literal (prose correct); `cat as Dog` errors, `as unknown as Dog` compiles (correct); `as const` type and `Config` example correct; `Map.get` / `!` examples fine. The technical claims in this chapter are mostly accurate.
- :371-372 / :96 / :110 consistency: centralized ApiClient with TODO ticket matches Eden and Noam. Good.
- :306 Chen: "after a `.filter()` that guarantees it, after a null check three lines up that the compiler can't trace." Category: technical; severity minor. Since TS 5.5 an inferred type predicate narrows `arr.filter(x => x !== undefined)` to `number[]` (verified). The example is true only for `filter(Boolean)`-style predicates. Fix: say `filter(Boolean)` or drop the `.filter()` example.
- :199 "That's 10 lines for a test that checks one field." The literal runs 10 lines plus the closing brace (189-198). Minor counting nit; fix: "ten lines" is fine or say "eleven lines" — low priority.
- :237 "Noam leaves the factory on the screen. Oded leaves a comment beside the test naming the fields it is supposed to exercise." Category: AI-feel (the "leaves X beside Y" silent closer the brief names). Severity major for AI-feel: Oded and Noam have not conceded anything; the sentence summarises the outcome instead of letting the argument land. Fix: cut, or give one of them a line.
- :364 "An unchecked assumption can fail far from where it entered the program. The stack trace may tell you which field was used without telling you why the compiler believed it existed." and :366 "Every assertion is a bet that the world outside your program still matches your model of it." Category: AI-feel (aphorism closer). Minor-major. Gilad is the one who says these; his bio is "Show me the stack trace" and terse. Fix: shorten to one concrete line, or let Noam answer.
- :376 Verdict: "An assertion that overrides the compiler is a bet against runtime reality." Also a tidy aphorism. Minor. The Principle/Verdict rule itself is clear: justify by what you know and by "how will I find out".
- :402 Oded/Gilad attribution: `— **Gilad Stacktrace**, without looking up:` placed after Oded's quote in one paragraph, reads as a broken line. Category: clarity; minor. Fix: separate paragraphs.
- :386 Verdict table row "Checking shape without widening | satisfies | Not needed — use satisfies" is self-contradictory (column says "Assertion acceptable?"). Category: clarity; minor.
- :404 Linoy: "They just can't deprecate `as` without breaking the internet." Clever quip; fine. Keep.
- Principle (:9, :21) is stated and testable: "write an assertion only where you can say what you know that the compiler can't check, and how you know it." Good.
- :5 cross-reference "Last time, Noam called an assertion a localized lie, and Dima pointed out..." matches ch1 (:320, :347). Consistent.
- Story: Gilad's "Turn" (:358-372) is a real turn: it moves the debate from types to runtime evidence. Good.
- Cast consistency: Eden says "a codebase with 400 API calls" (:96) — no conflict elsewhere yet; note as a possible running number. Ch1 Eden's "three-million-line migration": ok.

### 01-the-type-system/03-interface-vs-type.md (ch3)
Verified with tsc 7.0.2 (verify/haiku-technical/ch3): intersection `id: string & number` gives "Type 'string' is not assignable to type 'never'" at the literal (prose correct); `interface extends` conflict gives TS2430 at the declaration (correct); duplicate `type` gives TS2300 (correct); exhaustive switch with explicit `string` return (correct, and adding a status would error); the Dafna "only type can do" list is accurate (tuple/template/mapped/conditional); the global `User` merge example merges as claimed (verified c.ts). Express augmentation claim (:180) could not be verified here (no @types/express in the workspace); it matches the published typings as I know them.
- :5-7 and :33 Principle (severity major, category clarity). The Principle is three questions ("Does other code need to reopen it? Where should a conflict be reported? Does it name something other than an object?") and an instruction to pick a convention. A reader cannot state a rule from that after one read; the crisp rule ("interface when other code must reopen it or you want declaration-time conflict checks; type for data, unions and other type expressions; otherwise one convention") appears only in the Verdict (:429). Fix: state the rule in Eli's Principle line, then let the Debate test it. (The memory note "Principle must be stated" applies here.)
- :245 `type Coordinate = [x: number, y: number, z: number];` labelled "interface can't do this cleanly" with the comment only; fine, but "cleanly" is a hedge a reader will question (interfaces can't express tuples at all). Minor.
- :226-227 Dafna: "You don't need to read every line." Fine as a voice moment.
- :389 Oded/narrator-ish: "The overhead of the decision is more expensive than the occasional suboptimal choice." — summary/aphorism, AI-feel minor. Cut or let Oded say it shorter.
- :407-409 and :411 blueprint/description metaphor: Liron's parable, in voice. Keep. Not AI-feel.
- :442 Verdict table: "Library public API (consumers may extend) | interface | Declaration merging enables augmentation" — consistent with :152-180.
- :455-460 `role: "admin" | "editor" | "viewer"` in ch3, while ch1 (`UserProfile`) and ch2 (`User`) use `"admin" | "user" | "viewer"`. Cross-book: minor. Fix: align the role union across the chapters or note they differ.
- :211 Chen's merged example: merged result claim is correct, but the setup is contrived (two `declare global` interfaces) which the text admits. Fine.
- :218 Daniel: "Declarations merge when they refer to the same interface in the same scope. Two User interfaces in separate modules do not merge" — correct and useful; keep.
- Story: Guy's conflict-at-declaration argument and Dafna's "I still use intersections in generics" (:141) concede a point; this is a real debate. Good.
- :349 Linoy "It predates the TypeScript 7 native compiler." Accurate in spirit; the wiki page does predate TS 7. Fine.
- Verdict (:429) and table (:435) say "interface is also reasonable" for plain objects; this sits under "our default is type for data", so a reader gets two rules for plain objects. Minor clarity.

### 01-the-type-system/04-enums-vs-unions.md (ch4)
Verified with tsc 7.0.2 and node (verify/haiku-technical/ch4): union error text at :73 matches the compiler's order exactly; `Color["red"]` error at :177 matches (TS2551 with "Did you mean 'Red'?"); `SdkStatus` to literal union assignment compiles and `sendToSdk("active")` errors (:407) as stated; `as Record` with fromEntries compiles and `nameByCode[404]` is "NotFound"; TS2748 at :118 reproduces exactly with an ambient `.d.ts` const enum under --isolatedModules (not with a .ts const enum, which is fine); `Object.values(Direction)` output at :372 matches node. Technically this is the most accurate chapter so far.
- :138 vs :188 `enum HttpStatus` then `const HttpStatus = {...} as const` in the same chapter, with Daniel's "we can build the reverse object ourselves" (:181) between them. Category: clarity/technical; minor. The two declarations are alternatives, but a reader sees one name declared twice. Fix: rename the object (e.g. `HttpCodes`) or label the snippet "instead of the enum".
- :359 Verdict-adjacent prose: "iterate the entries: `Active` is the label and `"active"` is the value." The code beside it uses `Object.values(Status)`, which returns only values. Category: inconsistency (prose vs code); minor. Fix: use `Object.entries` in the code or say "values".
- :181 "Indexing that type by all its names gives the union of the values: 200 | 404 | 500." Applies to the enum's type in prose, but the following code uses the const object; readers may think the claim is about the enum. Minor, same fix as above.
- :445 table "Numeric enum when it reduces maintenance" vs Verdict :437 "Keep numeric enums where their built-in reverse map earns its place": consistent, but the two use different criteria ("reduces maintenance" vs "earns its place"). Minor.
- :100 Noam: "For the enum, tsc emits that initialization code whether this caller needs the object or not." Accurate (IIFE emitted for non-const enums). Good.
- :501 Zod 4 claims (`z.enum([...])` and `z.enum(SdkStatus)` accepting a TS enum) match the Zod 4 API as I know it. Not verified (no zod install in workspace).
- AI-feel: :245 Oded "That's the line that makes me want to close the tab and go outside." Good voice. :429 and :425 read like people. Keep.
- Turn (:417-433): Sahar's "Is the enum simpler, or just more familiar?" and Guy's "Sometimes it's about the room" land as a real concession. Good.
- Principle (:7) is a clear, testable rule ("for a fixed set, start with a type; add a runtime representation when a caller must look up, list or name values; check the emitted output"). Good.

### 01-the-type-system/05-narrowing-strategies.md (ch5)
Verified with tsc 7.0.2 (verify/haiku-technical/ch5/a.ts): `isUser` with `in` narrowing compiles; `greet`, `greetOrFail` (asserts) compile; handwritten `parseUser` compiles; `inputs.filter(isUser2)` gives `User[]`; `describeRequest` exhaustive switch and `parseEvent` compile; the `isUser(x)` always-true predicate lets `x.email.toLowerCase()` through the compiler (as claimed, :146-149). Zod parts (:369-384) not verified (no zod in workspace). Runtime results at :409/:416 match the handwritten reason string. The compile-level claims in this chapter check out.
- :5-42 Principle (severity major, category clarity). The Principle is a demo (Daniel's typeof/null checks), then four ideas in one section: control-flow narrowing, `!=` vs `!==`, predicates vs assertion functions, and "build the typed value". No single testable rule is stated up front. The closest line is :34 ("The compiler follows the check you wrote, even when you meant a different one"), and it is not the rule the debate tests. Fix: state the rule (e.g. "A narrowing is only as true as the check that produced it; a type predicate or assertion is a promise the compiler will not verify") before the demo, and keep the parser material to the Debate.
- :457 Noam's Additional Take: "If `isUser` has its own field checks and a predicate annotation, adding a required field to `User` won't force those checks to change." Category: debate / logic; severity major. Idan's argument at :257 is exactly that this silent non-change is the defect ("An explicitly annotated predicate can omit the new check and keep compiling"). Noam presents it as a benefit, and no one answers. Fix: have Noam concede the trade-off, or have Idan answer it in the Take.
- :155 vs :457: Noam keeps the predicate tests; consistent, but :457 contradicts the point above it. Same fix.
- :263 `const isUser = (v: unknown): v is User => parseUser(v).ok;` compiles and is a sensible bridge; the prose ("That filters the original objects") matches.
- :201-203 Guy: "You used `ApiUser.parse(raw)` in your API example." Matches ch2 :89. Good cross-reference.
- :327 Daniel's "Without that return annotation, the inferred result can become string | undefined." Accurate (for a non-exhaustive future switch).
- :366 Linoy: "required an email address rather than just a string" with `z.email()`: Zod 4 top-level form, consistent with ch4's Zod 4 reference. Not verified against a Zod install.
- :434-436 "The Debate Continues": open ending is justified here (Idan/Dafna vs Guy on failure routing is a real disagreement) and the table at :438-447 turns it into a usable rule. This is the book's honest-open-ending pattern done well. Note: :434 "The room has agreed..." is a summary sentence; minor.
- :138 Dafna "This body would satisfy that signature too" and the example at :141-151 is clear and memorable. Good.
- :48-50 Linoy's opening speech is a bit manual-like ("There are a few runtime details you have to remember."); minor AI-feel. Minor.
- :201-215: the Guy/Noam/Dafna/Idan exchange on who catches the exception is a good, specific debate. Keep.
- Story: Turn (:400-430) and Gilad's "same bad input" test is concrete. Good.
- Bio fit: Idan's bio (predicate can omit the new check; "Prove it by producing it") matches :225-257 and :263. Guy's bio ("catch a validation error once and end the operation") matches :193-215. Dafna's bio (wants failure in signature) matches :191-209.

### 01-the-type-system/06-generics-basics.md (ch6)
Verified with tsc 7.0.2 (verify/haiku-technical/ch6/a.ts): the `get(settings, "fontsize")` error text at :196-197 matches the compiler exactly; `createStore(null)` then `set({id})` error at :217-218 matches; `parseConfig<{retries}>` compiles and `JSON.parse` returns `T` without the cast (:257-262); `const` type parameter keeps readonly tuple (:364); `NoInfer` rejects "blue" (:366) and without it "blue" joins the union (verified: no error); `identity("hello")` is literal "hello"; `pluck`, `sortByName`, `firstItem` behave as described. (One unrelated name clash in my scratch file, not a book issue.)
- :20-22 Principle (positive). The rule is stated and testable: "Look for where the type argument comes from and what depends on it; a return-only T supplied by the caller is an unchecked claim; remove a parameter that affects nothing else after checking callers." :22 correctly separates "when to generalize" from "what the signature promises". Good.
- :82 Daniel: "This annotation includes that missing case. But nothing in the return depends on T." Accurate, but "This annotation includes that missing case" is muddy: it reads as if the annotation covers undefined; the point is that `string | undefined` admits the undefined case the library's `string` hides. Minor clarity. Fix: "The annotation admits the case where stringify returns undefined; the library's declaration hides it."
- :298-301 / :327: ParseResult<T> with one T fine; Idan's reply (:301) is clear.
- :308-323 Turn (Liron's lens/photograph metaphor): weakest passage in the chapter. Category: clarity / debate. Severity major: Chen asks a precise question ("And identity? It returns exactly what it got. What did the lens do?") and Liron answers "the image only gets us so far... It can be carrying information that an unknown return would lose." That reads as a non-answer, and the Turn does not change the argument. Fix: give Liron a concrete example (e.g. `identity` keeps `"hello"` literal where `unknown` would widen nothing; or a generic that returns `Map<K, V>` for a caller) so the Turn lands.
- :370 Eli's closing line: "We can also compute with that type variable: branch on it, walk an object's keys, build another type from it." Category: AI-feel (tidy triplet, teaser). Minor. Cut the triplet.
- :336 Verdict table: "An unconstrained <T> appears only as a parameter type and affects nothing else" — the prose (:327) says "A parameter that affects nothing else"; the table row says "appears only as a parameter type" (true for logPayload) — consistent, but the verdict row mixes the two ideas. Minor.
- :344-352 pluck example — `pluck(team, "department")` gives `string[]` (verified). Good.
- :356-358 `loadState<T>` with `localStorage` — accurate ("any → T") — good.
- :364 Linoy's `const T` and :366 `NoInfer` details accurate (TS 5.0 and 5.4). Good.
- Story: Eden's createStore story (:202-232) is concrete and fits the migration voice. Good.
- Cast/bio fit: Oded's billing and "sortEmployees" stance (:165, :173) match his "wait for the second caller" stance; Noam's "We don't need to wait for a second caller" (:61) matches; Dima's :57/:63 synthesis matches his bio.
- :175 Daniel's aside about `extends` in conditional types leads into ch7 nicely. Good.

### 02-advanced-typescript/01-conditional-types.md (ch7)
Verified with tsc 7.0.2 (verify/haiku-technical/ch7/a.ts, b.ts): nearly all compiler claims hold: `Reply<any>` is both branches; `any extends unknown` is only the true branch (`"ran"`); `any extends string ? 1 : 2` is both; `Direct = never extends string` is "ran"; `ViaParam<never>` is never; `[T] extends [never]` works; `Exclude<boolean,false>` is true; `Exclude<Mixed,string>` is 42 while `StrictExclude<Mixed,string>` errors; `StrictExclude<Channel,"smss">` gives TS2344 with the quoted text (:460); the conditional-return `slugify` body errors (:215-218) match in shape; the `slugify4` wrong-branch body compiles and `many4.map` fails at runtime as stated.
- :126-132 quoted TS2769 diagnostic. Category: technical (output mismatch); severity major. The book quotes "Overload 1 of 2, '(title: string): string', gave the following error. ... Overload 2 of 2 ..." TS 7.0.2 prints only "The last overload gave the following error. Argument of type 'string | string[]' is not assignable to parameter of type 'string[]'." (verified twice, terse and --pretty false). The book says all checks use 7.0.2. Fix: replace the quoted block with the 7.0.2 text (or say "older compilers print every overload").
- :17-19 Principle (major, clarity). The Principle explains the syntax ("extends asks a question"), not a rule to apply. The rule readers need is in the Verdict: "Choose based on how clearly you can describe and maintain the relationship." That is judgment with no test. Fix: state the testable rule up front, e.g. "Use a conditional return when the output type depends on the input type and more than one signature would repeat the same case; otherwise use overloads or a union." The table at :586-594 already contains that rule.
- :364 Oded's "Two hundred and six `Exclude`s and `Extract`s" and "deleted eleven generics" — story continuity with ch6 (logPayload) holds. Good.
- :333 Oded's wrong-but-plausible reasoning about `Exclude<Channel,"push">` then Daniel's correction at :335 is a good teaching turn. Keep.
- :301 Oded: "You put my name on this PR, didn't you?" — unexplained. Category: clarity; minor. Fix: say what Linoy did with his name (a comment? the example?).
- :259, :279, :112, :120 and :141 unattributed quotes ("Break it. I want to see that."; "Compiles."; "Overloads. Two signatures..."). Category: clarity; minor. Speakers are inferable from the pointing action, but a reader has to work it out. Fix: attribute at least the :259 line.
- :350 Daniel: "That is the entire mechanism of type-level filtering: the members you want gone come out as `never`, and reassembly drops them." Category: AI-feel (summarising sentence after a correct explanation); minor. Cut "That is the entire mechanism ..." or leave Daniel's shorter version.
- :463 Linoy: "Both meanings of `extends`, one line. The gate rejects the typo before the question runs." Category: AI-feel (neat closer); minor.
- :390 Linoy's "The false branch was `T` itself, so it contributed `any`, which absorbed the other result. So unions distribute, `never` vanishes—" is accurate for Unwrap but the sentence is about Reply<any>, whose false branch is a literal and does not absorb anything. The reasoning is elided. Category: technical/clarity; minor. Fix: keep the Reply example's reasoning separate from Unwrap's.
- :427 "With `any`, the checked type matters too... Wrap it, and the checked type is the tuple `[any]`, which is assignable to `[string]`." Correct (verified). Good.
- :434 "Against `unknown`, as here, or `any` itself, it takes the true branch." Verified for `unknown`/`any` extends types. Good.
- :499-513 NonNullable change in 4.8 and `{}`: accurate. Good.
- :586-594 table: rows are consistent with the Debate. Good.
- Cross-chapter: ch1 :276-292 said "The next example previews a conditional type ... will get their own debate." This is the debate. ✔. Chapter 1's Unwrap<any> statement "the any branch absorbs the other result" matches :390 (for Unwrap only).
- Story: Eden's bio — "the junior ... lost an afternoon" (:479) fits his migration-veteran voice. Good.
- Story: the Turn (:521-557) moves from the type question to normalizing at the boundary, which is Dafna's pipeline stance. Real turn. But the Turn is also the reason the book keeps two functions, which the Verdict reports. Good.
- Quality: this is the strongest debate chapter so far for a working developer: the "Break it" wrong-branch example and "test per branch" give concrete takeaways. Keep.

### 02-advanced-typescript/02-mapped-types.md (ch8)
Verified with tsc 7.0.2 (exactOptionalPropertyTypes on, verify/haiku-technical/ch8/a.ts): every compiler claim checks out: `{ email: undefined }` errors only with exactOptionalPropertyTypes (strict alone compiles, :141-146); `ImportedUpdate` accepts `{ email: null }` and `UpdateUserRequest` rejects it (:167-169); the `@ts-expect-error` line is satisfied (:206-207); `selected.displayName = ...` is a readonly error (:242-243); `Editable<T>` gives the three required fields (:255-256); `errors.emali` errors (:353); `Labels` satisfies check works; `snapshot.values.bio` compiles and `snapshot.values = ...` errors (:444-445); `JSON.stringify({email: undefined})` is "{}" and `"email" in` is false/true as stated (:426-435). The mapped-type code is the most accurate of the chapters so far.
- :5-41 Principle (major, clarity). The section opens on a story, then Daniel gives the definition of `Partial` ("keyof T gives us the keys ... That's a mapped type"). That is a definition, not the chapter's rule. There is no testable statement such as "derive the write type from the record only by selecting keys from the contract, and keep the published contract explicit", so a reader cannot say what the chapter teaches after one read. Fix: state the rule in Daniel's or Guy's first lines, and make the Verdict repeat it.
- :420-422 Verdict (major, clarity). The Verdict describes what this team decided ("The published request keeps its three explicit properties. The form derives ...") but gives no rule a reader can apply to their own codebase. Compare the Verdicts in ch5 (table) and ch7 (table). Fix: add a short rule and a situation table, or a "when to derive, when to copy" check.
- :338-416 The Turn (major, debate/story). The Turn is a bug path (the email input should complain, so the error type is written with `FieldErrors`). It does not change the argument about derived vs explicit types; it adds a second, smaller argument about error keys. Fix: make the Turn the moment the team's derivation is shown to fail a real rule (e.g. the mobile import), or move the error-key material to an Additional Take.
- :9-45 and :152-226: the chapter's length (about 460 lines) and the number of micro-exchanges ("Oded counts", "Guy marks the mapping as reviewed", "Eden gives Oded a fixture") make it feel like a code review rather than a debate. Category: voice/story; severity major for a reader's patience. Fix: cut two of the four sub-debates (the readonly/`Editable` one and the labels one) or move them to a follow-up.
- :302 Guy: "The endpoint accepts just a biography." The endpoint accepts displayName, email and bio (:73-78, :76 "Guy: ... the three fields"). Category: inconsistency; minor. Fix: "The endpoint accepts a biography change without an email."
- :290 "Oded changes the biography and clicks Save. The email input turns red." then :296 Linoy "It's empty. The validator checks every input before we build the request." — consistent with later :306. Good.
- :150 "The remaining examples enable both strict and exactOptionalPropertyTypes." This matches the prologue's claim. Good.
- :168-169 comment "Error: null is not assignable to string." Compiler text: "Type 'null' is not assignable to type 'string'." Matches. Good.
- :420 Verdict (summary sentence): "Labels and field errors follow the form's keys." Accurate. (Part of the same verdict issue above.)
- :258-261 Linoy: "Leave a modifier alone in this mapping and it carries through. Add ? or readonly and you put it on." Accurate and clear. Good.
- :459-460 Oded: "Put that in another PR." Nice closer; in voice.
- Cross-book: ch8 `User` = {id, displayName, email, bio?, roles}; ch2 `ApiUser` = {id, name, email}; ch3 `User` = {id, name, email, role, createdAt, updatedAt, preferences, team} and ch3's second `User` = {id, email, role, ...}; ch5 `User` = {id, email, displayName}; ch1 `User` = {id, email, paymentMethod}. Five different `User`s, two of them with `displayName`, one with `name`. Category: cross-book inconsistency; minor. Fix: note in ch5 or ch8 that the record differs, or rename the example types (e.g. `Account`, `Member`).
- AI-feel: line 437-448 Noam's additional take is in character. Good. Line 424-435 Daniel's take — good.
- Voice: Oded's "I'm going to keep looking for Editable." (:263) and "Put that in another PR." (:460) are the strongest lines; Guy's "Where's the interface?" (:67) is in character.

### 02-advanced-typescript/03-template-literal-types.md (ch9)
Verified with tsc 7.0.2 (verify/haiku-technical/ch9): `on`/`publish` inference from `${K}Changed` works (`value` is number, `toUpperCase` errors); `"fontSzieChanged"` errors with the union in the message; `publish("fontSizeChanged", false)` errors; `publish<SettingKey>("fontSizeChanged", false)` compiles (:400 correct); `satisfies` with the mapped template type catches a missing key and a swapped name (:248 correct); `AllowedAuditEvent` rejects `"profile:paid"` while `AuditEvent` accepts it (:273, :304 correct); `SettingsChange` rejects the `false` payload (:419 correct); `DefaultEvents["fontSizeChanged"] = 16` errors "not assignable to 14" (:432 correct); `writes.ts` compiles as written, including the generic `settings[key] = value`.
- :5-57 Principle (major, clarity). Same problem as ch8: the Principle is a scenario and Daniel's definition ("That's a template literal type"). No testable rule is stated. The rule the Verdict applies is "keep the names generated from one source and let the signature link each name to its value; keep literal names where a search must find the emitter." That belongs up front. Fix: state it in Daniel's first line.
- :9 / :92 "She brings up the event bus's declarations." Fine.
- :140-147 search and grep: the `rg` output at :143-144 matches the code (preview.ts:3). Fine.
- :175-177 "Follow publish from the event module..." Clear. Good.
- :209 Linoy's explanation of restore ordering ("Restore copies all three first, then publishes them ... That ordering is why restore doesn't call the setter three times.") — the code at :201-206 shows `publishChange` three times after the copy, so the "ordering" argument holds; but the claim "A listener reading the other settings sees the restored values too" is not shown by any code. Minor.
- :391-393 Verdict (minor). Accurate to the Turn; the sentence "Neither the search result nor the signature tells Gilad which path ran in a particular session" is a summary closer. Minor AI-feel.
- :397-422 Additional Takes are the strongest technical part: the `publish<SettingKey>` widening point and the discriminated `SettingsChange` union. Both verified. Keep.
- :426-437 Oded's `DefaultEvents` misstep and Daniel's "It has been very loyal to fourteen." Good voice; clear teaching point (the type comes from the initializer). Keep.
- :441-446 Linoy's "And if you want names like onFontSizeChanged..." — the Capitalize line is a tacked-on closer after the Additional Takes divider (:439 `---`); it reads as a note, not a character's point. Minor. It also has Oded ask "Those aren't in the diff, are they?" — fine.
- :450 Linoy: "Scratch file. You can approve the other tab." — "approve the other tab" is unclear. Minor.
- Story/voice: Oded's "I have survived that before." (:254) and "I'm keeping your setter." (:371) are in character. Gilad's "Run the search again." (:373) is in bio.
- :280 Daniel: "Both substitutions range over both members. You asked for four combinations." accurate.

### 02-advanced-typescript/04-infer-keyword.md (ch10)
Verified with tsc 7.0.2 (verify/haiku-technical/ch10/a.ts): `courier.retrieve("TRK-42")` fails with "Expected 2 arguments, but got 1." (:67, prose is close enough); `Parameters<Courier["retrieve"]>` takes the last overload (:117); `Safe` with the Proxy `as Safe<C>` compiles; `SafeCourier` assertion compiles; `if (promise)` gives TS2801 on 7.0.2 and `!promise` compiles (:247-249 correct); `attempt` and the overloaded `retrieve` implementation compile; `ReturnType<typeof keep>` is unknown (:461); `Awaited` and `Unwrap` results at :273-280 are right; `safeRequests(raw)` fails at the call with the never constraint (:437).
- :437 quoted error. Category: technical (output mismatch); minor. The compiler's top line is "Argument of type 'Courier' is not assignable to parameter of type 'AsyncMembers<Courier>'", and "Type '(text: string) => boolean' is not assignable to type 'never'" is the nested detail. The prose presents the nested line as the whole error. Fix: quote both lines.
- :5-91 Principle (major, clarity). The Principle is an SDK upgrade incident plus a definition of `infer` (:91). The rule the chapter tests appears in Idan's first line ("I want our wrapper to derive its signatures from those declarations. Change a request in the SDK, and our types should follow.") and is then broken by the debate. No testable rule is stated as the chapter's conclusion, and the `infer` explanation at :91 is a definition, not a principle. Fix: state the rule as a claim the chapter will test, e.g. "A wrapper can derive its signatures from the SDK with a conditional mapped type only when every method has one signature and returns a promise", then let the debate confirm or break it.
- :404-416 Verdict (major, clarity). The Verdict says "Either repaired version can pass these tests" and then moves to a different client. The rule readers need is buried in Idan's :419 and :440 (uniform generated client, one signature, promise return; use AsyncMembers to enforce it). The Verdict should state it. Compare the table-based verdicts in ch5 and ch7.
- :91-103, :142-151, :169-185 — the chapter sets up `Safe`, `SafeCourier`, `safe` and `attempt`; a reader may track five versions of the same idea. Category: clarity; minor. A one-line "what each version fixes" list after :232 would help.
- :195-232 "Noam: 'So the boolean in the editor is a promise at runtime.'" and the Eden exchange at :224-230 is the chapter's strongest technical turn: a precise, surprising consequence. Keep. Real Turn.
- :249 Daniel: "On 7.0.2 I get a diagnostic for `if (promise)`." Verified. Good, and it is the kind of detail this book should keep.
- :268 Idan: "It told us about the overload and believed us about this." Good line; clear.
- :285 Noam: "The old fallback wasn't wrong for Unwrap..." — precise and in voice.
- :293 Idan's "It's documented to return a boolean for every string." — fine; this is a claim about the SDK inside the story, not a real SDK claim.
- :351, :380, :384 Eden: "No assertion about a Proxy.", "That's a cost of mine.", "Same tests for both versions." Eden's voice (migration veteran, pragmatic) is consistent with bio.
- :400-404 Eden: "I started counting forty call sites. That's the wrong number." Consistent with :11 ("one of forty callers"). Good running number.
- Cast: Idan's "Prove it by producing it" is not used here; the chapter is more Eden-led than Idan-led. Bio fit fine.
- :454-467 Daniel's generic `keep` take is correct and useful. Keep.
- Length: 470 lines and ~6 sub-debates. The middle (:287-395) is the longest stretch with the least new information (Eden's adapter, the overloads and the sync check are argued again). Category: voice/story; minor-major. Fix: cut the `attempt` adapter section by half.
- Story plausibility: :176-192 "Idan: 'Then show me that version after we've fixed this one.'" fine.

### 02-advanced-typescript/05-advanced-generics.md (ch11)
Verified with tsc 7.0.2 (verify/haiku-technical/ch11, exactOptionalPropertyTypes on for the final check): the TS2684 `this` errors at :34-38, :150-152 and :271 match the compiler (the nested "Property 'destination' is missing..." line is right); TS2741 at :221 is right; the `source?: never` replacement compiles, and the `sourcePreset.source("customers")` error at :352-358 matches the compiler text exactly under exactOptionalPropertyTypes (without the flag it prints `source?: undefined`, so the flag matters here; the prologue's setting is correct); `repoint(sourcePreset)` compiles and `selectOrders` compiles; `const lessSpecific: ExportBuilder = sourcePreset;` is accepted (:455). The compiler story holds.
- :11-43 Principle (minor-major, clarity). The Principle is the best-stated of the advanced chapters: Eli's line at :41 ("A generic can carry what we know about a configuration through several calls. The next operation can require some of that knowledge.") is a rule a reader can apply. But the chapter then calls the generic-with-default "the spelling" (:85), and the default/constraint distinction is explained only in passing. Fix: put the default-vs-constraint point in one sentence after Eli's rule.
- :85 Guy's "`= {}` supplies the default when I write `ExportBuilder` without a type argument." Correct, and :161 Eli explains why that default makes the helper's parameter "too vague". The "annotation too vague" point is the chapter's key lesson; it lands well. Keep.
- :387-403 Dafna's `ordersTo` and factory suggestion: the Verdict-level alternative appears in the Debate, not the Verdict; the chapter has no verdict, only "Debate Continues" (:434). This is an honest open ending (Guy and Dafna really disagree about the SDK contract). Good.
- :455-458 ends on Chen's question, with no closing line. Category: clarity; minor. The open ending is fine, but the last two lines should say who will decide, or the reader is left with a question and no move.
- :420-424 Eli's explanation of why `repoint` compiles ("Inside the helper, the known source is gone... Type parameters affect compatibility through the members that use them") is correct and the one place the book shows the structural rule. Keep, but it is dense; a reader after one read may need the earlier line about `ExportBuilder<{}>` restated.
- :426 "The handbook's discussion of generic type compatibility follows the members in the same way. Distinct type arguments alone don't make instances incompatible." — accurate and useful; fine.
- :112 Guy's "That's what the manual-export command does..." — the manual command story is set up here and used again at :401 and :446. Consistent across the chapter.
- :280 Oded: "Several of our existing builders return `this`." — This conflicts with ch11's own argument that builder methods return new builders. Oded's remark is about the team's existing code; no response. Minor; add a line.
- AI-feel: none significant; the dialogue is terse and specific. Good.
- Cross-book: `ExportBuilder` naming and "Result" in ch10: both use "builder" / "wrapper" patterns; no conflict.
- Voice: Oded's "Great. Build it, then." (:159) and "You're both selling me the same spread with different packaging." (:258) are in character.

### 02-advanced-typescript/06-variance.md (ch12)
Verified with tsc 7.0.2 (verify/haiku-technical/ch12): all the variance results match. Method-shaped `ResultCache<T>` accepts `dashboard(csvCache)` (:49-50, :75); the generic `genericDashboard` write error text matches (:104-106); `keepShape`'s spread write compiles (:114); `in out T` rejects `dashboard(csvCache)` with the quoted text (:140-143); the inferred forwarding object and the `{ read, write }` copy are accepted (:158, :185); `named` and the `in out` version of `dashboard` reject (:174); function-property `ResultCache<T>` rejects the direct call, the forwarded object and the spread copy (:235-238); `ResultReader` accepts `CsvResult` (:262); `archiveAction(lastCsv)` is rejected and `archiveAction(latestDownload)` accepted (:324-325); `publishCsv(result, latestDownload)` accepted (:307); `interface MethodCache<out T>` with a method write compiles (:371-378); the `ExportBuilder<in out S>` assignment and `withDestination` results match (:390, :397). The most technically careful chapter in the book so far.
- :87 Daniel is the one rule in the Principle ("Whether one cache type can stand in for another depends on what its holder can do... Those promises conflict on the same object."). It sits in the middle of the story, not up front. Category: clarity; severity major. Fix: move it to the first lines of the Principle, before the receipt incident, and make the Verdict restate it.
- :361 Verdict (major, clarity). The verdict is a list of decisions ("The runner keeps the full caches. Receipts get a CSV reader...") rather than the rule a reader will reuse. The reusable rule is "pass each consumer only the reader or writer it uses; let the owner hold the full cache". Fix: state that rule in one sentence before Guy's list.
- :177-189 `let reads = 0;` and `read: () => { reads++; ... }`: the counter is never read or asserted, and the prose says the test "wraps read to count calls". Category: technical/clarity; minor. Fix: assert `reads` or drop the counter.
- :197 "The handbook limits variance annotations to comparisons between instantiations of the same generic type." Accurate, and useful. Keep.
- :209-213 strictFunctionTypes and method bivariance: accurate and clearly explained. Keep.
- :371-382 Daniel and Linoy's `MethodCache<out T>` take: verified compile, and Linoy's point ("out agreeing with it doesn't make the writes safe") is correct. Good.
- :400 Eden: "That's the source-only parameter Dafna offered." Dafna's ch11 offer was a plain `{ source: string }` parameter (ch11 :189), and this is `ExportBuilder<{ source: string }>`. Close enough, but a careful reader will notice. Minor. Fix: "the source-only parameter Dafna offered, typed as a builder".
- :386 "In a copy of the earlier builder, Linoy changes..." — the ch11 builder's class gets `in out` here; a reader must remember ch11's class. Acceptable.
- :83 Linoy: "There's even an annotation for that kind of assignment." Accurate in spirit (variance annotations apply to this case only for instantiations). Mild overstatement; minor.
- Story: Guy's "We let one reference grant a write the other reference can't survive" (:89) and Noam's "The person who gets paged owns the receipt." (:81) carry the stakes well. Keep.
- Cross-book: the `ExportResult` / `CsvResult` names are reused from ch11 (the export runner); consistent with ch11 :11. Good.
- The Turn (:217-272) is a real turn: the reader-vs-writer split is a new idea and the debate moves with it. Good.

### 02-advanced-typescript/07-declaration-merging.md (ch13)
Verified with tsc 7.0.2 and a fake `label-kit` package (verify/haiku-technical/ch13): `new Label("Ada").frame("*")` in an isolated file gives TS2339 (:165, correct); the batch entry compiles with the type-only import of `badge` (:192, correct, and emitted code has no `labels` import as :201 says); `wrong-patch.d.ts` + `import { version }` gives TS2305 (:286, correct); the optional `frame?` with the check removed gives TS2722 (:246, correct); `frame?` against required `frame` gives TS2386 and two required overloads compile (:330, correct); Chen's account of ambient vs augmentation (:290) is correct.
- :54 Gilad and the Principle (:3-54) (major, clarity). The Principle names the risk ("A declaration tells the compiler what to expect... the expectation depends on which JavaScript has run") but not a rule a reader can apply. The rule the chapter tests is "put a module augmentation in the file that also loads the runtime everyone imports" (Oded at :114). Fix: state the rule in Gilad's line, then let the Debate break it.
- :82-88 vs :83: `import "label-kit/frame";` in `web.ts`. In TS 7.0.2 `noUncheckedSideEffectImports` defaults to true, so a side-effect import with no declarations errors (TS2882) (verified with a package that has no types for `label-kit/frame`). The book's snippet is only correct if the plugin ships a .d.ts. Category: technical; minor. Fix: say the plugin ships declarations (or that the setup uses `noUncheckedSideEffectImports: false`), in the Principle paragraph at :33.
- :152-153 Chen: "You're past twelve." — the twelve-lines reference is fine. Minor-fun.
- :244 Idan: "Keep your runtime import. The declaration wasn't going to load it, required or optional." Precise and correct. Good.
- :246 "Bypassing the integration module still compiles, but now the checked formatter reports the missing plugin explicitly." — Accurate for the check; but the sentence reads as if the check catches the bypass. The batch entry still compiles and fails at runtime on the check. Category: clarity; minor. Fix: say "the batch fails at runtime with the explicit message, not at the build".
- :254 Dima: "It isn't something the augmentation proves." Good, honest, and it is the chapter's rule in one line. Consider moving to the Principle.
- :330 Chen: "But two required method signatures can merge as overloads without an error." Verified. Good.
- Verdict (:264-266) is clear: keep the augmentation, optional, check in renderBadge, test both entries. Good and actionable. But it omits the rule ("import the runtime with the types") that the Turn taught; the reader gets the fix and not the principle. Major? I'll say minor-major: add one sentence.
- :274 Oded: "Then TypeScript said the package had no `version`." Ties to the Additional Take; fine.
- Story: the Turn is a real one (Chen bypass, Oded "But this imports badge"; Idan's "Its type. Look at the emitted formatter.") — the emitted-JS detail is the chapter's best teaching moment. Keep.
- Cast: Idan's "Why does it say every label has frame when we've just passed it one that doesn't?" (:211) fits her bio (prove it by producing it). Gilad's "Show me one printing." (:7) and "Show me the stack trace." (:106) fit. Chen's "Try the entry that calls our formatter." fits Socratic bio.
- Consistency: the chapter's `label-kit` naming and the `labels.ts` integration module are reused with the same meaning throughout. Good.

### 03-patterns-and-design/01-error-handling.md (ch14)
Verified with tsc 7.0.2 (verify/haiku-technical/ch14/a.ts): all snippets compile except the one that is supposed to fail, and it fails with the quoted TS1196 (:384, correct); `failureMessage`'s never check, Dafna's in-callback `bookParty` (the inferred `ok: true` literal survives), the page's narrowing, `transactionResult` (the `refused` closure variable narrows fine), and the adapter-based `bookParty` all compile. Runtime claims at :162, :172-178 and :335-341 are consistent with the testStore code at :183-205 (committed = draft only on fulfillment). Dafna's `await` point at :243 (a returned, unawaited promise escapes the `catch`) is correct.
- :3-13 Principle (positive, minor clarity). Liron's rule at :5 ("Before returning, check whether they still need that rejection to stop or undo the work") is the chapter's rule and a reader can apply it. The Verdict does not restate it; it only says Dafna "removes the catch from the transaction callback". Fix: add the rule to the Verdict in Liron's words.
- :93 vs :263: `Result` is introduced in :100, and `tryHold` in :264. Fine.
- :154-158 Gil/Guy/Dafna "Check A1 afterward." — then "Wait. I've caught it before the transaction sees it. Run that case." Good; the first bug is found by the team, not the narrator. Keep.
- :241-255 "Move the catch" versus "preflight" versus "transaction that understands results": the chapter has three alternative fixes before the Verdict; the preflight idea (:247-251) is dropped without a clear reason. Category: debate; minor. Fix: one sentence in the Verdict on why preflight was rejected (it depends on `Tx` growing a read API).
- :357-359 Sahar's "If you remove it, which part of the booking needs the adapter?" and Dafna's "This booking doesn't." — a good simplicity question that resolves the adapter debate. Keep.
- :361 Liron: "Discarding a draft doesn't intrinsically require an exception. The exception is how this library asks to be told." Accurate and clear. Keep.
- :379-389 Additional Take: the TS1196 demonstration works, and "unknown" default under strict (`useUnknownInCatchVariables`) is accurate. Keep.
- :391 Liron's queue story is a good closer; it ties the principle back to a different consumer. Keep.
- Cross-book: Liron's "rejection... I make two decisions" is consistent with ch10's wrapper story (Result vs throwing) and ch5's "result or throw" debate. No contradiction, but ch5 kept both options open while ch14 says the Verdict is "Result-returning bookParty", which matches ch5's Verdict for expected rejection. Consistent.
- Story note: :7 "The booking page reserves seats for a whole party: every requested seat or none of them." — the principle "every seat or none" is restated by Gil's test, good.

### 03-patterns-and-design/02-branded-types.md (ch15)
Verified with tsc 7.0.2 (verify/haiku-technical/ch15/a.ts): `preview({ first, count: selection.last })` fails with TS2322 "PageNumber is not assignable to PageCount" and the marker detail (:98-101, correct); `next: PageNumber = selection.first + 1` fails (:109, correct); the spread copy `accepted: PageRange = edited` compiles (:164, correct); the spread copy of `CheckedRange` fails with TS2741 "Property 'checked' is missing" (:218-221, correct); `moveStart(selected, ...)` compiles (:232, correct; runtime TypeError is standard for a frozen object in strict mode); `const soft: SoftPageCount = 4` compiles (Chen, :329-330, correct). Noam's reply at :333 holds for raw numbers (a plain `number` still passes the soft marker), which is the case the old caller had; a PageNumber-branded value does not pass it (I checked), so Noam's "the one that passed the last page" only works if that caller passed a raw number. Clarify (see below).
- :5-7 Principle (positive). Eli's second paragraph states the rule clearly ("those operations must preserve what the check established, or the brand can outlive the fact it claims"). That is the best Principle in the book so far, and the chapter tests it three times (spread, class, draft). Keep.
- :333 Noam (minor, clarity). "Including the one that passed the last page" is true only for raw numbers. Fix: "the caller that passed the last page as a raw number".
- :314 Noam: "The method version handles the copying problem." The chapter's class version has a static `create` method, not a method version. Category: clarity; minor. Fix: "The class version".
- :245 "TypeScript's object-type documentation notes that readonly does not affect compatibility..." Accurate. Keep.
- :154 "The form catches the range error and keeps the edit as a draft. Preview and Export only receive the accepted selection." — Then the later draft design (:270-304) changes this to `requestFrom` returning undefined. The Verdict is consistent with the draft design. The :154 paragraph describes the pre-draft design, which is OK because the chapter moves on, but Oded says "the form already shows it" at :189 — fine.
- :232 "Compiles; throws TypeError in this strict-mode module." — accurate and useful. Keep.
- :288 Oded's "let Preview show no pages once I've typed the five" → :293-296 previewDraft returns [] — consistent.
- :337 Eli's closing (shared links re-input values, so the brand never existed): sharp and right. Keep it; it's the best closer in the chapter.
- Story: Eden and Noam's disagreement about the class vs `requestFrom` is resolved by Eden's "If another consumer needs to retain an accepted selection, we'll revisit the class." Good, honest. Keep.
- Cross-book: the `selection` variable name is reused from the ch15 numbering block at :38 (first 3, last 4) and at :97; redeclared in separate snippets. Fine, but ch15 uses `selection` for two different shapes (`{first: 3, last: 4}` plain and then `{first: PageNumber, last: PageNumber}`). Minor; a reader sees the same name change type with no note. Fix: rename one.

### 03-patterns-and-design/03-runtime-validation.md (ch16)
Verified: the `unfinishedLabel` TS2366 at :192 and the inferred `string | undefined` fallback (:197) reproduce with a stand-in type (verify/haiku-technical/ch16/a.ts); the exhaustive `refundForKnown` compiles as claimed (:31-38). NOT verified: the Zod 4 outputs (`z.looseObject`, `z.strictObject`, the `.or` / `.transform` output, the "Invalid option" message text at :76, `.catch` at :374-375). I did not install zod; the outputs are plausible for Zod 4 but a release reviewer should run them once.
- :5 Gilad's Principle (positive). "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result." Clear, testable, and the chapter tests it. Keep. Note the Verdict (:363) restates it in concrete terms.
- :108 Eden: "Good, keep it raw. ... We'd stored every successful update. Or so I thought." vs :128 "Our inbox only had the shipment ID and status that `z.object` returned." Category: inconsistency (story); minor-major. A reader will ask how the inbox held only parsed fields if it was "raw" from this point. The answer (the history before the change stored parsed output only) is never said. Fix: add "Before this change, the inbox stored only what the parser returned" at :108 or :128.
- :52 vs :59-64: the prose says "The endpoint parses that value, stores the parsed update, then acknowledges receipt", and `receive` at :59-64 stores `parsed.data`; the inbox then changes to raw at :98-101. Consistent as a before/after, but :52 is in the present tense and reads as the design the chapter keeps. Minor. Fix: "Before this change, the endpoint parses...".
- :67 "A rejected webhook gets two retries. Three rejected attempts pause delivery" — consistent (1 attempt + 2 retries = 3). Good. :104 Gilad "If that write fails three times, delivery still pauses." Consistent.
- :112-124 Eden's `eta` example and Idan's three-policy explanation (:126) are clear and accurate for Zod's object policies (verified by reading only). Good.
- :136 Idan: "A loose object with the same enum still rejects that status." Accurate by construction. Good.
- :171 Idan: "Neither branch accepts it. That receipt still needs review. We haven't made every input a shipment update." Good.
- :197 Idan: "Remove `: string` and it infers `string | undefined` instead." Verified. Good, and it is exactly the trap a reader needs.
- :214 and :221-222 in the Turn: the output comment shows the array form as JSON strings; console.log of an array prints `[ 'Carrier...', 'skip' ]` — cosmetic; minor. Fix: use the console.log form or say "(shown as JSON)".
- :242-246 Idan, Gilad, Eden: the review work-item linked to the raw receipt is a good concrete answer to Gilad. Keep.
- :250 Idan: "The same things that stop somebody putting default: return 'skip' in your switch. A closed enum doesn't make that a correct business decision." Strong line. Keep.
- :252 Noam: "Your next consumer can write Oded's branch without changing the schema." Consistent with :329.
- :329 Noam: "With the open type, a caller can skip that helper and write Oded's branch again. There's no status field in this handoff, so that branch won't compile." Consistent with the Projection design.
- :363 Verdict: long summary paragraph (AI-feel: summary, minor). Trim to the decisions the reader can apply.
- :384 Gilad: "A new inbox ID doesn't make it a new refund." Good idempotency point; the chapter does not return to it in the Verdict. Minor: add to Verdict or to Additional Takes as a required follow-up.
- Cross-book: ch14's Result and ch16's Projection/Result-ish handoffs don't conflict. ch5 used `ParseResult<T>` for the same job; ch16 uses zod `safeParse`; both fine.
- Story: Oded's "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived." (:79) — a good line, in voice.

### 03-patterns-and-design/04-immutability.md (ch17)
Verified with tsc 7.0.2 and node (verify/haiku-technical/ch17): `cart.total = 0` TS2540 (:77), `appendGift(cart.items)` TS4104 with the quoted text (:82-83), `receipt(readPrice, ...)` TS2345 (:239), `receipt(view, ...)` TS2739 (:263, the quoted "Error TS2739" is right), `applyPromotion(cart, 20)` accepted (:60), the `DeepReadonly` Date example compiles and prints 2000 (:378-387); the frozen-object runtime throws TypeError in strict mode (:121-126); the 499500 property-copy count and the equal JSON (:365, :369) are right.
- :3-9 Principle (positive). Liron's first paragraph is the chapter's rule ("Before you change an object, ask what each holder expects to keep... Those are different promises, even if both holders only read.") and it is testable. Good. The second paragraph (:7) is dense; a working developer would reread it. Minor: break it into two rules.
- :354-372 Gil's index example: the claim is correct, but the Additional Take's point (copies vs. milliseconds) is a numeric curiosity that does not connect to the Verdict. Category: debate/story; minor. Fix: cut or tie it to a holder who needs the earlier index (which the Verdict says none does).
- :372 is an unattributed paragraph after Gil's code (speaker is implied, not written). Minor; same at :390 (after Daniel's code, the quote belongs to Daniel's take). Fix: attribute both.
- :376 Daniel: "don't mistake a recursive readonly type for a frozen clock." Good line; keep.
- :129 Eden: "A missing exception won't tell me there are no writers left." Accurate and in voice; good.
- :146 Dafna: "That's not a quote made by our constructor. The discount and total disagree." Clear; keep.
- :150 Dafna: "If we need an unforgeable value type, that's more work than freezing this one." Accurate.
- :239 `receipt(readPrice, functionPricing.snapshot()); // Error TS2345.` — the error exists (verified). Good.
- :344 Verdict is one sentence, precise, and a rule. Keep. :350 Eden's last line ("Adding readonly was a smaller diff. It just didn't do this job.") is a good closer.
- Story: the `readonly` vs `Object.freeze` vs getters arc (Dafna's "a closure can own the current binding") reads as a real progression. The Turn (:199-218) is a real turn: the live view looks like a value. Keep.
- Consistency: "Quote" name reused across the book is fine here. Note that ch8 `FormValues` and ch17 `Quote` both use `Readonly` the same way; good.
- Chapter length (about 390 lines) with four sub-debates on the same class; the middle (:162-287) asks the same question (live reader vs value) three times with different wrappers (getters, function, PriceView). Category: voice/story; minor-major. Fix: keep the function and the interface, cut the getters variant (:169-197) to a sentence.

### 03-patterns-and-design/05-pure-functions.md (ch18)
Verified with node and TZ settings (verify/haiku-technical/ch18/sla.mjs): the timezone table at :273-277 is exact (UTC 13:00Z, Jerusalem 11:00Z, New York 18:00Z); the policy version with `Intl.DateTimeFormat` gives 11:00Z (:289-309 correct, the en-GB weekday strings are "Mon"/"Sat"/"Sun"); the deadline-walk table at :216-221 is exact (60,000 / 40,000 / 20,000 / 20,000) for the three refresh instants; 2026-11-09 is a Monday and 07:00Z is 09:00 Jerusalem (:38, UTC+2 after DST), and P1-43's at-risk record at 10:40Z is correct (:350-356).
- :5-7 Principle (positive, strong). Eli's rule is the most usable in the book so far: "Make anything that can change the answer an explicit input... reuse only the work that does not depend on it." The Turn then tests exactly the input it leaves out (the host time zone). Keep.
- :225 Dafna: "`deadlineFor` doesn't read the clock. It's a pure calculation we already had." This is the false premise the Turn exposes (:233-265). Good structure. Keep, but the Principle's "explicit input" rule should be stated before this, so the reader sees the miss.
- :60-79 replay output: the three lines `ok ok`, `at-risk ok`, `breached ok` follow from the code (verified by reasoning: the dashboard's first miss at 10:20 caches `ok`). Good, and the explanation at :81 is right.
- :133-154 Oded's TTL test: `nearDeadline` at `due - 1` stays `at-risk` after `due + 30s` and the direct call says `breached`. Consistent with the TTL code. Good.
- :137 Gilad: "Did the lead agree to the extra minute?" Good question; the Verdict answers it at :363.
- :317 unattributed quote after Eden's line at :315 ("And I'll copy the policy..."). Minor; attribute it or merge into :315.
- :363 Verdict: "Gilad has checked with the lead: status as of the last thirty-second refresh is acceptable; an extra cache delay is not." It is the only place the lead's requirement appears, and it appears in the Verdict rather than the debate. Category: story; minor. Fix: say it in the debate at :137-139 so the Verdict is earned by it.
- :365-371 Verdict: good, specific, and it keeps the disagreement (Dafna's `evaluate` vs. Eden's compatibility wrapper) visible. Keep.
- :375-377 Additional Take (Clock injection): correct and well-argued ("Pass the same live Clock twice and it can give you two different instants"). Keep.
- :381-383 Oded/Dafna on the Map: good. Fine as the last word.
- Length and boredom: this is 380+ lines with four approaches (TTL, boundary expiry, deadline cache, TZ policy). The TZ turn is the best part; the TTL/boundary arguments (:115-162) are long for an outcome that the table reduces to a single row. Category: voice/story; minor-major. Fix: trim the boundary-expiry exchange.
- AI-feel: Eli's and Dafna's lines are in voice. :363 is a summary but short. No aphorism closers spotted.
- Cross-book: `Ticket` with `Readonly` and the `memoizeBy` helper are used the same way as ch17's `Quote` immutability. Consistent.

### 03-patterns-and-design/06-imperative-vs-declarative.md (ch19)
Verified with tsc 7.0.2 and node (verify/haiku-technical/ch19/a.ts, sim2.mjs): every stage compiles, including `eligible` without the return annotation (the inferred predicate keeps `Ready[]`, :82 correct); `folded`, `looped`, `split` and the original loop compile; the TS18048 at :367 is exactly the expected error; the refund `flatMap` and the `.map().filter().map()` forms compile. The P1/P2/P3/P4 outputs at :113-114 are right (P1 400; P1,P3,P4 900). The day-by-day table at :242-246 is right. My independent simulation of the finance schedule reproduces every cell of the table at :317-327 (Stop / Fill / Fill-then-reserve, with daily accumulation and N = 2), and the 13 payout-day figure at :280 works out (2+2+2+2+2+2+1). The exhaustive claim at :254-266 holds: 78,125 combinations (5^7), with arrivals on the next three days and a daily reset, I found no payout paid later under skipping and none unpaid under skipping that stopping pays. This is the most carefully checked chapter so far.
- :5-7 Principle (positive). Sahar's first paragraph is a clear, usable rule (what carries from one item to the next, where processing stops, what must happen in order), and the second paragraph names the trap (`return` in reduce ends one callback, not the reduce). Keep.
- :61 vs :274: "Finance has a proposal to deposit a smaller amount each day" (smaller than the 1,000 allowance) and "The deposit would be 500 a day" — consistent if read against 1,000, but a reader can trip on it. Minor. Fix: say "a 500 deposit" at :61 too.
- :208 Dafna: "I just shipped a bug by following the total and missing what the callback would do next." Good, and it is why the Turn is a real turn. Keep.
- :230 "Dafna replaces the deployed skipping body with the loop after the filters, under planPayouts. The patch will ship before today's batch." — followed by Sahar's naming in the Verdict (:339) "I called it planPayouts too soon." Consistent story. Fine.
- :268 Dafna: "Then I'd like a different rule: scan in queue order, pay what fits, leave the rest for tomorrow." This is the skipping rule (the thing that was deployed). The chapter's point (skip pays no payout later but breaks the queue promise) makes Dafna's proposal correct, but the phrase reads as a new rule. Category: clarity; minor. Fix: "Then I'd like to make that explicit: ..." or name it.
- :341-357 Verdict naming (:342-343) `stopAtFirstBlocker = looped` and `fillAvailable = skipping` — correct to the code. Note the Verdict's Sahar line (:339) "Name today's repair" follows the Turn. Good.
- :356 Dafna: "For fillAvailable, I'll keep the fold: it considers every payout, with no closed state to carry." Consistent with :200 and :208. Good.
- :184-197 `split`: the `findIndex` predicate mutates `total`. It is correct here, but a TS reviewer will flag a side-effecting predicate. Category: technical; minor. Fix: note it or use an explicit loop; the chapter's own argument (returns inside callbacks) makes this a fair point for a reader.
- :212-222 Chen's held-first case: right. Good use of a counterexample.
- :228 Gil's "Empty queue, exact allowance, yesterday's queue" tests: fine.
- :254 "Gil runs all 78,125 combinations..." — verified and true under the stated arrivals. The sentence doesn't say which days the arrivals come on; ("the next three days") — fine. Keep.
- :284 Gil's 30-day claim (balance never above 600; P2 unpaid) follows from the fill rule. Plausible; not separately simulated.
- :286 Dafna's waiting rule is clear. Good.
- :335 Gil: "We own that number. Two is a test value, not something to leave in the code because it made this table look good." Good line, in voice. Keep.
- :360-368 Chen's TS18048 example and :370 Dafna's answer are correct and make the right point ("The item is still a ReportRow after that filter."). Keep. (Note: TS 5.5 infers predicates only on the element, not on a property; the book's wording is correct.)
- Cast: Gil's stance ("What does the data say?") is used as the main verifier. Dafna's stance (purity, don't mutate arrays) is respected by the fold. Liron's "boundary" split is in character. Sahar's "What's the caller asking for?" fits.
- Length and readability: at roughly 390 lines, the finance replay (:273-335) is the densest stretch; a casual reader may stop at the table. Consider moving the 13-day arithmetic to a footnote. Minor-major.

### 03-patterns-and-design/07-currying-partial-application.md (ch20)
Verified with tsc 7.0.2 (verify/haiku-technical/ch20): `lines.map(lineTotal)` with the optional number parameter compiles and gives 100,99,98 (:39, correct by reasoning); the object-parameter version fails with TS2345 "Type 'number' has no properties in common with type 'Discount'" (:67, correct); `pairWith({a:1})({b:2})` fails with TS2353 (:356, correct); `pairWith<Either>` with the union accepts (:365, correct); `pair({a:1},{b:2})` infers the union, and the displayed member shape is `b?: never` under exactOptionalPropertyTypes (:359, correct for the book's flag setting; without the flag the display is `b?: undefined`).
- :5-7 Principle (positive, slightly dense). Daniel's rule ("Start with a local arrow when you only need to hold an argument for later. A shared module should own the first call when that call does work only the module can do.") is clear. Keep. The second paragraph's warning about `map` passing index and array is the reason for the whole debate and should lead the Principle, not close it. Minor.
- :22-33 and :36-41 (Linoy's "I removed the wrapper"): the output 100,99,98 is the surprise that carries the chapter. Good, memorable. Keep.
- :130-134 Linoy's tiers: "The saved tiers aren't ordered; we need the highest minimum the line qualifies for." consistent with `prepare`'s descending sort. Good.
- :167 Dima: "The callers already checked that quantities are positive and unit prices are finite and nonnegative." This is the one assumption in the chapter that isn't shown anywhere; the Turn then relies on the empty-run behavior. Fine as a stated assumption.
- :190-194 Gil's 6 prepares count is correct and his table (:243-246) matches the code (6/18/6 vs 1/3/6).
- :260 Noam: "An extra required argument would fail against PriceLine at this return. An optional one wouldn't." — reads as the rule, then :264-274 shows the optional extra arg still compiles and changes behaviour ("100,99,98"). The chapter makes the point; fine.
- :276-290 Linoy's fix (`line => price(line)`) reproduces the book's output (100,100,100). Good.
- :296-333 Turn: the empty-list validation and its consequence (the adapter returns 0 for an invalid promotion, the factory throws) is a real, testable turn and matches the code exactly (:305-314). Keep. This is the chapter's best moment.
- :337-343 Verdict: specific, with the rule ("This one earns its entry point because the package owns the preparation") — that is the chapter's rule, but it sits in Dima's line in the Verdict. Fine.
- :347-368 Additional Take (Daniel on inference): accurate and useful. Keep.
- Story: Gil's line :296 "I added an empty list to the regression test..." — Gil's data-minded arc works. Good.
- Cast: Noam's :260 and :264 are the sharpest technical contributions; Linoy's acceptance is in character (she "sets aside her discountedBy proposal"). Dima's "The package still owes you a function..." (:292) is a good cliffhanger for the Turn.
- Minor: :192 "Six line prices are expected." — Dima's sentence reads oddly; "Six line prices are expected" vs the earlier "Six calls into prepare" — the first six calls are the two renderers × three lines; keep but clarify.

### 03-patterns-and-design/08-hof-patterns.md (ch21)
Verified with tsc 7.0.2 (verify/haiku-technical/ch21/a.ts): `withTimeout(send, 2000)` fails with TS2345 (:188, correct); `detached = withTimeout(client.send, 2000)` compiles (:213, correct, and the runtime `this` error is the expected behaviour); `lookup("shipped-42")` fails with TS2345 while `lookup([...])` compiles (:363-365, correct: the last overload wins); `forward(identity)` keeps the generic (`forwarded(3)` is number and `forwarded("accepted")` is string, no error, so :368-370 is right; TS higher-order inference preserves it); `withRetry`'s `for (;;)` with no trailing return compiles; `sendShipped`, `sendShipped2`, `RetryingSender` and `runJob` compile. The early `withTimeout(withRetry(send, 3), 2000)` at :130 uses the pre-change `withTimeout`, which is correct in context.
- :5-7 Principle (positive, strong). Gilad's rule is concrete and testable ("Without that guarantee, don't retry a failure where the work may already have happened... Report the outcome as unknown."). The Verdict then states the same rule. Keep.
- :5 vs :341/:343/:372: the Principle says "Report the outcome as unknown"; the code and Verdict use `"unconfirmed"`. Category: terminology; minor. Fix: use one word everywhere.
- :142 Eli: "`Send` describes the argument and the receipt. It doesn't say how many times you contact the gateway." This is the chapter's best one-line rule, and it sits in the middle of the Debate. Consider moving it into the Principle.
- :125 Guy: "We have `sendOnce` to prevent duplicate messages." It is mentioned as existing, then at :284 Guy says "That's why I want `sendOnce` here," which reads as if it is new. Category: story/clarity; minor. Fix: make :125 "We can add `sendOnce`..." or have :284 say "the existing `sendOnce`".
- :111-121 timeline table: each row is consistent with the code and with the 2-second per-attempt timeout (verified by reasoning: attempt 3 times out at 6s, the job records failed, its delivery at 7s). Good.
- :244 Gilad's "Starts at zero, two and four seconds... Zero deliveries. ... fails at six seconds." consistent with the abort-on-timeout code. Good.
- :262-268 the early-acceptance table is correct and is the chapter's sharpest turn: cancellation worked and three messages still went out. Keep.
- :292-303 `sendShipped` with the key and the predicate is correct. Good.
- :317-319 Oded and Guy on the last error vs earlier attempts: correct and important ("An earlier attempt may have got through."). Keep.
- :343 Guy's Verdict: "use the client's predicate to retry only temporary failures it proves happened before sending. Never a timeout or a lost reply." Consistent with the keyed version only when `sendOnce` exists. The sentence is conditional, good.
- :351-373 Additional Take (forward and overloads): correct, and Guy's last sentence ("A forwarding arrow isn't a promise that the whole API survived.") is a good closer. Keep.
- Length and density: this chapter is 370 lines of retry/timeout/abort mechanics; the middle (:144-253) is four wrappers in a row. Category: voice/story; minor-major. Fix: cut the `RetryingSender` exchange (:218-240) to a sentence; it adds no decision.
- AI-feel: none significant. Oded and Guy voices are sharp ("You already block all my PRs" style).

### 03-patterns-and-design/09-config-to-function.md (ch22)
Verified with tsc 7.0.2 (verify/haiku-technical/ch22): `const savedPolicy: Json = active` fails with TS2322 and the failing property `extraHold` (:83, correct); `auditRecord ... as const satisfies Json` and the replayed `evaluators[...]` call compile (:103-112); the `matches` switch with the `never` check compiles (:161-172). By hand: `holds`, `ruleHold` and `templateHold` print the quoted JSON (:47, :59-63, :202, :240); the eight samples give 5 holds and the expected array at :287 is right; `tooBroad` gives exactly 2 mismatches (:288, correct); Eden's "Three of Gil's eight samples" is right (samples 4, 6, 7 differ between the old country-velocity template and the new template).
- :5-7 Principle (positive). Liron's round-trip test ("save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?") is a testable rule and the chapter uses it. Keep. Note the Principle ends on a question; the rule is in the sentence before it, which is fine.
- :133 vs :135: "Risk dropped the total branch. Now they want high totals back for every country..." — consistent with the requested grouping at :137. Good.
- :249 Eden: "Format 2 allows an editable window and rejects a missing `days`." The `Template` type at :218-223 has no format discriminant beyond `version: 2`, and the reader that rejects missing `days` is not shown. This is a stated claim with no code. Category: technical/clarity; minor. Fix: one line in the Verdict's reader ("readSavedTemplate rejects format 2 without days").
- :92 "using `as const` to keep that name as a literal key for the lookup": the literal survives through `auditRecord`'s `as const`, not through the lookup key (which is a plain object literal). Minor precision issue. Fix: "using `as const` so the evaluator name stays a literal".
- :123 Eden: "Hiding `extraHold` behind a narrower type wouldn't remove it from the object." Accurate and precise. Good line.
- :207 Dafna: "`never` makes us handle the new kind. It doesn't write the check for us." Good, and consistent with the chapter's earlier never-check. Keep.
- :279-297 the replay-as-guard argument: "So the tree isn't the reason that mistake gets caught. The replay is." Clear, and it is the chapter's rule in one line. Keep; consider moving to the Verdict.
- :303-325 request counts (6 / 2 / 1) and Sahar's "Then ask for the ones they held back." Good. The argument is numerical but grounded and fair (Gil's "I can't count requests they didn't file.").
- :352 Gil: "I counted requests. I didn't calculate when you should build an editor." — good line, in voice.
- :358 Dafna: "Three refunds within seven days. The old log didn't say that." — ties back to the opening. Good callback.
- Story: the opening (the log that promised a complete account but kept only JSON) is a strong hook; the chapter then mostly argues about the editor, and the Turn (Gil's samples) returns to the record problem. Good arc.
- Length (360 lines) and two debates (the saved record; the grouping). Reasonable.
- Cast: Eden's answers are migration-careful ("Those are format 1..."). Dafna's "I'm not proposing a programming language with a debugger." is a strong voice line. Gil's counting is in character.

### 03-patterns-and-design/10-monads-light.md (ch23)
Verified with tsc 7.0.2 (verify/haiku-technical/ch23/a.ts): `inspect()` fails with TS2339 "Property 'result' does not exist on type 'Preview'" (:164-165, matches exactly); `loadPreview` compiles against `Promise<Res<...>>` (so the bug is silent until the caller reads `.result`); `Promise.resolve(preview("7"))` is typed `Promise<Preview>` (:248-249, correct); `andThen`, `plainPreview` (including the two early returns) and `pendingInside` compile as written; `nested` has the stated shape (:108-111). By hand, the runtime story at :196-216 is right: a resolved `Res` is adopted through its `then`, the success branch calls `resolve(preview)`, and the refusal branch never calls either function, so `refusedJob` stays pending. The JSON outputs at :96-98, :111, :230, :233, :342-346 match the code.
- :5 and :7 Principle (positive, dense). Eli's rule ("If it returns a plain value, use map... If it returns another Result, you need flatMap...") is clear. The second paragraph (promises' `then` joins the protocol by name) is the reason the incident happens and is well placed. Keep. Minor: the Principle is long; the reader needs the map/flatMap rule first and the thenable warning second, which it has.
- :141 Guy: "Our preview has one offer or a refusal. That has four values." Reads as an objection to the array analogy; works. Keep.
- :143 Dafna: "That's a monad." The chapter names the idea once and then uses it. Fine for "monads light".
- :354 Linoy: "I'll explain `andThen`." then :356 Sahar: "Show what the map callback returns and what the andThen callback returns." — the Verdict defers the one-sentence rule to a later explanation. Category: clarity; minor. Fix: put Sahar's rule in the Verdict paragraph.
- :332 Linoy: "Deprecating the name doesn't stop JavaScript calling it." Accurate: an alias named `then` would still be adopted. Good, and it prevents a common mistake. Keep.
- :262 Guy's worker-failure argument is the right reason to reject `then` for the refusal. Good.
- :274 Guy: "Even declaring Promise<Res> compiles with that version." Accurate to the compiler (the type annotation misleads), but the sentence is slightly hard to parse. Minor.
- :278-292 `andThen` plain union: correct, and Dafna's "That's the same refusal rule, without a wrapper object" is the chapter's teaching point. Keep.
- :312-320 plainPreview: the duplicated refusal branch is Guy's honest trade-off ("If I remove the first check, qty.value stops compiling."). Keep.
- :336-346 checkRepair: consistent with the rename. Good. The `returned` value is `unknown` in the script, which hides the change in its type; not an error.
- :363-371 Additional Take: Dafna's `map(availabilityAsync)` example is the right trap to name. Keep.
- Cross-book: ch14's `Result` (`{ok, value} | {ok, error}`) and ch23's `Result` use the same shape; ch5/ch10 used `ParseResult`, `Result` names. Consistent enough. No conflict.
- Story: a strong Turn (the promise adoption path) that changes the argument (from "map vs flatMap" to "our class is a thenable") and gives the Verdict a reason. Real turn.
- Voice: Linoy's "And I taught it to say nothing on no." (:214) and Guy's "The worker is waiting for an answer about whether it answered." (:212) are both funny and in voice.

### 04-the-real-world/01-migration-strategies.md (ch24)
Verified with tsc 7.0.2 and node on a rebuilt copy of the book's config (verify/haiku-technical/ch24): the default-export emit is `exports.default = slug` and `typeof require(...)` is "object" with `.default` a "function" (:92-104 correct); the route then throws "slug is not a function" (:100 correct); `checkJs` gives TS7006 for `title` and TS2349 "This expression is not callable" on the default-export version (:140 correct, with the "no call signatures" detail); the `export =` emit is `module.exports = slug`, the route returns `/products/green-chair`, and the default import of `export =` compiles under `module: Node16` (:126, :130 correct); with the route's `@param {string}` the caller's `handle(42)` gives TS2345 with the quoted text (:226 correct), and without it the probe gets only TS7006 (:213 correct). The tsconfig in :25-40 produces the `dist/src` layout the tests require (:59). This is the most technically accurate chapter in part 04.
- :5-7 Principle (positive, strong). Daniel's contract rule ("Keep their contract... or change and verify the callers too") plus the explanation of what `checkJs` checks is exactly the rule a migration reader needs. Keep. The principle is long, but each sentence is an instruction.
- :7 "TypeScript 7 is strict by default, so the first JavaScript check can report untyped parameters." Accurate (verified strict default true). Keep.
- :187 Noam: "Put @ts-nocheck on the files we're deliberately leaving." Not verified against TypeScript 7 (I did not test whether `@ts-nocheck` is still honoured in 7.0.2); keep the claim but check it once before print.
- :199 vs :299: the JSDoc `@param {number} cents` is added in this PR to `money.js` and then :299 says "The money conversion can wait". Consistent, but a reader may see the JSDoc as the money conversion. Minor. Fix: say "the money file's TypeScript conversion can wait" at :299.
- :175 Noam's "Five implicit-any parameters: title, id, a, b and cents." Correct count for the program at that point. Good.
- :230 Eden: "The typed slugger gives its checked JavaScript callers a signature too. You don't have to convert them all to benefit from starting with the leaf." Good, and true (verified via the route's JSDoc). Keep.
- :236-238 Chen's experiment ("Would this setup have caught Oded's original PR?") and the answer (:238-274) make the Turn a real one: the route's error stops the PR, and the sitemap's opt-out does not. Good.
- :258-264: "Now suppose you fixed the route by reading .default" and the old-test trap (Oded updated the test's call and left the real caller) is well-argued and mirrors the Principle. Keep.
- :293-295 Daniel: "`require(name)` can give you `any` even in checked JavaScript." Accurate in general (dynamic require returns any). Keep.
- :316 Noam: "Don't turn this into a rule about every object someone could export." Good. Keep.
- :320 Verdict: "A caller left on the exception list keeps its interface in a conversion PR." — the sentence is hard to parse on the first read. Minor. Fix: "A caller left on the exception list still needs the old interface, so the conversion PR keeps it."
- Cross-book: ch24's `export =` pattern and ch13's `labels.ts` integration module are both "one entry point for the type and the runtime"; no conflict.
- Story/voice: Oded's "I converted the test out of catching the conversion." (:108) is a strong, honest line. Keep.

### 04-the-real-world/02-monorepo-type-sharing.md (ch25)
Verified with tsc 7.0.2 and node 22 (verify/haiku-technical/ch25): the runtime error text at :137 is exact for V8 ("Cannot read private member #cents from an object whose class did not declare it"). The two-copies situation is real: passing one `Money` copy's private-field class to another copy's `plus` fails at compile time, but with TS2345 and the detail "Property '#cents' in type 'Money' refers to a different member that cannot be accessed from within type 'Money'." The book quotes TS2741 with "Property '#cents' is missing in type ... but required in type ..." at :115-117. That quoted diagnostic does not match 7.0.2. Also, the `shipping() as unknown as ...` cast experiment (:132-137) only compiles because of the cast, which is the expected point.
- :115-117 quoted TS2741 (blocker-level for print, as this is the chapter's central diagnostic and readers will run it; severity major, since it is labelled "abridged"). Fix: replace with the TS2345 text the compiler prints (or run it and quote the real output).
- :137 runtime message: correct. Keep.
- :201 Gil: "tsc -p apps/api passes. It read the old declaration." Consistent with project references absent; accurate.
- :214-220 project references: the TS2554 text "Expected 1 arguments, but got 0." is the compiler's wording; accurate (I did not rebuild the whole monorepo; the single-file check is consistent).
- :245-257 exports condition ordering (source condition before types/default) is correct: Node and TS take the first matching key in object order.
- :263-278 `customConditions` in the dev base is a valid TypeScript option and matches the Node16 setup. Good.
- :286-290 Linoy's `.js` → `.ts` import explanation is accurate: Node does not map `.js` to `.ts`, and `allowImportingTsExtensions` requires `noEmit`. Keep.
- :308 "ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING" and :314 Gil's explanation: Node does not strip types under node_modules; I did not reproduce it (the copy-into-node_modules run needs the full image). Keep, but reproduce before print since it is quoted as a code.
- :326 Dima: "Building again doesn't delete it." Accurate (tsc does not remove stale outputs). Good.
- Principle :5-7 (positive). Gilad's three questions (which declarations the caller is checked against; which implementation loads at run time; what rebuilds it) are a clear checklist, and the chapter tests each. Keep. The second paragraph is dense; a reader will need the "public exports" rule first, which it has.
- Story: the Turn (:298-334) is a real turn (the image cannot load source under node_modules), and it changes the Verdict (the copied-program test). Good.
- :334 Idan: "We have spent quite a while agreeing on fifteen dollars." Good closer; in voice.
- Cast: Gil's "I wanted to know how much we'd broken." (:170) and "Two emitted from the start..." (:332) fit his data stance. Linoy's "Why keep dist at all?" fits her cutting-edge stance; Dima's "Is removing dist worth changing how this image starts?" fits his pragmatism.
- Length: 340 lines, dense with config. A reader who does not run the setup may skim the JSON. Minor-major: consider moving the three config blocks to one appendix.

### 04-the-real-world/03-testing-typed-code.md (ch26)
Verified with tsc 7.0.2 (verify/haiku-technical/ch26): every quoted diagnostic matches: TS2345 with the nested "Property 'currency' is missing..." for the `Order` parameter (:96, exact); TS2322 `'"draft"' is not assignable to type '"paid"'` (:104, exact); TS2741 "Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'" for a Draft variable (:147, exact); TS2344 "Type 'false' does not satisfy the constraint 'true'" (:220, exact). The Equal results match the prose: the Object.assign intersection passes the `Row` comparison (:217), `any` fails it (:220), a flat `{ id, status }` return fails it (:248-253), and `typeof row.status` passes (:265). This chapter has the best-checked diagnostics in the book.
- :5-7 Principle (positive). Sahar's rule ("Change the code so the promise is false... See the test fail, undo the change, and see it pass.") is concrete and the chapter performs it. Keep. The second paragraph is dense (five rules in one paragraph); a reader can keep the first and the `@ts-expect-error` rule. Minor.
- :58 Oded: "I read the green check as evidence that I'd missed some other restriction." Accurate and the reason the story works: the directive hid the missing currency, not the status. Keep.
- :255 Oded: "I let drafts ship and got green. An ampersand left Guy's hover and Noam got red." — the second sentence is hard to parse on one read (it means the intersection form, which Guy's hover shows, is what fails the stricter comparison). Category: clarity; minor. Fix: "The intersection in Guy's hover is what made Noam's comparison fail."
- :284 spec reporter output `shipped: [ 'o2' ]`: the test runs the call, so the sentence "The test called 'can't ship a draft' passes" is the point. Accurate.
- :310 Eden: "The test directory gets discovered too." Node 22's default test discovery includes files under a `test` directory; I did not reproduce that with this Node version and `.ts` files, so keep it unverified in the print check.
- :405 "It passes: Node erases the assertion." Consistent with type stripping; the runtime still executes ship(draft). Accurate.
- :409-419 Eden's glob check (single file green, glob red, corrected text green) is a good "show me the reds" procedure. Good.
- :423-429 Oded/Noam closer ("I was finished.") is a clean ending in voice.
- Turn (:356-405): "Show me it failing" with `Expect<Equal<1, 2>>` passing under `tsc -p tsconfig.json` is the chapter's strongest demonstration and it works as described (the file is outside `include`). Keep.
- Cross-book: `Expect<Equal<...>>` is the same idiom as ch7's `[T] extends [U]` style comparisons; no contradiction.
- Story: "It can't be green" is a strong opening and Oded's "I have accidentally passed two different tests with one comment." (:124) is a good line.

### 04-the-real-world/04-performance-vs-safety.md (ch27)
Verified with tsc 7.0.2 (verify/haiku-technical/ch27): with the distributed-tuple signature, the typo `shop.crat` (:16), the missing `count` (:17), the separate-key probe `messageFor(true)` (:21) and the Linoy-style errors all fail with TS2345 as stated; `t(...pending)` and `shop.ready` compile. Under Oded's loose overload, `t(...pending)` does give TS2556 (:78 correct). I did not reproduce the benchmark medians, instantiation counts, the 387-byte emit, or the trace/profile results; those are unverified and a benchmark reader should rerun them.
- :5-7 Principle (positive). Daniel's rule (measure what you sped up; list calls that must stay legal and forbidden; name what catches the mistake that now compiles) is concrete and the chapter applies it. Keep. The first paragraph is long; the rule can be split.
- :42 "node dist/probe.js prints shop.crat, then Hello A, {count} items." Accurate by reasoning from the loose implementation. Keep.
- :56-68 Linoy's `Args` is correct for the cases tested; the typed error messages (:16-23 of my test) match the chapter's "TS2345" claims.
- :146 The sentence "Gil ... Same 387 bytes" and the later "Emitting the translator gives the same bytes again" are unverified numbers; keep them flagged for the print check.
- :153 "The string baseline doesn't compute Key; the last row uses Linoy's Args above." But the table row labels (:170-173) say "Linoy's per-key tuples" for row 4 and the code block (:155-166) also labels the last alternative "Linoy's per-key tuples" while the surrounding prose says the last row "uses Linoy's Args". Minor naming inconsistency; fix one label.
- :164-165 The code block lists two identical-signature `function t(...args: Args)` lines under different comments. Category: clarity; minor. Fix: drop the duplicate.
- :221 The probe split: `probe.json` with `files` and `include: []` is a sound technique. Keep.
- :245 "Emitting the translator gives the same bytes again." Unverified; flag.
- :263 Gil's "the new check took less than a fifth of the old time" — 0.255s vs 1.481s is about 17 percent, which is less than a fifth. Consistent.
- :273 "About 0.2 seconds in the recorded check events, against about 1.6 for checking the file." Unverified number; plausible with the table.
- :279 Daniel: "Don't build on the name." Good caution about typescript-go internals; the cited commit link is a permalink (good). Keep.
- :289 Daniel's explanation ("inference gives K one key ... removes the broad union work") is the chapter's mechanism; it is stated and consistent with the mapTypeEx profile. Keep.
- :297 Oded: "Count made it all the way to the customer this time." Good callback to :11 and the title argument. Keep.
- :311 Noam's rule ("say which call starts passing and who catches that mistake... Don't put 'equivalent' in the title.") and :313 the new title: strong closer. Keep.
- :317 Oded: "I'd hate to spend the saved time naming this PR." Good closer.
- Cast: Gil's "Stop moving the furniture." (:177) and "These are measurements, not a service guarantee" (:309) are in character. Noam's insistence on the customer-facing bug is consistent with his bio.
- Overall: the arc is the best "performance vs. safety" treatment in the book; the Turn (profile reveals the real cost) is a real turn.

### 05-bonus-ai-and-typescript/01-prompting-for-typescript.md (bonus 1)
Verified with tsc 7.0.2 (verify/haiku-technical/ch28): with the `reset.d.ts` JSON.parse overload, the first implementation gives TS2322 "Type 'unknown' is not assignable to type 'Refund'" at the return (:115 correct, and it points at `return`); the Number-converting second implementation and the `const cents = value.cents;` alternative both compile under the book's tsconfig (:239 correct). The runtime claims (empty string coerced to 0 under `Number`; rejected by the alternative; the five tests pass or fail as described at :330) follow from the code; I did not run `node --test`.
- :5-7 Principle (positive). Eli's rule (decisions go in signatures and examples; run the command against the returned code; compiling through any, as or ! proves nothing) is the chapter's testable claim and it is applied at :330-332. Keep.
- :121 Idan: "Our later overload wins this call." The overload from reset.d.ts is the one used (verified: the error comes from that declaration). The wording "later" depends on file order in interface merging; safer: "our overload is the one that applies". Minor.
- :230 Idan: "That typeof check can't fail after Number." Accurate: after Number, cents is number. Good, it sets up the Turn.
- :288 Dima: "I read that as a spelling of validates." Good line for the chapter's theme; keep.
- :330 The test failure is attributed to the first assert of the loop ("" fails before "100"). Accurate, since assert throws on the first failure. Keep.
- :344-346 The saved request: the structure (scope, files, rule, what to report, the check command) is what the principle asks for. Good.
- :366 Dima: "'this implementation fails it' isn't, by itself, a reason to change it." Good line; consistent with the Principle's "someone still has to own what you meant."
- :378-384 Additional Takes: Idan's warning about old imports joining a separate project is accurate (a program includes imported files). Keep.
- Voice: Chen's "Very harmonious." (:184), Dima's "That's a parser written in English." (:186), and Eli's "Who decides whether the contract describes the job?" (:180) are in character.
- Cross-book: the reset.d.ts augmentation is a direct callback to ch13's declaration merging; the text says so (:121). Good continuity.

### 05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md (bonus 2)
Verified by reading and reasoning; NOT compiled: the Zod 4.6.2 JSON Schema outputs (:155 `required` lists with and without `io: "input"`), the `defineTool`/`forSession` generics and contextual typing against Zod, and the replay printouts (:110, :178, :195, :319-327, :343-346). Zod is not installed in my verification workspace; a release check should run the replay once. The one compile-level claim I can check without Zod, the TS2339 for reading `args.currency` on the strict object (:229), matches the standard message shape.
- :5-7 Principle (positive). Liron's rule ("A customer ID in the arguments isn't authentication... check that customer against the order the call names") and Dafna's "schema describes what the caller may propose" are concrete, and the chapter demonstrates both. Keep. The second paragraph carries three ideas; the reader needs only the first two.
- :155 and :159 The claim that Zod's input description says `currency` can be missing, with `"default":"USD"` advertised, is a precise and useful point. Keep, subject to the Zod check above.
- :186-196 The default-currency fix ("Then require currency. No default.") is the right cascade and matches the story (refusing the original request rather than trusting a value). Keep.
- :229 TS2339 wording ("Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.") is the standard form; plausible, not compiled here.
- :241-249 The friend-call exchange and Liron's "it shouldn't get to become Bob to refund it" (:261) are the chapter's core and land well. Keep.
- :306 Liron: "the closure isn't the ownership check. That comparison is." Good, precise, and it is the Principle's rule in one sentence. Keep.
- :319 "true" (the two session tools have identical parameters) is consistent with the shared `defineTool`; plausible.
- :327 Alice's EUR refund: the EUR currency comes from the order, consistent with `recordRefund(order, cents)` at :281-283. Good.
- :333-350 "The saved answer still says it recorded Alice's refund on o-17." → the outcome comes from `denied.ok`, not the saved `refundIssued` text. This is the chapter's rule in action and it reads clearly. Keep.
- Technical inconsistency (minor): `dispatch` (:142-148) uses `Envelope.parse(input)` and `JSON.parse(call.arguments)` without a try/catch, so a malformed arguments string throws, while `invoke` returns `{ok:false, error}` for invalid arguments. The chapter's theme (failures come back as results) makes this a visible gap. Fix: wrap the parse and return a result, or say why dispatch throws.
- :362-364 Additional Take (refinement cannot be exported to JSON Schema) is accurate for Zod: refinements do not appear in the generated schema. Keep.
- :370 Guy's approval-and-confirmation point ("If the owner wants a confirmation step, we need to enforce that before recording.") is the right closing constraint. Keep.
- :372-376 Gilad's closing ("Bob didn't ask either." and "The customer has expressed no preference about our schema.") is in voice and funny. Keep.
- Story: the Turn ("Why does that field decide anything?") is a real turn: the schema's currency field turns into the server deciding currency from the record. Good.
- Cross-book: `Result<T>` and the "invalid arguments" text match ch14/ch16's result-style handling. Consistent.

### 05-bonus-ai-and-typescript/03-reviewing-ai-code.md (bonus 3)
Verified with tsc 7.0.2 (verify/haiku-technical/ch29): the old `badge` against the patched `orderStatus` gives TS2345 "Argument of type 'string' is not assignable to parameter of type 'never'." (:196, exact); the widened declaration gives the mobile TS2322 "Type 'string' is not assignable to type '"paid" | "partial" | "refunded"'" (:243, exact); the typo in the original gives TS2678 "'"refunded"' is not comparable to '"paid" | "partial" | "refund"'" and TS2345 at the fallback (:293, exact); the two-word `satisfies` version gives TS2820 "Did you mean '"refunded"'?" (:374, exact). Not verified: the `status.d.ts` diff at :204-213 (I checked the widening, not the emitted file text), the TS9007 message at :390, and the "six assertions" count at :380 (three cases times two checks, consistent).
- :5-7 Principle (positive). Daniel's rule (emit declarations before and after with the same settings; put the old caller back; a green compile speaks only for the revised program) is a specific, testable procedure, and the chapter follows it. This is the best Principle for the review audience. Keep.
- :130-132 "What did the fix fix?" is a strong question and the reviewer procedure is consistent with the Principle. Keep.
- :225 Noam: "You don't get to insert a word after I've reviewed the sentence." Good line, in voice.
- :255 Oded: "We lost the compiler asking me to fix a function that works. That was the attraction." Good, honest.
- :285 "We replaced the check with permission to display it." Clear and correct about the fallback. Keep.
- :293 and :295 make the chapter's central point: a type-error repair that silently changed behaviour. Good.
- :339 Eden's "shouldn't be where we accidentally decide which statuses the API offers." Good; fine.
- :345 Daniel: "Checking the table against the same type also puts the typo error where the label is written." Accurate (TS2820 at the table, verified). Keep.
- :392 "The flag even allows some simple inferred exports. It doesn't require a return annotation on every export." Accurate in outline (isolatedDeclarations allows some inferred forms); not separately verified.
- :402 Eden's Verdict and :404 Noam's rule (attach the before-and-after declarations; if a caller needs repairing, show the error that made you change it). Concrete, applicable. Keep.
- :414 Oded: "Good. Now I have a green pull request and a meeting four minutes ago." Good closer, matching the opening (six minutes).
- :418 and :420 Additional Takes: correct and sharp. Keep.
- Cross-book: the "explicit return type on public APIs" point ties to ch7/ch24/ch25 and to the earlier generics chapter (ch6 :228). Good continuity.
- Story: Oded's "Two words" fix is a real turn that also lands in a design decision (`OrderStatus`, `RefundLevel`), not just a patch. Good.

---

## 3. Cross-book inconsistencies (one list)

1. **Role union differs.** ch1 (`UserProfile`) and ch2 (`User`) use `"admin" | "user" | "viewer"`; ch3 (`User`) uses `"admin" | "editor" | "viewer"`. Align or label as different models.
2. **`User` has five different shapes.** ch1 `{id, email, paymentMethod}`; ch2 `ApiUser {id, name, email}`; ch3 `User {id, name, email, role, createdAt, ...}`; ch5 `User {id, email, displayName}`; ch8 `User {id, displayName, email, bio?, roles}`. Each is locally fine; together they look careless. Rename the example types in the later chapters (e.g. `Account`, `Member`) or add one sentence where the shape changes.
3. **Terminology for the same outcome.** ch21 Principle says "Report the outcome as unknown"; code and Verdict say `"unconfirmed"`.
4. **Principle sections that are not rules.** ch3 (question list), ch8 (definition of `Partial`), ch9 (definition of template literal types), ch10 (SDK incident, `infer` definition), ch13 (observation, no rule), ch7 (syntax explanation, rule only in Verdict). The book's own skeleton requires a stated testable rule up front; these six need one.
5. **Verdicts without a reusable rule.** ch12 (list of decisions), ch8 (describes the decision), ch10 (either version passes), ch16 partly. The reusable rule is present in the Debate in each case; move it to the Verdict.
6. **Quoted diagnostics that differ from 7.0.2.** ch7 TS2769 block (:126-132) and ch25 TS2741 (:115-117). The book states all checks use 7.0.2.
7. **ch1 Noam's timeline.** "six months ago" (:81) vs "eight sprints" (:108).
8. **ch5 vs ch5.** Noam's Take at :457 presents the silent non-failure of a predicate as a benefit, contradicting Idan's argument at :257 in the same chapter.
9. **ch16 vs ch16.** Eden "We'd stored every successful update. Or so I thought" (:108) vs "Our inbox only had the shipment ID and status" (:128): the before/after state is not stated.
10. **ch4 vs ch4.** `enum HttpStatus` (:138) and `const HttpStatus` (:188) in one chapter.
11. **Principle wording on `as`/`!`.** ch2 Chen's `.filter()` example (:306) is out of date for TS 5.5+ inferred predicates (verified). Fix the example; the claim holds only for `filter(Boolean)`-style predicates.
12. **Node/TS version claims.** ch13's `import "label-kit/frame"` assumes the plugin ships declarations; under TS 7.0.2 `noUncheckedSideEffectImports` defaults to true (verified). The prologue's config statement should mention it, or the example should say the plugin has types.
13. **Running numbers.** ch10 "forty callers" (:11) and ch10 "forty call sites" (:400) agree. ch1 "3 million lines" and ch24 Eden are consistent. ch2 "400 API calls" and ch4 "four hundred enums" are unrelated and fine.
14. **Pronouns.** Idan "she" (bio) is used consistently. Dafna "she", Linoy "she", Chen "he", others "he" as in bios. No conflicts found; Gil is referred to by name without a pronoun in most chapters, which is consistent with the bio.
15. **Dima's and Gil's stance language** is consistent across ch3, ch19, ch25 and ch27.
16. **Overlapping names.** `Result<T>`/`Result<T,E>` appear in ch14, ch21, ch23 with the same `{ok, value} | {ok, error}` shape: consistent. `ParseResult<T>` in ch5/ch6 and `Projection` in ch16 are separate and labelled.
17. **Eli's promise.** ch8's "Eli had promised 'types that walk an object's keys'" refers to ch6 Additional Takes; accurate.

## 4. Top 15 for release (ranked)

1. **ch7 TS2769 quoted diagnostic** does not match 7.0.2 (:126-132). Replace with the compiler's text.
2. **ch25 TS2741 quoted diagnostic** (:115-117) is TS2345 with a different detail in 7.0.2. Replace with the real output.
3. **ch5 Noam's Take at :457** presents the predicate's silent non-failure as a benefit, undoing Idan's central point. Fix the reversal.
4. **ch1 meta-note in Eden's dialogue** ("In these snapshots, ...", :196). Cut it.
5. **Principles that are not rules** in ch3, ch7, ch8, ch9, ch10, ch13: state one testable rule up front in each.
6. **ch12 Verdict** is a list of decisions; state the reusable rule ("pass each consumer only the reader or writer it uses").
7. **ch16 before/after inbox contradiction** (:108 vs :128). Add the one sentence that resolves it.
8. **ch6 Turn** answers Chen's `identity` question with a non-answer (:319). Give a concrete example or cut the Turn to the working point.
9. **ch8 structure**: no Principle rule, a Turn that is a sub-thread, and about 460 lines of micro-exchanges. Cut two sub-debates and state the rule.
10. **ch2 AI-feel closers**: "leaves X beside Y" (:237), the aphorisms at :364-366 and :376. Cut or shorten.
11. **ch21 terminology**: "unknown" (Principle) vs "unconfirmed" (code). Use one word.
12. **ch4 duplicate `HttpStatus` declaration** in one chapter (:138 and :188). Rename the object.
13. **ch26 and ch27 compile-level claims are strong; ch27's benchmark numbers and "387 bytes" are unverified.** Flag them as measured-on-date in the text or rerun before print.
14. **Bonus 2 `dispatch`** throws on malformed envelope and arguments JSON while `invoke` returns results (:142-148). Make dispatch return a failure or justify the throw.
15. **Cross-book `User` shapes and role union** (inconsistency items 1-2). Rename or label.

Also before print: confirm `@ts-nocheck` still works in 7.0.2 (ch24), run the Zod 4 examples (ch16, bonus 2), and reproduce the Node `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` path (ch25).

## 5. Per-chapter grades

- 00 Prologue — **B+**. The cast bios are vivid and the format is clear. Cut the "Eden keeps asking him" line only if it becomes a bio cliché (no change required now).
- Ch1 `any` vs `unknown` — **B+**. Strongest opening; Principle is clear. Fix the meta-note and the `logEvent` change.
- Ch2 Assertions — **B**. Accurate compiler claims; the Verdict table and closers need trimming.
- Ch3 interface vs type — **B-**. Principle is a question list; the rule lives only in the Verdict.
- Ch4 enums vs unions — **A-**. Accurate, entertaining, honest. Fix the duplicate `HttpStatus` naming.
- Ch5 narrowing — **B**. Good debate on parsers. Noam's Take at :457 must be fixed.
- Ch6 generics — **B+**. The "lens" Turn is the weak spot.
- Ch7 conditional types — **B+**. Excellent debate; the diagnostic must be corrected and the Principle restated.
- Ch8 mapped types — **C+/B-**. Technically precise; too long and micro-debated, with no rule stated.
- Ch9 template literals — **B**. Strong Additional Takes; Principle missing a rule.
- Ch10 infer — **B-**. Real Turn and good numbers; long middle section; rule buried.
- Ch11 builders — **B+**. Clear Principle; ends on a question (acceptable as open ending).
- Ch12 variance — **A-**. The most careful technical chapter after ch4; Verdict needs its rule.
- Ch13 declaration merging — **B+**. The emitted-JS Turn is excellent; Principle needs a rule.
- Ch14 error handling — **A-**. Good Principle, real Turn, strong queue closer.
- Ch15 branded types — **A-**. Principle is the best in the book; Eli's closing line lands.
- Ch16 runtime validation — **B+**. Clear arcs; the before/after inbox contradiction and a summary Verdict.
- Ch17 immutability — **B**. Principle good; the three-wrapper middle is repetitive.
- Ch18 pure functions — **B+**. The time-zone Turn is excellent; the boundary-expiry section is long.
- Ch19 imperative vs declarative — **B**. Rigorous, verified; very dense finance replay; a casual reader will skim the table.
- Ch20 currying — **B+**. The empty-run Turn is the best moment.
- Ch21 HOF/retries — **B**. Strong Principle and early-acceptance Turn; "unknown"/"unconfirmed" and a long wrapper section.
- Ch22 config to function — **A-**. Round-trip Principle, strong hook, the replay-as-guard point.
- Ch23 monads light — **B+**. Real Turn about promise adoption; funny and accurate.
- Ch24 migration — **A-**. Most technically accurate of part four; Turn is real.
- Ch25 monorepo — **B-**. Real Turn, but the quoted diagnostic is wrong and the config density is heavy.
- Ch26 testing typed code — **A-**. Diagnostics checked exact; "It can't be green" carries the chapter.
- Ch27 performance vs safety — **B+**. Best performance-versus-safety treatment; numbers unverified.
- Bonus 1 prompting — **A-**. Concrete, verified, funny; the "validates" vs "normalizes" beat works.
- Bonus 2 agent patterns — **B+**. Ownership point is clear; Zod outputs unverified; dispatch gap.
- Bonus 3 reviewing AI code — **A-**. The best-verified bonus; the review procedure is useful.

Where I enjoyed it: ch1 (the Oded/Noam exchange), ch4 (the Sahar/Guy turn), ch7 (Oded's "So it lies, but it only lies in one place"), ch12 (the reader/writer split), ch13 (the emitted-JS Turn), ch14 (Liron's queue), ch18 (Dafna's wrong premise), ch19 (Gil's exhaustive run), ch22 (the opening log), ch23 (the thenable Turn), ch26 ("It can't be green"), bonus 1 and 3.
Where I got bored: ch8 (micro-debates over the same types), ch17 (three wrappers for one idea), ch19 (the finance replay), ch21 (the wrapper middle), ch25 (config blocks).

## 6. Overall readiness verdict

**Ready after fixes.** The book's technical content is unusually reliable: nearly every compiler claim I could check matches 7.0.2 (exact diagnostics in ch4, ch6, ch8, ch9, ch11, ch12, ch13, ch14, ch15, ch17, ch19, ch20, ch22, ch26, bonus 1 and bonus 3). Two quoted diagnostics do not match (ch7, ch25) and must be fixed before print, since a reader will run them. The structural problem is consistent: six Principles state a fact instead of a rule, and several Verdicts state decisions rather than the rule a reader can apply. The fixes are local: rewrite six opening paragraphs, cut the two longest micro-debates (ch8, ch17), correct the Noam reversal in ch5, and resolve the inventory of cross-book shape names. The voice holds through the end; the bonuses are among the strongest pieces. Ship after those fixes and the verification items listed in section 4.
