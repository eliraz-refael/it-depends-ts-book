Independent isolated Principle-only reader, draft 3 (a67547c), 2026-11-01. Saw only the Principle; same four cases and follow-ups; fixtures on TS 7.0.2. Verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r3/principle.md`. All the fixtures are under `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch27r3/principle-fixtures/`, in subfolders `a/`, `b/`, `c/` and `d/`. Compiler: tsc 7.0.2, run with `--strict --noEmit --types "" --lib es2022`.

For reference I numbered the rule's sentences:
- **S1** "measure the saving and say what newly compiles"
- **S2** "Checking or running?"
- **S3** "annotation-only → compare emitted code; validators need measuring"
- **S4** "Change one thing; repeat with the same files, workload and options"
- **S5** "celebrating work you stopped doing"
- **S6** "Counters aren't seconds. If they don't explain the time, profile."
- **S7** "List which calls must stay legal / forbidden"
- **S8** "cheaper signature can reject the typo and accept another mistake"
- **S9** "name what catches mistakes instead—or accept the risk"
- **S10** "Someone has to own the mistake"

### (a) Route helper to `Record<string, string>`
**Decision:** don't approve.

**What I'd ask for:**
- Several repeated runs before and after, with the same file list and the same options, plus `--extendedDiagnostics` output from each.
- A statement of what newly compiles. My fixture (`a/old.ts`, `a/new.ts`) found two calls the old type rejected that now compile: `userUrl({ idd: "1" })` (typo) and `userUrl({})` (missing id). Both `@ts-expect-error` lines turn into TS2578 "unused directive".
- The list of calls that must stay legal and must stay forbidden, and who owns the typo-and-missing-param bugs that now get through.

**What would change my answer:** repeated, same-input timings showing a real saving, plus an explicit acceptance of those two newly legal mistakes, or a test or runtime check that catches them instead.

**Also checked:** the emitted JS is byte-identical. This is purely a checking-time change, so a runtime argument doesn't apply.

**Rules used:** S1, S4, S7, S9, S10. **Rating:** Clear.

**Follow-up (generated caller file missing from the new run):** No, the type hasn't been shown to be optimized. The comparison is invalid under S4, and S5 names this exact situation. My fixture shows why:
- I generated 3,000 callers (`a/gen.ts`).
- Old type with the callers: about 0.12–0.13 s check time and 98k instantiations.
- New type without the callers: about 0.007 s.
- Old type without the callers: also about 0.007 s.

So almost the whole apparent win came from dropping the file. With the same files, the new type really is faster (0.055 s vs 0.125 s over 5 repeats), so there is a real but much smaller saving to report honestly.

Strictly, nothing was "optimized" here: a constraint was traded away. S1's "trading a type constraint" wording frames it correctly. **Rating:** Clear.

### (b) `UserId` brand to plain `string` "for the hot path"
**What I'd inspect:** first ask "checking or running?" (S2). For "running", compare the emitted code (S3).

`b/brand.ts` and `b/plain.ts` emit byte-identical JS. The brand can't cost anything at runtime, so the hot-path claim is false as stated and there's nothing to time. If they actually mean type-check time, measure per S4 and S6. Either way, the plain version newly accepts `getUser(orderId)` (TS2578 on the expect-error line), so S1 and S7 apply too.

**Rating:** Clear.

**Follow-up (also removes the validating `toUserId`):** No, the emit comparison no longer settles it. The validator is real runtime code, so "validators need measuring" (S3) applies, and so does S9: name what catches bad IDs instead, or accept the risk.

My micro-benchmark (`b/bench.mjs`, regex check, 5M calls) cost about 95 ms per 5M calls, roughly 20 ns per call. That is measurable but probably not significant unless the hot path is extreme. That has to be shown against the real workload, not argued.

I'd also ask for this to be split into two PRs. Brand removal and validator removal are separate trades, and S4 says change one thing. The split is my inference from S4; the rule doesn't say it about PRs. **Rating:** Clear on "measure and name the replacement"; Inferred on the split.

### (c) Correlated-tuple `emit` to generic `emit<E>`
**Decision:** not sufficient. Two literal tests don't cover the cases where the two signatures differ (S7, S8). My fixture is `c/old.ts` / `c/new.ts`, with `declare const ev: keyof Events`.

| Call | Old | New |
|---|---|---|
| `emit(ev, pl)`, where `pl: Events[keyof Events]` | Rejected | Accepted (mismatched pair gets through) |
| `emit(ev, { code: 1 })` | Rejected | Accepted |
| `emit(...pair)`, where `pair` is the correlated tuple union | Legal | TS2556 (previously legal call now fails) |
| Generic forwarder `fwd<K>(k, p: Events[K]) { emit(k, p) }` | TS2345 | Accepted |

So legality changed in both directions. **Ask for:** a written legal/forbidden list that includes union-typed events, spread tuples and generic forwarders, compiled against both signatures.

**Rating:** Clear for the method. The specific holes come from running the compiler, not from the rule.

**Follow-up, `NoInfer<Events[E]>`:** No. With `noinfer.ts` the results are identical to the generic version: both mismatched-union calls are still accepted, and the spread call still fails. `E` is already inferred from `event` alone; the problem is that `E` can be the whole union, which `NoInfer` doesn't change.

The rule doesn't mention `NoInfer`. It gives the test (S7); the compiler gives the answer. **Rating:** Inferred.

### (d) Removing a type that adds 2M instantiations, with no cheaper form known
**What the reviewer must know:**
- The measured saving in seconds, on the same files and options (S1, S4, S6). Two million instantiations is not a time.
- What newly compiles (S1).
- The legal/forbidden call list (S7).
- What catches those mistakes instead, or an explicit risk acceptance with a named owner (S9, S10).

**Where the rule stops:** it gives no basis for deciding whether the time saved is worth the checks lost. There's no threshold, and nothing on who decides. "No cheaper form exists" isn't addressed at all. **Rating:** Clear for the evidence list; Not enough for the decision itself.

**Follow-up (more instantiations, less elapsed time, same callers and rejections):** Don't reject it because of the counter. S6 is direct. My fixture (`d/`) shows the counter and the clock disagreeing:
- `manyinst.ts` (recursive tuple counter): 137,542 instantiations, 0.11 s check time.
- `fewinst.ts` (two 1,500-member non-discriminated unions compared): 1,998 instantiations, which is the empty-file baseline (so it adds none), and 0.31 s check time.

The rule only says to profile when counters don't explain time. It doesn't say elapsed time wins, and it says nothing about memory, which more instantiations can increase. **Rating:** Clear for "don't reject on the counter"; Inferred for "accept".

### 1. Is it a clear, testable rule?
Mostly yes. Each case reduced to a concrete reviewer request.

**Strongest:**
- S7 converts directly into `@ts-expect-error` / must-compile tests.
- S4 is precise enough to invalidate the case (a) follow-up on sight.

**Weakest:**
- S2 "Checking or running?" is a fragment. The reader has to work out that it means "which kind of speed are you claiming?".
- S10 "Someone has to own the mistake" is rhetorical. Own how: a named person, a test, a ticket? It doesn't change what I'd ask for beyond S9.

**Undefined or ambiguous terms:**
- "counters": presumably `--extendedDiagnostics` instantiations and types, never named.
- "profile": which tool? `--generateTrace`? `--cpu-prof`?
- "workload": for type-checking it overlaps with "files".
- "annotation-only": does an `as` count? `satisfies`? An enum changes emit.
- "validators": runtime checks presumably, but a TypeScript reader could take it to mean type-level validation.

**Gaps:**
- S1 says "say what newly compiles" but not "what newly fails". Case (c) showed a cheaper signature can also break previously legal calls. S7's "must stay legal" covers this only if the reader connects the two.
- There's no decision rule for when the speed is worth the lost checks (case d).

### 2. Person speaking, or notes?
Paragraph 2 sounds like a person: an expert telling a team what they'll be held to. Paragraph 1 reads like slide bullets read aloud. It packs five topics into seven short sentences: measuring, checking vs running, emit comparison, controlled reruns, counters and profiling. The notes-iest sentence is "For annotation-only changes, compare emitted code before timing; validators need measuring.": a semicolon joining two imperatives with different subjects.

What I enjoyed:
- "Otherwise you're celebrating work you stopped doing." is the best line. It's funny, it's true, and it decided case (a) for me.
- "Counters aren't seconds." is crisp and memorable.
- "A cheaper signature can reject the typo and accept another mistake." is concrete and slightly ominous in a good way.

It never bored me, because it's short. But paragraph 1 made me reread S2/S3 to decode them, which is effort, not boredom.

### 3. Did any fixture contradict a claim?
No. Every claim held:
- Emitted JS was identical for both annotation-only changes (route and brand).
- The validator had a measurable runtime cost.
- Dropping a file faked most of the speedup.
- The cheaper `emit` rejected the literal typo but accepted mismatched union pairs.
- Instantiation counts moved opposite to check time.

The only issue is an omission, not a contradiction: the cheaper `emit` also rejected a previously legal call (`emit(...pair)`), which S1's "what newly compiles" framing doesn't cover.
