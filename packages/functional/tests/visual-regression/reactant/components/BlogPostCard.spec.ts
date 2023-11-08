import { expect, test } from '@playwright/test';

import * as storyBookElements from '../StoryBookElements';

test('blog post card', async ({ page }) => {
  await page.goto(`${storyBookElements.storyUrl}/blogpostcard--blog-post-card-with-image`);
  await expect(
    page
      .frameLocator(storyBookElements.storyBookFrame)
      .getByRole('link', { name: 'Blog Post Title' }),
  ).toBeVisible();
  await expect(
    page.frameLocator(storyBookElements.storyBookFrame).locator(storyBookElements.storyBook),
  ).toHaveScreenshot();
});
