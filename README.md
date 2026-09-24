# It Depends

**TypeScript Principles, Debated**

---

A TypeScript book where experts argue, disagree, and sometimes agree — just like your team does.

Every chapter presents a TypeScript principle, then puts it on trial. Fictional experts and practitioners debate the principle from every angle: type safety vs velocity, theory vs production, FP vs OOP. Some chapters end with a clear verdict. Others end with the most honest answer in software engineering: *it depends*.

## How This Book Works

Each chapter follows a debate format:

1. **The Principle** — An expert states a TypeScript principle
2. **The Debate** — Practitioners challenge, defend, and counter-argue
3. **The Turn** — A key insight reframes the discussion
4. **The Verdict** — A practical ruling (or an honest "it depends")

The cast of characters represents the voices you hear in every engineering team — the type safety absolutist, the velocity advocate, the data-driven analyst, the FP purist, the OOP defender, and more.

## Reading the Book

The source lives in `book/` as Markdown files, organized by act:

- **Act I** — The Type System
- **Act II** — Advanced TypeScript
- **Act III** — Patterns & Design
- **Act IV** — The Real World
- **Bonus** — AI & TypeScript

## Contributing

This book is open source. If you find errors, have suggestions, or want to propose a debate topic, open an issue or PR.

## Checking the Examples

The book targets **TypeScript 7**. The reproducible baseline is **7.0.2**, pinned in `package.json` and `package-lock.json` alongside the examples' library dependencies.

With Node.js 22 or later, npm, and [ripgrep](https://github.com/BurntSushi/ripgrep) installed:

```sh
npm ci
npm run check
```

The checks read the manuscript's TypeScript examples, supply their surrounding context, verify intentional errors, and exercise selected runtime behavior. See [checks/README.md](checks/README.md) for coverage, compiler options, and the upgrade procedure.

## License

[TBD]

## Disclaimer

All characters in this book are entirely fictional. Any resemblance to real persons, living or dead, is purely coincidental and unintentional. See [DISCLAIMER.md](DISCLAIMER.md) for details.
