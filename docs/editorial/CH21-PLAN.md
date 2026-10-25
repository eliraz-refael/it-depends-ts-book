# Chapter 21 — Higher-Order Function Patterns (working title)

Status: **PLAN SETTLED**, 2026-10-25. The settlement at the end governs the original proposal.
Branch: `codex/chapter-21-hof-patterns`, based on `origin/main` `bd3966e`.
File: `book/03-patterns-and-design/08-hof-patterns.md`.

## The ending: a local Verdict

Act III's open-ending debt belongs to Ch22 (configuration to function), as Ch20's
[ending decision](CH20-PLAN.md#ending-decision-after-the-bounded-round-2026-10-23) records. Ch21
doesn't try for it, and mustn't stage a split to cover it. The room should reach a local ruling the
scenes earn. If Codex's challenge finds that this chapter's decision is more honestly open than
Ch22's is likely to be, say so with evidence and we'll talk; otherwise plan for a Verdict.

## What earlier chapters already settle (do not repeat)

- **Ch14:** exceptions vs returned errors. A wrapper may catch and rethrow; don't re-argue error
  representation.
- **Ch16:** inbound retries, acknowledgements and deduplicating redelivered webhooks. If the
  outbound side needs an idempotency key, it gets one line, not Ch16's argument.
- **Ch18:** `memoizeBy`, purity, hidden inputs and caching. No memoizer on the page.
- **Ch19:** loops vs pipelines.
- **Ch20:** argument shape, staged factories (`priceWith`), `map` passing the index, and `curry2` /
  `bind`. Its early-fixing Take used TS2353; overload loss through a wrapper was **not** used, so
  it's free here. Don't curry the wrappers (`withRetry(3)(send)`) unless Codex shows the chapter
  needs it, and then without re-arguing currying.

**Ch21 owns** what Ch19 and Ch20 deferred to it: wrappers that take a function and return one
(retry, timeout, logging), the order in which they're stacked, and `compose`/`pipe` if the scenes
need them.

**Later chapters to stay clear of:**
- **Ch22, configuration to function:** no debate between a policy object (`withPolicy({ attempts,
  timeout })`) and composed functions as the API. That is Ch22's decision, and it carries the open
  ending. If a combined wrapper appears, it's one exchange and nobody argues options-vs-functions.
  No dependency injection through closures.
- **Ch23, monads light:** no `Task`/`Effect`/`Either` types and no fp libraries. No claims about any
  library's API unless Codex verifies a primary source, and then one line at most.
- **Part IV, performance:** no timing claims. Durations here are fixture parameters (a 2-second
  budget, a 3-second send) run on a manual clock; counts are fine.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

My probes are in the session scratchpad (untracked). Codex reproduces them in `.probe/`, untracked.

1. **Stacking order changes behaviour, and both orders have the same type.**
   - `withRetry(f, attempts)` awaits `f` up to `attempts` times. `withTimeout(f, ms)` races `f`
     against a rejecting timer. Neither cancels anything.
   - With a `send` that always takes 3 s, on a manual clock:
     - `withRetry(withTimeout(send, 2000), 3)` starts **3** sends, all **3** finish, and the caller
       gets `Error: timeout`;
     - `withTimeout(withRetry(send, 3), 2000)` starts **1** send, it finishes, and the caller gets
       `Error: timeout`.
   - For `declare const send: (r: { id: number }) => Promise<void>`, the two compositions are
     mutually assignable: `const x: typeof a = b` and `const y: typeof b = a` both compile.
   - **The incident is here:** the caller is told the message failed, and the recipient has three.
2. **A wrapper that keeps the signature on paper drops overloads.** For
   `wrap = <A extends unknown[], R>(f: (...args: A) => R): ((...args: A) => R) => …` and
   `convert(x: number): string; convert(x: string): number`, `wrap(convert)` is
   `(x: string) => number`. `wc(1)` fails with `TS2345: Argument of type 'number' is not assignable
   to parameter of type 'string'.`
3. **It keeps a generic function generic.** `wrap(identity)` is `<T>(x: T) => T`, and
   `withRetry(gen, 3)` for `gen = async <T>(x: T): Promise<T>` stays generic too, with the extra
   `attempts` argument.
4. **It drops `this`, and the compiler accepts that even with a `this` parameter.**
   - `withRetry(sender.send, 3)` compiles for `class Sender { async send(to: string) { this.sent++ } }`.
   - It still compiles when `send` declares `this: Sender`. The wrapped type is
     `(to: string) => Promise<void>`, with no `this`.
   - At runtime: `TypeError: Cannot read properties of undefined (reading 'sent')`.
5. **`once` and `withRetry` in two orders.** For a `connect` that fails on its first call:
   - `withRetry(once(connect), 3)` calls `connect` **once** and rethrows `refused`. Every retry gets
     the same rejected promise.
   - `once(withRetry(connect, 3))` calls it **twice**, returns `"conn"`, and a second call to the
     wrapper doesn't call `connect` again.
   - A second order case without time, if the chapter needs one. Optional.
6. **The returned function forgets the original's `name` and `length`.** An arrow wrapper has
   `length` 0 and `name` `""`. Ch20 cut the stack-frame version; at most a line here.
7. **Standard decorators compile and run on the book profile.** A `ClassMethodDecoratorContext`
   method decorator (`@logged send(…)`) compiles under `--target ES2022` with no
   `experimentalDecorators` flag, runs, and keeps `this`. The decorated method passed as a value
   (`const f = new Sender().send`) still compiles and still loses `this`. Codex should confirm the
   emitted output before any claim about it.

## Candidate decision and scenario

Codex may replace this. It must stay one running case with a decision the room can settle.

**A notification service sends order messages through a fictional gateway.** The team has a small
shared module of wrappers, `withRetry`, `withTimeout` and `withLogging`, each typed to return the
same parameters and result. Oded built the module, quickly and competently, and composed
`sendShipped`: retry on the outside, a 2-second timeout per attempt.

**The incident (mechanism 1):**
- The gateway slows to 3 s.
- Every attempt times out, so the job records "failed".
- Each attempt keeps running, so the customer gets three identical texts.
- The fixtures only had fast sends and immediate failures. The composition was correct for both.

**The question the chapter answers:** what should a shared wrapper promise, and how much of that
belongs in its type? A wrapper typed `(...args: A) => R` → `(...args: A) => R` says "same function".
It runs the function a different number of times, stops waiting at a different moment, and drops
`this` and every overload but the last.

**Repairs, each in its strongest form:**
- **Swap the order and name the composition.** `withTimeout(withRetry(send, 3), 2000)` stops the
  duplicates in this fixture. The cost: no per-attempt budget, and the slow send still completes
  after the caller recorded a failure. Writing the composition once, in a named function, fixes
  where order lives, not what it means.
- **Make the type change when the contract changes.** For example, `withTimeout` accepts only a
  function that takes an `AbortSignal` and aborts it, and `withRetry` hands each attempt a fresh
  signal. Then a wrong stack may stop compiling. Codex tests whether some typing makes the
  incident's order a compile error, without a type-level puzzle the reader can't follow. **This is
  probably the chapter's centre.** I want Codex's evidence before I commit to it.
- **Guy's alternative: decorator objects or method decorators.** A `RetryingSender implements Sender`
  that wraps another `Sender` (the GoF Decorator) keeps `this` and makes construction order explicit
  in one place. Standard `@retry` decorators (mechanism 7) keep `this` too. Their strongest case is
  a class the team already has. Both still stack in an order, and a stacked method decorator applies
  from the bottom up, so the order question remains. Give it a fair hearing and a local reason.
- **One combined wrapper,** `withAttempts({ count, perAttempt, total })`. Allowed only as a single
  exchange, without the options-vs-functions debate (Ch22).

**A possible Turn, which Codex may replace:**
- The room fixes the order and adds cancellation, and believes duplicates are solved.
- Then someone shows that aborting a request doesn't recall a message the gateway already accepted.
  No order or signal makes a retry safe if the operation isn't safe to repeat. Only the wrapped
  function's owner can say whether it is.
- So `withRetry` needs a promise from the function it wraps, an idempotency key or a marker the type
  can check, and the shared module can't supply it.
- **The risk:** this drifts into delivery semantics, which is Ch16's ground. Codex should say
  whether it stays a HOF chapter. A Turn on the type side is an alternative, for example the
  type-changing repair catching a second, already-shipped composition. Whatever the Turn is, it must
  change what the room thinks, not decorate it.

**Likely Verdict shape (not wording):**
- wrappers that change how often or how long a function runs say so in their types where the module
  can make them;
- the module writes the shared compositions once, by name;
- `withRetry` accepts only functions whose owners state they're safe to repeat;
- methods are wrapped bound, or as decorator objects where a class already exists.

The scenes have to earn it.

## Principle (must be stated, in an expert's words, before the scenario)

**Gilad Stacktrace**, who has set one Act III Principle (Ch16). Act III's have been Liron (Ch14,
Ch17), Eli (Ch15, Ch18), Gilad (Ch16), Sahar (Ch19) and Daniel (Ch20). He's right for a chapter whose
failures show up only in production: wrapped calls that ran three times, or ran on after the caller
gave up. Codex may argue for Liron, whose domain this is, if the chapter turns more on design than
on failure.

**Its direction, not its wording:**
- A wrapper returns a function with the same parameters and a different contract.
- Before you wrap, state what changes: how many times the function runs, when the caller stops
  waiting, what still happens after that, and what the wrapper drops (`this`, overloads).
- When a change matters to callers, let the type change too, so a wrong function or a wrong order
  doesn't compile.
- When you stack wrappers, the order is part of the behaviour.

**It must give a test, not a mood.** The Ch18–20 readers stalled on undefined terms ("work only the
module can do", "prepared value"). Every condition must be checkable from the Principle alone.

**Principle-only reader cases:**
- **(a)** `withRetry(chargeCard, 3)` with a `chargeCard` the reader can't see inside. What should they
  check, and what would they change?
- **(b)** `withRetry(withTimeout(f, 2000), 3)` and `withTimeout(withRetry(f, 3), 2000)`. Which one
  means "each attempt gets 2 s", which means "the caller waits at most 2 s", and what keeps running?
- **(c)** A generic `withLogging` around an overloaded `parse(x: string): Ast;
  parse(x: Buffer): Ast[]`. What do callers lose, and what would they do?
- **(d) Transfer:** a `debounce` around `editor.save`, a method. What changes, and what might break?
  The chapter needn't show it.

## Cast

- **Gilad Stacktrace** (he): the Principle, and the incident's evidence. He's the one who reads the
  delivered count against the "failed" record.
- **Oded Shipley** (he): built the wrapper module and the composition, competently. He defends small
  generic wrappers and doesn't become the fool.
- **Guy Singleton** (he): owns the existing client class, and argues for decorator objects or method
  decorators. Last seen in Ch17.
- **Idan Greenfield** (she): "Prove it by producing it". She argues that a wrapper should *produce*
  the type that shows what it did, which is the type-changing repair. Her only Act III appearance
  is Ch16.
- **Prof. Eli Typeworth** (he) or **Daniel Compiler** (he): what `(...args: A) => R` claims, and the
  overload and `this` evidence. Pick one. Daniel has just set Ch20's Principle; Eli is preferred.
- **Optional:** Liron Closure (he), a line naming the pattern; Dafna Functor (she), one line at most.

**Rested:**
- **Dafna:** Ch14, 17, 18 and 19.
- **Eden:** Ch15–18.
- **Gil:** Ch14, 17, 19 and 20.
- **Chen:** two of the last three.
- **Noam, Linoy and Dima:** all just in Ch20.

Five or six people. Check every pronoun against the bios. Idan is she.

## Voice and constraints

- Calibrate on Ch7.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines.
- Oded's composition is competent: it was right for every case the fixtures had.
- One running scenario, small integers, a manual clock in the checks, and every fence checked.
- No timing or performance claims; counts are fine.
- No vendor or gateway claims. The gateway is fictional, and its contract (whether it deduplicates
  by key, whether an abort recalls a message) is stated on the page.
- Length: 2,300–3,200 words.

## Validation plan

`checks/chapter21.cjs`: compile every TS fence on the book profile, with competing shapes as
separate programs.

Runtime groups, on a manual clock with no real timers:
- the incident: sends started and finished, and the caller's outcome, in both orders;
- each repair against the same slow gateway, plus the fast and fail-fast fixtures that hid the
  incident;
- the `this` loss and its repair, if used;
- the Turn's evidence, asserting only what the text claims.

Compiler cases:
- every intentional diagnostic the text quotes, verbatim;
- the mutual assignability of the two orders;
- the overload loss and the preserved generic, if claimed;
- whatever the type-changing repair makes fail, at the location the text names.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers:** an isolated Principle-only reader with the four cases above, and a fresh full reader.
Afterwards a targeted recheck, if a second draft needs one.

## Completion

- [x] Codex challenges this plan; disagreements are settled on evidence.
- [x] Codex drafts and self-reviews; [draft-1 record](CH21-REVIEW.md).
- [ ] Claude's formal review: Principle-only and fresh full readers, then a final diff review.
- [x] Checks durable; full suite green on draft 1.
- [ ] Ready for the author's review.

## Settlement after Codex's challenge (2026-10-25)

Codex's [challenge](ch21/CODEX-PLAN-CHALLENGE.md) is accepted, with the budget decisions below. Where
this section conflicts with the proposal above, this section governs. Codex reproduced all seven
mechanisms (16 compiler cases / 14 manual-clock runtime groups).

**1. The centre: a timeout that owns a fresh signal per call, not order safety by type.**
- **No claim that types make the incident's order a compile error.** A retry-owned signal rejects the
  reversed order but accepts the incident's own order. Zero-argument functions and an adapter that
  ignores its signal pass anyway. Both orders can be legitimate.
- **The repair is §1B.** `withTimeout` takes `(signal, ...args) => Promise<R>`, creates a controller on
  each call and returns `(...args) => Promise<R>`. `withRetry` stays generic and repeats that call.
- **The type's real win:** the old client, which can't take a signal, is rejected at `withTimeout`
  (TS2345). That shows the input is now required, not that the operation uses it. The text says
  both halves.
- Show the concrete sender signature before the generic tuple. No brands, conditional types or
  composition helper.

**2. The incident, with its setup first.**
- **Before the nested expression, the page shows:**
  - the request;
  - a working send;
  - the gateway contract: a fulfilled promise confirms acceptance, and a rejection or missing reply
    doesn't prove non-acceptance;
  - why the job retries, and which wait it needs.
- **The fixture runs past the caller's rejection** to the last delivery, using Codex's table: 3
  starts, delivered at 3/5/7 s, the caller timing out at 6 s; against 1 start, delivered at 3 s, the
  caller timing out at 2 s. The fast fixtures pass both orders.
- **Oded's swap gets its win** for the slow-success case. Its limit is stated: the job still writes
  "failed" for a message that was delivered.
- **The late-rejection trace (3 deliveries by 9 s after a 2 s caller timeout) is a fallback, not a
  second scene.** Use it only if the Turn can't carry "an outer timeout doesn't stop the retry loop",
  and then in one exchange.
- **Don't fault per-attempt timeouts.** State the job's actual requirement before ruling.

**3. The Turn: an abort can't recall an accepted message.**
- **The wait is cancelled, but the message was already accepted.** The fresh signals are honoured:
  accepted at 1 s, acknowledged at 3 s, 3 deliveries.
- **Guy owns the client and the gateway contract,** and he demands this fixture. He doesn't discover
  his own API.
- **The repair:** an owner-provided stable key with the fictional gateway's stored receipt. That gives
  2 starts, 1 delivery, and success at 2.1 s.
- **Its scope gets one line:** same logical message, same key through every attempt, and the key is
  never generated inside retry. No storage implementation, no dedupe framework, no Ch16 rerun.
- **"Don't retry an ambiguous send" is heard in full.** If no repeat-safe operation exists, that's the
  ruling.
- **The owner decides which failures merit another attempt.** That's one line, with no error taxonomy
  (Ch14).

**4. Budget, within 2,300–3,200 words.** Print one implementation family:
- retry and timeout in two orders;
- the signal-owning timeout;
- one short bound-adapter vs object-decorator exchange. Oded's `request => client.send(request)` is
  heard, and the job's function-valued callback is established early as its local reason;
- the Turn;
- at most one Take on overload loss in a real client signature, paired with "a generic function
  stays generic". It is a reminder of Ch10, not a revelation.

**Cut from the page:** `once`, `name`/`length`, a decorator tutorial, `pipe`/`compose`, the logging
wrapper and curried wrappers. If decorators are mentioned, a decorator that forwards with `apply`
keeps the receiver on method calls; decorating doesn't bind extraction.

**5. Principle: Gilad, tightened.** Codex's candidate is the direction, but nine sentences is a
checklist. The Ch18–20 readers stalled on undefined terms. Two short paragraphs, and every check
testable from the Principle alone:
- what a higher-order function is, in one clause;
- the same arguments and result type can hide a change in when and how often the function runs;
- check what the wrapper may skip, repeat or leave running, and whether the operation allows it;
- a timeout stops the waiting, not the work, unless the operation takes the signal and uses it;
- a retry needs the operation's owner to say repeating it is safe;
- with stacked wrappers, trace from the outside call in, and back out through failures;
- the receiver and overloads are part of the signature the wrapper may not keep.

Never say types prove "the same function", or that an `AbortSignal` input guarantees cancellation.
The reader cases and expectations are Codex's §5.

**6. Cast: five people.** Gilad (the Principle; outcome vs deliveries), Oded (small wrappers, the named
composition, the swap and the no-retry fallback), Guy (the client, its receiver, the gateway
contract), Idan (makes the signal input explicit, then separates performing the work from labelling
a function safe; no phantom brand) and Eli (one narrow correction on what a signature checks). No
sixth speaker.

**7. Verdict: Codex's §6, locally.**
1. One named sender composition where the job gets its callback, saying whether its timeout applies
   per attempt or to the whole wait.
2. Timeout owns a controller per call and exposes the signal. The receiver stays attached.
3. Retry only the owner's repeat-safe operation, with a stable request identity. Otherwise no
   retries for ambiguous sends, and "timed out" is never reported as "not accepted".
4. The slow-success and accepted-before-acknowledgement fixtures stay beside the old fast ones.

Ch22's open-ending debt is untouched.

**8. Validation additions:**
- the delivery times and caller outcomes exactly as printed, past the caller's rejection;
- the TS2345 of the old client at `withTimeout`, at the location the text names;
- the keyed-receipt fixture's 2 starts, 1 delivery and 2.1 s;
- every count the text states.

**Readers:** a Principle-only reader with the four cases, and a fresh full reader.

**Next:** Codex drafts on this branch and self-reviews in `CH21-REVIEW.md`. It then freezes
`ch21/DRAFT1-SNAPSHOT.json`, runs `npm ci --offline` and the full `npm run check`, commits locally
and hands off.

## Draft 1 handoff

**The Message Kept Going**, 2,320 words, 11 TypeScript fences. The draft follows the
settlement: timeout-owned signals, the old-client TS2345 with a narrow claim,
Oded's swap and no-retry alternatives, the bound client/object comparison, and
Guy's early-acceptance fixture. One owner-keyed operation repairs repeatability;
no new policy framework. The one Take checks client overloads and generic forwarding.

[Self-review](CH21-REVIEW.md) and [snapshot](ch21/DRAFT1-SNAPSHOT.json) record scope,
exact hashes and validation. Offline install and full book check exit 0: Ch21
11/16/17; book 372/494/212, plus two defaults and two searches. Independent
Principle-only/full readers and Claude's formal review are pending. Local Verdict;
Ch22's open-ending debt unchanged.
