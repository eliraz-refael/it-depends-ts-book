# Chapter 18: The Ticket Hadn't Changed

## The Principle

**Prof. Eli Typeworth**: "A pure calculation gives the same result for the same input values, without also doing required work, such as writing a record someone relies on. Before reusing an earlier answer, ask two questions: what could change the answer without changing those inputs, and what required work would disappear if the call didn't run?"

"Make anything that can change the answer an explicit input. If a value comes from outside the call, like a host setting, reuse an answer only while that value cannot change. If an input changes too often to reuse the whole answer, like the clock, reuse only the work that does not depend on it. Put required work where returning a saved answer cannot skip it. An ordinary TypeScript function signature doesn't prove a function pure. You can instead decide to accept some staleness. But an acceptable old answer is still an old answer. Deciding how stale it may be is a separate decision from making the calculation pure."

## The Debate

### A cheaper refresh

**Oded Shipley**: "Twenty thousand tickets. We walk the business calendar for every one, every thirty seconds. I stopped walking it for tickets that hadn't changed."

**Gilad Stacktrace**: "The lead has an overdue ticket showing green."

**Oded**: "Did somebody change its priority without incrementing the revision?"

**Gilad**: "Nobody changed anything. That's the interesting part."

Their support desk gives a P1 ticket four business hours, counted Monday to Friday, 09:00–17:00 in Jerusalem. It becomes at-risk thirty elapsed minutes before its deadline, and breached at the deadline. The escalation job escalates breached tickets hourly. The lead uses the dashboard to intervene before that next run.

Their calendar has no holidays or paused tickets. The existing `deadlineFor` walks those business minutes from the opening time and returns an epoch timestamp. `slaStatus` compares that deadline with the current time and returns one of three strings:

```typescript
type Ticket = Readonly<{
  id: string;
  revision: number;
  openedAt: number;
  businessMinutes: number;
}>;
type SlaStatus = "ok" | "at-risk" | "breached";

declare function slaStatus(ticket: Ticket): SlaStatus;

const ticket: Ticket = {
  id: "P1-42", revision: 1,
  openedAt: Date.UTC(2026, 10, 9, 7), // Monday, 09:00 in Jerusalem.
  businessMinutes: 240,
};
```

This ticket is due at 13:00 Jerusalem time, or 11:00Z. It should be `ok` at 12:20, `at-risk` at 12:40 and `breached` at 13:00.

**Gilad**: "When `slaStatus` returns at-risk, it records the ticket, deadline and the instant used to evaluate it. We use those records to reconstruct what the lead saw. Where are this one's records?"

**Oded**: "It never showed at-risk."

**Eden Legacy**: "The escalation job still called `slaStatus` directly. It escalated the ticket after the breach. That doesn't give us the missing at-risk record."

The ticket API and the digest also call `slaStatus` directly.

The project's `memoizeBy` helper saves a function's result under the key its key function computes. A hit returns that result without running the function. Every edit to a ticket increments its revision, so Oded used the ID and revision together:

```typescript
const ticketKey = (ticket: Ticket) => `${ticket.id}/${ticket.revision}`;
const dashboardStatus = memoizeBy(ticketKey, slaStatus);
```

Gilad replays the three instants, calling the original function and the cached one side by side. The replay runs in the dashboard's Jerusalem environment. He replaces `Date.now` for this isolated test and restores it afterward:

```typescript
const realNow = Date.now;
try {
  for (const now of [
    Date.UTC(2026, 10, 9, 10, 20),
    Date.UTC(2026, 10, 9, 10, 40),
    Date.UTC(2026, 10, 9, 11, 0),
  ]) {
    Date.now = () => now;
    console.log(slaStatus(ticket), dashboardStatus(ticket));
  }
} finally {
  Date.now = realNow;
}
// ok ok
// at-risk ok
// breached ok
```

Only the direct call at 12:40 records an at-risk evaluation. The cached dashboard never reaches that code.

**Oded**: "The revision is right. I cached the answer to a question that changes while the ticket sits there."

**Dafna Functor**: "Show me where it asks the clock."

Eden opens the existing implementation. `assess` computes the answer; `slaStatus` also sends at-risk records to the application's `recordRisk` sink:

```typescript
type Evaluation = Readonly<{
  status: SlaStatus;
  deadline: number;
  evaluatedAt: number;
}>;

function assess(ticket: Ticket): Evaluation {
  const deadline = deadlineFor(ticket);
  const evaluatedAt = Date.now();
  const status = evaluatedAt >= deadline ? "breached"
    : evaluatedAt >= deadline - 30 * 60_000 ? "at-risk" : "ok";
  return { status, deadline, evaluatedAt };
}

function slaStatus(ticket: Ticket): SlaStatus {
  const result = assess(ticket);
  if (result.status === "at-risk") {
    recordRisk(ticket.id, result.deadline, result.evaluatedAt);
  }
  return result.status;
}
```

**Dafna**: "The cache skips both the clock read and the record. Even if the old string happened to be right, it wouldn't write another record."

### Give the old answer an expiry

**Oded**: "We already have a TTL helper. Let an answer live for sixty seconds, and put the recording after the cache lookup. Only the dashboard changes."

Their `withTtl` helper keeps a result per key until sixty seconds after its computation starts. The next call at or after expiry recomputes it and replaces the entry. Oded caches the evaluation, so a hit retains its actual evaluation timestamp:

```typescript
const cachedEvaluation = withTtl(ticketKey, assess, 60_000);

function dashboardStatus(ticket: Ticket): SlaStatus {
  const result = cachedEvaluation(ticket);
  if (result.status === "at-risk") {
    recordRisk(ticket.id, result.deadline, result.evaluatedAt);
  }
  return result.status;
}
```

**Gilad**: "Every at-risk row we show is recorded now. Including a cache hit. Good. Does it still say at-risk after the deadline?"

**Oded**: "For the rest of that entry's minute. We're measuring the SLA in hours."

**Gilad**: "The lead is deciding whether to escalate now. Did the lead agree to the extra minute?"

Oded tests a fresh cache. He first fills it one millisecond before the deadline, then calls it thirty seconds after:

```typescript
const realNow = Date.now;
const nearDeadline = withTtl(ticketKey, assess, 60_000);
const due = Date.UTC(2026, 10, 9, 11);
try {
  Date.now = () => due - 1;
  console.log(nearDeadline(ticket).status); // at-risk
  Date.now = () => due + 30_000;
  console.log(nearDeadline(ticket).status); // at-risk
  console.log(slaStatus(ticket));          // breached
} finally {
  Date.now = realNow;
}
```

**Oded**: "It stops the answer staying green forever. It doesn't make every refresh current."

**Eden**: "Even after the cache expires, the lead still sees the old row until the board refreshes."

**Oded**: "Then use boundary expiry. We have the deadline. Before the at-risk window, expire at its start. Inside it, expire at the deadline."

**Dafna**: "That can work. Keep the deadline in the entry and you don't have to walk it again. But now the cache knows our status thresholds. The comparison is three numbers. Why cache that part?"

### Keep the expensive answer

Dafna replaces `assess` with `evaluate`, taking out the clock read and calendar walk. It receives the deadline and the instant to compare:

```typescript
function evaluate(deadline: number, now: number): Evaluation {
  const status = now >= deadline ? "breached"
    : now >= deadline - 30 * 60_000 ? "at-risk" : "ok";
  return { status, deadline, evaluatedAt: now };
}
```

**Dafna**: "Cache the calendar result. Give this the current instant on every refresh. The caller reads the clock and records whatever it needs."

**Oded**: "And the digest, API and escalation job all have to learn that?"

**Eden**: "They don't. Keep their entry point. It can use her calculation."

The module now constructs its exported `slaStatus` with Eden's factory. Each call creates a deadline cache, so tests can start with an empty one.

```typescript
function makeSla() {
  const cachedDeadline = memoizeBy(ticketKey, deadlineFor);
  return function slaStatus(ticket: Ticket, now = Date.now()): SlaStatus {
    const result = evaluate(cachedDeadline(ticket), now);
    if (result.status === "at-risk") {
      recordRisk(ticket.id, result.deadline, result.evaluatedAt);
    }
    return result.status;
  };
}

const slaStatus = makeSla();
```

**Eden**: "The old callers still pass a ticket. The dashboard can pass one instant for the whole list. Both paths use the same deadline cache, and both record after looking it up."

```typescript
function refresh(tickets: readonly Ticket[]): SlaStatus[] {
  const now = Date.now();
  return tickets.map(ticket => slaStatus(ticket, now));
}
```

**Dafna**: "Keep `evaluate` available separately. Your exported function still reads the clock when I omit `now`, and still records when I supply it. I can't treat it as pure."

**Eden**: "The digest still needs today's status when it passes a ticket. I'm keeping that call working. Use `evaluate` when you already have both numbers."

**Oded**: "Same calls for three consumers. One clock read for the board. That's not the migration I was objecting to."

Oded implements boundary expiry and compares all four versions over the same 20,000 tickets. As in the replays, he replaces the clock: each refresh holds it at 12:20:00, 12:20:30 or 12:21:00 Jerusalem time. He starts with empty caches, makes no edits and counts deadline walks:

| Version | Deadline walks across the three refreshes |
|---|---:|
| No cache | 60,000 |
| Sixty-second TTL on the evaluation | 40,000 |
| Boundary expiry, retaining the deadline | 20,000 |
| Deadline cache, fresh comparison | 20,000 |

**Oded**: "First refresh, everyone walks twenty thousand. At thirty seconds none of the caches walks. At sixty, the TTL walks them all again. My boundary expiry keeps the deadline too. We tie there."

**Dafna**: "That is the part worth reusing. `deadlineFor` doesn't read the clock. It's a pure calculation we already had."

## The Turn

**Chen Override**: "Which host did you run this on?"

**Oded**: "The test runner. Why?"

**Chen**: "I ran this ticket through `deadlineFor` on the digest host. It gives it two extra hours."

The tests and the dashboard use Jerusalem time. The digest runs on an older host configured for UTC. Chen opens the existing calendar code. The walker advances epoch minutes; `isBusinessMinute` decides which ones count:

```typescript
function isBusinessMinute(at: number): boolean {
  const date = new Date(at);
  const day = date.getDay();
  const hour = date.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

function walkBusinessMinutes(
  ticket: Ticket,
  counts: (at: number) => boolean,
): number {
  let at = ticket.openedAt;
  let remaining = ticket.businessMinutes;
  while (remaining > 0) {
    if (counts(at)) remaining--;
    at += 60_000;
  }
  return at;
}

function deadlineFor(ticket: Ticket): number {
  return walkBusinessMinutes(ticket, isBusinessMinute);
}
```

**Chen**: "When `getHours()` says nine, whose nine?"

**Dafna**: "The host's. I checked it for clock reads. I didn't check what those methods read."

Chen runs the same code in three Node processes, changing only `TZ`:

```typescript
console.log(new Date(deadlineFor(ticket)).toISOString());
```

| Process time zone | Returned deadline |
|---|---|
| `UTC` | `2026-11-09T13:00:00.000Z` |
| `Asia/Jerusalem` | `2026-11-09T11:00:00.000Z` |
| `America/New_York` | `2026-11-09T18:00:00.000Z` |

**Eden**: "The digest was already wrong. We just never tested that host's setting. Our cache change didn't cause it."

[`getHours`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.prototype.gethours) and [`getDay`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.prototype.getday) use local time, which Node selects through [`TZ`](https://nodejs.org/api/cli.html#tz); [`Intl.DateTimeFormat`](https://tc39.es/ecma402/#sec-initializedatetimeformat) can take an explicit zone instead.

**Oded**: "Set the digest host to Jerusalem. We have one support team, not three calendars."

**Chen**: "That gives the right deadline. I tried it."

**Eden**: "I can fix that host today. But I don't want every replacement image to inherit this rule from the machine it's built on. The digest and the dashboard should get the support calendar from our module."

**Dafna**: "Then pass the zone to the calculation. For each instant, ask for both the weekday and hour in that zone. Leave the walk on epoch minutes."

She replaces `deadlineFor` and adds the module's fixed policy:

```typescript
type SlaPolicy = Readonly<{ timeZone: string }>;
const supportPolicy: SlaPolicy = Object.freeze({ timeZone: "Asia/Jerusalem" });

function deadlineFor(ticket: Ticket, policy: SlaPolicy): number {
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: policy.timeZone,
    weekday: "short", hour: "numeric", hourCycle: "h23",
  });
  return walkBusinessMinutes(ticket, at => {
    const parts = format.formatToParts(at);
    const day = parts.find(part => part.type === "weekday")?.value;
    const hour = Number(parts.find(part => part.type === "hour")?.value);
    return day !== "Sat" && day !== "Sun" && hour >= 9 && hour < 17;
  });
}
```

**Oded**: "A formatter call for every minute now? Friday tickets walk the whole weekend."

**Dafna**: "They do. Counting walks doesn't tell us what each one costs."

**Eden**: "I'll time a cold refresh of the whole board on the dashboard host before we switch. It has to finish within the refresh interval. Until then, remove the status cache and keep the board on the old uncached path in Jerusalem time."

"And I'll copy the policy. `Readonly` won't stop a caller editing the object it passed us. That would change the zone halfway through filling our cache."

He replaces the factory and rebuilds the entry point:

```typescript
function makeSla(policy: SlaPolicy) {
  const fixedPolicy = { timeZone: policy.timeZone };
  const cachedDeadline = memoizeBy(ticketKey,
    (ticket: Ticket) => deadlineFor(ticket, fixedPolicy));
  return function slaStatus(ticket: Ticket, now = Date.now()): SlaStatus {
    const result = evaluate(cachedDeadline(ticket), now);
    if (result.status === "at-risk") {
      recordRisk(ticket.id, result.deadline, result.evaluatedAt);
    }
    return result.status;
  };
}

const slaStatus = makeSla(supportPolicy);
```

**Eden**: "Same policy for every entry in this cache. If we load another policy, we rebuild `slaStatus` with it. The ticket revision alone wouldn't distinguish two calendars."

**Chen**: "Now it's 11:00Z in all three processes."

After the cold-refresh check passes on the dashboard host, Eden switches the board. The next day, ticket P1-43 opens at 09:00 Jerusalem time with the same four-hour budget. The repaired dashboard writes an at-risk record at 12:40.

**Gilad**: "Can I reconstruct that row without asking the clock what time it is now?"

**Dafna**: "Use the deadline and evaluation timestamp in its record."

Gilad opens that record:

```typescript
const record = {
  ticketId: "P1-43",
  deadline: Date.UTC(2026, 10, 10, 11),
  evaluatedAt: Date.UTC(2026, 10, 10, 10, 40),
};
console.log(evaluate(record.deadline, record.evaluatedAt).status); // at-risk
```

**Gilad**: "And replaying it through `slaStatus` would write another record. This just reads the old one."

## The Verdict

Gilad has checked with the lead: status as of the last thirty-second refresh is acceptable; an extra cache delay is not.

**Eden**: "We'll keep `slaStatus` for the existing callers and require the cold-refresh check before each rollout. While it runs, the board stays on the uncached path. I'll correct the digest host too, but the module will use its own policy."

**Oded**: "The TTL would stop the indefinite stale answer. Boundary expiry would get the transitions right too, but I'd be maintaining the status rules in the cache. Keep the small comparison out of it."

**Dafna**: "And keep `evaluate` free of the recording. If someone needs that effect, they call the wrapper."

**Eden**: "I'll describe that on the exported entry point. Nothing in `(ticket, now?) => SlaStatus` prevents the next person memoizing it again."

## Additional Takes

**Eden**: "Our other service injects a `Clock` with a `now()` method. We can give tests a fixed clock without replacing `Date.now`."

**Dafna**: "That makes the source controllable. Pass the same live `Clock` twice and it can give you two different instants. Read it once at the refresh boundary, then give the calculation that number. The service can keep its clock."

---

**Oded**: "Your memoizer writes to a Map. Are we allowing that?"

**Dafna**: "It keeps a deadline inside this module. Nobody receives the Map, and a hit returns the same number a fresh walk would produce. That internal write doesn't replace any record we promised. Caching the function that called `recordRisk` did."
