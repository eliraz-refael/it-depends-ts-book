# Principle-only read: Bonus 2 draft 1 (`0c283ef`)

2026-11-02. A fresh isolated reader saw only the draft 1 Principle and answered the four settled cases, with fixtures. Saved verbatim. Note: my case (4) prompt said both reviewers' versions "generate the same JSON Schema"; the reader correctly found that's true only when B's refinement is layered on A. Later readers get the corrected wording.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p1/principle.md`, which is two quoted paragraphs credited to "Liron Closure". The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p1/fixtures/` (c1.ts to c5.ts). Each one type-checks under TypeScript 7.0.2 with `--strict --exactOptionalPropertyTypes` and Node16 modules (tsc exit 0), and each one runs on Node 22 with Zod 4.6.2.

### (1) The accurate description, wrong default — **Clear**
- **Decision:** Generating the description from the parser doesn't fix the refund, and neither does a required enum. The refund's currency has to come from the order record that the executor loads.
- **What I'd ask for:** Remove `currency` from the arguments, or treat it only as a value to check. The executor loads the order, takes `order.currency`, and rejects any mismatch.
- **Sentences relied on:**
  - "It doesn't establish … what currency that order uses."
  - "Those answers have to come from the program that executes the call."
  - "That saves you maintaining two descriptions of the fields; it doesn't put all your policy into JSON Schema."
- **Verified (c1):**
  - With `io: "input"`, the generated schema leaves `currency` out of `required` and shows `"default":"USD"`. So the description is accurate.
  - `parse({orderId:"o1", amount:20})` returns `currency: 'USD'` while the order is EUR.
  - A required `z.enum(["USD","EUR"])` still accepts `"USD"` for the EUR order (`success: true`). It forces the model to guess explicitly instead of defaulting silently.
  - An executor that reads `order.currency` produces `{ amount: 20, currency: 'EUR' }`.
- **Side finding:** `z.toJSONSchema(schema)` defaults to `io: "output"`. In that mode `currency` is listed as **required**. "Generate the input structure … from the schema" is only accurate if the author passes `io: "input"`. The rule says "input structure", which hints at this but doesn't name the trap.

### (2) The valid cancellation — **Inferred**
- **Decision:** The call is well-formed but unauthorized. The arguments name someone else, and the executor apparently trusts them. Removing `userId` isn't enough, because `subscriptionId` alone can still point at another person's subscription.
- **What I'd ask for:**
  - Build the executor with the session's user bound in, for example `makeCancel(session.userId)`.
  - Load the subscription and check `subscription.owner === sessionUser` before cancelling.
  - Return the same not-found answer either way, so the call can't be used to probe what exists.
- **Sentences relied on:**
  - "A customer ID in the arguments isn't authentication."
  - "Bind the executor to the authenticated customer, and check the proposed action against the current record before doing it."
- **Verified (c2):**
  - Bob's ids validate inside Alice's session.
  - With `userId` removed, `{subscriptionId:"s2"}` still validates.
  - The bound executor rejects s2 and cancels s1.
- **Why Inferred:** The rule is written about customers and orders. Applying it to users and subscriptions is an easy step, but a step. The second half of the question ("is removing `userId` enough?") is answered only by the record-check clause. Nothing says outright that removing the ID is necessary but not sufficient. That point is the most common misunderstanding, and it deserves one explicit clause.

### (3) The confident outcome — **Clear**
- **Decision:** `emailSent` must come from the send operation's own result, for example `emailSent: sendResult.ok`. It must never come from the model's structured reply. If the send never ran, there is no result, so the value is false or "unknown". It can't be true.
- **Sentences relied on:**
  - "When you report an outcome, take it from the operation's result."
  - "Successfully parsing a boolean called `refundIssued` hasn't issued anything."
- **Verified (c3):** `{emailSent:true}` parses successfully. Building the reply from a failed `SendResult` gives `{ emailSent: false }`.
- **Small gap:** The rule doesn't say what to report when the step never ran. "Take it from the operation's result" implies you can't report success, but whether to report "false" or "not attempted" is left open.

### (4) The refinement with and without context — **Clear on the decision; the case's premise is partly false**
- **Decision:** Reviewer B's refinement rejects the other customer's order. Reviewer A's check doesn't, because strictness and positivity say nothing about ownership. The exported JSON Schema can't replace B's check, because the refinement doesn't appear in it at all.
- **Sentences relied on:**
  - "A runtime refinement can check ownership if it has the trusted session and record. A positive-number check can't."
  - "It doesn't put all your policy into JSON Schema."
- **Verified (c4, c5):**
  - A accepts `{orderId:"o2"}` for customer c1. B rejects it.
  - Layering B's refinement onto A gives a JSON Schema byte-identical to A's (`AB == A schema: true`). The refinement disappears silently, with no error.
- **The premise is wrong as stated.** A and B do **not** produce the same JSON Schema:
  - A's schema has `exclusiveMinimum: 0`. B's (a plain `z.object` plus `.refine`) doesn't.
  - In input mode, plain `z.object` emits no `additionalProperties: false`, while `strictObject` does. In output mode both emit it, which is why they look alike at first glance.
  - The schemas match only if B's refinement is added on top of A. I'd fix the case wording, or say "the refinement adds nothing to the JSON Schema".
- **Caveat the rule doesn't cover:** A refinement that checks against "the record" captures a snapshot taken at parse time. In c4, the record's owner changed after a successful parse, and the parsed value still looked approved. The rule says "check … against the current record before doing it", which points to the executor and is correct. But the refinement sentence could be read as making the parse-time check sufficient. One clause would close that gap, for example "and the executor still re-checks at execution".

### 1. Is the rule clear and testable?
Mostly, yes. Cases 1, 3 and 4 could each be decided from one or two sentences.
- **Strongest sentence:** "Successfully parsing a boolean called `refundIssued` hasn't issued anything." It is concrete, memorable and directly testable.
- **Runner-up:** "A customer ID in the arguments isn't authentication."
- **Weakest sentence:** "A runtime refinement can check ownership if it has the trusted session and record. A positive-number check can't."
  - It is the only sentence that reads like an aside instead of a rule.
  - "Can" is permissive. It doesn't say whether ownership belongs in the refinement, in the executor, or in both.
  - Together with the first paragraph's "before doing it", it leaves open where the check actually goes.
- **Undefined or ambiguous terms:**
  - "Proposal": the meaning is intuitive, but the rule never says what turns a proposal into an action.
  - "The current record": current as of when? Parse time or execution time.
  - "Bind the executor": how? A closure, a constructor argument, or a context object. A reader who doesn't know the pattern won't know what to build.
  - "The schema that parses what arrives": it doesn't mention input versus output mode, which is a real trap (see case 1).
  - "Trusted session": fine as a phrase, but trusted by what mechanism?
- **Testability:** Each claim maps onto a fixture: a valid call for a wrong owner, a default that conflicts with the record, a boolean with no operation behind it, a refinement that vanishes from the schema. That is a good sign.

### 2. Does it read like a person speaking?
Yes, mostly. The first paragraph opens with a confident thesis ("A valid tool call is still a proposal") and ends on a line that lands. I enjoyed "isn't authentication" and the `refundIssued` closer. Both sound like a senior reviewer leaving a comment.
- **Where it sags:** The second paragraph is four separate rules in a row: generate from the schema, refinement versus positive check, report from the result, the boolean line. The refinement sentence in the middle is where I got bored. It's abstract and has no concrete noun to hold on to.
- **Name:** "Liron Closure" is a fun name, and presumably a nod to closing over the session. But nothing in the text connects it to closures, so a reader who hasn't read the chapter sees only a name.

### 3. Did any fixture contradict a claim?
None of the rule's own claims was contradicted. Two findings sit next to it:
- **Case (4)'s premise is false as written.** A's schema has `exclusiveMinimum: 0`, and in input mode `additionalProperties: false`. B's schema has neither. The schemas match only when B's refinement is layered on A.
- **Output mode is the default.** `z.toJSONSchema` defaults to `io: "output"`, which lists a defaulted field as required. If the chapter generates the advertised schema without `io: "input"`, case 1's "accurate description" would be inaccurate.

The rule's own claims all held:
- A refinement can check ownership when it has the session and record.
- A positive-number check can't.
- JSON Schema doesn't carry the policy: the refinement vanished silently.
- A parsed boolean proves nothing.
- An ID in the arguments isn't authentication.
