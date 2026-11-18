// Measured 2026-11-17. Before: published @docx-editor.dev/core 2.38.0 and the live demo.
// After: eigenpal/docx-editor main 764bd09e plus the fix/strict-open-xml branch.
// Sources: probe/strict-roundtrip.ts, probe/compare2.py (strict-compare.json),
// probe/strict-render.mjs, probe/python-docx-check.py.

export interface StrictFile {
  readonly file: string;
  readonly content: string;
}

export const STRICT_FILES: readonly StrictFile[] = [
  { file: "strict.docx", content: "header, picture, chart, SmartArt, equation" },
  { file: "strict-smartart.docx", content: "SmartArt diagram" },
  { file: "tdf116410.docx", content: "page border, margins in cm and pt, tab stop" },
  { file: "tdf150822.docx", content: "three short paragraphs" },
  { file: "tdf79272_strictDxa.docx", content: "tables with widths in points (215.55pt)" },
  { file: "tdf82065_Ind_start_strict.docx", content: "right-to-left numbered paragraph with indent" },
];

/** Image path for a file's patched-editor screenshot. */
export function shotFor(file: string): string {
  return `/shots/after-${file.replace(/\.docx$/, "")}.jpg`;
}

export const LO_DATA =
  "https://github.com/LibreOffice/core/blob/master/sw/qa/extras/ooxmlexport/data/";

export const SWEEP = {
  total: 1376,
  openAndSave: 1353,
  strictRefused: 6,
} as const;
