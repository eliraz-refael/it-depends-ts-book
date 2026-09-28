# Chapter 13 — Who Loaded It?

Status: **SETTLED**. Drafted and revised with Claude; formal review and the
independent first-reader recheck pass with no consequential findings. The full
compiler/runtime suite passes.
Work is isolated on `codex/chapter-13-module-augmentation`.

## Question and scope

What should an application-owned augmentation promise about a method installed
by a plugin? Which dependency makes that promise visible to the compiler, and
which dependency makes it true at runtime?

This closes Act II. Chapter 3 already taught interface merging, global Express
augmentation, and the fact that declarations do not install middleware. The
new case examines multiple entry points, declaration-file scope, and a type-only
edge which makes even a separate entry-point compilation accept a runtime path
that never loads the plugin.

The registration application uses the fictional JavaScript `label-kit` and its
`frame` plugin. The package's declarations describe `Label`, its constructor,
text, and renderer. The plugin modifies the prototype and returns the same
instance, but its published types omit that member. The app supplies the
augmentation. Plain-label behavior, plugin behavior, and the shared formatter's
purpose all precede the first failure.

## Argument and cast

- **Oded** wants the existing working plugin call described accurately and the
  missing import repaired without changing every caller. He supplies a runtime
  integration module and keeps its demonstrated success on the page.
- **Idan** asks where the promised capability comes from. She changes the
  app-owned member to optional and checks it in the one shared formatter. She
  keeps the runtime integration import: a better error is not installation.
- **Dima** proposes checking each entry's dependency graph separately, then
  narrows that proposal when a type-only import exposes the augmentation anyway.
  He states the conditions for a required declaration and the local decision.
- **Chen** tests those claims by restoring the old batch import, distinguishes
  type visibility from execution, and examines the ambient-module footgun.
- **Gilad** follows the failure into the shared formatter and insists that each
  entry actually run in a fresh process. A combined test would let the web entry
  install the plugin on behalf of the faulty batch.

The sequence is required augmentation → shared-program failure → working runtime
bridge → useful but limited separate-entry checking → erased type-only edge →
optional member plus the existing bridge and one checked formatter.

The Turn is a deliberate test of the claim that the compiler will reject
bypassing the bridge. No character is made to forget how the plugin works.
`renderBadge` takes a label, so its type-only import from the integration module
has a genuine purpose. The bridge remains correct when the constructor is
actually imported through it.

## Alternatives and discovery restrictions

Discovery initially considered a verdict for a required augmentation maintained
by an import restriction and startup tests. The stronger optional alternative
changed that outcome: this app has one shared formatter, so one guard is enough.
There is no demonstrated cost advantage to making every `Label` appear framed.
Required declarations remain defensible where an application maintains a
universal install and has many direct plugin calls. The chapter does not call
that convention a compiler guarantee.

- The app owns the augmentation. Optionality is a real available choice; do not
  defeat it by assigning the fictional plugin conflicting required types.
- A local guard supports `frame().render()`. It narrows the property, not the
  whole `Label`; a second `frame` call in the chain is still TS2722. A checked
  local subtype can retain that capability through repeated calls. The suite
  tests both, without claiming an assertion-function body is compiler-proven.
- A per-value factory need not lose chaining. That proposed cost was withdrawn.
- An import inside a `.d.ts` helps resolve types, but the file emits no JavaScript.
  A `.ts` file side-effect-importing that declaration file is a different case:
  the import is emitted and cannot load a nonexistent JavaScript counterpart.
  The suite checks this distinction; the manuscript does not add another tangent.
- The dependency-upgrade case must load the new plugin declaration through its
  real import. Making it a later, unrelated root can move TS2386 into a `.d.ts`
  and falsely suggest `skipLibCheck` hides the conflict in the final `.ts` patch.
- Different required method signatures can merge as overloads without an error.
  A clean build is not a general detector for obsolete augmentation patches.

## Review-driven revisions

Claude's discovery and outline reviews tested optional guards, narrowed local
values, the working bridge, and the separate-entry type-only counterexample.
The opening avoids treating augmentation as inherently wrong or wrapping as
inherently inconvenient.

Claude's first draft review found two consequential issues. The upgrade Take
was corrected to the actual `.ts` augmentation behavior under both skip flags.
The corresponding test now installs upgraded dependency declarations rather
than adding them after the application as independent roots. Dima also carried
too many compiler explanations. Those were shortened and tied to the other
speakers' work: Gilad inspects output, Oded explains his patch, Chen reproduces
the lost export, and Idan describes what the host may supply.

The independent first reader received only the manuscript and Chapter 3 as an
optional prerequisite. The reader restated the intended principle without a
missing premise. Two local findings were fixed: “two constructors” became “two
entry points”, and a duplicated restoration of the batch import was removed.
The reader's second pass approved the revised voices, chain limitation, and
upgrade distinction with no consequential findings.

## Evidence and limits

The manuscript-derived suite uses TypeScript **7.0.2** and covers **16 fences**,
**24 compiler cases**, and **16 runtime groups**. It checks declaration files
with `skipLibCheck: false`; comparison cases explicitly enable the flag.

Every TypeScript fence is used. The Additional Take containing an ambient patch
and its consumer is split at its explicit file marker. Earlier and replacement
versions are compiled in separate projects. Diagnostics are matched by file,
line, and code, and printed messages and annotated outputs are checked.

The runtime package is a small JavaScript stand-in for the fictional library.
Fresh processes exercise correct, faulty, and repaired entry points. A deliberate
shared-process run demonstrates test contamination. The browser-global example
runs with two supplied `window` objects in a VM. There is no real printer,
browser, bundler, or third-party production package under test.

The full `npm run check` passed on September 28, 2026: **254 fences, 322 compiler
cases, and 71 runtime groups**, plus two compiler-default cases and two searches.
Claude independently reran the full suite and confirmed the same totals. The
master plan records Act II as seven of seven chapters complete.

Sources verified during discovery:

- [Module augmentation and global augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
- [Ambient modules and their distinction from augmentation](https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules)
- [Global-modifying modules](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html)

## Completion

- [x] Discovery and outline challenged with Claude.
- [x] Manuscript drafted and self-reviewed.
- [x] Fresh first-read review and recheck settled.
- [x] Manuscript-derived compiler and runtime validation passes.
- [x] Claude formal review settled.
- [x] Final full checks and tracking updated.
