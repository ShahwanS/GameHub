import { test, expect } from '@playwright/test';

test.describe('Reaction Test Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reaction-test');
  });

  test('should load the game page with initial elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Reaction Test/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Game/i })).toBeVisible();
    await expect(page.getByText(/Test your reaction speed!/i)).toBeVisible();
    await expect(page.getByText(/Wait for the red box to turn green/i)).toBeVisible();
  });

  test('should change state after clicking Start Game button', async ({ page }) => {
    await expect(async () => {
    await page.getByRole('button', { name: /Start Game/i }).click()
    await page.waitForLoadState('domcontentloaded');
    const reactingButton = page.getByRole('button', { name: 'Wait for green...', exact: true });
    await expect(reactingButton).toBeVisible();
    }).toPass()
   
  });
  
  test('should show game over state after clicking during red state', async ({ page }) => {
    await expect(async () => {
    await page.getByRole('button', { name: /Start Game/i }).click();
    await page.waitForLoadState('domcontentloaded');
    const reactingButton = page.getByRole('button', { name: 'Wait for green...'});
    await expect(reactingButton).toBeVisible();
    await reactingButton.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /Game Over!/i })).toBeVisible();
    await expect(page.getByText(/Too early! Wait for green next time./i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Try Again/i })).toBeVisible();
    }).toPass()
  });
  
}); 