# Chapter 26: It Can't Be Green

## The Principle

**Sahar Firstclass**: "A test must fail when code breaks a promise to its callers. Choose what they may pass or rely on in the result, break that promise, run CI's check, then restore the code and see it pass. I'd rather keep a small test that objects to the wrong behavior than a larger one we've only seen green."

## The Debate

**Noam Kiperman**: "It can't be green."

**Oded Shipley**: "I can refresh it, but I don't think that'll help."

**Noam**: "You changed `ship` to accept `Order`. Draft is an Order. I wrote a test that says you can't ship a draft."

**Oded**: "And it passed."

**Noam**: "That's the problem."

They're reviewing the shop's pre-order support. Their small review repository uses an in-memory shipping recorder: adding an id to `shipped` calls no courier. Before Oded's change, the relevant source was:

```typescript
// src/orders.ts — before the PR
// Project: TypeScript 7.0.2, Node 22.23.4; package.json has "type": "module".
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

**Oded**: "I needed paid orders and pre-orders. I used the union we already had. Yes, that includes drafts. I read the green check as evidence that I'd missed some other restriction."

His PR adds a new order variant and widens the shipping parameter:

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

**Eden Legacy**: "I've inherited comments that outlasted the warnings they silenced. Delete this one. Let's see what it's hiding now."

**Noam**: "Same check as CI: `tsc -p tsconfig.json`. Runtime is `node --test`. Here's the config."

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

Without the directive, TS2345 includes: `Property 'currency' is missing in type '{ id: string; status: "draft"; }' but required in type 'Draft'.`

**Oded**: "It can't ship that draft."

**Noam**: "It can't accept that object. It's missing a field."

**Eden**: "Now put the old signature back, with the comment still gone."

With `ship(order: Paid)`, the inline call reports TS2322: `Type '"draft"' is not assignable to type '"paid"'.`

**Noam**: "So it was checking status before the PR."

**Eden**: "And currency after it. The description didn't change because nobody asked the compiler to check the description."

Noam restores the directive and opens the history.

**Noam**: "Currency arrived in March. Before that, my inline object had every Draft field."

**Eden**: "Restore the source and tests from then. Both variants, both fixtures."

**Noam**: "No currency in either variant or fixture. No PreOrder yet. I've restored my inline draft. Now widen `ship`'s parameter to the old `Draft | Paid` union."

TS2578: `Unused '@ts-expect-error' directive.`

**Noam**: "I did see it fail."

**Eden**: "Before currency. The comment hid the stale fixture. Now the missing field hides the bad signature."

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

**Oded**: "If a red build counts as progress, I'm ahead of schedule."

**Eden**: "The fixture has its own check now. Add another required Draft field, and its declaration fails outside the directive."

**Noam**: "I'll try the paid-only parameter first. Without the directive, I get TS2741:" `Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'.`

**Noam**: "It's missing paidAt this time, but it's still a valid Draft being refused. Comment's back; we're green."

**Oded**: "Probe finished? Paid-only doesn't do my feature. Let me add the call we actually want and set the parameter to `Paid | PreOrder`."

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

**Oded**: "Both ids are right. I tried removing PreOrder from the parameter, and the new call failed. Putting it back made the check pass. Now the tests object if I ship too much or too little. That seems fair."

### "What are we promising?"

**Guy Singleton**: "We also have functions whose result types matter to callers. We shouldn't reduce every promise to whether one call compiles."

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

**Guy**: "I own that card. A paid input must keep the paid status in the result; I don't want a cast in my caller every time someone tidies this helper."

**Noam** adds a test to the existing file:

```typescript
// test/ship.test.ts — import orderRow, then add
const row = orderRow("o1", "paid");
const expected: { id: string; status: "paid" } = row;
```

**Sahar**: "The card needs evidence that the row is paid. This assignment would also accept `any`. Try it before we count it as a test."

For this experiment, Noam adds `: any` to the helper's return. The assignment and the admin caller both compile.

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

TS2344: `Type 'false' does not satisfy the constraint 'true'.`

**Noam**: "The assignment missed it. This comparison rejects `any`."

**Sahar**: "Before we keep that comparison, try the other half of the card's promise. A paid row mustn't become a draft row."

Keeping `: any`, Noam replaces Row with:

```typescript
// test/ship.test.ts — temporarily replace the Row assertion
// @ts-expect-error: a paid row isn't a draft row
const wrong: "draft" = row.status;
```

TS2578: the directive is unused. Noam removes `: any`; the test passes with the ordinary inferred return.

**Noam**: "All right. That catches it too."

**Guy**: "Keep the comparison for now. It tells me the result I promised without making me read a deliberately wrong assignment."

Noam removes `wrong` and its directive, then restores Row, and the file compiles cleanly. Sahar points at the helper's `Object.assign`.

**Sahar**: "Why are we assembling two objects to get two fields?"

**Guy**: "There used to be another fragment. We removed it when the card stopped displaying the customer's name."

**Sahar**: "Then finish removing it."

```typescript
// src/order-row.ts — replace the return statement
return { id, status };
```

Row fails with TS2344. With Row removed, the admin caller compiles; a Node `-e` import and call to `paidCard("o1")` logs `Paid order o1`. Noam restores Row.

**Oded**: "I let drafts ship and got green. An ampersand left Guy's hover and Noam got red."

**Guy**: "The card reads the id; our test reads the status and checks the card's input fields. They work. The comparison wants more."

**Sahar**: "You promised the status would stay paid. Did you promise it would arrive attached to an intersection?"

**Guy**: "No. Keep the flat return. Compare the status, and keep `expected` for the card's input fields, even if the card moves later."

```typescript
// test/ship.test.ts — replace the Row assertion
type Status = Expect<Equal<typeof row.status, "paid">>;
```

**Noam**: "Status accepts both forms. With `: any` added, I get TS2344 here, although `expected` and the card still compile. Removing the annotation makes the check pass. I'll keep the flat return."

**Noam**: "A function annotated `User[]` can return `JSON.parse(raw)` and pass an exact return-type test. Run it, and you get whatever the string held. These tests believe the annotation."

**Guy**: "Add a runtime assertion for the card text too."

### "It shipped"

Oded runs the tests again, then reads the draft test's callback.

**Oded**: "There's no runtime assertion in this one."

**Noam**: "It's a type test."

**Oded**: "It's also calling `ship`."

He clears `shipped` before the callback's `ship(draft)` and logs it afterwards. `node --test --test-reporter=spec` prints `shipped: [ 'o2' ]`. The test called “can't ship a draft” passes.

**Noam** reads the output twice.

**Oded**: "No courier. Just the fake's array. But our test of the forbidden call is making the forbidden call."

**Eden**: "The comment objects to the call's type. It doesn't cancel the call."

Node's [type stripping](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping) removes type syntax, leaving the call to execute.

**Oded**: "I'll take the compile-only bits out of the runtime file."

He moves the draft fixture and call, `row`, `expected` and Status, with their imports, into `test/ship.types.ts`. Without the callback wrapper, the draft part is:

```typescript
// test/ship.types.ts — draft excerpt; helper checks follow
import { ship, shipped, type Draft } from "../src/orders.ts";
const draft: Draft = { id: "o2", status: "draft", currency: "USD" };
shipped.length = 0;
// @ts-expect-error: can't ship a draft
ship(draft);
console.log("shipped:", shipped);
```

He adds Guy's card test beside the two shipment tests and runs plain `node --test`.

**Oded**: "Still `o2`. It ran `test/ship.types.ts`."

**Eden**: "The test directory gets discovered too. The suffix isn't an instruction to leave it alone. Put these under `type-tests`."

**Oded**: "I've moved it to `type-tests/ship.types.ts` and removed the reset and log. I'm running `node --test test/ship.test.ts` while we finish. Here's the whole runtime file:"

```typescript
// test/ship.test.ts — runtime tests after the split
import { test } from "node:test";
import assert from "node:assert/strict";
import { ship, shipped, type Paid, type PreOrder } from "../src/orders.ts";
import { paidCard } from "../src/admin.ts";

const paid: Paid = {
  id: "o1", status: "paid", paidAt: "2026-03-01", currency: "USD",
};
const preorder: PreOrder = { id: "o3", status: "preorder", currency: "USD" };
test("ships a paid order", () => {
  shipped.length = 0;
  ship(paid);
  assert.deepEqual(shipped, ["o1"]);
});
test("ships a pre-order", () => {
  shipped.length = 0;
  ship(preorder);
  assert.deepEqual(shipped, ["o3"]);
});
test("renders the paid card", () => {
  assert.equal(paidCard("o1"), "Paid order o1");
});
```

**Noam**: "And everything we moved:"

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

`tsc -p tsconfig.json --listFilesOnly` lists the runtime test, but not `type-tests/ship.types.ts`.

**Eden**: "We taught the runner to leave it alone. We haven't told the compiler where we put it."

The original `"include": ["src", "test/**/*.test.ts"]` misses it; no included file imports it.

**Eden**: "It wasn't checked in `test/ship.types.ts` either. We moved it before anyone asked."

He replaces the include:

**tsconfig.json — replace include**

```json
{
  "include": ["src", "test/**/*.test.ts", "type-tests/**/*.ts"]
}
```

The file list now includes the runtime test and `type-tests/ship.types.ts`. Noam gets TS2344 at the false assertion. Once he deletes it, the check passes.

**Noam**: "Now widen `ship` again."

**Oded**: "We just fixed that."

**Noam**: "We just moved its test."

Oded widens the parameter to `Order`, and the moved draft directive reports TS2578. With `Paid | PreOrder` restored, the check is green again.

**Noam**: "And the row?"

Oded adds `: any` to `orderRow`. Status reports TS2344 in its new file, although `expected` and the admin caller still compile. Without the annotation, everything compiles again.

With the false assertion back, `node --test type-tests/ship.types.ts` passes: Node erases it. Noam removes it again.

**Noam**: "The runner executed that file without checking its types. It doesn't get to be our type check."

## The Verdict

> Verify that each check selects the tests you intend and fails on the regression they guard. A passing test outside that check proves nothing about it.

**Eden**: "We're about to keep the same mistake in the runtime command. You've named one file. What happens when someone adds another?"

**Oded**: "Use the convention: `node --test "test/**/*.test.ts"`. I'll put that in CI."

Eden adds a temporary failing card test in `test/admin.test.ts`.

**Eden**: "The single-file command passes. The glob runs the new test and fails. Once I correct the expected text, both files pass. Now I'll remove the temporary test."

**Noam**: "Next time, show me the reds before you send me the green."

**Oded**: "Before moving it twice. Noted."

He runs the compiler check and the runtime glob. They pass.

**Oded**: "Can I write 'type tests green' now?"

**Noam**: "Yes."

Oded waits.

**Noam**: "I was finished."
