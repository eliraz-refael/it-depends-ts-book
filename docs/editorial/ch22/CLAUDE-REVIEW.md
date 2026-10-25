# Claude's review: Chapter 22 draft 1 (`13db9f3c…`)

2026-10-25. I reviewed `4b0d7f7` against the [plan](../CH22-PLAN.md), with two fresh isolated
readers:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md), with the plan's four cases, also asked about enjoyment;
- a [full read](CLAUDE-FULL-READ.md), asked to verify every claim and to say where it got bored.

**The chapter works, and it's fun where it counts.** The full reader re-ran every fence and found
"no mismatches in code, output, counts or diagnostics". It called the opening excellent, the alibi
line the best in the chapter, and `holds(restored, order) // false` "a small detective reveal". It
would retell the audit scene to a colleague. The Turn changed its mind in two steps, and it found the
Verdict honest because "three" is admitted to be negotiated. The Principle-only reader applied the
rule correctly to all four cases.

**Verdict: one more round (draft 2), moderate.** The story is right. The fixes are the policy's
history, Dafna's strongest case, the Principle's voice and terms, and the slow middle.

## Findings, ranked

### 1. The policy's history doesn't add up (must fix)

The full reader reread it several times and couldn't make it line up:
- On the third the policy is `total > 500 OR velocity`, with no country.
- "Since the third, the risk team narrowed the policy to repeated refunds in the FR campaign" drops
  the large branch without saying so. The ticket then "adds high totals back".
- Gil's new-condition row says velocity was added to "a policy that only knew totals and country",
  but scene 1 has no country.
- "Version-1 refund settings" lacking `days` have no place in that history: the record on the third
  had no refund fields at all.

**Fix:** one continuous history the reader can hold in their head, stated once in two or three lines
before the ticket. For example: country and total from the start; velocity added (the new condition,
and version 1 without `days`); then a regrouping; now this ticket. Make every census row an event the
reader has already seen or can place. Choose the simplest version. If it removes the version-1 story,
see finding 5.

### 2. Templates are the status quo; say so before the tree (must fix)

"The console already has the country-and-velocity template" arrives before either proposal. The
reader only realised later that Eden is defending the current design and Dafna is proposing a change.
State it plainly where the scene opens: the console has templates, Dafna wants to replace them with a
tree, and so her proposal carries the burden.

### 3. Give Dafna her strongest case, and let the Verdict survive it (must fix)

- **"Three in this batch"** reads as three real orders let through. It's three of Gil's eight
  samples. Say so, or give a real count of large orders let through while the ticket waited. A count,
  not a duration.
- **Suppressed demand.** Two regroupings in three months may undercount, because analysts don't file
  tickets they know are slow. That's Dafna's natural rebuttal to Gil's table, and its absence is "the
  one place the scale tips quietly toward Eden". Give it to her. Let Sahar or Gil answer it, and let
  the deferral survive it, for example by making the trigger count requests the analysts are asked to
  file, including the ones they'd have skipped. Don't invent a winning fact for either side.
- **What a "checked policy artifact" costs** is never said. Dafna's "They still need you to write the
  expression" is the crux. One line from Eden on what writing and loading a template involves (who
  writes it, who reviews it), with no duration claim.

### 4. The Principle is accurate, but it doesn't sound like Liron (should fix)

The reader called it "mostly documentation… careful and compressed… I can't hear Liron in it", with
no nod to code as data from a Lisp veteran. It couldn't apply "identify retained code" and stalled on
undefined terms.
- **Define the terms in passing:** "evaluator" (the code that reads the description and decides),
  and "retained code" (a named version of the code that stays available for replay, like `review-2`).
- **"A saved account of"** read as a user account. Say "record", or say it bluntly: a function
  doesn't survive being saved, and even its source text loses the values it closed over.
- **Let Liron be a person** in one clause: his Lisp background has a real point here (in Lisp code
  could be data; in JSON it can't). No catchphrase and no parable.
- **R6 asks the question without the consequence.** Half a clause: a parameter change needs no code,
  a permitted combination needs whoever the format gives it to, and a new operation needs engineers.
- **Keep:** "find everyone who uses it", the round-trip test and "Does it make the same decision?",
  and the three-question rhythm. The reader called those the best lines.
- Two paragraphs, no new rules.

### 5. The slow middle (should fix)

The reader skimmed lines 141–175: setup prose, `Params` and `Decision`, the whole `matches` switch,
then the whole rule literal, before the tension returns. The version-1 `days` exchange (255–259)
"felt like a checklist item… nobody wants anything in that exchange". That's the premise's warning
case.
- **Compress the setup prose** around `Params`/`Decision`, and consider folding those types into the
  first fence that uses them.
- **Shorten `matches` and the tree.** The exhaustive `never` is earlier-chapter material. Keep the
  `all`/`any` cases and the `never` line visible, and keep the tree literal readable rather than
  complete if the checks allow it.
- **The version-1 exchange:** either give it to someone who wants something (Dafna needs old
  activations to replay for compliance, say) or cut it. If it's cut, the Principle's last two
  sentences need a scene or should go too.

### 6. Line-level (fix)

- **Make the optional `?` part of the reveal.** `policy.extraHold?.(order) ?? false` is why the
  restored policy says `false` with no error. One line from Chen or Eden. The Principle reader found
  this on its own and called it "the TypeScript-specific trap".
- **Chen's "And gave the object without the function the same record"** took a reread. Something like
  "Two different policies, one record."
- **`as const` is load-bearing:** without it, `evaluators[auditRecord.evaluator]` is TS7053. Half a
  clause.
- **An `interface Order` fails `satisfies Json`** (TS1360, no implicit index signature). It will catch
  readers who try this. One line if it fits naturally; otherwise leave it out.
- **Sahar's full name** appears twice (lines 88 and 319). Drop the second.
- **"That answers it."** (Chen) is a flat closer for the deferral. Let him say what it answered.

## Not adopted

- **A typed "unknown" or `Result` for decisions.** Ch14 owns result representation.
- **"Who approves a new operation?"** (Principle reader, case b). The chapter's owners are stated; the
  Principle needn't name an approver.
- **The dashboard calling the config function per environment** (case d). A fair transfer question,
  but out of the chapter's scope.

## Next

Codex revises to draft 2. Update the checks for any changed history, counts or fences (the sample
count if it's reworded; the real let-through count if one is added). Run `npm ci --offline` plus the
full `npm run check`, freeze `ch22/DRAFT2-SNAPSHOT.json`, and commit locally with these records. Then
I'll run a Principle-only reader on the revised Principle and a targeted recheck of the changed
scenes, including the enjoyment questions.
