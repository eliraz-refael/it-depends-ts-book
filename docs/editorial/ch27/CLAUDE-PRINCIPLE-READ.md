Independent isolated Principle-only reader, draft 1 (26b7045), 2026-10-29. Saw only the Principle; four cases with follow-ups; fixtures on TS 7.0.2. Verbatim.

## Principle-only report

I read only `principle.md`. Fixtures are in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r1/principle-fixtures/ (a.ts, b.ts/b2.ts, c.ts/c2.ts, d1.ts/d2.ts). Every check ran on tsc 7.0.2 with `--strict --noEmit --types "" --lib es2022`.

### (a) Route helper changed to `Record<string,string>`, one 30% faster run
**Decision:** I would not approve. I'd ask for:
- repeated timings on the same workload and configuration with only this type changed;
- `--extendedDiagnostics` (the Files line) or `--listFiles` from both runs;
- a trace if the author wants to claim where the time went;
- a list of calls that must stay legal and calls that must stay rejected.

**Fixture:** `hrefNew({})` and `hrefNew({ idd: "1" })` now compile. `hrefOld` rejects both. The PR quietly drops the missing-key check and the typo-key check, so the "show what newly gets through and what catches it instead" sentence applies too.

**What would change my answer:** repeated, like-for-like timings, plus either a replacement check or an owner who accepts the risk in writing.

**Relied on:** "Compare the same workload and configuration with one suspected part changed, and measure the time repeatedly." Also "Write down which calls must remain legal…", "If you do remove a check, show the measured benefit, what newly gets through…" and "Someone has to own the mistake that now compiles."

**Rating:** Clear.

**Follow-up (generated caller file missing from the new run):** No, the type has not been shown to be optimized. The workload changed, which is exactly "celebrating work you stopped doing." The Files count from `--extendedDiagnostics` would expose it. Rating: Clear. This is the rule's best sentence doing its job.

### (b) `UserId` brand blamed for a runtime hot-path slowdown
**Decision:** First compare the emitted JS. My fixture emitted byte-identical JS for the branded and plain versions (`diff` reported IDENTICAL), so the brand can't cost anything at runtime. Then I'd ask which of the four things they mean is slow (checking, editing, building or running). If it's running, profile the real hot path. If it's checking, measure check time repeatedly.

**Relied on:** "Name what you're trying to make faster…" and "Compare the emitted code before blaming an erased annotation for runtime work."

**Rating:** Clear.

**Follow-up (also removes the throwing `toUserId`):** No, the emit comparison doesn't settle it. `toUserId` isn't an erased annotation. It's runtime code (the regex test and throw survive emit), so it could genuinely cost time, and removing it removes a runtime validation, not just a type check. The rule's "If you do remove a check…" sentence covers it if "check" includes runtime checks. But the rule never says that, and every other sentence is about type-checker checks. Rating: Inferred. The rule doesn't separate "the type stops forbidding this" from "the program stops validating this," and this follow-up turns on that difference.

### (c) Union-of-tuples `emit` replaced with a generic `emit<E>`
**Decision:** Not enough to merge. Passing the same literal tests is exactly what the rule warns about. My fixture found a hole the literal tests miss:
- With `declare const e: keyof Events`, `emitOld(e, { id: "x" })` is rejected.
- `emitNew(e, { id: "x" })` compiles, because E is inferred as `"paid" | "failed"` and the payload type becomes a union.
- `emitNew<"paid"|"failed">("failed", { id: "x" })` also compiles.

I'd ask for a written list of required rejections that includes the union-typed event case. The PR would need to keep rejecting it, or record who accepts the new risk.

**Relied on:** "Rejecting the same typo doesn't establish that a cheaper signature preserves those relationships." Also "Write down which calls must remain legal and which combinations must remain forbidden."

**Rating:** Clear for the decision. Finding the actual hole was my own work; the rule tells you to look, not where.

**Follow-up (`NoInfer<>` on the payload):** No. `emitNoInfer(e, { id: "x" })` still compiles, because E is still inferred from `event` as the full union. `NoInfer` only stops the payload from steering inference, and inference wasn't the problem. Rating: Not enough from the rule; this needed compiler knowledge and a fixture.

### (d) Removing a type that costs two million instantiations
**Decision:** Before deciding, the reviewer must know:
- the measured benefit in repeated elapsed check time on the same workload (two million instantiations isn't a number of seconds);
- which calls become legal once the type is gone;
- what catches those calls instead, or who accepts the risk.

The owner has said no cheaper form keeps the checks, so this is a trade between seconds and safety, not free cleanup.

**Relied on:** "Compiler counters… aren't a price list in seconds," the "If you do remove a check…" sentence, and "Someone has to own the mistake…".

**Rating:** Clear.

**Follow-up (more instantiations, less elapsed time):** Don't reject it for that. My fixture shows instantiations and time can move in opposite directions, repeated three times:

| Fixture | Instantiations | Check time |
|---|---|---|
| d1.ts (recursive tuple build) | 440,872 | about 0.41–0.45s |
| d2.ts (large union assignability) | 1,998 | about 0.58–0.61s |

d2 has 220 times fewer instantiations and is slower. If the same callers are accepted and the same calls rejected, and the elapsed time was measured repeatedly, the replacement is better. Rating: Clear from "counters… aren't a price list in seconds." The rule doesn't say which number wins, though; "Inferred" is fair for the conclusion that elapsed time is what you judge by.

### 1. Is it a clear, testable rule?
Mostly yes. It's a reviewer's checklist, and five of the eight sub-questions were answerable straight from the text.

- **Strongest:** "Compare the same workload and configuration with one suspected part changed, and measure the time repeatedly. Otherwise you may be celebrating work you stopped doing." It's testable, the payoff phrase is memorable, and it decided (a) and its follow-up.
- **Also strong:** "Rejecting the same typo doesn't establish that a cheaper signature preserves those relationships." It decided (c).
- **Weakest:** "Use a trace to find where the checker spends its time." It's an instruction with no criterion: when is a trace required, and what counts as an answer? It also never says trace means `--generateTrace`. The four-way split (checking/editing/building/running) is named and then never used again in the rule.

**Undefined or ambiguous terms:**
- **"check"** in "If you do remove a check." Is it a type-level constraint or also runtime validation? This broke (b)'s follow-up.
- **"those relationships."** The antecedent is "calls… legal / combinations… forbidden," which works, but "relationships" is a third word for the same thing.
- **"Compiler counters."** Readers who haven't met `--extendedDiagnostics` won't know which counters are meant.
- **"configuration."** Does it include the file list? It should say so; (a)'s follow-up depends on it.
- The rule never says which metric decides when counters and time disagree.

### 2. Does it read like a person speaking?
Partly.
- **Enjoyed:** "Otherwise you may be celebrating work you stopped doing" and "Someone has to own the mistake that now compiles." Both have a voice and land.
- **Bored me:** the run of imperatives with no rhythm change: "Name… Compare… measure… Use a trace…" The first paragraph reads like a lint config spoken aloud. "Those are different measurements" is filler. "They aren't a price list in seconds" is good, but it sits between two dry commands and gets lost.
- **Hard to read:** the second paragraph's last long sentence ("show the measured benefit, what newly gets through, and what catches it instead—or which risk you're accepting") is a dense four-part list. It's correct, but it's hard to read aloud as dialogue.
- **No character on show:** nothing makes "Daniel Compiler" sound like a specific person rather than a narrator in quotation marks.

### 3. Did my fixtures contradict anything?
No. Every claim held:
- Erased annotations emit identical JS.
- Counters don't track seconds; d2 has fewer instantiations and is slower.
- Same-typo tests miss lost relationships, as the union-event hole in (c) shows.
- `--generateTrace`, `--listFiles` and the Files count all exist in tsc 7.0.2, so the measurements the rule asks for are available.

The one weak spot: "Compare the emitted code before blaming an erased annotation" could lead a reader to wrongly clear `toUserId`, which isn't erased. That isn't a false claim, but the rule doesn't guard against misapplying it.
