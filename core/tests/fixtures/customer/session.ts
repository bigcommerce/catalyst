import { access, readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';

import { CustomerFixture } from '.';

const fileSchema = z.record(
  z.coerce.number(),
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
  private storageFilePath = '.tests/customer-session.json';

  async updateCustomerSession(fixture: CustomerFixture, customerId: number): Promise<void> {
    await this.ensureStorageFileExists();

    const cookieJar = await fixture.page.context().cookies();
    const cookies = cookieJar.filter((cookie) => cookie.name.includes('authjs'));

    const file = await readFile(this.storageFilePath, 'utf-8');
    const storage = fileSchema.parse(JSON.parse(file));

    storage[customerId] = cookies;

    await writeFile(this.storageFilePath, JSON.stringify(storage, null, 2));
  }

  // Uses an existing session for a customer ID if it exists. Returns true if successful and false if not found
  async useExistingSession(fixture: CustomerFixture, customerId: number): Promise<boolean> {
    await this.ensureStorageFileExists();

    fixture.page.on('response', async (resp) => {
      if (resp.url().includes('/logout')) {
        await this.removeCustomerSession(customerId);
      }
    });

    const file = await readFile(this.storageFilePath, 'utf-8');

    const storage = fileSchema.parse(JSON.parse(file));
    const customerSession = storage[customerId];

    if (!customerSession) {
      return false;
    }

    await fixture.page.context().addCookies(customerSession);
    await fixture.page.goto('/login/', { waitUntil: 'networkidle' });

    if (new URL(fixture.page.url()).pathname === '/login/') {
      // If the session is no longer valid, the page will stay on the login page.
      // If this happens, the session should be removed so the test can login as normal.
      await this.removeCustomerSession(customerId);

      return false;
    }

    return true;
  }

  private async removeCustomerSession(customerId: number): Promise<void> {
    await this.ensureStorageFileExists();

    const file = await readFile(this.storageFilePath, 'utf-8');

    const storage = fileSchema.parse(JSON.parse(file));
    const updatedStorage = Object.fromEntries(
      Object.entries(storage).filter(([key]) => key !== String(customerId)),
    );

    await writeFile(this.storageFilePath, JSON.stringify(updatedStorage, null, 2));
  }

  private async ensureStorageFileExists(): Promise<void> {
    try {
      await access(this.storageFilePath);
    } catch {
      await writeFile(this.storageFilePath, JSON.stringify({}));
    }
  }
}

export const customerSessionStore = new CustomerSessionStore();
