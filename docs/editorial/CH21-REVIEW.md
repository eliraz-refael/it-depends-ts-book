# Chapter 21 self-review — The Message Kept Going

Status: **DRAFT 1 FROZEN; INDEPENDENT READERS AND FORMAL REVIEW PENDING**, 2026-10-25.

Manuscript: [08-hof-patterns.md](../../book/03-patterns-and-design/08-hof-patterns.md).
SHA-256: `21a2fe18636b006854ecb3b25f1f7c663b1648eadb30458fbf54fb7770e66eb0`. **2,320 words**, including code;
**11 TypeScript fences**. [Frozen snapshot](ch21/DRAFT1-SNAPSHOT.json).
Governing settlement: `fb762c4`, at the end of [CH21-PLAN](CH21-PLAN.md).

## Decision and argument

The job needs three attempts with a two-second wait per attempt and takes a sending
function. The gateway's fulfilled promise confirms acceptance; a rejection need not
prove non-acceptance. Those requirements, the notice identity, and a successful job
precede the nested wrappers.

Oded's original composition gives each attempt its own wait but leaves the sends
running. The first trace continues through the third delivery at seven seconds,
after the job's failure result at six. His swapped composition gets its actual
win (one delivery in this slow-success fixture), with its costs named: a total
rather than per-attempt wait and the same false inference from the job's label.
No late-rejection second scene was added.

Idan's replacement timeout supplies a fresh signal for each invocation. The old
client fails at that wrapper input. She explicitly distinguishes the required
input from using it; no compiler claim about safe ordering, cancellation or
repeatability is made. The concrete `SendAttempt` precedes the tuple-generic
implementation. Retry still calls an ordinary function.

Guy supplies the existing client, its receiver and its cancellation contract.
The bound arrow/object-decorator exchange gives both working alternatives and
chooses the arrow because the existing job takes a callback. Guy does not
mistakenly believe abort can recall acceptance. He demands the early-acceptance
fixture before endorsing the repair.

The Turn honors cancellation but delivers three times: acceptance is at one second,
response due at three, local abort at two. Oded proposes no retry and accepts the
operational cost of resolving an unconfirmed job. Guy's owner-keyed operation makes
repetition safe in this fictional gateway, without a storage implementation or a
new type framework on the page. The same logical notice ID passes unchanged through
the attempts. The repaired fixture makes two attempts, delivers once, and lets the
job learn acceptance at 2.1 seconds. Exhausted transient failures remain unconfirmed.

The local Verdict names that operation, receiver, timeout scope and request identity.
Without the owner's repeat-safe operation, it selects the no-retry alternative.
This is not a staged disagreement; Ch22 still carries the open-ending requirement.

## Principle self-check

Two paragraphs from Gilad, with the HOF definition in the first sentence. This is
my self-review, **not an independent reader result**. Expected applications:

- **Unknown charge function:** don't infer repeatability from a Promise or matching
  signature. Obtain the operation owner's guarantee, or don't add retries.
- **Both wrapper orders:** trace the outer wait versus each attempt's wait, including
  what continues when the caller stops waiting. Look for cancellation being used.
- **Overloaded parser:** inspect the returned signatures. The one Take demonstrates
  overload loss and gives preservation or a selected operation as repairs, while
  the generic identity remains generic.
- **Debounced method:** decide whether skipping/delaying intermediate operations is
  allowed, and keep its receiver attached or explicitly forwarded.

No assertion that TypeScript certifies behavior, no universal `SafeToRetry` marker,
and no hidden claim that passing an `AbortSignal` uses it.

## Voice and scope

Five-person cast as settled: Gilad, Oded, Guy, Idan, Eli. Idan is she; the others
are he. Oded owns useful code and both cheap repairs. Guy owns a contract he already
knows; his fixture changes the inquiry. Idan asks for an actionable input rather
than a label. Gilad reads outcomes against deliveries; his clock is a deterministic
test, not a benchmark. Eli has one narrow intervention and the single Take.

Calibrated against the guide, voice notes and Ch7: objections get concrete answers,
there are no catchphrase taglines or narrator judgments about winners, and no
silent review-table closing. The new setup identifies the helper, caller, ordinary
behavior and purpose before each failure. The reader need not remember our probes.
The job's return strings are records of what the job knows; the Turn corrects its
old misleading `failed` label without reopening exceptions versus result types.

Cut as agreed: once, function name/length, decorator tutorial, logging, pipe/compose,
curried wrappers, policy-object debate, cache, effects and deduplication framework.
The one overload Take concerns the client's single/batch receipt lookup. Its working
overload facade is checked but not expanded into a second implementation scene.

The retry predicate is an ordinary function argument, defaulting to the original
permissive behavior. Oded names that default. The final composition receives the
owner's predicate, and the final job rethrows other failures. This gives the settled
owner-classification line executable consequences without introducing an error
hierarchy or a general policy object.

## Compiler and runtime evidence

`npm ci --offline`: **exit 0**. Full `npm run check`: **exit 0** on this text and
validator, TypeScript **7.0.2**, Node **v22.23.3**. No subsequent manuscript or
validator edits. Chapter 21: **11 fences / 16 compiler cases / 17 runtime groups**.
Full book: **372 / 494 / 212**, plus two default cases and two searches.

`checks/chapter21.cjs` extracts every fence by a unique prefix. Competing timeout,
job and adapter definitions are compiled in separate timeline contexts. The two
intentional error comments print codes only; the suite asserts their exact file,
line and code, plus the relevant message elaborations. Other compiler cases cover
both original/signal orders, ignored signals, erased receivers, working object
and overload alternatives, and generic preservation.

Runtime checks execute emitted manuscript code. A manual clock intercepts its
`setTimeout`/`clearTimeout` calls. The gateway is a fixture implementing the stated
contract, not a real integration. Both printed traces and outputs are pinned,
including the post-rejection delivery, cooperative cancellation, accepted-before-ack,
the one-attempt fallback, and the two-attempt keyed receipt. Tests also cover failed
receipts staying unconfirmed, selective retries, receiver loss and repair, timer
cleanup for success/rejection/synchronous throw, error identity, and valid attempt
bounds. Factory assembly starts neither a timer nor a send.

The microtask drain has a fixed 100-turn bound for these finite chains. It is not a
general scheduler simulator. It does not claim real-time deadlines or measure
throughput. No wall-clock sleeps are used. The strict-mode runtime fixture is
explicit, so the receiver-erasure check doesn't accidentally rely on sloppy-mode
`this` substitution.

Limits: these wrappers are chapter examples, not a production retry library.
The durations are positive fixture constants. Backoff, full-job cancellation,
external shutdown, generalized retry classification and distributed receipt storage
are outside the suite. Listener cleanup belongs to the signal-aware fixture client;
the wrapper clears its timer in `finally`. All seven discovery mechanisms remain
reproduced in untracked probes, but only the settled subset appears in the chapter.

Local logs (not committed): `.probe/ch21-draft1-install.log`,
`.probe/ch21-draft1-targeted.log`, `.probe/ch21-draft1-full-check.log`.
Master plan, check registration/coverage and editorial index are updated; Ch21 is
still unchecked for completion. Next: Claude's isolated Principle-only and full
readers, then formal review. **Local commit only; no push.**
