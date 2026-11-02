# Full read: Bonus 3 draft 1 (`c51900a`)

2026-11-02. A fresh, isolated reader read only the chapter, rebuilt its project state by state with TypeScript 7.0.2 and Node 22.23.4, and checked every runnable claim. The report below is verbatim.

## Full reader report

### Setup and snapshots

Root: /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b3d1/rebuild/

**tsconfig.** I built it from line 60:
- `strict`, `target: ES2022`, `module` and `moduleResolution: Node16`, `exactOptionalPropertyTypes`
- `declaration`, `emitDeclarationOnly`, `allowImportingTsExtensions`
- `rootDir: "."`, `outDir: "types"`, `include: ["*.ts"]`

`package.json` is `{"type":"module"}`.

**Patches.** I applied each diff with `patch -p1`, and all of them applied cleanly. The patch files are kept in `patches/`.

**Snapshot directories:**
- `01-original`
- `02-provider-old-badge`
- `03-submitted`
- `04-decl-emits` (both `types/` trees)
- `05-mobile-original`, `05-mobile-submitted`
- `06a-typo-submitted`, `06b-typo-original`
- `07-as-const`
- `08-final`, `09-final-typo`, `10-final-mobile`
- `11a-isolated-original`, `11b-isolated-submitted-string`
- Extra probes of my own: `11c-isolated-string-oldbadge`, `11d-isolated-final`, `12-swap-final`, `13-typeof-probe`

### Reproduction table

| # | Claim (line) | Result |
|---|---|---|
| 1 | Original: `node check.ts` prints `3 statuses, 3 badges: passed` (86) | Reproduced exactly. Node 22.23.4 runs the .ts with no flag and no warning. |
| 2 | Submitted patch: compiles, same output (86) | Reproduced exactly. It compiles only because the profile I assumed has no `noUnusedLocals`. With that flag on, the patch fails `badge.ts(4,10): TS6133 'assertNever' is declared but its value is never read.` |
| 3 | Old badge plus new provider: TS2345 `Argument of type 'string' is not assignable to parameter of type 'never'.` (154) | Reproduced exactly, at `badge.ts(13,33)`. |
| 4 | Both declaration emits succeed; the `status.d.ts` diff is one line (162-171) | Reproduced exactly, byte for byte, hunk header included. `status.d.ts` is the only file that differs between the two `types/` trees. |
| 5 | `Order` unchanged in both declaration sets (205) | Reproduced: `order.d.ts` is identical. |
| 6 | Mobile adapter compiles with the original provider (199) | Reproduced. |
| 7 | Mobile adapter with the submitted provider: TS2322 `Type 'string' is not assignable to type '"paid" \| "partial" \| "refunded"'.` (199) | Reproduced exactly, at `mobile.ts(5,3)`. |
| 8 | Typo in the submitted patch (`all: "refund"`) still compiles (235) | Reproduced. |
| 9 | `badge({ paidCents: 1000, refundedCents: 1000 })` returns `refund` (235) | Reproduced, with a caveat: the page doesn't say how to call it. I used a probe file and `node --input-type=module -e`. |
| 10 | `node check.ts` fails `Expected refunded, got refund` (245) | Reproduced exactly. The status assertion catches it, before the badge assertion runs. |
| 11 | Typo in the original fails twice: TS2678 `Type '"refunded"' is not comparable to type '"paid" \| "partial" \| "refund"'.` and TS2345 `Argument of type '"refund"' is not assignable to parameter of type 'never'.` (251) | Reproduced exactly, at `badge.ts(12,10)` and `(13,33)`. |
| 12 | Back on the submitted patch: compiles, tests pass (257) | Reproduced. |
| 13 | `as const` repair: old badge compiles, `check.ts` passes, `status.d.ts` byte-identical to the original (291) | Reproduced exactly (`cmp`). The whole `types/` tree is identical too. |
| 14 | Final `status.ts`: compiles, "all six assertions pass" (340) | Reproduced. The console still prints the "3 statuses, 3 badges" line, so "six" means 3 rows x 2 checks. |
| 15 | Final plus typo: TS2820 `Type '"refund"' is not assignable to type 'OrderStatus'. Did you mean '"refunded"'?` at the table, and TS2322 at the return (334) | Reproduced exactly, at `status.ts(8,3)` and `(16,3)`. The page doesn't quote the full TS2322 text: `Type '"paid" \| "partial" \| "refund"' is not assignable to type 'OrderStatus'.` plus a related TS2820 line. |
| 16 | Final plus mobile adapter compiles (340) | Reproduced. |
| 17 | Final declaration names the private `OrderStatus` alias; its text differs but allows the same three statuses (342) | Reproduced, with one unmentioned detail: the emit also gains `export {};`. Emitted: `type OrderStatus = "paid" \| "partial" \| "refunded"; export declare function orderStatus(order: Order): OrderStatus; export {};` |
| 18 | `isolatedDeclarations` on the original: TS9007 `Function must have an explicit return type annotation with --isolatedDeclarations.` (350) | Reproduced exactly, at `status.ts(3,17)`. |
| 19 | Submitted patch with `orderStatus(...): string`, "with the repaired fallback", passes the flag (350) | Reproduced with differences. It passes only with the assistant's `default: return status` fallback. With the team's restored `assertNever` badge (the other thing this chapter calls a repair), it fails TS2345. The sentence is ambiguous. |
| 20 | Swapping `paid` and `refunded` satisfies the union and the declarations stay identical (364-366) | Reproduced in my own probe on the final version: it compiles, `types/` is identical, and `check.ts` fails `Expected paid, got refunded`. |
| 21 | An `typeof`-based alias line can stay unchanged while its meaning changes (5, 378) | Reproduced in my own probe: `export type Status = (typeof labels)[keyof typeof labels]` is unchanged, while the emitted `declare const labels` flips from readonly literals to `string`. The declaration report shows the change. |

### Where the page wasn't enough to rebuild a state
- **"The book's strict ES2022/Node16 profile" (60)** is never spelled out on the page. I tried a wider strict set: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`/`Parameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`. Only `noUnusedLocals` changes an outcome, and it makes Oded's "green pull request" red.
- **How to "call `badge(...)` directly" (235)** is unstated.
- **"With the repaired fallback" (350)** could mean either fallback (row 19).
- **The mobile adapter's whereabouts are a little loose:** "Noam keeps its source" (207), then "Eden puts the unchanged mobile adapter back" (340). That's harmless.
- **Everything else was rebuildable.** The diffs applied cleanly, and the hunk headers are correct.

### 1. What it taught me
A summary saying "no public API changes" is a claim. You check it by diffing emitted `.d.ts` before and after, with the same compiler and config. When a refactor "fixes a type error" in a caller, that is the strongest signal the provider's type changed. Put the old caller back and read what breaks.

The mechanism here: a mutable object-literal table widens literal values to `string`, and that silently widens the inferred return. `as const` restores it, and `satisfies` plus an explicit return pins it.

In my next review, any hunk in a file the summary didn't mention gets reverted and recompiled first. I'd also emit and diff declarations for a shared module rather than trusting "no exported annotation changed".

### 2. The scene I'd retell
The "refund" button.
> "That says refund." / "Yes." / "As in a button?" / "As in whatever string comes out. We replaced the check with permission to display it."

And the follow-up that names the whole chapter:
> "I haven't found a bug your tests missed. I've found a check the patch removed."
> "That's a behavior choice. It arrived as a type-error repair."

I'd also use the opener: "I can see that it fixed an error. What did the fix fix?"

### 3. Enjoyment and friction
**Where I enjoyed it:**
- The cold open: "He considers these two facts compatible." / "They are becoming less compatible." It's great.
- "if that will count as approval".
- "No *written* public API changes." / "You don't get to insert a word after I've reviewed the sentence."
- Oded's "The old caller doesn't accept its *type*. We've just run its values."
- "We lost the compiler asking me to fix a function that works. That was the attraction." It gives Oded a real stake.
- The closer, "a meeting four minutes ago."

**Where I had to re-read:**
- **Line 17, "fixed artifacts of this example", and line 132, "The assistant's fixed reply in this example is".** These lab disclaimers break the scene. "Fixed" also collides with the chapter's "fix" vocabulary: I first read "fixed reply" as "repaired reply".
- **Line 185, "explicit return types on APIs we intend to keep back in the generics argument".** It parses as "keep back". Fronting "Back in the generics argument" would fix it. The cross-reference also means little to a reader who comes to this bonus chapter cold.
- **Lines 293-297, "I accept apologies as approvals." / "That works." / "A short approval is fine."** I had to work out who owed whom an apology. Oded fixed his own patch, so the joke inverts. It's funny once decoded.
- **Lines 336-338, "It has a suggestion now." / "It used to have an objection. You replaced it with a string."** This muddled me. The final version still objects (two errors), and the assistant, not Oded, made the replacement.
- **Line 60.** A dense config block sits in the middle of the dialogue. It's necessary for rebuilding, but it's where my attention dropped.
- **Line 342.** It read like release notes, and "they" is ambiguous: Eden, or the team?

### 4. Characters
- **Oded** is the most alive. He's impatient and funny, right about the values, and he produces the two-word fix himself. He's not a strawman; if anything his jokes cluster a little ("minutes", "apologies", "four minutes ago").
- **Noam** is a distinct terse skeptic with the best lines. His position, that the patch removed a check, is clear.
- **Eden** has a real external stake (the mobile caller) and a clear position: the table shouldn't decide the API. "We don't get to widen its return because this repo's badge found a fallback" is in character. His Additional Take on narrower parameters is terse to the point of opaque: "Every caller here might pass `paid`; another caller still has a `string`."
- **Daniel** drifts toward narrator or manual:
  - The Principle's second paragraph is abstract.
  - Line 205, about `Order` being unchanged, answers a question nobody asked, and exists to cover the Principle's "referenced types" clause.
  - Line 366, "A difference needs review; no difference isn't permission to skip the behavior", is an aphorism.

  His in-scene mechanics, "The table properties are mutable. Their values widened.", are fine and earned by Oded's question.

Note: Eden is "he" at line 187. I couldn't check bios.

### 5. Narrator paragraphs that read like documentation
- Line 17 and line 132 (the "fixed artifacts" and "fixed reply" disclaimers)
- Line 60 (the config list)
- Line 162 ("clearing the output directory before each run and keeping both results")
- Line 207 and line 257 (reproducibility stage directions)
- Line 342 (the representation-change paragraph)
- Line 356: "permits some simple inferred exports; it does not promise an annotation on every export", plus the docs link. Nobody in the room raised it.

Line 219's "deliberate typo; not in the submitted code" is borderline but works as a reviewer habit.

### 6. Verdict and ending
The Verdict is earned. Each kept item was demonstrated on the page: the table, the explicit return, `satisfies`, the original badge, the mobile check and the runtime tests. It's stated as a decision (Eden), with a process rule (Noam) and a limit (Oded and Daniel). The swap example in the Verdict is a neat closing proof, and I verified it.

The rewritten summary is clunky but believable. The ending callback lands.

The Principle states a testable rule up front ("I compare the public types before and after, with the same compiler and project settings"), and the story exercises it.

### 7. Technical claims
Nothing is wrong. Some points are imprecise or missed:
- **Unmentioned dead code.** The submitted patch leaves `assertNever` defined and unused. Under `noUnusedLocals` the "green" PR fails TS6133. Either way, it's a reviewer tell the chapter never uses. Noam could have spotted the orphaned helper.
- **Row 19.** "With the repaired fallback, it passes the flag" is true only for the assistant's fallback.
- **The final emit adds `export {};`** (line 342 doesn't mention it). Calling `OrderStatus` "private" is slightly soft: consumers can still reach it via `ReturnType<typeof orderStatus>`. The text does say only that no *named* export was added, which is accurate.
- **No reason is given why the final table needs no `as const`.** `satisfies` gives a contextual type, so the literals stay literal. A reader who just learned "mutable properties widen" may wonder. Line 334's "because the inferred values still include `"refund"`" implies it without saying it.
- **The test catches the typo via the status assertion, not the badge text.** That's accurate as written, just worth knowing.

### 8. Repetition and unkept promises
- **The Principle's "an unchanged alias can name a changed type" is never demonstrated.** The only referenced type, `Order`, didn't change (line 205 is a hypothetical). The `typeof` case appears only as an asserted Additional Take. It works, as my probe shows, but it's taught by statement, not shown.
- **The Principle's "with the same compiler and project settings"** is also never shown failing. That's acceptable.
- **"identical declarations don't prove identical behavior"** is stated in the Principle, restated at 364-366, then echoed again in Daniel's take. The Verdict version is the earned one, so the others could be trimmed.
- **The "fixed artifact" disclaimer appears twice** (17, 132).
- **The title question "What did the fix fix?" is answered well:** it fixed the symptom of the widening by removing exhaustiveness.
