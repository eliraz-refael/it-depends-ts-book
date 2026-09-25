const assert = require("node:assert/strict");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const {version} = require("./compiler.cjs");

assert.equal(version, require("../package.json").devDependencies.typescript,
  "Run npm ci to install the book's pinned TypeScript version");
for (const script of ["baseline", "chapters1-6", "chapters7-8", "chapter9", "chapter10", "chapter11"]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script + ".cjs")],
    {stdio: "inherit", cwd: path.resolve(__dirname, "..")});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
