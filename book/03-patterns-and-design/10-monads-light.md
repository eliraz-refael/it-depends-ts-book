# Chapter 23: Still Waiting for No

## The Principle

**Prof. Eli Typeworth**: "When a step can refuse, the next step needs a rule for that refusal. With `Result`, `map` runs a function on the successful value and wraps whatever it returns. If the function returns another Result, that gives you a Result inside a Result. `andThen` instead uses that returned Result directly. Both carry an earlier refusal onward without calling the function. Look at what the next function returns before choosing between them."

"That can remove repeated checks, but the checks may already read well. Compare the actual callers before replacing them. Arrays have `flatMap` for steps that return arrays. Promise `then` lets its callback return a plain value or a promise or thenable to adopt. For an object with a callable `then`, adoption calls that method with resolve and reject callbacks. If neither is ever called, the promise stays pending. A success-only method that skips its callback on refusal cannot stand in for that protocol. And don't expect array `flatMap` to wait for promises: an array of promises needs `Promise.all` if you want all its values. If all you need is to stop property access on null or undefined, optional chaining already does that without an Option wrapper."

## The Debate

**Guy Singleton**: "Two previews started. One closed."

**Linoy Nightly**: "Which one is still running?"

**Guy**: "The one that said no stock."

**Linoy**: "Then it's finished."

**Guy**: "I'd like you to tell the worker."

Guy has the preview result open beside the worker's counters. The application lets a customer ask whether a quantity is available. It returns an offer or a refusal; it doesn't reserve anything. Six existing screen callers use Linoy's synchronous preview function. The catalogue team has now added a batch of previews for saved customer quantities. Its job API requires an async entry point, so Linoy made one that returns the same object. She did not change the stock check. The existing screen callers still need their synchronous answer.

The worker runs several kinds of job, some still written with ordinary early returns. It passes their return values back without interpreting them. A fulfilled preview, including a refusal, counts as completed. A rejected job increments its failure counter. In either case it must leave the in-flight count.

**Guy**: "A quantity can be invalid too. That is still an answer for the customer. The failure counter is for work we couldn't complete, not every answer they won't like."

**Linoy**: "The completion test passed."

**Guy**: "For two items. Seven items never finishes."

**Dafna Functor**: "Show the preview before the worker."

The stock snapshot has five items. These are the two checks the screens already use:

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

**Guy**: "And this is what the screens call. The quantity belongs in the preview too."

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

**Dafna**: "It returns here. I want to check which return you're expecting. What happens if you map `availability`?"

```typescript
const nested = new Res(parseQty("7")).map(availability);
// Res<Result<Offer, NoStock>, BadQty>
console.log(JSON.stringify(nested.result));
// {"ok":true,"value":{"ok":false,"error":{"kind":"noStock"}}}
```

**Guy**: "The outside says yes."

**Dafna**: "To parsing seven. Its value is the answer about stock. You asked `map` to put that answer inside a success."

**Linoy**: "Which is why the real caller uses `then`. `availability` gives me a Result, I put that in a `Res`, and `then` returns it. The errors become `BadQty | NoStock`. Neither gets hidden inside a successful value."

**Dafna**: "And the inner `map` is right. Building `{ quantity, offer }` doesn't return another Result."

**Guy**: "Can a caller forget the stock error when it writes its return type?"

**Linoy**: "Not this caller. Try keeping only the parser's error."

```typescript
const onlyBadQty: Res<Preview, BadQty> = preview("7"); // Error TS2322
```

**Linoy**: "It says `NoStock` isn't assignable to `BadQty`. The successful type is the preview, and the error type still includes both ways we could have refused. That's part of what I wanted the class to preserve."

**Sahar**: "The union can preserve that without being in a class."

**Linoy**: "It can. I'm showing you what the current caller promises."

**Sahar**: "So two functions with different return shapes need different operations. Why did you choose a name that already accepts both?"

**Linoy**: "Because the six callers already knew promise chains. This looked like the synchronous version."

She puts the two promise calls under the preview.

```typescript
const increased = Promise.resolve(2).then(n => n + 1);
const alsoIncreased = Promise.resolve(2).then(n => Promise.resolve(n + 1));
// Both are Promise<number>, fulfilling with 3.
```

**Linoy**: "I could make `Res.then` accept both too—"

**Dafna**: "Leave that for a moment. Your two calls here already produce the same shape. Your Result calls didn't."

**Linoy**: "The promise adopts the one I return. My `map` puts it in the value."

**Dafna**: "Exactly. It matters which thing you're chaining. With arrays you can see the extra level without opening a union."

```typescript
console.log(JSON.stringify([2, 7].map(n => [n, n])));
// [[2,2],[7,7]]
console.log(JSON.stringify([2, 7].flatMap(n => [n, n])));
// [2,2,7,7]
```

**Guy**: "Our preview has one offer or a refusal. That has four values."

**Dafna**: "An array step can produce several values, or none. A Result step produces a success or carries an error. The shared part is using the next step's container instead of putting another layer around it. That's the chaining pattern people mean when they bring up monads here. The container still decides what happens."

**Sahar**: "And `user?.address?.city` already stops when the next address isn't there. I don't need an Option class just to read that property."

**Dafna**: "Right. That syntax checks null or undefined. It doesn't unwrap a class, and an empty city string stays an empty string."

Guy scrolls past the array calls to the background entry point.

**Guy**: "Can we get back to the customer who isn't buying seven things?"

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

**Eli**: "The compiler would have caught this. `Awaited` has followed `then` to the successful `Preview`. It hasn't kept the `Res`."

**Guy**: "You added a caller that reads `.result`. Put my worker back."

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

**Eli**: "Then I removed the part that let it through. Your worker accepts the return type it actually gets."

**Linoy**: "Wait. The promise is calling *my* `then`?"

**Dafna**: "Yes. When the async function resolves with your object, [JavaScript gets its `then` property](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-createresolvingfunctions). It's callable. JavaScript calls it with a resolve function and a reject function."

**Linoy**: "And my method takes one function."

She follows the success branch with her cursor.

**Linoy**: "It calls that function with the preview. So `goodJob` gets `{ quantity: 2, offer: 'offer-2' }`, with no wrapper."

**Guy**: "The completion test passes while the return value changes. I'll add that assertion. Now do seven."

**Linoy**: "The error branch returns another `Res`. It never calls the function. It doesn't use the second argument either."

**Dafna**: "Returning that refusal from `then` doesn't settle the promise waiting for a callback. Neither resolve nor reject was called."

**Guy**: "So the stock check has answered. The worker is waiting for an answer about whether it answered."

**Linoy**: "And I taught it to say nothing on no."

There is no rejected job to count. `goodJob` has closed; `refusedJob` remains pending. Its `finally` is still waiting too.

**Linoy**: "Then let it be a real thenable. Resolve the preview. Reject the refusal. Both branches finish."

**Guy**: "They do. But this worker increments `failed` for a rejection. No stock is a completed preview, not a broken job. Your change makes seven items a worker failure. We would get two closed jobs and one failure instead of two closed jobs and none."

**Linoy**: "I could resolve with the whole Result instead."

**Dafna**: "You could. Then `await` would give the union, while your synchronous callers currently get the successful value passed into their next step. Which contract would the method named `then` have?"

**Linoy**: "The promise one. I'd need another name for the successful-value chain anyway."

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

**Linoy**: "Including the places that carry the quantity into the final `map`, like this one. I have to rewrite those expressions. A rename changes the method and the references."

**Sahar**: "Six isn't a reason to keep a defect. It is a reason to ask whether removing the class fixes anything the rename leaves broken. Here, I can't show that it does. I also wouldn't introduce the class into a new job just to remove two early returns."

**Linoy**: "Nor would I make you nest the whole job inside callbacks. The screens already use these chains. That's the code I'm trying to repair."

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

**Dafna**: "The helper saves writing that branch. It doesn't force you to use every result. I could call `availability` inside a callback, ignore its answer, and return success. That would compile too. Leave his two checks."

**Linoy**: "Fine. I'm renaming the method, not making every caller fluent."

**Guy**: "Can we leave the old name as an alias until the screens move?"

**Linoy**: "The promise would still find it. Deprecating the name doesn't stop JavaScript calling it. These six callers have to change with the class. I can check all of them in this patch."

She changes `then` to `andThen` in `Res` and in the six callers, including `preview`. The method body stays the same. `loadPreview` still returns the class instance, but resolving its promise no longer finds a callable `then` on it.

These are fresh jobs and fresh counters after the rename:

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

**Guy**: "Ship the rename with those checks. Both jobs close, and the refused preview doesn't count as a worker failure. Keep the class for the screen callers. The other jobs can keep their early returns."

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

**Dafna**: "That has already called `availabilityAsync`. Awaiting `pendingInside` after our rename gives you the same `Res`, with a promise still in its value. If the job needs the answer, await that step and inspect its Result, as in Guy's caller. Or write a helper whose return type is deliberately `Promise<Result<...>>`. `map` hasn't done that work for you."
