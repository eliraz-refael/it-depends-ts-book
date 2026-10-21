# Claude's review of Chapter 6 draft 2 (`4e0c3efc…`)

2026-10-21. I reviewed `537a92e` against [my first review](CLAUDE-REVIEW.md) and a fresh
[recheck reader](CLAUDE-DRAFT2-RECHECK-READ.md). The reader got only draft 2 and a fixed question list.
I confirmed that all 44 fences (Ch6 and Ch7) are byte-identical to `4af45f5`. Ch7 is unchanged from its
approved draft 1.

**Status: approve after one small prose round; no further reader.**

Every first-review finding is applied. The Principle now passes its test:
- the reader, using the rule alone, decided `logPayload` and classified `parseConfig` as an assertion;
- it quoted l.22 to say that the one-caller `sortByName` question is explicitly open.

Both Oded and Noam now have competent best lines, quoted by the reader, and the reader calls the ending
honest.

## Fix

1. **`querySelector` (l.111–119): say less about what's unchecked and name the check.**
   - "The type argument doesn't check" now comes three times in a row: l.111, l.115 and l.119.
   - The reader still wanted the practical difference from `parseConfig`. Here a runtime check is one
     line away.
   - Keep l.111. Cut l.115's second sentence. Replace l.119's last sentence with the alternative, for
     example: if the markup can change, check with `instanceof HTMLInputElement` instead.
   - This is prose only, with no fence.
2. **l.61:** "to write these three lines once" reads oddly. Say what Noam means, for example "to write
   these three lines generically".
3. **l.268, Idan:** "`get` reads a property whose key is constrained" credits the constraint. Her point,
   and the Principle's, is that both of `get`'s type arguments come from its arguments. Say that.
4. **Table row (l.337):** "the `T → T` shape" doesn't match the example, which is `T[]` in, `T[]` out.

## Optional (your call)

- **`NoInfer` purpose:** half a clause on why you'd want `"blue"` rejected (a fallback outside the
  listed values).
- **"T exits everywhere and enters nowhere"** in the `loadState` fence: two readers now call it inexact,
  since `T` appears once. A comment-only exception under the CH4 rule is acceptable if you think it's
  worth it. Document it if you make it.

## Not adopted

- **The `JSON.stringify`, conditional-`extends` and export-return-type asides:** these were kept at
  first review, for the reasons recorded there (the VOICE-REVIEW decision, the Ch7 callback, and the
  answered Linoy/Eden exchange).
- **Eli's closing Take:** the part close, which C11 relies on.
- **Liron's lens Turn and "the image only gets us so far":** the baseline readers didn't flag it. The
  concession to Chen is the one moment where somebody's image fails, which the calibration asks for.
- **Timing named four times:** each does different work (rule, dispute, Turn, Verdict).
- **The title "The Hole in the Function":** out of scope for a voice pass.
- **"Still compiles." echoing the comment (l.262):** fine as Daniel doing what Idan asked.
- **The union order:** verified on 7.0.2 at discovery.

## Next

Codex applies 1–4, plus the optional items if it wants. It changes prose only, keeps fences
byte-identical, runs the Chapters 1–6 suite, then commits and hands off. The full run already passed on
draft 2. I'll do the final diff review and open the PR.
