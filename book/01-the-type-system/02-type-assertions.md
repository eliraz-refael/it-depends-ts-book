# Chapter 2: The Lies We Tell the Compiler

## The Principle

**Prof. Eli Typeworth**: "Write an assertion only where you can say what you know that the compiler can't check, and how you know it. It changes the type the compiler uses for an expression. It doesn't convert the value or check it at runtime."

He writes two examples on the whiteboard.

"An assertion is an instruction to the compiler: 'I know more than you do.' The question is simple: *do you?*"

```typescript
const input: unknown = "hello";
const len = (input as string).length; // Compiles. No runtime check. Works.

const input2: unknown = 42;
const len2 = (input2 as string).length; // Also compiles. No runtime check. Undefined.
```

"Both compile. The first works. The second silently produces `undefined` — and the compiler will never tell you, because you told *it* to be quiet."

"An annotation would have been refused here: `const text: string = input` doesn't compile while `input` is `unknown`. The assertion stops the compiler from asking."

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

**Linoy**: "For values we write here, try `satisfies`. It checks against the type without replacing it."

**Oded Shipley**: "Our API client asserts the shape of a fetch result. `satisfies` won't establish what came back."

---

### "Assertions at system boundaries"

**Oded**: "Take an endpoint we haven't put a parser around yet. You call it. You get JSON back. The compiler knows *nothing* about the shape, and the code calling it still needs a type:"

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

"I'm not making this up. I'm asserting a contract. The API documentation says this is an `ApiUser`. I'm telling the compiler what the docs tell me."

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

**Chen Override**: "If a rejected assertion compiles after we put `unknown` in the middle, what exactly have we fixed?"

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

**Oded**: "Well, the error's gone."

**Chen**: "Through `unknown`: 'I don't know what this is.' Then straight to 'I know exactly.' It's type laundering. The cat still has no bark."

**Noam**: "This is putting a fake mustache on a bug and walking it past the type checker. If TypeScript tells you two types don't overlap, *listen*."

**Oded** pushes back:

"Sometimes the types are genuinely wrong. Third-party library declares an incomplete return type. You know the actual runtime value has additional properties. The library maintainer hasn't merged your PR yet. What do you do for the next three months?"

**Daniel Compiler**: "The rejected assertion says neither type sufficiently overlaps with the other. The full message even suggests converting to `unknown` first if that was intentional. Each step then passes, but neither adds evidence that the value is a `Dog`. This one still has `meow`, not `bark`."

"Your case doesn't need the detour. If the declared return type leaves out those properties, assert to that type plus the properties you know are there. That's a subtype of what the library declared, so a direct assertion is allowed."

**Oded**: "One `&` and a comment saying where the extra fields come from."

**Daniel**: "Keep the comment until the declaration is fixed. Or check those properties in a wrapper. Moving the assertion into a wrapper just gives it an office."

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

**Noam**: "Over my dead type definition. I'll give you the one-field call. The factory can supply the rest:"

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

**Oded**: "And the defaults may let that new dependency pass without anyone noticing. I'll use the complete fixture, but I'm naming the fields this test exercises in a comment."

**Noam**: "Fine."

**Oded**: "I'd like that in writing too."

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

**Chen**: "Would this get the same review if we spelled it with `as`?"

```typescript
// These are equivalent:
const name1 = user!.name;
const name2 = (user as NonNullable<typeof user>).name;

// Both crash identically if user is null:
// TypeError: Cannot read properties of null (reading 'name')
```

**Daniel**: "Same claim. `NonNullable` removes `null` and `undefined` from the type. Neither spelling checks the value."

**Noam**: "The exclamation mark is the most dangerous character in TypeScript. It's an assertion disguised as punctuation. I ban it in code reviews with exactly one exception: immediately after assignment in test `beforeEach` blocks."

**Oded**: "Optional chaining changes the type, though. `user?.name` gives you `string | undefined`, not `string`. Sometimes you genuinely *know* the value exists — after `filter(Boolean)` drops nulls and undefined, or after a check inside a callback the compiler can't follow."

```typescript
// Optional chaining: safe but changes the type
const optionalName = user?.name;
//    ^? const optionalName: string | undefined
// Now every downstream function must handle undefined.

// Control flow narrowing: safe AND preserves the type
if (user) {
  const name = user.name;
  //    ^? const name: string
}

// Non-null assertion: preserves the type but asserts
const assertedName = user!.name;
//    ^? const assertedName: string
// Only safe if you can PROVE user isn't null.
```

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

**Gilad Stacktrace**: "Who tests the response after the API changes?"

**Noam**: "The client tests use the same factory. It supplies a complete user."

**Oded**: "Including fields the test didn't ask for."

**Gilad**: "The provider now allows `email` to be absent. Your client still asserts the old `ApiUser`."

He writes the provider's new type, reruns the receipt test, then feeds it the response without email.

```typescript
// Provider's new contract; the client's ApiUser still requires email.
type UserResponse = { id: string; name: string; email?: string };

function receiptAddress(raw: unknown): string {
  const user = raw as ApiUser;
  return user.email.toLowerCase();
}

function receiptTest(): boolean {
  const user = createMockUser({ name: "Test User" });
  return receiptAddress(user) === "default@test.com";
}

console.log(receiptTest()); // true: the factory still supplies email

const response: UserResponse = { id: "u1", name: "Ada" };
try {
  receiptAddress(response);
} catch (error) {
  if (!(error instanceof TypeError)) throw error;
  console.log("response failed"); // response failed
}
```

**Noam**: "My test reads email. Its setup only names the user. The factory hid the dependency."

**Oded**: "That's the comment I wanted. Name the fields this test exercises."

**Noam**: "And pass the email explicitly for this case. Add the response without it too. The comment won't run that test for us."

**Gilad**: "Good. Who rejects the missing email?"

**Noam**: "A parser, once this path has one. Receipts still require it. The provider allowing less doesn't mean we can use less."

**Gilad**: "An assertion is a bet that the other side still sends what you expect. Your factory was betting with you."

## The Verdict

> Justify an assertion by the evidence the compiler cannot check, and arrange to find out when that evidence stops holding. A test fixture that always supplies the asserted shape cannot test what happens when the boundary sends something else.

The team keeps complete fixtures, names the fields each test exercises, and adds missing-field cases at the client boundary. The receipt path will reject responses without email in its parser; the remaining assertions stay centralized and tracked.

**Choosing an approach:**

| Situation | Recommended approach | Assertion acceptable? |
|-----------|---------------------|----------------------|
| Value of unknown shape | `unknown` + type guard | No |
| API response / JSON parse | Runtime validation (Zod, etc.) | As stepping stone only, centralized |
| Narrowing a literal | `as const` | Yes (always safe) |
| Checking shape without widening | `satisfies` | Not needed — use `satisfies` |
| Test mocks / partial objects | Complete factory; name the exercised fields. Ask for fewer fields when you own the function | A partial assertion exposes dependencies but leaves the full contract unmet |
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

**Linoy Nightly**: "I'll replace `as Color` with `satisfies Color`. Purple can appeal to the design team."
