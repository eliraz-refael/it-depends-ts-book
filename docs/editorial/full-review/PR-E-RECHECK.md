<!-- Fresh Opus diff, continuity and technical recheck of draft eb2fc97, 2026-11-03. -->

# PR E recheck

Scope: I read book.diff, the full new/ text of Ch24–27 and Bonuses 1–3, the plan and its Settlement, PR-E-REVIEW and CONSOLIDATED. I diffed old/checks against new/checks and ran all seven affected suites against the worktree, which matches new/ byte for byte and sits at eb2fc97. I used TMPDIR under probes/, and all seven pass. I also ran TS 7.0.2 and Node 22.23.4 probes under probes/. I edited nothing outside probes/.

## Must fix

1. **Bonus 2 :180 takes Guy's joke.** The narrator now ends with "The ledger still prints dollars." and Guy's next line (:182) is "Still dollars." The plan protects that beat ("Both 'still dollars' and 'For Bob' stay"), and the narrator now delivers it first. Restore the old wording: "With `description.ts` removed, the client sends `outgoing`. Gilad's fresh replay returns `{…}`. The ledger prints the same dollar entry."

2. **Bonus 3 :243–245: the folded take changes what Oded concedes.** Eden's line now ends "…Narrowing a parameter can break a caller elsewhere that still passes a `string`, too. A search here won't find it." Oded answers "Fine. That is a caller I hadn't checked." That now reads as conceding the hypothetical string-passing caller, not the mobile adapter on the page. Keep :243 as it was and put the take after Oded's line, still spoken by Eden:
   > **Eden**: "The app relies on those three states. We don't get to widen its return because this repo's badge found a fallback."
   > **Oded**: "Fine. That is a caller I hadn't checked."
   > **Eden**: "Parameters break the other way. Narrow one, and a caller elsewhere that still passes a `string` fails. A search here won't find it."
   > Eden sets the copied adapter aside.

   This adds about six words, so the chapter stays well within 5%.

## Should fix

**Departures not recorded in PR-E-REVIEW.md**

3. **Ch26 :23: the project note went somewhere the plan didn't say.** The plan said "At :77 put project settings beside the config." The draft put `// Project: TypeScript 7.0.2, Node 22.23.4; package.json has "type": "module".` inside the `src/orders.ts — before the PR` fence, about 55 lines before the config. The review mentions only the extraction change, not the move. Either record it, or put the facts in Noam's line at :74: "Same check as CI: `tsc -p tsconfig.json`, TypeScript 7.0.2. Runtime is `node --test`, Node 22.23.4, and the package is `"type": "module"`. Here's the config." That second option needs the chapter26.cjs `rootMode` and version extraction moved back to the manuscript.

4. **Ch27 :111: the guess went to a different speaker than the Settlement named.** Settlement 2 says "give the preceding speaker one short guess." The preceding speaker is Daniel (:107), but the guess went to Oded. Oded is arguably the better choice, since it's his PR and he has a stake, so I'd keep it. It still needs a line in the review.

5. **Bonus 3 :213: the fold doubles itself and drops a sentence.** Daniel now says "An identical import line doesn't tell me whether `Order` still means the same thing. If an exported alias uses `typeof`, follow it to the value too. An unchanged alias line can acquire a different meaning." The first and last sentences make the same point. Cut the last one: "…still means the same thing. If an exported alias uses `typeof`, I follow it to the value too." The take's closing sentence ("The declaration report is there to show you what the compiler made of the whole change.") was dropped without a record. Cutting it is fine; record it.

**Accuracy and clarity**

6. **Bonus 2 :5: Liron's Principle gets the order of check and effect wrong, and repeats his later take.** "…then check the effect against the permission it found" reads as checking after the effect. The Verdict (:356) and the plan say permission comes before the effect. Also, "A description tells a caller how to ask. Copying that description doesn't copy the executor's knowledge…" nearly repeats his own Additional Take at :370 ("A description is useful to the caller. It isn't everything the executor knows."). Proposed, about 70 words: "Treat a valid tool call as a proposal until its executor has established permission to act. Anyone can be handed the description; the authority stays with the operation. I want it to take the customer from the host's authenticated context and the facts from its own records, and to establish permission before it changes anything. A more accurate description helps the caller ask. It doesn't perform that check."

7. **Bonus 2 :84: the colon points at the wrong file.** "The client sends the assistant this handwritten description:" is followed by a fence that opens with `// calls.ts` (ownCall, friendCall, friendReply); `description.ts` comes second. Name the file: "The client sends the assistant the handwritten description in `description.ts`:"

8. **Bonus 2 :134: "default output required" is easy to misread.** `// For initial Refund, default output required: [...]` can be read as "the output that has a default." Suggested: `// Initial Refund, Zod's default (output) mode: required ["orderId","cents","currency"]`, with the check regex updated to match. Inside the generic `defineTool`, the "For initial Refund" label is what keeps the comment true, so keep it.

9. **Ch24 :140: Daniel blames the wrong person.** "You omitted `strict`" is said to Noam, but the config is the repository's, and Eden opened it at :17. Suggested: "The config doesn't set `strict`; TypeScript 7 defaults it to true. Checking this file exposes its untyped parameter too."

10. **Ch24 :199 and :322: the exception list is only implied.** "Eden lists owners for `lookup.js` and `sum.js`…" no longer says they go on the exception list, so "already on the exception list" (:201) and "Those three" (:203) rely on inference. Suggested: "Eden adds `lookup.js` and `sum.js` to the exception list with their owners, and puts `// @ts-nocheck` in each." Separately, at :322, "Include the backfill instead of copying it separately" is ambiguous; it could mean include it in the PR. Suggested: "Add the backfill to the compiler's inputs instead of copying it separately."

11. **Ch25 :284: an intention became a flat claim.** "the release build won't emit them" now asserts something; the old line, "I'm not asking the release build to emit them," stated what Linoy intends. On this branch the release build would actually reject the `.ts` imports, and `rewriteRelativeImportExtensions` exists. Restore: "This noEmit check allows them. I'm not asking the release build to emit them."

12. **Ch27 :277: "a large share" of what?** "puts a large share under mapTypeEx" needs "of the CPU samples". Also, at :269, "Through the relation event's checker ID" should be "Through a relation event's checker ID", since no single event was introduced.

13. **Ch26 :398: "Oded tries Order" is too terse.** Suggested: "Oded widens the parameter to Order: TS2578 at the moved draft directive. Back to `Paid | PreOrder`: green."

**The new Verdict rulings repeat the scene's own lines**

14. Two rulings say in advance what a character says a few lines later.
    - **Bonus 1 :342** "…not merely because a returned implementation fails it" anticipates Dima at :368 ("'this implementation fails it' isn't, by itself, a reason to change it"). Suggested ruling: "> The owner of the requirement supplies the acceptance contract and decides when it changes."
    - **Ch27 :301** "name the lost guarantee and its owner" repeats Noam at :313. Shorten Noam's line to "And if we ever do drop a check, don't call it equivalent." That keeps the setup for the title change.

    Separately, Bonuses 1–3 use blockquotes for assistant requests and transcripts, and in Bonus 1 the ruling blockquote sits directly above a request blockquote (:342 and :348). The extraction had to be special-cased for this. The format is book-wide, so this is only a note for print styling.

15. **Bonus 1 check: the new selector is slightly looser.** It matches requests by hard-coded openings, so any extra blockquote is now ignored silently; the old check failed on it. To keep the old strength, assert that the only non-request blockquote is the one directly under `## The Verdict`.

## Verified

- **Scope.** Only the seven chapter files changed in book/. The 82 fences (12/13/17/10/11/9/10) keep the same count and order, and their content is identical apart from the added Ch26 and Bonus 2 comment lines. In the checks, only README, bonus1, bonus2 and chapters 25–27 changed. CONSOLIDATED.md is byte-identical, including the refuted list.
- **Lengths.** These match PR-E-REVIEW: Ch24 −5.4%, Ch25 −9.4%, Ch26 −9.3%, Ch27 −6.9%, B1 +1.5%, B2 −3.6%, B3 −3.7%. The misses on the Ch25/26 targets and on Liron's 72-word Principle are recorded.
- **Protected passages.**
  - Ch24 :185/:187: the `@ts-check` and global `checkJs` proposals are unchanged.
  - Ch25: the TS2741 fence block (:111–113) is byte-identical to the old text (same md5 with context).
  - Bonus 3 :388–396: the isolatedDeclarations account is unchanged apart from the link moving into narration, and the section still ends on "Exactly." A probe on TS 7.0.2 confirms TS9007 on an unannotated function, allowed trivial `const` exports, and `: string` satisfying the flag.
- **Bonus 3 structure.**
  - Both takes are now dialogue from their original speakers, Daniel at :213 and Eden at :243. See items 2 and 5.
  - The Additional Takes heading is gone, and the headings are Principle, Debate, Turn, Verdict.
  - The file ends exactly on `**Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."` followed by a newline, with nothing after it.
  - Net change is −3.7%.
- **Catchphrases** (bios excluded):
  - "I've seen this fail at scale" appears once, Eden at Ch24:268. It answers Noam's sitemap finding at :266, has no gloss, and his next sentence turns to the caller.
  - "What does the data say" appears once, Gil at Ch27:113. It answers Oded's unmeasured guess, and the table at :168–173 supports Gil's new "key enumeration alone cost little" (Key row: 0.016s against 1.481s).
- **Removed material.** I grepped for removed terms and callbacks ("three questions", laptop, "both files open", congratulations, "That's accurate", "distinction arriving", `description.ts`, `refundIssued`, "stray"). Every fact cut from a Principle (allowJs/checkJs, excluded files, noImplicitAny, the directive and `any` traps, the customer-ID fallacy, `refundIssued`, the alias warning) still appears in a scene. "Stray money copy" (Ch25:320) is set up at :135–139. No later step depends on a missing one.
- **Technical claims checked.**
  - TS 7.0.2 defaults `strict` to true: TS7006 appears with `strict` unset, and the `strict-default-control` check covers it.
  - TS2349's second line is "…has no call signatures", which matches Noam's paraphrase.
  - Node 22.23.4 `node --test --test-reporter=spec` with no arguments finds `test/*.test.ts` and prints `shipped: [ 'o2' ]`.
  - The type-stripping, composite/declaration, allowImportingTsExtensions-with-noEmit and symlink-realpath statements are accurate.
  - The Zod input/output required lists are asserted against real Zod 4.6.6 output (now from the printed comments), and the Zod citation is scoped correctly.
- **Links.** None is inside dialogue and none is link-only. The five in scope:
  - Ch26:289, Node type stripping
  - Ch27:277, pinned mapTypeEx
  - B1:103, interface merging
  - B2:157, Zod io
  - B3:388, isolatedDeclarations

  Elsewhere in the book: Ch3 interface-vs-type:84, conditional-types:229, declaration-merging:66, branded-types:224. The URLs match the plan's footnote inventory.
- **Extraction.** Every moved checked fact is still checked:
  - Ch25: the module mode now comes from Dima's line, and the cleanup check is now three assertions.
  - Ch26: the mode and versions come from the fence comment, and the history and logging sentences are matched exactly.
  - Ch27: the bench config label.
  - Bonus 2: the required lists are compared with Zod's actual output, and the project flags are now scoped to the contract.ts comment, which is stricter than before.
  - Ch24: diagnostics are still matched against the spoken quotes.

  Apart from item 15, no assertion is weaker. All seven suites pass.
- **Pronouns.** Idan is she (Ch25 :124 and :218, B1 :232), Dafna is she, Linoy is she. Eden, Gil, Dima, Oded, Noam, Chen and Daniel are he. All match the bios.
- **Settlement.** Gilad's first sentence has no question mark. Sahar doesn't echo Ch19. Oded's Ch26 congratulation is replaced. Daniel's Ch20/24/27/B3 Principles each open and close differently. Every Verdict leads with a ruling, the cold opens are intact, and the protected jokes remain: refresh/"I was finished", furniture, "For Bob", two words, fifteen dollars.
