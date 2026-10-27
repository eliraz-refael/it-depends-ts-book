# Chapter 23 — review record

Status: **DRAFT 3 FROZEN; FINAL PRINCIPLE READER AND DIFF REVIEW PENDING**. 2026-10-27.

Current manuscript: [Still Waiting for No](../../book/03-patterns-and-design/10-monads-light.md).
Current snapshot: [DRAFT3-SNAPSHOT.json](ch23/DRAFT3-SNAPSHOT.json).
Review addressed: [Claude's second review](ch23/CLAUDE-REVIEW-2.md), `debcc0b`, plus its two verbatim reports. Those records remain unchanged.

## Draft 3 response

1. **Explicit Principle, without the trace:** accepted. Eli instructs the reader to reserve `then` for the promise contract and name a different chaining operation differently. Neither resolving callback nor the pending refusal appears there. His first paragraph distinguishes a plain value relative to its container, bridges to arrays, and tests chaining against early returns when later steps need earlier values. Promise adoption now says “unwraps,” not “flattens.”
2. **Premature rename and monad caveat:** accepted. Dafna uses Linoy's existing `then` when naming the wrapping/chaining pattern. At direct `Promise.resolve(preview("7"))`, she qualifies promises: adoption does not leave a promise-like value wrapped. No new example family was added.
3. **Strongest whole-Result repair:** accepted and reproduced. Linoy can keep a correct whole-Result `then` and add `andThen`; the manuscript does not claim otherwise. Guy names the cost: awaiting changes the class into a union even when the function is annotated `Promise<Res>`. A new compiler case pins the declared and awaited types plus successful chaining; its runtime group checks success, both refusals, the lost method, and skipped continuation. The rejecting thenable's bare success value is explicit too.
4. **Annotation and Verdict:** accepted. Eli connects the declared `Promise<Res>` to `Awaited` inspecting the callback parameter. Guy chooses one shape for synchronous and async callers. Unwrapping remains a valid, smaller boundary repair, with its different shape accepted before the class repair is argued.
5. **Local continuity and prose:** accepted. The printed unwrap runs both quantities before the completion claim. Saved carts, six screen callers and five units clarify setup. The rename no longer claims an execution-order advantage over nested functions. “Other callers” avoids worker-job ambiguity. The extra carefulness sentence and vague async-helper advice are cut; the refusal explanation and final callback-return comparison are explicit. The source apostrophe is normalized.

No consequential finding was declined. Only the boundary-unwrap fence changed (it now prints success as well as refusal); the other fourteen fences are byte-identical to draft 2.

## Draft 3 self-review

The best reveal remains untouched: the successful call worked because its callback was the promise's resolve, while the refusal returned a fresh wrapper to nobody. The new strongest-repair exchange lasts two turns and feeds Guy's concrete preference instead of inventing an impossibility. No machinery was added to the page.

The Principle now supplies an instruction and a comparison test. This is an author assessment, not a substitute for Claude's final isolated reader. Its first paragraph remains the densest passage; the final reader should determine whether “plain” and the earlier-value test are actionable. The arrays/monad passage remains short, with its qualification paid off by the actual adoption example. No further full-reader round is claimed or requested here.

## Draft 3 validation

Frozen manuscript: **2373 whitespace-delimited words; 15 TypeScript fences**.
SHA-256: `8befc8d387b5f849958ee1f8219ebe179074e7dd13f59f03e5b9b85532f2f8c5`.

- `npm ci --offline`: exit 1, ENOTCACHED for the locked Zod 4.6.2 tarball. Main's installation was restored only after a byte-identical lockfile check and verification of all 14 installed package versions. No registry, package or lockfile changes; no clean-install claim.
- `node checks/chapter23.cjs`: exit 0, **15 fences / 22 compiler cases / 20 runtime groups**. Final prose refinements preceded the full suite below.
- `npm run check`: exit 0 on TS **7.0.2** / Node **22.23.4**, **401 fences / 533 compiler cases / 254 runtime groups**, plus two default cases and two searches, on this frozen manuscript and validator. No subsequent manuscript or validator edits.
- Logs and the installation manifest remain untracked under `.probe/ch23-draft3-*`.

Ready for the requested final Principle-only reader and diff review. Not publication approval; no push.

---

## Prior drafts (historical)

The following records describe earlier handoffs, including their then-pending reader questions and validation provenance. Current status and counts are above.

## Draft 2 response

1. **Principle and spoiled Turn:** accepted. The two paragraphs now give the return-shape rule and Eli's observation that promise `then` does both jobs. They name the protocol obligation without supplying resolve/reject or the pending-refusal trace. The warning winks and the deliberately deferred answer are removed. The reader may recognize `then` early, but its concrete failure is left to the scene.
2. **Fact-sheet voice and scope:** accepted. Referents now name early returns, the helper and the function being changed. Promise.all and optional chaining are cut from the Principle and manuscript; optional-chaining reader case (d) is dropped. The plan's new note adapts case (b) to the remaining array/Result shape lesson. Arrays stay short.
3. **Boundary unwrap:** accepted and independently reproduced before editing. `loadUnwrapped` returns the plain union, closes both jobs with no failures, and preserves success plus both refusals. Guy accepts the changed return type and keeps all six synchronous screen callers. Direct Promise.resolve of the old class remains pending, so Linoy argues for repairing her class as well. The Verdict remains the rename; unwrapping is a working local alternative, not a failed repair.
4. **Strongest repairs:** accepted. Whole-Result fulfillment changes the callback input from T to Result<T,E> and calls it on refusal. The existing Preview callback is rejected with TS2345. Sahar's plain union removes an extra shell; he no longer declares his own argument defeated. Linoy argues that a rename preserves callback bodies, error types and execution conditions in the six existing chains. Both promise-compatible variants and plain removal remain tested.
5. **Pacing and onboarding:** accepted. The narrator's setup is shorter; screen count and synchronous use come from Linoy, worker erasure and ownership from Guy. The isolated TS2322 detour is removed while the growing union stays in one line. The plain-helper/ladder comparison remains because it supplies the removal alternative and the local limit of the ruling.
6. **Monad:** accepted. Dafna names wrapping and chaining through the same kind of container once, using the operations already on the page. No laws, libraries or generator tutorial were added.
7. **Awaited:** accepted. Eli explains the callback parameter from which TypeScript obtains Preview. His overstatement still meets Guy's actual Promise<unknown> worker.
8. **Line corrections:** accepted. Quantity two is unambiguous; the nonexistent in-flight counter wording is gone; the outer parsing success is a full sentence; Eli names the erased expectation; the unprompted ignored-failure rebuttal is cut; the Take explicitly says to await availabilityAsync rather than referring to a synchronous caller. Source links moved out of dialogue. Rename/reset narration is one action rather than a miniature change log.

No substantive review finding was declined. The tested facts do not make the rename uniquely correct: Guy can fix the new entry point alone. The manuscript now makes the additional class repair an owned, argued decision, with the compatibility cost on the page.

## Draft 2 self-review and reader questions

The successful boundary alternative is the main improvement: it threatens the original ruling before Linoy defends the class repair. The renamed class still returns its wrapper through the worker; the boundary alternative intentionally returns the union. Neither is misrepresented as preserving the other's return shape.

Remaining questions for the targeted reader: does the short arrays/monad exchange still delay the incident? Is the class owner's reason for repairing callable then persuasive after the smaller unwrap has worked? Does the explicit Result-versus-T callback distinction make the whole-Result concession understandable? When did the reader predict the bug, and did the discovery remain enjoyable? These are questions for the reader, not self-issued approvals.

The Principle's first-read test must no longer demand a full resolving-callback trace or teach Promise.all/optional chaining. Those removals follow the review. Its rule is now choosing the operation from the next step's return shape, comparing real early returns with a chained version, and recognizing the protocol obligation of callable then.

## Draft 2 validation

Frozen manuscript: **2303 whitespace-delimited words; 15 TypeScript fences**.
SHA-256: `492a89f430230dae9e0fe293fbf4623f27a00a305d901f98b06b9fc8e5621e02`.

- `npm ci --offline`: exit 1, ENOTCACHED for the locked Zod tarball. Restored main's installation after a byte-identical lockfile check and verification of all 14 installed package versions; no dependency or registry changes. A clean install is still not claimed.
- `node checks/chapter23.cjs`: exit 0, **15 fences / 21 compiler cases / 19 runtime groups**. The subsequent full run covers the exact frozen manuscript and validator.
- `npm run check`: exit 0 on TS **7.0.2** / Node **22.23.4**, **401 fences / 532 compiler cases / 253 runtime groups**, plus two default cases and two searches. No manuscript or validator edits followed this run.
- Logs and the install manifest remain untracked in `.probe/ch23-draft2-*`.

Added durable cases cover the printed unwrap and its output, success and both refusals through the worker, direct Promise.resolve before and after rename, and the whole-union callback type change. Removed cases for the cut optional-chain, Promise.all and ignored-result tangents. The error-union regression remains as fixture evidence for the retained prose. Repeated fixture loads now clear Node's resolved module-cache path so counters reset on systems where the temporary path contains a symlink. Every fence is extracted and checked; pending adoption is observed without awaiting the never-settling promise.

**Ready for the requested targeted recheck; no publication approval implied.** No push.

---

## Draft 1 self-review (historical)

The following is the original author's assessment of draft 1, before the review identified the spoiled Turn and missing boundary repair. Its counts, snapshot and reader-pending statements describe that earlier handoff, not current status.

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
