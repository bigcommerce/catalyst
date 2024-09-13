import { expect, test } from '~/tests/fixtures';

import routes from '~/tests/routes';

test('Changing selection on radio button options should update query parameters', async ({
  page,
}) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '[Sample] Fog Linen Chambray Towel - Beige Stripe',
    }),
  ).toBeVisible();

  await page.getByLabel('Radio').getByText('1').click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?134=139');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '[Sample] Fog Linen Chambray Towel - Beige Stripe',
    }),
  ).toBeVisible();

  await page.getByLabel('Radio').getByText('2').click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?134=140');

  await page.getByLabel('Radio').getByText('3').click();

  await expect(page).toHaveURL('fog-linen-chambray-towel-beige-stripe/?134=141');
});
