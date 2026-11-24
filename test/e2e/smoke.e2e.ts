import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

const SITE = join(import.meta.dirname, '../../dist-site');

/** Every published page as a URL path, e.g. /docs/form.html -> /docs/form. */
function publishedPages(dir = SITE): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'assets' ? [] : publishedPages(full);
    if (!entry.name.endsWith('.html')) return [];
    const path = `/${relative(SITE, full).split(sep).join('/')}`
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '');
    return [path];
  });
}

const pages = publishedPages().sort();

/** Collect everything a visitor would experience as "broken" while a page loads. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console.error: ${message.text()}`);
  });
  page.on('requestfailed', (request) =>
    problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`),
  );
  page.on('response', (response) => {
    if (response.status() >= 400 && response.request().resourceType() !== 'document') {
      problems.push(`${response.status()}: ${response.url()}`);
    }
  });
  return problems;
}

test.describe('every published page', () => {
  for (const path of pages) {
    test(`${path} loads without errors`, async ({ page }) => {
      const problems = watch(page);
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      // Opening /404 directly is a normal 200 (only unknown URLs get a 404 status)
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(300);
      expect(problems, problems.join('\n')).toEqual([]);
    });

    for (const { label, font } of [
      { label: '', font: '' },
      { label: ' with a wide font', font: 'Menlo, Courier New, monospace' },
    ]) {
      test(`${path} fits a 375px screen${label}`, async ({ page }) => {
        if (font) {
          // A wide stand-in font: Linux CI renders text wider than a Mac, so a layout
          // that only just fits locally can overflow there.
          await page.addInitScript((family) => {
            document.addEventListener('DOMContentLoaded', () => {
              const style = document.createElement('style');
              style.textContent = `* { font-family: ${family} !important; }`;
              document.head.appendChild(style);
            });
          }, font);
        }
        await page.setViewportSize({ width: 375, height: 800 });
        await page.goto(path, { waitUntil: 'networkidle' });
        const { scrollWidth, innerWidth, offenders } = await page.evaluate(() => {
          const width = window.innerWidth;
          const clipped = (el: Element) => {
            for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
              if (getComputedStyle(a).overflowX !== 'visible') return true;
            }
            return false;
          };
          const wide = [...document.querySelectorAll('body *')].filter((el) => {
            const style = getComputedStyle(el);
            if (style.position === 'fixed' || style.display === 'none') return false;
            const box = el.getBoundingClientRect();
            return box.width > 0 && box.right > width + 0.5 && !clipped(el);
          });
          // Outermost offenders only, described so a failure points at the element
          const offenders = wide
            .filter((el) => !wide.includes(el.parentElement as Element))
            .slice(0, 5)
            .map((el) => {
              const cls = String((el as HTMLElement).className)
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .join('.');
              return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls ? `.${cls}` : ''} right=${Math.round(el.getBoundingClientRect().right)}`;
            });
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: width,
            offenders,
          };
        });
        expect(
          scrollWidth,
          `scrollWidth ${scrollWidth} > viewport ${innerWidth}; wide elements: ${offenders.join(' | ')}`,
        ).toBeLessThanOrEqual(innerWidth);
      });
    }
  }
});

test.describe('behaviour', () => {
  test('unknown URLs get the branded 404 with a 404 status', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Report a broken link' })).toBeVisible();
  });

  test('window.amp is available on the demo pages', async ({ page }) => {
    await page.goto('/examples/modal');
    expect(await page.evaluate(() => typeof (window as { amp?: unknown }).amp)).toBe('object');
  });

  test('the mobile menu opens and a dropdown expands on tap', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/docs/foundation');
    const nav = page.locator('nav.aiab-site-nav');
    await nav.locator('.aiab-nav-toggle').click();
    await expect(nav).toHaveClass(/aiab-menu-open/);
    const item = nav.locator('#main-nav > li', { has: page.locator(':scope > ul') }).first();
    await item.locator(':scope > a').click();
    await expect(item).toHaveClass(/aiab-is-expanded/);
  });

  test('dropdown menus are visible on hover and not clipped', async ({ page }) => {
    await page.goto('/examples/navigation-showcase');
    const trigger = page.locator('#dropdownDemoNav > ul > li:has(> ul) > a').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.hover();
    const menu = trigger.locator('xpath=following-sibling::ul[1]');
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((el) => getComputedStyle(el).listStyleType)).toBe('none');
  });

  test('the sidebar demo collapses and expands', async ({ page }) => {
    await page.goto('/examples/sidebar-demo');
    await page.evaluate(() => (window as unknown as { collapseSidebar(): void }).collapseSidebar());
    await expect(page.locator('#main-sidebar')).toHaveClass(/aiab-sidebar--collapsed/);
    await page.evaluate(() => (window as unknown as { expandSidebar(): void }).expandSidebar());
    await expect(page.locator('#main-sidebar')).not.toHaveClass(/aiab-sidebar--collapsed/);
  });
});
