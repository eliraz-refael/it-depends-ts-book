# Chapter 24 — Migration Strategies (working title)

Status: **DRAFT 3 FROZEN; FINAL PRINCIPLE-ONLY READ AND DIFF REVIEW PENDING**, 2026-10-27. The settlement below governs where it differs from the original proposal.
Branch: `codex/chapter-24-migration-strategies`, based on `origin/main` `14a6c88` (Ch23's merge).
File: `book/04-the-real-world/01-migration-strategies.md`. It opens Act IV, The Real World.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if the subject on the page is really a matter of
  opinion among competent owners. Otherwise it ends in a Verdict. Codex's challenge proposes which,
  with evidence. We settle it before drafting.
- **The reader should leave able to plan the next file they convert.** They should know which
  calls the compiler checks while JavaScript and TypeScript live side by side, and which it can't
  check. They should know which conversions change what `require` returns and which don't, and what
  TypeScript 7's defaults do when they first switch on JavaScript checking.
- **Act IV is "the real world".** The scenes happen in a repository with history, half-finished
  work and callers nobody wrote this year. Eden's bio is the act's spine: "What's the migration
  path?"

## What earlier chapters already settle (do not repeat)

- **Ch1:** `any` vs `unknown`, and how `any` spreads. Ch24 can show an inferred `any` from a JS file
  but must not re-argue `any`.
- **Ch2:** type assertions. A conversion PR full of `as` is a fair aside, not a topic.
- **Ch4:** keeping existing enums "unless a change solves a concrete problem", with migration
  cost counted. Don't re-argue enums.
- **Ch8:** `@ts-expect-error` as a type test. Ch24 may use it as a migration ratchet (unused
  directives are TS2578). Ch26 owns type tests.
- **Ch13:** declaration files, `declare module`, and "a declaration describes, it doesn't install".
  A hand-written `.d.ts` that lies about JavaScript (verified below, mechanism 6) is Ch13's
  territory. One line at most, and only if a scene needs it.
- **Ch16:** parsing at the boundary. A migration boundary is between files, not between the
  program and the outside world. Don't merge the two ideas.

**Later chapters to stay clear of:**
- **Ch25 (monorepo type sharing):** project references, workspaces, path aliases, published types.
- **Ch26 (testing typed code):** type tests, `expect-type`-style assertions, test strategy.
- **Ch27 (performance vs safety):** compile times, editor speed. **No timing claims**; counts are
  fine.
- **No bundler, ESLint, Babel, `ts-migrate` or codemod claims** without a primary source, and then
  one line at most. No claims about Node's type stripping or `require(esm)` unless Codex verifies
  them on Node 22.23.4 and the chapter needs them.

## Verified mechanisms (TS 7.0.2, Node 22.23.4, book profile)

The probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.
Every case uses a `package.json` with `"type": "commonjs"` and
`--module Node16 --target ES2022 --types ""`, with `--allowJs` where JavaScript is in the program.

1. **Converting `module.exports = fn` to `export default fn` changes what `require` returns, and the
   compiler doesn't notice.**
   - `slug.ts` has `export default function slug(title: string): string`. The untouched `route.js`
     has `const slug = require("./slug");` and calls `slug(title)`.
   - Compiled with `--allowJs --strict` and no JavaScript checking, `tsc` exits 0. The emit is
     `exports.default = slug;`. At runtime `route.js` throws `TypeError: slug is not a function`.
   - A converted TypeScript test that writes `import slug from "./slug"` passes, because the
     emit's `__importDefault` reads `.default`. **The converted file's test is green; its old
     callers are broken.** That's the candidate hook.
2. **Checking the JavaScript caller catches it.**
   - With `--checkJs`, or `// @ts-check` at the top of `route.js` alone, the call is
     `TS2349: This expression is not callable.` followed by
     `Type 'typeof import("…/slug")' has no call signatures.`
   - **TypeScript 7 defaults `strict` to on.** Switching on `--checkJs` without `--strict` still
     reports `TS7006: Parameter 'title' implicitly has an 'any' type.` in the JavaScript. Only
     `--strict false` or `--noImplicitAny false` leaves the TS2349 alone. That is the real cost of
     "just turn on checkJs", and why teams don't.
   - `--esModuleInterop false` is gone: `TS5108: Option 'esModuleInterop=false' has been removed.`
3. **Two conversions keep the shape.**
   - `export = slug;` emits `module.exports = slug;`. The old `require` works, and TypeScript
     callers can still write `import slug from "./slug"` (or `import slug = require("./slug")`).
   - **Named exports already keep it.** `module.exports = { price }` converted to
     `export function price(…)` emits `exports.price = price`, and `const { price } =
     require("./money")` keeps working under `--checkJs` too. Only a module whose `module.exports`
     *is* the value (a function, a class, an object used whole) changes shape under `export
     default`.
4. **A TypeScript caller of unconverted JavaScript trusts what JavaScript implies.**
   - With `--allowJs`, `import handle = require("./route")` gets `handle`'s type inferred from the
     JavaScript, parameter `any`. `const s: string = handle(42)` compiles.
   - Without `--allowJs`: `TS7016: Could not find a declaration file for module './route'. '…/route.js'
     implicitly has an 'any' type.`
5. **JSDoc is checked in a `// @ts-check` file on TypeScript 7.** `@typedef {import("./slug").Post}`
   and `@param {Post} post` work: `handle({ title: "x", id: "7" })` gives
   `TS2322: Type 'string' is not assignable to type 'number'.` (A probe that mixes `module.exports =
   {…}` with `exports.extra = 1` gives TS2309 and TS2339 on 7.0.2. Don't use that pattern unless
   Codex checks how earlier versions behaved and the chapter needs it.)
6. **A hand-written `.d.ts` beside JavaScript can lie** (`findUser(id): { name: string }` over a
   function that returns `undefined`). It compiles and throws `TypeError: Cannot read properties of
   undefined (reading 'name')`. Ch13's territory; see above.
7. **`@ts-expect-error` ratchets; `@ts-ignore` doesn't.** An unused `@ts-expect-error` is
   `TS2578: Unused '@ts-expect-error' directive.` An unused `@ts-ignore` is silent. Eden's bio has
   the intern's `@ts-ignore` that hid a null warning. Use it only if a scene needs the ratchet.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise above.

**The incident (mechanisms 1–2), as the hook.** The storefront service is half JavaScript, half
TypeScript, eight months into a migration. Oded converts `slug.js`, a leaf with one function and a
test. It's a textbook leaf-first PR. He converts the test too. `tsc` is green, the test is green,
and review approves "a mechanical rename". The product pages 500. The cause is a JavaScript route
nobody touched, calling a module that now exports `{ default }`.
- The reveal should be a small detective moment like Ch22's and Ch23's. The compiler was right about
  everything it was shown. Nobody showed it the caller.
- **The converted test is the twist.** Testing the converted file through `import` is exactly what
  hides the change.
- Fixing the incident (`export =`, or `require("./slug").default`) takes one line. The fix is not
  the argument.

**The argument: what does a team do before the next conversion?** All of these are competent:
- **Keep converting leaf-first, and keep the shape** (Oded): convert `module.exports = x` as
  `export = x`, or as named exports, until the last JavaScript caller is gone. Its cost is that
  every converter has to know the rule, and nothing enforces it.
- **Switch on `checkJs` for the whole tree** (Noam): every `require` gets checked. Its cost, on TS 7,
  is the implicit-`any` flood (mechanism 2). The scene should count it on the fictional repository.
  Then either `noImplicitAny` comes off for JavaScript, or the team stops for weeks.
- **Check the doorway, not the house** (Eden): before converting a file, find every file that
  `require`s it and add `// @ts-check` to those callers in the same PR. Fix only what that reports.
  Its cost is that the callers' implicit `any`s arrive in the same PR. Does it scale? Who finds the
  callers? (`grep` misses a computed `require`.)
- **Chen's hole:** callers outside the program. These include a script in `bin/`, a cron entry or
  another repository. No compiler setting checks them. This is Eden's "mobile app from 2019". It's
  the honest limit of every option above, and it may be what the ending turns on.
- **Dima** weighs them, if the scene needs a mediator. He's barely been used since Ch13.

**What I don't know, and Codex should attack first:**
- **Is this decision honestly opinionated?** Leaf-first vs checkJs-first vs check-the-callers is a
  classic strategy argument. Find the conditions on the page that would decide it. How many
  `module.exports = value` modules are left (count them)? How many implicit `any`s does `checkJs`
  report? Are all callers inside the program? Who reviews the conversion PRs? If those decide it,
  it's a Verdict. It's open only if, after the counts, competent owners still disagree on what the
  team values.
- **Does the incident teach migration *strategy*, or only a CommonJS interop trivia item?** I think
  it's strategy, because it's the boundary every incremental migration lives with: converted code
  and unconverted callers in one running program, checked by rules that see only part of it. Test
  that. If it's trivia, propose a better incident, verified.
- **Is CommonJS still a fair setting in a 2026 book?** I think yes. A JavaScript codebase eight
  months into a migration is plausibly CommonJS, and the chapter says so on the page. Disagree with
  evidence if you think otherwise.

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Daniel Compiler.** His bio is this chapter: "acceptance doesn't settle runtime
behavior", "a missing project flag or declaration file can make his tidy reproduction answer a
different question", and "Eden has learned to bring the repository configuration along". He hasn't
set a Principle since Ch20. Codex may argue for Eden, the migration veteran, if the Principle is
better as experience than as a compiler fact. Say why.

**Its direction, not its wording:**
- The compiler checks the files it's given, with the settings it's given. During a migration, a
  converted file and its unconverted callers meet at a `require`. The compiler checks that meeting
  only if the caller is checked too.
- Before converting a file, list who loads it. If the conversion changes what `require` returns,
  every caller must be checked in the same run, or the conversion must keep the shape. A default
  export of something `module.exports` used to *be* changes it; named exports and `export =` don't.
- A green test that imports the converted file proves the converted file, not its old callers.
- **Give a test, not a mood.** Every condition must be checkable from the Principle alone, with no
  undefined terms. "Shape" needs one plain sentence, or a better word.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** `money.js` has `module.exports = { price, tax }`. The PR converts it to
  `export function price…` and `export function tax…`. Two JavaScript files `require` it. What must
  the PR check?
- **(b)** `mailer.js` has `module.exports = class Mailer {…}`, and the PR converts it to
  `export default class Mailer`. Its TypeScript test passes. Is it safe?
- **(c)** A lead proposes switching on `checkJs` for the whole repository on TypeScript 7 this
  sprint. What will the first run report, and what does the team decide before merging it?
- **(d) Transfer:** the converted file is also loaded by `scripts/backfill.js`, which isn't in
  `tsconfig`'s `include`. What does the rule say?

## Cast

- **Daniel Compiler** (he): the Principle, and the person who explains what the compiler was and
  wasn't shown.
- **Eden Legacy** (he): the migration veteran. This is his chapter. He arrives with the repository
  configuration, and "I've seen this fail at scale" must come with a concrete failure, not a
  catchphrase. He was heavy in Ch22, but Act IV opens on his subject.
- **Oded Shipley** (he): converts `slug.js`. He's competent, and the PR is the textbook leaf-first
  one. He argues for keeping the pace, with the shape rule.
- **Noam Kiperman** (he): `checkJs` everywhere. Last seen in Ch20. He mustn't be a strawman: he
  should know about the implicit-`any` count and argue it's worth it.
- **Chen Override** (he): the callers outside the program.
- **Optional:** Dima Bridge (he), or Gil Benchmark (he) for the counts.

**Rested:** Eli, Guy, Linoy, Dafna and Sahar (Ch23); Liron (Ch22). Five or six people. Check every
pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first: the 500 and the green test should be the scene readers retell.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- Oded is competent. The conversion is a plausible mistake, not a joke at his expense.
- One running repository with small counts, and every fence checked. Multi-file examples are fine.
  Label each file in its fence, as Ch13 does.
- No timing claims. The service and its repository are fictional, and the page says so.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter24.cjs` compiles every TS and JS fence on the book profile, as multi-file programs
with their `package.json`. Competing designs are separate programs.

Runtime groups:
- the incident: the converted test passes, and the old caller throws `TypeError`;
- each repair the scenes compare (`export =`, named exports, a `.default` caller), with the same
  outputs where the text claims them;
- any count the text prints (implicit `any`s, remaining `module.exports = value` modules), computed
  by the check from the fenced repository rather than typed by hand.

Compiler cases: every diagnostic quoted verbatim (TS2349, TS7006, TS7016, TS2578 and TS5108 as
used), plus the success cases the text relies on, with selected inferred types asserted.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [x] Codex challenges this plan: is the decision honestly opinionated, does the incident teach
  strategy rather than trivia, and which ending. Disagreements are settled on evidence
  ([challenge](ch24/CODEX-PLAN-CHALLENGE.md)).
- [x] Codex drafts and self-reviews ([record](CH24-REVIEW.md), [snapshot](ch24/DRAFT3-SNAPSHOT.json)).
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [x] Draft 3 checks durable; full suite green on the frozen manuscript (Ch24 12 / 31 / 15; book 413 / 564 / 269). Recheck any further revisions.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-27)

Codex's [challenge](ch24/CODEX-PLAN-CHALLENGE.md) (`34a094a`) reproduced all seven mechanisms (37
compiler cases plus runtime assertions, untracked in `.probe/codex/`). I re-ran the three claims
that change the argument on the book profile: a computed `require(name)` in a `// @ts-check` file
compiles with no diagnostic; a `route.js` listed in `exclude` but imported by an included root is
still in `--listFilesOnly` and still reports TS2349; and a caller marked `// @ts-nocheck` hides the
incident completely under a global `--checkJs` (`tsc` exits 0).

**Adopted:**
- **A local Verdict.** Leaf-first, a compatible export and a checking scope answer different
  questions. They aren't three rival strategies, and with the counts on the page no competent owner
  is forced into a stalemate. Don't stage one.
- **The incident stays, with Codex's correction to the reveal.** "Nobody showed the compiler the
  caller" is false: under `allowJs`, `route.js` is in the program and is emitted. It just isn't
  checked. **Included, checked and actually constrained at this call** are three different things.
  That distinction is the chapter's transferable lesson, and Daniel's to state.
- **The retold scene is "the test was converted out of catching the conversion".** Oded converted
  the source and its test together, as ordinary maintenance. The default-import test accurately
  tests the new contract; it no longer tests the old one. Oded keeps the old `require` test
  himself. Show the two values briefly (`exports.default` vs the whole object).
- **The repair is a combination:** `export = slug`, the old `require`-shaped test kept, and the
  caller checked with an honest `@param {string} title`. That annotation then makes the TS caller's
  `handle(42)` fail with TS2345. The boundary got a truthful type without renaming the route.
- **Corrections A–G** all stand:
  - `noImplicitAny: false` is program-wide, not "for JavaScript";
  - a computed `require` defeats both `checkJs` and a caller search (one qualification);
  - `exclude` doesn't remove an imported file;
  - a compatible loading shape isn't compatible behaviour;
  - named exports keep the demonstrated member calls, not every object contract;
  - `@ts-expect-error` isn't code-specific;
  - TS 7's `strict` is a default, not an override of an explicit `strict: false`.
- **The project's options and its runtime arrangement go on the page early.** TS compiled to
  CommonJS, and Node runs the output. Don't make a prevalence claim, and don't get into native ESM,
  bundlers, type stripping or `require(esm)`.
- **The cuts:** the lying `.d.ts` (Ch13), the `esModuleInterop` flag, and the `Post` typedef. The
  `@ts-expect-error` ratchet appears at most as one Take, and only if somebody actually proposes a
  suppression.
- **Daniel's Principle, Eden's rollout,** with five people: Daniel, Eden, Oded, Noam and Chen, all
  he. No Dima or Gil.
- **Chen's script is a local `scripts/backfill.js` that no root imports,** established before anyone
  claims coverage. A module's imports don't list its importers. Eden repairs it by adding it to the
  run (TS2349), or by executing its old call. Don't claim "no compiler setting checks it". An
  external consumer gets one line at most, as the reason the compatible export matters.
- **Codex's reader cases (a)–(d),** with (d) specifying that the backfill isn't a root and isn't
  reachable from one. Use (c) without predicting a count.

**Settled: what the census decides.** I'm adding one verified fact that resolves the global-vs-scoped
question without inflating any number:
- **Noam gets his win.** Global `checkJs` stays on with strictness kept. A file the team won't fix
  today gets `// @ts-nocheck`, so the unchecked files become a visible, greppable list instead of
  an invisible default. Codex verified that this combination works. Because the opt-out costs one line
  per file, the backlog's size doesn't decide anything. Print the fixture's real count and don't
  turn it into an effort estimate.
- **The opt-out list is where the incident hides again.** If `route.js` had been opted out as
  legacy, the global check would be green on the broken PR. Exit 0, verified. So Eden's doorway rule
  survives inside Noam's default: **a conversion PR removes the opt-out from every known caller of
  the converted file, or keeps the export compatible.** That makes it one rule rather than a choice
  between policies.
- **Use this as the Turn or a late beat, at Codex's judgement.** It should come after Noam's check
  looks like it settled things, and before or alongside Chen's backfill. If both together are too
  much, the opt-out beat outranks the backfill: it's the one that joins the two positions. The
  backfill can shrink to a line.

**The Principle must be shorter than Codex's proposition** and recognisably Daniel's. It should be a
testable rule, not a checklist. Its direction:
- before converting a file, keep what its existing callers load, pass and receive, or change and
  verify those callers with it; define "contract" in one plain clause;
- `allowJs` includes JavaScript, and `checkJs` or `@ts-check` checks it; a file that's included
  but not checked is still running;
- a test written against the new import doesn't test the old loading call.

Don't put the opt-out beat or the backfill in the Principle. They belong to the scenes.

**Budget:** 12–14 labelled fences, one repository, 2,300–3,200 words.

**Validation:** as planned, plus runtime groups for the old `require` test across all three module
versions; compiler cases for TS2345 on the TS caller, the computed `require` (no diagnostic, runtime
TypeError), excluded-but-imported, the backfill added as a root, and the opt-out hiding the
incident. Compute any count the page prints from the fenced repository.

## Draft 1 handoff (2026-10-27)

The opt-out is the Turn; the backfill and computed loader qualify coverage briefly. The original JavaScript loading test executes directly against the built output, outside the compiler roots; the converted TypeScript test is compiled. That arrangement is printed up front, and the Turn keeps the old runtime test failing even when the compiler exits zero. Both tests pass after the compatible-export repair. This distinction prevents a silently omitted diagnostic from making the opt-out demonstration appear stronger than it is.

The census remains four untyped parameters. Noam gets the global default, Eden owns the named exceptions and the conversion-specific caller rule, and Oded retains leaf-first work and the old loading test. All twelve mixed-language fences are covered. Independent readers and formal review are pending; the self-review records possible pacing and setup issues rather than claiming they are settled.


## Draft 2 after the first review (2026-10-27)

The [draft-1 review](ch24/CLAUDE-REVIEW.md), committed at `30fa282`, replaces the original route-opt-out Turn. The route remains checked. A legacy sitemap, already opted out for unrelated footer work, exists before the conversion. Chen explicitly reapplies the broken export in scratch: the route reports TS2349 and the sitemap reports nothing, while both runtime calls fail. Repairing only the route to read .default makes the compiler green but leaves the sitemap broken. Export-equals repairs both without taking over the catalogue team's work. Noam's checking default keeps its demonstrated win.

Money and its label exist throughout. Its cents parameter is the fifth TS7006; Oded adds its JSDoc annotation before the later green runs. The validator now derives every migration state from the full established repository. The shortened numeric-call probe distinguishes an accepted call from a green program. Oded proposes the compatible export, Daniel's Principle names the implementation/caller contract and missing compiler evidence, and the Verdict assigns concrete work instead of repeating the rule.

Draft 2: 12 fences / 27 compiler cases / 14 runtime groups; whole book 413 / 560 / 268. Snapshot: [DRAFT2-SNAPSHOT.json](ch24/DRAFT2-SNAPSHOT.json). The first review and both initial readers are complete; the revised Principle and Turn await Claude's targeted recheck. Draft 1's counts and original proposal above are historical.


## Draft 3 after the targeted review (2026-10-27)

The [second review](ch24/CLAUDE-REVIEW-2.md), committed at `0a121c7`, calls for local edits only. Oded now objects that the retained require test still fails after a route-only .default repair. Chen's hypothetical also rewrites that test; only then do both tests agree while the sitemap remains broken. The validator executes both states. The existing sitemap exception is planted earlier, but its fence waits for the Turn.

The current PR explicitly merges the compatible slug export, global checking, parameter annotations and new exceptions. The money.ts conversion is a separate branch check for the next PR, not part of this merge. The Verdict names the earned rule for callers left on the exception list. The Principle covers unloaded files even with @ts-check and narrowing the checked scope instead of weakening noImplicitAny program-wide. The late coverage exchange is two lines, and the numeric probe now links to the typed leaf's benefit for checked JS callers.

Draft 3: 12 fences / 31 compiler cases / 15 runtime groups; whole book 413 / 564 / 269. Snapshot: [DRAFT3-SNAPSHOT.json](ch24/DRAFT3-SNAPSHOT.json). A final Principle-only reader and diff review remain; no new full reader is requested.
