/* eslint-disable valid-jsdoc */
import fs from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';

import { CustomerFixture } from '.';

const storageFilePath = '.tests/customer-session.json';
const fileSchema = z.record(
  z.string().transform((val, ctx) => {
    const parsed = Number(val);

    if (Number.isNaN(parsed)) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'number',
        received: 'nan',
      });

      return z.NEVER;
    }

    return parsed;
  }),
  z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      domain: z.string(),
      path: z.string(),
      expires: z.number(),
      httpOnly: z.boolean(),
      secure: z.boolean(),
      sameSite: z.enum(['Strict', 'Lax', 'None']),
    }),
  ),
);

class CustomerSessionStore {
  constructor() {
    if (!fs.existsSync(storageFilePath)) {
      fs.writeFileSync(storageFilePath, JSON.stringify({}));
    }
  }

  async updateCustomerSession(fixture: CustomerFixture, customerId: number): Promise<void> {
    const cookies = (await fixture.page.context().cookies()).filter((cookie) =>
      cookie.name.includes('authjs'),
    );

    const storage = fileSchema.parse(JSON.parse(fs.readFileSync(storageFilePath, 'utf-8')));

    storage[customerId] = cookies;

    await writeFile(storageFilePath, JSON.stringify(storage, null, 2));
  }

  /** Uses an existing session for a customer ID if it exists. Returns true if successful and false if not found */
  async useExistingSession(fixture: CustomerFixture, customerId: number): Promise<boolean> {
    const storage = fileSchema.parse(JSON.parse(await readFile(storageFilePath, 'utf-8')));
    const customerSession = storage[customerId];

    fixture.page.on('response', async (resp) => {
      if (resp.url().includes('/logout')) {
        await this.removeCustomerSession(customerId);
      }
    });

    if (!customerSession) {
      return false;
    }

    await fixture.page.context().addCookies(customerSession);
    await fixture.page.goto('/login/', { waitUntil: 'networkidle' });

    if (new URL(fixture.page.url()).pathname.includes('/login/')) {
      // If the session is no longer valid, the page will stay on the login page.
      // If this happens, the session should be removed so the test can login as normal.
      await this.removeCustomerSession(customerId);

      return false;
    }

    return true;
  }

  private async removeCustomerSession(customerId: number): Promise<void> {
    const storage = fileSchema.parse(JSON.parse(fs.readFileSync(storageFilePath, 'utf-8')));
    const customerSession = storage[customerId];

    if (customerSession) {
      const updatedStorage = Object.fromEntries(
        Object.entries(storage).filter(([key]) => key !== String(customerId)),
      );

      await writeFile(storageFilePath, JSON.stringify(updatedStorage, null, 2));
    }
  }
}

export const customerSessionStore = new CustomerSessionStore();
