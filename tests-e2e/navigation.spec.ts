import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test('should navigate from homepage to Rock Paper Scissors Lizard Spock game', async ({ page }) => {
    await expect(async () => {
    await page.goto('/');
    await page.locator('nav').getByRole('link', { name: /Rock Paper Scissors Lizard Spock/i }).click();
    await expect(page).toHaveURL(/.*\/rock-paper-scissors-lizard-spock/);
    await expect(page.getByRole('heading', { name: /Rock Paper Scissors Lizard Spock/i })).toBeVisible();
    }).toPass()
  });

  test('should navigate from homepage to Reaction Test game', async ({ page }) => {
    await expect(async () => {
    await page.goto('/');
    await page.locator('nav').getByRole('link', { name: /Reaction Test/i }).click();
    await expect(page).toHaveURL(/.*\/reaction-test/);
    await expect(page.getByRole('heading', { name: /Reaction Test/i })).toBeVisible();
    }).toPass()
  });
}); 