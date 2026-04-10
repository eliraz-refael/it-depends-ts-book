# Chapter 3: The Two Kingdoms

## The Principle

The previous two chapters dealt with escape hatches — `any`, `unknown`, and type assertions. Those were debates about *safety*. This chapter is a debate about *identity*: the two constructs TypeScript gives you to describe the shape of your data, and what your choice between them reveals about how you think.

**Prof. Ada Typeworth** begins with a deception:

"Let me show you two definitions. Tell me which is the interface and which is the type alias."

```typescript
interface UserA {
  id: string;
  name: string;
  email: string;
}

type UserB = {
  id: string;
  name: string;
  email: string;
};
```

She turns to the room. *"Let us return to first principles."*

"For this use case — a simple object shape — the compiler treats them identically. You can assign one to the other without error:"

```typescript
const user1: UserA = { id: "1", name: "Ada", email: "ada@types.edu" };
const user2: UserB = { id: "1", name: "Ada", email: "ada@types.edu" };

const user3: UserA = user2; // No error.
const user4: UserB = user1; // No error.
```

"This is where the confusion begins. They look the same. They behave the same. But an `interface` describes a contract that can be *extended*. A `type` describes a shape that can be *composed*. These are different philosophies wearing similar syntax."

**Theo Compiler** leans in to show the first crack. *"The compiler disagrees"* — with the premise that these are the same thing:

```typescript
// interface: open — can be declared again to merge
interface Config {
  port: number;
}
interface Config {
  host: string;
}
// Config is now { port: number; host: string }

// type: closed — cannot be redeclared
type Settings = {
  port: number;
};
// type Settings = {
//   ^^^^^^^^ Error: Duplicate identifier 'Settings'
//   host: string;
// };
```

"An `interface` is a door you can reopen. A `type` is a door that locks behind you. Whether that lock is a feature or a limitation — that's the debate."

## The Debate

### "`extends` is not the same as `&`"

**Diana Class** has been waiting for this chapter. *"Where's the interface?"* — everywhere, if you know where to look:

"Let me show you something that most developers learn the hard way. When you build a hierarchy with `interface extends`, the compiler *checks* for conflicts at the point of declaration:"

```typescript
interface Base {
  id: string;
  createdAt: Date;
}

interface User extends Base {
  name: string;
  email: string;
}
// Clean, readable hierarchy. Every property is accounted for.
```

"Now watch what happens when I introduce a conflict:"

```typescript
interface Employee extends Base {
  id: number;
//^^ Error: Interface 'Employee' incorrectly extends interface 'Base'.
//   Types of property 'id' are incompatible.
//   Type 'number' is not assignable to type 'string'.
}
```

"The error is immediate. It's clear. It tells you *exactly* what went wrong and *exactly* where. Now watch the same thing with type intersections:"

```typescript
type Base = {
  id: string;
  createdAt: Date;
};

type Employee = Base & {
  name: string;
  id: number; // No error here!
};
```

"No error at the declaration. TypeScript silently computes `id: string & number`, which is `never`. The error only surfaces when you try to actually use it:"

```typescript
const emp: Employee = {
  id: "1",
//^^ Error: Type 'string' is not assignable to type 'never'
  name: "Diana",
  createdAt: new Date(),
};
// Where did 'never' come from? Hope you understand intersection theory.
```

**Helena Strictland** supports Diana: "The `extends` error message is a diagnosis. The intersection error message is a riddle. In a code review, I can explain the first one in ten seconds. The second one requires a whiteboard and five minutes on how `string & number` collapses to `never`."

**Kai Functor** counters:

"You're showing me a hierarchy. A chain of dependencies. `Employee extends Base` means Employee is *coupled* to Base. Change Base, and every descendant must be re-evaluated. Intersection is composition — you combine independent pieces without a dependency chain:"

```typescript
type Identifiable = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };
type Named = { name: string; email: string };

type User = Identifiable & Timestamped & Named;
// Each piece is independent. Compose what you need. No hierarchy.
```

"The error messages are worse. I'll grant you that. But the *model* is better. You're assembling from parts, not inheriting from ancestors."

**Diana** fires back with a multi-level hierarchy:

```typescript
interface Entity { id: string; }
interface Timestamped extends Entity { createdAt: Date; updatedAt: Date; }
interface User extends Timestamped { name: string; email: string; }
interface Admin extends User { permissions: string[]; }
// Clear chain. Each level adds meaning. IDE shows the full hierarchy.
```

"Four levels. Every developer can read this top to bottom and understand the relationships. Your intersection version is a flat bag of properties with no visible structure."

**Kai**: "Your hierarchy version is a rigid tree that breaks the moment you need something that's `Timestamped` but not an `Entity`."

**Diana**: "Then you refactor the hierarchy."

**Kai**: "Or you don't build one in the first place."

---

### "Declaration merging — feature or footgun?"

**Alex Turing** shifts the terrain:

"Declaration merging is the reason every Express middleware can add `req.user` without forking the framework. This is a real, shipped capability that only `interface` provides. *There's an RFC for that* — actually, it shipped years ago, and it powers half the TypeScript ecosystem:"

```typescript
// Extending Express's Request — only possible with interface
declare module "express" {
  interface Request {
    user?: AuthenticatedUser;
    requestId: string;
  }
}

// Now every route handler has req.user typed
app.use((req, res, next) => {
  req.user = authenticateFromToken(req.headers.authorization);
  req.requestId = crypto.randomUUID();
  next();
});
```

"Try doing that with a `type`. You can't. The type is closed."

**Jordan Doubt** leans forward: "But have you considered that the same mechanism that lets you augment Express also lets you corrupt your own types?"

```typescript
// file: models/user.ts (global scope)
declare global {
  interface User {
    id: string;
    name: string;
  }
}

// file: api/responses.ts (global scope, different file)
declare global {
  interface User {
    email: string;
    role: "admin" | "user";
  }
}

// Merged result: { id: string; name: string; email: string; role: "admin" | "user" }
// Was this intentional? Or did two developers independently
// declare a User interface without knowing the other existed?
```

"Two developers. Two files. One silently merged type that neither of them intended."

**Theo Compiler** settles it:

"Declaration merging is designed for module augmentation — extending third-party types you don't control. For application code, where you *do* control the types, accidental merging is a bug. The TypeScript team's own guidance: use `interface` for APIs that consumers need to augment. Use `type` for application-level types where accidental merging would be a defect."

**Helena**: "If you're writing a library, `interface` gives consumers the ability to extend your types. If you're writing an application, that same ability is a vector for silent type corruption. *Over my dead type definition.*"

---

### "The things only `type` can do"

**Kai Functor** has been patient. Now it's time:

"Diana showed you what `interface` does well. Let me show you what it can't do at all:"

```typescript
// Union types — interface can't do this
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Mapped types — interface can't do this
type Immutable<T> = { readonly [K in keyof T]: T[K] };

// Conditional types — interface can't do this
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Template literal types — interface can't do this
type EventName = `on${Capitalize<"click" | "hover" | "focus">}`;
// "onClick" | "onHover" | "onFocus"

// Tuple types — interface can't do this cleanly
type Coordinate = [x: number, y: number, z: number];

// Extracting types from values — interface can't do this
const defaultConfig = { port: 3000, host: "localhost", debug: false } as const;
type Config = typeof defaultConfig;
```

*"That's just a map."* Specifically, `type` gives you the entire algebra of types — unions, intersections, conditionals, mapped types. `interface` gives you objects. Objects are one data structure. `type` is the language for describing *all* data structures.

**Diana** tries to hold the line: "You're showing advanced type-level programming. Most application code doesn't need conditional types or mapped types."

**Alex Turing** turns to her:

"Most application code absolutely uses union types. Every time you write `string | null`. Every time you have a status that's `'loading' | 'success' | 'error'`. Every discriminated union. That's `type`. *There's an RFC for that*, by the way — there have been multiple proposals to add union support to `interface`. They've all been rejected. Because interfaces model objects. Unions model choices. They're fundamentally different things."

---

### "Discriminated unions — where `interface` can't compete"

**Kai** delivers the example that ends the expressiveness debate:

"This is the pattern that changed how I think about TypeScript. Not objects with methods — data with shapes:"

```typescript
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function renderProfile(state: RequestState<User>): string {
  switch (state.status) {
    case "idle":
      return "Click to load";
    case "loading":
      return "Loading...";
    case "success":
      return `Hello, ${state.data.name}`;
      //                ^^^^ TS knows data exists here
    case "error":
      return `Error: ${state.error.message}`;
      //                    ^^^^ TS knows error exists here
  }
}
```

"Exhaustive — because the return type is explicit, the compiler verifies every branch returns a `string`. Add a new state — say `'retrying'` — and the function won't compile until you handle it. No class hierarchy gives you this."

**Diana** tries the OOP alternative:

```typescript
interface RequestState<T> {
  render(): string;
}

class IdleState implements RequestState<never> {
  render() { return "Click to load"; }
}

class LoadingState implements RequestState<never> {
  render() { return "Loading..."; }
}

class SuccessState<T> implements RequestState<T> {
  constructor(private data: T) {}
  render() { return `Hello, ${(this.data as User).name}`; }
}

class ErrorState implements RequestState<never> {
  constructor(private error: Error) {}
  render() { return `Error: ${this.error.message}`; }
}
```

She looks at it. Four classes. A constructor in each. An `as User` assertion hiding in `SuccessState`. No compiler-enforced exhaustiveness — if someone adds a `RetryingState`, nothing forces existing code to handle it.

**Diana**, to her credit: "For data modeling — yes. Discriminated unions are cleaner. I'll use `type` for state and `interface` for contracts. *Where's the interface?* — it's at the boundary, where you define what a service must provide. Not where you describe what data looks like."

This is Diana adapting, not retreating. She draws the line clearly: `type` for data, `interface` for behavior contracts.

**Kai**, after a pause: "I should be honest about something. Last month I spent forty minutes debugging a `never` that came from a type intersection conflict. Diana's `extends` would have caught it at the declaration. Composition has costs I don't always admit."

Diana looks at Kai. It might be the first time he's conceded anything to her in the entire book.

---

### "Performance — does the compiler care?"

**Dr. Elena Voss** opens her laptop. *"What does the data say?"*

"The TypeScript team's own performance guidance recommends `interface extends` over type intersection for object types. Interfaces create a single flat type that the compiler caches by name. Intersections require the compiler to evaluate the merged properties at each use site."

**Alex Turing** provides the source:

"This is from the TypeScript wiki. The recommendation is narrowly scoped: when you're creating an object type that extends another object type, `interface extends` can be faster than `type` with `&` — especially in large codebases with deeply nested intersections."

```typescript
// The TS team recommends this for extending object types:
interface Props extends BaseProps {
  title: string;
  onClick: () => void;
}
```

```typescript
// Over this:
type Props = BaseProps & {
  title: string;
  onClick: () => void;
};
// The intersection is re-evaluated at each use site.
```

**Jordan Doubt** pressure-tests: "But have you considered that this matters only at scale? For a fifty-file project, the difference is unmeasurable. And the recommendation applies specifically to deeply nested object type intersections — not to `type` in general. Unions, mapped types, conditionals — there's no `interface` alternative, so there's no performance comparison to make."

**Marcus Shipley** interjects: "If your compile time is slow, profile it first. Don't prematurely optimize your *type syntax*. *We can fix it in the next sprint.* — Actually, this time, I'm right."

---

### "Just pick one and be consistent"

**Marcus** makes his play:

"We've spent five subsections arguing about edge cases that affect 10% of types. Here's the uncomfortable truth:"

```typescript
// For 90% of the types you write:
interface User { id: string; name: string; }
```

```typescript
type User = { id: string; name: string; };
```

"Identical. Pick one. Put it in your ESLint config. Ship the feature."

"I've seen teams spend more time debating this in style guides than they save in a year of 'choosing the right one.' The overhead of the decision is more expensive than the occasional suboptimal choice."

**Jordan**: "But have you considered that 'just pick one' means you'll use the wrong tool for the remaining 10%? You can't 'just use interface' for a union type. You can't 'just use type' and expect declaration merging."

**Helena** surprises everyone by partially agreeing with Marcus:

"Consistency matters. A codebase that randomly switches between `interface` and `type` for the same kind of thing is harder to read than one that picks wrong consistently. But the rule shouldn't be 'pick one.' It should be 'pick the right one for each *category*, then be consistent within that category.'"

**Marcus**: "So you agree with me."

**Helena**: "I agree with a version of you that's more careful with words."

---

## The Turn

The debate has mapped the territory — where each keyword wins, where each falls short. Then **Ravi Lambda** speaks, and as usual, the energy shifts.

*"Complexity is a choice, not a necessity."*

"You've been asking which keyword is better. That's the wrong question. Let me ask a different one: what are you modeling?"

He pauses the way he always does before a parable.

"A blueprint tells a builder what to construct. It defines capabilities — load-bearing walls, doors that open, windows that let in light. A builder follows a blueprint and produces a thing that *can do* what the blueprint specifies."

"A description tells an observer what they're looking at. It captures shape — this wall is here, this door is there, this window faces east. An observer reads a description and understands a thing that *already is*."

"An `interface` is a blueprint. It says: anything that claims to be this must provide these capabilities. A `type` is a description. It says: this is the shape of the data I'm looking at."

He looks around the room.

"Most of the code you write is not building things. It's passing data around — receiving it, transforming it, handing it off. You're observers, not builders. The question isn't which keyword is better. The question is: *are you modeling behavior, or are you modeling data?*"

He turns to Diana.

"Diana, your hierarchies are blueprints. They belong where things are being built — services, repositories, class contracts. Kai, your compositions are descriptions. They belong where data is being shaped — state, events, API responses."

"You've been fighting over the same territory. You don't live in the same kingdom."

## The Verdict

> `type` for describing data. `interface` for defining contracts. When unsure, `type` is the safer default.

**The Accepted Standard — a decision framework:**

| Use case | Recommended | Why |
|----------|-------------|-----|
| Object shape (plain data) | `type` | Consistent with unions/intersections, no accidental merging |
| Union / discriminated union | `type` | Only option |
| Mapped / conditional / utility types | `type` | Only option |
| Function signature | `type` | More natural: `type Handler = (e: Event) => void` |
| Tuple types | `type` | Only option |
| Class contract (`implements`) | `interface` | Clearer intent, better error messages |
| Extending object hierarchies | `interface` | Explicit lineage, catches conflicts at declaration |
| Library public API (consumers may extend) | `interface` | Declaration merging enables augmentation |

**In practice — both in the same codebase:**

```typescript
// type: data shapes, unions, state
type UserId = string & { readonly __brand: "UserId" };

type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

type User = {
  id: UserId;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

// interface: behavioral contracts, class implementations
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

interface Serializable {
  serialize(): string;
}

// interface: library extension points
interface AppConfig {
  port: number;
  host: string;
}
```

The rule is simple: if you're describing what data *looks like*, use `type`. If you're defining what something *must do*, use `interface`. Most TypeScript code describes data — which is why `type` is the safer default. But `interface` isn't going anywhere, and the codebases that use both well are better for it.

## Additional Takes

**Diana Class**: *"Where's the interface?"* — "When someone asks me whether to use `interface` or `type`, I ask them back: are you describing what something *is*, or what something *can do*? That distinction will outlive any syntax debate."

**Marcus Shipley**: "Four thousand words to arrive at 'use type by default, interface for contracts.' I could have told you that before lunch." — **Helena Strictland**: "You would have told us 'just use `any`' before lunch."

**Theo Compiler**: "One thing nobody mentioned: `interface` names appear in error messages as-is. Complex type intersections expand inline, producing error messages that span thirty lines. If your types are deeply nested, `interface` saves your sanity — not your code, your ability to read the error. *The compiler disagrees* — not with your code, but with your ability to parse the output."

**Jordan Doubt**: "But have you considered that we'll be having this exact debate in five years, about some new construct that subsumes both? TypeScript is still evolving. Today's best practice is tomorrow's 'we used to do it that way.'"
