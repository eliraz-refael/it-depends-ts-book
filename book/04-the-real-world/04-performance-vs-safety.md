# Chapter 27: More Work, Less Time

## The Principle

**Daniel Compiler**: "Name what you're trying to make faster: checking the program, editing it, building it or running it. Those are different measurements. Compare the same workload and configuration with one suspected part changed, and measure the time repeatedly. Otherwise you may be celebrating work you stopped doing. Compiler counters help describe that work; they aren't a price list in seconds. Use a trace to find where the checker spends its time."

"Write down which calls must remain legal and which combinations must remain forbidden. Rejecting the same typo doesn't establish that a cheaper signature preserves those relationships. Compare the emitted code before blaming an erased annotation for runtime work. If you do remove a check, show the measured benefit, what newly gets through, and what catches it instead—or which risk you're accepting. Someone has to own the mistake that now compiles."

## The Debate

**Noam Kiperman**: "Your faster checkout says `Hello A, {count} items`."

**Oded Shipley**: "The *type check* is faster. That's what the title says."

**Noam**: "The customer doesn't get the title."

They're reviewing a translation helper in a fictional shop. Noam has opened the customer-banner preview against Oded's branch. Oded's PR replaces its public signature with string keys and an optional dictionary of substitutions. His generated checking workload finishes sooner. The lookup and replacement code hasn't changed.

```typescript
// src/i18n.ts — Oded's PR
const messages = { shop: { cart: "Hello {name}, {count} items", hello: "Hello {name}", ready: "Ready" } } as const;

function t(key: string, params?: Record<string, string>): string;
function t(key: string, params: Record<string, string> = {}): string {
  let value: any = messages;
  for (const part of key.split(".")) value = value?.[part];
  if (typeof value !== "string") return key;
  return value.replace(/\{([^}]+)\}/g, (token: string, name: string) => params[name] ?? token);
}
export { t };
```

**Noam**: "The fallback is showing the customer what we forgot to pass. And this compiles too."

```typescript
// src/probe.ts — temporary calls against the PR
import { t } from "./i18n.js";
console.log(t("shop.crat", { name: "A", count: "2" }));
console.log(t("shop.cart", { name: "A" }));
```

On Node 22.23.4, `node dist/probe.js` prints `shop.crat`, then `Hello A, {count} items`.

**Oded**: "Yes. I removed those checks. I'm not arguing that misspelling cart is a feature. I'm asking whether we need to compute the parameters from every message while checking every caller."

**Noam**: "That missing count was caught at the call before your edit. Now somebody has to notice it in a banner."

**Gil Benchmark**: "Before you price either option, show me what you removed."

### "It bought something"

**Linoy Nightly** restores her declarations after `messages`, replacing Oded's public signature. The implementation below it stays.

```typescript
// src/i18n.ts — restore the helpers and original public signature
type Paths<T> = T extends string ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];
type At<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T ? At<T[H], R> : never
  : P extends keyof T ? T[P] : never;
type Params<S> = S extends `${string}{${infer P}}${infer R}`
  ? { [K in P]: string } & Params<R> : {};
type Key = Paths<typeof messages>;
type Args = {
  [K in Key]: keyof Params<At<typeof messages, K>> extends never
    ? [key: K]
    : [key: K, params: Params<At<typeof messages, K>>]
}[Key];
function t(...args: Args): string;
```

**Linoy**: "Paths gives us `shop.cart`. At looks up its message. Params pulls out name and count. Args keeps each key with its own arguments. Ready has no placeholders, so it needs no second argument."

**Oded**: "I remember why you wrote it. I also remember when there were three messages."

**Linoy**: "Then measure the larger catalogue. Don't remove the feature and tell me the feature was implemented badly."

Both calls in the probe now get TS2345. The typo message ends by comparing `shop.crat` with `shop.hello`.

**Oded**: "It would be nice if the error suggested cart."

**Linoy**: "Agreed. But it won't let you send crat."

They remove the temporary probe and restore the banner's `t(...pending)` call. Oded had expanded it to `t(pending[0], pending[1])` to fit the loose signature. Linoy opens the original deferred-call code:

```typescript
// src/banner.ts
import { t } from "./i18n.js";
export function banner(hasItems: boolean): string {
  const pending: ["shop.cart", { name: string; count: string }]
    | ["shop.hello", { name: string }] = hasItems
      ? ["shop.cart", { name: "A", count: "2" }]
      : ["shop.hello", { name: "A" }];
  return t(...pending);
}
export const ready = t("shop.ready");
```

**Linoy**: "The banner chooses the whole call, then passes it on. Both branches work. Keep that, and keep ready without an empty object just to satisfy the helper."

**Gil** emits `src/i18n.ts` with her declarations, then with Oded's signature and the unused helpers removed. The root package has `"type": "module"`. Both runs use the same ES2022/Node16 options, with comments and source maps absent. He compares the JavaScript bytes.

**Gil**: "Same 387 bytes."

**Oded**: "I did say type check."

**Noam**: "I'm keeping that number for when somebody changes the PR title."

**Daniel**: "These declarations erase. The lookup still runs, including its fallback. Removing a runtime validator would be a different edit."

### "Which part?"

Gil opens the options used for both checking and emitting their small repository. The ordinary check is `tsc -p tsconfig.json --checkers 1`; for emission he adds `--noEmit false --rootDir src --outDir dist --removeComments true`.

**tsconfig.json**

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
    "noEmit": true
  },
  "include": ["src"]
}
```

**Gil**: "TypeScript 7.0.2. One checker. These options. Keep them attached to the numbers. Changing the libraries or the number of checkers changes what we're counting."

**Oded**: "And the workload is attached. I generated it."

The generator cycles through three message shapes. It makes forty sections of fifty keys, then two thousand calls. Call i uses section `i % 40` and key `i % 50`, so the calls cycle over two hundred distinct keys. All the generated calls are valid. This is a synthetic checking fixture, not a measurement of a real shop's build.

```javascript
// tools/workload.mjs
export function workload() {
  const texts = ["Hello {name}, {count} items", "Hello {name}", "Ready"];
  const messages = {};
  for (let s = 0; s < 40; s++) {
    const section = messages[`s${s}`] = {};
    for (let k = 0; k < 50; k++) section[`k${k}`] = `${texts[k % 3]} in s${s}`;
  }
  const calls = Array.from({ length: 2000 }, (_, i) => {
    const k = i % 50;
    const params = k % 3 === 0 ? ', { name: "A", count: "2" }'
      : k % 3 === 1 ? ', { name: "A" }' : '';
    return `t("s${i % 40}.k${k}"${params});`;
  });
  return { messages, calls };
}
```

**Noam**: "Two hundred keys used, two thousand available. That matters for a type that builds something for every key."

**Gil**: "Yes. We're keeping both counts."

**Oded**: "Does that cover every way someone might call this?"

**Gil**: "No. It gives us a repeatable workload. Changing the catalogue, the number of calls or which keys they use is another experiment. We can run those next. For this comparison, stop moving the furniture."

For each comparison, `bench/case.ts` contains the generated catalogue as a single `const messages = … as const;` declaration, the selected helpers and signature, then the generated calls and `export {};`. The signature is ambient there: `declare function t`. Each version keeps only the helpers its signature needs. This file measures checking; it isn't a runnable translator. It uses a separate file list and inherits the same options:

**bench/tsconfig.json**

```json
{
  "extends": "../tsconfig.json",
  "files": ["case.ts"],
  "include": []
}
```

**Gil**: "`tsc -p bench/tsconfig.json --checkers 1 --extendedDiagnostics`. Three runs per version, serially, rotating the order. No trace while timing. These are the medians from this fixture on this machine."

He changes one part at a time. First Oded's string signature, with no unused Key computation left behind. Then Key with loose optional params. Then one tuple per key, still with loose optional params. Finally Linoy's original optional tuples with their dependent params.

| Counterfactual | Instantiations | Median check time |
|---|---:|---:|
| string; no type helpers | 6 | 0.005s |
| Key; loose params | 13,189 | 0.016s |
| Tuple union; loose params | 39,641 | 1.055s |
| Original optional tuples | 118,255 | 1.664s |

**Oded**: "So the difference I measured exists."

**Gil**: "It does. Now we can ask for a smaller change. Key enumeration adds work to the first version. The loose tuple version keeps that enumeration and changes how calls are related. Putting dependent params back changes it again. These are comparisons of whole versions, not charges we can add up into a bill."

**Linoy**: "The loose tuple still has a tuple for every key, even though its params no longer depend on the key. That's work the common dictionary signature doesn't need."

**Noam**: "But the dictionary signature allows the missing count."

**Linoy**: "I know. I want the relationship without constructing the public call type that way."

### "This one already has a caller"

Linoy tries a generic in the small repository, replacing Args and the public signature while keeping Paths, At, Params and Key:

```typescript
// src/i18n.ts — candidate public signature
function t<K extends Key>(
  key: K,
  ...params: keyof Params<At<typeof messages, K>> extends never
    ? [] : [Params<At<typeof messages, K>>]
): string;
```

**Linoy**: "Infer the key at the call. Work out its parameters. No params for ready."

**Oded**: "And the two thousand calls?"

**Gil**: "This version checks faster in that fixture too. The calls there are literals."

**Noam**: "This one isn't."

He takes the banner selection out of the pending tuple:

```typescript
// src/probe.ts — try a separately selected key
import { t } from "./i18n.js";
function messageFor(hasItems: boolean): "shop.cart" | "shop.hello" {
  return hasItems ? "shop.cart" : "shop.hello";
}
console.log(t(messageFor(true), { name: "A" }));
```

They check and emit this probe on its own. It compiles and prints `Hello A, {count} items`. The unchanged banner file, checked separately, gets TS2556 at its tuple spread.

**Noam**: "It lets my broken replacement through and rejects the caller I already had."

**Linoy** reads the generic again. "The key can be either message. The params can fit either message. I separated them."

**Oded**: "We did this with event payloads."

**Noam**: "And the customer still doesn't get count. I'm not buying that bug twice."

**Linoy**: "Fine. Keep the whole call together."

```typescript
// src/i18n.ts — replace the candidate public signature
function t<K extends Key>(
  ...args: K extends Key
    ? (keyof Params<At<typeof messages, K>> extends never
        ? [key: K]
        : [key: K, params: Params<At<typeof messages, K>>])
    : never
): string;
```

**Linoy**: "Now a union key distributes into whole tuples. Each key keeps its params—or its lack of them."

Noam's separate-key probe gets TS2345. The original pending-tuple banner compiles again. They remove the probe and check the ordinary cart, hello and ready calls, plus their typo, missing count, wrong count type and extra-argument controls. The allowed calls still work; the mistakes still fail. Emitting the translator gives the same bytes again.

**Oded**: "I can live with the second question mark if it saves me the first apology. Run the big one."

## The Turn

Gil substitutes the distributed signature into the same generated fixture. He runs the old and new versions three times each, alternating which goes first, again without tracing.

| Signature | Instantiations | Median check time |
|---|---:|---:|
| Original optional tuples | 118,255 | 1.922s |
| Distributed whole tuple | 118,628 | 0.262s |

**Noam**: "More instantiations."

**Oded**: "Please tell me we're not rejecting the faster one for doing more work."

**Gil**: "On these runs, the new check took less than a fifth of the old time. Instantiations count one kind of work. The elapsed check includes more than that."

**Noam**: "So where was the time going before?"

Linoy restores the original signature in the benchmark and runs `tsc -p bench/tsconfig.json --checkers 1 --generateTrace trace`. She opens `trace.json` and follows a relation event's checker ID through `legend.json` to its type file. The target type ID resolves to Args: the union of two thousand tuples. Expression events locate work at the generated calls.

**Linoy**: "Here. Relating the arguments to Args. Creating types isn't the only thing the checker does with them."

**Oded**: "Two thousand comparisons every time?"

**Gil**: "This trace doesn't say that. It's sampled, and some events contain other events. We can identify the relation being checked without inventing a comparison count."

**Daniel**: "The counter didn't promise to count everything expensive. We supplied that interpretation."

**Noam**: "I was going to ask why the number got bigger. I still want that in the result."

**Gil**: "It stays. So do the times. Someone comparing the next version should have both."

Linoy restores the distributed signature in the fixture. Oded reruns the small banner: `Hello A, 2 items` when it has items, `Hello A` otherwise, and `Ready` for the placeholder-free call.

**Oded**: "Count made it all the way to the customer this time."

## The Verdict

**Oded**: "I'll replace the PR with the distributed tuple. Same body. Keys, placeholders and argument counts stay checked. The pending banner doesn't need rewriting."

**Linoy**: "Keep the fixture and the caller cases with it. If I change the signature again, I want to know whether I've made those callers cheaper or merely made some of them wrong."

**Oded**: "I still don't want to pay for this in every helper we write."

**Linoy**: "Then don't copy it into every helper. This one has callers that need different arguments. You brought a cost we could reduce without asking them to give that up."

**Gil**: "Keep the counters pinned to this compiler and configuration. Record the times when the check runs, but don't make a passing build depend on beating these medians. These are measurements, not a service guarantee from the machine."

**Noam**: "And if we really do have to remove a check later, say which call starts passing and who catches that mistake. If nobody does, say we're accepting it. Don't put 'equivalent' in the title."

**Oded** changes the title to “Check translation calls faster without loosening their arguments.”

**Noam**: "That's accurate."

**Oded**: "Good. I'd hate to spend the saved time naming this PR."
