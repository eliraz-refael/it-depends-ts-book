<!-- Verbatim report from a fresh, isolated Principle-only reader (Claude subagent), 2026-10-27. Input: the Principle section of draft 1 (SHA-256 20a52386…) and four cases; no other files. -->

# Principle-only reader report: Chapter 24 draft 1

I read only `principle.md`. It is two short paragraphs, both spoken by Daniel. I ran experiments in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/principle/work/` with TS 7.0.2, using `module node16`, `target es2022`, `types []`, `allowJs`, CommonJS, and Node 22.

## 1. The rules in my own words

**Rule 1 (the contract).** Converting a module changes the file's own code, and it can also break the code that calls it. For every existing caller you have two choices:
- keep what that caller loads, passes and receives exactly as it was; or
- change that caller in the same PR and verify it.

Rewriting the test so it uses the new import is not evidence that the old callers still work.

**Rule 2 (checking scope).** "Included" in the program does not mean checked. `allowJs` puts JS files into the program. Their bodies are only checked once you turn on `checkJs` or put `@ts-check` on the file. On TS 7, the strict default means the first check will also report untyped parameters. Choose how much JS to check, and don't quiet those errors by loosening settings your existing TypeScript already relies on.

**Sentences I had to reread:**
- **"A conversion has two sides."** I read it twice. My first guess was "TS side and JS side". Only the next sentence suggests it means the module and its callers. The opening line is the hardest sentence in the passage.
- **"loads, passes and receives".** It's a good triple, but I had to stop and map each word. "Loads" means the import or `require` shape, "passes" means the arguments, "receives" means the return value. Nothing says this, and "loads" is the least obvious. Case (b) is exactly a "loads" break, so this is the word that matters most.
- **"And included isn't checked."** Out of context it reads like a fragment. I reread it as "being included isn't the same as being checked". The word "included" is never tied to tsconfig `include` (or to the program), which is the meaning case (d) depends on.
- **"Until then, that body can run without those diagnostics."** "Can run" sounds like a runtime claim, but the point is about compile-time silence. I had to work out that it means "it compiles and ships, and no one has looked at it".
- **"exposes untyped parameters"** is vague: exposes them how? As errors (TS7006). I only knew because I ran it.
- **"without quietly loosening the TypeScript you've already checked"** is the most important instruction, and it is the least concrete. It doesn't say what loosening looks like (for example, setting `strict: false` or `noImplicitAny: false` in the shared tsconfig).

**Undefined or unclear terms:**
- "caller" (does a test count? a script outside the program?)
- "included" (included in what?)
- "the default strictness" (a reader on TS 5.x won't know that 7 changed it)
- "checking scope" (per file? per directory? a separate tsconfig?)

## 2. Applying only the passage's rule

### (a) `money.js` to `money.ts` with named exports, JS callers using `require`

**What the rule says to check.** The PR must show that what the two JS callers load, pass and receive is unchanged:
- `require("./money")` still returns an object with `price` and `tax`;
- the arguments they pass are still accepted;
- the results are what they expect.

Or the PR changes and verifies them. The passage's test sentence implies the evidence has to come from the old caller itself, by running it.

**Confidence.** Reasonably confident on the load shape. My experiment: the emitted file contains `exports.price = price; exports.tax = tax;`, and the JS caller destructures and calls both successfully.

**What that evidence doesn't prove (from the rule).** Rule 2 covers this. The JS callers are in the program but not checked, so nothing confirms the "passes" part. My experiment: `price("2")` compiles with exit 0 and runs, returning 200 through coercion. With `--checkJs` it fails with TS2345, "Argument of type 'string' is not assignable to parameter of type 'number'". So "it loads and runs" proves the shape, not that the arguments are right. The passage gives me both halves, but never joins them into this sentence. I had to join them myself.

**Silent (my own knowledge):** whether `Object.keys`/spread or monkey-patching (`money.tax = stub`) counts as part of the contract. In my run the keys were still `[price, tax]`, because `__esModule` is non-enumerable.

### (b) `module.exports = class Mailer` to `export default class Mailer`, TS test passes, old JS caller does `new (require("./mailer"))()`

**What the rule says.** Not safe as evidence. This is the case the passage's sentence "Changing the test to use your new import doesn't tell you whether the old call still works" was written for. What the caller "loads" has changed, so you must either keep the shape or change and verify the old caller.

**Confidence.** High that the rule flags it. I also confirmed the break: the TS test prints `test: sent`, and the old caller throws `TypeError: Mailer is not a constructor`, because `require` now returns `{ default: Mailer }`. Plain `tsc` exits 0. With `checkJs`, TS reports TS2351 "This expression is not constructable" on `old.js`. So Rule 2 is the cheap way to catch Rule 1 violations, but the passage never says so.

**Silent:** how to keep the shape. From my own knowledge: `export = Mailer` in the `.ts` file, or edit the caller to use `.default`. A reader who knows only this passage knows the PR is wrong but not how to fix it.

### (c) Turn on `checkJs` repo-wide this sprint on TS 7, no `strict` set

**What the rule says.** The first run will report untyped parameters ("the default strictness also exposes untyped parameters"). The team must choose the checking scope, and must not silence the errors by loosening TS settings.

**Confidence.** Medium. The passage predicts the right thing: I got TS7006 "Parameter 'a' implicitly has an 'any' type" on a plain JS function. But it gives no idea of how many errors to expect or what the decision options are.

**Silent:**
- What "choose the checking scope" means in practice (per-file `@ts-check`, a directory at a time, a separate tsconfig for JS).
- What the trap looks like. From my experiment: adding `--noImplicitAny false` to silence the JS errors also silenced the identical error in an existing `typed.ts`. Exit went from 1 to 0, so the TS file lost a check with no warning. That is exactly "quietly loosening", and the passage would be far easier to apply if it said so in one clause.

### (d) `scripts/backfill.js` requires the converted file, outside `include`, imported by nothing

**What the rule says.** Rule 1 says backfill.js is an existing caller, so you keep its shape or change and verify it. Rule 2 talks about files that are *included* but unchecked. This file is not even included, so the passage says nothing about it directly. A careful reader would infer that if included-but-unchecked gives no errors, then not-included certainly gives none.

**Confidence.** Low as a reading of the text, high once I tested it. With `checkJs: true` and `include: ["src"]`, `tsc -p .` exits 0 and `--listFilesOnly` lists only `src/mailer.ts`, even though `scripts/backfill.js` does `new (require("../src/mailer"))()` against a default export. `checkJs` is no help here. The only evidence is running the script, adding it to `include`, or writing a test that requires it.

**Silent:** whether "caller" includes files outside the program, and how to find them (grep for `require("…/mailer")`). This is the most dangerous case and the passage's wording ("included isn't checked") doesn't cover it.

## 3. Enjoyment

- **Paragraph 1 reads like a person.** "That's the contract." is a nice spoken beat, and the test sentence lands like a hard-won lesson.
- **Paragraph 2 turns into documentation** at "`allowJs` lets JavaScript into the program. `checkJs`, or `@ts-check` on a file, asks for errors in its body." That is two flag definitions in a row. My attention dropped there and didn't fully come back.
- **"Choose the checking scope without quietly loosening…"** sounds like a policy memo, not a compiler internist talking.
- **Nothing was fun as such.** There's no image or concrete example. The best moment is "included isn't checked", which is a punchy line, but it gets only one sentence before the flags take over.
- **Daniel doesn't sound like a compiler internist.** He never says what the compiler actually does (emits `exports.default`, never opens `scripts/`). One line in his own register would help, for example "the compiler never even opens that file".

## 4. The single most helpful change

Add one concrete before-and-after sentence that ties the two rules together. Something like: "Your test now says `import Mailer from`, the old file still says `new (require('./mailer'))()`, and that one throws `Mailer is not a constructor`. `tsc` stays green unless `checkJs` covers that file, and it never sees a file outside `include`."

That single example would:
- define "loads";
- show why changing the test proves nothing;
- reveal that `checkJs` is how you get evidence about callers;
- extend "included isn't checked" to "not included isn't even seen".

Cases (b) and (d) would then become direct applications instead of inferences.

A smaller second fix would be to name the loosening in the last sentence, e.g. "don't fix the JS errors by turning off `noImplicitAny` for everyone".
