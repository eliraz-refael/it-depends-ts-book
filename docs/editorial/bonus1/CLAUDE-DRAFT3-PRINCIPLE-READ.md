# Principle-only read: Bonus 1 draft 3 (`28d4229`)

2026-11-01. A fresh isolated reader saw only the draft 3 Principle and answered the same four cases, with fixtures. Saved verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1p3/principle.md`. Fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b1p3/fixtures/`. I used tsc 7.0.2 and Node v22.23.4. I added a one-line `console.d.ts` because `--types "" --lib es2022` leaves `console` undeclared.

### Case 1: both answers pass ("3" accepted vs rejected). **Clear**
- **Decision:** don't accept either implementation yet. The owner picks whether the string `"3"` is a valid quantity. Then they add that case to the tests, as a success or a rejection, before the next attempt. If the answer is "numbers only", tightening the parameter from `unknown`/`string` to `number` would also record the decision in the signature.
- **Sentences relied on:** "If two implementations pass but disagree on behavior you need, decide and put the difference in the examples before the next attempt." Also "Someone still has to own what you meant."
- **Fixture (`c1/quantity.ts`):** both implementations compile under the strict flags (rc=0). A gives `3:true -1:false "3":false` and B gives `3:true -1:false "3":true`. The existing tests can't tell them apart, as the case says.
- **Small gap:** "decide" has no stated subject. The last sentence suggests the owner decides, but the rule never says "the owner" or "you decide".

### Case 2: `user!.email` vs a predicate that returns `true`. **Clear for `!`, Inferred for the predicate**
- **Decision:** neither one establishes that the user is present. `!` is named outright: it "doesn't inspect incoming data". The predicate isn't named, but it falls under "Code without them can still do the wrong thing". It contains no `any`, `as` or `!`, yet it inspects nothing. I'd require a real check (`if (user === undefined) …`) and a rejection example that pins down what "reject" means: a specific error or a failure result, not just "it throws".
- **Fixture (`c2/user.ts`):** all three versions compile (rc=0). At runtime the `!` version and the always-`true` predicate both throw `TypeError: Cannot read properties of undefined (reading 'email')`. Only the honest version throws `missing user`. **So a test written as `expect(() => f(undefined)).toThrow()` would pass all three.** "CI is green" can be true even when a rejection test exists. That supports the rule's "The checks enforce what you've expressed in them", and it shows the rejection example must say *how* it rejects.
- **Gap:** the list of three escape hatches reads as complete. A reviewer who only greps for `any`, `as` and `!` would miss the lying predicate. My grep found only the `!` line (plus the harness's own `as`). Naming user-defined type predicates, or saying "for example", would close that.

### Case 3: an existing formatter contract. **Clear**
- **Decision:** no rewrite and no new schema. Hand over the existing signature and tests together with the project config and the test/compile command. Agree that only the formatter's implementation file may change.
- **Sentences relied on:** "Existing signatures and tests count; they go with the project configuration and the command that runs the compiler and tests." and "Agree which files may change".
- **Fixture (`c3/format.ts`):** an `Intl.NumberFormat` implementation passes zero, a negative value and de-DE cases, with no new types.
- **Small gap:** "go with" is ambiguous. I read it as "are handed over together with", but it could also mean "must match". If the existing tests miss a behavior the owner cares about, that's case 1 again. The rule doesn't say so here, but it isn't needed.

### Case 4: "only the generated directory". **Clear on the promise, Inferred on the remedy**
- **Decision:** with a plain `include: ["generated/*.ts"]` project, no, the owner can't make that promise. Before handing over, they either list the forty source files as allowed to change, or change the setup so those files aren't rechecked under the new flag.
- **Sentence relied on:** "remembering that source files the implementation imports are checked under that same configuration."
- **Fixture (`c4/`):** I used forty `src/m*.ts` files, each containing `r["k"].toUpperCase()`. The base project with only `src` passes (rc=0). The generated project with `noUncheckedIndexedAccess` reports **40 errors, all in `src/m*.ts`**, so the claim holds for a plain include.
- **Qualification:** the claim isn't universally true. I made `src` a composite referenced project emitting `.d.ts` and added `references` to the generated config. `tsc -b` then passed (rc=0) with the same stricter flag. A deliberately bad file inside `generated/` still failed, so the flag really did apply only to `generated/`. The rule states the import behavior unconditionally. A reader who knows project references could reasonably push back.
- **Remedy gap:** the rule tells you to agree on files, but not what to do once the agreement turns out to cover forty files. "Expand the scope, or isolate the flag" is my inference, not the text.

### 1. Is the rule clear and testable?
Mostly yes. Cases 1 and 3 fall straight out of the text, and case 4's main claim is checkable and held in a fixture.
- **Strongest sentence:** "If two implementations pass but disagree on behavior you need, decide and put the difference in the examples before the next attempt." It's concrete, testable, and gives an order of operations. Runner-up: "The checks enforce what you've expressed in them."
- **Weakest sentence:** "Agree which files may change, remembering that source files the implementation imports are checked under that same configuration." It packs two ideas into one sentence. The second idea is true only for a plain include setup, and it reads like a footnote stuck onto an instruction.
- **Undefined or ambiguous terms:**
  - **"unchecked `any`":** unchecked by what? Narrowed afterwards, or not flagged by lint?
  - **"examples of success and rejection":** tests, type-level tests, or both? And "rejection" doesn't say whether a crash counts (case 2 shows why that matters).
  - **"go with":** see case 3.
  - **"decide":** no stated subject.
  - **"own":** used once, at the end.
  - **"doesn't inspect incoming data":** odd wording for `!`, which applies to any value, not just incoming data.
- **List of escape hatches:** it reads as exhaustive, and it misses lying type predicates.

### 2. Does it read like a person speaking?
Partly. Paragraph 2 sounds like someone talking: "Run that command against the returned implementation" is direct, and the last two sentences have a real voice and land well. That ending was the part I enjoyed. Paragraph 1 reads like a contract clause, not a professor. I got bored at "they go with the project configuration and the command that runs the compiler and tests" and at the "remembering that…" clause. The second paragraph's middle is also a bit list-like: three operators, then a disclaimer. One concrete image (the string `"3"`, say) would make it feel spoken. There's no humor or warmth in paragraph 1.

### 3. Did any fixture contradict a claim?
There were no outright contradictions, but two results matter:
- **Imported files:** "Source files the implementation imports are checked under that same configuration" held for a plain include project (40 errors in `src`). It doesn't hold with project references and declaration output, where the stricter flag stayed inside `generated/`. The sentence needs scoping, or the chapter should acknowledge it.
- **Rejection tests:** an always-`true` type predicate and `!` both compile and both pass a generic "throws on missing user" test. That supports "Code without them can still do the wrong thing", and it exposes that the named list is incomplete and that a rejection example has to say how it rejects.
