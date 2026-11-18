import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';
const SAVES_FILE = path.join(process.cwd(), 'data', 'saves.json');

async function main() {
  const backup = fs.existsSync(SAVES_FILE) ? fs.readFileSync(SAVES_FILE, 'utf-8') : null;
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const server500s: string[] = [];
  const urls404: string[] = [];

  const shellBin = '/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(shellBin) ? shellBin : undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.toLowerCase().includes('websocket')) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 500) {
        server500s.push(`${res.status()} ${res.url()}`);
      } else if (res.status() === 404) {
        urls404.push(`${res.status()} ${res.url()}`);
      }
    });

    console.log('1. Loading HomeScreen (Desktop 1440x900)...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Nova Vida/i }).waitFor({ state: 'visible' });
    const homeSvgs = await page.locator('svg').count();
    assert.ok(homeSvgs >= 4, `Expected >=4 SVG elements on HomeScreen, got ${homeSvgs}`);

    console.log('2. Creating new character (Playwright V13)...');
    await page.getByRole('button', { name: /Nova Vida/i }).click();
    const createDialog = page.getByRole('dialog');
    await createDialog.waitFor({ state: 'visible' });
    const inputs = createDialog.locator('input[type="text"]');
    await inputs.nth(0).fill('Clara');
    await inputs.nth(1).fill('Mendes');
    // Select year 2000 & Afluente so liquidity is healthy
    const selects = createDialog.locator('select');
    await selects.nth(3).selectOption('rico');
    await selects.nth(4).selectOption('2000');
    await createDialog.getByRole('button', { name: /Iniciar Vida/i }).click();

    await page.getByRole('heading', { name: /Clara Mendes/i }).first().waitFor({ state: 'visible', timeout: 10000 });
    console.log('   Character created and ProfileTab rendered.');

    const dismissEventModals = async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible({ timeout: 400 }).catch(() => false)) {
          const btns = modal.locator('button');
          if ((await btns.count()) > 0) {
            await btns.last().click();
          }
          await page.waitForTimeout(250);
        } else {
          break;
        }
      }
    };

    await dismissEventModals();

    // Verify mental health & trigger event from Profile
    await page.getByRole('button', { name: /Meditação/i }).click();
    await page.getByRole('button', { name: /Sortear Evento de Vida/i }).click();
    await page.waitForTimeout(400);
    await dismissEventModals();

    console.log('3. Advancing 25 years via bottom time bar...');
    const unitSelect = page.getByLabel('Intervalo de avanço temporal');

    for (const [unit, label] of [
      ['10years', '+10 Anos'],
      ['10years', '+10 Anos'],
      ['5years', '+5 Anos'],
    ] as const) {
      await unitSelect.selectOption(unit);
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('button', { name: /Avançando\.\.\./i }).waitFor({ state: 'hidden', timeout: 16000 }).catch(() => {});
      await page.waitForTimeout(250);
      await dismissEventModals();
    }

    console.log('4. Navigating and verifying all key v13 tabs...');
    // Family tab
    await page.getByRole('button', { name: 'Família', exact: true }).click();
    const elogiarBtn = page.getByRole('button', { name: /Elogiar/i }).first();
    if (await elogiarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await elogiarBtn.click();
      await page.waitForTimeout(250);
    }

    // Career tab
    await page.getByRole('button', { name: 'Carreira', exact: true }).click();
    await page.getByText(/Carreira|Emprego Atual/i).first().waitFor({ state: 'visible' });

    // Finances tab: savings deposit
    await page.getByRole('button', { name: 'Finanças', exact: true }).click();
    const depositBtn = page.getByRole('button', { name: /Depositar/i }).first();
    if (await depositBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await depositBtn.click();
      await page.waitForTimeout(250);
    }

    // Politics tab
    await page.getByRole('button', { name: 'Política', exact: true }).click();
    await page.getByRole('button', { name: /Votar/i }).first().click();
    await page.waitForTimeout(250);

    // Justice tab
    await page.getByRole('button', { name: 'Justiça', exact: true }).click();
    await page.getByText(/Constituição|Ordenamento/i).first().waitFor({ state: 'visible' });

    // World tab -> Civilização & Ecologia
    await page.getByRole('button', { name: 'Mundo', exact: true }).click();
    const civBtn = page.getByRole('button', { name: /Civilização/i }).first();
    if (await civBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await civBtn.click();
      await page.waitForTimeout(200);
    }

    // Catalog tab (Eventos)
    await page.getByRole('button', { name: 'Eventos', exact: true }).click();
    await page.getByText(/Enciclopédia & Catálogo de Eventos/i).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByLabel('Buscar evento no catálogo').fill('Brasil');
    await page.waitForTimeout(400);

    // Check Desktop horizontal overflow
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    assert.ok(desktopOverflow <= 2, `Desktop horizontal overflow detected: ${desktopOverflow}px`);

    console.log('5. Verifying Mobile viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const mobileMetrics = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        footerHeightPct: footer ? (footer.getBoundingClientRect().height / window.innerHeight) * 100 : 0,
      };
    });
    assert.ok(mobileMetrics.overflow <= 2, `Mobile horizontal overflow detected: ${mobileMetrics.overflow}px`);
    assert.ok(mobileMetrics.footerHeightPct <= 15, `Mobile footer too tall: ${mobileMetrics.footerHeightPct.toFixed(1)}%`);

    assert.strictEqual(pageErrors.length, 0, `Page errors: ${pageErrors.join(' | ')}`);
    assert.strictEqual(server500s.length, 0, `HTTP 5xx errors: ${server500s.join(' | ')}`);
    if (urls404.length > 0) console.log('Observed 404 URLs:', urls404);
    assert.strictEqual(consoleErrors.length, 0, `Console errors: ${consoleErrors.join(' | ')} (404s: ${urls404.join(', ')})`);

    console.log('PLAYWRIGHT_E2E_PASSED: All screens, tabs, interactions, Desktop & Mobile overflow checks passed with 0 errors!');
  } finally {
    await browser.close();
    if (backup !== null) {
      fs.writeFileSync(SAVES_FILE, backup, 'utf-8');
    }
  }
}

main().catch((err) => {
  console.error('PLAYWRIGHT_E2E_FAILED:', err);
  process.exit(1);
});
