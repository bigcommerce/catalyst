import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test(
  'Successfully subscribes a user to the newsletter',
  { tag: [TAGS.writesData] },
  async ({ page, subscribe }) => {
    const t = await getTranslations('Components.Subscribe');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const email = faker.internet.email();

    const emailInput = page.getByPlaceholder(t('placeholder'));

    await emailInput.fill(email);

    const submitButton = page.locator('input[type="email"]').locator('..').getByRole('button');

    await submitButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(t('subscribedToNewsletter'))).toBeVisible();

    // Track that we attempted to subscribe this email
    subscribe.trackSubscription(email);
  },
);

test('Shows success message when user tries to subscribe again with the same email', async ({
  page,
  subscribe,
}) => {
  const t = await getTranslations('Components.Subscribe');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const email = faker.internet.email();

  const emailInput = page.getByPlaceholder(t('placeholder'));

  const submitButton = page.locator('input[type="email"]').locator('..').getByRole('button');

  // Subscribe with the email
  await emailInput.fill(email);
  await submitButton.click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(t('subscribedToNewsletter'))).toBeVisible();

  // Try to subscribe again with the same email
  await emailInput.fill(email);
  await submitButton.click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(t('subscribedToNewsletter'))).toBeVisible();

  // Track that we attempted to subscribe this email
  subscribe.trackSubscription(email);
});
