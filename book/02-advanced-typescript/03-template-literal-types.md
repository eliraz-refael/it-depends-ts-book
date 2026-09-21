# Chapter 9: Where Did This Event Come From?

## The Principle

**Oded Shipley**: "You actually opened another PR."

**Linoy Nightly**: "You asked me to."

The account form is still open behind the diff. Linoy's new branch applies her idea to the display preferences: a property called `fontSize`, an event called `fontSizeChanged`.

Gilad has pasted a line from the settings demo into a review comment.

```text
{"name":"fontSizeChanged","value":16}
```

**Gilad Stacktrace**: "Where can this come from?"

**Linoy**: "The font-size control. Restoring saved preferences. Both go through the helper."

**Gilad**: "Show me how I find those from this."

**Oded**: "It's a demo. I haven't put you on call for the font size."

**Gilad**: "In billing I had to follow wrappers across three packages just to find a publisher. I'd like to see the route here before we copy this helper anywhere else."

**Linoy**: "One folder. I'll show you."

Oded copies the name, but **Daniel Compiler** points at the new event type in the diff.

"Start here. The backticks in this line describe our event names."

```typescript
// src/settings.ts
export type Settings = {
  theme: "light" | "dark";
  fontSize: number;
  autoSave: boolean;
};

export type SettingKey = keyof Settings & string;
export type ChangeEvent = `${SettingKey}Changed`;

export const settings: Settings = {
  theme: "light",
  fontSize: 14,
  autoSave: true,
};
```

**Daniel**: "`SettingKey` has three members. Substitute each one and you get `themeChanged`, `fontSizeChanged`, and `autoSaveChanged`. That's a [template literal type](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)."

**Oded**: "And `& string`? These are already strings."

**Daniel**: "They are. Other objects can have number or symbol keys. Linoy's pattern selects the string ones. Here it doesn't remove anything."

**Linoy**: "The same thing I wanted for `emailChanged`. And once we've got the name, we can keep its value type too."

## The Debate

### "We already had the value type"

Oded selects the deleted definition in the diff.

```typescript
interface ExistingEvents {
  themeChanged: Settings["theme"];
  fontSizeChanged: Settings["fontSize"];
  autoSaveChanged: Settings["autoSave"];
}
```

**Oded**: "Like we did with `user:login`. Pick an event, get its payload. This already checks that."

**Linoy**: "I know. I'm replacing how we write the map. Look at the names on the left. Every one is a setting plus `Changed`."

```typescript
type ChangeEvents<T> = {
  [K in keyof T & string as `${K}Changed`]: T[K];
};

type SettingsEvents = ChangeEvents<Settings>;
// Same three properties and value types as ExistingEvents.
```

**Linoy**: "The `as` makes the new key. After the colon, `T[K]` still looks up the old key. So `fontSizeChanged` gets the type of `fontSize`. Add another setting and the map follows."

**Oded**: "Provided we want an event for it."

**Linoy**: "For this observer, we do. Every setting is observable. If that changes, we select the keys, like we did for the form."

She brings up the event bus's declarations. The bus already exists; these are its public signatures for settings events.

```typescript
// src/events.d.ts
import type { Settings, SettingKey } from "./settings";

export declare function on<K extends SettingKey>(
  name: `${K}Changed`,
  listener: (value: Settings[K]) => void,
): void;

export declare function publish<K extends SettingKey>(
  name: `${K}Changed`,
  value: Settings[K],
): void;
```

**Linoy**: "Here I've written the relationship directly in the signatures. The preview subscribes like this."

```typescript
// src/preview.ts
import { on } from "./events";

on("fontSizeChanged", (value) => {
  console.log(`Preview font size: ${value.toFixed(0)}`);
});
```

**Oded**: "Where did it get `number`? You didn't pass `fontSize`."

**Linoy**: "It inferred `K` from the name. `fontSize` fits the part before `Changed`. Then `Settings["fontSize"]` is `number`. You can try the other fields—"

**Daniel**: "Try a typo first."

In the scratch file, Oded adds two calls.

```typescript
on("fontSzieChanged", () => {}); // Error: not a settings event name.
on("fontSizeChanged", (value) => value.toUpperCase());
// Error: toUpperCase does not exist on number.
```

**Oded**: "The old map caught those too."

**Linoy**: "It did. I want to stop maintaining the list beside the list it came from."

### "That found the person listening"

Oded returns to Gilad's comment and runs the search against the proposed feature files.

```text
$ rg --sort path -n -F 'fontSizeChanged' src
src/preview.ts:3:on("fontSizeChanged", (value) => {
```

**Oded**: "That found the person listening. Where's the person talking?"

**Linoy**: "`writes.ts`."

**Oded**: "I'm asking the repository. You're not always going to be sitting here."

Linoy puts the producer beside the search result.

```typescript
// src/writes.ts
import { settings, type Settings, type SettingKey } from "./settings";
import { publish } from "./events";

export function publishChange<K extends SettingKey>(
  key: K,
  value: Settings[K],
) {
  publish(`${key}Changed`, value);
}

export function setSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  settings[key] = value;
  publishChange(key, value);
}
```

**Linoy**: "The template in `publish`'s parameter is a type. This one, inside the function, is JavaScript. This is where the string gets made."

**Oded**: "I can read it once I'm here. I had to ask you where here was."

**Linoy**: "Follow `publish` from the event module. That finds the wrapper. Find references to the wrapper and you have the callers. You do that with ordinary functions."

**Gilad**: "Which callers?"

Linoy opens the control handlers, then the restore function. The controls supply typed values. `saved` has already been parsed into `Settings` before it reaches the restore function.

```typescript
// src/controls.ts
import { setSetting } from "./writes";

export function changeFontSize(value: number) {
  setSetting("fontSize", value);
}

export function changeAutoSave(value: boolean) {
  setSetting("autoSave", value);
}
```

```typescript
// src/restore.ts
import { settings, type Settings } from "./settings";
import { publishChange } from "./writes";

export function restore(saved: Settings) {
  Object.assign(settings, saved);
  publishChange("theme", saved.theme);
  publishChange("fontSize", saved.fontSize);
  publishChange("autoSave", saved.autoSave);
}
```

**Linoy**: "The ordinary setter changes one property and publishes. Restore copies all three first, then publishes them. A listener reading the other settings sees the restored values too. That ordering is why restore doesn't call the setter three times."

**Oded**: "So you still wrote the three restore calls."

**Linoy**: "Restore has a different job. The helper only builds the name."

**Gilad**: "Now I have two places to inspect. I still don't know which one produced my line."

**Oded**: "Writing out the event name wouldn't tell you which one ran either."

**Gilad**: "I'd still need the surrounding log or a reproduction. I'm asking how I get to the code I need to inspect. Your search got us there faster in the old version."

**Linoy**: "For restore. The setter handles whichever key the control gives it. There isn't one font-size emission statement to find inside it."

Oded leaves both files open.

### "Put the names somewhere"

**Oded**: "What about a constants object? Full names in one place. We'd find that, then its references."

**Linoy**: "We can check that too."

She adds a candidate to the scratch file.

```typescript
const eventNames = {
  theme: "themeChanged",
  fontSize: "fontSizeChanged",
  autoSave: "autoSaveChanged",
} satisfies { [K in SettingKey]: `${K}Changed` };

function restoreWithNames(saved: Settings) {
  Object.assign(settings, saved);
  publish(eventNames.theme, saved.theme);
  publish(eventNames.fontSize, saved.fontSize);
  publish(eventNames.autoSave, saved.autoSave);
}
```

**Linoy**: "Leave out `autoSave` and it's an error. Put `autoSaveChanged` under `fontSize` and that's an error too. This checks which name belongs to each field, not just whether the value is one of our event names."

**Oded**: "I'd have a list I could open."

**Linoy**: "You'd have to write it."

**Oded**: "I have survived that before."

**Gilad**: "This gets me to the entry. Its references get me to that producer. That's useful if producers actually use the object."

**Linoy**: "And if every generic caller uses `eventNames[key]`, following that reference still takes you to a generic caller. It won't list every possible write for you."

**Oded**: "I wasn't asking it to. I want somewhere to start."

He keeps the candidate beside the diff.

### "Do we have a paid profile?"

**Linoy**: "The naming pattern isn't just useful for settings. I was going to try it on the audit viewer next. It already groups names by entity."

```typescript
type Entity = "profile" | "invoice";
type Action = "created" | "paid";
type AuditEvent = `${Entity}:${Action}`;

const event: AuditEvent = "profile:paid"; // Compiles.
```

**Oded**: "Do we have a paid profile?"

**Linoy**: "Not in that viewer. That combination shouldn't be there."

**Daniel**: "Both substitutions range over both members. You asked for four combinations."

```typescript
type ExpandedAuditEvent =
  | "profile:created"
  | "profile:paid"
  | "invoice:created"
  | "invoice:paid";
```

**Oded**: "Can you make it stop at the three we use?"

**Linoy**: "With the allowed actions attached to their entities."

```typescript
type ActionsByEntity = {
  profile: "created";
  invoice: "created" | "paid";
};

type AllowedAuditEvent = {
  [E in keyof ActionsByEntity]: `${E}:${ActionsByEntity[E]}`;
}[keyof ActionsByEntity];

const wrongEvent: AllowedAuditEvent = "profile:paid"; // Error.
```

**Oded**: "The brackets at the end?"

**Linoy**: "The mapped type builds an object type. Its `profile` value is `profile:created`. Its `invoice` value is the two invoice events. Indexing with all its keys takes those values as a union."

Oded writes the result underneath.

```typescript
type ListedAuditEvent =
  | "profile:created"
  | "invoice:created"
  | "invoice:paid";
```

**Oded**: "Three names. I might just keep this."

**Linoy**: "If we only use the flat list, fine. The filter menu picks an entity first. I want to check its props before throwing the grouped type away."

**Oded**: "After this one. Your settings all have `Changed`. The audit events already needed a different rule."

Linoy closes the audit example. The restore calls are still visible behind it.

## The Turn

**Oded**: "For restore, why can't I keep the strings?"

**Linoy**: "Then you're spelling them yourself."

**Oded**: "I'm spelling every field myself anyway. Does your type reject this?"

```typescript
publish("fontSizeChanged", 16);
publish("fontSzieChanged", 16); // Error: unknown event name.
publish("fontSizeChanged", false); // Error: boolean is not number.
```

**Daniel**: "The first call passes. The next two don't."

**Oded**: "So keep the signature. I can write a name and it checks my spelling."

**Linoy**: "You can. And my wrapper still uses it to check a constructed name."

**Oded**: "Then I don't need the constants object for this. Restore can say what it publishes. The controls can use the setter."

He replaces the restore file in the diff.

```typescript
// src/restore.ts — replacement
import { settings, type Settings } from "./settings";
import { publish } from "./events";

export function restore(saved: Settings) {
  Object.assign(settings, saved);
  publish("themeChanged", saved.theme);
  publish("fontSizeChanged", saved.fontSize);
  publish("autoSaveChanged", saved.autoSave);
}
```

**Linoy**: "If we change the suffix, those three calls need editing."

**Oded**: "The compiler will point at them. The subscribers need changing too."

**Linoy**: "Unless we use the constants object for those as well."

**Oded**: "We could. I'd rather have these three names here. I'm keeping your setter."

**Gilad**: "Run the search again."

```text
$ rg --sort path -n -F 'fontSizeChanged' src
src/preview.ts:3:on("fontSizeChanged", (value) => {
src/restore.ts:7:  publish("fontSizeChanged", saved.fontSize);
```

**Gilad**: "And the control path still won't appear in that result."

**Oded**: "I know. Now that I've followed the setter, I don't want a copy of it for every control. Restore already had three calls. I want to keep being able to find those."

**Linoy**: "I'd still use the wrapper in both. Once you know where settings writes live, this is one extra naming choice to explain."

**Oded**: "Put that in the review. I'm not making you write a second setter."

## The Verdict

The PR keeps the template-typed signatures and the generic setter. Ordinary controls update a property through `setSetting`, which constructs the event name. Restore continues to update the complete state before publishing, with literal names at its three emission sites. The preview still receives a number for `fontSizeChanged`.

The registry stays in the review as an alternative. Linoy prefers using one wrapper throughout the feature. Oded accepts the extra step when tracing the shared setter, but wants the already enumerated restore emissions searchable by their full names. Neither the search result nor the signature tells Gilad which path ran in a particular session.

## Additional Takes

**Daniel Compiler**: "Before anyone calls that publisher a proof that the name and value always match, give `K` a union."

```typescript
publish<SettingKey>("fontSizeChanged", false); // Compiles.
```

**Linoy**: "Because `K` is all three keys now. The name can be any of the three events, and the value can be any of the three property types."

**Daniel**: "You can also arrive there with independently widened variables. The literal calls we checked infer a specific key. This signature doesn't preserve every pairing through a union."

**Oded**: "And for a queue where the event is one value?"

**Linoy**: "Keep the name and payload together as a discriminated union."

```typescript
type SettingsChange = {
  [K in SettingKey]: { name: `${K}Changed`; value: Settings[K] };
}[SettingKey];

const badChange: SettingsChange = {
  name: "fontSizeChanged",
  value: false,
}; // Error: that name requires a number.
```

**Daniel**: "The pair is checked as one member of the union. Don't split it back into two independent unions at the next function."

---

**Oded**: "I tried deriving the events from the defaults instead. Then it wouldn't let me change the font size."

```typescript
const defaults = { theme: "light", fontSize: 14, autoSave: true } as const;
type DefaultEvents = ChangeEvents<typeof defaults>;

const nextSize: DefaultEvents["fontSizeChanged"] = 16; // Error: expected 14.
```

**Daniel**: "You made fourteen part of the type. It has been very loyal to fourteen."

**Linoy**: "`as const` was useful for our fixed status codes. These are starting values for settings that change. That's why I used the `Settings` type instead of deriving everything from the initializer."

---

**Linoy**: "And if you want names like `onFontSizeChanged`, there's `Capitalize`. It uppercases the first character."

```typescript
type HandlerName = `on${Capitalize<ChangeEvent>}`;
// "onThemeChanged" | "onFontSizeChanged" | "onAutoSaveChanged"
```

**Oded**: "Those aren't in the diff, are they?"

**Linoy**: "Scratch file. You can approve the other tab."
