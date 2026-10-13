# Chapter 4: The Feature That Wasn't Just a Type

## The Principle

The team is choosing how to represent user statuses.

**Prof. Eli Typeworth**: "For a fixed set of values, start with a type. Add a runtime representation when a caller needs to look up, list or name those values. Then check what the declaration emits as well as what the compiler accepts."

He puts two declarations on the board.

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

**Eli**: "The union describes which strings we accept. Its declaration is erased. The ordinary enum also defines a value called `Status`. Here is its JavaScript:"

```javascript
// What Option B becomes in JavaScript:
var Status;
(function (Status) {
    Status["Active"] = "active";
    Status["Inactive"] = "inactive";
    Status["Banned"] = "banned";
})(Status || (Status = {}));
```

"That function runs immediately to fill an object with the named values. It's an immediately invoked function expression, or IIFE. The enum supplies a type for the compiler and an object for the running program. We need to decide which part our callers use."

## The Debate

### "Enums are readable and self-documenting"

**Guy Singleton**: "I use the name at the call site. Compare these:"

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

"`Status.Active` tells me which domain the value belongs to without opening `updateUser`. I can rename the member to `Enabled` while keeping the string we store as `"active"`. The symbol and the stored value have different jobs."

**Oded Shipley**: "The Java engineers I onboarded could read `Status.Active` on day one. Some had to ask what `|` meant in a type. I need them to read the code we're shipping today."

**Noam Kiperman**: "They do need to learn the union syntax. It tells them which strings the function accepts, and a typo is checked at the call:"

```typescript
// With the union
updateUser("u_42", "active");
//                 ^^^^^^^^ TS will catch a typo here.
updateUser("u_42", "activ");
// Error: Argument of type '"activ"' is not assignable to parameter of type '"active" | "banned" | "inactive"'.

// With the enum
updateUser("u_42", Status.Active);
// Same safety. Just with extra syntax.
```

"Both calls are checked. I can see why you want a separately named member, but here `Active` points to `"active"`. What is the second name telling us?"

**Guy**: "I want that domain name beside the argument, where I'm reading the call."

**Noam**: "Then name the type."

```typescript
type UserStatus = "active" | "inactive" | "banned";

function updateUser(id: string, status: UserStatus) { ... }
```

"The parameter's type gives me the domain name. I don't need an object just to pass one of these strings."

**Guy**: "And you still have to open that signature. That's the bit I wanted to avoid."

---

### "The runtime object problem"

**Noam**: "The union declaration emits nothing. For the enum, `tsc` emits that initialization code whether this caller needs the object or not."

**Linoy Nightly**: "There is a version intended to inline at call sites: `const enum`. That can work in a build you control. Publishing one for other people to consume has a specific problem."

```typescript
// A const enum. The whole point is that references inline,
// so the enum itself emits nothing.
export const enum Status {
  Active = "active",
  Inactive = "inactive",
}
```

"A package can publish the types from that source in a `.d.ts` declaration file. It describes the API without providing its JavaScript implementation. A `const enum` declared there is ambient."

"Now the consumer turns on `isolatedModules`, which checks for constructs that require information unavailable to single-file transpilation. Inlining this enum's members would require reading their values from that other declaration file. Accessing them gives this error:"

```
error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
```

"So if we publish the ambient enum, we have put a constraint on the consumer's build. I want a plain object at that boundary."

The ambient `const enum` restriction is documented in the [handbook's const-enum pitfalls](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls).

**Gil Benchmark**: "Before we talk about bundle cost, which build are we measuring?"

**Linoy**: "I haven't measured this application's bundle. I'm showing why I wouldn't promise a consumer that a published `const enum` will inline in their build."

**Gil**: "Then keep that distinction. Emitted JavaScript is something we can inspect. How much reaches the final bundle depends on the toolchain and how the value is used."

---

### "Reverse mapping"

**Guy**: "I do need an object for the HTTP logger. It receives a code and prints its name. A numeric enum supplies both directions:"

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

"For a code we've declared, `HttpStatus[response.status]` gives its name. The union alone can't do that."

**Chen Override**: "The logger needs the lookup. Does the lookup need an enum?"

**Daniel Compiler**: "Before we replace it, keep Guy's numeric case separate from the string statuses. The string enum has no reverse map:"

```typescript
enum Color {
  Red = "red",
  Blue = "blue",
}

const colorName = Color["red"];
// Error: Property 'red' does not exist on type 'typeof Color'. Did you mean 'Red'?
// And at runtime: `undefined` — the reverse map was never emitted for string enums.
```

"For the numeric case, we can build the reverse object ourselves. `typeof HttpStatus` gets the object's type, and `keyof` gives its property names. Indexing that type by all its names gives the union of the values: `200 | 404 | 500`. That's `StatusCode`."

**Guy**: "And the other direction?"

**Daniel**: "Swap the entries and build another object. `Record<StatusCode, keyof typeof HttpStatus>` says each allowed code has a name from the original object. The assertion promises that shape; it doesn't check it. Here we can inspect the entries we're swapping:"

```typescript
const HttpStatus = {
  OK: 200,
  NotFound: 404,
  ServerError: 500,
} as const;

// The allowed codes, derived from the object:
type StatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
// 200 | 404 | 500

// At runtime:
const nameByCode = Object.fromEntries(
  Object.entries(HttpStatus).map(([k, v]) => [v, k])
) as Record<StatusCode, keyof typeof HttpStatus>;

nameByCode[404]; // "NotFound"
```

**Guy**: "The enum version is one construct. Yours is an object, a derived type and another expression to build the reverse map. I'm the one maintaining that logger. Why would I take on the extra pieces?"

**Daniel**: "You don't have to. This shows that you can build the lookup without an enum. It doesn't make the enum's built-in map useless."

---

### "The `as const` object — best of both worlds?"

**Linoy**: "For our string statuses, I can keep Guy's named members without an enum. The object holds the values and the type is derived from it:"

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

"`as const` keeps these property types as literal values. It doesn't freeze the runtime object. The JavaScript still contains the object we wrote, and both styles of call work."

**Noam**: "That's the same indexing as the logger?"

**Linoy**: "Same operation. Here the values are our status strings."

**Oded**: "That's the line that makes me want to close the tab and go outside. I'm going to have to explain it in reviews. An enum doesn't ask someone changing a status to understand that derivation."

**Linoy**: "We can name that operation:"

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

"`ValueOf` is our alias for the union of an object's property types. We can reuse it for the next set of values too."

**Oded**: "I'd still have to explain it when someone opens the alias."

**Guy**: "It does keep my named members. I'd use this for strings. The numeric logger still looks simpler with its enum."

---

### "Exhaustiveness checking — both sides have it"

**Noam**: "Whichever we choose, I want adding a status to find the switches we haven't updated. Both versions can check that:"

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

"After all the cases return, no possible status should be left. That's what the assignment to `never` checks. Add a fourth status without a case and that assignment fails in either version."

---

### "Keeping the dropdown in sync"

**Oded**: "The status dropdown is where we've needed an object. Here's the mistake I don't want:"

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

"With the string enum, the list comes from the same definition as the type. Adding a status can't leave it out of the dropdown."

**Linoy**: "We can use the object I showed you for the same list:"

```typescript
const Status = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
} as const;

const STATUS_OPTIONS = Object.values(Status);
// ["active", "inactive", "banned"] — same sync, no IIFE.
```

"If the property names are suitable labels, iterate the entries: `Active` is the label and `"active"` is the value. That works with the string enum's entries too."

**Chen**: "What if someone copies the `Object.values` pattern for a numeric enum?"

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

"Eight entries for four directions. The reverse map puts the names in there too. If we want only numeric values, we have to filter them."

**Oded**: "Then I'd filter the numeric one. Our statuses are strings. Their iteration works, and my team can read the declaration without opening `ValueOf`."

---

### "When a dependency exports an enum"

**Oded** opens a dependency's declarations.

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

**Sahar Firstclass**: "The object handles the status calls and the dropdown. If the remaining cost is learning the derivation, why not teach it?"

**Guy**: "Because someone has to maintain it while they're learning."

**Sahar**: "They'll use `typeof` and `keyof` elsewhere. Is the enum simpler, or just more familiar?"

**Guy**: "If the team can read the enum at 3 AM and can't parse that derivation under stress, familiarity is doing work. Sometimes it's about the room."

**Sahar**: "For that team, on that night, I'd leave it. What would you choose for the next service?"

**Guy**: "Depends who's maintaining it. Learning the language matters. So does having someone available to review the first few changes."

**Oded**: "Four hundred enums across twelve services. I'm not putting a rewrite on the roadmap."

**Sahar**: "Then don't. Start where the choice is still open."

## The Verdict

> For new code, default to a string literal union; use an `as const` object when callers need named or enumerable values. Keep numeric enums where their built-in reverse map earns its place. A team that can maintain an enum but cannot yet maintain the alternative may choose the enum, even for a new service. Plan for that learning cost, and avoid publishing ambient `const enum`s to consumers with incompatible builds.

**Choosing an approach:**

| Situation | Recommended | Why |
|-----------|-------------|-----|
| Fixed set of string values | String literal union | The declaration emits no code |
| Need runtime values (iteration, dropdowns) | `as const` object + derived type | The value list and type come from one ordinary object |
| Need reverse mapping (number → name) | Numeric `enum` when it reduces maintenance | The compiler builds both directions; a plain-object alternative needs its own reverse map |
| Existing codebase already uses enums | Keep them unless a change solves a concrete problem | Include migration, reviewer availability and on-call familiarity in the cost |
| Library public API | String literal union or `as const` | Callers can pass matching strings; a string-enum parameter rejects those raw strings |
| `const enum` | Avoid unless you own the toolchain | Inlining depends on the consumer's build; ambient member access fails under `--isolatedModules` |

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
// Shape 4 — String enum. When the team can maintain it more readily than shape 2.
// No reverse mapping. Emits an IIFE. Unlike shape 2, its type rejects raw strings.
enum Color {
  Red = "red",
  Blue = "blue",
}
// If you find yourself writing this, ask what it buys over shape 2.
```

## Additional Takes

**Noam Kiperman**: "None of this exempts us from validating external input. In Zod 4, `z.enum(["active", "inactive", "banned"])` checks the literal values, and `z.enum(SdkStatus)` accepts the TypeScript enum directly. Either gives us a runtime check; choosing a type declaration doesn't." See [Zod's enum documentation](https://zod.dev/api#enums).

**Guy Singleton**: "When Oded says the Java team finds enums familiar, that gets them started. We still have to explain what TypeScript emits. The shared keyword doesn't teach them the reverse map."
