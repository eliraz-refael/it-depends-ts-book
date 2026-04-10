# Chapter 1: The `any` Problem

## The Principle

**Prof. Ada Typeworth** begins:

"Before we debate anything else, we need to talk about the escape hatch. Every type system has one. In TypeScript, it's called `any`, and it is the most misunderstood keyword in the language."

She pauses, the way she always does before the sentence that ends the confusion. *"Let us return to first principles."*

"`any` is not a type. It is the absence of typing — a voluntary exit from the type system. When you write `any`, you are not describing your data. You are telling the compiler: *'I don't know, and I don't want to know.'*"

Ada walks to the whiteboard and draws two arrows. One pointing down from `any` to every other type. One pointing up from every other type to `any`. Both directions. No restrictions.

Then she draws `unknown` — arrows pointing up from every type *to* it, but nothing pointing down. A one-way door.

"That," she says, tapping the whiteboard, "is the difference. And it's the only difference that matters."

**Theo Compiler** leans forward to make it precise:

"Let me put Ada's whiteboard into code. `any` has a property that no real type has — it's both assignable *to* every type and assignable *from* every type. Watch:"

```typescript
let value: any = "hello";

// any is assignable TO every type — no error
const num: number = value;
const bool: boolean = value;
const obj: { name: string } = value;

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

// unknown is NOT assignable TO other types — error!
const num: number = value;
//    ^^^ Type 'unknown' is not assignable to type 'number'

// You must narrow first
if (typeof value === "number") {
  const num: number = value; // Now it's safe
}
```

"That asymmetry is the entire point. `unknown` says 'I don't know *yet*.' `any` says 'I don't want the compiler to check.' They're different statements about different things."

The room is quiet. Then Marcus clears his throat.

## The Debate

### "any is necessary for real-world development"

**Marcus Shipley** starts, because of course he does:

"I appreciate the theory lesson. Truly. But let me tell you about last Tuesday. I needed to integrate a third-party analytics SDK. No types. No DefinitelyTyped package. The vendor documentation was a PDF from 2021. You want me to write a complete type definition for their entire API surface before I can track a button click?"

He pulls up a screen.

```typescript
// Marcus's Tuesday afternoon
declare const analytics: any;

analytics.track("button_click", {
  userId: currentUser.id,
  page: window.location.pathname,
});
```

"Shipped in ten minutes. Works perfectly. The alternative was three hours writing type definitions for an SDK we might replace next quarter. I made a business decision."

**Theo Compiler** speaks before Helena can. The room notices — Theo rarely weighs in this early.

"For a third-party SDK with no types that you might replace next quarter, `declare const analytics: any` is exactly what the compiler team would expect you to do. The sin isn't the `any` — it's forgetting to come back."

Marcus looks genuinely surprised to have an expert in his corner. It won't last.

**Helena Strictland** is already shaking her head:

"Let me tell you about *my* Tuesday. I spent four hours debugging a production error that traced back to exactly this kind of 'business decision.' Someone — I'm not naming names, *Marcus* — added `any` to a utility function six months ago. One parameter, one `any`. Here's what happened:"

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
// Every single one has an untyped return value.
// The API changes: created_at becomes createdAt.
// No compiler error anywhere.
// Runtime: Invalid Date propagates through the entire feature.
```

"One `any`. Forty-seven call sites. A runtime error that the compiler *should* have caught. Your throwaway prototype became production code, Marcus. It always does."

**Marcus**: "That's a discipline problem, not a language problem. If someone had cleaned up the types—"

**Helena**: "In the next sprint? *They never do.* You said it yourself."

**Marcus**: "That's not fair—"

**Helena** leans forward, and there's nothing polite about it now: "It's on a sticky note on your desk, Marcus. *'We can fix it in the next sprint.'* You know what I found when I audited the codebase? That `any` parameter had been there for eight sprints. Eight. With a TODO comment dated from the week you joined the team. Your `any` is my on-call page. Literally. I got paged at 2 AM because of that `Invalid Date`."

Marcus doesn't have a comeback for that one. Not because he agrees — but because the TODO is still there.

---

### "unknown is just any with extra steps"

**Jordan Doubt** has been quiet, arms crossed. Now they unfold:

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

**Kai Functor** responds without hesitation:

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

**Theo Compiler** settles it. *"The compiler disagrees"* — with both of you, actually:

"Jordan's observation is valid — when you *do* write the type guard, the runtime behavior is identical. But here's what `unknown` gives you that `any` never will: downstream safety."

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

**Helena** adds, quietly furious: "So to answer your question, Jordan — no, `unknown` is not `any` with extra steps. `any` is `unknown` with the safety removed. *Over my dead type definition* will I treat them as equivalent."

**Jordan** raises both hands in surrender: "I wasn't arguing for `any`. I was testing whether the `unknown` argument could survive scrutiny."

**Kai**: "And?"

**Jordan**: "It survived. I'll allow it."

---

### "any as a migration strategy"

**Sarah Chen** leans in. This is her territory.

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

**Helena** objects:

"You're creating typed-looking code that isn't actually typed. It's worse than JavaScript because it gives false confidence. A developer sees `.ts` and assumes the compiler is checking things. It isn't."

**Sarah** doesn't flinch:

"The alternative is not migrating at all. Perfect is the enemy of migrated. But — and this is the part people skip — you track it. Every `any` gets a comment. Every sprint has a reduction target. I call it the 'any budget.'"

```typescript
// TODO(migration): Type API response — tracked in JIRA-4521
export function fetchUserProfile(userId: string): Promise<any> {
  return api.get(`/users/${userId}`);
}
```

**Dr. Elena Voss** opens her laptop. *"What does the data say?"*

"Across the enterprise migrations I've studied, the pattern is consistent: teams that use tracked `any` with reduction plans consistently hit low single-digit `any` rates within six months. Teams that try to fully type everything from day one? Most abandon the migration within a quarter."

She turns the screen so everyone can see the chart.

**Jordan**: "What's your sample size, Elena? And how do you control for the fact that teams with tracked `any` probably have better engineering practices across the board?"

**Elena**: "Twelve codebases across four industries. And you're right — correlation isn't causation. But the pattern holds even when I control for team size and codebase age."

**Helena**: "So the data says `any` is a liability even during migration."

**Sarah**: "No. The data says *untracked* `any` is a liability. Tracked `any` with a reduction plan is the most successful migration strategy we have. There's a difference between a controlled burn and a wildfire."

Helena opens her mouth, then closes it. Sarah has a point, and Helena knows it.

**Sarah** adds, quieter now: "I've seen `any` save a migration deadline. I've also seen it cause a six-figure production outage three months later — because nobody went back to finish the job. The `any` isn't the problem. The *forgetting* is the problem."

---

### "The any-in-generics trap"

**Alex Turing** raises a hand:

"Here's something most developers don't know — and I'm betting Marcus doesn't either. `any` in generic type parameters doesn't just skip checking. It actively breaks type inference."

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

**Theo Compiler** expands on this:

"It gets worse with conditional types and mapped types. Watch:"

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>;
//   ^? type A = string ✓

type B = Unwrap<any>;
//   ^? type B = any
// Not string. Not never. Just... any.
// The conditional type gives up and returns any.
```

"When `any` enters a generic pipeline, every type-level computation downstream collapses. It's not that `any` skips a check — it corrupts the inference engine."

**Helena** turns to Marcus:

"See? `any` doesn't just skip checks — it *actively misleads* the type system. It's not neutral. It's destructive."

**Marcus** is, for once, genuinely surprised:

"Okay. I didn't know that. But how often does this actually happen in practice?"

**Dr. Elena Voss** already has the answer:

"In a study of forty TypeScript codebases, 23% of generic functions had at least one call site passing `any`. Of those, 67% had downstream type errors that the compiler could not detect. So — often."

**Marcus** sits back in his chair. This is the first debate where he looks genuinely unsettled rather than strategically defensive.

"Fine. I'll concede generics. But that's an edge case. Most developers aren't writing conditional types."

**Alex Turing** shakes their head: "They're not writing them — but they're *using* them. Every time you call a library function with a generic signature, you're participating in generic inference. *There's an RFC for that*, by the way — improving how `any` propagates through generics. It's been open for three years."

---

### "any vs type assertions — which is worse?"

**Jordan** provokes again:

"While we're being honest about escape hatches — what's worse, `any` or `as SomeType`? At least `any` is transparent about not knowing. An assertion *actively lies*."

```typescript
// any: "I have no idea what this is"
const data: any = fetchData();
data.process(); // Might work, might not

// assertion: "I'm telling you this is a User"
const user = fetchData() as User;
user.process(); // Might work, might not — but the compiler trusts the lie
```

**Helena**: "They're both bad, but `any` is worse because it *propagates*. An assertion is a localized lie — it affects one assignment. An `any` infects every function that touches it."

**Kai Functor**: "They're the same problem wearing different hats. Both are escape hatches from the type system. The question is which escape hatch has a smaller blast radius."

**Nate Bridge** steps in:

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

"If the assertion is wrong, the error surfaces when `port` or `host` hits a function expecting a specific type. With `any`, the error might never surface at compile time — period."

**Helena**: "So the answer is: `any` is worse?"

**Nate**: "The answer is they're different failure modes. `any` has a larger blast radius. Assertions have a more deceptive failure. Pick your poison — or better yet, use `unknown` and avoid both."

**Jordan**: "Finally, something everyone can agree on."

**Helena**: "Don't get used to it."

---

### "any in third-party types — whose problem is it?"

**Alex Turing** shifts to a thornier problem:

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

**Helena**: "Wrap the dependency. Create a typed facade. This isn't hard. And frankly, if a library ships `any` in its public API in 2025, that's a library that doesn't respect its consumers."

**Marcus**: "You want me to wrap Express? *Express.* That's hundreds of endpoints. The cure is worse than the disease."

**Diana Class** speaks up — her first strong moment in the debate:

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

**Kai Functor**: "Or use a library that's typed properly from the start. Fastify, for instance, supports schema-based validation with full type inference. If the types are bad, the library is bad."

**Jordan** can't resist:

"But have you considered that wrapping a dependency creates a maintenance burden? Now you're maintaining your wrapper *and* tracking upstream changes. What happens when Express adds a field to `req.body`'s type signature in a major version?"

**Diana**: "Then you update one adapter instead of hundreds of endpoints. *Where's the interface?* That's the question I always ask. If you have a clear interface between your code and the dependency, upstream changes are a one-line fix. Without it, every endpoint is a potential break."

**Marcus** grudgingly: "Fine. For critical paths — auth, payments — I'll wrap. For the admin dashboard's logging middleware? I'm using `req.body` directly and you can't stop me."

**Helena**: "I can block your PR."

**Marcus**: "You already block all my PRs."

---

### "The function parameter problem"

**Marcus** presents his hardest case:

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

**Kai Functor** proposes generics:

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

**Diana Class** proposes interfaces:

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

**Helena** proposes overloads:

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

**Nate Bridge** evaluates all three. *"Both have a point here"* — well, all three have a point:

"Generics win for libraries — they're extensible and callers define the types. Interfaces with discriminated unions win for application code — they're explicit and exhaustive. Overloads win for APIs with a small, known set of shapes."

He pauses.

"The answer depends on who's calling the function. But notice — none of the three solutions needed `any` at the call site. The callers are fully typed."

**Jordan** leans in: "But have you considered that Kai's generic version has a type assertion in the *implementation*, and Helena's overload has `any` in the fallback signature? You moved the `any` — you didn't eliminate it."

**Nate**: "Fair. The implementations still have rough edges. But the *public API* is type-safe, and that's where the forty call sites live. The assertion is in one place, not forty. That's the same centralization principle Sarah argued for with API boundaries."

**Marcus** looks at all three code blocks on the screen. He doesn't have a counterargument for the call-site safety. But Jordan's point lands too — "zero `any`" was an overstatement, and everyone in the room heard it.

"I'll use the generic pattern for the event system," he says quietly.

**Kai** almost falls off their chair: *"That's just a map."* — specifically, it's a map from event names to payload types. Welcome to type-level programming, Marcus."

**Marcus**: "Don't push it."

---

### "any as documentation of ignorance"

The room has been intense for a while. **Ravi Lambda** has been listening, saying nothing. Now he speaks, and the energy shifts.

"Let me tell you about maps."

A few people exchange glances. Ravi's parables are either illuminating or twenty minutes long. Usually both.

"In ancient cartography, when mapmakers reached the edge of the explored world, they didn't leave the space blank. They wrote: *'Here be dragons.'* They didn't pretend the territory didn't exist. They acknowledged they hadn't explored it yet."

He lets that sit.

"`any` should be your 'here be dragons.' Not a permanent feature of your map, but a marker of what you haven't yet understood. The problem isn't `any` itself — it's when `any` becomes invisible. When it stops being a conscious choice and becomes the default."

This reframes the entire debate. The issue isn't `any` vs `unknown`. It's whether `any` means "I don't know yet" or "I don't want to know."

**Helena** softens — not much, but noticeably:

"If every `any` had a comment explaining *why* and a ticket to remove it, I'd find it... acceptable. Grudgingly."

**Marcus** nods:

"That's actually practical. An `any` with a TODO is a plan. An `any` without one is debt."

It might be the first time they've agreed on anything.

*"Complexity is a choice, not a necessity,"* Ravi adds quietly. "And `any` without intention is the choice to accept complexity you haven't measured."

---

### "Can you build a real app with zero any?"

**Helena** makes her closing claim:

"My team runs zero `any` in production code. It's achievable. We've done it for two years."

**Marcus**: "Your team is eight people building an internal tool. Try zero `any` with forty developers and three acquired codebases."

**Dr. Elena Voss** has been waiting for this. *"What does the data say?"*

"I analyzed thirty-two production codebases last year. Teams with near-zero `any` usage had significantly fewer runtime type errors and spent noticeably less time debugging — and, to my surprise, reported higher developer satisfaction. Teams above 5% `any` had the inverse pattern across all three dimensions."

**Sarah Chen**: "Zero `any` is achievable for greenfield. For migrated codebases, under 1% is the realistic target. *I've seen this fail at scale* — but I've also seen it succeed. My last migration landed at 0.3% — eleven remaining `any`s across two million lines. Every single one was documented."

**Jordan** raises a hand:

"Define 'zero.' Does `any` in test mocks count? In build scripts? In type-test files? In generated code?"

The room considers this. It's a better question than it sounds. Every team draws the line somewhere.

**Helena**: "Production code. That's the line. Test utilities, build scripts, type-level tests — I won't die on that hill. But anything that ships to users? Zero."

**Marcus**: "Even Helena has a threshold. Mark the date."

**Chen Wei** closes the debate:

"The goal isn't zero. The goal is *intentional*. Every `any` should be a choice, not an accident. If you can defend every `any` in your codebase — if you can explain why it's there and when it will be removed — your codebase is healthy. Regardless of the count."

He looks around the room.

"Stop counting. Start accounting."

## The Turn

The debate has settled into consensus — or at least, exhaustion. Helena and Marcus have stopped interrupting each other. Sarah is closing her laptop. Even Jordan seems satisfied.

Then **Theo Compiler** clears his throat.

"Before we wrap up, I want to show you something that might surprise you."

He opens his laptop and navigates to a very specific repository.

"The TypeScript compiler itself — the program that enforces *your* types, that throws errors when *you* write `any`, that Helena relies on to block Marcus's PRs — uses `any` in its own source code."

The room reacts exactly the way you'd expect. Helena's eyes narrow. Marcus's face lights up like it's Christmas morning.

"Don't celebrate yet, Marcus. Here's the part that matters: every instance is documented. The compiler team doesn't *avoid* `any` — they *account* for it. Every `any` in the TypeScript codebase has a comment explaining why it's necessary and what invariant the developer is maintaining manually in place of the type checker."

He shows an example:

```typescript
// From TypeScript's own compiler codebase (simplified):
// any is used here because the node type is narrowed through
// a switch statement that handles all possible SyntaxKind values.
// The type system cannot represent "I've exhaustively checked this"
// in this context without prohibitive type-level complexity.
function visitNode(node: any, visitor: Visitor): Node {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return visitIdentifier(node);
    case SyntaxKind.StringLiteral:
      return visitStringLiteral(node);
    // ... exhaustive handling
  }
}
```

"The people who *built* the type system use `any` when the alternative would be worse. But they never use it accidentally. Every `any` is a conscious, documented decision."

**Marcus** tries: "So you're saying the TypeScript team agrees with me—"

**Theo**: "I'm saying the TypeScript team agrees with Helena's *standard* and your *reality*. They use `any`, but they treat it the way Helena treats it — as something that requires justification, documentation, and scrutiny. Not as something you reach for because the deadline is Thursday."

**Helena**, to her credit, nods: "If the TypeScript team can account for their `any` usage, so can we."

This is the principle the entire chapter has been building toward. Not "never use `any`" — but "never use `any` *accidentally*."

## The Verdict

> `any` is a tool of last resort. When used, it must be intentional, documented, and tracked for removal.

**The Accepted Standard:**

1. **Default to `unknown`** for values of uncertain type
2. **Use type narrowing** — type guards, `instanceof`, discriminated unions — to work with `unknown` values safely
3. **When `any` is necessary** (migration, untyped dependencies, compiler limitations), document *why* and create a tracking ticket
4. **Enable `noImplicitAny`** — implicit `any` is always a bug (more on this in Chapter 5: Strict Mode)
5. **Track `any` usage** as tech debt with measurable reduction targets
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

interface User {
  id: string;
  email: string;
  paymentMethod: PaymentMethod;
}

interface Order {
  items: Array<{ price: number; quantity: number }>;
}

function isPurchaseData(data: unknown): data is PurchaseData {
  return (
    typeof data === "object" && data !== null &&
    "user" in data && "order" in data
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

Where does each voice land? Helena wins the default: `unknown` over `any`, always. Sarah wins the migration path: tracked `any` with a reduction plan beats no migration at all. Marcus wins the acknowledgment that zero isn't the goal — *intentional* is. And Ravi wins the framing: every `any` is a 'here be dragons,' not a permanent feature of the map.

## Additional Takes

**Helena Strictland**: "If your linter doesn't flag `any`, your linter is misconfigured."

**Marcus Shipley**: "I'll accept all of this except the wrapper pattern. Nobody has time for that."

**Chen Wei**: "Then budget the debugging time instead."

**Ravi Lambda**: "The question was never about a keyword. It was about intellectual honesty with your own code."

**Jordan Doubt**: "So we've spent an entire chapter agreeing that `any` is bad. Groundbreaking."

**Helena Strictland**: "We spent an entire chapter defining *exactly how* it's bad and *exactly when* it's acceptable. That's different."
