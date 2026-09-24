// Use the installed compiler CLI; TypeScript 7 has no stable compiler API.
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const packageFile = require.resolve("typescript/package.json");
const executable = path.join(path.dirname(packageFile), "bin", "tsc");
const version = cp.execFileSync(process.execPath, [executable, "--version"], {encoding: "utf8"})
  .trim().replace(/^Version /, "");
assert.equal(version, require(packageFile).version, "Compiler and installed package versions differ");
const defaults = {
  strict: true,
  exactOptionalPropertyTypes: true,
  target: "ES2022",
  module: "Node16",
  moduleResolution: "Node16",
  types: [],
  skipLibCheck: true,
  noEmitOnError: true,
};
let sequence = 0;
function compile(files, options = {}, cwd = path.dirname(files[0])) {
  assert(files.length, "A compilation must include source files");
  const config = path.join(cwd, `tsconfig-check-${++sequence}.json`);
  fs.writeFileSync(config, JSON.stringify({
    compilerOptions: {...defaults, rootDir: cwd, ...options},
    files: files.map(file => path.resolve(file)),
    include: [],
  }, null, 2));
  const result = cp.spawnSync(process.execPath,
    [executable, "--project", config, "--pretty", "false", "--noErrorTruncation"],
    {cwd, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, timeout: 60000});
  if (result.error) throw result.error;
  const output = result.stdout + result.stderr;
  const diagnostics = [];
  for (const line of output.split(/\r?\n/)) {
    const located = line.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)$/);
    const global = line.match(/^error TS(\d+): (.*)$/);
    if (located) diagnostics.push({fileName: path.resolve(cwd, located[1]),
      line: Number(located[2]), column: Number(located[3]), code: Number(located[4]), message: located[5]});
    else if (global) diagnostics.push({code: Number(global[1]), message: global[2]});
    else if (line.trim() && diagnostics.length) diagnostics.at(-1).message += "\n" + line;
  }
  assert(result.status === 0 || diagnostics.length > 0, `Compiler failed without parsed diagnostics:\n${output}`);
  assert(result.status !== 0 || diagnostics.length === 0, `Compiler succeeded with error diagnostics:\n${output}`);
  return {diagnostics, output, status: result.status};
}
function describe(diagnostics) {
  return diagnostics.map(d => `${d.fileName || "configuration"}${d.line ? ":" + d.line : ""} TS${d.code}: ${d.message}`).join("\n");
}
module.exports = {compile, describe, version, defaults};
