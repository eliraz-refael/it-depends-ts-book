# Codex response to the Chapter 5 draft 1 review

2026-10-21. Draft 2 frozen for targeted recheck, not yet settled.
See the [pass record](../CH5-VOICE-PASS.md) and [snapshot](DRAFT2-SNAPSHOT.json).

| Finding | Disposition |
| --- | --- |
| 1: Principle placement and scope | Applied. The rule follows the null-check exchange and Chen's question. Daniel names `asserts value is User`, limits the claim to returned fields and types, and explicitly separates failure handling. His continuing paragraph has no repeated tag. |
| 2: Repeated annotation-trust explanation | Applied. Dafna's signature challenge leads straight to the always-true body. Removed Noam's “we just said that,” the repeated post-demo explanation, and Daniel's convoluted explicit-annotation comparison. The definition, deletion test, frozen comment, reference table and maintenance Take retain distinct jobs. |
| 3: Noam's strongest predicate use | Applied after the deletion test. Noam wants `inputs.filter(isUser)`; Idan supplies the one-line predicate backed by this handwritten parser; Noam keeps one set of checks. Independently compiled and executed. This is not offered as a wrapper for arbitrary transformations. |
| 3: Idan's propagation answer | Applied. Parse at the handler and pass `User` down. Guy accepts this and retains his preference for throwing to the existing operation handler. The later repeated propagation objection is replaced by that concrete choice. |
| 4: Event boundary | Applied. The request module publishes state changes through an in-process event bus. This explains the event/state relationship and allows the actual `Error` instance the unchanged parser expects. |
| 5: Wording and first-use gaps | Applied. Written versus intended check, concrete email deletion, “your parser,” first-use `assertNever` gloss, and direct speaker openings. |
| 5: Zod reason | Applied in Linoy's introduction and recorded as a limitation. The issue list is text; the Turn returns to the handwritten parser. Independently compiled and executed. |

## Retained limits and judgment calls

- Keep the always-true fence as a small counterexample, without making Noam concede it before it is shown. His reply names that body explicitly so Daniel's intervening inference line is not its antecedent.
- Keep the table and maintenance Take, rather than counting every recurrence of “trusted” as needless repetition.
- Keep the frozen fence comments, cast and open ending. The schema removes duplicate definitions; it does not choose every caller's failure policy.
- No Zod 3 aside, no new claim that a predicate annotation is proved, and no code changes to the examples or registered suite.

## Validation and handoff

All 13 fences remain byte-identical and ordered against `891f1c6`. The locked
install and full suite pass (282/371/105, plus defaults/searches). The full run
preceded only the final prose antecedent clarification; no example changed.
`INLINE-PROBES.cjs` passes two compiler probes and two runtime groups on the
final draft; these are recorded separately from the suite totals.

Claude's discovery, baseline reader, draft 1 readers and review are included
unchanged in this handoff commit. Please recheck the moved Principle, Noam's
filtering reconciliation, Idan's reply to the propagation objection, the event
setup and the reduced repetition. No approval is claimed on the readers' behalf.
