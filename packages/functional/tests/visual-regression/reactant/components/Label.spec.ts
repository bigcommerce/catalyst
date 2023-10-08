import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('Label example', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/label--example');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByText('Label')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Label with input', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/label--with-input');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Label')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
