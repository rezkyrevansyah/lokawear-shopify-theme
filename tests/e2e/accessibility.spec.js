// Automated WCAG 2.1 AA checks with axe on the main templates.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { visit } = require('./helpers');

const pages = {
  home: '/',
  product: '/products/lurik-overshirt',
  collection: '/collections/all',
  'our craft': '/pages/our-craft',
  lookbook: '/pages/lookbook',
  journal: '/blogs/journal',
  faq: '/pages/faq',
  contact: '/pages/contact',
};

// Reduced motion disables the fade-in, so axe measures contrast at full opacity.
test.use({ reducedMotion: 'reduce' });

for (const [name, path] of Object.entries(pages)) {
  test(`${name} has no serious accessibility violations`, async ({ page }) => {
    await visit(page, path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Shopify-injected iframes and the theme preview bar are outside the theme.
      .exclude('#preview-bar-iframe')
      .exclude('iframe')
      .analyze();

    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    const summary = serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(summary).toEqual([]);
  });
}
