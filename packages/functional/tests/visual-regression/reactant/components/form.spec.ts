import { test, expect } from '@playwright/test';

const formUrl = 'https://catalyst-storybook.vercel.app/?path=/docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const inputField = 'input[name="Input Field"]';
const inputEmail = 'input[name="email"]';

test('Default form', async ({ page }) => {
    await page.goto(`${formUrl}/form--default`);
    await expect(page.frameLocator(storyBookFrame).locator(inputField)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Form with validation', async ({ page }) => {
    await page.goto(`${formUrl}/form--with-validation`);
    await page.frameLocator(storyBookFrame).locator(inputEmail).fill('asdf');
    await page.frameLocator(storyBookFrame).getByRole('button', { name: 'Submit Form' }).click();

    await expect(page).toHaveScreenshot();
});

