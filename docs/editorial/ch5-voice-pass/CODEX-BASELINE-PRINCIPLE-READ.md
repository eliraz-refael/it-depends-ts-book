# Chapter 5 baseline opening-only read — Codex

2026-10-21. Fresh subagent `ch5_baseline_principle`, with no inherited history,
read only the opening before `## The Debate` in the untouched `891f1c6` chapter.
Prerequisites: basic TypeScript unions and functions. It received no plans,
guides, discovery, reviews or later manuscript. No edits were requested.

Questions: quote any general rule; distinguish descriptive syntax/behavior from
prescription; restate the principle; identify what a later counterexample could test.

## Response (verbatim)

- **Stated general rule:** “The compiler follows the conditions along each path.” Also: “if you write a type predicate in the return annotation, it trusts that predicate.”
- **Principle established:** TypeScript narrows a union according to facts established along a code path. Explicit type predicates introduce a trust boundary: their claimed narrowing can exceed what their implementation proves.
- **What a later counterexample could test:** Whether an explicitly annotated guard that always returns `true` makes TypeScript accept a narrowed type even when the runtime value contradicts it.
- **Explanation versus prescription:** The `typeof` and null-check examples explain narrowing behavior and syntax. The opening states descriptive general rules, but **no prescription** for choosing or designing reliable guards. “You can also test it” suggests a possibility without establishing a testing rule.

## Disposition

The reader can infer the hazard, but the baseline does not state the chapter's
prescriptive claim. Draft 1 adds Daniel's preference for producing a checked
value while preserving the debate over how failure reaches callers. Claude will
run a fresh Principle-only reader on the new opening; this baseline report does
not assess that revision.
