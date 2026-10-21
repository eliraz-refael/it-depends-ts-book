# Ch6 "The Hole in the Function": first-time reader report

I read only `ch6-full.md`. I write TypeScript for a living and assume I've read Ch1–5.

## 1. The rule

**Where it's first stated:** line 20, Eli: "Use a type parameter when a caller needs a relationship between types in the signature. Ask what supplies the type argument and what depends on it. If nothing else depends on it, try removing it." It comes up front, it's explicit, and I could apply it mechanically. For each type parameter I find its source (inferred from an argument, or written by the caller) and the other positions that use it. If it shows up in only one position, it's suspect.

**Testable?** Mostly. The removal half ("nothing else depends on it, try removing it") is a check I could run in code review. The second failure mode is not in the Principle: a return-only `T` that the caller supplies is an unchecked assertion. "Ask what supplies the type argument" hints at it, but the assertion idea first shows up with `querySelector` (line 111) and only becomes a rule in the Verdict.

**Does the Verdict match?** Partly. The Verdict (line 323) says: "A return-only parameter supplied by the caller **may be** an unchecked assertion; a parameter that affects nothing else **may be** unnecessary." It hedges twice, so it's weaker than the Principle's "try removing it." A caller-supplied return-only `T` is *always* an unchecked claim. The real question is whether the claim is bounded and justified. The Verdict also adds the assertion clause, which the Principle never stated. My suggestion: put both failure modes in the Principle, and have the Verdict state them without "may."

## 2. Stumbles

**Sentences I reread**
- Line 80: "`JSON.stringify(undefined)` returns `undefined`, although the library declares `string`. This annotation includes that missing case." I stopped to work out why we were talking about `JSON.stringify` at all. It defends an unusual return annotation that has nothing to do with the point (that `T` is single-use). "This annotation includes that missing case" is awkward. The fix is to make `logPayload` return `void` and drop the stringify line.
- Line 104 vs 109: the code comment says "T appears only in the return", then the prose says "The DOM lib calls the parameter `E`. In this overload it appears in the return type." That's two names for one thing, and the prose drops the word "only," which is the whole point. Call it `E` in the comment and say "only in the return type."
- Line 115, Oded: "The brackets aren't doing nothing, though. They change the result type." Nobody said they were doing nothing. Daniel had just made that point himself ("Don't turn it into a search-and-delete rule yet"). The section then ends on this line with no reply, so it reads like Oded is answering an objection nobody raised.
- Line 171, Daniel: "Keep this use of `extends` in mind. In conditional types … it asks whether a type is assignable, instead of requiring it as a constraint." "Keep this use in mind" points at one meaning of `extends`, then the sentence describes the other meaning. Nobody asked about this. It's a forward reference dropped into the scene.
- Line 179, Linoy: "You don't have to supply **those types** at every call." Which types? She has just "added a second type parameter," but the reader hasn't seen the code yet.
- Line 226, Linoy: "You still wouldn't make callers write **both arguments** to `get`." I read that as the value arguments (`obj`, `key`) and got confused. It should be "both type arguments."
- Line 264, Idan answering "Where would you look?": "At what the function returns." By the chapter's own rule, the answer is *where the return's `T` comes from*. Her next sentences ("`lastItem` gets its `T` from the input array") are about sources, so the first sentence points in the wrong direction.
- Line 305–309, the lens metaphor. I had to map it out: lens = generic, scene = type argument, glass shape = relationship, photograph = concrete function. It works on a second read. "It does not have to admit a scene it will never see" is the sentence I reread twice.
- Line 319: the line "Then you and Noam still have a review to finish…" has no speaker. I assumed Liron, but it could be Dima, who handled the timing question earlier.

**Terms used before they're explained**
- "type argument" vs "type parameter": both appear from line 18 on. The distinction is only implied by "we supplied `User`." A working dev will cope, but one sentence would help.
- "single-use check" (line 299) is used as if it had a name already. Before that it appears only as a section heading.
- "overload" (line 109) is fine for my level.

**TypeScript claims I doubt or would verify**
- **I know:** `firstItem<T>(items: T[]): T | null { return items.length > 0 ? items[0] : null; }` fails under `noUncheckedIndexedAccess`, because `items[0]` is `T | undefined` there, which isn't assignable to `T | null`. Many strict codebases turn that flag on. `lastItem` in the same chapter returns `T | undefined`, so the chapter is inconsistent about the empty case anyway. Changing `firstItem` to `T | undefined` with `return items[0];` fixes both problems.
- **I believe:** the error text at lines 192–193 lists the union as `'"fontSize" | "telemetry" | "theme"'`. On TS 5.x I'd expect declaration order, `"theme" | "fontSize" | "telemetry"`. The alphabetical order may come from TS 7's deterministic type ordering. Worth checking against whatever version the book claims to target. Otherwise readers on 5.x will see different text.
- **I believe:** the `NoInfer` take (line 362), `setDefault<T>(values: T[], fallback: NoInfer<T>)`, is correct but hard to reproduce. With an unconstrained `T`, string literals in `values` widen to `string` anyway, so a reader who tries `setDefault(["a","b"], "c")` sees no difference with or without `NoInfer`. The effect shows up with a constraint (`T extends string`) or with a subtype/supertype pair (a `Dog[]` with an `Animal` fallback). A version with a constraint would make the take something a reader can try.
- **I believe (minor):** `const name = firstItem(names)` at top level clashes with lib.dom's global `declare const name: void` *if* the snippet is compiled as a script rather than a module. That's harmless if the snippets are checked as modules.
- **I know these are correct:** `identity("hello")` infers `"hello"`; `createStore(null)` infers `T = null` under strictNullChecks, with exactly that error text; `querySelector<E extends Element = Element>(selectors: string): E | null` is the real overload and its parameter really is `E`; the `in` plus `typeof data.retries` narrowing in `parseRetryConfig` compiles on 4.9+; `pluck` returns `string[]`; the `const T extends readonly string[]` take infers the readonly tuple.

**Conceptual gap (the biggest stumble)**
Daniel shows `querySelector<HTMLInputElement>` as "everywhere, and it works." Then he calls `parseConfig<T>` "the return-only case I would reject," and the Verdict labels `loadState<T>` "Danger: the anti-pattern." All three have the same shape: a caller-supplied `T` that appears only in the return. The chapter never says why one is tolerable and the others aren't. The difference I'd expect:
- `E extends Element` bounds `querySelector`'s claim, and the DOM guarantees the result is *some* `Element` or `null`. That makes it a downcast within a checked supertype, like `as HTMLInputElement`.
- `parseConfig` and `loadState` go from `any` to an unbounded `T`, with no supertype guarantee at all.

The table row "Treat it as a typed assertion — justify it like an `as`" applies equally to both, so `loadState` being labelled the anti-pattern looks arbitrary.

## 3. Voice

- **Code comments acting as narrator.** "// Better: the element type survives the round trip" (43), "// Honest: returns exactly what it has" (267), "// Honest: produces the T — or tells you why it couldn't" (272), "// The rule, visibly working: every position tied to another." (342), and "// Danger: the anti-pattern. T exits everywhere and enters nowhere." (351). These score the code for the reader. The last one is also inaccurate: `T` appears once, so it doesn't "exit everywhere." It reads like a slogan.
- **Lesson-explaining or verdict lines inside the dialogue:**
  - Dima, line 61: "So you agree about what the generic does. You disagree about when to introduce it." This is a little too neat, but Oded's comeback ("Which is the part that comes up in my PRs.") saves it.
  - Liron, line 315: "You are right to ask — the image only gets us so far." This is a character grading another character's question.
- **Catchphrase-ish lines:** Linoy's "My favorite three lines:" and "That's the part I like." are mild and acceptable. "Finally. A refactor that deletes something." (Oded) is good, because it's in character.
- **"Yes." openers:**
  - Oded "Yes. Then we need it." (57) answers a yes/no question, so it's fine.
  - Daniel "Yes. `querySelector<…>`…" (113) is okay.
  - Daniel "Yes. `JSON.parse` returns `any`…" (258) answers Idan's imperative "Delete the cast, Daniel." You don't say "Yes" to a command. Better would be "It still compiles" or just doing it.

  Add Eden's "No." (228) and four of roughly 35 replies open with a bare yes/no. It isn't a pervasive tic, but 258 stands out.
- **Answering something not said:**
  - Oded, line 115 (above).
  - Linoy, line 226: "That's the return type you publish, though…" bridges back from Eden's aside about export return types. Eden's "No. The object and key tell it enough. The store's first value didn't." then re-summarises the section. The whole exchange exists to get back on topic after the digression.
- **Narration itself** ("projects a function onto the screen," "He opens the DOM declarations," "Liron looks back at Eli's first example") is neutral stage direction. That's good.

## 4. Fairness

**Oded ("concrete until the second caller")** gets real arguments:
- "If the only caller passes strings, you could have written `string[]` and gone home." This correctly points out that Noam's `unknown[]` baseline is a strawman; nobody proposed it.
- "You're choosing `name` as the shared contract before we know what the vendor list needs. It might use `displayName`, or need a different tie-break." This is the strongest line in the chapter: a premature abstraction picks the wrong seam.
- "I know where to look when payroll calls." This is about how easy the code is to find, which is fair.

**Missing for Oded:** his strongest competent argument. Going from concrete to generic later is usually *non-breaking* for callers that rely on inference. `sortEmployees(team)` keeps compiling after you change the signature to `sortByName<T extends {name: string}>`. So waiting costs almost nothing. Nobody says this, and it's the argument that would make "wait" a position rather than a preference.

**Noam ("write the generic now")** gets "The constraint describes what this body reads. It doesn't promise to sort every future list." That's good. His other main line is weak: "We don't need to wait for a second caller to write three lines correctly." "Correctly" implies the `string[]` version is incorrect, which it isn't, and the line asserts rather than argues.

**Missing for Noam:**
- A minimal constraint makes the function testable with `{ name: "x" }` fixtures, without building a full `Employee`.
- A concrete `sortEmployees` invites a copy-pasted `sortVendors` instead of a refactor. The second caller often never "arrives" in Oded's sense; someone just duplicates the function.

Either of these would beat "three lines correctly."

**Is the ending honest?** Yes. The Verdict's "The relationship test does not decide that timing question" and the Turn's "The signature alone does not tell us whether you needed the generic" are honest about what stays open. What's settled (parameter-only `T` is removable; an unbounded `T` from `any` is a lie) is stated clearly. One unsettled point is treated as settled without being argued: why `querySelector` is acceptable while `loadState` is not (see §2).

## 5. Cover-the-names test

| Line | Guess | Result |
|---|---|---|
| "Finally. A refactor that deletes something." | Oded | Pass |
| "The constraint describes what this body reads. It doesn't promise to sort every future list." | Noam | Pass |
| "Search the callers before removing it. `logPayload<Something>(p)` would need changing." | Eden (migration caution) | Pass (Oded is possible) |
| "Now I can't even find the unchecked claim by searching for `as`." | Idan, Noam or Daniel | Weak |
| "Those using inference still work. This function has no reason to offer a type argument." | Anyone | Fail |
| "That's the return type you publish, though. You still wouldn't make callers write both arguments to `get`." | Anyone | Fail. Linoy has no release-tracking flavour in the main debate; that only shows up in Additional Takes. |

## 6. Repetition and density

**Said more than once**
- **The timing question is restated three times:** Dima (61), the Turn (319), and the Verdict paragraph (325). Each instance is attached to a different example, but by the third it reads as a conclusion being repeated.
- **"An `unknown` return would lose that information"** (Principle, 18) comes back almost word for word from Liron (315): "carrying information that an `unknown` return would lose."
- **`loadState` (351) repeats `parseConfig`-without-cast (252–258).** Its comment, "any → T: no relationship, no evidence — and no cast required," repeats Idan's line 260. The Verdict code block adds no new information.
- **Linoy's prose at 196** ("`fontSize` gives `number`, `theme` gives `string`. And `fontsize` is rejected…") repeats the code comments two lines above.
- **Two forward references to conditional or computed types:** Daniel (171) and Eli's Additional Take (366). One is enough.

**What I'd cut**
- The `JSON.stringify(undefined)` digression (80). Make `logPayload` return `void`.
- Daniel's conditional-types aside (171).
- Eden's explicit-return-type paragraph (224), the Linoy/Eden bridge after it (226–228), and the matching clause in the table's last row ("Explicit return annotations are a separate choice…"). It's a separate topic that doesn't involve generics.
- The `loadState` block, or replace it with something that teaches the bounded-vs-unbounded distinction.

## 7. Verdict and Additional Takes

**The Verdict sentence** is accurate but hedged (see §1).

**The Accepted Standard table** is mostly good:
- Row 2, "appears only as a parameter type and affects nothing else," is clear enough.
- Row 5 (`querySelector` style) and the `loadState` code beneath the table contradict each other in tone: one says "justify it," the other says "anti-pattern," with no criterion separating them.
- The last row drifts into return annotations.

**Verdict code:** `pluck` is correct (`T[K][]`, `string[]` for `"department"`). `loadState` compiles as described. See §6 for why the block is redundant.

**Additional Takes**
- **Linoy, `const T extends readonly string[]` (5.0):** a new application (controlling literal inference) and correct. Keep it.
- **Linoy, `NoInfer<T>` (5.4):** a new limit (stopping one argument from choosing `T`). The signature has no return type or body, which is fine inline. As written the effect is hard to reproduce (see §2). Add `T extends string`, or use a subtype example.
- **Idan, `parseWith<T>(input, parse: (value: unknown) => ParseResult<T>): ParseResult<T>`:** the best take. It shows the *honest* version of the generic parser, where `T` comes from evidence the caller passes in. That directly resolves "Generics that lie." It's new, not a replay. It might note that `JSON.parse` can throw, so `parseWith` needs a try/catch, but that's optional.
- **Eli, "We can also compute with that type variable…":** a teaser for later chapters, not a limit or an application. It's acceptable as a closing pointer if Daniel's line 171 is cut. Otherwise it duplicates that line.

## 8. Top 5 changes, ranked

1. **Explain why `querySelector<E>` is tolerable and `parseConfig`/`loadState` are rejected.** One or two sentences from Daniel at "Here is the return-only case I would reject": `E extends Element` bounds the claim, and the DOM guarantees an `Element | null`, so it's a checked-supertype downcast. `parseConfig` goes from `any` to an unbounded `T`. Then align the table row and the `loadState` comment with that criterion. Without this, the assertion half of the rule looks arbitrary.
2. **Give each side its strongest argument.**
   - Oded: generalizing later is non-breaking for callers that rely on inference, so waiting is nearly free.
   - Noam: a minimal constraint is testable with small fixtures and prevents a duplicated `sortVendors`.

   Replace Noam's "three lines correctly."
3. **Cut the digressions:** the `JSON.stringify` aside (make `logPayload` `void`), Daniel's conditional-`extends` aside, Eden's export-return-type paragraph with its bridge and table clause, and the redundant `loadState` block. Also drop Linoy's prose that repeats the code comments.
4. **Make the Principle and the Verdict say the same testable thing without "may":**
   - a `T` used in one parameter position only should be removed (use `unknown` or the concrete type);
   - a caller-supplied `T` that appears only in the return is an assertion: bound and justify it, or replace it with `unknown` plus a parser.

   Put the assertion clause in the Principle, not only in the Verdict. Remove the scoring code comments ("Better:", "Honest:", "The rule, visibly working", "Danger: the anti-pattern. T exits everywhere and enters nowhere").
5. **Small fixes:**
   - `firstItem` should return `T | undefined` via `return items[0]`. That survives `noUncheckedIndexedAccess` and matches `lastItem`.
   - "both arguments" → "both type arguments" (226).
   - Give a speaker to the Turn's last line (319).
   - Use `E` and "only" in the `querySelector` comment.
   - Cut or rewrite Oded's line 115, which answers nothing.
   - Daniel's "Yes." in reply to "Delete the cast" (258) should become a reaction to the code.
   - Check the union order in the `get` error message against TS 5.x.
   - Give the `NoInfer` example a constraint so readers can reproduce it.
