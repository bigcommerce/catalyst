import { getFeaturedProducts } from '~/client/queries/get-featured-products';

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
export const revalidate = 600;
