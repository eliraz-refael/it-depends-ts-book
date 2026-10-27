# Chapter 23 — draft 1 self-review

Status: **DRAFT 1 FROZEN; INDEPENDENT READERS AND CLAUDE REVIEW PENDING**. 2026-10-27.

Manuscript: [Still Waiting for No](../../book/03-patterns-and-design/10-monads-light.md).
Settled plan: `5e8f91b`, [settlement](CH23-PLAN.md#settlement-after-codexs-challenge-2026-10-27).
Snapshot: [DRAFT1-SNAPSHOT.json](ch23/DRAFT1-SNAPSHOT.json).

## Scope and decision

The draft follows the settled local Verdict. A read-only availability preview returns an offer or a domain refusal. A new async entry point makes the fluent class participate in promise resolution; the generic worker completes the successful job but waits indefinitely for the refusal. Renaming the success-only method to `andThen` preserves both the class and the worker's distinction between refusal and failure.

The repair is the dispute. Linoy proposes rejecting refusals as a real thenable; Guy's worker then records a failure. Her stronger whole-union fulfillment also works, but successful-value chaining needs its own method. Sahar removes the class with a plain helper; the six existing fluent callers make a rename the smaller local repair. Their count is established before the argument. A deprecated alias is explicitly rejected because it retains callable `then`. Other jobs need not become fluent. No artificial dissent or open-ending requirement survives.

No generator tutorial, transaction, retry, configuration interpreter, pipeline helper or library survey was added. The class is not presented as an implementation mandated by the word “monad.” The earlier Result union is reused without claiming to resolve Ch14's transaction-adapter deferral.

## Self-review against the book guides

These are author assessments, not independent-reader verdicts.

| Category | Self-assessment | Evidence / reservation |
| --- | --- | --- |
| Character consistency | PASS | Guy owns lifecycle and failure accounting. Linoy owns the fluent API and both thenable repairs. Dafna follows return shapes and qualifies the ladder claim. Sahar supplies removal and pays its migration cost. Eli's smaller caller loses the worker's erased return contract; Guy corrects him. |
| Factual accuracy | PASS | All 14 fences checked; both error outcomes and the successful shape tested across the discussed repairs. No assertion that every compiler-accepted callback consumes its Result. |
| Fun factor | PASS, subject to reader | The opening “I'd like you to tell the worker,” the class author finding JavaScript calling her method, and the worker waiting for an already-issued refusal carry the scene. Whether the analogies interrupt it needs a fresh read. |
| Alignment | PASS | A useful abstraction is taught without requiring everyone to adopt it. The repaired class wins locally; plain functions remain a competent alternative with an actual migration cost. |
| Code quality | PASS | One domain, one stock snapshot, explicit original/repaired timelines, real code rather than pseudocode. Promise-compatible alternatives are tested in fixtures rather than printed as another implementation family. |
| Readability / flow | PASS in self-read; independent check pending | Helper purpose and ordinary outputs precede the failure. Result and Res are visibly distinct, but that extra shell remains the main comprehension risk. |

Corrections made in self-review: merged duplicate Sahar tags; distinguished the generic worker from the jobs it runs; changed “resolve the offer” to “resolve the preview”; specified that Promise.then receives a callback whose return is adopted, rather than a plain value as its argument; made callable-then adoption and its resolving callbacks explicit in the Principle. No fences changed in those final prose edits.

## Principle self-test (not an isolated reader)

- A missing-value class with a success-only `then` can leave adoption pending: the Principle now explicitly says adoption supplies resolve/reject and waiting continues if neither is called.
- Async array mapping yields promises; the Principle says `flatMap` does not wait and names `Promise.all` when all values are wanted.
- Several early returns alone do not require migration: compare the actual callers and repeated propagation. The chapter demonstrates that unchecked `.value` access is rejected, while a helper can still discard a returned failure.
- `?.` is enough for property access that should stop on nullish absence. It does not create an Option, and an empty city string survives.

These are the intended readings. Claude's fresh Principle-only readers still need to establish that the wording supports them without this record.

## Where a reader may get bored or need help

1. The Promise/array/optional-chain passage between `onlyBadQty` and the Turn may feel like the investigation has paused for a small catalogue. Guy asks to return to the job, but that line cannot excuse an actual loss of momentum. Ask the full reader where they started skimming. Cut explanation rather than adding more analogies if needed.
2. The Principle is two dense paragraphs. It is actionable in self-test, but the distinction between return shapes and the thenable protocol may be too much before the hook. Ask which rule the reader can restate without the scene.
3. The `Res<Result<Offer, NoStock>, BadQty>` example has both the union and the fluent shell. The nested refusal is printed and explained. Ask the reader what the outer success means before continuing to the worker.
4. The plain-union helper and ladder arrive late. They answer real repair proposals, but the reader may already want the rename. This is the first place to trim if the last third feels prolonged.
5. The batch entry point exists because the job API requires an async callback; no remote service or scheduler is implemented. Ask whether that is sufficient motivation, rather than adding infrastructure detail automatically.

The scene I intend readers to retell is the refused preview whose worker never hears its answer. That is an intention, not a reader finding.

## Validation and provenance

Frozen draft: **2332 whitespace-delimited words**, **14 TypeScript fences**.
SHA-256: `63db6fdf38460db3f3eae59c59988a7c51a4d3e1ce66241ced44413348c19b1c`.

- Requested retry of `npm ci --offline`: **exit 1**, ENOTCACHED for the locked Zod tarball. No dependency or registry edits. Restored the main checkout's installation after a byte-identical lockfile check and verification of all 14 installed package versions. This is not a clean install; Claude's final-review install remains necessary.
- `node checks/chapter23.cjs`: **exit 0**, TS **7.0.2**, **14 fences / 21 compiler cases / 19 runtime groups** on the frozen manuscript.
- `npm run check`: **exit 0**, TS **7.0.2**, Node **22.23.4**, **400 fences / 532 compiler cases / 253 runtime groups**, plus two default cases and two source searches. The last one-clause thenable-definition clarification followed this run; the final targeted rerun covers that frozen prose. Fences and validator are unchanged from the full run. No exact final-prose-hash claim is made for the full run.
- Logs, installation manifest and discovery probes remain untracked in `.probe/`.

Every printed output is executed. Exact inferred types are pinned, including the outer promise after async mapping, the lost awaited wrapper and the repaired awaited class. Tests include the deprecated alias, both promise-compatible proposals, plain removal, unchecked ladder access, ignored helper refusals, short circuiting and retention of quantity. The finite original error branch has no settlement callback; a bounded microtask drain observes its pending promise without attempting to prove nontermination by elapsed time. The six-screen count is fictional context, not measured codebase data.

The primary promise-resolution source is linked at the explanation in the manuscript. Additional language-source links and the six-mechanism reproduction are in [the plan challenge](ch23/CODEX-PLAN-CHALLENGE.md). No fp-library or TC39 proposal claims appear.

## Handoff

**Ready for independent review, not approved for publication.** Claude owns the fresh Principle-only and full-reader passes and formal review. Suggested prerequisites for the full reader: discriminated Result unions and early returns (Ch14), generic callbacks, array map, async/await and Promise.then; no plan, challenge or intended-ending explanation. Ask about enjoyment, the first unclear example, boredom, and the scene they would retell. No push in this handoff.
