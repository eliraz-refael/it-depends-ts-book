# Chapter 26: It Can't Be Green

## The Principle

**Sahar Firstclass**: "A usage test checks whether a particular call or operation is accepted or rejected. An exact-result test compares an inferred type with a stated expected type. Before you trust either, break the claim it names and run the command you trust. See the test fail, undo the change, and see it pass. Do that when you add a test, change it, or move it. An error you planted anywhere in the file can show that the compiler checks the file; changing the contract shows whether the test protects that contract. Those are different questions."

"For a forbidden call, construct a valid value of the type you mean to reject outside the suppression, then put only the forbidden operation under `@ts-expect-error`. That directive wants an error; it doesn't check your explanation. A positive assignment alone also accepts `any`. Test a forbidden operation on the inferred result, or compare the part of its type you mean to promise. Exact comparisons can demand distinctions your callers don't need, so name the promise before choosing the assertion. Keep compile-only calls out of the runtime runner. Test actual values and effects by running them: a type test can check a function's promise without proving that its body keeps it."

## The Debate

**Noam Kiperman**: "It can't be green."

**Oded Shipley**: "I can refresh it, but I don't think that'll help."

"You changed `ship` to accept `Order`. Draft is an Order. I wrote a test that says you can't ship a draft."

"And it passed."

"That's the problem."

They're reviewing pre-order support for a fictional shop. Nothing has shipped. Their small review repository uses an in-memory shipping recorder: adding an id to `shipped` calls no courier. Before Oded's change, the relevant source was:

```typescript
// src/orders.ts — before the PR
export type Draft = { id: string; status: "draft"; currency: string };
export type Paid = {
  id: string; status: "paid"; paidAt: string; currency: string;
};
export type Order = Draft | Paid;
export const shipped: string[] = [];
export function ship(order: Paid): void {
  shipped.push(order.id);
}
```

Noam opens the tests.

```typescript
// test/ship.test.ts — before the PR
import { test } from "node:test";
import assert from "node:assert/strict";
import { ship, shipped, type Paid, type Draft } from "../src/orders.ts";

const paid: Paid = {
  id: "o1", status: "paid", paidAt: "2026-03-01", currency: "USD",
};
test("ships a paid order", () => {
  shipped.length = 0;
  ship(paid);
  assert.deepEqual(shipped, ["o1"]);
});
test("can't ship a draft", () => {
  // @ts-expect-error: can't ship a draft
  ship({ id: "o2", status: "draft" });
});
```

The root package has `"type": "module"`. The type-check command is `tsc -p tsconfig.json`; the runtime command is `node --test`. They're using TypeScript 7.0.2 and Node 22.23.4.

**tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "Node16",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "types": ["node"]
  },
  "include": ["src", "test/**/*.test.ts"]
}
```

Oded's PR adds a new order variant and widens the shipping parameter:

```typescript
// src/orders.ts — add PreOrder; replace Order and ship
export type PreOrder = {
  id: string; status: "preorder"; currency: string;
};
export type Order = Draft | Paid | PreOrder;
export function ship(order: Order): void {
  shipped.push(order.id);
}
```

**Oded**: "I needed paid orders and pre-orders. I used the union we already had. Yes, that includes drafts. I read the green check as evidence that I'd missed some other restriction."

**Eden Legacy**: "Delete the comment."

**Noam** deletes the directive above the draft call. The compiler reports TS2345, including: `Property 'currency' is missing in type '{ id: string; status: "draft"; }' but required in type 'Draft'.`

**Oded**: "It can't ship that draft."

**Noam**: "It can't accept that object. It's missing a field."

**Eden**: "Now put the old signature back, with the comment still gone."

With `ship(order: Paid)`, the inline call reports TS2322: `Type '"draft"' is not assignable to type '"paid"'.`

**Noam**: "So it was checking status before the PR."

**Eden**: "And currency after it. The description didn't change because nobody asked the compiler to check the description."

Noam restores the directive and checks the history. Currency became required in March. When he wrote the test, that inline object had every Draft field. He temporarily restores that earlier version and widens `ship` there: TS2578, `Unused '@ts-expect-error' directive.` The test caught the change then.

**Noam**: "I did see it fail."

**Eden**: "Before we added currency. The fixture went stale, and the comment hid that too. This PR is where the missing field stops us noticing the bad signature."

**Oded**: "I have accidentally passed two different tests with one comment."

### "Give it a draft"

They return to the current PR, with currency required and the overly broad parameter. Noam replaces the draft test:

```typescript
// test/ship.test.ts — replace the draft test
const draft: Draft = { id: "o2", status: "draft", currency: "USD" };
test("can't ship a draft", () => {
  // @ts-expect-error: can't ship a draft
  ship(draft);
});
```

Now the check reports TS2578. Noam turns the screen towards Oded.

**Noam**: "There."

**Oded**: "I have rarely been congratulated for breaking a build this enthusiastically."

**Eden**: "The fixture has its own check now. Add another required Draft field, and its declaration fails outside the directive."

Noam tries the old Paid-only parameter too. The repaired test passes. With its directive temporarily removed, this version reports TS2741: `Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'.`

**Noam**: "Missing paidAt this time. Still a valid Draft being refused."

**Oded**: "But Paid-only doesn't do my feature. Let me add the call we actually want."

```typescript
// src/orders.ts — replace ship
export function ship(order: Paid | PreOrder): void {
  shipped.push(order.id);
}

// test/ship.test.ts — also import PreOrder, then add
const preorder: PreOrder = { id: "o3", status: "preorder", currency: "USD" };
test("ships a pre-order", () => {
  shipped.length = 0;
  ship(preorder);
  assert.deepEqual(shipped, ["o3"]);
});
```

Paid and pre-order calls compile. Draft is rejected. Both permitted shipments produce the expected ids. Removing PreOrder from the parameter makes the new positive call fail; putting it back restores green.

**Oded**: "Now the tests object if I ship too much or too little. That seems fair."

### "What are we promising?"

**Guy Singleton**: "We also have functions whose result types matter to callers. We shouldn't reduce every contract to whether one call compiles."

He opens the admin paid-order card. It uses `orderRow`, the helper that builds its row. The card requires a paid row; passing any other status would put the wrong label above the order.

```typescript
// src/order-row.ts
import type { Order } from "./orders.ts";
export function orderRow<S extends Order["status"]>(id: string, status: S) {
  return Object.assign({ id }, { status });
}

// src/admin.ts
import { orderRow } from "./order-row.ts";
function renderPaid(row: { id: string; status: "paid" }): string {
  return `Paid order ${row.id}`;
}
export function paidCard(id: string): string {
  return renderPaid(orderRow(id, "paid"));
}
```

**Guy**: "A paid input must keep the paid status in the result. If the helper widens that to all order statuses, the card can't use it."

**Noam** adds a test to the existing file:

```typescript
// test/ship.test.ts — import orderRow, then add
const row = orderRow("o1", "paid");
const expected: { id: string; status: "paid" } = row;
```

**Sahar**: "What if the return becomes `any`?"

Noam adds `: any` to the helper's return. The assignment and the admin caller both compile.

**Noam**: "Then I want a comparison that doesn't accept that."

```typescript
// test-support/types.ts
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;
export type Expect<T extends true> = T;

// test/ship.test.ts — import Equal and Expect as types, then add
type Row = Expect<Equal<typeof row, { id: string } & { status: "paid" }>>;
```

This comparison distinguishes `any` from the expected type; `Expect` requires its answer to be true. With the `any` return it reports TS2344: `Type 'false' does not satisfy the constraint 'true'.` Noam removes the return annotation, restoring the inferred intersection. The assertion passes.

**Noam**: "The assignment missed it. Exact comparison caught it."

**Sahar**: "An assignment is one usage test. Try a use that should be forbidden."

He temporarily removes the Row assertion and adds:

```typescript
// test/ship.test.ts — add after row
// @ts-expect-error: a paid row isn't a draft row
const wrong: "draft" = row.status;
```

The ordinary helper passes. Noam repeats the `any` mutation. Now the directive is unused: TS2578.

**Noam**: "All right. That catches it too."

**Guy**: "Keep the comparison for now. It tells me the result I promised without making me read a deliberately wrong assignment."

Noam restores the helper and the Row assertion. Sahar points at `Object.assign`.

**Sahar**: "Why are we assembling two objects to get two fields?"

**Guy**: "There used to be another fragment. We removed it when the card stopped displaying the customer's name."

**Sahar**: "Then finish removing it."

```typescript
// src/order-row.ts — replace the return statement
return { id, status };
```

The Row assertion fails with TS2344. The admin card still compiles and still returns `Paid order o1`. The card reads the id; the tests read the status. Both representations allow those reads and assignment to `{ id: string; status: "paid" }`.

**Oded**: "I let drafts ship and got green. He removed an ampersand and got red."

**Guy**: "The comparison is stricter than the callers."

**Sahar**: "You promised the status would stay paid. Did you promise it would arrive attached to an intersection?"

**Guy**: "No. Test the status. Keep the caller check for the fields it consumes."

```typescript
// test/ship.test.ts — replace the Row assertion
type Status = Expect<Equal<typeof row.status, "paid">>;
```

That passes before and after flattening, and fails if the inferred status becomes `any` or widens. Sahar keeps it.

**Sahar**: "That one says what you meant. Delete my wrong assignment now; we don't need both versions of the same promise."

**Noam**: "And none of these tell us what the body returns. We already had a perfectly typed array that was a string in the conditional-types argument. An annotated `User[]` function returning `JSON.parse(raw)` can pass an exact return-type test too."

**Guy**: "Keep the runtime assertion for the card. The type promise and its implementation can fail separately."

### "It shipped"

Oded runs the tests again, then reads the draft test's callback.

**Oded**: "There's no runtime assertion in this one."

**Noam**: "It's a type test."

**Oded**: "It's also calling `ship`."

Inside that callback, he clears `shipped` immediately before `ship(draft)` and logs it immediately afterwards. Node prints `shipped: [ 'o2' ]`. The test called “can't ship a draft” passes.

**Noam** reads the output twice.

**Oded**: "No courier. Just the fake's array. But our test of the forbidden call is making the forbidden call."

Node strips the types; it doesn't check them. The directive doesn't prevent execution either. That's the behavior described in [Node's TypeScript documentation](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping).

**Oded**: "I'll take the compile-only bits out of the runtime file."

He first puts them in `test/ship.types.ts`. Plain `node --test` still executes that file and records the draft.

**Eden**: "The test directory gets discovered too. The suffix isn't an instruction to leave it alone. Put these under `type-tests`, and make the runtime command explicit."

Oded removes the temporary logging and uses `node --test test/ship.test.ts`. That file keeps the paid and pre-order runtime tests and adds a card assertion:

```typescript
// test/ship.test.ts — also import paidCard from ../src/admin.ts, then add
test("renders the paid card", () => {
  assert.equal(paidCard("o1"), "Paid order o1");
});
```

The draft callback and the row checks leave the runtime file. Their imports go with them where needed. The new compile-only file is:

```typescript
// type-tests/ship.types.ts
import { ship, type Draft } from "../src/orders.ts";
import { orderRow } from "../src/order-row.ts";
import type { Equal, Expect } from "../test-support/types.ts";

const draft: Draft = { id: "o2", status: "draft", currency: "USD" };
// @ts-expect-error: can't ship a draft
ship(draft);
const row = orderRow("o1", "paid");
const expected: { id: string; status: "paid" } = row;
type Status = Expect<Equal<typeof row.status, "paid">>;
```

## The Turn

**Noam**: "New location. Show me it failing."

He adds an assertion that is plainly false:

```typescript
// type-tests/ship.types.ts — temporary check
type DeliberatelyWrong = Expect<Equal<1, 2>>;
```

`tsc -p tsconfig.json` passes.

**Oded**: "I suppose refreshing it still won't help."

**Noam**: "Don't."

Eden runs `tsc -p tsconfig.json --listFilesOnly`. It lists the runtime test. It doesn't list `type-tests/ship.types.ts`.

**Eden**: "We taught the runner to leave it alone. We haven't told the compiler where we put it."

He opens the original include: `"include": ["src", "test/**/*.test.ts"]`. No included file imports the new file either. He replaces that field:

**tsconfig.json — replace include**

```json
{
  "include": ["src", "test/**/*.test.ts", "type-tests/**/*.ts"]
}
```

The file list now contains both test files. The deliberately false assertion gives TS2344. Noam deletes it, and the check passes.

**Noam**: "Now widen `ship` again."

**Oded**: "We just fixed that."

**Noam**: "We just moved its test."

Oded temporarily changes the parameter to Order. TS2578 points at the draft directive in the new file. He restores `Paid | PreOrder`. Green.

**Eden**: "The false assertion told us the file was being checked. Widening ship told us the test still caught drafts."

**Sahar**: "And running this file wouldn't answer either question."

They demonstrate that too: with the false assertion temporarily back, `node --test type-tests/ship.types.ts` passes. Node executes the file after erasing the assertion. They remove it again and return to the explicit runtime command.

## The Verdict

**Guy**: "For orderRow, keep the paid-status assertion and the admin caller. We aren't promising an intersection."

**Noam**: "For ship: paid accepted, pre-order accepted, valid Draft refused. I'll keep those calls when we change the order variants. The missing-field test isn't coming back."

**Eden**: "Both directories are in the compiler check. Runtime gets its explicit file. A file move needs both commands checked."

**Oded**: "The runtime tests check the two shipment records and the card text. None of them needs to ship a draft."

He runs both commands. They pass.

**Oded**: "Can I write 'type tests green' now?"

**Noam**: "Yes."

Oded waits.

**Noam**: "I was finished."
