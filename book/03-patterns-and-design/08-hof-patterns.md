# Chapter 21: The Message Kept Going

## The Principle

**Gilad Stacktrace**: "A higher-order function takes a function or returns one. A wrapper can keep the call's types while changing what it skips, repeats or leaves running. Ask whether the operation allows those changes. A rejection doesn't prove the work didn't happen. If the owner can't establish safe repetition, don't retry an ambiguous failure; report the outcome as unknown. Otherwise you can have a failed job and a customer with three messages."

"For stacked wrappers, follow the outside call inward, then the failure back out to find who retries and who stops waiting. Stopping the wait doesn't stop the work: an `AbortSignal` helps only if the operation uses it. Call a method through its instance; a generic wrapper can accept a detached method, even with an explicit `this` parameter, and lose its receiver. Try each public overload on the returned function, too. A wrapper that infers one argument tuple and result can retain only the last overload."

## The Debate

### Three receipts for one failure

**Oded Shipley**: "The job says failed. Please tell me the customer didn't get the message."

**Gilad**: "Which copy?"

Guy owns the notification client. The gateway accepts a message, sends it to the recipient, and replies with a receipt. A fulfilled `send` promise confirms acceptance. A rejection or a missing reply doesn't prove the message wasn't accepted; the response can fail on its way back.

The shipment job takes a sending function. It passes the same notice on each invocation, and records whether that function fulfilled or rejected. A notice's ID identifies one logical message, not one network attempt.

```typescript
type Notice = { id: string; to: string; text: string };
type Receipt = { messageId: string };
type Send = (notice: Notice) => Promise<Receipt>;

declare const send: Send; // The job's old notice-only adapter over the client.
const notice: Notice = {
  id: "shipped-42", to: "+1555010042", text: "Your order has shipped.",
};

async function runJob(deliver: Send): Promise<string> {
  try {
    await deliver(notice);
    return "accepted";
  } catch {
    return "failed";
  }
}

runJob(send).then(console.log); // accepted
```

**Guy Singleton**: "That last label is yours. My client didn't say nothing happened."

**Oded**: "It was the job's catch. Before I added the timeout, it mostly meant we couldn't connect."

"The job allows three attempts and two seconds for each reply. Not two seconds for the whole job. A temporary connection failure shouldn't lose the notice."

He put that behavior in the shared wrappers module:

```typescript
function withRetry<A extends unknown[], R>(
  f: (...args: A) => Promise<R>,
  attempts: number,
  shouldRetry: (error: unknown) => boolean = () => true,
): (...args: A) => Promise<R> {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts must be a positive integer");
  }
  return async (...args) => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await f(...args);
      } catch (error) {
        if (attempt === attempts || !shouldRetry(error)) throw error;
      }
    }
  };
}

class Timeout extends Error {
  constructor() { super("timeout"); }
}

function withTimeout<A extends unknown[], R>(
  f: (...args: A) => Promise<R>, ms: number,
): (...args: A) => Promise<R> {
  return async (...args) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expired = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Timeout()), ms);
    });
    try {
      return await Promise.race([f(...args), expired]);
    } finally {
      clearTimeout(timer);
    }
  };
}
```

**Oded**: "Retry sees the timeout reject and tries again. The predicate could veto that, but this job retries every rejection."

**Idan Greenfield**: "Your `finally` clears the timer. Where do you stop the send?"

**Oded**: "I don't. I stopped waiting for it."

He opens the composition the job uses:

```typescript
const sendShipped: Send = withRetry(withTimeout(send, 2000), 3);
runJob(sendShipped).then(console.log); // failed, in the slow fixture
```

**Idan**: "You create the timeout wrapper once. Where does the next timer come from?"

**Oded**: "Inside the function it returns. Assembling `sendShipped` doesn't send anything or start a timer. The job calls it, retry calls the timeout function, and that call starts both the timer and `send`. If the timer rejects first, retry calls the same timeout function again. New timer, another send, same notice."

**Gilad**: "The fixture used to reply immediately, or reject once and then reply. Both passed. I made the gateway take three seconds instead."

His test clock advances without waiting in real time. In this first fixture, delivery and the receipt happen together. The trace continues after the job has recorded its result:

| Time | Event |
|---|---|
| 0 s | Attempt 1 starts |
| 2 s | Attempt 1 times out; attempt 2 starts |
| 3 s | Attempt 1 delivers |
| 4 s | Attempt 2 times out; attempt 3 starts |
| 5 s | Attempt 2 delivers |
| 6 s | Attempt 3 times out; job records `failed` |
| 7 s | Attempt 3 delivers |

**Gilad**: "Three starts. Three deliveries. That last delivery happens after the job has finished."

**Oded**: "Clearing the timer doesn't touch the send."

**Guy**: "There's no instruction here that could touch it. `Promise.race` gives you an answer from one promise. The other operation is still running. We have `sendOnce` to prevent duplicate messages. It would still leave these requests running and waiting for replies."

**Oded**: "First, put the timeout around the whole thing. At least it won't launch three copies while this send is slow."

```typescript
const sendWithinBudget: Send = withTimeout(withRetry(send, 3), 2000);
runJob(sendWithinBudget).then(console.log); // failed, in the slow fixture
```

**Gilad**: "One start. The job records failed at two seconds. One delivery at three seconds."

**Oded**: "That's two fewer texts. Keep that result."

**Guy**: "Keep it. But now the two seconds covers the whole retry operation. It doesn't give each attempt two seconds. And we still have a failed job with a delivered message."

**Idan**: "Both functions fit `Send`. Nothing at the job's call tells it which wait it got."

**Prof. Eli Typeworth**: "`Send` describes the argument and the receipt. It doesn't say how many times you contact the gateway. Both wrappers can keep that signature without keeping that behavior."

### Give the operation something it can use

**Idan**: "Let's stop the requests left running first. `sendOnce` doesn't do that. The timeout should take a function that accepts a signal, and supply one."

**Guy**: "The client has a cancellable send. It stops the request and the response wait when that signal aborts. It doesn't undo a message the gateway already accepted."

```typescript
type SendAttempt = (
  signal: AbortSignal, notice: Notice,
) => Promise<Receipt>;
```

**Oded**: "Does retry make the signal?"

**Idan**: "Timeout has the timer. Let it make the controller. Retry calls timeout again and gets a fresh one."

She replaces `withTimeout`. The returned function still takes the notice; the function inside it receives the signal as well:

```typescript
function withTimeout<A extends unknown[], R>(
  f: (signal: AbortSignal, ...args: A) => Promise<R>, ms: number,
): (...args: A) => Promise<R> {
  return async (...args) => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expired = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const error = new Timeout();
        reject(error);
        controller.abort(error);
      }, ms);
    });
    try {
      return await Promise.race([f(controller.signal, ...args), expired]);
    } finally {
      clearTimeout(timer);
    }
  };
}
```

**Idan**: "The old client can't fill this input anymore."

```typescript
withTimeout(send, 2000); // Error TS2345
```

**Oded**: "Because it would get an `AbortSignal` where it expects the notice."

**Idan**: "Yes. We have to give the wrapper a different operation. That doesn't make the operation use the signal."

**Guy**: "I'll connect it to the client."

Guy's existing `GatewayClient` owns its transport connection. Its `send` method uses that instance and already accepts the signal. The job still wants a function:

```typescript
declare class GatewayClient {
  readonly connection: string;
  send(this: GatewayClient, signal: AbortSignal, notice: Notice): Promise<Receipt>;
}
declare const client: GatewayClient;

const attempt: SendAttempt = (signal, notice) => client.send(signal, notice);
const sendShipped: Send = withRetry(withTimeout(attempt, 2000), 3);
```

**Guy**: "Keep that arrow. Passing the method alone compiles, even with its `this` parameter. Here it is without the instance:"

```typescript
const detached = withTimeout(client.send, 2000); // Compiles.
detached(notice).catch(error => console.log(error.message));
// Cannot read properties of undefined (reading 'connection')
```

**Guy**: "Or keep the sender interface. A retrying sender holds the client and calls its method through that instance:"

```typescript
interface Sender {
  send(signal: AbortSignal, notice: Notice): Promise<Receipt>;
}

class RetryingSender implements Sender {
  constructor(private inner: Sender, private attempts: number) {}

  send(signal: AbortSignal, notice: Notice): Promise<Receipt> {
    return withRetry(() => this.inner.send(signal, notice), this.attempts)();
  }
}
```

**Guy**: "Our existing callers could keep calling `sender.send`. The inner method never gets passed on its own."

**Oded**: "That works. This job still needs a function, though. I'd write an arrow around your sender. The arrow around the client already keeps its instance."

**Guy**: "Then keep it."

**Oded**: "I will."

Gilad runs the same three-second fixture, now listening to each attempt's signal. Aborting cancels its pending delivery and rejects its promise.

**Gilad**: "Starts at zero, two and four seconds. Three different signals. All three abort. Zero deliveries. The job still records failed at six seconds."

**Idan**: "Now timeout does more than stop waiting. The operation has a way to stop too."

**Oded**: "And retry hasn't changed."

**Idan**: "It calls the function it's given. Each call now creates the controller as well as starting the request."

**Oded**: "Then do we still need `sendOnce`? There aren't any copies left in that test."

## The Turn

**Guy**: "Move acceptance ahead of the reply. The gateway can accept at one second and take until three to get the receipt back."

**Gilad**: "So the fake has two events instead of one."

**Guy**: "That's the case I need before we call this repaired. Stop waiting at two. Leave the accepted message alone."

The fixture now honors cancellation by abandoning the response wait. It cannot remove an accepted message from the recipient's phone:

| Attempt | Starts | Gateway accepts and delivers | Local wait aborts |
|---|---|---|---|
| 1 | 0 s | 1 s | 2 s |
| 2 | 2 s | 3 s | 4 s |
| 3 | 4 s | 5 s | 6 s |

**Gilad**: "Three deliveries again. Every signal was used."

**Idan**: "Then the wrapper did what we asked. We asked it to cancel the request, and treated that as permission to repeat the message."

**Oded**: "Stop retrying this one. Leave the timeout. One invocation, at most one message from us."

**Guy**: "It would still be unconfirmed."

**Oded**: "Then record unconfirmed. That's what we know. If we can't safely repeat it, I'd rather have one uncertain send than three definite ones."

**Gilad**: "Someone would have to resolve that job instead of getting the automatic retry."

**Oded**: "Yes. If the client can't do better, that's the job."

**Guy**: "That's why I want `sendOnce` here: the notice ID is the key for the same logical message on every attempt, and an already accepted key returns its stored receipt without sending another message."

**Oded**: "Fine. Wrap that operation. Don't have retry invent an ID."

Guy exposes that part of the client as `keyedClient`.

**Guy**: "Use its failure predicate too. Timeouts and temporary transport failures can get another attempt. A bad address or a programming error shouldn't."

```typescript
declare const keyedClient: {
  sendOnce(signal: AbortSignal, notice: Notice): Promise<Receipt>;
  shouldRetry(error: unknown): boolean;
};

const sendShipped: Send = withRetry(
  withTimeout((signal, notice: Notice) => keyedClient.sendOnce(signal, notice), 2000),
  3,
  error => keyedClient.shouldRetry(error),
);
```

**Gilad**: "Same delayed reply on the first attempt?"

**Guy**: "Same one. On the repeat, the fixture can return the stored receipt in a tenth of a second."

The first request starts at zero and is accepted at one second. At two seconds its local wait times out. The second request carries the same notice ID and gets the existing receipt at 2.1 seconds.

**Gilad**: "Two starts, one delivery at one second. The job gets confirmation at 2.1."

**Oded**: "And if that receipt doesn't get back either?"

**Guy**: "The key still prevents another delivery. Exhausting our attempts doesn't tell us whether the gateway accepted the first one."

**Oded**: "If a retryable error gets past `withRetry`, we've used up the attempts. I'll record that as unconfirmed and let other errors reach the error handler."

**Guy**: "A final failure to connect proves that attempt didn't send. Your wrapper returns the last error; an earlier attempt may have got through."

Oded replaces the job's catch:

```typescript
async function runJob(deliver: Send): Promise<string> {
  try {
    await deliver(notice);
    return "accepted";
  } catch (error) {
    if (keyedClient.shouldRetry(error)) return "unconfirmed";
    throw error;
  }
}
```

**Guy**: "The reconciliation worker looks up the notice ID before closing an unconfirmed job. It uses the client's receipt lookup."

**Oded**: "I'll put that next to `sendShipped`, so the next person knows where these jobs go."

## The Verdict

The shipment job keeps `sendShipped`: three attempts, a fresh two-second timeout for each, around the bound `sendOnce` operation. The timeout supplies a signal; the client uses it. The same notice ID reaches every attempt. A received receipt means accepted; exhausted temporary failures mean unconfirmed.

**Guy**: "For a gateway without that repeat-safe operation, use Oded's one-attempt version. Don't copy this composition and assume the new client has the same contract."

**Oded**: "I'll keep the slow test running after the job returns. In the old composition, the third delivery happened after it returned."

**Gilad**: "Keep the early acceptance too. That's the one where cancellation worked and we still sent three."

## Additional Take

**Prof. Eli Typeworth**: "Check the public signatures when wrapping a client method, even after you've bound its receiver. This small forwarding wrapper keeps a generic function generic. It doesn't keep every overload."

```typescript
function forward<A extends unknown[], R>(f: (...args: A) => R): (...args: A) => R {
  return (...args) => f(...args);
}

declare const lookupReceipt: {
  (id: string): Promise<Receipt>;
  (ids: readonly string[]): Promise<Receipt[]>;
};

const lookup = forward(lookupReceipt);
lookup(["shipped-42"]); // Compiles.
lookup("shipped-42"); // Error TS2345

const identity = <T>(value: T): T => value;
const forwarded = forward(identity);
const count: number = forwarded(3);
const label: string = forwarded("accepted");
```

**Guy**: "The client has callers using both lookup forms. I'll keep those two signatures at its boundary, or give this caller the single operation it needs. A forwarding arrow isn't a promise that the whole API survived."
