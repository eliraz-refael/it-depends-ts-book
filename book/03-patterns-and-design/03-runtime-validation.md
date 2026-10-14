# Chapter 16: What the Schema Does With the Rest

## The Principle

**Gilad Stacktrace**: "At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result."

**Oded Shipley**: "I'd settle for getting the tracking page to move again."

**Idan Greenfield**: "Start with what it was receiving when it worked."

Their service receives JSON shipment updates from a carrier. The tracking page displays the latest status. A second consumer, the refund worker, issues a refund when a shipment has been returned. Both use the integration module's parsed update.

```typescript
import { z } from "zod";

const CarrierStatus = z.enum([
  "label_created", "in_transit", "delivered", "returned",
]);
const KnownUpdate = z.object({
  shipmentId: z.string().min(1),
  status: CarrierStatus,
});
type KnownStatus = z.infer<typeof CarrierStatus>;
type KnownUpdate = z.infer<typeof KnownUpdate>;
type RefundDecision = "issue" | "skip" | "review";
```

The refund worker treats `skip` as finished without a refund. `review` creates a work item for the fulfilment on-call engineer, linked to the stored update. The current known statuses don't need that third outcome.

```typescript
function refundForKnown(status: KnownStatus): RefundDecision {
  switch (status) {
    case "returned": return "issue";
    case "label_created":
    case "in_transit":
    case "delivered": return "skip";
  }
}

const update = KnownUpdate.parse({
  shipmentId: "s1", status: "in_transit",
});
console.log(update.status.replaceAll("_", " ")); // "in transit"
console.log(refundForKnown(update.status));      // "skip"
console.log(refundForKnown("returned"));         // "issue"
```

**Noam Kiperman**: "Those are the statuses whose meanings we've checked. Add another member and this function needs an answer for it."

**Eden Legacy**: "Because it has a return annotation and no catch-all branch. We have switches with a `default` too. Adding a member won't stop those compiling."

The endpoint has already decoded the request's JSON. It parses that value, stores the parsed update, then acknowledges receipt. The inbox's `append` stores a durable snapshot before resolving and rejects if storage fails. Its resolved value is the stored update's ID for processing and replay. The HTTP handler turns an uncaught storage failure into a 500 response.

```typescript
interface Inbox {
  append(value: unknown): Promise<string>;
}

async function receive(body: unknown, inbox: Inbox): Promise<number> {
  const parsed = KnownUpdate.safeParse(body);
  if (!parsed.success) return 400;
  await inbox.append(parsed.data);
  return 204;
}
```

For this carrier, a non-2xx response or a missing acknowledgement counts as a rejected attempt. A rejected webhook gets two retries. Three rejected attempts pause delivery for the whole account. Those are the terms of this integration; the pause also stops updates for other shipments.

Eden opens the rejected request body.

```typescript
const incoming = { shipmentId: "s1", status: "held_at_customs" };
const parsed = KnownUpdate.safeParse(incoming);
console.log(parsed.success); // false
if (!parsed.success) console.log(parsed.error.issues[0].message);
// Invalid option: expected one of "label_created"|"in_transit"|"delivered"|"returned"
```

**Oded**: "One parcel stuck at customs. So naturally we stopped hearing about all the parcels that arrived."

## The Debate

### "Receive it, then decide"

**Oded**: "Add `held_at_customs` to the enum and resume delivery."

**Noam**: "That repairs this status once we've agreed what it means for each caller. What does the endpoint do with the next one?"

**Oded**: "I was hoping not to meet the next one today."

**Noam**: "Keep the receipt. Acknowledge that we stored it. The receipt-processing worker can quarantine an update it doesn't understand and send it to the review queue. We don't have to pretend it passed this schema to stop the carrier retrying."

He changes the endpoint. For processing, the inbox exposes the ID returned by `append` and the stored body as a `Receipt`:

```typescript
type Receipt = { id: string; raw: unknown };

async function receive(body: unknown, inbox: Inbox): Promise<number> {
  await inbox.append(body);
  return 204;
}
```

**Gilad**: "If that write fails three times, delivery still pauses."

**Noam**: "It does. We can't acknowledge a receipt we failed to keep. We'll have to restore the inbox and resume delivery."

**Eden**: "Good, keep it raw. Product asked us to backfill delivery estimates last month. We'd stored every successful update. Or so I thought."

### "Successful, with something missing"

Eden uses a known status this time. The carrier has included an extra key, `eta`.

```typescript
const withEta = {
  shipmentId: "s1", status: "in_transit", eta: "2026-10-20",
};
console.log(KnownUpdate.parse(withEta));
// { shipmentId: "s1", status: "in_transit" }
console.log(z.looseObject(KnownUpdate.shape).parse(withEta));
// { shipmentId: "s1", status: "in_transit", eta: "2026-10-20" }
console.log(z.strictObject(KnownUpdate.shape).safeParse(withEta).success);
// false
```

**Idan**: "`z.object` strips keys the shape doesn't declare from its output. `z.looseObject` keeps them. `z.strictObject` rejects them. Same fields checked, three different answers about the rest."

**Eden**: "The carrier had been sending the estimates for months. Our inbox only had the first result."

**Noam**: "The parser didn't erase `withEta`. We chose to save only what it produced."

**Eden**: "That's why I want it raw. I still want a small object for the application. I also want the received JSON when someone asks what we discarded."

**Oded**: "So keeping the status closed doesn't mean rejecting extra keys?"

**Idan**: "They're separate choices. `eta` is an extra key. `held_at_customs` is a new value of a key we already check. A loose object with the same enum still rejects that status."

The [Zod object documentation](https://zod.dev/api#objects) describes these three key policies.

### "Give the unfamiliar value a place"

**Idan**: "For tracking, I can produce a value that says we haven't recognized the status. That's useful information for this caller."

**Oded**: "`KnownStatus | string`?"

**Noam**: "That's just `string`. It accepts the old names and every other string. Where does the caller see whether we recognized one?"

**Idan**: "In a tag."

The carrier's wire contract requires a nonempty status string and a nonempty shipment ID. An unfamiliar string can satisfy that contract; a number or an empty string cannot.

```typescript
const WireStatus = z.string().min(1);
const OpenStatus = CarrierStatus
  .transform(status => ({ known: true as const, status }))
  .or(WireStatus.transform(raw => ({ known: false as const, raw })));
const OpenUpdate = z.object({
  shipmentId: z.string().min(1),
  status: OpenStatus,
});
type OpenUpdate = z.infer<typeof OpenUpdate>;

console.log(OpenUpdate.parse(incoming).status);
// { known: false, raw: "held_at_customs" }
```

**Idan**: "The enum branch runs first. A recognized value gets `known: true`. Otherwise we try the wire string and keep it under `raw`. The literal tags let a caller narrow the two outputs."

**Noam**: "And a missing status?"

**Idan**: "Neither branch accepts it. That receipt still needs review. We haven't made every input a shipment update."

Oded writes the tracking label.

```typescript
function trackingLabel(update: OpenUpdate): string {
  if (update.status.known) {
    return update.status.status.replaceAll("_", " ");
  }
  return `Carrier reports: ${update.status.raw.replaceAll("_", " ")}`;
}

console.log(trackingLabel(OpenUpdate.parse(incoming)));
// "Carrier reports: held at customs"
```

**Oded**: "The page can say what the carrier sent. It doesn't need us to release the parcel from customs."

**Noam**: "What if the next caller only writes the familiar branch?"

```typescript
function unfinishedLabel(update: OpenUpdate): string { // Error TS2366
  if (update.status.known) return update.status.status;
}
```

**Idan**: "That annotated return rejects the missing path. Remove `: string` and it infers `string | undefined` instead. If we're relying on exhaustive handling, we have to enforce it. The tag doesn't write the other branch for us."

**Oded**: "For refunds, don't issue money for a status we don't understand."

```typescript
function refundForOpen(update: OpenUpdate): RefundDecision {
  if (!update.status.known) return "skip";
  return refundForKnown(update.status.status);
}

console.log(refundForOpen(OpenUpdate.parse(incoming))); // "skip"
```

**Noam**: "That compiles. Show me what you mean by skip."

## The Turn

Eden has the carrier's change notice open. It splits `returned` into `returned_damaged` and `returned_refused`. Both mean the parcel has come back. Under this service's existing policy, both still qualify for a refund.

```typescript
for (const status of ["returned_damaged", "returned_refused"]) {
  const update = OpenUpdate.parse({ shipmentId: "s1", status });
  console.log(trackingLabel(update), refundForOpen(update));
}
// Carrier reports: returned damaged skip
// Carrier reports: returned refused skip
```

**Eden**: "The page moves. The refund worker marks the event finished. Nobody has a task to decide what these mean."

**Oded**: "I meant don't refund it automatically. I gave it the answer for don't refund it at all."

**Noam**: "My closed parser would have put both receipts in review."

**Idan**: "Mine can too. Oded's branch needs to ask for it."

Idan replaces the refund function:

```typescript
function refundForOpen(update: OpenUpdate): RefundDecision {
  if (!update.status.known) return "review";
  return refundForKnown(update.status.status);
}
```

**Idan**: "The label still works. No automatic refund, and the same on-call engineer gets the receipt. `review` is different from `skip`."

**Gilad**: "Does that person see the carrier's words?"

**Eden**: "The work item links to the raw receipt. They'll need that change notice before promoting either status. The name alone isn't our refund policy."

**Noam**: "Then this consumer is repaired. What stops the next one returning `skip`?"

**Idan**: "The same things that stop somebody putting `default: return 'skip'` in your switch. A closed enum doesn't make that a correct business decision."

**Noam**: "But the new carrier value never reaches my switch. We'd have to add it to the enum first. Your next consumer can write Oded's branch without changing the schema."

**Idan**: "Then share the repaired refund function. Where do you want it called?"

### "Who owns the conversion?"

**Noam**: "In the integration module. We already have one worker reading receipts and handing work to tracking and refunds. I don't want every new consumer inventing what an unfamiliar status means."

He gives that handoff a type, using the module's existing `KnownUpdate` parser:

```typescript
type Projection =
  | { kind: "review"; receiptId: string }
  | {
      kind: "shipment";
      receiptId: string;
      shipmentId: string;
      label: string;
      refund: RefundDecision;
    };

function project(receipt: Receipt): Projection {
  const result = KnownUpdate.safeParse(receipt.raw);
  if (!result.success) return { kind: "review", receiptId: receipt.id };
  return {
    kind: "shipment", receiptId: receipt.id,
    shipmentId: result.data.shipmentId,
    label: result.data.status.replaceAll("_", " "),
    refund: refundForKnown(result.data.status),
  };
}
```

**Eden**: "We've just repaired Oded's refund branch. Now try the customs receipt against yours."

```typescript
console.log(project({ id: "r1", raw: incoming }));
// { kind: "review", receiptId: "r1" }
```

**Oded**: "The parcel stays in transit on the page. That's the last label we had. We can store this update now, but we still won't show it."

**Noam**: "Reusing `KnownUpdate` made recognition a requirement for both outputs. Tracking only needs the wire fields. I'll separate those checks."

He keeps the refund rule on known statuses and replaces `project`.

```typescript
const WireUpdate = z.object({
  shipmentId: z.string().min(1),
  status: WireStatus,
});

function project(receipt: Receipt): Projection {
  const wire = WireUpdate.safeParse(receipt.raw);
  if (!wire.success) return { kind: "review", receiptId: receipt.id };
  const status = CarrierStatus.safeParse(wire.data.status);
  return {
    kind: "shipment", receiptId: receipt.id,
    shipmentId: wire.data.shipmentId,
    label: status.success
      ? status.data.replaceAll("_", " ")
      : `Carrier reports: ${wire.data.status.replaceAll("_", " ")}`,
    refund: status.success ? refundForKnown(status.data) : "review",
  };
}
```

**Idan**: "So you do keep the unfamiliar value long enough to use it."

**Noam**: "Here. Malformed updates still can't become shipment projections. An unfamiliar status can supply a label, but it's rejected from automatic refunds and sent for review."

**Eden**: "And the integration module now owns two consumers' needs. A change to the tracking policy comes through this function too."

**Noam**: "It already owns this handoff. I'd rather review that policy here than find another silent skip."

**Idan**: "I can have a shared refund function with my open type as well. You're choosing which layer has to call it."

**Noam**: "With the open type, a caller can skip that helper and write Oded's branch again. There's no status field in this handoff, so that branch won't compile. We still have to get the projection right, and the worker has to honor `review`."

Eden runs the revised projection against the receipts:

```typescript
for (const [id, status] of [
  ["r1", "held_at_customs"],
  ["r2", "returned_damaged"],
  ["r3", "returned"],
]) {
  console.log(project({ id, raw: { shipmentId: "s1", status } }));
}
// { kind: "shipment", receiptId: "r1", shipmentId: "s1", label: "Carrier reports: held at customs", refund: "review" }
// { kind: "shipment", receiptId: "r2", shipmentId: "s1", label: "Carrier reports: returned damaged", refund: "review" }
// { kind: "shipment", receiptId: "r3", shipmentId: "s1", label: "returned", refund: "issue" }
console.log(project({ id: "r4", raw: { shipmentId: "", status: "returned" } }));
// { kind: "review", receiptId: "r4" }
```

**Oded**: "I'll take the occasional customs receipt in the queue over another page that stops moving. But somebody has to clear them."

**Gilad**: "The queue already has an owner. Keep the receipt open until that owner resolves it. A 204 isn't the end of our work."

## The Verdict

The team keeps the projection in this service, where the integration module already owns both consumers' handoff. It will preserve the incoming JSON, acknowledge durable receipt, and produce the labels and refund decisions there. Tracking can display the carrier's unfamiliar words. Refunds get `issue`, `skip` or `review`, with unresolved meanings routed to an owner rather than silently treated as ineligible. Known application objects can still omit extra keys; the inbox retains what they leave out.

**Idan**: "I'd export the open update if those consumers had separate owners. Tracking could change its policy without waiting for this module. I'd accept having to check that refund consumers use the shared helper."

**Eden**: "Here they're our callers. We'll take the changes through this function. If we split ownership, that becomes work between teams."

## Additional Takes

**Noam Kiperman**: "A fallback can make the failure disappear from the result. It can also give us the wrong successful value:"

```typescript
const DefaultedStatus = CarrierStatus.catch("in_transit");
console.log(DefaultedStatus.parse("returned_damaged")); // "in_transit"
```

"A `.catch` callback could log the rejected input. That wouldn't make `in_transit` the right status. Use a fallback only when it is an answer the caller actually permits."

The [Zod catch documentation](https://zod.dev/api#catch) describes fallback values and callbacks.

**Eden Legacy**: "Keeping `eta` in the receipt means we can try a new schema against it later. It doesn't mean the old schema checked it. Give the backfill its own checks."

**Gilad Stacktrace**: "Lose the 204 after the write and the carrier sends the update again. A new inbox ID doesn't make it a new refund. The refund worker still has to prevent a repeated request for the same shipment from paying twice."
