# Chapter 2: The Lies We Tell the Compiler

## The Principle

**Prof. Eli Typeworth**: "Last time, Noam called an assertion a localized lie, and Dima pointed out what it lets through: a value under a type that may be false. Before we argue about where that is acceptable, be clear about what an assertion does. It changes the type the compiler uses for an expression. It doesn't convert the value, and nothing checks it at runtime."

He writes two examples on the whiteboard.

"An assertion is an instruction to the compiler: 'I know more than you do.' The question is simple: *do you?*"

```typescript
const input: unknown = "hello";
const len = (input as string).length; // Compiles. No runtime check. Works.

const input2: unknown = 42;
const len2 = (input2 as string).length; // Also compiles. No runtime check. Undefined.
```

"Both lines compile. Both lines produce JavaScript with zero type checking at runtime. The first happens to work. The second silently produces `undefined` — and the compiler will never tell you, because you told *it* to be quiet."

"An annotation would have been refused here: `const text: string = input` doesn't compile while `input` is `unknown`. The assertion stops the compiler from asking. So write an assertion only where you can say what you know that the compiler can't check, and how you know it."

## The Debate

### "`as const` vs `as Type` — the naming collision"

**Linoy Nightly**: "Before we argue about whether `as` is dangerous, can we acknowledge that TypeScript uses the same keyword for two completely opposite operations?"

```typescript
// as const: NARROWS the type (always safe)
const config = { env: "production", port: 3000 } as const;
// type: { readonly env: "production"; readonly port: 3000 }
// More specific than what the compiler would infer.

// as Type: OVERRIDES the type (may lie)
interface Config {
  env: string;
  port: number;
  host: string;
}
const config2 = { env: "production" } as Config;
// Compiler trusts you. Config requires host — no error.
// config2.host is undefined at runtime.
```

"`as const` makes the type *more* precise. `as Type` makes the type *less* trustworthy. Same keyword. Opposite effects."

**Noam Kiperman**: "This is a language design problem, and it's a real one. Developers learn that `as const` is safe — because it is — and then assume `as SomeType` is equally benign. I see it in code reviews constantly. *'But I used `as` and it worked fine before!'* Yes, because last time you used `as const`. This time you're lying."

**Chen Override**: "Doesn't `satisfies` already solve this? It checks a value against a type without replacing the type. Why does anyone still reach for `as Type`?"

**Linoy**: "Because `satisfies` was added in TypeScript 4.9. Millions of lines of code predate it. And it doesn't cover every case."

---

### "Assertions at system boundaries"

**Oded Shipley**: "Take an endpoint we haven't put a parser around yet. You call it. You get JSON back. The compiler knows *nothing* about the shape, and the code calling it still needs a type:"

```typescript
interface ApiUser {
  id: string;
  name: string;
  email: string;
}

const response = await fetch("/api/user/123");
const user = (await response.json()) as ApiUser;
// Is this a lie? Only if the API lied first.
```

"I'm not making this up. I'm asserting a contract. The API documentation says this is a `User`. I'm telling the compiler what the docs tell me."

**Noam**: "You're trusting documentation. Documentation written by humans who may or may not have updated it since the last API change. The parser you agreed to on the critical paths doesn't take their word for it. Here's one for this response:"

```typescript
import { z } from "zod";

const ApiUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

const response = await fetch("/api/user/123");
const raw: unknown = await response.json();
// Note: response.json() returns any in the DOM lib types —
// annotating as unknown is itself a discipline choice.
const user = ApiUser.parse(raw);
// Throws with a clear error if the shape is wrong.
// At the boundary. Where you can handle it.
```

"Runtime validation doesn't trust anyone. Not the API, not the documentation, not the developer who wrote the assertion six months ago and has since left the company."

**Eden Legacy**: "Noam's right about where we should end up. But in a codebase with 400 API calls, you don't add Zod to every one on day one. Put the assertions in one client: one per endpoint, each with a ticket. Then the schemas go in where a wrong shape costs most, and the rest of the work is a list instead of a search."

```typescript
// Centralized: one file, one assertion per endpoint
// Better than 400 scattered assertions
class ApiClient {
  async getUser(id: string): Promise<ApiUser> {
    const response = await fetch(`/api/user/${id}`);
    return (await response.json()) as ApiUser;
    // TODO(validation): Add Zod schema — JIRA-8901
  }
}
```

**Noam**: "I'll accept boundary assertions if they're centralized in one place and tracked for replacement. What I will not accept is `as ApiUser` scattered across forty components."

---

### "The double assertion — `as unknown as Type`"

**Chen**: "Okay, what about this? When a direct assertion fails — TypeScript says the types don't sufficiently overlap — I've seen developers do this:"

```typescript
interface Cat { meow(): void; whiskers: number; }
interface Dog { bark(): void; wagsTail: boolean; }

const cat: Cat = { meow() {}, whiskers: 12 };

// Direct assertion fails — no structural overlap:
// const dog = cat as Dog;
// Error: Conversion of type 'Cat' to type 'Dog' may be a mistake
// because neither type sufficiently overlaps with the other.

// So developers do this:
const dog = cat as unknown as Dog; // No error. Total fiction.
dog.bark(); // Runtime: dog.bark is not a function
```

"You route through `unknown` — the type that means 'I don't know what this is' — and then immediately assert 'I know exactly what this is.' It's type laundering."

**Noam**: "This is putting a fake mustache on a bug and walking it past the type checker. If TypeScript tells you two types don't overlap, *listen*."

**Oded** pushes back:

"Sometimes the types are genuinely wrong. Third-party library declares a return type that's too narrow. You know the actual runtime value has additional properties. The library maintainer hasn't merged your PR yet. What do you do for the next three months?"

**Daniel Compiler**: "The rejected assertion says neither type sufficiently overlaps with the other. The full message even suggests converting to `unknown` first if that was intentional. Each step then passes, but neither adds evidence that the value is a `Dog`. This one still has `meow`, not `bark`."

"Your case doesn't need the detour. If the declared return type is too narrow, assert to that type plus the properties you know are there. That's a subtype of what the library declared, so a direct assertion is allowed."

**Oded**: "One `&` and a comment saying where the extra fields come from."

**Daniel**: "It's still an assertion. Your knowledge is the evidence, so that comment matters. Where you can, fix the declaration, or validate the actual runtime shape in a wrapper. A wrapper that merely hides the same assertion has not established anything new. Module augmentation can add declarations; it cannot repair every incompatible property type."

---

### "Assertions in test code"

**Oded**: "Let me show you something every developer has written. A test that needs a `User` object, but only cares about the `name` field:"

```typescript
interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  locale: string;
}

interface Team {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  team: Team;
}
```

"What I want to write:"

```typescript
const mockUser = { id: "1", name: "Test User" } as User;
```

"What Noam wants me to write:"

```typescript
const mockUser: User = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: { theme: "dark", notifications: true, locale: "en" },
  team: { id: "t1", name: "Engineering" },
};
// That's 10 lines for a test that checks one field.
```

"Nobody reads those extra six fields. They're noise. The assertion is saying 'I only care about these two fields for this test.' That's honest."

**Noam**: "You're right that the noise is a problem. You're wrong that assertions are the solution. Factory functions are:"

```typescript
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "default-id",
    name: "Default User",
    email: "default@test.com",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    preferences: { theme: "light", notifications: false, locale: "en" },
    team: { id: "t0", name: "Default Team" },
    ...overrides,
  };
}

// Clean AND type-safe
const mockUser = createMockUser({ name: "Test User" });
```

"Write the factory once. Use it everywhere. When the `User` interface changes — and it will — you update one function, not two hundred test files."

**Oded**: "Factories hide which fields the test actually depends on. With the assertion, I can *see* that this test only cares about `id` and `name`. With the factory, I'm reading through the defaults to figure out which ones matter and which are noise."

**Noam**: "Then have the function ask for the fields it actually needs. If it only uses `name`, why does its parameter require a whole `User`?"

**Oded**: "If we own that function, sure. This test calls a library. Its type wants the whole object."

**Noam**: "Then I still want a complete fixture. The library may start reading another field."

**Oded**: "And the defaults may let that new dependency pass without anyone noticing. That's what I'm trying to make visible."

Noam leaves the factory on the screen. Oded leaves a comment beside the test naming the fields it is supposed to exercise.

---

### "`satisfies` — the assertion you actually wanted"

**Linoy**: "Back to `satisfies`. People reach for `as` out of muscle memory, but `satisfies` does what they *think* `as` does."

```typescript
type Color = "red" | "green" | "blue";

// With as: OVERRIDES the type to the union
const color1 = "red" as Color;
//    ^? const color1: Color
// You've lost the literal "red" — it's now the full union.
```

```typescript
// With satisfies: CHECKS conformance AND KEEPS the literal
const color2 = "red" satisfies Color;
//    ^? const color2: "red"
// Still "red". The compiler verified it's a valid Color without losing precision.
```

"Where this really matters:"

```typescript
const palette = {
  primary: "red",
  secondary: "green",
  accent: "purple", // Typo!
} satisfies Record<string, Color>;
// Error: Type '"purple"' is not assignable to type 'Color'.
```

**Daniel**: "That palette would be rejected with `as` too. The object and `Record<string, Color>` don't overlap sufficiently. An assertion still has a compatibility check. But this one passes:"

```typescript
const invalidColor = "purple" as Color;
// Compiles. The static type is Color; the value is still "purple".
```

**Noam**: "So an accepted assertion still doesn't prove this is one of our colors."

**Linoy**: "Right. `"purple" satisfies Color` fails. For this configuration, I want the compiler to check membership and keep the specific keys and values."

**Dima Bridge**: "Then use `satisfies` here. If you need an assertion elsewhere, explain what you know that the compiler doesn't."

**Linoy**: "And this is a static check. Putting `satisfies` after `JSON.parse` doesn't inspect the data it returns. For that, we still need runtime validation."

---

### "The non-null assertion (`!`) — the assertion people forget is an assertion"

**Chen**: "We've spent the whole meeting on `as`. There's an assertion hiding in plain sight that developers use far more casually, because it's a single character:"

```typescript
// These are equivalent:
const name1 = user!.name;
const name2 = (user as NonNullable<typeof user>).name;

// Both crash identically if user is null:
// TypeError: Cannot read properties of null (reading 'name')
```

"The `!` is just `as NonNullable` in disguise. It tells the compiler 'this isn't null, trust me' — with exactly as much evidence as a bare `as`. But because it's one character instead of a keyword, developers treat it like punctuation rather than an assertion."

**Noam**: "The exclamation mark is the most dangerous character in TypeScript. It's an assertion disguised as punctuation. I ban it in code reviews with exactly one exception: immediately after assignment in test `beforeEach` blocks."

**Chen**: "Optional chaining changes the type, though. `user?.name` gives you `string | undefined`, not `string`. Sometimes you genuinely *know* the value exists — after a `.filter()` that guarantees it, after a null check three lines up that the compiler can't trace."

```typescript
// Optional chaining: safe but changes the type
const name = user?.name;
//    ^? const name: string | undefined
// Now every downstream function must handle undefined.

// Control flow narrowing: safe AND preserves the type
if (user) {
  const name = user.name;
  //    ^? const name: string
}

// Non-null assertion: preserves the type but asserts
const name = user!.name;
//    ^? const name: string
// Only safe if you can PROVE user isn't null.
```

**Oded** jumps in:

"Here's one Noam can't wiggle out of. You check a `Map` with `.has()`, then access it. The compiler doesn't narrow through `.has()` — it's a known limitation:"

```typescript
const cache = new Map<string, User>();

if (cache.has(userId)) {
  const user = cache.get(userId);
  //    ^? const user: User | undefined
  // The compiler can't connect .has() to .get()
  // Option 1: redundant undefined check
  // Option 2: user!
}
```

"You've *proven* the value exists one line above. The compiler just can't see it. What do you want me to do — restructure the code around a tooling limitation?"

**Noam**: "Here, yes. Drop the `has` and check what `get` returns. One lookup, and the compiler can see the check."

**Oded**: "Fine. Now a library checks `has` and then calls my handler with the key."

**Noam**: "Then check again and throw with the key in the message."

**Oded**: "That's a branch that can't run."

**Noam**: "As long as the library calls you right after its check and nothing deletes the entry first. If you're sure of both, I'll take `!` with a comment that says so."

**Daniel**: "The `!` is an assertion. Treat it like one. If you can prove the value exists through control flow, do that. If the proof lives where the compiler can't see it, as with a check in someone else's code, the `!` should answer the same questions as any other assertion: why is it here, and what happens when it's wrong?"

## The Turn

**Gilad Stacktrace**: "What happens at 3 AM when one of these assertions is wrong?"

He draws a timeline on the whiteboard.

"An API boundary assertion. Correct for two years. The API provider changes a field from required to optional. Your assertion still compiles — it doesn't know anything changed. Your types still say the field is there. Your tests pass — because your tests use mock data that still has the field. The error surfaces three months later as `Cannot read properties of undefined` in a function four layers deep from the assertion. The stack trace never mentions the API call. The on-call engineer has no idea where to look."

"An unchecked assumption can fail far from where it entered the program. The stack trace may tell you which field was used without telling you why the compiler believed it existed."

"Every assertion is a bet that the world outside your program still matches your model of it. You knew it was true when you wrote it. How will you find out when it stops being true?"

**Noam**: "That's what a parser at the boundary is for. When the field goes optional, the error names the response, not a function four layers down."

**Eden**: "And until that parser exists, every claim about that response lives in one client. That's where the type came from."

**Gilad**: "Then put that in the runbook. The on-call engineer won't know it otherwise."

## The Verdict

> An assertion that overrides the compiler is a bet against runtime reality. Justify it by what you know that the compiler can't check, and by answering: "When this stops being true, how will I find out?"

**Choosing an approach:**

| Situation | Recommended approach | Assertion acceptable? |
|-----------|---------------------|----------------------|
| Value of unknown shape | `unknown` + type guard | No |
| API response / JSON parse | Runtime validation (Zod, etc.) | As stepping stone only, centralized |
| Narrowing a literal | `as const` | Yes (always safe) |
| Checking shape without widening | `satisfies` | Not needed — use `satisfies` |
| Test mocks / partial objects | Complete factory fixture with the exercised fields named beside the test; narrow the tested function's parameter when you own it | A partial assertion can expose field dependencies, but does not satisfy the full contract |
| Non-null after proven init | Control flow narrowing | Only when the proof is outside the compiler's view; comment where it lives |
| Library types are wrong | Fix the types / PR upstream | `as` with documented justification |
| Double assertion (`as unknown as X`) | Redesign the approach | Almost never |

**The assertion checklist** — for any assertion (`as`, `!`) that survives code review:

1. **Why** can't the compiler infer this? (Document the answer.)
2. **How will you find out** when it's wrong, and what happens at runtime until then?
3. **Is there an alternative?** (Type guard, `satisfies`, control flow narrowing?)
4. **Is it centralized?** (One assertion in one place, not scattered across call sites?)

## Additional Takes

**Noam Kiperman**: "Every assertion in a code review — `as`, `!`, all of it — gets the same question from me: 'What evidence do you have?' If the answer is 'I just know,' the PR stays open."

**Oded Shipley**: "I'll use `satisfies` for new code. I'm not rewriting two hundred existing assertions for a theoretical improvement." — **Gilad Stacktrace**, without looking up: "You will when one of them pages you at 3 AM."

**Linoy Nightly**: "`satisfies` is TypeScript's apology for `as`. They just can't deprecate `as` without breaking the internet."

**Chen Override**: "If the answer to 'how will I find out?' is a check, you can usually narrow with that check and delete the assertion."
