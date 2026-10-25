# Claude's second review: Chapter 22 draft 2 (`89f14da7…`)

2026-10-25. I reviewed `e4838bc` against my [first review](CLAUDE-REVIEW.md), with two fresh
isolated readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the same four cases;
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter, asked about each of draft 1's
  problems and about enjoyment.

**Draft 2 is close.** The recheck re-ran every fence: "Every output, count, code and message the text
states is correct." It says the chapter "does not need another full round", only "one targeted pass…
all local edits to a handful of lines". The opening is still the scene it would retell. It liked that
"the replay is" comes from the character arguing *for* the tree. Templates as the status quo are
fixed. Dafna's suppressed-demand case is fixed, and the Verdict survives it "without an invented
fact". The Principle-only reader applied the rule to all four cases.

**Verdict: one more round (draft 3), small.** Afterwards: a Principle-only reader on the revised
Principle, then my final diff review.

## Findings, ranked

### 1. The history still trips readers, and the version thread is the cause (must fix)

The recheck could rebuild the history only on paper. Its "four events and two version numbers in
three sentences, with no character speaking" is where attention dropped. Three specific faults:
- **Gil's parameter-change example contradicts it.** "Change the refund window from seven days to
  fourteen" is listed as a console edit, but version 1 fixed the window and version 2 *added* `days`
  for that request. Use another example, such as a threshold change.
- **Three unrelated "2"s:** the evaluator `"review-2"`, settings "version 2", and `Rule.version: 2`
  for a tree format that never had a version 1. Rename the evaluator to something without a number
  that collides, and make the tree's version make sense.
- **Were templates in use on the third?** The live policy with its hook doesn't look like a template
  record, yet the console "already uses named templates". Settle it in a clause.

**The fix:** tell the history as a short exchange (Eden recounts, Dafna corrects, as the reader
suggests), not narration. Introduce `days` and version 1 only where the old-settings exchange needs
them. Choose the simplest history that keeps every census row placeable.

### 2. The old-settings exchange still arrives cold (must fix)

Both reviews' readers flagged it. The recheck says "I still need to open the old campaign
activations" is "a non-sequitur… a checklist item". "Campaign" appears here for the first time.
Give it a cue from something already on the page (compliance asking about an FR decision from before
the window was editable, say). Name the activations plainly. If it still can't earn its place in two
lines, cut it, and then cut the Principle's last two sentences too, since a rule needs a scene.

### 3. "Three" is overloaded at the Verdict (must fix)

By the end, "three" has meant three refunds, three of Gil's samples and the third regrouping. Gil's
"Three wasn't in my findings" then reads as contradicting Eden's "Three of Gil's eight samples".
Something like "A third request isn't in my table." Also give a half-line on what "third" means:
two regroupings have happened, so the third is the next one. If that's deliberate, and I think it
is (it nearly concedes Dafna's point, honestly), let someone say so.

### 4. The Principle's three snags (should fix)

- **"Lisp spoiled me for treating code as data"** reads as the opposite ("made me unable to enjoy").
  Keep the warmth and fix the idiom, for example "Lisp let me treat code as data."
- **Option B** ("the name of a code version you'll keep available for replay") was the sentence the
  reader understood least. Say what it is concretely in a few words: the name of the exact code that
  decided, kept so you can rerun old decisions.
- **"With named combinations in code"** appears without setup. Say who: "If engineers write the
  combinations as named templates…".
- **Optional half-clause:** if every caller only calls it, a function is fine. Without it, the reader
  took the rule as "never store functions", which is stronger than the chapter means.
- Keep "Editing a type won't do that job" and "Does it make the same decision?". Both readers singled
  them out. No new rules.

### 5. Line-level (fix)

- **The template audit record.** Nobody confirms that template decisions log their evaluator
  version too. One clause, probably Eden's, ideally where the last line ("which release to ask")
  pays it off.
- **"This request has one now."** "One" took a second. Say "a template".
- **The Turn's tail** ("We can continue accepting the old named records…" / "The old activations
  aren't waiting for the editor, then.") deflates the end of the Turn. Move it into the Verdict or
  cut it.
- **"Load"** without an orders-service release is only implied. A word, if it's natural.

## Not adopted

- **What "reject" does operationally for a live rule** (fail closed, skip, alert). It's a real
  question, but the chapter doesn't need it.
- **Who approves a new operation** (case b again). As in the first review.
- **A concrete Lisp image in the Principle** ("a rule is a little list the evaluator walks"). It's
  fine if it comes naturally in fixing the idiom. Don't add a parable.

## Next

Codex revises to draft 3. Update the checks for any renamed evaluator, version or changed example,
run `npm ci --offline` plus the full `npm run check`, freeze `ch22/DRAFT3-SNAPSHOT.json`, and commit
locally with these records. Then a Principle-only reader on the revised Principle, and my final diff
review. No further full reader unless the history rewrite changes more than the middle.
