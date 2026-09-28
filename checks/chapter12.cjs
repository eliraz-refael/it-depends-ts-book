// Manuscript-derived variance checks on the book's locked compiler.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/02-advanced-typescript/06-variance.md"), "utf8");
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = blocks.filter(b => b.startsWith(prefix));
  assert.equal(matches.length, 1, `Expected one fence starting with ${prefix}`);
  used.add(matches[0]);
  return matches[0] + "\n";
}
function before(text, marker) {
  const index = text.indexOf(marker);
  assert(index >= 0, `Missing marker ${marker}`);
  return text.slice(0, index);
}
function from(text, marker) {
  const index = text.indexOf(marker);
  assert(index >= 0, `Missing marker ${marker}`);
  return text.slice(index);
}
const originalApi = block("interface ExportResult {");
const domain = before(originalApi, "interface ResultCache<T>");
const factory = from(originalApi, "function createCache<T>");
const opening = block("const csvCache = createCache<CsvResult>");
const csv = before(opening, "function receipt(");
const oldReceipt = before(from(opening, "function receipt("), "function dashboard(");
const oldDashboard = before(from(opening, "function dashboard("), "receipt(csvCache);");
const dashboard = block("function dashboard(cache:");
const crash = block("const panel = dashboard(csvCache);");
const generic = block("function genericDashboard<");
const invariantApi = domain + block("interface ResultCache<in out T>") + factory;
const annotationError = block("dashboard(csvCache); // Error:");
const forwarding = block("const forwarded =");
const forward = before(forwarding, "const panel =");
const named = block("const named:");
const namedDefinition = before(named, "dashboard(named);");
const copied = block("let reads =");
const propertyApi = domain + block("interface ResultCache<T>") + factory;
const propertyErrors = block("dashboard(csvCache);  // Error:");
const reader = block("interface ResultReader<T>");
const readerDefinition = before(reader, "const label =");
const writer = block("interface ResultWriter<T>");
const archive = block("function archiveAction(");
const archiveDefinition = before(archive, "archiveAction(lastCsv);");
const repairedArchive = archive.split("\n").filter(line => !line.includes("// Error:")).join("\n");
const repaired = block("function receipt(reader:");
const receipt = before(repaired, "const panel =");
const repairedSetup = before(repaired, 'panel.useArchive("orders.zip");');
const methodOut = block("interface MethodCache<out T>");
const builderCalls = block("const selected = ExportBuilder.start()");
assert.equal(used.size, blocks.length, "Every manuscript fence must be exercised");

// The closing callback changes the actual Chapter 11 implementation, not a stub.
const previous = fs.readFileSync(path.resolve(__dirname,
  "../book/02-advanced-typescript/05-advanced-generics.md"), "utf8");
const previousBlocks = [...previous.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
function previousBlock(prefix) {
  const matches = previousBlocks.filter(b => b.startsWith(prefix));
  assert.equal(matches.length, 1, `Chapter 11 fence ${prefix}`);
  return matches[0] + "\n";
}
const spec = before(previousBlock("type ExportSpec ="), "const job =");
const builder = previousBlock("class ExportBuilder<");
const sourceStart = builder.indexOf("  source(source:");
const sourceEnd = builder.indexOf("  destination(", sourceStart);
assert(sourceStart > 0 && sourceEnd > sourceStart);
const checkedBuilder = builder.slice(0, sourceStart) +
  previousBlock("// Replacement for the source method in ExportBuilder.") + builder.slice(sourceEnd);
assert(chapter.includes("`in out S extends Partial<ExportSpec> = {}`"));
const invariantBuilder = checkedBuilder.replace("<S extends", "<in out S extends");
assert.notEqual(invariantBuilder, checkedBuilder);
const builderBase = spec + invariantBuilder;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch12-"));
const cases = [];
function example(name, code, codes = []) {
  const filename = path.join(scratch, name + ".ts");
  const source = "export {};\n" + code;
  const lines = source.split("\n").flatMap((line, index) =>
    line.includes("// Error:") ? [index + 1] : []);
  assert.equal(lines.length, codes.length, `Error markers in ${name}`);
  fs.writeFileSync(filename, source);
  cases.push({name, filename, expected: codes.map((code, i) => ({line: lines[i], code}))});
}
example("working-cache-and-consumers", originalApi + opening);
example("method-cache-admits-archive-bug", originalApi + csv + oldReceipt + dashboard + crash);
example("generic-dashboard-cannot-invent-t", originalApi + generic, [2345]);
const spreadWrite = "cache.write({ ...cache.read(), path })";
assert(chapter.includes("`" + spreadWrite + "`"), "The spread alternative must remain on the page");
const spreadDashboard = generic.replace("cache.write({ path });", spreadWrite + ";")
  .split("\n").map(line => line.replace(/; \/\/ Error:.*$/, ";"))
  .filter(line => !line.trimStart().startsWith("// ")).join("\n");
example("generic-spread-keeps-rows-with-archive-path", originalApi + csv + oldReceipt + spreadDashboard + `
const panel = genericDashboard(csvCache);
panel.useArchive("orders.zip");
export {panel, csvCache, receipt};
`);
example("annotation-blocks-direct-call", invariantApi + csv + dashboard + annotationError, [2345]);
example("annotation-admits-inferred-forwarding", invariantApi + csv + oldReceipt + dashboard + forwarding);
example("annotation-blocks-explicitly-typed-adapter", invariantApi + csv + dashboard + named, [2345]);
example("annotation-admits-spread-copy", invariantApi + csv + oldReceipt + dashboard + namedDefinition + copied);
example("property-contract-blocks-all-three-paths", propertyApi + csv + dashboard + forward + propertyErrors, [2345, 2345, 2345]);
example("property-contract-also-rejects-old-label-only-caller", propertyApi + csv + oldDashboard + `
dashboard(csvCache); // Error: the original parameter exposes write too.
`, [2345]);
example("reader-contract-restores-label-caller", propertyApi + csv + reader);
example("wide-writer-serves-csv-publisher", propertyApi + writer);
example("archive-needs-a-general-writer", propertyApi + writer + archive, [2345]);
example("method-writer-view-reopens-the-hole", propertyApi + writer + `
interface MethodWriter<T> { write(value: T): void; }
` + archiveDefinition.replace("ResultWriter<ExportResult>", "MethodWriter<ExportResult>") + `
const useArchive = archiveAction(lastCsv);
useArchive("orders.zip");
lastCsv.read().rows.toFixed(0);
`);
example("property-writer-view-rejects-original-method-cache", originalApi + writer + archiveDefinition + `
archiveAction(lastCsv); // Error: the target writer contract performs the strict check.
`, [2345]);
example("retained-csv-and-current-download", propertyApi + readerDefinition + writer + repairedArchive + repaired);
example("one-owner-record-can-project-both-views", propertyApi + readerDefinition + writer + archiveDefinition + receipt + `
const owner = createCache<{csv: CsvResult; download: ExportResult}>({csv: firstCsv, download: firstCsv});
const csvReader: ResultReader<CsvResult> = {read: () => owner.read().csv};
const download: ResultCache<ExportResult> = {
  read: () => owner.read().download,
  write: value => owner.write({...owner.read(), download: value}),
};
const label = dashboardLabel(download);
const useArchive = archiveAction(download);
export {owner, csvReader, label, useArchive, receipt};
`);
example("out-is-accepted-on-method-cache", domain + methodOut);
example("builder-annotation-and-minimum-state-cost", builderBase + builderCalls, [2322, 2345]);

example("reader-and-writer-directions", propertyApi + readerDefinition + writer + `
const wideReader: ResultReader<ExportResult> = lastCsv;
const narrowReader: ResultReader<CsvResult> = latestDownload; // Error: rows are not promised.
const narrowWriter: ResultWriter<CsvResult> = latestDownload;
const wideWriter: ResultWriter<ExportResult> = lastCsv; // Error: this cache requires rows.
narrowWriter.write({path: "archive.zip"}); // Error: the consumer still promises CSV values.
`, [2322, 2322, 2741]);
example("full-property-cache-both-directions", propertyApi + writer + `
const general: ResultCache<ExportResult> = lastCsv; // Error: incompatible write.
const specific: ResultCache<CsvResult> = latestDownload; // Error: incompatible read.
`, [2322, 2322]);
example("views-do-not-freeze-owner", propertyApi + csv + readerDefinition + `
const view: ResultReader<ExportResult> = csvCache;
csvCache.write({path: "next.csv", rows: 140});
view.write({path: "archive.zip"}); // Error: the view does not expose write.
`, [2339]);
example("property-contract-permits-method-implementation", propertyApi + writer + `
const implemented: ResultCache<CsvResult> = {
  read() { return firstCsv; },
  write(value: CsvResult) { firstCsv.rows = value.rows; },
};
const wrong: ResultCache<ExportResult> = implemented; // Error: target checks the parameter.
`, [2322]);
example("method-target-admits-arrow-property-source", originalApi + `
let stored: CsvResult = {path: "orders.csv", rows: 120};
const object = {
  read: () => stored,
  write: (value: CsvResult) => { stored = value; },
};
const general: ResultCache<ExportResult> = object;
general.write({path: "archive.zip"});
`);
example("matching-annotations-are-optional", domain + `
interface Reader<out T> { read: () => T; }
interface Writer<in T> { write: (value: T) => void; }
interface Cache<in out T> extends Reader<T>, Writer<T> {}
declare const csv: Cache<CsvResult>;
declare const all: Cache<ExportResult>;
const reader: Reader<ExportResult> = csv;
const writer: Writer<CsvResult> = all;
const wrong: Cache<ExportResult> = csv; // Error: both operations still constrain the assignment.
`, [2322]);
example("legacy-widening-is-not-repaired-retroactively", propertyApi + csv + `
interface LegacyCache<T> { read(): T; write(value: T): void; }
const lost: LegacyCache<ExportResult> = csvCache;
const reentered: ResultCache<ExportResult> = lost;
reentered.write({path: "archive.zip"});
`);
example("method-out-still-admits-unsafe-write", domain + methodOut +
  factory.replaceAll("ResultCache<T>", "MethodCache<T>") + csv + `
const widened: MethodCache<ExportResult> = csvCache;
widened.write({path: "archive.zip"});
csvCache.read().rows.toFixed(0);
`);
example("builder-annotation-preserves-generic-helper-and-both-orders", builderBase +
  previousBlock("function forNightlyExport<S") + `
forNightlyExport(ExportBuilder.start().source("orders")).build();
forNightlyExport(ExportBuilder.start()).source("orders").build();
forNightlyExport(ExportBuilder.start().source("orders").destination("manual.csv")).build();
`);
example("builder-structural-view-still-reaches-guard", builderBase + `
const selected = ExportBuilder.start().source("orders");
const view: {source: (source: string) => unknown} = selected;
view.source("customers");
`);

const result = compile(cases.map(c => c.filename), {noEmit: true}, scratch);
function checkCases(tests, diagnostics, checkQuotes) {
  for (const test of tests) {
    const found = diagnostics.filter(d => d.fileName === test.filename);
    assert.deepEqual(found.map(d => ({line: d.line, code: d.code})), test.expected,
      test.name + "\n" + describe(found));
    if (!checkQuotes) continue;
    const lines = fs.readFileSync(test.filename, "utf8").split("\n");
    for (const diagnostic of found) {
      const code = lines[diagnostic.line - 1].match(/\bTS(\d+)\b/);
      if (code) assert.equal(Number(code[1]), diagnostic.code);
      const quoted = [];
      for (let i = diagnostic.line; i < lines.length && lines[i].trimStart().startsWith("// "); i++) {
        quoted.push(lines[i].trimStart().slice(3));
      }
      if (quoted.length) assert(diagnostic.message.replace(/\s+/g, " ").includes(quoted.join(" ")),
        `Diagnostic quote differs in ${test.name}: ${quoted.join(" ")}\n${diagnostic.message}`);
    }
  }
  assert(!diagnostics.some(d => !tests.some(t => t.filename === d.fileName)), describe(diagnostics));
}
checkCases(cases, result.diagnostics, true);

// The syntax repair depends on strictFunctionTypes, independently of other flags.
const permissive = cases.filter(c => [
  "property-contract-blocks-all-three-paths",
  "property-contract-also-rejects-old-label-only-caller",
].includes(c.name)).map(c => ({...c, expected: []}));
assert.equal(permissive.length, 2);
const loose = compile(permissive.map(c => c.filename), {noEmit: true, strictFunctionTypes: false}, scratch);
checkCases(permissive, loose.diagnostics, false);

// Emit the actual accepted counterexamples and the repaired integration setup.
const repairedRuntime = path.join(scratch, "repaired-runtime.ts");
fs.writeFileSync(repairedRuntime, propertyApi + readerDefinition + writer + repairedArchive + repairedSetup + `
export {createCache, dashboardLabel, receipt, recordCsv, lastCsv, latestDownload, panel};
`);
const executions = [
  "method-cache-admits-archive-bug",
  "annotation-admits-inferred-forwarding",
  "annotation-admits-spread-copy",
  "method-out-still-admits-unsafe-write",
  "builder-structural-view-still-reaches-guard",
  "method-writer-view-reopens-the-hole",
].map(name => cases.find(c => c.name === name));
const successfulExecutions = ["working-cache-and-consumers", "reader-contract-restores-label-caller"]
  .map(name => cases.find(c => c.name === name));
const alternatives = ["generic-spread-keeps-rows-with-archive-path", "one-owner-record-can-project-both-views"]
  .map(name => cases.find(c => c.name === name));
let printedResults = 0;
function executable(test) {
  const source = fs.readFileSync(test.filename, "utf8").replace(
    /^(\s*)([^;\n]+);\s*\/\/ ("[^"]+")$/gm,
    (_, indent, expression, expected) => {
      printedResults++;
      return `${indent}if (${expression} !== ${expected}) throw new Error("Printed result differs");`;
    });
  const filename = path.join(scratch, "runtime-" + test.name + ".ts");
  fs.writeFileSync(filename, source);
  return filename;
}
const executionFiles = [...executions, ...successfulExecutions, ...alternatives].map(executable);
assert.equal(printedResults, 5, "Every early printed result must execute");
const outDir = path.join(scratch, "out");
const emitted = compile([...executionFiles, repairedRuntime], {outDir}, scratch);
assert.equal(emitted.diagnostics.length, 0, describe(emitted.diagnostics));
let runtimeGroups = 0;
for (const test of executions) {
  const run = () => require(path.join(outDir, "runtime-" + test.name + ".js"));
  if (test.name.startsWith("builder-")) assert.throws(run, /Source has already been selected\./);
  else assert.throws(run, {name: "TypeError", message: "Cannot read properties of undefined (reading 'toFixed')"});
  runtimeGroups++;
}
for (const test of successfulExecutions) {
  assert.doesNotThrow(() => require(path.join(outDir, "runtime-" + test.name + ".js")));
  runtimeGroups++;
}
const spread = require(path.join(outDir, "runtime-generic-spread-keeps-rows-with-archive-path.js"));
assert.deepEqual(spread.csvCache.read(), {path: "orders.zip", rows: 120});
assert.equal(spread.panel.label(), "orders.zip");
assert.equal(spread.receipt(spread.csvCache), "120 rows");
runtimeGroups++;
const combined = require(path.join(outDir, "runtime-one-owner-record-can-project-both-views.js"));
combined.useArchive("orders.zip");
assert.equal(combined.label(), "orders.zip");
assert.equal(combined.receipt(combined.csvReader), "120 rows");
assert.equal(combined.owner.read().csv.path, "orders.csv");
runtimeGroups++;
const api = require(path.join(outDir, "repaired-runtime.js"));
assert.equal(api.receipt(api.lastCsv), "120 rows");
assert.equal(api.panel.label(), "orders.csv");
assert.notEqual(api.lastCsv, api.latestDownload);
runtimeGroups++;

// Compare each printed result to execution of the chapter's calls in order.
const printed = [...repaired.matchAll(/^(panel\.label\(\)|receipt\(lastCsv\));\s*\/\/ ("[^"]+")$/gm)]
  .map(m => ({call: m[1], value: JSON.parse(m[2])}));
assert.equal(printed.length, 4);
api.panel.useArchive("orders.zip");
assert.equal(api.panel.label(), printed[0].value);
assert.equal(api.receipt(api.lastCsv), printed[1].value);
assert.deepEqual(api.lastCsv.read(), {path: "orders.csv", rows: 120});
assert.deepEqual(api.latestDownload.read(), {path: "orders.zip"});
runtimeGroups++;
api.recordCsv({path: "next.csv", rows: 140});
assert.equal(api.panel.label(), printed[2].value);
assert.equal(api.receipt(api.lastCsv), printed[3].value);
runtimeGroups++;

const owner = api.createCache({path: "first.csv", rows: 2});
const label = api.dashboardLabel(owner);
assert.equal(label(), "first.csv");
owner.write({path: "later.csv", rows: 3});
assert.equal(label(), "later.csv");
assert.equal(api.receipt(owner), "3 rows");
runtimeGroups++;

console.log(`Chapter 12: TypeScript ${version}; ${blocks.length} fences, ${cases.length + permissive.length} compiler cases, ${runtimeGroups} runtime groups passed. Fixtures: ${scratch}`);
