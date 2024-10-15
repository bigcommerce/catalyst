import { useFormatter } from 'next-intl';
import Link from 'next/link';

import { FragmentOf, graphql } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveItem } from './remove-item';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    url
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
    url
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

export const CartItemFragment = graphql(
  `
    fragment CartItemFragment on CartLineItems {
      physicalItems {
        ...PhysicalItemFragment
      }
      digitalItems {
        ...DigitalItemFragment
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment],
);

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];

export type Product = PhysicalItem | DigitalItem;

interface Props {
  product: Product;
  currencyCode: string;
  deleteIcon: string;
}
function moveToTheEnd(arr: any, word: string) {
  arr?.map((elem: any, index: number) => {
    if (elem?.name?.toLowerCase() === word?.toLowerCase()) {
      arr?.splice(index, 1);
      arr?.push(elem);
    }
  })
  return arr;
}
export const CartItem = ({ currencyCode, product, deleteIcon }: Props) => {
  const changeTheProtectedPosition = moveToTheEnd(product?.selectedOptions, "Protect Your Purchase");
  const format = useFormatter();

  return (
    <li>
      <div className="flex flex-col gap-4 mb-8 border border-gray-200 p-4 py-4 md:flex-row">
        <div className="w-full flex-none mx-auto md:w-[144px] md:mx-0 border border-gray-300">
          {product.image?.url ? (
            <BcImage
              alt={product.name}
              height={144}
              src={product.image.url}
              width={144}
              className="h-full w-full object-cover" // Added class to fill space
            />
          ) : (
            <div className="min-h-[300px] min-w-[300px] bg-gray-200" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-base text-gray-500">{product.brand}</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Link href={product.url}>
                <p className="text-xl font-normal md:text-xl">{product.name}</p>
              </Link>

              {changeTheProtectedPosition?.length > 0 && (
                <div className="modifier-options flex flex-wrap min-w-full sm:min-w-[300px] max-w-[600px] gap-2">
                  <div className="flex flex-wrap gap-2">
                    <p className="text-base font-bold md:text-base">
                      SKU: {product.sku}
                      {changeTheProtectedPosition.length > 0 && (
                        <span className="text-base font-normal md:text-base"> |</span>
                      )}
                    </p>
                    {changeTheProtectedPosition.map((selectedOption: any, index: number) => {
                      let pipeLineData = '';
                      if (index < changeTheProtectedPosition.length - 2) {
                        pipeLineData = '|';
                      }
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
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{selectedOption.value}</span>
                              {pipeLineData && <span className="text-base font-normal md:text-base">{pipeLineData}</span>}
                            </div>
                          );

                        case 'CartSelectedNumberFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{selectedOption.number}</span>
                              {pipeLineData && <span className="text-base font-normal md:text-base">{pipeLineData}</span>}
                            </div>
                          );

                        case 'CartSelectedMultiLineTextFieldOption':
                        case 'CartSelectedTextFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{selectedOption.text}</span>
                              {pipeLineData && <span className="text-base font-normal md:text-base">{pipeLineData}</span>}
                            </div>
                          );

                        case 'CartSelectedDateFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{format.dateTime(new Date(selectedOption.date.utc))}</span>
                              {pipeLineData && <span className="text-base font-normal md:text-base">{pipeLineData}</span>}
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              {/* Mobile layout for dollar amount and item quantity/remove button in separate rows */}
              <div className="block md:hidden">
                {/* Dollar amount row */}
                <p className="text-lg font-bold text-left mb-4">
                  {format.number(product.extendedSalePrice.value, {
                    style: 'currency',
                    currency: currencyCode,
                  })}
                </p>
                {/* Item quantity and remove button in separate columns */}
                <div className="flex justify-between items-center">
                  {/* Item quantity aligned left */}
                  <div className="text-left">
                    <ItemQuantity product={product} />
                  </div>
                  {/* Remove button aligned right */}
                  <div className="text-right">
                    <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                  </div>
                </div>
              </div>
              {/* Desktop layout (unchanged) */}
              <div className="hidden md:flex flex-col gap-2 md:items-end">
                <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                <div>
                  {product.originalPrice.value && changeTheProtectedPosition?.length === 0 &&
                    product.originalPrice.value !== product.listPrice.value ? (
                    <p className="text-lg mb-1 font-bold line-through">
                      {format.number(product.originalPrice.value * product.quantity, {
                        style: 'currency',
                        currency: currencyCode,
                      })}
                    </p>
                  ) : null}
                  <p className="text-lg font-bold pb-2">
                    {format.number(product.extendedSalePrice.value, {
                      style: 'currency',
                      currency: currencyCode,
                    })}
                  </p>
                </div>
                <ItemQuantity product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
