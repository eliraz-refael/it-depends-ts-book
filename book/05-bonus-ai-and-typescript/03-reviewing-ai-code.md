# Bonus 3: What Did the Fix Fix?

## The Principle

**Daniel Compiler**: "When a patch says the API stayed the same, I compare the public types before and after, with the same compiler and project settings. That includes the types a signature refers to: an unchanged alias can name a changed type. If the patch also fixes a caller, I put the old caller back and find what required the repair. The revised program compiling is useful evidence. It doesn't answer for the caller we just edited, or the caller in someone else's repo. We still have to decide which contract we intend to support."

"The summary is a claim about the change. Emitted declarations let you inspect its public types, but a textual difference still needs interpretation, and identical declarations don't prove identical behavior. Keep the runtime assertions. An explicit type gives the implementation a promise to meet; the compiler can check that promise without choosing the right one for you."

## The Debate

### "No public API changes"

**Oded Shipley** has a green pull request and a meeting in six minutes. He considers these two facts compatible.

**Noam Kiperman** has opened the last hunk. They are becoming less compatible.

Oded asked an unnamed assistant to move the shop's order-status labels into a lookup table. The submitted patch and the two assistant messages below are fixed artifacts of this example. This is its summary:

> Refactor `orderStatus` into a lookup table. No public API changes. Also fixed a type error in `badge.ts`.

The starting files are small enough that Oded offers to read them aloud, if that will count as approval.

```typescript
// order.ts
export type Order = { paidCents: number; refundedCents: number };

// status.ts
import type { Order } from "./order.ts";

export function orderStatus(order: Order) {
  if (order.refundedCents === 0) return "paid";
  if (order.refundedCents < order.paidCents) return "partial";
  return "refunded";
}

// badge.ts
import type { Order } from "./order.ts";
import { orderStatus } from "./status.ts";

function assertNever(value: never): never {
  throw new Error(`Unexpected status: ${value}`);
}
export function badge(order: Order): string {
  const status = orderStatus(order);
  switch (status) {
    case "paid": return "Paid";
    case "partial": return "Partially refunded";
    case "refunded": return "Refunded";
    default: return assertNever(status);
  }
}
```

**Oded**: "Three labels. I want to see them together. The comparisons can live in a helper."

**Noam**: "And the badge?"

"Still says the same things. I checked."

This project uses TypeScript 7.0.2, Node 22.23.4 and the book's strict ES2022/Node16 profile, including `exactOptionalPropertyTypes`. Its package has `"type": "module"`. For the review they enable `declaration`, `emitDeclarationOnly` and `allowImportingTsExtensions`, with `rootDir: "."` and `outDir: "types"`; the project includes its root `*.ts` files. Node runs the TypeScript directly. These are the retained cases, written before the refactor:

```typescript
// cases.ts
export const cases: { refundedCents: number; status: string; badge: string }[] = [
  { refundedCents: 0, status: "paid", badge: "Paid" },
  { refundedCents: 500, status: "partial", badge: "Partially refunded" },
  { refundedCents: 1000, status: "refunded", badge: "Refunded" },
];

// check.ts
import { cases } from "./cases.ts";
import { orderStatus } from "./status.ts";
import { badge } from "./badge.ts";

function equal(actual: string, expected: string): void {
  if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
}
for (const row of cases) {
  const order = { paidCents: 1000, refundedCents: row.refundedCents };
  equal(orderStatus(order), row.status);
  equal(badge(order), row.badge);
}
console.log("3 statuses, 3 badges: passed");
```

**Oded**: "Zero refunded, some refunded, all refunded. Both the status and the text the customer sees. `node check.ts` prints `3 statuses, 3 badges: passed` on the old commit. Same command, same files, same result on this one."

**Noam**: "Show me this one."

The assistant's submitted patch:

```diff
--- a/status.ts
+++ b/status.ts
@@ -3,5 +3,13 @@
+const labels = {
+  none: "paid",
+  some: "partial",
+  all: "refunded",
+};
+function refundLevel(order: Order) {
+  if (order.refundedCents === 0) return "none";
+  if (order.refundedCents < order.paidCents) return "some";
+  return "all";
+}
 export function orderStatus(order: Order) {
-  if (order.refundedCents === 0) return "paid";
-  if (order.refundedCents < order.paidCents) return "partial";
-  return "refunded";
+  return labels[refundLevel(order)];
 }
--- a/badge.ts
+++ b/badge.ts
@@ -10,6 +10,6 @@
     case "paid": return "Paid";
     case "partial": return "Partially refunded";
     case "refunded": return "Refunded";
-    default: return assertNever(status);
+    default: return status;
   }
 }
```

**Noam**: "Why did a lookup-table refactor need to change the badge's fallback?"

**Oded**: "That's the type error it fixed."

"I can see that it fixed an error. What did the fix fix?"

"We could ask."

Noam's review question is: *What error required the change to badge.ts?* The assistant's fixed reply in this example is:

> The inferred status is a string. Returning it in the fallback handles strings outside the three named cases. No exported type annotation changed, and the existing status cases retain their behavior.

**Oded**: "Accurate."

**Noam**: "And it says there are other strings now."

"It says the fallback handles them. The function still returns the same three. Show me one order this patch labels differently."

Noam reads the helper again. The comparisons are the same. The three labels are spelled correctly.

**Daniel**: "Those tests pass for a reason. Oded is right about the values."

**Oded**: "I'd like that in the minutes."

"We're not in the meeting yet."

### "Put the old caller back"

Noam restores only `badge.ts` to its original contents. The new table and helper stay. He runs `node_modules/.bin/tsc -p tsconfig.json --pretty false`.

At `assertNever(status)`, **TS2345**: `Argument of type 'string' is not assignable to parameter of type 'never'.`

**Noam**: "That's what the last hunk fixes. The old caller doesn't accept the new provider."

**Oded**: "The old caller doesn't accept its *type*. We've just run its values."

**Daniel**: "Yes. Let's look at the type."

He puts the submitted badge back. Then he emits declarations from the original commit and the complete submitted patch, with the same compiler and settings, clearing the output directory before each run and keeping both results. Both compilations succeed. In `types/status.d.ts`, the difference is one line:

```diff
--- a/types/status.d.ts
+++ b/types/status.d.ts
@@ -1,2 +1,2 @@
 import type { Order } from "./order.ts";
-export declare function orderStatus(order: Order): "paid" | "partial" | "refunded";
+export declare function orderStatus(order: Order): string;
```

**Oded** leans forward. "We didn't write `string` anywhere in that function."

**Daniel**: "The table properties are mutable. Their values widened. The function returns one of those values, so its inferred return is `string`."

**Noam** points at the summary. "No public API changes."

**Oded**: "No *written* public API changes."

"You don't get to insert a word after I've reviewed the sentence."

**Eden Legacy** has been searching for `orderStatus` in another checkout.

"I asked for explicit return types on APIs we intend to keep back in the generics argument. This is the implementation change I meant. Here's the mobile adapter's existing caller. It wasn't part of the assistant's patch."

He copies it into the temporary review project:

```typescript
// mobile.ts — unchanged consumer, copied into the review project
import type { Order } from "./order.ts";
import { orderStatus } from "./status.ts";

export function mobileStatus(order: Order): "paid" | "partial" | "refunded" {
  return orderStatus(order);
}
```

With the original provider it compiles. With the submitted provider, the return gets **TS2322**: `Type 'string' is not assignable to type '"paid" | "partial" | "refunded"'.`

**Eden**: "The app relies on those three states. We don't get to widen its return because this repo's badge found a fallback."

**Oded**: "Fine. That is a caller I hadn't checked."

**Daniel**: "And `Order` is unchanged in both declaration sets. We're comparing the same input here. If its definition had changed, we would have to review that too, even though this import line stayed identical."

Eden removes the copied adapter from the temporary project. Noam keeps its source for the repaired version.

**Oded**: "So fix the return type. I still want the table."

**Noam**: "I want to know what we lost in the badge."

"We lost the compiler asking me to fix a function that works. That was the attraction."

## The Turn

### "It says refund"

Noam opens a scratch copy of the submitted patch. He labels the experiment in the review: **deliberate typo; not in the submitted code**.

```diff
--- a/status.ts
+++ b/status.ts
@@ -3,7 +3,7 @@
 const labels = {
   none: "paid",
   some: "partial",
-  all: "refunded",
+  all: "refund",
 };
 function refundLevel(order: Order) {
   if (order.refundedCents === 0) return "none";
```

The program still compiles. He calls `badge({ paidCents: 1000, refundedCents: 1000 })` directly. It returns `refund`.

**Oded**: "That says refund."

**Noam**: "Yes."

"As in a button?"

"As in whatever string comes out. We replaced the check with permission to display it."

Oded runs `node check.ts`. It fails: `Expected refunded, got refund`.

**Oded**: "And my test catches your typo."

**Noam**: "It does. I haven't found a bug your tests missed. I've found a check the patch removed."

He tries the equivalent typo in a scratch copy of the original: the final `return "refunded"` becomes `return "refund"`, with the original badge untouched. Compilation now fails twice. **TS2678** says `Type '"refunded"' is not comparable to type '"paid" | "partial" | "refund"'.` At the fallback, **TS2345** says `Argument of type '"refund"' is not assignable to parameter of type 'never'.`

**Daniel**: "The old badge made a new label require an answer here. The submitted fallback supplies an answer for every string: print it. That's a behavior choice. It arrived as a type-error repair."

**Oded**: "I didn't ask for every string. I asked to move three of them up the file."

Noam undoes the typo experiments and returns to the submitted patch. It compiles; the unchanged tests pass again.

**Eden**: "We can keep the refactor. We can't keep calling that fallback an internal change."

### "Two words"

Oded takes the keyboard.

"Before this becomes a policy, two words."

```diff
--- a/status.ts
+++ b/status.ts
@@ -4,7 +4,7 @@
   none: "paid",
   some: "partial",
   all: "refunded",
-};
+} as const;
 function refundLevel(order: Order) {
   if (order.refundedCents === 0) return "none";
   if (order.refundedCents < order.paidCents) return "some";
--- a/badge.ts
+++ b/badge.ts
@@ -10,6 +10,6 @@
     case "paid": return "Paid";
     case "partial": return "Partially refunded";
     case "refunded": return "Refunded";
-    default: return status;
+    default: return assertNever(status);
   }
 }
```

The old badge compiles with the table. `node check.ts` passes. Daniel emits again: `status.d.ts` is byte-identical to the original. Noam compares it himself.

**Oded**: "I accept apologies as approvals."

**Noam**: "That works."

"A short approval is fine."

**Eden**: "It restores what we publish today. I still want this function to say what it promises. The table is how we implement the statuses. It shouldn't be where we accidentally decide which statuses the API offers."

**Oded**: "You could say that about every inferred return in the shop."

"I'm saying it about this one. I have a caller outside this patch that depends on it. If someone changes the implementation tomorrow, I want that implementation checked against the same three states."

**Daniel**: "The two-word repair is sufficient for today's widening. An explicit return gives that decision a separate place to live. Checking the table against it also puts the typo error where the label is written."

Oded looks at the proposed replacement.

"Keep the names private. Nobody has asked to import the refund calculation's vocabulary."

They replace `status.ts`; the original exhaustive `badge.ts` stays:

```typescript
// status.ts — replace the file; keep the original badge.ts
import type { Order } from "./order.ts";

type OrderStatus = "paid" | "partial" | "refunded";
type RefundLevel = "none" | "some" | "all";
const labels = {
  none: "paid",
  some: "partial",
  all: "refunded",
} satisfies Record<RefundLevel, OrderStatus>;
function refundLevel(order: Order): RefundLevel {
  if (order.refundedCents === 0) return "none";
  if (order.refundedCents < order.paidCents) return "some";
  return "all";
}
export function orderStatus(order: Order): OrderStatus {
  return labels[refundLevel(order)];
}
```

Noam repeats the `all: "refund"` experiment on this version. At the table, **TS2820**: `Type '"refund"' is not assignable to type 'OrderStatus'. Did you mean '"refunded"'?` The return also fails with **TS2322**, because the inferred values still include `"refund"`.

**Oded**: "It has a suggestion now."

**Noam**: "It used to have an objection. You replaced it with a string."

He restores `"refunded"`. The program and all six assertions pass. Eden puts the unchanged mobile adapter back; it compiles too.

The emitted declaration now names the private `OrderStatus` alias and refers to it from the exported function. Its text differs from the original, but the return type still permits exactly the same three statuses. Eden reviews that representation change; they have not added a named type export for consumers to import.

### "Explicitly wrong"

**Oded**: "Can we make the compiler ask for the annotation next time?"

**Daniel**: "Here, yes. Choosing it is still our job."

In scratch work, he enables `isolatedDeclarations` on the original project. It reports **TS9007** on `orderStatus`: `Function must have an explicit return type annotation with --isolatedDeclarations.` He then uses the submitted patch and annotates its function `orderStatus(order: Order): string`. With the repaired fallback, it passes the flag.

**Oded**: "So now it's explicitly the wrong contract."

**Daniel**: "Exactly. The original wasn't broken because it inferred a type. The flag has a different requirement."

He discards that experiment and returns to their chosen version. The [isolated-declarations documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations) permits some simple inferred exports; it does not promise an annotation on every export. They keep the declaration comparison rather than treating the flag as a compatibility check.

## The Verdict

**Eden**: "Keep the table, the explicit return and the checked labels. Keep the original badge. This refactor promised the existing status API; the mobile caller still gets it."

**Noam**: "For changes to this shared API, attach the before-and-after declarations from the same compiler and configuration, including their referenced types. If a caller needs repairing, show the error that made you change it. We review that decision with the provider."

**Oded**: "And keep the runtime tests. Swapping `paid` and `refunded` would satisfy that union perfectly."

**Daniel**: "Yes. The declaration report would be identical too. A difference needs review; no difference isn't permission to skip the behavior."

Oded replaces the summary: *Move labels into a table. Preserve the status return and exhaustive badge. Name the existing return contract; mobile compatibility and all three runtime cases checked.*

Noam approves the revised patch.

**Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."

## Additional Takes

**Eden Legacy**: "A narrower parameter can break compatibility too. Every caller here might pass `paid`; another caller still has a `string`. Don't decide what a shared API accepts by searching only the repo that changed it."

**Daniel Compiler**: "And if an exported alias uses `typeof`, follow it to the value. An unchanged alias line can acquire a different meaning. The declaration report is there to show you what the compiler made of the whole change."
