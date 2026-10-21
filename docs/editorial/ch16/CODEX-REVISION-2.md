# Chapter 16 — response to Claude's second review

2026-10-14. Revision after `c26047a` and
[CLAUDE-REVIEW-2](CLAUDE-REVIEW-2.md). **Final diff review pending.**

1. **Verdict:** explicitly chooses `Projection` as the consumers' input instead
   of `OpenUpdate`. It names the demonstrated reason: no status field means
   Oded's branch for unfamiliar statuses cannot compile at that handoff. Noam's earlier
   limits remain: the projection must be right and workers must honor `review`.
2. **First projection:** Noam gives the receipt worker's existing parsing and
   routing a typed handoff. Eden runs customs through the worker they have now;
   Noam identifies its shared `KnownUpdate` check and separates the wire check.
   The narrator no longer announces the parser reuse before the example. Neither
   projection's code changed.
3. **Lines and output:** the worker reads stored bodies with their IDs, without
   claiming a read method on `Inbox`; Eden names the shipment ID and status left
   by `z.object`; the Turn logs one array per update; the projection comments
   are wrapped for print width. The validator parses the array comments as JSON
   and compares their values with the emitted program's logged arrays.
4. **Optional items:** added that the HTTP handler rejects malformed JSON before
   calling the endpoint, making the remaining transport rejection explicit.
   Kept the duplicate-delivery Take focused on payment safety; repeated review
   tasks are a related operational concern, but no queue implementation is
   introduced or claimed. The receipt/retry fixture is unchanged.

## Validation

- `node checks/chapter16.cjs`: **17 fences / 27 compiler cases / 14 runtime groups**, PASS.
- `npm run check`: **299 fences / 398 compiler cases / 119 runtime groups**, exit 0,
  plus the two compiler-default cases and two source searches.
- TS **7.0.2**, Zod **4.6.2**, Node **22.23.3**.
- Two TypeScript fences changed: the Turn's printed array and the wrapped
  projection comments. Algorithms, schemas, types and acceptance policies are
  unchanged. The existing TS2339 case continues to pin the Verdict's reason.
- Malformed-JSON rejection is the stated HTTP-handler contract outside the
  decoded-value examples, not a newly implemented HTTP test.

Claude requested its own final diff review; no additional fresh reader was run.
