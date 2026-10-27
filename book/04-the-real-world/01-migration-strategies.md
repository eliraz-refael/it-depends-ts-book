# Chapter 24: Both Tests Were Green

## The Principle

**Daniel Compiler**: "A migration changes an implementation while its callers are still using it. Keep their contract—what they get back from `require`, what arguments they pass and what results they receive—or change and verify the callers too. If they expect `require("./slug")` to give them a function, a test rewritten to use a default import doesn't check that old call."

"The compiler will happily emit a file it never read. `allowJs` lets JavaScript into the program. Only `checkJs` or `@ts-check` makes the compiler report that file's errors. So a caller counts as checked only when this compile includes it and checks it. A file outside `include` that nothing inside imports isn't in the compile at all, even with `@ts-check` at the top. For every caller that isn't checked, keep the contract it relies on, bring it into the check, or execute its old call. TypeScript 7 is strict by default, so the first JavaScript check can report untyped parameters. If that's too much at once, check fewer files. Switching `noImplicitAny` off for the whole program weakens the TypeScript too."

## The Debate

**Oded Shipley**: "One function. One test. No dependencies. I picked the boring one."

**Eden Legacy**: "The product pages are returning 500s."

**Oded**: "It still makes the slug."

**Eden**: "The route can't get far enough to ask it."

Eden opens the storefront's build configuration. The team is eight months into the migration.

**Eden**: "The package still says `"type": "commonjs"`. Node runs what's in `dist`. We haven't changed that."

There is no `strict` setting. On their TypeScript 7 compiler, it defaults to true.

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "types": [],
    "allowJs": true,
    "checkJs": false,
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["src/**/*", "tests/**/*.ts"]
}
```

**Eden**: "The JavaScript test runs against the build. Your TypeScript test goes through the compiler with the source. Show me both versions, and the route that still calls this."

**Chen Override**: "Leave me the build directory afterwards. I need to run the URL backfill."

```javascript
// src/slug.js
module.exports = function slug(title) {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
};

// src/route.js
const slug = require("./slug");
module.exports = function handle(title) {
  return "/products/" + slug(title);
};

// tests/slug.test.js
const slug = require("../dist/src/slug");
if (slug(" Green Chair ") !== "green-chair") {
  throw new Error("Wrong slug");
}
```

**Oded**: "The test passed before. It passes after. I haven't changed the function body."

He opens the two converted files.

```typescript
// src/slug.ts
export default function slug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}

// tests/slug.test.ts
import slug from "../src/slug";
if (slug(" Green Chair ") !== "green-chair") {
  throw new Error("Wrong slug");
}
```

**Noam Kiperman**: "You changed how the test gets the function."

**Oded**: "It's an import now. The file is TypeScript now."

**Eden**: "The route isn't."

**Oded**: "Are we saying I have to convert every caller before I can convert a leaf? That's the entire reason I started at the bottom."

**Daniel**: "You can keep its export. First look at the one you've built."

```javascript
// inspect.js, run beside the emitted slug.js
console.log(typeof require("./slug"));
// object
console.log(typeof require("./slug").default);
// function
```

The route tries to call the object. Its error is `TypeError: slug is not a function`.

**Oded**: "Then how did my test call it?"

**Daniel**: "The emit assigns `exports.default = slug`. Your default import reads that member. Your route's `require` returns the whole object."

**Noam**: "The new test correctly checks a call nobody in that route makes."

**Oded**: "I converted the test out of catching the conversion."

He restores the old JavaScript test as `tests/slug.require.test.js`, alongside the new TypeScript test. It still runs directly against the built output. It fails on the first call.

**Oded**: "That stays. I don't want this depending on the next person remembering which kind of import we argued about."

**Eden**: "We can change the route to `require("./slug").default`. That works too. But then we have to change everyone who loads this function. You were adding types to the slugger, not changing its callers."

**Oded**: "Then I want `export = slug`. Keep handing them the function."

```typescript
// src/slug.ts — preserve the callable export
function slug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}
export = slug;
```

Both tests pass. The route returns `/products/green-chair` again. The emit ends with `module.exports = slug`.

**Oded**: "And my new default import still works?"

**Daniel**: "In this build, yes. From the test, `import slug = require("../src/slug")` works too. The function becoming TypeScript didn't require it to become a default-exported property."

**Noam**: "We repaired the loading call. Why didn't the compiler tell us about the broken one?"

**Oded**: "Because the route is JavaScript."

**Noam**: "It copied the route into the output. It clearly found it."

**Eden**: "Found it, inferred from it, emitted it. We haven't asked it to report the route's body errors."

Noam changes `checkJs` to true and tries the failed default-export version again. The call to `slug(title)` reports TS2349: `This expression is not callable.` The diagnostic says the imported module has no call signatures. The route's untyped `title` also reports TS7006: `Parameter 'title' implicitly has an 'any' type.`

**Noam**: "There. Before deployment. I want this on for JavaScript too."

**Oded**: "You have more errors."

Noam opens the two older helpers named in the errors.

```javascript
// src/lookup.js
module.exports = function lookup(id) {
  return id;
};

// src/sum.js
module.exports = function sum(a, b) {
  return a + b;
};
```

Oded's next leaf is in the errors too. He opens it beside the label that uses it.

```javascript
// src/money.js
function price(cents) {
  return cents / 100;
}
module.exports = { price };

// src/price-label.js
const { price } = require("./money");
console.log(price(1250));
// 12.5
```

**Noam**: "Five implicit-any parameters: title, id, a, b and cents. With the callable export back, those five remain."

**Oded**: "Cents is a number. We can annotate that now. But who is deciding what `sum` accepts? It has string callers as well as numeric ones. I don't want to invent its types to finish a slug change."

**Eden**: "Then don't invent them. We can check the route today. The title is a string. That's what this handler is for."

**Oded**: "Or turn off `noImplicitAny` until the JavaScript is gone."

**Noam**: "That turns it off for the TypeScript in this program too. The next untyped parameter in a converted file becomes acceptable."

**Eden**: "We don't need to lower it. `@ts-check` at the top of the route would check that file under the current strict settings. It would leave the other files alone."

**Noam**: "And the next JavaScript file starts unchecked again. Keep `checkJs` on. Put `@ts-nocheck` on the files we're deliberately leaving. Then I can find the exceptions without opening every configuration and remembering what it excludes."

**Oded**: "Including `sum`, until its owner has looked at both sets of callers."

**Noam**: "Including `sum`. We can review that file separately."

**Oded**: "Once the comments are there, what makes this better than checking files as we reach them?"

**Noam**: "The next source file is checked without waiting for us to reach it. Keeping it unchecked takes a change someone can see in the PR. I'd rather review that exception than hope the author remembers to opt in."

**Eden**: "And the existing exceptions need a next step. Lookup's owner can confirm its IDs separately. Sum needs its callers examined before we write a contract for it. Neither belongs to the slugger."

Eden records `lookup.js` and `sum.js` on the exception list with their owners. Each gets `// @ts-nocheck`. Oded adds `/** @param {number} cents */` above `price` in `money.js`.

**Eden**: "The sitemap is already on the exception list. The catalogue team left it opted out while they replace its footer callback. Their PR owns that work."

Eden links the catalogue team's work beside the two new exceptions. Global `checkJs` stays on.

**Chen**: "Does the route give its callers a string requirement yet?"

```typescript
// src/caller.ts — before the route's parameter is annotated
import handle = require("./route");
const url: string = handle(42);
```

**Noam**: "It accepts that call. The route still has an implicit-any error, but its caller has no string requirement to violate."

**Eden**: "Let's give it one."

```javascript
// src/route.js
const slug = require("./slug");
/** @param {string} title */
module.exports = function handle(title) {
  return "/products/" + slug(title);
};
```

The same `handle(42)` now reports TS2345: `Argument of type 'number' is not assignable to parameter of type 'string'.`

**Oded**: "A useful type for its caller, and the route is still JavaScript."

**Eden**: "The typed slugger gives its checked JavaScript callers a signature too. You don't have to convert them all to benefit from starting with the leaf."

Chen removes the probe. Both tests pass, `handle("Green Chair")` returns the product URL, and the compiler is green too.

## The Turn

**Chen**: "Would this setup have caught Oded's original PR? Put the default export back for a minute. This is an experiment, not the version we're merging."

Oded restores `export default` on the slugger in a scratch branch. The route stays checked. The sitemap keeps the opt-out it had before this PR. The route reports TS2349 again.

**Chen**: "And the sitemap?"

```javascript
// src/sitemap.js
// @ts-nocheck
const slug = require("./slug");
module.exports = function sitemap(titles, footer) {
  return titles.map(title => "/products/" + slug(title)).join("\n")
    + "\n" + footer();
};
```

**Noam**: "No diagnostic there. We haven't asked for one."

Chen runs the files emitted by that failed check, in the scratch build. The route throws `TypeError: slug is not a function`. So does the sitemap, before it reaches its footer callback. The old `require` test fails as well.

**Oded**: "The route error would stop this PR."

**Chen**: "Yes. Now suppose you fixed the route by reading `.default`, as Eden suggested."

**Oded**: "The compiler would be happy. But my old `require` test still fails. This wouldn't merge."

**Chen**: "Unless you change that test to read `.default` too."

**Oded**: "Which is what I did the first time. I updated the test's call and left the real caller behind."

**Noam**: "Now the route and both tests would agree. Nobody updated the sitemap, and its old opt-out wouldn't be a new change for me to review."

**Eden**: "The catalogue team isn't changing its call in this PR. Give it the function it still expects."

**Oded**: "I'd rather leave their footer work alone. Restore `export =`?"

**Eden**: "Restore it, then call the sitemap again."

The route returns its product URL. The sitemap returns that same URL followed by the footer. Both tests pass.

**Noam**: "And no adding an opt-out to a checked caller because the conversion broke it. That would turn the exception list into a way to merge failures."

**Chen**: "We still haven't checked the backfill. It isn't in this compiler run."

He opens the maintenance script. It regenerates URLs for existing products and loads the same slugger.

```javascript
// scripts/backfill.js
const slug = require("../src/slug");
console.log("/products/" + slug(" Green Chair "));
// /products/green-chair
```

**Eden**: "A build script copies it into `dist/scripts`, but the compiler includes `src` and TypeScript tests, not these scripts. None of those files imports it. Add the script to the check and run its emitted call as well."

With the broken default export, including the backfill reports TS2349. With `export =`, it compiles and prints the URL.

**Chen**: "A literal search won't find a loader that puts the filename in a variable."

**Daniel**: "And `require(name)` can give you `any` even in checked JavaScript. Run that call. For the others, inspect the program's file list: imports can bring in files missing from `include`."

**Oded**: "So I'm merging a checking change as well as a typed slugger."

**Noam**: "Yes. The global setting, the annotations and the two new exceptions go with this fix. The money conversion can wait."

Before opening that next PR, Oded tries the money conversion on a separate branch, starting from their repaired build.

**Oded**: "Does everything have to become `export =` now?"

**Eden**: "`price-label.js` already reads a `price` member. Keep that member."

```typescript
// src/money.ts
export function price(cents: number): number {
  return cents / 100;
}
```

The unchanged `price-label.js` passes the global check and still prints `12.5`.

**Noam**: "For that caller, the named export keeps the access it uses. Don't turn this into a rule about every object someone could export."

## The Verdict

**Eden**: "A caller left on the exception list keeps its interface in a conversion PR. Here that's the sitemap, so merge `export =`, both tests and the annotated route, with the checking changes we've just tried. Add the backfill to the compiler's inputs and stop copying it separately. I'll maintain the exception list with its owners. The catalogue team keeps the footer work."

**Noam**: "Strictness stays on. Money stays JavaScript with its parameter annotation until Oded's next PR."

**Oded**: "And the old test stays old on purpose."
