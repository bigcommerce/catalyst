import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Rating } from '@/vibes/soul/primitives/rating';
import { ProductGallery } from '@/vibes/soul/sections/product-detail/product-gallery';

import { ProductDetailForm, ProductDetailFormAction } from './product-detail-form';
import { Field } from './schema';

type ProductDetailProduct = {
  id: string;
  title: string;
  href: string;
  images: Array<{ src: string; alt: string }>;
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
  description?: string;
};

type Props<F extends Field> = {
  breadcrumbs?: Breadcrumb[];
  product: ProductDetailProduct;
  action: ProductDetailFormAction<F>;
  fields: F[];
};

export function ProductDetail<F extends Field>({ product, action, fields, breadcrumbs }: Props<F>) {
  return (
    <section className="@container">
      <div className="mx-auto w-full max-w-screen-lg px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />}

        <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 @2xl:grid-cols-2 @5xl:gap-x-12">
          <div className="hidden @2xl:block">
            <ProductGallery className="sticky top-8" images={product.images} />
          </div>

          {/* Product Details */}
          <div className="text-foreground">
            {product.subtitle != null && product.subtitle !== '' && (
              <p className="font-mono text-sm uppercase">{product.subtitle}</p>
            )}

            <h1 className="mb-3 mt-2 font-heading text-2xl font-medium leading-none @xl:mb-4 @xl:text-3xl @4xl:text-4xl">
              {product.title}
            </h1>

            <Rating rating={product.rating ?? 0} />

            <PriceLabel className="my-3 text-xl @xl:text-2xl" price={product.price ?? ''} />

            <div className="mb-8 @2xl:hidden">
              <ProductGallery images={product.images} />
            </div>

            {product.description != null && product.description !== '' && (
              <p className="mb-6 text-contrast-500">{product.description}</p>
            )}

            <ProductDetailForm action={action} fields={fields} productId={product.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
