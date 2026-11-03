# Chapter 9: Where Did This Event Come From?

## The Principle

**Gilad Stacktrace**: "A typed event name should give me two things: a check that the call belongs to the contract, and a route to the code that can produce it. Derive the name if it follows a rule the producers actually share. Then take a name from a log and try to find those producers without asking whoever wrote the helper."

"I'm not asking every call to spell everything out. A shared function may be exactly where I want to look. I am asking what leads me there, and what I still have to inspect once I arrive. The type checks a call. It doesn't explain how that call ended up in my log."

## The Debate

**Oded Shipley**: "You actually opened another PR."

**Linoy Nightly**: "You asked me to."

Linoy's new branch applies the naming pattern to display preferences: `fontSize` becomes `fontSizeChanged`.

Gilad has pasted a line from the settings demo into a review comment.

```text
{"name":"fontSizeChanged","value":16}
```

**Gilad**: "Where can this come from?"

**Linoy**: "The font-size control and restored preferences. Both use the helper."

**Oded**: "It's a demo. I haven't put you on call for the font size."

**Gilad**: "In billing I followed wrappers across three packages to find a publisher. Show me the route here before we copy the helper."

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

**Daniel**: "`SettingKey` has three members. Substitute each one and you get `themeChanged`, `fontSizeChanged`, and `autoSaveChanged`. That's a template literal type."

**Oded**: "And `& string`? These are already strings."

**Daniel**: "Other objects can have number or symbol keys. This selects strings. Here it removes nothing."

**Linoy**: "The same thing I wanted for `emailChanged`. And once we've got the name, we can keep its value type too."

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

**Linoy**: "Every name is a setting plus `Changed`. I'm replacing how we write that map."

```typescript
type ChangeEvents<T> = {
  [K in keyof T & string as `${K}Changed`]: T[K];
};

type SettingsEvents = ChangeEvents<Settings>;
// Same three properties and value types as ExistingEvents.
```

**Linoy**: "`as` makes the new key. `T[K]` looks up the old one's value type, so `fontSizeChanged` gets the type of `fontSize`. Add a setting and the map follows."

**Oded**: "Provided we want an event for it."

**Linoy**: "For this observer, we do. Every setting is observable. If that changes, we select the keys, like we did for the form."

She opens the existing bus's settings declarations:

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

**Linoy**: "The signatures express that relationship directly. Here's the preview:"

```typescript
// src/preview.ts
import { on } from "./events";

on("fontSizeChanged", (value) => {
  console.log(`Preview font size: ${value.toFixed(0)}`);
});
```

**Oded**: "Where did it get `number`? You didn't pass `fontSize`."

**Linoy**: "`fontSize` fits before `Changed`, so it infers that as `K`. `Settings["fontSize"]` is `number`. Try another—"

**Daniel**: "Try a typo first."

Daniel adds two calls to the scratch file.

```typescript
on("fontSzieChanged", () => {}); // Error: not a settings event name.
on("fontSizeChanged", (value) => value.toUpperCase());
// Error: toUpperCase does not exist on number.
```

**Oded**: "The old map caught those too."

**Linoy**: "It did. I want to stop maintaining the list beside the list it came from."

### "That found the person listening"

Oded searches the proposed feature files:

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

**Linoy**: "The template in the parameter is a type. This one is JavaScript: it makes the string."

**Oded**: "I can read it once I'm here. I had to ask you where here was."

**Linoy**: "Follow `publish`, then references to the wrapper. Like any other function."

**Gilad**: "Which callers?"

Linoy opens the control handlers, then the restore function. Restore receives `saved` already parsed into `Settings`.

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

**Linoy**: "Restore copies all three before publishing, so listeners see the complete restored state. Three setter calls would publish between updates."

**Oded**: "So you still wrote the three restore calls."

**Linoy**: "Restore has a different job. The helper only builds the name."

**Gilad**: "Two places now. My log line doesn't say which."

**Oded**: "Writing out the event name wouldn't tell you which path ran either."

**Gilad**: "That takes logs or a reproduction. The old literal names got the search to the producers faster."

**Linoy**: "For restore. The setter can publish any field. What would you search for inside it?"

### "Put the names somewhere"

**Oded**: "What about constants? Full names in one place, then follow their references."

**Linoy**: "We can check that too:"

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

**Linoy**: "Missing `autoSave` fails, and so does `autoSaveChanged` under `fontSize`. Each field gets its own name checked."

**Oded**: "I'd have a list I could open."

**Linoy**: "You'd have to write it."

**Oded**: "I have survived that before."

**Gilad**: "Useful if the producers use it. I can follow the entry's references."

**Linoy**: "And `eventNames[key]` still takes you to a generic caller. It won't list every write for you."

**Oded**: "I wasn't asking it to. I want somewhere to start."

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

**Oded**: "One naming choice for three calls. I'll pay that. I'm not making you write a second setter."

## The Debate Continues

A type can check a naming rule without requiring a runtime name-building helper. Choose that indirection by what callers share and how maintainers find them; neither choice identifies which producer ran in a particular session.

**Gilad**: "With literal names, that log gets me straight to restore. For a control change, I still have to follow `publish` through the setter."

**Linoy**: "Or follow the same helper in both, if restore uses it too. I'd still make that trade."

## Additional Takes

**Daniel Compiler**: "Before anyone calls that publisher a proof that the name and value always match, give `K` a union."

```typescript
publish<SettingKey>("fontSizeChanged", false); // Compiles.
```

**Linoy**: "Because `K` is all three keys now. The name can be any of the three events, and the value can be any of the three property types."

**Daniel**: "You can also arrive there with independently widened variables. The setter has the same hole: `setSetting<SettingKey>("fontSize", false)` compiles and writes a boolean. The literal calls we checked infer a specific key. Neither signature preserves every pairing through a union."

**Oded**: "And for a queue where the event is one value?"

**Linoy**: "Keep the name and payload together as a discriminated union. Map each key to its pair, then index with all the keys to get the union."

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

**Linoy**: "The audit viewer groups names by entity. That was going to be next."

```typescript
type Entity = "profile" | "invoice";
type Action = "created" | "paid";
type AuditEvent = `${Entity}:${Action}`;

const event: AuditEvent = "profile:paid"; // Compiles.
```

**Oded**: "Do we have a paid profile?"

**Linoy**: "No. That combination shouldn't be there."

**Daniel**: "Two choices in each position. You asked for four combinations."

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

**Oded**: "Am I maintaining an object or a list now?"

**Linoy**: "The object groups the events by entity. Indexing with all its keys gives you the flat union too."

Oded writes the result underneath.

```typescript
type ListedAuditEvent =
  | "profile:created"
  | "invoice:created"
  | "invoice:paid";
```

**Oded**: "Three names. I might just keep this."

**Linoy**: "If we only use the flat list, fine. The filter menu picks an entity first. I want to check its props before throwing the grouped type away."

**Oded**: "Keep that out of the settings change. The settings all have `Changed`. The audit events already need a different rule."

---

**Linoy**: "And if you want names like `onFontSizeChanged`, there's `Capitalize`. It uppercases the first character."

```typescript
type HandlerName = `on${Capitalize<ChangeEvent>}`;
// "onAutoSaveChanged" | "onFontSizeChanged" | "onThemeChanged"
```

**Oded**: "Those aren't in the diff, are they?"

**Linoy**: "Scratch file. You can approve the other tab."
