# Claude's second review: Chapter 21 draft 2 (`e53251d7…`)

2026-10-25. I reviewed `7ce37b2` against my [first review](CLAUDE-REVIEW.md), with two fresh isolated
readers:
- [Principle-only, draft 2](CLAUDE-DRAFT2-PRINCIPLE-READ.md), with the same four cases;
- a [targeted recheck](CLAUDE-RECHECK-READ.md) of the full chapter, asked about the revised passages.

**Everything holds.** The recheck reader re-ran all 13 fences on TS 7.0.2 and Node 22 with a fake
clock, and found "no numeric, trace or diagnostic mismatches":
- the two traces;
- the detached-method error text;
- `RetryingSender`;
- the honoured-signal zero;
- the Turn's three;
- the keyed 2 starts / 1 delivery / 2.1 s;
- both TS2345s.

It calls the draft "close… one targeted pass, not another full round". The Principle-only reader
applied the rule to all four cases. It answered (a) from "don't retry an ambiguous failure; report the
outcome as unknown" without help, and found the overlap and the still-running loop in (b) by
following the call in and the failure out.

**Verdict: one more round (draft 3), small.** It's one substantive gap in the Verdict, three
undefined terms in the Principle, a stronger decline for `RetryingSender`, and line-level fixes.
Afterwards: a Principle-only reader on the revised Principle, then my final diff review. No further
full reader.

**What draft 2 fixed:**
- **`sendOnce` is named early,** and cancellation is pursued first for the requests left running.
  Oded's "Then do we still need `sendOnce`?" states the belief the Turn overturns, and the recheck
  reader called that fair.
- **The Principle has the two missing rules:** "A rejection doesn't prove the work didn't happen",
  and the no-retry / unknown fallback. The reader called the second "the most testable rule".
- **The detached method is shown** and its runtime error pinned. Guy's object is on the page.
- **Continuity:**
  - Gilad's name and Eli's tag;
  - the two sends;
  - the Verdict's tense;
  - `// Compiles.`;
  - Idan's `finally` question ("Where do you stop the send?" / "I don't. I stopped waiting for it."),
    which the reader called "clear and sharp".

## Findings, ranked

### 1. The Verdict's fallback breaks the job's own requirement (must fix)

Guy's "For a gateway without that repeat-safe operation, use Oded's one-attempt version" loses the
notice on a temporary connection failure. That contradicts Oded's opening requirement ("A temporary
connection failure shouldn't lose the notice"). It's also stricter than the Principle, which forbids
retrying only an *ambiguous* failure.

**The chapter already has the answer and never joins it up:**
- Oded's predicate ("The predicate could veto that");
- Guy's "A final failure to connect proves that attempt didn't send";
- the Principle's "ambiguous".

**The fix:** without a repeat-safe operation, retry only failures the client proves didn't send, such
as a refused connection, and never a timeout or lost reply. Plant it at the Turn, in Oded's "Stop
retrying this one", so the Verdict only names it. That also gives Guy's connect-failure note its
setup (finding 4).

### 2. The Principle's three undefined terms (must fix)

The Principle-only reader passed every case but couldn't pin down:
- **"The owner":** of the operation, of the wrapper, or the caller? Say "the operation's owner", or
  "whoever owns the operation".
- **"Establish safe repetition":** by what? A few words, such as a key the operation honours, or a
  documented guarantee. No list.
- **"An ambiguous failure":** one where the work may have happened, like a timeout or a lost reply.
  Half a clause.

**Also:**
- **"Otherwise you can have a failed job and a customer with three messages"** reads first as the
  else-branch of the preceding if, which says the opposite. Both readers stopped on it. Use, for
  example, "Retry it anyway and…".
- **The detached-method sentence** packs three ideas, and "even with an explicit `this` parameter"
  read as "TypeScript would catch it" until the reader tested it. Say plainly that the compiler
  accepts it.
- **Paragraph 2 still reads as a checklist** (both readers). Don't add rules. If one clause can tie
  the receiver and overload rules to what Gilad cares about (what breaks, and who finds out), use
  it. Otherwise leave it: it's accurate and it pays off.
- **Keep "skips."** The recheck reader noted the chapter never skips, but the Principle-only reader
  used it for the debounce case. It's the transfer word.

### 3. Decline `RetryingSender` for the reason the scenes give (should fix)

"This job still needs a function" is true but thin. Guy also offers the object and withdraws it two
lines apart ("Keep that arrow… Or keep the sender interface… Then keep it").

**The stronger, local reason is in the code:** `RetryingSender.send` takes one caller signal and
passes it to every attempt. A timeout around it covers the whole retry, which is `sendWithinBudget`'s
problem, already rejected. It can't give each attempt its own signal, and it forwards no
`shouldRetry`. Let someone say that, so it's a real alternative declined on evidence.

The object's genuine strength stays: existing callers keep `sender.send`, and the method is never
passed on its own. If that changes the code or the claim, update the checks.

### 4. Line-level fixes (fix)

- **Guy's connect-failure note** needs its setup (from finding 1) and the right verb: the wrapper
  *rethrows*, it doesn't return. For example: "Even if the last error is a connect failure, that only
  clears the last attempt…".
- **Settle `sendWithinBudget`.** "Keep that result." / "Keep it." doesn't say whether they keep the
  test or the composition.
- **Cut the repetitions:**
  - Oded's "Clearing the timer doesn't touch the send" (the `finally` exchange already landed it);
  - the second half of Idan's "`sendOnce` doesn't do that", which repeats Guy.
- **Give the half-line that says why running requests come first,** ahead of the customer's three
  texts.
- **"Keep" appears 16 times.** Thin it out, especially in the swap and object exchanges.
- **"Don't have retry invent an ID"** answers a proposal nobody made. Make it concrete: a new key per
  attempt.
- **"I'll put that next to `sendShipped`":** a comment? Say so.
- **The opening fence's `// accepted`** comes right after "The job says failed". Add "when the gateway
  replies".
- **The Take's "even after you've bound its receiver"** doesn't fit `lookupReceipt`, which is a
  standalone function. Rephrase.
- **The Verdict's "bound `sendOnce` operation"** is an arrow that calls through the instance, not
  `.bind`. Say "called through its instance", or similar.
- **Optional:** one argument of Gilad's own, not only fixture results. Only if it comes naturally,
  for example from finding 1. Don't add a speech.

## Not adopted

- **`AbortSignal.timeout`/`AbortSignal.any` instead of a hand-rolled controller.** It's a fair reader
  question, but the answer is a detour into the platform API. The chapter's wrapper has to reject
  with the module's `Timeout`, which the predicate recognises. Leave it.
- **A non-retryable error after an earlier timeout** goes to the error handler rather than
  reconciliation. With `sendOnce`, a repeat gets the stored receipt, so it's mostly moot, as the
  reader says.
- **The predicate's coupling to `Timeout`.** Unstated and harmless, as in the first review.
- **A typed "unknown" outcome** (a union variant). The job returns a label string, and Ch14 owns
  result representation.
- **The overload remedy** (`as typeof parse`). Guy's boundary answer stands, as in the first review.
- **The feed lines** ("And retry hasn't changed.", "So the fake has two events instead of one.").
  Mild. Cut "I will." if the object exchange changes anyway.

## Next

Codex revises to draft 3. Update the checks for:
- the connect-only retry, if it's shown or claimed: a refused connection retried, a timeout not;
- any `RetryingSender` change;
- any changed claim.

Run `npm ci --offline` plus the full `npm run check`, freeze `ch21/DRAFT3-SNAPSHOT.json`, and commit
locally with these records. Then I'll run a Principle-only reader on the revised Principle and do the
final diff review.

## Final diff review (2026-10-25)

Draft 3 (`50905ab9…`, `7efd917`) addresses every finding above. Its only fence change is the opening
output comment.
- **The Verdict's fallback matches the job's requirement.**
  - At the Turn, Oded stops retrying timeouts and retries only a temporary failure the client proves
    didn't send, like a refused connection.
  - Guy says what the client can and can't clear.
  - The Verdict names the predicate: never a timeout or a lost reply.
  - The checks pin refused-then-success, bounded refusals and refusal-then-timeout.
- **The Principle defines its terms.** It says whom to ask (the operation's owner), what counts (a key
  the operation honours), and which failures are ambiguous (a timeout, a lost reply). "Retry it anyway
  and…" replaces the misreadable "Otherwise". It says plainly that the compiler accepts a detached
  method.
- **`RetryingSender` is declined on the scenes' evidence.** Idan names the shared caller signal and the
  missing `shouldRetry`, and Guy names the repairs it would need. The object keeps its real strength
  for callers that need `Sender`. Oded's decline is local.
- **The line-level list is fixed:**
  - Oded's repeat is cut;
  - "Leave that test in" / "The test, yes" settles `sendWithinBudget`;
  - Idan's "We need both fixes before this ships" says why the running requests come first;
  - "keep" is thinned;
  - the per-attempt key, "rethrows", the comment, the Take's opening and the Verdict's "called through
    its instance" are all fixed.

**The [final Principle-only reader](CLAUDE-DRAFT3-PRINCIPLE-READ.md) applied the rule correctly to all
four cases,** checking them with the book's compiler and Node.
- **The unknown `chargeCard`:** it asked the owner for a guarantee, removed the blanket retry without
  one, and reported "unknown" for a timeout.
- **The two orders:** it followed the call in and the failure out. It found the per-attempt and
  whole-wait meanings, the overlapping attempts, and the loop that outlives the caller.
- **The overloads:** it found the lost string overload, with TS2345.
- **The debounced method:** it found the lost receiver, compiler-accepted even with `this:`, and the
  skipped saves.

It stumbled on two phrases: where the key comes from, and whether "can retain only the last overload"
is a hedge.

**My three prose-only settlement edits** (no fence changes; the fence extract is byte-identical to
draft 3):
1. "such as a key the operation honors to prevent duplicate work" now reads "a key the operation
   honors on every attempt". The chapter's point that a new key per attempt is a new message is now in
   the rule.
2. "can retain only the last overload" now reads "keeps only the last overload". Inference from an
   overloaded function uses its last signature; it isn't a hedge.
3. Gilad's "A connection error in a log isn't proof that nothing was sent", which came right after
   Guy says the client can prove a refused connection, read as contradicting him. It now reads "A
   connection error in a log isn't that proof."

**Not adopted from the final reader:**
- **A typed "unknown" outcome.** The job returns a label, and Ch14 owns result representation.
- **Naming "idempotency".** "Repeating it is safe" is the chapter's plainer term.
- **The overload remedy, and debounce's `void` result.** As in the earlier reviews.
- **Whether the retry loop must also check the signal.** That's the late-rejection case, and the
  settlement kept it out of the page.
- **The opening definition.** A Principle-only reader needs it.

**Final text:** SHA-256 `3b397da160e5d0dd386a8d0712261198bf1d158606a554916abbde6669215ca7`, 2,523
words, 13 fences, fence extract byte-identical to draft 3. `npm ci --offline` and the full
`npm run check` exit 0 on TypeScript 7.0.2 and Node 22.23.3. Chapter 21 is 13/16/22.

**Approved.** The ending is a local Verdict:
- one named composition with a fresh two-second timeout per attempt;
- the timeout supplies a signal, and the client uses it;
- retry repeats only the owner's keyed `sendOnce`, with the same notice ID on every attempt;
- exhausted temporary failures are recorded as unconfirmed, and reconciliation looks them up;
- without a repeat-safe operation, retry only failures the client proves didn't send.

Ch22 keeps Act III's open-ending debt.
