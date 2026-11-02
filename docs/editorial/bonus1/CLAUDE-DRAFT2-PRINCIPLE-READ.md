Independent isolated Principle-only reader, Bonus 1 draft 2 (e73fbc3), 2026-11-01. Saw only the Principle; Codex's four settled cases; fixtures on TS 7.0.2 / Node 22. Verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1r2/principle.md`. The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1r2/principle-fixtures/` (c1, c2, c4). I used TypeScript 7.0.2 with strict, exactOptionalPropertyTypes, `types: []` and lib es2022, and ran the output on Node 22. Two setup notes: `lib: es2022` has no `console`, so I added a one-line ambient `console.d.ts`. I also had to force `out/` to CommonJS. Neither affects the findings.

### (1) Both answers pass, but they disagree on "3"
**Decision:** Accept neither yet. The owner decides whether the string "3" is a valid quantity and adds that as an example. If it's valid, it's a success example. If not, it's a rejection example. The input type may also need to say it (`string` vs `number`). Then the implementation goes back, and only an answer that passes the new example is accepted.
**Fixture (c1):** parseA (uses `Number(input)`) and parseB (rejects non-numbers) both compile with the same signature. Both accept 3 and reject -1. A accepts "3" and B rejects it. Output: `A ... '3' -> true`, `B ... '3' -> false`. Confirmed.
**Relied on:** "If two implementations pass but disagree on behavior you need, decide and put that difference in the examples before handing the work back." Also "put the behavior you want in the signature and in examples of success and rejection."
**Rating: Clear** for accepting. **Inferred** for commissioning. The rule assumes you only find the gap after two answers exist. It doesn't say to look for gaps like this one before you commission. "Handing the work back" is also ambiguous: back from owner to implementer, or from implementer to owner? I read it as owner to implementer for another round. I had to stop and work that out.

### (2) `user!.email` and a predicate that just returns `true`
**Decision:** Neither proves the user is present. Reject both. I'd require an actual runtime check (`if (user === undefined) …reject…`). I'd also require the rejection example to state *how* it rejects: a specific error or result, not just "throws".
**Fixture (c2):** The unguarded `user.email` gives TS18048. `user!.email` and `if (!hasUser(user)) throw …` with `hasUser = () => true` both compile cleanly. At runtime with `undefined`, both throw `Cannot read properties of undefined (reading 'email')`. The predicate's own "missing user" branch never runs. That explains how CI can be green: a test that only expects *a throw* is satisfied by the crash. I also added a shortcut-free version, `user?.email ?? ""`. It compiles and quietly returns `""` instead of rejecting. That confirms "code without those shortcuts isn't necessarily correct". The honest version throws "missing user".
**Relied on:** "A type assertion (`as` or `!`) doesn't check incoming data. Neither does a predicate whose body never checks its claim; …" and "The checks enforce what you've expressed in them."
**Rating: Clear** for the verdict. **Inferred** for the fix. The rule says what does *not* count, but not what to require instead: a real check, a stricter test, or both. The point that a green test can be satisfied by a crash is something I had to work out myself. One wording point: TypeScript calls `!` a *non-null* assertion, not a type assertion. "Type assertion (`as` or `!`)" is loose, and a careful reader may notice.

### (3) Formatter with an existing signature and tests
**Decision:** No. Don't rewrite the types or tests, and don't write a new schema. Hand over the existing public signature, the tests for zero, negative values and locale, the project configuration and the check command. Write new examples only for behavior those tests don't already cover.
**Relied on:** "Send the project's configuration and check command with them; reuse what's already there."
**Rating: Inferred.** "Reuse what's already there" sits right after the configuration and check command, so it could mean only those two. Read on its own, "Before asking for code, put the behavior you want in the signature and in examples" could sound like you must write them fresh. I chose the generous reading, but the sentence doesn't make clear that existing signatures and tests count. No compiler claim was involved, so I built no fixture.

### (4) "Only the generated directory"
**Decision:** No. The owner can't make that promise. The forty imported files are type-checked under the stricter setting. Either widen the agreed scope to include fixing them (the "bigger job"), or don't turn the flag on for that project as set up.
**Fixture (c4):** I used a base config that passes over `src/old.ts`, then a generated-only project with `include: ["generated/*.ts"]` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. It fails with errors *in `src/old.ts`* (TS18048 and TS2375), even though src isn't in `include`. `--listFilesOnly` shows `src/old.ts` pulled in. `skipLibCheck` doesn't help. Confirmed.
**Beyond the rule:** I also checked that putting src in a separate `composite` project and adding `references` makes the generated project read `built/src/old.d.ts` instead. It then passes with the strict flags. So the setting *can* be limited to the generated directory, but only by changing how the projects are set up. The rule doesn't mention this.
**Relied on:** "Agree which files may change, but check their imports first: the configuration reaches that source too. A setting that breaks old code may make this a bigger job than you meant."
**Rating: Clear** for the verdict. **Inferred / Not enough** for the remedy. The rule only says the job gets bigger. It doesn't say what to choose: fix the old code, drop the flag, or isolate with declarations or references. "The configuration reaches that source too" is accurate for plain source imports. It's stated more broadly than it should be: it doesn't hold when the imports resolve to `.d.ts` files.

### 1. Is the rule clear and testable?
Mostly yes. The second sentence is a testable rule: a signature, at least one success example, at least one rejection example. You can review a hand-off against it. The second paragraph tells you how to review the answer you get back.
- **Strongest:** "If two implementations pass but disagree on behavior you need, decide and put that difference in the examples before handing the work back." It's concrete and you can act on it. Close behind: "The checks enforce what you've expressed in them. Someone still has to own what you meant."
- **Weakest:** "Send the project's configuration and check command with them; reuse what's already there." The second half dangles: reuse *what*? The opener, "Don't leave a blank where the decision belongs", is a slogan you can't test until the next sentence explains it.
- **Undefined or ambiguous terms:**
  - "Check command": I guessed tsc plus the tests.
  - "Those checks" in "Run those checks against the answer": the examples, the check command, or both?
  - "Handing the work back": which direction?
  - "That source", in "reaches that source too": I had to reread it.
  - "Behavior you need": who decides what's needed, and does "don't care" count?
  - "Type assertion" used for `!`.

### 2. Does it read like a person speaking?
Partly. It sounds like a terse senior engineer's checklist rather than a professor talking. I liked "A setting that breaks old code may make this a bigger job than you meant." It's human and a little rueful. "Someone still has to own what you meant" is a good closer, and the echo of "meant" works.

I got bored, or lost, around "Agree which files may change, but check their imports first: the configuration reaches that source too". It's dense, with a colon-explanation inside an imperative. The second paragraph jumps through four topics in six sentences: run checks, decide disagreements, assertions and predicates, ownership. "…; code without those shortcuts isn't necessarily correct" reads as a defensive hedge stuck on with a semicolon, closer to an AI's caveat than to speech. It's correct (the fixture proves it), but it would land better as its own short sentence or an example. There's no humor or image to pull a reader along apart from the "blank" metaphor at the start.

### 3. Did any fixture contradict a claim?
No. Every compiler and runtime claim I tested held:
- Assertions and an empty predicate compile but don't check anything.
- Shortcut-free code can still be wrong.
- The configuration reaches imported source.
- Two passing implementations can disagree.

Two small accuracy issues:
- `!` is a non-null assertion, not technically a type assertion.
- "The configuration reaches that source too" is stated universally. It doesn't hold when imports resolve to declaration files through project references.

One finding strengthens the rule: in case 2, both shortcuts make a loose "rejects missing user" test pass by crashing. That's a concrete example of "the checks enforce what you've expressed in them" that the chapter could use.
