# Ch9 Plan — Template Literal Types

**Status:** outline agreed and Chapter 9 drafted and revised on 2026-09-21. Self-review, independent Codex review, and Claude review are settled; see `CH9-REVIEW.md`. Chapter 8 is committed as `1ecd528`. The manuscript is `book/02-advanced-typescript/03-template-literal-types.md`.

**Working title:** Where Did This Event Come From?

**Target:** `book/02-advanced-typescript/03-template-literal-types.md`

## The disputed decision

Linoy's follow-up PR constructs settings event names from property keys. Oded can find a subscriber by searching for the full event name in a log, but the generic producer contains only a key and a suffix. Should the team adopt that producer, retain literal names at emission sites, or introduce a runtime registry?

The question concerns the path from a log to code worth inspecting. A literal, a registry, and a type signature cannot by themselves identify which execution produced a particular log entry. Keep source traceability separate from runtime provenance.

Both literal and constructed names can use the same template-typed signature. This gives the debate somewhere to move: accepting the type does not decide how every caller should spell its event name.

## Continuity and cast

- Chapter 8 ends with Linoy promising `emailChanged` from `email`. Open with the follow-up PR Oded asked for. Use preferences with mixed value types so the payload relationship matters.
- Chapter 1 already established an explicit event-name/payload map. Treat that as the competent existing alternative, not something the cast has forgotten.
- Oded's earlier preference for names he can grep now has a concrete test. He drives the review, tries the search, and asks what maintaining the replacement costs.
- Linoy wants a reusable observer and fewer independently maintained relationships. Let her move ahead to another use before the immediate objection is answered, where the exchange warrants it. Her working construction must receive a fair hearing.
- Gilad brings a log entry and asks which write could have emitted it. Once that practical issue is visible, let Oded and Linoy argue the change.
- Daniel establishes compiler behavior through small examples. He does not decide the team's tracing conventions for them.

Calibrate against Chapter 7 and the writing/voice guides. Keep speaker attribution clear, use the search and diff as actual evidence, and avoid quotas for jokes, mistakes, catchphrases, or concessions. Do not use narrator commentary to declare the lesson or the winner.

## Teaching goals

1. Show interpolation over string literal types and the resulting finite union.
2. Show that two union substitutions form a cross product, including combinations the domain may forbid.
3. Build on mapped types with key remapping and preserve each property's value type.
4. Infer a property key from a literal event name at a call site, without introducing the explicit `infer` keyword scheduled for Chapter 10.
5. Separate a compile-time description of names from JavaScript that actually constructs or reads them.
6. Compare source navigation costs through code and a reproducible search, without claiming universal tooling failure.

## Running example

```typescript
type Settings = {
  theme: "light" | "dark";
  fontSize: number;
  autoSave: boolean;
};

type SettingKey = keyof Settings & string;
type ChangeEvent = `${SettingKey}Changed`;

type ChangeEvents<T> = {
  [K in keyof T & string as `${K}Changed`]: T[K];
};

declare function publish<K extends SettingKey>(
  name: `${K}Changed`,
  value: Settings[K],
): void;

publish("fontSizeChanged", 16);

function publishChange<K extends SettingKey>(key: K, value: Settings[K]) {
  publish(`${key}Changed`, value);
}
```

These declarations are checked signature examples, not an implemented event bus. The chapter should exercise the relevant runtime name construction and emission paths without becoming an emitter-library implementation tutorial.

## Chapter shape

1. **Principle and opening:** Gilad has a settings event in a log; Oded has Linoy's follow-up diff. Daniel establishes the small interpolation example. Show what names it admits before arguing policy.
2. **The existing map:** compare the explicit event map with `ChangeEvents<Settings>`. Both preserve the same demonstrated names and payloads. A callback for `fontSizeChanged` receives a number; a misspelling and an inappropriate operation fail. The improvement under discussion is how the relationship is expressed and maintained.
3. **The search:** search a small, complete example containing both subscribers and a constructed producer. The whole event name finds the subscriber. It does not occur literally in the generic emission site. Follow the wrapper to show the extra navigation, and let Linoy show why that wrapper remains understandable. Do not claim the name is absent from all source or that IDE navigation fails without reproducing it.
4. **The product grows:** Linoy extends the naming idea to an existing domain event vocabulary. `${Entity}:${Action}` admits `profile:paid` when `Entity` is `"profile" | "invoice"` and `Action` is `"created" | "paid"`. Allow the repair: map each entity to its permitted actions, then index the mapped result to obtain the valid union. Compare it with the equally correct explicit union. Keep this movement brief; the compiler knows the combinations supplied to it, not which business events ought to exist.
5. **The turn:** a literal call and a constructed call both compile against the same `publish` signature. An objection about finding the producer does not require discarding template literal types. Oded can retain a literal at one emission site while accepting Linoy's generic path elsewhere.
6. **Local verdict:** adopt the checked signature and the generic helper for the ordinary settings-control path. Keep explicit literals in the existing preferences-restore path whose emissions the team inspects individually. Demonstrate those particular call sites before ruling on them; do not invent a blanket policy that every production event needs a literal. If the eventual implementation shows no useful distinction between the paths, revise this division instead of forcing the planned compromise.
7. **Additional Takes:** choose a few that answer questions left by the examples: union-parameter correlation, overly narrow `as const` defaults, or a compact intrinsic string transformation. Do not introduce a second string-parsing tutorial to preview `infer`.

The ending should show the accepted code and any remaining objection. Linoy's working abstraction is used. This is not a third chapter whose local decision simply parks her proposal, nor does the cast need to agree on a universal event-naming policy.

## Alternatives that must survive examination

| Approach | What it buys | What it costs |
| --- | --- | --- |
| Literal names at emission sites, checked by the shared signature | The full name appears at that producer; misspellings and demonstrated payload mistakes are rejected | The name is repeated, and several producers may share it |
| Construct names in the generic helper | One convention handles the regular property-change path; the demonstrated construction remains checked | Searching the full name does not directly find that emission statement; the reader follows the helper |
| A checked runtime name registry | One explicit inventory of names, with required keys and field/name correspondence checked | Handwritten entries and another reference to follow; it helps trace producers only when running producers actually use it |

The registry remains a legitimate option, not the predetermined ending:

```typescript
const eventNames = {
  theme: "themeChanged",
  fontSize: "fontSizeChanged",
  autoSave: "autoSaveChanged",
} satisfies { [K in SettingKey]: `${K}Changed` };
```

Show its runtime use if it enters the manuscript. A disconnected label table cannot establish the route to an emitter. Avoid repeating Chapter 8's labels-and-completeness conclusion.

## Technical limits to preserve

- Template literal types describe strings and may generate unions at compile time. They do not generate runtime strings. Both handwritten and constructed values can satisfy them; neither use is universally preferred.
- The simple publisher rejects the demonstrated wrong literal name and payload. Do not claim it enforces correlation for every possible instantiation: `publish<SettingKey>("fontSizeChanged", false)` compiles. Independently widened name and value unions can lose their pairing. If correlated unions become a requirement, examine a discriminated event union separately rather than quietly overstating this signature.
- An explicit allowed-pairs union and the repaired per-entity mapping are both valid. Domain-invalid members of an unrestricted cross product are not a compiler defect.
- A literal or registry entry helps find source references; proving the origin of a particular occurrence requires runtime context. Name that limit where Gilad's question needs it.
- A mutable setting inferred from `as const` may be too narrow: a default `fontSize` of `14` is not the intended domain of all future font sizes. Chapter 4's fixed-vocabulary advice remains valid.
- Do not claim large-union errors are always unreadable or slow. Diagnostics can abbreviate a union and suggest a close match. Any latency claim needs a measurement.

## Validation and sources

Proposal checks ran under TypeScript **5.9.3**, with strict checking: **22 compiler cases**, including expected failures and two accepted union-correlation counterexamples. Runtime checks covered name construction and registry-backed emission. These validate the proposals, not an unwritten chapter or a full observer implementation.

The draft now has a durable validator at `checks/chapter9.cjs`. It extracts the actual chapter snippets, compiles the original and revised feature files, verifies expected diagnostics and inferred types, exercises the runtime paths, and reproduces both printed source searches. The earlier temporary proposal scripts are no longer required.

Primary references: the [template literal types handbook](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) covers interpolation, cross products, call-site inference, and string transformations; the [mapped-types handbook](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as) covers remapping keys with `as`.
