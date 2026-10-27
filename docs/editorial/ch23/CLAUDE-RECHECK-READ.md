# Reader report: Chapter 23, targeted recheck (draft 2, first-time read)

Draft 2 (`492a89f4…`, `81a2ff8`), 2026-10-27. A fresh, isolated reader had the full chapter, with
Chapters 1–22 stated as prerequisites (Ch14's `Result` named) and the cast's pronouns given. It was
asked to verify every claim, including draft 2's new repairs; to say when it guessed the Turn; to
judge whether the rename is earned; and to report what it learned, where it enjoyed the chapter and
where it got bored. It saw no earlier drafts or reports. It could run only the book's TS 7.0.2 binary
and Node 22, and installed nothing. The report is copied verbatim. Its line numbers refer to draft 2.

---

## 1. Verifying the claims

I put the fences together into five programs and ran them on tsc 7.0.2 with the flags you gave, then on node 22. **Nothing in the chapter is wrong.** Every printed output, count, diagnostic and behavioural claim held.

**Debate fences**
- `preview("2")` and `preview("7")` print exactly what the chapter shows.
- `nested` has exactly the type `Res<Result<Offer, NoStock>, BadQty>` (I checked it with a type-equality test, not just assignability). It prints `{"ok":true,"value":{"ok":false,...}}`.
- `increased` and `alsoIncreased` are both exactly `Promise<number>`, and both fulfil with 3.
- The two array lines print `[[2,2],[7,7]]` and `[2,2,7,7]`.

**The Turn**
- `inspect()` gives `TS2339: Property 'result' does not exist on type 'Preview'.` on the `return result.result` line.
- `Equal<Awaited<Res<Preview, BadQty|NoStock>>, Preview>` is true. Eli's line ("`Awaited` reads the first parameter of your `then` callback") is accurate.
- `runJob(() => loadPreview("2"))` compiles. `goodJob` resolves with the bare `{"quantity":2,"offer":"offer-2"}`, with no wrapper.
- `refusedJob` never settles, and neither does its `finally`. Counts after 100 ms are `{"started":2,"closed":1,"failed":0}`.

**The new claims you asked about**
- **`loadUnwrapped`:** prints `{"ok":false,"error":{"kind":"noStock"}}` for "7". "2" gives `{"ok":true,"value":{...}}`. Both jobs close and neither counts as a failure.
- **`Promise.resolve(preview("7"))`:** exactly `Promise<Preview>`, and it stays pending.
- **"Resolve with the whole Result":** I wrote `then<R>(step: (result: Result<T, E>) => R): R`.
  - A `(n: number) => ...` callback fails with TS2345: "Types of parameters 'n' and 'result' are incompatible. Type 'Result<number, BadQty>' is not assignable to type 'number'."
  - If the parameter is left inferred, the error moves to `availability(n)` (also TS2345). Dafna's line holds.
  - At runtime the worker gets `{"started":2,"closed":2,"failed":0}`, and `await` is typed as `Result<Preview, ...>`.
- **Rejecting thenable:** I wrote `then(step, onRefused?)`, which calls `onRefused(error)` on the refusal branch. The screen chains still compile. The result is `{"started":2,"closed":2,"failed":1}` and the job rejects with `{"kind":"noStock"}`, as Guy says.

**The repairs**
- Sahar's `andThen` function types `offered` as exactly `Result<Offer, BadQty | NoStock>`, and it prints the noStock refusal.
- `plainPreview` compiles and gives the right answer for "2", "7" and "x".
- Guy's claim holds: without the first check, `qty.value` gives TS2339 (twice).
- After the rename, `checkRepair` prints the three lines shown, with counts `{"started":2,"closed":2,"failed":0}`, once the counters are reset. The reset is in the prose only, not the code. That's fine.

**Additional Take**
- `pendingInside` is exactly `Res<Promise<Result<Offer, NoStock>>, BadQty>`.
- `map` calls `availabilityAsync` straight away.
- After the rename, `await pendingInside === pendingInside`, and its value is a Promise.
- The "after our rename" qualifier is correct: before the rename, awaiting it would have flattened.

**Not wrong, but a reader will stumble here.** `loadPreview` is declared `Promise<Res<…>>` and compiles, but `await` on it yields `Preview`. I confirmed that a variable typed `Promise<Res<…>>` awaits to `Preview`. The chapter never says why the signature allows a type that can't exist at runtime. A reader who notices will wonder why the annotation didn't catch it.
- **Fix:** one clause from Eli at line 169: "the annotation says `Promise<Res>`, but `await` asks `Awaited`, not the annotation."

## 2. The Turn

- **First guess:** line 75, `then<U, F>(step: (value: T) => Res<U, F>)`. Really it was the Principle that did it: "So a method named `then` belongs to the promise protocol, whatever you meant by it." After that, a class with a method called `then` gives away *what* is wrong.
- **Did it spoil the fun? No.** Two things I didn't predict:
  - Why only seven hangs: the success branch "works" only because `step` happens to be `resolve`. "It calls that function with the preview" is the best reveal in the book so far.
  - The type-level echo, where `Awaited` turns it into `Preview`.
- **Is that enough?** For this book's premise, watching the "how" carries it.
- **Does the Principle give the Turn away? Yes, entirely.** Its last two sentences are the Turn.
  - If you want some suspense, keep the rule and soften the giveaway. For example, end at "...including an object with a callable `then`. No registration required." and drop "So a method named `then` belongs to the promise protocol, whatever you meant by it."
  - The testable rule is already stated by then, so the Principle stays explicit.

## 3. The repairs

- **Unwrapping at the boundary: strong.** Guy owns it, it works, and Dafna names the cost (the return type changes). Linoy's counter with `Promise.resolve(preview("7"))` is good because it needs no async function at all.
  - **Ordering slip:** at line 234 Linoy says "both jobs close", but the fence ran only "7". Guy only says he'll run "2" at line 236. Either show both in the fence or let Guy report it.
- **Rejecting thenable: fair, but one cost is missing.** Guy's counter-based objection is concrete and checks out. The other cost goes unmentioned: even on success, `await` gives a bare `Preview`, so async callers still lose the wrapper.
- **Resolving with the whole Result: good.** Dafna's objection holds in the compiler. The pivot is the moment the rename is earned: "I'd need another name for the successful-value chain anyway."
  - **Combination nobody considers:** keep a correct `then` that resolves the whole Result, and add `andThen` for chaining. That is the strongest form of "keep it a thenable".
  - The rebuttal is easy and already implied: `await res` would quietly turn a `Res` into a `Result`, and a declared `Promise<Res>` would still compile, as shown in §1.
  - Two lines would close this off.
- **Plain functions: strong enough.** Linoy's "I'm not claiming the class is necessary" is a good concession.
  - **Questionable claim:** "...and when each step runs" (line 293). Nested function calls would run the steps in the same order. Either cut it or say what you mean, perhaps "the order you read them in".
  - Sahar could have pushed harder: the rename touches all six callers too. Linoy's answer ("rename, don't restructure") is there, but only implicitly.
- **Alias: quick and decisive.** "Deprecating the name doesn't stop JavaScript calling it" is a good line.
- **Does the rename feel inevitable?** It's earned, with one leak. At line 143, Dafna says "`ok(value)` and `andThen` for the union" while the class still calls it `then`. No one has proposed `andThen` yet; only the Principle has named it. That makes the ending feel pre-decided.
  - **Fix:** have Dafna say "`ok` and Linoy's `then`", or "what the Principle called `andThen`".
- **Guy's Verdict: mostly convincing, but a little flat.** "I don't need it" invites the question "why not keep both, to be safe?"
  - **Fix:** give him the reason the chapter already set up, roughly: "the unwrap worked, but it gave the batch a different shape from the screens. Once the class is fixed, everyone reads the same `Res`."

## 4. The Principle

**Restated:** Look at what the next step returns. A plain value goes through `map`, and a value already in the same kind of container goes through `andThen` or `flatMap`. Write the early-return version before adopting a helper. Promise `then` both maps and flattens, and adopts anything with a callable `then`, so naming a method `then` signs it up for the promise protocol.

**Is every rule used? Yes.**
- map versus andThen: the `nested` example.
- Arrays: briefly.
- "Write both versions / you may prefer the checks": `plainPreview` and Sahar's "two early returns".
- Promise doing both jobs, and the thenable rule: the Turn.

**Does it sound like a person?** The second paragraph does ("The lovely complication", "No registration required"). The first reads like documentation:
- "which uses that Result directly instead of putting it inside a second one" is clunky.
- "For a step that returns an array, `map` keeps the extra array level and `flatMap` joins it" is a reference-manual sentence.

## 5. Learning

**What I learned**
- The thenable assimilation rule, concretely: JS calls your `then(resolve, reject)` in a job.
- Why a half-thenable hangs only on the branch that never calls the callback.
- That `Awaited` is computed from the callback's first parameter, so the type system agreed with the runtime the whole time.
- map versus andThen as "what does the step return".

**"Monad"** is pitched at a usable level: one way to wrap a value, plus one way to chain a step that returns the same container.

**One thing is off for Dafna's character:** she lists `Promise.resolve`/`then` as a monad without the caveat. The chapter's own incident is the counterexample: `Promise.resolve(preview("7"))` at line 245 does not wrap the value, it adopts it and calls `then`.
- **Fix:** have Dafna say at line 245 something like "and that's why I said promises only *mostly* fit. `Promise.resolve` won't wrap anything that looks like a promise." It would teach, reward the FP reader, and tie the monad aside to the bug.

**Over-explained:** Linoy at line 118 restates what the code just showed.

**Under-explained**
- Why the `Promise<Res>` annotation compiles (§1).
- The Additional Take's "write a helper whose return type is deliberately `Promise<Result<...>>`" is too vague to act on. Show its signature or cut it.

## 6. Enjoyment and pacing

**Fun**
- The cold open ("Two previews started. One closed." / "Then it's finished." / "I'd like you to tell the worker.").
- Guy's "The outside says yes."
- The Turn from line 196 to line 216.
- The exchange where Eli adds a `.result` caller and Guy pushes back ("You added a caller that reads `.result`. Put my worker back."). It's good friction.

**Where attention dropped and came back**
- Dropped at line 105, Dafna's "Both screen calls have returned an answer. What happens if you map `availability` instead?" From there to line 143 it's a lesson, not the incident.
- Guy's "That has four values" briefly pulled me back.
- Fully back at "Then help me find where our answer went."
- A second, smaller drop in the plain-functions back-and-forth (lines 287–301). It came back at Guy's `plainPreview`.

**The scene I'd retell:** the success path working by accident because the callback is `resolve`, while the refusal path politely returns a new `Res` to nobody.

**Best lines**
- "So the stock check has answered. The worker is waiting for an answer about whether it answered."
- "And I taught it to say nothing on no." (It pays off the title.)
- "It also bought JavaScript a way to call it."

**Weakest lines**
- "This isn't getting through on somebody remembering to be careful." (line 317)
- Dafna's "Returning that refusal from `then` doesn't settle the promise waiting for a callback." (line 210)

## 7. Prose

Lines I reread or found unclear:
- **Line 21:** "availability previews for saved customer quantities" is opaque. Dense exposition.
- **Line 31:** "There are six callers there". Where is "there"? It means the screens.
- **Line 33:** "The stock snapshot has five items." I read it as five SKUs; the code means five units. "Checking it doesn't reserve anything" has no visible purpose until `checkRepair` calls "7" twice. Say why, or cut it.
- **Line 103:** "why this one stopped returning". `preview` didn't stop returning; the job did.
- **Line 169:** "The compiler would have caught this." Caught what? It means only if a caller reads `.result`. Guy's reply rescues it, but the line overclaims.
- **Line 210:** awkward (quoted in §6).
- **Line 293:** "when each step runs" (see §3).
- **Lines 301 and 303:** "Then leave the other jobs out of it" and "For another job that needs those checks directly". "Job" already means a *worker job* in this chapter, so this reads as the worker's other job kinds. Use "other code" or "other callers".
- **Line 317:** unidiomatic. Something like "This doesn't rely on anyone remembering to be careful" would work.
- **Line 349:** "Show them the two return types." Which two? (`Res` versus `Result`? `map`'s step versus `andThen`'s?) Make it specific.
- **Line 118** and the Principle's first paragraph read like documentation.
- **Line 366:** a curly apostrophe in "ECMAScript’s" where the rest of the chapter uses straight quotes.

## 8. Overall

**Local edits only, no new full round.** The code is correct, the Turn works, and the repairs debate is mostly earned. The edits:

1. Dafna, line 143: don't name `andThen` before the rename is proposed.
2. Dafna, around line 245: add the promise-isn't-quite-a-monad caveat, using `Promise.resolve` adopting the thenable.
3. Eli, line 169: one clause on why the `Promise<Res>` annotation compiles while `await` gives `Preview`.
4. Lines 228–236: show the "2" run in the unwrap fence, or move "both jobs close" to after Guy runs it.
5. Two lines considering "andThen plus a correct whole-Result `then`", with the silent-type-change rebuttal.
6. Line 293: cut or clarify "when each step runs".
7. Guy's Verdict: give the reason (one shape for all callers), not just "I don't need it".
8. Rename "job" in lines 301 and 303 to avoid clashing with worker jobs.
9. Rewrite line 317, line 210 and line 349's "two return types".
10. Clarify line 21 ("saved customer quantities"), line 31 ("there") and line 33 ("five items", "doesn't reserve").
11. Optional: soften the Principle's last sentence so the Turn isn't fully given away.
12. Additional Take: show or cut the "deliberately `Promise<Result<...>>`" helper.
13. Line 366: use a straight apostrophe.

## Scratch files

All in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/:
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/base.ts (shared types and functions)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/before.ts (Debate and Turn, including loadUnwrapped and refusedAgain; produces the TS2339)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/before_run.ts (runnable copy with the error line cast)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/types.ts (exact-type equality checks)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/reject.ts (rejecting-thenable variant)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/whole.ts (whole-Result variant and the callback clash)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/repair.ts (rename, Sahar's functions, plainPreview, the no-first-check variant, Additional Take)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/declared.ts (declared `Promise<Res>` awaits to `Preview`)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/f/scratch/out/ (emitted JS)