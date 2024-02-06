import { getFeaturedProducts } from '~/client/queries/getFeaturedProducts';

import ProductPage from '../page';

export { generateMetadata } from '../page';
export default ProductPage;

export async function generateStaticParams() {
  const products = await getFeaturedProducts();

  return products.map((product) => ({
    slug: product.entityId.toString(),
  }));
}

export const dynamic = 'force-static';
