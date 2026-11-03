# Chapter 3: The Two Kingdoms

## The Principle

**Prof. Eli Typeworth**: "Choose the declaration that supports what other code needs to do with it. If both do the job, choose a convention your team can read. The shape alone won't decide. These two describe the same user:"

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

### "An object contract"

**Guy Singleton**: "For a named object, I start with an interface. Here the user has everything in `Base`, plus a name and email:"

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

**Dafna Functor**: "I can describe that with an alias too. Show me what needs the interface."

**Guy**: "Can you use it to add to someone else's declaration?"

---

### "Declaration merging — feature or footgun?"

**Linoy Nightly**: "Our middleware needs somewhere to declare the user and request ID it adds. Express gives us an interface we can reopen."

She adds the fields to the global extension point in the [Express core declarations](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts):

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

**Linoy**: "Express's core request type extends this global interface, so inferred handler parameters get the fields too. Augmenting only the `Request` exported by `"express"` doesn't reach those parameters."

**Guy**: "The fields are optional because a request can reach a handler before this middleware runs. Declaring them doesn't install the middleware."

**Linoy**: "Yes. But the shared type can describe them. You couldn't reopen a type alias this way."

**Chen Override**: "But have you considered... installing two widget packages that each declare a global `User`? What happens when we import both?"

```typescript
// file: node_modules/badge-widget/index.d.ts
export {};
declare global {
  interface User {
    id: string;
    name: string;
  }
}

// file: node_modules/admin-widget/index.d.ts
export {};
declare global {
  interface User {
    email: string;
    role: "admin" | "user";
  }
}

// file: page.ts — both packages are loaded into this program
import "badge-widget";
import "admin-widget";
const user: User = { id: "u1", name: "Ada" };
// Error: Type '{ id: string; name: string; }' is missing the following
// properties from type 'User': email, role
```

**Daniel**: "Both declarations reach the same global scope. They merge, and now the badge widget's user needs the admin fields too. Separate modules protect their local names; these packages explicitly put `User` outside them."

**Noam Kiperman**: "Keep our application model local to its module. If another package needs an extension point, let it name one. I don't want to acquire two required fields by installing a widget."

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
// "onClick" | "onFocus" | "onHover"

// Tuple types — interface can't do this cleanly
type Coordinate = [x: number, y: number, z: number];

// Extracting types from values — interface can't do this
const defaultConfig = { port: 3000, host: "localhost", debug: false } as const;
type Config = typeof defaultConfig;
```

**Dafna**: "These aren't all object shapes. We have choices, tuples, types computed from other types. An alias can name those too."

**Guy**: "You're showing advanced type-level programming. Most application code doesn't need conditional types or mapped types."

**Linoy** turns to him:

"It uses unions. `string | null`, a loading status, a result with a failure branch. Guy, the profile screen needs those. We haven't become library authors by loading a user."

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

**Gil Benchmark**: "The TypeScript performance guidance favors `interface extends` for composing objects. It describes caching interface relationships, while an intersection comparison checks each constituent. I haven't measured these alternatives here."

**Linoy**: "That guidance predates the TypeScript 7 native compiler. I'd try it if a trace pointed here."

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

**Chen**: "Which of our slow types even have an `interface` spelling? What would we replace a union with?"

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

"I've seen teams spend more time debating this in style guides than they save in a year of 'choosing the right one.' We could have shipped the feature while everyone was still choosing a keyword."

**Chen**: "Is the rule for plain objects, or everything? What does the person adding a union do with 'just use interface'?"

**Noam**: "Consistency matters. Switching keywords for the same kind of thing makes me wonder what changed. Pick a default for each category and use it consistently."

**Oded**: "So you agree with me."

**Noam**: "I agree with a version of you that's more careful with words."

---

### "A convention for the reader"

**Liron Closure**: "A blueprint tells a builder what to construct. A description tells an observer what is already there. I often use an `interface` for the blueprint and a `type` for the description."

**Daniel**: "Either keyword can describe methods or data. The compiler doesn't enforce that distinction."

**Liron**: "A convention, then. Guy's service contracts stay interfaces. Dafna's states, events and API responses get aliases."

## The Turn

**Guy**: "An employee record is data. Let's apply that rule. Our base record has a string ID; the employee part brings a number."

He writes the alias version:

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

**Liron**: "Those IDs disagree."

**Guy**: "And the declaration passes. Now someone tries to make an employee:"

```typescript
const emp: Employee = {
  id: "1",
//^^ Error: Type 'string' is not assignable to type 'never'
  name: "Guy",
  createdAt: new Date(),
};
// Where did 'never' come from? Hope you understand intersection theory.
```

**Oded**: "I have a number. I have a string. Apparently we're hiring neither."

**Daniel**: "The intersection requires both at once: `string & number`. No value can satisfy that, so `id` is `never`."

**Guy**: "Now replace those declarations with the interface version. Same string ID in `Base`:"

```typescript
interface Employee extends Base {
//        ^^^^^^^^ Error: Interface 'Employee' incorrectly extends interface 'Base'.
//   Types of property 'id' are incompatible.
//   Type 'number' is not assignable to type 'string'.
  id: number;
  name: string;
}
```

**Noam**: "The `extends` error message is a diagnosis. The intersection error message is a riddle."

**Dafna**: "I still want to assemble the parts independently. Timestamps don't make everything one of your entities."

```typescript
type Identifiable = { id: string };
type Timestamped = { createdAt: Date; updatedAt: Date };
type Named = { name: string; email: string };

type User = Identifiable & Timestamped & Named;
```

**Guy**: "Extending an interface doesn't require a chain four levels deep. Use the same parts:"

```typescript
interface UserContract extends Identifiable, Timestamped, Named {}
```

"If two disagree about `id`, this declaration fails."

**Dafna**: "Fine. The family tree was optional. For a named object, that error is useful. I still need intersections inside generic type expressions; I'm not declaring an interface for every intermediate result."

**Liron**: "Then data alone isn't a reason to choose the alias. Keep the composed interface when you want the conflict reported there. The convention isn't worth losing that error."

**Oded**: "Two kingdoms. Shared building inspector. Can we write this down now?"

## The Verdict

> Use `type` for unions and other type expressions; use an interface for deliberate extension points or declaration-time checks on composed objects. When either works, choose a convention for the reader.

The team chooses `type` for plain data and `interface` for behavioral contracts, and composed data uses `interface extends` for its diagnostics.

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

## Additional Take

**Daniel Compiler**: "Interface names appear in error messages. A complex intersection can expand into its parts. If the choice is otherwise a tie, try a bad assignment and read what comes back."
