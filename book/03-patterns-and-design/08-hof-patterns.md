# Chapter 21: The Message Kept Going

## The Principle

**Gilad Stacktrace**: "A higher-order function takes a function or returns one. A wrapper can keep its arguments and result type while changing when it runs and how often. Before wrapping an operation, check what the wrapper may skip, repeat or leave running, and whether the operation allows that. For retries, get the operation's owner to establish that repeating it is safe. A timeout only stops waiting unless someone also stops the work. Passing a cancellation signal isn't enough; the operation has to use it."

"With stacked wrappers, follow the outside call inward, then follow a failure back out. Find which wrapper gets to call the operation again and which one stops waiting. Keep a method attached to its instance, or make the wrapper forward its receiver. Check the returned signatures before giving the function to callers who need its overloads. The same-looking call can do different work."

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

declare const send: Send; // The notification client's bound send operation.
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

The job is allowed three attempts, with two seconds to wait for each reply. A temporary connection failure shouldn't lose the shipment notice. It has no two-second limit for the whole job. Oded put that behavior in the shared wrappers module:

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

**Oded**: "Retry calls the function again if it rejects. Timeout waits for whichever promise settles first. I clear the timer when we're done. The predicate can stop retries for a particular failure. This job was using the default, which retries every rejection."

**Idan Greenfield**: "Which thing is done?"

**Oded**: "The call to the wrapper. I see where you're going."

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

**Guy**: "There's no instruction here that could touch it. `Promise.race` gives you an answer from one promise. The other operation is still ours."

**Oded**: "Then put the timeout around the whole thing. At least it won't launch three copies while this send is slow."

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

**Idan**: "The timeout needs to tell the operation to stop. It should take a function that accepts a signal, and supply one."

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

**Guy**: "I could put retry in a sender object implementing our interface. It holds the client and calls `inner.send`. Nobody has to remember which instance the method came from."

**Oded**: "That works. Then I'd still need a function for the job. This arrow keeps the instance too, and I can see the call."

**Guy**: "Provided you keep it. Passing `client.send` to your generic wrapper compiles even with that `this` parameter. It doesn't bind the method."

**Oded**: "I'm keeping the arrow. I'm not adding a sender class just to remove it."

Gil runs the same three-second fixture, now listening to each attempt's signal. Aborting cancels its pending delivery and rejects its promise.

**Gilad**: "Starts at zero, two and four seconds. Three different signals. All three abort. Zero deliveries. The job still records failed at six seconds."

**Idan**: "Now timeout does more than stop waiting. The operation has a way to stop too."

**Oded**: "And retry hasn't changed."

**Idan**: "It calls the function it's given. Each call now creates the controller as well as starting the request."

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

**Guy**: "It can do better here. We have `sendOnce` for this gateway: the notice ID is the key for the same logical message on every attempt, and an already accepted key returns its stored receipt without sending another message."

**Idan**: "That promise comes from the gateway operation. Adding a marker to an ordinary function wouldn't give it that behavior."

**Oded**: "Fine. Wrap that operation. Don't have retry invent an ID."

Guy exposes that part of the client to the job as `keyedClient` and changes the bound adapter to call `sendOnce`. Its failure predicate allows retries for timeouts and the gateway's temporary transport failures, not a bad address or a programming error.

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

**Gilad**: "Two starts, one delivery, accepted at 2.1 seconds as far as the job is concerned."

**Guy**: "The gateway accepted at one. That's when the message went out."

**Gilad**: "Right. The job learns it at 2.1."

**Oded**: "And if that receipt doesn't get back either?"

**Guy**: "The key still prevents another delivery. Exhausting our attempts doesn't tell us whether the gateway accepted the first one."

Oded changes the job's outcome for those exhausted failures. Other errors still escape to its error handler:

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

**Idan**: "So the wrapper owns the timer and the repetition. The client owns what cancellation stops and whether repetition is safe."

**Oded**: "That I can put next to `sendShipped`. I can't put 'safe retry' on every function the module accepts."

## The Verdict

The shipment job keeps `sendShipped`: three attempts, a fresh two-second timeout for each, around the bound `sendOnce` operation. The timeout supplies a signal; the client uses it. The same notice ID reaches every attempt. A received receipt means accepted; exhausted temporary failures mean unconfirmed.

**Guy**: "For a gateway without that repeat-safe operation, use Oded's one-attempt version. Don't copy this composition and assume the new client has the same contract."

**Oded**: "I'll keep the slow test running after the job returns. The third delivery happens after it returns."

**Gilad**: "Keep the early acceptance too. That's the one where cancellation worked and we still sent three."

## Additional Take

**Eli Typeworth**: "Check the public signatures when wrapping a client method, even after you've bound its receiver. This small forwarding wrapper keeps a generic function generic. It doesn't keep every overload."

```typescript
function forward<A extends unknown[], R>(f: (...args: A) => R): (...args: A) => R {
  return (...args) => f(...args);
}

declare const lookupReceipt: {
  (id: string): Promise<Receipt>;
  (ids: readonly string[]): Promise<Receipt[]>;
};

const lookup = forward(lookupReceipt);
lookup(["shipped-42"]); // Accepted.
lookup("shipped-42"); // Error TS2345

const identity = <T>(value: T): T => value;
const forwarded = forward(identity);
const count: number = forwarded(3);
const label: string = forwarded("accepted");
```

**Guy**: "The client has callers using both lookup forms. I'll keep those two signatures at its boundary, or give this caller the single operation it needs. A forwarding arrow isn't a promise that the whole API survived."
