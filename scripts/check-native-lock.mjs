import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { packages } = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
const nativePackage =
  /^(?:@swc\/core-|@esbuild\/|@rollup\/rollup-|@next\/swc-|@tailwindcss\/oxide-|lightningcss-)/;

function resolvePackage(parent, name) {
  let directory = parent;
  for (;;) {
    if (path.posix.basename(directory) !== 'node_modules') {
      const candidate = path.posix.join(directory, 'node_modules', name);
      if (packages[candidate]) return packages[candidate];
    }
    if (!directory || directory === '.') return undefined;
    const ancestor = path.posix.dirname(directory);
    directory = ancestor === '.' ? '' : ancestor;
  }
}

let checked = 0;
for (const [parent, entry] of Object.entries(packages)) {
  for (const [name, version] of Object.entries(entry.optionalDependencies || {})) {
    if (!nativePackage.test(name)) continue;
    const target = resolvePackage(parent, name);
    assert.ok(
      target,
      `${parent}: missing native dependency ${name}@${version} in package-lock.json`,
    );
    if (/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
      assert.equal(target.version, version, `${parent}: incompatible native dependency ${name}`);
    }
    checked++;
  }
}
assert.ok(checked > 0, 'No native dependencies found in package-lock.json');
console.log(`Native dependency lock entries verified: ${checked}`);
