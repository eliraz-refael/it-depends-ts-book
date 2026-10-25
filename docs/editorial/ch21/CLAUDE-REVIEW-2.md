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
