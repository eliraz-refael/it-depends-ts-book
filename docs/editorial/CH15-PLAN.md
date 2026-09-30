# Chapter 15 — What the Number Means

Status: **SETTLED**, jointly with Claude; final checks and reader rechecks complete.
Branch: `codex/chapter-15-branded-types`, based on merged Chapter 14.

## Scope and principle

The user's Chapter 14 feedback requires a general, restatable proposition
before the story. A whole-chapter reader inferring the lesson afterward does
not establish that the opening stated it. Require a Principle-only reader and
a fresh full reader, isolated from plans, author discussion and validators.

Brands distinguish meanings with the same representation. If a brand also
records a checked fact, ordinary checked constructions and transformations
must preserve that fact for the brand to remain trustworthy.

Avoid repeating assertions (Ch2), parsing (Ch5/Ch16), variance (Ch12) or a
complete immutability treatment (Ch17). No `any` or deliberate assertion at the
failing call. A local decision can preserve an informed dissent.

## Discovery

Codex and Claude independently reproduced the mechanisms on TypeScript 7.0.2.
String aliases and named parameters do not distinguish roles. Required
unique-symbol intersections do; optional markers admit unbranded primitives.
Arithmetic and explicit widening lose a numeric brand. Constructors can check
a numeric predicate but cannot determine whether a caller intended a position
or a count.

Declined scenarios:
- Entity IDs: a format check cannot establish identity, existence or
  relationships. Useful limits, but an ingress-centered Turn overlaps Ch16.
- Claude's money/currency case: independently valid generic-inference and
  runtime-currency issues, but too much machinery for the first branding
  chapter. NoInfer, invariance, correlation and provider-specific exponents
  would compete with the main subject. Claude withdrew its proposed
  code-decides/data-decides principle: a brand can legitimately record a
  predicate established from runtime input.

Chosen case: the export dialog holds inclusive endpoints, while its renderer
takes first/count. `count: selection.last` is the initial bug, so an options
object cannot be the unexamined alternative to brands.

The scalar brands work. A checked endpoint object then keeps its brand through
an ordinary immutable spread that reverses the endpoints. Neither hiding the
symbol nor freezing the original prevents this copy. Checked reconstruction
works, but the type does not require callers to use it.

A private class member rejects the spread. Private/readonly alone still
permit mutation through a structural alias; freezing the primitive fields
prevents the write at runtime. The durable suite retains both variants.
No claim that the mutating call itself becomes a compile error.

First/count removes the ordering relation, but keeps the safe-integer endpoint
guard. A check after naive addition can miss rounding at MAX_SAFE_INTEGER;
subtract before adding. This edge stays in the fixture rather than becoming a
floating-point lesson.

## Argument and strongest alternatives

Cast: Eli, Noam, Oded, Eden, Chen. Idan rests before runtime validation; Guy and
Dafna rest after the transaction debate. Eden is he.

1. Explicit principle; functioning numbering API before wrong named input.
2. Primitive brands, controlled constructor assertions, deliberate role choice,
   actual compile failure and successful conversion.
3. Endpoint object brand intended to remove repeated consumer order checks.
4. Turn: ordinary copy retains the brand; requestOf trusts it and produces a
   zero count. The original renderer rejects the numeric request.
5. Checked reconstruction works. Frozen private class also works, with a
   real existing mutator that remains accepted but throws.
6. First/count survives a position edit as a span but moves the To endpoint.
   A From/To form must temporarily hold reversed endpoints while editing.
   Neither checked representation can serve as the complete draft.
7. Owners choose endpoint drafts and one checked conversion to the renderer's
   scalar-branded request, with different preview/export failure responses.
   Noam retains a frozen-class preference for accepted endpoint consumers.

Claude's outline challenges narrowed the disputed decision from dialog state
to what consumers receive, made the final conversion concrete, and kept
Noam's dissent instead of another proposer-withdraws ending. The chapter has a
local Verdict; Act III still needs an honest Debate Continues elsewhere.

## Validation

`checks/chapter15.cjs` extracts all 13 fences. Initial passing coverage:
25 compiler cases / 13 runtime groups. The same-renderer revision adds the
class conversion and original object-alias cases: 27 compiler cases / 15 runtime
groups. Final read-method alternative regressions bring this to 30 compiler
cases / 16 runtime groups. Final counts and limitations belong in
checks/README.md and CH15-REVIEW.md.

## Completion

- [x] Discovery and outline challenged with Claude.
- [x] Draft and initial self-review complete.
- [x] Initial isolated Principle-only and full Codex readers complete.
- [x] Every manuscript fence exercised by durable compiler/runtime checks.
- [x] Final reader findings resolved and Claude formal review settled.
- [x] Final full suite and master tracking complete.
