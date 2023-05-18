import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@reactant/components/Button';
import { Link as ReactantLink } from '@reactant/components/Link';
import { H3, P, ProductTile } from '@reactant/components/ProducTile';
import { Swatch, SwatchGroup } from '@reactant/components/Swatch';
import { HeartIcon } from '@reactant/icons/Heart';

import { Variant } from '../pages/product/[pid]';

import { Product } from './ProductTiles';

interface ProductTileWrapperProps {
  priority?: boolean;
  product: Product;
  productComparisonsEnabled: boolean;
}

export const ProductTileWrapper = ({
  product,
  priority,
  productComparisonsEnabled,
}: ProductTileWrapperProps) => {
  // in terms of POS: for product with swatch option only (check in CP) or without any options
  const defaultSwatchId = product.node.productOptions.edges[0]?.node.values.edges.filter(
    (value) => value.node.isDefault && value.node.__typename === 'SwatchOptionValue',
  )[0]?.node.entityId;

  const [activeSwatchId, setActiveSwatchId] = useState(defaultSwatchId);

  type getCurrentVariant = (variants: Variant[], variantId: number | null) => Variant | null;

  const getCurrentVariant: getCurrentVariant = (variants, variantId) => {
    const variant = variants.filter(
      (item) => item.node.options.edges[0]?.node.values.edges[0]?.node.entityId === variantId,
    );

    return variant.length ? variant[0] : null;
  };

  const showAltText = (variantId: number | null) => {
    return getCurrentVariant(product.node.variants.edges, variantId)?.node.defaultImage?.altText;
  };

  const showImage = (variantId: number | null) => {
    return getCurrentVariant(product.node.variants.edges, variantId)?.node.defaultImage?.url;
  };

  const showPrice = (variantId: number | null) => {
    return getCurrentVariant(product.node.variants.edges, variantId)?.node.prices.price.formatted;
  };

  const onSwatchClick = (variantId: number) => {
    setActiveSwatchId(variantId);
  };

  return (
    <li>
      <ProductTile className={ProductTile.default.className}>
        <ProductTile.Figure className={ProductTile.Figure.default.className}>
          <Link className="block relative" href={product.node.path}>
            <Image
              alt={
                showAltText(activeSwatchId) ||
                product.node.defaultImage?.altText ||
                product.node.name
              }
              className="mb-5 aspect-square w-full"
              height={320}
              priority={priority}
              src={showImage(activeSwatchId) || product.node.defaultImage?.url || '/'}
              width={320}
            />
          </Link>
          <ProductTile.FigCaption className={ProductTile.FigCaption.default.className}>
            <div>
              {productComparisonsEnabled && (
                <Button className={Button.secondary.className}>Compare products</Button>
              )}
            </div>
          </ProductTile.FigCaption>
        </ProductTile.Figure>
        <ProductTile.Body className={ProductTile.Body.default.className}>
          <div className="py-2">
            {product.node.productOptions.edges.map(({ node: options }) => {
              if (
                options.__typename === 'MultipleChoiceOption' &&
                options.displayStyle === 'Swatch'
              ) {
                return (
                  <SwatchGroup
                    className={SwatchGroup.default.className}
                    key={options.entityId}
                    role="radiogroup"
                  >
                    {options.values.edges.map(({ node: variant }) => (
                      <Swatch className={Swatch.default.className} key={variant.entityId}>
                        <Swatch.Label
                          className={Swatch.Label.default.className}
                          title={variant.label}
                        >
                          <Swatch.Variant
                            className={`${Swatch.Variant.default.className} ${
                              variant.imageUrl ? `bg-center bg-no-repeat` : ''
                            }`}
                            variantColor={variant.hexColors[0] ?? variant.imageUrl}
                          />
                        </Swatch.Label>
                        <Swatch.Input
                          aria-label={variant.label}
                          className={Swatch.Input.default.className}
                          name={`${variant.entityId}`}
                          onClick={() => onSwatchClick(variant.entityId)}
                          type="radio"
                          value={variant.entityId}
                        />
                      </Swatch>
                    ))}
                  </SwatchGroup>
                );
              }

              return false;
            })}
            <P className={`${P.default.className} text-[#546E7A]`}>{product.node.brand?.name}</P>
            <H3 className={`${H3.default.className}  hover:text-[#053FB0]`}>
              <Link href={product.node.path}>{product.node.name}</Link>
            </H3>
          </div>
          <div className="card-text relative py-1 flex items-center gap-2">
            <P className={P.default.className}>
              {showPrice(activeSwatchId) || product.node.prices.price?.formatted}
            </P>
          </div>
          <div className="absolute z-10 hidden flex-row justify-start pt-4 gap-x-4 group-hover/cardBody:inline-flex">
            {product.node.showCartAction && (
              <ReactantLink
                className={`${ReactantLink.text.className} ${Button.primary.className} hover:!text-white hover:!bg-[#3071EF]`}
                href={product.node.addToCartUrl}
              >
                Add to cart
              </ReactantLink>
            )}
            <Button className={`${Button.primary.className} ${Button.iconOnly.className}`}>
              <HeartIcon />
            </Button>
          </div>
        </ProductTile.Body>
      </ProductTile>
    </li>
  );
};
