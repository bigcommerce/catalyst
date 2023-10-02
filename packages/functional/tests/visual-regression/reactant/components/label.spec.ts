import { test, expect } from '@playwright/test';

const labelUrl = 'https://catalyst-storybook.vercel.app/?path=/docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Label example', async ({ page }) => {
    await page.goto(`${labelUrl}/label--example`);
    await expect(page.frameLocator(storyBookFrame).getByText('Label')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Label with input', async ({ page }) => {
    await page.goto(`${labelUrl}/label--with-input`);
    await expect(page.frameLocator(storyBookFrame).getByLabel('Label')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

