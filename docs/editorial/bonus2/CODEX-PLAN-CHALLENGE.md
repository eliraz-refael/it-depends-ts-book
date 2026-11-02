# Bonus 2 — Codex plan challenge

2026-11-02. Plan reviewed at `2d8010b`, on `codex/bonus-2-type-safe-agent-patterns`, based on Bonus 1's merge `d29db0a`. **Challenge complete; awaiting Claude's settlement. No chapter drafted and no plan edits.**

## 1. Ending first: keep the chapter, change what its evidence establishes

The chapter earns its place if its subject is **the difference between the tool description a caller receives and the authority its executor holds**. It does not earn it by rediscovering that network input needs parsing or that a branded object can represent a checked value.

My recommendation is a local Verdict, a session-bound executor with a private effect, and the currency hook retained as a failed repair: **generating the description leaves the dollar refund unchanged.** The proposed `io: "input"` description still permits the omission that triggers USD. That is a useful, reproducible surprise. It contradicts the proposed account of generation as Fix 1 for this incident.

The other substantial correction is mechanism 5. A plain object brand does not guarantee that this order, in this session, is the order whose ownership was checked. A spread can change its ID while preserving its accepted `OwnedOrder` type. That is already Ch15's central warning, reproduced here without an assertion or `any`. Using precisely that representation as the chapter's safety payoff would undo earlier learning.

The most useful new composition is small: expose a generated description of permissible proposals; retain the authenticated session inside the callable tool; validate its input and apply policy against the order record before recording the effect. **The same advertised schema and the same wire call can legitimately succeed in one session and fail in another.** I ran that control. Description generation cannot replace that distinction.

## 2. The open questions, before the implementation details

### New learning, or Ch15 and Ch16 again?

The current five mechanisms give us old techniques in a useful new arrangement, not five new lessons. That is appropriate for the bonus act. Make the arrangement visible: the program sends a description out, receives a proposed call back, then decides whether to exercise its own authority. A conventional endpoint need not advertise itself to its caller this way; this shop's agent integration does. Neither case gets to trust the returned arguments.

"One definition produces three projections" is useful construction advice, but "so they can't disagree" is too strong. Zod can execute a contextual ownership refinement that its generated JSON Schema does not express. Free-text descriptions can also misstate the units. Both reproduced. The exported description and the runtime acceptance rule are related, not equivalent.

"Ask only for intent" also needs qualification. The model supplies a **proposed** order and amount; their presence proves neither the customer's intention nor approval. Conversely, an `expectedCurrency` supplied by a caller could legitimately be compared against the record as a precondition. The rule should concern which source determines the action, rather than banning every duplicated fact from every request. Here the supplied currency must not select the currency of the refund, and a supplied customer ID must not select the acting customer.

Keep the local policy explicit: this authenticated customer may request a partial refund of an eligible order they own, up to its remaining refundable amount. Those are the shop's stipulated rules, not rules TypeScript discovers. Then demonstrate the program enforcing them.

### The currency hook is salvageable, but its proposed diagnosis is wrong

Both the handwritten description and the generated input description permit `{ "orderId": "o-12", "cents": 500 }`. The parser supplies USD in both cases. The wire artifact does not show the caller disobeying either description. "We told it two different things" is not established by this example.

Give the default a competent origin: the shop previously had only USD orders and retained the default when introducing EUR. That is a proposed story condition, not an observation about a real system. With that condition the mistake is credible, and the chapter needn't pretend someone added an arbitrary default to manufacture a bug.

Also show the actual effect adapter. Parsing alone does not refund anything. My reproduction records `{ orderId, cents, currency }` in a local ledger; it deliberately trusts the parsed currency. The page can say that this shop's ledger recorded a dollar refund. Claiming a customer actually received dollars requires that behavior from the displayed shop adapter, not an unstated assumption about a payment provider.

If the chapter must open with actual description drift, an old `amount` name against a new required `cents` field is honest, but it rejects rather than silently selecting USD. That is a weaker hook and repeats Bonus 1's contract mismatch. I prefer the currency incident and the failed generation repair.

### `io: "input"` is consequential here, not a separate tutorial

Zod documents that JSON Schema generation describes output by default and that `io: "input"` describes input; defaults can make these different. For an ordinary `z.object`, output generation sets `additionalProperties: false`, reflecting stripped output, while input generation omits it. `z.strictObject` sets it in both modes. These distinctions are documented in [Zod's JSON Schema guide](https://zod.dev/json-schema#io) and its [object-schema section](https://zod.dev/json-schema#object-schemas).

Show the two `required` lists, then return to the incident. Sending the output description would require a field the runtime parser accepts missing. Sending the input description accurately describes that omission but leaves the default in place. That is enough to earn the setting. Don't print two large schema dumps or suggest JSON Schema's `default` keyword performs Zod's runtime insertion.

Use `z.input<S>` when discussing what may enter and `z.output<S>` (equivalently `z.infer<S>`) for the parsed handler argument. In my control the handler can call `args.currency.toLowerCase()` without a guard even when the input omitted currency.

### Prefer the closure here; don't pretend it is a universal replacement for evidence types

There is one local refund path in the proposed story. No separate legitimate consumer needs to retain a checked order. Keeping the lookup, policy check and private refund effect together has fewer promises to maintain than exporting `OwnedOrder`.

A brand can be useful where several trusted consumers need a distinction, but its representation and operations must preserve the fact it claims. This plan supplies neither that need nor that preservation. A checked snapshot also cannot promise that ownership remains current after a later transfer. A session-bound closure still needs a fresh lookup and a real ownership comparison; capturing a session is not itself authorization.

Capture the authenticated customer ID when building the tool, rather than trusting an arbitrary mutable session object forever. Do not place a customer-bound tool in a registry reused for other customers. These are construction obligations for this design, not a claim that closures automatically provide security.

### The no-claims rule can stay

Put the fixed artifacts on the page: the shop's outbound tool description, a short customer conversation, the returned `{ name, arguments }`, and the recorded effect. Label the wire format as the shop's. Let the assistant sound confident in that fixed conversation, without claiming anything about real models, schema obedience, or frequency.

It is a strength that replaying the same call with a script reproduces the incident. The chapter's claim is about the receiving program. Agent presence comes from the interaction and the description it publishes, not from inventing a model-specific failure mode.

### A local Verdict is earned

Once the session, ownership rule and authoritative order currency are stated, the wrong-customer call is not a matter of taste. Nor is retaining a USD default for this EUR refund. The controls distinguish these choices without any real-model experiment.

Whether the shop should permit automatic refunds at all remains a product decision. It can be one Additional Take, but it should not reopen the local repair. `ProposedRefund` and `ApprovedRefund` would introduce another evidence-type obligation; don't add those types merely to give the exchange a technical ending. State who approves under the local policy and leave a different approval policy possible.

## 3. Reproduction of all five mechanisms

All commands below run from the b2 worktree. The installed versions are Node `v22.23.4`, TypeScript `7.0.2`, Zod `4.6.2`. The probes use `checks/compiler.cjs`'s book defaults: strict, exact optional properties, ES2022, Node16 modules/resolution, `types: []`, and `skipLibCheck: true`; they add `noEmit: true` and `allowImportingTsExtensions: true`. Runtime fixtures run under Node's TypeScript support after compilation. There is no alternative compiler or global Zod dependency.

Rebuild commands:

```sh
node .probe/codex/b2/probes.cjs
node .probe/codex/b2/authority.cjs
```

The first asserts 16 compiler cases and the schema, registry and brand runtime controls. The second asserts three compiler cases and the session/policy/runtime controls. Compiler invocations use the worktree's CLI, for example:

```sh
node_modules/.bin/tsc -p .probe/codex/b2/handler-field-rejected.json --pretty false --noErrorTruncation
node_modules/.bin/tsc -p .probe/codex/b2/owned-flat-literal-rejected.json --pretty false --noErrorTruncation
```

### Mechanisms 1 and 2: reproduced, with a different causal conclusion

The schema is the plan's ordinary object with an enum currency defaulting to USD. The relevant output from `schema-runtime.ts` is:

```text
parsed:           {"orderId":"o-12","cents":500,"currency":"USD"}
beforeGeneration: {"orderId":"o-12","cents":500,"currency":"USD"}
afterGeneration:  {"orderId":"o-12","cents":500,"currency":"USD"}
output.required: ["orderId","cents","currency"]
input.required:  ["orderId","cents"]
output.additionalProperties: false
input.additionalProperties: absent
```

These are selected fields from `.probe/codex/b2/schema-runtime.log`, not the literal format of its JSON pretty-printer. The before/after control deliberately holds parsing and effect code fixed while generating the description: generation is not an execution change.

Removing the default and making currency required rejects the omitted field. It still accepts an explicit USD for the EUR order. Supplying EUR succeeds. GBP fails enum validation. Removing currency from the argument schema and deriving it from the owned order succeeds in EUR in the closure fixture. These controls separate presence, membership in an enum, and agreement with an authoritative record.

Generation has further limits, independently reproduced against the installed version:

- An ownership refinement rejects o-17 at runtime, while its generated input schema is equal by value to the unrefined schema.
- `.describe("Amounts are in dollars; the customer is already authorised.")` copies that text into the generated description. Generation cannot establish either claim.
- Generating the output of `z.string().transform(s => s.length)` throws `Transforms cannot be represented in JSON Schema`; generating its input succeeds with `type: "string"`.
- `z.string().meta({ type: "number" })` generates `type: "number"`. Do not generalize the single-definition slogan into a guarantee against arbitrary metadata overrides.

Zod explicitly documents [unrepresentable types](https://zod.dev/json-schema#unrepresentable) and [metadata overrides](https://zod.dev/json-schema#metadata). The refinement comparison above is an installed-version probe, not a claim that JSON Schema represents arbitrary application predicates. Keep these adversarial controls in validation; the manuscript needs only the limitation that matters to this incident.

### Mechanism 3: the inference and correlation claims hold

The malformed handler produces:

```text
bad-handler.ts(2,71): error TS2339: Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.
```

Selecting between incompatible schema/handler pairs and calling `tool.run(tool.schema.parse(...))` produces TS2345: the parsed union is not assignable to the intersection of the handler parameters. The direct, correlated call to one concrete tool compiles as the control. Packaging parsing and handling inside `invoke(raw: unknown)` compiles without an assertion.

The successful registry fixture contains two tools with different argument and result shapes, not two copies of the refund signature. Its first three outputs exactly reproduce the plan:

```json
{"ok":true,"value":"refund 500 on o-17"}
{"ok":false,"error":"cents: Invalid input: expected number, received undefined"}
{"ok":false,"error":"unknown tool cancel_order"}
```

A lookup returns an object successfully. Malformed JSON and an envelope whose `arguments` is already an object are rejected separately. Validate the envelope, select the name, decode the string into `unknown`, then invoke the selected parser. Don't leave the actual inbound string out of the page's call path.

There is one additional design decision to settle before drafting. The proposed synchronous helper accepts an async handler by inferring `R` as a Promise. My failing-effect control compiles, serializes its immediate answer as `{"ok":true,"value":{}}`, then rejects with `effect failed` when the contained promise is awaited. That isn't an authorization bug; it is an inaccurate completion result if the page presents it as one.

Either explicitly keep the shop effect synchronous and in memory, or make `invoke` await the handler and return `Promise<Result<R>>`. I tested the latter in the alternative. Its handler itself returns the domain Result, so a denial does not become a success containing another Result. Treat this as plumbing, not another Turn: Ch23 already owns the nested-result/promise lesson. Unexpected operational exceptions also need an explicit caller policy if the chapter introduces a real async adapter; the in-memory fixture makes no claim about network failures.

### Mechanism 4: valid and unauthorized, reproduced

The original registry returns `refund 500 on o-17` for the fixed call. That proves the handler ran, not a payment effect. My separate ledger fixture records an actual local effect for o-17 when the session check is omitted. Alice is the session customer; Bob owns o-17.

With the session check restored, the same wire call returns:

```json
{"ok":false,"error":"order unavailable"}
```

The ledger length is zero. Alice's o-12 succeeds with `{ "orderId": "o-12", "cents": 500, "currency": "EUR" }`; Bob's tool succeeds on o-17. The advertised refund schemas are the same. An always-deny implementation would fail these positive controls.

**Correction to Principle case (d): refinements can authorize.** A refinement that consults this trusted session and the current order record accepts Alice's own order and rejects Bob's. A static shape restriction or positive-amount refinement does not do that work. The test is what the refinement checks, not whether its API is called a validator. Its generated schema still equals the base input schema. This is particularly good evidence for the chapter's revised direction.

### Mechanism 5: the diagnostics hold; the claimed guarantee does not

The raw string fails with TS2345. A literal missing a unique-symbol member fails with TS2741 when `OwnedOrder` is a flat object type. Using the usual `Readonly<Order> & { readonly [owned]: true }` spelling gives TS2322 for the same literal assignment, with the missing member in the message. Both spellings were checked. Pin the exact declaration before quoting the diagnostic; the plan's TS2741 is reproducible, not universal.

The checked lookup path compiles and records EUR for Alice's order. This also compiles and records USD against Bob's order:

```typescript
const order = loadOwnedOrder({ customerId: "alice" }, "o-12");
if (order) {
  issueRefund({ ...order, id: "o-17", customerId: "bob", currency: "USD" }, 500);
}
```

The symbol is private and the properties are readonly in the exposed type. The spread still retains the marker. This is exactly the kind of operation Ch15 requires us to inspect.

Three further controls narrow the promise:

- A Bob-owned value can be passed to an Alice-labelled function accepting the same `OwnedOrder` type. The type is not indexed by session.
- A checked snapshot survives a later ownership transfer. The branded snapshot still permits the effect unless the execution path checks current authority again.
- Two refunds of 600 against an original paid amount of 1,000 each satisfy a per-call `cents <= paidCents` check. Their total is 1,200. If the chapter promises a remaining balance, it must maintain one.

A direct `JSON.parse` result also bypasses the brand through `any`; that control belongs off-page. The spread is sufficient to disprove the strong claim without bypassing type checking. Do not publish "the type only guarantees that the path went through them" without specifying which unchanged value and which check: the accepted spread did not pass through the ownership check with its new ID, and an order brand says nothing about the later amount.

## 4. The smaller repair I verified

`authority.cjs` builds a session-bound tool whose input contains only order ID and cents. The effect and order store are private to the shop implementation. Binding captures the authenticated customer ID. Invocation parses input, looks up the current order, compares ownership, checks the remaining amount, and records the refund with the order's currency. The local balance check and mutation have no suspension point between them.

The verification includes:

| Control | Observed result |
|---|---|
| Remove ownership comparison | Alice's o-17 call succeeds; one foreign-order effect |
| Restore it | Same call denied; no effect |
| Alice/o-12 and Bob/o-17 | Both succeed, with each record's currency |
| Supply `customerId` or `currency` in strict input | Rejected; cannot select either authority |
| Negative, fractional or string amount | Rejected |
| Amount above remaining balance | Rejected |
| Two 600-cent calls against 1,000 | First succeeds, second fails; one effect |
| Mutate original session object after binding | Existing tool still acts for captured customer |
| Transfer the order after binding | Fresh lookup denies the old owner's call |
| Import private effect / call it on returned shop | TS2305 / TS2339 |
| Structured model reply says `refundIssued: true` after denial | Boolean schema accepts it; host-derived outcome remains false |

The probe exposes transfer and unsafe-construction helpers solely to drive controls. Those are not proposed public tool capabilities. The final chapter should expose only what its intended callers need and give tests a separate way to inspect effects.

This is an in-memory sequential policy demonstration. It is not a transaction, idempotency or payment-delivery proof, and the chapter needn't become one. In particular, a ledger receipt supports "our program recorded the refund", not an unshown provider's settlement. If the final implementation suspends between reading balance and updating it, its stated remaining-balance guarantee needs a different control.

## 5. A retellable sequence, rather than a registry tutorial

Suggested working title: **Bonus 2: Whose Refund Is It?** The existing bonus numbering remains appropriate.

1. Gilad has the euro ticket and the dollar ledger entry. Put the fixed call next to the USD default; establish its old USD-only reason briefly.
2. Dafna derives the description from the parser and binds the typed handler inside `invoke`. Guy asks her to replay the original call. Still dollars. The input description accurately says currency may be omitted.
3. Requiring currency only makes this caller provide one. A fixed call supplying USD still passes. Liron asks why that field decides anything when the order record already has the answer.
4. Remove currency from the arguments and use the record. Then run the already visible o-17 artifact. It is well-formed, and it belongs to someone else. Guy asks where the customer comes from. The team binds the executor to the session and checks ownership before the private effect.
5. Replay o-17 under both sessions, then o-12 under its owner. Same public schema; different legitimate answers. This is the payoff for publishing a tool without publishing the authority it exercises.
6. If space permits, let the fixed assistant reply still say it refunded the denied order. One short exchange replaces that boolean with the executor's result. No third implementation subplot.

The Turn is the change from arguing about the supplied fields to deciding which source has authority over the action. Currency and ownership are two consequences of that change, not two surprise warnings about untrusted input. Show o-17 and the ownership facts before its denial becomes the answer, so the reader can predict the check.

The proposed copy-editing objection is too weak to carry the debate: support can edit a tool's prose while the program generates its parameter structure. Generated schema verbosity is not a reason to maintain an unchecked duplicate. An existing client could create a real migration cost, but it needs an actual consumer and an observable incompatibility; introducing that story would spend this chapter's scarce space.

Give Guy the stronger objection he can substantiate: "You've described the arguments. Who is allowed to run it?" He can agree to the closure once it actually contains the private effect and the session rule. A class with the same encapsulation would also work; there is no need to award another FP-versus-OOP victory.

## 6. Repetition, bonus scope and cast

| Earlier material | Boundary for this chapter |
|---|---|
| Ch1/2: `any` and assertions | Decode to `unknown`; no second escape-hatch debate |
| Ch5/16: narrowing, schemas, boundary parsing, unknown keys | Use the validator; don't rediscover why it is necessary |
| Ch9: keeping names and values correlated | One failing union call at most; the closed-over parser is the useful application |
| Ch15: branded checked objects and spread | Its warning directly rules out the proposed object-brand guarantee; don't restage its Turn |
| Ch20/21: partial application and higher-order functions | Bind the session without a closure lesson |
| Ch22: descriptions and evaluators | A relevant additional overlap: serialized descriptions don't replace executing policy; here the distinction is caller-facing input versus private authority, not historical policy replay |
| Ch23: nested Results and asynchronous composition | Avoid claiming a promise wrapped in success is a completed refund |
| Ch26: negative and positive checks | Apply them quietly; no testing-method subplot |
| Ch27: measured performance | No timing, compiler-performance or model-performance argument |
| Bonus 1 | The running program receives proposed actions; nobody is commissioning an implementation or repairing a prompt |
| Bonus 3 | Leave finished generated-code review and repository-diff judgment to it |

I checked the proposed cast against `book/00-prologue/02-meet-the-cast.md`: **Liron he; Gilad he; Dafna she; Guy he; Eden he.** The plan's pronouns are correct. Choose Guy and omit Eden: the main cost is the shape and ownership of the execution boundary, not a migration whose consumer we have yet to invent. Dafna and Guy's established disagreement about encapsulation is useful here. Both must get a real point right.

Keep Liron as Principle owner. Ch22 is his latest appearance and Principle, and the analogy between a description and an executable capability suits him. Gilad already owns Ch16's and Ch25's Principles; using him again would bring the nearest repetition into the opening voice. Let Gilad supply the concrete receipt and replay, Dafna the useful constructor, Guy the authority question, and Liron the rule connecting them. Four people are enough. The rested Bonus 1 and Ch27 casts need not join for a diagnostic cameo.

## 7. Principle direction and four reader cases

Liron should start with a rule the reader can apply: **a valid proposed call does not decide who may act, which stored facts are true, or whether an effect happened.** Generate the representable input description from the argument schema and validate the actual received input. Bind execution to authenticated context, check its policy against authoritative records, and build outcome fields from the executed result.

The final wording should make the two sides explicit without becoming a policy checklist: the caller proposes an action; the program supplies the authority and verifies the conditions for doing it. Don't say "so they can't disagree", "only what you don't know", "evidence the model can't forge", or imply a field's successful parsing establishes user approval. Don't mention brands unless the settlement retains a justified brand design. A short parable may belong in the conversation; it should not displace the opening rule.

Proposed Principle-only cases:

1. **The accurate description, wrong default.** A generated input schema permits omitted currency; the parser supplies USD; the known order is EUR. Does generation repair the refund? Expected: no. Input/output shapes differ legitimately; select the action's currency from the order record. Requiring an enum member alone doesn't establish agreement with that record.
2. **The valid cancellation.** `cancel_subscription({ userId, subscriptionId })` validates both strings, but the authenticated session belongs to someone else. Expected: the proposed actor must not choose the acting identity. Bind trusted identity and check authority over the referenced subscription. Removing `userId` alone isn't enough.
3. **The confident outcome.** A structured reply validates as `{ emailSent: true }`, but the send step failed or never ran. Expected: derive the outcome from the actual send result at the level it establishes; a validated boolean isn't evidence of sending or delivery.
4. **The refinement with and without context.** One reviewer proposes `strictObject` plus a positive amount. Another proposes a runtime refinement comparing the current order owner with the authenticated session. Both export the same parameter structure. Which rejects the foreign order, and can the exported schema replace that check? Expected: the contextual refinement can establish the ownership condition; static shape checks cannot; generation doesn't reproduce that runtime policy.

These cases ask for consequences, not the words "validate" or "single source". In particular, a reader who rejects all refinements as incapable of authorization has mislearned the chapter.

## 8. Requirements for the eventual chapter check

Keep the plan's one evolving repository and every-fence extraction. Add the controls that distinguish the proposed claims:

- Hold the wire artifact fixed across handwritten/generated descriptions and assert that the USD-default behavior remains until execution changes.
- Assert input/output `required` lists under Zod 4.6.2 and the stated object mode; compare generated parameter data by value. Don't require arbitrary contextual refinements to appear in JSON Schema.
- Give the registry two different tools; assert the missing-field diagnostic and the union failure only if printed. Preserve successful dispatch, invalid arguments, invalid JSON, invalid envelope and unknown-name controls.
- Assert the ledger, not just the returned sentence. Run foreign and own orders under two separately bound sessions. Removing the ownership comparison must restore the old bad effect.
- Assert the selected currency and zero effects on denial. If remaining balance is promised, test repeated refunds, not only one amount greater than the original payment.
- If a brand remains, test the spread, cross-session and stale-value cases before claiming its invariant. Otherwise remove the plan's mandatory brand diagnostics; the private-effect diagnostics are the relevant replacement if shown.
- If handlers are asynchronous, await their outcomes before reporting success. A local in-memory fixture may stay synchronous, but label it and don't print completion claims it hasn't established.
- If the final-reply beat stays, assert both the schema-valid false claim and the host-derived result with the ledger unchanged.

Evidence remains untracked in `.probe/codex/b2/`: `probes.cjs`, `authority.cjs`, generated source/config files, `COMPILER.json`, `AUTHORITY-COMPILER.json`, `SUMMARY.json`, runtime logs and `AUTHORITY-RUNTIME.json`. There are **19 asserted compiler cases** across the two scripts. Only this challenge belongs in the commit.

The settlement decisions are concrete: retain the currency hook as a failed generation repair; replace the exported object brand with a private session-bound execution path; scope the single-source claim to representable input structure; acknowledge that contextual runtime refinements can authorize; and end with a local Verdict about whose information determines the action. That leaves the chapter about wiring an agent's proposed calls into a program, without claiming a new law of types or a fact about a real model.
