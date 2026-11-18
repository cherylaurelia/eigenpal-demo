// Open each file in their Vite demo (patched source) through the file input; screenshot page 1.
import { chromium } from 'playwright';

const [base, outDir, ...files] = process.argv.slice(2);
const browser = await chromium.launch();

for (const f of files) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(base);
  await page.waitForTimeout(3000);
  await page.locator('input[type=file][accept*=".docx"]').first().setInputFiles(f);
  await page.waitForTimeout(6000);
  const failed = await page.getByText('This file did not open').count();
  const name = f.split('/').slice(-2).join('_').replace('.docx', '');
  await page.screenshot({ path: `${outDir}/${name}.png` });
  const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 200);
  console.log(JSON.stringify({ f, failed, errors, text }));
  await page.close();
}

await browser.close();
