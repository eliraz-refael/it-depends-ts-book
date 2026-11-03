# Principle-only read: Bonus 3 draft 1 (`c51900a`)

2026-11-02. A fresh, isolated reader saw only the Principle (`principle.md`), answered Codex's four settled cases, and checked each with TypeScript 7.0.2 fixtures. The report below is verbatim.

## Principle reader report

### Case answers

**1. Dropping `as const` from `reasons` in an "internal refactor"**
- **Answer:** Yes, the public contract changed. `Reason` widens from `"damaged" | "late"` to `string`, and `reasons` changes from a readonly tuple to a mutable `string[]`. The `Reason` line is unchanged in the source and in the emitted `.d.ts`, so a reviewer who looks only at the annotations would miss it.
- **Evidence you get without reading callers:**
  - The declaration diff shows `export declare const reasons: readonly ["damaged", "late"];` becoming `export declare const reasons: string[];`.
  - The `export type Reason = (typeof reasons)[number];` line is identical in both outputs.
  - A type-level test, `Equal<Reason, "damaged" | "late">`, passes before and fails after with TS2322.
  - In a side fixture, a typo `const typo: Reason = "lat"` is TS2820 before and silently accepted after. An exhaustive `switch` over `Reason` starts failing with TS2366.
- **Sentences that led there:** "I compare the public types before and after…" and "That includes the types a signature refers to: an unchanged alias can name a changed type." Also "Emitted declarations let you inspect its public types."
- **Rating:** Clear.

**2. `assertNever(kind)` becomes `return "other"` "to fix a type error"**
- **What the reviewer must establish:** Put the old `default: return assertNever(kind);` back and see what it rejects. In the fixture the restored line fails with TS2345, "Argument of type 'string' is not assignable to parameter of type 'never'". That exposes the real change: the `parseRefund` refactor dropped its return annotation and widened the return type. The declaration diff confirms it: `parseRefund(raw: string): RefundKind` became `parseRefund(raw: string): string`. So the "type error" was the exhaustiveness check doing its job, and the edit silenced it.
- **Behavior also changed.** Before, an unknown kind threw. After, it silently becomes "other". Current tests pass only because they never feed an unknown kind.
- **What they actually decide:** Which contract `parseRefund` supports.
  - If it is the closed `RefundKind`, restore the annotation and the `assertNever`.
  - If it is open strings, then "other" is deliberate, it is a public breaking change, and it needs saying.
- **Sentences that led there:** "If the patch also fixes a caller, I put the old caller back and find what required the repair." Also "We still have to decide which contract we intend to support." and "Keep the runtime assertions."
- **Rating:** Inferred. I had to treat the `default` branch as "the caller", and the Principle never says whether `assertNever` counts as a runtime assertion. "Keep the runtime assertions" could mean the test suite or the checks in the code.

**3. `isolatedDeclarations` stays green**
- **(a) `return "paid"` changed to `return 42`, unannotated:** In TS 7.0.2 this is accepted under the flag, and the emitted return type goes from `string` to `number`. That is a breaking change and the flag stays green. Note the before case emits `string`, not `"paid"`, because the literal return widens.
- **(b) Fixing the error with `: string`:** The unannotated `status(paid) { return paid ? "paid" : "open"; }` fails under the flag with TS9013. Without the flag its declaration is `"open" | "paid"`. Annotating `: string` makes the flag green but widens the return. A consumer doing `const s: "paid" | "open" = status(true)` compiles against the old `.d.ts` and fails against the new one (TS2322).
- **Answer:** In neither case does green prove compatibility. The flag only says declarations can be produced file by file. The reviewer should look at the before/after declaration diff and decide whether the annotation chosen is the intended promise.
- **Sentences that led there:** "An explicit type gives the implementation a promise to meet; the compiler can check that promise without choosing the right one for you." Also "compare the public types before and after, with the same compiler and project settings."
- **Rating:** Inferred. The Principle never mentions `isolatedDeclarations` or any other "green check", so I had to map the last sentence onto it myself. It maps well for (b) and loosely for (a).

**4. Narrowing `format(status: string)` to a literal union**
- **(a) Compatible for a shared API?** No. Inside the repository everything compiles, and the declaration diff shows the parameter change. An outside consumer compiled against the new `.d.ts` fails twice with TS2345: once for a `string` from a database, once for the literal `"void"`.
  - Sentences: "The revised program compiling is useful evidence. It doesn't answer for the caller we just edited, or the caller in someone else's repo."
  - Rating: Clear.
- **(b) Do byte-identical declarations prove behavior is unchanged?** No. The fixture changes the body from `toUpperCase` to `toLowerCase`, plus a throw on "refunded". The `.d.ts` outputs are byte-identical.
  - Sentences: "identical declarations don't prove identical behavior. Keep the runtime assertions."
  - Rating: Clear.

### Do the fixtures contradict any claim?
No. Each claim held:
- **"an unchanged alias can name a changed type":** Case 1. The `Reason` line is byte-identical in both `.d.ts` files while its meaning went from a two-literal union to `string`.
- **"It doesn't answer for … the caller in someone else's repo":** Case 4a. The repository compiles; the outside consumer gets two TS2345 errors.
- **"identical declarations don't prove identical behavior":** Case 4b. `diff -r` reports no difference while the runtime body differs.
- **"the compiler can check that promise without choosing the right one for you":** Case 3b. `: string` satisfies the flag and still breaks a consumer.

One nuance the Principle doesn't touch, but doesn't contradict: TS 7.0.2 lets an unannotated literal return through `isolatedDeclarations` and emits it widened. So "the flag forces annotations" is not something to rely on.

### Strongest and weakest sentences
- **Strongest:** "That includes the types a signature refers to: an unchanged alias can name a changed type." It is concrete and a little surprising, and it led straight to the right answer in case 1. Close second: "If the patch also fixes a caller, I put the old caller back and find what required the repair." It is a procedure I can run tomorrow.
- **Weakest:** "We still have to decide which contract we intend to support." It is true, but it doesn't say who decides or on what basis. Also "a textual difference still needs interpretation": it names a problem without giving the rule for interpreting it.
- **The missing rule:** A declaration diff is breaking when parameters narrow or return types widen. That variance rule is the single thing that would have made cases 3 and 4 fully Clear.
- **Also unclear:** "Keep the runtime assertions." It is abrupt and ambiguous between tests and in-code checks like `assertNever`.

### Spec, manual or hedge?
- **Paragraph 1** sounds like an expert: first person, things Daniel actually does.
- **Paragraph 2** turns into caveats: "useful evidence… doesn't answer…", "still needs interpretation", "don't prove". Three qualifiers in a row read like a hedge more than a person talking.
- **The final sentence** is elegant but abstract. It reads like an aphorism rather than something Daniel would say while looking at a diff.

### Where I enjoyed it, where I got bored
- **Enjoyed:** The alias twist, and "the caller in someone else's repo". That one lands because it names the reader's real fear.
- **Bored:** The middle of paragraph 2. "The summary is a claim about the change" is obvious once said and slows the pace.

### What's missing, or wrong
Nothing in it is wrong. Missing:
1. **How to compare public types.** Paragraph 1 says "compare the public types" but doesn't say how. The "emit declarations and diff them" step only arrives in paragraph 2.
2. **The variance rule.** Narrowed parameters or widened returns break callers.
3. **Type-level tests as evidence.** An `Equal<Reason, …>` assertion caught case 1 without reading a single caller, which answers case 1's "without reading every caller" more directly than the Principle does.
4. **Green checks.** Nothing says that "green" from flags like `isolatedDeclarations`, or from runtime tests, doesn't establish compatibility. The same-settings point covers it only implicitly.
5. **Literal returns widen in declarations.** `return "paid"` emits `string`, so the declaration may already be broader than the author thinks.
