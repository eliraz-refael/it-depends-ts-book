# Chapter 5: The Guard at the Gate

## The Principle

**Daniel Compiler**: "For external input, prefer a function that builds a typed value from the fields it has checked. Then the compiler checks that construction too. Look at what the body must do to produce its answer."

## The Debate

### "What did the check establish?"

Daniel opens his laptop.

```typescript
function handle(x: string | number) {
  if (typeof x === "string") {
    // x: string
    return x.toUpperCase();
  } else {
    // x: number
    return x.toFixed(2);
  }
}
```

"Inside the first branch, `x` is a string. Inside the other, it's a number. The compiler follows the check along each path and narrows the type. That's *control flow analysis*."

**Daniel** adds two null checks.

```typescript
function process(input: string | null | undefined) {
  if (input != null) {
    // input: string — narrowed via loose equality
  }
  if (input !== null) {
    // input: string | undefined — wait, what?
  }
}
```

"`!= null` excludes both `null` and `undefined`. Strict `!== null` excludes only `null`. If you meant to remove both, the second check hasn't done it. The compiler follows the check you wrote, even when you meant a different one."

**Chen Override**: "Does it check the body of a type guard too? If I say a function proves something?"

**Daniel**: "A return annotation like `value is User` is a type predicate: `true` tells the caller to treat `value` as a `User`. TypeScript checks that the body returns a boolean, but it doesn't prove that promise. The assertion-function form, `asserts value is User`, promises the type after a normal return."

**Noam Kiperman**: "I want tests for that guard. Especially the inputs it should reject."

---

### "The `typeof` family — what lies and what doesn't"

**Linoy Nightly**: "The checks we already write can narrow the type:"

```typescript
function describe(value: unknown): string {
  if (typeof value === "string") return `string: ${value}`;
  if (typeof value === "number") return `number: ${value.toFixed(2)}`;
  if (typeof value === "boolean") return `bool: ${value}`;
  if (Array.isArray(value)) return `array of ${value.length}`;
  if (value instanceof Date) return `date: ${value.toISOString()}`;
  return "unknown";
}
```

"But they establish different things. `typeof null` is `'object'`, so an object check must exclude `null`. `instanceof Date` rejects a date from another iframe: its constructor is different. A Node `vm` context can do the same. `Array.isArray` works across those boundaries."

"And `typeof x === 'function'` includes class constructors. Try calling one without `new`. That check is not an invitation."

Linoy tries a property check on an empty object, then opens a response guard:

```typescript
const empty = {};
console.log("toString" in empty); // true
console.log(Object.hasOwn(empty, "toString")); // false

function isResponse(x: object): x is { error: string } {
  return "error" in x;
  // Includes inherited properties; doesn't check their value types.
}
```

**Chen Override**: "Which values pass that check and still crash when the caller uses the promised string?"

**Linoy**: "A class with a method named `error`. An object with `error: 42`. `in` finds the property, including on the prototype. It hasn't checked for a string."

"It also needs an object on the right. `if (value)` won't establish that; `"abc"` and `42` get through."

```typescript
function hasError(value: unknown): boolean {
  if (value) {
    return "error" in value;
    // Error: Type '{}' may represent a primitive value, which is not
    // permitted as the right operand of the 'in' operator.
  }
  return false;
}
```

"Force that through and `hasError("abc")` and `hasError(42)` both throw. Check `typeof value === 'object'` and `value !== null` before using `in`. Separately, if you only wanted a nullish check, truthiness rejects zero and the empty string too."

**Daniel**: "And `typeof NaN` is `number`. Narrowing to `number` does not promise a finite number. That takes another check."

---

### "Type predicates — safe if you don't lie"

**Noam** opens his guard function.

"I want a named check I can test. This one lets a handler treat its input as a `User` when it returns `true`."

```typescript
type User = { id: string; email: string; displayName: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "string" &&
    "email" in value && typeof value.email === "string" &&
    "displayName" in value && typeof value.displayName === "string"
  );
}

function greet(input: unknown) {
  if (isUser(input)) {
    return `Hello, ${input.displayName}`; // input narrowed to User
  }
  throw new Error("not a user");
}
```

"Now I can test the check in one place. If three handlers need a `User`, they can all call this. I don't want three copies of those field checks."

**Dafna Functor** points at the return annotation.

"Noam. Show me the signature again."

**Noam**: "`function isUser(value: unknown): value is User`."

**Dafna**: "This body would satisfy that signature too:"

```typescript
// Looks safe. Is a lie.
function isUser(value: unknown): value is User {
  return true;
}

// The declared predicate tells the compiler to narrow to User:
const x: unknown = 42;
if (isUser(x)) {
  x.email.toLowerCase(); // x.email is undefined; the method access throws.
}
```

**Daniel**: "Since TypeScript 5.5, the compiler can infer a predicate from some bodies without a return annotation. With an explicit predicate annotation, it takes your word instead. You've supplied the answer it would otherwise try to infer."

**Noam**: "That always-true body fails the first rejection test. I'm not dropping the tests because I gave the function a return annotation."

**Idan Greenfield**: "I'd rather have the function return the fields it checked."

---

### "Assertion functions — throw or return?"

**Guy Singleton** opens another function.

"An assertion function can give the caller a straight path. `asserts value is User` tells TypeScript to narrow `value` after the function returns. This one throws if a field is wrong."

```typescript
function assertIsUser(value: unknown): asserts value is User {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) || typeof value.id !== "string" ||
    !("email" in value) || typeof value.email !== "string" ||
    !("displayName" in value) || typeof value.displayName !== "string"
  ) {
    throw new TypeError("Expected User with string id, email, and displayName");
  }
  // The body checks the fields, but TypeScript does not verify
  // that those checks justify the assertion annotation.
}

function greetOrFail(input: unknown) {
  assertIsUser(input);
  // input is now User — no if-statement needed
  return `Hello, ${input.displayName}`;
}
```

"If this handler doesn't have a `User`, it has to stop. After `assertIsUser` returns, the rest of it can use the fields. I don't need an `if` around that work."

**Dafna**: "Where does the caller see the failure? There's no error value in that signature."

**Guy**: "It's an assertion. If it returns, the value is usable. If it throws, our request handler catches it."

**Dafna**: "And if I'm processing a list of inputs? I want to keep the good ones and report the rejected ones. A throw stops the traversal unless I catch it for each input."

**Guy**: "For that list, you would. In this handler, one invalid user rejects the request. I want it to stop."

**Noam**: "I want assertions for broken invariants: a missing required value, or a case that should be unreachable. A helper like `assertNever(value: never)` handles that second job. External input is allowed to be wrong. We should handle that as a result."

**Guy**: "You used `ApiUser.parse(raw)` in your API example. That throws. You said the error was clear and happened where we could handle it."

**Noam**: "Yes, it does."

**Guy**: "Was that wrong?"

**Noam**: "The check was doing its job. I should have shown the handler too. I want to see who catches it. If there isn't a handler, use the result."

**Dafna**: "I'd use the result either way. I want the failure in the signature when I move that call."

**Guy**: "And I don't want every function between the parser and the handler to repeat the same failure branch."

**Idan**: "Parse at the handler and pass `User` down. Those functions never receive the result union."

**Guy**: "That works. I'd still have the parser throw to the handler we already use for the request."

---

### "Parse, don't validate"

**Idan**: "Guy, where did this `unknown` come from?"

**Guy**: "Whatever the client posted. It's `unknown` for a reason."

**Idan**: "Then show me where it becomes a `User` I can use. Your annotation says the input passed. I want the function to return the fields it checked."

**Guy**: "They're already on the object."

**Idan**: "Prove it by producing it. Watch what the compiler checks when I construct the return value."

```typescript
type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string; input: unknown };

function parseUser(input: unknown): ParseResult<User> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "not an object", input };
  }
  if (!("id" in input) || typeof input.id !== "string") {
    return { ok: false, reason: "id missing or not a string", input };
  }
  if (!("email" in input) || typeof input.email !== "string") {
    return { ok: false, reason: "email missing or not a string", input };
  }
  if (!("displayName" in input) || typeof input.displayName !== "string") {
    return { ok: false, reason: "displayName missing or not a string", input };
  }

  return {
    ok: true,
    value: { id: input.id, email: input.email, displayName: input.displayName },
  };
}
```

**Idan**: "Drop the `email` check from `parseUser`. The `input.email` read in the return object no longer compiles. Drop the `email` check from `isUser`, and `isUser` still compiles. That's why I build the value."

**Noam** tries removing the check, then restores it.

**Noam**: "I still want `inputs.filter(isUser)` to give me `User[]`. A result doesn't fit there."

**Idan**: "For this handwritten parser, keep a predicate that calls it: `const isUser = (v: unknown): v is User => parseUser(v).ok`. That filters the original objects. If you want only the checked fields, map through the parser and keep the successful values."

**Noam**: "Then I don't have two sets of field checks to maintain."

**Idan**: "And a failure tells the caller which check failed. Your assertion gives me one message for the whole object."

**Guy**: "I can put the field name on an error. I can put the rejected value on it too."

**Idan**: "You can."

**Guy**: "Then stop comparing your parser to a generic message. I'll use your parser."

```typescript
class UserParseError extends Error {
  constructor(readonly reason: string, readonly input: unknown) {
    super(reason);
    this.name = "UserParseError";
  }
}

function parseUserOrThrow(input: unknown): User {
  const result = parseUser(input);
  if (!result.ok) {
    throw new UserParseError(result.reason, result.input);
  }
  return result.value;
}
```

**Guy**: "Same checks, same fields, same reason if it fails. The request handler catches `UserParseError`."

**Idan**: "And a caller outside that handler?"

**Guy**: "Has to follow the same convention."

**Idan**: "I want them to see the failure in the return type."

**Guy**: "For this request, the handler already knows how to reject the operation. I'll keep sending these failures to it."

---

### "Discriminated unions make the check ordinary"

**Dafna**: "Once you have a typed discriminated union, you can narrow with an ordinary `switch`. No separate guard function for each case."

```typescript
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function describeRequest<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle": return "Click to load";
    case "loading": return "Loading...";
    case "success": return `Got: ${JSON.stringify(state.data)}`;
    case "error": return `Failed: ${state.error.message}`;
  }
}
```

"In the success case, `state.data` is `T`. In the error case, `state.error` is `Error`. The tag gives me access to the right fields. If I add `{ status: 'retrying'; attempt: number }` without handling it, this function's `: string` return annotation catches the missing return."

**Daniel**: "That holds with strict null checking. Without that return annotation, the inferred result can become `string | undefined`. An explicit `assertNever` check is another way to enforce exhaustiveness."

**Dafna**: "Where does this union come from at runtime?"

**Idan**: "Our request module publishes state changes through an in-process event bus. The receiver gets `unknown`, so we have to check the tag and payload together. Error events carry actual `Error` objects here."

```typescript
// At the boundary — produce the discriminated shape:
function parseEvent(input: unknown): ParseResult<RequestState<unknown>> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "not an object", input };
  }
  if (!("status" in input)) {
    return { ok: false, reason: "missing status", input };
  }
  if (input.status === "idle") return { ok: true, value: { status: "idle" } };
  if (input.status === "loading") return { ok: true, value: { status: "loading" } };
  if (input.status === "success" && "data" in input) {
    return { ok: true, value: { status: "success", data: input.data } };
  }
  if (input.status === "error" && "error" in input && input.error instanceof Error) {
    return { ok: true, value: { status: "error", error: input.error } };
  }
  return { ok: false, reason: "unrecognized event status", input };
}
```

**Guy**: "And if another module uses a different tag?"

**Idan**: "Translate it in the parser. The rest of the code can keep using `RequestState`."

---

### "Who writes the parsers?"

**Oded Shipley**: "So `parseUser` is fine for one type. What about forty? I'm not writing forty of these. We already have a library for this."

**Linoy**: "Use Zod, then. Valibot and ArkType are other options if we're evaluating libraries, but that's another PR."

**Gil Benchmark**: "Keep the cases you would have tested against the handwritten parser. Missing fields, wrong element types, `null`, `undefined`. Run them against the schema. Importing a validator doesn't tell us whether we wrote the right schema."

**Linoy**: "Here's the same user shape. I've also required an email address rather than just a string. Its failure reason is Zod's issue list as text."

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): ParseResult<User> {
  const result = UserSchema.safeParse(input);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, reason: result.error.message, input };
}
```

**Chen**: "Are you keeping the handwritten `User` type too?"

**Linoy**: "No. This version replaces it with `z.infer<typeof UserSchema>`."

**Chen**: "And when someone adds a field?"

**Idan**: "They add it to the schema. The type follows. Otherwise we have two definitions to keep in step."

**Guy**: "Zod offers `.parse` as well. Same schema, throws on failure."

**Linoy**: "Yes. `.safeParse` gives Idan the result, `.parse` gives you the exception. We can use the same schema."

## The Turn

**Gilad Stacktrace** scrolls back to Idan's handwritten `parseUser` and Guy's `parseUserOrThrow` wrapper.

"Give them the same bad input."

```typescript
const badUser = { id: 42, email: "ada@example.com", displayName: "Ada" };

const result = parseUser(badUser);
if (!result.ok) console.log(result.reason);
// id missing or not a string

try {
  parseUserOrThrow(badUser);
} catch (error) {
  if (!(error instanceof UserParseError)) throw error;
  console.log(error.reason);
  // id missing or not a string
}
```

**Gilad**: "Same failure. Same details. What happens next?"

**Guy**: "The handler rejects the request."

**Idan**: "The caller chooses. Reject, retry, collect the failure with the other rejected rows."

**Guy**: "Which is useful for Dafna's batch. I don't have a batch. I have a request we can't fulfill."

**Chen**: "Can the caller ignore your result, Idan?"

**Idan**: "They can ignore the call. They can't take its `value` as a `User` without dealing with the union. That's the check I want when this function gets used somewhere new."

**Guy**: "Then give callers outside our handler the result. I'll keep the throwing adapter for this request."

## The Debate Continues

Parse external input where it enters, and keep one set of checks. Choose how failure travels from what the callers need to do with it.

Callers outside Guy's handler get the result; inside it, Guy still wants the throwing adapter, and Idan and Dafna want the result there too. Neither choice requires giving up the checked `User` or the failure details.

| Situation | Starting point | Condition |
|-----------|----------------|-----------|
| External data with expected rejection | Parser returning a result | Prefer this when callers choose different recovery paths or need to collect failures |
| An operation with one established failure handler | A throwing parser can fit | Show where errors are caught and which errors the handler recognizes |
| A true internal invariant | Assertion function | The explicit assertion annotation still needs review and tests |
| A primitive value | `typeof`, equality, or a more specific runtime check | A JavaScript type such as `number` does not promise validity for your domain |
| A class instance | `instanceof` | Be aware of constructor identity across realms |
| A typed discriminated union | `switch` on the tag | Enforce exhaustiveness with an explicit return type or `assertNever` |
| A reusable shape check | Type predicate | Test explicit predicates; their annotations are trusted |
| A boundary with many shapes | Schema library, with types derived from schemas | Test the schemas against the inputs your application accepts and rejects |

**Oded**: "We can use the schema without settling this for every service?"

**Guy**: "Yes."

**Idan**: "Show me the handler before you pick `.parse`."

## Additional Takes

**Noam Kiperman**: "Keep the predicate tests when the type changes. If `isUser` has its own field checks and a predicate annotation, adding a required field to `User` won't force those checks to change."

**Eden Legacy**: "I would migrate the checks first. Get one parser behind the existing callers, including the ones that expect exceptions. Then change how failure travels where the callers need it. Don't make the old callers learn both changes on the same morning."
