# Chapter 18 — Pure Functions (working title)

Status: **PROPOSED, awaiting Codex's challenge**, 2026-10-22.
Branch: `codex/chapter-18-pure-functions`, based on `origin/main` `c154239`.
File: `book/03-patterns-and-design/05-pure-functions.md`.

## What earlier chapters already settle (do not repeat)

- **Ch5:** narrowing. Ch18 may use one narrowing fact in a Take (below), not re-teach it.
- **Ch14:** a function that catches and returns has decided its caller no longer needs the rejection.
  Error channels are not this chapter's subject.
- **Ch17:**
  - mutating an argument, readonly views and snapshots;
  - "keep the calculation as a value-returning function".

  Ch18 must not re-argue mutation of shared objects. Its subject is what a function **reads** that
  its caller didn't pass (time, time zone, configuration) and what it **does** that its caller didn't
  receive (logging, writes). A clause of callback to Ch17 is fine.

Purity itself has never been argued: the only mentions are the prologue's stance and Idan's bio.

**Later chapters to stay clear of:**
- **Ch19, imperative vs declarative:** loops vs `reduce` as style. No style claims here.
- **Ch20, currying and partial application:** don't solve the threading of `now` or a policy by
  currying (`deadlineFor(policy)(ticket)`).
- **Ch21, higher-order function patterns:** the memoizing helper below is an existing project helper
  whose contract is stated in a few lines. Don't teach how to write HOFs.
- **Ch23, monads light:** no `IO`/`Effect` types and no effect libraries. Linoy is not in the cast
  partly for this reason.

## Principle (must be stated, in an expert's words, before the scenario)

**Eli**, who has not set an Act III Principle. Roughly, in his voice, not verbatim:

> A call is pure when you could replace it with the value it returned and nothing in the program could
> tell. That takes two things. The result depends only on the arguments, and the call changes nothing
> that anyone else can observe. A TypeScript signature records neither. So before code relies on that
> replacement (a cache, a retry, a test that pins a value, a reordering), list what the function reads
> that its caller didn't pass, and what it changes that its caller didn't receive. Whatever relies on the
> call must account for each of them, or the function must stop having them.

**Testable form:** given a function and a consumer that relies on replacing calls with results, a
reader can name the hidden inputs and outputs and decide whether the consumer is safe. The Principle-only
reader must be able to restate that. Hard cases for that test:
- a cached function whose only hidden input is the current time;
- a cached function that logs, so a cache hit drops the log line;
- a function that uses the time zone of whatever process runs it.

**It must not pre-decide the remedy.** There are two: make the consumer account for the hidden input
(for example, put it in the cache key), or remove the hidden input from the function. That is the
chapter's dispute.

Eli's lambda-calculus whiteboard is in his bio. Don't recycle it as a device.

## Verified mechanisms (TS 7.0.2, Node 22.23.3, book profile)

Claude's probes are in the session scratchpad (not tracked). Codex reproduces them in `.probe/`,
untracked.

1. **A memoized function with a hidden clock goes stale.** Memoize `slaStatus(ticket)` by ticket id,
   with `slaStatus` reading `Date.now()`. A ticket 50 minutes into a 60-minute SLA returns `"ok"`. After
   the clock advances 20 minutes, the cached call still returns `"ok"`; the uncached call returns
   `"breached"`.
2. **Caching only the time-independent part works and counts deterministically.** Memoize the deadline
   calculation, compare against `now` on each refresh. 20,000 tickets over three refreshes give exactly
   20,000 deadline computations. This is a count, not a timing; assert the count.
3. **Local-time `Date` methods read the process time zone.** For `Date.UTC(2026, 9, 22, 6, 30)`,
   `getHours()` returns 6 under `TZ=UTC`, 9 under `TZ=Asia/Jerusalem` and 2 under
   `TZ=America/New_York`. The source is identical; only the process environment differs.
4. **An explicit zone is available under the book profile.** `new Intl.DateTimeFormat("en-GB",
   { timeZone, hour: "numeric", hourCycle: "h23" }).formatToParts(at)` compiles (ES2022 libs) and is
   independent of `TZ`. Codex verifies the runtime part.
5. **`process` is not typed under the book profile** (`types: []`, no `@types/node`). Fences must not
   use `process.env`; the time-zone demonstration runs in the check harness, in separate Node processes
   with `TZ` set.
6. **Tests can patch the clock without a library.** `Date.now = () => Date.UTC(…)` compiles under the
   profile. This is the strongest form of "just fake the clock in the test" that needs no new
   dependency.
7. **The compiler assumes calls don't change what it has narrowed.** After `if (t.status === "open") {
   escalate(t); … }`, where `escalate` sets `t.status = "escalated"`, the check `t.status ===
   "escalated"` fails: `TS2367: This comparison appears to be unintentional because the types '"open"'
   and '"escalated"' have no overlap.` The checker treats the call as if it had no effect on `t`. One
   Take at most (Daniel's or Chen's); it is not the chapter's argument, and it borders on Ch17.

**Dates:** avoid daylight-saving transitions. Israel's ends on 25 October 2026. Pick dates in
November or later, and state the offsets the checks assume.

## Disputed decision and scenario

A support desk. Each ticket has an SLA counted in **business hours**: 09:00–17:00, Monday to Friday,
in the support team's time zone. A P1 ticket gets 4 business hours.

**What exists before the failure** (establish all of it on the page):
- `deadlineFor(ticket)` walks business hours from `openedAt`. It is the expensive part.
- `slaStatus(ticket): "ok" | "at-risk" | "breached"` compares `Date.now()` with the deadline.
- `slaStatus` logs an `at-risk` line that the on-call lead's alert rule reads.
- `slaStatus` has four callers: the dashboard, the hourly email digest, the ticket API and the
  escalation job.
- The dashboard refreshes every 30 seconds over about 20,000 open tickets.
- The project's `memoizeBy(keyOf, fn)` helper caches by a key. State its contract in two lines; its
  implementation can appear if someone needs to inspect it.

**The change.**
- Oded wraps the dashboard's `slaStatus` in `memoizeBy` keyed by `id` and `updatedAt`. That is
  competent: any edit to a ticket invalidates its entry, and the key covers every field of the
  argument.
- The signature `(ticket: Ticket) => SlaStatus` says nothing about time. He isn't careless; the
  Principle's "a signature records neither" is the reason.
- Oded's own counter shows the deadline walk dominated the refresh, not a timing Gil would need to
  defend. CPU drops.

**The failure.**
- A P1 nobody touches stays `ok` on the dashboard past its deadline. The on-call lead escalates from
  that column, so it isn't escalated.
- The `at-risk` log line fired once, on the first computation, and never again.
- Gilad: no error and no stack trace. Both hidden outputs and the hidden input show up in one
  incident. Mechanism 1.

**Repairs.** Each needs its strongest competent version, tested against the same tickets and clock.
- **Oded:** put the minute in the key, or add a 60-second TTL.
  - A one-line diff with bounded staleness, at minute granularity for an SLA measured in hours.
  - Cost: it still recomputes every deadline each minute. The clock is still hidden for the next
    consumer who caches `slaStatus`.
  - The log fires once a minute per at-risk ticket. Does the alert rule care? Let Gilad answer.
- **Dafna:** split the function.
  - `deadlineFor(ticket, policy)` is pure and cacheable.
  - `statusAt(deadline, now)` is pure and cheap.
  - Each consumer reads the clock once and passes `now`, so a whole refresh is evaluated at one
    instant.
  - Mechanism 2. Logging moves to the caller, which has both numbers.
  - Cost: all four callers change, and the policy has to be passed through.
- **Eden:** `slaStatus(ticket, now = Date.now())`, with the deadline cached inside.
  - The four callers don't change. The dashboard passes `now`, and its cache is on deadlines, not on
    status.
  - It's a TS-idiomatic, migration-friendly move.
  - Cost: a call without `now` is still impure, and nothing stops the next person from memoizing it.
  - Does Eden rename or deprecate the defaulted form to prevent that? Let the scene decide.
- **Gilad:** evidence, not a design.
  - When the board says `breached`, he wants the deadline and the `now` that produced it.
  - Dafna's competent answer is to return `{ status, deadline, evaluatedAt }` and log at the caller.
  - Gilad may also bring a precaution from an old system that this one doesn't need (his bio). One
    beat, not a speech.

**Turn (candidate, optional): Chen asks what time zone 09:00 is in.**
- Dafna's "pure" `deadlineFor` uses `getHours()`/`getDay()`. The process time zone is a hidden input
  (mechanism 3).
- Example: the dashboard container runs in UTC and the digest machine in Jerusalem, and they disagree
  about the same ticket's deadline. Codex chooses a setup that is believable and wouldn't have been
  noticed before the comparison.
- This tests the Principle against its own champion: a function is pure only relative to the inputs
  someone listed.
- The repair is for the policy to carry `timeZone` and use `Intl` (mechanism 4).
- Chen should carry evidence: he ran it under two zones. He doesn't need a follow-up objection on
  schedule.
- If Codex finds a better Turn, or none, argue it in the challenge.

**Daniel** is not in the main cast. Mechanism 7 can be a Take by Chen, or by Daniel as a single
appearance, if it earns its place.

## Ending: **not pre-decided**

Act III still owes an honest "The Debate Continues". **Don't let that decide this chapter.**

The live candidate is Dafna's split vs Eden's defaulted `now`. The scenes give each a real claim:
- four callers and a deprecation path favour Eden;
- one instant per refresh and no impure form to cache favour Dafna.

**The Debate Continues fits only if the scenes leave that choice open for this service.** Its
conditions must be ones the text exercised: the number of callers, whether any caller caches, and
whether a consumer needs one instant across a batch. No closing list of retries, concurrency or
replay unless those were shown.

If the room settles it (for example, both converge on a pure core with one clock read at each
consumer), write a local Verdict with any honest dissent. The debt then moves to Ch19.

## Cast

- **Prof. Eli Typeworth** (he): expert, Principle, sparing.
- **Gilad Stacktrace** (he): expert. The incident, evidence and logs. Sparing.
- **Oded Shipley** (he): made the cache change, and its strongest defender.
- **Dafna Functor** (she): the split.
- **Eden Legacy** (he): callers and migration, the defaulted parameter.
- **Chen Override** (he): the time-zone question.

Six is the top of the guide's range.

Not included, for Act III variety: Guy and Dafna were the main pair in Ch14 and Ch17.
- **Guy:** an injected `Clock` interface in a service class is a fair design. If Codex thinks the
  chapter is unfair without it, argue for a swap in the challenge rather than adding a seventh
  speaker.
- **Gil:** his counting job goes to Oded's counter.
- **Liron:** gave the last two Principles.
- **Noam, Linoy, Idan, Dima:** not needed.

Check every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- No catchphrase taglines. Gilad's "Show me the stack trace" works here only if there's literally no
  trace to show, and then once.
- Oded is not a punching bag. His cache was a reasonable change, and his TTL repair must get a fair
  test against the same tickets.
- One running scenario. Small integers and fixed UTC instants. Every fence is checked.
- Length: 2,300–3,200 words. Ch17 ran 2,345; a shorter, sharper chapter is welcome.

## Validation plan

`checks/chapter18.cjs`: compile every TS fence on the book profile, with competing repairs as separate
programs.

Runtime groups:
- the stale memoized status (mechanism 1), with the dropped log line counted;
- each repair against the same tickets and advancing clock: Oded's minute key or TTL, Dafna's split,
  Eden's default;
- the deadline-computation count for the split (mechanism 2), and for Oded's minute key if the text
  compares them;
- the time-zone disagreement, in separate Node processes with `TZ` set, if the text uses it;
- the `Intl` repair giving the same deadline under every `TZ`;
- Gilad's evidence record, if printed.

Compiler cases:
- the clock patch compiling, if a test is printed;
- TS2367 verbatim, if mechanism 7 is used;
- any intentional error the text quotes, verbatim.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

Readers: an isolated Principle-only reader with the three hard cases above, and a fresh full reader.
Both get prerequisites only.

## Completion

- [ ] Codex challenges this plan; disagreements are settled on evidence.
- [ ] Codex drafts and self-reviews.
- [ ] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and final diff review.
- [ ] Checks durable; full suite green.
- [ ] Ready for the author's review.
