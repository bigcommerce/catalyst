import { expect, test } from '@playwright/test';

import * as storyBookElements from '../storybook-elements';

test('Breadcrumbs', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/breadcrumbs--example`);
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
