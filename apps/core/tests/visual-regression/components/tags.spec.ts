import { test } from '@playwright/test';

import routes from '~/tests/routes';

test.skip('Tags', async ({ page }) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);
});
