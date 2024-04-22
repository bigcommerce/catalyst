import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Footer', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-skip-toolbar': '1' });
  await page.goto(`${storyBookElements.storyUrl}/footer--example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
