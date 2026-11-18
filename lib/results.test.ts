import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { STRICT_FILES, SWEEP, shotFor } from "./results.ts";

test("every Strict file has a screenshot on disk", () => {
  for (const { file } of STRICT_FILES) {
    assert.ok(existsSync(new URL(`../public${shotFor(file)}`, import.meta.url)), file);
  }
});

test("the table lists each refused Strict file once", () => {
  assert.equal(new Set(STRICT_FILES.map((f) => f.file)).size, SWEEP.strictRefused);
});

test("shotFor keeps names that contain dots before the extension", () => {
  assert.equal(shotFor("a.b.docx"), "/shots/after-a.b.jpg");
});
