# Bonus 3 — Codex plan challenge

2026-11-02. Plan reviewed at `3009a04`, on `codex/bonus-3-reviewing-ai-code`, based on Bonus 2's merge `8bdb687`. **Challenge complete; awaiting Claude's settlement. No chapter drafted and no plan edits.**

## 1. Ending first: keep the review, change the flag's promise

The strongest chapter is a review of a refactor whose **current results really are unchanged**. Noam notices the caller repair. Oded has tested every status and has a legitimate reason to want the table. The declaration diff explains why both of them are right about their evidence, but only one of them is right about “No public API changes.”

Keep the lookup table and make the typo a clearly labelled reviewer experiment. Do not manufacture a missed test. The new learning is a way to review a finished change: reconstruct the contract, restore the unchanged caller, and judge the repair together with the change that required it. It is an application of Eden's Ch6 warning, and should admit that.

The major technical objection is the ending. **`isolatedDeclarations` does not require an annotation on every export, does not require every public type change to edit an annotation, and does not replace comparing public declarations.** Its three proposed diagnostics reproduce, but the general guarantee drawn from them is false. An explicit `: string` also makes this very refactor pass the flag while preserving the unwanted widening.

My recommendation is a local Verdict: retain the intended status contract, restore the exhaustive caller, and review generated declarations alongside the source for this shared API. Make the annotation policy a deliberate local choice. Give `isolatedDeclarations` a short, accurate beat, not responsibility for enforcing API stability. There is no need to force an open ending about a flag rollout the scene has not established a reason to undertake.

## 2. The open questions

### New learning, or Eden's warning dramatised?

The warning is already there, almost word for word, in Ch6 l.228. Explicit return types are not the discovery. Neither are widening, exhaustiveness, nor planting a broken label.

The useful addition is **causal review of a multi-file patch**. A provider change and a consumer change can compile together while the provider no longer supports the old consumer. A reviewer needs to investigate the intermediate state the submitted commit no longer contains. Here, restore the old `badge.ts` against the new provider: TS2345. Then compare the public signatures. That establishes what the caller repair accommodated, without guessing from the assistant's explanation.

This gives the chapter an action the reader can transfer to another review. A final lesson consisting only of “annotate exports” would repeat Ch6. A final lesson consisting only of “test another input” would repeat Bonus 1. The submitted patch is the object of investigation; keep returning to its two hunks.

Correct two absolute claims in the plan. The source diff **contains the cause** of the contract change; it does not explicitly spell out the inferred signature. And a caller repair is a reason to investigate, not universal proof of an exported-type change. Configuration changes or an existing caller bug can also cause errors. This fixture establishes the cause by holding the caller and configuration fixed.

### Where is the AI?

The lesson should work for a human author's patch. That is a strength, not a defect to repair with claims about generated-code volume or tendencies.

Make the assistant present as three fixed artifacts: the submitted diff, its confident summary, and one short answer to a review question. For example, Noam asks what error the badge change addressed. The supplied reply says the fallback accepts strings outside the three cases, and points out that no exported annotation changed. Both observations can be true; neither establishes the summary's API claim. Noam checks the emitted signature rather than debating the reply's confidence.

Label this as the particular assistant reply in this example. Do not invent a live generation experiment, intentions, frequencies, or claims that an assistant cannot understand a contract. Also cut “long enough that nobody wants to read it twice”: the small diff is sufficient, and a volume excuse weakens the reviewer.

The bonus split remains clean: Bonus 1 decides and expresses requirements before handing over implementation; Bonus 2 controls runtime proposals and authority; Bonus 3 reviews a completed implementation and the claims made about its compatibility. No prompt-engineering detour, registry, schema, or second generated parser.

### Is the hook honest?

The `assertNever` change is conspicuous. Let Noam see it immediately. Oded should defend its consequences, not fail to notice the line. His strongest evidence is that the same tests cover all three statuses and all three badge texts before and after, and all pass. I reproduced exactly that.

“No public API changes” and “fixed a type error in badge.ts” are enough tension. Replace “a file it didn't touch”: the submitted patch plainly touches that file. Suggested line: **“Why did a lookup-table refactor need to change the badge's fallback?”**

Also, the caller already has a `default`. The patch replaces the expression in that branch; it does not add a default, nor remove an unreachable branch. The expression used to require `never`. Now it accepts `string` and returns it. That precision matters to the story.

Do not put `"refund"` in the original submitted artifact. A test of the fully refunded case catches it. I ran that control: the first two cases pass, the fully refunded status and badge assertions fail. An absent full-refund test is possible, but there is no need to build this chapter on that omission.

The better silent change is already the original widening. It preserves all current results, yet breaks an unchanged consumer expecting the old union. A dropped `as const` also works—I reproduced its derived type becoming `string`—but offers a less interesting two-file review. Parameter narrowing works too, but is visibly an annotation change and loses the inferred-contract surprise. Keep both as reader transfers, not competing scenes.

### Does the Turn earn its space?

Yes, if it changes the argument from “what happens today?” to “what did this repair stop checking?” The reviewer changes only `"refunded"` to `"refund"` in a scratch experiment. The original implementation plus its old badge fails to compile; the submitted table plus its repaired badge compiles and displays `refund`. Then undo the experiment. The candidate never shipped that typo.

The declaration diff is the discovery; the mutation demonstrates its consequence. Do not make these two unrelated climaxes. “Nobody wrote that line” can refer to the inferred declaration, but “nobody changed the API” cannot survive the next sentence.

The final repair produces “Did you mean '"refunded"'?” at the table. That is a good payoff. Do not add another catalogue of failure cases to the page. This challenge's counterexamples belong in validation or the reader tests unless the chapter actually makes the broader claim they refute.

### The flag and the ending

TS9007 on the original is useful evidence of adoption cost, not evidence that a formerly reviewed function was defective. The original has the intended contract and exhaustive caller. A newly enabled declaration-emission constraint is a different requirement. Linoy must not confuse the two.

The TypeScript 5.5 release notes explain that the flag permits sufficiently simple inference, including trivial exported values and primitive returns. It requires `declaration` or `composite`, and reports restrictions without changing the compiler's emit strategy. Its purpose concerns producing declarations without full cross-file analysis; its adoption has ergonomic costs. That is a narrower purpose than freezing an API. [TypeScript 5.5: isolated declarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations).

The probes below rule out the plan's “annotations on every export” account and its proposed either/or between the flag and a declaration report. We can choose both tools, but they do different jobs. This chapter has evidence to choose the report and this function's explicit return type. It has not established a separate build-tool requirement that makes a project-wide flag necessary.

If the flag stays in the scene, let it fail on the original, then let an explicit `: string` satisfy it on the candidate. **“Now it's explicitly the wrong contract”** is an available short beat, not a second main Turn. The owner still has to choose the union. Any stronger claim needs one of the trivial-export counterexamples on the page; better to avoid making it.

## 3. Reproduction of all six mechanisms

Installed with `npm ci` in this worktree. Versions: **TypeScript 7.0.2; Node v22.23.4**. All evidence is untracked under `.probe/codex/b3/`.

Commands, from the worktree root:

```sh
npm ci
node_modules/.bin/tsc --version
node --version
node .probe/codex/b3/probes.cjs
node .probe/codex/b3/controls.cjs
```

The two runners report respectively `27` compiler cases / `8` runtime groups, and `16` compiler cases / `4` runtime groups: **43 compiler cases and 12 runtime groups total**. These are fixture invocations, not 43 independent mechanisms. The second runner uses fixtures produced by the first.

Every compiler invocation, exit status and complete diagnostic is recorded in `COMPILER.json` or `CONTROLS-COMPILER.json`. Each case retains its sources and `tsconfig.json`. The normal profile imports `checks/compiler.cjs` defaults: strict, exact optional property types, ES2022, Node16 resolution/module, empty ambient types, skip library checking, no emit on error. It adds declaration-only emit, `.ts` import support, a case-local root and output directory. Five repeats use the plan's NodeNext module/resolution settings and reproduce the original, broken caller, both isolated-declaration errors and repaired state. Outputs are cleared before compilation.

The individual command is:

```sh
node_modules/.bin/tsc -p .probe/codex/b3/02-refactor-only/tsconfig.json --pretty false --noErrorTruncation
```

Output:

```text
.probe/codex/b3/02-refactor-only/badge.ts(12,33): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
```

Positions below belong to my retained fixtures, which use shorter formatting than the sketches; the plan's different line numbers are not substantive errors.

| Mechanism | Case directory | Observed result |
|---|---|---|
| 1. Original if-chain and exhaustive badge | `01-original` | Exit 0; exported return is `"paid" \| "partial" \| "refunded"` |
| 2. Table refactor, unchanged badge | `02-refactor-only` | TS2345, `badge.ts(12,33)`; `string` is not `never` |
| 3. Caller changed to return the status | `03-refactor-with-caller-repair` | Exit 0; exported return is `string`; all three current status/badge pairs unchanged |
| 4. Reviewer typo | `04-original-typo`, `05-PR-typo` | Original: TS2678 and TS2345. Candidate: exit 0, fully refunded badge is `refund` |
| 5. Named contract and checked table | `06-fixed`, `07-fixed-typo` | Correct version exit 0; typo produces TS2820 at `(7,3)` and TS2322 at `(15,3)` in `status.ts` |
| 6. Isolated declarations | `08-original-isolated`, `09-PR-isolated`, `10-fixed-isolated` | Original TS9007 `(3,17)`; candidate TS9013 `(10,10)`; fixed exit 0 |

The typo diagnostics in the original are exactly:

```text
badge.ts(11,10): error TS2678: Type '"refunded"' is not comparable to type '"paid" | "partial" | "refund"'.
badge.ts(12,33): error TS2345: Argument of type '"refund"' is not assignable to parameter of type 'never'.
```

The fixed typo's primary messages are:

```text
status.ts(7,3): error TS2820: Type '"refund"' is not assignable to type 'OrderStatus'. Did you mean '"refunded"'?
status.ts(15,3): error TS2322: Type '"paid" | "partial" | "refund"' is not assignable to type 'OrderStatus'.
```

The second has a continuation identifying `"refund"` as the incompatible member. The plan's two isolated-declaration messages reproduce verbatim. The caller repair uses no cast, `any`, or non-null assertion.

The before/after declaration change, recorded in `CONTRACT.diff`, is:

```diff
 import type { Order } from "./order.ts";
-export declare function orderStatus(order: Order): "paid" | "partial" | "refunded";
+export declare function orderStatus(order: Order): string;
```

Node directly executes the case's `run.ts`. For orders paid 1,000 cents and refunded 0, 500, and 1,000 cents respectively, both correct original and correct candidate produce:

```json
[{"status":"paid","badge":"Paid"},{"status":"partial","badge":"Partially refunded"},{"status":"refunded","badge":"Refunded"}]
```

The typo candidate changes only the final pair to `{"status":"refund","badge":"refund"}`. The restored candidate restores the original results. `green-tests-original`, `green-tests-PR`, `typo-tests-PR`, and `restored-tests-PR` compare these against the same fixed expected values; they do not accept expected values supplied by a candidate.

A separate unchanged consumer returns `orderStatus(order)` from a function annotated with the original union. It compiles against the original, fails against the candidate with TS2322 at `mobile.ts(2,67)`, and compiles against the final repair. Thus an actual existing caller can break even while the candidate's local badge and all current runtime cases are green.

## 4. Controls that change the recommendation

### There are smaller correct repairs

`11-as-const` adds `as const` to the table and restores the old badge. `12-satisfies-only` checks the table against `Record<RefundLevel, OrderStatus>` with private aliases, without annotating `orderStatus`, and restores the old badge. Both compile, produce all three correct results, and emit **byte-identical `status.d.ts` to the original**.

Therefore neither a new exported alias nor an explicit return annotation is necessary merely to undo today's widening. Let Oded offer the smaller change. Choosing the explicit return type buys a separately stated public promise, so a future implementation is checked against that choice. `satisfies` puts the typo error at the table as well. The chapter should say that, rather than imply there is only one compilable repair.

The plan's repair also exports a new `OrderStatus` name. Its declaration text is not byte-identical to the original; it intentionally names the old return contract and adds an export. Review that addition, or keep the alias private if consumers do not need to import it. Do not end by claiming an unchanged declaration file for this variant.

### Isolated declarations permits changing inferred exports

These two versions both pass with `isolatedDeclarations: true`:

```typescript
// Before, api.ts
export function label() { return "paid"; }
export const answer = 42;
```

```typescript
// After, api.ts
export function label() { return 42; }
export const answer = "forty-two";
```

Run each case with the compiler command above, substituting `id-trivial-a` and `id-trivial-b`. Both exit 0. The emitted declarations change from `label(): string` / `answer = 42` to `label(): number` / `answer = "forty-two"`. No annotation changed because neither version has one. The counterexample is also saved in `TRIVIAL-DECLARATIONS.json`.

In `id-string-is-not-a-contract-fix`, annotating the candidate's `orderStatus` with `: string` passes the flag and emits the widened return. Conversely, the smaller `as const` repair still gets TS9013 under the flag (`id-as-const-still-needs-return`), even though it restores the intended public return and old caller without that flag. These separate declaration-emission restrictions from compatibility particularly clearly.

### A signature's dependencies count

In `id-imported-a` and `id-imported-b`, `api.ts` imports `Status` and exports `identity(value: Status): Status`. Changing `Status` in `domain.ts` from the union to `string` passes isolated declarations in both versions. **`api.d.ts` is byte-identical; `domain.d.ts` changes.** Comparing one entry file is not generally comparing the public contract. Here the small `status.d.ts` diff is sufficient because its imported `Order` is unchanged; the broader rule must include the types a public signature refers to.

Similarly, the `id-derived-*` pair uses an explicit exported alias derived from a private constant tuple. Changing a tuple member changes the public type without editing the function's annotation. Explicit annotations remain useful, but an alias is not a frozen copy of what it names.

“On that module only” also needs a real project boundary. In `isolated-scope`, the config lists only `api.ts`, but its imported `helper.ts` joins the program and receives TS9007. Do not suggest the flag applies solely to the file named in `files` while source imports escape it. This is a validation detail, not a reason to repeat Ch25 on the page.

### Declaration equality does not establish behavior

`13-same-contract-wrong-behavior` swaps the valid `paid` and `refunded` table values. It passes isolated declarations and emits exactly the same `status.d.ts` as the repaired version. It now labels an unrefunded order `Refunded` and a fully refunded order `Paid`. `SAME-DECLARATIONS.json` records both runs and the equality assertion.

The report checks the public types, not the meaning of returned values. Keep runtime assertions. Also, a textual declaration change is a review signal, not an automatic breaking-change verdict: the named-alias repair itself changes representation while preserving the intended accepted statuses.

## 5. Proposed sequence and cast

Suggested title: **Bonus 3: What Did the Fix Fix?** “No Public API Changes” is also strong. Neither promises a checklist for all AI-code review.

1. Visible fixed assistant summary and the two-file patch. Noam immediately asks why the caller needed a repair. Oded shows all three current cases passing.
2. The short fixed assistant reply explains the fallback, but does not settle compatibility. Restore the old caller against the new provider. The error gives the investigation a concrete cause to trace.
3. Emit before and after with the same configuration. The one-line return change contradicts the summary. Eden supplies one unchanged consumer, not a tour of another app.
4. **The Turn:** Noam plants the label typo, explicitly in scratch work. Old check rejects; submitted patch compiles and says `refund`. Undo it. This is the check the “fix” removed.
5. Oded proposes the small `as const` repair. It works. Choose a named status contract and checked table for the API they intend to maintain; restore `assertNever`. Show the typo rejected at the producer and restore green. A brief flag experiment distinguishes requiring an annotation here from choosing its correct type.
6. **Local Verdict:** accept the table with the agreed contract; reject the caller fallback; require a generated declaration comparison for changes to this shared API. The summary must describe the actual changes. End on the completed review decision, not a speculative company-wide flag policy.

I recommend **Daniel Compiler (he)** for the Principle. The important correction is what the compiler can report versus what a reviewer must decide. His small reproductions suit that distinction. Sahar is plausible, but would bring this too close to his Ch26 “which check catches it?” territory; Gilad just spoke in Bonus 2.

Keep **Noam (he), Oded (he), and Eden (he)** with Daniel: four speaking people total. Daniel can own the short flag experiment. If Linoy stays, **she/her** is correct, and she should demonstrate the flag's limited useful guarantee rather than be made to assert something its documentation denies. Five people are affordable only if she has an actual position after the flag is demoted. My preference is to cut her from this chapter, not give her one mistaken line to be corrected.

All proposed pronouns match `book/00-prologue/02-meet-the-cast.md`: Sahar, Daniel, Gilad, Noam, Oded and Eden use he; Linoy uses she. No pronoun correction is needed. Noam should not get his biography's forty-seven comments and 11:47 PM replayed verbatim; one pointed question is sufficient characterization. Oded wins the runtime claim and the smaller-repair counter. Eden contributes a caller the candidate cannot silently edit, earning his Ch6 callback.

Repetition limits: Ch3/Ch6 supply the explicit-return rationale; Ch5 supplies `assertNever`; Ch2/17/22 supply `as const` and `satisfies`; Ch16 supplies the loss of exhaustiveness; Ch25 supplies the consumer's declaration context; Ch26 supplies the scratch mutation; Ch27 supplies the distinction between accepted callers before and after. Use these tools without reintroducing them. The fresh composition is reviewing the provider and its purported caller fix as one causal change.

## 6. Principle direction and four reader cases

Daniel's Principle should start with a testable review action: **compare the public types before and after under the same compiler and project settings; when the patch repairs a caller, find what made that repair necessary.** “Public types” includes referenced types, not just exported annotations. The owner decides whether the changed contract is intended. Green compilation checks the revised program, not compatibility with callers the patch no longer contains.

Then distinguish evidence: a summary is a claim; a declaration comparison establishes a type change; runtime tests establish the behavior they assert. Explicit types constrain implementations to an agreed choice. Isolated declarations does not choose that agreement or prove compatibility. Keep the flag qualification in the scene if the Principle would otherwise become a list of compiler exceptions. Do not open with “never trust AI,” or end with “review carefully.”

Four Principle-only cases, with expected distinctions:

1. **Derived export, no annotation edited.** A claimed internal refactor drops `as const` from `reasons`, while `Reason = (typeof reasons)[number]` stays unchanged. Ask whether the contract stayed the same and what evidence to obtain. Expected: compare emitted public types; tuple becomes `string[]`, derived `Reason` becomes `string`. A declaration-shaped alias is not independent of its source. Verified in `reason-const` / `reason-mutable`.
2. **Provider and caller repaired together.** Every current runtime case passes, but an exhaustive caller was given a fallback. Ask what the reviewer must establish before approving. Expected: restore the old caller against the new provider, investigate the contract change, and decide whether to preserve or intentionally migrate it. Passing current examples does not justify weakening the caller. Include an unchanged external consumer as evidence, not a hypothetical disaster. Verified by the main sequence and `external-*` controls.
3. **The flag is green.** Under isolated declarations, a trivial exported function changes from returning `"paid"` to `42`, without an annotation; alternatively, the author offers `: string` to settle the original error. Ask whether the flag establishes compatibility and where to look. Expected: no; emitted types change in the first case, and the second explicitly retains widening. Review the intended contract. Both controls are green with the flag, so the reader cannot solve this by chanting “require annotations.”
4. **All local callers pass a narrower input type.** Change `format(status: string)` to a status union; the repository calls it only with `"paid"`. Ask whether that proves compatibility for a shared API, and whether unchanged declarations would instead prove unchanged behavior. Expected: identify the excluded old caller accepting an arbitrary string; require an intentional compatibility decision. Separately, unchanged declarations would not establish runtime equivalence. `parameter-before`, `parameter-after-local`, and `parameter-after-external` produce green/green/TS2345; the swapped-label control supplies the behavior counterexample.

Case 4's second question is a boundary check, not a fifth scenario to put on the page. If a reader needs all these examples explained in the Principle, shorten the Principle's claims rather than lengthen it into a manual.

## 7. Requirements for the eventual check

The eventual `checks/bonus3.cjs` should use one evolving repository in page order, with explicit resets for experiments. The probe suite here intentionally uses isolated cases to investigate alternatives; it is not a substitute for checking the manuscript's transitions.

1. Extract every fence, including diff hunks, commands, summary/reply artifacts and output blocks. Apply shown source diffs to their actual preceding state and verify the resulting files. Keep file ownership and the three fixed expected outputs unchanged between original and submitted candidate. No invisible caller rewrite between fences.
2. Pin the compiler and stated project profile. Compile the original, provider-only change, submitted two-file patch, mutation, restored patch and chosen repair. Assert every quoted diagnostic, full relevant message and manuscript-derived location. A failed emit must not leave a stale declaration accepted as evidence.
3. Produce declarations from clean before/after states with identical options. Assert the exact shown declaration diff and all referenced local declaration files needed to interpret it. The baseline `Order` must remain unchanged. If the final repair exports the alias, assert that new export and its return reference rather than claiming byte identity with the original.
4. Run the same current-case assertions for all three statuses and badges against both original and submitted candidate. The candidate genuinely passes. Run the typo separately: original compile rejection, candidate compile success and wrong badge, runtime assertion failure on the full-refund case. Undo it and assert restored green. Clearly distinguish a deliberately failing assertion from a successful compiler run.
5. Restore the old caller against the candidate to assert TS2345. Compile an unchanged consumer requiring the old union before/after/after-repair for green/TS2322/green. This demonstrates the public compatibility consequence independent of the edited local badge.
6. Verify the final typo diagnostic and restored-green control. If the page acknowledges `as const` or `satisfies` alone as smaller repairs, test their accepted caller set, declaration identity and runtime results separately. Do not silently enable isolated declarations on those counterfactuals and thereby change the question.
7. If isolated declarations is on the page, retain original TS9007, candidate TS9013 and repaired green. Also retain the green `: string` control and the trivial-export counterexample in validation, even if only the first is printed. Test the actual selected program if claiming a limited configuration scope. Require declaration emit in the config, not just the flag's name.
8. Keep the unchanged-declarations/wrong-runtime control so a future wording change cannot turn the report into a behavior guarantee. If declaration comparison becomes an automatic check, distinguish “report changed” from “incompatible”; the final named alias is itself a useful control against conflating them.
9. Update the normal check runner and coverage when drafting, then run the full suite and freeze the manuscript snapshot. This challenge changes only this file; the 43 compiler cases and 12 runtime groups remain untracked evidence.

The chapter can end decisively because the stated refactor promised the old API. Preserving it is not an unresolved taste dispute. What stays open is whether another API should widen deliberately, and which declaration tooling another project needs—not whether this summary has accurately described this patch.
