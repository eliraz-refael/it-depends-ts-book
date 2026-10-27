# Claude's second review: Chapter 23 draft 2 (`492a89f4…`)

2026-10-27. I reviewed `81a2ff8` against my [first review](CLAUDE-REVIEW.md), with two fresh
isolated readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the three revised cases;
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter, asked about each of draft 1's
  problems, when it guessed the Turn, and enjoyment.

**Draft 2 is close.** The recheck reran every fence, including the new repairs: the unwrap,
`Promise.resolve`, the whole-Result callback clash (TS2345) and the rejecting thenable's
`failed: 1`. It reports: "**Nothing in the chapter is wrong.**" Its verdict is "**Local edits only, no
new full round.**"

It guessed *what* was wrong early, but "Did it spoil the fun? No." The "how" carried it: "the success
path working by accident because the callback is `resolve`, while the refusal path politely returns a
new `Res` to nobody… the best reveal in the book so far." The rename now feels "earned, with one
leak". The Principle-only reader applied case (b) "fully mechanical[ly]", and solved (a) and (c).

**Verdict: draft 3, small and local.** Afterwards: a Principle-only reader on the revised Principle,
then my final diff review.

## The Principle: the two readers pull opposite ways, and the rule wins

The recheck suggests softening the last sentence so the Turn isn't given away. The Principle-only
reader asks for the opposite: "Paragraph 2 never tells me what to do… a warning with no instruction."
The book's standing requirement is an explicit, testable rule up front. The recheck also found that
knowing *what* didn't spoil the *how*. So:
- **Make the last sentence an instruction.** Don't give a method the name `then` unless it keeps the
  promise's contract; name a chaining method something else. That's still no trace of the hang,
  resolve/reject or pending.
- **Paragraph 1 still reads as documentation** (both readers). Keep the rule and give it Eli's voice.
  The array sentence needs a bridge ("Arrays do the same:"). Make clear that "plain" means "not the
  container you're already in".
- **"Write both versions" needs one test.** The chapter already supplies one: Dafna's "both versions
  keep the same quantity available" and Guy's `plainPreview`. When later steps need earlier values, the
  checks often read better. Half a sentence.
- **"flattens a returned promise"** → "unwraps". A promise never holds a promise; one level is
  misleading.

## Findings, ranked (from the recheck unless noted)

### 1. The rename leaks before it's proposed (must fix)

At the monad line Dafna says "`ok(value)` and `andThen` for the union" while the class still calls it
`then` and nobody has proposed `andThen`. "That makes the ending feel pre-decided." Use Linoy's
`then`, or no name.

### 2. Promises only mostly fit, and the chapter has the counterexample (should fix)

Dafna lists `Promise.resolve`/`then` as a monad with no caveat, but `Promise.resolve(preview("7"))`
"does not wrap the value, it adopts it and calls `then`." Give her the caveat where Linoy shows it.
Promises only mostly fit, because `Promise.resolve` won't wrap anything that looks like a promise. The
reader says it "would teach, reward the FP reader, and tie the monad aside to the bug."

### 3. Close the strongest thenable form (should fix)

Nobody considers keeping a correct `then` that resolves the whole Result *plus* `andThen` for
chaining. The rebuttal is already implied: `await res` would quietly turn a `Res` into a `Result`, and
a declared `Promise<Res>` would still compile. Two lines. Also give the rejecting thenable its missing
cost in half a line: even on success, `await` gives a bare `Preview`.

### 4. Why `Promise<Res>` compiles (should fix)

`loadPreview` is declared `Promise<Res<…>>` and compiles, but `await` gives `Preview`. "A reader who
notices will wonder why the annotation didn't catch it." Eli's line is the place, with one clause: the
annotation says `Promise<Res>`, but `await` asks `Awaited`, and `Awaited` asks `then`.

### 5. Guy's Verdict needs its reason (should fix)

"I don't need it" invites "why not keep both, to be safe?" Use the reason the chapter set up: the
unwrap gave the batch a different shape from the screens. With the class fixed, everyone reads the
same `Res`.

### 6. Line-level (fix)

- **Ordering:** Linoy says "both jobs close" (line 234) when the fence ran only "7"; Guy runs "2"
  after. Show both in the fence or move the claim.
- **"when each step runs"** (line 293): nested calls run the steps in the same order. Cut it or say
  what's meant.
- **"job"** in lines 301 and 303 collides with worker jobs. Say "other code" or "other callers".
- **Line 317**, "This isn't getting through on somebody remembering to be careful", is unidiomatic.
- **Line 210**, Dafna's "doesn't settle the promise waiting for a callback", is awkward.
- **Line 349**, "Show them the two return types": which two? Be specific (`map`'s step vs
  `andThen`'s).
- **Lines 21, 31, 33:** "saved customer quantities" is opaque; "six callers there" has no clear
  "there"; "five items" reads as five SKUs; and "doesn't reserve anything" has no visible purpose.
  Fix each or cut it.
- **Line 103:** "why this one stopped returning". The preview didn't stop; the job did.
- **Line 118:** Linoy restates what the code just showed. Trim.
- **Additional Take:** "write a helper whose return type is deliberately `Promise<Result<...>>`" is too
  vague to act on. Show its signature or cut the sentence.
- **Line 366:** the curly apostrophe in "ECMAScript’s".

## Not adopted

- **Softening the Principle's last sentence** (recheck, optional). The rule stays explicit, as above.
- **Where else the protocol applies (`Promise.all`, etc.), `Promise<Result>` helpers, and when to
  prefer the checks beyond one test** (Principle reader). These are outside the chapter's one story,
  apart from the one test above.
- **Sahar pushing harder on the rename touching six callers too.** The Linoy/Sahar exchange already
  carries "rename, don't restructure".

## Next

Codex revises to draft 3. Update the checks for any changed fence (the unwrap fence if it now runs
"2"; the Additional Take helper if shown). Retry `npm ci --offline`, run the full `npm run check`,
freeze `ch23/DRAFT3-SNAPSHOT.json`, and commit locally with these records. Then a Principle-only
reader on the revised Principle, and my final diff review. No further full reader unless the changes
reach beyond the lines above.

## Final diff review (2026-10-27)

Draft 3 (`8befc8d3…`, `eaa7711`) addresses every finding above.
- **The Principle's last sentence is an instruction** ("Don't name a method `then` unless it keeps the
  promise contract. Give a different chaining operation a different name."), with no trace of the
  hang. "Plain" is defined relative to the container; the early-return comparison has its test
  (later steps needing earlier values); "flattens" is now "unwraps".
- **No premature rename.** Dafna's monad line uses Linoy's `then`.
- **Dafna's caveat** that promises only mostly fit sits where `Promise.resolve(preview("7"))` adopts.
- **The strongest thenable form** (a correct whole-Result `then` plus `andThen`) is raised and
  answered: awaiting the class still turns it into a union, and `Promise<Res>` still compiles. The
  rejecting thenable's success-path cost is named. Both are durably checked.
- **Eli's line** explains why `Promise<Res>` compiles: `await` asks `Awaited`, and `Awaited` asks
  `then`.
- **Guy's Verdict** gives its reason: the unwrap gave the batch a union and the screens a class; the
  rename gives everyone the same `Res`.
- **Line-level:** every item is fixed. Only fence 10 changed: the unwrap fence now runs quantity two
  before the both-close claim.

**The [final Principle-only reader](CLAUDE-DRAFT3-PRINCIPLE-READ.md) applied the rule correctly to all
three cases,** checking them with the book's compiler and Node:
- **(a) the `Maybe` with `then`:** rename it. It found the bare value on success and the hang on
  absence itself, which is the Turn's job, not the Principle's.
- **(b) array and Result steps:** `flatMap` and the Result chaining operation, with both written types.
- **(c) four early returns:** write both, and keep the checks when later steps need earlier values.

It found the section "mostly a person" and said it "never got bored". Its weakest spot was that the
Result chaining operation is never named ("the array side names both operations; the Result side,
where the rule matters most, names neither"), with the "plain" definition and "Write the early
returns too" as the decoding stretch.

**My two prose-only settlement edits** (no fence changes; the fence extract is byte-identical to
draft 3):
1. Paragraph 1 now reads: "If it returns a plain value, use `map`. By plain I mean not the container
   you're already in: inside Result, even an array is a plain value. If it returns another Result, you
   need the operation arrays call `flatMap`, which hands back the step's Result as it is instead of
   wrapping it in a second one. Arrays show the difference plainly… Then write the early-return
   version as well, and compare." That names the operation by its array name without announcing the
   Verdict's `andThen`, and it removes the ambiguous "too".
2. "Don't name a method `then`" now reads "Don't give an object a `then` method", because the reader
   asked whether the rule covered only classes.

**Not adopted from the final reader:**
- **Stating the consequence (a hang) in the Principle.** It's the Turn. The first full reader called
  the draft 1 Principle "the Turn, step for step", and the recheck found knowing *what* didn't spoil
  the *how*. The rule stays explicit and the mechanism stays in the scene.
- **What the promise contract is, exactly, and the error-type union.** The Turn shows the first;
  Linoy's `BadQty | NoStock` line carries the second.
- **When the chain is preferred.** Implied by the stated test; no new rule.

**Final text:** SHA-256 `bfdc1d36ded3e38e67bea39535c41da640a504f5185566e1a5be83e1d7828218`, 2,392 words, 15 fences, fence extract byte-identical to
draft 3. `node checks/chapter23.cjs` passes (15/22/20). **Clean install:** in a fresh export of
`eaa7711`, `npm ci --offline` failed (ENOTCACHED for the locked Zod tarball, as Codex reported).
A plain `npm ci` against the same lockfile then succeeded, and the full `npm run check` exited 0 on
TypeScript 7.0.2 and Node 22.23.4. The settlement edits touch prose only.

**Approved.** The ending is a local Verdict:
- rename the success-only `then` to `andThen`, and keep the class for the six screen callers;
- don't introduce it where two early returns read fine;
- the boundary unwrap works, but the rename gives every caller the same `Res`.
