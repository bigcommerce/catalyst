import { test, expect } from '@playwright/test';

const inputUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Default input', async ({ page }) => {
    await page.goto(`${inputUrl}/input--default`);
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Disabled input', async ({ page }) => {
    await page.goto(`${inputUrl}/input--disabled`);
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Success input', async ({ page }) => {
    await page.goto(`${inputUrl}/input--success`);
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Error input', async ({ page }) => {
    await page.goto(`${inputUrl}/input--error`);
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Custom icon input', async ({ page }) => {
    await page.goto(`${inputUrl}/input--custom-icon`);
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

