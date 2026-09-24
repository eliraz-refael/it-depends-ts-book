# Chapter 10 — The Call You Didn't Make

Status: reader-onboarding repair jointly reviewed and settled, 2026-09-24.

## Decision

A fictional courier SDK upgrade breaks an existing Result-returning Proxy.
Should the integration repair its mapped conditional type and explicit overloads,
or replace the Proxy with a private adapter that wraps actual calls?

The adapter must preserve the existing facade where possible. Forty callers do
not imply forty migrations: a dozen forwarding methods may suffice. Neither
solution gets to win against an unrepaired version of the other.

## People and stakes

- Idan wrote the wrapper for a uniformly asynchronous v4 SDK. She wants every
  exported request covered and the raw client kept private. She can repair a
  type/runtime mismatch without abandoning extraction entirely.
- Eden brings the v5 upgrade and an explicit adapter. He wants future changes
  checked at real calls. His migration experience must apply to his own proposal.
- Noam tests the promise that the wrapper's type describes its runtime. He wants
  bad-input runtime checks as well as rejected type examples.
- Daniel briefly explains inference patterns and overload extraction.
- Sahar asks what the generic wrapper contributes once the adapter is shown.

## Argument and mechanism

1. Establish Idan's `safe` helper, its Result contract, and the page caller that
   worked on v4. State the claim that wrapper signatures should derive from the
   SDK. Then show the new retrieve overload breaking wrapped one-argument calls
   while direct calls still work. Revisit Unwrap and explain inferred parameter
   tuples and results in response to that failure.
2. Parameters and ReturnType read the last overload. Explicit local overloads
   repair the facade. The implementation signature is not an extra public one.
3. V5 also adds a synchronous isTrackingCode helper. The old type passes it through,
   but the Proxy wraps all functions. An invalid code enters the success path
   because a Promise is truthy. This is a reproduction in an unmerged upgrade,
   not a claimed historical production incident.
4. Infer the whole return R, then use Awaited<R>. Match the runtime's await.
   Repair the caller to inspect both Result.ok and the boolean value. Explain
   why the old Unwrap was deliberately only one layer.
5. Compare a private call-site adapter, including a compatible overload facade.
   Show that correct synchronous handling is possible on either side. Do not
   turn the chapter into a generic Proxy library or a Result-vs-throw argument.
6. Let the drafted comparison determine the local outcome. Any unresolved
   disagreement concerns signature shape, coverage, and verification, not just
   a repeated “many methods versus few methods” rule from Chapter 9.

## Boundaries

- Error payloads are unknown; no invented SDK error classification.
- Flat ordinary method surface; retain receiver binding and non-functions.
- Generic method erasure belongs in a separate Additional Take, not as an unfixed
  method on the retained SDK. No variance, recursive-parser, or Zod source tour.
- Cite official TypeScript documentation for externally sourced semantics.
- Draft at book/02-advanced-typescript/04-infer-keyword.md, around 3,000 words.
- Durable compiler and runtime checks in checks/chapter10.cjs, reading manuscript
  fences. Verify both complete alternatives and the actual invalid-input guard.
- Self-review and Claude's whole-manuscript review must settle before completion.
- Publication authorized: open a follow-up PR for the reader-onboarding repair after review.

## Draft findings

- The adapter preserves the facade, removing the proposed migration-cost reason
  to retain the Proxy. The local ruling favors the adapter for this mixed SDK;
  a uniform generated request client is a concrete surviving use for Safe.
- The synchronous exception is implemented on the page, not dismissed in prose.
  It retains the overload repair and passes the same runtime cases as the adapter.
- TypeScript 5.9.3 still accepts the original negated call after its result becomes
  a Promise. The manuscript explicitly acknowledges this; the check asserts that
  acceptance and separately verifies the repaired result is not a boolean.
- Initial validation: 18 TypeScript fences, 22 compiler cases, 8 runtime scenario
  groups, including invalid input, both overloads, synchronous throws, rejections,
  receiver binding, non-function properties, and thenable resolution.
- Claude's review identified the missing entry constraint as the generic design's
  strongest repair. The final draft adds AsyncMembers/safeRequests and adopts it
  for the generated tracking client, introduced earlier as the wrapper's origin.
  The mixed courier SDK gets the facade-preserving adapter.
- Noam challenges the double assertion; the exact positive/negated condition
  diagnostic difference is explicit. Required-method scope and optional-method
  limitations are stated. Original final validation: 19 fences, 29 compiler cases,
  8 runtime groups. Full findings and dispositions: CH10-REVIEW.md.
- Reader feedback reopened the opening after merge: `safe` had no established
  purpose or caller contract before its failure. The revised opening explains
  behavior before failure and mechanism afterward. Current validation covers
  20 fences, 32 compiler cases, and 9 runtime groups; fresh-reader reviews and
  Claude's consultation are recorded in CH10-REVIEW.md.
