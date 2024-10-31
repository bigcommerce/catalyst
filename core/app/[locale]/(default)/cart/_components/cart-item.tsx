import { useFormatter } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveGiftCertificate, RemoveItem } from './remove-item';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);

const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);

const GiftCertificateItemFragment = graphql(`
  fragment GiftCertificateItemFragment on CartGiftCertificate {
    entityId
    name
    theme
    amount {
      currencyCode
      value
    }
    isTaxable
    sender {
      email
      name
    }
    recipient {
      email
      name
    }
    message
  }
`);

export const CartItemFragment = graphql(
  `
    fragment CartItemFragment on CartLineItems {
      physicalItems {
        ...PhysicalItemFragment
      }
      digitalItems {
        ...DigitalItemFragment
      }
      giftCertificates {
        ...GiftCertificateItemFragment
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment, GiftCertificateItemFragment],
);

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];
type GiftCertificateItem = FragmentResult['giftCertificates'][number];

export type Product = PhysicalItem | DigitalItem;

interface Props {
  product: Product;
  currencyCode: string;
}

export const CartItem = ({ currencyCode, product }: Props) => {
  const format = useFormatter();

  return (
    <li>
      <div className="flex gap-4 border-t border-t-gray-200 py-4 md:flex-row">
        <div className="w-24 flex-none md:w-[144px]">
          {product.image?.url ? (
            <BcImage alt={product.name} height={144} src={product.image.url} width={144} />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-base text-gray-500">{product.brand}</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xl font-bold md:text-2xl">{product.name}</p>

              {product.selectedOptions.length > 0 && (
                <div>
                  {product.selectedOptions.map((selectedOption) => {
                    switch (selectedOption.__typename) {
                      case 'CartSelectedMultipleChoiceOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">{selectedOption.value}</span>
                          </div>
                        );

                      case 'CartSelectedCheckboxOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">{selectedOption.value}</span>
                          </div>
                        );

                      case 'CartSelectedNumberFieldOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">{selectedOption.number}</span>
                          </div>
                        );

                      case 'CartSelectedMultiLineTextFieldOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">{selectedOption.text}</span>
                          </div>
                        );

                      case 'CartSelectedTextFieldOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">{selectedOption.text}</span>
                          </div>
                        );

                      case 'CartSelectedDateFieldOption':
                        return (
                          <div key={selectedOption.entityId}>
                            <span>{selectedOption.name}:</span>{' '}
                            <span className="font-semibold">
                              {format.dateTime(new Date(selectedOption.date.utc))}
                            </span>
                          </div>
                        );
                    }

                    return null;
                  })}
                </div>
              )}

              <div className="hidden md:block">
                <RemoveItem currency={currencyCode} product={product} />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <div>
                {product.originalPrice.value &&
                product.originalPrice.value !== product.listPrice.value ? (
                  <p className="text-lg font-bold line-through">
                    {format.number(product.originalPrice.value * product.quantity, {
                      style: 'currency',
                      currency: currencyCode,
                    })}
                  </p>
                ) : null}
                <p className="text-lg font-bold">
                  {format.number(product.extendedSalePrice.value, {
                    style: 'currency',
                    currency: currencyCode,
                  })}
                </p>
              </div>

              <ItemQuantity product={product} />
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <RemoveItem currency={currencyCode} product={product} />
          </div>
        </div>
      </div>
    </li>
  );
};

interface GiftCertificateProps {
  giftCertificate: GiftCertificateItem;
  currencyCode: string;
}

export const CartGiftCertificate = ({ currencyCode, giftCertificate }: GiftCertificateProps) => {
  const format = useFormatter();

  return (
    <li>
      <div className="flex gap-4 border-t border-t-gray-200 py-4 md:flex-row">
        <div className="flex w-24 items-center justify-center md:w-[144px]">
          <h2 className="text-lg font-bold">{giftCertificate.theme}</h2>
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xl font-bold md:text-2xl">
                {format.number(giftCertificate.amount.value, {
                  style: 'currency',
                  currency: currencyCode,
                })}{' '}
                Gift Certificate
              </p>

              <p className="text-md text-gray-500">{giftCertificate.message}</p>
              <p className="text-sm text-gray-500">
                To: {giftCertificate.recipient.name} ({giftCertificate.recipient.email})
              </p>
              <p className="text-sm text-gray-500">
                From: {giftCertificate.sender.name} ({giftCertificate.sender.email})
              </p>

              <div className="hidden md:block">
                <RemoveGiftCertificate currency={currencyCode} giftCertificate={giftCertificate} />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <div>
                <p className="text-lg font-bold">
                  {format.number(giftCertificate.amount.value, {
                    style: 'currency',
                    currency: currencyCode,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <RemoveGiftCertificate currency={currencyCode} giftCertificate={giftCertificate} />
          </div>
        </div>
      </div>
    </li>
  );
};
