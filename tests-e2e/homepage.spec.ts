import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/TanStack Start | Type-Safe, Client-First, Full-Stack React Framework/i); // Case-insensitive match
  });

  test('should display a welcome message or main heading', async ({ page }) => {
    const mainHeading = page.getByRole('heading', { name: /Mini Game Collection/i, level: 1 });
    await expect(mainHeading).toBeVisible();
  });

  test('should have navigation links to games in the main content', async ({ page }) => {
    // Target links specifically within the main content area
    const rpslsLink = page.locator('main').getByRole('link', { name: /Rock Paper Scissors Lizard Spock/i });
    await expect(rpslsLink).toBeVisible();

    const reactionTestLink = page.locator('main').getByRole('link', { name: /Reaction Test/i });
    await expect(reactionTestLink).toBeVisible();
  });
}); 