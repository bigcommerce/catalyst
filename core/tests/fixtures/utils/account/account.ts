import { type Page } from '@playwright/test';

export class Account {
  constructor(
    private readonly page: Page,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly password: string,
    readonly id: number,
  ) {}

  async login() {
    await this.page.goto('/login/');
    await this.page.getByLabel('Email').fill(this.email);
    await this.page.getByLabel('Password').fill(this.password);
    await this.page.getByRole('button', { name: 'Log in' }).click();

    await this.page.waitForURL('/account/orders/');
  }

  async logout() {
    await this.page.getByRole('button', { name: 'Account' }).click();
    await this.page.getByRole('menuitem', { name: 'Log out' }).click();
  }
}
