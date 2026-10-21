import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { z } from 'zod';

const runCustomerSchema = z.object({
  id: z.number(),
  password: z.string(),
});

type RunCustomer = z.infer<typeof runCustomerSchema>;

// BigCommerce keeps one live customer access token per customer, so a login anywhere signs the
// customer out everywhere else. Each test run gets its own customer so concurrent CI runs on the
// same store can't revoke each other's sessions or delete each other's data.
class RunCustomerStore {
  private storageFilePath = '.tests/run-customer.json';

  async get(): Promise<RunCustomer | undefined> {
    try {
      const file = await readFile(this.storageFilePath, 'utf-8');

      return runCustomerSchema.parse(JSON.parse(file));
    } catch {
      return undefined;
    }
  }

  async set(customer: RunCustomer): Promise<void> {
    await mkdir(dirname(this.storageFilePath), { recursive: true });
    await writeFile(this.storageFilePath, JSON.stringify(customer, null, 2));
  }

  async clear(): Promise<void> {
    await rm(this.storageFilePath, { force: true });
  }
}

export const runCustomerStore = new RunCustomerStore();
