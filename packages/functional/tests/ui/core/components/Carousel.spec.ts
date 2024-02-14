import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Best Selling Products' }) })
    .getByRole('tablist', { name: 'Slides' })
    .scrollIntoViewIfNeeded();

  await page.getByRole('link', { name: '[Sample] Able Brewing System' }).scrollIntoViewIfNeeded();

  await expect(page.getByRole('link', { name: '[Sample] Able Brewing System' })).toBeVisible();
});

test('Navigate to next set of products', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Best Selling Products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(page.getByRole('link', { name: '[Sample] Orbit Terrarium - Large' })).toBeVisible();
});

test('Navigate to previous set of products', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Best Selling Products' }) })
    .getByRole('button', { name: 'Previous products' })
    .click();

  await expect(page.getByRole('link', { name: '[Sample] Orbit Terrarium - Large' })).toBeVisible();
});

test('Navigation on set of products is cyclic', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Best Selling Products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Best Selling Products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(page.getByRole('link', { name: '[Sample] Able Brewing System' })).toBeVisible();
});
