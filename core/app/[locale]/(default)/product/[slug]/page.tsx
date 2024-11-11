import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { Field } from '@/vibes/soul/sections/product-detail/schema';
import { ReviewsSkeleton } from '@/vibes/soul/sections/reviews';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { LocaleType } from '~/i18n/routing';
import { AccordionItem, ProductDescription } from '~/makeswift/components/product-description';
import { ProductDetail } from '~/makeswift/components/product-detail';

import { addToCart } from './_actions/add-to-cart';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { RelatedProducts } from './_components/related-products';
import { Reviews } from './_components/reviews';
import { getProduct } from './page-data';

interface Props {
  params: { slug: string; locale: LocaleType };
  searchParams: Record<string, string | string[] | undefined>;
}

function getOptionValueIds({ searchParams }: { searchParams: Props['searchParams'] }) {
  const { slug, ...options } = searchParams;

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

  if (!product) {
    return {};
  }

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

export default async function Product({ params: { locale, slug }, searchParams }: Props) {
  setRequestLocale(locale);

  const t = await getTranslations('Product');

  const format = await getFormatter();

  const productId = Number(slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: true,
  });

  if (!product) {
    return notFound();
  }

  // TODO: add breadcrumb?
  // const category = removeEdgesAndNodes(product.categories).at(0);

  const accordions: AccordionItem[] = [
    // Description - only if not null/empty
    ...(product.description
      ? [
          {
            title: t('Description.heading'),
            content: (
              <div className="prose" dangerouslySetInnerHTML={{ __html: product.description }} />
            ),
          },
        ]
      : []),

    // Additional Details - only if there are custom fields
    ...(product.customFields.edges?.length
      ? [
          {
            title: t('Details.additionalDetails'),
            content: (
              <div className="prose">
                {product.customFields.edges.map((field, index, array) => (
                  <div key={index}>
                    <strong>{field.node.name}</strong> <br />
                    {field.node.value}
                    {index < array.length - 1 && <br />}
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),

    // Warranty - only if not null/empty
    ...(product.warranty
      ? [
          {
            title: t('Warranty.heading'),
            content: (
              <div className="prose" dangerouslySetInnerHTML={{ __html: product.warranty }} />
            ),
          },
        ]
      : []),
  ];

  const images = removeEdgesAndNodes(product.images).map((image) => ({
    src: image.url,
    alt: image.altText,
  }));

  const formattedProduct = {
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

  const formattedFields = removeEdgesAndNodes(product.productOptions)
    .map<Field | null>((option) => {
      if (option.__typename === 'MultipleChoiceOption') {
        const values = removeEdgesAndNodes(option.values);

        switch (option.displayStyle) {
          case 'Swatch': {
            return {
              type: 'swatch-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values
                .filter(
                  (value) => '__typename' in value && value.__typename === 'SwatchOptionValue',
                )
                .map((value) => {
                  if (value.imageUrl) {
                    return {
                      type: 'image',
                      label: value.label,
                      value: value.entityId.toString(),
                      image: { src: value.imageUrl, alt: value.label },
                    };
                  }

                  return {
                    type: 'color',
                    label: value.label,
                    value: value.entityId.toString(),
                    color: value.hexColors[0] ?? '',
                  };
                }),
            };
          }

          case 'RectangleBoxes': {
            return {
              type: 'button-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'RadioButtons': {
            return {
              type: 'radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'DropdownList': {
            return {
              type: 'select',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'ProductPickList':
          case 'ProductPickListWithImages': {
            return {
              type: 'card-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values
                .filter(
                  (value) =>
                    '__typename' in value && value.__typename === 'ProductPickListOptionValue',
                )
                .map((value) => ({
                  label: value.label,
                  value: value.entityId.toString(),
                  image: {
                    src: value.defaultImage?.url ?? '',
                    alt: value.defaultImage?.altText ?? '',
                  },
                })),
            };
          }

          default:
            return null;
        }
      }

      if (option.__typename === 'CheckboxOption') {
        return {
          type: 'checkbox',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.checkedByDefault.toString(),
          uncheckedValue: option.uncheckedOptionValueEntityId.toString(),
          checkedValue: option.checkedOptionValueEntityId.toString(),
        };
      }

      if (option.__typename === 'NumberFieldOption') {
        return {
          type: 'number',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultNumber?.toString(),
          min: option.lowest ?? undefined,
          max: option.highest ?? undefined,
          // TODO: other props?
        };
      }

      if (option.__typename === 'MultiLineTextFieldOption') {
        return {
          type: 'textarea',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultText ?? undefined,
        };
      }

      if (option.__typename === 'TextFieldOption') {
        return {
          type: 'text',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultText ?? undefined,
        };
      }

      if (option.__typename === 'DateFieldOption') {
        return {
          type: 'date',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultDate ?? undefined,
        };
      }

      return null;
    })
    .filter((field) => field !== null);

  return (
    <>
      <ProductDetail action={addToCart} fields={formattedFields} product={formattedProduct} />

      <ProductDescription accordions={accordions} image={images[0]} product={formattedProduct} />

      <ProductSchema product={product} />

      <Suspense fallback={t('loading')}>
        <RelatedProducts productId={product.entityId} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={product.entityId} searchParams={searchParams} />
      </Suspense>

      <ProductViewed product={product} />
    </>
  );
}

export const runtime = 'edge';
