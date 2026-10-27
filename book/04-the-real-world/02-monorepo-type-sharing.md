# Chapter 25: The Other Money

## The Principle

**Gilad Stacktrace**: "Before you trust a type shared between packages, ask three questions. Which declarations is this caller being checked against? Which implementation will its import load when you run it? What builds that implementation from the source you just checked? A green check against an old declaration doesn't tell you whether today's package will accept the call."

"Use the package's public exports. If a helper is missing, add an export instead of reaching into its source directory. When two types have the same name but won't assign, read the declarations in the error before you assert them equal. You may be looking at two definitions. Development can check source while a release uses built declarations, but the release still needs to build its dependencies and run the code it will ship. Sharing a name doesn't arrange any of that."

## The Debate

**Idan Greenfield**: "I have parsed the money. Apparently it isn't money."

**Dima Bridge**: "What are you adding it to?"

**Idan**: "The shipping charge. The request says a thousand cents, the cart says five hundred. The quote should say fifteen dollars."

The shop keeps its money code, cart and API in three packages. Each package is an ES module: its manifest says `"type": "module"`. Workspace links under `node_modules/@shop` point to the package directories. Node runs the API's emitted JavaScript. Quotes also print a generated release tag, so support can identify the build that produced them.

Money's public manifest currently looks like this. Cart has the same export mapping, with the name `@shop/cart`.

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

**Idan**: "That works. The request value is unknown, so I used the parser money already has. It hadn't needed a caller outside its package before."

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

The API also compiles a generated release stamp from the repository root. Its existing `rootDir` covers that file; Idan hasn't widened it for this change.

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

**Gil Benchmark**: "Both declarations have that text. Look at the paths."

He opens cart's generated declaration. Its shipping result imports Money from `@shop/money`, which leads to `money/dist/index.d.ts`. The parser imports its adjacent source index. The API is checking both declarations.

**Idan**: "We can export the parser. I'm still asking why these two amounts can't be added. The fields haven't changed."

**Dima**: "I'm not asking you to parse it twice. Leave the input alone. Follow what the parser returns."

**Idan**: "That's what I did. It rejects strings, fractions and negative amounts. A thousand gets through and becomes a Money. If that promise is wrong, I want to fix the parser."

**Linoy**: "If it's only the spelling, forcing the call should still give fifteen. Try it here, before we change the export."

On her laptop she replaces the addition. `NonNullable` removes the parser's undefined case from the type; it changes nothing in the running program.

```typescript
// apps/api/src/main.ts — replace the console.log for this experiment
console.log(buildId, amount.plus(
  shipping() as unknown as NonNullable<ReturnType<typeof parseMoney>>
).format());
```

The API compiles. The run throws `TypeError: Cannot read private member #cents from an object whose class did not declare it`.

**Gilad**: "Show me where."

**Linoy**: "`apps/api/out/packages/money/src/index.js`. Inside `Money.plus`. Why is there a money package in the API's output?"

**Dima**: "You imported its source. The API compiled that source too."

**Gil**: "Two emitted implementations. That one, and `packages/money/dist/index.js`, which cart loads through the package name. The stack identifies the one doing the addition. Cart's object came from the other one."

**Idan**: "So my parser produced its Money correctly. It just wasn't cart's Money."

**Gilad**: "And the assertion didn't put that class's private field into cart's object."

**Linoy**: "All right. It wasn't only the spelling."

**Gil**: "The line item crosses the same two declarations without an error."

```typescript
// apps/api/src/line-check.ts
import type { Line } from "../../../packages/money/src/index.js";
import { firstLine } from "@shop/cart";
const line: Line = firstLine(); // Accepted.
```

**Dima**: "That's valid. It has the required fields. The private member is why these Money declarations don't fit. Don't count that line as another bug."

Gil closes the line-item experiment and removes its scratch file. Idan deletes the assertion and adds the missing public export.

```typescript
// packages/money/src/index.ts — add to the existing exports
export { parseMoney } from "./parse.js";

// apps/api/src/main.ts — replace the parser import
import { parseMoney } from "@shop/money";
```

After rebuilding the packages, the quote prints `release-42 $15.00`.

**Idan**: "The parser comes from the package now. That is the object I wanted to pass on."

**Linoy**: "A public `@shop/money/parse` export would work too. It can re-export the same declaration. We don't have to put every helper in the root index."

**Dima**: "Agreed. This one can join Money at the root."

**Gilad**: "And if the next helper isn't exported?"

**Idan**: "I ask for the export. Or keep that operation inside money. I don't add another path because my editor found the file."

She follows the repaired call into the declaration. This time the parser result and cart's shipping result lead to the same Money. The error is gone without an assertion.

### "Which build did you check?"

**Linoy**: "Now edit `format`. Does checking the API see the edit, or does it see the last time you remembered to build money?"

Idan needs an explicit currency label on the quote. She changes the formatter to require `"USD"`; it still formats the same cents, without converting them.

```typescript
// packages/money/src/index.ts — replace Money.format
format(currency: "USD"): string {
  return `${currency} ${(this.#cents / 100).toFixed(2)}`;
}
```

**Gil**: "The API still calls `format()` with no argument. `tsc -p apps/api` passes. It read the old declaration."

**Dima**: "Then the check command needs to build the dependencies."

**Linoy**: "That was my question before we added a parameter."

Money and cart already emit declarations from composite projects. Their package configs use `src` as `rootDir` and `dist` as `outDir`. Dima adds `"references": [{ "path": "../money" }]` to cart's config and adds both packages to the API's config. Gil tests the proposed graph in a copy, leaving their original tree's old outputs in place.

**The new references in apps/api/tsconfig.json**

```json
[
  { "path": "../../packages/money" },
  { "path": "../../packages/cart" }
]
```

**Dima**: "The existing check command will run `tsc -b apps/api`. Money first, then cart, then the API. You won't have to remember three builds."

**Gil**: "With those references it reports TS2554: `Expected 1 arguments, but got 0.` Without the edges, changing `-p` to `-b` still passed."

**Dima**: "I'll own the graph. An import isn't a project reference. When we add a package dependency, this command needs the build edge too."

**Linoy**: "So it doesn't discover the packages from the imports?"

**Gil**: "I removed the edges and kept the imports. It checked the API against the old files again. Same command, no error."

**Dima**: "The package name found something it could read. That doesn't ask the build to regenerate it. I'll put the references beside the dependencies in review. Otherwise I'm promising you a build order I never described."

**Idan**: "That gets the release right. Do I have to generate declarations before I can check a change to the parser?"

**Linoy**: "No. Give the development checker a source branch. In both packages, not just money. Cart's own declarations can get stale too."

She replaces the export mapping in each manifest. The `@shop/source` branch comes first. The normal declaration and JavaScript branches remain.

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

**Linoy**: "The compiler chooses that branch when we give it the condition. Node won't choose it just because a tsconfig mentions it."

**Dima**: "Are you putting a source path in every application? We just removed one."

**Linoy**: "The import stays `@shop/money`. Money offers the source branch in its own manifest. The application asks for a condition; it doesn't need to know where money keeps its files. And cart offers it too, so we can check cart's edit in the same run."

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

**apps/api/tsconfig.dev.json**

```json
{
  "extends": "../../tsconfig.dev-base.json",
  "include": ["src"]
}
```

Gil tries `tsc -p apps/api/tsconfig.dev.json` in a clean copy with no package outputs or incremental build metadata. It finds the missing currency argument.

**Gil**: "No `dist` to read. It lists money's source and cart's source. The error is on the API's old call."

**Dima**: "You removed the build metadata as well?"

**Gil**: "Both. This copy has never built the packages."

**Linoy**: "That's the check I want while I'm changing the package and its caller together. I can make the parameter required and find the callers before I emit anything."

**Idan**: "Good. That's the change I'm making."

She supplies the required argument.

```typescript
// apps/api/src/main.ts — update the quote
console.log(buildId, amount.plus(shipping()).format("USD"));
```

The development check passes, including in the clean copy. Linoy puts the shared dev base next to the release configuration.

**Dima**: "Keep that check. The release command still builds."

**Linoy**: "I haven't removed it. This config doesn't emit anything."

## The Turn

**Idan**: "Then why is the quote still showing a dollar sign? I just asked for USD."

In their original working tree, money's output is still the build from before the formatter edit. For a laptop experiment, Gil gives a copy of the API's original emitting config the source condition. He compiles the updated call and runs it against the linked packages. It prints `release-42 $15.00`, not `release-42 USD 15.00`.

**Linoy**: "The check is right about the source. That isn't the formatter Node called."

**Gilad**: "Which file did it call?"

**Gil**: "Money's default export target: `dist/index.js`. The old method ignores the extra argument. Nothing has built the new method here."

**Idan**: "So I asked the new signature a question and ran the old answer."

**Dima**: "That's why the release check has work to do."

**Linoy**: "Don't fix this by making my dev config read dist again. It found the missing argument when there was no dist at all."

**Dima**: "I won't. The source check did its job. We haven't run the release command here yet."

He runs the dependency build in that working tree. The same call now prints `release-42 USD 15.00`.

**Linoy**: "We could run source as well. Node can strip our types. Then there wouldn't be an old formatter to pick up."

**Dima**: "Try what the deploy copies."

On a separate branch, Linoy points both packages' runtime exports at `src/index.ts`. She changes their internal relative imports to use `.ts` extensions, which native Node needs for those source files. The API's already-emitted entry point now runs the linked sources and prints `release-42 USD 15.00`.

**Linoy**: "There. The formatter I edited."

**Gil**: "Locally. The release job copies the dependencies. It doesn't retain these workspace links."

He takes the same API output and copies both package directories into a deployment folder's `node_modules/@shop`. Node refuses the first TypeScript dependency with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.

**Idan**: "It ran the file a minute ago."

**Gil**: "Through a link to the package directory outside node_modules. The copied file really is under node_modules. On our Node 22.23.4, those aren't the same case."

**Linoy**: "Then keep the runtime target at dist. That doesn't stop the dev checker reading source."

**Dima**: "Exactly. I'll build before packaging, and we'll run that copied output. I'm not asking you to type-check yesterday's parser."

They restore the conditional exports. The development condition still selects source. The release build rebuilds the referenced packages, checks their consumers against the declarations and packages the JavaScript. The copied deployment prints `release-42 USD 15.00`.

**Gil**: "No package source directories in that deployment. Both amounts use the packaged Money."

**Gilad**: "Which green check lets this ship?"

**Dima**: "The existing check command, after it builds the reference graph and runs the copied program. The development command gets a separate name. Passing it won't skip the release check."

**Linoy**: "And I can run that development command on a fresh checkout."

**Dima**: "You just did. I want that test kept too."

**Idan**: "And the parser is still the public one. I don't have to reconstruct a Money after parsing it."

## The Verdict

**Dima**: "Export the parser and remove the relative import. Keep Linoy's dev check, shared through the base config. The existing release check gets the reference graph and builds before we copy anything. That copied program is the one we run before shipping. I'll maintain the build edges with the package dependencies."

**Linoy**: "And the dev check is allowed to work without dist. Don't make it call the release build first just to make the commands look alike."

**Dima**: "It stays separate."

**Idan**: "Then I can send the quote."
