import ProductPageContents from '~/app/(default)/(dynamic)/product/[slug]/_pageContents';
import { getFeaturedProducts } from '~/client/queries/getFeaturedProducts';
import { getProducts } from '~/client/queries/getProducts';
import { getProductSearchResults } from '~/client/queries/getProductSearchResults';

export async function generateStaticParams() {
  const products = await getFeaturedProducts();

  return products.map((product) => ({
    slug: product.entityId.toString(),
  }));
}

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductPageContents params={params} />;
}
