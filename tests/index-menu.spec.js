const { test, expect } = require("@playwright/test");

test("menu does not auto-open and overlay stays hidden after launch", async ({ page }) => {
  await page.goto("/");

  const body = page.locator("body");
  await expect(body).not.toHaveClass(/menu-open/);

  await page.waitForTimeout(1500);
  await expect(body).not.toHaveClass(/menu-open/);

  const backdropOpacity = await page.$eval("#menuBackdrop", (el) => getComputedStyle(el).opacity);
  expect(backdropOpacity).toBe("0");
});

test("menu opens, closes, and navigates from panel link", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");

  await page.click("#menuButton");
  await expect(body).toHaveClass(/menu-open/);
  await expect(page.locator("#menuPanel")).toBeVisible();
  await expect(page.locator("#menuBackdrop")).toBeVisible();

  await page.click("#menuBackdrop");
  await expect(body).not.toHaveClass(/menu-open/);

  await page.click("#menuButton");
  await Promise.all([
    page.waitForURL(/\/clifford\.html$/),
    page.click('#menuPanel a[href="clifford.html"]'),
  ]);
});

test("lighting archive link opens the captured Squarespace site", async ({ page }) => {
  await page.goto("/");

  await page.click("#menuButton");
  await Promise.all([
    page.waitForURL(/\/lighting\/$/),
    page.click('#menuPanel a[href="lighting/"]'),
  ]);

  await expect(page).toHaveTitle(/BERTIEPLEASS/);
  await expect(page.locator('a[href="/lighting/angle-poise/"]')).toBeVisible();
});
