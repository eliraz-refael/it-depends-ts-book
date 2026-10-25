# Reader report: Chapter 22, "The Principle" (draft 2, first-time read)

Draft 2 (`89f14da7…`, `e4838bc`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–21 stated as prerequisites. The prompt and the four cases were the same as
the draft-1 read. It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing.
The report is copied verbatim.

---

# Reader report: Chapter 22, "The Principle" (Liron Closure)

Scratch files are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read2/p/` (`a.mjs`, `c.ts`, `c2.ts`, `c.mjs`).

## 1. The rule, quoted

**R1.** "Before you turn configuration into a function, find everyone who uses it. Some callers need something they can call. Others need something they can save, edit or explain later."
- **Explicit?** Yes. It's an imperative with a clear trigger: you're about to make config a function.
- **Mechanical?** Partly. It works as a checklist: list the consumers, then sort each into "calls it" or "saves/edits/explains it". I had to supply three things myself:
  - who counts as a "caller". Does a human in an admin UI count? An auditor? A dashboard?
  - what to do if *every* caller only calls. I assume a function is fine then, but the section never says so.
  - what to do when the two kinds are mixed. R2 answers that, so I read R1 and R2 as one rule.

**R2.** "Save a description and let code read it and make the decision. That code is your evaluator. Or save the name of a code version you'll keep available for replay, plus its parameters."
- **Explicit?** Yes. There are two allowed options, and the term "evaluator" is defined right there.
- **Mechanical?** Option A (description plus evaluator) I can apply. Option B (named code version plus parameters) I can't, without guessing:
  - "code version" could mean a git SHA, a named strategy like `"priorityThreshold@v2"`, or something else.
  - "Replay" is never explained. I took it to mean re-running a past decision for audit or debugging.
  - Nothing says when to choose B over A.

**R3.** "Then test the round trip: save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?"
- **Explicit?** Yes, and it's the most testable sentence in the section.
- **Mechanical?** Mostly. I had to work out that "recorded input" means the runtime context (the event, the user) and not the config itself. "Same evaluator version" assumes you version your evaluator, and the section never says you should, or how.

**R4.** "For the next change, ask what kind of change it is. A new parameter value? Its author can edit the data. A combination the format already permits? A rule's author can write it. With named combinations in code, an engineer still has to do that work. Or a new operation? An engineer must implement it in either design."
- **Explicit?** Yes. It sorts changes into three kinds and says who does each.
- **Mechanical?** The three kinds are clear. The sentence "With named combinations in code, an engineer still has to do that work" took me two reads. I eventually decided it contrasts with the description design: if rules are presets written in code (for example `isEnterpriseEU()`), even a combination that the data format would have allowed needs an engineer.
- **What I supplied:** how to tell "a combination the format permits" from "a new operation" when the new combination needs a field the evaluator doesn't have yet. That is exactly case (b).

**R5.** "When you load old stored values, parse them and preserve their old meaning or reject them. Editing a type won't do that job."
- **Explicit?** Yes, and it links cleanly to the parsing-at-boundaries chapter.
- **Mechanical?** Yes: put a parser at load time, and for each old shape either migrate it to the same meaning or reject it. I had to decide for myself which one to do, and what happens to a rejected rule. Does it fail closed? Is it skipped? Does it raise an alert?

## 2. In your own words

Before making a config value "smart", check who else touches it. If anything has to store it, edit it or show it to a human, don't store code. Store a plain description and keep a separate evaluator that interprets it, or store a reference to a versioned piece of code plus its arguments. Prove it with a test that saves the config, loads it back and gets the same decision on the same input. When a new request arrives, decide whether it's a new value, a new combination or a new operation: authors handle the first two, engineers handle the third. Anything already stored must go through a parser that keeps its old meaning or refuses it, because changing a TypeScript type doesn't touch bytes already on disk.

## 3. Apply it

### (a) `shouldNotify?: (event: Event) => boolean` saved to localStorage via JSON

- **What breaks:** I ran `a.mjs`. `JSON.stringify({ email: true, shouldNotify: fn })` produced `{"email":true}`. The function was silently dropped, and after reload `shouldNotify` is `undefined`. The type says the field is optional, so the reloaded value still fits the type. Code would quietly fall into the "no predicate" path, which probably means "notify on everything". Nothing throws.
- **Words I relied on:**
  - "JSON won't keep a JavaScript function"
  - "Others need something they can save"
  - "Save a description and let code read it"
  - "test the round trip"
- **What I'd change:** replace the field with a description such as `{ kind: "minPriority", value: 2 }` (a union of rule kinds) plus an `evaluate(rule, event)` function. On load I'd parse with a schema. I ran that version too, and the round trip gave the same decision (`true`).
- **What I decided myself:**
  - which rule kinds to support
  - what to do with a stored value the parser rejects. I'd fall back to defaults and tell the user, but the Principle only says "reject".
  - whether a settings UI needs to "explain" the rule. That pushes towards the description, but it's my inference.

### (b) Feature flags; PMs target by plan and country; engineering is asked for "workspace has more than three admins"

- **What the Principle says:** classify the change using R4.
  - Plan and country are fields the format already has.
  - Admin count is a new attribute and a numeric comparison. The evaluator has to fetch it at decision time, and the rules have to express "> 3".
  - Unless the format already supports generic numeric comparisons over a known set of attributes, *and* admin count is one of them, this is "a new operation". That means "An engineer must implement it in either design."
- **Who does what:** an engineer adds a new condition kind (for example `{ kind: "adminCount", op: "gt", value: 3 }`). After that, PMs can change the threshold ("a new parameter value") and combine it with plan and country ("a combination the format already permits").
- **Who decides:** the Principle says who *does* each kind of change. It doesn't say who *decides* whether to add a new kind, or how general to make it (one `adminCount` kind, or a generic `numericAttribute` kind). I had to make that call myself.
- **Words I relied on:**
  - "ask what kind of change it is"
  - "a new operation? An engineer must implement it in either design"
- **What I'd also check:** whether the evaluator can get the admin count cheaply at decision time. The Principle doesn't raise this, but it decides whether the new kind is feasible.

### (c) JSON rules table; the TypeScript condition type gains a required field

- **Compile time:** nothing happens to stored rules. I ran `c.ts`, which does `JSON.parse(stored) as Condition[]` with the new required `negate: boolean`, and `tsc` exited 0. A *literal* without the field fails (`c2.ts`: TS2741 "Property 'negate' is missing"), so the type only polices new code, not old data.
- **Runtime:** `c.mjs` shows `negate` is `undefined` on the old rule. Here it happened to behave like `false`, so the rule kept its meaning by luck. With a field whose falsy value means something different (for example a new `caseSensitive: boolean` where old rules were case-sensitive), the old rules would silently change meaning.
- **Words I relied on:**
  - "parse them and preserve their old meaning or reject them"
  - "Editing a type won't do that job"
- **What I'd do:** add a load-time parser that accepts the old shape and fills the new field with the value that keeps the old behaviour (`negate: false`). Better still, version the stored format so the parser knows which shape it has. I'd reject anything it can't migrate, and add a round-trip test (R3) over a sample of real stored rules.
- **What I decided myself:**
  - the default value, which is domain knowledge
  - whether to rewrite the stored data once, or migrate on every read
  - what "reject" means operationally for a live flag

### (d) Build-tool config written either as a static object or as a function of the environment; a dashboard lists every repository's settings

- **What the Principle says:** R1 applies directly. The build tool is a caller that "needs something it can call". The dashboard is a caller that needs "something it can … explain later".
  - A static object serves both.
  - A function serves only the build tool. To list settings, the dashboard would have to run each repository's code, for every environment, which is a security and sandboxing problem.
  - So the Principle pushes towards static descriptions. Environment differences would go in as data (for example `{ base: {...}, overrides: { production: {...} } }`), resolved by the tool's own evaluator, which the dashboard can also run safely.
- **Words I relied on:**
  - "find everyone who uses it"
  - "Others need something they can save, edit or explain later"
  - "Save a description and let code read it"
- **What I decided myself:**
  - what to do about existing function configs. Do you ban them, or let the dashboard show "dynamic: can't display"? R2's "name of a code version … plus its parameters" sort of fits a named preset with arguments, but I couldn't see how to use it here.
  - whether "a function of the environment" is acceptable when the set of environments is small and fixed, so the dashboard could call it once per environment. The Principle doesn't say whether calling a pure function over a known input set counts as "explaining" the config.

## 4. Where the section left you unsure

1. **Option B is opaque.** "Save the name of a code version you'll keep available for replay." What is a "code version", and what is "replay"? When should I pick it over a description? This is the sentence I understood least.
2. **"Evaluator version"** is mentioned in the round-trip test but never introduced. Am I supposed to version my evaluator? How, and is the version stored with the data?
3. **"With named combinations in code, an engineer still has to do that work."** Whose design is "named combinations in code"? It reads like a third option the section never set up. I guessed it means presets written as functions.
4. **"Recorded input."** I inferred it means the runtime context the decision ran against. A short gloss would help.
5. **No "a function is fine" case.** R1 implies a function is acceptable if all callers just call it, but the section never says so. Without that, the rule reads as "never store functions", which may be stronger than intended.
6. **Who decides about a new operation** (case b). The section says who implements it, not who approves it or how general it should be.
7. **"Reject them".** What should a running system do with a rejected stored rule? Fail closed, skip it, or alert someone?
8. **Data that the evaluator needs but the description can't hold** (for example the admin count in case b). Is that a new operation, or just a new parameter? The lines between the three kinds of change blur here.

## 5. Clarity and voice

**Sentences I reread:**
- "Lisp spoiled me for treating code as data." "Spoiled me *for* X" usually means "made me unable to enjoy X". I think he means "spoiled me *with*" or "got me used to". The next clause ("but JSON won't keep a JavaScript function") only makes sense under the second reading.
- "Or save the name of a code version you'll keep available for replay, plus its parameters." It's long, abstract, and two of its terms are undefined.
- "With named combinations in code, an engineer still has to do that work." The subject comes from nowhere, and "still" points back to a contrast I had to reconstruct.
- "A combination the format already permits? A rule's author can write it." It's fine, but "a rule's author" next to "its author" one sentence earlier made me wonder whether they are different people (a value editor and a rule author).

**Terms used without explanation:** "replay", "code version", "evaluator version", "recorded input", "named combinations", "format" (the stored schema, I assume). "Evaluator" itself is defined well.

**Person or documentation?** It's mostly documentation with one human line.
- "Lisp spoiled me…" is the only place I hear Liron, and it's the warmest sentence in the section.
- The second paragraph is a run of question-and-answer fragments ("A new parameter value? Its author can edit the data."). It reads like a decision table read aloud, not like a warm Clojure veteran talking. It's crisp, but it has no personality.
- I'd expect Liron to give one concrete image, for example "a rule is a little list the evaluator walks". That would tie the Lisp remark to the advice.

**Enjoyable?** It's short and dense. I liked the first three sentences and the closing "Editing a type won't do that job", which lands well after the earlier chapters on parsing at boundaries.
- My attention dropped at the option-B sentence and through the middle of paragraph two, where the fragments pile up.
- The round-trip question ("Does it make the same decision?") is a good, testable hook.
- The rule is clearly stated up front, so the "explicit testable rule" bar is met for R1, R3 and R5. R2's second option and the "named combinations" line are the weak spots.
