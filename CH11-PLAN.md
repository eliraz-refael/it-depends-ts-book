# Chapter 11 — Some Assembly Required

## Disputed decision

Which construction API should the export SDK lead with: a generic builder with
named, constrained transitions, or complete configuration values and preset
functions? Both approaches must reject incomplete typed calls, preserve fields
through their composition helpers, and check unchecked JavaScript input.
Building produces a record for a separate runner; it does not write a file or
authorize access to a dataset.

The reporting package chooses a source for its preset. Applications choose
destinations. The manual command starts from a workspace destination before
calling the reporting package; the nightly job starts from the package's source.
Once a source is selected, this construction chain must not replace it. A caller
can still start a different job; the runner owns dataset permissions.

The design work is separate in PR #5. Chapter 11 is on
`codex/chapter-11-advanced-generics`.

## Cast and stakes

- Guy wants a shared SDK protocol with its supported operations and transitions
  on the builder. His implementation is immutable and assertion-free.
- Dafna wants ordinary configuration values, preserving functions, and concrete
  fixed-source functions. Her alternative catches the same missing field and
  enforces the preset's fixed source without a builder.
- Oded writes consumer helpers and tests what the examples cost an application
  author. The default-state annotation is a plausible mistake with two different
  consequences, not arbitrary confusion.
- Chen asks whether the preset can be repointed, then reuses the broad annotation
  to challenge the new static restriction.
- Eli explains how state knowledge is preserved or lost, and narrows the claim
  after the counterexample. He does not decide the public API for the team.

## Argument and mechanisms

1. Establish the job record and a working builder caller before its missing-field
   diagnostic. A generic carries known configuration facts across operations.
2. Open the implementation: the constraint and default do different jobs, `S`
   appears in the private state member, setters return fresh instances, and
   `build` has a checked `this` receiver. Either order works.
3. A helper taking bare `ExportBuilder` forgets the known source. Its generic
   repair carries the source through. A concrete minimum-shape annotation works
   for source-first calls, but excludes the destination-first caller.
4. Give `createExport` and a plain generic composition helper the same cases.
   Neither the missing field nor value composition alone justifies the class.
5. Keep old preset references unchanged. Returning a new configured value does
   not mutate the old reference; both representations have this property.
6. Chen asks whether the application can replace the preset's source. Both
   original designs allow it. Guy restricts the source transition with a receiver
   intersection and adds runtime checks. Dafna exports a concrete preset function.
7. The default-state annotation admits a configured builder again, now allowing
   a repeat source call to compile. The runtime guard rejects it. The state type
   describes retained knowledge, not an exact inventory of runtime properties.
8. The Debate Continues over the primary SDK API. Guy locates transition-rule
   enforcement in the SDK for every package using the builder; Dafna accepts
   responsibility for each fixed-preset function and points to the helper-author
   discipline required for the builder's static guarantee. The final question
   concerns whether the widening assignment should be permitted, setting up
   variance without teaching it prematurely.

## Joint discovery with Claude

Claude challenged the first draft's let-reassignment Turn: it repeated the
returned-state lesson, while all examples still compared only final shapes.
We replaced it with the source transition and removed the form-draft tangent.

We tested and rejected an assertion-versus-checked-code framing for a generic
preset factory. A shared checked completion function can construct `ExportSpec`
without an assertion. However, omitting all `keyof P` from the required remainder
is wrong for broad or optional `P`; omitting only definitely present keys repairs
that issue. Fixed-field spread precedence also needs a policy. This generalized
factory is outside the manuscript: the concrete `ordersTo` alternative satisfies
the fixed-preset requirement without needing that machinery.

Claude then found the consequential widening counterexample. The checked source
method's static restriction holds for retained specific state, but a bare default
can discard that information. Its runtime guard is necessary for typed callers
too. Claude's scratch probes also verified that invariance rejects the widening;
that is a candidate for Chapter 12, not a missing repair presented as impossible.

The new source method rejects invalid JavaScript arguments before creating a
builder, so `source(undefined)` cannot occupy an unusable source slot.

## Evidence

`checks/chapter11.cjs` reads all 20 manuscript fences, checks 34 compiler cases
and 11 runtime groups on TypeScript 7.0.2, and checks the printed diagnostic codes
and excerpts against actual compiler output. The original and replacement methods
are compiled and executed separately. Three cases also verify the transition rule
without `exactOptionalPropertyTypes`; only diagnostic display differs. The main
profile uses the shared strict settings, including that flag and ES2022.

Primary references:

- https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-parameter-defaults
- https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters
- https://www.typescriptlang.org/docs/handbook/type-compatibility.html#generics

The scenario is fictional and makes no performance or productivity claim.

## Completion

- [x] Draft revised through two discovery exchanges with Claude.
- [x] Manuscript-derived compiler and runtime checks on a fresh locked install.
- [x] Full `npm run check` passes with Chapter 11 included.
- [x] Fresh first-read pass and recheck: no consequential onboarding issue.
- [x] Claude formal review and final records settled; independent chapter and full-suite reruns passed.
