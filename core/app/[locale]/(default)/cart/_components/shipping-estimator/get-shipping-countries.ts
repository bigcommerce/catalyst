import { FragmentOf } from 'gql.tada';

import { getShippingZones } from '~/client/management/get-shipping-zones';

import { GeographyFragment } from './fragment';

interface GetShippingCountries {
  geography: FragmentOf<typeof GeographyFragment>;
}

export const getShippingCountries = async ({ geography }: GetShippingCountries) => {
  const hasAccessToken = Boolean(process.env.BIGCOMMERCE_ACCESS_TOKEN);
  const shippingZones = hasAccessToken ? await getShippingZones() : [];
  const countries = geography.countries ?? [];

  const uniqueCountryZones = shippingZones.reduce<string[]>((zones, item) => {
    item.locations.forEach(({ country_iso2 }) => {
      if (zones.length === 0) {
        zones.push(country_iso2);

        return zones;
      }

      const isAvailable = zones.length > 0 && zones.some((zone) => zone === country_iso2);

      if (!isAvailable) {
        zones.push(country_iso2);
      }

      return zones;
    });

    return zones;
  }, []);

  return countries.filter((countryDetails) => {
    const isCountryInTheList = uniqueCountryZones.includes(countryDetails.code);

    return isCountryInTheList || !hasAccessToken;
  });
};
