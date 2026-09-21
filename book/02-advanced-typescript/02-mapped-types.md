# Chapter 8: Who Owns the Fields?

## The Principle

Linoy's pull request deletes three type definitions from the account settings feature. Guy has asked her to restore one of them.

**Linoy Nightly**: "Which field did I lose?"

**Guy Singleton**: "None. You've changed where they come from."

They're reviewing the diff on the meeting-room display. Oded has checked out the branch and left the settings page open on his laptop.

Eli had promised "types that walk an object's keys." **Daniel Compiler** finds one behind the first line of Linoy's replacement, in the standard library.

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

**Daniel**: "`keyof T` gives us the keys. `P` takes each one in turn. `T[P]` is the type of the property at that key, and the question mark makes it optional. That's a mapped type."

```typescript
type ContactFields = {
  displayName: string;
  email: string;
};

type ContactDraft = Partial<ContactFields>;
// { displayName?: string; email?: string }

const emptyDraft: ContactDraft = {};
const nameOnly: ContactDraft = { displayName: "Ada" };
const wrongValue: ContactDraft = { email: 42 }; // Error: number isn't string.
```

**Oded Shipley**: "I've used `Partial`. I hadn't opened it."

**Daniel**: "Most people don't. It gets more work done that way."

**Guy**: "Fine. Now show me what we're making optional."

## The Debate

### "These are the editable fields"

**Linoy** selects the replacement in the diff.

"Here's the account record. Readonly snapshot. Here are the three fields the endpoint lets you change. Pick those, make them optional, and we have the request."

```typescript
type User = {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly bio?: string;
  readonly roles: readonly string[];
};

type EditableKey = "displayName" | "email" | "bio";
type EditableFields = Pick<User, EditableKey>;
type DerivedUpdate = Partial<EditableFields>;
```

**Linoy**: "No `id`, no `roles`. Add `billingPlan` tomorrow and it still doesn't get in. The form can use the same selection, and then the errors—"

**Guy**: "The request first. Where's the interface?"

**Linoy**: "In the red part of the diff. You linked to it."

Guy copies it into the scratch file beside her version.

```typescript
interface UpdateUserRequest {
  readonly displayName?: string;
  readonly email?: string;
  readonly bio?: string;
}
```

**Guy**: "This is what we publish to clients. I can review it here. Yours sends me into the database model to find out what the API accepts."

**Linoy**: "And when we change a field type, someone has to remember your copy. Mine follows it. That's the point."

**Guy**: "You're assuming we want the request to follow every change to that field."

**Oded**: "Are these different right now?"

```typescript
const derived: DerivedUpdate = { displayName: "Ada" };
const explicit: UpdateUserRequest = derived;
const backAgain: DerivedUpdate = explicit;
// Both request types currently accept the same shapes.
```

**Linoy**: "Same shapes. And mine catches a misspelled key before anyone calls anything. Look at `Pick`:"

```typescript
// From the standard library:
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

**Linoy**: "This time we walk the keys in `K`. They have to belong to `T`. Write `Pick<User, "emali">` and the declaration fails. Rename `email` in the model and it tells me to fix the selection. Your handwritten `email: string` could sit there forever."

**Guy**: "I might need it to sit there. Clients could still be sending `email`."

**Oded** has the handler open on his laptop.

"The parser still selects what goes into the write?"

**Linoy**: "I haven't touched it."

**Oded**: "Good. I don't want somebody sending `roles` and promoting themselves."

**Daniel** adds a variable to the scratch file.

```typescript
const incoming = { displayName: "Ada", roles: ["admin"] };
const request: DerivedUpdate = incoming; // Compiles.

console.log(Object.keys(request)); // ["displayName", "roles"]
```

**Daniel**: "Same object. A fresh literal with `roles` would get an excess-property error. This variable passes. `Pick` hasn't removed anything at runtime. Keep the parser with either definition."

**Guy**: "And keep its rules. Omit a field to leave it alone. Send a string to replace it. An empty biography clears the biography."

**Oded**: "What about `{}`?"

**Guy**: "Nothing to change. We accept it."

**Linoy**: "Then `Partial` fits. It lets you leave out all three."

**Daniel** tries one more assignment.

```typescript
const omitted: DerivedUpdate = {};
const clearedBio: DerivedUpdate = { bio: "" };
const explicitUndefined: DerivedUpdate = { email: undefined };
// strict alone: all three compile.
// strict + exactOptionalPropertyTypes: error on explicitUndefined.
```

**Daniel**: "`strict` alone accepts that last one. With `exactOptionalPropertyTypes` on, a present `email` has to be a string. Put `undefined` in the value type if you want to allow it. Reading a missing property still gives `undefined`. Both request definitions behave the same way."

**Eden Legacy**: "Our service tests call the function directly. They don't serialize anything. Keep an absent property and a present `undefined` as separate cases."

The remaining examples enable both `strict` and [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html).

### "The same field changes"

**Eden** pulls up the account-import branch.

"We don't have to invent a change. Some of these accounts have no email. We're going to store `null`. The update endpoint will still reject it. Clearing an email has a separate operation."

He puts the imported model beside the current one.

```typescript
type ImportedUser = Omit<User, "email"> & {
  readonly email: string | null;
};

type ImportedUpdate = Partial<Pick<ImportedUser, EditableKey>>;

const advertised: ImportedUpdate = { email: null }; // Compiles.
const existingContract: UpdateUserRequest = { email: null };
// Error: null is not assignable to string.
```

**Eden**: "`Omit` removes the old email property so I can replace it. Same three selected keys. Now your request accepts `null`."

**Linoy**: "The server would reject it."

**Eden**: "After our client package told someone to send it. We did this with a renamed field once. I told the mobile team to update their types. They did. Then they sent me a clean build and a recording of the Save button failing. I had to tell them to put the old name back."

Linoy reads the two assignments, then types underneath them.

```typescript
type DerivedUpdateWithOverride = Omit<ImportedUpdate, "email"> & {
  readonly email?: string;
};

const fixed: DerivedUpdateWithOverride = { email: "ada@example.com" };
const contract: UpdateUserRequest = fixed;
const reverse: DerivedUpdateWithOverride = contract;
// The repaired derivation and the existing contract agree again.
```

**Linoy**: "There. Email differs, so I override email. The other fields can still follow the model."

**Guy** reads it.

"That works."

**Linoy**: "Can I keep it?"

**Guy**: "What tells the next reviewer to look for another exception? Eden happened to have the import open."

**Linoy**: "A type test. You've asked me for those often enough."

She adds one to the type-test file, using [`@ts-expect-error`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#ts-expect-error-comments), available since TypeScript 3.9.

```typescript
// @ts-expect-error: This endpoint does not accept a null email.
const cannotClearEmail: DerivedUpdateWithOverride = { email: null };
```

**Linoy**: "If someone lets `null` back in, that line stops producing an error and the directive fails the build. That's a check we can run."

**Eden**: "Keep a test for the endpoint rejecting it too. We need both, whichever definition we pick."

**Oded** counts the fields in Guy's interface.

"There are three. I can read all three while you're explaining the override."

**Linoy**: "You can also read three stale fields. If the biography type changes in both places, I want the compiler to carry that through. I don't want to find every copy by hand."

**Guy**: "Then put that shared definition in the contract package. Let the model import it. An internal record change shouldn't revise the API while we're reviewing something else."

**Linoy**: "Moving it doesn't tell us which fields should share a type. We still have to decide that."

**Guy**: "We do. I want that decision in the API review. For these three fields, I'm keeping the interface."

Linoy leaves her repaired version in the review thread. Guy restores the published request definition and runs the same null-rejection check against it.

### "Let me save the biography"

**Linoy**: "One definition back. What about the form? It edits all three of these fields. We don't have a password box hiding in there."

**Guy**: "Let it follow the request. That's the contract this screen uses."

**Oded**: "I tried using your `EditableFields`. I can't edit them."

```typescript
const selected: EditableFields = {
  displayName: "Ada",
  email: "ada@example.com",
};

selected.displayName = "Ada Lovelace";
// Error: displayName is readonly.
```

**Daniel**: "`Pick` preserves the modifiers, and `Partial` keeps `readonly` when it makes a property optional. You selected those fields out of a readonly record. They arrived readonly."

**Linoy**: "For the draft, take it off. And every input holds a string, even when it's empty, so take off the optional modifier as well."

```typescript
type Editable<T> = {
  -readonly [K in keyof T]-?: T[K];
};

type FormValues = Editable<UpdateUserRequest>;
// { displayName: string; email: string; bio: string }
```

**Oded**: "I was looking for a word like `Mutable`. You put a minus sign on `readonly`."

**Linoy**: "And `-?` removes optionality. That's how `Required` does it. Leave a modifier alone in this mapping and it carries through. Add `?` or `readonly` and you put it on. You can even write the plus explicitly—"

**Oded**: "I'm going to keep looking for `Editable`."

The two [mapping modifiers](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers) change the type. The draft still needs values, including defaults for the missing fields.

```typescript
function startForm(user: ImportedUser): FormValues {
  return {
    displayName: user.displayName,
    email: user.email ?? "",
    bio: user.bio ?? "",
  };
}

const user: ImportedUser = {
  id: "u_42",
  displayName: "Ada",
  email: null,
  roles: ["reader"],
};

const form = startForm(user);
form.bio = "Writes software";
console.log(user.bio); // undefined: the record hasn't changed.
```

**Guy**: "That function makes the copy. Removing `readonly` alone wouldn't give us another object."

Eden gives Oded an imported-account fixture to load in the local preview. Oded changes the biography and clicks Save. The email input turns red.

**Oded**: "I haven't touched email."

**Linoy** leans over to see the page.

"It's empty. The validator checks every input before we build the request."

**Oded**: "So this person needs an email address to tell us they write software?"

**Eden**: "They need to be able to edit their profile before they have an address. That's part of the import. The old form always started with an email. We haven't tried this account in it before."

**Guy**: "The endpoint accepts just a biography. We shouldn't turn this screen into an email migration."

**Linoy** finds the submit handler.

"It already picks out the changed fields. Validation runs too early. I'll validate the patch we're actually sending."

The field-selection function compares the draft with its initial values:

```typescript
function changedFields(
  initial: FormValues,
  current: FormValues,
): UpdateUserRequest {
  return {
    ...(current.displayName !== initial.displayName
      ? { displayName: current.displayName }
      : {}),
    ...(current.email !== initial.email ? { email: current.email } : {}),
    ...(current.bio !== initial.bio ? { bio: current.bio } : {}),
  };
}

const initial = startForm(user);
const draft = { ...initial, bio: "Writes software" };
const patch = changedFields(initial, draft);
// { bio: "Writes software" } — no email property.
```

**Linoy**: "All the controls have values. We only submit the ones that changed. If email is in that patch, the validator still rejects an empty or invalid address. Leave it alone and it stays out."

**Eden**: "And changing an existing biography to an empty string still sends the empty string?"

**Linoy**: "It differs from the initial value. It goes in."

Oded retries after she moves the validation call. The biography saves. He adds the imported account to the form's regression cases.

## The Turn

Oded goes back to the email input, types `not-an-address`, and clicks Save again.

**Oded**: "This one should complain."

The error appears beside the input. **Linoy** brings the error type onto the display.

```typescript
type FieldErrors<T> = {
  -readonly [K in keyof T]?: string[];
};

const errors: FieldErrors<FormValues> = {};
errors.email = ["Enter an email address"];
errors.emali = ["Enter an email address"]; // Error: emali doesn't exist.
```

**Linoy**: "The last deletion. Same field names, messages for values. The entries are optional because most fields won't have an error."

**Guy**: "Wait. You've stopped using `T[K]`."

**Linoy**: "Every field gets `string[]`. Email could become a number and its errors would still be messages. Only the keys come across."

Guy looks back at the request derivation.

**Guy**: "So the email change we just tried wouldn't spread into this one."

**Linoy**: "It wouldn't. And if we rename an input, I want the old error key to fail."

**Oded**: "I could write `Partial<Record<keyof FormValues, string[]>>`."

**Linoy**: "That works too. Name it `FieldErrors` and use it. Just keep the keys. `Record<string, string[]>` lets `emali` through."

**Guy** finds the labels in the component.

"These have to cover every field. We can't have a biography input with no label."

```typescript
type Labels<T> = {
  -readonly [K in keyof T]-?: string;
};

const labels = {
  displayName: "Display name",
  email: "Email address",
  bio: "Biography",
} satisfies Labels<FormValues>;
```

Guy deletes `bio`. The object gets an error. He puts it back.

**Guy**: "I'll take that check. Add a field and someone has to add its label."

**Eden**: "What fails if I add an input and forget its validation?"

**Linoy**: "This won't catch it. An empty error object still compiles. We'll need a test for the new input."

**Linoy**, to Guy: "You do want some of these lists to stay together, then."

**Guy**: "The labels belong to these inputs. I can make that promise. I couldn't make it about the record and the request."

**Guy** marks the mapping as reviewed.

Linoy leaves the existing `form` list for submission failures above the inputs and replaces just the `fields` type.

```typescript
type FormErrors<T> = {
  fields: FieldErrors<T>;
  form: string[];
};

const unavailable: FormErrors<FormValues> = {
  fields: {},
  form: ["We couldn't save your changes. Please try again."],
};
```

**Oded**: "That still lets me show a failed save without choosing an innocent text box to blame."

## The Verdict

The published request keeps its three explicit properties. The form derives writable, required values from that contract, then submits only changed fields. Labels and field errors follow the form's keys. Submission failures appear above the inputs.

Guy wants changes to the released request reviewed in the contract package. Linoy's repaired derivation passes the same checks, and she still wants shared definitions for fields that are meant to change together. Her alternative remains in the review thread.

## Additional Takes

**Daniel Compiler**: "`JSON.stringify` drops an object property whose value is `undefined`. Before serialization, you can still tell these apart:"

```typescript
const absent = {};
const present = { email: undefined };

console.log("email" in absent);  // false
console.log("email" in present); // true
console.log(JSON.stringify(present)); // "{}"
```

**Noam Kiperman**: "And don't put `Readonly` around the form container and tell me you've locked the draft."

```typescript
const snapshot: Readonly<{ values: FormValues }> = {
  values: { displayName: "Ada", email: "ada@example.com", bio: "" },
};

snapshot.values.bio = "Writes software"; // Compiles: the inner object is mutable.
// Replacing snapshot.values would be a readonly-property error.
```

**Noam**: "The inner object is still writable. Nothing here calls `Object.freeze`, either."

**Linoy Nightly**: "Now can I show you the `as`? Mapped types have had [key remapping](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as) since 4.1. You can choose the output key:"

```typescript
type WithoutId<T> = {
  [K in keyof T as Exclude<K, "id">]: T[K];
};
```

**Linoy**: "There's our `Exclude` again. For `id`, it produces `never` in the key position, so that property disappears. Put `never` after the colon and you'd still have the property. For just removing `id`, use `Omit`. I want `as` for making new names. An input called `email`, an event called `emailChanged`. I can have the compiler keep those together too."

**Oded**: "Put that in another PR."
