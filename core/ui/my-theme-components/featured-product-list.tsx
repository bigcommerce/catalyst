import { Stream } from '@/vibes/soul/lib/streamable';
import { FeaturedProductListProps } from '~/ui/featured-product-list';

interface Props extends FeaturedProductListProps {
  className?: string;
}

export function FeaturedProductList({ title, description, products: streamableProducts }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
      <Stream fallback={<div>Loading...</div>} value={streamableProducts}>
        {(products) => {
          return (
            <div>
              {products.map((product) => (
                <div key={product.id}>{product.title}</div>
              ))}
            </div>
          );
        }}
      </Stream>
    </section>
  );
}
