# First-read report: Chapter 18, "The Principle"

Draft 1 (`17126754…`), 2026-10-22. A fresh, isolated reader had only the Principle extract
(`awk '/^## The Debate/{exit} {print}'`) and the earlier chapters stated as prerequisites. The report
is copied verbatim.

---

## 1. The rule, quoted

> "A pure calculation gives the same result for the same unchanged input values, without doing other work that someone needs to observe. Before reusing an earlier answer, ask two questions: what could change the answer without changing those inputs, and what required work would disappear if the call didn't run?"

> "Keep those dependencies and effects at a boundary that accounts for them. An ordinary TypeScript function signature doesn't prove they're absent. And an acceptable old answer is still an old answer. Deciding how stale it may be is a separate decision from making the calculation pure."

**Verdict:** the diagnosis is an explicit rule, and I could test it. The two questions work as a checklist I can run against a function before I cache it. They gave me a clear yes or no on every case below. The remedy is not testable: "Keep those dependencies and effects at a boundary that accounts for them." It tells me where the fix goes (a "boundary") but not what the fix is. It doesn't say whether to pass the value in, add it to the cache key, or move the effect out of the cached function. The staleness sentence is a real, usable distinction, but it only tells me what *not* to confuse. It gives me no way to decide.

## 2. In your own words

A function is pure only if two things hold: the same inputs always give the same output, and running it has no side effect anyone depends on. Before you reuse a cached result, ask what could change the answer even though the inputs you key on haven't changed: a clock, an environment setting, a timezone. Then ask what would silently stop happening if the function were skipped. Anything you find should be handled visibly at the edge of the pure code, and the type signature won't warn you about it. Separately, choosing how old a cached answer may be is a product decision, and it doesn't make the function pure.

## 3. Apply it

**(a) `slaStatus` cached by ticket id + revision, reads `Date.now()`**
- **Safe?** No.
- **Hidden input:** the current time. Question one ("what could change the answer without changing those inputs") catches it right away. Id and revision stay the same while the clock moves the ticket from "ok" to "at-risk" to "breached". An untouched ticket would show "ok" forever, which I take to be what the chapter title, "The Ticket Hadn't Changed", points at.
- **Effects:** none in this version.
- **What the rule says:** the clock is a dependency to keep "at a boundary that accounts for" it. I read that as making `now` an explicit argument, so the pure part is `(ticket, now) => status`. The section doesn't actually say that, though. It also doesn't address the follow-on problem: once `now` is an input, a cache keyed on it almost never hits.
- **Words relied on:** "what could change the answer without changing those inputs"; "An ordinary TypeScript function signature doesn't prove they're absent." The signature `(ticket) => Status` hides the clock read.

**(b) Same function also logs on "at-risk"; on-call relies on the logs**
- **Safe?** No, for two separate reasons.
- **Hidden input:** the clock, as in (a).
- **Hidden effect:** the log line. Question two fits exactly: "what required work would disappear if the call didn't run?" On a cache hit the log is never written. It is "required" because on-call depends on it, so it is "other work that someone needs to observe."
- **A worse consequence the rule helped me see:** the logs and the dashboard both come out wrong, and wrong in different ways. A cache hit can show "at-risk" with no matching log line. A stale "ok" hides a real at-risk state with no log either.
- **What the rule says:** move the effect to the boundary. My guess is to log where the dashboard actually renders or serves a status, not inside the cached calculation. The section doesn't say this concretely.
- **Words relied on:** "without doing other work that someone needs to observe"; "what required work would disappear if the call didn't run."

**(c) `deadlineFor` uses `getHours()` / `getDay()`, no clock, no logging, cached, two servers**
- **Safe?** Not as described.
- **Hidden input:** the process's local timezone, and with it daylight-saving rules. `getHours()` and `getDay()` read `ms` in local time. Two servers with different `TZ` settings return different deadlines for the same ticket. Even with one timezone, a DST change shifts the business-hours window.
- **Effects:** none.
- **What the rule says:** question one catches this, but only if I already know `getHours()` is local-time dependent. The section never mentions timezone or environment. It gives me the question; it doesn't point at the trap. "Someone calls it pure" is exactly the claim the rule warns about: "An ordinary TypeScript function signature doesn't prove they're absent."
- **Fix as I understand it:** make the timezone (or business calendar) an explicit input, or pin it at a boundary.
- **Two-server detail:** this changes the outcome, and the section didn't help me with it.
  - With a cache shared between the servers, one server's answer gets served to the other.
  - With a cache per process, each server stays consistent with itself, but the two servers disagree with each other.

**(d) A 60-second TTL on the cache in (a)**
- **Is the function now pure?** No. The section is clearest here: "Deciding how stale it may be is a separate decision from making the calculation pure." The TTL bounds how stale the answer can get. `slaStatus` still reads `Date.now()` and is still impure. "An acceptable old answer is still an old answer."
- **Is the cache acceptable?** The section won't tell me, by design. It is "a separate decision." Concretely, a ticket can breach and keep showing "at-risk", or keep showing "ok" while it is at risk, for up to 60 seconds. Whether that is acceptable depends on what the dashboard is for: SLA alerting versus a glanceable overview. The section gives me no criteria.
- **Effects still unresolved:** if the logging from (b) is still in place, the TTL doesn't fix the missing log lines. They still disappear for up to 60 seconds of hits.

## 4. Where the section left me unsure

- **"A boundary that accounts for them."** This is the action step, and I can't picture it.
  - Is the boundary the function's parameter list, the cache layer, or the HTTP handler?
  - What does "accounts for" mean: names it, passes it in, includes it in the key, logs it?
  - I'd need one concrete before/after, ideally `slaStatus(ticket)` becoming `slaStatus(ticket, now)` with the cache and the logging placed somewhere.
- **"Same unchanged input values."** Does "unchanged" refer to mutation, meaning the same object reference whose contents have since changed (the earlier immutability chapter)? Or does it just mean equal values? The word "unchanged" seems to be doing work I can't pin down.
- **"Required work" / "someone needs to observe."** Who decides what's required? Is a debug log required? A metrics counter? In (b) the case tells me on-call relies on the logs. Without that, I wouldn't know how to classify a log line.
- **How to cache once the clock is an input.** If `now` becomes a parameter, exact-key caching stops working. Rounding `now` into time buckets is the obvious move, but that is itself a staleness decision. I couldn't tell how the "separate decision" plugs back into the pure function.
- **Environment inputs in general.** Would the section count timezone, locale, env vars, or feature flags under "what could change the answer"? I think yes, but nothing confirms it, and (c) depends on that.
- **Shared versus per-process caches.** These change how bad (c) is. The section has nothing about it.

## 5. Clarity and voice

**Sentences I had to reread**
- "Keep those dependencies and effects at a boundary that accounts for them." I read this three times. It is abstract, and "accounts for them" is vague.
- "A pure calculation gives the same result for the same unchanged input values, without doing other work that someone needs to observe." It is dense, and "unchanged" plus "values" makes me wonder whether reference identity matters.

**Terms used without explanation**
- "boundary"
- "effects", which is used in the second paragraph without being introduced as a term. The first paragraph says "other work," then the second switches to "effects" and "dependencies."
- "stale" is fine; everyone knows it.

**Sounded like documentation rather than a person talking**
- Most of it. The whole section is one speaker, Prof. Eli Typeworth, delivering definitions in a lecture register: "A pure calculation gives...", "Keep those dependencies and effects at a boundary...". Nobody pushes back, and there is no concrete example.
- "Deciding how stale it may be is a separate decision from making the calculation pure" reads like a style-guide line.
- The second paragraph has no attribution, so I assumed it is still Typeworth.

**What worked**
- The two questions are phrased like real questions a reviewer would ask in a PR, and they are memorable.
- "And an acceptable old answer is still an old answer" is the most human line. It sticks, and it did real work for me in case (d).
- "An ordinary TypeScript function signature doesn't prove they're absent" is concrete and lands for a TS developer.
- The chapter title gave me a concrete hook that the Principle itself lacks.
