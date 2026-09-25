# Chapter 11: Some Assembly Required

## The Principle

**Oded Shipley**: "We added a whole builder and I still have to supply two strings."

**Guy Singleton**: "You can supply them in different places."

**Oded**: "I could do that before."

The team's export SDK produces a job record for a separate runner. `source` names a dataset. `destination` is the output path. Building a job doesn't write a file. Guy's proposed `ExportBuilder` lets callers supply those fields in stages, then ask for the complete record.

```typescript
type ExportSpec = {
  source: string;
  destination: string;
};

const job = ExportBuilder.start()
  .source("orders")
  .destination("exports/nightly.csv")
  .build();
// { source: "orders", destination: "exports/nightly.csv" }
```

**Guy**: "The source can come from the reporting package. The destination can come from the application. Neither has to finish the configuration alone."

**Dafna Functor**: "And you want everyone to pass this object between them?"

**Guy**: "With a type that records what they've supplied. Watch what happens if the application forgets its part."

```typescript
const incomplete = ExportBuilder.start().source("orders");
incomplete.build(); // Error: TS2684.
// The 'this' context of type 'ExportBuilder<{ source: string; }>'
// is not assignable to method's 'this' of type 'ExportBuilder<ExportSpec>'.
// Property 'destination' is missing in type '{ source: string; }'
// but required in type 'ExportSpec'.
```

**Prof. Eli Typeworth**: "A generic can carry what we know about a configuration through several calls. The next operation can require some of that knowledge. Guy's `build` requires evidence of both fields. We need to see how the earlier calls provide it."

**Oded**: "Fine. Open the class. I want to see whether the method actually adds anything or just changes what the editor calls it."

## The Debate

### "What's inside the brackets?"

Guy brings the implementation into the diff. The constructor is private, so callers begin with `start()` and use the methods to obtain subsequent builders.

```typescript
class ExportBuilder<S extends Partial<ExportSpec> = {}> {
  private readonly state: S;

  private constructor(state: S) {
    this.state = state;
  }

  static start(): ExportBuilder {
    return new ExportBuilder({});
  }

  source(source: string): ExportBuilder<S & { source: string }> {
    return new ExportBuilder({ ...this.state, source });
  }

  destination(
    destination: string,
  ): ExportBuilder<S & { destination: string }> {
    return new ExportBuilder({ ...this.state, destination });
  }

  build(this: ExportBuilder<ExportSpec>): ExportSpec {
    const { source, destination } = this.state;
    if (typeof source !== "string" || typeof destination !== "string") {
      throw new Error("An export needs a source and a destination.");
    }
    return { source, destination };
  }
}
```

**Oded**: "`extends` and equals in the same pair of brackets. Which one tells me what's in there?"

**Guy**: "`extends Partial<ExportSpec>` constrains `S`. It permits configuration shapes with either field missing. `= {}` supplies the default when I write `ExportBuilder` without a type argument. That's the spelling I used for the empty builder returned by `start`."

**Eli**: "The constraint doesn't make every property of `S` optional. A particular `S` can still require `source`. Nor does the default create an empty object. The constructor call does that."

The [generic parameter default](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-parameter-defaults) makes the type argument optional to write. It doesn't mean “whichever state the caller happens to have.”

**Dafna**: "The method copies the old state and adds a field. The return type does the corresponding thing with `S & { source: string }`."

**Guy**: "Yes. And the private member is typed as `S`. The state isn't just a label attached to the class name. It affects which instances are compatible."

He writes the states next to the calls.

```typescript
const empty = ExportBuilder.start();
// ExportBuilder<{}>

const selected = empty.source("orders");
// ExportBuilder<{ source: string }>

const ready = selected.destination("exports/nightly.csv");
// ExportBuilder<{ source: string } & { destination: string }>

ready.build();
```

**Chen Override**: "Can I choose the destination first?"

**Guy**: "That's what the manual-export command does. It chooses an output path from the workspace settings, then hands the builder to the selected report package. The nightly job starts with the package's source preset."

```typescript
const reversed = ExportBuilder.start()
  .destination("exports/manual.csv")
  .source("orders")
  .build();
```

**Guy**: "Either order. `build` requires the completed shape. It doesn't require a particular route through the methods."

**Oded**: "That `this` parameter still looks like an argument nobody supplied."

**Guy**: "It describes the receiver. In `ready.build()`, the receiver is `ready`. Its state has both required fields, so the call is accepted. `selected.build()` fails because its receiver doesn't."

An explicit [`this` parameter](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters) is checked by TypeScript and erased from the emitted JavaScript. It adds no runtime argument or check.

**Dafna**: "Which is why you kept the `typeof` checks."

**Guy**: "We also have JavaScript consumers. They can call `build` before they're ready. I want the same error at runtime."

**Chen**: "And a source that doesn't exist?"

**Guy**: "Still a string. The runner checks that the dataset exists and that the caller can export it. These types establish that the two string fields were supplied."

### "We had a source a moment ago"

Oded adds the application's destination helper. Its policy is to put the nightly job at one fixed path. It doesn't choose a dataset.

```typescript
function forNightlyExport(builder: ExportBuilder) {
  return builder.destination("exports/nightly.csv");
}

const nightly = forNightlyExport(
  ExportBuilder.start().source("orders"),
);

nightly.build(); // Error: TS2684; its elaboration includes:
// Property 'source' is missing in type '{ destination: string; }'
// but required in type 'ExportSpec'.
```

**Oded**: "There. I supplied my string in a different place. It forgot yours."

**Guy**: "The runtime object still has it."

**Oded**: "Great. Build it, then."

**Eli**: "Read the helper's parameter. A bare `ExportBuilder` uses the default, `ExportBuilder<{}>`. It accepts the more configured value, but inside this function you've retained no required fields in its state type. Adding a destination to that gives you a builder with a known destination. There is no known source to carry out."

**Oded**: "So the friendly default made a perfectly ordinary annotation too vague."

**Guy**: "For a helper that promises to preserve what it receives, yes. Give that state a name."

He replaces the helper.

```typescript
function forNightlyExport<S extends Partial<ExportSpec>>(
  builder: ExportBuilder<S>,
) {
  return builder.destination("exports/nightly.csv");
}
```

**Guy**: "Now the caller supplies the evidence for `S`. The return carries that same state plus the destination. Nobody needs to write the type argument at the call."

```typescript
const fromSource = forNightlyExport(
  ExportBuilder.start().source("orders"),
).build();

const fromDestination = forNightlyExport(ExportBuilder.start())
  .source("orders")
  .build();
```

**Dafna**: "You could require `{ source: string }` in the parameter instead. That fixes Oded's first call without making the helper generic."

**Guy**: "It does. It also forbids the second call. This helper only chooses a destination. Why should it insist the source was already selected?"

**Dafna**: "If both orders are part of the API, keep the parameter. I'm asking which callers you're preserving it for."

**Oded**: "The application team now needs to understand the state parameter to write a wrapper around one method. Put this example in the quickstart. People will write my annotation."

Guy adds the helper example below the fluent chain.

### "Here's the function we already had"

Dafna opens the existing constructor function. It accepts a complete configuration and returns a fresh job record. Like the builder, it keeps its runtime completeness check for JavaScript callers.

```typescript
function createExport(spec: ExportSpec): ExportSpec {
  const { source, destination } = spec;
  if (typeof source !== "string" || typeof destination !== "string") {
    throw new Error("An export needs a source and a destination.");
  }
  return { source, destination };
}

const direct = createExport({
  source: "orders",
  destination: "exports/nightly.csv",
});
```

She removes the destination from its caller.

```typescript
createExport({ source: "orders" }); // Error: TS2741.
// Property 'destination' is missing in type '{ source: string; }'
// but required in type 'ExportSpec'.
```

**Dafna**: "Same omission caught at the call. We don't need a builder to require two properties."

**Guy**: "Your example puts them together in one expression. That's the easy caller."

**Dafna**: "Then give me the reporting package's part."

```typescript
const orderSource = { source: "orders" };

function withNightlyDestination<S extends Partial<ExportSpec>>(spec: S) {
  return { ...spec, destination: "exports/nightly.csv" };
}

const assembled = createExport(withNightlyDestination(orderSource));
```

**Guy**: "That helper is generic too."

**Dafna**: "It needs to preserve the input shape, just like yours. I'm happy with the generic. I'm questioning the object with methods around it."

**Chen**: "What would the reporting package export in each version?"

**Guy**: "A builder whose source is selected. The consuming application stays inside the same construction API."

**Dafna**: "Mine exports the source configuration. You can inspect it, spread it into another object, or pass it through a function without learning a builder protocol."

**Guy**: "Our methods are the operations we support. The configuration is private. Callers use those methods to change it."

**Dafna**: "We can also publish functions that return a new configuration."

**Guy**: "Then we have to decide which of those functions belong to the SDK. That's the contract I'm trying to put in one place."

**Oded**: "You're both selling me the same spread with different packaging."

**Guy**: "Yes. I want people to find the operations on the builder they're already holding."

### "I didn't keep the return value"

Chen points at the source preset in Guy's version.

```typescript
const sourcePreset = ExportBuilder.start().source("orders");
const configured = sourcePreset.destination("exports/nightly.csv");

configured.build();
sourcePreset.build(); // Error: TS2684, as with incomplete above.
```

**Chen**: "Does supplying a destination change the preset?"

**Guy**: "It returns a new builder. The preset stays as it was. Otherwise two applications sharing it could overwrite each other's destinations."

**Dafna**: "Which is also why the old reference can keep its old state type. You've got different values carrying the different states."

**Oded**: "Several of our existing builders return `this`. I would have called `sourcePreset.destination(path)` on its own line."

**Guy**: "And discarded the configured value. That call is allowed. The error comes when you try to build the unchanged preset."

Guy leaves the two variables visible. Dafna puts her version below them.

```typescript
const sourceOptions = { source: "orders" };
const configuredOptions = {
  ...sourceOptions,
  destination: "exports/nightly.csv",
};

createExport(configuredOptions);
createExport(sourceOptions); // Error: TS2741, as with the incomplete object above.
```

**Dafna**: "I also have to use the new value. At least the spread tells the reader where it was made."

**Guy**: "A method name doesn't promise mutation. We can document that ours return new builders."

**Dafna**: "Then show what one of those methods does that spreading a field doesn't."

## The Turn

Chen returns to the reporting package's `sourcePreset`.

**Chen**: "Can the application change its source?"

**Guy**: "It shouldn't. The package selects the dataset for its report. The application chooses where the output goes."

**Chen**: "Both of these compile."

```typescript
const repointedBuilder = sourcePreset
  .source("customers")
  .destination("exports/nightly.csv")
  .build();

const repointedData = createExport({
  ...orderSource,
  source: "customers",
  destination: "exports/nightly.csv",
});
// Both jobs now name "customers".
```

**Dafna**: "The final object is complete. `createExport` can't tell that somebody replaced a field while assembling it."

**Guy**: "My method can. Once a source has been selected, calling `source` again should fail. If the application wants a different dataset, it starts a different job."

He replaces `source` inside `ExportBuilder`.

```typescript
// Replacement for the source method in ExportBuilder.
source(
  this: ExportBuilder<S & { source?: never }>,
  source: string,
): ExportBuilder<S & { source: string }> {
  if (typeof source !== "string") {
    throw new TypeError("Source must be a string.");
  }
  if (Object.hasOwn(this.state, "source")) {
    throw new Error("Source has already been selected.");
  }
  return new ExportBuilder({ ...this.state, source });
}
```

**Guy**: "`source?: never` permits the property to be absent but excludes a string. The receiver has to satisfy that condition as well as its existing state. A JavaScript caller also gets the argument check before anything is stored."

```typescript
sourcePreset.source("customers"); // Error: TS2684.
// The 'this' context of type 'ExportBuilder<{ source: string; }>'
// is not assignable to method's 'this' of type 'ExportBuilder<never>'.
// Type '{ source: string; }' is not assignable to type 'never'.
// The intersection '{ source: string; } & { source?: never; }'
// was reduced to 'never' because property 'source' has conflicting
// types in some constituents.
```

**Oded**: "Now my builder is `never`?"

**Guy**: "That intersection requires `source` to be a string and forbids it from having a value. There's no state satisfying both. That's the receiver the compiler says it can't supply."

**Oded**: "The object version's error just said which property was missing. This is going in the documentation too."

**Chen**: "Does the generic helper still work?"

**Guy**: "The destination helper does, in either order. A helper that selects a source needs to require a state without one."

```typescript
function selectOrders<S extends Partial<ExportSpec> & { source?: never }>(
  builder: ExportBuilder<S>,
) {
  return builder.source("orders");
}

const staged = selectOrders(
  forNightlyExport(ExportBuilder.start()),
).build();
```

**Oded**: "So every helper that sets the source has to repeat that constraint."

**Guy**: "Otherwise its parameter would allow a source that was already set. The helper's contract has to say which states it accepts."

**Dafna**: "For this preset, I'd export a function. The application supplies only the part it owns."

```typescript
function ordersTo(destination: string): ExportSpec {
  return createExport({ source: "orders", destination });
}

const fixedSource = ordersTo("exports/nightly.csv");
```

**Guy**: "And another function for the next preset?"

**Dafna**: "For our handful of fixed reports, yes. Or a factory that takes a source and returns this function."

**Guy**: "The manual command picks the path first and hands the builder on. The same `selectOrders` works there. It's one protocol for either sequence."

**Dafna**: "Then that's something to weigh against the protocol's cost. But the orders preset can enforce its rule with this function."

Chen copies Oded's original helper annotation into a new function.

```typescript
function repoint(builder: ExportBuilder) {
  return builder.source("customers");
}

repoint(sourcePreset);
// Compiles. Throws: Source has already been selected.
```

**Chen**: "A typed caller can still ask to set it twice."

**Guy**: "Through the default state again."

**Eli**: "Inside the helper, the known source is gone. The remaining type is also compatible with the receiver that permits setting a source."

**Oded**: "The same annotation broke my build earlier. Now it lets this through."

**Eli**: "It lost the same information both times. Nothing about `{}` establishes that the runtime object has no source. Type parameters affect compatibility through the members that use them, and this class permits that assignment."

The handbook's discussion of [generic type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#generics) follows the members in the same way. Distinct type arguments alone don't make instances incompatible.

**Guy**: "Then the guard is for typed callers too. Keep it."

**Chen**: "And none of this prevents someone starting a new builder for `customers`."

**Guy**: "Correct. The rule protects this preset from being repointed. Dataset permissions still belong to the runner."

## The Debate Continues

Oded keeps the error from `repoint` beside the builder and function examples.

**Guy**: "I'd lead with the builder when packages supply different stages and the SDK needs to control which transitions are allowed. Helpers that retain the state get the static checks. The runtime guards still enforce the rules after someone widens it."

**Dafna**: "I'd lead with `createExport` for callers assembling configuration as data. For fixed presets, publish functions like `ordersTo`. Both have useful checked contracts without making the application carry a builder."

**Oded**: "We have one transition rule today. Does that justify teaching everyone the state parameter?"

**Guy**: "For the shared SDK, I think it does. I want both construction orders to stay inside that API."

**Dafna**: "The manual command can pass its path to `ordersTo` too. Knowing the destination earlier doesn't require passing a builder. Our fixed report functions cover both callers."

**Guy**: "They do. The SDK rejects repointing an existing chain for every package using the builder. With your version, each package author has to export a function like `ordersTo` instead of the data we repointed."

**Dafna**: "And your static check depends on helper authors preserving the state. Otherwise they get a runtime error. I'd accept the package-author responsibility for these fixed presets."

Chen writes down the assignment behind the helper.

```typescript
const lessSpecific: ExportBuilder = sourcePreset; // Accepted.
```

**Chen**: "Should we allow that assignment, given what `source` does with the result?"
