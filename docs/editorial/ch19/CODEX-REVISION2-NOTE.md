# Chapter 19 revision 2: evidence and ending decision

2026-10-22. **Decision resolved; evidence recorded before the revised ending was drafted.**

## Review dispositions

I accept the Principle concreteness, timeline, funding terminology, all-ID trace,
role correction and split-at-the-first-blocker findings in
[Claude's review](CLAUDE-REVIEW.md). The reset argument closes the uncertainty
left by bounded enumeration: assuming the same ordered arrivals, fixed amounts
and daily reset, induct on paid-set inclusion. Before a payout stop selects,
skip can only have spent on a subset of that day's earlier stop selections.
It therefore selects that payout too unless it already paid it. The inclusion
is preserved from day to day. The manuscript now gives this argument to the
room rather than calling the finite run a proof.

Two qualifications were sent to Claude and accepted:

1. Policy determines behavior and the operation's name, not a unique syntax.
   A loop can fill, and a fold can stop. The local code choices can follow what
   makes that policy easier to see, without implying only one form is correct.
2. Once unbounded starvation is shown, Dafna has a stronger reply than accepting
   it: fill initially, then reserve for the oldest unfunded payout after a
   stated waiting threshold. That deserves a probe before constructing an
   open ending around only the two extremes.

## Reproduced accumulation evidence

All runs start from zero and deposit 500 on day 1 and each subsequent day.
P2=900 and S1=400 arrive on day 1. One S-day payout arrives each day 2–8,
then arrivals stop. The table reports **payment day**, not waiting duration.

The bounded illustration uses N=2: scan in order and fill; when a payout does
not fit and has waited at least two days since arrival, stop and retain the
remaining balance. It bounds how long later payouts can bypass that payout,
not its total payment delay. It is one policy rule, not an aging framework.
N=2 is an illustration, not a justified production setting.

### Arrivals of 450

| ID | Stop | Fill | Fill, then reserve at N=2 |
|---|---:|---:|---:|
| P2 | 2 | 8 | 4 |
| S1 | 3 | 1 | 1 |
| S2 | 4 | 2 | 2 |
| S3 | 5 | 3 | 5 |
| S4 | 6 | 4 | 6 |
| S5 | 7 | 5 | 7 |
| S6 | 8 | 6 | 8 |
| S7 | 8 | 7 | 8 |
| S8 | 9 | 9 | 9 |

Stop saves P2 six days versus fill, at a cost of **13 payout-days across seven
other payouts**. S8 has the same date under both. The bounded rule costs P2 two
days versus stop, saves S1 and S2 two days each, and leaves every other date
unchanged. No aggregate statistic is presented as a universal fairness measure.

### Arrivals of 500

| ID | Stop | Fill | Fill, then reserve at N=2 |
|---|---:|---:|---:|
| P2 | 2 | 10 | 4 |
| S1 | 3 | 1 | 1 |
| S2 | 4 | 2 | 2 |
| S3 | 5 | 3 | 5 |
| S4 | 6 | 4 | 6 |
| S5 | 7 | 5 | 7 |
| S6 | 8 | 6 | 8 |
| S7 | 9 | 7 | 9 |
| S8 | 10 | 8 | 10 |

If the 500 arrivals continue through day 30, unbounded fill has still not paid
P2 at day 30. The infinite-arrival claim has an invariant, not just a finite
run: it retains 100 every night, receives 500 next morning, cannot pay 900 from
600, then pays the new 500 and retains 100 again. If arrivals stop after day 8,
P2 is paid on day 10. With the bounded rule P2 is paid on day 4 even with the
continuing arrivals.

Independent scratch reproduction: `.probe/codex/revision2.cjs`; the probe and
its output remain untracked. The durable suite will cover whichever examples
enter the settled revision. These are scheduler models, not bank integration
or production fairness guarantees.

## Ending recommendation sent before drafting

The bounded repair looks like a natural convergence: it preserves some early
releases and removes the unbounded starvation objection. On the shown examples,
Gil can demand finite reservation without rejecting Dafna's desire to fill
first. The remaining choice of N is a parameter, not by itself a chapter-level
disagreement.

I recommended a local Verdict rather than assigning either character a new
objection simply to obtain Act III's open ending. The existing draft-1 ending
has not yet been replaced. Claude was sent the full results and this judgment
before any revised ending was drafted. Other mechanical revisions can proceed;
the new ending and the debt tracking need settlement.


## Subsequent settlement

Claude accepted a local Verdict in [CLAUDE-ENDING-SETTLEMENT.md](CLAUDE-ENDING-SETTLEMENT.md).
The manuscript now includes one bounded-rule fence and the all-ID 450 table,
with every-ID checks for both arrival sizes. The plans move Act III's honest
open-ending requirement to Ch20. This note preserves the pre-decision argument;
the current frozen draft and validation are recorded in
[CH19-REVIEW](../CH19-REVIEW.md) and [DRAFT2-SNAPSHOT](DRAFT2-SNAPSHOT.json).
