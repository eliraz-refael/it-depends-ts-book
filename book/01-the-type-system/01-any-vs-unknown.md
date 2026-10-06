# Chapter 1: The `any` Problem

## The Principle

**Prof. Eli Typeworth** writes `any` and `unknown` on the board.

"When you don't know a value's type, keep it `unknown` until you have checked enough to use it. An `any` lets you skip those checks. If you need that escape hatch, you owe the next caller an account of what is being left unchecked."

Eli draws arrows from every type to `any`, and from `any` back to most of them. He leaves out the arrow from `any` to `never`.

Then he draws `unknown`. Every type has an arrow to it. Its outgoing arrows reach only `unknown` itself and `any`.

"Start with assignment. What can we pass to a function that expects a number?"

**Daniel Compiler**: "A value of type `any` can go straight in. Almost any other target type accepts it too. `never`, the type with no possible value, is the exception. In the other direction, every type is assignable to `any`. Watch:"

```typescript
let value: any = "hello";

// These target types all accept any:
const num: number = value;
const bool: boolean = value;
const obj: { name: string } = value;

const impossible: never = value;
// Error: Type 'any' is not assignable to type 'never'.

// any is assignable FROM every type — no error
value = 42;
value = { anything: "goes" };
value = null;
```

"Now compare that with `unknown`:"

```typescript
let value: unknown = "hello";

// unknown is assignable FROM every type — no error
value = 42;
value = { anything: "goes" };
value = null;

// unknown can pass to any, which gives up the checks:
const unchecked: any = value;

// It cannot pass directly to number:
const num: number = value;
//    ^^^ Type 'unknown' is not assignable to type 'number'

// You must narrow first
if (typeof value === "number") {
  const num: number = value; // Now it's safe
}
```

"The function expecting a number accepts `any` without further evidence. With `unknown`, we have to narrow first — or explicitly leave the checks behind by passing through `any`."

## The Debate

### "any is necessary for real-world development"

**Oded Shipley**: "Last Tuesday I needed to integrate a third-party analytics SDK. No types. No DefinitelyTyped package. The vendor documentation was a PDF from 2021. You want me to write a complete type definition for their entire API surface before I can track a button click?"

He pulls up a screen.

```typescript
// Oded's Tuesday afternoon
declare const analytics: any;

analytics.track("button_click", {
  userId: currentUser.id,
  page: window.location.pathname,
});
```

"Shipped in ten minutes. Works perfectly. The alternative was three hours writing type definitions for an SDK we might replace next quarter. I made a business decision."

**Daniel**: "I would accept that declaration to get an untyped SDK working. I would also ask which calls you need to keep using. You may only need to describe a small part of its API."

**Noam Kiperman**: "Let me tell you about *my* Tuesday. I spent four hours debugging a production error that traced back to exactly this kind of 'business decision.' Someone — I'm not naming names, *Oded* — added `any` to a utility function six months ago. One parameter, one `any`. Here's what happened:"

```typescript
// The "just one any" in a utility function
function formatResponse(data: any) {
  return {
    id: data.id,
    name: data.name,
    createdAt: new Date(data.created_at),
  };
}

// Six months later, 47 call sites use formatResponse.
// id and name are any in every return; createdAt is still typed Date.
// The API changes: created_at becomes createdAt.
// No compiler error anywhere.
// Runtime: Invalid Date propagates through the entire feature.
```

"Forty-seven call sites. We updated the response type when the API changed, but this function didn't use it. There was nothing to tell us it was still reading the old field."

**Oded**: "That's a discipline problem, not a language problem. If someone had cleaned up the types—"

**Noam**: "In the next sprint? *They never do.* You said it yourself."

**Oded**: "That's not fair—"

**Noam**: "It's on a sticky note on your desk, Oded. *'We can fix it in the next sprint.'* That parameter had been there for eight sprints. I found the TODO at 2 AM, while I was tracing that `Invalid Date`."

---

### "unknown is just any with extra steps"

**Chen Override**: "Suppose I do check the value. These functions have the same body:"

```typescript
// With unknown
function processInput(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  throw new Error("Unsupported type");
}
```

```typescript
// With any
function processInputUnsafe(value: any) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  throw new Error("Unsupported type");
}
```

"Identical runtime code. Identical JavaScript output. So what's the actual difference? Aren't you just adding ceremony for the same result?"

**Dafna Functor**: "Now remove the check. The `unknown` version won't let you call the method:"

```typescript
function processInputSafe(value: unknown) {
  return value.toUpperCase();
  //     ^^^^^ 'value' is of type 'unknown'
}
```

```typescript
function processInputUnsafe(value: any) {
  return value.toUpperCase();
  // No error. Compiles fine. Explodes at runtime if value isn't a string.
}
```

"The `any` version still compiles."

**Daniel**: "Chen's two functions do run the same checks. Now take a different function that returns `any`. Its callers can use the result without checking it:"

```typescript
function parseConfig(raw: any): any {
  return JSON.parse(raw);
}

const config = parseConfig(input);
config.database.host.toUpperCase(); // No error. No safety. Good luck.
```

```typescript
function parseConfigSafe(raw: string): unknown {
  return JSON.parse(raw);
}

const config = parseConfigSafe(input);
config.database.host.toUpperCase();
// ^^^ 'config' is of type 'unknown'
// You MUST narrow before you can use it.
```

**Daniel**: "The `any` return lets the caller read `database.host` and call a method without a check. The `unknown` return makes that caller check what came back."

**Chen**: "So keeping the check in my function isn't enough if I return `any`. The next caller can skip theirs."

**Noam**: "That's the caller I get paged about."

---

### "any as a migration strategy"

**Eden Legacy**: "On a three-million-line migration, we tried requiring complete types for every converted module. We got stuck on modules whose dependencies weren't typed yet. We had to let some of those calls through:"

In these snapshots, `Promise<UserProfile>` describes the value the promise will resolve to. The type argument in `api.get<UserProfile>` tells the API client what type to report to its caller; it does not check the response body.

```typescript
// Week 1: Rename .js to .ts, add any where needed
export function fetchUserProfile(userId: any): any {
  return api.get(`/users/${userId}`);
}

// Month 2: Type the boundaries
export function fetchUserProfile(userId: string): Promise<any> {
  return api.get<any>(`/users/${userId}`);
}

// Month 4: Type everything
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
}

export function fetchUserProfile(userId: string): Promise<UserProfile> {
  return api.get<UserProfile>(`/users/${userId}`);
}
```

"That let us type the callers without waiting for every dependency. The intermediate version still returns `any`. I'm not calling it finished."

**Noam**: "You're creating typed-looking code that isn't actually typed. It's worse than JavaScript because it gives false confidence. A developer sees `.ts` and assumes the compiler is checking things. It isn't."

**Eden**: "It checks the parts we've typed. I'd rather have those checks while we finish the rest. Every `any` we add gets a comment and a ticket. Each sprint we agree which ones to remove. I call it the 'any budget.'"

```typescript
// TODO(migration): Type API response — tracked in JIRA-4521
export function fetchUserProfile(userId: string): Promise<any> {
  return api.get(`/users/${userId}`);
}
```

**Gil Benchmark**: "Which ones count against that budget? Explicit `any`s? Inferred ones? Dependency declarations?"

**Eden**: "Start with the ones we add to application code during the migration. The ticket identifies the boundary we're going to type."

**Gil**: "Then track that population consistently. A falling percentage can mean you added more code around the same untyped boundary."

**Noam**: "I want the boundary fixed."

**Eden**: "So do I. I also want the migration to get past that boundary this week. We can see what's unfinished if we keep the ticket."

**Oded**: "Who gets the ticket?"

**Eden**: "The team that owns the call. Including yours."

---

### "The any-in-generics trap"

**Linoy Nightly**: "Even a typed function can pass `any` straight through. This `T` stands for the array's element type. The return type keeps that same `T`. Look at the two calls:"

```typescript
function firstElement<T>(arr: T[]): T {
  return arr[0];
}

// With a proper type — inference works
const num = firstElement([1, 2, 3]);
//    ^? const num: number

// With any — inference short-circuits
const anything: any[] = [1, 2, 3];
const mystery = firstElement(anything);
//    ^? const mystery: any

// The return type is now any.
// Every function that uses mystery loses type safety.
mystery.thisMethodDoesNotExist(); // No error!
```

"For the second array, `T` is `any`. The function preserves exactly that, and now `mystery` accepts a call to a method that doesn't exist."

The next example previews a conditional type. Its result for `any` is the point here; the rules behind that result will get their own debate.

**Daniel**: "You can also compute a type from another type. This definition extracts a promise's value type and otherwise keeps the input type. `infer U` names the value type it finds:"

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>;
//   ^? type A = string ✓

type B = Unwrap<any>;
//   ^? type B = any
// Not string. Not never. Just... any.
// The conditional produces both branches; the any branch absorbs the other result.
```

"Here one branch contributes `any`, so the resulting union is `any`. The compiler is following its rules. Those rules can preserve the uncertainty all the way to the caller."

**Noam** turns to Oded: "Your generic function can look properly typed while its callers still get `any`. That's why I check what went into it."

**Oded**: "But how often are we writing one of those?"

**Linoy**: "Look at `firstElement`. One array of `any` is enough. You don't have to author a conditional type to pass `any` through a generic. You only have to call one."

**Oded** looks back at the array declaration.

"All right. I'd been looking for angle brackets in our own code."

---

### "any vs type assertions — which is worse?"

**Chen**: "While we're being honest about escape hatches — what's worse, `any` or `as SomeType`? At least `any` is transparent about not knowing. An assertion *actively lies*."

```typescript
// any: "I have no idea what this is"
const data: any = fetchData();
data.process(); // Might work, might not

// assertion: "I'm telling you this is a User"
const user = fetchData() as User;
user.process(); // Might work, might not — but the compiler trusts the lie
```

**Noam**: "An assertion gives the result a type, even if it's a lie. With `any`, reading a property can give you another `any`. I'd rather have one localized lie to find."

**Dafna**: "The asserted value still goes to other functions. What happens to those callers?"

**Dima Bridge**: "Follow the properties. In the first version they stay `any`. In the second they get the types declared in `ServerConfig`:"

```typescript
// any: scope problem — it spreads
function getConfig(): any {
  return JSON.parse(rawConfig);
}
const config = getConfig();
const port = config.server.port; // any
const host = config.server.host; // any
startServer(port, host);         // port and host are unchecked

// assertion: correctness problem — localized lie
const config = JSON.parse(rawConfig) as ServerConfig;
const port = config.server.port; // number (maybe wrong, but contained)
const host = config.server.host; // string (maybe wrong, but contained)
startServer(port, host);         // port and host ARE checked against function signature
```

"The asserted `port` is checked as a number at later calls. If it is really a string at runtime, that static check still passes. The assertion contains the declared type; it does not establish the truth of it."

**Noam**: "So the answer is: `any` is worse?"

**Dima**: "For these calls, `any` lets an unchecked value through. The assertion lets a value through under a possibly false type. I'd use `unknown` and check the fields before passing either one to `startServer`."

**Chen**: "Finally, something everyone can agree on."

**Noam**: "Don't get used to it."

---

### "any in third-party types — whose problem is it?"

**Linoy**: "We haven't written all the `any`s we're using. Express gives this handler a `req.body` typed as `any`:"

```typescript
import express from "express";

const app = express();

app.post("/users", (req, res) => {
  // req.body is any — Express gives us no type safety here
  const email = req.body.email; // any
  const name = req.body.name;   // any

  createUser(email, name); // No type checking on the arguments
});
```

**Noam**: "Put a typed facade in front of it. I want a check before that body reaches `createUser`."

**Oded**: "You want me to wrap Express? *Express.* That's hundreds of endpoints. The cure is worse than the disease."

**Guy Singleton**: "This is exactly what the Adapter pattern is for. You don't wrap *Express*. You create a typed interface for *your* domain and adapt the untyped boundary to it:"

```typescript
// Define your contract
interface CreateUserRequest {
  email: string;
  name: string;
}

// Validate at the boundary
function parseCreateUserRequest(body: unknown): CreateUserRequest {
  if (
    typeof body !== "object" || body === null ||
    typeof (body as Record<string, unknown>).email !== "string" ||
    typeof (body as Record<string, unknown>).name !== "string"
  ) {
    throw new ValidationError("Invalid request body");
  }
  return body as CreateUserRequest;
}

// Your handler is now fully typed
app.post("/users", (req, res) => {
  const { email, name } = parseCreateUserRequest(req.body);
  // email: string, name: string — guaranteed
  createUser(email, name);
});
```

"You don't type the framework. You type the boundary between the framework and your code."

**Dafna**: "For a new service I'd look for a framework that uses a schema to validate the request and infer its type. Then we wouldn't have to maintain this check and `CreateUserRequest` separately."

**Chen**: "We're still maintaining this adapter and tracking changes upstream. What happens when an upgrade changes the request body we receive?"

**Guy**: "We check the adapter against the new input. If it can still produce our domain type, the callers can stay as they are. That's why I want the interface here."

**Oded**: "Fine. For critical paths — auth, payments — I'll wrap. For the admin dashboard's logging middleware? I'm using `req.body` directly and you can't stop me."

**Noam**: "I can block your PR."

**Oded**: "You already block all my PRs."

---

### "The function parameter problem"

**Oded**: "What about the event system? It stores callbacks for different events in one map. The payload depends on the event name:"

```typescript
// An event system where handlers receive different payloads
type EventHandler = (payload: any) => void;

const handlers: Map<string, EventHandler[]> = new Map();

function on(event: string, handler: EventHandler) {
  const list = handlers.get(event) ?? [];
  list.push(handler);
  handlers.set(event, list);
}

on("user:login", (payload) => {
  // payload is any — what did we receive? Who knows!
  console.log(payload.userId);
});
```

"What do you type that `payload` as? It's different for every event."

**Dafna**: "Write down which payload goes with each event name. `keyof EventMap` is the set of those names. `E` selects one; `EventMap[E]` selects its payload type:"

```typescript
// Generics: the caller constrains the type
interface EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "order:created": { orderId: string; total: number };
}

function on<E extends keyof EventMap>(
  event: E,
  handler: (payload: EventMap[E]) => void,
) {
  const list = handlers.get(event) ?? [];
  list.push(handler as (payload: EventMap[keyof EventMap]) => void);
  handlers.set(event, list);
}

on("user:login", (payload) => {
  console.log(payload.userId);    // string ✓
  console.log(payload.timestamp); // number ✓
});
```

"Define the relationship between event names and payload types once. The generic infers the rest."

**Guy**: "Or pass the event name with the payload. The handler checks `type` before reading a field specific to that event:"

```typescript
// Interfaces: define a contract for what the callback receives
interface LoginEvent {
  type: "user:login";
  userId: string;
  timestamp: number;
}

interface LogoutEvent {
  type: "user:logout";
  userId: string;
}

type AppEvent = LoginEvent | LogoutEvent;

function onEvent(handler: (event: AppEvent) => void) {
  // handler receives a discriminated union — fully typed
}

onEvent((event) => {
  if (event.type === "user:login") {
    console.log(event.timestamp); // number ✓ — narrowed
  }
});
```

"Each event carries its own tag. This handler only reads `timestamp` after checking that tag. A handler that needs every event can check all the alternatives."

**Noam**: "There are three events. We can list the calls we accept:"

```typescript
// Overloads: specific signatures for known cases
function on(event: "user:login", handler: (p: { userId: string; timestamp: number }) => void): void;
function on(event: "user:logout", handler: (p: { userId: string }) => void): void;
function on(event: "order:created", handler: (p: { orderId: string; total: number }) => void): void;
function on(event: string, handler: (...args: any[]) => void): void {
  // implementation
}
```

"Every call site is type-safe. The overload signatures constrain what callers see — the implementation signature is hidden."

**Dima**: "Guy's handler receives the whole event and decides which kind it handles. The other two select the payload through the name passed to `on`. All three give these callers a typed payload."

**Chen**: "Dafna's assertion uses `EventMap[keyof EventMap]`, which allows any of the payload types in the map. Noam's implementation takes `any`. What keeps either one tied to the right event?"

**Dima**: "The signatures don't check those implementations for us. They do let us check these calls. We still have to review how the stored handlers get called."

**Oded**: "I'll use the generic version. One list of names and payloads. But I'm leaving Chen's question on the implementation."

**Dafna**: "That's just a map."

**Oded**: "With homework underneath it."

---

### "any as documentation of ignorance"

**Liron Closure**: "Imagine a map with a region marked *'Here be dragons.'* The warning tells you where the mapmaker stopped. You can travel farther, but you know where you are leaving the mapped ground."

"`any` should be your 'here be dragons.' Not a permanent feature of your map, but a marker of what you haven't yet understood. The problem isn't `any` itself — it's when `any` becomes invisible. When it stops being a conscious choice and becomes the default."

**Noam**: "If every `any` had a reason and a ticket to remove it, I could review that."

**Oded**: "A ticket with an owner. We've already tried the sticky note."

---

### "Can you build a real app with zero any?"

**Noam**: "My team runs zero `any` in production code. It's achievable. We've done it for two years."

**Oded**: "Your team is eight people building an internal tool. Try zero `any` with forty developers and three acquired codebases."

**Eden**: "I had eleven left at the end of my last migration. I could tell you why each was there. Getting from that to zero would have been a different project."

**Chen**: "Define 'zero.' Does `any` in test mocks count? In build scripts? In type-test files? In generated code?"

**Noam**: "Production code. That's the line. Test utilities, build scripts, type-level tests — I won't die on that hill. But anything that ships to users? Zero."

**Oded**: "Production code. I'll remember that."

## The Turn

**Daniel** scrolls back to Noam's event-handler overloads.

"Your implementation takes `any`. What ticket would you put on that?"

**Noam**: "The public overloads restrict the handlers."

"Yes. What lets you remove the `any` underneath them?"

Noam reads the signatures again.

"A different implementation that preserves the event-to-payload association. I haven't shown one."

**Oded**: "So 'tracked for removal' can mean you don't know how to remove it."

**Noam**: "In this example, yes. I'd still want the association tested. The implementation must only call a handler with its event's payload."

**Daniel**: "Then document that invariant. A comment promising removal doesn't check it."

**Eden**: "A migration placeholder gets an owner and a next step. A helper we intend to keep gets a reason and tests. We shouldn't give both the same unfinished ticket."

**Oded**: "And the SDK I might replace next quarter?"

**Noam**: "Still a ticket. You know how to type the calls you use."

## The Verdict

> Default to `unknown` for uncertain values. Justify an `any` by describing the unchecked assumption and how it is maintained. Track temporary gaps for replacement; review deliberate implementation compromises when their code changes.

**For this codebase:**

1. **Default to `unknown`** for values of uncertain type
2. **Use type narrowing** — type guards, `instanceof`, discriminated unions — to work with `unknown` values safely
3. **For temporary `any`** in a migration or untyped integration, document the next step and its owner. For a deliberate implementation compromise, document the invariant and test it
4. **Keep `noImplicitAny` enabled** — it is part of TypeScript 7's default strict mode and catches places where TypeScript would otherwise infer `any` without enough evidence. If a legacy project disables it, plan its restoration
5. **Track unfinished boundaries**, not just an `any` percentage; use a consistent counting scope when measuring progress
6. **Wrap untyped boundaries** — create typed facades at system edges where `any` leaks in from dependencies

Here's what it looks like in practice — a module before and after:

```typescript
// Before: scattered any
function handleWebhook(event: any) {
  const user = event.data.user;
  const action = event.type;
  if (action === "purchase") {
    processOrder(user, event.data.order);
  }
  logEvent(action, user);
}

function processOrder(user: any, order: any) {
  const total = order.items.reduce(
    (sum: any, item: any) => sum + item.price * item.quantity, 0,
  );
  chargeUser(user.paymentMethod, total);
}
```

The next version checks the purchase fields in `isPurchaseData`. Its return annotation, `data is PurchaseData`, tells the compiler to treat the original value as `PurchaseData` when the function returns `true`. The checks in its body supply the evidence for that claim. Look at the call inside `handleWebhook`: that is where `event.data` becomes usable by `processOrder`.

```typescript
// After: properly typed with unknown, type guards, and one documented any

interface WebhookEvent {
  type: "purchase" | "refund" | "signup";
  data: unknown;
}

interface PurchaseData {
  user: User;
  order: Order;
}

type PaymentMethod = { token: string };

interface User {
  id: string;
  email: string;
  paymentMethod: PaymentMethod;
}

interface Order {
  items: Array<{ price: number; quantity: number }>;
}

function isPurchaseData(data: unknown): data is PurchaseData {
  if (
    typeof data !== "object" || data === null ||
    !("user" in data) || !("order" in data)
  ) return false;

  const { user, order } = data;
  return (
    typeof user === "object" && user !== null &&
    "id" in user && typeof user.id === "string" &&
    "email" in user && typeof user.email === "string" &&
    "paymentMethod" in user &&
    typeof user.paymentMethod === "object" && user.paymentMethod !== null &&
    "token" in user.paymentMethod && typeof user.paymentMethod.token === "string" &&
    typeof order === "object" && order !== null &&
    "items" in order && Array.isArray(order.items) &&
    order.items.every((item: unknown) =>
      typeof item === "object" && item !== null &&
      "price" in item && typeof item.price === "number" &&
      "quantity" in item && typeof item.quantity === "number"
    )
  );
}

function handleWebhook(event: WebhookEvent) {
  if (event.type === "purchase" && isPurchaseData(event.data)) {
    processOrder(event.data.user, event.data.order);
  }
  logEvent(event.type, event.data);
}

function processOrder(user: User, order: Order) {
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0,
  );
  chargeUser(user.paymentMethod, total);
}

// any: chargeUser's third-party payment SDK has no type definitions.
// Tracked in JIRA-7823 for typed wrapper. Manual invariant:
// paymentMethod is validated by isPurchaseData before reaching here.
declare function chargeUser(method: any, amount: number): Promise<void>;
```

The application logic no longer uses `any`. The payment boundary still does, with a ticket naming the wrapper that needs to be written. The input check stays visible in `isPurchaseData`; declaring the SDK parameter as `any` doesn't perform that check for us.

## Additional Takes

**Oded Shipley**: "Auth and payments first. I still haven't agreed to wrap every logging endpoint."

**Noam Kiperman**: "Put the rest on the migration list. I want to know which ones we're leaving."

**Gil Benchmark**: "And don't call that list a count of all your `any`s. Dependencies and inferred types still need a different check."
