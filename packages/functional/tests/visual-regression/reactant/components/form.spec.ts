import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

const inputField = 'input[name="Input Field"]';
const inputEmail = 'input[name="email"]';

test('Default form', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/form--default`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(inputField),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});

test('Form with validation', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/form--with-validation`);
  await page.frameLocator(storyBookElements.storyBookFrame).locator(inputEmail).fill('asdf');
  await page
    .frameLocator(storyBookElements.storyBookFrame)
    .getByRole('button', { name: 'Submit Form' })
    .click();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
