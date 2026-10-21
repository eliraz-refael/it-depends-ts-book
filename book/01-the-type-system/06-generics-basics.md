# Chapter 6: The Hole in the Function

## The Principle

**Prof. Eli Typeworth** writes `ParseResult<T>` on the board.

"In `let x = 42`, `x` stands for a value. In `ParseResult<T>`, `T` stands for a type. We call `T` the type parameter and the `User` in `ParseResult<User>` its type argument. The same idea works in a function:"

```typescript
function identity<T>(value: T): T {
  return value;
}

const word = identity("hello");      // T becomes "hello" — the literal
const user = identity({ id: "u1" }); // T becomes { id: string }
```

"Read `identity` aloud: whatever type goes in is the type that comes out. The same `T` names the parameter type and the return type. The compiler infers it from the argument at each call."

"Use a type parameter when a caller needs a relationship between types in the signature. Ask what supplies the type argument and what depends on it. If nothing else depends on it, try removing it. If only the caller's chosen type supplies a return-only `T`, with no check to establish it, treat that as an assertion. The type argument is a claim, not evidence."

"Whether to write the generic before a second caller needs it is a separate decision. This rule tells us what the signature promises, not when to generalize."

## The Debate

### "When do you actually reach for the brackets?"

**Oded Shipley**:

"My billing function takes an `Invoice` and returns a `PaymentPlan`. That's all it needs to do. I use arrays and promises all day; I don't need to write my own generic just because I use somebody else's. Show me the second thing this function has to work on."

**Noam Kiperman**:

"Your billing function can stay concrete. But look at what this helper makes its caller forget:"

```typescript
// Problem: the element type goes in — and never comes back out
function firstElement(items: unknown[]): unknown {
  return items.length > 0 ? items[0] : null;
}

const names = ["Ada", "Grace", "Barbara"];
const element = firstElement(names); // unknown — the string-ness is gone

// Better: the element type survives the round trip
function firstItem<T>(items: T[]): T | null {
  return items.length > 0 ? items[0] : null;
}

const name = firstItem(names); // string | null
```

"I passed strings. Why am I checking the element's type again? I only need to handle the empty list."

**Oded**: "If the only caller passes strings, you could have written `string[]` and gone home."

**Dima Bridge**: "Oded, would you accept `firstItem` if another caller passed a different element type?"

**Oded**: "Yes. Then we need it."

**Noam**: "We don't need to wait for a second caller to write these three lines generically."

**Dima**: "So you agree about what the generic does. You disagree about when to introduce it."

**Oded**: "Which is the part that comes up in my PRs."

---

### "The single-use type parameter"

**Daniel Compiler** projects a function onto the screen.

"Here is one I would remove."

```typescript
function logPayload<T>(payload: T): string | undefined {
  console.log(payload);
  return JSON.stringify(payload);
}
```

"`JSON.stringify(undefined)` returns `undefined`, although the library declares `string`. This annotation includes that missing case. But nothing in the return depends on `T`."

**Oded**: "Can I pass the same values if you remove it?"

**Daniel**: "Use `unknown` for the parameter. You still can:"

```typescript
function logPayload(payload: unknown): string | undefined {
  console.log(payload);
  return JSON.stringify(payload);
}
```

**Eden Legacy**: "Search the callers before removing it. `logPayload<Something>(p)` would need changing."

**Daniel**: "Those using inference still work. This function has no reason to offer a type argument."

**Oded**: "Finally. A refactor that deletes something."

**Daniel**: "Don't turn it into a search-and-delete rule yet."

He opens the DOM declarations.

```typescript
// T appears only in the return — yet this one is everywhere, and it works
const emailField = document.querySelector<HTMLInputElement>(".email");
// emailField: HTMLInputElement | null
```

"`querySelector`. The DOM lib calls the parameter `E`. In this overload it appears in the return type, and the caller supplies it explicitly. The compiler checks that you named a kind of `Element`. It does not check that `.email` will find an input element."

**Noam**: "So I should review that type argument like an assertion."

**Daniel**: "Yes. `querySelector<HTMLInputElement>(".email")` can return a different kind of element at runtime."

**Oded**: "So we keep the brackets even though the caller has to justify them?"

**Daniel**: "Here, yes. `E extends Element` limits the choice, and the DOM call really does return an `Element` or `null`. Knowing the markup can justify a narrower element type. If you cannot rely on that markup, check the result with `instanceof HTMLInputElement` instead."

---

### "What does the body need?"

**Noam** takes the board.

"With an unconstrained `T`, I can pass values through without knowing their properties. If the body needs `.name`, I have to require it:"

```typescript
// No constraint — the body never touches the elements, so any T works
function lastItem<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

// Constraint — the body needs `.name`, so T must bring one
function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}
```

"`extends { name: string }` requires a string `name` on every element. Without it, `a.name` doesn't compile. We still return `T[]`, so an employee keeps its department:"

```typescript
type Employee = { name: string; department: string };

const team: Employee[] = [
  { name: "Rivka", department: "Infra" },
  { name: "Amit", department: "Design" },
];

const sorted = sortByName(team);
// sorted: Employee[] — department came through

// Compare the non-generic version:
function sortByNameFlat(items: { name: string }[]): { name: string }[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

const flattened = sortByNameFlat(team);
// flattened: { name: string }[] — department is gone from the type
```

"The objects still have departments at runtime in both versions. The generic preserves that information in the return type too."

**Oded**: "Or `function sortEmployees(items: Employee[]): Employee[]`. I know where to look when payroll calls."

**Noam**: "This implementation only uses `name`. Why require an entire `Employee`?"

**Oded**: "Because that's the caller I have. You're choosing `name` as the shared contract before we know what the vendor list needs. It might use `displayName`, or need a different tie-break."

**Noam**: "The constraint describes what this body reads. I can test it with just `{ name: 'Ada' }`, without constructing an `Employee`. It doesn't promise to sort every future list."

**Oded**: "Then let this one say `Employee`. I can generalize the signature later without changing `sortEmployees(team)`. When there's another caller, we'll know whether it actually shares the operation."

**Daniel**: "Keep this use of `extends` in mind. In conditional types — `T extends U ? X : Y` — it asks whether a type is assignable, instead of requiring it as a constraint."

---

### "Inference, annotation, and the two-parameter spotlight"

**Linoy Nightly** adds a second type parameter.

"You don't have to supply the type arguments at every call. Here the object and the key give the compiler both type arguments. My favorite three lines:"

```typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const settings = { theme: "dark", fontSize: 14, telemetry: false };

const theme = get(settings, "theme");   // string
const size = get(settings, "fontSize"); // number

get(settings, "fontsize");
// Error: Argument of type '"fontsize"' is not assignable to
//        parameter of type '"fontSize" | "telemetry" | "theme"'
```

"`keyof T` gives you the object's keys. `T[K]` gives you the type at the chosen key. The compiler infers both from the arguments: `fontSize` gives `number`, `theme` gives `string`. And `fontsize` is rejected because it isn't a key. You don't write either type argument at the call site. That's the part I like."

**Eden**: "In one migration, our stores started empty and filled after a request. This was the first call we typed:"

```typescript
function createStore<T>(initial: T) {
  let value = initial;
  return {
    get: () => value,
    set: (next: T) => { value = next; },
  };
}

const store = createStore(null);
// T inferred as null. Forever.

store.set({ id: "u1" });
// Error: Argument of type '{ id: string; }' is not assignable to
//        parameter of type 'null'
```

"The initial value tells it `null`. It can't infer the user we intend to store after the request finishes. We have to supply that part:"

```typescript
const userStore = createStore<{ id: string } | null>(null);
// set() now accepts a user — or null
```

"I also write explicit return types on exported functions when they express an API we intend to keep. Otherwise an implementation change can alter the declaration without anyone reviewing that as an API change."

**Linoy**: "That's the return type you publish, though. You still wouldn't make callers write both type arguments to `get`."

**Eden**: "No. The object and key tell it enough. The store's first value didn't."

---

### "Generics that lie"

**Daniel**: "Here is the return-only case I would reject."

```typescript
function parseConfig<T>(input: string): T {
  return JSON.parse(input) as T;
}

const config = parseConfig<{ retries: number }>('{"retires": 3}');
config.retries.toFixed(1);
// Compiles clean. At runtime, `config.retries` is undefined —
// one misspelled key in the string, and reading `.toFixed` off
// undefined throws a TypeError.
```

"The caller chooses an unconstrained `T`. Unlike the DOM call, this body can return any JSON value, not necessarily even an object. Nothing checks the `retries` field."

**Idan Greenfield**: "Delete the cast, Daniel."

```typescript
function parseConfig<T>(input: string): T {
  return JSON.parse(input); // still compiles — no `as` required
}
```

**Daniel**: "Still compiles. `JSON.parse` returns `any`, so the compiler accepts it as `T` even without the cast."

**Idan**: "Now I can't even find the unchecked claim by searching for `as`."

**Noam**: "Where would you look?"

**Idan**: "At what supplies the return type. `lastItem` gets its `T` from the input array. `get` gets `T` from the object argument and `K` from the key argument. This function doesn't know what it has. Adding a constraint wouldn't make it check the JSON either. I'd return `unknown`, then parse the shape we need."

```typescript
// Honest: returns exactly what it has
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

// Honest: produces the T — or tells you why it couldn't
type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string; input: unknown };

type RetryConfig = { retries: number };

function parseRetryConfig(data: unknown): ParseResult<RetryConfig> {
  if (typeof data !== "object" || data === null) {
    return { ok: false, reason: "not an object", input: data };
  }
  if (!("retries" in data) || typeof data.retries !== "number") {
    return { ok: false, reason: "retries missing or not a number", input: data };
  }
  return { ok: true, value: { retries: data.retries } };
}

const result = parseRetryConfig(parseJson('{"retires": 3}'));
// { ok: false, reason: "retries missing or not a number", input: { retires: 3 } }
```

**Oded** points at `ParseResult<T>`.

"One `T`. Are we deleting that too?"

**Idan**: "It's a type definition. It describes a slot we fill with `RetryConfig`. It isn't a function promising it can produce whatever type the caller asks for."

**Daniel**: "The single-use check was about function signatures. `Array<T>`, `Promise<T>`, `ParseResult<T>` need their element or payload types."

## The Turn

**Liron Closure** takes the marker.

"A lens holds no picture. You grind the glass and point it at a scene. Tomorrow you can point it somewhere else; the shape of the glass stays the same."

"Or you can take a photograph. A photograph is often what you want. Oded's billing function knows its subject: `Invoice` in, `PaymentPlan` out. It does not have to admit a scene it will never see."

"The generic is useful when the relationship survives a change of subject. An array of names gives you a name; an array of invoices gives you an invoice. You describe that once."

**Chen Override**: "And `identity`? It returns exactly what it got. What did the lens do?"

Liron looks back at Eli's first example.

"It preserved the type. You are right to ask — the image only gets us so far. The work here need not be a transformation. It can be carrying information that an `unknown` return would lose."

**Oded**: "And if the second subject never arrives?"

**Liron**: "Then you and Noam still have a review to finish. The signature alone does not tell us whether you needed the generic."

## The Verdict

> In a function signature, use a generic to express a relationship between types. Look for where the type argument comes from and what depends on it. A return-only parameter supplied solely by the caller, without evidence from the body, is an unchecked claim. A parameter that affects nothing else may be unnecessary; check existing calls before removing it.

Noam would keep `sortByName` because its body already states the small shared requirement. Oded would keep `sortEmployees` until another caller needs the same ordering. The relationship test does not decide that timing question.

**The Accepted Standard:**

| Situation | Recommended | Why |
|-----------|-------------|-----|
| The output type depends on the input type | `<T>` tying both positions | The relationship is the whole point |
| An unconstrained `<T>` appears only as a parameter type and affects nothing else | Consider `unknown` — or the concrete type | Check whether callers depend on explicit type arguments before removing it |
| The body needs a property of `T` | `<T extends { ...minimal shape }>` | Unlocks the body; the `T[] → T[]` shape still preserves the caller's type |
| Two arguments must move together | Chain the parameters: `<T, K extends keyof T>` | The key must belong to the object; the selected key determines the result type |
| Caller-supplied element subtype (`querySelector` style) | Justify the narrower type from the markup, as you would an `as` | The DOM supplies `Element` or `null`; the subtype claim is still unchecked |
| The body can't produce its `T` | Return `unknown`, or a concrete `ParseResult<YourType>` from a real parser | The caller's type argument does not validate the value |
| Explicit type arguments vs inference | Infer from arguments; supply type arguments when those arguments lack needed information | Explicit return annotations are a separate choice for defining a stable public contract |

**Daniel**: "Compare these two functions. `pluck` reads the selected property from each item. `loadState` parses a stored string, then promises whatever type its caller requests."

```typescript
// The rule, visibly working: every position tied to another.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const departments = pluck(team, "department"); // string[]
```

```typescript
// Danger: T appears only in the return type.
function loadState<T>(key: string): T {
  return JSON.parse(localStorage.getItem(key) ?? "null");
  // any → T: no relationship, no evidence — and no cast required.
}
```

## Additional Takes

**Linoy Nightly**: "For literal routes, `function routes<const T extends readonly string[]>(paths: T): T` keeps `routes(["/home", "/about"])` as `readonly ["/home", "/about"]` instead of `string[]`. That's a `const` type parameter, introduced in 5.0."

"When the fallback must be one of the listed values, there's `NoInfer<T>`, from 5.4: `function setDefault<T extends string>(values: T[], fallback: NoInfer<T>)`. Now `setDefault(["red", "green"], "blue")` is rejected. Without `NoInfer`, `"blue"` joins the inferred type. The fallback still has to fit `T`, but it doesn't help choose it."

**Idan Greenfield**: "A generic parser can take the check as an argument: `function parseWith<T>(input: string, parse: (value: unknown) => ParseResult<T>): ParseResult<T>`. Now `T` comes from what that parser produces."

**Prof. Eli Typeworth**: "We can also compute with that type variable: branch on it, walk an object's keys, build another type from it."
