import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test('Updating account information works as expected', async ({ page, customer }) => {
  const t = await getTranslations('Account.Settings');
  const testCustomer = await customer.createNewCustomer();

  await customer.loginAs(testCustomer);

  const updatedFirstName = `${testCustomer.firstName}-modified`;
  const updatedLastName = `${testCustomer.lastName}-modified`;

  await page.goto('/account/settings');
  await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();

  // TODO: Account settings form fields need to be translated
  await expect(page.getByLabel('First Name')).toHaveValue(testCustomer.firstName);
  await expect(page.getByLabel('Last Name')).toHaveValue(testCustomer.lastName);
  await expect(page.getByLabel('Email').first()).toHaveValue(testCustomer.email);

  await page.getByLabel('First Name').fill(updatedFirstName);
  await page.getByLabel('Last Name').fill(updatedLastName);
  await page
    .getByRole('button', { name: t('cta') })
    .first()
    .click();

  await expect(page.getByText(t('settingsUpdated'))).toBeVisible();

  // Ensure that the customer data is updated on the back-end
  const updatedData = await customer.getById(testCustomer.id);

  expect(updatedData.firstName).toBe(updatedFirstName);
  expect(updatedData.lastName).toBe(updatedLastName);
  expect(updatedData.email).toBe(testCustomer.email);
});

test('Changing password works as expected', async ({ page, customer }) => {
  const t = await getTranslations('Account.Settings');
  const testCustomer = await customer.createNewCustomer();

  if (!testCustomer.password) {
    throw new Error('Error when creating test customer. Password is undefined.');
  }

  await customer.loginAs(testCustomer);

  const newPassword = faker.internet.password({
    pattern: /[a-zA-Z0-9]/,
    prefix: '1At!',
    length: 10,
  });

  await page.goto('/account/settings');
  await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();

  await page.getByLabel(t('currentPassword')).fill(testCustomer.password);
  await page.getByLabel(t('newPassword')).fill(newPassword);
  await page.getByLabel(t('confirmPassword')).fill(newPassword);
  await page
    .getByRole('button', { name: t('cta') })
    .nth(1) // The second button is the update password button
    .click();

  await page.waitForLoadState('networkidle');

  await expect(page.getByText(t('passwordUpdated'))).toBeVisible();

  // Now that the password is updated, attempt logging in with the new password
  await page.goto('/logout');

  testCustomer.password = newPassword;

  await customer.loginAs(testCustomer);

  await expect(page).toHaveURL('/account/orders/');
});

test(
  'Subscribing to newsletter works as expected',
  { tag: [TAGS.writesData] },
  async ({ page, customer, subscribe }) => {
    const t = await getTranslations('Account.Settings');
    const tNewsletter = await getTranslations('Account.Settings.NewsletterSubscription');
    const testCustomer = await customer.createNewCustomer();

    // Ensure customer is unsubscribed initially
    await subscribe.unsubscribe(testCustomer.email);

    await customer.loginAs(testCustomer);

    await page.goto('/account/settings');
    await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();

    // Find the newsletter subscription switch
    const newsletterSwitch = page.getByLabel(t('NewsletterSubscription.label'));

    await expect(newsletterSwitch).toBeVisible();

    // Verify switch is unchecked (customer is not subscribed)
    const switchElement = page.getByRole('switch', { name: t('NewsletterSubscription.label') });

    await expect(switchElement).not.toBeChecked();

    // Click the switch to subscribe
    await switchElement.click();

    // Click the submit button (should be the last button on the page)
    await page
      .getByRole('button', { name: t('cta') })
      .last()
      .click();

    await page.waitForLoadState('networkidle');

    // Verify success message appears
    await expect(page.getByText(tNewsletter('marketingPreferencesUpdated'))).toBeVisible();

    // Track subscription for cleanup
    subscribe.trackSubscription(testCustomer.email);
  },
);

test(
  'Unsubscribing from newsletter works as expected',
  { tag: [TAGS.writesData] },
  async ({ page, customer, subscribe }) => {
    const t = await getTranslations('Account.Settings');
    const tNewsletter = await getTranslations('Account.Settings.NewsletterSubscription');
    const testCustomer = await customer.createNewCustomer();

    // Ensure customer is subscribed initially
    await subscribe.subscribe(testCustomer.email, testCustomer.firstName, testCustomer.lastName);

    await customer.loginAs(testCustomer);

    await page.goto('/account/settings');
    await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();

    // Find the newsletter subscription switch
    const newsletterSwitch = page.getByLabel(t('NewsletterSubscription.label'));

    await expect(newsletterSwitch).toBeVisible();

    // Verify switch is checked (customer is subscribed)
    const switchElement = page.getByRole('switch', { name: t('NewsletterSubscription.label') });

    await expect(switchElement).toBeChecked();

    // Click the switch to unsubscribe
    await switchElement.click();

    // Click the submit button (should be the last button on the page)
    await page
      .getByRole('button', { name: t('cta') })
      .last()
      .click();

    await page.waitForLoadState('networkidle');

    // Verify success message appears
    await expect(page.getByText(tNewsletter('marketingPreferencesUpdated'))).toBeVisible();

    // Track subscription for cleanup
    subscribe.trackSubscription(testCustomer.email);
  },
);
