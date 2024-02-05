import BrandPageContents from '~/app/(default)/(dynamic)/(faceted)/brand/[slug]/_pageContents';
import { getBrands } from '~/client/queries/getBrands';

export async function generateStaticParams() {
  const brands = await getBrands();

  return brands.map((brand) => ({
    slug: brand.entityId.toString(),
  }));
}

interface BrandPageProps {
  params: { slug: string };
}

export default function BrandPage({ params }: BrandPageProps) {
  return <BrandPageContents params={params} />;
}
