# Fresh opening-only read — Chapter 16

2026-10-13. Agent task `ch16_principle_only`, spawned with no inherited history.
The supplied excerpt was the chapter title and opening through the initial
paragraph naming tracking and refunds. No file access was requested or used.
The rest of the manuscript and the intended outcome were not supplied.

Questions: quote the general principle; restate it without the story; propose
a disagreement or counterexample that could test it.

## Reader response (verbatim)

1. **General principle:** “At a boundary, choose which input to reject, which to preserve and which to translate. A successful parse doesn't by itself tell every caller that it's safe to act on the result.”

2. **Restatement:** An input boundary needs explicit rules for rejecting, retaining, and converting data. Parsing establishes only what its checks guarantee; each consumer must still establish whether those guarantees justify its intended action.

3. **Testable disagreement:** Could one parser enforce every condition required by all its consumers, so successful parsing *does* authorize their actions? Test whether any accepted input remains unsuitable for even one consumer’s action. If none does, that challenges the need for additional consumer checks, though it remains consistent with “doesn't by itself.”

## Author triage

The general rule was recoverable without the story. The proposed challenge is
consistent with a parser that produces consumer-specific actionable inputs;
the principle does not demand repeated validation at every call. No opening
edit was required. This test does not replace Claude's planned full reader.
