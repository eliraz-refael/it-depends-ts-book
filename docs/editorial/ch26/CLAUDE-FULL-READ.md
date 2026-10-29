<!-- Verbatim report of an isolated full reader of Ch26 draft 1 (259d914), commissioned by Claude on 2026-10-28. It read only the chapter, rebuilt the repository state by state, and was asked about enjoyment. -->

# Full reader report (Ch26 draft 1)

**What I read:** only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-readers/full/CHAPTER.md`. I also grepped the cast bios for pronouns: Eden, Sahar and Guy are "he", which matches the page.

**Fixtures:** `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch26-readers/full/work/`. There is one directory per state: `s0` (before the PR), `s1`/`s1a`/`s1b`/`s1c`/`s1c2` (the PR and the opening probes), `s2`/`s2a`/`s2b` (draft fixture), `s3`/`s3a` (Paid | PreOrder), `s4`/`s4any`, `s5`/`s5any` (Equal), `s6`/`s6any` (wrong assignment), `s7` (flattening), `s8`/`s8any`/`s8wide` (Status assertion), `s9log` (draft logging), `s10` (`test/ship.types.ts`), `s11` (`type-tests`), `s12` (the Turn and the include fix), and `side` (JSON.parse claim). Each state has `package.json` `{"type":"module"}`, the page's tsconfig, and `node_modules/@types/node` symlinked. Commands: `tsc -p tsconfig.json` (TS 7.0.2) and `node --test` (Node 22.23.4). Node printed no ExperimentalWarning, and type stripping is on by default.

## Technical verification

| Line | Claim | Result | How |
|---|---|---|---|
| 21–58 | Before-PR repo compiles; runtime passes | Reproduced | s0: `tsc` exit 0; `node --test` 2 pass. Plain `node --test` finds `test/ship.test.ts`. |
| 17 | After the PR, the draft test still passes | Reproduced | s1: tsc 0, node 2 pass |
| 94 | Removing the directive gives TS2345 + "Property 'currency' is missing in type '{ id: string; status: "draft"; }' but required in type 'Draft'." | Reproduced, text exact | s1a |
| 102 | Paid signature, no directive: TS2322 `Type '"draft"' is not assignable to type '"paid"'.` | Reproduced, exact (col 20, on `status`) | s1b |
| 108 | Earlier version (no currency) + widened ship gives TS2578 | Reproduced, **ambiguous state** | s1c (only Draft loses currency): TS2578 only. s1c2 (currency gone everywhere): TS2578, plus TS2353 on the paid fixture unless the test file is also rolled back. The page says "that earlier version" but never says what it was. |
| 129 | Valid Draft fixture + `ship(Order)` gives TS2578 | Reproduced | s2 |
| 135 | Adding a required Draft field makes the fixture fail outside the directive | Reproduced | s2b: TS2741 on the declaration. While ship still takes Order, TS2578 also fires. |
| 137 | Paid-only passes; without the directive TS2741 "Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'." | Reproduced, exact | s2a |
| 158 | `Paid \| PreOrder` compiles; draft rejected; runtime ids correct; removing PreOrder fails the positive call | Reproduced | s3: tsc 0, node 3 pass. s3a: TS2741 paidAt missing in PreOrder. |
| 197 | `: any` return: assignment and admin caller both compile | Reproduced | s4any tsc 0 |
| 212 | Equal row assertion passes; with `any` gives TS2344 "Type 'false' does not satisfy the constraint 'true'." | Reproduced | s5, s5any |
| 226 | Wrong-assignment directive passes normally; with `any` gives TS2578 | Reproduced | s6, s6any |
| 245 | Flattening: Row gives TS2344; card still compiles and returns `Paid order o1`; assignment still passes | Reproduced | s7; `node --input-type=module -e 'import {paidCard}…'` printed `Paid order o1` |
| 260 | Status assertion passes before and after flattening; fails on `any` or widening | Reproduced | s8 (both shapes 0), s8any TS2344, s8wide TS2344. When widened, the plain assignment and admin.ts also fail. |
| 264 | Annotated `User[]` function returning `JSON.parse(raw)` passes an exact return-type test | Reproduced | `side/`: tsc 0; at runtime it returns the string `oops` |
| 278 | Logging in the draft callback prints `shipped: [ 'o2' ]`; the test passes | Reproduced | s9log. Under TAP (non-TTY) it prints `# shipped: [ 'o2' ]`; under spec it prints exactly as on the page. |
| 288 | Plain `node --test` executes `test/ship.types.ts` and records the draft | Reproduced | s10: it runs as `ok 2 - test/ship.types.ts`; my log printed `[ 'o2' ]`. **Unmentioned:** tsc also ignores this file, because `test/**/*.test.ts` doesn't match `ship.types.ts`. |
| 292–315 | Final runtime file + `type-tests/ship.types.ts`: both green | Reproduced | s11: tsc 0; `node --test test/ship.test.ts` 3 pass. Plain `node --test` doesn't discover `type-tests/` either. |
| 328 | `DeliberatelyWrong` passes `tsc` | Reproduced | s12 |
| 334 | `--listFilesOnly` lists the runtime test but not `type-tests/ship.types.ts` | Reproduced | `test-support/types.ts` isn't listed either, since nothing included imports it any more |
| 348 | After the include fix: both test files listed; TS2344; after deleting it, green | Reproduced | s12 |
| 356 | Widening to Order gives TS2578 in the new file; restoring gives green | Reproduced | s12 |
| 362 | `node --test type-tests/ship.types.ts` passes with the false assertion present | Reproduced | `ok 1 - type-tests/ship.types.ts`, exit 0 (it also runs `ship(draft)` at top level) |
| 284 | Node docs link | Not checked (offline) | |

**The compiler and runtime contradict nothing on the page.** The places where the page itself is inconsistent or unclear:

- **L266:** Guy says "*Keep* the runtime assertion for the card." No card assertion exists until L296, so it should read "Add".
- **L13–19:** speaker attribution breaks on page one. L15 "You changed `ship`… I wrote a test…" follows Oded's line with no new name, so by convention it reads as Oded. It has to be Noam (see L110, "I did see it fail"). L17 and L19 are also unattributed.
- **L108:** "that earlier version" is undefined. It's unclear whether Paid had currency or whether the test file is rolled back too.
- **L218–262:** the wrong assignment is added while Row is "temporarily" removed. At L232 only "the helper and the Row assertion" are restored, so a reader has to infer that the wrong assignment stayed until L262. Whether the helper ends up flattened is implied by L366, never stated.
- **L288–292:** it's unclear what exactly went into `test/ship.types.ts`, whether the logging moved with it, and when the logging was removed.
- **L301:** the final runtime test file and its imports are never shown. The reader has to assemble them (drop Draft, orderRow, Equal/Expect; add paidCard).
- **L247:** "He removed an ampersand." No `&` was in the source. The `&` disappeared from the inferred type. It's a nice line, but slightly untrue.

## Reader questions

**1. Would I keep reading after page one?** Yes. "It can't be green" is a good cold open, and "I can refresh it, but I don't think that'll help" sets up Oded quickly. I stumbled twice on page one, though. I couldn't tell who says L15. Then I hit three code blocks in a row (L23–75), including a tsconfig, before anything happens. The tsconfig is the Turn's planted clue, so it belongs, but it arrives as a wall.

**2. Where did I enjoy it?**
- L114: "I have accidentally passed two different tests with one comment." This is the chapter's best one-line summary.
- L133: "I have rarely been congratulated for breaking a build this enthusiastically."
- L247: "I let drafts ship and got green. He removed an ampersand and got red." and L249, "The comparison is stricter than the callers."
- L251: "Did you promise it would arrive attached to an intersection?"
- L282: "No courier. Just the fake's array. But our test of the forbidden call is making the forbidden call." This is the moment the chapter really lands.
- L330–332: "I suppose refreshing it still won't help." / "Don't." The callback pays off.
- L336: "We taught the runner to leave it alone. We haven't told the compiler where we put it."

**3. Where did I get bored, lost, or lose track of state?**
- L13–19: attribution.
- L108: an unstated historical state.
- L137–141: a temporary Paid-only probe sits between two permanent edits.
- L218–262: the temporary removals and restorations are the hardest stretch to track (Row out, wrong in, Row back, flatten, Row replaced, wrong deleted).
- L264: "a perfectly typed array that was a string in the conditional-types argument" means nothing without the earlier chapter, and the sentence is awkward.
- L288–301: the file shuffle is summarised rather than shown.

**4. Which scene would I retell?** "It shipped" (L268–284): the test named "can't ship a draft" passes while logging `shipped: [ 'o2' ]`. The Turn (a false `Expect<Equal<1,2>>` passing because the file isn't in `include`) comes a close second.

**5. Is the Turn earned or staged?** It's earned and fair. The include is shown at L73, and the move to `type-tests` is motivated by a real problem (L288–290). An experienced reader will probably see it coming the moment "type-tests" is named, so it's a mild surprise rather than a jolt.

There's a missed beat at L288. `test/ship.types.ts` was *already* invisible to tsc, and nobody noticed. Either acknowledge it ("and it wasn't being checked there either; we never looked") or have someone run tsc there, so the hole has already existed for one step.

**6. Does the Verdict follow, and is anything decided twice?** It follows. But L366–372 is four characters each re-reading their own scene's conclusion.
- Guy's orderRow line repeats what Sahar already settled at L262.
- Eden's "a file move needs both commands checked" repeats L358.

The Verdict also leaves one gap open. "Runtime gets its explicit file" fixes over-discovery by pinning a single filename, so the next runtime test file added under `test/` will silently not run. That is the Turn's bug, moved to the other command. Eden of all people should name it, or use a glob such as `node --test "test/**/*.test.ts"`.

L366 "keep… the admin caller" also leans on production code as a test. And it's never said whether the `expected` assignment kept in `type-tests` is the same "caller check" or a duplicate of it.

**7. Do the characters sound distinct?**
- Oded is the most alive, and his deadpan carries the jokes.
- Noam is good: precise ("It can't accept that object") and grudging ("All right. That catches it too").
- Guy has a real stake (the card) and concedes in character.
- Eden mostly gives terse lab instructions ("Delete the comment.", "Now put the old signature back"). He also explains results (L135, L358). His migration-veteran voice only shows at L290 and L336.
- Sahar's L195 and L216 are prompts that exist to make Noam do the next step. L360 is a tag line. His best moment is the in-character "Why are we assembling two objects to get two fields?" (L234).

**8. Where does the narration act like a manual?**
- L158 is a recap paragraph of four results.
- L212 explains what `Expect` does after the code shows it.
- L245 ("The card reads the id; the tests read the status…") pre-explains what Guy says at L249.
- L284 restates what Oded's L282 just demonstrated. The link is useful; the two sentences before it are redundant.
- L301 is the manual-style bookkeeping I mentioned above.
- L358 is Eden narrating the lesson in dialogue.

**9. Is the Principle a clear, testable rule?** The first paragraph is: break the claim, see it fail, undo it, see it pass, on add, change or move. That is testable, and the chapter enacts it well. The second paragraph is a five-item checklist that pre-announces three scenes: the valid fixture outside the suppression, `any` and assignment, and the runtime runner. It reads as a manual and spoils the "It shipped" scene.

The weakest sentence is "A positive assignment alone also accepts `any`." The "also" dangles, and the sentence lacks the subject it needs ("…also passes when the result is `any`"). A runner-up is "Test a forbidden operation on the inferred result, or compare the part of its type you mean to promise", which is hard to parse before the reader has seen the scenes.

**10. What would I use at work, and what's still unclear?**

I'd use:
- the mutation habit for type tests;
- valid fixtures built outside `@ts-expect-error`;
- the fact that `node --test` executes type-test files under type stripping and discovers anything under `test/`;
- `tsc --listFilesOnly` to check coverage;
- the fact that an Equal-style check rejects `{a}&{b}` against `{a;b}`.

Still unclear:
- Why the Equal trick works. It's presented as a magic incantation.
- Whether to use expect-type or tsd instead.
- The trade-off of an explicit runtime file list.
- Whether the final `const expected` assignment is still pulling its weight.

**11. Top five changes, ranked**
1. **Fix the L13–19 attribution.** Name Noam on L15 and whoever speaks L17/L19. This is the first page.
2. **Close the runtime-command hole in the Verdict.** Either use a glob, or have Eden say that a single explicit file is the same mistake the Turn just caught. Also acknowledge that `test/ship.types.ts` at L288 was already excluded from tsc.
3. **Fix L266** ("Keep" should be "Add") and either cut L264's cross-chapter reference or make it self-contained.
4. **Simplify the orderRow state dance (L218–262).** Show the final `test/ship.test.ts` in full, and say explicitly what's temporary and that the flattened helper stays. Also define "that earlier version" at L108.
5. **Trim the explaining.** Cut the narration recaps at L158, L212, L245 and L284, and Eden's L358. Compress the Verdict so it doesn't re-decide orderRow. Shorten the Principle's second paragraph so it doesn't pre-announce the fixture, `any` and runner scenes.
