# Chapter 27: More Work, Less Time

## The Principle

**Daniel Compiler**: "Before you trade a type constraint for speed, measure the saving and say what newly compiles. First say what you're speeding up: checking the program or running it. If you only changed types, compare the emitted code before you time anything. A validator really runs, so it needs its own measurement. Change one thing, and repeat the timing with the same files, workload and options. Otherwise you're celebrating work you stopped doing. Counters aren't seconds. When they don't explain the time, profile the checker."

"List which calls must stay legal and which must stay forbidden, and check both lists. A cheaper signature can still reject the typo, accept a different mistake and break a call that used to work. If you remove a constraint or a validator, name what catches those mistakes instead, or accept the risk. Someone has to own the mistake that now compiles."

## The Debate

**Noam Kiperman**: "Your faster checkout says `Hello A, {count} items`."

**Oded Shipley**: "The *type check* is faster. That's what the title says."

**Noam**: "The customer doesn't get the title."

They're reviewing the shop's translation helper. Noam is reading the output of two deliberately broken calls he wrote against Oded's branch, in `src/probe.ts` below. Oded's PR accepts string keys and an optional dictionary of substitutions. His generated checking workload finishes sooner. The lookup and replacement code hasn't changed.

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

**Noam**: "I left out count. This is what the banner would show. I tried a typo too."

```typescript
// src/probe.ts — temporary calls against the PR
import { t } from "./i18n.js";
console.log(t("shop.crat", { name: "A", count: "2" }));
console.log(t("shop.cart", { name: "A" }));
```

Gil emits with `tsc -p tsconfig.json --checkers 1 --noEmit false --rootDir src --outDir dist --removeComments true`, using the shared options below. On Node 22.23.4, `node dist/probe.js` prints `shop.crat`, then `Hello A, {count} items`.

**Oded**: "Yes. I removed those checks. I'm not arguing that misspelling cart is a feature. I'm asking whether we need to compute the parameters from every message while checking every caller."

**Noam**: "That missing count was caught at the call before your edit. If this gets into the banner, somebody has to notice it there."

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

Both probe calls get TS2345. So does the banner's `t(pending[0], pending[1])`, which Oded expanded because `t(...pending)` gets TS2556 under his loose signature. The typo message ends by comparing `shop.crat` with `shop.hello`.

**Oded**: "It would be nice if the error suggested cart."

**Linoy**: "Agreed. But it won't let you send crat."

They remove the probe. Linoy restores the banner's `t(...pending)`.

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

**Gil**: "I saved the emit from Oded's branch, with his expanded banner call. Now I'll emit this restored version and compare `dist/i18n.js`. Same options both times. The root package has `"type": "module"`."

**Gil**: "Same 387 bytes."

**Oded**: "I did say type check."

**Noam**: "I'm keeping that number for when somebody changes the PR title."

**Daniel**: "These declarations erase. The lookup still runs, including its fallback. Removing a runtime validator would be a different edit."

### "Which part?"

**Gil**: "TypeScript 7.0.2. One checker, these options."

**tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true, "exactOptionalPropertyTypes": true,
    "target": "ES2022", "module": "Node16", "moduleResolution": "Node16",
    "types": [], "skipLibCheck": true, "noEmitOnError": true, "noEmit": true
  },
  "include": ["src"]
}
```

**Oded**: "Synthetic catalogue: two thousand keys, two thousand calls."

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

`bench/case.ts` contains the catalogue as `const messages = … as const;` on one line, required helpers, the signature with `declare`, calls and `export {};`. Its config, `bench/tsconfig.json`, is `{"extends":"../tsconfig.json","files":["case.ts"],"include":[]}`.

**Gil**: "Add `--extendedDiagnostics` to `tsc -p bench/tsconfig.json --checkers 1`: three runs, serially, rotating order, no tracing or profiling while timing. These are medians."

Gil lays out four alternatives, one at a time, with only the helpers each needs. The string baseline doesn't compute Key; the last row uses Linoy's Args above.

```typescript
// Counterfactual signatures — alternatives, not overloads
// string; no type helpers
function t(key: string, params?: Record<string, string>): string;
// Key; loose optional params
function t(key: Key, params?: Record<string, string>): string;
// Tuple union; loose optional params
type Args = { [K in Key]: [key: K, params?: Record<string, string>] }[Key];
function t(...args: Args): string;
// Linoy's per-key tuples
function t(...args: Args): string;
```

| Counterfactual | Instantiations | Median check time |
|---|---:|---:|
| string; no type helpers | 6 | 0.006s |
| Key; loose optional params | 13,189 | 0.016s |
| Tuple union; loose optional params | 39,641 | 1.013s |
| Linoy's per-key tuples | 118,255 | 1.481s |

**Noam**: "But only two hundred distinct keys called."

**Gil**: "Yes. Change that and it's another experiment. Stop moving the furniture."

**Oded**: "So the difference I measured exists."

**Gil**: "It does. We added key enumeration, then changed the call formulation, then restored dependent params. Those are whole-version comparisons, not charges we can add up into a bill. Now we can ask for a smaller change."

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

**Gil**: "87,431 instantiations, a 0.095s median. Faster than Linoy's original. The calls in that fixture are literals."

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

The full project gets TS2556 at the unchanged banner's tuple spread. They give the probe a separate file list: `probe.json` extends the root config, with `files: ["src/i18n.ts", "src/probe.ts"]` and `include: []`. Checking and emitting with `-p probe.json` succeeds. Running `node dist/probe.js` prints `Hello A, {count} items`.

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

**Oded**: "It accepts the working caller and rejects the broken one. I can defend that in a review. Run the big one."

## The Turn

**Gil**: "Same session as the first table. I'm reusing Linoy's row."

| Signature | Instantiations | Median check time |
|---|---:|---:|
| Linoy's per-key tuples | 118,255 | 1.481s |
| Distributed whole tuple | 118,628 | 0.255s |

**Noam**: "More instantiations."

**Oded**: "Please tell me we're not rejecting the faster one for doing more work."

**Gil**: "On these runs, the new check took less than a fifth of the old time. Instantiations count one kind of work. The elapsed check includes more than that."

**Noam**: "So where was the time going before?"

**Linoy**: "I'll put my original signature back and try `tsc -p bench/tsconfig.json --checkers 1 --generateTrace trace`."

She follows a relation event's checker ID through `legend.json` to its type file. Args resolves to two thousand tuples. Expression events point at generated calls.

**Linoy**: "There's Args. My guess is we're spending the time relating arguments to that union."

**Gil**: "About 0.2 seconds in the recorded check events, against about 1.6 for checking the file. Finding Args isn't finding the cost."

**Linoy**: "Then CPU samples. `tsc -p bench/tsconfig.json --checkers 1 --pprofDir profile`. With a Go toolchain installed, `go tool pprof -top -cum profile/*-cpuprofile.pb.gz`."

The cumulative profile puts a large share of samples under [mapTypeEx](https://github.com/microsoft/typescript-go/blob/2bd066d87f5bafd315be9f40889d0a60b9e58e0b/internal/checker/checker.go#L25473-L25508). Linoy uses `-peek mapTypeEx` to inspect its callers and callees: contextual typing above it, union construction below.

**Daniel**: "That function walks a union's members, applies an operation and, when the results change, builds a union from them. That's 7.0.2's checker. Don't build on the name."

**Linoy**: "So I found Args and blamed the relation. This points to walking and rebuilding unions while working out the types expected for the arguments. My guess was too narrow."

**Oded**: "Two thousand comparisons every call?"

**Gil**: "Samples can't tell you that. They locate work; they don't count every visit or identify every union."

Linoy switches the fixture to the distributed signature and profiles it into a fresh directory. The time sampled under the same function drops sharply.

**Daniel**: "For these literal-key calls, inference gives K one key, so the checker gets one tuple to type the arguments against instead of the entire catalogue. That removes the broad union work we just saw dominating the old profile."

**Noam**: "I was going to ask why the number got bigger. I still want that in the result."

**Gil**: "It stays. So do the times. Someone comparing the next version should have both."

Oded reruns the small banner: `Hello A, 2 items` when it has items, `Hello A` otherwise, and `Ready` for the placeholder-free call.

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
