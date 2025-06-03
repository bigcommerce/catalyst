/* eslint-disable valid-jsdoc */
import { faker } from '@faker-js/faker';
import { z } from 'zod';

import { generateCustomerLoginApiJwt } from '~/auth/customer-login-api';
import { testEnv } from '~/tests/environment';
import { expect, Page } from '~/tests/fixtures';
import { Fixture } from '~/tests/fixtures/fixture';
import { apiResponseSchema } from '~/tests/fixtures/utils/api/schema';
import { getTranslations } from '~/tests/lib/i18n';

import { Address } from './address';
import { Customer } from './customer';
import { customerSessionStore } from './session';
import { Wishlist } from './wishlist';

export class CustomerFixture extends Fixture {
  customers: Customer[] = [];
  addresses: Address[] = [];
  wishlists: Wishlist[] = [];

  constructor(
    readonly reuseCustomerSession: boolean,
    ...args: ConstructorParameters<typeof Fixture>
  ) {
    super(...args);
  }

  /**
   * Checks environment variables for a test customer. If the test customer is not found, it creates a new one. \
   * This method should always be preferred over creating a new customer directly, unless the test you are writing specifically requires a new customer.
   */
  async getOrCreateTestCustomer(): Promise<Customer> {
    const testCustomer = await this.getTestCustomer();

    if (testCustomer) {
      return testCustomer;
    }

    return this.createNewCustomer();
  }

  async createNewCustomer(): Promise<Customer> {
    // Prefix is added to ensure that the password requirements are met
    const password = faker.internet.password({
      pattern: /[a-zA-Z0-9]/,
      prefix: '1At!',
      length: 10,
    });

    const resp = await this.api
      .post('/v3/customers', [Customer.fakeCreateData(password, true)])
      .parse(apiResponseSchema(z.array(Customer.schema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error('Customer not found in response');
    }

    const result = Customer.fromApiResponse(customer, password);

    this.customers.push(result);

    return result;
  }

  async getTestCustomer(): Promise<Customer | undefined> {
    if (
      !testEnv.TEST_CUSTOMER_ID ||
      !testEnv.TEST_CUSTOMER_EMAIL ||
      !testEnv.TEST_CUSTOMER_PASSWORD
    ) {
      return undefined;
    }

    const resp = await this.api
      .get(`/v3/customers?id:in=${testEnv.TEST_CUSTOMER_ID}&include=addresses`)
      .parse(apiResponseSchema(z.array(Customer.schema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error('No customer found with the provided TEST_CUSTOMER_ID');
    }

    if (customer.origin_channel_id !== (testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1)) {
      throw new Error(
        `Test customer ${testEnv.TEST_CUSTOMER_ID} is not from the correct channel. Expected ${
          testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1
        }, got ${customer.origin_channel_id}.`,
      );
    }

    return Customer.fromApiResponse(customer, testEnv.TEST_CUSTOMER_PASSWORD);
  }

  /** Gets customer information from the API via ID. Will not include a password, as this cannot be obtained via API. */
  async getById(customerId: number): Promise<Customer> {
    const resp = await this.api
      .get(`/v3/customers?id:in=${customerId}`)
      .parse(apiResponseSchema(z.array(Customer.schema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error(`No customer found with the provided ID: ${customerId}`);
    }

    return Customer.fromApiResponse(customer);
  }

  async getByEmail(email: string): Promise<Customer> {
    const resp = await this.api
      .get(`/v3/customers?email:in=${email}`)
      .parse(apiResponseSchema(z.array(Customer.schema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error(`No customer found with the provided email: ${email}`);
    }

    return Customer.fromApiResponse(customer);
  }

  async createAddress(customerId: number): Promise<Address> {
    const resp = await this.api
      .post('/v3/customers/addresses', [Address.fakeCreateData({ customerId })])
      .parse(apiResponseSchema(z.array(Address.schema)));

    const createdAddress = resp.data[0];

    if (!createdAddress) {
      throw new Error('No address found in response');
    }

    const address = Address.fromApiResponse(createdAddress);

    this.addresses.push(address);

    return address;
  }

  async createWishlist({
    customerId,
    name = `Test wishlist ${faker.string.alpha(10)}`,
    isPublic = false,
    items = [],
  }: {
    customerId: number;
    name?: string;
    isPublic?: boolean;
    items?: Array<{ productId: number; variantId?: number }>;
  }): Promise<Wishlist> {
    const resp = await this.api
      .post('/v3/wishlists', {
        name,
        is_public: isPublic,
        customer_id: customerId,
        items: items.map(({ productId, variantId }) => ({
          product_id: productId,
          variant_id: variantId,
        })),
      })
      .parse(apiResponseSchema(Wishlist.schema));

    const wishlist = Wishlist.fromApiResponse(resp.data);

    this.wishlists.push(wishlist);

    return wishlist;
  }

  async generateLoginJwt(customerId: number, redirectTo = '/account/orders'): Promise<string> {
    try {
      return await generateCustomerLoginApiJwt(
        customerId,
        testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1,
        redirectTo,
      );
    } catch {
      this.test.skip(true, 'Failed to generate JWT for customer login test');

      // Will never be reached due to the test.skip
      return '';
    }
  }

  /**
   * Logs in with the designated test customer account, or makes a new customer account to login with if no test account is set.
   * If possible, will reuse an existing login session to avoid unnecessary logins.
   */
  async login(redirectTo?: string): Promise<Customer> {
    const customer = await this.getOrCreateTestCustomer();

    await this.loginAs(customer, redirectTo);

    return customer;
  }

  async loginAs(customer: Customer, redirectTo?: string): Promise<void> {
    if (!customer.password) {
      throw new Error('Unable to perform login due to customer password not being set.');
    }

    const t = await getTranslations('Auth.Login');
    const searchParams = redirectTo ? `?${new URLSearchParams({ redirectTo }).toString()}` : '';
    const url = `/login${searchParams}`;

    if (
      !redirectTo &&
      this.reuseCustomerSession &&
      (await customerSessionStore.useExistingSession(this, customer.id))
    ) {
      return;
    }

    await this.page.goto(url);
    await this.page.getByLabel(t('email')).fill(customer.email);
    await this.page.getByLabel(t('password')).fill(customer.password);
    await this.page.getByRole('button', { name: t('cta') }).click();
    await this.page.waitForLoadState('networkidle');

    await expect(this.page.getByText(t('invalidCredentials'))).not.toBeVisible();
    await expect(this.page).not.toHaveURL(url);

    // If the assertions are passed, we can assume login was successful.
    await customerSessionStore.updateCustomerSession(this, customer.id);
  }

  async logout(): Promise<void> {
    const t = await getTranslations();

    await this.page.getByLabel(t('Components.Header.Icons.account')).click();
    await this.page.waitForURL('/account/**');
    await this.page.getByRole('link', { name: t('Account.Layout.logout') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async delete(...ids: number[]): Promise<void> {
    if (ids.length > 0) {
      await this.api.delete(`/v3/customers?id:in=${ids.join(',')}`);
    }
  }

  async deleteAllAddresses(customerId: number): Promise<void> {
    const resp = await this.api
      .get(`/v3/customers/addresses?customer_id:in=${customerId}`)
      .parse(apiResponseSchema(z.array(Address.schema)));

    const addressIds = resp.data.map(({ id }) => id);

    await this.deleteAddresses(...addressIds);
  }

  async deleteAddresses(...ids: number[]): Promise<void> {
    if (ids.length > 0) {
      await this.api.delete(`/v3/customers/addresses?id:in=${ids.join(',')}`);
    }
  }

  async deleteAllWishlists(customerId: number): Promise<void> {
    const resp = await this.api
      .get(`/v3/wishlists?customer_id=${customerId}`)
      .parse(apiResponseSchema(z.array(Wishlist.schema)));

    await this.deleteWishlists(...resp.data.map(({ id }) => id));
  }

  async deleteWishlists(...ids: number[]): Promise<void> {
    if (ids.length > 0) {
      await Promise.all(ids.map((id) => this.api.delete(`/v3/wishlists/${id}`)));
    }
  }

  /** Clones the fixture with a new page object. Useful if the fixture is needed in a new browser window. */
  withNewPage(page: Page): CustomerFixture {
    return new CustomerFixture(this.reuseCustomerSession, page, this.test);
  }

  async cleanup() {
    // Cleanup will not remove the test customer set in the environment variables
    await this.delete(
      ...this.customers.map(({ id }) => id).filter((id) => id !== testEnv.TEST_CUSTOMER_ID),
    );

    await this.deleteAddresses(...this.addresses.map(({ id }) => id));
    await this.deleteWishlists(...this.wishlists.map(({ id }) => id));
  }
}
