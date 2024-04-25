import { expect, test } from '@playwright/test';

test('Selecting various options on color panel should update query parameters', async ({
  page,
}) => {
  await page.goto('/');

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Shop All' })
    .click();

  await expect(page).toHaveURL('shop-all/');

  await page.getByRole('link', { name: 'Quick add' }).first().click();

  await expect(page.getByRole('dialog', { name: 'Choose options' })).toBeVisible();

  await page.getByRole('radio', { name: 'Color Silver' }).click();

  await expect(page).toHaveURL('shop-all/?showQuickAdd=77&109=103');

  await expect(page.getByRole('dialog', { name: 'Choose options' })).toBeVisible();

  await page.getByRole('radio', { name: 'Color Purple' }).click();

  await expect(page).toHaveURL('shop-all/?showQuickAdd=77&109=105');

  await page.getByRole('radio', { name: 'Color Orange' }).click();

  await expect(page).toHaveURL('shop-all/?showQuickAdd=77&109=109');
});
