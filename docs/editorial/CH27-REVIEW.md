# Chapter 27 — draft 3 self-review

Status: **DRAFT 3 FROZEN; FINAL REVIEW PENDING**, 2026-11-01. The final Principle-only read and Claude's final diff review are pending. This is a self-review, not independent approval.

Manuscript: [More Work, Less Time](../../book/04-the-real-world/04-performance-vs-safety.md).
Review addressed: [Claude's second review](ch27/CLAUDE-REVIEW-2.md), committed with both verbatim reports at `9a008ac`.
Snapshot: [DRAFT3-SNAPSHOT.json](ch27/DRAFT3-SNAPSHOT.json). The earlier snapshots and received reviews remain unchanged.

## Response to the review

1. **The logistics block is almost halved.** From “Which part?” through the protocol, it drops from 391 words to 212, including the retained generator and root configuration. The prose outside fences drops from 241 words to 72. The root configuration keeps exactly the same options, paired on shorter lines. The unchanged generator still supplies the workload. The benchmark config becomes one extracted inline JSON value, and the case-file assembly is one sentence. Gil gets one short protocol sentence. Noam's distinct-key question and “Stop moving the furniture” move beside the first table, where they qualify a visible result. No sidebar or appendix is introduced.
2. **Daniel explains the repair after a profile comparison.** Linoy profiles the distributed form into a fresh directory. The reduced work is an observation, followed by Daniel's explanation: the fixture's literal key lets K select one tuple, so contextual argument typing avoids the broad union work in the original profile. The claim is limited to these calls. The checker also verifies literal-key inference separately from noisy profile samples.
3. **Gil no longer denies an unmeasured count.** “Samples can’t tell you that” replaces “No.” His remaining sentence says what the instrument cannot count or identify. Daniel supplies the type-checker explanation; Gil owns the measurement limit.
4. **Order and state are explicit.** The emit command appears before the opening runtime output and is extracted for the check. The original spread's TS2556 under Oded's loose signature is named and reproduced, followed by an expanded-call green control. The narrator's echo of Linoy's banner explanation is cut. The probe's runtime output is attributed to running node, not to checking/emitting. The loose Args declaration and function declaration occupy separate lines; the benchmark's use of declare is stated once.
5. **The trace has observations.** The page now says about 0.2s in recorded check events against about 1.6s for the file check. The targeted run recorded 0.182074124s and 1.57841825s respectively, rounded to tenths. These are observations from that run, not constants or assertions. Complete-event sums can overlap; they are not presented as exclusive CPU accounting.
6. **The Principle is shorter and ordered.** It drops from 155 words to 107, including its heading and speaker tag. The headline, checking/running distinction, controlled repetition, file membership, counters/time distinction, profiling criterion, required caller lists, erased-annotation/runtime-validator distinction and ownership remain. The typo sentence now directly says that a cheaper signature can reject the typo and accept another mistake. Annotation-only changes compare emitted code before timing. No JIT lesson, NoInfer tutorial or invented tradeoff formula is added.
7. **The register slips are fixed.** Gil says “Same session as the first table” instead of a narrator's review note. Daniel says “That’s 7.0.2’s checker. Don’t build on the name.” The generic-candidate scene, local Verdict and title-change ending remain intact.

## Confirming why the repair is fast

Before writing Daniel's new sentence, I profiled the two forms separately on the pinned book profile, with --checkers 1. In `.probe/codex/draft3/profile-comparison/`, the original has **920ms / 54.12%** cumulative under mapTypeEx; the distributed form has **10ms / 2.44%**. The original's peek report is dominated by contextual-property typing above it and union construction below it. The distributed sample instead reaches it through conditional-type instantiation.

The revised chapter check independently recorded **1,100ms / 61.11%** for the original and **30ms / 7.32%** for the distributed form. Its distributed report includes a small contextual-typing contribution, so neither the prose nor validation claims that this function or all contextual typing disappears. The broad union work that dominated the original is the relevant reduction. Shares, absolute sampled time and ordering remain evidence only.

The profiles support a workload-specific explanation, not an exact count of visits or proof of every internal value. A validation-only witness uses the printed distributed parameter list, changes only the helper's name and return type to expose K, and calls it with the cart literal. Its uncontextualized result fits the cart key; assigning it to the hello key produces TS2322. This confirms literal inference and rules out any as an explanation for the assignment. The witness is removed and the repository restored to green. Existing union-key rejection and correlated-caller acceptance controls remain.

The chapter still names only mapTypeEx internally. Its existing source link is unchanged. No sample percentage or compiler-internal function name becomes a pass/fail expectation, and no real-project, editor-latency or earlier-compiler claim is added.

## Principle-only self-test

- **Uncontrolled route speedup:** the same files, workload and options are required. A missing generated caller file fails that comparison. The headline and caller lists also require identifying the newly legal mistakes.
- **Brand versus validator:** annotation-only edits compare emitted code before timing. A running validator still needs measurement; removing it requires a named detector or acceptance of the newly permitted mistakes.
- **Cheaper emitter:** still rejecting a typo does not establish preservation of other rejections. Both legal and forbidden caller lists are required. Identifying the union-key hole or evaluating NoInfer still needs compiler knowledge, as the review deliberately allows.
- **Two million instantiations:** counters are not seconds. A measured saving and the mistakes permitted by removing the constraint are required. If the owner accepts the risk, someone owns the resulting mistake; the Principle does not invent a universal way to price that decision.

These are self-tests. The next isolated reader should judge whether the shorter Principle retains the decisions without sounding like a specification.

## Validation and freeze

The check extracts **10 fences: eight TypeScript, one JSON and one JavaScript**, plus the inline benchmark config and the early emit command. The workload generator, signature meanings, installed libraries and compiler profile are unchanged. Both tables retain draft 2's single-session observations and identical baseline row. There is no fresh timing rebaseline hidden in this prose revision.

Coverage is **107 compiler cases / 5 runtime or generator groups / 1 file-list query / 3 emit comparisons**. The five added compiler cases are the initial spread rejection and restored-green control, the distributed CPU-profile compile, and the literal-key witness with its rejecting assignment. The total includes 21 untraced benchmark invocations, one traced compile and two CPU-profile compiles. Exact compiler counters and all previous caller, diagnostic, emit and runtime assertions remain.

Both profile formats must be produced and readable. When Go is installed, top/peek reports are recorded for each. A function absent from the samples is allowed. Without Go, interpretation skips visibly while profile production and protobuf-envelope validation still run; the absent-executable control remains. Trace duration records include the complete check-event sum, the matched source-file span, and separately parsed printed observations. No time, ratio, ordering or sample share is asserted. The check does not download Go or compiler sources.

No review item was declined. The setup reaches 54% of its previous word count while preserving the generator; the Principle reaches 69%. The trace's file duration is rounded to **1.6s**, rather than copying the review's illustrative 1.5s. The local scope and accepted Verdict are unchanged. The same locked npm ci installation is used; no new clean-export claim is made.

The full-suite result and frozen hash follow below.

`npm run check` completed with exit 0: **453 fences / 774 compiler cases / 308 runtime groups**, plus two compiler-default cases, two searches and eight file-list queries. The manuscript, validator, suite runner and shared compiler profile were hashed before execution and verified unchanged afterwards. Both CPU profiles decoded successfully; the missing-Go control printed its skip note.

The frozen manuscript has **2,340 words** and 10 fences. SHA-256: `78633e549b219a1397bffec315ed61a27254542453610bc43d99c90dad401207`. The snapshot records every fence hash, tested inputs, both profile artifacts and trace-observation provenance. The final benchmark source is byte-identical to draft 2’s frozen benchmark; its existing printed table observations are retained.

The full-run profile recorded 950ms cumulatively under mapTypeEx for the original; the distributed profile had no matching sampled function. Its readable “no matches” report passed as intended. That does not prove zero work; the two earlier comparison runs supply the positive 10ms and 30ms observations.
