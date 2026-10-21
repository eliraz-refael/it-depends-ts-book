# Ch16 Principle-only reader (Claude)

2026-10-14. A fresh subagent was given only the text before `## The Debate` from draft `34cf2116…`, plus stated prerequisites. It had no plan, reviews or other files.

**1. Principle sentence(s).** Line 5, spoken by Gilad: "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result." It is a general rule, and it can be checked: you can audit a boundary for whether each class of input got an explicit decision. Two weak spots. It's only in dialogue, so a reader may take it as one character's opinion, not the chapter's thesis. And "translate" is never defined.

**2. My restatement.** For each kind of input a boundary might get (known, unknown, malformed), decide on purpose whether to refuse it, keep it as-is, or map it to something my code understands. Don't let "it parsed" stand in for "each consumer can safely act on it."

**3. Policy endorsed or left open?** The rule leaves the policy as a decision ("choose which..."). The scenario still leans against rejection. Oded says: "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived." And line 28 hints at the answer: "The current known statuses don't need that third outcome." That reads like "review" is waiting for an unknown status.

**4. Friction.**
- "every caller" (line 5): the text later calls them consumers (tracking page, refund worker), which are introduced only after the rule. I read it twice.
- "linked to the original receipt" (line 28) comes before `Receipt` is defined (line 58). Then `Receipt = { id: string; raw: unknown }` is declared but never used, and `receive` stores `parsed.data`, not the raw input. It looks like a planted clue, but right now it's just confusing.
- Line 52: "It returns an ID". Is "It" `append` or the inbox? The text also says `append` "rejects if storage fails", but `receive` doesn't handle that case. Is that a 500? Does it count as a "rejected" attempt?
- Line 68: "a rejected webhook". Does that mean any non-2xx, or only 400? The whole stakes argument depends on the answer.
- `delivered.status.replaceAll("_", " ")` (line 43) is never explained as the tracking page's display logic, and "delivered" has no underscore, so the demo shows nothing.
- The second half of the principle ("A successful parse doesn't by itself tell...") gets no support here. The only example is a *failed* parse.
- Oded's "get the tracking page to move again" (line 7) refers to an outage before it has been described.
- Title vs. content: "What the Schema Does With the Rest" sounds like extra keys (strip/passthrough/strict). The opening is about an unknown enum value.
- The Zod version isn't stated, and the error text is Zod 4's format.

**5. Expected debate.**
- Return 400 on unknown statuses (strict) vs. accept them, store the raw body, and return 204.
- How to represent an unknown status in the type, for example `{ kind: "unknown"; raw: string }`, without losing exhaustiveness. This is Noam vs. Eden on `default` branches.
- Each consumer handles it differently: the tracking page shows it, the refund worker sends it to "review".
- Storing `raw` in `Receipt` for replay.
- The risks of `.catch()` or fallback values that quietly translate input.
- Probably what to do with unknown extra fields, given the title.
