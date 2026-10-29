<!-- Verbatim report of an isolated Principle-only reader of Ch26 draft 1 (259d914), commissioned by Claude on 2026-10-28. It saw only the Principle section. -->

# Principle-only reader report (Ch26 draft 1)

**What I read:** only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-readers/principle/PRINCIPLE.md`. I opened no other book or repo file. I used the ch26 worktree's `tsc` binary (TypeScript 7.0.2) and Node 22.23.4.

**Fixtures:** `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-readers/principle/work/`, with subfolders `a/`, `b/` and `c/` (each holds one `.ts` file, and `b/` also has `b-run.mjs`) and `d/` (`ship.ts`, `test/ship.types.ts`, `test/ship.test.mjs`, `tsconfig.json`, `tsconfig.all.json`). I compiled `a`, `b` and `c` with `--ignoreConfig --strict`, and `d` with its local tsconfigs. I verified all four cases, not only (b) and (d).

---

## (a) Branded amount, `@ts-expect-error` over a bad call

**Answer:** No. The green check does not establish the claim. The call has two errors: `to` is missing, and `-5` is not a `PositiveAmount`. The directive is satisfied by either one. I confirmed this: when I pointed the same test at a `transferBroken` whose `amount` is a plain `number`, it stayed green, because the missing `to` still produces an error.

**Repair:**
```ts
const valid = { from: "a", to: "b", amount: positive(5) };
transfer(valid);                    // the positive case compiles
const raw: number = 5;
// @ts-expect-error: rejects an unvalidated amount
transfer({ ...valid, amount: raw });
```
Against `transferBroken`, the repaired test goes red with TS2578 "Unused '@ts-expect-error' directive". That is the break / see-fail / undo / see-pass loop the Principle asks for.

**Relied on:** "For a forbidden call, construct a valid value of the type you mean to reject outside the suppression, then put only the forbidden operation under `@ts-expect-error`." "That directive wants an error; it doesn't check your explanation." "Before you trust either, break the claim it names and run the command you trust."

**Verdict: Needed inference.** "A valid value of the type you mean to reject" is awkward to parse. On my reading it means "a well-formed value of the rejected type" (a real `number`, not `-5` inline). The Principle never says the rest of the call must be valid too, meaning every other field correct so the forbidden part is the only possible error. I inferred that from "only the forbidden operation". A reader who takes "the forbidden operation" to mean the whole call would put the whole broken call under the directive and change nothing.

**Follow-up (+5 instead of -5):** No. `to` is still missing, so the directive is still satisfied for the wrong reason. My fixture shows the +5 version green in exactly the same way. The sign was never the issue: the type rejects any unbranded number. **Verdict: Clear**, by the same sentences. "Doesn't check your explanation" is the line that does the work here.

## (b) `parseUsers` returning `any`

**Answer:** `const x: User[] = parseUsers(raw)` only shows that the result can be assigned to `User[]`. `any` can be assigned to anything, so the test would pass whatever the function returns. It establishes almost nothing.

**Ways to detect `any`** (I verified both):
- A forbidden operation on the inferred result: `const r = parseUsers(raw); // @ts-expect-error` then `r.notAProperty;`. With the unannotated function this fails with TS2578 "Unused directive", which exposes the `any`.
- An exact comparison: `Expect<Equal<ReturnType<typeof parseUsers>, User[]>>` fails with TS2344.

**Relied on:** "A positive assignment alone also accepts `any`." "Test a forbidden operation on the inferred result, or compare the part of its type you mean to promise."

**Verdict: Needed inference.** It is clear once decoded, but the reader has to invent the "forbidden operation" (an unknown property access, or passing the result to something that takes `number`). "Also" is confusing: also as well as what?

**Follow-up (annotated `: User[]`):** No. The exact `ReturnType` check now passes, and `r2.notAProperty` is rejected. But the body still returns `JSON.parse`'s `any` unchecked. At runtime (`b/b-run.mjs`), `parseUsers2('{"oops": true}')` returns `{ oops: true }`, which is not an array. The type test proves the signature, not the parsing. What I'd change: add a runtime test with bad input, and/or make the body validate the data (`unknown` plus a guard or schema).

**Relied on:** "Test actual values and effects by running them: a type test can check a function's promise without proving that its body keeps it."

**Verdict: Clear.** This is the best sentence in the Principle.

## (c) Intersection flattened to an object literal

**Answer:** Don't revert. The maintained promise is property access plus mutual assignability, and all of those checks pass. In my fixture they compile against the flattened type, while `Equal<ReturnType<typeof newH>, {a:1}&{b:2}>` fails with TS2344. The Equal assertion is pinning a representation that callers can't observe through the stated contract. I'd change the test: replace the exact Equal with the assignability and key checks, or with an Equal against the new form, whichever matches the stated promise.

**Relied on:** "Exact comparisons can demand distinctions your callers don't need, so name the promise before choosing the assertion." "...or compare the part of its type you mean to promise."

**Verdict: Clear**, because the case states the promise. Without that, "name the promise" gives no guidance on how.

**Follow-up (removing `readonly`):** No. Mutual assignment still works both ways in my fixture, because `readonly` doesn't affect assignability. But callers can now write `w.a = 1`. A `// @ts-expect-error` over that write, which held before, now reports TS2578, and an exact Equal against the readonly shape fails. Whether this breaks a caller depends on whether immutability was part of the promise. Mutual assignability is not the right detector either way.

**Relied on:** "Test a forbidden operation on the inferred result", where the forbidden operation is the write, and "name the promise before choosing the assertion".

**Verdict: Needed inference.** The Principle never says that some promises are prohibitions which no assignability check can see. I inferred it from the forbidden-operation sentence.

## (d) A new compile-only type-test file; both CIs green

**What I'd ask or demonstrate:**
1. Is the file actually in the program the CI type check compiles? In my fixture, a `tsconfig.json` that includes only `ship.ts` gives exit 0 even after I broke `ship`'s contract (`id: string | number`). The types file was simply never checked.
2. Break the contract and run the CI command. `tsc -p tsconfig.all.json` goes red with TS2578. Undo the break and it goes green again.
3. Is the file excluded from the runtime runner?

A planted error would answer (1) but not (2). The Principle says this outright.

**Relied on:** "Before you trust either, break the claim it names and run the command you trust. See the test fail, undo the change, and see it pass. Do that when you add a test, change it, or move it." "An error you planted anywhere in the file can show that the compiler checks the file; changing the contract shows whether the test protects that contract." "Keep compile-only calls out of the runtime runner."

**Verdict: Clear** for (1) and (2). Not enough for (3): it says what to do but not how to check it.

**Follow-up (does `test/ship.types.ts` stay out of the runner?):** No, it is not safe. On Node 22.23.4, plain `node --test` with default discovery picked up `test/ship.types.ts`, stripped its types and ran it. The output was `SHIPPED 42` and then `Error: ship() actually executed with 42`, reported as `not ok 2 - test/ship.types.ts`. The `.types.ts` name does nothing: the `test/` directory pattern catches every file in it. The same file under `types/` was not discovered. The behaviour depends on the runner and its config, not on the filename. In a setup that swallows errors, or where the forbidden call has side effects but doesn't throw, the run could even be green.

**Relied on:** "Keep compile-only calls out of the runtime runner."

**Verdict: Not enough.** It gives the goal, but nothing about discovery rules or how to confirm exclusion. A reader could reasonably think a `.types.ts` suffix is enough.

---

## 1. Weakest sentence

"Keep compile-only calls out of the runtime runner." It is the only rule with no mechanism and no check. Every other rule comes with a way to see it fail. This one hides a real trap: on Node 22, `node --test` runs `test/**/*.ts` by default. A close second is "A positive assignment alone also accepts `any`." It packs the key insight into seven words, and the "also" points back to nothing.

## 2. Terms used but not defined

- "the command you trust": which command? The CI type check? It is presumably defined elsewhere in the chapter, but here it is undefined.
- "suppression": used before `@ts-expect-error` is named, so the reader has to link them.
- "contract" and "promise": they seem to mean the same thing, but two words suggest two ideas.
- "exact-result test" / "exact comparisons": no mention of what makes a comparison exact. Intersection vs flattened, `readonly` and `any` all behave differently under different Equal implementations.
- "forbidden operation" (on a result, as opposed to a forbidden call).
- "compile-only calls" and "runtime runner".
- "break the claim": you break the code or contract so the claim becomes false. "Break the claim" reads oddly.

## 3. Rule or mood?

Mostly a rule. I could fail a PR with it for:
- a new, changed or moved type test with no evidence of the break / fail / undo / pass loop;
- `@ts-expect-error` over a call that has more than one possible error;
- a return-type test that is only a positive assignment, so `any` would pass;
- a compile-only file the runtime runner discovers;
- a type test offered as proof of runtime behaviour.

The exact-vs-assignability line is judgment, but it can be reviewed if the PR has to state the promise. I'd want the Principle to say "write the promise down" rather than "name" it.

## 4. Enjoyment and attention

The first paragraph is strong. The "Those are different questions." ending lands, and the planted-error vs changed-contract distinction is the most useful idea here. My attention dropped in paragraph 2, from "A positive assignment alone also accepts `any`" to "...so name the promise before choosing the assertion". That passage holds three separate ideas in about 40 words: the `any` trap, the forbidden-operation remedy, and exact over-specification. It reads like a compressed checklist spoken aloud. It's instructive, not fun. Putting it in Sahar's mouth doesn't make the second paragraph sound any more like speech.

## 5. One change

Rewrite the forbidden-call sentence so case (a) can't be misread: "Make the whole call valid outside the directive, using a real value of the type you mean to reject, then change exactly one thing under `@ts-expect-error`. If any other error is possible, the directive proves nothing." Close behind: one concrete clause for the runner rule, such as "check what the runner discovers: `node --test` on Node 22 runs `.ts` files under `test/`".
