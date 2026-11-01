# Bonus 1 — Codex plan challenge

2026-11-01. Plan reviewed at `dbbad67`, on `codex/bonus-1-prompting-for-typescript`, based on Ch27's merge `27e4630`. **Challenge complete; awaiting Claude's settlement. No chapter drafted and no plan edits.**

## 1. Ending first: a local Verdict about the handoff, with a different Turn

Keep this chapter, but change what earns its place. The proposed compiler mechanisms work. The proposed chain of evidence does not yet establish the conclusion: **compiling without a few forbidden tokens, plus passing rejection tests, is not a sufficient acceptance rule.** An annotated predicate can lie without those tokens. A function that rejects everything can pass every rejection test. Neither is new TypeScript learning; both matter because the plan currently promises more than its checks establish.

The strongest new application is **making the handoff concrete before requesting an implementation**: an owned contract, examples of both accepted and rejected inputs, the actual project configuration and command, and a stated set of files the implementer may change. The owner can ask an assistant to propose any of these. The owner still has to decide whether they describe the intended behavior. “You can't delegate writing the types” mistakes authorship for responsibility.

My recommendations:

- Keep the “validates” hook short. Give it an actual caller and printed result. Don't spend another scene discovering that `JSON.parse` returns `any`.
- Replace the five-candidate score with a consequential comparison between two implementations under one contract. More green cells do not make this a better story.
- Make the Turn **“Which file says that?”** Two cast-free implementations pass the initial tests; one accepts numeric strings, and even converts an empty string to zero. The owner objects, but never specified that choice. Verified below.
- Keep the declaration reset as a bounded demonstration of project context, not a universal safety setting. Drop the lexical escape-hatch gate from the page. Its failures would turn this into Bonus 3 before Bonus 1 has established its own subject.
- Land a local Verdict for this refund boundary: agree on the accepted and rejected inputs before commissioning the implementation; hand over executable requirements and the real project context; run those requirements without changing them to fit the answer. Passing supplies evidence for those requirements, not proof of all correctness.
- Use **Bonus 1**, not Chapter 28. Keep Eli, Dima, Idan and Chen. No fifth person is needed.

The bonus act can apply existing tools. It should say that through the story rather than advertise the environment reset and token counter as three new discoveries. The method is worth a chapter if the reader leaves knowing what to put in the next handoff. It is not worth a chapter if the reader leaves only remembering that generated code can contain assertions.

## 2. All three mechanisms reproduce; one later state does not

### Configuration and baseline

I ran `npm ci` in this worktree, then used its `node_modules/.bin/tsc`: **TypeScript 7.0.2**, with **Node 22.23.4** for the runtime probes. Probe files are under `.probe/codex/bonus1/`, untracked.

The main configurations copy `checks/compiler.cjs`: `strict`, `exactOptionalPropertyTypes`, `target: ES2022`, `module` and `moduleResolution: Node16`, `types: []`, `skipLibCheck: true`, `noEmitOnError: true`. Compiler-only cases add `noEmit`. I separately repeated the essential comparisons with the plan's `lib: ["es2022"]` and `skipLibCheck: false`. Those are controls, not silently substituted book defaults. The book profile's default libraries include DOM declarations.

With this common source:

```typescript
// shortcuts.ts
export type Refund = { id: string; cents: number };
export function parseRefund(raw: string): Refund { return JSON.parse(raw); }
export function firstLineCents(lines: { cents: number }[]): number { return lines[0].cents; }
```

The complete local runner is:

```sh
node .probe/codex/bonus1/probes.cjs
# 25 compiler cases pass; runtime results recorded in runtime.json
```

Each configuration can also be run directly, for example:

```sh
node_modules/.bin/tsc -p .probe/codex/bonus1/book-both.json --pretty false
```

| Configuration / source | Exit | Diagnostic |
|---|---:|---|
| Book profile, both shortcuts | 0 | None |
| Add only `reset.d.ts` | 1 | TS2322 on the parse return |
| Add only `noUncheckedIndexedAccess` | 1 | TS2532 on the indexed access |
| Add both | 1 | Both diagnostics |
| Both, with `as Refund` and `lines[0]!.cents` | 0 | None |
| Both, with checked construction and an explicit empty-array branch | 0 | None |

The combined output is:

```text
.probe/codex/bonus1/shortcuts.ts(2,52): error TS2322: Type 'unknown' is not assignable to type 'Refund'.
.probe/codex/bonus1/shortcuts.ts(3,77): error TS2532: Object is possibly 'undefined'.
```

The indexed-access flag adds the possibility of `undefined` to these reads; it does not establish that an array is populated. The honest control reads the first element, branches on `undefined`, and returns zero for this probe's explicitly chosen empty-array policy. The non-null assertion instead throws `TypeError` on `[]`. [TypeScript's flag documentation](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html).

Runtime control: the asserted parser returns `{"id":"r1","cents":"100"}` unchanged for that input. The checked-construction parser rejects it with `invalid refund`; both accept `{"id":"r1","cents":100}`. These are fixed programs, not observations of any assistant.

### The proposed Turn forgets its new return type

Once the page changes the contract to:

```typescript
export type Result =
  | { ok: true; value: Refund }
  | { ok: false; error: string };
```

this no longer compiles:

```typescript
export function parse(raw: string): Result {
  return JSON.parse(raw) as Refund;
}
```

Command and output:

```sh
node_modules/.bin/tsc -p .probe/codex/bonus1/bare-cast-does-not-fit-result.json --pretty false
# exit 1
# result-cast.ts(2,44): error TS2322: Type 'Refund' is not assignable to type 'Result'.
```

The corresponding escape is `return { ok: true, value: JSON.parse(raw) as Refund };`. That compiles with the reset (`wrapped-cast-fits-result.json`, exit 0). If the old Turn survives settlement, it must use the current contract. It cannot borrow the original function's body while claiming to test the later state.

The same state problem affects the proposed count. An honest `Result` parser does not satisfy the original `Refund` return annotation. A “silent default currency” has no stated contract to violate: the printed `Refund` has no currency field. Define one common function type and all relevant policies before comparing candidates. Do not change which five programs are being counted halfway through the sentence.

## 3. Why the JSON overload wins, and how far that holds

### A supported overload mechanism, not replacement of the standard library

The installed `lib.es5.d.ts`, lines 1153–1161, declares `JSON.parse` as a method returning `any`. The plan's script declaration adds a matching method returning `unknown`:

```typescript
// reset.d.ts — a script, with no top-level import or export
interface JSON {
  parse(text: string, reviver?: (this: any, key: string, value: any) => any): unknown;
}
```

Function members of merged interfaces form overloads. Later declaration groups take precedence over earlier groups. The standard library's declaration is present first in this program; the project declaration contributes the later matching signature. Ordinary calls therefore select its `unknown` result. The earlier overload still exists. Specialized signatures with a single string-literal parameter can move ahead of general signatures. [TypeScript handbook: merging interfaces](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces).

That explanation is supported by controls, not just the error in the happy case:

| Control | Observed result |
|---|---|
| Remove reset | Original parse return compiles |
| Put reset before or after `shortcuts.ts` in `files` | Same TS2322 |
| Assign parsed value to `number`, with reset and `skipLibCheck: false` | TS2322; the result is not `any` |
| Add `export {}` to reset without `declare global` | Original shortcut compiles; that interface is module-local |
| Use `export {}; declare global { interface JSON { … } }` | TS2322 returns |
| Two project declarations, `any` first and `unknown` second | Ordinary call yields `unknown` |
| Reverse those two project declarations | Ordinary call yields `any` |
| Earlier `parse(text: "trusted"): any`, later general reset | `JSON.parse("trusted")` still assigns to `Refund` |
| Supply a normal reviver | Compiles; the plan's callback signature remains supported |

Thus this works reliably in the tested program, but “we changed JSON.parse to return unknown” should not imply every possible overload now does. The check should assert an ordinary call's result and the file's inclusion after dependency or compiler changes. It should not silently rely on whichever global declaration happens to win.

### Repository compatibility: declarations pass; compiled dependency source does not

I checked the actual installed packages, not merely an empty program. `dependencies.ts` imports Zod, Express request/response types, and Node's Buffer. With `skipLibCheck: false`, both the baseline and reset programs pass. `--listFilesOnly` reports **298 files**, including Zod, `@types/express`, `@types/node` and `undici-types`.

```sh
node .probe/codex/bonus1/robustness.cjs
# 9 named compiler cases pass, plus the include/import control
node_modules/.bin/tsc -p .probe/codex/bonus1/deps-reset.json --listFilesOnly
```

A search of those packages' published declarations found no operative `JSON.parse` dependency that breaks this import fixture. This is evidence of compatibility with that program, not a claim that every library or every book fixture tolerates a global reset.

There is an actual source-level dependency in the installed repository. Zod 4.6.2 ships `.ts` source. I compiled `node_modules/zod/src/v4/classic/from-json-schema.ts` and its imports directly, with `allowImportingTsExtensions: true`, `noEmit: true`, and `skipLibCheck: false`. Without the reset: exit 0. With the reset: exit 1 and five diagnostics.

```sh
node_modules/.bin/tsc -p .probe/codex/bonus1/zod-source-baseline.json --pretty false
# exit 0
node_modules/.bin/tsc -p .probe/codex/bonus1/zod-source-reset.json --pretty false
# exit 1
```

```text
node_modules/zod/src/v4/classic/from-json-schema.ts(926,5): error TS2322: Type 'unknown' is not assignable to type 'JSONSchema'.
node_modules/zod/src/v4/core/schemas.ts(1204,18): error TS18046: 'parsedHeader' is of type 'unknown'.
node_modules/zod/src/v4/core/schemas.ts(1205,10): error TS18046: 'parsedHeader' is of type 'unknown'.
node_modules/zod/src/v4/core/schemas.ts(1206,34): error TS18046: 'parsedHeader' is of type 'unknown'.
node_modules/zod/src/v4/core/to-json-schema.ts(754,5): error TS2322: Type 'unknown' is not assignable to type 'ZodStandardJSONSchemaPayload<T>'.
```

Ordinary imports in the previous test consume published declarations, not those implementations. The book is not currently broken by this experiment. The distinction is exactly why the recommendation must say which program was checked.

A synthetic declaration control also exposes the role of `skipLibCheck`:

```typescript
// library-assumption.d.ts
// Illustrative dependency, not a claim about an installed package.
declare const parsedInLibrary: ReturnType<JSON["parse"]>;
type RequireString<T extends string> = T;
type LibraryAssumesString = RequireString<typeof parsedInLibrary>;
```

Baseline: exit 0. Reset with `skipLibCheck: false`: **TS2344: Type 'unknown' does not satisfy the constraint 'string'.** Reset with `skipLibCheck: true`: exit 0. Skipping declaration checks can hide a declaration's incompatible assumption; it does not undo the reset at application call sites. [TypeScript's `skipLibCheck` documentation](https://www.typescriptlang.org/tsconfig/skipLibCheck.html).

### Neither setting has an authorship boundary

A generated file importing `legacy.ts` brings that source into the program. Under the two settings, the old file's unchecked array return and JSON return both fail with TS2322. Using `include: ["generated/*.ts"]` instead of explicit roots still checks the imported old source. Its array return alone produces:

```text
legacy.ts(1,51): error TS2322: Type 'number | undefined' is not assignable to type 'number'.
  Type 'undefined' is not assignable to type 'number'.
```

Keep this as the fourth Principle-only case. A smaller project is a possible migration boundary only after checking what its imports bring in; a directory labelled “generated” is not one by itself.

The reset also leaves the default DOM `Response.json(): Promise<any>` untouched. This compiles with it:

```typescript
export async function parseResponse(response: Response): Promise<Refund> {
  return response.json();
}
```

That declaration is in the installed `lib.dom.d.ts`; do not generalize it to every response API. The installed `undici-types` has an `unknown`-returning body method.

**Recommendation:** keep the reset only in a deliberately small, checked chapter project, with one line explaining that the setting belongs to the program. Do not recommend adding it to an arbitrary existing application on the strength of this fixture. A local `readJson(raw: string): unknown` wrapper is the simpler option when the team owns the call path: my wrapper control rejects assignment to `Refund` without any augmentation. That option is already Ch6 material. Neither option proves that a caller inspected the data, and neither deserves a second tutorial here.

## 4. The escape-hatch gate is the wrong centre of the lesson

### A clean token count can accompany a false claim

Under the reset and `noUncheckedIndexedAccess`, this compiles:

```typescript
function isRefund(value: unknown): value is Refund { return true; }
export function parseRefund(raw: string): Refund {
  const value = JSON.parse(raw);
  if (isRefund(value)) return value;
  throw new Error("invalid refund");
}
```

It has no `as`, non-null assertion, explicit `any` or suppression. On the malformed input, it returns string-valued cents unchanged. The compiler has checked the boolean return, not established the predicate's assertion. Ch5 already teaches this; Idan's biography explicitly says she knows it. Don't make her endorse a rule that forgets it.

I also tested the obvious lexical tripwire:

```sh
rg -n '\bas\b|\bany\b|!|@ts-(ignore|expect-error|nocheck)' candidate.ts
```

It misses that predicate and matches the honest parser's logical negation, as well as `import { parseRefund as parse } from "./strict.js"`. A narrower pattern can reduce those false positives; counting text still does not establish the promised semantic property. A syntax-aware linter can enforce a chosen syntax policy, but it cannot turn the absence of assertions into proof of an implementation. The distinction should not require a tour of bypass techniques on the page.

**My choice is to cut the page's gate, rather than introduce a configured linter.** The plan invited replacing the scenario. The tested `rg` command is evidence for rejecting a token-count acceptance rule, not a recommended tool to publish as a safety check. Keep “don't fix this failure by asserting it away” as a concrete task constraint, and verify the behavior with the owned acceptance cases. If the settlement requires a gate, describe exactly the syntax it rejects, show its limits, and do not call passing it proof of validation.

Scope also matters: the proposed `reset.d.ts` deliberately contains `any` in the reviver signature. It is a trusted project declaration, not a generated implementation. The plan's generated-file scope can exclude it; the draft would have to show that scope rather than promise a project with no `any`. Ch15 also retains justified assertions; Ch2 distinguishes `as const` from pretending that external data has a domain type. “Every candidate using an assertion skipped the check” overstates the book's own rule.

### `satisfies` is not another assertion escape

The plan's suggestion that the assistant might “learn to write satisfies” should go. It attributes adaptive behavior we have not observed, and groups unlike operations together.

`return JSON.parse(raw) satisfies Refund` compiles without the reset because its operand is `any`. With the reset, it fails with TS2322 at the return and **TS1360: Type 'unknown' does not satisfy the expected type 'Refund'.** An ordinary, correctly shaped object using `satisfies Refund` passes. The operator checks compatibility while preserving the expression's resulting type; it does not replace `unknown` with `Refund`. [TypeScript 4.9's description of `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator).

A helper can hide an unchecked claim, but the interesting question is who owns its contract, not whether fictional software has become cleverer at evading a regex.

## 5. A runnable alternative: the missing decision, not the green-cell score

### Evidence for the replacement Turn

I built five fixed artifacts against the **same** `Result` type, under the reset, book profile and `noUncheckedIndexedAccess`. All five compile. They are controls for choosing the scene, not a proposed five-column page.

The two important implementations differ only here:

```typescript
// Both have already checked a non-null object, string id, and presence of cents.
// Candidate A:
const cents = value.cents;
// Candidate B:
const cents = Number(value.cents);
```

Each then uses:

```typescript
if (typeof cents !== "number" || !Number.isSafeInteger(cents) || cents < 0) {
  return { ok: false, error: "invalid amount" };
}
return { ok: true, value: { id: value.id, cents } };
```

Both catch malformed JSON and return a failure. Neither uses an assertion or predicate. Both pass the initial tests: accept numeric 100 unchanged and reject numeric -1. Yet B accepts `"100"` as 100 and `""` as zero; A rejects both.

Command:

```sh
node .probe/codex/bonus1/handoff.cjs
```

Results under one fixed contract:

| Artifact | Compiles | Initial positive/negative cases | Full proposed rejection set | Positive and negative acceptance set |
|---|---|---|---|---|
| Checked construction, no coercion | Yes | Pass | Pass | Pass |
| Same construction with `Number` | Yes | Pass | Fail | Fail |
| Asserted value inside success wrapper | Yes | Fail | Fail | Fail |
| Always-true predicate inside success wrapper | Yes | Fail | Fail | Fail |
| Always returns failure | Yes | Fail | Pass | Fail |

The expanded cases accept numeric 100 and zero, and reject negatives, fractions, string amounts, an empty-string amount, a missing id and malformed JSON. `handoff/RUNTIME.json` records every result. These examples establish those decisions only; they are not an exhaustive refund specification.

This is stronger than “five of five compile” because the green result changes what the owner has to do. The two cast-free candidates do not force a new compiler trick. They force a missing decision into the handoff. The always-reject control belongs in validation, not another scene: it ensures our revised rule remembers valid inputs too.

### Proposed story order

1. Dima has the small refund parser, the assistant's “validates” explanation, a real call and a bad printed amount. Idan's “It validated the vibe” can stay if it sounds like her in the exchange. One callback establishes the unchecked source; no Ch1 lecture.
2. Dima asks what they should send next time. Idan supplies the current function contract and project context. The reset makes the original shortcut fail. Show the diagnostic, then move on. The unrelated first-line function can be an Additional Take or check-only control; it should not start a second repair plot.
3. They obtain or compare a fixed implementation that constructs the result without casts. It passes their numeric positive and negative cases. Dima is ready to finish.
4. Chen supplies an empty-string amount. It becomes zero. Dima objects that a webhook must send a number. Eli asks where they gave that requirement to the implementer. No file distinguishes the two policies yet. This is the Turn.
5. They decide the shop's wire contract forbids coercion, add the contrasting cases, and preserve them while replacing the implementation. Dima's time objection remains serious: they settle the few decisions this boundary actually needs, rather than writing a complete implementation first.
6. End on the next handoff being concrete. Show the short request and the files/command it refers to. Do not end on a catalogue of possible bad AI output or an unseen review.

The coercion lesson itself is old; Ch16 already owns input policy. What changes here is **when and where the owner must express it so another implementer can act on it**. If the draft spends its Turn arguing whether coercion is morally good, it has slipped back into Ch16. State the shop's reason, encode that decision, and return to delegation.

The prompt should be required, not merely allowed. Otherwise the chapter can avoid the very act named in its title. For example, once those files really exist:

> Implement `parseRefund` in `src/parse-refund.ts` against `contract.ts` and `acceptance.test.ts`. The wire format requires numeric cents; don't coerce strings. Use the project's `tsconfig.json` and run `npm run check`. Leave the contract, tests and configuration unchanged; if they conflict, report the conflict before implementing. Don't replace a failing check with a cast or suppression.

This is illustrative task text, not a claim that it makes any model obey. “Leave unchanged” is a scope requirement, not a security boundary. The eventual chapter check should restore or verify the owned files before evaluating each fixed artifact. Name the actual command and paths used by that chapter repository; don't leave the prompt referring to a harness that exists only in the book's checker.

### Why a local Verdict is earned

For the chosen refund contract, the strict candidate passes the selected acceptance cases and the coercing one fails them. There is no unresolved compiler-versus-product tradeoff in that choice. The owner can decide it locally.

There is no evidence here for how much time assistants save, whether a particular prompt works more often, or how many tests every task needs. Don't invent an open ending around a workload we did not measure. Dima can win the narrower point: use an existing contract and tests when they already express the requirement; don't rewrite them ceremonially. For a low-risk display helper, the same handoff rule may require little new material. For this boundary, the omitted input decision has an immediately reproducible consequence.

Prose remains a requirement too. It can explain the business reason and cases the examples do not exhaust. Replace “prose is a wish; types and tests are the requirement” with the precise limitation: **the compiler and test runner do not enforce a sentence just because it is in the request.** Types can distinguish units through brands, as Ch15 demonstrated. Tests can expose wrong meanings for selected inputs; they do not decide those meanings for the owner.

## 6. Repetition and the three-bonus boundary

I checked the listed chapters and found one important omission: **Ch13** already deals with augmentation scope, module-versus-script declarations, smaller programs and upgrades that silently acquire overloads. A long explanation of the reset would repeat that chapter as well.

| Earlier material | What is already taught | Limit for Bonus 1 |
|---|---|---|
| Ch1, `01-any-vs-unknown.md`, especially lines 166–175 and 306–347 | JSON parse's unchecked return; a domain assertion doesn't establish truth | One callback, with an actual bad call |
| Ch2, `02-type-assertions.md`, including its `satisfies` and non-null sections | Assertions, justified exceptions, `as const`, and `satisfies` after JSON parse | No new taxonomy or blanket ban |
| Ch4/5 | Exhaustive handling; control-flow narrowing; annotated predicates need not prove their claims | A result can reuse the pattern; don't teach it again |
| Ch6, `06-generics-basics.md` | Return-only generic parsing, `unknown` boundaries and checked callbacks | Don't sell a wrapper as new machinery |
| Ch13, `07-declaration-merging.md`, especially “A smaller program” and Additional Takes | A declaration's program scope and overload-merging hazards | One context beat, with controls in the check |
| Ch15, `02-branded-types.md` | Type distinctions can express different jobs for the same representation | Avoid “types can't say what a number means” as an absolute |
| Ch16, `03-runtime-validation.md` | Reject/preserve/translate is an owner's boundary decision | Here, put the decision in the handoff before implementation |
| Ch26 | Tests must actually exercise the promise and include the intended files | Demonstrate the acceptance cases going red briefly; no file-move subplot |
| Ch27 | Measures only answer the question they measure | No leaderboard of hand-picked artifacts or implied success rate |
| Prologue, “The Code” | `noUncheckedIndexedAccess` is off in the book | Label any chapter-specific opt-in explicitly |

The no-real-model-claims rule is compatible with the AI subject. Show the fictional request, its attachments, the fixed returned source, and the command the team uses to evaluate it. The generality is a strength: the rule also works with a colleague. It becomes a failure only if the request disappears and “the assistant wrote it” is the chapter's sole AI content. Avoid “the assistant learns to hide a cast,” “this prompt gets better answers,” or percentages over hand-picked examples.

Keep the bonus split this way:

- **Bonus 1:** the implementation request and its owned acceptance contract. The artifact is source code. A webhook is a familiar problem to implement, not a model output entering an agent at runtime.
- **Bonus 2:** runtime data produced by a model, tool inputs/results, and the code that turns that data into permitted operations. Leave structured-output protocols, tools and agent architecture there.
- **Bonus 3:** an already-produced diff, untested behavior, weakened tests, change scope and evidence that a reviewer must assess. Bonus 1 may define that tests/config are out of scope; it should not stage an adversarial sequence of hidden changes to them.

“The human writes the checks first” is too restrictive as the dividing line. The human **owns and accepts the requirements before using their success as evidence**. Their initial text can come from anywhere. Conversely, “the checks do the judging” is too strong: a check cannot supply the business decision omitted from it. The proposed Turn makes precisely that limit visible without becoming a finished-diff review chapter.

## 7. Cast, Principle and four reader cases

### Cast and pronouns

The plan's pronouns match the bios: **Eli he, Dima he, Idan she, Chen he; optional Dafna she and Gil he**. Sahar is also he. Keep the four-person cast.

Eli is the right Principle owner. His bio asks which claim the room is arguing about, including a past dispute over an unstated requirement. Let him distinguish “this compiles” from “this implements the requirement we agreed,” not deliver another `unknown` lecture. His Ch23 appearance is correctly recalled.

Dima's objection must remain competent. He already explained the JSON/assertion problem in Ch1. He can miss an unstated coercion policy or object to writing redundant specifications; he should not need to rediscover that a return annotation does not validate JSON. Let him require that the handoff's cost buys a named decision. Being a daily assistant user is new fictional setup, not a fact from his bio or a claim about a product.

Idan can expose the malformed value and build a checked result. Her own bio explicitly distrusts predicates that keep compiling after the promised shape changes. Don't have her declare an assertion-free implementation safe, and don't turn her into a configuration lecturer.

Chen should ask the question with a consequence: “Does an empty amount mean zero?” That fits his bio better than playing syntax whack-a-mole. His proposed `satisfies` objection is technically wrong, as shown above.

Gil just drove Ch27 and is not needed for five counts. Dafna would add no distinct decision here. One factual correction to the “rested” note: **Chen appears in Ch24, the migration chapter**, including its backfill and file-coverage discussion. The blanket “Act III or Ch25” description misses that appearance. Dima and Idan appear in Ch25; neither appears in Ch26/27. None of this requires changing the recommended cast.

### Principle direction

Keep Eli. A possible heading is **“Say What Must Stay True”**. Direction, not settled manuscript wording:

> Before asking for an implementation, agree on the behavior it must preserve and the files it may change. Give it the real project configuration, a callable contract, and examples that show both what must work and what must be rejected. If two implementations pass those checks but disagree on behavior you care about, you still owe the implementer a decision.
>
> Run the agreed checks against the returned code. An assertion cannot establish an input fact, and the absence of assertions cannot establish a correct implementation. Types enforce the distinctions they express; examples exercise selected behavior. Someone still has to own the requirement behind them.

That is deliberately about the handoff. Trim it into Eli's spoken register when drafting. The final version should mention program scope if the fourth reader case is retained, for example by tying “real project configuration” to all source files included through imports. It should not become an inventory of flags and syntax. “Give a test, not a mood” could be a joke; it is too narrow as the whole rule because positive behavior, type contracts and scope matter too.

### Four Principle-only cases

Replace the approval-oriented draft cases with decisions made at the handoff. These cases need no familiarity with the refund scene.

1. **Both answers pass.** A request says “parse a quantity.” The signature returns a result containing a number. Existing tests accept 3 and reject -1. One proposed implementation accepts `"3"`; another rejects it. What must the owner decide before commissioning the implementation? **Expected:** settle the input/coercion policy, record contrasting accepted/rejected examples and preserve valid behavior. Do not guess the product policy from a green compiler or a model's explanation.
2. **An attractive shortcut to green.** The agreed task must reject a missing user (`user: { email: string } | undefined`). A candidate removes the compiler error with `user!.email`; another uses a predicate whose body returns `true`. Neither requirement nor test changed. Has either established the input fact? **Expected:** no; require behavior that handles/rejects the missing value and a failing control for that case. A token ban alone does not distinguish the predicate from an honest implementation.
3. **The cheap task with an existing contract.** A display formatter already has a public signature and tests for zero, negative values and locale. The owner wants to hand over its implementation. Must they first rewrite every type and test or insist on a new schema? **Expected:** no; reuse the owned contract and actual project command, identify any missing decision and constrain the change to the intended implementation. Do not equate writing more specification with improving it, or passing existing tests with universal proof.
4. **“Only the generated directory.”** A new project includes `generated/*.ts`, which imports forty existing source files. A stricter flag breaks those imports. Can the owner promise the assistant that the setting affects only its output? **Expected:** no; inspect the actual program and imports, choose an intentional migration or genuine checked boundary, and give the implementer that configuration. Neither `include` nor the author's identity exempts imported source.

Use these to test whether the Principle teaches the method rather than memorization of `JSON.parse` or an instruction to reject every `as` token.

## 8. Heading, validation and settlement requests

### Numbering

Use `# Bonus 1: Which File Says That?` as a provisional heading, with the planned filename `book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md`. The final story title can change with the hook. Use **Bonus 1**, **Bonus 2**, **Bonus 3** consistently in cross-references and checks; `checks/bonus1.cjs` is clear.

README lists four acts followed by a separate **Bonus — AI & TypeScript**. PLAN likewise puts three files in a separate bonus directory. “How to Read” defines the debate structure but does not require continuous chapter numbering. Nothing there makes this Chapter 28.

The print study does not settle the issue: `design/print/README.md` explicitly describes a Chapter 10 sample. `build.py` hard-codes that chapter's title and `CHAPTER / 10` opener. It is not a general book-numbering system. When the full-book renderer is built, give it the section kind and local number; `BONUS / 01` can use the existing outlined-number treatment. No print code should change as part of this plan challenge.

### What the eventual chapter check should prove

Use one evolving repository and extract every printed artifact, including the request if its paths or command are part of the lesson. In addition to the plan's diagnostic and runtime assertions:

- Pin the complete project configuration; show the reset included and effective, and its absence restoring the original behavior. Keep `skipLibCheck: false` compatibility controls separate from the book-profile scene.
- Keep the current function contract fixed when comparing candidates. Assert the positive caller as well as failure handling. Don't mix a `Refund` function with a `Result` function in one compile count.
- Execute the printed malformed, valid and coercion inputs. Assert both their result tags and the actual values/types that make the scene matter.
- Make the contrasting string/empty-string cases fail on the coercing candidate and pass on the selected parser. Run the always-reject control separately so a set of rejection tests cannot masquerade as the whole contract.
- Restore or verify the owned contract, tests and config between candidates. Do not silently let the test fixture change to make a candidate look correct.
- Keep the lying-predicate, overload-order, source-library and import-scope controls in validation as needed; they justify limits, not extra manuscript subplots.
- Assert only counts whose complete fixed candidate set the page defines. No performance or real-model claims follow from these probes.

Local evidence is in `RESULTS.json` (25 compiler cases), `ROBUSTNESS.json` (9 named cases), the additional import-inclusion control, `ZOD-SOURCE.json` (baseline/reset source comparison), and `handoff/` (five compiling fixed artifacts, runtime acceptance matrix and lexical-gate controls). The installed dependency membership is in `deps-files.txt`. These remain untracked as requested. Only this challenge is committed.

The main settlement questions are therefore concrete: keep the small-program reset but cut the lexical gate; replace the assertion Turn with the missing coercion requirement; require a visible handoff with positive and negative cases; and choose a local Verdict about that handoff. Those changes keep the chapter about commissioning TypeScript work, give Dima a real objection, and leave the next two bonus chapters room to argue.
