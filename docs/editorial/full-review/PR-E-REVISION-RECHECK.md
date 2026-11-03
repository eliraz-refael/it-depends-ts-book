<!-- Fresh Opus recheck of revision 596be08 against PR-E-REVISION.md, 2026-11-03. -->

# PR E revision recheck

**Verdict: ready after a polish round.** Every Must fix and Should fix item was applied or recorded as a departure, and nothing technical is wrong. All seven suites pass on TypeScript 7.0.2 and Node 22.23.4, and none of the changed checks is weaker. Four things are left: Bonus 3's new Principle still gives away the inference discovery, Ch26's results now repeat "the check passes", Bonus 2's Principle repeats its own Verdict, and Bonus 3's Verdict opens the same way as its Principle. The rest is small wording.

## Remaining items

1. **Bonus 3 Principle still gives away the discovery (Must fix 3, applied badly).** `rev/book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md:5`: "An annotation is only one way to publish a promise. Inference publishes one too, whether or not the author thought to mention it." It doesn't name `string`, but it explains the mechanism. That spoils Oded's "We didn't write `string` anywhere" (:215) and "No *written* public API changes" (:221), which the brief said must land as a discovery. It also gives away Eden's explicit-return argument. The opening "When a patch says…, believe…" has the same shape as Daniel's Ch27 "If a type change is supposed to…, time…", and both tell you to compare output before and after. Proposed (about 45 words): "A patch summary is its author's opinion of what changed. The declarations are the compiler's. Emit them before and after and read the difference, following every type they refer to. Where the two opinions differ, the summary doesn't get a vote."

2. **Ch26 replaced the fragments with a new repeated phrase (Must fix 1, "vary the shape").** "The check passes" or a close variant appears at `rev/book/04-the-real-world/03-testing-typed-code.md:144, 146, 165, 237, 265, 390, 402` (plus "green again" at :398). Two neighbouring lines also repeat each other: :144 "The check passes with the directive." and :146 "With the comment back, the check passes." :390 and :402 have the same shape, and so do :265 and :402 ("although `expected` and the … still compile"). Proposed:
   - :144: "I'll try the paid-only parameter first. Without the directive, I get TS2741:" (keep the message).
   - :146: "It's missing paidAt this time, but it's still a valid Draft being refused. Comment's back; we're green."
   - :237: "…then restores Row, and the file compiles cleanly."
   - :402: "…still compile. Without the annotation, everything compiles again."

3. **Bonus 2's Principle now repeats its Verdict.** `rev/book/05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md:5` ends "The executor must decide whether to say yes before it changes anything." That echoes the Verdict at :358 ("The executor must establish permission before acting") and repeats the Principle's own first sentence. Proposed: "Treat a valid tool call as a proposal until its executor has established permission to act. A description teaches the caller how to ask. It can make a request intelligible; it can't make it permissible." The ordering stays in the first sentence. This also clears his Additional Take at :372.

4. **Bonus 3's Verdict opens the same way as its Principle and Bonus 1's Verdict.** :404 "When a patch makes a type error disappear…" follows the Principle's "When a patch says…" (:5) and Bonus 1's "When two implementations pass…" (`01-prompting-for-typescript.md:344`). Proposed for :404: "> Before accepting a repair that makes a type error disappear, find what the error was protecting. A fix that changes the contract is a contract decision, not a type-error repair."

5. **Ch25 setup puts a reference before what it refers to (introduced by the :15 trim).** `rev/book/04-the-real-world/02-monorepo-type-sharing.md:15`: Dima's "The links stay here." comes before the narrator introduces the links (:17). Lines :17 and :19 are also two narrator lines in a row. Proposed :15: "Node runs the built API. The release job copies it and its packages into an image. The workspace links stay in the checkout." That also plants the Principle's "checkout". In the Principle (:5), "When the two disagree" has no clear antecedent. Use "When the rehearsal and the release disagree, keep the failing setup intact until someone can say why."

6. **Act IV Principles share an opening.** Ch24 "An unchanged caller must still work…", Ch25 "A release check runs…" (new) and Ch26 "A test must fail…" give three chapters in a row the shape "A(n) [noun] must/runs…", and Ch24 and Ch26 are both "A(n) X must". The cheapest fix is the new one, Ch25 :5: "Check a release where it will run: the program we ship, from the place it ships. Anything else is a rehearsal. When the rehearsal and the release disagree, keep the failing setup intact until someone can say why. At 3 AM nobody is running your checkout." This doesn't spoil the Turn any more than the brief's own version does.

7. **Ch27's moved comment has awkward punctuation and sits in the wrong file.** `rev/book/04-the-real-world/04-performance-vs-safety.md:131–132`: "…as one-line const messages = … as const;, … and export {};." Because the comment sits in `tools/workload.mjs`, the imperative "Build bench/case.ts" also implies that this file writes `case.ts`. It doesn't: `workload()` only returns data. The check only extracts :133 (the `bench/tsconfig.json` line), so the other two lines can be reworded freely. Proposed:
   `// bench/case.ts is assembled from this workload: the catalogue as one line`
   `// (const messages = … as const), the required helpers, the declared signature,`
   `// the calls, then export {}.`
   Optional, at :151–153: "three times per version" should be "per signature". "Here are the medians." announces a table that only appears after the signatures fence. You could fold it in: "…Here are the medians for four alternatives, each with only its required helpers." with the narrator keeping "The last uses Linoy's original Args:".

8. **Ch27: page-layout words moved into the story.**
   - :41: Gil now says "I emitted it with the shared options below." The reader already flagged "below" as layout talk. The brief protected the narrator's "below", not a character's, and the options don't appear until :114. Proposed: "I emitted it with the project's options."
   - :77: "in the banner we'll look at" is the only narrator "we" in chapters 1–27 and the bonuses. Use "in the banner below", which matches the narrator's protected "below" at :15.

9. **Ch25 :120 adds a "Same X, same Y" line and is slightly inaccurate.** "Same name, same constructor. Look at the paths." The chapter already has "Same cents, explicit label." (:190) and "Same source, different loading rule." (:310). Also, the two classes don't share a constructor; they are two copies. Proposed: "The error names two files. Look at the paths." This is accurate (the TS2741 message cites `dist/index` and `src/index`), and the fence stays byte for byte.

10. **Bonus 2 :135 has a double colon in a comment.** "// Initial Refund, io: input: required […]". Proposed: `// Initial Refund, { io: "input" }: required ["orderId","cents"]` and `// Initial Refund, default (output) mode: required [...]`. Update the regex in `rev/checks/bonus2.cjs:32` and the key names at :34 and :85 to match.

11. **Ch24 and Ch27 Verdicts share a template.** Ch24 :320 "Preserve the calls… If those calls must change, migrate…". Ch27 :301 "…preserves the required calls… If the contract must change, name…". The brief said to keep Ch27's ruling, so this is the author's call. If changed, touch only the second sentence: "Giving one up is a contract change: name the lost guarantee and its owner." Noam's :313 still sets up the title change.

12. **Bonus 1 :239 duplicates :228.** :228 says "The contract, tests and project files are unchanged."; :239 says "…without changing the contract, tests or project settings." :232 already says "one line in the same implementation". Proposed :239: "Dima runs `npm run check` again. Both implementations pass."

13. **Optional: Ch26 :406.** Noam's new closer, "It doesn't get to be our type check.", partly anticipates the Verdict's second sentence (:410). It's acceptable. A more local alternative: "Node ran it. Nobody checked it."

## Verified

**Must fix**
- **1:** Ch26 now uses full sentences and summary narration, but see item 2. Ch27's assembly and config moved into comments, but see item 7. Gil states the procedure in sentences, and "He compares four alternatives…" is a full sentence.
- **2:** Linoy's "My guess is we're spending the time relating arguments to that union." (Ch27:271) and "This noEmit check allows them. I'm not asking the release build to emit them." (Ch25:286) are restored exactly.
- **3:** Gilad's Principle uses the brief's version, with no question mark and no development-versus-release script. Liron's no longer mentions the authenticated context, the records or the generation preview, and its ordering is fixed (but see item 3). Eli's has only the specified sentence cut, and the join reads cleanly. Bonus 2 no longer ends on "useful, but"; Ch27's still does, which is fine. Bonus 3 is applied badly (item 1).
- **4:** The Bonus 1 and Bonus 3 rulings are verbatim from the brief. Both fit their Turns (two passing implementations that disagree; a check the patch removed), and Bonus 1's doesn't anticipate Dima :370. Ch27 keeps its ruling, and Noam's short line at :313 sets up the title change.
- **5:** Ch27 ends "Approve it before someone asks me to benchmark the title." It doesn't start with "Good." and isn't a PR-naming quip.
- **6:** Eden's parameter line now comes after Oded's concession (B3:243–247), and Daniel's doubled alias sentence is gone. The dropped "declaration report" sentence is recorded in PR-E-REVIEW. "The declaration report" at :412 still reads, because Noam's :408 attachment is now its referent.
- **7:** "The ledger prints the same dollar entry." and "the handwritten description in `description.ts`:" are both applied.
- **8:**
  - The badge plugin is gone, and no "badge plugin" text remains in the book.
  - Gil's Ch25 line is changed; the fence is unchanged.
  - B3:150 is now Noam and :345 is Eden.
  - The other unlabelled lines in Bonus 3 (:56, 128, 130, 142, 223, 255, 283, 285) alternate correctly.

**Should fix**
- **Silent closers and Ch24:** the closers are spoken (Ch26:406, B1:249). The Ch24 :232 result line is kept and recorded. All four Ch24 wordings are applied, and Noam's reversal comes directly before the catchphrase.
- **Ch25:** :139 is applied. :15 is applied, but see item 5.
- **Ch26:** :113 is applied, and the :23 placement and the skipped optional are recorded.
- **Ch27:** all seven items are applied, and the Oded-guess departure is recorded.
- **Bonus 1:** the `reset.d.ts` order is fixed in both the prose and the check, and the version sentence is cut.
- **Bonus 2:** the labels (see item 10), the Zod sentence (accurate, with "above" and "4.6.6" dropped) and the spoken close at :203 are applied.
- **Bonus 3:** Noam now speaks the :291 diagnostics, and :372/:388 are untouched.
- **Cadences:** B1 :239 and B3 :86 are rephrased, B2 :333 is kept, B3 :410 is changed, and "Very harmonious." is cut.

**Catchphrases and ending**
- "I've seen this fail at scale." appears once outside the bios (Ch24:268, Eden). "What does the data say?" appears once (Ch27:112, Gil).
- Bonus 3's last line is exactly `**Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."` followed by a single `\n`, with nothing after it.

**Pronouns:** Eden, Gil, Liron and Dima are "he"; Idan, Linoy and Dafna are "she". All match the bios.

**Technical**
- I ran bonus1, bonus2, bonus3 and chapter24–27 from `/Users/elirazk/private/ts-book-worktrees/full-review`. That tree is byte-identical to rev/ for the book and checks. I set TMPDIR to the probes directory. All seven passed on Node 22.23.4; the worktree is unmodified.
- The changed technical sentences hold:
  - Ch24 strict default and "compiler's inputs".
  - Ch25 "Two imports that only need types pulled money's source into the compile".
  - Ch27 emit command (extracted from the new comment), "byte-identical, all 387 bytes" (asserted), "three times per version, rotating" (the check runs 3 rounds with rotation), the probe.json emit with `--noEmit false` (`broken-generic-probe-emit`), and "share of the CPU samples".
  - Ch26 :144 and :390/:402 states.
  - The Bonus 2 required lists (extracted and compared with Zod's output).
  - The Bonus 3 TS2678/TS2345 messages.

**Checks**
- Nothing is weakened. Ch27 and Bonus 2 change only their extraction regexes, and the same values are still asserted.
- Bonus 1 is stricter. I mutation-tested it on a copy under probes/:
  - an extra blockquote in the Debate fails with "Only the Verdict may be a non-request blockquote";
  - a line inserted between `## The Verdict` and its blockquote fails with "Non-request blockquote directly follows the Verdict heading";
  - the unmodified chapter passes.

**Lengths:** word counts and Principle lengths match PR-E-REVIEW (2045/2001/2390/2248/2133/2016/2261; Principles 84/43/59/86/121/48/65). The Ch25 shortfall and Ch26 overrun are recorded.

Probe artefacts: `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/pre/probes/` (suite logs and `b1repo/` mutation copy).
