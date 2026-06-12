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

**Oded Shipley** goes first, because the velocity position never waits:

"Most application code never needs to *write* a generic. Consume them, sure — arrays, promises, `ParseResult<T>` — somebody else wrote those brackets. But the day-to-day function takes an `Invoice` and returns a `PaymentPlan`. Concrete in, concrete out. Every time a homegrown `<T>` shows up in a pull request, I start a timer to the moment it gets deleted as speculative generality. *We can fix it in the next sprint* — except with generics, the fix is usually `git rm`."

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

**Dima Bridge** has been listening to both with the expression of a man watching two people describe different halves of the same animal.

*"Both have a point here"* — "and I think it's the same point. Oded, when you write `Invoice → PaymentPlan`, the input and the output are related — concretely, by name. Noam, when you write `T[] → T | null`, they're related too — abstractly, by variable. The function that deserves a generic isn't the one that 'accepts many types.' It's the one where **the type parameter ties two positions of the signature together.** If that tie isn't there, Oded's timer is right."

He shrugs. "I don't think either of you disagrees. I think you've been arguing about which half to say first."

---

### "The single-use type parameter"

**Daniel Compiler** projects a function onto the screen.

"Pulled from a real codebase this morning. Names changed to protect the author."

```typescript
function logPayload<T>(payload: T): string {
  console.log(payload);
  return JSON.stringify(payload);
}
```

"Question for the room: what work does `T` do here?"

Silence, then someone starts: "It lets you pass any—"

"Nothing. It does nothing. `T` appears in exactly one position, so it relates nothing to nothing. Watch — I replace it with `unknown`, and every call site that left inference to do the work behaves identically. The only thing anyone loses is the ability to write `logPayload<Something>(p)` — which was only ever decoration here:"

```typescript
function logPayload(payload: unknown): string {
  console.log(payload);
  return JSON.stringify(payload);
}
```

*"The compiler disagrees"* — with the brackets, not the function. "A `<T>` that appears once is a costume. It makes the signature look parametric while promising nothing the plain version doesn't already deliver. Apply Dima's tie test: one end of the rope is in your hand. Where's the other end?"

**Oded** leans back with the unhurried satisfaction of a man who intends to be quoted in the meeting minutes: "So the type-safety crowd has been *decorating*. Delete the costume generics — finally a refactor I'll staff."

**Daniel**: "Run the audit, by all means — it's a grep and an afternoon. But there's one honest complication, and you'll hit it in the first ten minutes."

He swaps the slide.

```typescript
// T appears only in the return — yet this one is everywhere, and it works
const emailField = document.querySelector<HTMLInputElement>(".email");
// emailField: HTMLInputElement | null
```

"`querySelector`. The type parameter — the DOM lib calls it `E` — appears only in the return type. By the rule taking shape in this room, that should be a costume. It isn't, quite. The relationship exists — but it runs between the *type argument you supplied* and the return value, not between two positions of the signature. Which means the compiler isn't deriving the type from evidence. It's taking your word for it. `querySelector<HTMLInputElement>(".email")` is `as HTMLInputElement | null` wearing better clothes — a typed assertion with good ergonomics."

"You can pull a lever from outside the machine. The constraint still holds — try `querySelector<number>` and the compiler refuses; you must name *some* kind of `Element`. But nothing inside the machine checks that the element you actually find at runtime is the one you named. A caller-supplied, return-only `T` deserves exactly the suspicion you already reserve for `as`."

He pauses.

"Hold that thought. There's a worse version of this lever, and we'll pull it before the end."

---

### "Constraints — the dial between reach and grip"

**Noam** takes the board.

"An unconstrained `T` is maximally reachable and minimally usable. Inside the body, `T` could be anything, so the compiler lets you do almost nothing with it — it's `unknown` in a hat, when you're *reading* it. Producing one is the opposite problem: nothing satisfies a `T` except a `T` you were given. That's all fine when the body never touches the values. The moment it needs to, you need a constraint:"

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

"The constrained generic accepts everything the flat version accepts. It just refuses to *forget* what it was given. `sortByNameFlat` erases types as a side effect."

**Oded**, squinting at the board: "Or — radical idea — `function sortEmployees(items: Employee[]): Employee[]`. Concrete. Readable. Greppable."

**Noam**: "Until the design tool needs `sortByName` for `Designer[]`, and billing needs it for `Vendor[]`, and now there are three copies drifting apart. And notice what the constraint actually is, Oded — `T extends { name: string }` *names exactly what the function needs* and nothing more. Too tight a constraint and nobody else can call it. Too loose and the body can't do its job. It's a dial. `{ name: string }` is that dial set correctly for this function."

**Oded**: "If the second caller ever shows up. Write it concrete, generalize on the second caller — that part of my position I'm keeping."

**Daniel**, footnote voice: "One flag before the section closes. You've now seen `extends` mean 'must have at least this shape.' You will meet the same keyword again in conditional types — `T extends U ? X : Y` — where it asks a question instead of stating a requirement. Same spelling, different move. Don't let it fool you when you get there."

---

### "Inference, annotation, and the two-parameter spotlight"

**Linoy Nightly** claims the next section before anyone else can inhale.

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

"Two pieces of syntax, in passing — you've seen them before, mashed together in the enum-derivation trick; here they are pulled apart. `keyof T` is the union of an object's keys, and `T[K]` is the type sitting at that key — indexing, one level up. Now count the relationships. `K` is chained to `T`: you may only ask for keys that exist. The return `T[K]` is tied to both: ask for `fontSize`, get `number` — not a grab-bag union of everything the object holds. Two type parameters, three positions tied together, zero type arguments written. The caller typed a property name and got compiler-checked physics. This has worked since TypeScript 2.1. Nobody teaches it, and everybody should steal it."

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

"And at a module boundary I go further: I annotate even when inference would get it right. A public signature is read by a hundred people who will never open the implementation. Inference is for the compiler. Annotations are for the team."

**Linoy**: "For internal code that's ceremony — the hover tells you everything, and handwritten type arguments go stale and become their own bug class. But the boundary case... granted. A published API shouldn't make callers reverse-engineer what inference will do. Evidence-poor call sites and public surfaces: annotate. Everywhere else, let the compiler drive."

**Eden**: "And I'll grant the inverse. Inside a module, mandatory type arguments are archaeology by the third refactor. Noam found a dial for constraints; this is its twin. Annotate exactly where the reader's evidence is worse than the compiler's."

---

### "Generics that lie"

**Daniel** returns to the front. "I promised a worse lever."

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

"`querySelector` was a lever pulled from outside. This one is pulled from inside — the body *manufactures* its `T`. The signature promises 'I will produce a `T`.' The body has never met `T`. It can't check a property. It can't validate a field. It launders `JSON.parse` through a cast and hands the caller a compiler-certified guess. Misspell one key and the type system will swear to the wrong fact right up until the stack trace corrects it."

**Idan Greenfield** leans forward.

"It's worse than you're saying, Daniel. Delete the cast."

```typescript
function parseConfig<T>(input: string): T {
  return JSON.parse(input); // still compiles — no `as` required
}
```

**Daniel** looks at it, and nods slowly. "Because `JSON.parse` returns `any`. And `any` is assignable to anything you can ask for — including a `T` the function knows nothing about, the one type nothing else could satisfy. The cast was never holding the lie up. The cast was the only *honest* line in the function — a visible flag reading 'unverified claim here.' Remove it and the function reads clean."

**Idan**: "Which is the oldest trick in this room. `any` doesn't argue with the type system — it erases the relationship and lets you draw whatever you want in the blank space. Here it erases the one relationship the generic existed to carry. The lie isn't even spoken out loud anymore. It's wearing the generic's own clothes."

She walks to the board.

"*Prove it by producing it.* A `T` in the return position is a promise to produce one. So read the body and ask the only question that matters: **where does the `T` come from?** In `lastItem`, it comes out of the array you handed me — produced. In `get`, it comes off the object, at a key you proved exists — produced. In `parseConfig`, it comes from the caller's optimism. Nothing in that body produces a `T`. A generic whose body can't produce its `T` is the same unchecked promise as a predicate that returns `true` without looking."

"The honest signatures already exist. Pick the one that tells the truth about what the body does:"

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

"And before anyone runs today's audit against `ParseResult<T>` itself — one position, label, guilty — the rule we've been building is about brackets on *functions*, where `T` has to be earned from the arguments. Brackets on a *type* are a different instrument: a named slot in a shape. `Array<T>`, `Promise<T>`, `ParseResult<T>` — being a label is their entire job. The slot gets filled concretely, by a parser that produces the value: `ParseResult<RetryConfig>`. Generics were never the suspect here. The suspect is a promise with no production behind it."

## The Turn

**Liron Closure** hasn't said a word all day. He stands, takes the marker from Noam, and the room reorganizes itself the way it always does.

"Let me tell you about lenses."

"A lens holds no picture. Grind the glass, set the curvature, hold it up — the picture is whatever you point it at. That isn't a defect. That is the entire idea of a lens: a shape that admits scenes it has never met, and bends every one of them the same way."

"There are two ways to ruin one. Flatten the curvature until it's a windowpane — now everything passes through, and nothing is bent. It admits everything and relates nothing. Daniel showed you a windowpane this morning; it was called `logPayload<T>`, and it was wearing a lens's brackets."

"Or go the other way — paint the scene onto the glass. Now you have a photograph. And listen: a photograph is not a broken lens. It is a different thing, and most days a photograph is exactly what you want. Oded has been right about that all afternoon, and I'd like it noted while he's still pretending not to be pleased. The mistake is not concreteness. The mistake is grinding glass when you needed a photo — or selling a photo with a lens's name on it."

"Your `<T>` is curvature. `firstItem` bends every array the same way: first element out, type preserved. `sortByName` admits anything with a name and returns it unforgotten — curvature with a threshold, Noam's dial. And the question for every angle bracket you ever write is the lens question: *what does this shape admit, and what does it do — the same way, every time — to everything it admits?* If the answer to the second half is 'nothing,' you've made a windowpane."

He writes one line on the board, and boxes it.

> **A generic is a relationship, not a label. If your `<T>` doesn't tie two positions in the signature together, you've named something — you haven't generalized it.**

*"Complexity is a choice, not a necessity."* He sets the marker down. "Angle brackets are a complexity budget. Spend them where a relationship pays the budget back. Everywhere else — take the photograph."

**Dima**, quietly, to no one in particular: "That's the sentence from this morning. It had to grow up first."

## The Verdict

> Write a generic when the type parameter ties two positions of the signature together. Otherwise write the concrete type, or `unknown` — or admit you're writing an assertion, and justify it like one.

**The Accepted Standard — a decision framework:**

| Situation | Recommended | Why |
|-----------|-------------|-----|
| The output type depends on the input type | `<T>` tying both positions | The relationship is the whole point |
| `<T>` appears once, in a parameter position | `unknown` — or the concrete type | A label, not a relationship; indistinguishable to any caller who relied on inference |
| The body needs a property of `T` | `<T extends { ...minimal shape }>` | Unlocks the body; the `T → T` shape still preserves the caller's type |
| Two arguments must move together | Chain the parameters: `<T, K extends keyof T>` | Relationships can have more than two ends |
| Caller-supplied, return-only `T` (`querySelector` style) | Treat it as a typed assertion — justify it like an `as` | The compiler is taking your word, not checking evidence |
| The body can't produce its `T` | Return `unknown`, or a concrete `ParseResult<YourType>` from a real parser | A promise with no production is a lie in brackets |
| Explicit type arguments vs inference | Infer internally; annotate public APIs and evidence-poor call sites | Inference is only as good as the call-site evidence |

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

- `any` erases relationships — every arrow in, every arrow out, gone (Chapter 1).
- Assertions fake relationships the compiler can't verify (Chapter 2).
- `interface` and `type` describe the shapes that relationships hold between (Chapter 3).
- Unions restrict a value to a finite set of alternatives (Chapter 4).
- Narrowing proves which alternative you're holding — *this* discriminant means *that* payload (Chapter 5).
- Generics **carry** relationships through code — stated once, enforced at every call site.

**Daniel Compiler** hands the room a mechanical test for code review:

"Draw the arrow from where `T` enters to where `T` exits. In `pluck` you can't stop drawing them — items to return, key to items, key to return. In `loadState`, start drawing and you'll find there's no entry point to start from. If you can't draw the arrow, the angle brackets are decoration."

## Additional Takes

**Linoy Nightly**: "Two dials from recent releases, for when inference is *almost* right. `const` type parameters — `function routes<const T extends readonly string[]>(paths: T): T` — tell inference to keep your literals: `routes(["/home", "/about"])` comes back `readonly ["/home", "/about"]` instead of `string[]`. And `NoInfer<T>` marks a position as *checked against* `T` but not *evidence for* it — `function setDefault<T>(values: T[], fallback: NoInfer<T>)` stops a stray fallback argument from joining the inference and smuggling itself into everybody's `T`. Shipped in 5.0 and 5.4. The cost is the same for both: the next reader has to know what they mean, and literal types are occasionally more specific than you wanted. *There's an RFC for that* — two, and they both landed."

**Sahar Firstclass** stands last.

"You've spent the day learning to write a function with a hole in it. Good. One question before you go home and cut holes in everything. What shape is the hole? `identity` admits the whole world — and look how little it can do with it. `sortByName` admits less and does more. Every constraint trades reach for grip; you've been calling it a dial all afternoon without asking who sets it. So take the generics you wrote this month and ask each one: what does the hole admit — and what fell through it by accident? *Simple made better.* If the hole admits exactly one shape, it isn't a hole. Close it, write the type, and keep the function."

**Prof. Eli Typeworth** waits for the chairs to stop scraping.

"A closing observation. `let x = 42` was your first variable, once. It didn't feel like programming yet — a declaration, an assignment, a retrieval. Programming began when variables met branching, iteration, composition. What you've learned today is type-level *definition*: introduce a type variable, bind it, carry it through. What comes next is type-level *programming* — types that branch, types that walk an object's keys, types computed from other types. The moves will feel familiar, because you now know all of them. *Let us return to first principles* — you've just finished collecting the set."
