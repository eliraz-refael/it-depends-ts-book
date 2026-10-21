# Chapter 17: The Price You Were Given

## The Principle

**Liron Closure**: "Before you change an object, ask what the people holding it expect to keep. Some want today's value. Others need the value you gave them yesterday. Those are different promises, even if both callers only read."

"Preserve the old value for anyone who needs it. For current state, keep changes behind an owner and keep writable references inside that boundary. Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees."

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

Daniel tries two writes beside it:

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

The [object-type handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) documents the property-compatibility rule. Eden follows the call into the promotion package; there is no assertion to remove.

### A price that stays put

**Dafna**: "This receipt needs three numbers. Let it have three numbers we won't change."

She puts the pricing rule in one constructor. Both proposed APIs will use it:

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

**Eden**: "That catches this writer. It doesn't migrate the caller. The promotion now throws, so I have to replace its call before enabling this on that path."

**Dafna**: "Yes. `withDiscount` returns the replacement. The caller has to use it."

**Guy**: "And this?"

```typescript
const invented: Quote = { ...discounted, total: 0 }; // Accepted.
console.log(invented.discount, invented.total); // 20 0
```

**Dafna**: "That's not a quote made by our constructor. The discount and total disagree."

**Guy**: "But it has the type."

**Dafna**: "So don't accept a total from a caller. `withDiscount` takes the subtotal and computes it again. Your owner can do the same on entry. If we need an unforgeable value type, that's more work than freezing this one."

**Guy**: "Agreed. The owner should accept a discount operation, not let callers replace fields."

**Eden**: "What about the items? Our cart has a list."

**Dafna**: "The receipt's price doesn't need it. Keep that out of this snapshot. If we need a historical item list too, a spread of the cart isn't enough. We'd still share the array and its rows."

**Guy**: "A shallow copy from my constructor would share them too. I'd have to copy them on entry, or take values that are already kept immutable."

**Eden**: "Good. I don't want `snapshot()` returning an old price with tomorrow's quantities."

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

**Dafna**: "The getters read whichever quote is current when they're called. So the panel keeps the view, not a quote?"

**Guy**: "Exactly. It doesn't need rebinding after every discount. And the view has no setters."

**Eden**: "The constructor copies the numbers too. Keeping the object I passed in won't let me change your state."

**Guy**: "Or get a forged total into it."

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

**Guy**: "The properties didn't change. What the getters read did. That view is for the summary. The receipt needs the quote itself."

**Eden**: "Both got a `Quote`, and both only read it. I need the distinction at the call."

Guy adds a method to `CartPricing`:

```typescript
snapshot(): Quote {
  return this.#current;
}
```

**Guy**: "This returns the stored quote. It's frozen, it contains only numbers, and a later discount replaces it. The old quote stays as it was."

```typescript
const checkout = new CartPricing(quote(100, 0));
const liveSummary = checkout.view();
const savedPrice = checkout.snapshot();

checkout.applyDiscount(20);
console.log(receipt(savedPrice, checkout.snapshot())); // Was 100. Now 80.
checkout.applyDiscount(30);
console.log(savedPrice.total, liveSummary.total); // 100 70
```

**Dafna**: "So you keep old values too."

**Guy**: "For the receipt, yes. The panel keeps the view. It asks a different question."

**Dafna**: "Then the new-value part isn't the disagreement. It's who replaces the current one."

### Trying a promotion before applying it

**Eden** opens the promotion chooser. It previews two offers against the same starting price; selecting neither must leave checkout unchanged.

**Dafna**: "This is why I want the calculation to return a value. I don't want the preview to apply a discount, read the price, and undo it."

```typescript
const choosing = new CartPricing(quote(100, 0));
const start = choosing.snapshot();
const offers = [10, 20].map(amount => withDiscount(start, amount));
console.log(offers.map(price => price.total)); // [90, 80]
console.log(choosing.snapshot().total); // 100
```

**Guy**: "Nor do I. That function can stay. Applying the chosen offer is a separate operation."

**Dafna**: "But callers could keep the current value themselves too. The summary can read a binding. It doesn't require a class."

She writes the other handler, with its state scoped inside a checkout factory:

```typescript
function valueCheckout(initial: Quote) {
  let current = quote(initial.subtotal, initial.discount);
  return {
    get total() { return current.total; },
    snapshot: () => current,
    chooseDiscount(amount: number): string {
      const before = current;
      current = withDiscount(current, amount);
      return receipt(before, current);
    },
  };
}

const values = valueCheckout(quote(100, 0));
const valueSummary: Readonly<{ total: number }> = values;
console.log(values.chooseDiscount(20)); // Was 100. Now 80.
console.log(valueSummary.total); // 80
```

**Guy**: "Who else can assign `current`?"

**Dafna**: "Nobody outside that function."

**Guy**: "I can work with that. A caller can't replace its price behind its back."

**Dafna**: "Then keep `withDiscount` available without constructing `CartPricing`. That's what the preview needs."

**Eden**: "That also fits the summary's `total` property. So the class isn't what the panel needs. It needs a live read. Here's the handler with Guy's owner:"

```typescript
function chooseDiscount(checkout: CartPricing, amount: number): string {
  const before = checkout.snapshot();
  checkout.applyDiscount(amount);
  return receipt(before, checkout.snapshot());
}
```

**Guy**: "The promotion module gets neither a writable quote nor the view. It supplies an amount. The chooser can calculate prices, and this handler commits the choice."

**Eden**: "That replaces the old mutating promotion call. I still have to find the receipts that saved the live view. The compiler can't find that mistake from `Quote` alone."

**Dafna**: "Test both. Keep one snapshot, apply two discounts, and check that only the live view follows them."

## The Verdict

> Keep the price calculation as a value-returning function. Let the checkout owner publish the current price. The summary receives a live view; the receipt receives a stable snapshot. A single writer, a readonly type, and a frozen object each leave the question of history unanswered on their own.

The accepted boundary uses `withDiscount` for previews and inside the operation that commits a discount. Both paths use the checked constructor. Either owner implementation can keep the summary's property-reading interface. The receipt must capture a snapshot before that operation. Choosing a class over the closure is not part of this ruling.

**Eden**: "Then I'll replace the promotion call and the receipt reads together. Adding `readonly` was a smaller diff. It just didn't do this job."

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

**Dafna**: "Fine by me. No caller has an earlier index it's trying to keep. Once you publish it, keep that promise."

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

**Eden Legacy**: "Our frozen-price test runs in strict code, where that property assignment throws. One of my old plain JavaScript files can fail the same assignment silently. If you're using freezing to locate writers during a migration, check how those files run. No exception doesn't mean no attempted write."
