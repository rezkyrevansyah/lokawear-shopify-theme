// Core shopper journeys: browse, pick a variant, add to bag, filter, search.
const { test, expect } = require('@playwright/test');
const { visit } = require('./helpers');

test('homepage shows the hero and new arrivals', async ({ page }) => {
  await visit(page, '/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.featured .card').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('variant picker updates availability, URL and adds the right variant to the bag', async ({ page }) => {
  await visit(page, '/products/tenun-chore-jacket');
  const size = (name) => page.locator('.picker__value', { hasText: new RegExp(`^\\s*${name}\\b`) });

  // Olive / M is sold out in the demo data.
  await page.locator('.picker__value', { hasText: 'Olive' }).click();
  await expect(size('M')).toHaveClass(/is-unavailable/);

  await page.locator('.picker__value', { hasText: 'Natural' }).click();
  await expect(size('M')).not.toHaveClass(/is-unavailable/);
  await size('M').click();
  await expect(page).toHaveURL(/variant=\d+/);
  await expect(page.locator('.picker__selected').nth(1)).toHaveText('M');

  await page.locator('.product-form__submit').click();
  const drawer = page.locator('#CartDrawer');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Natural / M');
  await expect(page.locator('[data-cart-count]').first()).toHaveText('1');
});

test('size guide opens from the metaobject size chart', async ({ page }) => {
  await visit(page, '/products/lurik-overshirt');
  await page.locator('.picker__guide').click();
  const chart = page.locator('dialog[id^="SizeChart"]');
  await expect(chart).toBeVisible();
  await expect(chart.locator('tbody tr')).toHaveCount(4);
});

test('collection filters and sorting update results without a reload', async ({ page }) => {
  await visit(page, '/collections/all');
  const count = page.locator('.toolbar__count');
  const before = await count.textContent();

  await page.locator('.toolbar__filter').click();
  await page.locator('.facet__label', { hasText: 'Out of stock' }).click();
  await expect(page).toHaveURL(/filter\.v\.availability=0/);
  await expect(count).not.toHaveText(before);
  await page.locator('.facets__footer [type="submit"]').click();
  await expect(page.locator('.pills .pill')).toHaveCount(1);

  await page.locator('.pills__clear').click();
  await expect(count).toHaveText(before);

  await page.locator('.toolbar__select').selectOption('price-ascending');
  await expect(page).toHaveURL(/sort_by=price-ascending/);
  const prices = await page.locator('.product-grid .price__current').allTextContents();
  const numbers = prices.map((p) => parseFloat(p.replace(/[^0-9.]/g, '')));
  expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
});

test('predictive search suggests products as you type', async ({ page }) => {
  await visit(page, '/');
  await page.locator('[data-dialog-open="SearchDrawer"]').click();
  await page.locator('#SearchDrawer-input').fill('lurik');
  const results = page.locator('#SearchDrawer .suggest__product');
  await expect(results.first()).toBeVisible();
  await expect(results.first()).toContainText(/lurik/i);
});
