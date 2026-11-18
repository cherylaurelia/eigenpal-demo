// Read each DOCX with the core package reader and write it back unchanged.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { readOoxmlPackage, writeOoxmlPackage, openHeadlessDocument } from '@docx-editor.dev/core/store';

const [inDir, outDir] = process.argv.slice(2);
const files = (await readdir(inDir)).filter((f) => f.endsWith('.docx')).sort();
const results = [];

for (const f of files) {
  const bytes = new Uint8Array(await readFile(join(inDir, f)));
  const r = { file: f };

  try {
    const pkg = readOoxmlPackage(bytes);

    if (!pkg.ok) { r.read = pkg.reason ?? JSON.stringify(pkg).slice(0, 200); results.push(r); continue; }

    const out = writeOoxmlPackage(pkg.package ?? pkg.value ?? pkg.pkg);
    await writeFile(join(outDir, f), out);
    r.written = true;
    const h = openHeadlessDocument(bytes);
    r.headless = h.ok ? 'ok' : (h.reason ?? 'fail');
  } catch (e) { r.error = String(e?.message ?? e).slice(0, 200); }

  results.push(r);
}

await writeFile(join(outDir, '_results.json'), JSON.stringify(results, null, 1));

const c = (k) => results.filter(k).length;

console.log({ total: results.length, written: c((r) => r.written), readFail: c((r) => r.read), error: c((r) => r.error), headlessFail: c((r) => r.headless && r.headless !== 'ok') });
