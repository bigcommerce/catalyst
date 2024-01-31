import { getCountries } from '~/client/management/get-countries';
import { getShippingZones } from '~/client/management/get-shipping-zones';

export const getShippingCountries = async () => {
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

  const allCountries = await getCountries();
  const shippingCountries = allCountries.flatMap((countryDetails) => {
    const isCountryInTheList = uniqueCountryZones.includes(countryDetails.country_iso2);

    if (isCountryInTheList) {
      const { id, country: name, country_iso2: countryCode } = countryDetails;

      return { id, name, countryCode };
    }

    return [];
  });

  return shippingCountries;
};
