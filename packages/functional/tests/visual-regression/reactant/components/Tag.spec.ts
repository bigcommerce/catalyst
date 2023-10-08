import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('Tag basic example', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/tag--basic-example');
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByText('Tag')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Tag no action example', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/tag--no-action-example');
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByText('Tag')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
