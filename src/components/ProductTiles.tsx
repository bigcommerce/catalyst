import Image from 'next/image';
import React from 'react';
import { z } from 'zod';

// TODO: Create a source of truth for this type
// Alternatively, we could use a generic schema for this component
const ProductConnection = z.object({
  edges: z.array(
    z.object({
      node: z.object({
        entityId: z.number(),
        name: z.string(),
        brand: z
          .object({
            name: z.string(),
          })
          .nullable(),
        defaultImage: z.object({
          url: z.string(),
          altText: z.string(),
        }),
        prices: z.object({
          price: z
            .object({
              formatted: z.string(),
            })
            .nullable(),
        }),
      }),
    }),
  ),
});

const ProductTileProps = z.object({
  title: z.string(),
  priority: z.boolean().default(false).optional(),
  products: ProductConnection,
});

export const ProductTiles = (props: z.infer<typeof ProductTileProps>) => {
  const { title, priority, products } = ProductTileProps.parse(props);

  return (
    <div className="my-12 mx-6 sm:mx-10 md:mx-auto">
      <h2 className="font-black text-4xl mb-10">{title}</h2>
      <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {products.edges.map((edge) => (
          <li key={`featured-${edge.node.entityId}`}>
            <Image
              alt={edge.node.defaultImage.altText || 'Product image'}
              className="mb-5 aspect-square w-full"
              height={320}
              priority={priority}
              src={edge.node.defaultImage.url}
              width={320}
            />
            <p className="text-slate-500">{edge.node.brand?.name}</p>
            <h3 className="font-bold text-xl mb-3">{edge.node.name}</h3>
            <p className="text-base">{edge.node.prices.price?.formatted}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
