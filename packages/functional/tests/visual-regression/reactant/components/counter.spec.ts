import { test, expect } from '@playwright/test';

const counterUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Counter default', async ({ page }) => {
    await page.goto(`${counterUrl}/counter--default`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(storyBook).getByLabel('Increase count').click();
    await expect(page).toHaveScreenshot();
});

test('Counter disabled', async ({ page }) => {
    await page.goto(`${counterUrl}/counter--disabled`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});
