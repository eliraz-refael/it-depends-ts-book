# Chapter 2 voice pass: change and review notes (Claude)

File: `book/01-the-type-system/02-type-assertions.md` in `/tmp/ts-book-ch1-2-pass`, branch `codex/chapters-1-2-voice-pass`.
- Baseline `49f9551`: SHA `ad2268fa2dc76c37472a1fbd0dd98d6c93ad8253440d584d88800ec5e1c95a4e`, 3,195 words.
- **Final: SHA `72f54bd21d65b8162484f67fc9f06855b7f2daa9713fff16bda6ee9f83ff8473`, 3,068 words.**
- All 17 fences, opening tags included, are byte-identical and in the same order (`cmp` on extraction). `git diff --check` is clean.
- Prose em-dashes: 45 → 27. No other file was edited.

Codex's full `npm run check` exited 0 on the unchanged example corpus: all 41 fences across Chapters 1–2 stayed unchanged throughout the pass. The suite ran while the final prose was still being polished, so this note makes no claim that it read one exact prose hash. The final prose and fence diff were verified on `72f54bd2` against the baseline. Codex independently probed both new inline compiler claims on 7.0.2:
- `const text: string = input` with `input: unknown` gives TS2322.
- A direct `Declared & {…}` assertion compiles.

I confirmed both in the scratchpad. The full TS2352 text for Cat→Dog does end "If this was intentional, convert the expression to 'unknown' first.", which Daniel now cites.

## Changes

**Principle**
- The opening callback is now Eli speaking, credited to the current Ch1: Noam's "localized lie" (Ch1 l.316) and Dima's "a value under a type that may be false" (Ch1 l.343). This replaces the narrator recap that put Noam's words in Dima's mouth.
- The Java/C# cast aside and the triple "not" are replaced by the concrete mechanism: an assertion changes the expression's type, converts nothing and checks nothing at runtime. (Codex request 2.)
- "Annotations protect you…" becomes the concrete contrast, because two readers didn't know what "annotation" referred to: `const text: string = input` is refused, and the assertion stops the compiler from asking.
- **Stated rule:** "write an assertion only where you can say what you know that the compiler can't check, and how you know it."
- The Turn restricts the rule, because knowledge true when written can expire. The verdict now states both halves.

**Narrator adjudication and rarity removed:** "closes the thread" and "Both Chen and Noam are correct", "concedes — barely", "for once he's not attacking anyone", "most sympathetic case", "has been waiting" ×2, "isn't having it", "seizes on", "the pattern everyone recognizes", the room-goes-quiet recap, "Everyone looks up", "everyone can guess", and Oded's scroll (Codex recommendation).

**Catchphrases removed:** "Let us return to first principles", "The compiler disagrees", Chen's "But have you considered" ×2, "There's an RFC for that" (not an RFC process), Eden's "I've seen this fail at scale", the "Show me the stack trace" epigraph, and the "wrong question / Let me ask a different one" frame (shared with the old Ch3).

**Continuity and fairness**
- **Eden** no longer restates Oded's Ch1 auth/payments/logging triage as his own. His new contribution is centralization: one client, one assertion per endpoint, each ticketed, so the work becomes "a list instead of a search". In the Turn, that client is also where on-call finds where the type came from.
- **Oded** no longer calls API assertions "necessary / what's the alternative". That reset his Ch1 acceptance of parsers. He now defends an endpoint "we haven't put a parser around yet", and Noam cites the parser Oded accepted. (Codex request 1.)
- **Daniel's double-assertion answer** (Codex request 3, plus the reader's point):
  - The diagnostic is quoted accurately: "neither … sufficiently overlaps".
  - Going through `unknown` passes each step but adds no evidence, and the value still has `meow`.
  - Oded's actual case, a return type that's too narrow, doesn't need the detour: a direct assertion to `Declared & {extra}` is to a subtype.
  - Oded accepts it: "One `&` and a comment…".
  - Daniel then says it's still an assertion, so the comment is the evidence, and that fixing the declaration or validating is better.
- **`!` section**
  - "this whole chapter" → "the whole meeting". The invented "ten times more casually" → "far more casually".
  - `Map.has`: Noam's `get`-and-check is the answer for Oded's code. Oded then sharpens it to a library that checks `has` and calls his handler with the key. Noam offers a re-check that throws. Oded: "That's a branch that can't run." Noam concedes `!` only if the library calls right after its check and nothing deletes the entry first, with a comment.
  - Daniel's "genuinely can't — Map.has is a real example" overclaim is gone; he now says "the proof lives where the compiler can't see it". Agreed with Codex.
- **Turn**
  - Gilad opens with the 3 AM question and keeps his concrete timeline and the stack-trace line.
  - He ends on "You knew it was true when you wrote it. How will you find out when it stops being true?"
  - Noam's universal "everything downstream is more dangerous" (Codex recommendation) is replaced by an answer that tests the Turn: a boundary parser names the response.
  - Eden adds the interim answer, and Gilad closes with the runbook.
- **Verdict**
  - The blockquote is limited to assertions "that override the compiler", which removes the clash with `as const` "always safe", and it combines the Principle's rule with the Turn's question.
  - The test-mock row now reflects both outcomes (factory plus named fields) instead of choosing Noam.
  - The `!` row reads "proof outside the compiler's view" instead of "narrowing impossible".
  - Checklist item 2 now asks "How will you find out".
  - The label "The Accepted Standard — a decision framework" → "Choosing an approach".

**Small fixes**
- "extra nine fields" → six; "twelve default values" → "the defaults".
- Linoy's duplicate "added in 4.9" is gone, and so is her "we'll get to that".
- Chen's first question now glosses `satisfies`.
- Linoy's palette repair says "keys and values".
- Chen's last Take is now an extension, not a meta-joke: if "how will I find out?" is answered by a check, you can usually narrow with that check.

**Kept on purpose:** the fixture-default dispute and its unrefereed close; "fake mustache"; "most dangerous character"; Noam's "This time you're lying"; the Oded/Gilad 3 AM closer (Ch4's twin should drop its rejoinder); and Linoy's "apology" joke. Two readers called some of these staged. Codex and I agree to keep them for this calibration rather than flatten every polished line.

## Reader evidence (Claude Opus 5.5 `general-purpose`, isolated snapshot copies)

- **Principle-only, draft 1 (`0c8d0879`):** quoted the rule and restated it without the scenario. It predicted the stale-knowledge limit the Turn supplies. It flagged "annotation" as unintroduced, which is now fixed.
- **Principle-only, fresh agent, v2 (`999fa05d`):** quoted the rule and restated it correctly. Its note was that the rule comes at the end of a short section after the mechanism example, which is the same shape as Ch3. I left it.
- **Full reader, with Ch1 and the cast as prerequisites, draft 1, then a targeted recheck of v2:** the callback is accurate, the fixture section is the best in the chapter, and the `Map` exchange is earned. Every v1 finding I accepted was confirmed repaired on recheck. The four leftovers it raised (dangling "Then", the stale Daniel paragraph, the checklist missing the verdict's question, the Turn ending without Gilad) are fixed in the final.

**Reader errors and deferrals, source-checked:**
- **"`const name` is declared twice and the block doesn't compile" (fence 16): true but pre-existing.** The harness deliberately compiles each form separately (`checks/chapters1-6.cases.cjs`, comment at the `optional-chaining-and-narrowing` case). The fence is frozen in this pass. Recorded as a code item for a later checked edit: rename to `name1`/`name2`/`name3`, or split the fence.
- **"Cat/Dog is a toy":** taste. The fence is frozen.
- "Parsers don't help `!` or fixtures": true, but the Turn is scoped to the boundary case. The checklist covers the rest.

## Open for the author

None of the findings are consequential. Calibration taste: how many polished one-liners to keep in Act I (see "Kept on purpose").
