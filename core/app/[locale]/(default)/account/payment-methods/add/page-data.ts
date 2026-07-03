import { cache } from 'react';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

/**
 * Which microapp CDN to load. Prod is public and works for a render-only POC,
 * since the ECP form needs no BigCommerce backend to render. For a bcdev store
 * you can switch to the integration base:
 *   https://microapps.integration.zone/storefront-account-payments/
 */
const MICROAPP_BASE = 'https://microapps.bigcommerce.com/storefront-account-payments/';

export interface MicroappAssets {
  base: string;
  js: string[];
  css: string[];
  error?: string;
}

const ManifestSchema = z.object({
  js: z.array(z.string()).optional(),
  css: z.array(z.string()).optional(),
});

export async function getMicroappAssets(): Promise<MicroappAssets> {
  try {
    const res = await fetch(new URL('manifest.json', MICROAPP_BASE), { cache: 'no-store' });

    if (!res.ok) {
      return { base: MICROAPP_BASE, js: [], css: [], error: `manifest HTTP ${res.status}` };
    }

    const manifest = ManifestSchema.parse(await res.json());

    return { base: MICROAPP_BASE, js: manifest.js ?? [], css: manifest.css ?? [] };
  } catch (error) {
    return { base: MICROAPP_BASE, js: [], css: [], error: String(error) };
  }
}

// The shapes the microapp expects for its billing-address country/state selectors.
export interface MicroappState {
  code: string;
  name: string;
  value: string;
}

export interface MicroappCountry {
  code: string;
  value: string;
  label: string;
  states?: MicroappState[];
}

const GetCountriesQuery = graphql(`
  query GetCountriesQuery {
    geography {
      countries {
        code
        name
        statesOrProvinces {
          name
          abbreviation
        }
      }
    }
  }
`);

export const getMicroappCountries = cache(async (): Promise<MicroappCountry[]> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: GetCountriesQuery,
    customerAccessToken,
    fetchOptions: { next: { revalidate: 3600 } },
  });

  return response.data.geography.countries.map((country) => {
    const states = country.statesOrProvinces.map((state) => ({
      code: state.abbreviation,
      name: state.name,
      value: state.abbreviation,
    }));

    return {
      code: country.code,
      value: country.code,
      label: country.name,
      // Omit when empty so the microapp renders a free-text field, not an empty dropdown.
      ...(states.length > 0 && { states }),
    };
  });
});
