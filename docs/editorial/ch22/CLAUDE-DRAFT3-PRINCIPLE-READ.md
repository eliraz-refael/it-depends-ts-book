# Reader report: Chapter 22, "The Principle" (draft 3, first-time read)

Draft 3 (`8f2ecb7c…`, `bfd4b32`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–21 stated as prerequisites. The prompt and the four cases were the same as
the earlier reads. It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing.
The report is copied verbatim.

---

# Reader report: Ch22 "The Principle" (Liron Closure)

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read3/p/principle.md`. My scratch checks are `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read3/p/a.mjs` and `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read3/p/c.ts`.

## 1. The rules, quoted

The section states six rules.

**R1. "Before you turn configuration into a function, find everyone who uses it. If every caller only calls it, a function is fine."**
- **Explicit?** Yes. It is the clearest rule in the section, and you can apply it as a checklist: list the consumers, then ask whether each one only invokes the config.
- **What I supplied:**
  - What "only calls it" excludes. I read it as "does nothing except execute it": no saving, displaying, diffing, editing in a UI or auditing.
  - How to count users who don't exist yet. The next sentence ("someone may need to save, edit or explain it later") makes the rule about future users too, and you can't list those mechanically. So "find everyone" quietly becomes "predict everyone", and I had to guess at that.

**R2. "Save a description and let code read it and make the decision. That code is your evaluator."**
- **Explicit?** Yes, as a prescription for the case where R1 fails.
- **Mechanical?** Mostly. You replace the function with a data value plus an interpreter.
- **What I supplied:** what a "description" looks like. I assumed a discriminated union, as in earlier chapters; the section doesn't say.

**R3. "Or record the name of the exact code that made the decision, plus its parameters. Keep that code so you can rerun old decisions."**
- **Explicit?** Yes, but its relation to R2 is unclear. "Or" makes it an alternative to R2, but it reads more like an audit-log technique for when you keep functions.
- **Mechanical?** No. It doesn't say when to choose R3 over R2.
- **What I supplied:**
  - A meaning for "name of the exact code". I took it as a registry key plus a version, such as `adminsAbove@v3`.
  - The idea that keeping that code means never deleting or changing a named version.

**R4. "Then test the round trip: save it, load it, and apply the same recorded input with the same evaluator version. Does it make the same decision?"**
- **Explicit and mechanical?** Yes. This is a property test you could write today.
- **What I supplied:** a meaning for "evaluator version". The section hadn't said that evaluators have versions until this sentence.

**R5. The change taxonomy:**
- **The text:** "A new parameter value? Its author can edit the data. A combination the format already permits? A rule's author can write it. If engineers write the combinations as named templates, another combination needs an engineer. Or a new operation? An engineer must implement it in either design."
- **Explicit?** Yes, and it is close to mechanical. It is a three-way classification with an owner for each kind: data author, rule author, engineer.
- **What I supplied:**
  - What "either design" refers to. I guessed function vs. description, or perhaps composable format vs. named templates; the text doesn't say which.
  - The difference between "its author" and "a rule's author".
  - Who does the classifying.

**R6. "When you load old stored values, parse them and preserve their old meaning or reject them. Editing a type won't do that job."**
- **Explicit and mechanical?** Yes. You parse at load and either migrate or reject, never cast. This ties back cleanly to the earlier chapter on parsing at boundaries.
- **What I supplied:** what "preserve their old meaning" means in practice. I read it as "migrate with a default that reproduces the old behaviour", not just any default.

## 2. In my own words

A function can't be saved, shown or edited, so before you make config a function, check that nobody needs to do any of that. If someone does, store a plain description and write one piece of code (the evaluator) that interprets it. Alternatively, log which versioned code made each decision, with its inputs. Either way, prove that save, load and re-evaluate gives the same answer. When requirements change, first sort the change into one of three kinds: a new value, a new combination of things that already exist, or a genuinely new operation. Only the last always needs an engineer. Old stored data doesn't change when your types change, so parse it on load.

## 3. Applying it

### (a) `shouldNotify?: (event: Event) => boolean` saved to localStorage via JSON

**What breaks.** I ran `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read3/p/a.mjs` in node:
```
saved: {"channel":"email"}
loaded: { channel: 'email' }  typeof shouldNotify: undefined
call: loaded.shouldNotify is not a function
```
`JSON.stringify` silently drops the function.

The worse part is that the field is optional (`?:`). So the loaded object still matches the type, and code that writes `settings.shouldNotify?.(e)` just stops filtering. Nothing errors, and the user's preference is quietly lost.

**What the Principle tells me.**
- **Words I relied on:**
  - "find everyone who uses it". localStorage is a user that saves, so "every caller only calls it" is false.
  - "JSON won't keep a JavaScript function."
  - "Save a description and let code read it."
- **What I'd check and change:**
  - Replace the field with a description, for example `notifyWhen: { kind: "priorityAbove"; min: number } | { kind: "always" }`.
  - Write `evaluate(cond, event)` as the evaluator.
  - Parse on load (R6), since older saved prefs won't have `notifyWhen`.
  - Add the R4 round-trip test. My script checks that `evaluate(desc)` equals `evaluate(JSON.parse(JSON.stringify(desc)))`, and it does.
- **What I decided myself:**
  - Which condition kinds to offer. Users presumably set this from a settings UI, so the set of kinds is the product's choice.
  - What to do with stored prefs from the function era. They contain nothing, because the function was dropped. So "preserve the old meaning" is impossible, and I'd treat missing as the default kind.

### (b) Feature flags: PMs target by plan and country; ask is "workspace has more than three admins"

**What the Principle tells me.**
- **Words I relied on:** "ask what kind of change it is… Or a new operation? An engineer must implement it in either design."
- **My classification:** plan and country are attribute-equality conditions. "Admins in the user's workspace > 3" needs two things the format almost certainly lacks:
  - a new data source (an aggregate over another entity, not a field on the user);
  - a numeric comparison (`>`), if the format only has equality or membership.

  That makes it a new operation, so an engineer implements a new condition kind, for example `{ kind: "workspaceAdminsAbove", n: number }`.
- **What happens after:** per the first tier ("A new parameter value? Its author can edit the data"), PMs can then change `3` to `5` without engineering.
- **What would change the answer:**
  - If the format already had a generic `{ attr, op: ">", value }` and `workspaceAdminCount` were already an attribute, this would be "a combination the format already permits", and the PM could write it.
  - If flags were named templates, even a new combination of existing conditions would need an engineer.

**Who decides?** The Principle says who carries out each kind of change. It doesn't say who classifies the request. I decided myself that engineering classifies it, because only engineering knows what the evaluator supports. And product decides whether this operation is worth adding permanently, since once it is stored in rules it must be kept "so you can rerun old decisions".

### (c) Stored JSON rules; the TS condition type gained a required field

**Compile time.** I checked with `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read3/p/c.ts`. I added a required `negate: boolean` and loaded `'[{"kind":"plan","plans":["pro"]}]'` via `JSON.parse(stored) as Condition[]`.
- `tsc` reported exactly one error: TS2741 on the object literal I wrote in source.
- The cast of stored data compiled cleanly.
- So the compiler flags your code and fixtures, never your stored data.

**Runtime.** `r.negate` is `undefined`, and the code branches on it as if it were `false`. Here that happens to be harmless. For a field like `minCount` it would silently change decisions.

**What the Principle tells me.**
- **Words I relied on:** "When you load old stored values, parse them and preserve their old meaning or reject them. Editing a type won't do that job."
- **What I'd check and change:**
  - Replace the cast with a parser that accepts both the old and new shapes.
  - Migrate old rules by filling `negate: false`. That is the value that reproduces their old meaning, not just any default.
  - Reject anything unrecognisable.
  - Run R4's round trip on old stored fixtures against the evaluator version that originally decided them.
- **What I decided myself:**
  - Migrate-on-read versus a one-off rewrite of the stored table.
  - Whether to keep a `version` field on each rule. R4 talks about "evaluator version", but it is never said where that version lives.

### (d) Build-tool config, static object or function of env; dashboard lists every repo's settings

**What the Principle tells me.**
- **Words I relied on:** "find everyone who uses it. If every caller only calls it, a function is fine. But someone may need to save, edit or explain it later."
- **Applying it:** the dashboard is exactly the "explain" user. It doesn't call the config to build anything; it wants to display it. For static-object configs the dashboard can just read them. For function configs it can't list settings without executing repo code, and even then only for some chosen environment.
- **What it implies:** the R1 check fails once the dashboard exists, so the R2 description would be preferred. Or, per R3, the dashboard should show recorded results, something like "for repo X, env `ci`, config file at commit abc, the resolved settings were …".

**What I decided myself.** The Principle assumes you own the config format. With a third-party build tool you don't, and you can't stop repos from using functions. My practical answer:
- the dashboard evaluates each config for a fixed set of named environments and records the results (R3 style);
- configs it can't explain are marked "dynamic";
- the team may ask repos to prefer static configs.

The section doesn't address mixed formats ("either a static object or a function") or code you don't control.

## 4. Where the section left me unsure

1. **Future users.** "Find everyone who uses it" and "someone may need to… later" pull in different directions. Is the rule about today's callers or predicted ones? If predicted, it isn't mechanical.
2. **R2 or R3?** "Or record the name of the exact code…" is offered as an alternative to saving a description, but nothing says when to pick it. Is it for when the decision must stay a function (an escape hatch), or just for auditing?
3. **"Evaluator version".** It appears only in the round-trip test. Where is the version stored: on each rule, on each decision log, globally? Does changing the evaluator require a new version every time?
4. **"Either design".** Which two designs? Function vs. description, or composable format vs. named templates? I think the point is "a new operation costs an engineer no matter what", but I had to infer it.
5. **"Its author" vs. "a rule's author".** Are these different roles, for example a PM who tweaks numbers vs. a power user who composes rules? The taxonomy hints at a permission model but doesn't name it.
6. **"Named templates".** The term is new and gets a single sentence, and it is unclear whether templates are recommended or warned against. They read as a cautionary middle ground (safe, but every new combination needs engineering).
7. **"Preserve their old meaning or reject them".** When is rejecting acceptable? For user prefs, rejecting means wiping someone's settings. Some guidance on choosing would help.
8. **"Make the same decision?"** Is the round-trip test meant to run on fresh data only, or also against a corpus of old stored rules? The latter is far more valuable and is what R6 implies, but R4 doesn't say so.

## 5. Clarity and voice

**Sentences I had to reread:**
- "If every caller only calls it, a function is fine." The double "call" (caller / calls) made me stop. "Only calls it" carries all the meaning, and I had to work out its contrast class (save, show, edit).
- "Or record the name of the exact code that made the decision, plus its parameters." I couldn't tell at first whether this was a second option or a step following the evaluator.
- "Then test the round trip: save it, load it, and apply the same recorded input with the same evaluator version." "It" is ambiguous here: the description, the decision, or the decision record?
- "If engineers write the combinations as named templates, another combination needs an engineer." I reread this twice to see that it is a contrast with the previous sentence, not a fourth case.
- "An engineer must implement it in either design."

**Terms used without explanation:** "evaluator version", "named templates", "the format" ("a combination the format already permits": the description format, I assume), "round trip" (fine for most TS readers), and "parameters" in R3 (the decision's inputs, or the code's configuration?).

**Person or documentation?** Mostly documentation with one personal line. "Lisp let me treat code as data" is the only moment that sounds like Liron. It is a good one, but it is dropped mid-paragraph and never pays off: there is no warmth, no anecdote, nothing about what he lost when he moved to JSON. The first paragraph is a run of short imperative sentences (8 to 10 in a row), which reads like a checklist, not a warm veteran talking. The second paragraph's question-and-answer rhythm ("A new parameter value? … A new operation?") is better and does sound spoken. "Editing a type won't do that job" is a strong, quotable closer.

**Enjoyable?** It is dense and useful. The taxonomy in paragraph 2 is the part I'd remember and reuse. My attention dropped in the middle of paragraph 1, from "Or record the name of the exact code…" through "Keep that code so you can rerun old decisions". It felt like a second principle squeezed into the first, and I lost track of which path I was on. It came back at the round-trip question, which is concrete. If you are tightening, the "Or record…" branch is the weakest part. Either give it its own sentence about when to use it, or move it into the debate.
