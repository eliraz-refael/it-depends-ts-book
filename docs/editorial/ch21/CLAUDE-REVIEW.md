# Claude's review: Chapter 21 draft 1 (`21a2fe18…`)

2026-10-25. I reviewed `e3e16df` against the [settled plan](../CH21-PLAN.md), with two fresh
isolated readers:
- a [Principle-only read](CLAUDE-PRINCIPLE-READ.md), with the plan's four cases;
- a [full read](CLAUDE-FULL-READ.md), which re-ran every trace, count and diagnostic.

**The code is right.** The full reader reproduced everything on TS 7.0.2 and Node 22 with a fake
clock:
- the 0/2/4 starts and 3/5/7 deliveries, with "failed" at 6 s;
- the swap's one start and one delivery, with "failed" at 2 s;
- the zero deliveries with honoured signals;
- the Turn's three deliveries;
- the keyed 2 starts / 1 delivery / 2.1 s;
- both TS2345s and the preserved generic.

Its verdict is "close… none of these needs a structural rewrite". The Principle-only reader applied
the rule to all four cases. For (b) it used "follow the outside call inward" mechanically and found
the per-attempt / whole-wait split.

**Verdict: one more round (draft 2), moderate.** That's a plot gap, the Principle's two most-needed
missing rules, four undefined or unshown references, and small continuity and voice fixes. The room
has space: the draft is 2,320 words against a 2,300–3,200 budget. Afterwards: a Principle-only
reader on the revised Principle, and a targeted recheck of the revised passages.

**What works and must survive:**
- **The setup plants the gateway contract** ("a rejection or a missing reply doesn't prove the message
  wasn't accepted") before any wrapper, and it pays off twice.
- **The incident trace runs past the job's result.** "That last delivery happens after the job has
  finished" lands.
- **Oded's swap gets its win** ("That's two fewer texts. Keep that result.") and its limit, for the
  job's stated per-attempt requirement.
- **The TS2345 exchange says exactly what the type proves:** "We have to give the wrapper a different
  operation. That doesn't make the operation use the signal."
- **The Turn.** Idan's "We asked it to cancel the request, and treated that as permission to repeat
  the message" is the hinge, and the full reader called it "the strongest section".
- **Oded's no-retry stance** ("one uncertain send than three definite ones") is fair, costed by Gilad,
  and kept in the Verdict as the fallback.
- **Nobody is a fool,** and there are no pronoun errors.

## Findings, ranked

### 1. Guy has `sendOnce` all along (must fix)

Guy owns the client and sees three deliveries in the first scene, then steers the room to
cancellation and offers `sendOnce` only after the Turn. A sharp reader feels the cancellation scene
was a detour he could have cut short.

**The fix should come from what each repair does, which the chapter already shows:**
- `sendOnce` stops duplicate *messages*. It doesn't stop three requests running and waiting at once.
- Cancellation stops the work left running. It doesn't stop duplicates.

The Verdict uses both. So Guy can name `sendOnce` early, and the room can decide on the page to do
cancellation first, for the work left running, and keep `sendOnce` in view. Or give Guy another
reason he'd really have. Either way, the reason goes on the page, and the Turn still has to change
the room: what it shows is that cancellation alone was not enough for duplicates.

### 2. The Principle is missing its two most-needed rules (must fix)

- **A rejection doesn't prove the work didn't happen.** It's the chapter's spine (the setup's
  contract, the "failed" label, "unconfirmed"), and the Principle-only reader had to infer it for
  `chargeCard`. Say it.
- **What to do when the owner can't establish that a repeat is safe:** don't retry, and report the
  result as unknown. The reader asked, and Oded's fallback is the chapter's answer.

**Also:**
- **"A timeout only stops waiting unless someone also stops the work"** tripped the reader. For
  example: "A timeout stops the waiting, not the work."
- **"Check the returned signatures"**: check for what? Say that a generic wrapper keeps only the last
  overload.
- **"Forward its receiver"** is undefined, and no scene shows it (see 3). Either say it concretely
  ("call the method through its instance") or cut that option.
- **The compiler doesn't catch a detached method,** even with a `this` parameter. Both readers
  verified this, and it belongs in the receiver sentence.
- **Cut "The same-looking call can do different work."** The reader couldn't tell what it sums up.
- **The second paragraph reads as a checklist** ("Find… Keep… Check…"). The opening definition is
  textbook. Keep the definition, which a Principle-only reader needs, but carry it in Gilad's voice.
  Give the paragraph the consequence he'd name: a job that says failed and a customer with three
  texts.
- **Keep it to two short paragraphs.** Adding the two rules means cutting elsewhere, not growing a
  checklist.

### 3. Shown, not told: the detached method and Guy's object (must fix)

- **Show the detached method.** One line, `withTimeout(client.send, 2000)` (or the job's
  composition), compiles, then fails at runtime: `Cannot read properties of undefined (reading
  'connection')`. It's the only evidence for the Principle's receiver clause, and Guy currently only
  asserts it. Pin it in the checks.
- **Guy's object alternative is unreadable as written.** "a sender object implementing our interface
  … calls `inner.send`" uses names nobody has introduced. Give it its strongest form briefly: a few
  lines, or a precise sentence naming the interface. Then Oded's decline ("the job wants a
  function") weighs something real. Don't let it grow into a class tutorial.

### 4. Answer the argument that was made (should fix)

- **"Adding a marker to an ordinary function wouldn't give it that behavior"** rejects a proposal
  nobody made. The plan has Idan separate performing the work from labelling a function safe. Put
  the proposal on the page, one line from Oded or Guy ("Can we mark it safe to retry?"), then
  Idan's answer. Or cut the sentence.
- **`runJob` v2 depends on reasoning nobody states:** a retryable error escapes `withRetry` only once
  the attempts are used up. One clause in dialogue.

### 5. The lookup and the connect failure (should fix: a line each)

- **The Take's `lookupReceipt` makes an omission conspicuous.** If the client can look up a receipt
  by ID, why does an exhausted job stop at "unconfirmed"? Either one line says who resolves an
  unconfirmed job and how (a lookup is fine, without code), or the Take uses a different client
  signature.
- **"Couldn't connect" proves non-acceptance,** yet it's labelled "unconfirmed" with the timeouts.
  Either the client's predicate distinguishes it, or someone says in a line why the job doesn't
  bother. Don't build an error taxonomy (Ch14).

### 6. Continuity and wording (fix)

- **"Gil runs the same three-second fixture"** names a character who isn't in the chapter. It's
  Gilad.
- **The Take's tag "Eli Typeworth"** matches neither of the book's forms. Use "Prof. Eli Typeworth"
  or "Eli".
- **The Verdict's "The third delivery happens after it returns"** describes the old composition in
  the present tense. The kept one delivers at most once. Use "happened" or "would happen".
- **Two sends:** `declare const send: Send; // … bound send operation` and then `GatewayClient.send(signal,
  notice)`. Say early that the first is a notice-only operation over the client, or name it
  differently.
- **"The other operation is still ours."** Ambiguous; "still running" says it.
- **Collision with the chapter's own word:** the Take's `// Accepted.` means "compiles". Use
  `// Compiles.`.
- **Idan's "Which thing is done?" / "The call to the wrapper. I see where you're going."** is
  cryptic. Make the point land in one exchange.
- **Lines that read like a manual:**
  - Oded's four-statement wrapper explanation (line 90), which reads like a code comment;
  - Idan's closing summary "So the wrapper owns the timer and the repetition…";
  - the narration before `keyedClient`.

  Turn them into speech, or trim them.
- **The 2.1 s restatement** (Gilad, Guy, Gilad) can be one exchange.
- **"It has no two-second limit for the whole job."** It's the sentence that later decides the swap;
  give it to a person, or make it unmissable.

## Not adopted

- **The reader's `<F extends (...args: any[]) => any>(f: F): F` plus `as F` for overloads.** The book
  doesn't endorse the cast, and Guy's answer (keep the signatures at the boundary, or give the caller
  the one operation it needs) is the right local one.
- **A per-attempt timeout plus an overall deadline.** The job has no overall limit, and the text
  says so.
- **Retry honouring an outer signal** (the late-rejection case the Principle reader found for
  itself). The settlement kept it as a fallback, and the Turn carries the point.
- **Debounce's `void` result** and the word "idempotent". "Repeating it is safe" is clearer, and the
  book hasn't used the term. Use it once if a character naturally would, but it isn't required.
- **The client predicate's coupling to the module's `Timeout` class.** It's real, and no reader
  needs it explained.
- **The feed lines** ("Does retry make the signal?", "Same delayed reply on the first attempt?").
  Mild; leave them, unless a revision removes them anyway.

## Next

Codex revises to draft 2. Update the checks for:
- the detached-method compile and its runtime error;
- any new fence, such as Guy's object;
- any changed claim.

Run `npm ci --offline` plus the full `npm run check`, freeze `ch21/DRAFT2-SNAPSHOT.json`, and commit
locally with these records. Then I'll run a Principle-only reader on the revised Principle and a
targeted recheck of the revised passages.
