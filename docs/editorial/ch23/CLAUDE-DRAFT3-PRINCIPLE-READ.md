# Reader report: Chapter 23, "The Principle" (draft 3, first-time read)

Draft 3 (`8befc8d3…`, `eaa7711`), 2026-10-27. A fresh, isolated reader had only the Principle
extract, with Chapters 1–22 stated as prerequisites, and the same three cases as the draft 2 reader.
It was also asked about enjoyment. It could run only the book's TS 7.0.2 binary and Node 22, and
installed nothing. The report is copied verbatim.

---

## 1. The rule, quoted

| # | Sentence (exact) | Explicit instruction? | Mechanical? | What I had to supply |
|---|---|---|---|---|
| 1 | "Before admiring the chain, look at what its next step returns." | Yes | Yes. Look at the step's return type. | Nothing. Good opener. |
| 2 | "A plain value belongs in `map`." | Yes | Yes, once "plain" is defined | Nothing |
| 3 | "By plain, I mean not another Result when we're working in Result." | Definition | Yes | That "plain" depends on which container you're in. It's implied by "when we're working in Result", but you have to work that out. |
| 4 | "An array counts as a plain value there." | Clarification | Yes | That "there" means "in Result". |
| 5 | "Another Result needs a chaining operation that uses it directly, instead of putting it inside a second one." | Yes | **No.** The operation is never named. | The name (`andThen`? `flatMap`? `chain`?). "Uses it directly" means "returns the step's Result as is". "A second one" means a second Result wrapper. I reread this sentence. |
| 6 | "Arrays do the same: `map` keeps an extra array level and `flatMap` joins it." | Descriptive, implies a rule | Yes | "Do the same" as what? I read it as "have the same map/flatten split". The sentence before had arrays as the *plain* value, so arrays change role mid-paragraph. |
| 7 | "Write the early returns too." | Yes | **No** | What "too" means. Write them as well as the chain and compare? Always? Instead of the chain? I settled on "write both and compare", but that is my guess. |
| 8 | "If later steps need earlier values, you may find those checks easier to follow than callbacks nested to keep the values available." | Hedged ("you may find") | The condition is testable; the outcome is a judgment | What to do when later steps need only the previous value. Implied: the chain is fine then. Not stated. |
| 9 | "Their `then` does both jobs: it maps a plain return value and unwraps a returned promise, including an object with a callable `then`." | Descriptive | n/a | The consequence, which isn't stated: you can never get a `Promise<Promise<T>>`, and you can't get a `Promise<YourThenable>` either. |
| 10 | "Don't name a method `then` unless it keeps the promise contract." | Yes | **Partly.** "Promise contract" is undefined. | What the contract is. Mine: `then(onFulfilled, onRejected)`, call exactly one of them, once. |
| 11 | "Give a different chaining operation a different name." | Yes | Yes | A suggested name. `andThen` would have been the obvious one. |

## 2. In your own words

Before you chain a step, check what it returns. If it returns an ordinary value (anything that isn't the same kind of container you're working in, so an array counts inside Result), use `map`. If it returns the same kind of container (a Result inside Result work, an array inside array work), use the flattening operation (`andThen` for Result, `flatMap` for arrays). Otherwise you get a container inside a container. Also write the plain early-return version and compare. When later steps need values from several earlier steps, the early returns are often easier to read than callbacks nested only to keep those values in scope. Promises are the trap: `then` both maps and flattens, and it flattens anything with a callable `then`, even if that object never meant to be a promise. So never call a method `then` unless it really behaves like a promise's `then`. Give your own chaining method another name.

## 3. Apply it

### (a) `Maybe<User>` with a `then(f)` method, returned from an `async` function

**What the Principle says:** this is a problem. Rename the method. Words I used: "unwraps a returned promise, including an object with a callable `then`", "Don't name a method `then` unless it keeps the promise contract", "Give a different chaining operation a different name."

**Checked:** `a_maybe.ts` uses the team's `Promise<Maybe<User>>` annotation. The compiler accepts the annotation but types `await findUser("1")` as `User`:
```
a_maybe.ts(20,30): error TS2339: Property 'isSome' does not exist on type 'User'.
```
Running the same code (`a_maybe_run.mjs`, node 22, 1s timeout):
```
present: awaited value is { name: 'Ada' } | is a Maybe? false
missing: await still pending after 1s (it will never settle)
```
So when the user exists, the caller gets the bare `User`, not a `Maybe`. When the user is missing, the `await` never settles: `then` returns an empty Maybe and never calls the resolve callback. That is a silent hang, which is worse than a type error. The compiler only catches the first case, and only if the caller uses a Maybe method. A caller that just passes the value along compiles cleanly and hangs.

**Fix:** rename `then` to `andThen` (`a_maybe_fixed.ts`). It compiles with no errors.

**What I decided myself:**
- That this is the bug the section means. The section never says *what goes wrong* (wrong value when present, a hang when empty). Showing that symptom is what would make the rule stick.
- The new name.
- That "keeps the promise contract" rules out a one-argument `then` that sometimes never calls back.

### (b) `posts.map(tags)` and `map(parseId(raw), lookupAuthor)`

**What the Principle says:** in array work, `tags` returns another array, so use `flatMap`. In Result work, `lookupAuthor` returns another Result, so use the chaining operation. Words I used: "`map` keeps an extra array level and `flatMap` joins it", "Another Result needs a chaining operation that uses it directly, instead of putting it inside a second one."

**Checked (`b_containers.ts`):**
```
b_containers.ts(30,7): error TS2322: Type 'string[][]' is not assignable to type 'string[]'.
b_containers.ts(31,7): error TS2322: Type 'Result<Result<Author, NotFound>, BadId>' is not assignable to type 'Result<Author, BadId | NotFound>'.
```
Runtime output:
```
{"allTagsAsWritten":[["ts","fp"],["ts"]],"authorAsWritten":{"ok":true,"value":{"ok":true,"value":{...}}},"allTags":["ts","fp","ts"],"author":{"ok":true,"value":{...}}}
```
- As written, they get `string[][]` and `Result<Result<Author, NotFound>, BadId>`.
- Intended, they want `posts.flatMap(tags)` giving `string[]`, and `andThen(parseId(raw), lookupAuthor)` giving `Result<Author, BadId | NotFound>`.

**What I decided myself:**
- The name `andThen`. The Principle only says "a chaining operation"; I had it from the task prompt.
- That the error type widens to a union. That is a real thing a reader needs to know, and the section doesn't mention it.
- Whether `tags` counts as "plain". It does under Result (sentence 4) but not under arrays (sentence 6). I worked that out myself.

### (c) Four `if (!r.ok) return r;` steps; a reviewer wants a chain helper

**What the Principle says:** before agreeing, write the chain version and set it next to the early returns ("Write the early returns too"). Check whether later steps need values from earlier steps. If they do, keeping the checks is a reasonable choice ("If later steps need earlier values, you may find those checks easier to follow than callbacks nested to keep the values available").

**Checked (`c_early_returns.ts`, compiles, exit 0):** I wrote a checkout with four steps: `loadOrder`, then `loadUser(order.userId)`, then `quote(order, user)`, then `charge(user, quote)`, with a receipt that needs order, user and the charge.
- The early-return version is flat and ten lines long.
- The chain version nests four levels deep (`andThen(… (order) => andThen(… (user) => andThen(… (q) => map(…))))`), only so that `order` and `user` stay in scope.
- A "flat" chain is only possible if I carry an `{ order, user, q }` object forward by hand. That is more ceremony than the early returns.

This is the situation the Principle describes, and I'd keep the checks. I'd agree to the chain if each step needed only the previous value.

**What I decided myself:**
- That "too" means "as a comparison, not instead".
- The rule for the case where steps *don't* need earlier values. The section is silent there.
- That carrying a tuple or object forward is the other option. The section doesn't name it.
- What "easier to follow" means. It's a judgment, since the section only says "you may find".

## 4. Where the section left you unsure

1. **The Result chaining operation is never named.** "A chaining operation that uses it directly" makes me guess `andThen`, `flatMap` or `chain`. The array side names both operations; the Result side, where the rule matters most, names neither.
2. **"Write the early returns too."** Too as well as the chain? In every case? Instead of the chain? It reads as an instruction but doesn't say when to apply it.
3. **What is "the promise contract"?** Two callbacks? Call exactly one, exactly once? Asynchronous? A one-argument `then` that sometimes never calls back clearly breaks it, but I only know that because I ran the code.
4. **What actually happens if you break the `then` rule.** The section says don't do it, but not what goes wrong. When I ran it, `await` gave the bare `User` (not the `Maybe`) when the user existed, and hung forever when the user was missing. One clause saying that would turn the rule from an etiquette tip into a bug the reader fears.
5. **Is "method" too narrow?** The danger applies to *any* object with a callable `then`: a plain object literal, a config, a module's exports. "Don't name a method `then`" could be read as only about classes.
6. **The opposite case of rule 8.** If later steps need only the previous value, is the chain preferred? It's implied, not said.
7. **"Plain" depends on the container.** Arrays are plain in sentence 4 and the container in sentence 6. I followed it, but on a second pass, not the first.
8. **Is `Maybe` plain inside Result?** Presumably yes, since it's "not another Result". But after reading the promise paragraph I wondered whether every container type counts.
9. **The error-type union** (`BadId | NotFound`) that chaining produces isn't mentioned, though it's the most visible change in the types.

## 5. Clarity, voice and enjoyment

**Sentences I reread:**
- "Another Result needs a chaining operation that uses it directly, instead of putting it inside a second one." "Uses it directly" and "a second one" are both vague pronoun-heavy phrases. I had to rebuild it as "returns the step's Result instead of wrapping it in another Result."
- "Arrays do the same: …" I paused because the sentence before had just called arrays plain values.
- "Their `then` does both jobs: it maps a plain return value and unwraps a returned promise, including an object with a callable `then`." It's dense. "Including an object with a callable `then`" is the key fact, and it's tucked into a trailing clause.
- "Write the early returns too." For the ambiguity described above.

**Terms used without explanation:** "chaining operation" (unnamed for Result), "the promise contract", "language protocol", "plain value" (defined, but only negatively and only for Result). "Thenable" is described without the word, which I think is fine.

**Person or documentation?** Mostly a person.
- "Before admiring the chain", "The lovely complication is promises", "No registration required. You can join a language protocol just by choosing a method name." Those sound like Eli: a theorist who is a bit delighted by the language's oddity.
- The middle of paragraph 1 ("By plain, I mean not another Result when we're working in Result. An array counts as a plain value there.") reads like spec text or a definitions list. It's the least Eli-like stretch.
- "You may find those checks easier to follow" is hedged in a way that sounds like a style guide, not a professor with opinions.

**Enjoyment:** it's short enough that I never got bored.
- **Highest attention:** "The lovely complication is promises" through "just by choosing a method name." "No registration required" is the best line in the section: a joke that's also the real point.
- **Lowest:** sentences 3–5 of paragraph 1 (the "plain" definition and the unnamed chaining operation). That's where it turns into careful hedging and I was decoding, not reading.
- The last two sentences ("Don't name… / Give a different…") land cleanly but a bit flatly after the fun setup. A final punch about the consequence (a hang when the Maybe is empty) would pay off the "lovely complication".

**Scratch files** (all in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/`):
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/a_maybe.ts`
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/a_maybe_run.mjs`
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/a_maybe_fixed.ts`
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/b_containers.ts`
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/c_early_returns.ts`
- `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read3/p/out/b_containers.js` (compiled output)