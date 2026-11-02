# Principle-only read: Bonus 2 draft 2 (`5cd7196`)

2026-11-02. A fresh isolated reader saw only the draft 2 Principle and answered the four settled cases (case 4 with corrected wording: B layers the refinement on A's schema), with fixtures. Saved verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p2/principle.md`. I checked every compiler and runtime claim below with fixtures in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p2/fixtures/` (case1.ts to case4.ts). They ran under TypeScript 7.0.2 with `--strict --exactOptionalPropertyTypes`, module Node16, and Zod 4.6.2 on Node 22. All four compile clean and run.

### (1) The accurate description, wrong default — **Clear** (the required-enum part is **Inferred**)

- **Does generating from the parser fix it?** No. Generating fixes the description, not the behaviour. The fixture parses `{orderId, amount}` to `currency: "USD"`, and a refund built from the arguments goes out in USD for an EUR order. The description was accurate the whole time.
- **What should set the currency?** The order. I would remove `currency` from the arguments, read it from the order record when the refund runs, and use `z.strictObject` so a stray `currency` is rejected (the fixture confirms the rejection).
- **Would a required enum fix it?** No. `z.enum(["USD","EUR"])` without a default happily accepts `"USD"` for an EUR order (fixture: `true`). It turns a silent default into a value the model chooses, and the model can choose wrong.
- **Sentences relied on:** "Currency still comes from the order." and "Generate that input description from the parser so you don't maintain the fields twice."
- **Why the required-enum part is Inferred:** the rule never says "don't take currency as an argument." It also doesn't say whether a currency argument checked against the order would be acceptable. I inferred "remove it" from "comes from the order."
- **A trap the fixture found:** `z.toJSONSchema(schema)` defaults to `io: "output"`. In that mode, a field with `.default()` is listed under `required`, so the naive export says currency is *required*, the opposite of this case's premise. Only `{ io: "input" }` lists it as optional. The rule's word "input description" is exactly right, but a reader who doesn't know that flag gets a wrong description.

### (2) The valid cancellation — **Clear**

- **What is wrong:** passing validation proved the shape, not the right to cancel. The executor never compares the subscription's owner with the session user.
- **Is removing `userId` enough?** No. In the fixture, `{subscriptionId: "s-bob"}` still parses and still cancels Bob's subscription while Alice is logged in.
- **The fix:** `makeCancel(session)` builds the executor around the session. When it runs, it loads the subscription and checks `sub.ownerId !== session.userId`. Alice gets `not_found`; Bob's own call succeeds.
- **Sentences relied on:** "A customer ID in the arguments isn't authentication; removing it doesn't check who owns the order." "Build its executor with the authenticated customer's identity, then check that customer against the referenced order when executing." "Use the record current at execution."
- **Mapping:** the rule talks about customers and orders. Applying it to users and subscriptions is trivial, but the reader does have to do it.

### (3) The confident outcome — **Clear** for "failed"; **Inferred** for "never ran"; **Not enough** for "unknown"

- **Where `emailSent` should come from:** the send operation's result. The model should supply only the prose, if anything. In the fixture, `{emailSent: true}` validates as a final reply even though the send returned `{ok: false}`. Building the reply as `emailSent: result.ok` gives `false`.
- **Sentences relied on:** "an outcome comes from the operation's result" and "Successfully parsing a boolean called `refundIssued` hasn't issued anything." The second is the most memorable line in the rule.
- **Never ran (Inferred):** with no result, I report `false`. The rule doesn't say what to report when there is no result.
- **Unknown (Not enough):** a timeout or an "accepted but unconfirmed" send leaves the outcome uncertain. A boolean may be the wrong shape for that, and the rule is silent on it.

### (4) The refinement with and without context — **Clear**

- **Who rejects the other customer's order?** Only B. In the fixture, A's `strictObject` plus positive amount accepts Alice's refund of Bob's order (`true`). B, built as `makeRefundB(session)`, loads the current order and compares owners: it rejects Alice and accepts Bob.
- **Can the JSON Schema exported from B replace the check?** No. `toJSONSchema(B, {io:"input"})` produces a string identical to A's, character for character. Zod drops the refinement silently, with no warning or error.
- **Sentences relied on:** "A refinement can do that comparison if it runs there with the authenticated identity and that record." and "Generating it doesn't export the ownership comparison."
- **What I would still ask Reviewer B:** where does this parse run? B is only correct if it runs at execution time, inside the session-built executor, against the record as it is then. If a dispatcher parses earlier, the last sentence of the first paragraph bites. The fixture shows it: a parse that succeeded for Bob fails when rechecked after the order moved to Carol.
- **Practical note:** a database-backed refinement is async. A plain `.safeParse` throws `$ZodAsyncError` ("Use .parseAsync()"), so B must use `parseAsync`. That failure is loud, not silent, which is good.

### 1. Is the rule clear and testable?

Mostly yes. Each claim is checkable, and every one I tested held up.

**Strongest sentence:** "A customer ID in the arguments isn't authentication; removing it doesn't check who owns the order." It names the bad fix in advance, and it decided case 2 by itself. Close runner-up: the `refundIssued` sentence, which decided case 3.

**Weakest sentence:** "An earlier successful parse isn't permission forever." The word "forever" implies the parse *was* permission for a while. That contradicts the opening, "A valid tool call is still a proposal." The real point is "re-check at execution against the current record." The sentence is also partly redundant with "Use the record current at execution."

**Ambiguous or undefined terms:**
- **"Liron Closure":** a reader with only this paragraph doesn't know whether Liron is a character, an author or a coined term. "Closure" works as a pun (the executor closes over the identity) only if the reader spots it, and the rule never says "close over."
- **"Build its executor with…":** "with" could mean passed as a parameter, closed over, or created per session. It works, but it's soft.
- **"there"** in "if it runs there": the nearest antecedent is "execution," but it reads as a place. "If it runs at execution" would be cleaner.
- **"the record current at execution":** the phrasing is clunky, and "record" is never tied explicitly to "the referenced order."
- **"Currency still comes from the order":** "still" points back to a currency bug the rule itself never introduced. Read alone, it arrives from nowhere.
- **Scope:** the whole rule uses the refund/order/customer domain. Subscriptions and emails take a small mapping step. That's fine, but "the referenced order" could have been "the referenced record."
- **Gaps:** nothing on uncertain outcomes (case 3, unknown), and nothing on whether a model-supplied value that must match the record (like currency) should be dropped or checked.

### 2. Does it read like a person speaking?

Partly. The contractions help, and "A valid tool call is still a proposal" is a good spoken opening. "Successfully parsing a boolean called `refundIssued` hasn't issued anything" is wry and concrete; that's where I enjoyed it.

The middle of the first paragraph reads like a spec, not speech. "Use the record current at execution. A refinement can do that comparison if it runs there with the authenticated identity and that record." Those are dense, conditional, demonstrative-heavy clauses ("that comparison," "that record"), and that's where I got bored. The first paragraph has seven short declaratives in a row, which gives it a checklist cadence. The second quote has no speaker tag, so I assumed it is still Liron.

### 3. Did any fixture contradict a claim?

No. Every claim held:
- Generating the description doesn't carry the ownership check (identical JSON Schema).
- A refinement built with the session, running at execution, does the comparison.
- Removing the ID from the arguments doesn't check ownership.
- A required enum still permits the wrong currency.
- A parsed boolean proves nothing.

Two nuances the chapter body may want to cover:
- Zod's default export mode is `io: "output"`, which marks defaulted fields as required. The "input description" needs `{ io: "input" }`.
- Refinements are dropped from the export silently, so nothing warns a reader who assumes they survived.
