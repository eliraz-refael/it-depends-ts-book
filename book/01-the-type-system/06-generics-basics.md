# Chapter 6: The Hole in the Function

## The Principle

Five chapters of escape hatches, identities, choices, and proofs — and one construct has been standing quietly in the corner of nearly every code block. `ParseResult<T>`. `RequestState<T>`. The angle brackets have been *used* since Chapter 1 and explained exactly never. Time to pay that debt.

**Prof. Eli Typeworth** begins, and for once he doesn't start with TypeScript.

*"Let us return to first principles — this one is older than the language. Older than most languages."*

"When you write `let x = 42`, you introduce a variable that stands for a value. All of programming rests on that move: say a thing once, with a placeholder, and let the placeholder take many values. A generic is exactly that move, performed one level up. `T` is a variable that stands for a *type*."

```typescript
function identity<T>(value: T): T {
  return value;
}

const word = identity("hello");      // T becomes "hello" — the literal
const user = identity({ id: "u1" }); // T becomes { id: string }
```

"Read the signature out loud: *whatever type goes in is the type that comes out.* That sentence is the entire feature. Not 'this function accepts anything' — `unknown` already says that, without ceremony. The signature states a relationship between what enters and what leaves. The relationship is declared once; at each call site, the compiler fills in `T` from the evidence the call provides."

Eli caps the marker.

"Everything we will argue about today — constraints, inference, lies — lives inside that one sentence. The debate, as ever, is about when the sentence is worth saying."

## The Debate

### "When do you actually reach for the brackets?"

**Oded Shipley**:

"My billing function takes an `Invoice` and returns a `PaymentPlan`. That's all it needs to do. I use arrays and promises all day; I don't need to write my own generic just because I use somebody else's. Show me the second thing this function has to work on."

**Noam Kiperman** counters:

"You reach for a generic any time the alternative *loses type information*. Watch what happens without one:"

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

"The `unknown` version works — at runtime. The type system is where it dies: the caller hands you a `string[]` and gets back a shrug. You *had* the information. You threw it away in the signature. *Over my dead type definition.*"

**Oded**: "And nine times out of ten the only caller is one file away, and you could have written `string[]` and gone home."

**Dima Bridge**: "Oded, would you accept `firstItem` if another caller passed a different element type?"

**Oded**: "Yes. Then we need it."

**Noam**: "We don't need to wait for a second caller to write three lines correctly."

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

"The return includes `undefined` because `JSON.stringify(undefined)` returns it. Question for the room: what work does `T` do here?"

Silence, then someone starts: "It lets you pass any—"

"You can already pass any value to `unknown`. `T` appears in the parameter, but the return is always annotated `string | undefined`. None of the inferred call-site results use `T`. Replace it:"

```typescript
function logPayload(payload: unknown): string | undefined {
  console.log(payload);
  return JSON.stringify(payload);
}
```

"The calls that relied on inference still work. An explicit `logPayload<Something>(p)` would need changing, but the function has no reason to let callers choose a type argument."

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

"Yes. `querySelector<HTMLInputElement>(".email")` can return a different kind of element at runtime. The type argument doesn't inspect the DOM."

**Oded**: "The brackets aren't doing nothing, though. They change the result type."

**Daniel**: "Correct. This one makes a claim that the caller has to justify. `logPayload` didn't need a claim at all."

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

"`extends { name: string }` does two jobs at once. It unlocks the body — without it, `a.name` doesn't compile. And because the signature stays `T[] → T[]`, the caller's *whole* type survives the trip:"

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

**Oded**, squinting at the board: "Or — radical idea — `function sortEmployees(items: Employee[]): Employee[]`. Concrete. Readable. Greppable."

**Noam**: "Then the vendor list needs sorting too. This implementation only uses `name`. Why require an entire `Employee`?"

**Oded**: "If the second caller ever shows up. Write it concrete, generalize on the second caller — that part of my position I'm keeping."

**Daniel**: "Keep this use of `extends` in mind. In conditional types — `T extends U ? X : Y` — it asks whether a type is assignable, instead of requiring it as a constraint."

---

### "Inference, annotation, and the two-parameter spotlight"

**Linoy Nightly** adds a second type parameter.

"Everyone's been writing type arguments on the board like callers actually supply them. They don't. The compiler *infers* `T` from the arguments, and the craft of a good generic signature is giving inference enough evidence. Exhibit A — the best four lines in TypeScript:"

```typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const settings = { theme: "dark", fontSize: 14, telemetry: false };

const theme = get(settings, "theme");   // string
const size = get(settings, "fontSize"); // number

get(settings, "fontsize");
// Error: Argument of type '"fontsize"' is not assignable to
//        parameter of type '"fontSize" | "theme" | "telemetry"'
```

"`keyof T` gives you the object's keys. `T[K]` gives you the type at the chosen key. The compiler infers both from the arguments: `fontSize` gives `number`, `theme` gives `string`. And `fontsize` is rejected because it isn't a key. You don't write either type argument at the call site. That's the part I like."

**Eden Legacy** turns from the window.

"Now let me show you the same inference with bad evidence. *I've seen this fail at scale* — this exact line, hundreds of times, in one migration:"

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

"Inference answers with the evidence it has, and the evidence at this call site is one `null`. Nobody made a mistake. The caller meant 'no user yet.' The author meant 'whatever you initialize with.' The compiler heard 'null, always.' The fix is to say what inference can't see:"

```typescript
const userStore = createStore<{ id: string } | null>(null);
// set() now accepts a user — or null
```

"I also write explicit return types on exported functions when they express an API we intend to keep. Otherwise an implementation change can alter the declaration without anyone reviewing that as an API change."

**Linoy**: "Return annotations, sure. But that doesn't mean callers should have to write type arguments everywhere."

**Eden**: "Agreed. `createStore(null)` needed one because the initial value couldn't tell the compiler what we planned to store later. Your `get` example has enough evidence already."

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

"The caller chooses `T`. The body parses JSON and asserts that it got that type. Nothing checks the `retries` field."

**Idan Greenfield** leans forward.

"It's worse than you're saying, Daniel. Delete the cast."

```typescript
function parseConfig<T>(input: string): T {
  return JSON.parse(input); // still compiles — no `as` required
}
```

**Daniel**: "Yes. `JSON.parse` returns `any`, so the compiler accepts it as `T` even without an assertion."

**Idan**: "Now I can't even find the unchecked claim by searching for `as`."

**Noam**: "Where would you look?"

**Idan**: "At what the function returns. `lastItem` gets its `T` from the input array. `get` reads a property whose key is constrained. This function doesn't know what it has. I'd return `unknown`, then parse the shape we need."

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

"Then you and Noam still have a review to finish. The signature alone does not tell us whether you needed the function."

## The Verdict

> In a function signature, use a generic to express a relationship between types. Look for where the type argument comes from and what depends on it. A return-only parameter supplied by the caller may be an unchecked assertion; a parameter that affects nothing else may be unnecessary.

**The Accepted Standard — a decision framework:**

| Situation | Recommended | Why |
|-----------|-------------|-----|
| The output type depends on the input type | `<T>` tying both positions | The relationship is the whole point |
| An unconstrained `<T>` appears only as a parameter type and affects nothing else | Consider `unknown` — or the concrete type | Check whether callers depend on explicit type arguments before removing it |
| The body needs a property of `T` | `<T extends { ...minimal shape }>` | Unlocks the body; the `T → T` shape still preserves the caller's type |
| Two arguments must move together | Chain the parameters: `<T, K extends keyof T>` | Relationships can have more than two ends |
| Caller-supplied, return-only `T` (`querySelector` style) | Treat it as a typed assertion — justify it like an `as` | The compiler is taking your word, not checking evidence |
| The body can't produce its `T` | Return `unknown`, or a concrete `ParseResult<YourType>` from a real parser | A promise with no production is a lie in brackets |
| Explicit type arguments vs inference | Infer from arguments; supply type arguments when those arguments lack needed information | Explicit return annotations are a separate choice for defining a stable public contract |

**In practice — the two anchors:**

```typescript
// The rule, visibly working: every position tied to another.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const departments = pluck(team, "department"); // string[]
```

```typescript
// Danger: the anti-pattern. T exits everywhere and enters nowhere.
function loadState<T>(key: string): T {
  return JSON.parse(localStorage.getItem(key) ?? "null");
  // any → T: no relationship, no evidence — and no cast required.
}
```

Hold the rule up to the act behind you, and the act turns out to have been about relationships the whole time:

- `any` lets values pass between otherwise incompatible types, bypassing checks on those relationships (Chapter 1).
- Assertions fake relationships the compiler can't verify (Chapter 2).
- `interface` and `type` describe the shapes that relationships hold between (Chapter 3).
- Unions restrict a value to a finite set of alternatives (Chapter 4).
- Narrowing proves which alternative you're holding — *this* discriminant means *that* payload (Chapter 5).
- Generics **carry** relationships through code — stated once, enforced at every call site.

**Daniel Compiler**: "Start with `pluck`: the input array and the selected key determine the output. Then compare `loadState`: the return type comes entirely from the caller's request. Look for that difference when you review the brackets."

## Additional Takes

**Linoy Nightly**: "Two inference controls, for when the default is *almost* right. `const` type parameters — `function routes<const T extends readonly string[]>(paths: T): T` — tell inference to keep your literals: `routes(["/home", "/about"])` comes back `readonly ["/home", "/about"]` instead of `string[]`. And `NoInfer<T>` marks a position as *checked against* `T` but not *evidence for* it — `function setDefault<T>(values: T[], fallback: NoInfer<T>)` stops a stray fallback argument from joining the inference and smuggling itself into everybody's `T`. Shipped in 5.0 and 5.4. The cost is the same for both: the next reader has to know what they mean, and literal types are occasionally more specific than you wanted. We can look at both once these examples are familiar."

**Sahar Firstclass**: "If this function only serves invoices, what would making it generic help you change?"

**Prof. Eli Typeworth** waits for the chairs to stop scraping.

"What comes next is type-level *programming* — types that branch, types that walk an object's keys, types computed from other types. We have introduced the variable. Next we ask what we can compute with it."
