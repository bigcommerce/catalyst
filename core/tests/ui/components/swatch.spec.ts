import { expect, test } from '~/tests/fixtures';

import routes from '~/tests/routes';

test('Selecting various options on color panel should update query parameters', async ({
  page,
}) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '[Sample] Fog Linen Chambray Towel - Beige Stripe',
    }),
  ).toBeVisible();

  await page.getByRole('radio', { name: 'Silver' }).click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?109=103');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '[Sample] Fog Linen Chambray Towel - Beige Stripe',
    }),
  ).toBeVisible();

  await page.getByRole('radio', { name: 'Purple' }).click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?109=105');

  await page.getByRole('radio', { name: 'Orange' }).click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?109=109');
});
