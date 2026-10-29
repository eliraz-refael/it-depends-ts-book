Independent isolated full reader, draft 1 (26b7045), 2026-10-29. Saw only the chapter; rebuilt the repository state by state on TS 7.0.2 / Node 22.23.4 and verified every claim. Verbatim.

## Full-reader report

I reproduced nearly every technical claim exactly, all six instantiation counts included. The biggest problem is in the story: the opening bug doesn't come from the code the page shows. There is also an unexplained mismatch between the two tables, and the trace scene claims more than a reproduced trace supports.

**Rebuild:** /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r1/rebuild/
- Snapshots, in order:
  - `01-oded-pr`
  - `02-linoy-restored-with-probe`
  - `03-linoy-banner-restored`
  - `04-generic-candidate`
  - `05a-distributed-with-probe`
  - `05b-distributed-final`
- Generated bench files are in `cases/<variant>/`.
- The generator script is `scripts/gen.mjs`.
- Environment: tsc 7.0.2, Node v22.23.4 (matches the page), Apple M3 Pro.

### 1. Where I had to guess
- **L84:** Oded's banner. I wrote it as the L87–97 file with `t(pending[0], pending[1])`. Under Oded's signature, `t(...pending)` gives TS2556, which fits "to fit the loose signature".
- **L101 / L113:** How Gil emits "with Oded's signature".
  - With the banner already back to `t(...pending)`, the project command at L113 fails with TS2556, and `noEmitOnError` blocks the emit.
  - So he must emit i18n.ts on its own, or with Oded's banner. The page doesn't say which. I compared against the state-1 emit.
- **L181 / L185–186:** Signatures for rows 2 and 3 aren't shown. My guesses, which give exact counts:
  - Row 2: `declare function t(key: Key, params?: Record<string,string>)` with only Paths and Key.
  - Row 3: `type Args = {[K in Key]: [key: K, params?: Record<string,string>]}[Key]; declare function t(...args: Args)`.
- **L167:** The catalogue is written as `JSON.stringify(messages)` on one line, each call on its own line, then `export {};`.
- **L232:** "check and emit this probe on its own". I used a separate tsconfig with `files: [src/probe.ts]`. The whole project fails because of the banner, so some separate list is needed. The page doesn't say how.
- **L257:** The control calls aren't shown. I wrote seven: cart, hello, ready, plus `@ts-expect-error` typo, missing count, `count: 2`, and `t("shop.ready", {})`.
- **L52:** Whether the `// src/i18n.ts — Oded's PR` comment stays. It doesn't matter, because `--removeComments` strips it.

### 2. Claims checked

| Line | Claim | Result |
|---|---|---|
| L42 | Prints `shop.crat`, then `Hello A, {count} items` | Reproduced |
| L78 | Both probe calls get TS2345; the typo message ends with `"shop.crat"` vs `"shop.hello"` | Reproduced. The page leaves out that `src/banner.ts(8,12)` also gets TS2345 at this point (Oded's two-argument call against Args). |
| L103 | Same 387 bytes | Reproduced: both i18n.js files are 387 bytes and `cmp` finds them identical (same sha1) |
| L138 / L159 | Generator counts | Reproduced: 40 sections, 2000 keys, 2000 calls, 200 distinct keys. All calls compile. |
| L185 | 6 instantiations | Reproduced |
| L186 | 13,189 | Reproduced (with my guessed signature) |
| L187 | 39,641 | Reproduced (with my guessed signature) |
| L188 / L267 | 118,255 | Reproduced |
| L268 | 118,628 | Reproduced |
| L217 | Generic candidate checks faster on the fixture | Reproduced: 87,431 instantiations, 0.097s. The page gives no number. |
| L232 | Probe compiles and prints `Hello A, {count} items`; banner gets TS2556 | Reproduced |
| L257 | Separate-key probe gets TS2345; banner compiles; controls behave; same bytes | Reproduced, all of it |
| L292 | `Hello A, 2 items` / `Hello A` / `Ready` | Reproduced |

**Times (ordering and ratios reproduce):**
- Table 1, mine: 0.005 / 0.015 / ~0.97 / ~1.59s. Page: 0.005 / 0.016 / 1.055 / 1.664. The tuple-union jump is about 65x on both.
- Table 2, mine: original ~1.48s, distributed ~0.26s. Page: 1.922s and 0.262s.
- "Less than a fifth" (L274) holds: mine is 0.18, the page's is 0.136.

**Trace (L278–284):**
- Reproduced:
  - `trace/legend.json` maps checkerId 0 to `types_0.json`.
  - Two `structuredTypeRelatedTo` events have a target ID that resolves to `"Args"`, a union with 2000 members.
  - `checkExpression` events are sampled (157 of them) and point at generated calls.
- Weakly supported: those two Args-target events last about 20µs each.
  - The only large relation event (33ms) has Args as the *source* and `ReadonlyArray` as the target.
  - Traced relation time adds up to about 33ms of a ~1.5s check.
  - Linoy's "Here. Relating the arguments to Args" isn't something a reader re-running the trace would see as where the time goes. Gil's caveat helps, but the scene still presents it as a finding.

### 3. As a reader
**Enjoyed:**
- The cold open (L11–15).
- Noam's "keeping that number for when somebody changes the PR title" (L107).
- "Stop moving the furniture" (L165).
- The Turn: more instantiations, a seventh of the time.
- The title-change ending and Oded's last line.

**Scene I'd retell:** L200–242. The "obvious" generic lets the broken call through *and* rejects the caller that already worked (TS2556). Then distributing the whole tuple fixes both. That's the chapter's best lesson.

**Bored or lost:**
- L101, L113, L167, L179–181 read as lab logistics in prose. Options, flags and file layout pile up, and rows 2–3 have no code, so I couldn't picture the table rows until I'd rebuilt them.
- L192 (Gil) is abstract.
- L259, "second question mark ... first apology", lost me. Is it the two `?` in the conditional type?
- L84, "deferred-call code", is jargon.

**Voices:**
- Mostly distinct:
  - Noam: the customer, dry.
  - Oded: defensive author who lands the jokes.
  - Linoy: owns the types, prickly and precise ("Don't remove the feature and tell me the feature was implemented badly").
  - Gil: method.
- Gil and Daniel overlap: L284 and L286 are both "the instrument didn't promise X".
- I could tell who was speaking throughout.
- Pronouns: Linoy is "her", Noam (L221), Gil and Oded are "he". I didn't check these against the bios, since I wasn't allowed to open them.

**Principle (L5–7):**
- It's testable, but it's about eleven directives in two paragraphs, with no single headline rule.
- "Editing" and "running" are named but never exercised.
- The chapter does bear out:
  - one change at a time (Table 1)
  - counters aren't seconds (the Turn)
  - compare emit (387 bytes)
  - same typo rejected doesn't mean same relationships (the generic candidate)
  - who owns the mistake (L308)
- The trace directive is the weakest-supported (see above).

**Ending:** It's earned. The fix is both cheaper and keeps the checks, and Oded's "every helper" objection gets a real answer at L304. It's a closed verdict, which fits a measurable subject.

**Numbers:** The same row ("Original optional tuples") is 1.664s in Table 1 and 1.922s in Table 2. Same fixture, same configuration, same machine, and the page doesn't explain it.

### 4. Problems, most important first
1. **L11, L33, L46 vs L84–97: the opening bug doesn't come from the code shown.** On Oded's branch, the banner I rebuilt prints `Hello A, 2 items` (banner(true)), not `Hello A, {count} items`. Only Noam's later probe (L39) gives `{count}`. "The fallback is showing the customer what we forgot to pass" and "notice it in a banner" have no caller on the page that forgets count. Either show a real banner call that drops count, or have the opening come from the probe.
2. **L188 vs L267: unexplained medians.** The same version gets 1.664s, then 1.922s. Add a line (a separate session, or machine noise), or reuse one figure.
3. **L278–280: the trace overclaims.** On a rebuild, the Args-target relation events are tiny, and the big relation event has Args as source against ReadonlyArray. Soften Linoy's "Here", or describe what the trace actually shows.
4. **L181, L185–188: rows 2 and 3 have no code, and the labels are confusing.**
   - Rows 2 and 3 are described only in prose. Show the two signatures, even in one line each.
   - "Original optional tuples" is the wrong name for Linoy's `[key] | [key, params]`. Her params aren't optional.
   - "Loose params" vs "loose optional params" (L181) is unclear.
5. **L101 / L113: unclear how Gil emits with Oded's signature.** The project command fails with TS2556 plus `noEmitOnError` once the banner is restored. Say he emits i18n.ts alone, or with Oded's banner. **L232** has the same issue: say how the probe was "checked and emitted on its own".
6. **L78: the banner's TS2345 is left out.** At that moment the banner also fails (TS2345). Mentioning it would motivate L84's restore.
7. **L5–7: the Principle has no headline rule.** It's a list. Lead with one sentence, something like "Name the measurement, change one thing, and say what newly compiles". "Editing" and "running" are never tested.
8. **L259: "second question mark / first apology" is obscure.**
9. **L101, L113, L167, L179: logistics-heavy stretch.** This is where my attention dropped.
10. **L84: "deferred-call code" is jargon.**
11. **L274: "less than a fifth" undersells the result.** It's about a seventh on the page's own numbers. Not wrong, but weaker than it could be.
12. **L284–286: Gil's and Daniel's lines echo each other.** One of them could go.
