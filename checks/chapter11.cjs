// Manuscript-derived checks for Chapter 11 on the book's pinned compiler.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/02-advanced-typescript/05-advanced-generics.md"), "utf8");
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = blocks.filter(b => b.startsWith(prefix));
  assert.equal(matches.length, 1, `Expected one fence starting with ${prefix}`);
  used.add(matches[0]);
  return matches[0] + "\n";
}
const opening = block("type ExportSpec =");
const openingCall = opening.indexOf("const job =");
assert(openingCall > 0);
const spec = opening.slice(0, openingCall);
const builder = block("class ExportBuilder<");
const base = spec + builder;
const oldHelperFence = block("function forNightlyExport(builder:");
const oldHelper = oldHelperFence.slice(0, oldHelperFence.indexOf("const nightly ="));
const helper = block("function forNightlyExport<S");
const directFence = block("function createExport(");
const direct = directFence.slice(0, directFence.indexOf("const direct ="));
const plainHelper = block("const orderSource =");
const presetFence = block("const sourcePreset =");
const presetDefinition = presetFence.slice(0, presetFence.indexOf("const configured ="));
const replacement = block("// Replacement for the source method in ExportBuilder.");
const sourceStart = builder.indexOf("  source(source:");
const sourceEnd = builder.indexOf("  destination(", sourceStart);
assert(sourceStart > 0 && sourceEnd > sourceStart);
const checkedBuilder = builder.slice(0, sourceStart) + replacement + "\n" + builder.slice(sourceEnd);
const checkedBase = spec + checkedBuilder;
const selectFence = block("function selectOrders<");
const select = selectFence.slice(0, selectFence.indexOf("const staged ="));
const fixedFence = block("function ordersTo(");
const fixed = fixedFence.slice(0, fixedFence.indexOf("const fixedSource ="));
const repointFence = block("function repoint(");
const repoint = repointFence.slice(0, repointFence.indexOf("repoint(sourcePreset);"));
const equal = `
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type StateOf<B> = B extends ExportBuilder<infer S> ? S : never;
`;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch11-"));
const cases = [];
function example(name, code, codes = []) {
  const filename = path.join(scratch, name + ".ts");
  const source = "export {};\n" + code;
  const errorLines = source.split("\n").flatMap((line, index) =>
    line.includes("// Error:") ? [index + 1] : []);
  assert.equal(errorLines.length, codes.length, `Error markers in ${name}`);
  fs.writeFileSync(filename, source);
  cases.push({name, filename, expected: codes.map((code, i) => ({line: errorLines[i], code}))});
}
example("opening-working-job", base + opening.slice(openingCall));
example("opening-incomplete-job", base + block("const incomplete ="), [2684]);
example("states-and-reverse-order", base + block("const empty =") + block("const reversed ="));
example("defaulted-helper-loses-source", base + oldHelperFence, [2684]);
example("generic-helper-preserves-either-order", base + helper + block("const fromSource ="));
example("required-options-working-caller", spec + directFence);
example("required-options-rejects-missing-field", spec + direct + block('createExport({ source: "orders" });'), [2741]);
example("plain-value-composition", spec + direct + plainHelper);
example("builder-preset-keeps-old-state", base + presetFence, [2684]);
example("plain-preset-keeps-old-state", spec + direct + block("const sourceOptions ="), [2741]);
example("both-original-designs-allow-repointing", base + direct + presetDefinition + plainHelper + block("const repointedBuilder ="));
example("checked-source-rejects-known-repeat", checkedBase + presetDefinition + block('sourcePreset.source("customers");'), [2684]);
example("source-setting-helper-preserves-destination", checkedBase + helper + selectFence);
example("concrete-fixed-source-function", spec + direct + fixedFence);
example("broad-helper-hides-known-source", checkedBase + presetDefinition + repointFence);
example("closing-assignment-is-accepted", checkedBase + presetDefinition + block("const lessSpecific:"));
assert.equal(used.size, blocks.length, "Every manuscript fence must be exercised");

example("inferred-states-and-default", base + equal + `
const empty = ExportBuilder.start();
const selected = empty.source("orders");
const ready = selected.destination("exports/nightly.csv");
type Empty = Expect<Equal<StateOf<typeof empty>, {}>>;
type Selected = Expect<Equal<StateOf<typeof selected>, {source: string}>>;
type Ready = Expect<Equal<StateOf<typeof ready>, {source: string} & {destination: string}>>;
type Default = Expect<Equal<ExportBuilder, ExportBuilder<{}>>>;
type Output = Expect<Equal<ReturnType<typeof ready.build>, ExportSpec>>;
`);
example("helper-result-types", base + helper + equal + `
const selected = ExportBuilder.start().source("orders");
const ready = forNightlyExport(selected);
const destinationOnly = forNightlyExport(ExportBuilder.start());
type Ready = Expect<Equal<StateOf<typeof ready>, {source: string} & {destination: string}>>;
type Destination = Expect<Equal<StateOf<typeof destinationOnly>, {destination: string}>>;
`);
example("broad-helper-result-type", base + oldHelper + equal + `
const result = forNightlyExport(ExportBuilder.start().source("orders"));
type Result = Expect<Equal<StateOf<typeof result>, {destination: string}>>;
`);
example("minimum-shape-helper-is-an-honest-alternative", base + `
function needsSource(builder: ExportBuilder<{source: string}>) {
  return builder.destination("exports/nightly.csv");
}
needsSource(ExportBuilder.start().source("orders")).build();
needsSource(ExportBuilder.start()); // Error: this helper requires source first.
`, [2345]);
example("empty-and-destination-only-cannot-build", base + `
ExportBuilder.start().build(); // Error: both fields are missing.
ExportBuilder.start().destination("exports/nightly.csv").build(); // Error: source is missing.
`, [2684, 2684]);
example("cannot-bypass-private-constructor", base + `
new ExportBuilder<ExportSpec>({source: "orders", destination: "exports/nightly.csv"}); // Error: private constructor.
`, [2673]);
example("setters-reject-wrong-values", base + `
ExportBuilder.start().source(42); // Error: source must be a string.
ExportBuilder.start().destination(undefined); // Error: destination must be a string.
`, [2345, 2345]);
example("repeated-setter-values-remain-strings", base + equal + `
const replaced = ExportBuilder.start().source("orders").source("refunds")
  .destination("exports/old.csv").destination("exports/new.csv");
type Source = Expect<Equal<StateOf<typeof replaced>["source"], string>>;
type Destination = Expect<Equal<StateOf<typeof replaced>["destination"], string>>;
replaced.build();
`);
example("this-is-a-checked-receiver-not-an-argument", base + `
const ready = ExportBuilder.start().source("orders").destination("exports/nightly.csv");
const build = ready.build;
build(); // Error: there is no receiver.
ready.build(ready); // Error: build takes no runtime arguments.
`, [2684, 2554]);
example("plain-helper-preserves-and-requires-fields", spec + direct + plainHelper + `
const destinationFirst = withNightlyDestination({});
createExport({...destinationFirst, source: "orders"});
createExport(destinationFirst); // Error: source is missing.
`, [2741]);
example("partial-draft-assignment-is-not-completion", spec + direct + `
const draft: Partial<ExportSpec> = {source: "orders"};
draft.destination = "exports/nightly.csv";
createExport(draft); // Error: the whole object still has optional properties.
`, [2345]);
example("checked-builder-keeps-both-orders-and-destination-helper", checkedBase + helper + block("const fromSource =") + block("const reversed ="));
example("source-helper-needs-its-own-constraint", checkedBase + `
function selectSource<S extends Partial<ExportSpec>>(builder: ExportBuilder<S>) {
  return builder.source("orders"); // Error: S might already contain source.
}
`, [2684]);
example("source-helper-rejects-known-source-and-accepts-both-stages", checkedBase + select + `
selectOrders(ExportBuilder.start()).destination("exports/nightly.csv").build();
selectOrders(ExportBuilder.start().destination("exports/nightly.csv")).build();
selectOrders(ExportBuilder.start().source("orders")); // Error: source was already selected.
`, [2345]);
example("broad-assignment-allows-repeat-call", checkedBase + presetDefinition + block("const lessSpecific:") + `
lessSpecific.source("customers");
`);

const {diagnostics} = compile(cases.map(c => c.filename), {noEmit: true}, scratch);
for (const test of cases) {
  const found = diagnostics.filter(d => d.fileName === test.filename);
  assert.deepEqual(found.map(d => ({line: d.line, code: d.code})), test.expected,
    test.name + "\n" + describe(found));
  const lines = fs.readFileSync(test.filename, "utf8").split("\n");
  for (const diagnostic of found) {
    const printedCode = lines[diagnostic.line - 1].match(/\bTS(\d+)\b/);
    if (printedCode) assert.equal(Number(printedCode[1]), diagnostic.code,
      `Printed diagnostic code differs in ${test.name}`);
    const quoted = [];
    for (let i = diagnostic.line; i < lines.length && lines[i].startsWith("// "); i++) {
      quoted.push(lines[i].slice(3));
    }
    if (quoted.length) {
      assert(diagnostic.message.replace(/\s+/g, " ").includes(quoted.join(" ")),
        `Quoted diagnostic differs in ${test.name}: ${quoted.join(" ")}\n${diagnostic.message}`);
    }
  }
}
assert(!diagnostics.some(d => !cases.some(c => c.filename === d.fileName)), describe(diagnostics));

// The transition rule excludes string sources with this flag off as well.
// The diagnostic's displayed optional type changes, so quotations above are
// checked only against the manuscript's explicit fixture profile.
const looseOptionalCases = cases.filter(c => [
  "checked-source-rejects-known-repeat",
  "source-helper-needs-its-own-constraint",
  "source-helper-rejects-known-source-and-accepts-both-stages",
].includes(c.name));
assert.equal(looseOptionalCases.length, 3);
const loose = compile(looseOptionalCases.map(c => c.filename),
  {noEmit: true, exactOptionalPropertyTypes: false}, scratch);
for (const test of looseOptionalCases) {
  const found = loose.diagnostics.filter(d => d.fileName === test.filename);
  assert.deepEqual(found.map(d => ({line: d.line, code: d.code})), test.expected,
    `Without exactOptionalPropertyTypes: ${test.name}\n${describe(found)}`);
}
assert(!loose.diagnostics.some(d => !looseOptionalCases.some(c => c.filename === d.fileName)), describe(loose.diagnostics));

const runtimeFile = path.join(scratch, "runtime.ts");
const oldHelperNamed = oldHelper.replace("function forNightlyExport(", "function broadHelper(");
fs.writeFileSync(runtimeFile, base + direct + helper + oldHelperNamed + plainHelper +
  fixed + `
export {ExportBuilder, createExport, forNightlyExport, broadHelper,
  withNightlyDestination, ordersTo};
`);
const checkedRuntimeFile = path.join(scratch, "checked-runtime.ts");
fs.writeFileSync(checkedRuntimeFile, checkedBase + helper + select + repoint + `
export {ExportBuilder, forNightlyExport, selectOrders, repoint};
`);
const outDir = path.join(scratch, "out");
const runtimeCompilation = compile([runtimeFile, checkedRuntimeFile], {outDir}, scratch);
assert.equal(runtimeCompilation.diagnostics.length, 0, describe(runtimeCompilation.diagnostics));
const api = require(path.join(outDir, "runtime.js"));
const checked = require(path.join(outDir, "checked-runtime.js"));
let runtimeGroups = 0;
const expected = {source: "orders", destination: "exports/nightly.csv"};
const failure = /An export needs a source and a destination\./;

// The happy paths construct identical records; no export runner is involved.
assert.deepEqual(api.ExportBuilder.start().source("orders").destination(expected.destination).build(), expected);
assert.deepEqual(api.createExport(expected), expected);
assert.deepEqual(api.ExportBuilder.start().destination(expected.destination).source("orders").build(), expected);
runtimeGroups++;

// Both helper signatures preserve the data at runtime, despite their different types.
assert.deepEqual(api.forNightlyExport(api.ExportBuilder.start().source("orders")).build(), expected);
assert.deepEqual(api.forNightlyExport(api.ExportBuilder.start()).source("orders").build(), expected);
assert.deepEqual(api.broadHelper(api.ExportBuilder.start().source("orders")).build(), expected);
assert.deepEqual(api.createExport(api.withNightlyDestination({source: "orders"})), expected);
runtimeGroups++;

const preset = api.ExportBuilder.start().source("orders");
const first = preset.destination("exports/first.csv");
const second = preset.destination("exports/second.csv");
assert.notEqual(first, preset);
assert.notEqual(first, second);
assert.equal(first.build().destination, "exports/first.csv");
assert.equal(second.build().destination, "exports/second.csv");
assert.throws(() => preset.build(), failure);
preset.destination(expected.destination); // Deliberately discard the new value.
assert.throws(() => preset.build(), failure);
runtimeGroups++;

const record = first.build();
record.destination = "changed";
assert.equal(first.build().destination, "exports/first.csv");
assert.notEqual(first.build(), first.build());
const original = {...expected};
const directCopy = api.createExport(original);
assert.notEqual(original, directCopy);
directCopy.source = "changed";
assert.equal(original.source, "orders");
runtimeGroups++;

assert.deepEqual(api.ExportBuilder.start().source("orders").source("refunds")
  .destination("exports/old.csv").destination("exports/new.csv").build(),
  {source: "refunds", destination: "exports/new.csv"});
runtimeGroups++;

assert.deepEqual(api.ordersTo(expected.destination), expected);
assert.equal(api.ordersTo("exports/other.csv").source, "orders");
assert.throws(() => api.ordersTo(undefined), failure);
runtimeGroups++;

// These are unchecked JS calls into the emitted implementation.
assert.throws(() => api.ExportBuilder.start().build(), failure);
assert.throws(() => api.ExportBuilder.start().destination("exports/x.csv").build(), failure);
assert.throws(() => api.ExportBuilder.start().source(42).destination("exports/x.csv").build(), failure);
for (const input of [{}, {source: "orders"}, {destination: "exports/x.csv"}, {source: 42, destination: "exports/x.csv"}]) {
  assert.throws(() => api.createExport(input), failure);
}
runtimeGroups++;

// String presence is not dataset existence, path validity, or authorization.
assert.deepEqual(api.ExportBuilder.start().source("").destination("").build(), {source: "", destination: ""});
assert.deepEqual(api.createExport({source: "", destination: ""}), {source: "", destination: ""});
runtimeGroups++;

// The replacement method adds an actual transition rule, independently of build.
const locked = checked.ExportBuilder.start().source("orders");
assert.throws(() => locked.source("customers"), /Source has already been selected\./);
assert.throws(() => locked.source("orders"), /Source has already been selected\./);
assert.deepEqual(locked.destination(expected.destination).build(), expected);
assert.deepEqual(checked.ExportBuilder.start().destination(expected.destination).source("orders").build(), expected);
assert.deepEqual(checked.selectOrders(checked.forNightlyExport(checked.ExportBuilder.start())).build(), expected);
assert.deepEqual(checked.forNightlyExport(checked.selectOrders(checked.ExportBuilder.start())).build(), expected);
runtimeGroups++;

// This compiles in the manuscript: widening loses the fact that source is present.
assert.throws(() => checked.repoint(locked), /Source has already been selected\./);
assert.equal(locked.destination("exports/original.csv").build().source, "orders");
runtimeGroups++;

// Invalid JS arguments cannot create a builder with an unusable occupied slot.
const fresh = checked.ExportBuilder.start();
for (const invalid of [undefined, null, 42]) {
  assert.throws(() => fresh.source(invalid), {name: "TypeError", message: "Source must be a string."});
}
assert.deepEqual(fresh.source("orders").destination(expected.destination).build(), expected);
runtimeGroups++;

console.log(`Chapter 11: TypeScript ${version}; ${blocks.length} fences, ${cases.length + looseOptionalCases.length} compiler cases, ${runtimeGroups} runtime groups passed. Fixtures: ${scratch}`);
