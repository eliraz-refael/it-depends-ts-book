# Chapter 26 — Testing Typed Code (working title)

Status: **PROPOSED, AWAITING CODEX'S CHALLENGE**, 2026-10-28.
Branch: `codex/chapter-26-testing-typed-code`, based on `origin/main` `4ac925a` (Ch25's merge, PR #27).
File: `book/04-the-real-world/03-testing-typed-code.md`.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict. Codex's challenge proposes which, with
  evidence. We settle it before drafting.
- **The reader should leave able to write a type test that can fail, and to tell which kind of test
  a type needs.** They should know:
  - that a type test passes whenever the compiler has nothing to say about it, so the first question
    is whether it *could* say something;
  - the three ways a type test passes without testing anything (mechanisms 1–3 below);
  - what an exact-type test catches that a usage test doesn't, and what it breaks on that callers
    never notice;
  - where a type test ends and a runtime test has to start.
- **Act IV is "the real world".** The test suite has history: a test somebody wrote carefully a
  while ago, a fixture that was never updated, and a check configuration nobody on the page wrote.

## What earlier chapters already settle (do not repeat)

- **Ch2:** assertions. A fixture built with `as Order` is Ch2's promise problem. One line at most.
- **Ch10 (infer), Ch11 (advanced generics):** how inference works. Here we only *test* an inferred
  type. Don't re-teach `infer` or the `Equal` helper's internals beyond one sentence about what it
  distinguishes.
- **Ch16:** parsing at the boundary. "Where type tests end" may point at Ch16's door in one line
  (status read from storage isn't checked by any type test). Don't re-argue parsing.
- **Ch24:** "both tests were green" and `checkJs`. Ch24's tests were runtime tests of a loading
  contract, and its failure reached production. **Ch26 must not be a Ch24 rerun.** Its discovery
  happens in review, from a test that should be red, and nothing ships.
- **Ch25:** which declarations a check reads. Ch25's stale `dist` is a check reading the wrong
  declarations. Ch26's unchecked test file is a check reading no declarations. One callback line at
  most, if it earns it.

**Later chapters to stay clear of:**
- **Ch27 (performance vs safety):** no claims about type-test cost, compile time or CI time.
- **No test-framework claims** (Vitest, Jest, tsd, expect-type) without a primary source, and then
  one line at most. The page's runner is Node's own `node --test`, and its type checks are `tsc`.

## Verified mechanisms (TS 7.0.2, Node 22.23.4)

The probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.
- **Compiler:** `--strict --target ES2022 --module nodenext --noEmit --allowImportingTsExtensions
  --types ""`, with a `"type": "module"` manifest.
- **Domain:** `type Draft = { id; status: "draft"; currency }`, `type Paid = { id; status: "paid";
  paidAt; currency }`, `type Order = Draft | Paid`, and `ship(order: Paid)`.

1. **A `@ts-expect-error` is satisfied by any error on its line, and the reason can change without
   anyone seeing it.**
   - The test is `// @ts-expect-error: can't ship a draft` above `ship({ id: "o2", status: "draft" })`,
     an inline fixture without `currency`.
   - **Guarded** (`ship(order: Paid)`): the suppressed error is `TS2322: Type '"draft"' is not
     assignable to type '"paid"'`. That's the right reason.
   - **Loosened** (`ship(order: Order)`): the check still **exits 0**. The suppressed error is now
     `TS2345 … Property 'currency' is missing in type '{ id: string; status: "draft"; }' but required
     in type 'Draft'`. The test guards the fixture, not `ship`.
   - **Nothing reports the switch.** You only see which error a directive is suppressing by removing
     the directive.
   - **The repair:** build the input as a checked, valid value of the wrong type, `const draft: Draft
     = { id: "o2", status: "draft", currency: "USD" }`, and write `ship(draft)` on the directive's
     line. Guarded, that's the status error. Loosened, it's **`TS2578: Unused '@ts-expect-error'
     directive.`** (exit 1). A field added later fails at the fixture's own line, outside the
     directive.
2. **An assignability test is satisfied by `any`.**
   - `const r: Record<string, number[]> = groupBy(…)` compiles when `groupBy` returns `any`.
   - **Mutual assignability** (`[X] extends [Y] ? [Y] extends [X] …`) says `any` equals `string`, and
     that `{ readonly a: 1 }` equals `{ a: 1 }`.
   - **The strict `Equal`** (the `<T>() => T extends X ? 1 : 2` comparison) rejects both, and catches
     the `any` return through `ReturnType`. It reports `TS2344: Type 'false' does not satisfy the
     constraint 'true'.` through `type Expect<T extends true> = T`.
3. **The strict `Equal` also fails on changes no caller can see.**
   - `Equal<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>` is `false`. Mutual assignability says `true`.
   - `Equal<{ readonly a: 1 }, { a: 1 }>` is `false`.
   - `Equal<{ a?: number }, { a?: number | undefined }>` is `true` by default, and `false` under
     `exactOptionalPropertyTypes`. So the same test changes verdict with a compiler flag.
   - **That's the honest cost.** An exact test on an inferred type turns red when a refactor
     reshapes the type (an intersection becomes a flat object), even if every caller still compiles.
4. **A type test only runs if the check compiles its file.**
   - Node 22.23.4 runs `.ts` tests by stripping types. `node --test` **passes** a file containing a
     deliberately false `Expect<Equal<…>>` and a `@ts-expect-error`. Type stripping doesn't check.
   - **A tsconfig whose `include` doesn't reach the file** (`"include": ["src", "test/**/*.test.ts"]`
     with a new `test/ship.types.ts`): `--listFilesOnly` doesn't list it, and the check exits 0 with a
     false assertion in it.
   - So "have you seen it fail?" is the only way to find this.
5. **A negative test that's also run executes the forbidden call.**
   - Under `node --test`, the line under `@ts-expect-error` runs. With a `ship` that records
     shipments, the test that proves "you can't ship a draft" ships `o2` on every run
     (`shipped: [ 'o2' ]`).
   - A type-only test file that the check compiles and nothing runs avoids it.
6. **The book's repository has no `@types/node`.**
   - A test file that imports `node:test` gives `TS2591: Cannot find name 'node:test'` when it's
     type-checked, and an unimported `test(…)` gives TS2593.
   - **This is a plausible history for mechanism 4.** Somebody narrowed `include` to get the check
     green.
   - **It's also a validation decision** (see below). Either the checked type-test files never import
     the runner, or we pin `@types/node`. My preference is the former, with no new dependency.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise above.

**The hook: a test that should be red (mechanism 1).**
- **Oded's PR adds pre-orders.** `Order` gains a `PreOrder`, and shipping must accept paid orders
  and pre-orders. He widens `ship(order: Paid)` to `ship(order: Order)`, which is a fast, plausible
  shortcut, and writes "type tests green" in the description.
- **Noam wrote those type tests**, including "can't ship a draft". He reviews and knows that test
  should be red with this change. "It can't be green." That's in character, and it's funny that his
  own test let him down.
- **Eden removes the directive** and reads the error it was holding: the fixture is missing
  `currency`. "That test hasn't been about `ship` since March." Before the PR, it was suppressing the
  right error. Oded's change switched the reason, and nothing said so.
- **The fix is small:** a valid `Draft` fixture. The test goes red on Oded's PR with TS2578, which is
  the win. Oded's real fix is `ship(order: Paid | PreOrder)`.
- **Possible joke, if it lands (mechanism 5):** the test that proves you can't ship a draft has
  been shipping one on every run.

**The argument: what should a type test assert?**
- **Exact types** (Guy, "Where's the interface?", or Noam): every exported signature and inferred
  type gets an `Equal` test. It catches `any` (mechanism 2), which usage tests can't.
- **Usage** (Sahar or Oded): test what callers can and can't do. Exact tests break on reshaping that
  no caller sees (mechanism 3). "My refactor broke twelve type tests and zero callers" is a count
  the check can produce.
- **The conditions that should decide it:**
  - Is the type itself the product? An exported generic helper's inferred return is. An app's
    internal guard isn't.
  - Can `any` reach it? It can, from `JSON.parse`, an untyped dependency or a widened generic.
  - Does any caller depend on the exact shape (keys enumerated, `readonly`)?

  I expect a local Verdict: usage tests for guards, built from valid fixtures; exact tests only where
  the inferred type is the thing shipped or `any` can reach it; and every type test seen red once.

**Candidate Turn (mechanism 4).** The team adds the exact tests in a new file. Eli or Chen (whoever
the cast has) asks the Principle's question, "have you seen it fail?" They make one false on purpose,
and it stays green, because the check's `include` doesn't reach the new file. The rule they just
adopted catches the hole its own fix created. **The history is mechanism 6:** `include` was narrowed
when test files didn't type-check. Codex decides whether this is the Turn, with evidence.

**Where type tests end (one beat).** A type test proves which calls compile. It says nothing about
an order whose status came from storage. That's Ch16's door, one line, and maybe the reason
`ship`'s runtime check (if it has one) keeps a runtime test.

**What I don't know, and Codex should attack first:**
- **Is "exact vs usage" honestly opinionated,** or do the conditions decide it? If they decide it,
  it's a Verdict.
- **Is the hook teaching testing typed code, or a directive trivia item?** I think "a type test
  passes whenever the compiler is quiet" is the core of the subject, and the directive is its
  sharpest instance. Test that.
- **Are mechanisms 1 and 4 too much for one chapter?** They're two different holes. Is the Turn
  earned, or a second lesson bolted on?
- **Does mechanism 5 belong,** or is it a distraction?
- **How should the check handle `node:test`** (mechanism 6)?

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Eden Legacy.** His bio has the intern's `@ts-ignore` that "silenced a warning
about a null pointer that brought down the billing system". He last set a Principle in Ch10, and
"I've seen this fail at scale" is the voice of somebody who has watched suppressions outlive their
reason. Codex may argue for Noam or Daniel. Daniel set Ch24's, and the Principle here is better as a
practitioner's rule than as a compiler fact.

**Its direction, not its wording:**
- A type test passes whenever the compiler has nothing to say about its file. So before you trust
  one, make it fail. Break what it guards, and watch it turn red for the reason it names.
- A `@ts-expect-error` accepts any error. Give its line exactly one way to be wrong: a valid value
  of the wrong type.
- An assignability test accepts `any`. Where `any` can reach a type, compare it exactly.
- Exact comparisons fail on shapes no caller sees, so use them where the type itself is what you
  ship.
- **Give a test, not a mood.** Every condition must be checkable from the Principle alone, with no
  undefined terms. "Exact" and "usage" need one plain sentence each, or better words.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** A test reads `// @ts-expect-error` above `transfer({ from: "a", amount: -5 })`, where
  `transfer`'s type requires `to` and a positive-amount brand. It's green. Approve?
- **(b)** A helper's return type is tested with `const x: User[] = parseUsers(raw)`. Its
  implementation is `return JSON.parse(raw)`. What does the test prove?
- **(c)** A refactor turns `A & B` into a flattened object type. Twelve `Equal` tests go red and every
  caller compiles. Fix the tests or revert the refactor?
- **(d)** A new type-test file is added under `test/`, and CI's check is green. What do you ask
  before you trust it?

## Cast

- **Eden Legacy** (he): the Principle, and removing the directive.
- **Noam Kiperman** (he): wrote the type tests, and reviews the PR.
- **Oded Shipley** (he): the pre-orders PR. Competent; the widening is a fast, plausible shortcut.
- **Guy Singleton** (he): exact tests as the interface's contract. Last seen Ch23.
- **Sahar Firstclass** (he): which type tests earn their place, and the refactor that broke tests
  and no callers.
- **Optional:** Eli Typeworth (he) for "what does this test claim?" and the red-first question, or
  Chen Override (he). Chen was in Ch24 with Eden, Oded, Noam and Daniel, so prefer Eli, to avoid
  repeating Ch24's cast.

**Rested:** Gilad, Idan, Dima, Linoy and Gil (Ch25); Daniel (Ch24's Principle). Five or six people.
Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first: "It can't be green", the error the directive was hiding, and the red
  test on purpose that stays green should be the scenes readers retell.
- **Not a Ch24 rerun and not a Ch25 rerun.** Nothing ships, and no stack trace. This is a review and
  a laptop.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- Oded is competent, and so is Noam. The test was good when he wrote it.
- One running repository, small counts and every fence checked. Label each file in its fence. Print
  the tsconfig `include` that matters.
- No timing claims. The shop is fictional, and the page says so.
- Length: 2,300–3,000 words.

## Validation plan

`checks/chapter26.cjs` compiles every TypeScript and JSON fence on the book profile, as one evolving
repository in the page's own sequence of states, as Ch25's does.

Compiler cases:
- every diagnostic quoted verbatim (TS2322, TS2345, TS2578, TS2344, plus TS2591 if used);
- for each `@ts-expect-error` on the page, **the error it suppresses**, by compiling the file with the
  directive removed, so the check proves the reason the page claims;
- the exit-0 states (the loosened `ship` with the inline fixture, and the false assertion outside
  `include`), with `--listFilesOnly` for the latter;
- any count the page prints (tests turned red by the refactor, callers that still compile), computed
  by the check.

Runtime groups:
- `node --test` passing the unchecked file;
- the negative test's `ship` call executing, if the page uses it;
- any runtime behaviour the page prints.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [ ] Codex challenges this plan: is the decision opinionated, does the hook teach testing typed code
  rather than trivia, are two holes too many, and which ending. Disagreements are settled on
  evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review.
- [ ] Final draft's checks durable, and the full suite green on the frozen manuscript.
- [ ] Clean `npm ci` and full suite green at final review.
- [ ] Ready for the author's review.
