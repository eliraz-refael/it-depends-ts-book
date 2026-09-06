# Chapter 7: The Fork in the Type

## The Principle

Act I ended with a promise. "What comes next is type-level *programming*," Eli said — "types that branch, types that walk an object's keys, types computed from other types." This chapter is the first installment: types that branch.

**Prof. Eli Typeworth** picks up his own thread.

*"Let us return to first principles."*

"Daniel warned you that you would meet `extends` again, and that it would mean something different. This is that meeting."

```typescript
// extends as a gate — a requirement:
declare function sortByName<T extends { name: string }>(items: T[]): T[];

// extends as a question — a branch:
type Reply<T> = T extends string ? "it was a string" : "it was not";
```

"In a constraint, `extends` states a requirement: no `T` may enter without a `name`. In a conditional type, `extends` asks a question — *is the type on the left assignable to the type on the right?* The compiler answers, and the answer selects a branch. That is the whole of the syntax. If a value of type `T` would be accepted where a `string` is required, the result is the first branch. Otherwise it is the second."

"The branches describe types. They are evaluated during type checking and erased before the program runs."

```typescript
type Yes = Reply<string>; // "it was a string"
type No = Reply<number>;  // "it was not"
```

"A generic can now express different relationships for different inputs. Let us see where that helps."

## The Debate

### "Types can do ternaries?"

**Linoy Nightly** opens a pull request. Oded has already left a comment on the return type.

"Content pipeline. Front matter — the YAML block at the top of each Markdown file. Our format accepts either one tag or a list:"

```typescript
type FrontMatter = {
  title: string;
  tags: string | string[]; // YAML: one tag, or a list of them. Both legal.
};
```

"So I need slugs. Titles in, slugs out. Right now that's two functions."

```typescript
function slugifyOne(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}

function slugifyAll(titles: string[]): string[] {
  return titles.map(slugifyOne);
}
```

"Two names for one idea. I want one name."

```typescript
declare function slugify<T extends string | string[]>(
  input: T,
): T extends string[] ? string[] : string;
```

**Oded Shipley** looks at that for a while.

"Okay. What is that."

"A conditional type."

"No, I mean —" he points at the screen with a pen, at the return position — "that's a ternary. In the type. Where the return type goes."

"Yes."

"Types can do ternaries."

"Since 2.8."

Oded sits back. "Nobody told me."

**Linoy**: "Call it and hover."

```typescript
const one = slugify("Hello World");   // string
const many = slugify(["One", "Two"]); // string[]
```

"One function. Each caller gets back the type that matches what they put in. The signature asks a question about `T` — *is it an array?* — and whichever way the answer comes out is the return type."

**Oded** reads it again. Then: "Or two functions. Which I have. Which work. Which a junior can read at four o'clock on a Friday without opening the handbook."

"You have two names for one idea."

"I have two names I can grep. What am I getting for learning to read yours?"

---

### "Show me the caller"

**Eden Legacy** has had his arms folded for the whole exchange.

"Before you two invent something. There's a tool as old as the language for this exact shape."

```typescript
function slugify(title: string): string;
function slugify(titles: string[]): string[];
function slugify(input: string | string[]): string | string[] {
  return Array.isArray(input)
    ? input.map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    : input.trim().toLowerCase().replace(/\s+/g, "-");
}
```

"Overloads. Two signatures on top, one implementation underneath. Title in, slug out. List in, list out. No `T`. No question mark. The hover tells a human being what to pass."

**Oded**, to Linoy: "See, *that* I can read."

**Linoy**: "Now call it with the tags."

**Eden**: "With the—"

"`post.tags`. The field. The reason the function exists."

```typescript
declare const post: FrontMatter;

const slugs = slugify(post.tags);
// error TS2769: No overload matches this call.
//   Overload 1 of 2, '(title: string): string', gave the following error.
//     Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
//       Type 'string[]' is not assignable to type 'string'.
//   Overload 2 of 2, '(titles: string[]): string[]', gave the following error.
//     Argument of type 'string | string[]' is not assignable to parameter of type 'string[]'.
//       Type 'string' is not assignable to type 'string[]'.
```

Nobody says anything for a second.

**Oded**: "It doesn't like either one?"

**Daniel Compiler**: "The argument has to fit an overload. It might be a string, so the array overload cannot accept it. It might be an array, so the string overload cannot accept it. The implementation signature below them is hidden from callers."

**Eden** reaches for the keyboard.

"Hang on. I left a signature out."

```typescript
function slugify(title: string): string;
function slugify(titles: string[]): string[];
function slugify(input: string | string[]): string | string[];
function slugify(input: string | string[]): string | string[] {
  return Array.isArray(input)
    ? input.map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    : input.trim().toLowerCase().replace(/\s+/g, "-");
}

const one = slugify("Hello World");   // string
const many = slugify(["One", "Two"]); // string[]
const fromTags = slugify(post.tags);  // string | string[]
```

"Third public signature. Now it accepts the union too."

**Linoy** hovers over `one`, then `fromTags`.

"Yes. Those work."

**Oded**: "Good. Are we done with the question mark?"

**Linoy**: "You've written three signatures for a relationship I can write once."

**Eden**: "There are two cases. I'm comfortable listing them."

**Oded**: "Why list them at all? Keep the union signature."

He deletes the first three lines, leaving the implementation as an ordinary function.

```typescript
const slugs = slugify(post.tags); // string | string[]
const slug = slugify("Hello World"); // string | string[] too

slug.toUpperCase();
// error TS2339: Property 'toUpperCase' does not exist on type 'string | string[]'.
//   Property 'toUpperCase' does not exist on type 'string[]'.
```

**Linoy**: "You passed a string. Now you have to check whether you got one back."

**Eden**: "That's why the first two stay."

Oded undoes the deletion.

**Linoy**: "And when I need the relationship somewhere else? In another generic signature? I can give it a name:"

```typescript
type Slug<T extends string | string[]> =
  T extends string[] ? string[] : string;
```

"Then the other signature can use `Slug<T>`. I don't have to list the cases again."

**Eden**: "Show me that caller when you have it. These three calls work."

**Daniel**: "They do. Both versions can describe these calls."

**Noam Kiperman**: "We've looked at the callers. Show me the body of yours."

**Linoy** opens another tab.

"This is what I tried first."

```typescript
function slugify<T extends string | string[]>(
  input: T,
): T extends string[] ? string[] : string {
  return Array.isArray(input)
    ? input.map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    : input.trim().toLowerCase().replace(/\s+/g, "-");
  // error TS2322: Type 'string[]' is not assignable to
  //   type 'T extends string[] ? string[] : string'.
  // error TS2322: Type 'string' is not assignable to
  //   type 'T extends string[] ? string[] : string'.
}
```

**Oded**: "Your own signature rejected your own function."

"Yes."

**Daniel**: "The body has to work for every allowed `T`. `Array.isArray` narrows `input`, but the checker does not use that check to resolve the conditional return type here."

"You can separate the public signature from the implementation. One overload this time."

```typescript
function slugify<T extends string | string[]>(
  input: T,
): T extends string[] ? string[] : string;
function slugify(input: string | string[]): string | string[] {
  return Array.isArray(input)
    ? input.map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    : input.trim().toLowerCase().replace(/\s+/g, "-");
}

const one = slugify("Hello World");   // string
const many = slugify(["One", "Two"]); // string[]
const fromTags = slugify(post.tags);  // string | string[]
```

"The conditional is the public face. The body gets checked against the loose signature underneath."

**Linoy**: "Same three results. One public signature."

**Daniel**: "The body is checked against `string | string[]`. It is not checked against the input/output relationship in the overload. Return a string for an array, and it still compiles. Eden's overloads have the same limitation."

**Oded**: "So it lies, but it only lies in one place." He shrugs. "That's most of my architecture."

**Noam** points at the implementation signature.

"Say the last part again."

**Daniel**: "Returning the wrong branch can still compile."

"Break it. I want to see that."

**Daniel** changes one line.

```typescript
function slugify<T extends string | string[]>(
  input: T,
): T extends string[] ? string[] : string;
function slugify(input: string | string[]): string | string[] {
  return Array.isArray(input)
    ? input.join(" ").trim().toLowerCase().replace(/\s+/g, "-") // wrong branch: a string
    : input.trim().toLowerCase().replace(/\s+/g, "-");
}

const many = slugify(["One", "Two"]); // string[], says the signature
many.map((s) => s.length);
// Compiles clean. At runtime:
// TypeError: many.map is not a function
```

"Compiles."

**Noam**: "The signature says array. The value is a string. Whoever calls `.map` finds out, and the stack trace points at their line."

He scrolls back to Eden's version.

"And the same body passes under these?"

**Daniel**: "Yes."

**Oded**: "It's a slug function, Noam."

**Noam**: "You said that about the helper with `as any`. I spent six hours on that deploy. Six hours."

**Linoy**: "I can add type tests."

"That call passes a type test." Noam points at `many`. "The signature says `string[]`. A type test believes it. Call the function. Check the value it actually returns."

**Eden**: "String case, array case. The tests should stay whichever signature we use."

**Noam**: "Including the empty array. And I'd like to see them before this merges."

**Oded**, to Linoy: "You put my name on this PR, didn't you?"

**Linoy** writes *test per branch* on the board, under the signature.

---

### "You already ship these"

**Daniel** stays at the front.

"Before anyone decides whether they like conditional types, they should know they have been shipping them for years. This is `lib.es5.d.ts`. It is in every project in this room."

```typescript
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

"Every `Exclude` in your codebase is one conditional type, one line long. There is no import. It is global, like `Array`."

```typescript
type Channel = "email" | "sms" | "push";

type Reachable = Exclude<Channel, "push">;
// "email" | "sms"
```

**Oded** looks at the one-liner, then at the result, then back.

"That shouldn't work."

"Say why."

"Because—" he traces it with the pen. "Is `Channel` assignable to `"push"`? No. It's three things and `"push"` is one of them. So the answer's no, so you take the false branch, so it hands back `T`, which is the whole union. Unchanged. Nothing gets excluded." He looks up. "So why is the answer two things?"

**Daniel**: "Because the compiler never asked your question. It asked a smaller one, three times."

He writes it out.

```typescript
// What the compiler actually evaluates:
// "email" extends "push" ? never : "email"  →  "email"
// "sms"   extends "push" ? never : "sms"    →  "sms"
// "push"  extends "push" ? never : "push"   →  never
//
// "email" | "sms" | never  →  "email" | "sms"
```

"The rule has a bureaucratic name — *distributive conditional types*. When the checked type is a bare type parameter and the argument is a union, the conditional runs once per member, and the results are unioned back together. The union walks through the fork one member at a time."

"And `never` is the empty union. Adding it to a union contributes nothing, so it disappears on the way back. That is the entire mechanism of type-level filtering: the members you want gone come out as `never`, and reassembly drops them."

**Oded** sits with that for a moment.

"So it's a loop."

"It is a loop."

"There's a loop. In the type. That nobody mentioned." He turns to Linoy. "How long have you known about this?"

"Since 2.8. I told you when we opened the PR."

**Oded** opens a terminal and greps his own repository. Then he turns the laptop around.

"Two hundred and six `Exclude`s and `Extract`s. I ran an audit last month, after we looked at `logPayload` — deleted eleven generics that weren't doing anything, felt terrific about it. Apparently I've been shipping type-level loops the entire time and none of them were mine."

He shuts the laptop.

"I'm keeping those. I don't have to maintain `Exclude`. If you want to put a new utility in our repo, I still want to see what uses it."

---

### "What happens at the edges?"

**Linoy** adds another use of `Reply`.

"Try the same rule with no members. `never`:"

```typescript
type Reply<T> = T extends string ? "it was a string" : "it was not";

type Nothing = Reply<never>; // never
```

"`never` is the empty union. Distributing over zero members gives `never`. And with `any`:"

```typescript
type BothWays = Reply<any>; // "it was a string" | "it was not"
```

"Here `any` produces both branches. Remember `Unwrap<any>` from the `any` argument? The false branch was `T` itself, so it contributed `any`, which absorbed the other result."

"So unions distribute, `never` vanishes—"

**Chen**: "Does `never` vanish?"

**Linoy**: "I just showed you."

"You showed me `never` through a type parameter." He nods at Daniel. "Ask it directly."

**Daniel** types a direct check.

```typescript
type Direct = never extends string ? "ran" : "no"; // "ran"
```

"Asked directly, it evaluates. Picks a branch like anything else."

"Right. I left out the condition. `never` gives that result when we distribute over it." She underlines `T` on the board.

```typescript
type ViaParam<T> = T extends string ? "ran" : "no";
type Vanished = ViaParam<never>; // never — through a parameter, the fork never runs
```

**Chen**: "Then how does anyone ask whether a type is `never`?"

**Daniel**: "You switch distribution off. Wrap both sides in a one-element tuple — the parameter is no longer bare, so the union travels through the fork in one piece."

```typescript
type ToArray<T> = T extends unknown ? T[] : never;
type Split = ToArray<string | number>; // string[] | number[]

type ToArrayWhole<T> = [T] extends [unknown] ? T[] : never;
type Together = ToArrayWhole<string | number>; // (string | number)[]

type IsNever<T> = [T] extends [never] ? true : false; // the wrap makes it askable
```

"With `any`, the checked type matters too. `any extends string` produces both branches even without a type parameter. Wrap it, and the checked type is the tuple `[any]`, which is assignable to `[string]`."

```typescript
type Wrapped = [any] extends [string] ? "ran" : "no"; // "ran"
type TopCheck = any extends unknown ? "ran" : "no";  // "ran"
```

"And `any` does not always produce both branches. Against `unknown`, as here, or `any` itself, it takes the true branch. Keep the actual condition attached to the example."

**Chen** is not finished. "Two more things this machine does quietly. First:"

```typescript
type Enabled = Exclude<boolean, false>;
// true — boolean is secretly the union true | false, and it distributes
```

"Second, and worse."

```typescript
type Mistyped = Exclude<Channel, "smss">;
// "email" | "sms" | "push" — a typo, and no error
```

"Misspell a case in a `switch` and the exhaustiveness check from the enum argument screams at you. Misspell a member here and the filter matches nothing, hands back your union untouched, and the build goes green. Has anyone worked out what warns you?"

Nobody answers.

**Linoy**: "Nothing warns you. But you can make the gate do it — constrain the second parameter to the first:"

```typescript
type StrictExclude<T, U extends T> = T extends U ? never : T;

type Fine = StrictExclude<Channel, "push">; // "email" | "sms"

type Caught = StrictExclude<Channel, "smss">;
// error TS2344: Type '"smss"' does not satisfy the constraint 'Channel'.
```

"Both meanings of `extends`, one line. The gate rejects the typo before the question runs."

**Chen**: "And what does it reject that you wanted?"

Linoy pauses.

"A wider category. If `Mixed` is `"email" | "sms" | 42`, I can write `Exclude<Mixed, string>` to remove both strings. `StrictExclude` rejects that: `string` is wider than the string literals in `Mixed`."

**Chen**: "Still want the constraint?"

"For `Channel`, yes. I want a typo to fail. I wouldn't replace the standard utility with it."

---

### "Who reads the error?"

**Eden**: "A junior on my team lost an afternoon to a conditional type in a component library. Four layers deep. The error quoted an unresolved `T extends A ? B : C`. I approved that PR, and I couldn't explain the message either. We eventually found the wrong argument."

**Linoy**: "Did the library have type tests?"

"Yes. They passed. This was an invalid call. The type caught it. We couldn't work out what it wanted us to change."

**Linoy** looks at the diagnostic still on the screen.

"You could add that call to the examples. Show the misuse as well as the good calls."

"We did. Someone still has to keep those examples up to date. The editor was slow in that file too."

**Gil Benchmark**: "Did you measure it with the helper removed?"

**Eden**: "No. We were trying to understand the error."

**Gil**: "Then we have an unreadable error. We haven't measured a slowdown."

**Daniel** opens the standard library declarations.

"There is a simpler representation to consider before you add tests and documentation around a conditional. Sometimes you can remove it. This one changed in TypeScript 4.8:"

```typescript
// TypeScript 4.7 and earlier:
type NonNullable<T> = T extends null | undefined ? never : T;

// TypeScript 4.8 and later:
type NonNullable<T> = T & {};
```

"Under strict null checking, `{}` excludes `null` and `undefined`. Intersecting with it removes them. The intersection also simplifies where an unresolved conditional cannot, which makes it easier for the checker to relate generic types."

**Linoy**: "Same result?"

"For ordinary unions with `null` and `undefined`, yes. For `unknown`, the old definition returned `unknown`. The new one returns `{}`. It excludes the nullish values there too."

The change and its effect on generic assignability are described in the [TypeScript 4.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html).

## The Turn

**Dafna Functor** points to `Exclude`, still on the whiteboard.

"Keep each member that doesn't match. That's a filter."

**Oded**: "I use `filter`. I don't want to maintain all of this."

"Then use `Exclude`. Someone already wrote it."

**Linoy**: "Someone has to write the utilities."

**Eden**: "Fine. I still want the overloads on this function."

**Chen Override** turns back to the pull request.

"What does the next function do with the tags?"

Linoy scrolls down.

```typescript
const slugs = Array.isArray(post.tags)
  ? slugify(post.tags)
  : [slugify(post.tags)];
```

**Chen**: "Why the brackets around the second call?"

**Linoy**: "The tag index takes a list."

"So this caller doesn't want the input shape preserved?"

She reads the next few lines before answering.

"No. It wants an array either way. The title caller wants a string."

**Oded**: "Which is what the two functions did."

**Linoy**: "The tags still need a check before they can call `slugifyAll`."

**Dafna**: "Do it when you read the front matter. Pass a list to the rest of the pipeline."

```typescript
function normalizeFrontMatter(post: FrontMatter) {
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [post.tags],
  };
}

const normalized = normalizeFrontMatter(post);
const titleSlug = slugifyOne(normalized.title); // string
const tagSlugs = slugifyAll(normalized.tags);   // string[]
```

**Linoy** checks the uses of `tags` in the file.

"All right. That works here."

She leaves a comment on the PR, then returns to the conditional signature in her other tab.

"I'm keeping this example. I have library callers that don't get to normalize their input first."

**Eden**: "Bring those. I'll bring the overloads."

## The Verdict

> For this content pipeline, normalize tags to a list and keep the two functions. For an API that must preserve the input shape, both overloads and a conditional return type can work. Choose based on how clearly you can describe and maintain the relationship.

| Situation | Start with | What to check |
|-----------|------------|---------------|
| A few stable input/output cases | Explicit overloads, including a public union overload if needed | Can callers pass every supported input and recover the appropriate result type? |
| The same case-dependent relationship appears in several signatures, or listing cases becomes cumbersome | A named conditional type | Does reuse make the API easier to maintain and understand? |
| Callers only need a union result | A plain union signature | Would any caller benefit from a more specific return? |
| The rest of the program needs one input shape | Normalize at the boundary | Are you carrying alternatives after they have stopped being useful? |
| Filtering or transforming a union | A distributive conditional, often an existing utility | Check what happens to each member, including `never` |
| Comparing a union as a whole | `[T] extends [U]` | Tuple wrapping prevents distribution over `T` |
| An implementation sits beneath overloads | Runtime tests for the promised input/output cases | Type tests check what callers see; they cannot prove the body returns the right branch |

Eden prefers to list the cases while there are only a few. Linoy prefers to name the relationship once, especially when other generic signatures use it. A union caller alone does not settle their disagreement. The [handbook's conditional-type example](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) starts with the same three-overload alternative.

## Additional Takes

**Linoy Nightly**: "We still owe `Unwrap` an explanation. The `infer U` part extracts the type inside `Promise<U>`. `ReturnType` uses the same mechanism for functions. It shipped with conditional types in 2.8. I'm going to need the board for that one."

**Noam Kiperman**: "And test the type-only utilities too. `Exclude<Channel, "smss">` compiles. A check that the resulting union is exactly what you intended catches that typo. Different test from calling `slugify`, but it belongs in the PR."

**Gilad Stacktrace**: "Paste a bad call and its error into the PR. Let the next reviewer tell you how to fix the call."
