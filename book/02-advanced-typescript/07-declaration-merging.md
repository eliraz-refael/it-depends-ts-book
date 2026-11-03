# Chapter 13: Who Loaded It?

## The Principle

**Gilad Stacktrace**: "If a declaration promises an operation, show me what supplies it when the program runs. I want to follow the entry that reaches the call, not just see a file where the operation exists. A declaration can accurately describe one running application and still promise too much to another."

"When behavior depends on initialization, give someone responsibility for that path. Neither a stronger declaration nor a friendlier error installs the behavior. Start with the entry we intend to ship and show me it doing the job."

## The Debate

**Oded Shipley**: "The badges print. This is the PR that gets rid of the red underline."

**Gilad**: "Show me one printing."

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

### "Both pass the build"

**Oded**: "The import makes this file a module. So `declare module` patches the package we imported. `Label` is a class, but the interface merges with its instance type. We still have one constructor."

**Chen Override**: "Like the two widget packages merging `User`? Does a file see this member even if it doesn't import the patch?"

**Dima Bridge**: "Yes, if the patch is in the program. The widgets changed a global name; this changes the instance type exported by `label-kit`. Either way, a file can see the merged type without running the patch."

Oded has already moved badge formatting into a shared function. The web app uses it now; a new batch entry will use it to reprint badges after registration closes.

```typescript
// badge.ts
import type { Label } from "label-kit";

export function renderBadge(label: Label): string {
  return label.frame("*").render();
}
```

```typescript
// web.ts
// Project files: web.ts, batch.ts, badge.ts, label-frame.d.ts.
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

Dima runs the batch entry on its own.

```text
TypeError: label.frame is not a function
```

**Gilad**: "Show me the stack trace."

**Dima**: "First line in `renderBadge`."

**Chen**: "Which file loads the plugin in this process?"

**Gilad**: "None. The batch imports the constructor and the formatter, but not the plugin."

**Oded**: "Then put the import in the batch."

**Idan**: "That fixes this batch. Will the next entry know the type depends on an import in a different file?"

**Oded**: "It won't need to. We'll put the import with the thing everyone imports."

Oded writes the integration module:

```typescript
// labels.ts
// Replaces label-frame.d.ts; remove that old declaration file.
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

### "Check each entry separately"

**Dima**: "Here's a caller with no path to the augmentation."

```typescript
// isolated.ts — checked without labels.ts or label-frame.d.ts
import { Label } from "label-kit";

new Label("Ada").frame("*"); // Error TS2339: Property 'frame' does not exist on type 'Label'.
```

**Oded**: "Good. If they go around the integration module, the build tells them."

**Chen**: "Does `renderBadge` know which constructor its label came from?"

## The Turn

The shared formatter takes a label rather than constructing one. Dima changes its type import to the integration module, matching the imports they want application code to use:

```typescript
// badge.ts — replacement
import type { Label } from "./labels";

export function renderBadge(label: Label): string {
  return label.frame("*").render();
}
```

Dima restores the batch's original constructor import and checks only the batch and its dependencies:

```typescript
// batch.ts — bypassing the integration module again
import { Label } from "label-kit";
import { renderBadge } from "./badge";

console.log(renderBadge(new Label("Ada"))); // Accepted by the compiler.
```

The build passes. In a fresh process, the same `TypeError` returns.

**Oded**: "But this imports `badge`, and `badge` imports `labels`."

**Idan**: "Its type. Look at the emitted formatter."

**Oded**: "No `labels` import. Where did it go?"

**Idan**: "Erased. It brought `labels.ts` into the compiler's program, including the augmentation. The plugin import survives in `labels.js`, but this path never loads that file."

**Dima**: "My smaller build caught the direct call. It can't catch this one. The type import is enough to make the method visible."

**Oded**: "The integration module still works when they use its constructor."

**Chen**: "What makes the next entry use that constructor?"

**Oded**: "Then restrict imports of the raw package. We do that for database connections."

**Idan**: "We can. But we wrote this declaration ourselves. Why does it say every label has `frame` when we've just passed it one that doesn't?"

### "Why does it say every label?"

**Idan**: "Then make it say *may*."

```typescript
// Replacement augmentation in labels.ts.
// Replace the required member; keep only the optional member.
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

Dima runs both entries through `./labels`: each prints `* Ada *`. In a scratch copy of the batch, he tries the raw constructor again.

**Dima**: "The bypass still compiles. It reaches our missing-plugin error now. Delete the guard and I get `TS2722: Cannot invoke an object which is possibly 'undefined'.` The type makes us account for that path."

**Gilad**: "And nothing gets sent to the printer on that path. Don't turn the check into optional chaining and quietly print a different badge."

**Oded**: "I wasn't proposing a blank badge. I don't want everyone unpacking an optional method after every call."

**Idan**: "Neither do I. This check lets us call `frame` and then `render`. Another `frame` in the chain would need another check, or a narrower label type from a checked factory. We have one call."

**Dima**: "If all construction really goes through the integration module, the required declaration can describe that application. Restricting raw imports and testing each entry is a way to maintain it. It isn't something the augmentation proves."

**Oded**: "I would use that version for an app with a lot of plugin calls."

**Idan**: "I'd want to see where its labels come from. Here you showed me two entry points and one place that calls `frame`. This check is enough."

**Oded**: "For this one call, keep the optional method and the guard. Keep my runtime import too. I still want a badge."

## The Verdict

> Declaration visibility does not establish runtime initialization. Maintain that guarantee for every value the declaration covers, or describe and check the possible absence. Choose failure behavior at the caller; neither spelling loads a plugin.

**Dima**: "Keep the augmentation. Keep it optional, and keep the check in `renderBadge`. Both entries import the constructor through `labels`, so they actually get the plugin. The type also accounts for a label that arrives without it."

**Oded**: "And test that both entries print a badge. A nicer error message isn't the feature."

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

**Chen**: "What changed when you removed the import? The patch still names `label-kit`."

**Dima**: "Without the import, this file supplies an ambient module declaration with that name. It has no `version`. Put the import back and it augments the existing package."

**Oded**: "`export {}` fixed it too."

**Dima**: "It also makes the file a module. I'd keep the package import here: it names the dependency we're patching."

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

**Oded**: "Whoever upgrades it."

**Dima**: "If their declaration requires `frame`, our optional one conflicts. That error is in `labels.ts`, so `skipLibCheck` won't hide it. But two required method signatures can merge as overloads without an error. A clean build isn't a reminder to remove the patch."

**Oded**: "I'll put it on the upgrade ticket. My twelve-line patch has a retirement plan before I do."
