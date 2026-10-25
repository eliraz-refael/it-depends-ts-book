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

## Final diff review (2026-10-25)

Draft 3 (`8f2ecb7c…`, `bfd4b32`) addresses every finding above.
- **The history is a short exchange.** Eden recounts and Dafna corrects: total and country templates,
  refunds added to the total template on the third, country-and-velocity replacing it, and now the
  ticket. Every census row is placeable, and the parameter example is now a threshold change (500 to
  450), so it no longer contradicts the window history.
- **No colliding "2"s.** The retained code is `release-a81f`, the tree format starts at 1, and the
  settings are "format 1/2", explained only where the old-settings exchange needs them.
- **The old-settings exchange has its cue:** Dafna asks to reopen `country-velocity`'s old activations
  for compliance.
- **"Three" is untangled.** Dafna says the third regrouping is the next one, and Gil now distinguishes
  counting requests from choosing when to build.
- **The Principle** fixes the Lisp idiom, makes the retained-code option concrete, sets up named
  templates and adds "If every caller only calls it, a function is fine."
- **Line-level:** Eden's Verdict confirms that every decision logs its evaluator version, settings and
  order facts in either format; the Turn's tail moved into it; "a template now"; and "without an
  orders-service release".

**The [final Principle-only reader](CLAUDE-DRAFT3-PRINCIPLE-READ.md) applied the rule correctly to all
four cases,** checking them with the book's compiler and Node:
- **(a) the notification filter:** the dropped function, with the optional `?.` hiding the loss, and a
  description plus evaluator with a round-trip test;
- **(b) the admin count:** a new operation, after which the threshold is a parameter;
- **(c) the stored rules:** they compile through the cast, so parse them and fill the value that keeps
  their old meaning;
- **(d) the dashboard:** the "explain" consumer, so a description, or recorded results.

Its weakest spot was the retained-code branch: it couldn't tell when to choose it over a description.

**My four prose-only settlement edits** (no fence changes; the fence extract is byte-identical to
draft 3):
1. "Or record the name of the exact code that made the decision, plus its parameters. Keep that code
   so you can rerun old decisions." now reads "If the decision has to stay in code, record the name of
   the exact code that made it, plus its parameters, and keep that code so you can rerun old
   decisions." That says when to use it, which is the chapter's own case: Eden's `release-a81f`.
2. "An engineer must implement it in either design" now reads "either way". The reader couldn't tell
   which two designs were meant.
3. Gil's "Both versions handle the six parameter changes" now reads "Both designs". After the rename,
   "versions" collided with the formats.
4. "handles the version-1 window" now reads "the format-1 window", matching Eden's earlier line.

**Not adopted from the final reader:**
- **Who classifies a request, and who approves a new operation.** As in the earlier reviews.
- **When rejecting old values is acceptable.** The chapter's case preserves meaning; the rule names
  both choices.
- **More of Liron's voice.** The Lisp line now works, and the second paragraph's rhythm "does sound
  spoken". Adding an anecdote would lengthen a Principle that three readers applied correctly.

**Final text:** SHA-256 `cb6dd828f6dbae7a4d0069520d1c4ef02fc0901030fedcf4831b9890ecb3cf2a`, 2,470
words, 12 fences, fence extract byte-identical to draft 3. `npm ci --offline` and the full
`npm run check` exit 0 on TypeScript 7.0.2 and Node 22.23.3. Chapter 22 is 12/17/17.

**Approved.** The ending is a local Verdict:
- named templates now, with console-editable parameters;
- the current grouping added as a checked template;
- every decision logs its evaluator version, settings and order facts;
- the general editor work starts at the next regrouping request, including the ones the analysts held
  back.
