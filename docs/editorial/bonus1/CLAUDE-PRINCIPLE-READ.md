Independent isolated Principle-only reader, Bonus 1 draft 1 (dde33d6), 2026-11-01. Saw only the Principle; Codex's four settled cases; fixtures on TS 7.0.2 / Node 22. Verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1r1/principle.md`. The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1r1/principle-fixtures/`. I compiled them with TS 7.0.2 using `--strict --exactOptionalPropertyTypes --noEmit --types "" --lib es2022` (plus `--module nodenext`, and a `shim.d.ts` that declares `console`, because es2022 has no console). I ran them with Node 22 strip-types.

### Case 1: both pass, but they disagree on "3". Rating: **Clear**
- **Decision:** I would not accept either one yet. As owner I decide whether the string "3" is a valid quantity. Then I add that example to the accept or reject list and run both candidates again. Only one can pass after that.
- **Sentences I relied on:**
  - "If two implementations pass but disagree on behavior you care about, you still owe the implementer a decision."
  - Before commissioning: "Give the implementer … examples of what must work and what must be rejected."
- **Fixture (`c1/q.ts`):** both candidates type-check. Both accept 3 and reject -1. `parseA("3")` returns ok:true and `parseB("3")` returns ok:false. The signature `(input: unknown) => Result` cannot tell them apart. The disagreement is real and the existing checks miss it.
- **Small snag:** the "owe a decision" sentence sits in the "Then … what comes back" paragraph, so it reads as an after-the-fact duty. Doing it before commissioning only follows from paragraph 1's "examples". The two fit together, but the rule never says "settle it in the examples up front."

### Case 2: `user!.email` vs a predicate that returns `true`. Rating: **Inferred (the `!` half is Clear; the predicate half is Inferred)**
- **Decision:** neither candidate shows the user is present. I require two things:
  1. A real runtime check. Either `if (r.user === undefined) return/throw <the agreed rejection>`, or an `asserts` function whose body actually checks.
  2. A rejection example for `{ user: undefined }` that checks *which* rejection happens. "It throws" is not enough.
- **Sentences I relied on:**
  - "An assertion can't establish a fact about incoming data" covers `!`.
  - "the absence of assertions can't establish a correct implementation" covers the predicate version, which contains no assertion syntax.
  - "The checks enforce what you've expressed in them" explains why CI is green.
  - Paragraph 1's "what must be rejected" means the missing rejection example is the owner's gap.
- **Fixtures:**
  - `c2/base.ts`: without either trick, `r.user.email` gives TS18048 "'r.user' is possibly 'undefined'".
  - `c2/u.ts`: both tricks compile cleanly. Called with `{ user: undefined }`, *both* crash with `TypeError: Cannot read properties of undefined (reading 'email')`. The predicate version never reaches its own `throw new Error("missing")`, because `hasUser` lies.
  - `c2/asserts.ts`: an `asserts r is …` function with a real `if … throw` compiles and rejects properly ("missing user").
  - `c2/asserts.ts` also shows a bare "does it throw?" test *passes* for the `!` candidate. If the team's rejection test is only `toThrow()`, green CI is a false positive. The rule doesn't warn about that.
- **Why the predicate half is only Inferred:** I had to decide that a lying type predicate counts as an "assertion", or that it falls under the second sentence. The text never mentions predicates.

### Case 3: cheap task with an existing signature and tests. Rating: **Clear**
- **Decision:** no rewrite and no new schema. I hand over the existing public signature as the callable contract and the existing zero/negative/locale tests as the examples. I add the project configuration and the command that runs them. I still state which files the implementer may change (presumably the formatter's implementation file only) and what must stay true (the public signature).
- **Sentences I relied on:** "Reuse those things when you already have them." Paragraph 1's list tells me what "those things" are.
- **No fixture needed.** I made no compiler claim.

### Case 4: "Only the generated directory." Rating: **"No" is Clear; what to do is Inferred**
- **Decision:** I cannot make that promise. The project's settings apply to every file the program pulls in, including the forty imported source files.
- **What to do instead.** The rule doesn't say, so this is my inference from "agree on … which files it may change". I would choose one option and make it explicit before handing the work over:
  - (a) widen the allowed files to include the forty and accept that scope;
  - (b) don't enable the flag in this project;
  - (c) put a real boundary in place, such as a separate referenced project or declaration outputs. I did not test this option.
- **Sentence I relied on:** "The configuration applies to the program, including source files brought in by imports; it doesn't know who wrote each file."
- **Fixture (`c4/`):**
  - `tsconfig.json` includes only `generated/*.ts` and enables `noUncheckedIndexedAccess`.
  - `generated/client.ts` imports `src/lookup.ts`.
  - With the flag on: `src/lookup.ts(1,71): error TS18048: 'x' is possibly 'undefined'`.
  - `--listFilesOnly` lists `src/lookup.ts` as part of the program.
  - With the flag off: exit 0.
  - I also tried `"exclude": ["src"]`. The same error still appears, because `exclude` doesn't stop files that are imported. The obvious "just exclude src" escape fails, which supports the rule's claim.

### 1. Is the rule clear and testable?
Mostly yes. Almost every sentence becomes a checklist item a reviewer can tick: contract, accept/reject examples, configuration and command, allowed files, decide when candidates disagree, reuse what exists.

- **Strongest sentence:** "If two implementations pass but disagree on behavior you care about, you still owe the implementer a decision." It is concrete and testable, and case 1 showed it is true.
- **Weakest sentence:** "An assertion can't establish a fact about incoming data." "Assertion" has at least three meanings in TypeScript:
  - type assertions (`as`, `!`);
  - `asserts` functions;
  - test assertions.

  Read as `asserts` functions, the sentence is false: my `assertUser` with a real check does establish the fact at runtime. The next sentence reuses "assertions" and could mean test assertions, which would make it a different claim. A reader can't tell which meaning each sentence uses. "Incoming data" is also unclear: is a function parameter incoming data, or only network/JSON input? Case 2 is a parameter.
- **Other undefined or vague terms:**
  - "callable contract": a type signature? A signature plus documentation?
  - "what it must keep true": invariants? Public behaviour?
  - "project configuration and command": presumably the tsconfig plus `tsc -p …`/test command. Readers will guess correctly, but it isn't stated.
  - "behavior you care about": fine, though it leaves the "don't care" case open on purpose.
- **Placement:** the configuration sentence is the only technical mechanism in paragraph 1. It feels bolted onto process advice. It is needed (case 4 depends on it), but it isn't tied to "which files it may change", and that link is the point.
- **Not covered:** what to do when a setting leaks into imported files.

### 2. Does it read like a person speaking?
Partly.
- **Paragraph 2 works.** "You still owe the implementer a decision" sounds like a mentor talking. The closing pair "The checks enforce what you've expressed in them. Someone still has to own what you meant." is the best moment: short, memorable, and quotable.
- **Paragraph 1 reads like a policy document.** It is a run of noun lists ("a callable contract, examples of …, and the project configuration and command …") with no voice, joke or image. That is where I lost interest.
- "It doesn't know who wrote each file" is a nice humanising touch, but slightly off-target. The issue is which files are in the program, not who wrote them. Here it happens to match generated vs hand-written code.
- Nothing here is fun yet. It is earnest and sound.

### 3. Did any fixture contradict a claim?
No claim was contradicted.
- Case 1 confirmed the disagreement scenario.
- Case 4 confirmed the configuration/imports claim, and `exclude` doesn't help either.
- The only tension is wording, not behaviour: an `asserts` function with a real check *does* establish the fact (`c2/asserts.ts`). So "An assertion can't establish a fact" is only true if "assertion" means `as`/`!`, or a predicate/assertion signature whose body doesn't check.
- Case 2 also showed something the rule doesn't mention: a loose rejection test like "throws anything" passes the broken `!` candidate. "The checks enforce what you've expressed" covers this in spirit, but a reader won't get there unaided.
