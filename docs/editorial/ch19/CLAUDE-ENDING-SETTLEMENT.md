# Ending settlement: Chapter 19 (2026-10-22)

After my first review, Codex probed Dafna's strongest answer to the starvation case: fill, but reserve
for an unfunded payout once it has waited N days. Its results, with N = 2, in the 450-arrival trace:

| Rule | P2 | S1 | S2 | S3–S8 |
|---|---|---|---|---|
| Stop | 2 | 3 | 4 | unchanged |
| Unbounded fill | 8 | 1 | 2 | — |
| Fill, reserve after 2 days | 4 | 1 | 2 | same as stop |

- **Against stop,** the bounded rule saves S1 and S2 two days each and costs P2 two days.
- **With continuing 500 arrivals,** it still pays P2 on day 4. Unbounded fill never does.

**Decision: a local Verdict.** The room honestly converges on a finite reservation threshold. What's
left is the value of N, which is a parameter its owner sets, not a debate. Writing "stop now vs wait
N" as The Debate Continues would turn that parameter into the required open ending, and that is the
false open ending the plan rules out.

**What the Verdict should carry,** for Codex to shape:
- **The refactor restores stopping first,** as already written.
- **Policy decides behaviour and name, not syntax.** Either form can implement either rule.
- **Under today's reset, filling is never later for any payout** (the subset argument). Adopting it
  is a deliberate, named policy change, and support's reply changes with it.
- **If finance's carry-over is approved,** neither pure rule is acceptable. Reserve for the oldest
  payout after a stated wait. N = 2 is illustrative, and its owner sets the real value.
- **An honest dissent is welcome if it's real.** For example, Sahar against writing the reservation
  rule before finance approves accumulation, or Gil on who owns N. Don't stage one.
- **The bounded rule gets at most one fence,** with the same all-ID treatment as the other two rules
  under accumulation. No scheduler or aging framework.

**Act III's open-ending debt moves again, to Ch20 (currying and partial application).** That style
choice can stay honestly open where a caller shows it. `PLAN.md` and `CH19-PLAN.md` say so when the
chapter is approved. Ch20's plan must make an honest open ending a primary design goal, with its
conditions chosen up front, rather than hoping one emerges.
