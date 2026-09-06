# Chapter 5: The Guard at the Gate

## The Principle

The previous four chapters were about how TypeScript *describes* values: what the type can be, how to compose shapes, where the escape hatches live. This chapter is about a different verb. What does it mean, inside a function, to *prove* that a value has the type the compiler thinks it does?

**Daniel Compiler** opens his laptop.

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

"Look at the type of `x` inside each branch. The compiler tracks two different types in two different code paths — same variable, same scope, different facts known. That's narrowing. It's called *control flow analysis*. The compiler reads your code as a graph of paths and asks, 'on this path, what have we proven about this value?'"

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

"Same intent. Different narrowing. `!= null` is one of the few places the language uses loose equality on purpose — it excludes both `null` and `undefined`. Strict `!== null` excludes only `null`. The parameter still has `undefined` in it, so the strict check leaves it on the table. The compiler is right; the developer's mental model was off by one."

He looks up.

"You have already been using narrowing when you write checks like these. The compiler follows the conditions along each path."

**Chen Override**: "Does it check the body of a type guard too? If I say a function proves something?"

**Daniel**: "It checks the body as code. But if you write a type predicate in the return annotation, it trusts that predicate. You can write one that always returns `true`."

**Noam Kiperman**: "You can also test it."

## The Debate

### "The `typeof` family — what lies and what doesn't"

**Linoy Nightly**:

"Start with the checks you already write: `typeof`, `instanceof`, `Array.isArray`, `in`. Equality and truthiness checks narrow too. There are a few runtime details you have to remember."

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

"For the boring 80% — primitives, dates, arrays — these are all you need. Hover the variable inside each branch and the language server shows you the narrowed type. The compiler does its job."

**Chen Override** unfolds his arms.

"What do those checks leave unproven?"

Linoy sighs, but she enjoys this.

"`typeof null === "object"`. So if I write `if (typeof value === "object")` thinking I excluded null, I didn't. `typeof NaN === "number"`. So if I write `if (typeof value === "number")` thinking I have a usable number, I might have NaN. `instanceof` checks the prototype chain — if your `Date` came from another iframe or a Node `vm` context, `value instanceof Date` returns false because the prototype is different. `Array.isArray` is the one that's actually safe across realms — it doesn't check prototypes, it checks an internal slot. And `typeof x === "function"` matches arrow functions, regular functions, async functions, class constructors, and generators. They are not interchangeable."

**Chen**: "And `in`?"

**Linoy** takes her time with this one:

"The `in` operator does not check whether an object has the property as its own. It walks the prototype chain. Inherited properties — class methods, anything `Object.prototype` provides — return true. `"toString" in {}` is `true`."

```typescript
const empty = {};
console.log("toString" in empty); // true
console.log(Object.hasOwn(empty, "toString")); // false

function isResponse(x: object): x is { error: string } {
  return "error" in x;
  // True for any object that has `error` anywhere on its prototype chain —
  // including a class instance whose class defines a method called `error`.
  // Also doesn't check that x.error is a string — double-unsafe by design,
  // exactly the kind of unchecked promise we're warning about.
}
```

"A class method called `error` passes that check. So does an `error` property containing a number. The check only tells you the property exists, possibly on a prototype. It has not established `string`."

**Chen**: "And `"x" in null` throws. So does using any primitive on the right of `in`. Check that you have an object first."

**Linoy**: "And `if (x)` also rejects `0`, the empty string, `false`, `0n`, and `NaN`. If you only meant to reject nullish values, that check is too broad."

**Chen**, satisfied: "Nothing to add."

**Linoy**: "The checks work. You have to ask them the question you actually mean."

**Daniel**: "`typeof NaN` is `number` in JavaScript too. Narrowing to `number` does not promise a finite number. That takes another check."

---

### "Type predicates — safe if you don't lie"

**Noam** opens his guard function.

"User-defined type guards. The construct that lets you write a function that *is* the narrowing logic, in one place, named, testable."

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

**Dafna**: "And what does TypeScript check, in that signature, to make sure the predicate is honest?"

**Noam**: "It trusts the annotation. We just said that."

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

**Dafna**: "Then adding `value is User` has given me another claim to review. The compiler accepts this body too."

**Daniel**: "An explicit predicate is trusted. TypeScript can infer predicates from some function bodies, but that is a different case. Writing the annotation yourself does not make the checker prove it."

**Noam**: "That's why I want the tests. I'm still putting the check in one place."

**Idan Greenfield**, half to herself: "You're all arguing about how to prove it. Nobody's asked when the value got the type in the first place."

A pause. Noam looks over.

---

### "Assertion functions — throw or return?"

**Guy Singleton** opens another function.

"Assertion functions. `asserts x is T`. Imperative narrowing — the function throws if the value is wrong, and the compiler treats the *successful return* as proof of the type."

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

"This is how I write invariants. If `input` isn't a User, the program can't continue. The throw says so. The caller doesn't need a wrapping `if` — the assertion shapes the type going forward, and the failure case is a thrown exception, not a control flow branch I have to handle."

**Dafna**: "Where does the caller see that it can fail? The signature returns `void`."

**Guy**: "It's an assertion. If it returns, the value is usable. If it throws, our request handler catches it."

"And if I'm processing a list of inputs? I want to keep the good ones and report the rejected ones. A throw stops the traversal unless I catch it for each input."

**Guy**: "For that list, you would. In this handler, one invalid user rejects the request. I want it to stop."

**Noam**: "Assertion functions belong with invariants. `assertNever`, a required value that's unexpectedly missing. External input is allowed to be wrong. We should handle that as a result."

**Guy**: "You used `ApiUser.parse(raw)` in your API example. That throws. You said the error was clear and happened where we could handle it."

Noam scrolls back to the example.

"Yes. It does."

**Guy**: "Was that wrong?"

"The check was doing its job. I should have shown the handler too. I want to see who catches it. If there isn't a handler, use the result."

**Dafna**: "I'd use the result either way. I want the failure in the signature when I move that call."

**Guy**: "And I don't want every function between the parser and the handler to repeat the same failure branch."

---

### "Parse, don't validate"

**Idan Greenfield** had asked something earlier. Nobody picked it up. When Guy finishes, she leans forward to ask it differently.

"Guy. Where did the `unknown` come from?"

Guy looks at her. "From the API."

"And before the API?"

"From whatever the client posted. Or a database column. I don't know — it's `unknown` for a reason."

"Then show me where it becomes a `User` I can use. Your annotation says the input passed. I want the function to return the fields it checked."

**Guy**: "They're already on the object."

**Idan**: "Yes. Watch what the compiler checks when I construct the return value."

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

*"Prove it by producing it."*

"Delete the `email` field from that return object. The function no longer compiles. Leave it out of an explicitly annotated predicate's checks, and the predicate can still compile. That's why I build the value."

**Noam** tries the deletion, then restores the field.

**Idan**: "And a failure tells the caller which check failed. Your assertion gives me one message for the whole object."

**Guy**: "I can put the field name on an error. I can put the rejected value on it too."

"Yes."

"Then stop comparing yours to a generic message. I'll use your parser."

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

**Idan** reads the function.

"And a caller outside that handler?"

"Has to follow the same convention."

"I want them to see the failure in the return type."

**Guy**: "I want one place that handles it. I'm not changing every call just to repeat that decision."

**Noam**: "At least we're reviewing the same checks now."

---

### "Discriminated unions make the check ordinary"

**Dafna Functor** picks up the thread.

"Once you have a typed discriminated union, you can narrow with an ordinary `switch`. No separate guard function for each case."

```typescript
type RequestState<T> =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: T }
  | { kind: "error"; error: Error };

function describeRequest<T>(state: RequestState<T>): string {
  switch (state.kind) {
    case "idle": return "Click to load";
    case "loading": return "Loading...";
    case "success": return `Got: ${JSON.stringify(state.data)}`;
    case "error": return `Failed: ${state.error.message}`;
  }
}
```

"Inside `case "success"`, `state.data` is `T`. Inside `case "error"`, `state.error` is `Error`. No type guard. No predicate. No assertion. The discriminant *is* the narrowing. And if I add `{ kind: "retrying"; attempt: number }` to the union, every `switch` that doesn't handle it stops compiling — the same `never` exhaustiveness trick we used on enums works here too."

**Daniel**: "With strict null checking, the annotated return type `: string` catches a missing return here. Without the annotation, the inferred result can become `string | undefined`. An explicit `assertNever` check is another way to enforce exhaustiveness."

**Idan**: "If the value came from outside, first check that the tag and payload agree. This parser accepts in-memory values; its error case expects an actual `Error` object, not a JSON representation of one."

```typescript
// At the boundary — produce the discriminated shape:
function parseEvent(input: unknown): ParseResult<RequestState<unknown>> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "not an object", input };
  }
  if (!("kind" in input)) {
    return { ok: false, reason: "missing kind", input };
  }
  if (input.kind === "idle") return { ok: true, value: { kind: "idle" } };
  if (input.kind === "loading") return { ok: true, value: { kind: "loading" } };
  if (input.kind === "success" && "data" in input) {
    return { ok: true, value: { kind: "success", data: input.data } };
  }
  if (input.kind === "error" && "error" in input && input.error instanceof Error) {
    return { ok: true, value: { kind: "error", error: input.error } };
  }
  return { ok: false, reason: "unrecognized event kind", input };
}
```

**Guy**: "And if the external format uses a different tag?"

**Idan**: "Translate it in the parser. The rest of the code can keep using `RequestState`."

---

### "Hand-written vs zod / valibot / arktype at the boundary"

**Oded Shipley** picks up the practical question:

"So `parseUser` is fine for one type. What about forty? I'm not writing forty parsers and maintaining forty test suites. *We can fix it in the next sprint* — or we can use a schema library and ship today."

**Linoy**: "We already depend on Zod. Start there. Valibot and ArkType are other options if we're evaluating libraries, but that's another PR."

**Gil Benchmark**: "Keep the cases you would have tested against the handwritten parser. Missing fields, wrong element types, `null`, `undefined`. Run them against the schema. Importing a validator doesn't tell us whether we wrote the right schema."

**Linoy**: "Here's the same user shape. I've also required an email address rather than just a string."

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
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

**Gilad Stacktrace** points at `parseUser`, then at Guy's wrapper.

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

"They can ignore the call. They can't take its `value` as a `User` without dealing with the union. That's the check I want when this function gets used somewhere new."

Guy leaves his wrapper on the screen.

## The Debate Continues

The room has agreed to parse external input and keep the runtime checks in one place. It has not agreed on how every parser should report failure.

Idan and Dafna prefer a result for expected rejection. The return type exposes the failure case, and a batch can retain failures alongside successes. Guy prefers throwing when an established handler owns rejection for the whole operation. Both versions above produce a checked `User`; both carry the same failure details.

The unresolved choice is how much each caller should know about failure handling. That matters when code moves between a request handler, a batch, and a reusable library. A convention that works in one setting may need an adapter in another.

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

**Noam Kiperman**: "Keep the predicate tests when the type changes. Adding a required field to `User` doesn't force an explicitly annotated `isUser` to check it."

**Daniel Compiler**: "[TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html) can infer predicates for some functions without return annotations. That inference comes from the body. It does not verify a predicate you explicitly wrote."

**Eden Legacy**: "I would migrate the checks first. Get one parser behind the existing callers, including the ones that expect exceptions. Then change how failure travels where the callers need it. Those are separate changes; I'd like to review them separately."
