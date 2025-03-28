import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getPreferredCurrencyCode } from '~/lib/currency';

const CurrencyQuery = graphql(`
  query Currency($currencyCode: currencyCode!) {
    site {
      currency(currencyCode: $currencyCode) {
        display {
          decimalPlaces
          symbol
        }
        name
        code
      }
    }
  }
`);

export const getCurrencyData = async (currencyCode?: string) => {
  const code = await getPreferredCurrencyCode(currencyCode);

  if (!code) {
    throw new Error('Could not get currency code');
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    return await client.fetch({
      document: CurrencyQuery,
      fetchOptions: { cache: 'no-store' },
      variables: {
        currencyCode: code,
      },
      customerAccessToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
};
