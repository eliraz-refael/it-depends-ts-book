# Ch16 recheck reader (Claude)

2026-10-14. A fresh subagent was given only revision 1 (`62da87a4…`), plus stated prerequisites and a fixed question list. It saw no findings, plans or reviews.

**1. Principle.** Line 5: "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result."
- **Preserve:** covered. The raw inbox, and `eta` being stripped.
- **Translate:** covered. `OpenStatus` and the label.
- **Reject:** covered only loosely. Nothing is rejected at HTTP any more. The rejections are a malformed update going to the `kind: "review"` path, and an unfamiliar status being "rejected from automatic refunds" (line 321).
- **Second sentence:** well covered by the stripped `eta` and by the Turn, where the parse succeeds and the refund decision is still wrong.

**2. Rereads and things used before they're explained.**
- `type Receipt = { id: string; raw: unknown };` (line 96) arrives about 180 lines before it's used (line 273). "For processing, the inbox exposes the ID returned by `append` and the stored body as a `Receipt`" is hard to parse, and `Inbox` has no read method.
- "Our inbox only had the first result" (line 128): I had to go back to work out that "first result" means the first `console.log` output.
- `update.status.status` (line 178) reads like a typo the first time.
- Line 52 is a dense spec paragraph. "Its resolved value is the stored update's ID" is never used by `receive`.

**3. TS/Zod claims and outputs.**
- "Remove `: string` and it infers `string | undefined`" (line 197) is only true with `noImplicitReturns` off. With it on, you get TS7030 anyway. The same applies to Eden's line 50.
- Under `noUncheckedIndexedAccess`, two spots fail to compile:
  - `parsed.error.issues[0].message` (line 75).
  - `for (const [id, status] of [["r1", ...]])` (line 334): `id` becomes `string | undefined`, which isn't assignable to `Receipt.id`.
- Output comments use inconsistent quoting. `// "skip"` (line 44) and `// "Carrier reports: held at customs"` (line 184) have quotes. Lines 221–222 print the same kind of strings without them. Line 341 isn't how Node prints objects: Node uses single quotes and wraps long objects.
- The Zod claims (strip/loose/strict, union order, `.catch`) look right for Zod 4.

**4. Narrator.**
- Lines 52, 93, 150, 138 and 371 read like documentation.
- "He gives that handoff a type, using the module's existing `KnownUpdate` parser" (line 260) tips off the mistake that's coming.
- In the Verdict, "rather than silently treated as ineligible" (line 354) is mild editorializing.
- I found no unclear speakers.

**5. Does the Verdict follow from the scenes?** Only partly. The demonstrated fact is this: with `OpenUpdate` exported, a new consumer can return `skip` for an unknown status without anyone touching the schema (lines 252, 329). A `Projection` has no status to branch on, so that mistake can't be written. That's the real reason, but the Verdict instead says "where the integration module already owns both consumers' handoff", which is an organizational fact, not something shown. Idan's rebuttal, "I can have a shared refund function with my open type as well. You're choosing which layer has to call it" (line 327), is never answered. Noam even concedes "the worker has to honor `review`." "Keeps the projection in this service" also blurs the comparison: Idan's design was in this service too. The real choice was whether to export `OpenUpdate` or `Projection`.

**6. Dissent.** It's there, but it's conditional agreement more than opposition. Idan (line 356): "I'd export the open update if those consumers had separate owners. Tracking could change its policy without waiting for this module." The condition is real and testable. Eden's reply restates it rather than pushing back.

**7. Overlooked fixes or staged mistakes.** Noam's first `project` reuses `KnownUpdate` (line 274). That comes right after the chapter showed, at line 74 and again at 163, that `KnownUpdate` rejects the customs status, and Noam was in the room. Eden has to point it out. It reads like a mistake planted so the scene has something to fix. Oded's `skip` mistake, by contrast, is believable.

**8. Final code vs stated rules.** There's no direct contradiction: known statuses still go through the exhaustive `refundForKnown`. But Idan's rule, "If we're relying on exhaustive handling, we have to enforce it" (line 197), isn't applied to the code that consumes `Projection`. Nobody shows how a consumer handles `kind` or `RefundDecision`, and that consumer is exactly where `review` can be quietly turned back into `skip`.

**9. Retry/ack consistency.** The core rules hold together:
- Line 67: a non-2xx or missing ack counts as a rejected attempt, and three rejected attempts pause the account.
- Lines 52 and 104: a storage failure becomes a 500, and three failed writes pause delivery.
- Line 375: a lost 204 means the carrier redelivers.

Gaps:
- Line 52 says "The endpoint has already decoded the request's JSON." So a body that won't decode is still rejected before `receive` runs, and three of those still pause the account, which is the failure the chapter set out to fix. Nobody mentions it.
- A redelivered unfamiliar receipt gets a new inbox ID, so it creates a second review work item. Gilad's dedupe covers only refund payments.
- "Keep the receipt open until that owner resolves it" (line 350) relies on a receipt state that's never modeled.

**10. Fixes, ranked.**
1. Restate the Verdict's reason as the demonstrated one: the handoff has no status field, so consumers can't invent a policy for unknown statuses. Either answer Idan's line 327 directly, or show what goes wrong with the shared-helper approach. Change "in this service" to say what's actually exported.
2. Make Noam's first `project` mistake believable, or cut it and go straight to separating the wire check from the recognition check. While doing that, move `Receipt` down next to the code that uses it.
3. Close the retry gaps: say what happens to undecodable JSON, and say how redelivered receipts are kept from creating duplicate review items. Separately, decide on one output-comment convention and check the code against the book's tsconfig (`noUncheckedIndexedAccess`, `noImplicitReturns`).
