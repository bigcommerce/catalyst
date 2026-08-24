import 'server-only';

// This will be replaced with GQL customer.storedPaymentInstruments.createVaultInitialization query
const MOCK_PROVIDER_INITIALIZATION: Record<string, unknown> = {
  'squarev2.card': {
    __typename: 'SquareV2CustomerVaultInitialization',
    applicationId: 'sandbox-sq0idb-Sd05jBlqvXzWd_JpYN61ew',
    locationId: 'LR208DWVXEP77',
    env: 'staging',
  },
};

export function getVaultInitialization(
  paymentMethodId: string,
  // currencyCode will be needed later for the GQL query
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currencyCode: string,
): Promise<{ providerInitialization: unknown }> {
  // This will be replaced with GQL customer.storedPaymentInstruments.createVaultInitialization mutation
  const providerInitialization = MOCK_PROVIDER_INITIALIZATION[paymentMethodId];

  if (!providerInitialization) {
    throw new Error(`Failed to fetch initialization data for paymentMethodId "${paymentMethodId}"`);
  }

  return Promise.resolve({ providerInitialization });
}
