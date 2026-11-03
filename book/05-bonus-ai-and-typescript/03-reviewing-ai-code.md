# Bonus 3: What Did the Fix Fix?

## The Principle

**Daniel Compiler**: "A patch summary is its author's opinion of what changed. The declarations are the compiler's. Emit them before and after and read the difference, following every type they refer to. Where the two opinions differ, the summary doesn't get a vote."

## The Debate

### "No public API changes"

**Oded Shipley** has a green pull request and a meeting in six minutes. He considers these two facts compatible.

**Noam Kiperman** has opened the last hunk. They are becoming less compatible.

Oded asked an assistant to move the shop's order-status labels into a lookup table. He saved its patch and messages with the review. The summary:

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

**Oded**: "Still says the same things. I checked. These cases were here before the refactor. I kept them."

```typescript
// cases.ts
// Runtime: Node 22.23.4; package.json has "type": "module".
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

**Oded**: "Zero refunded, some refunded, all refunded. Both the status and the text the customer sees. `node check.ts` prints `3 statuses, 3 badges: passed` on the old commit. I ran those unchanged files on this commit too. They passed."

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

**Noam**: "Why did a lookup-table refactor need to change the badge's fallback? It left `assertNever` with nothing to assert."

**Oded**: "That's the type error it fixed."

"I can see that it fixed an error. What did the fix fix?"

"We could ask."

**Noam**, in a comment: *What error required the change to badge.ts?*

The assistant replies:

> The inferred status is a string. Returning it in the fallback handles strings outside the three named cases. No exported type annotation changed, and the existing status cases retain their behavior.

**Oded**: "Accurate."

**Noam**: "And it says there are other strings now."

"It says the fallback handles them. The function still returns the same three. Show me one order this patch labels differently."

Noam reads the helper again. The comparisons are the same. The three labels are spelled correctly.

**Daniel**: "Those tests pass for a reason. Oded is right about the values."

**Oded**: "I'd like that in the minutes."

**Noam**: "We're not in the meeting yet."

### "Put the old caller back"

Noam restores only `badge.ts` to its original contents. The new table and helper stay.

The review project pins TypeScript 7.0.2, installed with `npm install`:

`package.json`:

```json
{
  "type": "module",
  "devDependencies": {
    "typescript": "7.0.2"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "types": [],
    "skipLibCheck": true,
    "noEmitOnError": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "allowImportingTsExtensions": true,
    "rootDir": ".",
    "outDir": "types"
  },
  "include": ["*.ts"]
}
```

He runs `node_modules/.bin/tsc -p tsconfig.json --pretty false`.

At `assertNever(status)`, **TS2345**: `Argument of type 'string' is not assignable to parameter of type 'never'.`

**Noam**: "That's what the last hunk fixes. The old caller doesn't accept the new provider."

**Oded**: "The old caller doesn't accept its *type*. We've just run its values."

**Daniel**: "Yes. Let's look at the type."

He puts the submitted badge back. Then he emits declarations from the original commit and the complete submitted patch, with the same compiler and settings. Both compilations succeed. In `types/status.d.ts`, the difference is one line:

```diff
--- a/types/status.d.ts
+++ b/types/status.d.ts
@@ -1,2 +1,2 @@
 import type { Order } from "./order.ts";
-export declare function orderStatus(order: Order): "paid" | "partial" | "refunded";
+export declare function orderStatus(order: Order): string;
```

**Daniel**: "Only `status.d.ts` changed. I checked `order.d.ts` too. It's unchanged. An identical import line doesn't tell me whether `Order` still means the same thing. If an exported alias uses `typeof`, I follow it to the value too."

**Oded** leans forward. "We didn't write `string` anywhere in that function."

**Daniel**: "The table properties are mutable. Their values widened. The function returns one of those values, so its inferred return is `string`."

**Noam** points at the summary. "No public API changes."

**Oded**: "No *written* public API changes."

"You don't get to insert a word after I've reviewed the sentence."

**Eden Legacy** has been searching for `orderStatus` in another checkout.

"Back in the generics argument, I asked for explicit return types on APIs we intend to keep: changing a body can change what we publish. Here's the mobile adapter's existing caller. It wasn't part of the assistant's patch."

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

**Eden**: "Parameters break the other way. Narrow one, and a caller elsewhere that still passes a `string` fails. A search here won't find it."

Eden sets the copied adapter aside.

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

He tries the equivalent typo in a scratch copy of the original: the final `return "refunded"` becomes `return "refund"`, with the original badge untouched.

**Noam**: "Compilation fails twice. TS2678 at the case:" `Type '"refunded"' is not comparable to type '"paid" | "partial" | "refund"'.` "And TS2345 at the fallback:" `Argument of type '"refund"' is not assignable to parameter of type 'never'.`

**Daniel**: "The old badge made a new label require an answer here. The submitted fallback supplies an answer for every string: print it. That's a behavior choice. It arrived as a type-error repair."

**Oded**: "I didn't ask for every string. I asked to move three of them up the file."

Noam returns to the submitted patch, without the typo.

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

**Noam**: "That works."

**Oded**: "Could you say it where the Approve button is?"

**Eden**: "It restores what we publish today. I still want this function to say what it promises. The table is how we implement the statuses. It shouldn't be where we accidentally decide which statuses the API offers."

**Oded**: "You could say that about every inferred return in the shop."

**Eden**: "I'm saying it about this one. I have a caller outside this patch that depends on it. If someone changes the implementation tomorrow, I want that implementation checked against the same three states."

**Daniel**: "The two-word repair is sufficient for today's widening. An explicit return gives that decision a separate place to live. Checking the table against the same type also puts the typo error where the label is written."

Oded looks at the proposed replacement.

"Keep both names private: `OrderStatus` and `RefundLevel`."

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

**Noam**: "At the table. The assistant's fallback just printed the typo."

He restores `"refunded"`. The program and all six assertions pass. Eden puts the unchanged mobile adapter back; it compiles too.

**Eden**: "The declaration names our local `OrderStatus` now. Same three statuses; no new named export."

### "Explicitly wrong"

**Oded**: "Can we make the compiler ask for the annotation next time?"

**Daniel**: "Here, yes. Choosing it is still our job."

In scratch work, he enables [`isolatedDeclarations`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations) on the original project. It reports **TS9007** on `orderStatus`: `Function must have an explicit return type annotation with --isolatedDeclarations.`

**Daniel**: "The original wasn't broken because it inferred a type. The flag even allows some simple inferred exports. It doesn't require a return annotation on every export."

He then uses the submitted patch and annotates its function `orderStatus(order: Order): string`. The annotation satisfies the flag. With the assistant's fallback, the project compiles.

**Oded**: "So now it's explicitly the wrong contract."

**Daniel** discards the experiment. "Exactly."

## The Verdict

> Before accepting a repair that makes a type error disappear, find what the error was protecting. A fix that changes the contract is a contract decision, not a type-error repair.

**Eden**: "Keep the table, the explicit return and the checked labels. Keep the original badge. This refactor promised the existing status API; the mobile caller still gets it."

**Noam**: "For changes to this shared API, attach the before-and-after declarations from the same compiler and configuration, including their referenced types. If a caller needs repairing, show the error that made you change it. We review that decision with the provider."

**Oded**: "And keep the runtime tests. Swapping `paid` and `refunded` would satisfy that union."

**Daniel**: "And the declaration report would be identical."

Oded replaces the summary: *Move labels into a table. Preserve the status return and exhaustive badge. Name the existing return contract; mobile compatibility and all three runtime cases checked.*

Noam approves the revised patch.

**Oded**: "Good. Now I have a green pull request and a meeting four minutes ago."
