# Reader report: Chapter 18, "The Principle" (draft 2, first-time read)

Draft 2 (`39cfaeb3…`), 2026-10-22. A fresh, isolated reader had only the Principle extract and the
earlier chapters stated as prerequisites. It used the same prompt and the same four cases as the
draft-1 read. The report is copied verbatim.

---

## 1. The rule, quoted

The test:
> "Before reusing an earlier answer, ask two questions: what could change the answer without changing those inputs, and what required work would disappear if the call didn't run?"

The definition it rests on:
> "A pure calculation gives the same result for the same input values, without doing other work that someone needs to observe."

The remedies:
> "Make anything that can change the answer an explicit input. If you hold it outside the call, reuse an answer only while it stays fixed. Put required work where returning a saved answer cannot skip it."

Two cautions:
> "An ordinary TypeScript function signature doesn't prove a function pure."
> "And an acceptable old answer is still an old answer. Deciding how stale it may be is a separate decision from making the calculation pure."

**Is the rule explicit and testable?** Yes. The two questions are concrete. I can stand in front of any function I'm about to cache and answer them. The trigger, "before reusing an earlier answer", is also clear.

**Can I act on the remedy?** Mostly. "Make anything that can change the answer an explicit input" tells me what to do with code. "Put required work where returning a saved answer cannot skip it" says where the work goes, but not how. The weakest one is "If you hold it outside the call, reuse an answer only while it stays fixed." I can't tell what "it" refers to, and for the most common hidden input (the clock), "while it stays fixed" seems to mean "never." The last sentence then reopens the door to stale answers. So the remedy works for config-like hidden inputs and leaves me guessing for time.

## 2. In my own words

A function is only safe to cache if two things hold. Its answer depends only on what you pass in, and running it does nothing anyone relies on. Before caching, look for anything that could change the answer while the arguments stay the same: the clock, the environment, global state. Also look for any side effect that a cache hit would silently skip. Turn the hidden things into parameters, or at least only reuse while they can't have changed. Move the side effects out to a place that runs every time. Don't trust the type signature to tell you any of this. And if you decide some staleness is fine, that's a separate product decision. Being acceptably stale doesn't make the function pure.

## 3. Applying it

**(a) `slaStatus(ticket)` cached by id + revision, reads `Date.now()`.**
- Not safe. The first question, "what could change the answer without changing those inputs", has an immediate answer: the current time. The same ticket revision goes from "ok" to "at-risk" to "breached" while the cache key stays the same. The dashboard would show "ok" forever for a ticket nobody touches.
- What to change: "Make anything that can change the answer an explicit input". So the function becomes `slaStatus(ticket, now)`. Then the cache key has to include `now`, and the remedy says "reuse an answer only while it stays fixed". Taken literally, that kills the cache, because `now` never stays fixed. The section doesn't tell me how to keep a useful cache here. Two options I can think of: key on a coarse time bucket, or compute the next time the status flips and reuse until then. Neither is in the text. The rule correctly tells me the current cache is wrong. It doesn't tell me what a good cache looks like.

**(b) Same function also logs on "at-risk"; on-call depends on the logs.**
- Not safe, for a second reason. The second question asks "what required work would disappear if the call didn't run?" The answer is the log line, and the phrase "someone needs to observe" fits on-call exactly. On a cache hit, the dashboard shows "at-risk" with no log line, so the record on-call uses to reconstruct the dashboard is now missing entries.
- What to change: "Put required work where returning a saved answer cannot skip it." Take the logging out of `slaStatus`. Put it in the code that shows the result, which runs whether the value was cached or freshly computed. Then `slaStatus` returns a status and does nothing else. One thing the rule doesn't settle: should the log fire on every display or only when the status changes? That depends on what on-call actually needs, so it's a requirements question, not a purity question.
- The hidden input from (a) is still there. Fixing the logging doesn't fix the clock.

**(c) `deadlineFor(ticket)` uses `getHours()` / `getDay()`, runs on two servers.**
- Not safe as claimed. The function reads no clock and logs nothing, so a quick glance passes both questions. But `getHours()` and `getDay()` give local-time values. The local time zone of the host process changes the answer without changing the ticket. So do its DST rules and the tz database version. Two servers in different time zones (or one on UTC, one not) give different deadlines for the same ticket. This is exactly the case for "An ordinary TypeScript function signature doesn't prove a function pure". The signature `(ticket) => number` looks pure and isn't.
- What to change: "Make anything that can change the answer an explicit input". So the function becomes `deadlineFor(ticket, timeZone)`, or takes the business calendar as a parameter. Inside, it would compute hours in that zone explicitly, for example with `Intl` or UTC methods plus a known offset, instead of whatever the host has. The section doesn't help with the mechanics. You could also argue from "If you hold it outside the call, reuse an answer only while it stays fixed" that a per-process cache is fine, because the process time zone doesn't change. That breaks if the cache is shared between servers, or if two servers serve the same user. A holiday calendar, if one exists, is another hidden input, but the case doesn't mention one, so I'm unsure.

**(d) 60-second TTL on the cache from (a).**
- Is the function pure? No. "And an acceptable old answer is still an old answer." The TTL changes how long a stale answer can live. It doesn't change the fact that `Date.now()` is a hidden input.
- Is the cache acceptable? Maybe, but that's "a separate decision from making the calculation pure". It's acceptable if the product can live with a ticket showing "ok" for up to 60 seconds after it breached. With a TTL in place, the honest change is still to make `now` a parameter, and then treat the 60 seconds as a stated tolerance rather than a correctness fix. If the logging from (b) is still inside the function, the TTL makes nothing better: on-call still loses log lines on every hit within the window.
- There is a tension in the text here. "reuse an answer only while it stays fixed" sounds like a TTL on a clock-dependent value is forbidden. The final two sentences sound like it's allowed as long as you call it what it is. I lean toward the second reading, but I had to choose.

## 4. Where the section left me unsure

- **The clock.** It's the most common hidden input, and the remedy breaks down on it. Making `now` explicit is clear. After that, "reuse … only while it stays fixed" seems to mean no caching at all. To decide (a) and (d) with confidence I'd want one sentence on what to key on when the hidden input is time. Is it a bucket, a flip time, or "pick a staleness budget and own it"?
- **"only while it stays fixed" versus "acceptable old answer".** Is the second an exception to the first, or a different case? I can't tell whether the TTL is allowed by the rule or allowed despite it.
- **What "required work" covers.** Logging is clearly in. Is metrics in? Is a cache-warming side effect? Is "someone needs to observe" the test? If so, say that the two phrases mean the same thing.
- **Where hidden inputs end.** Does the process time zone count? The tz database version? Locale? Case (c) seems to say yes, but the section never names environment or host configuration as a category. It gives no examples of hidden inputs at all, so I was working from my own experience.
- **"same input values" for objects.** After the immutability chapter: if `ticket` is mutated in place without bumping the revision, is that a hidden input? I assume yes, but the section doesn't say whether "values" means structural or by reference.
- **How to move required work.** "Put required work where returning a saved answer cannot skip it." Is that the caller? A wrapper around the cache? The section gives a goal, not a place.

## 5. Clarity and voice

- **Reread:** "If you hold it outside the call, reuse an answer only while it stays fixed." "It" could be the input, the answer, or the cache. I worked out that it means "if you keep the hidden value as ambient state instead of a parameter," but only on the second pass. "Hold" is also an unusual verb here.
- **Reread:** "without doing other work that someone needs to observe." "Other work" is vague on first read. Does it mean side effects? Any effect? Only observable ones? The qualifier "someone needs to observe" carries the meaning and is a good idea, but it's tucked at the end.
- **Terms without explanation:** "required work" in paragraph two seems to be the same thing as "other work that someone needs to observe" in paragraph one. Two names for one idea made me wonder if they were different. The text also slides between "pure calculation", "pure", and "calculation" without saying they're the same. "Explicit input" is fine.
- **Sounds like documentation:** The second paragraph is six imperative or declarative sentences in a row with no example, no ticket, no time zone, nothing concrete. It reads like a style guide, not Eli talking. "Put required work where returning a saved answer cannot skip it" is the most rulebook-like line. "An ordinary TypeScript function signature doesn't prove a function pure" is true but sounds like a lint rule.
- **Sounds like a person:** "And an acceptable old answer is still an old answer" has rhythm and a point of view. It's the line I'll remember. The chapter title "The Ticket Hadn't Changed" also works well: it names the trap in case (a) before the rule does.
- **Overall:** The test (two questions) is sharp and I could apply it right away. The remedies get more abstract as they go. The one hidden input every reader will think of first, the clock, is where the remedy becomes ambiguous.
