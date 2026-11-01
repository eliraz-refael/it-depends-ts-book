Independent isolated Principle-only reader, draft 2 (8c04256), 2026-11-01. Saw only the Principle; same four cases and follow-ups; fixtures on TS 7.0.2. (A first attempt on 2026-10-29 was cut off by an API authentication error before reporting; this is the rerun in a fresh directory.) Verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r2/principle.md` (two quoted paragraphs from "Daniel Compiler"). The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r2b/principle-fixtures/`. I ran them with tsc 7.0.2 using `--strict --noEmit --types "" --lib es2022`, and Node 22 for the runtime runs.

### (a) Route helper: `Route<"/users/:id">` changed to `Record<string,string>`, one CI run before and after, 30% faster

**Decision:** request changes. I would not approve.

**What I'd ask for:**
1. Repeated check times, before and after, with the same file list and options, changing only the parameter type.
2. A list of calls that must still compile and calls that must still be rejected. The rejected list should include a missing `id` and a misspelled key.
3. A statement of what now compiles.

My fixture `a-route.ts` shows what now compiles. `newHelper({})` and `newHelper({ idd: "1" })` both pass. The same calls fail on the old helper, and their `@ts-expect-error` lines report TS2578 "Unused" on the new one. The author then has to say what catches those mistakes now (a runtime check or a test), or accept the risk in writing.

**What would change my answer:** a stable speedup under matched conditions, plus a named owner for the newly legal mistakes. A profile is needed only if the counters don't explain the time.

**Sentences I relied on:** "measure the saving and say what newly compiles"; "Compare repeated times with the same workload, file list and options, changing one suspected part"; "show what now gets through. Name what catches it instead, or accept that risk explicitly."

**Rating:** Clear.

**Follow-up (the old run included a generated caller file that the new run omits):** no, that hasn't been shown to be a type optimization. The rule covers this exactly: "Otherwise you may be celebrating work you stopped doing." Repeated runs don't help when the file list differs.

My fixture `perf/` shows how much the file list can account for. It has 3000 generated callers, and I ran each setup 3 times.

| Type | File list | Check time | Instantiations |
|---|---|---|---|
| Old | with generated callers | ~0.148s | 140,237 |
| New | without generated callers | 0.006s | 2,009 |
| Old | without generated callers | 0.006s | 2,141 |
| New | with generated callers | ~0.060s | 5,015 |

- Old with callers against new without callers looks like a 25x gain.
- Without the generated callers, old and new take the same time. The type barely matters there.
- With the file lists matched, the type change does save time, but about 2.5x, not 25x.

So the claimed number mixes two changes. Only the matched comparison measures the type. **Rating:** Clear.

### (b) `UserId` brand said to slow a hot path; proposal is plain `string`

**What I'd inspect:** emitted JS, before measuring anything. In my fixture `b-brand.ts`, the emitted bodies of `lookupBranded` and `lookupPlain` are identical (I checked with diff). A brand is a type annotation that disappears at compile time, so it cannot cost anything at runtime. If the colleague means type-check time, that is a separate question and needs its own repeated, matched measurement.

**Sentences I relied on:** "Are you speeding up checking or running?"; "Comparing emitted code can clear an erased annotation of runtime cost." **Rating:** Clear.

**A fixture result worth knowing:** my naive Node microbenchmark (`bench.mjs`) gave "branded" ~18ms against "plain" ~8ms, stable across 3 repeats. When I swapped the run order (`bench-swapped.mjs`), the result flipped: branded ~7–11ms, plain ~20–25ms. The function bodies are identical, so this is an ordering effect in the JIT. Repeated, stable times still pointed the wrong way, and only the emitted-code comparison settled it. The rule's ordering is right (emitted code before timing), but "compare repeated times" alone would not have caught this.

**Follow-up (the proposal also removes the throwing `toUserId`):** no, my answer to (b) doesn't settle it. `toUserId` is code that actually runs, so it can cost something. In my fixture, validate-then-lookup took ~87ms against ~8–18ms for lookup alone. Removing it also changes what gets through at runtime: malformed ids reach the handler. The reviewer needs:
- the validator's cost measured on the real hot path, not a loop;
- whether the validation can run once at the boundary instead of on every call;
- what now gets through, and who catches it or accepts the risk.

**Sentences I relied on:** "a validator that runs needs its own measurement"; "Whether you remove a type constraint or runtime validation, show what now gets through." **Rating:** Clear.

### (c) Mapped-tuple `emit` replaced by generic `emit<E>`; literal success and literal wrong-payload tests unchanged

**Decision:** not sufficient evidence to merge. The two literal tests only show that the obvious typo is still rejected.

Fixture `c-emit.ts`: with `declare const ev: keyof Events`, the call `emitNew(ev, { code: 1 })` compiles (TS2578 on its expect-error line). The old rest-tuple version rejects the same call. E is inferred as `"paid" | "failed"`, so the payload type becomes `{id} | {code}` and an event and payload no longer have to match. A non-literal event with the wrong payload is exactly what the generic version lets through.

**What I'd ask for:**
- a list of combinations that must stay forbidden, including non-literal and union-typed event names;
- a decision: keep the tuple form, add a single-member guard on E, or record that this risk is accepted;
- the speed measurement, which the PR only asserts.

**Sentences I relied on:** "Write down the calls that must stay legal and the combinations that must stay forbidden. Rejecting the same typo doesn't prove both survived." **Rating:** Clear that the evidence is insufficient. I had to infer which case to try (the widened event). The rule says "combinations" but doesn't hint that non-literal inputs are where this tends to break.

**Follow-up (would `NoInfer<>` fix it?):** no, verified. `emitNoInfer(ev, { code: 1 })` also compiles. `NoInfer` only stops the payload from influencing what E is inferred as, and here E is already inferred as a union from `event`. The literal wrong-payload test passes with or without it, so it looks like a fix without being one. **Rating:** Not enough. The rule says nothing about `NoInfer`; this came from my own knowledge and the fixture.

### (d) Type adds 2M instantiations, owner found no cheaper form that keeps the required checks; PR removes it

**What the reviewer must know:**
- the actual time cost from repeated, matched runs (2M instantiations is not a number of seconds);
- the list of calls that must stay legal and stay forbidden that the type enforces;
- what now gets through without it;
- what catches those mistakes instead, or who explicitly accepts the risk.

If nothing catches them and nobody accepts the risk, the PR shouldn't merge.

**Sentences I relied on:** "Compiler counters describe work; they aren't a price list in seconds"; "Name what catches it instead, or accept that risk explicitly. Someone has to own the mistake that now compiles." **Rating:** Inferred. The rule says what evidence is required, but gives no way to weigh a known cost against a known check. That trade-off is the whole case here. The rule also never says "a measured cost can be the right price to pay."

**Follow-up (replacement has more instantiations but less elapsed time, same callers and rejections):** don't reject it because the counter went up. Elapsed time under matched conditions is the measure of the saving, and the counters are for diagnosis. I'd ask that the time difference be repeated so it isn't noise. **Sentence:** "Compiler counters describe work; they aren't a price list in seconds." **Rating:** Clear in spirit, slightly inferred. The rule never says outright "judge by elapsed time." I didn't build a counter-versus-time divergence fixture for this.

### 1. Is the rule clear and testable?

Mostly yes. It works as a reviewer's checklist: measure under matched conditions, say what newly compiles, list what must stay legal and stay forbidden, compare emitted code for type-only changes, measure validators separately, and name a catcher or an owner. Every case except the `NoInfer` follow-up could be answered from its sentences.

**Strongest sentences:**
- "Compare repeated times with the same workload, file list and options, changing one suspected part." It is concrete, checkable, and settled (a) outright.
- "Someone has to own the mistake that now compiles." It forces a decision.

**Weakest sentences:**
- "Are you speeding up checking or running?" It is a question, not a rule. It is useful, but you can't pass or fail a PR on it.
- "Rejecting the same typo doesn't prove both survived." "Both" points back across a sentence to the legal calls and the forbidden combinations. "Same typo" is cryptic on first read. This is the sentence that matters most for (c), and it is the hardest one to read.

**Undefined or ambiguous terms:**
- "workload" next to "file list": it's unclear whether these are different things.
- "suspected part".
- "Compiler counters": it never names `--extendedDiagnostics` or instantiations.
- "trace or CPU profile": no flags named (`--generateTrace`, `--generateCpuProfile`).
- "clear an erased annotation of runtime cost": a dense phrase for "show it costs nothing at runtime."

**Gap:** there is no guidance for (d), when the constraint is worth its cost. The rule is written from the point of view of someone tempted to remove a constraint, not someone defending one.

### 2. Does it read like a person speaking?

Partly. It reads as a stack of imperatives wrapped in quotation marks, more spec than speech.

**Where I enjoyed it:**
- "Otherwise you may be celebrating work you stopped doing." This is the best line. It is wry, and it describes a real failure.
- "Compiler counters describe work; they aren't a price list in seconds."
- "Someone has to own the mistake that now compiles." This one lands.

**Where it dragged:** the second paragraph is five rules in a row with no breathing room and no example. It also has no speaker tag, so I assumed it was still Daniel. "Comparing emitted code can clear an erased annotation of runtime cost; a validator that runs needs its own measurement" reads like a lint rule. One concrete detail (a typo'd route key, say) would make it more fun to read.

### 3. Did the fixtures contradict anything?

No claim was contradicted. Confirmed:
- An erased brand emits identical JS.
- A validator has a real cost (~87ms against ~8–18ms in my loop).
- Differing file lists can create a fake speedup (a type swap that looked 25x was about 2.5x when matched).
- Matching literal-typo tests can hide a lost rejection (the widened `ev` case).

One nuance the rule misses: my microbenchmark gave repeated, stable times in the wrong direction because of run order. Repetition alone doesn't remove a systematic bias. The emitted-code check is what got it right, so the rule might say to do that check before timing anything for a type-only change, not just that it "can" help.
