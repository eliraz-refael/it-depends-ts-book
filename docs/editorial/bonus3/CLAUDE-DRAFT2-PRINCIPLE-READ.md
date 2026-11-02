# Principle-only read: Bonus 3 draft 2 (`75182a8`)

2026-11-02. A fresh, isolated reader saw only draft 2's Principle (`principle.md`), answered Codex's four settled cases, and checked each with TypeScript 7.0.2 fixtures. The report below is verbatim.

## Principle reader report

### Case answers

**1. `as const` dropped from `reasons`; `Reason` alias line unchanged.**
- **Answer:** Yes, the public contract changed. `Reason` used to be `"damaged" | "late"` and is now `string`. `reasons` went from `readonly ["damaged", "late"]` to a mutable `string[]`.
  - Code that takes a `Reason` now accepts more, which is harmless.
  - Code that relies on `Reason` being a closed set breaks: exhaustive switches, and assigning a `Reason` to the literal union.
- **Evidence without reading callers:** emit declarations before and after, then diff them.
- **Led by:** "compare the public types. That includes the types a signature refers to: an unchanged alias can name a changed type." Also "which results it no longer guarantees."
- **Rating: Clear.**
- **Fixture (c1/libonly-*):** both versions compile green. The diff is one line: `export declare const reasons: readonly ["damaged", "late"];` becomes `export declare const reasons: string[];`. The line `export type Reason = (typeof reasons)[number];` is byte-identical in both .d.ts files, so the "unchanged alias" claim holds exactly. With an in-repo exhaustive caller added (c1/before, c1/after), the after build fails with TS2366 and TS2322. The compiler only catches this when such a caller happens to exist.

**2. `parseRefund` refactor; `assertNever(kind)` changed to `return "other"`.**
- **What the reviewer must establish:**
  1. Put the old caller back and recompile.
  2. Find what forced the repair. In the fixture, `parseRefund`'s result changed from a discriminated union, `{kind:"full"} | {kind:"partial"}`, to `{kind: string; …}`. Restoring the old `report.ts` gives TS2345: "Argument of type 'string' is not assignable to parameter of type 'never'."
- **Why the passing tests don't settle it:** they cover the revised program and only the inputs they exercise. Nothing tests the new "store-credit" path.
- **What actually gets decided:** not whether `"other"` is an acceptable default. The question is which contract `parseRefund` offers: a closed set of kinds, or an open string. That is the API owner's call.
- **Led by:** "If the patch changes a caller to make it compile, I put the old caller back and find what required the repair." Also "A green compile covers the revised program" and "Then the API's owner has to say which contract we're offering."
- **Rating:** Clear for what to establish. Inferred for who decides: the text says the owner decides, but does not say the reviewer's job is to escalate rather than approve.

**3. `isolatedDeclarations`.**
- **(a) `return "paid"` changed to `return 42`, no annotation, flag green.**
  - **Answer:** green does not mean compatible. Look at the declaration diff.
  - **Fixture (c3/after-a):** under 7.0.2 with `isolatedDeclarations`, `export function label() { return "paid"; }` compiles. It emits `label(): string`, widened. The `42` version also compiles and emits `label(): number`. The diff shows a breaking change while the flag stays green. A probe (c3/probe) confirms the flag still rejects non-trivial cases (TS9039, TS9013); it lets literal returns through.
  - **Led by:** "A green compile covers the revised program" and "compare the public types."
  - **Rating: Inferred.** The Principle never mentions `isolatedDeclarations`. I had to work out that the flag only checks whether a declaration can be produced, not whether it matches the old one.
- **(b) Fixing an isolated-declarations error with `: string`.**
  - **Answer:** the flag doesn't establish compatibility here either. The annotation can either preserve the old declaration or change it.
  - **Fixture (c3/after-b):** the declarations are byte-identical to before, because inference had already widened to `string`. This is the "different spelling of the same type" case.
  - **Caveat:** where inference was narrower (a literal type via `as const`, or an object literal), the same annotation would widen the result and silently drop a guarantee.
  - **What remains open even when the diff is identical:** whether `string` is the right promise or `"paid"` should be.
  - **Led by:** "An explicit type gives the implementation a promise to meet; the compiler can check that promise without choosing the right one for us." Also "A different spelling of the same type needn't change that contract."
  - **Rating: Inferred.** The rule applies cleanly once you know what the flag does, but the Principle doesn't tell you that.

**4. Narrowing a parameter and identical declarations.**
- **(a) `format(status: string)` narrowed to a three-literal union.**
  - **Answer:** no, an in-repo compile doesn't prove compatibility. The narrower parameter rejects old calls such as `format(someString)` and `format("pending")`.
  - **Fixture (c4/ext):** an "external repo" caller compiled against the after .d.ts fails with two TS2345 errors. The in-repo build stays green.
  - **Led by:** "For each changed signature, I ask which old calls it rejects." Also "A green compile covers the revised program… and the caller in someone else's repo."
  - **Rating: Clear.**
- **(b) Byte-identical declarations.**
  - **Answer:** no, that doesn't prove behavior is unchanged.
  - **Fixture (c4/rt-*):** the d.ts files are identical. Run under node 22, `format("paid")` returns `[paid]` before and `PAID` after.
  - **Led by:** "Even with identical declarations, I run the runtime tests to check the values and effects."
  - **Rating: Clear.** One nit: running the tests checks behavior but doesn't prove it unchanged either. The Principle says "check", which is honest.

### Contradictions from fixtures
None. Four claims were confirmed directly:
- "an unchanged alias can name a changed type": the alias line was identical in c1 while the type changed.
- "A green compile covers the revised program": c2, c3a and c4a.
- "A different spelling of the same type needn't change that contract": c3b gave an identical d.ts.
- "Even with identical declarations, I run the runtime tests": c4b.

### Strongest and weakest sentences
- **Strongest:** "an unchanged alias can name a changed type." It's short, surprising, and true to the byte; it answered case 1 on its own. A close second is "If the patch changes a caller to make it compile, I put the old caller back and find what required the repair." It is a concrete move, and it answered case 2.
- **Weakest:** "I also want an answer for the caller we just edited, and the caller in someone else's repo." An answer to what? I had to rebuild the question ("does the old call still compile and still mean the same thing?") from the next paragraph.
- **Also unclear:** "Then the API's owner has to say which contract we're offering." It doesn't say whether the reviewer blocks until the owner rules, or what form "say" takes (semver bump, changelog, docs).

### Spec, manual or hedge?
- "with the same compiler and project settings" reads like a manual. It is justified, though: fixture 3 shows inference depends on the compiler version and flags.
- "A different spelling of the same type needn't change that contract" is hedgy. "needn't" leaves you asking when it does. A plainer version would be: "A diff that only respells a type isn't a change; check what it accepts and returns."
- "I run the runtime tests to check the values and effects" is flat and procedural.
- The rest sounds like a person who has been burned.

### Enjoyment and boredom
- **Enjoyed:** the first paragraph's momentum, the alias line (a real aha), and the closing sentence about the compiler checking a promise "without choosing the right one for us". That last one is the most expert-sounding line.
- **Got bored:** "I run the runtime tests" is obvious. Paragraph 1 also ends abruptly on the owner sentence, which feels bolted on.

### Missing or wrong
Nothing is wrong. What's missing:
1. **How to compare.** Emit both versions into separate outDirs and diff all .d.ts files, not just the changed module, since an alias can resolve through another file.
2. **Which flags don't help.** `isolatedDeclarations` (and similar flags) only check that a declaration can be produced; they don't compare it with the last release. Case 3 had to be inferred, and I only learned that 7.0.2 infers literal returns by running it.
3. **Passing tests cover only the inputs they exercise.** Case 2's new kind sailed through the test suite.
4. **What counts as "public".** It means package entry points and exports, not every exported symbol in the repo.

The rejects/no-longer-guarantees sentence covers the variance rule (narrowed inputs, widened outputs) compactly. Spelling it out with one example each would make it testable at a glance.
