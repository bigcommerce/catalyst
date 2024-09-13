import { type Page } from '@playwright/test';

import { Account } from './account';
import { createAccount } from './create';
import { deleteAccount } from './delete';

export class AccountFactory {
  autoCleanup = false;
  private accounts: Account[] = [];

  constructor(private readonly page: Page) {}

  async create() {
    const customer = await createAccount();

    const account = new Account(
      this.page,
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.password,
      customer.id,
    );

    this.accounts.push(account);

    return account;
  }

  async cleanup() {
    await Promise.all(this.accounts.map(async (account) => await deleteAccount(account.id)));
  }
}
