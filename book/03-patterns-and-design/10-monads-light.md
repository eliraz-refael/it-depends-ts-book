# Chapter 23: Still Waiting for No

## The Principle

**Prof. Eli Typeworth**: "Look at what the next step returns. A plain value belongs in `map`. Another Result belongs in `andThen`, which uses that Result directly instead of putting it inside a second one. For a step that returns an array, `map` keeps the extra array level and `flatMap` joins it. Before replacing early returns with a chaining helper, write both versions of the function you're changing. You may prefer the checks."

"The lovely complication is promises. Their `then` does both jobs: it maps a plain return value and flattens a returned promise, including an object with a callable `then`. No registration required. You can join a language protocol just by choosing a method name. So a method named `then` belongs to the promise protocol, whatever you meant by it."

## The Debate

**Guy Singleton**: "Two previews started. One closed."

**Linoy Nightly**: "Which one is still running?"

**Guy**: "The one that said no stock."

**Linoy**: "Then it's finished."

**Guy**: "I'd like you to tell the worker."

Guy has the preview result open beside the worker's counters. The catalogue team runs a batch of availability previews for saved customer quantities. Its worker requires an async entry point. A preview can produce an offer or a refusal; either answer should close the job.

**Guy**: "No stock isn't a broken job. Neither is an invalid quantity. The failure counter is for work we couldn't complete."

**Linoy**: "The completion test passed."

**Guy**: "For quantity two. Quantity seven never finishes."

**Dafna Functor**: "Where does the no-stock answer come from?"

**Linoy**: "The same check as the screens. There are six callers there, all synchronous. I only added an async entry point for the batch."

The stock snapshot has five items. Checking it doesn't reserve anything:

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type BadQty = { kind: "badQty" };
type NoStock = { kind: "noStock" };
type Offer = { id: string };
type Preview = { quantity: number; offer: string };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function parseQty(text: string): Result<number, BadQty> {
  const n = Number(text);
  return Number.isInteger(n) && n > 0
    ? ok(n)
    : { ok: false, error: { kind: "badQty" } };
}

function availability(n: number): Result<Offer, NoStock> {
  return n <= 5
    ? ok({ id: `offer-${n}` })
    : { ok: false, error: { kind: "noStock" } };
}
```

**Linoy**: "I put the union in `Res` so those callers could chain the checks. `map` changes a successful value. `then` takes a step that returns another `Res`. Either one leaves a refusal alone."

```typescript
class Res<T, E> {
  constructor(readonly result: Result<T, E>) {}

  map<U>(step: (value: T) => U): Res<U, E> {
    return new Res(this.result.ok
      ? ok(step(this.result.value))
      : this.result);
  }

  then<U, F>(step: (value: T) => Res<U, F>): Res<U, E | F> {
    return this.result.ok
      ? step(this.result.value)
      : new Res<U, E | F>(this.result);
  }
}
```

**Guy**: "The screen needs the quantity back with the offer. Show that part."

```typescript
function preview(text: string): Res<Preview, BadQty | NoStock> {
  return new Res(parseQty(text)).then(n =>
    new Res(availability(n)).map(offer => ({
      quantity: n,
      offer: offer.id,
    }))
  );
}

console.log(JSON.stringify(preview("2").result));
// {"ok":true,"value":{"quantity":2,"offer":"offer-2"}}
console.log(JSON.stringify(preview("7").result));
// {"ok":false,"error":{"kind":"noStock"}}
```

**Sahar Firstclass**: "We can write that without the class."

**Linoy**: "We can also find out why this one stopped returning."

**Dafna**: "Both screen calls have returned an answer. What happens if you map `availability` instead?"

```typescript
const nested = new Res(parseQty("7")).map(availability);
// Res<Result<Offer, NoStock>, BadQty>
console.log(JSON.stringify(nested.result));
// {"ok":true,"value":{"ok":false,"error":{"kind":"noStock"}}}
```

**Guy**: "The outside says yes."

**Dafna**: "The outer success says the quantity parsed. Its value is the stock answer, which says no. You asked `map` to put that whole answer inside a success."

**Linoy**: "Which is why the real caller uses `then`. `availability` gives me a Result, I put that in a `Res`, and `then` returns it. The errors become `BadQty | NoStock`. Neither gets hidden inside a successful value."

**Dafna**: "And the inner `map` is right. Building `{ quantity, offer }` doesn't return another Result."

**Linoy**: "I named the other method `then` because the people writing those six callers already knew promise chains. This looked like the synchronous version."

She puts the two promise calls under the preview.

```typescript
const increased = Promise.resolve(2).then(n => n + 1);
const alsoIncreased = Promise.resolve(2).then(n => Promise.resolve(n + 1));
// Both are Promise<number>, fulfilling with 3.
```

**Dafna**: "Both give you a number. `then` unwraps the returned promise for you. With arrays, the extra level stays until you ask to join it."

```typescript
console.log(JSON.stringify([2, 7].map(n => [n, n])));
// [[2,2],[7,7]]
console.log(JSON.stringify([2, 7].flatMap(n => [n, n])));
// [2,2,7,7]
```

**Guy**: "Our preview has one offer or a refusal. That has four values."

**Dafna**: "An array step can produce several values, or none. A Result carries one success or an error. But each gives us a way to wrap a value and a way to chain a step returning the same kind of container. That's a monad. `ok(value)` and `andThen` for the union; `[value]` and `flatMap` for arrays; `Promise.resolve(value)` and `then` for promises."

**Guy**: "Then help me find where our answer went."

## The Turn

The background entry point added no new check. It made the existing preview callable as an async job:

```typescript
async function loadPreview(
  text: string,
): Promise<Res<Preview, BadQty | NoStock>> {
  return preview(text);
}
```

**Eli**: "Let me take the worker out. If that returns a Result wrapper, its caller should be able to read it."

```typescript
async function inspect() {
  const result = await loadPreview("7");
  return result.result; // Error TS2339
  // Property 'result' does not exist on type 'Preview'.
}
```

**Eli**: "The compiler would have caught this. `Awaited` reads the first parameter of your `then` callback as the promised value. That parameter is a `Preview`, so it hasn't kept the `Res`."

**Guy**: "You added a caller that reads `.result`. Put my worker back. It runs other kinds of jobs too. Their return values go back to whoever submitted them; the worker only handles completion and failure."

```typescript
const counts = { started: 0, closed: 0, failed: 0 };

async function runJob(work: () => Promise<unknown>): Promise<unknown> {
  counts.started++;
  try {
    return await work();
  } catch (error) {
    counts.failed++;
    throw error;
  } finally {
    counts.closed++;
  }
}

const goodJob = runJob(() => loadPreview("2"));
const refusedJob = runJob(() => loadPreview("7"));
```

**Guy**: "That compiles. My completion test awaits `goodJob` and checks `closed`. It doesn't ask whether the returned value still has a wrapper."

**Eli**: "I added an expectation your worker doesn't have. `Promise<unknown>` accepts whatever value arrives."

**Linoy**: "Wait. The promise is calling *my* `then`?"

**Dafna**: "Yes. When the async function resolves with your object, JavaScript gets its `then` property. It's callable. JavaScript calls it with a resolve function and a reject function."

**Linoy**: "And my method takes one function."

She follows the success branch with her cursor.

**Linoy**: "It calls that function with the preview. So `goodJob` gets `{ quantity: 2, offer: 'offer-2' }`, with no wrapper."

**Guy**: "The completion test passes while the return value changes. I'll add that assertion. Now do seven."

**Linoy**: "The error branch returns another `Res`. It never calls the function. It doesn't use the second argument either."

**Dafna**: "Returning that refusal from `then` doesn't settle the promise waiting for a callback. Neither resolve nor reject was called."

**Guy**: "So the stock check has answered. The worker is waiting for an answer about whether it answered."

**Linoy**: "And I taught it to say nothing on no."

There is no rejected job to count. `goodJob` has closed; `refusedJob` remains pending. Its `finally` is still waiting too.

**Guy**: "Can I just unwrap it before returning? The screens don't have to change."

```typescript
async function loadUnwrapped(
  text: string,
): Promise<Result<Preview, BadQty | NoStock>> {
  return preview(text).result;
}

async function checkUnwrapped() {
  const refused = await runJob(() => loadUnwrapped("7"));
  console.log(JSON.stringify(refused));
  // {"ok":false,"error":{"kind":"noStock"}}
}
```

**Linoy**: "That works. The worker gets the union, both jobs close, and neither is a worker failure."

**Guy**: "One entry point. I'm happy to own that. I'll run quantity two as well. I want its successful value still inside the Result, not another test that only checks completion."

**Dafna**: "Its return type changed too. The async caller gets `Result<Preview, ...>` now, not `Res<Preview, ...>`. It checks `.ok` directly."

**Guy**: "That's fine for this new entry point. The screens still call `preview` and get the class. I'm not asking them to change how they read the answer."

**Linoy**: "But I'm still giving everyone else a `Res` that says it's a promise. They don't even need an async function to find this."

```typescript
const refusedAgain = Promise.resolve(preview("7"));
// Promise<Preview>; remains pending.
```

**Guy**: "The same method gets called."

**Linoy**: "Yes. Unwrapping fixes your entry point. It leaves my class with a `then` that doesn't fulfill the promise contract. I want to fix that too."

**Guy**: "The worker can ship with the unwrap. What are you proposing for the class?"

**Linoy**: "Let it be a real thenable. Resolve the preview. Reject the refusal. Both branches finish."

**Guy**: "They do. But this worker increments `failed` for a rejection. No stock is a completed preview, not a broken job. Your change makes seven items a worker failure. We would get two closed jobs and one failure instead of two closed jobs and none."

**Linoy**: "I could resolve with the whole Result instead."

**Dafna**: "That also works. But your callback used to receive `T`. Now it receives `Result<T, E>`, including the refusal. A screen callback written as `(value: Preview) => ...` can't handle that parameter."

**Linoy**: "I'd be changing the screen chains as well."

**Dafna**: "And their rule. The old method skips a callback on refusal. This one calls it with the refusal. Keeping the name won't keep those callers working."

**Linoy**: "I'd need another name for the successful-value chain anyway."

**Sahar**: "Or no method. Keep the union, write the functions. They can't accidentally become promise methods."

He writes the plain-union version of the operation they have been tracing.

```typescript
function andThen<T, E, U, F>(
  result: Result<T, E>,
  step: (value: T) => Result<U, F>,
): Result<U, E | F> {
  return result.ok ? step(result.value) : result;
}

const offered = andThen(parseQty("7"), availability);
// Result<Offer, BadQty | NoStock>
console.log(JSON.stringify(offered));
// {"ok":false,"error":{"kind":"noStock"}}
```

**Dafna**: "That's the same refusal rule, without a wrapper object. We can map the offer into the preview after it."

**Guy**: "And the six screens?"

**Sahar**: "Their chains become function calls."

**Linoy**: "Six expressions to rewrite, including the ones that carry the quantity into the final `map`. I'd rather rename the method to `andThen`. That preserves their callbacks, their error types and when each step runs. Nobody has to reconstruct the chain as nested function calls."

**Sahar**: "Removing the class also removes the extra shell. The union already tells a caller which answer it got."

**Linoy**: "It does. I'm not claiming the class is necessary. Those callers use it already, and its operations work once the name stops inviting promises in. I can repair that API without replacing it."

**Guy**: "I'd take that patch for the screens. It repairs the class as well as this entry point."

**Sahar**: "Then leave the other jobs out of it. Two early returns don't need a new API."

**Guy**: "For another job that needs those checks directly, I would still write this."

```typescript
function plainPreview(text: string): Result<Preview, BadQty | NoStock> {
  const qty = parseQty(text);
  if (!qty.ok) return qty;
  const offer = availability(qty.value);
  if (!offer.ok) return offer;
  return ok({ quantity: qty.value, offer: offer.value.id });
}
```

**Linoy**: "You're repeating the refusal branch."

**Guy**: "Twice. If I remove the first check, `qty.value` stops compiling. This isn't getting through on somebody remembering to be careful."

**Dafna**: "And both versions keep the same quantity available for the final preview. The helper saves a branch, but this caller doesn't have to squeeze the rest of its work into a callback."

**Linoy**: "Fine. I'm renaming the method, not making every caller fluent."

**Guy**: "Can we leave the old name as an alias until the screens move?"

**Linoy**: "The promise would still find it. Deprecating the name doesn't stop JavaScript calling it. These six callers have to change with the class. I can check all of them in this patch."

Linoy renames the method and its callers. Guy resets the counters and runs both quantities through the original `loadPreview`, without his unwrap.

```typescript
async function checkRepair() {
  const returned = await runJob(() => loadPreview("2"));
  await runJob(() => loadPreview("7"));
  const refused = await loadPreview("7");
  console.log(JSON.stringify(returned));
  // {"result":{"ok":true,"value":{"quantity":2,"offer":"offer-2"}}}
  console.log(JSON.stringify(refused.result));
  // {"ok":false,"error":{"kind":"noStock"}}
  console.log(JSON.stringify(counts));
  // {"started":2,"closed":2,"failed":0}
}
```

## The Verdict

**Guy**: "Ship the rename with those checks. The unwrap worked, but I don't need it to protect this worker once the class is fixed. Both jobs close without turning no stock into a worker failure. The screens keep their chains, and the other jobs keep their early returns."

**Linoy**: "I picked `then` so people could start chaining without learning another word. It bought six callers that knew how to read the expression. It also bought JavaScript a way to call it. I'll explain `andThen`."

**Sahar**: "Show them the two return types. That's most of the explanation."

## Additional Take

**Dafna**: "One more return type before you make the availability check async."

```typescript
async function availabilityAsync(n: number): Promise<Result<Offer, NoStock>> {
  return availability(n);
}

const pendingInside = new Res(parseQty("2")).map(availabilityAsync);
// Res<Promise<Result<Offer, NoStock>>, BadQty>
```

**Dafna**: "That has already called `availabilityAsync`. Awaiting `pendingInside` after our rename gives you the same `Res`, with a promise still in its value. If the job needs the answer, await `availabilityAsync` and inspect the Result it gives back. Or write a helper whose return type is deliberately `Promise<Result<...>>`. `map` hasn't done that work for you."

The promise protocol used in the incident is specified in ECMAScript’s [resolving functions](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-createresolvingfunctions) and [thenable job](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-newpromiseresolvethenablejob).
