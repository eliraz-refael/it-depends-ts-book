# Chapter 16 — response to Claude's initial review

2026-10-14. Revision of `b5660e9` after the formal review and independent readers
recorded at `cb8bc54`. All six groups of requested changes were accepted.
**Status: revised, awaiting targeted recheck.**

## 1. Ruling and dissent

Noam now answers Idan's comparison with a catch-all switch: a new wire value
fails the closed parser before reaching that switch. The catch-all only causes
the corresponding error after someone admits the new member to the enum.

He also answers the open-type-plus-shared-helper alternative. A caller receiving
an open update can bypass the helper and write Oded's branch again. The projection
has no status field; that same branch does not compile against it. A new TS2339
case pins this specific distinction. The prose does not claim the type proves
business correctness: the projection must still be right and the worker must
honor `review`.

Idan now defends the open type for consumers with separate owners, so tracking
can change its policy without waiting on the integration module. She explicitly
accepts checking the shared-helper convention. Eden connects that alternative
to the demonstrated maintenance cost and the current shared ownership. The local
Verdict remains; it no longer substitutes a universal-model scope note for dissent.

## 2. Projection density and unchecked dispatch

Removed `Actions` and `dispatch`, including the unchecked `void` switch.
Printed projections now show customs, a new return status, known `returned`,
and a malformed shipment ID. Removed the corresponding fixture dispatcher and
its action assertions rather than retaining an unprinted implementation.

Removed the explanatory narrator clauses called out in the review. Noam's first
projection explicitly reuses the module's existing `KnownUpdate`; his correction
names why that rejected the harmless label. This keeps the demonstrated cost
without implying that a closed domain must always withhold unfamiliar labels.

## 3. Setup

- The working label is now `in_transit` -> `in transit`.
- `Receipt` moves alongside the raw endpoint; the text connects its ID and raw
  body to the inbox's storage contract. The early review description links to a
  stored update rather than prematurely naming the original/raw receipt.
- `append` has an explicit subject and return value. The HTTP handler's 500
  mapping is stated as part of this fictional integration's contract.
- Non-2xx responses and missing acknowledgements count as failed attempts.
- Noam names the receipt-processing worker, distinct from the refund worker.

## 4. Rejection remains explicit

Noam states that malformed data cannot become a shipment projection, and an
unfamiliar status is rejected from automatic refunds and routed to review.
Acknowledging storage does not grant admission to either action.

## 5. Retry consequences

Gilad points out that three failed writes still pause delivery. Noam accepts
that consequence rather than acknowledging data the service failed to store.
The existing deferred/rejected-write test pins the endpoint's promise behavior;
there is no simulated HTTP handler or carrier.

Gilad's new Take identifies duplicate refund requests after a lost acknowledgement.
A new runtime group demonstrates two distinct inbox IDs yielding the same refund
instruction for the same shipment. The manuscript assigns duplicate prevention
to the refund worker; the fixture does not pretend to implement payment idempotency.

## 6. Lines

Eden now supports the already-made retention change; Oded asks plainly about
closed values versus extra keys; the label stays at its previous state rather
than going back; Idan is explicitly named at her replacement; the catch source
link is a separate narrator paragraph. The two-argument log comments now match
actual stdout, which is checked against those comments directly.

## Checks and review state

- Chapter 16: **17 fences / 27 compiler cases / 14 runtime groups**, PASS.
- Full suite: **299 fences / 398 compiler cases / 119 runtime groups**, exit 0,
  plus two compiler-default cases and two source searches.
- TS **7.0.2**, Zod **4.6.2**, Node **22.23.3**.
- Both repaired policies still produce equal projections on all known statuses,
  the three unfamiliar statuses, and malformed inputs. Every printed projection
  is executed. The new negative compiler case rejects Oded's status branch on
  the projected input; the existing open case still accepts it.
- Fresh Principle-only and full reads of the initial draft remain historical
  evidence. No full-reader approval is claimed for this revision. Claude's
  targeted recheck is next.
