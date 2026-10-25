# Chapter 21 self-review — The Message Kept Going

Status: **DRAFT 2 FROZEN; PRINCIPLE READ AND TARGETED RECHECK PENDING**, 2026-10-25.

Manuscript SHA-256: `e53251d7bebd3878b92de05b8da4a68ac91e00e0d6d16b89f558799ca24b71f5`.
**2,383 words**, including code; **13 TypeScript fences**.
[Draft-2 snapshot](ch21/DRAFT2-SNAPSHOT.json). The draft-1 snapshot remains unchanged.

`npm ci --offline` and full `npm run check`: **exit 0**, TypeScript **7.0.2**,
Node **v22.23.3**. Chapter 21: **13 fences / 16 compiler cases / 19 runtime groups**.
Full book: **374 / 494 / 214**, plus two default cases and two searches.
The manuscript and validator were not edited after the full run. Local logs:
`.probe/ch21-draft2-install.log`, `.probe/ch21-draft2-targeted.log`, and
`.probe/ch21-draft2-full-check.log` (not committed).

## Response to Claude's draft-1 review

Read [CLAUDE-REVIEW](ch21/CLAUDE-REVIEW.md) and both verbatim reader reports
committed at `108e810`. The findings are accepted, with the overload rule qualified
to the tuple/result-inference wrapper rather than every possible generic wrapper.

1. **Guy's existing operation.** He names `sendOnce` in the first incident scene:
   it prevents duplicate messages but leaves requests running and waiting. Idan
   explicitly chooses to fix those requests first. After the zero-delivery signal
   test, Oded asks whether they still need `sendOnce`; Guy demands the early-
   acceptance fixture. The Turn thus tests a real proposed simplification, rather
   than withholding the owner's known repair. His acceptance-before-acknowledgement
   contract remains planted before the repair, and the no-retry fallback is retained.
2. **Principle.** Still two paragraphs. Rejection need not mean no work occurred;
   without owner-established repeatability, don't retry an ambiguous failure and
   report its outcome as unknown. Stopping a wait is separated from stopping work.
   The receiver instruction says to call through the instance and warns that a
   generic wrapper can accept detachment even with an explicit `this`. The overload
   instruction says to try each public call and identifies last-overload retention
   in a wrapper inferring one tuple/result pair. This does not claim all generic
   wrappers necessarily discard overloads. The vague closer is cut; the first
   paragraph gives Gilad's concrete failed-job/three-messages consequence.
3. **Shown receiver evidence and object alternative.** Two new fences. The first
   passes `client.send` to `withTimeout`, compiles, invokes the result and prints
   the exact Node 22 receiver error. The second names `Sender` and prints a small
   `RetryingSender` that delegates to the existing retry helper while retaining
   `inner.send`. It does not print a second retry algorithm. Both code fences are
   compiled and run. The object keeps the existing interface; the function-valued
   job is Oded's local reason to keep the bound arrow. The object comparison is
   about receiver/API shape, not a claim that it supplies the final timeout/key
   policy automatically.
4. **Only answer proposed arguments.** Cut Idan's unprompted marker rebuttal, rather
   than adding a phantom-brand proposal. Cut the closing ownership summary. Oded
   explains that an owner-retryable error escaping this `withRetry` means the
   attempts were exhausted before replacing `runJob`'s catch.
5. **Unknown outcome and lookup.** Guy points to the reconciliation worker's receipt
   lookup for unresolved jobs, giving the Take's lookup a purpose. For a final
   failure to connect, he explains why the last attempt alone cannot establish the
   whole job's outcome: an earlier attempt may already have sent. This is a
   failure-to-connect claim, not a claim that any connection error proves no send.
   A new runtime case has acceptance on the first attempt, then two failures to
   connect; the final handler correctly returns unconfirmed. No error taxonomy or
   worker implementation was added to the chapter.
6. **Continuity and voice.** Gil becomes Gilad; the Take uses Prof. Eli Typeworth;
   the old third delivery is past tense; the first `send` is explicitly the old
   notice-only adapter. The per-attempt requirement is Oded's speech. Idan asks
   directly where the send is stopped; Oded answers directly. Guy says the other
   operation is still running. The overload success comment says Compiles. The
   failure predicate is Guy's instruction, and Gilad states delivery time versus
   confirmation time in one turn. Repeated adjacent speaker tags are removed.

## Validation changes and limits

Every one of 13 fences is extracted uniquely. The printed detached timeout and
object replace their previous scratch-only compiler fixtures, so compiler cases
stay at 16. The receiver runtime check now asserts the printed error text exactly;
the object is exercised through success and a fail-first retry with its receiver
intact. The two original TypeScript error locations and all original timing/output
checks still pass.

Two runtime groups were added. One demonstrates that the keyed operation alone
prevents duplicate deliveries but still has a pending response after the caller
gets its receipt, for both early and later acceptance. This exposed a limit in the
old fake: it checked an existing key only at request start. The fake now checks at
acceptance too, so overlapping requests that began before the first acceptance
cannot both deliver. That implements the stated owner contract for the new case;
it changes none of the original printed traces. The other new group establishes
the final-connect-failure reasoning described above.

The gateway remains fictional. The fixture is not a production deduplication
implementation. The timeout/retry algorithms, fresh-signal claim, existing output
values, and local Verdict are unchanged. No memo cache, late-rejection extra scene,
curried wrapper, logging wrapper or policy-object debate was introduced.

## Self-check and handoff

The Principle now states actions for all four cases: owner guarantee or no retry
for an unknown charge; inward call/outward failure tracing for timeout order;
exercise each overload and inspect last-overload inference; retain the instance
for a debounced method despite compiler acceptance. The main scene supplies the
receiver evidence; the Take supplies the overload evidence. This is my self-check,
not an independent reader result. Claude's new Principle-only reader and targeted
recheck are pending.

All three Claude records at `108e810` and the original snapshot are untouched.
Master tracking and coverage identify draft 2, not a completed chapter. The local
Verdict and Ch22 open-ending debt remain unchanged. **Local commit only; no push.**

---

## Historical draft-1 self-review

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
