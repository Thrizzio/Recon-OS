import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const packages = [
  "apps/api",
  "apps/web",
  "packages/core",
  "packages/config",
  "packages/sdk",
  "packages/cli",
];

test("pnpm workspace declares package globs", () => {
  const wsPath = join(root, "pnpm-workspace.yaml");
  assert.ok(existsSync(wsPath), "missing pnpm-workspace.yaml");
  const text = readFileSync(wsPath, "utf8");
  assert.ok(text.includes("apps/*"), "apps/* must be a workspace glob");
  assert.ok(text.includes("packages/*"), "packages/* must be a workspace glob");
});

for (const pkg of packages) {
  test(`package manifest exists and is private: ${pkg}`, () => {
    const manifestPath = join(root, pkg, "package.json");
    assert.ok(existsSync(manifestPath), `missing ${manifestPath}`);
    const json = JSON.parse(readFileSync(manifestPath, "utf8"));
    assert.ok(json.name, `package ${pkg} is missing a name`);
    assert.equal(json.private, true, `package ${pkg} should be private`);
  });
}
