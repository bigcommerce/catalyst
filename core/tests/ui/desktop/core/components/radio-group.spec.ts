import { expect } from '@playwright/test';

import { test } from '~/tests/fixtures';

test('Changing selection on radio button options should update query parameters', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Bath' }).click();

  await expect(page).toHaveURL('bath/');

  await page.getByRole('link', { name: 'Quick add' }).first().click();

  await expect(page.getByRole('dialog', { name: 'Choose options' })).toBeVisible();

  await page.getByLabel('Radio').getByText('1').click();

  await expect(page).toHaveURL('bath/?showQuickAdd=77&134=139');

  await expect(page.getByRole('dialog', { name: 'Choose options' })).toBeVisible();

  await page.getByLabel('Radio').getByText('2').click();

  await expect(page).toHaveURL('bath/?showQuickAdd=77&134=140');

  await page.getByLabel('Radio').getByText('3').click();

  await expect(page).toHaveURL('bath/?showQuickAdd=77&134=141');
});
