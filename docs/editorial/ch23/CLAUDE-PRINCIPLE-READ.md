# Reader report: Chapter 23, "The Principle" (draft 1, first-time read)

Draft 1 (`63db6fdf…`, `cf62962`), 2026-10-27. A fresh, isolated reader had only the Principle
extract, with Chapters 1–22 stated as prerequisites, and the four cases from the
[settled plan](../CH23-PLAN.md#settlement-after-codexs-challenge-2026-10-27). It was also asked whether the section
was enjoyable and where its attention dropped. It could run only the book's TS 7.0.2 binary and Node 22,
and installed nothing. The report is copied verbatim.

---

## 1. The rule, quoted

| # | Sentence (exact) | Explicit instruction? | Mechanical? | What I had to supply |
|---|---|---|---|---|
| 1 | "When a step can refuse, the next step needs a rule for that refusal." | No. It's a premise. | No | What counts as "refuse": a failed Result, null, an empty array, a rejected promise? The later sentences suggest all of them, but this sentence doesn't say so. |
| 2 | "With `Result`, `map` runs a function on the successful value and wraps whatever it returns." | No (definition) | Yes | Nothing |
| 3 | "If the function returns another Result, that gives you a Result inside a Result." | No (consequence) | Yes | Nothing. The compiler confirmed it (case c). |
| 4 | "`andThen` instead uses that returned Result directly." | No (definition) | Yes | How the error types combine when the two Results have different `E`s. I had to decide that myself, and it matters (see 3c). |
| 5 | "Both carry an earlier refusal onward without calling the function." | No | Yes | Nothing |
| 6 | "Look at what the next function returns before choosing between them." | **Yes. This is the testable rule.** | Mostly: returns Result → `andThen`, otherwise → `map` | That mapping. The sentence says "look", not "if it returns a Result, use andThen". It also says nothing about a function that returns `Promise<Result>` or that throws. |
| 7 | "That can remove repeated checks, but the checks may already read well." | Half (a caution) | No. "Read well" is a judgment call. | What "That" refers to: `andThen`? Chaining in general? |
| 8 | "Compare the actual callers before replacing them." | Yes | No | What to compare. "Callers" of what? The checks sit inside one function. And does "them" mean the callers or the checks? I read it as "write both versions at the real call sites and compare", but I had to guess. |
| 9 | "Arrays have `flatMap` for steps that return arrays." | No (fact). It implies "same rule as andThen". | Yes | That this is the same idea as sentence 6. The section never says it out loud. |
| 10 | "Promise `then` lets its callback return a plain value or a promise or thenable to adopt." | No (fact) | n/a | That this means Promise `then` acts as both `map` and `andThen`. That's the unifying point, and I had to put it together myself. Also: what "adopt" means. |
| 11 | "For an object with a callable `then`, adoption calls that method with resolve and reject callbacks." | No (fact) | n/a | That this also applies when an `async` function *returns* such an object, and to `await`, not only to a `then` callback. Case (a) depends on that. |
| 12 | "If neither is ever called, the promise stays pending." | No (fact) | Yes | Nothing. node confirmed it. |
| 13 | "A success-only method that skips its callback on refusal cannot stand in for that protocol." | Implied ("don't name it `then`") | No | The actual instruction: "don't name your chaining method `then`; rename it." The section never says "rename". |
| 14 | "And don't expect array `flatMap` to wait for promises: an array of promises needs `Promise.all` if you want all its values." | Yes | Yes | What happens if one promise rejects. Is "if you want all its values" a hint at `allSettled`? |
| 15 | "If all you need is to stop property access on null or undefined, optional chaining already does that without an Option wrapper." | Yes (conditional) | Yes, the condition can be tested | The other side: when you *do* need more than that. That's left to me. |

## 2. In your own words

When a step can fail, decide how the next step handles that failure by looking at what the next function returns. If it returns a plain value, use `map`. If it returns the same kind of wrapper (a Result, an array), use the flattening version (`andThen`, `flatMap`) or you get a box inside a box. Either way, an earlier failure skips the function. Before swapping hand-written `if (!r.ok) return r` checks for a chain, compare both versions in the real code, because the checks may be clearer. Promise `then` already flattens, and it flattens anything with a `then` method. So don't give your own success-only type a method called `then`: `await` will call it and either strip your wrapper or hang forever. `flatMap` doesn't await anything; an array of promises needs `Promise.all`. And for plain null/undefined property access, `?.` is enough.

## 3. Apply it

### (a) `async` repo returns a `Maybe<User>` whose chaining method is `then(f)`

**What the Principle says:** "For an object with a callable `then`, adoption calls that method with resolve and reject callbacks. If neither is ever called, the promise stays pending. A success-only method that skips its callback on refusal cannot stand in for that protocol."

**Prediction:** if the user is missing, `then` skips its callback, so neither resolve nor reject runs and the code hangs forever. If the user is present, `then` calls `f = resolve` with the user, so the caller gets a bare `User` and the `Maybe` is gone.

**Checked (node, `a.mjs`):**
```
present: { id: '1', name: 'Ada' } instanceof Maybe: false
missing: still pending after 1s; process will exit with await unresolved
Warning: Detected unsettled top-level await at file:///.../a.mjs:12
exit 13
```
**Compiler (`a.ts`, `a2.ts`):** `async function findUser(): Promise<Maybe<User>>` compiles with **no error**. Only when I assign the awaited value to `Maybe<User>` does it complain:
```
a2.ts(16,9): error TS2739: Type 'User' is missing the following properties from type 'Maybe<User>': v, then
```
So TS quietly types `await findUser(id)` as `User` (via `Awaited`), which matches the runtime in the present case. In the missing case, though, the types say `User` and the runtime never settles. The compiler can't see the hang.

**What I'd change:** rename the method to `andThen`/`flatMap`/`chain`. `Maybe2` with `andThen` gives `const r: Maybe2<User> = await findUser2("1")` and compiles clean.

**What I decided myself:**
- The present case: the section only talks about the missing one ("skips its callback"). I worked out "the wrapper gets stripped" from "calls that method with resolve".
- That the hang starts at `return` inside the async function, not at the caller's `await`. The section frames adoption around "Promise `then` lets its callback return…". It never mentions `async` return or `await`.
- That the fix is "rename". Sentence 13 says what can't work, not what to do.

### (b) `const users = ids.map(async id => fetchUser(id));` used as `User[]`

**What the Principle says:** "don't expect array `flatMap` to wait for promises: an array of promises needs `Promise.all` if you want all its values."

**What happened:** `users` is `Promise<User>[]`, an array of promises, not an array of users.

**Compiler (`b.ts`):**
```
b.ts(7,9): error TS2322: Type 'Promise<User>[]' is not assignable to type 'User[]'.
b.ts(8,32): error TS2339: Property 'name' does not exist on type 'Promise<User>'.
b.ts(11,9): error TS2322: Type 'Promise<User>[]' is not assignable to type 'User[]'.   <- the flatMap version
```
**node (`b.mjs`):**
```
map: [ Promise { <pending> }, Promise { <pending> } ] [ undefined, undefined ]
flatMap: [ Promise { <pending> }, Promise { <pending> } ]
Promise.all: [ { id: '1', name: 'u1' }, { id: '2', name: 'u2' } ]
```
**Fix:** `await Promise.all(ids.map(id => fetchUser(id)))`. `flatMap` does not fix it, which is exactly what the section says. The `async` in `async id => fetchUser(id)` is redundant; promises don't nest, so it's still `Promise<User>`.

**What I decided myself:**
- A name for it. The section only says "an array of promises". The deeper name, "map produced a different kind of box per item, so the boxes are inside-out (array of promises, not promise of array)", isn't in the text. The section explains box-in-box for the *same* box type (Result in Result) but not this mixed case.
- Whether `Promise.all` is right when a fetch can fail: it rejects on the first failure. "If you want all its values" made me wonder whether `allSettled` was meant.

### (c) Four `if (!r.ok) return r;` steps. A reviewer wants a chain helper.

**What the Principle says:** "That can remove repeated checks, but the checks may already read well. Compare the actual callers before replacing them." Also "Look at what the next function returns before choosing between them."

**What I'd check (`c.ts`):**
1. **Does every step take only the previous step's value?** My fourth step, `charge(p, amount)`, needs values from steps 2 *and* 3. The chained version then has to nest closures:
   ```ts
   andThen(andThen(parse(i), validate), p =>
     andThen(price(p), amount =>
       map(charge(p, amount), receipt => ({ receipt, amount }))));
   ```
   That's harder to read than four flat checks. I made both versions assign to each other's return types and it compiled clean, so they're type-equivalent. node gives identical output in both directions:
   ```
   {"ok":true,"value":{"receipt":"charged a@b 20","amount":20}} {"ok":true,...same}
   {"ok":false,"error":"BadJson"} {"ok":false,"error":"BadJson"}
   ```
2. **Does each step return a Result or a plain value?** Picking `map` for a Result-returning step nests silently. Runtime: `{"ok":true,"value":{"ok":true,"value":{...}}}`. Compiler: `Type 'Result<Result<Parsed, "BadEmail">, "BadJson">' is not assignable to type 'Result<Parsed, "BadEmail" | "BadJson">'`.
3. **Do the error types differ?** Here a naive helper typed `(r: Result<T,E>, f: (t:T) => Result<U,E>)` breaks once the error types are objects:
   ```
   c.ts(48,33): error TS2345: Argument of type '(s: string) => Result<number, DbError>' is not assignable to parameter of type '(t: string) => Result<number, ParseError>'.
   ```
   With string-literal errors, TS happened to infer the union and it compiled. So whether the helper works depends on how it's typed.
4. Does any check do more than `return r` (log, map the error, recover)? If so, it isn't a pure chain step.

**What I decided myself:** all four items above. The text gives one criterion ("may already read well") plus an instruction I couldn't parse ("compare the actual callers"). I took it to mean "write both versions in the real function and compare". Nothing tells me *what* makes a chain read worse; the shared-earlier-value case is the obvious one, and it's missing.

### (d) `user?.address?.city` everywhere; someone proposes `Option<T>`

**What the Principle says:** "If all you need is to stop property access on null or undefined, optional chaining already does that without an Option wrapper."

**Checked (`d.ts` compiles; `d.mjs`):**
```
undefined -> undefined | length: undefined
{"address":null} -> undefined | length: undefined
{"address":{}} -> undefined | length: undefined
{"address":{"city":""}} -> "" | length: 0
```
**When `?.` already does the job:** when every link is a property read and the caller only needs "a value, or undefined", usually followed by `??` for a default. It correctly doesn't short-circuit on `""`.

**Where it stops (my addition, not in the text):**
- Passing a maybe-missing value *into a function*. I had to write `city === undefined ? undefined : geocode(city)?.lat`, and that's the spot where an `andThen`-style helper starts to pay.
- Needing to know *which* link was missing. `?.` merges no-user, null-address and no-city into one `undefined`.

**What I decided myself:** the whole "when Option earns its place" side. The section only gives the condition under which you don't need it.

## 4. Where the section left you unsure

1. **Is it one rule or a tour?** The testable rule is sentence 6. The rest jumps across Result → arrays → Promise `then` → thenables → `flatMap` + promises → `?.`. The idea that ties them together ("every container has a map and a flatten; Promise `then` is both at once, which is why a fake `then` breaks it") is never stated. I had to build it.
2. "That can remove repeated checks": what does "That" refer to?
3. "Compare the actual callers before replacing them": callers of what? Replace the callers, or the checks?
4. What to do when a later step needs more than the previous value (case c). This is the most common reason to keep the checks, and it isn't named.
5. How `andThen` combines different error types.
6. Whether adoption applies to `return` from an `async` function and to `await`. The text only mentions Promise `then` callbacks.
7. What happens in the *present* case of the fake-`then` Maybe. The section only describes the missing case.
8. `Promise.all` vs `allSettled`: is "if you want all its values" a hint?
9. `Promise<Result<T,E>>`, the obvious place this chapter's two halves meet, isn't covered. Which rule applies?
10. "Refuse": does an empty array count? An empty `flatMap` result isn't really a refusal, so the analogy in sentence 9 is loose.
11. When `Option` *is* justified over `?.`. Only the negative case is given.

## 5. Clarity, voice and enjoyment

**Sentences I reread, and why:**
- "A success-only method that skips its callback on refusal cannot stand in for that protocol." Three reads. "Success-only method" is an unexplained coinage, "that protocol" points back two sentences, and the takeaway ("so don't call it `then`") is left unsaid. This is the most important sentence in the section and the hardest to parse.
- "Promise `then` lets its callback return a plain value or a promise or thenable to adopt." Does "to adopt" go with "thenable" only, or with "a promise or thenable"? Spec-speak.
- "For an object with a callable `then`, adoption calls that method with resolve and reject callbacks." "Adoption" as the subject of "calls" is abstract. I had to translate it into "the promise machinery calls your `then(resolve, reject)`".
- "Compare the actual callers before replacing them." Ambiguous referent (see 4.3).
- "That can remove repeated checks…": "That" has no clear antecedent.

**Terms used without explanation:** thenable, adopt/adoption, protocol, resolve/reject callbacks (as the arguments a promise passes to a foreign `then`), "success-only method", `Option` / "Option wrapper", "refuse/refusal" as a general term. `andThen` may come from earlier in the chapter, which I haven't read, but this section uses it with no reminder.

**Person or documentation?** Mostly documentation. The first line ("When a step can refuse, the next step needs a rule for that refusal") sounds like someone with a view. After that it's a fact sheet. Nothing marks it as Eli the language theorist: no relish for the idea that Promise `then` is both map and flatten (exactly the insight a theorist would enjoy), no aside, no image. The second paragraph is six unconnected facts with almost no transitions, and the only connective in it is "And don't expect…".

**Enjoyment:** honestly, low to moderate. Attention peaked at "If neither is ever called, the promise stays pending." It's a surprising, concrete fact with real stakes, and it made me go run the code. It dropped at "Promise `then` lets its callback return a plain value or a promise or thenable to adopt" and the adoption sentence after it. That's where it reads like the ECMAScript spec, and where I started skimming. It dropped again at the `flatMap`/`Promise.all` and `?.` sentences. Each one is correct, but they come as a list of "also" items in one breath, with no example. The best material (the fake-`then` trap) is buried mid-paragraph with no tiny example and no punchline, while the Result `map`/`andThen` mechanics get the most words even though they're the most familiar part to a reader coming from Ch1–22. Suggestion: state the rule in one plain sentence ("if the next function returns the same kind of box, flatten; Promise `then` always flattens, so never give your own box a `then`"), then let Eli enjoy the consequence.

## Scratch files
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/a.ts
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/a.mjs
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/a2.ts
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/b.ts
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/b.mjs
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/c.ts
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/c_run.ts (emitted to /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/out/c_run.js)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/d.ts
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/p/d.mjs