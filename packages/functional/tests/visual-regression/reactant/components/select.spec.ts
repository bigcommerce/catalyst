import { test, expect } from '@playwright/test';

const selectUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Default select', async ({ page }) => {
    await page.goto(`${selectUrl}/select--default`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Select with disabled items', async ({ page }) => {
    await page.goto(`${selectUrl}/select--disabled-items`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator(storyBook).getByRole('combobox').click();
    await expect(page).toHaveScreenshot();
});



