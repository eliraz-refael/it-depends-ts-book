# Chapter 17: The Price You Were Given

## The Principle

**Liron Closure**: "Before you change an object, ask what each holder expects to keep. Some want the current state. Others need the value you handed them earlier. Those are different promises, even if both holders only read."

"A holder that needs history must receive a value that won't change. The snapshot can be made by the owner or captured at the handoff. For current state, keep changes behind an owner and keep writable references inside that boundary. Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees."

"You can build something by mutation while nobody else can observe it. The question comes when you hand it over: what have you promised its next holder?"

## The Debate

### The promotion did what it was asked to do

**Eden Legacy** has a checkout receipt open. It says *Was 80. Now 80.*

"It was a hundred. The discount worked. The receipt forgot."

The checkout keeps a subtotal, a discount amount, and the resulting total. Its pricing rule is `total = subtotal - discount`, with a discount between zero and the subtotal. An offer replaces the discount amount; offers do not accumulate. The receipt keeps the price from before the promotion so it can show both amounts. The summary panel, by contrast, should show the current price whenever it renders.

Eden opens the receipt's input type and a cart before any discount:

```typescript
type Quote = Readonly<{
  subtotal: number;
  discount: number;
  total: number;
}>;

interface LineItem { readonly sku: string; readonly qty: number }
type Cart = Quote & { readonly items: readonly LineItem[] };

function receipt(before: Quote, after: Quote): string {
  return `Was ${before.total}. Now ${after.total}.`;
}

const cart: Cart = {
  subtotal: 100, discount: 0, total: 100,
  items: [{ sku: "book", qty: 1 }],
};
console.log(cart.total); // 100
```

**Guy Singleton**: "Who changed the total?"

**Eden**: "The promotion package. It accepts a writable price. Its existing callers expect it to update that price in place."

```typescript
type Priced = { subtotal: number; discount: number; total: number };

function applyPromotion(price: Priced, amount: number): void {
  if (!Number.isFinite(amount) || amount < 0 || amount > price.subtotal) {
    throw new RangeError("Invalid discount");
  }
  price.discount = amount;
  price.total = price.subtotal - amount;
}

const before = cart;
applyPromotion(cart, 20); // Accepted.
console.log(receipt(before, cart)); // Was 80. Now 80.
```

**Dafna Functor**: "And our readonly cart satisfies their writable parameter?"

**Daniel Compiler**: "It does. `readonly` on an object property doesn't prevent that assignment. It prevents a write through the readonly type."

**Dafna**: "So the receipt has the same object under a more reassuring name. I'd have pricing return a value. `before` would keep this one."

**Guy**: "I'd stop handing our state to a package that owns the writes. It can tell the cart what discount to apply."

**Eden**: "Both mean changing the call. Putting `readonly` on this type was the change we thought we had already made."

Daniel tries writing through the cart's own type, then passing its array to a helper that appends a gift:

```typescript
cart.total = 0; // Error TS2540: Cannot assign to 'total' because it is a read-only property.

function appendGift(items: LineItem[]): void {
  items.push({ sku: "gift", qty: 1 });
}
appendGift(cart.items); // Error TS4104.
// The type 'readonly LineItem[]' is 'readonly' and cannot be assigned to the mutable type 'LineItem[]'.
```

**Guy**: "It refuses the array, but accepts the price?"

**Daniel**: "The array types expose different operations. The readonly array has no `push`. That doesn't make the whole cart safe from replacement either. A parameter with a writable `items` property could assign a different readonly array to it."

The [object-type handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) documents the property-compatibility rule.

### A price that stays put

**Dafna**: "This receipt needs three numbers. Let it have three numbers we won't change."

She puts the pricing rule in a function that constructs a frozen quote:

```typescript
function quote(subtotal: number, discount: number): Quote {
  if (!Number.isFinite(subtotal) || !Number.isFinite(discount) ||
      subtotal < 0 || discount < 0 || discount > subtotal) {
    throw new RangeError("Invalid price");
  }
  return Object.freeze({ subtotal, discount, total: subtotal - discount });
}

function withDiscount(price: Quote, amount: number): Quote {
  return quote(price.subtotal, amount);
}

const original = quote(100, 0);
const discounted = withDiscount(original, 20);
console.log(receipt(original, discounted)); // Was 100. Now 80.
```

**Guy**: "Why freeze it if every function returns a new price?"

**Dafna**: "Because the promotion package is still there. We just watched the compiler let it write through another type. I want that mistake to fail where it happens."

```typescript
try {
  applyPromotion(original, 20); // Still accepted by the compiler.
} catch (error) {
  console.log(error instanceof TypeError); // true
}
console.log(original.total); // 100
```

**Eden**: "That catches this writer because the package runs in strict mode. Some of our old JavaScript files would silently fail the same assignments. A missing exception won't tell me there are no writers left."

**Dafna**: "The frozen price stays unchanged either way. But the old caller won't have applied a promotion. It has to use the result of `withDiscount`."

**Eden**: "And the package has other callers that still expect it to mutate. I can't change its return type and leave them ignoring the result."

**Dafna**: "Keep `applyPromotion` for them. Add the value-returning operation, then move checkout over."

**Eden**: "Two APIs until those callers migrate. I'd have the old one call `withDiscount` and copy its numbers back, so we don't maintain the pricing rule twice."

**Guy**: "And this?"

```typescript
const invented: Quote = { ...discounted, total: 0 }; // Accepted.
console.log(invented.discount, invented.total); // 20 0
```

**Dafna**: "That's not a quote made by our constructor. The discount and total disagree."

**Guy**: "But it has the type."

**Dafna**: "So don't accept a total from a caller. `withDiscount` takes the subtotal and computes it again. Your owner can do the same on entry. If we need an unforgeable value type, that's more work than freezing this one."

**Guy**: "The operation I want is `applyDiscount(amount)`. I won't expose a setter for the total."

**Eden**: "What about the items? Our cart has a list."

**Dafna**: "The receipt's price doesn't need it. Keep that out of this snapshot. If we need a historical item list too, a spread of the cart isn't enough. We'd still share the array and its rows."

**Guy**: "Putting the cart in a private field wouldn't fix that. I'd have to copy the rows on entry, or take values that are already kept immutable."

**Eden**: "I don't want the receipt showing an old price with tomorrow's quantities. Keep its price separate from the item list."

### Who changes the current price?

Guy opens the summary panel's binding. It reads a price whenever the panel renders; it is supposed to see later promotions.

**Guy**: "That's a live view. I can keep the current quote private and expose getters. The promotion goes through one method, and the method uses your calculation."

```typescript
class CartPricing {
  #current: Quote;

  constructor(initial: Quote) {
    this.#current = quote(initial.subtotal, initial.discount);
  }

  applyDiscount(amount: number): void {
    this.#current = withDiscount(this.#current, amount);
  }

  view(): Quote {
    const read = () => this.#current;
    return Object.freeze({
      get subtotal() { return read().subtotal; },
      get discount() { return read().discount; },
      get total() { return read().total; },
    });
  }
}
```

**Dafna**: "The panel keeps that object, and reading `total` later can give it another number. I'd be wary of passing that around as a `Quote`."

**Guy**: "For a current-price panel, that is the contract. It doesn't need rebinding after every discount. The arrow captures this owner, so the getters keep reading its current price."

**Eden**: "What if I keep the object I passed to the constructor?"

**Guy**: "It takes the numbers and makes its own checked quote. You won't have a writable alias into the private state."

## The Turn

Eden goes back to the receipt handler. It also accepts `Quote`.

**Eden**: "Then which of these am I supposed to give the receipt? The type doesn't distinguish them."

```typescript
const pricing = new CartPricing(quote(100, 0));
const summary = pricing.view();
const savedForReceipt = summary;

pricing.applyDiscount(20);
console.log(summary.total); // 80
console.log(receipt(savedForReceipt, summary)); // Was 80. Now 80.
console.log(Object.isFrozen(savedForReceipt)); // true
```

**Dafna**: "Even frozen."

**Guy**: "The properties didn't change. What the getters read did. That view is for the summary. The receipt needs the stored quote."

Guy adds a method to `CartPricing`:

```typescript
snapshot(): Quote {
  return this.#current;
}
```

**Guy**: "This returns the stored quote. It's frozen, it contains only numbers, and a later discount replaces it. The old quote stays as it was."

**Eden**: "That fixes the receipt if I call the right method. `view()` still gives me a `Quote`, so I can make the same mistake."

**Dafna**: "Stop making the live read look like a value. Give the summary a function. It has to ask for a price."

```typescript
type ReadPrice = () => Quote;
const readPrice: ReadPrice = () => pricing.snapshot();

receipt(readPrice, pricing.snapshot()); // Error TS2345.
```

**Dafna**: "Call `readPrice()` when the panel renders. Saving that result takes a snapshot. Saving the function keeps a way to read the next price."

**Guy**: "Where's the interface? The panel depends on a current-price capability. I'd name the operation on it."

```typescript
interface PriceView {
  current(): Quote;
}
```

He replaces the getter-based `view()` method:

```typescript
view(): PriceView {
  return { current: () => this.#current };
}
```

```typescript
const view = pricing.view();
receipt(view, pricing.snapshot()); // Error TS2739.
```

**Daniel**: "`PriceView` has `current`. It doesn't have `subtotal`, `discount` or `total`. Neither live reader can be passed to this receipt."

**Dafna**: "`ReadPrice` has a name too. You've put one function inside an object."

**Guy**: "I want the panel to ask `prices.current()`. It tells the next reader what that dependency does."

**Dafna**: "`readPrice()` tells me enough."

**Eden**: "Either one makes the panel change its `.total` read to a call. That's another migration, but it catches the receipt mistake we just made."

He uses Guy's interface for the next run:

```typescript
const checkout = new CartPricing(quote(100, 0));
const liveSummary = checkout.view();
const savedPrice = checkout.snapshot();

checkout.applyDiscount(20);
console.log(receipt(savedPrice, checkout.snapshot())); // Was 100. Now 80.
checkout.applyDiscount(30);
console.log(savedPrice.total, liveSummary.current().total); // 100 70
```

### Trying a promotion before applying it

**Eden** opens the promotion chooser. It previews two offers against the same starting price; selecting neither must leave checkout unchanged.

**Dafna**: "We need both candidate prices at once. `withDiscount` gives us two values from the same starting quote."

```typescript
const choosing = new CartPricing(quote(100, 0));
const start = choosing.snapshot();
const offers = [10, 20].map(amount => withDiscount(start, amount));
console.log(offers.map(price => price.total)); // [90, 80]
console.log(choosing.snapshot().total); // 100
```

**Guy**: "Keep that calculation. But applying the choice still goes through one owner. I won't have each handler replacing its own idea of the current price while the panel reads another."

**Dafna**: "I wasn't proposing that. A closure can own the current binding and give the panel the reader function."

She puts the current quote in a closure:

```typescript
function valueCheckout(initial: Quote) {
  let current = quote(initial.subtotal, initial.discount);
  return {
    read: (): Quote => current,
    chooseDiscount(amount: number): string {
      const before = current;
      current = withDiscount(current, amount);
      return receipt(before, current);
    },
  };
}

const values = valueCheckout(quote(100, 0));
const readValueSummary: ReadPrice = values.read;
console.log(values.chooseDiscount(20)); // Was 100. Now 80.
console.log(readValueSummary().total); // 80
```

**Eden**: "I can wire either. Here's the receipt handler using the class we've already got on screen:"

```typescript
function chooseDiscount(checkout: CartPricing, amount: number): string {
  const before = checkout.snapshot();
  checkout.applyDiscount(amount);
  return receipt(before, checkout.snapshot());
}
```

**Guy**: "The promotion supplies an amount. This handler owns the decision to apply it. The preview doesn't get to replace checkout's state."

**Eden**: "Then the old mutating API stays for its other callers. Checkout moves to the new calculation and this handler. The panel needs a live-reader type at the same time; leaving it as `Quote` would keep the bad call compiling."

## The Verdict

> Keep the price calculation as a value-returning function. Let the checkout owner publish the current price. Expose live access through a call; give the receipt stable values. A single writer, a readonly type, and a frozen object each leave the question of history unanswered on their own.

**Guy**: "I'd put `PriceView` in the panel's constructor. `current()` is the capability it needs, and the interface makes that dependency explicit."

**Dafna**: "I'd take `ReadPrice`. It's one operation. If the function type already says what I need, I don't want an object around it."

**Eden**: "Both reject the receipt's bad argument. I'll replace the promotion call and the panel and receipt bindings together. Adding `readonly` was a smaller diff. It just didn't do this job."

## Additional Takes

**Gil Benchmark**: "The checkout import builds a price index. Nobody reads it until the import finishes. This version copies the index for every entry:"

```typescript
const rows = Array.from({ length: 1_000 }, (_, i) => ({
  sku: String(i), price: i,
}));
let copiedProperties = 0;
const copied = rows.reduce<Record<string, number>>((index, row) => {
  copiedProperties += Object.keys(index).length;
  return { ...index, [row.sku]: row.price };
}, {});
console.log(copiedProperties); // 499500

const built: Record<string, number> = {};
for (const row of rows) built[row.sku] = row.price;
console.log(JSON.stringify(copied) === JSON.stringify(built)); // true
```

"Those are a thousand distinct keys: zero existing properties copied, then one, then two, up to 999. That counts property copies, not milliseconds. The second version builds the same object locally and hands it over when finished. Mutation inside the `reduce` callback would avoid the repeated copies too."

**Dafna**: "Fine by me. No caller has an earlier index it's trying to keep."

**Daniel Compiler**: "And if the price later carries a timestamp, don't mistake a recursive readonly type for a frozen clock."

```typescript
type DeepReadonly<T> = T extends (...args: never[]) => unknown ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

const stamp: DeepReadonly<{ at: Date }> = {
  at: Object.freeze(new Date("2026-01-01T00:00:00Z")),
};
stamp.at.setUTCFullYear(2000);
console.log(stamp.at.getUTCFullYear()); // 2000
```

"The method is still callable. Freezing the Date's properties doesn't freeze the internal date value. For a historical timestamp, a number would make the snapshot's promise easier to keep."
