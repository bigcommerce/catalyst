import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Stream } from '@/vibes/soul/lib/streamable';
import { FeaturedProductsCarousel } from '@/vibes/soul/sections/featured-products-carousel';
import { ProductDetail } from '@/vibes/soul/sections/product-detail';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';

import { addToCart } from './_actions/add-to-cart';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { Reviews } from './_components/reviews';
import { getProductData } from './page-data';

const getOptionValueIds = ({ searchParams }: { searchParams: Awaited<Props['searchParams']> }) => {
  const { slug, ...options } = searchParams;

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
};

const getProduct = async (productPromise: ReturnType<typeof getProductData>) => {
  const format = await getFormatter();
  const product = await productPromise;

  const images = removeEdgesAndNodes(product.images).map((image) => ({
    src: image.url,
    alt: image.altText,
  }));

  return {
    id: product.entityId.toString(),
    title: product.name,
    description: product.description,
    plainTextDescription: product.plainTextDescription,
    href: product.path,
    images: product.defaultImage
      ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
      : images,
    price: pricesTransformer(product.prices, format),
    subtitle: product.brand?.name,
    rating: product.reviewSummary.averageRating,
  };
};

const getFields = async (productPromise: ReturnType<typeof getProductData>) => {
  const product = await productPromise;

  return productOptionsTransformer(product.productOptions);
};

const getCtaLabel = async (productPromise: ReturnType<typeof getProductData>) => {
  const t = await getTranslations('Product.ProductDetails.Submit');

  const product = await productPromise;

  if (product.availabilityV2.status === 'Unavailable') {
    return t('unavailable');
  }

  if (product.availabilityV2.status === 'Preorder') {
    return t('preorder');
  }

  if (!product.inventory.isInStock) {
    return t('outOfStock');
  }

  return t('addToCart');
};

const getCtaDisabled = async (productPromise: ReturnType<typeof getProductData>) => {
  const product = await productPromise;

  if (product.availabilityV2.status === 'Unavailable') {
    return true;
  }

  if (product.availabilityV2.status === 'Preorder') {
    return false;
  }

  if (!product.inventory.isInStock) {
    return true;
  }

  return false;
};

const getRelatedProducts = async (productPromise: ReturnType<typeof getProductData>) => {
  const format = await getFormatter();
  const product = await productPromise;

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

  return productCardTransformer(relatedProducts, format);
};

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProductData({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function Product(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale, slug } = params;

  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const productId = Number(slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const productPromise = getProductData({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

  return (
    <>
      <ProductDetail
        action={addToCart}
        ctaDisabled={getCtaDisabled(productPromise)}
        ctaLabel={getCtaLabel(productPromise)}
        decrementLabel={t('ProductDetails.decreaseQuantity')}
        fields={getFields(productPromise)}
        incrementLabel={t('ProductDetails.increaseQuantity')}
        prefetch={true}
        product={getProduct(productPromise)}
        quantityLabel={t('ProductDetails.quantity')}
      />

      <FeaturedProductsCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={getRelatedProducts(productPromise)}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      <Reviews productId={productId} />

      <Stream fallback={null} value={productPromise}>
        {(product) => (
          <>
            <ProductViewed product={product} />
            <ProductSchema product={product} />
          </>
        )}
      </Stream>
    </>
  );
}
