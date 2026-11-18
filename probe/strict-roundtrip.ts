// Read each Word Strict DOCX with the PATCHED core source (fix/ branch) and write it back.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readOoxmlPackage, writeOoxmlPackage } from '../../fix/packages/core/src/store/package/ooxml-package.ts';
import { openHeadlessDocument } from '../../fix/packages/core/src/store/headless-document-view.ts';

const [inDir, outDir] = process.argv.slice(2);
const files = (await readdir(inDir)).filter((f) => f.endsWith('.docx')).sort();
const results = [];

for (const f of files) {
  const bytes = new Uint8Array(await readFile(join(inDir, f)));
  const pkg = readOoxmlPackage(bytes);

  if (!pkg.ok) { results.push({ file: f, read: pkg.reason }); continue; }

  const out = writeOoxmlPackage(pkg.package);
  await writeFile(join(outDir, f), out);
  const reopened = readOoxmlPackage(out);
  const h = openHeadlessDocument(bytes);
  results.push({ file: f, written: true, reopened: reopened.ok, headless: h.ok ? 'ok' : h.reason });
}

console.log(JSON.stringify(results, null, 1));
