<!-- Fresh Opus whole-book standards audit at dad555e, 2026-11-03. -->

# Whole-book standards audit

Scope: `final/book/` (prologue, Ch1–27, Bonuses 1–3), checked against FIX-PLAN.md "Standards for every fix". The refuted list in CONSOLIDATED.md was left alone. I used scripts for headings, Principle and Verdict extraction, section closers, links, fences, catchphrases and pronouns, then read every Turn, Verdict and Debate Continues section. No files were edited. Paths below are relative to `book/`. Line numbers are from this copy.

**Verdict: nearly ready. The mechanics are clean. A short list of standard violations remains, mostly in Principles and links.**

Clean areas:
- **Catchphrases:** all 15 appear exactly once, each spoken by its owner, each as a line rather than a quotation.
- **Pronouns:** no slips.
- **Cast:** no speakers or characters outside the cast page.
- **Fiction:** no frame leaks.
- **Links:** none in dialogue, and at most one per paragraph.
- **Structure:** every chapter has a Principle, a Debate, a labelled Turn, and a Verdict or Debate Continues. Every Verdict has a `>` ruling. Numbering runs in sequence. Fences are balanced. There are no TODO or FIXME notes.

Where it still fails:
- Two Principles state the Turn's trap in advance.
- Two Principles don't open on a rule.
- One Verdict ruling is team-specific rather than transferable.
- Three narration sentences exist only to carry a link.

---

## Must fix

1. **Ch14 Principle spoils the Turn** (`03-patterns-and-design/01-error-handling.md:5`). The Principle says: "In an async function, returning an ordinary value fulfills its promise. Whoever awaits it no longer gets a rejection to act on." That is the Turn's discovery, which Guy makes at :212–216 ("The callback's promise fulfills with that object… The store doesn't inspect `ok`.").
   *Proposed:* **Liron Closure**: "Turn a failure into a value only after everyone who acts on the failure has acted. Catching it makes two decisions: what to report, and that the work finished normally. Before you return the error, name who was waiting for the failure and what they were going to undo."

2. **Ch17 Principle spoils the Turn** (`03-patterns-and-design/04-immutability.md:7`). It says: "Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees." The Turn discovers exactly this at :218–220 ("The getters are reading the new current quote. Freezing them doesn't stop that.").
   *Fix:* delete those two sentences. The Principle drops to about 105 words.

3. **Ch17 Verdict ruling isn't transferable** (`:348`). The ruling reads: "> Keep the price calculation as a value-returning function. Let the checkout owner publish the current price. Expose live access through a call; give the receipt stable values." That is this team's decision.
   *Proposed:* "> Give a holder that needs history a value that can't change, and a holder that needs the current state a call to its owner. Freezing a live view doesn't make it a record." Then a plain line: "This team keeps the price calculation value-returning, lets checkout own the current price, and hands the receipt a stored quote."

4. **Ch15 Principle doesn't open on a rule** (`03-patterns-and-design/02-branded-types.md:5–7`). Paragraph 1 is exposition ("Two values can have the same representation and different jobs…"). The first instruction only comes in paragraph 2, and its last sentence ("Those operations must preserve what the check established, or the brand can outlive the fact it claims") points at the spread trap the Turn finds at :176.
   *Proposed opening:* "When two values share a representation but not a job, give each job its own type, and convert where someone decides which job a number has."
   Keep "Some brands make a further promise: this value passed a check. Before relying on that promise, find every way code can make a value of that type." Drop the "outlive the fact" sentence.

5. **Ch21 Principle opens on a question** (`03-patterns-and-design/08-hof-patterns.md:5`): "When this job says failed, what do I tell the customer?"
   *Fix:* swap the order. "A wrapper is acceptable only if the operation still does what its caller agreed to. When this job says failed, I have to know what to tell the customer."

6. **Sentences that exist only to carry a link** (Standard 5):
   - `04-the-real-world/03-testing-typed-code.md:289`: "Node's [type stripping](…) removes type syntax, leaving the call to execute." It restates Eden's line at :287 ("The comment objects to the call's type. It doesn't cancel the call."). *Cut it.*
   - `05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md:157`: "[Zod's guide](…) lists `ZodDefault` among the types whose input and output differ." It only supports Dafna's line at :155. *Cut it, or give the fact to Dafna without the link:* "…Zod's default is to describe what comes out. `ZodDefault` is one of the types where input and output differ."
   - `02-advanced-typescript/07-declaration-merging.md:66`: "The [module augmentation rules](…) resolve the name like an import." Oded has just said this at :64. *Cut it, or fold it into Oded's line without the link.*

---

## Should fix

**Principles: mild spoilers.** Each of these states the Turn's distinction ahead of time.
- **Ch11** `:7`: "Requiring a complete object and restricting the steps used to construct it are different jobs." That is Dafna's Turn realisation at :329. Cut it.
- **Ch13** `:7`: "If you can't guarantee it for every value covered by the type, represent the uncertainty and decide what the caller should do…" This prescribes the Turn's fix (the optional `frame?` plus a guard). Cut the sentence.
- **Ch8** `:7`: "You needn't carry all three." This anticipates the Turn's "Only the keys come across" (:369). Cut it.
- **Bonus 1** `:7`: "Code without them can still do the wrong thing." This pre-announces the cast-free `Number` coercion. The Principle is also a checklist of about seven instructions. Trim it to the rule and the "run that command" sentence.
- **Ch24** `:5` ("…under its settings") and **Ch16** `:5` ("A successful parse doesn't by itself tell every caller…") lean toward their Turns. This is a minor point.

**Principles: rule not in the first sentence** (lead-in, then the rule):
- **Ch10** `:5`: the rule is sentence 3.
- **Bonus 3** `:5`: the rule is sentence 3, after an aphorism.

Both are acceptable lead-ins, but strictly they don't open on the rule.

**Principles: length.**
- **Ch1**: 186 prose words, 343 including Daniel's two demo fences. Eli's rule itself is 44 words.
- **Ch7**: 162 prose words.

Move Daniel's Ch1 demos to the start of the Debate, or cut them by half.

**Principles: scene inside the Principle section.**
- **Ch14** `:7–13`: the cold open sits under `## The Principle`.
- **Ch16** `:7–88`: about 390 words of scene and four fences sit under `## The Principle`.

Move both below `## The Debate`. All other chapters put the scene there.

**Principles: repeated shapes** (Codex's caution):
- Eli uses the same "Use a X when…" template in Ch6, Ch7 (consecutive chapters) and Ch11.
- Seven Principles open on, or turn on, "Before…": Ch10 s3, Ch12, Ch14 s4, Ch15 ¶2, Ch17, Ch18, Bonus 1.
- Ch10–13 all sign off with "start with…" or "I want to see…". Ch8–13 are all 113–124 words in two paragraphs.
- Daniel states the same rule four times: "the existing caller's contract must survive the change". See Ch10 `:5`, Ch24 `:5`, Ch27 `:5` ("whether callers still have the contract we agreed to preserve") and Bonus 3.
  - Sharpen Ch27 toward measurement by dropping its last two sentences.
  - Sharpen Ch24 toward the compiler-program scope, which is Daniel's specialty.
- Gilad's Ch13 rule ("show me what supplies it when the program runs") and his Ch25 rule ("Check a release where it will run") are near-duplicates.
- Liron's Ch14 and Ch17 both ask who still relies on what you're about to change.

**Verdicts:**
- **Near-duplicate rulings:**
  - Ch19: "A refactor preserves the caller's policy; changing that policy needs its own agreement."
  - Ch24: "Preserve the calls a conversion claims to support…"
  - Ch27: "…Giving one up is a contract change…"
  - Bonus 3: "A fix that changes the contract is a contract decision…"
  - Ch10 is close too.

  Vary the wording, or let a later one call back in-world ("the slugger argument").
- **Repeated cadence:** "alone does not settle" appears in Ch7 `:601`, Ch11 `:438` and Ch22 `:337`.
- **Ch20 ruling misses the Turn** (`:335`). The Turn's finding is that creating the function should prove the promotion valid; the ruling doesn't carry it. *Proposed:* "…A shared factory earns its entry point when it owns preparation callers shouldn't repeat, and when creating the function should prove its arguments valid."

**The Debate Continues:**
- **Ch15 `:309–321` resolves on the page.** Eden answers Noam's shared-link case, and Noam never replies. Either relabel it as a Verdict, or keep the disagreement live after Eden's "we'll revisit the class": **Noam**: "Then every restore path repeats the conversion. I'd still rather keep the accepted object than rebuild it at each caller."
- **Ch9 `:321–327` is thin.** Oded decided in the Turn, and only two lines remain. Linoy's "I'd still make that trade" keeps it barely live.
- Ch5 and Ch11 are genuinely live.

**Turns:**
- **Ch4 `:419–435`:** Sahar concedes ("For that team, on that night, I'd leave it") on Guy's argument, with nothing shown on the page. *Suggestion:* Guy shows something, such as an incident hotfix where on-call replaced `(typeof Status)[keyof typeof Status]` with `string`, and Sahar reads the diff before conceding.
- **Ch26:** the Turn is a discovery (Eden: "We haven't told the compiler where we put it."). That is acceptable, but no one's stated position flips.

**Closers.** These are filing-instruction endings. They are spoken, so they pass FIX-PLAN #3 literally, but they fit the pattern you asked me to flag.
- **Ch11 `02-advanced-typescript/05-advanced-generics.md:199`:** "It goes in the quickstart. Both orders, including your annotation…" *Cut Guy's line* so the section ends on Oded's "People will write my annotation."
- **Ch21 `:337`:** "I'll put that in a comment next to `sendShipped`…" *Proposed:* **Oded**: "So 'unconfirmed' has an owner. That's more than 'failed' ever had."
- **Ch26 `:269`:** "Add a runtime assertion for the card text too." *End on Noam's line at :267* ("These tests believe the annotation.") and move Guy's request into the next section.
- **Ch15 `:321`:** "I'll keep those tests with the draft conversion." This one is mild.

**Closers: sections that end on reference code** rather than a line or result:
- Ch3 Verdict (`:430–466`)
- Ch4 Verdict (`:452–499`)
- Ch6 Verdict (`:342–348`, the "Danger" `loadState`)
- Ch26 "It shipped" (`:341`)

Add a closing spoken line, or move the reference block above the team's lines.

**Links:**
- **Ch15 `:224`:** "TypeScript's [object-type documentation] notes that `readonly` does not affect compatibility…" This is a docs-citation sentence in narrator-manual voice. Give the fact to Noam or Daniel without the link, or keep it as the paragraph's one link.

**Fiction** (page pointers, minor):
- Ch8 `:146`, fence comment: "// Both settings stay enabled for the examples below." Use "// The project keeps both settings enabled."
- Ch27 `:15`: "in `src/probe.ts` below"
- Ch27 `:77`: "in the banner below"
- Bonus 2 `:312`: "All three calls below"

Drop "below" in each.

**Narrator as manual:** see the table under Standard 7.

**Structure:**
- **Section naming:** Ch20, 21 and 23 use `## Additional Take`. Ch3 uses `## Additional Takes` with one take. Pick one rule.
- **Subsection title style:** quoted in Acts I–II, Ch16 and Ch24–27; unquoted in Ch14, 15, 17, 18, 20, 21 and 22. Bonus 2 mixes both inside one chapter: :9 and :120 are unquoted, :207 is quoted.
- **Debate Continues openings:** Ch5, 9, 11 and 15 open on an unquoted ruling paragraph, while every Verdict uses `>`. Decide whether that is intentional.
- **How-to-read** (`00-prologue/01-how-to-read.md:23–33`) describes Principle, Debate, Turn and Verdict, but never mentions "The Debate Continues" (used in 4 chapters) or "Additional Takes". Add one line each.
- **Cast-at-a-glance tables** (`02-meet-the-cast.md:273, 283`) have an empty first column (`|   |`). Drop it before print.
- **README link:** `01-how-to-read.md:69` links `../../README.md#checking-the-examples`. It resolves in the repo (README `## Checking the Examples`), but the `final/` copy has no README.

---

## 1. Principle table

Words are prose outside fences; the total in brackets includes code. Flag legend: **S** = spoiler, **R** = rule not first, **L** = long, **Sc** = scene inside the section, **Sh** = shape repeat.

| Ch | Speaker | Words | First sentence (the rule) | Flags |
|---|---|---|---|---|
| 1 | Eli (+Daniel demo) | 186 [343] | "When you don't know a value's type, keep it `unknown` until you have checked enough to use it." (after a stage line) | L |
| 2 | Eli | 121 [158] | "Write an assertion only where you can say what you know that the compiler can't check, and how you know it." | — |
| 3 | Eli (+Daniel) | 97 [226] | "Choose the declaration that supports what other code needs to do with it." | — |
| 4 | Eli | 127 [184] | "For a fixed set of values, start with a type." (after a stage line) | — |
| 5 | Daniel | 37 | "For external input, prefer a function that builds a typed value from the fields it has checked." | — |
| 6 | Eli | 116 [151] | "Use a type parameter when a caller needs a relationship between types in the signature." | Sh |
| 7 | Eli | 162 [224] | "Use a conditional type when the required type relationship depends on whether one type is assignable to another." | L, Sh |
| 8 | Daniel | 113 | "Derive one type from another when the parts you carry across are meant to change together." | S (mild) |
| 9 | Gilad | 114 | "A typed event name should give me two things: a check… and a route to the code that can produce it." | — |
| 10 | Daniel | 120 | "When you extract a function's type, you inspect its declaration." | R, Sh |
| 11 | Eli | 124 | "Use a state parameter to carry evidence that later operations require." | S, Sh |
| 12 | Daniel | 115 | "Before passing an object through a broader type, ask what that reference permits its holder to do." | Sh |
| 13 | Gilad | 115 | "If a declaration promises an operation, show me what supplies it when the program runs." | S, Sh |
| 14 | Liron (+scene) | 63 [141] | "When you catch a failure and return an error value, you make two decisions…" | **S (must)**, R, Sc |
| 15 | Eli | 98 | "Two values can have the same representation and different jobs." | **R (must)**, S (mild) |
| 16 | Gilad (+scene) | 34 [425] | "At a boundary, choose which input to reject, which to preserve and which to translate." | Sc, S (mild) |
| 17 | Liron | 124 | "Before you change an object, ask what each holder expects to keep." | **S (must)**, Sh |
| 18 | Eli | 127 | "Before replacing a call with a saved answer, establish that the caller gets the same answer and that no required work disappears." | Sh |
| 19 | Sahar | 55 | "Choose the simplest expression of the behavior the caller needs, and check that behavior before calling a rewrite a refactor." | — |
| 20 | Daniel | 54 | "Judge a staged API by what each call establishes for its caller." | — |
| 21 | Gilad | 81 | "When this job says failed, what do I tell the customer?" | **R (must)** |
| 22 | Liron | 116 | "If you promise to keep a policy, save enough to make its decision again." (recipe parable) | — |
| 23 | Eli | 101 | "Choose the chaining operation by what the next step returns, then check the shape the caller receives." | — |
| 24 | Daniel | 84 | "An unchanged caller must still work after a conversion that claims to preserve its contract." | Sh (dup), S (mild) |
| 25 | Gilad | 48 | "Check a release where it will run: the program we ship, from the place it ships." | — |
| 26 | Sahar | 59 | "A test must fail when code breaks a promise to its callers." | — |
| 27 | Daniel | 86 | "If a type change is supposed to make checking cheaper, time the same workload with the same compiler and options." | Sh (dup) |
| B1 | Eli | 121 | "Before asking for code, put the decisions it must respect in its signature and in examples of success and rejection." | S (mild), checklist |
| B2 | Liron | 37 | "Treat a valid tool call as a proposal until its executor has established permission to act." | — |
| B3 | Daniel | 43 | "A patch summary is its author's opinion of what changed." | R |

**Principles grouped by expert:**
- **Eli (11):** Ch1, 2, 3, 4, 6, 7, 11, 15, 18, 23, B1. "Use a … when" appears three times (Ch6/7/11). "Before…" appears in Ch18 and B1.
- **Daniel (8):** Ch5, 8, 10, 12, 20, 24, 27, B3. Ch10, 24, 27 and B3 all state the "preserve the existing callers' contract" rule. Ch10 and 12 share the "compare what callers can do through each reference" shape.
- **Gilad (5):** Ch9, 13, 16, 21, 25. Ch13 and 25 are near-duplicates ("what runs, not what's declared or checked").
- **Liron (4):** Ch14, 17, 22, B2. Only Ch22 has a parable; Ch17's river image now lives in the Debate at :68.
- **Sahar (2):** Ch19, 26. Distinct.

## 2. Verdict table

All 26 Verdicts lead with `>`. None is missing.

| Ch | Ruling (quoted, trimmed) | Fits Turn | Flag |
|---|---|---|---|
| 1 | Default to `unknown`… Justify an `any` by describing the unchecked assumption… Track temporary gaps; review deliberate compromises | Yes | — |
| 2 | Justify an assertion by the evidence the compiler cannot check, and arrange to find out when that evidence stops holding… | Yes | — |
| 3 | Use `type` for unions…; use an interface for deliberate extension points or declaration-time checks on composed objects… | Yes | ends on code |
| 4 | For new code, default to a string literal union… keep an enum when its reverse map or the team's ability to maintain it earns it… | Yes | 3 sentences, long; ends on code |
| 5 | *(DC)* Parse external input where it enters… Choose how failure travels from what the callers need | Live | no `>` (DC style) |
| 6 | In a function signature, use a generic to express a relationship between types… | Yes | ends on code |
| 7 | Choose the relationship the callers need before choosing how to spell it… For this content pipeline, normalize tags… | Yes | — |
| 8 | Derive the parts whose owners intend them to change together… | Yes | — |
| 9 | *(DC)* A type can check a naming rule without requiring a runtime name-building helper… | Thin | see Should fix |
| 10 | Derive a wrapper over a client surface whose calls and behavior it can preserve… | Yes | dup-family |
| 11 | *(DC)* Use a construction protocol for the transitions its callers need controlled… | Live | "alone does not settle" |
| 12 | Give each consumer a contract for the operations it needs. For these writers, use function-property signatures… | Yes | — |
| 13 | Declaration visibility does not establish runtime initialization… | Yes | — |
| 14 | Convert a failure into a returned value after the operations that depend on its rejection have acted… | Yes | — |
| 15 | *(DC)* A scalar brand can distinguish roles without promising a relationship between fields… | Resolved on page | Should fix |
| 16 | Accepting input, retaining it and permitting an action are separate decisions… | Yes | — |
| 17 | Keep the price calculation as a value-returning function. Let the checkout owner publish… | Yes | **Must: not transferable** |
| 18 | Reuse only the part of a calculation whose inputs you have named… | Yes | — |
| 19 | A refactor preserves the caller's policy; changing that policy needs its own agreement… | Yes | dup with 24/27/B3 |
| 20 | An adapter that only holds an argument can stay with its caller. A shared factory earns its entry point when its module owns preparation… | Partly (misses validation-at-creation) | Should fix |
| 21 | Retry only under a contract that makes repeating the operation safe… | Yes | — |
| 22 | Choose the authoring power the policy's owners need, while retaining its meaning and inputs for replay. Correct decisions alone do not settle… | Yes | cadence |
| 23 | A callable `then` makes an object participate in the promise protocol. Give a different chaining operation its own name. | Yes | — |
| 24 | Preserve the calls a conversion claims to support. If those calls must change, migrate and verify their callers… | Yes | dup |
| 25 | Use public package entry points and test the rebuilt release in its installed layout… | Yes | — |
| 26 | Verify that each check selects the tests you intend and fails on the regression they guard… | Yes | — |
| 27 | Try a cheaper formulation that preserves the required calls before giving up checks. Giving one up is a contract change… | Yes | dup |
| B1 | When two implementations pass and disagree, the checks haven't decided the behavior. The owner decides… | Yes | — |
| B2 | A description constrains the proposal. The executor must establish permission before acting… | Yes | — |
| B3 | Before accepting a repair that makes a type error disappear, find what the error was protecting. A fix that changes the contract is a contract decision… | Yes | dup |

## 3. Turn table

Every chapter has a labelled `## The Turn`, including Ch10 at :219.

| Ch | Who changes, and what on the page causes it | OK? |
|---|---|---|
| 1 | Noam ("In this example, yes"), on his own overloads | Yes |
| 2 | Noam ("The factory hid the dependency"), on the missing-email run | Yes |
| 3 | Liron ("data alone isn't a reason to choose the alias"), on the `never` versus `extends` errors | Yes |
| 4 | Sahar ("For that team… I'd leave it"), on argument only | **No demonstration** |
| 5 | Guy (result for outside callers), on the same bad input through both | Yes |
| 6 | Noam ("This generic doesn't validate anything"), on the typo config | Yes |
| 7 | Linoy ("It wants an array either way"), on the next caller | Yes |
| 8 | Guy (some lists stay together), on `FieldErrors` and `Labels` | Yes |
| 9 | Oded (keeps the typed signature, drops constants), on the typo rejection | Yes |
| 10 | Idan and Eden, on `bad` being accepted | Yes |
| 11 | Guy (keeps the runtime guard), on the `repoint` call | Yes |
| 12 | Noam ("My repair rejects a caller we still support"), on the old dashboard error | Yes |
| 13 | Oded (optional method and guard), on the type-only import TypeError | Yes |
| 14 | Dafna ("roll back before the page gets it"), on the store run | Yes |
| 15 | Noam ("can't use this type as my reason…"), on the spread | Yes |
| 16 | Oded ("I gave it the answer for don't refund it at all"), on the change notice | Yes |
| 17 | Guy (from frozen getters to a live-reader interface), on the receipt mistake | Yes |
| 18 | Dafna ("I didn't check what those methods read"), on the TZ table | Yes |
| 19 | Dafna (proposes the fill rule), on the replay table | Yes |
| 20 | Linoy ("Setup has work now"), on the empty invalid run | Yes |
| 21 | Oded (stop retrying timeouts), on the acceptance table | Yes |
| 22 | Dafna ("the replay is" the catch), on Gil's eight orders | Yes |
| 23 | Linoy (renames to `andThen`), on the pending job | Yes |
| 24 | Noam ("It catches the files we haven't excused"), on the sitemap run | Yes |
| 25 | Linoy ("For this quote? No."), on the image run | Yes |
| 26 | Eden (a realisation), on `--listFilesOnly` | Weak but OK |
| 27 | Linoy ("My guess was too narrow"), on the profile | Yes |
| B1 | Dima ("I read that as a spelling of validates"), on zero cents | Yes |
| B2 | Dafna ("The caller's."), on Bob's order | Yes |
| B3 | Oded and Eden ("can't keep calling that fallback an internal change"), on the typo experiment | Yes |

## 4. Closers

I checked 269 section closers. None ends on a "leaves/keeps/beside" stage direction or an "in the review" line. The 14 narration uses of "beside" (for example Ch8:75, :159; Ch9:155; Ch10:168, :293) are all mid-scene.

Flagged:

| File:line | Text | Issue |
|---|---|---|
| Ch11 `05-advanced-generics.md:199` | "It goes in the quickstart. Both orders…" | filing |
| Ch21 `08-hof-patterns.md:337` | "I'll put that in a comment next to `sendShipped`…" | filing |
| Ch26 `03-testing-typed-code.md:269` | "Add a runtime assertion for the card text too." | filing |
| Ch15 `02-branded-types.md:321` | "…I'll keep those tests with the draft conversion." | filing (mild) |
| Ch3 :466, Ch4 :499, Ch6 :348 (Verdicts) | reference fences | ends on code |
| Ch26 :341 ("It shipped") | type-test fence | ends on code |
| Ch22 `09-config-to-function.md:125` | "Dafna adds the saved-and-replayed order to the test. This time, both decisions say hold." | stage direction, saved by the result; OK |

Link-only sentences are covered in Must fix 6 (Ch26:289, B2:157, Ch13:66) and Should fix (Ch15:224).

## 5. Fiction

The grep found no "the book", "this book", "fictional", "snapshots" or chapter-number reference outside the prologue and cast page. Every "reader" and "snapshot" hit is an in-world code term (Ch12 `ResultReader`, Ch17 `snapshot()`). The earlier leaks (Ch1:196, Ch7:434, Ch14:389, Ch26/27 "fictional shop", B1:121, B2:70) are gone. Ch7's `Unwrap` pointer (:605) is in-world.

Remaining page pointers (minor): Ch8:146 (fence comment), Ch27:15, Ch27:77, B2:312.

The prologue's "Chapter 1" (how-to-read :17) and the cast page's "this book" (:43, :207) are excepted.

## 6. Links

None are in dialogue, and no paragraph has more than one.

| File:line | Link | Notes |
|---|---|---|
| `00-prologue/01-how-to-read.md:69` | README#checking-the-examples | prologue; resolves in the repo |
| `01-the-type-system/03-interface-vs-type.md:84` | Express core declarations | stands |
| `02-advanced-typescript/01-conditional-types.md:229` | TS issue #33912 | stands |
| `02-advanced-typescript/07-declaration-merging.md:66` | module augmentation rules | **link-only (Must)** |
| `03-patterns-and-design/02-branded-types.md:224` | object-type docs | docs-citation (Should) |
| `04-the-real-world/03-testing-typed-code.md:289` | Node type stripping | **link-only (Must)** |
| `04-the-real-world/04-performance-vs-safety.md:278` | typescript-go `mapTypeEx` | stands |
| `05-bonus-ai-and-typescript/01-prompting-for-typescript.md:103` | merging interfaces | stands |
| `05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md:157` | Zod JSON-schema guide | **link-only (Must)** |
| `05-bonus-ai-and-typescript/03-reviewing-ai-code.md:392` | isolatedDeclarations | stands (refuted item, not touched) |

## 7. Narrator as manual: worst 15

| # | File:line | Recites | Fix |
|---|---|---|---|
| 1 | Ch27 `04-performance-vs-safety.md:222` | `probe.json` with `files`/`include`, `-p probe.json`, `--noEmit false`, `node dist/probe.js` | a `probe.json` fence; Linoy speaks the printed result |
| 2 | Ch25 `02-monorepo-type-sharing.md:274` | inline `tsconfig.dev.json` JSON | a captioned fence |
| 3 | Ch25 :17 | `"type": "module"` everywhere, link layout | a fence comment, or Dima's line |
| 4 | Ch27 :247 | probe removal, controls list, "same bytes again" | one sentence: "Every allowed call works, every mistake still fails, and the emit is byte-identical." |
| 5 | Ch26 :231/:237/:250 | TS2578/TS2344, "removes `: any`… restores Row", Node `-e` | Noam's spoken result plus fence comments |
| 6 | Ch26 :372–376 | `--listFilesOnly` output and the `include` array | Eden: "The file list has the runtime test and not the type test. Our include only names src and test." |
| 7 | Ch26 :398–404 | widen, TS2578, restore, `: any`, TS2344, `node --test` | fence with `// →` comments |
| 8 | Ch24 `01-migration-strategies.md:199` | exception list, `// @ts-nocheck`, the `@param` JSDoc | show it in a fence |
| 9 | Ch24 :238 | restore `export default`, "route stays checked… sitemap keeps the opt-out" | fold into Chen's line at :236 |
| 10 | Ch25 :320 and :326 | leaving the branch, restoring `.js`/`default`, removing `allowImportingTsExtensions`, cleaning dirs | "They abandon the experiment, clean every output and build file, and rebuild. The fresh image prints `release-42 USD 15.00`." |
| 11 | B2 `02-type-safe-agent-patterns.md:201` | full JSON tool-call literal | a fence |
| 12 | B2 :180, :269 | "With `description.ts` removed…", "…stay unchanged" | cut the bookkeeping |
| 13 | B3 `03-reviewing-ai-code.md:58` | "Node 22.23.4 runs these… `"type": "module"`" | put it in `package.json`, or cut |
| 14 | B3 :376 | full TS2820 and TS2322 messages | Noam speaks the "Did you mean" line; TS2322 goes in a fence comment |
| 15 | Ch27 :77 | TS2345/TS2556 and why the banner was expanded | a fence comment |

Also noted: B1:131 ("Dima removes `src/probe.ts`; it has done its job"), Ch27:270 (`legend.json` trace walk), Ch26:281 (the `--test-reporter=spec` line).

## 8. Cast canon

| Owner | Catchphrase | Count | Where |
|---|---|---|---|
| Eli | "Let us return to first principles." | 1 | Ch11 :387 |
| Daniel | "The compiler disagrees." | 1 | Ch8 :241 |
| Gilad | "Show me the stack trace." | 1 | Ch13 :109 |
| Liron | "Complexity is a choice, not a necessity." | 1 | Ch17 :246 |
| Sahar | "Simple made better." | 1 | Ch23 :296 |
| Noam | "Over my dead type definition." | 1 | Ch2 :206 |
| Oded | "We can fix it in the next sprint." | 1 | Ch1 :102 |
| Gil | "What does the data say?" | 1 | Ch27 :112 |
| Eden | "I've seen this fail at scale." | 1 | Ch24 :268 |
| Linoy | "There's an RFC for that." | 1 | Ch7 :227 |
| Chen | "But have you considered..." | 1 | Ch3 :119 |
| Dafna | "That's just a map." | 1 | Ch1 :463 |
| Guy | "Where's the interface?" | 1 | Ch8 :71 |
| Dima | "Both have a point here." | 1 | Ch6 :61 |
| Idan | "Prove it by producing it." | 1 | Ch5 :231 |

- **Catchphrases:** each is spoken by its owner and lands as a line. Ch7:288 mentions "stack trace", but Noam says it and it isn't the catchphrase.
- **Pronouns:** the bios make Idan, Dafna and Linoy she, and everyone else he, Noam included (bio :97–101; Daniel's bio :33 now reads "until someone has called the function"). A name-to-pronoun scan across all chapters found no mismatches. The seven hits were all false positives where "her" referred to another person (for example Ch8:11, Ch18:186, B2:74/253).
- **Uncast characters:** none. The 30 speaker labels all belong to the cast. Alice and Bob (Bonus 2) are customers, and "the lead" (Ch18:375) is unnamed.

## 9. Structure

- **Titles:** Ch1–27 and Bonuses 1–3 are numbered and titled in sequence.
- **Required headings:** every file has `## The Principle`, `## The Debate`, `## The Turn`, and `## The Verdict` or `## The Debate Continues` (Ch5, 9, 11, 15).
- **Additional Takes** are absent in Ch11, 22, 24–27 and B3, which is fine. The singular/plural naming is inconsistent (see Should fix).
- **Subsection titles:** quoting style is inconsistent (Act III unquoted, B2 mixed).
- **Fences:** balanced in all files. All are language-tagged (typescript, javascript, json, text, diff).
- **Stray notes:** no TODO, FIXME, XXX or HTML comments. The "TODO" in Ch1 :104 and :477 is dialogue.
- **Internal links:** the README anchor is the only one, and it is valid in the repo.
- **Cast page:** the empty first table column should go.
- **How-to-read:** doesn't introduce "The Debate Continues" or "Additional Takes".

Helper scripts are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/tools/` (closers.py, links.py, narr.py, pron.py). The full closer listing is `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/closers.txt`.
