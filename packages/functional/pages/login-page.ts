import { Page } from '@playwright/test';

export const testAccountEmail = process.env.TEST_ACCOUNT_EMAIL || '';
export const testAccountPassword = process.env.TEST_ACCOUNT_PASSWORD || '';

export async function loginAsShopper(page: Page) {
    await page.goto('/login/');
    await page.getByLabel('Login').click();
    await page.getByLabel('Email').fill(testAccountEmail);
    await page.getByLabel('Password').fill(testAccountPassword);
    await page.getByRole('button', { name: 'Log in' }).click();
}

export * as LoginPage from './login-page';
