# Chapter 13: Who Loaded It?

## The Principle

**Oded Shipley**: "The badges print. This is the PR that gets rid of the red underline."

**Gilad Stacktrace**: "Show me one printing."

The registration desk prints name badges through `label-kit`, a JavaScript package. Its core makes a plain label. A separate plugin adds a frame around the name. The frame is just text, so they can inspect the whole result without a printer.

Dima opens the core package's declaration file beside its JavaScript. The `.d.ts` file describes the API the JavaScript already provides:

```typescript
// label-kit/index.d.ts
export class Label {
  constructor(text: string);
  text: string;
  render(): string;
}

export const version: string;
```

**Gilad**: "Here is the constructor TypeScript sees. `index.js` is what we run."

```typescript
import { Label } from "label-kit";

const label = new Label("Ada");
console.log(label.render()); // "Ada"
```

The `label-kit/frame` plugin adds `frame` to `Label.prototype` when it loads. Calling `frame("*")` turns the label's text into `* Ada *` and returns the same label, so callers can keep chaining. The plugin's published declarations don't include that method yet. The web app already loads its JavaScript.

Oded's patch supplies the missing description:

```typescript
// label-frame.d.ts
import "label-kit";

declare module "label-kit" {
  interface Label {
    frame(marker: string): this;
  }
}
```

**Oded**: "That's the whole patch. `frame` exists. We're telling TypeScript where."

**Idan Greenfield**: "Where is every `Label`? Or where is the one you just printed?"

**Oded**: "The plugin patches the prototype. It works on labels created before it loaded too."

**Gilad**: "In that process. A declaration tells the compiler what to expect. For this one, the expectation depends on which JavaScript has run."

## The Debate

### The other way in

**Oded**: "The import makes this file a module. So `declare module` patches the package we imported. `Label` is a class, but the interface merges with its instance type. We still have one constructor."

The [module augmentation rules](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) resolve the name like an import. Once the augmentation is in the compiler's program, other files using that `Label` see the added member too.

**Chen Override**: "Even a file that doesn't import this patch?"

**Dima Bridge**: "If the patch is included in the same program, yes."

Oded has already moved badge formatting into a shared function. The web app uses it now; a new batch entry will use it to reprint badges after registration closes.

```typescript
// badge.ts
import type { Label } from "label-kit";

export function renderBadge(label: Label): string {
  return label.frame("*").render();
}
```

The two entry points are in the same TypeScript project. Its configuration includes both of them, the shared function, and `label-frame.d.ts`.

```typescript
// web.ts
import "label-kit/frame";
import { Label } from "label-kit";
import { renderBadge } from "./badge";

console.log(renderBadge(new Label("Ada"))); // "* Ada *"
```

```typescript
// batch.ts
import { Label } from "label-kit";
import { renderBadge } from "./badge";

console.log(renderBadge(new Label("Ada")));
```

**Oded**: "Both pass the build. The test imports the web setup before it checks badge formatting. That passes too."

Chen runs the batch entry on its own.

```text
TypeError: label.frame is not a function
```

**Gilad**: "Show me the stack trace."

**Chen**: "First line in `renderBadge`. The batch never loads the plugin."

**Oded**: "Then put the import in the batch."

**Idan**: "That fixes this batch. Will the next entry know the type depends on an import in a different file?"

**Oded**: "It won't need to. We'll put the import with the thing everyone imports."

He replaces the separate declaration patch with an integration module. It loads the plugin and exports the constructor. The old `label-frame.d.ts` is removed.

```typescript
// labels.ts
import "label-kit/frame";
import { Label } from "label-kit";

declare module "label-kit" {
  interface Label {
    frame(marker: string): this;
  }
}

export { Label };
```

**Oded**: "Both entries get `Label` from here. Importing the constructor loads the plugin first. Nobody needs to remember a second import."

**Idan**: "The old declaration file had an import too."

**Gilad**: "That file produces no JavaScript. The import is for the compiler. Open `labels.js`: the plugin import is there. That one will run."

Both entry points now use the same code:

```typescript
import { Label } from "./labels";
import { renderBadge } from "./badge";

console.log(renderBadge(new Label("Ada"))); // "* Ada *"
```

Gilad runs each in a fresh process. Both print the framed name.

**Gilad**: "Keep those tests separate. The first entry loading the plugin would repair the second entry's test for it."

**Oded**: "Fine. Two runs. Can we merge twelve lines now?"

**Chen**: "You're past twelve. And can the next entry still import the original constructor?"

### A smaller program

**Dima**: "We could check each entry separately. That would at least catch a caller with no path to the augmentation."

With just this file and its imports in the program, the compiler objects:

```typescript
// isolated.ts — checked without labels.ts or label-frame.d.ts
import { Label } from "label-kit";

new Label("Ada").frame("*"); // Error TS2339: Property 'frame' does not exist on type 'Label'.
```

**Oded**: "Good. If they go around the integration module, the build tells them."

**Chen**: "Try the entry that calls our formatter."

## The Turn

The shared formatter takes a label rather than constructing one. Dima changes its type import to the integration module, matching the imports they want application code to use:

```typescript
// badge.ts — replacement
import type { Label } from "./labels";

export function renderBadge(label: Label): string {
  return label.frame("*").render();
}
```

Chen restores the batch's original constructor import and checks only the batch and its dependencies:

```typescript
// batch.ts — bypassing the integration module again
import { Label } from "label-kit";
import { renderBadge } from "./badge";

console.log(renderBadge(new Label("Ada"))); // Accepted by the compiler.
```

The build passes. In a fresh process, the same `TypeError` returns.

**Oded**: "But this imports `badge`, and `badge` imports `labels`."

**Idan**: "Its type. Look at the emitted formatter."

There is no import of `labels` in it. The type-only import brought `labels.ts`, including its augmentation, into the compiler's program. It didn't make the process execute that file. The plugin's side-effect import is still in the emitted `labels.js`; nothing on this execution path loads it.

**Dima**: "My smaller build caught the direct call. It can't catch this one. The type import is enough to make the method visible."

**Oded**: "The integration module still works when they use its constructor."

**Chen**: "It does. The types don't enforce that choice."

**Oded**: "Then restrict imports of the raw package. We do that for database connections."

**Idan**: "We can. But we wrote this declaration ourselves. Why does it say every label has `frame` when we've just passed it one that doesn't?"

### A declaration they can keep

Idan changes the member in `labels.ts`. This replaces the required member; they aren't merging both spellings.

```typescript
// Replacement augmentation in labels.ts.
declare module "label-kit" {
  interface Label {
    frame?(marker: string): this;
  }
}
```

**Oded**: "Now the working web entry needs a check too. Even though it loads the plugin."

**Idan**: "The shared function needs one. Both entries already call it."

```typescript
// badge.ts — replacement with the optional augmentation
import type { Label } from "./labels";

export function renderBadge(label: Label): string {
  if (typeof label.frame !== "function") {
    throw new Error("Badge framing plugin was not loaded");
  }
  return label.frame("*").render();
}
```

**Oded**: "That's still a failed batch."

**Idan**: "Yes. Keep your runtime import. The declaration wasn't going to load it, required or optional."

Dima leaves both entry points importing the constructor from `./labels`. The web and batch runs still print `* Ada *`. With the optional declaration, removing the check from `renderBadge` produces `TS2722: Cannot invoke an object which is possibly 'undefined'.` Bypassing the integration module still compiles, but now the checked formatter reports the missing plugin explicitly.

**Gilad**: "And nothing gets sent to the printer on that path. Don't turn the check into optional chaining and quietly print a different badge."

**Oded**: "I wasn't proposing a blank badge. I don't want everyone unpacking an optional method after every call."

**Idan**: "Neither do I. This check lets us call `frame` and then `render`. Another `frame` in the chain would need another check, or a narrower label type from a checked factory. We have one call."

**Dima**: "If all construction really goes through the integration module, the required declaration can describe that application. Restricting raw imports and testing each entry is a way to maintain it. It isn't something the augmentation proves."

**Oded**: "I would use that version for an app with a lot of plugin calls."

**Idan**: "I'd want to see where its labels come from. Here you showed me two entry points and one place that calls `frame`. This check is enough."

Oded leaves the optional member in the diff.

## The Verdict

**Dima**: "Keep the augmentation. Keep it optional, and keep the check in `renderBadge`. Both entries import the constructor through `labels`, so they actually get the plugin. The type also accounts for a label that arrives without it."

**Oded**: "And test that both entries print a badge. A nicer error message isn't the feature."

Gilad adds the standalone batch run beside the web run. Neither test imports the other's setup.

## Additional Takes

### "Why did the package lose an export?"

**Oded**: "I did try putting the patch in a smaller file first. Then TypeScript said the package had no `version`."

```typescript
// wrong-patch.d.ts — no top-level import or export
// This replaces the module augmentation for this experiment.
declare module "label-kit" {
  interface Label {
    frame(marker: string): this;
  }
}

// check-version.ts — a separate file
import { version } from "label-kit"; // Error TS2305: Module '"label-kit"' has no exported member 'version'.
console.log(version);
```

**Chen**: "Put the import back. Without it, that file supplies an ambient module declaration named `label-kit`. Its description has no `version`. With the import, it augments the existing package."

The distinction depends on the containing file, as the [module reference explains](https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules). An ambient declaration is useful when describing a module that has no types. Giving it the name of a typed package is not a shortcut for extending that package.

**Oded**: "`export {}` fixed it too."

**Chen**: "It also makes the file a module. The package import says which dependency you're patching."

### "The host puts it on window"

The registration page can also run inside an event host. Before loading the app, that host writes a small configuration object onto `window`. The standalone preview doesn't have it.

```typescript
// host.d.ts
export {};

declare global {
  interface Window {
    BADGE_HOST?: { prefix: string };
  }
}
```

**Idan**: "This says the host may supply it. It doesn't tell the standalone preview that a host exists."

```typescript
const prefix = window.BADGE_HOST?.prefix ?? "";
console.log(prefix);
```

**Idan**: "That `Window` has to be the global one. With `export {}` making this file a module, an ordinary interface declaration would be local. `declare global` is how we reach out. The host still supplies the value."

**Gilad**: "Here the empty prefix is allowed. The missing frame wasn't. Keep that decision with the caller."

### "Until upstream catches up"

**Chen**: "Who removes our patch when the plugin ships its own declarations?"

**Oded**: "Whoever upgrades it. Put the patch in that review."

**Chen**: "If their declaration requires `frame`, our optional one conflicts. That error is in `labels.ts`, so `skipLibCheck` won't hide it. But two required method signatures can merge as overloads without an error. A clean build isn't a reminder to remove the patch."
