import { getFeaturedProducts } from '~/client/queries/get-featured-products';
import { locales } from '~/i18n';

import ProductPage from '../page';

export { generateMetadata } from '../page';
export default ProductPage;

export async function generateStaticParams() {
  const products = await getFeaturedProducts();

  return locales.map((locale) => {
    return products.map((product) => ({
      locale,
      slug: product.entityId.toString(),
    }));
  });
}

export const dynamic = 'force-static';
export const revalidate = 600;
