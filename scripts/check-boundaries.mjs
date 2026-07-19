#!/usr/bin/env node
// Validates package boundaries in the Recon-OS workspace.
//
// Rules enforced:
//  - A workspace dependency must resolve to a known @recon-os/* package.
//  - Packages (packages/*) must not depend on applications (apps/*).
//    Apps may depend on packages, but never the reverse, to avoid cycles.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const manifests = [];
for (const area of ["apps", "packages"]) {
  const areaDir = join(root, area);
  if (!existsSync(areaDir)) continue;
  for (const name of readdirSync(areaDir)) {
    const manifestPath = join(areaDir, name, "package.json");
    if (existsSync(manifestPath)) manifests.push(manifestPath);
  }
}

const known = new Set();
const locationOf = new Map();
for (const manifestPath of manifests) {
  const json = JSON.parse(readFileSync(manifestPath, "utf8"));
  known.add(json.name);
  locationOf.set(json.name, manifestPath.split(sep).includes("apps") ? "apps" : "packages");
}

let failures = 0;
for (const manifestPath of manifests) {
  const json = JSON.parse(readFileSync(manifestPath, "utf8"));
  const deps = { ...(json.dependencies ?? {}), ...(json.devDependencies ?? {}) };
  for (const dep of Object.keys(deps)) {
    if (!dep.startsWith("@recon-os/")) continue;
    if (!known.has(dep)) {
      console.error(`✗ ${json.name} depends on unknown workspace package "${dep}"`);
      failures += 1;
      continue;
    }
    if (locationOf.get(json.name) === "packages" && locationOf.get(dep) === "apps") {
      console.error(`✗ package ${json.name} depends on application ${dep} (upward dependency)`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nBoundary check failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log(`✓ Package boundaries valid (${manifests.length} workspace packages checked).`);
