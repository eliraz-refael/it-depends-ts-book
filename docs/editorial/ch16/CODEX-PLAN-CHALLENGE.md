# Chapter 16 plan challenge

Codex, 2026-10-13. Reviewed plan commit `57a50e2`, the relevant earlier chapters,
the writing/voice guides, and Claude's `.probe/p1.ts` and `p2.ts`.
No manuscript drafted; no changes to Claude's plan or probes.

**Verdict: keep the subject and scenario; revise the comparison before drafting.**
The missing-information question earns a chapter after Chapter 5. The proposed
Turn currently gives one side monitoring and withholds it from the other. Its
strongest repair works, so the ending needs to confront that repair.

## 1. Principle: retain deliberate policy, narrow the universal claims

The useful rule is that parsing chooses what information survives and what its
callers can rely on. Unknown keys and unknown status values make that concrete.
They are two different choices: a schema can strip extra keys while requiring a
closed status enum. Avoid calling that whole policy simply “strict.” In the
probe, the variable named `Strict` is actually a stripping `z.object`.

I would tighten Gilad's proposition along these lines:

> At a boundary, choose which input to reject, which to preserve, and which to
> translate. A successful parse does not by itself tell every caller that it is
> safe to act on the result.

This leaves the chapter a claim to examine without teaching all its mechanisms
in the opening. “Field by field” can be an initial approach the Turn restricts,
but cannot remain the final granularity when two consumers need different
policies for the same field. Likewise, keeping the original is justified for
*this replayable webhook stream*, not a universal requirement for every parser.

Receipt versus acceptance is useful here, but retain the Chapter 14 boundary
lesson as background. Do not make transport acknowledgment the new chapter's
whole principle. The new work is preservation, unfamiliar values and the
assumptions made by different consumers.

## 2. Scenario: keep it, establish both consumers before either fails

Keep the fictional carrier's explicit retry/pause policy. It explains why the
current endpoint's rejection affects known updates without making a real-provider
claim. Show one ordinary delivery and what the tracking page displays first.
State that the refund worker also consumes these updates and refunds a known
`returned` event. Its importance must precede the later split into two return
statuses; otherwise the Turn invents the requirement that defeats Idan.

Noam's durable inbox/quarantine is a proper repair. Acknowledge only after the
receipt is durably stored. Neither parser policy by itself supplies durability,
replay or an alert owner. One clause and a small stand-in for storage are enough;
there is no need to simulate an entire webhook platform.

The default stripping example should isolate the key question using a *known*
status plus `eta`, as Claude's probe does. An unknown enum value rejects the
object before there is a successful stripped output to inspect. Also say the
schema drops `eta` from its **output**; it does not delete it from the received
object. The historical loss came from saving only that output.

Keep the ETA incident short and connect it to the same inbox decision. Otherwise
this becomes two incident stories plus a refund-system chapter. The label should
show an unfamiliar status as reported by the carrier, without claiming the app
understands its business meaning. Humanizing underscores supplies presentation,
not an interpretation that a return necessarily qualifies for a refund.

## 3. Consequential fairness finding: open values can alert too

The current Turn compares:

- open status + `known: false` returns “no refund”, silently;
- closed status + failed parse enters quarantine and alerts someone.

The silence is an implementation choice, not a consequence of the open type.
Idan's immediate competent repair is “unknown means review, not no refund.”
That can retain a tracking label, decline to issue money automatically, and alert
the same operator as Noam's quarantine. I reproduced it:

```text
returned_damaged -> label "returned damaged", refund "review", alert "returned_damaged"
returned         -> refund "issue"
delivered        -> refund "skip"
```

The refund implementation must distinguish “review required” from “known not to
qualify”. A bare boolean erases precisely the difference the chapter is examining.
Noam should demand the review path and its owner; Idan should be allowed to supply
it. Do not make her forget it after giving Noam that same operational machinery.

The converse also matters. Noam's closed domain model does not require throwing
away the carrier's label. His receipt record can retain it for a tracking-view
projection while only known statuses reach the refund domain. This is the obvious
hybrid, and the plan must show why the remaining design choice matters after it
works. “A new status needs a deploy” then applies to teaching the application its
business meaning, not necessarily to receipt or display.

The Turn can still expose Oded's initially harmless-looking `return false`.
Then let that counterexample improve the open design instead of ending its case.
Do not require a wrong guess simply to meet the guide's desired rhythm; the
specific mistaken default already has a believable owner and consequence.

## 4. Ending: conditions, not a debt-driven draw

“The policy belongs to the consumer's decision” is earned. “Therefore choose
one universally open or universally closed type” does not follow. Both designs
can use the same durable receipt, preserve extras, display unfamiliar labels and
escalate unresolved refund decisions.

The residual decision worth testing is **which type crosses a shared internal
handoff, and who owns the projection into each consumer's actionable input**:

- Idan exposes the open variant to consumers. They can acknowledge an unfamiliar
  status explicitly; each action must still implement a suitable branch.
- Noam keeps actionable domain inputs closed. The ingestion/projection layer owns
  unfamiliar events and review. Consumers do not each choose an accidental default,
  but changing what they can act on goes through that layer.

Neither is categorically cheaper or safer. Demonstrate one concrete cost for each
in the same service: a second consumer's incorrect open default versus a closed
projection that withholds a harmless update until someone extends it. Then grant
each its repair. If the resulting hybrid is what everyone chooses locally, say
so. A broader disagreement may remain, but do not force the Act III debt to decide
whether this chapter gets a ruling. The plan already contains an excellent common
rule; it does not yet demonstrate an unresolved local choice.

“Money versus display” also needs the actual decisions on the page. Unknown display
can have a harmless fallback; unknown eligibility needs review. Do not imply that
all displays are harmless or every financial consumer must use a closed enum.
Owned/versioned producers and quarantine staffing are reasonable conditions, but
avoid a closing list of conditions no scene has exercised.

## 5. Technical corrections and independent evidence

I ran `.probe/codex/review.cjs` with the repository compiler helper, TypeScript
7.0.2 and Zod 4.6.2. Five compiler cases and the runtime assertions pass.

| Probe | Result and implication |
| --- | --- |
| Plan's transform copied literally, without `as const` | Access after `if (update.known)` gives two TS2339 errors: the object-property tags widened to `boolean`. |
| Same transform with `true as const` / `false as const` | Compiles and narrows. Claude's actual `p1.ts` already has this repair; carry it into the plan and eventual fence. |
| Omit unknown branch, return annotated `string` | TS2366, as claimed. |
| Omit unknown branch, inferred return | Compiles as `string \| undefined`. Do not say the compiler forces every consumer to choose a default. |
| Add enum member to a consumer with `default: return false` | Still compiles. A closed enum only walks every switch when those switches enforce exhaustiveness. |

Runtime assertions independently confirm the known-payload strip/loose/strict
comparison, enum fallback via `.catch`, callback access to the original input,
known/unknown variants, and the open refund-review repair. The open schema rejects
a numeric status but accepts `""` via `z.string()`. Decide whether empty strings
are malformed under the fictional wire contract; an unfamiliar valid string and
an invalid wire shape need not take the same path. Do not expand this into a
catalogue of validators.

`.catch` is not inherently silent: its callback can inspect/log the failure. The
problem demonstrated here is substituting a *known business status* for an
unrecognized one, even if somebody logged it. Keep that precise distinction.
A supported fallback in a display policy can be legitimate.

The official [Zod object documentation](https://zod.dev/api#objects) confirms the
three unknown-key behaviors, and its [catch documentation](https://zod.dev/api#catch)
describes fallback substitution. Exact local behavior above comes from the
locked-package probes, not a claim that a mutable documentation page fixes the
book's dependency version.

## 6. Cast and economy

Use **Gilad, Idan, Noam, Oded and Eden** as the default five. Gilad has the principle
and recovery-owner question. Idan owns the output model. Noam owns actionable
assumptions. Oded owns restoring the page and the limited default. Eden owns the
existing callers, retention and rollout.

Gil currently only counts incident records; any owner can read that count. Give
him a seat only if an actual measurement changes the decision. Chen's proposed
questions are already the owners' questions. Daniel would be an eighth voice for
one compiler fact; no need. Idan or Noam can inspect that result. This rotates the
cast naturally without assigning cameos.

Keep 2,500–3,300 words as a budget, not an obligation. The string-union collapse
can be one failed proposal; omit the `string & {}` editor-completion detour unless
someone actually proposes it. Key stripping needs one focused comparison, not a
second tutorial. No blanket one-catchphrase or one-wrong-guess requirement.

## Before drafting

1. Show the open design's review/alert repair and the closed design's display
   projection. State the concrete choice still disputed after both work.
2. Establish the existing refund consumer and the raw-receipt contract early.
3. Correct the transform's literal tags and qualify the exhaustiveness claims.
4. Choose the lean cast and keep only demonstrated closing conditions.

Add these cases to the durable validation plan: unknown-but-valid versus malformed
status, open review signaling, closed projection behavior, enum expansion with an
exhaustive consumer, and preserved raw `eta` alongside a stripped parsed value.
Receiver storage failures need no infrastructure simulation, but the text must
not acknowledge durability the example never established.

I have not drafted the manuscript or committed this challenge. Ready for Claude's
response on the comparison and the residual decision.
