# Reader report: Chapter 21, "The Principle" (draft 2, first-time read)

Draft 2 (`e53251d7…`, `7ce37b2`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–20 stated as prerequisites. The prompt and the four cases were the same as
the draft-1 read. It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing.
The report is copied verbatim.

---

## 1. The rule, quoted

The section has two paragraphs and several separate rules:

1. "A higher-order function takes a function or returns one." This is a definition, not a rule, and it is testable.
2. "A wrapper can keep the call's types while changing what it skips, repeats or leaves running. Ask whether the operation allows those changes." This is the main rule. You can apply the first half mechanically: list what the wrapper skips (debounce, cache), repeats (retry) and leaves running (timeout). The second half, "ask whether the operation allows", tells you to ask the question but gives no way to answer it. It doesn't say who to ask or what counts as "allows".
3. "A rejection doesn't prove the work didn't happen." A factual claim. It is clear and testable.
4. "If the owner can't establish safe repetition, don't retry an ambiguous failure; report the outcome as unknown." This is the most testable rule, but it uses three terms it never defines:
   - "Owner": the owner of the operation, or of the wrapper?
   - "Establish safe repetition": a doc promise, an idempotency key, or a test?
   - "Ambiguous failure": I assume a timeout or network error as opposed to a validation 4xx, but the section doesn't say.
   "Report the outcome as unknown" is a clear action, but it gives no shape. Is it a third result variant, or a distinct error type?
5. "For stacked wrappers, follow the outside call inward, then the failure back out to find who retries and who stops waiting." This is a procedure and it can be applied mechanically. I applied it in (b) and it worked.
6. "Stopping the wait doesn't stop the work: an `AbortSignal` helps only if the operation uses it." Clear and testable. My node run (case b) confirmed the first half.
7. "Call a method through its instance; a generic wrapper can accept a detached method, even with an explicit `this` parameter, and lose its receiver." The instruction is mechanical: wrap `() => obj.m()` and not `obj.m`. The claim is testable, and I confirmed it with tsc (case d).
8. "Try each public overload on the returned function, too. A wrapper that infers one argument tuple and result can retain only the last overload." Mechanical and testable. Confirmed with tsc (case c).

Summary: rules 3 and 5–8 are explicit and checkable. Rules 2 and 4 carry the main idea, and their key verbs ("allows", "establish") are left to judgment.

## 2. In your own words

A wrapper such as retry, timeout, debounce or logging returns a function with the same signature as the original, so the compiler sees nothing different. Its runtime behaviour can still be different: it may run the work several times, skip calls, or stop waiting while the work keeps going. Before wrapping, ask whether the operation can survive that. Retry is the dangerous one, because a failed promise may still mean the side effect happened. Unless whoever owns the operation can guarantee that a repeat is harmless (for example through idempotency), don't retry a failure whose cause you can't tell, and tell the caller "we don't know if it happened" rather than "it failed". When wrappers are stacked, trace the call from the outside in and the failure from the inside out to see which layer retries and which one gives up. Giving up doesn't cancel anything unless the operation honours an abort signal. Finally, two type-level traps: a detached method loses `this` even though it type-checks, and a generic wrapper keeps only the last overload.

## 3. Apply it

**(a) `withRetry(chargeCard, 3)`**
- What the Principle says: this wrapper "repeats", so "ask whether the operation allows those changes". Charging a card is the textbook case where it doesn't by default. "A rejection doesn't prove the work didn't happen": a timeout or dropped connection could follow a successful charge.
- Words I relied on: "If the owner can't establish safe repetition, don't retry an ambiguous failure; report the outcome as unknown."
- What I check: whether the other team's package documents idempotency, accepts an idempotency key, or distinguishes declined/validation errors from transport errors.
- What I would change:
  - If there is an idempotency key: pass the same key on every attempt, and retry only rejections classified as transient.
  - If there isn't one: no retry at all on ambiguous failures. Return something like `{ kind: "unknown", orderId }` so the caller can reconcile, for example by querying the charge status later.
- What I had to decide myself:
  - Who the "owner" is. I took it to be the other team.
  - What counts as "establishing" safety. I took it to be a documented contract or key, not "it seems fine".
  - Which errors are "ambiguous". The section gives no taxonomy.
  - Whether a clear decline may be retried. I said no: it's not ambiguous, it's a definite no, and retrying won't help.
  - How to represent "unknown" in types. Probably a union variant, since earlier chapters covered returned errors, but the section doesn't say.

**(b) Two compositions.** I ran both in node with simulated timeouts (1 s timeout, 3 s work).
- `withRetry(withTimeout(f, 2000), 3)` means **each attempt gets 2 seconds**. Following the call inward: retry calls timeout, which calls f. Following the failure outward: the timer rejects the attempt, and retry starts another. The caller can wait up to about 3 × 2 s.
  - What keeps running: every timed-out attempt. In my run, all three attempts of a 3 s job "finished anyway" after the caller got its rejection, so the work ran three times. That is exactly the "three messages" scenario.
- `withTimeout(withRetry(f, 3), 2000)` means **the caller waits at most 2 seconds**. The outer timer rejects the caller, while the retry loop inside is still alive.
  - What keeps running: the current attempt, and the retry loop itself. In a second run, with attempts that fail fast (0.8 s), the caller was rejected at 1.0 s and the loop then started attempt 3 at 1.6 s, after the caller had given up. Also, a slow attempt that hangs rather than rejects never triggers a retry in this composition.
- In both cases, stopping requires threading an `AbortSignal` into `f` (and into the retry loop, so it stops scheduling attempts), and that only works if `f` uses it.
- Words I relied on: "follow the outside call inward, then the failure back out" and "Stopping the wait doesn't stop the work."
- What I had to decide myself: the section doesn't say which composition is right. That depends on the caller's latency budget and on whether repetition is safe (back to (a)).

**(c) `withLogging(parse)`**
- Rule: "Try each public overload on the returned function… can retain only the last overload."
- I confirmed it with tsc. `withLogging(parse)("x")` fails with `TS2345: Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'`. The `Uint8Array` call compiles and returns `Ast[]`. So callers lose the string overload, and its `Ast` return type, completely.
- Fixes: annotate the result as `typeof parse`. My `const p2: typeof parse = withLogging(parse) as typeof parse` compiles, and both overloads work. Other options are to write the logged version with explicit overload signatures, or to log inside `parse`.
- What I had to decide myself:
  - The fix. The section diagnoses the problem but prescribes none.
  - Whether a cast is acceptable. The `as` is honest here only because logging doesn't change arguments or results; a wrapper that did would make the cast a lie.

**(d) `debounce(editor.save, 300)`**
- What changes:
  - Skipping: calls inside the 300 ms window are dropped, and only the last arguments are kept.
  - Timing: the save now happens later, asynchronously.
  - Return value: debounce returns `void`, so any promise or result from `save` is lost. Errors move out of the caller's reach. In my run, the exception surfaced as an uncaught exception, not anything the caller could catch.
- What breaks: the receiver. I confirmed it with tsc. `debounce(editor.save, 300)` compiles with no error even when `save` declares `this: Editor`, while calling the detached `editor.save` directly is rejected (`TS2684`). In node, the debounced call threw `Cannot read properties of undefined (reading 'n')`. Fix: `debounce((r?: string) => editor.save(r), 300)` (compiles).
- Words I relied on: "Call a method through its instance", "even with an explicit `this` parameter", and "changing what it skips".
- What I had to decide myself:
  - Whether skipping saves is acceptable. Losing an intermediate save is probably fine; losing the final one on page close is not. That needs a flush, which the section doesn't mention.
  - Whether callers depended on `await save()`.

## 4. Where the section left me unsure

1. Who is "the owner" in "If the owner can't establish safe repetition": the owner of the operation, the wrapper author, or the caller?
2. What counts as "establishing" safe repetition? A doc promise, an idempotency key, a test?
3. "Ambiguous failure" is never defined. Which rejections are ambiguous and which are definite? Can a definite failure be retried freely?
4. What does "report the outcome as unknown" look like in code: a union variant, an error subclass? And who resolves it afterwards?
5. "Ask whether the operation allows those changes" gives a question and no criteria for answering it, except in the retry case.
6. The section never says which order of `withRetry`/`withTimeout` is preferred, or that the two orders mean different things. I worked that out myself using the procedure.
7. `AbortSignal` is mentioned in passing. It doesn't say who should create the signal, or whether a wrapper should pass it through.
8. The overload rule says what goes wrong but gives no remedy (annotate with `typeof f`? write overloads by hand?).
9. "Leaves running" is introduced as a category but tied only to timeouts. Does debounce's pending timer, or a cache's in-flight promise, also count?
10. The detached-method sentence is long, and I wasn't sure on first read whether "even with an explicit `this` parameter" meant TypeScript would catch it (it doesn't).

## 5. Clarity and voice

**Sentences I had to reread:**
- "A wrapper can keep the call's types while changing what it skips, repeats or leaves running." Whose skipping and repeating? I took it to mean the calls or the work, but "it" could be read as the wrapper skipping its own steps.
- "Call a method through its instance; a generic wrapper can accept a detached method, even with an explicit `this` parameter, and lose its receiver." It packs three ideas into one sentence (the instruction, the type hole, the runtime failure). "Even with" is ambiguous until you test it.
- "For stacked wrappers, follow the outside call inward, then the failure back out to find who retries and who stops waiting." Clear once parsed, but "who" refers to wrapper layers, which took a second.
- "Otherwise you can have a failed job and a customer with three messages." I liked it, but "otherwise" attaches to the whole previous rule, and "three messages" is an example the reader has to imagine (I assume three retries means three sends). It lands, but only after you supply the scenario.

**Terms used without explanation:** "owner", "safe repetition", "ambiguous failure", "receiver", "detached method", "argument tuple", and `AbortSignal` (not covered in the chapters I'm assumed to have read). "Receiver" in particular may be new to readers who only know `this`.

**Voice:** the second-to-last sentence of paragraph 1 ("Otherwise you can have a failed job and a customer with three messages") and the line "A rejection doesn't prove the work didn't happen" sound like Gilad: a person who has been paged for a double charge and thinks about who recovers. Most of paragraph 2 reads like a checklist or documentation: four separate imperatives in a row, none with his outlook behind them. The overload and `this` rules in particular feel bolted on. They are type-level traps, not failure-and-recovery concerns, so they don't sound like the architect's question about who diagnoses and recovers. The section would read more like him if paragraph 2 linked these back to the cost (for example, a save silently failing at 2 a.m. because `this` was undefined).

Scratch files I used: /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read2/p/t1.ts (the overload and `this` checks), /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read2/p/t2.mjs and /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read2/p/t3.mjs (the timeout/retry ordering and the debounced method losing its receiver).
