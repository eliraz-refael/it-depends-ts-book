# Claude's review: Chapter 27 draft 1 (`26b7045`)

2026-10-29. I reviewed draft 1 against the [settled plan](../CH27-PLAN.md#settlement-after-codexs-challenge-2026-10-29),
with two fresh isolated readers:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md), with the four settled cases and their follow-ups. It
  built fixtures for each on TS 7.0.2, and was asked about enjoyment.
- a [full read](CLAUDE-FULL-READ.md), which rebuilt the repository state by state (six snapshots plus
  the bench cases) and was asked to verify every claim and say where it got bored.

**The draft works.**
- **Every count reproduced exactly:** 6, 13,189, 39,641, 118,255 and 118,628. So did:
  - the generator's counts;
  - "same 387 bytes";
  - every diagnostic and every runtime output.

  The time ordering and ratios reproduce too. "Less than a fifth" holds on the reader's machine
  (0.18).
- **Its retold scene is l.200–242:** the obvious generic lets the broken call through *and* rejects
  the caller that already worked, and then the whole tuple fixes both. "That's the chapter's best
  lesson." The Turn also lands ("more instantiations, a seventh of the time").
- **Lines that land:** the cold open (l.11–15), l.107, "stop moving the furniture" (l.165), and the
  title-change ending.
- **Voices are distinct.** The reader could tell who was speaking throughout.
- **The Principle-only reader answered all four cases and follow-ups correctly,** with fixtures:
  - five of eight were Clear;
  - its own d1/d2 fixture reproduces the counter-versus-time inversion independently (440,872
    instantiations at 0.43s against 1,998 at 0.60s);
  - its best sentence is "Otherwise you may be celebrating work you stopped doing".

**Verdict: draft 2, local.** The structure stays. Fix the opening's provenance, the trace scene's
claim and the inconsistent medians; show what the table rows are; tighten the Principle; and cut the
lab logistics.

## Findings, ranked

### 1. The opening bug has no caller on the page (must fix)

The full reader's top finding. Noam's "Your faster checkout says `Hello A, {count} items`" (l.11) and
"notice it in a banner" (l.46) imply a real caller that drops `count`. The banner on the page
(l.87–97) passes `count`, and on Oded's branch it prints `Hello A, 2 items`. Only Noam's later probe
(l.39) produces `{count}`.
- **The opening output must come from code on the page at that moment.** Either Noam's preview *is*
  the probe ("I wrote the two calls your PR now allows. Here's what the banner preview would
  show."), or a real caller exists that a loose signature let through.
- Don't invent a production incident. Ch27 is a review, and nothing ships.

### 2. The trace scene claims what the trace doesn't show (must fix)

The reader re-ran the trace. I checked its trace myself and reproduced the reader's finding:
- **The events don't add up to the check.** In a ~1.5s check, the trace's complete events total
  about 180ms: `checkExpression` 132ms over 157 sampled events, and `structuredTypeRelatedTo` 33ms
  over 7.
- **`Args` isn't where the time goes.** The two events targeting `Args` last about 20µs each. The one
  large relation event (33ms) has `Args` as the *source*, against `ReadonlyArray`.
- **So "Here. Relating the arguments to Args" (l.280) is a finding the reader couldn't reproduce.**
  Gil's caveat (l.284) doesn't repair it, because the scene still presents the location as found.

**A better instrument exists, and it makes a better scene.** TS 7.0.2 has `--pprofDir`, which writes
a Go CPU profile. On the reader's original case I ran `tsc -p tsconfig.json --checkers 1 --pprofDir
<dir>`, then `go tool pprof -top`:
- **The profile accounts for its samples:** 1,720ms of samples over a 1.72s run.
- **About 60% of them sit under `checker.(*Checker).mapTypeEx`** (cumulative), which maps over a
  union's members, with sorted-union insertion (`slices.BinarySearchFunc`, `CompareTypes`) inside
  it.
- **The plausible reading:** each call walks the 2,000-member union rather than relating one tuple.
  That's for Codex to confirm with `-cum`, `-peek` or `-list`, without guessing.

**Direction:**
- Linoy's trace gives the guess ("relating the arguments to Args"), and the profile corrects it.
  Somebody guesses wrong, and an instrument shows where the time actually went. The book's voice
  standard wants that moment, and it pays off Ch3's "I'd try it if a trace pointed here".
- **Daniel gets the compiler fact:** what the hot function does, in one plain sentence.
- **Constraints:**
  - The page names at most one internal function. If it does, it says it's the TS 7.0.2 checker's
    internals and may change.
  - No sample percentages are asserted in the check: record them as evidence, like times.
  - `go tool pprof` needs a Go toolchain. Say so in one clause, or have Linoy say it.
  - If Codex finds the profile doesn't support a clear reading either, the scene must say only what
    is supported. Then the trace beat shrinks to "it shows calls being checked, not why".
- The `--generateTrace` scene can stay as the first, weaker instrument, but it's scored honestly.

### 3. The same version has two medians (must fix)

"Original optional tuples" is 1.664s in table 1 (l.188) and 1.922s in table 2 (l.267). The fixture,
configuration and machine are the same, with no explanation. Use one measurement session for both
tables and reuse the figure. Or, if the Turn's runs are a fresh session, say so in a clause. Gil of
all people would notice.

### 4. Show what each table row is (must fix)

- **Rows 2 and 3 have no code** (l.181, l.185–188). The reader guessed both signatures. The guesses
  reproduced the counts, but a reader shouldn't have to. Show all four counterfactual signatures
  compactly: one fence, one line each, labelled to match the table.
- **"Original optional tuples" misnames Linoy's type.** Her params aren't optional; the *arity* is
  (ready takes one argument). Call it "Linoy's per-key tuples" or similar. Use the same name in
  both tables.
- **"Loose params" vs "loose optional params"** (l.181): pick one.
- **Table 1 already shows the Turn's inversion.** The loose tuple union has 3× row 2's
  instantiations and about 65× its time. Gil's l.192 talks past it. Either let it pass unremarked,
  so the Turn pays it off ("we saw this in the first table and didn't look"), or remove the hint.
  Don't half-explain it early.

### 5. State gaps and lab logistics (should fix)

- **l.78:** at that moment the banner also fails, with TS2345 (Oded's two-argument call against
  `Args`). Say so, because it motivates l.84's restore.
- **l.84:** "deferred-call code" is jargon, and the banner arrives before the reader has seen it.
  Introduce the banner as what it is: the call that picks the whole message, then passes it on.
- **l.101 and l.113:** how does Gil emit "with Oded's signature" once the banner is back to
  `t(...pending)`? The project check fails with TS2556, and `noEmitOnError` blocks the emit. Say what
  he emits (i18n.ts on its own, or Oded's branch as it was).
- **l.232:** the same gap, "check and emit this probe on its own". One clause: a separate file list.
- **The logistics stretch, l.101, l.113, l.167 and l.179–181,** is where the reader's attention
  dropped: options, flags and file layout in narration.
  - The tsconfig fence and the bench tsconfig carry most of it.
  - Put the commands in a fence or in Gil's mouth, once.
  - Cut what the fences already show.
  - The narrator shouldn't be the manual.

### 6. The Principle (should fix)

Both readers: it's testable and the chapter bears it out, but it's "about eleven directives" with no
headline. The Principle-only reader called the first paragraph "a lint config spoken aloud".
- **Lead with one rule.** Something like: "Before you trade a check for speed, measure it and say
  what newly compiles." Then the requirements.
- **"Remove a check" is ambiguous** between a type-level check and runtime validation. That broke the
  Principle reader's (b) follow-up (a throwing `toUserId` isn't erased). One clause: the
  emitted-code comparison clears erased annotations only, and code that runs is measured like code.
- **The trace sentence has no criterion.** Say when you need one (the counters don't explain the
  time) and what it answers (where the checker spent it). With finding 2, "trace or profile".
- **"Editing" is named and never exercised.** Either drop it from the list, or keep it as the claim
  that needs a different measurement, in one clause. Don't promise four categories and use two.
- **"Those relationships"** is a third word for the calls that must stay legal and the combinations
  that must stay forbidden. Use the first phrase again.
- **Keep** "celebrating work you stopped doing" and "Someone has to own the mistake that now
  compiles". Both readers singled them out. Keep the length about the same.

### 7. Line-level (fix)

- **l.259:** "the second question mark … the first apology" lost the reader. Make it plain, or cut
  it.
- **l.284–286:** Gil and Daniel both say "the instrument didn't promise X". With finding 2, give
  Daniel the compiler fact and Gil the measurement caveat. Don't let them echo.
- **l.217:** "This version checks faster in that fixture too" gives no number. Give it, or say why
  not. The reader measured 87,431 instantiations at 0.097s, so it's the fastest and the broken one,
  which is a good line for Noam.

## Not adopted

- **"Less than a fifth" undersells it** (full reader). It holds on both machines (0.136 and 0.18),
  and a seventh doesn't. Keep the claim that survives the reader's machine.
- **Exercising "editing" with a measurement.** The settlement allows no editor claims. Finding 6
  covers the wording.
- **Pronoun check** (the full reader couldn't open the bios). Codex's challenge verified them against
  the bios, and the draft matches.

## Next

Codex revises to draft 2. Update the checks for:
- the opening's provenance: the output Noam reads comes from a call on the page;
- the four counterfactual signatures as printed, each compiled and counted;
- one measurement session feeding both tables, if the figure is reused;
- whatever the profile scene claims. Assert that the profile is produced and its format is
  readable; record sample shares as evidence, and never fail on them. If `go` is absent, the check
  skips that evidence step with a visible note, not a failure, because the book's toolchain doesn't
  require Go;
- the stated emit and probe procedures (l.101, l.232).

Run the full `npm run check`, freeze `ch27/DRAFT2-SNAPSHOT.json`, and commit locally with these
records. Then I'll run a Principle-only reader on the revised Principle and a targeted recheck of the
whole chapter.
