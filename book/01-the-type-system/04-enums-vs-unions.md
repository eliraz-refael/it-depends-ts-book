# Chapter 4: The Feature That Wasn't Just a Type

## The Principle

The last three chapters have been about how TypeScript describes values. `any` and `unknown` described the unknown. Assertions described what you claimed to know. `interface` and `type` described shape. All of them erased at compile time. That was the contract: types narrate the code, then vanish before the code runs.

This chapter is about the one construct in Act I that doesn't play by the same rules.

**Prof. Eli Typeworth** writes two lines on the whiteboard.

```typescript
// Option A
type Status = "active" | "inactive" | "banned";

// Option B
enum Status {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}
```

*"Let us return to first principles."*

"These look like two ways of saying the same thing. They are not. Option A exists only in your editor. It is a description of what the string can be. At runtime there is no trace of it — the compiled JavaScript sees only `"active"`, `"inactive"`, `"banned"` passed around as strings."

"Option B is different. Look at what the compiler actually emits:"

```javascript
// What Option B becomes in JavaScript:
var Status;
(function (Status) {
    Status["Active"] = "active";
    Status["Inactive"] = "inactive";
    Status["Banned"] = "banned";
})(Status || (Status = {}));
```

"An immediately invoked function expression. A runtime object. A variable named `Status`. Option A was a type. Option B is a type *and* a value — a small JavaScript program the compiler emits as part of the module, whether you reference it at runtime or not."

**Chen Override** has been quiet. He unfolds his arms. *"But have you considered..."* — and the question that frames the entire chapter lands flat on the table:

"...that a type that emits JavaScript isn't really a type?"

Eli smiles the way he does when a student asks exactly the right question.

"A union describes what a value can be. An enum describes what a value can be *and* creates the value at runtime. The question we have to answer is whether you need the second part."

## The Debate

### "Enums are readable and self-documenting"

**Guy Singleton** goes first, because Guy is always going first on anything that involves the word "enum."

*"Where's the interface?"* — he waves this one off. "Different chapter. The question here is readability. Look at two call sites:"

```typescript
// With a string literal union
function updateUser(id: string, status: "active" | "inactive" | "banned") {
  // ...
}
updateUser("u_42", "active");

// With an enum
enum Status {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}
function updateUser(id: string, status: Status) {
  // ...
}
updateUser("u_42", Status.Active);
```

"The second version is self-documenting. `Status.Active` tells the reader exactly what that string means. `"active"` is a magic string in a sea of other magic strings. My IDE autocompletes `Status.` and shows me the entire domain. I can rename `Active` to `Enabled` across the codebase with a single refactor. Try that with a string literal — you're doing find-and-replace on `"active"`, and good luck if the same word appears anywhere else."

**Oded Shipley** — and this is rare — backs Guy up.

"I don't even like enums. But I've onboarded eight Java engineers to TypeScript in the last two years, and every single one of them understood `Status.Active` on day one. Half of them had never seen a string literal union before and had to ask what `|` meant in a type. For a team coming from Java, C#, or Kotlin, enums are the thing they already know. That matters. *We can fix it in the next sprint* — or we can pick a construct the team reads fluently today."

**Noam Kiperman** adjusts his glasses.

"Let me show you something."

```typescript
// With the union
updateUser("u_42", "active");
//                 ^^^^^^^^ TS will catch a typo here.
updateUser("u_42", "activ");
// Error: Argument of type '"activ"' is not assignable to parameter of type '"active" | "inactive" | "banned"'.

// With the enum
updateUser("u_42", Status.Active);
// Same safety. Just with extra syntax.
```

"The autocomplete works for both. The type error works for both. Rename is cleaner with the enum — I'll grant you that. `Status.Active` is a symbol; `"active"` is a string literal the language server tracks as a type member, which not every editor flow handles as neatly. But that's the narrowest of wins. The cost of buying it is what we're about to discuss."

"What `Status.Active` gets you over `"active"` is a layer of indirection. The enum member `Active` resolves to the string `"active"`. You've added a name that points to the string. If the name and the string carry the same information, you've added ceremony."

**Guy**: "Ceremony has value. A named constant tells me what the string *means* in this domain."

**Noam**: "Then name the type."

```typescript
type UserStatus = "active" | "inactive" | "banned";

function updateUser(id: string, status: UserStatus) { ... }
```

"`UserStatus` is the domain name. The values are what they are. The type tells you what *role* the string plays. The enum tells you that plus... it also happens to be a runtime object. That's the part we're about to interrogate."

Oded leaves the enum version open beside the union.

---

### "The runtime object problem"

**Noam** keeps going, because this is where he actually lives.

"Erasure is the principle we keep coming back to: types describe, they don't generate. Every other type-system construct we've talked about respects that. `interface`? Erased. `type`? Erased. Type assertions? Erased. The moment you write `enum`, the compiler stops describing and starts generating. You're shipping code you didn't write."

**Linoy Nightly** opens her laptop with the particular energy she gets when a construct is about to be torn apart.

"There is a version intended to inline at call sites: `const enum`. That can work in a build you control. Publishing one for other people to consume has a specific problem."

```typescript
// A const enum. The whole point is that references inline,
// so the enum itself emits nothing.
export const enum Status {
  Active = "active",
  Inactive = "inactive",
}
```

"Turn on `isolatedModules`, which checks for constructs that require information unavailable to a single-file transpilation. Inlining an imported ambient `const enum` requires knowing its members from declarations in another file."

"And the moment any code in your project imports a `const enum` from a `.d.ts` file — which is what happens when a compiled npm package ships one in its types — you get a hard error:"

```
error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
```

"So if we publish the ambient enum, we have put a constraint on the consumer's build. I want a plain object at that boundary."

The ambient `const enum` restriction is documented in the [handbook's const-enum pitfalls](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls).

**Gil Benchmark**: "Before we talk about bundle cost, which build are we measuring?"

**Linoy**: "I haven't measured this application's bundle. I'm showing why I wouldn't promise a consumer that a published `const enum` will inline in their build."

**Gil**: "Then keep that distinction. Emitted JavaScript is something we can inspect. How much reaches the final bundle depends on the toolchain and how the value is used."

---

### "Reverse mapping — the one thing unions can't do"

**Guy Singleton** is not done.

"Everything you've said is true and also beside the point. There is exactly one thing enums do that unions cannot do at all. Not awkwardly. Not with an extra line. *At all.*"

```typescript
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

// Forward lookup: name to value
const okCode: number = HttpStatus.OK; // 200

// Reverse lookup: value to name
const statusName: string = HttpStatus[200]; // "OK"
```

"Numeric enums are bidirectional. Given the value, you can get the name. Given the name, you can get the value. This is real in the compiled JavaScript — the IIFE assigns *both directions*:"

```javascript
// What the compiler actually emits:
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["NotFound"] = 404] = "NotFound";
    HttpStatus[HttpStatus["ServerError"] = 500] = "ServerError";
})(HttpStatus || (HttpStatus = {}));
// HttpStatus is both { OK: 200, ... } and { 200: "OK", ... }
```

"You write `HttpStatus[response.status]` and get the name of the status code. Try doing that with a union — you can't. There's nothing there at runtime."

**Chen Override** leans forward. *"But have you considered how often you actually need that?"*

"In my last three years of code review, I've seen reverse mapping used exactly twice. Once for a debug logger. Once for a CLI that mapped exit codes to human-readable names. In both cases, the author could have written a six-line lookup object. We're preserving a language feature for a use case that shows up twice per career."

**Daniel Compiler** is quietly typing. *"The compiler disagrees"* — with Guy's framing.

"Two corrections. First, reverse mapping only works for *numeric* enums. Not string enums. Watch:"

```typescript
enum Color {
  Red = "red",
  Blue = "blue",
}

const colorName = Color["red"];
// Error: Property 'red' does not exist on type 'typeof Color'. Did you mean 'Red'?
// And at runtime: `undefined` — the reverse map was never emitted for string enums.
```

"String enums don't emit the reverse direction. If you wanted reverse mapping, you were always going to use numeric enums specifically. Which narrows Guy's claim from 'enums' to 'numeric enums,' which is a much smaller footprint."

"Second, the alternative isn't a function. It's one line of type-level code:"

```typescript
const HttpStatus = {
  OK: 200,
  NotFound: 404,
  ServerError: 500,
} as const;

// Reverse direction — derivable, not builtin, but one expression:
type StatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
// 200 | 404 | 500

// At runtime:
const nameByCode = Object.fromEntries(
  Object.entries(HttpStatus).map(([k, v]) => [v, k])
) as Record<StatusCode, keyof typeof HttpStatus>;

nameByCode[404]; // "NotFound"
```

**Guy** accepts the correction, partially: "Fine — numeric enums for reverse mapping, which is rare. But when it *does* come up, the enum version is one construct. Yours is three: a const object, a derived type, and an `Object.fromEntries` line. That's more moving parts."

**Chen**: "Three constructs that don't emit a special language feature into the bundle. For a workload that arises twice per career."

---

### "The `as const` object — best of both worlds?"

**Linoy Nightly** has been waiting to ship her actual argument.

"Everyone's been talking around the pattern that replaces most enum use cases. Let me show it in full. This is a plain JavaScript object, no special compiler feature, with full type safety:"

```typescript
const Status = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
} as const;

type Status = (typeof Status)[keyof typeof Status];
// type Status = "active" | "inactive" | "banned"

function updateUser(id: string, status: Status) {
  // ...
}

updateUser("u_42", Status.Active); // Works.
updateUser("u_42", "active");      // Also works — it's the same value.

// You can iterate, which you can't do with a union:
for (const value of Object.values(Status)) {
  console.log(value);
}
```

"Runtime presence — check. Type safety — check. Iteration — check. Dropdown-friendly — check. Zero enum baggage. The compiled JavaScript is literally the object you wrote, frozen in meaning by `as const`."

**Noam Kiperman** evaluates the pattern in real time. He's not being convinced — he's auditing it for vulnerabilities.

"The derivation line is ugly. `(typeof Status)[keyof typeof Status]` is the kind of thing that makes a junior developer close the tab and go outside. But I'll grant you — it's one line. Once. At the top of the module. You pay the cost exactly once per domain type."

"And it's honest. The enum's IIFE hides what it's doing. This pattern shows you the object. Nothing is generated behind your back."

**Oded Shipley** has a different problem with it.

"That derivation line is write-only code for juniors. I've watched three different junior engineers try to modify an `as const` object and not understand why the type stopped narrowing. They'd add a property, the type would widen, and they'd spend an hour in Stack Overflow tabs. An enum is one keyword. Everyone knows what an enum is. This pattern requires you to understand `typeof`, `keyof`, `as const`, and mapped types before you can use it safely."

**Linoy** wraps the ugly part.

```typescript
// Utility — write it once per codebase, forget about it:
type ValueOf<T> = T[keyof T];

const Status = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
} as const;

type Status = ValueOf<typeof Status>;
// Same result. Reads cleaner.
```

"`ValueOf<typeof Status>` reads as 'the value-of the typeof Status,' which is exactly what it is. Three concepts instead of four. I'll grant Oded that the pattern is less discoverable than `enum`. That's a real cost. It's also a cost paid by engineers who will write the utility once and then benefit from it for every type in the codebase."

**Guy**, reluctantly: "I'll admit this works for string values. I still want my enum for the numeric case with reverse mapping. But for strings — yes, this is cleaner than a string enum. The string enum doesn't give you reverse mapping anyway, and `as const` gives you everything else with less compiler magic."

---

### "Exhaustiveness checking — both sides have it"

**Noam** pauses the debate for a correction.

"A claim circulates that enums enable exhaustiveness checking that unions don't. That claim is false. Both work identically."

```typescript
type Status = "active" | "inactive" | "banned";

function describe(status: Status): string {
  switch (status) {
    case "active":
      return "User is active";
    case "inactive":
      return "User is inactive";
    case "banned":
      return "User is banned";
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}
```

```typescript
enum Status {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}

function describe(status: Status): string {
  switch (status) {
    case Status.Active:
      return "User is active";
    case Status.Inactive:
      return "User is inactive";
    case Status.Banned:
      return "User is banned";
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}
```

"Add a fourth status to either type. Both `_exhaustive: never` lines error in the same way with the same compiler diagnostic. This is not a differentiator between the two. Anyone telling you 'use enums for exhaustiveness' is arguing from a property unions also have."

Moving on.

---

### "Iteration — the runtime advantage"

**Oded Shipley** finds his second real point.

"Here's what happens when product walks in and says: 'We need a dropdown of all user statuses.'"

```typescript
// With a union — you can't iterate. You have to maintain a separate list.
type Status = "active" | "inactive" | "banned";

const STATUS_OPTIONS: Status[] = ["active", "inactive", "banned"];
// Duplication. Add "pending" to the type, forget to add it to the array,
// and production renders a dropdown missing an option. The compiler won't save you.
```

```typescript
// With an enum — iteration is free.
enum Status {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}

const STATUS_OPTIONS = Object.values(Status);
// ["active", "inactive", "banned"] — always in sync with the enum.
```

"This is not a hypothetical. This is the single most common reason my teams have reached for `enum` over the years. The type and the runtime list stay in sync. One source of truth."

**Guy** nods — for once he's on Oded's side for a pragmatic reason rather than a structural one.

**Linoy Nightly** is ready for this one.

"`as const` does this too. Same runtime list, same sync guarantee, no enum:"

```typescript
const Status = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
} as const;

const STATUS_OPTIONS = Object.values(Status);
// ["active", "inactive", "banned"] — same sync, no IIFE.
```

"And you get the label/value split for free — the object literal *is* your dropdown source. Your form can iterate the entries, show `Active` as the label and `"active"` as the value, without a second mapping."

**Chen Override** raises a hand — because one of the technical landmines in this subsection is a footgun most developers never notice.

*"But have you considered what `Object.values` actually returns for a numeric enum?"*

```typescript
enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

console.log(Object.values(Direction));
// ["Up", "Down", "Left", "Right", 0, 1, 2, 3]
// Eight entries. The reverse mapping doubles the object.
```

"The same feature Guy defended two subsections ago — reverse mapping — silently breaks iteration. You asked for the values; you got the values *and* the names. For numeric enums, `Object.values()` returns both. For string enums, it returns only the values. The behavior differs based on which kind of enum you used. You now need to filter by `typeof`, and the enum you reached for because it was 'simpler' has a runtime gotcha that a plain object doesn't have."

**Oded** concedes the gotcha but holds his ground: "For string enums, iteration works cleanly and I still don't need the derivation line. Reach-for-ability is a real property. Every developer knows what `enum` does on day one. Not everyone knows what `as const` plus `typeof` plus `keyof` adds up to."

---

### "When a dependency exports an enum"

**Oded Shipley** opens a dependency's declarations.

"What if the library already chose? Its API takes a string enum. I still have to call it."

**Daniel**: "Check which direction the value is going. The enum can flow into a matching literal union without a mapping:"

```typescript
// The dependency's type:
enum SdkStatus {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}

type Status = "active" | "inactive" | "banned";

const fromSdk: SdkStatus = SdkStatus.Active;
const localStatus: Status = fromSdk; // No conversion needed.

function sendToSdk(status: SdkStatus) {
  console.log(status);
}

sendToSdk("active"); // Error: "active" is not assignable to SdkStatus.
sendToSdk(SdkStatus.Active); // Works.
```

**Oded**: "Mine is the call going back in. The raw string doesn't work."

**Noam**: "Then use its enum members there. If we want callers inside the application to pass our union, we can put that translation in an adapter."

**Oded**: "And if they're already using the dependency's type, I'm going to need a reason to add one."

## The Turn

**Sahar Firstclass** points at the `as const` object.

"Which part of this needs to be an enum?"

"A string literal union doesn't exist at runtime. You've been treating that as the case against it — 'you can't iterate, you can't reverse-map, you can't import it as a value.' I want to suggest you read it as the case *for* it. The type describes what the string can be. The string itself is already a JavaScript value. You didn't need a language feature. You needed a string."

He gestures at the `as const` example still on the screen.

"When you actually need a runtime object — for iteration, for dropdowns — you reach for `as const`. Which is a plain JavaScript object. No special keyword. No IIFE. No emitted module. The compiler is adding zero bytes to your bundle that you didn't write yourself."

"So what does `enum` buy you that you couldn't get from a string, or a plain object? I can answer that: familiarity. Reverse mapping for numeric codes. Discoverable iteration for people who haven't seen `as const` before. That's the honest list. Everything else on the 'enum wins' column is a feature the construct *also* provides — not one it uniquely provides."

He turns to Guy, not aggressively.

"You said familiarity counts. It does. Let me push on what you meant by it."

**Guy**: "Engineers from Java or C# understand enums on day one. `as const` plus `typeof` plus `keyof` is four concepts they don't know."

**Sahar**: "And once they learn those four concepts, where else do they use them?"

**Guy** pauses. "Almost everywhere. `typeof` and `keyof` come up constantly in TypeScript. `as const` shows up any time you need a literal type preserved."

**Sahar**: "So you're trading a one-time cost that teaches them the language, against a lifetime of reaching for a feature they don't need. And if a tool you already know turns out to be more complex than one you haven't learned — is it still simple, or just familiar? You're not asking 'which is simpler.' You're asking 'which is more recognizable.' Aren't those different questions?"

**Guy** doesn't fold this time. "Maybe. But if the team can read enum-code at 3 AM and can't parse an `as const` derivation under stress, 'recognizable' *is* simpler — for them, on that night. You're assuming the choice is about the language. Sometimes it's about the room."

**Sahar**: "For that team, on that night, I'd leave it. What would you choose for the next service?"

**Guy**: "Depends who's maintaining it. Learning the language matters. So does having someone available to review the first few changes."

**Oded**: "Four hundred enums across twelve services. I'm not putting a rewrite on the roadmap."

**Sahar**: "Then don't. Start where the choice is still open."

## The Verdict

> String literal unions as default. `as const` objects when you need runtime values. Numeric enums for the rare reverse mapping case. `const enum` — avoid.

**The Accepted Standard — a decision framework:**

| Situation | Recommended | Why |
|-----------|-------------|-----|
| Fixed set of string values | String literal union | Zero runtime cost, no emitted code, simplest |
| Need runtime values (iteration, dropdowns) | `as const` object + derived type | Runtime presence without `enum` baggage |
| Need reverse mapping (number → name) | Numeric `enum` — but audit first, you probably don't | The only native construct for this |
| Existing codebase already uses enums | Keep the enums, lint for consistency, convert opportunistically | Migration cost rarely justified by principle alone |
| Library public API | String literal union or `as const` | Don't leak enum runtime shape to consumers |
| `const enum` | Avoid unless you own the toolchain | Cross-toolchain support is uneven; ambient const enums fail under `--isolatedModules` |

**In practice — the four shapes, side by side:**

```typescript
// Shape 1 — String literal union. Default. Zero runtime cost.
type UserStatus = "active" | "inactive" | "banned";

function updateUser(id: string, status: UserStatus) {
  // The type exists in the editor. At runtime, `status` is just a string.
}
```

```typescript
// Shape 2 — as const object. When you need iteration or a runtime list.
const UserStatus = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
} as const;

type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

const ALL_STATUSES = Object.values(UserStatus);
// ["active", "inactive", "banned"]
```

```typescript
// Shape 3 — Numeric enum. Only when reverse mapping is load-bearing.
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

function logResponse(code: HttpStatus) {
  console.log(`${code} ${HttpStatus[code]}`);
  // 200 OK / 404 NotFound / 500 ServerError
}
```

```typescript
// Shape 4 — String enum. Rarely the best choice. Prefer shape 1 or 2.
// No reverse mapping. Emits an IIFE. Does nothing a union + const object doesn't.
enum Color {
  Red = "red",
  Blue = "blue",
}
// If you find yourself writing this, ask what it buys over shape 2.
```

The rule in one sentence: if you don't need a runtime object, you don't need an enum. If you need a runtime object, a plain object with `as const` is almost always simpler than an enum. The exception is numeric enums for the specific case of reverse mapping — and even there, audit whether you actually need it before reaching for the construct.

## Additional Takes

**Sahar Firstclass**: "Every enum in your codebase is a question: did I need a runtime object, or did I reach for the first keyword that felt like a type? The codebase that can answer the first question honestly usually has fewer enums than it started with. *Simple made better.*"

**Noam Kiperman**: "If your type emits JavaScript, it is not a type. It is a feature wearing a type's clothing. *Over my dead type definition.*"

**Noam Kiperman**, again: "None of this exempts us from validating external input. In Zod 4, `z.enum(["active", "inactive", "banned"])` checks the literal values, and `z.enum(SdkStatus)` accepts the TypeScript enum directly. Either gives us a runtime check; choosing a type declaration doesn't." See [Zod's enum documentation](https://zod.dev/api#enums).

**Guy Singleton**: "In Java, enums are the foundation of half our design patterns. They have methods, they have fields, they're first-class classes with restricted instantiation. TypeScript enums are... a different thing wearing the same name. If you came from Java expecting the Java feature, that's the cost you're paying — and it's fair to know you're paying it."

**Oded Shipley**: "I'll use unions for new code. But I'm not rewriting four hundred enums for a philosophical improvement." — **Noam**, under his breath: "You will when one of them breaks a bundler."
