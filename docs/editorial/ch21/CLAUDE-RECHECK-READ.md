# Reader report: Chapter 21, targeted recheck (draft 2)

Draft 2 (`e53251d7…`, `7ce37b2`), 2026-10-25. A fresh, isolated reader had the full chapter, with
Chapters 1–20 and the five speakers' pronouns stated as prerequisites. It was asked to read the whole
chapter, then the passages revised after the first review, and to re-run every output. It could run
only the book's TS 7.0.2 binary and Node 22, on a fake clock, and installed nothing. The report is
copied verbatim.

---

## 1. Overall

Close. Every printed output, trace, count, runtime error and compiler error reproduces exactly on tsc 7.0.2 and Node 22 with a fake clock. The argument also holds: the trace shows the duplicates, cancellation looks like a fix, the early-acceptance Turn takes that fix apart, and the keyed operation plus the `unconfirmed` label settles it. One substantive gap is left. Guy's fallback in the Verdict ("use Oded's one-attempt version") breaks the requirement Oded set at the start ("A temporary connection failure shouldn't lose the notice"). The chapter already holds the better fallback: a predicate that retries only failures proven not to have sent. The Principle permits it, Guy states the fact it rests on ("A final failure to connect proves that attempt didn't send"), and Oded mentions the predicate in Scene 1. Nobody joins them up. The rest is line-level work: an ambiguous "Otherwise" in the Principle, an unclear "Keep it" about `sendWithinBudget`, Guy's connect-failure line arriving with no setup, and heavy repetition of "keep". One targeted pass, not another full round.

## 2. The revised passages

**Principle, paragraph 1.** Mostly clear, and it states a rule you can test: "If the owner can't establish safe repetition, don't retry an ambiguous failure; report the outcome as unknown." I stopped at the next sentence: "Otherwise you can have a failed job and a customer with three messages." It comes straight after an if-clause, so "Otherwise" reads first as the else-branch ("if the owner *can* establish safe repetition…"), which says the opposite of what's meant. Suggest "Skip that and you can have…" or "Retry it anyway and…". Also, "what it skips, repeats or leaves running": nothing in this chapter skips, so "skips" points at nothing. Otherwise it does its job.

**Principle, paragraph 2.** Accurate, and every clause is paid off later (stacking order, signal use, the detached method, overloads). But it is five rules in a row and reads like a checklist. It works as a contract; it isn't pleasant to read. Acceptable.

**Oded's "The job allows three attempts and two seconds for each reply. Not two seconds for the whole job…"** Clear. It does its job: Guy's objection to `sendWithinBudget` ("It doesn't give each attempt two seconds") lands because of it. "Not two seconds for the whole job" telegraphs the later objection slightly, but acceptably. Its third sentence ("A temporary connection failure shouldn't lose the notice") is the requirement the Verdict's fallback later breaks (see 5 and 7).

**Idan's `finally` question and Oded's answer.** Clear and sharp: "Where do you stop the send?" / "I don't. I stopped waiting for it." It works, and Oded keeps his dignity. But it gives away the trace's punchline, and then Oded says it again at line 125 ("Clearing the timer doesn't touch the send."). Guy then says it a third time ("There's no instruction here that could touch it"). Cut line 125.

**Guy naming `sendOnce` early; Idan choosing to stop running requests first.** Clear: "We have `sendOnce` to prevent duplicate messages. It would still leave these requests running and waiting for replies." Two problems on first read:
- Idan's "Let's stop the requests left running first. `sendOnce` doesn't do that." repeats Guy's point almost word for word.
- Nobody says why running requests outrank three texts to a customer, which is the harm the chapter opened on.

A half-line would fix it. For example, Idan: "Copies we can't stop will keep piling up whatever key they carry," or a resource or connection-pool reason. Guy's own "It doesn't undo a message the gateway already accepted" (line 150) quietly sets up the Turn. Good.

**Detached-method fence and runtime error.** Clear, and it does its job. "Passing the method alone compiles, even with its `this` parameter" is verified, and so is the error text. Without the instance, the message reads as "the version that breaks", which is right.

**Guy's `Sender` / `RetryingSender` and Oded's reply.** The code is clear and correct. Guy's sequence is odd: "Keep that arrow… Or keep the sender interface." He argues against his own advice two lines apart, then drops the alternative himself ("Then keep it."). Oded's reason for declining is local and true ("This job still needs a function"), but it's the weaker reason. See section 4.

**Oded's "Then do we still need `sendOnce`? There aren't any copies left in that test."** Works. It states plainly the belief the Turn overturns. A reader who remembers Guy's line 150 sees the Turn coming, but the room hasn't tested it, so this is fair.

**The exhausted-error reasoning, Guy's connect-failure note, the reconciliation worker line.**
- Oded's "If a retryable error gets past `withRetry`, we've used up the attempts" is correct: same predicate, and the loop only rethrows a retryable error on the last attempt.
- Guy's "A final failure to connect proves that attempt didn't send. Your wrapper returns the last error; an earlier attempt may have got through." stopped me. Nobody proposed special-casing a final connect error, so on first read it sounds like an objection to Oded when it's actually support. "Returns" is also wrong: the wrapper rethrows, or rejects with, the last error. Suggested wording: "Even if the last error is a connect failure, it only clears the last attempt. Your wrapper rethrows the last error; an earlier attempt may have got through."
- Reconciliation: Guy's line is clear. Oded's "I'll put that next to `sendShipped`" leaves "that" vague (a comment? the worker?). Say "a comment".

**Verdict lines and Additional Take.**
- The Verdict narration is accurate, including "exhausted temporary failures mean unconfirmed".
- Oded's and Gilad's test-keeping lines follow directly from the scenes. Good.
- Guy's fallback line is the main problem (section 5).
- The Additional Take is verified and ties to the reconciliation lookup. It opens with "Check the public signatures when wrapping a client method, even after you've bound its receiver", but `lookupReceipt` is a standalone declared function, not a bound method. Minor.

## 3. Code verification

Method: I extracted all 13 fences. Type-checking used the specified tsc (Version 7.0.2) with the given flags. Runtime runs used Node 22 with a manual fake clock that replaces `setTimeout` and `clearTimeout`. The scripts are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch21read2/f/work/ (sim1.ts, sim2.ts, c1.ts–c4.ts).

| Claim | Result |
|---|---|
| Opening types, `runJob`, `withRetry`, `Timeout`, first `withTimeout`, both compositions compile | Match (no errors) |
| `runJob(send)` prints `accepted` (fast gateway) | Match |
| Old fixtures pass: immediate reply; reject once then reply | Match (both `accepted`) |
| Slow trace: starts at 0/2/4, deliveries at 3/5/7, `failed` at 6, third delivery after the job | Match, row for row |
| "Three starts. Three deliveries." | Match |
| `sendWithinBudget`: one start, `failed` at 2 s, one delivery at 3 s | Match |
| `withTimeout(send, 2000)` gives TS2345 | Match (`Types of parameters 'notice' and 'signal' are incompatible`) |
| Oded: "it would get an `AbortSignal` where it expects the notice" | Matches the error text |
| `GatewayClient` fence, the `attempt` arrow, `sendShipped` compile | Match |
| `withTimeout(client.send, 2000)` compiles despite `this: GatewayClient` | Match |
| Runtime: `Cannot read properties of undefined (reading 'connection')` | Match (exact text) |
| Arrow version works at runtime | Match |
| `Sender` / `RetryingSender` compile and retry through the instance | Match (3 calls, success) |
| Signal-aware 3 s fixture: starts at 0/2/4, three distinct signals, all abort, zero deliveries, `failed` at 6 s | Match |
| Turn fixture: accept/deliver at 1/3/5, aborts at 2/4/6, three deliveries, every signal used | Match |
| Keyed composition (`withTimeout((signal, notice: Notice) => …)`) compiles, assigns to `Send` | Match |
| Keyed fixture: two starts, one delivery at 1 s, confirmation at 2.1 s | Match |
| New `runJob` compiles; retryable escaping means attempts exhausted | Match (logic holds: same predicate, and `withRetry` only rethrows a retryable error when `attempt === attempts`) |
| `forward(lookupReceipt)`: array form compiles, string form gives TS2345 | Match (`'string' is not assignable to parameter of type 'readonly string[]'`) |
| `forward(identity)` stays generic; `count: number`, `label: string` compile | Match |
| Wording: "Your wrapper returns the last error" | **Misdescribes**: it rethrows or rejects with the last error |
| Wording: Verdict "around the bound `sendOnce` operation" | Loose: it's an arrow that calls through the instance, not `.bind`. Acceptable after the detached-method scene |
| Wording: Additional Take "even after you've bound its receiver" | Loose: the example isn't a method |

No numeric, trace or diagnostic mismatches.

## 4. Fairness of the alternatives

- **Outer timeout (`sendWithinBudget`).** Strongest form, and declined for a local reason, the per-reply budget Oded set at line 47. Fair. But "Keep that result." / "Keep it." leaves its fate unclear: do they keep the composition or the test? It's never mentioned again. One clause would settle it ("Keep the test, not the composition").
- **Cancellation alone.** Given its full strength: real signals, all used, zero copies in the slow fixture. Then it's honestly defeated by early acceptance. Fair, and it's the best part of the chapter.
- **`RetryingSender`.** It is declined because "the job needs a function", which is true but thin. The scenes give a stronger reason that nobody uses. `RetryingSender.send` takes one caller signal and passes it to every attempt. A timeout placed around it therefore covers all three attempts, which is the `sendWithinBudget` problem the room already rejected, and it can't give each attempt its own signal. It also doesn't forward a `shouldRetry`. Making that the decline would make it a real alternative rather than a detour Guy drops himself.
- **Oded's one-attempt version.** Presented fairly at the Turn ("I'd rather have one uncertain send than three definite ones").

Alternatives nobody raises:
1. **Retry only failures proven not sent.** This is the important one. Oded says in Scene 1 that "The predicate could veto that", Guy says "A final failure to connect proves that attempt didn't send", and the Principle only forbids retrying *ambiguous* failures. For a gateway without `sendOnce`, `withRetry(withTimeout(attempt, 2000), 3, isConnectFailure)` meets Oded's "A temporary connection failure shouldn't lose the notice". The one-attempt version doesn't. Oded is also the obvious person to reach for his own predicate right after the trace.
2. **`AbortSignal.timeout(ms)`** (plus `AbortSignal.any`) instead of a hand-rolled controller. Many readers will ask. There's a local answer (the timer has to sit on the fake clock, and the wrapper must reject with `Timeout` that the predicate recognises), but nobody gives it.
3. Minor: a non-retryable error on attempt 2 or 3 after a timeout on attempt 1 goes to the error handler, not to reconciliation, even though attempt 1 may have been accepted. With `sendOnce` this is mostly moot (a repeat would get the stored receipt), so a footnote at most.
4. Minor: `keyedClient.shouldRetry` has to recognise the wrappers module's `Timeout` class. That coupling is unstated ("Timeouts … can get another attempt").

## 5. The Turn and the Verdict

**The Turn works.** Before it, the room believes cancellation removed the need for `sendOnce` ("There aren't any copies left in that test"). After it, they see cancellation and repetition as separate questions. Idan's "We asked it to cancel the request, and treated that as permission to repeat the message" is the line that names the shift. The outcome then changes in concrete ways: a keyed operation, a client-owned predicate, and a third outcome label.

**The Verdict mostly follows from the scenes.** The `sendShipped` description, the "accepted/unconfirmed" mapping, the slow test that keeps running after the job returns, and the early-acceptance test were all established.

Guy's fallback is the exception. "For a gateway without that repeat-safe operation, use Oded's one-attempt version" endorses something that breaks Oded's opening requirement, and it is stricter than the Principle requires. It also has a practical problem: Oded's one-attempt version was never shown as code, and the final `runJob` depends on `keyedClient.shouldRetry`, which that other gateway wouldn't have. So the reader can't actually "use" that version from what's on the page. Either:
- have Guy say "one attempt, or retry only failures that prove nothing was sent", or
- have Oded accept losing those notices explicitly, as a cost of the decision.

The Additional Take is a related coda on the Principle's last sentence. It introduces nothing that conflicts with the Verdict.

## 6. Characters and voice

- **Pronouns:** all correct (Oded he, Idan she, Gilad "His test clock").
- **Repetition:**
  - "Clearing the timer doesn't touch the send" repeats Oded's own line 96, and Guy repeats it again ("could touch it").
  - Idan's "`sendOnce` doesn't do that" repeats Guy's line 127.
  - "Keep" appears 16 times: "Keep that result", "Keep it", "Keep that arrow", "keep the sender interface", "keep calling", "keeps its instance", "Then keep it", "I'll keep", "Keep the early acceptance", "keeps a generic function generic", "keep those two signatures", and others. It's a noticeable tic, worst around lines 138–140 and 212–240.
- **Feed lines:** Oded's "And retry hasn't changed." (to set up Idan's explanation) and Gilad's "So the fake has two events instead of one." Oded's "I will." after "Then keep it." is filler.
- **Reads like documentation:** Oded's line 107 (the step-by-step of where timers come from), Guy's line 150 (client spec), Guy's line 286 (the `sendOnce` contract), and the second paragraph of the Principle. Each one is defensible, but together they make the middle of the chapter heavy on exposition.
- **Fools:** none. Oded authored the bug but makes the key calls ("Stop retrying this one", "record unconfirmed", "Don't have retry invent an ID"). "Don't have retry invent an ID" answers a proposal nobody made; make it concrete, e.g. "Don't let retry mint a new key per attempt".
- **Thin roles:** Gilad states the Principle but in the debate mostly reads out fixture results. His only argument is "Someone would have to resolve that job." Prof. Eli has one debate line.
- **First-read snag:** in the opening fence, `runJob(send)` prints `// accepted` right after "The job says failed", so the reader briefly wonders which run this is. Add "when the gateway replies" to the comment.

## 7. What I'd still change, ranked

1. **Fix Guy's fallback in the Verdict.** For gateways without `sendOnce`, offer "retry only failures that prove nothing was sent (e.g. connect refused), never timeouts", or have Oded explicitly accept losing those notices. Either way, the end has to match Oded's line-47 requirement and the Principle's "ambiguous" qualifier. The cheapest place to plant it is Oded's "Stop retrying this one" at the Turn ("…or only retry what never connected").
2. **Rewrite the "Otherwise" sentence in the Principle** so it can't be read as the else-branch.
3. **Give Guy's connect-failure note a setup and correct the verb.** "Even if the last error is a connect failure, that only clears the last attempt. Your wrapper rethrows the last error; an earlier attempt may have got through."
4. **Settle `sendWithinBudget`.** Make "Keep that result" / "Keep it" say whether they keep the test or the composition.
5. **Make the decline of `RetryingSender` use the scenes:** one caller signal shared by all attempts means the timeout covers the whole retry, which the room already rejected. Optionally stop Guy from offering and withdrawing it himself.
6. **Cut the repetitions:** Oded's line 125, and the second half of Idan's "`sendOnce` doesn't do that". Add a half-line for why running requests come first.
7. **Thin out "keep":** aim for under half the current 16.
8. **Small clarity fixes:** "I'll put that" → "I'll put a comment"; the `// accepted` comment in the opening fence; "Don't have retry invent an ID" → per-attempt key; a phrase explaining why `withTimeout` is hand-rolled rather than `AbortSignal.timeout` (fake clock, `Timeout` class); "even after you've bound its receiver" in the Additional Take.
9. **Give Gilad one argument of his own,** not just results, and drop "skips" from the Principle or pay it off.
