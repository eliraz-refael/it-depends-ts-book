# Chapter 20: Before the First Line

## The Principle

**Daniel Compiler**: "Put a call boundary where a caller has enough information to make something it can use: a result now, or a function for later. If an argument is already known, you can fix it in an arrow and leave the remaining arguments for its caller. That doesn't require changing the original function's API."

"But the first call is still a call. It can do work, throw, and fix type arguments before the next call happens. Check what each call commits to, and what the next caller will actually pass. Splitting the parentheses doesn't make those decisions for you."

## The Debate

### Three identical lines

**Gil Benchmark**: "The second item is cheaper than the first. The third is cheaper again. Was that the promotion?"

**Dima Bridge**: "There wasn't a promotion on that statement."

Dima maintains the pricing package used by checkout and reporting. Checkout passes a line and its discount together. Reporting calls the same function to price the lines on a statement; omitting the discount means full price. The prices in their small fixture are integer amounts, chosen so no rounding is involved.

```typescript
type Line = { unitPrice: number; quantity: number };

function lineTotal(line: Line, percent = 0): number {
  return line.unitPrice * line.quantity * (100 - percent) / 100;
}

const lines: Line[] = [
  { unitPrice: 100, quantity: 1 },
  { unitPrice: 100, quantity: 1 },
  { unitPrice: 100, quantity: 1 },
];

console.log(lineTotal(lines[0], 10)); // 90
console.log(lines.map(line => lineTotal(line)).join(",")); // 100,100,100
```

**Linoy Nightly**: "I removed the wrapper. It took a line, passed the line, returned the answer."

```typescript
console.log(lines.map(lineTotal).join(",")); // 100,99,98
console.log(lines.slice(0, 1).map(lineTotal).join(",")); // 100
```

**Gil**: "That second call is the whole old fixture. One item."

**Noam Kiperman**: "What did `map` pass as the discount?"

**Daniel**: "The index. It calls the function with the element, the index and the array. At index zero you got the answer you expected."

**Linoy**: "The zero wasn't my default."

**Dima**: "We could make the discount required. Then a caller has to supply it."

**Daniel**: "This caller does supply it. Making the parameter required still compiles."

**Noam**: "I want the shortened call to fail. Keeping the arrow fixes this statement, but the next person can remove it again."

Dima changes the second parameter to an object. The replacement keeps the no-discount call; checkout names the discount when it supplies one.

```typescript
type Discount = { percent?: number };

function lineTotal(line: Line, { percent = 0 }: Discount = {}): number {
  return line.unitPrice * line.quantity * (100 - percent) / 100;
}

console.log(lineTotal(lines[0], { percent: 10 })); // 90
lines.map(lineTotal); // Error TS2345: Type 'number' has no properties in common with type 'Discount'.
```

**Noam**: "That catches the call I was worried about. The index is still a number. It can't fill that parameter."

**Linoy**: "Fine. Though I still need a function to give reporting. I'd rather give it one than write an arrow everywhere it asks."

### Who owns the arrow?

Reporting has two consumers: a statement renderer that totals the priced lines, and a preview that displays each price. Their pricing callback takes one line and returns a number. These small versions show the calls they make:

```typescript
type PriceLine = (line: Line) => number;

function statement(lines: readonly Line[], price: PriceLine): number {
  return lines.map(price).reduce((total, value) => total + value, 0);
}

function preview(lines: readonly Line[], price: PriceLine): string {
  return lines.map(price).join(",");
}
```

**Linoy**: "The operator chooses a promotion when setting up the run. We load its lines afterwards. The promotion is fixed for that run, and the preview asks for the same pricing callback as the statement."

**Dima**: "So make it once in reporting."

```typescript
const discount: Discount = { percent: 10 };
const price: PriceLine = line => lineTotal(line, discount);

console.log(statement(lines, price)); // 270
console.log(preview(lines, price)); // 90,90,90
```

**Linoy**: "That's what I want the package to return."

**Dima**: "You already have that function. Checkout has both arguments. Why should its callers make a function just to call it immediately?"

**Daniel**: "You've partially applied `lineTotal`: fixed the discount and made a function for the line. The original still takes both arguments in one call. Currying changes a multi-argument function into successive calls that each take an argument. You can partially apply a plain function without giving everyone a curried API."

**Linoy**: "I could still offer this. The first call takes the discount and returns the line function. I can call that immediately or give it to the preview."

```typescript
const discountedBy = (discount: Discount): PriceLine =>
  line => lineTotal(line, discount);

console.log(discountedBy({ percent: 10 })(lines[0])); // 90
console.log(preview(lines, discountedBy({ percent: 10 }))); // 90,90,90
```

**Daniel**: "You also put the discount first. The original took the line first. Currying doesn't require that order; you've chosen it because this caller knows the discount first."

**Noam**: "Does it stop `map` passing the index?"

**Linoy**: "It still passes it. The returned function only uses the line. It passes the discount it closed over to `lineTotal`."

**Dima**: "I can export both. That's one calculation, with an arrow around it. But so far you're asking me to maintain a convenience name that reporting can write itself."

Linoy looks back at the promotion ticket underneath the refactor.

"There's another part. I should have started with that."

### Preparing a promotion

The next promotion gives different discounts for different quantities of a product. Its tiers arrive in no particular order. The package must validate them, order them for lookup, and choose the highest qualifying minimum for each line. This is why a single `percent` is no longer enough.

**Dima**: "That work belongs here. A line with quantity three must get the same tier in checkout and on the statement. Reporting doesn't get to implement another tier search."

Dima replaces `Discount` with `Promotion` and opens the implementation used by both teams.

```typescript
type Tier = { minimum: number; percent: number };
type Promotion = { tiers: readonly Tier[] };

function prepare(promotion: Promotion): readonly Tier[] {
  if (promotion.tiers.length === 0) {
    throw new RangeError("Promotion needs a tier");
  }
  const seen = new Set<number>();
  const tiers = promotion.tiers.map(({ minimum, percent }) => {
    if (!Number.isSafeInteger(minimum) || minimum < 1 ||
        !Number.isFinite(percent) || percent < 0 || percent > 100 ||
        seen.has(minimum)) {
      throw new RangeError("Invalid promotion tier");
    }
    seen.add(minimum);
    return { minimum, percent };
  });
  return tiers.sort((a, b) => b.minimum - a.minimum);
}

function evaluate(line: Line, tiers: readonly Tier[]): number {
  const percent = tiers.find(tier => tier.minimum <= line.quantity)?.percent ?? 0;
  return line.unitPrice * line.quantity * (100 - percent) / 100;
}

function lineTotal(line: Line, promotion: Promotion): number {
  return evaluate(line, prepare(promotion));
}
```

`prepare` and `evaluate` are private to the package. The renderers still receive a `PriceLine`. The lines supplied to pricing already have valid positive quantities and finite nonnegative unit prices; this code checks the promotion's rules. A line below every tier's minimum gets no discount.

**Linoy**: "Here's the new run. Same two consumers, same arrow."

```typescript
const promotion: Promotion = {
  tiers: [
    { minimum: 3, percent: 20 },
    { minimum: 1, percent: 0 },
    { minimum: 2, percent: 10 },
  ],
};
const orderLines: Line[] = [
  { unitPrice: 100, quantity: 1 },
  { unitPrice: 100, quantity: 2 },
  { unitPrice: 100, quantity: 3 },
];
const price: PriceLine = line => lineTotal(line, promotion);

console.log(statement(orderLines, price)); // 520
console.log(preview(orderLines, price)); // 100,180,240
```

**Gil**: "Six calls into `prepare`. Eighteen tier validations. Six line prices."

**Dima**: "There are two renderers. Six line prices are expected."

**Gil**: "Yes. It's the same three tiers being prepared six times that I'm counting. I haven't measured how much time that costs."

**Linoy**: "I made the callback once. It didn't prepare anything when I made it. Every call goes all the way back through `lineTotal`."

**Noam**: "Could reporting prepare first?"

**Dima**: "It can't call our private helper. I'd have to publish the prepared representation, or let it into the package's internals. I don't want its callback depending on how we store the tiers."

**Linoy**: "Then return the callback from here. Do your preparation before returning it."

She replaces `discountedBy` with a factory for the new promotion. Dima keeps the direct entry point, delegating to it:

```typescript
function priceWith(promotion: Promotion): PriceLine {
  const tiers = prepare(promotion);
  return function priceLine(line: Line): number {
    return evaluate(line, tiers);
  };
}

function lineTotal(line: Line, promotion: Promotion): number {
  return priceWith(promotion)(line);
}
```

**Dima**: "Now the package is doing something your arrow couldn't do through the public call."

**Linoy**: "And checkout still has its two-argument function."

The run's layout stores its pricing callback. Both renderers use that stored function:

```typescript
const layout: { price: PriceLine } = { price: priceWith(promotion) };

console.log(statement(orderLines, layout.price)); // 520
console.log(preview(orderLines, layout.price)); // 100,180,240
console.log(lineTotal(orderLines[0], promotion)); // 100
```

Gil repeats his count for the two reporting calls, excluding that separate checkout call:

| Reporting path | Preparations | Tier validations | Line evaluations |
|---|---:|---:|---:|
| Local adapter around `lineTotal` | 6 | 18 | 6 |
| One stored `priceWith` result | 1 | 3 | 6 |

**Dima**: "Checkout still prepares for each direct call, then. We haven't changed that cost just by making its implementation call the factory."

**Gil**: "One checkout call prepared once before and prepares once now. The saving belongs to the reporting run that keeps the function."

**Dima**: "We could also price a batch. Prepare once, map the lines internally, return the numbers."

**Linoy**: "If I collect all six calls first, that works. These renderers ask for a function and call it when they have their lines. I'd have to change that handoff to give them prices."

**Gil**: "One batch of six ties this count. Two separate batches of three prepare twice. We don't need a timing argument to distinguish them."

**Noam**, pointing to `layout`: "That's a promise somebody can keep. One line in, number out. If you later need another required argument, this assignment stops compiling."

**Dima**: "Which is an extra contract for the package. I can change the prepared tiers, but I have to keep that function callable."

**Linoy**: "That's the part I need you to keep. You can change the lookup underneath it."

**Dima**: "Suppose I stop keeping a sorted array and build a lookup function instead. I don't want the array shape to become another thing we have to support."

**Noam**: "It doesn't leave the package. The layout stores `PriceLine`, not the tiers. Check the replacement against the same quantities and prices. If those change, we have something else to discuss."

## The Turn

**Gil**: "The empty statement changed."

**Linoy**: "From zero to what?"

"It doesn't get that far."

The old adapter was never invoked on an empty list. The factory prepares before either renderer sees a line. Gil uses a promotion whose percentage is outside the allowed range:

```typescript
const invalid: Promotion = { tiers: [{ minimum: 1, percent: 101 }] };

console.log(statement([], line => lineTotal(line, invalid))); // 0
try {
  const price = priceWith(invalid);
  console.log(statement([], price));
} catch (error) {
  console.log(error instanceof RangeError ? error.message : "unexpected");
  // Invalid promotion tier
}
```

**Linoy**: "I can move `prepare` back inside the returned function. Then it waits until there is a line."

**Dima**: "And prepares six times again."

**Linoy**: "Or prepare on its first call and keep the result."

**Dima**: "That can prepare once too. But creating the function would no longer tell you the promotion passed validation. You could store it, hand it to both renderers, and only find out when one of them asks for a price."

**Noam**: "That would let an invalid promotion through setup on an empty run. Is that what reporting wants?"

**Linoy**: "The operator chooses a promotion before starting the run. If it's invalid, I'd rather tell them there, even if the statement turns out empty."

**Dima**: "Then create the pricing function at promotion setup. Reporting must handle the error there, before either renderer starts."

**Noam**: "And say the factory can reject the promotion. Its return type only describes the function you get if it succeeds."

**Gil**: "A valid empty run still prepares once. It prices nothing."

**Linoy**: "That's okay. Setup has work now. I was treating it as a shorter way to write the arrow."

## The Verdict

**Dima**: "We'll publish `priceWith` for the tiered promotion. It validates and prepares at the call, then returns the unary pricing function. Checkout keeps `lineTotal`. Both use the same calculation."

**Linoy**: "I'll create it when reporting accepts the promotion and give that function to the layout. The preview and statement can call it without doing the preparation again."

**Noam**: "Keep the empty invalid run in the tests. If somebody moves the check back into the returned function, the prices alone won't tell us."

**Dima**: "And this isn't a request for two exports for every calculation in the package. The ordinary discount adapter can live in reporting. This one earns its entry point because the package owns the preparation."

## Additional Take

**Daniel Compiler**: "Type arguments can be fixed by the first call too. Don't assume moving an argument into a later call leaves inference unchanged."

```typescript
function pair<T>(first: T, second: T): [T, T] {
  return [first, second];
}
const pairWith = <T>(first: T) => (second: T): [T, T] => [first, second];

pair({ a: 1 }, { b: 2 }); // Accepted: both arguments participate in inference.
pairWith({ a: 1 })({ b: 2 }); // Error TS2353: 'b' does not exist in type '{ a: number; }'.
```

**Linoy**: "The first call already chose `{ a: number }`. If I want either shape, I can give that call a union."

```typescript
type Either = { a: number } | { b: number };
pairWith<Either>({ a: 1 })({ b: 2 }); // Accepted.
```

**Daniel**: "Yes. Decide it there. The later call won't go back and widen it for you."
