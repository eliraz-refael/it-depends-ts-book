<!-- Verbatim report of an isolated Principle-only reader of Ch26 draft 3 (da6c372), commissioned by Claude on 2026-10-29. It saw only the Principle section. It reports a stray copy to /tmp/x that it deleted itself; /tmp/x does not exist after the run. -->

# Principle-only reader report (Ch26 draft 3)

**What I read:** only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r3/principle/PRINCIPLE.md`. That is two paragraphs of dialogue from Sahar Firstclass. I opened nothing else in the book or the repo.

**Fixtures:** `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r3/principle/work/` has `a/a.ts`, `b/b.ts`, `c/c.ts` and `d/` (package.json, tsconfig.json, ship.ts, `types/ship.types.ts`). I ran everything on TypeScript 7.0.2 (`--ignoreConfig --strict`, or `-p` for d) and Node v22.23.4. One slip: I briefly ran a stray `cp` to `/tmp/x`. It wrote nothing useful and I deleted it.

**Verdict up front:** for (a), (b) and (d) this is a real rule, and I could fail a PR with it. It gets vague in two places. One is the representation sentence. The other is "account for runtime selection", because it doesn't tell you which runners select which files. The (d) follow-up shows that second gap matters in practice.

---

## (a) Branded amount, missing `to`

**Answer:** No, the test doesn't establish the claim. The call leaves out `to`, so the directive is satisfied by the missing-property error whatever the type of `amount`. I checked this in `a/a.ts`: the same call with a correctly branded `amount` and no `to` is still green under `@ts-expect-error`.

**Repair:** make the call valid apart from the amount. Add a positive control, then the forbidden call:
```ts
transfer({ from: "a", to: "b", amount: ok });        // ok: PositiveAmount, compiles
// @ts-expect-error: rejects an unvalidated amount
transfer({ from: "a", to: "b", amount: -5 });
```
Then break the promise (for example, widen `amount` to `number`), see the directive go unused, and revert.

**Relied on:** "A forbidden call must be valid apart from the violation you're testing, because any unrelated error can satisfy the directive." Also "Change the code so the promise is false, then run CI's type check. See the test fail…"

**Rating:** Clear.

**Follow-up (unbranded `+5`):** No. The test is still invalid because `to` is still missing. The sign isn't what matters: the type rejects any number without the brand, so `5` and `-5` fail for the same reason. With `to` added, `5` is arguably the better example, because `-5` suggests the type checks the value, which it doesn't. Verified.

**Rating:** Clear on validity, from the same sentence. That the brand ignores the sign needed outside knowledge; the Principle doesn't address it, and doesn't need to.

## (b) `parseUsers` returns `any`

**Answer:** `const x: User[] = parseUsers(raw)` establishes nothing, because `any` is assignable to `User[]`. You can detect the `any` in two ways, and I verified both in `b/b.ts`:
- **Forbidden operation:** `// @ts-expect-error` on `parseUsers(raw)();`. TS reports "Unused '@ts-expect-error' directive" because `any` is callable, so the `any` is exposed.
- **Exact comparison:** `Equal<ReturnType<typeof parseUsers>, User[]>` comes out `false`.

**Relied on:** "If the result could be `any`, test a forbidden operation or compare it exactly; assignment alone accepts it."

**Rating:** Clear. The Principle never says what "compare exactly" means (no `Equal` helper, no `expectTypeOf`), but a working developer will know.

**Follow-up (annotated `: User[]`, body unchanged):** No. Verified: `Equal<ReturnType<typeof parseUsers2>, User[]>` is `true`, and the forbidden call is now rejected. The function's declared promise is now correct. The body still returns unchecked `JSON.parse` output, so nothing proves it parses users. You need a runtime test: feed it bad JSON and expect a throw or rejection.

**Relied on:** "We need runtime assertions too, because a type test can check a function's promise without proving that its body keeps it."

**Rating:** Clear. This is the best sentence in the Principle. It answers exactly this question.

## (c) Intersection vs. flattened object

**Answer:** Don't revert. Fix the test. Verified in `c/c.ts`: `{a:1}&{b:2}` and `{a:1;b:2}` are mutually assignable, but `Equal` says they differ. The written contract is about reading `a` and `b` and assigning both ways. None of that depends on representation, so the exact assertion was pinning something that isn't part of the promise. Replace it with checks on what callers actually do: key reads, two-way assignment, and something that rules out `any` (see Q5).

**Relied on:** "Write down the promise: what callers are allowed to rely on." Also "They fix representation too—how the type is written—so compare only the parts where that matters."

**Rating:** Needed inference. "They" could mean both test kinds or only exact-result tests. "That" probably means representation, but it could be read as "the promise". And nothing says how to decide which parts count, or what to use for the rest. I got to the right answer from "what callers are allowed to rely on", not from the representation sentence.

**Follow-up (dropping `readonly`):** Not necessarily invisible. Verified: `{readonly a:1;b:2}` and `{a:1;b:2}` are mutually assignable, and `Equal` says they differ. Assignability simply doesn't see `readonly`. Removing it makes writing `x.a` legal. Existing callers keep compiling, but if "callers must not mutate this" was part of the promise (shared or frozen object), the promise is broken. A usage test (`// @ts-expect-error` on `x.a = 1`) or an exact comparison of that property would catch it. Two-way assignment would not.

**Relied on:** "Usage tests check accepted and rejected operations" and "breaking the promise shows whether the test protects it."

**Rating:** Needed inference. The Principle warns that assignment accepts `any`. It never says assignment also ignores `readonly`, which is the trap here.

## (d) New compile-only type-test file

**Before trusting it:**
1. Is the file in CI's type check? Plant an error such as `const p: number = "x"` and watch CI go red. I verified the risk in `d/`: with `include: ["ship.ts"]`, a planted error in `test/ship.types.ts` still exits 0.
2. Does each assertion protect the promise? Break the promise (`ship(id: string | number)`), see "Unused '@ts-expect-error'", revert, see green. Verified once the file was included.
3. Is each forbidden call valid apart from its violation? Same check as (a).
4. Does any runtime runner select the file? If one does, the forbidden calls execute (follow-up).

**Relied on:** "A planted error shows that the compiler checks the file; breaking the promise shows whether the test protects it. Those are different questions. Do both…" and "Include every type-test file in the type check, and account for runtime selection…"

**Rating:** Clear for items 1–3. Needed inference for item 4, because "account for" doesn't say what to do.

**Follow-up (`test/ship.types.ts`):** No. On Node 22.23.4, plain `node --test` picked up `test/ship.types.ts`, stripped the types and ran it. The output showed `# SHIP CALLED WITH 42`, and the run reported `pass 1`. So a green `node --test` here means the forbidden call ran and nothing failed. After I moved the file to `types/ship.types.ts`, `node --test` found 0 tests. A `.types.ts` name means nothing to the runner; the `test/` directory is what selects the file.

**Relied on:** "code under `@ts-expect-error` still runs if a runtime command selects it."

**Rating:** Needed inference. The sentence states the danger correctly. It doesn't say that "selects" depends on the runner's default globs: Node treats everything under `test/` as a test, including `.ts` now that type stripping is on by default. It also doesn't say how to respond: move the file, exclude it, or check the runner's file list.

---

## 1. Weakest sentence

"They fix representation too—how the type is written—so compare only the parts where that matters." It has an ambiguous antecedent ("They") and an ambiguous "that", and it gives no test for which parts matter. It is also the only sentence that tells you to do *less*, and it doesn't say what to use instead. A reader could fall back on bare assignment, which another sentence forbids (see Q5). A close second is "account for runtime selection", which is a mood rather than an action.

## 2. Terms used but not defined

- **"forbidden call" / "forbidden operation":** you can infer it means an operation the promise rejects, written under `@ts-expect-error`.
- **"the directive":** it appears before `@ts-expect-error` is named.
- **"compare it exactly" / "exact-result tests":** no tool is named and nothing says what "exact" means (`Equal`? `expectTypeOf().toEqualTypeOf()`?).
- **"representation":** glossed as "how the type is written", but "the parts" is undefined.
- **"runtime selection":** what selects a file, and how do you check?
- **"CI's type check":** this assumes CI has one distinct command.
- **"promise":** defined adequately, as "what callers are allowed to rely on".

## 3. Rule or mood?

Mostly rule. I could fail a PR on these grounds:
- a forbidden call that is invalid for a second reason;
- an assignment-only test where the result could be `any`;
- a type-test file outside the type check;
- no evidence that the promise was broken and the test went red.

The mood parts are "compare only the parts where that matters", "account for runtime selection" and "We need runtime assertions too". The last has no "where" or "for what", although the (b) follow-up shows what it means.

## 4. Enjoyment and attention

It reads well and has rhythm. "Those are different questions." lands. As dialogue it's dense: a whole checklist spoken in two breaths. My attention dropped at the representation sentence, because I had to reparse it, and again at "account for runtime selection: code under…". The colon clause carries a lot, and I had to stop and work out what selection means.

## 5. Sentences that could permit what another forbids

Yes, one pair. "compare only the parts where that matters" reads as permission to drop exact comparison for the rest. The natural replacement is two-way assignment. But "assignment alone accepts it [`any`]" forbids relying on that. In (c), if you downgrade the `Equal` to two-way assignment, a later refactor that returns `any` passes silently, because `any` is assignable both ways. The same downgrade also ignores `readonly` (the (c) follow-up). The Principle should say what replaces exact comparison.

A smaller one: "Include every type-test file in the type check" together with the "runtime selection" clause could be read as "fine, as long as the type check includes it". But (d) shows the file can be type-checked and also executed.

## 6. One change

Replace the representation sentence with something concrete that closes the Q5 gap. For example: "Exact comparisons also pin how the type is written: an intersection versus one object, `readonly`, optional versus `| undefined`. Pin exactly only what callers rely on. Cover the rest with the operations callers actually perform, not bare assignment, which accepts `any` and ignores `readonly`."
