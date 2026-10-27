<!-- Verbatim report from a fresh, isolated Principle-only reader (Claude subagent), 2026-10-27. Input: the Principle section of draft 3 (SHA-256 7393297e…) and the same four cases; no other files. -->

# Principle-only reader report: Chapter 24 draft 3

I read only `principle.md`. I ran the experiments in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/principle3/work/` on TS 7.0.2 with the stated config (Node16, CommonJS, ES2022, `types: []`, `allowJs`, no `strict`).

## 1. The rules, in my own words

1. **The contract rule.** When you convert a module, its existing callers keep calling it. Either keep exactly what they rely on (what `require` returns, the argument shapes, the return shapes), or change those callers and verify them as well. A test rewritten to use the new import style doesn't verify the old call style.
2. **The checking-boundary rule.** A clean compile tells you nothing about a JS caller that wasn't type-checked. `allowJs` only lets JS into the build. `checkJs` or `@ts-check` is what produces errors for it. A file that isn't part of this compilation gets no checking, even if it starts with `@ts-check`. For any caller that isn't checked, keep the contract or execute the caller.
3. **The TS 7 strictness note.** Turning on JS checking under TS 7's default strictness will flag untyped parameters. Limit which files you check rather than turning off `noImplicitAny` everywhere, because that also weakens the `.ts` files.

The first paragraph is clear and testable, and the `slug` example works. The second paragraph has the right content, but it reads as six compressed facts and you have to assemble the rule yourself.

### Sentences I had to reread

- **"The emitter can write a file whose calls we never checked."** I read it three times. "Whose calls" could mean calls *made by* that file or calls *into* it. The word "emitter" isn't explained either. I eventually took it to mean "tsc will happily write JS for a caller it never type-checked". That turned out true: with `checkJs` off, `oldcaller.js` compiled with exit 0 and crashed at runtime. Something like "tsc will emit JS for a file without ever checking it" is plainer.
- **"A file this run never loads gets no checking."** Here "run" means a tsc invocation and "loads" means "is in the program". In a chapter about `require`, though, "loads" first reads as Node loading the file at runtime. I had to work out that this is about tsc's program (`include` plus whatever the included files import).
- **"For a caller you aren't checking, keep its contract or run it."** "Run" now means something different from "this run" two sentences earlier: execute the caller, not run tsc. And "its contract" seems to point back to the caller, but the contract belongs to the module being converted. Both words made me stop.
- **"weakens the TypeScript too."** It took a moment to see that "the TypeScript" means the `.ts` files, as opposed to the JS you meant to check. After that the sentence landed, and it's the most useful warning in the passage.

### Undefined or unclear terms

- "emitter"
- "this run" (a tsc invocation? a CI job?)
- "loads" (in the program, or required at runtime?)
- "run it" (run the caller's tests? the script itself?)
- "Narrow which files you check": the passage never says how (per-file `@ts-check` with `checkJs` off, `@ts-nocheck`, a separate tsconfig?).
- "TypeScript 7's default strictness": a reader who doesn't know TS 7 turned `strict` on by default won't know why this matters. The passage states it as if already known.

## 2. Applying only the passage's rule

### (a) `money.js` to named exports, with two JS `require` callers

**What the rule says to do:** keep the callers' contract (they destructure `price` and call `.tax` on the required object), or verify the callers. Since they're JS, they count as verified only if this tsc run includes them *and* `checkJs`/`@ts-check` is on. Otherwise the PR must run them.

**Would I be confident?** Partly. The rule tells me *what to check* but not *whether `export function` keeps the contract*. Whether TS emits named exports onto the `exports` object is exactly the fact I'd need, and the passage doesn't say. I had to test it.
- **(Own knowledge, verified)** The emit is `exports.price = price; exports.tax = tax;` plus `__esModule`, so both `require` forms work. With `checkJs` on, tsc also caught a bad argument from a JS caller (`price("x")`, TS2345).

**What the evidence doesn't prove: the passage is silent on this.**
- **(Own knowledge)** A clean `checkJs` run proves the shapes line up at the type level for the files in the program. It doesn't prove:
  - runtime behaviour on paths no test exercises;
  - anything about callers outside the program (scripts, other packages);
  - that `Object.keys` or enumeration of the export object is unchanged (there's now a non-enumerable `__esModule` flag);
  - that inferred parameter types match what callers actually pass at runtime (e.g. strings from env vars).
- Running the two callers proves only the paths those runs hit.
- The passage gives me no language for "what this evidence doesn't cover". I think it should, because that's the most important question in a migration review.

### (b) `module.exports = class Mailer` to `export default class Mailer`

**What the rule says:** not safe. This is almost word for word the `slug` example: "a test rewritten to use a default import doesn't check that old call." The passing `import Mailer from "./mailer"` test is irrelevant to `const Mailer = require("./mailer"); new Mailer()`. Either keep the contract or change and verify the old caller.

**Confidence:** high, and the passage earns it. I verified both sides:
- **Old caller, at runtime:** node threw `TypeError: Mailer is not a constructor` (require returns `{ default: Mailer }`).
- **Old caller, with `checkJs` on:** tsc reported TS2351 "This expression is not constructable".
- **With `checkJs` off:** exit 0 and emit, so the green build is meaningless.

**Silent:** how to *keep* the contract. **(Own knowledge, verified)** `export = Mailer` keeps it: the old caller compiled clean and printed "sent". The passage says "keep their contract" but never shows the TS form that does that for a `module.exports =` module, so a reader who wants the "keep" branch is left without a tool.

### (c) Whole-repo `checkJs` this sprint, on TS 7, no `strict` setting, untyped parameters

**What the rule says:** the first run "can expose untyped parameters". Narrow which files you check if needed, and don't turn off `noImplicitAny` globally, because that weakens the TS too.

**What the first run will report:** the passage only says "untyped parameters". **(Own knowledge, verified)** You get one TS7006 "Parameter 'a' implicitly has an 'any' type" *per parameter*. In a real repo that's likely hundreds or thousands. Mixed in with them are the genuine contract breaks this chapter cares about (TS2351, TS2345 in my run). The noise can bury the signal. The passage doesn't warn about that, and that's the practical danger.

**What to decide before merging.** The passage implies one decision: the scope of checking versus global `noImplicitAny`. Everything else I had to supply myself (**own knowledge**):
- *How* to narrow: per-file `// @ts-check` with `checkJs` off, or `checkJs` on with `// @ts-nocheck` on files not yet ready, or a separate tsconfig.
- Whether CI fails on these errors. tsc still emitted every file despite errors (exit 2, `dist/` written), so a team that only looks at emitted output might not notice.
- Whether to fix with JSDoc annotations or by converting files.
- Who owns the backlog.

I'd be only moderately confident leading this from the passage alone. I know the trap but not the procedure.

### (d) `scripts/backfill.js` outside `include`, not imported by anything included

**What the rule says:** clear. "A file this run never loads gets no checking, even with `@ts-check` at the top. For a caller you aren't checking, keep its contract or run it." So either keep the exported shape the script depends on, or run the script as part of verifying the PR.

**Confidence:** high on the diagnosis. I verified it: `--listFilesOnly` didn't list `scripts/backfill.js`, and the build passed. Running the script (which has `@ts-check` at the top) threw `TypeError: Mailer is not a constructor`.

**Gap:** the passage presents a two-way choice, "keep or run". It leaves out the obvious third option implied by paragraph 1 ("change and verify the callers"): bring the script into the checked program, via `include` or its own tsconfig, so it *is* checked. **(Own knowledge)** That's usually the durable fix. A reader applying only the passage might think "run it by hand once" is enough.

## 3. Enjoyment

- **Paragraph 1 sounds like a person.** "A migration changes an implementation while its callers are still using it" is a good opening line: plain, slightly ominous, true. The `slug` example is concrete and immediately useful.
- **Paragraph 2 reads like documentation that someone recited aloud.** "`allowJs` admits JavaScript. `checkJs` or `@ts-check` asks for its errors." These are flag definitions in a row, with no connective tissue: no "because", no "so", no example. My attention dropped right there. It came back at "even with `@ts-check` at the top", which is a nice surprise and the one moment that felt like an insider telling me a secret.
- **The TS 7 sentences feel bolted on.** They're a separate topic (strictness noise) placed in the same breath as the checking-boundary rule.
- **Fun:** nothing was fun, exactly. The passage is too short to be boring, but it has no image, no joke and no moment of character. Daniel, a "compiler internist", could plausibly have said something vivid about the emitter cheerfully writing files it never looked at. The material invites it ("tsc will write you a perfectly formatted crash"), but the voice stays flat.

## 4. The single most helpful change

Turn the second paragraph's six facts into one explicit test for "checked", stated the way paragraph 1 states the contract. For example:

> "A caller counts as checked only if this tsc invocation includes it *and* `checkJs` or `@ts-check` is on for it. Otherwise it's unchecked, and the build passing tells you nothing about it. For every unchecked caller, keep the export shape it uses, bring it into the checked program, or execute its exact `require` line in a test."

That one sentence would:
- define "this run" and "loads";
- remove the two meanings of "run";
- add the missing third option;
- give reviewers a per-caller checklist they can apply to cases (a) through (d) without guessing.

A close second: one line showing `export =` as the way to keep a `module.exports =` contract. Without it the "keep" branch is abstract.
