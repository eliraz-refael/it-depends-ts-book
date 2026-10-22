# Chapter 18: Codex plan challenge

2026-10-22. Plan reviewed at `9a731ee`, based on main `c154239`.
**Disposition: accept the support-desk case and the time-zone Turn; revise the
incident contract and the comparison of repairs before drafting.** No manuscript
drafted. The ending remains open to the evidence, not to Act III's quota.

I read the writing/review guides, voice notes, bios, master plan, all four existing
Act III chapters and Chapter 7. `npm ci --offline` exited 0. Independent probes
use **TypeScript 7.0.2**, **Node v22.23.3**, and `checks/compiler.cjs` with its
unchanged book profile. Scratch files are untracked:

- `.probe/codex/domain.ts`: mechanisms and competing repairs.
- `.probe/codex/run.cjs`: compile/runtime assertions; run with
  `node .probe/codex/run.cjs`.
- `.probe/codex/RESULTS.json`: **4 compiler cases / 10 runtime groups, PASS**.

These are discovery probes, not manuscript coverage. No whole-book check is
claimed or needed for a plan-only change. The full suite belongs to the draft.

## 1. Principle: retain the test, narrow its absolute wording

The practical test is right: what would change if a caller reused an earlier
answer instead of running the operation? It catches the clock, missing logs and
host time zone before any of the story is supplied. Eli is the right person to
state it. The current version is too absolute in two places:

- “Nothing in the program could tell” includes object identity, allocation,
  timing and the very computation counter the chapter uses. A fresh record and
  a shared cached record can be distinguished with `===`. We should not imply
  every object-returning calculation is therefore excluded, nor imply purity
  alone licenses every possible memoization scheme.
- “What the function reads that its caller didn't pass” is an audit prompt, not
  a definition. A fixed constant or immutable captured policy is fine. Passing
  a changing `Clock` object as an argument doesn't make its current reading a
  fixed input value. Calling a logger passed as an argument still has an effect.

Suggested direction for Eli, to be phrased for the manuscript:

> A pure calculation gives the same result for the same unchanged input values,
> without doing work that another part of the program must observe beyond that
> result. Before reusing an answer, ask what can change the answer without a
> change to those inputs, and what required work would disappear if the call
> did not run. Make those dependencies and effects explicit at the boundary
> that owns them. An ordinary TypeScript function signature doesn't prove purity.

This distinguishes **purity**, **a valid cache key**, and **an acceptable
approximation**. A TTL may be an acceptable cache policy without making the
function pure or preserving its exact answer at every instant. Putting `now`
in the key fixes neither skipped logging nor an omitted policy input.

Use a primitive status/deadline for the first replacement demonstration. Once
Gilad asks for an evidence record, compare its fields; don't teach an allocation
identity model or brand it immutable by signature. Keep retries/reordering out
of the opening list unless the scene will examine them. One principle, two
questions, not a list of four other chapters.

## 2. The incident needs a consistent timeline and an owner for the log

**Necessary before drafting.** The proposed same ticket cannot both be cached
as `ok` on its first call and emit an `at-risk` line on that call. My probes show:

- Cached first while `ok`: stays `ok` into the at-risk and breached periods;
  **zero** at-risk lines.
- Cached first while `at-risk`: three invocations produce **one** line; the
  uncached equivalent produces three. The stale returned status is `at-risk`.

Either use a second ticket in the same list, or keep the single initially-ok
ticket and say its at-risk line never appears. Prefer the latter for economy.
State the threshold before testing it. A workable example is a four-hour P1
opened Monday at 09:00 team time, due 13:00, with at-risk beginning 30 elapsed
minutes before the deadline. At 12:20 it is `ok`, at 12:40 `at-risk`, and at
13:00 `breached`. Keep that same rule for every repair.

**The alert rule is presently underspecified.** Does it need every observation,
one notification on entering risk, or a recent heartbeat? Fewer log lines do not
by themselves establish a broken alert. A log once per at-risk minute may be
correct, excessive, or insufficient depending on that contract. Gilad must
answer using a requirement established before the competing fixes are judged.

There is also an independent escalation job among the four callers. If only the
dashboard is memoized, why does that job fail to escalate? Don't invent an outage
in the unaffected caller to make the dashboard bug consequential. My preferred
minimal revision: the dashboard is wrong when the lead consults it; demonstrate
the omitted at-risk observation without claiming the whole service never
escalates. Keep the other callers working. If an alert actually must be missed,
identify its input and invocation cadence first, and reconcile the other job.

The receipt of an evaluation is enough to motivate Gilad's `deadline` and
`evaluatedAt`. Logging is not automatically mandatory on every invocation merely
because it is a side effect. Keep that distinction visible.

## 3. Oded: TTL is competent, with a precise limit and a fair repair

Accept TTL as the small patch. Don't reject it because an SLA uses hours and the
cache uses minutes; equally, that unit choice does **not** prove one minute of
staleness is allowed. The display/alert owner has to allow it.

Probe: cache an at-risk evaluation **1 ms before** the deadline with a 60-second
TTL. Thirty seconds after the deadline, the cached answer is still at-risk.
It recomputes at deadline + 59,999 ms. With 30-second polling, distinguish the
age of a cached answer at a call from how long an old rendered row remains on
screen before another call. No “at most a minute late on screen” claim follows
without considering the refresh schedule.

His strongest logging repair is ordinary and must not be withheld: put the
required observation **outside** the status cache. In three half-minute calls,
my TTL probe performs two evaluations and three outer observations. The retained
`evaluatedAt` must stay the time of the original evaluation; don't relabel a
cache hit as newly computed. If the log contract needs a fresh exact assessment,
that is a concrete reason this repair costs more, not a generic indictment of TTL.

There is a stronger cache alternative too: expire at the **next status boundary**
(`deadline - warningWindow`, then `deadline`) rather than after an arbitrary
minute. I verified exact status at both boundaries with **one deadline walk**,
retaining the deadline in the entry and recomputing only status at expiry. It
starts to encode the same split inside the cache policy. One exchange is enough:
Oded can propose it; Dafna can point out that the cache now knows the status
thresholds. Do not claim his only options are repeated full walks or stale answers.
It need not become a third printed cache implementation.

### Counting, not benchmarking

For 20,000 unchanged tickets at refresh times `t`, `t + 30s`, `t + 60s`, I ran the
actual local business-minute walk, not a constant-returning fake:

| Strategy | Deadline walks |
|---|---:|
| Uncached status | 60,000 |
| 60-second TTL on status | 40,000 |
| Memoized deadline, fresh status | 20,000 |

These counts exclude edits and policy changes, start with cold caches, and do not
measure elapsed time. The plan's “counter shows it dominated” / “CPU drops” is
not established by a call count. Use the count as the demonstrated result; add a
separate actual profile if a stronger performance claim is necessary. Counters
are diagnostic instrumentation around the calculation, not effects the business
contract requires on every evaluation.

A minute in an ever-growing key is not identical to replacing a TTL entry. Prefer
TTL for the printed small patch, or give the bucket cache a stated eviction
policy; don't create a new unbounded map as the competent production fix.

## 4. Dafna and Eden converge more than the plan admits

**The biggest fairness correction.** “All four callers change” is not an inherent
cost of Dafna's split. Nor does “one instant per refresh” favour her over Eden:
Eden already explicitly supplies that instant to the dashboard.

I compiled and executed a composition of both repairs:

- Cache `deadlineFor(ticket, policy)` under one fixed policy.
- `evaluate(deadline, now)` returns `{ status, deadline, evaluatedAt }` with no
  clock read or logging.
- Retain `slaStatus(ticket, now = Date.now()): Status` for existing callers. It
  uses those functions and performs the required logging outside the cache.
- The dashboard reads the clock once and passes that number for every ticket.

The explicit two-ticket batch reads the clock **once**, records one timestamp
for both evaluations, and produces both required observations. A later old-style
`slaStatus(ticket)` call still works and reads the current clock. No other caller
has to change merely to extract the pure core. The four caller contracts are not
opponents of that extraction. The wrapper can also return only `.status` while a
new dashboard API returns the evidence record; changing every return type is not
necessary either.

The honest residual cost is that the convenience wrapper remains effectful and
can still be memoized incorrectly. I reproduced that too. Even explicitly
supplying `now` doesn't make the wrapper pure while it logs. Names, deprecation,
module exports and code review can make the boundary clearer, but an ordinary
TypeScript signature does not enforce it. Dafna's exported pure function can
also be cached under an incomplete key; she doesn't get a compiler guarantee
that Eden lacks.

Let Eden show this composition, not merely a weaker alternative awaiting Dafna's
approval. If their only remaining choice is whether new callers see an explicit
pure operation or a convenience wrapper, show the actual caller that needs one.
Don't stage a forced disagreement over identical working code.

## 5. The time-zone Turn works, with two qualifications

Keep Chen. This changes the inquiry: the clock was not the only changing context.
The old local deadline calculation already depended on its host. Dafna isolates
that calculation and mistakenly calls it pure; she need not introduce a fresh
local-time implementation just to be caught. Chen brings the same ticket and
results from both entry points. Earlier tests can have used one common test-host
zone while the digest runs on an older, differently configured host. Name that
setup once; do not imply memoization introduced the host disagreement.

### Actual whole deadlines, not just hours

Fixture: **2026-11-09T07:00:00Z**, Monday 09:00 in Jerusalem; 240 business minutes;
Mon–Fri 09:00–17:00, no holidays. The local walker and explicit-zone repair give:

| Process `TZ` | Local-method deadline | Deadline with policy zone `Asia/Jerusalem` |
|---|---|---|
| UTC | 2026-11-09T13:00:00Z | 2026-11-09T11:00:00Z |
| Asia/Jerusalem | 2026-11-09T11:00:00Z | 2026-11-09T11:00:00Z |
| America/New_York | 2026-11-09T18:00:00Z | 2026-11-09T11:00:00Z |

For the plan's October 22 06:30Z hour-only example, 6/9/2 reproduces. For November
9 06:30Z the corresponding hours are **6/8/1**. Use the November dates consistently;
don't retain the October offsets after moving the scene out of transition season.

**Qualification 1: `Intl` formatting is not a complete business-calendar repair.**
Extracting the hour alone cannot fix a walker that still uses local `getDay`,
`setHours` or constructors elsewhere. My explicit-zone walker traverses epoch
minutes and reads both weekday and hour through a formatter with explicit zone,
locale and hour cycle. It requires valid minute-aligned inputs and a bounded
positive integer minute budget. It gives the same deadlines under all three
hosts, crosses Friday close to Monday correctly, and starts a 17:00 arrival the
next business day. This is enough for the stated simplified calendar, not a
production holiday/SLA library. No inverse local-time conversion is required.

Keep the calendar code from consuming the chapter. Establish a shared existing
walker and inspect the local-time predicate when Chen challenges it, or print a
small complete walker. Either way the durable checks must run the real operation
both before and after the repair, including closed hours and a weekend. A stub
returning a supplied deadline does not verify the Turn.

**Qualification 2: configuring both hosts to the team's zone also works here.**
The Jerusalem row above is already evidence. Oded can propose setting `TZ`
consistently; that is a valid immediate repair for a service with one team zone.
Dafna's explicit policy removes reliance on every deployment/test host selecting
that setting. Do not invent a second team's zone to make the configuration fix
fail. If they require zone-independent use, state who requires it. Chen should
accept an answer that covers the actual service rather than generate another
objection automatically.

## 6. Policy and keys: pure calculations still need complete keys

`id + updatedAt` represents every relevant ticket value only under a repository
contract that every relevant edit changes that revision. State that guarantee or
use an explicit revision number. Equal timestamps alone do not prove equal inputs.

Once policy is an argument, the deadline key must include it, or the cache must
belong to a single fixed policy. My probe caches the pure, explicit-zone function
using only the ticket key, then changes the policy from Jerusalem to UTC: the
true deadline moves from 11:00Z to 13:00Z, but the incomplete key returns 11:00Z.
Including the zone/version repairs it. A fixed-policy-scoped cache also works
and keeps the manuscript small. Immutable captured configuration does not have
to be threaded through four layers just to satisfy a purity slogan.

This need not become another Turn or fence. Name the lifetime/key contract at the
first deadline cache and test it. Don't describe `deadlineFor(ticket, policy)` as
“cacheable” without saying which inputs define the cached answer.

## 7. Cast: keep six, acknowledge the Clock alternative without Guy

**Keep Eli, Gilad, Oded, Dafna, Eden and Chen.** Their attention differs enough:
Eli sets the substitution claim; Gilad asks which observation was lost; Oded owns
the bounded patch; Dafna separates calculation and effect; Eden preserves callers;
Chen brings cross-host evidence. Gilad should stop once the observation contract
is clear. Avoid turning his incident into an expert's lecture about logging.

A `Clock` interface is a fair test seam, but it is not a missing competing
solution to the cache. I compiled `Clock { now(): number }` and called the same
function twice with the **same Clock object**: first `ok`, then `breached`.
Dependency injection makes the source controllable; it does not turn that source
into a captured time value. A competent service can read its injected clock once
per refresh and pass the number into the same pure core. That's compatible with
Dafna's split and Eden's facade.

Eden can raise the testing option in one exchange or Take. No need for Guy's
seventh appearance, nor to remove a character doing unique work to repeat Ch17's
named-interface-versus-function exchange. If a service lifecycle becomes the
actual disputed decision later, revisit the cast then.

The proposed `Date.now` patch compiles and works (restore it in `finally`; isolate
the test). It controls that clock, not host-local date methods. Don't let a fake
clock test stand in for a time-zone test.

The TS2367 narrowing example also reproduces verbatim. Prefer cutting it: it
reopens Ch5/Ch17's mutation lesson without affecting this decision. If retained,
say **this narrowing survives this call**, not “TypeScript assumes functions are
pure,” which confuses a checking compromise with a purity guarantee.

## 8. Ending and economy

Do not decide a section label now. On the current evidence I expect a **local
Verdict**: keep the deadline calculation separate, account for its calendar,
evaluate the changing status at the intended instant, and perform required
observations at the appropriate boundary. Eden can retain an effectful legacy
facade. Oded can keep a valid bounded mitigation while that change is deployed.
That is convergence with costs, not a draw between mutually exclusive designs.

A real Debate Continues remains possible if a shown consumer has an acceptable
staleness budget and the TTL change meets it, while the extra separation has a
cost that its owner declines. Or if the team genuinely disagrees about the API
new callers should use after comparing those callers. The number four and the
batch timestamp alone cannot establish that disagreement: the composed repair
already handles both. No forced withdrawal, future feature or act-level quota.

Budget the chapter around **one incident, one small mitigation, one factoring
with a compatibility wrapper, and the calendar counterexample**. Don't print
three nearly identical services, a generic memoizer tutorial, an SLA framework,
and the narrowing Take. Oded's exact-expiry suggestion and the Clock alternative
can be short exchanges. Let a successful repair change the argument, as the
third overload does in Chapter 7. Avoid giving every participant a closing maxim.

## 9. Settlement requested before draft

1. Fix the incident timeline and define what the at-risk observation/alert must
   accomplish; reconcile the independent escalation caller.
2. Accept the pure-core/defaulted-wrapper composition as the strongest repair,
   removing mandatory four-caller migration and batch-consistency advantages
   that it disproves. Choose a cache-policy requirement instead of a false split.
3. Keep the zone Turn on the existing walker, with a complete tested repair and
   a fair hearing for consistent host configuration. Choose fixed-policy cache
   scope or an explicit policy key.
4. Keep the six-person cast, drop the mutation Take unless it later earns space,
   and leave the ending to the examined cases.

## Primary sources checked

- [ECMAScript `Date.prototype.getHours`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.prototype.gethours)
  and [getDay](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.prototype.getday)
  apply `LocalTime` to the stored instant. The runtime probes above test the
  consequences for this actual walker.
- [ECMA-402 DateTimeFormat initialization](https://tc39.es/ecma402/#sec-initializedatetimeformat)
  records the supplied time zone; its default comes from the system zone.
- [Node's `TZ` documentation](https://nodejs.org/api/cli.html#tz) describes the
  supported zone-ID configuration. The harness uses separate processes with
  `TZ` set; the TypeScript examples require no Node globals.

No quotation or real-world SLA policy is attributed to these sources. The
support schedule and alert contract are fictional requirements to state in the
chapter, not general facts about support desks.
