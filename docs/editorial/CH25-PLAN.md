# Chapter 25 — Monorepo Type Sharing (working title)

Status: **PLAN WRITTEN; AWAITING CODEX'S CHALLENGE**, 2026-10-27.
Branch: `codex/chapter-25-monorepo-type-sharing`, based on `origin/main` `caf7eba` (Ch24's merge).
File: `book/04-the-real-world/02-monorepo-type-sharing.md`.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict. Codex's challenge proposes which, with
  evidence. We settle it before drafting.
- **The reader should leave able to set up, or fix, how the packages in their own repository reach
  each other.** They should know:
  - that the compiler identifies a type by the file that declares it;
  - which routes into a package exist (its `exports`, a relative path, a `paths` alias, a custom
    condition);
  - what a stale build does to `tsc -p` and what `tsc -b` changes;
  - which file the runtime actually loads.
- **Act IV is "the real world".** The repository has history: a package that grew, an export
  somebody needed and didn't have, and a deploy step nobody on the page wrote.

## What earlier chapters already settle (do not repeat)

- **Ch2:** type assertions. `as unknown as Money` is the tempting fix here. Ch2 owns why a double
  assertion is a promise, so one line here, plus the stack trace.
- **Ch13:** declaration files and "a declaration describes, it doesn't install". A built `.d.ts`
  is a declaration file. Don't re-teach `declare module`.
- **Ch15:** brands, and "the declaration-specific identity of a `unique symbol` key" (Ch15 l.86).
  Ch25 can call back to it in one line ("Ch15's brand was one declaration; here there are two"),
  but mustn't re-argue brands.
- **Ch16:** parsing at the boundary. Its plan deferred "monorepo schema sharing" here. A shared
  *type* between a web client and an API is checked at one commit, while the two are deployed at
  different commits. That's Ch16's door, seen from the repository. **One beat at most**, and only
  if Codex finds it earns its place (see the open questions).
- **Ch24:** `allowJs`, `checkJs`, `include`, and "included, checked and constrained". Ch25's
  programs are all TypeScript. Don't reopen JavaScript checking.

**Later chapters to stay clear of:**
- **Ch26 (testing typed code):** type tests and test strategy.
- **Ch27 (performance vs safety):** project references are usually sold on build speed. **No
  timing claims**, and don't sell `tsc -b` as faster. Ch25's reason for it is correctness (build
  order, and declarations that aren't stale).
- **No bundler, package-manager, Turborepo, Nx or Docker claims** without a primary source, and
  then one line at most. "The deploy copies `node_modules`" is fine as a fact *about the fictional
  repository*, verified with `cp -RL` below. It isn't a claim about any tool.

## Verified mechanisms (TS 7.0.2, Node 22.23.4)

The probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.
- **Layout:** `packages/money`, `packages/cart` and `apps/api`, with
  `node_modules/@shop/{money,cart}` symlinked to the packages, the way a workspace links them.
- **Packages:** every `package.json` has `"type": "module"`, and each package's `exports` is
  `{ ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }`.
- **Compiler:** `--target ES2022 --module Node16 --types ""`.

1. **One package reached by two routes is two types, and for a class, two classes.**
   - `money/src/index.ts` exports `class Money { #cents: number; … plus(other: Money) … }` and a
     structural `interface Line`. Money and cart are built to `dist`.
   - `apps/api/src/main.ts` imports `Money` and `Line` from `"../../../packages/money/src/index.js"`
     (a relative path into the source), and `shipping(): Money` and `firstLine(): Line` from
     `"@shop/cart"`. Cart's `dist/index.d.ts` imports `@shop/money`, which resolves through `exports`
     to `money/dist/index.d.ts`.
   - `new Money(1000).plus(shipping())` gives:
     `TS2741: Property '#cents' is missing in type 'import("…/packages/money/dist/index").Money' but required in type 'import("…/packages/money/src/index").Money'.`
     **The message prints both paths.** That's the detective clue on the page.
   - `const l: Line = firstLine()` compiles. **Structural types cross the two routes silently.**
     Only nominal things fail: `#private` (and `private`) members, and `unique symbol` brands.
   - The same split with Ch15's brand (`declare const centsBrand: unique symbol`) gives TS2345 and
     TS2322: `import("…/dist/index").Cents` vs `import("…/src/index").Cents`, with "Property
     '[centsBrand]' is missing".
2. **The compiler is right: the runtime holds two `Money` classes.**
   - `shipping() as Money` gives `TS2352: Conversion of type '…/dist/index").Money' to type
     '…/src/index").Money' may be a mistake…`. Ch2's double assertion `as unknown as Money`
     compiles.
   - Built with `--rootDir ../..`, the API's output contains its **own compiled copy** of money
     (`out/packages/money/src/index.js`) beside cart's `dist` copy. Running it throws
     `TypeError: Cannot read private member #cents from an object whose class did not declare it`,
     with the stack frame in the API's copy of `Money.plus`.
   - So the error isn't the compiler being pedantic about paths. **It predicted the crash.** That's
     the candidate Turn, or its first half.
3. **TypeScript 7 objects to the route before the types do, if the app emits.**
   - The same relative import in a tsconfig project with `outDir` and no `rootDir` gives:
     `TS5011: The common source directory of 'tsconfig.json' is '../..'. The 'rootDir' setting must be explicitly set to this or another path to adjust your output's file layout.`
     It also prints `Visit https://aka.ms/ts6 for migration information.`
   - With `noEmit`, there's no TS5011, only the TS2741.
   - **A `paths` alias to another package's source** (`"@shop/money": ["../../packages/money/src/index.ts"]`)
     hits the same TS5011 when emitting. With `rootDir` set, it gives TS6059 ("is not under
     'rootDir'"). The alias applies to **every** import of `@shop/money` in the program, including
     the one inside cart's `.d.ts` (`--listFilesOnly` shows only `money/src/index.ts`). So a whole-name
     alias gives one route, to source, and the API emits a copy of money. The emitted import stays
     `"@shop/money"`, and at runtime it resolves to `dist` through the workspace link.
   - **Any scenario that uses the relative route must decide how the API got past TS5011**: by
     `noEmit` with another runner, or by a `rootDir` widened in the repository's history. Show it,
     and verify it.
4. **The package's `exports` is its interface, to the compiler and to Node alike.**
   - `import … from "@shop/money/src/index.js"` and `"@shop/money/dist/index.js"` both give
     `TS2307: Cannot find module '…' or its corresponding type declarations.` under `Node16`, and
     also under `--module preserve --moduleResolution bundler`.
   - Node refuses the same subpath:
     `ERR_PACKAGE_PATH_NOT_EXPORTED Package subpath './dist/index.js' is not defined by "exports" in …/node_modules/@shop/money/package.json`.
   - **A relative path skips `exports` entirely.** That's the plausible human cause: the export
     you needed wasn't there, so you went around the door.
5. **A stale build: `tsc -p` checks against old declarations; `tsc -b` doesn't.**
   - Money is `composite`. The API's tsconfig has `"references": [{ "path": "../../packages/money" }]`.
   - **Before money is built:** `tsc -p apps/api` gives `TS2307: Cannot find module '@shop/money'…`
     through `exports`. (Not TS6305, which needs a relative import into the referenced project.)
     `tsc -b apps/api` builds money, then the API, exit 0, and it runs `$12.50`.
   - **Change `format(cents)` to `format(cents, currency)` in money's source.** `tsc -p apps/api`
     still **exits 0**, against the stale `dist/index.d.ts`. `tsc -b apps/api` rebuilds money and
     reports `TS2554: Expected 2 arguments, but got 1.` (exit 2). `--verbose` names each project and
     why it's out of date.
6. **A custom condition sends every importer in the program to source: one route, live types.**
   - Add `"@shop/source": "./src/index.ts"` first in money's `exports`, and pass
     `--customConditions @shop/source`.
   - `--listFilesOnly` shows `money/src/index.ts` and no `money/dist/index.d.ts`, **for cart's
     import too**, and `new Money(1000).plus(shipping())` compiles. Without the condition, both
     resolve to `dist`.
   - The runtime still takes `default` (`dist`), so the program's types come from source while its
     code runs the build. That's fine only while something builds before it runs.
7. **Exporting source to Node works in the workspace and fails once it's copied.**
   - With money's `exports` as `"./src/index.ts"`, `node apps/api/src/main.ts` prints `$12.50` on
     Node 22.23.4, with no flag, because the symlink's real path is outside `node_modules`.
   - `node --preserve-symlinks …` throws
     `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING: Stripping types is currently unsupported for files under node_modules`.
   - So does the built API run against a **copied** `node_modules/@shop/money` (`cp -RL`), the way a
     deploy step that copies dependencies leaves it.
   - `tsc` itself is happy with the `.ts` export (exit 0).
8. **Exit codes on 7.0.2:** 2 when emitting with errors, and also for config errors such as
   TS5011. `--noEmit` with type errors gives 1 (TS2307 above).

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise above.

**The puzzle (mechanisms 1, 2 and 4), as the hook.** "The compiler says `Money` isn't a `Money`."
- The shop's monorepo has `packages/money` (the `Money` class with `#cents`, which Guy would
  recognise, but he's resting), `packages/cart` and `apps/api`.
- Idan is at the door, in her element: the API parses an amount from a request. She needs
  `parseMoney`, and money's index doesn't export it. `@shop/money/src/parse.js` is TS2307, so she
  imports it by relative path. That's a competent shortcut, made for a good reason.
- The PR fails with TS2741, and the message prints the same class name twice with two paths.
- **The tempting fix is the double assertion.** It compiles, and the cart total throws `Cannot read
  private member #cents`. Gilad asks for the stack trace, and the trace has the same two paths as
  the error. The compiler wasn't confused about paths. It was telling them the program has two
  `Money`s, and the runtime agreed.
- **The structural `Line` that crossed silently** can be the beat that makes the reader
  uncomfortable: the same split exists for every type the API imports that way, and only the classes
  and brands complain.
- The fix for *this* PR is small: export `parseMoney` and import it from `@shop/money`. **The fix is
  not the argument.**

**The argument: what does each consumer's import of a package resolve to, and who builds it?**
The team has to choose how packages reach each other, so the next missing export doesn't send
someone around the door. These are all competent:
- **Built declarations, in order** (Dima, as the tech lead who owns the repository setup): `exports`
  points at `dist`. Every package is `composite`, with `references`, and CI and local checks run
  `tsc -b`. Its costs:
  - a build step before every check;
  - `tsc -p` on one app is quietly stale (mechanism 5), so somebody has to remember which command to
    run.
- **Live types from source** (Linoy): the custom condition (mechanism 6), so every importer in the
  program reads `src` and nothing is ever stale. She may push further and export source to Node,
  since Node 22 runs it (mechanism 7). Its costs:
  - the runtime still needs the build, or else the copied-deploy failure;
  - every tsconfig must carry the condition, or that program goes back to `dist`. **That's a second
    route again**, if one program uses the condition and another doesn't.
- **Gil counts:**
  - how many cross-package relative imports the repository has;
  - how many compiled copies of money end up in the API's output;
  - how many types crossed silently.
  Counts, not timings.
- **Sahar**, optional: "Why wasn't it exported?" The missing export *was* the incident. A package
  whose `exports` doesn't cover its callers' needs will be routed around, whatever the build does.
- **The honest limit, as Chen's question if he weren't resting:** Ch16's door. Sharing a type
  between `apps/web` and `apps/api` checks both at one commit, but they deploy separately. One beat,
  at most, if it earns its place.

**What I don't know, and Codex should attack first:**
- **Is the decision honestly opinionated?** "Source vs built for internal packages" is a live
  argument in 2026. Find the conditions on the page that would decide it:
  - Does anything run the package with plain Node after a copied deploy?
  - Is anything published outside the repository?
  - How many programs would need to carry the condition?
  - Does the team's one check command build first?

  If those decide it, it's a local Verdict, and I expect one: one entrance per package, through
  `exports`, every program resolving it the same way, `tsc -b` in CI, and the runtime entrance
  pointing at whatever the deployed runtime can execute. It's open only if competent owners still
  disagree after the counts.
- **How did the relative route get past TS5011 (mechanism 3)?** The scene has to show a plausible
  configuration (`noEmit` with Node's type stripping, a `rootDir` widened long ago, or something
  better) and verify it. If it can't be made natural, propose a different second route (a whole-name
  `paths` alias can't produce two routes, per mechanism 3), verified.
- **Is the hook teaching monorepo type sharing, or a class-identity trivia item?** I think it's the
  core of the subject, because sharing a type in a monorepo is choosing which file declares it for
  each consumer, and the puzzle is what happens when two consumers choose differently. Test that.
- **Does Ch16's version-skew beat belong?** It's real and it's the deferred item, but it's a different
  mechanism (deploy timing, not module resolution) and may split the chapter. Say keep or cut, with
  a reason.

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Gilad Stacktrace.** "Show me the stack trace" is literally the reveal: the
trace and the compiler print the same two paths. He hasn't set a Principle since Ch21. Codex may
argue for Daniel (the resolution mechanics), but Daniel just did Ch24, and the Principle here is
better as an operator's rule than as a compiler fact.

**Its direction, not its wording:**
- The compiler identifies a type by the file that declares it, and Node identifies a module by the
  file it loads. Two routes into one package give you two of everything that package declares. The
  structural ones cross without complaint, and the nominal ones (classes with private members,
  brands) don't.
- Give each package one entrance, its `exports`, and make every consumer (each program's compiler
  and the runtime) come in through it, resolving it the same way. If a caller needs something the
  entrance doesn't offer, add it to the entrance. Don't route around it.
- When the compiler says a type isn't assignable to a type with the same name, read the two paths
  before you write an assertion.
- Check the way the code is built. A check that reads a package's old declarations proves the old
  package.
- **Give a test, not a mood.** Every condition must be checkable from the Principle alone, with no
  undefined terms. "Route" and "entrance" need one plain sentence each, or better words.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** A PR imports `type Line` (a plain interface) from `"../../packages/money/src/line.js"`
  while the rest of the app imports from `@shop/money`. It compiles. Approve?
- **(b)** The compiler reports "`Cents` is not assignable to `Cents`" with two different paths, and
  a teammate proposes `as unknown as Cents`, since "it's the same type". What do you do?
- **(c)** A team proposes changing an internal package's `exports` to `"./src/index.ts"` because
  Node 22 runs TypeScript. Its services deploy by copying their dependencies into an image. Safe?
- **(d)** CI runs `tsc -p apps/api` after `npm ci`, and the package's `dist` is committed.
  Someone changes a function's signature in the package's source. What does CI report, and what
  should it run?

## Cast

- **Gilad Stacktrace** (he): the Principle, and the stack trace.
- **Idan Greenfield** (she): writes the parser at the API's door, and takes the shortcut around the
  missing export. Competent; the shortcut is reasonable until it isn't. Last seen Ch21.
- **Dima Bridge** (he): the tech lead who owns the repository setup. Built declarations, in order.
  Not a mediator this time; he has a position. Last seen Ch20.
- **Linoy Nightly** (she): live types, custom conditions, Node's type stripping. She was in Ch23,
  but this is her subject. If Codex prefers to rest her, say who carries live types.
- **Gil Benchmark** (he): the counts.
- **Optional:** Sahar Firstclass (he), for "why wasn't it exported?"

**Rested:** Daniel, Eden, Oded, Noam and Chen (Ch24); Eli, Guy and Dafna (Ch23). Five or six
people. Check every pronoun against the bios. Idan is she, and Linoy is she.

## Voice and constraints

- Calibrate on Ch7. Fun first: "`Money` isn't a `Money`", the cast that compiles, and the stack trace
  that agrees with the compiler should be the scenes readers retell.
- **Not a Ch24 rerun.** Ch24 was "green, then broken in production". Ch25's hook is a red compiler
  that the team first disbelieves. Keep it in the PR, and if anything breaks at runtime, it's the
  cast, on someone's machine, not production.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- Idan is competent. The shortcut is the plausible step of someone who needed one function today.
- One running repository with small counts, and every fence checked. Label each file in its fence,
  as Ch13 and Ch24 do. Print the tsconfig and the `exports` that matter. Don't make the reader
  guess the configuration (Daniel's bio: "bring the repository configuration along").
- No timing claims. The shop and its repository are fictional, and the page says so.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter25.cjs` compiles every TypeScript and JSON fence on the book profile as multi-package
programs. It builds each package's `dist`, and creates the workspace links with `fs.symlinkSync` in a
temp directory. Competing setups are separate fixtures.

Runtime groups:
- the cast: the double assertion compiles, and the run throws the `#cents` `TypeError` from the
  API's own copy of `Money`;
- the repair: one route, no copy, and the same output the text prints;
- the source export: it runs in the linked workspace, and throws
  `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` from a copied `node_modules`, if the chapter uses it;
- any count the text prints (cross-package relative imports, copies of money in the output, types
  that crossed silently), computed by the check from the fenced repository, not typed by hand.

Compiler cases:
- every diagnostic quoted verbatim, with paths normalised (TS2741, TS2352, TS2307, TS5011, TS2554 as
  used);
- the stale-`dist` `tsc -p` exit 0 and the `tsc -b` TS2554;
- `--listFilesOnly` assertions for each route the text claims.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [ ] Codex challenges this plan: is the decision honestly opinionated, does the hook teach type
  sharing rather than trivia, how the second route got past TS5011, and which ending.
  Disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Checks durable; full suite green on the frozen manuscript.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Ready for the author's review.
