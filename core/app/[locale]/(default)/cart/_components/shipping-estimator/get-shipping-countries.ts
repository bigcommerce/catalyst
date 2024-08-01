import { FragmentOf } from 'gql.tada';

import { getShippingZones } from '~/client/management/get-shipping-zones';

import { GeographyFragment } from './fragment';

interface GetShippingCountries {
  geography: FragmentOf<typeof GeographyFragment>;
}

export const getShippingCountries = async ({ geography }: GetShippingCountries) => {
  const shippingZones = await getShippingZones();

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

  const countries = geography.countries ?? [];
  const shippingCountries = countries.flatMap((countryDetails) => {
    const isCountryInTheList = uniqueCountryZones.includes(countryDetails.code);

    if (isCountryInTheList) {
      const { entityId: id, name, code: countryCode } = countryDetails;

      return { id, name, countryCode };
    }

    return [];
  });

  return shippingCountries;
};
