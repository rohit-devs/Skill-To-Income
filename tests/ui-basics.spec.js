const { test, expect } = require('@playwright/test');

test('UI basics - login page', async ({ page }) => {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  await expect(page.locator('h1')).toHaveText(/welcome back/i);

  const emailField = page.locator('input[type="email"]');
  const passwordField = page.locator('input[type="password"]');

  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();

  const buttonColor = await page.locator('button[type="submit"]').evaluate((el) => {
    return window.getComputedStyle(el).backgroundColor;
  });

  expect(buttonColor).not.toBe('rgb(255, 255, 255)');
});
