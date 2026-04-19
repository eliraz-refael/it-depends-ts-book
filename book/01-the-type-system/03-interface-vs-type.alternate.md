# Chapter 3: The False Binary

## The Principle

**Prof. Eli Typeworth** begins with two declarations on the whiteboard:

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

type UserProfileAlias = {
  id: string;
  name: string;
  email: string;
};
```

Then he writes two assignments beneath them:

```typescript
const profileA: UserProfile = {
  id: "u1",
  name: "Eli",
  email: "eli@example.com",
};

const profileB: UserProfileAlias = profileA; // No error
const profileC: UserProfile = profileB; // No error
```

He turns to the room. *"Let us return to first principles."*

"For a plain object shape, `interface` and `type` often describe the same runtime value. This is why the debate never dies. Most developers encounter the overlap before they encounter the differences, and once that happens, style hardens into doctrine."

He underlines `interface`, then `type`.

"But these are not two spellings for the same idea. `interface` is TypeScript's vocabulary for object contracts that may be extended. `type` is TypeScript's vocabulary for naming arbitrary type expressions. Sometimes those jobs overlap. Often they do not."

**Daniel Compiler** adds the first crack in the apparent symmetry. *"The compiler disagrees."*

```typescript
interface RequestContext {
  requestId: string;
}

interface RequestContext {
  userId?: string;
}

const ctx: RequestContext = {
  requestId: "req-123",
  userId: "user-9",
};
```

```typescript
type RequestState = {
  loading: boolean;
};

// type RequestState = {
//   error?: string;
// };
// Error: Duplicate identifier 'RequestState'
```

"An `interface` can be reopened. A `type` alias cannot. If you treat them as interchangeable, one day you will accidentally rely on a difference you never meant to choose."

## The Debate

### "For plain object contracts, they look identical"

**Dima Bridge** starts where most teams start:

"Let's be honest about why this argument consumes code reviews. Most of the time, people are looking at something like this:"

```typescript
interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick(): void;
}

type ButtonPropsAlias = {
  label: string;
  disabled?: boolean;
  onClick(): void;
};
```

"Same properties. Same optional field. Same function signature. Same editor hover. Same runtime JavaScript, because none of this exists at runtime. If you're reviewing a PR with one of these, the temptation is to conclude the whole debate is aesthetic."

**Chen Override** folds his arms. "But have you considered that aesthetics are not trivial in a codebase? If two constructs can describe the same thing, the choice still signals intent. The question is whether that intent is useful enough to standardize."

**Eli** answers before anyone else can:

"Exactly. The overlap is real. The conclusion people draw from that overlap is lazy."

---

### "`interface` reads like a contract"

**Guy Singleton** has been waiting for this chapter since the table of contents.

"When I see `interface`, I know what kind of thing I'm looking at: a named object contract. A surface. A boundary. Something another developer is expected to implement, extend, or depend on."

He writes:

```typescript
interface PaymentGateway {
  charge(amountInCents: number, token: string): Promise<PaymentResult>;
  refund(chargeId: string): Promise<void>;
}

interface PaymentResult {
  id: string;
  status: "approved" | "declined";
}
```

"This is readable in a way `type` is not. Not more powerful. More legible. In review, `interface PaymentGateway` tells me 'this is a public contract.'"

**Noam Kiperman** agrees immediately:

"In application code, readability is not decoration. It's risk control. When I see `interface UserRepository`, I expect a contract with methods and responsibility boundaries. When I see `type UserRepository = ...`, I have to inspect the right-hand side to discover whether it's a simple object shape, a union, an intersection, or something that requires Daniel to explain."

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
}
```

"Could this be a `type` alias? Of course. But `interface` tells the next reader: this is an object boundary, not a type-level trick."

**Oded Shipley** isn't persuaded:

"You're describing naming culture, not language semantics. If your team agrees that `interface` means object contract, fine. But that's a convention you invented, not a compiler guarantee."

**Guy** doesn't blink.

"Of course it's a convention. So is every naming rule that makes a codebase readable."

---

### "`type` is where the language actually grows"

**Dafna Functor** steps in with the patience of someone who has heard "but readability" deployed as a shield against capability too many times.

"Guy is right about one thing: `interface` signals an object contract. That is exactly why it stops being helpful the moment your model is not a single object contract."

She starts with the obvious cases:

```typescript
type ID = string | number;

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

type RouteSegments = [section: string, slug: string];
```

"You cannot write these with `interface`. Not badly. Not awkwardly. Not at all."

**Linoy Nightly** piles on. *"There's an RFC for that"* is unnecessary here, so she settles for speed:

"And that's just the warm-up. `type` aliases are how TypeScript exposes most of its expressive power."

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

"Template literal types. Mapped types. Conditional types. Unions. Tuples. Primitive aliases. This is not niche wizardry anymore. This is mainstream TypeScript."

**Daniel Compiler** clarifies the line:

"`interface` defines object-like shapes. `type` names arbitrary type expressions. If your team says 'always use interface,' what they mean in practice is 'always use interface until the language forces you not to.' That is not a principle. That is procrastination."

**Noam** pushes back, but only halfway:

"No one is denying that `type` does things `interface` cannot. The question is whether that means it should also be your default for plain object shapes."

**Dafna** smiles.

"Not default. Just not demoted."

---

### "`extends` and `&` are not the same design move"

**Daniel Compiler** takes the marker.

"Now we arrive at the part people flatten into bad advice. Teams often say `interface extends` and type intersections are interchangeable. Sometimes they are. Sometimes the difference matters."

```typescript
interface BaseUser {
  id: string;
  email: string;
}

interface AdminUser extends BaseUser {
  role: "admin";
}
```

```typescript
type BaseUserShape = {
  id: string;
  email: string;
};

type AdminUserShape = BaseUserShape & {
  role: "admin";
};
```

"Both are fine. Both produce a usable object type. But they communicate different things."

**Guy** seizes the point:

"`extends` reads like a hierarchy. A specialization. A contract growing in a controlled way."

**Dafna** counters:

"And `&` reads like composition. Build a type from independent pieces instead of introducing ancestry."

Daniel writes a conflict example:

```typescript
interface BaseConfig {
  port: number;
}

interface BrokenConfig extends BaseConfig {
  port: string;
}
// Error: Interface 'BrokenConfig' incorrectly extends interface 'BaseConfig'.
```

Then the intersection version:

```typescript
type BaseConfigShape = {
  port: number;
};

type BrokenConfigShape = BaseConfigShape & {
  port: string;
};

type PortType = BrokenConfigShape["port"];
//    ^? type PortType = never
```

"With `extends`, the conflict is caught at the declaration site. With intersections, incompatible properties collapse, often to `never`, and the pain surfaces later."

**Noam** points at `never` like it's a health hazard.

"This is why broad 'just use type for everything' advice creates garbage fires in large codebases. Someone composes two shapes, one field conflicts, and now the error message reads like the compiler is speaking in curses."

**Dafna** doesn't concede the point entirely:

"No. This is why careless composition creates garbage fires. Intersections are still the right tool when you're assembling orthogonal pieces."

```typescript
type Identified = { id: string };
type Audited = { createdAt: Date; updatedAt: Date };
type Named = { name: string };

type Project = Identified & Audited & Named;
```

"That is not a hierarchy. It shouldn't pretend to be one."

**Dima Bridge** sums it up:

"`extends` is usually clearer when you mean 'this object contract refines that one.' `&` is usually clearer when you mean 'this thing is the combination of these parts.' The problem starts when teams force one reading onto both."

---

### "Declaration merging is either a superpower or a security flaw"

**Linoy Nightly** changes the subject, which in this chapter means finally discussing the one difference that becomes a real production concern.

"There is a category of problem where `interface` is not just clearer. It's the only construct that gives you the behavior you need: open augmentation."

```typescript
interface PluginContext {
  log(message: string): void;
}

interface PluginContext {
  currentUserId?: string;
}

const pluginContext: PluginContext = {
  log(message) {
    console.log(message);
  },
  currentUserId: "u42",
};
```

"That reopening behavior is how libraries let consumers extend shared contracts."

She moves to a more realistic example:

```typescript
interface AppEventMap {
  "user:created": { id: string; email: string };
}

interface AppEventMap {
  "billing:charged": { invoiceId: string; amountInCents: number };
}

type AppEvent = keyof AppEventMap;
```

"Plugins, framework augmentation, event registries, request context extension. This is real, shipped software, not a parlor trick."

**Chen Override** immediately attacks the same feature from the opposite angle:

"And in ordinary app code, it is one of the sneakiest ways to create types nobody intended."

```typescript
// file A
interface FeatureFlags {
  checkoutRedesign: boolean;
}

// file B
interface FeatureFlags {
  newUserProfile: boolean;
}

const flags: FeatureFlags = {
  checkoutRedesign: true,
  newUserProfile: false,
};
```

"If that merge was intentional, fine. If it was accidental, congratulations: your type system just let two unrelated declarations quietly become policy."

**Daniel Compiler** is precise, as always:

"Declaration merging is designed for extension points. It is dangerous as ambient application behavior. If consumers are supposed to add fields, `interface` is the right tool. If reopening would be surprising, prefer `type`."

**Eden Legacy** translates that into migration and maintenance language:

"In app code, accidental openness is expensive. In library code, intentional openness is valuable. Teams blur those two contexts and then wonder why their conventions keep failing."

**Noam** is blunt:

"If I see merging in ordinary app models, I assume something is wrong until proven otherwise."

---

### "Conventions fail when they pretend exceptions don't exist"

**Oded Shipley** makes the practical case.

"Here's what actually happens on teams. Someone gets tired of this debate, writes a style guide that says 'always use interface for objects,' and everyone is happy for two weeks."

Then he writes:

```typescript
type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type ApiResponse<T> = {
  requestId: string;
  state: ApiState<T>;
};
```

"Now you have unions. Generic wrappers. Computed helpers. Template literal event names. You start with an `interface`-first rule, then add exceptions, then exceptions to the exceptions, and six months later your style guide reads like tax law."

**Guy** doesn't object to the problem. He objects to the conclusion.

"Then write a narrower rule."

**Oded**: "Exactly. That's my point. If the rule is bigger than the language, the rule loses."

**Dima** takes over:

"The code-review version of this is simple:

1. If it's a named object contract and openness or extension is part of the design, prefer `interface`.
2. If it's a union, primitive alias, tuple, mapped type, conditional type, or composition-heavy helper, use `type`.
3. If either keyword works, optimize for what the declaration is trying to communicate."

**Chen** nods once.

"That is annoyingly reasonable."

## The Turn

The room has gone quiet in the way it only does when everyone realizes the fight has moved underneath the surface they were arguing about. Then **Gilad Stacktrace** stands.

*"Show me the stack trace."*

Nobody says anything. Gilad draws three boxes on the whiteboard.

In the first, he writes: **Boundary Contract**.

In the second: **Type Computation**.

In the third: **Extension Point**.

"You've all been debating keywords," he says, "when the thing that matters is the job the type is doing."

He points to the first box.

"A boundary contract is a stable object shape another engineer reads and implements. Repository interfaces. Service contracts. Props objects. Here readability matters more than cleverness."

He taps the second.

"Type computation is where you're composing possibilities. Unions. helpers. mapped types. transformations. Here `type` is not an option. It is the tool."

Then the third.

"An extension point is where code you don't control, or code in another module, needs to add structure later. Framework augmentation. plugin registries. library contracts. Here openness is either the point or a bug."

He steps back.

"So stop asking 'interface or type?' in the abstract. Ask a question with operational meaning: *am I declaring a boundary, computing a type, or exposing an extension point?* Once you answer that, the keyword usually answers itself."

He caps the marker.

"And when it doesn't, choose the one that makes the next engineer least likely to make a mistake."

## The Verdict

> `interface` and `type` are not rivals. They are tools optimized for different modeling jobs.

**The Accepted Standard — a decision framework:**

| Situation | Prefer | Why |
|-----------|--------|-----|
| Named public object contract | `interface` | Signals boundary shape clearly and reads well in reviews |
| Component props object | `interface` or `type` | Prefer the clearer local convention; default to `interface` if openness/extension matters |
| Union of states or variants | `type` | `interface` cannot express unions |
| Primitive alias / branded primitive / tuple | `type` | Only `type` can name these directly |
| Mapped, conditional, or template-literal type | `type` | This is type computation, not a plain contract |
| Library or plugin augmentation point | `interface` | Reopening and declaration merging are intentional here |
| Ordinary application model where reopening would be surprising | `type` or single `interface` declaration | Avoid accidental ambient merging |
| Refining one object contract from another | `interface extends` | Usually clearer when the relationship is true subtyping |
| Composing orthogonal fragments | `type` with `&` | Better when the model is additive composition, not hierarchy |

**The review checklist:**

1. Is this declaration naming a plain object contract, or a more complex type expression?
2. Should this type be open to augmentation, or would reopening be a bug?
3. Is the relationship here refinement (`extends`) or composition (`&`)?
4. Which keyword makes the author's intent clearer to the next reader?

**The practical ruling:**

- Prefer `interface` for named object boundaries that benefit from readability and potential extension.
- Prefer `type` for everything involving unions, aliases, tuples, mapped types, conditional types, template literals, or composition-heavy modeling.
- Do not enforce "always interface" or "always type" across a serious TypeScript codebase.

This is not a style war. It is a modeling decision.

## Additional Takes

**Noam Kiperman**: "If the declaration is a public object contract, I want `interface` unless there's a concrete reason not to. If the reason is 'personal preference,' the PR stays open."

**Oded Shipley**: "If your team rule needs three exception sections and a glossary, it isn't a rule. It's a hostage note."

**Linoy Nightly**: "`type` is where all the interesting TypeScript features show up. `interface` is where adults keep the codebase readable."

**Guy Singleton**: "I still want to know where the interface is."

**Dafna Functor**: "And I still want everyone to stop pretending composition is a special case."

**Chen Override**: "Has anyone considered that half this argument exists because developers want a universal rule for a language feature that was never designed to have one?"
