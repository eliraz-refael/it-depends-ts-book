# Chapter 23 — Codex plan challenge

2026-10-27. Against CH23-PLAN at `9352eb0`. **Plan challenge only; no manuscript drafted.**

## 1. Ending first: recommend a local Verdict

The incident earns its place. The three-way contest does not yet earn an open ending. I recommend repairing the existing fluent class by renaming its success-only `then` to `andThen`, teaching the distinction between mapping and chaining, and declining a generator migration for this short job. Keep the job's ordinary early returns where they make its two dependent steps easy to follow. Do not make the naming collision a reason to replace all existing class callers.

This is a local decision, not a finding that one notation is universally better. Competent owners can prefer different styles. But the demonstrated requirements here do not force them to resolve that preference across an entire codebase. A delegated helper, a renamed class and an ordinary caller can coexist. “Export both” removes a forced migration without changing the operation's result. We should not invent exclusive ownership to sustain a disagreement.

I compared a ladder, plain helpers, the repaired fluent class and the generator on the same inputs. All produce:

| Input | Result |
| --- | --- |
| `"2"` | `{ ok: true, value: { n: 2, id: "res-2" } }` |
| `"7"` | `{ ok: false, error: { kind: "noStock" } }` |
| `"x"` | `{ ok: false, error: { kind: "badQty" } }` |

The async ladder and async helpers agree too. The helper does skip its callback on failure and preserves the error object. Those are real properties, but not a reason to call the ladder unsafe:

- Removing a check and reading `qty.value` produces **TS2339**. The plan's “forgotten check is easy to miss in review” needs this answer on the page.
- A helper callback can call `reserve(n)`, discard its refusal and return `ok("done")`. That compiles and succeeds in the probe. Neither notation requires the author to consume every returned Result.
- A helper can own a repeated propagation rule. Whether that removes useful repetition depends on actual callers, not on the name “monad” or a predetermined number of steps.

**Proposed ruling:** fix the protocol collision; retain the ordinary job control flow; use the shared `map`/`andThen` distinction when composing Result-returning steps; do not introduce a generator runner for this job. The repaired class remains a valid existing API, not a defeated alternative left ceremonially in a review. If drafting reveals substantial repeated composition elsewhere, show it before changing the local choice. No staged dissent is needed.

## 2. The thenable incident belongs, with two fairness corrections

The incident is about chaining: a perfectly reasonable Result rule—do not call the success continuation on refusal—is the wrong implementation of JavaScript's promise settlement protocol. That is more memorable than a vocabulary comparison.

The independent trace is `started: 2`, `closed: 1`, `badSettled: false`. Success is adopted to the bare number `1`. Renaming the method makes both jobs settle and closes both. An ordinary Node process with only the unresolved promise exits 0; top-level await exits 13 with an unsettled-await warning. Keep those CLI details in the probes, not the chapter.

Two corrections keep the author competent and the evidence honest:

1. **The successful job completes, but it does not preserve the wrapper.** A test that asserts only completion can pass. A test asserting the returned Result's shape would fail already. Establish what the runner observes: its callback returns `Promise<unknown>`, and it counts completions regardless of the domain outcome. Do not say an ordinary Result consumer successfully used the wrapper.
2. **A precisely typed caller gets evidence.** Even when `load` is annotated `Promise<Res<number, string>>`, `await load(...)` is a `number`; `.ok` gives TS2339. Let someone try that, rather than claiming that the compiler is wholly silent. The generic runner erases the distinction it never needed to inspect.

Show a small working synchronous chain before asking the reader to diagnose its async use. The refusal correctly skips the continuation there. Then show the runner waiting for that same object. Its expectation is now intelligible.

The mechanism is not `await` performing a nominal Promise check. Resolving an async return or calling `Promise.resolve` also reads a callable `then` and invokes it with resolving callbacks. The class returns an error object to that invocation instead of calling either callback; that return value does not settle the promise. The error branch therefore stays pending. Our bounded microtask observation corroborates this particular branch; the absence of a settlement call explains it.

The advice should be **do not name a success-only chaining method `then` unless you implement the promise-compatible thenable protocol**. “Unless the object is a promise” is too broad: intentionally compatible thenables are valid, without being Promise instances.

## 3. One smaller story

I would replace declined cards and connection cleanup with an **inventory availability-preview job**. It parses a quantity, asks for an availability offer, and returns a preview containing the quantity and offer identifier. These are read-only steps; refusal is already a normal Result outcome. A worker tracks in-flight previews and must count both successful and refused previews as finished.

That gives the chapter one visible mystery: the preview has refused the request, but the worker still thinks it is running. Guy can own the worker contract. No payment settlement, reservation compensation, retry or transaction is needed. The probe keeps the plan's `reserve`/`res-2` names to reproduce its examples, but that fixture has no side effects. Rename it to a read-only operation in the manuscript rather than implying that a real reservation can be discarded safely.

Suggested scene order, subject to settlement:

1. Principle, then the counter discrepancy as the hook. Establish the worker and the preview's normal success/refusal before the broken composition.
2. Back up briefly: the plain Result, a working early-return caller, then the nested value from `map`. Dafna demonstrates what `andThen` preserves and skips. Sahar supplies the ladder's actual compiler check.
3. The familiar comparisons are short interruptions in that investigation: array `map`/`flatMap`; a Promise callback returning a value or another promise; `?.` carrying absence onward. They are not three more running examples.
4. The preview crosses the async boundary. Show the inferred number, then the success-only `then` body and the missing settlement on refusal. This is the strongest Turn; if the hook already reveals it fully, do not manufacture a second Turn.
5. Rename and rerun both jobs. Decide the local API work, without a tour of four competing implementations.

The Ch14 callback needs narrowing. It deferred its shared transaction adapter and result-returning transaction steps. Merely using Result here does not make this “that day.” Reuse its familiar union; do not imply this chapter has discharged the transaction-specific condition.

## 4. Generators: real benefit, wrong budget here

The strongest generator case works: `yield* unwrap` lets the successful quantity stay in scope while obtaining the next successful value. The resulting error union is correct. The naïve `run<T, E>` inference fails with TS2345; inferring the yielded union fixes it. This is not a broken alternative.

But the proposed tiny runner has another responsibility. It calls `.next()` once and returns a yielded failure, leaving the body suspended. With a `try/finally` inside that body, success plus refusal runs cleanup **once**, not twice. Explicitly closing the iterator before returning the failure repairs this ordinary cleanup case; my repaired probe runs it twice. The repair is not a complete general runner: yielding during cleanup, cleanup exceptions and async steps need their own decisions.

That evidence is a reason to omit the tutorial, not to stage another cleanup defeat for Linoy. Teaching `yield*`, Generator's three parameters, union inference and who closes a suspended body competes with the main discovery. The reader would learn a second unfamiliar control-flow mechanism before recognizing the first pattern.

Recommendation: **cut the generator implementation and its diagnostic from the manuscript**. If a Take survives, a short acknowledgment of the straight-line benefit and the runner's responsibility is enough; do not print a deceptively cost-free driver. No library claim is needed. Linoy can competently own and repair the fluent class instead. Her reserved place in the cast need not require a reserved feature.

## 5. Tighten the Principle, without turning it into a checklist

Use Result as the concrete object first. `map` transforms the successful value and wraps whatever the callback returns. `andThen` takes a callback that already returns Result, uses that Result directly, and carries the earlier failure onward without running the callback. The questions a reader can act on are: **what does the next step return, and what should happen when there is no successful value to give it?**

Then qualify the analogy in the scenes:

- For arrays, `flatMap` removes one array level. An async callback still produces promises. Replacing `map` with `flatMap` does not fix `Promise<User>[]`; use `Promise.all` when all results are wanted.
- Promise `.then` accepts a callback returning a plain value **or** a promise/thenable, and adopts the latter. Calling it simply “the promise's flatMap” omits the first half and obscures the incident.
- `map` with an async Result callback produces `Result<Promise<Result<...>>, ...>`. Awaiting that outer Result does not await its field. The callback has nevertheless been called and its async work has begun. “Nothing awaits it” must not imply nothing ran. An explicit flat result annotation catches the mismatch with TS2322.
- `?.` propagates nullish absence; it does not allocate an Option wrapper or unwrap arbitrary objects. The probe preserves an empty city string. It is a familiar conditional-chaining pattern, not literally the same wrapper API.

Name “monad” after readers can recognize the returned-wrapper step, with `ok` providing the simple way in. No laws or effect catalogue are needed. Do not promise that recognizing the pattern automatically selects a notation or forces all failures to be handled.

Retain the four Principle-reader cases, with sharper expected answers:

1. A success-only `Maybe.then` that ignores a missing value can leave async adoption unsettled; intentional promise-compatible settlement is the relevant distinction.
2. Async array mapping yields promises; `flatMap` is not the repair, `Promise.all` is.
3. Four checked early returns do not alone justify a helper migration. Check what propagation repeats, what values later steps need, and what the existing reader gains or loses.
4. If consumers only need to stop property access on nullish absence, `?.` already supplies it. Do not invent an Option merely to give the pattern a name.

The Principle need not recite every mechanism. It should state the actionable distinction; the scenes earn its qualifications.

## 6. Cast and voice

Prefer **Eli, Guy, Dafna, Linoy and Sahar**. Eli can set the shape distinction and make one precise intervention when `Awaited` exposes the number. This rests Liron after Ch22 and avoids recreating his Ch14 connection conversation. Liron is defensible if you prefer his analogy, but then he must work through its limits, not hold a theory seminar.

Guy owns the completion contract and can defend a repaired class without defending its method name. Dafna owns the reusable propagation rule and concedes the compiler's ladder check. Linoy has a plausible fluent API, gets a genuine surprise and fixes it. Sahar asks what work disappears if the new machinery is removed. Two counted jobs do not need Gil as a sixth speaker, and Eli can handle the diagnostic without Daniel.

The fun should come from the worker waiting for a refusal that has already happened, and the name that changed what JavaScript did. No catchphrase needs restoring. The likely boredom point is a parade of equivalent implementations after the incident is fixed; cut that parade rather than decorating it with jokes.

## 7. Reproduction and limits

Scratch files are untracked under `.probe/codex/`: `mechanisms.ts`, `run.cjs`, `RESULTS.json`, `INSTALL.json` and generated programs. `node .probe/codex/run.cjs` passes **nine compiler programs** and the runtime assertions. TS is **7.0.2**, Node **22.23.4** (not the plan's 22.23.3), using `checks/compiler.cjs` and its book defaults.

| Plan mechanism | Independently reproduced evidence |
| --- | --- |
| 1. Nested vs flat Result | Exact type assignments in both directions; nested and flat runtime objects; array and Promise comparisons |
| 2. Growing error union | TS2322 when NoStock is dropped; both refusal outputs retained |
| 3. Async callback nesting | Promise-valued field; awaiting outer Result leaves it intact; flat annotation TS2322 |
| 4. Thenable adoption | Bare successful value; refused job remains pending; 2 starts / 1 close; rename gives 2 closes |
| 5. Awaited type | `Awaited<Res<...>>` is number; `.ok` TS2339; renamed typed await compiles |
| 6. Generator inference | Naïve driver TS2345; yielded-union driver compiles and matches both refusals and success |

Additional checks cover the omitted ladder check, an ignored Result inside a helper, async array `flatMap`, optional chaining, async ladder/helper agreement, and generator cleanup with its limited repair.

**Install provenance:** the requested `npm ci --offline` was run first and failed with ENOTCACHED for the locked Zod tarball. I did not change registry settings, dependency versions or the lockfile. The main checkout has a byte-identical lockfile and a working installation; I copied that installation and checked all 14 installed package versions against the lock. The manifest is in INSTALL.json. Thus the probes ran on the locked dependencies, but this is not a successful clean offline install. No full-book suite claim is made for this plan challenge.

## 8. Primary sources checked

These support language behavior, not a library recommendation or proposal claim:

- [ECMAScript resolving functions](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-createresolvingfunctions) and [thenable job](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-newpromiseresolvethenablejob): callable `then` adoption and the resolving callbacks.
- [Promise reaction job](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-newpromisereactionjob): a handler's result is passed to the resolving function.
- [Array flatMap](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.flatmap): depth-one array flattening.
- [Optional chains](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-optional-chains): nullish short circuit.

## Handoff

Await settlement before drafting. Decisions requested: local ruling; read-only availability-preview scenario; thenable Turn; generator tutorial cut; five-person cast with Eli; Principle corrections above. No manuscript, master plan, dependency or durable-check changes in this handoff.
