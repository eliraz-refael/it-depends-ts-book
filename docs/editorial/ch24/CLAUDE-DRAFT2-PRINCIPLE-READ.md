<!-- Verbatim report from a fresh, isolated Principle-only reader (Claude subagent), 2026-10-27. Input: the Principle section of draft 2 (SHA-256 1405bfd2…) and the same four cases; no other files. -->

# Principle-only reader report: Chapter 24 draft 2

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/principle2/principle.md`. I ran the experiments in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/principle2/work/` with TS 7.0.2, module Node16, allowJs, no `strict` setting, on Node 22.

## 1. The rules, in my words

1. **Contract rule.** When you convert a file, its callers are still using it. Either keep what they load, what they pass and what they get back exactly the same, or change those callers and verify them too. A test you rewrote to use the new import style does not count as verifying the old callers.
2. **Evidence rule.** `allowJs` alone compiles JS callers without type-checking them. To get compiler evidence about a JS caller, turn on `checkJs` or put `// @ts-check` in the file. A caller the compiler didn't check tells you nothing. For that caller, either keep the contract or actually run it.
3. **Strictness rule.** TS 7 is strict by default, so checking JS will surface implicit-`any` parameters. Don't make them go away by turning `noImplicitAny` off for the whole program, because that also weakens the TypeScript files.

**Sentences I reread:**
- "If they load a function with `require('./slug')`, a test rewritten to use a default import doesn't check that old call." The example names a file (`slug`) that is never introduced. I also had to work out that "default import" means the *test's* import style. It took a second pass to see that the point is "the test exercises a different loading path from the caller's."
- "the compiler can emit a JavaScript caller without checking the call inside it." On first read I took "emit a caller" to mean the compiler generates callers. It means "outputs the caller's JS file." "The call inside it" is clear once that clicks.
- "A caller this run doesn't check supplies no compiler evidence." "This run" is doing a lot of work. It covers both "checkJs is off" and "the file isn't in the program at all," but the second meaning only comes through on a reread. It's the key to case (d), and it's implied rather than said.
- "Keep its contract or run it." This is the most important instruction in the passage, and it is the shortest and vaguest sentence. Run it how? Run the caller? Its tests? In production?

**Undefined or unclear terms:**
- "contract": glossed inline as "what they load, pass and receive", which helps. "Load" is still ambiguous: is it the module specifier/path, or the shape of what `require` returns (`module.exports` itself vs. `.default`)? The cases depend on the second meaning.
- "this run": undefined. Is it a run of `tsc`, of CI, of the test suite?
- "default strictness": a reader on TS 5 won't know TS 7 changed the default. It says "can expose" but never names the error (TS7006).
- "the whole program": a compiler term (the set of files `tsc` loads). Readers who don't think in compiler terms may read it as "the whole codebase."

## 2. Applying only the passage's rule

### (a) `money.js` to `money.ts` with named exports; JS callers destructure and call `.tax`

**What the rule says to check:** the contract is "what they load, pass and receive." The callers load `require("./money")` and expect an object with `price` and `tax` that take the same arguments and return the same results. The PR must either keep that or update and verify the callers. For compiler evidence, the two JS callers have to be checked (`checkJs` or `@ts-check`). Otherwise "keep its contract or run it."

**Confidence:** fairly confident. The passage doesn't say whether named exports keep the `module.exports = {…}` shape. It leaves me to infer that.

**What the evidence does NOT prove:** the passage only implies the answer. "Compiler evidence" is not runtime evidence, but the passage never draws that line explicitly. It just says "or run it."

*My own knowledge and experiments (labelled):*
- Verified at runtime: TS emits `exports.price = …; exports.tax = …`, so `require("./money")` still returns an object with `price` and `tax`. Destructuring works (`6`).
- With `checkJs`, the checker caught `tax("x")` (TS2345) and a nonexistent `.nope` (TS2339).
- What a clean check does not prove:
  - Types inferred from the TS signatures don't prove the old JS callers passed those types at runtime. Without `checkJs`, `tax("x")` ran silently and returned `NaN`.
  - It says nothing about callers outside the program.
  - It doesn't cover mutation or monkey-patching of `module.exports` (for example, tests that stub `money.price`).
  - It doesn't cover the new non-enumerable `__esModule: true` flag. That flag changes how interop helpers and bundlers treat the module.
  - It doesn't cover behaviour differences inside the function bodies.

### (b) `module.exports = class Mailer` to `export default class Mailer`; the TS test passes; a JS caller does `new (require("./mailer"))()`

**What the rule says:** not safe. This is exactly the passage's example: "a test rewritten to use a default import doesn't check that old call." The contract changed (callers now receive `{ default: Mailer }`, not the class), so the PR must either keep the contract or change and verify the caller.

**Confidence:** high. This is the one case the passage was written for. The passage doesn't say how to keep the contract (for example `export = Mailer`). It only says that you must.

*Verified:*
- The TS test passes ("ts test: sent").
- The JS caller compiles cleanly under `allowJs` (exit 0), then crashes with `TypeError: Mailer is not a constructor`.
- With `checkJs`, the checker reports TS2351 "This expression is not constructable." So the passage's "Ask for JavaScript errors with `checkJs`" really would have caught it.

### (c) Turning on repo-wide `checkJs` this sprint on TS 7, no `strict` setting, untyped params

**What the rule says the first run will report:** errors about untyped parameters ("default strictness can expose untyped parameters"). The team must not decide to switch `noImplicitAny` off for the whole program.

**What the passage is silent on:** what they *should* decide instead. It gives a prohibition with no alternative. It doesn't say:
- whether to add JSDoc types, or
- whether to turn checking on per file with `@ts-check`, or
- whether to set `noImplicitAny: false` only for the JS files (which can't be done in a single tsconfig, so you would need a separate project), or
- whether to accept and fix the errors.

It also doesn't warn that the first run will report *real contract breaks* mixed in with the implicit-any noise. In my run, the TS7006 errors sat right next to the TS2351 and TS2345 bugs. "Before merging", the team has to decide how to tell those apart, and the passage doesn't mention it. Nor does it say the first run might be huge.

**Confidence:** I'd know what *not* to do. I wouldn't know what *to* do.

*Verified:*
- `checkJs` with no `strict` setting gave `TS7006: Parameter 'a' implicitly has an 'any' type`.
- With `--noImplicitAny false`, those errors disappear and the real bugs stay. So the tempting fix "works" but is program-wide, which is what the passage forbids. The passage's reason ("including the TypeScript") is right but brief.

### (d) `scripts/backfill.js` requires the converted file, isn't in `include`, and nothing imports it

**What the rule says:** "A caller this run doesn't check supplies no compiler evidence. Keep its contract or run it." The script isn't checked, so either keep the contract it relies on or run the script.

**Confidence:** moderate. I applied it only because I'd decided on reread that "this run" covers files outside the program. The passage never says that files outside `include` aren't checked even with `checkJs` on. A reader could easily think "we turned on `checkJs` repo-wide, so the script is covered."

**What the passage is silent on:**
- the option of adding `scripts` to `include`, or a separate tsconfig;
- how to "run" a backfill script safely (dry-run? staging?), which is a real problem for a script that writes data.

*Verified:* with `// @ts-check` in `scripts/backfill.js` and `checkJs` on, `tsc -p .` reported zero diagnostics for it, because it's not in the program. `@ts-check` doesn't help a file the program never loads. That's a sharp, non-obvious point, and stating it would make case (d) answerable from the text.

## 3. Enjoyment

It's mostly documentation in quotation marks. Paragraph 1 has a voice: "A migration changes an implementation while its callers are still using it" is a good, concrete opening line with a nice tension (you're operating on a patient who's still walking around). After that it turns into a run of short imperatives:
- "Ask for JavaScript errors with…"
- "Keep its contract or run it."
- "Don't silence those by…"

These read like a style guide's bullet points with the bullets taken out.

My attention dropped at "A caller this run doesn't check supplies no compiler evidence." It's abstract, compressed and passive-feeling, right where the reader most needs a picture. Nothing was funny. The `slug` example is the one moment with something concrete in it, and it refers to something we never see. Daniel is a "compiler internist", and an internist metaphor (the patient is still walking around, so don't operate on what you didn't examine) is sitting right there unused.

## 4. The single most helpful change

Give the "Keep its contract or run it" rule a concrete before/after, and state plainly what counts as "checked." For example: "`module.exports = Mailer` became `export default Mailer`. The TS test passes, `tsc` exits 0, and `new (require('./mailer'))()` throws 'not a constructor'. Only a file that is both in the program and checked (`checkJs`/`@ts-check`) gives you evidence. A script outside `include` gets nothing, even with `@ts-check` at the top." That one example would make cases (b) and (d) answerable straight from the text. Right now (b) is answerable and (d) only by inference. A close second is to add one sentence on what to do instead of turning off `noImplicitAny` program-wide.
