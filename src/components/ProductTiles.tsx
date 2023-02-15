import Image from 'next/image';
import React from 'react';

import { Link } from '../../reactant/components/Link';

interface ProductTileProps {
  title: string;
  priority?: boolean;
  // TODO: See if we can make this more generic
  products: {
    edges: Array<{
      node: {
        entityId: number;
        name: string;
        brand: {
          name: string;
        } | null;
        defaultImage: {
          url: string;
          altText: string;
        } | null;
        prices: {
          price: {
            formatted: string;
          } | null;
        };
      };
    }>;
  };
}

export const ProductTiles = ({ title, priority = false, products }: ProductTileProps) => (
  <div className="my-12 mx-6 sm:mx-10 md:mx-auto">
    <h2 className="font-black text-4xl mb-10">{title}</h2>
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
      {products.edges.map((edge) => (
        <li key={`featured-${edge.node.entityId}`}>
          {edge.node.defaultImage && (
            <Image
              alt={edge.node.defaultImage.altText || 'Product image'}
              className="mb-5 aspect-square w-full"
              height={320}
              priority={priority}
              src={edge.node.defaultImage.url}
              width={320}
            />
          )}
          <p className="text-slate-500">{edge.node.brand?.name}</p>
          <h3 className="font-bold text-xl mb-3">
            <Link className={Link.text.className}>{edge.node.name}</Link>
          </h3>
          <p className="text-base">{edge.node.prices.price?.formatted}</p>
        </li>
      ))}
    </ul>
  </div>
);
