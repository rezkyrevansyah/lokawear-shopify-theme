// Opens a storefront path, passing the storefront password page when the store has one.
async function visit(page, path) {
  await page.goto(path);
  if (new URL(page.url()).pathname === '/password') {
    const password = process.env.STORE_PASSWORD;
    if (!password) throw new Error('Store is password protected: set STORE_PASSWORD');
    await page.locator('input[type="password"]').fill(password);
    await page.locator('input[type="password"]').press('Enter');
    await page.waitForURL((url) => url.pathname !== '/password');
    await page.goto(path);
  }
}

module.exports = { visit };
