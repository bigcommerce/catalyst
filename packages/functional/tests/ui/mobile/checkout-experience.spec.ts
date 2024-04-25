import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const testUser = faker.person.firstName();

test.use({ viewport: { width: 390, height: 844 } });

test('Checkout experience on ios mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Toggle navigation').click();
  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();
  await page.getByRole('link', { name: '[Sample] Able Brewing System' }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();

  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();

  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await page.getByLabel('Email').fill(faker.internet.email());

  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('First Name').fill(testUser);
  await page.getByLabel('Last Name').fill(faker.person.lastName());
  await page.getByLabel('Company Name (Optional)').fill('BigCommerce');
  await page.getByLabel('Phone Number (Optional)').fill(faker.phone.number());
  await page.getByLabel('Address', { exact: true }).fill(faker.location.buildingNumber());
  await page.getByLabel('City').fill(faker.location.city());
  await page.getByRole('combobox', { name: 'State/Province' }).selectOption('Massachusetts');
  await page.getByRole('textbox', { name: 'Postal Code' }).fill('01762');
  await expect(page.getByRole('button', { name: 'Continue' })).toContainText('Continue');

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Payment', exact: true })).toBeVisible();

  await page
    .frameLocator('#bigpaypay-ccNumber iframe')
    .getByLabel('Credit Card Number')
    .fill('4111 1111 1111 1111');
  await page.frameLocator('#bigpaypay-ccExpiry iframe').getByPlaceholder('MM / YY').fill('02 / 27');
  await page.frameLocator('#bigpaypay-ccName iframe').getByLabel('Name on Card').fill(testUser);
  await page.frameLocator('#bigpaypay-ccCvv iframe').getByLabel('CVV').fill('211');

  await page.getByRole('button', { name: 'Place Order' }).click();
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: `Thank you ${testUser}!`, level: 1 }),
  ).toBeVisible();
});
