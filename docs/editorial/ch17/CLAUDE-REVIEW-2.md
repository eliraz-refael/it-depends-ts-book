# Claude's review of Chapter 17 draft 2 (`331e886f…`)

2026-10-21. I reviewed `9795d04` against [my first review](CLAUDE-REVIEW.md) and a fresh
[recheck reader](CLAUDE-RECHECK-READ.md). The reader got only draft 2 and a fixed question list.
`node checks/chapter17.cjs` passes on my machine (19 fences / 26 compiler cases / 21 runtime groups).

**Status: approve after one small round; no further reader.**

Every first-review finding is applied:
- **The type-level answer is in.** The reader explained, unprompted, how both `ReadPrice` and
  `PriceView` keep the live reader out of `receipt`, and found Daniel's l.264 clear.
- **The Principle still decides the single-writer case.** The reader quoted l.7.
- **Guy now holds points:** the owner, `snapshot()` and the interface Eden adopts.
- **The migration cost is in the debate:** the old in-place callers, the two-API period and the
  adapter, and the panel change.

## Fix

1. **`pricing` outlives its class (l.206 → l.260).**
   - `pricing` is built while `view()` returns the getter `Quote`. l.260 then calls the replaced
     `view(): PriceView` on the same object, and l.211's `summary.total` would no longer compile
     under the new class.
   - Use a fresh instance at l.260, as l.277 already does ("next run"). Have Daniel's l.264 say that
     `view()` no longer returns a `Quote`; that is what closes the mistake.
   - `ReadPrice` alone doesn't close it while `view(): Quote` still exists.
2. **Dafna's "I wasn't proposing that" (l.303)** frames Guy's point as a strawman, and then she builds
   an owner anyway. Let her agree outright, then offer the closure.
3. **Give Guy one concrete edge in the closing dissent (l.344).** The only concrete evidence so far
   favours Dafna (`values.read` drops straight into `ReadPrice`). One clause is enough, for example:
   the panel will also need a second operation from the same owner, and a named interface grows where
   a function type doesn't. Dafna can answer in one line. Keep it small.
4. **Repetition and an unprompted rebuttal:**
   - **l.160:** Eden's line repeats Dafna's l.156. Cut it or give it new content.
   - **l.158:** Guy answers a private field nobody proposed. Either set it up from Eden's question,
     or cut it; `CartPricing` comes later and makes the point itself.

## Optional (your call)

- **Eden on production throws:** half a clause that, in strict code, a legacy path writing a frozen
  quote now throws in production. That is a deploy risk, not only a test signal.
- **Rhythm:** one of the mirrored antitheses at l.218, l.241 and l.336 could be varied.
- **The Verdict's closing triple** ("A single writer, a readonly type, and a frozen object…") reads as
  a slogan to one reader. Keep it if you think it states the ruling; trim it otherwise.

## Not adopted

- **The reader's "TS4104 / TS2739 are probably wrong; tsc reports TS2345 at the top":** it couldn't run
  a compiler.
  - I verified on 7.0.2 that passing `readonly LineItem[]` to a `LineItem[]` parameter reports
    `TS4104` directly.
  - At discovery, `receipt(view, q)` reported `TS2739` directly.
  - `checks/chapter17.cjs` asserts `[2540, 4104]`, `[2345]` and `[2739]`.

  The codes differ because the diagnostics differ, and the manuscript is right.
- **Variable-name reuse** (`checkout`, `chooseDiscount`): acceptable in neighbouring, separate
  blocks.
- **Making the owner class an explicit migration step:** l.338 already lists what changes together.

## Next

Codex applies 1–4, plus the optional items if it wants. Update the checks for the fence change in item 1.
Run the full `npm run check`, commit, and hand off. I'll do the final diff review, rebase onto main
after PR #18 merges (both branches touch PLAN.md), and open the PR.

## Final diff review, 2026-10-21

I reviewed `9a1df28` (manuscript `6166694a…`) against draft 2. Items 1–4 are applied as asked:
- **Fresh instances.** Both class revisions get their own instances (`functionPricing`,
  `currentPricing`). Daniel says that `view()` no longer returns a `Quote`.
- **Dafna agrees outright.** She says "Keep one owner" before offering the closure.
- **Guy's edge.** He has a concrete, conditional one: `current` and `subscribe` from one owner through
  one interface. Dafna would group them too, and keeps `ReadPrice` until the panel needs more. This
  is a small dissent and an honest one, with no invented requirement.
- **Repetition.** Eden's repeat is gone, and Guy's rows line now answers Eden's question.

Optional items taken: the production-throw clause, the getter rhythm and the Verdict trim. Only fences
10 and 13 changed. The Principle is unchanged from the version the readers tested.
`node checks/chapter17.cjs` passes on my machine (19 / 26 / 21), and Codex's full run passes.

**Approved.** No open findings. Ready for the author's review.
