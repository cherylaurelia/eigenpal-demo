import Image from "next/image";
import { LO_DATA, STRICT_FILES, SWEEP, shotFor } from "../lib/results";

const BRANCH = "https://github.com/cherylaurelia/docx-editor/tree/fix/strict-open-xml";

const DIFF =
  "https://github.com/eigenpal/docx-editor/compare/main...cherylaurelia:docx-editor:fix/strict-open-xml";

const REPO = "https://github.com/cherylaurelia/eigenpal-demo";
const PROBE = `${REPO}/tree/main/probe`;

const OTHER_READERS = [
  { name: "pandoc #7691", href: "https://github.com/jgm/pandoc/issues/7691" },
  { name: "python-docx #1520", href: "https://github.com/python-openxml/python-docx/issues/1520" },
  { name: "Dify graphon #346 (fixed Nov 12)", href: "https://github.com/langgenius/graphon/issues/346" },
];

const linkClass = "text-blue underline underline-offset-2 hover:text-blue-dark";

function Shot({ src, alt, caption, tall }: { src: string; alt: string; caption: string; tall?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-white">
      <Image
        src={src}
        alt={alt}
        width={tall ? 920 : 740}
        height={tall ? 1100 : 400}
        className="aspect-[4/3] h-auto w-full bg-[#f3f2f0] object-contain object-top"
        sizes="(min-width: 768px) 460px, 100vw"
      />
      <figcaption className="border-t border-line px-4 py-2 text-sm text-ink-2">{caption}</figcaption>
    </figure>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <p className="font-mono text-xs tracking-wide text-purple uppercase">docx-editor · Word Strict Open XML</p>
      <h1 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
        Word can save .docx files as &ldquo;Strict Open XML&rdquo;. docx-editor says they are not .docx files.
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-ink-2">
        A 58-line change in the package reader opens all {SWEEP.strictRefused} Word-saved Strict test files, renders
        them the same as their Transitional form, and saves them as Transitional.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={DIFF} className="rounded-lg bg-blue px-4 py-2 font-medium text-white hover:bg-blue-dark">
          See the patch (fork branch)
        </a>
        <a href={REPO} className="rounded-lg border border-line bg-white px-4 py-2 font-medium hover:border-blue">
          Demo repo and scripts
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Before and after: strict.docx</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Shot
            src="/shots/before-live-strict.jpg"
            alt="docx-editor.dev/editor showing 'This file did not open. This file is not a .docx document.' for strict.docx"
            caption="Before: docx-editor.dev/editor on Nov 17. Error code open.missing-main-document."
          />
          <Shot
            src={shotFor("strict.docx")}
            alt="The same strict.docx open in the patched editor with header, picture, chart, SmartArt and equation"
            caption="After: their examples/vite app built locally from the patch branch (not docx-editor.dev), same file."
            tall
          />
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">What Strict is</h2>
          <p className="mt-3 text-ink-2">
            Word lists &ldquo;Strict Open XML Document (*.docx)&rdquo; as a Save As type. Admins can also make it the
            default through Word&apos;s{" "}
            <a className={linkClass} href="https://learn.microsoft.com/en-us/previous-versions/office/office-2013-resource-kit/dd723552(v=office.15)">
              Default file format policy
            </a>
            . The parts are the same as a normal .docx. Only the namespace and relationship-type names change, from{" "}
            <code className="font-mono text-sm">schemas.openxmlformats.org/…/2006/…</code> to{" "}
            <code className="font-mono text-sm">purl.oclc.org/ooxml/…</code>.
          </p>
          <p className="mt-3 text-ink-2">
            The reader looks for the Transitional <code className="font-mono text-sm">officeDocument</code>{" "}
            relationship, finds none, and returns <code className="font-mono text-sm">no-main-document</code>. The
            message then tells the user the file is another file type.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Why it matters here</h2>
          <p className="mt-3 text-ink-2">
            Users of other readers hit the same files: {" "}
            {OTHER_READERS.map((r, i) => (
              <span key={r.href}>
                <a className={linkClass} href={r.href}>
                  {r.name}
                </a>
                {i < OTHER_READERS.length - 1 ? ", " : "."}
              </span>
            ))}{" "}
            docx-editor already treats &ldquo;Word opens it and we don&apos;t&rdquo; as a bug (
            <a className={linkClass} href="https://github.com/eigenpal/docx-editor/issues/1107">
              #1107
            </a>
            ). No issue in the repo mentions Strict yet.
          </p>
          <p className="mt-3 text-ink-2">
            Credit where due: in a sweep of all {SWEEP.total.toLocaleString("en-US")} .docx files in LibreOffice&apos;s
            Word-export tests, the 2.38.0 reader opened and saved {SWEEP.openAndSave.toLocaleString("en-US")} with no
            text lost. Strict was the one failure class among files that Word itself wrote.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">All six Word-saved Strict files</h2>
        <p className="mt-2 text-ink-2">
          Files from{" "}
          <a className={linkClass} href={LO_DATA}>
            LibreOffice&apos;s ooxmlexport tests
          </a>{" "}
          (app.xml: Microsoft Office Word 15.0 or 16.0).
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-2">
              <tr>
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Contains</th>
                <th className="px-4 py-2 font-medium">2.38.0</th>
                <th className="px-4 py-2 font-medium">Patched</th>
              </tr>
            </thead>
            <tbody>
              {STRICT_FILES.map((f) => (
                <tr key={f.file} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">
                    <a className={linkClass} href={`${LO_DATA}${f.file}`}>
                      {f.file}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-ink-2">{f.content}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-err-soft px-2 py-0.5 font-mono text-xs text-err">no-main-document</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-ok-soft px-2 py-0.5 text-xs text-ok">opens, saves, reopens</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-ink-2">
          <li>
            XML diff of each saved file against an independent Strict-to-Transitional conversion (a separate Python
            table): no lost text, elements, parts or media. The one change is{" "}
            <code className="font-mono text-sm">w:conformance=&quot;strict&quot;</code> becoming{" "}
            <code className="font-mono text-sm">transitional</code>.
          </li>
          <li>The patched editor renders each file pixel-identical to that conversion (6 of 6 screenshots).</li>
          <li>python-docx 1.2.0 refuses all 6 originals and opens all 6 saved files.</li>
          <li>Not checked: opening the saved files in Microsoft Word (no Word on this machine).</li>
        </ul>
        <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3">
          {STRICT_FILES.map((f) => (
            <Shot key={f.file} src={shotFor(f.file)} alt={`${f.file} in the patched editor`} caption={`${f.file}: ${f.content}`} tall />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">The change</h2>
          <p className="mt-3 text-ink-2">
            In <code className="font-mono text-sm">store/package/ooxml-package.ts</code>: when the root relationships
            name the Strict <code className="font-mono text-sm">officeDocument</code> type, each part is decoded with its
            Strict names in namespace declarations, relationship types and <code className="font-mono text-sm">graphicData</code> URIs mapped to Transitional ones. Text and hyperlink targets stay as written. Most names follow{" "}
            <code className="font-mono text-sm">&lt;area&gt;/&lt;name&gt;</code> to{" "}
            <code className="font-mono text-sm">&lt;area&gt;/2006/&lt;name&gt;</code>; five exceptions are listed. The
            engine then sees one vocabulary. Universal measures such as <code className="font-mono text-sm">12pt</code>{" "}
            and <code className="font-mono text-sm">50%</code> were already parsed.
          </p>
          <p className="mt-3 text-ink-2">
            Six tests cover the read, the save, hyperlink targets, document text, Transitional files that use a Strict
            name, and a long text run (the mapping is linear). Each of 9 mutations of the patch fails at least one of
            them. The core suite passes.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Two choices for the maintainers</h2>
          <p className="mt-3 text-ink-2">The issue draft leaves two decisions to you:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-2">
            <li>Smallest change: name Strict in the error instead of &ldquo;not a .docx document&rdquo;.</li>
            <li>
              Read Strict (the branch), then pick the save format: Transitional, as the branch does, or Strict, by
              reversing the same map in the writer.
            </li>
          </ol>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">Run it yourself</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-sm text-ink-2">
          <li>git clone -b fix/strict-open-xml https://github.com/cherylaurelia/docx-editor</li>
          <li>bun install &amp;&amp; bun test packages/core/src/store/__tests__/ooxml-package.test.ts</li>
          <li>cd examples/vite &amp;&amp; bunx vite, then open strict.docx</li>
        </ol>
        <p className="mt-3 text-sm text-ink-2">
          Sweep, diff and render scripts:{" "}
          <a className={linkClass} href={PROBE}>
            probe/
          </a>
          . The branch is a ready patch, not an opened pull request.
        </p>
      </section>

      <footer className="mt-14 border-t border-line pt-5 text-sm text-ink-2">
        Unofficial demo by Cheryl Aurelia: not affiliated with EigenPal. Measured Nov 17, 2026 on docx-editor main
        764bd09e and @docx-editor.dev/core 2.38.0.{" "}
        <a className={linkClass} href={BRANCH}>
          Branch
        </a>
      </footer>
    </main>
  );
}
