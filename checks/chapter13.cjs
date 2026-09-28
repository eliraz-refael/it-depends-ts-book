// Multi-file, manuscript-derived augmentation checks on the locked compiler.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const chapter = fs.readFileSync(path.resolve(__dirname,
  "../book/02-advanced-typescript/07-declaration-merging.md"), "utf8");
const blocks = [...chapter.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
const used = new Set();
function block(prefix) {
  const matches = blocks.filter(b => b.startsWith(prefix));
  assert.equal(matches.length, 1, `Expected one fence starting with ${prefix}`);
  used.add(matches[0]);
  return matches[0] + "\n";
}
const api = block("// label-kit/index.d.ts");
const plain = block('import { Label } from "label-kit";');
const initialPatch = block("// label-frame.d.ts");
const badge = block("// badge.ts\n");
const web = block("// web.ts");
const batch = block("// batch.ts\n");
const bridge = block("// labels.ts");
const repairedEntry = block('import { Label } from "./labels";');
const isolated = block("// isolated.ts");
const typedBadge = block("// badge.ts — replacement\n");
const bypass = block("// batch.ts — bypassing");
const optional = block("// Replacement augmentation");
const guardedBadge = block("// badge.ts — replacement with");
const wrong = block("// wrong-patch.d.ts");
const globalPatch = block("// host.d.ts");
const globalUse = block("const prefix = window.BADGE_HOST");
assert.equal(used.size, blocks.length, "Every manuscript fence must be exercised");
const optionalBridge = bridge.replace(/declare module "label-kit" \{[\s\S]*?\n\}/, optional.trimEnd());
assert.notEqual(optionalBridge, bridge);
const wrongParts = wrong.split("// check-version.ts — a separate file\n");
assert.equal(wrongParts.length, 2);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch13-"));

// The library and plugin are fictional. These are the entire small runtime
// stand-ins, not a verification of an external label/printing implementation.
const packageDir = path.join(scratch, "node_modules/label-kit");
fs.mkdirSync(packageDir, {recursive: true});
fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({
  name: "label-kit", version: "1.0.0", main: "./index.js", types: "./index.d.ts",
  exports: {
    ".": {types: "./index.d.ts", default: "./index.js"},
    "./frame": {types: "./frame.d.ts", default: "./frame.js"},
  },
}));
fs.writeFileSync(path.join(packageDir, "index.d.ts"), api);
fs.writeFileSync(path.join(packageDir, "index.js"), `
class Label {
  constructor(text) { this.text = text; }
  render() { return this.text; }
}
exports.Label = Label;
exports.version = "1.0.0";
`);
// The plugin can be resolved, but does not yet declare its prototype patch.
fs.writeFileSync(path.join(packageDir, "frame.d.ts"), "export {};\n");
fs.writeFileSync(path.join(packageDir, "frame.js"), `
const {Label} = require("./index.js");
Label.prototype.frame = function (marker) {
  this.text = marker + " " + this.text + " " + marker;
  return this;
};
`);
const cases = [];
function example(name, files, {roots = Object.keys(files), codes = {}, options = {}} = {}) {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir, {recursive: true});
  const expected = [];
  for (const [filename, source] of Object.entries(files)) {
    const full = path.join(dir, filename);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, source);
    const lines = source.split("\n").flatMap((line, i) => /\/\/ Error(?: TS\d+|:)/.test(line) ? [i + 1] : []);
    const expectedCodes = codes[filename] || [];
    assert.equal(lines.length, expectedCodes.length, `Error markers in ${name}/${filename}`);
    expected.push(...expectedCodes.map((code, i) => ({file: filename, line: lines[i], code})));
  }
  const outDir = path.join(dir, "out");
  // Checking the augmentation files themselves is essential to this chapter.
  const result = compile(roots.map(f => path.join(dir, f)), {skipLibCheck: false, outDir, ...options}, dir);
  const actual = result.diagnostics.map(d => ({file: d.fileName && path.relative(dir, d.fileName), line: d.line, code: d.code}));
  const order = list => [...list].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.code - b.code);
  assert.deepEqual(order(actual), order(expected), `${name}\n${describe(result.diagnostics)}`);
  for (const diagnostic of result.diagnostics) {
    const sourceLine = fs.readFileSync(diagnostic.fileName, "utf8").split("\n")[diagnostic.line - 1];
    const quote = sourceLine.match(/\/\/ Error TS(\d+): (.*)$/);
    if (quote) {
      assert.equal(diagnostic.code, Number(quote[1]), name);
      assert.equal(diagnostic.message, quote[2], `Printed diagnostic in ${name}`);
    }
  }
  const test = {name, dir, outDir, result};
  cases.push(test);
  return test;
}
const initial = {"label-frame.d.ts": initialPatch, "badge.ts": badge, "web.ts": web, "batch.ts": batch};
const namedBridge = {"labels.ts": bridge, "badge.ts": badge, "web.ts": repairedEntry, "batch.ts": repairedEntry};
const typeEdge = {"labels.ts": bridge, "badge.ts": typedBadge, "batch.ts": bypass};
const guarded = {"labels.ts": optionalBridge, "badge.ts": guardedBadge, "web.ts": repairedEntry, "batch.ts": repairedEntry};
const bare = example("core-label", {"main.ts": plain});
example("plugin-javascript-does-not-add-types", {"main.ts": `
import "label-kit/frame";
import {Label} from "label-kit";
new Label("Ada").frame("*"); // Error: the plugin declarations omit frame.
`}, {codes: {"main.ts": [2339]}});
const whole = example("one-program-two-entrypoints", initial);
const patched = example("runtime-bridge-both-entrypoints", namedBridge);
example("isolated-raw-call", {"isolated.ts": isolated}, {codes: {"isolated.ts": [2339]}});
const typeOnly = example("type-edge-admits-raw-entry", typeEdge, {roots: ["batch.ts"]});
const fixed = example("optional-bridge-with-shared-check", guarded);
const optionalBypass = example("optional-raw-entry-reaches-check", {...guarded, "batch.ts": bypass}, {roots: ["batch.ts"]});
const unguarded = typedBadge.replace('return label.frame("*").render();',
  'return label.frame("*").render(); // Error: the optional method has not been checked.');
const noCheck = example("optional-rejects-unchecked-call", {...typeEdge, "labels.ts": optionalBridge, "badge.ts": unguarded},
  {roots: ["batch.ts"], codes: {"badge.ts": [2722]}});
assert(chapter.includes("`TS2722: " + noCheck.result.diagnostics[0].message + "`"), "Prose diagnostic must match");
example("guard-does-not-refine-returned-label", {"labels.ts": optionalBridge, "main.ts": `
import {Label} from "./labels";
const label = new Label("Ada");
if (typeof label.frame === "function") {
  label.frame("*").frame("#"); // Error: the returned Label still has an optional frame.
}
`}, {codes: {"main.ts": [2722]}});
const factory = example("checked-local-subtype-preserves-repeated-chain", {"labels.ts": optionalBridge, "main.ts": `
import {Label} from "./labels";
interface FramedLabel extends Label { frame(marker: string): this; }
function requireFramed(label: Label): asserts label is FramedLabel {
  if (typeof label.frame !== "function") throw new Error("Badge framing plugin was not loaded");
}
function framedLabel(text: string): FramedLabel {
  const label = new Label(text);
  requireFramed(label);
  return label;
}
console.log(framedLabel("Ada").frame("*").frame("#").render());
`});
example("ambient-module-hides-version", {"wrong-patch.d.ts": wrongParts[0], "check-version.ts": wrongParts[1]},
  {codes: {"check-version.ts": [2305]}});
const versionUse = wrongParts[1].replace(/ \/\/ Error TS2305:.*$/m, "");
const importRepair = example("top-level-import-restores-module", {"patch.d.ts": 'import "label-kit";\n' + wrongParts[0], "check-version.ts": versionUse});
const exportRepair = example("top-level-export-restores-module", {"patch.d.ts": 'export {};\n' + wrongParts[0], "check-version.ts": versionUse});
const global = example("optional-host-global", {"host.d.ts": globalPatch, "main.ts": globalUse});
const localWindow = globalPatch.replace(/declare global \{\n([\s\S]*)\n\}\n$/, "$1\n");
assert.notEqual(localWindow, globalPatch);
example("window-in-module-is-local", {"host.d.ts": localWindow, "main.ts": globalUse.replace(
  'const prefix = window.BADGE_HOST?.prefix ?? "";',
  'const prefix = window.BADGE_HOST?.prefix ?? ""; // Error: this Window was declared locally.')},
  {codes: {"main.ts": [2339]}});
example("optional-host-cannot-be-assumed-present", {"host.d.ts": globalPatch, "main.ts": `
console.log(window.BADGE_HOST.prefix); // Error: the standalone page need not have a host.
`}, {codes: {"main.ts": [18048]}});
// Model an actual dependency upgrade: its declarations load through the plugin
// import BEFORE the application's augmentation, rather than as a later root.
const upgraded = Object.fromEntries(fs.readdirSync(packageDir).map(file =>
  ["node_modules/label-kit/" + file, fs.readFileSync(path.join(packageDir, file), "utf8")]));
upgraded["node_modules/label-kit/frame.d.ts"] = `import "./index";
declare module "./index" { interface Label { frame(marker: string): this; } }
`;
const conflictingBridge = optionalBridge.replace("frame?(marker: string): this;",
  "frame?(marker: string): this; // Error: upstream requires the same method.");
for (const skipLibCheck of [false, true]) {
  example("upstream-required-conflicts-in-ts-" + skipLibCheck,
    {...upgraded, "labels.ts": conflictingBridge},
    {roots: ["labels.ts"], codes: {"labels.ts": [2386]}, options: {skipLibCheck}});
}
// Contrast with keeping both declarations in .d.ts files. No source-file
// check protects this alternative when all declaration checking is skipped.
const optionalDeclarationPatch = optionalBridge.replace(/import "label-kit\/frame";/, "");
example("required-optional-in-dts-conflict", {
  "patch.d.ts": optionalDeclarationPatch,
  "upstream.d.ts": `import "label-kit";
declare module "label-kit" {
  interface Label {
    frame(marker: string): this; // Error: all signatures must agree on optionality.
  }
}
`,
}, {codes: {"upstream.d.ts": [2386]}});
example("skipping-dts-checks-conceals-dts-conflict", {
  "patch.d.ts": optionalDeclarationPatch,
  "upstream.d.ts": 'import "label-kit";\ndeclare module "label-kit" {interface Label {frame(marker: string): this;}}\n',
}, {options: {skipLibCheck: true}});
// Different *method signatures* can merge as overloads. The chapter only claims
// a diagnostic for mixing optional and required members, not upgrade detection.
example("different-required-signatures-merge-as-overloads", {"labels.ts": bridge, "upstream.d.ts": `
import "label-kit";
declare module "label-kit" { interface Label { frame(marker: number): this; } }
`, "main.ts": 'import {Label} from "./labels";\nnew Label("Ada").frame(42);\n'});
const retro = example("existing-instance-sees-later-plugin", {"label-frame.d.ts": initialPatch, "main.ts": `
import {Label} from "label-kit";
async function run() {
  const label = new Label("Ada");
  if ("frame" in Label.prototype) throw new Error("Plugin loaded before the experiment");
  await import("label-kit/frame");
  if (label.frame("*") !== label) throw new Error("The method did not preserve identity");
  console.log(label.render());
}
void run();
`});
const nonexistentRuntime = example("side-effect-import-of-dts-is-not-an-installer", {"label-frame.d.ts": initialPatch, "main.ts": `
import "./label-frame";
import {Label} from "label-kit";
console.log(new Label("Ada").frame("*").render());
`});

// Derive expected printed values from all annotated console output in the
// manuscript, so editing a comment alone cannot silently invalidate its claim.
function printedOutput(source) {
  const values = [...source.matchAll(/console\.log\([^\n]+\); \/\/ ("[^"\n]*")/g)]
    .map(match => JSON.parse(match[1]));
  assert(values.length, "Expected printed values in manuscript fence");
  return values.map(value => value + "\n").join("");
}
const plainOutput = printedOutput(plain);
const webOutput = printedOutput(web);
const framedOutput = printedOutput(repairedEntry);
assert.equal([...chapter.matchAll(/console\.log\([^\n]+\); \/\/ ("[^"\n]*")/g)].length, 3,
  "All printed comments must be checked");
let runtimeGroups = 0;
function run(test, entry, {stdout = "", failure} = {}) {
  const result = cp.spawnSync(process.execPath, [path.join(test.outDir, entry + ".js")],
    {cwd: test.dir, encoding: "utf8", timeout: 10000});
  if (result.error) throw result.error;
  assert.equal(result.stdout, stdout, `${test.name}/${entry} stdout`);
  if (failure) {
    assert.notEqual(result.status, 0, `${test.name}/${entry} must fail`);
    assert(result.stderr.includes(failure), `${test.name}/${entry}: ${result.stderr}`);
  } else {
    assert.equal(result.status, 0, `${test.name}/${entry}: ${result.stderr}`);
    assert.equal(result.stderr, "");
  }
  runtimeGroups++;
}
run(bare, "main", {stdout: plainOutput});
run(whole, "web", {stdout: webOutput});
run(whole, "batch", {failure: "TypeError: label.frame is not a function"});
assert(chapter.includes("TypeError: label.frame is not a function"));
assert(!fs.existsSync(path.join(whole.outDir, "label-frame.js")), "A .d.ts file must not emit JavaScript");
// This is exactly why both successful and faulty entry points need fresh processes.
const contamination = cp.spawnSync(process.execPath, ["-e", 'require("./out/web.js"); require("./out/batch.js");'],
  {cwd: whole.dir, encoding: "utf8", timeout: 10000});
assert.equal(contamination.status, 0, contamination.stderr);
assert.equal(contamination.stdout, webOutput + webOutput);
runtimeGroups++;
run(patched, "web", {stdout: framedOutput});
run(patched, "batch", {stdout: framedOutput});
run(typeOnly, "batch", {failure: "TypeError: label.frame is not a function"});
const emittedBadge = fs.readFileSync(path.join(typeOnly.outDir, "badge.js"), "utf8");
const emittedBridge = fs.readFileSync(path.join(typeOnly.outDir, "labels.js"), "utf8");
assert(!emittedBadge.includes('require("./labels")'), "The type-only edge must not load the integration module");
assert(emittedBridge.includes('require("label-kit/frame")'), "The integration module must retain the runtime import");
run(fixed, "web", {stdout: framedOutput});
run(fixed, "batch", {stdout: framedOutput});
run(optionalBypass, "batch", {failure: "Error: Badge framing plugin was not loaded"});
run(factory, "main", {stdout: "# * Ada * #\n"});
run(importRepair, "check-version", {stdout: "1.0.0\n"});
run(exportRepair, "check-version", {stdout: "1.0.0\n"});
const hostScript = fs.readFileSync(path.join(global.outDir, "main.js"), "utf8");
for (const [window, expected] of [[{}, ""], [{BADGE_HOST: {prefix: "VIP "}}, "VIP "]]) {
  const output = [];
  vm.runInNewContext(hostScript, {exports: {}, window, console: {log: value => output.push(value)}});
  assert.deepEqual(output, [expected]);
}
runtimeGroups++;
run(retro, "main", {stdout: "* Ada *\n"});
run(nonexistentRuntime, "main", {failure: "Cannot find module './label-frame'"});
console.log(`TypeScript ${version}: Chapter 13 — ${blocks.length} fences, ${cases.length} compiler cases, ${runtimeGroups} runtime groups. PASS`);
console.log(`Fixtures: ${scratch}`);
