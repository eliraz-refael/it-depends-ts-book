# Chapter 24: Both Tests Were Green

## The Principle

**Daniel Compiler**: "A conversion has two sides. Keep what the existing caller loads, passes and receives, or change and verify that caller with it. That's the contract. Changing the test to use your new import doesn't tell you whether the old call still works."

"And included isn't checked. `allowJs` lets JavaScript into the program. `checkJs`, or `@ts-check` on a file, asks for errors in its body. Until then, that body can run without those diagnostics. On TypeScript 7, the default strictness also exposes untyped parameters. Choose the checking scope without quietly loosening the TypeScript you've already checked."

## The Debate

**Oded Shipley**: "One function. One test. No dependencies. I picked the boring one."

**Eden Legacy**: "The product pages are returning five hundreds."

**Oded**: "It still makes the slug."

**Eden**: "The route can't get far enough to ask it."

Their storefront is eight months into a JavaScript-to-TypeScript migration. Node runs the compiled output. The package explicitly says `"type": "commonjs"`; adopting TypeScript hasn't changed that. The build also copies an older maintenance directory into the output. Chen uses its backfill script to regenerate product URLs.

Eden opens the build configuration. There is no `strict` setting; on their TypeScript 7 compiler, it defaults to true.

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

The existing JavaScript test runs directly against `dist`, after the build. TypeScript tests are compiled with the source; the old JavaScript tests are not in that compiler run.

**Eden**: "Show me the version before your PR. Include the route."

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

Oded runs two checks against the emitted module, in `dist/src`.

```javascript
// inspect.js, run beside the emitted slug.js
console.log(typeof require("./slug"));
// object
console.log(typeof require("./slug").default);
// function
```

The compiler has emitted `exports.default = slug`. The route still tries to call the whole object. Its error is `TypeError: slug is not a function`.

**Oded**: "Then how did my test call it?"

**Daniel**: "Your default import reads the default member. Your route's `require` doesn't."

**Noam**: "The new test correctly checks a call nobody in that route makes."

**Oded**: "I converted the test out of catching the conversion."

He restores the old JavaScript test as `tests/slug.require.test.js`, alongside the new TypeScript test. It still runs directly against the built output. It fails on the first call.

**Oded**: "That stays. I don't want this depending on the next person remembering which kind of import we argued about."

**Eden**: "We can change the route to `require('./slug').default`. That works too. But then we have to change everyone who loads this function. The purpose of this PR was to type the slugger."

**Oded**: "I'd like to finish that PR. What's the export that keeps the route?"

```typescript
// src/slug.ts — preserve the callable export
function slug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}
export = slug;
```

Both tests pass. The route returns `/products/green-chair` again. The emit ends with `module.exports = slug`.

**Oded**: "And my new default import still works?"

**Daniel**: "In this build, yes. So does `import slug = require('./slug')`. The function becoming TypeScript didn't require it to become a default-exported property."

**Noam**: "We repaired the loading call. Why didn't the compiler tell us about the broken one?"

**Oded**: "Because the route is JavaScript."

**Noam**: "It copied the route into the output. It clearly found it."

**Eden**: "Found it, inferred from it, emitted it. We haven't asked it to report the route's body errors."

Noam changes `checkJs` to true and tries the failed default-export version again. The call to `slug(title)` reports TS2349: `This expression is not callable.` The diagnostic says the imported module has no call signatures. The route's untyped `title` also reports TS7006: `Parameter 'title' implicitly has an 'any' type.`

**Noam**: "There. Before deployment. I want this on for JavaScript too."

**Oded**: "You have more errors below it."

Noam expands the parameter errors from two older helpers:

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

**Noam**: "Four implicit-any parameters: the route's title, lookup's id, and both arguments to sum. With the callable export back, those four errors remain."

**Oded**: "I'm not claiming four errors means four weeks. But who is deciding what `sum` accepts? It has string callers as well as numeric ones. I don't want to invent its types to finish a slug change."

**Eden**: "Then don't invent them. We can check the route today. The title is a string; that's what this handler is for."

**Oded**: "Or turn off `noImplicitAny` until the JavaScript is gone."

**Noam**: "That turns it off for the TypeScript in this program too. The next untyped parameter in a converted file becomes acceptable."

**Daniel**: "`strict` is a default here, not a command to ignore your other settings. An explicit false stays false."

**Eden**: "We don't need to lower it. `@ts-check` at the top of the route would check that file under the current strict settings. It would leave the other two alone."

**Noam**: "And the next JavaScript file starts unchecked again. Keep `checkJs` on. Put `@ts-nocheck` on the files we're deliberately leaving. Then I can find the exceptions without opening every configuration and remembering what it excludes."

**Oded**: "Including `sum`, until its owner has looked at both sets of callers."

**Noam**: "Including `sum`. That comment doesn't make its callers safe. It tells us where we stopped."

**Oded**: "Once the comments are there, what makes this better than checking files as we reach them?"

**Noam**: "The next source file is checked without waiting for us to reach it. Keeping it unchecked takes a change someone can see in the PR. I'd rather review that exception than hope the author remembers to opt in."

**Eden**: "And the existing exceptions need a next step. Lookup's owner can confirm its IDs separately. Sum needs its callers examined before we write a contract for it. Neither belongs to the slugger."

Eden records `lookup.js` and `sum.js` on the migration list with their owners. Each gets `// @ts-nocheck`. The global setting stays on.

**Chen Override**: "Before you fix the route's parameter, what does a TypeScript caller think it accepts?"

He tries a call against the compatible slug export and the still-unannotated JavaScript route.

```typescript
// src/caller.ts — before the route's parameter is annotated
import handle = require("./route");
const url: string = handle(42);
```

**Chen**: "No error on that call. It even lets me promise a string."

**Noam**: "The route's parameter is still `any`. Its body complains when we check it, but the caller has no string requirement to violate. Run that and the slugger tries to trim forty-two."

The global check still complains about the route's parameter, though not Chen's call. He runs that call against the last built route. It throws `TypeError: title.trim is not a function`.

**Oded**: "So getting the function out of the module was only the first problem."

**Eden**: "Here is the part we can type without deciding how anyone adds strings."

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

**Oded**: "We didn't rename the route."

**Noam**: "And that TypeScript caller learned something it didn't know from importing JavaScript alone. We had a green typed caller accepting forty-two while the body it called expected a string."

**Oded**: "Then don't count my PR as one converted file and call that the gain. Put the caller check in it too."

**Eden**: "We didn't have to. Its caller has a useful type now. The local `@ts-check` is redundant with our global setting, but it records that we're keeping this file checked."

**Chen**: "And `handle('Green Chair')` still gives the product URL?"

**Eden**: "Both tests and the route call pass. We removed your numeric probe from the build. We didn't fix it with an assertion."

## The Turn

Chen takes the first, broken conversion back out of the diff. He leaves global `checkJs` on, but gives the original route the same legacy opt-out as the two helpers.

```javascript
// src/route.js — the original caller, now opted out
// @ts-nocheck
const slug = require("./slug");
module.exports = function handle(title) {
  return "/products/" + slug(title);
};
```

**Chen**: "Compiler exit zero."

**Oded**: "The old test still fails. It runs against the output; it isn't part of this compiler run."

**Chen**: "Yes. I'm asking what the setting bought us when this caller is on the list."

**Noam**: "I opted out of exactly the check that caught it."

**Eden**: "This is why I want the callers in the conversion review. A checked file can still be called by an unchecked file. We don't get to say 'checkJs is on' and stop looking."

**Noam**: "The default is still better. New source files are checked unless somebody adds the opt-out."

**Eden**: "Keep the default. For a conversion, take its known callers off that list, or keep the interface they already use. Our route gets checked. If some larger caller has to wait, we preserve its loading call, arguments and result. We don't change them and hope its opt-out is harmless."

**Oded**: "That doesn't make the whole route my migration project?"

**Eden**: "Not if you keep its contract. Removing the opt-out might uncover more work than this PR can own. Then keep that work separate and retain the old contract test. Here, one parameter annotation was enough."

**Noam**: "And no adding an opt-out to a checked caller because the conversion broke it. That would turn my list into a way to merge failures."

**Oded**: "Agreed. Mine stays off the list."

**Chen**: "The backfill isn't on either list."

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

**Noam**: "Leaf-first still makes sense. The implementation was small enough to understand. That didn't make its callers disappear."

**Oded**: "I can live with that. I thought you were making me migrate the whole service to fix one export."

**Eden**: "If a caller can't move with you, that is a reason to keep its contract. It isn't a reason to leave the implementation untyped forever."

Oded opens the next leaf on his list. This one exports an object with a `price` member.

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

**Oded**: "I can put the old call in the PR. That's a better instruction than telling me to remember what 'shape' means."

## The Verdict

**Eden**: "Merge the slug conversion with `export =`, both loading tests and the annotated route. Keep global JavaScript checking and strictness. The two deferred helpers have owners; they don't get fixed by changing the default. Before the next conversion, bring its known callers into the check or preserve their contract, and account for entry points the program doesn't discover."

**Noam**: "The exception list comes with us. A converted filename doesn't tell me who can misuse its types."

**Oded**: "And the old test stays old on purpose."
