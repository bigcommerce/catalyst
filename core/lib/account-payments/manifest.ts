// This will not be needed after the GQL `accountPaymentsMicroapp` field is implemented, as the manifest will be returned directly from the GQL query.
// Also, the scripts src will be returned as a full path (including the `https://microapps.bigcommerce.com/storefront-account-payments` prefix) rather than just the filename, so this base URL constant will not be needed either.
export const ACCOUNT_PAYMENTS_MICROAPP_BASE =
  'https://microapps.bigcommerce.com/storefront-account-payments';

export interface Manifest {
  appVersion: string;
  js: string[];
  integrity: Record<string, string>;
}

export async function getMicroappManifest(): Promise<Manifest> {
  // This will be replaced by a GraphQL query `accountPaymentsMicroapp` field
  // The actual GQL query will be cached (not re-run every render)
  const res = await fetch(`${ACCOUNT_PAYMENTS_MICROAPP_BASE}/manifest.json`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`microapp manifest fetch failed: ${res.status}`);
  }

  // Untyped JSON parse will be replaced by a typed GraphQL query once GQL `accountPaymentsMicroapp` field is implemented
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return res.json();
}
