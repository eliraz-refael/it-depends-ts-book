# Principle-only read: Bonus 2 draft 3 (`54e80e9`)

2026-11-02. A fresh isolated reader saw only the draft 3 Principle and answered the four settled cases, with fixtures. Saved verbatim.

## Principle-only report

I read only `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p3/principle.md`, which is two quoted paragraphs from the "Liron Closure". The fixtures are in `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/b2p3/fixtures/` (case1.ts to case4.ts). All four compile cleanly with `tsc -p .` on TypeScript 7.0.2 (exit 0) using strict, exactOptionalPropertyTypes and Node16. I ran them with `node --experimental-strip-types` on Node 22.23.4 against Zod 4.6.2.

### (1) The accurate description, wrong default
**Decision:** No. Generating the description from the parser keeps the description honest, but the refund still goes out in the wrong currency.
- **The fixture:** a call without currency parses to `{ currency: 'USD' }` while the order's currency is `EUR`.
- **What decides the currency:** the order record. I'd ask for the `currency` argument to be removed and the executor to read `order.currency`. The fixed fixture produces a refund in EUR, and `z.strictObject` then rejects a stray `currency: "USD"`.
- **A required enum doesn't fix it.** It only moves the guess from the parser's default to the model, and `{currency:"USD"}` validates (`true`). At most, an argument could be compared with the record and rejected on a mismatch.
- **Sentences relied on:** "Facts the program stores, such as the order's currency, come from its records." Also "The schema describes what the caller may propose" and "Generate that input description from the parser…".
- **Rating:** Clear. The rule names this very field.
- **Side finding:** "Generate that input description from the parser" has a trap the rule doesn't mention. By default `z.toJSONSchema` uses `io: "output"`. That puts `currency` in `required: ["orderId","amount","currency"]`, which tells the model the field is required. Only `{ io: "input" }` gives `required: ["orderId","amount"]`. So the case's premise ("correctly says currency may be omitted") holds only if you pass `io: "input"`. The rule's word "input description" points the right way, but a reader using the default setting would be wrong without noticing.

### (2) The valid cancellation
**Decision:** The call passes validation but isn't authorized.
- **The fixture:** an executor that trusts `userId` cancels Bob's subscription during Alice's session.
- **Removing `userId` isn't enough.** With it removed and no further check, Bob's subscription still gets cancelled.
- **What I'd ask for:** build the executor inside a closure over `session.userId` and compare it with `subscription.ownerId` from the record at execution. The fixture then returns `denied` for Alice and `cancelled` for Bob.
- **Sentences relied on:** "A customer ID in the arguments isn't authentication; removing it doesn't check who owns the order." Also "Build its executor with the authenticated customer's identity, then check that customer against the referenced order when executing."
- **Rating:** Clear on the decision, Inferred on the generalization. The rule says "customer" and "order", so applying it to "user" and "subscription" is an easy step, but it is a step.

### (3) The confident outcome
**Decision:** `emailSent` should come from the send step's result. Concretely, `emailSent = result?.ok === true`, which is false both when the send fails and when it never runs.
- **The fixture:** the model's `{ emailSent: true }` validates fine. I'd take `emailSent` out of the model's reply schema; the fixture's strict schema rejects a model-supplied `emailSent`.
- **Sentences relied on:** "An outcome comes from the operation's result. Successfully parsing a boolean called `refundIssued` hasn't issued anything."
- **Rating:** Clear. The rule's example is `refundIssued` rather than `emailSent`, but the parallel is obvious.

### (4) The refinement with and without context
**Decision:** Only B rejects the refund.
- **A** (strictObject plus positive amount) accepts Bob's order in Alice's session (`true`).
- **B** rejects it ("order not found") and accepts the same call in Bob's session.
- **B's JSON Schema can't replace the check.** `z.toJSONSchema(A)` and `z.toJSONSchema(B)` are byte-identical (`identical: true`). The refinement is dropped silently, with no error.
- **Fixture extra:** if the order lookup is async, `B.safeParse` throws `$ZodAsyncError` ("Use .parseAsync()"), so B needs `parseAsync`.
- **What I'd ask for:** B's refinement has to be built per request, inside the executor's closure. It needs both the session identity and a fresh order lookup at execution time.
- **Sentences relied on:** "A refinement can make that ownership check too, but it needs the authenticated identity and the order record at execution." Also "Generating it doesn't export the ownership comparison."
- **Rating:** Clear.

### 1. Is the rule clear and testable?
Mostly yes. Each sentence turns into a check you can run.

**Strongest sentence:** "Successfully parsing a boolean called `refundIssued` hasn't issued anything." It is concrete, slightly funny, and turns straight into a test. The runner-up is "A customer ID in the arguments isn't authentication; removing it doesn't check who owns the order." It answers the obvious half-fix before the reader proposes it.

**Weakest sentence:** "A refinement can make that ownership check too, but it needs the authenticated identity and the order record at execution." It is accurate, but it leaves several things unsaid:
- that the schema then has to be built per request or per session (a closure or factory) and can't be a module-level constant;
- that a lookup usually makes it async;
- that "at execution" really means "at parse time, just before executing", so there is a small gap in which the record could change between the check and the action.

A reader could easily write one module-level `refundSchema.refine(...)` and wonder where the session comes from.

**Undefined or ambiguous terms:**
- **"Proposal":** a good word, but the rule never says who accepts it. The executor? A human?
- **"Build its executor with":** I read it as a closure or factory over the session. That is Inferred; "construct per session" would be explicit.
- **"Input description":** it means JSON Schema in input mode, but nothing warns that Zod defaults to output mode (see case 1).
- **"Outcome":** clear from the example.
- **"The referenced order":** limited to orders, so subscriptions, users and emails all need inference.

### 2. Does it read like a person speaking?
Partly.
- **What I enjoyed:** the first sentence ("A valid tool call is still a proposal") lands well, and the `refundIssued` line is the best moment.
- **Where it drags:** the second paragraph reads like a list of rules in a row, five short declaratives with the same rhythm: "Generating it doesn't…", "Facts the program stores… come from…", "An outcome comes from…".
- **Where it sounds like a spec:** "check that customer against the referenced order when executing" and "the authenticated identity and the order record at execution" sound more like a spec than a person talking. The repeated "at execution" / "when executing" feels mechanical.

It's fine as a rule block, but not memorable beyond the opener and the closer.

### 3. Did any fixture contradict a claim?
No claim was contradicted.
- **Ownership checks:** both the closure-based check and the refinement work as the rule describes.
- **JSON export:** the export drops the refinement, confirming "doesn't export the ownership comparison".
- **Parsed flags:** a parsed boolean really does assert nothing.

One caveat qualifies "Generate that input description from the parser": the default `z.toJSONSchema` output is not the input description. You need `{ io: "input" }`, or fields with defaults are advertised as required. A second, lesser one: an async ownership refinement forces `parseAsync`. The rule doesn't say either, and the first one could mislead a reader who follows it literally.
