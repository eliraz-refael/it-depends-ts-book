# Chapter 21 plan challenge

2026-10-25. Read against `96a8492`, the writing guide, character notes/bios,
Ch7's calibration, and the Act III material this plan touches. **No manuscript drafted.**

## Recommendation — change the proposed centre, keep the incident and local Verdict

The incident works. Keep the question of what a function wrapper changes, and keep
Gilad as Principle speaker. **Do not promise that a signal-taking signature makes
the incident's order a compile error.** There is a small, readable type-changing
repair, but it checks the input's call shape. It cannot certify cancellation or
safe repetition, and both wrapper orders can be legitimate.

My preferred repair has **timeout create a fresh signal on each invocation** and
retry repeat that invocation. The signal goes into the operation; the caller gets
a function taking the ordinary request. This is an actual change of signature,
with no brand or type puzzle. Keep the accepted-before-abort Turn: it restricts
what the wrappers can establish about the function they call. Scope the ruling
to this sender and its owner's retry contract, rather than a universal branded
`SafeToRetry` abstraction.

Five people: **Gilad, Oded, Guy, Idan, Eli**. No optional sixth speaker. Local
Verdict, with Ch22's open-ending debt untouched.

## 1. Signal types: what they catch, and what they do not

### A. The proposed retry-owned signal can reject a reversed order

These declarations reproduce the strongest small version of the proposal:

```typescript
type Attempt<A extends unknown[], R> =
  (signal: AbortSignal, ...args: A) => Promise<R>;
type Job<A extends unknown[], R> = (...args: A) => Promise<R>;

declare function withTimeout<A extends unknown[], R>(
  f: Attempt<A, R>, ms: number,
): Attempt<A, R>;
declare function withRetry<A extends unknown[], R>(
  f: Attempt<A, R>, attempts: number,
): Job<A, R>;
declare const send: Attempt<[{ id: number }], void>;

const perAttempt = withRetry(withTimeout(send, 2000), 3); // accepted
const reversed = withTimeout(withRetry(send, 3), 2000);   // TS2345
```

At the second composition, TS7 reports:

> Argument of type 'Job<[{ id: number; }], void>' is not assignable to parameter
> of type 'Attempt<[], void>'.

(The actual probe uses the alias `Request`, so its full diagnostic names
`Job<[Request], void>` and explains that `AbortSignal` lacks `id`.)

This is understandable: retry has already hidden the signal argument. But:

- **The accepted order is the incident's original order.** The old implementation
  was unsafe because the timed-out send kept running, not because per-attempt
  timeouts are intrinsically wrong. Don't retroactively call that order invalid.
- If the operation has no ordinary arguments, the reversed composition compiles.
  A function taking no arguments can be used where a signal-taking function is
  expected. So can an ordinary uncancellable zero-argument function.
- `(_signal, request) => job(request)` also fits `Attempt` and restores the
  reversed composition. Its body may completely ignore the signal.
- If **both** wrappers consume the signal and return ordinary jobs, even the
  desired `retry(timeout(send))` fails. Passing controllers around has to have an
  ownership story before its type can be a repair.

These are ordinary function-assignability rules, not exotic bypasses. TypeScript
explicitly allows a function to ignore extra parameters; see the official
[function compatibility explanation](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#comparing-two-functions).

**Disposition:** usable as a limited illustration, not an order-safety guarantee.
I would not spend a separate scene proving and qualifying this particular error.

### B. Prefer timeout-owned signals; acknowledge both orders remain typable

```typescript
declare function withTimeout<A extends unknown[], R>(
  f: (signal: AbortSignal, ...args: A) => Promise<R>, ms: number,
): (...args: A) => Promise<R>;

declare function withRetry<A extends unknown[], R>(
  f: (...args: A) => Promise<R>, attempts: number,
): (...args: A) => Promise<R>;
```

`retry(timeout(send))` calls timeout afresh each attempt, and timeout creates a
fresh controller. The retry loop does not need to manufacture signals it cannot
itself decide when to abort. With a cooperative sender, my implementation starts
three attempts, aborts all three, and makes **zero deliveries**. No controller is
reused.

`timeout(retry(send))` also compiles: retry retains the signal in its argument
list, so timeout can supply one around the whole operation. These types accurately
admit two meanings. Names such as `sendWithAttemptTimeout` and a test establish
which meaning this team chose; a type error need not manufacture that choice.
The old `(request: { id: number }) => Promise<void>` client is rejected at
`withTimeout` with TS2345, because it cannot take the supplied signal in that
position. Do not upgrade that fact to proof that the accepted client uses it.

Show the concrete sender signature before the generic tuple if that reduces the
reading load. No conditional types, brands or generic composition helper needed.
A brand assigned by an owner would record an assertion about behavior; constructing
one would not establish the behavior. It is unnecessary here.

### C. Type-preserving wrappers do not claim behavioral equivalence

The plan says `(...args: A) => R` to the same signature says “same function.” It
says the caller can supply those arguments and use that result type. It says
nothing about invocation count, remote effects, latency, or whether rejection
means no work happened. Give Idan a real desire to expose the signal input, without
making her claim TypeScript has proved cancellation. Let Eli distinguish these
claims briefly.

## 2. The original incident and an important limit to swapping

For the three-second *successful* sender, both original results reproduce exactly:

| Composition | Starts | Delivery times | Caller outcome |
|---|---:|---|---|
| retry(timeout(send, 2s), 3) | 3 | 3s, 5s, 7s | timeout at 6s |
| timeout(retry(send, 3), 2s) | 1 | 3s | timeout at 2s |

The first call reports failure **before the third delivery**. Distinguish the
caller's completion from the eventual delivery count; don't stop the fixture at
the caller's rejection. Both shapes compile and are mutually assignable. Both
also pass a fast fixture which rejects immediately once and then succeeds.

**Extra counterexample:** make each attempt deliver at 3s and then reject with a
lost-reply error. In the swapped order, the caller times out at 2s, but the retry
loop goes on starting sends at 3s and 6s. All three deliver by 9s. The outer race
stopped the caller waiting; it did not stop the retry loop either.

Keep Oded's swap as a working reduction for the original slow-success case. Give
it that win. Then make its limit explicit, with either this short trace or the
later cancellation scene. Don't say it fixes duplicates generally. Also don't
fault him for choosing per-attempt rather than total timeouts: state the job's
actual requirement before ruling on it.

**Setup contract needed before failures:** `send`'s fulfilled promise confirms
acceptance, while rejection or a missing reply need not establish non-acceptance.
The job currently labels a rejected wrapper call “failed.” That label is its
interpretation, not proof of no delivery. Establish the request, a working send,
why the job retries, and which wait budget it needs before the nested expression.

## 3. The Turn is still about HOFs, with strict limits

Keep “abort cannot recall an accepted message.” Its point is the requirement
`withRetry` places on **the function it receives**, not a new inbound schema or
handoff type. Ch16's dedupe point is one Additional Take; its main argument is
parsing and projecting unfamiliar data. This chapter can apply that requirement
to repeated outbound invocation without rerunning Ch16.

The controlled counterexample is strong:

| Sender behavior under the signal-aware retry/timeout repair | Starts | Deliveries | Caller |
|---|---:|---:|---|
| Cooperates before doing the work; work/reply due at 3s | 3 | 0 | timeout at 6s |
| Ignores signal | 3 | 3 | timeout at 6s |
| Accepts at 1s, acknowledges at 3s; abort stops local waiting | 3 | 3 | timeout at 6s |
| Same early acceptance, stable owner-provided key; repeat returns stored receipt after 0.1s | 2 | 1 | success at 2.1s |

The first three get fresh signals. In the third, they are obeyed: the response
wait is cancelled. Yet acceptance already happened. This is stronger than an
uncooperative function as the Turn; the latter would only show an implementation
ignoring its input.

**Fairness constraint:** don't silently change the gateway contract after the
signal repair. The initial fake couples delivery and resolution at 3s. The Turn
splits acceptance from acknowledgement, as the already-stated gateway contract
allows. Guy owns that contract and should be the one to demand this fixture,
not agree that abort guarantees no duplicates and then discover his own API.
Idan's repair establishes a cancellation path; it never establishes repeatability.

The key/receipt behavior above is a **fictional gateway contract**, not a vendor
claim or a recipe for implementing distributed deduplication. State its relevant
scope (same logical message, same request, same key through every attempt) in one
line. Do not generate a fresh key inside retry. Do not print the gateway's storage
implementation. My fixture models it only to prove the claimed local result.

The strongest cheap alternative must also be heard: **don't retry an ambiguous
send**. If this gateway offers no repeat-safe operation, that's the ruling; no
wrapper or brand can supply one. If the owner provides the specified keyed send,
that makes the retry meaningful. The owner must also decide which failures merit
another attempt, instead of claiming all thrown programming errors are transient.
Keep this to a local rule/choice rather than a generic policy API.

A new Turn isn't needed. If the delivery contract consumes too much page space,
the late-rejection trace in §2 is the smaller fallback: the outer timeout hides
an entire still-running retry loop. I prefer the accepted-before-acknowledgement
Turn because it limits the strongest working cancellation repair.

## 4. Guy's strongest answer and the mechanism budget

Give Guy the existing sender instance, before anyone extracts its method. His
object decorator can retain it and call `inner.send(request)`. A retrying sender
can implement the client's public interface, and a timeout sender can wrap it.
Those objects still compose in an order. They are not automatically safer about
repetition, but they preserve the receiver and present the interface existing
callers already use.

Oded's equally real repair is `request => client.send(request)` or a bound method.
Both work in the probe. Don't force the room to migrate an existing client to a
new class just to regain its receiver, or make Guy miss that one-line option.
The local Verdict can keep the client and use a bound operation in the named
function composition. Its reason is the existing job's function-valued callback,
which must be established early. If that callback doesn't really exist, Guy's
object composition is a reasonable local choice; don't invent its inconvenience.

Receiver findings beyond the original plan:

- The original generic retry loses `this`, including an explicit `this: Sender`.
- Requiring `this: void` rejects the **explicit** receiver, but still accepts an
  ordinary method that uses `this` without annotating it. That is not a universal
  method detector.
- A wrapper returning `function (this: This, ...args) { return f.apply(this,args); }`
  preserves an explicitly declared receiver; its detached call then fails with
  TS2684. Useful scratch evidence, probably too much for the main scene.

**Print one implementation family, not every verified mechanism.** My budget:
retry + timeout and their two orders; the signal-taking timeout; one brief bound
method/object comparison; the Turn. At most one Take about overload loss, paired
with the fact that the simple generic identity survives. Put the overload in a
real public client example if retained, not a new toy `convert` debate. The reader
already saw last-overload extraction in Ch10, so this is a reminder about wrapper
claims, not a fresh revelation.

Drop the `once` example from the page, `name`/`length` trivia, and a full standard
method-decorator tutorial. I verified them, but they are not obligations to print.
Also omit the generic `pipe`/`compose` utility and the extra logging wrapper unless
an actual scene needs them. Nesting two named wrappers already teaches composition.
One combined-wrapper suggestion may survive as an acknowledged implementation
option, without opening Ch22's policy-objects argument. No curried wrapper calls.

If standard decorators are mentioned, qualify the receiver statement: a decorator
which calls the original with `apply` preserves the receiver **on method calls**.
Decoration itself does not bind extraction. A separate binding decorator can do
that. The official [TypeScript 5.0 decorator explanation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)
shows receiver forwarding, binding and reverse application order; the
[legacy-decorator distinction](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#differences-with-experimental-legacy-decorators)
explains the flag difference. These primary sources were checked on 2026-10-25;
the book-profile compiler/emit results below are the current local evidence.
No lint rule or third-party library recommendation is needed.

## 5. Principle and cast

**Keep Gilad**, because the decision concerns an operation that continues or repeats
after its caller thinks it is over. Liron could explain the pattern, but adding him
would give a five-person chapter a third expert. Eli gets one precise intervention
on what a signature does and does not check; professionals should inspect and repair
the actual wrappers.

Candidate direction for settlement, not manuscript drafting:

> A higher-order function takes a function or returns one. A wrapper can keep the
> same arguments and result type while changing when the function runs and how
> often. Before passing an operation to one, check what the wrapper may skip,
> repeat or leave running, and whether that operation allows it. If a wrapper
> needs a cancellation signal, put that input in its type; then check that the
> operation uses it. A timeout stops waiting unless the underlying work is also
> stopped. A retry needs the operation's owner to establish that repeating it is
> safe. Follow stacked wrappers from the outside call to the operation and back
> through failures. Check receiver and public signatures too: a wrapper that
> preserves one call signature need not preserve overloads.

Tighten the final wording during drafting; don't turn this into a production
checklist. The actionable core is **inspect invocation behavior, match it to the
operation's requirements, then test that composition**. Never say types prove
“the same function” or that cancellation is guaranteed by an `AbortSignal` input.

Principle-reader expectations:

- Unknown `chargeCard`: obtain a repeatability contract; don't wrap blindly.
- Two timeouts: per attempt vs outer wait; look for an actual stop mechanism and
  the possibility of retries continuing after the caller stopped waiting.
- Overloaded parser: inspect the resulting signatures; preserve its public
  overloads explicitly or wrap the individual operation the caller needs. Don't
  assume an assertion to the old function type establishes forwarding correctness.
- Debounced method: delayed/coalesced invocations and a receiver obligation; decide
  whether dropping intermediate saves is allowed and retain the instance.

Character ownership:

- **Oded:** defends small wrappers, demonstrates the named composition and the
  passing fast fixtures, proposes the cheap swap or no-retry fallback. He has
  sound code and incomplete operational assumptions, not invented incompetence.
- **Guy:** owns the client, its receiver, and the gateway acceptance contract.
  Supplies the strongest existing-class alternative and the Turn's real boundary.
- **Idan:** makes the signal input explicit, wants a function that actually
  performs the required work, then distinguishes that from merely labelling a
  function as safe. Do not make her become Noam with a phantom-brand insistence.
- **Gilad:** the job's reported outcome versus deliveries and the initial rule.
- **Eli:** the narrow compiler correction; no second Principle lecture.

## 6. Local Verdict the evidence can earn

1. Keep one named sender composition where the job gets its callback. Say whether
   its timeout applies per attempt or to the whole wait; do not mix those meanings.
2. Timeout owns a controller for each invocation and exposes the signal to the
   operation. Observe cancellation and clean up listeners/timers. The receiver
   stays attached through the existing client or an explicit bound adapter.
3. Retry only the owner's repeat-safe operation, with its logical request identity
   stable. If that operation does not exist, disable retries for ambiguous sends.
   Reporting “timed out” must not be presented as proof that nothing was accepted.
4. Keep the slow-success, late-rejection and accepted-before-acknowledgement cases
   alongside the old fast fixtures. Types check the call shape; these fixtures
   exercise the behavior the team chose.

This is a local decision with stated preconditions, not The Debate Continues.
Ch22's debt remains where the plan put it. No options-versus-functions comparison,
curried API, memoizer, effect system, inbound projection or idempotency framework.

## 7. Reproduction record — all seven mechanisms

`npm ci --offline`: exit 0. `node .probe/codex/probe.cjs`: exit 0.
**TypeScript 7.0.2 / Node v22.23.3; 16 compiler cases / 14 runtime groups.**
The runner uses `checks/compiler.cjs` without profile overrides except output
paths: strict, exact optional properties, ES2022, Node16 module/resolution,
`types: []`, skipLibCheck, noEmitOnError. Negative compiler cases assert codes;
their full diagnostics, including locations, are saved per case.

All timers in behavioral probes are manual-clock events. Each event drains the
promise microtasks before advancing again, and the fixture continues past caller
rejection to the last possible delivery. The harness uses a bounded 100-turn
microtask drain, well above these fixed chains; it is not a general event-loop
simulator. There are no wall-clock sleeps or production timing claims.

| Plan mechanism | Reproduced evidence |
|---|---|
| 1. Order / same type | Both orders mutually assignable. 3 starts/3 completions vs 1/1; timeout at 6s vs 2s. Fast fixture passes both. Late-rejection counterexample adds 3 deliveries after swapped outer timeout. |
| 2. Overload loss | `wrap(convert)(1)` TS2345: number is not assignable to string. |
| 3. Generic preservation | Wrapped identity and async retry each work at both number/string, and assign to explicitly generic function types. |
| 4. Receiver loss | Both implicit and explicit `this` methods accepted by retry, fail at runtime. Exact first message: `Cannot read properties of undefined (reading 'sent')`. Bound function, arrow adapter and object decorator succeed. |
| 5. once/retry | Retry outside once: 1 underlying call and `refused`. Once outside retry: 2 underlying calls, `conn`, no new call on reuse. |
| 6. name/length | This particular direct-return rest-arrow wrapper has empty name and length 0, compared with original `named`/2. Not a claim about every arrow wrapper; inferred names depend on how it is written. |
| 7. Decorators | `ClassMethodDecoratorContext` implementation compiles without legacy flag; emitted JS contains `__esDecorate`. Method call works; extracted function fails. Two labels apply inner then outer, while invocation enters outer then inner then body. |

Additional compiler probes cover good/reversed signal orders, both-consume failure,
zero-argument and ignored-signal acceptance, adapter acceptance, the simpler
signal-owning timeout, and both strongest receiver-type alternatives. Runtime
probes cover cooperative/ignored/accepted/deduplicated signal behavior, distinct
attempt signals, timeout-owned signals, and an already-aborted parent starting no
work. Retry counts are positive fixture parameters; general backoff, shutdown,
full-job cancellation and error classification are not implemented as a library.

The probes, generated configs/emit, install log and `results.log` stay under
`.probe/codex/` and are not committed. No manuscript, plan, production check suite,
coordination state or task-state file was changed. This is the challenge handoff;
**wait for plan settlement before drafting.**

Probe provenance (SHA-256):

- `.probe/codex/probe.cjs`: `8782b0b2139537aba9f90870ac73493123d1e1fb375d1ec263561f8f823a1f0a`
- `.probe/codex/results.log`: `d39d7d5cfb3fac35d1d6b4af12de9999c921eae9c4a435bb5adfa92fe3af8bda`
