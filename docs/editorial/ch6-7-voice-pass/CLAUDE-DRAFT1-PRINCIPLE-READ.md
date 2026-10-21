# First read of the Ch6 Principle section

I read only `ch6-principle.md`. The whole section is 21 lines: one example and three sentences of rule.

## 1. The rule, quoted

> "Use a type parameter when a caller needs a relationship between types in the signature. Ask what supplies the type argument and what depends on it. If nothing else depends on it, try removing it."

The section has a rule, and it's in the last paragraph. The first sentence says when to use one. The second gives a question to ask in code review. The third gives an action to take.

## 2. In my own words, and applied

My restatement: a type parameter is worth having only when it ties two places in the signature together. In `identity` it ties the argument to the return. Something has to fill it in, usually inference from an argument. Something else has to use it. If it's filled in and nothing else reads it, delete it.

**(a) `function logPayload<T>(payload: T): string`**: the rule settles this one. The argument supplies `T`. Nothing else uses it, because the return is `string`. "Nothing else depends on it," so remove it and write `payload: unknown`. This is the easy case, and I'm confident about it.

**(b) `function parseConfig<T>(input: string): T`**: the rule doesn't clearly settle this one, and the two halves of it pull in different directions.
- First sentence: `T` appears in only one place, so there's no relationship between types in the signature. That suggests it's wrong.
- Second and third sentences: "What depends on it?" The return type does. So "nothing else depends on it" is false, and the instruction to remove it never applies. Read literally, it passes.
- "What supplies the type argument?" Not the input, which is always `string`. The caller would have to write `parseConfig<Config>(...)`, or the compiler would infer it from the variable being assigned to. I suspect the intended answer is "nothing real supplies it, so it's a type assertion in disguise (Ch2)". Ch5's parsers that return a result type are the honest version. But the section never says that a caller writing the type argument doesn't count, so I'm guessing. This is the gap I'd most want closed. It's the case where the rule as written gives the wrong answer, or at least an unclear one.

**(c) `sortByName<T extends { name: string }>(items: T[]): T[]` vs `sortEmployees(items: Employee[]): Employee[]` with one caller**: the rule doesn't decide this, and it doesn't say the question is open. The generic version passes the test, because the argument supplies `T` and the return uses it, so the rule doesn't say to remove it. But the first sentence says "when a caller *needs* a relationship." With one caller who always passes `Employee[]`, the concrete version gives that caller exactly the same types. The rule has no wording about how many callers there are or whether you might need it later. I'd guess "both are fine," but that's my guess; the text doesn't say so. If the chapter means to leave this open, the section should say that outright, so that a reviewer doesn't read "use a type parameter when..." as "you must use one when...".

## 3. Sentences that confused me

- **`// T becomes "hello" — the literal`** next to **`// T becomes { id: string }`**. Why does the string keep its literal type when the object's `id` widens to `string`? The comments show the difference and don't explain it. It caught my attention more than the rule did. Either explain it in a few words or don't put the two side by side. As written it looks like the important part.
- **"Ask what supplies the type argument and what depends on it."** The section uses "type parameter" and "type argument" without ever separating them. The idea is that the type parameter is `T` and the type argument is the type that fills it in. I worked it out, but a reader seeing generics for the first time might not. "What depends on it" is vague too. Does the return type count? Does a second parameter? Does a constraint? See 2(b).
- **"a relationship between types in the signature"** is abstract. The only example of a relationship is parameter to return in `identity`. One more short example would anchor it, such as two parameters tied together (`merge<T>(a: T, b: Partial<T>)`), or a counterexample with a useless `T`.
- **"try removing it"**: why only "try"? And remove it in favour of what? `unknown`, a concrete type, or something else? The softness makes the rule harder to apply in review.
- **"In `ParseResult<User>`, we supplied `User` for the successful value's type."** This is a bit clunky on first read ("supplied ... for the successful value's type"). It's clear enough if you remember Ch5.

## 4. Narrator voice and filler

Very little. The section is lean. "writes `ParseResult<T>` on the board" is a stage direction, and it's fine. No sentence lectures me. If anything the section is too thin: there's no bad example to show what the rule rejects. My only complaint is about the gaps, not about padding.

## 5. What I expect the debate to be about

- Return-only generics like `parseConfig<T>` and `fetchJson<T>`. Is a type parameter that only the return uses honest, or is it `as` in disguise? That's where the rule is weakest, so I expect someone to push on it.
- Generic vs concrete when there's one caller. One person says "make it generic, it's free". Another says "write `Employee[]` until a second caller shows up".
- Probably constraints (`extends { name: string }`), and whether a parameter that's only a constraint (with no return use) is still worth having.
- Possibly the literal-inference detail from the `identity` example, since the section raises it and never explains it.
