# Chapter 5: The Guard at the Gate

## The Principle

The previous four chapters were about how TypeScript *describes* values: what the type can be, how to compose shapes, where the escape hatches live. This chapter is about a different verb. What does it mean, inside a function, to *prove* that a value has the type the compiler thinks it does?

**Daniel Compiler** is the right person to set this one up, because narrowing isn't really a TypeScript feature. It's a compiler behavior with a name.

He opens his laptop.

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

*"The compiler disagrees"* — and now Daniel demonstrates with a case that catches developers off guard:

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

"Narrowing is not the debate. You always narrow — every `if`, every `switch`, every truthy check is narrowing whether you meant it or not. The debate is *how you prove it*. And every proof costs something when it fails."

**Chen Override** has been waiting. *"But have you considered..."* — the question that frames the chapter:

"...that a proof is only as honest as the person writing it?"

Daniel nods. That's exactly the door this chapter walks through.

## The Debate

### "The `typeof` family — what lies and what doesn't"

**Linoy Nightly** takes the floor first because somebody has to lay out the primitives and Linoy is incapable of resisting a list.

"Built-in narrowing operators. Four of them, plus a fifth that thinks it's an operator. `typeof` for primitives. `instanceof` for class instances. `Array.isArray` for arrays. The `in` operator for property checks. And the truthy/equality checks — `=== null`, `!= null`, `if (x)` — that I'll call honorable mentions. *There's an RFC for that* — actually no, this set has been stable since TypeScript 1.x."

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

"Linoy. Walk me through every footgun in those five lines."

Linoy sighs, but she enjoys this.

"`typeof null === "object"`. So if I write `if (typeof value === "object")` thinking I excluded null, I didn't. `typeof NaN === "number"`. So if I write `if (typeof value === "number")` thinking I have a usable number, I might have NaN. `instanceof` checks the prototype chain — if your `Date` came from another iframe or a Node `vm` context, `value instanceof Date` returns false because the prototype is different. `Array.isArray` is the one that's actually safe across realms — it doesn't check prototypes, it checks an internal slot. And `typeof x === "function"` matches arrow functions, regular functions, async functions, class constructors, and generators. They are not interchangeable."

**Chen**: "And `in`?"

**Linoy** pauses, because Chen's setup is too good not to deliver:

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

"If the object came from `JSON.parse`, fine — JSON parse returns plain objects with no inherited methods worth worrying about. If the object came from a class instance, every method on the class shows up as `in` true. You wrote a guard for `error`. You also accidentally accepted any object with a method called `error`."

**Chen** isn't done. "One more landmine: `\"x\" in null` throws `TypeError`. The throw happens when the right-hand side is null or undefined — the object being searched, not the property name. Narrow the object to non-null before `in` or you've traded a type bug for a runtime crash."

**Linoy**: "Add it to the list. And the cheapest narrowing of all, `if (x)`, is the one that lies most often — it excludes `0`, `''`, `false`, `0n`, and `NaN` along with `null` and `undefined`. Half the time you wanted only the latter."

**Chen**, satisfied: "Nothing to add."

**Linoy** holds her ground: "All of these are known quantities. The hovers are correct. The lies are at runtime. If you know the language, you write around them."

**Daniel**, quietly: "If you don't, the compiler still believes you. That's the gap."

---

### "Type predicates — safe if you don't lie"

**Noam Kiperman** has been waiting for this one.

"User-defined type guards. The construct that lets you write a function that *is* the narrowing logic, in one place, named, testable."

```typescript
type User = { id: string; email: string; displayName: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof (value as User).id === "string" &&
    "email" in value && typeof (value as User).email === "string" &&
    "displayName" in value && typeof (value as User).displayName === "string"
  );
}

function greet(input: unknown) {
  if (isUser(input)) {
    return `Hello, ${input.displayName}`; // input narrowed to User
  }
  throw new Error("not a user");
}
```

"This is structured. It's reusable — every place I need to check 'is this a User?' calls the same function. It's testable — I can write a unit test for `isUser` with a hundred edge cases. The contract is in one place. *Over my dead type definition* — this is what 'safe narrowing' looks like in a real codebase."

**Dafna Functor** has been quiet. She's waiting for this exact moment.

"Noam. Show me the signature again."

**Noam**: "`function isUser(value: unknown): value is User`."

**Dafna**: "And what does TypeScript check, in that signature, to make sure the predicate is honest?"

**Noam** — knowing where this is going — answers anyway: "Nothing."

```typescript
// Looks safe. Is a lie.
function isUser(value: unknown): value is User {
  return true;
}

// The compiler will now believe ANY value is a User, forever:
const x: unknown = 42;
if (isUser(x)) {
  x.email; // TypeScript: "string". Runtime: TypeError, x is 42.
}
```

**Dafna**: "A type predicate is an assertion you make to the compiler about the relationship between a runtime check and a type. The compiler does not verify the assertion. It cannot. It has no way to read the body of your predicate and confirm it actually narrows the way you said. You write `value is User` and TypeScript writes it down and stops asking questions."

"Every type predicate in your codebase is an unchecked promise. Some of them are good. Some of them have bugs. The compiler can't tell you which is which."

**Noam** — and this is the move — concedes the footgun without abandoning the construct:

"Yes. The contract is unchecked. So write the predicate carefully, put it in one place, and *write the test*. An unchecked promise in a tested function is still better than fifty inline checks scattered across the codebase, none of them tested, all of them inconsistent. The structure is the win. The structure has to be earned by discipline."

**Idan Greenfield**, half to herself: "You're all arguing about how to prove it. Nobody's asked when the value got the type in the first place."

A pause. Noam looks over.

**Daniel** adds a footnote. *"The compiler disagrees"* — with something nobody said but several people probably believe:

"TypeScript narrows the value, not the type parameter. Inside `function f<T>(x: T)` after `typeof x === 'string'`, `x` is `T & string` — string methods compile. But `T` itself is not refined. So if you need the narrowed type to flow back out — say, returning it — the predicate must *return* the narrowed type, not refine the parameter. The compiler won't second-guess the caller's choice of `T`. Comes up the moment you write a generic helper with any runtime check."

**Dafna**: "Or by giving up on the structure entirely. Which is the next subsection."

---

### "Assertion functions — throw or return?"

**Guy Singleton** stretches and sits up. This is his.

"Assertion functions. `asserts x is T`. Imperative narrowing — the function throws if the value is wrong, and the compiler treats the *successful return* as proof of the type."

```typescript
function assertIsUser(value: unknown): asserts value is User {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    !("email" in value) ||
    !("displayName" in value)
  ) {
    throw new TypeError("Expected User");
  }
  // Note: checks property presence but not value types. Same family of
  // unchecked promise as `isUser` — the compiler trusts this body whole.
}

function greetOrFail(input: unknown) {
  assertIsUser(input);
  // input is now User — no if-statement needed
  return `Hello, ${input.displayName}`;
}
```

"This is how I write invariants. If `input` isn't a User, the program can't continue. The throw says so. The caller doesn't need a wrapping `if` — the assertion shapes the type going forward, and the failure case is a thrown exception, not a control flow branch I have to handle."

**Dafna** refuses, which is in character.

"Throws break composition. My function was `(A) => B`. Now it's `(A) => B | <throws>`, and the throw is invisible in the type. I can't `map` it. I can't `pipe` it. I can't combine `assertIsUser` with `assertIsAddress` and get a single result. I have to wrap each call in try/catch, which is exactly the code I was trying to avoid."

```typescript
// What I want: pipe(input, assertUser, formatGreeting)
// What I get:
let greeting: string;
try {
  assertIsUser(input);
  greeting = formatGreeting(input);
} catch (e) {
  greeting = "fallback";
}
```

"The assertion function is a control flow grenade dressed as a type tool. The type narrows, sure. The function also exits the entire call stack on failure. Those are very different operations and they shouldn't share a syntax that hides one inside the other."

**Noam** — and this is unexpected — takes the middle.

"There's a place for assertion functions. `assertNever` for exhaustiveness checks. Real invariants — 'this should be impossible if my code is correct.' Programmer errors. Programmer errors *should* throw, because the program is in a state the developer didn't anticipate, and continuing is worse than stopping. Use `asserts` there. It's the right tool."

"What it isn't right for is *validation*. If `input` is from an API, the failure case is not a programmer error. It's expected. You're not asserting an invariant — you're checking external data, and external data is wrong all the time. Throwing in that case is using exceptions as control flow. That's where Dafna is right."

**Guy** doesn't concede. He narrows:

"Fine. Assertion functions for invariants — yes. For boundary validation — granted, throwing isn't right. But the line is invariants vs validation, not assertions vs predicates. The construct is fine; the use case I gave was wrong."

---

### "Parse, don't validate"

**Idan Greenfield** had asked something earlier. Nobody picked it up. When Guy finishes, she leans forward to ask it differently.

"Guy. Where did the `unknown` come from?"

Guy looks at her. "From the API."

"And before the API?"

"From whatever the client posted. Or a database column. I don't know — it's `unknown` for a reason."

"Right. So the value never *had* a type. There was no `User` floating in your function waiting to be confirmed. There was a string of bytes, and at some point you decided to call it a `User`. The boolean doesn't *check* a type. The assertion function doesn't *check* a type. They both *claim* one. The compiler believes them. That's the part I want to talk about."

She sits back.

"You're all arguing about the shape of the *return*. I'm arguing about the shape of the *value* before any of you got there. The type doesn't exist yet. You're not narrowing — you're producing."

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

"A boolean predicate throws information away. You learn the value passed; you've lost the *reason* it passed and the structured value that came out the other side. A throw throws information away too — you've lost the reason in a stack trace, which is fine in development and useless in production logs. A parser carries both. The narrowed value on success. The structured failure on failure. You can serialize it, log it, return it as an HTTP response, branch on it. The result is data."

**Guy** pushes back: "You've just rewritten `assertIsUser` with five times the boilerplate. Ten lines instead of three."

**Idan**: "Your way is shorter until it fails. When it fails, the operator on call gets a stack trace with `Expected User` and no idea which field. I get `{ ok: false, reason: "id missing or not a string" }` and the log line writes itself. The ten lines paid for themselves the first time someone is paged."

**Guy** doesn't fold. "Or you put the parsing in the constructor. `new User(input)` either succeeds or throws. That's parse-don't-validate with class syntax — you're reinventing checked exceptions in a result type and pretending you invented something."

**Idan**: "A constructor that throws is an assertion function with extra ceremony. Same trade Dafna rejected — the throw is still an invisible exit in the type, and when it fires at 4 AM you get the same stack trace with no field name. Unless someone wrote a careful message. Whose discipline is that — mine, or every junior who copies the pattern next month?"

**Noam** is nodding, slowly. He's done this before, on his own, without having a name for it.

"This is what I've been reaching for without articulating. Parse-or-fail composes. If I have `parseUser` and `parseAddress`, I can build `parseUserWithAddress` that returns a single `ParseResult` — no try/catch, no nesting, no exception bubbling. I cannot do that with assertion functions. Every `assertX` call is a potential exit point that I have to handle separately."

**Guy** thinks. He doesn't fold; he narrows: "For data crossing the boundary — yes. I'll grant that. For internal invariants where the class controls its own input — the constructor stays."

**Idan**: "Keep them. We're not arguing about invariants. We're arguing about input."

---

### "Discriminated unions eliminate most narrowing"

**Dafna Functor** picks up the thread.

"Once data has a discriminant, narrowing is free. You don't write a guard. You don't call a predicate. You don't invoke a parser. You `switch`, and the compiler does the rest."

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

**Daniel**, briefly: "The annotated return type `: string` is what enforces it. Without the annotation, TS would infer `string | undefined` and the missing case would slide through. Belt-and-suspenders: an explicit `default: assertNever(state)` in the verdict."

**Idan** picks up the thread, but only her end of it:

"Discriminants are what a parser hands you. Inside, Dafna's right — you `switch` and you're done. I have no opinions about the inside; that's her territory. But outside, the data doesn't *have* a `kind` field yet. Someone has to put it there. That's at the boundary. That's the parser's job, and it's the only one I'm interested in."

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

**Guy** holds a real line: "But the incoming data doesn't have a discriminant. Someone has to put it there."

**Dafna**: "Yes. That's the parsing step. That's the work. After that, you're done narrowing for the lifetime of the value."

---

### "Hand-written vs zod / valibot / arktype at the boundary"

**Oded Shipley** picks up the practical question:

"So `parseUser` is fine for one type. What about forty? I'm not writing forty parsers and maintaining forty test suites. *We can fix it in the next sprint* — or we can use a schema library and ship today."

**Gil Benchmark** opens his laptop.

*"What does the data say?"*

"I've watched hand-written guards consistently miss edge cases at meaningfully higher rates than schema validators. The misses cluster in a small set: null versus undefined, missing-property versus property-set-to-undefined, arrays of the wrong shape, optional fields written as required. Boring categories. The validators get them right because they're built around exactly those distinctions. The hand-written code has them right on a Tuesday and wrong on a Friday."

**Linoy** sketches the field in directional terms — version-specific numbers age fast:

"Three dominate. `zod` is the lingua franca, the one most ecosystem code already speaks. `valibot` is function-first and aggressively tree-shakeable. `arktype` reads closest to TypeScript syntax itself. All three iterate hard on bundle and runtime cost — if your library decision is older than the last major release, the assumptions behind it have probably moved."

**Gil Benchmark**, with caveats: "Order of magnitude — these shift every release. `zod` lands in the tens of KB gzipped at full surface, lower with newer tree-shakeable builds. `valibot` single-digit KB when tree-shaken. `arktype` near `valibot` for runtime cost. The comparison isn't library vs library. It's any-of-them versus the forty hand-written parsers and test suites Oded didn't want to write."

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

**Chen Override**, as usual, finds the load-bearing question:

*"But have you considered what happens when the schema drifts from the type?"*

"The pattern people reach for: write the type, then write a schema that matches the type. Now you have the same shape declared twice. They will disagree. It might take a week, it might take a quarter, but at some point a developer adds a field to the type and forgets the schema. The compiler is happy. The runtime is silently rejecting valid input."

**Idan**: "The fix is the inversion. `type User = z.infer<typeof UserSchema>`. Derive the type from the schema, not the other way. The schema is the source of truth — it has to be, because it's the only one that runs at runtime. The TypeScript type follows from it."

She closes the section:

"The validator libraries are parsers. They produce a value of type T, or they tell you why they couldn't. *Prove it by producing it* — that has been the right answer the whole time. We just sometimes write the parser ourselves, and sometimes import it."

## The Turn

The whiteboard has all four shapes on it now. Boolean predicates. Assertion functions. Parsers. Discriminants. Each with its trade-off, each with its place.

**Gilad Stacktrace** has been quiet through the whole thing. He's been quiet on purpose. He stands now, walks to the whiteboard, and circles one column header.

*"Show me the stack trace."*

"Every narrowing we've discussed is a proof. The question I want you to answer is what each proof leaves behind when it fails. Not which is cleanest. Not which is most functional. Not which is shortest. Which one *survives* its own failure."

He walks the four:

- **Boolean predicate returns false.** You know it failed. You don't know why. The caller has to re-examine the input themselves to figure out what was wrong. The log line says `validation failed`. Useful zero of the times it was logged.
- **Assertion function throws.** You get a message if the author wrote one. A stack trace pointing to the throw site. You know roughly where. You probably don't know which field. The log line is bigger than the predicate's, but it's still telling you what didn't happen, not what did.
- **Parser returns structured failure.** You know where, you know why, and you know what the input *was*. `{ ok: false, reason: "id missing or not a string", input: { ... } }`. The log line writes itself. The fix writes itself.
- **Discriminated switch hits a case the type didn't allow.** This shouldn't compile. If it did, your union changed and your switch didn't. The exhaustiveness check throws a `never`-typed error. Programmer error, caught at compile time if you wrote it right.

He turns to face the room.

"That's the real axis. Not 'which narrowing is cleanest.' Which one gives the operator the most information at the worst possible time. The book leans toward parsers — not because parsers are elegant, although they are. Because parsers *leave evidence*. The boolean leaves nothing. The throw leaves a stack trace pointing at a check, not at a failure. The parser leaves you the shape that broke, in a form you can serialize, log, and grep tomorrow morning. That's the proof that survives 3 AM."

He looks at Idan. She's still newish to this room — the others know each other, she's been here once.

"What you said earlier. The code that runs on our servers is not the interesting code. The code that runs in the logs when something is broken — that's the interesting code. Boolean predicates produce no logs. Assertion functions produce short logs. Parsers produce the logs that let you ship a fix before the retro."

**Idan**, picking up the thread without taking the stage:

"The parser had to build the value. That's what survives the failure."

A beat.

"That's the argument."

Noam writes something down. Guy is quiet.

## The Verdict

> Parse at the boundary. Discriminate inside. Assertion functions for real invariants only. Schema libraries when the boundary is big.

| Situation | Recommended | Why |
|-----------|-------------|-----|
| Data from outside (API, localStorage, URL, JSON, user input) | Parse into a concrete type — schema library or hand-written `parseX` | The data didn't have a type. You produce one. Failure carries information. |
| Inside a discriminated union | `switch` on the discriminant | Zero-cost narrowing. Exhaustive. Free. |
| Class instance check | `instanceof` (single-realm code only) | Built-in, reliable when prototype chain is intact |
| Primitive value | `typeof` (know the footguns: `null`, `NaN`, `function`) | Built-in, correct for primitives |
| True invariant ("this can't happen if my code is correct") | Assertion function — `assertNever`, `assertDefined`, etc. | Programmer errors should throw. Honest about being a programmer error. |
| Internal object shape from a trusted source | Type predicate (user-defined guard) | Structured and testable, but write the test — the predicate body is unchecked |
| Inside a pipeline / functional composition | Parser returning `Result<T, E>` or `T \| null` | Composes. Throws don't. |
| Using `in` to narrow | Only if you control the object shape | `in` checks the prototype chain — `"toString" in {}` is `true` |
| Schema and TS type co-evolve | Derive the type from the schema (`z.infer<typeof Schema>`) | One source of truth; they can't drift |

**In practice — the two anchors:**

```typescript
// typeof for primitives — the language already gives you the proof.
function formatPrimitive(input: string | number): string {
  return typeof input === "string" ? input.toUpperCase() : input.toFixed(2);
}
```

```typescript
// parser for boundary data — produce the type, carry the failure.
type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string; input: unknown };

type Profile = { id: string; email: string };

function parseProfile(input: unknown): Parsed<Profile> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "not an object", input };
  }
  if (!("id" in input) || typeof input.id !== "string") {
    return { ok: false, reason: "id missing or not a string", input };
  }
  if (!("email" in input) || typeof input.email !== "string") {
    return { ok: false, reason: "email missing or not a string", input };
  }
  return { ok: true, value: { id: input.id, email: input.email } };
}
```

Type predicates and assertion functions appeared at length in the debate above, with their caveats in context — the table is the lookup for which shape goes where.

The rule in one sentence: at the boundary, parse; inside, discriminate; for invariants, assert; for primitives, use `typeof`. If you reach for a predicate, write the test — the compiler isn't watching the body. Act III's chapter on runtime validation is where the schema-library question gets its full hearing; for now, know that whichever shape you choose, the proof is only as honest as its author.

## Additional Takes

**Idan Greenfield**: *"Prove it by producing it."* — "A predicate that returns `true` without building the value has told you nothing. It guessed on your behalf. The next person to read your code will trust the guess. So will the compiler."

**Noam Kiperman**: "A boolean predicate is an implicit promise. An assertion function is an imperative one. A parser is an explicit one. The more explicit the promise, the less likely you are to break it by accident. *Over my dead type definition.*"

**Chen Override**: *"But have you considered..."* — "...that `instanceof` has been quietly failing across iframes, web workers, and VM contexts for a decade? If your code runs in anything other than a single main thread, your `instanceof` is a time bomb. `Array.isArray` was specifically designed to avoid this. It's the only one of the built-ins that did."

**Eden Legacy**: *"I've seen this fail at scale."* — "A codebase with three hundred type predicates. Not one of them tested. Every one of them trusted by the compiler. I spent half a quarter writing tests *for the guards*. It felt like auditing a notary who had never been audited. Half the predicates were wrong. The compiler had been believing them for years."
