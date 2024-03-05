import { getBrands } from '~/client/queries/get-brands';
import { locales } from '~/i18n';

import BrandPage from '../page';

export default BrandPage;

export async function generateStaticParams() {
  const brands = await getBrands();

  return locales.map((locale) => {
    return brands.map((brand) => ({
      locale,
      slug: brand.entityId.toString(),
    }));
  });
}

export const dynamic = 'force-static';
export const revalidate = 600;
