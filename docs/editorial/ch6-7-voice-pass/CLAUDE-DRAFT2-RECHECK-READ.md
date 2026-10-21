# Ch6 recheck: notes from a first-time reader

File read: `ch6-full.md` (370 lines), and nothing else.

## 1. The rule alone (read before "## The Debate")

The rule (line 20):

> "Use a type parameter when a caller needs a relationship between types in the signature. Ask what supplies the type argument and what depends on it. If nothing else depends on it, try removing it. If only the caller's chosen type supplies a return-only `T`, with no check to establish it, treat that as an assertion. The type argument is a claim, not evidence."

Line 22 adds: "Whether to write the generic before a second caller needs it is a separate decision. This rule tells us what the signature promises, not when to generalize."

- **(a) `logPayload<T>(payload: T): string`.** The rule decides this one. The argument supplies `T` and nothing depends on it. The return is `string`, whatever `T` is. So the rule says "try removing it," which gives `payload: unknown`.
- **(b) `parseConfig<T>(input: string): T`.** The rule decides this one too. `T` is return-only and only the caller's choice supplies it. Nothing in the body checks it. So the rule says "treat that as an assertion." Note that the rule *classifies* it but does not say *reject*. It says "treat as an assertion," not "don't write it." That matters for Q2.
- **(c) one-caller `sortByName<T extends { name: string }>` vs `sortEmployees(items: Employee[])`.** The rule leaves this open, and says so. `sortByName` passes the relationship test because `T` goes in and comes out. `sortEmployees` has no type parameter, so the rule has nothing to say about it. Line 22 explicitly sets aside the question of whether to generalize now. I could tell that before reading the debate, which is good. The Principle is testable and honest about its scope.

## 2. `querySelector<HTMLInputElement>` vs `parseConfig<T>`

Under the Principle, the two are the same thing: a return-only type argument that only the caller supplies and nothing checks. Both are "assertions." The chapter accepts one and rejects the other on grounds the rule never states. Here is where the chapter explains the difference:

- Line 119 (Daniel): "`E extends Element` limits the choice, and the DOM call really does return an `Element` or `null`. Knowing the markup can justify a narrower element type."
- Line 252 (Daniel): "The caller chooses an unconstrained `T`. Unlike the DOM call, this body can return any JSON value, not necessarily even an object."
- Line 268 (Idan) partly undercuts the constraint argument: "Adding a constraint wouldn't make it check the JSON either."
- Table rows 339 and 340 give the two outcomes: "Justify the narrower type from the markup, as you would an `as`" vs "Return `unknown`, or a concrete `ParseResult<YourType>`."

**Is it clear?** Only partly. Piecing it together, I get roughly this: the DOM really does check the base type (`Element`), so the unchecked part is only "which subtype." `parseConfig`'s unchecked part is the whole shape. It's also our own function, so we can rewrite it to return `unknown` and parse. But:

- The "it's our function, we can change the body" criterion is never said. Without it, Idan's line 268 makes the constraint argument look like a matter of degree.
- Nobody mentions the runtime check that does exist for the DOM case: `el instanceof HTMLInputElement`. A reader will ask why the chapter rejects unchecked `parseConfig` but tolerates unchecked `querySelector<E>` when a one-line check is available.
- Oded's "So we keep the brackets…?" (line 117) treats it as code we wrote. It is a lib declaration, so "keep" reads oddly.

The Verdict (line 327) only says a return-only caller-supplied parameter "is an unchecked claim." So the accept/reject split lives only in the table.

## 3. Oded vs Noam on *when* to write the generic

Both get competent arguments.

- **Noam's best:** "The constraint describes what this body reads. I can test it with just `{ name: 'Ada' }`, without constructing an `Employee`. It doesn't promise to sort every future list." (line 171). Also: "This implementation only uses `name`. Why require an entire `Employee`?" (line 167).
- **Oded's best:** "You're choosing `name` as the shared contract before we know what the vendor list needs. It might use `displayName`, or need a different tie-break." (line 169), followed by "I can generalize the signature later without changing `sortEmployees(team)`. When there's another caller, we'll know whether it actually shares the operation." (line 173).

Two small weaknesses:

- Noam's first example (`firstElement(items: unknown[])`) argues against a position Oded doesn't hold. Oded rightly answers "you could have written `string[]`."
- Noam's line 61 is awkward: "We don't need to wait for a second caller to write these three lines once."

**Is the ending honest?** Yes. Line 329 says: "Noam would keep `sortByName`… Oded would keep `sortEmployees`… The relationship test does not decide that timing question." Liron, line 323: "The signature alone does not tell us whether you needed the generic." It is honest, and the Principle set that expectation at line 22. The cost: Oded's "Which is the part that comes up in my PRs" (line 65) names the practical question, and the chapter then gives the reviewer no tie-break or heuristic for it. That's acceptable, but readers may feel the chapter's most practical question goes unanswered.

## 4. Additional Takes

- **Linoy, `const T`:** new application (keeping a literal tuple). Good.
- **Linoy, `NoInfer`:** new application, and it links back to Eden's inference section. **Its effect is only partly visible.** The text says "is rejected" and "`"blue"` joins the inferred type." But it never shows that `T` is inferred as `"red" | "green"`. A reader needs to know that `T extends string` keeps literals, and that isn't taught here. It also never says *why* you'd want rejection: the fallback must be one of the listed values. There's no return type, no body and no error text. I'd add the inferred `T` and the error line.
- **Idan, `parseWith`:** a new and useful application. It shows the honest way to write a generic parser, where `T` comes from evidence. This is the best take.
- **Eli:** "We can also compute with that type variable: branch on it, walk an object's keys, build another type from it." This adds no limit and no application. It's a teaser for later chapters, and it repeats Daniel's conditional-type aside at line 175. Weak.

## 5. Unclear speakers and answers to nothing

Every line has a clear speaker. The real problem is lines that answer something nobody said:

- **Line 82 (Daniel):** "`JSON.stringify(undefined)` returns `undefined`, although the library declares `string`. This annotation includes that missing case." Nobody asked about this. It's a lib-accuracy footnote dropped into the single-use-`T` demo, and it pulls attention from the point. The `string | undefined` return exists only to be correct about `stringify`.
- **Line 175 (Daniel):** the conditional-types `extends` aside cuts off the Oded/Noam exchange, the chapter's central disagreement, with an unrelated note.
- **Line 228 (Eden):** "I also write explicit return types on exported functions…" is a topic jump after `createStore`. It's there to set up Linoy's reply rather than to answer anything.
- **Line 262 (Daniel):** "Still compiles." repeats Idan's code comment `// still compiles — no \`as\` required` right above it.
- **Line 303 (Daniel):** restates Idan's line 301 answer to Oded.
- **Line 343:** Daniel speaks inside the Verdict to introduce two more examples after the verdict has landed. It's unclear who he's addressing, and it extends the section after its conclusion.

## 6. Narrator scoring, slogans, repetition, rhythm

- **Code-comment scoring:**
  - `// The rule, visibly working: every position tied to another.` (line 346)
  - `// Danger: the anti-pattern. T exits everywhere and enters nowhere.` (line 355). This is a forced slogan, and it's also inaccurate: `T` appears in exactly one position.
  - `// Honest: returns exactly what it has` / `// Honest: produces the T — or tells you why it couldn't` (lines 271, 276).
  - `// T inferred as null. Forever.` (line 214) is mild and acceptable.
- **Repeated conclusion, "the type argument doesn't check":**
  - Three times in a row for `querySelector`: "It does not check that `.email` will find an input element" (111), "The type argument doesn't inspect the DOM" (115), "The type argument still doesn't check that knowledge" (119).
  - Then again at 252 ("Nothing checks the `retries` field"), 268, 327, 339 and 340, plus the `loadState` comment ("no relationship, no evidence").
- **Repeated "timing isn't settled":** lines 22, 63, 323 and 329. Lines 323 and 329 come almost back to back.
- **Machine rhythm in Liron's Turn:** "A lens holds no picture. You grind the glass and point it at a scene." / "It does not have to admit a scene it will never see." / "You are right to ask — the image only gets us so far." That last one is the familiar move where the metaphor admits its own limits. "The work here need not be a transformation. It can be carrying information that an `unknown` return would lose" reads like an explanation written in prose and given to Liron to say.
- **"X, not Y" cadence:** "a claim, not evidence" (20), "what the signature promises, not when to generalize" (22), and "It isn't a function promising…" (301). This is moderate, not severe.
- **Quips:** "Finally. A refactor that deletes something." (99) is fine once.
- **Title:** "The Hole in the Function" never pays off inside the chapter. Liron's metaphor is a lens, not a hole.

## 7. TypeScript claims

These assume ES module, strict, `exactOptionalPropertyTypes`, TypeScript 7.0.2, and `noUncheckedIndexedAccess` off.

**Know (correct):**
- `identity("hello")` gives `"hello"`, and `identity({ id: "u1" })` gives `{ id: string }`.
- `firstItem(names)` is `string | null`.
- `logPayload<Something>(p)` breaks once `T` is removed, while inferred calls still work.
- The DOM overload `querySelector<E extends Element = Element>(selectors: string): E | null`.
- `sortByNameFlat` loses `department`.
- `get` gives `string` / `number`, and `"fontsize"` is rejected.
- `createStore(null)` infers `null`, and the error text is right.
- `parseConfig` compiles with or without `as`, because `JSON.parse` returns `any`. The runtime TypeError is right.
- `pluck` gives `string[]`.
- `const` type parameters arrived in 5.0. With a `readonly string[]` constraint they give `readonly ["/home", "/about"]`.
- `NoInfer` arrived in 5.4, and `setDefault(["red","green"], "blue")` is rejected with it.
- `JSON.stringify(undefined)` returns `undefined` at runtime.

**Believe (fairly confident, not verified):**
- `lib` still declares `JSON.stringify(...)` as returning `string` in TS 7.0.2.
- In `parseRetryConfig`, `typeof data.retries !== "number"` after `"retries" in data` narrows `data.retries` to `number`, so `{ retries: data.retries }` type-checks.
- Without `NoInfer`, `T` becomes `"red" | "green" | "blue"`, because literal candidates with the same base type get unioned.

**Unsure:**
- The error text at line 197 lists `'"fontSize" | "telemetry" | "theme"'`, which is alphabetical. In TS 5.x I'd expect declaration order, `"theme" | "fontSize" | "telemetry"`. TS 7's deterministic type ordering may produce the alphabetical version. If the build checks error text verbatim, it's fine; if not, re-check it on 7.0.2.

**Imprecise:**
- Line 268: "`get` reads a property whose key is constrained." What makes `get` legitimate is that *both* `T` and `K` come from arguments, not the constraint as such.
- Line 355 "T exits everywhere": see Q6.
- Table row 337 says "the `T → T` shape", but the example is `T[] → T[]`. Minor.

## 8. What I'd still change (ranked)

1. **State the accept/reject criterion for return-only type arguments.** Right now the Principle labels `querySelector` and `parseConfig` the same way, as assertions, and only the table separates them. Have Daniel say it plainly. For example: the DOM already checks `Element`, so the leftover claim is small, and we can't rewrite the lib. `parseConfig` is ours, so we can return `unknown` and parse. Also mention `instanceof HTMLInputElement` as the check you can add when the markup isn't yours.
2. **Cut the repetition of "the type argument doesn't check."** Keep one of lines 111, 115 and 119. Also drop the `JSON.stringify(undefined)` aside at line 82. One option is to make `logPayload` return `void`, or something that is plainly `string`, so the demo stays about `T`.
3. **Fix the asides that interrupt.** Move Daniel's conditional-`extends` note (line 175) out of the Oded/Noam exchange, or cut it. Cut or replace Eli's Additional Take, which is a teaser that repeats line 175. Consider dropping or reframing Eden's explicit-return-types tangent (line 228).
4. **Make the `NoInfer` example visible.** Show `T` inferred as `"red" | "green"`, the error on `"blue"`, and the purpose in one clause ("the fallback must be one of the values").
5. **Remove the scoring in code comments.** Drop "Danger: the anti-pattern. T exits everywhere and enters nowhere", which is also inaccurate; "The rule, visibly working"; and the "Honest:" labels. Let Daniel's line 343 carry the contrast. Also trim Liron's "the image only gets us so far" move.
