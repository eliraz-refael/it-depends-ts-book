# Reader report: Chapter 23, "The Principle" (draft 2, first-time read)

Draft 2 (`492a89f4…`, `81a2ff8`), 2026-10-27. A fresh, isolated reader had only the Principle
extract, with Chapters 1–22 stated as prerequisites, and three cases revised per the
[draft 2 plan note](../CH23-PLAN.md#draft-2-after-formal-review-2026-10-27): (a) a `Maybe` with a
`then` method, (b) a step returning an array or a Result, (c) early returns vs a chain helper. It
was also asked about enjoyment. It could run only the book's TS 7.0.2 binary and Node 22, and
installed nothing. The report is copied verbatim.

---

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/principle.md` (two paragraphs).

**Headline:** Paragraph 1 has a usable rule: look at what the step returns, then pick `map` or `andThen`. I applied it to case (b) without guessing. Paragraph 2 never tells me what to do. The instruction ("don't name a non-promise method `then`") and the result (the `await` silently hangs) are both left for me to work out. The compiler doesn't catch it either. The "write both versions" advice gives no way to compare the two versions.

## 1. The rule, quoted

| # | Sentence (exact) | Explicit instruction? | Mechanical? | What I had to supply |
|---|---|---|---|---|
| 1 | "Look at what the next step returns." | Yes, an imperative. | Yes, you read the return type. | That "next step" means the function you pass to the helper. |
| 2 | "A plain value belongs in `map`." | Half. "Belongs" is a verdict, not a "use". | Mostly. | What "plain" means. It is only plain relative to the container you're in. An array is plain to Result's `map`, but sentence 4 says an array step needs `flatMap`. So "plain" quietly means "not the same kind of container". |
| 3 | "Another Result belongs in `andThen`, which uses that Result directly instead of putting it inside a second one." | Half, same "belongs" form. | Yes. | What the error type becomes (union `E \| F`). I had to check that myself. |
| 4 | "For a step that returns an array, `map` keeps the extra array level and `flatMap` joins it." | No. It describes the methods and never says "use `flatMap`". | Yes, once you infer the instruction. | The instruction itself. Also that "array step" means inside `Array.map`, not inside a Result. |
| 5 | "Before replacing early returns with a chaining helper, write both versions of the function you're changing." | Yes, clearly. | The writing is mechanical. Choosing between the versions is not. | How to judge the two versions. No rule is given. |
| 6 | "You may prefer the checks." | No. It gives permission, not a rule. | No. | When and why. I had to find my own reason (nested closures when later steps need earlier values; see 3c). |
| 7 | "Their `then` does both jobs: it maps a plain return value and flattens a returned promise, including an object with a callable `then`." | No, it's a fact. | n/a | That "both jobs" means `map` plus `andThen`, tying back to paragraph 1. I got there, but the section doesn't say it. |
| 8 | "No registration required. You can join a language protocol just by choosing a method name." | No. | n/a | What "join" means in practice: `await`, `return` from an async function, and `Promise.resolve` will all call your method. |
| 9 | "So a method named `then` belongs to the promise protocol, whatever you meant by it." | No. This is the nearest thing to a rule, but it's a warning with no instruction. | Easy to detect (grep for `then`). The fix isn't stated. | The instruction ("don't call it `then` unless it is promise-shaped; rename it"), the consequence, and the fix. |

## 2. In your own words

Before you chain, look at the return type of the function you're passing. If it returns an ordinary value, use `map`. If it returns the same kind of container you're already in (a Result inside Result code, an array inside array code), use the flattening version (`andThen` for Result, `flatMap` for arrays), so you don't get a container inside a container. Before you swap early-return checks for a chain, write the function both ways and compare; the checks may honestly read better. Separately: JavaScript treats any object with a `then` method as a promise. `await` and async returns will call that method, so don't give a non-promise type a method called `then`.

## 3. Apply it

### (a) `Maybe<User>` with a `then(f)` method, returned from an async repo and awaited

**What the Principle tells me:** "So a method named `then` belongs to the promise protocol, whatever you meant by it." It also says promise `then` "flattens a returned promise, including an object with a callable `then`." So yes, there's a problem: `await` will treat the Maybe as a promise. Paragraph 1 also names the fix without meaning to. The method's `f` returns a Maybe, so by "Another Result belongs in `andThen`" it's really an `andThen`.

**Checked** (`a_maybe.ts`, `a_types.ts`, `a_fixed.mjs`):
- The async function declared `Promise<Maybe<User>>` and compiled with **no error**.
- `tsc` says the awaited value is a `User`, not a `Maybe`:
  ```
  a_types.ts(9,9): error TS2741: Property 'then' is missing in type 'User' but required in type 'Maybe<User>'.
  ```
  (from `const asMaybe: Maybe<User> = await findUser("1")`; `const asUser: User = ...` passes)
- At runtime:
  ```
  present -> { name: 'Ada' } object false      <- the Maybe is gone; callers get a bare User
  now awaiting the missing one...
  still waiting after 1s: the await never settled
  node exit 0                                   <- process ended silently; "missing ->" never printed
  ```
  When there is no user, the Maybe never calls `resolve`, so the `await` never finishes. Node exits with code 0 and no error. The type system can't see this.
- After renaming the method to `andThen`, `await` returns the Maybe in both cases (`present -> true`, `missing -> true`).

**What I'd change:** rename `then` to `andThen` (or `flatMap`/`chain`) and update the callers.

**What I decided myself:** the rename, the new name, and the whole failure mode. The section warns that the method "belongs to the promise protocol" but not what that does to you. The two worst parts are missing: the silent hang on the empty case, and the declared return type that no longer matches what `await` gives you. A reader who doesn't run it could think "so what, it's still my method."

### (b) `posts.map(tags)` and `map(parseId(raw), lookupAuthor)`

**What the Principle tells me:** "Look at what the next step returns." `tags` returns an array, so per "map keeps the extra array level and flatMap joins it" I should use `flatMap`. `lookupAuthor` returns a Result, so per "Another Result belongs in andThen" I should use `andThen`. This case is fully mechanical.

**Checked** (`b_pipeline.ts`):
```
Type 'string[][]' ...                                   <- posts.map(tags)
Type 'string[]' ...                                     <- posts.flatMap(tags)
Type 'Result<Result<Author, NotFound>, BadId>' ...      <- map(parseId(raw), lookupAuthor)
Type 'Result<Author, BadId | NotFound>' ...             <- andThen(parseId(raw), lookupAuthor)
```
Runtime:
```
posts.map(tags)      [["ts","fp"],["ts"]]
posts.flatMap(tags)  ["ts","fp","ts"]
map(a2)              {"ok":true,"value":{"ok":false,"error":{"kind":"NotFound","id":"a2"}}}
andThen(a2)          {"ok":false,"error":{"kind":"NotFound","id":"a2"}}
```
The nested Result is worse than awkward. For a valid id with no author, the outer `ok` is **`true`**, so a single `if (!r.ok)` check lets the failure through. That would have been a strong sentence for the section.

**What I'd change:** `posts.flatMap(tags)` and `andThen(parseId(raw), lookupAuthor)`.

**What I decided myself:** almost nothing. I did assume "the step" is the callback, and that the error type merging to `BadId | NotFound` is what you want.

### (c) Four `if (!r.ok) return r;` steps; a reviewer wants a chain helper

**What the Principle tells me:** "Before replacing early returns with a chaining helper, write both versions of the function you're changing. You may prefer the checks." So: write the chained version next to the current one before agreeing.

**Checked** (`c_both.ts`): I wrote a checkout with `parseOrder`, `loadUser`, `charge` and `receipt` both ways. The only error is the deliberate one I used to print the type:
```
Type 'Result<string, "BadOrder" | "Declined" | "MailFailed" | "NoUser">' is not assignable to type 'number'.
```
Both versions have the same type and assign to each other both ways. The difference is shape. `receipt` needs `order`, `user` and `chargeId`, so the chain becomes four nested arrow functions, one inside another. The early-return version stays flat and reads top to bottom.

**What might make them keep the checks** (my reasons; the section gives none):
- Later steps need values from earlier steps, which forces the nesting.
- A step needs to change or log its error.
- They want a breakpoint between steps.
- The team reads the checks faster.

The chain wins when each step only needs the previous step's value.

**What I decided myself:** the whole comparison. "You may prefer the checks" is permission without a test. I wrote both versions but had to invent the standard for judging them.

## 4. Where the section left you unsure

1. **"Plain value" is relative, but this isn't said.** An array is plain to Result's `map`, yet an array step needs `flatMap` in array code. A one-line framing like "plain means not the container you're already in" would fix this.
2. **No rule for "write both versions".** What should I look for? I found the nesting problem myself. The section should name at least one reason to prefer the checks.
3. **The promise paragraph has no instruction.** Is the advice "never name it `then`", "only name it `then` if it behaves like a promise", or something else? I assumed rename, but I inferred it.
4. **No consequence is stated.** It doesn't say `await` unwraps your value or hangs forever. It doesn't say TypeScript won't warn you; I found `tsc` silently types `await` of the Maybe as `User`. Without that, "belongs to the promise protocol" sounds like trivia, not a bug.
5. **Where does the protocol apply?** `await` only? `return` from an async function? `Promise.resolve`? `Promise.all`? "Join a language protocol" doesn't list the entry points.
6. **Promises and Result together.** If promise `then` does both jobs, what do I use for `Promise<Result<T, E>>`? It's the obvious next question after paragraph 2, and the section doesn't touch it. Maybe the chapter does later.
7. **Three words for one idea:** "uses that Result directly", "joins", "flattens". I assumed they mean the same thing, but a first reader may wonder if they differ.
8. **"Flattens a returned promise"** suggests one level. Promises actually unwrap all the way down; you can never hold a `Promise<Promise<T>>`. This is minor but slightly misleading.

## 5. Clarity, voice and enjoyment

**Sentences I reread:**
- "Another Result belongs in `andThen`, which uses that Result directly instead of putting it inside a second one." On first read, the "it" in "putting it" and "a second one" didn't link up. I got it on the second read.
- "For a step that returns an array, `map` keeps the extra array level and `flatMap` joins it." The topic jumps from Result to arrays with no bridge ("same idea for arrays:"). "Extra" compared to what, and "joins" what? I reparsed it.
- "So a method named `then` belongs to the promise protocol, whatever you meant by it." The "So" skips a step: `await` and promise resolution go looking for that method and call it. I had to supply that.

**Terms used without explanation:**
- "language protocol" / "promise protocol". This is the key idea of paragraph 2 and it's never defined.
- "chaining helper". Probably defined earlier in the chapter, which I haven't read.
- "flatten" / "join".
- The "thenable" idea, though the term itself isn't used, which is fine.

**Person or documentation?** Paragraph 1 reads like documentation, five flat declaratives in a row. "You may prefer the checks" is the only human moment, and it's a good one: a theorist admitting the elegant version can lose. Paragraph 2 is Eli. "The lovely complication is promises" sounds like a language theorist enjoying a flaw. "No registration required" is a dry joke. "whatever you meant by it" is a good closing punch. The two paragraphs feel written by different people.

**Enjoyment and attention:**
- It's too short to get boring, and I didn't. My attention dipped at the array sentence. After two clean Result sentences it switches containers with no transition, and I slowed down to parse it.
- Attention was highest at "No registration required. You can join a language protocol just by choosing a method name." That's a real "wait, what?" moment and the most fun line in the section.
- The ending is a letdown: it stops on the warning without the payoff. My scratch test showed a hang with exit code 0 and `tsc` reporting the wrong type. One sentence of that ("await it and an empty Maybe never resolves; the compiler calls it a `User`") would make the section memorable and hand the reader a rule they can act on.

## Scratch files
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/a_maybe.ts`: the Maybe with `then`, async repo, runtime hang demo
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/a_types.ts`: shows `tsc` types the awaited Maybe as `User`, and the renamed version keeps the Maybe
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/a_fixed.mjs`: the renamed (`andThen`) version at runtime
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/b_pipeline.ts`: `map` vs `flatMap` and `map` vs `andThen`, types and runtime
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/c_both.ts`: four-step early returns vs nested `andThen` chain
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read2/p/out/`: emitted JS