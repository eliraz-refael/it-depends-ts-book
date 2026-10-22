# Reader report: Chapter 18, "The Principle" (draft 3, first-time read)

Draft 3 (`2afb6fed…`), 2026-10-22. A fresh, isolated reader had only the Principle extract and the
earlier chapters stated as prerequisites. It used the same prompt and the same four cases as the
earlier reads. The first attempt ended on an API error before reporting; this is a rerun. The report
is copied verbatim.

---

## 1. The rule, quoted

The definition:
> "A pure calculation gives the same result for the same input values, without also doing required work, such as writing a record someone relies on."

The test:
> "Before reusing an earlier answer, ask two questions: what could change the answer without changing those inputs, and what required work would disappear if the call didn't run?"

The remedies:
> "Make anything that can change the answer an explicit input. If a value comes from outside the call, like a host setting, reuse an answer only while that value cannot change. If an input changes too often to reuse the whole answer, like the clock, reuse only the work that does not depend on it. Put required work where returning a saved answer cannot skip it."

The staleness caveat:
> "You can instead decide to accept some staleness. But an acceptable old answer is still an old answer. Deciding how stale it may be is a separate decision from making the calculation pure."

**Is it explicit and testable?** Yes. The two questions are concrete. I can sit in front of a function, run them, and get a list of things to check. It's the most usable part of the section.

**Can I act on the remedy?** Mostly.
- "Make anything that can change the answer an explicit input" and "reuse only the work that does not depend on it" tell me exactly what to do.
- "Put required work where returning a saved answer cannot skip it" tells me *where* the work must not be, but not where it should go. I can still act on it.
- The host-setting rule is the weakest. "reuse an answer only while that value cannot change" doesn't say how I would know a value cannot change.
- The section also gives two remedies for host settings and doesn't say how to choose. One is to make the value an input. The other is to reuse only while it's fixed.

## 2. In your own words

A function is only safe to cache if two things hold:
- Its answer depends on nothing except the values it's handed.
- Running it does nothing that someone downstream counts on happening.

So before caching, list everything that could change the answer while the arguments stay the same, and everything that would silently stop happening on a cache hit. Hidden inputs get pulled into the parameters. If one changes too fast, like the current time, cache only the part that doesn't use it. Effects people rely on get moved out, to a place that runs whether or not the cache hits. A TTL or "it's fine if it's a bit old" is a legitimate choice, but it's a choice about staleness, not a fix that makes the function pure.

## 3. Apply it

### (a) `slaStatus(ticket)` cached by id + revision, reads `Date.now()`

**Safe? No.**
- **Hidden input:** the clock. The ticket and its revision stay the same while the answer drifts from "ok" to "at-risk" to "breached". That is exactly "what could change the answer without changing those inputs". A cached "ok" stays "ok" past the deadline.
- **What to change:**
  - Make `now` a parameter: "Make anything that can change the answer an explicit input." That gives `slaStatus(ticket, now)`.
  - Don't cache the whole thing keyed by `now`. That would never hit, because the clock is "an input [that] changes too often to reuse the whole answer, like the clock."
  - Instead, cache the clock-independent part (the deadline, plus any thresholds derived from the ticket) by id + revision. Do the cheap comparison against `now` on every call: "reuse only the work that does not depend on it."

### (b) Same function also logs on "at-risk"; on-call relies on the logs; caching added

**Safe? No, for two reasons.**
- **Hidden input:** the clock, same as (a).
- **Effect:** the log line. On-call relies on it, so it is "required work", the section's own example: "writing a record someone relies on". On a cache hit the line is never written. The answer to "what required work would disappear if the call didn't run?" is "the record on-call uses to reconstruct the dashboard."
- **What to change:**
  - Take the log write out of `slaStatus` and put it in the caller, after the status is obtained, whether cached or fresh: "Put required work where returning a saved answer cannot skip it."
  - Fix the clock as in (a).
- **What I still had to decide myself:** how often the log should fire (every render, or only on a status change). The section gives no help there. It only says the work must not be skippable by a cache hit.

### (c) `deadlineFor(ticket)` uses `new Date(ms).getHours()` / `getDay()`, called pure, cached, two servers

**Safe? Not as stated.**
- **Hidden input:** the host's time zone (and possibly its tz database version). `getHours()` and `getDay()` read local time. Two servers in different zones turn the same `ms` into different hours and weekdays, so they compute different business-hours deadlines. The function "reads no clock and logs nothing", so it passes a casual purity check. But this is "a value [that] comes from outside the call, like a host setting."
- **What to change, option 1:** pass the time zone in explicitly, or use the UTC methods / a named zone ("Make anything that can change the answer an explicit input"). Then the cache key becomes ticket + zone.
- **What to change, option 2:** "reuse an answer only while that value cannot change". In practice that means a per-process cache, and never a cache shared across the two servers, and only if the host zone is fixed for the life of the process.
- The section's line "An ordinary TypeScript function signature doesn't prove a function pure" fits here. `(ticket) => number` looks pure and isn't.
- **What I had to infer:** that "host setting" means the time zone. The section never says "time zone". I got there from the example in the prompt, not from the text.

### (d) 60-second TTL on (a)'s cache

**Is it pure now? No.** It still reads the clock. The TTL only bounds how wrong a cached answer can be. "Deciding how stale it may be is a separate decision from making the calculation pure."

**Is the cache acceptable? Possibly, if someone decides it is:** "You can instead decide to accept some staleness. But an acceptable old answer is still an old answer."
- Concretely, a ticket can show "ok" or "at-risk" for up to 60 seconds after it has breached.
- Whether that's fine is a product and on-call call, not a technical one. The section doesn't tell me who makes that call or how.
- If the logging from (b) is still inside the function, the TTL doesn't fix it. Lines still disappear on hits within the window.
- The fix from (a), caching the deadline and comparing with `now` live, would make the TTL unnecessary.

## 4. Where the section left me unsure

- **Choosing between the two host-setting remedies.** "Make it an explicit input" and "reuse only while it cannot change" are both offered for (c), with no guidance on choosing. To decide confidently I'd need to know whether the cache is shared across servers, and whether the authors consider "the process's TZ never changes" good enough.
- **How to know a value "cannot change".** Is the time zone fixed for the process? What about tz database updates, or DST? I *think* DST is already handled by `getHours` for a given `ms`, but the section doesn't say.
- **What counts as "required work".** The definition hinges on whether "someone relies on" the effect. An unread debug log is apparently fine, and an audited one isn't. That's a judgment call about other people's dependencies, and in (b) I only know because the case tells me. In real code I'd need a way to find out who relies on a log, metric or write.
- **"Put required work where…" doesn't say where.** Caller? Wrapper? Post-cache hook? For (b) I also need the intended logging frequency (per render or per transition), and the section doesn't touch that.
- **Who decides staleness, and against what.** For (d), is 60 seconds acceptable for SLA breach display? The section says it's "a separate decision" but gives no criteria.
- **Is the first sentence a definition of "pure" or a definition of "safe to reuse"?** It differs from the textbook one ("no side effects"): it excludes only *required* work. I wasn't sure whether the book is redefining purity or narrowing it on purpose for caching.

## 5. Clarity and voice

**Sentences I had to reread:**
- "A pure calculation gives the same result for the same input values, without also doing required work, such as writing a record someone relies on." The "without also doing" clause dangles. On first read I took it to mean the calculation gives the same result *without* doing the work, i.e. it's not needed. Something like "and doesn't do work someone relies on" would read straight.
- "what could change the answer without changing those inputs". "Those inputs" points back to "input values" a sentence earlier. It works, but I had to look back.
- "You can instead decide to accept some staleness." Instead of what? Instead of making it pure? Instead of not caching? "Instead" has no clear target, because the previous sentence is about function signatures.

**Terms used without explanation:**
- "required work" is coined in the first sentence and only defined by one example.
- "host setting" gets no concrete example. One word, "time zone", would anchor it.
- "staleness" is clear enough, but "how stale it may be" with no mention of TTL or expiry leaves the mechanism implicit.

**Flow and voice:**
- "An ordinary TypeScript function signature doesn't prove a function pure." This is true and relevant, but it's dropped between the remedies and the staleness caveat with no bridge. It reads like a bullet point that lost its bullet.
- The second paragraph is a run of imperatives: "Make…", "If…, reuse…", "If…, reuse…", "Put…". Then three short declaratives. It reads like a checklist or a style guide, not like Typeworth talking. Nothing in it sounds like a person: no "I", no example, no aside. The first paragraph's "ask two questions" has a bit more voice.
- "But an acceptable old answer is still an old answer" is the one line with some personality. It's the line I'll remember.

**Overall:** the test is strong and I could apply it to all four cases. The remedies are mostly actionable. The weak spots are the unnamed "host setting", the missing "where" for required work, and the checklist tone of the second paragraph.
