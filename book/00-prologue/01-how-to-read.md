# How to Read This Book

Ask a senior developer any question about TypeScript, and you'll get the same answer: *"It depends."*

Should you use `interface` or `type`? It depends. Should you avoid `any` at all costs? It depends. Should you adopt strict mode? It depends — but also yes.

This book doesn't pretend there's one right way to write TypeScript. Instead, it does what your team does every day: it argues about it.

Here's what that looks like:

> **Marcus**: "Shipped in ten minutes. Works perfectly. I made a business decision."
>
> **Helena**: "Your business decision is my on-call page. Literally. I got paged at 2 AM because of that `Invalid Date`."
>
> **Chen Wei**, quietly: "The question isn't whether to use it. It's what happens when it's wrong."

That's a real exchange from Chapter 1. The code that sparked it, the argument that followed, and the verdict the room eventually reached — that's every chapter of this book.

---

## The Format

Every chapter follows a debate structure:

**The Principle** — An expert states a TypeScript principle. Something that sounds reasonable, maybe even obvious. Something you might nod along to in a conference talk.

**The Debate** — Then the practitioners tear it apart. They challenge it with real-world experience, edge cases, production war stories, and strong opinions. They argue with each other. They show code. They get heated.

**The Turn** — Sometimes, an expert steps back in with an insight that reframes the entire discussion. The kind of moment where everyone goes quiet because the question itself was wrong.

**The Verdict** — Some chapters land on a clear answer. A practical ruling with code you can adopt tomorrow. Others end honestly: *it depends* — and we tell you on what.

Not every debate has a winner. That's not a cop-out. Some questions in software engineering are genuinely contextual, and pretending otherwise would be dishonest. When we say "it depends," we'll tell you exactly what it depends *on*.

---

## The Cast

This book features two tiers of characters:

**The Experts** are the authorities. They set the principles, and they intervene when debates go off the rails. They speak rarely, but when they do, the room listens. Think of them as the senior architects who've seen enough to know what matters and what doesn't.

**The Professionals** are the practitioners who drive every debate. They represent the voices you hear in real engineering teams — the type safety absolutist, the "just ship it" advocate, the data person who won't accept a claim without benchmarks, the FP purist, the OOP defender, and the one person who just asks hard questions until everyone wants to throw something at them.

You'll get to know them in the next chapter. By the third debate, you'll start predicting who's going to object and why. That's by design.

---

## Where We Stand

Every book has a perspective. Here's ours:

We lean toward **functional programming** patterns — immutability, pure functions, declarative code. We think these patterns make TypeScript code safer, more predictable, and often simpler. But we're not zealots. Object-oriented patterns have their place, and we give them a fair hearing.

We believe in **strong typing**. Not because types are fun to write, but because they catch bugs before your users do. We're skeptical of `any`, suspicious of unvalidated type assertions, and enthusiastic about TypeScript's strict mode.

We care about **production**. Theory is valuable, but only insofar as it survives contact with real code, real deadlines, and real legacy systems. If a pattern only works in a greenfield project with unlimited time, we'll say so.

---

## The Code

Every code example in this book is real, compilable TypeScript. No pseudo-code, no hand-waving. When a character claims that an approach is better, they show you the code. When another character disagrees, they show you why the code breaks.

You don't need to run the examples to follow along, but you can if you want to.

---

## How to Read

You can read this book front to back — the chapters build in complexity from basic type system concepts through advanced patterns to production concerns.

Or you can jump to whatever debate your team is currently having. Each chapter is self-contained. If you're in the middle of a migration and someone just asked whether to use `interface` or `type`, go straight to that chapter. The argument is already in progress.

Either way, pay attention to the characters. Their disagreements aren't artificial — they represent genuine tensions in how we write TypeScript. The moments where you find yourself siding with one character over another? That's you figuring out what kind of TypeScript developer you are.

Welcome to the debate.
