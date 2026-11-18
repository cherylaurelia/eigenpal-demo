# Word's Strict .docx in docx-editor (unofficial demo)

Word can save a `.docx` as "Strict Open XML Document" (ISO/IEC 29500 Strict). [docx-editor](https://github.com/eigenpal/docx-editor) 2.38.0 refuses every such file. The demo editor says "This file is not a .docx document" (`open.missing-main-document`).

A reader patch on [`cherylaurelia/docx-editor@fix/strict-open-xml`](https://github.com/cherylaurelia/docx-editor/tree/fix/strict-open-xml) opens all six Word-saved Strict files in LibreOffice's Word-export tests. This page shows the before and after.

## Evidence

- Live refusal at https://www.docx-editor.dev/editor on 2026-11-17 (screenshot in `public/shots/before-live-strict.jpg`).
- The six files: [strict.docx](https://github.com/LibreOffice/core/blob/master/sw/qa/extras/ooxmlexport/data/strict.docx), strict-smartart, tdf116410, tdf150822, tdf79272_strictDxa, tdf82065_Ind_start_strict (same folder; `docProps/app.xml` says Microsoft Office Word 15.0 or 16.0).
- The same file type was reported against other readers: [pandoc #7691](https://github.com/jgm/pandoc/issues/7691), [python-docx #1520](https://github.com/python-openxml/python-docx/issues/1520), [langgenius/graphon #346](https://github.com/langgenius/graphon/issues/346).
- Word's "Default file format" policy can make Strict the default: [Office resource kit](https://learn.microsoft.com/en-us/previous-versions/office/office-2013-resource-kit/dd723552(v=office.15)).

## What was measured

| Check | Result |
| --- | --- |
| `readOoxmlPackage`, 2.38.0 | 6/6 `no-main-document` |
| Patched read, save, reopen | 6/6 |
| XML diff vs an independent Strict-to-Transitional conversion (`probe/strict-normalize.py`, `probe/compare2.py`) | no lost text, elements, parts or media; only `w:conformance` changes to `transitional` |
| Patched editor render vs that conversion (`probe/strict-render.mjs`) | 6/6 pixel-identical |
| python-docx 1.2.0 (`probe/python-docx-check.py`) | refuses 6/6 originals, opens 6/6 saved files |
| docx-editor core test suite on the branch | 24,487 pass, 0 fail |

Not checked: opening the saved files in Microsoft Word.

## Run the page

```bash
npm install
npm run build && npm run start   # http://localhost:3000
npm test                         # checks the result table and screenshots
```

## Run the probe

`probe/strict-roundtrip.ts` imports the reader from a docx-editor checkout at `../../fix` (edit the path for yours) and runs with `bun probe/strict-roundtrip.ts <in-dir> <out-dir>`.

---

Unofficial demo by Cheryl Aurelia: not affiliated with EigenPal.
