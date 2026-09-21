# Review: Chapter 9 — Where Did This Event Come From?

**Date:** 2026-09-21

**Status:** APPROVED after self-review, an independent Codex review, and Claude's review. Both reviewers confirmed the final revisions; the review is settled.

## Summary

The chapter's decision follows a visible difference between its callers: ordinary controls share a setter, while restore already lists its emissions separately. The type accepts both constructed and handwritten names. The registry and a consistently indexed explicit event map remain competent alternatives, and the final choice does not settle how every project should trace events.

## Self-review scores

| Category | Score | Evidence |
| --- | --- | --- |
| Character consistency | PASS | Oded wants a navigable change he can merge; Linoy wants one naming convention; Gilad's billing experience explains his tracing concern, and the others challenge applying it to a small demo. |
| Factual accuracy | PASS | Actual snippets checked under TypeScript 5.9.3, including intentional failures, the accepted union-correlation counterexample, and both printed source searches. |
| Fun factor | PASS | Humor follows the review: Oded asks the repository instead of Linoy, and Daniel remarks on the compiler's loyalty to fourteen. Plain answers remain plain. |
| Alignment with vision | PASS | Objections narrow the decision. Linoy's generic setter is adopted; her preference for using the wrapper everywhere remains reasonable. |
| Code quality | PASS | All three restore implementations update the complete state before notifications. The event bus is explicitly represented by declarations, with a recording adapter used for runtime checks. |
| Readability and flow | PASS | Four speakers, clear attribution, a concrete search that changes the inquiry, and a brief return from the audit example. Final draft is approximately 2,230 words including code. |

## Findings addressed

- **Independent reviewer — “Do we have a paid profile?”:** the original claim that the grouped type gives the menu its actions could imply runtime generation. Linoy now proposes checking the filter's props before choosing a representation. No unseen consumer is presented as a demonstrated win.
- **Independent reviewer, optional improvement — “Put the names somewhere”:** the registry candidate now performs the whole restore operation, matching the other alternatives' notification ordering.
- **Claude — opening:** Gilad initially asked persistent tracing questions without a visible stake. Oded now challenges treating a demo as an incident; Gilad recalls navigating billing wrappers and wants to inspect this helper before its use spreads. Linoy answers with the current example's much smaller scope.
- **Claude — explicit event map:** all three properties now use `Settings[...]`. The explicit alternative retains its correct payload relationships, leaving the event-name convention as the actual maintenance dispute.
- **Self-review — opening and attribution:** clarified that Linoy applies derivation to an existing naming convention and that Daniel points to an event type in the diff.
- **Self-review — inference explanation:** removed backslashes accidentally rendered inside an inline code expression.
- **Self-review — final exchange:** replaced a repeated question about whether types create functions with Oded checking whether Linoy's extra example belongs to the PR.

## Verification

The durable validator is `checks/chapter9.cjs`. It requires Node, `rg`, and TypeScript; pass the installed TypeScript package directory if it is not available through ordinary Node resolution:

```sh
node checks/chapter9.cjs /path/to/node_modules/typescript
```

Latest successful run used **TypeScript 5.9.3**, `strict`, and `exactOptionalPropertyTypes`:

- **20 TypeScript fences covered**, with dependencies supplied and competing implementations separated.
- **33 compiler cases:** two complete feature versions plus isolated snippets and additional type/diagnostic checks. Expected errors are checked rather than suppressed.
- **Five runtime scenario groups:** controls/subscriber dispatch and restore for each feature version, plus the registry alternative. Checks include names, payloads, complete state before notifications, and preview output.
- **Two source searches reproduced exactly**, including filenames and line numbers. The validator extracts the labelled feature files from the manuscript, excluding the explicitly separate scratch examples.
- `git diff --check` passed.

Claude independently rebuilt the feature files and reproduced both searches. His separate checks also confirmed generic index assignment, listener errors, the discriminated union, `as const` narrowing, `Capitalize`, the repaired audit union, and the publisher's union-correlation limit. The independent Codex reviewer separately reproduced the source searches.

The runtime adapter records and dispatches events for testing the illustrated producers and subscriber. It does not validate an unseen production event-bus implementation. The chapter makes no claim that a source search identifies which runtime occurrence produced a particular log.

## Verdict

**APPROVED.** The self-review passes. The independent Codex reviewer rechecked the final changes and confirmed approval. Claude confirmed both findings resolved and sent `settled` in message 4 of the shared review round. No unresolved review findings remain, and the updated validation passes.
