# Principle-only read: Bonus 3 draft 3 (`84074c9`)

2026-11-02. A fresh, isolated reader saw only draft 3's Principle (`principle.md`), answered Codex's four settled cases, and checked each with TypeScript 7.0.2 fixtures. The report below is verbatim.

## Principle reader report

**Passage read:** /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b3d3/principle.md (nothing else).
**Fixtures:** /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b3d3/fixtures/ with subdirectories case1, case2, case3 and case4. Compiler: TS 7.0.2. Every tsconfig uses strict, module/moduleResolution nodenext, declaration + emitDeclarationOnly, rootDir src, outDir out, and allowImportingTsExtensions.

### Case 1: dropping `as const`, with `Reason` unchanged
**Answer:** Yes, the public contract changed. `Reason` went from `"damaged" | "late"` to `string`. Evidence comes from emitting declarations before and after and diffing them. You then resolve every exported type that refers to the changed declaration; you don't have to read the callers.
**Fixture (case1/before, case1/after):** the declaration diff is a single line:
```
< export declare const reasons: readonly ["damaged", "late"];
> export declare const reasons: string[];
```
In the emitted .d.ts, `export type Reason = (typeof reasons)[number];` and `refund(reason: Reason)` are byte-identical. Their meaning changed anyway. A caller with an exhaustive `switch` over `Reason` now fails with TS2366. `const first: "damaged" | "late" = reasons[0]` fails with TS2322. A `@ts-expect-error` placed on `const bad: Reason = "lsot"` now reports TS2578 "Unused", because a typo is accepted.
**Led by:** "compare the public types. That includes the types a signature refers to: an unchanged alias can name a changed type." Also "which old calls it rejects or which results it no longer guarantees".
**Rating:** Clear on whether the contract changed. Inferred on how to get the evidence. The Principle doesn't say that a text diff leaves the alias line unchanged, so you have to resolve it yourself. It also doesn't say that widening a type used in both positions helps callers of `refund` but breaks consumers who rely on `Reason` being narrow.

### Case 2: `assertNever(kind)` replaced by `"other"` "to fix a type error"
**Answer:** The reviewer must put the old caller back and find out which change to `parseRefund` made `kind` stop being `never` in the default branch. Passing runtime tests don't settle this. What they then decide is not whether the edit compiles. It's whether `parseRefund`'s new contract is the intended one, and that call belongs to the API's owner. If the old contract was the intended one, the fix belongs in `parseRefund`, not in the caller.
**Fixture (case2/before, after, after-oldcaller):** the refactor emits `parseRefund(input: string): { kind: string; note: string }`. Before, it was a discriminated union of `kind: "damaged"` and `kind: "late"` with `days: number`. The edited caller compiles. The old caller against the new parse.ts fails with `TS2345: Argument of type 'string' is not assignable to parameter of type 'never'`. That error exposes both the widened `kind` and the dropped `days`.
**Led by:** "If the patch changes a caller to make it compile, I put the old caller back and find what required the repair." Also "Then the API's owner has to say which contract we're offering." The runtime-test sentence tells you tests are a separate check, not a substitute.
**Rating:** Clear.

### Case 3: `isolatedDeclarations`
**Answer:** In neither case does the green flag establish compatibility. The flag only says declarations can be produced file by file. In (a) the inferred public type changed. In (b) the annotation is a new promise that the compiler accepts, but nobody has checked that it's the right promise. In both cases the reviewer should look at the declaration diff and at old callers compiled against the new declarations.
**Fixture (a) (case3/a-before, a-after):** both are green under `isolatedDeclarations: true`. TS 7.0.2 infers a trivial literal return without an annotation, so the premise holds. A non-trivial return (`statuses[i]`) does error with TS9013, which confirms the flag was active. The emitted declarations go from `label(): string` to `label(): number`.
**Fixture (b) (case3/b-before-noflag, b-before-flag, b-after, b-after-alone, b-after-correct):**
- **Before:** `statusAt(i: number): "paid" | "partial" | "refunded"` without the flag. With the flag on, it errors with TS9013.
- **After `: string`:** the module alone is green (b-after-alone, exit 0) and emits `statusAt(i: number): string`. A consumer that assigns the result to the union fails with TS2322.
- **Correct fix (`: Status`):** the d.ts text differs from before (it adds a `Status` alias and `declare const statuses`), but it resolves to the same type and the consumer compiles.

That last result is the Principle's "new spelling" sentence holding up in practice.
**Led by:** "A green compile covers the revised program." Also "An explicit type gives the implementation a promise to meet; the compiler can check that promise without choosing the right one for us." That sentence fits (b) almost exactly.
**Rating:** (a) Inferred. (b) Inferred, close to Clear. The flag is never mentioned, but the last sentence carries the reasoning.

### Case 4: narrowing `format(status: string)`, and identical declarations
**(a) Answer:** No. The changed signature rejects old calls. Any external caller that passes a `string` breaks, even though every call in this repo passes `"paid"`.
**Fixture (case4/a-before, a-after, a-external):** both repo versions are green. The declaration diff shows `status: string` becoming `status: "paid" | "partial" | "refunded"`. An external consumer compiled against the new .d.ts with a `string` from `JSON.parse` fails with TS2345.
**Led by:** "For each changed signature, I ask which old calls it rejects". Also "whether the caller in someone else's repo does" and "A green compile covers the revised program."
**Rating:** Clear.

**(b) Answer:** No. Identical declarations are evidence only about the type contract.
**Fixture (case4/b-before, b-after):** `cmp` reports the two .d.ts files as byte-identical. At runtime, before gives `paid → PAID` and `refunded → REFUNDED`. After gives `paid → paid` and `refunded → THROWS not supported`, and it has a new module-level side effect.
**Led by:** "Even with identical declarations, I run the runtime tests to check the values and effects."
**Rating:** Clear.

### Did any fixture contradict the Principle?
No. Every claim held:
- **"an unchanged alias can name a changed type":** case 1 shows the alias line byte-identical while its meaning changed.
- **"A green compile covers the revised program":** cases 3b and 4a show green modules breaking outside callers.
- **"If a new spelling accepts the same inputs and promises the same results, the type contract is unchanged":** case3/b-after-correct confirms it. That spelling also adds a new exported `Status` type. That's purely additive, but the Principle doesn't mention additions.
- **"the compiler can check that promise without choosing the right one":** case 3b, where `: string` compiles.

One side observation: TS 7.0.2 emits .d.ts even when the compile has errors, so before/after diffs can be taken from a broken tree.

### Strongest and weakest sentences
**Strongest:** "If the patch changes a caller to make it compile, I put the old caller back and find what required the repair." It's a concrete move with a clear result, and it answered case 2 on its own. A close second is "an unchanged alias can name a changed type", the one non-obvious insight here. The fixture showed it exactly.

**Weakest:** "A green compile covers the revised program." The word "covers" is ambiguous: it can read as "protects" rather than "only speaks for". I had to read the next sentence to learn it means "proves only". That next sentence, "I check whether the old version of the caller we just edited still compiles…", mostly restates the "put the old caller back" sentence two lines earlier.

**Unclear:** "the compiler can check that promise without choosing the right one for us". It parses as if the compiler checks *without choosing*, a method, rather than *but cannot choose*, a limit. Plainer: "the compiler checks the promise; it can't tell you it's the right one."

### Spec, manual or hedge?
- **Paragraph 1 reads like a runbook.** "I emit declarations before and after, with the same compiler and project settings, and compare…" and "I check whether… and whether…" are procedure steps, especially "with the same compiler and project settings".
- **The testable rule is buried.** "which old calls it rejects or which results it no longer guarantees" opens paragraph 2. The rule should come first and the procedure follow.
- **No hedging.** "Then the API's owner has to say which contract we're offering" sounds like an expert, not a manual.

### Enjoyed / bored
- **Enjoyed:** the alias line, which was a small surprise I could verify, and "put the old caller back", which is crisp and memorable. The last sentence about promises lands once decoded.
- **Bored:** the middle of paragraph 1 ("A green compile covers… I check whether the old version… and whether the caller in someone else's repo does"). It circles a point already made.

### What I needed that it doesn't say, or think is wrong
Nothing it says is wrong. Gaps:
1. **A text diff of declarations is not a type diff, in either direction.** In case 1 the text is the same and the meaning changed. In case3/b-after-correct the text changed and the meaning didn't. The Principle says "compare the public types" but gives no way to do that without reading callers. The practical way is to compile the old callers, or a small type-level probe of the old contract, against the new declarations.
2. **It says "For each changed signature", but case 1's change is in a type, not a signature.** A reader needs "for each changed type, check each position it appears in". Widening a type helps callers on the input side and breaks consumers who rely on the output.
3. **"the caller in someone else's repo" is not something a reviewer can actually check.** It should say what stands in for it: the declaration diff plus the reject/guarantee question.
4. **`isolatedDeclarations` and similar "declaration hygiene" flags.** One clause saying a green flag is a statement about the build, not about compatibility, would make case 3 Clear rather than Inferred.
5. **Additions to the public surface,** such as a newly exported alias, are not covered. They are compatible, but a reviewer will see them in the diff and wonder.
