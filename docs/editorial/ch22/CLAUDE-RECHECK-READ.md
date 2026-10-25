# Reader report: Chapter 22, targeted recheck (draft 2)

Draft 2 (`89f14da7…`, `e4838bc`), 2026-10-25. A fresh, isolated reader had only the chapter, with
Chapters 1–21 and the book's premise stated. It was asked to verify every claim, to check each of
draft 1's problems (A–E) explicitly, and to say where it enjoyed the chapter and where it got bored.
It could run only the book's TS 7.0.2 binary and Node 22, and installed nothing. The report is
copied verbatim.

---

# Chapter 22 reader report: "The Policy's Alibi"

## 1. Verification

**How I checked it:** I pulled all 12 fences out of the chapter in order and joined them into one file (`all.ts`). I compiled it with the exact command given. I could not use the TypeScript JS API (the worktree's `typescript/lib/typescript.js` doesn't exist, presumably because it is TS 7), so I hand-stripped the types into `all.mjs` and ran it on node 22. I also wrote four variant files (t1–t4) to test specific claims. All files are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch22read2/f/`.

| Claim | Result |
|---|---|
| `holds(active, order)` gives `true` | matches |
| `JSON.stringify(active)` gives `{"reviewAbove":500}`, and the `===` comparison gives `true` | matches |
| `holds(restored, order)` gives `false` | matches |
| `const savedPolicy: Json = active` is error TS2322, and "It names `extraHold`" | matches. This is the only error in the assembled program. The message reads: `Type 'LivePolicy' is not assignable to type 'Json'… Property 'extraHold' is incompatible with index signature.` |
| `auditRecord … as const satisfies Json` compiles, and the replay gives `true` | matches. I also round-tripped it through JSON: replay gives `true` and `held` is `true`. |
| "using `as const` to keep that name as a literal key for the lookup" | matches. Without `as const` you get TS7053 ("expression of type 'string' can't be used to index…"). |
| Chen/Eden: a narrower type hides `extraHold` from `Json` | matches. `const narrow: {reviewAbove:number} = active; const s: Json = narrow;` compiles cleanly. |
| `ruleHold(order)` and `templateHold(order)` both give `{"hold":true,"reasons":["review-hold"]}` | matches |
| "`never` makes us handle the new kind" | matches. Adding `{kind:"accountAge"}` with no case gives TS2322 `… is not assignable to type 'never'`. |
| The description of the samples (totals 500/501, FR/US, two refund histories, oldest exactly 7 days) | matches the code |
| 5 holds, and rule and template outputs are identical (`true`) | matches |
| `expected` array | matches the actual `ruleHold` outputs exactly |
| `tooBroad` has 2 mismatches | matches |
| Gil: the two extras are "the low-total FR order without velocity, and the low-total US order with it" | matches (sample-0: 500/FR/[1,2,8]; sample-3: 500/US/[1,2,7]) |
| Eden: "Three of Gil's eight samples" that country-and-velocity lets through and the new template holds | matches (sample-4, 6 and 7, all at total 501) |
| Dafna: tree-flattening "being in FR is enough. So is having the refunds, even outside FR" | matches |
| Eden: `large \|\| country \|\| velocity` in the template function "would compile" | matches (t4 compiles) |
| Order 42 under `review-2` and under the loaded template | both `true`, consistent with the text |

**Code mismatches:** none. Every output, count, code and message the text states is correct.

**Narrative mismatch (one):** Gil's table puts "Change the refund window from seven days to fourteen" under *Parameter values*, and Gil says "Both versions handle the six parameter changes in the console." But the history says the window was *fixed* at seven in the version-1 settings, and "Version 2 added `days` when analysts asked to edit that window." So the request to edit the window needed a format change. It was not a console edit. Also, `params` today has `days: 7`, so a change to fourteen either never happened or was reverted, and the text says neither.

## 2. The previous problems (A–E)

**A. The policy's history: partly fixed.**
This is what I could reconstruct, in order:
1. Start: "It started with separate total and country checks."
2. On the third: total > 500 OR a refund-velocity hook ("Eden added refund velocity to the total check"). This matches the table's *New condition* row.
3. First regrouping: "**FR AND velocity**, dropping the total branch; its version-1 settings stored the count and fixed the window at seven days." This matches the table's first *new grouping* row (implied, not given as the example).
4. Version 2: "added `days` when analysts asked to edit that window."
5. Now: "**large total OR (FR AND refund velocity)**", which is the table's example row.

The version-1 settings now have a clear place (step 3). Three problems remain:
- The table's *Parameter values* example contradicts step 4 (see Verification).
- Step 1 is vague. Were "separate total and country checks" two templates? Were both active? On the third, the active policy has no country check at all, and the saved record `{"reviewAbove":500}` doesn't look like a named-template record (no name, no version). Yet line 131 says "The console already uses named templates." I couldn't tell whether templates existed on the third.
- There are two numbering schemes, both using "2". `"review-2"` is the evaluator from the third (total OR velocity). "Version 2" is the later settings format for FR-AND-velocity. On a first read I wondered whether `review-2` *was* the version-2 settings. `Rule` also carries `version: 2` for a tree format that never had a version 1.

**B. Templates are the current design: fixed.**
"The console already uses named templates: analysts choose one and edit its fields, while engineers write the combinations." Then: "Dafna wants to replace the template selector with an editor." This is unambiguous, and it comes before the tree.

**C. Dafna's strongest case: mostly fixed, with one new snag.**
- "Three of Gil's eight samples. The new template holds them." This is explicit and correct.
- She does make the suppressed-demand argument: "And you counted tickets, not everything they wanted. If asking means waiting for us to write code, they may stop asking." Gil concedes honestly: "I can't count requests they didn't file. Two doesn't tell us there were only two they wanted."
- The Verdict survives without an invented fact. It doesn't claim there are no held-back requests. It folds them into the trigger: "If there's another grouping waiting, it counts now." It owns that the threshold was negotiated: "Three is where we've agreed to start the work. You don't have to certify it." That is honest.
- The snag: in the Verdict Gil says "Three wasn't in my findings. I counted two requests." But a page earlier "three" *was* in his findings (his three samples). By then "three" has meant three refunds, three samples and the third regrouping. The line is meant to refer to the threshold, but it reads as if it contradicts Eden's "Three of Gil's eight samples." Changing it to "A third request wasn't in my findings" or "The number three isn't from my table" would fix it.

**D. Writing and loading a template: mostly fixed.**
"I can load the policy code separately from the orders service. One of us writes the template, another reviews its expression and replay cases, then we load that version." Together with Eden's "I'd want these same cases before loading the artifact" and the Verdict's reader/boundary fence, this is clear enough. One small gap: whether "load" means a deploy without an orders-service release is only implied ("separately from the orders service").

**E. Pacing of the middle: improved, but still the weakest stretch.**
My attention dropped at three places:
- The history paragraph (lines 133–135): "On the third, Eden added refund velocity to the total check. The first regrouping then replaced that policy with **FR AND velocity**, dropping the total branch; its version-1 settings stored the count and fixed the window at seven days. Version 2 added `days`…" That is four events and two version numbers in three sentences, with no character speaking. I re-read it twice and still had to rebuild it on paper for A.
- The `Params` setup fence ("Both proposals use the current settings…"). It is necessary, but it is dead air between two good lines.
- The old-settings exchange (lines 247–251): "I still need to open the old campaign activations. Their settings don't have `days`." It arrives as a non-sequitur, like a checklist item rather than something the scene pushed toward. "Campaign" appears here for the first time and is never explained.

The tree/template fences themselves read fine. Two exchanges keep them alive: "What if they want account age?" and "I'm not proposing a programming language with a debugger." / "I know. I'm asking whether we need to let them rearrange those joins yet."

## 3. New problems

1. **The window example contradicts the history.** Detailed above. This is the one real inconsistency.
2. **"review-2" versus "version 2" versus `Rule.version: 2`.** These are three unrelated "2"s. Consider renaming the evaluator (for example `"refund-hook"` or `"release-0303"`), or saying in one clause that evaluator names and settings versions are separate sequences.
3. **"campaign activations"** (line 247). Which campaign? I guessed it means the version-1 FR-AND-velocity activations, but the text doesn't say so.
4. **The repaired audit record doesn't match the template record.** The `auditRecord` shown uses `reviewAbove/refundCount/refundDays` under an evaluator name. The template decisions going forward use `Template` with `amount/country/count/days`, and the text never shows or says what their audit record contains. The last line, "the repaired record will say which release to ask", leaves me assuming that template decisions also log an evaluator version. Dafna says "the audit still needs the evaluator version," but nobody confirms it for templates.
5. **"That's the limit I'm offering. This request has one now."** "One" meaning "a template" took me a second to parse.
6. **The tail of the Turn (lines 337–339).** "We can continue accepting the old named records when we add trees." / "The old activations aren't waiting for the editor, then." This lands after the decision is effectively made and deflates the end of the Turn. It could move into the Verdict or be cut.
7. **"Sahar: … start the general editor at the third regrouping request."** Two regroupings have already happened, so "third" means "the next one." That is close to Dafna winning outright. That's fine, but a reader may wonder why it isn't simply phrased as "the next one." If the number is deliberate, a half-line acknowledging it would help.

## 4. Enjoyment and pacing

- **Best scene, the one I'd retell:** the alibi reveal. `JSON.stringify(active)` prints `{"reviewAbove":500}`, the `===` check against a policy with no hook prints `true`, and Dafna says "We asked the record for a reason. It gave the policy an alibi." Chen's "Two different policies, one record" lands right after. That stretch is genuinely fun and teaches the point immediately.
- **Also enjoyable:**
  - Gil's eight samples and the `tooBroad` replay. The "So the tree isn't the reason that mistake gets caught. The replay is." beat is a real insight, delivered by the character arguing *for* the tree, which I liked.
  - The Verdict's "You don't have to certify it."
- **Bored:** the history paragraph and the old-settings exchange, as quoted in E.
- **Length:** about right. The chapter doesn't feel long. The middle feels *dense* rather than long. Splitting the history paragraph into a short exchange (Eden recounting, Dafna correcting) would likely fix most of it without adding length.

## 5. Top remaining fixes, ranked

1. **Fix the *Parameter values* example** so it doesn't contradict "Version 2 added `days`." Either use a different example (a threshold change, say 500 to 400), or move the window request into its own row and say in the text that it needed code.
2. **Turn the history paragraph (lines 133–135) into dialogue or two shorter beats,** and settle whether the third's policy was a template.
3. **Rename `"review-2"`** (or say explicitly that it is a separate sequence) so it doesn't collide with "version 2" settings. Reconsider `Rule.version: 2`.
4. **Disambiguate Gil's Verdict line** "Three wasn't in my findings" from Eden's "Three of Gil's eight samples."
5. **Explain or replace "campaign activations,"** and give the old-settings exchange a cue so it doesn't arrive cold.
6. **Optional:** one line confirming that template decisions also log an evaluator version; move or cut lines 337–339.

**Readiness:** the code is fully correct. Previous problems B and C are essentially solved, and D mostly. The chapter does not need another full round. It needs one targeted pass on items 1–5, all local edits to a handful of lines, followed by a quick re-read of the middle.
