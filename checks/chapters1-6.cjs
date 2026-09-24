// node checks/chapters1-6.cjs
// Manuscript-extracted compiler and runtime checks for Chapters 1-6, run through the
// installed TypeScript CLI (checks/compiler.cjs).
// BOOK_ROOT overrides the repository root; BOOK_NODE_MODULES overrides where zod and
// @types/express resolve (defaults to the repository's node_modules).
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL} = require("node:url");

const ROOT = path.resolve(process.env.BOOK_ROOT || path.join(__dirname, ".."));
const MODULES = path.resolve(process.env.BOOK_NODE_MODULES || path.join(ROOT, "node_modules"));
const {compile, describe, version} = require(path.join(ROOT, "checks", "compiler.cjs"));
const chapters = require("./chapters1-6.cases.cjs");

const HELPERS = `
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;
`;
const flat = text => text.replace(/\s+/g, " ");

function readChapter(relative) {
  const markdown = fs.readFileSync(path.join(ROOT, "book", relative), "utf8");
  const fences = [...markdown.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(match => ({
    source: match[1],
    markdownLine: markdown.slice(0, match.index).split("\n").length + 1,
  }));
  return {markdown, fences};
}

// Case fields:
//   fence   a fence number, {fence, lines: [from, to]}, or an array of those, in order;
//           `lines` on the case applies to a single fence
//   before  declared context; after: type assertions or follow-up code
//   edit    [[text, replacement]] applied to fence text, recorded in the summary
//   expect  every diagnostic, as [where, line, code, quote?, quotedIn?]; `where` is a fence
//           number (line relative to that fence) or "before"/"after". A quote must appear in
//           the compiler message and in fence `quotedIn` (default `where`), or anywhere in the
//           chapter when quotedIn is "markdown".
//   options compiler overrides; files: extra {name: source} beside the case; separate: own
//           program (for global declarations). Any of these compiles the case alone.
//   runtime async (module, printed) => assertions against the emitted JavaScript and its
//           console.log output
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-ch1-6-"));
fs.symlinkSync(MODULES, path.join(scratch, "node_modules"), "dir");
// ES modules, so fences can use top-level await under Node16 resolution.
fs.writeFileSync(path.join(scratch, "package.json"), JSON.stringify({type: "module"}));

const summary = {typescript: version, chapters: {}};
const plans = [];
for (const [relative, spec] of Object.entries(chapters)) {
  const chapter = readChapter(relative);
  const slug = path.basename(relative, ".md");
  const covered = new Set(Object.keys(spec.omitted || {}).map(Number));
  const edits = [];
  spec.cases.forEach((test, index) => {
    const name = `${slug}-${String(index + 1).padStart(2, "0")}-${test.name}`;
    const segments = [];
    let text = "";
    const append = (label, code, offset = 0) => {
      segments.push({label, start: text.split("\n").length, count: code.split("\n").length, offset});
      text += code + "\n";
    };
    append("helpers", HELPERS);
    if (test.before) append("before", test.before);
    const parts = [].concat(test.fence).map(part => typeof part === "number"
      ? {fence: part, lines: [].concat(test.fence).length === 1 ? test.lines : undefined} : part);
    for (const {fence: number, lines} of parts) {
      const fence = chapter.fences[number - 1];
      assert(fence, `${relative}: no fence ${number}`);
      covered.add(number);
      let source = fence.source;
      for (const [find, replacement] of test.edit || []) {
        if (!source.includes(find)) continue;
        source = source.replace(find, replacement);
        edits.push(`fence ${number}: ${JSON.stringify(find)} -> ${JSON.stringify(replacement)}`);
      }
      if (lines) source = source.split("\n").slice(lines[0] - 1, lines[1]).join("\n");
      append(number, source, lines ? lines[0] - 1 : 0);
    }
    for (const [find] of test.edit || []) {
      assert(edits.some(e => e.includes(JSON.stringify(find))), `${relative}: ${test.name} edit ${JSON.stringify(find)} unused`);
    }
    if (test.after) append("after", test.after);
    const filename = path.join(scratch, name + ".ts");
    fs.writeFileSync(filename, text);
    const extra = Object.entries(test.files || {}).map(([file, source]) => {
      const extraName = path.join(scratch, file);
      fs.writeFileSync(extraName, source);
      return extraName;
    });
    const alone = Boolean(test.separate || test.options || test.files || test.runtime);
    plans.push({relative, test, name, filename, extra, alone, segments, chapter});
  });
  const missing = chapter.fences.map((_, i) => i + 1).filter(n => !covered.has(n));
  assert.deepEqual(missing, [], `${relative}: fences without a case or recorded omission`);
  summary.chapters[slug] = {fences: chapter.fences.length, cases: spec.cases.length,
    omitted: spec.omitted || {}, edits: [...new Set(edits)]};
}

// BOOK_CHECK_OPTIONS (JSON) adds options for a profile run, e.g. a fresh project's settings.
const base = {moduleDetection: "force", noEmit: true, ...JSON.parse(process.env.BOOK_CHECK_OPTIONS || "{}")};
const shared = plans.filter(p => !p.alone);
const diagnostics = compile(shared.map(p => p.filename), base, scratch).diagnostics;
for (const plan of plans.filter(p => p.alone)) {
  const options = {...base, ...plan.test.options};
  if (plan.test.runtime) Object.assign(options, {noEmit: false, outDir: path.join(scratch, "out-" + plan.name)});
  diagnostics.push(...compile([plan.filename, ...plan.extra], options, scratch).diagnostics);
}
const caseFiles = plans.flatMap(p => [p.filename, ...p.extra]);
const unplaced = diagnostics.filter(d => !caseFiles.includes(d.fileName));
assert.equal(unplaced.length, 0, "Diagnostics outside the case files:\n" + describe(unplaced));

(async () => {
  const failures = [];
  let runtimeGroups = 0;
  for (const {relative, test, name, filename, segments, chapter} of plans) {
    const locate = line => {
      const segment = segments.find(s => line >= s.start && line < s.start + s.count);
      assert(segment, `${filename}:${line} is outside every segment`);
      return [segment.label, line - segment.start + 1 + segment.offset];
    };
    const found = diagnostics.filter(d => d.fileName === filename).map(d => {
      const [where, line] = locate(d.line);
      return {where, line, code: d.code, message: d.message};
    });
    const key = e => `${e[0]}:${e[1]}:TS${e[2]}`;
    const actual = found.map(d => key([d.where, d.line, d.code])).sort();
    const expected = (test.expect || []).map(key).sort();
    const problems = [];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      problems.push(`expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}\n` +
        found.map(d => `    ${d.where}:${d.line} TS${d.code} ${d.message.split("\n")[0]}`).join("\n"));
    }
    for (const [where, line, code, quote, quotedIn = where] of test.expect || []) {
      if (!quote) continue;
      const diagnostic = found.find(d => d.where === where && d.line === line && d.code === code);
      if (diagnostic && !flat(diagnostic.message).includes(quote)) {
        problems.push(`TS${code} at ${where}:${line} lacks ${JSON.stringify(quote)}; got ${JSON.stringify(flat(diagnostic.message))}`);
      }
      const quoted = quotedIn === "markdown" ? chapter.markdown
        : chapter.fences[quotedIn - 1].source.replace(/\n\s*\/\/\s*/g, " ");
      if (!flat(quoted).includes(quote)) {
        problems.push(`${quotedIn === "markdown" ? "chapter" : "fence " + quotedIn} does not quote ${JSON.stringify(quote)}`);
      }
    }
    if (!problems.length && test.runtime) {
      const emitted = path.join(scratch, "out-" + name, name + ".js");
      const log = console.log;
      const printed = [];
      try {
        console.log = (...values) => printed.push(values.map(String).join(" "));
        const module = await import(pathToFileURL(emitted).href);
        console.log = log;
        await test.runtime(module, printed);
        runtimeGroups++;
      } catch (error) {
        console.log = log;
        problems.push(`runtime: ${error.message}`);
      }
    }
    if (problems.length) failures.push(`${relative} :: ${test.name}\n  ${problems.join("\n  ")}`);
  }
  if (failures.length) {
    console.error(failures.join("\n\n"));
    console.error(`\n${failures.length} failing case(s); scratch kept at ${scratch}`);
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({...summary, compilerCases: plans.length, runtimeGroups, scratch}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
