# Chapter 24: Both Tests Were Green

## The Principle

**Daniel Compiler**: "A migration changes an implementation while its callers are still using it. Keep their contract—what they load, pass and receive—or change and verify the callers too. If they load a function with `require('./slug')`, a test rewritten to use a default import doesn't check that old call."

"With `allowJs`, the compiler can emit a JavaScript caller without checking the call inside it. Ask for JavaScript errors with `checkJs` or `@ts-check`. A caller this run doesn't check supplies no compiler evidence. Keep its contract or run it. TypeScript 7's default strictness can expose untyped parameters when you start checking JavaScript. Don't silence those by switching `noImplicitAny` off for the whole program, including the TypeScript."

## The Debate

**Oded Shipley**: "One function. One test. No dependencies. I picked the boring one."

**Eden Legacy**: "The product pages are returning 500s."

**Oded**: "It still makes the slug."

**Eden**: "The route can't get far enough to ask it."

Eden opens the storefront's build configuration. They are eight months into the migration.

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

**Eden**: "We can change the route to `require('./slug').default`. That works too. But then we have to change everyone who loads this function. You were adding types to the slugger, not changing its callers."

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

**Daniel**: "In this build, yes. From the test, `import slug = require('../src/slug')` works too. The function becoming TypeScript didn't require it to become a default-exported property."

**Noam**: "We repaired the loading call. Why didn't the compiler tell us about the broken one?"

**Oded**: "Because the route is JavaScript."

**Noam**: "It copied the route into the output. It clearly found it."

**Eden**: "Found it, inferred from it, emitted it. We haven't asked it to report the route's body errors."

Noam changes `checkJs` to true and tries the failed default-export version again. The call to `slug(title)` reports TS2349: `This expression is not callable.` The diagnostic says the imported module has no call signatures. The route's untyped `title` also reports TS7006: `Parameter 'title' implicitly has an 'any' type.`

**Noam**: "There. Before deployment. I want this on for JavaScript too."

**Oded**: "You have more errors below it."

Noam opens the two older helpers named in the errors:

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

Eden records `lookup.js` and `sum.js` on the migration list with their owners. Each gets `// @ts-nocheck`. Oded adds `/** @param {number} cents */` above `price` in `money.js`.

**Eden**: "The sitemap is already on the exception list. The catalogue team left it opted out while they replace its footer callback. Their PR owns that work."

```javascript
// src/sitemap.js
// @ts-nocheck
const slug = require("./slug");
module.exports = function sitemap(titles, footer) {
  return titles.map(title => "/products/" + slug(title)).join("\n")
    + "\n" + footer();
};
```

**Noam**: "That's why it didn't add parameter errors to my five. The count says nothing about the files we're not checking."

Eden links the catalogue team's work beside the two new exceptions. Global `checkJs` stays on.

**Chen**: "One probe before you annotate the route. Does a TypeScript caller know title has to be a string?"

```typescript
// src/caller.ts — before the route's parameter is annotated
import handle = require("./route");
const url: string = handle(42);
```

**Noam**: "It accepts that call. The route still has an implicit-any error, but its caller has no string requirement to violate."

**Eden**: "Let's give it one."

```javascript
// src/route.js
// @ts-check
const slug = require("./slug");
/** @param {string} title */
module.exports = function handle(title) {
  return "/products/" + slug(title);
};
```

The same `handle(42)` now reports TS2345: `Argument of type 'number' is not assignable to parameter of type 'string'.`

**Oded**: "A useful type for its caller, and the route is still JavaScript."

**Eden**: "Yes. The local `@ts-check` is redundant with our global setting. I'm leaving it to mark this file as checked."

Chen removes the probe. Both loading tests and `handle('Green Chair')` pass. The compiler is green too.

## The Turn

**Chen**: "Would this setup have caught Oded's original PR? Put the default export back for a minute. This is an experiment, not the version we're merging."

Oded restores `export default` on the slugger in a scratch branch. The route stays checked. The sitemap keeps the opt-out it had before this PR.

**Noam**: "TS2349 at the route. The check caught it."

**Chen**: "And the sitemap?"

**Noam**: "No diagnostic there. We haven't asked for one."

Chen runs the files emitted by that failed check, in the scratch build. The route throws `TypeError: slug is not a function`. So does the sitemap, before it reaches its footer callback. The old loading test fails as well.

**Oded**: "The route error would stop this PR."

**Chen**: "Yes. Now suppose you fixed the route by reading `.default`, as Eden suggested."

**Oded**: "The compiler would be happy. The sitemap would still try to call the object."

**Noam**: "And its old opt-out wouldn't be a new change for me to review. My default catches the route. It doesn't account for this other caller."

**Eden**: "Keep global checking. In a conversion PR, take each known caller off the exception list or keep the interface it uses. Our route can be checked today. The sitemap needs the callable export until its team moves it."

**Oded**: "I'd rather leave their footer work alone. Restore `export =`?"

**Eden**: "Restore it, then call the sitemap again."

The route returns its product URL. The sitemap returns that same URL followed by the footer. Both loading tests pass.

**Noam**: "And no adding an opt-out to a checked caller because the conversion broke it. That would turn my list into a way to merge failures."

**Oded**: "The route stays checked. The sitemap keeps its existing comment and its existing call."

**Chen**: "We still haven't checked the backfill. It isn't in this compiler run."

He opens the maintenance script. It regenerates URLs for existing products and loads the same slugger.

```javascript
// scripts/backfill.js
const slug = require("../src/slug");
console.log("/products/" + slug(" Green Chair "));
// /products/green-chair
```

**Eden**: "The build copies it, but the compiler includes `src` and TypeScript tests, not these scripts. None of those files imports it. Add the script to the check and run its emitted call as well."

With the broken default export, including the backfill reports TS2349. With `export =`, it compiles and prints the URL.

**Chen**: "So importing the slugger doesn't tell the compiler who else imports the slugger."

**Daniel**: "Correct. And a filename missing from `include` isn't proof that it stayed out. Another file can import it in. This script really was outside the program."

**Noam**: "Search the loading calls, then check what the run actually includes."

**Chen**: "A literal search won't find a loader that puts the filename in a variable."

**Daniel**: "And `require(name)` can give you `any` even in checked JavaScript. A checked file doesn't mean every call in it is constrained. Run that loading path or keep what it expects."

**Oded**: "Our backfill is a literal call. We've found it, checked it and run it. Can I have my one-function PR back?"

**Eden**: "Yes. Keep its scope. I don't want an export-style cleanup hidden in the next one either."

Oded returns to `money.js`, with its newly annotated `cents` parameter.

**Oded**: "Does everything have to become `export =` now?"

**Eden**: "That caller gets a member already. Keep that member."

```typescript
// src/money.ts
export function price(cents: number): number {
  return cents / 100;
}
```

The unchanged `price-label.js` passes the global check and still prints `12.5`.

**Noam**: "For that caller, the named export keeps the access it uses. Don't turn this into a rule about every object someone could export."

**Oded**: "Then that label is the call I keep when I convert money."

## The Verdict

**Eden**: "Merge `export =`, both loading tests and the annotated route. Add the backfill to the check and the build, so copying it isn't how it reaches `dist` any more. I'll keep the exception list with its owners. The catalogue team keeps the sitemap until its footer work is done."

**Noam**: "Global `checkJs` and strictness stay on. Leave the money conversion for its own PR. Its parameter annotation can stay in this one."

**Oded**: "And the old test stays old on purpose."
