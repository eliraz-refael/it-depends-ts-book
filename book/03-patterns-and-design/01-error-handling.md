# Chapter 14: Two Seats or None

## The Principle

**Dafna Functor**: "A seat being taken isn't a broken program. Someone else got there first."

**Guy Singleton**: "It still means we don't book the party."

The booking page reserves seats for a whole party: every requested seat or none of them. Dafna's patch makes the service return expected refusals as data. Guy has opened the current implementation beside her diff.

**Liron Closure**: "You can hand back a ticket with either a seat number or 'sold out' on it. Both are answers the caller knows how to use. A result type puts those answers in the signature."

The application uses a store library whose `hold` operation reserves one seat in a transaction. For an unknown or occupied seat, `hold` rejects with the library's `SeatRefused`, carrying its `Failure` union. Other failures, such as a broken connection, can also reject the operation. `Booking` is the application's record of the seats it reserved.

```typescript
type Failure =
  | { kind: "occupied"; seat: string }
  | { kind: "unknown-seat"; seat: string };

type Booking = { seats: readonly string[] };

class SeatRefused extends Error {
  constructor(readonly failure: Failure) {
    super(`${failure.kind}: ${failure.seat}`);
    this.name = "SeatRefused";
  }
}

interface Tx {
  hold(seat: string): Promise<void>;
}

interface Store {
  transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T>;
}
```

The library commits the transaction if the callback's promise fulfills. If it rejects, the library rolls back before rejecting with the same error. The booking team uses that contract; it doesn't maintain the library.

The page uses one formatter for the two refusals:

```typescript
function failureMessage(failure: Failure): string {
  switch (failure.kind) {
    case "occupied": return `${failure.seat} is taken.`;
    case "unknown-seat": return `Seat ${failure.seat} does not exist.`;
  }
  const unhandled: never = failure;
  return unhandled;
}
```

The current `bookParty` throws on refusal. `submit` is the page's handler: it shows the booking or the specific refusal, and lets unexpected failures reach the application's error handler.

```typescript
async function bookParty(store: Store, seats: readonly string[]): Promise<Booking> {
  return store.transaction(async tx => {
    for (const seat of seats) await tx.hold(seat);
    return { seats: [...seats] };
  });
}

async function submit(store: Store, seats: readonly string[]): Promise<string> {
  try {
    const booking = await bookParty(store, seats);
    return `Booked ${booking.seats.join(", ")}.`;
  } catch (error) {
    if (error instanceof SeatRefused) return failureMessage(error.failure);
    throw error;
  }
}
```

Gil Benchmark brings up `testStore`, the booking team's small in-memory stand-in for the library. It takes seat names and their initial held flags. Its extra `isHeld` method lets tests inspect committed state. It makes changes in a private copy, committing that draft if the callback fulfills and discarding it if the callback rejects. The examples run one transaction at a time; this copy-and-replace model does not provide concurrent transaction isolation.

```typescript
const store = testStore([["A1", false], ["A2", false]]);
console.log(await submit(store, ["A1", "A2"])); // "Booked A1, A2."
console.log(store.isHeld("A1")); // true
console.log(store.isHeld("A2")); // true
```

**Guy**: "The handler already reports the refusals, and the transaction rolls back. Why change `bookParty`'s contract?"

**Dafna**: "The caller has to know about `SeatRefused`, but `Promise<Booking>` doesn't mention it. I'd like the ordinary refusal in the return type. Then the page has to choose a branch before it uses the booking."

## The Debate

### Put the refusal in the signature

Dafna's patch adds the application's result type:

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

**Dafna**: "The catch is next to `hold`. I wanted it handling the seat operation, not errors from starting or committing the transaction."

Her replacement `bookParty` catches the known refusal inside the callback:

```typescript
// Replacement bookParty: conversion inside the transaction.
async function bookParty(
  store: Store,
  seats: readonly string[],
): Promise<Result<Booking, Failure>> {
  return store.transaction(async tx => {
    try {
      for (const seat of seats) await tx.hold(seat);
      return { ok: true, value: { seats: [...seats] } };
    } catch (error) {
      if (error instanceof SeatRefused) {
        return { ok: false, error: error.failure };
      }
      throw error;
    }
  });
}
```

The page's handler changes with it:

```typescript
// Replacement submit: the page handles both returned variants.
async function submit(store: Store, seats: readonly string[]): Promise<string> {
  const result = await bookParty(store, seats);
  if (!result.ok) return failureMessage(result.error);
  return `Booked ${result.value.seats.join(", ")}.`;
}
```

**Dafna**: "Try using `result.value` before the check. The compiler asks which result you got. I don't have to find the implementation to learn that a seat might be refused."

**Guy**: "You could still ignore the whole result."

**Dafna**: "You could. This caller doesn't. It displays the reason instead of a booking."

Guy follows the failure branch back to `failureMessage`.

**Guy**: "And the exhaustive switch is the one my catch used. If we add a refusal kind, both versions have to update it."

**Dafna**: "I'm not claiming exceptions can't carry a union. I want the function to say it can return that union."

The [`never` check](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) tests the cases in `Failure`. How the value reached that switch doesn't change the check.

**Gil**: "I'll give them the same seats. A1 is free. A2 is already held."

**Guy**: "Your callback fulfills even when it returns the refusal. Check A1 afterward."

**Dafna**: "Wait. I've caught it before the transaction sees it. Run that case."

### The same answer

Gil runs the original pair of functions against a fresh store, then Dafna's pair against another. Both pages show `"A2 is taken."`. Neither returns a booking message. Both compile.

Gil adds the committed-state check below the response check.

## The Turn

Here is the run with Dafna's replacement:

```typescript
const store = testStore([["A1", false], ["A2", true]]);
console.log(await submit(store, ["A1", "A2"])); // "A2 is taken."
console.log(store.isHeld("A1")); // true
```

**Dafna**: "That seat is held by a booking we never returned."

**Gil**: "With the original functions, that last line is `false`. Same message, different store."

He opens the complete test implementation:

```typescript
function testStore(entries: readonly (readonly [string, boolean])[]) {
  let committed = new Map(entries);
  return {
    async transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
      const draft = new Map(committed);
      const tx: Tx = {
        async hold(seat) {
          if (!draft.has(seat)) {
            throw new SeatRefused({ kind: "unknown-seat", seat });
          }
          if (draft.get(seat)) {
            throw new SeatRefused({ kind: "occupied", seat });
          }
          draft.set(seat, true);
        },
      };
      const value = await work(tx);
      committed = draft;
      return value;
    },
    isHeld(seat: string) { return committed.get(seat); },
  };
}
```

**Guy**: "A1 gets written to the draft. A2 throws. Your catch handles it and returns `{ ok: false, error }`. The callback's promise fulfills with that object."

**Dafna**: "And `{ ok: false }` gets as far as `committed = draft`."

**Guy**: "The store doesn't inspect `ok`."

**Dafna**: "The page handles that object correctly. I need the transaction to roll back before the page ever gets it."

**Liron**: "Our ticket passes through the store first. It commits because we handed one back, without reading what it says."

### Move the catch

Guy selects the `try` inside Dafna's callback and moves it around the awaited transaction. The replacement still returns her `Result`:

```typescript
// Replacement bookParty: conversion after the transaction.
async function bookParty(
  store: Store,
  seats: readonly string[],
): Promise<Result<Booking, Failure>> {
  try {
    const booking = await store.transaction(async tx => {
      for (const seat of seats) await tx.hold(seat);
      return { seats: [...seats] };
    });
    return { ok: true, value: booking };
  } catch (error) {
    if (error instanceof SeatRefused) {
      return { ok: false, error: error.failure };
    }
    throw error;
  }
}
```

**Guy**: "Now the refusal leaves the callback as a rejection. The store rolls back. Only then do we turn it into a value for the page."

**Dafna**: "That `await` keeps the rejection inside the `try`, too. If we returned the transaction's promise instead, a later rejection would pass this catch."

**Gil**: "A1 is free again. The page still gets the same refusal. And the all-free run still commits both seats."

**Dafna**: "We could avoid the partial work. Read all the seats first, return the refusal if one is taken, then hold them."

**Guy**: "If the transaction exposes those checks, yes. Today `Tx` gives us `hold`. We'd need another API, and our preflight would have to keep up with its refusal rules."

**Dafna**: "If those checks stay valid through the writes, preflight would work. We could return the refusal without having changed anything."

**Guy**: "And if `hold` can still refuse, we still need the rollback. Do you want this change to wait for a new library API?"

**Dafna**: "I'd rather move the catch. But I don't want us to conclude that every operation inside a transaction has to throw."

### A transaction that understands results

**Dafna**: "Suppose the steps already return results. You'd have me unwrap each one and throw its failure so the transaction understands it. We can do that once."

The existing library has no result-returning step. To test that alternative, Dafna wraps `hold` in `tryHold`. This wrapper returns the library's known refusals and lets other errors escape:

```typescript
async function tryHold(tx: Tx, seat: string): Promise<Result<void, Failure>> {
  try {
    await tx.hold(seat);
    return { ok: true, value: undefined };
  } catch (error) {
    if (error instanceof SeatRefused) return { ok: false, error: error.failure };
    throw error;
  }
}
```

She names the adapter `transactionResult`. Its callback returns a `Result`. Success commits and comes back as success; refusal must roll back and come back as refusal. It delegates to the existing store, so it must translate a refusal into rejection while the store is still deciding what to do.

```typescript
async function transactionResult<T, E>(
  store: Store,
  work: (tx: Tx) => Promise<Result<T, E>>,
): Promise<Result<T, E>> {
  const signal = new Error("Transaction refused");
  let refused: { ok: false; error: E } | undefined;
  try {
    const value = await store.transaction(async tx => {
      const result = await work(tx);
      if (!result.ok) {
        refused = result;
        throw signal;
      }
      return result.value;
    });
    return { ok: true, value };
  } catch (error) {
    if (error === signal && refused !== undefined) return refused;
    throw error;
  }
}
```

**Guy**: "You put the refusal in a variable and throw a different error. Why not throw the refusal itself?"

**Dafna**: "I need to recognize the rejection I created. This `Error` belongs to this invocation. Nobody inside `work` gets it. The refusal stays typed as `E` in the local variable."

**Guy**: "And when the callback throws something else?"

**Dafna**: "It fails the identity check and goes out again. The store has already rolled back. We don't change a broken connection into 'seat taken'."

**Guy**: "That depends on the store giving you back the same rejection."

**Dafna**: "Which this store promises. If it wraps errors, the adapter has to follow that contract."

Her alternative booking implementation returns the first refusal from the callback. The adapter makes that return abort the transaction:

```typescript
// Alternative bookParty: result-returning steps and their transaction adapter.
async function bookParty(
  store: Store,
  seats: readonly string[],
): Promise<Result<Booking, Failure>> {
  return transactionResult<Booking, Failure>(store, async tx => {
    for (const seat of seats) {
      const result = await tryHold(tx, seat);
      if (!result.ok) return result;
    }
    return { ok: true, value: { seats: [...seats] } };
  });
}
```

**Gil**: "Same checks?"

**Dafna**: "Same stores. Including the one that refuses the second seat."

```typescript
const store = testStore([["A1", false], ["A2", true]]);
console.log(await submit(store, ["A1", "A2"])); // "A2 is taken."
console.log(store.isHeld("A1")); // false
```

**Gil**: "That works too. In another test, I changed the `Tx` passed to the callback: its second `hold` call throws a `TypeError`, after A1 was written to the draft. The outer catch and the adapter both let the original error through. Neither keeps A1."

**Guy**: "So `Result<Booking, Failure>` lists the refusals we return. It doesn't list every way this function can fail."

**Dafna**: "Of course it can still reject. I haven't made JavaScript stop throwing."

**Guy**: "Then leave that in the API description. The next caller might read `Failure` as the complete list."

Guy compares the two transaction calls.

**Guy**: "I don't want booking code choosing between two transaction functions that accept the same callback. Put this callback under the old `store.transaction` and we're back to keeping A1. With a clean build."

**Dafna**: "Then give that code only `transactionResult`. Keep the raw store private in the integration module."

**Guy**: "I'd want that boundary if we adopt it. Otherwise every review has to check which transaction you called."

**Sahar Firstclass**: "You added `tryHold` to test this. If you remove it, which part of the booking needs the adapter?"

**Dafna**: "This booking doesn't. If the steps came from a result-based library, I wouldn't convert each step separately just to keep that catch."

**Liron**: "If we owned the transaction implementation, we could have it commit only when `result.ok` is true. Discarding a draft doesn't intrinsically require an exception. The exception is how this library asks to be told."

**Guy**: "A separate result-aware entry point could do that. Changing the existing generic method would also change what its other callers mean by returning a value."

## The Verdict

Dafna removes the catch from the transaction callback. She keeps the Result-returning `bookParty` with Guy's outer catch, and leaves the page's explicit branch in place.

**Dafna**: "`tryHold` and the adapter can wait until we have result-returning steps worth sharing. I still want the page to see a refused booking in the type."

**Guy**: "And when we do add it, expose one transaction contract to those callers. I don't want them picking by autocomplete."

Gil keeps both assertions in the booking test. He runs the case with the seats reversed as well.

**Gil**: "With A2 first, it refuses before writing anything. Even the broken version leaves A1 free. Keep both orders in the test."

## Additional Takes

**Guy**: "I can't declare what I catch, even when I know what `hold` normally throws."

```typescript
try {
  throw new SeatRefused({ kind: "occupied", seat: "A2" });
} catch (error: SeatRefused) { // Error TS1196: Catch clause variable type annotation must be 'any' or 'unknown' if specified.
  console.log(error);
}
```

Under the book's strict settings, an unannotated catch binding is [`unknown`](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html). The outer catch and `tryHold` use `instanceof` to identify the library refusal. The transaction adapter uses identity to recognize its own signal. Other thrown values keep going to a handler that can deal with them.

**Liron**: "Suppose a queue retries a job whenever its handler rejects, and finishes it whenever the handler fulfills. If this job is supposed to report an occupied seat and stop, we need the transaction to roll back, then the job handler to record the refusal and finish. The store decides whether to commit. The queue decides whether to retry. They need to see different outcomes here."
