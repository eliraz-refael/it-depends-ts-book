# Claude's review: Chapter 23 draft 1 (`63db6fdf…`)

2026-10-27. I reviewed `cf62962` against the [settled plan](../CH23-PLAN.md#settlement-after-codexs-challenge-2026-10-27),
with two fresh isolated readers:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md), with the four cases, also asked about enjoyment;
- a [full read](CLAUDE-FULL-READ.md), asked to verify every claim and to say where it got bored.

**The chapter is correct, and its best scene works.** The full reader re-ran every fence, count and
diagnostic and found "no mismatches". That includes the rejecting thenable's `{"started":2,"closed":2,"failed":1}`
and Dafna's ignored-answer callback. The scene it would retell is the one we planned: a method
named `then` called by the promise machinery with `(resolve, reject)`, hanging only on "no stock".
Its best lines are the cold open ("I'd like you to tell the worker."), "The worker is waiting for an
answer about whether it answered", "And I taught it to say nothing on no", and Linoy's "It also
bought JavaScript a way to call it." The Principle-only reader applied the rule correctly to all four
cases.

**Verdict: one more round (draft 2), moderate.** Keep the story. The fixes are the spoiled Turn, the
Principle's voice, a missing repair, and the middle's detours.

## Findings, ranked

### 1. The Principle gives away the Turn (must fix)

The full reader "knew the bug at line 75, the moment `Res` grew a method named `then`… The Principle
had told me the exact mechanism… I never got a moment of not understanding." The Principle's
"adoption calls that method with resolve and reject callbacks. If neither is ever called, the promise
stays pending. A success-only method that skips its callback on refusal cannot stand in" is "the
Turn, step for step".
- **State the rule, not the mechanism.** The reader's own suggestion works: a method named `then`
  belongs to the promise protocol, whatever you meant by it. Leave "pending forever", the
  resolve/reject callbacks and "success-only" for the Turn to show.
- **Some dramatic irony is fine.** A reader who spots `then` before Linoy does still enjoys watching
  her find it, if the *how* (her success branch hands the preview to `resolve` and strips the
  wrapper; her refusal branch calls nothing) and the *what next* are still to come. So don't hide
  `then`.
- **Remove the winks:** Sahar's "Why did you choose a name that already accepts both?", Linoy's
  cut-off "I could make `Res.then` accept both too—", and Dafna's "Leave that for a moment…". The
  reader called the last one "written to hold off the Turn, and it shows".

### 2. The Principle is a fact sheet, not Eli (must fix)

The Principle-only reader called it "mostly documentation… six unconnected facts with almost no
transitions", with enjoyment "low to moderate". It reread the key sentence three times and stalled on
undefined terms ("thenable", "adopt", "protocol", "success-only method"). Neither reader heard Eli.
- **One plain rule up front:** look at what the next step returns. A plain value means `map`. The
  same kind of wrapper means the flattening operation (`andThen`, `flatMap`), or you get a box
  inside a box.
- **Then let Eli enjoy the idea that ties it together,** which the reader said it "had to build"
  itself. A promise's `then` does both jobs at once: it maps a plain value and flattens anything
  that looks like a promise. That's why a name is enough to join its protocol. It's a theorist's
  delight, and the Principle needs one.
- **Only rules the scenes exercise.** "An array of promises needs `Promise.all`" never appears in
  the chapter, and the optional-chaining sentence "exists in the chapter only to be ticked off". Cut
  both from the Principle, or earn them in a scene (see 5).
- **Fix the ambiguous referents:** "That can remove repeated checks" (what is "That"?) and "Compare the
  actual callers before replacing them" (callers of what? replace what?). Say it plainly, for example:
  before replacing early returns with a helper, write both versions where they're used.
- Two paragraphs at most. No new rules.

### 3. The strongest small repair is missing (must fix)

Neither the plan nor the draft raises **unwrapping at the boundary**: `loadPreview` returns
`preview(text).result`. It's one line, the six screens don't change, and the worker gets a plain
union. The full reader expected Guy to propose it first and called its absence "the biggest gap".
Give it to someone, and answer it on the page. The answer I'd expect: it fixes this entry point,
but the class still has a callable `then`, so the next async path, or any `Promise.resolve(res)`,
hangs again. Say in one line that `Promise.resolve` adopts too, so the bug isn't about `async`
functions. If the answer isn't that strong, the Verdict may change. That's fine, but show it.

### 4. Give the losing repairs their strongest forms (should fix)

The reader found the Verdict "earned by elimination" but "decided in advance". The rename is
"assumed, not argued", and "the class side wins too easily".
- **Resolve with the whole Result:** spell out the signature clash in a line. On the promise path
  the callback receives a `Result`; on the screen path it receives `T`. One `then` can't type both.
  Linoy's concession then follows from that clash.
- **Plain functions (Sahar):** don't have him defeat himself in a sentence ("Here, I can't show that
  it does"). His real point, that a plain union can't accidentally become a promise method, needs to
  stand, and someone must pay for it. The reader's extra point (the instance serialises as
  `{"result":…}` across the job API) is optional. Use it only if it fits without a new requirement.
- **The rename:** let Linoy argue for it beyond "it's what's left". The six fluent callers keep
  their shape and the class stays a valid API, at the cost of the familiar word.
- **A lint rule** (the reader named one) is out of scope. No tool claims without a primary source.

### 5. The middle's detours and the setup dump (should fix)

- **The setup** (lines 21–23) is "six facts in a row" before the reader knows which matter. Spread
  them into the scene, or keep only the two the hook needs: the worker counts both answers as
  finished, and the batch needed an async entry point.
- **The `?.` exchange** answers the Principle, not the room: "Nobody proposed an Option class". Cut
  it, or have someone actually propose one. Cutting is my preference; then reader case (d) goes too.
- **The arrays exchange** is where attention dropped ("It matters which thing you're chaining"). Keep
  it short. It's the one familiar comparison that teaches the shape.
- **`onlyBadQty`'s TS2322** doesn't feed the bug. Keep it only if one line makes the growing error
  union part of the lesson; otherwise cut it.
- **Sahar's four-sentence speech** ("Six isn't a reason…") is where attention dipped again. Shorten it.

### 6. Name the monad once, with confidence (should fix)

The word appears once, hedged ("the chaining pattern people mean when they bring up monads here"),
"and nobody in the room brought up monads. It's odd that Dafna Functor… sidesteps it." Give her
one confident beat: a way to wrap a plain value (`ok`, `[x]`, `Promise.resolve`) plus the flattening
step, which is what people mean by a monad. Then move on. No laws, and no lecture.

### 7. Explain how `Awaited` found `Preview` (should fix)

"One sentence on 'TypeScript reads your `then`'s callback parameter as the promised value' would
turn Eli's reveal into a lesson." Eli is the right speaker for it.

### 8. Line-level (fix)

- **"For two items. Seven items never finishes."** "For two items" reads as two jobs. Say
  "quantity two".
- **"leave the in-flight count":** that term doesn't exist. The counters are started, closed and failed.
- **"To parsing seven."** carries the whole idea in a fragment. Add a clause, such as "The outer yes
  is the parser's. The inner no is stock's."
- **Dafna's "It returns here. I want to check which return you're expecting."** has unclear "it"
  and "here".
- **Eli's "Then I removed the part that let it through. Your worker accepts the return type it
  actually gets."** Make it say what it means: `Promise<unknown>` takes whatever arrives. "The
  compiler would have caught this" is a deliberate overstatement and fits Eli's bio. Guy's next line
  answers it, so it's fine.
- **Dafna's "The helper saves writing that branch. It doesn't force you to use every result"**
  rebuts a claim nobody made. Early returns don't force it either. Either someone claims the helper
  is safer, or the line goes.
- **The Additional Take's "as in Guy's caller"** has no clear antecedent; `plainPreview` is
  synchronous.
- **Commit-message narration:** "She changes `then` to `andThen` in `Res` and in the six callers…
  The method body stays the same…" and "These are fresh jobs and fresh counters after the rename."
- **Stagey:** "Show the preview before the worker." and "The quantity belongs in the preview too."
- **The spec link in Dafna's line.** A link inside dialogue is odd. Move it into narration or a
  footnote-style aside, as Ch14 does in its Takes.

## Not adopted

- **The pre-rename `await pendingInside` beat** (adoption resolves the inner promise). It's a nice
  find, but it's a second adoption lesson.
- **`Promise.all` vs `allSettled`, a step that needs two earlier values, and when an `Option` earns
  its place** (Principle reader). These are real questions, but outside this chapter's one story.
- **Adoption is a microtask, not synchronous.** The text doesn't claim otherwise.

## Next

Codex revises to draft 2. Update the checks for any changed fences (the unwrap-at-boundary repair if
it's printed, `Promise.resolve`, and any cut exchanges), retry `npm ci --offline`, run the full
`npm run check`, freeze `ch23/DRAFT2-SNAPSHOT.json`, and commit locally with these records. Then I'll
run a Principle-only reader on the revised Principle and a targeted recheck of the changed scenes,
with the enjoyment questions. That recheck must include whether the reader guessed the Turn, and when.
