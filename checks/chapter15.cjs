// Branded meanings, stale object checks, and the operations each repair permits.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/03-patterns-and-design/02-branded-types.md"), "utf8");
const fences = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = fences.map((text, index) => ({text, index})).filter(b => b.text.startsWith(prefix));
  assert.equal(matches.length, 1, "Unique fence: " + prefix);
  used.add(matches[0].index);
  return matches[0].text + "\n";
}
const opening = block("function previewNumbers(");
const brands = block("declare const pageKind:");
const span = block("type PageSpan =");
const arithmetic = block("const count = pageCount(");
const range = block("declare const rangeKind:");
const copy = block("const edited = {");
const reconstruction = block("const edited = pageRange(");
const frozen = block("class CheckedRange {");
const alias = block("function moveStart(");
const moved = block("const span: PageSpan =");
const request = block("type PageDraft =");
const callers = block("function previewDraft(");
const soft = block("type SoftPageCount =");
assert.equal(used.size, fences.length, "Every TypeScript fence is exercised");
function before(source, delimiter) {
  const index = source.indexOf(delimiter);
  assert(index >= 0, "Missing split: " + delimiter);
  return source.slice(0, index);
}
// Separate timeline definitions; runtime variants omit ONLY intentional-error lines.
function withoutErrors(source) { return source.split("\n").filter(l => !l.includes("// Error TS")).join("\n"); }
const numbersFn = before(opening, "console.log(");
const spanFns = before(span, "const selection =");
const rangeFns = before(range, "const selected =");
const classDef = before(frozen, "const selected =");
const moveFn = before(alias, "moveStart(selected");
const requestFn = before(request, "console.log(");
const base = numbersFn + brands + spanFns;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch15-"));
const cases = [];
function example(name, source, codes = []) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir, {recursive: true});
  source = "export {};\n" + source;
  const file = path.join(dir, "main.ts");
  fs.writeFileSync(file, source);
  const lines = source.split("\n").flatMap((line, index) => line.includes("// Error TS") ? [index + 1] : []);
  assert.equal(lines.length, codes.length, "Diagnostic markers: " + name);
  const outDir = path.join(dir, "out");
  const checked = compile([file], {outDir}, dir);
  assert.deepEqual(checked.diagnostics.map(d => ({line: d.line, code: d.code})),
    codes.map((code, i) => ({line: lines[i], code})), name + "\n" + describe(checked.diagnostics));
  const test = {name, dir, outDir, checked};
  cases.push(test);
  return test;
}
const original = example("plain-named-options-still-mix-meanings", opening);
const mistaken = example("last-is-not-count", numbersFn + brands + span, [2322]);
assert(mistaken.checked.diagnostics[0].message.startsWith("Type 'PageNumber' is not assignable to type 'PageCount'."));
assert(mistaken.checked.diagnostics[0].message.includes('Type \'"PageNumber"\' is not assignable to type \'"PageCount"\'.'));
assert(chapter.includes("Type 'PageNumber' is not assignable to type 'PageCount'"));
example("arithmetic-drops-brand", numbersFn + brands + withoutErrors(span) + arithmetic, [2322]);
const correct = example("converted-count", numbersFn + brands + withoutErrors(span) + withoutErrors(arithmetic));
const stale = example("object-copy-keeps-stale-brand", base + range + copy);
const rebuilt = example("constructor-rechecks-order", base + range + reconstruction);
const privateCopy = example("class-copy-loses-private-marker", brands + frozen, [2741]);
assert(privateCopy.checked.diagnostics[0].message.startsWith("Property 'checked' is missing"));
assert(chapter.includes("Property 'checked' is missing"));
const mutation = example("mutable-alias-still-accepts-frozen-class", brands + withoutErrors(frozen) + alias);
const shifted = example("count-copy-preserves-length", base + moved);
const conversion = example("endpoint-conversion", base + request);
example("optional-marker-admits-plain-number", brands + soft);

const api = example("final-actions-and-repairs", base + rangeFns + classDef + moveFn + requestFn + callers +
  "export {pageNumber, pageCount, preview, pageRange, requestOf, CheckedRange, moveStart, requestFrom, previewDraft, exportDraft};\n");
example("plain-number-rejected", base + "preview({first: pageNumber(3), count: 2}); // Error TS2322\n", [2322]);
example("count-is-not-first-page", base + "preview({first: pageCount(3), count: pageCount(2)}); // Error TS2322\n", [2322]);
example("plain-range-lacks-marker", base + rangeFns +
  "const raw: PageRange = {first: pageNumber(3), last: pageNumber(4)}; // Error TS2322\n", [2322]);
example("direct-readonly-assignment-rejected", base + rangeFns +
  "const selected = pageRange(pageNumber(3), pageNumber(4));\nselected.first = pageNumber(5); // Error TS2540\n", [2540]);
example("private-constructor-rejected", brands + classDef +
  "new CheckedRange(pageNumber(3), pageNumber(4)); // Error TS2673\n", [2673]);
example("widened-number-cannot-regain-brand", brands +
  "const plain: number = pageNumber(3);\nconst restored: PageNumber = plain; // Error TS2322\n", [2322]);
example("arithmetic-cannot-be-count", base +
  "preview({first: pageNumber(3), count: pageNumber(4) - pageNumber(3) + 1}); // Error TS2322\n", [2322]);
const explicitWrong = example("explicit-wrong-role-conversion-still-works", base +
  "export const result = preview({first: pageNumber(3), count: pageCount(pageNumber(4))});\n");
const aliases = example("plain-aliases-do-not-distinguish-roles", numbersFn +
  "type PageNumber = number;\ntype PageCount = number;\nconst last: PageNumber = 4;\n" +
  "const count: PageCount = last;\nexport const result = previewNumbers({first: 3, count});\n");
const freezeCopy = example("freeze-alone-does-not-stop-object-copy", base + rangeFns +
  "const original = Object.freeze(pageRange(pageNumber(3), pageNumber(4)));\n" +
  "const changed: PageRange = {...original, first: pageNumber(5)};\n" +
  "export const result = requestOf(changed);\n");
const noFreezeSource = classDef.replace("    Object.freeze(this);", "");
assert.notEqual(noFreezeSource, classDef);
const unfrozen = example("private-member-alone-does-not-protect-fields", brands + noFreezeSource + moveFn +
  "export {CheckedRange, moveStart};\n");
const overflow = example("naive-post-addition-overflow-check-rounds-back", base +
  "export const rounded = Number.MAX_SAFE_INTEGER + 2 - 1;\nexport const looksSafe = Number.isSafeInteger(rounded);\n" +
  "export {preview, pageNumber, pageCount};\n");

// The manuscript changes only requestOf's parameter in the class alternative.
const objectRequest = rangeFns.slice(rangeFns.indexOf("function requestOf("));
const classRequest = objectRequest.replace("range: PageRange", "range: CheckedRange");
assert.notEqual(classRequest, objectRequest);
const classConsumer = example("class-repair-reaches-same-renderer",
  base + classDef + classRequest + "export {CheckedRange, requestOf, preview};\n");
const objectAlias = example("mutable-alias-already-corrupts-object-brand",
  base + rangeFns + moveFn +
  "const selected = pageRange(pageNumber(3), pageNumber(4));\n" +
  "moveStart(selected, pageNumber(5));\nexport const result = requestOf(selected);\n");

// Stronger reader contract discussed in prose: retain no writable numeric shape.
// Frozen own function properties also prevent replacing the readers on an instance.
assert(chapter.includes("Expose `first()` and `last()`"));
const methodClass = [
  "class MethodRange {",
  "  readonly #first: PageNumber;",
  "  readonly #last: PageNumber;",
  "  readonly first = (): PageNumber => this.#first;",
  "  readonly last = (): PageNumber => this.#last;",
  "  private constructor(first: PageNumber, last: PageNumber) {",
  "    this.#first = first; this.#last = last; Object.freeze(this);",
  "  }",
  "  static create(first: PageNumber, last: PageNumber): MethodRange {",
  '    if (first > last) throw new RangeError("First page follows last");',
  "    return new MethodRange(first, last);",
  "  }",
  "}",
].join("\n") + "\n";
const methodRequest = objectRequest.replace("range: PageRange", "range: MethodRange")
  .replaceAll("range.first", "range.first()").replaceAll("range.last", "range.last()");
assert.notEqual(methodRequest, objectRequest);
const methodRepair = example("read-method-repair-reaches-renderer", base + methodClass + methodRequest +
  "export {MethodRange, requestOf, preview};\n");
example("read-methods-reject-old-mutator", brands + methodClass + moveFn +
  "moveStart(MethodRange.create(pageNumber(3), pageNumber(4)), pageNumber(5)); // Error TS2345\n", [2345]);
example("read-method-class-still-rejects-spread", brands + methodClass +
  "const selected = MethodRange.create(pageNumber(3), pageNumber(4));\n" +
  "const copied: MethodRange = {...selected}; // Error TS2739\n", [2739]);

// Hiding the symbol is not opacity: the caller only needs the type of the copied value.
const moduleDir = path.join(scratch, "unexported-symbol-copy");
fs.mkdirSync(moduleDir);
const libraryFile = path.join(moduleDir, "range.ts");
const callerFile = path.join(moduleDir, "main.ts");
fs.writeFileSync(libraryFile, base + rangeFns +
  "export {pageNumber, pageRange, requestOf};\nexport type {PageRange};\n");
fs.writeFileSync(callerFile,
  'import {pageNumber, pageRange, requestOf, type PageRange} from "./range.js";\n' +
  "const selected = pageRange(pageNumber(3), pageNumber(4));\n" +
  "const accepted: PageRange = {...selected, first: pageNumber(5)};\n" +
  "export const result = requestOf(accepted);\n");
const hidden = {name: "unexported-symbol-copy", dir: moduleDir, outDir: path.join(moduleDir, "out")};
hidden.checked = compile([libraryFile, callerFile], {outDir: hidden.outDir}, moduleDir);
assert.deepEqual(hidden.checked.diagnostics, [], describe(hidden.checked.diagnostics));
cases.push(hidden);

let groups = 0;
function group(name, body) {
  try { body(); } catch (error) { error.message = name + ": " + error.message; throw error; }
  groups++;
}
function load(test) { return require(path.join(test.outDir, "main.js")); }
function printed(test, expected, failure) {
  const file = path.join(test.outDir, "main.js");
  const script = 'console.log = (...args) => process.stdout.write(JSON.stringify(args) + "\\n");' +
    "try { require(" + JSON.stringify(file) + "); } catch (error) {" +
    'process.stdout.write(JSON.stringify({name:error.name,message:error.message}) + "\\n");}';
  const ran = cp.spawnSync(process.execPath, ["-e", script], {encoding: "utf8", timeout: 10000});
  if (ran.error) throw ran.error;
  assert.equal(ran.status, 0, ran.stderr);
  assert.equal(ran.stderr, "");
  assert.deepEqual(ran.stdout.trim().split("\n").filter(Boolean).map(l => JSON.parse(l)),
    [...expected, ...(failure ? [failure] : [])]);
}
function printedValues(source) {
  const lines = source.split("\n");
  return lines.flatMap((line, i) => {
    if (!line.startsWith("console.log(")) return [];
    const comment = line.includes("); // ") ? line.split("); // ")[1] : lines[i + 1]?.replace(/^\/\/ /, "");
    assert(comment, "Every printed value has an output annotation");
    const json = comment.replace(/([a-zA-Z]+):/g, '"$1":');
    return [[comment === "undefined" ? null : JSON.parse(json)]];
  });
}
const printedSources = [opening, arithmetic, range, copy, moved, request];
assert.equal(printedSources.reduce((sum, source) => sum + printedValues(source).length, 0),
  [...chapter.matchAll(/console\.log\(/g)].length, "Every printed annotation is compared with emitted output");
group("printed-values", () => {
  printed(original, printedValues(opening));
  printed(correct, printedValues(arithmetic));
  printed(stale, [...printedValues(range), ...printedValues(copy)],
    {name: "RangeError", message: "Expected positive whole numbers"});
  printed(shifted, printedValues(moved));
  // JSON serializes undefined in an argument array as null.
  printed(conversion, printedValues(request));
});
group("printed-reconstruction-refusal", () => {
  printed(rebuilt, printedValues(range), {name: "RangeError", message: "First page follows last"});
});
group("printed-alias-rejection", () => {
  printed(mutation, [], {name: "TypeError", message: "Cannot assign to read only property 'first' of object '#<CheckedRange>'"});
});
assert(chapter.includes("strict-mode module"));
for (const test of [mutation, objectAlias, unfrozen]) {
  assert(fs.readFileSync(path.join(test.outDir, "main.js"), "utf8").startsWith('"use strict";'),
    "Frozen-write TypeError depends on strict emitted code: " + test.name);
}
const m = load(api);
group("numeric-constructor-boundaries", () => {
  for (const fn of [m.pageNumber, m.pageCount]) {
    for (const value of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => fn(value), RangeError);
    }
    for (const value of [1, 3, Number.MAX_SAFE_INTEGER]) assert.equal(fn(value), value);
  }
});
group("request-conversion-and-action-responses", () => {
  const calls = [];
  const render = request => calls.push(request);
  const draft = {first: m.pageNumber(3), last: m.pageNumber(4)};
  assert.deepEqual(m.previewDraft(draft), [3, 4]);
  assert.equal(m.exportDraft(draft, render), "Export started.");
  assert.deepEqual(calls, [{first: 3, count: 2}]);
  const editing = {...draft, first: m.pageNumber(5)};
  assert.equal(m.requestFrom(editing), undefined);
  assert.deepEqual(m.previewDraft(editing), []);
  assert.equal(m.exportDraft(editing, render), "The first page must not follow the last.");
  assert.equal(calls.length, 1);
  const finished = {...editing, last: m.pageNumber(9)};
  assert.deepEqual(m.previewDraft(finished), [5, 6, 7, 8, 9]);
  assert.equal(m.exportDraft(finished, render), "Export started.");
  assert.deepEqual(calls[1], {first: 5, count: 5});
});
group("same-endpoint-and-boundary-conversion", () => {
  for (const value of [1, 4, Number.MAX_SAFE_INTEGER]) {
    const draft = {first: value, last: value};
    assert.deepEqual(m.requestFrom(draft), {first: value, count: 1});
    assert.deepEqual(m.previewDraft(draft), [value]);
  }
  assert.deepEqual(m.requestFrom({first: 1, last: Number.MAX_SAFE_INTEGER}),
    {first: 1, count: Number.MAX_SAFE_INTEGER});
  assert.equal(m.requestFrom({first: Number.MAX_SAFE_INTEGER, last: 1}), undefined);
});
group("original-range-brand-is-absent-and-copy-is-invalid", () => {
  const original = m.pageRange(3, 4);
  assert.equal(Object.getOwnPropertySymbols(original).length, 0);
  assert.deepEqual(m.preview(m.requestOf(original)), [3, 4]);
  assert.deepEqual(m.requestOf({...original, first: 5}), {first: 5, count: 0});
  assert.throws(() => m.preview(m.requestOf({...original, first: 5})), RangeError);
  assert.deepEqual(original, {first: 3, last: 4});
  assert.throws(() => m.pageRange(5, 4), {name: "RangeError", message: "First page follows last"});
});
group("frozen-class-preserves-original-and-needs-reconstruction", () => {
  const original = m.CheckedRange.create(3, 4);
  assert(Object.isFrozen(original));
  assert.deepEqual(Object.keys(original), ["first", "last"]);
  assert.throws(() => m.moveStart(original, 5), TypeError);
  assert.equal(original.first, 3);
  assert.equal(original.last, 4);
  assert.throws(() => m.CheckedRange.create(5, original.last), RangeError);
  const updated = m.CheckedRange.create(2, original.last);
  assert.equal(updated.first, 2);
  assert.notEqual(updated, original);
});
group("class-repair-converts-to-the-existing-request", () => {
  const repaired = load(classConsumer);
  const range = repaired.CheckedRange.create(3, 4);
  assert.deepEqual(repaired.requestOf(range), {first: 3, count: 2});
  assert.deepEqual(repaired.preview(repaired.requestOf(range)), [3, 4]);
});
group("object-brand-already-had-the-alias-hole", () => {
  assert.deepEqual(load(objectAlias).result, {first: 5, count: 0});
});
group("read-method-repair-has-the-same-range-behavior", () => {
  const repaired = load(methodRepair);
  const range = repaired.MethodRange.create(3, 4);
  assert.deepEqual(repaired.requestOf(range), {first: 3, count: 2});
  assert.deepEqual(repaired.preview(repaired.requestOf(range)), [3, 4]);
  assert.throws(() => repaired.MethodRange.create(5, 4), RangeError);
  assert.equal(Reflect.set(range, "first", () => 5), false);
  assert.equal(range.first(), 3);
});
group("class-without-freeze-silently-corrupts", () => {
  const plain = load(unfrozen);
  const original = plain.CheckedRange.create(3, 4);
  plain.moveStart(original, 5);
  assert(original instanceof plain.CheckedRange);
  assert.equal(original.first, 5);
  assert.equal(original.last, 4);
});
group("hiding-symbol-and-freezing-object-do-not-stop-copy", () => {
  assert.deepEqual(load(hidden).result, {first: 5, count: 0});
  assert.deepEqual(load(freezeCopy).result, {first: 5, count: 0});
});
group("aliases-and-explicit-misbranding-cannot-determine-meaning", () => {
  assert.deepEqual(load(aliases).result, [3, 4, 5, 6]);
  assert.deepEqual(load(explicitWrong).result, [3, 4, 5, 6]);
});
group("overflow-guard-before-addition", () => {
  const probe = load(overflow);
  assert.equal(probe.looksSafe, true);
  assert.equal(probe.rounded, Number.MAX_SAFE_INTEGER);
  assert.deepEqual(probe.preview({first: Number.MAX_SAFE_INTEGER, count: 1}), [Number.MAX_SAFE_INTEGER]);
  assert.throws(() => probe.preview({first: Number.MAX_SAFE_INTEGER, count: 2}),
    {name: "RangeError", message: "Last page exceeds safe integer range"});
});
group("runtime-number-guards-remain-on-plain-entry", () => {
  for (const options of [{first: 0, count: 2}, {first: 1, count: 0}, {first: 1.5, count: 2}, {first: 1, count: Infinity}]) {
    assert.throws(() => m.preview(options), {name: "RangeError", message: "Expected positive whole numbers"});
  }
});
console.log("TypeScript " + version + ": Chapter 15 — " + fences.length + " fences, " +
  cases.length + " compiler cases, " + groups + " runtime groups. PASS");
console.log("Fixtures: " + scratch);
