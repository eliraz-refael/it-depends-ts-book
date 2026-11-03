# Targeted recheck: Bonus 3 draft 2 (`75182a8`)

2026-11-02. A fresh, isolated reader read only the chapter, rebuilt its project state by state with TypeScript 7.0.2 and Node 22.23.4, verified every runnable claim and scored review 1's problems (P1–P6). The report below is verbatim.

## Recheck report

I read only the chapter file. I rebuilt every state under `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b3d2/rebuild/`, using tsc 7.0.2 and node v22.23.4. Each state has its own snapshot directory, and the page's diffs are saved in `rebuild/patches/`. I applied each diff with `patch -p1` to the state it follows, and every hunk applied cleanly.

The snapshots are:
- `s0`: the original.
- `s1`: the submitted patch.
- `s1b`: the submitted patch with the original badge.
- `s0-mobile` and `s1-mobile`: those states with the mobile caller added.
- `s1-typo` and `s0-typo`: the typo experiments.
- `s3` and `s3-mobile`: the `as const` repair, without and with the mobile caller.
- `s4`, `s4-mobile`, `s4-typo` and `s4-swap`: the final version and its experiments.
- `iso0`, `iso1`, `iso1b` and `s1ann`: the isolatedDeclarations experiments.
- `probe-iso`: my own extra probe.

### Reproduction table

| Claim | Result |
|---|---|
| Original compiles; `node check.ts` prints `3 statuses, 3 badges: passed` | Reproduced exactly |
| Submitted patch compiles; same output | Reproduced exactly |
| Submitted provider + original `badge.ts`: TS2345 `Argument of type 'string' is not assignable to parameter of type 'never'.` at `assertNever(status)` | Reproduced exactly (`badge.ts(13,33)`) |
| Declaration diff of `types/status.d.ts` (one line, `@@ -1,2 +1,2 @@`, union → `string`); both compiles succeed | Reproduced exactly, hunk header included. The other `.d.ts` files are byte-identical |
| `order.d.ts` unchanged | Reproduced |
| `mobile.ts` compiles with the original provider | Reproduced |
| `mobile.ts` with the submitted provider: TS2322 `Type 'string' is not assignable to type '"paid" \| "partial" \| "refunded"'.` | Reproduced exactly (`mobile.ts(6,3)`) |
| Typo `all: "refund"` on the submitted patch still compiles | Reproduced |
| `badge({ paidCents: 1000, refundedCents: 1000 })` returns `refund` | Reproduced. The page doesn't say how he calls it; I wrote a two-line `probe.ts` |
| `node check.ts` fails with `Expected refunded, got refund` | Reproduced. The message is exact; Node adds a stack trace |
| Typo in the original: two errors, TS2678 `Type '"refunded"' is not comparable to type '"paid" \| "partial" \| "refund"'.` and TS2345 `Argument of type '"refund"' is not assignable to parameter of type 'never'.` | Reproduced exactly (`badge.ts(12,10)` and `(13,33)`) |
| "Two words" diff: restored badge is identical to the original, compiles, check passes, `status.d.ts` byte-identical to the original | Reproduced exactly (cmp-verified). The mobile caller compiles too |
| Final `status.ts` with the original badge compiles, all six assertions pass, mobile compiles | Reproduced |
| Final declaration "names our local `OrderStatus`… no new named export" | Reproduced. The output is `type OrderStatus = …; export declare function orderStatus(order: Order): OrderStatus; export {};`. The page doesn't mention the `export {}` line, but Eden's description is accurate |
| Final + typo: TS2820 `Type '"refund"' is not assignable to type 'OrderStatus'. Did you mean '"refunded"'?` at the table, plus TS2322 at the return | Reproduced. The TS2822 message is exact. The TS2322 reads `Type '"paid" \| "partial" \| "refund"' is not assignable to type 'OrderStatus'.` with the TS2820 hint nested under it; the page doesn't quote it, and its explanation is right |
| Swapping `paid`/`refunded` in the table satisfies the union and leaves the declaration identical | Reproduced. It compiles, the `.d.ts` is identical, and the tests fail (`Expected paid, got refunded`) |
| `isolatedDeclarations` on the original: TS9007 `Function must have an explicit return type annotation with --isolatedDeclarations.` on `orderStatus` | Reproduced exactly (`status.ts(3,17)`) |
| Submitted patch + `: string` + assistant's fallback passes with the flag | Reproduced. Control: with the original badge it fails TS2345, not a flag error |
| "The flag even allows some simple inferred exports. It doesn't require a return annotation on every export." | Reproduced on 7.0.2, more broadly than I expected. `export function one() { return 1; }`, `export const arrow = () => 1` and `export const obj = {a:1}` all pass. A function with two returns gets TS9007, an empty-body function gets TS9007, and a non-const array gets TS9017. The linked page is the TS 5.5 release notes, which may describe stricter rules than 7.0.2 enforces |
| Setup: `node_modules/.bin/tsc` | I couldn't tell how from the page. The `package.json` shown is only `{"type": "module"}`, with no `typescript` devDependency, so `npm install` wouldn't produce that binary. I used the provided compiler |

Every runnable claim reproduced, and none failed.

### Scores against the earlier criticisms

**P1, the referenced-declaration habit: mostly fixed.** Daniel now does it: "I checked `order.d.ts` too. It's unchanged. An identical import line doesn't tell me whether `Order` still means the same thing." It's a negative result with no stakes, though, and it drops in right after Oded's concession as a checklist item rather than a beat. The stronger demonstration is incidental: Eden follows the new alias, "The declaration names our local `OrderStatus` now. Same three statuses". The `typeof` case still lives only in the Additional Take.

**P2, the isolatedDeclarations scene: mostly fixed.** The fallback is now explicit: "annotates its function `orderStatus(order: Order): string`. With the assistant's fallback, it passes the flag." "Passes the flag" is slightly loose, because the annotation satisfies the flag whatever the badge; the badge only decides whether the project compiles. The narrator's documentation paragraph has become Daniel's dialogue: "The flag even allows some simple inferred exports. It doesn't require a return annotation on every export." It still ends on a link and a stage direction: "He opens the [isolated-declarations documentation]…, then discards the experiment."

**P3, the narrator as manual: mostly fixed.** The configuration is now code blocks, not a prose list, but it still interrupts the dialogue: "The review project runs TypeScript 7.0.2 and Node 22.23.4. Node runs the TypeScript directly. Its settings:" Lab disclaimers survive in diegetic form: "He labels the experiment in the review: **deliberate typo; not in the submitted code**." So do reproducibility stage directions: "with the same compiler and settings", "Eden sets the copied adapter aside", "Eden puts the unchanged mobile adapter back; it compiles too". The release-notes paragraph about the declaration's representation is gone, reduced to Eden's single line.

**P4, the muddled exchanges: fixed.**
- The approval joke now runs the right way: "Oded offers to read them aloud, if that will count as approval."
- "It used to have an objection" is replaced by "It left `assertNever` with nothing to assert." This is slightly imprecise, since the patch deletes the call rather than changing what gets asserted, but it is clear.
- Eden's line is now "Back in the generics argument, I asked for explicit return types on APIs we intend to keep".
- The Additional Take is now concrete: "Narrowing a parameter can break a caller elsewhere that still passes a `string`, even if every caller in this repo compiles. A search here won't find that caller."

**P5, the hedged second paragraph: fixed.** It now reads "For each changed signature, I ask which old calls it rejects or which results it no longer guarantees… Even with identical declarations, I run the runtime tests to check the values and effects." It says "runtime tests", not "assertions", and the only remaining hedge is "needn't".

**P6, the repeated "identical declarations" line: fixed.** It is stated once in the Principle ("Even with identical declarations, I run the runtime tests"). It is then paid off once, concretely, in the Verdict: "Swapping `paid` and `refunded` would satisfy that union perfectly." / "And the declaration report would be identical." I verified that payoff.

### Reader report

**1. What it taught me.** "No public API changes" is a claim about emitted declarations, not about the lines you edited. An inferred return can widen silently: here a mutable lookup table turned the return into `string`. When a patch "fixes" a caller to make it compile, that repair is the evidence: put the old caller back and read the error. In my next review I'd diff `tsc --declaration` output before and after any refactor of an exported function. I'd treat any edit to a consumer in a "refactor" patch as a red flag to revert and recompile, and I'd ask whether an exhaustiveness check was removed, not just whether the tests pass.

**2. The scene I'd retell is "It says refund"**, because it turns a type argument into a concrete bug and gives Oded a fair win:

> **Oded**: "And my test catches your typo."
> **Noam**: "It does. I haven't found a bug your tests missed. I've found a check the patch removed."

Close behind is "We replaced the check with permission to display it."

**3. Enjoyment and friction.**

Enjoyed:
- The opening ("a green pull request and a meeting in six minutes. He considers these two facts compatible." / "They are becoming less compatible.").
- "No *written* public API changes." / "You don't get to insert a word after I've reviewed the sentence."
- "I'd like that in the minutes." / "We're not in the meeting yet."
- "We lost the compiler asking me to fix a function that works. That was the attraction."
- "As in a button?"
- The callback ending, "a meeting four minutes ago."

Re-read or flat:
- Daniel's `order.d.ts` line arrives from nowhere, between "That is a caller I hadn't checked" and "Eden sets the copied adapter aside."
- Daniel's "An explicit return gives that decision a separate place to live. Checking the table against it also puts the typo error where the label is written." is abstract, and the table is checked against `OrderStatus` via `satisfies`, not against the return.
- Oded's "Nobody has asked to import the refund calculation's vocabulary" conflates `RefundLevel` (refund vocabulary) with `OrderStatus` (status vocabulary). The mobile adapter, which hand-copies the union, is arguably asking for it.
- The configuration block mid-dialogue (lines 60–89) stalls the scene.
- The isolatedDeclarations scene ends on a documentation link. It is the weakest landing in the chapter.

**4. Voices.**
- **Oded** is distinct and wry, with a real position: the values are right and inference is fine. He is not a strawman: his tests catch the typo and his `as const` fix restores the declaration byte for byte.
- **Noam** is a terse, probing reviewer whose position is "what did the fix fix?"
- **Eden** is the consumer advocate, holding an outside caller and a standing demand for explicit returns. Eden is "he" here; I couldn't check that against a bio.
- **Daniel** is the explainer-arbiter. His lines are the ones that edge toward manual ("The table properties are mutable. Their values widened…"; "The flag even allows some simple inferred exports…"), though that fits his role. Daniel and Noam overlap a little in the middle.

Nobody sounds like the narrator, but Daniel comes closest.

**5. The Verdict** is earned and stated as decisions. Eden decides what to keep. Noam sets a review rule: attach before-and-after declarations, including referenced types, and show the error behind any caller repair. Oded keeps the runtime tests, with a concrete reason. Oded's rewritten summary is a nice touch, and the ending callback satisfies.

**6. Technical accuracy and delivery.**
- Nothing I tested is wrong.
- Minor imprecisions:
  - "passes the flag" (see P2).
  - "left `assertNever` with nothing to assert" (the call was removed and the function is now unused).
  - The isolatedDeclarations link goes to TS 5.5 notes, while the chapter runs 7.0.2. On 7.0.2 even `export function one() { return 1; }` passes the flag, so Daniel's statement is true but the linked page may describe stricter rules.
- Setup gap: `package.json` declares no `typescript` dependency, yet the commands use `node_modules/.bin/tsc`.
- Delivery: everything the Principle promises is delivered:
  - Declarations compared with the same compiler and settings.
  - The old caller put back.
  - An outside caller checked.
  - The owner states the contract.
  - Runtime tests kept.
  - Referenced types checked: weakly, via `order.d.ts` and `OrderStatus`.
  - The "unchanged alias can name a changed type" case is shown only in the Additional Take.
- No harmful repetition remains.

One tooling note: a safety check blocked one `rm -rf` of a scratch subdirectory. Nothing was deleted; I used fresh directories instead, so all snapshots remain under `rebuild/`.
