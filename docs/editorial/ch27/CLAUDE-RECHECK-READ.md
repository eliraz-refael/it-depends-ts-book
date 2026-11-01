Independent isolated targeted recheck, draft 2 (8c04256), 2026-11-01. Saw only the chapter; rebuilt the repository state by state on TS 7.0.2 / Node 22.23.4, re-ran the trace and CPU profile, and scored draft 1's problems. (A first attempt on 2026-10-29 was cut off by an API authentication error before reporting; this is the rerun in a fresh directory.) Verbatim.

## Recheck report

**Bottom line.** Everything I could check reproduced. That covers every diagnostic, every runtime output, the 387 bytes, the generator's counts, all six instantiation counts (exact), the time ordering and ratios, and the trace and profile scene. Six of the eight earlier problems are fixed. P6 (logistics-heavy narration) is only partly fixed and is now the biggest problem. P7 (the Principle) has its rule but buries it.

All work is in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r2b/rebuild/`. I read only `ch27r2/chapter.md` and used the ch27 `tsc` binary. I made one outside lookup: a curl of the linked GitHub source to check the mapTypeEx line range.

### 1. Rebuild (snapshots in the rebuild directory)

- **`s01-oded-pr`:** Oded's PR, the probe, his expanded banner, the tsconfig and `package.json` `{"type":"module"}`.
- **`s02-linoy-restored-with-probe`:** Linoy's helpers restored, probe still present.
- **`s03-restored-banner`:** probe removed, banner back to `t(...pending)`, emitted.
- **`s04-bench-dist-last`:** the workload, my generator and `bench/`.
- **`s05-generic-candidate`:** the generic signature, the probe and `probe.json`.
- **`s06-distributed`:** the final state.
- **`case-*.ts`:** one bench fixture per signature.

Places where I had to guess:

- **Line 78 (Oded's banner):** his banner is never shown. I reconstructed it as the line 86–97 banner with `t(pending[0], pending[1])`.
- **Line 42 (how `dist/probe.js` was made):** the tsconfig has `noEmit: true`, and the emit flags first appear at line 113. I emitted using the line 113 flags.
- **Line 52 (where the helpers go):** I placed them after `messages`, replacing the overload, and kept the implementation signature. It compiles.
- **Line 101 (which emit Gil saved):** unclear whether Oded's emit included the probe. It makes no difference to `dist/i18n.js`.
- **Line 165 (`bench/case.ts`):** the generator script isn't on the page. I wrote my own. I used `JSON.stringify` for the one-line catalogue, `declare` on each signature, and per row only the helpers it needs, following lines 179–191. The counts matched exactly, so the prose description is enough.
- **Line 188:** I made it `type Args = …; declare function t(...args: Args)`.
- **Line 242 (`probe.json`):** I put it at the repo root, as I read the description.
- **Line 267 ("their typo … extra-argument controls"):** I wrote my own controls with `@ts-expect-error`: the typo, the missing count, `count: 2`, `t("shop.ready", {})` and an extra third argument.

### 2. Claims

| Claim | Result |
|---|---|
| Line 42: the probe prints `shop.crat` then `Hello A, {count} items` (Node 22.23.4) | Reproduced |
| Line 78: both probe calls and the banner's `t(pending[0], pending[1])` get TS2345 | Reproduced (three TS2345) |
| Line 78: the typo message ends by comparing `shop.crat` with `shop.hello` | Reproduced (last line: `Type '"shop.crat"' is not assignable to type '"shop.hello"'`) |
| Line 78: "expanded … to fit his loose signature" | Reproduced and justified. `t(...pending)` under Oded's signature gives TS2556. The page never says so. |
| Lines 84–99: the restored banner compiles | Reproduced |
| Line 103: same 387 bytes | Reproduced (`cmp` identical, 387 bytes) |
| Line 136: 40 sections × 50 keys, 2000 calls, 200 distinct keys | Reproduced |
| Line 195: string, 6 instantiations | Reproduced |
| Line 196: Key, 13,189 | Reproduced |
| Line 197: loose tuple union, 39,641 | Reproduced |
| Lines 198 and 277: Linoy's per-key tuples, 118,255 | Reproduced |
| Line 227: generic candidate, 87,431 | Reproduced |
| Line 278: distributed tuple, 118,628 | Reproduced |
| Line 242: full project gets TS2556 at the banner | Reproduced |
| Line 242: `-p probe.json` checks and emits; running prints `Hello A, {count} items` | Reproduced |
| Line 267: separate-key probe gets TS2345 | Reproduced |
| Line 267: banner compiles; allowed calls pass and mistakes fail | Reproduced (my control set) |
| Line 267: same bytes again | Reproduced |
| Line 312: `Hello A, 2 items` / `Hello A` / `Ready` | Reproduced |

**Timing.** The machine was heavily loaded at first (load average 12–17 on 12 cores), so the early rounds ran about 2–3× slow. In the later rounds, with load easing:

| Signature | My median | Page |
|---|---:|---:|
| string | ~0.005s | 0.006s |
| Key | ~0.016s | 0.016s |
| Generic candidate | ~0.098s | 0.095s |
| Distributed tuple | ~0.26s | 0.255s |
| Loose tuple union | ~1.03s | 1.013s |
| Linoy's per-key tuples | ~1.57s | 1.481s |

- The ordering matches, including under load: string < Key < generic < distributed < loose < Linoy.
- Distributed ÷ Linoy is about 0.166, so "less than a fifth" (line 284) holds.
- "Faster than Linoy's original" (line 227) holds.

**Trace (lines 288–294).** Reproduced.

- One checker, so `legend.json` has one entry with `checkerId: 0` pointing to `types_0.json`.
- The 34.5 ms `structuredTypeRelatedTo` event has source 5422, which is `Args`, a union of exactly 2000 members. (The target is `ReadonlyArray`.)
- The 173 `checkExpression` events point at positions in `case.ts`.
- All check-category X events sum to about 190 ms (154 ms expressions + 35 ms relations), against a 1632 ms `checkSourceFile` span. So the events clearly don't account for the slow check.

**Profile (lines 296–300).** Reproduced.

- In `-top -cum`, mapTypeEx has 56.6% cumulative.
- In `-peek`, its callers are `getTypeOfPropertyOfContextualTypeEx` (88%) and `getApparentTypeOfContextualType` (12%). That is contextual typing.
- Its callees are led by `getUnionTypeEx` (45%), then `growslice` and `slices.Clone`. That is union construction.
- The linked lines L25473–25508 are exactly `mapTypeEx`, and Daniel's description at line 300 matches the code.
- I didn't verify that commit 2bd066d is the 7.0.2 build.

**Ambiguous: line 304–306.** Oded asks "Two thousand comparisons every call?" and Gil answers "No." The profile can't confirm or deny it. Contextual typing does map over the 2000-member union per call, so "No" reads as a factual denial the evidence doesn't support. "Can't tell from samples" would be accurate.

### 3. Earlier problems

- **P1 (opening output had no source): fixed.** Line 11's output comes from `probe.ts` (lines 35–40), run at line 42, with the pointer at line 17.
- **P2 (trace claimed an unsupported location): fixed.** Lines 290–294 claim only what the trace shows: it finds Args, and its durations don't cover the time. One small gap: Gil's "Look at the durations" gives no number. Something like "about 0.2 s of 1.5 s" would let the reader see it.
- **P3 (two medians): fixed.** Lines 198 and 277 are identical, and line 273 says why. That line is itself a reviewer-facing footnote, though (see P6).
- **P4 (rows lacked code, a row name was wrong): fixed.** Lines 181–191 give every row's code, and the names are accurate. Line 188 crams two declarations onto one line, and the block omits the `declare` that line 165 says the fixture uses.
- **P5 (state gaps): mostly fixed.** Emits (lines 101, 113), the separate probe (line 242) and the banner's intermediate error (line 78) are now all covered. Remaining:
  - the emit command arrives at line 113, after outputs at lines 42 and 101 that depended on it;
  - Oded's banner code is never shown;
  - line 78 doesn't say why he expanded it.
- **P6 (logistics-heavy narration): partly fixed.** Lines 111–177 are still about 65 lines of commands, tsconfig, workload, case-file layout, bench tsconfig and timing protocol before the first table. Other spots:
  - line 165 is a spec spoken aloud;
  - line 101's "The root package has `type: module`" is a non sequitur in dialogue;
  - line 242 crams `probe.json` into narration;
  - line 273 reads like a footnote.
- **P7 (no headline rule, ambiguous "check"): fixed, with a caveat.** The headline rule is at line 5, and line 7 explicitly separates "type constraint or runtime validation." The caveat: about 13 further method rules follow in the same two paragraphs, which buries the headline.
- **P8 (obscure or echoing lines): fixed.** The question-mark/apology joke is gone, and so is the two-character "instrument didn't promise" echo. Gil's lines 306 and 326 differ. But there is a new echo: line 84's narration ("this caller picks the whole message, then passes it on") is almost repeated by Linoy at line 99 ("The banner chooses the whole call, then passes it on").

### 4. As a reader

- **What I enjoyed:**
  - the cold open (lines 11–15);
  - "I'm keeping that number for when somebody changes the PR title" (line 107), which pays off at line 330;
  - "I'm not buying that bug twice" (line 250);
  - the turn (lines 280–282: "More instantiations." / "Please tell me we're not rejecting the faster one for doing more work.");
  - "Count made it all the way to the customer this time" (line 314);
  - the closing joke (line 334).
- **Where I got bored:** lines 111–177, and the dense type code at lines 56–68. Line 72's walkthrough rescues the type code somewhat.
- **Where I got lost:** lines 204–208 ("I want the relationship without constructing the public call type that way") are abstract.
- **A gap at the climax:** the chapter never says why the distributed version is fast. Line 302 explains where the old time went, but the reader has to work out that inferring K from the literal gives each call a single tuple instead of 2000. I profiled the distributed fixture: mapTypeEx drops from about 950 ms to about 30 ms. One line from Linoy or Daniel stating this would close the loop.
- **The scene I'd retell:** the generic candidate (lines 212–252). It's faster, and it lets the broken call through while rejecting the caller that already worked. Then the distributed fix.
- **Do the characters sound distinct, with names covered?**
  - Noam (customer-facing, terse) and Oded (defensive, wry) are clearly recognisable.
  - Linoy is recognisable by authorship and by conceding at line 302.
  - Gil is recognisable only by procedure; his lines at 113, 165 and 177 aren't a voice.
  - Daniel has two lines (109 and 300), both explanation or disclaimer, and blurs into Gil.
  - I couldn't check pronouns against the bios (file access was restricted). The page uses "he" for Noam and "she" for Linoy.
- **Does it bear out its Principle?** Yes. The trade gets priced (Oded's PR), what newly compiles gets named (crat and the missing count), counters and seconds diverge, and a profile, not a trace, finds the cost.
- **Does the ending earn its verdict?** Yes. Oded's line 322 objection and Linoy's line 324 reply keep it opinionated without dragging.
- **New problems the revision introduced:**
  - the line 84/99 echo;
  - line 273's footnote voice;
  - line 300's "may change" disclaimer, a hedged register;
  - line 242's "Checking and emitting … prints", where `tsc` doesn't print — the run does.

### 5. Remaining problems, most important first

1. **Lines 111–177 (logistics block):** cut it down to one line each for options, workload and protocol, and move the rest to a sidebar or appendix. Line 165 especially.
2. **Line 302 onward (missing "why"):** the reason the distributed tuple is fast is never stated. Add one sentence.
3. **Line 306 ("No"):** Gil's answer reads as a factual denial the profile can't support.
4. **Lines 5–7 (Principle):** the headline is present but buried under about 13 more rules. Trim.
5. **Lines 42 and 101 vs 113 (order):** outputs and emits appear before the commands and options that produce them. Line 78 also leaves the TS2556 reason implicit.
6. **Lines 84 and 99:** near-verbatim echo.
7. **Line 294:** "Look at the durations" with no number. Give the ~0.2 s vs ~1.6 s.
8. **Lines 273, 300 and 242:** footnote or disclaimer voice; "prints" attributed to the check.
9. **Line 188:** cramped one-liner; the code block omits `declare`.
10. **Daniel and Gil:** thin, overlapping voices.
