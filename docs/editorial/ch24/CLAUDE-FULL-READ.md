<!-- Verbatim report from a fresh, isolated full reader (Claude subagent), 2026-10-27. Input: draft 1 (SHA-256 20a52386…) only. The reader rebuilt the repository from the fences on TS 7.0.2 / Node 22. Note: it calls Eden "she" once in section 4; Eden is he. -->

# Full reader report: Chapter 24 draft 1

I rebuilt the repository in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/full/work/`, one directory per state (`a` pre-PR, `b` default-export conversion, `c` `export =`, `e` global checkJs plus opt-outs and the caller probe, `f` the Turn plus backfill, `g` the include and `require(name)` probes). I used tsc 7.0.2 and Node 22.

## 1. First read

**Where I enjoyed it**
- The cold open, l.11–17: "I picked the boring one." / "The product pages are returning five hundreds." / "It still makes the slug." / "The route can't get far enough to ask it." It's quick and funny, and the problem is on the table in four lines.
- l.106 Noam: "The new test correctly checks a call nobody in that route makes." This is the best line in the chapter.
- l.108 Oded: "I converted the test out of catching the conversion." Good self-indictment, in character.
- l.112: "I don't want this depending on the next person remembering which kind of import we argued about." It sounds like a real engineer talking.
- l.136–138: "It copied the route into the output. It clearly found it." / "Found it, inferred from it, emitted it. We haven't asked it to report the route's body errors." This is the "included isn't checked" idea in dialogue form, and it works.
- l.162: Oded's "who is deciding what `sum` accepts? It has string callers as well as numeric ones." This is his strongest moment. It is paid off nicely at l.206: "the part we can type without deciding how anyone adds strings."
- l.178: "That comment doesn't make its callers safe. It tells us where we stopped."
- l.245–251, the Turn beat: "Compiler exit zero." / "The old test still fails." / "I opted out of exactly the check that caught it." It's clean and tight.
- l.263: "That would turn my list into a way to merge failures."
- l.282: "So importing the slugger doesn't tell the compiler who else imports the slugger."
- l.340, the closer: "And the old test stays old on purpose." It's a good last line.

**Where I got bored or skimmed**
- l.188–230, Chen's `handle(42)` detour. It is technically right, but it isn't part of the incident: no one called the route with a number. I lost the thread here and wasn't sure why it came before the Turn. Oded's l.204 "So getting the function out of the module was only the first problem" makes the probe sound like a second production bug, which it isn't.
- l.257, l.261 and l.336. Eden restates the Principle's rule three times in close succession (details in section 6).
- The `money.js` coda, l.302–332, is pleasant but low stakes. I read it as an appendix.

**Where I was confused**
- l.220, "We didn't rename the route." It took me a moment to decode "rename" as ".js to .ts". Someone outside the room won't get it.
- l.224–230 is muddled. Oded says "Put the caller check in it too". Eden replies "We didn't have to. Its caller has a useful type now". Then: "We removed your numeric probe from the build." I couldn't tell what "we didn't have to" refers to, whose "its caller" is meant, or whether the probe went into the PR. "Numeric probe" also takes a beat to map back to `caller.ts`.
- l.234, "Chen takes the first, broken conversion back out of the diff." I first read this as Chen *removing* the broken version. In fact he *re-applies* it as an experiment. Nothing marks the Turn as a hypothetical, so for a moment I thought Chen was shipping a broken build.
- l.249–251: Chen sets up the opt-out, but Noam says "I opted out of exactly the check that caught it." I see he's owning the policy, but the speaker attribution jars.
- l.265, "Mine stays off the list." Mine what? His route? His converted file?
- l.267, "The backfill isn't on either list." Which two lists: migration and opt-out, or opt-out and `include`? It's ambiguous at the moment Chen needs it to land.
- l.332, "telling me to remember what 'shape' means." No one in this chapter says "shape". If it calls back to an earlier chapter, a first reader won't catch it. If it doesn't, it's a dangling quote.
- l.170, Daniel's "`strict` is a default here, not a command to ignore your other settings." Nobody asked anything this answers. Noam already said, correctly, that `noImplicitAny: false` would apply to the TS files too. Daniel's line reads like a correction of a claim nobody made.

**The scene I'd retell to a colleague:** "The test passed before and after, because he rewrote the test to `import slug from`. That reads `.default`. The route still does `require('./slug')` and gets an object. Then they turn on checkJs, opt the route out to quiet the noise, and the compiler goes back to exit zero with prod still broken." Lines 63–110 plus the Turn make a story people would actually tell.

## 2. When did I know what was wrong?

At l.74. Seeing `module.exports = function` (l.46) next to `export default` plus `import slug from` in the rewritten test, I knew. An intermediate TS reader will get it at the same point, and even the title hints at it. It didn't spoil much, because the chapter doesn't run on suspense about the first bug. The `inspect.js` scene (l.93–98) works as a confirmation, and Oded's growing realization is the payoff. The real surprises are the Turn (an opt-out hides the caller) and the backfill (outside the program), and I didn't see those coming. The Principle does give away part of the first act (see section 5).

## 3. Technical verification

### Mismatches and gaps

1. **The implicit-any count is inconsistent with the world the chapter builds.** At l.160 Noam says "Four implicit-any parameters", and that is exactly right for the files shown. But l.302 has `src/money.js` already existing as "the next leaf on his list". With `checkJs: true`, that file reports a fifth error, verified:
   `src/money.js(1,16): error TS7006: Parameter 'cents' implicitly has an 'any' type.`
   It also breaks the Turn's "Compiler exit zero" (l.245), because only `lookup.js` and `sum.js` got `@ts-nocheck` (l.186). Either `money.js` needs an opt-out when Eden records the helpers, or the count and the opt-out list need to include it, or `money.js` should be introduced as not yet existing (unlikely). As written, "four" and "exit zero" can't both be true if `money.js` was in `src/` all along.
2. **The Turn opts out a file Noam's own rule forbids opting out.** This isn't a compiler mismatch, but it's a logic gap. Chen adds `@ts-nocheck` to the route (l.237–242). Twenty lines later Noam's rule is "no adding an opt-out to a checked caller because the conversion broke it" (l.263). So the Turn shows a failure that the opt-out policy, as Noam states it, already prohibits. More on this in section 4.
3. Minor: at l.130 Daniel says "So does `import slug = require('./slug')`". From `tests/slug.test.ts` the path is `"../src/slug"`. I verified the `"../src/slug"` form compiles and passes. If the line refers to the test, fix the path. If it means a file in `src/`, say so.
4. Minor: l.222, "We had a green typed caller accepting forty-two". The *program* wasn't green at that point. The global check reported `route.js(2,34) TS7006`, and the chapter says so itself at l.202. Only the caller's own line was error-free. "A typed caller with no error accepting forty-two" is accurate.
5. Not a mismatch, just a note: TS 7.0.2 exits with **code 2** when it emits with errors (for example the `caller.ts` state and the backfill-with-broken-export state). The chapter only claims "exit zero" for states that really do exit 0, so nothing is wrong. Don't write "exit 1" anywhere for an emitting build.

### Verified, no mismatch
- The tsconfig builds as printed. `showConfig` has no `strict` key, and `--strict false` removes the TS7006 errors, which confirms strict defaults to true on 7.0.2 (l.21, l.7).
- l.40: the JS tests aren't in the program. `listFiles` shows only `tests/slug.test.ts`.
- Pre-PR state: build exit 0, `tests/slug.test.js` passes, the route returns `/products/green-chair`.
- Default-export conversion: build exit 0, `dist/tests/slug.test.js` passes (l.63). The emit contains `exports.default = slug;` (l.100).
- `inspect.js` prints `object` and then `function` (l.94–97).
- Route call: `TypeError: slug is not a function` (l.100).
- Restored `tests/slug.require.test.js` fails with the same TypeError (l.110).
- `require('./slug').default` in the route works at runtime and passes checkJs (l.114).
- `export = slug`: emit ends `module.exports = slug;`. Both tests pass and the route returns `/products/green-chair` (l.126).
- Default import of an `export =` module compiles and runs on Node16. The emit uses `__importDefault`. `import slug = require(...)` also works (l.130).
- checkJs on the broken version: `route.js(3,25) TS2349 This expression is not callable.` plus `Type 'typeof import(".../src/slug")' has no call signatures.` "The diagnostic says the imported module has no call signatures" is a fair paraphrase. Also `TS7006 Parameter 'title' implicitly has an 'any' type.` (l.140).
- With `export =`, exactly four TS7006 remain: title, id, a, b (l.160).
- `noImplicitAny: false` removes all four, and it also silences an untyped parameter in a `.ts` file (l.166–168). Explicit false wins over the strict default (l.170).
- `// @ts-check` on the route alone with `checkJs: false` reports the route's TS7006, and the TS2349 on the broken version, and nothing in lookup or sum (l.172).
- `@ts-nocheck` on lookup and sum silences them (l.186).
- `caller.ts`: `handle(42)` gives no error on the caller line, and the only error is route.js TS7006 (l.198, l.202). Running it throws `TypeError: title.trim is not a function` (l.202).
- Annotated route: `TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.` (l.218). It's the same without the local `@ts-check` line, so "redundant with our global setting" is correct (l.226).
- After removing `caller.ts`: exit 0, both tests pass, the route call works (l.230).
- Turn: broken default export, original route with `@ts-nocheck`, helpers opted out, global checkJs on gives compiler exit 0. The TS test passes, the old test fails with `slug is not a function` (l.245–247). This depends on `money.js` not existing yet (see mismatch 1).
- Backfill: not in the program. Copied into `dist/scripts` it throws on the broken export. Added to `include`, the broken export reports `scripts/backfill.js(2,28) TS2349`, and `export =` compiles and prints `/products/green-chair` (l.278–280).
- "A filename missing from `include` isn't proof that it stayed out" (l.284) holds. A `.ts` file in `src` importing `../other/extra.js` pulled that file into the program and type-checked it (TS2349 reported). The same goes for `exclude`: excluding `src/route.js` still left it in the program through `caller.ts`, and TS2345 was still reported against its JSDoc type.
- `const name = "./slug"; const s = require(name);` in checked JS gives `any`. Calling it, assigning it to `@type {number}` and `s.anything.goes()` all produce no errors and no implicit-any complaint. The literal `require("./slug")` in the same position reports TS2349 (l.290).
- Named export: `money.ts` with `export function price` gives exit 0 under global checkJs, and the unchanged `price-label.js` prints `12.5` (l.328). Bonus: a JS caller passing `"x"` gets TS2345, so the named export does type JS callers.

## 4. Is the argument fair?

- **Oded (leaf-first):** He gets a real strongest form at l.162: you can't type `sum` without deciding its contract, and he won't do that in a slug PR. Then the chapter undercuts him with the weak "Or turn off `noImplicitAny`" (l.166), which is easily knocked down. That's fine as a character beat. What's missing is the obvious best case for leaf-first: *keep the export compatible and you never have to touch the callers*. That ends up being the winning position (`export =`, named export for `money`), but Eden and Daniel voice it, not Oded. Noam's l.296 concession ("Leaf-first still makes sense") helps. Oded would come out stronger if he proposed `export =` himself after l.116 instead of asking "What's the export that keeps the route?"
- **Noam (global checkJs plus opt-outs):** He gets a strong case at l.174 and l.182 ("Keeping it unchecked takes a change someone can see in the PR"). The Turn is staged unfairly against him, though. Chen *adds* `@ts-nocheck` to a caller that was checked, which Noam immediately (l.263) says his policy forbids. The honest version of the Turn uses a caller that was **already** on the opt-out list for unrelated reasons. For example, make `lookup.js` or another legacy `@ts-nocheck` file `require("./slug")`. Then the broken conversion goes green under Noam's policy exactly as designed. That's a real indictment of "checkJs is on, we're covered", and it makes Eden's "take its known callers off that list" necessary instead of a hypothetical.
- **Eden (check the callers):** Fair, and she wins on the evidence: the Turn plus the backfill. "Account for entry points the program doesn't discover" is earned by the backfill scene. "Keep global JavaScript checking" is earned by l.140–142.
- **Verdict:** It's mostly earned, but it reads as minutes. Eden at l.336 restates conclusions already reached in-scene at l.257 and l.261. Noam's "The exception list comes with us" is fine. Oded's closer is good. Nothing in the Verdict is newly announced, but nothing in it surprises either.
- **Lines nobody in the room would say:**
  - l.114, "The purpose of this PR was to type the slugger." It's stiff. Something like "This PR was supposed to type one function" sounds more like speech.
  - l.170, Daniel's strict line, which corrects a claim nobody made.
  - l.222, "that TypeScript caller learned something it didn't know from importing JavaScript alone." That's narration, not speech.
  - l.257, Eden's speech, which is a policy statement read aloud.

## 5. The Principle

- **Is it applicable?** The first paragraph is: "Keep what the existing caller loads, passes and receives, or change and verify that caller with it." It's testable: for each caller, either the import form, the arguments and the return are unchanged, or the caller is in the diff and verified. It's good.
- The second paragraph is weaker as a rule. "Included isn't checked" is a fact. "On TypeScript 7, the default strictness also exposes untyped parameters" is a fact. "Choose the checking scope without quietly loosening the TypeScript you've already checked" is the only rule, and "choose the checking scope" is vague. It never mentions the Turn's actual lesson, that an opt-out on a caller hides the conversion, or the backfill's lesson, that entry points outside the program have to be found. "Choose the checking scope" could become: "an opted-out or out-of-program caller is unchecked, so preserve its contract or run it."
- **Does it give away the Turn?** It gives away Act 1, not the Turn. "Changing the test to use your new import doesn't tell you whether the old call still works" *is* Oded's l.108 realization, and "And included isn't checked" *is* l.138. So the two mid-chapter reveals are announced before the debate starts. I'd cut the third sentence of l.5 and let l.108 own it. The Turn itself (opt-out hides the caller) is only hinted at by "change and verify that caller", which is fine.

## 6. Line-level

- l.13, "returning five hundreds". A copy editor would write "500s". Also, "five hundreds" in speech sounds odd. People say "five-hundreds" or "500s".
- l.19 reads like a manual: "The package explicitly says `"type": "commonjs"`; adopting TypeScript hasn't changed that." Also, "The build also copies an older maintenance directory into the output. Chen uses its backfill script to regenerate product URLs." is an obvious plant. That's acceptable, but it could be planted through dialogue or an action.
- l.40 is manual-like: "TypeScript tests are compiled with the source; the old JavaScript tests are not in that compiler run." It's needed, but it could be Eden's line.
- l.90, "Oded runs two checks against the emitted module, in `dist/src`." The `inspect.js` comment already says where it runs, so this is redundant.
- l.100 is narration that explains the bug ("The route still tries to call the whole object"). Then Daniel explains it again at l.104. Pick one.
- l.146, "Noam expands the parameter errors from two older helpers:" It's an odd verb. Does he expand the errors, or open the files?
- l.190, "He tries a call against the compatible slug export and the still-unannotated JavaScript route." This is dense state bookkeeping. The fence comment already says "before the route's parameter is annotated".
- l.204 overclaims, as noted in section 1.
- l.220 "rename", l.224–230 and l.234 "back out of the diff": all covered under confusion.
- Repetition. The rule "preserve the caller's loading call, arguments and result, or bring it into the check" appears at l.5, l.257, l.261 ("keep its contract … retain the old contract test"), l.300 ("that is a reason to keep its contract") and l.336. That's five times. Keep l.5 and one in-scene statement.
- The idea "the opt-out list records where we stopped" appears at l.174, l.178 and l.338. It's fine twice, but the third is a recap.
- l.296 and l.300 are two aphorisms back to back: "That didn't make its callers disappear." and "It isn't a reason to leave the implementation untyped forever." One is enough.
- l.267, "either list". l.265, "Mine". l.332, "'shape'". All are dangling references.
- l.336 has a semicolon in speech: "The two deferred helpers have owners; they don't get fixed by changing the default." The same goes for l.226 and l.261. Semicolons in dialogue read as written rather than spoken.
- l.186 and l.21 are fine.

## 7. Overall

Yes, I'd keep reading. The opening is fast and funny, the core bug is real and common, and Oded's "I converted the test out of catching the conversion" is the kind of line that sticks. Every compiler claim I tested reproduces on 7.0.2, except the world-consistency problem with `money.js`. The middle sags and the end recaps, but the bones are good.

**Top three changes, ranked:**
1. **Rebuild the Turn on a caller that was already opted out.** Have one of the legacy `@ts-nocheck` files (for example `lookup.js`, or a new legacy page handler) also `require("./slug")`. Then the broken default export goes green under Noam's policy exactly as designed, with no contrived edit that his own l.263 rule forbids. That's fairer to Noam, it lands harder, and it gives Eden's "take its known callers off that list" real force. If you keep Chen's version, at least make the hypothetical explicit at l.234 ("Chen reapplies the broken conversion on a scratch branch…").
2. **Fix the `money.js` inconsistency, and cut or tighten the `handle(42)` detour.** Give `money.js` an opt-out in l.186 and make the count five, or make it clear `money.js` didn't exist yet. Then compress l.188–230 into a few lines, or move it after the backfill. Right now it delays the Turn, overclaims at l.204 ("only the first problem"), and contains the chapter's muddiest exchange (l.220–230).
3. **Stop restating the rule.** Cut the third sentence of l.5 so l.108 is a discovery, not a callback. Collapse l.257, l.261 and l.300 to one in-scene statement, and make the Verdict add a decision rather than a recap. While doing that, fix the dangling references at l.265, l.267 and l.332, and drop Daniel's l.170.
