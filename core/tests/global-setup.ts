import { runCustomerStore } from '~/tests/fixtures/customer/run-customer';
import { httpApiClient } from '~/tests/fixtures/utils/api';

async function deleteRunCustomer() {
  const customer = await runCustomerStore.get();

  if (customer) {
    await httpApiClient.customers.delete([customer.id]);
  }

  await runCustomerStore.clear();
}

export default async function globalSetup() {
  // An interrupted run skips teardown, so remove its customer before the first test creates a new one.
  await deleteRunCustomer().catch(() => runCustomerStore.clear());

  return deleteRunCustomer;
}
