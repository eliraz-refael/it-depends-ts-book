# Chapter 1: The `any` Problem

## The Principle

**Prof. Eli Typeworth** begins:

"Before we debate anything else, we need to talk about an escape hatch. In TypeScript, `any` lets us bypass checks the rest of this book will rely on."

He writes `any` on the whiteboard. *"Let us return to first principles."*

"`any` is a special type that disables many of the usual checks on a value. When you write it, you are asking the compiler to accept operations without the information it would normally require."

Eli draws arrows from every type to `any`, and from `any` back to most of them. He leaves out the arrow from `any` to `never`.

Then he draws `unknown`. Every type has an arrow to it. Its outgoing arrows reach only `unknown` itself and `any`.

"Start with assignment. What can we pass to a function that expects a number?"

**Daniel Compiler** leans forward to make it precise:

"A value of type `any` can go straight in. Almost any other target type accepts it too. `never` is the exception. In the other direction, every type is assignable to `any`. Watch:"

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

The room is quiet. Then Oded clears his throat.

## The Debate

### "any is necessary for real-world development"

**Oded Shipley** starts, because of course he does:

"I appreciate the theory lesson. Truly. But let me tell you about last Tuesday. I needed to integrate a third-party analytics SDK. No types. No DefinitelyTyped package. The vendor documentation was a PDF from 2021. You want me to write a complete type definition for their entire API surface before I can track a button click?"

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

**Daniel Compiler** speaks before Noam can. The room notices — Daniel rarely weighs in this early.

"I would accept that declaration to get an untyped SDK working. I would also ask which calls you need to keep using. You may only need to describe a small part of its API."

Oded looks genuinely surprised to have an expert in his corner. It won't last.

**Noam Kiperman** is already shaking his head:

"Let me tell you about *my* Tuesday. I spent four hours debugging a production error that traced back to exactly this kind of 'business decision.' Someone — I'm not naming names, *Oded* — added `any` to a utility function six months ago. One parameter, one `any`. Here's what happened:"

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

"One `any`. Forty-seven call sites. A runtime error that the compiler *should* have caught. Your throwaway prototype became production code, Oded. It always does."

**Oded**: "That's a discipline problem, not a language problem. If someone had cleaned up the types—"

**Noam**: "In the next sprint? *They never do.* You said it yourself."

**Oded**: "That's not fair—"

**Noam** leans forward, and there's nothing polite about it now: "It's on a sticky note on your desk, Oded. *'We can fix it in the next sprint.'* You know what I found when I audited the codebase? That `any` parameter had been there for eight sprints. Eight. With a TODO comment dated from the week you joined the team. Your `any` is my on-call page. Literally. I got paged at 2 AM because of that `Invalid Date`."

Oded doesn't have a comeback for that one. Not because he agrees — but because the TODO is still there.

---

### "unknown is just any with extra steps"

**Chen Override** has been quiet, arms crossed. Now he unfolds:

"Can I ask an uncomfortable question? Every time someone uses `unknown`, they immediately follow it with a type guard. Like this:"

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

**Dafna Functor** responds without hesitation:

"The difference is *explicitness*. With `unknown`, you're forced to prove what you have before you use it. Forget the type guard — watch what happens when you skip it:"

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

"With `any`, nothing stops you from skipping the check. The compiler looks the other way. With `unknown`, the compiler is your guardrail."

**Daniel Compiler** settles it. *"The compiler disagrees"* — with both of you, actually:

"Chen's observation is valid — when you *do* write the type guard, the runtime behavior is identical. But here's what `unknown` gives you that `any` never will: downstream safety."

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

"`any` doesn't just skip the check where you write it — it turns off checking for everyone downstream. `unknown` contains the uncertainty. `any` spreads it."

**Noam** adds, quietly furious: "So to answer your question, Chen — no, `unknown` is not `any` with extra steps. `any` is `unknown` with the safety removed. *Over my dead type definition* will I treat them as equivalent."

**Chen** raises both hands in surrender: "I wasn't arguing for `any`. I was testing whether the `unknown` argument could survive scrutiny."

**Dafna**: "And?"

**Chen**: "It survived. I'll allow it."

---

### "any as a migration strategy"

**Eden Legacy** leans in. This is his territory.

"I've migrated three million lines of JavaScript to TypeScript. I know exactly what happens when you try to fully type everything on day one: you don't. The migration stalls at 15% and the team revolts. Here's what actually works:"

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

"`any` is the stepping stone. Without it, there is no migration — there's just a three-month project that dies in planning."

**Noam** objects:

"You're creating typed-looking code that isn't actually typed. It's worse than JavaScript because it gives false confidence. A developer sees `.ts` and assumes the compiler is checking things. It isn't."

**Eden** doesn't flinch:

"The alternative is not migrating at all. Perfect is the enemy of migrated. But — and this is the part people skip — you track it. Every `any` gets a comment. Every sprint has a reduction target. I call it the 'any budget.'"

```typescript
// TODO(migration): Type API response — tracked in JIRA-4521
export function fetchUserProfile(userId: string): Promise<any> {
  return api.get(`/users/${userId}`);
}
```

**Gil Benchmark**: "What are you counting in the reduction target? Explicit `any`s? Inferred ones? Dependency declarations?"

**Eden**: "Start with the ones we add to application code during the migration. The ticket identifies the boundary we're going to type."

**Gil**: "Then track that population consistently. A falling percentage can mean you added more code around the same untyped boundary."

**Noam**: "I want the boundary fixed."

**Eden**: "So do I. I also want the migration to get past that boundary this week. We can see what's unfinished if we keep the ticket."

**Oded**: "Who gets the ticket?"

**Eden**: "The team that owns the call. Including yours."

---

### "The any-in-generics trap"

**Linoy Nightly** raises a hand:

"Here's something most developers don't know — and I'm betting Oded doesn't either. `any` in generic type parameters doesn't just skip checking. It actively breaks type inference."

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

"The generic constraint is gone. The function's entire purpose — preserving the element type — is defeated."

**Daniel Compiler** expands on this:

"It gets worse with conditional types and mapped types. Watch:"

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

**Oded** is, for once, genuinely surprised:

"Okay. I didn't know that. But how often does this actually happen in practice?"

**Linoy**: "Look at `firstElement`. One array of `any` is enough. You don't have to author a conditional type to pass `any` through a generic. You only have to call one."

**Oded** looks back at the array declaration.

"All right. I'd been looking for the brackets on our functions."

---

### "any vs type assertions — which is worse?"

**Chen** provokes again:

"While we're being honest about escape hatches — what's worse, `any` or `as SomeType`? At least `any` is transparent about not knowing. An assertion *actively lies*."

```typescript
// any: "I have no idea what this is"
const data: any = fetchData();
data.process(); // Might work, might not

// assertion: "I'm telling you this is a User"
const user = fetchData() as User;
user.process(); // Might work, might not — but the compiler trusts the lie
```

**Noam**: "They're both bad, but `any` is worse because it *propagates*. An assertion is a localized lie — it affects one assignment. An `any` infects every function that touches it."

**Dafna Functor**: "They're the same problem wearing different hats. Both are escape hatches from the type system. The question is which escape hatch has a smaller blast radius."

**Dima Bridge** steps in:

"`any` is a *scope* problem — it spreads through the type graph like a virus. Assertions are a *correctness* problem — they lie at a single point. Different risks need different mitigations."

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

**Dima**: "The answer is they're different failure modes. `any` has a larger blast radius. Assertions have a more deceptive failure. Pick your poison — or better yet, use `unknown` and avoid both."

**Chen**: "Finally, something everyone can agree on."

**Noam**: "Don't get used to it."

---

### "any in third-party types — whose problem is it?"

**Linoy Nightly** shifts to a thornier problem:

"We keep talking about `any` like it's always something *we* write. But what about when it comes from somewhere else? Express's `req.body` is `any`. Lots of DefinitelyTyped packages are riddled with it. You can write perfect code and still have `any` leak in from dependencies."

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

**Noam**: "Wrap the dependency. Create a typed facade. This isn't hard. And frankly, if a library ships `any` in its public API in 2025, that's a library that doesn't respect its consumers."

**Oded**: "You want me to wrap Express? *Express.* That's hundreds of endpoints. The cure is worse than the disease."

**Guy Singleton** speaks up — his first strong moment in the debate:

"This is exactly what the Adapter pattern is for. You don't wrap *Express*. You create a typed interface for *your* domain and adapt the untyped boundary to it:"

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

**Dafna Functor**: "Or use a library that's typed properly from the start. Fastify, for instance, supports schema-based validation with full type inference. If the types are bad, the library is bad."

**Chen** can't resist:

"But have you considered that wrapping a dependency creates a maintenance burden? Now you're maintaining your wrapper *and* tracking upstream changes. What happens when Express adds a field to `req.body`'s type signature in a major version?"

**Guy**: "Then you update one adapter instead of hundreds of endpoints. *Where's the interface?* That's the question I always ask. If you have a clear interface between your code and the dependency, upstream changes are a one-line fix. Without it, every endpoint is a potential break."

**Oded** grudgingly: "Fine. For critical paths — auth, payments — I'll wrap. For the admin dashboard's logging middleware? I'm using `req.body` directly and you can't stop me."

**Noam**: "I can block your PR."

**Oded**: "You already block all my PRs."

---

### "The function parameter problem"

**Oded** presents his hardest case:

"Fine. Let's talk about a situation where `any` seems genuinely unavoidable. Callback-heavy APIs, event handlers, middleware patterns — places where the function signature *must* accept anything because the actual type depends on context:"

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

Three answers come at once.

**Dafna Functor** proposes generics:

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

**Guy Singleton** proposes interfaces:

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

"A discriminated union gives you exhaustiveness checking. Add a new event type, and the compiler tells you every handler that needs updating."

**Noam** proposes overloads:

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

**Dima Bridge** evaluates all three. *"Both have a point here"* — well, all three have a point:

"Generics win for libraries — they're extensible and callers define the types. Interfaces with discriminated unions win for application code — they're explicit and exhaustive. Overloads win for APIs with a small, known set of shapes."

He pauses.

"The answer depends on who's calling the function. But notice — none of the three solutions needed `any` at the call site. The callers are fully typed."

**Chen** leans in: "But have you considered that Dafna's generic version has a type assertion in the *implementation*, and Noam's overload has `any` in the fallback signature? You moved the `any` — you didn't eliminate it."

**Dima**: "Fair. The implementations still have rough edges. But the *public API* is type-safe, and that's where the forty call sites live. The assertion is in one place, not forty. That's the same centralization principle Eden argued for with API boundaries."

**Oded** looks at all three code blocks on the screen. He doesn't have a counterargument for the call-site safety. But Chen's point lands too — "zero `any`" was an overstatement, and everyone in the room heard it.

"I'll use the generic pattern for the event system," he says quietly.

**Dafna** almost falls off her chair: *"That's just a map."* — specifically, it's a map from event names to payload types. Welcome to type-level programming, Oded."

**Oded**: "Don't push it."

---

### "any as documentation of ignorance"

The room has been intense for a while. **Liron Closure** has been listening, saying nothing. Now he speaks, and the energy shifts.

"Let me tell you about maps."

A few people exchange glances. Liron's parables are illuminating. They are also twenty minutes long. These facts are related.

"Imagine a map with a region marked *'Here be dragons.'* The warning tells you where the mapmaker stopped. You can travel farther, but you know where you are leaving the mapped ground."

He lets that sit.

"`any` should be your 'here be dragons.' Not a permanent feature of your map, but a marker of what you haven't yet understood. The problem isn't `any` itself — it's when `any` becomes invisible. When it stops being a conscious choice and becomes the default."

**Noam** softens — not much, but noticeably:

"If every `any` had a comment explaining *why* and a ticket to remove it, I'd find it... acceptable. Grudgingly."

**Oded** nods:

"That's actually practical. An `any` with a TODO is a plan. An `any` without one is debt."

*"Complexity is a choice, not a necessity,"* Liron adds quietly. "And `any` without intention is the choice to accept complexity you haven't measured."

---

### "Can you build a real app with zero any?"

**Noam** makes his closing claim:

"My team runs zero `any` in production code. It's achievable. We've done it for two years."

**Oded**: "Your team is eight people building an internal tool. Try zero `any` with forty developers and three acquired codebases."

**Eden Legacy**: "I had eleven left at the end of my last migration. I could tell you why each was there. Getting from that to zero would have been a different project."

**Chen** raises a hand:

"Define 'zero.' Does `any` in test mocks count? In build scripts? In type-test files? In generated code?"

The room considers this. It's a better question than it sounds. Every team draws the line somewhere.

**Noam**: "Production code. That's the line. Test utilities, build scripts, type-level tests — I won't die on that hill. But anything that ships to users? Zero."

**Oded**: "Even Noam has a threshold. Mark the date."

## The Turn

**Daniel Compiler** scrolls back to Noam's event-handler overloads.

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

**The Accepted Standard:**

1. **Default to `unknown`** for values of uncertain type
2. **Use type narrowing** — type guards, `instanceof`, discriminated unions — to work with `unknown` values safely
3. **For temporary `any`** in a migration or untyped integration, document the next step and its owner. For a deliberate implementation compromise, document the invariant and test it
4. **Enable `noImplicitAny`** to catch places where TypeScript would otherwise infer `any` without enough evidence
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

Zero `any` in the application logic. One documented, tracked `any` at the untyped boundary. Every value narrowed before use.

The difference isn't just safety — it's *searchability*. When the payment SDK eventually publishes types (or when you write a wrapper), you can find every `any` in the codebase with a single search, read the comment to understand the context, and replace it with confidence. Try doing that when `any` is scattered through fifty files with no documentation.

## Additional Takes

**Noam Kiperman**: "If your linter doesn't flag `any`, your linter is misconfigured."

**Oded Shipley**: "I'll accept all of this except the wrapper pattern. Nobody has time for that."

**Gilad Stacktrace**: "Then budget the debugging time instead."

**Chen Override**: "So we've spent an entire chapter agreeing that `any` is bad. Groundbreaking."

**Noam Kiperman**: "We spent an entire chapter defining *exactly how* it's bad and *exactly when* it's acceptable. That's different."
