# Reader report: Chapter 21, "The Principle" (draft 1, first-time read)

Draft 1 (`21a2fe18…`, `e3e16df`), 2026-10-25. A fresh, isolated reader had only the Principle
extract, with Chapters 1–20 stated as prerequisites, and the four cases from the
[plan](../CH21-PLAN.md). It could run only the book's TS 7.0.2 binary and Node 22, and installed
nothing. The report is copied verbatim.

---

## 1. The rule, quoted

The section is two short paragraphs, both spoken by Gilad. These are its rule sentences:

1. "A higher-order function takes a function or returns one." This is a definition, not a rule. It can be tested.
2. "A wrapper can keep its arguments and result type while changing when it runs and how often." This describes what a wrapper is. "Can" makes it weak: it doesn't say wrappers *must* keep the result type, and debounce doesn't (see 3d).
3. "Before wrapping an operation, check what the wrapper may skip, repeat or leave running, and whether the operation allows that." This is the core rule, and the most mechanical one. The three verbs work as a checklist: debounce or throttle skips calls, retry repeats them, and a timeout leaves work running. It is explicit and testable for each wrapper. "Whether the operation allows that" is the part you can't settle mechanically.
4. "For retries, get the operation's owner to establish that repeating it is safe." It's explicit about *who* has to answer, but not *how*. Should it be a doc comment, an idempotency key in the signature, a type? It also doesn't say what to do when there is no owner, or when the owner says no.
5. "A timeout only stops waiting unless someone also stops the work." The claim is testable, and I confirmed it below. The sentence itself is awkward.
6. "Passing a cancellation signal isn't enough; the operation has to use it." Explicit. You can check it by reading the operation, but only when you can see inside it.
7. "With stacked wrappers, follow the outside call inward, then follow a failure back out. Find which wrapper gets to call the operation again and which one stops waiting." This is a usable procedure. I applied it mechanically to (b) and it worked.
8. "Keep a method attached to its instance, or make the wrapper forward its receiver." Explicit. "Forward its receiver" isn't explained in this section.
9. "Check the returned signatures before giving the function to callers who need its overloads." It says *when* to check but not *what* you're looking for. A reader of Ch. 20 can supply it: only the last overload survives inference.
10. "The same-looking call can do different work." This is a closing summary, not a rule, and it's too vague to apply on its own.

Overall, rules 3, 7 and 8 can be applied mechanically. Rules 4 and 9 leave the most for the reader to decide.

## 2. In your own words

When you wrap a function, the call site looks the same, but the wrapper decides how many times the function really runs, when it runs, and whether anything is still running after you stop waiting. Before wrapping, ask three questions:
- What can it drop?
- What can it run twice?
- What can it abandon while the work is still going?

Then ask whether the wrapped operation can tolerate each answer. Only the operation's owner can say whether running it twice is safe. A timeout gives up on the result; it doesn't stop the work, unless the work listens for cancellation. When wrappers are stacked, trace the call inward and the failure outward to see who retries and who gives up. Two separate things can break without the call looking any different: the `this` binding of a method, and the overloads of a function's type.

## 3. Apply it

### (a) `const charge = withRetry(chargeCard, 3)`

**What the Principle says to do.** Retry *repeats*, so the question is whether `chargeCard` allows being repeated. I can't see inside it, so by rule 4 its owners have to establish that repeating is safe. Until they do, I shouldn't ship this.

**Words I relied on.** "may ... repeat", "whether the operation allows that", and "get the operation's owner to establish that repeating it is safe".

**What I had to decide myself:**
- **What counts as "establishing" it.** I'd accept an explicit contract: the function takes an idempotency key (for example `chargeCard(order, { idempotencyKey })`), or its docs say duplicate calls with the same order ID are deduplicated. A verbal "should be fine" wouldn't count.
- **The ambiguous rejection.** A rejection doesn't tell you whether the charge happened. A network timeout after the server charged the card is the classic double-charge. The Principle hints at this through "leave running", but never says that a failure can arrive *after* the side effect.
- **What to change.** Remove the retry, or keep it only if the owner provides an idempotency key. Then generate the key once per order, outside the retry loop, so every attempt carries the same key. Optionally, retry only on errors the owner documents as "definitely not performed".
- **What to do if the owner says no.** The section doesn't say. My answer: don't retry, and surface the failure to someone who can reconcile it.

### (b) `withRetry(withTimeout(f, 2000), 3)` vs `withTimeout(withRetry(f, 3), 2000)`

**What the Principle says to do.** Follow the call inward, then the failure outward.

- `withRetry(withTimeout(f))`: the timeout is inside, so it wraps each single call to `f`. This means **"each attempt gets 2 seconds"**. The caller can wait up to about 3 × 2 s plus delays.
- `withTimeout(withRetry(f))`: the timeout is outside and wraps the whole retry loop. This means **"the caller waits at most 2 seconds"**.

**Checked with node** (`/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read1/p/b.mjs`). The setup: timeout 1000 ms, `f` takes 1500 ms and then rejects, retry count 3.

- **Retry outside, timeout inside:**
  - Attempt 1 times out at 1002 ms and attempt 2 starts at 1003 ms, while attempt 1 is still running. Attempt 1 only "finished work" at 1502 ms.
  - The caller got its rejection at 3005 ms.
  - Attempt 3 finished its work at 3505 ms, *after* the caller had been told it failed.
  - So two things happen: attempts **overlap** (duplicate concurrent work), and the last attempt keeps running after the caller gets the rejection.
- **Timeout outside, retry inside:**
  - The caller got its rejection at 1003 ms.
  - The retry loop kept going: it saw `fail1` at 1503 ms, **started attempt 2 and attempt 3 after the caller had already given up**, and finished at 4507 ms.
  - So the whole retry loop keeps running, including *new* attempts that nobody will ever observe.

This confirms rule 5 ("A timeout only stops waiting"). The fix the section points to is passing an AbortSignal that both `withRetry` (stop scheduling attempts) and `f` (stop the work) actually check. Rule 6 says the signal alone isn't enough.

**What I had to decide myself.** The section doesn't mention that retry-over-timeout causes *overlapping* attempts. "Leave running" plus "repeat" add up to concurrent duplicates, and I only noticed this from the node output.

### (c) `withLogging(parse)` with overloads

**What the Principle says to do.** "Check the returned signatures before giving the function to callers who need its overloads."

**Checked with tsc** (`/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read1/p/c.ts` and `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read1/p/c2.ts`):
- Inference used only the last overload, so `A = [Uint8Array]` and `R = Ast[]`.
- `p("x")` fails: `Argument of type 'string' is not assignable to parameter of type 'Uint8Array<ArrayBufferLike>'`.
- `p(new Uint8Array())` returns `Ast[]`.
- Callers lose the string overload entirely, so the string path is now a compile error.

**What I'd do:**
- Option 1: type the wrapper as `<F extends (...args: any[]) => any>(f: F): F` with an `as F` on the returned function. With that, both `p2("x"): Ast` and `p2(bytes): Ast[]` type-check. It costs one cast, plus the obligation to keep the wrapper truly transparent.
- Option 2: re-declare the overloads on the wrapped export.

**What I had to decide myself.** The section doesn't say which fix is endorsed, or whether the cast is acceptable in this book's terms. It also doesn't say what "check" means in practice. I hovered over and called the result with each overload's argument type.

### (d) `debounce(editor.save, 300)`

**What the Principle says to do:**
- "Keep a method attached to its instance, or make the wrapper forward its receiver."
- Debounce *skips*, so I also have to ask whether `save` allows skipping.

**Checked with node** (`/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read1/p/d.mjs`):
- `debounce(editor.save, 50)` threw `Cannot read properties of undefined (reading 'saved')`, because `this` was lost.
- `debounce(() => editor.save(), 50)` saved once for two calls.

**Checked with tsc.** `debounce(editor.save, 300)` compiles with no error. It still compiled when I annotated the method `save(this: Editor2)`. tsc only complained when I called the detached method directly (`g()`). It also allowed `const f: () => void = e2.save`. So the compiler won't enforce this rule for you, and the section doesn't warn about that.

**What changes besides `this`:**
- Calls inside the 300 ms window are skipped, and only the last call's arguments are used.
- The debounced function returns `void`. If `save` returned a Promise, callers can no longer await it or see its errors, so a failed save just disappears. This contradicts the "can keep its ... result type" sentence.
- A save that is still pending when the editor closes or the page unloads may never run.

**What I'd do.** Use `debounce(() => editor.save(), 300)`, or bind the method. Then decide with the owner whether a dropped or late save is acceptable, and add a flush-on-close.

**What I had to decide myself.** Everything after the `this` problem. The section's word "skip" got me there, but nothing in it connects skipping to a lost result or lost errors.

## 4. Where the section left me unsure

1. What concrete evidence counts as the owner "establishing" that repeating is safe, and what to do when the owner says it isn't safe or can't be reached.
2. That a rejection doesn't mean the work didn't happen (the ambiguous-failure problem for retries) is only implied.
3. "Forward its receiver" isn't explained here. I assume it means using a `function` wrapper and `fn.apply(this, args)`. It also doesn't say whether the types should carry `ThisParameterType`.
4. The section doesn't say TypeScript won't catch a detached method passed to a wrapper. I verified that it doesn't, even with an explicit `this:` parameter.
5. "Check the returned signatures": check them for what, and what's the recommended fix (cast to `F`, re-declare the overloads, or don't wrap)?
6. "Can keep its arguments and result type": debounce and timeout both change the *meaning* of the result (void, or a rejection that doesn't mean failure). Is that "keeping" the result type?
7. Whether the retry wrapper should itself honour the cancellation signal. My test showed it starting new attempts after the caller gave up, and the section only talks about "the operation" using the signal.
8. Overlapping attempts when the timeout is inside the retry: is this something the reader should look for under "repeat" or under "leave running"?
9. "The same-looking call can do different work": I couldn't tell which earlier point this sums up.

## 5. Clarity and voice

**Sentences I reread:**
- "A timeout only stops waiting unless someone also stops the work." The "only ... unless" construction trips. It's clearer as: "A timeout only stops the waiting; the work keeps going unless someone stops it."
- "With stacked wrappers, follow the outside call inward, then follow a failure back out." I understood it on the second pass, and it became useful once I applied it to (b).
- "Find which wrapper gets to call the operation again and which one stops waiting." "Gets to" reads as a privilege rather than a responsibility.
- "The same-looking call can do different work." Different from what? I wasn't sure what it referred back to.

**Terms used without explanation:**
- "receiver"
- "forward its receiver"
- "cancellation signal" (AbortSignal is never named)
- "operation's owner"
- "stacked wrappers" (clear from context)

It never says "idempotent". That might be deliberate, and "repeating it is safe" is clearer, but a reader who later meets the word won't connect it.

**Voice.** Some of it is clearly Gilad: "get the operation's owner to establish", "follow a failure back out", and asking who is responsible when things fail. But the second paragraph reads as a list of imperative bullet points strung into prose: "Find... Keep... Check..." With no example, no "I've seen", and no consequence named, it sounds more like a style-guide checklist than a systems architect talking. The first paragraph's opening definition ("A higher-order function takes a function or returns one") is textbook register, and an odd thing for an expert to say at the Principle stage, after the chapter has presumably already taught it.
