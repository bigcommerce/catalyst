import { test, expect } from '@playwright/test';

const checkboxUrl = 'https://catalyst-storybook.vercel.app/?path=/docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Base checkbox', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--base-checkbox`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Focused checkbox', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--focused-checkbox`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Checked checkbox', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--checked-checkbox`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Disabled checkbox', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--disabled-checkbox`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Disabled checked checkbox', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--disabled-checked-checkbox`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Checkbox with label', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--checkbox-with-label`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Checkbox with custom icon', async ({ page }) => {
    await page.goto(`${checkboxUrl}/checkbox--checkbox-with-custom-icon`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await page.frameLocator(storyBookFrame).locator('#CheckboxWithCustomIcon').click();
    await expect(page).toHaveScreenshot();
});
