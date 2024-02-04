import { getBrands } from '~/client/queries/get-brands';
import { envStaticRuntime } from '~/runtime';

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
export const runtime = `${envStaticRuntime}`;
