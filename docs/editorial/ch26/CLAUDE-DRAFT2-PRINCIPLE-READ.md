<!-- Verbatim report of an isolated Principle-only reader of Ch26 draft 2 (961d306), commissioned by Claude on 2026-10-29. It saw only the Principle section. -->

# Principle-only reader report (Ch26 draft 2)

**What I read:** only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r2/principle/PRINCIPLE.md`. I opened no other book or repo file. The only thing I used from the worktree was the `tsc` binary.
**Fixtures:** `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-r2/principle/work/` (`a/`, `b/`, `c/`, `d/`). Tools were tsc 7.0.2 and Node v22.23.4. I ran every check with `--ignoreConfig --strict`, except `d/`, which has a local tsconfig. I verified (a), (b), (c) and (d), with their follow-ups.

---

## (a) Branded amount

**Answer:** No. The green check does not establish the claim. `{ from: "a", amount: -5 }` has two errors: `to` is missing, and the amount is unbranded. The missing `to` alone is enough to satisfy `@ts-expect-error`. I verified this. I changed the contract to `amount: number`, which breaks the promise, and `a/orig-mutated.ts` was still green (exit 0).

**Repair:**
```ts
transfer({ from: "a", to: "b", amount: positive(5) });   // positive control, compiles
// @ts-expect-error: rejects an unvalidated amount
transfer({ from: "a", to: "b", amount: 5 });
```
Then mutate the contract to `amount: number`. In `a/repaired-mutated.ts` this gave `TS2578 Unused '@ts-expect-error' directive` (exit 1). After undoing the change it was green again.

**Follow-up:** No. With `+5` the call still omits `to`, so the test stays green for the wrong reason. Verified: the mutated version is still exit 0. Changing the sign of a number does nothing for a branded type anyway, since both values are unbranded.

**Relied on:** "Start with a call that compiles outside `@ts-expect-error`. Under the directive, introduce only the intended violation; every other argument and field must remain valid." Also "change the code so that promise is false … See the test fail".
**Verdict:** Clear. This is the strongest part of the Principle. It matches the case almost word for word.

## (b) `parseUsers` returning `any`

**Answer:** The green `const x: User[] = parseUsers(raw)` establishes almost nothing. It only shows the call compiles. `any` can be assigned to `User[]`, so the test would pass whatever the function returned.

**How to detect `any`:**
- An exact comparison, `Expect<Equal<ReturnType<typeof parseUsers>, User[]>>`, fails (TS2344).
- An `IsAny<T> = 0 extends 1 & T ? true : false` check confirms the type is `any`.
- A canary also works: `// @ts-expect-error` above `const y: number = parseUsers(raw)` gives an unused directive (TS2578).

All three were verified in `b/b.ts`.

**Follow-up:** No. With `: User[]` on the signature, the exact `ReturnType` check passes. But the body's `JSON.parse` returns `any`, which can be assigned to the annotated type, so the body is never checked. At runtime I fed it `'{"not":"users"}'` and got `false { not: 'users' }` (`b/run.mjs`). The test proves the declared promise, not the implementation.

**Relied on:** "A test that only assigns the result passes when the result is `any`." and "A type test can check a function's promise without proving that its body keeps it."
**Verdict:** The diagnosis is Clear. The remedy Needed inference. The Principle says assignment misses `any`, but it never says what to do instead. I inferred "use an exact-result test, or assert not-`any`" from the definition of an exact-result test in the first paragraph. The follow-up is Clear: the last sentence answers it directly.

## (c) Intersection to flattened refactor

**Answer:** Don't revert. The written promise is about what callers can do: read `a` and `b`, and assign both ways. Every check for that passes. The exact `Equal` against `{a:1}&{b:2}` fails (verified in `c/c.ts`, TS2344), but only because it tests the shape of the type, which is outside the promise. I would replace or delete that test. Usage tests for the reads and both assignments should carry the promise.

**Relied on:** "Write the promise down before choosing which differences to test." Also the two test definitions.
**Verdict:** Needed inference. The Principle implies you shouldn't test differences outside the promise. It never says what to do when an exact-result test fails on such a difference. It also never warns that exact equality is strict about how a type is written (intersection vs flattened, `readonly`). A reader who doesn't already know `Equal` semantics would not see this coming.

**Follow-up:** No, the change is not necessarily invisible. Verified in `c/c.ts`: mutual assignment between `{readonly a:1;b:2}` and `{a:1;b:2}` compiles both ways, yet callers can now write `a`. A usage test, `// @ts-expect-error` on `helper2().a = 1`, flips to TS2578, and strict `Equal` also says they differ. Whether that matters depends on whether "callers cannot write `a`" was written into the promise.
**Relied on:** "A usage test checks whether a particular call or operation is accepted or rejected." Also "Write the promise down…".
**Verdict:** Needed inference. I inferred that an assignment is an "operation" a usage test can check. Nothing in the Principle says that mutual assignability is weaker than "callers can't tell the difference".

## (d) New compile-only type-test file

**What I'd ask for or demonstrate:**
1. Proof that CI's actual `tsc` command includes the file (`tsc -p <ci config> --listFilesOnly`).
2. A mutation run: break each promise, watch CI's type check go red, undo, watch it go green.
3. Proof that the runtime test command does *not* pick the file up, or that the file contains nothing harmful if it does.

All three were verified in `d/`. With `include: ["src"]`, `tsc -p .` was green even after I broke the promise (exit 0), because the file was never checked. With `test` included, the broken promise gave TS2578 (exit 1), and restoring it made it green again.

**Follow-up:** No. Under Node 22.23.4, plain `node --test` with its default globs matched `test/ship.types.ts`. It ran the "forbidden" call (it printed `SHIP EXECUTED qty= 5`) and reported `pass 1`. The `.types.ts` name doesn't protect anything. Anything under `test/` is matched. Passing an explicit glob, `node --test 'test/**/*.test.ts'`, excluded it (0 tests). So the answer is: control the runner's file selection, not the file name.

**Relied on:** "Check which files each compiler and runtime command selects." and "run the type check CI actually runs. See the test fail, undo the change, and see it pass. Do that when you add a test…".
**Verdict:** The type-check half is Clear. The mutation step also catches a file that was never selected, which is a nice property, though the Principle doesn't point it out. The runtime half Needed inference. "Check which files each … runtime command selects" never says *why*: a `@ts-expect-error` call is real code that will execute. I knew that already, but a reader who doesn't wouldn't get it from this text. They could read "check" as optional housekeeping.

---

## 1. Weakest sentence
**"Check which files each compiler and runtime command selects."** It is the only instruction with no stated consequence and no pass/fail criterion. It doesn't say what the right answer is: the type checker must include the file, and the runtime must exclude it or tolerate it. It also doesn't say what goes wrong otherwise: a green type check that checked nothing, and forbidden calls that run against real code. My `d/` fixture shows both failures, and the sentence warns about neither.

Runner-up: "A test that only assigns the result passes when the result is `any`." It names the trap but gives no remedy.

## 2. Terms used but not defined
- **"promise"** carries the whole Principle, but it is never defined. "Callers' contract"? "Declared signature"? "Behavior"? (c) depends on exactly this.
- **"exact"** in "exact-result test": exact by what equality? The Principle never says that exactness also catches representation (intersection vs flattened, `readonly`). That is the whole trap in (c).
- **"intended violation"** is fine in context.
- **"usage test"** and **"exact-result test"** are both defined.

## 3. Rule or mood?
Mostly a rule, and a testable one. "Show me the mutation that turned it red" is a concrete demand I could make in review. I could fail a PR on it: for the (a) pattern (a directive covering more than one violation), and for a new type-test file with no mutation evidence. The second paragraph is weaker as a rule. Its `any` and file-selection sentences are observations, so I could cite them in a review comment but not cleanly fail a PR on them.

## 4. Enjoyment and attention
The first paragraph earns its place. "Those are different questions" is a good, memorable line, and the plant-an-error versus break-the-promise distinction is the real insight. My attention dropped in the second paragraph. It is five unconnected sentences in a row, each its own mini-rule, with no "because" between them. It reads like a checklist with Sahar's name on it, more than like something a person says. "Do that when you add a test, change it, or move it" also slows things down. It is correct, but it is a bureaucratic aside in the middle of the key idea.

## 5. One change
Turn the second paragraph's two warnings into instructions with stakes. For example:

"If the result could be `any`, compare it exactly or assert it is not `any`; assignment alone proves nothing. Make sure CI's type check includes the file and the test runner doesn't: code under `@ts-expect-error` still runs."

That one edit removes the two "needed inference" verdicts in (b) and (d).

Second priority: one clause saying an exact-result test also locks the *representation*, so use it only when the representation is part of the promise. That would make (c) Clear.
