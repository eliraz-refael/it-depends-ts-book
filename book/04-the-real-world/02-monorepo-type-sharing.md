# Chapter 25: The Other Money

## The Principle

**Gilad Stacktrace**: "Check a release where it will run: the program we ship, from the place it ships. Anything else is a rehearsal. When the rehearsal and the release disagree, keep the failing setup intact until someone can say why. At 3 AM nobody is running your checkout."

## The Debate

**Idan Greenfield**: "I have parsed the money. Apparently it isn't money."

**Dima Bridge**: "What are you adding it to?"

**Idan**: "The shipping charge. The request says a thousand cents, the cart says five hundred. The quote should say fifteen dollars."

**Dima**: "Node runs the built API. The release job copies it and its packages into an image. The workspace links stay in the checkout."

Root, money, cart and API all use `"type": "module"`; the checkout's `node_modules/@shop` links point to the packages.

Money's manifest follows; cart has the same mapping under `@shop/cart`.

**packages/money/package.json**

```json
{
  "name": "@shop/money",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

**Dima**: "The compiler gets the declaration in `dist`. Node gets the JavaScript beside it. Both packages have been built. Show me the amounts before the parser gets involved."

```typescript
// packages/money/src/index.ts
export class Money {
  #cents: number;
  constructor(cents: number) { this.#cents = cents; }
  plus(other: Money): Money {
    return new Money(this.#cents + other.#cents);
  }
  format(): string { return `$${(this.#cents / 100).toFixed(2)}`; }
}
export interface Line { sku: string; quantity: number; }

// packages/cart/src/index.ts
import { Money, type Line } from "@shop/money";
export function shipping(): Money { return new Money(500); }
export function firstLine(): Line { return { sku: "chair", quantity: 1 }; }

// generated/release.ts
export const buildId = "release-42";

// apps/api/src/main.ts — before using the request parser
import { buildId } from "../../../generated/release.js";
import { Money } from "@shop/money";
import { shipping } from "@shop/cart";
console.log(buildId, new Money(1000).plus(shipping()).format());
// release-42 $15.00
```

**Idan**: "That works. The request value is unknown, so I used the parser money already has. Until today, only money called it."

```typescript
// packages/money/src/parse.ts
import { Money } from "./index.js";
export function parseMoney(input: unknown): Money | undefined {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 0) {
    return undefined;
  }
  return new Money(input);
}
```

**Linoy Nightly**: "But the public index doesn't export it."

**Idan**: "And `@shop/money/src/parse.js` gives me TS2307. It's sitting right there in the checkout. I used the relative path."

**Dima**: "The exports map doesn't offer that package subpath. A relative filesystem path goes around the map. What did the API include?"

**Idan**: "The generated release stamp as well as src. Support wants the build tag on each quote. That's why rootDir already reaches the repository root, far enough to include money's source too."

**apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "types": [],
    "strict": true,
    "noEmitOnError": true,
    "rootDir": "../..",
    "outDir": "out"
  },
  "include": ["src"]
}
```

```typescript
// apps/api/src/main.ts — Idan's parser change
import { buildId } from "../../../generated/release.js";
import { parseMoney } from "../../../packages/money/src/parse.js";
import { shipping } from "@shop/cart";

const amount = parseMoney(1000);
if (!amount) throw new Error("Invalid amount");
console.log(buildId, amount.plus(shipping()).format());
// TS2741 at shipping(), abridged:
// Property '#cents' is missing in type 'import("…/money/dist/index").Money'
// but required in type 'import("…/money/src/index").Money'.
```

**Idan**: "The parser constructs a Money. Shipping constructs a Money. Both constructors are the one we just looked at."

**Gil Benchmark**: "The error names two files. Look at the paths."

Cart's generated declaration imports Money from `@shop/money`, leading to `money/dist/index.d.ts`. The parser imports its adjacent source index.

**Idan**: "We can export the parser. I'm still asking why these two amounts can't be added. The fields haven't changed. If it's only the import path, forcing the call should still give fifteen. I'll try it here before I change the export."

She uses the parser's return type for the cast, with `NonNullable` to exclude undefined.

```typescript
// apps/api/src/main.ts — replace the console.log for this experiment
console.log(buildId, amount.plus(
  shipping() as unknown as NonNullable<ReturnType<typeof parseMoney>>
).format());
```

The API compiles. The run throws `TypeError: Cannot read private member #cents from an object whose class did not declare it`.

**Gilad**: "`apps/api/out/packages/money/src/index.js`, at `Money.plus`. That's inside the API's output."

**Linoy**: "Why is there a money package in the API's output?"

**Gil**: "It was there before your change. I rebuilt the old API: two emitted implementations, only one loaded. Two imports that only need types pulled money's source into the compile, even though those imports disappear from the JavaScript. Your parser is the first thing that loads that copy."

Gil follows cart's import to `packages/money/dist/index.js`.

**Gil**: "Cart loads this one through the package name. The stack identifies the one doing the addition. Cart's object came from the other one."

**Idan**: "So my parser produced its Money correctly. It just wasn't cart's Money."

**Gilad**: "And the assertion didn't put that class's private field into cart's object."

**Idan**: "All right. It wasn't only the import path."

**Gil**: "I found three relative imports into money's source in the API. Yours fetches the parser. The other two are types for order lines and packing slips. They were here before your change."

```typescript
// apps/api/src/order-line.ts
import type { Line } from "../../../packages/money/src/index.js";
import { firstLine } from "@shop/cart";
export const line: Line = firstLine(); // Accepted.

// apps/api/src/packing.ts
import type { Line } from "../../../packages/money/src/index.js";
export type PackingLine = Pick<Line, "sku" | "quantity">;
```

**Dima**: "Line has the required fields. That assignment is valid. The private member is why the two Money declarations don't fit."

**Gil**: "I wanted to know how much we'd broken. I have three imports to change, but only one failing call. The others weren't evidence that the two declarations agreed."

Idan deletes the assertion and adds the missing public export. Gil changes the two type-only imports to `@shop/money`, where Line is already public.

```typescript
// packages/money/src/index.ts — add to the existing exports
export { parseMoney } from "./parse.js";

// apps/api/src/main.ts — replace the parser import
import { parseMoney } from "@shop/money";
```

After rebuilding money, cart and the API, the quote prints `release-42 $15.00`.

**Idan**: "There. Parsed once, passed straight to plus."

**Dima**: "We could publish `@shop/money/parse` as a subpath too. This parser can join Money at the root."

### "Which build did you check?"

**Linoy**: "Now edit `format`. Does checking the API see the edit, or does it see the last time you remembered to build money?"

**Idan**: "I need the quote to say USD anyway. Same cents, explicit label."

```typescript
// packages/money/src/index.ts — replace Money.format
format(currency: "USD"): string {
  return `${currency} ${(this.#cents / 100).toFixed(2)}`;
}
```

**Gil**: "The API still calls `format()` with no argument. `tsc -p apps/api` passes. It read the old declaration."

**Dima**: "Then the check command needs to build the dependencies."

**Gil**: "I tried `tsc -b apps/api` too. Still green. Money's declaration hasn't changed."

**Dima**: "We haven't told it what to build first. Money and cart are composite: `rootDir` is `src`, `outDir` is `dist`, with declarations emitted. I'll add `"references": [{ "path": "../money" }]` to cart, and these to the API."

**The new references in apps/api/tsconfig.json**

```json
[
  { "path": "../../packages/money" },
  { "path": "../../packages/cart" }
]
```

**Gil**: "Now `tsc -b apps/api` builds money, then cart. TS2554 at `format()`: `Expected 1 arguments, but got 0.`"

**Idan**: "There it is. I was starting to feel redundant. I could delete my arguments and nobody would notice."

She supplies the required argument.

```typescript
// apps/api/src/main.ts — update the quote
console.log(buildId, amount.plus(shipping()).format("USD"));
```

The dependency build passes, and the API prints `release-42 USD 15.00`.

**Dima**: "That build becomes our check command. I'll own the graph; a new package dependency needs its reference too."

**Linoy**: "Why keep dist at all? We had two Moneys because one came from source and one from the build. Then the build was old. Node 22 can strip these types. Let the checker and the runtime both use source."

**Dima**: "Through the public package name?"

**Linoy**: "Yes. Money chooses the file. No application reaches into its directories."

**Idan**: "And I can change the parser and check the caller without generating declarations first?"

**Linoy**: "That's the first part. Give both packages a source condition for development. Then we'll try making source the runtime target as well."

She puts the source condition first in both manifests:

**The exports field in both package manifests**

```json
{
  ".": {
    "@shop/source": "./src/index.ts",
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  }
}
```

**Dima**: "If money moves its source directory, who updates the applications?"

**Linoy**: "Nobody. They still import `@shop/money`. Money updates this entry. All the development checks ask for the same condition through a base config. Cart offers it too, so we're checking its source, not yesterday's description of it."

**tsconfig.dev-base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "types": [],
    "strict": true,
    "noEmit": true,
    "customConditions": ["@shop/source"]
  }
}
```

The API's `tsconfig.dev.json` contains `{"extends":"../../tsconfig.dev-base.json","include":["src"]}`.

**Gil**: "Fresh clone, dependencies installed, workspace links in place. The release stamp is committed. No outputs or incremental build files. `tsc -p apps/api/tsconfig.dev.json` passes, reading both packages' source."

**Linoy**: "That's the dev check. Nothing to build before it. Now the runtime."

Linoy starts an experimental branch.

**Linoy**: "Both manifests: `default` becomes `./src/index.ts`. Money's internal relative imports: `.js` becomes `.ts`. And `allowImportingTsExtensions` goes in the dev base on this branch."

**Dima**: "You changed the imports as well?"

**Linoy**: "Node needs actual .ts filenames, without the compiler's .js-to-.ts lookup. This noEmit check allows them. I'm not asking the release build to emit them."

The source check passes. The already-emitted JavaScript API still imports `@shop/money` and `@shop/cart`; Node now loads their linked source. It prints `release-42 USD 15.00`.

**Linoy**: "One Money. The formatter we just edited. We can stop maintaining a second set of files for the application to read."

**Idan**: "That is one build command I would happily forget."

## The Turn

**Gilad**: "Which file will the image load?"

**Linoy**: "The same src/index.ts. The manifest goes with it."

**Gilad**: "Then run the copy. We aren't shipping the link."

Gil copies the API output with its package manifest and both package directories into the image's layout. Each dependency is now a real directory under `node_modules/@shop`. He runs the copied API entry point.

Node refuses `node_modules/@shop/money/src/index.ts` with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. No quote is printed.

**Idan**: "We didn't change the file. We moved it."

**Linoy**: "Under node_modules. It won't strip types there?"

**Gil**: "Node documents that restriction: it won't strip types in dependencies under node_modules. In the workspace, the link resolves to the package directory outside node_modules. In the image, the file really is under it. Same source, different loading rule."

**Gilad**: "The path is part of the incident. Keep it in the report. Someone will try this from their checkout and close the ticket."

**Linoy**: "We could add a loader to the image."

**Dima**: "We could. It would be another loading setup to test and maintain. We already have a working JavaScript build. Is removing dist worth changing how this image starts?"

**Linoy**: "For this quote? No. But I still want the source check."

They leave the experimental branch, restoring the `.js` imports and `default` targets and removing `allowImportingTsExtensions` from the dev base.

**Dima**: "Package JavaScript. Clean both dist directories and the API's out first. A rebuild won't delete the stray money copy."

**Gil**: "And the incremental build files, so the clean outputs get rebuilt."

They clean those directories and metadata, then run `tsc -b apps/api`. The API output and manifest, plus both dependencies' manifests and `dist`, go into a fresh image layout. The copy prints `release-42 USD 15.00`.

**Gil**: "Two emitted from the start. One loaded until the parser arrived, then two. This image ships one."

**Idan**: "The total hasn't changed. We have spent quite a while agreeing on fifteen dollars."

## The Verdict

> Use public package entry points and test the rebuilt release in its installed layout. A development source check answers a different question.

**Dima**: "The copied-program test goes into the check command after the dependency build. I'll maintain that with the release job."

**Linoy**: "The source check gets its own command, using the shared base."

**Idan**: "The parser export goes in with the import fixes. Then I can send the quote."
