<!-- Verbatim report from a fresh, isolated targeted-recheck reader (Claude subagent), 2026-10-27. Input: draft 2 (SHA-256 1405bfd2…) plus a list of draft 1's problems; no other files. The reader rebuilt each repository state on TS 7.0.2 / Node 22. -->

# Targeted recheck: Chapter 24 draft 2

Short version: this draft is close. Every technical claim I could test reproduces on TypeScript 7.0.2. Five of the seven earlier problems are fixed or mostly fixed. What's left is about craft, not correctness: the Turn is telegraphed, the money coda's timeline is blurred, and one hypothetical leaves out the test the chapter itself restored. **Local edits only.**

## 1. First read

**Enjoyed**
- The cold open (L11–17): "One function. One test. No dependencies. I picked the boring one." / "The product pages are returning 500s." / "It still makes the slug." / "The route can't get far enough to ask it." It's fast and funny, and it sets the stakes in four lines.
- The reveal at L92–108. `typeof require("./slug")` prints `object`, and then two lines land: "The new test correctly checks a call nobody in that route makes" and Oded's "I converted the test out of catching the conversion." That second one is the best line in the chapter.
- L112: "I don't want this depending on the next person remembering which kind of import we argued about." It's a real engineer's reason, said in character.
- L195 (Noam): "I'd rather review that exception than hope the author remembers to opt in." This is the clearest statement of a position anywhere in the chapter.
- L265: "The compiler would be happy. The sitemap would still try to call the object." The Turn lands in plain words.

**Bored or skimmed**
- L177–201, the exception-list mechanics. Lines like "Lookup's owner can confirm its IDs separately. Sum needs its callers examined before we write a contract for it. Neither belongs to the slugger" (L197) and "Eden records `lookup.js` and `sum.js` on the migration list with their owners" (L199) read like ticket triage.
- L217–245, the `handle(42)` probe. It's accurate and short now, but it's still a side trip, and nothing later uses its payoff.
- L296–304, a run of four lecture lines (Chen, Daniel, Noam, Daniel), each a general rule.
- L310–327, the money coda. It reads like an epilogue tacked on after the story has resolved.

**Confused**
- L19: "They are eight months into the migration." "They" can be read as Eden (singular they) rather than the team.
- L199 says "migration list", L201 says "exception list", L277 says "my list". I had to infer these are the same list.
- L292: "The build copies it." No copy step is ever shown, and the printed tsconfig can't copy `scripts/`. I only understood Chen's L44 line ("Leave me the build directory") afterwards.
- L294: "With the broken default export, including the backfill reports TS2349." Which branch is this? It reads as a second scratch experiment, but that's never said.
- Money timeline. L310–323 shows `money.ts` converted and passing the check. Then L327 says "when I convert money" (future tense), and the Verdict (L333) says "Leave the money conversion for its own PR. Its parameter annotation can stay in this one." So did they convert it or not? It also follows Eden's "Keep its scope" (L308) directly.

**Scene I'd retell:** the `inspect.js` reveal (L92–110). The test passes because it reads `.default`; the route gets the whole object. Then Oded puts the old `require` test back so it can't happen again.

**When I understood the incident:** an experienced TypeScript reader sees it at L71 (`export default` against L53's `require`). L100 confirms it. That doesn't spoil anything, because the chapter isn't a whodunit and L94–98 is still a pleasure.

**When I saw the Turn coming:** at L203–210, the moment a `// @ts-nocheck` file that does `require("./slug")` appears. L213 (Noam) all but states the Turn: "The count says nothing about the files we're not checking." When Chen asks "And the sitemap?" at L255, it confirms rather than surprises. Showing the sitemap is fair play, but L213 gives the punchline away.

## 2. Technical verification

I rebuilt the repository from the fences, state by state, with `{"type":"commonjs"}` and the printed tsconfig, using tsc 7.0.2 and Node 22. Everything below reproduced.

**Verified**
- Initial all-JavaScript state with `checkJs: false`: exit 0. The JS test passes. The route returns `/products/green-chair`.
- `strict` is unset in tsconfig, yet TS7006 fires under `checkJs`, so strict really is on by default (L23).
- Default-export `slug.ts` plus the TS test: exit 0, and the TS test passes.
  - The emit contains `exports.default = slug;` (L104).
  - `inspect.js` in `dist/src` prints `object` / `function` (L94–98).
  - The route throws `TypeError: slug is not a function` (L100).
  - `tests/slug.require.test.js` fails on the first call (L110). The include only covers `tests/**/*.ts`, so this file is never compiled or checked. That's consistent with the text.
- `export =`: exit 0.
  - The emit ends `module.exports = slug;` (L126).
  - Both tests pass, and the route returns `/products/green-chair`.
  - The default import still works through `__importDefault` ("In this build, yes" is correctly hedged).
  - `import slug = require('../src/slug')` compiles and runs (L130).
- `checkJs: true` with the default export:
  - TS2349 `This expression is not callable.` at `slug(title)`, with the follow-up line "Type 'typeof import(".../src/slug")' has no call signatures" (L140).
  - TS7006 for `title`, `id`, `a`, `b` and `cents`.
  - The sitemap stays silent.
- `checkJs: true` with `export =`: exactly five TS7006 errors (title, id, a, b, cents), as L175 says. If you remove the sitemap's `@ts-nocheck`, it adds three more (titles, footer, title). So L213 is right that the sitemap would add errors.
- `@ts-check` on the route with `checkJs: false` checks that file alone (TS7006 on `title`) and nothing else (L185).
- After `@ts-nocheck` on lookup and sum and the JSDoc on `cents`, only the route's TS7006 remains.
- The probe:
  - `caller.ts` with `handle(42)` adds no error before the annotation (L225).
  - After the JSDoc annotation (placed above `module.exports = function handle`), it reports TS2345 `Argument of type 'number' is not assignable to parameter of type 'string'.` (L239).
- Probe removed: exit 0 ("The compiler is green too", L245 is true). Both loading tests pass, and `handle('Green Chair')` returns `/products/green-chair`.
- The Turn, with the default export restored:
  - Only the route reports TS2349. Nothing comes from the sitemap.
  - tsc still emits. The emitted route throws the TypeError. The sitemap throws before calling `footer` (I instrumented this; footer was never called). The old loading test fails (L253–259).
- The `.default` fix on the checked route: exit 0, and the route works. The sitemap still throws (L265).
- `export =` restored: exit 0. The route returns the URL, the sitemap returns `"/products/green-chair\nfooter"`, and both tests pass (L275).
- Backfill:
  - Run from the source tree, it fails (`Cannot find module '../src/slug'`), which fits Chen needing `dist`.
  - With `scripts/**/*` included and the default export: TS2349 in `scripts/backfill.js`.
  - With `export =`: exit 0, and `dist/scripts/backfill.js` prints `/products/green-chair` (L294).
- An imported file outside `include` is pulled into the program and checked (my test: `other/o.js` showed up in `--listFilesOnly` and reported TS7006) (L298).
- Computed `require(name)`, even with `const name = "./slug"`, gives `any` in checked JS. It passes when assigned to a `@type {number}` variable, while the literal `require("./slug")` control gives TS2322 (L304).
- `money.ts` with a named export: exit 0. The emit is `exports.price = price`, and `price-label.js` prints `12.5` (L323). The label really is checked: `price("1250")` gives TS2345. If `money.js` and `money.ts` both exist, tsc quietly prefers the `.ts`, so there's no stale-file error either way.

**Mismatches and nits**
1. **The `.default` hypothetical ignores the restored test (L263–267).** If Oded fixed the route with `require('./slug').default`, the compiler is green, but `tests/slug.require.test.js`, the test the chapter made a point of keeping, still fails (verified). So the PR would not slip through as written. Noam's "My default catches the route. It doesn't account for this other caller" is literally true of `checkJs`. Still, a careful reader will object "but the old test is red". This is also an unused chance for Oded (see 3e).
2. **L144, "You have more errors below it."** In tsc's output, `lookup.js` and `money.js` come *above* `route.js`; only `sum.js` comes below. Say "more errors" or "around it".
3. **L292, "The build copies it."** True only for a build step that is never shown. The printed tsconfig can't copy `scripts/`. One clause fixes it, e.g. "our build script copies `scripts/` into `dist`".
4. **L245, "Both loading tests and `handle('Green Chair')` pass."** A call doesn't pass; say it "returns `/products/green-chair`".
5. **Scope and the Verdict.** The PR turns `checkJs` on globally (it's `false` at L34; Noam flips it at L140) and adds `@ts-nocheck` to two unrelated files. Then L306–308 says "Can I have my one-function PR back?" / "Yes. Keep its scope." The Verdict's "Global `checkJs` and strictness stay on" (L333) hides that this is a project-wide change made in this PR. It isn't a technical error, but the record is inaccurate.

## 3. Earlier problems

**(a) Turn staged unfairly against global-checkJs-with-opt-outs: fixed.**
- The sitemap's opt-out predates the PR and is owned by another team (L201, L251: "keeps the opt-out it had before this PR").
- Nobody adds an opt-out to a checked caller.
- Noam explicitly forbids it at L277: "no adding an opt-out to a checked caller because the conversion broke it. That would turn my list into a way to merge failures."
- What the Turn now exposes is a real gap in his position: an *old* opt-out "wouldn't be a new change for me to review" (L267).
- What's left is the telegraphing problem from section 1, not unfairness.

**(b) A file in src falsified the count or exit-zero claim: fixed.**
- At the count, src holds slug.ts, route, lookup, sum, money, price-label and sitemap (`@ts-nocheck`), giving exactly five errors.
- The sitemap is explicitly accounted for (L213).
- `caller.ts` is removed before "The compiler is green too", which is exit 0 (verified).

**(c) The `handle(42)` detour: mostly fixed, still partly a detour.**
- It's now framed as "One probe" (L217), it's removed explicitly (L245), and its claims are accurate ("its caller has no string requirement to violate").
- The timeline is clean.
- But it still costs ~28 lines, and its lesson ("A useful type for its caller, and the route is still JavaScript", L241) is never used again.
- It's also odd that Chen, the backfill and operations voice, runs it.
- Either cut it to a few lines or tie it into the Turn (for example, the annotated route is what makes `.default` type-check cleanly).

**(d) The Principle was hard to apply: fixed.**
- L5 now gives a testable rule with a defined contract: "Keep their contract—what they load, pass and receive—or change and verify the callers too", plus a concrete `require('./slug')` example.
- L7 joins the halves: "A caller this run doesn't check supplies no compiler evidence. Keep its contract or run it."
- "Loosening" has become the concrete "switching `noImplicitAny` off for the whole program", and "two sides" is gone.
- Remaining quibbles:
  - "what they load" is still the weakest of the three words. "Get back from `require`" would be clearer.
  - L7 reads like four separate instructions in a row.
  - The Turn's real lesson (pre-existing opt-outs hide callers) is implied by "a caller this run doesn't check" but never named.

**(e) Oded didn't get his strongest form: mostly fixed.**
- He gets the best objection: "Are we saying I have to convert every caller before I can convert a leaf? That's the entire reason I started at the bottom" (L88). The answer vindicates leaf-first: "You can keep its export."
- He invents the fix (`export =`, L116), insists on keeping the old test (L112), and asks the sharpest challenge to Noam (L193).
- Two weaknesses remain:
  - He's handed the strawman "Or turn off `noImplicitAny` until the JavaScript is gone" (L181), which is refuted at once.
  - Leaf-first's real payoff is never shown: a typed leaf gives its signature to every checked JS caller, and the route now knows `slug` takes a string.
- The kept `require` test is also the thing that would catch the `.default` "fix" in the Turn. Letting Oded point that out would give him the win the chapter currently gives nobody.

**(f) Rule restated about five times; Verdict read as minutes: partly fixed.**
- The keep-the-caller's-interface idea still recurs at L114, L130, L269, L279, L300, L304, L314 and L325–327. Most of these add a new case (route, sitemap, `require(name)`, named export), but L279, L300 and L327 are pure repetition.
- The Verdict (L331–335) is still an action list: "Merge `export =`, both loading tests and the annotated route. Add the backfill to the check and the build… I'll keep the exception list with its owners. The catalogue team keeps the sitemap…"
- It's better than minutes, and Oded's closer ("And the old test stays old on purpose") is good. But it doesn't name the one decision the Turn earned: in a conversion PR, a caller on the exception list keeps its interface.

**(g) Dangling references: mostly fixed.**
- "my five", "My default" and "as Eden suggested" all resolve.
- Still loose:
  - "migration list" (L199) versus "exception list" (L201, L269, L331) versus "my list" (L277).
  - "That caller gets a member already" (L314): `price-label.js` hasn't been mentioned for 140 lines, and the fence that would identify it comes after the line.
  - "loading test(s)" (L245, L259, L275) is never introduced, though it's easy to infer from "the loading call" (L132).
  - "They" at L19.

## 4. Fairness and the Verdict

- Each position gets a fair hearing:
  - Noam: global checking means new files are checked by default, and exceptions are visible.
  - Eden: check what you can today, and preserve or verify the contract.
  - Oded: leaf-first, without inventing types for other people's code.
  - Chen: code outside the program.
- The Turn shows that per-file and global checking both miss an opted-out caller. Eden's L269 synthesis ("take each known caller off the exception list or keep the interface it uses") fits the evidence.
- `export =` is earned by the sitemap and the backfill. Including the backfill is earned by L294. The annotated route is earned by the probe.
- "Leave the money conversion for its own PR" is earned only if the money scene is clearly marked as a preview. Right now it isn't.

**Lines nobody would quite say**
- L296, Chen: "So importing the slugger doesn't tell the compiler who else imports the slugger." Awkward and lesson-shaped.
- L298, Daniel: "Correct. And a filename missing from `include` isn't proof that it stayed out." A teacher, not a colleague.
- L243, Eden: "The local `@ts-check` is redundant with our global setting. I'm leaving it to mark this file as checked." This goes against the model Noam just won (exceptions are marked, checked is the default), and nobody pushes back. Cut it, or let Noam object.
- L253, Noam: "TS2349 at the route. The check caught it." Stagey announcement.
- L327, Oded: "Then that label is the call I keep when I convert money." A summary line.

## 5. Line-level

**Manual-like narration**
- L100: "The route tries to call the object. Its error is…"
- L126: three flat sentences.
- L140: diagnostics narrated code by code.
- L199: "Each gets `// @ts-nocheck`."
- L294.

These are all short, but they cluster.

**Repetition**
- "keep" appears in L269, L304, L308 and L314 within forty lines ("Keep global checking", "keep what it expects", "Keep its scope", "Keep that member").
- "callable export" appears at L118, L175 and L269.
- "loading" is the chapter's most frequent noun.

**Copy flags**
- L19: ambiguous "They".
- L144: "below it" is inaccurate.
- L245: "pass" for a call.
- Inconsistent quotes: single in prose (`require('./slug')`, `handle('Green Chair')`) versus double in code.
- L146 introduces a fence with a colon where the other fences use none.

## 6. Verdict for the editors

**Local edits only.** The technical spine is correct in every state I rebuilt, and the earlier structural problems (a, b, d) are fixed.

Top three changes, ranked:

1. **De-telegraph the Turn and close its loophole.**
   - Cut or deflect Noam's L213 ("The count says nothing about the files we're not checking"). Consider showing only that the sitemap is on the list at L201 and holding its `require("./slug")` back until L255.
   - At L263–267, acknowledge that the kept `require` test would also go red under the `.default` fix. Give that beat to Oded: his old test catches it, unless someone "fixes" the test the same way, which repeats the original mistake.
   - This repairs a hole a careful reader will find, and it gives Oded his strongest moment.
2. **Fix the scope and timeline of the ending.**
   - Mark the money conversion as next-PR work, or drop the `money.ts` fence and keep it as Eden's point.
   - Make the Verdict state what this PR actually changes: global `checkJs` goes on with three listed exceptions, and an existing exception keeps its interface.
   - Use one name for the list.
   - Add one clause explaining "The build copies it" (L292).
3. **Trim the lecture clusters.**
   - Compress L296–304 to two lines.
   - Shorten or connect the `handle(42)` probe (L217–245).
   - Cut L243's redundant-`@ts-check` line.
   - Drop the pure restatements at L279, L300 and L327.

The repository I rebuilt is in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch24-readers/recheck/work/repo`. It's left in the backfill-excluded, `money.ts` end state.
