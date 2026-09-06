# Chapter 3: The Two Kingdoms

## The Principle

The previous two chapters dealt with escape hatches — `any`, `unknown`, and type assertions. Those were debates about *safety*. This chapter is a debate about *identity*: the two constructs TypeScript gives you to describe the shape of your data, and what your choice between them reveals about how you think.

**Prof. Eli Typeworth** begins with a deception:

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

He turns to the room. *"Let us return to first principles."*

"For this use case — a simple object shape — the compiler treats them identically. You can assign one to the other without error:"

```typescript
const user1: UserA = { id: "1", name: "Eli", email: "eli@types.edu" };
const user2: UserB = { id: "1", name: "Eli", email: "eli@types.edu" };

const user3: UserA = user2; // No error.
const user4: UserB = user1; // No error.
```

"This is where the confusion begins. They look the same. They behave the same. But an `interface` describes a contract that can be *extended*. A `type` describes a shape that can be *composed*. These are different philosophies wearing similar syntax."

**Daniel Compiler** leans in to show the first crack. *"The compiler disagrees"* — with the premise that these are the same thing:

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

**Guy Singleton** has been waiting for this chapter. *"Where's the interface?"* — everywhere, if you know where to look:

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
  name: "Guy",
  createdAt: new Date(),
};
// Where did 'never' come from? Hope you understand intersection theory.
```

**Noam Kiperman** supports Guy: "The `extends` error message is a diagnosis. The intersection error message is a riddle. In a code review, I can explain the first one in ten seconds. The second one requires a whiteboard and five minutes on how `string & number` collapses to `never`."

**Dafna Functor** writes three smaller shapes.

```typescript
type Identifiable = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };
type Named = { name: string; email: string };

type User = Identifiable & Timestamped & Named;
```

"I want to assemble these independently. Something can have timestamps without being one of our entities."

**Guy** writes underneath:

```typescript
interface UserContract extends Identifiable, Timestamped, Named {}
```

"So can mine. Extending interfaces doesn't require a chain four levels deep."

Dafna checks the resulting properties.

**Guy**: "And if two parts disagree about `id`, this declaration fails. The intersection can give you `id: never` and wait until somebody tries to use it."

**Dafna**: "Yes. The independent parts weren't a reason to choose `&`. I still use intersections when I'm combining types in a generic expression. I don't want a new interface declaration for every intermediate result."

**Guy**: "For this named object, I want the conflict reported here."

**Noam**: "I would too. We know where the conflicting parts were combined."

---

### "Declaration merging — feature or footgun?"

**Linoy Nightly** shifts the terrain:

"Express exposes an interface we can extend to describe fields our middleware adds. We can type `req.user` without forking the framework:"

```typescript
import express from "express";

type AuthenticatedUser = { id: string };
declare function authenticateFromToken(
  token: string | undefined,
): AuthenticatedUser | undefined;

// The import makes this file a module; the augmentation targets global Express.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

const app = express();

app.use((req, res, next) => {
  req.user = authenticateFromToken(req.headers.authorization);
  req.requestId = crypto.randomUUID();
  next();
});
```

"Express's core request type extends this global interface, so inferred handler parameters get the fields too. Augmenting only the `Request` exported by `"express"` doesn't reach those parameters."

This extension point is declared in the [Express core type definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts).

**Guy**: "The fields are optional because a request can reach a handler before this middleware runs. Declaring them doesn't install the middleware."

**Linoy**: "Yes. But the shared type can describe them. You couldn't reopen a type alias this way."

**Chen Override** leans forward: "But have you considered that the same mechanism that lets you augment Express also lets you corrupt your own types?"

```typescript
// file: models/user.ts
export {};

declare global {
  interface User {
    id: string;
    name: string;
  }
}

// file: api/responses.ts (separate module, same explicit global scope)
export {};

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

**Daniel Compiler** settles it:

"Declarations merge when they refer to the same interface in the same scope. Two `User` interfaces in separate modules do not merge just because their names match. Your example deliberately puts both in the global scope. For an extension point that may be useful; for two unrelated models it is a mistake."

**Noam**: "If you're writing a library, `interface` gives consumers the ability to extend your types. If you're writing an application, that same ability is a vector for silent type corruption. *Over my dead type definition.*"

---

### "The things only `type` can do"

**Dafna Functor** has been patient. Now it's time:

"Guy showed you what `interface` does well. Let me show you what it can't do at all:"

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

**Guy** tries to hold the line: "You're showing advanced type-level programming. Most application code doesn't need conditional types or mapped types."

**Linoy Nightly** turns to him:

"Most application code absolutely uses union types. Every time you write `string | null`. Every time you have a status that's `'loading' | 'success' | 'error'`. Every discriminated union. That's `type`. *There's an RFC for that*, by the way — there have been multiple proposals to add union support to `interface`. They've all been rejected. Because interfaces model objects. Unions model choices. They're fundamentally different things."

---

### "Discriminated unions — where `interface` can't compete"

**Dafna** delivers the example that ends the expressiveness debate:

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

**Guy** tries the OOP alternative:

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
  constructor(private data: T, private renderData: (data: T) => string) {}
  render() { return this.renderData(this.data); }
}

class ErrorState implements RequestState<never> {
  constructor(private error: Error) {}
  render() { return `Error: ${this.error.message}`; }
}
```

**Guy** adds a caller:

```typescript
const state = new SuccessState(
  { name: "Ada" },
  (user) => `Hello, ${user.name}`,
);
state.render(); // "Hello, Ada"
```

"No assertion. The renderer knows what data it gets."

**Dafna**: "Now write a second operation over every state. We need to serialize it, or tell the UI which controls to enable."

**Guy**: "I'd add the operation to the contract."

"And implement it in every class. I can put another exhaustive `switch` beside the first one."

**Guy**: "Yes. And when I add a new kind of state, I add a class that implements the contract. Your switches all need a new case."

**Dafna**: "I want to see those places. A new state can affect each operation differently."

**Guy**: "For this UI, I'd use your union. But adding a class without editing existing callers is sometimes the point."

---

### "Performance — does the compiler care?"

**Gil Benchmark** opens his laptop. *"What does the data say?"*

"The TypeScript team's own performance guidance recommends `interface extends` over type intersection for object types. Interfaces create a single flat type that the compiler caches by name. Intersections require the compiler to evaluate the merged properties at each use site."

**Linoy Nightly** provides the source:

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

**Chen Override** pressure-tests: "But have you considered that this matters only at scale? For a fifty-file project, the difference is unmeasurable. And the recommendation applies specifically to deeply nested object type intersections — not to `type` in general. Unions, mapped types, conditionals — there's no `interface` alternative, so there's no performance comparison to make."

**Oded Shipley** interjects: "If your compile time is slow, profile it first. Don't prematurely optimize your *type syntax*. *We can fix it in the next sprint.* — Actually, this time, I'm right."

---

### "Just pick one and be consistent"

**Oded** makes his play:

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

**Chen**: "But have you considered that 'just pick one' means you'll use the wrong tool for the remaining 10%? You can't 'just use interface' for a union type. You can't 'just use type' and expect declaration merging."

**Noam** surprises everyone by partially agreeing with Oded:

"Consistency matters. A codebase that randomly switches between `interface` and `type` for the same kind of thing is harder to read than one that picks wrong consistently. But the rule shouldn't be 'pick one.' It should be 'pick the right one for each *category*, then be consistent within that category.'"

**Oded**: "So you agree with me."

**Noam**: "I agree with a version of you that's more careful with words."

---

## The Turn

**Liron Closure** looks at the object definitions still on the board.

*"Complexity is a choice, not a necessity."*

"You've been asking which keyword is better. That's the wrong question. Let me ask a different one: what are you modeling?"

He pauses the way he always does before a parable.

"A blueprint tells a builder what to construct. It defines capabilities — load-bearing walls, doors that open, windows that let in light. A builder follows a blueprint and produces a thing that *can do* what the blueprint specifies."

"A description tells an observer what they're looking at. It captures shape — this wall is here, this door is there, this window faces east. An observer reads a description and understands a thing that *already is*."

"I often use an `interface` as that blueprint and a `type` as that description."

**Daniel**: "Either keyword can describe an object with methods, or one with only data. That distinction is a convention. It is not enforced by the compiler."

**Liron**: "Yes. A convention for the reader. It still needs exceptions for the things we have just seen."

He looks around the room.

"Most of the code you write is not building things. It's passing data around — receiving it, transforming it, handing it off. You're observers, not builders. The question isn't which keyword is better. The question is: *are you modeling behavior, or are you modeling data?*"

He turns to Guy.

"Guy, your hierarchies are blueprints. They belong where things are being built — services, repositories, class contracts. Dafna, your compositions are descriptions. They belong where data is being shaped — state, events, API responses."

"That is how I would organize this codebase. Guy has also shown why a composed object may deserve an interface even when it contains no behavior."

## The Verdict

> Our default is `type` for data and `interface` for behavioral contracts or deliberate extension points. That is a convention. Use `interface extends` for composed objects when declaration-time conflict checking is useful; use `type` for unions and other type expressions.

**The Accepted Standard — a decision framework:**

| Use case | Recommended | Why |
|----------|-------------|-----|
| Object shape (plain data) | `type` by our convention | Closed declaration; `interface` is also reasonable, especially when composing object types |
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

The table is a starting convention for this book. Both keywords describe object shapes. Choosing between them also depends on whether declarations should merge and where composition conflicts should be reported. Guy's composed interface remains a reasonable choice for data too.

## Additional Takes

**Guy Singleton**: *"Where's the interface?"* — "When someone asks me whether to use `interface` or `type`, I ask them back: are you describing what something *is*, or what something *can do*? That distinction will outlive any syntax debate."

**Oded Shipley**: "Four thousand words to arrive at 'use type by default, interface for contracts.' I could have told you that before lunch." — **Noam Kiperman**: "You would have told us 'just use `any`' before lunch."

**Daniel Compiler**: "One thing nobody mentioned: `interface` names appear in error messages as-is. Complex type intersections expand inline, producing error messages that span thirty lines. If your types are deeply nested, `interface` saves your sanity — not your code, your ability to read the error. *The compiler disagrees* — not with your code, but with your ability to parse the output."

**Chen Override**: "But have you considered that we'll be having this exact debate in five years, about some new construct that subsumes both? TypeScript is still evolving. Today's best practice is tomorrow's 'we used to do it that way.'"
