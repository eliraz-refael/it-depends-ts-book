# Ch16 fresh full reader (Claude)

2026-10-14. A fresh subagent was given only the full draft `34cf2116…`, plus stated prerequisites (TS unions, narrowing, Zod basics, earlier chapters' parse-at-boundary). It had no plan, reviews or other chapters. Raw report follows.

**1. Principle**

The principle is in line 5: "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result."

The second sentence can be tested, and the chapter tests it well: the `skip` turn shows a successful parse leading to a wrong action. The first sentence only says "choose". It never says how to choose, so nothing can test it. The chapter shows preserving (the receipt) and translating (the projection), but rejecting is never exercised. After line 98, `receive` stores any body and returns 204. Nobody asks what the boundary should still refuse: a wrong account, an oversized body, a non-object. The principle names three choices, and the chapter drops one of them without saying so.

**2. Follow-ability**

- Line 58: `type Receipt = { id: string; raw: unknown }` is declared but not used until line 268. At line 63 the inbox stores `parsed.data`, so calling the field `raw` is misleading there. Nothing connects `append`'s returned ID to `Receipt.id`.
- Lines 107 and 131: Eden says "Keep it before parsing, please" and "That's the choice I'm changing", but Noam already made that change at line 98. Her backfill scene justifies a change that has already happened, so I reread it looking for a second change.
- Line 133, Oded: "So we don't have to reject a new key to keep the status enum?" I couldn't parse this on first read. It seems to mean "strictObject isn't needed for a strict enum". Say that.
- Line 52: "Its inbox service" is ambiguous. Does "its" mean the endpoint's or the service's?
- Lines 268-278: Noam's first `project` throws away the tracking label that worked 100 lines earlier. He then fixes it at line 289. It reads as a detour put in to give Oded a line, not as a mistake a competent Noam would make right after watching `trackingLabel` work.

**3. Fairness**

- Line 249: Idan's retort is weaker than the chapter treats it. In Noam's closed design, an unknown wire value never reaches the switch; it fails the parse and goes to review. A `default: return 'skip'` only causes harm if someone also adds a new enum member. In Idan's open design, `skip` is the first thing a careless consumer writes. Noam should answer this and doesn't.
- Line 322: Idan states the real alternative, an exported `OpenUpdate` plus a shared `refundForOpen`. Noam answers "Yes" and the alternative disappears. Nothing shown proves that the projection beats it. Noam's `project` could return `"skip"` just as easily, and he concedes that in line 320 ("review that policy here"). Centralizing is a preference, not a demonstrated win.
- An obvious problem nobody raises: storing the receipt before parsing, combined with carrier retries, can produce duplicate receipts. If the 204 is lost after `append` resolves, the refund worker may issue the refund twice. A chapter about refund safety should at least say who deduplicates.
- Line 105: after a storage failure, "the carrier can retry", but line 68 says three failures pause the whole account. A storage outage brings back the exact failure the chapter opened with. Nobody mentions it.

**4. Statements that don't hold**

- Line 196: "Remove `: string` and it infers `string | undefined`." This is only true with `noImplicitReturns` off. With it on, you get TS7030. Also, TS2366 at line 191 requires `strictNullChecks`.
- `dispatch` (lines 335-346) returns `void`, and its `switch (work.refund)` has no exhaustiveness check. Adding a fourth `RefundDecision` would compile silently. That contradicts line 196 ("If we're relying on exhaustive handling, we have to enforce it") in the chapter's final code.
- Line 287: "The parcel goes back to being in transit." It doesn't go back; it stays at the last label. That's what the next sentence says.
- Line 220: `console.log(a, b)` prints `Carrier reports: returned damaged skip`, not two quoted strings separated by a comma. Lines 118 and 284 use double quotes where Node prints single quotes. These are minor, but they misstate the output.
- The Zod claims (strip/loose/strict, the enum error text, union order, the `.catch` callback) look right for Zod 4.

**5. Verdict**

As I read it: store the raw JSON durably, then acknowledge. One integration-module function turns each receipt into either a review task or a shipment projection. Tracking shows unfamiliar statuses attributed to the carrier. Refunds get issue, skip or review, and unknown meanings go to review. Application objects may strip extra keys because the raw receipt keeps them.

The verdict follows from the scenes for receipt retention and for review over skip. It does not follow for choosing a central projection over a shared helper (see section 3).

The dissent isn't real. Idan's line 359 is a scoping note, and Eden accepts it in the next line. If Idan's position is that consumers should get the open type, she needs to say so and leave it standing.

**6. Voice**

The narrator judges or explains in several places:
- Line 137: "making the application object loose would not, by itself, check the meaning of its extra fields"
- Line 172: "attributes the words to the carrier rather than claiming the application understands them"
- Line 291: "without admitting it to `refundForKnown`"
- Line 326: "they don't reinterpret the carrier's status"
- Line 255: the whole paragraph reads like API documentation.

Some speeches read like documentation:
- Line 166: Idan walks through the code line by line.
- Line 349: Eden recites test cases.
- Line 125: borderline, but it's tight.

Unclear speakers:
- Line 232: "She replaces the refund function" could be Eden as easily as Idan.
- Lines 365-372: the Zod docs link sits inside Noam's quoted take, so Noam appears to be citing documentation.

Telegraphing: line 209, "Show me what you mean by skip", announces the turn in advance.

**7. Top three fixes, ranked**

1. Make the principle state an actual rule, and exercise the reject leg. Say what the boundary still refuses now that `receive` accepts everything, and add the duplicate-retry and storage-pause problems to the record.
2. Give Idan's open-type-plus-shared-helper position a real hearing. Either show a concrete cost that makes the projection win, or keep it as the dissent. Also have Noam answer the lopsided `default: skip` comparison at line 249.
3. Add an exhaustiveness check to `dispatch` (a `never` default or an annotated return), since the chapter preaches one. Fix line 287 ("goes back to"), the `console.log` output comments, the `noImplicitReturns` caveat, and the out-of-order Eden lines 107/131.
