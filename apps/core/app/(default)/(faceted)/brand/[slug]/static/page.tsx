import { getBrands } from '~/client/queries/get-brands';

import BrandPage from '../page';

export default BrandPage;

export async function generateStaticParams() {
  const brands = await getBrands();

  return brands.map((brand) => ({
    slug: brand.entityId.toString(),
  }));
}

export const dynamic = 'force-static';
export const revalidate = 600;
