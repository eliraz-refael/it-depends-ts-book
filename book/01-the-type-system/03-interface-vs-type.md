# Chapter 3: The Two Kingdoms

## The Principle

The team wants a convention for choosing between `interface` and `type`. Guy and Dafna have brought different defaults. Eli puts the same user on the board twice.

**Prof. Eli Typeworth**: "Both of these describe the same user. What would make you choose one?"

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

**Eli**: "For this simple object shape, you can assign one to the other without error:"

```typescript
const user1: UserA = { id: "1", name: "Eli", email: "eli@types.edu" };
const user2: UserB = { id: "1", name: "Eli", email: "eli@types.edu" };

const user3: UserA = user2; // No error.
const user4: UserB = user1; // No error.
```

**Eli**: "Choose by what the declaration needs to do beyond describing the shape. Does other code need to reopen it? Where should a conflict between its parts be reported? Does it need to name something other than an object? If none of those differences matters, choose a convention for your readers."

**Daniel Compiler**: "Start with a second declaration of the same name."

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

**Daniel**: "`Config` picked up another field. Redeclaring `Settings` gives an error. If another file declares `Config` in the same scope, do you want it to be able to add to this definition?"

## The Debate

### "`extends` is not the same as `&`"

**Guy Singleton**: "I want conflicts reported where I put the types together. `interface extends` checks them at the declaration. Start with this:"

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

**Guy**: "It points at the declaration and tells me which properties disagree. Now try the intersection:"

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

"No error at the declaration. TypeScript computes `id: string & number`: a value would have to be both a string and a number. There is no such value, so that becomes `never`. The error only surfaces when you try to actually use it:"

```typescript
const emp: Employee = {
  id: "1",
//^^ Error: Type 'string' is not assignable to type 'never'
  name: "Guy",
  createdAt: new Date(),
};
// Where did 'never' come from? Hope you understand intersection theory.
```

**Noam Kiperman**: "The `extends` error message is a diagnosis. The intersection error message is a riddle. The first one names the conflict. The second points at an object literal, and somebody has to go looking for that `number`."

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

**Linoy Nightly**: "I do want to add fields to Express's request. It exposes an interface for that. We can describe what our middleware adds without forking the framework:"

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
      user?: AuthenticatedUser | undefined;
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

**Chen Override**: "What if two application models end up in that same scope?"

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

**Daniel**: "Declarations merge when they refer to the same interface in the same scope. Two `User` interfaces in separate modules do not merge just because their names match. Your example deliberately puts both in the global scope. For an extension point that may be useful; for two unrelated models it is a mistake."

**Noam**: "I can see why a library would expose that extension point. I don't want an unrelated application model adding fields to mine. Keep those definitions closed."

---

### "The things only `type` can do"

**Dafna**: "Now try declaring these with `interface`. You don't need to read every line. Look at what each definition names:"

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

**Dafna**: "These aren't all object shapes. We have choices, tuples, types computed from other types. An alias can name those too."

**Guy**: "You're showing advanced type-level programming. Most application code doesn't need conditional types or mapped types."

**Linoy** turns to him:

"It uses unions. `string | null`, a loading status, a result with a failure branch. You don't have to be writing a library to need those. An interface describes an object shape. A union can describe a choice between shapes."

---

### "What changes when we add a state?"

**Dafna**: "For the profile screen, these states are the whole set:"

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

**Dafna**: "The explicit return type makes the compiler check that every branch returns a `string`. Add a state like `'retrying'` and this function won't compile until we handle it. I want that error when we add a state."

**Guy**: "I'd put `render` in the contract. Each state supplies its implementation."

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

**Dafna**: "And implement it in every class. I can put another exhaustive `switch` beside the first one."

**Guy**: "Yes. And when I add a new kind of state, I add a class that implements the contract. Your switches all need a new case."

**Dafna**: "I want to see those places. A new state can affect each operation differently."

**Guy**: "For this UI, I'd use your union. But adding a class without editing existing callers is sometimes the point."

---

### "Performance — does the compiler care?"

**Gil Benchmark**: "There's guidance on composing object types. I haven't measured these alternatives in our project."

"The TypeScript team's performance wiki recommends `interface extends` over intersections when composing object types. It describes caching relationships between interfaces, and checking each constituent when comparing against an intersection."

**Linoy**: "Here's the [guidance](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections). It predates the native compiler. I'd try it if a trace pointed here."

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
// The same object shape, expressed as an intersection.
```

**Chen**: "So we don't know how much it would save here. And the recommendation is about composing objects. Unions, mapped types, conditionals — there's no equivalent `interface` spelling to swap in."

**Oded Shipley**: "If your compile time is slow, profile it first. Don't prematurely optimize your *type syntax*."

---

### "Just pick one and be consistent"

**Oded**: "Can we settle the plain objects? Most of mine look like this:"

```typescript
// For 90% of the types you write:
interface User { id: string; name: string; }
```

```typescript
type User = { id: string; name: string; };
```

"Identical. Pick one. Put it in your ESLint config. Ship the feature."

"I've seen teams spend more time debating this in style guides than they save in a year of 'choosing the right one.' The overhead of the decision is more expensive than the occasional suboptimal choice."

**Chen**: "For an object like that, fine. The rule still needs exceptions. You can't 'just use interface' for a union type. You can't 'just use type' and expect declaration merging."

**Noam**: "Consistency matters. Switching keywords for the same kind of thing makes me wonder what changed. Pick a default for each category and use it consistently."

**Oded**: "So you agree with me."

**Noam**: "I agree with a version of you that's more careful with words."

---

## The Turn

**Liron Closure** looks at the object definitions still on the board.

**Liron**: "What would you want the choice to tell the next reader?"

"A blueprint tells a builder what to construct. It defines capabilities — load-bearing walls, doors that open, windows that let in light. A builder follows a blueprint and produces a thing that *can do* what the blueprint specifies."

"A description tells an observer what they're looking at. It captures shape — this wall is here, this door is there, this window faces east. An observer reads a description and understands a thing that *already is*."

"I often use an `interface` as that blueprint and a `type` as that description."

**Daniel**: "Either keyword can describe an object with methods, or one with only data. That distinction is a convention. It is not enforced by the compiler."

**Liron**: "Yes. A convention for the reader. It still needs exceptions for the things we have just seen."

"Most of the code you write is not building things. It's passing data around — receiving it, transforming it, handing it off."

He turns to Guy.

"Guy, I'd keep your service and repository contracts as interfaces. Dafna, I'd use aliases for the state, events and API responses."

**Guy**: "And the `UserContract` I composed? That's data too. I still want `extends` to catch the conflict."

**Liron**: "I'd keep that exception. The convention isn't worth giving up that error."

## The Verdict

> Our default is `type` for data and `interface` for behavioral contracts or deliberate extension points. That is a convention. Use `interface extends` for composed objects when declaration-time conflict checking is useful; use `type` for unions and other type expressions.

**A starting convention:**

| Use case | Recommended | Why |
|----------|-------------|-----|
| Object shape (plain data) | `type` by our convention | Closed declaration; `interface` is also reasonable, especially when composing object types |
| Union / discriminated union | `type` | Only option |
| Mapped / conditional / utility types | `type` | Only option |
| Function signature | `type` | More natural: `type Handler = (e: Event) => void` |
| Tuple types | `type` | Direct tuple syntax |
| Class contract (`implements`) | `interface` | Marks a behavioral contract in our convention |
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

## Additional Takes

**Daniel Compiler**: "Interface names appear in error messages. A complex intersection can expand into its parts. If the choice is otherwise a tie, try a bad assignment and read what comes back."
