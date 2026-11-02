# Bonus 2 — Type-Safe Agent Patterns (working title)

Status: **PLAN SETTLED; CHAPTER JOINTLY APPROVED**, 2026-11-02. The settlement at the end governs where it differs from the original proposal.
Branch: `codex/bonus-2-type-safe-agent-patterns`, based on `origin/main` `d29db0a` (Bonus 1's merge,
PR #30).
File: `book/05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md`.

## The premise governs this plan

The book should be fun to read, and while it's fun to read, you learn something
([premise](CH22-PLAN.md#the-books-premise-governs-the-draft-2026-10-25)).
- **No quota for the ending.** It ends open only if competent owners still disagree once the
  conditions are on the page. Otherwise it ends in a Verdict.
- **The reader should leave able to wire a model's tool calls into a TypeScript program** so the
  types describe what the program actually received and decided. They should know:
  - that the description you send the model and the type you trust are two copies of one contract,
    and they drift unless one definition produces both;
  - that the model's arguments are untrusted input, however well you described them, so the same
    definition also validates them (Ch16's boundary, applied to a producer you instruct);
  - **the new idea:** which fields to ask the model for at all. The model supplies *intent* (which
    order, how much). The program already holds the *facts*: whose session it is, the order's
    currency, what was actually done. A field the program knows shouldn't arrive from the model,
    validated or not;
  - how the types can make the last rule hold: tools bound to the session, and effects that take
    evidence the program produced rather than the model's strings.
- **This is the bonus act.** It applies earlier chapters' tools in a new setting and must not
  re-teach them.

## Scope against the other bonus chapters

- **Bonus 1 (merged):** the spec you hand over before generation, and judging returned code by
  checks you own. Bonus 2 must not re-run its "which file says that?" lesson.
- **Bonus 2 (this plan):** where a model's output enters a *running* program: tool calls and
  structured output.
- **Bonus 3, reviewing AI code:** reading a finished diff. Leave it its subject.

## No claims about real models or products

As in Bonus 1:
- **The assistant is the fictional shop's support agent, unnamed.** No product, model or SDK names,
  and no claim about how any real model follows schemas, how often, or which prompts work better.
- **The wire format is the shop's own** (`{ name, arguments }`, with `arguments` a JSON string),
  labelled as what their client receives. Don't imitate a vendor's API.
- **Every model output on the page is a fixed artifact** the page labels as what came back. The
  lesson must hold whether the caller is a model, a script or a person with `curl`.
- **What we may state:** facts about our program. Our code receives a string. Nothing in our process
  enforces the schema we sent. Zod's behaviour, from its own documentation and the installed 4.6.2.

## What earlier chapters already settle (don't repeat)

- **Ch1/Ch2:** `JSON.parse` returns `any`, and `as` is a promise. One callback at most. Bonus 1
  already used both.
- **Ch5, Ch16:** Zod schemas, `z.infer`, parsing at the boundary, and what an object schema does
  with unknown keys (Ch16's whole subject). If stripping appears, it's a one-line callback.
- **Ch9:** correlated unions. If dispatch over a union of tools hits the intersection error, that's
  Ch9's lesson. One line, or design it away (mechanism 3).
- **Ch15:** brands that promise a check passed, with `unique symbol`. Bonus 2 may use the idiom for
  evidence (mechanism 5), with one callback, not a re-argument.
- **Ch20/Ch21:** closures and partial application. Session-bound tools are a closure; don't
  re-teach it.
- **Bonus 1:** owned tests and requests. Don't stage another request-writing scene.

## Verified mechanisms (TS 7.0.2, Zod 4.6.2)

Probes are in my session scratchpad (untracked). The flags are `--strict --exactOptionalPropertyTypes
--noEmit`, `module`/`moduleResolution` `Node16`, `.ts` imports. Codex reproduces them in `.probe/`,
untracked, after `npm ci` in the new worktree.

1. **A hand-written description drifts silently.** The description sent to the model is an object
   literal, so nothing type-checks it against the validator. The validator later gains
   `currency: z.enum(["USD", "EUR"]).default("USD")`. The model, told only about `orderId` and
   `cents`, sends `{"orderId":"o-12","cents":500}`. It parses to
   `{"orderId":"o-12","cents":500,"currency":"USD"}`. A euro order is refunded in dollars, and
   everything compiles and validates.
2. **One definition can produce the description.** `z.toJSONSchema(schema)` exists in 4.6.2.
   - **The default is the *output* shape.** It lists `currency` as **required**, with
     `"default":"USD"` and `"additionalProperties":false`.
   - **`{ io: "input" }` gives what a sender may send:** `currency` optional, and no
     `additionalProperties`.
   - The description you send should be the input shape. Codex must cite Zod's JSON Schema
     documentation for `io`, and decide whether this is one line or a beat.
3. **A registry that infers each handler's arguments, without a cast.**
   - `defineTool({ name, description, schema, run })` with `run: (args: z.infer<S>) => R`. A handler
     reading a missing field is **TS2339** at the definition.
   - **Dispatching over a union of tools gives TS2345:** the argument type is a union, the parameter
     an intersection. That's Ch9's correlation problem.
   - **The erased form avoids it.** `defineTool` returns
     `{ name, description, parameters, invoke(raw: unknown): Result<R> }`, and parsing happens inside,
     where the schema and handler are still correlated. The registry is a plain array and dispatch
     needs no assertion. Verified outputs:
     - `{"ok":true,"value":"refund 500 on o-17"}`;
     - `{"ok":false,"error":"cents: Invalid input: expected number, received undefined"}`;
     - `{"ok":false,"error":"unknown tool cancel_order"}`.
4. **Valid isn't authorised (the Turn candidate).** `refund_order` with `{"orderId":"o-17",
   "cents":500}` parses and runs, but o-17 belongs to another customer. The chat said "my friend
   asked me to sort out o-17". Every type and schema is satisfied.
5. **Evidence the model can't forge.** With
   `issueRefund(order: OwnedOrder, cents: number)` and a `unique symbol`-branded `OwnedOrder`
   produced only by `loadOwnedOrder(session, id)`:
   - `issueRefund(args.orderId, args.cents)` gives **TS2345** ('string' is not assignable to
     'OwnedOrder');
   - an object literal pretending to be one gives **TS2741** (property `[owned]` missing);
   - the lookup path compiles.

   The ownership check and the cap (`cents` ≤ what was paid) are runtime facts in `loadOwnedOrder`
   and the refund path. The type only guarantees that the path went through them.

## Candidate scenario and decision

Codex may replace any of this. Whatever replaces it must keep the premise and the no-claims rule.

**Hook: "It refunded in dollars."**
- **Gilad** (he, "Show me the stack trace") has a support ticket. A customer in Lyon asked for €5 back
  on order o-12 and received $5.
- **The trace:** the agent's tool call `{"orderId":"o-12","cents":500}`, a validator with a `USD`
  default, and a hand-written description that never mentions currency. "It did exactly what we
  told it. We told it two different things."
- **Fix 1, one definition:** the description is generated from the schema (mechanism 2), with the
  input-shape detail if it earns a line. The registry infers handler arguments (mechanism 3).

**The argument: whose definition?**
- **Dafna** (she) wants one definition for the type, the validator and the description: "three
  projections of one fact".
- **Guy** (he) or **Eden** (he) objects with a real cost. The description is product copy that
  support edits, and generated JSON Schema is verbose. Or another client already consumes the
  hand-written file. Dafna's answer has to cost something.
- **Then:** do they now ask the model for `currency` too, as a required field?

**The Turn: "Why is it telling us?"**
- **Liron** (he, parables) or Gilad: "Why is the model telling us the currency of *our* order?" The
  order record knows it. Remove `currency` from the tool's arguments entirely.
- **Then o-17** (mechanism 4): the same question about the customer. The arguments were valid; the
  call wasn't. The program knows whose session this is.
- **The repair:**
  - tools are built per session (a closure, so no new lesson);
  - the refund effect takes an `OwnedOrder` that only the session-scoped lookup produces
    (mechanism 5);
  - the model supplies an order reference and an amount, nothing it could only guess or claim.
- **Possibly also:** the structured final reply's `refundIssued: true` when no refund ran. The
  program fills outcome fields from its own record, not from the model's text. Codex decides
  whether this third instance earns its space or makes the pattern a list.

**Verdict (my expectation; Codex decides, with evidence):** local.
- One definition produces the type, the validator and the input-shape description.
- Ask the model only for intent. Take identity, facts and outcomes from the program.
- Effects take evidence the program produced, so a model's string can't reach them.

**Could be open:** whether the agent should *execute* a refund at all, or only *propose* one for a
human or a rule to approve. That's a product-risk decision, not a type one. My expectation is an
Additional Take, typed as `ProposedRefund` vs `ApprovedRefund` in one exchange.

**What I don't know, and Codex should attack first:**
- **Is this new learning, or Ch16 + Ch15 in an AI costume?** My claim: the new things are the
  description as a second copy of the contract, and "ask only for intent". Attack both.
- **Is the currency hook honest?** A `.default("USD")` added to a validator but not to a description
  is plausible, but is it a strawman? Find a better silent drift if there is one.
- **Mechanism 2's `io` detail:** is it a fact a reader needs, or a trivia beat?
- **Is `OwnedOrder` the right evidence type,** or should the session-bound closure carry it without
  a brand? Which one does the check prove, and which reads better?
- **The no-claims rule:** does the chapter still feel about agents if every scene would work with a
  `curl` caller?

## Principle (must be stated, in an expert's words, before the scenario)

**My recommendation: Liron Closure (he).** He last appeared, and last set the Principle, in Ch22.
A parable may open the Debate, but the Principle itself must be a testable rule up front, in plain
speech. Gilad is the alternative, but he set Ch16's and Ch25's, and Ch16 is this chapter's nearest
neighbour.

**Its direction, not its wording:**
- Describe a tool from the same definition that validates its arguments, so they can't disagree.
- What the model sends is input from a caller you instructed, not trusted: parse it, and expect
  valid nonsense.
- Ask the model only for what you don't know: which thing, how much. Take whose, which currency and
  what happened from your own program.
- Make the effect take something only your program can produce, so the model's string can't reach
  it.

**Principle-only reader cases (draft; Codex may replace):**
- **(a)** The description says `amount` in dollars; the validator expects `cents`. The model sends
  `{"amount": 5}`. What failed, and what's the structural fix?
- **(b)** A tool `cancel_subscription({ userId, subscriptionId })`. Every call validates. What's wrong
  with the signature?
- **(c)** The final structured reply includes `emailSent: boolean`, which the model fills. A ticket
  says it claimed `true` when nothing was sent. Where should that field come from?
- **(d)** A reviewer proposes `z.strictObject` and more refinements on `refund_order` so the model
  "can't send anything wrong". Does that solve o-17?

## Cast

- **Liron Closure** (he): the Principle, and "why is it telling us?"
- **Gilad Stacktrace** (he): the ticket and the trace.
- **Dafna Functor** (she): one definition, three projections.
- **Guy Singleton** (he) or **Eden Legacy** (he): the cost of generating the description.

**Rested:** Eli, Dima, Idan and Chen (Bonus 1), and Daniel, Gil, Linoy, Noam and Oded (Ch27). Check
every pronoun against the bios.

## Voice and constraints

- Calibrate on Ch7. Fun first. The scenes readers should retell:
  - "It refunded in dollars";
  - "We told it two different things";
  - "Why is it telling us?";
  - o-17, valid and somebody else's.
- Avoid the later register's templates:
  - silent "leaves X beside Y" closers;
  - "in the review" endings;
  - the narrator as a manual;
  - caveats nobody would raise.
- **No hype and no doom.** The agent is a component that sends requests; the team is competent.
- One running repository, small counts and every fence checked. Label each file in its fence.
- Length: 2,300–3,000 words.

## Validation plan

`checks/bonus2.cjs` compiles every fence on the book profile as one evolving repository, in the
page's sequence of states, and runs it with Node 22.

Compiler cases:
- every quoted diagnostic (TS2339, TS2345 and TS2741 at least), with positions;
- a cast-free registry and dispatch;
- the evidence type rejecting the raw string and a forged literal.

Runtime groups:
- every printed output, including the drifted refund, both `toJSONSchema` shapes if shown, and each
  dispatch result;
- the o-17 call succeeding before the repair and failing after it;
- the description generated from the same schema the handler parses with, compared by value.

Also update `checks/README.md`, `checks/run.cjs`, `docs/editorial/README.md` and `PLAN.md`.

**Readers** (all fresh and isolated, also asked where they enjoyed it, where they got bored and which
scene they'd retell):
- three Principle-only readers, with the four cases;
- a fresh full reader;
- a targeted recheck after revisions.

## Completion

- [x] Codex challenges this plan: new learning versus Ch15/Ch16 in an AI costume, the hook's honesty,
  the evidence type, the `io` detail, the ending and the cast. Disagreements are settled on
  evidence ([challenge](bonus2/CODEX-PLAN-CHALLENGE.md)).
- [x] Codex drafts and self-reviews ([record](BONUS2-REVIEW.md), [snapshot](bonus2/DRAFT3-SNAPSHOT.json)).
- [x] Claude's formal review: Principle-only and fresh full readers, a targeted recheck and a final
  diff review ([review 1](bonus2/CLAUDE-REVIEW.md), [review 2 and final diff review](bonus2/CLAUDE-REVIEW-2.md)).
- [x] Final draft's checks durable, and the full suite green on the frozen manuscript (Bonus 2 9 / 27 / 31).
- [x] Clean `npm ci` and full suite green at final review.
- [x] Both of us read the final text start to finish (Codex: "Approved as is").
- [x] Ready for the author's review.

## Settlement after Codex's challenge (2026-11-02)

[Codex's challenge](bonus2/CODEX-PLAN-CHALLENGE.md) reproduced all five mechanisms (19 compiler
cases and runtime controls) and showed that two of my conclusions don't follow from them. **This
settlement governs where it differs from the proposal above.** I independently confirmed the two
that change the design:
- `issueRefund({ ...order, id: "o-17", customerId: "bob", currency: "USD" }, 500)` compiles: the
  spread keeps the brand while changing the checked id;
- a session-aware `.refine` rejects o-17, while its `io: "input"` JSON Schema is equal by value to
  the unrefined one.

**My errors, corrected by Codex:**
- **Generating the description doesn't fix the dollar refund.** The input description accurately
  says currency may be omitted, and the parser still supplies USD. "We told it two different
  things" isn't established by the example.
- **The exported `OwnedOrder` brand doesn't guarantee what I claimed.** A spread changes the id and
  keeps the marker. The type isn't indexed by session, and a checked snapshot outlives a later
  transfer. That's Ch15's own warning, so using it as the payoff would undo Ch15.
- **"So they can't disagree" is too strong.** A contextual refinement can authorise at runtime, and
  its generated schema doesn't show it. Free-text `.describe()` copies unverified claims, and
  `.meta()` can override the type. My reader case (d) wrongly implied refinements can't authorise.
- **"Ask only for intent" bans too much.** A caller-supplied `expectedCurrency` may legitimately be
  compared with the record. The rule is about which source *determines* the action.
- **The synchronous `invoke` accepts an async handler** and reports success before the effect
  completes.

**Settled:**
1. **The subject is the difference between the description a caller receives and the authority its
   executor holds.** The program sends a description out, receives a proposed call back, and then
   decides whether to exercise its own authority. These are old techniques in a new arrangement, and
   the page should make that arrangement visible. It doesn't present five new lessons.
2. **Working title: "Bonus 2: Whose Refund Is It?"** Heading `# Bonus 2: <title>`, with
   `checks/bonus2.cjs`.
3. **The currency hook stays, as a failed repair.**
   - **Give the default a competent origin:** the shop had only USD orders and kept the default
     when it introduced EUR. One line.
   - **Show the effect adapter.** The page says the shop's ledger recorded a dollar refund. It makes
     no claim about what a payment provider or the customer received.
   - **Dafna's fix 1** generates the description from the parser and binds the typed handler inside
     `invoke`. **Guy asks her to replay the original call: still dollars.** That's a retellable
     surprise.
   - **`io: "input"` earns one beat:** the two `required` lists, then back to the incident. Sending
     the output description would demand a field the parser accepts missing. Sending the input
     description describes the omission accurately and leaves the default in place. No schema dumps,
     and no suggestion that JSON Schema's `default` performs Zod's insertion. Cite
     [Zod's JSON Schema guide](https://zod.dev/json-schema#io).
   - Use `z.input<S>` for what may enter and `z.output<S>`/`z.infer<S>` for the handler's argument,
     only where the page needs the distinction.
4. **The Turn moves from the supplied fields to which source has authority over the action.**
   - Requiring currency only makes the caller supply one: a fixed call that supplies USD still
     passes. **Liron:** why does that field decide anything when the order record already knows?
   - Remove currency from the arguments and take it from the record.
   - Then run the already visible o-17 artifact: well formed, and someone else's. Show o-17's owner
     before the denial, so the reader can predict the check.
   - **Guy's question carries this half:** "You've described the arguments. Who's allowed to run
     it?" A class with the same encapsulation would also work. No FP-versus-OOP victory.
5. **The repair is a session-bound executor with a private effect,** not an exported brand.
   - Binding captures the authenticated customer id, not a mutable session object.
   - Invocation parses the input (order id and cents only), looks up the *current* order, compares
     the owner, checks the remaining refundable amount, and records the refund in the order's
     currency.
   - The effect and the order store are private: importing or reaching the effect is a compile error
     (TS2305/TS2339) if the page shows it.
   - Don't put a customer-bound tool in a registry shared across customers.
   - **Capturing a session isn't itself authorisation.** The fresh lookup and owner comparison are
     the check.
6. **The payoff:** replay o-17 under Alice's session (denied, zero effects) and under Bob's
   (succeeds), then o-12 under Alice (EUR). The same public schema gives different legitimate
   answers.
7. **The structured-reply beat is optional,** one short exchange at most. The fixed reply says it
   refunded the denied order, and the outcome comes from the executor's result. No third subplot.
8. **The single-source claim is scoped.** Generate the representable *input structure* from the
   parser. The policy is executed, not described. If the page mentions refinements, it must not say
   they can't authorise. A contextual one can; the schema just doesn't carry it.
9. **Plumbing stays plumbing.**
   - The effect is synchronous and in memory, and labelled so. No async handler, and no completion
     claims the code hasn't established.
   - The envelope `{ name, arguments }` is validated, the string decoded to `unknown`, then the
     selected tool's parser runs. The page shows that path briefly. The extra controls (invalid
     envelope, unknown name, async trap) live in the check.
   - If the page promises a remaining balance, it maintains one.
   - This is a policy demonstration, not a transaction, idempotency or payment proof, and the page
     doesn't claim more.
10. **The Verdict is local.** Once the session, ownership rule and authoritative currency are on the
    page, neither the wrong-customer call nor the USD default is a matter of taste. Whether the shop
    should allow automatic refunds at all is one Additional Take, with no new `ProposedRefund` /
    `ApprovedRefund` types. Say who approves under the local policy.
11. **Principle (Liron)** opens on a rule the reader can apply: a valid proposed call doesn't decide
    who may act, which stored facts are true, or whether an effect happened. The caller proposes an
    action; the program supplies the authority and verifies the conditions for doing it.
    - Generate the representable input description from the argument schema, and validate what
      actually arrives.
    - Bind execution to the authenticated context, check the policy against authoritative records,
      and build outcome fields from what actually ran.

    Avoid "so they can't disagree", "only what you don't know", "evidence the model can't forge",
    and anything implying that a parsed field establishes approval. No brands. A parable may belong
    in the conversation, but it doesn't replace the opening rule.
12. **The reader cases are Codex's four (§7):**
    - the accurate description with the wrong default;
    - the valid cancellation under someone else's session;
    - the confident `emailSent: true`;
    - the refinement with and without context.

    A reader who concludes that refinements can never authorise has mislearned the chapter.
13. **Cast:** Liron (Principle), Gilad (ticket, ledger, replays), Dafna (one definition), Guy (who
    may run it). Eden is dropped. Pronouns verified: all he except Dafna, she.
14. **Repetition boundaries:** Codex's table (§6) is adopted, including Ch22 (descriptions don't
    replace executing policy) and Ch23 (a promise wrapped in success isn't a completed refund).
15. **Checks:** Codex's requirements (§8). In particular:
    - hold the wire artifact fixed across the handwritten and generated descriptions;
    - assert the ledger, not just the returned sentence;
    - run two separately bound sessions;
    - removing the owner comparison must restore the bad effect;
    - zero effects on denial;
    - repeated refunds if a balance is promised;
    - drop the brand diagnostics.

**Fun guardrails:**
- **The scenes readers should retell:**
  - the euro customer's dollar ledger entry;
  - "still dollars" after the generation fix;
  - "Why does that field decide anything?";
  - o-17, valid and Bob's;
  - the same schema answering Alice and Bob differently.
- **Keep the registry small on the page.** Aim for ten fences or fewer. A reader should never feel
  they're reading an SDK tutorial.
- **The agent must feel present** without real-model claims: the shop's outbound description, a
  short customer conversation, the returned call, and the ledger.
- **No hype and no doom.** Length is 2,300–3,000 words.

**Not adopted:** nothing material. I'd keep "We told it…" as a candidate line only if a replay on
the page actually establishes it; otherwise Codex finds a better one.
