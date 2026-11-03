# Release fix plan

2026-11-03. Follows the [consolidated whole-book review](CONSOLIDATED.md). **The author has decided:**
- fix all three tiers before release;
- use each missing catchphrase once;
- end Bonus 3 on its strongest closing line;
- move links out of dialogue, with the print build turning the rest into footnotes.

## Standards for every fix

These apply to every PR below, and each reviewer checks against them.

1. **Principle.**
   - An expert states one testable rule first, in their own voice, and the reader can apply it
     before the story starts.
   - Keep it short: about 120 words is the guide, not a template.
   - It must not list the chapter's reveals: the trap the Turn discovers belongs in the scene.
   - Keep each expert's specialty and the technical rule. Don't flatten every Principle into one
     shape (Codex's caution in the review).
2. **Verdict.** State the transferable ruling first, then this team's decision. A Verdict that's
   really an open disagreement is relabelled "The Debate Continues", but only where competent people
   still disagree on the page.
3. **No silent closers.**
   - No scene or section ends on a stage direction of someone leaving, keeping or placing one thing
     "beside" another, and no "in the review" endings.
   - End on a spoken line, a result or a joke.
   - Stage directions are fine mid-scene.
4. **The fiction holds.** No narrator or character refers to "the book", "a fictional shop",
   "these snapshots" or a chapter by number. Callbacks are in-world ("the badge plugin", "the
   generics argument").
5. **Links.**
   - None inside dialogue.
   - In narration, at most one link per paragraph, attached to a sentence that would stand without
     it.
   - A sentence that exists only to carry a link is cut, or its fact goes to a character.
   - The print build will render the remaining links as footnotes.
6. **The narrator isn't a manual.** Configuration, flags and diagnostics go in fences or code comments
   where possible. Cut bookkeeping narration ("temporarily", "restores", "replaces") unless the
   reader needs it to rebuild the state.
7. **Cast canon.** Characters act like their bios, or the bio is revised to the character the book
   wrote (decided per character in the Act PRs below). Each of the missing catchphrases is used exactly
   once, in a chapter where that character speaks, where it lands as a line, not as a quotation.
8. **Checks.**
   - Every changed fence stays checked, and a quoted diagnostic is asserted by message as well as by
     code where practical.
   - The full suite is green after a clean `npm ci`.
9. **Refuted findings stay unchanged** ([list](CONSOLIDATED.md#refuted--dont-fix-these)).

## Work order (one PR each, same process: Codex drafts, Claude reviews with fresh readers, joint approval)

1. **PR A — Tier 1 correctness and maintenance.** The 17 items in the consolidated Tier 1 table, the Zod
   bump to 4.6.6 with a full rerun, `checks/README.md`, and these review records. Prose changes are
   local to each item. Readers: a targeted recheck of each changed passage.
2. **PR B — Prologue and Act I (Ch1–6):**
   - the cast page: Dima's and Linoy's bios matched to the book, and Noam's "they";
   - Ch3's and Ch6's Turns;
   - Ch1's onboarding asides;
   - Ch2's closer and aphorisms;
   - Chen's voice in Ch2 and Ch5;
   - Ch5's rule;
   - the catchphrase allocation for Act I.
3. **PR C — Act II (Ch7–13):**
   - stated Principles for Ch8–13;
   - rulings for their Verdicts;
   - Ch10's Turn heading;
   - Ch11's ending, with a pointer to Ch12;
   - the closer and "in the review" sweep;
   - narrator and links in Ch12–13;
   - Chen in Ch13;
   - the Act II slump: the Ch9 trim, life in Ch12, Oded's voice;
   - Ch7's `Unwrap` pointer.
4. **PR D — Act III (Ch14–23):**
   - shorter, non-spoiling Principles for Ch18–23;
   - Verdict rulings for Ch14, 16, 19, 21 and 22;
   - the Ch19 scope cut;
   - narrator paragraphs in Ch14, 16 and 18;
   - Liron's image in Ch17;
   - the cross-book `Result` and brand reconciliation lines.
5. **PR E — Act IV and the bonus act (Ch24–27, Bonuses 1–3):**
   - shorter, non-spoiling Principles;
   - narrator and links in Ch24–27 and Bonus 2;
   - the density of Ch25, 26 and 27;
   - the late-book deadpan varied;
   - Bonus 3 reordered to end on "a meeting four minutes ago".
6. **Then a whole-book recheck** by fresh readers (fewer than this review) before the build pipeline.

Each Act PR starts with Codex's short plan of what changes in each chapter, including its
catchphrase allocation and any bio revisions, which I settle before drafting.
