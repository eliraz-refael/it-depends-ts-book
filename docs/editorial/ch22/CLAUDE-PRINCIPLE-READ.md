# Reader report: Chapter 22, "The Principle" (draft 1, first-time read)

Draft 1 (`13db9f3c…`, `4b0d7f7`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–21 stated as prerequisites, and the four cases from the
[plan](../CH22-PLAN.md). It was also asked whether the section was enjoyable and where its attention
dropped. It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing. The report
is copied verbatim.

---

## 1. The rule, quoted

| # | Quote | Explicit? | Mechanical? | What I had to supply |
|---|---|---|---|---|
| R1 | "Before you turn configuration into a function, find everyone who uses it." | Yes, an imperative. | Partly. "Find everyone" is a task I can do. | Who counts as a user. Does a future dashboard count? A support engineer reading a database row? The next sentence helps a little. |
| R2 | "Some callers need something they can call. Others need something they can save, edit or explain later." | It's a way to sort callers, not a rule. | Yes, once I have the list from R1. | What to do if the callers are mixed. My guess is the "save/edit/explain" callers win, but the section never says so. |
| R3 | "A function value isn't a saved account of its code and captured values." | A fact, stated plainly. | N/A | I had to translate "saved account": it means JSON or storage doesn't keep a function's source or its closure. I checked this (see 3a). |
| R4 | "Store a description your evaluator understands, or identify retained code and the parameters it used." | Yes. Two allowed options. | The first option, yes. The second, no. | What "identify retained code" means. I read it as "store a stable name, id or version for code that stays deployed, plus the arguments," like a registry key. That's my guess. "Evaluator" is also used without being defined here. |
| R5 | "Then test the round trip: save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?" | Yes. | Yes. This is the most usable sentence in the section. | How to record an "evaluator version," and whether the test should run once or in CI. |
| R6 | "For the next change, ask what kind of change it is. A new parameter value? A combination the format already permits? Or a new operation somebody must implement?" | Yes, a question with three answers. | Classifying is mechanical. Acting on the result isn't, because the section never says what to do for each kind. | The consequences. My reading: the first two kinds need no code change, the third needs engineering. I inferred that. |
| R7 | "An editable rule format gives its authors the choices its evaluator supports. Putting the combinations in code gives those choices to the code's authors." | It describes a tradeoff. It isn't an instruction. | No. | Which arrangement to prefer. It tells me who ends up with control, but not who should have it. |
| R8 | "Neither arrangement updates old stored values when you edit a type. Parse those values and decide what their old shape means." | Yes. | "Parse" is mechanical, and it ties back nicely to the parsing-at-boundaries chapter. "Decide what their old shape means" is left entirely to me. | The policy choice: default the value, migrate it, reject it, or keep a versioned union. |

## 2. In your own words

Configuration that gets saved, edited or shown to people can't just be a function, because a function doesn't survive storage, can't be edited, and can't be explained. So before making it a function, list who consumes it. If anyone needs to persist or inspect it, store data that an evaluator interprets, or store a reference to code that stays deployed plus its arguments. Then prove that a save/load cycle gives the same decision. When a change request comes in, work out whether it's a new value, a new combination, or a new operation. Only the last needs engineers, and the format you picked determines who gets to make the other two. Changing a TypeScript type never fixes data that's already stored, so parse old records and decide explicitly what they mean.

## 3. Apply it

### (a) `shouldNotify?: (event: Event) => boolean` saved to localStorage via JSON

**What the Principle says to do:** R1/R2 first. The preferences store is a "save" caller. R3 says the function won't survive, and R4 says to store a description instead. R5 says to test the round trip.

**Words I relied on:** "A function value isn't a saved account of its code and captured values" and "Store a description your evaluator understands."

**What I checked:** I wrote `a.mjs` in the scratchpad and ran it.
```
saved: {"channel":"email"}
loaded.shouldNotify: undefined
call: loaded.shouldNotify is not a function
toString: (e) => e.severity > threshold   <- threshold not included
```
`JSON.stringify` silently drops the function. Even `toString()` would lose the captured `threshold`, which is exactly what "captured values" means.

There's a worse detail the Principle doesn't mention. Because the field is *optional*, TypeScript is happy with the loaded object. A caller writing `settings.shouldNotify?.(e)` silently does nothing, so the user's filter just disappears with no error. The `?` hides the loss. I'd like Liron to say this, since it's the TypeScript-specific trap.

**What I'd change:** replace the field with a description, e.g. `rule: { kind: "severityAbove"; min: number } | { kind: "always" }`, plus an `evaluate(rule, event)` function. I'd also parse the localStorage value on load (R8). My round-trip check on the description version returned `true`.

**What I decided myself:**
- Which condition kinds to offer.
- What to do with preferences already saved without a rule. I chose to treat them as "always".

### (b) Feature flags: PMs target by plan/country, now asked for "workspace has more than three admins"

**What the Principle says to do:** R6 says to classify the request. Plan and country are existing condition kinds. "More than three admins" isn't a new value or a new combination of plan/country. It needs a new input (admin count per workspace) and a new comparison, so it's "a new operation somebody must implement." R7 says who controls what: once the evaluator supports it, PMs get the choice.

**Words I relied on:** "a new operation somebody must implement" and "An editable rule format gives its authors the choices its evaluator supports."

**What I'd do:** add a condition kind with a parameter, e.g. `{ kind: "workspaceAdminsAbove", count: number }`, instead of hard-coding a `>3` predicate. That way the next "more than five" request is a new parameter value the PMs can set themselves. Hard-coding it in a function would keep that choice with engineers ("gives those choices to the code's authors"). Per R1, the admin UI is also a user, so it has to render and explain the new kind. I'd run the R5 round-trip test with a recorded user/workspace.

**What I decided myself:**
- *Who decides whether to add it.* The section tells me who controls the choices afterwards, not who approves a new operation. I assumed engineering implements it and product decides whether it's wanted.
- Whether to generalise. Should it be "workspaceAdminsAbove" or a general "workspace attribute comparison"? The section gives me no guidance on how general to make a new operation.
- Data freshness: where does the admin count come from at evaluation time? This isn't addressed, but it matters for "the same recorded input."

### (c) A JSON rules table whose condition type gained a required field

**What the Principle says:** R8, directly.

**Words I relied on:** "Neither arrangement updates old stored values when you edit a type. Parse those values and decide what their old shape means."

**What I checked:** I wrote `c.ts` in the scratchpad with `type Cond = { kind: "plan"; plan: string; negate: boolean }`.
- **Compile time:** `JSON.parse(...) as Cond[]` compiles with no error. The only error reported was TS2741 on a hand-written *literal* missing `negate`. So the compiler flags new code you write, never the stored rules.
- **Runtime:** stored rules have `negate === undefined`, so `r.negate ? … : …` quietly takes the false branch. Whether that's correct depends on the field's meaning. That's the "decide what their old shape means" part.

**What I'd change:** replace the `as` cast with a parser. The parser would accept the old shape (missing `negate`) and map it explicitly, e.g. to `negate: false`. Alternatively it could reject the record or route it to a migration. I'd write a stored-version or old-shape test fixture.

**What I decided myself:** the meaning of the missing field, and whether to migrate the stored rows once or parse old shapes forever. The Principle leaves both open.

### (d) Build tool config: static object or function of the environment, read by a cross-repo dashboard

**What the Principle says:** R1 says to find everyone who uses it. The build tool is a "call" caller. The dashboard is an "explain later" caller. So R2 points toward data the dashboard can read.

**Words I relied on:** "Others need something they can save, edit or explain later" and "Store a description your evaluator understands."

**What I'd do:** prefer a static description that includes environment variation, e.g. a base object plus per-environment overrides. If a function form must stay, use R4's second option: record which code and which parameters produced each result. Concretely, the build could emit the resolved config for each environment it ran with, and the dashboard would read those outputs.

**What I decided myself, and where it stops helping:**
- Can the dashboard just *call* the function once per known environment? That looks like "apply the same recorded input," but the section never says whether evaluating at read time is acceptable. It also ignores the case where the function reads the filesystem or makes network calls.
- What "the environment" includes is something I had to decide.
- This is a library-design case, and I can't stop users from writing functions. The Principle reads as advice to the person *designing* the format, not to the person *consuming* someone else's.

## 4. Where the section left me unsure

1. **"identify retained code and the parameters it used."** Does this mean a registry name, a code hash, a deployed version, or something else? This is the half of R4 I couldn't apply.
2. **"evaluator."** It's used three times and never introduced here. Is it the function that interprets the description, the deployed service, or the TypeScript module?
3. **"evaluator version."** How is it recorded? Is it stored alongside each value? If the version changes, is a different decision a bug or expected?
4. **Mixed callers.** If some callers need to call and others need to save, which wins? Or should you keep both a description and a compiled function?
5. **What to do after classifying a change (R6).** It asks the question but doesn't attach an action to each answer.
6. **R7 is neutral.** I can't tell whether Liron prefers the editable format. It reads like a statement of fact, and the "who decides" question in (b) has no answer.
7. **R8's "decide."** Should you default, migrate, reject, or version? Even one sentence on how to choose would help.
8. **The optional-field trap from (a).** It isn't mentioned, though it's arguably where TypeScript makes this worse.
9. **"Configuration."** Is a notification filter configuration? Is a feature-flag rule? I assumed yes, but the scope isn't stated.

## 5. Clarity and voice

**Sentences I reread:**
- "A function value isn't a saved account of its code and captured values." I read "account" first as a user account. "Record" would be clearer, or something blunter: "A function doesn't survive being saved: JSON drops it, and even its source text loses the values it closed over."
- "Store a description your evaluator understands, or identify retained code and the parameters it used." I read this three times. The second clause is abstract enough that I still had to guess.
- "Neither arrangement updates old stored values when you edit a type." This one is clear, but it arrives abruptly. The paragraph moves from "who controls choices" to "schema migration" with no bridge.

**Terms used without explanation:** "evaluator," "retained code," "evaluator version," and "format" (it implies a rule language).

**Person or documentation?** Mostly documentation. It's careful and compressed, and every sentence is hedged to be correct, but I can't hear Liron in it. There's no "I," no story, no warmth. Strangest of all for a Lisp/Clojure veteran, there's no nod to code-as-data, which is the obvious place for his background to show ("In Lisp we got to pretend code was data. In JSON you don't."). The closing question "Does it make the same decision?" and the three-question rhythm in paragraph two are where a person comes through. Those are the best lines.

**Enjoyable?** It's short and dense, so it wasn't a chore, but it wasn't fun either. My attention was highest at the opening ("find everyone who uses it" is a good, concrete hook) and at the round-trip test. It dropped at the "identify retained code" sentence and again at the R7 pair. Those two read like a balanced pair of propositions and leave me without a direction. The final "Parse those values" brought me back, because it pays off the earlier parsing chapters. One concrete example, like a closure in localStorage coming back as `undefined`, would make the whole section stick.

**Scratch files** (my checks):
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read1/p/a.mjs
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read1/p/c.ts
