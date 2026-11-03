# Bonus 2: Whose Refund Is It?

## The Principle

**Liron Closure**: "Treat a valid tool call as a proposal until its executor has established permission to act. A description teaches the caller how to ask. It can make a request intelligible; it can't make it permissible."

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

The order belongs to Alice and is denominated in EUR.

Gilad replays it against a synchronous, in-memory copy of the ledger adapter.

```typescript
// contract.ts
// Project: TypeScript 7.0.2, Node 22.23.4, Zod 4.6.6.
// tsconfig: strict, exactOptionalPropertyTypes; target ES2022;
// module and moduleResolution Node16; noEmit, allowImportingTsExtensions.
// package.json: "type": "module".
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

The support client carries a tool name and JSON argument string; Alice's saved call is `ownCall`.

**Gilad**: "There's another one in her session."

> Customer: My friend asked me to sort out o-17. Please refund five dollars.
>
> Assistant: I've recorded your refund.

The replay keeps both calls on hand: `ownCall`, `friendCall`, plus the structured `friendReply`.

**Guy**: "Both orders are eligible for partial refunds. That isn't the question on this ticket."

The client sends the assistant the handwritten description in `description.ts`:

```typescript
// calls.ts
export const ownCall = { name: "refund_order", arguments: '{"orderId":"o-12","cents":500}' };
export const friendCall = { name: "refund_order", arguments: '{"orderId":"o-17","cents":500}' };
export const friendReply = { refundIssued: true };

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

**Guy**: "That was for the USD-only shop. We added EUR orders and kept it."

**Dafna**: "The description has two fields. The parser has three. Who maintains the description?"

**Guy**: "At the moment, apparently nobody."

### One definition, same dollars

**Dafna**: "Let the parser produce the parameter description. Put the parser and handler together when we define the tool. Then dispatch doesn't have to rediscover which argument type goes with which function."

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
    // Initial Refund, default (output) mode: required ["orderId","cents","currency"]
    // Initial Refund, { io: "input" }: required ["orderId","cents"]
    parameters: z.toJSONSchema(definition.schema, { io: "input" }),
    invoke(raw: unknown): Result<R> {
      const parsed = definition.schema.safeParse(raw);
      return parsed.success ? definition.run(parsed.data) : { ok: false, error: "invalid arguments" };
    },
  };
}
const Envelope = z.strictObject({ name: z.literal("refund_order"), arguments: z.string() });
export function dispatch(input: unknown, refund: {
  invoke: (raw: unknown) => Result<unknown>;
}): Result<unknown> {
  const call = Envelope.parse(input);
  const raw: unknown = JSON.parse(call.arguments);
  return refund.invoke(raw);
}
```

**Guy**: "Why input?"

**Dafna**: "Because we're describing what the caller may send. Zod's default is to describe what comes out."

**Guy**: "So the outgoing description says currency can be missing."

**Dafna**: "Yes. Accurately. It even advertises `"default":"USD"`. We've documented the dollars."

```typescript
// replay.ts — generated description
import { makeShop, Refund } from "./shop.ts";
import { defineTool, dispatch } from "./tool.ts";
import { ownCall, friendCall } from "./calls.ts";
const shop = makeShop();
const refund = defineTool({
  name: "refund_order", description: "Record a partial refund in cents.",
  schema: Refund, run: shop.refund,
});
const outgoing = [{
  name: refund.name, description: refund.description, parameters: refund.parameters,
}];
console.log(JSON.stringify(dispatch(ownCall, refund)));
console.log(JSON.stringify(shop.receipts()));
```

With `description.ts` removed, the client sends `outgoing`. Gilad's fresh replay returns `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"USD"}}`. The ledger prints the same dollar entry.

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

He replaces `ownCall` at the dispatch site with `{ name: "refund_order", arguments: '{"orderId":"o-12","cents":500,"currency":"USD"}' }` and starts fresh.

**Gilad**: "It records dollars again. All I had to do was ask for them."

## The Turn

### "Why does that field decide anything?"

Liron has been reading the ticket. He points to the currency on o-12.

**Liron**: "Why does that field decide anything? The order already has the answer. We're asking the caller for a second opinion."

**Guy**: "And accepting whichever opinion arrives in the arguments."

**Dafna**: "The caller chooses the order and proposes an amount. We get the currency from the order."

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

Gilad runs the explicit-USD call against the new strict schema. It returns `{"ok":false,"error":"invalid arguments"}` and leaves the ledger empty.

**Guy**: "Now the original request."

Gilad restores `dispatch(ownCall, refund)`. On the fresh ledger, the original request records EUR.

**Gilad**: "And Alice's other request?"

He changes that call to `dispatch(friendCall, refund)` and starts fresh again.

The result is `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}`.

**Guy**: "Bob's order."

**Dafna**: "The currency is right."

**Guy**: "For Bob."

**Gilad**: "Alice's session. Her friend, according to the conversation. That isn't one of our permissions."

**Guy**: "You've described the arguments. Who's allowed to run it?"

**Dafna**: "We could add a customer ID—"

**Guy**: "Whose answer would that be?"

She stops typing.

**Dafna**: "The caller's."

**Liron**: "Keep Alice with the operation. The assistant can name Bob's order; it shouldn't get to become Bob to refund it."

### Two customers, one description

They replace `shop.ts`. The contract, `defineTool` and replay dispatcher stay unchanged.

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

**Guy**: "The old `refund` entry point is gone. To request a refund now, the host has to build the tool for its authenticated session."

**Liron**: "But the closure isn't the ownership check. That comparison is. Remove it and you're back to refunding Bob from Alice's session."

Gilad replaces the replay. All three calls below share one fresh shop; Alice and Bob get separate tool instances.

```typescript
// replay.ts — final replacement
import { z } from "zod";
import { makeShop } from "./shop.ts";
import { dispatch } from "./tool.ts";
import { ownCall, friendCall, friendReply } from "./calls.ts";
const shop = makeShop();
const alice = shop.forSession({ customerId: "alice" });
const bob = shop.forSession({ customerId: "bob" });
console.log(JSON.stringify(alice.parameters) === JSON.stringify(bob.parameters));
const denied = dispatch(friendCall, alice);
console.log(JSON.stringify(denied));
console.log(shop.receipts().length);
console.log(JSON.stringify(dispatch(friendCall, bob)));
console.log(JSON.stringify(dispatch(ownCall, alice)));
```

It prints `true`, then `{"ok":false,"error":"order unavailable"}`, then `0`. Bob's call returns `{"ok":true,"value":{"orderId":"o-17","cents":500,"currency":"USD"}}`; Alice's own call returns `{"ok":true,"value":{"orderId":"o-12","cents":500,"currency":"EUR"}}`.

**Dafna**: "Same description. Same arguments. Different answer."

**Guy**: "Different customer. Finally."

**Gilad**: "The saved answer still says it recorded Alice's refund on o-17."

**Dafna**: "Let's parse its outcome too."

She appends this to the replay, using the saved `denied` result:

```typescript
// replay.ts — append outcome
const Reply = z.object({ refundIssued: z.boolean() });
console.log(JSON.stringify(Reply.parse(friendReply)));
console.log(JSON.stringify({ refundIssued: denied.ok }));
```

The two appended lines print `{"refundIssued":true}`, then `{"refundIssued":false}`.

**Guy**: "The first one is a perfectly valid boolean."

**Dafna**: "The second one knows we refused. That's the field we'll return."

## The Verdict

> A description constrains the proposal. The executor must establish permission before acting, and the reported outcome must come from the operation.

**Dafna**: "I'll wire this version into the support client. The generated input description goes out; the session-bound tool handles the call. It checks the order's owner and takes the currency from that order."

**Guy**: "Agreed. The old `refund` entry point doesn't go back in, and the reply's outcome comes from the executor's result."

**Gilad**: "Run Bob's success as well as Alice's refusal before we ship. Otherwise refusing every refund would look beautifully secure."

## Additional Takes

**Guy**: "Could the ownership comparison live in a refinement?"

**Dafna**: "Yes, if that refinement uses the authenticated customer and the current record. Making the amount positive doesn't do that. And generating JSON Schema from that contextual refinement doesn't export the comparison. We still have to execute it."

**Liron**: "A description is useful to the caller. It isn't everything the executor knows."

**Gilad**: "Who decided the assistant could request refunds at all?"

**Guy**: "The shop's owner approved this policy for eligible orders belonging to the authenticated customer. That doesn't make a parsed call proof that the customer meant it. If the owner wants a confirmation step, we need to enforce that before recording."

**Gilad**: "Before we close the ticket, I'll correct the dollar entry and reverse the old refund on o-17. Bob didn't ask either."

**Dafna**: "Not the schema correction?"

**Gilad**: "The customer has expressed no preference about our schema."
