# Reader report: Chapter 21, "The Principle" (draft 3, first-time read)

Draft 3 (`50905ab9…`, `7efd917`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–20 stated as prerequisites. The prompt and the four cases were the same as
the earlier reads. It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing.
The report is copied verbatim.

---

## 1. The rule, quoted

The section is two paragraphs. Here are the rules it states, in order:

1. "A wrapper can keep the call's types while changing what it skips, repeats or leaves running. Ask whether the operation allows those changes."
   This is explicit as a question, but you can't apply it mechanically. It doesn't say how to decide whether the operation "allows" a change, or which wrappers skip, which repeat and which leave work running. I had to supply the mapping myself: debounce/cache skip, retry repeats, timeout leaves running.
2. "A rejection doesn't prove the work didn't happen."
   This is a fact, not a rule. It's clear.
3. "Ask the operation's owner for a guarantee that repeating it is safe, such as a key the operation honors to prevent duplicate work."
   This is explicit and testable: either you have the guarantee in writing or you don't. Two things are missing. It never says *where* the key must be created (once, outside the retry loop). It also never says "idempotency key", which is the word I'd search for.
4. "Without that guarantee, don't retry a failure where the work may already have happened, like a timeout or a lost reply. Report the outcome as unknown."
   This is the most testable rule in the section: no guarantee plus a timeout or lost reply means no retry. It's vague on two points. It doesn't say how I tell which failures fall into "may already have happened" when I can't see inside the operation. It doesn't say what "report as unknown" looks like in types. After the earlier chapters on returned errors I expected a variant like `{ kind: "unknown" }` and didn't get one.
5. "For stacked wrappers, follow the outside call inward, then the failure back out to find who retries and who stops waiting."
   This is a mechanical procedure and it worked well for case (b).
6. "Stopping the wait doesn't stop the work: an `AbortSignal` helps only if the operation uses it."
   This is explicit. It leaves out that the wrapper also has to pass the signal down, and a retry loop has to check it.
7. "The compiler can accept a detached method through a generic wrapper, even with an explicit `this` parameter. Call through the instance so the wrapper doesn't lose the receiver."
   This is explicit. The fix is "call through the instance", but the section never shows what that looks like (`() => editor.save()` or `.bind`). I confirmed the "can accept" claim; see (d).
8. "Try each public overload on the returned function, too. A wrapper that infers one argument tuple and result can retain only the last overload."
   This is a mechanical test, and it's good. It doesn't say what to do once the test fails.

Overall, rules 3–5 and 8 are concrete checks. Rule 1, the frame for all the others, is the vaguest.

## 2. In your own words

Wrapping a function can leave its type signature exactly as it was while changing what actually happens: some calls get dropped, some get repeated, and some keep running after the caller has stopped listening. The types won't warn you about any of this.

The dangerous case is a retry. A failure, especially a timeout, doesn't mean the work wasn't done. Retry only if the operation's owner guarantees that repeats are safe, for example by honoring a deduplication key. If they don't, give up and tell the caller "we don't know whether it happened".

When wrappers are stacked, trace the call inward and the failure outward to see which layer retries and which layer stops waiting. Remember that stopping the wait doesn't stop the work unless the work listens for an abort signal.

Two type-level traps: a method passed to a wrapper loses its `this` even though the compiler accepts it, and an overloaded function passed to a generic wrapper keeps only its last overload. Call methods through the instance, and test every overload on the wrapped result.

## 3. Apply it

**(a) `const charge = withRetry(chargeCard, 3)`**

What the Principle tells me to do:
- Ask the owning team whether `chargeCard` is safe to repeat (rule 3).
- Without a guarantee, don't retry failures where the charge may have gone through, and report "unknown" (rule 4).

What I'd check:
- Does `chargeCard` accept a deduplication key, and does the provider honor it? I want that from the owners, not inferred from a parameter name.
- Which rejections does `chargeCard` produce? Which ones mean "definitely not charged" (validation error, card declined before submission) and which mean "maybe charged" (timeout, connection reset after the request was sent)?

What I'd change:
- If there's a key: generate it once per order, *outside* `withRetry`, and pass the same key on every attempt. A key generated inside the retried function defeats the purpose. The Principle doesn't say this; I had to work it out.
- If there's no key: remove the blanket retry. Retry only error kinds the owners confirm happen before any work. For a timeout or lost reply, return an "unknown" result so a person or a reconciliation job can check the charge.

Words I relied on: "a key the operation honors", "like a timeout or a lost reply", "Report the outcome as unknown".

What I decided myself:
- How to classify errors. The Principle gives no method, and with another team's package I depend entirely on their docs.
- Where to create the key.
- What "unknown" looks like as a type.
- Whether `3` means three attempts or three retries. This doesn't matter much for the Principle, but it's a common ambiguity.

**(b) Retry and timeout ordering**

What the Principle tells me to do: rule 5. Follow the call inward, then the failure outward, and find who retries and who stops waiting.

I tested this with node, using 200 ms in place of 2000.

`withRetry(withTimeout(f, 2000), 3)` means **each attempt gets 2 seconds**:
- The call enters the retry, then the timeout, then `f`. A failure leaves `f`, the timeout converts slowness into a rejection, and the retry catches it and starts again.
- The caller can wait up to about 6 seconds.
- After the caller gets a rejection, the last attempt is still running. Worse, earlier timed-out attempts are *also* still running while later ones start, so attempts overlap. Run:
  ```
  0ms start A#1
  203ms start A#2
  303ms finish A#1
  406ms start A#3
  504ms finish A#2
  609ms caller A rejected: timeout
  716ms finish A#3
  ```
- This composition retries timeouts, which rule 4 forbids without a repeat-safety guarantee. With a payment, it's the "three messages" outcome.

`withTimeout(withRetry(f, 3), 2000)` means **the caller waits at most 2 seconds**:
- The timeout stops waiting, but the retry loop underneath never learns about it. It keeps starting new attempts after the caller has given up. Run with an `f` that fails every time:
  ```
  1ms start #1
  153ms fail #1
  153ms start #2
  203ms caller B rejected: timeout
  305ms fail #2
  305ms start #3
  457ms fail #3
  ```

What I decided myself: the fix. For the second composition, the timeout would need to pass an `AbortSignal` that the retry loop checks before each attempt and that `f` honors. Rule 6 hints at this but only mentions "the operation", not the retry layer in between.

Words I relied on: "follow the outside call inward, then the failure back out", "Stopping the wait doesn't stop the work".

**(c) `withLogging(parse)`**

What the Principle tells me to do: "Try each public overload on the returned function."

I did, and the compiler confirms the loss. `withLogging(parse)` is typed from the last overload only, `(x: Uint8Array) => Ast[]`. Calling it with a string fails:
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'.
```
So string callers lose the ability to call it at all. Byte-array callers keep their call.

What I'd do (the Principle doesn't say, so I decided):
- Type the wrapped result as `typeof parse` with an assertion at the one wrapping site. This compiled: `const lp2: typeof parse = withLogging(parse as (x: string | Uint8Array) => Ast | Ast[]) as typeof parse;`, and `lp2("x")` returned `Ast`.
- Or write an overloaded wrapper by hand.
- Either way, add a test that calls each overload.

**(d) `debounce(editor.save, 300)`**

What the Principle tells me to do: "Call through the instance so the wrapper doesn't lose the receiver", and ask whether the operation allows skipping.

I checked the type claim with the compiler. It accepted `debounce(editor.save, 300)` without error even with `save(this: Editor)` declared. I then ran it in node. It throws `Cannot read properties of undefined (reading 'saved')`, and the error surfaces as an uncaught exception inside the timer, 300 ms later, not at the call site. That's a nasty place for an error to appear. `debounce(() => editor.save(), 300)` worked.

Beyond `this`, here's what changes, which I reasoned out myself from "skips … leaves running":
- Intermediate saves are dropped. That's probably fine for a save, but someone has to decide it.
- The debounced function returns `void`, so callers can no longer await the save or see it fail. If `save` returns a promise, its rejection goes nowhere.
- A save can still be pending when the user closes the document or the app.

The Principle says a wrapper "can keep the call's types". Debounce usually *can't* keep the result type, and the section doesn't address that.

## 4. Where the section left me unsure

1. How do I decide which rejections mean "the work may already have happened" when I can't see inside the operation? Is the default "assume it may have"?
2. What does "Report the outcome as unknown" look like in TypeScript? Is it a third variant beside success and failure? Earlier chapters on returned errors made me expect a type here.
3. Where does the deduplication key come from, and must it stay the same across attempts? This is the crux of making retries safe, and it isn't stated.
4. Can I retry failures that definitely happened before any work, such as a refused connection or a 400 response? The rule implies yes but never says so.
5. "Ask whether the operation allows those changes": which wrappers produce which change? Debounce and cache aren't named. I assumed skip means debounce/cache, repeat means retry, and leaving work running means timeout.
6. Does "can retain only the last overload" mean always or sometimes? In my test it was always the last.
7. Once the overload test fails, what's the recommended fix: an assertion to `typeof f`, a hand-written overloaded wrapper, or not wrapping overloaded functions at all?
8. "Call through the instance": does `.bind(editor)` count, or only an arrow function?
9. With `AbortSignal`, who must cooperate: just the operation, or every wrapper in between, such as the retry loop?
10. "a failed job and a customer with three messages": I read this as "the job reports failure even though it ran three times". I wasn't sure on first pass whether "failed" and "three messages" were two separate bad outcomes.

## 5. Clarity and voice

**Sentences I had to reread:**
- "A wrapper can keep the call's types while changing what it skips, repeats or leaves running." I had to work out that "the call's types" means the function signature and that "it" is the wrapper. "Leaves running" only made sense after reading paragraph 2.
- "Retry it anyway and you can have a failed job and a customer with three messages." The image is vivid, but the job "failing" and the customer receiving three messages read as contradictory until I worked out the sequence.
- "The compiler can accept a detached method through a generic wrapper, even with an explicit `this` parameter." The "can" hedge made me unsure whether this always happens. It did in my test.
- "A wrapper that infers one argument tuple and result can retain only the last overload." It's dense, and "retain" is ambiguous: is the rest gone or merely hidden?

**Terms used without explanation:**
- "detached method": I know what it means, but the book should name it where `this` is lost.
- "receiver"
- "a key the operation honors": the idea is idempotency or a deduplication key. The section never names it, which hurts searchability.
- "lost reply"
- `AbortSignal`: it isn't shown or introduced here, so I couldn't tell whether an earlier chapter covered it.

**Voice:**
- The opening sentence, "A higher-order function takes a function or returns one.", reads like a glossary entry. It's odd to see a definition in a Principle section at the end of a chapter.
- Paragraph 1 does sound like Gilad. It's about failure and recovery: "Report the outcome as unknown" and the three-messages customer are a systems architect's concerns, and the closing line has a person behind it.
- Paragraph 2 reads more like a checklist stitched together. It covers three unrelated topics (stacking order, `this`, overloads) joined by "too", in short imperative sentences with no personal stake. The `this` and overload rules in particular sound like documentation rather than Gilad. He has a natural angle on them that the text doesn't take: these failures surface late and far from the cause, like the uncaught timer error.
- The rules are stated up front and are mostly testable. The weakest spot is the governing question, "Ask whether the operation allows those changes", which needs either a criterion or a named list of wrapper types.

Scratch files used for the checks are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read3/p/`: `c.ts` for the type checks, `b.mjs` and `b2.mjs` for the node runs.
