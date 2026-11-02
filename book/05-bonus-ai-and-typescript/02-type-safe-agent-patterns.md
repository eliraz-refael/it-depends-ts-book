# Bonus 2: Whose Refund Is It?

## The Principle

**Liron Closure**: "A valid tool call is still a proposal. It doesn't establish who may act on an order, what currency that order uses, or whether a refund happened. Those answers have to come from the program that executes the call. Bind the executor to the authenticated customer, and check the proposed action against the current record before doing it. A customer ID in the arguments isn't authentication."

"Generate the input structure you advertise from the schema that parses what arrives. That saves you maintaining two descriptions of the fields; it doesn't put all your policy into JSON Schema. A runtime refinement can check ownership if it has the trusted session and record. A positive-number check can't. When you report an outcome, take it from the operation's result. Successfully parsing a boolean called `refundIssued` hasn't issued anything."

## The Debate

### A very affordable exchange rate

**Gilad Stacktrace**: "Five euros. The customer asked for five euros."

**Guy Singleton**: "And?"

**Gilad**: "Our refund ledger says five dollars."

**Dafna Functor**: "Did the assistant convert it?"

**Gilad**: "No. We did something worse. We didn't convert it."

He opens the support conversation for order o-12, in Alice's authenticated session. The shop's assistant has two messages in its saved transcript:

> Customer: Please refund five euros from o-12. The replacement arrived damaged.
>
> Assistant: I'll record that refund for you.

The order belongs to Alice and is denominated in EUR. The shop used to sell only in USD; its refund parser kept the USD default when EUR orders arrived.

For the replay, Gilad has a synchronous, in-memory copy of the ledger adapter. It records a refund and reduces the remaining refundable amount. Nothing here contacts a payment provider. These are already eligible orders; the shop permits their authenticated owners to request partial refunds up to that remaining amount.

```typescript
// contract.ts
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Receipt = { orderId: string; cents: number; currency: "USD" | "EUR" };
export type Order = {
  id: string; customerId: string; currency: "USD" | "EUR"; remaining: number;
};

// shop.ts — initial
import { z } from "zod";
import type { Order, Receipt, Result } from "./contract.ts";
export const Refund = z.object({
  orderId: z.string(), cents: z.number().int().positive(),
  currency: z.enum(["USD", "EUR"]).default("USD"),
});
export function makeShop() {
  const orders = new Map<string, Order>([
    ["o-12", { id: "o-12", customerId: "alice", currency: "EUR", remaining: 1000 }],
    ["o-17", { id: "o-17", customerId: "bob", currency: "USD", remaining: 1000 }],
  ]);
  const ledger: Receipt[] = [];
  function recordRefund(order: Order, cents: number, currency: Receipt["currency"]) {
    order.remaining -= cents;
    const receipt = { orderId: order.id, cents, currency };
    ledger.push(receipt);
    return receipt;
  }
  function refund(args: z.output<typeof Refund>): Result<Receipt> {
    const order = orders.get(args.orderId);
    if (!order) return { ok: false, error: "order unavailable" };
    if (args.cents > order.remaining) return { ok: false, error: "amount exceeds remaining" };
    return { ok: true, value: recordRefund(order, args.cents, args.currency) };
  }
  return { refund, receipts: () => ledger.map(receipt => ({ ...receipt })) };
}
```

The project uses the book's strict ES2022/Node16 profile, with `noEmit` and `allowImportingTsExtensions`; its package has `"type": "module"`. They compile with TypeScript 7.0.2 and run the `.ts` replay with Node 22.23.4. Zod is pinned to 4.6.2.

The client sends this handwritten description. Its own wire format returns a name and a JSON string of arguments. `ownCall` is the saved response to Alice; `friendCall` is another saved response from her session, after she said, "My friend asked me to sort out o-17." They keep both artifacts for the replay.

```typescript
// calls.ts
export const ownCall = { name: "refund_order", arguments: '{"orderId":"o-12","cents":500}' };
export const friendCall = { name: "refund_order", arguments: '{"orderId":"o-17","cents":500}' };

// description.ts
export const description = {
  name: "refund_order", description: "Record a partial refund in cents.",
  parameters: {
    type: "object", properties: { orderId: { type: "string" }, cents: { type: "integer" } },
    required: ["orderId", "cents"],
  },
};

// replay.ts — initial
import { makeShop, Refund } from "./shop.ts";
import { ownCall } from "./calls.ts";
const shop = makeShop();
const raw: unknown = JSON.parse(ownCall.arguments);
shop.refund(Refund.parse(raw));
console.log(JSON.stringify(shop.receipts()));
```

It prints `[{"orderId":"o-12","cents":500,"currency":"USD"}]`.

**Gilad**: "There's your conversion department. One default."

**Dafna**: "The description has two fields. The parser has three. Who maintains the description?"

**Guy**: "At the moment, apparently nobody."

### One definition, same dollars

**Dafna**: "Let the parser produce the parameter description. Put the parser and handler together when we define the tool. Then dispatch doesn't have to rediscover which argument type goes with which function."

She writes the small constructor and the dispatcher. The handler receives the parser's output, including any defaults. Each returned `invoke` accepts `unknown`; it retains the particular schema and handler inside.

```typescript
// tool.ts
import { z } from "zod";
import type { Result } from "./contract.ts";
export function defineTool<S extends z.ZodType, R>(definition: {
  name: string; description: string; schema: S;
  run: (args: z.output<S>) => Result<R>;
}) {
  return {
    name: definition.name, description: definition.description,
    parameters: z.toJSONSchema(definition.schema, { io: "input" }),
    invoke(raw: unknown): Result<R> {
      const parsed = definition.schema.safeParse(raw);
      return parsed.success ? definition.run(parsed.data) : { ok: false, error: "invalid arguments" };
    },
  };
}
const Envelope = z.strictObject({ name: z.string(), arguments: z.string() });
export function dispatch(input: unknown, tools: readonly {
  name: string; invoke: (raw: unknown) => Result<unknown>;
}[]): Result<unknown> {
  const envelope = Envelope.safeParse(input);
  if (!envelope.success) return { ok: false, error: "invalid envelope" };
  const tool = tools.find(tool => tool.name === envelope.data.name);
  if (!tool) return { ok: false, error: "unknown tool" };
  let raw: unknown;
  try { raw = JSON.parse(envelope.data.arguments); }
  catch { return { ok: false, error: "invalid JSON" }; }
  return tool.invoke(raw);
}
```

**Guy**: "Why input?"

**Dafna**: "Because we're describing what the caller may send. Zod's default is to describe what comes out."

For `Refund`, the default generation's `required` list is `["orderId","cents","currency"]`. With `io: "input"`, it's `["orderId","cents"]`. [Zod documents the distinction](https://zod.dev/json-schema#io): a default can make the output field required even though the input may omit it.

**Guy**: "So the outgoing description says currency can be missing."

**Dafna**: "Yes. Accurately."

The registry also contains the support agent's existing `refund_help` tool. Its handler takes a language and returns text, rather than a refund receipt. Dafna keeps that entry so both handlers have to fit the dispatcher.

```typescript
// help.ts
import { z } from "zod";
import { defineTool } from "./tool.ts";
export const help = defineTool({
  name: "refund_help", description: "Explain partial refunds.",
  schema: z.strictObject({ language: z.enum(["en", "fr"]) }),
  run: args => ({ ok: true, value: args.language === "fr" ? "Remboursement partiel" : "Partial refund" }),
});

// replay.ts — generated description
import { makeShop, Refund } from "./shop.ts";
import { defineTool, dispatch } from "./tool.ts";
import { help } from "./help.ts";
import { ownCall, friendCall } from "./calls.ts";
const shop = makeShop();
const refund = defineTool({
  name: "refund_order", description: "Record a partial refund in cents.",
  schema: Refund, run: shop.refund,
});
const tools = [refund, help];
const outgoing = tools.map(({ name, description, parameters }) => ({ name, description, parameters }));
console.log(JSON.stringify(dispatch(ownCall, tools)));
console.log(JSON.stringify(shop.receipts()));
```

They remove `description.ts`; the client now sends `outgoing`. Gilad starts a fresh replay. The result is `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"USD"}}`. The ledger prints the same dollar entry.

**Guy**: "Still dollars."

**Dafna**: "The descriptions agree now."

**Guy**: "Congratulations to the descriptions."

**Gilad**: "The original call didn't change. Our parser still supplies USD."

**Dafna**: "Then require currency. No default."

```typescript
// shop.ts — replace the currency property in Refund
currency: z.enum(["USD", "EUR"]),
```

The same replay now returns `{"ok":false,"error":"invalid arguments"}` and prints `[]` for the ledger.

**Gilad**: "We've stopped recording the wrong currency by refusing the original request. Now give it the wrong currency explicitly."

He replaces `ownCall` at the dispatch site with `{ name: "refund_order", arguments: '{"orderId":"o-12","cents":500,"currency":"USD"}' }` and starts fresh. The dollar receipt returns. Both supported currency names are legal; neither name proves which currency belongs to o-12.

### "Why does that field decide anything?"

**Liron**: "The waiter has asked the guest which currency the restaurant's till uses."

**Guy**: "We have an order record. We can skip the restaurant."

**Liron**: "Gladly. Why does that field decide anything?"

**Dafna**: "It doesn't need to. The caller chooses the order and proposes an amount. We get the currency from the order."

She replaces `Refund` and the inner `refund` function. The store and recording function stay as they were.

```typescript
// shop.ts — replace Refund
export const Refund = z.strictObject({
  orderId: z.string(), cents: z.number().int().positive(),
});
// shop.ts — replace the inner refund function
function refund(args: z.output<typeof Refund>): Result<Receipt> {
  const order = orders.get(args.orderId);
  if (!order) return { ok: false, error: "order unavailable" };
  if (args.cents > order.remaining) return { ok: false, error: "amount exceeds remaining" };
  return { ok: true, value: recordRefund(order, args.cents, order.currency) };
}
```

Trying to read `args.currency` in that handler now gives **TS2339**: `Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.`

Gilad restores `dispatch(ownCall, tools)`. On the fresh ledger, the original request records EUR. Then he changes that one call to `dispatch(friendCall, tools)` and starts fresh again.

The result is `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}`.

**Guy**: "Bob's order."

**Dafna**: "The currency is right."

**Guy**: "For Bob."

**Gilad**: "Alice's session. Her friend, according to the conversation. That isn't one of our permissions."

**Guy**: "You've described the arguments. Who's allowed to run it?"

**Dafna**: "We could add a customer ID—"

**Guy**: "Whose answer would that be?"

She stops typing.

**Dafna**: "The caller's. We already have the authenticated customer."

**Liron**: "Knowing which order it names doesn't tell us who may refund it."

**Guy**: "Taking currency from the record hasn't checked ownership. We just demonstrated that."

### Two customers, one description

Guy wants the refund operation behind the session-bound tool. Dafna agrees. They replace `shop.ts`; `contract.ts`, the constructor, dispatcher and help tool stay unchanged. The host builds tools for the authenticated session, not from anything in the assistant's arguments.

```typescript
// shop.ts — final replacement
import { z } from "zod";
import type { Order, Receipt } from "./contract.ts";
import { defineTool } from "./tool.ts";
export const Refund = z.strictObject({
  orderId: z.string(), cents: z.number().int().positive(),
});
export function makeShop() {
  const orders = new Map<string, Order>([
    ["o-12", { id: "o-12", customerId: "alice", currency: "EUR", remaining: 1000 }],
    ["o-17", { id: "o-17", customerId: "bob", currency: "USD", remaining: 1000 }],
  ]);
  const ledger: Receipt[] = [];
  function recordRefund(order: Order, cents: number): Receipt {
    order.remaining -= cents;
    const receipt = { orderId: order.id, cents, currency: order.currency };
    ledger.push(receipt);
    return receipt;
  }
  function forSession(session: { customerId: string }) {
    const customerId = session.customerId;
    return defineTool({
      name: "refund_order", description: "Record a partial refund in cents.",
      schema: Refund,
      run: args => {
        const order = orders.get(args.orderId);
        if (!order || order.customerId !== customerId) return { ok: false, error: "order unavailable" };
        if (args.cents > order.remaining) return { ok: false, error: "amount exceeds remaining" };
        return { ok: true, value: recordRefund(order, args.cents) };
      },
    });
  }
  return { forSession, receipts: () => ledger.map(receipt => ({ ...receipt })) };
}
```

**Guy**: "Now nobody importing this module can call `recordRefund` directly. And the tool doesn't accept a customer ID."

**Liron**: "But the closure isn't the ownership check. That comparison is. Remove it and you're back to refunding Bob from Alice's session."

**Gilad**: "I will remove it in the check. Briefly."

The record is looked up on every invocation. The tool captures the customer ID itself; changing the session object's property later won't retarget it. The host must still choose the right authenticated session when constructing the tool. It cannot reuse Alice's tool in Bob's registry and expect an argument parser to notice.

Gilad replaces the replay. All three calls below share one fresh shop; Alice and Bob get separate tool instances.

```typescript
// replay.ts — final replacement
import { makeShop } from "./shop.ts";
import { dispatch } from "./tool.ts";
import { help } from "./help.ts";
import { ownCall, friendCall } from "./calls.ts";
const shop = makeShop();
const alice = shop.forSession({ customerId: "alice" });
const bob = shop.forSession({ customerId: "bob" });
console.log(JSON.stringify(alice.parameters) === JSON.stringify(bob.parameters));
console.log(JSON.stringify(dispatch(friendCall, [alice, help])));
console.log(shop.receipts().length);
console.log(JSON.stringify(dispatch(friendCall, [bob, help])));
console.log(JSON.stringify(dispatch(ownCall, [alice, help])));
```

It prints `true`, then `{"ok":false,"error":"order unavailable"}`, then `0`. Bob's call returns `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}`; Alice's own call returns `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"EUR"}}`.

**Dafna**: "Same description. Same arguments. Different answer."

**Guy**: "Different customer. Finally."

**Gilad**: "Fresh shop. Alice asks twice for six hundred?"

**Dafna**: "First call records six hundred. Four hundred remain. Second call is refused."

**Guy**: "Good. The original amount isn't a fresh allowance for every conversation."

## The Verdict

Gilad keeps both successful owners in the check as well as the refused cross-customer call. Otherwise an implementation that refuses every refund would look beautifully secure. The two six-hundred-cent requests get their own fresh shop.

**Dafna**: "I'm keeping the generated description. It removed a handwritten structure, even though it didn't repair the refund."

**Guy**: "And I'm keeping the operation private. The host gets a session-bound tool and a way to inspect receipts. The assistant gets its name, description and parameters. It doesn't get to choose the session."

**Liron**: "Or the order's currency. A proposed amount is something we can consider. Our own stored currency isn't a vote."

**Gilad**: "There's still the answer in the transcript."

The saved reply after the foreign-order request says, "I've recorded your refund." **Dafna**: "If we expose `refundIssued`, we'll fill it from the executor's result, not parse that sentence into a boolean." **Guy**: "Recorded here. Don't turn it into a claim about a payment arriving."

## Additional Takes

**Guy**: "Could the ownership comparison live in a refinement?"

**Dafna**: "Yes, if that refinement uses the authenticated customer and the current record. Making the amount positive doesn't do that. And generating JSON Schema from that contextual refinement doesn't export the comparison. We still have to execute it."

**Liron**: "A description is useful to the caller. It isn't everything the executor knows."

**Gilad**: "Who decided the assistant could request refunds at all?"

**Guy**: "The shop's owner approved this policy for eligible orders belonging to the authenticated customer. That doesn't make a parsed call proof that the customer meant it. If the owner wants a confirmation step, we need to enforce that before recording. Another type name won't approve it."

**Gilad**: "Fine. Close the dollar ticket with the ledger correction."

**Dafna**: "Not the schema correction?"

**Gilad**: "The customer has expressed no preference about our schema."
