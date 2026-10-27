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
