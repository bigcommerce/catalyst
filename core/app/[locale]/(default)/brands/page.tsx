import { getFormatter, getTranslations } from 'next-intl/server';
import { Breadcrumbs } from '~/components/breadcrumbs';
import { BrandsList } from './_components/brands-list';
import { getSessionCustomerAccessToken } from '~/auth';
import { getBrands } from '~/belami/lib/fetch-brands';

export async function generateMetadata() {
  const t = await getTranslations('Brands');

  return {
    title: t('title'),
  };
}

export default async function BrandsPage() {
  const t = await getTranslations('Brands');
  const format = await getFormatter();

  const customerAccessToken = await getSessionCustomerAccessToken();
  const brandsData = await getBrands(customerAccessToken);
  const brands = brandsData.sort((a: any, b: any) => a.name.localeCompare(b.name));

  return <div className="py-4 px-4 xl:px-12">
    <Breadcrumbs category={{ breadcrumbs: { edges: [{ node: { name: t('title'), path: '/brands' }}]}}} />
    <BrandsList brands={brands} />
  </div>;
}

export const runtime = 'nodejs';
