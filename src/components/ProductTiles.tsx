import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '../../reactant/components/Button';
import { Link as ReactantLink } from '../../reactant/components/Link';
import { H3, P, ProductTile } from '../../reactant/components/ProducTile';
import { HeartIcon } from '../../reactant/icons/Heart';

interface ProductTileProps {
  title: string;
  priority?: boolean;
  // TODO: See if we can make this more generic
  products: {
    edges: Array<{
      node: {
        addToCartUrl: string;
        showCartAction: boolean;
        entityId: number;
        name: string;
        brand: {
          name: string;
        } | null;
        defaultImage: {
          url: string;
          altText: string;
        } | null;
        path: string;
        prices: {
          price: {
            formatted: string;
          } | null;
        };
      };
    }>;
  };
  productComparisonsEnabled: boolean;
}

export const ProductTiles = ({
  title,
  priority = false,
  products,
  productComparisonsEnabled,
}: ProductTileProps) => {
  return (
    <div className="my-12 mx-6 sm:mx-10 md:mx-auto">
      <h2 className="font-black text-4xl mb-10">{title}</h2>
      <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {products.edges.map((edge) => (
          <li key={`featured-${edge.node.entityId}`}>
            <ProductTile className={ProductTile.default.className}>
              <ProductTile.Figure className={ProductTile.Figure.default.className}>
                <Link className="block relative" href={edge.node.path}>
                  <Image
                    alt={edge.node.defaultImage?.altText || 'Product image'}
                    className="mb-5 aspect-square w-full"
                    height={320}
                    priority={priority}
                    src={edge.node.defaultImage?.url || '/'}
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
                  <P className={`${P.default.className} text-[#546E7A]`}>{edge.node.brand?.name}</P>
                  <H3 className={`${H3.default.className}  hover:text-[#053FB0]`}>
                    <Link href={edge.node.path}>{edge.node.name}</Link>
                  </H3>
                </div>
                <div className="card-text relative py-1 flex items-center gap-2">
                  <P className={P.default.className}>{edge.node.prices.price?.formatted}</P>
                </div>
                <div className="absolute hidden flex-row justify-start pt-4 gap-x-4 group-hover/cardBody:inline-flex">
                  {edge.node.showCartAction && (
                    <ReactantLink
                      className={`${ReactantLink.text.className} ${Button.primary.className} hover:!text-white hover:!bg-[#3071EF]`}
                      href={edge.node.addToCartUrl}
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
        ))}
      </ul>
    </div>
  );
};
