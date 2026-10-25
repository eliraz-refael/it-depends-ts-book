# Reader report: Chapter 21, full first read (draft 1)

Draft 1 (`21a2fe18…`, `e3e16df`), 2026-10-25. A fresh, isolated reader had the full chapter, with
Chapters 1–20 and the five speakers' pronouns stated as prerequisites. It could run only the book's
TS 7.0.2 binary and Node 22, on a fake clock, and installed nothing. The report is copied verbatim.

---

## 1. Overall

**Close.** I re-ran every timeline and compiler claim, and all of them match. Each scene sets up the next one, and the Turn (the gateway accepts at 1 s but replies at 3 s) changes the room's view. The remaining problems are small and local:
- one plot gap: Guy has `sendOnce` all along but only offers it in the Turn;
- two undefined references ("our interface … `inner.send`" and "a marker");
- the inconsistent "Gil"/"Gilad" and "Prof. Eli Typeworth"/"Eli Typeworth";
- one line in the Verdict whose present tense says the bug still happens;
- one Principle clause ("make the wrapper forward its receiver") that no scene shows.

None of these needs a structural rewrite.

## 2. Walkthrough

**Principle.** It is clear and testable: what a wrapper may skip, repeat or leave running; the owner decides whether a repeat is safe; a timeout only stops waiting; a signal only helps if the operation uses it. Two clauses are tested thinly or not at all:
- "Keep a method attached to its instance, or make the wrapper forward its receiver." No scene shows a wrapper forwarding `this`. The room only ever uses an arrow that closes over `client`. The second option is never shown.
- "Check the returned signatures before giving the function to callers who need its overloads." This appears only in the Additional Take. That is fine, but it means the Principle's last paragraph rests partly on material outside the debate.

**Three receipts for one failure.** The setup is efficient. "A rejection or a missing reply doesn't prove the message wasn't accepted" lands early and pays off later. Places I stopped or reread:
- `declare const send: Send; // The notification client's bound send operation.` Later, "The client has a cancellable send" and `GatewayClient.send(signal, notice)` appear. I had to work out that these are two different operations: the old one takes only the notice, the client method takes a signal too. A short clause such as "the old `send` was a notice-only adapter over the client" would prevent the double-take.
- "It has no two-second limit for the whole job." Reads fine, but it is the sentence that later makes the swapped order wrong. It might deserve a moment in dialogue rather than narration.
- Idan: "Which thing is done?" / Oded: "The call to the wrapper. I see where you're going." This is slightly cryptic. I reread it to connect "done" to "I clear the timer when we're done". It works, barely.
- Guy: "The other operation is still ours." I stopped here. "Ours" is ambiguous: still running, or still our responsibility? "The other operation is still running" says it plainly.
- The trace table is clear, and the note that the trace continues after the job has recorded its result is well placed.

**Give the operation something it can use.** The new `withTimeout` is introduced cleanly, and the TS2345 is explained well in Oded's line. Where I stopped:
- Guy: "I could put retry in a sender object implementing our interface. It holds the client and calls `inner.send`." Neither "our interface" nor `inner` has been introduced. Without code, the alternative is hard to picture.
- Guy: "Passing `client.send` to your generic wrapper compiles even with that `this` parameter. It doesn't bind the method." The claim is true (I checked), but the chapter never shows that line or what it does at runtime. It is told, not shown. One line of code plus a "TypeError at runtime" note would make the Principle's method clause concrete.
- "Gil runs the same three-second fixture…" Everywhere else he is Gilad.
- The narration "Aborting cancels its pending delivery and rejects its promise" usefully says what the fixture does.

**The Turn.** This is the strongest section. The two-event fixture table is clear. Idan's "We asked it to cancel the request, and treated that as permission to repeat the message" is the hinge, and it reads like a person talking. Where I stopped:
- Guy: "We have `sendOnce` for this gateway." This raised a question about the plot: why didn't the client's owner mention it when the room first saw three deliveries? See §4.
- Idan: "Adding a marker to an ordinary function wouldn't give it that behavior." Nobody has proposed a marker (a brand or flag type, presumably). It answers an argument that was never made. Either have someone propose it in a line, or drop the sentence.
- `runJob` v2's `if (keyedClient.shouldRetry(error)) return "unconfirmed"`. Its logic is that a retryable error can only escape `withRetry` once the attempts are used up, so "retryable" here means "exhausted". The narration says "those exhausted failures" but never gives that reasoning. One clause in dialogue would help readers who don't trace `withRetry`.
- "Its failure predicate allows retries for timeouts": the client's predicate must recognise the wrappers module's `Timeout` class. That is a small coupling nobody mentions. It is fine, but a careful reader notices.

**Verdict.** The summary paragraph is accurate. Oded's "I'll keep the slow test running after the job returns. The third delivery happens after it returns." made me stop: in the composition they keep, there is no third delivery. It should be past or conditional tense ("happened", or "is the one that would happen").

**Additional Take.** It is clear and consistent with the earlier chapter's rule that inference sees only the last overload. One small issue: the comment `// Accepted.` (meaning the compiler accepts the call) collides with the chapter's main meaning of "accepted" (the gateway accepted the message). "// OK" or "// Compiles." would avoid that.

## 3. Code verification

I used TypeScript 7.0.2 (the given binary with the given flags) and Node 22 with a fake clock that replaces `setTimeout`/`clearTimeout` and flushes microtasks between timers. My files are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read1/f/check/ (types.ts, sim.ts).

| Claim | Result |
|---|---|
| All chapter code blocks type-check except the two marked errors | Match. Exactly two errors. |
| `withTimeout(send, 2000); // Error TS2345` | Match. TS2345: "Types of parameters 'notice' and 'signal' are incompatible." This agrees with Oded's explanation. |
| `lookup("shipped-42"); // Error TS2345` | Match. TS2345: 'string' not assignable to 'readonly string[]' (the last overload). |
| `lookup(["shipped-42"])` compiles | Match. |
| `forward(identity)` stays generic; `count: number` and `label: string` compile | Match. |
| "Passing `client.send` to your generic wrapper compiles even with that `this` parameter" | Match. `withRetry(withTimeout(client.send, 2000), 3)` compiles as `Send`. At runtime it fails with "Cannot read properties of undefined (reading 'connection')". The chapter does not show this. |
| Keyed composition: `signal` is contextually typed when `notice: Notice` is annotated | Match. Compiles. |
| Trace table 1 (`retry(timeout(send))`, 3 s fixture): starts at 0/2/4, deliveries at 3/5/7, failed at 6 | Match, exactly. |
| "Three starts. Three deliveries. That last delivery happens after the job has finished." | Match (7 s, after the 6 s result). |
| Swapped order: "One start. The job records failed at two seconds. One delivery at three seconds." | Match. |
| Signal version on the 3 s fixture: "Starts at zero, two and four seconds. Three different signals. All three abort. Zero deliveries. The job still records failed at six seconds." | Match. |
| Turn table (accept at 1 s, receipt at 3 s): acceptances at 1/3/5, aborts at 2/4/6, three deliveries | Match. Job records failed at 6 s. |
| Keyed: "Two starts, one delivery, accepted at 2.1 seconds"; gateway accepted at 1 s | Match. |
| "The key still prevents another delivery" when the receipts never return | Consistent with the stated contract. I did not simulate that case separately. On the slow cancellable fixture, the final composition gives 3 starts, 0 deliveries and "unconfirmed" at 6 s. |
| Verdict: "The third delivery happens after it returns." | **Wording mismatch.** It is true only of the original composition. The kept composition delivers at most once. |
| Narration: "Assembling `sendShipped` doesn't send anything or start a timer." | Correct. Timers are created per call. The `RangeError` check runs at assembly but sends nothing. |

No output, count or timing in the chapter disagrees with the code.

## 4. Fairness of the alternatives

- **Swapped order (`timeout(retry(...))`).** Given in its strongest form, and its gain is kept ("That's two fewer texts. Keep that result."). Guy declines it for a reason the scenes set up: the requirement is two seconds per attempt, not two seconds for the job. That requirement was stated earlier ("It has no two-second limit for the whole job"). Fair. One option nobody raises: per-attempt timeouts plus an overall deadline. It isn't needed here, since the job has no overall limit.
- **Cancellation.** Built properly: a fresh controller per attempt, and the abort reason passed through. Its limit is shown by a fixture rather than asserted. This is the best-handled alternative.
- **Object wrapper vs bound arrow.** Raised by Guy and declined by Oded because the job wants a function and the arrow already keeps the instance. That is a local reason. But the alternative is not given in its strongest form: "our interface" and `inner.send` are never shown, so a reader can't weigh it. Its real strength (the receiver can't be lost, because nobody ever passes the method around) is stated but is abstract without code.
- **Not retrying.** Strong. Oded argues it well ("I'd rather have one uncertain send than three definite ones"), Gilad names its cost (a human has to resolve the job), and the Verdict keeps it as the fallback for gateways without a repeat-safe operation. Fair. The "one-attempt version" is never shown as code, which is fine.
- **Idempotency key (`sendOnce`).** Declined in its weak form ("Don't have retry invent an ID"), which is right. The strong form comes from the operation's owner, which matches the Principle. The plot problem: Guy owns the client and saw three deliveries in the first scene. Why does he steer toward cancellation and only offer `sendOnce` after the Turn? A line would close the gap, such as Guy saying he wanted to see whether cancellation alone was enough, or that `sendOnce` costs a gateway-side lookup. As written, a sharp reader may feel the cancellation scene was a detour he could have cut short.
- **Not raised:**
  - Classifying "couldn't connect" separately. That error proves the message was not accepted, yet the final `runJob` labels it "unconfirmed" along with timeouts. This is slightly too pessimistic and worth a line.
  - Querying the gateway by notice ID after exhaustion, to turn "unconfirmed" into a known state. `lookupReceipt` even appears in the Additional Take, which makes the omission conspicuous.

## 5. The Turn and the Verdict

The Turn works. Before it, the room believes cancellation fixed the problem ("Now timeout does more than stop waiting"). Guy's split fixture, where the gateway accepts before the reply, shows three deliveries with every signal honoured. That moves the room from "make the wait stoppable" to "only the owner can say a repeat is safe". Idan's line names that shift well.

The Verdict follows from the scenes. Everything in it has appeared earlier: per-attempt timeout, signal, the same notice ID, bound `sendOnce`, and "unconfirmed" on exhaustion. Guy's caveat about other gateways and Gilad's "Keep the early acceptance too" are earned. Only Oded's present-tense "The third delivery happens after it returns" misstates the current behavior. The Additional Take adds new material (overloads), but it is labelled as additional and is foreshadowed by the Principle.

## 6. Characters and voice

- **Pronouns.** I found no errors. Idan is "she" ("She replaces `withTimeout`"), Gilad is "His test clock", and Oded is "He opens".
- **Name consistency.** "Gil runs…" should be "Gilad". "Prof. Eli Typeworth" in the Debate but "Eli Typeworth" in the Additional Take.
- **Feed lines.**
  - Oded's "Does retry make the signal?" is a mild feed, but it is a real design question.
  - Gilad's "So the fake has two events instead of one." mostly exists to restate.
  - Gilad's "Same delayed reply on the first attempt?" is a feed to set up the 0.1 s repeat.
  None of these is egregious.
- **Documentation register.** These read more like a manual than like people talking:
  - Eli's "`Send` describes the argument and the receipt. It doesn't say how many times you contact the gateway."
  - Idan's closing summary, "So the wrapper owns the timer and the repetition. The client owns what cancellation stops and whether repetition is safe."
  - The narration paragraph before `keyedClient` ("Its failure predicate allows retries for…").
  Each is acceptable on its own. Idan's summary line is the most tutorial-like.
- **Repetition.** Variations of "accepted" vs "delivered" vs "receipt" recur often. That is mostly deliberate. Gilad/Guy's "accepted at 2.1 … The gateway accepted at one … The job learns it at 2.1" is a three-line restatement that could be one exchange.
- **Fools.** Nobody is made a fool. Oded's swapped order is credited, his no-retry stance survives into the Verdict, and Guy is shown as the careful owner. Idan's cancellation fix is shown working before its limit is found. That is the balance it should have.

## 7. What I'd change, ranked

1. **Close the `sendOnce` gap.** Give Guy a reason for not offering it in the first scene, or have him mention it there and defer it for a stated reason. Otherwise the cancellation scene looks like a detour the owner could have prevented.
2. **Fix the Verdict line.** "The third delivery happens after it returns" should be "happened" or "would happen", since the kept composition no longer does this.
3. **Define or cut the undefined references.** Show or remove "a sender object implementing our interface … `inner.send`". Either have someone propose the "marker" before Idan rejects it, or drop that sentence.
4. **Show the unbound method.** Add the one-line `withTimeout(client.send, 2000)` that compiles, plus its runtime failure. It is the only concrete evidence for the Principle's receiver clause. Or soften the Principle's "or make the wrapper forward its receiver" if no scene will show it.
5. **Fix the names.** "Gil" should be "Gilad"; pick one form of Eli's name.
6. **Spell out the `runJob` v2 reasoning.** Have someone say in dialogue that a retryable error can only escape `withRetry` after the attempts run out. Optionally, have someone note that a connect failure is actually known-not-accepted, or that a lookup by notice ID could resolve "unconfirmed".
7. **Clarify the two sends.** Make clear early that the first `send` (notice-only) and `GatewayClient.send` (signal, notice) are different operations.
8. **Small wording.** Replace "The other operation is still ours" with "still running". Change `// Accepted.` in the Additional Take to `// Compiles.` Consider trimming Idan's closing summary line or making it more conversational.
