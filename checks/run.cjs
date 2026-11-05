const assert = require("node:assert/strict");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const {version} = require("./compiler.cjs");

assert.equal(version, require("../package.json").devDependencies.typescript,
  "Run npm ci to install the book's pinned TypeScript version");
for (const lockfile of ["package-lock.json", "design/print/package-lock.json"]) {
  const {packages} = require(path.resolve(__dirname, "..", lockfile));
  for (const [name, entry] of Object.entries(packages)) {
    assert.ok(!entry.resolved || entry.resolved.startsWith("https://registry.npmjs.org/"),
      `${lockfile} resolves ${name} outside the public npm registry: ${entry.resolved}`);
  }
}
for (const script of ["baseline", "chapters1-6", "chapters7-8", "chapter9", "chapter10", "chapter11", "chapter12", "chapter13", "chapter14", "chapter15", "chapter16", "chapter17", "chapter18", "chapter19", "chapter20", "chapter21", "chapter22", "chapter23", "chapter24", "chapter25", "chapter26", "chapter27", "bonus1", "bonus2", "bonus3"]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script + ".cjs")],
    {stdio: "inherit", cwd: path.resolve(__dirname, "..")});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
